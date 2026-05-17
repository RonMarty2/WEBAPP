/**
 * Capa de persistencia para aiConfig (API keys de providers + asignación
 * de IA por servicio).
 *
 * Anteriormente se guardaba en `.store/data.json` vía `saveToDisk`, pero
 * Vercel serverless tiene filesystem ephemeral → la config se perdía entre
 * invocaciones. Ahora vive en Supabase (tablas ai_provider_keys y
 * ai_service_configs).
 *
 * Las funciones caen graciosamente al objeto vacío si Supabase no está
 * configurado, para que el dev local sin Supabase siga funcionando.
 */

import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase";

export interface ServiceConfigRecord {
  provider_id: string;
  model: string;
  api_key: string;
}

export interface AIConfigSnapshot {
  providerKeys: Record<string, string>;
  serviceConfigs: Record<string, ServiceConfigRecord>;
}

/**
 * Carga toda la config de IA desde Supabase. Devuelve objetos vacíos si
 * Supabase no está configurado o si las tablas aún no existen.
 */
export async function dbLoadAIConfig(): Promise<AIConfigSnapshot> {
  if (!isSupabaseConfigured()) {
    return { providerKeys: {}, serviceConfigs: {} };
  }

  try {
    const sb = createAdminClient();
    const [keysRes, configsRes] = await Promise.all([
      sb.from("ai_provider_keys").select("provider_id, api_key"),
      sb.from("ai_service_configs").select("servicio_id, provider_id, model"),
    ]);

    const providerKeys: Record<string, string> = {};
    (keysRes.data ?? []).forEach((row: { provider_id: string; api_key: string }) => {
      if (row.provider_id && row.api_key) {
        providerKeys[row.provider_id] = row.api_key;
      }
    });

    const serviceConfigs: Record<string, ServiceConfigRecord> = {};
    (configsRes.data ?? []).forEach((row: { servicio_id: string; provider_id: string; model: string }) => {
      if (row.servicio_id && row.provider_id && row.model) {
        serviceConfigs[row.servicio_id] = {
          provider_id: row.provider_id,
          model: row.model,
          api_key: providerKeys[row.provider_id] ?? "",
        };
      }
    });

    return { providerKeys, serviceConfigs };
  } catch {
    // Tablas pueden no existir todavía (migración no corrida) → fallback vacío.
    return { providerKeys: {}, serviceConfigs: {} };
  }
}

/** Upsert de una API key por provider. */
export async function dbSaveProviderKey(providerId: string, apiKey: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = createAdminClient();
    // cast a `never` porque las tablas ai_* aún no están en el archivo Database
    // generado de tipos. El insert/upsert acepta el shape correcto en runtime.
    await sb.from("ai_provider_keys").upsert({
      provider_id: providerId,
      api_key: apiKey,
      updated_at: new Date().toISOString(),
    } as never);
  } catch {
    /* fail silently — disk save sigue actuando como fallback */
  }
}

/** Borra la API key de un provider. */
export async function dbDeleteProviderKey(providerId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = createAdminClient();
    await sb.from("ai_provider_keys").delete().eq("provider_id", providerId);
  } catch {
    /* idem */
  }
}

/** Upsert de la asignación de IA para un servicio. */
export async function dbSaveServiceConfig(
  servicioId: string,
  providerId: string,
  model: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const sb = createAdminClient();
    await sb.from("ai_service_configs").upsert({
      servicio_id: servicioId,
      provider_id: providerId,
      model,
      updated_at: new Date().toISOString(),
    } as never);
  } catch {
    /* idem */
  }
}
