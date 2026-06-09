/**
 * Tipos de casos bolivianos pre-resueltos.
 *
 * Los casos son ejemplos completos con datos reales contextualizados en
 * Bolivia (ciudad, rubro, segmento, hipótesis) que el estudiante puede
 * explorar ANTES de armar el suyo. Cada módulo tiene su propio tipo
 * porque las herramientas son distintas (Lean Canvas vs PESTEL vs FODA).
 *
 * Hay un tipo `CasoBase` con metadatos comunes (zona, rubro, dificultad,
 * lecciones) y luego cada módulo lo extiende con sus campos.
 *
 * Los casos viven en /src/lib/casos/<modulo>/*.ts y se exportan por un
 * index para que la galería los liste.
 */

export type DificultadCaso = "basico" | "intermedio" | "avanzado";

export type ModuloCaso =
  | "idea"
  | "mercados"
  | "estrategia"
  | "marketing"
  | "organizacion"
  | "defensa";

export interface Emprendedor {
  /** Nombre ficticio pero verosímil (Daniela Mamani, no Daniel Smith). */
  nombre: string;
  /** Edad o rango. */
  edad: number;
  /** Rol actual y/o trayectoria breve. */
  rol: string;
}

/**
 * Campos comunes a TODO caso, sin importar el módulo. Cada tipo
 * específico (CasoIdea, CasoMercados, etc.) extiende este.
 */
export interface CasoBase {
  /** Slug url-safe único (kebab-case). */
  slug: string;
  /** Módulo al que pertenece. */
  modulo: ModuloCaso;
  /** Título corto y comercial ("Almuerzos al toque"). */
  titulo: string;
  /** Frase de pitch (≤120 chars). */
  tagline: string;
  /** Ciudad o zona específica ("Sopocachi, La Paz"). */
  zona: string;
  /** Rubro general ("Alimentación", "EdTech"). */
  rubro: string;
  /** Para que el alumno elija casos a su nivel. */
  dificultad: DificultadCaso;
  /** Emoji opcional para acompañar el título. */
  emoji?: string;
  /**
   * Persona ficticia detrás de la idea. Da contexto humano y evita el
   * "una empresa" genérico que el usuario crítico.
   */
  emprendedor: Emprendedor;
  /** 2-3 párrafos del contexto. Cada elemento del array es un párrafo. */
  contexto: string[];
  /** Una sola oración: cuál es el problema central. */
  problema: string;
  /** Segmento objetivo en una oración. */
  segmento: string;
  /** Conclusión del análisis aplicado: ¿viable o no? ¿qué pivot? */
  conclusion: string;
  /** 3-5 takeaways aplicables a OTROS proyectos. */
  lecciones: string[];
  /** Qué NO hacer; errores que el alumno debe evitar. */
  errores_evitados: string[];
  /** Etiquetas para filtrar (ej. "delivery", "B2C", "MVP-rapido"). */
  tags: string[];
}

// ─── Módulo IDEA ─────────────────────────────────────────────────────────

export interface LeanCanvas {
  problema: string[];
  segmento: string;
  propuesta_unica: string;
  solucion: string[];
  canales: string[];
  flujo_ingresos: string[];
  estructura_costos: string[];
  metricas_clave: string[];
  ventaja_competitiva: string;
}

export interface PropuestaValor {
  /** Lo que el cliente quiere lograr. */
  trabajos_cliente: string[];
  /** Frustraciones y obstáculos del cliente. */
  dolores: string[];
  /** Beneficios que el cliente busca. */
  ganancias: string[];
  /** Tu oferta concreta. */
  productos: string[];
  /** Cómo alivias los dolores. */
  aliviadores: string[];
  /** Cómo generas las ganancias. */
  creadores: string[];
}

export interface HipotesisValidacion {
  hipotesis: string;
  experimento: string;
  metrica: string;
  resultado_esperado: string;
}

