-- ============================================================================
-- FASE 15 — Proyecto grupal LIDERADO POR EL ESTUDIANTE
--
-- Cambio de modelo: en vez de que el docente cree cada grupo a mano, el docente
-- HABILITA el proyecto grupal del curso definiendo el formato (modelo de ingreso
-- + versión) y el cupo máximo por grupo. Luego cualquier estudiante inscrito
-- CREA un grupo (se vuelve el primer integrante) y los demás se UNEN hasta el
-- cupo. Cada grupo tiene su propio proyecto compartido (de propiedad del
-- estudiante que lo crea; lo editan todos los integrantes).
-- ============================================================================

-- ─── 1. Config de la actividad grupal en el curso ──────────────────────────
ALTER TABLE finanzas_cursos
  ADD COLUMN grupo_habilitado BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN grupo_cupo_max INT NOT NULL DEFAULT 4 CHECK (grupo_cupo_max BETWEEN 1 AND 50),
  ADD COLUMN grupo_modelo TEXT NOT NULL DEFAULT 'unidades',
  ADD COLUMN grupo_version TEXT NOT NULL DEFAULT 'v2',
  ADD COLUMN grupo_consigna TEXT NULL;

COMMENT ON COLUMN finanzas_cursos.grupo_habilitado IS
  'Si TRUE, los estudiantes del curso pueden crear finanzas_grupos y trabajar un proyecto grupal.';
COMMENT ON COLUMN finanzas_cursos.grupo_consigna IS
  'Tema/consigna del proyecto grupal que define el docente (texto libre).';

-- ─── 2. RLS: el estudiante inscrito puede CREAR un grupo (si está habilitado) ─
-- (Los estudiantes NO reciben UPDATE/DELETE sobre finanzas_grupos: la nota y el borrado
--  los maneja el docente. Por eso no se actualiza finanzas_grupos.proyecto_id desde el
--  cliente del estudiante; el proyecto del grupo se resuelve por finanzas_proyectos.grupo_id.)
CREATE POLICY "grupos_estudiante_crea"
  ON finanzas_grupos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM finanzas_cursos c
      JOIN finanzas_inscripciones i ON i.curso_id = c.id
      WHERE c.id = finanzas_grupos.curso_id
        AND i.estudiante_id = auth.uid()
        AND c.grupo_habilitado = TRUE
    )
  );

-- ─── 3. RLS: el docente del curso puede EDITAR el proyecto grupal ───────────
-- (Para poder abrirlo/ajustar la consigna o evaluarlo sin que falle el guardado.
--  Los finanzas_proyectos grupales ahora son de propiedad del estudiante creador.)
CREATE POLICY "proyectos_docente_grupo_edita"
  ON finanzas_proyectos FOR UPDATE
  TO authenticated
  USING (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM finanzas_grupos g
      JOIN finanzas_cursos c ON c.id = g.curso_id
      WHERE g.id = finanzas_proyectos.grupo_id AND c.docente_id = auth.uid()
    )
  )
  WITH CHECK (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM finanzas_grupos g
      JOIN finanzas_cursos c ON c.id = g.curso_id
      WHERE g.id = finanzas_proyectos.grupo_id AND c.docente_id = auth.uid()
    )
  );
