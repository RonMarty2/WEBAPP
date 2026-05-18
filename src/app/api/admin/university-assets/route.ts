import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  logoUrlFor,
  logoVariableFromFileName,
  slugifyAssetPart,
  universityLogoFolder,
  type UniversityLogoAsset,
} from "@/lib/logoAssets";
import { requireAdmin, AuthError } from "@/lib/api-auth";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function publicLogoDir(universityName: string): string {
  return path.join(process.cwd(), "public", "logos", universityLogoFolder(universityName));
}

function assetFromFile(universityName: string, fileName: string): UniversityLogoAsset {
  return {
    fileName,
    variable: logoVariableFromFileName(fileName),
    url: logoUrlFor(universityName, fileName),
  };
}

async function listAssets(universityName: string): Promise<UniversityLogoAsset[]> {
  const dir = publicLogoDir(universityName);
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isFile())
      .map(entry => entry.name)
      .filter(fileName => ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map(fileName => assetFromFile(universityName, fileName));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const universityName = searchParams.get("universityName")?.trim();
    if (!universityName) {
      return NextResponse.json({ error: "Nombre de universidad requerido." }, { status: 400 });
    }

    const assets = await listAssets(universityName);
    return NextResponse.json({
      folder: `/logos/${universityLogoFolder(universityName)}`,
      assets,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const universityName = String(form.get("universityName") ?? "").trim();
    const files = form.getAll("files").filter((item): item is File => item instanceof File);

    if (!universityName) {
      return NextResponse.json({ error: "Nombre de universidad requerido." }, { status: 400 });
    }
    if (!files.length) {
      return NextResponse.json({ error: "Selecciona al menos un archivo." }, { status: 400 });
    }

    const dir = publicLogoDir(universityName);
    await mkdir(dir, { recursive: true });

    let primaryAsset: UniversityLogoAsset | null = null;

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json({ error: `Formato no permitido: ${file.name}` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `El archivo supera 2 MB: ${file.name}` }, { status: 413 });
      }

      const baseName = slugifyAssetPart(file.name.replace(/\.[^.]+$/, ""));
      const fileName = `${baseName}${ext}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, fileName), bytes);
      primaryAsset ??= assetFromFile(universityName, fileName);
    }

    const assets = await listAssets(universityName);
    return NextResponse.json({
      folder: `/logos/${universityLogoFolder(universityName)}`,
      assets,
      primaryAsset,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
