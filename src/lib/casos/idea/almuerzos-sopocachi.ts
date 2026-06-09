import type { CasoIdea } from "../types";

/**
 * Caso 1 — Delivery de almuerzos caseros en Sopocachi (La Paz).
 *
 * Caso de **dificultad básica**. Sirve como primer ejemplo porque:
 *   - Producto tangible y entendible (comida).
 *   - Validación posible con cero inversión (WhatsApp + pre-venta).
 *   - El pivote intermedio (de "tienda física" a "pre-venta WhatsApp")
 *     es una lección clásica de Lean Startup aplicada a Bolivia.
 */

export const casoAlmuerzosSopocachi: CasoIdea = {
  slug: "almuerzos-sopocachi",
  modulo: "idea",
  titulo: "Almuerzos al toque",
  tagline: "Almuerzo casero pre-vendido por WhatsApp para oficinistas de Sopocachi.",
  zona: "Sopocachi, La Paz",
  rubro: "Alimentación",
  dificultad: "basico",
  emoji: "🍱",
  emprendedor: {
    nombre: "Daniela Mamani",
    edad: 28,
    rol: "Exmesera de un restaurante en Sopocachi. Cocina desde los 14 años con su mamá. Quiere armar su propio negocio sin endeudarse.",
  },
  contexto: [
    "Daniela vive en Sopocachi y trabajó cinco años como mesera en un restaurante de la zona. Todos los mediodías veía a los mismos oficinistas pedir pollo broaster, hamburguesas o salteñas porque era lo único rápido. Las quejas se repetían: \"yo quiero comer casero, no chatarra, pero no tengo tiempo de salir a buscar\".",
    "Cuando perdió el trabajo en mayo de 2026, pensó en montar una pensión chica. El alquiler en Sopocachi le pedía Bs 4.500/mes más garantía. No tenía ese capital. Su mamá le dijo: \"empieza desde la casa, pero diferente — que ellos te pidan antes\".",
    "Esa idea —pre-venta— es la base del caso. Daniela no quería ser una pensión más. Quería un servicio donde el cliente decide hoy a las 9:00 qué quiere comer mañana, paga por adelantado vía QR, y a las 12:30 le llega la marmita a la oficina.",
  ],
  problema: "Oficinistas de Sopocachi quieren comer casero al mediodía pero no tienen tiempo de salir a buscar y desconfían de los servicios de delivery genéricos.",
  segmento: "Oficinistas de 25-45 años en torres de Sopocachi (Av. 6 de Agosto, Av. Arce, Plaza Avaroa), NSE B y C+, que valoran comida casera por encima de la velocidad.",
  lean_canvas: {
    problema: [
      "Almuerzo de oficina en Sopocachi es caro o industrial (broaster, hamburguesa).",
      "Los servicios de delivery (PedidosYa, etc.) cobran 25-35% al restaurante y suben el precio final.",
      "Las pensiones cercanas son rígidas: o tienes plan mensual o no comes.",
    ],
    segmento: "Oficinistas 25-45 años en torres de Sopocachi, sueldo Bs 4.000-12.000, almuerzan en oficina 4-5 veces por semana.",
    propuesta_unica: "Almuerzo casero como en tu casa, pedido por WhatsApp antes de las 10:00 y entregado en tu oficina a las 12:30. Sin app, sin comisiones, sin plan mensual.",
    solucion: [
      "Menú único del día publicado en WhatsApp Status cada noche.",
      "Pedido antes de las 10:00 con pago QR adelantado.",
      "Entrega 12:00-13:00 en bicicleta a oficinas dentro de 1.2 km.",
      "Marmita reutilizable que se devuelve al día siguiente con el nuevo pedido.",
    ],
    canales: [
      "WhatsApp Business (lista de difusión + Status diario).",
      "Voz a voz dentro de cada torre (un cliente trae 2-3 compañeros).",
      "Folletos pegados solo en los 4 edificios target (no volantes en la calle).",
    ],
    flujo_ingresos: [
      "Almuerzo unitario Bs 25 (segundo + ensalada + jugo de la casa).",
      "Combo semanal lunes-viernes Bs 110 (Bs 22/día, 12% de descuento).",
      "Cobranza 100% adelantada vía QR a SOLES (Banco Sol).",
    ],
    estructura_costos: [
      "Insumos por marmita: Bs 11 (44% del precio).",
      "Empaque (marmita reutilizable amortizada): Bs 1,50/comida.",
      "Movilidad (bicicleta + cadena): Bs 0,80/comida.",
      "Total costo variable: ~Bs 13. Margen contribución: Bs 12 (48%).",
      "Costos fijos: cocina en casa (gas, luz extras): Bs 600/mes.",
    ],
    metricas_clave: [
      "Pedidos diarios (meta inicial: 20 → punto de equilibrio).",
      "Tasa de re-pedido semanal (>60% = producto encaja).",
      "Tiempo promedio de entrega (≤30 min desde salida).",
      "Devoluciones de marmita (>90% = clientes se quedan).",
    ],
    ventaja_competitiva: "Conocimiento profundo de las 4 torres target (Daniela trabajó allí 5 años; conoce nombres, horarios y rutinas). Una app de delivery no puede replicar eso.",
  },
  propuesta_valor: {
    trabajos_cliente: [
      "Comer algo sano al mediodía sin gastar más de Bs 30.",
      "No interrumpir el trabajo: que la comida llegue a la oficina.",
      "Variar el menú sin tener que decidir cada día.",
    ],
    dolores: [
      "Comida grasosa que da sueño a la tarde.",
      "Tiempo perdido bajando 15 pisos para buscar almuerzo.",
      "Repetir el mismo broaster 3 veces por semana.",
      "Pagar Bs 35-40 en delivery por una hamburguesa industrial.",
    ],
    ganancias: [
      "Sabor casero como el de su mamá / abuela.",
      "Sentirse mejor en la tarde (menos pesadez).",
      "Variedad sin tener que pensar (Daniela decide el menú).",
      "Ahorrar Bs 50-100 por semana vs delivery.",
    ],
    productos: [
      "Marmita lista (segundo + ensalada + jugo natural).",
      "Menú único del día (no menú con 20 opciones).",
      "Entrega puntual entre 12:00 y 13:00.",
    ],
    aliviadores: [
      "Pre-venta antes de las 10:00: el cliente solo decide UNA vez al día.",
      "Entrega en la recepción de la oficina (no hay que bajar).",
      "Menú casero diferente cada día (lunes ají de fideo, martes pescado, etc.).",
      "Precio Bs 25 vs Bs 35-40 en apps de delivery.",
    ],
    creadores: [
      "Recetas heredadas de la abuela paceña.",
      "Marmita reutilizable: el cliente siente que cuida el planeta.",
      "Comunicación directa por WhatsApp: el cliente puede pedir sin sal, sin picante, etc.",
    ],
  },
  validacion: {
    hipotesis: [
      {
        hipotesis: "Al menos 40% de oficinistas en las 4 torres target pagaría Bs 25 por un almuerzo casero pre-vendido.",
        experimento: "Daniela hace folletos con foto + menú de la próxima semana. Reparte personalmente en las 4 torres durante 3 días. Mide cuántos escanean el QR del folleto y entran al WhatsApp.",
        metrica: "≥80 personas escanean el QR (de ~200 oficinistas total) y ≥30 hacen al menos 1 pedido.",
        resultado_esperado: "Si <30 hacen un pedido, el problema NO es lo bastante doloroso o el precio está mal.",
      },
      {
        hipotesis: "Los clientes que prueben una vez van a re-pedir al menos 3 veces en 2 semanas.",
        experimento: "Tracking manual en una hoja Excel: nombre + torre + pedidos por semana durante 4 semanas. Cliente que pidió 1 vez y NO repitió → llamar para entender por qué.",
        metrica: "Tasa de retención semanal ≥ 60%.",
        resultado_esperado: "<60% indica problema con el producto (sabor, porción, puntualidad).",
      },
      {
        hipotesis: "La bicicleta alcanza para cubrir las 4 torres en ≤45 min totales.",
        experimento: "Daniela hace 5 simulacros (sin clientes reales, solo midiendo ruta) entre 12:00 y 13:00 en horario pico de tráfico.",
        metrica: "Tiempo total ≤45 min con 8 paradas.",
        resultado_esperado: "Si supera 45 min, hay que limitar a 3 torres o conseguir ayudante.",
      },
    ],
    resultado: "En 2 semanas de prueba, Daniela validó 15 clientes recurrentes (de 22 que probaron una vez = 68% retención). Promedio de 18 pedidos diarios. Confirmó que la bicicleta es viable hasta 25 pedidos; arriba de eso necesita un ayudante con bicicleta. El menú único es aceptado pero los viernes pidieron \"algo más festivo\" → ajustó a menú especial los viernes (saice, sopa de maní).",
  },
  scorecard: {
    deseabilidad: 5,
    factibilidad: 4,
    viabilidad: 4,
    nota: "Alta deseabilidad confirmada con clientes reales. Factibilidad alta porque Daniela ya cocina (no necesita aprender). Viabilidad buena con margen 48%; el techo está en cuántas marmitas físicamente puede entregar. Para escalar arriba de 30 pedidos/día necesita ayudante o moto.",
  },
  conclusion: "Idea **viable y validada**. Daniela no necesitó capital de Bs 4.500 para alquiler. Con Bs 800 (10 marmitas + bicicleta usada + folletería) levantó el MVP. El cuello de botella no es la demanda sino la operación: tiene que decidir si crece contratando o si se queda en 25 pedidos/día como negocio unipersonal rentable (~Bs 6.500/mes neto).",
  lecciones: [
    "La pre-venta con pago adelantado elimina el riesgo de inventario (cocinas exactamente lo que vendiste).",
    "Conocer ESPECÍFICAMENTE 3-4 puntos de entrega vence a una app que cubre toda la ciudad pero no conoce a nadie.",
    "WhatsApp Status > app propia: cero inversión en tecnología, cero CAC, alcance directo.",
    "La marmita reutilizable cumple dos funciones: branding ambiental + lock-in (devolverla obliga a un próximo pedido).",
    "El menú único reduce desperdicio de comida en 80% vs un menú con opciones.",
  ],
  errores_evitados: [
    "No alquilar local desde el día 1 — el costo fijo te entierra antes de validar.",
    "No diseñar app móvil para algo que WhatsApp resuelve gratis.",
    "No vender a toda La Paz — empezar por 4 torres concretas donde tienes contactos.",
    "No aceptar pago contra entrega — destruye el cashflow y duplica el tiempo de entrega.",
    "No pretender competir en precio con broaster (Bs 12); compite en valor (comida casera Bs 25).",
  ],
  tags: ["delivery", "alimentacion", "B2C", "MVP-rapido", "WhatsApp", "La-Paz", "low-tech"],
};
