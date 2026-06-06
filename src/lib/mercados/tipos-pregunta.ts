import type { TipoPregunta } from '@/types/mercados';

/**
 * Catálogo de tipos de pregunta para el diseñador de encuestas, con guía
 * pedagógica (conecta con las clases 6 y 7 de la academia).
 */
export interface TipoPreguntaMeta {
  id: TipoPregunta;
  label: string;
  icono: string;
  desc: string;
  usaOpciones: boolean;
  /** Opciones por defecto al crear (para Likert/escala). */
  opcionesDefault?: string[];
  guia: string;
}

export const TIPOS_PREGUNTA: TipoPreguntaMeta[] = [
  {
    id: 'opcion_unica',
    label: 'Opción única',
    icono: '◉',
    desc: 'El encuestado elige UNA opción',
    usaOpciones: true,
    opcionesDefault: ['Opción 1', 'Opción 2'],
    guia: 'Ideal para variables nominales (marca preferida, sí/no). Solo una respuesta posible.',
  },
  {
    id: 'opcion_multiple',
    label: 'Opción múltiple',
    icono: '☑',
    desc: 'Puede elegir VARIAS opciones',
    usaOpciones: true,
    opcionesDefault: ['Opción 1', 'Opción 2'],
    guia: 'Para "marca todas las que apliquen". Cuidado: dificulta calcular porcentajes sobre el total.',
  },
  {
    id: 'likert',
    label: 'Escala Likert',
    icono: '⭐',
    desc: 'Grado de acuerdo (1-5)',
    usaOpciones: true,
    opcionesDefault: [
      'Totalmente en desacuerdo',
      'En desacuerdo',
      'Neutral',
      'De acuerdo',
      'Totalmente de acuerdo',
    ],
    guia: 'La reina de los estudios de mercado (clase 7). Mide intensidad. Permite promediar y comparar ítems.',
  },
  {
    id: 'escala',
    label: 'Escala numérica',
    icono: '🔢',
    desc: 'Califica de 1 a N',
    usaOpciones: true,
    opcionesDefault: ['1', '2', '3', '4', '5'],
    guia: 'Para importancia o satisfacción en escala (ej. 1=nada importante a 5=muy importante).',
  },
  {
    id: 'abierta',
    label: 'Respuesta abierta',
    icono: '✍',
    desc: 'Texto libre',
    usaOpciones: false,
    guia: 'Útil para descubrir lo que no anticipaste. Requiere post-codificación al analizar (clase 9). Úsala poco.',
  },
  {
    id: 'numerica',
    label: 'Número',
    icono: '#',
    desc: 'Un valor numérico (edad, gasto…)',
    usaOpciones: false,
    guia: 'Para variables de razón (edad, ingreso, gasto). Permite todos los cálculos: promedio, mediana, etc.',
  },
];

export function getTipoPregunta(id: string): TipoPreguntaMeta | undefined {
  return TIPOS_PREGUNTA.find((t) => t.id === id);
}
