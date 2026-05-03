/**
 * LaTeX Builder — Formato UMSS
 *
 * Convierte el contenido de las fases de un proyecto en código LaTeX
 * listo para compilar con pdflatex (sin dependencias externas).
 *
 * Formato obligatorio UMSS:
 *  - Márgenes: left 3cm · top 3cm · right 2.5cm · bottom 2.5cm
 *  - Tipografía: Times New Roman (mathptmx)
 *  - Interlineado: 1.5
 *  - Portada, tabla de contenidos y secciones por fase
 */

export interface ProyectoParaLatex {
  titulo:             string;
  autor:              string;
  institucion?:       string;
  carrera?:           string;
  anio?:              string;
  mes?:               string;
  tutor?:             string;
  programa?:          string;
  version?:           string;
  tema_aprobado?:     string;
  // Contenido por fase (texto plano o Markdown simple)
  contenido_fase_0?:  string | null;   // Tema / Planteamiento
  contenido_fase_1?:  string | null;   // Capítulo I
  contenido_fase_2?:  string | null;   // Capítulo II
  contenido_fase_3?:  string | null;   // Capítulos III-V
  contenido_fase_4?:  string | null;   // Revisión / Compilación
  contenido_fase_5?:  string | null;   // Entrega Final
}

// ── Sanitizador LaTeX ─────────────────────────────────────────

const LATEX_ESCAPES: [RegExp, string][] = [
  [/\\/g,  "\\textbackslash{}"],
  [/&/g,   "\\&"],
  [/%/g,   "\\%"],
  [/\$/g,  "\\$"],
  [/#/g,   "\\#"],
  [/_/g,   "\\_"],
  [/\{/g,  "\\{"],
  [/\}/g,  "\\}"],
  [/~/g,   "\\textasciitilde{}"],
  [/\^/g,  "\\textasciicircum{}"],
];

function escapar(texto: string): string {
  // Preservar saltos de línea; solo escapar caracteres especiales
  return LATEX_ESCAPES.reduce(
    (t, [re, rep]) => t.replace(re, rep),
    texto
  );
}

// ── Conversión Markdown → LaTeX (básica) ─────────────────────

function mdALatex(texto: string): string {
  return texto
    // Encabezados
    .replace(/^#### (.+)$/gm, "\\paragraph{$1}")
    .replace(/^### (.+)$/gm,  "\\subsubsection{$1}")
    .replace(/^## (.+)$/gm,   "\\subsection{$1}")
    .replace(/^# (.+)$/gm,    "\\section{$1}")
    // Negrita e itálica
    .replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}")
    .replace(/\*(.+?)\*/g,     "\\textit{$1}")
    // Listas (guión o asterisco)
    .replace(/^[-*] (.+)$/gm, "\\item $1")
    // Envolver grupos de \item en itemize
    .replace(/((?:\\item .+\n?)+)/g, "\\begin{itemize}\n$1\\end{itemize}\n")
    // Párrafos: doble salto → \par
    .replace(/\n\n+/g, "\n\n")
    .trim();
}

// ── Sección con contenido (o vacía) ──────────────────────────

function seccion(titulo: string, contenido: string | null | undefined): string {
  if (!contenido?.trim()) return "";
  const cuerpo = mdALatex(contenido.trim());
  return `\n\\section{${escapar(titulo)}}\n\n${cuerpo}\n`;
}

// ── Generador principal ───────────────────────────────────────

/**
 * Genera el string completo de código LaTeX a partir de los datos del proyecto.
 * El resultado puede guardarse como `.tex` y compilarse con `pdflatex`.
 */
export function generarLatex(proyecto: ProyectoParaLatex): string {
  const {
    titulo,
    autor,
    institucion = "Universidad Mayor de San Simón",
    carrera     = "",
    anio        = new Date().getFullYear().toString(),
    mes,
    tutor,
    programa,
    version,
    tema_aprobado,
    contenido_fase_0,
    contenido_fase_1,
    contenido_fase_2,
    contenido_fase_3,
    contenido_fase_4,
    contenido_fase_5,
  } = proyecto;

  // ── Preámbulo ─────────────────────────────────────────────
  const preambulo = `\\documentclass[12pt,a4paper]{report}

% ── Codificación y lenguaje ──────────────────────────────────
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[spanish]{babel}

% ── Tipografía Times New Roman (UMSS) ────────────────────────
\\usepackage{mathptmx}

% ── Márgenes UMSS ────────────────────────────────────────────
\\usepackage[left=3cm, top=3cm, right=2.5cm, bottom=2.5cm]{geometry}

% ── Interlineado 1.5 (UMSS) ──────────────────────────────────
\\linespread{1.5}

% ── Hipervínculos y colores ───────────────────────────────────
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}

% ── Encabezados y pies de página ─────────────────────────────
\\usepackage{fancyhdr}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[R]{\\small\\textit{${escapar(titulo)}}}
\\fancyhead[L]{\\small\\textit{${escapar(institucion)}}}
\\fancyfoot[C]{\\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

% ── Otros paquetes útiles ────────────────────────────────────
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{enumitem}
\\usepackage{parskip}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}

% ── Datos del documento ───────────────────────────────────────
\\title{${escapar(titulo)}}
\\author{${escapar(autor)}}
\\date{${escapar(anio)}}`;

  // ── Portada ───────────────────────────────────────────────
  const portada = `
\\begin{document}

\\begin{titlepage}
  \\centering
  \\vspace*{2cm}
  {\\large\\bfseries ${escapar(institucion)}\\par}
  \\vspace{0.5cm}
  ${programa ? `{\\large ${escapar(programa)}${version ? ` -- Versión ${escapar(version)}` : ''}\\par}\\vspace{0.5cm}` : ''}
  ${carrera ? `{\\large ${escapar(carrera)}\\par}\n  \\vspace{1.5cm}` : "\\vspace{1.5cm}"}
  {\\Huge\\bfseries ${escapar(titulo)}\\par}
  \\vspace{1cm}
  ${tema_aprobado ? `{\\large \\textit{${escapar(tema_aprobado)}}}\\par\n  \\vspace{1.5cm}` : "\\vspace{1.5cm}"}
  {\\large Autor/a: ${escapar(autor)}\\par}
  \\vspace{0.5cm}
  ${tutor ? `{\\large Tutor/a: ${escapar(tutor)}\\par}` : ''}
  \\vfill
  {\\large ${mes ? escapar(mes) + ' ' : ''}${escapar(anio)}\\par}
\\end{titlepage}`;

  // ── Paginación romana para prefacio ──────────────────────
  const prefacio = `
\\pagenumbering{roman}
\\tableofcontents
\\clearpage
\\pagenumbering{arabic}`;

  // ── Secciones por fase ────────────────────────────────────
  const secciones = [
    seccion("Planteamiento del Tema",             contenido_fase_0),
    seccion("Capítulo I — Marco Referencial",     contenido_fase_1),
    seccion("Capítulo II — Marco Teórico",        contenido_fase_2),
    seccion("Capítulos III al V — Desarrollo",    contenido_fase_3),
    seccion("Revisión y Compilación",             contenido_fase_4),
    seccion("Conclusiones y Bibliografía Final",  contenido_fase_5),
  ].join("\n");

  const fin = "\n\\end{document}\n";

  return [preambulo, portada, prefacio, secciones, fin].join("\n");
}

/**
 * Genera nombre de archivo sugerido a partir del título del proyecto.
 */
export function nombreArchivoLatex(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) + ".tex";
}
