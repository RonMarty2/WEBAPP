-- ============================================================================
-- Módulo Docente — Wave 3: observaciones del docente + consentimiento del alumno
-- ============================================================================
--
-- Wave 1 vinculó docente ↔ alumno.
-- Wave 2 mostró al docente los METADATOS de los proyectos del alumno.
-- Wave 3 cierra el ciclo de feedback:
--
--   1) El docente puede dejar OBSERVACIONES sobre un proyecto específico
--      del alumno (por módulo). Funciona como "tareas a corregir".
--   2) El alumno puede dar/quitar CONSENTIMIENTO explícito para que su
--      docente vea el contenido (no solo metadatos) de sus proyectos.
--      Por defecto la respuesta es NO — el docente solo ve metadatos
--      hasta que el alumno active el toggle.
--
-- Mismo patrón:
--   - Prefijo docente_*
--   - id de docente/alumno = TEXT (JWT propio de webapp)
--   - SIN RLS (autorización en endpoints /api/{docente,alumno}/* con JWT)
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

-- Observaciones del docente sobre un proyecto concreto del alumno.
CREATE TABLE IF NOT EXISTS docente_observaciones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vinculo_id       UUID NOT NULL REFERENCES docente_alumno_vinculos(id) ON DELETE CASCADE,
  -- Snapshot redundante (denormalizado) para queries rápidas y para que
  -- la observación sobreviva si el vínculo se borra accidentalmente y
  -- se recupera por backup.
  docente_id       TEXT NOT NULL,
  alumno_id        TEXT NOT NULL,
  -- Qué proyecto del alumno se está observando.
  modulo           TEXT NOT NULL CHECK (modulo IN ('idea','mercados','estrategia','marketing','organizacion','finanzas','defensa','generador')),
  proyecto_id      TEXT NOT NULL,         -- id del proyecto en su tabla módulo
  proyecto_titulo  TEXT NOT NULL,         -- snapshot para listar sin joinear
  -- Cuerpo de la observación.
  observacion      TEXT NOT NULL,
  -- Ciclo de vida: docente la crea (pendiente) → alumno la atiende o
  -- responde → docente puede archivar.
  estado           TEXT NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente','atendida','descartada')),
  respuesta_alumno TEXT,                  -- opcional, el alumno responde
  creada_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_obs_vinculo  ON docente_observaciones (vinculo_id);
CREATE INDEX IF NOT EXISTS idx_doc_obs_alumno   ON docente_observaciones (alumno_id) WHERE estado != 'descartada';
CREATE INDEX IF NOT EXISTS idx_doc_obs_docente  ON docente_observaciones (docente_id) WHERE estado != 'descartada';
CREATE INDEX IF NOT EXISTS idx_doc_obs_proyecto ON docente_observaciones (proyecto_id);

-- Consentimientos del alumno: ¿permite a este docente ver el contenido
-- (no solo metadatos) de sus proyectos? Una fila por (alumno, docente).
-- Por defecto NO existe → tratado como "no permitido".
CREATE TABLE IF NOT EXISTS docente_consentimientos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id                TEXT NOT NULL,
  docente_id               TEXT NOT NULL,
  permitir_ver_contenido   BOOLEAN NOT NULL DEFAULT FALSE,
  actualizado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_doc_consent UNIQUE (alumno_id, docente_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_consent_alumno  ON docente_consentimientos (alumno_id);
CREATE INDEX IF NOT EXISTS idx_doc_consent_docente ON docente_consentimientos (docente_id) WHERE permitir_ver_contenido = TRUE;

COMMIT;
