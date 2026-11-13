/**
 * Requisitos comprobables de la "Guía de Organización y Presentación de
 * Trabajos de Grado" — UNIFRANZ Cochabamba, 2017.
 *
 * Cada requisito apunta a la página de la guía que lo respalda. Los de
 * `verificador: "codigo"` se comprueban con código (exacto); los de
 * `verificador: "ia"` los revisa un inspector de IA porque dependen del texto.
 *
 * Este módulo es solo datos: no contiene prompts y es seguro importarlo
 * desde cualquier lugar.
 */

import type { ModalidadUnifranz } from "@/lib/proyectoGrado/unifranz/modalidades";
import type { GuiaOficial, Requisito } from "./tipos";

export type { CategoriaRequisito, Requisito } from "./tipos";

export const GUIA_UNIFRANZ_2017: GuiaOficial = {
  universidad: "unifranz-cba-001",
  nombre: "Guía de Organización y Presentación de Trabajos de Grado",
  anio: 2017,
  /** Páginas leídas para armar esta lista (la guía puede tener anexos después). */
  paginas_leidas: "1-20",
  url_pdf: "/guias-unifranz/unifranz-cba-guia-2017.pdf",
};

export const REQUISITOS_UNIFRANZ_2017: readonly Requisito[] = [
  // ── Formato del documento (p. 12) ──────────────────────────────
  { id: "fmt-papel", categoria: "formato", verificador: "codigo", pagina: 12,
    regla: "Papel bond tamaño carta (215.9 x 279.4 mm), impresión en una sola cara.",
    valor: { ancho_mm: 215.9, alto_mm: 279.4, una_cara: true } },
  { id: "fmt-margenes", categoria: "formato", verificador: "codigo", pagina: 12,
    regla: "Márgenes: superior 2.5 cm, inferior 2.5 cm, izquierdo 3.5 cm, derecho 2.5 cm.",
    valor: { sup_cm: 2.5, inf_cm: 2.5, izq_cm: 3.5, der_cm: 2.5 } },
  { id: "fmt-fuente", categoria: "formato", verificador: "codigo", pagina: 12,
    regla: "Letra Verdana tamaño 10. El único color de letra permitido es el negro.",
    valor: { fuente: "Verdana", pt: 10, color: "negro" } },
  { id: "fmt-parrafo", categoria: "formato", verificador: "codigo", pagina: 12,
    regla: "Interlineado 1.5, 6 pt antes y 6 pt después del párrafo, sangría 0 cm a izquierda y derecha.",
    valor: { interlineado: 1.5, antes_pt: 6, despues_pt: 6, sangria_cm: 0 } },
  { id: "fmt-numeracion", categoria: "formato", verificador: "codigo", pagina: 12,
    regla: "Número de página abajo a la derecha. Preliminares en romanos minúscula (i, ii, iii); cuerpo en arábigos iniciando con 1 en la página de INTRODUCCIÓN.",
    valor: { posicion: "inferior-derecha", preliminares: "romano-minuscula", cuerpo_inicia_en: "introduccion" } },
  { id: "fmt-sangria-texto", categoria: "formato", verificador: "codigo", pagina: 9,
    regla: "Se sugiere no usar sangría al inicio de párrafo.", valor: { sangria: false } },

  // ── Títulos (p. 12) ────────────────────────────────────────────
  { id: "tit-proyecto", categoria: "titulos", verificador: "codigo", pagina: 12,
    regla: "Título del proyecto: tamaño 16, mayúsculas, negrilla.", valor: { pt: 16, mayusculas: true, negrilla: true } },
  { id: "tit-capitulo", categoria: "titulos", verificador: "codigo", pagina: 12,
    regla: "Título de capítulo: tamaño 14, mayúsculas, negrilla.", valor: { pt: 14, mayusculas: true, negrilla: true } },
  { id: "tit-nivel1", categoria: "titulos", verificador: "codigo", pagina: 12,
    regla: "Apartado 1.1: tamaño 12, minúsculas tipo título, negrilla.", valor: { pt: 12, negrilla: true } },
  { id: "tit-nivel2", categoria: "titulos", verificador: "codigo", pagina: 12,
    regla: "Apartado 1.1.1: tamaño 10, minúsculas tipo título, negrilla.", valor: { pt: 10, negrilla: true } },
  { id: "tit-nivel3", categoria: "titulos", verificador: "codigo", pagina: 12,
    regla: "Apartado 1.1.1.1: tamaño 10, minúsculas tipo título, negrilla y cursiva.", valor: { pt: 10, negrilla: true, cursiva: true } },

  // ── Carátula, tapa y lomo (pp. 4, 5, 14) ───────────────────────
  { id: "car-encabezado", categoria: "caratula", verificador: "codigo", pagina: 14,
    regla: "Universidad en mayúscula, negrilla, tamaño 18, centrada arriba. Facultad y Carrera en mayúscula, negrilla, tamaño 16, centradas.",
    valor: { universidad_pt: 18, facultad_carrera_pt: 16 } },
  { id: "car-logo", categoria: "caratula", verificador: "codigo", pagina: 14,
    regla: "Logo centrado en la parte superior: 6 cm de ancho por 5.5 cm de alto.", valor: { ancho_cm: 6, alto_cm: 5.5 } },
  { id: "car-titulo", categoria: "caratula", verificador: "codigo", pagina: 14,
    regla: "Título del trabajo en mayúscula, negrilla, tamaño 18, entre comillas, centrado en la parte media.",
    valor: { pt: 18, entre_comillas: true } },
  { id: "car-modalidad", categoria: "caratula", verificador: "codigo", pagina: 14,
    regla: "Texto de la modalidad (Tesis / Proyecto de Grado / Trabajo Dirigido ... PARA OPTAR AL GRADO ACADÉMICO DE LICENCIATURA EN ...): mayúscula, negrilla, tamaño 14, alineado a la derecha y justificado.",
    valor: { pt: 14, alineacion: "derecha-justificado" } },
  { id: "car-postulante-tutor", categoria: "caratula", verificador: "codigo", pagina: 14,
    regla: "POSTULANTE y TUTOR en mayúsculas; nombres en minúsculas, sin negrilla, tamaño 12, centrados abajo. El tutor lleva grado académico y nombre completo.",
    valor: { pt: 12 } },
  { id: "car-ciudad-anio", categoria: "caratula", verificador: "codigo", pagina: 14,
    regla: "Ciudad - País en minúscula, sin negrilla, tamaño 12, centrado abajo. El año es el de la defensa.", valor: { pt: 12 } },
  { id: "car-tapa", categoria: "caratula", verificador: "ia", pagina: 4,
    regla: "La tapa (empastado) va en cartón forrado de color guindo con letras doradas (Verdana). La contratapa no lleva texto.",
    pendiente: "Es un requisito de empastado físico; el documento digital no lo cumple por sí solo." },
  { id: "car-lomo", categoria: "caratula", verificador: "codigo", pagina: 5,
    regla: "Lomo en dorado, Verdana: nombre del estudiante (minúscula, tamaño 12, extremo superior, 9 cm), título entre comillas (mayúscula, negrilla, 14, parte media) y sigla de la carrera con el año (negrilla, 12, extremo inferior, 5 cm)." },
  { id: "car-portada", categoria: "caratula", verificador: "codigo", pagina: 5,
    regla: "La portada repite la estructura y el texto de la tapa y va precedida de una hoja en blanco." },

  // ── Preliminares (pp. 3, 5-6, 13) ──────────────────────────────
  { id: "pre-orden", categoria: "preliminares", verificador: "codigo", pagina: 3,
    regla: "Orden de los preliminares: tapas, lomo, guardas, portada, dedicatoria (opcional), agradecimiento (opcional), resumen, índice de contenido, índice de tablas/figuras/gráficos." },
  { id: "pre-dedicatoria", categoria: "preliminares", verificador: "codigo", pagina: 5,
    regla: "Dedicatoria y agradecimiento (opcionales): cada uno en hoja exclusiva, ubicados en el extremo inferior derecho." },
  { id: "pre-resumen", categoria: "preliminares", verificador: "codigo", pagina: 6,
    // Decisión del dueño (30-oct-2026): la guía dice "250 palabras" sin aclarar; se aplica
    // como MÁXIMO. Confirmar con UNIFRANZ o con el tutor.
    regla: "El resumen tiene como máximo 250 palabras: objetivo, método o procedimiento y resultados.",
    valor: { max_palabras: 250 } },
  { id: "pre-indice", categoria: "preliminares", verificador: "codigo", pagina: 13,
    // Decisión del dueño (30-oct-2026): el texto de la guía se contradice con su propio
    // ejemplo; se aplica el ejemplo (con número de página).
    regla: "Índice de contenido con capítulos y títulos ordenados y la página donde aparece cada uno.",
    valor: { con_pagina: true } },
  { id: "pre-indices-aparte", categoria: "preliminares", verificador: "codigo", pagina: 13,
    regla: "Índices de tablas, figuras, cuadros y gráficos, cada tipo por separado, según corresponda." },

  // ── Redacción (pp. 8-9) ────────────────────────────────────────
  { id: "red-persona", categoria: "redaccion", verificador: "ia", pagina: 8,
    regla: "Redacción impersonal, en tercera persona singular. Sin primera persona, sin exclamaciones y sin preguntas en primera persona." },
  { id: "red-tiempo", categoria: "redaccion", verificador: "ia", pagina: 8,
    regla: "Coherencia en los tiempos verbales y, en lo posible, redacción en tiempo pasado." },
  { id: "red-estilo", categoria: "redaccion", verificador: "ia", pagina: 8,
    regla: "Lenguaje directo, claro, preciso y conciso, opuesto al literario." },
  { id: "red-unidades", categoria: "redaccion", verificador: "ia", pagina: 8,
    regla: "Unidades físicas y abreviaciones oficiales (Sistema Internacional)." },
  { id: "red-cursivas", categoria: "redaccion", verificador: "codigo", pagina: 9,
    regla: "Cursiva solo para palabras extranjeras no aceptadas en castellano, nombres científicos, términos técnicos y títulos de libros, revistas y diarios." },
  { id: "red-siglas", categoria: "redaccion", verificador: "ia", pagina: 9,
    regla: "Una sigla se explica primero y se coloca entre paréntesis; después se usa sin paréntesis." },
  { id: "red-ortografia", categoria: "redaccion", verificador: "ia", pagina: 9,
    regla: "Puntuación y acentos según la normativa actualizada de la RAE." },

  // ── Citas (pp. 9-11) ───────────────────────────────────────────
  { id: "cit-norma", categoria: "citas", verificador: "ia", pagina: 9,
    regla: "Citas y referencias según normas APA, en formato (Apellido, año, p.)." },
  { id: "cit-breve", categoria: "citas", verificador: "codigo", pagina: 9,
    regla: "Cita breve (hasta 4 líneas o 40 palabras): dentro del párrafo, entre comillas dobles, con (Apellido, año, p.).",
    valor: { max_palabras: 40 } },
  { id: "cit-larga", categoria: "citas", verificador: "codigo", pagina: 10,
    regla: "Cita larga (más de 4 líneas o 40 palabras): bloque aparte con sangría de 5 o 6 espacios a ambos lados, en cursiva, sin comillas, y no mayor a la mitad de la página.",
    valor: { min_palabras: 41 } },
  { id: "cit-estructura-parrafo", categoria: "citas", verificador: "ia", pagina: 10,
    regla: "Todo párrafo con cita textual sigue: oración principal + oración argumentativa + cita + oración conclusiva." },
  { id: "cit-parafrasis", categoria: "citas", verificador: "ia", pagina: 10,
    regla: "La paráfrasis indica autor y año; la página no es obligatoria." },
  { id: "cit-omision", categoria: "citas", verificador: "codigo", pagina: 10,
    regla: "Lo omitido en una cita textual se señala con tres puntos suspensivos entre corchetes [...]. No se añaden comentarios propios dentro de la cita." },
  { id: "cit-electronica", categoria: "citas", verificador: "ia", pagina: 11,
    regla: "Recursos electrónicos: se cita con autor o dirección, y fecha y hora de recuperación." },

  // ── Bibliografía (p. 7) ────────────────────────────────────────
  { id: "bib-completa", categoria: "bibliografia", verificador: "ia", pagina: 7,
    regla: "La bibliografía lista todas las fuentes usadas y mencionadas en el documento, y solo esas." },
  { id: "bib-orden", categoria: "bibliografia", verificador: "codigo", pagina: 7,
    regla: "Orden alfabético por apellido del autor, con el apellido en minúsculas, formato APA." },
  { id: "ref-final", categoria: "bibliografia", verificador: "codigo", pagina: 3,
    regla: "Después del cuerpo van las referencias: abreviaturas, glosario, apéndices, anexos y planos (los que apliquen)." },

  // ── Estructura del cuerpo: común a todas las modalidades (pp. 6, 15-19) ──
  { id: "est-intro", categoria: "estructura", verificador: "ia", pagina: 6,
    regla: "La Introducción incluye: presentación general, planteamiento del problema, justificación, objetivos (general y específicos), alcances, hipótesis con variables (si aplica) y una breve descripción de cómo se organiza el trabajo." },
  { id: "est-justificacion", categoria: "estructura", verificador: "ia", pagina: 15,
    regla: "La justificación se divide en práctica, económica, social, legal y teórica." },
  { id: "est-alcances", categoria: "estructura", verificador: "ia", pagina: 15,
    regla: "Los alcances se dividen en temático, temporal y espacial." },
  { id: "est-conclusiones", categoria: "estructura", verificador: "ia", pagina: 7,
    regla: "Las conclusiones sintetizan los resultados de forma lógica, ordenada y concisa, marcan los elementos principales de los objetivos y contienen datos concretos analizados e interpretados." },
  { id: "est-recomendaciones", categoria: "estructura", verificador: "ia", pagina: 7,
    regla: "Las recomendaciones plantean la posibilidad de ampliar la investigación en función de los resultados." },
  { id: "est-orden-cierre", categoria: "estructura", verificador: "codigo", pagina: 15,
    regla: "Después de los capítulos van, en este orden: Conclusiones, Recomendaciones, Bibliografía." },

  // ── Estructura del cuerpo: según modalidad (pp. 15-19) ─────────
  { id: "est-tesis-hipotesis", categoria: "estructura", verificador: "ia", pagina: 15,
    modalidades: ["unifranz-tesis"],
    regla: "La Tesis incluye hipótesis con variable independiente, dependiente e intercurrente." },
  { id: "est-tesis-capitulos", categoria: "estructura", verificador: "ia", pagina: 15,
    modalidades: ["unifranz-tesis"],
    regla: "Capítulos de la Tesis: I Marco Teórico; II Marco Práctico (metodología, con justificación y relación secuencial de actividades); III Resultados y Discusión." },
  { id: "est-pg-prefactibilidad", categoria: "estructura", verificador: "ia", pagina: 16,
    modalidades: ["unifranz-pg-prefactibilidad"],
    regla: "Prefactibilidad: I Marco Teórico; II Investigación (análisis del macroentorno, del microentorno, matricial, metodología de investigación, estudio de mercado); III Plan Estratégico (estructura organizacional, plan de marketing, plan de producción, planificación financiera, aspectos legales)." },
  { id: "est-pg-mejora-org", categoria: "estructura", verificador: "ia", pagina: 17,
    modalidades: ["unifranz-pg-mejora-org"],
    regla: "Mejora o innovación organizacional: I Marco Teórico; II Investigación (microentorno, institucional, matricial, metodología, estudio de mercado); III Propuesta (identificación de estrategias, diseño de la propuesta, plan de implementación, plan de seguimiento y control, evaluación financiera)." },
  { id: "est-pg-artefacto", categoria: "estructura", verificador: "ia", pagina: 18,
    modalidades: ["unifranz-pg-artefacto"],
    regla: "Artefacto, sistema o dispositivo: I Marco Teórico; II Investigación (macroentorno, microentorno, matricial, metodología, estudio de mercado); III Diseño (especificaciones a cumplir, planos y especificaciones constructivas o sistema comercial, construcción del prototipo, validación, evaluación financiera)." },
  { id: "est-trabajo-dirigido", categoria: "estructura", verificador: "ia", pagina: 19,
    modalidades: ["unifranz-trabajo-dirigido"],
    regla: "Trabajo Dirigido: I Marco Teórico; II Investigación (microentorno, institucional, matricial, metodología, estudio de mercado); III Propuesta (estrategias, diseño de la propuesta, plan de implementación, plan de seguimiento y control, evaluación financiera)." },
];

/** Requisitos que aplican a una modalidad (los comunes + los propios). */
export function requisitosParaModalidad(modalidad: ModalidadUnifranz): Requisito[] {
  return REQUISITOS_UNIFRANZ_2017.filter((r) => !r.modalidades || r.modalidades.includes(modalidad));
}
