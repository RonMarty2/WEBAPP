/**
 * GET /api/admin/feedback-insights
 *
 * Analiza los feedback que los estudiantes dieron al "Aplicar cambios" o
 * por chat de correcciones. Detecta patrones recurrentes para que el admin
 * sepa qué mejorar en el megaprompt maestro.
 *
 * Devuelve:
 *   - totalFeedbacks
 *   - porFase: cuáles fases reciben más feedback (= más débiles)
 *   - porPrograma: distribución por programa académico
 *   - topPalabrasClave: palabras más mencionadas (limpias de stopwords)
 *   - topFrasesAccion: verbos+complemento más recurrentes (ej: "ampliar antecedentes")
 *   - sugerenciasPorFase: recomendaciones automáticas para mejorar cada megaprompt
 *   - feedbacksRecientes: últimas 30 entradas para inspección manual
 *
 * Solo admin (requireAdmin).
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { loadFromDisk, type PhaseFeedback } from "@/lib/persistence";

// Stopwords en español + términos académicos demasiado generales
const STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "y", "o", "en", "del", "al",
  "para", "por", "con", "sin", "su", "sus", "se", "este", "esta", "esto",
  "como", "que", "es", "son", "ha", "han", "no", "si", "lo", "mas", "menos",
  "me", "mi", "mis", "te", "tu", "tus", "le", "les", "yo", "nos", "tú",
  "muy", "algo", "todo", "toda", "todos", "todas", "tambien", "tan", "ya",
  "pero", "porque", "cuando", "donde", "como", "quien", "cual", "cuales",
  "ese", "esa", "esos", "esas", "aqui", "alli", "ahi", "antes", "despues",
  "entre", "sobre", "ante", "tras", "hasta", "desde", "hacia", "contra",
  "feedback", "tutor", "profesor", "favor", "gracias", "hola", "ok",
  "tema", "trabajo", "investigacion", "monografia", "capitulo", "fase",
]);

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function tokenize(s: string): string[] {
  return normalize(s)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOPWORDS.has(w));
}

/** Detecta bigramas relevantes tipo "ampliar antecedentes", "más fuentes". */
function extractBigrams(s: string): string[] {
  const tokens = tokenize(s);
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const bg = `${tokens[i]} ${tokens[i + 1]}`;
    if (bg.length >= 10 && bg.length <= 35) bigrams.push(bg);
  }
  return bigrams;
}

/** Genera sugerencias automáticas para mejorar el megaprompt de cada fase. */
function generarSugerencias(
  feedbacks: PhaseFeedback[],
  porFase: Map<string, PhaseFeedback[]>,
): Array<{ phase_id: string; phase_label: string; sugerencia: string; evidencia: string[] }> {
  const sugerencias: Array<{ phase_id: string; phase_label: string; sugerencia: string; evidencia: string[] }> = [];

  for (const [phaseId, fbs] of porFase) {
    if (fbs.length < 3) continue; // necesitamos al menos 3 evidencias

    // Contar bigramas y palabras clave en los textos
    const bigramCount = new Map<string, number>();
    for (const fb of fbs) {
      for (const bg of extractBigrams(fb.feedback_text)) {
        bigramCount.set(bg, (bigramCount.get(bg) ?? 0) + 1);
      }
    }

    // Top 3 bigramas
    const topBigrams = Array.from(bigramCount.entries())
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topBigrams.length === 0) continue;

    const phaseLabel = fbs[0].phase_label;
    const evidencia = topBigrams.map(([bg, count]) => `"${bg}" (${count}× en feedback)`);
    const items = topBigrams.map(([bg]) => bg).join(", ");

    sugerencias.push({
      phase_id: phaseId,
      phase_label: phaseLabel,
      sugerencia: `Considera actualizar el megaprompt de "${phaseLabel}" para incluir por defecto: ${items}. ${fbs.length} estudiantes pidieron ajustes en esta fase.`,
      evidencia,
    });
  }

  return sugerencias.sort((a, b) => {
    const fbA = porFase.get(a.phase_id)?.length ?? 0;
    const fbB = porFase.get(b.phase_id)?.length ?? 0;
    return fbB - fbA;
  });
}

export async function GET() {
  try {
    await requireAdmin();

    const disk = loadFromDisk();
    const feedbacks: PhaseFeedback[] = disk.phaseFeedback ?? [];

    if (feedbacks.length === 0) {
      return NextResponse.json({
        totalFeedbacks: 0,
        porFase: [],
        porPrograma: [],
        topPalabrasClave: [],
        topFrasesAccion: [],
        sugerenciasPorFase: [],
        feedbacksRecientes: [],
        emptyState: true,
      });
    }

    // Agrupaciones
    const porFase = new Map<string, PhaseFeedback[]>();
    const porPrograma = new Map<string, number>();
    const palabraCount = new Map<string, number>();
    const bigramCount = new Map<string, number>();

    for (const fb of feedbacks) {
      const arr = porFase.get(fb.phase_id) ?? [];
      arr.push(fb);
      porFase.set(fb.phase_id, arr);

      if (fb.programa.length > 5) {
        porPrograma.set(fb.programa, (porPrograma.get(fb.programa) ?? 0) + 1);
      }

      for (const w of tokenize(fb.feedback_text)) {
        palabraCount.set(w, (palabraCount.get(w) ?? 0) + 1);
      }
      for (const bg of extractBigrams(fb.feedback_text)) {
        bigramCount.set(bg, (bigramCount.get(bg) ?? 0) + 1);
      }
    }

    // Construir respuesta
    const porFaseArr = Array.from(porFase.entries())
      .map(([phase_id, fbs]) => ({
        phase_id,
        phase_label: fbs[0]?.phase_label ?? phase_id,
        count: fbs.length,
      }))
      .sort((a, b) => b.count - a.count);

    const porProgramaArr = Array.from(porPrograma.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topPalabrasClave = Array.from(palabraCount.entries())
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([palabra, count]) => ({ palabra, count }));

    const topFrasesAccion = Array.from(bigramCount.entries())
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([frase, count]) => ({ frase, count }));

    const sugerenciasPorFase = generarSugerencias(feedbacks, porFase);

    const feedbacksRecientes = [...feedbacks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 30)
      .map(fb => ({
        phase_label: fb.phase_label,
        programa: fb.programa.length > 40 ? fb.programa.slice(0, 40) + "…" : fb.programa,
        feedback_text: fb.feedback_text.length > 280 ? fb.feedback_text.slice(0, 280) + "…" : fb.feedback_text,
        tipo: fb.tipo,
        created_at: fb.created_at,
      }));

    return NextResponse.json({
      totalFeedbacks: feedbacks.length,
      porFase: porFaseArr,
      porPrograma: porProgramaArr,
      topPalabrasClave,
      topFrasesAccion,
      sugerenciasPorFase,
      feedbacksRecientes,
      emptyState: false,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
