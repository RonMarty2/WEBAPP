/**
 * Endpoint público que devuelve las variantes de Cap. I disponibles
 * para una universidad dada.
 *
 * Solo expone metadata (id, nombre, descripcion, estructura_visible, nota,
 * guia_oficial enriquecida con autor/fecha/características). El megaprompt
 * NUNCA sale por aquí.
 *
 * GET /api/cap1-variants?universidad_id=umss-001
 */

import { NextResponse } from "next/server";
import { getVariantsForUniversity, toPublicVariant } from "@/lib/cap1Variants";
import { GUIAS_UMSS_OFICIALES, type FormatoUMSS } from "@/lib/umssValidators";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const universidadId = searchParams.get("universidad_id");

  // Enriquecer cada variante con la información oficial de la guía UMSS
  // (autor, fecha, características) para que la UI pueda mostrarla.
  const variantes = getVariantsForUniversity(universidadId)
    .map(toPublicVariant)
    .map((v) => {
      const formato = v.guia_oficial.formato_umss as FormatoUMSS;
      const guiaOficialDetalle = GUIAS_UMSS_OFICIALES[formato];
      return {
        ...v,
        guia_oficial: {
          ...v.guia_oficial,
          autor: guiaOficialDetalle?.autor ?? "",
          fecha: guiaOficialDetalle?.fecha ?? "",
          caracteristicas: guiaOficialDetalle?.caracteristicas ?? [],
          url_documento_pdf: guiaOficialDetalle?.url_documento_pdf ?? null,
        },
      };
    });

  return NextResponse.json({ variantes });
}
