/**
 * Fortalecimiento analítico — bloque inyectado al userPrompt cuando se
 * genera una fase clasificada como "analitica" (Cap IV monografía,
 * PESTEL/Porter/matrices/financiero/evaluación de proyecto grado, etc.)
 *
 * Obliga a la IA a producir:
 *   1. TABLAS markdown bien estructuradas (NIVEL 1)
 *   2. GRÁFICOS pgfplots/TikZ que el compilador LaTeX renderiza como
 *      gráficos profesionales reales en el PDF final (NIVEL 2)
 *   3. INDICACIONES VISUALES específicas para el estudiante (qué foto
 *      sacar, qué dato calcular, qué hoja Excel construir)
 *
 * Esto resuelve el bug crítico: "no veo nada de análisis, gráficos,
 * figuras, tablas". La IA actual describe pero no muestra. Con este
 * bloque inyectado, la IA queda OBLIGADA a generar visualizaciones.
 *
 * Server-only. Solo importar desde API routes.
 */

/**
 * Bloque base que aplica a TODAS las fases analíticas.
 */
export const FORTALECIMIENTO_ANALITICO_BASE = `
═══════════════════════════════════════════════════════════════
INSTRUCCIÓN ANALÍTICA REFORZADA — TABLAS Y GRÁFICOS OBLIGATORIOS
═══════════════════════════════════════════════════════════════

Esta fase requiere ANÁLISIS DE DATOS visualizable. Texto descriptivo
SOLO no es aceptable. La IA debe producir SIEMPRE:

───────────────────────────────────────────────────────────────
A) TABLAS EN MARKDOWN (mínimo 2 por sección analítica)
───────────────────────────────────────────────────────────────

Cada tabla debe:
- Tener encabezados claros con unidad de medida cuando aplique
  (ej: "Ingresos (Bs.)", "Población (miles hab.)", "Variación (%)")
- Incluir fila de TOTAL/PROMEDIO cuando aplique
- Ir SIEMPRE acompañada de un caption tipo:
  **Tabla N. Nombre descriptivo del análisis**
  Fuente: <especificar fuente real o "Elaboración propia con datos de X">
- Ser numeradas correlativamente (Tabla 1, Tabla 2, ...)

EJEMPLO CORRECTO:
**Tabla 1. Evolución de exportaciones no tradicionales (2020-2024)**

| Año  | Soya (MM USD) | Quinua (MM USD) | Total ENT | Variación % |
|------|---------------|------------------|-----------|-------------|
| 2020 | 500           | 80               | 580       | —           |
| 2021 | 600           | 95               | 695       | +19.8%      |
| 2022 | 720           | 110              | 830       | +19.4%      |
| 2023 | 815           | 125              | 940       | +13.3%      |
| 2024 | 890           | 140              | 1,030     | +9.6%       |

Fuente: Elaboración propia con datos del INE Bolivia y IBCE.

───────────────────────────────────────────────────────────────
B) GRÁFICOS PGFPLOTS/TIKZ (mínimo 1 por sección analítica)
───────────────────────────────────────────────────────────────

Cuando los datos de una tabla pidan ser visualizados (tendencias,
comparativas, distribuciones), genera código pgfplots/TikZ dentro
de un bloque de código LaTeX. El compilador renderizará un gráfico
profesional REAL en el PDF.

Formato OBLIGATORIO:

\`\`\`latex
\\begin{figure}[H]
  \\centering
  \\begin{tikzpicture}
    \\begin{axis}[
      title={Título descriptivo},
      xlabel={Etiqueta X},
      ylabel={Etiqueta Y (unidad)},
      ybar,
      bar width=20pt,
      width=12cm, height=7cm,
      symbolic x coords={cat1, cat2, cat3},
      xtick=data,
      nodes near coords,
      enlarge x limits=0.25,
    ]
    \\addplot coordinates {(cat1, valor1) (cat2, valor2) (cat3, valor3)};
    \\end{axis}
  \\end{tikzpicture}
  \\caption{Figura N. Descripción + Fuente.}
  \\label{fig:nombre-descriptivo}
\\end{figure}
\`\`\`

TIPOS DE GRÁFICO permitidos (elige el que mejor represente los datos):
- \`ybar\` / \`xbar\`        → comparativas categóricas (productos, regiones, años)
- \`line\` (axis por defecto) → tendencias temporales (años, meses)
- \`pie\` (con \\usepackage{pgf-pie}) → distribuciones porcentuales (segmentos de mercado)
- \`scatter\`               → correlaciones (precio vs demanda)
- \`stacked ybar\`           → composición evolutiva (mix de productos por año)

EJEMPLO REAL para una sección de exportaciones:

\`\`\`latex
\\begin{figure}[H]
  \\centering
  \\begin{tikzpicture}
    \\begin{axis}[
      title={Evolución de exportaciones no tradicionales},
      xlabel={Año},
      ylabel={Millones USD},
      width=13cm, height=7cm,
      legend pos=north west,
      grid=both,
    ]
    \\addplot[mark=*, blue, thick] coordinates {(2020,580) (2021,695) (2022,830) (2023,940) (2024,1030)};
    \\addlegendentry{Exportaciones totales ENT}
    \\end{axis}
  \\end{tikzpicture}
  \\caption{Figura 1. Evolución 2020-2024. Fuente: INE Bolivia, IBCE.}
  \\label{fig:ent-evolucion}
\\end{figure}
\`\`\`

REGLAS CRÍTICAS de gráficos:
- USA datos REALES de la tabla precedente, no inventes números nuevos
- Los nombres de categorías/coordenadas no deben tener comillas dobles ni
  caracteres especiales sin escapar
- Si la fase tiene VARIAS tablas, cada tabla numérica DEBE tener su gráfico
- Cada gráfico debe tener caption + label únicos
- Después de cada gráfico, agrega un párrafo de "INTERPRETACIÓN" explicando
  qué muestra el gráfico y qué se concluye

───────────────────────────────────────────────────────────────
C) INDICACIONES PARA EL ESTUDIANTE (si aplica)
───────────────────────────────────────────────────────────────

Al final de cada sección analítica, agrega un bloque:

> 💡 **Sugerencias para enriquecer esta sección:**
> - 📊 [Especifica qué tabla adicional construir y con qué datos propios del estudiante]
> - 📈 [Especifica qué gráfico adicional convendría agregar]
> - 📷 [Si aplica: qué fotografía/imagen tomar y dónde insertarla]
> - 📐 [Si aplica: qué diagrama/esquema dibujar]

Estas sugerencias son OPCIONALES para el estudiante pero le ayudan a
personalizar el documento con material propio.

───────────────────────────────────────────────────────────────
D) PROHIBICIONES ABSOLUTAS
───────────────────────────────────────────────────────────────

- ❌ NUNCA digas "ver gráfico anexo" o "ver figura X" sin generar el código
- ❌ NUNCA describas datos en prosa sin acompañarlos con tabla
- ❌ NUNCA inventes cifras sin fuente. Si no tienes dato real, NO afirmes
  un número específico; usa rangos plausibles e indica la fuente
- ❌ NUNCA dejes placeholders tipo "[INSERTAR GRÁFICO]" o "[VER ANEXO]"
- ❌ NUNCA generes una tabla con menos de 3 filas de datos
- ❌ NUNCA generes gráficos sin caption ni fuente
`;

