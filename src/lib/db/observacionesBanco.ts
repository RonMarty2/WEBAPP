/**
 * Banco acumulado de observaciones del tutor analizadas por la IA.
 *
 * Cada fila representa una observación recibida + el veredicto del
 * analizador de pertinencia (aplicar / aplicar_con_reserva / rechazar) +
 * la justificación entregada al estudiante.
 *
 * Server-only. Solo importar desde API routes.
 */

import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export interface ObservacionBancoRow {
  id?: string;
  proyecto_id: string;
  fase_id: string;
  servicio_id?: string | null;
  observacion_textual: string;
  patron_detectado?: string | null;
  decision: "aplicar" | "aplicar_con_reserva" | "rechazar" | "mover_a_otra_fase";
  analisis_ia: string;
  justificacion_para_tutor?: string | null;
  contenido_antes?: string | null;
  contenido_despues?: string | null;
  aplicado_at?: string | null;
  modelo_ia_usado?: string | null;
  duracion_analisis_ms?: number | null;
  created_at?: string;
}

/** Inserta una nueva observación analizada en el banco. */
export async function dbInsertObservacionBanco(
  row: Omit<ObservacionBancoRow, "id" | "created_at">,
): Promise<{ id: string | null }> {
  if (!isSupabaseConfigured()) return { id: null };
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("observaciones_banco")
      .insert(row as never)
      .select("id")
      .single();
    if (error) return { id: null };
    return { id: (data as { id?: string } | null)?.id ?? null };
  } catch {
    return { id: null };
  }
}

/**
 * Marca una observación como aplicada (cuando el usuario aprobó el cambio
 * propuesto y se persistió al proyecto).
 */
export async function dbMarcarObservacionAplicada(
  observacionId: string,
  contenidoDespues: string,
): Promise<void> {
  if (!isSupabaseConfigured() || !observacionId) return;
  try {
    const sb = createAdminClient();
    await sb
      .from("observaciones_banco")
      .update({
        aplicado_at: new Date().toISOString(),
        contenido_despues: contenidoDespues,
      } as never)
      .eq("id", observacionId);
  } catch {
    /* fail silent */
  }
}

/** Lista todas las observaciones de un proyecto (orden cronológico inverso). */
export async function dbListObservacionesBancoProyecto(
  proyectoId: string,
): Promise<ObservacionBancoRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("observaciones_banco")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("created_at", { ascending: false });
    return (data ?? []) as unknown as ObservacionBancoRow[];
  } catch {
    return [];
  }
}

/** Lista de observaciones agregadas por patrón (para el panel admin). */
export async function dbListObservacionesBancoPorPatron(
  limit: number = 100,
): Promise<ObservacionBancoRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = createAdminClient();
    const { data } = await sb
      .from("observaciones_banco")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []) as unknown as ObservacionBancoRow[];
  } catch {
    return [];
  }
}
