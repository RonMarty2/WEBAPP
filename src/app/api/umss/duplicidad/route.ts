/**
 * Endpoint público: verifica si un tema propuesto ya fue presentado en
 * atlas.umss.edu.bo (regla de Guía 1 UMSS: ≥5 años de diferencia para
 * re-presentar un tema similar).
 *
 * Estrategia best-effort en 3 capas:
 *   1. Intenta hacer fetch al atlas con timeout corto.
 *   2. Si responde, parsea HTML de DSpace con heurísticas defensivas.
 *   3. Si falla (red, CORS, atlas caído, parser sin match), devuelve
 *      `modo: "manual"` con la URL para que el estudiante verifique
 *      directamente.
 *
 * POST /api/umss/duplicidad
 * Body: { tema: string, anio?: number }
 */

import { NextResponse } from "next/server";
import {
  generarUrlAtlasUmss,
  evaluarDuplicidad,
  type TrabajoExistente,
  ATLAS_UMSS_URL,
} from "@/lib/umssValidators";

const FETCH_TIMEOUT_MS = 6000;

export async function POST(req: Request) {
  let body: { tema?: unknown; anio?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const tema = typeof body.tema === "string" ? body.tema.trim() : "";
  if (!tema || tema.length < 6) {
    return NextResponse.json(
      { error: "El tema debe tener al menos 6 caracteres significativos." },
      { status: 400 },
    );
  }

  const anioActual =
    typeof body.anio === "number" && Number.isFinite(body.anio)
      ? Math.floor(body.anio)
      : new Date().getFullYear();

  const urlAtlas = generarUrlAtlasUmss(tema);

  // ── Intento de verificación automática ──────────────────────────────
  let trabajosDetectados: TrabajoExistente[] = [];
  let modo: "automatico" | "manual" = "manual";
  let advertencia: string | null = null;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(urlAtlas, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 ScribeUMSS/1.0 (verificacion-duplicidad-academica)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    clearTimeout(timer);

    if (res.ok) {
      const html = await res.text();
      trabajosDetectados = parsearDspaceHtml(html).slice(0, 15);
      modo = "automatico";
      if (trabajosDetectados.length === 0) {
        advertencia =
          "El atlas respondió pero no se detectaron trabajos. Verificá manualmente en el enlace abajo (el parser puede haber fallado si el sitio cambió).";
      }
    } else {
      advertencia = `El atlas respondió con código ${res.status}. Verificá manualmente.`;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    advertencia = `No se pudo conectar con el atlas (${msg.includes("abort") ? "timeout" : "red"}). Verificá manualmente en el enlace.`;
  }

  const evaluacion = evaluarDuplicidad(tema, trabajosDetectados, anioActual);

  return NextResponse.json({
    modo,
    url_atlas: urlAtlas,
    url_atlas_home: ATLAS_UMSS_URL,
    anio_consultado: anioActual,
    trabajos_detectados: trabajosDetectados,
    evaluacion,
    advertencia,
  });
}

// ─── DSpace HTML parser (defensivo) ──────────────────────────────────

/**
 * Parser heurístico de HTML de DSpace 5/6 (usado por atlas.umss.edu.bo).
 * Defensivo: si el parsing falla, retorna [] y el caller cae al modo manual.
 *
 * NO confía en una estructura específica — busca patrones genéricos:
 *   - Filas que contengan link a /handle/...
 *   - Fechas YYYY-MM-DD cerca
 *   - Texto que parezca título
 */
function parsearDspaceHtml(html: string): TrabajoExistente[] {
  const trabajos: TrabajoExistente[] = [];

  // Patrón 1: filas de tabla de resultados estándar DSpace
  const filaPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const handleLinkPattern = /<a[^>]*href="(\/handle\/[^"]+)"[^>]*>([^<]{8,250})<\/a>/;
  const fechaPattern = /(\d{4})-\d{1,2}(?:-\d{1,2})?/;
  const autorPattern = /<td[^>]*>([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ., ]{4,80}(?:;[^<]{4,80})?)<\/td>/;

  let match: RegExpExecArray | null;
  let visited = 0;
  const MAX_FILAS = 60;

  while ((match = filaPattern.exec(html)) !== null && visited < MAX_FILAS) {
    visited++;
    const fila = match[1];
    const linkMatch = fila.match(handleLinkPattern);
    if (!linkMatch) continue;

    const tituloRaw = linkMatch[2].replace(/\s+/g, " ").trim();
    if (!tituloRaw || tituloRaw.length < 8) continue;

    const fechaMatch = fila.match(fechaPattern);
    const anio = fechaMatch ? parseInt(fechaMatch[1], 10) : NaN;
    if (!Number.isFinite(anio) || anio < 1990 || anio > 2100) continue;

    const autorMatch = fila.match(autorPattern);
    const autor = autorMatch ? autorMatch[1].replace(/\s+/g, " ").trim() : undefined;

    trabajos.push({
      titulo: tituloRaw,
      autor,
      anio,
      url: `${ATLAS_UMSS_URL}${linkMatch[1]}`,
    });
  }

  // Patrón 2 (fallback): si no encontró nada con filas, buscar todos los links
  // a /handle/ con texto significativo (vista de lista alternativa de DSpace).
  if (trabajos.length === 0) {
    const linkGlobal = /<a[^>]*href="(\/handle\/[^"]+)"[^>]*>([^<]{15,250})<\/a>/g;
    let m: RegExpExecArray | null;
    const vistosTitulos = new Set<string>();
    while ((m = linkGlobal.exec(html)) !== null && trabajos.length < 15) {
      const titulo = m[2].replace(/\s+/g, " ").trim();
      if (vistosTitulos.has(titulo)) continue;
      vistosTitulos.add(titulo);
      trabajos.push({
        titulo,
        anio: new Date().getFullYear(), // sin fecha confiable → asumir reciente (conservador)
        url: `${ATLAS_UMSS_URL}${m[1]}`,
      });
    }
  }

  return trabajos;
}
