/**
 * Generador SVG determinista de diagramas académicos.
 *
 * Es la pieza central: una función pura `spec → string SVG`. El MISMO string
 * se usa en pantalla (inyectado en el render) y en la descarga Word (embebido
 * como imagen). Sin DOM, sin canvas, sin librerías → funciona en servidor y
 * cliente, se ve idéntico en los tres lados y nunca lanza.
 *
 * Estética: figura "placa" blanca con borde fino y texto oscuro, como una
 * figura real dentro de una tesis (correcta en pantalla clara/oscura, Word y
 * PDF). Tipografía serif para combinar con el documento académico.
 */

import { type DiagramaSpec, type GraficoSpec, PALETA } from "./tipos";

const SERIF = "Georgia, 'Times New Roman', serif";

/** Escapa texto para insertarlo seguro como contenido/atributo XML. */
function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Redondeo a 1 decimal para mantener el SVG compacto y estable. */
function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Formatea un número: entero limpio o hasta 2 decimales. */
function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

/** Parte un texto en líneas de ~maxChars, con corte duro y tope de líneas. */
function envolver(texto: string, maxChars: number, maxLineas = 4): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    if (actual.length === 0) actual = p;
    else if ((actual + " " + p).length <= maxChars) actual += " " + p;
    else { lineas.push(actual); actual = p; }
    while (actual.length > maxChars) {
      lineas.push(actual.slice(0, maxChars));
      actual = actual.slice(maxChars);
    }
  }
  if (actual) lineas.push(actual);
  if (lineas.length > maxLineas) {
    const recortado = lineas.slice(0, maxLineas);
    recortado[maxLineas - 1] = `${recortado[maxLineas - 1].replace(/.$/, "")}…`;
    return recortado;
  }
  return lineas;
}

/** `<text>` multilínea centrado en (cx, yTop) con `<tspan>` por línea. */
function textoMultilinea(
  cx: number,
  yTop: number,
  lineas: string[],
  opts: { tam: number; color: string; peso?: number; lh: number },
): string {
  const { tam, color, peso = 400, lh } = opts;
  const tspans = lineas
    .map((l, i) => `<tspan x="${r1(cx)}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`)
    .join("");
  return `<text x="${r1(cx)}" y="${r1(yTop)}" text-anchor="middle" font-family="${SERIF}" font-size="${tam}" font-weight="${peso}" fill="${color}">${tspans}</text>`;
}

/** Envuelve el cuerpo en la placa SVG (fondo blanco + borde). */
function placa(W: number, H: number, defs: string, cuerpo: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r1(W)} ${r1(H)}" width="100%" ` +
    `style="max-width:${Math.round(W)}px;height:auto;display:block;margin:12px auto" role="img" font-family="${SERIF}">` +
    defs +
    `<rect x="0.5" y="0.5" width="${r1(W - 1)}" height="${r1(H - 1)}" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>` +
    cuerpo +
    `</svg>`
  );
}

function tituloSVG(titulo: string | undefined, W: number, y: number): string {
  if (!titulo) return "";
  return `<text x="${r1(W / 2)}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="13" font-weight="700" fill="#0f172a">${esc(titulo)}</text>`;
}

function fuenteSVG(fuente: string | undefined, W: number, y: number): string {
  if (!fuente) return "";
  const txt = /^fuente/i.test(fuente) ? fuente : `Fuente: ${fuente}`;
  return `<text x="${r1(W / 2)}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="10" font-style="italic" fill="#64748b">${esc(txt)}</text>`;
}

// ───────────────────────────── Árbol de problemas ─────────────────────────────

