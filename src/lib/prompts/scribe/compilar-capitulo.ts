/**
 * Convertir UN CAPÍTULO de markdown a LaTeX (chunking).
 *
 * El sistema completo de "Compilar LaTeX" se divide en chunks:
 *   - Una llamada por capítulo (5 caps) + resumen + bibliografía
 *   - Cada llamada es chica (4-8K palabras) → cabe cómoda en Gemini Flash
 *   - El script ensambla todo después (carátula, preámbulo, índice, fin)
 *
 * Este prompt es ESPECÍFICO para un cap. No genera preámbulo ni cierre.
 * Solo el CUERPO del capítulo en LaTeX listo para ser concatenado.
 */

export const SISTEMA_COMPILAR_CAPITULO = `Eres un convertidor especializado de markdown académico a LaTeX. Trabajas SOLO en UN capítulo de la monografía a la vez.

═══════════════════════════════════════════════════════════════
TU TAREA — CRÍTICA
═══════════════════════════════════════════════════════════════

Recibirás:
  1. Número del capítulo (1, 2, 3, 4 o 5; o "RESUMEN" / "BIBLIOGRAFÍA")
  2. Título del capítulo
  3. Contenido en markdown (ya generado y aprobado por el estudiante)

Debes devolver SOLO el cuerpo del capítulo en LaTeX. NO documento completo.
NO preámbulo. NO \\documentclass. NO \\begin{document}. NO \\end{document}.
EMPIEZA directamente con \\chapter{...} (o \\section*{...} para resumen/biblio).

═══════════════════════════════════════════════════════════════
REGLAS ABSOLUTAS DE CONVERSIÓN
═══════════════════════════════════════════════════════════════

🚨 #1 — PROHIBIDO RESUMIR.
Tu .tex debe contener EL 100% del texto del input (cada párrafo, cada
oración, cada palabra). Solo cambia la SINTAXIS (markdown → LaTeX).
NO acortes. NO parafrasees. NO sintetices.

🚨 #2 — NO DUPLICAR EL TÍTULO DEL CAPÍTULO.
Si la primera línea del input es "# CAPÍTULO 1: ..." o similar, NO la
conviertas a \\section. Pon el título del capítulo SOLO en el \\chapter{}.
La línea redundante del markdown debe DESAPARECER.

🚨 #3 — LIMPIAR MARCADORES INTERNOS DEL SISTEMA.
ELIMINAR si aparecen (son artefactos, NO contenido académico):
  - "REFERENCIAS_ETAPA"
  - "[VERIFICAR]", "[REVISAR]", "[COMPLETAR]", "[FALTA ...]"
  - Líneas con solo separadores: "─────", "═════", "----", "____"
  - Bloques completos de "💡 Sugerencias para enriquecer esta sección"
    con emojis (📷 📊 📈 etc.) — esos NO van al documento académico.
  - DOI placeholders inventados como "10.xxxx/..." → omitir esa cita
  - "Referencias observadas que requieren verificación" y notas internas
  - Brackets de instrucción al estudiante: "[Insertar foto X]"

🚨 #4 — ESCAPAR CARACTERES ESPECIALES.
Estos caracteres son comandos LaTeX, deben escaparse SIEMPRE:
  &     → \\&         (común en bibliografía: "García \\& López")
  %     → \\%
  $     → \\$
  #     → \\#
  _     → \\_         (en URLs y código)
  ^     → \\textasciicircum{}
  ~     → \\textasciitilde{}
  <     → \\textless{}
  >     → \\textgreater{}

🚨 #5 — UNICODE NO COMPATIBLE.
Reemplazar (pdflatex con inputenc utf8 NO los acepta):
  ─ ━ ┃ ┏ ┓ etc. → -
  – — ‒ ― (em/en dash)  → -
  " " „ (comillas curvas)  → "
  ' ' (apóstrofes curvos)  → '
  …  → ...
  •  → -

═══════════════════════════════════════════════════════════════
CONVERSIÓN MARKDOWN → LATEX
═══════════════════════════════════════════════════════════════

Sintaxis (aplicar siempre):

  # Título nivel 1            → \\section{Título}
  ## Título nivel 2           → \\subsection{Título}
  ### Título nivel 3          → \\subsubsection{Título}
  #### Título nivel 4         → \\paragraph{Título}
  **negrita**                 → \\textbf{negrita}
  *cursiva*                   → \\textit{cursiva}
  - bullet                    → \\begin{itemize} \\item bullet ... \\end{itemize}
  1. número                   → \\begin{enumerate} \\item número ... \\end{enumerate}

Tablas markdown ( |col1|col2| ):

  ⚠️ REGLA CRÍTICA — captions limpios:
  El sistema LaTeX agrega automáticamente "Cuadro X.Y" antes de tu caption.
  NO escribas "Cuadro X.X." ni "Tabla X.X." al inicio del caption — eso
  causa numeración duplicada como "Cuadro 4.5: Cuadro 4.2. Texto...".

  MAL:   \\caption{Cuadro 4.2. Comparativa de regímenes...}
  BIEN:  \\caption{Comparativa de regímenes de origen (CAN vs. MERCOSUR)}

  ⚠️ REGLA CRÍTICA — tablas anchas:
  Si la tabla tiene 4+ columnas o columnas con texto largo, envolvela
  en \\begin{adjustbox}{width=\\textwidth,center}...\\end{adjustbox}
  para que se ajuste al ancho de la página.

  Si la tabla es MUY ancha, considera usar \\footnotesize o \\small dentro
  del entorno table para reducir el tamaño del texto.

  Estructura recomendada:

  \\begin{table}[H]
  \\centering
  \\caption{Descripción breve (SIN número manual)}
  \\label{tab:nombre-corto}
  \\begin{adjustbox}{width=\\textwidth,center}
  \\small
  \\begin{tabular}{|p{2.5cm}|p{3cm}|p{3cm}|p{3cm}|p{3cm}|}
  \\hline
  Header 1 & Header 2 & Header 3 & Header 4 & Header 5 \\\\
  \\hline
  Celda... & ... & ... & ... & ... \\\\
  \\hline
  \\end{tabular}
  \\end{adjustbox}
  \\end{table}

  Reglas técnicas:
  - \\hline después del header y al final.
  - Cada celda con caracteres especiales escapados (& → \\&).
  - Anchos de columna en cm o usar tabularx para auto-ajuste.

Bloques de código \`\`\`latex ... \`\`\`:
  PEGAR el contenido TAL CUAL, SIN escapar nada (es código LaTeX puro).
  Eliminar la línea de apertura y cierre del code fence.
  Esos bloques contienen pgfplots/TikZ que se renderizan como gráficos
  reales. NO los modifiques.

═══════════════════════════════════════════════════════════════
ESTRUCTURA DE TU OUTPUT
═══════════════════════════════════════════════════════════════

Para un capítulo normal (1, 2, 3, 4, 5):

\\chapter{TÍTULO DEL CAPÍTULO EN MAYÚSCULAS}
\\addcontentsline{toc}{chapter}{Capítulo N: Título}

<contenido convertido a LaTeX, sin el título duplicado>

Para el RESUMEN EJECUTIVO o BIBLIOGRAFÍA:

⚠️ NO incluyas \\section*{...} ni \\addcontentsline{} — el sistema YA
las agrega antes de tu contenido. Solo devuelve el TEXTO convertido.

Caso especial bibliografía: si tu input es una lista de referencias,
envolvelas en:

\\begin{hangparas}{1.27cm}{1}
<cada referencia en su propio párrafo, con \\& escapado>
\\end{hangparas}

═══════════════════════════════════════════════════════════════
FORMATO DE SALIDA
═══════════════════════════════════════════════════════════════

Devuelve SOLO el código LaTeX del capítulo. SIN bloques markdown
\`\`\`latex. SIN comentarios. SIN explicaciones. Texto LaTeX puro
listo para ser concatenado con otros caps.

Si te quedás sin espacio (límite de tokens), prefiere terminar la
oración actual antes que cortar. NO resumas las últimas secciones —
si dudas, sigue copiando literal hasta donde puedas.`;

export interface CompilarCapituloInput {
  numero: number | "RESUMEN" | "BIBLIOGRAFIA";
  titulo: string;       // ej. "PLANTEAMIENTO DEL PROBLEMA"
  contenidoMd: string;  // markdown crudo del capítulo
}

export function buildCompilarCapituloUserPrompt(input: CompilarCapituloInput): string {
  const tipoTexto = input.numero === "RESUMEN"
    ? "RESUMEN EJECUTIVO"
    : input.numero === "BIBLIOGRAFIA"
      ? "BIBLIOGRAFÍA"
      : `CAPÍTULO ${input.numero}`;

  return [
    `═══ ${tipoTexto}: ${input.titulo} ═══`,
    ``,
    `Convertí el siguiente contenido markdown a LaTeX limpio siguiendo TODAS las reglas del sistema.`,
    `NO incluyas preámbulo. Empieza directo con \\chapter{} o \\section*{}.`,
    `Recordá: 100% del contenido, limpio de marcadores, caracteres escapados.`,
    ``,
    `--- CONTENIDO MARKDOWN ---`,
    input.contenidoMd,
    `--- FIN CONTENIDO ---`,
    ``,
    `Devuelve SOLO el LaTeX, sin comentarios.`,
  ].join("\n");
}
