import type { CasoEstrategia } from "../types";

/**
 * Caso 1 — Análisis estratégico para una empresa exportadora de quinua
 * orgánica premium desde El Alto hacia mercados europeos.
 *
 * Caso **avanzado**: aterriza un PESTEL fuerte (tipo de cambio,
 * normativa UE 2018/848, certificación orgánica), un Porter con
 * competidores regionales reales (Perú lidera el continente) y una
 * matriz Ansoff de desarrollo de mercado. Útil para estudiantes que
 * apuntan a proyectos de exportación o cadenas agroindustriales.
 */

export const casoQuinuaExportElalto: CasoEstrategia = {
  slug: "quinua-export-elalto",
  modulo: "estrategia",
  titulo: "Exportación de quinua orgánica premium",
  tagline: "Plan estratégico para colocar quinua real orgánica boliviana en gourmet stores de Alemania y Países Bajos.",
  zona: "El Alto + Altiplano Norte (La Paz)",
  rubro: "Agroindustria / exportación",
  dificultad: "avanzado",
  emoji: "🌾",
  emprendedor: {
    nombre: "Esther Quispe",
    edad: 41,
    rol: "Ingeniera agrónoma (UMSA, 2009), 12 años trabajando con cooperativas quinueras de Salinas de Garci Mendoza y Challapata. Ahora quiere armar Andina Premium SRL para acopiar y exportar directamente a Europa, saltándose a los intermediarios paceños que se quedan con 35% del margen.",
  },
  contexto: [
    "Esther conoce la cadena de la quinua desde adentro. Pasó una década comprando para una exportadora que pagaba al productor Bs 380 el quintal y lo revendía en Hamburgo a USD 3.200/tonelada. La diferencia, decía su jefe, era \"riesgo y logística\". Esther vio los Excel: el margen real de la exportadora era 28%, el del productor apenas 6%. Decidió armar su propia operación.",
    "El plan es montar una planta de acopio y procesamiento (limpieza, escarificado, selección óptica) en el parque industrial Kallutaca de El Alto, donde el costo de m² es 40% más bajo que en La Paz y hay acceso directo a la carretera a Oruro. Capital inicial requerido: USD 280.000 (planta + capital de trabajo + certificación). Tiene comprometido USD 95.000 propios y busca un préstamo BDP de USD 120.000.",
    "Su tesis comercial: el mercado europeo paga premium por quinua REAL (Chenopodium quinoa Willd) orgánica con denominación de origen \"Altiplano boliviano\". Pero la ventana es estrecha: Perú produjo 89.000 toneladas en 2024 vs Bolivia 51.000 t, y los compradores europeos ya conocen ambos. La pregunta estratégica es: ¿cómo defender el premium boliviano frente al volumen peruano y a la presión devaluatoria del boliviano?",
  ],
  problema: "Bolivia perdió liderazgo mundial de quinua frente a Perú en 2014 y desde entonces compite con menores volúmenes y costos logísticos más altos; Andina Premium debe encontrar un nicho defendible para no entrar en guerra de precios contra exportadores peruanos.",
  segmento: "Importadores y distribuidores gourmet de productos orgánicos certificados en Alemania, Países Bajos y Francia, que abastecen tiendas premium tipo Alnatura, Ekoplaza y Naturalia. Compras de 2-12 contenedores/año (20-240 toneladas), pagan USD 2.800-3.500/tonelada FOB Arica para producto con certificación EU-Bio + Fair for Life.",
  pestel: {
    politico: [
      {
        nombre: "Restricciones de divisas en Bolivia 2024-2026",
        descripcion: "El BCB mantiene escasez crónica de dólares desde 2023. Exportadores deben usar el mecanismo de Bolsa Boliviana de Valores o el mercado paralelo para liquidar divisas. La brecha entre el oficial (Bs 6,96) y el paralelo (Bs 12-14 en 2026) afecta los costos en moneda local.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Como exportadora con ingresos en USD y costos en Bs, Andina captura la brecha cambiaria. Estructura los contratos en FOB Arica USD para fijar margen.",
      },
      {
        nombre: "Acuerdo SGP+ con la UE",
        descripcion: "Bolivia mantiene preferencias arancelarias bajo el SGP+ (Sistema Generalizado de Preferencias Plus) firmado hasta diciembre 2027. Quinua entra a la UE con arancel 0% bajo partida 1008.50.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Arancel cero es ventaja competitiva fuerte vs orígenes no SGP+. Aprovechar mientras dure y diversificar destinos no-UE en paralelo (Canadá vía CETA-equivalente).",
      },
      {
        nombre: "Conflictividad social ruta Oruro-Arica",
        descripcion: "Bloqueos por demandas sectoriales (transportistas, cocaleros, mineros) cierran la carretera La Paz-Oruro-Pisiga entre 8 y 22 días al año en promedio según ANAPO. Cada bloqueo cuesta USD 1.800-3.500 por contenedor varado.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Programar embarques con buffer de 5 días extra. Negociar puerto alternativo (Iquique vía Tambo Quemado) y mantener reserva de USD 18.000 para sobrecostos logísticos.",
      },
    ],
    economico: [
      {
        nombre: "Volatilidad precio internacional quinua",
        descripcion: "Precio FOB Lima/Arica cayó de USD 6.800/t (2014, pico burbuja) a USD 2.100/t (2023). En 2025-2026 estabilizado en USD 2.600-3.200/t para grano convencional, USD 3.400-4.100/t para orgánico certificado. Volatilidad ~18% anual.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Trabajar solo con contratos forward 6-12 meses, no spot. Diferenciar producto (orgánico+origen+lavado al vapor) para escapar la commodity trap.",
      },
      {
        nombre: "Devaluación del boliviano frente al USD",
        descripcion: "El tipo de cambio paralelo pasó de Bs 7 (2022) a Bs 12-14 (2026). Costos locales (mano de obra, transporte interno, energía) bajan en USD; insumos importados (sacos polipropileno, etiquetas, repuestos) suben en Bs.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Comprar grano y pagar maquila en Bs al tipo paralelo cuando se pueda; importar empaques en bloque cada 6 meses para amortiguar la suba.",
      },
      {
        nombre: "Costo logístico Arica vs Callao",
        descripcion: "Flete Bolivia-Arica-Hamburgo: USD 4.200/contenedor 20 pies. Perú vía Callao-Hamburgo: USD 3.100/contenedor. Diferencia 35% por el tramo interno boliviano y el sobrecosto de manejo en Arica.",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Esta diferencia es estructural y no cierra. Por eso la estrategia debe ser premium, no volumen — un 35% más caro logística solo se justifica con producto diferenciado.",
      },
    ],
    social: [
      {
        nombre: "Demanda europea de alimentos saludables y veganos",
        descripcion: "El mercado europeo de granos andinos creció 7,2% anual entre 2020-2025 (Euromonitor). Consumidor objetivo: 28-55 años, urbano, ingreso medio-alto, conciencia ambiental. Compra en tiendas orgánicas, no en supermercados masivos.",
        impacto: "positivo",
        intensidad: 5,
        implicacion: "Tendencia estructural a favor. Reforzar storytelling de origen ancestral altiplánico y comercio justo en cada empaque.",
      },
      {
        nombre: "Migración campo-ciudad en zona quinuera",
        descripcion: "Salinas de Garci Mendoza y Llica han perdido ~22% de población joven en una década (Censo 2024). Quedan productores de 50+ años sin recambio generacional. Riesgo de oferta cayendo en 5-8 años.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Firmar contratos de acopio de 3+ años con cooperativas para asegurar volumen. Apoyar formación técnica de jóvenes con UMSA para crear pipeline de proveedores.",
      },
    ],
    tecnologico: [
      {
        nombre: "Selección óptica por color/tamaño",
        descripcion: "Las exportadoras peruanas ya operan con seleccionadoras ópticas Bühler (USD 85.000-110.000) que reducen impureza a <0,3%. Los compradores europeos premium exigen este estándar. Bolivia tiene 4 plantas con esta tecnología vs Perú 31 plantas.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Andina debe invertir USD 92.000 en una seleccionadora óptica usada (modelo SORTEX Z+, 2019) como diferenciador técnico mínimo. Sin esto no se cierra contrato premium.",
      },
      {
        nombre: "Trazabilidad por blockchain para Fair Trade",
        descripcion: "Compradores europeos (especialmente Ekoplaza NL, Lebensbaum DE) están pidiendo trazabilidad por blockchain para validar Fair for Life. Empresas como BlockTrace y Provenance ofrecen el servicio por USD 0,08-0,15/kg exportado.",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "Aún no es exigencia obligatoria pero da 8-12% extra de premium en precio. Empezar con piloto en 1 contenedor el segundo año.",
      },
    ],
    ecologico: [
      {
        nombre: "Degradación de suelos en zona quinuera",
        descripcion: "El monocultivo intensivo 2010-2015 erosionó suelos en Oruro y Potosí. Productividad cayó de 950 kg/ha (2013) a 620 kg/ha (2024) según INE-Bolivia. Recuperar suelos requiere descansos de 2-3 años o rotación con cañahua.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Trabajar solo con cooperativas que practiquen rotación documentada. Pagar premium de Bs 80/qq sobre el precio mercado para incentivar prácticas regenerativas.",
      },
      {
        nombre: "Cambio climático y heladas tardías",
        descripcion: "Las heladas atípicas de noviembre 2023 destruyeron 28% del cultivo en zona Salinas. SENAMHI proyecta más eventos extremos en próximos 5 años.",
        impacto: "negativo",
        intensidad: 5,
        implicacion: "Diversificar proveedores en zonas distintas (norte: Achacachi/Tiwanaku; sur: Llica/Tahua) para no depender de una única microclima. Mantener stock buffer 60 días.",
      },
    ],
    legal: [
      {
        nombre: "Regulación UE 2018/848 sobre productos orgánicos",
        descripcion: "Desde enero 2022 todos los orgánicos vendidos en UE deben cumplir el reglamento 2018/848 (reemplazó al 834/2007). Exige inspección anual de finca + planta + cadena por organismo certificador acreditado (en Bolivia: BOLICERT, CERES, IMOCERT). Costo: USD 8.500-14.000/año.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Presupuestar USD 12.000 anuales para certificación EU-Bio. Es no-negociable: sin sello, no se vende a Alemania ni Países Bajos.",
      },
      {
        nombre: "Ley 144 de Revolución Productiva Comunitaria",
        descripcion: "Ley boliviana 144 (2011) obliga a empresas exportadoras a registrar contratos con productores y respetar precio mínimo por quintal. SENASAG e INSO supervisan cumplimiento. Multas hasta Bs 50.000 por incumplimiento.",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "Cumplir, registrar todos los contratos de acopio en INSO. Beneficio colateral: el registro facilita la certificación Fair for Life.",
      },
      {
        nombre: "Etiquetado UE: Reglamento 1169/2011",
        descripcion: "Información obligatoria en etiquetas: composición, origen, alergenos, fecha producción, lote, valor nutricional por 100g. Texto en idioma del país destino (alemán para DE, neerlandés para NL).",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Diseñar etiquetas en DE/NL desde el primer envío. Contratar revisor legal especializado en UE (USD 450/diseño revisado) para evitar rechazo en puerto.",
      },
    ],
  },
  porter: {
    rivalidad: {
      intensidad: "alto",
      justificacion: [
        "Perú es competidor directo con 89.000 t de producción vs 51.000 t de Bolivia, mejor logística (Callao) y 3 décadas de penetración en mercados premium.",
        "En Bolivia compiten 8 exportadoras consolidadas (SAITE, ANAPQUI, JATARY, ANDEAN VALLEY, entre otras) por los mismos compradores europeos.",
        "La quinua es percibida como commodity sustituible: el comprador alemán cambia origen sin sentimentalismo si el precio se desfasa 5%.",
      ],
      estrategia: "Diferenciación por origen + procesamiento + relación. Andina Premium se posiciona como 'cosecha real boliviana lavada al vapor', con denominación 'Altiplano Sur', no como 'quinua andina genérica'. Contratos de relacionamiento 3+ años con 5-7 compradores fidelizados, no licitaciones spot.",
    },
    nuevos_entrantes: {
      intensidad: "medio",
      justificacion: [
        "Barreras de capital moderadas: USD 280.000 alcanza para una planta básica.",
        "Sin embargo, la certificación EU-Bio toma 18-24 meses y los contactos con compradores europeos toman 2-3 ferias internacionales (Biofach Núremberg, SIAL París) y USD 25.000+ en viajes.",
        "Si China entrara con quinua del Tibet (proyecto piloto Yunnan desde 2023) la barrera caería; aún no es amenaza inmediata.",
      ],
      estrategia: "Construir activos intangibles que un entrante nuevo no pueda copiar en 18 meses: relación con 4-5 cooperativas exclusivas, sello propio Andina Premium, presencia en Biofach con stand 2024-2026.",
    },
    sustitutos: {
      intensidad: "medio",
      justificacion: [
        "Otros pseudocereales (amaranto, cañahua, trigo sarraceno) están creciendo en Europa pero desde una base mucho menor.",
        "Granos andinos cultivados ahora en USA (Colorado, Oregon) y Australia (Tasmania) son sustitutos directos con narrativa de 'local European production'.",
        "Sin embargo, el origen sudamericano sigue siendo el referente reputacional: 'real quinoa from the Andes' es la frase que vende, no 'quinoa from California'.",
      ],
      estrategia: "Reforzar 'origen andino' como diferenciador no replicable. Storytelling permanente sobre comunidades originarias, altitud 3.800 m.s.n.m. y prácticas ancestrales. Recursos audiovisuales en cada presentación a compradores.",
    },
    poder_proveedores: {
      intensidad: "alto",
      justificacion: [
        "Cooperativas quinueras del altiplano sur están organizadas en ANAPQUI y CECAOT con poder de negociación colectivo.",
        "Productividad cayó (de 950 a 620 kg/ha) y eso da escasez relativa que los productores aprovechan.",
        "Sin contratos de largo plazo, las cooperativas venden al mejor postor cada cosecha y rotan compradores.",
      ],
      estrategia: "Adelantar pagos hasta 30% al firmar contrato de cosecha (mecanismo de adelanto). Pagar 15% sobre precio piso de mercado. Construir relación de 3+ años con 3 cooperativas ancla (objetivo: 60% del volumen vendrá de esa relación estable).",
    },
    poder_clientes: {
      intensidad: "alto",
      justificacion: [
        "Los 12-15 importadores premium europeos relevantes están consolidados; un solo comprador puede representar el 35-50% del volumen anual de Andina.",
        "Operan con specs muy duras: humedad <12%, impureza <0,3%, granulometría >1,7 mm, contaminantes 0.",
        "Pueden cambiar de proveedor entre cosechas si encuentran mejor calidad o precio.",
      ],
      estrategia: "Diversificar cartera: no permitir que un cliente pese más del 25% de las ventas. Construir cartera de 5-7 compradores en DE/NL/FR. Calidad consistente por encima de specs como vía para retener.",
    },
    atractivo_sector: 3,
    conclusion: "Sector medianamente atractivo: la demanda europea crece y el SGP+ da arancel cero, pero Perú domina volumen y los compradores son sofisticados y exigentes. El espacio existe SOLO para quien diferencie con origen, certificación impecable y relaciones de largo plazo. Una guerra de precios contra Perú es suicida.",
  },
  mpc: {
    factores: [
      { nombre: "Calidad consistente (humedad, impureza, granulometría)", peso: 0.25 },
      { nombre: "Certificaciones (EU-Bio + Fair Trade)", peso: 0.20 },
      { nombre: "Costo logístico hasta puerto destino", peso: 0.15 },
      { nombre: "Relación de largo plazo con compradores", peso: 0.20 },
      { nombre: "Capacidad de procesamiento (selección óptica)", peso: 0.10 },
      { nombre: "Storytelling y marca de origen", peso: 0.10 },
    ],
    competidores: [
      {
        nombre: "Andina Premium (este proyecto)",
        notas: [3, 4, 2, 3, 3, 4],
        total_ponderado: 3.05,
      },
      {
        nombre: "ANAPQUI (Bolivia, cooperativa exportadora)",
        notas: [3, 4, 3, 3, 2, 3],
        total_ponderado: 3.05,
      },
      {
        nombre: "Andean Naturals (Perú, líder regional)",
        notas: [4, 4, 4, 4, 4, 3],
        total_ponderado: 3.90,
      },
      {
        nombre: "Andean Valley (Bolivia, exportadora veterana)",
        notas: [4, 3, 2, 4, 3, 3],
        total_ponderado: 3.20,
      },
    ],
    conclusion: "Andina Premium iguala al promedio boliviano pero queda 0,85 puntos por debajo del líder peruano (Andean Naturals). Los dos factores donde claramente pierde son costo logístico (estructural, no se puede arreglar individualmente) y capacidad de procesamiento (resoluble invirtiendo USD 92.000 en selección óptica). El factor donde gana es storytelling de origen, que Perú no puede igualar. Estrategia: cerrar la brecha técnica con la seleccionadora óptica + apalancar el storytelling como diferenciador único, sin pretender competir en costo logístico contra Callao.",
  },
  foda: {
    fortalezas: [
      "Esther tiene 12 años de relación personal con presidentes de cooperativas de Salinas y Llica; puede acceder a granos top antes que la competencia.",
      "Capital semilla USD 95.000 sin deuda externa; flexibilidad financiera para los primeros 12 meses.",
      "Conocimiento técnico agronómico (UMSA + experiencia campo) permite seleccionar cosecha por inspección visual antes del análisis de laboratorio.",
      "Ubicación El Alto Kallutaca: 18 min al aeropuerto, 4 horas a Arica, costo m² 40% menor que La Paz centro.",
      "Idioma inglés conversacional (B2) suficiente para Biofach y negociaciones iniciales.",
    ],
    oportunidades: [
      "Demanda europea de quinua orgánica creciendo 7,2% anual.",
      "SGP+ vigente hasta 2027 mantiene arancel 0% en UE.",
      "Tipo de cambio paralelo Bs 12-14 vs oficial Bs 6,96 favorece a exportadores que cobran en USD.",
      "Compradores europeos están migrando hacia certificación blockchain — primer mover en Bolivia tendría premium adicional.",
      "Cooperativas más jóvenes (formadas post-2020) buscan exportadora aliada de relación, no spot.",
    ],
    debilidades: [
      "Sin maquinaria de selección óptica al inicio — barrera técnica para acceder a compradores premium top.",
      "Sin certificación EU-Bio propia: hereda la de las cooperativas, lo que limita libertad para mezclar lotes.",
      "Sin track record exportador previo: los primeros compradores pedirán muestras + visita planta + garantías que tomarán 8-12 meses cerrar.",
      "Equipo inicial pequeño (Esther + 2 técnicos + 4 operarios planta); cualquier ausencia paraliza operación.",
      "Capital limitado para feria Biofach Núremberg (USD 14.000-18.000 por participación con stand).",
    ],
    amenazas: [
      "Perú domina con 89.000 t producidas y mejor logística Callao.",
      "Heladas atípicas pueden destruir 25-30% de la cosecha en una sola noche (caso 2023).",
      "Tipo de cambio podría reunificarse abruptamente si el BCB decide devaluación oficial, perdiendo arbitraje cambiario.",
      "Bloqueos viales La Paz-Arica cierran exportación 8-22 días/año en promedio.",
      "Cambio en SGP+ después de 2027 podría restablecer aranceles 12-18%.",
    ],
  },
  foda_cruzado: {
    fo: [
      "Aprovechar la relación de Esther con cooperativas + demanda europea creciente para firmar contratos de cosecha 3 años con 3 cooperativas ancla (60% del volumen objetivo).",
      "Usar capital semilla sin deuda + arancel 0% SGP+ para asistir a Biofach Núremberg 2026 y cerrar primeros 3 compradores antes del préstamo BDP.",
      "Capitalizar la migración blockchain de compradores europeos siendo la primera exportadora boliviana con trazabilidad por blockchain (proyecto piloto año 2).",
    ],
    do: [
      "Financiar selección óptica SORTEX usado (USD 92.000) con el préstamo BDP del año 1 para cerrar la brecha técnica antes de Biofach.",
      "Asociar Andina con una exportadora veterana (ej. Andean Valley) para los primeros 6 meses bajo modelo de comercialización conjunta, ganando track record sin asumir el riesgo solo.",
      "Sacrificar Biofach 2025 (capital limitado) e invertir en visitas individuales a 4-5 compradores top en Hamburgo/Ámsterdam (USD 4.500 vs 14.000 stand) para construir relación 1-a-1.",
    ],
    fa: [
      "Diversificar geográficamente proveedores en 3 microclimas distintos para amortiguar riesgo de helada/sequía.",
      "Posicionar 'quinua real ancestral altiplánica' como categoría diferenciada de la quinua peruana, blindando vs guerra de precios.",
      "Programar 100% de embarques con buffer de 5 días extra y mantener reserva de USD 18.000 para sobrecostos por bloqueos.",
    ],
    da: [
      "No competir en volumen contra Perú; entrar solo en mercado premium gourmet (top 15% por precio) donde Andina puede cobrar USD 3.400+/t.",
      "Pre-vender 70% de la primera cosecha antes de comprar grano para no quedar con inventario sin colocación.",
      "Plan B exportación: tener listo Iquique como puerto alternativo y vías terrestres por Tambo Quemado si Pisiga colapsa.",
    ],
  },
  matriz_nivel3: {
    tipo: "Ansoff",
    posicion: "Desarrollo de mercado",
    justificacion: "Producto existente (quinua orgánica boliviana, ya producida por cooperativas que Esther conoce) llevado a un mercado nuevo para ella (importadores premium europeos directos, sin pasar por intermediario paceño). No se está innovando en producto ni se está atendiendo el mercado actual local; se trata de canalizar oferta existente hacia un canal nuevo donde el premium es 3,5x superior al precio local.",
    implicacion: "Foco operativo año 1: construir red de 5-7 compradores europeos directos y validar al menos 3 con contratos de cosecha. El producto (especificaciones, certificación, presentación) debe ajustarse al estándar europeo, no inventarse. Métrica clave: número de compradores recurrentes (2+ compras año), no número de SKUs.",
  },
  mcpe: {
    factores: [
      { nombre: "Demanda europea creciente 7,2% anual", peso: 0.15 },
      { nombre: "SGP+ arancel 0% vigente hasta 2027", peso: 0.10 },
      { nombre: "Brecha cambiaria Bs paralelo vs oficial", peso: 0.15 },
      { nombre: "Capital limitado (USD 95k propios)", peso: 0.15 },
      { nombre: "Sin track record exportador", peso: 0.15 },
      { nombre: "Perú domina volumen y logística", peso: 0.15 },
      { nombre: "Costo de certificación EU-Bio USD 12k/año", peso: 0.15 },
    ],
    filas: [
      {
        estrategia: "Premium gourmet directo (5-7 compradores EU, certificación + storytelling)",
        notas: [4, 4, 4, 3, 3, 3, 3],
        total: 3.30,
      },
      {
        estrategia: "Volumen commodity (vender a brokers Hamburgo, sin diferenciación)",
        notas: [3, 4, 3, 2, 2, 1, 2],
        total: 2.40,
      },
      {
        estrategia: "B2C marca propia (vender bolsas 500g con marca al consumidor europeo)",
        notas: [3, 3, 3, 1, 1, 2, 2],
        total: 2.10,
      },
    ],
    estrategia_elegida: "Premium gourmet directo (5-7 compradores EU, certificación + storytelling)",
    justificacion: "Es la única estrategia que aprovecha plenamente la fortaleza (relaciones con cooperativas + conocimiento técnico) y neutraliza la debilidad principal (capital limitado, sin track record) mediante foco en pocos clientes premium en lugar de competir en volumen. Las otras dos estrategias chocan frontalmente con las debilidades del proyecto: volumen requiere capital 3-4x mayor y B2C marca propia requiere presupuesto de marketing en Europa que Andina simplemente no tiene.",
  },
  plan_accion: [
    "Mes 1-2: Constituir Andina Premium SRL en FUNDEMPRESA (Bs 1.890 + NIT). Aperturar cuenta empresarial en BNB y registrarse en SENASAG e IBNORCA. Aprobar préstamo BDP USD 120.000.",
    "Mes 3-4: Firmar contratos de acopio 3 años con 3 cooperativas ancla (Salinas, Llica, Challapata). Adelantar 25% del valor estimado para asegurar 280 t año 1.",
    "Mes 5-6: Adquirir e instalar planta acopio en Kallutaca (galpón 480 m² alquilado USD 1.850/mes) + seleccionadora óptica SORTEX Z+ usada (USD 92.000). Contratar 4 operarios + 2 técnicos.",
    "Mes 7-9: Iniciar proceso certificación EU-Bio con BOLICERT (auditoría finca + planta). Diseñar marca Andina Premium con consultor en La Paz (USD 4.500 brand + etiquetas DE/NL).",
    "Mes 8: Visita comercial Alemania y Países Bajos: 4-5 reuniones con compradores objetivo (Lebensbaum, Davert, Alnatura buyer, Ekoplaza). USD 4.500 total. Llevar muestras 500g cosecha 2025.",
    "Mes 10-11: Primer embarque piloto de 1 contenedor (18 t) a comprador alemán ancla. Validar specs, tiempos de entrega, documentación aduanera. Cobrar a 60 días post-embarque.",
    "Mes 12: Asistir Biofach Núremberg con stand compartido (con otra exportadora boliviana, costo USD 8.500). Cerrar 2 contratos adicionales año 2.",
    "Año 2: Implementar trazabilidad blockchain con BlockTrace (USD 0,10/kg) en un cliente piloto. Meta año 2: 6 contenedores (108 t), USD 380.000 facturados, margen neto 16-19%.",
  ],
  conclusion: "Andina Premium tiene un nicho real pero estrecho. La estrategia ganadora es premium gourmet directo apalancando la red personal de Esther + certificación + storytelling. Las amenazas estructurales (Perú, logística, bloqueos) no se eliminan, se gestionan con buffer financiero y diversificación de compradores. Año 1 será de inversión sin retorno completo; el negocio empieza a generar margen interesante desde el mes 14-18, cuando se consolide la cartera de 5-7 compradores recurrentes. Si Esther mantiene disciplina en NO caer en spot deals tentadores y NO sobre-concentrar en un cliente, el proyecto puede llegar a USD 1,2M facturados al año 3.",
  lecciones: [
    "En exportación a UE, la certificación no es un trámite sino un activo estratégico que tarda 18-24 meses construir y vale el 10-15% extra del precio.",
    "En commodities diferenciables (quinua, café, cacao) el storytelling de origen es la única ventaja no replicable por competidores con mejor logística.",
    "Diversificar compradores (ningún cliente >25% ventas) es crítico cuando los compradores son sofisticados y pueden cambiar de proveedor cada cosecha.",
    "El tipo de cambio paralelo en Bolivia es una ventaja temporal para exportadores; si reunifican, el cálculo de margen debe rehacerse al tipo oficial sin asumir continuidad.",
    "Para entrar a Europa con producto nuevo: no Biofach el primer año (caro), sino visitas comerciales directas a 4-5 compradores (8x más barato y 3x más efectivo).",
  ],
  errores_evitados: [
    "No firmar contratos spot con varios brokers diferentes — destruye relación de largo plazo y deja a Andina vulnerable a guerra de precios.",
    "No vender la primera cosecha sin certificación EU-Bio en regla — el comprador no paga premium si el papel no llega antes que el contenedor.",
    "No depender de una sola cooperativa proveedora — cualquier helada o bloqueo deja el contrato europeo sin cobertura.",
    "No asumir que el tipo de cambio paralelo seguirá igual 5 años — modelar escenarios con TC oficial unificado.",
    "No contratar broker europeo como intermediario en lugar de cerrar con comprador final — pierde 12-18% del margen y replica el problema que Esther quería resolver.",
  ],
  tags: ["exportacion", "agroindustria", "UE", "El-Alto", "Altiplano", "PESTEL-internacional", "Ansoff-mercado", "avanzado"],
};
