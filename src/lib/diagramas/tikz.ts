/**
 * Generador LaTeX/TikZ de los diagramas, para el export a PDF (Overleaf).
 *
 * Genera el MISMO diagrama (mismos datos) que el SVG de pantalla, pero como
 * vector nativo de LaTeX. Usa SOLO paquetes que el preámbulo ya carga
 * (tikz, pgfplots, xcolor, graphicx) y NO depende de pgf-pie, para compilar
 * en Overleaf free. El pastel se dibuja con arcos crudos de TikZ.
 *
 * Reemplaza el viejo enfoque de pedirle a la IA que escriba TikZ a mano
 * (poco fiable): ahora el TikZ se GENERA de forma determinista desde el dato.
 */

import { type DiagramaSpec, type GraficoSpec, PALETA } from "./tipos";

/** Escapa caracteres especiales de LaTeX en un solo pase (sin doble-escape). */
function escTex(s: string): string {
  return (s ?? "").replace(/[\\{}$&#^_~%]/g, (m) => {
    switch (m) {
      case "\\": return "\\textbackslash{}";
      case "^": return "\\textasciicircum{}";
      case "~": return "\\textasciitilde{}";
      default: return `\\${m}`;
    }
  });
}

function num(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
}

/** Define los colores de la paleta como \definecolor diagCn (HTML). */
function definirColores(cantidad: number): string {
  const out: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const hex = PALETA[i % PALETA.length].replace("#", "").toUpperCase();
    out.push(`\\definecolor{diagC${i}}{HTML}{${hex}}`);
  }
  return out.join("\n");
}

function envolverFigura(cuerpo: string, titulo?: string, fuente?: string): string {
  const partes = ["\\begin{figure}[H]", "\\centering", cuerpo];
  if (titulo) partes.push(`\\caption{${escTex(titulo)}}`);
  if (fuente) {
    const txt = /^fuente/i.test(fuente) ? fuente : `Fuente: ${fuente}`;
    partes.push(`{\\footnotesize\\itshape ${escTex(txt)}\\par}`);
  }
  partes.push("\\end{figure}");
  return partes.join("\n");
}

// ───────────────────────────── Árbol de problemas ─────────────────────────────

function tikzArbol(spec: Extract<DiagramaSpec, { tipo: "arbol-problemas" }>): string {
  const sep = 3.7; // separación horizontal (cm)
  const yEfecto = 3.2;
  const yCausa = -3.2;

  const estiloCaja = "draw, rounded corners=3pt, align=center, inner sep=4pt, font=\\footnotesize, minimum height=1cm";
  const lineas: string[] = ["\\begin{tikzpicture}"];

  // Problema central
  lineas.push(
    `\\node[${estiloCaja}, text width=4cm, fill=diagC0, text=white, font=\\footnotesize\\bfseries] (prob) at (0,0) {${escTex(spec.problema)}};`,
  );

  const centrar = (n: number, i: number) => (i - (n - 1) / 2) * sep;

  spec.efectos.forEach((e, i) => {
    const x = centrar(spec.efectos.length, i);
    lineas.push(`\\node[${estiloCaja}, text width=3cm, fill=gray!12] (e${i}) at (${num(x)},${yEfecto}) {${escTex(e)}};`);
    lineas.push(`\\draw[->, thick, gray!70] (prob.north) -- (e${i}.south);`);
  });

  spec.causas.forEach((c, i) => {
    const x = centrar(spec.causas.length, i);
    lineas.push(`\\node[${estiloCaja}, text width=3cm, fill=gray!12] (c${i}) at (${num(x)},${yCausa}) {${escTex(c)}};`);
    lineas.push(`\\draw[->, thick, gray!70] (c${i}.north) -- (prob.south);`);
  });

  lineas.push("\\end{tikzpicture}");

  // resizebox garantiza que un árbol ancho entre en la página.
  const cuerpo = `${definirColores(1)}\n\\resizebox{\\textwidth}{!}{%\n${lineas.join("\n")}%\n}`;
  return envolverFigura(cuerpo, spec.titulo ?? "Árbol de problemas", spec.fuente);
}

// ───────────────────────────── Barras / líneas (pgfplots) ─────────────────────

