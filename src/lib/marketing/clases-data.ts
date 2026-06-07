/**
 * Contenido de la Academia del módulo Marketing.
 * Cada clase: teoría (secciones + ejemplo boliviano) + quiz de 3 preguntas.
 * Las herramientas se practican en el laboratorio (/marketing/planes).
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

export interface ClaseMarketing {
  slug: string;
  numero: number;
  titulo: string;
  resumen: string;
  duracionMin: number;
  dificultad: Dificultad;
  secciones: SeccionTeoria[];
  quiz: PreguntaQuiz[];
}

export const CLASES_MARKETING: ClaseMarketing[] = [
  {
    slug: 'que-es-marketing',
    numero: 1,
    titulo: 'Marketing no es solo publicidad',
    resumen:
      'El marketing empieza mucho antes del anuncio: es entender a quién sirves, qué necesita y cómo entregarle valor de forma rentable.',
    duracionMin: 10,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'El error de confundir marketing con anuncios',
        parrafos: [
          'Muchos emprendedores creen que "hacer marketing" es pagar publicidad en Facebook. Eso es solo una parte (la promoción). El marketing es todo el proceso de crear, comunicar y entregar valor a un cliente que sí lo quiere.',
          'Si el producto no resuelve un problema real, ninguna cantidad de anuncios lo salva. Por eso el marketing empieza por entender al cliente, no por el anuncio.',
        ],
      },
      {
        titulo: 'Valor: lo que el cliente recibe vs. lo que paga',
        parrafos: [
          'Un cliente compra cuando percibe que el valor recibido supera lo que paga (en dinero, tiempo y esfuerzo). Tu trabajo de marketing es aumentar ese valor percibido y comunicarlo con claridad.',
          'El valor no es solo el producto: incluye la experiencia, la confianza, la cercanía y la marca. En Bolivia, la recomendación de boca a boca pesa muchísimo: una buena experiencia se cuenta.',
        ],
        ejemplo: {
          enunciado: 'Dos pollerías con el mismo precio.',
          desarrollo: 'A: solo vende pollo. B: vende pollo + entrega puntual + empaque que mantiene caliente + trato por nombre.',
          resultado: 'B entrega más valor por el mismo precio y fideliza, aunque el producto base sea igual.',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Qué es el marketing?', opciones: ['Solo publicidad pagada', 'Crear, comunicar y entregar valor al cliente', 'Bajar precios', 'Diseñar el logo'], correcta: 1, explicacion: 'El marketing abarca todo el proceso de valor; la publicidad es solo una parte (promoción).' },
      { pregunta: 'Un cliente compra cuando…', opciones: ['El anuncio es bonito', 'El valor percibido supera lo que paga', 'Hay muchos competidores', 'El producto es barato siempre'], correcta: 1, explicacion: 'La decisión nace de la relación valor percibido vs. costo (dinero, tiempo, esfuerzo).' },
      { pregunta: 'En Bolivia, un canal de gran peso para crecer es…', opciones: ['La televisión nacional únicamente', 'La recomendación de boca a boca', 'Los volantes impresos', 'El fax'], correcta: 1, explicacion: 'La recomendación boca a boca, potenciada por una buena experiencia, es muy influyente.' },
    ],
  },
  {
    slug: 'buyer-persona',
    numero: 2,
    titulo: 'Buyer persona: conocer a tu cliente ideal',
    resumen:
      'En vez de "venderle a todos", defines a una persona concreta. Sus metas, frustraciones y canales guían todas tus decisiones.',
    duracionMin: 11,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Por qué humanizar al cliente',
        parrafos: [
          'Un buyer persona es un personaje semi-ficticio que representa a tu cliente ideal: nombre, edad, ocupación, metas, frustraciones y dónde pasa su tiempo.',
          'Cuando piensas en "Daniela, 27, diseñadora freelance que necesita un café tranquilo para trabajar", tus decisiones se vuelven claras: el menú, el precio, el horario, el tono de tus redes.',
          '"Venderle a todos" termina en mensajes genéricos que no conectan con nadie. Enfocarte en una persona, paradójicamente, atrae a más gente parecida.',
        ],
      },
      {
        titulo: 'Metas, frustraciones y canales',
        parrafos: [
          'Metas: qué quiere lograr (no solo con tu producto, en su vida). Frustraciones: qué le molesta o le frena hoy. Canales: dónde está y a quién le hace caso (redes, lugares, personas).',
          'Esos tres datos alimentan directamente tu mezcla y tu calendario: hablas de sus metas, alivias sus frustraciones y apareces en sus canales.',
        ],
      },
    ],
    quiz: [
      { pregunta: 'Un buyer persona es…', opciones: ['Un cliente real con nombre legal', 'Un personaje semi-ficticio de tu cliente ideal', 'Tu competidor', 'Un empleado'], correcta: 1, explicacion: 'Representa a tu cliente ideal para guiar decisiones; es semi-ficticio pero basado en gente real.' },
      { pregunta: '¿Por qué NO conviene "venderle a todos"?', opciones: ['Porque es ilegal', 'Porque los mensajes genéricos no conectan con nadie', 'Porque cuesta más impuestos', 'No hay problema en hacerlo'], correcta: 1, explicacion: 'Enfocar en una persona concreta hace tus mensajes más relevantes y, paradójicamente, atrae a más gente.' },
      { pregunta: 'Los "canales" del buyer persona sirven para…', opciones: ['Calcular impuestos', 'Saber dónde aparecer para alcanzarlo', 'Definir el logo', 'Contratar personal'], correcta: 1, explicacion: 'Los canales indican dónde pasa su tiempo, para enfocar ahí tu promoción.' },
    ],
  },
  {
    slug: 'mezcla-marketing',
    numero: 3,
    titulo: 'La mezcla de marketing: 4Ps y 7Ps',
    resumen:
      'Producto, precio, plaza y promoción (y, para servicios, personas, procesos y evidencia física) son las palancas que controlas.',
    duracionMin: 12,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Las 4Ps',
        parrafos: [
          'Producto: qué ofreces y qué beneficio entrega. Precio: cuánto cobras y con qué estrategia. Plaza: dónde y cómo lo entregas (local, delivery, online). Promoción: cómo te das a conocer.',
          'Las 4Ps deben ser coherentes entre sí: un producto premium con precio bajo y empaque pobre manda señales contradictorias.',
        ],
      },
      {
        titulo: 'Las 3Ps de servicios',
        parrafos: [
          'Si vendes un servicio o experiencia (cafetería, gimnasio, consultoría), agregas: Personas (tu equipo y su trato), Procesos (cómo es la experiencia de inicio a fin) y Evidencia física (lo tangible: local, packaging, uniformes).',
          'En servicios, las personas y los procesos a menudo importan más que el producto en sí: el mismo corte de cabello con mala atención no se recomienda.',
        ],
        ejemplo: {
          enunciado: 'Cafetería de especialidad, mezcla coherente.',
          desarrollo: 'Producto: café de Caranavi tostado semanal. Precio: ligeramente sobre el barrio. Plaza: local + delivery findes. Promoción: reels del tostado. Personas: baristas certificados. Evidencia: tazas propias, madera clara.',
          resultado: 'Todas las P apuntan al mismo posicionamiento premium-cercano.',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Cuáles son las 4Ps?', opciones: ['Producto, Precio, Plaza, Promoción', 'Personas, Precio, Plan, Plaza', 'Producto, Publicidad, Precio, Personas', 'Plaza, Plan, Premio, Promoción'], correcta: 0, explicacion: 'Las 4Ps clásicas son Producto, Precio, Plaza y Promoción.' },
      { pregunta: '¿Cuándo agregas las 3Ps adicionales (7Ps)?', opciones: ['Nunca', 'Cuando vendes un servicio o experiencia', 'Solo si exportas', 'Cuando bajas precios'], correcta: 1, explicacion: 'Personas, Procesos y Evidencia física aplican especialmente a servicios.' },
      { pregunta: '¿Qué significa que la mezcla sea "coherente"?', opciones: ['Que todo sea barato', 'Que las P manden la misma señal de posicionamiento', 'Que tengas muchos productos', 'Que uses todas las redes'], correcta: 1, explicacion: 'Las P deben reforzar el mismo posicionamiento; señales contradictorias confunden al cliente.' },
    ],
  },
  {
    slug: 'presupuesto-cpl-roas',
    numero: 4,
    titulo: 'Presupuesto, CPL y ROAS: el marketing con números',
    resumen:
      'Invertir en publicidad sin medir es quemar plata. Aprende CPL, conversión, CAC y ROAS para saber si tu marketing es rentable.',
    duracionMin: 13,
    dificultad: 'avanzada',
    secciones: [
      {
        titulo: 'Del gasto al resultado',
        parrafos: [
          'CPL (costo por lead): cuánto te cuesta conseguir un contacto interesado. Conversión: qué % de esos leads termina comprando. Ticket: cuánto deja en promedio cada venta.',
          'Con esos tres puedes proyectar: inversión ÷ CPL = leads; leads × conversión = ventas; ventas × ticket = ingreso. Así sabes ANTES si el canal puede ser rentable.',
        ],
      },
      {
        titulo: 'ROAS y CAC',
        parrafos: [
          'ROAS (retorno de la inversión publicitaria) = ingreso ÷ inversión. 1× = empatas; 3× se considera sano en muchos rubros. CAC (costo de adquisición de cliente) = inversión ÷ ventas: cuánto te cuesta ganar UN cliente.',
          'Un CAC mayor al margen que deja el cliente significa que pierdes dinero por cada venta. Medir esto evita "el anuncio que tiene muchos likes pero no deja plata".',
        ],
        ejemplo: {
          enunciado: 'Campaña de Bs 1.500 en Meta Ads.',
          desarrollo: 'CPL Bs 10 → 150 leads. Conversión 12% → 18 ventas. Ticket Bs 60 → Bs 1.080 ingreso. ROAS = 1.080/1.500 = 0.72×.',
          resultado: 'ROAS < 1: la campaña pierde. Hay que subir conversión, ticket o bajar CPL.',
        },
      },
    ],
    quiz: [
      { pregunta: 'El ROAS se calcula como…', opciones: ['Inversión ÷ ingreso', 'Ingreso ÷ inversión', 'Leads × ticket', 'CPL × conversión'], correcta: 1, explicacion: 'ROAS = ingreso generado ÷ inversión publicitaria. 1× es punto de equilibrio.' },
      { pregunta: 'Si tu CAC es mayor que el margen que deja un cliente…', opciones: ['Ganas mucho', 'Pierdes dinero por cada venta', 'Es ideal', 'No importa'], correcta: 1, explicacion: 'Adquirir al cliente cuesta más de lo que deja: el modelo no es rentable así.' },
      { pregunta: 'Con CPL Bs 10 y Bs 2.000 de inversión, ¿cuántos leads esperas?', opciones: ['200', '20', '2.000', '100'], correcta: 0, explicacion: 'Leads = inversión ÷ CPL = 2.000 ÷ 10 = 200.' },
    ],
  },
  {
    slug: 'calendario-contenidos',
    numero: 5,
    titulo: 'Calendario editorial: constancia que vende',
    resumen:
      'Publicar sin plan agota y no funciona. Un calendario por fecha, canal y tipo de contenido te da constancia y mensaje claro.',
    duracionMin: 10,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Por qué un calendario',
        parrafos: [
          'La constancia vence a la intensidad: más vale 3 publicaciones útiles por semana sostenidas, que 15 un día y nada por un mes.',
          'Un calendario editorial planifica qué publicas, cuándo y en qué canal. Evita el bloqueo del "¿qué subo hoy?" y te permite contar una historia coherente.',
        ],
      },
      {
        titulo: 'Mezcla de contenidos',
        parrafos: [
          'No todo es vender. Una buena mezcla combina contenido de valor (enseña algo), de marca (muestra tu detrás de cámaras) y de venta (oferta directa). Una regla simple: por cada pieza de venta, dos de valor o marca.',
          'Define el estado de cada pieza (idea → listo → publicado) para no perder el hilo y trabajar en equipo.',
        ],
      },
    ],
    quiz: [
      { pregunta: 'En contenidos, ¿qué vence a la intensidad?', opciones: ['El presupuesto', 'La constancia', 'La suerte', 'El logo'], correcta: 1, explicacion: 'Publicar de forma constante y sostenida rinde más que ráfagas aisladas.' },
      { pregunta: 'Una mezcla sana de contenidos incluye…', opciones: ['Solo ventas', 'Valor, marca y venta equilibrados', 'Solo memes', 'Solo fotos del producto'], correcta: 1, explicacion: 'Combinar contenido de valor, de marca y de venta evita cansar a la audiencia.' },
      { pregunta: 'Marcar el estado (idea/listo/publicado) sirve para…', opciones: ['Pagar menos', 'Organizar la producción y no perder el hilo', 'Subir el ROAS', 'Definir el precio'], correcta: 1, explicacion: 'El estado ordena el flujo de trabajo del contenido, sobre todo en equipo.' },
    ],
  },
];

export const TOTAL_CLASES_MARKETING = CLASES_MARKETING.length;

export function getClaseMarketing(slug: string): ClaseMarketing | undefined {
  return CLASES_MARKETING.find((c) => c.slug === slug);
}
