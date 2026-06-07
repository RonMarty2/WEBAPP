-- ============================================================================
-- Módulo Defensa — estructura base (FASE 0)
-- ============================================================================
--
-- El estudiante se prepara para defender su tesis/proyecto:
--   banco de preguntas por categoría + simulacro donde responde y la IA
--   evalúa cada respuesta (puntaje + feedback). Reporte de avance al final.
--
-- Mismo patrón que los demás módulos:
--   - Tablas con prefijo defensa_* para coexistir sin chocar.
--   - id de perfil = TEXT (id del usuario de webapp).
--   - SIN RLS (autorización en endpoints /api/defensa/* con JWT propio).
--
-- Una sola migración con todas las columnas.
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS defensa_perfiles (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL DEFAULT '—',
  rol         TEXT NOT NULL DEFAULT 'estudiante' CHECK (rol IN ('docente', 'estudiante')),
  email       TEXT NOT NULL,
  universidad TEXT,
  es_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS defensa_proyectos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES defensa_perfiles(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  tema          TEXT,                         -- tema del trabajo a defender
  carrera       TEXT,

  -- Herramientas como JSONB:
  preguntas  JSONB DEFAULT '{}'::jsonb,       -- banco de preguntas por categoría
  simulacro  JSONB DEFAULT '{}'::jsonb,       -- último simulacro: respuestas + evaluación

  estado  TEXT NOT NULL DEFAULT 'preguntas'
          CHECK (estado IN ('preguntas', 'simulacro', 'reporte', 'completo')),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_defensa_proyectos_estudiante
  ON defensa_proyectos(estudiante_id);

CREATE TABLE IF NOT EXISTS defensa_progreso_clases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES defensa_perfiles(id) ON DELETE CASCADE,
  clase_slug    TEXT NOT NULL,
  completada    BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score    INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, clase_slug)
);

ALTER TABLE defensa_perfiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE defensa_proyectos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE defensa_progreso_clases DISABLE ROW LEVEL SECURITY;

COMMIT;
