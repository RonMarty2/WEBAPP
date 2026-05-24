// LaTeX document builder for monografías.
// Format: 12pt, letterpaper, Times New Roman, 2.54 cm margins, 1.5 spacing.

import { getUniversityTemplate, type CaratulaInput } from "./universityTemplates";

export interface CitaBiblio {
  autor: string;
  ano?: number;
  titulo_obra: string;
  fuente?: string;
  tipo?: string;
  formato_apa?: string;
}

export interface MonografiaLatexInput {
  titulo: string;
  diplomado?: string;
  caratulaPdf?: string; // filename, e.g. "caratula.pdf"
  capituloContenidos: { numero: number; titulo: string; contenido: string }[];
  bibliografia: CitaBiblio[];
  /** ID de universidad (umsa | umss | ucb | upb | upea | usfx). Default: umss */
  universidad_id?: string;
  /** Datos opcionales de la carátula de respaldo (cuando no hay caratulaPdf) */
  caratulaData?: CaratulaInput;
}

/**
 * Limpia caracteres Unicode "problemáticos" que rompen pdflatex con
 * inputenc utf8. La IA al generar markdown a veces incluye caracteres
 * de dibujo de cajas, dashes especiales, comillas tipográficas, etc.
 * que pdflatex no soporta por default.
 *
 * Si NO se hace esta limpieza, el .tex falla con:
 *   "! LaTeX Error: Unicode character ─ (U+2500) not set up for use with LaTeX"
 */
function sanearUnicodeParaLatex(text: string): string {
  if (!text) return "";
  return text
    // Box-drawing (cajas) U+2500–U+257F → guion ASCII
    .replace(/[─-╿]/g, "-")
    // Block elements U+2580–U+259F → espacio
    .replace(/[▀-▟]/g, " ")
    // Dashes especiales (figure dash, en-dash, em-dash, horizontal bar)
    .replace(/[‐-―]/g, "-")
    // Comillas tipográficas izquierdas/derechas → comillas rectas
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    // Primes (′ ″ ‴) → comillas rectas
    .replace(/′/g, "'")
    .replace(/″/g, '"')
    // Horizontal ellipsis (…) → tres puntos
    .replace(/…/g, "...")
    // Bullets (• ‣ ⁃) → guion
    .replace(/[•‣⁃]/g, "-")
    // Espacios especiales (no-break space, thin space, etc.) → espacio normal
    .replace(/[  -​  　]/g, " ")
    // Soft hyphen → vacío
    .replace(/­/g, "")
    // Zero-width joiners y similares → vacío
    .replace(/[‌‍⁠﻿]/g, "")
    // ── Emojis comunes en el output de la IA — reemplazar por marker ASCII
    // o eliminar. pdflatex con inputenc utf8 los rechaza si no están en
    // un paquete tipo fontspec/emoji. Reemplazamos por equivalente textual
    // que conserva el sentido sin romper la compilación.
    .replace(/⚠️?|⚠/g, "[!]")                  // warning
    .replace(/✅|✓/g, "[OK]")                       // check
    .replace(/❌|✗/g, "[X]")                        // cross
    .replace(/⭐|★|☆/g, "*")                       // star
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")          // emojis Unicode 13+ (📊📈📉📄📋📌🗺💡🎯🚀🔄✏💬🏭☕🌾...)
    .replace(/[\u{2600}-\u{27BF}]/gu, "")            // miscellaneous symbols
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "");           // variation selectors
}

/**
 * Escapes special LaTeX characters in plain text (non-formatted).
 * Aplica también saneo de Unicode problemático.
 */
export function escaparLatexPlain(text: string): string {
  if (!text) return "";
  return sanearUnicodeParaLatex(text)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\$/g, "\\$")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}")
    .replace(/«/g, "\\guillemotleft{}")
    .replace(/»/g, "\\guillemotright{}");
}

// Keep old name for backward compat
export const escaparLatex = escaparLatexPlain;

