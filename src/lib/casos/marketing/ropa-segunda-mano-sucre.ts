import type { CasoMarketing } from "../types";

/**
 * Caso 4 — Tienda online "Recicla" de ropa segunda mano curada (Sucre).
 *
 * Caso **básico** que muestra cómo armar plan de marketing low-budget
 * (Bs 1.800/mes) con foco intensivo en TikTok + Instagram orgánico.
 * Mix 4P (es producto), dos buyer personas jóvenes con presupuesto
 * acotado, calendario MUY denso de contenido orgánico (3 posts por
 * semana), CPL muy bajo (~Bs 12-15) y dependencia fuerte del
 * algoritmo. Ejemplo perfecto para emprendimiento sin capital.
 */

export const casoRopaSegundaManoSucre: CasoMarketing = {
  slug: "ropa-segunda-mano-sucre",
  modulo: "marketing",
  titulo: "Tienda online de ropa segunda mano curada",
  tagline: "Plan de marketing low-budget (Bs 1.800/mes) para Recicla — tienda 100% Instagram + TikTok de ropa segunda mano curada con envíos nacionales desde Sucre.",
  zona: "Sucre (con envíos nacionales por Cruz del Sur / encomienda)",
  rubro: "Moda / segunda mano / sostenibilidad",
  dificultad: "basico",
  emoji: "👗",
  emprendedor: {
    nombre: "Daniela Padilla",
    edad: 25,
    rol: "Estudió diseño de modas en USFX (Sucre). Está terminando internado universitario. Tiene ojo para vintage desde la adolescencia, revolvía las ferias de su tía en Yotala. Quiere armar Recicla — curaduría de ropa segunda mano, no \"ropa americana al peso\".",
  },
  contexto: [
    "Daniela creció yendo con su tía a las ferias de ropa usada de Yotala y la cancha en Cochabamba. Aprendió a ver: distinguir el algodón egipcio, las costuras dobles, las marcas con valor reventa, las prendas únicas escondidas entre el bulto. Mientras estudiaba moda, vendía piezas curadas a sus compañeras y se hizo de una clientela inicial de 35 personas.",
    "En 2026, cerca de terminar la carrera, decidió armar negocio real: \"Recicla\". El posicionamiento clave es \"curaduría\" — Daniela revisa cada prenda, fotografía con luz natural, mide centímetro a centímetro, y escribe un mini-relato (\"perfecto para Sucre invierno\", \"ideal con jeans negros\"). NO es ropa americana al peso; es selección. Eso justifica que cobre Bs 45-180 por pieza (vs Bs 15-25 de la cancha).",
    "El problema central es el presupuesto: Daniela tiene Bs 6.000 ahorrados de su trabajo paralelo en una boutique de Sucre. De eso, Bs 4.200 son stock inicial (compra al por mayor en Cochabamba) y Bs 1.800/mes el primer trimestre es lo único que puede gastar en marketing. Su hermana Vale (19, estudia comunicación) le ayuda con contenido. Todo se juega al algoritmo orgánico.",
  ],
  problema: "Daniela tiene un producto diferenciado (curaduría) y dos canales naturales (Instagram, TikTok) pero arranca SIN audiencia y con Bs 1.800/mes — no puede pagar visibilidad pagada agresiva. El plan tiene que vivir 80% del contenido orgánico.",
  segmento: "Mujeres 18-32 años de Bolivia, NSE C+/B, conscientes del consumo (sostenibilidad), con presupuesto acotado para ropa (Bs 200-600/mes) y usuarias intensivas de redes sociales.",
  buyer_personas: [
    {
      nombre: "Valentina la estudiante consciente",
      edad: 22,
      ocupacion: "Estudiante de psicología en USFX, trabajo medio tiempo en cafetería",
      ingreso_aprox: "Bs 1.800/mes (sueldo medio tiempo + apoyo familiar)",
      ubicacion: "Vive con sus padres en Sucre centro; toma micro a la universidad; sale a bares de la Recoleta los viernes.",
      motivaciones: [
        "Tiene conciencia ambiental: sigue cuentas sobre fast fashion y el impacto de Zara, Shein, etc.",
        "Quiere verse distinta de sus compañeras (toda la facultad compra en Falabella y Shein, todas se ven igual).",
        "Le gusta el estilo \"y2k revival\" y vintage 90s que ve en TikTok internacional.",
        "Le da satisfacción contar la historia detrás de cada pieza (\"esta blusa la encontré en una tienda en Sucre\").",
        "Ahorra todo lo que puede; ropa nueva premium NO entra en su presupuesto.",
      ],
      frustraciones: [
        "Las tiendas de ropa americana al peso son un caos: hay que hurgar 2 horas y casi todo está manchado o destrozado.",
        "Shein le llega tarde, le queda mal el talle y la calidad es horrible.",
        "Cuando algo le gusta en Instagram, casi siempre es importado y carísimo (Bs 350+).",
        "No tiene tiempo para ir a ferias presenciales cada fin de semana.",
        "Sus amigas no entienden por qué le entusiasma una blusa \"vieja\" — quiere comunidad.",
      ],
      canales_consumo: [
        "TikTok intenso (2 horas/día, sigue cuentas vintage y haul de segunda mano).",
        "Instagram (1 hora/día, ve historias y reels).",
        "WhatsApp (canal de comunicación con amigas).",
        "Pinterest (referencias de outfits).",
        "Spotify (escucha podcasts de moda y feminismo).",
      ],
      cita: "Yo no puedo pagar Bs 400 por una prenda. Pero Bs 80 por algo único que nadie más tiene, lo pago feliz. Y si me cuentas la historia de la pieza, mejor todavía.",
      objecion_tipica: "¿Cómo sé el talle si no me la pruebo? ¿Y si llega y me queda mal?",
    },
    {
      nombre: "María la madre joven con presupuesto",
      edad: 30,
      ocupacion: "Maestra de primaria en colegio privado de Sucre",
      ingreso_aprox: "Bs 3.500/mes líquido",
      ubicacion: "Vive en barrio Tucsupaya con su esposo (mecánico) y su hijo Mateo (3 años); alquila Bs 800.",
      motivaciones: [
        "Quiere verse bien para el trabajo (los lunes de reunión todas se ven arregladas).",
        "Tiene poco tiempo y poco presupuesto: necesita comprar rápido y bien.",
        "Su esposo no entiende por qué \"gasta\" en ropa, así que prefiere comprar cosas que se vean caras y haber pagado poco.",
        "Le gusta el estilo clásico/elegante (camisas, blazers, faldas midi); no quiere parecer adolescente.",
        "Le importa que la ropa dure: prefiere algodón y lino sobre poliéster.",
      ],
      frustraciones: [
        "Las tiendas formales de Sucre son carísimas (un blazer Bs 350-600 mínimo).",
        "El comercio en línea le da miedo: tres veces le llegó algo que no era la talla anunciada.",
        "Si paga por algo y no sirve, lloró el dinero — no puede correr a devolver.",
        "Algunas marcas \"sostenibles\" cobran tanto como las marcas regulares; le parece elitismo.",
        "Tiene poco tiempo para mirar redes: si entra al feed, busca rápido y compra rápido.",
      ],
      canales_consumo: [
        "Instagram (entra 30 min en la tarde después del trabajo).",
        "WhatsApp (canal principal, recibe muchos catálogos).",
        "Facebook Marketplace ocasional.",
        "TikTok poco (15 min en la noche).",
        "Recomendaciones de su grupo de mamás (whatsapp del colegio).",
      ],
      cita: "Si veo una blusa que se ve elegante, me dices que es Bs 95 y me das medidas exactas en centímetros, te compro al toque. Pero no aguanto sorpresas, ni esperas de 3 semanas.",
      objecion_tipica: "¿Estoy comprando ropa de muerto o de gente enferma? ¿Está bien lavada?",
    },
  ],
  mix: [
    {
      categoria: "Producto",
      decision: "Catálogo rotativo de 60-80 piezas únicas/mes. Cada pieza fotografiada en plano detalle + en cuerpo (Daniela o modelo amiga) + medida exacta (largo, busto, cadera en cm). Descripción con relato corto (\"esta blusa llegó de Buenos Aires en 2010, te dejas el cuello abierto y queda magia\").",
      justificacion: "El \"producto\" real es la curaduría + fotografía + descripción. Resuelve las dos objeciones principales (\"¿qué talle?\" y \"¿es bonita?\"). Cada pieza es venta única — no hay reposición.",
    },
    {
      categoria: "Producto",
      decision: "Línea de servicio gratuito: \"Asesoría de estilo express\" vía WhatsApp — el cliente envía foto + medidas y Daniela arma una selección personalizada de 5-8 piezas para esa persona.",
      justificacion: "Diferencia frente a cuentas de segunda mano genéricas. Conversión esperada 50% (mejor que feed pasivo 8%). Construye relación con el cliente — el primer pedido es un primer pedido, no una visita única.",
    },
    {
      categoria: "Producto",
      decision: "Garantía de \"si no te queda, te lo cambio\" — el cliente puede devolver dentro de 5 días por crédito (no efectivo) si la prenda no le calza bien, siempre que esté en estado original.",
      justificacion: "Quita la objeción principal de María. Costo bajo porque <12% de los pedidos llegan a devolución y se reincorpora al stock. Crédito (no efectivo) mantiene el cashflow.",
    },
    {
      categoria: "Precio",
      decision: "Rango Bs 45-180 por pieza. Promedio Bs 85. Sin descuentos por volumen al inicio. \"Combos de outfit completo\" (3 piezas que combinan): Bs 220 con descuento 8%.",
      justificacion: "Mercado: cancha Bs 15-25, ropa americana al kilo Bs 30-50, marca nueva nacional Bs 200-450, fast fashion Bs 90-200. Recicla se ubica entre kilo y nacional: paga premium por curaduría, no por marca.",
    },
    {
      categoria: "Precio",
      decision: "Pago QR (Banco Sol, Banco BISA), o transferencia. Envío Bs 12 dentro de Sucre, Bs 25 a otras ciudades (Cruz del Sur encomienda).",
      justificacion: "QR es estándar boliviano de pago digital. El envío Bs 25 a ciudad nacional es subsidio parcial (costo real Bs 35-40) pero amortiza con ticket de Bs 220+. Sin envío no hay alcance nacional.",
    },
    {
      categoria: "Plaza",
      decision: "100% online: Instagram (@recicla.bo) + TikTok (@recicla.bo) como vitrinas principales. Catálogo completo en linktr.ee con WhatsApp Business como punto de venta. SIN página web propia el primer año.",
      justificacion: "Cero inversión en tecnología. WhatsApp Business catalog es gratuito y funcional. La tienda \"vive\" donde los clientes ya están (Instagram + TikTok), no donde Daniela quiere que estén.",
    },
    {
      categoria: "Plaza",
      decision: "Envíos vía Cruz del Sur encomienda (24-48h Sucre → cualquier capital). Empaque reutilizable de algodón con sticker \"Recicla\" + tarjeta con código de descuento para amiga (5% off su próximo pedido).",
      justificacion: "Cruz del Sur tiene cobertura nacional confiable y económica. El empaque es viralidad pura (Valentina lo fotografía y lo postea). El código de descuento para amiga es referido sin CAC.",
    },
    {
      categoria: "Promocion",
      decision: "TikTok orgánico como motor principal: 3 contenidos/semana. Formatos rotando: (1) Hauls de piezas nuevas (\"Conseguí esto en una tienda en Sucre por Bs 8 y vendo en Bs 75\"), (2) Try-on (Daniela modelando cada prenda en cámara), (3) Educativo (\"Cómo lavar tu compra de segunda mano sin que se arruine\").",
      justificacion: "Sin presupuesto, el orgánico es el motor. TikTok tiene mejor alcance orgánico que Instagram para cuentas nuevas. Formato \"haul de segunda mano\" tiene engagement alto en hispano LATAM.",
    },
    {
      categoria: "Promocion",
      decision: "Instagram complementario: 2 posts (carrusel de outfit) + 4 stories diarias (piezas nuevas en vivo, encuestas \"¿Cuál te gusta más?\"). 1 reel/semana (re-edición de un TikTok exitoso).",
      justificacion: "Instagram convierte mejor a María (madre joven). Stories diarias mantienen recencia. Reels reciclados de TikTok ahorran tiempo de producción 70%.",
    },
    {
      categoria: "Promocion",
      decision: "Colaboración mensual con 1 micro-influencer Sucre (8k-15k seguidores, target nuestro) — intercambio: 2 piezas regaladas a cambio de 1 reel + 3 stories. Sin pago en efectivo.",
      justificacion: "Sin presupuesto para pagar influencers grandes, se canjea producto por contenido. Una micro-influencer de Sucre que postea desbloquea audiencia local que aún no nos sigue.",
    },
    {
      categoria: "Promocion",
      decision: "Anuncios pagados MUY puntuales: Bs 300/mes en Meta Ads boosteando los 2 mejores reels orgánicos (los que ya tienen >5% engagement). Target: mujeres 18-32 Bolivia interesadas en moda y sostenibilidad.",
      justificacion: "No se desperdicia Bs 1.800 en ads de creativos desconocidos. Solo se pagan los reels que YA funcionaron orgánicamente. CPL estimado Bs 12 (vs Bs 30+ si publicitara creativos nuevos).",
    },
  ],
  presupuesto: {
    total_bs_mes: 1800,
    desglose: [
      {
        canal: "Producción de contenido (luz aro, ringlight, telón blanco, edición CapCut Pro)",
        monto_bs_mes: 250,
        resultado_esperado: "Setup completo amortizado en 4 meses. 12 reels + 12 carruseles + 24 stories profesionales/mes producidos por Vale (hermana).",
      },
      {
        canal: "Hermana Vale (community manager) — pago simbólico",
        monto_bs_mes: 600,
        resultado_esperado: "Vale (estudiante de comunicación) edita contenido, programa, responde DMs y maneja WhatsApp. 25 horas/semana equivalente. Pago Bs 600 (simbólico, es familia).",
      },
      {
        canal: "Meta Ads — boost selectivo de reels orgánicos exitosos",
        monto_bs_mes: 300,
        resultado_esperado: "Solo se boostean reels con engagement orgánico >5%. Alcance pagado adicional 12.000-18.000 cuentas. 22-30 leads cualificados.",
        cpl_estimado_bs: 12,
      },
      {
        canal: "Stock para canje con micro-influencers (2 piezas/mes regaladas)",
        monto_bs_mes: 180,
        resultado_esperado: "1 colaboración mensual con micro-influencer Sucre (8k-15k). 1 reel + 3 stories. Alcance orgánico 4k-8k impresiones. 15-25 nuevos seguidores cualificados.",
        cpl_estimado_bs: 12,
      },
      {
        canal: "Empaque branded (bolsas algodón con sticker + tarjetas referido)",
        monto_bs_mes: 220,
        resultado_esperado: "60 empaques al mes para todos los pedidos. Costo Bs 3,5/pedido. Genera viralidad post-entrega: 25% de clientes fotografía y comparte. Referidos via tarjeta: 8-12/mes.",
      },
      {
        canal: "Compra de prendas estratégicas para hauls TikTok",
        monto_bs_mes: 250,
        resultado_esperado: "Compra puntual de 8-12 piezas \"showstopper\" (caras de original pero compradas por nosotros a Bs 8-12) para hauls de TikTok que se viralizan. Stock que después se vende.",
      },
    ],
    roas_proyectado: 5.8,
  },
  calendario: [
    {
      semana: 1,
      tipo: "Lanzamiento orgánico TikTok",
      canal: "TikTok @recicla.bo",
      contenido: "Reel manifiesto: \"Esta soy yo (Daniela). Estudié moda. Detesto Shein. Curo ropa segunda mano que NO es ropa americana al peso. Esto es Recicla\". 60s, primera pieza visual fuerte. Hashtags: #SegundaMano #Sucre #Recicla #Bolivia.",
    },
    {
      semana: 1,
      tipo: "Haul TikTok",
      canal: "TikTok",
      contenido: "Reel \"Conseguí 15 piezas hoy en Yotala por Bs 230, mira lo que encontré\". Muestra cada pieza con precio al que la vende. Tipo de contenido con mejor engagement en LATAM en 2026.",
    },
    {
      semana: 2,
      tipo: "Try-on",
      canal: "TikTok + Instagram",
      contenido: "Reel \"Me pruebo 8 piezas de mi tienda\" — Daniela cambiándose ropa rapidísimo, mostrando cada outfit con precio. Edición ágil, música trending de TikTok.",
    },
    {
      semana: 2,
      tipo: "Carrusel Instagram",
      canal: "Instagram",
      contenido: "Carrusel \"Por qué Recicla NO es ropa americana al peso\" — 7 slides comparando (con fotos): el caos del peso vs el orden curado. Educa al cliente nuevo. Cierra con CTA \"escríbenos para tu primer pedido\".",
    },
    {
      semana: 3,
      tipo: "Educativo TikTok",
      canal: "TikTok",
      contenido: "Reel \"Cómo lavar tu compra de segunda mano sin que se arruine: 3 trucos que aprendí en USFX\". Daniela explica con voz y demostración. Posiciona expertise.",
    },
    {
      semana: 3,
      tipo: "Colaboración con micro-influencer #1",
      canal: "Instagram (@valeria.scre, 11k seguidores Sucre)",
      contenido: "Vale envía 2 piezas a Valeria (micro-influencer Sucre). Brief: \"siéntete libre, hazlo a tu estilo\". Valeria publica 1 reel + 3 stories con linktr.ee. Conversión esperada: 8-12 nuevos clientes.",
    },
    {
      semana: 4,
      tipo: "Boost de mejor reel",
      canal: "Meta Ads",
      contenido: "Boostear el reel orgánico con mejor engagement (probablemente el haul o try-on). Bs 100 a target mujeres 18-32 Bolivia interesadas en moda. Alcance esperado: 8.000-12.000.",
    },
    {
      semana: 4,
      tipo: "Encuesta IG Stories + carrusel decisivo",
      canal: "Instagram",
      contenido: "Stories con encuestas \"¿Cuál te gusta más?\" usando 6 piezas nuevas. La ganadora se publica como carrusel principal del feed. Engagement + venta dirigida a la pieza ganadora.",
    },
    {
      semana: 5,
      tipo: "Haul TikTok #2 + nicho Y2K",
      canal: "TikTok",
      contenido: "Reel \"Solo piezas Y2K que entraron esta semana\" — apuntando al nicho Valentina. 6 piezas mostradas, precio Bs 65-120, links en bio. Hashtag #Y2KBolivia.",
    },
    {
      semana: 5,
      tipo: "Story diaria \"Pieza del día\"",
      canal: "Instagram Stories",
      contenido: "Cada día Vale postea 1 pieza nueva al feed de stories con sticker de \"DM para comprar\". Diaria genera hábito de check. Conversión 3-5 piezas/semana.",
    },
    {
      semana: 6,
      tipo: "Reel viral aspiracional",
      canal: "TikTok + Instagram",
      contenido: "\"3 looks completos por menos de Bs 250\" — Daniela arma 3 outfits con piezas de Recicla. Foto profesional. Engagement alto y permite \"shop the look\".",
    },
    {
      semana: 6,
      tipo: "Activación referidos",
      canal: "WhatsApp (a clientes que ya compraron)",
      contenido: "Mensaje a las 35 clientas que ya compraron: \"Si me traes una amiga este mes, las dos tienen 10% off en su próxima compra\". Activa el boca-a-boca dormido.",
    },
    {
      semana: 7,
      tipo: "Colaboración con micro-influencer #2",
      canal: "Instagram (@vivisotomayor, 9k seguidores LP-Sucre)",
      contenido: "Vivi (estudiante de moda en La Paz) recibe 3 piezas. Publica reel \"Stylist day: Recicla edition\" mostrando 3 outfits diferentes con las 3 piezas. Llega a audiencia La Paz nueva.",
    },
    {
      semana: 7,
      tipo: "Live de Instagram",
      canal: "Instagram Live",
      contenido: "Live de 45 min: \"Te muestro 25 piezas nuevas en vivo, responde tus dudas de talles\". Las que se venden en live tienen 5% off. Genera urgencia + ventas en bloque.",
    },
    {
      semana: 8,
      tipo: "Recap + contenido aniversario \"2 meses Recicla\"",
      canal: "Instagram + TikTok",
      contenido: "Carrusel \"2 meses de Recicla: 78 piezas vendidas, 4 ciudades, 132 personas curadas\". Construye prueba social. Reel emocional cerrando el ciclo. Empuja indecisos.",
    },
  ],
  kpis: [
    "Seguidores nuevos en TikTok + Instagram (combinado): meta 1.800 mes 1, 6.500 mes 6.",
    "Engagement rate TikTok: meta ≥7% (excelente para LATAM).",
    "Ventas mensuales: meta Bs 8.500 mes 1, escalar a Bs 14.500 mes 6 (ROAS 5.8x).",
    "Conversión DM → venta: meta 28% (la asesoría personalizada eleva esta cifra).",
    "Ticket promedio: meta Bs 95 (single piece) o Bs 220 (combo).",
    "Tasa de devolución: meta <12% (calidad de fotos y medidas correctas).",
    "Tasa de re-compra trimestral: meta 45% (las clientas regresan dentro de 90 días).",
  ],
  conclusion: "Plan **viable con esfuerzo intensivo**. Bs 1.800/mes no compra visibilidad, así que el 80% del éxito depende de la calidad y cantidad de contenido orgánico (3 piezas/semana en TikTok). Daniela y Vale trabajan ~40 horas/semana combinadas: si una de ellas falla, el plan se cae. ROAS proyectado 5.8x es realista solo si el contenido conecta — un solo reel viral puede traer 800 seguidores y 25 ventas en 48h. El verdadero techo del negocio NO es el marketing sino la capacidad de Daniela para curar 60-80 piezas únicas al mes desde Sucre.",
  lecciones: [
    "Cuando no hay presupuesto, el contenido orgánico ES la estrategia, no un complemento. Frecuencia (3/semana) y formato (haul, try-on, educativo) son no negociables.",
    "Boostear solo lo que YA funcionó orgánicamente baja el CPL 3-5x vs ads de creativos no probados.",
    "Empaque branded con tarjeta de referidos convierte CADA pedido en una pieza de marketing post-entrega.",
    "Asesoría 1:1 vía WhatsApp tiene conversión 5x sobre feed pasivo — vale el tiempo aunque no escale al infinito.",
    "Canje (producto por contenido) con micro-influencers locales es el sustituto pobre de los ads pagados — funciona solo si el producto se ve bien en cámara.",
  ],
  errores_evitados: [
    "No intentar replicar Shein con precio bajo (perderías porque Shein tiene 1.000x tu capacidad). Compite en curaduría y storytelling, no en precio.",
    "No abrir tienda física antes de mes 12 — el costo fijo te entierra. WhatsApp + Instagram cubren todo al inicio.",
    "No publicar piezas sin foto de cuerpo y medidas en cm — las devoluciones se disparan a 40%.",
    "No bajar el precio de una pieza que no se vendió en 2 semanas — destrúyele el posicionamiento de \"piezas únicas\". Mejor combinarla con otra en combo.",
    "No pagar influencers con dinero al inicio — solo canje. Quien no acepta canje no es influencer real para tu nicho.",
  ],
  tags: ["moda", "segunda-mano", "sostenibilidad", "4P", "low-budget", "Sucre", "TikTok", "organico"],
};
