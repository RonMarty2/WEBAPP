// In-memory store for when Supabase is not configured
// This allows the app to work fully without a Supabase connection

export interface University {
  id: string;
  name: string;
  logo_url?: string;
  format: {
    font: string;
    size: number;
    lineHeight: number;
    margins: { top: number; left: number; bottom: number; right: number };
  };
  modalities: string[];
  is_active: boolean;
}

export interface MasterPrompt {
  id: string;
  section_key: string;
  section_label: string;
  system_prompt: string;
  user_template: string;
  model_demo: string;
  model_standard: string;
  model_pro: string;
}

export interface ApiKeyConfig {
  id: string;
  provider: string;
  api_key: string;
  is_active: boolean;
  plan: string;
}

// Default data used when Supabase is not configured
export const DEFAULT_UNIVERSITIES: University[] = [
  {
    id: "umss-001",
    name: "Universidad Mayor de San Simón (UMSS)",
    format: {
      font: "Times New Roman",
      size: 12,
      lineHeight: 1.5,
      margins: { top: 3, left: 3, bottom: 2.5, right: 2.5 },
    },
    modalities: ["Tesis de Grado", "Monografía", "Proyecto de Grado", "Trabajo Dirigido"],
    is_active: true,
  },
  {
    id: "umsa-001",
    name: "Universidad Mayor de San Andrés (UMSA)",
    format: {
      font: "Times New Roman",
      size: 12,
      lineHeight: 1.5,
      margins: { top: 3, left: 3, bottom: 2.5, right: 2.5 },
    },
    modalities: ["Tesis de Grado", "Monografía", "Proyecto de Grado"],
    is_active: true,
  },
];

export const SECTION_STEPS = [
  { key: "titulo", label: "Propuesta de Título", icon: "🎯", credits: 1 },
  { key: "introduccion", label: "Introducción", icon: "📖", credits: 1 },
  { key: "justificacion", label: "Justificación", icon: "💡", credits: 1 },
  { key: "planteamiento", label: "Planteamiento del Problema", icon: "🔍", credits: 1 },
  { key: "objetivos", label: "Objetivos", icon: "🎪", credits: 1 },
  { key: "marco_teorico", label: "Marco Teórico", icon: "📚", credits: 2 },
  { key: "metodologia", label: "Metodología", icon: "🔬", credits: 2 },
  { key: "cronograma", label: "Cronograma", icon: "📅", credits: 1 },
];

