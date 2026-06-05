-- ============================================================================
-- FIX: el docente debe poder leer las finanzas_simulaciones de los finanzas_proyectos de sus
-- estudiantes inscritos (para mostrar el ranking en vivo).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.es_simulacion_de_mi_curso(sim_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM finanzas_proyectos p
    JOIN finanzas_cursos c ON c.id = p.curso_id
    WHERE p.id = sim_proyecto_id
      AND c.docente_id = auth.uid()
  );
$$;

CREATE POLICY "simulaciones_docente_lee"
  ON finanzas_simulaciones FOR SELECT
  TO authenticated
  USING (public.es_simulacion_de_mi_curso(proyecto_id));
