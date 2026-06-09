import type { CasoMercados } from "../types";

/**
 * Caso 2 — Estudio causal sobre disposición a pagar guardería bilingüe
 * full-time en Cala Cala (Cochabamba).
 *
 * **Dificultad intermedia.** Ilustra un estudio CAUSAL (no descriptivo):
 * busca probar que ciertas características (horario, idioma, ratio
 * niños/educadora) cambian la disposición a pagar. Usa muestreo
 * estratificado por edad del hijo + análisis bivariado.
 */

export const casoGuarderiaCalaCalaCba: CasoMercados = {
  slug: "guarderia-bilingue-cala-cala-cba",
  modulo: "mercados",
  titulo: "Guardería bilingüe en Cala Cala",
  tagline: "Estudio causal con 250 padres de familia para validar disposición a pagar guardería bilingüe full-time.",
  zona: "Cala Cala / Tupuraya, Cochabamba",
  rubro: "Educación temprana",
  dificultad: "intermedio",
  emoji: "🧸",
  emprendedor: {
    nombre: "Verónica Camacho",
    edad: 38,
    rol: "Educadora de inicial con 14 años de experiencia. Dirigió por 7 años el área inicial de un colegio privado. Quiere abrir su propia guardería bilingüe pero las cuotas de las existentes (Bs 1.200-2.500/mes) le sugieren un mercado saturado en lo \"premium clásico\".",
  },
  contexto: [
    "Verónica veía a padres en Cala Cala llegar con ojeras a dejar a sus hijos a las 7:30 am, y volver corriendo a las 18:00 a buscarlos. Las guarderías de la zona cerraban a las 13:00 o 16:00 — incompatible con jornadas laborales reales de profesionales.",
    "Su intuición: el dolor del padre profesional no era 'una guardería más bonita', sino 'una que cubra MI horario laboral completo, con inglés porque es lo que pide el colegio donde irá después'. La pregunta: ¿pagarían MÁS por eso?",
    "Decidió un estudio causal: presentar 4 escenarios de guardería con distintos atributos (horario, idioma, ratio educadora/niños) y medir cuál genera mayor disposición a pagar. El estudio académicamente cumple con doble propósito: tesis de licenciatura y validación comercial.",
  ],
  problema: "Verónica no sabe si los padres pagarían premium por horario extendido (7:00-19:00) e inmersión bilingüe, ni cuál de los dos atributos pesa más en la decisión.",
  segmento: "Padres con hijos de 1-4 años en Cala Cala/Tupuraya/Recoleta, NSE B+, ambos progenitores trabajando, ingreso familiar ≥ Bs 12.000.",
  diseno: {
    pregunta: "¿En qué medida el horario extendido y la inmersión bilingüe aumentan la disposición a pagar por una guardería entre padres de Cala Cala?",
    tipo: "causal",
    enfoque: "cuantitativo",
    objetivo_general: "Determinar el efecto del horario extendido (7-19h vs 8-16h) y la inmersión bilingüe sobre la disposición a pagar mensual.",
    objetivos_especificos: [
      "Estimar la disposición a pagar base (escenario estándar: 8-16h, español, ratio 1:8).",
      "Medir el incremento de DAP atribuible a horario extendido (7-19h).",
      "Medir el incremento de DAP atribuible a inmersión bilingüe.",
      "Detectar interacciones (¿el bilingüe vale más cuando hay horario extendido?).",
      "Identificar las dudas principales que tienen los padres sobre guarderías bilingües.",
    ],
    hipotesis: [
      "El horario extendido aumenta la DAP en al menos Bs 400/mes vs el horario estándar.",
      "La inmersión bilingüe aumenta la DAP en al menos Bs 600/mes vs español.",
      "El efecto del bilingüe es mayor cuando ambos padres trabajan que cuando solo uno.",
    ],
  },
  muestreo: {
    poblacion: "Padres con al menos un hijo de 1-4 años, residentes en Cala Cala/Tupuraya/Recoleta, donde ambos padres (o el padre soltero) trabaja a tiempo completo.",
    N_poblacion: 1800,
    n_muestra: 250,
    formula_usada: "Cochran ajustado por población finita (corrección N=1800). Se redondea a 250 para asegurar 50 casos por estrato de edad.",
    nivel_confianza: 95,
    margen_error: 5,
    tecnica: "estratificado",
    justificacion_tecnica: "Se estratifica por edad del hijo (1-2 años / 3 años / 4 años) porque las necesidades cambian: el de 1 año necesita más cuidado físico, el de 4 más estímulo cognitivo. Cada estrato 80-90 encuestas para que la potencia estadística aguante el análisis bivariado.",
  },
  encuesta: [
    {
      numero: 1,
      texto: "¿Actualmente envías a tu hijo/a a alguna guardería, jardín o cuidador particular?",
      tipo: "opcion_multiple",
      opciones: ["Guardería formal", "Jardín de niños", "Cuidadora particular en casa", "Lo cuida familiar (abuela, tía)", "No, lo cuido yo / mi pareja"],
    },
    {
      numero: 2,
      texto: "¿Cuánto pagas actualmente por mes?",
      tipo: "opcion_multiple",
      opciones: ["No pago (familiar)", "Menos de Bs 800", "Bs 800 a Bs 1.200", "Bs 1.200 a Bs 1.800", "Más de Bs 1.800"],
    },
    {
      numero: 3,
      texto: "**Escenario A:** Guardería 8:00-16:00, en español, una educadora cada 8 niños. ¿Cuánto pagarías por mes?",
      tipo: "escala_numerica",
      opciones: ["Bs 0", "Bs 600", "Bs 1.000", "Bs 1.400", "Bs 1.800", "Bs 2.200+"],
      objetivo_que_ataca: "Establecer DAP base.",
    },
    {
      numero: 4,
      texto: "**Escenario B:** Guardería 7:00-19:00, en español, una educadora cada 8 niños. ¿Cuánto pagarías?",
      tipo: "escala_numerica",
      opciones: ["Bs 0", "Bs 600", "Bs 1.000", "Bs 1.400", "Bs 1.800", "Bs 2.200+"],
      objetivo_que_ataca: "Aislar efecto horario extendido.",
    },
    {
      numero: 5,
      texto: "**Escenario C:** Guardería 8:00-16:00, inmersión bilingüe español-inglés, una educadora cada 6 niños. ¿Cuánto pagarías?",
      tipo: "escala_numerica",
      opciones: ["Bs 0", "Bs 600", "Bs 1.000", "Bs 1.400", "Bs 1.800", "Bs 2.200+"],
      objetivo_que_ataca: "Aislar efecto bilingüe.",
    },
    {
      numero: 6,
      texto: "**Escenario D:** Guardería 7:00-19:00, inmersión bilingüe español-inglés, una educadora cada 6 niños. ¿Cuánto pagarías?",
      tipo: "escala_numerica",
      opciones: ["Bs 0", "Bs 600", "Bs 1.000", "Bs 1.400", "Bs 1.800", "Bs 2.200+"],
      objetivo_que_ataca: "Medir efecto combinado.",
    },
    {
      numero: 7,
      texto: "Si tu hijo asistiera a una guardería bilingüe, ¿qué te haría desconfiar? (selecciona hasta 3)",
      tipo: "opcion_multiple",
      opciones: [
        "Que no sea realmente bilingüe (que solo digan 'hello' y 'goodbye')",
        "Que el niño se confunda con dos idiomas",
        "Que las educadoras no sean nativas",
        "El precio premium sin justificación",
        "Que no se enfoquen suficiente en español",
        "Ninguno, confío en el concepto",
      ],
      objetivo_que_ataca: "Identificar dudas principales.",
    },
    {
      numero: 8,
      texto: "Trabaja: tu pareja y tú",
      tipo: "opcion_multiple",
      opciones: ["Ambos full-time", "Uno full-time, otro medio tiempo", "Soy padre/madre soltero/a y trabajo full-time", "Otra combinación"],
      objetivo_que_ataca: "Cruce para hipótesis 3.",
    },
  ],
  recoleccion: {
    canal: "Mixto: 60% presencial en salidas de jardines de la zona (Pukañawi, Crystian Andersen, San Agustín) y 40% online vía grupo de WhatsApp 'Madres Cala Cala'.",
    duracion_promedio_min: 9,
    incentivo: "Sorteo de un mes gratis de guardería cuando abra la guardería entre todos los que completaron.",
    tasa_respuesta_pct: 54,
  },
  resultados_clave: [
    {
      variable: "DAP escenario base (Q3)",
      hallazgo: "Mediana Bs 1.000. El 47% paga entre Bs 800 y Bs 1.200 en el escenario estándar.",
      interpretacion: "El benchmark real del mercado es Bs 1.000-1.200, no Bs 1.500+ que cobran algunas guarderías premium.",
    },
    {
      variable: "Incremento por horario extendido (Q4 vs Q3)",
      hallazgo: "DAP escenario B = Bs 1.400 mediana. Incremento de Bs 400 (+40%) atribuible al horario.",
      interpretacion: "Hipótesis 1 CONFIRMADA: padres pagan Bs 400 más por el horario 7-19h. Es la mejora con mejor relación costo/valor.",
    },
    {
      variable: "Incremento por bilingüe (Q5 vs Q3)",
      hallazgo: "DAP escenario C = Bs 1.400 mediana. Incremento de Bs 400 (+40%) por bilingüe.",
      interpretacion: "Hipótesis 2 PARCIALMENTE FALSA: el incremento por bilingüe es solo Bs 400, no Bs 600. El mercado valora menos el bilingüe de lo que Verónica creía.",
    },
    {
      variable: "Efecto combinado (Q6 vs Q3)",
      hallazgo: "DAP escenario D = Bs 1.700 mediana. Incremento de Bs 700 (+70%) cuando se combinan ambos atributos.",
      interpretacion: "Combinar horario + bilingüe da Bs 700, MENOS que la suma simple (Bs 400 + Bs 400 = Bs 800). Hay efecto saturación: el padre tope su DAP en Bs 1.700-1.800.",
    },
    {
      variable: "Dudas principales (Q7)",
      hallazgo: "Top 2 dudas: 'Que no sea realmente bilingüe' (52%) y 'El precio premium sin justificación' (38%).",
      interpretacion: "Si Verónica abre con educadoras NO certificadas en inglés, el mercado lo va a percibir y va a destruir la propuesta. La justificación pedagógica del bilingüe es clave para venderlo.",
    },
  ],
  cruce_destacado: {
    variables: ["Modalidad laboral (Q8)", "DAP escenario D (Q6)"],
    hallazgo: "Padres con AMBOS trabajando full-time: DAP mediana D = Bs 1.900. Padres con uno medio tiempo: DAP D = Bs 1.500. Solteros full-time: DAP D = Bs 1.700. Confirma hipótesis 3: cuando ambos trabajan, la combinación vale Bs 400 más.",
  },
  recomendacion: "PROCEDER con guardería full-time + bilingüe REAL, pricing en Bs 1.700-1.800. Estrategia: (1) Comunicar nivel de certificación de educadoras como diferenciador clave (foto, CV, certificados Cambridge visibles en la web). (2) Pricing diferenciado: Bs 1.400 si solo full-time o solo bilingüe; Bs 1.800 combo completo. (3) Targeting primario: hogares con ambos padres full-time (~40% del segmento). (4) Capacidad inicial: 24 niños = Bs 43.200/mes proyectados.",
  conclusion: "Estudio **valida la propuesta pero ajusta precios**. La hipótesis del bilingüe valió Bs 400 vs Bs 600 esperados — Verónica tendrá que sostener el bilingüe con evidencia (certificaciones de educadoras) o el mercado lo va a rechazar como gimmick. El estudio causal le permitió aislar exactamente qué atributo paga el cliente.",
  lecciones: [
    "Estudio CAUSAL bien hecho aísla el efecto de UNA variable a la vez. Cuatro escenarios A/B/C/D variando dos atributos es la forma más simple de hacerlo.",
    "El efecto combinado RARAMENTE es la suma simple. Casi siempre hay saturación del DAP (el cliente tope su disposición a pagar).",
    "Dudas / barreras son tan importantes como deseos. La pregunta 'qué te haría desconfiar' revela el riesgo real de la propuesta.",
    "Cruzar DAP con variable demográfica (modalidad laboral) revela el segmento que tope DAP — ese es el primer cliente a captar.",
    "El bilingüe sin certificaciones reales se vuelve un gimmick percibido. La calidad técnica del producto > la promesa de marketing.",
  ],
  errores_evitados: [
    "No preguntar disposición a pagar directamente — usar escenarios A/B/C/D le sube validez al dato.",
    "No estratificar por edad del hijo — las necesidades de 1 año son distintas a las de 4 años.",
    "No omitir la pregunta de barreras — el 'por qué no' revela el reto operativo (educadoras certificadas).",
    "No fiarse de la suma simple de incrementos: el cliente tiene tope.",
    "No vender bilingüe sin invertir en educadoras realmente capacitadas — el mercado distingue.",
  ],
  tags: ["cuantitativo", "causal", "Cochran", "estratificado", "educacion", "Cochabamba", "n-250"],
};
