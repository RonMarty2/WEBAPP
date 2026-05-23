/**
 * Preamble + carátula UCATEC.
 *
 * Universidad Privada de Ciencias Administrativas y Tecnológicas (UCATEC) —
 * Cochabamba, Bolivia. Sus modalidades de titulación son Licenciatura y
 * Técnico Superior, ambas mediante Proyecto de Grado.
 *
 * 100% determinista — NO usa IA. Sigue el patrón paralelo de
 * `preamble-umss.ts`, `preamble-ucb.ts` y `preamble-unifranz.ts`.
 *
 * Specs base (verificar con guía oficial UCATEC y ajustar si difiere):
 *   - Tipografía: Times New Roman 12 pt
 *   - Interlineado: 1.5
 *   - Márgenes: izquierdo 3 cm, derecho/superior/inferior 2.5 cm
 *   - Numeración correlativa en parte inferior derecha
 *   - Preliminares en romanos minúsculos, cuerpo en arábigos
 *   - APA 7
 *   - Documento con 4 capítulos romanos: I Marco Referencial, II Marco
 *     Teórico, III Marco Situacional, IV Marco Propositivo
 */

export interface UcatecDatosCaratula {
  nombre: string;
  titulo: string;
  carrera: string;       // ej. "Administración de Empresas", "Ingeniería Comercial"
  facultad: string;      // ej. "Facultad de Ciencias Empresariales"
  modalidad: string;     // ej. "PROYECTO DE GRADO"
  grado: string;         // ej. "LICENCIATURA", "TÉCNICO SUPERIOR"
  universidad: string;
  ciudad: string;
  pais: string;
  mes: string;
  anio: string;
  tutor?: string;
}

/** Escapa caracteres LaTeX especiales en texto plano. */
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
 * Preámbulo completo UCATEC.
 *
 * Compatible con Overleaf free (sin pgf-pie, sin paquetes exóticos).
 * tikz + pgfplots cargados siempre para soportar diagramas del Cap. III
 * (PESTEL, Porter) y Cap. IV (organigrama, flujograma, gráficos
 * financieros). pgf-pie se carga solo si está disponible.
 */
export function buildPreambleUCATEC(): string {
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
    "% --- Geometría y espaciado (UCATEC) ---",
    "\\usepackage{geometry}",
    "\\geometry{letterpaper, left=3cm, right=2.5cm, top=2.5cm, bottom=2.5cm}",
    "\\usepackage{setspace}",
    "\\onehalfspacing                    % UCATEC: interlineado 1.5",
    "\\usepackage{indentfirst}",
    "\\setlength{\\parindent}{1.27cm}     % Sangría primera línea APA 7",
    "\\setlength{\\parskip}{6pt}",
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
    "% --- Soporte gráficos analíticos (Cap. III + IV) ---",
    "\\usepackage{tikz}",
    "\\usepackage{pgfplots}",
    "\\pgfplotsset{compat=1.18}",
    "\\IfFileExists{pgf-pie.sty}{\\usepackage{pgf-pie}}{}",
    "\\usetikzlibrary{shapes.geometric, shapes.symbols, shapes.misc}",
    "\\usetikzlibrary{arrows, arrows.meta}",
    "\\usetikzlibrary{positioning, calc, fit, backgrounds}",
    "\\usetikzlibrary{decorations.pathreplacing, decorations.markings}",
    "% Estilos predefinidos para diagramas (árbol problemas, flujograma, organigrama).",
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
    "% --- Encabezado y pie de página (UCATEC: número en inf. derecha) ---",
    "\\pagestyle{fancy}",
    "\\fancyhf{}",
    "\\rfoot{\\thepage}",
    "\\renewcommand{\\headrulewidth}{0pt}",
    "\\renewcommand{\\footrulewidth}{0pt}",
    "",
    "% --- Numeración romana de capítulos (UCATEC: Cap. I, II, III, IV) ---",
    "\\renewcommand{\\thechapter}{\\Roman{chapter}}",
    "\\counterwithin{table}{chapter}     % Tabla I.1, II.3, III.4, etc.",
    "\\counterwithin{figure}{chapter}    % Figura I.1, II.3, etc.",
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
 * Carátula UCATEC — layout simple centrado (escudo + datos + autor +
 * tutor + ciudad). Verificar contra guía oficial UCATEC y ajustar.
 */
export function buildCaratulaUCATEC(d: UcatecDatosCaratula): string {
  return [
    "% ===== CARÁTULA UCATEC =====",
    "\\begin{titlepage}",
    "\\thispagestyle{empty}",
    "\\begin{center}",
    "",
    "\\IfFileExists{logos/ucatec.png}{%",
    "  \\includegraphics[width=3cm,height=4cm,keepaspectratio]{logos/ucatec.png}\\\\[12pt]",
    "}{%",
    "  \\framebox[3cm]{\\parbox[c][4cm][c]{2.6cm}{\\centering\\footnotesize Logo\\\\UCATEC}}\\\\[12pt]",
    "}",
    "",
    `{\\fontsize{14pt}{17pt}\\selectfont \\textbf{${escLatex(d.universidad)}}}\\\\[6pt]`,
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.facultad)}}\\\\[6pt]`,
    `{\\fontsize{12pt}{15pt}\\selectfont Carrera de ${escLatex(d.carrera)}}`,
    "",
    "\\vspace{1.8cm}",
    "",
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.modalidad)}}\\\\[4pt]`,
    `{\\fontsize{12pt}{15pt}\\selectfont Modalidad de Titulación: ${escLatex(d.grado)}}`,
    "",
    "\\vspace{1.5cm}",
    "",
    `{\\fontsize{14pt}{17pt}\\selectfont \\textbf{\\guillemotleft{}${escLatex(d.titulo)}\\guillemotright{}}}`,
    "",
    "\\vspace{2cm}",
    "",
    `{\\fontsize{12pt}{15pt}\\selectfont Postulante: ${escLatex(d.nombre)}}`,
    d.tutor ? `\\\\[6pt]\n{\\fontsize{12pt}{15pt}\\selectfont Tutor: ${escLatex(d.tutor)}}` : "",
    "",
    "\\vfill",
    "",
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.ciudad)} --- ${escLatex(d.pais)}}\\\\[4pt]`,
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.mes)} ${escLatex(d.anio)}}`,
    "",
    "\\end{center}",
    "\\end{titlepage}",
    "",
  ].filter((l) => l !== "").join("\n");
}

/** Cabecera para el Resumen Ejecutivo (antes del índice). */
export function buildResumenHeaderUCATEC(): string {
  return [
    "% ===== RESUMEN EJECUTIVO =====",
    "\\pagenumbering{roman}",
    "\\section*{RESUMEN EJECUTIVO}",
    "\\addcontentsline{toc}{section}{RESUMEN EJECUTIVO}",
    "",
  ].join("\n");
}

/** Índice general (después del resumen, antes del Cap. I). */
export function buildIndiceUCATEC(): string {
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

/** Cabecera de bibliografía (al final, antes de los anexos). */
export function buildBibliografiaHeaderUCATEC(): string {
  return [
    "% ===== REFERENCIAS BIBLIOGRÁFICAS =====",
    "\\newpage",
    "\\section*{REFERENCIAS BIBLIOGRÁFICAS}",
    "\\addcontentsline{toc}{section}{REFERENCIAS BIBLIOGRÁFICAS}",
    "",
  ].join("\n");
}

/** Cierre del documento. */
export function buildFinDocumentoUCATEC(): string {
  return "\n\\end{document}\n";
}
