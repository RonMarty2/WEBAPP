/**
 * GET /api/admin/proyectos          — Lista todos los proyectos
 * GET /api/admin/proyectos?id=xxx   — Detalle completo con contenido de fases
 * Solo accesible por admin.
 */
import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { getProyecto, proyectosStore } from "@/lib/memoryStore";
import { loadFromDisk } from "@/lib/persistence";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ── Detalle de un proyecto específico ────────────────────────────────────
    if (id) {
      const proyecto = getProyecto(id);
      if (!proyecto) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      return NextResponse.json({ proyecto });
    }

    // ── Lista todos ──────────────────────────────────────────────────────────
    // Sincronizar memoria con disco
    try {
      const disk = loadFromDisk();
      if (disk.proyectos) {
        for (const [k, v] of Object.entries(disk.proyectos)) {
          if (!proyectosStore.has(k)) {
            proyectosStore.set(k, v as Parameters<typeof proyectosStore.set>[1]);
          }
        }
      }
    } catch { /* ignorar */ }

    const memProyectos = [...proyectosStore.values()].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    if (!isSupabaseConfigured() || memProyectos.length > 0) {
      return NextResponse.json({
        proyectos: memProyectos.map(p => ({
          ...p,
          servicios: { id: p.servicio_id, nombre: "Monografía Académica" },
        })),
      });
    }

    const db = createAdminClient();
    const { data, error } = await db
      .from("proyectos_fases")
      .select(`id, usuario_id, tema_aprobado, titulo_provisional, estado_fase, completado, created_at, updated_at, servicios ( id, nombre )`)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ proyectos: [] });
    return NextResponse.json({ proyectos: data ?? [] });

  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
