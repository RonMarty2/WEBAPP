-- ════════════════════════════════════════════════════════════════════════════
-- FIX REAL: alinear el CHECK constraint de `usuarios.role` con los valores
-- que usa el código TypeScript.
-- ════════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA detectado:
--
--   - Schema actual de Supabase (supabase_full_setup.sql:62):
--       CHECK (role IN ('admin', 'user', 'demo'))
--
--   - Código TypeScript (src/lib/auth.ts:49):
--       type UserRole = "admin" | "estudiante" | "docente"
--
--   Estos NO son compatibles. Por eso:
--
--     1) UPDATE manual con `role = 'estudiante'` falla con error 23514.
--     2) El callback de Google que intentaba upsert con `role = "estudiante"`
--        rompía en silencio (BD rechazaba, fallback a otro valor).
--     3) El único valor "no admin" que la BD aceptaba era 'user', así que
--        TODO el ecosistema quedó pegado: la única manera de bajar un usuario
--        era ponerlo en 'user', pero ningún componente sabía qué hacer con eso
--        excepto chequear `role !== "admin"`.
--
-- SOLUCIÓN:
--   Expandir el CHECK para aceptar TODOS los valores que el código pueda
--   usar. No rompe lo existente — los registros 'user' y 'admin' siguen siendo
--   válidos. Solo agregamos 'estudiante' y 'docente'.
--
--   Después del CHECK actualizado, bajamos a rnd261190@gmail.com a 'estudiante'
--   (el valor canónico del código TS).
--
-- Ejecutar UNA VEZ en Supabase Studio → SQL Editor → New query → Run.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1) Expandir el CHECK constraint ─────────────────────────────────────────
ALTER TABLE public.usuarios
  DROP CONSTRAINT IF EXISTS usuarios_role_check;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_role_check
  CHECK (role IN ('admin', 'user', 'demo', 'estudiante', 'docente'));

-- ── 2) Bajar rnd261190@gmail.com a 'estudiante' ─────────────────────────────
UPDATE public.usuarios
SET role = 'estudiante'
WHERE email = 'rnd261190@gmail.com';

-- ── 3) Verificar resultado ──────────────────────────────────────────────────
SELECT id, email, role, plan, active
FROM public.usuarios
WHERE email IN ('rnd261190@gmail.com', 'ronaldmartinezjimenes@gmail.com');

-- ── 4) Refrescar el cache del esquema PostgREST ─────────────────────────────
NOTIFY pgrst, 'reload schema';
