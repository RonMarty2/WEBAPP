-- ============================================================================
-- finanzas: desacoplar de auth.users de Supabase
-- ============================================================================
--
-- El módulo /finanzas en webapp NO usa Supabase Auth. Usa el JWT propio de
-- webapp (cookie lab_session). Por eso, finanzas_perfiles.id NO puede ser
-- una FK a auth.users.
--
-- Versión 3: detecta TODAS las FKs hacia finanzas_perfiles dinámicamente
-- (incluyendo disparado_por en finanzas_eventos_disparados que la v2 no
-- conocía). Y dropea TODAS las RLS policies de tablas finanzas_* primero.
-- Si ya ejecutaste una versión anterior parcial, este script es idempotente:
-- puedes ejecutarlo encima y se ajusta solo.
-- ============================================================================

BEGIN;

-- 1) DROP ALL POLICIES de tablas finanzas_*
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename LIKE 'finanzas_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 2) DROP TODAS las FKs hacia finanzas_perfiles + alterar tipo de cada columna
DO $$
DECLARE
  fk RECORD;
BEGIN
  FOR fk IN
    SELECT
      tc.table_schema,
      tc.table_name,
      tc.constraint_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'finanzas_perfiles'
      AND ccu.column_name = 'id'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I',
                   fk.table_schema, fk.table_name, fk.constraint_name);
    EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE TEXT USING %I::text',
                   fk.table_schema, fk.table_name, fk.column_name, fk.column_name);
  END LOOP;
END $$;

-- 3) DROP FK de finanzas_perfiles a auth.users + alter su id a TEXT
ALTER TABLE finanzas_perfiles DROP CONSTRAINT IF EXISTS finanzas_perfiles_id_fkey;
ALTER TABLE finanzas_perfiles ALTER COLUMN id TYPE TEXT USING id::text;

-- 4) NO se recrean FKs entre tablas finanzas_* — la integridad la maneja
--    la app a nivel de endpoints. Es más simple y no afecta funcionalidad.

-- 5) DISABLE RLS en TODAS las tablas finanzas_*
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'finanzas_%'
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

COMMIT;
