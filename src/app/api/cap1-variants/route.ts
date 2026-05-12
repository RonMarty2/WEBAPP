/**
 * Endpoint público que devuelve las variantes de Cap. I disponibles
 * para una universidad dada.
 *
 * Solo expone metadata (id, nombre, descripcion, estructura_visible, nota).
 * El megaprompt NUNCA sale por aquí.
 *
 * GET /api/cap1-variants?universidad_id=umss-001
 */

import { NextResponse } from "next/server";
import { getVariantsForUniversity, toPublicVariant } from "@/lib/cap1Variants";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const universidadId = searchParams.get("universidad_id");
  const variantes = getVariantsForUniversity(universidadId).map(toPublicVariant);
  return NextResponse.json({ variantes });
}
