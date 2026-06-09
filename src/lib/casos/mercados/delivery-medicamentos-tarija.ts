import type { CasoMercados } from "../types";

/**
 * Caso 5 — Delivery de medicamentos para adultos mayores en Tarija.
 *
 * **Dificultad intermedia.** Estudio descriptivo a una población
 * difícil (adultos mayores, baja respuesta digital). Útil para
 * mostrar cómo se ajusta la metodología cuando el segmento tiene
 * fricciones de comunicación: encuestadores presenciales + apoyo
 * familiar para validar la respuesta.
 */

export const casoDeliveryMedicamentosTja: CasoMercados = {
  slug: "delivery-medicamentos-adultos-tarija",
  modulo: "mercados",
  titulo: "Delivery de medicamentos para adultos mayores",
  tagline: "Estudio descriptivo a 200 adultos mayores en Tarija para validar servicio de delivery mensual con receta digitalizada.",
  zona: "Tarija (zona centro y barrios El Tejar / La Pampa)",
  rubro: "Salud / servicios para adulto mayor",
  dificultad: "intermedio",
  emoji: "💊",
  emprendedor: {
    nombre: "Joaquín Romero",
    edad: 29,
    rol: "Bioquímico-farmacéutico, dueño minoritario de una farmacia familiar en el centro de Tarija. Vio durante 3 años cómo los abuelos llegaban caminando 15-30 minutos en pleno sol para recoger sus mismos medicamentos del mes anterior. Quiere convertir ese patrón en suscripción con entrega a domicilio.",
  },
  contexto: [
    "Joaquín notaba un patrón en su farmacia: los mismos adultos mayores venían cada 28-35 días por los mismos medicamentos (hipertensión, diabetes, colesterol). Recetas crónicas. Pero el viaje a la farmacia era un dolor: 15-30 min caminando, riesgo de caída, cargar bolsas pesadas, esperar turno.",
    "Su hipótesis: si la farmacia ENTREGA en casa con un margen pequeño extra (Bs 5-10), el adulto mayor o su familia paga gustoso. Pero quería validar antes de invertir en un motorizado contratado, sistema de pedidos por WhatsApp y digitalización de recetas crónicas.",
    "El reto metodológico era el segmento: adultos mayores 65+ no responden encuestas online, muchos no tienen smartphone, algunos ya tienen deterioro cognitivo. Decidió encuesta presencial en sala de espera de farmacia + apoyo familiar (cuando el adulto venía acompañado, también encuestaba al acompañante para triangular).",
  ],
  problema: "Joaquín no sabe si los adultos mayores tarijeños aceptarían pagar Bs 8-10 extra por delivery mensual de sus medicamentos crónicos, ni qué barreras de confianza tendrían.",
  segmento: "Adultos mayores de 65+ años en Tarija con al menos UN medicamento crónico, y/o sus hijos/cuidadores que compran por ellos.",
  diseno: {
    pregunta: "¿Pagarían los adultos mayores tarijeños (o sus cuidadores) un sobrecargo de Bs 8-10 por delivery mensual de medicamentos crónicos, y qué barreras de confianza existen?",
    tipo: "descriptivo",
    enfoque: "cuantitativo",
    objetivo_general: "Cuantificar la demanda y el sobrecargo aceptado por un servicio de delivery mensual de medicamentos crónicos en Tarija.",
    objetivos_especificos: [
      "Estimar el porcentaje de adultos mayores con receta crónica activa.",
      "Medir frecuencia y dificultad actual percibida del trámite (ir a farmacia).",
      "Determinar disposición a pagar sobrecargo por delivery.",
      "Identificar quién es el DECISOR real (adulto mayor o cuidador).",
      "Detectar barreras de confianza (¿llegarán los remedios correctos? ¿el repartidor es confiable?).",
    ],
    hipotesis: [
      "Al menos el 70% de los adultos mayores tiene al menos UN medicamento crónico recurrente.",
      "El 60% pagaría hasta Bs 10 de sobrecargo por delivery mensual.",
      "El decisor en al menos 50% de los casos NO es el adulto mayor sino un hijo o cuidador.",
    ],
  },
  muestreo: {
    poblacion: "Adultos mayores 65+ en Tarija (zona urbana). Según INE 2022 e indicadores SEDES, ~14.000 personas.",
    N_poblacion: 14000,
    n_muestra: 200,
    formula_usada: "Cochran ajustado por población finita. Para N=14.000 con IC 95% y error 7%, n≈195, redondeado a 200 por estratos.",
    nivel_confianza: 95,
    margen_error: 7,
    tecnica: "sistematico",
    justificacion_tecnica: "Se aplica muestreo sistemático en sala de espera de 3 farmacias (la propia + 2 partner) y en 2 centros de salud SEDES. Cada k=3 pacientes 65+ que cruza la puerta. Permite captar variedad económica (la farmacia del centro recibe NSE B, las de barrio NSE C y D) sin sesgar a la base de clientes de Joaquín.",
  },
  encuesta: [
    {
      numero: 1,
      texto: "¿Toma usted (o la persona que cuida) algún medicamento todos los días por más de 3 meses?",
      tipo: "cerrada_si_no",
      objetivo_que_ataca: "Identificar perfil de uso crónico.",
    },
    {
      numero: 2,
      texto: "Si SÍ, ¿cuántos medicamentos diferentes toma por mes?",
      tipo: "opcion_multiple",
      opciones: ["1", "2", "3", "4-5", "Más de 5"],
    },
    {
      numero: 3,
      texto: "¿Cómo se traslada habitualmente a la farmacia?",
      tipo: "opcion_multiple",
      opciones: ["Camino", "En taxi", "Lo lleva un familiar", "En micro o transporte público", "Otro"],
    },
    {
      numero: 4,
      texto: "¿Cuánto tiempo le toma todo el trámite (ida, esperar, regresar)?",
      tipo: "opcion_multiple",
      opciones: ["Menos de 30 min", "30-60 min", "1-2 horas", "Más de 2 horas"],
    },
    {
      numero: 5,
      texto: "Si la farmacia le entregara sus medicamentos EN CASA cada mes, ¿cuánto pagaría EXTRA por ese servicio?",
      tipo: "opcion_multiple",
      opciones: ["Bs 0 (solo si es gratis)", "Bs 1-5", "Bs 6-10", "Bs 11-15", "Más de Bs 15"],
      objetivo_que_ataca: "Disposición a pagar sobrecargo.",
    },
    {
      numero: 6,
      texto: "Si ofrecemos el servicio, ¿qué le daría MÁS confianza? (selecciona hasta 2)",
      tipo: "opcion_multiple",
      opciones: [
        "Que sea un repartidor identificado con uniforme y carnet de la farmacia",
        "Que pueda devolver si algo está mal",
        "Que el farmacéutico me llame antes de entregar para confirmar",
        "Que sea la misma farmacia donde ya compro",
        "Recomendación del médico tratante",
        "Aprobación de mi familia",
      ],
      objetivo_que_ataca: "Identificar atributos de confianza.",
    },
    {
      numero: 7,
      texto: "Si SÍ usaría el servicio, ¿quién decidiría contratarlo?",
      tipo: "opcion_multiple",
      opciones: ["Yo solo/sola", "Yo con mi familia", "Mi hijo/a o cuidador decide", "Mi médico me recomienda y por eso lo uso"],
      objetivo_que_ataca: "Identificar al DECISOR real.",
    },
    {
      numero: 8,
      texto: "Rango de edad.",
      tipo: "opcion_multiple",
      opciones: ["65-70", "71-78", "79-85", "Más de 85"],
    },
    {
      numero: 9,
      texto: "¿Vive solo/sola o acompañado/a?",
      tipo: "opcion_multiple",
      opciones: ["Solo/a", "Con pareja", "Con hijos/familia", "Con cuidadora contratada"],
    },
  ],
  recoleccion: {
    canal: "Encuestadoras entrenadas en sala de espera de 3 farmacias y 2 centros SEDES durante 4 semanas. Cuando el adulto venía acompañado, se encuestaba TAMBIÉN al acompañante con cuestionario reducido para validar respuestas y captar al decisor.",
    duracion_promedio_min: 11,
    incentivo: "Una caja de pastilleros gratis (semanal x 4 unidades) para el primer pedido de delivery.",
    tasa_respuesta_pct: 78,
  },
  resultados_clave: [
    {
      variable: "Uso de medicamento crónico (Q1+Q2)",
      hallazgo: "78% de los adultos mayores toma al menos 1 medicamento crónico. El 41% toma 3 o más.",
      interpretacion: "Hipótesis 1 CONFIRMADA. Más de tres cuartos del segmento son cliente potencial mensual recurrente.",
    },
    {
      variable: "Tiempo invertido en trámite (Q4)",
      hallazgo: "El 53% invierte 1-2 horas por viaje. El 18% más de 2 horas.",
      interpretacion: "Dolor real cuantificado: el adulto mayor pierde 1-2 horas + esfuerzo físico CADA MES. Esto justifica el sobrecargo emocional.",
    },
    {
      variable: "DAP por delivery (Q5)",
      hallazgo: "El 64% pagaría Bs 6-10. El 12% pagaría Bs 11-15. Sumando, 76% paga ≥Bs 6.",
      interpretacion: "Hipótesis 2 CONFIRMADA. Bs 8 es el sweet spot: por debajo se pierde margen sin captar más mercado; por arriba se cae el 24% del top.",
    },
    {
      variable: "Decisor real (Q7)",
      hallazgo: "Adulto mayor decide solo: 31%. Con familia: 28%. Hijo/cuidador decide: 34%. Médico recomienda: 7%.",
      interpretacion: "Hipótesis 3 CONFIRMADA: el 62% de las decisiones involucra a un hijo/cuidador. La comunicación NO debe ir solo al adulto mayor — también al hijo (40-55 años, usuario de WhatsApp/Facebook).",
    },
    {
      variable: "Atributos de confianza (Q6)",
      hallazgo: "Top 2: 'Que sea la misma farmacia donde ya compro' (66%) y 'Repartidor con uniforme/carnet' (54%).",
      interpretacion: "El branding de la farmacia conocida es el activo más fuerte. El servicio NO debe ser una marca nueva ('Pharma Express'); debe ser una extensión visible de la farmacia ya conocida.",
    },
    {
      variable: "Tasa de respuesta del decisor familiar",
      hallazgo: "De los 47 acompañantes encuestados, 89% confirmó que SÍ contrataría delivery para su padre/madre y pagaría hasta Bs 12.",
      interpretacion: "Cuando el decisor es el hijo (no el abuelo), la DAP sube de Bs 8 a Bs 12. El hijo paga por aliviar su propia carga emocional y logística.",
    },
  ],
  cruce_destacado: {
    variables: ["Edad (Q8)", "Decisor (Q7)"],
    hallazgo: "Adultos 65-70: 58% decide solo. Adultos 79-85: 21% decide solo, 56% es el hijo. Cuanto MAYOR el adulto, MÁS pesa la decisión del hijo. La transición ocurre alrededor de los 75 años.",
  },
  recomendacion: "PROCEDER con servicio de suscripción mensual de delivery: (1) Precio del servicio Bs 10 (sweet spot probado, captura el 76%). (2) Comunicación DUAL: en farmacia (poster + recomendación verbal al adulto mayor) Y en WhatsApp/Facebook (campaña dirigida a hijos 40-55). (3) Servicio bajo marca de la farmacia conocida (no marca independiente). (4) Repartidor uniformado con carnet visible. (5) Llamada de confirmación pre-entrega (atributo #3 valorado). Demanda potencial: 14.000 × 78% crónicos × 64% DAP Bs 6+ = ~7.000 clientes potenciales en Tarija urbana. Punto de equilibrio a 180 suscripciones mensuales.",
  conclusion: "Estudio **valida fuerte con un giro estratégico clave**: el decisor no es solo el adulto mayor, es la dupla adulto-hijo. La comunicación debe ser dual. El insight de que el HIJO paga más (Bs 12 vs Bs 8) abre una oportunidad de segmentación: paquete Premium para hijos que quieren cobertura extra (llamada de control, pastillero semanal organizado). El estudio salvó a Joaquín de lanzar una marca nueva 'pharma-tech' que el segmento habría rechazado.",
  lecciones: [
    "Para segmentos con fricción de comunicación (adultos mayores), encuestadoras presenciales + apoyo de acompañantes es válido y triangulan respuestas.",
    "Identificar AL DECISOR es a veces más importante que identificar al USUARIO. Aquí 62% involucra hijo, pero la encuesta inicial iba solo al adulto.",
    "Cruzar edad con decisor reveló la transición demográfica (75 años): a partir de ahí, la decisión es del hijo. Cambia la estrategia de comunicación.",
    "Aumentar el margen de error de 5% a 7% reduce n de ~280 a ~200 — válido cuando los recursos son limitados y el estudio es para tesis de pregrado.",
    "Los atributos de confianza (no de precio) son la barrera real en servicios de salud para adultos mayores: marca conocida + repartidor identificado vence a cualquier oferta agresiva.",
  ],
  errores_evitados: [
    "No lanzar marca independiente 'Pharma Express' — perdería el valor de la farmacia ya conocida.",
    "No dirigir la comunicación solo al adulto mayor — el 62% involucra hijo decisor.",
    "No omitir la encuesta al acompañante — los hijos pagaban Bs 12 vs Bs 8 del adulto.",
    "No subir el sobrecargo a Bs 15 'porque suena más profesional' — se cae el 24% del top.",
    "No confiar solo en muestreo aleatorio cuando el segmento tiene tasa de respuesta digital ~0%.",
  ],
  tags: ["cuantitativo", "descriptivo", "sistematico", "salud", "adulto-mayor", "Tarija", "n-200", "Cochran"],
};