export interface Scorecard {
  /** ¿Lo quiere el cliente? */
  deseabilidad: number;
  /** ¿Lo podemos construir? */
  factibilidad: number;
  /** ¿Es rentable? */
  viabilidad: number;
  /** Resumen interpretativo de la nota. */
  nota: string;
}

export interface CasoIdea extends CasoBase {
  modulo: "idea";
  lean_canvas: LeanCanvas;
  propuesta_valor: PropuestaValor;
  validacion: {
    hipotesis: HipotesisValidacion[];
    /** Qué pasó cuando el emprendedor corrió el experimento. */
    resultado: string;
  };
  scorecard: Scorecard;
}

// Helper para chequear tipo en runtime cuando se carga un caso genérico.
export function esCasoIdea(c: CasoBase): c is CasoIdea {
  return c.modulo === "idea";
}

// ─── Módulo MERCADOS ─────────────────────────────────────────────────────

export type TipoEstudio = "exploratorio" | "descriptivo" | "causal";
export type EnfoqueEstudio = "cualitativo" | "cuantitativo" | "mixto";

export interface DisenoInvestigacion {
  /** Pregunta de investigación en formato interrogativo. */
  pregunta: string;
  /** Tipo de estudio según objetivo. */
  tipo: TipoEstudio;
  /** Enfoque metodológico. */
  enfoque: EnfoqueEstudio;
  /** Objetivo general en una oración. */
  objetivo_general: string;
  /** 3-5 objetivos específicos. */
  objetivos_especificos: string[];
  /** Hipótesis a contrastar (1-3). */
  hipotesis: string[];
}

export type TecnicaMuestreo =
  | "aleatorio_simple"
  | "estratificado"
  | "conglomerados"
  | "sistematico"
  | "por_conveniencia"
  | "bola_nieve";

export interface DisenoMuestral {
  /** Población objetivo definida con criterios concretos. */
  poblacion: string;
  /** Tamaño estimado de la población. */
  N_poblacion: number;
  /** Tamaño de muestra calculado. */
  n_muestra: number;
  /** Cómo se llegó al n (Cochran, Slovin, judgment). */
  formula_usada: string;
  /** Nivel de confianza usado (90/95/99). */
  nivel_confianza: number;
  /** Margen de error usado (típicamente 3-10%). */
  margen_error: number;
  /** Técnica de muestreo elegida. */
  tecnica: TecnicaMuestreo;
  /** Justificación de la técnica elegida. */
  justificacion_tecnica: string;
}

export type TipoPregunta =
  | "abierta"
  | "cerrada_si_no"
  | "opcion_multiple"
  | "likert"
  | "ranking"
  | "escala_numerica";

export interface PreguntaEncuesta {
  numero: number;
  texto: string;
  tipo: TipoPregunta;
  /** Opciones cuando aplica (Likert, opción múltiple). */
  opciones?: string[];
  /** Qué objetivo específico ataca esta pregunta. */
  objetivo_que_ataca?: string;
}

export interface ResultadoClave {
  /** Pregunta o variable analizada. */
  variable: string;
  /** Hallazgo cuantitativo principal. */
  hallazgo: string;
  /** Interpretación en lenguaje de negocio. */
  interpretacion: string;
}

export interface CasoMercados extends CasoBase {
  modulo: "mercados";
  diseno: DisenoInvestigacion;
  muestreo: DisenoMuestral;
  /** Selección representativa de preguntas (5-10) — no la encuesta completa. */
  encuesta: PreguntaEncuesta[];
  /** Canal y forma de recolección. */
  recoleccion: {
    canal: string;
    duracion_promedio_min: number;
    incentivo?: string;
    tasa_respuesta_pct: number;
  };
  /** 4-6 resultados clave del análisis. */
  resultados_clave: ResultadoClave[];
  /** Insight de cruce de variables (la "tabla cruzada" típica). */
  cruce_destacado: {
    variables: [string, string];
    hallazgo: string;
  };
  /** Recomendación final basada en datos. */
  recomendacion: string;
}

