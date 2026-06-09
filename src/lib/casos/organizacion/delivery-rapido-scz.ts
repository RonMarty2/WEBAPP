import type { CasoOrganizacion } from "../types";

/**
 * Caso 1 — Startup de delivery rápido en Santa Cruz (8 empleados).
 *
 * Caso **intermedio** que muestra cómo estructurar una empresa de
 * tecnología/logística desde cero antes de operar. Foco en organigrama
 * lean, salarios competitivos para retener motorizados y régimen
 * tributario coherente con el modelo de facturación esperado.
 */

export const casoDeliveryRapidoScz: CasoOrganizacion = {
  slug: "delivery-rapido-scz",
  modulo: "organizacion",
  titulo: "Startup de delivery rápido con 8 empleados",
  tagline: "Estructurar una empresa de delivery especializado en farmacias y conveniencia con promesa de entrega en menos de 30 minutos.",
  zona: "Santa Cruz (anillos 1-3)",
  rubro: "Logística / delivery",
  dificultad: "intermedio",
  emoji: "🛵",
  emprendedor: {
    nombre: "Andrés Suárez",
    edad: 31,
    rol: "Ex Product Manager en una empresa de tecnología cruceña. Renunció en 2026 para lanzar Volá, su propio emprendimiento de delivery especializado en farmacias y tiendas de conveniencia (no comida). Su tesis: el delivery de comida está saturado, pero el de farmacia y conveniencia no.",
  },
  contexto: [
    "Andrés trabajó tres años como PM en una scaleup cruceña que hacía pagos digitales. Vio de cerca cómo la operación de un servicio digital se cae cuando la estructura humana es improvisada: incentivos mal puestos, motorizados que rotan cada dos meses, supervisión inexistente. Decidió que su empresa nacería con la estructura ya pensada, no parchada después.",
    "Lanza Volá con una promesa concreta: pedidos de farmacia y conveniencia entregados en menos de 30 minutos dentro de los anillos 1 al 3 de Santa Cruz. La cobertura inicial es deliberadamente pequeña para asegurar el tiempo. La flota arranca con 4 motorizados propios (no socios independientes) porque cree que la calidad solo se logra con personal en planilla.",
    "Antes de salir a operar necesita resolver el armado organizacional: cuántas personas, en qué cargos, cuánto cuesta la planilla mensual, qué tipo de sociedad, qué impuestos y qué proceso operativo seguir desde que entra un pedido hasta que se entrega. Su asesor contable le pidió dejar todo claro antes de pisar Impuestos.",
  ],
  problema: "Andrés necesita estructurar Volá antes de operar: organigrama, salarios, tipo de sociedad y proceso operativo. Sin esa base, el equipo no se sostiene y el contador no puede registrar la empresa.",
  segmento: "Adultos 25-55 años residentes en anillos 1-3 de Santa Cruz, NSE B y C+, que necesitan productos de farmacia o conveniencia con urgencia y valoran la velocidad sobre el costo del delivery.",
  organigrama: [
    { cargo: "CEO / Fundador", ocupante: "Andrés Suárez" },
    { cargo: "Jefe de Operaciones", ocupante: "Camila Roca", reporta_a: "CEO / Fundador" },
    { cargo: "Encargado de Marketing", ocupante: "Diego Mendoza", reporta_a: "CEO / Fundador" },
    { cargo: "Desarrollador / Soporte Tech", ocupante: "Luis Paredes", reporta_a: "CEO / Fundador" },
    { cargo: "Motorizado Repartidor", reporta_a: "Jefe de Operaciones", cantidad: 4 },
  ],
  rrhh: [
    {
      cargo: "CEO / Fundador",
      responsabilidades: [
        "Definir estrategia y dirección general de Volá.",
        "Levantar capital y gestionar relación con inversionistas y aliados.",
        "Aprobar presupuestos mensuales y decisiones financieras críticas.",
        "Representar legalmente a la empresa frente a clientes corporativos.",
        "Supervisar al equipo directo (Operaciones, Marketing, Tech).",
      ],
      requisitos: [
        "Experiencia previa en gestión de producto o startups tecnológicas.",
        "Conocimiento de logística urbana y modelos de delivery.",
        "Capacidad de negociación con farmacias y tiendas aliadas.",
        "Inglés intermedio para tratar con proveedores tecnológicos.",
        "Disponibilidad de tiempo completo y dedicación exclusiva.",
      ],
      salario_liquido_bs: 12000,
      costo_total_bs: 15000,
      tipo_contrato: "Indefinido (autoasignación como socio gerente)",
    },
    {
      cargo: "Jefe de Operaciones",
      responsabilidades: [
        "Coordinar la flota de motorizados y asignar turnos diarios.",
        "Monitorear tiempos de entrega y resolver incidentes en ruta.",
        "Mantener relación operativa con farmacias y tiendas aliadas.",
        "Llevar control de combustible, mantenimiento y desempeño individual.",
        "Atender escalamientos de quejas de clientes en tiempo real.",
      ],
      requisitos: [
        "Carrera o técnico en Ingeniería Industrial, Logística o afín.",
        "Mínimo 2 años de experiencia en operaciones o última milla.",
        "Manejo de Excel intermedio y herramientas de tracking.",
        "Habilidad para liderar equipos de campo y resolver bajo presión.",
        "Disponibilidad para turnos rotativos incluyendo fines de semana.",
      ],
      salario_liquido_bs: 7500,
      costo_total_bs: 9375,
      tipo_contrato: "Indefinido a prueba 3 meses",
    },
    {
      cargo: "Encargado de Marketing",
      responsabilidades: [
        "Diseñar y ejecutar campañas digitales en Facebook, Instagram y TikTok.",
        "Crear contenido visual y de copy para redes y aplicación.",
        "Gestionar relación con influencers locales cruceños.",
        "Medir métricas de adquisición y retención de usuarios.",
        "Coordinar promociones conjuntas con farmacias aliadas.",
      ],
      requisitos: [
        "Carrera en Marketing, Comunicación o equivalente.",
        "Experiencia mínima 1 año en marketing digital con presupuesto real.",
        "Manejo de Meta Business, Google Ads y herramientas de diseño.",
        "Portafolio de campañas previas con resultados medibles.",
        "Conocimiento del mercado cruceño y tendencias de consumo local.",
      ],
      salario_liquido_bs: 5500,
      costo_total_bs: 6875,
      tipo_contrato: "Indefinido a prueba 3 meses",
    },
    {
      cargo: "Desarrollador / Soporte Tech",
      responsabilidades: [
        "Mantener la aplicación móvil y panel de operadores.",
        "Resolver bugs reportados por usuarios y motorizados en menos de 24 horas.",
        "Implementar nuevas funcionalidades priorizadas por el CEO.",
        "Monitorear servidores, integraciones de pago y trackeo GPS.",
        "Documentar incidencias y mantener backups diarios.",
      ],
      requisitos: [
        "Carrera o técnico en Sistemas, Informática o autodidacta probado.",
        "Manejo de React Native o Flutter y backend Node.js o similar.",
        "Experiencia con APIs de pago bolivianas (Tigo Money, QR Bancos).",
        "Capacidad de soporte de primera línea y diagnóstico de incidentes.",
        "Disponibilidad de guardia para fallas críticas fuera de horario.",
      ],
      salario_liquido_bs: 8000,
      costo_total_bs: 10000,
      tipo_contrato: "Indefinido a prueba 3 meses",
    },
    {
      cargo: "Motorizado Repartidor",
      responsabilidades: [
        "Recoger pedidos en farmacias o tiendas aliadas y entregarlos al cliente.",
        "Cumplir el tiempo prometido de menos de 30 minutos por entrega.",
        "Reportar incidentes, demoras o problemas con el pedido al jefe de operaciones.",
        "Mantener la motocicleta limpia, en buen estado y con seguro vigente.",
        "Atender al cliente con buen trato, uniforme correcto y casco.",
      ],
      requisitos: [
        "Mayor de edad con licencia de conducir categoría A vigente.",
        "Motocicleta propia o disponibilidad para usar moto de la empresa.",
        "Conocimiento de las calles de los anillos 1-3 de Santa Cruz.",
        "Smartphone propio con plan de datos para la aplicación interna.",
        "Buena presentación, puntualidad y trato amable con clientes.",
      ],
      salario_liquido_bs: 3500,
      costo_total_bs: 4375,
      tipo_contrato: "Indefinido a prueba 3 meses",
    },
  ],
  // CEO 15000 + Ops 9375 + Mkt 6875 + Tech 10000 + 4 motorizados * 4375 = 58750
  planilla_total_bs: 58750,
  legal: {
    tipo: "SRL",
    justificacion: "Andrés y un socio capitalista minoritario aportan capital. La SRL protege el patrimonio personal de ambos, permite contratar a varios empleados en planilla y proyecta una imagen seria frente a las farmacias aliadas que exigen contratos B2B con NIT y respaldo legal.",
    capital_social_bs: 30000,
    tramites: [
      { nombre: "Reserva de nombre", institucion: "FUNDEMPRESA", costo_aprox_bs: 136, plazo_dias: 2 },
      { nombre: "Escritura pública de constitución", institucion: "Notaría de Fe Pública", costo_aprox_bs: 1800, plazo_dias: 5 },
      { nombre: "Matrícula de comercio SRL", institucion: "FUNDEMPRESA", costo_aprox_bs: 455, plazo_dias: 7 },
      { nombre: "Padrón Nacional de Contribuyentes (NIT)", institucion: "Impuestos Nacionales", costo_aprox_bs: 0, plazo_dias: 3 },
      { nombre: "Licencia de funcionamiento municipal", institucion: "Gobierno Autónomo Municipal de Santa Cruz", costo_aprox_bs: 600, plazo_dias: 10 },
      { nombre: "Afiliación patronal a Caja Nacional de Salud", institucion: "CNS", costo_aprox_bs: 0, plazo_dias: 5 },
      { nombre: "Registro patronal AFP", institucion: "AFP Futuro de Bolivia", costo_aprox_bs: 0, plazo_dias: 3 },
      { nombre: "Inscripción al Ministerio de Trabajo", institucion: "Ministerio de Trabajo, Empleo y Previsión Social", costo_aprox_bs: 0, plazo_dias: 7 },
    ],
    regimen_tributario: "Régimen General (facturación esperada superior a Bs 184.000 anuales, obligatorio para SRL)",
  },
  tecnico: {
    nombre: "Flujo operativo del pedido en Volá",
    pasos: [
      "El cliente abre la aplicación, elige farmacia o tienda y arma su pedido.",
      "El sistema confirma stock con la farmacia aliada en menos de 60 segundos.",
      "Se procesa el pago en línea por Tigo Money, QR bancario o tarjeta.",
      "La aplicación asigna automáticamente al motorizado más cercano y disponible.",
      "El motorizado recoge el pedido firmando recepción digital en la farmacia.",
      "Durante la ruta el cliente ve la ubicación en tiempo real en su mapa.",
      "El motorizado entrega el pedido, toma foto de evidencia y cierra el viaje.",
      "El sistema confirma entrega al cliente y abre la encuesta de satisfacción de 3 toques.",
    ],
    tiempo_total: "Menos de 30 minutos desde la confirmación de pago hasta la entrega al cliente",
    capacidad: "Cada motorizado realiza entre 14 y 18 entregas por turno de 8 horas. Con 4 motorizados, la capacidad diaria llega a 56-72 entregas en dos turnos.",
    equipamiento: [
      { item: "Motocicleta 125cc nueva por motorizado (x4 unidades)", costo_bs: 56000 },
      { item: "Caja térmica con marca Volá por motorizado (x4 unidades)", costo_bs: 2400 },
      { item: "Casco con identificación corporativa por motorizado (x4 unidades)", costo_bs: 2000 },
      { item: "Computadora portátil para Operaciones, Marketing y Tech (x3 unidades)", costo_bs: 13500 },
      { item: "Servidor en la nube y dominios para la aplicación (anual prorrateado)", costo_bs: 8400 },
      { item: "Smartphones corporativos para motorizados (x4 unidades)", costo_bs: 6000 },
      { item: "Mobiliario básico de oficina compartida (escritorios, sillas, pizarra)", costo_bs: 7500 },
    ],
  },
  branding: {
    mision: "Llevar lo que necesitas con urgencia, en menos de 30 minutos, sin que tengas que salir de tu casa.",
    vision: "Ser la red de entrega urbana más rápida y confiable de Bolivia para productos de farmacia y conveniencia para el año 2030.",
    valores: [
      "Velocidad medida: cada minuto cuenta y se mide.",
      "Honestidad operativa: si fallamos en el tiempo, lo comunicamos al cliente.",
      "Respeto al motorizado: nuestra primera línea no es desechable.",
      "Cuidado del producto: medicamentos y conveniencia llegan en perfecto estado.",
      "Transparencia en el precio: sin tarifas ocultas ni recargos sorpresa.",
    ],
    cultura: "Volá funciona como un equipo deportivo: pocos jugadores, roles claros y mucha cancha. Cada lunes hay un standup de 20 minutos para revisar tiempos, incidentes y aprendizajes. Los motorizados no son contratistas anónimos sino el equipo principal del negocio; participan en las reuniones, opinan sobre rutas y reciben capacitación pagada. La cultura premia decir la verdad rápido antes que esconder el problema.",
    identidad_visual: {
      colores: ["Verde lima vibrante #B6FF3C", "Negro grafito #1A1A1A", "Blanco hueso #F7F7F2", "Naranja alerta #FF6A2D"],
      tipografia: "Inter para interfaz de aplicación y Archivo Black para títulos comerciales.",
      tono_comunicacion: "Directo, juvenil y operativo. Frases cortas, segunda persona del singular tuteo. Sin tecnicismos: hablamos como un amigo que entrega rápido y cumple.",
    },
  },
  conclusion: "El armado organizacional de Volá quedó listo antes de operar. La planilla mensual de Bs 58.750 es sostenible si se logran 50 entregas diarias promedio con ticket de Bs 25 y margen del 25% (ingreso bruto mensual proyectado Bs 93.750). El tipo SRL protege el patrimonio personal de Andrés, el Régimen General es obligatorio por el nivel de facturación esperado, y la estructura de cuatro motorizados con jefe de operaciones permite cubrir dos turnos sin saturación. Andrés debe arrancar con esta base y revisar planilla a los 6 meses para escalar.",
  lecciones: [
    "Contratar motorizados en planilla cuesta 25% más que como independientes, pero estabiliza el equipo y la calidad del servicio.",
    "El Régimen General es obligatorio para SRL en Bolivia; intentar evitarlo con figuras informales pone en riesgo todo el proyecto.",
    "El capital social mínimo de SRL es Bs 5.000, pero arrancar con Bs 30.000 muestra solvencia frente a aliados B2B.",
    "El costo total empresa supera al salario líquido en aproximadamente 25% por aportes patronales y provisiones de aguinaldo.",
    "Tener jefe de operaciones desde el día uno evita que el CEO se desgaste apagando incendios operativos en lugar de levantar capital.",
  ],
  errores_evitados: [
    "No contratar motorizados como falsos independientes para ahorrar aportes: termina en demanda laboral con multas mayores.",
    "No saltarse el registro municipal pensando que es opcional para empresas digitales: cualquier inspección lo bloquea todo.",
    "No fijar salarios por debajo del salario mínimo nacional vigente para 2026 (Bs 2.500 líquidos).",
    "No olvidar incluir provisiones de aguinaldo y bono antigüedad en el costo total al proyectar caja.",
    "No mezclar caja personal con caja empresarial: la SRL exige cuentas separadas desde el día uno.",
  ],
  tags: ["delivery", "logistica", "Santa-Cruz", "SRL", "8-empleados", "regimen-general", "startup"],
};
