/**
 * Preamble + carátula UNIFRANZ oficial (Guía Cochabamba 2017).
 *
 * Paralelo a `preamble-umss.ts`. 100% determinista — NO usa IA.
 *
 * Reglas extraídas de la "Guía de Organización y Presentación de Trabajos
 * de Grado" (UNIFRANZ Cochabamba, 2017, páginas 4, 12, 14, 21, 22):
 *
 *   ✓ Fuente: Verdana 10pt en todo el cuerpo (único color permitido: negro)
 *   ✓ Papel: Carta 215.9 × 279.4 mm (US Letter)
 *   ✓ Márgenes: superior 2.5 / izquierdo 3.5 / inferior 2.5 / derecho 2.5 cm
 *   ✓ Interlineado: 1.5 · 6pt posteriores · sin sangría (parindent 0)
 *   ✓ Numeración: inferior derecha · preliminares en romanos minúsculos
 *     (i, ii, iii) · cuerpo en arábigos desde INTRODUCCIÓN (página 1)
 *   ✓ Jerarquía de títulos:
 *       - PROYECTO DE INVESTIGACIÓN: Verdana 16, MAYÚS, Negrilla
 *       - CAPÍTULO I — MARCO TEÓRICO: Verdana 14, MAYÚS, Negrilla
 *       - 1.1: Verdana 12, Tipo Título, Negrilla
 *       - 1.1.1: Verdana 10, Tipo Título, Negrilla
 *       - 1.1.1.1: Verdana 10, Tipo Título, Negrilla + Cursiva
 *   ✓ Tapa: color plomo con letras doradas, fuente Verdana
 *
 * NOTA sobre Verdana: Overleaf no tiene Verdana como fuente PDF nativa
 * (es una fuente Microsoft propietaria). Usamos `helvet` (Helvetica) como
 * sustituto sans-serif sin pérdida de aspecto. Si el cliente compila local
 * con LuaLaTeX/XeLaTeX, puede activar `fontspec` y cargar Verdana real.
 */

export interface UnifranzDatosCaratula {
  /** Nombre completo del estudiante (POSTULANTE). */
  nombre: string;
  /** Título del trabajo (sin comillas — se agregan automáticamente). */
  titulo: string;
  /** Modalidad: "TESIS", "PROYECTO DE GRADO" o "TRABAJO DIRIGIDO". */
  modalidad: string;
  /** Nombre de la carrera (ej. "INGENIERÍA ECONÓMICA Y FINANCIERA"). */
  carrera: string;
  /** Facultad (ej. "CIENCIAS ECONÓMICAS Y EMPRESARIALES"). */
  facultad: string;
  /** Nombre de la universidad (constante: "UNIVERSIDAD PRIVADA FRANZ TAMAYO"). */
  universidad: string;
  /** Ciudad (ej. "Cochabamba"). */
  ciudad: string;
  /** País (ej. "Bolivia"). */
  pais: string;
  /** Año de defensa. */
  anio: string;
  /** Grado académico + nombre completo del tutor (ej. "Lic. María Pérez"). */
  tutor?: string;
}

