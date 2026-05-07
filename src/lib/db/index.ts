/**
 * Capa de abstracción de base de datos.
 * Usa Supabase cuando está configurado; cae de vuelta al store local.
 * Todas las funciones son async para ser compatibles con ambos backends.
 */

import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";
import type { ProyectoRecord, UserRecord, ErrorLogEntry } from "@/lib/memoryStore";
import * as local from "@/lib/memoryStore";

// ─── Proyectos ────────────────────────────────────────────────

export async function dbGetProyecto(id: string): Promise<ProyectoRecord | undefined> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb.from("proyectos").select("*").eq("id", id).single();
    if (error || !data) return undefined;
    return data as unknown as ProyectoRecord;
  }
  return local.getProyecto(id);
}

export async function dbListProyectos(userId: string): Promise<ProyectoRecord[]> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("proyectos")
      .select("*")
      .eq("usuario_id", userId)
      .eq("oculto_por_usuario", false)
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as ProyectoRecord[];
  }
  return local.listProyectos(userId);
}

export async function dbListAllProyectos(): Promise<ProyectoRecord[]> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("proyectos")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as ProyectoRecord[];
  }
  return [...local.proyectosStore.values()].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function dbCreateProyecto(
  data: Omit<ProyectoRecord, "id" | "created_at" | "updated_at">
): Promise<ProyectoRecord> {
  if (isSupabaseConfigured()) {
    const now = new Date().toISOString();
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const record: ProyectoRecord = { id, created_at: now, updated_at: now, ...data };
    const sb = createAdminClient();
    const { error } = await sb.from("proyectos").insert(record as never);
    if (error) throw new Error(`Supabase insert error: ${error.message}`);
    return record;
  }
  return local.createProyecto(data);
}

export async function dbUpdateProyecto(
  id: string,
  updates: Partial<ProyectoRecord>
): Promise<ProyectoRecord | null> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from("proyectos")
      .update({ ...updates, updated_at: now } as never)
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) return null;
    return data as unknown as ProyectoRecord;
  }
  return local.updateProyecto(id, updates);
}

export async function dbHideProyecto(id: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { error } = await sb
      .from("proyectos")
      .update({ oculto_por_usuario: true, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("usuario_id", userId);
    return !error;
  }
  local.hideProyectoForUser(id, userId);
  return true;
}

export async function dbDeleteProyecto(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { error } = await sb.from("proyectos").delete().eq("id", id);
    return !error;
  }
  return local.purgeProyecto(id);
}

// ─── Usuarios ─────────────────────────────────────────────────

export async function dbUpsertUser(
  data: Omit<UserRecord, "registered_at"> & { registered_at?: string }
): Promise<UserRecord> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const record: UserRecord = {
      registered_at: new Date().toISOString(),
      ...data,
    };
    const { data: existing } = await sb.from("usuarios").select("registered_at").eq("id", data.id).single();
    if (existing) record.registered_at = (existing as { registered_at: string }).registered_at;
    await sb.from("usuarios").upsert(record);
    return record;
  }
  return local.upsertUser(data);
}

export async function dbGetUser(id: string): Promise<UserRecord | undefined> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb.from("usuarios").select("*").eq("id", id).single();
    if (error || !data) return undefined;
    return data as unknown as UserRecord;
  }
  return local.getUser(id);
}

export async function dbGetUserByEmail(email: string): Promise<UserRecord | undefined> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("usuarios")
      .select("*")
      .ilike("email", email)
      .single();
    if (error || !data) return undefined;
    return data as unknown as UserRecord;
  }
  return local.getUserByEmail(email);
}

export async function dbListUsers(): Promise<UserRecord[]> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("usuarios")
      .select("*")
      .order("registered_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as UserRecord[];
  }
  return local.listUsers();
}

export async function dbActivateUser(
  id: string,
  role: import("@/lib/auth").UserRole,
  plan: import("@/lib/auth").UserPlan
): Promise<UserRecord | null> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("usuarios")
      .update({ role, plan, active: true, activated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) return null;
    return data as unknown as UserRecord;
  }
  return local.activateUser(id, role, plan);
}

export async function dbDeactivateUser(id: string): Promise<UserRecord | null> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("usuarios")
      .update({ active: false })
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) return null;
    return data as unknown as UserRecord;
  }
  return local.deactivateUser(id);
}

// ─── Error logs ───────────────────────────────────────────────

export async function dbLogError(entry: Omit<ErrorLogEntry, "id" | "timestamp">): Promise<void> {
  // Siempre loguear en local (rápido, sin await)
  local.logError(entry);

  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    void (sb.from("error_logs").insert({
      nivel: entry.nivel,
      etapa: String(entry.etapa),
      proyecto_id: entry.monografia_id,
      service_id: entry.service_id,
      mensaje: entry.mensaje,
      detalle: entry.detalle,
    } as never) as unknown as Promise<unknown>).catch(() => {});
  }
}

export async function dbGetErrorLogs(
  nivel?: ErrorLogEntry["nivel"],
  limit = 50
): Promise<ErrorLogEntry[]> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    let q = sb.from("error_logs").select("*").order("timestamp", { ascending: false }).limit(limit);
    if (nivel) q = q.eq("nivel", nivel);
    const { data, error } = await q;
    if (error || !data) return local.getErrorLogs(nivel, limit);
    return data.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      nivel: r.nivel as ErrorLogEntry["nivel"],
      etapa: r.etapa ?? 0,
      monografia_id: r.proyecto_id ?? undefined,
      service_id: r.service_id ?? undefined,
      mensaje: r.mensaje,
      detalle: r.detalle ?? undefined,
    }));
  }
  return local.getErrorLogs(nivel, limit);
}

// ─── Upsert proyecto (create if not exists, update if exists) ─

export async function dbUpsertProyecto(record: ProyectoRecord): Promise<ProyectoRecord> {
  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from("proyectos")
      .upsert({ ...record, updated_at: now } as never, { onConflict: "id" })
      .select("*")
      .single();
    if (error || !data) throw new Error(`Supabase upsert error: ${error?.message}`);
    return data as unknown as ProyectoRecord;
  }
  return local.upsertProyectoSnapshot(record);
}

// ─── Estadísticas agregadas ───────────────────────────────────

export function dbGetAggregateStats() {
  // Stats are computed from in-memory legacy data; no Supabase equivalent yet
  return local.getAggregateStats();
}

// ─── Utilidad: estado del backend ────────────────────────────

export function dbBackend(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}
