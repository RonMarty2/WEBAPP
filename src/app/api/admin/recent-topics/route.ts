/**
 * GET /api/admin/recent-topics
 *
 * Retorna los temas recientes generados por usuarios para usar como contexto
 * de "anti-duplicación" en el Cap 0. Cuando un nuevo estudiante con el mismo
 * programa pide propuestas de tema, le pasamos a la IA esta lista para que
 * EVITE temas demasiado similares.
 *
 * Query params:
 *   - programa: string (opcional) — filtra solo proyectos del mismo diplomado/programa
 *   - limit: number (opcional, default 50) — máximo de temas a devolver
 *   - excludeProyecto: string (opcional) — id del proyecto actual (para no excluir su propio tema)
 *
 * Auth: requireAuth (cualquier estudiante puede consultarlo, solo expone títulos
 * que igualmente la app irá mostrando como propuestas).
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbListAllProyectos } from "@/lib/db";

interface RecentTopic {
  titulo: string;
  programa: string;
  universidad?: string;
  carrera?: string;
  fecha_creacion?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export async function GET(req: Request) {
  try {
    await requireAuth();

    const url = new URL(req.url);
    const programa = url.searchParams.get("programa")?.trim();
    const excludeProyecto = url.searchParams.get("excludeProyecto");
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);

    const proyectos = await dbListAllProyectos();

    const topics: RecentTopic[] = [];
    const seen = new Set<string>();

    for (const p of proyectos) {
      if (excludeProyecto && p.id === excludeProyecto) continue;

      const tema = (p as { tema_aprobado?: string }).tema_aprobado
        || (p as { titulo_provisional?: string }).titulo_provisional
        || "";
      if (!tema || tema.length < 10) continue;
      if (tema.includes("(Por definir)")) continue;

      // Extraer programa del academic_context
      const ctx = ((p as { academic_context?: Record<string, unknown> }).academic_context ?? {}) as Record<string, unknown>;
      const ctxInicial = (ctx.contexto_inicial ?? {}) as Record<string, unknown>;
      const progDelProyecto = String(ctxInicial.programa ?? "").trim();

      // Si se filtra por programa, solo incluir los del mismo programa
      if (programa) {
        const np = normalize(programa);
        const npp = normalize(progDelProyecto);
        // Match parcial (al menos 5 chars en común)
        if (npp.length === 0 || (!np.includes(npp) && !npp.includes(np))) continue;
      }

      const key = normalize(tema);
      if (seen.has(key)) continue;
      seen.add(key);

      topics.push({
        titulo: tema,
        programa: progDelProyecto,
        universidad: (p as { universidad_id?: string }).universidad_id,
        fecha_creacion: (p as { created_at?: string }).created_at,
      });

      if (topics.length >= limit) break;
    }

    return NextResponse.json({ topics, total: topics.length });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
