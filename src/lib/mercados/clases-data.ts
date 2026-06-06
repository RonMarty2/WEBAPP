/**
 * Contenido de la Academia del módulo Mercados.
 *
 * Cada clase: teoría con secciones, ejemplo aplicado a contexto boliviano,
 * ejercicio interactivo (autoevaluado) y quiz de 3 preguntas.
 *
 * Se construye por olas (regla: dividir para maximizar calidad):
 *   1A (este archivo, ahora): clases 1-5 — fundamentos
 *   1B (próximo): clases 6-9 — instrumentos
 *   1C (próximo): clases 10-13 — análisis
 */

export type Dificultad = 'inicial' | 'intermedia' | 'avanzada';

export interface SeccionTeoria {
  titulo: string;
  parrafos: string[];
  ejemplo?: { enunciado: string; desarrollo: string; resultado: string };
}

export interface EjercicioClase {
  enunciado: string;
  campos: Array<{ id: string; label: string; unidad: string; hint?: string }>;
  resolver: (inputs: Record<string, number>) => {
    correcto: boolean;
    valorCorrecto: number;
    explicacion: string;
  };
}

export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

export interface ClaseMercados {
  slug: string;
  numero: number;
  titulo: string;
  resumen: string;
  duracionMin: number;
  dificultad: Dificultad;
  secciones: SeccionTeoria[];
  ejercicio: EjercicioClase | null;
  quiz: PreguntaQuiz[];
}

