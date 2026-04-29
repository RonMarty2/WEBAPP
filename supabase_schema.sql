-- ============================================================
-- LABORATORIO ACADÉMICO — Schema Supabase
-- Ejecuta este SQL en tu dashboard de Supabase > SQL Editor
-- ============================================================

-- 1. Universidades y sus formatos
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  format JSONB NOT NULL DEFAULT '{
    "font": "Times New Roman",
    "size": 12,
    "lineHeight": 1.5,
    "margins": {"top": 3, "left": 3, "bottom": 2.5, "right": 2.5}
  }',
  modalities TEXT[] DEFAULT ARRAY['Tesis de Grado', 'Monografía', 'Proyecto de Grado'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Prompts maestros por sección
CREATE TABLE IF NOT EXISTS master_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  section_label TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  user_template TEXT NOT NULL,
  model_demo TEXT DEFAULT 'llama-3.3-70b-versatile',
  model_standard TEXT DEFAULT 'llama-3.3-70b-versatile',
  model_pro TEXT DEFAULT 'llama-3.3-70b-versatile',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. API Keys de proveedores
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,  -- 'groq', 'openai', 'anthropic'
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Perfil extendido de usuarios
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'demo',
  credits_remaining INTEGER DEFAULT 10,
  university_id UUID REFERENCES universities(id),
  modality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Documentos guardados
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  university_id UUID REFERENCES universities(id),
  modality TEXT,
  programa TEXT,
  modulos TEXT,
  current_step INTEGER DEFAULT 0,
  sections JSONB DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_prompts ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- Anyone can read active universities
CREATE POLICY "Public read universities" ON universities
  FOR SELECT USING (is_active = true);

-- Anyone can read prompts (needed for generation)
CREATE POLICY "Public read prompts" ON master_prompts
  FOR SELECT USING (true);

-- ============================================================
-- RPC: Deduct credits atomically
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_credit(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  remaining INTEGER;
BEGIN
  UPDATE user_profiles
  SET credits_remaining = GREATEST(0, credits_remaining - p_amount),
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits_remaining INTO remaining;

  RETURN remaining;
END;
$$;

-- ============================================================
-- Seed data: Universidades por defecto
-- ============================================================
INSERT INTO universities (name, format, modalities) VALUES
(
  'Universidad Mayor de San Simón (UMSS)',
  '{"font": "Times New Roman", "size": 12, "lineHeight": 1.5, "margins": {"top": 3, "left": 3, "bottom": 2.5, "right": 2.5}}',
  ARRAY['Tesis de Grado', 'Monografía', 'Proyecto de Grado', 'Trabajo Dirigido']
),
(
  'Universidad Mayor de San Andrés (UMSA)',
  '{"font": "Times New Roman", "size": 12, "lineHeight": 1.5, "margins": {"top": 3, "left": 3, "bottom": 2.5, "right": 2.5}}',
  ARRAY['Tesis de Grado', 'Monografía', 'Proyecto de Grado']
)
ON CONFLICT DO NOTHING;
