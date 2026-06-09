import type { CasoMarketing } from "../types";

/**
 * Caso 2 — Clínica veterinaria boutique en Equipetrol (Santa Cruz).
 *
 * Caso **intermedio** que muestra plan de marketing 7P para un servicio
 * premium con foco en evidencia física (clínica boutique), personas
 * (calidad del staff veterinario) y procesos (atención diferenciada
 * perro/gato). Presupuesto medio-alto Bs 6.000/mes con énfasis en
 * Instagram + WhatsApp + alianzas locales con pet shops. KPIs
 * centrados en retención (LTV) más que adquisición pura.
 */

export const casoVeterinariaBoutiqueEquipetrol: CasoMarketing = {
  slug: "veterinaria-boutique-equipetrol",
  modulo: "marketing",
  titulo: "Clínica veterinaria boutique para mascotas premium",
  tagline: "Plan de marketing 7P para una clínica veterinaria con consultorios separados perro/gato, peluquería y pet hotel para NSE A/B+ en Equipetrol.",
  zona: "Equipetrol Norte, Santa Cruz de la Sierra",
  rubro: "Salud animal / pet care premium",
  dificultad: "intermedio",
  emoji: "🐾",
  emprendedor: {
    nombre: "Dr. Andrés Roca",
    edad: 38,
    rol: "Médico veterinario con 12 años de experiencia. Trabajó 7 años en VetCenter Equipetrol y 3 años en clínica especializada en gatos en Montevideo. Especialista en medicina felina (diplomado en Buenos Aires). Quiere abrir su propia clínica con enfoque boutique premium.",
  },
  contexto: [
    "Andrés conoce el mercado cruceño de mascotas premium desde adentro: durante 7 años atendió clientes de Equipetrol, Las Palmas y Urubó en VetCenter. Vio cómo el ticket promedio subió de Bs 180 a Bs 420 entre 2020 y 2025, y cómo cada vez más clientes pedían cosas que la clínica tradicional no ofrecía: separación de salas de espera perro/gato, agendamiento online, comunicación clara post-cirugía vía WhatsApp.",
    "En Montevideo aprendió el modelo \"feline-friendly clinic\" (cero perros, cero ruido, sala de espera con feromonas, jaulas a media altura para reducir estrés). De vuelta en Santa Cruz, decidió abrir \"Pawtique\" — clínica boutique con dos áreas separadas físicamente, peluquería con groomers certificados, y pet hotel para 8 huéspedes en habitaciones individuales.",
    "La inversión inicial fue alta (Bs 380.000 entre local de 240 m² alquilado en av. San Martín, equipamiento y remodelación). Para que el negocio sea rentable necesita 18-22 atenciones diarias a un ticket promedio de Bs 380. El marketing tiene que llegar a un nicho específico: dueños NSE A/B+ que ven a su mascota como un miembro más de la familia y están dispuestos a pagar 60% más que la veterinaria del barrio.",
  ],
  problema: "Pawtique tiene un producto de altísima calidad pero su nicho es pequeño y educado: el cliente premium ya tiene veterinaria de confianza. El reto es convencer a este cliente de migrar y luego retenerlo con LTV alto.",
  segmento: "Dueños de mascotas de Equipetrol Norte y Sur, Las Palmas, Urubó y Urubó Country Club. NSE A y B+, 30-55 años, con 1-3 mascotas que viven en casa (no jardín), tratadas como miembros de familia.",
  buyer_personas: [
    {
      nombre: "Sofía la madre soltera profesional",
      edad: 35,
      ocupacion: "Gerente de marketing en agencia digital, oficina en Equipetrol",
      ingreso_aprox: "Bs 14.000/mes líquido",
      ubicacion: "Departamento propio en condominio cerrado de Equipetrol Norte; su golden retriever Bruno (4 años) duerme en el sofá.",
      motivaciones: [
        "Bruno es el \"hijo peludo\" que llegó cuando su pareja se fue en 2022; lo cuida con la misma intensidad que un bebé.",
        "Trabaja remoto 3 días y le gusta llevar a Bruno a la oficina los demás días.",
        "Sigue cuentas de pet care en Instagram (@goldenfacts, @vetdrlucia) y aprende sobre nutrición premium, dermatitis y dental care.",
        "Quiere un vet que la trate con respeto profesional, no que la haga sentir tonta cuando pregunta.",
        "Está dispuesta a pagar más por evitar el estrés que Bruno tuvo en su veterinaria anterior (sala llena de perros nerviosos).",
      ],
      frustraciones: [
        "En su vet anterior la atendieron 3 vets diferentes en 4 visitas; nadie conocía la historia de Bruno.",
        "Llegó con cita y aún así esperó 50 min porque había 2 emergencias antes; Bruno se estresó tanto que vomitó.",
        "Le cobraron Bs 280 por una consulta de 8 minutos sin examen físico completo.",
        "No le dieron explicación clara de la dermatitis; le vendieron un shampoo y la mandaron a casa.",
        "Llamó después de la cirugía y nadie le respondió hasta el día siguiente.",
      ],
      canales_consumo: [
        "Instagram (2 horas/día, sigue 30+ cuentas de pet care y vets).",
        "WhatsApp (canal principal).",
        "Google search (busca \"veterinaria Equipetrol\", reseñas Google).",
        "Tiktok (15 min/día, contenido casual).",
        "Recomendaciones del grupo de mamás caninas de su condominio.",
      ],
      cita: "Yo no busco la veterinaria más barata, busco la que entienda que Bruno es mi familia. Si tengo que pagar Bs 600 por una atención decente, pago. Pero no me hagan esperar 50 min con mi perro temblando.",
      objecion_tipica: "Tu clínica es nueva, ¿cómo sé que tienen experiencia para algo serio si Bruno se enferma de verdad?",
    },
    {
      nombre: "Carlos el ejecutivo gatero",
      edad: 50,
      ocupacion: "Director financiero de empresa agroindustrial",
      ingreso_aprox: "Bs 28.000/mes líquido + dividendos",
      ubicacion: "Casa propia en Las Palmas (condominio cerrado); 2 gatos siameses (Atenea y Zeus, hermanos, 7 años).",
      motivaciones: [
        "Tiene gatos desde niño; conoce las diferencias entre felinos y caninos en cuanto a estrés y manejo médico.",
        "Es obsesivamente racional: lee papers, pregunta por protocolos, exige diagnóstico diferencial.",
        "Atenea fue diagnosticada con enfermedad renal crónica el año pasado; necesita seguimiento riguroso (analíticas cada 3 meses, dieta especial).",
        "Detesta llevar a sus gatos a salas de espera con perros — Atenea hace berrinches de 30 min después.",
        "Valora la confidencialidad y eficiencia: quiere agendar, llegar, ser atendido, irse. Sin demoras, sin sorpresas.",
      ],
      frustraciones: [
        "La mayoría de vets de Santa Cruz son \"perreros\" y no manejan correctamente la sedación felina.",
        "Le ofrecen vacunas combinadas estándar sin preguntar el riesgo individual de cada gato.",
        "Llamó a 3 vets pidiendo análisis SDMA (marcador renal felino temprano) y solo 1 sabía qué era.",
        "Los protocolos de \"todo gato sano = panel general\" le parecen sobrediagnóstico costoso sin justificar.",
      ],
      canales_consumo: [
        "Google search exhaustivo antes de cualquier decisión.",
        "LinkedIn (uso profesional, sigue veterinarios y especialistas).",
        "WhatsApp (canal de mensajería preferido, no Instagram).",
        "Foros internacionales de medicina felina (icatcare.org).",
        "Recomendaciones boca-a-boca en su círculo (gerentes con mascotas).",
      ],
      cita: "Necesito un vet que sepa interpretar un perfil renal en gato, no que me diga \"todo bien\" porque la creatinina está dentro del rango. Si encuentras quien hable mi idioma médico, lo cambio por mi vet de 12 años.",
      objecion_tipica: "¿Cuál es la formación específica del vet en medicina felina? Diplomado, residencia, papers publicados — no me alcanza con \"nos gustan los gatos\".",
    },
  ],
  mix: [
    {
      categoria: "Producto",
      decision: "Consulta veterinaria con plan individualizado (no protocolo masivo): historia clínica digitalizada, examen físico completo de 25 min, seguimiento por WhatsApp post-consulta 24h y 72h.",
      justificacion: "Aborda directamente el dolor de Sofía (\"3 vets distintos, nadie conocía a Bruno\") y de Carlos (\"protocolo masivo sin pensar en mi gato\"). Tiempo de consulta es 3x el promedio de mercado (8 min).",
    },
    {
      categoria: "Producto",
      decision: "Líneas de servicio: (1) Consulta + diagnóstico, (2) Cirugía con anestesia monitoreada, (3) Peluquería profesional (groomer certificado), (4) Pet hotel 8 habitaciones individuales, (5) Plan preventivo anual con descuento integrado.",
      justificacion: "Multi-servicio = cross-sell natural. El cliente que viene por peluquería conoce al vet; el del pet hotel agenda chequeo. LTV proyectado Bs 4.800/año vs Bs 1.800 de consulta esporádica.",
    },
    {
      categoria: "Precio",
      decision: "Consulta general Bs 280 (mercado Bs 180-220). Consulta felina especializada Bs 350. Cirugía castración macho Bs 850 (incluye pre-quirúrgico + monitoreo + post-op).",
      justificacion: "Premium 30-45% sobre mercado, justificado por tiempo de consulta, separación de áreas, seguimiento. Target acepta porque el cliente A/B+ ya paga Bs 600/mes en pet food premium.",
    },
    {
      categoria: "Precio",
      decision: "\"Plan Pawtique Anual\" Bs 2.400 (Bs 200/mes): 4 consultas, 2 baños, 1 vacuna anual, 10% descuento en cirugías. Pago con tarjeta o QR Banco Económico en cuotas de 3.",
      justificacion: "Plan anual fideliza al cliente (no busca otro vet), suaviza el cashflow del negocio y baja el ticket aparente para venta consultiva. Margen del plan 58%.",
    },
    {
      categoria: "Plaza",
      decision: "Local de 240 m² en av. San Martín c/calle 4 (Equipetrol Norte). Estacionamiento privado para 6 autos. Horario: lunes-sábado 8:00-20:00, domingo emergencias.",
      justificacion: "Ubicación a 800m del epicentro Equipetrol. Estacionamiento es clave (Sofía no quiere caminar 3 cuadras con Bruno). Domingo emergencia justifica precio premium.",
    },
    {
      categoria: "Plaza",
      decision: "Agendamiento 100% online vía Calendly integrado en web + WhatsApp Business con respuesta <10 min en horario laboral.",
      justificacion: "Cero llamadas telefónicas (que Carlos detesta). Calendly muestra disponibilidad real y evita el \"venga el lunes a ver si hay turno\". Posicionamiento moderno y eficiente.",
    },
    {
      categoria: "Promocion",
      decision: "Instagram como canal principal (cuenta @pawtique.scz). Contenido pedagógico semanal + reels con mascotas de clientes reales (con autorización). 4 publicaciones/semana, 3 reels/semana.",
      justificacion: "Las dos personas viven en Instagram (Sofía intensamente, Carlos para investigar). El contenido pedagógico (no venta directa) construye autoridad y educa al cliente para que valore el servicio.",
    },
    {
      categoria: "Promocion",
      decision: "Alianzas con 4 pet shops premium de Equipetrol y Las Palmas (Pet Store La Granja, PetCity, Mi Mascota Boutique, Top Dog) — descuento cruzado y referidos.",
      justificacion: "Los pet shops ya tienen el cliente del nicho. Una alianza con descuento mutuo del 15% activa 8-15 referidos/mes con CAC casi cero. El cliente confía más en la recomendación del pet shop que en un anuncio.",
    },
    {
      categoria: "Personas",
      decision: "Equipo: Dr. Andrés (director, vet felino), Dra. Camila Soto (vet canina, 8 años exp), Eliana Vargas (técnica vet), Mateo Choque (groomer certificado AKC), Lupe (recepcionista bilingüe).",
      justificacion: "Cada persona tiene credencial verificable (diplomados, certificados AKC para grooming). Para Carlos esto es bloqueante. Lupe bilingüe atiende clientes expatriados que también son nicho A/B+.",
    },
    {
      categoria: "Personas",
      decision: "Capacitación continua: 1 curso internacional/año por vet (presupuesto Bs 5.000/vet) + 1 reunión clínica mensual de discusión de casos. Vacaciones pagadas tras consultas semestrales 1:1.",
      justificacion: "Retención de staff es clave: si rota el vet, el cliente migra. Inversión en formación se devuelve en NPS y en ausencia de errores clínicos costosos.",
    },
    {
      categoria: "Procesos",
      decision: "Flujo del cliente: recordatorio WhatsApp 24h antes → llegada con estacionamiento listo → check-in en 90 segundos → sala de espera felina o canina (separada) → consulta 25 min → resumen escrito + foto → seguimiento WhatsApp 24h.",
      justificacion: "Cada paso ataca un dolor específico (Sofía: estrés en sala; Carlos: ineficiencia). El resumen escrito + foto es viralidad pura: los clientes lo comparten en su grupo de mamás caninas.",
    },
    {
      categoria: "Procesos",
      decision: "Historia clínica digital en software VetSpire (cuenta US$ 89/mes). Cada vet ve historia completa antes de entrar a consulta. Cliente recibe link con resumen y receta.",
      justificacion: "Resuelve directamente el dolor #1 de Sofía (\"3 vets diferentes nadie conocía a Bruno\"). Diferenciador imitable solo a largo plazo; competencia tarda 6+ meses en alcanzar.",
    },
    {
      categoria: "Evidencia_fisica",
      decision: "Dos áreas físicamente separadas: lado canino (paredes verde menta, fotos de razas, dispenser de premios) y lado felino (paredes azul polvo, jaulas a media altura, difusor de feromonas Feliway). Recepción central con espacio para 4 mascotas pequeñas.",
      justificacion: "El cliente ENTRA y ve la diferencia. Justifica visualmente el precio premium en 5 segundos. Foto principal de Instagram + Google Maps.",
    },
    {
      categoria: "Evidencia_fisica",
      decision: "Uniformes en color verde corporativo con bordado nombre + especialidad. Carnet de salud digital de la mascota con QR descargable. Bolsita con muestra de premio + tarjeta del staff atendiendo.",
      justificacion: "Cada detalle físico construye experiencia premium. La bolsita de muestra es viralidad (mascota feliz al volver a casa = mamá publica en Instagram). Costo Bs 12/cliente, ROI viral elevado.",
    },
  ],
  presupuesto: {
    total_bs_mes: 6000,
    desglose: [
      {
        canal: "Instagram Ads (Meta) — campañas geolocalizadas Equipetrol/Las Palmas/Urubó",
        monto_bs_mes: 2000,
        resultado_esperado: "Alcance 18.000 cuentas/mes en geo segmentado por intereses pet care + NSE alto. 35-50 conversaciones nuevas en DM. 12-18 nuevas mascotas atendidas.",
        cpl_estimado_bs: 55,
      },
      {
        canal: "Producción de contenido (fotos pro mensual + edición reels + community manager)",
        monto_bs_mes: 1500,
        resultado_esperado: "12 publicaciones + 12 reels + 24 stories/mes. Crecimiento orgánico 8% mensual de seguidores cualificados. 6-10 leads orgánicos cualificados/mes.",
        cpl_estimado_bs: 188,
      },
      {
        canal: "Google Ads — keywords \"veterinaria Equipetrol\", \"vet felino Santa Cruz\", \"emergencia veterinaria\"",
        monto_bs_mes: 900,
        resultado_esperado: "120-160 clics/mes con CPC Bs 6-8. 18-25 leads de altísima intención (emergencias y búsqueda activa). 8-12 cierres.",
        cpl_estimado_bs: 45,
      },
      {
        canal: "Alianzas con 4 pet shops premium (descuento cruzado + cartelería)",
        monto_bs_mes: 600,
        resultado_esperado: "Material POP en 4 puntos + comisión 8% por cliente referido convertido. 10-15 nuevas mascotas/mes vía referidos.",
        cpl_estimado_bs: 50,
      },
      {
        canal: "Open day evento (1 por mes) — desayuno + charla educativa para 12-15 dueños",
        monto_bs_mes: 700,
        resultado_esperado: "1 evento mensual con 12-15 dueños cualificados (curados de pet shops). Conversión 60% a primera consulta = 8-10 clientes nuevos. Alto LTV.",
        cpl_estimado_bs: 70,
      },
      {
        canal: "Google My Business + reseñas + WhatsApp Business pro",
        monto_bs_mes: 300,
        resultado_esperado: "Aparecer en top 3 búsquedas locales \"veterinaria Equipetrol\". Reseñas verificadas (meta 4.8 estrellas con 60+ reseñas en 6 meses). Tráfico orgánico de búsqueda.",
      },
    ],
    roas_proyectado: 5.2,
  },
  calendario: [
    {
      semana: 1,
      tipo: "Evento de lanzamiento privado",
      canal: "Local físico + Instagram + WhatsApp",
      contenido: "Cocktail de apertura para 40 invitados: ex-clientes de Andrés en VetCenter, dueños de los 4 pet shops aliados, 8 micro-influencers locales pet. Tour por las dos áreas separadas. Filmar para reels.",
    },
    {
      semana: 1,
      tipo: "Anuncio paid de lanzamiento",
      canal: "Meta Ads (Instagram + Facebook)",
      contenido: "Campaña geo Equipetrol+Las Palmas+Urubó con video 30s del local, mostrando separación felino/canino. Mensaje: \"La clínica que tu mascota espera. Abrimos en Equipetrol\". Bs 800 de boost.",
    },
    {
      semana: 2,
      tipo: "Reel pedagógico felino",
      canal: "Instagram + TikTok",
      contenido: "Reel \"5 señales de que tu gato te oculta que está enfermo\" — Dr. Andrés explicando con Atenea (caso real del propio Carlos, futuro paciente). Hook visual: gato escondido en caja.",
    },
    {
      semana: 2,
      tipo: "Activación pet shop",
      canal: "4 pet shops aliados",
      contenido: "Instalar material POP (afiches A3 + dispenser de cupones \"15% de descuento en primera consulta\"). Capacitación de 30 min al staff de cada pet shop sobre cómo referir.",
    },
    {
      semana: 3,
      tipo: "Caso de transformación",
      canal: "Instagram (carrusel + reel)",
      contenido: "Caso \"Antes/después\" de Bruno (golden con dermatitis crónica, paciente con consentimiento). Carrusel con foto inicial + protocolo + resultado en 8 semanas. Testimonio de Sofía en reel 45s.",
    },
    {
      semana: 3,
      tipo: "Open day #1",
      canal: "Local + WhatsApp invitación",
      contenido: "Charla \"Cuidados odontológicos en mascotas: lo que la mayoría no sabe\" (sábado 10:00, 1h). 15 inscritos vía formulario. Desayuno boutique + tour. Meta 60% conversión a consulta agendada.",
    },
    {
      semana: 4,
      tipo: "Reel humor reconocible",
      canal: "Instagram + TikTok",
      contenido: "Sketch \"Cuando tu gato escucha el carrier y se evapora\" — Mateo (groomer) actuando + caps de gatos. Cierra con CTA suave \"Visitas que tu gato no odia\".",
    },
    {
      semana: 4,
      tipo: "Email/WhatsApp a base de invitados al lanzamiento",
      canal: "WhatsApp Business + Mailerlite",
      contenido: "Mensaje personalizado a los 40 asistentes al cocktail: \"¿Cómo está [nombre mascota]? Te dejo este turno reservado el jueves\". Conversión esperada: 55%.",
    },
    {
      semana: 5,
      tipo: "Colaboración micro-influencer",
      canal: "Instagram @clamarcoscz (15k seguidores SCZ pet)",
      contenido: "Micro-influencer trae a su gata Tigre a su primer chequeo. Documenta llegada, sala felina, atención del Dr. Andrés. 1 reel + 4 stories. Pago Bs 800.",
    },
    {
      semana: 5,
      tipo: "Reel explicativo de precio",
      canal: "Instagram",
      contenido: "\"Por qué nuestra consulta cuesta Bs 280\" — Andrés muestra los 25 min de consulta vs los 8 min estándar, el equipo, la sala separada. Educar sin tono defensivo.",
    },
    {
      semana: 6,
      tipo: "Reseñas + GMB",
      canal: "Google Business + WhatsApp",
      contenido: "Campaña: pedir reseña a los 30 primeros clientes con mensaje personalizado vía WhatsApp 48h post-consulta. Link directo. Meta: 18 reseñas nuevas (60% tasa). Promedio target 4.9.",
    },
    {
      semana: 6,
      tipo: "Open day #2",
      canal: "Local + WhatsApp",
      contenido: "Charla \"Plan preventivo: vacunas, desparasitación y nutrición que tu vet del barrio no te explica bien\". Foco en clientes referidos por pet shops. 12-15 asistentes.",
    },
    {
      semana: 7,
      tipo: "Reel de equipo (people first)",
      canal: "Instagram + LinkedIn",
      contenido: "Reel \"Conoce a tu equipo Pawtique\": Andrés con Atenea, Camila con Bruno, Mateo en grooming, Eliana preparando jaula. Humano, no corporativo. Meta: 800 reacciones.",
    },
    {
      semana: 8,
      tipo: "Reporte público de 60 días",
      canal: "Instagram + WhatsApp Status del Dr. Andrés",
      contenido: "Post carrusel \"60 días de Pawtique: 87 mascotas atendidas, 0 esperas mayores a 8 min, 4.9 estrellas\". Construye confianza y empuja indecisos. Acompañar con Reel emocional.",
    },
  ],
  kpis: [
    "Nuevos clientes/mes: meta 20 mes 1 → escalar a 35 mes 6.",
    "Ticket promedio: meta Bs 380 (mercado promedio Bs 260).",
    "Tasa de retención (segunda visita en 90 días): meta 75%.",
    "LTV anual por cliente: meta Bs 2.800 (consultas + plan + servicios cruzados).",
    "NPS post-consulta (encuesta WhatsApp): meta >65.",
    "Reseñas Google Maps: meta 60 reseñas en 6 meses con rating 4.8+.",
    "% de clientes con Plan Pawtique Anual: meta 35% del total activo.",
  ],
  conclusion: "Plan **viable con horizonte largo**. El nicho premium responde más lento que mass market: los primeros 60 días son de construcción de prueba social (reseñas, contenido, alianzas) más que de venta directa. La curva se acelera del mes 3 en adelante cuando el boca-a-boca dentro de Equipetrol se activa. ROAS proyectado 5.2x compensa el ticket alto. El verdadero motor de rentabilidad no es la adquisición sino la retención (LTV Bs 2.800/año vs CAC Bs 130 = 21x lifetime).",
  lecciones: [
    "Servicios premium se venden por evidencia física y procesos visibles, no por anuncios agresivos. El cliente A/B+ huye de la venta dura.",
    "Las alianzas con players adyacentes (pet shops) tienen CAC menor que cualquier canal pagado en nichos premium.",
    "Contenido educativo + casos reales con consentimiento construyen autoridad médica que el cliente paga sin discutir.",
    "Separar áreas físicamente (perro/gato) no es \"un detalle\", es una promesa de marca que justifica el 30-40% de premium en precio.",
    "Reseñas verificadas en Google Maps pesan más que cualquier campaña paid en decisiones de salud (humana o animal).",
  ],
  errores_evitados: [
    "No bajar precio para \"llenar agenda\" en los primeros meses — destruye el posicionamiento premium y atrae clientes que después se quejan.",
    "No mezclar comunicación canina y felina en un mismo reel — confunde y diluye la promesa diferencial.",
    "No publicar fotos de mascotas sin autorización escrita del dueño — un solo conflicto destruye reputación.",
    "No descuidar el SLA de WhatsApp (<10 min) — el cliente premium espera respuesta inmediata y no perdona el silencio.",
    "No competir contra veterinarias mass market (PetSavings, Tu Vet Amigo) — son otro mercado; tu pelea es contra VetCenter y Animal Total.",
  ],
  tags: ["pet-care", "salud-animal", "7P", "premium", "Santa-Cruz", "Equipetrol", "Instagram", "retencion"],
};
