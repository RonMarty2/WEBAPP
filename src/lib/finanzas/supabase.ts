import { createClient } from '@supabase/supabase-js';

// Next.js: NEXT_PUBLIC_* son las que llegan al cliente.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      '[finanzas/supabase] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no definidas. ' +
        'El módulo Finanzas necesita Supabase para funcionar.'
    );
  }
}

export const supabase = createClient(
  url ?? 'http://localhost',
  anonKey ?? 'anon-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);
