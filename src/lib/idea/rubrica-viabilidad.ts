/**
 * Rúbrica formal para el Análisis de Viabilidad (Pre-validación).
 *
 * Reemplaza el slider 1-5 sin guía por una rúbrica académica con:
 *   - Descriptores claros por nivel (qué es un 1, 3, 5)
 *   - Sub-criterios por dimensión (ayudan a evaluar concretamente)
 *   - Pregunta de evidencia obligatoria por dimensión
 *
 * Diseñada para que el estudiante pueda DEFENDER cada puntaje ante el
 * tribunal con datos, no con intuición.
 *
 * Sirve directamente como sección "Análisis de Viabilidad" en modalidades de
 * Proyecto de Grado / Plan de Negocio / Trabajo Dirigido.
 */

export interface NivelRubrica {
  /** Puntaje numérico 1..5 */
  valor: number;
  /** Etiqueta corta visible en el botón (ej. "Validada") */
  etiqueta: string;
  /** Descripción completa de qué evidencia se necesita para este nivel */
  descripcion: string;
}

export interface DimensionRubrica {
  /** Clave interna usada en la BD */
  key: 'deseabilidad' | 'factibilidad' | 'viabilidad';
  /** Nombre académico */
  nombre: string;
  /** Pregunta que la dimensión responde */
  pregunta: string;
  /** Lista de chequeo de sub-criterios concretos */
  subcriterios: string[];
  /** Hint de qué evidencia debería citarse */
  guia_evidencia: string;
  /** Niveles 1..5 con descriptores */
  niveles: NivelRubrica[];
}

