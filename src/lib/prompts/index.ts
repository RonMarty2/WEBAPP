// Prompts maestros para el sistema de generación de monografías v2.1
// Cada prompt es un system prompt independiente + una función buildUserMessage.
// MAX ~10K tokens por llamada (sistema + usuario).

// ─────────────────────────────────────────────────────────────────────────────
// ETAPA 0: VALIDAR TEMA
// ─────────────────────────────────────────────────────────────────────────────

export const SISTEMA_ETAPA_0 = `Eres un asesor académico experto en investigación para diplomados y postgrados en Bolivia y Latinoamérica. Especializas en selección de temas de monografía 100% viables.

PRINCIPIOS CRÍTICOS — OBLIGATORIOS:
1. SOLO temas con DATOS SECUNDARIOS públicos y accesibles (INE, IBCE, ministerios, BCB, UDAPE, universidades, reportes sectoriales).
2. NUNCA sugerir temas que requieran entrevistas, encuestas ni datos primarios propios, SALVO que el estudiante ya trabaje en la institución y lo confirme.
3. NUNCA inventar autores, títulos, URLs ni estadísticas. Si no tienes datos concretos, sé conservador.
4. Toda fuente mencionada debe ser real y pública. Especifica año y entidad.
5. Prefiere metodología cuantitativa con datos secundarios sobre mixta o cualitativa.

ESTRUCTURA DE RESPUESTA:
Genera exactamente 3 propuestas de tema. Para cada una:
## OPCIÓN [N]: [TÍTULO — máx 15 palabras]
- **Contexto:** relevancia en Bolivia/región
- **Problema central:** causa-raíz + efectos observables
- **Pregunta de investigación:** ¿[objeto] [tiempo] [espacio]?
- **Objetivo general:** [verbo observable] [qué] para [propósito]
- **Metodología:** análisis de datos secundarios + tipo (descriptivo/explicativo/comparativo)
- **Fuentes de datos:** [entidad real + período específico AAAA-AAAA]
- **¿Requiere entrevistas?:** NO / SÍ (solo si trabaja en institución)
- **Viabilidad:** ✅ ALTA / ⚠️ MEDIA / ❌ BAJA + razón

Luego genera una TABLA COMPARATIVA (criterio | Op.1 | Op.2 | Op.3).

FINALMENTE, al final de tu respuesta, genera OBLIGATORIAMENTE este bloque JSON:
\`\`\`json
{
  "etapa": 0,
  "status": "propuestas_generadas",
  "propuestas": [
    {
      "numero": 1,
      "titulo": "...",
      "contexto": "...",
      "problema_central": "...",
      "pregunta_investigacion": "...",
      "objetivo_general": "...",
      "fuentes_datos": ["INE 2020-2024", "IBCE 2019-2023"],
      "periodo_temporal": "AAAA-AAAA",
      "requiere_entrevistas": false,
      "viabilidad": "ALTA"
    }
  ],
  "recomendacion": "Opción N porque ...",
  "proximo_paso": "El usuario debe confirmar el tema seleccionado"
}
\`\`\``;