/**
 * Converts Markdown-flavored text to LaTeX, handling:
 * - # ## ### headings → \section \subsection \subsubsection
 * - **bold** → \textbf, *italic* → \textit
 * - | table | rows | → tabular environment
 * - - bullet items → itemize
 * - Numbered lists → enumerate
 * - Blank lines → paragraph breaks
 */
export function mdALatex(text: string): string {
  if (!text) return "";
  // ⚠️ CRÍTICO: sanear Unicode ANTES de procesar líneas. La IA suele
  // generar caracteres de dibujo (─), comillas tipográficas ("") o
  // ellipsis (…) en el markdown. pdflatex con inputenc utf8 los rechaza
  // con "Unicode character not set up for use with LaTeX".
  // sanearUnicodeParaLatex los reemplaza por equivalentes ASCII compatibles.
  text = sanearUnicodeParaLatex(text);
  const lines = text.split("\n");
  const out: string[] = [];
  let inItemize = false;
  let inEnumerate = false;
  let inTabular = false;
  let tabularCols = 0;
  // 📊 Detección de bloques ```latex ... ``` (TikZ, pgfplots, figure, etc.)
  // Estos bloques se pegan TAL CUAL al .tex final, sin escapar caracteres.
  // El preamble tiene tikz + pgfplots + pgf-pie, así que el compilador
  // LaTeX renderiza el gráfico real en el PDF.
  let inLatexBlock = false;

  function closeList() {
    if (inItemize) { out.push("\\end{itemize}"); inItemize = false; }
    if (inEnumerate) { out.push("\\end{enumerate}"); inEnumerate = false; }
  }
  function closeTabular() {
    if (inTabular) {
      out.push("\\end{tabular}");
      out.push("\\end{center}");
      inTabular = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // 📊 Bloque LaTeX raw (```latex / ```tex / ```tikz)
    const fenceMatch = line.match(/^\s*```(latex|tex|tikz|pgfplots)?\s*$/i);
    if (fenceMatch) {
      const lang = (fenceMatch[1] ?? "").toLowerCase();
      if (!inLatexBlock && (lang === "latex" || lang === "tex" || lang === "tikz" || lang === "pgfplots")) {
        // Abrir bloque LaTeX: cerrar listas/tablas y entrar en modo raw
        closeList();
        closeTabular();
        inLatexBlock = true;
        continue;
      }
      if (inLatexBlock) {
        // Cierre del bloque ```
        inLatexBlock = false;
        out.push(""); // separador
        continue;
      }
      // Bloque de código de OTRO lenguaje → lo pasamos a verbatim
      closeList();
      closeTabular();
      out.push("\\begin{verbatim}");
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        out.push(lines[i]);
        i++;
      }
      out.push("\\end{verbatim}");
      continue;
    }
    if (inLatexBlock) {
      // Dentro del bloque LaTeX: pasar la línea TAL CUAL, sin escapar
      out.push(raw);
      continue;
    }

    // Table row detection
    if (/^\s*\|/.test(line)) {
      const isSep = /^\s*\|[\s\-|:]+\|?\s*$/.test(line);
      if (isSep) continue; // skip separator rows

      closeList();
      const cells = line
        .replace(/^\s*\|/, "")
        .replace(/\|?\s*$/, "")
        .split("|")
        .map(c => escaparLatexPlain(c.trim()));

      if (!inTabular) {
        tabularCols = cells.length;
        const colSpec = Array(tabularCols).fill("p{\\dimexpr\\linewidth/" + tabularCols + "-2\\tabcolsep}").join("|");
        out.push("\\begin{center}");
        out.push(`\\begin{tabular}{|${colSpec}|}`);
        out.push("\\hline");
        inTabular = true;
      }
      out.push(cells.join(" & ") + " \\\\ \\hline");
      continue;
    }

    // Non-table line: close tabular if open
    if (inTabular) closeTabular();

    // Headings
    const h1 = line.match(/^# (.+)$/);
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    const h4 = line.match(/^#### (.+)$/);
    if (h1 || h2 || h3 || h4) {
      closeList();
      const title = escaparLatexPlain((h1 || h2 || h3 || h4)![1]);
      if (h1) out.push(`\\section{${title}}`);
      else if (h2) out.push(`\\subsection{${title}}`);
      else if (h3) out.push(`\\subsubsection{${title}}`);
      else out.push(`\\paragraph{${title}}`);
      continue;
    }

    // Markdown blockquote (> texto): convertir a quote environment LaTeX
    // en vez de dejar que el > se escape a \textgreater{}
    if (/^>\s?/.test(line)) {
      closeList();
      const buf: string[] = [];
      // Empezamos consumiendo la línea actual y seguimos mientras haya >
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        const contenido = lines[i].trim().replace(/^>\s?/, "").trim();
        if (contenido) buf.push(escaparLatexPlain(contenido));
        i++;
      }
      // Compensar el i++ del for principal: el while ya nos dejó en la
      // primera línea NO-blockquote, queremos que el for la procese.
      i--;
      if (buf.length > 0) {
        out.push("\\begin{quote}");
        out.push(buf.join(" "));
        out.push("\\end{quote}");
      }
      continue;
    }

    // Bullet list
    const bullet = line.match(/^[-*] (.+)$/);
    if (bullet) {
      if (!inItemize) { closeList(); out.push("\\begin{itemize}"); inItemize = true; }
      out.push(`  \\item ${inlineLatex(bullet[1])}`);
      continue;
    }

    // Numbered list
    const numbered = line.match(/^\d+\. (.+)$/);
    if (numbered) {
      if (!inEnumerate) { closeList(); out.push("\\begin{enumerate}"); inEnumerate = true; }
      out.push(`  \\item ${inlineLatex(numbered[1])}`);
      continue;
    }

    // Close list on blank or normal line
    if (line.trim() === "") {
      closeList();
      out.push("");
      continue;
    }

    closeList();
    out.push(inlineLatex(line));
  }

  closeList();
  closeTabular();
  return out.join("\n");
}

