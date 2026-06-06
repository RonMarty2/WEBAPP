-- ============================================================================
-- Proyecto Maestro — capa de contexto compartido entre módulos (PASO 1)
-- ============================================================================
--
-- Permite que un estudiante defina su proyecto UNA vez y lo vincule a varios
-- módulos (estrategia, mercados, finanzas, marketing…). Cada módulo lee el
-- contexto del maestro + los artefactos de otros módulos para que la IA
-- genere con contexto cruzado.
--
-- OPCIONAL: los módulos siguen funcionando sin proyecto maestro (cliente que
-- usa una materia suelta). Si hay maestro vinculado, comparten contexto.
--
-- Patrón estándar del laboratorio: id TEXT (usuario webapp), sin RLS,
-- autorización en endpoints server-side con JWT propio.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- proyecto_maestro — la idea de negocio / tema de tesis del estudiante
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proyecto_maestro (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id TEXT NOT NULL,              -- id del usuario de webapp
  titulo        TEXT NOT NULL,              -- "Cafetería La Orquídea"
  tipo_negocio  TEXT,                       -- cafetería, gimnasio, app, etc.
  sector        TEXT,                       -- gastronomía, tecnología, etc.
  departamento  TEXT,
  municipio     TEXT,
  zona          TEXT,
  descripcion   TEXT,                       -- breve descripción de la idea
  universidad   TEXT,
  modalidad     TEXT,                       -- tesis / proyecto de grado / monografía
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proyecto_maestro_estudiante
  ON proyecto_maestro(estudiante_id);

-- ----------------------------------------------------------------------------
-- proyecto_maestro_vinculos — qué proyecto de cada módulo pertenece a un maestro
--
-- Relaciona el proyecto maestro con el proyecto interno de cada módulo
-- (estrategia_proyectos.id, mercados_proyectos.id, etc.) de forma genérica:
--   modulo = 'mercados' | 'estrategia' | 'finanzas' | 'marketing' | ...
--   ref_id = id del proyecto dentro de ese módulo
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proyecto_maestro_vinculos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id  UUID NOT NULL REFERENCES proyecto_maestro(id) ON DELETE CASCADE,
  modulo      TEXT NOT NULL,                -- 'mercados', 'estrategia', etc.
  ref_id      TEXT NOT NULL,                -- id del proyecto en ese módulo
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (maestro_id, modulo)               -- un proyecto por módulo por maestro
);

CREATE INDEX IF NOT EXISTS idx_vinculos_maestro ON proyecto_maestro_vinculos(maestro_id);

ALTER TABLE proyecto_maestro          DISABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_maestro_vinculos DISABLE ROW LEVEL SECURITY;

COMMIT;
