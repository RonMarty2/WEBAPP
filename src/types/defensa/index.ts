/** Tipos del dominio del módulo Defensa. */

export type RolDefensa = 'docente' | 'estudiante';

export interface PerfilDefensa {
  id: string;
  nombre: string;
  apellido: string;
  rol: RolDefensa;
  email: string;
  universidad: string | null;
  es_admin: boolean;
  creado_en: string;
}

export type EstadoDefensa = 'preguntas' | 'simulacro' | 'reporte' | 'completo';

/** Una pregunta del banco de defensa. */
export interface Pregunta {
  id: string;
  categoria: string;     // Marco teórico, Metodología, Resultados, Viabilidad, Personal…
  pregunta: string;
  puntosClave: string;   // qué debería incluir una buena respuesta
}

export interface BancoPreguntas {
  items: Pregunta[];
}

/** Una respuesta del simulacro. Puntaje null = aún no evaluada por la IA. */
export interface RespuestaSimulacro {
  pregunta: string;
  categoria: string;
  respuesta: string;
  puntaje: number | null;   // 0-10 si evaluada; null si pendiente
  feedback: string;
}

export interface Simulacro {
  respuestas: RespuestaSimulacro[];
  promedio: number;
  fecha: string;     // ISO
}

export interface ProyectoDefensa {
  id: string;
  estudiante_id: string;
  titulo: string;
  tema: string | null;
  carrera: string | null;
  preguntas?: Partial<BancoPreguntas>;
  simulacro?: Partial<Simulacro>;
  estado: EstadoDefensa;
  creado_en: string;
  actualizado_en: string;
}
