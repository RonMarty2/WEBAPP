/**
 * Endpoint público que devuelve las variantes de Cap. I disponibles
 * para una universidad dada.
 *
 * Solo expone metadata (id, nombre, descripcion, estructura_visible, nota,
 * guia_oficial enriquecida con autor/fecha/características). El megaprompt
 * NUNCA sale por aquí.
 *
 * GET /api/cap1-variants?universidad_id=umss-001
 * GET /api/cap1-variants?universidad_id=ucb-001
 */

import { NextResponse } from "next/server";
import { getVariantsForUniversity, toPublicVariant, isGuiaUmss } from "@/lib/cap1Variants";
import { GUIAS_UMSS_OFICIALES, type FormatoUMSS } from "@/lib/umssValidators";
import { GUIAS_UCB_OFICIALES, type FormatoUCB } from "@/lib/ucbValidators";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const universidadId = searchParams.get("universidad_id");

  // Enriquecer cada variante con la información oficial de la guía a la
  // que pertenece (UMSS o UCB). El consumidor (wizard UI) recibe el mismo
  // shape para ambas, pero la metadata específica viene del validator
  // correspondiente.
  const variantes = getVariantsForUniversity(universidadId)
    .map(toPublicVariant)
    .map((v) => {
      if (isGuiaUmss(v.guia_oficial)) {
        const formato = v.guia_oficial.formato_umss as FormatoUMSS;
        const detalle = GUIAS_UMSS_OFICIALES[formato];
        return {
          ...v,
          guia_oficial: {
            ...v.guia_oficial,
            autor: detalle?.autor ?? "",
            fecha: detalle?.fecha ?? "",
            caracteristicas: detalle?.caracteristicas ?? [],
            url_documento_pdf: detalle?.url_documento_pdf ?? null,
          },
        };
      }
      // Rama UCB (u otra universidad no-UMSS)
      const formato = v.guia_oficial.formato_universidad as FormatoUCB;
      const detalle = GUIAS_UCB_OFICIALES[formato];
      return {
        ...v,
        guia_oficial: {
          ...v.guia_oficial,
          autor: detalle?.autor ?? "",
          fecha: detalle?.fecha ?? "",
          caracteristicas: detalle?.caracteristicas ?? [],
          url_documento_pdf: detalle?.url_documento_pdf ?? null,
        },
      };
    });

  return NextResponse.json({ variantes });
}
