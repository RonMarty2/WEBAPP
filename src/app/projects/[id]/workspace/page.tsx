"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import AdminPlanSwitcher from "@/components/AdminPlanSwitcher";
import DiffPreview from "@/components/DiffPreview";
import BibliografiaInsights from "@/components/scribe/BibliografiaInsights";
import ResumenInsights from "@/components/scribe/ResumenInsights";
import CalidadInsights from "@/components/scribe/CalidadInsights";
import CapituloInsights from "@/components/scribe/CapituloInsights";
import type { SessionUser } from "@/lib/auth";
import { DEFAULT_UNIVERSITIES, type University } from "@/lib/data";
import { isPhaseTecnica } from "@/lib/phaseCategories";
import { estimarPaginas as estimarPaginasUMSS, type FormatoUMSS } from "@/lib/umssValidators";
import { MESES, type StudentCoverData, generatePdfHtml } from "@/lib/pdfTemplate";
import GlassModal from "@/components/ui/GlassModal";
import ObservacionesTribunal from "@/components/ObservacionesTribunal";
import Cap0PropuestasView from "@/components/scribe/Cap0PropuestasView";
import LatexExportView from "@/components/scribe/LatexExportView";
import BancoPreguntasView from "@/components/scribe/BancoPreguntasView";
import DefensaMaterialesView from "@/components/scribe/DefensaMaterialesView";
import SpecialPhaseView from "@/components/scribe/SpecialPhaseView";
import AdminViewToggle, { useViewMode } from "@/components/scribe/AdminViewToggle";
import GeneratingState from "@/components/scribe/GeneratingState";
import AudioFeedback from "@/components/scribe/AudioFeedback";
import PGPhaseSidebar from "@/components/scribe/PGPhaseSidebar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Proyecto {
  id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  servicio_id: string;
  tipo_proyecto_id?: string;
  universidad_id?: string;
  modalidad_creacion?: "directa" | "guiada";
  perfil_estilo_usuario?: string | null;
  requiere_actualizacion?: Record<string, boolean>;
  contenido_fase_0: string | null;
  contenido_fase_1: string | null;
  contenido_fase_2: string | null;
  contenido_fase_3: string | null;
  contenido_fase_4: string | null;
  contenido_fase_5: string | null;
  phase_contents?: Record<string, string | null>;
  academic_context?: Record<string, unknown>;
  academic_memory?: Record<string, unknown> & { ai_trace?: AITraceEntry[] };
  active_ai_config?: AIStatus;
  final_document?: string | null;
  final_document_validation?: { ok?: boolean; errors?: string[]; warnings?: string[]; wordCount?: number };
  servicios: { id: string; nombre: string } | null;
}

interface AIStatus {
  configured: boolean;
  provider_id: string;
  provider_name: string;
  model: string;
}

interface AITraceEntry {
  timestamp?: string;
  scope?: string;
  phase_id?: string | null;
  phase_label?: string | null;
  action?: string;
  provider_id?: string;
  provider_name?: string;
  model?: string;
  status?: "success" | "error" | "fallback";
  duration_ms?: number | null;
  error?: string | null;
}

interface ChatMsg { role: "user" | "assistant"; text: string; ts?: number; }
interface PhaseDef { id: string; label: string; short: string; orden: number; }
interface CalibracionPregunta {
  id: string; pregunta: string; descripcion?: string;
  placeholder?: string; minimo_palabras: number;
}

interface WorkspaceCache {
  user: SessionUser | null;
  proyecto: Proyecto | null;
  university: University | null;
  pdfData?: StudentCoverData;
  selectedFase: number;
  isDynamic: boolean;
  phaseDefs: PhaseDef[];
}

// ── Static phase definitions ──────────────────────────────────────────────────

const FASES_STATIC = [
  { id: "0", num: 0, label: "Planteamiento del Tema",         short: "Fase 0" },
  { id: "1", num: 1, label: "Capítulo I — Marco Referencial", short: "Cap. I" },
  { id: "2", num: 2, label: "Capítulo II — Marco Teórico",    short: "Cap. II" },
  { id: "3", num: 3, label: "Capítulos III al V — Desarrollo",short: "Caps. III-V" },
  { id: "4", num: 4, label: "Revisión y Compilación",         short: "Revisión" },
  { id: "5", num: 5, label: "Conclusiones y Bibliografía",    short: "Final" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLegacyContent(p: Proyecto, num: number): string | null {
  const map: Record<number, keyof Proyecto> = {
    0:"contenido_fase_0",1:"contenido_fase_1",2:"contenido_fase_2",
    3:"contenido_fase_3",4:"contenido_fase_4",5:"contenido_fase_5",
  };
  return p[map[num]] as string | null;
}

function getFinalContent(p: Proyecto, phaseId: string, legacyNum?: number): string | null {
  if (p.phase_contents && phaseId in p.phase_contents) return p.phase_contents[phaseId];
  if (legacyNum !== undefined) return getLegacyContent(p, legacyNum);
  return null;
}

function getBorrador(p: Proyecto, phaseId: string, legacyNum?: number): string | null {
  const k = `${phaseId}_borrador`;
  if (p.phase_contents && k in p.phase_contents) return p.phase_contents[k];
  if (legacyNum !== undefined) return getLegacyContent(p, legacyNum);
  return null;
}

/**
 * Devuelve el mejor contenido disponible para una fase: el FINAL si está aprobado,
 * o el BORRADOR si solo eso existe. Sirve para mostrar progreso real en el preview.
 */
function getFinalOBorrador(
  p: Proyecto,
  phaseId: string,
  legacyNum?: number,
): { content: string | null; esBorrador: boolean } {
  const final = getFinalContent(p, phaseId, legacyNum);
  if (final?.trim()) return { content: final, esBorrador: false };
  const borrador = getBorrador(p, phaseId, legacyNum);
  if (borrador?.trim()) return { content: borrador, esBorrador: true };
  return { content: null, esBorrador: false };
}

function countWords(t: string) { return t.trim().split(/\s+/).filter(Boolean).length; }

/**
 * Heurística CONSERVADORA para detectar si una generación quedó cortada.
 * Reglas (deben TODAS cumplirse para marcar como cortado):
 *   - Texto >2000 chars (sino asumimos intencional o caso especial)
 *   - Los últimos 120 chars NO contienen NINGÚN signo de cierre fuerte (.!?…)}])
 *   - La última línea NO es estructura (tabla, lista numerada/bullets, encabezado, code fence)
 *
 * El check anterior miraba SOLO el último char, dando falsos positivos cuando el
 * modelo terminaba con punto pero seguía un whitespace/caracter invisible.
 */
function pareceCortadoConservador(content: string | null | undefined): boolean {
  if (!content) return false;
  const trimmed = content.trim();
  if (trimmed.length < 2000) return false;
  // Si los últimos ~120 chars tienen algún punto/signo de cierre, asumimos terminó natural.
  const tail = trimmed.slice(-120);
  if (/[.!?…)}\]]/u.test(tail)) return false;
  // Última línea es estructura válida → no cortado
  const ultimaLinea = trimmed.split("\n").slice(-1)[0]?.trim() ?? "";
  if (/^\|.*\|$/.test(ultimaLinea)) return false;
  if (ultimaLinea === "```") return false;
  if (/^[-*]\s/.test(ultimaLinea)) return false;
  if (/^\d+\.\s/.test(ultimaLinea)) return false;
  if (/^#{1,6}\s/.test(ultimaLinea)) return false;
  return true;
}

// ── Estimador realista de páginas físicas del documento ─────────────────────
// Usa la misma función oficial de `umssValidators.ts` que limpia comandos
// LaTeX y markdown antes de contar palabras, y aplica la constante correcta
// según el formato UMSS del proyecto:
//   - guia_1_posgrado (doble espacio): 250 palabras/pág
//   - guia_2_cespedes (1.5 espacio):  400 palabras/pág
// Antes usábamos PALABRAS_POR_PAGINA = 350 + 0.5 pág por tabla, lo que daba
// estimaciones ~2-3× la realidad (80 págs vs 31 reales en PDF compilado).
const PAGS_FIJAS_CARATULA = 1;
const PAGS_FIJAS_INDICE = 2; // indice + posible portada de capitulos / resumen
const PAGS_FIJAS_BIBLIO_DEFAULT = 5; // estimacion si la fase de referencias todavia no se genero

/** Cuenta bloques de tabla markdown (cada bloque = una tabla) en un contenido. */
function contarTablas(texto: string | null | undefined): number {
  if (!texto) return 0;
  let tablas = 0;
  let dentroTabla = false;
  for (const linea of texto.split("\n")) {
    const esLineaTabla = linea.trim().startsWith("|");
    if (esLineaTabla && !dentroTabla) { tablas++; dentroTabla = true; }
    else if (!esLineaTabla) { dentroTabla = false; }
  }
  return tablas;
}

/**
 * Páginas estimadas que ocupa una fase, según el formato UMSS del proyecto.
 * Usa estimarPaginasUMSS que es coherente con el cálculo del backend y
 * del validador (`umssValidators.ts`).
 *
 * Notas:
 *  - Sin formato definido → asumimos `guia_1_posgrado` (doble espacio, el
 *    más estricto y más común en posgrado UMSS).
 *  - Ya NO sumamos 0.5 pág por tabla — la fórmula real de UMSS ya
 *    contempla densidad típica con tablas.
 */
function paginasDeFase(
  content: string | null | undefined,
  formato: FormatoUMSS = "guia_1_posgrado",
): number {
  if (!content?.trim()) return 0;
  return estimarPaginasUMSS(content, formato);
}

/**
 * Evalúa el estado de un contenido generado:
 *   - palabras: total de palabras
 *   - completo: true si parece terminar bien (cierra con punto/signo/cierre limpio).
 *               Solo marca como incompleto si el texto es largo (>800 chars) y NO
 *               cierra con un símbolo natural — caso raro tras el auto-continue.
 */
function getGenStatus(content: string | null | undefined): { palabras: number; completo: boolean } {
  if (!content?.trim()) return { palabras: 0, completo: true };
  const trimmed = content.trim();
  const palabras = countWords(trimmed);
  if (trimmed.length < 800) return { palabras, completo: true };
  const cierresOk = /[.!?…)}\]:;"'»”’*—]\s*$/u;
  const ultimaLinea = trimmed.split("\n").slice(-1)[0]?.trim() ?? "";
  const cierraTabla = /^\|.*\|$/.test(ultimaLinea);
  const cierraCodeFence = ultimaLinea === "```";
  const completo = cierresOk.test(trimmed) || cierraTabla || cierraCodeFence;
  return { palabras, completo };
}

function escapeHtml(value: string) {
  return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function isInspectorUser(user: SessionUser | null) {
  return user?.role === "admin" || user?.id?.startsWith("demo-") || user?.email?.endsWith("@laboratorio.test");
}

function formatTraceTime(value?: string) {
  if (!value) return "sin fecha";
  try {
    return new Date(value).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "sin fecha";
  }
}

/**
 * renderMd — Renderizador markdown académico.
 *
 * Soporta: headers (# - ####), tablas markdown (con bordes booktabs),
 * listas (con bullets - * y numeradas 1.), citas (>), bold/italic,
 * código inline (`code`), bloques de código fenced (```...```),
 * y el patrón **Tabla X.X** / **Figura X.X** / **Ecuación X.X** centrado.
 *
 * Esconde el bloque JSON técnico final (que usa Cap 0 internamente)
 * para que no aparezca crudo en otros capítulos.
 */
/**
 * Une líneas de tabla multilínea: si una línea empieza con "|" y la siguiente
 * no empieza con "|" y no es blank, la siguiente es continuación de la celda.
 * Las uno con espacio para que el parser de tablas vea filas válidas en una sola línea.
 */

/**
 * Renderiza un bloque [[ARBOL_PROBLEMAS]] como diagrama HTML con cajas y líneas.
 * Estructura visual (3 niveles, top→bottom):
 *   - Consecuencias arriba (3 cajas en fila)
 *   - Problema central (1 caja gruesa centrada)
 *   - Causas abajo (3 cajas en fila)
 * Las líneas conectoras se dibujan con CSS pseudo-elements.
 */
function renderArbolProblemas(contenido: string): string {
  // Parsear el formato YAML-like del marcador
  let central = "";
  const consecuencias: string[] = [];
  const causas: string[] = [];
  let modo: "central" | "consecuencias" | "causas" | null = null;
  for (const raw of contenido.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (/^central\s*:/i.test(line)) {
      central = line.replace(/^central\s*:\s*/i, "").trim();
      modo = "central";
    } else if (/^consecuencias\s*:/i.test(line)) {
      modo = "consecuencias";
    } else if (/^causas\s*:/i.test(line)) {
      modo = "causas";
    } else if (/^[-*]\s+/.test(line)) {
      const item = line.replace(/^[-*]\s+/, "").trim();
      if (modo === "consecuencias") consecuencias.push(item);
      else if (modo === "causas") causas.push(item);
    }
  }

  if (!central && consecuencias.length === 0 && causas.length === 0) {
    return `<div class="arbol-error" style="padding:12px;border:1px dashed #f59e0b;color:#f59e0b;font-size:12px;border-radius:8px;">Marcador [[ARBOL_PROBLEMAS]] vacío o mal formado</div>`;
  }

  const cajaStyle = `border:1.5px solid #475569;background:#f8fafc;padding:10px 12px;border-radius:6px;font-size:11.5px;line-height:1.4;text-align:center;min-height:54px;display:flex;align-items:center;justify-content:center;`;
  const cajaCentral = `border:2.5px solid #1e293b;background:#fff;padding:14px 16px;border-radius:8px;font-size:13px;font-weight:700;line-height:1.4;text-align:center;color:#0f172a;`;
  const lineaConectora = `<div style="width:1.5px;background:#475569;height:24px;margin:0 auto;"></div>`;
  const cellHtml = (text: string) => `<div style="${cajaStyle}">${escapeHtml(text)}</div>`;

  return `
<figure class="arbol-problemas" style="margin:24px auto;padding:18px;border:1px solid #e2e8f0;border-radius:10px;background:#ffffff;max-width:780px;">
  <figcaption style="font-size:11.5px;font-weight:700;text-align:center;margin-bottom:14px;color:#1e293b;">Figura: Árbol de problemas</figcaption>
  ${consecuencias.length > 0 ? `
  <div style="display:grid;grid-template-columns:repeat(${consecuencias.length},1fr);gap:12px;">
    ${consecuencias.map(cellHtml).join("")}
  </div>
  ${lineaConectora}` : ""}
  <div style="${cajaCentral}max-width:60%;margin:0 auto;">${escapeHtml(central || "(problema central)")}</div>
  ${causas.length > 0 ? `${lineaConectora}
  <div style="display:grid;grid-template-columns:repeat(${causas.length},1fr);gap:12px;">
    ${causas.map(cellHtml).join("")}
  </div>` : ""}
  <div style="font-size:10.5px;color:#64748b;text-align:center;margin-top:12px;font-style:italic;">Nota. Elaboración propia.</div>
</figure>`;
}

function normalizarTablasMultilineaMd(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (/^\s*\|/.test(line)) {
      let buffer = line;
      while (i + 1 < lines.length) {
        const next = lines[i + 1] ?? "";
        if (next.trim() === "" || /^\s*\|/.test(next)) break;
        buffer = buffer.trimEnd() + " " + next.trim();
        i++;
      }
      // Garantizar "|" al final (la IA suele omitirlo en las filas).
      const trimmed = buffer.trimEnd();
      if (!/\|\s*$/.test(trimmed)) {
        buffer = trimmed + " |";
      }
      out.push(buffer);
      i++;
    } else {
      out.push(line);
      i++;
    }
  }
  return out.join("\n");
}