function inlineLatex(text: string): string {
  // Escape special chars first (but not * which we need for bold/italic)
  let t = text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\$/g, "\\$")
    .replace(/%/g, "\\%")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}")
    .replace(/&/g, "\\&");
  // Bold and italic
  t = t.replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}");
  t = t.replace(/\*(.+?)\*/g, "\\textit{$1}");
  return t;
}

/**
 * Converts a list of APA citations to LaTeX thebibliography entries.
 */
function generarBibliografiaLatex(citas: CitaBiblio[]): string {
  const unicas = new Map<string, CitaBiblio>();
  for (const c of citas) {
    const key = `${c.autor}_${c.ano}_${c.titulo_obra}`.toLowerCase().replace(/\s+/g, "");
    if (!unicas.has(key)) unicas.set(key, c);
  }

  const ordenadas = [...unicas.values()].sort((a, b) =>
    (a.autor ?? "").localeCompare(b.autor ?? "", "es")
  );

  const items = ordenadas.map((c, i) => {
    const key = `ref${i + 1}`;
    const apa = c.formato_apa
      ?? `${c.autor} (${c.ano ?? "s.f."}). ${c.titulo_obra}. ${c.fuente ?? ""}.`;
    return `  \\bibitem{${key}} ${inlineLatex(apa)}`;
  });

  return [
    "\\newpage",
    "\\section*{REFERENCIAS BIBLIOGRÁFICAS}",
    "\\addcontentsline{toc}{section}{REFERENCIAS BIBLIOGRÁFICAS}",
    "\\begin{thebibliography}{99}",
    ...items,
    "\\end{thebibliography}",
  ].join("\n");
}

/**
 * Builds the full LaTeX source for a monografía.
 */
