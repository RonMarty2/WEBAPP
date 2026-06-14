/**
 * Preamble + carátula UMSS oficial (Posgrado FCE).
 *
 * 100% determinista — NO usa IA. Se ensambla con los datos del proyecto
 * y se concatena con el cuerpo (capítulos) que SÍ vienen de la IA por
 * chunking (1 llamada por capítulo).
 *
 * Este enfoque garantiza:
 *   ✓ Estructura del documento siempre correcta
 *   ✓ Numeración arábiga (UMSS)
 *   ✓ Tipografía 12pt en todo
 *   ✓ Resumen Ejecutivo antes del índice
 *   ✓ Logo del escudo izquierda + datos derecha en carátula
 *   ✓ Compilable en Overleaf free (sin paquetes raros)
 */

export interface UmssDatosCaratula {
  nombre: string;
  titulo: string;
  programa: string;
  version: string;       // ej. "1°", "5ª"
  modalidad: string;     // ej. "DIPLOMADO COMO MODALIDAD DE TITULACIÓN"
  universidad: string;
  facultad: string;
  departamento: string;
  ciudad: string;
  pais: string;
  mes: string;
  anio: string;
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
 * Preámbulo completo: \documentclass + paquetes + configuración titulos.
 *
 * Compatible con Overleaf free (sin pgf-pie, sin paquetes exóticos).
 * tikz/pgfplots se cargan condicionales para soporte de gráficos del Cap IV.
 */
export function buildPreambleUMSS(): string {
  return [
    "\\documentclass[12pt,letterpaper]{report}",
    "",
    "% --- Paquetes base ---",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[spanish,es-tabla,es-noshorthands]{babel}",
    "\\usepackage{mathptmx}              % Times New Roman clone",
    "\\usepackage{microtype}             % Mejora justificación",
    "",
    "% --- Geometría y espaciado (UMSS) ---",
    "\\usepackage{geometry}",
    "\\geometry{letterpaper, margin=2.54cm}",
    "\\usepackage{setspace}",
    "\\doublespacing                     % UMSS Posgrado: doble espacio",
    "\\usepackage{indentfirst}",
    "% Guía UMSS — 'Sin sangría al inicio de cada párrafo'. Antes estaba 1.27cm",
    "% (APA estándar) pero la guía es explícita: parindent = 0.",
    "\\setlength{\\parindent}{0pt}",
    "\\setlength{\\parskip}{0pt}",
    "\\usepackage[document]{ragged2e}     % Texto alineado a la izquierda, sin justificar (guía UMSS)",
    "",
    "% --- Citas y comillas ---",
    "\\usepackage{csquotes}",
    "\\usepackage{hanging}               % Sangría francesa en bibliografía",
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
    "",
    "% --- Soporte gráficos analíticos (Cap IV, etc.) ---",
    "% tikz + pgfplots se cargan SIEMPRE; pgf-pie solo si está disponible.",
    "\\usepackage{tikz}",
    "\\usepackage{pgfplots}",
    "\\pgfplotsset{compat=1.18}",
    "\\IfFileExists{pgf-pie.sty}{\\usepackage{pgf-pie}}{}",
    "% Librerías TikZ comunes para diagramas (flujos, árboles, formas).",
    "\\usetikzlibrary{shapes.geometric, shapes.symbols, shapes.misc}",
    "\\usetikzlibrary{arrows, arrows.meta}",
    "\\usetikzlibrary{positioning, calc, fit, backgrounds}",
    "\\usetikzlibrary{decorations.pathreplacing, decorations.markings}",
    "% Estilos predefinidos para diagramas comunes (flujos, árbol de problemas).",
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
    "% --- Encabezado y pie de página (UMSS: número en sup. derecha) ---",
    "\\pagestyle{fancy}",
    "\\fancyhf{}",
    "\\rhead{\\thepage}",
    "\\renewcommand{\\headrulewidth}{0pt}",
    "",
    "% --- Tablas y figuras (guía UMSS: 'Tabla N' / 'Gráfico N') ---",
    "% Vía \\addto\\captionsspanish para que babel NO pise estos nombres al",
    "% activar el español en \\begin{document}.",
    "\\addto\\captionsspanish{%",
    "  \\renewcommand{\\tablename}{Tabla}%",
    "  \\renewcommand{\\listtablename}{ÍNDICE DE TABLAS}%",
    "  \\renewcommand{\\figurename}{Gráfico}%",
    "  \\renewcommand{\\listfigurename}{ÍNDICE DE GRÁFICOS}%",
    "  \\renewcommand{\\contentsname}{ÍNDICE}%",
    "}",
    "% Títulos de índice y de listas: centrados y en tamaño normal (como el ejemplo).",
    "\\renewcommand{\\cfttoctitlefont}{\\hfil\\normalsize\\bfseries}",
    "\\renewcommand{\\cftaftertoctitle}{\\hfil}",
    "\\renewcommand{\\cftlottitlefont}{\\hfil\\normalsize\\bfseries}",
    "\\renewcommand{\\cftafterlottitle}{\\hfil}",
    "\\renewcommand{\\cftloftitlefont}{\\hfil\\normalsize\\bfseries}",
    "\\renewcommand{\\cftafterloftitle}{\\hfil}",
    "% Caption estilo APA 7: número en negrita, título en cursiva debajo, a la izquierda.",
    "\\captionsetup{labelfont=bf, textfont=it, labelsep=newline, justification=raggedright, singlelinecheck=false}",
    "",
    "% Compactar el espacio del \\chapter (sin franja blanca enorme)",
    "\\makeatletter",
    "\\def\\@makechapterhead#1{%",
    "  \\vspace*{0pt}%",
    "  {\\parindent \\z@ \\raggedright \\normalfont",
    "    \\interlinepenalty\\@M",
    "    \\normalsize\\bfseries\\centering",
    "    \\@chapapp\\space\\thechapter.\\space #1\\par\\nobreak",
    "    \\vskip 14pt",
    "  }}",
    "\\def\\@makeschapterhead#1{%",
    "  \\vspace*{0pt}%",
    "  {\\parindent \\z@ \\raggedright \\normalfont",
    "    \\interlinepenalty\\@M",
    "    \\normalsize\\bfseries\\centering",
    "    #1\\par\\nobreak",
    "    \\vskip 14pt",
    "  }}",
    "\\makeatother",
    "",
    "% Guía UMSS: 'Capítulo I, II, III' (romano), no '1, 2, 3'.",
    "\\renewcommand{\\thechapter}{\\Roman{chapter}}",
    "",
    "% Niveles de título APA 7 (como pide la Guía UMSS, pág. 16):",
    "\\titleformat{\\chapter}[hang]                  % Nivel 1: centrado, negrita.",
    "  {\\normalfont\\normalsize\\bfseries\\centering}",
    "  {Capítulo \\thechapter:}{0.5em}{}",
    "\\titlespacing*{\\chapter}{0pt}{0pt}{1em}",
    "",
    "\\titleformat{\\section}                        % Nivel 2: izq, negrita.",
    "  {\\normalfont\\normalsize\\bfseries}",
    "  {\\thesection}{0.5em}{}",
    "\\titlespacing*{\\section}{0pt}{1em}{0.5em}",
    "",
    "\\titleformat{\\subsection}                     % Nivel 3: izq, negrita, cursiva.",
    "  {\\normalfont\\normalsize\\bfseries\\itshape}",
    "  {\\thesubsection}{0.5em}{}",
    "",
    "% Nivel 4: izq, negrita, sangría 1.27cm, texto en MISMA línea, punto final.",
    "\\titleformat{\\subsubsection}[runin]",
    "  {\\normalfont\\normalsize\\bfseries}",
    "  {\\thesubsubsection.}{0.5em}{}",
    "\\titlespacing*{\\subsubsection}{1.27cm}{1em}{0.5em}",
    "",
    "% Nivel 5: izq, negrita, cursiva, sangría 1.27cm, misma línea, punto final.",
    "\\titleformat{\\paragraph}[runin]",
    "  {\\normalfont\\normalsize\\bfseries\\itshape}",
    "  {\\theparagraph.}{0.5em}{}",
    "\\titlespacing*{\\paragraph}{1.27cm}{1em}{0.5em}",
    "",
    "\\begin{document}",
    "",
  ].join("\n");
}

/**
 * Carátula UMSS oficial — layout 2 columnas (logo izq + datos derecha).
 * Datos inyectados por sustitución directa (sin IA).
 */
export function buildCaratulaUMSS(d: UmssDatosCaratula): string {
  return [
    "% ===== CARÁTULA UMSS POSGRADO =====",
    "\\begin{titlepage}",
    "\\thispagestyle{empty}",
    "",
    "% Bloque superior: logo izquierda + universidad derecha",
    "\\noindent",
    "\\begin{minipage}[t]{0.30\\textwidth}",
    "  \\vspace{0pt}",
    "  \\IfFileExists{logos/umss.png}{%",
    "    \\includegraphics[width=2.5cm,height=4cm,keepaspectratio]{logos/umss.png}%",
    "  }{%",
    "    \\framebox[2.5cm]{\\parbox[c][4cm][c]{2.2cm}{\\centering\\footnotesize Logo\\\\UMSS}}%",
    "  }",
    "\\end{minipage}%",
    "\\hfill%",
    "\\begin{minipage}[t]{0.66\\textwidth}",
    "  \\vspace{0pt}",
    "  \\raggedright",
    `  {\\fontsize{14pt}{17pt}\\selectfont \\textbf{${escLatex(d.universidad)}}}\\\\[4pt]`,
    `  {\\fontsize{14pt}{17pt}\\selectfont ${escLatex(d.facultad)}}\\\\[4pt]`,
    `  {\\fontsize{14pt}{17pt}\\selectfont ${escLatex(d.departamento)}}`,
    "\\end{minipage}",
    "",
    "\\vspace{2.5cm}",
    "",
    "\\begin{center}",
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.modalidad)}}`,
    "",
    "\\vspace{0.8cm}",
    "",
    `{\\fontsize{12pt}{15pt}\\selectfont DIPLOMADO EN ${escLatex(d.programa)} --- ${escLatex(d.version)} VERSIÓN}`,
    "",
    "\\vspace{2cm}",
    "",
    "{\\fontsize{14pt}{17pt}\\selectfont \\textbf{MONOGRAFÍA}}",
    "",
    "\\vspace{1.2cm}",
    "",
    `{\\fontsize{14pt}{17pt}\\selectfont ${escLatex(d.titulo)}}`,
    "",
    "\\vspace{1.5cm}",
    "",
    `{\\fontsize{14pt}{17pt}\\selectfont Estudiante: ${escLatex(d.nombre)}}`,
    d.tutor ? `\\\\[0.5cm]\n{\\fontsize{12pt}{15pt}\\selectfont Tutor: ${escLatex(d.tutor)}}` : "",
    "",
    "\\vfill",
    "",
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.ciudad)} --- ${escLatex(d.pais)}}\\\\[4pt]`,
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.mes)}, ${escLatex(d.anio)}}`,
    "\\end{center}",
    "\\end{titlepage}",
    "",
  ].filter((l) => l !== "").join("\n");
}

/** Cabecera para el Resumen Ejecutivo (antes del índice). */
export function buildResumenHeader(): string {
  return [
    "% ===== RESUMEN EJECUTIVO =====",
    "\\pagenumbering{roman}",
    "\\section*{RESUMEN EJECUTIVO}",
    "\\addcontentsline{toc}{section}{RESUMEN EJECUTIVO}",
    "",
  ].join("\n");
}

/** Índice general + índice de tablas + índice de gráficos (después del resumen). */
export function buildIndice(): string {
  return [
    "% ===== ÍNDICE GENERAL =====",
    "\\renewcommand{\\contentsname}{ÍNDICE}",
    "\\newpage",
    "\\tableofcontents",
    "% ===== ÍNDICE DE TABLAS Y DE GRÁFICOS (guía UMSS) =====",
    "\\newpage",
    "\\listoftables",
    "\\newpage",
    "\\listoffigures",
    "\\newpage",
    "\\pagenumbering{arabic}",
    "\\setcounter{page}{1}",
    "",
  ].join("\n");
}

/** Cabecera de bibliografía (al final). */
export function buildBibliografiaHeader(): string {
  return [
    "% ===== REFERENCIAS BIBLIOGRÁFICAS =====",
    "\\newpage",
    "\\section*{REFERENCIAS BIBLIOGRÁFICAS}",
    "\\addcontentsline{toc}{section}{REFERENCIAS BIBLIOGRÁFICAS}",
    "",
  ].join("\n");
}

/** Cierre del documento. */
export function buildFinDocumento(): string {
  return "\n\\end{document}\n";
}
