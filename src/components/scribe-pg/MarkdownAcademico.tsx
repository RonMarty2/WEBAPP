"use client";

/**
 * MarkdownAcademico — render visual de los capítulos I-IV del documento
 * (y secciones de cierre) con estilo de DOCUMENTO ACADÉMICO renderizado.
 *
 * Diferencias respecto al render plain markdown:
 *
 *   - Headers # ## ### ####  → jerarquía tipográfica clara
 *   - **negrita**, *italic*, `code` inline
 *   - Tablas markdown        → <table> con estilo limpio + zebra stripes
 *   - Listas - y 1.          → <ul> / <ol> bonitas
 *   - Bloques ```tikz```     → placeholder elegante "📊 Diagrama TikZ" con
 *                              preview compacto del código, no muestra el
 *                              código crudo de 20 líneas al lector.
 *   - Bloques ```latex```    → placeholder de fórmula con preview compacto.
 *   - Bloques ```pgfplots``` → placeholder de gráfico estadístico.
 *
 * Está pensado para mostrar el documento al estudiante como SI YA estuviera
 * compilado, sin requerir un compilador LaTeX en el browser. Cuando el
 * estudiante exporta a PDF, los bloques se compilan vectorialmente.
 */

import React, { useMemo } from "react";

interface MarkdownAcademicoProps {
  markdown: string;
}

interface Bloque {
  tipo: "parrafo" | "h1" | "h2" | "h3" | "h4" | "ul" | "ol" | "tabla" | "tikz" | "latex" | "pgfplots" | "code" | "vacio";
  contenido: string;
  items?: string[];          // para ul/ol
  filas?: string[][];        // para tabla
  lang?: string;             // para code blocks
}

/**
 * Parsea el markdown en bloques tipados. Procesa línea por línea
 * detectando inicios de tabla, lista, bloque de código y headers.
 */
