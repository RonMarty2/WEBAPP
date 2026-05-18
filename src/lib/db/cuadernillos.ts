/**
 * CRUD del Cuadernillo del Estudiante en Supabase.
 *
 * Cada cuadernillo es una "hoja de ruta personal" del estudiante por capítulo.
 * Solo el estudiante lo ve — NO se entrega al tutor.
 *
 * Server-only.
 */

import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import type { CuadernilloOutput } from "@/lib/prompts/cuadernillo-estudiante";

export interface CuadernilloRow extends CuadernilloOutput {
  id: string;
  proyecto_id: string;
  fase_id: string;
  fase_label: string;
  modelo_ia_usado: string | null;
  duracion_ms: number | null;
  created_at: string;
  updated_at: string;
}

/** Upsert (insertar o reemplazar) un cuadernillo por proyecto+fase. */
export async function dbUpsertCuadernillo(input: {
  proyecto_id: string;
  fase_id: string;
  fase_label: string;
  cuadernillo: CuadernilloOutput;
  modelo_ia_usado?: string;
  duracion_ms?: number;
}): Promise<{ ok: boolean; id: string | null }> {
  if (!isSupabaseConfigured()) return { ok: false, id: null };
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("cuadernillos_estudiante")
      .upsert(
        {
          proyecto_id: input.proyecto_id,
          fase_id: input.fase_id,
          fase_label: input.fase_label,
          resumen_capitulo: input.cuadernillo.resumen_capitulo,
          limitaciones_ia: input.cuadernillo.limitaciones_ia,
          sugerencias_fortalecimiento: input.cuadernillo.sugerencias_fortalecimiento,
          datos_a_buscar: input.cuadernillo.datos_a_buscar,
          preguntas_tutor_probables: input.cuadernillo.preguntas_tutor_probables,
          errores_comunes_evitar: input.cuadernillo.errores_comunes_evitar,
          tips_presentacion_oral: input.cuadernillo.tips_presentacion_oral,
          modelo_ia_usado: input.modelo_ia_usado ?? null,
          duracion_ms: input.duracion_ms ?? null,
          updated_at: new Date().toISOString(),
        } as never,
        { onConflict: "proyecto_id,fase_id" },
      )
      .select("id")
      .single();
    if (error) {
      console.error("[cuadernillos] upsert error:", error.message);
      return { ok: false, id: null };
    }
    return { ok: true, id: (data as { id?: string } | null)?.id ?? null };
  } catch (e) {
    console.error("[cuadernillos] upsert exception:", (e as Error).message);
    return { ok: false, id: null };
  }
}

/** Lista todos los cuadernillos de un proyecto, ordenados por fase. */
export async function dbListCuadernillosByProyecto(
  proyectoId: string,
): Promise<CuadernilloRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("cuadernillos_estudiante")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("created_at", { ascending: true });
    return (data ?? []) as unknown as CuadernilloRow[];
  } catch {
    return [];
  }
}

/** Devuelve UN cuadernillo por proyecto+fase (null si no existe). */
export async function dbGetCuadernillo(
  proyectoId: string,
  faseId: string,
): Promise<CuadernilloRow | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("cuadernillos_estudiante")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .eq("fase_id", faseId)
      .maybeSingle();
    return (data as CuadernilloRow | null) ?? null;
  } catch {
    return null;
  }
}
