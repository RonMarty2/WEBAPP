import type { CasoMarketing } from "../types";

/**
 * Caso 5 — Empanadas premium con marketing de Bs 1.500/mes (El Alto).
 *
 * Caso **básico** de marketing con presupuesto MICRO (Bs 1.500/mes)
 * para un emprendimiento alimentario familiar de barrio. Mix 4P
 * sencillo, dos buyer personas hiperlocales (oficinista altopaceño +
 * ama de casa), calendario que mezcla WhatsApp Status + voz a voz +
 * UN solo anuncio FB Ads geolocalizado pequeño. KPIs simples
 * (pedidos diarios, recompra semanal). Pedagógicamente útil porque
 * muestra que marketing efectivo NO requiere miles de bolivianos.
 */

export const casoEmpanadasElAlto: CasoMarketing = {
  slug: "empanadas-elalto-bs1500",
  modulo: "marketing",
  titulo: "Empanadas premium con presupuesto de Bs 1.500/mes",
  tagline: "Plan de marketing micro-presupuesto para profesionalizar la venta callejera de Doña Carmen — empanadas \"D\\u0027 Carmen\" en la Ceja de El Alto con WhatsApp + voz a voz + 1 anuncio focalizado.",
  zona: "Ceja de El Alto (La Paz)",
  rubro: "Alimentación / venta callejera profesionalizada",
  dificultad: "basico",
  emoji: "🥟",
  emprendedor: {
    nombre: "Doña Carmen Apaza (47) + hijo Junior (22)",
    edad: 47,
    rol: "Doña Carmen lleva 8 años vendiendo empanadas en la Ceja de El Alto, desde un puesto fijo en av. 16 de Julio. Su hijo Junior estudia administración en EMI (Escuela Militar de Ingeniería) tercer año y la está ayudando a profesionalizar el negocio: nombre, marca, redes.",
  },
  contexto: [
    "Doña Carmen empezó vendiendo empanadas en 2018 cuando su esposo Fernando perdió el trabajo de albañil. Aprendió la receta de su mamá (con cordero molido y queso criollo) y se instaló en un puesto pequeño en la Ceja. Vende lunes a sábado, 7:00-13:00, unas 80-120 empanadas/día. Cliente fiel pero hiperlocal: gente que pasa, taxistas, trabajadores informales.",
    "Junior, su hijo mayor, ingresó a la EMI en 2024. En la materia \"emprendimientos\" se propuso ayudar a profesionalizar el negocio de su mamá. Diagnóstico: la empanada es buena (Doña Carmen gana 7 concursos barriales), el problema es que NADIE FUERA DE 200 METROS del puesto sabe que existe. Cero presencia digital, cero marca, cero recordación.",
    "Junior propuso: poner nombre (\"D\\u0027 Carmen\"), hacer logo, abrir WhatsApp Business, instalar mesita para clientes que comen ahí, y hacer un poco de marketing digital con presupuesto que MUY MUY pequeño porque la familia depende del ingreso diario. Bs 1.500/mes es lo máximo que se puede destinar a marketing los primeros 3 meses sin afectar la operación.",
  ],
  problema: "Doña Carmen tiene producto validado por 8 años pero opera invisible: sin marca, sin recordación, sin canal de fidelización. ¿Cómo hacer marketing efectivo con Bs 1.500/mes para subir de 100 a 200 empanadas/día sin descapitalizar a la familia?",
  segmento: "Trabajadores que pasan por la Ceja de El Alto entre 7:00 y 13:00 (oficinistas altopaceños, taxistas, vendedores de mercado, profesores) y amas de casa que compran para llevar a la familia. NSE C-/D, 25-60 años, dentro de 1.5 km del puesto.",
  buyer_personas: [
    {
      nombre: "Pablo el oficinista altopaceño",
      edad: 29,
      ocupacion: "Empleado administrativo en cooperativa de transporte (oficina cerca de la Ceja)",
      ingreso_aprox: "Bs 2.800/mes líquido",
      ubicacion: "Vive en alquiler de Bs 600 en Villa Adela; trabaja en oficina en av. 6 de Marzo; toma minibús a las 7:30; almuerza por la zona; vuelve a casa 18:00.",
      motivaciones: [
        "Desayuna en la calle todos los días: salteñas, empanadas, sándwich de chola, lo que sea barato y rápido.",
        "Le gusta lo casero — extraña los desayunos de su mamá que vive en Achacachi (visita una vez al mes).",
        "Tiene 12 minutos entre que se baja del minibús y llega a la oficina; el desayuno tiene que ser rapidísimo.",
        "Es del barrio, conoce la Ceja y desconfía de novedades \"de afuera\" — pero si una vecina le recomienda, prueba.",
        "Quiere sentirse cuidado: que sepan su nombre, que le pregunten cómo está su mamá.",
      ],
      frustraciones: [
        "Las salteñas en la Ceja muchas veces están frías o secas al pasar de las 10:00.",
        "Los precios subieron en 2025-2026 pero la calidad bajó (porciones más chicas, masa industrial).",
        "No tiene memoria de qué puesto le gusta más — todos se parecen y van rotando.",
        "Si llueve, no tiene dónde sentarse a comer; come parado.",
        "Compra el viernes para llevar a su casa los sábados, pero los puestos no aceptan reservas — tiene que llegar temprano o se queda sin.",
      ],
      canales_consumo: [
        "WhatsApp (canal principal, 80% del uso de celular).",
        "Facebook (1 hora/día, grupos de El Alto y noticias).",
        "TikTok (30 min/noche).",
        "Radio en el minibús (Radio Pachamama, Erbol).",
        "Voz a voz del barrio (vecinos, colegas).",
      ],
      cita: "Yo no busco la empanada gourmet, busco la empanada de mi mamá. Si tu empanada me sabe a casa de mi abuela en Achacachi, te compro hasta que cierres.",
      objecion_tipica: "¿Por qué te tengo que pagar Bs 5 si la del otro lado cuesta Bs 3,50?",
    },
    {
      nombre: "Doña Marta la ama de casa",
      edad: 50,
      ocupacion: "Ama de casa + venta ocasional de cosméticos (Yanbal/Avon)",
      ingreso_aprox: "Bs 1.500-2.500/mes equivalentes (ingreso variable + apoyo del esposo, taxista)",
      ubicacion: "Casa propia en Villa Tunari (a 1.2 km de la Ceja); 3 hijos (10, 14, 18 años); compra en mercado Bolívar y en la Ceja.",
      motivaciones: [
        "Quiere alimentar a la familia con cosas que SIENTAN caseras (la empanada industrial congelada no le gusta).",
        "Le ahorra trabajo: comprar 12 empanadas para la lonche es comprar la cena.",
        "Le gusta el ritual del fin de semana: pasa por la Ceja sábado al mediodía y trae empanadas para todos.",
        "Tiene memoria de marcas con dueño visible — confía en \"Doña Carmen\" más que en \"Empanadas XYZ\".",
        "Comparte recomendaciones por WhatsApp con su grupo de vecinas y amigas Yanbal.",
      ],
      frustraciones: [
        "Algunas empanadas se enfrían rápido y los hijos se quejan.",
        "Los precios suben sin avisar — un día Bs 3,50, otro día Bs 4.",
        "Los puestos no son higiénicos a veces (mosca, manos sin guantes).",
        "No puede pedir por adelantado: tiene que ir físicamente y a veces hay que esperar 20 min.",
        "Cuando llega cumpleaños de algún familiar, quiere pedir 30-40 empanadas y nadie se las prepara con tiempo.",
      ],
      canales_consumo: [
        "WhatsApp (chat permanente con vecinas y familia).",
        "Facebook (busca recomendaciones de comida en grupos \"El Alto Bonito\").",
        "Radio (Erbol, Compañera).",
        "Voz a voz del mercado y de Yanbal.",
        "Televisión local (PAT Canal 7).",
      ],
      cita: "A mí no me importa pagarte 50 centavos más si me das higiene, calor y me reservas mis 12 empanadas el sábado. Lo que no perdono es la mosca encima de la sal.",
      objecion_tipica: "¿Es la misma Doña Carmen que vende en la Ceja? Si es otra persona disfrazada, no me interesa.",
    },
  ],
  mix: [
    {
      categoria: "Producto",
      decision: "Tres variedades: Empanada Cordero & Queso (la receta histórica de Doña Carmen, Bs 4,50), Empanada Pollo Suave (más light, Bs 4), Empanada Dulce de Manzana (postre, Bs 3,50). Tamaño grande (130g cada una, vs 90g del promedio del puesto vecino).",
      justificacion: "Producto bien tres niveles cubren tres consumos: salado fuerte (Pablo), suave (todos los públicos), dulce (acompañar café). Tamaño superior justifica precio premium. Receta original no se toca.",
    },
    {
      categoria: "Producto",
      decision: "Servicio agregado: reserva por WhatsApp para retirar a hora específica + reservas de cantidad mayor (15+ empanadas) con 12 horas de antelación. Caja de 12 (\"docena de la casa\") con descuento.",
      justificacion: "Resuelve dolor de Doña Marta (\"no puedo reservar\") y desbloquea pedidos para eventos familiares. Caja de 12 sube ticket promedio de Bs 9 a Bs 48 por cliente.",
    },
    {
      categoria: "Producto",
      decision: "Mesa rebatible de 6 lugares en el costado del puesto (lonas a los costados para protección de lluvia y viento). Servilletas, mostaza, ají de la casa.",
      justificacion: "Resuelve dolor de Pablo (\"si llueve, no tengo dónde sentarme\"). Inversión Bs 280 amortizada en 2 meses. Aumenta tiempo de permanencia y posibilidad de segunda empanada o jugo.",
    },
    {
      categoria: "Precio",
      decision: "Empanada Cordero Bs 4,50 (mercado Bs 3,50-4). Empanada Pollo Bs 4. Empanada Dulce Bs 3,50. Docena de la casa (12 empanadas mix) Bs 48 (descuento Bs 4 sobre suelta).",
      justificacion: "Premium del 12-28% sobre puesto vecino, sostenido por: tamaño 130g vs 90g, marca con nombre, higiene visible, posibilidad de reservar. Margen unitario Bs 1,40 (cordero 31%, pollo 35%, dulce 28%).",
    },
    {
      categoria: "Precio",
      decision: "Cobranza preferida en efectivo + QR Banco Sol (operación familiar registrada por Junior). Tarjeta no. \"Cuenta\" para 3 clientes fijos (taxistas que pagan al final de la semana).",
      justificacion: "QR es el desbloqueo del cliente más joven (Pablo) que ya no carga efectivo. La cuenta semanal para taxistas conocidos fideliza al cliente más fiel del negocio.",
    },
    {
      categoria: "Plaza",
      decision: "Puesto fijo en av. 16 de Julio (Ceja de El Alto), atendido lunes-sábado 7:00-13:00. Toldo rojo con logo grande \"D\\u0027 Carmen — empanadas caseras\".",
      justificacion: "Ubicación de 8 años con flujo peatonal validado (3.500-4.500 personas/día pasan). El toldo visible con marca convierte el flujo invisible en recuerdo (Pablo lo ve, recuerda al día siguiente).",
    },
    {
      categoria: "Plaza",
      decision: "Servicio express WhatsApp: pedido hasta 11:00, retiro en el puesto entre 12:00 y 13:00. Sin delivery (Doña Carmen NO sale del puesto). Junior gestiona los chats.",
      justificacion: "No abrir delivery con bicicleta o moto (no hay capital ni personal). El retiro programado captura al cliente que QUIERE su empanada caliente sin esperar. Costo cero.",
    },
    {
      categoria: "Promocion",
      decision: "WhatsApp Business como canal #1: lista de difusión con clientes capturados en el puesto (Junior pide número a quien compra 2+ veces). Status diario con foto de las empanadas del día.",
      justificacion: "WhatsApp es el canal donde viven Pablo y Doña Marta. Status diario mantiene recencia. La lista de difusión es CAC cero y conversión 12-18% (alta para cualquier canal).",
    },
    {
      categoria: "Promocion",
      decision: "Voz a voz incentivado: tarjeta de fidelidad \"10 empanadas + 1 gratis\" con sello en cada compra. Doña Carmen entrega y conoce a cada cliente por nombre tras 3 visitas.",
      justificacion: "Construye relación humana (motivación clave de Pablo: \"que sepan mi nombre\"). La tarjeta de 11 visitas tiene retención >60%. CAC efectivo: el costo de 1 empanada gratis cada 10 ventas (3%).",
    },
    {
      categoria: "Promocion",
      decision: "Un solo anuncio Facebook Ads geolocalizado: radio 1.5 km alrededor del puesto, dirigido a personas que pasan por la Ceja. Bs 200/mes. Mensaje: \"D\\u0027 Carmen — empanadas caseras de cordero y queso en la Ceja. Reserva por WhatsApp\".",
      justificacion: "Facebook tiene mayor penetración en El Alto que Instagram (NSE C-/D). Geo-segmentación al radio del puesto es lo único que paga la pena. CPL esperado Bs 8-12.",
    },
    {
      categoria: "Promocion",
      decision: "Alianza con 2 taxistas conocidos de la zona — tarjetas de Doña Carmen en sus parabrisas, descuento del 10% en empanadas para los taxistas a cambio.",
      justificacion: "Cada taxista ve 80-150 personas/día. El intercambio de tarjeta + descuento cuesta Bs 0.45/empanada (los taxistas comen 3 al día). Alcance equivalente a anuncio Facebook gratuito.",
    },
  ],
  presupuesto: {
    total_bs_mes: 1500,
    desglose: [
      {
        canal: "WhatsApp Business pro + datos celular para Junior (canal de pedidos)",
        monto_bs_mes: 90,
        resultado_esperado: "Comunicación con clientes (lista de difusión 80+ clientes), recepción de 40-60 pedidos/semana, status diario que ven 200+ personas.",
      },
      {
        canal: "Facebook Ads geolocalizado (anuncio único)",
        monto_bs_mes: 200,
        resultado_esperado: "Anuncio dirigido a radio 1.5 km alrededor de la Ceja. Alcance 8.000-12.000 personas/mes. 15-25 conversiones nuevas a través de WhatsApp.",
        cpl_estimado_bs: 10,
      },
      {
        canal: "Diseño inicial (logo, toldo, tarjetas de fidelidad, kit de redes) — pago a diseñador de la EMI",
        monto_bs_mes: 200,
        resultado_esperado: "Inversión inicial concentrada en mes 1: logo profesional, toldo impreso 2×3 m, 200 tarjetas de fidelidad, 500 stickers, plantilla redes. Amortizable a 8 meses.",
      },
      {
        canal: "Empaque para reservas y docenas (cajas de cartón con sticker, bolsas de papel)",
        monto_bs_mes: 280,
        resultado_esperado: "200 cajas/mes (Bs 1.40 c/u) + 300 bolsas pequeñas. Empaque consistente eleva percepción de calidad. Bolsa con sticker se ve en la calle = marketing gratis.",
      },
      {
        canal: "Costo de tarjetas de fidelidad (1 empanada gratis/10 visitas, costo recurrente)",
        monto_bs_mes: 220,
        resultado_esperado: "Aprox 70 empanadas regaladas al mes (cada cliente recurrente reclama 1 cada 10 compras). Costo del producto Bs 3.10/empanada. Retención esperada 65%.",
      },
      {
        canal: "Inversión mensual en higiene y materiales (guantes, gorros, redecillas, desinfectante visible)",
        monto_bs_mes: 250,
        resultado_esperado: "Guantes desechables, gorros, alcohol gel visible para el cliente, mandil nuevo cada mes. Diferenciación visible vs puestos vecinos.",
      },
      {
        canal: "Comisión micro a 2 taxistas aliados (tarjeta en parabrisas + descuento empanadas)",
        monto_bs_mes: 260,
        resultado_esperado: "Cada taxista come 60-80 empanadas/mes con 10% off (costo Bs 130 c/u en producto). Lleva referidos: 8-15 personas/mes que mencionan al taxista.",
        cpl_estimado_bs: 18,
      },
    ],
    roas_proyectado: 4.8,
  },
  calendario: [
    {
      semana: 1,
      tipo: "Instalación toldo + lanzamiento",
      canal: "Puesto físico + WhatsApp Status",
      contenido: "Instalar toldo \"D\\u0027 Carmen\" nuevo + sticker en empanadas + Junior toma fotos profesionales. Status WhatsApp: \"Después de 8 años, mami estrena toldo. Pásame a probar las empanadas\".",
    },
    {
      semana: 1,
      tipo: "Activación WhatsApp + cosecha de números",
      canal: "Puesto físico",
      contenido: "Junior está en el puesto 8:00-10:00 cada día semana 1. Habla con cada cliente que compra 2+ empanadas y pide WhatsApp para enviar promociones. Meta 40 números semana 1.",
    },
    {
      semana: 2,
      tipo: "Lanzamiento anuncio Facebook",
      canal: "Facebook Ads",
      contenido: "Activar anuncio geolocalizado radio 1.5 km. Imagen: foto de la empanada partida con vapor + Doña Carmen sonriendo. CTA: \"Reserva por WhatsApp 71XXX\". Bs 200 al mes.",
    },
    {
      semana: 2,
      tipo: "Tarjeta de fidelidad arranque",
      canal: "Puesto físico",
      contenido: "Entregar tarjeta de fidelidad \"10 + 1 gratis\" a cada cliente. Doña Carmen explica personalmente. Diseño con logo del puesto + espacios para sellar.",
    },
    {
      semana: 3,
      tipo: "WhatsApp Status pedagógico",
      canal: "WhatsApp Status (200+ contactos)",
      contenido: "Status: video de 15s mostrando el relleno fresco siendo preparado a las 6:00 AM. \"Por qué la empanada de D\\u0027 Carmen es diferente: 100% de cordero, 100% de la receta de mi mamá hace 30 años\".",
    },
    {
      semana: 3,
      tipo: "Alianza con taxistas",
      canal: "Boca a boca",
      contenido: "Junior contacta a 2 taxistas habituales del puesto. Propuesta: \"Tu poner mi tarjeta en parabrisas, tu comes con 10% de descuento\". 2 taxistas aceptan. Tarjeta visible para ~250 pasajeros/día.",
    },
    {
      semana: 4,
      tipo: "Test del sábado especial",
      canal: "WhatsApp + puesto",
      contenido: "Lanzar primer sábado de \"Docena de la casa\": foto en WhatsApp Status el viernes a las 18:00 anunciando 25 docenas disponibles para retirar el sábado 11:00-13:00. Crea urgencia. Capturar pedidos hasta el viernes 22:00.",
    },
    {
      semana: 4,
      tipo: "Activación radio (canje gratis)",
      canal: "Radio Pachamama (programa local)",
      contenido: "Junior contacta locutor de radio popular en El Alto. Le invita a probar D\\u0027 Carmen gratis y le pide menciones honestas si le gustan. Costo cero, alcance 20.000 oyentes.",
    },
    {
      semana: 5,
      tipo: "Reseñas de clientes en Status",
      canal: "WhatsApp Status",
      contenido: "Capturar 4 clientes habituales pidiendo si se animan a grabar 10s diciendo por qué les gusta D\\u0027 Carmen. Junior edita, publica en Status. Mucho mejor que cualquier anuncio pagado.",
    },
    {
      semana: 5,
      tipo: "Sticker WhatsApp del cumple",
      canal: "WhatsApp",
      contenido: "Junior cuelga sticker \"Hoy es cumple de mami Carmen — empanada dulce extra gratis con cada Docena de la casa\". Genera tráfico, conexión emocional. 38 docenas vendidas ese día (récord).",
    },
    {
      semana: 6,
      tipo: "Optimización anuncio FB",
      canal: "Facebook Ads",
      contenido: "Revisión de métricas semana 1-5 del anuncio. Identificar el creativo que tuvo más conversiones (Junior chequea desde celular). Pausar el peor, escalar el mejor a Bs 250 si funciona.",
    },
    {
      semana: 6,
      tipo: "Visita de inspección SENASEG / municipal",
      canal: "Puesto + Facebook",
      contenido: "Junior tramita certificado de manipulación de alimentos para Doña Carmen y certificado de salubridad municipal. Publica las dos certificaciones en Facebook + foto enmarcada en el puesto.",
    },
    {
      semana: 7,
      tipo: "Cumpleaños del barrio",
      canal: "Puesto + Status WhatsApp",
      contenido: "Junior arma promo \"Cada 50 empanadas vendidas en el día, regalo 5 a algún vecino del barrio\". Genera buzz local y refuerza identidad \"de la Ceja\". Costo Bs 31, alcance enorme.",
    },
    {
      semana: 7,
      tipo: "Captura de pedidos para domingo de la Mami",
      canal: "WhatsApp Status",
      contenido: "Anuncio: \"Domingo es el día de la Mami. Yo le hago empanadas a tu mamá: pídelas conmigo, te entrego cajita de 12 con tarjeta personalizada\". Pedidos hasta jueves 12:00. Doña Carmen abre el domingo excepcional.",
    },
    {
      semana: 8,
      tipo: "Reporte primer trimestre",
      canal: "Facebook + WhatsApp Status",
      contenido: "Post con foto de Doña Carmen y Junior: \"3 meses con D\\u0027 Carmen: de 100 a 180 empanadas/día, 165 clientes en lista de difusión, 12 docenas de la casa por semana. Gracias barrio\". Refuerza prueba social.",
    },
  ],
  kpis: [
    "Empanadas vendidas diarias: meta 100 (semana 1) → 180 (mes 3) → 220 (mes 6).",
    "Tasa de recompra semanal (cliente con tarjeta de fidelidad): meta ≥65%.",
    "Contactos WhatsApp en lista de difusión: meta 80 (mes 1), 220 (mes 6).",
    "Docenas reservadas por semana: meta 12 (mes 1) → 28 (mes 6). Ticket Bs 48.",
    "CPL del anuncio Facebook: meta ≤Bs 12 (vs estándar Bs 20-30 en La Paz).",
    "Tickets > Bs 30 por venta (docenas y reservas grandes): meta 22% del total de ventas.",
    "Ingreso mensual de la familia: meta Bs 7.500 (mes 1) → Bs 14.000 (mes 6, considerando los nuevos servicios).",
  ],
  conclusion: "Plan **viable y conmovedor**. Bs 1.500/mes es presupuesto MICRO pero suficiente porque el corazón del marketing es activo familiar gratuito (Junior trabajando 4h/día), reputación de 8 años acumulada por Doña Carmen, y un canal (WhatsApp) que ya está en cada bolsillo del barrio. La ganancia más importante NO es el anuncio Facebook sino la digitalización del cliente fiel (lista de difusión). ROAS 4.8x asume escalamiento gradual: en mes 6, las ventas habrán pasado de Bs 4.500/mes a Bs 7.200/mes solo de marketing, sin contar el crecimiento orgánico que el toldo + marca van trayendo. La trampa a evitar es comprometer la calidad de la empanada por crecer rápido — sería suicida.",
  lecciones: [
    "El marketing en NSE C-/D vive en WhatsApp y Facebook, NO en Instagram. Confundir el canal es perder la audiencia.",
    "La lista de difusión por WhatsApp (gratis) es el activo más valioso para un negocio de barrio. Capturar cada número desde el día 1.",
    "Geo-segmentar Facebook Ads a 1.5 km alrededor del puesto es lo único que paga el ad para un negocio físico hiperlocal.",
    "Empaque + toldo + uniforme convierten un puesto invisible en marca recordable. La inversión inicial Bs 600 paga retorno por años.",
    "Alianza con taxistas y conductores locales es marketing boca-a-boca pagado en producto, no en cash. CAC efectivo Bs 18 (mejor que cualquier canal digital).",
  ],
  errores_evitados: [
    "No intentar abrir delivery con moto/bicicleta — destruye el cashflow y la atención al cliente del puesto.",
    "No bajar el precio de la empanada para competir con puestos vecinos — perderías el margen que paga la nueva marca y los gastos.",
    "No publicar todo en Instagram — el cliente target está en Facebook y WhatsApp; Instagram es público no objetivo aquí.",
    "No descuidar la higiene visible (guantes, gorros) por ahorrar Bs 250/mes — un solo cliente intoxicado destruye 8 años de reputación.",
    "No \"profesionalizar\" tanto que se pierda el encanto barrial — Doña Carmen sigue saludando, sigue conociendo a los clientes por nombre.",
  ],
  tags: ["alimentacion", "micro-presupuesto", "4P", "WhatsApp", "El-Alto", "venta-callejera", "barrio", "hiperlocal"],
};
