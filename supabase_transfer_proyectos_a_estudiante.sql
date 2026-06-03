-- ════════════════════════════════════════════════════════════════════════════
-- Transferencia de proyectos al usuario rnd261190@gmail.com
-- ════════════════════════════════════════════════════════════════════════════
--
-- Propósito: el dueño del SaaS (cuenta admin) quiere probar la app desde la
-- perspectiva de un estudiante real. Para eso transfiere TODOS los proyectos
-- existentes a la cuenta rnd261190@gmail.com (cuenta de prueba como estudiante).
--
-- La cuenta admin sigue siendo admin y puede seguir entrando, pero los
-- proyectos quedan visibles desde la cuenta de estudiante.
--
-- Ejecutar UNA VEZ en Supabase Studio → SQL Editor → New query → Run.
--
-- Idempotente: se puede correr varias veces sin riesgo. Si rnd261190 ya tiene
-- los proyectos, el UPDATE no hace nada nuevo.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1) Asegurar que existe el usuario rnd261190@gmail.com ───────────────────
INSERT INTO usuarios (id, email, name, role, plan, active, registered_at, activated_at)
SELECT
  'usr_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  'rnd261190@gmail.com',
  'Ronald (estudiante)',
  'user',
  'pro',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios WHERE email = 'rnd261190@gmail.com'
);

-- ── 2) Transferir TODOS los proyectos a ese usuario ─────────────────────────
UPDATE proyectos
SET
  usuario_id = (SELECT id FROM usuarios WHERE email = 'rnd261190@gmail.com' LIMIT 1),
  updated_at = NOW()
WHERE usuario_id <> (SELECT id FROM usuarios WHERE email = 'rnd261190@gmail.com' LIMIT 1);

-- ── 3) Verificar el resultado ────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM proyectos
    WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'rnd261190@gmail.com' LIMIT 1)
  ) AS proyectos_en_cuenta_estudiante,
  (SELECT id FROM usuarios WHERE email = 'rnd261190@gmail.com' LIMIT 1) AS usuario_destino_id,
  (SELECT email FROM usuarios WHERE id = (SELECT usuario_id FROM proyectos LIMIT 1)) AS verificacion_email_de_proyecto;

-- Refrescar el cache del esquema PostgREST (por si acaso)
NOTIFY pgrst, 'reload schema';
