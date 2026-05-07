-- ============================================================
--  Laboratorio Académico SaaS — Schema Supabase
--  Pegar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Función helper: actualiza updated_at automáticamente ──
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────
-- TABLA: usuarios
-- ─────────────────────────────────────────────────────────────
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

CREATE POLICY "usuarios_own_read" ON usuarios
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "usuarios_service_role_all" ON usuarios
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- TABLA: proyectos
-- Tabla principal del workspace — reemplaza proyectos_fases
-- ─────────────────────────────────────────────────────────────
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
  -- Contenido de fases (texto plano / markdown / LaTeX)
  contenido_fase_0          TEXT,
  contenido_fase_1          TEXT,
  contenido_fase_2          TEXT,
  contenido_fase_3          TEXT,
  contenido_fase_4          TEXT,
  contenido_fase_5          TEXT,
  -- Contenido dinámico por phase_id
  phase_contents            JSONB DEFAULT '{}',
  -- Contexto académico y memoria IA
  academic_context          JSONB DEFAULT '{}',
  academic_memory           JSONB DEFAULT '{}',
  -- Documento final compilado
  final_document            TEXT,
  final_document_validation JSONB DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS proyectos_usuario_idx ON proyectos (usuario_id);
CREATE INDEX IF NOT EXISTS proyectos_updated_idx ON proyectos (updated_at DESC);

CREATE TRIGGER proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve solo sus proyectos
CREATE POLICY "proyectos_own" ON proyectos
  FOR ALL USING (usuario_id = auth.uid()::text);

-- Service role (API del servidor) puede todo
CREATE POLICY "proyectos_service_all" ON proyectos
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- TABLA: error_logs
-- ─────────────────────────────────────────────────────────────
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
-- Solo el servicio escribe logs (no hay políticas de usuario)

-- ─────────────────────────────────────────────────────────────
-- TABLA: etapa_stats
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etapa_stats (
  etapa               INTEGER PRIMARY KEY,
  uso_total           INTEGER NOT NULL DEFAULT 0,
  uso_este_mes        INTEGER NOT NULL DEFAULT 0,
  mes_actual          TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM'),
  tiempo_promedio_ms  INTEGER NOT NULL DEFAULT 0,
  tiempos_ms          INTEGER[] DEFAULT '{}',
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed inicial para las 4 etapas
INSERT INTO etapa_stats (etapa, mes_actual)
VALUES (0, TO_CHAR(NOW(), 'YYYY-MM')),
       (1, TO_CHAR(NOW(), 'YYYY-MM')),
       (2, TO_CHAR(NOW(), 'YYYY-MM')),
       (3, TO_CHAR(NOW(), 'YYYY-MM'))
ON CONFLICT (etapa) DO NOTHING;

ALTER TABLE etapa_stats ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- TABLA: observaciones_tribunal
-- (Phase 6 — Tribunal Observations System — listo para cuando llegue)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS observaciones_tribunal (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  proyecto_id     TEXT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  fase_id         TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('A', 'B', 'C')),
  -- A: corrección menor  B: corrección sustancial  C: aprobado
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  resuelta        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS obs_tribunal_proyecto_idx ON observaciones_tribunal (proyecto_id);

CREATE TRIGGER obs_tribunal_updated_at
  BEFORE UPDATE ON observaciones_tribunal
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE observaciones_tribunal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obs_own" ON observaciones_tribunal
  FOR ALL USING (
    proyecto_id IN (SELECT id FROM proyectos WHERE usuario_id = auth.uid()::text)
  );

-- ─────────────────────────────────────────────────────────────
-- Verificar tablas creadas
-- ─────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
