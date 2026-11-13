/**
 * Inspector de FORMATO (por código, exacto) para UNIFRANZ.
 *
 * Compara lo que genera el armador de LaTeX (preámbulo + carátula) contra los
 * requisitos de `requisitos/unifranz-2017.ts`. No usa IA y no modifica nada:
 * solo informa qué cumple y qué no.
 *
 * Es una función pura (recibe texto, devuelve hallazgos) para poder probarla
 * sin levantar la aplicación.
 */

export type EstadoHallazgo = "cumple" | "incumple" | "aproximado" | "no_verificable";

export interface Hallazgo {
  /** ID del requisito en `requisitos/unifranz-2017.ts`. */
  requisitoId: string;
  estado: EstadoHallazgo;
  esperado: string;
  encontrado: string;
}

const ok = (requisitoId: string, esperado: string, encontrado: string): Hallazgo =>
  ({ requisitoId, estado: "cumple", esperado, encontrado });
const mal = (requisitoId: string, esperado: string, encontrado: string): Hallazgo =>
  ({ requisitoId, estado: "incumple", esperado, encontrado });
const comparar = (requisitoId: string, esperado: string, encontrado: string, cumple: boolean): Hallazgo =>
  cumple ? ok(requisitoId, esperado, encontrado) : mal(requisitoId, esperado, encontrado);

/** Tamaño (pt), negrilla y cursiva del `\titleformat` de un nivel de sección. */
function leerTitulo(preambulo: string, nivel: "section" | "subsection" | "subsubsection") {
  const m = preambulo.match(new RegExp(`\\\\titleformat\\{\\\\${nivel}\\}\\s*\\n?\\s*\\{([^\\n]*)\\}`));
  if (!m) return null;
  const formato = m[1];
  return {
    pt: Number(formato.match(/fontsize\{(\d+(?:\.\d+)?)pt\}/)?.[1] ?? NaN),
    negrilla: /\\bfseries/.test(formato),
    cursiva: /\\itshape/.test(formato),
  };
}

/** Línea de la carátula que contiene `texto`, con su tamaño de letra y negrilla. */
function leerLineaCaratula(caratula: string, texto: RegExp) {
  const linea = caratula.split("\n").find((l) => texto.test(l));
  if (!linea) return null;
  return {
    pt: Number(linea.match(/fontsize\{(\d+(?:\.\d+)?)pt\}/)?.[1] ?? NaN),
    negrilla: /\\bfseries/.test(linea),
  };
}

