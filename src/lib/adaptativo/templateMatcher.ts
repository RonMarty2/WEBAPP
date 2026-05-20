/**
 * Matcher de plantillas para el servicio "Documento Adaptativo".
 *
 * Toma una guía analizada (resultado de POST /api/adaptativo/analyze-guide)
 * y la compara contra el catálogo de plantillas conocidas. Devuelve un
 * ranking ordenado con scores y un razonamiento legible.
 *
 * Estrategia de scoring (combinación lineal):
 *   - 50% features (booleanos: pide_hipotesis, pide_pestel, etc.)
 *   - 40% secciones (cuántas secciones de la guía matchean con
 *         secciones canónicas de la plantilla, vía sinónimos)
 *   - 10% rango de páginas (distancia entre páginas de la guía y
 *         páginas típicas de la plantilla)
 *
 * El matcher es 100% determinístico (no llama a IA). Esto lo hace rápido,
 * predecible y fácil de testear. Si en el futuro queremos un matcher
 * semántico más sofisticado, podemos agregarlo como segunda capa.
 */

import type { GuiaAnalizada, ResultadoMatching, PlantillaBaseId } from './types';
import {
  CATALOGO_PLANTILLAS,
  normalizarTextoParaMatching,
  type PlantillaCatalogo,
  type SeccionCanonica,
} from './templateCatalog';

const PESO_FEATURES = 0.5;
const PESO_SECCIONES = 0.4;
const PESO_PAGINAS = 0.1;

const FEATURES_COMPARABLES = [
  'pide_hipotesis',
  'pide_marco_teorico_extenso',
  'pide_pestel_porter',
  'pide_encuesta',
  'pide_analisis_cuantitativo',
] as const;

