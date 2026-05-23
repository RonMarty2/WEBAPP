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

export interface UniversidadLatexFormato {
  /** Nombre completo (ej: "Universidad Privada de Ciencias Administrativas y Tecnológicas (UCATEC)"). */
  nombre: string;
  /** Tamaño de papel (default "Letter"). */
  pageSize?: string;
  /** Tipografía base (ej: "Times New Roman"). */
  font?: string;
  /** Tamaño en pt. */
  fontSize?: number;
  /** Interlineado (1.0, 1.5, 2.0...). Acepta string "doble" o número. */
  lineHeight?: number | string;
  /** Márgenes en cm. */
  margins?: { top: number; left: number; bottom: number; right: number };
  /** Posición de los números de página. */
  numeroPaginasPosicion?: string;
  /** Estilo de citas (default "APA 7"). */
  estiloCitas?: string;
  /** latex_prompt completo de la universidad — se prepende como guía. */
  latexPrompt?: string;
}

export function buildContextoLatex(datos: {
  documentoCompleto: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
  programa?: string;
  modalidad?: string;
  universidad: UniversidadLatexFormato;
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Proyecto de Factibilidad — Producción y comercialización"
    : "Proyecto de Factibilidad — Servicios";

  const u = datos.universidad;
  const margins = u.margins;
  const marginsLegible = margins
    ? `superior ${margins.top}cm · inferior ${margins.bottom}cm · izquierdo ${margins.left}cm · derecho ${margins.right}cm`
    : "estándar (2.5 cm uniforme)";
  const lineHeightLegible = typeof u.lineHeight === "number"
    ? (u.lineHeight === 2.0 ? "doble" : u.lineHeight.toString())
    : (u.lineHeight ?? "1.5");

  const lines = [
    "═══════════════════════════════════════════════════════════════",
    "[DATOS DE CARÁTULA]",
    "═══════════════════════════════════════════════════════════════",
    `- Tipo de documento: ${subtipoLegible}`,
    `- Título: ${datos.tituloAprobado}`,
    `- Universidad: ${u.nombre}`,
    datos.programa ? `- Programa: ${datos.programa}` : "",
    `- Modalidad: ${datos.modalidad ?? "Proyecto de Grado"}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[DECISIONES TIPOGRÁFICAS Y DE COMPILACIÓN]",
    "═══════════════════════════════════════════════════════════════",
    "- Motor LaTeX: pdfLaTeX",
    `- Tamaño de papel: ${u.pageSize ?? "Letter"}`,
    `- Márgenes: ${marginsLegible}`,
    `- Tipografía: ${u.font ?? "Times New Roman"} ${u.fontSize ?? 12} pt`,
    `- Interlineado: ${lineHeightLegible}`,
    "- Numeración de capítulos: ROMANA (I, II, III, IV)",
    `- Numeración de páginas: ARÁBIGA en ${u.numeroPaginasPosicion ?? "esquina inferior derecha"}`,
    "- Sin carátula automática",
    `- Estilo de citas: ${u.estiloCitas ?? "APA 7"}`,
    "- Idioma: Español (Bolivia)",
    u.latexPrompt ? "" : "",
    u.latexPrompt ? "[GUÍA OFICIAL DE LA UNIVERSIDAD]" : "",
    u.latexPrompt ? u.latexPrompt : "",
    "",
    "═══════════════════════════════════════════════════════════════",
    "[DOCUMENTO COMPLETO APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.documentoCompleto.trim(),
    "",
  ];

  return lines.filter((l) => l !== "" || true).join("\n");
}
