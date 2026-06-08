-- ============================================================================
-- Módulo Docente — Wave 1: vinculación docente ↔ alumno
-- ============================================================================
--
-- Un docente genera un código de 6 letras y lo da a sus alumnos. Cada alumno
-- entra a "Tengo un código de docente", pega el código → se vincula. El
-- docente ve "Mis alumnos" con la lista.
--
-- NO hay concepto de grupo/curso en esta wave (panel híbrido decidido con
-- el usuario: cada alumno se vincula directo, sin estructura por grupo).
-- Si se agrega luego, sería otra tabla `docente_grupos` con FK acá.
--
-- Mismo patrón que los demás módulos:
--   - Prefijo docente_* para coexistir.
--   - id de docente/alumno = TEXT (id del usuario de webapp / JWT propio).
--   - SIN RLS (autorización en endpoints /api/docente/* con JWT propio).
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

-- Códigos de invitación generados por el docente. Un docente puede tener
-- varios códigos activos a la vez (ej. uno por materia/semestre); o
-- regenerar el código si el viejo se filtró.
CREATE TABLE IF NOT EXISTS docente_codigos (
  codigo      TEXT PRIMARY KEY,        -- 6 caracteres A-Z0-9, único global
  docente_id  TEXT NOT NULL,           -- id del usuario docente (JWT)
  etiqueta    TEXT,                    -- nombre opcional, ej. "MKT-2026-1"
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revocado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_docente_codigos_docente
  ON docente_codigos (docente_id) WHERE activo = TRUE;

-- Vínculos efectivos docente ↔ alumno. Se crea cuando el alumno pega un
-- código válido. Un alumno puede estar vinculado a varios docentes
-- (ej. distintas materias); un docente tiene N alumnos.
CREATE TABLE IF NOT EXISTS docente_alumno_vinculos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id      TEXT NOT NULL,
  alumno_id       TEXT NOT NULL,
  codigo_usado    TEXT NOT NULL REFERENCES docente_codigos(codigo) ON DELETE RESTRICT,
  -- Snapshot del nombre/email del alumno al momento de vincularse, para
  -- mostrar la lista sin tener que hacer join cada vez con la tabla de
  -- usuarios (que vive en otro motor — el JWT propio de webapp).
  alumno_nombre   TEXT NOT NULL,
  alumno_email    TEXT NOT NULL,
  alumno_universidad TEXT,
  vinculado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- El docente puede archivar/quitar un alumno sin borrar el histórico.
  archivado       BOOLEAN NOT NULL DEFAULT FALSE,
  -- Notas privadas del docente sobre el alumno (no las ve el alumno).
  nota_docente    TEXT,
  -- Un alumno solo puede vincularse UNA vez al mismo docente.
  CONSTRAINT uq_docente_alumno UNIQUE (docente_id, alumno_id)
);

CREATE INDEX IF NOT EXISTS idx_docente_alumno_docente
  ON docente_alumno_vinculos (docente_id) WHERE archivado = FALSE;

CREATE INDEX IF NOT EXISTS idx_docente_alumno_alumno
  ON docente_alumno_vinculos (alumno_id) WHERE archivado = FALSE;

COMMIT;
