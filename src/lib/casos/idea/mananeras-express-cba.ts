import type { CasoIdea } from "../types";

/**
 * Caso 2 — Jugos naturales pre-vendidos por WhatsApp para mañaneros
 * de Cochabamba.
 *
 * **Dificultad intermedia** porque hubo un PIVOT real:
 * el segmento inicial (oficinistas en gimnasios) no compraba a las 6:00
 * porque ya tenían su rutina. El pivot fue "no vendas a los que ya van al
 * gimnasio, vende a los que QUIEREN ir pero no logran". Cambio de canal:
 * de gimnasios a torres residenciales del Norte.
 */

export const casoMananerasExpressCba: CasoIdea = {
  slug: "mananeras-express-cba",
  modulo: "idea",
  titulo: "Mañaneras Express",
  tagline: "Jugos naturales pre-vendidos por WhatsApp para mañaneros de Cochabamba.",
  zona: "Zona Norte (Cala Cala, Tupuraya), Cochabamba",
  rubro: "Alimentación saludable",
  dificultad: "intermedio",
  emoji: "🥤",
  emprendedor: {
    nombre: "Carla Vargas",
    edad: 24,
    rol: "Estudiante de último año de Nutrición en la UMSS. Trabaja medio tiempo en una farmacia. Tiene experiencia preparando jugos terapéuticos para clientes de la farmacia.",
  },
  contexto: [
    "Carla notó que en la farmacia donde trabaja, los ejecutivos de 30-50 años entraban temprano (6:30-7:00) pidiendo Redoxon, Berocca o algún energizante. Ella veía la oportunidad: \"esa gente quiere energía, pero la respuesta correcta es jugo natural, no efervescente\".",
    "Su primer instinto fue vender en gimnasios. Habló con dos gimnasios del Norte y le dijeron que sí podía dejar 20 botellas en la barra cada mañana. Probó 2 semanas. Resultado: vendía 3-4 jugos al día. La gente que va al gimnasio a las 6:00 YA tiene su rutina de proteína, ya tomó algo en casa.",
    "Carla escuchó a uno de sus clientes habituales de la farmacia: \"yo quiero ir al gimnasio pero no me levanto. Si me trajeras un jugo a la puerta a las 6:00, me obligo a salir\". Ahí encontró el segmento real: profesionales que QUIEREN cuidarse pero no tienen disciplina. El jugo en la puerta es el gatillo.",
  ],
  problema: "Profesionales de 30-50 años en zonas residenciales de Cochabamba quieren empezar el día saludable (jugo natural) pero no tienen tiempo de prepararlo ni disciplina para salir a buscarlo.",
  segmento: "Profesionales 30-50 años en torres residenciales de Cala Cala y Tupuraya, NSE B+, que buscan mejorar su salud sin cambiar drásticamente su rutina.",
  lean_canvas: {
    problema: [
      "Salir 6:00 am a buscar jugo natural en cafetería implica vestirse y caminar 15 min.",
      "Jugos envasados de supermercado tienen azúcar añadida y conservantes.",
      "Preparar jugo en casa = comprar fruta + lavar + licuar + lavar todo = 25 min que el ejecutivo no tiene.",
    ],
    segmento: "Profesionales 30-50, viven en torres residenciales del Norte de Cba, ingreso ≥ Bs 8.000, ya intentaron 'estar más sanos' y fracasaron por logística.",
    propuesta_unica: "Tu jugo natural fresco en tu puerta a las 6:00 am, 5 días a la semana. Tú solo decides el menú del lunes y te olvidas.",
    solucion: [
      "Suscripción semanal vía WhatsApp (pago QR domingo en la tarde).",
      "5 jugos distintos lunes-viernes (curados por una nutricionista = Carla).",
      "Entrega 6:00-6:30 am directo en la puerta del depto.",
      "Envase de vidrio reciclable retornable.",
    ],
    canales: [
      "WhatsApp + Instagram (contenido educativo sobre cada jugo).",
      "Referidos: cliente que trae a un vecino del mismo edificio = 1 jugo gratis para ambos.",
      "Alianza con 2 consultorios de nutrición que recomiendan el servicio.",
    ],
    flujo_ingresos: [
      "Suscripción semanal Bs 90 (5 jugos × Bs 18).",
      "Suscripción quincenal Bs 170 (descuento 5%).",
      "Jugo suelto Bs 22 (penaliza la suelta para empujar la suscripción).",
    ],
    estructura_costos: [
      "Frutas + insumos por jugo: Bs 7,50.",
      "Envase de vidrio amortizado: Bs 1,20 (10 ciclos de uso).",
      "Movilidad (moto del hermano): Bs 1,80/jugo.",
      "Costo variable total: Bs 10,50. Margen contribución: Bs 7,50 (42%).",
      "Costos fijos: gas + electricidad extra + plataforma de cobros: Bs 350/mes.",
    ],
    metricas_clave: [
      "Suscripciones activas a fin de mes (meta inicial: 25).",
      "Churn semanal (% de suscriptores que NO renuevan).",
      "Costo de adquisición por cliente (Bs gastados / clientes nuevos).",
      "Devolución de envases (>95% = sostenible; <85% = revisar depósito).",
    ],
    ventaja_competitiva: "Carla es nutricionista en formación: cada jugo tiene una ficha técnica con beneficios. Una cafetería puede vender jugo, pero no puede contar POR QUÉ ese jugo te ayuda hoy. Esa diferencia se paga.",
  },
  propuesta_valor: {
    trabajos_cliente: [
      "Empezar el día con algo saludable sin esfuerzo.",
      "Sentirse 'en control' de su salud sin entrar a una dieta estricta.",
      "Mantener una rutina semanal sin tener que pensarla cada mañana.",
    ],
    dolores: [
      "Levantarse, vestirse y salir a buscar jugo a las 6:00 = pereza.",
      "Comprar fruta el domingo y que se pudra la mitad por falta de tiempo.",
      "Jugos comerciales con 25g de azúcar añadida son 'el menos malo' pero igual no es sano.",
      "Sentir que 'siempre empiezo el lunes' y nunca arrancas.",
    ],
    ganancias: [
      "Sentir que el día arranca bien.",
      "No tener que decidir qué tomar (Carla ya decidió).",
      "Energía sostenida (no el bajón post-azúcar).",
      "Status leve: 'yo tengo mi suscripción de jugos'.",
    ],
    productos: [
      "Suscripción semanal de 5 jugos con menú curado.",
      "Ficha técnica por jugo (vitaminas, calorías, momento ideal).",
      "Envase de vidrio (no plástico).",
    ],
    aliviadores: [
      "Llega a la puerta = elimina el esfuerzo de salir.",
      "Pre-cobrado el domingo = elimina la decisión cada día.",
      "Sin azúcar añadida = elimina la culpa de los jugos comerciales.",
      "Menú variado curado = elimina la pregunta '¿qué tomo hoy?'.",
    ],
    creadores: [
      "Combinaciones diseñadas por nutricionista (no son recetas al azar).",
      "Material educativo en Instagram que el cliente puede compartir.",
      "Sentido de continuidad: el menú del lunes anticipa la semana.",
    ],
  },
  validacion: {
    hipotesis: [
      {
        hipotesis: "Los gimnasios del Norte son el punto de venta correcto.",
        experimento: "Dejar 20 botellas/día en 2 gimnasios durante 2 semanas. Tracking por barcode.",
        metrica: "Vender ≥10 botellas/día por gimnasio.",
        resultado_esperado: "Si vende <5/día, el segmento NO es el correcto.",
      },
      {
        hipotesis: "Profesionales en torres residenciales pagarían Bs 90/semana por entrega en la puerta.",
        experimento: "Volantes en 3 torres + WhatsApp inicial con 30 contactos calientes. Ofrecer prueba de 3 días gratis con compromiso de suscribirse si gusta.",
        metrica: "≥15 suscripciones activas al final del mes 1.",
        resultado_esperado: "Si convierte <8, el precio o la propuesta están mal.",
      },
    ],
    resultado: "Hipótesis 1 FALSA: gimnasios vendieron 3-4/día. Hipótesis 2 VERDADERA: 22 suscripciones activas al mes 1. Aprendizaje clave: el cliente correcto NO es el que ya tiene hábito saludable; es el que QUIERE pero no logra. Carla pivotó: 0 esfuerzo en gimnasios, 100% en torres residenciales + referidos.",
  },
  scorecard: {
    deseabilidad: 4,
    factibilidad: 4,
    viabilidad: 3,
    nota: "Deseabilidad confirmada tras el pivot. Factibilidad alta (Carla tiene conocimiento técnico). Viabilidad media: el margen 42% es decente pero el techo de crecimiento depende de la moto del hermano (logística). Para crecer arriba de 50 suscripciones necesita motorizado contratado.",
  },
  conclusion: "Idea **viable con pivot**. El primer canal (gimnasios) fracasó por mal entendimiento del segmento. El pivot a 'torres residenciales con suscripción' funcionó. Lección: el cliente que YA hace ejercicio no es el que paga premium por jugo; es el que QUIERE hacerlo pero no logra. Negocio sostenible hasta ~60 suscripciones con margen Bs 6.500-8.000/mes.",
  lecciones: [
    "Vender en el punto donde está el cliente NO es lo mismo que vender en el punto donde el cliente lo necesita.",
    "Suscripción + pre-pago elimina la fricción diaria y aumenta la retención.",
    "Un experto detrás del producto (Carla = nutricionista) justifica precio 20-30% por encima de la competencia.",
    "Cuando una hipótesis falla, el aprendizaje real está en por qué el segmento original no compra.",
    "Envase de vidrio retornable es marketing ambiental + lock-in operacional.",
  ],
  errores_evitados: [
    "No insistir 6 meses en gimnasios solo porque el plan original decía 'gimnasios'.",
    "No intentar vender suelto a cualquiera — el churn destruye el negocio.",
    "No abrir un local físico para 'parecer más profesional' — destruye el margen.",
    "No vender jugos con azúcar añadida para 'aumentar palatabilidad' — pierde la diferenciación.",
    "No copiar precios de cafetería (Bs 12) — eso es café/jugo industrial, no es lo mismo.",
  ],
  tags: ["alimentacion", "saludable", "suscripcion", "pivot", "B2C", "Cochabamba", "WhatsApp"],
};