export function esCasoMercados(c: CasoBase): c is CasoMercados {
  return c.modulo === "mercados";
}

// ─── Módulo ESTRATEGIA ───────────────────────────────────────────────────

export interface FactorPESTEL {
  /** Nombre corto del factor (ej. "Inflación 2026"). */
  nombre: string;
  /** Descripción del factor en contexto boliviano. */
  descripcion: string;
  /** Impacto al proyecto: positivo (oportunidad) o negativo (amenaza). */
  impacto: "positivo" | "negativo" | "neutro";
  /** Magnitud 1-5. */
  intensidad: number;
  /** Acción recomendada o implicación. */
  implicacion: string;
}

export interface PESTEL {
  politico: FactorPESTEL[];
  economico: FactorPESTEL[];
  social: FactorPESTEL[];
  tecnologico: FactorPESTEL[];
  ecologico: FactorPESTEL[];
  legal: FactorPESTEL[];
}

export interface FuerzaPorter {
  /** Nivel de intensidad: bajo, medio, alto. */
  intensidad: "bajo" | "medio" | "alto";
  /** Justificación con 2-3 razones específicas. */
  justificacion: string[];
  /** Cómo el proyecto enfrenta esta fuerza. */
  estrategia: string;
}

export interface Porter {
  rivalidad: FuerzaPorter;
  nuevos_entrantes: FuerzaPorter;
  sustitutos: FuerzaPorter;
  poder_proveedores: FuerzaPorter;
  poder_clientes: FuerzaPorter;
  /** Resumen interpretativo del atractivo del sector (1-5). */
  atractivo_sector: number;
  /** Conclusión narrativa. */
  conclusion: string;
}

export interface CompetidorMPC {
  nombre: string;
  /** Notas 1-4 por factor crítico de éxito, en orden de FCE_FACTORES. */
  notas: number[];
  /** Total ponderado pre-calculado. */
  total_ponderado: number;
}

export interface MPC {
  /** Factores críticos de éxito (4-6) y su peso (suma=1). */
  factores: { nombre: string; peso: number }[];
  /** El proyecto evaluado más 2-3 competidores. */
  competidores: CompetidorMPC[];
  /** Conclusión: qué factores ganamos y cuáles perdemos. */
  conclusion: string;
}

export interface FODA {
  fortalezas: string[];
  oportunidades: string[];
  debilidades: string[];
  amenazas: string[];
}

export interface FODACruzado {
  /** Estrategias ofensivas (Fortalezas × Oportunidades). */
  fo: string[];
  /** Estrategias adaptativas (Debilidades × Oportunidades). */
  do: string[];
  /** Estrategias defensivas (Fortalezas × Amenazas). */
  fa: string[];
  /** Estrategias de supervivencia (Debilidades × Amenazas). */
  da: string[];
}

export type MatrizDeNivel3 = "BCG" | "Ansoff" | "PEYEA";

export interface MatrizNivel3 {
  tipo: MatrizDeNivel3;
  /** Posición elegida en la matriz (ej. "Estrella" en BCG, "Penetración" en Ansoff). */
  posicion: string;
  /** Justificación 1-2 párrafos. */
  justificacion: string;
  /** Implicación estratégica. */
  implicacion: string;
}

export interface FilaMCPE {
  estrategia: string;
  /** Notas 1-4 por cada factor, en orden de los factores PESTEL/FODA agregados. */
  notas: number[];
  /** Total ponderado pre-calculado. */
  total: number;
}

export interface MCPE {
  /** Factores y sus pesos (suma=1). */
  factores: { nombre: string; peso: number }[];
  /** Estrategias evaluadas (mínimo 3). */
  filas: FilaMCPE[];
  /** Estrategia ganadora. */
  estrategia_elegida: string;
  /** Por qué ganó. */
  justificacion: string;
}

