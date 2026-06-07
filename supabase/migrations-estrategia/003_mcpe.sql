-- ============================================================================
-- Estrategia — columna para MCPE / QSPM (decisión cuantitativa final)
-- ============================================================================
-- Agrega la columna JSONB para la última herramienta del laboratorio:
--   mcpe — Matriz Cuantitativa de Planificación Estratégica (QSPM).
--          Puntúa cada estrategia candidata contra los factores clave
--          (peso × atractivo) y produce un ranking con la más conveniente.
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- (Idempotente: ADD COLUMN IF NOT EXISTS.)
-- ============================================================================

BEGIN;

ALTER TABLE estrategia_proyectos
  ADD COLUMN IF NOT EXISTS mcpe JSONB DEFAULT '{}'::jsonb;

COMMIT;