export function matchearGuiaContraPlantillas(guia: GuiaAnalizada): ResultadoMatching {
  const scoresParciales = CATALOGO_PLANTILLAS.map((plantilla) => {
    const feat = scoreFeatures(guia, plantilla);
    const sec = scoreSecciones(guia, plantilla);
    const pag = scorePaginas(guia, plantilla);
    const total = PESO_FEATURES * feat.score + PESO_SECCIONES * sec.score + PESO_PAGINAS * pag.score;
    return {
      plantilla,
      score: redondear(total),
      desglose: { features: feat, secciones: sec, paginas: pag },
    };
  });

  const ordenados = [...scoresParciales].sort((a, b) => b.score - a.score);
  const ganador = ordenados[0];

  return {
    plantilla_elegida: ganador.plantilla.id,
    score: ganador.score,
    razonamiento: construirRazonamiento(guia, ganador),
    ranking: ordenados.map((p) => ({
      plantilla: p.plantilla.id,
      nombre: p.plantilla.nombre,
      score: p.score,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Scoring por features (booleanos)
// ─────────────────────────────────────────────────────────────────────

interface ScoreFeatures {
  score: number;
  matches: string[];
  mismatches: string[];
}

function scoreFeatures(guia: GuiaAnalizada, plantilla: PlantillaCatalogo): ScoreFeatures {
  const matches: string[] = [];
  const mismatches: string[] = [];

  for (const feature of FEATURES_COMPARABLES) {
    const guiaPide = mapearFeatureGuia(guia, feature);
    const plantillaTiene = plantilla.features[feature];
    if (guiaPide === plantillaTiene) {
      matches.push(feature);
    } else {
      mismatches.push(feature);
    }
  }

  const score = matches.length / FEATURES_COMPARABLES.length;
  return { score, matches, mismatches };
}

function mapearFeatureGuia(guia: GuiaAnalizada, feature: (typeof FEATURES_COMPARABLES)[number]): boolean {
  switch (feature) {
    case 'pide_hipotesis':
      return guia.pide_hipotesis;
    case 'pide_marco_teorico_extenso':
      return guia.pide_marco_teorico;
    case 'pide_pestel_porter':
      // No tenemos un flag específico para PESTEL; inferimos de análisis cuantitativo
      // + ausencia de hipótesis + tono técnico. Caso típico: plan de negocio.
      return guia.pide_analisis_cuantitativo && !guia.pide_hipotesis && guia.tono === 'tecnico';
    case 'pide_encuesta':
      return guia.pide_encuesta;
    case 'pide_analisis_cuantitativo':
      return guia.pide_analisis_cuantitativo;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Scoring por secciones (sinónimos)
// ─────────────────────────────────────────────────────────────────────

interface ScoreSecciones {
  score: number;
  /** Secciones de la guía que matchearon contra alguna sección canónica */
  matched: { titulo_guia: string; seccion_canonica: string }[];
  /** Secciones de la guía que NO matchearon (= gaps que la IA improvisará) */
  no_matched: string[];
  /** Secciones canónicas obligatorias que la plantilla cubre pero la guía no pidió */
  cubiertas_no_pedidas: string[];
}

function scoreSecciones(guia: GuiaAnalizada, plantilla: PlantillaCatalogo): ScoreSecciones {
  const matched: ScoreSecciones['matched'] = [];
  const no_matched: string[] = [];
  const cubiertasPedidasIds = new Set<string>();

  for (const seccionGuia of guia.secciones) {
    const tituloNorm = normalizarTextoParaMatching(seccionGuia.titulo);
    const descNorm = normalizarTextoParaMatching(seccionGuia.descripcion);
    const textoBusqueda = `${tituloNorm} ${descNorm}`;

    const seccionCanonica = encontrarSeccionCanonica(textoBusqueda, plantilla.secciones_canonicas);
    if (seccionCanonica) {
      matched.push({
        titulo_guia: seccionGuia.titulo,
        seccion_canonica: seccionCanonica.titulo,
      });
      cubiertasPedidasIds.add(seccionCanonica.id);
    } else {
      no_matched.push(seccionGuia.titulo);
    }
  }

  const cubiertas_no_pedidas = plantilla.secciones_canonicas
    .filter((s) => s.obligatoria && !cubiertasPedidasIds.has(s.id))
    .map((s) => s.titulo);

  const totalGuia = guia.secciones.length;
  const score = totalGuia > 0 ? matched.length / totalGuia : 0;

  return { score, matched, no_matched, cubiertas_no_pedidas };
}

function encontrarSeccionCanonica(
  textoBusqueda: string,
  secciones: SeccionCanonica[],
): SeccionCanonica | undefined {
  for (const sec of secciones) {
    for (const sinonimo of sec.sinonimos) {
      const sinNorm = normalizarTextoParaMatching(sinonimo);
      if (textoBusqueda.includes(sinNorm)) {
        return sec;
      }
    }
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────
// Scoring por rango de páginas
// ─────────────────────────────────────────────────────────────────────

interface ScorePaginas {
  score: number;
  guia_pp: { min: number; max: number };
  plantilla_pp: { min: number; max: number };
  hay_overlap: boolean;
}

function scorePaginas(guia: GuiaAnalizada, plantilla: PlantillaCatalogo): ScorePaginas {
  const g = guia.paginas_estimadas;
  const p = plantilla.features.paginas_tipicas;

  const overlapInicio = Math.max(g.min, p.min);
  const overlapFin = Math.min(g.max, p.max);
  const hayOverlap = overlapInicio <= overlapFin;

  if (hayOverlap) {
    const tamanoOverlap = overlapFin - overlapInicio + 1;
    const tamanoUnion = Math.max(g.max, p.max) - Math.min(g.min, p.min) + 1;
    const score = tamanoOverlap / tamanoUnion;
    return { score, guia_pp: g, plantilla_pp: p, hay_overlap: true };
  }

  // Sin overlap: score basado en distancia entre los rangos
  const distancia = overlapInicio - overlapFin;
  const escala = Math.max(g.max, p.max);
  const score = Math.max(0, 1 - distancia / escala);
  return { score, guia_pp: g, plantilla_pp: p, hay_overlap: false };
}

// ─────────────────────────────────────────────────────────────────────
// Razonamiento legible
// ─────────────────────────────────────────────────────────────────────

function construirRazonamiento(
  guia: GuiaAnalizada,
  ganador: { plantilla: PlantillaCatalogo; score: number; desglose: { features: ScoreFeatures; secciones: ScoreSecciones; paginas: ScorePaginas } },
): string {
  const { plantilla, desglose } = ganador;
  const fragmentos: string[] = [];

  const seccionesMatchedNombres = desglose.secciones.matched
    .slice(0, 3)
    .map((m) => `"${m.seccion_canonica}"`)
    .join(', ');

  if (desglose.secciones.matched.length > 0) {
    fragmentos.push(
      `La guía pide ${seccionesMatchedNombres}${desglose.secciones.matched.length > 3 ? ' y más' : ''}, que coinciden con la estructura de ${plantilla.nombre}.`,
    );
  }

  // Señales fuertes del feature match
  const señales: string[] = [];
  if (guia.pide_hipotesis && plantilla.features.pide_hipotesis) {
    señales.push('exige hipótesis explícita');
  }
  if (!guia.pide_hipotesis && !plantilla.features.pide_hipotesis) {
    señales.push('no exige hipótesis');
  }
  if (guia.pide_marco_teorico && plantilla.features.pide_marco_teorico_extenso) {
    señales.push('pide marco teórico extenso');
  }
  if (guia.pide_encuesta && plantilla.features.pide_encuesta) {
    señales.push('incluye encuesta o investigación de mercado');
  }
  if (
    guia.pide_analisis_cuantitativo &&
    !guia.pide_hipotesis &&
    plantilla.features.pide_pestel_porter
  ) {
    señales.push('tiene componente de análisis estratégico (PESTEL/Porter)');
  }

  if (señales.length > 0) {
    fragmentos.push(`Además, ${señales.slice(0, 3).join(', ')}.`);
  }

  // Páginas
  if (desglose.paginas.hay_overlap) {
    fragmentos.push(
      `La extensión solicitada (${guia.paginas_estimadas.min}-${guia.paginas_estimadas.max} pp.) encaja con el rango típico de esta plantilla (${plantilla.features.paginas_tipicas.min}-${plantilla.features.paginas_tipicas.max} pp.).`,
    );
  }

  // Gaps que la IA improvisará
  if (desglose.secciones.no_matched.length > 0) {
    const muestra = desglose.secciones.no_matched.slice(0, 2).join('", "');
    fragmentos.push(
      `Las secciones "${muestra}"${desglose.secciones.no_matched.length > 2 ? ' y otras' : ''} no existen en la plantilla y se generarán como fases adaptativas.`,
    );
  }

  return fragmentos.join(' ');
}

// ─────────────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────────────

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Helper para uso externo (planBuilder): obtiene el desglose completo
 * del match para construir el plan adaptativo.
 */
export function obtenerDesgloseMatching(guia: GuiaAnalizada, plantillaId: PlantillaBaseId) {
  const plantilla = CATALOGO_PLANTILLAS.find((p) => p.id === plantillaId);
  if (!plantilla) return null;
  return {
    plantilla,
    features: scoreFeatures(guia, plantilla),
    secciones: scoreSecciones(guia, plantilla),
    paginas: scorePaginas(guia, plantilla),
  };
}
