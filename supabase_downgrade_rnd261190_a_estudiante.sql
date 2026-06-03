-- ════════════════════════════════════════════════════════════════════════════
-- Bajar el rol de rnd261190@gmail.com de "admin" a "user"
-- ════════════════════════════════════════════════════════════════════════════
--
-- El usuario rnd261190@gmail.com está marcado como role='admin' en la BD
-- (de un cleanup viejo). El dueño quiere usarlo como cuenta de PRUEBA como
-- estudiante, no como admin. Por eso baja el rol a 'user'.
--
-- La cuenta admin REAL del SaaS sigue siendo ronaldmartinezjimenes@gmail.com,
-- que además está hardcoded en src/lib/auth.ts (HARDCODED_ADMIN_EMAILS).
--
-- IMPORTANTE: después de correr este SQL, hay que CERRAR SESIÓN y volver a
-- entrar para que el JWT cookie se regenere con role=user. Sino la sesión
-- vieja sigue mostrando UI de admin.
--
-- Ejecutar UNA VEZ en Supabase Studio → SQL Editor → New query → Run.
-- ════════════════════════════════════════════════════════════════════════════

-- 1) Bajar el rol del usuario rnd261190 a 'user'
UPDATE usuarios
SET role = 'user'
WHERE email = 'rnd261190@gmail.com'
  AND role <> 'user';

-- 2) Verificar el resultado
SELECT id, email, role, plan, active
FROM usuarios
WHERE email IN ('rnd261190@gmail.com', 'ronaldmartinezjimenes@gmail.com');

-- 3) Refrescar el cache del esquema PostgREST
NOTIFY pgrst, 'reload schema';
