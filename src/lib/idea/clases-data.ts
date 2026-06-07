/**
 * Contenido de la Academia del módulo Idea / Pre-validación.
 * Teoría (secciones + ejemplo boliviano) + quiz de 3 por clase.
 */

export type Dificultad = 'inicial' | 'intermedia' | 'avanzada';
export interface SeccionTeoria { titulo: string; parrafos: string[]; ejemplo?: { enunciado: string; desarrollo: string; resultado: string } }
export interface PreguntaQuiz { pregunta: string; opciones: string[]; correcta: number; explicacion: string }
export interface ClaseIdea { slug: string; numero: number; titulo: string; resumen: string; duracionMin: number; dificultad: Dificultad; secciones: SeccionTeoria[]; quiz: PreguntaQuiz[] }

export const CLASES_IDEA: ClaseIdea[] = [
  {
    slug: 'por-que-validar',
    numero: 1,
    titulo: 'Por qué validar antes de construir',
    resumen: 'Construir algo que nadie quiere es el error más caro. Validar es probar tus supuestos con poca plata antes de apostar fuerte.',
    duracionMin: 9,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'El error más caro',
        parrafos: [
          'La mayoría de emprendimientos no fracasan por mala ejecución, sino por construir algo que el mercado no quería. Se enamoran de la solución antes de confirmar el problema.',
          'Validar es lo contrario: antes de invertir tiempo y dinero, pruebas tus supuestos más riesgosos con experimentos baratos. Si te vas a equivocar, que sea barato y rápido.',
        ],
      },
      {
        titulo: 'Deseable, factible, viable',
        parrafos: [
          'Una idea sólida cumple tres condiciones: deseable (la gente la quiere), factible (puedes construirla) y viable (es rentable y sostenible). Si falla una, hay que repensar.',
          'La pre-validación se enfoca primero en la deseabilidad: el error más común es asumir que a la gente le importa tu problema tanto como a ti.',
        ],
        ejemplo: {
          enunciado: 'App de delivery de almuerzos caseros.',
          desarrollo: 'Antes de programar la app: 15 entrevistas a oficinistas. 11 dicen que el almuerzo es un dolor diario y pagarían por una solución puntual.',
          resultado: 'Señal de deseabilidad real → vale la pena seguir validando, sin haber gastado en la app.',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Por qué fracasan la mayoría de emprendimientos?', opciones: ['Mala suerte', 'Construyen algo que nadie quería', 'Pocos impuestos', 'Demasiada validación'], correcta: 1, explicacion: 'El error más caro es construir sin confirmar que el problema y la demanda existen.' },
      { pregunta: '¿Cuáles son las 3 condiciones de una idea sólida?', opciones: ['Barata, rápida, bonita', 'Deseable, factible, viable', 'Legal, grande, digital', 'Local, nacional, global'], correcta: 1, explicacion: 'Deseable (la quieren), factible (puedes hacerla) y viable (es rentable).' },
      { pregunta: 'La pre-validación se enfoca PRIMERO en…', opciones: ['La factibilidad técnica', 'La deseabilidad', 'El logo', 'Los impuestos'], correcta: 1, explicacion: 'Primero confirma que a la gente le importa el problema; lo demás viene después.' },
    ],
  },
  {
    slug: 'lean-canvas',
    numero: 2,
    titulo: 'Lean Canvas: tu modelo en una hoja',
    resumen: 'Nueve bloques que resumen tu negocio. Empieza por el problema y los clientes: si esos fallan, lo demás no importa.',
    duracionMin: 11,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Los 9 bloques',
        parrafos: [
          'El Lean Canvas resume el modelo en una hoja: problema, segmentos de clientes, propuesta única de valor, solución, canales, fuentes de ingreso, estructura de costos, métricas clave y ventaja injusta.',
          'No es un plan de negocios de 80 páginas: es una herramienta viva para pensar y ajustar rápido.',
        ],
      },
      {
        titulo: 'El orden importa',
        parrafos: [
          'Llénalo empezando por problema y segmentos de clientes. Son lo más riesgoso: si no hay un problema real para un cliente concreto, el resto del canvas se cae.',
          'La "ventaja injusta" es lo difícil de copiar (una receta, una red, un conocimiento). Es normal no tenerla clara al inicio; se construye.',
        ],
        ejemplo: {
          enunciado: 'Lean Canvas de almuerzos caseros (parcial).',
          desarrollo: 'Problema: no hay almuerzo sano y puntual cerca de oficinas. Segmento: oficinistas 25-40 del centro. PUV: almuerzo casero en tu escritorio, sin filas.',
          resultado: 'Con problema y cliente claros, el resto del canvas se construye con sentido.',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Por qué bloque conviene empezar el Lean Canvas?', opciones: ['Estructura de costos', 'Problema y segmentos de clientes', 'Ventaja injusta', 'Canales'], correcta: 1, explicacion: 'Problema y cliente son lo más riesgoso; si fallan, el resto no importa.' },
      { pregunta: 'La "ventaja injusta" es…', opciones: ['Algo ilegal', 'Lo difícil de copiar por la competencia', 'Un descuento', 'El precio más bajo'], correcta: 1, explicacion: 'Es aquello que te protege y es difícil de imitar (receta, red, know-how).' },
      { pregunta: 'El Lean Canvas es…', opciones: ['Un plan de 80 páginas', 'Una herramienta viva en una hoja', 'Un contrato', 'Un estado financiero'], correcta: 1, explicacion: 'Resume el modelo en una hoja para pensar y ajustar rápido.' },
    ],
  },
  {
    slug: 'propuesta-de-valor',
    numero: 3,
    titulo: 'Propuesta de valor: el encaje',
    resumen: 'Hay encaje cuando lo que ofreces alivia dolores reales y crea alegrías que el cliente de verdad busca.',
    duracionMin: 10,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Cliente: trabajos, dolores, alegrías',
        parrafos: [
          'El perfil del cliente tiene tres partes: los trabajos que intenta lograr, los dolores (frustraciones, obstáculos) y las alegrías (beneficios que desea).',
          'Observa de verdad: muchos fundadores inventan dolores que no existen o ignoran los que sí. Hablar con clientes reales es insustituible.',
        ],
      },
      {
        titulo: 'Mapa de valor y encaje',
        parrafos: [
          'Tu oferta tiene productos/servicios, aliviadores de dolores y creadores de alegrías. El ENCAJE ocurre cuando tus aliviadores atacan los dolores más importantes y tus creadores generan las alegrías más buscadas.',
          'No intentes aliviar todos los dolores: enfócate en los pocos que más importan al cliente. Ahí está tu propuesta de valor.',
        ],
      },
    ],
    quiz: [
      { pregunta: 'El perfil del cliente incluye…', opciones: ['Trabajos, dolores y alegrías', 'Precio, plaza y promoción', 'VAN, TIR y B/C', 'NIT, RUC y AFP'], correcta: 0, explicacion: 'Trabajos (qué intenta lograr), dolores (frustraciones) y alegrías (beneficios deseados).' },
      { pregunta: 'Hay "encaje" cuando…', opciones: ['Tienes muchos productos', 'Tus aliviadores atacan los dolores que más importan', 'El precio es el más bajo', 'Usas todas las redes'], correcta: 1, explicacion: 'El encaje es que tu oferta resuelva los dolores y alegrías reales y prioritarios.' },
      { pregunta: '¿Conviene aliviar TODOS los dolores del cliente?', opciones: ['Sí, todos', 'No, enfócate en los que más importan', 'Solo los baratos', 'Ninguno'], correcta: 1, explicacion: 'Enfócate en los pocos dolores prioritarios; querer todo diluye la propuesta.' },
    ],
  },
  {
    slug: 'validacion-hipotesis',
    numero: 4,
    titulo: 'Validación: hipótesis y experimentos',
    resumen: 'Convierte tus supuestos en hipótesis que puedas probar con un criterio de éxito claro y barato.',
    duracionMin: 12,
    dificultad: 'avanzada',
    secciones: [
      {
        titulo: 'De supuesto a hipótesis',
        parrafos: [
          'Un supuesto es algo que crees cierto sin haberlo probado ("la gente pagaría Bs 25"). Una hipótesis lo vuelve comprobable: define cómo probarlo y qué resultado confirmaría o refutaría.',
          'Prioriza los supuestos MÁS RIESGOSOS: aquellos que, de ser falsos, hunden la idea. No pierdas tiempo validando lo obvio.',
        ],
      },
      {
        titulo: 'Experimentos baratos',
        parrafos: [
          'No necesitas construir el producto para validar. Entrevistas, una página de aterrizaje con un botón de "comprar", una pre-venta o una seña son experimentos rápidos y reveladores.',
          'Define el criterio de éxito ANTES (ej. "5 de 10 dejan seña"). Si no, interpretarás los resultados a tu favor. Validar es buscar la verdad, no confirmar tu ilusión.',
        ],
        ejemplo: {
          enunciado: 'Hipótesis de pago.',
          desarrollo: 'Supuesto: pagarían por el almuerzo a Bs 25. Experimento: pre-venta de 20 almuerzos por transferencia. Criterio: vender 10 en 3 días.',
          resultado: 'Se vendieron 14 → hipótesis validada con dinero real, no con "me gusta la idea".',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Qué diferencia un supuesto de una hipótesis?', opciones: ['Nada', 'La hipótesis es comprobable, con criterio de éxito', 'El supuesto es más caro', 'La hipótesis es opcional'], correcta: 1, explicacion: 'La hipótesis define cómo probar el supuesto y qué resultado lo confirma o refuta.' },
      { pregunta: '¿Qué supuestos priorizar?', opciones: ['Los obvios', 'Los más riesgosos', 'Los más baratos', 'Todos por igual'], correcta: 1, explicacion: 'Los que, de ser falsos, hunden la idea: ahí está el mayor aprendizaje.' },
      { pregunta: '¿Por qué definir el criterio de éxito ANTES del experimento?', opciones: ['Para que se vea técnico', 'Para no interpretar los resultados a tu favor', 'Es opcional', 'Para subir el precio'], correcta: 1, explicacion: 'Evita el autoengaño: sin criterio previo, leerás los datos como quieras.' },
    ],
  },
  {
    slug: 'scorecard-decision',
    numero: 5,
    titulo: 'Decidir: ¿avanzar, pivotear o parar?',
    resumen: 'Reúne lo aprendido y puntúa deseabilidad, factibilidad y viabilidad. La decisión honesta ahorra años.',
    duracionMin: 9,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'El scorecard',
        parrafos: [
          'Después de validar, puntúa tu idea (1-5) en deseabilidad, factibilidad y viabilidad. El promedio te da una señal: idea sólida, prometedora con riesgos, o necesita más trabajo.',
          'No es un número mágico: es una conversación honesta contigo mismo basada en lo que aprendiste, no en tu entusiasmo.',
        ],
      },
      {
        titulo: 'Avanzar, pivotear o parar',
        parrafos: [
          'Tres caminos: avanzar (las señales son buenas, construye un piloto), pivotear (algo no funciona, cambia el segmento, el problema o la solución) o parar (las hipótesis clave se refutaron; mejor liberar recursos).',
          'Pivotear o parar a tiempo NO es fracasar: es aprendizaje barato. El verdadero fracaso es invertir años en una idea que las señales decían que no funcionaría.',
        ],
      },
    ],
    quiz: [
      { pregunta: 'El scorecard puntúa…', opciones: ['Precio, plaza, promoción', 'Deseabilidad, factibilidad, viabilidad', 'VAN, TIR, B/C', 'Likes, shares, views'], correcta: 1, explicacion: 'Las tres dimensiones de una idea sólida, según lo aprendido al validar.' },
      { pregunta: 'Pivotear significa…', opciones: ['Rendirse', 'Cambiar algo clave (segmento, problema o solución)', 'Subir el precio', 'Contratar gente'], correcta: 1, explicacion: 'Es ajustar el rumbo conservando el aprendizaje, no abandonar.' },
      { pregunta: 'Parar a tiempo una idea que no valida es…', opciones: ['Un fracaso total', 'Aprendizaje barato', 'Ilegal', 'Mala suerte'], correcta: 1, explicacion: 'Liberar recursos a tiempo evita perder años; es una decisión inteligente.' },
    ],
  },
];

export const TOTAL_CLASES_IDEA = CLASES_IDEA.length;
export function getClaseIdea(slug: string): ClaseIdea | undefined {
  return CLASES_IDEA.find((c) => c.slug === slug);
}
