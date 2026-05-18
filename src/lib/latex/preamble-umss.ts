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
    "\\setlength{\\parindent}{1.27cm}     % Sangría primera línea APA 7",
    "\\setlength{\\parskip}{0pt}",
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
    "% tikz + pgfplots se cargan SIEMPRE; pgf-pie solo si está disponible",
    "% en la instalación de LaTeX (Overleaf free a veces no lo tiene).",
    "\\usepackage{tikz}",
    "\\usepackage{pgfplots}",
    "\\pgfplotsset{compat=1.18}",
    "\\IfFileExists{pgf-pie.sty}{\\usepackage{pgf-pie}}{}",
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
    "% --- Numeración arábiga de capítulos (UMSS Posgrado) ---",
    "\\counterwithin{table}{chapter}     % Tabla 2.1, 2.2, 3.1, etc.",
    "\\counterwithin{figure}{chapter}    % Figura 2.1, 3.4, etc.",
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
    "\\titleformat{\\chapter}[hang]",
    "  {\\normalfont\\normalsize\\bfseries\\centering}",
    "  {Capítulo \\thechapter.}{0.5em}{}",
    "\\titlespacing*{\\chapter}{0pt}{0pt}{1em}",
    "",
    "\\titleformat{\\section}",
    "  {\\normalfont\\normalsize\\bfseries}",
    "  {\\thesection}{0.5em}{}",
    "\\titlespacing*{\\section}{0pt}{1em}{0.5em}",
    "",
    "\\titleformat{\\subsection}",
    "  {\\normalfont\\normalsize\\bfseries\\itshape}",
    "  {\\thesubsection}{0.5em}{}",
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

/** Índice general (después del resumen). */
export function buildIndice(): string {
  return [
    "% ===== ÍNDICE GENERAL =====",
    "\\newpage",
    "\\tableofcontents",
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
