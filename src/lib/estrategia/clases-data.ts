/**
 * Contenido de la Academia del módulo Estrategia.
 * Cada clase: teoría con secciones (con ejemplo boliviano) + quiz de 3 preguntas.
 * Las herramientas se practican en el laboratorio (/estrategia/analisis).
 */

export type Dificultad = 'inicial' | 'intermedia' | 'avanzada';

export interface SeccionTeoria {
  titulo: string;
  parrafos: string[];
  ejemplo?: { enunciado: string; desarrollo: string; resultado: string };
}

export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

export interface ClaseEstrategia {
  slug: string;
  numero: number;
  titulo: string;
  resumen: string;
  duracionMin: number;
  dificultad: Dificultad;
  secciones: SeccionTeoria[];
  quiz: PreguntaQuiz[];
}

export const CLASES_ESTRATEGIA: ClaseEstrategia[] = [
  // ───────────────────────────────────────────────────────── CLASE 1
  {
    slug: 'que-es-analisis-estrategico',
    numero: 1,
    titulo: '¿Qué es el análisis estratégico y por qué importa?',
    resumen:
      'Antes de decidir qué hará tu empresa, necesitas entender su entorno y sus capacidades. El análisis estratégico ordena ese diagnóstico en tres niveles.',
    duracionMin: 10,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Estrategia es elegir, y elegir necesita diagnóstico',
        parrafos: [
          'Estrategia es decidir dónde competir y cómo ganar. Pero no puedes decidir bien sin un diagnóstico honesto de tu situación: qué pasa afuera (entorno), qué pasa en tu sector (competencia) y qué tienes adentro (recursos y capacidades).',
          'El análisis estratégico es ese diagnóstico ordenado. No es llenar matrices por llenarlas: cada herramienta responde una pregunta concreta que luego usarás para decidir.',
          'Un error común en proyectos de grado bolivianos es saltar directo a "mi estrategia es vender barato" sin haber analizado si el entorno y el sector lo permiten. El análisis evita esas conclusiones apresuradas.',
        ],
      },
      {
        titulo: 'Tres niveles: macro, micro e interno',
        parrafos: [
          'Macroentorno: fuerzas grandes que afectan a TODOS los negocios (economía, política, tecnología…). No las controlas, pero debes anticiparlas. Herramienta: PESTEL.',
          'Microentorno (sector): la competencia directa, proveedores, clientes y sustitutos de TU industria. Herramientas: 5 Fuerzas de Porter y la Matriz de Perfil Competitivo (MPC).',
          'Análisis interno: lo que tu empresa es y tiene. Herramientas: cadena de valor y la matriz MEFI. Luego todo se sintetiza (FODA, MIE) y se decide (BCG, Ansoff, PEYEA, MCPE).',
        ],
        ejemplo: {
          enunciado: 'Una cafetería de especialidad en Cochabamba quiere crecer.',
          desarrollo:
            'Macro: inflación que sube el precio del grano (PESTEL).\nMicro: muchas cafeterías nuevas compiten por la misma zona (Porter).\nInterno: su barista es campeón nacional, una ventaja real (MEFI).',
          resultado: 'Cada nivel aporta una pieza distinta del diagnóstico antes de decidir.',
        },
      },
      {
        titulo: 'Del diagnóstico a la decisión',
        parrafos: [
          'El análisis no termina en describir: termina en decidir. Por eso el módulo cierra con herramientas de decisión que comparan opciones y eligen la más conveniente (la MCPE/QSPM) o posicionan el negocio (BCG, PEYEA).',
          'Regla de oro: cada dato que pongas en una matriz debe poder defenderse ante el tribunal. Si no sabes de dónde salió, no lo pongas.',
        ],
      },
    ],
    quiz: [
      {
        pregunta: '¿Cuál es el propósito final del análisis estratégico?',
        opciones: ['Llenar todas las matrices posibles', 'Describir bonito la empresa', 'Tomar decisiones con evidencia', 'Impresionar al tribunal'],
        correcta: 2,
        explicacion: 'El análisis es un medio para decidir dónde competir y cómo ganar, con evidencia en vez de corazonada.',
      },
      {
        pregunta: '¿Qué herramienta corresponde al MACROentorno?',
        opciones: ['5 Fuerzas de Porter', 'PESTEL', 'Cadena de valor', 'MEFI'],
        correcta: 1,
        explicacion: 'PESTEL analiza las fuerzas grandes (político, económico, social, tecnológico, ecológico, legal) que afectan a todos los negocios.',
      },
      {
        pregunta: 'Las 5 Fuerzas de Porter analizan principalmente…',
        opciones: ['El interior de la empresa', 'El sector y la competencia', 'La economía nacional', 'La cultura organizacional'],
        correcta: 1,
        explicacion: 'Porter mide la intensidad competitiva del sector: rivalidad, entrantes, sustitutos y poder de clientes y proveedores.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 2
  {
    slug: 'pestel-macroentorno',
    numero: 2,
    titulo: 'PESTEL: leer el macroentorno',
    resumen:
      'Seis lentes para ver las fuerzas que no controlas pero que pueden hacer o deshacer tu negocio: político, económico, social, tecnológico, ecológico y legal.',
    duracionMin: 12,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Qué mira cada letra',
        parrafos: [
          'Político: estabilidad, políticas públicas, subsidios, relación con gremios. Económico: inflación, tipo de cambio, ingreso de la gente, acceso a crédito. Social: cultura, demografía, hábitos de consumo, migración.',
          'Tecnológico: nuevas herramientas, automatización, presencia digital. Ecológico: clima, agua, regulación ambiental, presión por sostenibilidad. Legal: normas, impuestos, licencias, derechos laborales.',
          'No se trata de escribir un ensayo por letra, sino de identificar los pocos factores que de verdad mueven tu negocio.',
        ],
      },
      {
        titulo: 'Cada factor es oportunidad o amenaza',
        parrafos: [
          'Un buen PESTEL no solo lista factores: les asigna un impacto. En el laboratorio usas una escala de -2 (amenaza fuerte) a +2 (oportunidad fuerte). Eso te obliga a pensar cómo te afecta cada uno, no solo a mencionarlo.',
          'Los factores con impacto positivo alimentan después tus Oportunidades del FODA; los negativos, tus Amenazas. Por eso el módulo precarga el FODA desde el PESTEL.',
        ],
        ejemplo: {
          enunciado: 'PESTEL parcial de una heladería artesanal en Santa Cruz.',
          desarrollo:
            'Económico: poder adquisitivo creciente en verano → +2 (oportunidad).\nEcológico: olas de calor más largas → +1 (más demanda).\nLegal: nuevo registro sanitario obligatorio → -1 (costo y trámite).',
          resultado: 'Saldo favorable, pero el factor legal exige presupuesto y tiempo.',
        },
      },
    ],
    quiz: [
      {
        pregunta: 'La inflación y el tipo de cambio pertenecen a la dimensión…',
        opciones: ['Social', 'Económica', 'Legal', 'Tecnológica'],
        correcta: 1,
        explicacion: 'Inflación, tipo de cambio, ingreso y crédito son factores económicos del PESTEL.',
      },
      {
        pregunta: '¿Para qué sirve asignar un impacto (-2 a +2) a cada factor?',
        opciones: ['Para que se vea más técnico', 'Para obligarte a pensar cómo te afecta', 'Es opcional y decorativo', 'Para calcular el VAN'],
        correcta: 1,
        explicacion: 'El impacto convierte una lista en un análisis: distingue oportunidades de amenazas y su fuerza.',
      },
      {
        pregunta: 'Los factores PESTEL con impacto positivo suelen convertirse en…',
        opciones: ['Debilidades', 'Fortalezas', 'Oportunidades del FODA', 'Costos fijos'],
        correcta: 2,
        explicacion: 'Los factores externos positivos alimentan las Oportunidades; los negativos, las Amenazas.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 3
  {
    slug: 'porter-mpc-microentorno',
    numero: 3,
    titulo: 'Porter y MPC: el microentorno competitivo',
    resumen:
      'Las 5 Fuerzas miden qué tan atractivo (o brutal) es tu sector. La MPC te compara, factor por factor, contra tus competidores reales.',
    duracionMin: 13,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Las 5 fuerzas',
        parrafos: [
          'Rivalidad entre competidores: ¿cuántos son y qué tan duro pelean por precio? Amenaza de nuevos entrantes: ¿qué tan fácil es que alguien abra y te copie? Amenaza de sustitutos: ¿hay otra forma de resolver la misma necesidad?',
          'Poder de los clientes: ¿pueden exigir rebajas o irse fácil? Poder de los proveedores: ¿te imponen precios o condiciones? Cada fuerza se puntúa por intensidad (1 baja, 5 alta).',
          'Mientras más altas las fuerzas, menos rentable el sector. Un sector con baja rivalidad, altas barreras de entrada y proveedores débiles es un buen lugar para competir.',
        ],
      },
      {
        titulo: 'MPC: de "el sector" a "mis competidores"',
        parrafos: [
          'Porter mira el sector en general; la Matriz de Perfil Competitivo (MPC) te compara contra competidores concretos en los factores críticos de éxito (precio, calidad, ubicación, atención…).',
          'Cada factor lleva un peso (suman 1) y a cada empresa se le da una calificación (1-4). Peso × calificación = puntaje. El mayor total "gana" el sector. Te muestra dónde eres fuerte y dónde te están ganando.',
        ],
        ejemplo: {
          enunciado: 'MPC de tu cafetería vs. la cadena de enfrente.',
          desarrollo:
            'Ubicación (peso 0.3): tú 3, cadena 4.\nCalidad de café (peso 0.4): tú 4, cadena 2.\nPrecio (peso 0.3): tú 2, cadena 4.\nTú = 0.9+1.6+0.6 = 3.1 · Cadena = 1.2+0.8+1.2 = 3.2',
          resultado: 'Pierdes por poco: tu calidad no compensa la ubicación y el precio de la cadena.',
        },
      },
    ],
    quiz: [
      {
        pregunta: 'Si en un sector es muy fácil que entren nuevos competidores, esa fuerza es…',
        opciones: ['Baja, y es bueno', 'Alta, y reduce el atractivo del sector', 'Irrelevante', 'Un sustituto'],
        correcta: 1,
        explicacion: 'Barreras de entrada bajas = amenaza de entrantes alta = sector menos atractivo y rentable.',
      },
      {
        pregunta: 'En la MPC, ¿qué representa el "peso" de un factor?',
        opciones: ['Su costo', 'Qué tan crítico es para el éxito en el sector', 'El número de competidores', 'La utilidad'],
        correcta: 1,
        explicacion: 'El peso (los pesos suman 1) indica la importancia relativa de ese factor crítico de éxito.',
      },
      {
        pregunta: '¿Qué diferencia a Porter de la MPC?',
        opciones: ['Son lo mismo', 'Porter mira el sector; la MPC te compara con competidores concretos', 'La MPC es del macroentorno', 'Porter mide finanzas'],
        correcta: 1,
        explicacion: 'Porter evalúa la estructura del sector; la MPC hace un benchmarking puntual contra rivales específicos.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 4
  {
    slug: 'analisis-interno-cadena-valor',
    numero: 4,
    titulo: 'Análisis interno: cadena de valor y MEFI',
    resumen:
      'Mira hacia adentro: qué actividades crean valor en tu empresa y qué tan fuerte es tu posición interna comparada con tus debilidades.',
    duracionMin: 12,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'La cadena de valor de Porter',
        parrafos: [
          'Toda empresa es una secuencia de actividades que agregan valor. Las primarias: logística interna, operaciones, logística externa, marketing y ventas, y servicio. Las de apoyo: infraestructura, recursos humanos, tecnología y abastecimiento.',
          'Analizar la cadena te ayuda a ver DÓNDE generas tu ventaja (¿en la calidad de operaciones? ¿en el servicio?) y dónde pierdes valor o dinero.',
        ],
      },
      {
        titulo: 'MEFI: puntuar tu interior',
        parrafos: [
          'La Matriz de Evaluación de Factores Internos (MEFI) toma tus fortalezas y debilidades, les pone un peso (suman 1) y una calificación (1-4), y calcula un total ponderado.',
          'Un total por encima de 2.5 indica una posición interna fuerte; por debajo, débil. Es el eje horizontal de la matriz MIE que verás en la siguiente clase.',
          'Cuidado con el autoengaño: si calificas todo con 4, la matriz no sirve. Sé tan crítico con tus debilidades como generoso con tus fortalezas.',
        ],
        ejemplo: {
          enunciado: 'MEFI resumida de un taller de muebles a medida.',
          desarrollo:
            'Fortaleza: diseño propio (peso 0.3, calif 4) = 1.2\nFortaleza: cartera de clientes (peso 0.2, calif 3) = 0.6\nDebilidad: poca capacidad (peso 0.3, calif 2) = 0.6\nDebilidad: sin sistema de costos (peso 0.2, calif 1) = 0.2',
          resultado: 'Total 2.6 → posición interna ligeramente fuerte, pero la capacidad limita el crecimiento.',
        },
      },
    ],
    quiz: [
      {
        pregunta: '¿Cuál es una actividad PRIMARIA de la cadena de valor?',
        opciones: ['Recursos humanos', 'Operaciones', 'Tecnología', 'Infraestructura'],
        correcta: 1,
        explicacion: 'Las primarias son logística interna, operaciones, logística externa, marketing/ventas y servicio. RRHH, tecnología e infraestructura son de apoyo.',
      },
      {
        pregunta: 'Un total MEFI de 1.9 indica…',
        opciones: ['Posición interna fuerte', 'Posición interna débil', 'Sector atractivo', 'Buena rentabilidad'],
        correcta: 1,
        explicacion: 'Por debajo de 2.5 la posición interna se considera débil; conviene corregir debilidades.',
      },
      {
        pregunta: '¿Cuál es el riesgo de calificar todas tus fortalezas con 4?',
        opciones: ['Ninguno', 'Que la matriz pierda utilidad por autoengaño', 'Que suba el VAN', 'Que el tribunal apruebe más rápido'],
        correcta: 1,
        explicacion: 'Si todo es excelente, la matriz no distingue nada. El valor está en la autocrítica honesta.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 5
  {
    slug: 'matrices-mefe-mefi-mie',
    numero: 5,
    titulo: 'MEFE, MEFI y MIE: del diagnóstico al posicionamiento',
    resumen:
      'La MEFE puntúa el entorno, la MEFI tu interior, y la MIE las cruza para ubicarte en una de nueve regiones con una estrategia recomendada.',
    duracionMin: 12,
    dificultad: 'avanzada',
    secciones: [
      {
        titulo: 'MEFE: responder al entorno',
        parrafos: [
          'La Matriz de Evaluación de Factores Externos (MEFE) toma oportunidades y amenazas, las pondera (pesos suman 1) y califica (1-4) según QUÉ TAN BIEN responde tu empresa a cada una.',
          'Ojo con la interpretación de la calificación externa: no mide si el factor es bueno, sino si tu empresa está respondiendo bien a él. Un 4 en una amenaza significa que la estás manejando muy bien.',
        ],
      },
      {
        titulo: 'La MIE: una grilla 3×3',
        parrafos: [
          'La Matriz Interna-Externa (MIE) usa el total MEFI como eje X (interno) y el total MEFE como eje Y (externo). El cruce te ubica en una de 9 regiones agrupadas en tres zonas.',
          'Crecer y construir (regiones I, II, IV): invierte, usa estrategias intensivas. Resistir y mantener (III, V, VII): protege tu posición. Cosechar o desinvertir (VI, VIII, IX): reduce o sal con cuidado.',
          'Lo elegante de la MIE es que NO tiene datos propios: se deriva sola de tus MEFE y MEFI. Si esas están bien hechas, la MIE es automática.',
        ],
        ejemplo: {
          enunciado: 'Negocio con MEFI 3.1 y MEFE 3.3.',
          desarrollo: 'MEFI alto (interior fuerte) + MEFE alto (responde bien al entorno) → región I.',
          resultado: 'Zona "crecer y construir": es momento de invertir para expandirse.',
        },
      },
    ],
    quiz: [
      {
        pregunta: 'En la MEFE, una calificación de 4 en una amenaza significa que…',
        opciones: ['La amenaza es enorme', 'Tu empresa responde muy bien a esa amenaza', 'Debes ignorarla', 'El peso es alto'],
        correcta: 1,
        explicacion: 'La calificación externa mide la calidad de TU respuesta al factor, no la magnitud del factor en sí.',
      },
      {
        pregunta: '¿De dónde saca la MIE sus dos ejes?',
        opciones: ['De PESTEL y Porter', 'De los totales de MEFI (X) y MEFE (Y)', 'Del FODA', 'De las ventas'],
        correcta: 1,
        explicacion: 'La MIE se deriva automáticamente: eje X = total MEFI, eje Y = total MEFE.',
      },
      {
        pregunta: 'Caer en la zona "crecer y construir" sugiere…',
        opciones: ['Desinvertir', 'Invertir y usar estrategias intensivas', 'Cerrar el negocio', 'No hacer nada'],
        correcta: 1,
        explicacion: 'Las regiones I, II y IV indican posición favorable: conviene invertir para crecer.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 6
  {
    slug: 'sintesis-y-decision',
    numero: 6,
    titulo: 'Síntesis y decisión: FODA, BCG, Ansoff, PEYEA y MCPE',
    resumen:
      'El diagnóstico se vuelve estrategia: cruzas el FODA, eliges dónde crecer (Ansoff), posicionas el portafolio (BCG), tu postura (PEYEA) y decides con la MCPE.',
    duracionMin: 14,
    dificultad: 'avanzada',
    secciones: [
      {
        titulo: 'FODA cruzada: de la lista a la acción',
        parrafos: [
          'El FODA común se queda en cuatro listas. El FODA CRUZADO genera estrategias combinando: FO (fortaleza + oportunidad, ofensivas), DO (debilidad + oportunidad, reorientación), FA (fortaleza + amenaza, defensivas) y DA (debilidad + amenaza, supervivencia).',
          'Ahí está el verdadero valor: no en describir, sino en proponer acciones concretas que nacen de cruzar tu interior con tu entorno.',
        ],
      },
      {
        titulo: 'Herramientas de decisión',
        parrafos: [
          'BCG: clasifica tus productos/líneas según crecimiento del mercado y participación (Estrella, Vaca lechera, Interrogante, Perro). Ansoff: define cómo creces (penetración, desarrollo de producto, desarrollo de mercado, diversificación), con riesgo creciente.',
          'PEYEA: ubica tu postura estratégica (agresiva, conservadora, defensiva o competitiva) con un vector. MCPE/QSPM: la matriz cuantitativa final que puntúa cada estrategia candidata contra tus factores clave y te dice cuál conviene más.',
          'No necesitas usarlas todas siempre; usa las que respondan tu pregunta. Pero la MCPE es la que cierra: convierte el análisis en una decisión defendible con números.',
        ],
        ejemplo: {
          enunciado: 'Una panadería decide entre dos estrategias.',
          desarrollo:
            'MCPE: "Abrir sucursal" puntaje 5.8 vs. "Vender por delivery" 6.4 (sobre los mismos factores ponderados).',
          resultado: 'Delivery gana: menor inversión y aprovecha mejor sus fortalezas actuales.',
        },
      },
    ],
    quiz: [
      {
        pregunta: 'Una estrategia FO combina…',
        opciones: ['Dos debilidades', 'Fortaleza y oportunidad', 'Amenaza y debilidad', 'Precio y costo'],
        correcta: 1,
        explicacion: 'FO usa tus fortalezas para aprovechar oportunidades: son las estrategias ofensivas.',
      },
      {
        pregunta: 'En la matriz de Ansoff, ¿cuál es la opción de MAYOR riesgo?',
        opciones: ['Penetración de mercado', 'Desarrollo de producto', 'Desarrollo de mercado', 'Diversificación'],
        correcta: 3,
        explicacion: 'Diversificación (producto nuevo en mercado nuevo) es la de mayor riesgo; penetración, la menor.',
      },
      {
        pregunta: '¿Qué herramienta convierte el análisis en una decisión cuantitativa entre estrategias?',
        opciones: ['PESTEL', 'BCG', 'MCPE / QSPM', 'Cadena de valor'],
        correcta: 2,
        explicacion: 'La MCPE/QSPM puntúa cada estrategia candidata contra los factores clave y entrega un ranking.',
      },
    ],
  },
];

export const TOTAL_CLASES_ESTRATEGIA = CLASES_ESTRATEGIA.length;

export function getClaseEstrategia(slug: string): ClaseEstrategia | undefined {
  return CLASES_ESTRATEGIA.find((c) => c.slug === slug);
}
