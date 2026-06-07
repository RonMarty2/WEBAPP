-- ============================================================================
-- Idea — modalidad (tipo de trabajo) + universidad del proyecto
-- ============================================================================
-- "Define tu idea" ahora pregunta qué tipo de trabajo final hará el estudiante
-- (monografía, tesis, proyecto de grado, etc.) y su universidad. Se guardan
-- para que la IA y, más adelante, el Generador respeten el formato correcto.
--
-- Idempotente. Ejecutar en Supabase → SQL Editor → Run.
-- ============================================================================

BEGIN;

ALTER TABLE idea_proyectos
  ADD COLUMN IF NOT EXISTS tipo_trabajo TEXT,
  ADD COLUMN IF NOT EXISTS universidad  TEXT;

COMMIT;
