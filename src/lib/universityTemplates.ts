/**
 * Plantillas LaTeX por universidad boliviana.
 * Cada template define: márgenes, espaciado, fuente y carátula de respaldo.
 */

import { escaparLatexPlain } from "./latexMonografia";

export interface CaratulaInput {
  titulo: string;
  diplomado?: string;
  autor?: string;
  tutor?: string;
  año?: string | number;
  facultad?: string;
}

export interface UniversityTemplate {
  id: string;
  nombre: string;
  ciudad: string;
  /** cm: izquierdo, derecho, superior, inferior */
  margenes: { izq: number; der: number; sup: number; inf: number };
  /** "times" | "arial" — font package */
  fuente: "times" | "arial";
  /** 1.5 | 2.0 */
  espaciado: 1.5 | 2.0;
  buildCaratula: (input: CaratulaInput) => string;
  /** Líneas LaTeX extra para el preámbulo (opcional) */
  preambleExtras?: string;
}

// ─── Helpers comunes ──────────────────────────────────────────

function esc(s: string | undefined) {
  return escaparLatexPlain(s ?? "");
}

function defaultCaratula(nombre: string, ciudad: string, input: CaratulaInput): string {
  return [
    "\\begin{titlepage}",
    "  \\centering",
    "  \\vspace*{2cm}",
    `  {\\large \\textbf{${esc(nombre)}}}\\\\[0.4cm]`,
    `  {\\normalsize ${esc(ciudad)}, Bolivia}\\\\[2cm]`,
    "  \\rule{0.85\\linewidth}{0.5pt}\\\\[0.4cm]",
    `  {\\LARGE \\textbf{${esc(input.titulo)}}}\\\\[0.4cm]`,
    "  \\rule{0.85\\linewidth}{0.5pt}\\\\[1.5cm]",
    input.diplomado
      ? `  {\\large Trabajo de Diplomado en:\\\\[0.3cm]\\textbf{${esc(input.diplomado)}}}\\\\[1.5cm]`
      : "",
    input.autor
      ? `  {\\normalsize Autor: \\textbf{${esc(input.autor)}}}\\\\[0.5cm]`
      : "",
    input.tutor
      ? `  {\\normalsize Tutor: \\textbf{${esc(input.tutor)}}}\\\\[0.5cm]`
      : "",
    "  \\vfill",
    `  {\\normalsize ${esc(ciudad)}, ${esc(String(input.año ?? new Date().getFullYear()))}}`,
    "\\end{titlepage}",
  ].filter(l => l !== "").join("\n");
}

// ─── UMSA ─────────────────────────────────────────────────────

const UMSA: UniversityTemplate = {
  id: "umsa",
  nombre: "Universidad Mayor de San Andrés",
  ciudad: "La Paz",
  margenes: { izq: 3.0, der: 2.5, sup: 2.5, inf: 2.5 },
  fuente: "times",
  espaciado: 1.5,
  buildCaratula: (input) => [
    "\\begin{titlepage}",
    "  \\centering",
    "  \\vspace*{1.5cm}",
    "  {\\large \\textbf{UNIVERSIDAD MAYOR DE SAN ANDRÉS}}\\\\[0.3cm]",
    input.facultad
      ? `  {\\normalsize ${esc(input.facultad)}}\\\\[1.8cm]`
      : "  \\vspace{1.8cm}",
    "  \\rule{\\linewidth}{0.6pt}\\\\[0.5cm]",
    `  {\\LARGE \\textbf{${esc(input.titulo)}}}\\\\[0.5cm]`,
    "  \\rule{\\linewidth}{0.6pt}\\\\[1cm]",
    input.diplomado
      ? `  {\\large Trabajo de Grado para optar al Diploma en:\\\\[0.2cm]\\textbf{${esc(input.diplomado)}}}\\\\[1.2cm]`
      : "",
    "  \\begin{tabular}{rl}",
    input.autor ? `    \\textbf{Postulante:} & ${esc(input.autor)} \\\\` : "",
    input.tutor ? `    \\textbf{Tutor:} & ${esc(input.tutor)} \\\\` : "",
    "  \\end{tabular}",
    "  \\vfill",
    `  {\\normalsize La Paz -- Bolivia, ${esc(String(input.año ?? new Date().getFullYear()))}}`,
    "\\end{titlepage}",
  ].filter(l => l !== "").join("\n"),
};

// ─── UMSS ─────────────────────────────────────────────────────

const UMSS: UniversityTemplate = {
  id: "umss",
  nombre: "Universidad Mayor de San Simón",
  ciudad: "Cochabamba",
  margenes: { izq: 2.54, der: 2.54, sup: 2.54, inf: 2.54 },
  fuente: "times",
  espaciado: 1.5,
  buildCaratula: (input) => defaultCaratula("UNIVERSIDAD MAYOR DE SAN SIMÓN", "Cochabamba", input),
};

// ─── UCB ──────────────────────────────────────────────────────

