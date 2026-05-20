-- ════════════════════════════════════════════════════════════════════════════
-- Laboratorio Académico PRO — Setup completo de Supabase
-- ════════════════════════════════════════════════════════════════════════════
--
--  📌 USO:
--    1. Abrí el SQL Editor de tu proyecto Supabase:
--       https://supabase.com/dashboard/project/<TU-PROJECT-ID>/sql/new
--    2. Pegá este archivo COMPLETO.
--    3. Click "Run" (Ctrl+Enter).
--    4. Debería terminar sin errores en ~5 segundos.
--
--  ✅ Es 100% idempotente: podés ejecutarlo varias veces sin romper nada.
--     Usa IF NOT EXISTS / ALTER ADD IF NOT EXISTS / CREATE OR REPLACE.
--
--  📦 INCLUYE:
--    • 5 tablas base (usuarios, proyectos, error_logs, etapa_stats,
--      observaciones_tribunal)
--    • 4 tablas adicionales (ai_provider_keys, ai_service_configs,
--      cuadernillos_estudiante, observaciones_banco)
--    • Columnas extra de PDF compilado en proyectos
--    • RLS habilitado en todas
--    • Triggers de updated_at automático
--    • Seed data mínima (etapa_stats)
--
--  ⚠️  REEMPLAZA a los 8 archivos sueltos:
--      supabase_schema.sql        (v1 - obsoleto, NO usar)
--      supabase_v4_schema.sql     (v4 - obsoleto, NO usar)
--      supabase_v5_migration.sql  (v5 - obsoleto, NO usar)
--      supabase_monografias.sql   (v2 legacy - NO usar)
--      supabase_ai_config_migration.sql        ← INCLUIDO aquí
--      supabase_cuadernillos_migration.sql     ← INCLUIDO aquí
--      supabase_observaciones_banco_migration.sql ← INCLUIDO aquí
--      supabase_pdf_compilado_migration.sql    ← INCLUIDO aquí
-- ════════════════════════════════════════════════════════════════════════════

-- ── Extensiones necesarias ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: trigger genérico para mantener updated_at ───────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════════════════════
-- PARTE 1 — Schema base (5 tablas)
-- ════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: usuarios
--   Perfil del estudiante / admin. Vinculado a auth.users vía id = uid()::text.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  picture         TEXT,
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'demo')),
  plan            TEXT CHECK (plan IN ('estandar', 'pro')),
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at    TIMESTAMPTZ
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_own_read" ON usuarios;
CREATE POLICY "usuarios_own_read" ON usuarios
  FOR SELECT USING (id = auth.uid()::text);

DROP POLICY IF EXISTS "usuarios_service_role_all" ON usuarios;
CREATE POLICY "usuarios_service_role_all" ON usuarios
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: proyectos
--   Tabla principal del workspace. Contiene monografías Scribe Y planes
--   de negocio Proyecto-de-Grado (diferenciados por tipo_proyecto_id).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyectos (
  id                        TEXT PRIMARY KEY,
  usuario_id                TEXT NOT NULL,
  servicio_id               TEXT NOT NULL DEFAULT 'mono-001',
  tipo_proyecto_id          TEXT,
  universidad_id            TEXT,
  tema_aprobado             TEXT,
  titulo_provisional        TEXT,
  estado_fase               INTEGER NOT NULL DEFAULT 0,
  completado                BOOLEAN NOT NULL DEFAULT FALSE,
  oculto_por_usuario        BOOLEAN NOT NULL DEFAULT FALSE,
  modalidad_creacion        TEXT DEFAULT 'directa' CHECK (modalidad_creacion IN ('directa', 'guiada')),
  perfil_estilo_usuario     TEXT,
  requiere_actualizacion    JSONB DEFAULT '{}',
  -- Contenido dinámico por phase_id (sistema de 10+ fases: ph-cap0..ph-calidad)
  phase_contents            JSONB DEFAULT '{}',
  -- Contexto académico y memoria IA
  academic_context          JSONB DEFAULT '{}',
  academic_memory           JSONB DEFAULT '{}',
  -- Documento final compilado
  final_document            TEXT,
  final_document_validation JSONB DEFAULT '{}',
  -- PDF compilado manualmente por admin (flujo TeXstudio/MiKTeX)
  pdf_solicitado_at         TIMESTAMPTZ,
  pdf_compilado_at          TIMESTAMPTZ,
  pdf_compilado_base64      TEXT,
  pdf_compilado_filename    TEXT,
  pdf_compilado_bytes       INTEGER,
  pdf_compilado_por         TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migraciones aditivas por si la tabla ya existía (idempotencia real):
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS pdf_solicitado_at      TIMESTAMPTZ;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS pdf_compilado_at       TIMESTAMPTZ;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS pdf_compilado_base64   TEXT;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS pdf_compilado_filename TEXT;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS pdf_compilado_bytes    INTEGER;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS pdf_compilado_por      TEXT;

CREATE INDEX IF NOT EXISTS proyectos_usuario_idx ON proyectos (usuario_id);
CREATE INDEX IF NOT EXISTS proyectos_updated_idx ON proyectos (updated_at DESC);
CREATE INDEX IF NOT EXISTS proyectos_pdf_solicitado_idx
  ON proyectos (pdf_solicitado_at DESC NULLS LAST)
  WHERE pdf_solicitado_at IS NOT NULL AND pdf_compilado_at IS NULL;

DROP TRIGGER IF EXISTS proyectos_updated_at ON proyectos;
CREATE TRIGGER proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proyectos_own" ON proyectos;
CREATE POLICY "proyectos_own" ON proyectos
  FOR ALL USING (usuario_id = auth.uid()::text);

DROP POLICY IF EXISTS "proyectos_service_all" ON proyectos;
CREATE POLICY "proyectos_service_all" ON proyectos
  USING (true)
  WITH CHECK (true);

COMMENT ON COLUMN proyectos.pdf_solicitado_at IS
  'Cuándo el estudiante solicitó la compilación del PDF. NULL = no ha solicitado.';
COMMENT ON COLUMN proyectos.pdf_compilado_at IS
  'Cuándo el admin subió el PDF compilado. NULL = aún no está listo.';
COMMENT ON COLUMN proyectos.pdf_compilado_base64 IS
  'Contenido del PDF en base64. Se descarga a demanda.';
COMMENT ON COLUMN proyectos.pdf_compilado_por IS
  'Email del admin que subió el PDF (auditoría).';


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: error_logs
--   Logs de errores de generación IA / sistema. Visible en /admin/logs.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nivel        TEXT NOT NULL CHECK (nivel IN ('critical', 'warning', 'info')),
  etapa        TEXT,
  proyecto_id  TEXT,
  service_id   TEXT,
  mensaje      TEXT NOT NULL,
  detalle      TEXT
);