/** Escapa caracteres LaTeX especiales en texto plano (carátula, etc.). */
function escLatex(s: string): string {
  return (s ?? "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[{}]/g, (m) => `\\${m}`)
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Preámbulo completo: \documentclass + paquetes + configuración títulos.
 *
 * Compatible con Overleaf free. tikz/pgfplots se cargan para soporte de
 * gráficos en el Marco Práctico / Investigación / Plan de Negocios.
 */
export function buildPreambleUNIFRANZ(): string {
  return [
    "\\documentclass[10pt,letterpaper]{report}",
    "",
    "% --- Paquetes base ---",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[spanish,es-tabla,es-noshorthands]{babel}",
    "% UNIFRANZ exige Verdana (Microsoft, no portable). Usamos Helvetica",
    "% como sustituto sans-serif equivalente. Si se compila con XeLaTeX/LuaLaTeX",
    "% se puede cambiar a fontspec + Verdana real.",
    "\\usepackage{helvet}",
    "\\renewcommand{\\familydefault}{\\sfdefault}",
    "\\usepackage{microtype}",
    "",
    "% --- Geometría UNIFRANZ (pág. 12 de la guía) ---",
    "% Superior 2.5cm · Izquierdo 3.5cm · Inferior 2.5cm · Derecho 2.5cm",
    "\\usepackage{geometry}",
    "\\geometry{letterpaper, top=2.5cm, left=3.5cm, bottom=2.5cm, right=2.5cm}",
    "",
    "% --- Espaciado UNIFRANZ ---",
    "% Interlineado 1.5 · 6pt posteriores · SIN sangría (parindent 0)",
    "\\usepackage{setspace}",
    "\\onehalfspacing",
    "\\setlength{\\parindent}{0pt}",
    "\\setlength{\\parskip}{6pt plus 1pt minus 1pt}",
    "",
    "% --- Citas y comillas (APA, UNIFRANZ pág. 9-11) ---",
    "\\usepackage{csquotes}",
    "\\usepackage{hanging}              % Sangría francesa en bibliografía",
    "",
    "% --- Gráficos, figuras, tablas ---",
    "\\usepackage{graphicx}",
    "\\usepackage{float}",
    "\\usepackage{booktabs}",
    "\\usepackage{array}",
    "\\usepackage{tabularx}",
    "\\usepackage{longtable}",
    "\\usepackage{ltablex}",
    "\\usepackage{makecell}",
    "\\usepackage{multirow}",
    "\\usepackage{adjustbox}",
    "\\usepackage{caption}",
    "\\usepackage{pdflscape}",
    "\\usepackage{xcolor}",
    "% Colores oficiales UNIFRANZ (tapa plomo + dorado).",
    "\\definecolor{unifranzPlomo}{HTML}{6E6E6E}",
    "\\definecolor{unifranzDorado}{HTML}{C9A227}",
    "",
    "% --- Soporte gráficos analíticos ---",
    "\\usepackage{tikz}",
    "\\usepackage{pgfplots}",
    "\\pgfplotsset{compat=1.18}",
    "\\IfFileExists{pgf-pie.sty}{\\usepackage{pgf-pie}}{}",
    "\\usetikzlibrary{shapes.geometric, shapes.symbols, shapes.misc}",
    "\\usetikzlibrary{arrows, arrows.meta}",
    "\\usetikzlibrary{positioning, calc, fit, backgrounds}",
    "\\usetikzlibrary{decorations.pathreplacing, decorations.markings}",
    "\\tikzset{",
    "  block/.style={rectangle, draw, thick, fill=blue!10, text width=3cm, text centered, minimum height=1cm, rounded corners=2pt},",
    "  decision/.style={diamond, draw, thick, fill=yellow!20, text width=2.5cm, text centered, inner sep=2pt, aspect=2},",
    "  process/.style={rectangle, draw, thick, fill=green!10, text width=3cm, text centered, minimum height=1cm, rounded corners=2pt},",
    "  input/.style={trapezium, draw, thick, fill=orange!20, trapezium left angle=70, trapezium right angle=110, text width=2.5cm, text centered, minimum height=1cm},",
    "  cloudbox/.style={ellipse, draw, thick, fill=red!10, text width=3cm, text centered, minimum height=1cm},",
    "  arrow/.style={->, >=stealth, thick},",
    "}",
    "",
    "% --- Índice, encabezados, hipervínculos ---",
    "\\usepackage{tocloft}",
    "\\usepackage{titlesec}",
    "\\usepackage{fancyhdr}",
    "\\usepackage{hyperref}",
    "\\hypersetup{hidelinks}",
    "\\usepackage{xurl}",
    "\\usepackage{enumitem}",
    "\\usepackage{amsmath}",
    "\\usepackage{amssymb}",
    "",
    "% --- Pie de página UNIFRANZ: número en INFERIOR DERECHA (pág. 12) ---",
    "\\pagestyle{fancy}",
    "\\fancyhf{}",
    "\\rfoot{\\thepage}",
    "\\renewcommand{\\headrulewidth}{0pt}",
    "\\renewcommand{\\footrulewidth}{0pt}",
    "",
    "% --- Numeración arábiga de capítulos ---",
    "\\counterwithin{table}{chapter}",
    "\\counterwithin{figure}{chapter}",
    "% UNIFRANZ usa 'Tabla' (estándar APA), no 'Cuadro' como UMSS.",
    "\\renewcommand{\\tablename}{Tabla}",
    "\\renewcommand{\\listtablename}{Índice de Tablas}",
    "\\renewcommand{\\figurename}{Figura}",
    "\\renewcommand{\\listfigurename}{Índice de Figuras}",
    "",
    "% Compactar el espacio del \\chapter (sin franja blanca enorme)",
    "\\makeatletter",
    "\\def\\@makechapterhead#1{%",
    "  \\vspace*{0pt}%",
    "  {\\parindent \\z@ \\centering \\normalfont",
    "    \\interlinepenalty\\@M",
    "    \\fontsize{14pt}{17pt}\\bfseries\\MakeUppercase{\\@chapapp\\space\\thechapter}\\par\\nobreak",
    "    \\vskip 8pt",
    "    \\fontsize{14pt}{17pt}\\bfseries\\MakeUppercase{#1}\\par\\nobreak",
    "    \\vskip 18pt",
    "  }}",
    "\\def\\@makeschapterhead#1{%",
    "  \\vspace*{0pt}%",
    "  {\\parindent \\z@ \\centering \\normalfont",
    "    \\interlinepenalty\\@M",
    "    \\fontsize{14pt}{17pt}\\bfseries\\MakeUppercase{#1}\\par\\nobreak",
    "    \\vskip 18pt",
    "  }}",
    "\\makeatother",
    "",
    "% --- Jerarquía de títulos UNIFRANZ (pág. 12) ---",
    "% Cap.I / MARCO TEÓRICO: 14pt MAYÚS Negrilla (manejado arriba)",
    "% 1.1: 12pt Tipo Título Negrilla",
    "% 1.1.1: 10pt Tipo Título Negrilla",
    "% 1.1.1.1: 10pt Tipo Título Negrilla + Cursiva",
    "\\titleformat{\\section}",
    "  {\\normalfont\\fontsize{12pt}{14pt}\\bfseries}",
    "  {\\thesection}{0.5em}{}",
    "\\titlespacing*{\\section}{0pt}{1em}{0.5em}",
    "",
    "\\titleformat{\\subsection}",
    "  {\\normalfont\\fontsize{10pt}{12pt}\\bfseries}",
    "  {\\thesubsection}{0.5em}{}",
    "\\titlespacing*{\\subsection}{0pt}{0.8em}{0.4em}",
    "",
    "\\titleformat{\\subsubsection}",
    "  {\\normalfont\\fontsize{10pt}{12pt}\\bfseries\\itshape}",
    "  {\\thesubsubsection}{0.5em}{}",
    "\\titlespacing*{\\subsubsection}{0pt}{0.7em}{0.3em}",
    "",
    "\\begin{document}",
    "",
  ].join("\n");
}

/**
 * Carátula UNIFRANZ oficial — pág. 4 y Anexo 1 (pág. 21) de la guía.
 *
 * Estructura:
 *   - Cabecera centrada: UNIVERSIDAD (18, MAYÚS, Negrilla) + FACULTAD + CARRERA (16, MAYÚS, Negrilla)
 *   - Escudo 6 cm × 5.5 cm (placeholder si no se sube)
 *   - Título entre comillas (Verdana 18, MAYÚS, Negrilla)
 *   - Modalidad: TESIS / PROYECTO / TRABAJO DIRIGIDO + leyenda de Licenciatura
 *     (Verdana 14, MAYÚS, Negrilla, alineado a la derecha)
 *   - POSTULANTE + TUTOR (Verdana 12, sin negrilla)
 *   - Ciudad – País + Año (Verdana 12, sin negrilla, centrado)
 */
export function buildCaratulaUNIFRANZ(d: UnifranzDatosCaratula): string {
  const universidad = (d.universidad || "UNIVERSIDAD PRIVADA FRANZ TAMAYO").toUpperCase();
  const facultad = (d.facultad || "FACULTAD").toUpperCase();
  const carrera = (d.carrera || "CARRERA").toUpperCase();
  const modalidad = (d.modalidad || "TRABAJO FINAL DE GRADO").toUpperCase();

  return [
    "% ===== CARÁTULA UNIFRANZ (Anexo 1 de la guía 2017) =====",
    "\\begin{titlepage}",
    "\\thispagestyle{empty}",
    "",
    "\\begin{center}",
    `{\\fontsize{18pt}{22pt}\\selectfont \\bfseries ${escLatex(universidad)}}\\\\[8pt]`,
    `{\\fontsize{16pt}{20pt}\\selectfont \\bfseries ${escLatex(facultad)}}\\\\[8pt]`,
    `{\\fontsize{16pt}{20pt}\\selectfont \\bfseries ${escLatex(carrera)}}`,
    "",
    "\\vspace{1.2cm}",
    "",
    "\\IfFileExists{logos/unifranz.png}{%",
    "  \\includegraphics[width=6cm,height=5.5cm,keepaspectratio]{logos/unifranz.png}%",
    "}{%",
    "  \\framebox[6cm]{\\parbox[c][5.5cm][c]{5.6cm}{\\centering\\footnotesize Escudo\\\\UNIFRANZ}}%",
    "}",
    "",
    "\\vspace{1.2cm}",
    "",
    `{\\fontsize{18pt}{22pt}\\selectfont \\bfseries \\textquotedblleft ${escLatex(d.titulo.toUpperCase())}\\textquotedblright}`,
    "",
    "\\vspace{1.5cm}",
    "",
    // Modalidad: alineada a la derecha (guía pág. 14).
    "\\begin{flushright}",
    `{\\fontsize{14pt}{18pt}\\selectfont \\bfseries ${escLatex(modalidad)} PARA OPTAR}\\\\[4pt]`,
    `{\\fontsize{14pt}{18pt}\\selectfont \\bfseries AL GRADO ACADÉMICO DE LICENCIATURA EN}\\\\[4pt]`,
    `{\\fontsize{14pt}{18pt}\\selectfont \\bfseries ${escLatex(carrera)}}`,
    "\\end{flushright}",
    "",
    "\\vspace{1.5cm}",
    "",
    // POSTULANTE y TUTOR en mayúsculas, nombres tal cual, sin negrilla (guía pág. 14).
    `{\\fontsize{12pt}{15pt}\\selectfont POSTULANTE: ${escLatex(d.nombre)}}`,
    d.tutor
      ? `\\\\[6pt]\n{\\fontsize{12pt}{15pt}\\selectfont TUTOR: ${escLatex(d.tutor)}}`
      : "",
    "",
    "\\vfill",
    "",
    // Ciudad – País y año: tamaño 12, sin negrilla (guía pág. 14).
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.ciudad)} -- ${escLatex(d.pais)}}\\\\[4pt]`,
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.anio)}}`,
    "\\end{center}",
    "\\end{titlepage}",
    "",
  ].filter((l) => l !== "").join("\n");
}

