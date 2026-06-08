-- ============================================================================
-- Módulo Docente — Wave 3.1: marcar observaciones huérfanas cuando se borra el proyecto
-- ============================================================================
--
-- Problema: docente_observaciones tenía proyecto_id como TEXT sin FK,
-- porque el proyecto puede vivir en cualquiera de 7 tablas distintas
-- según el módulo. Si el alumno borra su proyecto, la observación queda
-- huérfana apuntando a un id phantom.
--
-- Solución sin tocar el modelo: agregar columna `proyecto_eliminado`
-- (default FALSE) + un job/trigger ligero que la marque cuando
-- detectemos que el proyecto ya no existe (lo hace el endpoint de
-- lectura, no la BD — más simple).
--
-- Por ahora solo agregamos la columna; el seteo lo hace el endpoint
-- /api/alumno/observaciones y /api/docente/observaciones cuando el
-- alumno o docente abren la lista.
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

ALTER TABLE docente_observaciones
  ADD COLUMN IF NOT EXISTS proyecto_eliminado BOOLEAN NOT NULL DEFAULT FALSE;

-- Index parcial para listar rápido las huérfanas si en algún momento
-- queremos hacer cleanup masivo.
CREATE INDEX IF NOT EXISTS idx_doc_obs_orfanas
  ON docente_observaciones (alumno_id)
  WHERE proyecto_eliminado = TRUE;

COMMIT;
