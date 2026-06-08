/**
 * Generador de paletas armoniosas SIN llamadas a IA.
 *
 * Basado en teoría del color clásica (rueda HSL). Toma un color semilla
 * y devuelve los 5 colores de la paleta según el esquema elegido. Cuesta
 * $0 — todo es matemática local.
 *
 * Por qué no usar IA acá: la IA generativa para paletas suele dar resultados
 * inconsistentes y caros. Los esquemas matemáticos (monocromático/análogo/
 * complementario/triada/tetrada) producen paletas profesionales en 0ms.
 *
 * Si después quieres "afinar" una paleta con IA, se puede pasar la paleta
 * generada como contexto a un prompt — pero la base se construye acá.
 */

import type { EsquemaPaleta, Paleta } from "@/types/identidad";

// ─── Conversiones HEX ↔ HSL ──────────────────────────────────────────────

interface HSL { h: number; s: number; l: number }

export function hexToHsl(hex: string): HSL {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: HSL): string {
  const hh = ((h % 360) + 360) % 360 / 360;
  const ss = Math.max(0, Math.min(100, s)) / 100;
  const ll = Math.max(0, Math.min(100, l)) / 100;

  function f(n: number): number {
    const k = (n + hh * 12) % 12;
    const a = ss * Math.min(ll, 1 - ll);
    return ll - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// ─── Validación ──────────────────────────────────────────────────────────

const HEX_REGEX = /^#?([0-9a-f]{6})$/i;

export function esHexValido(hex: string): boolean {
  return HEX_REGEX.test(hex.trim());
}

export function normalizarHex(hex: string): string {
  const m = HEX_REGEX.exec(hex.trim());
  if (!m) throw new Error(`Color hex inválido: "${hex}"`);
  return "#" + m[1].toLowerCase();
}

// ─── Generadores por esquema ─────────────────────────────────────────────

function rotarMatiz(hsl: HSL, grados: number): HSL {
  return { ...hsl, h: (hsl.h + grados + 360) % 360 };
}

function ajustarLuminosidad(hsl: HSL, delta: number): HSL {
  return { ...hsl, l: Math.max(0, Math.min(100, hsl.l + delta)) };
}

function ajustarSaturacion(hsl: HSL, delta: number): HSL {
  return { ...hsl, s: Math.max(0, Math.min(100, hsl.s + delta)) };
}

/**
 * Genera 5 colores a partir de un seed según el esquema elegido.
 * El seed debe ser hex (#rrggbb). Devuelve la paleta sin justificación
 * — esa la agrega el caller con contexto del brief.
 */
export function generarPaleta(seedHex: string, esquema: EsquemaPaleta): Omit<Paleta, "justificacion"> {
  const seed = hexToHsl(normalizarHex(seedHex));

  let primario: HSL = seed;
  let secundario: HSL;
  let acento: HSL;

  switch (esquema) {
    case "monocromatica":
      // Variaciones de luminosidad y saturación del mismo matiz.
      secundario = ajustarLuminosidad(seed, +15);
      acento = ajustarLuminosidad(ajustarSaturacion(seed, +10), -20);
      break;
    case "analoga":
      // Vecinos en la rueda (+30° y -30°).
      secundario = rotarMatiz(seed, 30);
      acento = rotarMatiz(seed, -30);
      break;
    case "complementaria":
      // Opuesto exacto (+180°) — alto contraste.
      secundario = ajustarLuminosidad(seed, +20);
      acento = rotarMatiz(seed, 180);
      break;
    case "triada":
      // 3 colores equidistantes (+120°, +240°).
      secundario = rotarMatiz(seed, 120);
      acento = rotarMatiz(seed, 240);
      break;
    case "tetrada":
      // Rectángulo en la rueda: seed, +60°, +180°, +240°.
      secundario = rotarMatiz(seed, 60);
      acento = rotarMatiz(seed, 180);
      break;
    case "libre":
    default:
      // Devolver seed para los 3 — el caller llenará a mano.
      secundario = seed;
      acento = seed;
      break;
  }

  // Neutros derivados: gris muy claro y gris muy oscuro con leve tinte
  // del primario (para que la paleta se sienta cohesiva, no plana).
  const neutroClaro: HSL = { h: primario.h, s: 6, l: 96 };
  const neutroOscuro: HSL = { h: primario.h, s: 12, l: 14 };

  return {
    primario: hslToHex(primario),
    secundario: hslToHex(secundario),
    acento: hslToHex(acento),
    neutroClaro: hslToHex(neutroClaro),
    neutroOscuro: hslToHex(neutroOscuro),
    esquema,
  };
}

// ─── Sugerencia de seed por sector ───────────────────────────────────────

/**
 * Mapa de sector → color seed sugerido. Basado en psicología del color
 * estándar para cada rubro. Es solo un PUNTO DE PARTIDA editable por el
 * alumno; ningún sector está casado con un color específico.
 */
export const SEMILLA_POR_SECTOR: Record<string, { hex: string; razon: string }> = {
  gastronomia:    { hex: "#c8581f", razon: "Naranja terracota: estimula apetito y comunica calidez artesanal." },
  cafeteria:      { hex: "#6b4226", razon: "Marrón café: cercanía, profundidad, ritual diario." },
  tecnologia:     { hex: "#2563eb", razon: "Azul tecnológico: confianza, precisión, innovación." },
  salud:          { hex: "#0f9b8e", razon: "Verde aqua: vitalidad, equilibrio, profesionalismo médico." },
  educacion:      { hex: "#4f46e5", razon: "Índigo: conocimiento, autoridad académica, claridad." },
  belleza:        { hex: "#d946ef", razon: "Magenta: feminidad moderna, creatividad, glamour." },
  finanzas:       { hex: "#0f172a", razon: "Azul oscuro casi negro: solidez, seriedad fiduciaria." },
  agricultura:    { hex: "#65a30d", razon: "Verde lima: tierra fértil, frescura, sustentabilidad." },
  textil:         { hex: "#7c2d12", razon: "Caoba: artesanía, tradición, materialidad." },
  construccion:   { hex: "#facc15", razon: "Amarillo casco: seguridad, visibilidad, construcción." },
  turismo:        { hex: "#0ea5e9", razon: "Celeste cielo: aventura, libertad, descanso." },
  retail:         { hex: "#dc2626", razon: "Rojo retail: urgencia, atracción, acción." },
  servicios:      { hex: "#475569", razon: "Pizarra: neutralidad, formalidad, versatilidad." },
  arte:           { hex: "#9333ea", razon: "Púrpura artístico: creatividad, originalidad, lujo." },
  deportes:       { hex: "#16a34a", razon: "Verde campo: vitalidad, deporte al aire libre." },
  // Catch-all para sectores no listados — neutral inteligente
  generico:       { hex: "#4338ca", razon: "Índigo: versátil, transmite profesionalismo y modernidad sin sesgo." },
};

/**
 * Dado un texto de sector libre del alumno, intenta mapear a una semilla
 * sugerida buscando palabras clave. Si no encuentra match, devuelve el
 * genérico.
 */
export function sugerirSemillaPorSector(sector: string): { hex: string; razon: string } {
  const s = sector.toLowerCase();
  const palabras: Array<[string[], keyof typeof SEMILLA_POR_SECTOR]> = [
    [["café", "cafe", "cafeter"], "cafeteria"],
    [["gastr", "comida", "restaurant", "alimento"], "gastronomia"],
    [["tecnol", "software", "app", "digital", "iot"], "tecnologia"],
    [["salud", "medic", "farmac", "clinic"], "salud"],
    [["educ", "escuela", "univers", "academ"], "educacion"],
    [["belleza", "estétic", "estetic", "cosmét", "spa"], "belleza"],
    [["financ", "banca", "seguro"], "finanzas"],
    [["agric", "agro", "granj", "campo"], "agricultura"],
    [["textil", "ropa", "moda", "confecc"], "textil"],
    [["construcc", "obra", "albañil"], "construccion"],
    [["turism", "hotel", "agencia"], "turismo"],
    [["retail", "tienda", "supermerc"], "retail"],
    [["servic"], "servicios"],
    [["arte", "diseño", "galer"], "arte"],
    [["deport", "gimnas", "fitness"], "deportes"],
  ];
  for (const [keys, sectorKey] of palabras) {
    if (keys.some((k) => s.includes(k))) return SEMILLA_POR_SECTOR[sectorKey];
  }
  return SEMILLA_POR_SECTOR.generico;
}

// ─── Contraste WCAG (accesibilidad) ──────────────────────────────────────

/**
 * Devuelve el ratio de contraste WCAG entre dos colores hex.
 * Útil para chequear si el texto sobre la paleta será legible.
 * 4.5 es el mínimo para texto normal AA, 7 para AAA.
 */
export function contrasteWCAG(hexA: string, hexB: string): number {
  function luminancia(hex: string): number {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const lin = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  const lA = luminancia(hexA);
  const lB = luminancia(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}
