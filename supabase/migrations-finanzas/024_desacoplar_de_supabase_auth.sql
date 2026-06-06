-- ============================================================================
-- finanzas: desacoplar de auth.users de Supabase
-- ============================================================================
--
-- El módulo /finanzas en webapp NO usa Supabase Auth. Usa el JWT propio de
-- webapp (cookie lab_session). Por eso, finanzas_perfiles.id NO puede ser
-- una FK a auth.users.
--
-- Versión 4 (idempotente):
--   1) Drop RLS policies de tablas finanzas_*
--   2) Drop view promedio_estudiante (depende de columnas estudiante_id)
--   3) Drop dinámicamente todas las FKs hacia finanzas_perfiles + alter sus tipos
--   4) Drop FK finanzas_perfiles → auth.users + alter su id a TEXT
--   5) Recrear view promedio_estudiante
--   6) Disable RLS en TODAS las tablas finanzas_*
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

-- 2) DROP view dependiente de columnas que vamos a alterar
DROP VIEW IF EXISTS promedio_estudiante;

-- 3) DROP TODAS las FKs hacia finanzas_perfiles + alterar tipo de cada columna
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

-- 4) DROP FK finanzas_perfiles → auth.users + alter su id a TEXT
ALTER TABLE finanzas_perfiles DROP CONSTRAINT IF EXISTS finanzas_perfiles_id_fkey;
ALTER TABLE finanzas_perfiles ALTER COLUMN id TYPE TEXT USING id::text;

-- 5) Recrear view promedio_estudiante (definición de migration 017)
CREATE VIEW promedio_estudiante AS
WITH entregas_por_estudiante AS (
  -- Entregas individuales: solo cuentan para el alumno que entregó
  SELECT
    e.estudiante_id,
    e.curso_id,
    e.id AS entrega_id,
    e.nota,
    e.estado,
    e.entregado_en
  FROM finanzas_entregas e
  JOIN finanzas_proyectos p ON p.id = e.proyecto_id
  WHERE p.grupo_id IS NULL

  UNION

  -- Entregas grupales: cuentan para cada miembro del grupo
  SELECT
    gm.estudiante_id,
    e.curso_id,
    e.id AS entrega_id,
    e.nota,
    e.estado,
    e.entregado_en
  FROM finanzas_entregas e
  JOIN finanzas_proyectos p ON p.id = e.proyecto_id
  JOIN finanzas_grupo_miembros gm ON gm.grupo_id = p.grupo_id
  WHERE p.grupo_id IS NOT NULL
)
SELECT
  estudiante_id,
  curso_id,
  COUNT(*) FILTER (WHERE nota IS NOT NULL) AS entregas_revisadas,
  COUNT(*) FILTER (WHERE estado = 'pendiente') AS entregas_pendientes,
  ROUND(AVG(nota) FILTER (WHERE nota IS NOT NULL), 2) AS promedio_nota,
  MAX(nota) FILTER (WHERE nota IS NOT NULL) AS mejor_nota,
  MIN(nota) FILTER (WHERE nota IS NOT NULL) AS peor_nota,
  MAX(entregado_en) AS ultima_entrega_en
FROM entregas_por_estudiante
GROUP BY estudiante_id, curso_id;

COMMENT ON VIEW promedio_estudiante IS
  'Promedio simple de notas por estudiante por curso. Una entrega grupal aporta su nota al promedio de TODOS los miembros del grupo.';

-- 6) DISABLE RLS en TODAS las tablas finanzas_*
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
