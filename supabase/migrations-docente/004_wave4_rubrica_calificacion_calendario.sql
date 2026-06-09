-- ============================================================================
-- Módulo Docente — Wave 4: rúbrica + calificación + calendario de entregas
-- ============================================================================
--
-- Tres piezas nuevas para que el docente pueda:
--   1) Definir UNA rúbrica reutilizable con criterios ponderados.
--   2) Calificar a sus alumnos aplicando la rúbrica (nota 0-100 por
--      criterio, sistema calcula el promedio ponderado).
--   3) Crear fechas tope de entrega que el alumno ve en su /mis-entregas.
--
-- DECISIONES DE DISEÑO:
--   - 1 rúbrica activa por docente. Puede tener varias guardadas pero
--     solo una se usa por defecto (default_actual = TRUE).
--   - Criterios como JSONB array para que el docente pueda agregar/quitar
--     sin migración (10 criterios típicos: claridad, profundidad, etc.).
--   - Calificación por VÍNCULO (no por alumno_id directo) para que se
--     cascadee al archivar/eliminar. Un alumno tiene N calificaciones,
--     una por entregable + rúbrica.
--   - Las entregas son por DOCENTE (no por curso). Wave 5 podría agregar
--     "grupos" para diferenciar materias.
--
-- Mismo patrón:
--   - Prefijo docente_*
--   - id de docente/alumno = TEXT (JWT propio de webapp)
--   - SIN RLS (autorización en endpoints con JWT propio)
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

-- ── 1) RÚBRICAS ──────────────────────────────────────────────────────────
-- Un docente puede guardar varias rúbricas (ej. una para tesis, otra para
-- monografía). Solo UNA puede estar marcada como `default_actual=TRUE`.

CREATE TABLE IF NOT EXISTS docente_rubricas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id      TEXT NOT NULL,
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  -- Criterios: array de objetos
  -- [{ id: string, nombre: string, descripcion: string, peso_pct: number }]
  -- Suma de peso_pct debe ser 100 (validado en backend).
  criterios       JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Escala de calificación: 0-100 por default; algunas universidades usan
  -- 0-7 (UMSS posgrado). El sistema convierte al guardar.
  escala_max      INTEGER NOT NULL DEFAULT 100 CHECK (escala_max IN (7, 10, 20, 100)),
  -- Nota mínima de aprobación. Se compara contra el promedio ponderado.
  nota_aprueba    INTEGER NOT NULL DEFAULT 51,
  default_actual  BOOLEAN NOT NULL DEFAULT FALSE,
  archivada       BOOLEAN NOT NULL DEFAULT FALSE,
  creada_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizada_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_rub_docente
  ON docente_rubricas (docente_id) WHERE archivada = FALSE;

-- Solo UNA rúbrica por docente puede tener default_actual=TRUE.
-- Usamos un índice único parcial.
CREATE UNIQUE INDEX IF NOT EXISTS uq_doc_rub_default
  ON docente_rubricas (docente_id) WHERE default_actual = TRUE;


-- ── 2) CALIFICACIONES ────────────────────────────────────────────────────
-- Una fila por (alumno, módulo, proyecto, rúbrica). Permite recalificar el
-- mismo entregable cambiando la nota; mantenemos histórico vía actualizada_en.

