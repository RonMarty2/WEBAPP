/**
 * Inspector de FORMATO (por código, exacto) para UCB San Pablo.
 *
 * Compara lo que genera el armador de LaTeX (preámbulo + carátula + página del
 * tribunal) contra los requisitos de `requisitos/ucb-2020.ts`. No usa IA y no
 * modifica nada: solo informa qué cumple y qué no.
 */

import type { Hallazgo } from "./formato-unifranz";

const PT_A_MM = 25.4 / 72.27;

const ok = (requisitoId: string, esperado: string, encontrado: string): Hallazgo =>
  ({ requisitoId, estado: "cumple", esperado, encontrado });
const mal = (requisitoId: string, esperado: string, encontrado: string): Hallazgo =>
  ({ requisitoId, estado: "incumple", esperado, encontrado });
const comparar = (requisitoId: string, esperado: string, encontrado: string, cumple: boolean): Hallazgo =>
  cumple ? ok(requisitoId, esperado, encontrado) : mal(requisitoId, esperado, encontrado);

/** Línea que contiene `texto`, con su tamaño de letra, negrilla y cursiva. */
function leerLinea(bloque: string, texto: RegExp) {
  const linea = bloque.split("\n").find((l) => texto.test(l));
  if (!linea) return null;
  return {
    pt: Number(linea.match(/fontsize\{(\d+(?:\.\d+)?)pt\}/)?.[1] ?? NaN),
    negrilla: /\\bfseries/.test(linea),
    cursiva: /\\itshape/.test(linea),
    texto: linea,
  };
}

export function inspeccionarFormatoUcb(preambulo: string, caratula: string, tribunal: string): Hallazgo[] {
  const h: Hallazgo[] = [];

  // ── Papel y márgenes ──
  const geo = preambulo.match(/\\geometry\{([^}]*)\}/)?.[1] ?? "";
  const cm = (clave: string) => Number(geo.match(new RegExp(`${clave}=([\\d.]+)cm`))?.[1] ?? NaN);
  const m = { izq: cm("left"), der: cm("right"), sup: cm("top"), inf: cm("bottom") };
  h.push(comparar("fmt-margenes", "izq 3.5 · der 3 · sup 3 · inf 3 cm",
    `izq ${m.izq} · der ${m.der} · sup ${m.sup} · inf ${m.inf} cm`,
    m.izq === 3.5 && m.der === 3 && m.sup === 3 && m.inf === 3));
  h.push(comparar("fmt-papel", "tamaño carta", /letterpaper/.test(geo) ? "letterpaper" : "no declarado", /letterpaper/.test(geo)));

  // ── Fuente: mathptmx es un clon de Times, equivalente a Times New Roman ──
  const tamBase = Number(preambulo.match(/\\documentclass\[[^\]]*?(\d+)pt/)?.[1] ?? NaN);
  const times = /mathptmx|newtxtext|\\usepackage\{times\}|tgtermes/.test(preambulo);
  h.push(comparar("fmt-fuente", "Times New Roman 12 pt", `${times ? "Times" : "otra fuente"} ${tamBase} pt`, times && tamBase === 12));

  // ── Interlineado y párrafos ──
  const interlineado = /\\onehalfspacing|\\setstretch\{1\.5\}/.test(preambulo);
  h.push(comparar("fmt-interlineado", "interlineado 1.5", interlineado ? "1.5" : "otro", interlineado));
  const parindent = preambulo.match(/\\setlength\{\\parindent\}\{(\d+)pt\}/)?.[1];
  const parskipPt = Number(preambulo.match(/\\setlength\{\\parskip\}\{(\d+(?:\.\d+)?)pt/)?.[1] ?? NaN);
  const parskipMm = Math.round(parskipPt * PT_A_MM * 10) / 10;
  h.push(comparar("fmt-parrafos", "sin sangría · espacio entre párrafos de 12 mm como máximo",
    `sangría ${parindent ?? "?"} pt · espacio ${parskipMm} mm`, parindent === "0" && parskipMm > 0 && parskipMm <= 12));

  // ── Numeración ──
  const piePag = /\\rfoot\{\\thepage\}/.test(preambulo);
  h.push(comparar("fmt-numeracion", "número abajo a la derecha", piePag ? "\\rfoot{\\thepage}" : "no encontrado", piePag));

  // ── Carátula ──
  const logo = caratula.match(/includegraphics\[width=([\d.]+)cm,height=([\d.]+)cm/);
  if (logo) h.push(comparar("car-escudo", "12 cm de ancho × 5 cm de alto", `${logo[1]} × ${logo[2]} cm`, logo[1] === "12" && logo[2] === "5"));

  const lineaCar = (id: string, texto: RegExp, esperado: string, ptEsperado: number, extra: (l: NonNullable<ReturnType<typeof leerLinea>>) => boolean, descExtra: (l: NonNullable<ReturnType<typeof leerLinea>>) => string) => {
    const l = leerLinea(caratula, texto);
    if (!l) return h.push({ requisitoId: id, estado: "no_verificable", esperado, encontrado: "no se encontró en la carátula" });
    h.push(comparar(id, esperado, `${l.pt} pt${descExtra(l)}`, l.pt === ptEsperado && extra(l)));
  };
  const negrillaTxt = (l: { negrilla: boolean }) => (l.negrilla ? " · negrilla" : " · sin negrilla");
  lineaCar("car-departamento", /d\.departamento/.test(caratula) ? /departamento|\$\{escLatex\(d\.departamento\)\}|Departamento/ : /fontsize\{14pt\}/,
    "14 pt", 14, () => true, () => "");
  lineaCar("car-titulo", /fontsize\{16pt\}/, "16 pt · negrilla", 16, (l) => l.negrilla, negrillaTxt);
  lineaCar("car-tipo", /itshape/, "12 pt · cursiva", 12, (l) => l.cursiva, (l) => (l.cursiva ? " · cursiva" : " · sin cursiva"));
  lineaCar("car-autor", /fontsize\{14pt\}[^\n]*bfseries/, "14 pt · negrilla", 14, (l) => l.negrilla, negrillaTxt);
  lineaCar("car-lugar-fecha", /\s--\s/, "12 pt · sin negrilla", 12, (l) => !l.negrilla, negrillaTxt);

  // ── Tribunal examinador ──
  const trib = leerLinea(tribunal, /MakeUppercase\{Tribunal Examinador\}/);
  h.push(trib
    ? comparar("pre-tribunal", "TRIBUNAL EXAMINADOR · 12 pt · mayúscula · negrilla", `${trib.pt} pt${negrillaTxt(trib)}`, trib.pt === 12 && trib.negrilla)
    : { requisitoId: "pre-tribunal", estado: "no_verificable", esperado: "título del tribunal", encontrado: "no se encontró" });

  return h;
}
