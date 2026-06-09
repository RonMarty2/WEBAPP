import type { CasoIdea } from "../types";

/**
 * Caso 4 — Impresión 3D de repuestos pequeños para talleres mecánicos
 * en El Alto.
 *
 * **Dificultad avanzada.** Caso B2B con ciclo de cobro complejo y
 * curva técnica. Útil porque enseña que B2B no es "B2C con más cero":
 * el cliente decide diferente, paga diferente y exige diferente.
 */

export const casoImprime3dAndesElAlto: CasoIdea = {
  slug: "imprime3d-andes-elalto",
  modulo: "idea",
  titulo: "Imprime3D Andes",
  tagline: "Impresión 3D de repuestos pequeños bajo demanda para talleres mecánicos en El Alto.",
  zona: "Ceja de El Alto + Zona Industrial La Paz",
  rubro: "Manufactura bajo demanda",
  dificultad: "avanzado",
  emoji: "⚙️",
  emprendedor: {
    nombre: "Wilson Quispe",
    edad: 35,
    rol: "Mecánico con 12 años de experiencia en talleres de El Alto. Hizo un curso de impresión 3D online (3 meses). Tiene 2 impresoras: una Creality Ender 3 V2 y una Anycubic Kobra.",
  },
  contexto: [
    "Wilson trabajó toda su vida en mecánica automotriz. Veía repetidamente el mismo problema: \"se rompe un eslabón plástico de un parabrisas, una manilla de palanca, un buje pequeño — y el repuesto demora 3 semanas en llegar desde Iquique o desde Chile. El auto queda parado en el taller, el cliente furioso, el taller pierde dinero\".",
    "Hizo un curso online de impresión 3D durante la cuarentena. Empezó imprimiendo regalos para sobrinos. Después, un compañero del taller le pidió hacer una pieza chica de plástico para una camioneta — Wilson la diseñó en TinkerCAD y la imprimió en 4 horas. El taller le pagó Bs 80 por algo que les costaba Bs 380 importado + 3 semanas.",
    "Ahí Wilson vio el negocio. No quería vender al usuario final — los autos los tienen los talleres. Lo que faltaba era convencer al jefe de taller (no al mecánico) de que un repuesto impreso es confiable. Esa es la batalla real.",
  ],
  problema: "Talleres mecánicos en El Alto/La Paz pierden 2-3 semanas y dinero esperando repuestos pequeños importados; cuando finalmente llegan, el cliente del auto ya se quejó o se fue a otro taller.",
  segmento: "Talleres mecánicos medianos (4-12 empleados) en El Alto y Zona Industrial La Paz, que reciben 15-40 autos por semana y tienen 'la pieza pendiente' como cuello de botella.",
  lean_canvas: {
    problema: [
      "Tiempo de espera de 2-4 semanas para repuestos importados pequeños.",
      "Costo de oportunidad: auto parado en taller = cliente molesto + posible churn.",
      "Costo CIF de pieza importada + flete + aduana = a veces más caro que el labor.",
      "Pieza descontinuada de auto modelo viejo simplemente NO existe.",
    ],
    segmento: "Jefes de taller mecánico, 35-55 años, valoran rapidez sobre marca. Decisión rápida si el precio + tiempo cierran.",
    propuesta_unica: "Pieza plástica impresa en 24-48 horas, mismo material que la original (PETG o ABS), tu taller no pierde el cliente.",
    solucion: [
      "WhatsApp: el taller manda foto + medidas (o la pieza rota).",
      "Wilson cotiza en 4 horas (precio + plazo + material).",
      "Producción en 24-48 horas según complejidad.",
      "Entrega en moto a domicilio.",
    ],
    canales: [
      "Visita en persona a 12 talleres prioritarios (Wilson los conoce).",
      "WhatsApp grupal con clientes activos (avisar 'horarios de impresión').",
      "Banner físico en el taller donde Wilson trabajó (publicidad de su exjefe).",
    ],
    flujo_ingresos: [
      "Pieza estándar (manilla, botón, eslabón) Bs 60-120.",
      "Pieza compleja (carcasa, soporte estructural) Bs 150-280.",
      "Diseño 3D a medida (no copia, sino pieza nueva): Bs 300-500.",
      "Pago 50% adelantado, 50% contra entrega. NO crédito.",
    ],
    estructura_costos: [
      "Filamento PETG/ABS: Bs 8-15 por pieza estándar.",
      "Energía eléctrica (4-8 horas de impresión): Bs 3-6.",
      "Tiempo de Wilson (diseño + impresión): Bs 30/hora.",
      "Movilidad entrega (moto): Bs 5-12.",
      "Margen contribución típico: 50-60%.",
      "Costos fijos: alquiler del taller chico Bs 600/mes + mantenimiento impresoras Bs 200/mes.",
    ],
    metricas_clave: [
      "Talleres activos por mes (meta inicial: 8).",
      "Tiempo promedio cotización → entrega (≤72 horas).",
      "Tasa de re-pedido por taller (>3 pedidos/mes = relación sana).",
      "% de cotizaciones que se cierran (idealmente ≥40%).",
    ],
    ventaja_competitiva: "Wilson HABLA EL IDIOMA del taller (es mecánico). Un emprendedor con impresora 3D pero sin experiencia mecánica no entiende cuando el jefe dice 'necesito que sople hasta 70°C' o 'tiene que aguantar el vaivén'. Esa traducción técnica es el moat.",
  },
  propuesta_valor: {
    trabajos_cliente: [
      "Cumplir la promesa al cliente del auto: 'mañana lo tienes listo'.",
      "No depender de Iquique/Chile para repuestos pequeños.",
      "Resolver autos viejos cuyos repuestos ya no se fabrican.",
    ],
    dolores: [
      "Cliente furioso esperando 3 semanas a un repuesto plástico.",
      "Auto parado ocupando un puesto del taller que podría usar.",
      "Tener que dar la mala noticia: 'tu modelo ya no tiene repuesto'.",
      "Importar 1 pieza chica con flete = pagar más que el labor.",
    ],
    ganancias: [
      "Decir 'mañana o pasado lo tienes' y cumplirlo.",
      "Resolver autos viejos = clientes leales.",
      "Más rotación de turnos en el taller.",
      "Reputación de 'aquí no te dejan parado'.",
    ],
    productos: [
      "Pieza impresa en 24-48 horas (material correcto).",
      "Diseño 3D a medida si no hay original.",
      "Cotización rápida vía WhatsApp.",
    ],
    aliviadores: [
      "WhatsApp + foto = cotización sin desplazamiento.",
      "Tiempo de 24-48 horas vs 2-4 semanas.",
      "Pago contra entrega = sin riesgo financiero para el taller.",
      "Wilson entiende términos mecánicos = cero malentendidos.",
    ],
    creadores: [
      "Wilson da factura/recibo formal = el taller cobra al cliente sin fricción.",
      "Garantía de 30 días por defecto de impresión.",
      "Catálogo de piezas pre-impresas más pedidas (entrega inmediata para esos casos).",
    ],
  },
  validacion: {
    hipotesis: [
      {
        hipotesis: "Talleres pagarían Bs 80-150 por una pieza plástica entregada en 48 horas.",
        experimento: "Wilson visita 12 talleres con muestras físicas (3 piezas que él imprimió). Cotiza in-situ cualquier necesidad.",
        metrica: "Cerrar al menos 5 talleres con pedido pagado en 2 semanas.",
        resultado_esperado: "Si cierra <3, el precio o la calidad están mal.",
      },
      {
        hipotesis: "El ciclo de cobro es manejable con 50% adelantado / 50% entrega.",
        experimento: "Aplicar la regla en los primeros 10 pedidos sin excepciones.",
        metrica: "Cero pedidos con cobro pendiente >7 días al cierre del mes.",
        resultado_esperado: "Si >2 pedidos tienen cobro atrasado, hay que pasar a 100% adelantado.",
      },
      {
        hipotesis: "La impresora 3D doméstica resiste un volumen comercial.",
        experimento: "Llevar registro de horas de impresión, fallas, reimpresiones durante 60 días.",
        metrica: "Tasa de fallas <15% y ninguna falla irrecuperable.",
        resultado_esperado: "Si >25% de fallas, hay que actualizar a impresora industrial (Bs 18.000) o reducir aceptación de pedidos complejos.",
      },
    ],
    resultado: "Hipótesis 1 VERDADERA: cerró 6 talleres en 2 semanas. Hipótesis 2 FALSA: dos talleres pidieron crédito 30 días (jefes conocidos del barrio). Wilson cedió y se quemó: uno pagó 45 días después, otro no pagó. Cambió a 100% adelantado y perdió 1 taller (que volvió 3 meses después). Hipótesis 3 PARCIALMENTE VERDADERA: 18% de fallas por usar filamento barato. Subió calidad de filamento y bajó fallas a 9%.",
  },
  scorecard: {
    deseabilidad: 4,
    factibilidad: 4,
    viabilidad: 4,
    nota: "Deseabilidad alta (resuelve dolor real). Factibilidad alta (Wilson tiene el conocimiento y los equipos). Viabilidad buena con disciplina de cobro: el margen 50-60% por pieza es excelente, pero solo si NO hay incobrables. La diferencia entre Bs 6.000 y Bs 2.000/mes depende 100% de la regla del 100% adelantado.",
  },
  conclusion: "Idea **viable con disciplina financiera estricta**. El producto funciona y el mercado paga. El riesgo NO es técnico sino administrativo: ceder en el cobro adelantado destruye el negocio. Wilson en 6 meses puede cubrir el costo de la impresora industrial (Bs 18.000) y dar el salto a 3-4 piezas simultáneas, lo que duplicaría ingresos.",
  lecciones: [
    "B2B exige pre-cobro obligatorio. Cualquier excepción se vuelve política y mata el cashflow.",
    "Hablar el idioma técnico del cliente (mecánico) vence a tener mejor equipo (impresora).",
    "El catálogo de piezas pre-impresas (mismas piezas que se piden seguido) es un activo: convierte servicio en producto.",
    "Filamento barato es falso ahorro: 25% de fallas matan el margen y la reputación.",
    "Empezar con impresoras domésticas para validar es correcto; subir a industrial solo cuando hay demanda comprobada.",
  ],
  errores_evitados: [
    "No vender al usuario final (dueño del auto) — el taller es quien decide y paga.",
    "No competir en piezas grandes/complejas — la impresora doméstica no puede.",
    "No dar crédito 'al conocido' — el conocido del barrio es el peor pagador.",
    "No prometer plazos imposibles (24h cuando son 48h) — la reputación es todo en B2B.",
    "No copiar repuestos patentados de marca — riesgo legal y reputacional.",
  ],
  tags: ["B2B", "manufactura", "manufactura-bajo-demanda", "El-Alto", "talleres", "tecnologia"],
};