export function inspeccionarFormatoUnifranz(preambulo: string, caratula: string): Hallazgo[] {
  const h: Hallazgo[] = [];

  // ── Papel y márgenes ──
  const geo = preambulo.match(/\\geometry\{([^}]*)\}/)?.[1] ?? "";
  const cm = (clave: string) => Number(geo.match(new RegExp(`${clave}=([\\d.]+)cm`))?.[1] ?? NaN);
  const margenes = { top: cm("top"), bottom: cm("bottom"), left: cm("left"), right: cm("right") };
  h.push(comparar(
    "fmt-margenes",
    "sup 2.5 · inf 2.5 · izq 3.5 · der 2.5 cm",
    `sup ${margenes.top} · inf ${margenes.bottom} · izq ${margenes.left} · der ${margenes.right} cm`,
    margenes.top === 2.5 && margenes.bottom === 2.5 && margenes.left === 3.5 && margenes.right === 2.5,
  ));
  h.push(comparar("fmt-papel", "tamaño carta", /letterpaper/.test(geo) ? "letterpaper" : "no declarado", /letterpaper/.test(geo)));

  // ── Fuente ──
  const tamBase = Number(preambulo.match(/\\documentclass\[[^\]]*?(\d+)pt/)?.[1] ?? NaN);
  const verdanaReal = /fontspec/.test(preambulo) && /Verdana/.test(preambulo.replace(/%.*$/gm, ""));
  const sustituta = /helvet|\\sfdefault|\\renewcommand\{\\familydefault\}/.test(preambulo);
  h.push(
    verdanaReal && tamBase === 10
      ? ok("fmt-fuente", "Verdana 10 pt, color negro", "Verdana 10 pt")
      : {
          requisitoId: "fmt-fuente",
          estado: sustituta ? "aproximado" : "incumple",
          esperado: "Verdana 10 pt, color negro",
          encontrado: `${verdanaReal ? "Verdana" : sustituta ? "fuente sustituta (Helvetica)" : "otra fuente"} a ${tamBase} pt`,
        },
  );

  // ── Párrafo ──
  const interlineado = /\\onehalfspacing|\\setstretch\{1\.5\}|\\linespread\{1\.2[0-9]*\}/.test(preambulo);
  const parindent = preambulo.match(/\\setlength\{\\parindent\}\{(\d+)pt\}/)?.[1];
  const parskip = Number(preambulo.match(/\\setlength\{\\parskip\}\{(\d+)pt/)?.[1] ?? NaN);
  h.push(comparar("fmt-parrafo", "interlineado 1.5 · 6 pt después · sangría 0",
    `interlineado 1.5: ${interlineado ? "sí" : "no"} · parskip ${parskip} pt · parindent ${parindent ?? "?"} pt`,
    interlineado && parskip === 6 && parindent === "0"));

  // ── Numeración ──
  const piePag = /\\rfoot\{\\thepage\}/.test(preambulo);
  h.push(comparar("fmt-numeracion", "número abajo a la derecha", piePag ? "\\rfoot{\\thepage}" : "no encontrado", piePag));

  // ── Títulos ──
  const esperadoTitulo = (id: string, nivel: "section" | "subsection" | "subsubsection", pt: number, cursiva: boolean) => {
    const t = leerTitulo(preambulo, nivel);
    const esperado = `${pt} pt · negrilla${cursiva ? " · cursiva" : ""}`;
    if (!t) return h.push({ requisitoId: id, estado: "no_verificable", esperado, encontrado: "no se encontró el formato" });
    h.push(comparar(id, esperado, `${t.pt} pt · ${t.negrilla ? "negrilla" : "sin negrilla"}${t.cursiva ? " · cursiva" : ""}`,
      t.pt === pt && t.negrilla && t.cursiva === cursiva));
  };
  esperadoTitulo("tit-nivel1", "section", 12, false);
  esperadoTitulo("tit-nivel2", "subsection", 10, false);
  esperadoTitulo("tit-nivel3", "subsubsection", 10, true);
  h.push(comparar("tit-capitulo", "14 pt · MAYÚSCULAS · negrilla",
    /fontsize\{14pt\}[^\n]*bfseries[^\n]*MakeUppercase/.test(preambulo) ? "14 pt · MAYÚSCULAS · negrilla" : "no coincide",
    /fontsize\{14pt\}[^\n]*bfseries[^\n]*MakeUppercase/.test(preambulo)));

  // ── Carátula ──
  const universidad = leerLineaCaratula(caratula, /UNIVERSIDAD/);
  h.push(universidad
    ? comparar("car-encabezado", "universidad 18 pt · facultad y carrera 16 pt", `universidad ${universidad.pt} pt`, universidad.pt === 18)
    : { requisitoId: "car-encabezado", estado: "no_verificable", esperado: "universidad 18 pt", encontrado: "sin carátula" });

  const titulo = leerLineaCaratula(caratula, /textquotedblleft/);
  if (titulo) h.push(comparar("car-titulo", "18 pt · negrilla · entre comillas", `${titulo.pt} pt`, titulo.pt === 18 && titulo.negrilla));

  const logo = caratula.match(/includegraphics\[width=([\d.]+)cm,height=([\d.]+)cm/);
  if (logo) h.push(comparar("car-logo", "6 cm de ancho × 5.5 cm de alto", `${logo[1]} × ${logo[2]} cm`, logo[1] === "6" && logo[2] === "5.5"));

  const modalidadAlineada = /flushright|raggedleft/.test(caratula);
  h.push(comparar("car-modalidad", "14 pt · negrilla · alineado a la derecha",
    modalidadAlineada ? "alineado a la derecha" : "centrado", modalidadAlineada));

  const postulante = leerLineaCaratula(caratula, /POSTULANTE/);
  if (postulante) h.push(comparar("car-postulante-tutor", "12 pt · nombres en minúscula y sin negrilla",
    `${postulante.pt} pt · ${postulante.negrilla ? "con negrilla" : "sin negrilla"}`, postulante.pt === 12 && !postulante.negrilla));

  const ciudadLinea = caratula.split("\n").find((l) => /\s--\s/.test(l));
  if (ciudadLinea) h.push(comparar("car-ciudad-anio", "12 pt · minúscula y sin negrilla",
    /\\bfseries/.test(ciudadLinea) ? "con negrilla" : "sin negrilla", !/\\bfseries/.test(ciudadLinea)));

  return h;
}

/** Resumen corto para mostrar: cuántos cumplen, cuáles no. */
export function resumirHallazgos(hallazgos: Hallazgo[]) {
  const por = (e: EstadoHallazgo) => hallazgos.filter((x) => x.estado === e);
  return {
    total: hallazgos.length,
    cumplen: por("cumple").length,
    incumplen: por("incumple"),
    aproximados: por("aproximado"),
    noVerificables: por("no_verificable"),
  };
}
