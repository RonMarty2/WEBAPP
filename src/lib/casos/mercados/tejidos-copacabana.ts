import type { CasoMercados } from "../types";

/**
 * Caso 4 — Tejidos artesanales para turistas en Copacabana (La Paz).
 *
 * **Dificultad avanzada.** Estudio exploratorio + cualitativo donde
 * la muestra no es estadísticamente representativa (turistas son
 * población flotante). Útil para enseñar que NO TODO ESTUDIO necesita
 * n=384: hay contextos donde el dato cualitativo profundo vale más.
 */

export const casoTejidosCopacabana: CasoMercados = {
  slug: "tejidos-artesanales-copacabana",
  modulo: "mercados",
  titulo: "Tejidos artesanales para turistas",
  tagline: "Estudio exploratorio mixto a 80 turistas + 12 entrevistas profundas en Copacabana para reposicionar artesanía aymara.",
  zona: "Copacabana, La Paz (Lago Titicaca)",
  rubro: "Turismo y artesanía",
  dificultad: "avanzado",
  emoji: "🧶",
  emprendedor: {
    nombre: "Elena Mamani",
    edad: 42,
    rol: "Tejedora aymara de tercera generación. Lidera una asociación de 18 mujeres tejedoras en Copacabana. Las ventas a turistas cayeron 40% desde 2020 (pandemia + cambio en perfil del turista). Quieren entender qué pasó y cómo reposicionar.",
  },
  contexto: [
    "Antes de 2020, los turistas en Copacabana eran mayormente europeos y norteamericanos que pagaban Bs 80-150 por una manta tejida. Después de la pandemia, la mezcla cambió: más turismo argentino y brasileño, menos europeo, y los argentinos negocian agresivo (\"Bs 30 te lo compro\").",
    "La asociación tenía dos opciones: bajar precios (matar el margen) o entender qué quiere el nuevo turista. Eligieron lo segundo. Con apoyo de una ONG y una estudiante de turismo de la UMSA, hicieron un estudio exploratorio para entender al nuevo turista.",
    "El reto metodológico: no se puede hacer una encuesta probabilística a turistas (no hay marco muestral, son población flotante). Eligieron estudio MIXTO: 80 encuestas cortas en puntos turísticos + 12 entrevistas en profundidad (30-45 min) en hostales para perfil cualitativo.",
  ],
  problema: "La asociación no sabe POR QUÉ las ventas cayeron 40% ni cómo reposicionar su producto para el turista post-pandemia.",
  segmento: "Turistas que visitan Copacabana 1-3 días, mayoritariamente latinoamericanos (60% argentinos/brasileños/peruanos) y europeos (25%), 22-55 años.",
  diseno: {
    pregunta: "¿Qué perfil tiene el turista actual de Copacabana, qué valora en una pieza artesanal, y por qué la asociación está perdiendo ventas?",
    tipo: "exploratorio",
    enfoque: "mixto",
    objetivo_general: "Comprender el perfil del turista actual y reposicionar la oferta de tejidos para recuperar el ticket promedio.",
    objetivos_especificos: [
      "Caracterizar al turista actual (origen, edad, motivación de viaje, presupuesto).",
      "Identificar qué busca el turista al comprar artesanía (recuerdo, regalo, vestir, decoración).",
      "Detectar el rango de precio aceptado por nacionalidad.",
      "Identificar los atributos del producto que más valora (técnica, color, simbolismo, certificación).",
      "Explorar cualitativamente la NARRATIVA que conecta al turista con la pieza.",
    ],
    hipotesis: [
      "El perfil del turista cambió: ahora es más latinoamericano y joven, con presupuesto menor.",
      "El turista actual valora la HISTORIA detrás del producto, no solo el producto en sí.",
      "El precio óptimo depende fuertemente del país de origen, no del tipo de pieza.",
    ],
  },
  muestreo: {
    poblacion: "Turistas que visitan Copacabana en temporada media-alta (junio-septiembre). Estimado: 800-1.200 turistas/semana.",
    N_poblacion: 4500,
    n_muestra: 80,
    formula_usada: "NO se aplicó Cochran (estudio exploratorio, no busca representatividad estadística). n=80 se eligió por saturación: a partir de la entrevista 60 las respuestas empezaban a repetirse. Más 12 entrevistas en profundidad para profundidad.",
    nivel_confianza: 0,
    margen_error: 0,
    tecnica: "por_conveniencia",
    justificacion_tecnica: "Población flotante sin marco muestral; los turistas pasan 1-3 días y rotan. Estudio EXPLORATORIO acepta no-representatividad y compensa con riqueza cualitativa. Las 12 entrevistas profundas en hostales (Las Olas, Las Casitas, Joyas del Inca) se eligieron por convencimiento: turistas dispuestos a hablar 30 min.",
  },
  encuesta: [
    {
      numero: 1,
      texto: "¿De qué país vienes?",
      tipo: "abierta",
      objetivo_que_ataca: "Variable demográfica clave.",
    },
    {
      numero: 2,
      texto: "¿Cuántos días te quedarás en Copacabana?",
      tipo: "opcion_multiple",
      opciones: ["Solo el día (en tránsito)", "1 noche", "2-3 noches", "Más de 3 noches"],
    },
    {
      numero: 3,
      texto: "¿Comprarías artesanía en este viaje?",
      tipo: "opcion_multiple",
      opciones: ["Definitivamente sí", "Probablemente sí", "No sé", "Probablemente no", "No, ya compré suficiente"],
    },
    {
      numero: 4,
      texto: "Si compras artesanía, ¿para quién es principalmente?",
      tipo: "opcion_multiple",
      opciones: ["Para mí (uso personal)", "Para regalo a familia", "Para decoración de casa", "Para revender"],
    },
    {
      numero: 5,
      texto: "¿Cuánto estarías dispuesto a pagar por una MANTA TEJIDA A MANO de buena calidad?",
      tipo: "opcion_multiple",
      opciones: ["Hasta Bs 30", "Bs 31-60", "Bs 61-100", "Bs 101-200", "Más de Bs 200"],
      objetivo_que_ataca: "Disposición a pagar por nacionalidad.",
    },
    {
      numero: 6,
      texto: "¿Qué hace especial a una pieza para que pagues más?",
      tipo: "abierta",
      objetivo_que_ataca: "Insight cualitativo sobre el valor percibido.",
    },
    {
      numero: 7,
      texto: "¿Confiarías más en una pieza con certificación de origen y nombre de la tejedora?",
      tipo: "likert",
      opciones: ["No me importa", "Indiferente", "Sí, un poco", "Sí, mucho", "Sí, es decisivo"],
    },
  ],
  recoleccion: {
    canal: "Mixto: encuestas cortas (5 min) en mirador del cerro Calvario, malecón, frente a la basílica. Entrevistas en profundidad (30-45 min) acordadas en hostales y café-restaurantes de la zona.",
    duracion_promedio_min: 5,
    incentivo: "Una postal artesanal pequeña a quienes completaron encuesta. Para entrevistados: descuento Bs 30 en cualquier compra de la asociación.",
    tasa_respuesta_pct: 42,
  },
  resultados_clave: [
    {
      variable: "Origen del turista (Q1)",
      hallazgo: "Argentinos 38%, brasileños 18%, peruanos 12%, europeos (Francia/Alemania/España) 19%, EEUU/Canadá 7%, otros 6%.",
      interpretacion: "Hipótesis 1 CONFIRMADA: los latinoamericanos son ahora dos tercios del mercado (vs un tercio pre-pandemia). El producto debe ajustarse a este perfil.",
    },
    {
      variable: "DAP por manta cruzada con origen (Q5 × Q1)",
      hallazgo: "Argentinos: 71% paga ≤Bs 60. Brasileños: 64% paga ≤Bs 60. Europeos: 58% paga Bs 101-200. Norteamericanos: 71% paga Bs 101-200+.",
      interpretacion: "Hipótesis 3 CONFIRMADA: precio depende del origen. Estrategia: ofertar versión Bs 50 (más simple, más rápida) Y versión Bs 150+ (con certificación) en paralelo.",
    },
    {
      variable: "Motivación de compra (Q4)",
      hallazgo: "57% compra como REGALO, no para uso propio. 28% para decoración. Solo 11% para uso personal.",
      interpretacion: "Reposicionar la artesanía como REGALO especial (con packaging, etiqueta, historia escrita) le agrega valor percibido sin agregar mucho costo.",
    },
    {
      variable: "Importancia de certificación (Q7)",
      hallazgo: "62% de europeos y norteamericanos dicen 'sí, mucho' o 'es decisivo'. Solo 22% de argentinos/brasileños lo valora así.",
      interpretacion: "Hipótesis 2 PARCIALMENTE CONFIRMADA: la historia/certificación importa, pero sobre todo al segmento europeo/norteamericano que paga premium.",
    },
    {
      variable: "Insight cualitativo (entrevistas en profundidad)",
      hallazgo: "Frase recurrente de turista europea: 'no es que no quiera pagar Bs 150, es que no sé si esto es real o made-in-China importado'.",
      interpretacion: "El problema NO es solo precio, es ASIMETRÍA DE INFORMACIÓN. El turista no puede distinguir auténtico de réplica. La certificación y la historia eliminan esa duda.",
    },
    {
      variable: "Insight cualitativo (entrevistas en profundidad)",
      hallazgo: "Frase recurrente argentina: 'allá en Buenos Aires compré algo parecido a 1/3 del precio'.",
      interpretacion: "El turista argentino YA compró artesanía 'parecida' en su propio país (probablemente réplica industrial). La asociación debe diferenciarse no por precio sino por experiencia (visita al taller, ver tejer en vivo).",
    },
  ],
  cruce_destacado: {
    variables: ["Origen (Q1)", "Importancia certificación (Q7)"],
    hallazgo: "Europeos/norteamericanos con certificación: 62% paga premium. Sin certificación: 28%. La certificación DUPLICA la DAP de ese segmento. Para argentinos/brasileños: certificación sube DAP de 28% a 35% (no es factor crítico).",
  },
  recomendacion: "REPOSICIONAR con producto dual: (1) Línea \"Esencial\" Bs 40-70 (mantas simples, llaveros, gorros) para mercado argentino/brasileño/peruano. (2) Línea \"Heritage\" Bs 150-400 con tag físico que tiene nombre de la tejedora + foto + historia familiar + sello de la asociación, para mercado europeo/norteamericano. (3) Experiencia: tours al taller (Bs 50/persona, 90 min) donde el turista VE tejer. Crea apego emocional que vence la duda. Proyección: recuperar 40% de ventas perdidas en 8-12 meses.",
  conclusion: "Estudio **exitoso a pesar de no ser estadísticamente representativo**. Las 80 encuestas confirmaron las cifras (origen, DAP) y las 12 entrevistas revelaron las CAUSAS (asimetría de información, comparación con réplicas argentinas). La asociación entendió que el problema no era 'precios altos' sino 'falta de prueba de autenticidad'. La solución de certificación + experiencia (tour al taller) fue diseñada en base a este insight cualitativo.",
  lecciones: [
    "Cuando la población es flotante (turistas) y no hay marco muestral, un estudio exploratorio bien diseñado vale más que forzar una muestra probabilística inválida.",
    "Encuestas cortas + entrevistas profundas se complementan: las primeras dan los números, las segundas dan los porqués.",
    "Las preguntas abiertas (\"¿qué hace especial a una pieza?\") generan los insights más útiles del estudio entero.",
    "Cruzar variables demográficas (origen) con DAP puede revelar que NO HAY un cliente único — hay segmentos con economías distintas que requieren productos distintos.",
    "Saturación teórica (cuando las respuestas se repiten) es criterio válido para detener entrevistas. Suele ser 8-15 entrevistas por perfil.",
  ],
  errores_evitados: [
    "No forzar muestra probabilística donde no es posible — eso desacredita el estudio.",
    "No bajar precios uniformemente: pierde margen sin recuperar volumen.",
    "No descartar el insight cualitativo por 'no ser cuantificable' — es el material más rico.",
    "No competir con réplicas argentinas en precio: imposible. Competir en EXPERIENCIA y AUTENTICIDAD certificada.",
    "No vender el mismo producto al argentino y al alemán: son economías y motivaciones distintas.",
  ],
  tags: ["exploratorio", "mixto", "cualitativo", "entrevistas-profundas", "turismo", "Copacabana", "n-80", "saturacion"],
};
