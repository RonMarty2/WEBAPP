-- ============================================================================
-- Módulo Estrategia / Macroentorno — estructura base (FASE 0)
-- ============================================================================
--
-- Análisis estratégico: el estudiante construye PESTEL, 5 Fuerzas de Porter,
-- matrices MEFE/MEFI y FODA cruzada sobre su proyecto.
--
-- Mismo patrón que Finanzas y Mercados:
--   - Tablas con prefijo estrategia_* para coexistir sin chocar.
--   - id de perfil = TEXT (id del usuario de webapp, no UUID de Supabase Auth).
--   - SIN RLS (autorización en endpoints /api/estrategia/* con JWT propio).
--   - SIN triggers basados en auth.uid().
--
-- Las matrices se guardan como JSONB dentro del proyecto (estructura flexible,
-- una sola tabla, simple de versionar).
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS estrategia_perfiles (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL DEFAULT '—',
  rol         TEXT NOT NULL DEFAULT 'estudiante' CHECK (rol IN ('docente', 'estudiante')),
  email       TEXT NOT NULL,
  universidad TEXT,
  es_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estrategia_proyectos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES estrategia_perfiles(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  sector        TEXT,                         -- sector/industria que analiza

  -- Cada matriz como JSONB (estructura definida en el código del módulo):
  pestel  JSONB DEFAULT '{}'::jsonb,          -- 6 factores con factores y scoring
  porter  JSONB DEFAULT '{}'::jsonb,          -- 5 fuerzas con intensidad
  mefe    JSONB DEFAULT '{}'::jsonb,          -- factores externos ponderados
  mefi    JSONB DEFAULT '{}'::jsonb,          -- factores internos ponderados
  foda    JSONB DEFAULT '{}'::jsonb,          -- F/O/D/A + estrategias cruzadas

  estado  TEXT NOT NULL DEFAULT 'pestel'
          CHECK (estado IN ('pestel', 'porter', 'matrices', 'foda', 'reporte', 'completo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estrategia_proyectos_estudiante
  ON estrategia_proyectos(estudiante_id);

CREATE TABLE IF NOT EXISTS estrategia_progreso_clases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES estrategia_perfiles(id) ON DELETE CASCADE,
  clase_slug    TEXT NOT NULL,
  completada    BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score    INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, clase_slug)
);

ALTER TABLE estrategia_perfiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE estrategia_proyectos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE estrategia_progreso_clases DISABLE ROW LEVEL SECURITY;

COMMIT;
