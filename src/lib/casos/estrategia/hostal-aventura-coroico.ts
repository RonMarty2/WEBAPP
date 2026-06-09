import type { CasoEstrategia } from "../types";

/**
 * Caso 5 — Análisis estratégico para la transformación de una
 * hostería familiar en Coroico hacia un hostal-experience de turismo
 * aventura dirigido a viajeros extranjeros.
 *
 * Caso **avanzado**: PESTEL con turismo post-pandemia y tipo de
 * cambio, Porter con Airbnb como sustituto, MPC contra hostales
 * establecidos, FODA donde el idioma y la red europea son
 * fortalezas, matriz PEYEA (posición competitiva fuerte + entorno
 * favorable = estrategia agresiva), MCPE evalúa 3 paquetes turísticos.
 */

export const casoHostalAventuraCoroico: CasoEstrategia = {
  slug: "hostal-aventura-coroico",
  modulo: "estrategia",
  titulo: "Hostal-experience de turismo aventura en Coroico",
  tagline: "Reconversión de hostería familiar en hub de aventura (downhill + senderismo + cacao) para viajeros europeos en Yungas.",
  zona: "Coroico (Yungas, La Paz)",
  rubro: "Turismo / hostelería + experiencias",
  dificultad: "avanzado",
  emoji: "🏞️",
  emprendedor: {
    nombre: "Pablo Aliaga y Mathilde Janssens",
    edad: 36,
    rol: "Pablo Aliaga (36), ex-guía de turismo aventura UMSA (2012), 9 años guiando rutas en el Camino de la Muerte y rutas a Caranavi para operadores como Gravity Bolivia y Vertigo Biking. Casado desde 2022 con Mathilde Janssens (33), belga, fotógrafa de viajes con red europea de 14k seguidores en Instagram y contactos con 4 turoperadores en Bruselas y Amberes.",
  },
  contexto: [
    "La hostería 'La Casa del Río' está en una propiedad familiar de Pablo en Coroico, en la carretera a las Pozas de Vagantes, con vista al valle. La construyó su padre en 1998 para hospedar a familia paceña que iba a pasar fines de semana. Tiene 8 habitaciones (capacidad 22 personas), 2 baños compartidos, comedor común, piscina pequeña y jardín de 1.800 m². Hasta 2019 facturaba Bs 4.500/mes de promedio con ocupación 18-25% (familias paceñas en fines de semana largos).",
    "La pandemia 2020-2021 cerró la hostería 14 meses; cuando reabrió, el modelo familiar no se recuperó. Las familias paceñas que iban a Coroico migraron a Tarija, Samaipata o salieron del país. Pero Pablo notó que el segmento extranjero (mochileros europeos en ruta La Paz-Rurrenabaque, ciclistas que bajan el Camino de la Muerte, parejas en luna de miel exótica) creció. Hoy Coroico recibe 40% más turistas extranjeros que en 2019 según el SERNAP regional, aunque turismo nacional sigue debajo de 2019.",
    "Pablo y Mathilde quieren reconvertir 'La Casa del Río' en 'Yungas Wild Lodge': un hostal-experience donde el alojamiento es parte de un paquete que incluye tours de aventura (downhill Camino de la Muerte, senderismo Pozas de Vagantes, ruta del cacao en Caranavi), gastronomía local (cena con productos del valle, talleres de cacao) y experiencia cultural (visita a comunidades cocaleras). Capital propio: USD 28.000. Inversión necesaria: USD 65.000. La pregunta estratégica: ¿qué paquetes diseñar, qué precios, cómo posicionarse contra Airbnb y contra otros hostales de Coroico?",
  ],
  problema: "Coroico tiene oferta abundante de alojamiento básico y demanda creciente de extranjeros que buscan 'experiencia', no solo cama; la pareja debe posicionar Yungas Wild Lodge como hub de aventura sin caer en guerra de precios contra Airbnb ni quedar invisible para los turoperadores europeos.",
  segmento: "Turistas extranjeros 25-45 años, mochileros de medio-largo recorrido (Bolivia + Perú o Bolivia + Argentina), parejas en luna de miel exótica, ciclistas internacionales del Camino de la Muerte, presupuesto USD 35-75/persona/noche con paquete, principalmente europeos (Bélgica, Países Bajos, Alemania, Francia) y norteamericanos.",
  pestel: {
    politico: [
      {
        nombre: "Política turística boliviana post-pandemia",
        descripcion: "El Ministerio de Culturas y Turismo retomó campañas internacionales en 2023 (Bolivia te Espera). Visado online para 96 nacionalidades. ProBolivia con presupuesto modesto para participar en ferias internacionales (FITUR Madrid, ITB Berlín).",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Aprovechar campaña institucional para visibilidad. Postular a programa de turismo aventura promocionado por SERNAP Yungas para inclusión en catálogos oficiales.",
      },
      {
        nombre: "Estabilidad política y percepción de seguridad",
        descripcion: "Bolivia tuvo episodios de inestabilidad social en 2019 y 2024 que generaron alertas de viaje en cancillerías europeas. Hoy nivel de alerta es 'normal con precauciones' en la mayoría de países UE. Departamentos de viajes recomiendan evitar bloqueos.",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Mantener comunicación clara con huéspedes vía WhatsApp si hay bloqueos en ruta La Paz-Coroico. Tener plan B con ruta alternativa por Caranavi.",
      },
      {
        nombre: "Conflictividad social en Yungas (cocaleros, transportistas)",
        descripcion: "La carretera La Paz-Coroico (Yungas Highway) sufre bloqueos esporádicos por demandas de cocaleros de los Yungas o transportistas. Promedio 6-12 días/año bloqueado. La carretera vieja (Camino de la Muerte) está cerrada al tránsito general.",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Mantener stock de víveres para 5 días en caso de bloqueo prolongado. Comunicación proactiva con huéspedes ya reservados si hay riesgo de bloqueo.",
      },
    ],
    economico: [
      {
        nombre: "Devaluación del boliviano y ventaja para turistas con USD/EUR",
        descripcion: "Tipo paralelo Bs 12-14 en 2026. Para un turista europeo, Bolivia se volvió ~45% más barata en EUR entre 2022-2026. Una noche que costaba USD 22 hoy se ofrece en USD 18-20 con misma calidad.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Es viento de cola estructural. Bolivia es hoy el destino sudamericano con mejor relación precio-experiencia para europeos. Aprovechar antes que se reunifique tipo de cambio o que otros destinos devalúen.",
      },
      {
        nombre: "Crecimiento del turismo aventura mundial",
        descripcion: "Mercado global de turismo aventura crece 13% anual según ATTA (Adventure Travel Trade Association). Sudamérica capta 18% del mercado mundial. Bolivia tiene 1,2% pero crece 22% anual.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Coroico y Yungas están en el corazón geográfico del turismo aventura sudamericano. Posición geográfica privilegiada para captar la ola.",
      },
      {
        nombre: "Costo de cooperación con turoperadores europeos",
        descripcion: "Turoperadores europeos (Tucan Travel, Intrepid, G Adventures) trabajan con comisiones 18-25% sobre tarifa neta. Cierran contratos en EUR con pagos a 30-60 días post-servicio.",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "Es la vía más rentable a largo plazo pero requiere capital de trabajo (servir hoy, cobrar en 60 días). Mathilde tiene 4 contactos directos para acelerar contratos.",
      },
    ],
    social: [
      {
        nombre: "Tendencia 'experience-first' en viajeros millennials/gen Z",
        descripcion: "Encuestas de Booking.com (2025): 74% de viajeros 25-40 años prefieren 'experiencias' sobre 'destino'. Buscan storytelling, autenticidad, conexión con cultura local. Pagan 25-40% más por experiencia integrada.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Confirma la apuesta por paquetes integrados (alojamiento + tour + gastronomía + cultura) vs alojamiento simple. El extra-pago justifica la inversión en experiencia.",
      },
      {
        nombre: "Auge de fotografía de viajes en Instagram/TikTok",
        descripcion: "Yungas es 'instagrameable' (paisaje verde, cascadas, café/cacao, biodiversidad). Hashtags #Coroico, #YungasBolivia tienen 480k posts (combinados). Crecen 20% anual.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Mathilde como fotógrafa profesional puede generar contenido propio que multiplica reputación visual del lodge. Invitar 6-8 micro-influencers/año (50-200k seguidores) con estadía gratuita.",
      },
      {
        nombre: "Concientización ambiental y turismo responsable",
        descripcion: "Viajeros europeos jóvenes priorizan operadores con certificación ambiental, prácticas sostenibles, contratación local. Booking.com permite filtrar por 'Sustainable Travel'.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Aplicar a certificación 'Travelife' o 'Rainforest Alliance' (USD 1.500-3.000) y mostrar prácticas concretas: empleo 100% local, alimentación de productores del valle, gestión de residuos.",
      },
    ],
    tecnologico: [
      {
        nombre: "Plataformas de reserva (Booking, Hostelworld, Airbnb)",
        descripcion: "Booking.com domina hospedaje formal (60% reservas internacionales en Bolivia). Hostelworld lidera mochileros. Airbnb crece rápido en Coroico (cinco veces más listings en 2025 vs 2020). Comisiones 12-18% (Booking) y 14-17% (Hostelworld).",
        impacto: "neutro",
        intensidad: 4,
        implicacion: "Estar en Booking y Hostelworld desde día 1. Airbnb a evaluar año 2 (es más para alojamiento, menos para experience). Web propia para reserva directa con descuento 8%.",
      },
      {
        nombre: "Internet y conectividad en Yungas",
        descripcion: "Coroico tiene fibra óptica desde 2022 (Entel + Tigo). Velocidad estable 30-80 Mbps. Algunas zonas rurales (camino a Pozas) sin señal. Eltel viejo cubre comunidades. Llamadas internacionales por WhatsApp / WiFi viables.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Garantizar wifi de calidad (mínimo 50 Mbps) en lodge y áreas comunes. Es factor crítico para huéspedes europeos: bueno o malo se difunde rápido en reseñas Tripadvisor.",
      },
      {
        nombre: "Sistemas PMS (Property Management System)",
        descripcion: "Sistemas como Cloudbeds, Sirvoy y Little Hotelier (Bs 350-800/mes) sincronizan Booking + Hostelworld + Airbnb + web propia. Gestión de overbookings, reportes, calendario unificado.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Implementar PMS desde el inicio (Little Hotelier Bs 420/mes). Ahorra 5-8 horas/semana en gestión y previene overbookings que destruyen reputación.",
      },
    ],
    ecologico: [
      {
        nombre: "Biodiversidad y atractivo natural de Yungas",
        descripcion: "Yungas es zona de transición Andes-Amazonía, con biodiversidad alta (300+ especies de aves). Es Patrimonio Natural reconocido por SERNAP. Atractivo central para ecoturismo.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "La biodiversidad es activo intangible. Diseñar tours con guías ornitólogos locales y senderos en bosque nublado. Componente educativo en cada experiencia.",
      },
      {
        nombre: "Vulnerabilidad por cambio climático y deslizamientos",
        descripcion: "Yungas tiene historial de deslizamientos en época de lluvias (noviembre-marzo). En 2024 hubo 14 puntos críticos en ruta La Paz-Coroico. Riesgo creciente con eventos climáticos extremos.",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Comunicar honestamente la estacionalidad. Diseñar paquetes 'mojado' para baja temporada (más senderismo bosque + cacao + gastronomía, menos downhill) para no depender solo del clima seco.",
      },
    ],
    legal: [
      {
        nombre: "Registro como establecimiento turístico (Ministerio Culturas y Turismo)",
        descripcion: "Todo hospedaje formal debe registrarse en el Registro Único de Turismo (RUT) del MinTur. Categorización por estrellas (1-5) o por tipo (hostal, eco-lodge, etc.). Inspección + cuota anual Bs 1.800-3.500 según categoría.",
        impacto: "neutro",
        intensidad: 4,
        implicacion: "Registrar como 'Eco-Lodge categoría 2 estrellas' inicialmente, con plan de upgrade a 3 estrellas año 2 cuando se completen mejoras. Sin RUT no se factura formalmente.",
      },
      {
        nombre: "Licencias para tours de aventura",
        descripcion: "Operar tours de downhill, trekking y aventura requiere registro como 'Operador de Turismo Receptivo' en MinTur + seguros obligatorios para huéspedes (póliza accidentes USD 2.500/persona, cobertura USD 50.000/evento). Guías deben tener certificación AGUIBOL o AGMTB.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Pablo ya tiene certificación AGMTB. Tramitar registro como operador (Bs 5.500). Contratar seguros con Alianza Vida o La Vitalicia (~USD 1.800/año por póliza grupo 22 personas).",
      },
      {
        nombre: "Régimen tributario y facturación a extranjeros",
        descripcion: "Establecimiento turístico bajo Régimen General con NIT. IVA 13% incluido en tarifa publicada. Para clientes extranjeros con factura, no hay devolución IVA en Bolivia (a diferencia de Argentina).",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "Contratar contador externo desde mes 1 (Bs 850/mes). Régimen General permite descargar IVA de proveedores (combustible para van, alimentos, materiales) y mantener reportes claros para turoperadores.",
      },
    ],
  },
  porter: {
    rivalidad: {
      intensidad: "medio",
      justificacion: [
        "En Coroico hay ~45 establecimientos formales (hoteles + hostales + lodges). De estos, solo 6-8 apuntan al segmento extranjero premium (Sol y Luna, Esmeralda, Hostal Bella Vista).",
        "Los hostales clásicos (Hostal Kory, La Senda Verde no compite directo pero está cerca) no incluyen paquetes de aventura — venden solo cama.",
        "Diferenciación posible por concepto 'experience' (alojamiento + tours + gastronomía).",
      ],
      estrategia: "Posicionarse como 'lodge de aventura' en lugar de 'hotel familiar' o 'hostel mochilero'. La intersección 'comfort + aventura curada + foto Instagram' es nicho diferenciado.",
    },
    nuevos_entrantes: {
      intensidad: "medio",
      justificacion: [
        "Capital requerido USD 50-80k para acondicionar y operar 1-2 años. Barrera moderada.",
        "La barrera real es la red comercial: cerrar contratos con turoperadores europeos toma 18-24 meses y participar en 2-3 ferias internacionales.",
        "Airbnb baja la barrera para particulares: cualquiera puede listar su casa con poca inversión.",
      ],
      estrategia: "Construir activos defensivos rápido: contratos con turoperadores europeos vía red de Mathilde, marca visual coherente, certificaciones de sostenibilidad. Año 1 = velocidad para ocupar el nicho antes de que otro lo replique.",
    },
    sustitutos: {
      intensidad: "alto",
      justificacion: [
        "Airbnb es sustituto directo para alojamiento. Coroico tiene 280+ listings Airbnb en 2025 (vs 55 en 2020).",
        "Hostales económicos para mochileros (Hostal Kory, Sol Andino) sirven el bottom price del mercado.",
        "Otros destinos competidores: Sorata, Caranavi, Madidi y Rurrenabaque son alternativas para el mismo turista.",
      ],
      estrategia: "Diferenciarse de Airbnb (que vende cuarto, no experiencia) con paquetes integrados. Diferenciarse de hostales con confort y curaduría. Diferenciarse de otros destinos con propuesta Yungas única (cacao + downhill + bosque nublado).",
    },
    poder_proveedores: {
      intensidad: "bajo",
      justificacion: [
        "Proveedores de comida (productores locales del valle): muchos, sin poder individual.",
        "Bicicletas para tours: 3 talleres en Coroico, fácil rotación.",
        "Vehículos: Pablo tiene contacto con conductor van que puede ser exclusivo o turnos.",
      ],
      estrategia: "Construir relación de largo plazo con 4-5 productores locales (café, cacao, frutas, queso) que se conviertan en parte del storytelling. Contrato anual con taller para mantenimiento de bicicletas.",
    },
    poder_clientes: {
      intensidad: "medio",
      justificacion: [
        "Turoperadores europeos: clientes B2B con poder alto (volumen + condiciones de pago).",
        "Turistas directos: poder bajo individualmente pero muy reactivos a reseñas Tripadvisor / Booking.",
        "Mochileros price-sensitive comparan precios rápido.",
      ],
      estrategia: "Cartera diversificada: 40% turoperadores, 40% reservas directas (web propia + Instagram), 20% Booking/Hostelworld. No depender de un solo canal. Mantener score Booking >8,5 como compromiso operativo.",
    },
    atractivo_sector: 4,
    conclusion: "Sector atractivo en alto grado: demanda creciente, devaluación favorable, fragmentación que deja espacio para diferenciación. La rivalidad existe pero hay nichos vacíos (lodge + experience). Las amenazas (Airbnb, otros destinos) se neutralizan con propuesta integrada y posicionamiento claro. Es un mercado donde Pablo y Mathilde tienen una combinación inusual de activos (saber-hacer local + red europea + idioma) que pocos competidores pueden igualar.",
  },
  mpc: {
    factores: [
      { nombre: "Diversidad de experiencias incluidas en paquete", peso: 0.20 },
      { nombre: "Calidad de alojamiento (comfort, limpieza)", peso: 0.15 },
      { nombre: "Idioma de personal (inglés + francés)", peso: 0.15 },
      { nombre: "Presencia online (web, redes, reseñas)", peso: 0.15 },
      { nombre: "Precio por noche (con o sin paquete)", peso: 0.15 },
      { nombre: "Ubicación / vistas / contexto natural", peso: 0.10 },
      { nombre: "Certificación sostenibilidad", peso: 0.10 },
    ],
    competidores: [
      {
        nombre: "Yungas Wild Lodge (Pablo + Mathilde, proyecto)",
        notas: [4, 3, 4, 4, 3, 4, 3],
        total_ponderado: 3.60,
      },
      {
        nombre: "Sol y Luna Lodge (establecido, premium)",
        notas: [3, 4, 3, 3, 2, 4, 3],
        total_ponderado: 3.10,
      },
      {
        nombre: "Hostal Esmeralda (hostal mochilero tradicional)",
        notas: [2, 3, 3, 3, 4, 4, 2],
        total_ponderado: 2.95,
      },
      {
        nombre: "Hostal Bella Vista (B&B familiar tradicional)",
        notas: [1, 3, 2, 2, 3, 4, 1],
        total_ponderado: 2.20,
      },
    ],
    conclusion: "Yungas Wild Lodge proyectado lidera con 3,60 puntos, superando incluso a Sol y Luna (3,10). Sus ventajas clave son: paquete integrado (no solo alojamiento), idiomas (Pablo: inglés conversacional + Mathilde: francés + neerlandés nativos), presencia online (red de Mathilde). Donde podría perder: precio (algo más caro que mochilero) y comfort físico (instalación más rústica vs Sol y Luna). Estrategia: año 1 invertir en comfort para subir nota de 3 a 4, lo que llevaría el total a 3,75 y consolidaría liderazgo del nicho.",
  },
  foda: {
    fortalezas: [
      "Pablo con 9 años de experiencia como guía + certificación AGMTB (Asociación Guías Montaña y Trekking Bolivia) — credibilidad técnica completa.",
      "Mathilde con red europea: 4 contactos directos en turoperadores (Bélgica, Países Bajos) + 14k seguidores Instagram fotografía de viajes.",
      "Propiedad familiar SIN alquiler — costo operativo significativamente menor que competidores.",
      "Trilingüismo: Pablo español + inglés B2; Mathilde francés + neerlandés + inglés C2 + español B2.",
      "Conocimiento profundo del territorio: Pablo conoce 40+ rutas, contactos con productores locales (cacao Caranavi, café Coroico, miel orgánica del valle).",
      "Capital propio USD 28k sin deuda inicial.",
      "Marca personal de Mathilde como fotógrafa genera contenido orgánico desde día 1.",
    ],
    oportunidades: [
      "Turismo extranjero a Coroico creció 40% post-pandemia.",
      "Devaluación del boliviano abarata Bolivia 45% para turistas con EUR/USD.",
      "Turismo aventura crece 22% anual en Bolivia.",
      "74% de viajeros 25-40 años prefieren 'experiencia' sobre 'destino'.",
      "Tendencia ESG/sostenibilidad favorece lodges con prácticas verdes.",
      "Yungas como Patrimonio Natural reconocido por SERNAP.",
    ],
    debilidades: [
      "Infraestructura física del lodge requiere upgrade: baños privados (hoy compartidos), aislamiento térmico, sistema de calentamiento agua mejorado (hoy con gas, falla en bloqueos).",
      "Sin experiencia previa de gestión hotelera formal (Pablo: guía; Mathilde: freelance). Aprenden mientras operan.",
      "Capital USD 28k es insuficiente para inversión completa USD 65k requerida; necesita financiamiento.",
      "Equipo inicial mínimo: Pablo + Mathilde + 1 cocinera + 1 ama de llaves. Sin redundancia ante enfermedad.",
      "Sin contratos cerrados con turoperadores en día 1 — la red de Mathilde existe pero los contratos toman 6-12 meses cerrar.",
      "Marca nueva sin track record en Booking/Tripadvisor — toma 4-8 meses construir reseñas suficientes para subir en ranking.",
    ],
    amenazas: [
      "Airbnb creciendo 5x en Coroico — bajaría precio promedio del mercado.",
      "Inestabilidad política o bloqueos en ruta La Paz-Coroico afectan reservas.",
      "Reunificación del tipo de cambio reduciría ventaja precio para turistas.",
      "Cambio climático aumenta deslizamientos en época de lluvias (nov-mar).",
      "Otros destinos sudamericanos compiten por el mismo turista (Perú, Argentina, Ecuador).",
      "Un accidente grave en un tour de aventura (downhill especialmente) puede destruir la marca y generar litigio.",
    ],
  },
  foda_cruzado: {
    fo: [
      "Capitalizar la red europea de Mathilde + tendencia turismo experiencia para cerrar 2-3 turoperadores europeos en mes 6-9 (objetivo: 30-40% de la ocupación viene de contratos B2B año 1).",
      "Aprovechar la propiedad familiar sin alquiler para invertir TODO el capital propio + préstamo en mejoras físicas y marketing, en lugar de pagos fijos.",
      "Usar fotografía profesional de Mathilde + Yungas instagrameable para construir presencia online superior a competidores: contenido propio + 6-8 invitaciones a influencers/año.",
    ],
    do: [
      "Aplicar préstamo BDP turismo (línea especial 9,5% anual) por USD 35.000 para cubrir gap de inversión (USD 65k requerido - USD 28k propio - USD 2k margen).",
      "Pablo y Mathilde toman curso intensivo Hospitality Management (Hotelería online, USD 480 ambos) durante 6 semanas antes de apertura.",
      "Mientras se construyen contratos con turoperadores (6-12 meses), abrir agresivamente canales individuales (Booking, Hostelworld, web propia con Stripe) para flujo inmediato.",
    ],
    fa: [
      "Diferenciarse de Airbnb con paquetes integrados — el cliente que compra paquete USD 220/3 noches no compara con un Airbnb USD 18/noche; está en otra categoría.",
      "Implementar seguro de cancelación flexible (devolución 90% hasta 7 días antes) para reducir riesgo de pérdida por bloqueos políticos.",
      "Diseñar paquete 'baja temporada lluviosa' que aprovecha bosque nublado y cacao en lugar de downhill, para evitar caída de ingresos nov-mar.",
    ],
    da: [
      "No competir en precio mínimo contra Airbnb — Yungas Wild Lodge se posiciona en USD 55-85/noche con paquete, jamás baja de USD 35/noche sin paquete.",
      "No invertir en lujo prematuro — mejoras a comfort razonable (baños privados, agua caliente confiable, wifi 50 Mbps) son suficientes año 1; el lujo viene año 2-3.",
      "No depender de un solo canal o turoperador — cartera: 40% B2B turoperadores, 40% directos web + Instagram, 20% OTAs (Booking/Hostelworld).",
    ],
  },
  matriz_nivel3: {
    tipo: "PEYEA",
    posicion: "Cuadrante Agresivo (fortaleza financiera alta + ventaja competitiva fuerte + entorno favorable)",
    justificacion: "En la matriz PEYEA (Posición Estratégica y Evaluación de la Acción), Yungas Wild Lodge se ubica en el cuadrante AGRESIVO porque: (1) Fortaleza financiera moderada-alta (USD 28k propios + acceso a préstamo + propiedad sin alquiler = costo fijo bajo), (2) Ventaja competitiva fuerte (red europea + trilingüismo + experiencia guía + propiedad propia, combinación que ningún competidor de Coroico tiene), (3) Fortaleza de la industria alta (turismo aventura crece 22% anual en Bolivia, 13% global), (4) Estabilidad del entorno moderada (devaluación favorable pero bloqueos y deslizamientos restan estabilidad).",
    implicacion: "Estrategia recomendada para cuadrante agresivo: PENETRAR el mercado y EXPANDIRSE. Acciones concretas: (a) invertir agresivamente en marketing año 1 para capturar cuota antes que entren más competidores, (b) escalar capacidad con planes de upgrade a 16 habitaciones año 3 si la demanda lo valida, (c) integración vertical hacia adelante: ofrecer transfer La Paz-Coroico como servicio integrado, (d) abrir segundo punto en Caranavi año 4 si Coroico está consolidado.",
  },
  mcpe: {
    factores: [
      { nombre: "Devaluación favorece turistas extranjeros", peso: 0.15 },
      { nombre: "Capital limitado USD 28k vs USD 65k requerido", peso: 0.15 },
      { nombre: "Red europea de Mathilde (fortaleza única)", peso: 0.15 },
      { nombre: "Crecimiento turismo aventura 22% (oportunidad)", peso: 0.15 },
      { nombre: "Airbnb en expansión (amenaza)", peso: 0.10 },
      { nombre: "Sin experiencia en gestión hotelera (debilidad)", peso: 0.10 },
      { nombre: "Pablo guía certificado AGMTB (fortaleza)", peso: 0.10 },
      { nombre: "Bloqueos viales y deslizamientos (amenaza)", peso: 0.10 },
    ],
    filas: [
      {
        estrategia: "Paquete 'Aventura Express 2 noches' (USD 195: 2 noches + downhill + cena + transfer)",
        notas: [4, 3, 3, 4, 3, 3, 4, 3],
        total: 3.40,
      },
      {
        estrategia: "Paquete 'Experience Yungas 4 noches' (USD 420: 4 noches + downhill + senderismo + ruta cacao + 3 cenas)",
        notas: [4, 3, 4, 4, 4, 3, 4, 3],
        total: 3.65,
      },
      {
        estrategia: "Paquete 'Honeymoon Aventura 5 noches' (USD 680: pareja + privacidad + experiencias premium + spa)",
        notas: [3, 2, 4, 4, 4, 2, 3, 3],
        total: 3.15,
      },
    ],
    estrategia_elegida: "Paquete 'Experience Yungas 4 noches' como ancla, complementado con paquete 'Aventura Express 2 noches' para mochileros",
    justificacion: "El paquete 'Experience Yungas 4 noches' ganó porque combina lo mejor de los dos extremos: aprovecha la red europea de Mathilde (turoperadores prefieren paquetes 3-5 noches para optimizar logística regional), encaja con el segmento experience-first dispuesto a pagar premium, integra todas las actividades que diferencian de Airbnb (downhill + senderismo + ruta cacao), y proporciona margen unitario suficiente (USD 420 con costo USD 220 = 47% margen) para amortizar inversión. El paquete Aventura Express se mantiene como ancla para mochileros que no se pueden comprometer 4 noches. El paquete Honeymoon requiere inversión en infraestructura premium (spa, suite privada con jacuzzi) que es prematura en año 1. Recomendación: ofrecer el paquete 4 noches como producto principal en web y a turoperadores, el 2 noches como gancho para mochileros y huéspedes individuales, y postergar Honeymoon a año 2-3 cuando la infraestructura esté consolidada.",
  },
  plan_accion: [
    "Mes 1-3: Renovación física del lodge — agregar 4 baños privados a habitaciones premium, instalar termo solar 300 L + boiler eléctrico backup, mejorar aislamiento térmico, actualizar wifi a fibra 80 Mbps. Inversión USD 32.000.",
    "Mes 2-3: Constituir Yungas Wild Lodge SRL en FUNDEMPRESA (Bs 1.890). NIT activado. Registro RUT MinTur (Bs 3.500). Registro Operador Turismo Receptivo (Bs 5.500). Aplicar préstamo BDP turismo USD 35.000.",
    "Mes 3-4: Pablo y Mathilde curso online Hospitality Management (USD 480 ambos). Contratar 1 cocinera local de Coroico (Bs 3.500/mes) + 1 ama de llaves (Bs 2.800/mes). Capacitar en estándares de hospedaje extranjero.",
    "Mes 4: Implementar PMS Little Hotelier (Bs 420/mes). Listar en Booking, Hostelworld, Airbnb. Sitio web propio con Stripe + WhatsApp Business + Instagram con feed coherente armado por Mathilde.",
    "Mes 5: Lanzamiento soft con 12 invitados de red de Pablo y Mathilde (familia, amigos cercanos) en estadía paga (50% descuento) para validar operación y obtener primeras 12 reseñas Booking + Tripadvisor.",
    "Mes 6: Apertura oficial. Lanzar paquete 'Experience Yungas 4 noches' (USD 420) y 'Aventura Express 2 noches' (USD 195). Comunicación intensiva en Instagram + email a contactos europeos.",
    "Mes 7-9: Mathilde viaja a Bruselas y Amberes (USD 2.400) para reuniones con 4 turoperadores objetivo. Llevar dossier técnico + propuesta comercial. Objetivo: 2 contratos cerrados.",
    "Mes 8-10: Implementar programa de invitación a 4 micro-influencers (50-200k seguidores) por trimestre. Inversión: USD 600/influencer (alojamiento + tours) a cambio de mínimo 5 posts + 1 reel.",
    "Mes 11-12: Evaluación año 1. Métricas objetivo: ocupación promedio 48% anual, facturación USD 105.000, margen neto 26-32%, score Booking >8,8, 2 contratos turoperadores firmados.",
    "Año 2: Aplicar certificación Travelife (USD 2.200) para diferenciación sostenibilidad. Considerar expansión a 12-16 habitaciones si ocupación supera 60%. Lanzar paquete Honeymoon premium.",
    "Año 3-4: Si Yungas Wild Lodge está consolidado, abrir segundo punto en Caranavi (ruta del cacao) como complemento del paquete principal.",
  ],
  conclusion: "Yungas Wild Lodge tiene una de las combinaciones más prometedoras del análisis estratégico: posición agresiva PEYEA, paquete diferenciado, red comercial pre-existente, propiedad sin alquiler, vientos de cola estructurales (devaluación + turismo experiencia + Yungas instagrameable). Las debilidades son resolubles con préstamo bien dirigido + curso operativo + ejecución disciplinada. Los riesgos (Airbnb, bloqueos, accidentes) se mitigan con paquetes integrados, seguros y diversificación de canales. Si Pablo y Mathilde ejecutan el plan año 1 sin sobrepasar el endeudamiento ni saltarse el periodo de prueba con primeros 12 huéspedes, el lodge puede facturar USD 105k año 1, USD 165k año 2 y USD 260k año 3, con potencial de replicar el modelo en Caranavi al año 4.",
  lecciones: [
    "La matriz PEYEA es la herramienta correcta cuando se debe decidir entre estrategia agresiva/competitiva/conservadora/defensiva. Aquí, las cuatro dimensiones (fortaleza financiera, ventaja competitiva, fortaleza industria, estabilidad entorno) convergieron en cuadrante agresivo, validando inversión y expansión.",
    "En turismo aventura, los activos más defendibles son: red comercial internacional + saber-hacer técnico local + idioma. Estos toman 5-10 años construir y no se compran rápido — son barrera real contra entrantes.",
    "Un paquete integrado de 4 noches genera margen 2,5x mayor que vender solo alojamiento, porque los servicios complementarios (tour, gastronomía, transfer) tienen margen 60-75% vs 35% del alojamiento puro. La integración no es opcional, es estructuralmente más rentable.",
    "Cuando el viento de cola es macroeconómico (devaluación + boom turismo aventura), la estrategia ganadora es velocidad de captura, no perfección. Ocupar el nicho antes que entren más competidores vale más que afinar cada detalle del producto.",
    "La fotografía profesional propia (Mathilde) es activo de marketing más poderoso que cualquier presupuesto pagado en publicidad. Una fotógrafa con red propia y contenido orgánico genera Instagram followers que ningún competidor con USD 3.000/mes en ads compra.",
  ],
  errores_evitados: [
    "No invertir el capital propio completo USD 28k antes de obtener el préstamo — mantener USD 6-8k de reserva operativa para 3-4 meses de gastos fijos en caso de baja temporada.",
    "No lanzar sin reseñas validadas — los primeros 12 huéspedes 'amigos' permiten construir score Booking >8,8 antes de abrir oficialmente.",
    "No depender solo de turoperadores — los contratos cierran lento (6-12 meses); canales individuales (web + Instagram + OTAs) generan caja inmediata.",
    "No sub-invertir en wifi y baños privados — son las dos quejas más comunes en reseñas de lodges Bolivia. Quien recorta ahí, pierde el score y por lo tanto el ranking.",
    "No expandir capacidad antes de validar año 1 con ocupación >50% — el peligro es duplicar habitaciones cuando el problema real es marketing, no oferta.",
  ],
  tags: ["turismo", "aventura", "Coroico", "Yungas", "PEYEA", "extranjeros", "experience-economy", "avanzado"],
};
