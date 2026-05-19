/**
 * Preamble + carátula UCB San Pablo Cochabamba (Guía 6ª ed., Marzo 2020).
 *
 * 100% determinista — NO usa IA. Mismas firmas que preamble-umss.ts para
 * permitir un switch limpio en compilar-latex.ts.
 *
 * Cubre las reglas de la guía UCB (págs. 2-16):
 *   ✓ Times New Roman 12 (mathptmx)
 *   ✓ Interlineado 1.5 + párrafo doble (parskip), SIN sangría inicial
 *   ✓ Márgenes: izquierdo 3.5cm · derecho/superior/inferior 3cm
 *   ✓ Numeración correlativa en parte INFERIOR DERECHA
 *   ✓ Tablas y Figuras numeradas correlativamente (sin "Cuadro")
 *   ✓ Carátula con Escudo institucional + Departamento + Carrera
 *     + Título + Tipo de trabajo + Autor + Ciudad/País + Mes/Año
 *   ✓ Página Tribunal Examinador
 *   ✓ Sección Resumen + Abstract + palabras clave
 *   ✓ Compilable en Overleaf free
 */

export interface UcbDatosCaratula {
  nombre: string;
  titulo: string;
  /** Departamento UCB (Sociales/Ingeniería/Admin/Enfermería/Teología). */
  departamento: string;
  /** Carrera o programa específico. */
  carrera: string;
  /** Tipo de trabajo: Monografía, Tesis de Grado, Proyecto de Grado, etc. */
  tipo_trabajo: string;
  /** Grado al que opta — fija color de empastado: T.Sup/Lic/Esp/Maestría/Doctorado */
  grado_academico?: string;
  universidad: string;
  ciudad: string;
  pais: string;
  mes: string;
  anio: string;
  tutor?: string;
}

/** Escapa caracteres LaTeX especiales (idéntico a preamble-umss para paridad). */
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
 * Preámbulo completo UCB.
 *
 * Diferencias clave respecto a UMSS:
 *   - Geometría: izq=3.5cm, resto=3cm (UMSS = 2.54cm uniforme)
 *   - Interlineado: \onehalfspacing (UMSS = \doublespacing)
 *   - Parindent: 0pt (UMSS = 1.27cm sangría APA)
 *   - Parskip: 10pt (separación entre párrafos)
 *   - Número de página: pie de página derecha (UMSS = encabezado derecha)
 *   - Tablas: "Tabla N" (UMSS = "Cuadro N")
 */
