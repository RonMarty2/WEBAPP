/**
 * Definición de las 6 clases del curso "Finanzas para Emprendedores".
 * Cada clase tiene: secciones de teoría con ejemplo numérico, un ejercicio
 * interactivo (con su respuesta correcta) y un quiz de 3 preguntas.
 *
 * El contenido es pedagógico real (no Lorem Ipsum) — adaptado a contexto
 * boliviano: Bs., proyectos pequeños/medianos, cafeterías, agroindustria, etc.
 */

export type DificultadClase = 'inicial' | 'intermedia' | 'avanzada';

export interface SeccionTeoria {
  titulo: string;
  parrafos: string[];
  ejemplo?: {
    enunciado: string;
    calculo: string;
    resultado: string;
  };
}

export interface EjercicioInteractivo {
  enunciado: string;
  campos: Array<{
    id: string;
    label: string;
    hint?: string;
    unidad: string;
  }>;
  resolver: (inputs: Record<string, number>) => {
    correcto: boolean;
    valorEstudiante: number;
    valorCorrecto: number;
    explicacion: string;
    tolerancia: number;
  };
}

export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

export interface Clase {
  id: string;
  slug: string;
  numero: number;
  titulo: string;
  resumen: string;
  duracionMinutos: number;
  dificultad: DificultadClase;
  secciones: SeccionTeoria[];
  ejercicio: EjercicioInteractivo;
  quiz: PreguntaQuiz[];
}

