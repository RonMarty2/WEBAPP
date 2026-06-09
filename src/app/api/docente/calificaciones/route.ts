/**
 * /api/docente/calificaciones
 *   GET  → lista calificaciones que dejó el docente (filtros opcionales).
 *   POST → crea/upsert una calificación nueva o actualiza la existente
 *          (UNIQUE en docente_id + alumno_id + modulo + proyecto_id + rubrica_id).
 *
 * El backend CALCULA promedio_ponderado al guardar. Si la calificación se
 * crea con `estado="publicada"`, se marca publicada_en y el alumno la verá
 * en /mis-calificaciones.
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import { calcularPromedioPonderado, type ModuloCalificable, type NotaPorCriterio } from "@/types/docente-wave4";

const ROLES_PERMITIDOS = new Set(["docente", "admin"]);
const MODULOS: ModuloCalificable[] = ["idea","mercados","estrategia","marketing","organizacion","finanzas","defensa","generador","otro"];

async function asegurarDocente() {
  const { user } = await requireAuth();
  if (!ROLES_PERMITIDOS.has(user.role)) {
    throw new AuthError(403, "Solo docentes pueden calificar");
  }
  return user;
}

export async function GET(req: Request) {
  try {
    const user = await asegurarDocente();
    const url = new URL(req.url);
    const vinculoId = url.searchParams.get("vinculo_id");
    const alumnoId = url.searchParams.get("alumno_id");
    const modulo = url.searchParams.get("modulo");
    const estado = url.searchParams.get("estado");

    if (!isSupabaseConfigured()) return NextResponse.json({ calificaciones: [] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;
    let q = sb.from("docente_calificaciones").select("*").eq("docente_id", user.id);
    if (vinculoId) q = q.eq("vinculo_id", vinculoId);
    if (alumnoId) q = q.eq("alumno_id", alumnoId);
    if (modulo) q = q.eq("modulo", modulo);
    if (estado) q = q.eq("estado", estado);
    q = q.order("actualizada_en", { ascending: false });
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ calificaciones: data ?? [] });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await asegurarDocente();
    const body = await req.json().catch(() => ({}));

    const vinculo_id = typeof body.vinculo_id === "string" ? body.vinculo_id : "";
    const rubrica_id = typeof body.rubrica_id === "string" ? body.rubrica_id : "";
    const modulo = typeof body.modulo === "string" ? body.modulo as ModuloCalificable : "otro";
    const proyecto_id = typeof body.proyecto_id === "string" ? body.proyecto_id : "";
    const proyecto_titulo = typeof body.proyecto_titulo === "string" ? body.proyecto_titulo.trim().slice(0, 200) : "";
    const notasRaw = Array.isArray(body.notas_por_criterio) ? body.notas_por_criterio : [];
    const comentario_general = typeof body.comentario_general === "string" ? body.comentario_general.trim() : null;
    const publicar = body.publicar === true; // si es true, estado = publicada

    if (!vinculo_id || !rubrica_id || !proyecto_id || !proyecto_titulo) {
      return NextResponse.json({ error: "Faltan campos requeridos (vinculo_id, rubrica_id, proyecto_id, proyecto_titulo)" }, { status: 400 });
    }
    if (!MODULOS.includes(modulo)) {
      return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ error: "sin_db" }, { status: 500 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createAdminClient() as any;

    // Verificar ownership del vínculo + cargar alumno_id.
    const { data: vinculo } = await sb
      .from("docente_alumno_vinculos")
      .select("id, alumno_id")
      .eq("id", vinculo_id)
      .eq("docente_id", user.id)
      .maybeSingle();
    if (!vinculo) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

    // Verificar que la rúbrica es del docente y cargar criterios para calcular promedio.
    const { data: rubrica } = await sb
      .from("docente_rubricas")
      .select("id, criterios, escala_max")
      .eq("id", rubrica_id)
      .eq("docente_id", user.id)
      .maybeSingle();
    if (!rubrica) return NextResponse.json({ error: "Rúbrica no encontrada" }, { status: 404 });

    // Validar y limpiar notas.
    const escalaMax = Number(rubrica.escala_max) || 100;
    const notas_por_criterio: NotaPorCriterio[] = notasRaw.map((n: { criterio_id?: string; nota?: number; comentario?: string }) => ({
      criterio_id: typeof n.criterio_id === "string" ? n.criterio_id : "",
      nota: Math.max(0, Math.min(escalaMax, Number(n.nota) || 0)),
      comentario: typeof n.comentario === "string" ? n.comentario.trim().slice(0, 1000) || null : null,
    })).filter((n: NotaPorCriterio) => n.criterio_id);

    const promedio = calcularPromedioPonderado(rubrica.criterios, notas_por_criterio);

    const estadoFinal = publicar ? "publicada" : "borrador";
    const ahora = new Date().toISOString();

    const { data, error } = await sb
      .from("docente_calificaciones")
      .upsert(
        {
          vinculo_id,
          docente_id: user.id,
          alumno_id: vinculo.alumno_id,
          rubrica_id,
          modulo,
          proyecto_id,
          proyecto_titulo,
          notas_por_criterio,
          promedio_ponderado: promedio,
          comentario_general,
          estado: estadoFinal,
          publicada_en: publicar ? ahora : null,
        },
        { onConflict: "docente_id,alumno_id,modulo,proyecto_id,rubrica_id" },
      )
      .select()
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

    return NextResponse.json({ calificacion: data });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
