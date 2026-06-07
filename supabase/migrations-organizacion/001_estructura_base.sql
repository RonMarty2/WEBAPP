-- ============================================================================
-- Módulo Organización — estructura base (FASE 0)
-- ============================================================================
--
-- El estudiante construye la estructura organizacional de su proyecto:
--   organigrama, RRHH (cargos + salarios + aportes patronales bolivianos
--   30.37%), legal (NIT, Fundempresa, AFP), técnico (proceso productivo,
--   capacidad, layout) y branding (identidad). Reporte consolidado al final.
--
-- Mismo patrón que Finanzas, Mercados, Estrategia y Marketing:
--   - Tablas con prefijo organizacion_* para coexistir sin chocar.
--   - id de perfil = TEXT (id del usuario de webapp, no UUID de Supabase Auth).
--   - SIN RLS (autorización en endpoints /api/organizacion/* con JWT propio).
--   - SIN triggers basados en auth.uid().
--
-- Cada herramienta se guarda como JSONB dentro del proyecto. Una sola
-- migración: incluye ya todas las columnas de las herramientas previstas.
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS organizacion_perfiles (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL DEFAULT '—',
  rol         TEXT NOT NULL DEFAULT 'estudiante' CHECK (rol IN ('docente', 'estudiante')),
  email       TEXT NOT NULL,
  universidad TEXT,
  es_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizacion_proyectos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES organizacion_perfiles(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  empresa       TEXT,                         -- nombre del proyecto/empresa
  sector        TEXT,                         -- rubro

  -- Cada herramienta como JSONB (estructura definida en el código del módulo):
  organigrama JSONB DEFAULT '{}'::jsonb,      -- estructura jerárquica
  rrhh        JSONB DEFAULT '{}'::jsonb,      -- cargos, salarios, aportes patronales BO
  legal       JSONB DEFAULT '{}'::jsonb,      -- checklist NIT, Fundempresa, AFP, etc.
  tecnico     JSONB DEFAULT '{}'::jsonb,      -- proceso productivo, capacidad, layout
  branding    JSONB DEFAULT '{}'::jsonb,      -- identidad, valores, tono, naming

  estado  TEXT NOT NULL DEFAULT 'organigrama'
          CHECK (estado IN ('organigrama', 'rrhh', 'legal', 'tecnico', 'branding', 'reporte', 'completo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizacion_proyectos_estudiante
  ON organizacion_proyectos(estudiante_id);

CREATE TABLE IF NOT EXISTS organizacion_progreso_clases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES organizacion_perfiles(id) ON DELETE CASCADE,
  clase_slug    TEXT NOT NULL,
  completada    BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score    INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, clase_slug)
);

ALTER TABLE organizacion_perfiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizacion_proyectos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizacion_progreso_clases DISABLE ROW LEVEL SECURITY;

COMMIT;
