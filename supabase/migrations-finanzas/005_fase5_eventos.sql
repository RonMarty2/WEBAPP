-- ============================================================================
-- FASE 5 — Base de finanzas_eventos económicos bolivianos
-- Tabla que contiene los 50 finanzas_eventos curados que el motor de simulación
-- (FASE 6) inyectará turno a turno en cada proyecto del estudiante.
-- ============================================================================

CREATE TABLE finanzas_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('curado', 'automatico')),
  probabilidad REAL NOT NULL CHECK (probabilidad BETWEEN 0 AND 1),
  turno_minimo INTEGER DEFAULT 1,
  sectores_afectados TEXT[] DEFAULT ARRAY['todos'],
  modificadores JSONB NOT NULL,
  opciones_decision JSONB NOT NULL,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eventos_categoria ON finanzas_eventos(categoria);
CREATE INDEX idx_eventos_activo ON finanzas_eventos(activo);

-- ============================================================================
-- RLS: cualquier usuario autenticado puede leer finanzas_eventos (los necesita la UI
-- y el motor de simulación). Solo administradores pueden modificarlos, pero
-- por ahora no hay rol admin: dejamos solo SELECT a usuarios autenticados.
-- ============================================================================
ALTER TABLE finanzas_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eventos_lectura_publica"
  ON finanzas_eventos FOR SELECT
  TO authenticated
  USING (activo = true);
