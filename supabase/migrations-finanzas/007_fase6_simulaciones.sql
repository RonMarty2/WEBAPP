-- ============================================================================
-- FASE 6 — Tablas para el motor de simulación
-- finanzas_simulaciones: el estado actual de la simulación de un proyecto
-- finanzas_turnos_historial: log de cada turno (qué evento, qué decisión, antes/después)
-- ============================================================================

CREATE TABLE finanzas_simulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES finanzas_proyectos(id) ON DELETE CASCADE,
  turno_actual INTEGER DEFAULT 0,
  turnos_totales INTEGER NOT NULL,
  frecuencia TEXT NOT NULL CHECK (frecuencia IN ('mensual', 'trimestral', 'semestral')),
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada', 'quebrada')),
  estado_actual JSONB NOT NULL,
  iniciada_en TIMESTAMPTZ DEFAULT NOW(),
  finalizada_en TIMESTAMPTZ
);

CREATE INDEX idx_simulaciones_proyecto ON finanzas_simulaciones(proyecto_id);
CREATE INDEX idx_simulaciones_estado ON finanzas_simulaciones(estado);

CREATE TABLE finanzas_turnos_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulacion_id UUID NOT NULL REFERENCES finanzas_simulaciones(id) ON DELETE CASCADE,
  numero_turno INTEGER NOT NULL,
  estado_antes JSONB NOT NULL,
  eventos_aplicados JSONB NOT NULL,
  decision_tomada JSONB,
  estado_despues JSONB NOT NULL,
  procesado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (simulacion_id, numero_turno)
);

CREATE INDEX idx_turnos_simulacion ON finanzas_turnos_historial(simulacion_id);

-- ============================================================================
-- Helper para evitar recursión en RLS: ¿el proyecto pertenece a auth.uid()?
-- ============================================================================
CREATE OR REPLACE FUNCTION public.es_mi_proyecto(proyecto_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM finanzas_proyectos
    WHERE id = proyecto_uuid AND estudiante_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.es_mi_simulacion(sim_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM finanzas_simulaciones s
    JOIN finanzas_proyectos p ON p.id = s.proyecto_id
    WHERE s.id = sim_uuid AND p.estudiante_id = auth.uid()
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE finanzas_simulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_turnos_historial ENABLE ROW LEVEL SECURITY;

-- Estudiante: CRUD completo sobre finanzas_simulaciones de sus finanzas_proyectos
CREATE POLICY "simulaciones_estudiante_propio"
  ON finanzas_simulaciones FOR ALL
  TO authenticated
  USING (public.es_mi_proyecto(proyecto_id))
  WITH CHECK (public.es_mi_proyecto(proyecto_id));

-- Estudiante: CRUD turnos historial de sus finanzas_simulaciones
CREATE POLICY "turnos_estudiante_propio"
  ON finanzas_turnos_historial FOR ALL
  TO authenticated
  USING (public.es_mi_simulacion(simulacion_id))
  WITH CHECK (public.es_mi_simulacion(simulacion_id));
