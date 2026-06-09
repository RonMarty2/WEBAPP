import type { CasoEstrategia } from "../types";

/**
 * Caso 3 — Análisis estratégico de una licorería boutique de vinos
 * tarijeños en Equipetrol, Santa Cruz. Posicionamiento premium para
 * competir con importados.
 *
 * Caso **intermedio**: PESTEL con consumo de vino post-pandemia,
 * Porter con importados como sustitutos, MPC contra 2 licorerías
 * premium consolidadas, FODA contextualizado y MCPE que compara 3
 * modelos comerciales (tienda física + delivery, club por
 * suscripción, wine bar con cata).
 */

export const casoLicoreriaVinosTarijenosScz: CasoEstrategia = {
  slug: "licoreria-vinos-tarijenos-scz",
  modulo: "estrategia",
  titulo: "Licorería boutique de vinos tarijeños",
  tagline: "Posicionamiento premium para 80 etiquetas de bodegas tarijeñas (Aranjuez, Kohlberg, Campos de Solana) en Equipetrol.",
  zona: "Equipetrol (Santa Cruz de la Sierra)",
  rubro: "Retail especializado / vinos",
  dificultad: "intermedio",
  emoji: "🍷",
  emprendedor: {
    nombre: "Camila Justiniano",
    edad: 35,
    rol: "Sommelier formada en EAS Argentina (Escuela Argentina de Sommeliers, 2018), certificación WSET nivel 2 (Londres, 2021). Regresó a Santa Cruz en 2024 tras 6 años en Buenos Aires entre Bodegas Trapiche y restaurante Tegui. Quiere abrir Tierra Alta Wines, una licorería boutique especializada en vinos de altura tarijeños.",
  },
  contexto: [
    "Camila notó al volver a Santa Cruz que el consumo de vino había cambiado profundamente. Los cruceños de 30-55 años, que antes tomaban whisky o cerveza, ahora pedían vino en cenas y reuniones. Pero las opciones en el mercado eran dos extremos: supermercados con etiquetas argentinas/chilenas básicas (Frontera, Trivento, Las Moras a Bs 65-85) o restaurantes premium con vinos importados de USD 80+. El segmento intermedio premium estaba desabastecido.",
    "Su intuición comercial: los vinos tarijeños han mejorado dramáticamente en calidad en la última década. Bodegas como Aranjuez (gama Campesino y Reserva), Kohlberg (Singani Centenario y línea Casa Vieja) y especialmente Campos de Solana han ganado medallas internacionales (Mundus Vini, Decanter). Sin embargo, en Santa Cruz se conocen poco — el cruceño promedio asume que vino argentino = mejor que vino boliviano, sin haberlo probado lado a lado.",
    "Camila tiene Bs 280.000 ahorrados (USD 25.000 al tipo paralelo) y su padre, médico, le ofrece un local de su propiedad en Av. San Martín (Equipetrol Norte), 95 m², que normalmente alquila en USD 1.400/mes. Le dará renta gratis los primeros 8 meses y luego USD 900/mes. La pregunta estratégica es: ¿qué modelo de negocio escalar — tienda física + delivery, club de vino por suscripción, o wine bar con cata? Cada uno requiere capital y mix distintos.",
  ],
  problema: "El segmento premium intermedio de vino en Santa Cruz (Bs 90-280/botella) está desabastecido pero requiere educar al consumidor cruceño sobre la calidad real del vino tarijeño contra el sesgo de origen argentino/chileno.",
  segmento: "Consumidores cruceños de 30-55 años, NSE B+ y A, profesionales independientes y empleados ejecutivos en zonas norte (Equipetrol, Las Palmas, Urubó) que consumen vino al menos 2 veces/semana, ticket medio Bs 120-280/botella, valoran historia y origen de lo que toman.",
  pestel: {
    politico: [
      {
        nombre: "Política de Bolivia hacia bebidas alcohólicas (Ley 259)",
        descripcion: "Ley 259 (2012) regula expendio: prohíbe venta a menores, restringe horarios (cierre 23:00 en lunes-jueves, 24:00 viernes-sábado), exige licencia municipal de funcionamiento + sanitaria SEDES. Algunas zonas residenciales tienen prohibición de tiendas de alcohol a <200 m de colegios.",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Validar zonificación del local en GAM Santa Cruz antes de firmar contrato; verificar que no haya colegio en 200 m. Restringe horario y formato de eventos.",
      },
      {
        nombre: "Promoción del vino boliviano por Ministerio de Desarrollo Productivo",
        descripcion: "El gobierno apoya bodegas tarijeñas con ferias anuales y campaña 'Vino Boliviano'. Incentivos fiscales menores para emprendimientos vinícolas. Cooperación SENAVEX para participar en ferias internacionales.",
        impacto: "positivo",
        intensidad: 2,
        implicacion: "Aprovechar campaña institucional como respaldo de marca. Asociarse a eventos públicos (ferias gastronómicas Santa Cruz) para visibilidad sin costo.",
      },
    ],
    economico: [
      {
        nombre: "Crecimiento de consumo de vino post-pandemia",
        descripcion: "Consumo per cápita de vino en Bolivia pasó de 1,8 L/persona (2019) a 3,1 L/persona (2024) según ANIV (Asociación Nacional Industria del Vino). Santa Cruz es el departamento con mayor consumo per cápita (5,2 L), liderando el crecimiento.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Tendencia estructural fuerte. El mercado se está duplicando cada 5 años. Entrar AHORA antes de que entren cadenas grandes (Hipermaxi premium, Fidalga gourmet).",
      },
      {
        nombre: "Devaluación del boliviano vs USD",
        descripcion: "El tipo paralelo Bs 12-14 en 2026 vs oficial Bs 6,96. Los vinos importados (Argentina, Chile) suben dramáticamente en Bs porque sus costos están en USD. Los vinos tarijeños mantienen precios en Bs.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Es el viento de cola más importante. Un Malbec argentino que costaba Bs 95 en 2022 ahora cuesta Bs 145-180. El gap con el tarijeño se cerró drásticamente. Aprovechar para reposicionar el tarijeño como 'opción premium accesible'.",
      },
      {
        nombre: "Capacidad de gasto en gastronomía en Equipetrol",
        descripcion: "Equipetrol concentra el ticket medio en restaurantes más alto de Bolivia: Bs 280/persona en cena promedio (Cámara de Restaurantes SCZ). Hogares zona Las Palmas tienen ingreso promedio Bs 18.000-32.000/mes.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Capacidad de pago existe. El cliente que cena Bs 280 en restaurante puede comprar botella Bs 180 sin reparo si la propuesta está bien construida.",
      },
    ],
    social: [
      {
        nombre: "Cambio cultural: vino como expresión de identidad",
        descripcion: "La generación 30-45 años en Santa Cruz adoptó el vino como bebida de cena y reunión informal. Crecen los clubes de vino, las catas privadas en casa, los regalos corporativos con etiquetas premium. Tendencia replicada de Buenos Aires y Lima.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Nicho de 'cata privada en casa' tiene potencial alto. Diseñar paquetes de 6 botellas + carta de cata curada por Camila para venta como regalo o autoconsumo.",
      },
      {
        nombre: "Sesgo de origen contra el vino boliviano",
        descripcion: "Estudio interno ANIV 2023: 64% de consumidores cruceños asume que vino tarijeño es 'menos calidad' que argentino sin haberlo probado en cata ciega. Es el principal obstáculo cultural a derribar.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Educación es central. Cata ciega de tarijeño vs argentino como evento mensual, contenido en redes sociales mostrando medallas y origen, recomendación personal de Camila como sommelier creíble.",
      },
      {
        nombre: "Influencers gastronómicos cruceños",
        descripcion: "Santa Cruz tiene 8-12 micro-influencers gastronómicos (Instagram 15-80k seguidores) que cubren restaurantes, catas y eventos. Costo promedio de colaboración: Bs 1.800-4.500 por post + stories.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Programa de colaboración con 3-4 influencers seleccionados (no todos, calidad sobre cantidad). Eventos exclusivos donde prueben + visiten bodega tarijeña.",
      },
    ],
    tecnologico: [
      {
        nombre: "E-commerce y delivery especializado",
        descripcion: "Plataformas como PedidosYa Market, Rappi y Yaigo cubren Equipetrol con delivery 30-50 minutos. Comisiones 15-22% por transacción. Comerciantes locales también usan WhatsApp Business con catálogo digital.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Habilitar canal delivery con PedidosYa Market desde el día 1. No depender solo de tráfico físico. WhatsApp Business con catálogo organizado por uva/región/precio.",
      },
      {
        nombre: "Tecnología de cata en línea (apps tipo Vivino)",
        descripcion: "Apps como Vivino permiten escanear etiqueta y ver puntuaciones globales. Vinos tarijeños premium ya tienen 50-120 ratings cada uno con notas 3,8-4,3/5.",
        impacto: "positivo",
        intensidad: 2,
        implicacion: "Usar puntuaciones Vivino en el material de venta para legitimar calidad. Mostrar QR del rating al lado de cada etiqueta en tienda física.",
      },
    ],
    ecologico: [
      {
        nombre: "Vino orgánico y biodinámico en alza",
        descripcion: "Bodegas como Campos de Solana ya tienen líneas orgánicas certificadas IMOCERT. Consumidor 30-45 años pregunta sobre certificación y prácticas sostenibles.",
        impacto: "positivo",
        intensidad: 2,
        implicacion: "Curar selección que incluya 8-12 etiquetas orgánicas/biodinámicas. Material informativo de origen y prácticas en cada botella.",
      },
    ],
    legal: [
      {
        nombre: "Licencia municipal y patente para venta de alcohol",
        descripcion: "GAM Santa Cruz cobra patente municipal Bs 4.800/año para licorerías. SEDES cobra licencia sanitaria Bs 2.200 inicial + Bs 1.500/año. Permisos tardan 60-90 días.",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "Iniciar trámite simultáneo con la búsqueda de local. Costo total año 1: Bs 9.200. Sin estos permisos no se opera legalmente.",
      },
      {
        nombre: "ICE (Impuesto al Consumo Específico) sobre vinos",
        descripcion: "Bolivia aplica ICE sobre bebidas alcohólicas. Vino fraccionado en envase ≤1L paga Bs 1,79/litro + ad valorem 5%. El ICE está incluido en el precio del distribuidor pero limita los descuentos.",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "Tomar en cuenta en estructura de precios. No competir en precios bajos donde el ICE come el margen.",
      },
      {
        nombre: "Norma técnica vino IBNORCA NB-37001",
        descripcion: "Establece definiciones, clasificación y requisitos para vinos producidos y comercializados en Bolivia. Es obligatorio que las etiquetas cumplan estándares de información (grado alcohólico, contenido, origen, lote).",
        impacto: "neutro",
        intensidad: 2,
        implicacion: "Cumplir con producto. Como retailer, verificar que las bodegas proveedoras cumplan etiquetado correcto.",
      },
    ],
  },
  porter: {
    rivalidad: {
      intensidad: "medio",
      justificacion: [
        "En Santa Cruz hay 3 licorerías premium consolidadas: Vinoteca Boliviana (centro), La Bodega Wine Bar (Equipetrol), Wines & Cellars (Las Palmas). Ninguna se enfoca en vino tarijeño específicamente.",
        "Supermercados premium (Hipermaxi gourmet, Fidalga selectos) compiten en gama media pero sin servicio sommelier ni curaduría.",
        "Restaurantes con carta de vinos curada (Jardín de Asia, Garabato, Casa del Camba) son cliente más que competidor (también pueden comprar para reventa).",
      ],
      estrategia: "Posicionarse como ESPECIALISTA en vino tarijeño (no genérica). Curaduría diferenciada y servicio de sommelier es el activo. Las otras 3 licorerías tienen catálogo mixto (Argentina/Chile/Francia/Bolivia) sin foco — Camila apuesta por foco temático.",
    },
    nuevos_entrantes: {
      intensidad: "alto",
      justificacion: [
        "Capital de entrada moderado: USD 25.000-40.000 alcanza para abrir una licorería boutique.",
        "Cadenas grandes (Hipermaxi, IC Norte) podrían escalar su sección de vinos premium con poco esfuerzo si ven que el segmento crece.",
        "Restaurantes con chef-sommelier pueden añadir wine shop adjunto a su local.",
      ],
      estrategia: "Construir activos defensivos rápido: relación exclusiva con bodegas tarijeñas (asignación especial, etiquetas single-lot exclusivas), comunidad de clubes de vino, reputación de Camila como sommelier referente. Año 1 = velocidad sobre perfección.",
    },
    sustitutos: {
      intensidad: "alto",
      justificacion: [
        "Vinos importados (Argentina, Chile) son sustituto directo y dominan la percepción de calidad. Es el sustituto más importante.",
        "Cerveza craft (Saya, Stier, El Tabique) ha crecido fuerte como bebida 'sofisticada' alternativa.",
        "Whisky y gin premium siguen siendo regalos corporativos competitivos.",
      ],
      estrategia: "El vino tarijeño debe vencer al argentino en cata ciega y en relación precio-calidad (Bs/punto Vivino). Camila como sommelier construye la narrativa: no 'compre boliviano por patriotismo' sino 'pruebe y compare, va a sorprenderse'.",
    },
    poder_proveedores: {
      intensidad: "bajo",
      justificacion: [
        "Las bodegas tarijeñas premium están interesadas en colocar producto en Santa Cruz, el mercado más grande del país.",
        "Camila puede negociar asignación de etiquetas reserva y exclusividad para Santa Cruz en líneas específicas.",
        "Existen 8-12 bodegas relevantes; portafolio diversificado anula dependencia de cualquiera.",
      ],
      estrategia: "Negociar con 3-4 bodegas ancla (Aranjuez, Campos de Solana, Kohlberg, Sausini) acuerdos de etiquetas exclusivas o asignación prioritaria a cambio de volumen mínimo mensual. Mantener 4-6 bodegas secundarias para variedad.",
    },
    poder_clientes: {
      intensidad: "medio",
      justificacion: [
        "El cliente de Equipetrol tiene poder adquisitivo y opciones, pero también es leal cuando encuentra un especialista que confía.",
        "El segmento premium valora la recomendación experta sobre el precio mínimo.",
        "Los clientes pueden ir a supermercado por etiquetas conocidas si Tierra Alta no compite en accesibilidad.",
      ],
      estrategia: "Convertir tráfico en clientes recurrentes con programa de membresía. Membresía da: 8% descuento, eventos privados, acceso anticipado a etiquetas reserva. Objetivo 200 socios año 1 = base estable de facturación.",
    },
    atractivo_sector: 3,
    conclusion: "Sector medianamente atractivo: la demanda crece rápido y hay vientos de cola favorables (devaluación, consumo per cápita), pero hay tres amenazas concretas: vinos importados como sustitutos, riesgo de entrada de cadenas grandes, y sesgo cultural contra origen boliviano. La estrategia ganadora es ser la primera y más especializada licorería tarijeña antes de que el segmento se masifique.",
  },
  mpc: {
    factores: [
      { nombre: "Curaduría y selección especializada", peso: 0.20 },
      { nombre: "Servicio de sommelier / asesoría", peso: 0.20 },
      { nombre: "Precio competitivo", peso: 0.15 },
      { nombre: "Variedad de etiquetas", peso: 0.15 },
      { nombre: "Experiencia en tienda (ambiente, cata)", peso: 0.15 },
      { nombre: "Canales (físico + delivery + online)", peso: 0.15 },
    ],
    competidores: [
      {
        nombre: "Tierra Alta Wines (Camila, proyecto)",
        notas: [4, 4, 3, 2, 3, 3],
        total_ponderado: 3.25,
      },
      {
        nombre: "La Bodega Wine Bar (Equipetrol)",
        notas: [3, 3, 3, 4, 4, 3],
        total_ponderado: 3.30,
      },
      {
        nombre: "Vinoteca Boliviana (Centro)",
        notas: [3, 2, 3, 4, 2, 2],
        total_ponderado: 2.65,
      },
      {
        nombre: "Hipermaxi sección gourmet",
        notas: [2, 1, 4, 3, 2, 4],
        total_ponderado: 2.55,
      },
    ],
    conclusion: "Tierra Alta empata virtualmente con La Bodega Wine Bar (3,25 vs 3,30) y supera ampliamente a Vinoteca Boliviana e Hipermaxi. Los factores donde gana: curaduría especializada (tarijeña) y servicio sommelier (Camila certificada WSET). Los factores donde pierde: variedad inicial (solo tarijeño + 10% selección argentina/chilena premium = menos catálogo) y experiencia/ambiente (un local recién montado vs uno con 4 años de historia). Plan año 2: invertir en ambiente y eventos para superar a La Bodega en experiencia.",
  },
  foda: {
    fortalezas: [
      "Camila certificada WSET nivel 2 + EAS Argentina = credibilidad técnica única en Santa Cruz; menos de 8 sommeliers con ese nivel en la ciudad.",
      "Local sin alquiler 8 meses + descuento 36% post-período de gracia (USD 900 vs USD 1.400 mercado).",
      "Capital propio Bs 280.000 sin deuda — flexibilidad operativa primer año.",
      "Red personal: 80+ contactos profesionales 30-50 años que son segmento objetivo (compañeros UNB, ex-pareja médico, círculo familiar empresarial).",
      "Conexión personal con propietarios de 3 bodegas tarijeñas (Sausini, Campos de Solana asistente) por visitas previas durante formación.",
      "Idioma inglés fluido — abre eventos para extranjeros residentes y turistas (3.000+ extranjeros viven en Santa Cruz).",
    ],
    oportunidades: [
      "Consumo per cápita de vino casi se duplicó en 5 años (1,8 a 3,1 L).",
      "Devaluación cierra el gap de precio con importados — primera vez que tarijeño compite cabeza a cabeza.",
      "Ninguna licorería en Santa Cruz se especializa en vino tarijeño — espacio competitivo libre.",
      "Bodegas tarijeñas buscan canales sofisticados en Santa Cruz que comuniquen calidad.",
      "Tendencia ESG/origen sostenible favorece vino de altura y producción local.",
    ],
    debilidades: [
      "Sin experiencia previa en gestión de retail propio — Camila viene de operación en bodega y sommelier en restaurante, no de negocio propio.",
      "Variedad inicial limitada: 80 etiquetas tarijeñas + 30 selección, vs competidores con 300+ etiquetas.",
      "Sin equipo: arranca sola con asistente part-time. Vulnerable a enfermedad/ausencia.",
      "Capital limitado para marketing primer año (presupuesto Bs 18.000 vs cadenas grandes con Bs 80.000+).",
      "Marca nueva sin reconocimiento — toma 6-9 meses construir tráfico físico recurrente.",
    ],
    amenazas: [
      "Sesgo cultural contra vino boliviano (64% según ANIV) — barrera psicológica fuerte.",
      "Vinos importados argentinos/chilenos siguen siendo opción aspiracional por inercia cultural.",
      "Cadenas grandes (Hipermaxi, IC Norte) podrían lanzar línea premium de vinos tarijeños con escala mayor.",
      "Reunificación cambiaria abrupta volvería a hacer importados más competitivos en precio.",
      "Bloqueos viales La Paz-Santa Cruz pueden cortar abastecimiento (las bodegas tarijeñas pasan por Cochabamba).",
    ],
  },
  foda_cruzado: {
    fo: [
      "Aprovechar certificación WSET de Camila + ola consumo de vino post-pandemia para posicionar Tierra Alta como referente de cata profesional en Santa Cruz (eventos mensuales, contenido educativo en redes).",
      "Cerrar acuerdos de etiquetas exclusivas con Sausini y Campos de Solana usando red personal de Camila — productos únicos que ningún competidor ofrece.",
      "Usar el ahorro en alquiler los primeros 8 meses para invertir agresivamente en ambiente premium (decoración, mobiliario, sistema de iluminación tipo bodega) que diferencie experiencia.",
    ],
    do: [
      "Capacitar 1 asistente part-time (Bs 2.400/mes) en fundamentos de vino con curso online WSET nivel 1 para extender cobertura horaria sin contratar segundo sommelier costoso.",
      "Limitar deliberadamente la variedad inicial (80 tarijeñas + 30 selección complementaria) y comunicarlo como decisión curatorial — '80 etiquetas escogidas vs 400 amontonadas' es posicionamiento, no debilidad.",
      "Aplicar a Banco Sol crédito para emprendedores (Bs 50.000 a 24 meses, 14% anual) en mes 9 si la facturación inicial valida modelo — capital ampliado sin riesgo prematuro.",
    ],
    fa: [
      "Construir programa de membresía con 200 socios año 1 que cree comunidad y switching cost — defensa contra cadenas grandes que entren con catálogo amplio sin servicio.",
      "Diversificar abastecimiento: contratos con 3 bodegas ancla + 4-5 secundarias, mantener 60 días de inventario crítico para amortiguar bloqueos.",
      "Eventos de cata ciega tarijeño-vs-argentino como herramienta sistemática contra el sesgo de origen — el cliente decide a ciegas, queda convencido.",
    ],
    da: [
      "No competir en precio mínimo vs supermercados — los vinos básicos de Bs 65-90 NO entran al catálogo. Ticket mínimo Bs 95.",
      "No expandir variedad por presión inicial — mantener disciplina de 80 etiquetas tarijeñas premium hasta que la marca esté consolidada (12+ meses).",
      "No abrir segunda sucursal hasta validar modelo año 1 — el peligro es diluir el foco antes de tener tracción.",
    ],
  },
  matriz_nivel3: {
    tipo: "BCG",
    posicion: "Cartera segmentada: Estrella (premium tarijeño) + Vaca Lechera (gama media) + Interrogante (membresía/eventos)",
    justificacion: "El portafolio de Tierra Alta visto como BCG: (1) Vinos tarijeños reserva (Bs 180-380/botella) = ESTRELLA porque mercado crece >7% anual y Tierra Alta puede ganar cuota alta del segmento por especialización. (2) Vinos tarijeños gama media (Bs 95-160) = VACA LECHERA porque genera volumen estable con menor margen pero rotación rápida. (3) Eventos de cata y club por suscripción = INTERROGANTE — alto potencial pero requiere validar antes de invertir más. (4) Selección argentina/chilena complementaria = PERRO menor que se mantiene solo para no perder clientes que quieren ambos en una sola visita.",
    implicacion: "Asignación recursos: 50% inventario en Estrella (esta es la diferenciación), 30% en Vaca Lechera (esto paga el alquiler), 15% en Interrogante (validar membresía año 1), 5% en Perro (selección curada complementaria sin invertir más). El catálogo NO debe parecerse al de un supermercado.",
  },
  mcpe: {
    factores: [
      { nombre: "Consumo de vino crece 70% post-pandemia", peso: 0.15 },
      { nombre: "Capital limitado Bs 280k", peso: 0.15 },
      { nombre: "Camila experta sommelier (fortaleza)", peso: 0.15 },
      { nombre: "Sesgo contra vino boliviano (amenaza)", peso: 0.15 },
      { nombre: "Equipetrol ticket medio alto (oportunidad)", peso: 0.10 },
      { nombre: "Sin equipo de gestión (debilidad)", peso: 0.10 },
      { nombre: "Devaluación encarece importados (oportunidad)", peso: 0.10 },
      { nombre: "Riesgo de cadenas grandes entrar (amenaza)", peso: 0.10 },
    ],
    filas: [
      {
        estrategia: "Tienda física + delivery (modelo retail clásico boutique)",
        notas: [4, 3, 3, 3, 4, 3, 4, 3],
        total: 3.35,
      },
      {
        estrategia: "Club de vino por suscripción (3 botellas/mes con curaduría)",
        notas: [3, 4, 4, 4, 3, 4, 3, 4],
        total: 3.65,
      },
      {
        estrategia: "Wine bar con cata diaria + venta de botella (tipo enoteca)",
        notas: [4, 2, 4, 2, 4, 2, 3, 2],
        total: 2.90,
      },
    ],
    estrategia_elegida: "Club de vino por suscripción (3 botellas/mes con curaduría)",
    justificacion: "El club por suscripción ganó por tres razones cuantificadas: (1) consume menos capital de trabajo porque opera con pre-venta vs inventario amplio, atacando la debilidad de capital limitado, (2) Camila curando 3 botellas/mes para 100-200 socios apalanca su expertise sin requerir presencia continua en tienda física, (3) la membresía construye relación profunda con cada cliente, atacando el sesgo cultural por exposición educativa repetida. El wine bar requiere licencia adicional, equipo de servicio y horario nocturno que multiplica la complejidad operativa para una empresaria sola. La tienda física tradicional funciona pero deja a Tierra Alta indiferenciable de las 3 licorerías existentes. PERO ATENCIÓN: la estrategia ganadora se ejecuta SIMULTÁNEAMENTE con un local físico que sirve de showroom y punto de entrega del club — no es club 'puro online'.",
  },
  plan_accion: [
    "Mes 1-2: Registrar Tierra Alta Wines SRL en FUNDEMPRESA (Bs 1.890). NIT activado. Solicitar licencia municipal GAM SCZ y SEDES (Bs 7.000, plazo 90 días). Sitio web básico con catálogo.",
    "Mes 2-3: Negociar acuerdos con 4 bodegas ancla tarijeñas (Aranjuez, Campos de Solana, Sausini, Kohlberg). Cerrar exclusividad SCZ en 8-12 etiquetas reserva. Crédito 60 días por volumen mínimo Bs 8.000/mes.",
    "Mes 3: Acondicionamiento del local en San Martín (mobiliario madera, sistema iluminación bodega, climatización 16°C, vitrinas, mesa de cata). Inversión Bs 65.000.",
    "Mes 3-4: Cargar inventario inicial 110 etiquetas (80 tarijeñas + 30 selección complementaria) — inversión Bs 95.000 con crédito 60 días.",
    "Mes 4: Lanzamiento soft con evento de cata gratuita para 60 invitados de red personal de Camila. Apertura formal con cobertura prensa local.",
    "Mes 5: Lanzar Club Tierra Alta (3 botellas/mes curadas por Camila a Bs 280-380/mes según tier). Meta primer trimestre: 60 socios. PedidosYa Market activo.",
    "Mes 6-8: Eventos mensuales de cata: cata ciega tarijeño vs argentino, vertical de Tannat, vertical de Singani Aranjuez. Cada evento 25 personas, costo Bs 80/persona (con vino + tapas).",
    "Mes 9-10: Programa de regalos corporativos: cajas curadas de 3-6 botellas para empresas de Equipetrol (oficinas legales, contadoras, clínicas). Inicial: 8-12 empresas.",
    "Mes 11-12: Evaluación año 1. Métricas objetivo: 200 socios club, Bs 850.000 facturación anual, 25-30% margen bruto, 40% facturación recurrente (club + corporativo).",
    "Año 2: Apertura segundo local o expansión a Cochabamba SOLO si el modelo se validó en SCZ. Considerar bartender certificado adicional para activar wine bar nocturno los fines de semana.",
  ],
  conclusion: "Tierra Alta Wines tiene una ventana competitiva clara pero estrecha: 18-24 meses antes de que cadenas grandes o nuevos competidores reaccionen al crecimiento del segmento. Las tres condiciones de éxito son disciplina en el foco (vino tarijeño, no genérico), credibilidad técnica (Camila visible como sommelier en eventos y contenido), y construcción de comunidad recurrente (Club Tierra Alta). Si Camila ejecuta el club por suscripción con tienda física como showroom — sin caer en wine bar prematuro ni en expansión de catálogo — el negocio puede llegar a Bs 1,5-2,0M facturación anual al año 3 con planilla de 4-5 personas. Si pierde foco para parecerse a competidores genéricos, se diluye en un mercado donde ya tiene tres alternativas con más historia.",
  lecciones: [
    "En un mercado en crecimiento rápido con sesgo cultural, la EDUCACIÓN del consumidor (catas, contenido) no es marketing, es la operación principal del negocio.",
    "La devaluación es un viento de cola temporal — aprovecharla para ganar cuota AHORA antes de que el competidor importado se reposicione o el tipo de cambio se reunifique.",
    "Especialización temática (80 etiquetas tarijeñas) puede ser estrategia ganadora frente a competidores genéricos con catálogo amplio. La pregunta no es 'cuánto tengo' sino 'qué historia cuento'.",
    "El club por suscripción es un modelo ideal cuando se combinan: capital limitado + experto identificable + necesidad de educar consumidor. Atrapa los tres problemas con un mismo formato.",
    "En licorerías premium, el local físico no es 'punto de venta' sino 'showroom-laboratorio-experiencia'. La venta puede pasar por delivery o suscripción; el local justifica el premium.",
  ],
  errores_evitados: [
    "No abrir wine bar con servicio nocturno desde el día 1 — multiplica complejidad operativa para Camila sola y requiere otra licencia.",
    "No competir en gama económica (Bs 65-85) contra supermercados — destruye el posicionamiento premium.",
    "No comprar inventario de 300+ etiquetas para 'tener variedad' — diluye foco y consume capital de trabajo crítico.",
    "No depender del tráfico físico exclusivamente — activar Club y delivery PedidosYa desde mes 5 para construir base recurrente.",
    "No expandir a segunda ciudad en año 1 — el foco operativo y de marca debe consolidarse en una sede antes de replicar.",
  ],
  tags: ["retail-especializado", "vinos", "Santa-Cruz", "Equipetrol", "premium", "BCG-cartera", "club-suscripcion", "intermedio"],
};
