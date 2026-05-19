/**
 * Endpoint público que devuelve las variantes de Cap. I disponibles
 * para una universidad dada.
 *
 * Solo expone metadata (id, nombre, descripcion, estructura_visible, nota,
 * guia_oficial enriquecida con autor/fecha/características). El megaprompt
 * NUNCA sale por aquí.
 *
 * GET /api/cap1-variants?universidad_id=umss-001
 * GET /api/cap1-variants?universidad_id=unifranz-cba-001
 */

import { NextResponse } from "next/server";
import { getVariantsForUniversity, toPublicVariant } from "@/lib/cap1Variants";
import { GUIAS_UMSS_OFICIALES, type FormatoUMSS } from "@/lib/umssValidators";
import { GUIAS_UNIFRANZ_OFICIALES, type FormatoUNIFRANZ } from "@/lib/unifranzValidators";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const universidadId = searchParams.get("universidad_id");

  // Enriquecer cada variante con la información oficial de la guía.
  // Discriminamos UMSS vs UNIFRANZ por el campo presente en `guia_oficial`:
  //   - `formato_umss`     → lookup en GUIAS_UMSS_OFICIALES
  //   - `formato_unifranz` → lookup en GUIAS_UNIFRANZ_OFICIALES
  const variantes = getVariantsForUniversity(universidadId)
    .map(toPublicVariant)
    .map((v) => {
      const guia = v.guia_oficial;

      if ("formato_umss" in guia) {
        const formato = guia.formato_umss as FormatoUMSS;
        const detalle = GUIAS_UMSS_OFICIALES[formato];
        return {
          ...v,
          guia_oficial: {
            ...guia,
            autor: detalle?.autor ?? "",
            fecha: detalle?.fecha ?? "",
            caracteristicas: detalle?.caracteristicas ?? [],
            url_documento_pdf: detalle?.url_documento_pdf ?? null,
          },
        };
      }

      if ("formato_unifranz" in guia) {
        const formato = guia.formato_unifranz as FormatoUNIFRANZ;
        const detalle = GUIAS_UNIFRANZ_OFICIALES[formato];
        return {
          ...v,
          guia_oficial: {
            ...guia,
            autor: detalle?.autor ?? "",
            fecha: detalle?.fecha ?? "",
            caracteristicas: detalle?.caracteristicas ?? [],
            url_documento_pdf: detalle?.url_documento_pdf ?? null,
          },
        };
      }

      // Fallback: variante sin metadata enriquecible (no debería ocurrir).
      return v;
    });

  return NextResponse.json({ variantes });
}
