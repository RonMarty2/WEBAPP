/**
 * Contenido de la Academia del módulo Organización.
 * Teoría (secciones + ejemplo boliviano) + quiz de 3 por clase.
 */

export type Dificultad = 'inicial' | 'intermedia' | 'avanzada';

export interface SeccionTeoria {
  titulo: string;
  parrafos: string[];
  ejemplo?: { enunciado: string; desarrollo: string; resultado: string };
}
export interface PreguntaQuiz { pregunta: string; opciones: string[]; correcta: number; explicacion: string }
export interface ClaseOrganizacion {
  slug: string; numero: number; titulo: string; resumen: string;
  duracionMin: number; dificultad: Dificultad; secciones: SeccionTeoria[]; quiz: PreguntaQuiz[];
}

export const CLASES_ORGANIZACION: ClaseOrganizacion[] = [
  {
    slug: 'por-que-la-estructura',
    numero: 1,
    titulo: '¿Por qué importa cómo te organizas?',
    resumen: 'Una buena idea con una estructura caótica fracasa. La organización define quién hace qué, quién responde y cómo fluye el trabajo.',
    duracionMin: 9,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Estructura = claridad',
        parrafos: [
          'Cuando una empresa crece, la informalidad ("todos hacen de todo") deja de funcionar. Sin claridad de roles aparecen tareas duplicadas, otras que nadie hace, y conflictos por quién decide.',
          'La estructura organizacional define cargos, responsabilidades y líneas de mando. No es burocracia: es claridad para que el trabajo fluya y se pueda crecer sin caos.',
        ],
      },
      {
        titulo: 'Las piezas del módulo',
        parrafos: [
          'En este módulo armas: el organigrama (quién reporta a quién), RRHH (cargos, salarios y el costo real con aportes), legalización (trámites para ser formal), aspectos técnicos (cómo operas) y branding (tu identidad).',
          'Juntas, estas piezas responden la pregunta del tribunal: "¿esta empresa puede realmente operar?"',
        ],
      },
    ],
    quiz: [
      { pregunta: '¿Para qué sirve la estructura organizacional?', opciones: ['Para tener más papeles', 'Para dar claridad de roles y mando', 'Para pagar más impuestos', 'Para el logo'], correcta: 1, explicacion: 'Define quién hace qué y quién responde, evitando duplicidades y vacíos.' },
      { pregunta: 'La informalidad "todos hacen de todo" falla cuando…', opciones: ['La empresa crece', 'Hay un solo dueño', 'Nunca falla', 'Bajan los precios'], correcta: 0, explicacion: 'Al crecer aparecen tareas duplicadas, otras sin responsable y conflictos de decisión.' },
      { pregunta: '¿Qué pregunta del tribunal responde este módulo?', opciones: ['¿El logo es bonito?', '¿Esta empresa puede realmente operar?', '¿Cuánto cuesta el dominio?', '¿Quién es el competidor?'], correcta: 1, explicacion: 'Organigrama, RRHH, legal y técnico demuestran la viabilidad operativa.' },
    ],
  },
  {
    slug: 'organigrama-y-cargos',
    numero: 2,
    titulo: 'Organigrama y diseño de cargos',
    resumen: 'El organigrama dibuja la jerarquía y las relaciones de reporte. Empieza simple y crece según la empresa lo necesite.',
    duracionMin: 10,
    dificultad: 'inicial',
    secciones: [
      {
        titulo: 'Cómo se lee un organigrama',
        parrafos: [
          'El organigrama muestra los cargos y quién reporta a quién. Arriba la dirección; debajo, las áreas (operaciones, comercial, administración) y sus equipos.',
          'Para una PYME boliviana que arranca, un organigrama de 4-6 cargos suele bastar. No inventes una estructura corporativa gigante si sois tres personas: el tribunal lo nota.',
        ],
      },
      {
        titulo: 'Cargo ≠ persona',
        parrafos: [
          'Un cargo es una función (ej. "Encargado comercial"), no una persona. Al inicio, una misma persona puede ocupar dos cargos; eso está bien y se aclara.',
          'Cada cargo debe tener responsabilidades claras. Si no puedes describir qué hace, probablemente no lo necesitas todavía.',
        ],
        ejemplo: {
          enunciado: 'Organigrama de una cafetería que arranca.',
          desarrollo: 'Gerente General → (Jefe de Operaciones → baristas) y (Encargado Comercial → vendedor). Administración la lleva el mismo gerente al inicio.',
          resultado: 'Estructura mínima y realista; crece cuando el volumen lo justifique.',
        },
      },
    ],
    quiz: [
      { pregunta: 'Un organigrama muestra principalmente…', opciones: ['Las ventas', 'Cargos y líneas de reporte', 'El presupuesto', 'Los proveedores'], correcta: 1, explicacion: 'Representa la jerarquía: qué cargos hay y quién reporta a quién.' },
      { pregunta: 'En una PYME que arranca, ¿una persona puede ocupar dos cargos?', opciones: ['No, nunca', 'Sí, y se aclara', 'Solo el dueño', 'Solo con permiso del SIN'], correcta: 1, explicacion: 'Es normal al inicio; el cargo es una función, no una persona.' },
      { pregunta: 'Si no puedes describir qué hace un cargo…', opciones: ['Créalo igual', 'Probablemente no lo necesitas aún', 'Súbele el sueldo', 'Ponlo arriba del gerente'], correcta: 1, explicacion: 'Cada cargo debe tener responsabilidades claras; si no, sobra por ahora.' },
    ],
  },
  {
    slug: 'rrhh-aportes-bolivia',
    numero: 3,
    titulo: 'RRHH: el costo real de un empleado en Bolivia',
    resumen: 'El salario que ve el trabajador no es lo que cuesta a la empresa. Los aportes patronales y provisiones suman bastante más.',
    duracionMin: 13,
    dificultad: 'avanzada',
    secciones: [
      {
        titulo: 'Aportes patronales mensuales (≈16.71%)',
        parrafos: [
          'Sobre el total ganado, el EMPLEADOR aporta cada mes en Bolivia: Caja Nacional de Salud 10%, Aporte Patronal Vivienda 2%, Riesgo Profesional (a la AFP) 1.71% y Aporte Patronal Solidario 3%. Eso suma ≈16.71%.',
          'Ojo: esto es ADICIONAL al salario y a los aportes que se descuentan al trabajador (esos salen de su sueldo, no son costo extra de la empresa).',
        ],
      },
      {
        titulo: 'Provisiones: aguinaldo e indemnización',
        parrafos: [
          'Además, la empresa debe prever obligaciones anuales: el aguinaldo (un sueldo al año ≈ 8.33% mensual) y la indemnización (un sueldo por año de antigüedad ≈ 8.33% mensual). Provisionarlas mes a mes evita sustos.',
          'Sumando patronal (16.71%) + provisiones (~16.66%), el costo real de un empleado puede estar en torno a un 30-33% por encima de su salario bruto.',
        ],
        ejemplo: {
          enunciado: 'Empleado con salario bruto de Bs 3.000.',
          desarrollo: 'Patronal 16.71% = Bs 501. Provisiones (aguinaldo+indemnización) ~16.66% = Bs 500. Costo empresa ≈ Bs 4.001/mes.',
          resultado: 'El empleado "de Bs 3.000" le cuesta a la empresa ~Bs 4.000. Presupuéstalo así.',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Cuánto suma aproximadamente el aporte patronal MENSUAL en Bolivia?', opciones: ['5%', '16.71%', '50%', '2%'], correcta: 1, explicacion: 'CNS 10% + Vivienda 2% + Riesgo Profesional 1.71% + Solidario 3% ≈ 16.71%.' },
      { pregunta: 'El aguinaldo equivale aproximadamente a…', opciones: ['8.33% mensual (un sueldo al año)', '50% del sueldo', '1% anual', 'Nada, es opcional'], correcta: 0, explicacion: 'Un sueldo extra al año prorrateado ≈ 8.33% mensual; conviene provisionarlo.' },
      { pregunta: 'El costo real de un empleado respecto a su salario bruto suele ser…', opciones: ['Igual', 'Menor', '~30-33% mayor', 'El doble'], correcta: 2, explicacion: 'Aportes patronales + provisiones elevan el costo ~30-33% sobre el bruto.' },
    ],
  },
  {
    slug: 'legalizacion-bolivia',
    numero: 4,
    titulo: 'Legalización: ser formal en Bolivia',
    resumen: 'NIT, Fundempresa, registros patronales y licencias. Conoce los trámites clave para operar formalmente.',
    duracionMin: 11,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Los trámites base',
        parrafos: [
          'NIT (Número de Identificación Tributaria) en el SIN: te habilita a facturar y declarar impuestos. Matrícula de Comercio en Fundempresa: registra formalmente tu empresa.',
          'Registro patronal en la Caja Nacional de Salud y registro como empleador en la AFP/Gestora: obligatorios si tienes empleados. Licencia de funcionamiento en el municipio (GAM): permiso para operar en ese local.',
        ],
      },
      {
        titulo: 'Según el rubro',
        parrafos: [
          'Algunos rubros requieren trámites extra: registro sanitario (SENASAG/SEDES) para alimentos, registro de marca (SENAPI) para proteger tu nombre, y permisos específicos según la actividad.',
          'Formalizarse cuesta dinero y tiempo, pero abre puertas: facturar a empresas, acceder a crédito y evitar multas. En el laboratorio armas el checklist con costos y estado de cada trámite.',
        ],
        ejemplo: {
          enunciado: 'Cafetería que se formaliza.',
          desarrollo: 'NIT (gratis) + Fundempresa (~Bs 260) + licencia municipal (~Bs 300) + registro CNS y AFP (gratis) + registro sanitario SEDES (~Bs 500).',
          resultado: 'Costo de constitución estimado ~Bs 1.060, sin contar registro de marca.',
        },
      },
    ],
    quiz: [
      { pregunta: '¿Qué entidad emite el NIT?', opciones: ['Fundempresa', 'El SIN (Impuestos)', 'La AFP', 'El municipio'], correcta: 1, explicacion: 'El NIT lo otorga el Servicio de Impuestos Nacionales; habilita a facturar y declarar.' },
      { pregunta: 'La Matrícula de Comercio se tramita en…', opciones: ['SENAPI', 'Fundempresa', 'CNS', 'SEDES'], correcta: 1, explicacion: 'Fundempresa registra formalmente la empresa (matrícula de comercio).' },
      { pregunta: 'Para vender alimentos suele requerirse…', opciones: ['Registro de marca', 'Registro sanitario (SENASAG/SEDES)', 'Solo el NIT', 'Nada extra'], correcta: 1, explicacion: 'Los alimentos requieren registro sanitario además de los trámites base.' },
    ],
  },
  {
    slug: 'branding-identidad',
    numero: 5,
    titulo: 'Branding: la identidad de tu empresa',
    resumen: 'Tu marca es más que un logo: es la promesa, los valores y la personalidad que el cliente recuerda.',
    duracionMin: 9,
    dificultad: 'intermedia',
    secciones: [
      {
        titulo: 'Marca = percepción',
        parrafos: [
          'La marca es lo que la gente siente y recuerda de ti, no solo tu logo. Se construye con coherencia: lo que prometes, cómo tratas al cliente y cómo te ves.',
          'Define tu esencia (por qué existes), tus valores (cómo actúas), tu personalidad (cómo hablas) y tu promesa (qué puede esperar siempre el cliente).',
        ],
      },
      {
        titulo: 'Identidad visual',
        parrafos: [
          'La paleta de colores, la tipografía y el estilo gráfico hacen tu marca reconocible. Mantén pocos colores y úsalos de forma consistente en redes, local y empaque.',
          'Una identidad coherente genera confianza: el cliente percibe orden y profesionalismo, aunque seas pequeño.',
        ],
      },
    ],
    quiz: [
      { pregunta: 'La marca es principalmente…', opciones: ['El logo', 'La percepción y promesa que recuerda el cliente', 'El precio', 'El local'], correcta: 1, explicacion: 'Marca = lo que la gente siente y recuerda; el logo es solo una parte.' },
      { pregunta: '¿Qué hace reconocible a una marca?', opciones: ['Usar muchos colores', 'Coherencia visual (pocos colores, tipografía consistente)', 'Cambiar de estilo seguido', 'Copiar a la competencia'], correcta: 1, explicacion: 'La consistencia visual hace la marca memorable y confiable.' },
      { pregunta: 'La "promesa de marca" es…', opciones: ['Un descuento', 'Lo que el cliente siempre puede esperar de ti', 'El eslogan legal', 'El NIT'], correcta: 1, explicacion: 'Es el compromiso constante que define la experiencia con tu marca.' },
    ],
  },
];

export const TOTAL_CLASES_ORGANIZACION = CLASES_ORGANIZACION.length;
export function getClaseOrganizacion(slug: string): ClaseOrganizacion | undefined {
  return CLASES_ORGANIZACION.find((c) => c.slug === slug);
}
