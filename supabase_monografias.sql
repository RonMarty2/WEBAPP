-- ============================================================
-- SISTEMA DE MONOGRAFÍAS — Schema Supabase v2.1
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- IMPORTANTE: Ejecuta DESPUÉS de supabase_schema.sql
-- ============================================================

-- Tabla principal de monografías
CREATE TABLE IF NOT EXISTS monografias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  titulo TEXT NOT NULL DEFAULT 'Sin título',
  diplomado TEXT,
  tema TEXT,
  status VARCHAR(50) DEFAULT 'tema',
  -- status: 'tema' | 'cap1' | 'cap2' | 'cap3' | 'final' | 'completa'
  etapa_actual INT DEFAULT 0,
  datos_base JSONB DEFAULT '{}',
  -- {diplomado, temas_abordados, area_interes, contexto_geografico, trabajas_en}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capítulos por etapa
CREATE TABLE IF NOT EXISTS capitulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monografia_id UUID REFERENCES monografias(id) ON DELETE CASCADE,
  numero INT NOT NULL,
  -- 0=tema, 1=cap1, 2=cap2, 3=caps345
  contenido TEXT,
  contenido_json JSONB,
  latex_source TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  -- 'draft' | 'revision' | 'approved'
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(monografia_id, numero)
);

-- Registro de citas bibliográficas
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monografia_id UUID REFERENCES monografias(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  ano INT,
  titulo_obra TEXT NOT NULL,
  fuente TEXT,
  tipo VARCHAR(50) DEFAULT 'libro',
  -- 'libro' | 'paper' | 'tesis' | 'web' | 'documento_usuario'
  formato_apa TEXT,
  capitulo INT,
  usado_en_parrafo TEXT,
  es_consultado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos subidos por el usuario
CREATE TABLE IF NOT EXISTS documentos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monografia_id UUID REFERENCES monografias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo VARCHAR(50),
  contenido_extraido TEXT,
  capitulo_asignado INT,
  es_relevante BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Índices para mejor performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_monografias_user ON monografias(user_id);
CREATE INDEX IF NOT EXISTS idx_capitulos_monografia ON capitulos(monografia_id);
CREATE INDEX IF NOT EXISTS idx_citas_monografia ON citas(monografia_id);
CREATE INDEX IF NOT EXISTS idx_documentos_monografia ON documentos_usuario(monografia_id);

-- ============================================================
-- Función: actualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_monografia_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS monografias_updated_at ON monografias;
CREATE TRIGGER monografias_updated_at
  BEFORE UPDATE ON monografias
  FOR EACH ROW EXECUTE FUNCTION update_monografia_updated_at();

DROP TRIGGER IF EXISTS capitulos_updated_at ON capitulos;
CREATE TRIGGER capitulos_updated_at
  BEFORE UPDATE ON capitulos
  FOR EACH ROW EXECUTE FUNCTION update_monografia_updated_at();