const UCB: UniversityTemplate = {
  id: "ucb",
  nombre: "Universidad Católica Boliviana",
  ciudad: "La Paz",
  margenes: { izq: 2.5, der: 2.5, sup: 2.5, inf: 2.5 },
  fuente: "times",
  espaciado: 1.5,
  buildCaratula: (input) => [
    "\\begin{titlepage}",
    "  \\centering",
    "  \\vspace*{1.5cm}",
    "  {\\large \\textbf{UNIVERSIDAD CATÓLICA BOLIVIANA}}\\\\[0.2cm]",
    "  {\\normalsize ``San Pablo''}\\\\[0.2cm]",
    input.facultad
      ? `  {\\normalsize ${esc(input.facultad)}}\\\\[1.5cm]`
      : "  \\vspace{1.5cm}",
    "  \\rule{0.9\\linewidth}{0.4pt}\\\\[0.4cm]",
    `  {\\LARGE \\textbf{${esc(input.titulo)}}}\\\\[0.4cm]`,
    "  \\rule{0.9\\linewidth}{0.4pt}\\\\[1.2cm]",
    input.diplomado
      ? `  {\\large Trabajo Final de Diplomado en:\\\\[0.2cm]\\textit{${esc(input.diplomado)}}}\\\\[1.2cm]`
      : "",
    input.autor ? `  {\\normalsize Autor: ${esc(input.autor)}}\\\\[0.4cm]` : "",
    input.tutor ? `  {\\normalsize Docente Guía: ${esc(input.tutor)}}\\\\[0.4cm]` : "",
    "  \\vfill",
    `  {\\normalsize ${esc(String(input.año ?? new Date().getFullYear()))}}`,
    "\\end{titlepage}",
  ].filter(l => l !== "").join("\n"),
};

// ─── UPB ──────────────────────────────────────────────────────

const UPB: UniversityTemplate = {
  id: "upb",
  nombre: "Universidad Privada Boliviana",
  ciudad: "Cochabamba",
  margenes: { izq: 2.5, der: 2.0, sup: 2.5, inf: 2.0 },
  fuente: "arial",
  espaciado: 1.5,
  buildCaratula: (input) => [
    "\\begin{titlepage}",
    "  \\centering",
    "  \\vspace*{1cm}",
    "  {\\large \\textsf{\\textbf{UNIVERSIDAD PRIVADA BOLIVIANA}}}\\\\[0.3cm]",
    input.facultad
      ? `  {\\normalsize \\textsf{${esc(input.facultad)}}}\\\\[1.5cm]`
      : "  \\vspace{1.5cm}",
    `  {\\LARGE \\textsf{\\textbf{${esc(input.titulo)}}}}\\\\[1cm]`,
    input.diplomado
      ? `  {\\large \\textsf{${esc(input.diplomado)}}}\\\\[1.5cm]`
      : "",
    input.autor ? `  {\\normalsize \\textsf{${esc(input.autor)}}}\\\\[0.3cm]` : "",
    input.tutor ? `  {\\normalsize \\textsf{Docente: ${esc(input.tutor)}}}\\\\[0.3cm]` : "",
    "  \\vfill",
    `  {\\normalsize \\textsf{Cochabamba -- Bolivia, ${esc(String(input.año ?? new Date().getFullYear()))}}}`,
    "\\end{titlepage}",
  ].filter(l => l !== "").join("\n"),
};

// ─── UPEA ─────────────────────────────────────────────────────

const UPEA: UniversityTemplate = {
  id: "upea",
  nombre: "Universidad Pública de El Alto",
  ciudad: "El Alto",
  margenes: { izq: 3.0, der: 2.5, sup: 2.5, inf: 2.5 },
  fuente: "times",
  espaciado: 2.0,
  buildCaratula: (input) => defaultCaratula("UNIVERSIDAD PÚBLICA DE EL ALTO", "El Alto", input),
};

// ─── USFX ─────────────────────────────────────────────────────

const USFX: UniversityTemplate = {
  id: "usfx",
  nombre: "Universidad San Francisco Xavier",
  ciudad: "Sucre",
  margenes: { izq: 2.5, der: 2.5, sup: 3.0, inf: 2.5 },
  fuente: "times",
  espaciado: 1.5,
  buildCaratula: (input) => [
    "\\begin{titlepage}",
    "  \\centering",
    "  \\vspace*{1.5cm}",
    "  {\\large \\textbf{UNIVERSIDAD SAN FRANCISCO XAVIER}}\\\\[0.2cm]",
    "  {\\normalsize de Chuquisaca}\\\\[0.2cm]",
    input.facultad
      ? `  {\\normalsize ${esc(input.facultad)}}\\\\[1.8cm]`
      : "  \\vspace{1.8cm}",
    "  \\rule{0.85\\linewidth}{0.5pt}\\\\[0.4cm]",
    `  {\\LARGE \\textbf{${esc(input.titulo)}}}\\\\[0.4cm]`,
    "  \\rule{0.85\\linewidth}{0.5pt}\\\\[1cm]",
    input.diplomado
      ? `  {\\large Trabajo de Postgrado:\\\\[0.2cm]\\textbf{${esc(input.diplomado)}}}\\\\[1.2cm]`
      : "",
    input.autor ? `  {\\normalsize Autora/Autor: ${esc(input.autor)}}\\\\[0.4cm]` : "",
    input.tutor ? `  {\\normalsize Director: ${esc(input.tutor)}}\\\\[0.4cm]` : "",
    "  \\vfill",
    `  {\\normalsize Sucre -- Bolivia, ${esc(String(input.año ?? new Date().getFullYear()))}}`,
    "\\end{titlepage}",
  ].filter(l => l !== "").join("\n"),
};

// ─── Registro ─────────────────────────────────────────────────

const UNIVERSITY_REGISTRY: Record<string, UniversityTemplate> = {
  umsa: UMSA,
  umss: UMSS,
  ucb: UCB,
  upb: UPB,
  upea: UPEA,
  usfx: USFX,
};

export function getUniversityTemplate(id: string | undefined | null): UniversityTemplate {
  return UNIVERSITY_REGISTRY[id?.toLowerCase() ?? ""] ?? UMSS;
}

export function listUniversities(): Pick<UniversityTemplate, "id" | "nombre" | "ciudad">[] {
  return Object.values(UNIVERSITY_REGISTRY).map(({ id, nombre, ciudad }) => ({ id, nombre, ciudad }));
}
