/**
 * Endpoint PÚBLICO de universidades.
 *
 * Devuelve solo los campos necesarios para que el estudiante elija universidad
 * en el wizard (id, name, modalities, is_active, logo_url). NO expone
 * latex_prompt, cover_template, ni campos sensibles de configuración.
 *
 * GET /api/universities → University[] (solo activas)
 *
 * NOTA: Antes el wizard público llamaba a `/api/admin/universities`, pero el
 * proxy en src/proxy.ts protege todo `/api/admin/*` con admin auth → devolvía
 * 401 a usuarios estudiantes y la pantalla quedaba sin opciones. Este endpoint
 * resuelve el bug exponiendo solo lo necesario y sin requerir admin.
 */

import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";
import { logoUrlFor, logoVariableFromFileName, universityLogoFolder } from "@/lib/logoAssets";

const ALLOWED_LOGO_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

async function logosForUniversity(universityName: string): Promise<Record<string, string>> {
  const dir = path.join(process.cwd(), "public", "logos", universityLogoFolder(universityName));
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return Object.fromEntries(
      entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((fileName) => ALLOWED_LOGO_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .map((fileName) => [logoVariableFromFileName(fileName), logoUrlFor(universityName, fileName)]),
    );
  } catch {
    return {};
  }
}

export async function GET() {
  const activas = DEFAULT_UNIVERSITIES.filter((u) => u.is_active);

  const universidadesPublicas = await Promise.all(
    activas.map(async (u) => {
      const detectedAssets = await logosForUniversity(u.name);
      const detectedUrls = Object.values(detectedAssets);
      const logo_url =
        detectedUrls.length > 0 && !detectedUrls.includes(u.logo_url ?? "")
          ? detectedUrls[0]
          : u.logo_url;

      return {
        id: u.id,
        name: u.name,
        modalities: u.modalities,
        is_active: u.is_active,
        logo_url,
      };
    }),
  );

  return NextResponse.json(universidadesPublicas);
}