CREATE INDEX IF NOT EXISTS error_logs_timestamp_idx ON error_logs (timestamp DESC);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
-- Solo el service-role escribe logs. Sin policies de usuario.


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: etapa_stats
--   Estadísticas de uso por etapa (Cap.0-3). Para /admin/estadisticas.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etapa_stats (
  etapa               INTEGER PRIMARY KEY,
  uso_total           INTEGER NOT NULL DEFAULT 0,
  uso_este_mes        INTEGER NOT NULL DEFAULT 0,
  mes_actual          TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM'),
  tiempo_promedio_ms  INTEGER NOT NULL DEFAULT 0,
  tiempos_ms          INTEGER[] DEFAULT '{}',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed inicial para las 4 etapas (idempotente)
INSERT INTO etapa_stats (etapa, mes_actual)
VALUES (0, TO_CHAR(NOW(), 'YYYY-MM')),
       (1, TO_CHAR(NOW(), 'YYYY-MM')),
       (2, TO_CHAR(NOW(), 'YYYY-MM')),
       (3, TO_CHAR(NOW(), 'YYYY-MM'))
ON CONFLICT (etapa) DO NOTHING;

ALTER TABLE etapa_stats ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLA: observaciones_tribunal
--   Observaciones del tribunal/tutor sobre cada fase del documento.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS observaciones_tribunal (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  proyecto_id     TEXT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  fase_id         TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('A', 'B', 'C')),
  -- A: corrección menor / B: corrección sustancial / C: aprobado
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  resuelta        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS obs_tribunal_proyecto_idx ON observaciones_tribunal (proyecto_id);

DROP TRIGGER IF EXISTS obs_tribunal_updated_at ON observaciones_tribunal;
CREATE TRIGGER obs_tribunal_updated_at
  BEFORE UPDATE ON observaciones_tribunal
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE observaciones_tribunal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "obs_own" ON observaciones_tribunal;
CREATE POLICY "obs_own" ON observaciones_tribunal
  FOR ALL USING (
    proyecto_id IN (SELECT id FROM proyectos WHERE usuario_id = auth.uid()::text)
  );


-- ════════════════════════════════════════════════════════════════════════════
-- PARTE 2 — Persistencia de aiConfig (sobrevive Vercel serverless)
--   El admin guarda API keys + asignación de modelo por servicio.
--   En .store/data.json se perdían entre invocaciones serverless de Vercel.
--   Ahora viven acá.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_provider_keys (
  provider_id TEXT PRIMARY KEY,
  api_key     TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_service_configs (
  servicio_id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  model       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_service_configs_provider_idx
  ON ai_service_configs (provider_id);

ALTER TABLE ai_provider_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_service_configs ENABLE ROW LEVEL SECURITY;
-- (Sin policies = solo service-role accede. Admin del SaaS usa SUPABASE_SERVICE_ROLE_KEY.)

COMMENT ON TABLE ai_provider_keys IS
  'API keys de cada proveedor de IA (Groq, OpenAI, Gemini, etc.) guardadas desde /admin/modelos.';
COMMENT ON TABLE ai_service_configs IS
  'Asignación de qué proveedor + modelo usa cada servicio (mono-001, tesis-001, etc.).';


-- ════════════════════════════════════════════════════════════════════════════
-- PARTE 3 — Cuadernillos del estudiante
--   Hoja de ruta personal por capítulo: sugerencias, datos a buscar, etc.
--   Es PRIVADO al estudiante (no se entrega al tutor).
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cuadernillos_estudiante (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id                 TEXT NOT NULL,
  fase_id                     TEXT NOT NULL,
  fase_label                  TEXT NOT NULL,

  -- Contenido del cuadernillo
  resumen_capitulo            TEXT,
  limitaciones_ia             JSONB DEFAULT '[]'::jsonb,
  sugerencias_fortalecimiento JSONB DEFAULT '[]'::jsonb,
  datos_a_buscar              JSONB DEFAULT '[]'::jsonb,
  preguntas_tutor_probables   JSONB DEFAULT '[]'::jsonb,
  errores_comunes_evitar      JSONB DEFAULT '[]'::jsonb,
  tips_presentacion_oral      JSONB DEFAULT '[]'::jsonb,

  -- Trazabilidad
  modelo_ia_usado             TEXT,
  duracion_ms                 INTEGER,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un cuadernillo por fase (se reemplaza al regenerar)
  UNIQUE (proyecto_id, fase_id)
);

CREATE INDEX IF NOT EXISTS cuadernillos_estudiante_proyecto_idx
  ON cuadernillos_estudiante (proyecto_id, created_at DESC);

ALTER TABLE cuadernillos_estudiante ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE cuadernillos_estudiante IS
  'Cuadernillo personal del estudiante por capítulo. Hoja de ruta privada con sugerencias y tips de defensa. NO se entrega al tutor.';


-- ════════════════════════════════════════════════════════════════════════════
-- PARTE 4 — Banco de observaciones (análisis de pertinencia)
--   Cada observación del tutor pasa por análisis IA antes de aplicarse:
--   APLICAR | APLICAR_CON_RESERVA | RECHAZAR.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS observaciones_banco (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id              TEXT NOT NULL,
  fase_id                  TEXT NOT NULL,
  servicio_id              TEXT,

  -- Observación del tutor
  observacion_textual      TEXT NOT NULL,
  patron_detectado         TEXT,

  -- Análisis IA
  decision                 TEXT NOT NULL CHECK (decision IN (
    'aplicar', 'aplicar_con_reserva', 'rechazar'
  )),
  analisis_ia              TEXT NOT NULL,
  justificacion_para_tutor TEXT,

  -- Cambio aplicado
  contenido_antes          TEXT,
  contenido_despues        TEXT,
  aplicado_at              TIMESTAMPTZ,

  -- Trazabilidad
  modelo_ia_usado          TEXT,
  duracion_analisis_ms     INTEGER,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS observaciones_banco_proyecto_idx
  ON observaciones_banco (proyecto_id, created_at DESC);

CREATE INDEX IF NOT EXISTS observaciones_banco_patron_idx
  ON observaciones_banco (patron_detectado)
  WHERE patron_detectado IS NOT NULL;

CREATE INDEX IF NOT EXISTS observaciones_banco_decision_idx
  ON observaciones_banco (decision);

ALTER TABLE observaciones_banco ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE observaciones_banco IS
  'Banco acumulado de observaciones de tutores analizadas por IA. Cada fila tiene el veredicto (aplicar/rechazar/con reserva) y la justificación para defender ante el tutor.';

COMMENT ON COLUMN observaciones_banco.decision IS
  'aplicar: pertinente / aplicar_con_reserva: pertinente con caveat / rechazar: con justificación defendible';


-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN — debería listar las 9 tablas creadas
-- ════════════════════════════════════════════════════════════════════════════
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'usuarios', 'proyectos', 'error_logs', 'etapa_stats', 'observaciones_tribunal',
    'ai_provider_keys', 'ai_service_configs', 'cuadernillos_estudiante', 'observaciones_banco'
  )
ORDER BY table_name;

-- ✅ Si ves 9 filas, todo OK. Ya podés conectar la app a Supabase pegando
--    NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y
--    SUPABASE_SERVICE_ROLE_KEY en .env.local (y en Vercel para producción).
