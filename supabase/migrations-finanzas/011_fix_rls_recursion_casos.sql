-- ============================================================================
-- FIX: las políticas RLS añadidas en migración 009 hacían EXISTS sobre
-- finanzas_cursos/finanzas_inscripciones directamente, lo que disparaba recursión o latencia
-- al cargar /construir-proyecto.
--
-- Solución: reemplazar EXISTS por las funciones SECURITY DEFINER ya creadas
-- en la migración 003 (finanzas_es_docente_del_curso, esta_inscrito_en_curso).
-- ============================================================================

-- ─── PROYECTOS — política del estudiante para leer casos del curso ─────────
DROP POLICY IF EXISTS "proyectos_estudiante_lee_caso_curso" ON finanzas_proyectos;

CREATE POLICY "proyectos_estudiante_lee_caso_curso"
  ON finanzas_proyectos FOR SELECT
  TO authenticated
  USING (
    tipo = 'caso_curso'
    AND curso_id IS NOT NULL
    AND public.esta_inscrito_en_curso(curso_id)
  );

-- ─── ENTREGAS — políticas del docente (eliminar EXISTS recursivo) ──────────
DROP POLICY IF EXISTS "entregas_docente_lee_curso" ON finanzas_entregas;
DROP POLICY IF EXISTS "entregas_docente_revisa" ON finanzas_entregas;

CREATE POLICY "entregas_docente_lee_curso"
  ON finanzas_entregas FOR SELECT
  TO authenticated
  USING (public.finanzas_es_docente_del_curso(curso_id));

CREATE POLICY "entregas_docente_revisa"
  ON finanzas_entregas FOR UPDATE
  TO authenticated
  USING (public.finanzas_es_docente_del_curso(curso_id))
  WITH CHECK (public.finanzas_es_docente_del_curso(curso_id));
