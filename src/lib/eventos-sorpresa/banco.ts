/**
 * Sprint 4 — Banco de eventos sorpresa.
 *
 * 15 eventos verosímiles para Bolivia (5 por módulo) con severidad mixta y
 * 3 opciones de decisión cada uno. La IA evalúa la opción elegida, no
 * decidimos nosotros qué es correcto: el alumno elige y el tutor responde.
 *
 * Copy con tuteo neutro boliviano (sin voseo argentino).
 */

import type {
  EventoSorpresa,
  ModuloEvento,
  TurnoHistorial,
} from "@/types/evento-sorpresa";

// ──────────────────────────────────────────────────────────────────────────
// IDEA — Validación inicial, defensa de propuesta, primeras tracciones.
// ──────────────────────────────────────────────────────────────────────────

const EVENTOS_IDEA: EventoSorpresa[] = [
  {
    id: "idea-01",
    modulo: "idea",
    severidad: "media",
    titulo: "Tu mejor amigo te copia la idea",
    descripcion:
      "Descubres por Instagram que tu mejor amigo lanzó un emprendimiento prácticamente idéntico al tuyo, dos semanas antes de tu lanzamiento previsto. Conoce a tus contactos, tu propuesta de valor y tus precios tentativos.",
    opciones: [
      {
        id: "idea-01-a",
        texto: "Lo confronto en persona y le exijo que pare o cambie el rumbo.",
        costo_emocional:
          "Pierdes una amistad de años y la conversación puede terminar muy mal.",
        riesgo:
          "Quedas como conflictivo en tu red común y no hay nada legal que te respalde.",
      },
      {
        id: "idea-01-b",
        texto: "Acelero mi lanzamiento esta misma semana, sin perfeccionar nada.",
        costo_emocional:
          "Trabajas 14 horas al día y sacrificas el descanso planeado.",
        riesgo:
          "Sales con un producto crudo y la primera impresión del mercado puede ser mediocre.",
      },
      {
        id: "idea-01-c",
        texto: "Pivoteo hacia un nicho más específico donde él no compite.",
        costo_emocional:
          "Aceptas que parte de tu trabajo previo de mercado ya no aplica.",
        riesgo:
          "El nicho nuevo puede ser demasiado pequeño para sostener el negocio.",
      },
    ],
  },
  {
    id: "idea-02",
    modulo: "idea",
    severidad: "critica",
    titulo: "Aparece un competidor con USD 50.000 de capital",
    descripcion:
      "Un grupo de inversionistas paceños lanza un competidor con USD 50.000 de capital inicial, oficinas físicas y campaña de marketing pagada. Tu presupuesto total es Bs 6.000 y operas desde tu cuarto.",
    opciones: [
      {
        id: "idea-02-a",
        texto: "Busco un inversionista ángel para nivelar la competencia.",
        costo_emocional:
          "Tienes que ceder parte del control del negocio que recién empieza.",
        riesgo:
          "Levantar capital sin tracción demostrable suele tomar 3-6 meses y puede fracasar.",
      },
      {
        id: "idea-02-b",
        texto: "Me concentro en un segmento que ellos ignoran por ser pequeño.",
        costo_emocional:
          "Asumes que serás siempre un negocio de nicho, no un líder de mercado.",
        riesgo:
          "Si el nicho crece, ellos llegarán y tendrán recursos para desplazarte.",
      },
      {
        id: "idea-02-c",
        texto: "Replanteo el negocio como complemento, no como competencia directa.",
        costo_emocional:
          "Renuncias a la visión original y aceptas un rol secundario.",
        riesgo:
          "Tu identidad de marca se vuelve dependiente del competidor que ahora te conviene.",
      },
    ],
  },
  {
    id: "idea-03",
    modulo: "idea",
    severidad: "leve",
    titulo: "Una influencer hace un post elogiando tu producto",
    descripcion:
      "Una influencer cochabambina con 80.000 seguidores publica una historia genuina recomendando tu producto. En 24 horas tu Instagram pasa de 200 a 1.800 seguidores y empiezan a llover pedidos.",
    opciones: [
      {
        id: "idea-03-a",
        texto: "Acepto cada pedido aunque no tenga stock suficiente.",
        costo_emocional:
          "Vives con ansiedad de no poder cumplir y debes pedir paciencia constantemente.",
        riesgo:
          "Reseñas negativas por demora arruinan el impulso obtenido.",
      },
      {
        id: "idea-03-b",
        texto: "Pauso pedidos nuevos hasta tener inventario para cumplir bien.",
        costo_emocional:
          "Sientes que dejas pasar la mejor oportunidad de visibilidad del año.",
        riesgo:
          "El interés se enfría rápido y cuando reabras puede que ya nadie esté pendiente.",
      },
      {
        id: "idea-03-c",
        texto: "Contacto a la influencer para coordinar una colaboración paga.",
        costo_emocional:
          "Comprometes presupuesto que tenías reservado para insumos.",
        riesgo:
          "Una segunda mención forzada se ve menos auténtica que la primera espontánea.",
      },
    ],
  },
  {
    id: "idea-04",
    modulo: "idea",
    severidad: "media",
    titulo: "El precio de tu insumo clave sube 30%",
    descripcion:
      "Tu proveedor de El Alto avisa que el insumo principal de tu producto subió 30% por problemas de importación desde Chile. Tu margen actual era del 35% sobre costo.",
    opciones: [
      {
        id: "idea-04-a",
        texto: "Subo el precio final al cliente para mantener mi margen.",
        costo_emocional:
          "Temes perder a tus primeros clientes que llegaron por el precio inicial.",
        riesgo:
          "Tu propuesta de valor ya no es la misma si el precio sube más del 15%.",
      },
      {
        id: "idea-04-b",
        texto: "Absorbo el costo y reduzco mi margen del 35% al 8% por ahora.",
        costo_emocional:
          "Tu compensación personal queda en cero durante meses.",
        riesgo:
          "Si la situación dura más de lo esperado, te quedas sin caja para reponer stock.",
      },
      {
        id: "idea-04-c",
        texto: "Reformulo el producto con un insumo nacional sustituto.",
        costo_emocional:
          "Aceptas que la calidad puede cambiar y debes hacer pruebas nuevas.",
        riesgo:
          "Los clientes que valoraban el insumo original notan la diferencia y se alejan.",
      },
    ],
  },
  {
    id: "idea-05",
    modulo: "idea",
    severidad: "leve",
    titulo: "Te llaman de un canal de TV local para entrevista",
    descripcion:
      "Una productora de un canal local te llama para una entrevista de 4 minutos en su programa matutino. La emisión es en 5 días y no quieren cobrar, pero el horario es a las 6:30 AM y nunca has dado una entrevista.",
    opciones: [
      {
        id: "idea-05-a",
        texto: "Acepto sin prepararme: la espontaneidad transmite frescura.",
        costo_emocional:
          "Tienes que aceptar que puedes equivocarte en vivo frente a miles.",
        riesgo:
          "Quedar mal en TV deja una marca pública difícil de borrar.",
      },
      {
        id: "idea-05-b",
        texto: "Acepto y dedico 3 días a preparar un guion y ensayar con un amigo.",
        costo_emocional:
          "Sacrificas casi una semana de operación del negocio para prepararte.",
        riesgo:
          "Si te ves muy guionado pierdes la conexión natural con la audiencia.",
      },
      {
        id: "idea-05-c",
        texto: "Rechazo y pido cambiar a una entrevista grabada con más tiempo.",
        costo_emocional:
          "Pierdes una oportunidad gratuita que no se repite seguido.",
        riesgo:
          "La productora puede ofender y no contactarte nunca más.",
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// MARKETING — Costo de adquisición, viralidad negativa, canales y eventos.
// ──────────────────────────────────────────────────────────────────────────

const EVENTOS_MARKETING: EventoSorpresa[] = [
  {
    id: "mkt-01",
    modulo: "marketing",
    severidad: "media",
    titulo: "Meta sube precios de Facebook Ads 25% mes que viene",
    descripcion:
      "Meta anuncia que el CPM en Bolivia subirá 25% el próximo mes por cambios de política regional. Tu plan estaba calculado con el CPM viejo y dependes 70% de Facebook Ads para vender.",
    opciones: [
      {
        id: "mkt-01-a",
        texto: "Subo el presupuesto mensual 25% para mantener el alcance actual.",
        costo_emocional:
          "Tomas plata de otras partidas como inventario o sueldo personal.",
        riesgo:
          "Si las ventas no compensan, el ROI mensual baja a números rojos.",
      },
      {
        id: "mkt-01-b",
        texto: "Mantengo el presupuesto y acepto perder 25% de alcance.",
        costo_emocional:
          "Asumes que el crecimiento se desacelera justo cuando tomabas vuelo.",
        riesgo:
          "Cuando la competencia mantiene su pauta, te superan en visibilidad.",
      },
      {
        id: "mkt-01-c",
        texto: "Diversifico 40% del presupuesto a TikTok Ads y email marketing.",
        costo_emocional:
          "Aprendes plataformas nuevas en tiempo récord, restando energía a lo que ya funciona.",
        riesgo:
          "La curva de aprendizaje en TikTok Ads suele costar 2-3 meses de ineficiencia.",
      },
    ],
  },
  {
    id: "mkt-02",
    modulo: "marketing",
    severidad: "critica",
    titulo: "Un cliente molesto publica review negativa viral",
    descripcion:
      "Un cliente insatisfecho publica en TikTok un video de 30 segundos quejándose de tu producto. Tiene 5.000 vistas en 8 horas y los comentarios son hostiles. El cliente exagera detalles pero parte de la queja es legítima.",
    opciones: [
      {
        id: "mkt-02-a",
        texto: "Respondo público con un video pidiendo disculpas y ofreciendo solución.",
        costo_emocional:
          "Te expones a más comentarios negativos y a un escrutinio mayor.",
        riesgo:
          "Si la respuesta se interpreta como excusa o defensiva, el problema escala.",
      },
      {
        id: "mkt-02-b",
        texto: "Contacto al cliente en privado y le ofrezco reembolso a cambio de bajar el video.",
        costo_emocional:
          "Sientes que estás comprando silencio en vez de mejorar.",
        riesgo:
          "Si se entera la audiencia que pagaste por silenciar, el daño es 10 veces peor.",
      },
      {
        id: "mkt-02-c",
        texto: "Ignoro el video y espero a que pierda relevancia en 2-3 días.",
        costo_emocional:
          "Pasas días pendiente del crecimiento del video sin hacer nada.",
        riesgo:
          "Si el video sigue creciendo, el silencio se interpreta como soberbia o culpa.",
      },
    ],
  },
  {
    id: "mkt-03",
    modulo: "marketing",
    severidad: "media",
    titulo: "Instagram baja tu alcance orgánico a 1% por algoritmo",
    descripcion:
      "El algoritmo de Instagram cambió y tu alcance orgánico bajó del 8% al 1% en una semana. Antes llegabas a 4.000 personas por post; ahora apenas a 500. Tus 12.000 seguidores eran tu canal principal.",
    opciones: [
      {
        id: "mkt-03-a",
        texto: "Cambio el formato de contenido a Reels exclusivamente.",
        costo_emocional:
          "Reformulas toda tu producción de contenido y aprendes edición de video.",
        riesgo:
          "Reels exige cantidad y calidad sostenidas; si flaqueas, el alcance vuelve a caer.",
      },
      {
        id: "mkt-03-b",
        texto: "Empiezo a pautar Bs 1.500 mensuales en Instagram para recuperar alcance.",
        costo_emocional:
          "Comprometes presupuesto sin saber si el algoritmo seguirá cambiando.",
        riesgo:
          "Volverte dependiente del pago en una sola red es la trampa que hizo caer a muchos negocios.",
      },
      {
        id: "mkt-03-c",
        texto: "Construyo lista de WhatsApp Business con mis seguidores actuales.",
        costo_emocional:
          "Es trabajo manual de invitar uno por uno durante semanas.",
        riesgo:
          "Convertir seguidores en suscriptores activos suele tener tasa de conversión menor al 5%.",
      },
    ],
  },
  {
    id: "mkt-04",
    modulo: "marketing",
    severidad: "leve",
    titulo: "Te invitan a un mercado emergente en Sucre",
    descripcion:
      "Una organización de emprendedores te invita a un mercado emergente de 10 días en Sucre durante una feria académica. El stand cuesta Bs 800, el viaje y estadía son Bs 1.500 y debes cerrar tu local 10 días.",
    opciones: [
      {
        id: "mkt-04-a",
        texto: "Voy y aprovecho para abrir mercado nuevo fuera de Cochabamba.",
        costo_emocional:
          "Cierras tu local actual y pierdes ventas de clientes recurrentes.",
        riesgo:
          "Vender en una ciudad nueva sin red previa puede dejarte por debajo del punto de equilibrio.",
      },
      {
        id: "mkt-04-b",
        texto: "Mando a un colaborador con producto consignado y me quedo operando.",
        costo_emocional:
          "Confías mucha plata y mucha responsabilidad en alguien sin experiencia previa.",
        riesgo:
          "Si el colaborador no comunica bien la marca, la primera impresión queda mal.",
      },
      {
        id: "mkt-04-c",
        texto: "Rechazo y prefiero invertir esos Bs 2.300 en pauta digital local.",
        costo_emocional:
          "Sientes que dejas pasar una oportunidad de expansión física.",
        riesgo:
          "La pauta digital sin tienda física en Sucre puede no convertir como un stand presencial.",
      },
    ],
  },
  {
    id: "mkt-05",
    modulo: "marketing",
    severidad: "critica",
    titulo: "El CPL subió de Bs 8 a Bs 22 sin cambio en pauta",
    descripcion:
      "Revisas las métricas y el costo por lead pasó de Bs 8 a Bs 22 en 3 semanas, sin que hayas tocado la pauta. Las conversiones de leads a venta también bajaron del 18% al 9%. Tu modelo financiero asumía Bs 10 de CPL.",
    opciones: [
      {
        id: "mkt-05-a",
        texto: "Pauso toda la pauta y diagnostico qué cambió en creatividad o segmentación.",
        costo_emocional:
          "Acepto una caída fuerte en ventas durante el período de diagnóstico.",
        riesgo:
          "Si el problema es del mercado y no de tu pauta, perdiste tiempo y ventas.",
      },
      {
        id: "mkt-05-b",
        texto: "Cambio toda la creatividad y el copy a una versión nueva esta semana.",
        costo_emocional:
          "Renuncias a la pauta que llevabas perfeccionando 4 meses.",
        riesgo:
          "Una creatividad nueva puede tardar 7-10 días en estabilizarse y empeorar antes de mejorar.",
      },
      {
        id: "mkt-05-c",
        texto: "Mantengo la pauta pero reduzco el presupuesto a la mitad mientras pruebo.",
        costo_emocional:
          "Aceptas que el negocio crece más lento durante el experimento.",
        riesgo:
          "Reducir el presupuesto puede empeorar la métrica si el algoritmo necesita más datos.",
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// ESTRATEGIA — Macroeconomía, regulación, alianzas, dilemas de control.
// ──────────────────────────────────────────────────────────────────────────

const EVENTOS_ESTRATEGIA: EventoSorpresa[] = [
  {
    id: "est-01",
    modulo: "estrategia",
    severidad: "leve",
    titulo: "El gobierno anuncia subvención del 30% para tu rubro",
    descripcion:
      "El gobierno boliviano anuncia una subvención del 30% sobre maquinaria importada para tu rubro. El trámite toma 4 meses y requiere documentación contable de los últimos 2 años. Cumples 18 meses de operación.",
    opciones: [
      {
        id: "est-01-a",
        texto: "Aplico al beneficio aunque el trámite tome 4 meses y exija contratar contador.",
        costo_emocional:
          "Pasas semanas en colas y oficinas públicas en vez de operando el negocio.",
        riesgo:
          "El beneficio puede ser revocado o demorado más allá de lo prometido.",
      },
      {
        id: "est-01-b",
        texto: "Compro la maquinaria ahora sin esperar el trámite porque la necesito ya.",
        costo_emocional:
          "Pagas 30% más de lo que podrías haber pagado con paciencia.",
        riesgo:
          "Si la maquinaria se cotiza alta justo ahora, la ventaja de tiempo no compensa el sobrecosto.",
      },
      {
        id: "est-01-c",
        texto: "Espero 4 meses, aplico al beneficio y opero con maquinaria prestada.",
        costo_emocional:
          "Dependes de la buena voluntad de quien te presta y aceptas calidad menor.",
        riesgo:
          "Cuatro meses con maquinaria limitada puede frenar tu crecimiento más de lo que ahorras.",
      },
    ],
  },
  {
    id: "est-02",
    modulo: "estrategia",
    severidad: "critica",
    titulo: "Tu proveedor único cierra sin avisar",
    descripcion:
      "Tu proveedor único de un componente crítico cierra operaciones por problemas familiares, sin avisar. Tienes stock para 3 semanas. Hay alternativas en La Paz (más caras, plazos largos) o importar desde Perú (más complicado).",
    opciones: [
      {
        id: "est-02-a",
        texto: "Cierro pedidos durante 2 semanas mientras consigo nuevo proveedor estable.",
        costo_emocional:
          "Devuelves dinero a clientes y enfrentas su frustración personalmente.",
        riesgo:
          "Dos semanas sin operar puede hacer que clientes recurrentes te reemplacen y no vuelvan.",
      },
      {
        id: "est-02-b",
        texto: "Compro a 3 proveedores distintos en paralelo aunque cada uno sea más caro.",
        costo_emocional:
          "Tu margen cae 20% y la operación se vuelve más caótica.",
        riesgo:
          "Coordinar 3 proveedores nuevos exige tiempo que no tienes ahora mismo.",
      },
      {
        id: "est-02-c",
        texto: "Importo desde Perú aunque tome 30 días el primer envío.",
        costo_emocional:
          "Operas 30 días con stock cada vez más bajo y la incertidumbre te quita el sueño.",
        riesgo:
          "Si la importación se traba en aduana, te quedas sin stock y sin alternativa de respaldo.",
      },
    ],
  },
  {
    id: "est-03",
    modulo: "estrategia",
    severidad: "critica",
    titulo: "Un fondo extranjero ofrece comprar el 51% por USD 200K",
    descripcion:
      "Un fondo de inversión paraguayo ofrece USD 200.000 a cambio del 51% de tu empresa. Tu valoración mental era cercana a esa cifra, pero perderías el control mayoritario. Tienes 30 días para responder.",
    opciones: [
      {
        id: "est-03-a",
        texto: "Acepto: USD 200K cambia mi vida y el fondo tiene experiencia regional.",
        costo_emocional:
          "Pasas de ser dueño a ser empleado de tu propio sueño.",
        riesgo:
          "Si el fondo decide cambiar el rumbo, ya no puedes detenerlo.",
      },
      {
        id: "est-03-b",
        texto: "Contraoferta: ofrezco 35% por la misma cifra para mantener control.",
        costo_emocional:
          "Te expones a que el fondo se retire ofendido y pierdes la oportunidad.",
        riesgo:
          "Negociar mal puede dejarte sin inversión y con la noticia regada en el ecosistema.",
      },
      {
        id: "est-03-c",
        texto: "Rechazo y busco crecer orgánico aunque más lento.",
        costo_emocional:
          "Renuncias a una oportunidad histórica que puede no repetirse.",
        riesgo:
          "Sin capital, el competidor que sí lo tomará puede crecer 5 veces más rápido que tú.",
      },
    ],
  },
  {
    id: "est-04",
    modulo: "estrategia",
    severidad: "media",
    titulo: "Aprueban una ley de certificación adicional",
    descripcion:
      "Se aprueba una ley que obliga a tu rubro a obtener una certificación adicional con un costo de Bs 8.000 más 3 meses de espera para emisión. El plazo de cumplimiento es de 6 meses y la multa por incumplir es Bs 25.000.",
    opciones: [
      {
        id: "est-04-a",
        texto: "Inicio el trámite ahora mismo y pago los Bs 8.000 con plata reservada para crecimiento.",
        costo_emocional:
          "Detienes la expansión que tenías planeada por al menos 6 meses.",
        riesgo:
          "Quedas sin colchón si surge otra emergencia simultánea.",
      },
      {
        id: "est-04-b",
        texto: "Espero 4 meses y financio la certificación con ventas de este trimestre.",
        costo_emocional:
          "Vives con la presión constante de cumplir antes del límite.",
        riesgo:
          "Si las ventas del trimestre fallan, te queda 1 mes y la multa al horizonte.",
      },
      {
        id: "est-04-c",
        texto: "Me asocio con un competidor para compartir el costo de un asesor que tramite por ambos.",
        costo_emocional:
          "Tienes que compartir información sensible con alguien que técnicamente es rival.",
        riesgo:
          "Si la alianza se rompe a mitad de trámite, pierdes plata y tiempo.",
      },
    ],
  },
  {
    id: "est-05",
    modulo: "estrategia",
    severidad: "leve",
    titulo: "Detectas que tu producto se compra para reventa en Perú",
    descripcion:
      "Notas que un cliente compra cantidades inusuales (200 unidades mensuales) y al rastrear descubres que las revende en Puno, Perú. La oportunidad es real, pero no tienes contrato ni acuerdo formal con esa persona.",
    opciones: [
      {
        id: "est-05-a",
        texto: "Le ofrezco un acuerdo formal de distribuidor exclusivo en Perú con descuento por volumen.",
        costo_emocional:
          "Cedes margen actual a cambio de potencial futuro incierto.",
        riesgo:
          "Si el distribuidor incumple, pierdes el control sobre tu marca en otro país.",
      },
      {
        id: "est-05-b",
        texto: "Replico el modelo y abro yo mismo canal directo en Puno.",
        costo_emocional:
          "Operar fuera del país implica burocracia, viajes y aprendizaje legal nuevo.",
        riesgo:
          "Lanzar internacionalmente sin experiencia previa suele costar 3 veces lo presupuestado.",
      },
      {
        id: "est-05-c",
        texto: "Mantengo el silencio y dejo que el cliente siga revendiendo sin formalizar nada.",
        costo_emocional:
          "Sientes que regalas margen y oportunidad por miedo a complicarte.",
        riesgo:
          "El revendedor puede registrar tu marca en Perú antes que tú y bloquearte legalmente.",
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// API público del banco
// ──────────────────────────────────────────────────────────────────────────

const POR_MODULO: Record<ModuloEvento, EventoSorpresa[]> = {
  idea: EVENTOS_IDEA,
  marketing: EVENTOS_MARKETING,
  estrategia: EVENTOS_ESTRATEGIA,
};

/**
 * Devuelve TODOS los eventos del módulo. Útil para inspección o tests.
 */
export function obtenerEventosDelModulo(modulo: ModuloEvento): EventoSorpresa[] {
  return POR_MODULO[modulo] ?? [];
}

/**
 * Devuelve un evento aleatorio del módulo evitando los IDs ya jugados.
 * Si el alumno ya jugó todos los eventos disponibles, vuelve a permitirlos
 * (ciclo) — la IA evalúa la decisión de todos modos contra el contexto nuevo.
 *
 * @param modulo Módulo del simulador.
 * @param turno Número de turno actual (1-indexed). Reservado para futuras
 *              variaciones por dificultad — hoy no afecta la selección.
 * @param historial Eventos ya jugados (para no repetir en el corto plazo).
 */
export function obtenerEventoAleatorio(
  modulo: ModuloEvento,
  turno: number,
  historial: TurnoHistorial[] = []
): EventoSorpresa {
  void turno; // reservado para escalado de dificultad futuro
  const todos = obtenerEventosDelModulo(modulo);
  if (todos.length === 0) {
    throw new Error(`No hay eventos disponibles para el módulo ${modulo}.`);
  }
  const jugados = new Set(historial.map((h) => h.evento.id));
  const disponibles = todos.filter((e) => !jugados.has(e.id));
  const candidatos = disponibles.length > 0 ? disponibles : todos;
  const idx = Math.floor(Math.random() * candidatos.length);
  return candidatos[idx];
}

export const __TEST_ONLY = {
  EVENTOS_IDEA,
  EVENTOS_MARKETING,
  EVENTOS_ESTRATEGIA,
};
