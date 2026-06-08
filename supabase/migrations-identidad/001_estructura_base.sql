-- ============================================================================
-- Módulo IDENTIDAD VISUAL — sub-herramienta de Marketing
-- ============================================================================
--
-- Construye la marca visual del proyecto: brief de marca, paleta de colores,
-- tipografía, logo y mockups. Vive como sub-herramienta dentro de Marketing
-- (un plan de marketing puede o no tener identidad visual asociada — son
-- 1:1 cuando existe).
--
-- DECISIÓN DE DISEÑO:
--   - 1 fila por plan de marketing (UNIQUE plan_id). Si un alumno tiene
--     varios planes, cada uno tiene su propia identidad.
--   - Todo guardado como columnas dedicadas + JSONB para detalle
--     (mockups[], paleta_secundaria[], etc).
--   - Logo final guardado como URL o data URI en `logo_principal_url`.
--   - Los archivos generados por IA (PNG del logo, mockups) viven en
--     Supabase Storage en la carpeta `identidad/{plan_id}/` cuando se
--     active Storage; por ahora se guarda en data URI base64 limitado a
--     2 MB para no inflar la BD.
--   - SIN RLS (autorización en /api/identidad/* con JWT propio).
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS identidad_visuales (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id                UUID NOT NULL REFERENCES marketing_planes(id) ON DELETE CASCADE,
  estudiante_id          TEXT NOT NULL,

  -- Brief de marca — qué identidad construimos
  brief                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  --   { nombre, sector, esencia, valores[], personalidad,
  --     publico_objetivo, atributos[], inspiracion[],
  --     prohibidos[] }

  -- Paleta de colores (hex)
  paleta_primario        TEXT,
  paleta_secundario      TEXT,
  paleta_acento          TEXT,
  paleta_neutro_claro    TEXT,
  paleta_neutro_oscuro   TEXT,
  paleta_esquema         TEXT,           -- 'monocromatica' | 'analoga' | 'complementaria' | 'triada' | 'tetrada' | 'libre'
  paleta_justificacion   TEXT,           -- por qué estos colores

  -- Tipografía (Google Fonts)
  tipo_principal_familia TEXT,
  tipo_principal_peso    TEXT,
  tipo_secundaria_familia TEXT,
  tipo_secundaria_peso   TEXT,
  tipo_justificacion     TEXT,

  -- Logo principal
  logo_concepto          TEXT,           -- descripción textual del logo
  logo_principal_url     TEXT,           -- URL o data URI (PNG/SVG)
  logo_prompt_usado      TEXT,           -- prompt enviado a la IA generativa
  logo_alternativas      JSONB DEFAULT '[]'::jsonb,
  --   [{ url, prompt, modelo, generado_en }]

  -- Mockups (aplicaciones del logo + paleta)
  mockups                JSONB DEFAULT '[]'::jsonb,
  --   [{ tipo: 'tarjeta'|'redes'|'empaque'|'merch_polo'|'merch_taza'|'banner',
  --      url, descripcion, generado_en }]

  -- Estado para tracking de progreso del estudiante
  estado                 TEXT NOT NULL DEFAULT 'brief'
                         CHECK (estado IN ('brief', 'paleta', 'tipografia', 'logo', 'mockups', 'completo')),

  creado_en              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_identidad_plan UNIQUE (plan_id)
);

CREATE INDEX IF NOT EXISTS idx_identidad_estudiante
  ON identidad_visuales (estudiante_id);

-- Auto-actualiza actualizado_en en UPDATE
CREATE OR REPLACE FUNCTION identidad_touch_actualizado()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_identidad_touch ON identidad_visuales;
CREATE TRIGGER trg_identidad_touch
  BEFORE UPDATE ON identidad_visuales
  FOR EACH ROW
  EXECUTE FUNCTION identidad_touch_actualizado();

COMMIT;
