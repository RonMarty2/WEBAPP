/**
 * SISTEMA_PROY_LATEX — Fase 8: Compilar LaTeX.
 *
 * Compila TODO el contenido aprobado en un único archivo .tex listo
 * para Overleaf. Reutiliza la misma artillería técnica del prompt de
 * LaTeX de monografía (sin carátula, numeración romana, parche
 * @makechapterhead, sanitizador de figuras huérfanas en post-procesamiento).
 *
 * Max tokens recomendado: 50000.
 * Subtipo: común a producción y servicios.
 *
 * IMPLEMENTACIÓN: por ahora reutilizamos el prompt SISTEMA_SCRIBE_LATEX
 * de monografía ajustando las referencias al tipo de documento. Cuando
 * tengamos experiencia real con outputs del nuevo servicio, podemos
 * crear un prompt específico optimizado.
 */

import { SISTEMA_SCRIBE_LATEX } from "@/lib/prompts/scribe/compilar-latex";

/**
 * Reutiliza el prompt SISTEMA_SCRIBE_LATEX de monografía. La estructura
 * de fases es distinta (Cap. I al IV vs Cap. I al V) pero las reglas
 * técnicas de compilación son las mismas:
 *   - No carátula.
 *   - Numeración romana de capítulos.
 *   - Parche @makechapterhead para evitar franja blanca.
 *   - Sanitizador de figuras huérfanas (se aplica en paquete-latex).
 *   - Tamaño \large, no \Large.
 *   - Regla del 90% palabras anti-resumen.
 *
 * Cuando el contenido del proyecto de grado tenga estructura distinta
 * a monografía (Cap. IV con 8 sub-fases vs Cap. III + IV de monografía
 * con sub-fases distintas), la IA lo maneja con la regla "respeta la
 * jerarquía de títulos del Markdown recibido".
 */
export const SISTEMA_PROY_LATEX = SISTEMA_SCRIBE_LATEX;

export function buildContextoLatex(datos: {
  documentoCompleto: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Proyecto de Factibilidad — Producción y comercialización"
    : "Proyecto de Factibilidad — Servicios";

  return [
    "═══════════════════════════════════════════════════════════════",
    "[DATOS DE CARÁTULA]",
    "═══════════════════════════════════════════════════════════════",
    `- Tipo de documento: ${subtipoLegible}`,
    `- Título: ${datos.tituloAprobado}`,
    "- Universidad: UCATEC (Universidad Privada de Ciencias Administrativas y Tecnológicas)",
    "- Programa: Licenciatura en Ingeniería Comercial / Administración de Empresas",
    "- Modalidad: Proyecto de Grado",
    "",
    "═══════════════════════════════════════════════════════════════",
    "[DECISIONES TIPOGRÁFICAS Y DE COMPILACIÓN]",
    "═══════════════════════════════════════════════════════════════",
    "- Motor LaTeX: pdfLaTeX",
    "- Tamaño de papel: Letter",
    "- Márgenes: 2.54 cm en los 4 lados",
    "- Tipografía: Times New Roman 12 pt",
    "- Interlineado: doble",
    "- Numeración de capítulos: ROMANA (I, II, III, IV)",
    "- Numeración de páginas: ARÁBIGA en esquina superior derecha",
    "- Sin carátula automática",
    "- Estilo de citas: APA 7",
    "- Idioma: Español (Bolivia)",
    "",
    "═══════════════════════════════════════════════════════════════",
    "[DOCUMENTO COMPLETO APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.documentoCompleto.trim(),
    "",
  ].join("\n");
}
