/**
 * GET /api/admin/dashboard
 *
 * Datos agregados para el panel principal de admin:
 *   - KPIs: usuarios totales, proyectos totales, completos, abandonados, ingresos
 *   - Funnel: cuántos proyectos llegan a cada hito (Cap 0 → I → V → PDF)
 *   - Top programas / universidades más populares
 *   - Top temas (clusters por palabras clave del título)
 *   - Tasa de conversión total
 *
 * Solo admin (requireAdmin).
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { dbListAllProyectos, dbListUsers } from "@/lib/db";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

/** Cuenta cuántas fases tiene un proyecto con contenido real (>100 chars). */
function fasesCompletas(p: Record<string, unknown>): number {
  const phaseContents = (p.phase_contents ?? {}) as Record<string, string | null | undefined>;
  return Object.entries(phaseContents)
    .filter(([key, value]) =>
      !key.includes("_borrador") &&
      !key.startsWith("__") &&
      typeof value === "string" &&
      value.trim().length > 100,
    ).length;
}

/** Extrae 2-4 palabras clave de un título, evitando stopwords. */
const STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "y", "o", "en", "del", "al",
  "para", "por", "con", "sin", "su", "sus", "se", "un", "este", "esta", "esto",
  "como", "que", "es", "son", "ha", "han", "no", "si", "lo", "mas", "menos",
  "analisis", "analisis", "estudio", "investigacion", "monografia", "trabajo",
  "caso", "los", "tras", "ante", "entre", "sobre", "hacia", "desde",
]);

function extractKeywords(titulo: string, max = 3): string[] {
  return normalize(titulo)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 5 && !STOPWORDS.has(w))
    .slice(0, max);
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    await requireAdmin();

    const [proyectos, usuarios] = await Promise.all([
      dbListAllProyectos(),
      dbListUsers(),
    ]);

    const univById = new Map(DEFAULT_UNIVERSITIES.map(u => [u.id, u.name]));

    // ─── KPIs principales ───
    const totalProyectos = proyectos.length;
    const completos = proyectos.filter(p => p.completado || fasesCompletas(p as unknown as Record<string, unknown>) >= 6).length;
    const enCurso = proyectos.filter(p => {
      if (p.completado) return false;
      const fc = fasesCompletas(p as unknown as Record<string, unknown>);
      const ua = (p as { updated_at?: string }).updated_at ?? (p as { created_at?: string }).created_at ?? null;
      const dias = ua ? (Date.now() - new Date(ua).getTime()) / (1000 * 60 * 60 * 24) : 999;
      return fc < 6 && dias <= 30;
    }).length;
    const abandonados = totalProyectos - completos - enCurso;
    const tasaCompletado = totalProyectos > 0 ? Math.round((completos / totalProyectos) * 100) : 0;

    // ─── Funnel ───
    const funnel = {
      crearon_proyecto: totalProyectos,
      tienen_cap0: proyectos.filter(p => fasesCompletas(p as unknown as Record<string, unknown>) >= 1).length,
      tienen_cap1: proyectos.filter(p => fasesCompletas(p as unknown as Record<string, unknown>) >= 2).length,
      tienen_cap5: proyectos.filter(p => fasesCompletas(p as unknown as Record<string, unknown>) >= 6).length,
      tienen_completo: completos,
    };

    // ─── Top programas / universidades / temas ───
    const programaCount = new Map<string, number>();
    const univCount = new Map<string, number>();
    const keywordCount = new Map<string, number>();
    const temasPorPrograma = new Map<string, string[]>();

    for (const p of proyectos) {
      const ctx = ((p as { academic_context?: Record<string, unknown> }).academic_context ?? {}) as Record<string, unknown>;
      const ctxIni = (ctx.contexto_inicial ?? {}) as Record<string, unknown>;
      const programa = String(ctxIni.programa ?? "").trim();
      if (programa.length > 5) {
        programaCount.set(programa, (programaCount.get(programa) ?? 0) + 1);
      }

      const univName = p.universidad_id ? univById.get(p.universidad_id) : null;
      if (univName) {
        univCount.set(univName, (univCount.get(univName) ?? 0) + 1);
      }

      const tema = (p as { tema_aprobado?: string; titulo_provisional?: string }).tema_aprobado
        ?? (p as { titulo_provisional?: string }).titulo_provisional ?? "";
      if (tema && tema.length > 10 && !tema.includes("(Por definir)")) {
        for (const kw of extractKeywords(tema)) {
          keywordCount.set(kw, (keywordCount.get(kw) ?? 0) + 1);
        }
        if (programa.length > 5) {
          const arr = temasPorPrograma.get(programa) ?? [];
          arr.push(tema);
          temasPorPrograma.set(programa, arr);
        }
      }
    }

    const topProgramas = Array.from(programaCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, count]) => ({ nombre, count }));

    const topUniversidades = Array.from(univCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, count]) => ({ nombre, count }));

    const topKeywords = Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([palabra, count]) => ({ palabra, count }));

    // Detección rudimentaria de duplicados: títulos con palabras en común dentro del mismo programa
    const posiblesDuplicados: { programa: string; ejemplos: string[] }[] = [];
    for (const [prog, temas] of temasPorPrograma) {
      if (temas.length < 2) continue;
      // simple: si dos títulos comparten 3+ palabras de 5+ chars, son sospechosos
      const muestra: string[] = [];
      for (let i = 0; i < temas.length && muestra.length < 3; i++) {
        for (let j = i + 1; j < temas.length; j++) {
          const ki = new Set(extractKeywords(temas[i], 6));
          const kj = new Set(extractKeywords(temas[j], 6));
          let comunes = 0;
          for (const k of ki) if (kj.has(k)) comunes++;
          if (comunes >= 2) {
            if (!muestra.includes(temas[i])) muestra.push(temas[i]);
            if (!muestra.includes(temas[j]) && muestra.length < 3) muestra.push(temas[j]);
            break;
          }
        }
      }
      if (muestra.length >= 2) posiblesDuplicados.push({ programa: prog, ejemplos: muestra });
    }

    return NextResponse.json({
      kpis: {
        totalUsuarios: usuarios.length,
        totalProyectos,
        completos,
        enCurso,
        abandonados,
        tasaCompletado,
        usuariosActivos7d: usuarios.filter(u => {
          const ult = (u as { last_login?: string; created_at?: string }).last_login
            ?? (u as { created_at?: string }).created_at;
          if (!ult) return false;
          return (Date.now() - new Date(ult).getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length,
      },
      funnel,
      topProgramas,
      topUniversidades,
      topKeywords,
      posiblesDuplicados,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