function svgArbol(spec: Extract<DiagramaSpec, { tipo: "arbol-problemas" }>): string {
  const cajaW = 150;
  const probW = 210;
  const gapX = 16;
  const gapY = 56; // espacio vertical para las flechas
  const margenX = 24;
  const lh = 14;
  const padY = 8;
  const fontCaja = 11;

  type Caja = { x: number; y: number; w: number; h: number; lineas: string[]; fill: string; stroke: string; color: string; peso: number };

  const efectos = spec.efectos.slice();
  const causas = spec.causas.slice();
  const nCols = Math.max(efectos.length, causas.length, 1);

  const contenidoW = nCols * cajaW + (nCols - 1) * gapX;
  const W = Math.max(contenidoW + margenX * 2, probW + margenX * 2, 360);

  const titulo = spec.titulo;
  let y = titulo ? 34 : 18;

  // Pre-calcular líneas y altura de cada fila
  const wrapCaja = (t: string) => envolver(t, 24, 4);
  const altoFila = (textos: string[]) =>
    textos.length === 0 ? 0 : Math.max(...textos.map((t) => wrapCaja(t).length)) * lh + padY * 2;

  const hEfectos = altoFila(efectos);
  const hCausas = altoFila(causas);
  const probLineas = envolver(spec.problema, 30, 4);
  const hProb = probLineas.length * lh + padY * 2 + 4;

  const cajas: Caja[] = [];
  const flechas: string[] = [];
  const etiquetasFila: string[] = [];

  // Helper para colocar una fila de cajas centrada
  function colocarFila(textos: string[], yTop: number, fill: string, stroke: string): Caja[] {
    const n = textos.length;
    if (n === 0) return [];
    const totalW = n * cajaW + (n - 1) * gapX;
    const startX = margenX + (contenidoW - totalW) / 2;
    return textos.map((t, i) => {
      const lineas = wrapCaja(t);
      const h = lineas.length * lh + padY * 2;
      return { x: startX + i * (cajaW + gapX), y: yTop, w: cajaW, h, lineas, fill, stroke, color: "#1f2937", peso: 400 };
    });
  }

  // Fila EFECTOS (arriba)
  const yEfectos = y;
  const cajasEfectos = colocarFila(efectos, yEfectos, "#f8fafc", "#94a3b8");
  cajas.push(...cajasEfectos);
  if (efectos.length > 0) {
    etiquetasFila.push(
      `<text x="${margenX}" y="${r1(yEfectos - 6)}" font-family="${SERIF}" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="0.08em">EFECTOS</text>`,
    );
  }

  // Caja PROBLEMA (medio)
  const yProb = yEfectos + (hEfectos || 10) + gapY;
  const probX = margenX + (contenidoW - probW) / 2;
  const cajaProb: Caja = {
    x: probX, y: yProb, w: probW, h: hProb, lineas: probLineas,
    fill: "#2563eb", stroke: "#1d4ed8", color: "#ffffff", peso: 700,
  };
  etiquetasFila.push(
    `<text x="${margenX}" y="${r1(yProb - 6)}" font-family="${SERIF}" font-size="10" font-weight="700" fill="#2563eb" letter-spacing="0.08em">PROBLEMA CENTRAL</text>`,
  );

  // Fila CAUSAS (abajo)
  const yCausas = yProb + hProb + gapY;
  const cajasCausas = colocarFila(causas, yCausas, "#f8fafc", "#94a3b8");
  cajas.push(...cajasCausas);
  if (causas.length > 0) {
    etiquetasFila.push(
      `<text x="${margenX}" y="${r1(yCausas - 6)}" font-family="${SERIF}" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="0.08em">CAUSAS</text>`,
    );
  }

  // Flechas: causa → problema (suben), problema → efecto (suben)
  const probTopX = cajaProb.x + cajaProb.w / 2;
  const probTop = { x: probTopX, y: cajaProb.y };
  const probBottom = { x: probTopX, y: cajaProb.y + cajaProb.h };
  for (const e of cajasEfectos) {
    const ex = e.x + e.w / 2;
    flechas.push(`<line x1="${r1(probTop.x)}" y1="${r1(probTop.y)}" x2="${r1(ex)}" y2="${r1(e.y + e.h)}" stroke="#64748b" stroke-width="1.4" marker-end="url(#diagFlecha)"/>`);
  }
  for (const c of cajasCausas) {
    const cx = c.x + c.w / 2;
    flechas.push(`<line x1="${r1(cx)}" y1="${r1(c.y)}" x2="${r1(probBottom.x)}" y2="${r1(probBottom.y)}" stroke="#64748b" stroke-width="1.4" marker-end="url(#diagFlecha)"/>`);
  }

  // Dibujar cajas (incluida la del problema)
  const todas = [...cajas, cajaProb];
  const cajasSVG = todas
    .map((c) => {
      const rect = `<rect x="${r1(c.x)}" y="${r1(c.y)}" width="${r1(c.w)}" height="${r1(c.h)}" rx="6" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.fill === "#2563eb" ? 1.5 : 1}"/>`;
      const yTexto = c.y + padY + fontCaja;
      const txt = textoMultilinea(c.x + c.w / 2, yTexto, c.lineas, { tam: fontCaja, color: c.color, peso: c.peso, lh });
      return rect + txt;
    })
    .join("");

  const H = yCausas + (hCausas || 10) + (spec.fuente ? 24 : 18);
  const defs = `<defs><marker id="diagFlecha" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L7,3 L0,6 Z" fill="#64748b"/></marker></defs>`;
  const cuerpo =
    tituloSVG(titulo, W, 22) +
    flechas.join("") +
    cajasSVG +
    etiquetasFila.join("") +
    fuenteSVG(spec.fuente, W, H - 8);

  return placa(W, H, defs, cuerpo);
}

