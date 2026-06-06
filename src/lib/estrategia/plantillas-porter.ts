/**
 * Plantillas de las 5 Fuerzas de Porter con guía y sugerencias bolivianas.
 * Intensidad 1 (baja) a 5 (alta). A MAYOR intensidad → sector MENOS atractivo.
 */

export interface FuerzaMeta {
  key: 'rivalidad' | 'nuevosEntrantes' | 'sustitutos' | 'poderClientes' | 'poderProveedores';
  label: string;
  descripcion: string;
  preguntas: string[]; // preguntas guía para evaluar la intensidad
}

export const FUERZAS_PORTER: FuerzaMeta[] = [
  {
    key: 'rivalidad',
    label: 'Rivalidad entre competidores',
    descripcion: 'Qué tan intensa es la competencia entre las empresas ya existentes en el sector.',
    preguntas: [
      '¿Cuántos competidores directos hay en tu zona?',
      '¿Compiten por precio (guerra de precios) o por diferenciación?',
      '¿El mercado crece o está estancado (más rivalidad si está estancado)?',
    ],
  },
  {
    key: 'nuevosEntrantes',
    label: 'Amenaza de nuevos entrantes',
    descripcion: 'Qué tan fácil es que aparezcan nuevos competidores.',
    preguntas: [
      '¿Cuánto capital se necesita para entrar al sector?',
      '¿Hay barreras (licencias, know-how, marca, economías de escala)?',
      '¿Es fácil para alguien copiar tu propuesta?',
    ],
  },
  {
    key: 'sustitutos',
    label: 'Amenaza de sustitutos',
    descripcion: 'Productos/servicios distintos que satisfacen la misma necesidad.',
    preguntas: [
      '¿Qué alternativas tiene el cliente para resolver la misma necesidad?',
      '¿Es barato y fácil cambiarse a un sustituto?',
      '(Ej. cafetería: hacer café en casa, comprar en tienda, otra bebida)',
    ],
  },
  {
    key: 'poderClientes',
    label: 'Poder de los clientes',
    descripcion: 'Capacidad de los compradores para presionar precios o exigir más.',
    preguntas: [
      '¿Hay muchos clientes pequeños o pocos clientes grandes?',
      '¿Les cuesta cambiarse a la competencia?',
      '¿Son muy sensibles al precio?',
    ],
  },
  {
    key: 'poderProveedores',
    label: 'Poder de los proveedores',
    descripcion: 'Capacidad de los proveedores para imponer precios o condiciones.',
    preguntas: [
      '¿Hay muchos proveedores o dependes de pocos?',
      '¿Es fácil cambiar de proveedor?',
      '¿El insumo que te dan es crítico y difícil de reemplazar?',
    ],
  },
];

/** Escala de intensidad de una fuerza. */
export const ESCALA_INTENSIDAD = [
  { valor: 1, label: 'Muy baja' },
  { valor: 2, label: 'Baja' },
  { valor: 3, label: 'Media' },
  { valor: 4, label: 'Alta' },
  { valor: 5, label: 'Muy alta' },
];

/** Interpreta el promedio de intensidad como atractivo del sector. */
export function interpretarAtractivo(promedio: number): { texto: string; clase: string } {
  if (promedio <= 2) return { texto: 'Sector atractivo (baja presión competitiva)', clase: 'text-emerald-600' };
  if (promedio <= 3.5) return { texto: 'Sector con atractivo moderado', clase: 'text-amber-600' };
  return { texto: 'Sector poco atractivo (alta presión competitiva)', clase: 'text-rose-600' };
}