export const RUBRICA: DimensionRubrica[] = [
  {
    key: 'deseabilidad',
    nombre: 'Deseabilidad',
    pregunta: '¿El cliente lo quiere y lo necesita lo suficiente para pagar?',
    subcriterios: [
      'El cliente reconoce el problema sin que se lo sugieras',
      'El problema le genera dolor real (tiempo, dinero, frustración)',
      'Hay alguien pagando hoy por una solución (aunque sea imperfecta)',
      'Tu segmento es alcanzable y suficientemente grande',
    ],
    guia_evidencia:
      'Resultados de entrevistas (N personas, % que confirmó el problema), pre-ventas, cartas de intención, encuestas con preguntas no sugerentes.',
    niveles: [
      { valor: 5, etiqueta: 'Validada con dinero',
        descripcion: 'Clientes ya pagaron, dejaron seña o firmaron carta de intención. Tienes pre-ventas reales o lista de espera con compromiso.' },
      { valor: 4, etiqueta: 'Fuerte evidencia',
        descripcion: '≥70% de entrevistados (mínimo 10) mencionan el problema SIN que lo sugieras. Hay un segmento claro con dolor concreto.' },
      { valor: 3, etiqueta: 'Interés moderado',
        descripcion: 'Clientes dicen "me interesa" o "lo usaría" pero no se comprometen aún. Hay señales positivas, falta validación con dinero.' },
      { valor: 2, etiqueta: 'Solo círculo cercano',
        descripcion: 'Solo familiares, amigos o colegas dicen que les gusta. No has hablado con clientes objetivo reales.' },
      { valor: 1, etiqueta: 'Sin evidencia',
        descripcion: 'Es solo tu intuición. No has hecho entrevistas ni probado el interés del mercado.' },
    ],
  },
  {
    key: 'factibilidad',
    nombre: 'Factibilidad',
    pregunta: '¿Puedes construirlo y operarlo con lo que tienes o puedes conseguir?',
    subcriterios: [
      'Tienes (o puedes conseguir) las capacidades técnicas necesarias',
      'Conoces el proceso operativo de principio a fin',
      'Los recursos clave (proveedores, equipo, ubicación) son accesibles',
      'Las barreras legales/regulatorias en Bolivia son manejables',
    ],
    guia_evidencia:
      'Prototipo o MVP funcional, cotizaciones reales de proveedores, plan de operaciones, contactos confirmados con personas/empresas clave.',
    niveles: [
      { valor: 5, etiqueta: 'Probada en piloto',
        descripcion: 'Tienes un MVP o piloto funcionando con clientes reales. La operación está probada y replicable.' },
      { valor: 4, etiqueta: 'Plan sólido',
        descripcion: 'Tienes cotizaciones, proveedores identificados, equipo capaz y el proceso descrito paso a paso. Falta arrancar.' },
      { valor: 3, etiqueta: 'Viable con esfuerzo',
        descripcion: 'Sabes lo que necesitas pero te faltan recursos clave (capital, equipo, contactos). Es alcanzable con trabajo.' },
      { valor: 2, etiqueta: 'Vacíos importantes',
        descripcion: 'Hay piezas críticas que no sabes cómo resolver (proveedor único, tecnología compleja, regulación restrictiva).' },
      { valor: 1, etiqueta: 'Inviable hoy',
        descripcion: 'Requiere recursos, tecnología o permisos que están fuera de tu alcance actual y a corto plazo.' },
    ],
  },
  {
    key: 'viabilidad',
    nombre: 'Viabilidad',
    pregunta: '¿Es rentable y sostenible en el tiempo?',
    subcriterios: [
      'El precio que el cliente está dispuesto a pagar supera tu costo unitario',
      'El mercado total (TAM) es suficientemente grande para tu meta',
      'El costo de adquirir un cliente (CAC) es menor que lo que deja (LTV)',
      'Hay barreras o ventajas que protegen tu negocio en el tiempo',
    ],
    guia_evidencia:
      'Cálculo de margen unitario, estimación de mercado (con fuente), proyección de CAC y LTV, análisis de competencia y diferenciación.',
    niveles: [
      { valor: 5, etiqueta: 'Modelo probado',
        descripcion: 'Margen positivo en cada venta, CAC < LTV demostrado, mercado claro y barrera competitiva real (marca, red, tecnología).' },
      { valor: 4, etiqueta: 'Numbers cierran',
        descripcion: 'Cálculos sólidos: precio > costo, mercado suficiente, proyecciones realistas con supuestos justificados.' },
      { valor: 3, etiqueta: 'Sensible a supuestos',
        descripcion: 'Funciona con ciertos supuestos optimistas (volumen, precio, retención). El margen es ajustado.' },
      { valor: 2, etiqueta: 'Margen débil',
        descripcion: 'El precio que el cliente acepta apenas cubre costos. Necesita gran volumen o muchas optimizaciones para ser rentable.' },
      { valor: 1, etiqueta: 'No rentable',
        descripcion: 'Los números no cierran: costos > precio aceptable, o el mercado es muy pequeño para que tenga sentido.' },
    ],
  },
];

/** Lookup por dimensión */
export function getDimension(key: 'deseabilidad' | 'factibilidad' | 'viabilidad'): DimensionRubrica {
  return RUBRICA.find((r) => r.key === key)!;
}

/** Lookup por dimensión + valor → descriptor del nivel */
export function getDescriptor(key: 'deseabilidad' | 'factibilidad' | 'viabilidad', valor: number): NivelRubrica | undefined {
  return getDimension(key).niveles.find((n) => n.valor === valor);
}

/**
 * Decide si esta sección debe aparecer como SECCIÓN ACADÉMICA en el documento
 * final, según la modalidad del proyecto.
 * - SÍ: Proyecto de Grado, Plan de Negocio, Trabajo Dirigido, Exploración Investigativa
 * - NO (es solo notas internas): Tesis, Monografía, Examen de Grado, Artículo
 */
export function aplicaComoSeccion(tipoTrabajo: string | null | undefined): boolean {
  if (!tipoTrabajo) return false;
  const t = tipoTrabajo.toLowerCase();
  return (
    t.includes('proyecto de grado') ||
    t.includes('plan de negocio') ||
    t.includes('trabajo dirigido') ||
    t.includes('exploraci')
  );
}
