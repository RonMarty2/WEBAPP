/**
 * GET /api/admin/pdf-solicitudes
 *
 * Lista de proyectos que tienen `pdf_solicitado_at` pendiente de compilación
 * (o ya compilados, según filtro). Solo admin.
 *
 * Query params:
 *   - estado: "pendiente" (default) | "compilado" | "todas"
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { dbListAllProyectos } from "@/lib/db";

interface ProyectoFila {
  id?: string;
  usuario_id?: string;
  tema_aprobado?: string | null;
  titulo_provisional?: string | null;
  servicio_id?: string | null;
  pdf_solicitado_at?: string | null;
  pdf_compilado_at?: string | null;
  pdf_compilado_filename?: string | null;
  pdf_compilado_bytes?: number | null;
  pdf_compilado_por?: string | null;
}

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const estado = (url.searchParams.get("estado") ?? "pendiente").toLowerCase();

    const todos = (await dbListAllProyectos()) as unknown as ProyectoFila[];

    const filtrados = todos.filter((p) => {
      const solicitado = Boolean(p.pdf_solicitado_at);
      const compilado = Boolean(p.pdf_compilado_at);
      if (estado === "pendiente") return solicitado && !compilado;
      if (estado === "compilado") return compilado;
      if (estado === "todas") return solicitado || compilado;
      return solicitado;
    });

    // Ordenar: pendientes primero (más antiguos primero), compilados después (más recientes primero)
    filtrados.sort((a, b) => {
      const aComp = Boolean(a.pdf_compilado_at);
      const bComp = Boolean(b.pdf_compilado_at);
      if (aComp !== bComp) return aComp ? 1 : -1;
      const aTime = a.pdf_solicitado_at ?? "";
      const bTime = b.pdf_solicitado_at ?? "";
      return aComp ? bTime.localeCompare(aTime) : aTime.localeCompare(bTime);
    });

    const solicitudes = filtrados.map((p) => ({
      proyecto_id: p.id,
      usuario_id: p.usuario_id,
      titulo: p.tema_aprobado ?? p.titulo_provisional ?? "(sin título)",
      servicio_id: p.servicio_id,
      pdf_solicitado_at: p.pdf_solicitado_at,
      pdf_compilado_at: p.pdf_compilado_at,
      pdf_compilado_filename: p.pdf_compilado_filename,
      pdf_compilado_bytes: p.pdf_compilado_bytes,
      pdf_compilado_por: p.pdf_compilado_por,
    }));

    return NextResponse.json({
      ok: true,
      total: solicitudes.length,
      estado_filtro: estado,
      solicitudes,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
