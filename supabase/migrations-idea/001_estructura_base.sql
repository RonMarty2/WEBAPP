-- ============================================================================
-- Módulo Idea / Pre-validación — estructura base (FASE 0)
-- ============================================================================
--
-- El estudiante valida su idea de negocio ANTES de construir todo:
--   Lean Canvas, Propuesta de Valor, hipótesis/experimentos y un scorecard
--   de viabilidad (deseabilidad/factibilidad/viabilidad). Reporte al final.
--
-- Mismo patrón que los demás módulos:
--   - Tablas con prefijo idea_* para coexistir sin chocar.
--   - id de perfil = TEXT (id del usuario de webapp, no UUID de Supabase Auth).
--   - SIN RLS (autorización en endpoints /api/idea/* con JWT propio).
--   - SIN triggers basados en auth.uid().
--
-- Una sola migración: incluye ya todas las columnas de las herramientas.
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS idea_perfiles (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL DEFAULT '—',
  rol         TEXT NOT NULL DEFAULT 'estudiante' CHECK (rol IN ('docente', 'estudiante')),
  email       TEXT NOT NULL,
  universidad TEXT,
  es_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS idea_proyectos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES idea_perfiles(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  idea          TEXT,                         -- descripción corta de la idea
  sector        TEXT,

  -- Cada herramienta como JSONB:
  lean_canvas    JSONB DEFAULT '{}'::jsonb,   -- 9 bloques
  propuesta_valor JSONB DEFAULT '{}'::jsonb,  -- VPC: perfil cliente + mapa de valor
  validacion     JSONB DEFAULT '{}'::jsonb,   -- hipótesis y experimentos
  scorecard      JSONB DEFAULT '{}'::jsonb,   -- deseabilidad/factibilidad/viabilidad

  estado  TEXT NOT NULL DEFAULT 'canvas'
          CHECK (estado IN ('canvas', 'valor', 'validacion', 'scorecard', 'reporte', 'completo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idea_proyectos_estudiante
  ON idea_proyectos(estudiante_id);

CREATE TABLE IF NOT EXISTS idea_progreso_clases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES idea_perfiles(id) ON DELETE CASCADE,
  clase_slug    TEXT NOT NULL,
  completada    BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score    INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, clase_slug)
);

ALTER TABLE idea_perfiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE idea_proyectos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE idea_progreso_clases DISABLE ROW LEVEL SECURITY;

COMMIT;