export interface CasoEstrategia extends CasoBase {
  modulo: "estrategia";
  pestel: PESTEL;
  porter: Porter;
  mpc: MPC;
  foda: FODA;
  foda_cruzado: FODACruzado;
  matriz_nivel3: MatrizNivel3;
  mcpe: MCPE;
  /** Plan de acción concreto resultante. */
  plan_accion: string[];
}

export function esCasoEstrategia(c: CasoBase): c is CasoEstrategia {
  return c.modulo === "estrategia";
}

// ─── Módulo MARKETING ────────────────────────────────────────────────────

export interface BuyerPersona {
  /** Nombre ficticio del arquetipo (ej. "Carla la profesional joven"). */
  nombre: string;
  edad: number;
  ocupacion: string;
  ingreso_aprox: string;
  ubicacion: string;
  /** 3-5 motivaciones principales. */
  motivaciones: string[];
  /** 3-5 frustraciones / pain points. */
  frustraciones: string[];
  /** Canales donde la encuentras. */
  canales_consumo: string[];
  /** Frase que la persona diría sobre el producto. */
  cita: string;
  /** Objeción típica que tendría. */
  objecion_tipica: string;
}

export type CategoriaP = "Producto" | "Precio" | "Plaza" | "Promocion" | "Personas" | "Procesos" | "Evidencia_fisica";

export interface ElementoP {
  categoria: CategoriaP;
  /** Decisión concreta. */
  decision: string;
  /** Justificación (con cifras cuando aplique). */
  justificacion: string;
}

export interface PartidaPresupuesto {
  canal: string;
  monto_bs_mes: number;
  /** Resultado esperado (alcance, leads, conversiones). */
  resultado_esperado: string;
  /** Costo por lead estimado. */
  cpl_estimado_bs?: number;
}

export interface AccionCalendario {
  semana: number;
  /** Tipo de acción: post, anuncio, evento, email, etc. */
  tipo: string;
  /** Canal específico. */
  canal: string;
  /** Tema o copy resumido. */
  contenido: string;
}

export interface CasoMarketing extends CasoBase {
  modulo: "marketing";
  /** 2 buyer personas para mostrar segmentación. */
  buyer_personas: BuyerPersona[];
  /** Mix 4P o 7P según tipo de negocio. */
  mix: ElementoP[];
  /** Presupuesto mensual con desglose. */
  presupuesto: {
    total_bs_mes: number;
    desglose: PartidaPresupuesto[];
    /** ROAS proyectado (ingresos / inversión). */
    roas_proyectado: number;
  };
  /** Calendario editorial de 8-12 semanas. */
  calendario: AccionCalendario[];
  /** KPIs principales a monitorear. */
  kpis: string[];
}

export function esCasoMarketing(c: CasoBase): c is CasoMarketing {
  return c.modulo === "marketing";
}

// ─── Módulo ORGANIZACIÓN ─────────────────────────────────────────────────

export interface NodoOrganigrama {
  /** Cargo (ej. "Gerente General"). */
  cargo: string;
  /** Nombre del ocupante (ficticio). Opcional para puestos vacantes. */
  ocupante?: string;
  /** Reporta a este cargo (referencia por nombre de cargo). */
  reporta_a?: string;
  /** Cantidad de personas en ese cargo (default 1). */
  cantidad?: number;
}

export interface PuestoRRHH {
  cargo: string;
  responsabilidades: string[];
  requisitos: string[];
  /** Salario líquido mensual estimado en Bs. */
  salario_liquido_bs: number;
  /** Costo total para la empresa incluyendo aportes (~+25%). */
  costo_total_bs: number;
  /** Tipo de contrato: indefinido, plazo fijo, consultoría, etc. */
  tipo_contrato: string;
}

