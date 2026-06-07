/**
 * Contenido de la Academia del módulo Defensa.
 * Teoría (secciones + ejemplo boliviano) + quiz de 3 por clase.
 */

export type Dificultad = 'inicial' | 'intermedia' | 'avanzada';
export interface SeccionTeoria { titulo: string; parrafos: string[]; ejemplo?: { enunciado: string; desarrollo: string; resultado: string } }
export interface PreguntaQuiz { pregunta: string; opciones: string[]; correcta: number; explicacion: string }
export interface ClaseDefensa { slug: string; numero: number; titulo: string; resumen: string; duracionMin: number; dificultad: Dificultad; secciones: SeccionTeoria[]; quiz: PreguntaQuiz[] }

export const CLASES_DEFENSA: ClaseDefensa[] = [
  {
    slug: 'que-evalua-el-tribunal',
    numero: 1,
    titulo: 'Qué evalúa realmente un tribunal',
    resumen: 'El tribunal no busca hundirte: verifica que entiendes tu trabajo, que es tuyo y que puedes defender tus decisiones.',
    duracionMin: 9,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'No es un examen sorpresa',
        parrafos: [
          'La defensa evalúa tres cosas: que dominas tu propio trabajo, que las decisiones metodológicas tienen fundamento, y que el aporte es real y tuyo.',
          'El tribunal pregunta para confirmar que entiendes, no para humillarte. Una pregunta difícil suele ser una invitación a demostrar que sabes, no una trampa.',
        ],
      },
      {
        titulo: 'Lo que más se castiga',
        parrafos: [
          'Tres errores hunden defensas: no saber explicar tu propia metodología, citar o usar datos que no puedes sustentar, y contradecirte respecto a lo que está escrito en el documento.',
          'Por eso la mejor preparación es conocer tu trabajo a fondo y haber decidido cada cosa por una razón que puedas explicar en una frase.',
        ],
        ejemplo: {
          enunciado: 'Pregunta típica de método.',
          desarrollo: '"¿Por qué usaste una muestra de 384 y no de 100?" Respuesta sólida: "Por la fórmula para población infinita con 95% de confianza y 5% de error; lo vimos en el cálculo del capítulo 3."',
          resultado: 'Demuestra que la decisión tiene fundamento, no que fue al azar.',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Qué evalúa principalmente un tribunal?', opciones: ['Tu memoria literal', 'Que domines tu trabajo y puedas fundamentarlo', 'Que hables bonito', 'El diseño del PDF'], correcta: 1, explicacion: 'Verifica comprensión, fundamento de las decisiones y autoría real.' },
      { pregunta: 'Una pregunta difícil del tribunal suele ser…', opciones: ['Una trampa para reprobarte', 'Una invitación a demostrar que sabes', 'Un error del tribunal', 'Irrelevante'], correcta: 1, explicacion: 'Casi siempre busca que demuestres dominio, no humillarte.' },
      { pregunta: '¿Cuál es uno de los errores que más se castiga?', opciones: ['Hablar pausado', 'No poder explicar tu propia metodología', 'Usar diapositivas', 'Saludar al tribunal'], correcta: 1, explicacion: 'No sustentar tu método o datos, o contradecir lo escrito, son faltas graves.' },
    ],
  },
  {
    slug: 'anticipar-preguntas',
    numero: 2,
    titulo: 'Anticipar preguntas: tu banco por categoría',
    resumen: 'Las preguntas no son infinitas: se agrupan por categorías. Si preparas las categorías, cubres casi todo.',
    duracionMin: 10,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Las categorías frecuentes',
        parrafos: [
          'Marco teórico (¿por qué esos autores/conceptos?), Metodología (¿por qué ese diseño, muestra, instrumento?), Resultados (¿qué encontraste y qué significa?), Viabilidad (¿es realizable y rentable?), Aporte/originalidad (¿qué tiene de nuevo?) y Personal (¿por qué este tema, qué aprendiste?).',
          'En el laboratorio armas tu banco de preguntas por estas categorías y anotas los puntos clave de una buena respuesta. La IA puede generar preguntas según tu tema.',
        ],
      },
      {
        titulo: 'Prepara puntos clave, no discursos memorizados',
        parrafos: [
          'No memorices respuestas palabra por palabra: se nota y te traba si la pregunta cambia. Memoriza los PUNTOS CLAVE que toda buena respuesta debe tocar.',
          'Así puedes responder con naturalidad aunque la pregunta venga distinta a como la ensayaste.',
        ],
      },
    ],
    quiz: [
      { pregunta: 'Las preguntas del tribunal…', opciones: ['Son infinitas e impredecibles', 'Se agrupan en categorías predecibles', 'Siempre son de finanzas', 'No se pueden preparar'], correcta: 1, explicacion: 'Marco teórico, metodología, resultados, viabilidad, aporte y personal cubren casi todo.' },
      { pregunta: '¿Qué conviene memorizar?', opciones: ['Respuestas palabra por palabra', 'Los puntos clave de cada respuesta', 'Nada', 'Solo el título'], correcta: 1, explicacion: 'Los puntos clave te dan flexibilidad; el discurso literal se nota y te traba.' },
      { pregunta: '"¿Por qué elegiste este diseño metodológico?" es una pregunta de…', opciones: ['Marco teórico', 'Metodología', 'Personal', 'Viabilidad'], correcta: 1, explicacion: 'Es categoría Metodología: fundamento del diseño, muestra e instrumentos.' },
    ],
  },
  {
    slug: 'como-responder-bien',
    numero: 3,
    titulo: 'Cómo responder bien una pregunta',
    resumen: 'Escucha, estructura y sé honesto. Una buena respuesta es breve, directa y fundamentada.',
    duracionMin: 10,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Escucha antes de responder',
        parrafos: [
          'Deja que el tribunal termine la pregunta. Si no la entendiste, pide aclaración: es mejor que responder otra cosa. Tómate un segundo para ordenar la idea antes de hablar.',
          'Estructura simple: responde directo lo que te preguntaron, fundamenta con una razón o dato, y cierra. Evita irte por las ramas.',
        ],
      },
      {
        titulo: 'La honestidad suma',
        parrafos: [
          'Si no sabes algo, no inventes: reconócelo con elegancia ("no profundicé en ese punto, pero según X sería…"). Inventar y que te descubran es peor que admitir un límite.',
          'Nunca discutas agresivamente con el tribunal. Si tienes evidencia que respalda tu decisión, expónla con respeto; si tienen razón, agradécelo como aprendizaje.',
        ],
        ejemplo: {
          enunciado: 'No sabes un dato puntual.',
          desarrollo: 'Mal: inventar una cifra. Bien: "Ese dato exacto no lo tengo aquí, pero el orden de magnitud según la fuente X es… y puedo verificarlo."',
          resultado: 'Honestidad + dominio del contexto > inventar y arriesgarte a que te descubran.',
        },
      },
    ],
    quiz: [
      { pregunta: 'Si no entiendes una pregunta del tribunal, lo mejor es…', opciones: ['Responder cualquier cosa', 'Pedir que la aclaren', 'Quedarte callado', 'Cambiar de tema'], correcta: 1, explicacion: 'Pedir aclaración evita responder algo distinto a lo preguntado.' },
      { pregunta: 'Una buena estructura de respuesta es…', opciones: ['Larga y con rodeos', 'Directo + fundamento + cierre', 'Solo teoría general', 'Contraatacar al tribunal'], correcta: 1, explicacion: 'Responde lo preguntado, fundamenta con razón/dato y cierra, sin irte por las ramas.' },
      { pregunta: 'Si no sabes algo, conviene…', opciones: ['Inventar con seguridad', 'Reconocerlo con elegancia y dar el contexto que sí sabes', 'Negar la pregunta', 'Discutir'], correcta: 1, explicacion: 'Admitir un límite con dominio del contexto es mejor que inventar y que te descubran.' },
    ],
  },
  {
    slug: 'nervios-y-presencia',
    numero: 4,
    titulo: 'Nervios, presencia y simulacro',
    resumen: 'Los nervios se controlan con preparación y práctica. Un simulacro convierte el miedo en confianza.',
    duracionMin: 9,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'El cuerpo también comunica',
        parrafos: [
          'Postura erguida, contacto visual con el tribunal, manos visibles y voz pausada transmiten seguridad. Respira hondo antes de empezar; hablar más lento de lo que sientes suele sonar bien.',
          'Llega con lo técnico resuelto (diapositivas, tiempo, materiales) para que tu energía se enfoque en el contenido, no en imprevistos.',
        ],
      },
      {
        titulo: 'Practica con simulacro',
        parrafos: [
          'La mejor cura para los nervios es haber respondido las preguntas antes. En el laboratorio del módulo haces un simulacro: respondes tu banco y la IA evalúa cada respuesta con puntaje y feedback.',
          'Repite el simulacro hasta que las respuestas salgan naturales. El día de la defensa, será una conversación que ya tuviste muchas veces.',
        ],
      },
    ],
    quiz: [
      { pregunta: '¿Qué transmite seguridad en la defensa?', opciones: ['Hablar muy rápido', 'Postura erguida, contacto visual y voz pausada', 'Mirar al piso', 'Leer todo de la diapositiva'], correcta: 1, explicacion: 'El lenguaje corporal y una voz pausada proyectan confianza.' },
      { pregunta: 'La mejor cura para los nervios es…', opciones: ['No dormir', 'Haber practicado las respuestas antes (simulacro)', 'Improvisar', 'Memorizar todo literal'], correcta: 1, explicacion: 'Practicar con simulacro convierte el miedo en una conversación conocida.' },
      { pregunta: 'En el laboratorio, el simulacro…', opciones: ['Solo cronometra', 'Hace que la IA evalúe tus respuestas con puntaje y feedback', 'Genera el PDF', 'Cobra una tarifa'], correcta: 1, explicacion: 'Respondes tu banco y la IA actúa como tribunal: puntaje 0-10 + feedback.' },
    ],
  },
];

export const TOTAL_CLASES_DEFENSA = CLASES_DEFENSA.length;
export function getClaseDefensa(slug: string): ClaseDefensa | undefined {
  return CLASES_DEFENSA.find((c) => c.slug === slug);
}
