-- ============================================================
--  Laboratorio Académico SaaS — Migración V5.0
--  REFACTORIZACIÓN ARQUITECTÓNICA MAESTRA
--  Bifurcación de UX: Modo Directo / Modo Guiado
-- ============================================================
-- Ejecutar en Supabase SQL Editor después del schema V4.

-- ────────────────────────────────────────────────────────────
-- 1. Nuevas columnas en proyectos_fases
-- ────────────────────────────────────────────────────────────

ALTER TABLE proyectos_fases
  ADD COLUMN IF NOT EXISTS modalidad_creacion TEXT
    CHECK (modalidad_creacion IN ('directa', 'guiada'))
    DEFAULT 'directa',

  ADD COLUMN IF NOT EXISTS perfil_estilo_usuario TEXT DEFAULT NULL,

  -- Borradores por fase (Modo Guiado — primera pasada)
  ADD COLUMN IF NOT EXISTS borrador_fase_0 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS borrador_fase_1 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS borrador_fase_2 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS borrador_fase_3 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS borrador_fase_4 TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS borrador_fase_5 TEXT DEFAULT NULL,

  -- Cache invalidation flags: JSONB { "0": true, "1": false, ... }
  ADD COLUMN IF NOT EXISTS requiere_actualizacion JSONB DEFAULT '{}';

COMMENT ON COLUMN proyectos_fases.modalidad_creacion
  IS 'directa = genera contenido final al instante; guiada = calibración + borrador + feedback + final';

COMMENT ON COLUMN proyectos_fases.perfil_estilo_usuario
  IS 'Perfil de estilo generado por IA a partir de las respuestas de calibración. Se inyecta en cada fase con prioridad sobre Hilos Conductores.';

COMMENT ON COLUMN proyectos_fases.requiere_actualizacion
  IS 'JSON { "fase_id": true } — true cuando una fase anterior fue regenerada y esta fase necesita actualización.';


-- ────────────────────────────────────────────────────────────
-- 2. Nuevas columnas en prompts_maestros (dual prompts)
-- ────────────────────────────────────────────────────────────

ALTER TABLE prompts_maestros
  ADD COLUMN IF NOT EXISTS tipo TEXT
    CHECK (tipo IN ('borrador', 'final', 'unico'))
    DEFAULT 'unico',

  ADD COLUMN IF NOT EXISTS prompt_final TEXT DEFAULT NULL;

COMMENT ON COLUMN prompts_maestros.tipo
  IS 'borrador = usado en Modo Guiado primera pasada; final = usado con feedback; unico = Modo Directo + fallback';

COMMENT ON COLUMN prompts_maestros.prompt_final
  IS 'Prompt alternativo para generar la versión final con feedback del estudiante en Modo Guiado.';


-- ────────────────────────────────────────────────────────────
-- 3. Tabla calibracion_preguntas
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS calibracion_preguntas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  servicio_id     UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  pregunta        TEXT NOT NULL,
  descripcion     TEXT DEFAULT NULL,
  orden           INTEGER NOT NULL DEFAULT 0,
  minimo_palabras INTEGER NOT NULL DEFAULT 30,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calibracion_preguntas_servicio
  ON calibracion_preguntas (servicio_id, activo, orden);

COMMENT ON TABLE calibracion_preguntas
  IS 'Preguntas de calibración de estilo para Modo Guiado. El estudiante las responde antes de empezar a trabajar.';


-- ────────────────────────────────────────────────────────────
-- 4. Preguntas por defecto para Monografía Académica
-- ────────────────────────────────────────────────────────────

-- Primero identificar el servicio de monografía
DO $$
DECLARE
  mono_id UUID;
BEGIN
  SELECT id INTO mono_id FROM servicios
  WHERE nombre ILIKE '%monograf%' AND activo = TRUE
  LIMIT 1;

  IF mono_id IS NOT NULL THEN
    INSERT INTO calibracion_preguntas (servicio_id, pregunta, descripcion, orden, minimo_palabras)
    VALUES
      (mono_id,
       'Describe brevemente tu estilo preferido de escritura académica.',
       'Formal, técnico, narrativo, descriptivo... ¿Cómo describes tu forma natural de escribir?',
       0, 30),
      (mono_id,
       'Escribe un párrafo de ejemplo sobre cualquier tema académico de tu carrera.',
       'Este párrafo ayuda a la IA a calibrar tu vocabulario, estructura de oraciones y tono.',
       10, 80),
      (mono_id,
       '¿Qué aspectos de tu escritura consideras más importantes o distintivos?',
       'Por ejemplo: precisión técnica, claridad, uso de ejemplos, argumentación, etc.',
       20, 20)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────
-- 5. RLS policies para calibracion_preguntas
-- ────────────────────────────────────────────────────────────

ALTER TABLE calibracion_preguntas ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer las preguntas activas
CREATE POLICY IF NOT EXISTS "calibracion_preguntas_select"
  ON calibracion_preguntas FOR SELECT
  TO authenticated
  USING (activo = TRUE);

-- Solo admins pueden gestionar preguntas (via service_role key)
-- La API admin usa createAdminClient() que bypassa RLS


-- ────────────────────────────────────────────────────────────
-- 6. Actualizar proyectos existentes: asignar modalidad directa
-- ────────────────────────────────────────────────────────────

UPDATE proyectos_fases
SET modalidad_creacion = 'directa'
WHERE modalidad_creacion IS NULL;


-- ────────────────────────────────────────────────────────────
-- FIN DE MIGRACIÓN V5.0
-- ────────────────────────────────────────────────────────────