export const CLASES_FINANZAS: Clase[] = [
  {
    id: 'cls-fin-01',
    slug: 'van-y-tir',
    numero: 1,
    titulo: 'VAN y TIR: los dos indicadores que todo emprendedor debe leer',
    resumen:
      'Aprende qué dicen realmente el Valor Actual Neto y la Tasa Interna de Retorno, y por qué un proyecto con VAN positivo no siempre es buen negocio.',
    duracionMinutos: 18,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: '¿Por qué Bs. 1.000 hoy valen más que Bs. 1.000 mañana?',
        parrafos: [
          'Es el principio fundamental de las finanzas: el dinero tiene valor en el tiempo. Si te entrego Bs. 1.000 hoy, puedes invertirlos, ganar intereses, comprar inventario que rotas en 3 meses. Si te los entrego dentro de un año, perdiste todas esas oportunidades.',
          'Por eso, cuando evalúas un proyecto que generará ingresos durante 5 años, no puedes simplemente sumar todos los ingresos. Tienes que "traer al presente" cada flujo futuro, descontándolo con una tasa.',
          'Esa tasa de descuento representa cuánto exiges como retorno mínimo. Si tu plata podría ganar 14% al año en un fondo de inversión, no aceptarás un proyecto que rinda menos.',
        ],
      },
      {
        titulo: 'VAN: ¿cuánto valor neto genera tu proyecto, en plata de hoy?',
        parrafos: [
          'El Valor Actual Neto (VAN) suma todos los flujos del proyecto traídos al presente, y le resta la inversión inicial. La fórmula es:',
          'VAN = -Inversión + Σ (Flujo_t / (1 + tasa)^t)',
          'Si el VAN es positivo, el proyecto genera más valor del que pides como retorno mínimo. Si es cero, apenas iguala. Si es negativo, mejor pon tu plata en otra cosa.',
        ],
        ejemplo: {
          enunciado:
            'Inviertes Bs. 50.000 hoy. Esperas 3 años de flujos netos de Bs. 22.000 cada año. Exiges 14% de retorno mínimo (tasa de descuento).',
          calculo:
            'VAN = -50.000 + 22.000/(1,14)¹ + 22.000/(1,14)² + 22.000/(1,14)³\nVAN = -50.000 + 19.298 + 16.928 + 14.849',
          resultado: 'VAN = Bs. 1.075 → el proyecto es viable, aunque por poco margen.',
        },
      },
      {
        titulo: 'TIR: ¿qué rendimiento real ofrece tu proyecto?',
        parrafos: [
          'La Tasa Interna de Retorno (TIR) responde una pregunta distinta: ¿a qué tasa de descuento el VAN se vuelve exactamente cero? Es el rendimiento "puro" del proyecto.',
          'Si la TIR es mayor que tu tasa de descuento exigida, el proyecto te conviene. Si es menor, no.',
          'En el ejemplo anterior, la TIR es aproximadamente 15,5%. Como tu tasa exigida era 14%, el proyecto pasa la prueba — pero apenas. Una caída en los ingresos podría volverlo inviable.',
        ],
      },
      {
        titulo: 'Cuidado con los falsos positivos',
        parrafos: [
          'Un VAN positivo y una TIR mayor a tu tasa NO significan automáticamente que debes invertir. Hay tres trampas comunes:',
          '1. Proyectos con flujos muy concentrados al final son riesgosos: si algo cambia en el año 4 o 5, todo el VAN se cae.',
          '2. La TIR puede engañar cuando hay múltiples cambios de signo en los flujos (inversiones intermedias).',
          '3. Comparar dos proyectos por TIR sola ignora la escala: un proyecto pequeño con TIR alta puede generar menos valor absoluto que uno grande con TIR moderada.',
          'Por eso, en la próxima clase veremos cómo construir el flujo de caja con criterio realista.',
        ],
      },
    ],
    ejercicio: {
      enunciado:
        'Tu prima quiere abrir una hamburguesería en zona universitaria. Inversión inicial: Bs. 35.000. Espera flujos netos de Bs. 14.000 anuales durante 4 años. Su tasa de descuento es 12%. Calcula el VAN.',
      campos: [
        { id: 'van', label: 'VAN del proyecto', unidad: 'Bs.', hint: 'Redondea al entero más cercano' },
      ],
      resolver: inputs => {
        const flujos = [-35000, 14000, 14000, 14000, 14000];
        const tasa = 0.12;
        const vanReal = flujos.reduce((s, f, t) => s + f / Math.pow(1 + tasa, t), 0);
        const valorEstudiante = inputs.van ?? 0;
        const tolerancia = 200;
        const correcto = Math.abs(valorEstudiante - vanReal) <= tolerancia;
        return {
          correcto,
          valorEstudiante,
          valorCorrecto: Math.round(vanReal),
          tolerancia,
          explicacion: correcto
            ? 'Perfecto. El proyecto es viable: VAN positivo significa que genera más valor que el 12% que tu prima exige.'
            : `El cálculo correcto es: -35.000 + 14.000/(1,12) + 14.000/(1,12)² + 14.000/(1,12)³ + 14.000/(1,12)⁴ ≈ Bs. ${Math.round(vanReal).toLocaleString('es-BO')}. Revisa que estés descontando cada flujo con la potencia correcta del año.`,
        };
      },
    },
    quiz: [
      {
        pregunta: '¿Qué significa un VAN igual a cero?',
        opciones: [
          'El proyecto no genera ingresos',
          'El proyecto rinde exactamente la tasa de descuento exigida',
          'El proyecto es inviable',
          'No se puede calcular la TIR',
        ],
        correcta: 1,
        explicacion:
          'VAN = 0 significa que el proyecto rinde exactamente tu tasa de descuento. Genera valor suficiente para cumplir tu retorno mínimo, ni más ni menos.',
      },
      {
        pregunta: 'Si la TIR de un proyecto es 22% y tu tasa de descuento es 15%, el VAN es:',
        opciones: [
          'Negativo',
          'Cero',
          'Positivo',
          'No se puede saber sin más datos',
        ],
        correcta: 2,
        explicacion:
          'Cuando la TIR es mayor que la tasa de descuento, el VAN es positivo. La TIR es la tasa que hace VAN = 0, así que al descontar con una tasa menor, el VAN sube.',
      },
      {
        pregunta: '¿Cuál de estos NO es un problema típico al usar solo la TIR?',
        opciones: [
          'Ignora la escala absoluta del proyecto',
          'Puede tener múltiples valores cuando hay flujos negativos intermedios',
          'No considera el costo de oportunidad',
          'Engaña al comparar proyectos de tamaños distintos',
        ],
        correcta: 2,
        explicacion:
          'La TIR sí considera implícitamente el costo de oportunidad al compararse con tu tasa de descuento. Las otras tres opciones son limitaciones reales de la TIR como criterio único.',
      },
    ],
  },
  {
    id: 'cls-fin-02',
    slug: 'flujo-de-caja',
    numero: 2,
    titulo: 'Flujo de caja proyectado: el corazón de la evaluación',
    resumen:
      'Aprende a construir un flujo de caja realista — ingresos, egresos, impuestos, depreciación, capital de trabajo.',
    duracionMinutos: 22,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Flujo de caja no es lo mismo que estado de resultados',
        parrafos: [
          'El estado de resultados (P&L) muestra ingresos y gastos contables, incluyendo conceptos que no implican movimiento de plata real, como la depreciación.',
          'El flujo de caja muestra solo lo que ENTRA y SALE en efectivo. Para evaluar un proyecto necesitas el segundo: lo que importa es cuánta plata real va a tu bolsillo.',
        ],
      },
      {
        titulo: 'Estructura típica de un flujo de caja a 5 años',
        parrafos: [
          'En el año 0 va la inversión inicial: maquinaria, instalaciones, capital de trabajo. Es siempre negativo.',
          'Del año 1 al 5 (o el horizonte que elijas): ingresos por ventas, menos costos variables, menos costos fijos, menos impuestos. Sumar depreciación (porque no es salida de caja real).',
          'Al final del último año, puedes agregar el valor de rescate de los activos si los vendes o liquidas.',
        ],
        ejemplo: {
          enunciado: 'Cafetería con inversión inicial Bs. 85.000. Ventas año 1: Bs. 120.000. Costos: Bs. 78.000.',
          calculo: 'Flujo año 1 = 120.000 - 78.000 = 42.000',
          resultado: 'Flujo neto año 1: Bs. 42.000',
        },
      },
    ],
    ejercicio: {
      enunciado:
        'Una panadería proyecta ventas de Bs. 180.000 en el año 1. Costos variables: Bs. 96.000. Costos fijos: Bs. 42.000. Impuestos: Bs. 8.400. Calcula el flujo neto del año 1.',
      campos: [
        { id: 'flujo', label: 'Flujo neto año 1', unidad: 'Bs.' },
      ],
      resolver: inputs => {
        const correcto = 180000 - 96000 - 42000 - 8400;
        const valorEstudiante = inputs.flujo ?? 0;
        const ok = Math.abs(valorEstudiante - correcto) <= 100;
        return {
          correcto: ok,
          valorEstudiante,
          valorCorrecto: correcto,
          tolerancia: 100,
          explicacion: ok
            ? 'Bien. Ventas menos costos variables, costos fijos e impuestos te dan el flujo neto operativo.'
            : `El cálculo es 180.000 - 96.000 - 42.000 - 8.400 = Bs. ${correcto.toLocaleString('es-BO')}.`,
        };
      },
    },
    quiz: [
      {
        pregunta: '¿La depreciación es una salida de caja?',
        opciones: ['Sí, siempre', 'No, es un gasto contable sin movimiento de caja', 'Solo en el año 1', 'Depende del activo'],
        correcta: 1,
        explicacion: 'La depreciación reparte el costo del activo a lo largo de su vida útil, pero la plata ya salió al comprarlo. No es salida de caja real.',
      },
      {
        pregunta: '¿Qué se incluye en el año 0 del flujo de caja?',
        opciones: ['Las primeras ventas', 'La inversión inicial', 'Los impuestos del primer año', 'El valor de rescate'],
        correcta: 1,
        explicacion: 'El año 0 es siempre el momento de la inversión: maquinaria, instalaciones, capital de trabajo inicial.',
      },
      {
        pregunta: '¿Qué horizonte de análisis usar?',
        opciones: ['Siempre 10 años', 'La vida útil del activo principal', '5 años por defecto', 'Hasta recuperar la inversión'],
        correcta: 1,
        explicacion: 'El horizonte razonable es la vida útil del activo principal del proyecto. Una panadería con horno de 8 años se evalúa a 8 años.',
      },
    ],
  },
  {
    id: 'cls-fin-03',
    slug: 'tasa-de-descuento',
    numero: 3,
    titulo: 'Tasa de descuento: cómo elegir un número que no sea arbitrario',
    resumen: 'Costo de oportunidad, riesgo del sector y prima por riesgo país: los tres ingredientes de tu tasa.',
    duracionMinutos: 16,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Tu tasa es tu costo de oportunidad',
        parrafos: [
          'La tasa de descuento responde: ¿qué rendimiento podrías obtener en tu mejor alternativa con riesgo similar? Esa es tu vara de medir.',
          'Si tu plata en un fondo seguro rinde 8% al año, no deberías aceptar un proyecto riesgoso que rinda 9%. La diferencia es muy pequeña para el riesgo asumido.',
        ],
      },
      {
        titulo: 'Componentes de la tasa',
        parrafos: [
          'Tasa libre de riesgo: bonos del estado o depósitos a plazo fijo. En Bolivia, ronda 5-7%.',
          'Prima por riesgo del sector: cuánto más exiges por el riesgo de tu industria. Una cafetería tiene menos riesgo que minería.',
          'Prima por riesgo país: factor adicional en economías emergentes. Bolivia suele cargar 3-5 puntos.',
        ],
      },
    ],
    ejercicio: {
      enunciado: 'Tu tasa libre de riesgo es 6%. La prima por riesgo del sector restaurantes es 5%. Prima por riesgo país: 4%. Calcula tu tasa de descuento.',
      campos: [
        { id: 'tasa', label: 'Tasa de descuento', unidad: '%' },
      ],
      resolver: inputs => {
        const correcto = 15;
        const valorEstudiante = inputs.tasa ?? 0;
        const ok = Math.abs(valorEstudiante - correcto) <= 0.5;
        return {
          correcto: ok,
          valorEstudiante,
          valorCorrecto: correcto,
          tolerancia: 0.5,
          explicacion: ok
            ? 'Correcto. Tu tasa es la suma simple de los tres componentes: 6% + 5% + 4% = 15%.'
            : 'La suma de los tres componentes es 6 + 5 + 4 = 15%.',
        };
      },
    },
    quiz: [
      {
        pregunta: 'Una tasa de descuento demasiado alta hará que:',
        opciones: ['Más proyectos parezcan viables', 'Menos proyectos parezcan viables', 'No afecta el VAN', 'Aumente la TIR'],
        correcta: 1,
        explicacion: 'A mayor tasa, los flujos futuros se descuentan más fuerte, el VAN baja y menos proyectos pasan la prueba.',
      },
      {
        pregunta: '¿Qué tasa debería usar un proyecto en minería vs. una panadería?',
        opciones: ['La misma', 'Mayor en minería por mayor riesgo', 'Menor en minería porque rinde más', 'Depende del dueño'],
        correcta: 1,
        explicacion: 'Mayor riesgo exige mayor retorno. Minería tiene volatilidad alta de precios, política, ambiental.',
      },
      {
        pregunta: 'En Bolivia, ¿qué componente de la tasa suele ser más alto que en EE.UU.?',
        opciones: ['Tasa libre de riesgo', 'Prima por sector', 'Prima por riesgo país', 'Ninguno'],
        correcta: 2,
        explicacion: 'Los mercados emergentes cargan una prima adicional por incertidumbre macroeconómica y política.',
      },
    ],
  },
  {
    id: 'cls-fin-04',
    slug: 'sensibilidad',
    numero: 4,
    titulo: 'Análisis de sensibilidad: ¿qué pasa si todo sale mal?',
    resumen: 'Tres escenarios (optimista, base, pesimista) y por qué tu inversor querrá ver los tres.',
    duracionMinutos: 14,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Tu proyección base es solo una posibilidad',
        parrafos: [
          'Cuando proyectas ventas a 5 años, estás haciendo una apuesta. La realidad nunca coincide exactamente con lo planeado.',
          'El análisis de sensibilidad responde: si me equivoco en 20% para arriba o para abajo, ¿el proyecto sigue siendo viable?',
        ],
      },
      {
        titulo: 'Escenarios estándar',
        parrafos: [
          'Optimista: ingresos +20%, egresos -10%. El proyecto "sale redondo".',
          'Base: tu mejor estimación realista.',
          'Pesimista: ingresos -20%, egresos +10%. Algo no sale como esperabas.',
          'Si en el pesimista el VAN sigue positivo, tienes un proyecto robusto. Si el VAN base es positivo pero el pesimista es negativo, evalúa tu tolerancia al riesgo.',
        ],
      },
    ],
    ejercicio: {
      enunciado: 'Si tu VAN base es Bs. 80.000 y tu VAN pesimista es Bs. -15.000, ¿qué interpretas?',
      campos: [
        { id: 'caida', label: 'Caída porcentual del VAN base al pesimista', unidad: '%' },
      ],
      resolver: inputs => {
        const correcto = 118.75;
        const valorEstudiante = inputs.caida ?? 0;
        const ok = Math.abs(valorEstudiante - correcto) <= 2;
        return {
          correcto: ok,
          valorEstudiante,
          valorCorrecto: correcto,
          tolerancia: 2,
          explicacion: ok
            ? 'Correcto. La caída es (80.000 - (-15.000)) / 80.000 = 118,75%. Tu proyecto NO es robusto a escenarios pesimistas.'
            : 'La caída es (80.000 - (-15.000)) / 80.000 ≈ 118,75%. Un proyecto así requiere mitigantes claros.',
        };
      },
    },
    quiz: [
      {
        pregunta: '¿Cuándo un proyecto es "robusto"?',
        opciones: ['Cuando el VAN optimista es muy alto', 'Cuando el VAN pesimista sigue positivo', 'Cuando la TIR base supera 20%', 'Cuando el payback es menor a 2 años'],
        correcta: 1,
        explicacion: 'La robustez se mide en el peor escenario, no en el mejor. Si aguanta el pesimista, aguanta casi todo.',
      },
      {
        pregunta: '¿Qué variable suele ser más sensible en proyectos pequeños?',
        opciones: ['La tasa de descuento', 'Los ingresos proyectados', 'La depreciación', 'El horizonte temporal'],
        correcta: 1,
        explicacion: 'Los ingresos son la variable más volátil y de mayor impacto en el VAN.',
      },
      {
        pregunta: 'Si el VAN pesimista es negativo, ¿qué deberías hacer?',
        opciones: ['Descartar el proyecto', 'Evaluar tolerancia al riesgo y mitigantes', 'Subir la tasa de descuento', 'Recalcular con ingresos optimistas'],
        correcta: 1,
        explicacion: 'No es para descartar automáticamente: depende de cuánta probabilidad le das al escenario pesimista y qué tan fácil sería mitigarlo.',
      },
    ],
  },
  {
    id: 'cls-fin-05',
    slug: 'escenarios',
    numero: 5,
    titulo: 'Escenarios y probabilidad: del análisis al juicio',
    resumen: 'No basta con tres escenarios: pondera cada uno por su probabilidad para tomar una decisión informada.',
    duracionMinutos: 12,
    dificultad: 'avanzada',
    secciones: [
      {
        titulo: 'VAN esperado: el promedio ponderado',
        parrafos: [
          'Si tu VAN optimista es Bs. 200.000 con 25% de probabilidad, VAN base Bs. 100.000 con 50%, y VAN pesimista Bs. -20.000 con 25%, tu VAN esperado es:',
          'VAN esperado = 0,25 × 200.000 + 0,50 × 100.000 + 0,25 × (-20.000) = 95.000.',
          'Es un solo número que resume tu mejor expectativa considerando incertidumbre.',
        ],
      },
    ],
    ejercicio: {
      enunciado: 'Optimista: Bs. 150.000 (30%). Base: Bs. 80.000 (50%). Pesimista: Bs. -30.000 (20%). Calcula el VAN esperado.',
      campos: [
        { id: 'vanEsperado', label: 'VAN esperado', unidad: 'Bs.' },
      ],
      resolver: inputs => {
        const correcto = 0.3 * 150000 + 0.5 * 80000 + 0.2 * -30000;
        const valorEstudiante = inputs.vanEsperado ?? 0;
        const ok = Math.abs(valorEstudiante - correcto) <= 500;
        return {
          correcto: ok,
          valorEstudiante,
          valorCorrecto: correcto,
          tolerancia: 500,
          explicacion: ok
            ? 'Correcto. La ponderación da 45.000 + 40.000 - 6.000 = 79.000.'
            : `El cálculo es 0,3×150.000 + 0,5×80.000 + 0,2×(-30.000) = Bs. ${correcto.toLocaleString('es-BO')}.`,
        };
      },
    },
    quiz: [
      {
        pregunta: '¿Las probabilidades de los escenarios deben sumar?',
        opciones: ['No importa', '100%', 'Depende del proyecto', '80%'],
        correcta: 1,
        explicacion: 'Las probabilidades de un evento (los escenarios cubren todos los casos posibles) siempre suman 100%.',
      },
      {
        pregunta: '¿Cuándo el VAN esperado es engañoso?',
        opciones: ['Cuando hay solo dos escenarios', 'Cuando los escenarios son muy distintos entre sí', 'Cuando la tasa de descuento es alta', 'Nunca es engañoso'],
        correcta: 1,
        explicacion: 'Si tu pesimista es muy negativo, el promedio puede ocultar que el escenario peor podría llevarte a la quiebra. Mira siempre la varianza también.',
      },
      {
        pregunta: 'Si no tienes datos para asignar probabilidades, ¿qué haces?',
        opciones: ['Usas 33% para cada uno', 'Usas datos del sector como referencia', 'No haces análisis probabilístico', 'Inventas números'],
        correcta: 1,
        explicacion: 'Busca benchmarks del sector, datos históricos similares o consulta a expertos. Asignar probabilidades requiere fundamento.',
      },
    ],
  },
  {
    id: 'cls-fin-06',
    slug: 'punto-de-equilibrio',
    numero: 6,
    titulo: 'Punto de equilibrio: ¿cuánto necesitas vender para no perder?',
    resumen: 'El cálculo más útil para el día a día: cuántas unidades vendidas cubren todos tus costos fijos.',
    duracionMinutos: 13,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'La fórmula',
        parrafos: [
          'Punto de equilibrio (en unidades) = Costos Fijos / (Precio - Costo Variable Unitario).',
          'El denominador es lo que cada venta aporta para cubrir costos fijos. Cuando lo dividas, sabrás cuántas unidades necesitas vender solo para no perder plata.',
        ],
        ejemplo: {
          enunciado: 'Costos fijos mensuales: Bs. 12.000. Precio por unidad: Bs. 25. Costo variable por unidad: Bs. 13.',
          calculo: 'Punto equilibrio = 12.000 / (25 - 13) = 12.000 / 12 = 1.000 unidades',
          resultado: 'Necesitas vender 1.000 unidades al mes para empatar.',
        },
      },
    ],
    ejercicio: {
      enunciado: 'Una hamburguesería tiene costos fijos mensuales de Bs. 18.000. Cada hamburguesa se vende a Bs. 35 y cuesta Bs. 14 producirla. ¿Cuántas hamburguesas mensuales necesita vender para empatar?',
      campos: [
        { id: 'unidades', label: 'Hamburguesas mensuales', unidad: 'u.' },
      ],
      resolver: inputs => {
        const correcto = Math.ceil(18000 / (35 - 14));
        const valorEstudiante = inputs.unidades ?? 0;
        const ok = Math.abs(valorEstudiante - correcto) <= 5;
        return {
          correcto: ok,
          valorEstudiante,
          valorCorrecto: correcto,
          tolerancia: 5,
          explicacion: ok
            ? `Correcto. ${correcto} hamburguesas mensuales. Por debajo de eso, pierde plata.`
            : `Punto equilibrio = 18.000 / (35 - 14) = 18.000 / 21 ≈ ${correcto} unidades.`,
        };
      },
    },
    quiz: [
      {
        pregunta: 'Si subes el precio de venta, ¿qué le pasa al punto de equilibrio?',
        opciones: ['Sube', 'Baja', 'No cambia', 'Depende del costo'],
        correcta: 1,
        explicacion: 'Cada venta aporta más al cubrir costos fijos, así que necesitas vender menos unidades para empatar.',
      },
      {
        pregunta: '¿El punto de equilibrio considera la inversión inicial?',
        opciones: ['Sí, siempre', 'No, solo costos operativos', 'Solo en el primer año', 'Depende del horizonte'],
        correcta: 1,
        explicacion: 'El punto de equilibrio es un concepto operativo: cuántas ventas cubren costos del período. La recuperación de la inversión es el payback.',
      },
      {
        pregunta: '¿Por qué un margen de contribución alto es estratégicamente valioso?',
        opciones: ['Permite punto de equilibrio bajo y absorber mejor caídas', 'Reduce los impuestos', 'Aumenta la depreciación', 'No tiene relación con la estrategia'],
        correcta: 0,
        explicacion: 'Con margen alto, cada venta adicional pasa más rápido a utilidad. Más resistencia a baja de demanda.',
      },
    ],
  },
];

export function getClasePorSlug(slug: string): Clase | undefined {
  return CLASES_FINANZAS.find(c => c.slug === slug);
}

export function getClasePorId(id: string): Clase | undefined {
  return CLASES_FINANZAS.find(c => c.id === id);
}
