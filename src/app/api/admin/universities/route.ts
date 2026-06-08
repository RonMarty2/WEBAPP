import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_UNIVERSITIES, University } from "@/lib/data";
import { logoUrlFor, logoVariableFromFileName, universityLogoFolder } from "@/lib/logoAssets";
import { requireAdmin, AuthError } from "@/lib/api-auth";

// Helper para gate de mutaciones (POST/PUT/DELETE). GET es público por
// diseño (lista de universidades es info no sensible que la landing usa).
async function gateAdmin(): Promise<Response | null> {
  try {
    await requireAdmin();
    return null;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

// In production, stored in Supabase
let universitiesStore: University[] = [...DEFAULT_UNIVERSITIES];

const ALLOWED_LOGO_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

async function logosForUniversity(universityName: string): Promise<Record<string, string>> {
  const dir = path.join(process.cwd(), "public", "logos", universityLogoFolder(universityName));
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return Object.fromEntries(
      entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
        .filter(fileName => ALLOWED_LOGO_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .map(fileName => [logoVariableFromFileName(fileName), logoUrlFor(universityName, fileName)])
    );
  } catch {
    return {};
  }
}

async function withDetectedLogos(university: University): Promise<University> {
  const detectedAssets = await logosForUniversity(university.name);
  const logo_assets = { ...(university.logo_assets ?? {}), ...detectedAssets };
  const detectedUrls = Object.values(detectedAssets);
  const logo_url = detectedUrls.length > 0 && !detectedUrls.includes(university.logo_url ?? "")
    ? detectedUrls[0]
    : university.logo_url;

  return { ...university, logo_assets, logo_url };
}

export async function GET() {
  const universities = await Promise.all(universitiesStore.map(withDetectedLogos));
  universitiesStore = universities;
  return NextResponse.json(universities);
}

export async function POST(req: Request) {
  const gate = await gateAdmin();
  if (gate) return gate;
  try {
    const body = await req.json();
    const newUniversity: University = {
      id: `univ-${Date.now()}`,
      name: body.name,
      logo_url: body.logo_url || "",
      logo_assets: body.logo_assets || {},
      campos_portada: body.campos_portada || [],
      cover_template: body.cover_template || "",
      latex_prompt: body.latex_prompt || "",
      format: body.format || {
        pageSize: "letter",
        font: "Times New Roman",
        size: 12,
        lineHeight: 1.5,
        margins: { top: 3, left: 3, bottom: 2.5, right: 2.5 },
        alineacion: "justify",
        numero_paginas_posicion: "top-right",
      },
      modalities: body.modalities || ["Tesis de Grado", "Monografía"],
      is_active: true,
    };

    universitiesStore.push(newUniversity);
    return NextResponse.json({ success: true, university: newUniversity }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear la universidad." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const gate = await gateAdmin();
  if (gate) return gate;
  try {
    const body = await req.json();
    const index = universitiesStore.findIndex((u) => u.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "Universidad no encontrada." }, { status: 404 });
    }

    universitiesStore[index] = { ...universitiesStore[index], ...body };
    return NextResponse.json({ success: true, university: universitiesStore[index] });
  } catch {
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const gate = await gateAdmin();
  if (gate) return gate;
  try {
    const { id } = await req.json();
    universitiesStore = universitiesStore.filter((u) => u.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar." }, { status: 500 });
  }
}
