-- ============================================================================
-- Módulo Mercados — estructura base (FASE 0)
-- ============================================================================
--
-- Investigación de mercados: el estudiante diseña su investigación, calcula
-- muestra, arma encuestas, recolecta respuestas reales (link/QR público) y
-- analiza resultados.
--
-- Igual que el módulo Finanzas:
--   - Tablas con prefijo mercados_* para coexistir con webapp y otros módulos.
--   - id de perfil = TEXT (el id del usuario de webapp, no UUID de Supabase Auth).
--   - SIN RLS (la autorización la hacen endpoints /api/mercados/* con JWT propio).
--   - SIN triggers basados en auth.uid().
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- mercados_perfiles — espejo del usuario de webapp dentro del módulo
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercados_perfiles (
  id          TEXT PRIMARY KEY,            -- id del usuario de webapp
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL DEFAULT '—',
  rol         TEXT NOT NULL DEFAULT 'estudiante' CHECK (rol IN ('docente', 'estudiante')),
  email       TEXT NOT NULL,
  universidad TEXT,
  es_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- mercados_proyectos — una investigación de mercado del estudiante
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercados_proyectos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id   TEXT NOT NULL REFERENCES mercados_perfiles(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  -- Diseño de la investigación (FASE 2)
  tipo_estudio    TEXT CHECK (tipo_estudio IN ('exploratorio', 'descriptivo', 'causal')),
  objetivo_general TEXT,
  objetivos_especificos JSONB DEFAULT '[]'::jsonb,
  hipotesis       JSONB DEFAULT '[]'::jsonb,
  variables       JSONB DEFAULT '[]'::jsonb,
  -- Geografía / universo (para muestreo, datos INE)
  departamento    TEXT,
  municipio       TEXT,
  zona            TEXT,
  -- Muestreo (FASE 2)
  universo        INTEGER,
  nivel_confianza NUMERIC,   -- ej 0.95
  margen_error    NUMERIC,   -- ej 0.05
  tipo_muestreo   TEXT,
  tamano_muestra  INTEGER,
  -- Estado del flujo
  estado          TEXT NOT NULL DEFAULT 'diseno'
                  CHECK (estado IN ('diseno', 'muestreo', 'encuesta', 'recoleccion', 'analisis', 'reporte', 'completo')),
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mercados_proyectos_estudiante
  ON mercados_proyectos(estudiante_id);

-- ----------------------------------------------------------------------------
-- mercados_encuestas — el instrumento de un proyecto (FASE 3)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercados_encuestas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id   UUID NOT NULL REFERENCES mercados_proyectos(id) ON DELETE CASCADE,
  titulo        TEXT NOT NULL,
  descripcion   TEXT,
  -- Token público corto para el link/QR (FASE 4). NULL hasta publicar.
  token_publico TEXT UNIQUE,
  publicada     BOOLEAN NOT NULL DEFAULT FALSE,
  cerrada       BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mercados_encuestas_proyecto
  ON mercados_encuestas(proyecto_id);

-- ----------------------------------------------------------------------------
-- mercados_preguntas — preguntas de una encuesta (FASE 3)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercados_preguntas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES mercados_encuestas(id) ON DELETE CASCADE,
  orden       INTEGER NOT NULL DEFAULT 0,
  texto       TEXT NOT NULL,
  -- tipo: opcion_unica | opcion_multiple | likert | abierta | numerica | escala
  tipo        TEXT NOT NULL DEFAULT 'opcion_unica',
  opciones    JSONB DEFAULT '[]'::jsonb,   -- para opción única/múltiple/escala
  obligatoria BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mercados_preguntas_encuesta
  ON mercados_preguntas(encuesta_id);

-- ----------------------------------------------------------------------------
-- mercados_respuestas — una respuesta enviada por un encuestado (FASE 4)
-- Pública: NO referencia a ningún usuario. Cualquiera con el link responde.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercados_respuestas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id  UUID NOT NULL REFERENCES mercados_encuestas(id) ON DELETE CASCADE,
  -- Cada respuesta guarda un objeto { pregunta_id: valor, ... }
  respuestas   JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Metadatos anónimos para análisis (sin identificar personas)
  completada   BOOLEAN NOT NULL DEFAULT TRUE,
  enviado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mercados_respuestas_encuesta
  ON mercados_respuestas(encuesta_id);

-- ----------------------------------------------------------------------------
-- mercados_progreso_clases — progreso del estudiante en la academia (FASE 1)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mercados_progreso_clases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL REFERENCES mercados_perfiles(id) ON DELETE CASCADE,
  clase_slug    TEXT NOT NULL,
  completada    BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score    INTEGER DEFAULT 0,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, clase_slug)
);

-- ----------------------------------------------------------------------------
-- RLS desactivado en todas las tablas (autorización en endpoints server-side)
-- ----------------------------------------------------------------------------
ALTER TABLE mercados_perfiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercados_proyectos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercados_encuestas       DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercados_preguntas       DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercados_respuestas      DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercados_progreso_clases DISABLE ROW LEVEL SECURITY;

COMMIT;
