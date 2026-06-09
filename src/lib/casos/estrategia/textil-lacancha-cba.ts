import type { CasoEstrategia } from "../types";

/**
 * Caso 2 — Reinvención estratégica de una microempresa textil de La
 * Cancha (Cochabamba) afectada por la importación masiva de ropa
 * Shein/AliExpress. Pivote desde jeans/poleras a uniformes
 * institucionales.
 *
 * Caso **intermedio**: ilustra PESTEL con foco en importaciones y
 * devaluación, Porter con Shein como amenaza, MPC con 3 talleres de
 * uniformes locales, FODA cruzado fuerte y matriz BCG para clasificar
 * la cartera actual de productos.
 */

export const casoTextilLacanchaCba: CasoEstrategia = {
  slug: "textil-lacancha-cba",
  modulo: "estrategia",
  titulo: "Microempresa textil en La Cancha post-Shein",
  tagline: "Reinvención de un taller de 25 años de jeans hacia uniformes institucionales para escuelas y empresas cochabambinas.",
  zona: "La Cancha + Av. Honduras (Cochabamba)",
  rubro: "Confección textil / B2B uniformes",
  dificultad: "intermedio",
  emoji: "🧵",
  emprendedor: {
    nombre: "Don Roberto Salinas",
    edad: 53,
    rol: "Comerciante textil 25 años. Empezó en 2000 con un puesto de jeans confeccionados en La Cancha (Calle Lanza, casetilla 14B). Llegó a tener 8 máquinas industriales Juki y emplear a 6 costureras. Sus ventas cayeron de Bs 48.000/mes (2019) a Bs 19.000/mes (2025) por la importación masiva de ropa china barata.",
  },
  contexto: [
    "Don Roberto vivió tres olas en La Cancha. La primera, los 2000-2010, cuando la ropa nacional competía bien con la importada por aranceles altos. La segunda, 2015-2019, cuando empezaron a llegar contenedores de China por Iquique. La tercera, 2020-2025, fue Shein y AliExpress: el consumidor cochabambino joven dejó de ir a La Cancha y empezó a pedir un jean Bs 65 que llega en 18 días vía courier.",
    "Hoy Don Roberto tiene 8 máquinas Juki industriales (3 rectas, 2 overlock, 1 collareta, 2 cerradoras codo) compradas entre 2008-2018, todas funcionales. Tiene 4 costureras de planta (las otras 2 dejaron en pandemia). Su hijo Marco (28 años, licenciado en administración UMSS) propuso pivotar el negocio hacia uniformes institucionales: escuelas, empresas, hoteles, restaurantes.",
    "Marco hizo una primera prospección: hay en Cochabamba 1.840 colegios fiscales + privados + de convenio, y solo 9 talleres reconocidos que producen uniformes a escala. El segmento empresa-restaurante-hotel está aún más fragmentado y se atiende mayoritariamente con sastres independientes. La pregunta estratégica es: ¿puede Don Roberto rearmar el taller para servir B2B antes de que se le acabe el capital?",
  ],
  problema: "Las ventas de jeans/poleras al consumidor final cayeron 60% por importaciones; el taller tiene capacidad ociosa 55% y capital de trabajo para 7 meses; sin pivote, cierra en 2026.",
  segmento: "Colegios privados y de convenio en Cochabamba (sur y centro), empresas medianas (50-300 empleados) en zonas industriales (Sacaba, Quillacollo), hoteles 3-4 estrellas y cadenas de restaurantes locales que requieren uniformes en lotes de 30-300 prendas con entrega mensual.",
  pestel: {
    politico: [
      {
        nombre: "Política de importaciones y aranceles ropa",
        descripcion: "Bolivia mantiene arancel 35% para confecciones (partidas 61 y 62) pero el cumplimiento aduanero es débil. Estimación AILA-Cochabamba: 70% de las prendas que entran a La Cancha tienen subvaluación o contrabando hormiga.",
        impacto: "negativo",
        intensidad: 5,
        implicacion: "No esperar protección efectiva del Estado. Pivotar a B2B donde el precio importado no es la única variable y donde el cliente exige facturas para descargar IVA.",
      },
      {
        nombre: "Compras públicas con preferencia a producción nacional",
        descripcion: "El DS 181 (Compras Estatales) da 20% de preferencia a empresas con producción nacional certificada. Aplica a colegios fiscales pero requiere inscripción RUPE y NIT activo.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Inscribirse en RUPE (Registro Único de Proveedores del Estado) — trámite gratuito 30 días. Abre licitaciones de colegios fiscales que hoy no son accesibles.",
      },
    ],
    economico: [
      {
        nombre: "Devaluación del boliviano y costo de tela importada",
        descripcion: "El 70% de la tela usada en confección en Bolivia se importa (mezclilla de China/Pakistán, gabardina de Perú). Con el tipo de cambio paralelo Bs 12-14 en 2026, el costo de tela subió 75% en Bs entre 2022 y 2026.",
        impacto: "negativo",
        intensidad: 5,
        implicacion: "Comprar tela en lotes grandes cuando el dólar baja temporalmente. Negociar contratos con cliente uniformes con cláusula de ajuste cambiario cada 6 meses.",
      },
      {
        nombre: "Caída de poder adquisitivo de consumidor final",
        descripcion: "El salario mínimo real en Bolivia perdió 18% de poder adquisitivo entre 2022-2026 según INE. El consumidor de jeans Bs 120 prefiere ahora Shein Bs 65.",
        impacto: "negativo",
        intensidad: 5,
        implicacion: "No competir en consumer mass. B2B vende a empresas que pagan con presupuesto institucional, menos sensible a inflación inmediata.",
      },
      {
        nombre: "Crédito Banco Unión PyMe textil",
        descripcion: "Banco Unión tiene línea para PyMes textiles con tasa 11,5% anual a 36 meses, hasta Bs 350.000 con garantía maquinaria. Requiere 2 años de NIT activo y declaraciones tributarias al día.",
        impacto: "positivo",
        intensidad: 3,
        implicacion: "Don Roberto califica. Aplicar préstamo Bs 180.000 para capital de trabajo del pivote (telas iniciales, marketing B2B, contratar diseñador).",
      },
    ],
    social: [
      {
        nombre: "Crecimiento de colegios privados en zonas residenciales",
        descripcion: "Cochabamba ha visto 142 nuevos colegios privados/convenio abrir entre 2018-2024 (Servicio Departamental Educación CBA). Cada uno con 200-800 estudiantes y requisito de uniforme propio diferenciado.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Mercado de uniformes escolares en expansión. Foco en colegios nuevos (no encadenados con taller histórico) en zona sur, La Recoleta, Tiquipaya.",
      },
      {
        nombre: "Tendencia hacia uniformes corporativos como branding",
        descripcion: "Empresas locales (restaurantes, hoteles, gimnasios, clínicas) están adoptando uniformes diseñados como herramienta de marca, no solo identificación. Crece 6-9% anual el segmento (Cámara Industria CBA).",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Ofrecer servicio integral: diseño + bordado/sublimación + entrega. No solo confección. Margen 1,8x vs uniforme básico.",
      },
      {
        nombre: "Desconfianza en talleres familiares 'sin factura'",
        descripcion: "Empresas formales rechazan trabajar con talleres que no emiten factura porque no pueden descargar el IVA (13%). El 60% de los talleres de La Cancha trabaja en informalidad.",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Don Roberto tiene NIT y emite factura desde 2015. Es ventaja competitiva sobre el resto de La Cancha. Comunicarlo explícitamente en propuestas.",
      },
    ],
    tecnologico: [
      {
        nombre: "Bordado y sublimación digital",
        descripcion: "Máquinas de bordado computarizado tipo Brother PR1055X (USD 4.800) y sublimación textil (USD 2.200) son hoy el estándar para uniformes empresariales. Don Roberto no tiene ninguna.",
        impacto: "negativo",
        intensidad: 4,
        implicacion: "Adquirir bordadora 6 cabezales usada (USD 3.800) en el primer trimestre del pivote. Sin esto se queda fuera del 80% del mercado uniformes B2B.",
      },
      {
        nombre: "Plataformas de cotización en línea",
        descripcion: "Empresas medianas ya esperan recibir cotización formal por mail con catálogo PDF en 24-48 horas. La Cancha sigue funcionando con WhatsApp y precio verbal.",
        impacto: "negativo",
        intensidad: 3,
        implicacion: "Marco crea un catálogo PDF + cotizador Excel + correo corporativo @textilsalinas.com para profesionalizar la imagen.",
      },
    ],
    ecologico: [
      {
        nombre: "Tendencia 'fast fashion = contaminante' en compradores corporativos",
        descripcion: "Hoteles 4-5 estrellas y empresas con políticas ESG ya empiezan a preguntar por origen de tela y prácticas laborales del proveedor textil.",
        impacto: "positivo",
        intensidad: 2,
        implicacion: "Aún incipiente en Cochabamba pero crece. Mantener registros de proveedores de tela y condiciones laborales del taller como argumento de venta a clientes premium.",
      },
    ],
    legal: [
      {
        nombre: "Régimen Tributario General y NIT activo",
        descripcion: "Don Roberto opera bajo régimen general con NIT desde 2015, IVA 13% e IT 3%. Cumple declaraciones mensuales con contadora externa (Bs 350/mes).",
        impacto: "positivo",
        intensidad: 4,
        implicacion: "Mantener NIT activo y al día. Sin esto no se puede vender a colegios privados, empresas grandes ni RUPE.",
      },
      {
        nombre: "Ley General del Trabajo y aportes AFP",
        descripcion: "Las 4 costureras están en planilla con aportes AFP Futuro de Bolivia y CNS. Costo total empleador: salario líquido + 14,7% aportes. Despido injustificado paga indemnización 1 mes/año trabajado.",
        impacto: "neutro",
        intensidad: 3,
        implicacion: "No despedir costureras durante el pivote — son activo clave (saben bordar, hacer ojal, atacar pretina). Recapacitar en uniforme escolar.",
      },
      {
        nombre: "Normas IBNORCA para uniformes escolares",
        descripcion: "IBNORCA tiene norma NB-1099 para uniformes escolares (composición tela, costuras, etiquetado). Algunos colegios privados exigen certificación NB-1099 en sus licitaciones.",
        impacto: "neutro",
        intensidad: 2,
        implicacion: "Investigar costo certificación NB-1099 (Bs 4.500-6.800 según ensayos). Inversión año 2 cuando ya haya facturación.",
      },
    ],
  },
  porter: {
    rivalidad: {
      intensidad: "medio",
      justificacion: [
        "En uniformes institucionales CBA compiten 9 talleres formales reconocidos: Confecciones Andina, Uniformes Cochabamba, Textil Renacer, Sastrería Quiroga, entre los principales.",
        "Ninguno tiene >15% del mercado — fragmentado y con espacio para entrante con propuesta clara.",
        "La rivalidad NO es en precio (margen sano 28-35%) sino en cumplimiento de plazos y calidad de bordado.",
      ],
      estrategia: "Posicionarse como 'taller cumple-plazos' con compromiso contractual. Don Roberto tiene capacidad ociosa que le permite cumplir entregas con buffer mientras los competidores están saturados en marzo (apertura escolar).",
    },
    nuevos_entrantes: {
      intensidad: "medio",
      justificacion: [
        "Capital requerido para entrar en uniformes B2B: USD 25.000-40.000 en maquinaria mínima. Barrera moderada.",
        "Lo difícil no es la máquina sino la red comercial: cerrar colegios requiere referidos directores, lo que toma 2-3 años construir.",
        "Talleres de La Cancha podrían intentar el pivote igual, pero la mayoría no tiene NIT, sin lo cual no acceden a clientes formales.",
      ],
      estrategia: "Construir red comercial defensable: cerrar 6-8 colegios ancla con contratos anuales en los primeros 18 meses. Aprovechar la ventaja temporal de tener NIT mientras la competencia informal queda fuera.",
    },
    sustitutos: {
      intensidad: "alto",
      justificacion: [
        "Importación directa: algunos colegios grandes importan uniformes de China en contenedor anual y los venden a padres. Sustituto directo con precio 30-40% menor.",
        "Sastres unipersonales con máquinas caseras compiten en lotes pequeños con precio muy bajo (sin AFP, sin alquiler de taller).",
        "Para empresas: ropa básica genérica de Shein con escudo bordado externamente — opción low-cost.",
      ],
      estrategia: "Diferenciarse por: (1) NB-1099 certificación que la importación no tiene, (2) ajustes y rehechos incluidos (importado no ofrece), (3) re-stock express en 5-7 días si falta talla.",
    },
    poder_proveedores: {
      intensidad: "medio",
      justificacion: [
        "Proveedores de tela en Cochabamba (Tela Más, El Mundo de la Tela, Importadora Hong) son varios pero con stock dependiente de contenedor cada 60-90 días.",
        "Hilos, cierres, botones: mercado fragmentado con 30+ proveedores en La Cancha y Av. Honduras. Poder bajo.",
        "Repuestos máquinas Juki: monopolio efectivo de 2 importadores en Bolivia, plazo entrega 4-8 semanas.",
      ],
      estrategia: "Mantener inventario de tela buffer 60 días para colegios y 30 días para empresas. Doble proveedor para telas críticas (mezclilla y gabardina). Stock repuestos críticos máquinas Juki por 6 meses.",
    },
    poder_clientes: {
      intensidad: "medio",
      justificacion: [
        "Colegios contratan anualmente; cambiarlo es trabajoso para ellos (rediseñar logo, reentrenar costureras, etc.), genera switching costs naturales.",
        "Empresas grandes (50+ empleados) suelen tener 1 proveedor único de uniformes con contrato 1-2 años.",
        "Restaurantes y hoteles individuales sí tienen poder: piden 3 cotizaciones y eligen más barato si calidad es comparable.",
      ],
      estrategia: "Apuntar primero a colegios y empresas medianas (más sticky) para construir base estable. Restaurantes/hoteles como mercado complementario, no principal.",
    },
    atractivo_sector: 3,
    conclusion: "Sector medianamente atractivo: el segmento de uniformes B2B en CBA está fragmentado, en crecimiento por nuevos colegios, y con barrera de entrada de capital moderado pero de red comercial alta. La amenaza fuerte es la importación directa que algunos colegios ya hacen, pero un taller con NIT, certificación y cumplimiento de plazos puede defender 25-35% del mercado en su nicho geográfico.",
  },
  mpc: {
    factores: [
      { nombre: "Cumplimiento de plazos de entrega", peso: 0.25 },
      { nombre: "Calidad bordado/sublimación", peso: 0.20 },
      { nombre: "Precio competitivo por unidad", peso: 0.15 },
      { nombre: "Red comercial con colegios/empresas", peso: 0.20 },
      { nombre: "Capacidad de re-stock y ajustes", peso: 0.10 },
      { nombre: "Formalidad (NIT, factura, RUPE)", peso: 0.10 },
    ],
    competidores: [
      {
        nombre: "Textil Salinas (Don Roberto, post-pivote)",
        notas: [3, 2, 3, 2, 3, 4],
        total_ponderado: 2.70,
      },
      {
        nombre: "Confecciones Andina (líder local)",
        notas: [3, 4, 3, 4, 3, 4],
        total_ponderado: 3.50,
      },
      {
        nombre: "Uniformes Cochabamba (especialista colegios)",
        notas: [4, 4, 3, 4, 4, 4],
        total_ponderado: 3.85,
      },
      {
        nombre: "Sastres independientes (taller casero)",
        notas: [2, 2, 4, 2, 2, 1],
        total_ponderado: 2.20,
      },
    ],
    conclusion: "Textil Salinas en su estado actual (2,70) está 1,15 puntos por debajo del líder Uniformes Cochabamba (3,85). Donde gana frente a competidores informales: formalidad (NIT + factura), donde indispensable está parejo: precio. Donde claramente pierde: calidad de bordado (no tiene máquina, terceriza), red comercial (recién entrando) y plazos (capacidad pero sin estructura de gestión). El pivote requiere cerrar dos brechas concretas: invertir USD 3.800 en bordadora propia + Marco dedica 100% a desarrollo comercial los primeros 12 meses.",
  },
  foda: {
    fortalezas: [
      "8 máquinas Juki industriales funcionales (3 rectas, 2 overlock, 1 collareta, 2 cerradoras codo) — capacidad instalada 500 prendas/semana sin más inversión.",
      "4 costureras de planta con 8-22 años de experiencia; saben hacer ojal, atacar pretina, pespunte fino.",
      "NIT activo desde 2015, factura emitida puntualmente, cuenta bancaria empresarial BNB con historial 10 años.",
      "Hijo Marco (28 años, licenciado administración UMSS) full-time en el negocio aporta gestión y dimensión comercial.",
      "Local propio en Av. Honduras (no en La Cancha) — 180 m² zona industrial textil. Sin alquiler.",
      "25 años de relación con proveedores de tela en La Cancha: descuentos 5-8% por volumen y crédito 30 días.",
    ],
    oportunidades: [
      "142 colegios nuevos en CBA en 6 años; cada uno requiere proveedor de uniforme.",
      "Mercado uniformes corporativos crece 6-9% anual.",
      "DS 181 da 20% preferencia a producción nacional en compras estatales (colegios fiscales).",
      "Empresas formales rechazan talleres sin factura — barrera contra 60% de la competencia informal.",
      "Banco Unión PyMe textil ofrece línea Bs 350.000 al 11,5% que Don Roberto puede acceder.",
    ],
    debilidades: [
      "Sin máquina de bordado computarizado — depende de tercerizar bordado a USD 1,80/prenda, lo que reduce margen 18%.",
      "Sin presencia digital: WhatsApp único canal, sin web, sin email corporativo, sin catálogo PDF.",
      "Sin diseñador gráfico/textil para propuestas a colegios y empresas (logo, paleta, mockup).",
      "Don Roberto resiste al cambio: 53 años, 25 años con mismo modelo, miedo de perder lo conocido por algo nuevo.",
      "Sin experiencia comercial B2B; conoce venta minorista en La Cancha pero no licitaciones ni cotizaciones formales.",
      "Capital de trabajo limitado: caja Bs 38.000 para 6-7 meses de operación sin crecimiento.",
    ],
    amenazas: [
      "Shein/AliExpress siguen creciendo en consumer mass; cierra completamente esa puerta.",
      "Colegios grandes pueden importar sus uniformes directo de China (sustituto fuerte).",
      "Devaluación sigue subiendo costo de tela importada — margen comprimido si no se actualizan contratos.",
      "9 talleres formales ya operan en uniformes B2B; el espacio no es vacío.",
      "Bloqueos en Cochabamba (típicamente abril-octubre) pueden cerrar acceso a colegios y empresas industriales.",
    ],
  },
  foda_cruzado: {
    fo: [
      "Aprovechar maquinaria instalada (8 Juki) + crecimiento de 142 colegios nuevos para tomar 6-8 colegios pequeños/medianos (200-500 alumnos) como base cliente año 1.",
      "Usar NIT activo + DS 181 preferencia nacional para inscribirse en RUPE y postular a 4-6 colegios fiscales municipales con licitación anual.",
      "Apalancar conocimiento de costureras (saben bordar a mano calidad) para ofrecer 'detalles artesanales' que la importación china no replica (escudos institucionales, iniciales bordadas).",
    ],
    do: [
      "Financiar bordadora 6 cabezales (USD 3.800) y diseñador gráfico (Bs 2.800/mes) con préstamo Banco Unión Bs 180.000, cerrando dos brechas críticas simultáneamente.",
      "Marco se capacita en venta B2B (curso Cámara Industria CBA, Bs 1.200) y armar protocolo de cotización profesional con catálogo PDF en 6 semanas.",
      "Don Roberto delega gradualmente la gestión a Marco (firma contratos, define precios, ve costureras) durante 12 meses para que el negocio no dependa de su resistencia al cambio.",
    ],
    fa: [
      "Diferenciarse de Shein y de importación directa con compromiso de re-stock express (≤7 días) y ajustes/rehechos gratuitos — servicio que importación no ofrece.",
      "Comprar tela base (mezclilla, gabardina, oxford) en lotes 90 días cuando el tipo de cambio paralelo baje temporalmente, protegiendo margen vs devaluación continua.",
      "Posicionar 'producción local con NIT' como argumento ESG ante hoteles 4-5 estrellas y empresas formales — barrera contra 60% de competidores informales.",
    ],
    da: [
      "No competir en consumer mass (jeans, poleras al detalle) ni rebajar precios al nivel de Shein — sale del negocio. Migrar 100% a B2B en 18 meses.",
      "Diversificar cartera de clientes: no permitir que un colegio o empresa represente >20% de la facturación. Objetivo año 2: 12-15 clientes B2B distribuidos.",
      "Mantener 60 días de tela buffer y contratos con cláusula de ajuste cambiario semestral para proteger contra devaluación y bloqueos.",
    ],
  },
  matriz_nivel3: {
    tipo: "BCG",
    posicion: "Cartera mixta con migración deliberada hacia 'Estrella'",
    justificacion: "El portafolio actual de Textil Salinas en BCG: (1) Jeans/poleras retail = PERRO (mercado decreciente -60%, cuota baja, sin futuro) — eliminar. (2) Uniformes escolares = ESTRELLA potencial (mercado crece 6-9%, cuota baja inicial pero capacidad de tomar 8-12% del mercado local con esfuerzo). (3) Uniformes corporativos = INTERROGANTE (mercado crece, cuota inexistente, requiere inversión en bordado para entrar). (4) Confección por encargo (delantal, gorras, manteles) = VACA LECHERA pequeña (mercado estable, cuota residual de viejos clientes).",
    implicacion: "Acción concreta: discontinuar producción de jeans/poleras retail en 6 meses (vender stock con descuento, no reponer telas). Invertir préstamo en categoría ESTRELLA (uniformes escolares) y desarrollar gradualmente la INTERROGANTE (uniformes corporativos) año 2-3. La VACA LECHERA (encargos) se mantiene como flujo complementario sin invertir.",
  },
  mcpe: {
    factores: [
      { nombre: "Mercado uniformes crece 6-9% (oportunidad)", peso: 0.15 },
      { nombre: "Capacidad ociosa 55% (fortaleza)", peso: 0.15 },
      { nombre: "Sin bordadora propia (debilidad)", peso: 0.15 },
      { nombre: "Importación china sustituto (amenaza)", peso: 0.10 },
      { nombre: "Capital limitado 7 meses (debilidad)", peso: 0.15 },
      { nombre: "NIT y factura (fortaleza)", peso: 0.10 },
      { nombre: "Sin red comercial B2B (debilidad)", peso: 0.10 },
      { nombre: "Devaluación encarece tela (amenaza)", peso: 0.10 },
    ],
    filas: [
      {
        estrategia: "Pivot total a uniformes B2B (cerrar retail, invertir bordadora, foco 100%)",
        notas: [4, 4, 4, 3, 3, 4, 3, 3],
        total: 3.55,
      },
      {
        estrategia: "Híbrido (mantener retail + abrir B2B gradualmente)",
        notas: [3, 3, 2, 2, 2, 3, 2, 2],
        total: 2.40,
      },
      {
        estrategia: "Cerrar taller y dedicarse a comercializar ropa importada en La Cancha",
        notas: [2, 1, 1, 1, 3, 2, 1, 2],
        total: 1.65,
      },
    ],
    estrategia_elegida: "Pivot total a uniformes B2B (cerrar retail, invertir bordadora, foco 100%)",
    justificacion: "Es la única estrategia que aprovecha plenamente las fortalezas (8 Juki ociosas + 4 costureras experimentadas + NIT) y ataca decisivamente las debilidades (bordadora con préstamo, red comercial con Marco full-time). La estrategia híbrida diluye recursos y prolonga la agonía del retail sin ganar tracción real en B2B. La estrategia de cerrar y vender ropa importada destruye el activo principal del negocio (las costureras y la maquinaria) y no resuelve el problema estructural.",
  },
  plan_accion: [
    "Mes 1: Aplicar préstamo Banco Unión Bs 180.000 a 36 meses, 11,5% anual. Garantía: maquinaria valorada Bs 240.000. Marco preparar carpeta financiera con contador.",
    "Mes 1-2: Inscribirse en RUPE (Registro Único de Proveedores del Estado). Trámite gratuito en SICOES. Documentación: NIT, balance, declaraciones IVA últimos 6 meses.",
    "Mes 2: Comprar bordadora Brother PR1055X 6 cabezales usada (USD 3.800) en La Paz vía contacto industrial. Capacitar a 2 costureras en operación durante 2 semanas.",
    "Mes 2-3: Contratar diseñador gráfico/textil junior (Bs 2.800/mes, modalidad consultoría). Producir catálogo PDF con 24 modelos uniformes (escolar, empresa, restaurante, hotel).",
    "Mes 3-4: Visita comercial a 30 colegios privados/convenio en zona sur, La Recoleta y Tiquipaya. Marco lidera con catálogo PDF + muestra física. Objetivo: 6-8 colegios cerrados para gestión escolar 2027.",
    "Mes 4: Discontinuar producción de jeans/poleras retail. Vender stock con descuento 30% en La Cancha. Reasignar las 8 Juki 100% a uniformes.",
    "Mes 5-7: Producción primera tanda uniformes escolares (3 colegios pequeños como prueba, 220 prendas total). Validar tiempos reales, mermas, costo unitario, satisfacción.",
    "Mes 8-10: Abrir cuenta corporativa Gmail @textilsalinas.com, sitio web sencillo (Bs 1.800 anual hosting + diseño). Listar en directorios CBA: Cámara Industria, Páginas Amarillas digital.",
    "Mes 9-12: Expandir a 4-6 empresas medianas + 2-3 hoteles/restaurantes. Marco invierte 60% tiempo prospección, 40% operaciones.",
    "Año 2: Certificar IBNORCA NB-1099 (Bs 5.500). Postular a 3-4 licitaciones colegios fiscales municipales bajo DS 181. Meta año 2: facturación Bs 65.000/mes, planilla recuperada a 6 costureras.",
  ],
  conclusion: "El taller de Don Roberto NO está condenado, pero requiere un pivote agresivo en menos de 12 meses. La diferencia entre cerrar en 2027 y prosperar en 2028 está en tres decisiones: (1) cerrar retail aunque duela, (2) invertir el préstamo en bordadora y diseñador, (3) dejar que Marco lidere el frente comercial mientras Don Roberto se enfoca en producción. Si Don Roberto se aferra al modelo viejo o intenta un híbrido tibio, el taller cierra. Si ejecuta el pivote total con disciplina, en 18 meses el negocio puede facturar Bs 65-80.000/mes con margen 28-32%, recuperando capacidad histórica.",
  lecciones: [
    "Cuando una ola tecnológica (Shein) destruye un mercado, la salvación no es bajar precios sino migrar a un segmento donde el atributo de competencia es distinto (B2B = cumplimiento, calidad, factura — no precio mínimo).",
    "La matriz BCG sirve para tomar decisiones duras: si un producto es PERRO en mercado decreciente, no se trata de reanimarlo sino de matarlo a tiempo para liberar recursos.",
    "El NIT y factura, que parecen un costo burocrático, son una BARRERA DE ENTRADA contra el 60% de competidores informales en sectores B2B. Es un activo subvalorado por los emprendedores.",
    "En un pivote, la generación joven (Marco) debe liderar las áreas nuevas (digital, B2B) mientras la generación experimentada (Don Roberto) mantiene la operación productiva. División de roles clara.",
    "Para una microempresa, un préstamo bancario bien dirigido (a las dos debilidades críticas, no a 5 mejoras menores) compra 18 meses de transformación que sin financiamiento serían 4-5 años.",
  ],
  errores_evitados: [
    "No intentar competir con Shein bajando precios al consumidor final — destruye margen y no recupera volumen porque el problema es de canal, no de precio.",
    "No mantener el retail 'por si acaso' mientras se abre B2B — diluye foco y consume el capital de trabajo que necesita el pivote.",
    "No despedir a las costureras experimentadas para 'ahorrar' — son el activo clave; recapacitar es 10x más barato que reclutar y entrenar nuevas.",
    "No saltar al e-commerce de ropa propia (jeans con marca Salinas en Instagram) — requeriría USD 25-40k en marketing digital que Don Roberto no tiene.",
    "No quedarse en informalidad para 'ser más barato' — perdería acceso al 80% del mercado B2B que solo trabaja con factura.",
  ],
  tags: ["pivote", "textil", "B2B", "Cochabamba", "Shein", "BCG-perros-estrellas", "uniformes", "intermedio"],
};
