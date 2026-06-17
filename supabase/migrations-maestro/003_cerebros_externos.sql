-- ============================================================================
-- Proyecto Maestro — Artefactos de Cerebros Externos (migración 003)
-- ============================================================================
--
-- Guarda el StudentArtifact de cada cerebro externo vinculado a un Proyecto
-- Maestro. Permite que WEBAPP muestre el contexto cruzado y que la IA use
-- datos reales del estudiante al generar el documento académico.
--
-- Un "cerebro externo" es un repositorio independiente (simuladorPRO, MIE, etc.)
-- que implementa GET /api/artifact y exporta un StudentArtifact estándar
-- (contrato C0.Cerebro_contrato).
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS proyecto_maestro_cerebros (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maestro_id    UUID NOT NULL REFERENCES proyecto_maestro(id) ON DELETE CASCADE,

  -- Identificación del cerebro
  cerebro_id    TEXT NOT NULL,   -- 'simuladorPRO' | 'market-intelligence-engine' | ...
  project_id    TEXT NOT NULL,   -- ID del proyecto dentro del cerebro

  -- Datos del artefacto (caché del StudentArtifact)
  titulo        TEXT NOT NULL,
  resumen       TEXT,
  key_metrics   JSONB DEFAULT '[]'::jsonb,  -- ArtifactKeyMetric[]
  feeds_sections TEXT[] DEFAULT '{}',       -- DocumentSection[]
  content       JSONB DEFAULT '{}'::jsonb,  -- datos para el documento
  status        TEXT DEFAULT 'en_progreso', -- 'en_progreso' | 'completado' | 'aprobado'
  completeness_pct INTEGER DEFAULT 0,

  -- Trazabilidad
  artifact_fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- cuándo se trajo de la API
  artifact_updated_at TIMESTAMPTZ,  -- updated_at que vino del cerebro
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un cerebro por maestro (se puede actualizar, no duplicar)
  UNIQUE (maestro_id, cerebro_id)
);

CREATE INDEX IF NOT EXISTS idx_cerebros_maestro
  ON proyecto_maestro_cerebros(maestro_id);

CREATE INDEX IF NOT EXISTS idx_cerebros_tipo
  ON proyecto_maestro_cerebros(cerebro_id);

ALTER TABLE proyecto_maestro_cerebros DISABLE ROW LEVEL SECURITY;

COMMIT;