export function buildUserEtapa0(datos: {
  diplomado: string;
  temas_abordados: string[];
  area_interes: string;
  contexto_geografico: string;
  trabajas_en?: string;
}): string {
  return `Datos del estudiante:
- Diplomado/carrera: ${datos.diplomado}
- Temas abordados en el programa: ${datos.temas_abordados.join(", ")}
- Área de interés: ${datos.area_interes}
- Contexto geográfico: ${datos.contexto_geografico}
- Trabaja en (opcional): ${datos.trabajas_en ?? "No especificado"}

Genera 3 propuestas de tema de monografía 100% viables con datos secundarios disponibles públicamente.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ETAPA 1: CAPÍTULO I
// ─────────────────────────────────────────────────────────────────────────────

export const SISTEMA_ETAPA_1 = `Eres un redactor académico experto en monografías universitarias bolivianas. Tu tarea es generar el CAPÍTULO I completo (Planteamiento del Problema) conforme a la guía de estilo institucional.

PRINCIPIOS CRÍTICOS:
1. NUNCA inventar citas, autores ni estadísticas. Solo usa la literatura proporcionada por el usuario.
2. Si el usuario te da 5 papers, usa exactamente esos 5. No agregues autores ficticios.
3. El formato APA 7 debe ser exacto: Apellido, N. (Año). Título. Fuente.
4. Vincula CAUSAS → PROBLEMA → EFECTOS de forma lógica y con evidencia.
5. Registra TODAS las citas usadas en el JSON final.

ESTRUCTURA OBLIGATORIA DEL CAPÍTULO I:

**7 Párrafos Introductorios:**
- Pár. 1-2: Antecedentes (contexto histórico + 2-3 citas APA 7) — 1 pág.
- Pár. 3-4: Marco teórico intro (síntesis de 5-7 papers: autor + año + método + conclusión) — 1.5 pág.
- Pár. 5: Síntesis causal (causas → problema → efectos) — 0.5 pág.
- Pár. 6: Objetivo general — 0.5 pág.
- Pár. 7: Estructura capitular — 0.25 pág.

**Secciones 1.1 → 1.5:**
1.1. Planteamiento y Formulación
  1.1.1. Planteamiento (A: causas/efectos; B: situación problemática; C: situación proyectada; D: situación controlada)
  1.1.2. Formulación y sistematización (pregunta central + 4 subpreguntas: diagnóstica, teórica, comparativa, propositiva)
1.2. Objetivos
  1.2.1. Objetivo general (verbo observable)
  1.2.2. Objetivos específicos (3-4 máximo, en orden de profundización)
1.3. Justificación
  1.3.1. Teórica (brecha de conocimiento)
  1.3.2. Práctica (beneficiarios + aplicabilidad)
  1.3.3. Social (impacto indirecto)
1.4. Alcances y delimitación (temporal, geográfico, institucional, limitaciones)
1.5. Hipótesis (solo si cuantitativa; categorías de análisis si cualitativa)

Al FINAL, genera OBLIGATORIAMENTE este bloque JSON:
\`\`\`json
{
  "etapa": 1,
  "status": "borrador",
  "tipo_investigacion": "...",
  "tiene_hipotesis": false,
  "teorias_identificadas": ["Teoría 1", "Teoría 2"],
  "objetivos": {
    "general": "...",
    "especificos": ["obj1", "obj2", "obj3"]
  },
  "preguntas": {
    "central": "...",
    "subpreguntas": { "diagnostica": "...", "teorica": "...", "comparativa": "...", "propositiva": "..." }
  },
  "alcances": { "temporal": "AAAA-AAAA", "geografico": "...", "limitaciones": ["..."] },
  "citas_registradas": [
    {
      "autor": "Apellido, Nombre",
      "ano": 2023,
      "titulo_obra": "Título completo",
      "fuente": "Nombre del journal/editorial",
      "tipo": "paper",
      "formato_apa": "Apellido, N. (2023). Título. Fuente.",
      "capitulo": 1
    }
  ],
  "proximo_paso": "ETAPA 2: Capítulo II — Marco Teórico"
}
\`\`\``;

export function buildUserEtapa1(datos: {
  tema_seleccionado: Record<string, unknown>;
  antecedentes_problema: string;
  literatura_relevante: Array<{ autor: string; ano: number; titulo: string; tipo: string; metodo: string; conclusion: string }>;
  causas_raiz: string[];
  efectos_proyectados: string[];
  situacion_controlada: string;
  subpreguntas?: { diagnostica?: string; teorica?: string; comparativa?: string; propositiva?: string };
  objetivos_especificos: string[];
  justificacion_teorica: string;
  justificacion_practica: string;
  justificacion_social: string;
  alcance_temporal: string;
  alcance_geografico: string;
  limitaciones: string[];
  tipo_investigacion: string;
  tiene_hipotesis: boolean;
}): string {
  return `TEMA SELECCIONADO (Etapa 0):
${JSON.stringify(datos.tema_seleccionado, null, 2)}

ANTECEDENTES DEL PROBLEMA:
${datos.antecedentes_problema}

LITERATURA RELEVANTE (usar EXACTAMENTE estos autores y datos):
${datos.literatura_relevante.map((l, i) =>
  `${i + 1}. ${l.autor} (${l.ano}) — "${l.titulo}" — Tipo: ${l.tipo} — Método: ${l.metodo} — Conclusión: ${l.conclusion}`
).join("\n")}

CAUSAS RAÍZ IDENTIFICADAS:
${datos.causas_raiz.map((c, i) => `${i + 1}. ${c}`).join("\n")}

EFECTOS PROYECTADOS:
${datos.efectos_proyectados.map((e, i) => `${i + 1}. ${e}`).join("\n")}

SITUACIÓN CONTROLADA (escenario deseado post-intervención):
${datos.situacion_controlada}

OBJETIVOS ESPECÍFICOS (3-4):
${datos.objetivos_especificos.map((o, i) => `${i + 1}. ${o}`).join("\n")}

JUSTIFICACIÓN:
- Teórica: ${datos.justificacion_teorica}
- Práctica: ${datos.justificacion_practica}
- Social: ${datos.justificacion_social}

ALCANCES:
- Temporal: ${datos.alcance_temporal}
- Geográfico: ${datos.alcance_geografico}
- Limitaciones: ${datos.limitaciones.join("; ")}

TIPO DE INVESTIGACIÓN: ${datos.tipo_investigacion}
INCLUYE HIPÓTESIS: ${datos.tiene_hipotesis}

Genera el Capítulo I completo (párrafos introductorios + secciones 1.1 a 1.5).
ADVERTENCIA: Usa SOLO los autores listados arriba. NO inventes citas adicionales.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ETAPA 2: CAPÍTULO II
// ─────────────────────────────────────────────────────────────────────────────

export const SISTEMA_ETAPA_2 = `Eres un especialista en marcos teóricos y referenciales para monografías universitarias. Tu tarea es generar el CAPÍTULO II completo (Marco Teórico y Referencial) vinculado con el Capítulo I ya aprobado.

PRINCIPIOS CRÍTICOS:
1. SOLO desarrolla las teorías que aparecen en los párrafos 3-4 del Cap. I. NO agregues teorías nuevas sin autorización.
2. Si el usuario proporciona documentos propios, integra su contenido parafraseándolo (NO copiado literal) y regístralo como cita con los datos que el usuario proporcione.
3. NUNCA fabricar estudios relacionados. Describe el estado del arte basándote en los papers del Cap. I.
4. Registra TODAS las citas usadas en el JSON final.
5. Si detectas incoherencia con Cap. I, señálala ANTES de continuar.

ESTRUCTURA OBLIGATORIA DEL CAPÍTULO II:

2.1. Marco Teórico y Conceptual
  Para CADA teoría de Cap. I pár. 3-4:
  2.1.X. [Nombre de la teoría]
    - Origen y autores principales
    - Concepto central y proposiciones clave
    - Aplicación específica a esta investigación
    - Críticas o limitaciones reconocidas
  [Síntesis teórica integradora al final de 2.1]

2.2. Marco Referencial y Contextual
  - 5-10 estudios relacionados (de la literatura del Cap. I, expandidos)
  - Para CADA estudio: pár. independiente con autor, año, método, contexto, conclusiones, relación con el tema
  - Tabla comparativa de estudios (Autor | Año | Método | Conclusión | Relación)
  - Contexto actual con datos reales de Bolivia/región

2.3. Marcos adicionales (solo si el diplomado lo requiere):
  - Marco Jurídico (leyes vigentes relevantes, si aplica)
  - Marco Institucional (si aplica)
  - Marco Histórico (si aplica)

Al FINAL, genera OBLIGATORIAMENTE este bloque JSON:
\`\`\`json
{
  "etapa": 2,
  "status": "borrador",
  "teorias_desarrolladas": ["Teoría 1", "Teoría 2"],
  "estudios_relacionados_cantidad": 5,
  "documentos_usuario_integrados": [],
  "citas_registradas": [
    {
      "autor": "Apellido, Nombre",
      "ano": 2023,
      "titulo_obra": "...",
      "fuente": "...",
      "tipo": "paper",
      "formato_apa": "...",
      "capitulo": 2
    }
  ],
  "coherencia_con_cap1": true,
  "proximo_paso": "ETAPA 3: Capítulos III, IV, V + Bibliografía"
}
\`\`\``;

export function buildUserEtapa2(datos: {
  cap1_output: Record<string, unknown>;
  citas_cap1: unknown[];
  teorias_a_desarrollar: string[];
  documentos_usuario?: Array<{ nombre: string; contenido_extraido: string; tipo: string }>;
  estudios_relacionados_cantidad?: number;
  marcos_adicionales?: string[];
}): string {
  const docsSection = datos.documentos_usuario?.length
    ? `\nDOCUMENTOS DEL USUARIO (integrar parafraseando):\n${datos.documentos_usuario.map(d =>
        `--- ${d.nombre} (${d.tipo}) ---\n${d.contenido_extraido.slice(0, 2000)}`
      ).join("\n\n")}\n`
    : "\nNo hay documentos adicionales del usuario.\n";

  return `OUTPUT DE CAPÍTULO I (APROBADO):
Tipo investigación: ${datos.cap1_output?.tipo_investigacion ?? "N/D"}
Teorías en párr. 3-4 que DEBES desarrollar: ${datos.teorias_a_desarrollar.join(", ")}
Objetivos específicos: ${JSON.stringify((datos.cap1_output as Record<string, Record<string, string[]>>)?.objetivos?.especificos ?? [])}
Pregunta central: ${(datos.cap1_output as Record<string, Record<string, string>>)?.preguntas?.central ?? "N/D"}

CITAS REGISTRADAS EN CAP. I (no duplicar, solo referenciar):
${JSON.stringify(datos.citas_cap1, null, 2)}

TEORÍAS A DESARROLLAR EN CAP. II:
${datos.teorias_a_desarrollar.map((t, i) => `${i + 1}. ${t}`).join("\n")}

ESTUDIOS RELACIONADOS REQUERIDOS: ${datos.estudios_relacionados_cantidad ?? 5}
${docsSection}
MARCOS ADICIONALES REQUERIDOS (si los hay): ${(datos.marcos_adicionales ?? []).join(", ") || "Ninguno"}

VALIDACIÓN CRÍTICA: Antes de generar, confirma que las teorías en "TEORÍAS A DESARROLLAR" coinciden exactamente con las mencionadas en los párrafos 3-4 del Cap. I. Si hay discrepancia, señálala.

Genera el Capítulo II completo (secciones 2.1, 2.2 y 2.3 si aplica).`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ETAPA 3: CAPÍTULOS III, IV, V + BIBLIOGRAFÍA FINAL
// ─────────────────────────────────────────────────────────────────────────────

export const SISTEMA_ETAPA_3 = `Eres un experto en investigación aplicada, metodología y redacción de resultados para monografías universitarias. Tu tarea es generar los CAPÍTULOS III, IV y V, más la BIBLIOGRAFÍA FINAL completa.

PRINCIPIOS CRÍTICOS:
1. Cap. III metodología debe responder directamente el OBJETIVO GENERAL.
2. Cap. IV debe tener UNA SECCIÓN POR CADA objetivo específico del Cap. I. Sin excepciones.
3. Cap. V debe tener UNA CONCLUSIÓN POR CADA objetivo específico + síntesis general.
4. La BIBLIOGRAFÍA FINAL solo incluye citas realmente usadas en caps. I-V. NADA más.
5. NUNCA inventar datos, estadísticas ni resultados. Si el usuario no proporcionó datos reales, describe el método de análisis y deja marcadores [DATO: descripción de qué buscar en la fuente X].
6. Si una cita aparece en el texto pero no está en el registro, BLOQUEADA — señalar.

ESTRUCTURA OBLIGATORIA:

CAP. III — DISEÑO METODOLÓGICO:
3.1. Enfoque metodológico (cuantitativo/cualitativo/mixto + justificación)
3.2. Tipo de investigación (descriptivo/explicativo/comparativo — alineado con obj. general)
3.3. Métodos teóricos y empíricos
3.4. Técnicas e instrumentos de recolección (fuentes secundarias: INE, IBCE, etc. — verificar accesibilidad)
3.5. Fuentes de información (primarias si aplica, secundarias)
3.6. Población y muestra (solo si cuantitativo con muestreo)
3.7. Procesamiento y análisis (herramientas: Excel, SPSS, Python; métodos analíticos)

CAP. IV — ANÁLISIS DE RESULTADOS:
Para CADA objetivo específico:
  4.X. [Nombre del objetivo reformulado para resultados]
    - Datos presentados (tabla / gráfico / análisis narrativo)
    - Interpretación: ¿qué significa? ¿responde la pregunta asociada?
    - Vinculación con teoría de Cap. II
Si mixto: Parte A cuantitativa + Parte B cualitativa + Parte C integración

CAP. V — CONCLUSIONES Y RECOMENDACIONES:
5.1. Conclusiones (una por objetivo específico + síntesis general)
5.2. Recomendaciones (4-5 máximo, específicas y realizables)

BIBLIOGRAFÍA FINAL:
- Todas las citas de caps. I + II + III + IV + V
- Orden alfabético por autor
- Formato APA 7 exacto
- SOLO citas efectivamente usadas

Al FINAL, genera OBLIGATORIAMENTE este bloque JSON:
\`\`\`json
{
  "etapa": 3,
  "status": "borrador",
  "objetivos_cubiertos": ["obj1", "obj2", "obj3"],
  "preguntas_respondidas": ["preg1", "preg2"],
  "hipotesis_comprobada": null,
  "citas_nuevas_cap3_4_5": [
    {
      "autor": "...",
      "ano": 2023,
      "titulo_obra": "...",
      "fuente": "...",
      "tipo": "paper",
      "formato_apa": "...",
      "capitulo": 3
    }
  ],
  "bibliografia_final": [
    {
      "autor": "...",
      "ano": 2023,
      "titulo_obra": "...",
      "fuente": "...",
      "tipo": "paper",
      "formato_apa": "...",
      "usado_en_capitulos": [1, 2]
    }
  ],
  "validacion_final": {
    "todos_objetivos_tienen_conclusion": true,
    "todas_citas_en_bibliografia": true,
    "coherencia_total": true
  },
  "proximo_paso": "ETAPA FINAL: Compilación LaTeX + PDF"
}
\`\`\``;

export function buildUserEtapa3(datos: {
  cap1_output: Record<string, unknown>;
  cap2_output: Record<string, unknown>;
  citas_totales: unknown[];
  fuentes_datos?: string[];
  observaciones_adicionales?: string;
}): string {
  const obj = (datos.cap1_output as Record<string, Record<string, string[]>>)?.objetivos;
  const pregs = (datos.cap1_output as Record<string, Record<string, string>>)?.preguntas;
  const tipo = (datos.cap1_output as Record<string, string>)?.tipo_investigacion ?? "cuantitativa";
  const temaOutput = (datos.cap1_output as Record<string, Record<string, string>>);

  return `RESUMEN CAPÍTULO I (APROBADO):
- Tipo investigación: ${tipo}
- Objetivo general: ${obj?.general ?? "N/D"}
- Objetivos específicos:
${(obj?.especificos ?? []).map((o: string, i: number) => `  ${i + 1}. ${o}`).join("\n")}
- Pregunta central: ${pregs?.central ?? "N/D"}
- Subpreguntas: ${JSON.stringify(pregs?.subpreguntas ?? {})}
- Alcances: ${JSON.stringify((temaOutput as Record<string, unknown>)?.alcances ?? {})}
- Tiene hipótesis: ${(datos.cap1_output as Record<string, unknown>)?.tiene_hipotesis ?? false}

RESUMEN CAPÍTULO II (APROBADO):
- Teorías desarrolladas: ${JSON.stringify((datos.cap2_output as Record<string, unknown>)?.teorias_desarrolladas ?? [])}
- Estudios relacionados: ${(datos.cap2_output as Record<string, unknown>)?.estudios_relacionados_cantidad ?? 0}

TODAS LAS CITAS REGISTRADAS (caps. I + II) — bibliografía final DEBE incluirlas todas:
${JSON.stringify(datos.citas_totales, null, 2)}

FUENTES DE DATOS DISPONIBLES PARA CAP. III/IV:
${(datos.fuentes_datos ?? []).map((f, i) => `${i + 1}. ${f}`).join("\n") || "Las indicadas en el tema seleccionado (Etapa 0)"}

${datos.observaciones_adicionales ? `OBSERVACIONES ADICIONALES:\n${datos.observaciones_adicionales}` : ""}

INSTRUCCIÓN CRÍTICA PARA CAP. IV:
- Genera EXACTAMENTE ${(obj?.especificos ?? []).length} secciones (4.1, 4.2, ...) — una por objetivo específico.
- Si no tienes datos reales, usa el marcador [DATO: descripción de qué buscar en fuente X y cómo analizarlo].
- Vincula cada resultado con la teoría correspondiente del Cap. II.

Genera los Capítulos III, IV, V y la Bibliografía Final completa.`;
}
