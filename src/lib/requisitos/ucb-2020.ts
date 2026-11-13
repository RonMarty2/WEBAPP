/**
 * Requisitos comprobables de la "Guía para la presentación de trabajos
 * académicos" — Universidad Católica Boliviana "San Pablo", Cochabamba,
 * 6ª edición, marzo 2020 (base ISO 690:2010).
 *
 * Misma forma que `unifranz-2017.ts`. Los de `verificador: "codigo"` se
 * comprueban con código; los de `"ia"` los revisa un inspector de IA.
 *
 * IMPORTANTE: esta guía define la FORMA (formato, citas, bibliografía) y los
 * artículos del reglamento de cada modalidad, pero NO fija los capítulos de
 * cada una: "la extensión y la estructura las define cada carrera o programa"
 * (guía p. 4; Anexo 1, arts. 45 y 68). Por eso aquí no hay estructura de
 * capítulos por modalidad: hay que pedirla a la carrera del estudiante.
 *
 * Solo datos: no contiene prompts.
 */

import type { GuiaOficial, Requisito } from "./tipos";

/** Modalidades de UCB que producen un documento escrito (guía p. 1 y Anexo 1). */
export type ModalidadUcb =
  | "ucb-monografia" //         Técnico Superior
  | "ucb-pg-tecnico" //         Técnico Superior
  | "ucb-pasantia" //           Técnico Superior (memoria)
  | "ucb-tesis" //              Licenciatura
  | "ucb-proyecto-grado" //     Licenciatura
  | "ucb-trabajo-dirigido"; //  Licenciatura (memoria)

/**
 * Modalidades de UCB que NO producen este documento: Examen de Grado (oral/escrito),
 * Graduación por Excelencia e Internado Rotatorio (área de salud). Anexo 1, art. 58 y 80.
 */
export const MODALIDADES_UCB_SIN_DOCUMENTO = [
  "Examen de Grado", "Graduación por Excelencia", "Internado Rotatorio",
] as const;

export const GUIA_UCB_2020: GuiaOficial = {
  universidad: "ucb-001",
  nombre: "Guía para la presentación de trabajos académicos (6ª edición)",
  anio: 2020,
  paginas_leidas: "1-23 y Anexo 1 (reglamento de modalidades)",
  url_pdf: "/guias-ucb/ucb-guia-2020.pdf",
};

const TECNICO: ModalidadUcb[] = ["ucb-monografia", "ucb-pg-tecnico", "ucb-pasantia"];
const LICENCIATURA: ModalidadUcb[] = ["ucb-tesis", "ucb-proyecto-grado", "ucb-trabajo-dirigido"];
const MEMORIA: ModalidadUcb[] = ["ucb-pasantia", "ucb-trabajo-dirigido"];
const INVESTIGACION: ModalidadUcb[] = ["ucb-monografia", "ucb-pg-tecnico", "ucb-tesis", "ucb-proyecto-grado"];