export const CLASES_MERCADOS: ClaseMercados[] = [
  // ───────────────────────────────────────────────────────── CLASE 1
  {
    slug: 'que-es-investigacion-mercado',
    numero: 1,
    titulo: '¿Qué es una investigación de mercado y para qué sirve?',
    resumen:
      'Antes de invertir un peso, necesitas saber si hay gente dispuesta a comprar. La investigación de mercado reemplaza la corazonada con evidencia.',
    duracionMin: 14,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'La pregunta que arruina o salva un negocio',
        parrafos: [
          'Muchos emprendimientos en Bolivia fracasan no porque el producto sea malo, sino porque nadie verificó si había suficiente gente dispuesta a pagar por él. La investigación de mercado responde esa pregunta ANTES de invertir.',
          'Investigar un mercado es recolectar y analizar información sobre tus clientes potenciales, tus competidores y el entorno, para tomar decisiones con evidencia en lugar de corazonada.',
          'No es "preguntarle a unos amigos si les gusta tu idea". Es un proceso con método: defines qué quieres saber, a quién preguntar, cómo medir, y cómo interpretar los resultados sin engañarte a ti mismo.',
        ],
      },
      {
        titulo: 'Qué decisiones te ayuda a tomar',
        parrafos: [
          '¿Existe demanda suficiente? ¿A qué precio están dispuestos a pagar? ¿Qué características valoran más? ¿Quiénes son tus competidores y qué hacen mejor o peor? ¿En qué zona conviene ubicarte?',
          'Cada una de esas preguntas, respondida con datos, baja el riesgo de tu proyecto. Un banco o un inversor te toma en serio cuando muestras un estudio de mercado real, no cuando dices "estoy seguro de que se va a vender".',
        ],
        ejemplo: {
          enunciado:
            'Quieres abrir una cafetería de especialidad en la zona norte de Cochabamba.',
          desarrollo:
            'En vez de asumir que "a todos les gusta el café", investigas: cuánta gente vive en la zona, qué porcentaje consume café fuera de casa, cuánto pagan, qué cafeterías ya existen y qué les falta.',
          resultado:
            'Descubres que hay 3 cafeterías saturadas en horario de mañana pero ninguna abre de tarde-noche → ahí está tu oportunidad real, basada en datos.',
        },
      },
      {
        titulo: 'Investigación primaria vs secundaria',
        parrafos: [
          'Datos secundarios: ya existen, alguien los recolectó antes. Censos del INE, estudios publicados, datos abiertos del Estado. Son baratos y rápidos, pero generales.',
          'Datos primarios: los recolectas tú, a tu medida. Encuestas, entrevistas, observación. Cuestan más esfuerzo pero responden exactamente tu pregunta.',
          'Una buena investigación combina ambos: arrancas con datos secundarios para dimensionar el mercado, y profundizas con datos primarios para entender a tu cliente específico.',
        ],
      },
    ],
    ejercicio: null,
    quiz: [
      {
        pregunta: '¿Cuál es el principal valor de una investigación de mercado?',
        opciones: [
          'Confirmar que tu idea es buena',
          'Reemplazar la corazonada con evidencia para decidir con menos riesgo',
          'Conseguir que el banco te preste',
          'Hacer publicidad del producto',
        ],
        correcta: 1,
        explicacion:
          'El objetivo NO es confirmar lo que ya crees (ese es un sesgo peligroso), sino obtener evidencia objetiva para decidir mejor, incluso si la evidencia contradice tu idea inicial.',
      },
      {
        pregunta: 'Los datos del Censo del INE son un ejemplo de:',
        opciones: ['Datos primarios', 'Datos secundarios', 'Una encuesta', 'Observación directa'],
        correcta: 1,
        explicacion:
          'El censo ya fue recolectado por el INE; tú solo lo consultas. Eso lo hace un dato secundario: existente, barato, pero general.',
      },
      {
        pregunta: '¿Cuándo conviene recolectar datos primarios?',
        opciones: [
          'Siempre, son los únicos válidos',
          'Nunca, son muy caros',
          'Cuando necesitas responder una pregunta específica que los datos existentes no cubren',
          'Solo si tienes un presupuesto grande',
        ],
        correcta: 2,
        explicacion:
          'Los datos primarios responden tu pregunta exacta. Se justifican cuando los secundarios (más baratos) no alcanzan para lo que necesitas saber.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 2
  {
    slug: 'tipos-de-investigacion',
    numero: 2,
    titulo: 'Tres tipos de investigación: exploratoria, descriptiva y causal',
    resumen:
      'No toda investigación busca lo mismo. Elegir el tipo correcto define cómo diseñas todo lo demás.',
    duracionMin: 12,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Exploratoria: cuando no sabes ni qué preguntar',
        parrafos: [
          'Se usa al inicio, cuando el problema es difuso. Buscas entender, generar ideas, descubrir variables que ni sabías que existían.',
          'Métodos típicos: entrevistas en profundidad, focus groups, revisión de datos secundarios. Es cualitativa: pocas personas, mucha profundidad.',
          'Ejemplo: "No sé por qué mi cafetería no engancha con universitarios". Una exploración con entrevistas revela que el problema no es el café, es que no hay enchufes para laptops.',
        ],
      },
      {
        titulo: 'Descriptiva: medir y cuantificar',
        parrafos: [
          'Se usa cuando ya sabes qué medir y quieres números: cuántos, qué porcentaje, con qué frecuencia, a qué precio.',
          'Método estrella: la encuesta a una muestra representativa. Es cuantitativa: muchas personas, datos comparables.',
          'La mayoría de los estudios de mercado para proyectos de grado son DESCRIPTIVOS: miden demanda, perfil del consumidor, disposición a pagar.',
        ],
        ejemplo: {
          enunciado: 'Ya sabes que los universitarios valoran tener enchufes. Ahora quieres números.',
          desarrollo:
            'Encuestas a 384 universitarios de la zona: "¿Cuántas veces por semana estudias en una cafetería? ¿Cuánto gastas por visita? ¿Qué tan importante es el WiFi (1-5)?"',
          resultado:
            'Obtienes: 62% va 2+ veces/semana, gasto promedio Bs. 18, WiFi calificado 4.6/5. Números para decidir.',
        },
      },
      {
        titulo: 'Causal: probar causa y efecto',
        parrafos: [
          'La más exigente. Busca demostrar que A causa B. "Si bajo el precio 10%, ¿suben las ventas y cuánto?"',
          'Requiere experimentos controlados: cambias UNA variable y mides el efecto, manteniendo todo lo demás igual. Poco común en proyectos de grado por su complejidad.',
          'Regla práctica: la mayoría de proyectos de grado son descriptivos, a veces con una fase exploratoria inicial. Causal solo si tu tutor lo exige explícitamente.',
        ],
      },
    ],
    ejercicio: null,
    quiz: [
      {
        pregunta: 'Quieres descubrir POR QUÉ los clientes abandonan tu app. No tienes hipótesis. ¿Qué tipo usas?',
        opciones: ['Descriptiva', 'Causal', 'Exploratoria', 'Ninguna, solo mira las ventas'],
        correcta: 2,
        explicacion:
          'Cuando no tienes hipótesis y necesitas entender el "por qué", la exploratoria (entrevistas, focus) es el punto de partida para descubrir las variables relevantes.',
      },
      {
        pregunta: '¿Qué tipo de investigación es la más común en proyectos de grado?',
        opciones: ['Exploratoria', 'Descriptiva', 'Causal', 'Experimental'],
        correcta: 1,
        explicacion:
          'La descriptiva (encuestas a muestra representativa) domina los proyectos de grado: mide demanda, perfil y disposición a pagar con números defendibles.',
      },
      {
        pregunta: 'La investigación causal se distingue porque:',
        opciones: [
          'Usa muchas personas',
          'Busca demostrar relación causa-efecto con experimentos controlados',
          'Es siempre cualitativa',
          'No necesita método',
        ],
        correcta: 1,
        explicacion:
          'Lo propio de la causal es aislar una variable y medir su efecto en condiciones controladas, para probar que A realmente causa B.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 3
  {
    slug: 'universo-poblacion-muestra',
    numero: 3,
    titulo: 'Universo, población y muestra: a quién vas a estudiar',
    resumen:
      'No puedes encuestar a todo el mundo. Aprende a definir con precisión a quién representas con tu estudio.',
    duracionMin: 13,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Tres conceptos que se confunden todo el tiempo',
        parrafos: [
          'Universo (o población objetivo): TODAS las personas que cumplen tu criterio. Ej: "todos los universitarios de la zona norte de Cochabamba, 18-28 años".',
          'Marco muestral: la lista real desde la que puedes seleccionar. A veces es imposible tener la lista completa del universo, así que trabajas con una aproximación.',
          'Muestra: el subconjunto que efectivamente vas a estudiar. Bien elegida, representa al universo entero sin tener que encuestarlo completo.',
        ],
      },
      {
        titulo: 'Por qué una muestra basta',
        parrafos: [
          'Es contraintuitivo, pero NO necesitas preguntarle a las 50.000 personas de tu universo. Con una muestra de ~384 bien seleccionada puedes representar a millones con 95% de confianza.',
          'La clave no es el TAMAÑO absoluto sino la REPRESENTATIVIDAD: que la muestra se parezca al universo en lo que importa (edad, género, zona, nivel socioeconómico).',
          'Una muestra de 384 personas elegidas al azar es muchísimo mejor que 2.000 personas elegidas por conveniencia (solo tus conocidos). Cantidad no es calidad.',
        ],
        ejemplo: {
          enunciado: 'Universo: 50.000 universitarios. Quieres conocer su consumo de café.',
          desarrollo:
            'Encuestar a los 50.000 es imposible (tiempo, dinero). Tomas una muestra representativa de 384, seleccionada al azar cubriendo distintas universidades y carreras.',
          resultado:
            'Con esos 384 estimas el comportamiento de los 50.000 con 95% de confianza y ±5% de margen de error.',
        },
      },
      {
        titulo: 'El error más común: confundir tu muestra con tu universo',
        parrafos: [
          'Si encuestas solo a tus compañeros de carrera y concluyes sobre "todos los universitarios", cometiste un error grave de representatividad. Tus compañeros no representan a todos.',
          'Antes de recolectar, escribe con precisión tu universo. Cada decisión posterior (tamaño de muestra, tipo de muestreo) depende de tenerlo claro.',
        ],
      },
    ],
    ejercicio: null,
    quiz: [
      {
        pregunta: '"Todos los habitantes de El Alto entre 25 y 40 años" es un ejemplo de:',
        opciones: ['Muestra', 'Universo / población objetivo', 'Marco muestral', 'Margen de error'],
        correcta: 1,
        explicacion:
          'Es la definición del universo: TODAS las personas que cumplen el criterio del estudio.',
      },
      {
        pregunta: '¿Qué importa más en una muestra?',
        opciones: [
          'Que sea lo más grande posible',
          'Que sea representativa del universo',
          'Que sean personas conocidas para facilitar la encuesta',
          'Que responda rápido',
        ],
        correcta: 1,
        explicacion:
          'La representatividad manda. 384 personas al azar representan mejor que 2.000 por conveniencia. Cantidad no compensa el sesgo.',
      },
      {
        pregunta: 'Encuestar solo a tus amigos y concluir sobre toda la ciudad es un error de:',
        opciones: ['Tamaño de muestra', 'Representatividad', 'Margen de error', 'Confianza'],
        correcta: 1,
        explicacion:
          'Tus amigos no representan a la ciudad. Es un sesgo de representatividad (muestra por conveniencia), el error más común.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 4
  {
    slug: 'tipos-de-muestreo',
    numero: 4,
    titulo: 'Tipos de muestreo: cómo eliges a quién preguntar',
    resumen:
      'Probabilístico o no probabilístico. La forma de elegir tu muestra decide si tus resultados son defendibles ante un tribunal.',
    duracionMin: 16,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'La gran división: probabilístico vs no probabilístico',
        parrafos: [
          'Muestreo PROBABILÍSTICO: cada persona del universo tiene una probabilidad conocida de ser elegida (idealmente, la misma). Permite calcular margen de error y generalizar con rigor estadístico. Es el que tu tribunal espera.',
          'Muestreo NO PROBABILÍSTICO: eliges por criterio, conveniencia o disponibilidad. Más rápido y barato, pero NO permite generalizar con rigor. Útil en fase exploratoria.',
        ],
      },
      {
        titulo: 'Los 4 tipos probabilísticos',
        parrafos: [
          'Aleatorio simple: como un sorteo. Cada miembro tiene igual chance. Requiere lista completa del universo.',
          'Sistemático: eliges cada k-ésimo elemento de una lista (ej. cada 10 personas que entran al centro comercial).',
          'Estratificado: divides el universo en grupos homogéneos (estratos: por carrera, por zona) y muestreas dentro de cada uno proporcionalmente. El más usado en proyectos serios.',
          'Por conglomerados: divides en grupos geográficos (barrios), eliges algunos al azar y encuestas a todos dentro. Útil cuando el universo está disperso.',
        ],
        ejemplo: {
          enunciado: 'Universo: universitarios de 5 universidades con distinto número de alumnos.',
          desarrollo:
            'Muestreo estratificado: cada universidad es un estrato. Si la UMSS tiene el 40% de los universitarios, el 40% de tu muestra debe venir de la UMSS. Así ninguna universidad queda sobre o sub-representada.',
          resultado:
            'Muestra que refleja la composición real del universo → resultados defendibles.',
        },
      },
      {
        titulo: 'Los no probabilísticos (y cuándo se permiten)',
        parrafos: [
          'Por conveniencia: los que tienes a mano. El más débil. Solo para pruebas piloto.',
          'Por cuotas: llenas "cupos" por característica (50 hombres, 50 mujeres) pero eliges a dedo dentro de cada cupo.',
          'Bola de nieve: un encuestado te refiere a otros. Útil para poblaciones difíciles de encontrar (ej. dueños de un nicho específico).',
          'Regla para tu proyecto: usa probabilístico (idealmente estratificado) para la fase descriptiva. Si usas no probabilístico, decláralo y justifica por qué — el tribunal lo va a preguntar.',
        ],
      },
    ],
    ejercicio: null,
    quiz: [
      {
        pregunta: '¿Qué tipo de muestreo permite calcular margen de error y generalizar con rigor?',
        opciones: ['Por conveniencia', 'Probabilístico', 'Bola de nieve', 'Por cuotas'],
        correcta: 1,
        explicacion:
          'Solo el probabilístico (cada miembro con probabilidad conocida de ser elegido) permite calcular el margen de error y generalizar estadísticamente.',
      },
      {
        pregunta: 'Quieres que cada universidad esté representada según su peso real. ¿Qué muestreo usas?',
        opciones: ['Aleatorio simple', 'Estratificado', 'Por conveniencia', 'Bola de nieve'],
        correcta: 1,
        explicacion:
          'El estratificado divide el universo en grupos (universidades) y muestrea cada uno proporcionalmente a su tamaño real.',
      },
      {
        pregunta: 'El muestreo por conveniencia (solo los que tienes a mano) sirve principalmente para:',
        opciones: [
          'El estudio descriptivo final',
          'Generalizar a todo el universo',
          'Pruebas piloto o fase exploratoria',
          'Calcular el margen de error',
        ],
        correcta: 2,
        explicacion:
          'Por su sesgo, el conveniencia solo se justifica en pruebas piloto o exploración, nunca para conclusiones generalizables.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 5
  {
    slug: 'tamano-de-muestra',
    numero: 5,
    titulo: 'Cálculo del tamaño de muestra: el número mágico',
    resumen:
      'La fórmula que responde "¿a cuántas personas tengo que encuestar?". La vas a usar en tu propio proyecto.',
    duracionMin: 18,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Los ingredientes de la fórmula',
        parrafos: [
          'Nivel de confianza: qué tan seguro quieres estar. 95% es el estándar (valor Z = 1.96). Significa: si repitieras el estudio 100 veces, en 95 obtendrías un resultado dentro de tu margen de error.',
          'Margen de error (e): cuánto te permites equivocarte. ±5% es lo habitual. Más chico = muestra más grande.',
          'Probabilidad p y q: la variabilidad esperada. Si no la conoces, usas p = 0.5 (50%), que es el caso más conservador y exige la muestra más grande.',
          'Universo (N): el tamaño de tu población. Si es muy grande (>100.000) casi no cambia el resultado.',
        ],
      },
      {
        titulo: 'La fórmula para población finita',
        parrafos: [
          'n = (N · Z² · p · q) / (e² · (N−1) + Z² · p · q)',
          'Donde Z=1.96 (95%), p=q=0.5, e=0.05. Parece intimidante pero es solo sustituir y calcular.',
          'Dato clave: para universos grandes, el resultado converge a ~384 con 95% de confianza y ±5%. Por eso ves "384" en tantos estudios. No es magia, es esta fórmula.',
        ],
        ejemplo: {
          enunciado: 'Universo N = 50.000 universitarios. Confianza 95% (Z=1.96), p=q=0.5, error 5%.',
          desarrollo:
            'n = (50000 · 1.96² · 0.5 · 0.5) / (0.05² · (50000−1) + 1.96² · 0.5 · 0.5)\nn = (50000 · 3.8416 · 0.25) / (0.0025 · 49999 + 0.9604)\nn = 48020 / (124.9975 + 0.9604) = 48020 / 125.958',
          resultado: 'n ≈ 381 personas. Con esa muestra representas a los 50.000.',
        },
      },
      {
        titulo: 'Qué pasa si cambias los parámetros',
        parrafos: [
          'Quieres más precisión (error ±3% en vez de ±5%): la muestra sube fuerte (de ~384 a ~1.067). Más precisión cuesta más encuestas.',
          'Bajas la confianza a 90%: la muestra baja. Pero 95% es el estándar académico; no bajes sin justificar.',
          'En la próxima fase del módulo vas a tener una CALCULADORA que hace esto solo: pones tus parámetros y te da el número. Pero entender la fórmula te permite defenderla ante el tribunal.',
        ],
      },
    ],
    ejercicio: {
      enunciado:
        'Calcula el tamaño de muestra para un universo de 8.000 personas, con 95% de confianza (Z=1.96), p=q=0.5 y margen de error del 5% (0.05). Redondea al entero superior.',
      campos: [{ id: 'n', label: 'Tamaño de muestra (n)', unidad: 'personas' }],
      resolver: (inputs) => {
        const N = 8000;
        const Z = 1.96;
        const p = 0.5;
        const q = 0.5;
        const e = 0.05;
        const numerador = N * Z * Z * p * q;
        const denominador = e * e * (N - 1) + Z * Z * p * q;
        const nReal = Math.ceil(numerador / denominador);
        const valor = inputs.n ?? 0;
        const correcto = Math.abs(valor - nReal) <= 3;
        return {
          correcto,
          valorCorrecto: nReal,
          explicacion: correcto
            ? `Correcto. n ≈ ${nReal}. Con esa muestra representas a las 8.000 personas con 95% de confianza.`
            : `El resultado es n ≈ ${nReal}. Fórmula: (8000·1.96²·0.5·0.5) / (0.05²·7999 + 1.96²·0.5·0.5) = 7683.2 / 20.92 ≈ ${nReal}.`,
        };
      },
    },
    quiz: [
      {
        pregunta: '¿Qué valor de Z corresponde a un nivel de confianza del 95%?',
        opciones: ['1.64', '1.96', '2.58', '0.95'],
        correcta: 1,
        explicacion: 'Z = 1.96 para 95% de confianza. (1.64 es 90%, 2.58 es 99%).',
      },
      {
        pregunta: 'Si reduces el margen de error de ±5% a ±3%, el tamaño de muestra:',
        opciones: ['Baja', 'Sube', 'No cambia', 'Se vuelve cero'],
        correcta: 1,
        explicacion:
          'Más precisión (menor error) exige más encuestas. La muestra sube fuerte: de ~384 a ~1.067 para universos grandes.',
      },
      {
        pregunta: '¿Por qué se usa p = 0.5 cuando no conoces la variabilidad?',
        opciones: [
          'Porque es fácil de recordar',
          'Porque es el caso más conservador: da la muestra más grande y segura',
          'Porque siempre es la respuesta correcta',
          'Porque reduce el tamaño de muestra',
        ],
        correcta: 1,
        explicacion:
          'p=0.5 maximiza el producto p·q, lo que da el mayor tamaño de muestra. Es el supuesto conservador: si no sabes, asume el peor caso.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 6
  {
    slug: 'diseno-de-instrumentos',
    numero: 6,
    titulo: 'Diseño de instrumentos: encuesta, entrevista, focus, observación',
    resumen:
      'Cada pregunta de tu estudio necesita la herramienta correcta para responderse. Elige mal y los datos no sirven.',
    duracionMin: 15,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Cuatro instrumentos, cuatro propósitos',
        parrafos: [
          'Encuesta: muchas personas, preguntas cerradas, datos cuantificables. Responde "cuántos / qué porcentaje". Es el instrumento estrella del estudio descriptivo.',
          'Entrevista en profundidad: pocas personas, preguntas abiertas, mucho detalle. Responde "por qué / cómo". Ideal en la fase exploratoria.',
          'Focus group: 6-10 personas discutiendo guiadas por un moderador. Saca a la luz percepciones, reacciones a un producto, lenguaje del cliente.',
          'Observación: mirar el comportamiento real sin preguntar. "¿Cuántos entran y cuántos compran?" La gente dice una cosa y hace otra; la observación captura lo que realmente hacen.',
        ],
      },
      {
        titulo: 'El error de usar el instrumento equivocado',
        parrafos: [
          'Si quieres saber "qué porcentaje de la zona consumiría tu producto", una entrevista a 8 personas NO te lo dice (muy pocas). Necesitas encuesta.',
          'Si quieres entender "por qué la gente no vuelve a tu local", una encuesta de opción múltiple te da opciones que TÚ inventaste; quizás la razón real no está en tu lista. Ahí una entrevista o focus descubre lo que no sabías preguntar.',
          'Regla: cuantitativo (números, generalizar) → encuesta/observación. Cualitativo (entender, profundizar) → entrevista/focus.',
        ],
        ejemplo: {
          enunciado: 'Proyecto: gimnasio boutique en Santa Cruz.',
          desarrollo:
            'Fase 1 (exploratoria): 6 entrevistas a personas que dejaron su gimnasio → descubres que el motivo #1 es "horarios saturados", algo que no habías considerado. Fase 2 (descriptiva): encuesta a 384 personas midiendo cuántas valoran horarios flexibles y cuánto pagarían.',
          resultado:
            'La entrevista reveló la variable; la encuesta la cuantificó. Los dos instrumentos se complementan.',
        },
      },
      {
        titulo: 'Reglas de oro al redactar preguntas',
        parrafos: [
          'Una idea por pregunta. "¿Te gusta el precio y la calidad?" es dos preguntas disfrazadas de una (pregunta doble). Sepáralas.',
          'Sin inducir la respuesta. "¿No crees que nuestro excelente café merece tu visita?" empuja al sí. Neutral: "¿Con qué frecuencia consumes café fuera de casa?".',
          'Lenguaje del encuestado, no técnico. Evita jerga. Si tu cliente no diría "disposición a pagar", pregunta "¿cuánto pagarías por...?".',
          'Ordena de lo general a lo específico, y deja lo sensible (ingresos, edad) para el final.',
        ],
      },
    ],
    ejercicio: null,
    quiz: [
      {
        pregunta: 'Quieres el porcentaje de la población que compraría tu producto. ¿Qué instrumento?',
        opciones: ['Entrevista en profundidad', 'Encuesta', 'Focus group', 'Observación de 5 personas'],
        correcta: 1,
        explicacion:
          'Para cuantificar y generalizar (porcentajes) necesitas la encuesta a una muestra representativa. Los demás son cualitativos o de muy pocas personas.',
      },
      {
        pregunta: '"¿Te gusta nuestro precio y nuestra calidad?" es un ejemplo de:',
        opciones: ['Pregunta neutral', 'Pregunta doble (dos ideas en una)', 'Pregunta abierta', 'Buena práctica'],
        correcta: 1,
        explicacion:
          'Mezcla dos ideas (precio Y calidad). Si alguien responde "no", no sabes a cuál se refiere. Una idea por pregunta.',
      },
      {
        pregunta: 'La observación directa es valiosa porque:',
        opciones: [
          'Es la más barata siempre',
          'Captura lo que la gente realmente hace, no lo que dice que hace',
          'Permite entrevistar a más personas',
          'No requiere análisis',
        ],
        correcta: 1,
        explicacion:
          'La gente a veces dice una cosa y hace otra. La observación registra el comportamiento real, sin el sesgo de la respuesta declarada.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 7
  {
    slug: 'escalas-de-medicion',
    numero: 7,
    titulo: 'Escalas de medición: cómo conviertes opiniones en datos',
    resumen:
      'Nominal, ordinal, Likert, diferencial semántico. La escala que eliges decide qué análisis podrás hacer después.',
    duracionMin: 14,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Los cuatro niveles de medición',
        parrafos: [
          'Nominal: categorías sin orden. Género, ciudad, marca preferida. Solo puedes contar frecuencias ("40% prefiere la marca A").',
          'Ordinal: categorías CON orden, pero sin distancia medible. Nivel educativo (primaria < secundaria < universidad). Sabes el orden, no "cuánto más".',
          'De intervalo: orden y distancias iguales, sin cero absoluto. Temperatura. Raro en encuestas de mercado.',
          'De razón: orden, distancia y cero absoluto real. Edad, ingreso, cantidad comprada. Permite todos los cálculos (promedio, etc.).',
        ],
      },
      {
        titulo: 'La escala Likert: la reina de los estudios de mercado',
        parrafos: [
          'Mide grado de acuerdo o intensidad en una escala simétrica, típicamente de 5 puntos: Totalmente en desacuerdo (1) → Totalmente de acuerdo (5).',
          'Ejemplo: "El precio me parece justo" → 1 a 5. Permite calcular promedios y comparar ítems ("el WiFi 4.6 vs el precio 3.2").',
          'Buenas prácticas: usa 5 o 7 puntos (impar, para tener punto neutro), etiqueta TODOS los puntos, y mantén la misma dirección en todas (no mezcles donde a veces 5 es bueno y a veces malo).',
        ],
        ejemplo: {
          enunciado: 'Quieres medir qué tan importante es cada atributo de una cafetería.',
          desarrollo:
            'Para cada atributo (WiFi, precio, ubicación, sabor) preguntas: "Qué tan importante es para ti — 1 nada importante a 5 muy importante". Promedias cada uno.',
          resultado:
            'WiFi 4.6, sabor 4.4, ubicación 3.9, precio 3.2 → sabes priorizar tu inversión en lo que el cliente más valora.',
        },
      },
      {
        titulo: 'Por qué la escala define tu análisis',
        parrafos: [
          'Con datos nominales solo cuentas y sacas porcentajes/modas. No tiene sentido un "promedio de ciudad".',
          'Con ordinales sacas medianas y porcentajes, pero el promedio es discutible.',
          'Con Likert (tratada como intervalo, práctica aceptada) y razón sacas promedios, desviaciones, correlaciones.',
          'Moraleja: piensa el análisis ANTES de elegir la escala. Si necesitas promediar, no uses categorías nominales.',
        ],
      },
    ],
    ejercicio: null,
    quiz: [
      {
        pregunta: '"Ciudad de residencia" (La Paz, Santa Cruz, Cochabamba) es una variable:',
        opciones: ['Nominal', 'Ordinal', 'De intervalo', 'De razón'],
        correcta: 0,
        explicacion:
          'Son categorías sin orden inherente. Es nominal: solo puedes contar frecuencias, no promediar.',
      },
      {
        pregunta: '¿Por qué la escala Likert suele tener un número impar de puntos (5 o 7)?',
        opciones: [
          'Por estética',
          'Para tener un punto neutro central',
          'Porque es obligatorio',
          'Para confundir al encuestado',
        ],
        correcta: 1,
        explicacion:
          'Un número impar deja un punto medio neutro (ni de acuerdo ni en desacuerdo), evitando forzar al encuestado hacia un lado.',
      },
      {
        pregunta: 'Si quieres calcular el promedio de importancia de un atributo, NO debes usar una escala:',
        opciones: ['Likert de 5 puntos', 'De razón', 'Nominal', 'De intervalo'],
        correcta: 2,
        explicacion:
          'En una escala nominal (categorías sin orden) el promedio no tiene sentido. Para promediar necesitas Likert, intervalo o razón.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 8
  {
    slug: 'trabajo-de-campo',
    numero: 8,
    titulo: 'Trabajo de campo: recolectar sin arruinar tus datos',
    resumen:
      'La mejor encuesta diseñada se arruina en el campo si la aplicas mal. Errores comunes y cómo evitarlos.',
    duracionMin: 13,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Presencial, telefónica u online: ventajas y trampas',
        parrafos: [
          'Online (formulario + link/QR): barata, rápida, llega lejos. Riesgo: sesgo de auto-selección (responden los más interesados) y de cobertura (quien no usa internet queda fuera).',
          'Presencial: mayor control, puedes aclarar dudas, mejor para zonas sin internet. Riesgo: costo, tiempo, y el sesgo del encuestador (tu presencia influye la respuesta).',
          'Telefónica: rápida y con cobertura amplia, pero respuestas más cortas y tasa de rechazo alta.',
          'Para proyectos de grado, lo común hoy es online con link/QR, complementado con algunas presenciales para cubrir sesgos. (En la herramienta del módulo vas a generar tu link/QR.)',
        ],
      },
      {
        titulo: 'Los sesgos que matan un estudio',
        parrafos: [
          'Sesgo de selección: tu muestra no representa al universo (encuestaste solo a quien tenías cerca). Es el más grave y el más común.',
          'Sesgo del encuestador: tu tono, gestos o forma de preguntar empujan respuestas. Se controla con un guion estandarizado.',
          'Sesgo de deseabilidad social: la gente responde lo que "queda bien", no lo que hace. Especialmente en temas sensibles (higiene, ingresos, hábitos).',
          'No-respuesta: los que no contestan pueden ser sistemáticamente distintos de los que sí. Si el 70% no responde, tu 30% quizás no representa a nadie.',
        ],
        ejemplo: {
          enunciado: 'Encuestas sobre consumo de comida saludable solo a la salida de un gimnasio.',
          desarrollo:
            'La gente que sale del gimnasio NO representa a la población general: ya está sesgada hacia lo saludable. Además, dirán que comen más sano de lo que comen (deseabilidad social).',
          resultado:
            'Doble sesgo (selección + deseabilidad). Conclusión inflada e inservible. Solución: muestrear en lugares variados y preguntar de forma indirecta.',
        },
      },
      {
        titulo: 'Prueba piloto: el paso que casi todos saltan',
        parrafos: [
          'Antes de lanzar la encuesta real, aplícala a 10-15 personas. Vas a descubrir preguntas que se malinterpretan, opciones que faltan, y cuánto tarda en responderse.',
          'Corregir después de recolectar 384 respuestas es imposible; corregir tras un piloto de 12 es trivial. El piloto te ahorra el desastre.',
        ],
      },
    ],
    ejercicio: null,
    quiz: [
      {
        pregunta: 'Encuestar solo a quien tienes cerca y que esto no represente al universo es:',
        opciones: ['Sesgo de selección', 'Sesgo del encuestador', 'Deseabilidad social', 'No-respuesta'],
        correcta: 0,
        explicacion:
          'El sesgo de selección (muestra no representativa) es el error más grave y común del trabajo de campo.',
      },
      {
        pregunta: 'La gente responde "lo que queda bien" en temas sensibles. Eso es:',
        opciones: ['Sesgo de selección', 'Deseabilidad social', 'Sesgo de cobertura', 'Buen dato'],
        correcta: 1,
        explicacion:
          'El sesgo de deseabilidad social: el encuestado da la respuesta socialmente aceptable, no la real. Se mitiga con anonimato y preguntas indirectas.',
      },
      {
        pregunta: '¿Para qué sirve la prueba piloto?',
        opciones: [
          'Para completar la muestra final',
          'Para detectar preguntas confusas y errores antes del lanzamiento real',
          'Para reemplazar el análisis',
          'Para inflar el número de respuestas',
        ],
        correcta: 1,
        explicacion:
          'El piloto (10-15 personas) revela preguntas mal entendidas y opciones faltantes cuando corregir aún es barato, antes de recolectar la muestra completa.',
      },
    ],
  },

  // ───────────────────────────────────────────────────────── CLASE 9
  {
    slug: 'tabulacion-y-codificacion',
    numero: 9,
    titulo: 'Tabulación y codificación: de respuestas crudas a datos ordenados',
    resumen:
      'Antes de analizar, tus respuestas necesitan orden. Codificar y tabular bien evita conclusiones falsas.',
    duracionMin: 14,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Codificar: traducir respuestas a números manejables',
        parrafos: [
          'Codificar es asignar un código a cada respuesta para procesarla. "Femenino" → 1, "Masculino" → 2. "Totalmente de acuerdo" → 5.',
          'Las preguntas cerradas se codifican solas. Las abiertas requieren un paso extra: lees las respuestas, identificas categorías recurrentes y las agrupas (post-codificación).',
          'Regla: define el libro de códigos ANTES de recolectar (para cerradas). Para abiertas, créalo después leyendo una muestra de respuestas.',
        ],
      },
      {
        titulo: 'Tabular: contar de forma organizada',
        parrafos: [
          'Tabulación simple (univariada): cuentas cuántos respondieron cada opción de UNA pregunta. "120 de 384 prefieren delivery = 31%".',
          'Tabulación cruzada (bivariada): cruzas DOS preguntas. "De los que prefieren delivery, ¿qué edad tienen?". Aquí aparecen los hallazgos jugosos.',
          'La herramienta del módulo va a tabular automáticamente tus respuestas. Pero entender qué hace te permite interpretar y defender los resultados.',
        ],
        ejemplo: {
          enunciado: '384 respuestas sobre forma de consumo preferida.',
          desarrollo:
            'Tabulación simple: En local 198 (52%), Delivery 120 (31%), Para llevar 66 (17%). Cruzada con edad: el delivery lo prefieren sobre todo los de 18-24 (68% de ese grupo).',
          resultado:
            'El dato simple dice "hay demanda de delivery"; el cruzado dice "el delivery es clave para captar jóvenes" → decisión más fina.',
        },
      },
      {
        titulo: 'Limpieza: basura entra, basura sale',
        parrafos: [
          'Antes de tabular, limpia: respuestas incompletas, contradictorias (dice que no consume café pero responde cuánto gasta en café), o claramente apuradas (todo "3" en Likert).',
          'Documenta cuántas respuestas descartaste y por qué. El tribunal valora la transparencia: "de 400 recolectadas, 384 válidas tras eliminar 16 incompletas".',
          'Nunca inventes ni "ajustes" datos para que cuadren con tu hipótesis. Eso invalida todo el estudio y es éticamente grave.',
        ],
      },
    ],
    ejercicio: {
      enunciado:
        'De 420 encuestas recolectadas, descartas 36 por estar incompletas. ¿Qué porcentaje de respuestas válidas tienes sobre el total recolectado? (redondea a entero)',
      campos: [{ id: 'pct', label: 'Porcentaje de respuestas válidas', unidad: '%' }],
      resolver: (inputs) => {
        const validas = 420 - 36;
        const pctReal = Math.round((validas / 420) * 100);
        const valor = inputs.pct ?? 0;
        const correcto = Math.abs(valor - pctReal) <= 1;
        return {
          correcto,
          valorCorrecto: pctReal,
          explicacion: correcto
            ? `Correcto. (420−36)/420 = 384/420 ≈ ${pctReal}% válidas. Una tasa sana; documenta el descarte en tu metodología.`
            : `(420−36)/420 = 384/420 = ${pctReal}%. Recuerda documentar cuántas descartaste y por qué.`,
        };
      },
    },
    quiz: [
      {
        pregunta: 'Asignar "Femenino → 1, Masculino → 2" para poder procesar es:',
        opciones: ['Tabular', 'Codificar', 'Limpiar', 'Muestrear'],
        correcta: 1,
        explicacion:
          'Codificar es asignar códigos (números) a las respuestas para poder procesarlas estadísticamente.',
      },
      {
        pregunta: 'Cruzar "forma de consumo" con "edad" para hallar patrones es una tabulación:',
        opciones: ['Simple / univariada', 'Cruzada / bivariada', 'Nominal', 'Piloto'],
        correcta: 1,
        explicacion:
          'Cruzar dos variables es tabulación cruzada (bivariada). Ahí suelen aparecer los hallazgos más útiles.',
      },
      {
        pregunta: '¿Qué debes hacer con respuestas incompletas o contradictorias?',
        opciones: [
          'Inventar los datos faltantes',
          'Ajustarlas para que apoyen tu hipótesis',
          'Limpiarlas/descartarlas y documentar cuántas y por qué',
          'Ignorar el problema',
        ],
        correcta: 2,
        explicacion:
          'Se limpian o descartan documentando el proceso con transparencia. Inventar o ajustar datos invalida el estudio y es éticamente grave.',
      },
    ],
  },
];

export function getClaseMercados(slug: string): ClaseMercados | undefined {
  return CLASES_MERCADOS.find((c) => c.slug === slug);
}

/** Total de clases planeadas en la academia completa (13). Disponibles: 9 (olas 1A+1B). */
export const TOTAL_CLASES_PLANEADAS = 13;