function tikzBarrasLineas(spec: GraficoSpec): string {
  const esLinea = spec.variante === "lineas";
  const datos = spec.datos;
  const xtick = datos.map((_, i) => i + 1).join(",");
  const xticklabels = datos.map((d) => `{${escTex(d.etiqueta)}}`).join(",");
  const coords = datos.map((d, i) => `(${i + 1},${num(d.valor)})`).join("");
  const maxLabel = Math.max(...datos.map((d) => d.etiqueta.length));
  const rotar = maxLabel > 8 || datos.length > 7;

  const opts = [
    "width=0.92\\textwidth",
    "height=7cm",
    esLinea ? "" : "ybar",
    esLinea ? "" : "bar width=14pt",
    "ymin=0",
    "enlarge x limits=0.12",
    `xtick={${xtick}}`,
    `xticklabels={${xticklabels}}`,
    rotar ? "x tick label style={rotate=30, anchor=east, font=\\footnotesize}" : "x tick label style={font=\\footnotesize}",
    "y tick label style={font=\\footnotesize}",
    spec.ejeX ? `xlabel={${escTex(spec.ejeX)}}` : "",
    spec.ejeY ? `ylabel={${escTex(spec.ejeY)}}` : (spec.unidad ? `ylabel={${escTex(spec.unidad)}}` : ""),
    "nodes near coords",
    "every node near coord/.append style={font=\\scriptsize}",
    "tick align=outside",
    "axis lines=left",
  ].filter(Boolean).join(",\n    ");

  const plot = esLinea
    ? `\\addplot[color=diagC0, mark=*, thick] coordinates {${coords}};`
    : `\\addplot[fill=diagC0, draw=diagC0] coordinates {${coords}};`;

  const cuerpo = `${definirColores(1)}\n\\begin{tikzpicture}\n\\begin{axis}[\n    ${opts}\n]\n${plot}\n\\end{axis}\n\\end{tikzpicture}`;
  return envolverFigura(cuerpo, spec.titulo, spec.fuente);
}

// ───────────────────────────── Pastel (arcos crudos) ─────────────────────────

function tikzPastel(spec: GraficoSpec): string {
  const datos = spec.datos.filter((d) => d.valor > 0);
  if (datos.length === 0) return "";
  const total = datos.reduce((s, d) => s + d.valor, 0);
  const r = 3; // cm

  const lineas: string[] = [definirColores(datos.length), "\\begin{tikzpicture}"];
  let ang = 90; // arrancamos arriba
  datos.forEach((d, i) => {
    const frac = d.valor / total;
    const ang2 = ang - frac * 360; // sentido horario
    if (frac >= 0.9999) {
      lineas.push(`\\filldraw[fill=diagC${i}, draw=white, thick] (0,0) circle (${r});`);
    } else {
      lineas.push(
        `\\filldraw[fill=diagC${i}, draw=white, thick] (0,0) -- (${num(ang)}:${r}) arc (${num(ang)}:${num(ang2)}:${r}) -- cycle;`,
      );
    }
    ang = ang2;
  });

  // Leyenda a la derecha
  const legX = r + 1.2;
  datos.forEach((d, i) => {
    const pct = Math.round((d.valor / total) * 1000) / 10;
    const ly = r - 0.5 - i * 0.7;
    lineas.push(`\\filldraw[fill=diagC${i}, draw=diagC${i}] (${num(legX)},${num(ly)}) rectangle ++(0.45,0.45);`);
    lineas.push(
      `\\node[anchor=west, font=\\footnotesize] at (${num(legX + 0.6)},${num(ly + 0.22)}) {${escTex(d.etiqueta)} --- ${num(d.valor)}${escTex(spec.unidad ?? "")} (${pct}\\%)};`,
    );
  });

  lineas.push("\\end{tikzpicture}");
  return envolverFigura(lineas.join("\n"), spec.titulo, spec.fuente);
}

/**
 * Convierte un DiagramaSpec en un bloque LaTeX (entorno figure completo),
 * listo para pegar en el .tex. Devuelve "" si no es representable.
 */
export function diagramaATikz(spec: DiagramaSpec): string {
  try {
    if (spec.tipo === "arbol-problemas") return tikzArbol(spec);
    if (spec.tipo === "grafico") {
      return spec.variante === "pastel" ? tikzPastel(spec) : tikzBarrasLineas(spec);
    }
    return "";
  } catch {
    return "";
  }
}