function renderMd(text: string): string {
  // 1) Limpieza inicial: quitar marcadores [[DATO_EDITABLE]] y [COMPLETAR...]
  let cleaned = text
    .replace(/\[\[DATO_EDITABLE:[\s\S]*?\]\]([\s\S]*?)\[\[\/DATO_EDITABLE\]\]/g, "$1")
    .replace(/\s*\[COMPLETAR[^\]]*\]\s*/gi, " ")
    // Esconder bloques JSON técnicos del final (Cap 0 los procesa con su componente especial)
    .replace(/```json\s*\{[\s\S]*?\}\s*```/g, "")
    // Esconder REFERENCIAS_ETAPA si aparece (se consolida aparte en la fase de referencias)
    .replace(/###\s*REFERENCIAS_ETAPA[\s\S]*$/i, "")
    // Quitar separadores horizontales sueltos (---, ***, ___, ──, ══, ━━) — los headings ya separan.
    // Incluye Unicode de dibujo de cajas que algunos modelos LLM usan.
    .replace(/^[ \t]*[-*_─━═]{3,}[ \t]*$/gmu, "");

  // Normalizar tablas multilínea (filas con saltos de línea dentro de celdas)
  cleaned = normalizarTablasMultilineaMd(cleaned);

  // 1.5) Detectar y renderizar [[ARBOL_PROBLEMAS]] como diagrama HTML.
  // En LaTeX se convierte a TikZ; aquí en preview lo dibujamos con CSS Grid + cajas.
  const arboles: string[] = [];
  cleaned = cleaned.replace(
    /\[\[ARBOL_PROBLEMAS\]\]([\s\S]*?)\[\[\/ARBOL_PROBLEMAS\]\]/gi,
    (_match, contenido) => {
      const idx = arboles.length;
      arboles.push(renderArbolProblemas(contenido));
      return `\n ARBOL_${idx} \n`;
    }
  );

  // 2) Extraer y "marcar" bloques de código fenced para preservarlos
  const codeBlocks: string[] = [];
  cleaned = cleaned.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(
      `<pre class="md-pre"><code class="md-code">${escapeHtml(code)}</code></pre>`
    );
    return ` CODE_BLOCK_${idx} `;
  });

  // 3) Extraer tablas markdown y convertirlas a HTML antes de escapar
  const tables: string[] = [];
  cleaned = cleaned.replace(
    /(?:^\|[^\n]+\|\s*\n(?:\|[\s|:.-]+\|\s*\n)?(?:\|[^\n]+\|\s*\n?)+)/gm,
    (match) => {
      const idx = tables.length;
      tables.push(renderMdTable(match));
      return `\n TABLE_${idx} \n`;
    }
  );

  // 4) Escapar HTML peligroso en el resto
  let html = escapeHtml(cleaned);

  // 5) Headers
  html = html
    .replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^### (.+)$/gm,  '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm,   '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1 class="md-h1">$1</h1>');

  // 6) Tabla X.X / Figura X.X / Cuadro X.X / Ecuación X.X (caption académico)
  html = html.replace(
    /^\*\*(Tabla|Figura|Cuadro|Ecuaci[oó]n)\s+([\d.]+)\*\*\s*\n\*([^\n*]+)\*/gm,
    '<div class="md-caption"><span class="md-caption-num">$1 $2</span><span class="md-caption-title">$3</span></div>'
  );

  // 7) **Nota.** ... → bloque de fuente bajo tablas/figuras
  html = html.replace(
    /^\*\*Nota\.\*\*\s+(.+)$/gm,
    '<div class="md-note"><strong>Nota.</strong> $1</div>'
  );

  // 8) Citas en bloque (>)
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

  // 9) Bold y italic (orden importa: bold antes que italic)
  html = html
    .replace(/\*\*([^*\n]+?)\*\*/g, '<strong class="md-strong">$1</strong>')
    .replace(/(?<![*\w])\*([^*\n]+?)\*(?!\w)/g, '<em class="md-em">$1</em>')
    .replace(/`([^`\n]+?)`/g, '<code class="md-inline-code">$1</code>');

  // 10) Listas numeradas (1. 2. 3. ...)
  html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="md-li md-li-num">$2</li>');
  html = html.replace(
    /((?:<li class="md-li md-li-num">[^<]*<\/li>\n?)+)/g,
    '<ol class="md-ol">$1</ol>'
  );

  // 11) Listas con bullets (- *)
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(
    /((?:<li class="md-li">[^<]*<\/li>\n?)+)/g,
    '<ul class="md-ul">$1</ul>'
  );

  // 12) Párrafos: doble salto = nuevo párrafo, salto simple = <br>
  html = html
    .replace(/\n\n+/g, '</p><p class="md-p">')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p class="md-p">') + "</p>";

  // 13) Limpiar wrapping de elementos block
  html = html
    .replace(/<p class="md-p">\s*(<h[1-4][^>]*>)/g, '$1')
    .replace(/(<\/h[1-4]>)\s*<\/p>/g, '$1')
    .replace(/<p class="md-p">\s*(<(?:ul|ol|blockquote|div|pre)[^>]*>)/g, '$1')
    .replace(/(<\/(?:ul|ol|blockquote|div|pre)>)\s*<\/p>/g, '$1')
    .replace(/<p class="md-p">\s* TABLE_(\d+) \s*<\/p>/g, ' TABLE_$1 ')
    .replace(/<p class="md-p">\s* CODE_BLOCK_(\d+) \s*<\/p>/g, ' CODE_BLOCK_$1 ');

  // 14) Restaurar tablas y bloques de código
  html = html.replace(/ TABLE_(\d+) /g, (_, i) => tables[Number(i)] ?? "");
  html = html.replace(/ CODE_BLOCK_(\d+) /g, (_, i) => codeBlocks[Number(i)] ?? "");
  html = html.replace(/ ARBOL_(\d+) /g, (_, i) => arboles[Number(i)] ?? "");

  return html;
}

/** Convierte una tabla markdown en HTML con estilo académico (booktabs-like). */
function renderMdTable(md: string): string {
  const lines = md.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return md;

  const parseRow = (line: string): string[] =>
    line.replace(/^\||\|$/g, "").split("|").map(c => c.trim());

  const header = parseRow(lines[0]);
  const align = parseRow(lines[1]).map(spec => {
    const s = spec.trim();
    if (s.startsWith(":") && s.endsWith(":")) return "center";
    if (s.endsWith(":")) return "right";
    return "left";
  });
  const body = lines.slice(2).map(parseRow);

  const renderInline = (cell: string): string =>
    escapeHtml(cell)
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>');

  let html = '<div class="md-table-wrap"><table class="md-table"><thead><tr>';
  header.forEach((h, i) => {
    html += `<th class="md-th" style="text-align:${align[i] ?? "left"}">${renderInline(h)}</th>`;
  });
  html += '</tr></thead><tbody>';
  body.forEach(row => {
    html += '<tr class="md-tr">';
    row.forEach((c, i) => {
      html += `<td class="md-td" style="text-align:${align[i] ?? "left"}">${renderInline(c)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function paginateMarkdown(text: string, unitsPerPage = 1850): string[] {
  const blocks = text
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean);
  const pages: string[] = [];
  let current: string[] = [];
  let currentUnits = 0;

  const blockUnits = (block: string) => {
    const headingCost = /^#{1,4}\s/.test(block) ? 260 : 0;
    const listCost = /^[-*]\s/m.test(block) ? 120 : 0;
    return block.length + headingCost + listCost;
  };

  const flush = () => {
    if (!current.length) return;
    pages.push(current.join("\n\n"));
    current = [];
    currentUnits = 0;
  };

  for (const block of blocks) {
    const units = blockUnits(block);
    if (units > unitsPerPage) {
      const sentences = block.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [block];
      for (const sentence of sentences.map(s => s.trim()).filter(Boolean)) {
        const sentenceUnits = sentence.length;
        if (current.length && currentUnits + sentenceUnits > unitsPerPage) flush();
        current.push(sentence);
        currentUnits += sentenceUnits;
      }
      continue;
    }

    if (current.length && currentUnits + units > unitsPerPage) flush();

    current.push(block);
    currentUnits += units;
  }

  flush();
  return pages.length ? pages : [text];
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const proyectoId = params.id as string;

  const [user, setUser] = useState<SessionUser | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  // Detección de móvil. Usa lazy initializer para tener el valor correcto desde
  // el PRIMER render (sin esperar useEffect, sin race conditions de hidratación).
  // Necesario porque PWA standalone en Android puede reportar viewport >=1280
  // y el grid de 3 columnas se activa comprimiendo el contenido.
  // Adicionalmente: leemos la clase .is-mobile-ua que el script inline en
  // layout.tsx ya puso en <html> antes de cualquier render de React.
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (typeof document !== "undefined" && document.documentElement.classList.contains("is-mobile-ua")) return true;
    const ua = window.navigator.userAgent;
    if (/Mobi|Mobile|Android|iPhone|iPad|iPod/i.test(ua)) return true;
    return window.matchMedia("(max-width: 1023px)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const ua = window.navigator.userAgent;
      const isMobileUA = /Mobi|Mobile|Android|iPhone|iPad|iPod/i.test(ua);
      const isNarrow = window.matchMedia("(max-width: 1023px)").matches;
      const isCoarse = window.matchMedia("(pointer:coarse)").matches;
      setIsMobileDevice(isMobileUA || isNarrow || isCoarse);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [selectedFase, setSelectedFase] = useState(0);
  const [col1Tab, setCol1Tab] = useState<"generacion" | "fuentes" | "tribunal" | "bitacora" | "cuadernillo" | "defensa">("generacion");

  // 📕 Cuadernillo del estudiante — hoja de ruta personal por fase analítica.
  // Contenido aparte que NO se entrega al tutor, solo el estudiante lo ve.
  interface CuadernilloVista {
    id: string;
    fase_id: string;
    fase_label: string;
    resumen_capitulo: string;
    limitaciones_ia: Array<{ tipo: string; descripcion: string; ubicacion_sugerida: string; como_obtenerlo: string }>;
    sugerencias_fortalecimiento: Array<{ area: string; que_hacer: string; impacto: "alto" | "medio" | "bajo"; tiempo_estimado: string }>;
    datos_a_buscar: Array<{ que: string; donde: string; para_que: string }>;
    preguntas_tutor_probables: Array<{ pregunta: string; respuesta_sugerida: string; evidencia_a_tener_lista: string }>;
    errores_comunes_evitar: string[];
    tips_presentacion_oral: string[];
    created_at: string;
  }
  const [cuadernillos, setCuadernillos] = useState<CuadernilloVista[]>([]);
  const [cuadernilloLoading, setCuadernilloLoading] = useState(false);
  const [cuadernilloGenerando, setCuadernilloGenerando] = useState<string | null>(null);

  // Bitácora del Tutor — observaciones analizadas por la IA (banco acumulado).
  interface BitacoraRow {
    id: string;
    fase_id: string;
    observacion_textual: string;
    patron_detectado: string | null;
    decision: "aplicar" | "aplicar_con_reserva" | "rechazar";
    analisis_ia: string;
    justificacion_para_tutor: string | null;
    aplicado_at: string | null;
    created_at: string;
  }
  const [bitacora, setBitacora] = useState<BitacoraRow[]>([]);
  const [bitacoraLoading, setBitacoraLoading] = useState(false);
  const [bitacoraExpandedId, setBitacoraExpandedId] = useState<string | null>(null);
  const { mode: viewMode } = useViewMode();

  const [phaseDefs, setPhaseDefs] = useState<PhaseDef[]>([]);
  const [isDynamic, setIsDynamic] = useState(false);
  // Navegación lateral para Proyecto de Grado (23 fases)
  const [showPhaseNav, setShowPhaseNav] = useState(false);

  const displayFases = isDynamic && phaseDefs.length > 0
    ? phaseDefs
    : FASES_STATIC;

  // Proyecto de Grado: detectamos por servicio_id o tipo_proyecto_id (criterio
  // determinista) y, como fallback, por número de fases dinámicas. Antes solo
  // dependía de phaseDefs.length > 6, lo que fallaba si las phases dinámicas
  // no cargaban a tiempo y dejaba al PG renderizando como Monografía (header
  // equivocado + sidebar de monografía + las 23 fases UCATEC ocultas).
  const isPGProject = (() => {
    const tipoId = proyecto?.tipo_proyecto_id;
    if (
      tipoId === "proy-grado-001"
      || tipoId === "proy-prod-001"
      || tipoId === "proy-serv-001"
    ) return true;
    if (proyecto?.servicio_id === "proy-grado-001") return true;
    return isDynamic && phaseDefs.length > 6;
  })();

  const [university, setUniversity] = useState<University | null>(null);
  const [pdfData, setPdfData] = useState<StudentCoverData>({
    nombre: "", mes: MESES[new Date().getMonth()],
    anio: String(new Date().getFullYear()),
    programa: "", version: "", tutor: "", carrera: "",
  });
  const [showCoverSettings, setShowCoverSettings] = useState(false);
  /** Indica si pdfData fue editado desde el modal (para persistir al cerrar). */
  const pdfDataDirtyRef = useRef(false);
  /** Evita re-hidratación múltiple cuando el proyecto se refresca. */
  const pdfDataHydratedRef = useRef(false);

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genElapsed, setGenElapsed] = useState(0);

  // 🎯 Sistema de revisión con ANALIZADOR DE PERTINENCIA + preview obligatorio:
  // 1. El usuario pega UNA observación del tutor
  // 2. El analizador IA decide: aplicar / aplicar_con_reserva / rechazar
  // 3. Según el veredicto se muestra:
  //    - aplicar  → modal DiffPreview (puede aprobar o cancelar)
  //    - aplicar_con_reserva → modal DiffPreview con warning amarillo
  //    - rechazar → modal con la justificación argumentada (NO diff)
  // 4. El input queda bloqueado durante todo el flujo.
  type RevisionStatus = "idle" | "loading" | "preview" | "applying";
  interface RevisionPreviewData {
    observacionId: string | null;
    phaseId: string;
    phaseLabel: string;
    mensajeUsuario: string;
    decision: "aplicar" | "aplicar_con_reserva" | "rechazar" | "mover_a_otra_fase";
    patronDetectado: string;
    analisisIa: string;
    justificacionParaTutor: string | null;
    contenidoActual: string;
    contenidoPropuesto: string | null;
    /** Si el cambio modifica el TÍTULO OFICIAL del proyecto, viene aquí. */
    nuevoTitulo: string | null;
    tituloActual: string | null;
    /** Si decision='mover_a_otra_fase', el id de la fase destino correcta. */
    faseDestinoId: string | null;
    /** Si decision='mover_a_otra_fase', el label legible de la fase destino. */
    faseDestinoLabel: string | null;
    /** Si la cirugía falló (bloque_original no matcheó), mensaje de error
     *  para mostrar al usuario y NO ofrecer "Aplicar". */
    errorCirugia: string | null;
    /** Fuentes que la IA consultó en internet (cuando Grounding está activo).
     *  Permite al usuario verificar que las citas no son inventadas. */
    groundingSources: Array<{ uri?: string; title?: string; snippet?: string }>;
    /** Queries que la IA hizo en Google (cuando Grounding está activo). */
    groundingQueries: string[];
  }
  const [revisionStatus, setRevisionStatus] = useState<RevisionStatus>("idle");
  const [revisionPreview, setRevisionPreview] = useState<RevisionPreviewData | null>(null);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [showPagsDetail, setShowPagsDetail] = useState(false);
  // Modos del preview derecho: "fase" muestra solo el capítulo actual, "completo" todo el documento.
  const [previewMode, setPreviewMode] = useState<"fase" | "completo">("fase");
  // Zoom del preview: 0.75 / 1 / 1.25 / 1.5
  const [previewZoom, setPreviewZoom] = useState(1);
  // Modal fullscreen del preview
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  // Si la URL trae ?fase=ph-capN, ir directo a esa fase al cargar.
  // Esto soporta la navegación "Volver al workspace" desde /documento sin perder el lugar.
  useEffect(() => {
    const targetPhase = searchParams?.get("fase");
    if (!targetPhase || displayFases.length === 0) return;
    const idx = displayFases.findIndex(f => f.id === targetPhase);
    if (idx >= 0) setSelectedFase(idx);
  }, [searchParams, displayFases]);

  // Contador de segundos mientras la IA genera, para feedback visual al usuario.
  // Se resetea al terminar/cancelar.
  useEffect(() => {
    if (!isGenerating) { setGenElapsed(0); return; }
    setGenElapsed(0);
    const id = setInterval(() => setGenElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isGenerating]);

  // Aplica el zoom al contenido del iframe del preview (panel y fullscreen).
  // Usa CSS `zoom` que respeta tipografía y márgenes, soportado en navegadores modernos.
  // setProperty() en vez de asignación directa evita react-hooks/immutability.
  useEffect(() => {
    const refs = [previewIframeRef.current, previewIframeFsRef.current];
    for (const ref of refs) {
      ref?.contentDocument?.body?.style.setProperty("zoom", String(previewZoom));
    }
  }, [previewZoom]);

  // Cerrar fullscreen con tecla ESC.
  useEffect(() => {
    if (!previewFullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewFullscreen]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState("");

  const [feedbackTexto, setFeedbackTexto] = useState("");
  const [vistaActiva, setVistaActiva] = useState<"borrador" | "final">("borrador");

  // Calibration
  const [showCalibracion, setShowCalibracion] = useState(false);
  const [calibPreguntas, setCalibPreguntas] = useState<CalibracionPregunta[]>([]);
  const [calibRespuestas, setCalibRespuestas] = useState<Record<string, string>>({});
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);

  // PDF right panel
  // El preview vive ahora en /projects/[id]/documento (página dedicada).
  // El panel derecho del workspace queda oculto por defecto. Admin puede mostrarlo
  // con el toggle de abajo para debug, pero el flujo normal va a /documento.
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const previewIframeFsRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheHydratedRef = useRef(false);
  const cacheKey = `workspace:${proyectoId}`;

  // ── Load ──────────────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return;
      const cached = JSON.parse(raw) as WorkspaceCache;
      queueMicrotask(() => {
        setUser(cached.user ?? null);
        setProyecto(cached.proyecto ?? null);
        setUniversity(cached.university ?? null);
        if (cached.pdfData) setPdfData(cached.pdfData);
        setIsDynamic(Boolean(cached.isDynamic));
        setPhaseDefs(Array.isArray(cached.phaseDefs) ? cached.phaseDefs : []);
        if (typeof cached.selectedFase === "number") setSelectedFase(cached.selectedFase);
        setLoading(false);
        cacheHydratedRef.current = true;
      });
    } catch {
      /* ignore broken cache */
    }
  }, [cacheKey]);

  useEffect(() => {
    async function load() {
      const hasCachedSnapshot = cacheHydratedRef.current;
      if (hasCachedSnapshot) setIsRefreshing(true);
      try {
        const [meRes, projRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/projects/${proyectoId}`),
        ]);
        const meData = await meRes.json();
        if (!meData.user) { router.replace("/login"); return; }
        setUser(meData.user);
        if (!projRes.ok) { router.replace("/dashboard"); return; }
        const proj: Proyecto = (await projRes.json()).proyecto;

        // 🎓 Separación arquitectónica: si es Proyecto de Grado, redirigir
        // al workspace dedicado /workspace-pg. Este workspace queda
        // EXCLUSIVAMENTE para Monografía y Tesis.
        const tipoId = proj.tipo_proyecto_id;
        const esPG = tipoId === "proy-grado-001"
          || tipoId === "proy-prod-001"
          || tipoId === "proy-serv-001"
          || proj.servicio_id === "proy-grado-001";
        if (esPG) {
          router.replace(`/projects/${proj.id}/workspace-pg`);
          return;
        }

        setProyecto(proj);

        // 🎚️ Calibración de estilo: desactivada para monografías por decisión de producto.
        // El código y componente siguen disponibles para reactivar en el futuro
        // (ej: tesis o usuarios pro) cambiando el flag `CALIBRACION_HABILITADA_PARA_SERVICIOS`.
        const CALIBRACION_HABILITADA_PARA_SERVICIOS: string[] = []; // ej: ["tesis-001"] para reactivar
        const servicioActual = proj.servicio_id ?? "mono-001";
        const calibracionHabilitada = CALIBRACION_HABILITADA_PARA_SERVICIOS.includes(servicioActual);
        if (calibracionHabilitada && proj.modalidad_creacion === "guiada" && !proj.perfil_estilo_usuario) {
          setShowCalibracion(true);
          const qRes = await fetch(`/api/admin/calibration-questions?servicio_id=${servicioActual}`);
          if (qRes.ok) setCalibPreguntas((await qRes.json()).preguntas ?? []);
        }

        // 🔒 Endpoint seguro: solo retorna metadata (id/label/short_label/orden).
        // Los prompts NUNCA salen al cliente — el server los lee internamente.
        try {
          const phaseParams = new URLSearchParams({ servicio_id: proj.servicio_id ?? "mono-001" });
          const phRes = await fetch(`/api/projects/${proj.id}/phases?${phaseParams.toString()}`);
          if (phRes.ok) {
            const phData = await phRes.json();
            if (phData.phases?.length > 0) {
              const defs: PhaseDef[] = phData.phases.map((p: { id: string; label: string; short_label: string; orden: number }) => ({
                id: p.id, label: p.label, short: p.short_label, orden: p.orden,
              }));
              setIsDynamic(true); setPhaseDefs(defs);
              const lastDone = defs.reduce((acc: number, p, i) =>
                (proj.phase_contents?.[p.id] ?? null) ? i : acc, 0);
              setSelectedFase(lastDone);
            } else { setSelectedFase(proj.estado_fase); }
          } else { setSelectedFase(proj.estado_fase); }
        } catch { setSelectedFase(proj.estado_fase); }

        if (proj.universidad_id) {
          try {
            const univRes = await fetch("/api/admin/universities");
            if (univRes.ok) {
              const univList: University[] = await univRes.json();
              const found = univList.find(u => u.id === proj.universidad_id);
              if (found) setUniversity(found);
            }
          } catch { /* no-op */ }
        }
      } catch { router.replace("/dashboard"); }
      finally {
        setLoading(false);
        if (hasCachedSnapshot) setIsRefreshing(false);
      }
    }
    load();
  }, [proyectoId, router]);

  useEffect(() => {
    if (!cacheHydratedRef.current && loading) return;
    const payload: WorkspaceCache = {
      user,
      proyecto,
      university,
      pdfData,
      selectedFase,
      isDynamic,
      phaseDefs,
    };
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch {
      /* storage quota or private mode */
    }
  }, [cacheKey, user, proyecto, university, pdfData, selectedFase, isDynamic, phaseDefs, loading]);

  // 📅 Hidratar pdfData (mes/año/nombre/tutor/programa) desde el proyecto la
  //    primera vez que se carga. Si el estudiante ya editó esos campos antes
  //    (los tiene en academic_context.contexto_inicial), se respetan.
  //    Si no, se mantienen los defaults (fecha actual).
  useEffect(() => {
    if (pdfDataHydratedRef.current || !proyecto || !user) return;
    const ctx = ((proyecto as unknown as { academic_context?: Record<string, unknown> }).academic_context ?? {}) as Record<string, unknown>;
    const ctxIni = (ctx.contexto_inicial ?? {}) as Record<string, unknown>;
    setPdfData((prev) => ({
      ...prev,
      nombre: (typeof ctxIni.nombre === "string" && ctxIni.nombre) || user.name || prev.nombre,
      mes: (typeof ctxIni.mes_presentacion === "string" && ctxIni.mes_presentacion) || prev.mes,
      anio: (typeof ctxIni.anio_presentacion === "string" && ctxIni.anio_presentacion) || prev.anio,
      programa: (typeof ctxIni.programa === "string" && ctxIni.programa) || prev.programa,
      version: (typeof ctxIni.version === "string" && ctxIni.version) || prev.version,
      tutor: (typeof ctxIni.tutor === "string" && ctxIni.tutor) || prev.tutor,
      carrera: (typeof ctxIni.carrera === "string" && ctxIni.carrera) || prev.carrera,
      tituloTrabajo: ((proyecto as unknown as { tema_aprobado?: string }).tema_aprobado) || prev.tituloTrabajo,
      // Datos institucionales editables (carátula UMSS):
      universidad: (typeof ctxIni.universidad === "string" && ctxIni.universidad) || prev.universidad,
      facultad: (typeof ctxIni.facultad === "string" && ctxIni.facultad) || prev.facultad,
      departamento: (typeof ctxIni.departamento === "string" && ctxIni.departamento) || prev.departamento,
      modalidad: (typeof ctxIni.modalidad === "string" && ctxIni.modalidad) || prev.modalidad,
      ciudad: (typeof ctxIni.ciudad === "string" && ctxIni.ciudad) || prev.ciudad,
      pais: (typeof ctxIni.pais === "string" && ctxIni.pais) || prev.pais,
    }));
    pdfDataHydratedRef.current = true;
  }, [proyecto, user]);

  /**
   * Persiste los datos de la carátula en el proyecto cuando el estudiante
   * cierra el modal "Configurar Carátula". Guarda en academic_context.contexto_inicial
   * para que paquete-latex (server) los use al generar el ZIP.
   */
  const guardarDatosCaratula = useCallback(async () => {
    if (!proyecto || !pdfDataDirtyRef.current) {
      setShowCoverSettings(false);
      return;
    }
    pdfDataDirtyRef.current = false;
    try {
      const ctxActual = ((proyecto as unknown as { academic_context?: Record<string, unknown> }).academic_context ?? {}) as Record<string, unknown>;
      const ctxIniActual = (ctxActual.contexto_inicial ?? {}) as Record<string, unknown>;
      const ctxIniNuevo = {
        ...ctxIniActual,
        nombre: pdfData.nombre,
        mes_presentacion: pdfData.mes,
        anio_presentacion: pdfData.anio,
        programa: pdfData.programa ?? ctxIniActual.programa,
        version: pdfData.version ?? ctxIniActual.version,
        tutor: pdfData.tutor ?? ctxIniActual.tutor,
        carrera: pdfData.carrera ?? ctxIniActual.carrera,
        // Datos institucionales editables:
        universidad: pdfData.universidad ?? ctxIniActual.universidad,
        facultad: pdfData.facultad ?? ctxIniActual.facultad,
        departamento: pdfData.departamento ?? ctxIniActual.departamento,
        modalidad: pdfData.modalidad ?? ctxIniActual.modalidad,
        ciudad: pdfData.ciudad ?? ctxIniActual.ciudad,
        pais: pdfData.pais ?? ctxIniActual.pais,
      };
      const academicContextNuevo = { ...ctxActual, contexto_inicial: ctxIniNuevo };
      const res = await fetch(`/api/projects/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academic_context: academicContextNuevo }),
      });
      if (res.ok) {
        const data = await res.json();
        setProyecto((prev) => prev ? { ...prev, ...data.proyecto } : prev);
      }
    } catch (e) {
      console.error("[caratula] error al guardar", e);
    } finally {
      setShowCoverSettings(false);
    }
  }, [proyecto, pdfData]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);
  useEffect(() => {
    queueMicrotask(() => {
      setFeedbackTexto("");
      setVistaActiva("borrador");
    });
  }, [selectedFase]);

  // ── Calibration ───────────────────────────────────────────────────────────────

  async function submitCalibracion() {
    if (!proyecto) return;
    const respuestas = calibPreguntas
      .filter(q => calibRespuestas[q.id]?.trim())
      .map(q => ({ pregunta: q.pregunta, respuesta: calibRespuestas[q.id] }));
    if (respuestas.length === 0) { setShowCalibracion(false); return; }
    setIsAnalyzingStyle(true);
    try {
      const res = await fetch("/api/projects/analyze-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyecto_id: proyectoId, respuestas }),
      });
      const data = await res.json();
      if (res.ok && data.perfil_estilo_usuario) {
        setProyecto(prev => prev ? { ...prev, perfil_estilo_usuario: data.perfil_estilo_usuario } : prev);
      }
    } catch { /* non-critical */ }
    setIsAnalyzingStyle(false);
    setShowCalibracion(false);
  }

  // ── Generate ──────────────────────────────────────────────────────────────────

  const generarFase = useCallback(async (opts: {
    mensajeOverride?: string;
    tipo?: "borrador" | "final";
    feedback?: string;
  } = {}) => {
    if (!proyecto || isGenerating) return;
    setIsGenerating(true); setError("");
    const { mensajeOverride, tipo: tipoOpt, feedback } = opts;
    const esGuiado = proyecto.modalidad_creacion === "guiada";
    const tipo: "borrador" | "final" = tipoOpt ?? (esGuiado ? "borrador" : "final");
    const userMsg = mensajeOverride ?? chatInput.trim();
    if (userMsg && !feedback) {
      setChatMsgs(prev => [...prev, { role: "user", text: userMsg, ts: Date.now() }]);
      if (!mensajeOverride) setChatInput("");
    }
    const faseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
    const existingFinal = isDynamic
      ? getFinalContent(proyecto, faseDef.id)
      : getFinalContent(proyecto, String(selectedFase), selectedFase);
    const shouldEditExisting = Boolean(userMsg && !feedback && tipo === "final" && existingFinal?.trim());
    const body = isDynamic
      ? { proyecto_id: proyectoId, phase_id: faseDef.id, mensaje_usuario: userMsg || undefined, tipo, feedback_usuario: feedback || undefined }
      : { proyecto_id: proyectoId, fase_numero: selectedFase, mensaje_usuario: userMsg || undefined, tipo, feedback_usuario: feedback || undefined };
    // Setup AbortController for cancellation
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(shouldEditExisting ? "/api/projects/edit-phase-section" : "/api/projects/generate-phase", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        setChatMsgs(prev => [...prev, { role: "assistant", text: `⚠️ ${data.error || "Error al generar."}`, ts: Date.now() }]);
        return;
      }
      setProyecto(prev => {
        if (!prev) return prev;
        const np = { ...prev };
        // 🔙 Antes de sobrescribir, guardamos la versión anterior en *_anterior
        // para que el usuario pueda revertir si no le gusta el cambio.
        const phaseContentsPrev = (prev.phase_contents ?? {}) as Record<string, string | null | undefined>;
        if (isDynamic) {
          if (tipo === "borrador") {
            // Si había un borrador previo, lo guardamos como anterior
            const prevBorrador = phaseContentsPrev[`${faseDef.id}_borrador`];
            np.phase_contents = {
              ...phaseContentsPrev,
              [`${faseDef.id}_borrador`]: data.contenido,
              ...(prevBorrador?.trim() ? { [`${faseDef.id}_borrador_anterior`]: prevBorrador } : {}),
            };
          } else {
            // Final: guardamos final previo (si existe) como anterior
            const prevFinal = phaseContentsPrev[faseDef.id];
            np.phase_contents = {
              ...phaseContentsPrev,
              [faseDef.id]: data.contenido,
              ...(prevFinal?.trim() ? { [`${faseDef.id}_anterior`]: prevFinal } : {}),
            };
          }
        } else {
          const pk = String(selectedFase);
          if (tipo === "borrador") {
            const prevBorrador = phaseContentsPrev[`${pk}_borrador`];
            np.phase_contents = {
              ...phaseContentsPrev,
              [`${pk}_borrador`]: data.contenido,
              ...(prevBorrador?.trim() ? { [`${pk}_borrador_anterior`]: prevBorrador } : {}),
            };
          } else {
            const legacyKey = `contenido_fase_${selectedFase}` as keyof Proyecto;
            const prevFinal = (prev as unknown as Record<string, unknown>)[legacyKey] as string | null;
            np[legacyKey] = data.contenido as never;
            np.estado_fase = Math.max(prev.estado_fase, selectedFase);
            np.phase_contents = {
              ...phaseContentsPrev,
              [pk]: data.contenido,
              ...(prevFinal && typeof prevFinal === "string" && prevFinal.trim() ? { [`${pk}_anterior`]: prevFinal } : {}),
            };
          }
        }
        if (data.requiere_actualizacion) np.requiere_actualizacion = data.requiere_actualizacion;
        if (data.ai_trace_entry) {
          np.academic_memory = {
            ...(prev.academic_memory ?? {}),
            ai_trace: [data.ai_trace_entry, ...(prev.academic_memory?.ai_trace ?? [])].slice(0, 20),
          };
        }
        np.final_document = null;
        np.final_document_validation = {};
        return np;
      });
      if (tipo === "borrador") setVistaActiva("borrador");
      else { setVistaActiva("final"); setFeedbackTexto(""); }
      if (userMsg && !feedback) {
        setChatMsgs(prev => [...prev, {
          role: "assistant",
          text: shouldEditExisting
            ? "✅ Ajuste puntual aplicado sin regenerar toda la fase."
            : tipo === "final"
            ? "✅ Versión final generada."
            : "📝 Borrador generado. Revísalo y deja tu feedback.",
          ts: Date.now(),
        }]);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setChatMsgs(prev => [...prev, { role: "assistant", text: "⏹ Generación cancelada.", ts: Date.now() }]);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [proyecto, isGenerating, chatInput, selectedFase, proyectoId, isDynamic, displayFases]);

  const cancelGeneracion = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Ref que evita el loop infinito del auto-Cap 0. Declarado antes que los
  // handlers que lo usan para que TypeScript no lo marque como TDZ.
  const autoCap0FiredRef = useRef(false);

  // ── Cap 0 actions: elegir propuesta / regenerar / mantener tema ─────────────
  // Al confirmar tema (elegir o mantener), guardamos en BD con estado_fase=1
  // para marcar Cap 0 como cerrado e irreversible.
  const elegirPropuestaCap0 = useCallback(async (propuesta: { titulo: string }) => {
    if (!proyecto) return;
    try {
      const res = await fetch(`/api/projects/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema_aprobado: propuesta.titulo,
          titulo_provisional: propuesta.titulo,
          estado_fase: Math.max(proyecto.estado_fase ?? 0, 1),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProyecto(prev => (prev ? { ...prev, ...data.proyecto } : prev));
      }
    } catch (e) {
      console.error("Error guardando tema elegido:", e);
    }
    setSelectedFase(1);
  }, [proyecto]);

  const mantenerTemaCap0 = useCallback(async () => {
    if (proyecto) {
      try {
        const res = await fetch(`/api/projects/${proyecto.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estado_fase: Math.max(proyecto.estado_fase ?? 0, 1),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setProyecto(prev => (prev ? { ...prev, ...data.proyecto } : prev));
        }
      } catch (e) {
        console.error("Error confirmando tema:", e);
      }
    }
    setSelectedFase(1);
  }, [proyecto]);

  const regenerarCap0 = useCallback(() => {
    autoCap0FiredRef.current = true; // bloquear el auto-effect
    generarFase({ tipo: "borrador" }).catch(e => console.error("Error regenerando Cap 0:", e));
  }, [generarFase]);

  // ── Aprobar borrador como final SIN llamar a IA (cuando no hay feedback) ────
  // Copia el contenido del borrador como versión final, ahorra llamada al modelo.
  const aprobarBorradorComoFinal = useCallback(async () => {
    if (!proyecto || isGenerating) return;
    const faseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
    const fId = faseDef.id;
    const fNum = (faseDef as typeof FASES_STATIC[0]).num;
    const borrador = getBorrador(proyecto, fId, fNum);
    if (!borrador?.trim()) return;

    try {
      const prevContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
      const prevFinal = prevContents[fId];
      const phaseContents = {
        ...prevContents,
        [fId]: borrador,
        ...(prevFinal?.trim() ? { [`${fId}_anterior`]: prevFinal } : {}),
      };
      const body: Record<string, unknown> = {
        phase_contents: phaseContents,
        estado_fase: Math.max(proyecto.estado_fase ?? 0, selectedFase + 1),
      };
      if (!isDynamic && fNum >= 0 && fNum <= 5) {
        body[`contenido_fase_${fNum}`] = borrador;
      }

      const res = await fetch(`/api/projects/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProyecto(prev => (prev ? { ...prev, ...data.proyecto } : prev));
      }
    } catch (e) {
      console.error("Error aprobando borrador como final:", e);
    }

    // 🎓 Generación de preguntas de defensa en background (fire-and-forget).
    // Solo para fases sustantivas (caps). Si falla, no rompe el flujo del estudiante
    // — el banco las podrá regenerar después desde la vista final.
    const FASES_CON_PREGUNTAS = new Set(["ph-cap0","ph-cap1","ph-cap2","ph-cap3","ph-cap4","ph-cap5"]);
    if (FASES_CON_PREGUNTAS.has(fId)) {
      void fetch(`/api/projects/${proyecto.id}/preguntas/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase_id: fId }),
        keepalive: true,
      }).catch(err => console.warn("[preguntas] background generation falló:", err));
    }

    setVistaActiva("final");
    if (selectedFase < displayFases.length - 1) {
      setSelectedFase(selectedFase + 1);
    }
  }, [proyecto, isGenerating, displayFases, selectedFase, isDynamic]);

  // ──────────────────────────────────────────────────────────────────────────
  // ── FLUJO DE REVISIÓN CON PREVIEW OBLIGATORIO ─────────────────────────────
  // ──────────────────────────────────────────────────────────────────────────
  // Cuando el usuario pega UNA observación del tutor, se ejecuta este flujo:
  //   1. pedirRevisionConPreview → llama /api/projects/edit-phase-section
  //      con modo=preview → devuelve contenido propuesto SIN persistir.
  //   2. Mientras procesa, input bloqueado con candado 🔒.
  //   3. Modal con DiffPreview se abre mostrando el diff línea por línea.
  //   4. Usuario aprueba → aplicarRevision PATCH directo al proyecto (sin
  //      llamar a IA otra vez — usa el contenido del preview).
  //   5. Usuario cancela → cancelarRevision libera el input.
  // ──────────────────────────────────────────────────────────────────────────

  const pedirRevisionConPreview = useCallback(async (mensaje: string) => {
    if (!proyecto || revisionStatus !== "idle") return;
    const faseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
    if (!faseDef?.id) {
      setRevisionError("No se pudo identificar la fase activa. Recarga la página.");
      return;
    }

    setRevisionStatus("loading");
    setRevisionError(null);
    // Log que el admin pueda leer fácil sin abrir F12
    console.log("[analizador] enviando observación", { proyectoId: proyecto.id, faseId: faseDef.id, observacion: mensaje.slice(0, 80) });

    try {
      // Llama al ANALIZADOR DE PERTINENCIA (no aplica nada todavía).
      const res = await fetch(`/api/projects/${proyecto.id}/analizar-observacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase_id: faseDef.id,
          observacion: mensaje,
        }),
      });
      const rawText = await res.text();
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(rawText); } catch { data = { error: `Respuesta no-JSON del servidor (${res.status}): ${rawText.slice(0, 200)}` }; }

      console.log("[analizador] respuesta", { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        const errorMsg = (typeof data.error === "string" ? data.error : null)
          ?? `Error ${res.status}: ${rawText.slice(0, 200)}`;
        setRevisionError(errorMsg);
        setRevisionStatus("idle");
        // Alerta visible que NO puede ser ignorada
        alert(`❌ Error del analizador:\n\n${errorMsg}`);
        return;
      }

      // Validación defensiva: la decisión debe estar presente
      const decision = data.decision as string | undefined;
      if (!decision || !["aplicar", "aplicar_con_reserva", "rechazar", "mover_a_otra_fase"].includes(decision)) {
        const errorMsg = `La IA no devolvió una decisión válida (recibido: ${decision ?? "vacío"}). Posible problema con el proveedor IA.`;
        setRevisionError(errorMsg);
        setRevisionStatus("idle");
        alert(`❌ ${errorMsg}`);
        return;
      }

      // ⚡ CASO ESPECIAL: la IA detectó que la observación corresponde a OTRA
      // fase del documento. NO abrir modal — redirigir directo al capítulo
      // correcto con la observación precargada en el chat, y mostrar el
      // análisis IA en el hilo de mensajes para que el usuario entienda
      // por qué se movió. Esto evita el bug del modal mostrando "NO APLICAR"
      // cuando en realidad la decisión fue "moverlo".
      if (decision === "mover_a_otra_fase") {
        const faseDestinoId = (data.fase_destino_id as string | null) ?? null;
        const faseDestinoLabel = (data.fase_destino_label as string | null) ?? null;
        const analisisIa = (data.analisis_ia as string | undefined) ?? "";

        if (faseDestinoId) {
          const idxDestino = displayFases.findIndex((f) => f.id === faseDestinoId);
          if (idxDestino >= 0) {
            setSelectedFase(idxDestino);
            setChatInput(mensaje);
            setChatMsgs((prev) => [
              ...prev,
              { role: "user", text: mensaje, ts: Date.now() },
              {
                role: "assistant",
                text: `📍 Esta observación corresponde al capítulo **${faseDestinoLabel}**, no a ${faseDef.label}.\n\n_${analisisIa}_\n\nTe llevé directo al capítulo correcto y dejé tu observación lista en el cuadro de chat. Revisala y dale a la flecha para aplicarla acá.`,
                ts: Date.now(),
              },
            ]);
            setRevisionStatus("idle");
            return;
          }
        }
        // Fallback: no logramos resolver el id de la fase destino
        setChatMsgs((prev) => [
          ...prev,
          { role: "user", text: mensaje, ts: Date.now() },
          {
            role: "assistant",
            text: `⚠️ Esta observación parece pertenecer al capítulo "${faseDestinoLabel ?? "otro"}" pero no logré localizarlo automáticamente. Cambiá manualmente al capítulo correcto y pegá la observación.\n\n_${analisisIa}_`,
            ts: Date.now(),
          },
        ]);
        setRevisionStatus("idle");
        return;
      }

      setRevisionPreview({
        observacionId: (data.observacion_id as string | null) ?? null,
        phaseId: faseDef.id,
        phaseLabel: (data.fase_label as string | undefined) ?? faseDef.label ?? faseDef.id,
        mensajeUsuario: mensaje,
        decision: decision as "aplicar" | "aplicar_con_reserva" | "rechazar" | "mover_a_otra_fase",
        patronDetectado: (data.patron_detectado as string | undefined) ?? "",
        analisisIa: (data.analisis_ia as string | undefined) ?? "",
        justificacionParaTutor: (data.justificacion_para_tutor as string | null) ?? null,
        contenidoActual: (data.contenido_actual as string | undefined) ?? "",
        contenidoPropuesto: (data.contenido_propuesto as string | null) ?? null,
        nuevoTitulo: (data.nuevo_titulo as string | null) ?? null,
        tituloActual: (data.titulo_actual as string | null) ?? null,
        faseDestinoId: (data.fase_destino_id as string | null) ?? null,
        faseDestinoLabel: (data.fase_destino_label as string | null) ?? null,
        errorCirugia: (data.error_cirugia as string | null) ?? null,
        groundingSources: Array.isArray(data.grounding_sources)
          ? (data.grounding_sources as Array<{ uri?: string; title?: string; snippet?: string }>)
          : [],
        groundingQueries: Array.isArray(data.grounding_queries)
          ? (data.grounding_queries as string[])
          : [],
      });
      setRevisionStatus("preview");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Error de red al contactar al analizador";
      console.error("[analizador] error", e);
      setRevisionError(errorMsg);
      setRevisionStatus("idle");
      alert(`❌ Error de conexión:\n\n${errorMsg}`);
    }
  }, [proyecto, revisionStatus, displayFases, selectedFase]);

  const aplicarRevision = useCallback(async () => {
    if (!proyecto || !revisionPreview || revisionStatus !== "preview") return;

    // Caso especial: decision='mover_a_otra_fase'. No es aplicar — es saltar
    // a la fase correcta con el mensaje pre-cargado en el chat de allá.
    if (revisionPreview.decision === "mover_a_otra_fase" && revisionPreview.faseDestinoId) {
      const idxDestino = displayFases.findIndex((f) => f.id === revisionPreview.faseDestinoId);
      if (idxDestino >= 0) {
        setSelectedFase(idxDestino);
        setChatInput(revisionPreview.mensajeUsuario);
        setChatMsgs((prev) => [
          ...prev,
          { role: "user", text: revisionPreview.mensajeUsuario, ts: Date.now() },
          {
            role: "assistant",
            text: `📍 Cambié al capítulo **${revisionPreview.faseDestinoLabel}** y dejé tu observación lista en el cuadro de chat. Revisala y dale a la flecha para procesarla acá.`,
            ts: Date.now(),
          },
        ]);
      } else {
        setChatMsgs((prev) => [
          ...prev,
          { role: "user", text: revisionPreview.mensajeUsuario, ts: Date.now() },
          {
            role: "assistant",
            text: `⚠️ La observación parece pertenecer al capítulo "${revisionPreview.faseDestinoLabel}" pero no logré localizarlo en este proyecto. Cambiá manualmente al capítulo correcto y pegá la observación.`,
            ts: Date.now(),
          },
        ]);
      }
      setRevisionPreview(null);
      setRevisionStatus("idle");
      setChatInput((prev) => prev || revisionPreview.mensajeUsuario);
      return;
    }

    // Si hubo error de cirugía, no podemos aplicar — solo cerrar con aviso
    if (revisionPreview.errorCirugia) {
      setChatMsgs((prev) => [
        ...prev,
        { role: "user", text: revisionPreview.mensajeUsuario, ts: Date.now() },
        {
          role: "assistant",
          text: `⚠️ ${revisionPreview.errorCirugia}`,
          ts: Date.now(),
        },
      ]);
      setRevisionPreview(null);
      setRevisionStatus("idle");
      setChatInput("");
      return;
    }

    // Si la decisión fue rechazar, "aplicar" no tiene sentido (no hay cambio
    // que ejecutar). En ese caso solo cerramos el modal y la observación
    // queda registrada en el banco con la justificación para defender ante
    // el tutor.
    if (revisionPreview.decision === "rechazar" || !revisionPreview.contenidoPropuesto) {
      setChatMsgs((prev) => [
        ...prev,
        { role: "user", text: revisionPreview.mensajeUsuario, ts: Date.now() },
        {
          role: "assistant",
          text: `🛡️ Observación analizada y registrada en tu Bitácora del Tutor. Decisión: NO aplicar. Tienes una respuesta argumentada lista para defender ante tu tutor.`,
          ts: Date.now(),
        },
      ]);
      setRevisionPreview(null);
      setRevisionStatus("idle");
      setChatInput("");
      return;
    }

    setRevisionStatus("applying");
    setRevisionError(null);

    try {
      // PATCH directo al proyecto sin llamar a IA otra vez (ahorra tokens).
      const currentPhaseContents = (proyecto as unknown as { phase_contents?: Record<string, string | null> }).phase_contents ?? {};
      const nuevoPhaseContents = {
        ...currentPhaseContents,
        [revisionPreview.phaseId]: revisionPreview.contenidoPropuesto,
      };
      // Si la observación cambia el TÍTULO OFICIAL, lo actualizamos también
      // (tema_aprobado + titulo_provisional) para que se propague a todas las
      // demás fases y a la portada del PDF/LaTeX.
      const patchBody: Record<string, unknown> = {
        phase_contents: nuevoPhaseContents,
        final_document: null, // invalidar consolidado, hay que regenerar
      };
      if (revisionPreview.nuevoTitulo && revisionPreview.nuevoTitulo.trim()) {
        patchBody.tema_aprobado = revisionPreview.nuevoTitulo.trim();
        patchBody.titulo_provisional = revisionPreview.nuevoTitulo.trim();
      }
      const res = await fetch(`/api/projects/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
      });
      const data = await res.json();
      if (!res.ok) {
        setRevisionError(data.error ?? "Error al aplicar la corrección");
        setRevisionStatus("preview");
        return;
      }
      // Actualizar el state local
      setProyecto((prev) => (prev ? { ...prev, ...data.proyecto } : prev));
      // Marcar en el banco como aplicada (fire-and-forget, no bloquea)
      if (revisionPreview.observacionId) {
        fetch(`/api/projects/${proyecto.id}/observaciones-banco/${revisionPreview.observacionId}/aplicada`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenido_despues: revisionPreview.contenidoPropuesto }),
        }).catch(() => { /* silent */ });
      }
      // Agregar al historial del chat
      const labelDecision = revisionPreview.decision === "aplicar_con_reserva"
        ? "✅ Ajuste aplicado (con reserva)"
        : "✅ Ajuste aplicado";
      const tituloMsg = revisionPreview.nuevoTitulo
        ? ` Además, el TÍTULO OFICIAL del proyecto se actualizó a: "${revisionPreview.nuevoTitulo}".`
        : "";
      setChatMsgs((prev) => [
        ...prev,
        { role: "user", text: revisionPreview.mensajeUsuario, ts: Date.now() },
        { role: "assistant", text: `${labelDecision} en ${revisionPreview.phaseLabel}.${tituloMsg}`, ts: Date.now() },
      ]);
      // Limpiar estado y desbloquear input
      setRevisionPreview(null);
      setRevisionStatus("idle");
      setChatInput("");
    } catch (e) {
      setRevisionError(e instanceof Error ? e.message : "Error de red");
      setRevisionStatus("preview");
    }
  }, [proyecto, revisionPreview, revisionStatus, displayFases]);

  const cancelarRevision = useCallback(() => {
    // El input mantiene su texto para que el usuario pueda editarlo y reintentar.
    setRevisionPreview(null);
    setRevisionStatus("idle");
    setRevisionError(null);
  }, []);

  // ── Bitácora del Tutor ───────────────────────────────────────────────────
  // Carga todas las observaciones analizadas del proyecto desde el banco.
  const cargarBitacora = useCallback(async () => {
    if (!proyecto) return;
    setBitacoraLoading(true);
    try {
      const res = await fetch(`/api/projects/${proyecto.id}/bitacora`);
      if (!res.ok) throw new Error("No se pudo cargar la bitácora");
      const data = await res.json();
      setBitacora((data.observaciones ?? []) as BitacoraRow[]);
    } catch {
      setBitacora([]);
    } finally {
      setBitacoraLoading(false);
    }
  }, [proyecto]);

  // Auto-carga la bitácora cuando el usuario abre la pestaña.
  useEffect(() => {
    if (col1Tab === "bitacora" && proyecto) {
      cargarBitacora();
    }
  }, [col1Tab, proyecto, cargarBitacora]);

  const abrirCartaDefensa = useCallback(() => {
    if (!proyecto) return;
    window.open(`/api/projects/${proyecto.id}/bitacora/imprimible`, "_blank", "noopener");
  }, [proyecto]);

  // ── Cuadernillo del Estudiante ───────────────────────────────────────────
  const cargarCuadernillos = useCallback(async () => {
    if (!proyecto) return;
    setCuadernilloLoading(true);
    try {
      const res = await fetch(`/api/projects/${proyecto.id}/cuadernillo`);
      if (!res.ok) throw new Error("No se pudo cargar el cuadernillo");
      const data = await res.json();
      setCuadernillos((data.cuadernillos ?? []) as CuadernilloVista[]);
    } catch {
      setCuadernillos([]);
    } finally {
      setCuadernilloLoading(false);
    }
  }, [proyecto]);

  useEffect(() => {
    if (col1Tab === "cuadernillo" && proyecto) {
      cargarCuadernillos();
    }
  }, [col1Tab, proyecto, cargarCuadernillos]);

  /** Genera/regenera el cuadernillo para una fase específica. */
  const generarCuadernilloFase = useCallback(async (faseId: string) => {
    if (!proyecto) return;
    setCuadernilloGenerando(faseId);
    try {
      const res = await fetch(`/api/projects/${proyecto.id}/cuadernillo/${faseId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ ${data.error ?? "Error generando cuadernillo"}`);
        return;
      }
      await cargarCuadernillos();
    } catch (e) {
      alert(`❌ ${e instanceof Error ? e.message : "Error de red"}`);
    } finally {
      setCuadernilloGenerando(null);
    }
  }, [proyecto, cargarCuadernillos]);

  const abrirCuadernilloImprimible = useCallback(() => {
    if (!proyecto) return;
    window.open(`/api/projects/${proyecto.id}/cuadernillo/imprimible`, "_blank", "noopener");
  }, [proyecto]);

  // ── Revertir a la versión anterior (deshacer cambios) ────────────────────
  // Restaura el contenido guardado en *_anterior cuando el usuario aplicó
  // cambios y no le gustó el resultado. Solo aparece si existe un anterior.
  /**
   * SOLO ADMIN: borra TODO el contenido de la fase actual (borrador, final,
   * versiones anteriores) para empezar de cero. Útil para testear regeneraciones
   * sin acumular versiones intermedias. IRREVERSIBLE.
   */
  const resetearFaseAdmin = useCallback(async () => {
    if (!proyecto || isGenerating) return;
    const faseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
    const fId = faseDef.id;
    const fNum = (faseDef as typeof FASES_STATIC[0]).num;

    const ok = window.confirm(
      `⚠️ ADMIN: ¿Borrar TODO el contenido de "${faseDef.label}"?\n\n` +
      `Se eliminarán:\n` +
      `• Borrador actual\n` +
      `• Versión Final aprobada (si existe)\n` +
      `• Versiones anteriores guardadas\n\n` +
      `Esto es IRREVERSIBLE. La fase quedará vacía y podrás generar desde cero.\n\n` +
      `¿Procedo?`
    );
    if (!ok) return;

    const prevContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
    const phaseContents: Record<string, string | null | undefined> = { ...prevContents };

    // Borrar las 4 keys posibles de esta fase
    delete phaseContents[fId];
    delete phaseContents[`${fId}_borrador`];
    delete phaseContents[`${fId}_anterior`];
    delete phaseContents[`${fId}_borrador_anterior`];

    const body: Record<string, unknown> = { phase_contents: phaseContents };
    // Si hay columna legacy mapeada, también limpiar
    if (!isDynamic && fNum >= 0 && fNum <= 5) {
      body[`contenido_fase_${fNum}`] = null;
    }

    try {
      const res = await fetch(`/api/projects/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProyecto(prev => (prev ? { ...prev, ...data.proyecto } : prev));
        setVistaActiva("borrador");
        setFeedbackTexto("");
        setChatMsgs([]);
      }
    } catch (e) {
      console.error("Error reseteando fase:", e);
    }
  }, [proyecto, isGenerating, displayFases, selectedFase, isDynamic]);

  const revertirAlAnterior = useCallback(async () => {
    if (!proyecto || isGenerating) return;
    const faseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
    const fId = faseDef.id;
    const fNum = (faseDef as typeof FASES_STATIC[0]).num;
    const prevContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;

    // Determinar qué versión revertir (final o borrador)
    const tipoVista = vistaActiva === "final" ? "" : "_borrador";
    const keyActual = `${fId}${tipoVista}`;
    const keyAnterior = `${fId}${tipoVista}_anterior`;
    const contenidoAnterior = prevContents[keyAnterior];

    if (!contenidoAnterior?.trim()) return;

    const phaseContents = { ...prevContents, [keyActual]: contenidoAnterior };
    delete phaseContents[keyAnterior]; // ya no hay vuelta atrás de la vuelta atrás

    const body: Record<string, unknown> = { phase_contents: phaseContents };
    if (!isDynamic && fNum >= 0 && fNum <= 5 && vistaActiva === "final") {
      body[`contenido_fase_${fNum}`] = contenidoAnterior;
    }

    try {
      const res = await fetch(`/api/projects/${proyecto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProyecto(prev => (prev ? { ...prev, ...data.proyecto } : prev));
      }
    } catch (e) {
      console.error("Error revertiendo a versión anterior:", e);
    }
  }, [proyecto, isGenerating, displayFases, selectedFase, isDynamic, vistaActiva]);

  // Auto-ejecutar Cap 0 SOLO la primera vez que el proyecto no tiene NADA.
  // Importante: verificar AMBOS sistemas de almacenamiento (legacy contenido_fase_0
  // y dinámico phase_contents.ph-cap0) y también el estado_fase. Si el usuario ya
  // pasó por Cap 0 (estado_fase >= 1), NO debe regenerarse al volver.
  useEffect(() => {
    if (autoCap0FiredRef.current) return;
    if (!proyecto || isGenerating || phaseDefs.length === 0) return;

    // 🔒 Si el usuario ya avanzó del Cap 0, NO regenerar bajo ninguna circunstancia
    if ((proyecto.estado_fase ?? 0) >= 1) {
      autoCap0FiredRef.current = true;
      return;
    }

    // Verificar contenido en ambos sistemas
    const tieneContenidoLegacy = Boolean(proyecto.contenido_fase_0?.trim());
    const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
    const tieneContenidoDinamico = Boolean(
      phaseContents["ph-cap0"]?.trim() ||
      phaseContents["ph-cap0_borrador"]?.trim()
    );
    if (tieneContenidoLegacy || tieneContenidoDinamico) {
      autoCap0FiredRef.current = true; // ya tiene contenido, marcamos como disparado
      return;
    }

    const cap0 = phaseDefs.find(p => p.id === "ph-cap0" || p.id === "0" || p.label?.includes("Tema"));
    if (!cap0) return;
    autoCap0FiredRef.current = true;
    queueMicrotask(() => {
      generarFase({ tipo: "borrador" }).catch(e => {
        console.error("Error auto-generando Cap 0:", e);
      });
    });
  }, [proyecto?.id, proyecto?.contenido_fase_0, proyecto?.estado_fase, phaseDefs.length, isGenerating, generarFase, proyecto]);


  // ── Upload ────────────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    const form = new FormData(); form.append("file", file); form.append("proyecto_id", proyectoId);
    try {
      const res = await fetch("/api/projects/upload-document", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMsgs(prev => [...prev, { role: "assistant", text: `📎 "${data.documento.nombre}" subido — ${data.documento.palabras} palabras extraídas.`, ts: Date.now() }]);
    } catch (e) { setError((e as Error).message); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  async function generarDocumentoFinal() {
    if (!proyecto || isFinalizing) return;
    setIsFinalizing(true);
    setError("");
    try {
      const res = await fetch("/api/projects/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyecto_id: proyectoId }),
      });
      const data = await res.json();
      if (!res.ok && !data.final_document) {
        throw new Error(data.error || data.validation?.errors?.join(" ") || "No se pudo consolidar el documento final.");
      }
      setProyecto(prev => prev ? {
        ...prev,
        final_document: data.final_document,
        final_document_validation: data.validation,
        completado: Boolean(data.validation?.ok),
        academic_memory: data.ai_trace_entry
          ? {
              ...(prev.academic_memory ?? {}),
              ai_trace: [data.ai_trace_entry, ...(prev.academic_memory?.ai_trace ?? [])].slice(0, 20),
            }
          : prev.academic_memory,
        phase_contents: {
          ...(prev.phase_contents ?? {}),
          __final_document: data.final_document,
        },
      } as Proyecto : prev);
      setChatMsgs(prev => [...prev, {
        role: "assistant",
        text: data.validation?.ok
          ? "Documento final consolidado. Ya puedes descargar el PDF entregable."
          : `Documento consolidado con observaciones: ${(data.validation?.errors ?? []).join(" ")}`,
        ts: Date.now(),
      }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsFinalizing(false);
    }
  }

  // ── LaTeX download ────────────────────────────────────────────────────────────

  async function descargarLatex() {
    setIsDownloading(true);
    try {
      const q = new URLSearchParams({
        nombre: pdfData.nombre,
        mes: pdfData.mes,
        anio: pdfData.anio,
        tutor: pdfData.tutor ?? "",
        programa: pdfData.programa ?? "",
        version: pdfData.version ?? "",
        carrera: pdfData.carrera ?? ""
      });
      const res = await fetch(`/api/projects/${proyectoId}/latex?${q.toString()}`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1] ?? "proyecto.tex";
      a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    } catch (e) { setError((e as Error).message); }
    finally { setIsDownloading(false); }
  }

  // ⚠️ HOOKS DERIVADOS — DEBEN IR ANTES DE CUALQUIER RETURN TEMPRANO
  // Para mantener el orden de hooks estable entre renders (Rules of Hooks).

  // phaseId/currentFaseDef calculados de forma defensiva (puede ser undefined si
  // proyecto aún no cargó o displayFases está vacío).
  const currentFaseDefForMemo = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
  const phaseIdForMemo = currentFaseDefForMemo?.id ?? "";

  // ⚡ PERFORMANCE: todos los cálculos del documento se memoizan juntos.
  // Si proyecto es null devuelve valores default (no ejecuta el pipeline).
  const docComputed = useMemo(() => {
    const docUnivDefault = university ?? DEFAULT_UNIVERSITIES[0];
    if (!proyecto) {
      return {
        fasesCompletadas: 0, fasesCompletadasAcademicas: 0, totalFasesAcademicas: 0,
        fasesConContenido: 0, fasesEnBorrador: 0,
        totalWords: 0,
        desgloseFases: [] as Array<{ id: string; label: string; pags: number; esBiblio: boolean }>,
        hayBiblioGenerada: false,
        estimatedPages: 0,
        documentUniversity: docUnivDefault,
        storedFinalDocument: null as string | null,
        documentoFinalListo: false,
        phaseContents: {} as Record<string, string | null>,
        phaseLabels: {} as Record<string, string>,
        documentTitle: "Documento",
        hayContenidoPreview: false,
        docHtml: "",
      };
    }
    const stored = proyecto.final_document || proyecto.phase_contents?.__final_document || null;
    const finalListo = Boolean(stored);
    const docUniv = university ?? DEFAULT_UNIVERSITIES[0];

    let aprobadas = 0;
    let conContenido = 0;
    let aprobadasAcademicas = 0;   // Solo capítulos académicos aprobados
    let words = 0;
    const desglose: Array<{ id: string; label: string; pags: number; esBiblio: boolean }> = [];

    // Formato UMSS del proyecto (define palabras/página realista).
    // Por defecto guia_1_posgrado (doble espacio = ~250 pal/pág).
    const academicCtx = ((proyecto as unknown as { academic_context?: Record<string, unknown> }).academic_context ?? {}) as Record<string, unknown>;
    const formatoUmssProyecto = (typeof academicCtx.formato_umss === "string"
      ? academicCtx.formato_umss
      : "guia_1_posgrado") as FormatoUMSS;

    for (const f of displayFases) {
      const fNum = (f as typeof FASES_STATIC[0]).num;
      const finalC = getFinalContent(proyecto, f.id, fNum);
      const final = finalC?.trim() ? finalC : null;
      const borrC = !final ? getBorrador(proyecto, f.id, fNum) : null;
      const borrador = borrC?.trim() ? borrC : null;
      const content = final ?? borrador;

      if (final) {
        aprobadas++;
        if (!isPhaseTecnica(f.id)) aprobadasAcademicas++;
      }
      if (content) conContenido++;
      if (content) words += countWords(content);
      if (content && f.id !== "ph-cap0") {
        desglose.push({
          id: f.id,
          label: f.label,
          pags: paginasDeFase(content, formatoUmssProyecto),
          esBiblio: f.id === "ph-referencias",
        });
      }
    }

    // Total de fases académicas (excluye técnicas como LaTeX, banco preguntas, etc).
    // El contador del header muestra "X de Y capítulos" usando ESTOS valores
    // para no confundir al usuario con fases de procesamiento interno.
    const totalAcademicas = displayFases.filter(f => !isPhaseTecnica(f.id)).length;

    const enBorrador = conContenido - aprobadas;
    const hayBiblio = desglose.some(d => d.esBiblio);
    const pagsContenido = desglose.reduce((acc, d) => acc + d.pags, 0);
    const totalPags = PAGS_FIJAS_CARATULA + PAGS_FIJAS_INDICE + pagsContenido + desglose.length + (hayBiblio ? 0 : PAGS_FIJAS_BIBLIO_DEFAULT);

    const fasesParaPreview = stored
      ? displayFases
      : (previewMode === "fase" ? displayFases.filter(f => f.id === phaseIdForMemo) : displayFases);
    const phContents: Record<string, string | null> = {};
    const phLabels: Record<string, string> = {};
    if (stored) {
      phContents.fase_0 = stored;
      phLabels.fase_0 = "Monografía final";
    } else {
      fasesParaPreview.forEach((f, index) => {
        const fNum = (f as typeof FASES_STATIC[0]).num;
        const r = getFinalOBorrador(proyecto, f.id, fNum);
        if (r.content) {
          phContents[`fase_${index}`] = r.content;
          phLabels[`fase_${index}`] = r.esBorrador
            ? `${f.label}  ·  (borrador, pendiente de aprobación)`
            : f.label;
        }
      });
    }
    const title = pdfData.tituloTrabajo?.trim() || proyecto.tema_aprobado || proyecto.titulo_provisional || "Documento";
    const hayContenido = finalListo || Object.values(phContents).some(c => typeof c === "string" && c.trim().length > 0);
    const html = hayContenido ? generatePdfHtml({
      university: docUniv,
      studentData: pdfData,
      phaseContents: phContents,
      phaseLabels: phLabels,
      titulo: title,
      preview: true,
    }) : "";

    return {
      fasesCompletadas: aprobadas,
      fasesCompletadasAcademicas: aprobadasAcademicas,
      totalFasesAcademicas: totalAcademicas,
      fasesConContenido: conContenido,
      fasesEnBorrador: enBorrador,
      totalWords: words,
      desgloseFases: desglose,
      hayBiblioGenerada: hayBiblio,
      estimatedPages: Math.round(totalPags),
      documentUniversity: docUniv,
      storedFinalDocument: stored,
      documentoFinalListo: finalListo,
      phaseContents: phContents,
      phaseLabels: phLabels,
      documentTitle: title,
      hayContenidoPreview: hayContenido,
      docHtml: html,
    };
  }, [proyecto, displayFases, previewMode, phaseIdForMemo, pdfData, university]);

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="gradient-bg" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            padding: 18,
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{ display:"grid", gridTemplateColumns:"280px 1fr 300px", gap:14 }}>
            <div style={{ border:"1px solid var(--bg-subtle)", borderRadius:12, padding:10 }}>
              <div style={{ height:16, width:"48%", borderRadius:8, background:"var(--bg-subtle)", marginBottom:10 }} />
              <div style={{ height:72, borderRadius:10, background:"var(--bg-subtle)", marginBottom:8 }} />
              <div style={{ height:72, borderRadius:10, background:"var(--bg-subtle)", marginBottom:8 }} />
              <div style={{ height:72, borderRadius:10, background:"var(--bg-subtle)" }} />
            </div>
            <div style={{ border:"1px solid var(--bg-subtle)", borderRadius:12, padding:16 }}>
              <div style={{ height:18, width:"40%", borderRadius:8, background:"var(--bg-subtle)", marginBottom:12 }} />
              <div style={{ height:12, borderRadius:8, background:"var(--bg-subtle)", marginBottom:8 }} />
              <div style={{ height:12, borderRadius:8, background:"var(--bg-subtle)", marginBottom:8 }} />
              <div style={{ height:12, width:"82%", borderRadius:8, background:"var(--bg-subtle)" }} />
            </div>
            <div style={{ border:"1px solid var(--bg-subtle)", borderRadius:12, padding:12 }}>
              <div style={{ height:14, width:"60%", borderRadius:8, background:"var(--bg-subtle)", marginBottom:10 }} />
              <div style={{ height:180, borderRadius:10, background:"var(--bg-subtle)" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  const {
    fasesCompletadas, fasesCompletadasAcademicas, totalFasesAcademicas,
    fasesConContenido, fasesEnBorrador, totalWords,
    desgloseFases, hayBiblioGenerada, estimatedPages,
    documentUniversity, storedFinalDocument, documentoFinalListo,
    phaseContents, phaseLabels, documentTitle, docHtml,
  } = docComputed;

  // Early return DESPUÉS de TODOS los hooks (regla de React).
  if (!proyecto) return null;

  // Variables del componente — ahora sabemos que proyecto existe.
  const esGuiado = proyecto.modalidad_creacion === "guiada";
  const currentFaseDef = currentFaseDefForMemo!;
  const phaseId = phaseIdForMemo;
  const legacyNum = (currentFaseDef as typeof FASES_STATIC[0]).num;
  // 🎯 Cap 0 es una DECISIÓN (no documento). Las cards en el centro cubren todo.
  // Por eso ocultamos sidebar de feedback, panel PDF, tabs y botón "Cap. I →" en Cap 0.
  const isCap0Phase = phaseId === "ph-cap0" || (!isDynamic && legacyNum === 0);
  // 🛡️ ph-calidad reconvertida en Banco de Preguntas. NO genera contenido propio
  // (las preguntas se construyen al aprobar cada capítulo). Tratamos esta fase
  // como "no-generable" para que la UI esconda los botones que dispararían
  // una llamada inútil al endpoint genérico.
  const isBancoFase = phaseId === "ph-calidad";
  const finalContent = getFinalContent(proyecto, phaseId, legacyNum);
  const borradorContent = getBorrador(proyecto, phaseId, legacyNum);
  const hasBorrador = Boolean(borradorContent);
  const hasFinal = Boolean(finalContent);
  const displayContent = esGuiado
    ? (vistaActiva === "final" && hasFinal ? finalContent : (hasBorrador ? borradorContent : null))
    : finalContent;

  const needsUpdate = Boolean(proyecto.requiere_actualizacion?.[isDynamic ? phaseId : String(selectedFase)]);

  const panelBorder = "1px solid rgba(255, 255, 255, 0.4)";
  const panelBg = "rgba(255, 255, 255, 0.55)";
  const panelBlur = "blur(28px) saturate(180%)";
  const panelShadow = "0 4px 30px rgba(0, 0, 0, 0.05)";

  // 👁️ Modo de vista: admin (con herramientas técnicas) vs student (UI limpia).
  // Visibilidad del toggle:
  //   - role === "admin"  → siempre (producción)
  //   - email demo/test   → para QA con cuentas de prueba
  //   - localhost dev     → para desarrollo local
  // Los estudiantes finales reales JAMÁS ven el toggle ni herramientas técnicas.
  const isAdmin = user?.role === "admin";
  const isTestAccount = Boolean(user?.email && /demo|test|laboratorio\.test/i.test(user.email));
  const isDevHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const puedeVerToggle = isAdmin || isTestAccount || isDevHost;
  const mostrarHerramientasAdmin = puedeVerToggle && viewMode === "admin";

  // Inspector IA: solo se muestra si el user es admin/inspector Y está en modo "admin view"
  const showAIInspector = isInspectorUser(user) && mostrarHerramientasAdmin;
  const activeAI = proyecto.active_ai_config;
  const latestTrace = proyecto.academic_memory?.ai_trace?.[0] ?? null;
  const currentAIText = activeAI?.configured
    ? `${activeAI.provider_name || activeAI.provider_id} / ${activeAI.model}`
    : "IA sin configurar";

  // ── Calibration fullscreen ────────────────────────────────────────────────────

  if (showCalibracion) {
    const allOk = calibPreguntas.every(q => countWords(calibRespuestas[q.id] ?? "") >= q.minimo_palabras);
    return (
      <div style={{ height:"100vh", background:"transparent", color:"var(--fg-primary)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", overflow:"auto" }}>
        <div style={{ width:"100%", maxWidth:680 }}>
          <div style={{ marginBottom:28, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12, color:"#a78bfa" }}></div>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Calibración de Estilo</h1>
            <p style={{ color:"var(--fg-muted)", fontSize:14, lineHeight:1.6, maxWidth:480, margin:"0 auto" }}>
              Responde estas preguntas para que la IA aprenda tu estilo de escritura. Cuanto más detallado, más personalizado será el resultado.
            </p>
          </div>
          {proyecto.tema_aprobado && (
            <div style={{ padding:"10px 14px", background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:8, marginBottom:24, fontSize:13, color:"#a78bfa" }}>
              <strong>Tema:</strong> {proyecto.tema_aprobado}
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:20, marginBottom:28 }}>
            {calibPreguntas.map((q, i) => {
              const words = countWords(calibRespuestas[q.id] ?? "");
              const ok = words >= q.minimo_palabras;
              return (
                <div key={q.id} style={{ background:"rgba(255, 255, 255, 0.3)", border:"1px solid var(--border)", borderRadius:10, padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                    <span style={{ flexShrink:0, width:22, height:22, borderRadius:"50%", background:"rgba(167,139,250,0.15)", border:"1px solid rgba(167,139,250,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#a78bfa" }}>{i+1}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:q.descripcion?4:0 }}>{q.pregunta}</div>
                      {q.descripcion && <div style={{ fontSize:12, color:"var(--fg-muted)" }}>{q.descripcion}</div>}
                    </div>
                  </div>
                  <textarea
                    className="input-dark"
                    rows={4}
                    value={calibRespuestas[q.id] ?? ""}
                    onChange={e => setCalibRespuestas(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={q.placeholder || "Escribe tu respuesta aquí..."}
                    style={{ width:"100%", resize:"vertical", fontSize:13 }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:ok?"#22c55e":"var(--fg-muted)" }}>
                    <span>{words} / {q.minimo_palabras} palabras mínimas</span>
                    {ok && <span>✓ Suficiente</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setShowCalibracion(false)} className="btn-ghost" style={{ flex:1, justifyContent:"center", padding:"12px" }}>
              Omitir por ahora
            </button>
            <button onClick={submitCalibracion} disabled={!allOk || isAnalyzingStyle} className="btn-purple" style={{ flex:2, justifyContent:"center", padding:"12px", opacity:allOk?1:0.5 }}>
              {isAnalyzingStyle
                ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2 }}/><span>Analizando…</span></>
                : "🎓 Analizar mi estilo de escritura →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Plan-based feature flags ──────────────────────────────────────────────
  const userPlan = user?.plan ?? "estandar";
  const canUploadDocs  = userPlan === "pro"   || userPlan === "elite";
  const canEditPhases  = userPlan === "pro"   || userPlan === "elite";
  const canDefense     = userPlan === "elite";

  // ── 3-COLUMN WORKSPACE ────────────────────────────────────────────────────────

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display:"flex", flexDirection:"column", background:"transparent", color:"var(--fg-primary)", fontFamily:"'Inter', sans-serif" }}>

      {/* HEADER */}
      <header className="flex items-center flex-wrap gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-0 md:h-[52px] shrink-0 border-b relative z-40" style={{ background: panelBg, backdropFilter: panelBlur, WebkitBackdropFilter: panelBlur, borderBottom: panelBorder }}>
        <Link href="/dashboard" style={{ color:"var(--fg-muted)", textDecoration:"none", fontSize:18, lineHeight:1 }}>←</Link>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--fg-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {proyecto.tema_aprobado || proyecto.titulo_provisional || "Proyecto sin título"}
          </div>
          <div style={{ fontSize:11, color:"var(--fg-secondary)", display:"flex", alignItems:"center", gap:6, flexWrap: "wrap" }}>
            <span>{isPGProject ? "Proyecto de Grado" : (proyecto.servicios?.nombre ?? "Monografía")}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              {fasesCompletadasAcademicas === 0
                ? "Comenzando"
                : fasesCompletadasAcademicas === totalFasesAcademicas
                  ? "Completo ✓"
                  : `${fasesCompletadasAcademicas} de ${totalFasesAcademicas} capítulos`}
            </span>
            {/* Stats de páginas/palabras — solo admin. Para estudiantes
                "~76/70 págs · excede el límite" parece error y los confunde. */}
            {isAdmin && totalWords > 0 && (
              <>
                <span className="hidden sm:inline">·</span>
                <span style={{ position: "relative", display: "inline-block" }} className="hidden sm:inline">
                  <button
                    type="button"
                    onClick={() => setShowPagsDetail(v => !v)}
                    title="Ver desglose de páginas por sección"
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: estimatedPages >= 65 ? "#ef4444"
                        : estimatedPages >= 50 ? "#22c55e"
                        : estimatedPages >= 30 ? "#facc15"
                        : "var(--fg-secondary)",
                      fontWeight: estimatedPages >= 65 ? 700 : 400,
                      fontSize: "inherit",
                      textDecoration: "underline dotted",
                      textUnderlineOffset: 3,
                    }}
                  >
                    ~{estimatedPages}/70 págs · {totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords} palabras
                    {estimatedPages >= 70 && <span style={{ marginLeft: 6 }}>⚠️ excede el límite</span>}
                  </button>
                  {showPagsDetail && (
                    <>
                      <div onClick={() => setShowPagsDetail(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />
                      <div style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 999,
                        minWidth: 280, padding: "12px 14px", borderRadius: 10,
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-md)",
                        fontSize: 11.5, lineHeight: 1.6, color: "var(--fg-primary)",
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)" }}>
                          Desglose de páginas
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--fg-secondary)" }}>
                          <span>Carátula + índice</span>
                          <span style={{ fontVariantNumeric: "tabular-nums" }}>{PAGS_FIJAS_CARATULA + PAGS_FIJAS_INDICE} págs</span>
                        </div>
                        {desgloseFases.map(d => (
                          <div key={d.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                            <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(d.pags + 1)} págs</span>
                          </div>
                        ))}
                        {!hayBiblioGenerada && (
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, color: "var(--fg-secondary)", fontStyle: "italic" }}>
                            <span>Bibliografía (estimada)</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>~{PAGS_FIJAS_BIBLIO_DEFAULT} págs</span>
                          </div>
                        )}
                        <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                          <span>Total estimado</span>
                          <span style={{ fontVariantNumeric: "tabular-nums", color: estimatedPages >= 65 ? "#ef4444" : "var(--fg-primary)" }}>
                            {estimatedPages}/70 págs
                          </span>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 10.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>
                          Incluye carátula, índice, contenido, hojas por cambio de capítulo y bibliografía. Cap 0 (Tema) no cuenta porque no va al PDF.
                        </div>
                      </div>
                    </>
                  )}
                </span>
              </>
            )}
            {/* Badges técnicos solo en vista admin */}
            {mostrarHerramientasAdmin && esGuiado && <span style={{ padding:"1px 6px", borderRadius:4, background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.25)", color:"#a78bfa", fontSize:10, fontWeight:600 }}>GUIADO</span>}
            {mostrarHerramientasAdmin && esGuiado && proyecto.perfil_estilo_usuario && <span style={{ padding:"1px 6px", borderRadius:4, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", color:"#4ade80", fontSize:10 }}>✓ Estilo calibrado</span>}
            {isRefreshing && (
              <span style={{ padding:"1px 6px", borderRadius:4, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.25)", color:"#60a5fa", fontSize:10 }}>
                Actualizando...
              </span>
            )}
            {showAIInspector && (
              <span
                title="Inspector IA visible solo para admin y usuario demo"
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: activeAI?.configured ? "rgba(37,99,235,0.12)" : "rgba(245,158,11,0.12)",
                  border: activeAI?.configured ? "1px solid rgba(37,99,235,0.28)" : "1px solid rgba(245,158,11,0.32)",
                  color: activeAI?.configured ? "var(--accent)" : "#d97706",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                IA activa: {currentAIText}
              </span>
            )}
          </div>
        </div>

        {/* Phase dots — ocultos para PG (la navegación está en el sidebar del Col 1) */}
        {isPGProject ? (
          /* Proyecto de Grado: indicador compacto de progreso en el header */
          <div
            className="flex items-center gap-2 order-last md:order-none py-1 md:py-0 border-t border-[var(--bg-subtle)] md:border-t-0 mt-1 md:mt-0"
          >
            {(() => {
              const totalFases = displayFases.length;
              const completadas = displayFases.filter((f) =>
                Boolean(getFinalContent(proyecto, f.id, (f as typeof FASES_STATIC[0]).num))
              ).length;
              const enBorrador = displayFases.filter((f) =>
                !getFinalContent(proyecto, f.id, (f as typeof FASES_STATIC[0]).num) &&
                Boolean(getBorrador(proyecto, f.id, (f as typeof FASES_STATIC[0]).num))
              ).length;
              const pct = Math.round((completadas / totalFases) * 100);
              return (
                <button
                  onClick={() => setShowPhaseNav((v) => !v)}
                  title={showPhaseNav ? "Cerrar navegación de fases" : "Abrir navegación de fases"}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: showPhaseNav ? "rgba(37,99,235,0.12)" : "rgba(148,163,184,0.08)",
                    border: `1px solid ${showPhaseNav ? "rgba(37,99,235,0.35)" : "rgba(148,163,184,0.2)"}`,
                    borderRadius: 8, padding: "4px 10px", cursor: "pointer",
                    color: "var(--fg-primary)", fontSize: 11, fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{showPhaseNav ? "✕" : "≡"}</span>
                  <span>
                    <span style={{ color: "#4ade80", fontWeight: 700 }}>{completadas}</span>
                    {enBorrador > 0 && <span style={{ color: "#a78bfa" }}>+{enBorrador}</span>}
                    <span style={{ color: "var(--fg-muted)" }}> / {totalFases} fases</span>
                  </span>
                  {/* Mini barra de progreso */}
                  <span style={{ width: 48, height: 4, borderRadius: 99, background: "rgba(148,163,184,0.2)", overflow: "hidden", display: "inline-block" }}>
                    <span style={{ display: "block", height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#2563eb,#4ade80)", borderRadius: 99, transition: "width 0.4s" }} />
                  </span>
                </button>
              );
            })()}
          </div>
        ) : (
          /* Monografías / otros: dots originales */
          <div className="flex gap-1 md:gap-1.5 items-center overflow-x-auto no-scrollbar w-full md:w-auto order-last md:order-none py-1 md:py-0 border-t border-[var(--bg-subtle)] md:border-t-0 mt-1 md:mt-0">
            {(() => {
              // Buscamos el índice de la PRIMERA fase técnica para insertar un separador visual ⚙
              const firstTecnicaIdx = displayFases.findIndex(f => isPhaseTecnica(f.id));
              return displayFases.map((f, idx) => {
                const fId = f.id;
                const done = Boolean(getFinalContent(proyecto, fId, (f as typeof FASES_STATIC[0]).num));
                const hasBorr = Boolean(getBorrador(proyecto, fId, (f as typeof FASES_STATIC[0]).num));
                const needsUpd = Boolean(proyecto.requiere_actualizacion?.[isDynamic ? fId : String(idx)]);
                const sel = idx === selectedFase;
                const esTecnica = isPhaseTecnica(fId);
                // Insertar un separador antes de la primera fase técnica
                const showSep = firstTecnicaIdx >= 0 && idx === firstTecnicaIdx && idx > 0;
                const tituloTooltip = esTecnica
                  ? `${f.label} — ⚙️ Proceso automático (se genera al finalizar)`
                  : f.label + (needsUpd ? " — ⚠️ Desactualizado" : "");
                return (
                  <span key={f.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {showSep && (
                      <span
                        title="Procesos finales automáticos (LaTeX, banco de preguntas, bibliografía)"
                        style={{
                          fontSize: 11, color: "var(--fg-muted)", padding: "0 4px",
                          opacity: 0.6, fontWeight: 700, letterSpacing: 1,
                        }}
                      >
                        ·⚙·
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedFase(idx)}
                      title={tituloTooltip}
                      className="shrink-0"
                      style={{
                        width:26, height:26, borderRadius:"50%", fontSize:9, fontWeight:700, cursor:"pointer",
                        border: sel ? "2px solid var(--accent)" : needsUpd ? "2px solid #f59e0b" : done ? "2px solid #22c55e" : hasBorr ? "2px solid #a78bfa" : "2px solid var(--border)",
                        background: sel ? "rgba(37,99,235,0.2)" : needsUpd ? "rgba(245,158,11,0.1)" : done ? "rgba(34,197,94,0.08)" : "transparent",
                        color: sel ? "var(--accent)" : needsUpd ? "#f59e0b" : done ? "#4ade80" : hasBorr ? "#a78bfa" : "var(--fg-secondary)",
                        display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
                        // Las fases técnicas se atenúan (queda claro que son "automáticas")
                        opacity: esTecnica && !sel ? 0.45 : 1,
                      }}
                    >
                      {needsUpd ? "!" : done ? "✓" : hasBorr ? "~" : esTecnica ? "⚙" : idx}
                    </button>
                  </span>
                );
              });
            })()}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Botón principal para el ESTUDIANTE: documento web limpio listo para Word.
              Se muestra siempre que haya al menos una fase con contenido. */}
          {(fasesCompletadas > 0 || fasesConContenido > 0) && (
            <a
              href={`/projects/${proyectoId}/documento-web`}
              className="btn-primary"
              style={{ fontSize:11, padding:"6px 12px", gap:5, display:"flex", alignItems:"center", textDecoration:"none", fontWeight:700, background:"#059669", color:"#fff", borderRadius:8 }}
              title="Mi documento armado listo para copiar al Word"
            >
              <span>📖</span><span>Ver mi documento</span>
            </a>
          )}
          {/* Link a la página /documento — SOLO ADMIN.
              Vista técnica con LaTeX/PDF/Q&A. El estudiante ve la vista web limpia. */}
          {mostrarHerramientasAdmin && (fasesCompletadas > 0 || fasesConContenido > 0) && (
            <a
              href={`/projects/${proyectoId}/documento?from=${encodeURIComponent(phaseId)}`}
              className="btn-cyan"
              style={{ fontSize:11, padding:"6px 12px", gap:5, display:"flex", alignItems:"center", textDecoration:"none", fontWeight:600 }}
              title="Solo admin: vista previa LaTeX/PDF + Q&A con IA"
            >
              <span>🔧</span><span>Vista técnica</span><span style={{ fontSize:9, opacity:0.7, fontWeight:500 }}>· admin</span>
            </a>
          )}
          {mostrarHerramientasAdmin && (
            <button
              onClick={() => setShowPdfPanel(v => !v)}
              className="btn-ghost"
              style={{ fontSize:10.5, padding:"5px 10px", gap:4, display:"flex", alignItems:"center", opacity:0.7 }}
              title="Admin: mostrar/ocultar panel de preview lateral"
            >
              {showPdfPanel ? "✕ Preview" : "👁 Preview"}
            </button>
          )}
          {/* 🔄 Regenerar fase actual — SOLO ADMIN, SIEMPRE visible cuando hay contenido.
              Resuelve el caso donde los botones admin internos están ocultos por
              flags como esGuiado/hasFinal. Útil para forzar regeneración aplicando
              prompts nuevos (ej. fortalecimiento analítico). */}
          {mostrarHerramientasAdmin && !isCap0Phase && (hasFinal || hasBorrador) && (
            <button
              onClick={async () => {
                const fase = displayFases[selectedFase];
                const label = fase?.label ?? phaseId;
                const ok = window.confirm(
                  `¿Regenerar "${label}" desde cero?\n\n` +
                  `• Borra el contenido actual de esta fase\n` +
                  `• Vuelve a llamar a la IA con los prompts más nuevos\n` +
                  `• Si la fase es analítica (Cap IV, PESTEL, etc.), la nueva versión incluirá tablas + gráficos pgfplots\n\n` +
                  `Esto gasta tokens de IA y NO se puede deshacer. ¿Procedo?`
                );
                if (!ok) return;
                try {
                  await resetearFaseAdmin();
                  // Tras reset, lanzar generación nueva inmediatamente
                  setTimeout(() => generarFase({ tipo: "borrador" }), 300);
                } catch (e) {
                  alert(`Error: ${e instanceof Error ? e.message : "desconocido"}`);
                }
              }}
              disabled={isGenerating}
              className="btn-ghost"
              style={{
                fontSize: 11,
                padding: "6px 12px",
                gap: 5,
                display: "flex",
                alignItems: "center",
                background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.35)",
                color: "#a78bfa",
                fontWeight: 700,
                cursor: isGenerating ? "wait" : "pointer",
                opacity: isGenerating ? 0.5 : 1,
              }}
              title="Borra y regenera esta fase aplicando los prompts más nuevos. Sirve para activar fortalecimiento analítico en fases viejas."
            >
              🔄 Regenerar fase <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 500 }}>· admin</span>
            </button>
          )}
          {/* Botón .tex — descarga LaTeX crudo. Solo admin: un estudiante
              no sabe qué es .tex. El estudiante baja el documento desde la
              vista "Compilar LaTeX" cuando termina su proyecto. */}
          {isAdmin && fasesCompletadas > 0 && (
            <button onClick={descargarLatex} disabled={isDownloading} className="btn-ghost" style={{ fontSize:11, padding:"5px 10px", display:"flex", alignItems:"center", gap:4 }}>
              {isDownloading ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/> : "⬇️"}<span>.tex</span>
            </button>
          )}
          {/* Botón Bitácora del header — solo admin: el estudiante ya tiene
              el tab "Bitácora" en el sidebar del COL 1. Este es un duplicado
              que confunde. Para admin lo mantenemos por el atajo a la versión
              imprimible (Ctrl+P). */}
          {isAdmin && fasesCompletadas > 0 && (
            <a
              href={`/api/projects/${proyectoId}/bitacora/imprimible`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              style={{ fontSize:11, padding:"5px 10px", display:"flex", alignItems:"center", gap:4, textDecoration:"none", color:"#6366f1", borderColor:"rgba(99,102,241,0.4)" }}
              title="Bitácora del Tutor: todas las observaciones aplicadas y rechazadas con su justificación. Ctrl+P para guardar como PDF."
            >
              📋 <span>Bitácora</span>
            </a>
          )}
          {fasesCompletadas >= 2 && (
            <Link href={`/projects/${proyectoId}/defensa`} className="btn-ghost" style={{ fontSize:11, padding:"5px 10px", display:"flex", alignItems:"center", gap:4, textDecoration:"none" }} title="Simula tu defensa oral con IA">
              ⚖️ <span>Defensa</span>
            </Link>
          )}
          {user?.role === "admin" && (
            <>
              {/* 🎚️ Switch de plan en caliente (solo admin). Cambia qué plan
                  ve el workspace SIN crear proyecto nuevo ni perder avance. */}
              <AdminPlanSwitcher currentPlan={user.plan ?? "pro"} />
              <Link href="/admin" className="btn-purple" style={{ padding:"5px 10px", fontSize:11, display:"flex", alignItems:"center", gap:4, textDecoration:"none" }}>
                ⚡ Admin
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* 3-COLUMN BODY */}
      <style>{`
        .workspace-three-pane {
          display: flex;
          flex-direction: column;
        }
        .workspace-main-column {
          min-width: 0;
        }
        .workspace-editor-inner {
          width: 100%;
          max-width: 920px;
          margin: 0 auto;
        }
        /* ── Móvil/tablet (CSS): apila las columnas en viewport pequeño ── */
        @media (max-width: 1279.98px) {
          .workspace-three-pane {
            display: flex !important;
            flex-direction: column !important;
          }
          .workspace-three-pane > div {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0;
          }
          .workspace-editor-inner {
            padding-left: 16px;
            padding-right: 16px;
          }
          .md-p, .md-li, .md-h1, .md-h2, .md-h3, .md-h4, .md-blockquote {
            overflow-wrap: anywhere;
            word-break: normal;
          }
        }
        /* ── Móvil detectado por JS (UA): override TOTAL, independiente del viewport.
           Necesario porque PWA standalone en algunos Android reporta viewport
           ≥1280 lógico aunque la pantalla física sea de teléfono, y entonces
           el grid de 3 columnas se activa y comprime el contenido a ~80px. */
        .workspace-three-pane.is-mobile-device,
        .workspace-three-pane.is-mobile-device * {
          /* Forzar viewport útil */
        }
        .workspace-three-pane.is-mobile-device {
          display: flex !important;
          flex-direction: column !important;
          grid-template-columns: none !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
        }
        .workspace-three-pane.is-mobile-device > div {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          flex-basis: auto !important;
        }
        .workspace-three-pane.is-mobile-device .workspace-editor-inner {
          padding-left: 16px !important;
          padding-right: 16px !important;
          max-width: 100% !important;
        }
        .workspace-three-pane.is-mobile-device .md-p,
        .workspace-three-pane.is-mobile-device .md-li,
        .workspace-three-pane.is-mobile-device .md-h1,
        .workspace-three-pane.is-mobile-device .md-h2,
        .workspace-three-pane.is-mobile-device .md-h3,
        .workspace-three-pane.is-mobile-device .md-h4,
        .workspace-three-pane.is-mobile-device .md-blockquote {
          overflow-wrap: anywhere !important;
          word-break: normal !important;
          hyphens: auto;
        }
        @media (min-width: 1280px) {
          .workspace-three-pane {
            display: grid;
            grid-template-columns: minmax(320px, 360px) minmax(0, 1fr) clamp(380px, 22vw, 500px);
            overflow: hidden;
          }
        }
        @media (min-width: 1600px) {
          .workspace-three-pane {
            grid-template-columns: minmax(320px, 360px) minmax(0, 1fr) clamp(400px, 22vw, 520px);
          }
          .workspace-editor-inner {
            max-width: 1000px;
          }
        }
        @media (min-width: 1920px) {
          .workspace-three-pane {
            grid-template-columns: minmax(340px, 380px) minmax(0, 1fr) clamp(440px, 23vw, 560px);
          }
          .workspace-editor-inner {
            max-width: 1180px;
          }
        }
      `}</style>

      <div
        className={`workspace-three-pane flex-1 overflow-y-auto xl:overflow-hidden relative w-full ${isMobileDevice ? "is-mobile-device" : ""}`}
        style={
          isMobileDevice
            ? {
                display: "flex",
                flexDirection: "column",
                gridTemplateColumns: "none",
                overflowX: "hidden",
                overflowY: "auto",
                width: "100vw",
                maxWidth: "100vw",
              }
            : undefined
        }
      >

        {/* ── COL 1: CHAT & GENERATION (fixed 360px on desktop) ── */}
        <div
          className="w-full xl:w-auto shrink-0 flex flex-col border-b xl:border-b-0 relative z-40 min-h-[500px] xl:min-h-0"
          style={{
            background: panelBg, backdropFilter: panelBlur, WebkitBackdropFilter: panelBlur, borderRight: panelBorder, boxShadow: panelShadow,
            // En móvil, forzar 100% width — bypassa el xl:w-auto de Tailwind si el
            // viewport reporta >=1280 lógico aunque sea un teléfono físicamente.
            ...(isMobileDevice ? { width: "100%", maxWidth: "100%", minWidth: 0, flexBasis: "auto" } : {}),
          }}
        >
          {/* UPPER SCROLLABLE AREA */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            
            {/* Phase label — para PG es un toggle que abre la navegación de 23 fases */}
            {isPGProject ? (
              <button
                onClick={() => setShowPhaseNav((v) => !v)}
                title={showPhaseNav ? "Cerrar navegación de fases" : "Ver todas las fases del proyecto"}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(148,163,184,0.18)",
                  flexShrink: 0,
                  background: showPhaseNav ? "rgba(37,99,235,0.08)" : "transparent",
                  border: "none",
                  borderLeft: showPhaseNav ? "3px solid var(--accent)" : "3px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize:10, color:"var(--accent)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:3 }}>{currentFaseDef.short}</div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:"var(--fg-primary)", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{currentFaseDef.label}</div>
                </div>
                <span style={{ fontSize: 14, color: "var(--fg-muted)", flexShrink: 0, fontWeight: 700 }}>
                  {showPhaseNav ? "▲" : "☰"}
                </span>
              </button>
            ) : (
              <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(148,163,184,0.18)", flexShrink: 0 }}>
                <div style={{ fontSize:11, color:"var(--accent)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{currentFaseDef.short}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--fg-primary)", lineHeight:1.35 }}>{currentFaseDef.label}</div>
              </div>
            )}

            {/* PG — sidebar de navegación: se superpone sobre el contenido del col cuando está abierto.
                IMPORTANTE: fondo OPACO (var(--bg-base)) para tapar el chat de observaciones que
                está detrás. Antes usaba panelBg (alpha 0.55) y se veía el chat translucido a través. */}
            {isPGProject && showPhaseNav && (
              <div
                className="pg-sidebar-overlay"
                style={{
                  // En móvil: position:fixed para cubrir TODO el viewport
                  // (el overlay no depende del width del padre).
                  // En desktop: absolute como antes para superponerse sobre COL 1.
                  position: isMobileDevice ? "fixed" : "absolute",
                  top: isMobileDevice ? 96 : 63,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: isMobileDevice ? "100vw" : undefined,
                  maxWidth: isMobileDevice ? "100vw" : undefined,
                  zIndex: 50,
                  background: "var(--bg-base)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderTop: "1px solid rgba(148,163,184,0.18)",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
                }}
              >
                <PGPhaseSidebar
                  phases={phaseDefs}
                  selectedIndex={selectedFase}
                  phaseContents={proyecto.phase_contents ?? {}}
                  onSelect={(idx) => {
                    setSelectedFase(idx);
                    setShowPhaseNav(false);
                  }}
                />
              </div>
            )}

            {showAIInspector && (
              <div
                style={{
                  margin: "10px 14px",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(15,23,42,0.04)",
                  border: "1px solid rgba(37,99,235,0.22)",
                  fontSize: 11,
                  color: "var(--fg-primary)",
                  lineHeight: 1.45,
                  flexShrink: 0,
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"center", marginBottom:5 }}>
                  <strong style={{ color:"var(--accent)", fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase" }}>Inspector IA</strong>
                  <span style={{ color: activeAI?.configured ? "#16a34a" : "#d97706", fontWeight:800 }}>
                    {activeAI?.configured ? "CONFIGURADA" : "SIN CONFIG"}
                  </span>
                </div>
                <div><strong>Usara:</strong> {currentAIText}</div>
                <div style={{ marginTop:3, color:"var(--fg-secondary)" }}>Sin cambio automatico a otra API.</div>
                {latestTrace ? (
                  <div style={{ marginTop:4, color:"var(--fg-secondary)" }}>
                    <strong>Ultima llamada:</strong> {latestTrace.provider_name || latestTrace.provider_id} / {latestTrace.model}
                    {" · "}{latestTrace.status}
                    {" · "}{formatTraceTime(latestTrace.timestamp)}
                  </div>
                ) : (
                  <div style={{ marginTop:4, color:"var(--fg-secondary)" }}>Aun no hay llamadas registradas en este proyecto.</div>
                )}
              </div>
            )}

            {/* En la fase final ph-latex, para el ALUMNO mostramos solo un
                aviso amigable apuntando al documento web. Los tabs técnicos
                (chat de generación, fuentes, tribunal, bitácora, cuadernillo)
                los ocultamos aquí — el alumno los tuvo en las fases anteriores
                cuando los necesitaba. Admin SIGUE viendo todo en esta fase. */}
            {phaseId === "ph-latex" && !mostrarHerramientasAdmin && (hasBorrador || hasFinal) && (
              <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", textAlign: "center" }}>
                <div style={{ fontSize: 40 }}>📖</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)", lineHeight: 1.4 }}>
                  Tu documento está armado
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }}>
                  Mira el centro de la pantalla y aprieta el botón verde
                  para verlo completo y copiarlo al Word.
                </div>
                <div style={{ marginTop: 6, padding: "8px 12px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 8, fontSize: 11, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
                  Si necesitas hacer cambios al contenido, vuelve a la
                  fase del capítulo que quieras editar usando el menú de
                  fases de arriba.
                </div>
              </div>
            )}

            {/* TABS — etiquetas claras para el estudiante. Las tabs que no
                puede usar por su plan se OCULTAN (no se muestran con candado:
                eso confunde y suma ruido visual). Admin siempre ve todo.
                En ph-latex se ocultan al alumno (ya tiene el aviso de arriba). */}
            {!isCap0Phase && (hasBorrador || hasFinal) && !(phaseId === "ph-latex" && !mostrarHerramientasAdmin) && (
              <div style={{ display: "flex", borderBottom: "1px solid rgba(148,163,184,0.18)", flexShrink: 0 }}>
                <button
                  onClick={() => setCol1Tab("generacion")}
                  title="Generar, regenerar o dar feedback al contenido"
                  style={{ flex: 1, padding: "10px", fontSize: 11, fontWeight: 700, color: col1Tab === "generacion" ? "var(--accent)" : "var(--fg-secondary)", borderBottom: col1Tab === "generacion" ? "2px solid var(--accent)" : "2px solid transparent", background: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                >
                  Generar
                </button>
                {(canUploadDocs || isAdmin) && (
                  <button
                    onClick={() => setCol1Tab("fuentes")}
                    title="Subir PDFs, papers o normativa adicional para que la IA los considere"
                    style={{ flex: 1, padding: "10px", fontSize: 11, fontWeight: 700, color: col1Tab === "fuentes" ? "var(--accent)" : "var(--fg-secondary)", borderBottom: col1Tab === "fuentes" ? "2px solid var(--accent)" : "2px solid transparent", background: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                  >
                    Material
                  </button>
                )}
                {/* "Tutor": solo después de Cap V Y solo si plan Elite (canDefense).
                    Plan inferior NO la ve (en vez de mostrarla con candado). */}
                {selectedFase >= 5 && (canDefense || isAdmin) && (
                  <button
                    onClick={() => setCol1Tab("tribunal")}
                    title="Registrar observaciones del tutor o tribunal"
                    style={{ flex: 1, padding: "10px", fontSize: 11, fontWeight: 700, color: col1Tab === "tribunal" ? "#f59e0b" : "var(--fg-secondary)", borderBottom: col1Tab === "tribunal" ? "2px solid #f59e0b" : "2px solid transparent", background: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                  >
                    Tutor
                  </button>
                )}
                <button
                  onClick={() => setCol1Tab("bitacora")}
                  title="Historial de observaciones del tutor con su análisis y respuesta"
                  style={{ flex: 1, padding: "10px", fontSize: 11, fontWeight: 700, color: col1Tab === "bitacora" ? "#6366f1" : "var(--fg-secondary)", borderBottom: col1Tab === "bitacora" ? "2px solid #6366f1" : "2px solid transparent", background: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                >
                  Historial
                </button>
                <button
                  onClick={() => setCol1Tab("cuadernillo")}
                  title="Análisis de la fase: sugerencias, datos a buscar, preguntas probables del tutor"
                  style={{ flex: 1, padding: "10px", fontSize: 11, fontWeight: 700, color: col1Tab === "cuadernillo" ? "#a855f7" : "var(--fg-secondary)", borderBottom: col1Tab === "cuadernillo" ? "2px solid #a855f7" : "2px solid transparent", background: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                >
                  Análisis
                </button>
                {canDefense && (
                  <button
                    onClick={() => setCol1Tab("defensa")}
                    title="Diapositivas, podcast y guión para tu defensa oral"
                    style={{ flex: 1, padding: "10px", fontSize: 11, fontWeight: 700, color: col1Tab === "defensa" ? "#10b981" : "var(--fg-secondary)", borderBottom: col1Tab === "defensa" ? "2px solid #10b981" : "2px solid transparent", background: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                  >
                    🎓 Defensa
                  </button>
                )}
              </div>
            )}

            {col1Tab === "generacion" && !(phaseId === "ph-latex" && !mostrarHerramientasAdmin) && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Warnings */}
                {needsUpdate && (
                  <div style={{ margin:"10px 14px 0", padding:"10px 12px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.24)", borderRadius:10, fontSize:12, color:"#fbbf24", lineHeight:1.5 }}>
                    ⚠️ Una fase anterior fue modificada. Regenera para mantener coherencia.
                  </div>
                )}
                {error && (
                  <div style={{ margin:"8px 14px 0", padding:"8px 12px", background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:6, fontSize:11, color:"#f87171", display:"flex", justifyContent:"space-between" }}>
                    <span style={{ flex:1, lineHeight:1.5 }}>{error}</span>
                    <button onClick={() => setError("")} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer" }}>×</button>
                  </div>
                )}

                {/* ── Generate buttons block ──
                    🛡️ En la fase Banco de Preguntas (ph-calidad reciclada) NO mostramos
                    este bloque: las preguntas se generan al aprobar cada capítulo y
                    el componente <BancoPreguntasView> tiene su propio botón para
                    regenerar fases pendientes. Mostrar "Generar borrador" aquí llevaría
                    al estudiante a gastar tokens al pedo. */}
          {!isBancoFase && (
          <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(148,163,184,0.18)", display:"flex", flexDirection:"column", gap:10 }}>
            {/* GUIADO: no borrador yet */}
              {esGuiado && !hasBorrador && !hasFinal && (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => generarFase({ tipo:"borrador" })} disabled={isGenerating} className="btn-purple" style={{ flex:1, justifyContent:"center", padding:"10px", fontSize:12 }}>
                    {isGenerating ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/><span>Generando borrador…</span></> : `Generar Borrador — ${currentFaseDef.short}`}
                  </button>
                  {isGenerating && (
                    <button onClick={cancelGeneracion} className="btn-ghost" style={{ padding:"10px 16px", fontSize:11, color:"#ef4444" }}>
                      Cancelar
                    </button>
                  )}
                </div>
              )}

            {/* GUIADO: has borrador, needs final — oculto en Cap 0 (las cards manejan la decisión) */}
            {esGuiado && hasBorrador && !hasFinal && !isCap0Phase && (() => {
              const palabras = displayContent ? countWords(displayContent) : 0;
              const palabrasFmt = palabras.toLocaleString("es");
              return (
                <>
                  <div style={{ fontSize:11, color:"#22c55e", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span>✓ Borrador listo</span>
                    {palabras > 0 && (
                      <span style={{ fontSize:10, color:"var(--fg-muted)", fontWeight:600, letterSpacing:"0.02em", textTransform:"none" }}>
                        · {palabrasFmt} palabras
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:11.5, color:"var(--fg-muted)", lineHeight:1.5 }}>
                    {canEditPhases
                      ? "Lee el contenido. Si está bien, aprueba y avanzá. Si tu tutor te dio observaciones, escribilas abajo y la IA las aplicará."
                      : "Lee el contenido. En Plan Estándar la IA genera y tú apruebas. Para correcciones con IA, actualizá a Plan Pro."}
                  </div>
                {canEditPhases && (
                <textarea
                  className="input-dark"
                  rows={2}
                  value={feedbackTexto}
                  onChange={e => setFeedbackTexto(e.target.value)}
                  placeholder="Ej: Mi tutor pidió ampliar los antecedentes y ajustar el tono…"
                  style={{ resize:"vertical", fontSize:12, lineHeight:1.5 }}
                />
                )}

                {/* Botón principal: cambia según haya o no feedback */}
                {canEditPhases && feedbackTexto.trim() ? (
                  // CON feedback: aplicar cambios con IA
                  <div style={{ display:"flex", gap:7 }}>
                    <button
                      onClick={() => generarFase({ tipo:"final", feedback: feedbackTexto || undefined })}
                      disabled={isGenerating}
                      style={{
                        flex:1, justifyContent:"center", padding:"10px", fontSize:11.5, fontWeight:700,
                        borderRadius:8, border:"none",
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        color: "white", cursor: isGenerating ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(99,102,241,0.32)",
                        opacity: isGenerating ? 0.6 : 1,
                      }}
                    >
                      {isGenerating ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/><span>Aplicando cambios…</span></> : "✨ Aplicar cambios y generar final"}
                    </button>
                    {isGenerating ? (
                      <button onClick={cancelGeneracion} className="btn-ghost" style={{ padding:"9px 11px", fontSize:11, color:"#ef4444" }}>
                        Cancelar
                      </button>
                    ) : (
                      <button
                        onClick={() => generarFase({ tipo:"borrador" })}
                        className="btn-ghost"
                        style={{ padding:"9px 11px", fontSize:11 }}
                        title="Generar otra versión desde cero. La IA producirá una alternativa nueva. El contenido actual se reemplazará."
                      >🔄</button>
                    )}
                  </div>
                ) : (
                  // SIN feedback: aprobar como está, sin llamar a IA, avanzar
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <button
                      onClick={aprobarBorradorComoFinal}
                      disabled={isGenerating}
                      style={{
                        width:"100%", padding:"11px", fontSize:12, fontWeight:700,
                        borderRadius:8, border:"none",
                        background: "linear-gradient(135deg, #4ade80, #22c55e)",
                        color: "white", cursor: isGenerating ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(34,197,94,0.32)",
                        opacity: isGenerating ? 0.5 : 1,
                      }}
                    >
                      ✓ Aprobar y continuar al siguiente capítulo
                    </button>
                    {canEditPhases && (
                    <div style={{ display:"flex", gap:7 }}>
                      <button
                        onClick={() => generarFase({ tipo:"borrador" })}
                        disabled={isGenerating}
                        className="btn-ghost"
                        style={{ flex:1, padding:"8px", fontSize:11, justifyContent:"center" }}
                        title="La IA producirá una alternativa desde cero. El contenido actual se reemplazará."
                      >
                        🔄 No me convence, generar otra versión
                      </button>
                    </div>
                    )}
                    {/* Reset total — SOLO ADMIN. Borra todo el contenido de la fase. */}
                    {mostrarHerramientasAdmin && (
                      <button
                        onClick={resetearFaseAdmin}
                        disabled={isGenerating}
                        title="Solo admin: borra todo el contenido de esta fase (borrador y anteriores) para empezar de cero."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px dashed rgba(239,68,68,0.4)",
                          background: "rgba(239,68,68,0.04)",
                          color: "#ef4444",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: isGenerating ? "not-allowed" : "pointer",
                          opacity: isGenerating ? 0.5 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        🗑️ Borrar todo y empezar de nuevo <span style={{ fontSize:9, opacity:0.7, fontWeight:500 }}>· admin</span>
                      </button>
                    )}
                  </div>
                )}
              </>
              );
            })()}

            {/* GUIADO: has final — vista toggle + revertir si existe versión anterior */}
            {esGuiado && hasFinal && !isCap0Phase && (() => {
              const phaseContents = (proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>;
              const keyAnterior = vistaActiva === "final" ? `${phaseId}_anterior` : `${phaseId}_borrador_anterior`;
              const hayAnterior = Boolean(phaseContents[keyAnterior]?.trim());
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => setVistaActiva("borrador")} style={{ flex:1, padding:"7px", fontSize:10, fontWeight:600, borderRadius:6, cursor:"pointer", background: vistaActiva==="borrador"?"rgba(167,139,250,0.15)":"transparent", border: vistaActiva==="borrador"?"1px solid rgba(167,139,250,0.4)":"1px solid var(--border)", color: vistaActiva==="borrador"?"#a78bfa":"var(--fg-secondary)" }}>📝 Borrador</button>
                    <button onClick={() => setVistaActiva("final")} style={{ flex:1, padding:"7px", fontSize:10, fontWeight:600, borderRadius:6, cursor:"pointer", background: vistaActiva==="final"?"rgba(37,99,235,0.15)":"transparent", border: vistaActiva==="final"?"1px solid rgba(37,99,235,0.4)":"1px solid var(--border)", color: vistaActiva==="final"?"var(--accent)":"var(--fg-secondary)" }}>✨ Final</button>
                  </div>
                  {hayAnterior && (
                    <button
                      onClick={revertirAlAnterior}
                      disabled={isGenerating}
                      title="Restaura la versión anterior. Los cambios actuales se descartarán."
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(245,158,11,0.35)",
                        background: "rgba(245,158,11,0.08)",
                        color: "#f59e0b",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: isGenerating ? "not-allowed" : "pointer",
                        opacity: isGenerating ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      ↩️ No me gusta, volver a la versión anterior
                    </button>
                  )}
                  {/* Regenerar desde cero — SOLO ADMIN / cuenta de prueba.
                      No es flujo de estudiante: ya aprobó, debe avanzar o usar chat de cambios. */}
                  {mostrarHerramientasAdmin && (
                    <button
                      onClick={() => {
                        const ok = window.confirm(
                          "¿Generar una versión nueva de este capítulo?\n\n" +
                          "• La versión Final actual se guardará como \"anterior\" (puedes volver con ↩️).\n" +
                          "• La IA generará un borrador nuevo desde cero.\n" +
                          "• Tu Final aprobado actual NO se descarta hasta que apruebes el nuevo.\n\n" +
                          "Esto gasta tokens de IA. ¿Procedo?"
                        );
                        if (ok) generarFase({ tipo: "borrador" });
                      }}
                      disabled={isGenerating}
                      title="Solo para admin / cuenta de prueba: regenera el capítulo desde cero conservando la versión actual como respaldo."
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: "1px dashed rgba(167,139,250,0.5)",
                        background: "rgba(167,139,250,0.06)",
                        color: "#a78bfa",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: isGenerating ? "not-allowed" : "pointer",
                        opacity: isGenerating ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      🔄 Generar otra versión <span style={{ fontSize:9, opacity:0.7, fontWeight:500 }}>· admin</span>
                    </button>
                  )}
                  {/* Reset total — SOLO ADMIN. Borra todo el contenido de la fase. */}
                  {mostrarHerramientasAdmin && (
                    <button
                      onClick={resetearFaseAdmin}
                      disabled={isGenerating}
                      title="Solo admin: borra todo el contenido de esta fase (borrador, final, anteriores) para empezar de cero."
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px dashed rgba(239,68,68,0.4)",
                        background: "rgba(239,68,68,0.04)",
                        color: "#ef4444",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: isGenerating ? "not-allowed" : "pointer",
                        opacity: isGenerating ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      🗑️ Borrar todo y empezar de nuevo <span style={{ fontSize:9, opacity:0.7, fontWeight:500 }}>· admin</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* DIRECTO: no final yet */}
            {!esGuiado && !hasFinal && (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => generarFase()} disabled={isGenerating} className="btn-cyan" style={{ flex:1, justifyContent:"center", padding:"10px", fontSize:12 }}>
                  {isGenerating ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/><span>Generando…</span></> : `Generar ${currentFaseDef.short}`}
                </button>
                {isGenerating && (
                  <button onClick={cancelGeneracion} className="btn-ghost" style={{ padding:"10px 16px", fontSize:11, color:"#ef4444" }}>
                    Cancelar
                  </button>
                )}
              </div>
            )}

            </div>
          )}

            {/* Chat messages */}
            <div style={{ flex:1, padding:"10px 14px", display:"flex", flexDirection:"column", gap:9 }}>
            {chatMsgs.length === 0 && (
              <div style={{ color:"var(--fg-secondary)", fontSize:12.5, textAlign:"center", padding:"24px 16px", lineHeight:1.6, maxWidth:340, margin:"0 auto" }}>
                {!displayContent
                  ? "Empieza por generar este capítulo. Una vez listo, podrás pedir ajustes acá."
                  : canEditPhases
                    ? "Cuando tu tutor te haga una observación, escríbela acá. La IA aplicará el ajuste solo a la sección correspondiente."
                    : "El capítulo está listo. Si tu tutor te pide ajustes puntuales al texto, puedes registrarlos con Plan Pro."}
              </div>
            )}
            {chatMsgs.map((msg, i) => (
              <div key={i} style={{ padding:"9px 11px", borderRadius:10, fontSize:12, background: msg.role==="user"?"rgba(79,70,229,0.14)":"rgba(37,99,235,0.07)", border: msg.role==="user"?"1px solid rgba(79,70,229,0.22)":"1px solid rgba(37,99,235,0.12)", alignSelf: msg.role==="user"?"flex-end":"flex-start", maxWidth:"94%" }}>
                <div style={{ fontWeight:700, fontSize:10, color: msg.role==="user"?"var(--accent)":"var(--accent)", marginBottom:4 }}>{msg.role==="user"?"Tú":"IA"}</div>
                <div style={{ color:"var(--fg-primary)", lineHeight:1.5 }}>{msg.text}</div>
              </div>
            ))}
            {isGenerating && (
              <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(37,99,235,0.06)", border:"1px solid rgba(37,99,235,0.18)", display:"flex", flexDirection:"column", gap:8, alignSelf:"stretch" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div className="spinner" style={{ width:14, height:14, borderWidth:2, borderColor:"rgba(37,99,235,0.2)", borderTopColor:"var(--accent)" }}/>
                  <div style={{ fontSize:12, color:"var(--fg-primary)", fontWeight:600 }}>
                    {genElapsed < 25  ? "Analizando el contexto…"
                   : genElapsed < 60  ? "Redactando el contenido…"
                   : genElapsed < 95  ? "Puliendo detalles finales…"
                   : genElapsed < 140 ? "Completando secciones…"
                                      : "Esto está tardando más de lo habitual, pero seguimos trabajando…"}
                  </div>
                  <div style={{ marginLeft:"auto", fontSize:11, color:"var(--fg-secondary)", fontVariantNumeric:"tabular-nums", fontFamily:"monospace" }}>
                    {Math.floor(genElapsed/60).toString().padStart(2,"0")}:{(genElapsed%60).toString().padStart(2,"0")}
                  </div>
                </div>
                <div style={{ fontSize:10.5, color:"var(--fg-secondary)", lineHeight:1.5 }}>
                  {genElapsed < 90
                    ? "Suele tardar entre 30 y 90 segundos. No cierres esta pestaña."
                    : "Estamos cerca, no cierres la pestaña. Si pasan 3 minutos sin respuesta, puedes cancelar y reintentar."}
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>
        </div>
      )}

      {col1Tab === "fuentes" && !(phaseId === "ph-latex" && !mostrarHerramientasAdmin) && (
        <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "var(--fg-primary)", fontWeight: 700, lineHeight: 1.4 }}>
            📎 Material adicional
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }}>
            ¿Tienes un paper, normativa o documento extra? Súbelo. Se incorpora
            en la <strong>próxima generación</strong> de cualquier fase.
          </div>

          {/* Subir documento de texto (PDF/TXT/MD/CSV/TSV) */}
          {canUploadDocs ? (
          <div style={{ padding: "20px 16px", background: "rgba(167,139,250,0.04)", border: "1px dashed rgba(167,139,250,0.3)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28, opacity: 0.6 }}>📄</div>
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-purple" style={{ width:"100%", fontSize:12, padding:"10px", justifyContent:"center" }}>
              {isUploading ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/><span>Procesando archivo…</span></> : "Subir documento (PDF, TXT, MD, CSV)"}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.csv,.tsv" onChange={handleUpload} style={{ display:"none" }} />
            <div style={{ fontSize: 10.5, color: "var(--fg-muted)", textAlign: "center", lineHeight: 1.5 }}>
              Máx 10 MB · PDF, TXT, MD, CSV, TSV
            </div>
          </div>
          ) : (
          <div style={{ padding: "20px 16px", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, background: "rgba(245,158,11,0.04)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>🔒</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>Disponible en Plan Pro</div>
            <div style={{ fontSize: 11, color: "var(--fg-secondary)", lineHeight: 1.6 }}>
              Sube tus papers, normativas o datos propios y la IA los integra directamente en el Cap. II de tu monografía.
            </div>
          </div>
          )}

          {/* Audio del tutor con transcripción automática */}
          <AudioFeedback
            proyectoId={proyectoId}
            onAplicarComoFeedback={(texto) => {
              // Aplicar el texto transcrito al input de feedback de la fase actual
              setFeedbackTexto(prev => prev.trim() ? `${prev.trim()}\n\n${texto}` : texto);
              // Cambiar a la pestaña de Generación para que vea el feedback aplicado
              setCol1Tab("generacion");
            }}
          />

          <div style={{ fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5, padding: "8px 4px" }}>
            💡 Si ya subiste material en el wizard inicial, ese ya está activo en todas las fases.
            Aquí puedes <strong>agregar más</strong> sin perder lo anterior.
          </div>
        </div>
      )}
      {col1Tab === "tribunal" && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ObservacionesTribunal
            proyectoId={proyectoId}
            phaseDefs={displayFases.map(f => ({ id: f.id, label: f.label, short: f.short }))}
          />
        </div>
      )}
      {col1Tab === "bitacora" && (
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
          <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#4338CA", marginBottom: 4 }}>
              📒 Bitácora del Tutor
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
              Cada observación de tu tutor queda registrada con su análisis académico y, si fue rechazada,
              con la respuesta lista para entregar. Puedes imprimir todo como un documento formal.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              {bitacoraLoading
                ? "Cargando…"
                : `${bitacora.length} observación${bitacora.length === 1 ? "" : "es"} registrada${bitacora.length === 1 ? "" : "s"}`}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={cargarBitacora}
                disabled={bitacoraLoading}
                title="Recargar"
                style={{ padding: "6px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "1px solid rgba(148,163,184,0.3)", background: "white", color: "var(--fg-secondary)", cursor: bitacoraLoading ? "wait" : "pointer" }}
              >
                ↻
              </button>
              <button
                onClick={abrirCartaDefensa}
                disabled={bitacora.length === 0}
                title="Abrir carta imprimible (Ctrl+P → Guardar como PDF)"
                style={{ padding: "6px 12px", fontSize: 11.5, fontWeight: 700, borderRadius: 8, border: "none", background: bitacora.length === 0 ? "rgba(148,163,184,0.25)" : "#1E1B4B", color: bitacora.length === 0 ? "var(--fg-muted)" : "white", cursor: bitacora.length === 0 ? "not-allowed" : "pointer" }}
              >
                🖨️ Imprimir / PDF
              </button>
            </div>
          </div>

          {bitacora.length === 0 && !bitacoraLoading && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--fg-muted)", fontSize: 12, background: "rgba(148,163,184,0.05)", borderRadius: 12, border: "1px dashed rgba(148,163,184,0.25)" }}>
              Cuando pegues una observación del tutor en el chat, la IA la analizará y quedará archivada aquí.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bitacora.map((obs) => {
              const isOpen = bitacoraExpandedId === obs.id;
              const palette = obs.decision === "rechazar"
                ? { bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.3)", chip: "#EF4444", label: "Defendida" }
                : obs.decision === "aplicar_con_reserva"
                  ? { bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.3)", chip: "#F59E0B", label: "Aplicada con reserva" }
                  : { bg: "rgba(16,185,129,0.05)", border: "rgba(16,185,129,0.3)", chip: "#10B981", label: "Aplicada" };
              const fecha = obs.created_at ? new Date(obs.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" }) : "";
              const phaseLabel = displayFases.find(f => f.id === obs.fase_id)?.label ?? obs.fase_id;

              return (
                <div
                  key={obs.id}
                  style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 10, overflow: "hidden" }}
                >
                  <button
                    onClick={() => setBitacoraExpandedId(isOpen ? null : obs.id)}
                    style={{ width: "100%", padding: "10px 12px", background: "none", border: "none", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                      <span style={{ padding: "2px 8px", background: palette.chip, color: "white", fontSize: 9.5, fontWeight: 800, borderRadius: 999, letterSpacing: 0.4, textTransform: "uppercase" }}>
                        {palette.label}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--fg-muted)" }}>{fecha}</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--fg-muted)", fontWeight: 600 }}>
                      {phaseLabel}{obs.patron_detectado ? ` · ${obs.patron_detectado}` : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--fg-primary)", lineHeight: 1.45, fontWeight: 500 }}>
                      &ldquo;{obs.observacion_textual.length > 140 ? obs.observacion_textual.slice(0, 140) + "…" : obs.observacion_textual}&rdquo;
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${palette.border}`, paddingTop: 10 }}>
                      <div>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                          Observación completa
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--fg-primary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {obs.observacion_textual}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                          Análisis académico
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--fg-primary)", lineHeight: 1.5 }}>
                          {obs.analisis_ia}
                        </div>
                      </div>
                      {obs.justificacion_para_tutor && (
                        <div style={{ padding: 10, background: "rgba(99,102,241,0.06)", borderRadius: 8, border: "1px solid rgba(99,102,241,0.18)" }}>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#4338CA", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                            Respuesta al tutor
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--fg-primary)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                            {obs.justificacion_para_tutor}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(obs.justificacion_para_tutor ?? "").catch(() => {});
                            }}
                            style={{ marginTop: 8, padding: "4px 10px", fontSize: 10.5, fontWeight: 600, borderRadius: 6, border: "1px solid rgba(99,102,241,0.4)", background: "white", color: "#4338CA", cursor: "pointer" }}
                          >
                            📋 Copiar respuesta
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {col1Tab === "cuadernillo" && (
        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
          <div style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.22)", borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7e22ce", marginBottom: 4 }}>
              📕 Tu Cuadernillo Personal
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
              Hoja de ruta privada. Cada capítulo aprobado tiene su cuadernillo con:
              qué te falta hacer (fotos, datos propios), sugerencias para mejorar,
              datos públicos a buscar, preguntas probables de tu tutor y tips de defensa.
              <strong> Solo tú lo ves — no se entrega al tutor.</strong>
            </div>
          </div>

          {/* Acciones globales */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              {cuadernilloLoading
                ? "Cargando…"
                : `${cuadernillos.length} cuadernillo${cuadernillos.length === 1 ? "" : "s"} generado${cuadernillos.length === 1 ? "" : "s"}`}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={cargarCuadernillos}
                disabled={cuadernilloLoading}
                title="Recargar"
                style={{ padding: "6px 10px", fontSize: 11, fontWeight: 600, borderRadius: 8, border: "1px solid rgba(148,163,184,0.3)", background: "white", color: "var(--fg-secondary)", cursor: cuadernilloLoading ? "wait" : "pointer" }}
              >
                ↻
              </button>
              <button
                onClick={abrirCuadernilloImprimible}
                disabled={cuadernillos.length === 0}
                title="Abrir todos los cuadernillos como documento imprimible (Ctrl+P → Guardar PDF)"
                style={{ padding: "6px 12px", fontSize: 11.5, fontWeight: 700, borderRadius: 8, border: "none", background: cuadernillos.length === 0 ? "rgba(148,163,184,0.25)" : "#7e22ce", color: cuadernillos.length === 0 ? "var(--fg-muted)" : "white", cursor: cuadernillos.length === 0 ? "not-allowed" : "pointer" }}
              >
                🖨️ Imprimir / PDF
              </button>
            </div>
          </div>

          {/* Lista de fases del proyecto. Para cada una: ver/generar cuadernillo. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayFases
              .filter(f => !isPhaseTecnica(f.id) && f.id !== "ph-cap0")
              .map((f) => {
                const cuad = cuadernillos.find(c => c.fase_id === f.id);
                const tieneContenido = Boolean(
                  (proyecto.phase_contents?.[f.id]?.trim() ?? "") ||
                  (proyecto.phase_contents?.[`${f.id}_borrador`]?.trim() ?? "")
                );
                const enProgreso = cuadernilloGenerando === f.id;

                return (
                  <div
                    key={f.id}
                    style={{
                      background: cuad ? "rgba(168,85,247,0.04)" : "rgba(148,163,184,0.04)",
                      border: cuad ? "1px solid rgba(168,85,247,0.22)" : "1px solid rgba(148,163,184,0.2)",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    {/* Header de la fase */}
                    <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-primary)" }}>{f.label}</div>
                        {cuad
                          ? <div style={{ fontSize: 10.5, color: "#7e22ce", marginTop: 2 }}>
                              ✓ Cuadernillo listo · {new Date(cuad.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short" })}
                            </div>
                          : <div style={{ fontSize: 10.5, color: "var(--fg-muted)", marginTop: 2 }}>
                              {tieneContenido ? "Sin cuadernillo aún" : "Generá la fase primero"}
                            </div>
                        }
                      </div>
                      <button
                        onClick={() => generarCuadernilloFase(f.id)}
                        disabled={!tieneContenido || enProgreso}
                        style={{
                          padding: "6px 12px", fontSize: 11, fontWeight: 700, borderRadius: 8,
                          border: "1px solid rgba(168,85,247,0.4)",
                          background: enProgreso ? "rgba(168,85,247,0.15)" : "white",
                          color: "#7e22ce",
                          cursor: (!tieneContenido || enProgreso) ? "not-allowed" : "pointer",
                          opacity: !tieneContenido ? 0.4 : 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {enProgreso ? "Generando…" : cuad ? "🔄 Regenerar" : "✨ Generar"}
                      </button>
                    </div>

                    {/* Contenido expandido del cuadernillo */}
                    {cuad && (
                      <div style={{ padding: "10px 12px 12px", borderTop: "1px solid rgba(168,85,247,0.15)", display: "flex", flexDirection: "column", gap: 10 }}>
                        {/* Resumen */}
                        {cuad.resumen_capitulo && (
                          <div style={{ fontSize: 11.5, color: "var(--fg-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
                            {cuad.resumen_capitulo}
                          </div>
                        )}

                        {/* Limitaciones IA (ámbar) */}
                        {cuad.limitaciones_ia.length > 0 && (
                          <details>
                            <summary style={{ fontSize: 11, fontWeight: 700, color: "#92400e", cursor: "pointer", padding: "4px 0" }}>
                              ⚠️ Lo que falta agregar tú ({cuad.limitaciones_ia.length})
                            </summary>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                              {cuad.limitaciones_ia.map((l, i) => (
                                <div key={i} style={{ padding: 8, background: "rgba(245,158,11,0.08)", borderLeft: "3px solid #f59e0b", borderRadius: 4, fontSize: 11, lineHeight: 1.5 }}>
                                  <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 3 }}>{l.tipo.toUpperCase().replace(/_/g, " ")}</div>
                                  <div><strong>Qué:</strong> {l.descripcion}</div>
                                  <div><strong>Dónde:</strong> {l.ubicacion_sugerida}</div>
                                  <div><strong>Cómo:</strong> {l.como_obtenerlo}</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Sugerencias */}
                        {cuad.sugerencias_fortalecimiento.length > 0 && (
                          <details>
                            <summary style={{ fontSize: 11, fontWeight: 700, color: "#4338ca", cursor: "pointer", padding: "4px 0" }}>
                              💪 Sugerencias para fortalecer ({cuad.sugerencias_fortalecimiento.length})
                            </summary>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                              {cuad.sugerencias_fortalecimiento.map((s, i) => (
                                <div key={i} style={{ padding: 8, background: "rgba(99,102,241,0.06)", borderRadius: 4, fontSize: 11, lineHeight: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ padding: "2px 7px", fontSize: 9.5, fontWeight: 800, color: "white", borderRadius: 999, background: s.impacto === "alto" ? "#dc2626" : s.impacto === "medio" ? "#d97706" : "#65a30d" }}>
                                    {s.impacto.toUpperCase()}
                                  </span>
                                  <span style={{ flex: 1 }}><strong>{s.area}:</strong> {s.que_hacer}</span>
                                  <span style={{ fontSize: 10, color: "var(--fg-muted)" }}>⏱ {s.tiempo_estimado}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Datos a buscar */}
                        {cuad.datos_a_buscar.length > 0 && (
                          <details>
                            <summary style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", cursor: "pointer", padding: "4px 0" }}>
                              🔍 Datos públicos a buscar ({cuad.datos_a_buscar.length})
                            </summary>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                              {cuad.datos_a_buscar.map((d, i) => (
                                <div key={i} style={{ padding: 8, background: "rgba(59,130,246,0.06)", borderRadius: 4, fontSize: 11, lineHeight: 1.5 }}>
                                  <div><strong>Qué:</strong> {d.que}</div>
                                  <div><strong>Dónde:</strong> {d.donde}</div>
                                  <div><strong>Para qué:</strong> {d.para_que}</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Preguntas tutor (verde) */}
                        {cuad.preguntas_tutor_probables.length > 0 && (
                          <details>
                            <summary style={{ fontSize: 11, fontWeight: 700, color: "#065f46", cursor: "pointer", padding: "4px 0" }}>
                              ❓ Preguntas probables del tutor ({cuad.preguntas_tutor_probables.length})
                            </summary>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                              {cuad.preguntas_tutor_probables.map((p, i) => (
                                <div key={i} style={{ padding: 8, background: "rgba(16,185,129,0.06)", borderRadius: 4, fontSize: 11, lineHeight: 1.5 }}>
                                  <div style={{ fontWeight: 700, color: "#065f46", marginBottom: 4 }}>P{i + 1}: {p.pregunta}</div>
                                  <div style={{ marginBottom: 3 }}><strong>Respuesta:</strong> {p.respuesta_sugerida}</div>
                                  {p.evidencia_a_tener_lista && (
                                    <div style={{ fontSize: 10.5, color: "var(--fg-secondary)" }}>📌 Tener a mano: {p.evidencia_a_tener_lista}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Errores y tips */}
                        {cuad.errores_comunes_evitar.length > 0 && (
                          <details>
                            <summary style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", cursor: "pointer", padding: "4px 0" }}>
                              🚫 Errores que evitar ({cuad.errores_comunes_evitar.length})
                            </summary>
                            <ul style={{ marginTop: 6, paddingLeft: 20, fontSize: 11, lineHeight: 1.55 }}>
                              {cuad.errores_comunes_evitar.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                          </details>
                        )}
                        {cuad.tips_presentacion_oral.length > 0 && (
                          <details>
                            <summary style={{ fontSize: 11, fontWeight: 700, color: "#1e40af", cursor: "pointer", padding: "4px 0" }}>
                              🎤 Tips para la defensa oral ({cuad.tips_presentacion_oral.length})
                            </summary>
                            <ul style={{ marginTop: 6, paddingLeft: 20, fontSize: 11, lineHeight: 1.55 }}>
                              {cuad.tips_presentacion_oral.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {col1Tab === "defensa" && canDefense && (
        <div style={{ flex: 1, overflow: "auto" }}>
          <DefensaMaterialesView proyectoId={proyectoId} />
        </div>
      )}
    </div> {/* END UPPER SCROLLABLE AREA */}

    {/* LOWER FIXED AREA: Chat de revisión + navegación.
        Oculto en Cap 0 (cards manejan todo).
        Oculto cuando hay borrador SIN final aún (el feedback va arriba en "BORRADOR LISTO"). */}
    {!isCap0Phase && !(esGuiado && hasBorrador && !hasFinal) && (
    <div style={{ flexShrink: 0, padding:"10px 14px", borderTop:"1px solid rgba(148,163,184,0.18)", background:"rgba(255,255,255,0.5)", backdropFilter:"blur(6px)" }}>
      {!canEditPhases ? (
      // Upgrade prompt en plan Estándar — versión sobria: una sola línea de
      // texto inline, sin card amarilla intrusiva ni icono candado. El empty
      // state de arriba ya le dijo al estudiante que necesita Plan Pro para
      // ajustes manuales; acá solo dejamos el link al detalle.
      <div style={{ padding:"8px 4px", fontSize:11.5, color:"var(--fg-muted)", textAlign:"center", lineHeight:1.5, marginBottom: displayContent ? 8 : 0 }}>
        <Link href="/pago" style={{ color:"var(--accent)", fontWeight:600, textDecoration:"none" }}>
          Plan Pro
        </Link>
        {" "}te permite pedir ajustes puntuales al texto.
      </div>
      ) : (
      <div
              style={{
                border: "1px solid rgba(148,163,184,0.28)",
                borderRadius: 16,
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 10px 24px rgba(2,6,23,0.08)",
                padding: "10px 10px 10px 12px",
                marginBottom: displayContent ? 8 : 0,
              }}
            >
              {/* Header con label dinámico según status. Cuando hay revisión
                  en curso, el badge cambia para que el usuario VEA que está
                  bloqueado. */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{
                  fontSize:10,
                  color: revisionStatus === "idle" ? "var(--fg-secondary)" : "var(--accent)",
                  padding:"4px 10px",
                  border: revisionStatus === "idle"
                    ? "1px solid rgba(148,163,184,0.35)"
                    : "1px solid rgba(99,102,241,0.4)",
                  borderRadius:999,
                  background: revisionStatus === "idle"
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(99,102,241,0.08)",
                  fontWeight: revisionStatus === "idle" ? 400 : 700,
                }}>
                  {revisionStatus === "loading" && "🤖 Analizando…"}
                  {revisionStatus === "preview" && "🔒 Revisa el cambio propuesto"}
                  {revisionStatus === "applying" && "💾 Aplicando…"}
                  {revisionStatus === "idle" && "Revisión / cambios — UNA observación a la vez"}
                </span>
                <span style={{ fontSize:10, color:"var(--fg-secondary)" }}>
                  {revisionStatus === "idle" ? "Ctrl+Enter para enviar" : "Esperá…"}
                </span>
              </div>

              {/* Mensaje informativo si el input está bloqueado */}
              {revisionStatus !== "idle" && (
                <div style={{
                  fontSize: 10.5,
                  color: "var(--fg-muted)",
                  background: "rgba(99,102,241,0.05)",
                  border: "1px dashed rgba(99,102,241,0.25)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  marginBottom: 8,
                  fontStyle: "italic",
                }}>
                  💡 No envíes otra observación hasta que apruebes o canceles el cambio propuesto.
                </div>
              )}

              {revisionError && (
                <div style={{
                  fontSize: 11,
                  color: "#b91c1c",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  marginBottom: 8,
                }}>
                  ❌ {revisionError}
                </div>
              )}

              <div style={{ display:"flex", gap:8, alignItems:"flex-end", opacity: revisionStatus !== "idle" ? 0.55 : 1 }}>
                <textarea
                  ref={(el) => {
                    // Auto-resize: ajustamos la altura al contenido en cada render
                    // (incluido al limpiar el input). max-height limita a ~12 líneas;
                    // arriba de eso aparece scroll interno.
                    if (el) {
                      el.style.height = "auto";
                      const next = Math.min(el.scrollHeight, 220); // ~12 líneas a fontSize 12 lineHeight 1.5
                      el.style.height = `${Math.max(38, next)}px`;
                    }
                  }}
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    // Auto-resize inmediato al escribir
                    e.target.style.height = "auto";
                    const next = Math.min(e.target.scrollHeight, 220);
                    e.target.style.height = `${Math.max(38, next)}px`;
                  }}
                  onKeyDown={e => {
                    if (e.key==="Enter" && (e.ctrlKey||e.metaKey) && chatInput.trim() && revisionStatus === "idle") {
                      pedirRevisionConPreview(chatInput.trim());
                    }
                  }}
                  placeholder={
                    revisionStatus === "idle"
                      ? "Ej: El tutor pide reforzar el marco teórico con 2 autores latinoamericanos…"
                      : "Bloqueado mientras hay una revisión en curso"
                  }
                  rows={1}
                  disabled={isGenerating || revisionStatus !== "idle"}
                  style={{
                    flex:1,
                    resize:"none",
                    fontSize:12,
                    lineHeight:1.5,
                    border:"none",
                    outline:"none",
                    background:"transparent",
                    color:"var(--fg-primary)",
                    padding:"6px 2px",
                    minHeight: 38,
                    maxHeight: 220, // ~12 líneas; arriba de eso scroll interno
                    overflowY: "auto",
                    cursor: revisionStatus !== "idle" ? "not-allowed" : "text",
                  }}
                />
                <button
                  onClick={() => {
                    if (chatInput.trim() && revisionStatus === "idle") {
                      pedirRevisionConPreview(chatInput.trim());
                    }
                  }}
                  disabled={isGenerating || !chatInput.trim() || revisionStatus !== "idle"}
                  style={{
                    width:36,
                    height:36,
                    flexShrink:0,
                    background: (isGenerating || !chatInput.trim() || revisionStatus !== "idle")
                      ? "rgba(148,163,184,0.45)"
                      : "var(--accent)",
                    border:"none",
                    borderRadius:"50%",
                    cursor: (isGenerating || !chatInput.trim() || revisionStatus !== "idle") ? "not-allowed" : "pointer",
                    color:"#fff",
                    fontSize:16,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    boxShadow: (isGenerating || !chatInput.trim() || revisionStatus !== "idle") ? "none" : "0 8px 16px rgba(37,99,235,0.32)",
                  }}
                  aria-label="Enviar instrucción"
                >
                  {revisionStatus === "loading" || revisionStatus === "applying"
                    ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/>
                    : revisionStatus === "preview"
                    ? "🔒"
                    : "↑"}
                </button>
              </div>
            </div>
          )}
          </div>
    )}
    {/* Navegación entre fases — SIEMPRE visible (excepto Cap0) */}
    {!isCap0Phase && displayContent && (
      <div style={{ flexShrink: 0, padding:"8px 14px 12px", borderTop: !(esGuiado && hasBorrador && !hasFinal) ? "none" : "1px solid rgba(148,163,184,0.18)", background:"rgba(255,255,255,0.5)", backdropFilter:"blur(6px)" }}>
        <div style={{ display:"flex", gap:6 }}>
          {selectedFase > 0 && <button onClick={() => setSelectedFase(f => f-1)} className="btn-ghost" style={{ flex:1, fontSize:10, padding:"5px 6px", justifyContent:"center" }}>← {displayFases[selectedFase-1]?.short}</button>}
          {selectedFase < displayFases.length-1 && <button onClick={() => setSelectedFase(f => f+1)} className="btn-cyan" style={{ flex:1, fontSize:10, padding:"5px 6px", justifyContent:"center" }}>{displayFases[selectedFase+1]?.short} →</button>}
        </div>
      </div>
    )}
        </div>

        {/* ── COL 2: CONTENT VIEWER (flex) ── */}
        <div
          className="workspace-main-column overflow-y-auto relative z-10 min-h-[600px] xl:min-h-0"
          style={{
            background: panelBg, backdropFilter: panelBlur, WebkitBackdropFilter: panelBlur,
            ...(isMobileDevice ? { width: "100%", maxWidth: "100%", minWidth: 0, flexBasis: "auto" } : {}),
          }}
        >
          {displayContent ? (
            <div
              className="workspace-editor-inner fade-in p-6 md:p-10 lg:p-16 pb-20 relative overflow-hidden"
            >
              {/* Inner wrapper — header de la fase actual.
                  En la fase de export (LaTeX/Compilar) el LatexExportView ya
                  tiene su propio H1 ("Tu monografía está lista para descargar"),
                  así que evitamos duplicar la eyebrow LATEX + título arriba. */}
              {phaseId !== "ph-latex" && (
              <div style={{ marginBottom:24, paddingBottom:14, borderBottom:"1px solid var(--bg-subtle)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:"var(--accent)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:4 }}>{currentFaseDef.short}</div>
                    <h1 style={{ fontSize:22, fontWeight:800, color:"var(--fg-primary)", margin:0, lineHeight:1.3 }}>{currentFaseDef.label}</h1>
                  </div>
                  {esGuiado && (vistaActiva==="final" && hasFinal
                    ? <span className="badge badge-cyan">Versión Final</span>
                    : <span style={{ padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa" }}>Borrador</span>
                  )}
                  {!esGuiado && hasFinal && <span className="badge badge-green">✓ Generado</span>}
                </div>
                {needsUpdate && (
                  <div style={{ marginTop:8, padding:"7px 10px", background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:5, fontSize:11, color:"#fbbf24" }}>
                    Contenido desactualizado — regenera para mantener coherencia.
                  </div>
                )}
              </div>
              )}

              <style>{`
                /* Documento académico — tipografía y espaciado tipo Word */
                .doc-preview { max-width: 780px; margin: 0 auto; font-family: var(--font-crimson), Georgia, "Times New Roman", serif; }
                .md-h1 { font-size: 24px; font-weight: 800; color: var(--fg-primary); margin: 32px 0 14px; line-height: 1.25; letter-spacing: -0.01em; }
                .md-h2 { font-size: 19px; font-weight: 700; color: var(--fg-primary); margin: 28px 0 12px; line-height: 1.35; }
                .md-h3 { font-size: 16px; font-weight: 700; color: var(--fg-primary); margin: 22px 0 10px; line-height: 1.4; }
                .md-h4 { font-size: 14px; font-weight: 700; color: var(--fg-secondary); margin: 18px 0 8px; text-transform: none; letter-spacing: 0; }
                .md-p { margin: 10px 0; color: var(--fg-primary); line-height: 1.85; font-size: 15.5px; text-align: justify; text-indent: 1.5em; }
                .md-p:first-of-type, .md-h1 + .md-p, .md-h2 + .md-p, .md-h3 + .md-p, .md-h4 + .md-p { text-indent: 0; }
                .md-strong { color: var(--fg-primary); font-weight: 700; }
                .md-em { color: var(--fg-primary); font-style: italic; }
                .md-inline-code { font-family: ui-monospace, "SF Mono", Consolas, monospace; font-size: 0.92em; padding: 2px 6px; border-radius: 4px; background: rgba(148,163,184,0.12); color: var(--accent); }
                .md-ul, .md-ol { margin: 12px 0; padding-left: 28px; }
                .md-ol { list-style-type: decimal; }
                .md-li { color: var(--fg-primary); margin: 6px 0; line-height: 1.7; font-size: 15px; text-align: justify; }
                .md-li-num { list-style-type: decimal; }
                .md-blockquote { margin: 14px 0; padding: 10px 18px; border-left: 3px solid var(--accent); background: rgba(99,102,241,0.06); color: var(--fg-secondary); font-style: italic; border-radius: 0 6px 6px 0; }
                .md-pre { margin: 14px 0; padding: 14px 16px; background: rgba(15,23,42,0.04); border: 1px solid var(--border); border-radius: 8px; overflow-x: auto; }
                .md-code { font-family: ui-monospace, "SF Mono", Consolas, monospace; font-size: 13px; line-height: 1.6; color: var(--fg-primary); }
                /* Tablas tipo booktabs (sin líneas verticales, solo top/middle/bottom) */
                .md-table-wrap { margin: 18px 0; overflow-x: auto; }
                .md-table { width: 100%; border-collapse: collapse; font-size: 14px; font-family: var(--font-crimson), Georgia, serif; }
                .md-table thead tr { border-top: 1.5px solid var(--fg-primary); border-bottom: 1px solid var(--fg-secondary); }
                .md-table tbody tr:last-child { border-bottom: 1.5px solid var(--fg-primary); }
                .md-th { padding: 8px 12px; font-weight: 700; color: var(--fg-primary); vertical-align: top; }
                .md-td { padding: 7px 12px; color: var(--fg-primary); vertical-align: top; line-height: 1.55; }
                .md-tr:hover { background: rgba(148,163,184,0.04); }
                /* Captions de tabla/figura/ecuación (estilo APA) */
                .md-caption { margin: 18px 0 4px; text-align: left; }
                .md-caption-num { display: block; font-weight: 700; color: var(--fg-primary); font-size: 14px; }
                .md-caption-title { display: block; font-style: italic; color: var(--fg-primary); font-size: 14px; margin-top: 2px; }
                .md-note { margin: 6px 0 14px; font-size: 12.5px; color: var(--fg-muted); line-height: 1.5; }
                .md-note strong { color: var(--fg-secondary); font-style: italic; }
              `}</style>
              {/* Cap 0: UI especial con cards de propuestas.
                  Si estado_fase >= 1, el tema YA está confirmado y es irreversible:
                  mostramos pantalla de "Tema Confirmado" en vez de las propuestas. */}
              {(phaseId === "ph-cap0" || (!isDynamic && legacyNum === 0)) ? (
                <Cap0PropuestasView
                  rawContent={displayContent}
                  temaInicial={proyecto.tema_aprobado || proyecto.titulo_provisional || undefined}
                  isGenerating={isGenerating}
                  temaConfirmado={(proyecto.estado_fase ?? 0) >= 1}
                  temaFinalConfirmado={proyecto.tema_aprobado || proyecto.titulo_provisional || undefined}
                  onElegirOpcion={elegirPropuestaCap0}
                  onRegenerar={regenerarCap0}
                  onMantenerTema={mantenerTemaCap0}
                  onIrACapI={() => setSelectedFase(1)}
                />
              ) : phaseId === "ph-latex" ? (
                /* LaTeX: pantalla con descarga de paquete completo (1 ZIP automático) */
                <LatexExportView
                  rawContent={displayContent}
                  tituloProyecto={proyecto.tema_aprobado || proyecto.titulo_provisional || undefined}
                  logoUrl={university?.logo_url}
                  proyectoId={proyectoId}
                  onConfigurarCaratula={() => setShowCoverSettings(true)}
                  isAdmin={isAdmin}
                />
              ) : phaseId === "ph-calidad" ? (
                /* Banco de preguntas para defensa oral (ex-Auditoría Final).
                   Las preguntas se generan en background al aprobar cada capítulo. */
                <BancoPreguntasView
                  proyectoId={proyectoId}
                  tituloProyecto={proyecto.tema_aprobado || proyecto.titulo_provisional || undefined}
                  phaseContents={(proyecto.phase_contents ?? {}) as Record<string, string | null | undefined>}
                  phaseDefs={displayFases.map(f => ({ id: f.id, label: f.label }))}
                />
              ) : (phaseId === "ph-resumen" || phaseId === "ph-referencias") ? (
                /* Fases especiales: resumen / referencias */
                <SpecialPhaseView
                  phaseId={phaseId}
                  rawContent={displayContent}
                  renderMdFn={renderMd}
                />
              ) : (
                /* Cap I-V: render markdown académico estándar */
                <>
                  <div
                    className="doc-preview"
                    dangerouslySetInnerHTML={{ __html: renderMd(displayContent) }}
                    style={{ fontSize:13.5, lineHeight:1.85 }}
                  />
                  {/* Sello de fin: confirma visualmente que la generación llegó al final */}
                  {(() => {
                    const cortado = pareceCortadoConservador(displayContent);
                    const palabras = countWords(displayContent);
                    return (
                      <div style={{
                        marginTop: 36,
                        padding: "14px 20px",
                        borderRadius: 10,
                        textAlign: "center",
                        background: cortado ? "rgba(245,158,11,0.06)" : "rgba(34,197,94,0.05)",
                        border: cortado ? "1px dashed rgba(245,158,11,0.4)" : "1px solid rgba(34,197,94,0.18)",
                        color: cortado ? "#f59e0b" : "#16a34a",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}>
                        <div>
                          {cortado
                            ? "⚠ Esta versión puede haber quedado cortada al final"
                            : "✓ Fin del capítulo"}
                        </div>
                        <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--fg-muted)", textTransform: "none", letterSpacing: 0 }}>
                          {cortado
                            ? `${palabras.toLocaleString("es")} palabras · Revisa las últimas líneas. Si falta contenido, regenera otra versión.`
                            : `${palabras.toLocaleString("es")} palabras · Generación completa`}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          ) : isGenerating ? (
            /* Pantalla animada con partículas + mensajes rotativos contextuales */
            <GeneratingState phaseId={phaseId} phaseLabel={currentFaseDef.label} />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"10vh auto", maxWidth: 400, padding:"50px 30px", borderRadius: 16, gap:12, background:"var(--bg-card)", border:"1px solid var(--border)", boxShadow:"var(--shadow-md)" }}>
              <div style={{ fontSize:48, opacity:0.3 }}>📄</div>
              <div style={{ fontSize:15, fontWeight:700, color:"var(--border)" }}>{currentFaseDef.label}</div>
              <div style={{ fontSize:12, color:"var(--fg-primary)", textAlign:"center", maxWidth:240, lineHeight:1.6 }}>
                {esGuiado ? "Genera el borrador para iniciar el proceso guiado." : "Usa el panel izquierdo para generar el contenido."}
              </div>
            </div>
          )}
        </div>

        {/* ── COL 3: PANEL DE INSIGHTS POR FASE (cuando preview PDF está cerrado) ── */}
        {!showPdfPanel && !isCap0Phase && (
          (phaseId === "ph-referencias" || phaseId === "ph-resumen" || phaseId === "ph-calidad" || (!phaseId?.startsWith("ph-") && legacyNum != null && legacyNum >= 1 && legacyNum <= 5)) && (
            <div
              className="hidden xl:flex shrink-0 flex-col relative z-40"
              style={{ background: panelBg, backdropFilter: panelBlur, WebkitBackdropFilter: panelBlur, borderLeft: panelBorder, boxShadow: panelShadow }}
            >
              {phaseId === "ph-referencias" && <BibliografiaInsights rawContent={displayContent ?? ""} />}
              {phaseId === "ph-resumen" && <ResumenInsights rawContent={displayContent ?? ""} />}
              {phaseId === "ph-calidad" && <CalidadInsights rawContent={displayContent ?? ""} />}
              {!phaseId?.startsWith("ph-") && legacyNum != null && legacyNum >= 1 && legacyNum <= 5 && (
                <CapituloInsights rawContent={displayContent ?? ""} capLabel={currentFaseDef?.label} />
              )}
            </div>
          )
        )}

        {/* ── COL 3: PDF PREVIEW — oculto en Cap 0 (no es parte del documento) ── */}
        {showPdfPanel && !isCap0Phase && (
          <div
            className="w-full xl:w-auto shrink-0 flex flex-col border-t xl:border-t-0 relative z-40 min-h-[500px] xl:min-h-0"
            style={{
              background: panelBg, backdropFilter: panelBlur, WebkitBackdropFilter: panelBlur, borderLeft: panelBorder, boxShadow: panelShadow,
              ...(isMobileDevice ? { width: "100%", maxWidth: "100%", minWidth: 0, flexBasis: "auto" } : {}),
            }}
          >
            {/* Panel header */}
            <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(148,163,184,0.18)", display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--fg-muted)" }}>Vista Previa</div>
                  <div style={{ fontSize:11, color:"var(--border-hover)", marginTop:1 }}>
                    {documentoFinalListo
                      ? "Documento final consolidado"
                      : previewMode === "fase"
                        ? currentFaseDef.label
                        : fasesEnBorrador > 0
                          ? `${fasesCompletadas} final${fasesCompletadas !== 1 ? "es" : ""} · ${fasesEnBorrador} borrador${fasesEnBorrador !== 1 ? "es" : ""}`
                          : `${fasesCompletadas} capítulo${fasesCompletadas !== 1 ? "s" : ""}`}
                  </div>
                </div>
                {university && (
                  <div style={{ fontSize:10, color:"var(--fg-secondary)", textAlign:"right", maxWidth:120, lineHeight:1.4 }}>
                    {university.name}
                  </div>
                )}
              </div>

              {/* Controles: toggle modo + zoom + fullscreen */}
              {!documentoFinalListo && (
                <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  {/* Toggle "Esta fase | Completo" */}
                  <div style={{ display:"inline-flex", padding:2, borderRadius:7, background:"rgba(148,163,184,0.12)", border:"1px solid rgba(148,163,184,0.2)" }}>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("fase")}
                      style={{
                        padding:"4px 9px", fontSize:10.5, fontWeight:600, borderRadius:5, border:"none", cursor:"pointer",
                        background: previewMode === "fase" ? "var(--bg-card)" : "transparent",
                        color: previewMode === "fase" ? "var(--accent)" : "var(--fg-secondary)",
                        boxShadow: previewMode === "fase" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                      }}
                    >Esta fase</button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("completo")}
                      style={{
                        padding:"4px 9px", fontSize:10.5, fontWeight:600, borderRadius:5, border:"none", cursor:"pointer",
                        background: previewMode === "completo" ? "var(--bg-card)" : "transparent",
                        color: previewMode === "completo" ? "var(--accent)" : "var(--fg-secondary)",
                        boxShadow: previewMode === "completo" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                      }}
                    >Completo</button>
                  </div>

                  {/* Zoom */}
                  <div style={{ display:"inline-flex", alignItems:"center", gap:2, marginLeft:"auto", padding:2, borderRadius:7, background:"rgba(148,163,184,0.12)", border:"1px solid rgba(148,163,184,0.2)" }}>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(z => Math.max(0.75, +(z - 0.25).toFixed(2)))}
                      disabled={previewZoom <= 0.75}
                      title="Reducir"
                      style={{ width:24, height:22, fontSize:13, fontWeight:700, border:"none", background:"transparent", cursor: previewZoom <= 0.75 ? "not-allowed" : "pointer", color:"var(--fg-secondary)", opacity: previewZoom <= 0.75 ? 0.4 : 1, borderRadius:4 }}
                    >−</button>
                    <span style={{ fontSize:10.5, fontWeight:600, color:"var(--fg-secondary)", minWidth:36, textAlign:"center", fontVariantNumeric:"tabular-nums" }}>
                      {Math.round(previewZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(z => Math.min(1.5, +(z + 0.25).toFixed(2)))}
                      disabled={previewZoom >= 1.5}
                      title="Aumentar"
                      style={{ width:24, height:22, fontSize:13, fontWeight:700, border:"none", background:"transparent", cursor: previewZoom >= 1.5 ? "not-allowed" : "pointer", color:"var(--fg-secondary)", opacity: previewZoom >= 1.5 ? 0.4 : 1, borderRadius:4 }}
                    >+</button>
                  </div>

                  {/* Fullscreen */}
                  <button
                    type="button"
                    onClick={() => setPreviewFullscreen(true)}
                    disabled={!docHtml}
                    title="Pantalla completa"
                    style={{ padding:"5px 8px", fontSize:11, fontWeight:600, borderRadius:6, border:"1px solid rgba(148,163,184,0.2)", background:"rgba(148,163,184,0.08)", cursor: docHtml ? "pointer" : "not-allowed", color:"var(--fg-secondary)", opacity: docHtml ? 1 : 0.4 }}
                  >⛶ Agrandar</button>
                </div>
              )}
            </div>

            {/* Document preview */}
            <div style={{ flex:1, overflowY:"auto", padding:0, background:"rgba(241,245,249,0.72)" }}>
              {docHtml ? (
                <iframe
                  ref={previewIframeRef}
                  title="Vista previa del documento final"
                  srcDoc={docHtml}
                  onLoad={() => {
                    previewIframeRef.current?.contentDocument?.body?.style.setProperty("zoom", String(previewZoom));
                  }}
                  style={{ width:"100%", height:"100%", border:0, display:"block", background:"#eef0f3" }}
                />
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:10, padding:"40px 24px" }}>
                  <div style={{ fontSize:36, opacity:0.12 }}>📋</div>
                  <div style={{ fontSize:12, color:"var(--border)", textAlign:"center", lineHeight:1.6, maxWidth:260 }}>
                    Genera el borrador de cualquier capítulo y vas a verlo aquí. A medida que apruebas cada fase, el documento se va consolidando.
                  </div>
                </div>
              )}
            </div>

            {/* Download actions */}
            {(fasesConContenido > 0 || documentoFinalListo) && (
              <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(148,163,184,0.18)", display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                <button onClick={generarDocumentoFinal} disabled={isFinalizing || fasesCompletadas === 0} className="btn-purple" style={{ flex:1, fontSize:12, padding:"8px", justifyContent:"center", minWidth: "100%" }}>
                  {isFinalizing ? "Consolidando documento..." : documentoFinalListo ? "Regenerar documento final" : "Generar documento final"}
                </button>
                <button onClick={() => setShowCoverSettings(true)} className="btn-cyan" style={{ flex:1, fontSize:12, padding:"8px", justifyContent:"center", minWidth: "100%" }}>
                  ⚙️ Configurar Carátula
                </button>
                <button onClick={descargarLatex} disabled={isDownloading} className="btn-ghost" style={{ flex:1, fontSize:12, padding:"8px", justifyContent:"center" }}>
                  {isDownloading ? "…" : "📄 .tex"}
                </button>
                {university && (
                  <button
                    disabled={isPdfDownloading || !documentoFinalListo}
                    onClick={async () => {
                      if (!documentoFinalListo) {
                        setError("Primero genera el documento final consolidado.");
                        return;
                      }
                      setIsPdfDownloading(true);
                      setError("");
                      const html = generatePdfHtml({
                        university: documentUniversity,
                        studentData: pdfData,
                        phaseContents,
                        phaseLabels,
                        titulo: documentTitle
                      });
                      try {
                        const res = await fetch("/api/export/pdf", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ html, title: documentTitle, responseMode: "base64" }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          throw new Error(data.error || "No se pudo generar el PDF.");
                        }
                        if (!data.pdfBase64 || !data.bytes) {
                          throw new Error("El PDF se generó vacío. Intenta descargarlo nuevamente.");
                        }
                        const binary = atob(data.pdfBase64);
                        const buffer = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i += 1) buffer[i] = binary.charCodeAt(i);
                        if (buffer.byteLength === 0) {
                          throw new Error("El PDF se generó vacío. Intenta descargarlo nuevamente.");
                        }
                        const blob = new Blob([buffer], { type: "application/pdf" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        const safeName = documentTitle
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                          .slice(0, 80) || "documento-academico";
                        link.href = url;
                        link.download = `${safeName}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        window.setTimeout(() => {
                          link.remove();
                          URL.revokeObjectURL(url);
                        }, 60_000);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "No se pudo generar el PDF.");
                      } finally {
                        setIsPdfDownloading(false);
                      }
                    }}
                    className="btn-ghost"
                    style={{ flex:1, fontSize:0, padding:"8px", justifyContent:"center" }}
                  >
                    <span style={{ fontSize: 12 }}>{isPdfDownloading ? "Generando..." : documentoFinalListo ? "Descargar PDF" : "PDF bloqueado"}</span>
                    🖨️ Imprimir
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <GlassModal isOpen={showCoverSettings} onClose={guardarDatosCaratula} title="Configurar Carátula">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--fg-secondary)", margin: 0 }}>
            Completa los datos para generar tu carátula interactiva y aplicar el formato a tu exportación.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Nombre Completo del Estudiante</label>
            <input className="input-dark" value={pdfData.nombre} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, nombre: e.target.value })); }} placeholder="Ej. Juan Pérez" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>T&iacute;tulo del Trabajo</label>
            <input className="input-dark" value={pdfData.tituloTrabajo ?? documentTitle} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, tituloTrabajo: e.target.value })); }} placeholder="Ej. Estrategias de..." />
          </div>
          {(documentUniversity.campos_portada || []).includes("tutor") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Nombre del Tutor/a</label>
              <input className="input-dark" value={pdfData.tutor || ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, tutor: e.target.value })); }} placeholder="Ej. Dra. María Gómez" />
            </div>
          )}
          {(documentUniversity.campos_portada || []).includes("programa") && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Programa (Ej. Educación Superior)</label>
                <input className="input-dark" value={pdfData.programa || ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, programa: e.target.value })); }} placeholder="Educación Superior..." />
              </div>
              {(documentUniversity.campos_portada || []).includes("version") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 120 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Versión</label>
                  <input className="input-dark" value={pdfData.version || ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, version: e.target.value })); }} placeholder="Ej. VII" />
                </div>
              )}
            </div>
          )}
          {(documentUniversity.campos_portada || []).includes("carrera") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Carrera / Especialidad</label>
              <input className="input-dark" value={pdfData.carrera || ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, carrera: e.target.value })); }} placeholder="Ej. Ingeniería de Sistemas" />
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Mes de Presentación</label>
              <select className="input-dark" value={pdfData.mes} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, mes: e.target.value })); }} style={{ height: 38 }}>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 100 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Año</label>
              <input className="input-dark" value={pdfData.anio} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, anio: e.target.value })); }} placeholder="2026" />
            </div>
          </div>

          {/* ── Datos institucionales (editable, formato UMSS exacto) ── */}
          <details style={{ marginTop: 6 }}>
            <summary style={{ cursor: "pointer", fontSize: 11.5, color: "var(--accent)", fontWeight: 600, padding: "4px 0", userSelect: "none" }}>
              ⚙ Datos institucionales (universidad, facultad, ciudad…)
            </summary>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10, paddingLeft: 8, borderLeft: "2px solid rgba(99,102,241,0.2)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Universidad</label>
                <input className="input-dark" value={pdfData.universidad ?? ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, universidad: e.target.value })); }} placeholder="UNIVERSIDAD MAYOR DE SAN SIMÓN" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Facultad</label>
                <input className="input-dark" value={pdfData.facultad ?? ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, facultad: e.target.value })); }} placeholder="FACULTAD DE CIENCIAS ECONÓMICAS" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Departamento / Escuela</label>
                <input className="input-dark" value={pdfData.departamento ?? ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, departamento: e.target.value })); }} placeholder="ESCUELA UNIVERSITARIA DE POSGRADO" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Modalidad de Titulación</label>
                <input className="input-dark" value={pdfData.modalidad ?? ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, modalidad: e.target.value })); }} placeholder="DIPLOMADO COMO MODALIDAD DE TITULACIÓN" />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Ciudad</label>
                  <input className="input-dark" value={pdfData.ciudad ?? ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, ciudad: e.target.value })); }} placeholder="Cochabamba" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>País</label>
                  <input className="input-dark" value={pdfData.pais ?? ""} onChange={e => { pdfDataDirtyRef.current = true; setPdfData(prev => ({ ...prev, pais: e.target.value })); }} placeholder="Bolivia" />
                </div>
              </div>
            </div>
          </details>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button className="btn-cyan" onClick={guardarDatosCaratula} style={{ padding: "10px 24px" }}>Guardar y cerrar</button>
          </div>
        </div>
      </GlassModal>

      {/* 🛠️ Toggle admin/estudiante — visible para admin, cuentas demo/test y localhost dev */}
      <AdminViewToggle isAdmin={puedeVerToggle} />

      {/* ── MODAL: Veredicto del Analizador de Pertinencia ─────────────────── */}
      {revisionStatus === "preview" && revisionPreview && (() => {
        const isAplicar = revisionPreview.decision === "aplicar";
        const isReserva = revisionPreview.decision === "aplicar_con_reserva";
        const isRechazar = revisionPreview.decision === "rechazar";
        const isMover = revisionPreview.decision === "mover_a_otra_fase";
        const decisionColor = isAplicar ? "#16a34a"  // verde
                            : isReserva ? "#d97706"  // ámbar
                            : isMover    ? "#2563eb"  // azul
                            : "#dc2626";              // rojo (rechazar)
        const decisionBg = isAplicar ? "rgba(22,163,74,0.08)"
                         : isReserva ? "rgba(217,119,6,0.08)"
                         : isMover    ? "rgba(37,99,235,0.08)"
                         : "rgba(220,38,38,0.08)";
        const decisionLabel = isAplicar ? "✅ APLICAR"
                            : isReserva ? "⚠️ APLICAR CON RESERVA"
                            : isMover    ? `📍 LLEVAR A: ${revisionPreview.faseDestinoLabel ?? "otra fase"}`
                            : "🛡️ NO APLICAR — Justificación lista para el tutor";
        const ctaLabel = isRechazar ? "Guardar en Bitácora del Tutor"
                       : isMover    ? `Ir a ${revisionPreview.faseDestinoLabel ?? "el capítulo correcto"}`
                       : isReserva ? "Aplicar con reserva"
                       : "Aplicar cambio";

        return (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) cancelarRevision(); }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              background: "rgba(15,23,42,0.75)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 1100,
                maxHeight: "92vh",
                background: "white",
                borderRadius: 14,
                boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Header con veredicto */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                background: decisionBg,
              }}>
                <div style={{
                  fontSize: 11,
                  color: decisionColor,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}>
                  Análisis de pertinencia · {revisionPreview.phaseLabel}
                </div>
                <div style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: decisionColor,
                  marginBottom: 8,
                }}>
                  {decisionLabel}
                </div>
                <div style={{
                  fontSize: 12.5,
                  color: "var(--fg-secondary)",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}>
                  Observación del tutor: &ldquo;{revisionPreview.mensajeUsuario}&rdquo;
                </div>
                <div style={{
                  fontSize: 12,
                  color: "var(--fg-primary)",
                  background: "white",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.08)",
                  lineHeight: 1.5,
                }}>
                  <strong>🤖 Análisis IA:</strong> {revisionPreview.analisisIa}
                </div>

                {/* Warning amarillo: cambio de título oficial */}
                {revisionPreview.nuevoTitulo && !isRechazar && (
                  <div style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    background: "rgba(245,158,11,0.10)",
                    border: "2px solid #d97706",
                    borderRadius: 10,
                    fontSize: 12.5,
                    color: "#7c2d12",
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontWeight: 800, marginBottom: 4, color: "#92400e" }}>
                      ⚠️ Este cambio actualiza el TÍTULO OFICIAL del proyecto
                    </div>
                    {revisionPreview.tituloActual && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: "#92400e", fontWeight: 600 }}>Título anterior:</span>{" "}
                        <span style={{ textDecoration: "line-through", color: "#a8a29e" }}>
                          {revisionPreview.tituloActual}
                        </span>
                      </div>
                    )}
                    <div>
                      <span style={{ color: "#92400e", fontWeight: 600 }}>Título nuevo:</span>{" "}
                      <strong style={{ color: "#7c2d12" }}>{revisionPreview.nuevoTitulo}</strong>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#92400e", fontStyle: "italic" }}>
                      Si aceptás, el título cambia en TODO el proyecto: portada, encabezados, citas internas y referencias de futuros capítulos.
                    </div>
                  </div>
                )}
              </div>

              {/* Cuerpo: diff (si aplicar/reserva) o justificación (si rechazar) */}
              <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
                {isRechazar ? (
                  <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--fg-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}>
                      💬 Respuesta argumentada para tu tutor
                    </div>
                    <div style={{
                      padding: 20,
                      background: "var(--bg-base)",
                      border: "1.5px solid rgba(15,23,42,0.18)",
                      borderRadius: 12,
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: "var(--fg-primary)",
                      whiteSpace: "pre-wrap",
                    }}>
                      {revisionPreview.justificacionParaTutor ?? "—"}
                    </div>
                    <div style={{
                      marginTop: 16,
                      padding: 12,
                      background: "rgba(99,102,241,0.06)",
                      border: "1px dashed rgba(99,102,241,0.3)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--fg-muted)",
                      lineHeight: 1.5,
                    }}>
                      💡 Puedes copiar este texto y enviárselo al tutor. Esta observación
                      queda registrada en tu <strong>Bitácora del Tutor</strong> para
                      defender tu decisión académica.
                    </div>
                  </div>
                ) : revisionPreview.contenidoPropuesto ? (
                  <>
                    {isReserva && (
                      <div style={{
                        margin: "16px 20px 0",
                        padding: 12,
                        background: "rgba(217,119,6,0.08)",
                        border: "1px solid rgba(217,119,6,0.3)",
                        borderRadius: 8,
                        fontSize: 12.5,
                        color: "#92400e",
                        lineHeight: 1.5,
                      }}>
                        ⚠️ <strong>Aplicar con reserva:</strong> el cambio se ejecuta pero la
                        IA detectó que tiene caveats. Revisa el análisis arriba antes de aprobar.
                      </div>
                    )}

                    {/* Panel de fuentes consultadas (Gemini Grounding).
                        Permite VERIFICAR que las citas no son inventadas. */}
                    {revisionPreview.groundingSources.length > 0 && (
                      <div style={{
                        margin: "16px 20px 0",
                        padding: 14,
                        background: "rgba(14,165,233,0.06)",
                        border: "1px solid rgba(14,165,233,0.30)",
                        borderRadius: 8,
                      }}>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#0369a1",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 8,
                        }}>
                          🌐 Fuentes consultadas por la IA ({revisionPreview.groundingSources.length})
                        </div>
                        <div style={{ fontSize: 12, color: "var(--fg-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
                          La IA buscó en internet y consultó estas fuentes reales. <strong>Verifica que las citas del texto provienen de aquí</strong> (si una cita del bloque nuevo no aparece en esta lista, es señal de alucinación).
                        </div>
                        {revisionPreview.groundingQueries.length > 0 && (
                          <div style={{
                            fontSize: 11,
                            color: "var(--fg-muted)",
                            marginBottom: 10,
                            paddingBottom: 8,
                            borderBottom: "1px dashed rgba(14,165,233,0.25)",
                          }}>
                            <strong>Búsquedas realizadas:</strong>{" "}
                            {revisionPreview.groundingQueries.map((q, i) => (
                              <span key={i} style={{
                                display: "inline-block",
                                background: "rgba(14,165,233,0.10)",
                                padding: "2px 8px",
                                borderRadius: 999,
                                marginRight: 6,
                                marginTop: 4,
                                fontSize: 10.5,
                                color: "#075985",
                              }}>
                                {q}
                              </span>
                            ))}
                          </div>
                        )}
                        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                          {revisionPreview.groundingSources.map((src, i) => (
                            <li key={i} style={{
                              padding: "8px 0",
                              borderBottom: i < revisionPreview.groundingSources.length - 1
                                ? "1px solid rgba(14,165,233,0.12)"
                                : "none",
                              fontSize: 12,
                              lineHeight: 1.5,
                            }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{
                                  flexShrink: 0,
                                  color: "#0369a1",
                                  fontWeight: 700,
                                  minWidth: 22,
                                }}>
                                  [{i + 1}]
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {src.uri ? (
                                    <a
                                      href={src.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#0369a1",
                                        fontWeight: 600,
                                        wordBreak: "break-all",
                                        textDecoration: "underline",
                                      }}
                                    >
                                      {src.title || src.uri}
                                    </a>
                                  ) : (
                                    <span style={{ color: "var(--fg-primary)", fontWeight: 600 }}>
                                      {src.title || "(sin título)"}
                                    </span>
                                  )}
                                  {src.snippet && (
                                    <div style={{
                                      marginTop: 4,
                                      fontSize: 11.5,
                                      color: "var(--fg-secondary)",
                                      fontStyle: "italic",
                                    }}>
                                      &ldquo;{src.snippet}&rdquo;
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <DiffPreview
                      contenidoActual={revisionPreview.contenidoActual}
                      contenidoPropuesto={revisionPreview.contenidoPropuesto}
                      onAplicar={aplicarRevision}
                      onCancelar={cancelarRevision}
                      aplicando={(revisionStatus as RevisionStatus) === "applying"}
                      titulo={`Cambios en ${revisionPreview.phaseLabel}`}
                    />
                  </>
                ) : (
                  // Caso: decision=aplicar/aplicar_con_reserva pero NO hay propuesta.
                  // Esto pasa cuando la IA decidió aplicar pero no devolvió un
                  // bloque_original válido, o el bloque_original no se encontró
                  // byte-por-byte en el documento (errorCirugia presente).
                  <div style={{ padding: "20px 24px" }}>
                    <div style={{
                      padding: 16,
                      background: "rgba(245,158,11,0.10)",
                      border: "1.5px solid rgba(245,158,11,0.4)",
                      borderRadius: 10,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: "var(--fg-primary)",
                      marginBottom: 12,
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: 8, color: "#92400e", fontSize: 14 }}>
                        ⚠️ No se pudo aplicar la observación
                      </div>
                      {revisionPreview.errorCirugia ? (
                        <div style={{ marginBottom: 10 }}>
                          {revisionPreview.errorCirugia}
                        </div>
                      ) : (
                        <div style={{ marginBottom: 10 }}>
                          La IA decidió que la observación es válida para este capítulo, pero no identificó con precisión el bloque del documento que hay que modificar.
                        </div>
                      )}
                      <div style={{ fontSize: 12.5, color: "var(--fg-secondary)", paddingTop: 8, borderTop: "1px solid rgba(245,158,11,0.25)" }}>
                        <strong>Sugerencia:</strong> reformulá la observación indicando con más precisión qué párrafo o sección querés cambiar. Por ejemplo: <em>&ldquo;En la sección 2.1.2 sobre normas de origen, agregar un párrafo que cite expresamente el Acuerdo sobre Facilitación del Comercio de la OMC.&rdquo;</em>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer si rechazo O si no hay propuesta (DiffPreview tiene sus propios botones) */}
              {(isRechazar || (!revisionPreview.contenidoPropuesto && !isRechazar)) && (() => {
                // Si no hay contenidoPropuesto y no fue rechazo, fue fallo de cirugía:
                // solo dejamos cerrar para que el usuario reformule (NO mostramos
                // botón Aplicar — no hay nada que aplicar).
                const sinPropuesta = !revisionPreview.contenidoPropuesto && !isRechazar;
                return (
                  <div style={{
                    padding: "14px 20px",
                    borderTop: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                    background: "var(--bg-base)",
                  }}>
                    <button
                      type="button"
                      onClick={cancelarRevision}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "10px 18px",
                        borderRadius: 8,
                        background: "white",
                        border: "1px solid rgba(15,23,42,0.22)",
                        color: "var(--fg-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      {sinPropuesta ? "Cerrar y reformular" : "Cerrar"}
                    </button>
                    {!sinPropuesta && (
                      <button
                        type="button"
                        onClick={aplicarRevision}
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          padding: "10px 20px",
                          borderRadius: 8,
                          background: decisionColor,
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {ctaLabel}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* Modal fullscreen del preview */}
      {previewFullscreen && docHtml && (
        <div
          onClick={() => setPreviewFullscreen(false)}
          style={{
            position:"fixed", inset:0, zIndex:1100,
            background:"rgba(15,23,42,0.85)",
            backdropFilter:"blur(4px)",
            display:"flex", flexDirection:"column",
            padding:"24px 24px 16px",
          }}
        >
          {/* Toolbar superior */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:14, color:"white", flexShrink:0 }}
          >
            <div style={{ display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:13, fontWeight:700 }}>Vista Previa · {previewMode === "fase" ? currentFaseDef.label : "Documento completo"}</div>
              <div style={{ fontSize:11, opacity:0.7, marginTop:2 }}>
                ESC para cerrar · Zoom: {Math.round(previewZoom * 100)}%
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {/* Zoom en fullscreen */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:2, padding:3, borderRadius:8, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)" }}>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(z => Math.max(0.75, +(z - 0.25).toFixed(2)))}
                  disabled={previewZoom <= 0.75}
                  style={{ width:28, height:24, fontSize:15, fontWeight:700, border:"none", background:"transparent", cursor: previewZoom <= 0.75 ? "not-allowed" : "pointer", color:"white", opacity: previewZoom <= 0.75 ? 0.4 : 1, borderRadius:5 }}
                >−</button>
                <span style={{ fontSize:11.5, fontWeight:600, minWidth:42, textAlign:"center", fontVariantNumeric:"tabular-nums" }}>
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(z => Math.min(1.5, +(z + 0.25).toFixed(2)))}
                  disabled={previewZoom >= 1.5}
                  style={{ width:28, height:24, fontSize:15, fontWeight:700, border:"none", background:"transparent", cursor: previewZoom >= 1.5 ? "not-allowed" : "pointer", color:"white", opacity: previewZoom >= 1.5 ? 0.4 : 1, borderRadius:5 }}
                >+</button>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFullscreen(false)}
                style={{ padding:"6px 14px", fontSize:12, fontWeight:600, borderRadius:7, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.1)", cursor:"pointer", color:"white" }}
              >✕ Cerrar</button>
            </div>
          </div>

          {/* Iframe grande */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flex:1, background:"white", borderRadius:10, overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}
          >
            <iframe
              ref={previewIframeFsRef}
              title="Vista previa fullscreen"
              srcDoc={docHtml}
              onLoad={() => {
                previewIframeFsRef.current?.contentDocument?.body?.style.setProperty("zoom", String(previewZoom));
              }}
              style={{ width:"100%", height:"100%", border:0, display:"block", background:"#eef0f3" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