export function buildPreambleUCB(): string {
  return [
    "\\documentclass[12pt,letterpaper]{report}",
    "",
    "% --- Paquetes base ---",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[spanish,es-tabla,es-noshorthands]{babel}",
    "\\usepackage{mathptmx}              % Times New Roman clone (UCB pág 2)",
    "\\usepackage{microtype}",
    "",
    "% --- Geometría y espaciado (UCB Guía 2020, pág. 2) ---",
    "\\usepackage{geometry}",
    "\\geometry{letterpaper, left=3.5cm, right=3cm, top=3cm, bottom=3cm}",
    "\\usepackage{setspace}",
    "\\onehalfspacing                    % UCB: interlineado 1.5",
    "\\setlength{\\parindent}{0pt}        % UCB pág. 2: SIN sangría inicial",
    "\\setlength{\\parskip}{10pt}         % UCB pág. 2: párrafo doble (~12mm máx)",
    "",
    "% --- Citas y comillas ---",
    "\\usepackage{csquotes}",
    "\\usepackage{hanging}",
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
    "  block/.style={rectangle, draw, thick, fill=teal!10, text width=3cm, text centered, minimum height=1cm, rounded corners=2pt},",
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
    "% --- Encabezado y pie de página (UCB pág. 2: número en INF. DERECHA) ---",
    "\\pagestyle{fancy}",
    "\\fancyhf{}",
    "\\rfoot{\\thepage}",
    "\\renewcommand{\\headrulewidth}{0pt}",
    "\\renewcommand{\\footrulewidth}{0pt}",
    "",
    "% --- Numeración de tablas y figuras (UCB: 'Tabla', no 'Cuadro') ---",
    "\\counterwithin{table}{chapter}",
    "\\counterwithin{figure}{chapter}",
    "\\renewcommand{\\tablename}{Tabla}",
    "\\renewcommand{\\listtablename}{Lista de Tablas}",
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
 * Carátula UCB oficial — formato pág. 5-7 de la guía 2020.
 * Layout vertical centrado: escudo en el cuarto superior, datos centrados.
 */
export function buildCaratulaUCB(d: UcbDatosCaratula): string {
  return [
    "% ===== CARÁTULA UCB SAN PABLO COCHABAMBA =====",
    "\\begin{titlepage}",
    "\\thispagestyle{empty}",
    "\\begin{center}",
    "",
    "% Escudo UCB en los dos cuartos superiores (UCB pág. 5: 5cm alto x 12cm ancho)",
    "\\IfFileExists{logos/ucb.png}{%",
    "  \\includegraphics[width=12cm,height=5cm,keepaspectratio]{logos/ucb.png}%",
    "}{%",
    "  \\framebox[6cm]{\\parbox[c][4cm][c]{5.5cm}{\\centering\\footnotesize Escudo\\\\UCB San Pablo}}%",
    "}",
    "",
    "\\vspace{0.6cm}",
    "",
    "% Departamento (Fedra Sans Std Book 14pt — fallback a Times si la fuente",
    "% no está disponible en Overleaf free)",
    `{\\fontsize{14pt}{17pt}\\selectfont ${escLatex(d.departamento)}}\\\\[0.4cm]`,
    "",
    "% Carrera o programa",
    `{\\fontsize{14pt}{17pt}\\selectfont ${escLatex(d.carrera)}}`,
    "",
    "\\vspace{2.5cm}",
    "",
    "% Título del trabajo — Times NR 16pt negrita (UCB pág. 6)",
    `{\\fontsize{16pt}{19pt}\\selectfont\\bfseries ${escLatex(d.titulo)}}`,
    "",
    "\\vspace{1.5cm}",
    "",
    "% Tipo de trabajo y carrera — 12pt cursiva (UCB pág. 6)",
    `{\\fontsize{12pt}{15pt}\\selectfont\\itshape ${escLatex(d.tipo_trabajo)}${d.carrera ? " en " + escLatex(d.carrera) : ""}}`,
    "",
    "\\vspace{1.8cm}",
    "",
    "% Autor — 14pt negrita (UCB pág. 6)",
    `{\\fontsize{14pt}{17pt}\\selectfont\\bfseries ${escLatex(d.nombre)}}`,
    d.tutor ? `\\\\[0.5cm]{\\fontsize{12pt}{15pt}\\selectfont Tutor: ${escLatex(d.tutor)}}` : "",
    "",
    "\\vfill",
    "",
    "% Ciudad/País y fecha (UCB pág. 6)",
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.ciudad)} -- ${escLatex(d.pais)}}\\\\[4pt]`,
    `{\\fontsize{12pt}{15pt}\\selectfont ${escLatex(d.mes)} de ${escLatex(d.anio)}}`,
    "",
    "\\end{center}",
    "\\end{titlepage}",
    "",
  ].filter((l) => l !== "").join("\n");
}

/**
 * Página Tribunal Examinador (UCB pág. 8-10).
 * Solo se incluye para Licenciatura / Especialidad / Maestría / Doctorado.
 */
export function buildTribunalUCB(opts?: {
  profesor_guia?: string;
  profesor_relator?: string;
  director_carrera?: string;
  rector_regional?: string;
}): string {
  const guia = opts?.profesor_guia ?? "[Nombre del Profesor(a) Guía]";
  const relator = opts?.profesor_relator ?? "[Nombre del Profesor(a) Relator(a)]";
  const director = opts?.director_carrera ?? "[Nombre del Director(a) de Carrera]";
  const rector = opts?.rector_regional ?? "[Nombre del Rector(a) Regional]";
  return [
    "% ===== TRIBUNAL EXAMINADOR (UCB pág. 8-10) =====",
    "\\newpage",
    "\\thispagestyle{empty}",
    "\\begin{center}",
    "\\vspace*{2cm}",
    "{\\fontsize{12pt}{15pt}\\selectfont\\bfseries\\MakeUppercase{Tribunal Examinador}}",
    "\\vspace{3cm}",
    "",
    "\\begin{tabular}{cc}",
    "\\rule{6cm}{0.4pt} & \\rule{6cm}{0.4pt} \\\\",
    `${escLatex(guia)} & ${escLatex(relator)} \\\\`,
    "Profesor(a) Guía & Profesor(a) Relator(a) \\\\[2cm]",
    "\\rule{6cm}{0.4pt} & \\rule{6cm}{0.4pt} \\\\",
    `${escLatex(director)} & ${escLatex(rector)} \\\\`,
    "Director(a) de Carrera & Rector(a) Regional \\\\",
    "\\end{tabular}",
    "\\end{center}",
    "",
  ].join("\n");
}

/**
 * Cabecera del Resumen Ejecutivo (UCB pág. 12).
 * UCB pide: Resumen ≤200 palabras + Palabras clave (3-8) + Abstract (inglés).
 */
export function buildResumenHeader(): string {
  return [
    "% ===== RESUMEN (UCB pág. 12: máx 200 palabras + palabras clave) =====",
    "\\pagenumbering{roman}",
    "\\section*{RESUMEN}",
    "\\addcontentsline{toc}{section}{RESUMEN}",
    "",
  ].join("\n");
}

/** Cabecera del Abstract (inglés) — debe ir en página siguiente al resumen. */
export function buildAbstractHeader(): string {
  return [
    "% ===== ABSTRACT (UCB pág. 12: traducción fiel del resumen) =====",
    "\\newpage",
    "\\section*{ABSTRACT}",
    "\\addcontentsline{toc}{section}{ABSTRACT}",
    "",
  ].join("\n");
}

/** Índice general (UCB pág. 12-15). */
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

/** Cabecera de bibliografía (UCB pág. 16, 22-26). */
export function buildBibliografiaHeader(): string {
  return [
    "% ===== BIBLIOGRAFÍA (sistema autor-fecha UCB) =====",
    "\\newpage",
    "\\section*{BIBLIOGRAFÍA}",
    "\\addcontentsline{toc}{section}{BIBLIOGRAFÍA}",
    "",
  ].join("\n");
}

/**
 * Hoja separadora de color antes de anexos (UCB pág. 4 + 16).
 * No lleva numeración. El estudiante físicamente reemplaza esta hoja
 * en la imprenta por papel de color elegido.
 */
export function buildSeparadorAnexos(): string {
  return [
    "% ===== SEPARADOR DE ANEXOS (UCB pág. 16) =====",
    "\\newpage",
    "\\thispagestyle{empty}",
    "\\begin{center}",
    "\\vspace*{8cm}",
    "{\\fontsize{24pt}{28pt}\\selectfont\\bfseries ANEXOS}",
    "\\end{center}",
    "\\newpage",
    "% UCB: anexos reinician numeración desde 1",
    "\\setcounter{page}{1}",
    "",
  ].join("\n");
}

/** Cierre del documento. */
export function buildFinDocumento(): string {
  return "\n\\end{document}\n";
}
