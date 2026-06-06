-- ============================================================================
-- finanzas: eliminar triggers/funciones que dependían de auth.uid() (UUID)
-- ============================================================================
--
-- Después de la migration 024 (cambio de id a TEXT), los triggers y funciones
-- del simuladorPRO que comparaban `id = auth.uid()` empezaron a fallar con:
--   ERROR: 42883: operator does not exist: text = uuid
--
-- Como webapp no usa Supabase Auth (usa JWT propio + endpoints server-side
-- con service_role_key), estos triggers ya no aplican y bloquean cualquier
-- UPDATE en finanzas_perfiles silenciosamente.
--
-- Solución: eliminar los triggers y funciones obsoletas. La autorización
-- "no escribas en campos sensibles" la haremos en los endpoints, no en SQL.
-- ============================================================================

BEGIN;

-- Eliminar triggers conocidos del simuladorPRO que dependían de auth.uid()
DROP TRIGGER IF EXISTS proteger_campos_sensibles_perfil_trigger ON finanzas_perfiles;
DROP TRIGGER IF EXISTS proteger_perfil_trigger ON finanzas_perfiles;

-- Eliminar las funciones (CASCADE elimina cualquier dependencia restante)
DROP FUNCTION IF EXISTS proteger_campos_sensibles_perfil() CASCADE;
DROP FUNCTION IF EXISTS es_admin_actual() CASCADE;

-- Eliminar cualquier OTRO trigger en tablas finanzas_* que use auth.uid()
-- (defensivo: detectamos triggers y los dropeamos si su función referencia auth.uid)
DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT
      tg.tgname AS trigger_name,
      cl.relname AS table_name,
      pg_get_functiondef(tg.tgfoid) AS function_def
    FROM pg_trigger tg
    JOIN pg_class cl ON cl.oid = tg.tgrelid
    JOIN pg_namespace ns ON ns.oid = cl.relnamespace
    WHERE ns.nspname = 'public'
      AND cl.relname LIKE 'finanzas_%'
      AND NOT tg.tgisinternal
  LOOP
    -- Si la función del trigger menciona auth.uid(), lo dropeamos
    IF trig.function_def LIKE '%auth.uid()%' THEN
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I',
                     trig.trigger_name, trig.table_name);
      RAISE NOTICE 'Dropped trigger % on table %', trig.trigger_name, trig.table_name;
    END IF;
  END LOOP;
END $$;

COMMIT;