/**
 * Bloques específicos por fase (cuando la fase tiene requerimientos
 * particulares de visualización: matrices, ratios financieros, etc.).
 */
const BLOQUES_ESPECIFICOS: Record<string, string> = {
  // PESTEL → matriz 5×N con factores y impacto
  "ph-proy-cap3a": `
═══ EXTRA PESTEL ═══
Genera OBLIGATORIAMENTE una matriz PESTEL con esta estructura:

| Dimensión | Factor identificado | Tipo (O/A) | Impacto (1-5) | Justificación breve |
|-----------|---------------------|------------|---------------|---------------------|
| Político  | ...                 | O          | 4             | ...                 |
| Económico | ...                 | A          | 3             | ...                 |
| Social    | ...                 | O          | 5             | ...                 |
| Tecnológ. | ...                 | O          | 4             | ...                 |
| Ecológico | ...                 | A          | 2             | ...                 |
| Legal     | ...                 | O          | 3             | ...                 |

(O = Oportunidad, A = Amenaza). Mínimo 2 factores por dimensión = 12 filas.

Luego agrega un gráfico de barras con el promedio de impacto por dimensión.
`,

  // Porter → 5 fuerzas como tabla + gráfico radial
  "ph-proy-cap3b": `
═══ EXTRA PORTER ═══
Genera OBLIGATORIAMENTE la tabla de las 5 Fuerzas de Porter:

| Fuerza | Intensidad (1-5) | Factores clave | Implicación estratégica |
|--------|------------------|----------------|-------------------------|
| Rivalidad entre competidores  | ... | ... | ... |
| Amenaza de nuevos entrantes   | ... | ... | ... |
| Poder de negociación clientes | ... | ... | ... |
| Poder de negociación proveed. | ... | ... | ... |
| Amenaza de productos sustit.  | ... | ... | ... |

Acompáñala con un gráfico radial (polar) en pgfplots mostrando la
intensidad de cada fuerza.
`,

  // Matrices estratégicas → MEFE, MEFI, FODA cruzada, BCG
  "ph-proy-cap3c": `
═══ EXTRA MATRICES ═══
Genera OBLIGATORIAMENTE estas 3 tablas (mínimo):

1. **Matriz MEFE** (Evaluación factores externos): factor / peso / calif / total
2. **Matriz MEFI** (Evaluación factores internos): factor / peso / calif / total
3. **FODA cruzado**: estrategias FO, DO, FA, DA en formato 2×2.

Cada matriz debe tener un total ponderado y una breve interpretación.
`,

  // Encuesta resultados → gráficos por pregunta
  "ph-proy-cap3e": `
═══ EXTRA RESULTADOS ENCUESTA ═══
Por CADA pregunta cerrada de la encuesta, genera:
- Tabla de frecuencias (categoría / frecuencia / %)
- Gráfico (pie si <= 5 categorías, barras si más)
- Interpretación de 2-3 líneas

Si hay preguntas escalares (Likert 1-5), agrega un gráfico de barras
con la distribución promedio.
`,

  // Demanda → proyección temporal
  "ph-proy-cap3f": `
═══ EXTRA DEMANDA ═══
Genera OBLIGATORIAMENTE:
- Tabla de proyección de demanda año 1-5 (unidades + ingresos esperados)
- Gráfico de líneas mostrando crecimiento proyectado
- Cuadro de supuestos usados (% crecimiento poblacional, precio, etc.)
`,

  // Estudio financiero → estados, flujos, ratios
  "ph-proy-cap4f": `
═══ EXTRA FINANCIERO ═══
Genera OBLIGATORIAMENTE estos cuadros (todos en markdown):
1. **Inversión inicial** (rubro / monto Bs.)
2. **Estructura de financiamiento** (capital propio % / deuda %)
3. **Flujo de caja proyectado año 1-5**
4. **Estado de resultados proyectado año 1-5**
5. **Punto de equilibrio**

Y estos gráficos pgfplots:
- Flujo de caja acumulado (líneas)
- Estructura de costos (pie chart)
- Comparativo ingresos vs egresos por año (barras agrupadas)
`,

  // Evaluación → VAN, TIR, sensibilidad
  "ph-proy-cap4g": `
═══ EXTRA EVALUACIÓN ═══
Genera OBLIGATORIAMENTE:
- Cuadro de indicadores: VAN, TIR, B/C, PRI, ROI (con valores y fórmulas usadas)
- Tabla de análisis de sensibilidad (escenarios pesimista/base/optimista)
- Gráfico de tornado mostrando variables más sensibles
- Conclusión clara: ¿el proyecto es viable financieramente?
`,
};

/**
 * Devuelve el bloque de fortalecimiento analítico a inyectar al userPrompt
 * para una fase específica. Si la fase no es analítica devuelve cadena vacía.
 */
export function getFortalecimientoAnaliticoBlock(phaseId: string): string {
  const extra = BLOQUES_ESPECIFICOS[phaseId] ?? "";
  return FORTALECIMIENTO_ANALITICO_BASE + extra;
}
