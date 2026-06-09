import type { CasoMercados } from "../types";

/**
 * Caso 3 — Gimnasio low-cost en Plan 3000 (Santa Cruz).
 *
 * **Dificultad básica.** Caso de estudio descriptivo con muestreo
 * por conveniencia + cuotas (no aleatorio puro porque el alumno no
 * tenía marco muestral). Útil para mostrar cómo se hace investigación
 * SERIA con recursos limitados.
 */

export const casoGimnasioPlan3000Scz: CasoMercados = {
  slug: "gimnasio-lowcost-plan3000-scz",
  modulo: "mercados",
  titulo: "Gimnasio low-cost en Plan 3000",
  tagline: "Estudio cuantitativo + 2 focus groups para validar un gimnasio Bs 80/mes en Plan 3000, Santa Cruz.",
  zona: "Plan 3000 (Distritos 8 y 12), Santa Cruz",
  rubro: "Salud y bienestar",
  dificultad: "basico",
  emoji: "💪",
  emprendedor: {
    nombre: "Roger Ardaya",
    edad: 33,
    rol: "Entrenador personal certificado en Argentina. Trabaja en un gimnasio premium del 2do anillo cobrando Bs 350/sesión, pero ve que en Plan 3000 (donde vive su mamá) no hay gimnasios. La gente entrena en plazas o no entrena.",
  },
  contexto: [
    "Roger notaba un patrón: gimnasios premium en 2do/3er anillo cobran Bs 250-450/mes. En Plan 3000 (zona de obreros, comerciantes, amas de casa) no hay nada. La opción local es 'pesarse en bote de pintura'.",
    "Su hipótesis: hay demanda no atendida porque NADIE entra al Plan 3000 con un gimnasio formal. Pero el precio tiene que ser ≤ Bs 100/mes para que sea sostenible para el ingreso típico de la zona (Bs 2.500-4.500/mes familiar).",
    "Como su tutor de tesis lo exigió, hizo un estudio mixto: 200 encuestas presenciales por conveniencia con cuotas (50% mujeres, 50% hombres, edades repartidas) MÁS 2 focus groups (uno de mujeres 25-45, otro de hombres 25-45) para entender motivaciones profundas.",
  ],
  problema: "Roger no sabe si la gente del Plan 3000 percibe el gimnasio como necesidad o como lujo, ni a qué precio aceptaría pagar.",
  segmento: "Habitantes de Plan 3000 (Distritos 8 y 12), 18-55 años, con ingreso familiar Bs 2.500-5.500/mes, interesados en hacer ejercicio.",
  diseno: {
    pregunta: "¿Existe demanda real de gimnasio low-cost (≤Bs 100/mes) en Plan 3000, y cuáles son las motivaciones y barreras del segmento?",
    tipo: "descriptivo",
    enfoque: "mixto",
    objetivo_general: "Determinar el tamaño del segmento dispuesto a inscribirse en un gimnasio de Bs 80/mes en Plan 3000 e identificar barreras de adopción.",
    objetivos_especificos: [
      "Estimar el porcentaje de habitantes 18-55 que actualmente hacen ejercicio organizado.",
      "Medir la disposición a pagar mensual por un gimnasio cercano.",
      "Identificar las 3 razones principales para no entrenar actualmente.",
      "Detectar diferencias de motivación entre hombres y mujeres.",
      "Explorar cualitativamente qué representa 'gimnasio' culturalmente para el segmento.",
    ],
    hipotesis: [
      "Menos del 20% del segmento hace ejercicio organizado actualmente.",
      "Al menos el 40% pagaría Bs 80/mes por un gimnasio bien equipado y cercano.",
      "La barrera principal NO es el precio, es la distancia/percepción cultural ('gimnasio es para gente con plata').",
    ],
  },
  muestreo: {
    poblacion: "Habitantes de Plan 3000 (Distritos 8 y 12), 18-55 años. Total estimado: ~80.000 personas en esa edad según INE 2022.",
    N_poblacion: 80000,
    n_muestra: 380,
    formula_usada: "Cochran para población muy grande (proporción 50/50), IC 95%, error 5%. Se redondeó a 380 por las cuotas de género y edad.",
    nivel_confianza: 95,
    margen_error: 5,
    tecnica: "por_conveniencia",
    justificacion_tecnica: "No hay marco muestral oficial de habitantes por hogar. Se aplica muestreo por conveniencia con CUOTAS estrictas: 50% mujeres / 50% hombres, repartido en cuatro rangos de edad (18-25, 26-35, 36-45, 46-55), recolectando en 6 puntos estratégicos del Plan 3000 (mercados, plaza central, esquinas concurridas) en distintos horarios para diversificar perfiles.",
  },
  encuesta: [
    {
      numero: 1,
      texto: "¿Haces ejercicio físico regularmente (al menos 2 veces por semana)?",
      tipo: "cerrada_si_no",
      objetivo_que_ataca: "Línea base de actividad.",
    },
    {
      numero: 2,
      texto: "Si haces ejercicio, ¿dónde? (selecciona todas las que correspondan)",
      tipo: "opcion_multiple",
      opciones: ["En casa con video/YouTube", "En la plaza/parque", "En un gimnasio del barrio", "En un gimnasio fuera del Plan 3000", "No hago ejercicio"],
    },
    {
      numero: 3,
      texto: "Si NO haces ejercicio, ¿cuáles son las TRES razones principales?",
      tipo: "opcion_multiple",
      opciones: [
        "No tengo tiempo",
        "No hay gimnasio cerca",
        "Los gimnasios son caros",
        "No me gusta entrenar solo",
        "No sé qué ejercicios hacer",
        "Pereza / falta de motivación",
        "Salud (lesión, embarazo, etc.)",
      ],
      objetivo_que_ataca: "Identificar barreras de adopción.",
    },
    {
      numero: 4,
      texto: "Si abriera un gimnasio bien equipado A 10 MINUTOS DE TU CASA, ¿cuánto pagarías por mes?",
      tipo: "opcion_multiple",
      opciones: ["No pagaría (no me interesa)", "Hasta Bs 50", "Bs 51-80", "Bs 81-120", "Más de Bs 120"],
      objetivo_que_ataca: "Disposición a pagar.",
    },
    {
      numero: 5,
      texto: "¿Qué incluiría un gimnasio que SÍ pagarías? (selecciona hasta 3)",
      tipo: "opcion_multiple",
      opciones: [
        "Máquinas modernas (cintas, elípticas, pesas)",
        "Clases grupales (aeróbicos, zumba, funcional)",
        "Entrenador que me guíe",
        "Vestuario y duchas",
        "Aire acondicionado",
        "Horarios amplios (5 am a 22 pm)",
        "Plan nutricional incluido",
      ],
      objetivo_que_ataca: "Identificar atributos clave de oferta.",
    },
    {
      numero: 6,
      texto: "Indica tu rango de edad.",
      tipo: "opcion_multiple",
      opciones: ["18-25", "26-35", "36-45", "46-55"],
    },
    {
      numero: 7,
      texto: "Género.",
      tipo: "opcion_multiple",
      opciones: ["Femenino", "Masculino"],
    },
    {
      numero: 8,
      texto: "Ingreso familiar mensual aproximado.",
      tipo: "opcion_multiple",
      opciones: ["Menos de Bs 2.500", "Bs 2.500-3.500", "Bs 3.500-5.500", "Más de Bs 5.500"],
    },
  ],
  recoleccion: {
    canal: "Presencial en 6 puntos del Plan 3000 (Mercado Mutualista, Mercado Abasto, Plaza 21, esquinas de Av. Virgen de Cotoca, Mercado del 2do anillo del Plan, comercios de la Banzer). Encuestadoras entrenadas con cuotas controladas.",
    duracion_promedio_min: 6,
    incentivo: "Una entrada gratis de 1 semana al gimnasio cuando abra.",
    tasa_respuesta_pct: 71,
  },
  resultados_clave: [
    {
      variable: "Actividad física actual (Q1)",
      hallazgo: "Solo 17% hace ejercicio regularmente. 83% no.",
      interpretacion: "Hipótesis 1 CONFIRMADA: mercado mayormente sedentario. Hay espacio enorme de captura.",
    },
    {
      variable: "Razones para no entrenar (Q3)",
      hallazgo: "Top 3 razones: 'No hay gimnasio cerca' (54%), 'No sé qué ejercicios hacer' (38%), 'No tengo tiempo' (31%). 'Los gimnasios son caros' solo 19%.",
      interpretacion: "Hipótesis 3 CONFIRMADA: la barrera principal no es precio, es ACCESO + DESCONOCIMIENTO. Esto cambia toda la propuesta.",
    },
    {
      variable: "DAP por gimnasio cercano (Q4)",
      hallazgo: "El 49% pagaría Bs 51-80; 18% más de Bs 80. Sumando, 67% paga ≥ Bs 51.",
      interpretacion: "Hipótesis 2 CONFIRMADA: hay demanda a Bs 80. Pero el techo es Bs 100 — arriba pierde dos tercios del mercado.",
    },
    {
      variable: "Atributos valorados (Q5)",
      hallazgo: "Top 3: 'Entrenador que me guíe' (61%), 'Máquinas modernas' (52%), 'Clases grupales' (47%).",
      interpretacion: "ENTRENADOR es el atributo #1, no las máquinas. Esto valida la inversión en personal calificado por encima de la inversión en equipos premium.",
    },
    {
      variable: "Insight cualitativo (focus group mujeres)",
      hallazgo: "Frase recurrente: 'el gimnasio es para flacas y para hombres'. Las mujeres del Plan 3000 sienten que NO ENCAJAN.",
      interpretacion: "Tabú cultural más fuerte de lo esperado. La comunicación debe MOSTRAR mujeres del barrio entrenando, no modelos. El branding inclusivo es crítico.",
    },
    {
      variable: "Insight cualitativo (focus group hombres)",
      hallazgo: "Frase recurrente: 'voy a empezar el lunes' (que nunca llega). Necesidad de COMPROMISO EXTERNO.",
      interpretacion: "Vender por trimestre (no mensual) y crear grupos pequeños con coach asignado para que la gente NO PUEDA escapar de su rutina.",
    },
  ],
  cruce_destacado: {
    variables: ["Género (Q7)", "DAP (Q4)"],
    hallazgo: "Mujeres dispuestas a pagar ≥ Bs 80: 54%. Hombres: 41%. SORPRESA: las mujeres pagan MÁS por gimnasio cercano que los hombres, contrario al prejuicio del emprendedor.",
  },
  recomendacion: "PROCEDER con gimnasio Bs 80/mes con tres ajustes clave: (1) Coach asignado por cliente (no solo monitores genéricos) — atributo #1 valorado. (2) Comunicación con CARAS REALES del barrio, especialmente mujeres 35-50 que es el segmento con mayor DAP. (3) Membresía trimestral con descuento (Bs 200 los 3 meses = Bs 67/mes) para crear compromiso. Tamaño potencial: 80.000 hab × 17% interés activo × 49% DAP Bs 80 = ~6.660 clientes potenciales en la zona. Punto de equilibrio a 250 socios activos.",
  conclusion: "Estudio **valida fuerte la propuesta** con un giro: el problema no era precio sino acceso + descapitalización cultural. El estudio mixto fue clave: solo con encuestas no habría detectado el tabú \"el gimnasio es para flacas\" que cambia toda la comunicación. Roger ajustó el branding a 'tu barrio, tu gimnasio'.",
  lecciones: [
    "Muestreo por conveniencia con CUOTAS bien diseñadas (género + edad + zona) puede dar resultados muy útiles cuando no hay marco muestral oficial.",
    "Estudio mixto (cuantitativo + focus group) vale más que la suma de las partes: el focus reveló el tabú cultural que la encuesta no captura.",
    "La pregunta de razones para NO comprar es tan o más valiosa que las de motivación: revela barreras operativas, no aspiracionales.",
    "Cruzar género con DAP puede romper prejuicios del emprendedor (mujeres pagaban más que hombres).",
    "Los focus groups con 6-10 personas, 90 min, moderador entrenado: cuestan Bs 800-1.500 pero ahorran decisiones equivocadas de Bs 30.000+.",
  ],
  errores_evitados: [
    "No suponer que el precio es la barrera principal — medirlo SIEMPRE.",
    "No descartar el muestreo por conveniencia: con cuotas bien hechas es metodológicamente defendible para pregrado.",
    "No saltarse focus groups por 'ahorrar tiempo' — sin esos no se descubre el tabú cultural.",
    "No comunicar con modelos fitness genéricos: en Plan 3000 hay que mostrar cara del barrio.",
    "No vender mensual desde el día 1: el 'voy a empezar el lunes' destruye la retención.",
  ],
  tags: ["mixto", "descriptivo", "por-conveniencia", "cuotas", "salud", "Santa-Cruz", "n-380", "focus-group"],
};