export const REQUISITOS_UCB_2020: readonly Requisito[] = [
  // ── Formato (p. 2, 4; Anexo 1 arts. 45 y 68) ───────────────────
  { id: "fmt-papel", categoria: "formato", verificador: "codigo", pagina: 2,
    regla: "Hojas blancas tamaño carta, impresas en ambos lados, en procesador de palabras.",
    valor: { tamano: "carta", ambos_lados: true } },
  { id: "fmt-fuente", categoria: "formato", verificador: "codigo", pagina: 2,
    regla: "Letra Times New Roman tamaño 12.", valor: { fuente: "Times New Roman", pt: 12 } },
  { id: "fmt-interlineado", categoria: "formato", verificador: "codigo", pagina: 2,
    regla: "Interlineado 1,5, salvo las citas en bloque que llevan interlineado sencillo.",
    valor: { interlineado: 1.5, cita_bloque: 1 } },
  { id: "fmt-parrafos", categoria: "formato", verificador: "codigo", pagina: 2,
    regla: "El espaciado entre párrafos es doble (máximo 12 mm) y no se usa sangría al inicio del párrafo.",
    valor: { entre_parrafos_max_mm: 12, sangria: false } },
  { id: "fmt-margenes", categoria: "formato", verificador: "codigo", pagina: 2,
    regla: "Margen izquierdo 3,5 cm; derecho, superior e inferior 3 cm.",
    valor: { izq_cm: 3.5, der_cm: 3, sup_cm: 3, inf_cm: 3 } },
  { id: "fmt-numeracion", categoria: "formato", verificador: "codigo", pagina: 2,
    regla: "Numeración de páginas correlativa, en la parte inferior derecha.",
    valor: { posicion: "inferior-derecha" } },
  { id: "fmt-numeracion-visible", categoria: "formato", verificador: "codigo", pagina: 4,
    regla: "Se cuentan las páginas desde la carátula interna hasta la última hoja de bibliografía; se sugiere mostrar el número impreso desde la introducción.",
    valor: { visible_desde: "introduccion" } },
  { id: "fmt-tablas-figuras", categoria: "formato", verificador: "codigo", pagina: 2,
    regla: "Tablas y figuras centradas en la página, con numeración, título y fuente centrados, en Times New Roman 12." },

  // ── Estilo de redacción (pp. 2-3) ──────────────────────────────
  { id: "red-oraciones-cortas", categoria: "redaccion", verificador: "ia", pagina: 2,
    regla: "Oraciones cortas y claras; terminan en punto, no solo en coma." },
  { id: "red-grafia", categoria: "redaccion", verificador: "codigo", pagina: 2,
    regla: "Grafía castellana: no usar & en lugar de 'y' ni @ en las palabras." },
  { id: "red-mayusculas", categoria: "redaccion", verificador: "codigo", pagina: 2,
    regla: "Sin palabras en mayúsculas dentro de los párrafos (salvo siglas), sin subrayado; las cursivas solo para extranjerismos." },
  { id: "red-verbo", categoria: "redaccion", verificador: "ia", pagina: 2,
    regla: "Toda oración contiene un verbo conjugado; orden clásico sujeto-verbo-objeto; sin exceso de subordinadas." },
  { id: "red-parrafo", categoria: "redaccion", verificador: "ia", pagina: 3,
    regla: "Sin párrafos de una sola oración; el párrafo es la unidad de redacción." },
  { id: "red-tiempo", categoria: "redaccion", verificador: "ia", pagina: 3,
    regla: "Mantener el mismo tiempo verbal a lo largo del texto o, al menos, dentro del párrafo." },
  { id: "red-persona", categoria: "redaccion", verificador: "ia", pagina: 3,
    regla: "Primera persona plural o formas impersonales; no se usa la primera persona del singular." },

  // ── Tapa, carátula, lomo y color (pp. 5-8) ─────────────────────
  { id: "car-escudo", categoria: "caratula", verificador: "codigo", pagina: 5,
    regla: "Escudo institucional (con nombre de la institución y ciudad) centrado en los dos cuartos superiores: 5 cm de alto por 12 cm de ancho; en colores en la carátula interna y en dorado en la tapa.",
    valor: { alto_cm: 5, ancho_cm: 12 } },
  { id: "car-departamento", categoria: "caratula", verificador: "codigo", pagina: 5,
    regla: "Departamento o Facultad: tamaño 14, fuente Fedra Sans Std Book, minúscula, centrado debajo del escudo.",
    valor: { pt: 14, fuente: "Fedra Sans Std Book" },
    pendiente: "Fedra Sans Std Book es una fuente de la institución; Overleaf no la trae." },
  { id: "car-carrera", categoria: "caratula", verificador: "codigo", pagina: 5,
    regla: "Carrera o programa: tamaño 14, fuente Fedra Sans Std Book, minúscula, centrado.",
    valor: { pt: 14, fuente: "Fedra Sans Std Book" } },
  { id: "car-titulo", categoria: "caratula", verificador: "codigo", pagina: 6,
    regla: "Título del trabajo: tamaño 16, Times New Roman, minúscula, negrilla, centrado. Se sugiere no pasar de tres líneas (con subtítulo).",
    valor: { pt: 16, fuente: "Times New Roman", negrilla: true, max_lineas: 3 } },
  { id: "car-tipo", categoria: "caratula", verificador: "codigo", pagina: 6,
    regla: "Tipo de trabajo y carrera (ej. 'Tesis de Licenciatura en ...'): tamaño 12, Times New Roman, minúscula, cursiva, centrado.",
    valor: { pt: 12, cursiva: true } },
  { id: "car-autor", categoria: "caratula", verificador: "codigo", pagina: 6,
    regla: "Nombre completo del autor: tamaño 14, Times New Roman, minúscula, negrilla, centrado.",
    valor: { pt: 14, negrilla: true } },
  { id: "car-lugar-fecha", categoria: "caratula", verificador: "codigo", pagina: 6,
    regla: "Ciudad, país, mes y año de presentación (ej. 'Cochabamba – Bolivia / Marzo de 2020'): tamaño 12, Times New Roman, minúscula, centrado.",
    valor: { pt: 12 } },
  { id: "car-repite", categoria: "caratula", verificador: "codigo", pagina: 6,
    regla: "La carátula se repite exactamente igual como primera hoja del trabajo." },
  { id: "car-lomo", categoria: "caratula", verificador: "codigo", pagina: 8,
    regla: "Lomo: autor con iniciales de los nombres, primer apellido completo e inicial del segundo (borde izquierdo, ej. 'J. J. Pérez L.'); título en negrilla al centro; 'UCB', mes y año (borde derecho). Times New Roman, tamaño según el ancho del lomo." },
  { id: "car-color", categoria: "caratula", verificador: "codigo", pagina: 8,
    regla: "Color del empastado según el grado: Técnico Superior celeste, Licenciatura azul marino, Especialidad verde, Maestría guindo, Doctorado negro. Letras en dorado.",
    valor: { tecnico: "celeste", licenciatura: "azul marino" } },

  // ── Preliminares (pp. 8-15) ────────────────────────────────────
  { id: "pre-tribunal", categoria: "preliminares", verificador: "codigo", pagina: 8,
    regla: "Página 'TRIBUNAL EXAMINADOR' (tamaño 12, Times New Roman, centrado, mayúscula, negrilla) con los nombres, funciones y grados de: Profesor(a) Guía, Profesor(a) Relator(a), Director(a) de la Carrera y Rector(a) Regional (tamaño 12, centrado, minúscula)." },
  { id: "pre-dedicatoria", categoria: "preliminares", verificador: "codigo", pagina: 11,
    regla: "Dedicatoria y agradecimientos: opcionales y de formato libre, respetando tamaño de letra (12) y márgenes." },
  { id: "pre-resumen", categoria: "preliminares", verificador: "codigo", pagina: 12,
    regla: "Resumen de máximo 200 palabras: formula el tema o problema, el objetivo principal, la metodología y las conclusiones principales. No es una introducción.",
    valor: { max_palabras: 200 } },
  { id: "pre-palabras-clave", categoria: "preliminares", verificador: "codigo", pagina: 12,
    regla: "De 3 a 8 palabras clave al final del resumen, después de un punto aparte, con el subtítulo 'Palabras clave' en minúscula y cursiva.",
    valor: { min: 3, max: 8 } },
  { id: "pre-abstract", categoria: "preliminares", verificador: "ia", pagina: 12,
    regla: "Abstract: traducción fiel al inglés del resumen y de las palabras clave, en la página siguiente (máximo 200 palabras).",
    valor: { max_palabras: 200 },
    pendiente: "El esquema de la guía (p. 4) muestra el abstract como opcional, pero el reglamento (Anexo 1, arts. 45f y 68f) exige 'resumen o abstract en español e inglés'." },
  { id: "pre-indice-general", categoria: "preliminares", verificador: "codigo", pagina: 12,
    regla: "Índice general que comienza en la introducción, con jerarquía visible: títulos (INTRODUCCIÓN, CONCLUSIONES, RECOMENDACIONES, BIBLIOGRAFÍA, ANEXOS) en mayúscula y negrita al margen izquierdo; capítulos en mayúscula y negrita; subcapítulos en minúscula, negrita y con sangría pequeña; secciones en minúscula, negrita, cursiva y dos sangrías; subsecciones en minúscula, cursiva y tres sangrías. Todo en Times New Roman 12. Las sangrías van solo en el índice, no en el cuerpo." },
  { id: "pre-otros-indices", categoria: "preliminares", verificador: "codigo", pagina: 15,
    regla: "Los índices de tablas y de figuras van después del índice general, cada uno en una página aparte." },

  // ── Cuerpo (pp. 15-16) ─────────────────────────────────────────
  { id: "est-introduccion", categoria: "estructura", verificador: "ia", pagina: 15,
    regla: "La introducción presenta: el tema o problema, los objetivos generales y específicos, la hipótesis (si corresponde), la metodología y las partes del trabajo en forma sumaria. No tiene límite de palabras y no resume: introduce." },
  { id: "est-cuerpo", categoria: "estructura", verificador: "ia", pagina: 15,
    regla: "El cuerpo se organiza en capítulos, subcapítulos, secciones y subsecciones con una lógica coherente con el índice." },
  { id: "est-conclusiones", categoria: "estructura", verificador: "ia", pagina: 15,
    regla: "Las conclusiones recogen los resultados de forma sintética, indican su relevancia y son coherentes con los objetivos." },
  { id: "est-recomendaciones", categoria: "estructura", verificador: "ia", pagina: 15,
    regla: "Las recomendaciones son sugerencias para continuar la línea de investigación o sugerencias de aplicación práctica de los resultados." },
  { id: "est-sin-capitulo", categoria: "estructura", verificador: "codigo", pagina: 15,
    regla: "Conclusiones y recomendaciones no llevan la denominación de 'capítulo' y se redactan en páginas separadas." },
  { id: "est-sin-citas-conclusiones", categoria: "estructura", verificador: "codigo", pagina: 15,
    regla: "Se recomienda no incluir citas en las conclusiones." },
  { id: "est-orden-cierre", categoria: "estructura", verificador: "codigo", pagina: 4,
    regla: "Orden: introducción, cuerpo del texto, conclusiones, recomendaciones, bibliografía, separador y anexos." },

  // ── Citas (pp. 17-20) ──────────────────────────────────────────
  { id: "cit-sistema", categoria: "citas", verificador: "codigo", pagina: 17,
    regla: "Sistema autor-fecha: (APELLIDO, año: página), con el apellido en MAYÚSCULAS. Dos autores: (ALANDIA y LIMACHI, 2009: 86). Tres: (HERNÁNDEZ; FERNANDEZ y BAPTISTA, 2006: 15). Más de tres: (CÁZARES et al, 1992: 7)." },
  { id: "cit-breve", categoria: "citas", verificador: "codigo", pagina: 17,
    regla: "Cita breve (hasta cuatro líneas): dentro del párrafo, entre comillas dobles.", valor: { max_lineas: 4 } },
  { id: "cit-larga", categoria: "citas", verificador: "codigo", pagina: 17,
    regla: "Cita larga (más de cuatro líneas): bloque aparte, margen izquierdo 2 cm mayor, interlineado simple, sin comillas.",
    valor: { min_lineas: 5, margen_extra_cm: 2, interlineado: 1 } },
  { id: "cit-parafrasis", categoria: "citas", verificador: "codigo", pagina: 19,
    regla: "La paráfrasis y la alusión llevan la referencia precedida por 'Cf.' al final de la oración; se recomienda indicar la página.",
    valor: { prefijo: "Cf." } },
  { id: "cit-elipsis", categoria: "citas", verificador: "codigo", pagina: 19,
    regla: "Lo suprimido de una cita se marca con [...]; lo añadido, entre corchetes [aclaración]." },
  { id: "cit-de-cita", categoria: "citas", verificador: "ia", pagina: 19,
    regla: "No se permite la cita de cita." },
  { id: "cit-entrevista", categoria: "citas", verificador: "codigo", pagina: 18,
    regla: "Citas de entrevistas y grupos focales: texto en cursiva y referencia '(entrevista a Nombre Apellido, dd/mm/aaaa)'; la cita larga va en bloque." },
  { id: "cit-plagio", categoria: "citas", verificador: "ia", pagina: 19,
    regla: "Toda cita literal va marcada (comillas o bloque), toda paráfrasis es real (no una modificación leve del original) y toda fuente se consigna. El plagio es falta grave." },
  { id: "cit-notas-pie", categoria: "citas", verificador: "ia", pagina: 20,
    regla: "Las notas a pie de página se reservan para aclaraciones o comentarios; si citan textos, usan el sistema autor-fecha." },
  { id: "cit-tablas-fuente", categoria: "citas", verificador: "codigo", pagina: 20,
    regla: "Tablas y figuras: solo las categorías 'Tabla' y 'Figura', con numeración correlativa; título arriba al centro en Times New Roman 12 negrita; fuente abajo, centrada, en Times New Roman 12: 'AUTOR año' (datos y tabla ajenos), 'Fuente: Elaboración propia en base a AUTOR año' (datos ajenos, tabla propia) o 'Elaboración propia año' (todo propio)." },
  { id: "cit-tablas-lineas", categoria: "citas", verificador: "codigo", pagina: 21,
    regla: "Las tablas usan solo líneas horizontales, no verticales." },

  // ── Bibliografía (pp. 16, 22-23) ───────────────────────────────
  { id: "bib-referencial", categoria: "bibliografia", verificador: "ia", pagina: 16,
    regla: "La bibliografía es referencial: lista los documentos citados o aludidos en el texto y no incluye títulos no citados." },
  { id: "bib-orden", categoria: "bibliografia", verificador: "codigo", pagina: 22,
    regla: "Una sola lista ordenada alfabéticamente por apellido; las obras del mismo autor van de la más reciente a la más antigua; sin separar por tipo de material (salvo fuentes primarias)." },
  { id: "bib-formato", categoria: "bibliografia", verificador: "codigo", pagina: 22,
    regla: "Formato: APELLIDO, Nombres (Año). Título en cursiva. Lugar de edición: Editorial. Los títulos de libros van en cursiva; los de artículos, entre comillas." },
  { id: "bib-sin-dato", categoria: "bibliografia", verificador: "codigo", pagina: 22,
    regla: "Si falta un dato se usa s.f. (sin fecha), s.l. (sin lugar) o s.e. (sin editorial). Los documentos electrónicos añaden la fecha de acceso completa (dd/mm/aaaa)." },
  { id: "bib-mismo-anio", categoria: "bibliografia", verificador: "codigo", pagina: 22,
    regla: "Obras del mismo autor y año se distinguen con una letra minúscula pegada al año (2004a, 2004b)." },
  { id: "bib-fuentes-primarias", categoria: "bibliografia", verificador: "ia", pagina: 16,
    regla: "Las fuentes no documentales propias (encuestas, entrevistas, observaciones, mediciones...) van aparte, bajo el título 'Fuentes primarias', después de la bibliografía referencial." },

  // ── Separador y anexos (p. 16) ─────────────────────────────────
  { id: "anx-separador", categoria: "estructura", verificador: "codigo", pagina: 16,
    regla: "Hoja de color, sin numeración, que separa el trabajo de los anexos." },
  { id: "anx-formato", categoria: "estructura", verificador: "codigo", pagina: 16,
    regla: "Anexos opcionales, con título y numeración correlativa (Anexo 1, Anexo 2...). Sus páginas se numeran de nuevo desde 1 y se listan en el índice general." },

  // ── Por modalidad (p. 1; Anexo 1) ──────────────────────────────
  { id: "mod-monografia", categoria: "estructura", verificador: "ia", pagina: 1,
    modalidades: ["ucb-monografia"],
    regla: "Monografía: estudio de un tema específico, desarrollado bajo un proyecto de investigación coherente." },
  { id: "mod-pg-tecnico", categoria: "estructura", verificador: "ia", pagina: 1,
    modalidades: ["ucb-pg-tecnico"],
    regla: "Proyecto de Grado Técnico: propuesta sistémica con un objetivo definido para solucionar un problema o satisfacer una necesidad." },
  { id: "mod-pasantia", categoria: "estructura", verificador: "ia", pagina: 1,
    modalidades: ["ucb-pasantia"],
    regla: "Pasantía: trabajo institucional específico en la disciplina correspondiente (práctica profesional en una organización del área; hasta seis meses)." },
  { id: "mod-tesis", categoria: "estructura", verificador: "ia", pagina: 1,
    modalidades: ["ucb-tesis"],
    regla: "Tesis de Grado: investigación con metodología científica destinada a conocer y dar respuesta a un problema planteado por el postulante." },
  { id: "mod-proyecto-grado", categoria: "estructura", verificador: "ia", pagina: 1,
    modalidades: ["ucb-proyecto-grado"],
    regla: "Proyecto de Grado: investigación aplicada, de programación y diseño sobre un tema de interés científico, que recoge datos y formula una propuesta." },
  { id: "mod-trabajo-dirigido", categoria: "estructura", verificador: "ia", pagina: 1,
    modalidades: ["ucb-trabajo-dirigido"],
    regla: "Trabajo Dirigido: proceso de práctica profesional en el que el estudiante analiza y propone solución a un problema concreto de una organización específica de su área." },
  { id: "mod-memoria-extension", categoria: "formato", verificador: "codigo", referencia: "Anexo 1, arts. 56 y 78",
    modalidades: MEMORIA,
    regla: "La memoria de Pasantía o Trabajo Dirigido tiene un mínimo de 30 páginas y un máximo de 50.",
    valor: { min_paginas: 30, max_paginas: 50 } },
  { id: "mod-extension-carrera", categoria: "formato", verificador: "codigo", referencia: "Anexo 1, arts. 45b y 68b",
    modalidades: INVESTIGACION,
    regla: "La extensión de Monografía, Proyecto de Grado Técnico, Tesis y Proyecto de Grado la define cada carrera o programa.",
    // Decisión del dueño (30-oct-2026): la plataforma le pide al estudiante el esquema de su
    // carrera (foto o PDF) antes de generar; sin ese esquema no se inventan los capítulos.
    valor: { pedir_esquema_a_estudiante: true } },
  { id: "mod-resumen-obligatorio", categoria: "preliminares", verificador: "codigo", referencia: "Anexo 1, arts. 45f y 68f",
    regla: "El trabajo final incluye un resumen o abstract en español e inglés que no excede las 200 palabras." },
  { id: "mod-tecnico-grado", categoria: "caratula", verificador: "codigo", pagina: 8,
    modalidades: TECNICO,
    regla: "El empastado de las modalidades de Técnico Superior es de color celeste.", valor: { color: "celeste" } },
  { id: "mod-licenciatura-grado", categoria: "caratula", verificador: "codigo", pagina: 8,
    modalidades: LICENCIATURA,
    regla: "El empastado de las modalidades de Licenciatura es de color azul marino.", valor: { color: "azul marino" } },
];

/** Requisitos que aplican a una modalidad (los comunes + los propios). */
export function requisitosUcbParaModalidad(modalidad: ModalidadUcb): Requisito[] {
  return REQUISITOS_UCB_2020.filter((r) => !r.modalidades || r.modalidades.includes(modalidad));
}
