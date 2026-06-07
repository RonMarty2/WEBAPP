-- ============================================================================
-- Proyecto Maestro — columna del documento del proyecto (Generador Wave 2)
-- ============================================================================
-- Guarda el documento que el estudiante arma en el Generador conectado:
--   { secciones: [{ id, titulo, contenido }], actualizado }
-- Cada sección se genera con IA (contexto cruzado) y el estudiante la edita.
--
-- Idempotente. Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

ALTER TABLE proyecto_maestro
  ADD COLUMN IF NOT EXISTS documento JSONB DEFAULT '{}'::jsonb;

COMMIT;