// ───────────────────────────── Gráficos (ejes) ─────────────────────────────

function svgBarrasLineas(spec: GraficoSpec): string {
  const esLinea = spec.variante === "lineas";
  const W = 640;
  const mLeft = 58;
  const mRight = 24;
  const mTop = spec.titulo ? 34 : 16;
  const plotH = 230;
  const datos = spec.datos;
  const n = datos.length;
  const plotW = W - mLeft - mRight;
  const x0 = mLeft;
  const yBase = mTop + plotH;

  const maxVal = Math.max(...datos.map((d) => d.valor), 0);
  const escalaMax = maxVal <= 0 ? 1 : maxVal;
  const yDe = (v: number) => yBase - (v / escalaMax) * plotH;

  // Cuadrícula + rótulos eje Y (5 marcas)
  const ticks = 4;
  let grid = "";
  for (let t = 0; t <= ticks; t++) {
    const v = (escalaMax * t) / ticks;
    const yy = yDe(v);
    grid += `<line x1="${x0}" y1="${r1(yy)}" x2="${x0 + plotW}" y2="${r1(yy)}" stroke="#eef2f7" stroke-width="1"/>`;
    grid += `<text x="${x0 - 8}" y="${r1(yy + 3)}" text-anchor="end" font-family="${SERIF}" font-size="10" fill="#64748b">${esc(fmtNum(v))}${esc(spec.unidad ?? "")}</text>`;
  }
  // Ejes
  const ejes = `<line x1="${x0}" y1="${mTop}" x2="${x0}" y2="${yBase}" stroke="#94a3b8" stroke-width="1.2"/><line x1="${x0}" y1="${yBase}" x2="${x0 + plotW}" y2="${yBase}" stroke="#94a3b8" stroke-width="1.2"/>`;

  const slot = plotW / n;
  let serie = "";
  let etiquetasX = "";
  const puntos: Array<[number, number]> = [];

  datos.forEach((d, i) => {
    const cx = x0 + slot * (i + 0.5);
    const yy = yDe(d.valor);
    puntos.push([cx, yy]);
    if (!esLinea) {
      const bw = Math.min(slot * 0.6, 64);
      const bx = cx - bw / 2;
      serie += `<rect x="${r1(bx)}" y="${r1(yy)}" width="${r1(bw)}" height="${r1(yBase - yy)}" rx="2" fill="${PALETA[0]}"/>`;
      serie += `<text x="${r1(cx)}" y="${r1(yy - 5)}" text-anchor="middle" font-family="${SERIF}" font-size="10" font-weight="700" fill="#1f2937">${esc(fmtNum(d.valor))}${esc(spec.unidad ?? "")}</text>`;
    }
    // rótulo eje X (hasta 2 líneas)
    const lineas = envolver(d.etiqueta, Math.max(6, Math.floor(slot / 6)), 2);
    etiquetasX += textoMultilinea(cx, yBase + 14, lineas, { tam: 10, color: "#475569", lh: 11 });
  });

  if (esLinea) {
    const poly = puntos.map(([px, py]) => `${r1(px)},${r1(py)}`).join(" ");
    serie += `<polyline points="${poly}" fill="none" stroke="${PALETA[0]}" stroke-width="2"/>`;
    puntos.forEach(([px, py], i) => {
      serie += `<circle cx="${r1(px)}" cy="${r1(py)}" r="3.2" fill="#ffffff" stroke="${PALETA[0]}" stroke-width="2"/>`;
      serie += `<text x="${r1(px)}" y="${r1(py - 8)}" text-anchor="middle" font-family="${SERIF}" font-size="10" font-weight="700" fill="#1f2937">${esc(fmtNum(datos[i].valor))}${esc(spec.unidad ?? "")}</text>`;
    });
  }

  const xLabelsH = 30;
  let extra = xLabelsH;
  let ejeXsvg = "";
  if (spec.ejeX) {
    ejeXsvg = `<text x="${r1(x0 + plotW / 2)}" y="${r1(yBase + xLabelsH + 14)}" text-anchor="middle" font-family="${SERIF}" font-size="11" font-style="italic" fill="#475569">${esc(spec.ejeX)}</text>`;
    extra += 18;
  }
  let ejeYsvg = "";
  if (spec.ejeY) {
    const cyl = mTop + plotH / 2;
    ejeYsvg = `<text x="14" y="${r1(cyl)}" text-anchor="middle" font-family="${SERIF}" font-size="11" font-style="italic" fill="#475569" transform="rotate(-90 14 ${r1(cyl)})">${esc(spec.ejeY)}</text>`;
  }

  const H = yBase + extra + (spec.fuente ? 20 : 8);
  const cuerpo =
    tituloSVG(spec.titulo, W, 22) +
    grid + ejes + ejeYsvg + serie + etiquetasX + ejeXsvg +
    fuenteSVG(spec.fuente, W, H - 6);

  return placa(W, H, "", cuerpo);
}