function parsearBloques(md: string): Bloque[] {
  const lineas = md.split("\n");
  const bloques: Bloque[] = [];
  let i = 0;

  function isTablaSep(l: string) {
    return /^\s*\|[\s\-:|]+\|\s*$/.test(l);
  }
  function isTablaRow(l: string) {
    return /^\s*\|.*\|\s*$/.test(l);
  }

  while (i < lineas.length) {
    const raw = lineas[i];
    const linea = raw.trim();

    // Vacío
    if (!linea) { i++; continue; }

    // Bloque de código ```lang
    const fenceMatch = linea.match(/^```(\w*)\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1].toLowerCase();
      i++;
      const buf: string[] = [];
      while (i < lineas.length && !/^```\s*$/.test(lineas[i].trim())) {
        buf.push(lineas[i]);
        i++;
      }
      i++; // saltar el cierre ```
      const contenido = buf.join("\n");
      const tipo: Bloque["tipo"] =
        lang === "tikz" ? "tikz" :
        lang === "pgfplots" ? "pgfplots" :
        (lang === "latex" || lang === "tex") ? "latex" :
        "code";
      bloques.push({ tipo, contenido, lang });
      continue;
    }

    // Headers
    const hMatch = linea.match(/^(#{1,4})\s+(.*)$/);
    if (hMatch) {
      const nivel = hMatch[1].length;
      const texto = hMatch[2].trim();
      const tipo = (`h${nivel}` as Bloque["tipo"]);
      bloques.push({ tipo, contenido: texto });
      i++;
      continue;
    }

    // Tabla
    if (isTablaRow(linea)) {
      const filas: string[][] = [];
      let j = i;
      while (j < lineas.length && (isTablaRow(lineas[j].trim()) || isTablaSep(lineas[j].trim()))) {
        const tr = lineas[j].trim();
        if (!isTablaSep(tr)) {
          filas.push(
            tr.split("|").map((c) => c.trim()).filter((_, k, arr) => k > 0 && k < arr.length)
          );
        }
        j++;
      }
      if (filas.length >= 1) {
        bloques.push({ tipo: "tabla", contenido: "", filas });
        i = j;
        continue;
      }
    }

    // Lista no ordenada
    if (/^[-*]\s+/.test(linea)) {
      const items: string[] = [];
      while (i < lineas.length) {
        const l = lineas[i].trim();
        if (/^[-*]\s+(.+)$/.test(l)) {
          items.push(l.replace(/^[-*]\s+/, ""));
          i++;
        } else if (!l) {
          i++;
          break;
        } else {
          break;
        }
      }
      bloques.push({ tipo: "ul", contenido: "", items });
      continue;
    }

    // Lista ordenada
    if (/^\d+[.\)]\s+/.test(linea)) {
      const items: string[] = [];
      while (i < lineas.length) {
        const l = lineas[i].trim();
        if (/^\d+[.\)]\s+(.+)$/.test(l)) {
          items.push(l.replace(/^\d+[.\)]\s+/, ""));
          i++;
        } else if (!l) {
          i++;
          break;
        } else {
          break;
        }
      }
      bloques.push({ tipo: "ol", contenido: "", items });
      continue;
    }

    // Párrafo (acumular líneas hasta una vacía o header/lista/tabla/code)
    const parrafo: string[] = [linea];
    i++;
    while (i < lineas.length) {
      const l = lineas[i].trim();
      if (!l) break;
      if (/^(#{1,4})\s+/.test(l)) break;
      if (/^[-*]\s+/.test(l)) break;
      if (/^\d+[.\)]\s+/.test(l)) break;
      if (isTablaRow(l)) break;
      if (/^```/.test(l)) break;
      parrafo.push(l);
      i++;
    }
    bloques.push({ tipo: "parrafo", contenido: parrafo.join(" ") });
  }
  return bloques;
}

/** Convierte negrita, itálica, código inline a JSX. */
function renderInline(texto: string): React.ReactNode {
  // Reemplazar **bold**, *italic*, `code`
  const partes: React.ReactNode[] = [];
  let resto = texto;
  let key = 0;
  const patrones: { regex: RegExp; render: (m: string) => React.ReactNode }[] = [
    { regex: /\*\*(.+?)\*\*/, render: (m) => <strong key={`s${key++}`}>{m}</strong> },
    { regex: /\*(.+?)\*/, render: (m) => <em key={`e${key++}`}>{m}</em> },
    { regex: /`([^`]+)`/, render: (m) => <code key={`c${key++}`} style={{ background: "var(--bg-secondary)", padding: "1px 5px", borderRadius: 3, fontSize: "0.92em" }}>{m}</code> },
  ];

  while (resto.length > 0) {
    let bestMatch: { idx: number; len: number; render: React.ReactNode } | null = null;
    for (const p of patrones) {
      const m = resto.match(p.regex);
      if (m && (bestMatch === null || (m.index ?? 0) < bestMatch.idx)) {
        bestMatch = { idx: m.index ?? 0, len: m[0].length, render: p.render(m[1]) };
      }
    }
    if (!bestMatch) {
      partes.push(resto);
      break;
    }
    if (bestMatch.idx > 0) partes.push(resto.slice(0, bestMatch.idx));
    partes.push(bestMatch.render);
    resto = resto.slice(bestMatch.idx + bestMatch.len);
  }
  return <>{partes}</>;
}

/** Palabras reservadas de LaTeX/TikZ que NO sirven como título descriptivo. */
const PALABRAS_RESERVADAS_LATEX = new Set([
  "center", "tikzpicture", "equation", "align", "figure", "table",
  "minipage", "scope", "axis", "document", "itemize", "enumerate",
  "tabular", "array", "matrix", "pmatrix", "bmatrix", "vmatrix",
  "node", "draw", "fill", "thick", "thin", "small", "tiny", "large",
  "bfseries", "itshape", "centering", "raggedright", "raggedleft",
  "fontsize", "selectfont", "vspace", "hspace", "vfill", "hfill",
  "begin", "end", "left", "right", "frac", "sum", "int", "lim",
  "Stealth", "Latex", "to", "stealth",
]);

function PlaceholderDiagrama({ tipo, contenido }: { tipo: "tikz" | "latex" | "pgfplots"; contenido: string }) {
  const meta = {
    tikz: { icono: "📊", label: "Diagrama vectorial (TikZ)", color: "#0ea5e9" },
    latex: { icono: "🔢", label: "Fórmula matemática (LaTeX)", color: "#8b5cf6" },
    pgfplots: { icono: "📈", label: "Gráfico estadístico (pgfplots)", color: "#16a34a" },
  }[tipo];

  // Buscar el primer texto descriptivo que NO sea palabra reservada de LaTeX
  // ni un comando. Estrategia: extraer TODOS los textos entre llaves y quedarnos
  // con el primero que parece prosa real (tiene espacios o es largo y no es
  // palabra reservada).
  const matches = Array.from(contenido.matchAll(/\{([^{}]{2,80})\}/g));
  let titulo = "";
  for (const m of matches) {
    const t = m[1].trim();
    const primeraPalabra = t.split(/\s/)[0].toLowerCase();
    if (PALABRAS_RESERVADAS_LATEX.has(primeraPalabra)) continue;
    if (t.length < 4) continue;
    // Saltar si parece código (empieza con \, contiene =, contiene puntos
    // tipo coordenadas, etc.)
    if (/^[\\=\-+*]/.test(t)) continue;
    if (/^-?\d+([.,]\d+)?\s*(,|cm|mm|pt|em)/.test(t)) continue;
    // Tiene espacios o es palabra real → buen candidato
    if (/\s/.test(t) || t.length > 6) {
      titulo = t.replace(/\\\\/g, " ").replace(/\s+/g, " ").trim();
      break;
    }
  }
  if (!titulo) titulo = tipo === "latex" ? "expresión matemática" : tipo === "pgfplots" ? "gráfico de datos" : "diagrama visual";

  return (
    <div
      style={{
        margin: "16px 0",
        padding: "16px 18px",
        background: "var(--bg-secondary)",
        border: `1px dashed ${meta.color}`,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ fontSize: 28 }}>{meta.icono}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: meta.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
          {meta.label}
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {titulo}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>
          Se renderizará como gráfico vectorial en el PDF final del documento.
        </div>
      </div>
    </div>
  );
}

function Tabla({ filas }: { filas: string[][] }) {
  if (filas.length === 0) return null;
  const header = filas[0];
  const body = filas.slice(1);
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {header.map((c, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  background: "var(--bg-secondary)",
                  borderBottom: "2px solid var(--border)",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--fg-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {renderInline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((fila, r) => (
            <tr key={r} style={{ background: r % 2 === 0 ? "transparent" : "var(--bg-secondary)" }}>
              {fila.map((c, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--fg-primary)",
                  }}
                >
                  {renderInline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarkdownAcademico({ markdown }: MarkdownAcademicoProps) {
  const bloques = useMemo(() => parsearBloques(markdown), [markdown]);

  return (
    <article
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "28px 36px",
        color: "var(--fg-primary)",
        fontSize: 14.5,
        lineHeight: 1.75,
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {bloques.map((b, i) => {
        switch (b.tipo) {
          case "h1":
            return (
              <h1
                key={i}
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  marginTop: i === 0 ? 0 : 32,
                  marginBottom: 18,
                  paddingBottom: 10,
                  borderBottom: "2px solid var(--border)",
                  color: "var(--fg-primary)",
                  fontFamily: "inherit",
                }}
              >
                {renderInline(b.contenido)}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={i}
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  marginTop: 26,
                  marginBottom: 12,
                  color: "var(--fg-primary)",
                  fontFamily: "inherit",
                }}
              >
                {renderInline(b.contenido)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginTop: 20,
                  marginBottom: 10,
                  color: "var(--fg-primary)",
                  fontFamily: "inherit",
                }}
              >
                {renderInline(b.contenido)}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={i}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginTop: 16,
                  marginBottom: 8,
                  color: "var(--fg-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  fontFamily: "inherit",
                }}
              >
                {renderInline(b.contenido)}
              </h4>
            );
          case "parrafo":
            return (
              <p key={i} style={{ margin: "0 0 14px", textAlign: "justify", lineHeight: 1.75 }}>
                {renderInline(b.contenido)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} style={{ margin: "10px 0 16px", paddingLeft: 26, lineHeight: 1.75 }}>
                {b.items?.map((item, k) => (
                  <li key={k} style={{ marginBottom: 6 }}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} style={{ margin: "10px 0 16px", paddingLeft: 26, lineHeight: 1.75 }}>
                {b.items?.map((item, k) => (
                  <li key={k} style={{ marginBottom: 6 }}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "tabla":
            return <Tabla key={i} filas={b.filas ?? []} />;
          case "tikz":
          case "latex":
          case "pgfplots":
            return <PlaceholderDiagrama key={i} tipo={b.tipo} contenido={b.contenido} />;
          case "code":
            return (
              <pre key={i} style={{ background: "var(--bg-secondary)", padding: 12, borderRadius: 8, overflowX: "auto", fontSize: 12, margin: "12px 0" }}>
                <code>{b.contenido}</code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </article>
  );
}
