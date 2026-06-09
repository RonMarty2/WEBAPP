import type { CasoIdea } from "../types";

/**
 * Caso 3 — Repostería sin azúcar para diabéticos en Santa Cruz.
 *
 * **Dificultad intermedia.** Caso útil porque ilustra una idea con alta
 * deseabilidad pero MARGEN ESTRECHO. Los insumos premium (stevia, harinas
 * alternativas, edulcorantes naturales) son 3× más caros que los normales
 * y se importan. Es una lección sobre VIABILIDAD financiera ≠ deseabilidad
 * de mercado.
 */

export const casoDulceSinCulpaScz: CasoIdea = {
  slug: "dulce-sin-culpa-scz",
  modulo: "idea",
  titulo: "Dulce sin culpa",
  tagline: "Pastelería sin azúcar para diabéticos en Santa Cruz, hecha por un diabético.",
  zona: "Equipetrol, Santa Cruz",
  rubro: "Alimentación especializada",
  dificultad: "intermedio",
  emoji: "🧁",
  emprendedor: {
    nombre: "Marco Antonio Suárez",
    edad: 32,
    rol: "Diseñador gráfico independiente. Diabético tipo 2 desde hace 4 años. Aprendió repostería para no renunciar al dulce. Tiene Instagram con 4.000 seguidores donde comparte recetas.",
  },
  contexto: [
    "Marco fue diagnosticado con diabetes tipo 2 a los 28 años. Su mayor pérdida emocional no fue la comida en general, fue el postre. Su esposa empezó a buscar alternativas y descubrieron juntos un mundo de harinas y edulcorantes naturales (almendra, coco, eritritol, stevia, monk fruit).",
    "Empezó a postear sus pruebas en Instagram \"@marcosindulce\" como diario personal. En 8 meses pasó de 100 a 4.000 seguidores. Le llovían mensajes: \"¿dónde compro?\" \"¿das clases?\" \"¿llevas a Equipetrol?\". Las mamás de niños diabéticos eran las más insistentes.",
    "Marco no tenía intención comercial al principio. Pero su esposa, contadora, hizo cuentas: \"si cobras Bs 65 por un cheesecake de 6 porciones y lo vendes 15 a la semana, sacas Bs 4.000/mes neto trabajando 2 días por semana\". Decidió validar pequeño antes de renunciar al diseño.",
  ],
  problema: "Diabéticos en Santa Cruz no encuentran postres ricos que sean realmente seguros (sin azúcar, sin maltodextrina escondida, sin edulcorantes artificiales). Las pastelerías comerciales venden 'opciones sin azúcar' que igual disparan la glucosa.",
  segmento: "Diabéticos tipo 2 de 35+ años y familias con niños diabéticos tipo 1, NSE B+ en zonas Equipetrol/Las Palmas/Urubó.",
  lean_canvas: {
    problema: [
      "Pastelerías comerciales usan maltodextrina o sucralosa que igual elevan glucosa.",
      "Las opciones 'fit/keto' del supermercado son secas, caras y no satisfacen.",
      "Hornear en casa = comprar 6 ingredientes especializados que se desperdician si no hornas seguido.",
      "Cumpleaños y eventos = el diabético se queda mirando mientras los demás comen torta.",
    ],
    segmento: "Diabéticos tipo 2 (35+) y padres de niños diabéticos tipo 1, NSE B+, valoran ingredientes 'limpios', ya gastan en suplementos y consultas.",
    propuesta_unica: "Pastelería de autor sin azúcar real, hecha por un diabético que entiende que el sabor no se negocia. 100% ingredientes verificables, etiquetado con índice glucémico.",
    solucion: [
      "Pre-venta semanal vía Instagram + WhatsApp con menú rotativo.",
      "Entregas miércoles y sábados (no fabricar lo que no se vende).",
      "Cada producto con su ficha de ingredientes + valor glucémico aproximado.",
      "Servicio especial 'torta de cumpleaños' bajo pedido con 5 días de anticipación.",
    ],
    canales: [
      "Instagram (canal principal — Marco ya tiene 4.000 seguidores).",
      "Recomendación de 3 nutricionistas y 2 endocrinólogos de la ciudad.",
      "Asociación de Diabéticos de Santa Cruz (charlas mensuales como sponsor).",
    ],
    flujo_ingresos: [
      "Porción individual Bs 18-25.",
      "Cheesecake completo (6 porciones) Bs 95.",
      "Torta de cumpleaños bajo pedido Bs 180-300.",
      "Curso online básico de repostería sin azúcar Bs 250 (escalable).",
    ],
    estructura_costos: [
      "Insumos premium importados: 38% del precio (vs 18% repostería normal).",
      "Empaque presentable: Bs 4/unidad.",
      "Tiempo de Marco: Bs 35/hora costeado (2 días/semana = 16 hrs).",
      "Total costo variable + tiempo: ~58% del precio. Margen contribución: 42%.",
      "Costos fijos: gas + horno + Insta ads: Bs 800/mes.",
    ],
    metricas_clave: [
      "Ticket promedio (meta: subir de Bs 25 a Bs 60 con cheesecakes/tortas).",
      "Re-compra a 30 días (>40% indica encaje).",
      "% de pedidos que vienen por referido vs Instagram.",
      "Tiempo de producción por pedido (cuello de botella).",
    ],
    ventaja_competitiva: "Marco ES el cliente. Posteo del diabético-pastelero genera empatía y autoridad que ninguna pastelería corporativa puede replicar. Además: receta probada en él mismo (cero riesgo de subir glucosa al cliente).",
  },
  propuesta_valor: {
    trabajos_cliente: [
      "Comer un postre sin sentir culpa ni miedo a la glucosa.",
      "Celebrar cumpleaños como cualquier persona.",
      "Compartir con su familia algo que TODOS puedan comer.",
    ],
    dolores: [
      "Tener que rechazar la torta de cumpleaños en la oficina.",
      "Confiar en 'sin azúcar' del supermercado y descubrir que igual subió la glucosa.",
      "Pagar caro por 'fit cake' seco y sin sabor.",
      "Sentirse 'enfermo' o 'diferente' en eventos sociales.",
    ],
    ganancias: [
      "Disfrutar del dulce sin penitencia.",
      "Compartir con la familia (los hijos prueban también).",
      "Estabilidad de glucosa mientras come el postre.",
      "Sentir que 'el dueño me entiende' porque también es diabético.",
    ],
    productos: [
      "Cheesecake / brownies / galletas / tortas con ingredientes premium.",
      "Etiqueta con macros + índice glucémico.",
      "Empaque presentable apto para regalo.",
    ],
    aliviadores: [
      "Marco probó cada receta en sí mismo: el cliente confía.",
      "Etiquetado claro elimina el miedo a 'qué tendrá adentro'.",
      "Pre-venta evita desperdicio y baja precio.",
      "Servicio de torta de cumpleaños = el diabético es protagonista, no excluido.",
    ],
    creadores: [
      "Comunicación de marca que valida (no estigmatiza) la condición.",
      "Sentido de comunidad: clientes se reconocen en Instagram.",
      "Productos lindos visualmente = el diabético siente status, no caridad.",
    ],
  },
  validacion: {
    hipotesis: [
      {
        hipotesis: "Diabéticos y sus familias pagarían Bs 95 por un cheesecake completo sin azúcar.",
        experimento: "Marco postea 'pre-venta cerrada' para 10 cheesecakes la primera semana. Cobranza adelantada vía QR.",
        metrica: "Vender 10/10 unidades en ≤48 horas desde el post.",
        resultado_esperado: "Si vende <5, el precio Bs 95 es demasiado alto o la audiencia de Instagram no convierte.",
      },
      {
        hipotesis: "El margen real cubre los insumos premium importados.",
        experimento: "Marco hace una hoja Excel con cada centavo gastado en 1 mes (insumos, gas, empaque, ads).",
        metrica: "Margen neto ≥ 30% después de TODOS los costos (no solo insumos).",
        resultado_esperado: "Si margen <25%, hay que subir precios o reducir variedad para bajar desperdicio.",
      },
      {
        hipotesis: "Los nutricionistas y endocrinólogos van a recomendarlo si reciben muestras.",
        experimento: "Marco envía 1 caja sampler a 8 profesionales con tarjeta personal.",
        metrica: "≥3 profesionales generan al menos 1 cliente referido en 60 días.",
        resultado_esperado: "Si <2 recomiendan, el canal médico no es escalable y hay que reforzar Instagram.",
      },
    ],
    resultado: "Hipótesis 1 SUPERADA: vendió 10 cheesecakes en 8 horas. La segunda semana subió a 16. Hipótesis 2 PARCIALMENTE FALSA: el margen real fue 28%, no 30%. La eritritol sube de precio en cada compra. Decidió reducir el menú de 7 productos a 4 productos hero (los más rentables). Hipótesis 3 VERDADERA: dos endocrinólogos lo recomiendan activamente.",
  },
  scorecard: {
    deseabilidad: 5,
    factibilidad: 4,
    viabilidad: 3,
    nota: "Deseabilidad máxima (la comunidad reacciona muy fuerte). Factibilidad alta (Marco ya horneaba). Viabilidad apenas decente: el margen 28% es vulnerable a inflación de insumos importados. El curso online (Bs 250) tiene mejor margen y debe ser el ancla de rentabilidad a futuro.",
  },
  conclusion: "Idea **viable pero con cuello financiero**. La demanda es real y emocionalmente fuerte. El reto es la economía: insumos importados destruyen el margen si se compite con repostería normal. La estrategia ganadora es: pocos productos premium (margen alto por unidad) + curso digital escalable como segundo ingreso. NO intentar competir en variedad ni en volumen masivo.",
  lecciones: [
    "Una historia personal del fundador puede ser el activo de marketing más fuerte (Marco siendo diabético).",
    "Deseabilidad alta + viabilidad estrecha = hay que reducir SKUs y subir ticket promedio.",
    "Reducir variedad (de 7 a 4 productos) no es perder negocio: es ganar margen por reducir desperdicio.",
    "El curso digital escala lo que el horno no escala — patrón clásico de negocios artesanales.",
    "Recomendación de profesional (endocrinólogo) genera 3× más confianza que un ad de Instagram.",
  ],
  errores_evitados: [
    "No abrir local en Equipetrol con alquiler Bs 5.000/mes el primer año — destruye el margen.",
    "No intentar competir con la pastelería normal en precio — son negocios diferentes.",
    "No producir sin pre-venta — el desperdicio mata el negocio con insumos caros.",
    "No omitir el etiquetado de ingredientes — los diabéticos NO confían en pastelerías que no listan macros.",
    "No subestimar el costo de la eritritol importada (sube cada trimestre).",
  ],
  tags: ["alimentacion", "nicho-medico", "premium", "Santa-Cruz", "B2C", "Instagram", "comunidad"],
};
