import type { CasoMarketing } from "../types";

/**
 * Caso 3 — Cerveza artesanal "Achachi" con identidad andina (La Paz).
 *
 * Caso **avanzado** de lanzamiento comercial de marca FMCG con
 * presupuesto alto (Bs 8.000/mes) porque hay que CREAR marca de cero
 * y disputar góndolas con cerveza importada. Mix 4P (producto físico
 * con ingredientes culturales), branding fuerte, calendario con
 * eventos + influencers + RTM (route-to-market) en restaurantes.
 * KPIs centrados en distribución numérica, rotación y awareness.
 */

export const casoCervezaArtesanalLaPaz: CasoMarketing = {
  slug: "cerveza-artesanal-lapaz",
  modulo: "marketing",
  titulo: "Marca de cerveza artesanal con identidad andina",
  tagline: "Plan de lanzamiento comercial de Achachi — cerveza artesanal con cebada nacional + ingredientes andinos (chía, coca, quinua) para La Paz y venta nacional.",
  zona: "La Paz (sede) + venta nacional",
  rubro: "Bebidas / cerveza artesanal premium",
  dificultad: "avanzado",
  emoji: "🍺",
  emprendedor: {
    nombre: "Hermanos Quiroga (Sebastián 33 y Camilo 30)",
    edad: 33,
    rol: "Sebastián es ingeniero industrial (UPB) con 6 años en cervecería Sürbier; Camilo es diseñador gráfico (UMSA) freelance con experiencia en branding gastronómico. Llevan 3 años desarrollando recetas en garaje. Tienen patente del proceso \"Achachi\" pendiente.",
  },
  contexto: [
    "Sebastián trabajó como ingeniero de procesos en Sürbier (cerveza nacional industrial) hasta 2024. Aprendió que el mercado boliviano de cerveza artesanal había crecido 240% entre 2018 y 2024 pero estaba dominado por imitaciones de estilos europeos (IPAs, stouts genéricos). Vio espacio para una marca con identidad cultural fuerte que no fuera más \"cervecería del barrio\" sino una marca premium nacional.",
    "Con Camilo, su hermano menor, desarrollaron \"Achachi\" — nombre aymara para \"abuelo\" y por extensión \"ancestro\". Tres estilos pensados para diferentes consumos: APA con coca (refrescante, 4.8°), Stout con quinua tostada (densa, postre, 6.2°), y Witbier con chía y naranja (suave, 4.2°). Producción inicial 1.200 litros/mes en planta arrendada de Achocalla.",
    "La inversión inicial fue Bs 165.000 (equipamiento, registro SENASAG, planta arrendada, primer lote, etiquetado). Para sobrevivir necesitan facturar Bs 38.000/mes en mes 6 con margen bruto 52%. El problema central NO es producción (Sebastián la domina) sino marketing: crear awareness de marca premium con presupuesto limitado contra Saya, Stier, Maltin, y cervezas importadas.",
  ],
  problema: "Achachi tiene producto diferenciado y branding sólido pero entra a un mercado saturado donde el consumidor target paga premium solo por marcas con historia o exotismo. ¿Cómo construir esa historia rápido con Bs 8.000/mes y romper la barrera de entrada en restaurantes?",
  segmento: "Adultos 25-40 años, NSE B+/A, urbanos (La Paz, Cochabamba, Santa Cruz), consumidores actuales de cerveza artesanal o importada premium (Stella, Heineken, Erdinger), interesados en gastronomía local y productos con identidad cultural.",
  buyer_personas: [
    {
      nombre: "Mateo el hipster pacecho",
      edad: 28,
      ocupacion: "UX designer en startup boliviana de fintech",
      ingreso_aprox: "Bs 8.500/mes líquido",
      ubicacion: "Comparte departamento de Bs 2.800 con 2 amigos en San Miguel (Zona Sur, La Paz); va al gym, lee Substack, viaja una vez al año.",
      motivaciones: [
        "Se identifica con la generación que reivindica lo boliviano premium (charango electrónico, café de Caranavi, cerveza local artesanal).",
        "Le importa la trazabilidad y el origen — pregunta de dónde viene la cebada antes de comprar.",
        "Quiere productos \"con historia\" para compartir en Instagram (cerveza boring no se postea).",
        "Tiene su \"after office\" del jueves con 4 amigos en bares de Sopocachi (Magick, El Faro) o terrazas de Zona Sur.",
        "Está dispuesto a pagar Bs 28-35 por una cerveza artesanal si el producto le parece \"bueno y diferente\".",
      ],
      frustraciones: [
        "Las cervezas artesanales bolivianas que probó eran imitaciones flojas de estilos europeos sin alma propia.",
        "Los bares cobran Bs 40-50 por una Heineken importada cuando podrían tener algo local del mismo precio y mejor.",
        "Le aburre el branding cervecero \"masculino agresivo\" (calaveras, motoqueros, slogans tipo \"para hombres de verdad\").",
        "Quiere variedad: detesta el bar que solo tiene Paceña y Huari.",
      ],
      canales_consumo: [
        "Instagram (sigue cuentas de gastronomía y cerveza artesanal mundial).",
        "Spotify (escucha podcasts de emprendimiento y cultura).",
        "TikTok (15-20 min/día, contenido de cocina y viajes).",
        "Boca-a-boca de su grupo de amigos (define el bar del jueves).",
        "Untappd (app de check-in de cerveza, ~ 8k usuarios en Bolivia).",
      ],
      cita: "Si la cerveza tiene historia, ingredientes locales y branding cuidado, la pago Bs 32 sin chistar. Pero no quiero otra \"IPA artesanal de barrio\". Quiero algo que pueda contarle a un amigo de Berlín.",
      objecion_tipica: "¿Coca en la cerveza? Suena a gimmick turístico. ¿Sabe bien o es marketing?",
    },
    {
      nombre: "Eric el turista cultural",
      edad: 35,
      ocupacion: "Periodista freelance en revistas de viajes (vive entre Berlín y La Paz, 4 meses al año en Bolivia)",
      ingreso_aprox: "Bs 18.000/mes equivalente (cobra en EUR)",
      ubicacion: "Cuando está en La Paz se hospeda en Airbnb de Sopocachi; come en restaurantes top (Gustu, Ali Pacha, Phayawi).",
      motivaciones: [
        "Busca productos que cuentan historia de Bolivia para sus reportajes y para llevar a Alemania.",
        "Valora la cocina y bebida como expresión cultural — paga premium si hay narrativa.",
        "Sigue chefs y mixólogos bolivianos en Instagram (Marsia Taha, Kamilla Seidler ex-Gustu).",
        "Recomienda en su columna de revista alemana lo que descubre — un buen producto puede tener exposición internacional gratis.",
        "Le encanta el storytelling detrás del producto: prefiere cerveza con etiqueta narrativa que con etiqueta minimalista vacía.",
      ],
      frustraciones: [
        "La mayoría de productos \"con identidad andina\" son estereotipos (llamas, ponchos genéricos, colores fluor que no representan la cultura real).",
        "Las cervezas artesanales que probó en Bolivia copian estilos europeos sin reinterpretar lo local.",
        "Los restaurantes top no siempre tienen carta de bebidas a la altura de su carta de comida.",
        "Le frustra cuando descubre un producto bueno pero la marca no sabe contar su historia en buen español (menos aún en inglés).",
      ],
      canales_consumo: [
        "Instagram intenso (publica y consume gastro internacional).",
        "Periodismo gastronómico digital (Pellegrino, Eater).",
        "Recomendaciones de chefs (es amigo de varios cocineros bolivianos).",
        "Untappd y RateBeer (rastrea cervezas de viaje).",
        "WhatsApp para coordinar con productores que entrevista.",
      ],
      cita: "Lo que busco en un viaje es la cerveza que NO encuentro en Berlín. Si ustedes me dan una cerveza con quinua tostada y una historia auténtica de los Quiroga, eso entra a mi próximo reportaje en Vogue Lebensart.",
      objecion_tipica: "La etiqueta cuenta una historia bonita, pero ¿el sabor mantiene la promesa o se queda en el marketing?",
    },
  ],
  mix: [
    {
      categoria: "Producto",
      decision: "Tres estilos en botella de 330 ml: Achachi APA Coca (4.8°, 45 IBU), Achachi Stout Quinua (6.2°, 28 IBU), Achachi Witbier Chía (4.2°, 12 IBU). Etiqueta con ilustración de Camilo (arte andino contemporáneo) + relato del estilo en reverso.",
      justificacion: "Tres estilos diferenciados cubren ocasiones distintas (refresco, postre, comida). Botella 330 ml es estándar premium (no longneck). El relato impreso desbloquea el storytelling natural en Mateo y Eric.",
    },
    {
      categoria: "Producto",
      decision: "Línea limitada \"Achachi Cosecha\" — edición anual de 800 botellas con cebada de una región específica (Tarata 2026, Charazani 2027). Numeradas y firmadas. Precio Bs 65/botella.",
      justificacion: "Crea coleccionabilidad, prensa y comunicación recurrente cada año. 800 botellas se vende en 6 semanas en restaurantes top. Margen brutal (78%) y construye prestigio.",
    },
    {
      categoria: "Producto",
      decision: "Cervezas pasteurizadas no filtradas, vida útil 6 meses refrigeradas. Registro SENASAG completo, código QR en cada botella linkando al lote, fecha de envasado y trazabilidad de la cebada.",
      justificacion: "Trazabilidad es el detalle que Eric publicará en su artículo. SENASAG protege contra problemas legales y desbloquea distribución en supermercados serios.",
    },
    {
      categoria: "Precio",
      decision: "PVP retail Bs 28/botella (mercado: industrial Bs 12, artesanal Bs 22-28, importada Bs 30-45). Precio en restaurantes Bs 35-42. Línea Cosecha Bs 65.",
      justificacion: "Compite en banda alta de artesanal y banda baja de importada. La diferencia +25% sobre Saya o Maltin se sostiene por branding + ingrediente andino. Margen bruto productor 52%.",
    },
    {
      categoria: "Precio",
      decision: "Lista de precios escalonada por canal: directo a restaurante Bs 22/botella (al canal), supermercado especializado Bs 19, distribuidor Bs 17. Sin descuento por volumen al inicio.",
      justificacion: "Margen del retailer 27-50%, suficiente para incentivar la venta. Política de NO bajar precio el primer año (consistencia premium). Castiga al canal que regala el precio.",
    },
    {
      categoria: "Plaza",
      decision: "RTM (route to market) en 3 niveles: (1) HORECA top en La Paz (12 restaurantes Gustu, Ali Pacha, Phayawi, Magick, El Faro, MAGNAS, Popular, Manq'a, etc.). (2) Supermercados especializados (Ketal Vinoteca, Hipermaxi sección importados, Casa Almacén). (3) E-commerce propio achachi.bo con envío La Paz/Cochabamba/SCZ.",
      justificacion: "HORECA es vitrina de marca (Mateo lo prueba en Magick y luego lo compra para casa). Supermercado da volumen. E-commerce mantiene margen directo y da data del consumidor.",
    },
    {
      categoria: "Plaza",
      decision: "Distribución inicial restringida geograficamente: La Paz primero (3 meses). Cochabamba y Santa Cruz mes 4. NO exportación todavía.",
      justificacion: "Mercado pequeño concentrado evita problemas de logística (cadena de frío) y permite que los hermanos atiendan personalmente cada cuenta. La escasez genera deseo.",
    },
    {
      categoria: "Promocion",
      decision: "3 eventos de lanzamiento + alianzas con 5 chefs reconocidos (Marsia Taha, Tomás Espinoza, Lucas Rocco, Carolina Carrillo, Sebastián Otero) para maridajes mensuales.",
      justificacion: "El chef es el influencer de gastronomía. Un maridaje en Gustu llega a 2.000 personas en Instagram a través del chef. CAC inferior a Bs 30 por cliente cualificado.",
    },
    {
      categoria: "Promocion",
      decision: "Storytelling intensivo en Instagram: serie \"Los abuelos de Achachi\" — 12 videos cortos contando la historia detrás de cada ingrediente (visita a productores de quinua en Patacamaya, a recolectores de coca en Yungas, a productores de chía en Tarija).",
      justificacion: "Resuelve dolor de Eric (\"contar historia auténtica\") y de Mateo (\"que sea posteable\"). Genera 12 piezas reutilizables en redes, prensa y eventos. Costo Bs 8.000 producción amortizada en año 1.",
    },
    {
      categoria: "Promocion",
      decision: "Activación digital: cuenta @achachibeer en Instagram + Untappd oficial + alianzas con 6 micro-influencers gastro (3 La Paz, 2 SCZ, 1 CBA, todos 5k-25k seguidores).",
      justificacion: "Untappd es donde Mateo deja reviews; Instagram es donde Eric publica. Los micro-influencers gastro (no genéricos) ya hablan al nicho y tienen credibilidad. Brief: pruebas honestas, no posts pagados disfrazados.",
    },
    {
      categoria: "Promocion",
      decision: "PR y prensa: invitar a periodistas gastronómicos (Saltshaker, Bolivia.com, gastronomía Página 7) a degustación + envío de muestra a 3 medios internacionales (Eater LatAm, gastro Pellegrino).",
      justificacion: "Una nota en un medio gastronómico internacional posiciona la marca por arriba de los competidores locales para siempre. Costo PR: Bs 3.500 para producir kit de prensa.",
    },
  ],
  presupuesto: {
    total_bs_mes: 8000,
    desglose: [
      {
        canal: "Producción de contenido (foto, video, edición \"Los abuelos de Achachi\")",
        monto_bs_mes: 2500,
        resultado_esperado: "1 video pilar de 60s/mes + 4 reels + 12 fotos pro + 1 video largo trimestral. Activos reutilizables para 6+ meses cada uno.",
      },
      {
        canal: "Eventos y activaciones (maridaje mensual + degustaciones)",
        monto_bs_mes: 1800,
        resultado_esperado: "1 maridaje mensual en restaurante top (40-60 invitados cualificados) + 2 degustaciones en supermercado (sábados, 200-300 catas). 35-50 nuevos clientes cualificados/mes.",
        cpl_estimado_bs: 45,
      },
      {
        canal: "Meta Ads (Instagram) + retargeting",
        monto_bs_mes: 1500,
        resultado_esperado: "Alcance 50.000 cuentas/mes en La Paz, CBA, SCZ con intereses gastronomía + cerveza artesanal + viajes. Tráfico a tienda e-commerce y geolocalización a restaurantes.",
        cpl_estimado_bs: 40,
      },
      {
        canal: "Influencers micro (6 micro-influencers gastro)",
        monto_bs_mes: 1200,
        resultado_esperado: "6 piezas/mes (1 cada uno): degustación honesta, maridaje, lifestyle. Alcance combinado 80k impresiones. 25-40 leads cualificados.",
        cpl_estimado_bs: 36,
      },
      {
        canal: "PR / Kit prensa / muestras a medios",
        monto_bs_mes: 500,
        resultado_esperado: "1 nota cada 2 meses en medio gastronómico nacional. Probabilidad 30% de una mención internacional en año 1.",
      },
      {
        canal: "Material POP en HORECA y supermercado (afiches, displays, posavasos branded)",
        monto_bs_mes: 500,
        resultado_esperado: "Visibilidad permanente en 12 restaurantes + 4 supermercados. Aumenta venta orgánica en 20-30% donde está bien instalado.",
      },
    ],
    roas_proyectado: 4.5,
  },
  calendario: [
    {
      semana: 1,
      tipo: "Lanzamiento prensa privado",
      canal: "Restaurante Gustu + Instagram + WhatsApp",
      contenido: "Cena de degustación cerrada para 25 personas: 4 chefs aliados, 6 periodistas gastro, 8 micro-influencers, 4 sommeliers, 3 dueños de restaurante. Maridaje guiado de los 3 estilos. Filmación pro para piezas posteriores.",
    },
    {
      semana: 2,
      tipo: "Video pilar marca",
      canal: "Instagram + YouTube",
      contenido: "Video manifiesto \"Achachi: las abuelas no nos dejaron solo recetas, nos dejaron una forma de hacer las cosas\" — 90 segundos con los hermanos, planta de Achocalla, ingredientes andinos, primera botella. Pieza ancla para 12 meses.",
    },
    {
      semana: 2,
      tipo: "Degustación en supermercado Ketal",
      canal: "Punto de venta físico + Instagram Stories",
      contenido: "Sábado 11-15h en Ketal Calacoto: degustación gratuita de los 3 estilos. 220 personas catan, 80 compran (estimado 36% conversión). Capturar 60 emails con vale 10% para próxima compra.",
    },
    {
      semana: 3,
      tipo: "Maridaje chef #1",
      canal: "Restaurante Phayawi + Instagram (chef + Achachi)",
      contenido: "Noche \"Phayawi x Achachi\" — menú degustación de 5 pasos maridado con los 3 estilos + Cosecha. 35 cubiertos a Bs 280. Marsia Taha publica en Instagram con 65k seguidores.",
    },
    {
      semana: 3,
      tipo: "Pieza de \"Los abuelos\" #1",
      canal: "Instagram + TikTok",
      contenido: "Reel \"Visitamos a Don Mariano en Patacamaya, productor de quinua hace 40 años\" — narrativa cinematográfica 45s. CTA suave: \"Conoce Achachi Stout Quinua\".",
    },
    {
      semana: 4,
      tipo: "Activación de micro-influencers",
      canal: "Instagram (6 cuentas simultáneas)",
      contenido: "Envío de kit a 6 micro-influencers gastro: 3 botellas + carta personalizada + invitación a planta Achocalla. Brief de \"degustación honesta\". 6 publicaciones distribuidas semana 4-6.",
    },
    {
      semana: 4,
      tipo: "Notas de prensa",
      canal: "Bolivia.com gastronomía + Saltshaker + Página 7",
      contenido: "Envío de comunicado oficial \"Cerveza artesanal con coca, chía y quinua llega a la mesa boliviana\" + kit foto profesional. Meta: 2 publicaciones en medios serios.",
    },
    {
      semana: 5,
      tipo: "Maridaje chef #2",
      canal: "Restaurante Ali Pacha + Instagram",
      contenido: "\"Una noche vegana con Achachi\" en Ali Pacha (restaurante vegano top de La Paz). Maridaje específico para platos vegetales. 30 cubiertos. Activación específica para audiencia Eric.",
    },
    {
      semana: 5,
      tipo: "Campaña Meta — geo CBA y SCZ",
      canal: "Meta Ads (Instagram + Facebook)",
      contenido: "Campaña con video pilar segmentada a CBA y SCZ. Mensaje: \"Achachi llega a tu ciudad — encuéntranos en estos restaurantes\". Mostrar lista de 4 restaurantes en cada ciudad. Bs 600 boost.",
    },
    {
      semana: 6,
      tipo: "Pieza de \"Los abuelos\" #2",
      canal: "Instagram + YouTube",
      contenido: "Reel \"En Yungas con los recolectores de coca: por qué nuestra APA no se parece a ninguna\" — 60s con cuidado político (coca legal, uso tradicional, no estigmatizar). Comunicar bien para no perder audiencia conservadora.",
    },
    {
      semana: 6,
      tipo: "Charla en evento gastro",
      canal: "Festival gastronómico boliviano (BoFood) + Instagram",
      contenido: "Sebastián habla 25 min en panel \"Identidad andina y producto premium\" en festival anual. 300 asistentes + cobertura prensa. Stand de degustación al final.",
    },
    {
      semana: 7,
      tipo: "Lanzamiento Achachi Cosecha 2026",
      canal: "Restaurante Gustu (exclusivo 2 semanas) + Instagram",
      contenido: "Edición numerada 800 botellas \"Cosecha Tarata 2026\" lanzada en Gustu por 14 días antes de salir a venta general. Cada botella numerada y firmada. Crear escasez visible.",
    },
    {
      semana: 7,
      tipo: "PR internacional",
      canal: "Eater LatAm + Pellegrino + Gastronomy Bolivia",
      contenido: "Envío de muestra + dossier en inglés a 3 medios internacionales. Pitch: \"Bolivian craft brewery uses Andean ingredients no one outside has heard of\". Probabilidad de mención: 30%.",
    },
    {
      semana: 8,
      tipo: "Reporte de cobertura + reactivación",
      canal: "Instagram (re-share de cobertura prensa) + WhatsApp a base",
      contenido: "Carrusel \"Achachi en prensa 8 semanas: 6 notas, 4 chefs aliados, 18 restaurantes, 850 botellas vendidas\". Empuja distribución y construye prueba social.",
    },
  ],
  kpis: [
    "Distribución numérica (cantidad de puntos de venta activos): meta 18 mes 1 → 45 mes 6.",
    "Rotación por punto de venta (botellas/semana): meta 28 (HORECA) y 60 (super).",
    "Awareness en target NSE B+/A (medido por encuesta cada 90 días): meta 22% al mes 6.",
    "Ventas mensuales: meta Bs 18.000 mes 1, escalar a Bs 42.000 mes 6 (ROAS 4.5x).",
    "Menciones de prensa mensuales: meta ≥2 (medio nacional o blog gastro).",
    "Calificación promedio en Untappd: meta ≥3.9/5 con al menos 80 reviews al mes 6.",
    "Lista de espera para próxima Cosecha: meta 250 personas pre-inscritas al cierre del primer lote.",
  ],
  conclusion: "Plan **viable pero exigente**. Construir marca FMCG premium contra industriales y artesanales establecidos requiere paciencia y consistencia. Los primeros 60 días son de \"seeding\" en HORECA y prensa más que de venta. Bs 8.000/mes es presupuesto razonable solo porque los hermanos aportan tiempo intensivo (eventos, contenido) sin cobrarlo. ROAS 4.5x es proyección conservadora; con una mención internacional fuerte podría dispararse a 7x. El verdadero riesgo NO es el marketing sino la capacidad productiva: si la demanda crece más rápido que los 1.200 L/mes iniciales, hay que invertir en planta sin haber pagado la primera todavía.",
  lecciones: [
    "Marcas FMCG premium se construyen en HORECA primero, supermercado segundo. El restaurante top es vitrina y prueba social que el super no puede dar.",
    "Storytelling visual (\"Los abuelos\") es activo de marca de largo plazo. 12 piezas bien producidas valen 100 posts genéricos.",
    "Influencers micro de NICHO (gastronomía) > influencers macro genéricos. CAC menor y conversión mejor por contextualidad.",
    "Edición limitada anual numerada genera cobertura recurrente, lista de espera y margen alto. Es marketing y producto a la vez.",
    "PR internacional desbloquea posicionamiento que millones de inversión publicitaria no consiguen. Una mención en Eater vale 20.000 EUR de ads.",
  ],
  errores_evitados: [
    "No imitar branding cervecero \"masculino agresivo\" (calaveras, slogans testosterónicos) — repele al consumidor premium 25-40.",
    "No bajar precio en mes 1 \"para entrar al mercado\" — destruye posicionamiento y rentabilidad anual.",
    "No abrir distribución nacional inmediatamente — perderías control de cadena de frío y trato personal con cuentas top.",
    "No publicitar el ingrediente \"coca\" con sensacionalismo o exotismo barato — alejaría a target conservador y a posibles export.",
    "No descuidar el SENASAG y trazabilidad — un solo problema sanitario cierra la marca para siempre.",
  ],
  tags: ["FMCG", "cerveza-artesanal", "branding-cultural", "4P", "premium", "La-Paz", "HORECA", "influencers"],
};
