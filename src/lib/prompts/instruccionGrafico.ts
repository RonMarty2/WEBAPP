/**
 * Instrucción compartida: cómo emitir GRÁFICOS renderizables.
 *
 * Se inyecta en los prompts donde aparecen resultados cuantitativos
 * (Cap. IV de monografía, análisis de encuesta de proyecto de grado, etc.).
 *
 * NO agrega reglas de origen de datos: esas ya viven en cada prompt (usar
 * datos del estudiante o datos reales conocidos, nunca inventar sin base).
 * Esta instrucción solo define el FORMATO para que el dato que el prompt ya
 * produce se dibuje como figura real (pantalla = Word = PDF), en vez de
 * quedar como tabla suelta o como "[INSERTAR GRÁFICO]".
 */
export const INSTRUCCION_GRAFICO = `
═══════════════════════════════════════════════════════════════
GRÁFICOS RENDERIZABLES (formato obligatorio)
═══════════════════════════════════════════════════════════════

Cuando presentes un resultado cuantitativo clave (una distribución, una
comparación entre categorías o una tendencia), ADEMÁS de la tabla emite el
gráfico como un bloque de código con lenguaje \`diagrama\` que contenga SOLO
JSON. La plataforma lo dibuja como figura vectorial real (idéntica en
pantalla, Word y PDF). NO escribas TikZ a mano ni dejes "[INSERTAR GRÁFICO]".

Sintaxis EXACTA (un objeto por categoría dentro de "datos"):

\`\`\`diagrama
{"tipo":"grafico","variante":"barras","titulo":"<título de la figura>","ejeY":"<rótulo opcional>","unidad":"%","datos":[{"etiqueta":"<categoría>","valor":0}],"fuente":"<fuente>"}
\`\`\`

Reglas del gráfico:
- "variante": "barras" para comparar categorías, "lineas" para una tendencia
  en el tiempo, "pastel" para la composición porcentual de un total.
- "datos": usa los MISMOS números de la tabla correspondiente. El origen de
  esos datos sigue las reglas de datos de arriba (datos del estudiante o datos
  reales conocidos); nunca inventes cifras solo para llenar el gráfico.
- JSON válido: comillas dobles, sin comas finales, sin comentarios, sin texto
  fuera de las llaves.
- Máximo 12 categorías. Etiquetas breves.
- Conserva el párrafo PREVIO (qué muestra el gráfico) y el POSTERIOR
  (interpretación): un gráfico sin interpretación está prohibido.
- Si no hay datos sostenibles para un gráfico, no lo fuerces: deja el análisis
  cualitativo, igual que con las tablas.
`;