export interface ConstitucionLegal {
  /** Tipo de empresa (Unipersonal, SRL, SA, Asociación Civil). */
  tipo: string;
  /** Justificación de la elección. */
  justificacion: string;
  /** Capital social inicial Bs. */
  capital_social_bs: number;
  /** Trámites en orden (FUNDEMPRESA, Impuestos, NIT, AFP, etc.). */
  tramites: { nombre: string; institucion: string; costo_aprox_bs: number; plazo_dias: number }[];
  /** Régimen tributario elegido (General/RTS/RAU). */
  regimen_tributario: string;
}

export interface ProcesoTecnico {
  nombre: string;
  /** Pasos del proceso ordenados. */
  pasos: string[];
  /** Tiempo total estimado. */
  tiempo_total: string;
  /** Capacidad productiva (ej. "20 unidades/día"). */
  capacidad: string;
  /** Equipamiento necesario (con costos aproximados). */
  equipamiento: { item: string; costo_bs: number }[];
}

export interface BrandingInterno {
  /** Mision en 1 oracion. */
  mision: string;
  /** Vision en 1 oracion. */
  vision: string;
  /** 4-6 valores corporativos. */
  valores: string[];
  /** Cultura de trabajo (1 parrafo). */
  cultura: string;
  /** Identidad visual basica (colores, tipografia, estilo). */
  identidad_visual: {
    colores: string[];
    tipografia: string;
    tono_comunicacion: string;
  };
}

export interface CasoOrganizacion extends CasoBase {
  modulo: "organizacion";
  organigrama: NodoOrganigrama[];
  rrhh: PuestoRRHH[];
  /** Costo total mensual de la planilla. */
  planilla_total_bs: number;
  legal: ConstitucionLegal;
  tecnico: ProcesoTecnico;
  branding: BrandingInterno;
}

export function esCasoOrganizacion(c: CasoBase): c is CasoOrganizacion {
  return c.modulo === "organizacion";
}

// ─── Módulo DEFENSA ──────────────────────────────────────────────────────

export type CategoriaPreguntaTribunal =
  | "problema"
  | "metodologia"
  | "marco_teorico"
  | "resultados"
  | "conclusiones"
  | "viabilidad"
  | "personal";

export type DificultadPregunta = "facil" | "media" | "dificil" | "trampa";

export interface PreguntaTribunal {
  numero: number;
  categoria: CategoriaPreguntaTribunal;
  pregunta: string;
  dificultad: DificultadPregunta;
  /** Respuesta modelo del estudiante. */
  respuesta_modelo: string;
  /** Por qué el tribunal preguntaría esto (qué evalúa). */
  que_evalua: string;
  /** Trampa común si la hay (cosas a NO decir). */
  trampa_evitar?: string;
}

export interface PuntoDefendible {
  /** Descripción de la debilidad/fortaleza. */
  punto: string;
  /** Cómo defenderlo / cómo resaltarlo. */
  como_manejarlo: string;
  /** Frase clave que puedes decir literal. */
  frase_clave?: string;
}

export interface DatosProyectoDefendido {
  /** Carrera de pregrado. */
  carrera: string;
  /** Universidad y sede. */
  universidad: string;
  /** Modalidad (tesis, proyecto de grado, etc.). */
  modalidad: string;
  /** Título del proyecto. */
  titulo: string;
  /** Resumen del proyecto en 2-3 oraciones. */
  resumen_proyecto: string;
  /** Año de defensa. */
  ano: number;
}

export interface CasoDefensa extends CasoBase {
  modulo: "defensa";
  proyecto: DatosProyectoDefendido;
  /** 15-20 preguntas con respuesta modelo. */
  preguntas: PreguntaTribunal[];
  /** 3-5 puntos débiles del proyecto y cómo manejarlos. */
  puntos_debiles: PuntoDefendible[];
  /** 3-5 fortalezas del proyecto y cómo resaltarlas. */
  fortalezas: PuntoDefendible[];
  /** Consejo final del caso (1 párrafo de cierre). */
  cierre: string;
}

export function esCasoDefensa(c: CasoBase): c is CasoDefensa {
  return c.modulo === "defensa";
}