// ───────────────────────────── Gráfico de pastel ─────────────────────────────

function polar(cx: number, cy: number, r: number, angGrados: number): [number, number] {
  const a = ((angGrados - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function svgPastel(spec: GraficoSpec): string {
  const datos = spec.datos.filter((d) => d.valor > 0);
  if (datos.length === 0) return "";
  const total = datos.reduce((s, d) => s + d.valor, 0);

  const W = 580;
  const mTop = spec.titulo ? 34 : 18;
  const r = 110;
  const cx = 24 + r + 8;
  const cy = mTop + r + 8;

  let ang = 0;
  let slices = "";
  let leyenda = "";
  const legX = cx + r + 40;
  const legY0 = mTop + 6;

  datos.forEach((d, i) => {
    const frac = d.valor / total;
    const ang2 = ang + frac * 360;
    const color = PALETA[i % PALETA.length];
    if (frac >= 0.9999) {
      // Un solo dato = círculo completo (evita arco degenerado).
      slices += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" fill="${color}"/>`;
    } else {
      const [sx, sy] = polar(cx, cy, r, ang);
      const [ex, ey] = polar(cx, cy, r, ang2);
      const large = ang2 - ang > 180 ? 1 : 0;
      slices += `<path d="M ${r1(cx)} ${r1(cy)} L ${r1(sx)} ${r1(sy)} A ${r} ${r} 0 ${large} 1 ${r1(ex)} ${r1(ey)} Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>`;
    }
    const pct = Math.round(frac * 1000) / 10;
    const ly = legY0 + i * 22;
    leyenda += `<rect x="${legX}" y="${ly}" width="13" height="13" rx="2" fill="${color}"/>`;
    const etq = envolver(d.etiqueta, 34, 1)[0] ?? d.etiqueta;
    leyenda += `<text x="${legX + 19}" y="${ly + 11}" font-family="${SERIF}" font-size="11.5" fill="#1f2937">${esc(etq)} — ${esc(fmtNum(d.valor))}${esc(spec.unidad ?? "")} (${pct}%)</text>`;
    ang = ang2;
  });

  const hLeyenda = legY0 + datos.length * 22;
  const H = Math.max(cy + r + 8, hLeyenda) + (spec.fuente ? 22 : 10);
  const cuerpo =
    tituloSVG(spec.titulo, W, 22) +
    slices + leyenda +
    fuenteSVG(spec.fuente, W, H - 6);

  return placa(W, H, "", cuerpo);
}

export interface OpcionesSvg {
  /**
   * Omite el título dentro del SVG. Útil cuando el diagrama va dentro de un
   * marco "Figura N: <título>" (documento-web, LaTeX) y repetirlo sobraría.
   */
  sinTitulo?: boolean;
}

/**
 * Punto de entrada: convierte cualquier DiagramaSpec en un SVG completo.
 * Devuelve "" solo si el dato es irrepresentable (el llamador cae al placeholder).
 */
export function diagramaASvg(spec: DiagramaSpec, opts?: OpcionesSvg): string {
  try {
    const s: DiagramaSpec = opts?.sinTitulo && spec.titulo ? { ...spec, titulo: undefined } : spec;
    if (s.tipo === "arbol-problemas") return svgArbol(s);
    if (s.tipo === "grafico") {
      return s.variante === "pastel" ? svgPastel(s) : svgBarrasLineas(s);
    }
    return "";
  } catch {
    return "";
  }
}
