// LaTeX document builder for monografías.
// Format: 12pt, letterpaper, Times New Roman, 2.54 cm margins, 1.5 spacing.

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
}

/**
 * Escapes special LaTeX characters in plain text.
 */
export function escaparLatex(text: string): string {
  if (!text) return "";
  return text
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
    .replace(/\*\*(.*?)\*\*/g, "\\textbf{$1}")
    .replace(/\*(.*?)\*/g, "\\textit{$1}")
    .replace(/\n\n/g, "\n\n\\noindent ")
    .replace(/\n/g, " \\\\\n");
}

/**
 * Converts a list of APA citations to LaTeX thebibliography entries.
 */
function generarBibliografiaLatex(citas: CitaBiblio[]): string {
  const ordenadas = [...citas].sort((a, b) =>
    (a.autor ?? "").localeCompare(b.autor ?? "")
  );

  const items = ordenadas.map((c, i) => {
    const key = `ref${i + 1}`;
    const apa = c.formato_apa ?? `${c.autor} (${c.ano ?? "s.f."}). ${c.titulo_obra}. ${c.fuente ?? ""}.`;
    return `  \\bibitem{${key}} ${escaparLatex(apa)}`;
  });

  return `\\section*{REFERENCIAS BIBLIOGRÁFICAS}\n\\begin{thebibliography}{99}\n${items.join("\n")}\n\\end{thebibliography}`;
}

/**
 * Builds the full LaTeX source for a monografía.
 */
export function generarLatexMonografia(input: MonografiaLatexInput): string {
  const { titulo, diplomado, caratulaPdf, capituloContenidos, bibliografia } = input;

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
      return `\\section{${escaparLatex(tituloSec)}}\n\n${escaparLatex(c.contenido)}`;
    })
    .join("\n\n\\newpage\n\n");

  const caratulaLine = caratulaPdf
    ? `\\includepdf{${caratulaPdf}}\n\\newpage\n`
    : `\\begin{titlepage}\n  \\centering\n  \\vspace*{3cm}\n  {\\LARGE \\textbf{${escaparLatex(titulo)}}}\\\\[1cm]\n  {\\large ${escaparLatex(diplomado ?? "")}}\\\\[3cm]\n  {\\large \\today}\n\\end{titlepage}\n\\newpage\n`;

  return `\\documentclass[12pt, letterpaper]{article}

% ─── Paquetes ───────────────────────────────────────────────
\\usepackage[utf8]{inputenc}
\\usepackage[spanish,es-noshorthands]{babel}
\\usepackage{times}
\\usepackage[left=2.54cm, right=2.54cm, top=2.54cm, bottom=2.54cm]{geometry}
\\usepackage{setspace}
\\onehalfspacing
\\usepackage{float}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage{parskip}
\\setlength{\\parskip}{0.45em}
${caratulaPdf ? "\\usepackage{pdfpages}" : ""}

% ─── Numeración de secciones sin reseteo ────────────────────
\\setcounter{secnumdepth}{4}
\\setcounter{tocdepth}{4}

\\begin{document}

% ─── Carátula ───────────────────────────────────────────────
${caratulaLine}
% ─── Tabla de contenidos ────────────────────────────────────
\\tableofcontents
\\newpage

% ─── Capítulos ──────────────────────────────────────────────
${capitulosLatex}

\\newpage

% ─── Bibliografía ───────────────────────────────────────────
${generarBibliografiaLatex(bibliografia)}

\\end{document}
`;
}
