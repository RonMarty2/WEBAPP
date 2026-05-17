/**
 * GET /api/admin/banco-observaciones
 *
 * Devuelve el banco completo de observaciones analizadas a través de TODOS
 * los proyectos del SaaS, con agregaciones útiles para el admin:
 *
 *   - total + breakdown por decisión
 *   - top patrones detectados (qué tipos de observación se repiten más)
 *   - distribución por servicio (monografía vs proyecto-grado vs otros)
 *   - distribución por fase (qué capítulos reciben más críticas)
 *   - listado paginado con detalle completo
 *
 * Solo admin.
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { dbListObservacionesBancoPorPatron } from "@/lib/db/observacionesBanco";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "500"), 2000);
    const filterDecision = url.searchParams.get("decision");
    const filterPatron = url.searchParams.get("patron");
    const filterServicio = url.searchParams.get("servicio");

    const allRows = await dbListObservacionesBancoPorPatron(limit);

    // Aplicar filtros opcionales
    const rows = allRows.filter((r) => {
      if (filterDecision && r.decision !== filterDecision) return false;
      if (filterPatron && r.patron_detectado !== filterPatron) return false;
      if (filterServicio && r.servicio_id !== filterServicio) return false;
      return true;
    });

    // Agregaciones globales (sobre todo el banco, no solo el filtro)
    const breakdownDecision: Record<string, number> = {
      aplicar: 0, aplicar_con_reserva: 0, rechazar: 0,
    };
    const breakdownPatron = new Map<string, number>();
    const breakdownServicio = new Map<string, number>();
    const breakdownFase = new Map<string, number>();
    let totalAplicadas = 0;
    let totalRechazadas = 0;

    for (const r of allRows) {
      breakdownDecision[r.decision] = (breakdownDecision[r.decision] ?? 0) + 1;
      if (r.patron_detectado) {
        breakdownPatron.set(r.patron_detectado, (breakdownPatron.get(r.patron_detectado) ?? 0) + 1);
      }
      const svc = r.servicio_id ?? "sin-servicio";
      breakdownServicio.set(svc, (breakdownServicio.get(svc) ?? 0) + 1);
      breakdownFase.set(r.fase_id, (breakdownFase.get(r.fase_id) ?? 0) + 1);
      if (r.aplicado_at) totalAplicadas += 1;
      if (r.decision === "rechazar") totalRechazadas += 1;
    }

    const toSortedArray = (m: Map<string, number>) =>
      [...m.entries()]
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      ok: true,
      total: allRows.length,
      filtrados: rows.length,
      breakdown_decision: breakdownDecision,
      total_aplicadas_persistidas: totalAplicadas,
      total_rechazadas: totalRechazadas,
      top_patrones: toSortedArray(breakdownPatron).slice(0, 20),
      por_servicio: toSortedArray(breakdownServicio),
      por_fase: toSortedArray(breakdownFase).slice(0, 30),
      observaciones: rows,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