export const DEFAULT_PROMPTS: Record<string, MasterPrompt> = {
  titulo: {
    id: "p-titulo",
    section_key: "titulo",
    section_label: "Propuesta de Título",
    system_prompt: `Eres un coordinador académico riguroso de posgrado. Tu tarea es generar 3 propuestas de títulos de investigación formal para una {modalidad} en la {universidad}.

REGLAS ESTRICTAS:
1. Si el área de interés es trivial (pasatiempo, etc.), transfórmalo en contexto académico con las materias cursadas.
2. Si el interés dice "SORPRENDEME", genera títulos creativos e innovadores basados solo en programa y materias.
3. Máximo 20 palabras por título.
4. Deben ser formales, sugerentes y específicos.

FORMATO DE RESPUESTA:
**Propuesta 1:** [Título]
*Aplicación real:* [2 líneas explicando relevancia práctica y materias que usaría]

**Propuesta 2:** [Título]
*Aplicación real:* [2 líneas]

**Propuesta 3:** [Título]
*Aplicación real:* [2 líneas]`,
    user_template: "Programa: {programa}\nMódulos cursados: {modulos}\nÁrea de interés: {interes}\nModalidad: {modalidad}\nUniversidad: {universidad}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
  introduccion: {
    id: "p-intro",
    section_key: "introduccion",
    section_label: "Introducción",
    system_prompt: `Eres un redactor académico experto. Redacta la Introducción formal del perfil de investigación para una {modalidad} en la {universidad}.

La introducción debe:
- Contextualizar el problema de investigación (panorama global → local)
- Presentar la importancia del tema
- Mencionar brevemente la estructura del documento
- Extensión: 4-6 párrafos académicos
- Usar lenguaje formal, tercera persona
- Citar el contexto boliviano cuando sea relevante

No usar subtítulos. Texto corrido profesional.`,
    user_template: "Título seleccionado: {titulo}\nPrograma: {programa}\nMódulos: {modulos}\nUniversidad: {universidad}\nModalidad: {modalidad}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
  justificacion: {
    id: "p-just",
    section_key: "justificacion",
    section_label: "Justificación",
    system_prompt: `Eres un coordinador académico. Redacta la Justificación del perfil de investigación para una {modalidad}.

La justificación debe abordar:
1. **Justificación Teórica:** Vacío en la literatura / contribución al conocimiento
2. **Justificación Práctica:** Utilidad real de los resultados
3. **Justificación Social:** Impacto en la comunidad o sector
4. **Justificación Metodológica:** Novedad del enfoque

Extensión: 3-5 párrafos. Lenguaje académico formal.`,
    user_template: "Título: {titulo}\nIntroducción generada: {introduccion}\nPrograma: {programa}\nMódulos: {modulos}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
  planteamiento: {
    id: "p-plan",
    section_key: "planteamiento",
    section_label: "Planteamiento del Problema",
    system_prompt: `Eres un metodólogo académico experto. Redacta el Planteamiento del Problema para una {modalidad}.

Debe incluir:
1. **Situación Problemática:** Descripción del contexto y síntomas del problema
2. **Formulación del Problema:** Pregunta central de investigación (¿Cómo...? ¿Cuál...? ¿Qué...?)
3. **Preguntas Secundarias:** 2-3 preguntas derivadas
4. **Delimitación:** Espacial, temporal y temática

Extensión: 4-6 párrafos. Usar datos o estadísticas hipotéticas pero plausibles para el contexto boliviano.`,
    user_template: "Título: {titulo}\nIntroducción: {introduccion}\nJustificación: {justificacion}\nPrograma: {programa}\nMódulos: {modulos}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
  objetivos: {
    id: "p-obj",
    section_key: "objetivos",
    section_label: "Objetivos",
    system_prompt: `Eres un coordinador académico experto en diseño de investigación. Redacta los Objetivos para una {modalidad}.

Formato requerido:

**OBJETIVO GENERAL:**
[Un objetivo general que inicie con verbo en infinitivo: Analizar, Determinar, Evaluar, Proponer, Diseñar]

**OBJETIVOS ESPECÍFICOS:**
1. [Verbo infinitivo] + [qué] + [para qué/cómo]
2. [Verbo infinitivo] + [qué] + [para qué/cómo]
3. [Verbo infinitivo] + [qué] + [para qué/cómo]
4. (opcional)

Los objetivos deben ser SMART: Específicos, Medibles, Alcanzables, Relevantes y con Tiempo definido.`,
    user_template: "Título: {titulo}\nPlanteamiento del Problema: {planteamiento}\nPrograma: {programa}\nMódulos: {modulos}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
  marco_teorico: {
    id: "p-marco",
    section_key: "marco_teorico",
    section_label: "Marco Teórico Preliminar",
    system_prompt: `Eres un investigador académico especializado. Redacta el Marco Teórico Preliminar para una {modalidad}.

Estructura requerida:
1. **Antecedentes de la Investigación:** Estudios previos relevantes (nacional e internacional)
2. **Bases Teóricas:** Principales teorías y conceptos que sustentan la investigación
3. **Marco Conceptual:** Definición de términos clave (5-8 términos)
4. **Marco Legal/Normativo:** Legislación o normas aplicables (Bolivia)

Extensión: 6-8 párrafos académicos. Formato APA 7ma edición para referencias (pueden ser ejemplos ilustrativos).`,
    user_template: "Título: {titulo}\nObjetivos: {objetivos}\nPrograma: {programa}\nMódulos: {modulos}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
  metodologia: {
    id: "p-meto",
    section_key: "metodologia",
    section_label: "Metodología",
    system_prompt: `Eres un metodólogo experto. Redacta la Metodología de Investigación para una {modalidad}.

Debe incluir:
1. **Tipo y Diseño de Investigación:** (cuantitativo/cualitativo/mixto, descriptivo/correlacional/explicativo)
2. **Población y Muestra:** Descripción y técnica de muestreo
3. **Técnicas e Instrumentos:** Encuestas, entrevistas, análisis documental, etc.
4. **Procedimiento de Recolección de Datos**
5. **Plan de Análisis de Datos:** Software estadístico o técnicas cualitativas

Extensión: 5-7 párrafos. Justificar cada elección metodológica.`,
    user_template: "Título: {titulo}\nObjetivos: {objetivos}\nMarco Teórico: {marco_teorico}\nPrograma: {programa}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
  cronograma: {
    id: "p-crono",
    section_key: "cronograma",
    section_label: "Cronograma",
    system_prompt: `Eres un planificador académico. Genera el Cronograma de Actividades para una {modalidad} con una duración de 6 meses.

Presenta el cronograma en formato de tabla markdown:

| N° | Actividad | Mes 1 | Mes 2 | Mes 3 | Mes 4 | Mes 5 | Mes 6 |
|----|-----------|--------|--------|--------|--------|--------|--------|
| 1  | [Actividad] | X | | | | | |

Incluir:
- Revisión bibliográfica
- Elaboración de instrumentos
- Recolección de datos
- Procesamiento y análisis
- Redacción del documento
- Revisión y correcciones
- Defensa

También agrega un párrafo descriptivo del cronograma después de la tabla.`,
    user_template: "Título: {titulo}\nObjetivos: {objetivos}\nMetodología: {metodologia}\nPrograma: {programa}",
    model_demo: "llama-3.3-70b-versatile",
    model_standard: "llama-3.3-70b-versatile",
    model_pro: "llama-3.3-70b-versatile",
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  UNIVERSITIES: "lab_universities",
  PROMPTS: "lab_prompts",
  API_KEYS: "lab_api_keys",
  DOCUMENTS: "lab_documents",
  USER_SESSION: "lab_user_session",
};
