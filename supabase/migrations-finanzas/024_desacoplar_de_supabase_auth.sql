-- ============================================================================
-- finanzas: desacoplar de auth.users de Supabase
-- ============================================================================
--
-- El módulo /finanzas en webapp NO usa Supabase Auth. Usa el JWT propio de
-- webapp (cookie lab_session). Por eso, finanzas_perfiles.id NO puede ser
-- una FK a auth.users.
--
-- Versión 2: dropea TODAS las RLS policies primero (algunas dependen de
-- las columnas que vamos a alterar). La autorización la hará el JWT de
-- webapp en server-side endpoints /api/finanzas/*.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1) DROP ALL POLICIES de tablas finanzas_* (dinámicamente)
-- ============================================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename LIKE 'finanzas_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- 2) DROP FK de finanzas_perfiles → auth.users
-- ============================================================================
ALTER TABLE finanzas_perfiles DROP CONSTRAINT IF EXISTS finanzas_perfiles_id_fkey;

-- ============================================================================
-- 3) DROP todas las FKs entrantes a finanzas_perfiles
-- ============================================================================
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

-- ============================================================================
-- 4) ALTER tipos de UUID → TEXT
-- ============================================================================
ALTER TABLE finanzas_perfiles ALTER COLUMN id TYPE TEXT USING id::text;
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

-- ============================================================================
-- 5) RECREAR FKs internas (entre tablas finanzas_*) ahora con tipo TEXT
-- ============================================================================
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

-- ============================================================================
-- 6) DISABLE RLS en TODAS las tablas finanzas_*
-- ============================================================================
-- La autorización la hace webapp's JWT en endpoints server-side /api/finanzas/*.
-- Cliente nunca toca las tablas finanzas_* directo, todo pasa por endpoints
-- que validan la sesión de webapp y usan service_role_key para los queries.
ALTER TABLE finanzas_perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_inscripciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_proyectos DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_simulaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_turnos_historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_entregas DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_grupos DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_grupo_miembros DISABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_eventos_disparados DISABLE ROW LEVEL SECURITY;

COMMIT;