/** Cabecera para el Resumen (UNIFRANZ exige 250 palabras, pág. 6 de la guía). */
export function buildResumenHeaderUNIFRANZ(): string {
  return [
    "% ===== RESUMEN (250 palabras, UNIFRANZ pág. 6) =====",
    "\\pagenumbering{roman}",
    "\\setcounter{page}{1}",
    "\\section*{RESUMEN}",
    "\\addcontentsline{toc}{section}{RESUMEN}",
    "",
  ].join("\n");
}

/** Índice general (después del resumen, antes de la INTRODUCCIÓN). */
export function buildIndiceUNIFRANZ(): string {
  return [
    "% ===== ÍNDICE DE CONTENIDO =====",
    "\\newpage",
    "\\renewcommand{\\contentsname}{ÍNDICE}",
    "\\tableofcontents",
    "\\newpage",
    "% UNIFRANZ exige arábigos desde INTRODUCCIÓN (página 1).",
    "\\pagenumbering{arabic}",
    "\\setcounter{page}{1}",
    "",
  ].join("\n");
}

/** Cabecera de bibliografía (al final). */
export function buildBibliografiaHeaderUNIFRANZ(): string {
  return [
    "% ===== BIBLIOGRAFÍA (APA, apellidos en minúscula — UNIFRANZ pág. 7) =====",
    "\\newpage",
    "\\section*{BIBLIOGRAFÍA}",
    "\\addcontentsline{toc}{section}{BIBLIOGRAFÍA}",
    "",
  ].join("\n");
}

/** Cierre del documento. */
export function buildFinDocumentoUNIFRANZ(): string {
  return "\n\\end{document}\n";
}
