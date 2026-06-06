-- ============================================================================
-- FASE 9 — Modos de simulación del curso
--
-- El docente puede elegir cómo se aplican los finanzas_eventos económicos a sus
-- estudiantes:
--   • automatico       — sistema sortea finanzas_eventos aleatorios (default, lo de hoy)
--   • docente_dispara  — el docente lanza cada evento manualmente
--   • curado           — el docente elige los finanzas_eventos exactos a aplicar
-- ============================================================================

ALTER TABLE finanzas_cursos
  ADD COLUMN modo_simulacion TEXT NOT NULL DEFAULT 'automatico'
    CHECK (modo_simulacion IN ('automatico', 'docente_dispara', 'curado')),
  ADD COLUMN eventos_curados UUID[] NULL;

COMMENT ON COLUMN finanzas_cursos.modo_simulacion IS
  'Cómo se aplican los finanzas_eventos económicos en la simulación. automatico=aleatorio. docente_dispara=el docente lanza cada uno. curado=lista fija de finanzas_eventos elegidos por el docente.';
COMMENT ON COLUMN finanzas_cursos.eventos_curados IS
  'Si modo_simulacion=curado, arreglo de UUIDs de la tabla finanzas_eventos que se van a aplicar (en orden). NULL para los otros modos.';
