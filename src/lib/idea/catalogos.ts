/**
 * Catálogos para "Define tu idea": modalidades de trabajo final y universidades.
 *
 * Las modalidades vienen de guías oficiales reales (UMSS Posgrado FCE,
 * UNIFRANZ) + las comunes en Bolivia. NO es una lista cerrada: la pantalla
 * siempre ofrece "Otra…" con input libre, porque cada universidad y carrera
 * tiene sus propias variantes.
 */

export interface Modalidad {
  valor: string;       // lo que se guarda
  label: string;       // lo que se muestra
  ayuda?: string;      // descripción corta
}

export const MODALIDADES: Modalidad[] = [
  { valor: 'Monografía', label: 'Monografía', ayuda: 'Documento académico estructurado por capítulos (diplomado/especialidad).' },
  { valor: 'Tesis', label: 'Tesis', ayuda: 'Investigación con método científico e hipótesis (grado o maestría).' },
  { valor: 'Proyecto de Grado', label: 'Proyecto de Grado', ayuda: 'Plan de negocio / estudio de factibilidad (producción o servicios).' },
  { valor: 'Trabajo Dirigido', label: 'Trabajo Dirigido', ayuda: 'Trabajo aplicado en una institución o empresa real.' },
  { valor: 'Exploración Investigativa e Intervención', label: 'Exploración Investigativa e Intervención', ayuda: 'Diagnóstico situacional + propuesta de intervención (UMSS Posgrado FCE).' },
  { valor: 'Taller de Simulación', label: 'Taller de Simulación', ayuda: 'Informe descriptivo de un taller de simulación (UMSS Posgrado FCE).' },
  { valor: 'Examen de Grado', label: 'Examen de Grado', ayuda: 'Preparación para defensa oral / examen de competencias.' },
  { valor: 'Artículo de investigación', label: 'Artículo de investigación', ayuda: 'Paper para revista académica.' },
];

export const UNIVERSIDADES: string[] = [
  'UMSS — Universidad Mayor de San Simón',
  'UMSA — Universidad Mayor de San Andrés',
  'UAGRM — Universidad Autónoma Gabriel René Moreno',
  'UATF — Universidad Autónoma Tomás Frías',
  'UAJMS — Universidad Autónoma Juan Misael Saracho',
  'UCB — Universidad Católica Boliviana',
  'UPB — Universidad Privada Boliviana',
  'UNIFRANZ — Universidad Privada Franz Tamayo',
  'UCATEC — Universidad Católica Boliviana (UCATEC)',
  'UDABOL — Universidad de Aquino Bolivia',
  'EMI — Escuela Militar de Ingeniería',
];
