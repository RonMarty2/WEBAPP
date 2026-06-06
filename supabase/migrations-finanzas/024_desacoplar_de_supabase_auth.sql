-- ============================================================================
-- finanzas: desacoplar de auth.users de Supabase
-- ============================================================================
--
-- El módulo /finanzas en webapp NO usa Supabase Auth. Usa el JWT propio de
-- webapp (cookie lab_session). Por eso, finanzas_perfiles.id NO puede ser
-- una FK a auth.users.
--
-- Cambios:
-- 1) Drop FK finanzas_perfiles.id → auth.users(id)
-- 2) Cambiar tipo de finanzas_perfiles.id a TEXT (los IDs de webapp son
--    strings tipo Google sub, no UUIDs)
-- 3) Cambiar tipo en todas las tablas hijas que referencian a finanzas_perfiles
-- 4) Drop RLS en finanzas_perfiles (la autorización la hace webapp's JWT)
--    Las demás tablas mantienen su RLS hasta que migremos el sistema completo.
--
-- Ejecutar en Supabase Dashboard → SQL Editor → Run.
-- ============================================================================

BEGIN;

-- 1) Quitar FK a auth.users
ALTER TABLE finanzas_perfiles DROP CONSTRAINT IF EXISTS finanzas_perfiles_id_fkey;

-- 2) Cambiar tipo de id en finanzas_perfiles a TEXT
-- Primero hay que dropear las FKs entrantes desde otras tablas
ALTER TABLE finanzas_cursos DROP CONSTRAINT IF EXISTS finanzas_cursos_docente_id_fkey;
ALTER TABLE finanzas_inscripciones DROP CONSTRAINT IF EXISTS finanzas_inscripciones_estudiante_id_fkey;
ALTER TABLE finanzas_proyectos DROP CONSTRAINT IF EXISTS finanzas_proyectos_estudiante_id_fkey;
ALTER TABLE finanzas_proyectos DROP CONSTRAINT IF EXISTS finanzas_proyectos_docente_id_fkey;
ALTER TABLE finanzas_entregas DROP CONSTRAINT IF EXISTS finanzas_entregas_estudiante_id_fkey;
ALTER TABLE finanzas_entregas DROP CONSTRAINT IF EXISTS finanzas_entregas_docente_id_fkey;
ALTER TABLE finanzas_grupos DROP CONSTRAINT IF EXISTS finanzas_grupos_lider_id_fkey;
ALTER TABLE finanzas_grupo_miembros DROP CONSTRAINT IF EXISTS finanzas_grupo_miembros_estudiante_id_fkey;
ALTER TABLE finanzas_eventos_disparados DROP CONSTRAINT IF EXISTS finanzas_eventos_disparados_docente_id_fkey;
ALTER TABLE finanzas_simulaciones DROP CONSTRAINT IF EXISTS finanzas_simulaciones_estudiante_id_fkey;

-- Alterar el tipo de id en finanzas_perfiles
ALTER TABLE finanzas_perfiles ALTER COLUMN id TYPE TEXT USING id::text;

-- Alterar tipos en tablas hijas (las columnas FK)
ALTER TABLE finanzas_cursos ALTER COLUMN docente_id TYPE TEXT USING docente_id::text;
ALTER TABLE finanzas_inscripciones ALTER COLUMN estudiante_id TYPE TEXT USING estudiante_id::text;
ALTER TABLE finanzas_proyectos ALTER COLUMN estudiante_id TYPE TEXT USING estudiante_id::text;
ALTER TABLE finanzas_proyectos ALTER COLUMN docente_id TYPE TEXT USING docente_id::text;
ALTER TABLE finanzas_entregas ALTER COLUMN estudiante_id TYPE TEXT USING estudiante_id::text;
ALTER TABLE finanzas_entregas ALTER COLUMN docente_id TYPE TEXT USING docente_id::text;
ALTER TABLE finanzas_grupos ALTER COLUMN lider_id TYPE TEXT USING lider_id::text;
ALTER TABLE finanzas_grupo_miembros ALTER COLUMN estudiante_id TYPE TEXT USING estudiante_id::text;
ALTER TABLE finanzas_eventos_disparados ALTER COLUMN docente_id TYPE TEXT USING docente_id::text;
ALTER TABLE finanzas_simulaciones ALTER COLUMN estudiante_id TYPE TEXT USING estudiante_id::text;

-- 3) Recrear las FKs ahora con tipo TEXT
ALTER TABLE finanzas_cursos ADD CONSTRAINT finanzas_cursos_docente_id_fkey
  FOREIGN KEY (docente_id) REFERENCES finanzas_perfiles(id) ON DELETE CASCADE;
ALTER TABLE finanzas_inscripciones ADD CONSTRAINT finanzas_inscripciones_estudiante_id_fkey
  FOREIGN KEY (estudiante_id) REFERENCES finanzas_perfiles(id) ON DELETE CASCADE;
ALTER TABLE finanzas_proyectos ADD CONSTRAINT finanzas_proyectos_estudiante_id_fkey
  FOREIGN KEY (estudiante_id) REFERENCES finanzas_perfiles(id) ON DELETE CASCADE;
ALTER TABLE finanzas_entregas ADD CONSTRAINT finanzas_entregas_estudiante_id_fkey
  FOREIGN KEY (estudiante_id) REFERENCES finanzas_perfiles(id) ON DELETE CASCADE;
ALTER TABLE finanzas_grupos ADD CONSTRAINT finanzas_grupos_lider_id_fkey
  FOREIGN KEY (lider_id) REFERENCES finanzas_perfiles(id) ON DELETE SET NULL;
ALTER TABLE finanzas_grupo_miembros ADD CONSTRAINT finanzas_grupo_miembros_estudiante_id_fkey
  FOREIGN KEY (estudiante_id) REFERENCES finanzas_perfiles(id) ON DELETE CASCADE;
ALTER TABLE finanzas_simulaciones ADD CONSTRAINT finanzas_simulaciones_estudiante_id_fkey
  FOREIGN KEY (estudiante_id) REFERENCES finanzas_perfiles(id) ON DELETE CASCADE;

-- 4) Desactivar RLS en finanzas_perfiles (autorización vía webapp's JWT en server-side)
-- Las demás tablas mantienen RLS, pero todas las queries pasarán por endpoints
-- /api/finanzas/* que usan service_role_key, así que RLS no estorba.
ALTER TABLE finanzas_perfiles DISABLE ROW LEVEL SECURITY;

COMMIT;
