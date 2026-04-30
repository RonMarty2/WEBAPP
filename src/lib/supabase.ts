import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Cliente público (browser / componentes cliente) */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Cliente de servidor con service-role key.
 * Bypasa RLS — usar solo en rutas de API tras verificar la sesión del usuario.
 */
export function createAdminClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Cliente de servidor con el JWT del usuario.
 * Respeta las políticas RLS de Supabase.
 * Útil si en el futuro se migra a Supabase Auth nativo.
 */
export function createServerClient(accessToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