export function generarLatexMonografia(input: MonografiaLatexInput): string {
  const { titulo, diplomado, caratulaPdf, capituloContenidos, bibliografia, universidad_id, caratulaData } = input;
  const uniTpl = getUniversityTemplate(universidad_id);
  const { izq, der, sup, inf } = uniTpl.margenes;
  const spacingCmd = uniTpl.espaciado === 2.0 ? "\\doublespacing" : "\\onehalfspacing";

  const capTitulos: Record<number, string> = {
    1: "CAPÍTULO I: PLANTEAMIENTO DEL PROBLEMA",
    2: "CAPÍTULO II: MARCO TEÓRICO Y REFERENCIAL",
    3: "CAPÍTULO III: DISEÑO METODOLÓGICO",
    4: "CAPÍTULO IV: ANÁLISIS DE RESULTADOS",
    5: "CAPÍTULO V: CONCLUSIONES Y RECOMENDACIONES",
  };

  const capitulosLatex = capituloContenidos
    .filter(c => c.numero >= 1 && c.numero <= 5)
    .sort((a, b) => a.numero - b.numero)
    .map(c => {
      const tituloSec = capTitulos[c.numero] ?? c.titulo ?? `CAPÍTULO ${c.numero}`;
      const body = mdALatex(c.contenido);
      return [
        `\\newpage`,
        `\\section{${escaparLatexPlain(tituloSec)}}`,
        `\\addcontentsline{toc}{section}{${escaparLatexPlain(tituloSec)}}`,
        "",
        body,
      ].join("\n");
    })
    .join("\n\n");

  const caratulaBlock = caratulaPdf
    ? `\\includepdf[pages=1]{${caratulaPdf}}\n\\newpage`
    : uniTpl.buildCaratula(caratulaData ?? { titulo, diplomado });

  // mathptmx es la versión moderna de "times" — funciona en Overleaf y MiKTeX
  // sin el warning "package times is obsolete" y NO requiere fontspec.
  const fontPackage = uniTpl.fuente === "arial"
    ? "\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}"
    : "\\usepackage{mathptmx}";

  return `\\documentclass[12pt, letterpaper]{article}

% --- Paquetes -----------------------------------------------
\\usepackage[utf8]{inputenc}
\\usepackage[spanish,es-noshorthands]{babel}
${fontPackage}
\\usepackage[left=${izq}cm, right=${der}cm, top=${sup}cm, bottom=${inf}cm]{geometry}
\\usepackage{setspace}
${spacingCmd}
${uniTpl.preambleExtras ?? ""}
\\usepackage{float}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage{booktabs}
\\usepackage{xcolor}
\\usepackage{parskip}
\\setlength{\\parskip}{0.45em}
\\usepackage{fancyhdr}
\\usepackage{hyperref}
\\hypersetup{hidelinks}
\\usepackage{graphicx}
% 📊 Soporte para gráficos pgfplots/TikZ (fases analíticas).
% pgf-pie se carga SOLO si está disponible — no es estándar en Overleaf free,
% si no está instalado simplemente se omite (los gráficos de torta usan
% pgfplots como fallback).
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\IfFileExists{pgf-pie.sty}{\\usepackage{pgf-pie}}{}
${caratulaPdf ? "\\usepackage{pdfpages}" : ""}

% --- Encabezados y pies de página ---------------------------
\\pagestyle{fancy}
\\fancyhf{}
\\rfoot{\\thepage}
\\renewcommand{\\headrulewidth}{0pt}

% --- Profundidad de secciones (UMSS: arábigos hasta 5 niveles) --
\\setcounter{secnumdepth}{4}
\\setcounter{tocdepth}{3}
% Numeración arábiga estándar (1, 1.1, 1.1.1, etc.) — la default de
% \\article ya hace esto. No necesitamos renewcommand para sobreescribir.

\\title{${escaparLatexPlain(titulo)}}
\\author{}
\\date{}

\\begin{document}
\\thispagestyle{empty}

% --- Carátula -----------------------------------------------
${caratulaBlock}

% --- Tabla de contenidos ------------------------------------
\\pagenumbering{roman}
\\setcounter{page}{2}
\\tableofcontents
\\newpage

% --- Capítulos ----------------------------------------------
\\pagenumbering{arabic}
\\setcounter{page}{1}

${capitulosLatex}

% --- Bibliografía -------------------------------------------
${generarBibliografiaLatex(bibliografia)}

\\end{document}
`;
}
