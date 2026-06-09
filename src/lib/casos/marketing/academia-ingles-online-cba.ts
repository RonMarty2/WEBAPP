import type { CasoMarketing } from "../types";

/**
 * Caso 1 — Academia de inglés online para profesionales (Cochabamba).
 *
 * Caso **intermedio** que muestra un plan de marketing de servicio
 * (7P en lugar de 4P) con dos buyer personas opuestos: ingeniero
 * junior preparándose para una beca y ejecutiva senior que necesita
 * inglés de negocios. El presupuesto es medio (Bs 4.500/mes) con
 * un mix digital fuerte (Instagram + Google Ads) y meta de CPL
 * Bs 35 que sostiene un funnel de venta consultiva.
 */

export const casoAcademiaInglesOnlineCba: CasoMarketing = {
  slug: "academia-ingles-online-cba",
  modulo: "marketing",
  titulo: "Academia de inglés online para profesionales",
  tagline: "Plan de marketing digital para escalar de clases particulares a academia online B2C con grupos pequeños y CPL Bs 35.",
  zona: "Cochabamba (online con base local)",
  rubro: "EdTech / Educación de idiomas",
  dificultad: "intermedio",
  emoji: "🎓",
  emprendedor: {
    nombre: "Daniela Rocha",
    edad: 30,
    rol: "Profesora de inglés certificada Cambridge CELTA. 6 años dando clases particulares en Cala Cala y Sarcobamba. Vivió un año en Toronto y trajo método propio. Quiere escalar de 12 alumnos particulares a 60 alumnos en grupos online de 4 personas.",
  },
  contexto: [
    "Daniela enseña inglés desde 2020 a un círculo cerrado de profesionales que la contactaron por recomendación. Cobra Bs 80/hora particular y tiene su agenda llena, pero le quedan 14 horas semanales y un techo claro de ingresos: Bs 9.000/mes haciendo TODO ella sola.",
    "En 2025 viajó a Toronto a hacer un curso de metodología, y volvió convencida de que el formato grupo pequeño (4 personas, 90 minutos, 2 veces por semana) era el mismo que ella había vivido y le había funcionado. Decidió armar \"FluentBO\" — academia online de inglés enfocada en profesionales de 25-45 años de Cochabamba y otras ciudades.",
    "El reto es comercial: pasar de \"me llaman porque me conocen\" a \"me encuentran porque les hablo en redes\". Daniela nunca ha hecho marketing pagado. Su hermano Mateo (24, marketer digital freelance) le armó este plan con presupuesto inicial de Bs 4.500/mes durante 6 meses, financiado con sus ahorros.",
  ],
  problema: "Daniela tiene un producto validado a pequeña escala (12 alumnos particulares) pero no sabe cómo atraer 60 alumnos en grupos a través de canales digitales con un presupuesto limitado y sin destruir el margen.",
  segmento: "Profesionales de 25-45 años con sueldo Bs 5.000-15.000 que necesitan inglés por trabajo, beca o migración. Concentrados en Cochabamba (Cala Cala, Queru Queru, Sarcobamba) pero abierto a otras ciudades vía online.",
  buyer_personas: [
    {
      nombre: "Pedro el ingeniero junior",
      edad: 28,
      ocupacion: "Ingeniero industrial junior en planta cervecera de Cala Cala",
      ingreso_aprox: "Bs 6.500/mes líquido",
      ubicacion: "Vive en alquiler de Bs 1.200 en Sarcobamba; trabaja en Cala Cala; toma micro M.",
      motivaciones: [
        "Postular a beca Chevening 2027 (requiere IELTS 6.5).",
        "Demostrar capacidad técnica en inglés ante la planta matriz de la empresa (alemana).",
        "Salir del techo salarial de Bs 6.500 que tienen los ingenieros locales sin inglés.",
        "No depender más de Google Translate en reuniones con el área técnica de Hamburgo.",
        "Sentirse competitivo frente a colegas que ya lo hablan.",
      ],
      frustraciones: [
        "Probó Open English y Duolingo: aprendió palabras sueltas pero no puede sostener una conversación de 5 minutos.",
        "Las academias presenciales cobran Bs 600-900/mes y exigen horarios fijos que chocan con turnos rotativos.",
        "Tiene vergüenza de hablar en clase con desconocidos porque sabe que su pronunciación es mala.",
        "Cada vez que intenta estudiar solo, dura 2 semanas y abandona por falta de retroalimentación real.",
      ],
      canales_consumo: [
        "Instagram (1 hora diaria, sobre todo Reels y Stories).",
        "TikTok (sigue cuentas de inglés tipo @inglesconfran).",
        "YouTube (busca videos de IELTS).",
        "WhatsApp grupos de la empresa.",
        "LinkedIn (perfil flojo pero lo revisa cada 2 semanas).",
      ],
      cita: "No quiero memorizar verbos otra vez, quiero hablar como un ingeniero que viaja a una reunión. Pago lo que sea con tal de que el grupo sea chico y la profe me corrija de verdad.",
      objecion_tipica: "¿Por qué tendría que pagarte Bs 600/mes si Open English me sale Bs 250?",
    },
    {
      nombre: "Lucía la ejecutiva senior",
      edad: 42,
      ocupacion: "Gerente comercial en cadena de farmacias",
      ingreso_aprox: "Bs 12.000/mes líquido + bonos",
      ubicacion: "Casa propia en Queru Queru; trabaja en oficina central av. América; 2 hijos en colegio bilingüe.",
      motivaciones: [
        "La empresa acaba de ser adquirida por un grupo peruano-colombiano: las reuniones del directorio van a ser en inglés.",
        "No quiere quedarse atrás de su jefa (que sí habla inglés) en la nueva estructura.",
        "Sus hijos hablan inglés mejor que ella y le incomoda no entender lo que conversan.",
        "Tiene viajes corporativos previstos a Bogotá y Miami en 2026.",
        "Valora el prestigio: si invierte en algo, quiere certificado tangible al final.",
      ],
      frustraciones: [
        "Intentó hace 4 años en una academia presencial: dejó por horarios y mezclaron grupos con jóvenes universitarios que no le aportaban.",
        "Le ofende que la traten como principiante en un test de nivel cuando ella entiende 70% pero no puede hablar.",
        "Tiene tiempo limitado: máximo 3 horas semanales fuera del trabajo.",
        "Le da pereza descargar apps; prefiere tener una persona real con quien hablar.",
      ],
      canales_consumo: [
        "Facebook (1-2 sesiones diarias, revisa grupos de mamás y de marketing farma).",
        "Instagram (entra a ver Stories, no produce contenido).",
        "WhatsApp (canal principal de comunicación, 200+ chats).",
        "Google search (busca \"clases de inglés para ejecutivos\").",
        "LinkedIn activo (publica logros corporativos).",
      ],
      cita: "Yo no quiero un curso universitario, quiero una profe que me prepare para las reuniones del lunes con la matriz. Si me das resultados en 3 meses, te pago lo que pidas.",
      objecion_tipica: "Online no me funciona, yo necesito que alguien me obligue a venir, ¿cómo me garantizas que voy a avanzar?",
    },
  ],
  mix: [
    {
      categoria: "Producto",
      decision: "Programa \"FluentBO Profesional\" de 12 semanas en grupos cerrados de 4 personas, 2 sesiones de 90 min/semana vía Zoom + plataforma con tareas semanales y certificado final.",
      justificacion: "El grupo de 4 es la diferenciación frente a Open English (1:30+) y academias locales (10-15 alumnos). 90 min permite warm-up + producción + corrección individualizada (22 min por alumno).",
    },
    {
      categoria: "Producto",
      decision: "3 tracks paralelos: \"General Professional\" (Pedro), \"Business English\" (Lucía) y \"IELTS Preparation\" (becarios). Niveles A2, B1, B2 por track.",
      justificacion: "Segmentación clara evita el dolor histórico de Lucía: mezclar adultos con universitarios. Cada track tiene material distinto y rol-plays propios.",
    },
    {
      categoria: "Precio",
      decision: "Bs 650/mes con descuento de Bs 590/mes pagando trimestre adelantado (Bs 1.770). 1 sesión gratis de diagnóstico.",
      justificacion: "Bs 650 es 8% más caro que el promedio de academias presenciales de Cochabamba (Bs 600) pero 165% más caro que Open English (Bs 250). El precio sostiene la promesa de grupo de 4. Margen variable 62% (costo profesora Bs 200/alumno/mes + Zoom + plataforma).",
    },
    {
      categoria: "Precio",
      decision: "Sin matrícula, sin cobro de material (todo es PDF + Quizlet). Política de \"si no avanzas un nivel en 12 semanas, una semana extra gratis\".",
      justificacion: "Quita objeción de Lucía (\"¿cómo garantizas?\"). La garantía cuesta poco porque <8% de alumnos no progresan según data de Cambridge.",
    },
    {
      categoria: "Plaza",
      decision: "100% online vía Zoom Pro (cuenta business). Sin sede física. Material en plataforma propia (Wordpress + LearnDash) con dominio fluentbo.com.",
      justificacion: "Cero costos fijos de inmueble (vs Bs 4.500/mes que pagaría una academia presencial en Cala Cala). Escalable a otras ciudades sin abrir sucursal.",
    },
    {
      categoria: "Plaza",
      decision: "Horarios: 6:30-8:00 AM, 12:30-14:00 PM, 19:00-20:30 PM, 20:30-22:00 PM. Sábados 8:00-11:00 AM.",
      justificacion: "Horarios elegidos por las dos personas: Pedro entra 8:30, prefiere 6:30 o 19:00. Lucía solo puede 12:30 o sábado AM.",
    },
    {
      categoria: "Promocion",
      decision: "Funnel digital: Instagram + Reels orgánicos (3/semana) + Google Ads búsqueda (\"clases inglés Cochabamba\", \"clases inglés ejecutivos\") + retargeting Meta.",
      justificacion: "Las dos personas viven en Instagram. Google Ads captura intención alta (alguien que busca ya está pensando inscribirse). CPL meta Bs 35, conversión venta 18%.",
    },
    {
      categoria: "Promocion",
      decision: "Magnet principal: ebook \"50 frases para sobrevivir tu primer Zoom corporativo en inglés\" + diagnóstico gratis de 20 minutos por Calendly.",
      justificacion: "Magnet desbloquea email + permite seguimiento. La sesión diagnóstica es la pieza que convierte (cierre 35%) porque Daniela ya enamora con el método en 20 min.",
    },
    {
      categoria: "Personas",
      decision: "Solo Daniela enseña al inicio. Mes 4 incorpora a Ariana (otra docente CELTA certificada) cuando supere 40 alumnos. Ningún docente sin CELTA o equivalente.",
      justificacion: "El diferenciador es la calidad docente. Lucía no aceptará un profe junior. CELTA es el sello universal reconocible (Cambridge).",
    },
    {
      categoria: "Personas",
      decision: "WhatsApp Business atendido por Mateo (hermano marketer) 9:00-19:00. Tiempo de respuesta máximo 15 min.",
      justificacion: "El primer contacto define la conversión. Mateo conoce el método y puede agendar diagnóstico en 2 mensajes. 15 min vs el promedio de 4 horas de academias locales.",
    },
    {
      categoria: "Procesos",
      decision: "Customer journey: anuncio → landing con magnet → email de bienvenida + reserva diagnóstico → diagnóstico 20 min → propuesta personalizada → pago QR Banco Mercantil + confirmación → onboarding grupal por WhatsApp.",
      justificacion: "7 pasos definidos con responsable y tiempo SLA. Embudo medido en GA4 + hoja Excel compartida. Sin esto los leads se pierden entre WhatsApp y email.",
    },
    {
      categoria: "Procesos",
      decision: "Sesiones grabadas (con consentimiento) subidas a plataforma para que el alumno repase. Tareas devueltas con audio corregido en máximo 48h.",
      justificacion: "Lucía valora poder repasar sin haber estado. Las correcciones en audio son el sello (cero academias locales lo hacen) y suben retención.",
    },
    {
      categoria: "Evidencia_fisica",
      decision: "Plataforma fluentbo.com con paleta azul marino + naranja, fotos profesionales de Daniela en sesión real (no stock), testimonios en video de 6 alumnos actuales con nombre, empresa y resultado.",
      justificacion: "El alumno no ve una sede física, así que la web ES la sede. Testimonios reales con LinkedIn linkado tumban la objeción de \"¿esto es serio?\".",
    },
    {
      categoria: "Evidencia_fisica",
      decision: "Certificado final con código QR verificable + recomendación en LinkedIn de Daniela al alumno graduado.",
      justificacion: "Lucía y Pedro publican el certificado en LinkedIn. Cada publicación es marketing gratuito; en 6 meses esperamos 18-25 publicaciones.",
    },
  ],
  presupuesto: {
    total_bs_mes: 4500,
    desglose: [
      {
        canal: "Meta Ads (Instagram + Facebook)",
        monto_bs_mes: 1800,
        resultado_esperado: "Alcance 35.000-45.000 personas/mes en Cochabamba, 45-55 leads de magnet, 8-12 cierres.",
        cpl_estimado_bs: 36,
      },
      {
        canal: "Google Ads búsqueda",
        monto_bs_mes: 1200,
        resultado_esperado: "180-240 clics/mes con CPC promedio Bs 5-7. 20-30 leads de alta intención, 6-9 cierres (conv. 30%).",
        cpl_estimado_bs: 48,
      },
      {
        canal: "Producción de contenido orgánico (edición Reels, foto pro, copy)",
        monto_bs_mes: 800,
        resultado_esperado: "12 Reels/mes + 4 fotos pro/mes. 3.500-5.000 cuentas alcanzadas orgánicamente. 8-12 leads orgánicos.",
        cpl_estimado_bs: 75,
      },
      {
        canal: "Herramientas (Calendly, ConvertKit email, plataforma LearnDash)",
        monto_bs_mes: 350,
        resultado_esperado: "Automatización del funnel: 100% leads reciben email de bienvenida; ahorro 8h/sem de tiempo de Daniela.",
      },
      {
        canal: "Influencer micro local (1 micro-influencer mamá/profesional, contenido pagado)",
        monto_bs_mes: 350,
        resultado_esperado: "1 post + 1 Reel/mes en cuenta de 8k-12k seguidores Cochabamba. 4-7 leads cualificados.",
        cpl_estimado_bs: 60,
      },
    ],
    roas_proyectado: 4.2,
  },
  calendario: [
    {
      semana: 1,
      tipo: "Lanzamiento web + magnet",
      canal: "Sitio fluentbo.com + Instagram",
      contenido: "Publicar landing definitiva con magnet \"50 frases corporativas\". Anuncio del lanzamiento en Instagram con video de 60s de Daniela presentando el método.",
    },
    {
      semana: 1,
      tipo: "Campaña paga arranque",
      canal: "Meta Ads + Google Ads",
      contenido: "Activar 2 campañas Meta (Pedro: intereses ingeniería + IELTS; Lucía: cargos directivos + farmas/bancos) + 1 campaña Google con 4 grupos de palabras clave.",
    },
    {
      semana: 2,
      tipo: "Reel pilar",
      canal: "Instagram + TikTok",
      contenido: "Reel \"3 errores que hacen que tu inglés suene robótico en una reunión\" — Daniela actuando las dos versiones (mal vs bien). Hook visual en primeros 2 segundos.",
    },
    {
      semana: 2,
      tipo: "Email de bienvenida automatizado",
      canal: "ConvertKit",
      contenido: "Secuencia de 5 emails para nuevos suscriptores: día 0 ebook, día 2 video de Daniela, día 4 testimonio de Carlos (becario Chevening), día 7 oferta diagnóstico gratis, día 10 último llamado.",
    },
    {
      semana: 3,
      tipo: "Reel testimonial",
      canal: "Instagram + LinkedIn (cuenta Daniela)",
      contenido: "Testimonial en video de Carolina (gerente de empresa textil, alumna real desde 2025) hablando 50% inglés / 50% español sobre cómo pasó de no entender reuniones a liderarlas.",
    },
    {
      semana: 3,
      tipo: "Webinar gratis",
      canal: "Zoom + Instagram Live",
      contenido: "Webinar \"Inglés para tu próxima reunión corporativa: del miedo a la fluidez\" — 45 min + Q&A. Promocionar 10 días antes. Meta: 80-120 asistentes, 15-20 cierres.",
    },
    {
      semana: 4,
      tipo: "Reel humorístico",
      canal: "TikTok + Reels",
      contenido: "Sketch \"Cuando el gringo de la matriz pregunta algo y todos asentimos\" — humor reconocible para Pedro. Cierra con CTA suave a la sesión gratis.",
    },
    {
      semana: 4,
      tipo: "Anuncio retargeting",
      canal: "Meta Ads",
      contenido: "Retargeting a quienes visitaron landing pero no descargaron magnet. Creativo: \"¿No tienes 90 min al día? Tenemos clases a las 6:30 AM antes de tu trabajo\". Bs 300 de presupuesto.",
    },
    {
      semana: 5,
      tipo: "Colaboración micro-influencer",
      canal: "Instagram (cuenta @claucbafarma)",
      contenido: "Micro-influencer farma-profesional (10k seguidores en Cochabamba) hace Reel mostrando cómo usa FluentBO antes de viajes corporativos. Link sticker en Story.",
    },
    {
      semana: 5,
      tipo: "Email a base de leads",
      canal: "ConvertKit",
      contenido: "Email \"3 puestos que perdiste por inglés (y cómo no perder el cuarto)\" — historia + CTA a diagnóstico. Segmentado a quienes abrieron emails previos pero no agendaron.",
    },
    {
      semana: 6,
      tipo: "Post LinkedIn",
      canal: "LinkedIn (cuenta Daniela)",
      contenido: "Post largo \"Por qué dejé las clases particulares y monté una academia online\" — historia personal, sin venta directa. Meta: 200 reacciones, 8 mensajes privados de leads.",
    },
    {
      semana: 6,
      tipo: "Optimización de campañas",
      canal: "Meta + Google Ads",
      contenido: "Revisión semana 6: pausar audiencias con CPL >Bs 50, escalar las que están <Bs 30 con +30% de presupuesto. Cambiar creativos con CTR <1%.",
    },
    {
      semana: 7,
      tipo: "Reel pedagógico",
      canal: "Instagram + TikTok",
      contenido: "\"5 phrasal verbs que un gerente boliviano usa todos los días\" — formato carrusel + audio. Daniela en cámara explicando rápido. Cierre con magnet.",
    },
    {
      semana: 8,
      tipo: "Caso de éxito de cohorte",
      canal: "Instagram + email + LinkedIn",
      contenido: "Cohorte inicial cumple 8 semanas. Video con 4 alumnos contando resultado parcial (qué dicen ahora vs qué no podían decir hace 8 semanas). Pieza ancla para 3 meses.",
    },
  ],
  kpis: [
    "CPL (costo por lead): meta Bs 35 promedio ponderado todos los canales (ojo: Google será más caro pero convierte más).",
    "Tasa de conversión lead → diagnóstico agendado: meta 40%.",
    "Tasa de cierre diagnóstico → matrícula pagada: meta 35%.",
    "ROAS mensual: meta 4.0x (Bs 4.500 inversión → Bs 18.000 ingresos cobrados).",
    "Nuevos alumnos por mes: meta 12 en mes 1, escalar a 22 en mes 6.",
    "Retención trimestral (alumno renueva siguiente trimestre): meta 70%.",
    "NPS de cohorte tras 8 semanas: meta >55.",
  ],
  conclusion: "Plan **viable y agresivo pero realista**. Con Bs 4.500/mes Daniela puede generar ~30 leads cualificados, cerrar 10-12 nuevos alumnos y facturar Bs 18.000-22.000/mes después del mes 2. El cuello de botella no será la demanda sino su capacidad horaria: a los 40 alumnos necesitará a Ariana o quedarse trabajando 50h/semana enseñando. La inversión paga al 4.2x; ajustando creativos y bajando CPL a Bs 28 (probable hacia mes 4) sube a 5.5x.",
  lecciones: [
    "Servicios profesionales se venden con 7P, no 4P. \"Personas\" (quién enseña) y \"Procesos\" (cómo es la experiencia) pesan más que \"Promoción\".",
    "El embudo magnet → email → diagnóstico → cierre es estándar en EdTech. Cada paso debe medirse o pierdes plata sin saber dónde.",
    "Google Ads tiene CPL más alto pero conversión 2x sobre Meta porque captura intención. Mezclar ambos canales reparte el riesgo.",
    "Dos buyer personas opuestos justifican dos tracks de producto y dos creativos. No intentes hablarles a ambos con el mismo anuncio.",
    "Testimonios con LinkedIn linkado y empresa real tumban la objeción \"¿es serio?\" mejor que cualquier copy creativo.",
  ],
  errores_evitados: [
    "No mezclar grupos de adultos profesionales con universitarios — destruye la propuesta de \"para ejecutivos\".",
    "No competir en precio con Open English (Bs 250) — pelearías una guerra que pierdes; compite en formato (grupo de 4 + corrección humana).",
    "No usar fotos de stock en la landing — el alumno premium sabe distinguir y se cae la confianza.",
    "No abrir grupo con 2 personas para \"no perder al cliente\" — destruye el modelo y la rentabilidad. Llena 4 o reagenda.",
    "No descuidar el SLA de WhatsApp (15 min) — el lead caliente se enfría en 30 minutos y se va con la competencia.",
  ],
  tags: ["EdTech", "B2C", "online", "7P", "servicio", "Cochabamba", "Instagram-Ads", "Google-Ads"],
};
