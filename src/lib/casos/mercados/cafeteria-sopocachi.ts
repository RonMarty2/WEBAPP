import type { CasoMercados } from "../types";

/**
 * Caso 1 — Investigación de mercado para una cafetería de especialidad
 * en Sopocachi, La Paz.
 *
 * Caso **básico** que muestra la metodología típica de un estudio
 * cuantitativo descriptivo con muestra calculada por Cochran. Sirve
 * de plantilla para 80% de los proyectos de pregrado.
 */

export const casoCafeteriaSopocachi: CasoMercados = {
  slug: "cafeteria-especialidad-sopocachi",
  modulo: "mercados",
  titulo: "Café de especialidad en Sopocachi",
  tagline: "Estudio cuantitativo a 384 oficinistas para validar demanda de café de especialidad de origen boliviano.",
  zona: "Sopocachi, La Paz",
  rubro: "Alimentación / cafetería",
  dificultad: "basico",
  emoji: "☕",
  emprendedor: {
    nombre: "Andrés Torrico",
    edad: 30,
    rol: "Barista entrenado en Colombia, regresó a La Paz en 2025 con la idea de montar una cafetería de especialidad con granos de Caranavi y Coroico. Quería validar demanda antes de comprometer Bs 35.000 en equipamiento.",
  },
  contexto: [
    "Andrés intuía que había mercado: en sus tres años en Bogotá vio cómo las cafeterías de especialidad pasaron de exóticas a estándar. En La Paz, las únicas cafeterías comparables estaban en Achumani y Zona Sur, alejadas del oficinista promedio.",
    "Antes de firmar contrato de un local en Sopocachi (Av. Ecuador, Bs 4.800/mes), decidió hacer una investigación formal. No quería gastarse el ahorro de su familia en un proyecto basado en \"yo creo que sí\".",
    "Diseñó un estudio cuantitativo descriptivo dirigido a oficinistas de las cuatro torres principales de Sopocachi. Su tutora de UMSA le ayudó a estructurar el proyecto académico simultáneamente con el plan de negocio.",
  ],
  problema: "Andrés no sabe si existe demanda suficiente de café de especialidad entre oficinistas de Sopocachi, ni a qué precio están dispuestos a pagar.",
  segmento: "Oficinistas de 25-50 años en torres de Sopocachi (Av. Ecuador, Av. 6 de Agosto, Av. Arce, Plaza Avaroa), NSE B y C+, consumidores actuales de café de cualquier tipo.",
  diseno: {
    pregunta: "¿Existe demanda potencial suficiente entre oficinistas de Sopocachi para una cafetería de especialidad con granos de origen boliviano, y a qué precio?",
    tipo: "descriptivo",
    enfoque: "cuantitativo",
    objetivo_general: "Estimar el tamaño y disposición a pagar del segmento de oficinistas de Sopocachi para una cafetería de especialidad de granos bolivianos.",
    objetivos_especificos: [
      "Identificar la frecuencia actual de consumo de café fuera de casa entre oficinistas de la zona.",
      "Determinar el rango de precio aceptable (mínimo, ideal, máximo) por un café de especialidad.",
      "Estimar el porcentaje de oficinistas dispuestos a probar al menos una vez una cafetería nueva.",
      "Identificar los 3 atributos más valorados al elegir cafetería (precio, sabor, velocidad, ambiente, etc.).",
      "Detectar diferencias de consumo entre rangos de edad y género.",
    ],
    hipotesis: [
      "Al menos el 60% de los oficinistas consume café fuera de casa más de 2 veces por semana.",
      "El precio ideal aceptado por un café de especialidad está entre Bs 15 y Bs 22.",
      "El ambiente y el sabor son más valorados que el precio en oficinistas de 30+ años.",
    ],
  },
  muestreo: {
    poblacion: "Oficinistas que trabajan en las 4 torres principales de Sopocachi (Av. Ecuador, Av. 6 de Agosto, Av. Arce, Plaza Avaroa), 25-50 años.",
    N_poblacion: 4200,
    n_muestra: 384,
    formula_usada: "Cochran para poblaciones >100.000 (proporción 50/50). Para N=4200 se ajusta con corrección de población finita, pero el resultado se redondea a 384 por simplicidad académica.",
    nivel_confianza: 95,
    margen_error: 5,
    tecnica: "estratificado",
    justificacion_tecnica: "Cada torre tiene perfil ocupacional distinto (Av. Arce más bancos, Plaza Avaroa más ONGs y consultorías). Se estratifica proporcionalmente al número estimado de oficinistas por torre para asegurar representatividad geográfica.",
  },
  encuesta: [
    {
      numero: 1,
      texto: "¿Con qué frecuencia consumes café FUERA DE TU CASA en un día laboral típico?",
      tipo: "opcion_multiple",
      opciones: ["Nunca", "1-2 veces por semana", "3-4 veces por semana", "Todos los días"],
      objetivo_que_ataca: "Identificar frecuencia actual de consumo.",
    },
    {
      numero: 2,
      texto: "¿Cuánto pagas habitualmente por un café fuera de casa? (excluyendo desayunos)",
      tipo: "opcion_multiple",
      opciones: ["Menos de Bs 8", "Bs 8 a Bs 14", "Bs 15 a Bs 22", "Más de Bs 22"],
      objetivo_que_ataca: "Determinar el rango de precio actual.",
    },
    {
      numero: 3,
      texto: "Por un café de especialidad (grano único, preparación de barista), ¿cuánto estarías dispuesto a pagar?",
      tipo: "escala_numerica",
      opciones: ["Bs 0 (no pagaría)", "Bs 10", "Bs 15", "Bs 20", "Bs 25", "Bs 30+"],
      objetivo_que_ataca: "Determinar disposición a pagar máxima.",
    },
    {
      numero: 4,
      texto: "Ordena de más importante (1) a menos importante (5) los atributos al elegir cafetería: SABOR, PRECIO, VELOCIDAD, AMBIENTE, UBICACIÓN.",
      tipo: "ranking",
      objetivo_que_ataca: "Identificar atributos más valorados.",
    },
    {
      numero: 5,
      texto: "Si abriera una cafetería de especialidad con granos bolivianos (Caranavi/Coroico) en tu zona, ¿qué tan probable es que la pruebes?",
      tipo: "likert",
      opciones: ["Muy improbable", "Improbable", "Neutral", "Probable", "Muy probable"],
      objetivo_que_ataca: "Estimar intención de prueba.",
    },
    {
      numero: 6,
      texto: "¿Qué te frenaría de probar una cafetería nueva? (selecciona hasta 2)",
      tipo: "opcion_multiple",
      opciones: ["Precio alto", "Distancia/ubicación", "Falta de tiempo", "Conformidad con mi cafetería actual", "Desconfianza con marcas nuevas"],
      objetivo_que_ataca: "Identificar barreras de adopción.",
    },
    {
      numero: 7,
      texto: "Indica tu rango de edad.",
      tipo: "opcion_multiple",
      opciones: ["25-30", "31-40", "41-50", "Más de 50"],
      objetivo_que_ataca: "Variable demográfica de cruce.",
    },
    {
      numero: 8,
      texto: "Género.",
      tipo: "opcion_multiple",
      opciones: ["Femenino", "Masculino", "Prefiero no decirlo"],
      objetivo_que_ataca: "Variable demográfica de cruce.",
    },
  ],
  recoleccion: {
    canal: "Encuesta presencial en las puertas de las 4 torres durante horarios de salida al almuerzo (12:00-13:30) durante 6 días. Refuerzo digital con código QR para los que dijeron 'no tengo tiempo'.",
    duracion_promedio_min: 4,
    incentivo: "Vale de Bs 5 en café cuando abra la cafetería + sorteo de 1 desayuno completo entre los que completaron.",
    tasa_respuesta_pct: 68,
  },
  resultados_clave: [
    {
      variable: "Frecuencia de consumo (Pregunta 1)",
      hallazgo: "73% consume café fuera de casa ≥3 veces/semana; 41% lo hace todos los días.",
      interpretacion: "Mercado con hábito consolidado: el oficinista de Sopocachi YA consume, la batalla es por elegirte a ti vs la cafetería actual.",
    },
    {
      variable: "Precio actual pagado (Pregunta 2)",
      hallazgo: "El 58% paga entre Bs 8 y Bs 14 por taza. Solo 12% paga >Bs 22.",
      interpretacion: "El benchmark del mercado está en Bs 10-14. Pedir Bs 20+ requiere argumento fuerte (origen, calidad, experiencia).",
    },
    {
      variable: "Disposición a pagar por especialidad (Pregunta 3)",
      hallazgo: "El precio ideal mediano es Bs 17. El 64% acepta hasta Bs 20. Solo 28% acepta Bs 25.",
      interpretacion: "El sweet spot es Bs 16-19. A Bs 25 se pierde un 36% del mercado. Estrategia: tope Bs 19 para café simple, Bs 25+ solo para preparaciones premium (V60, AeroPress).",
    },
    {
      variable: "Ranking de atributos (Pregunta 4)",
      hallazgo: "Top 3: 1° SABOR (52% lo puso 1°), 2° VELOCIDAD (34%), 3° UBICACIÓN (28%). PRECIO quedó 4° (15%).",
      interpretacion: "Sorprendente: el oficinista de Sopocachi no es sensible al precio sino al sabor. Esto valida una propuesta de especialidad SI se entrega rápido (≤4 min).",
    },
    {
      variable: "Intención de prueba (Pregunta 5)",
      hallazgo: "El 71% respondió 'probable' o 'muy probable' que pruebe una cafetería nueva.",
      interpretacion: "Mercado abierto a probar. El reto es que el 'probable' se convierta en visita real. Necesita activación (flyers, primera taza gratis).",
    },
    {
      variable: "Barreras de adopción (Pregunta 6)",
      hallazgo: "La barrera #1 es 'falta de tiempo' (44%), no precio (29%) ni desconfianza (12%).",
      interpretacion: "Velocidad y proximidad son claves operativas. Una caja de pedidos rápidos para llevar puede captar al 44% que dice 'no tengo tiempo'.",
    },
  ],
  cruce_destacado: {
    variables: ["Rango de edad (Q7)", "Disposición a pagar Bs 20+ (Q3)"],
    hallazgo: "El 31% de los 25-30 años acepta pagar Bs 20+. Pero el 57% de los 41-50 años lo acepta. La aceptación crece con la edad: a más senior, más disposición a pagar premium.",
  },
  recomendacion: "PROCEDER con la cafetería, pero con tres ajustes: (1) Precio ancla Bs 18 para americano/cortado (no Bs 25). (2) Velocidad ≤4 min como compromiso operativo, validado con \"si no es servido en 4 min, es gratis\". (3) Comunicación segmentada: visual joven y promociones agresivas para 25-30 años, énfasis en origen y método para 40+. Demanda potencial estimada: ~3.000 oficinistas/mes a captar 8% = 240 clientes recurrentes (≥2 visitas/semana), 4-6 cafés diarios cada uno = ~28 cafés/día como punto de equilibrio.",
  conclusion: "Estudio **viable y útil**. La hipótesis de demanda se confirmó. Las hipótesis de precio se confirmaron parcialmente: el rango Bs 15-22 es aceptado pero el centro de gravedad está en Bs 17-18, no en Bs 22. La hipótesis sobre ambiente vs precio se confirmó: el ambiente y sabor pesan más que el precio. Andrés decidió firmar el contrato del local con precios entre Bs 16-22 y enfoque en velocidad.",
  lecciones: [
    "La fórmula de Cochran para muestra de proporciones 50/50 da n≈384 para poblaciones >5.000 con IC 95% y error 5%. Es el default académico para cualquier estudio cuantitativo.",
    "Estratificar por geografía (torres) es más útil que estratificar por demografía cuando el comportamiento de consumo depende del lugar.",
    "La tasa de respuesta sube 15-25 puntos cuando hay incentivo tangible (vale Bs 5 + sorteo) vs solo agradecimiento verbal.",
    "Cruzar 'disposición a pagar' con 'edad' suele revelar la verdad detrás del promedio: el promedio dice una cosa, los segmentos otra.",
    "La pregunta de intención (Likert 'probable/muy probable') siempre infla el resultado real. Regla práctica: el comportamiento real es 40-60% del declarado.",
  ],
  errores_evitados: [
    "No tomar el promedio de la pregunta de precio como 'verdad' — analizar mediana y dispersión.",
    "No encuestar solo amigos y conocidos — sesgo de complacencia inflaría todo.",
    "No omitir la pregunta de barrera — entender el 'por qué no' es tan valioso como el 'por qué sí'.",
    "No suponer que precio es el atributo principal sin medirlo — sería un sesgo del emprendedor.",
    "No empezar con n=50 'para ver cómo va' — error muestral >10% hace inservibles las conclusiones.",
  ],
  tags: ["cuantitativo", "descriptivo", "Cochran", "estratificado", "alimentacion", "La-Paz", "n-384"],
};
