"use client";

/**
 * <Diagrama> — render en pantalla de un diagrama académico.
 *
 * Inyecta el MISMO SVG que se embebe en la descarga Word, así lo que el
 * estudiante ve es exactamente lo que recibe. El SVG se genera con texto
 * XML-escapado en `diagramaASvg`, por lo que el dangerouslySetInnerHTML es
 * seguro (no hay HTML arbitrario del usuario, solo nuestra figura).
 *
 * Si el dato no es interpretable devuelve `null` para que el llamador caiga
 * a su placeholder de siempre. Nunca rompe el documento.
 */

import { parseDiagrama } from "@/lib/diagramas/parse";
import { diagramaASvg } from "@/lib/diagramas/svg";
import type { DiagramaSpec } from "@/lib/diagramas/tipos";

interface DiagramaProps {
  /** Spec ya parseado, o… */
  spec?: DiagramaSpec;
  /** …el contenido crudo del bloque ```diagrama para parsear aquí. */
  raw?: string;
}

export function Diagrama({ spec, raw }: DiagramaProps) {
  const resuelto = spec ?? (typeof raw === "string" ? parseDiagrama(raw) : null);
  if (!resuelto) return null;
  const svg = diagramaASvg(resuelto);
  if (!svg) return null;
  return (
    <figure style={{ margin: "18px 0" }}>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </figure>
  );
}

export default Diagrama;
