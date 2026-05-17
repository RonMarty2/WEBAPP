-- ════════════════════════════════════════════════════════════════════════════
-- Migración Supabase — persistencia de aiConfig
-- ════════════════════════════════════════════════════════════════════════════
--
-- Soluciona el bug de Vercel serverless: el filesystem es ephemeral, entonces
-- las API keys y configuraciones que el admin guardaba en /admin/modelos
-- se PERDÍAN entre invocaciones. Ahora viven en Supabase y persisten siempre.
--
-- Ejecutar UNA SOLA VEZ en:
--   https://supabase.com/dashboard/project/svaswbryumacbirecvjt/sql/new
-- ════════════════════════════════════════════════════════════════════════════

-- Tabla 1: API keys por proveedor de IA (groq, openai, gemini, anthropic, etc.)
create table if not exists public.ai_provider_keys (
  provider_id text primary key,
  api_key     text not null,
  updated_at  timestamptz not null default now()
);

-- Tabla 2: Configuración por servicio (mono-001 → gemini/gemini-2.5-pro)
create table if not exists public.ai_service_configs (
  servicio_id text primary key,
  provider_id text not null,
  model       text not null,
  updated_at  timestamptz not null default now()
);

-- Índices para lecturas rápidas
create index if not exists ai_service_configs_provider_idx
  on public.ai_service_configs (provider_id);

-- RLS: ambas tablas son SOLO accesibles por el service-role (admin del SaaS).
-- No exponer al cliente público — el SaaS las lee con SUPABASE_SERVICE_ROLE_KEY.
alter table public.ai_provider_keys enable row level security;
alter table public.ai_service_configs enable row level security;

-- (Sin policies = nadie con anon key puede leer/escribir. Solo service-role.)

comment on table public.ai_provider_keys is
  'API keys de cada proveedor de IA (Groq, OpenAI, Gemini, etc.) guardadas desde /admin/modelos. Reemplaza al storage en .store/data.json que no persistía en Vercel serverless.';

comment on table public.ai_service_configs is
  'Asignación de qué proveedor + modelo usa cada servicio (mono-001, tesis-001, etc.). Reemplaza al storage en .store/data.json.';
