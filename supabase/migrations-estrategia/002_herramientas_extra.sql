-- ============================================================================
-- Estrategia — columnas para las herramientas adicionales (FASE 3 cont.)
-- ============================================================================
-- Agrega columnas JSONB para las herramientas que tienen datos propios:
--   mpc          — Matriz de Perfil Competitivo
--   cadena_valor — Cadena de Valor de Porter
--   bcg          — Matriz BCG (portafolio)
--   ansoff       — Matriz de Ansoff (crecimiento)
--   peyea        — Matriz PEYEA / SPACE
--
-- NO se agrega columna para MIE (se deriva de los totales de mefe + mefi)
-- ni para el reporte (se genera consolidando todo).
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

ALTER TABLE estrategia_proyectos
  ADD COLUMN IF NOT EXISTS mpc          JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cadena_valor JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS bcg          JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ansoff       JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS peyea        JSONB DEFAULT '{}'::jsonb;

COMMIT;
