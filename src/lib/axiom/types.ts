export interface Pregunta {
  id: string;
  area: string;
  contenido: string;
  opciones: string[];
  respuesta_correcta: string;
  explicacion: string;
  dificultad: "facil" | "medio" | "dificil";
}

export interface Simulador {
  id: string;
  usuario_id: string;
  preguntas_generadas: Pregunta[];
  respuestas_usuario: Record<string, string>;
  estado: "activo" | "completado" | "calificado";
  fecha_inicio: string;
  fecha_fin?: string;
  nota_final?: number;
  desglose?: Record<string, number>;
  pregunta_texto?: string;
}

export interface ExamenConfig {
  id: string;
  nombre: string;
  areas: {
    nombre: string;
    cantidad: number;
    ponderacion: number;
  }[];
  tiempo_minutos: number;
  activo: boolean;
  creado: string;
}

export interface RespuestaUsuario {
  pregunta_id: string;
  respuesta: string;
  correcta: boolean;
  tiempo_segundos: number;
}

export interface PlanPersonalizado {
  id: string;
  usuario_id: string;
  simulador_id: string;
  area_debil: string;
  dias: {
    dia: number;
    tema: string;
    tiempo_minutos: number;
    ejercicios: number;
    descripcion: string;
  }[];
  generado: string;
  pdf_url?: string;
}
