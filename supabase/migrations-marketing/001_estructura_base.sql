-- ============================================================================
-- Módulo Marketing — estructura base (FASE 0)
-- ============================================================================
--
-- El estudiante construye su plan de marketing sobre un producto/marca:
--   buyer persona, mezcla de marketing (4Ps/7Ps), presupuesto y CPL por canal
--   (Meta/TikTok/Google), y calendario editorial. Reporte consolidado al final.
--
-- Mismo patrón que Finanzas, Mercados y Estrategia:
--   - Tablas con prefijo marketing_* para coexistir sin chocar.
--   - id de perfil = TEXT (id del usuario de webapp, no UUID de Supabase Auth).
--   - SIN RLS (autorización en endpoints /api/marketing/* con JWT propio).
--   - SIN triggers basados en auth.uid().
--
-- Cada herramienta se guarda como JSONB dentro del plan (estructura flexible,
-- una sola tabla, simple de versionar). Una sola migración: incluye ya todas
-- las columnas de las herramientas previstas.
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS marketing_perfiles (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL DEFAULT '—',
  rol         TEXT NOT NULL DEFAULT 'estudiante' CHECK (rol IN ('docente', 'estudiante')),
  email       TEXT NOT NULL,
  universidad TEXT,
  es_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_planes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES marketing_perfiles(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  marca         TEXT,                         -- producto o marca
  sector        TEXT,                         -- rubro/industria

  -- Cada herramienta como JSONB (estructura definida en el código del módulo):
  buyer_persona JSONB DEFAULT '{}'::jsonb,    -- perfil del cliente ideal
  mezcla        JSONB DEFAULT '{}'::jsonb,    -- 4Ps / 7Ps
  presupuesto   JSONB DEFAULT '{}'::jsonb,    -- inversión por canal + CPL
  calendario    JSONB DEFAULT '{}'::jsonb,    -- calendario editorial

  estado  TEXT NOT NULL DEFAULT 'persona'
          CHECK (estado IN ('persona', 'mezcla', 'presupuesto', 'calendario', 'reporte', 'completo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_planes_estudiante
  ON marketing_planes(estudiante_id);

CREATE TABLE IF NOT EXISTS marketing_progreso_clases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES marketing_perfiles(id) ON DELETE CASCADE,
  clase_slug    TEXT NOT NULL,
  completada    BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score    INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, clase_slug)
);

ALTER TABLE marketing_perfiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_planes          DISABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_progreso_clases DISABLE ROW LEVEL SECURITY;

COMMIT;
