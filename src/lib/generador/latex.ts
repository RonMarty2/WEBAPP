/**
 * Construye un .tex compilable (Overleaf) del documento del Generador conectado.
 * Reusa los helpers probados de latexMonografia (escape + markdown→LaTeX).
 * Documento simple tipo "article" con índice y secciones.
 */
import { escaparLatex, mdALatex } from '@/lib/latexMonografia';
import type { ProyectoMaestro, SeccionDocumento } from '@/types/maestro';

const PREAMBULO = String.raw`\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[spanish]{babel}
\usepackage[margin=2.5cm]{geometry}
\usepackage{enumitem}
\usepackage{array}
\usepackage{longtable}
\usepackage{graphicx}
\usepackage{hyperref}
\hypersetup{colorlinks=true, linkcolor=black, urlcolor=blue}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.6em}
\renewcommand{\baselinestretch}{1.3}`;

export function documentoALatex(
  maestro: Pick<ProyectoMaestro, 'titulo' | 'tipo_negocio' | 'sector' | 'universidad' | 'modalidad'>,
  secciones: SeccionDocumento[]
): string {
  const titulo = escaparLatex(maestro.titulo || 'Proyecto');
  const subtitulo = [maestro.tipo_negocio, maestro.sector]
    .filter(Boolean)
    .map((x) => escaparLatex(x as string))
    .join(' \\textbar{} ');
  const autorPartes = [maestro.universidad, maestro.modalidad]
    .filter(Boolean)
    .map((x) => escaparLatex(x as string));
  const autor = autorPartes.length ? autorPartes.join(' \\\\ ') : 'Laboratorio Académico PRO';

  const tituloBloque = subtitulo
    ? `\\title{${titulo} \\\\ \\large ${subtitulo}}`
    : `\\title{${titulo}}`;

  const cuerpo = secciones
    .map((s) => {
      const t = escaparLatex(s.titulo || 'Sección');
      const contenido = s.contenido?.trim()
        ? mdALatex(s.contenido)
        : '\\textit{(Sección pendiente de redactar.)}';
      return `\\section{${t}}\n${contenido}`;
    })
    .join('\n\n');

  return [
    PREAMBULO,
    tituloBloque,
    `\\author{${autor}}`,
    '\\date{\\today}',
    '',
    '\\begin{document}',
    '\\maketitle',
    '\\tableofcontents',
    '\\newpage',
    '',
    cuerpo,
    '',
    '\\end{document}',
    '',
  ].join('\n');
}

/** Nombre de archivo seguro a partir del título (sin acentos ni símbolos). */
export function nombreTex(titulo: string): string {
  const base = (titulo || 'proyecto')
    .normalize('NFD')
    .replace(/[^ -~]/g, '') // quita marcas combinantes y no-ASCII
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'proyecto';
  return `${base}.tex`;
}
