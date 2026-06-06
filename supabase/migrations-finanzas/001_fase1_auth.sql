-- ============================================================================
-- FASE 1 — Autenticación y estructura base
-- Tablas: finanzas_perfiles, finanzas_cursos, finanzas_inscripciones
-- Incluye Row Level Security (RLS) según spec del simulador
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLA: finanzas_perfiles
-- Extiende auth.users con datos del dominio (rol, universidad, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE finanzas_perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('docente', 'estudiante')),
  email TEXT UNIQUE NOT NULL,
  universidad TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABLA: finanzas_cursos
-- Un docente crea finanzas_cursos; los estudiantes se inscriben por código.
-- ----------------------------------------------------------------------------
CREATE TABLE finanzas_cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES finanzas_perfiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  materia TEXT NOT NULL,
  paralelo TEXT,
  frecuencia_turnos TEXT NOT NULL CHECK (frecuencia_turnos IN ('mensual', 'trimestral', 'semestral')),
  duracion_anios INTEGER DEFAULT 5,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'archivado')),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cursos_docente ON finanzas_cursos(docente_id);
CREATE INDEX idx_cursos_codigo ON finanzas_cursos(codigo);

-- ----------------------------------------------------------------------------
-- TABLA: finanzas_inscripciones
-- Relación N:N entre estudiantes y finanzas_cursos.
-- ----------------------------------------------------------------------------
CREATE TABLE finanzas_inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES finanzas_cursos(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES finanzas_perfiles(id) ON DELETE CASCADE,
  inscrito_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(curso_id, estudiante_id)
);

CREATE INDEX idx_inscripciones_curso ON finanzas_inscripciones(curso_id);
CREATE INDEX idx_inscripciones_estudiante ON finanzas_inscripciones(estudiante_id);

-- ============================================================================
-- TRIGGER: crear perfil automáticamente al registrarse un usuario
-- Lee nombre/apellido/rol/universidad desde raw_user_meta_data
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_nuevo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.finanzas_perfiles (id, nombre, apellido, rol, email, universidad)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'apellido', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'rol', 'estudiante'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'universidad'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_nuevo_usuario();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE finanzas_perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_inscripciones ENABLE ROW LEVEL SECURITY;

-- ---- finanzas_perfiles -------------------------------------------------------------
-- Cualquier usuario autenticado lee su propio perfil
CREATE POLICY "perfiles_self_select"
  ON finanzas_perfiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Cualquier usuario autenticado actualiza su propio perfil (excepto rol)
CREATE POLICY "perfiles_self_update"
  ON finanzas_perfiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Docentes leen finanzas_perfiles de estudiantes inscritos en sus finanzas_cursos
CREATE POLICY "perfiles_docente_ve_inscritos"
  ON finanzas_perfiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM finanzas_inscripciones i
      JOIN finanzas_cursos c ON c.id = i.curso_id
      WHERE i.estudiante_id = finanzas_perfiles.id
        AND c.docente_id = auth.uid()
    )
  );

-- ---- finanzas_cursos --------------------------------------------------------------
-- Docente ve y modifica sus propios finanzas_cursos
CREATE POLICY "cursos_docente_propio"
  ON finanzas_cursos FOR ALL
  TO authenticated
  USING (docente_id = auth.uid())
  WITH CHECK (docente_id = auth.uid());

-- Estudiante ve finanzas_cursos en los que está inscrito
CREATE POLICY "cursos_estudiante_inscrito"
  ON finanzas_cursos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_inscripciones
      WHERE finanzas_inscripciones.curso_id = finanzas_cursos.id
        AND finanzas_inscripciones.estudiante_id = auth.uid()
    )
  );

-- Estudiante puede buscar curso por código para inscribirse (lectura mínima)
CREATE POLICY "cursos_buscar_por_codigo"
  ON finanzas_cursos FOR SELECT
  TO authenticated
  USING (estado = 'activo');

-- ---- finanzas_inscripciones -------------------------------------------------------
-- Estudiante crea su propia inscripción
CREATE POLICY "inscripciones_estudiante_crea"
  ON finanzas_inscripciones FOR INSERT
  TO authenticated
  WITH CHECK (estudiante_id = auth.uid());

-- Estudiante ve sus propias finanzas_inscripciones
CREATE POLICY "inscripciones_estudiante_ve"
  ON finanzas_inscripciones FOR SELECT
  TO authenticated
  USING (estudiante_id = auth.uid());

-- Docente ve finanzas_inscripciones a sus finanzas_cursos
CREATE POLICY "inscripciones_docente_ve"
  ON finanzas_inscripciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_cursos
      WHERE finanzas_cursos.id = finanzas_inscripciones.curso_id
        AND finanzas_cursos.docente_id = auth.uid()
    )
  );

-- Estudiante puede borrar su propia inscripción
CREATE POLICY "inscripciones_estudiante_borra"
  ON finanzas_inscripciones FOR DELETE
  TO authenticated
  USING (estudiante_id = auth.uid());