CREATE TABLE IF NOT EXISTS docente_calificaciones (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vinculo_id         UUID NOT NULL REFERENCES docente_alumno_vinculos(id) ON DELETE CASCADE,
  docente_id         TEXT NOT NULL,
  alumno_id          TEXT NOT NULL,
  rubrica_id         UUID NOT NULL REFERENCES docente_rubricas(id) ON DELETE RESTRICT,
  -- Qué entregable se está calificando (módulo + proyecto del alumno).
  modulo             TEXT NOT NULL CHECK (modulo IN ('idea','mercados','estrategia','marketing','organizacion','finanzas','defensa','generador','otro')),
  proyecto_id        TEXT NOT NULL,
  proyecto_titulo    TEXT NOT NULL,
  -- Notas por criterio: array de objetos
  -- [{ criterio_id: string, nota: number, comentario: string }]
  notas_por_criterio JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Promedio ponderado calculado (sum(nota_i * peso_pct_i) / 100).
  -- Se calcula y persiste en backend para evitar recalcular en cada read.
  promedio_ponderado NUMERIC(5,2),
  -- Comentario general del docente (independiente de los criterios).
  comentario_general TEXT,
  -- Estado del feedback: borrador (solo docente lo ve), publicada (alumno la ve).
  estado             TEXT NOT NULL DEFAULT 'borrador'
                     CHECK (estado IN ('borrador', 'publicada')),
  publicada_en       TIMESTAMPTZ,
  creada_en          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizada_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un docente solo puede tener UNA calificación por (alumno, módulo, proyecto, rúbrica).
  -- Si quiere recalificar, hace PATCH a la existente.
  CONSTRAINT uq_doc_calif UNIQUE (docente_id, alumno_id, modulo, proyecto_id, rubrica_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_calif_alumno
  ON docente_calificaciones (alumno_id) WHERE estado = 'publicada';

CREATE INDEX IF NOT EXISTS idx_doc_calif_docente
  ON docente_calificaciones (docente_id);

CREATE INDEX IF NOT EXISTS idx_doc_calif_vinculo
  ON docente_calificaciones (vinculo_id);


-- ── 3) ENTREGAS (calendario) ─────────────────────────────────────────────
-- El docente crea fechas tope. Pueden ser para TODOS sus alumnos (un solo
-- vínculo) o para un alumno específico (privadas). Wave 5 podría agregar
-- "grupos" para asignar a subset.

CREATE TABLE IF NOT EXISTS docente_entregas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id      TEXT NOT NULL,
  -- Si NULL, aplica a TODOS los alumnos del docente.
  -- Si tiene valor, solo a ese alumno (vínculo específico).
  vinculo_id      UUID REFERENCES docente_alumno_vinculos(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  -- Módulo recomendado (informativo; no fuerza al alumno).
  modulo_sugerido TEXT CHECK (modulo_sugerido IN ('idea','mercados','estrategia','marketing','organizacion','finanzas','defensa','generador','otro')),
  fecha_tope      TIMESTAMPTZ NOT NULL,
  -- Estado lifecycle: programada (futuro), vencida (pasó), cumplida (alumno marcó), cancelada (docente la borró)
  estado          TEXT NOT NULL DEFAULT 'programada'
                  CHECK (estado IN ('programada','vencida','cumplida','cancelada')),
  prioridad       TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja','media','alta')),
  creada_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizada_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_entregas_docente
  ON docente_entregas (docente_id, fecha_tope);

CREATE INDEX IF NOT EXISTS idx_doc_entregas_alumno
  ON docente_entregas (vinculo_id) WHERE vinculo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_doc_entregas_vencidas
  ON docente_entregas (fecha_tope) WHERE estado = 'programada';


-- ── Triggers de auto-update ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION docente_touch_actualizado()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizada_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doc_rub_touch ON docente_rubricas;
CREATE TRIGGER trg_doc_rub_touch
  BEFORE UPDATE ON docente_rubricas
  FOR EACH ROW EXECUTE FUNCTION docente_touch_actualizado();

DROP TRIGGER IF EXISTS trg_doc_calif_touch ON docente_calificaciones;
CREATE TRIGGER trg_doc_calif_touch
  BEFORE UPDATE ON docente_calificaciones
  FOR EACH ROW EXECUTE FUNCTION docente_touch_actualizado();

DROP TRIGGER IF EXISTS trg_doc_entregas_touch ON docente_entregas;
CREATE TRIGGER trg_doc_entregas_touch
  BEFORE UPDATE ON docente_entregas
  FOR EACH ROW EXECUTE FUNCTION docente_touch_actualizado();

COMMIT;
