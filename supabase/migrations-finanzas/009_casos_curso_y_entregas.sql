-- ============================================================================
-- FASE 9 — Casos del curso (plantillas del docente) + Entregas con historial
--
-- El docente puede convertir un proyecto suyo en un CASO DEL CURSO.
-- Los estudiantes inscritos en el curso pueden tomar una COPIA del caso
-- ("entrega_estudiante"), trabajarla, y entregarla para revisión.
-- Cada entrega genera una fila en `finanzas_entregas`; varias finanzas_entregas por proyecto
-- son posibles (reintentos). La nota final del estudiante es el promedio
-- de las notas de sus finanzas_entregas revisadas.
-- ============================================================================

-- ─── 1. Nuevos campos en `finanzas_proyectos` ───────────────────────────────────────
-- tipo:
--   'libre'              = proyecto creado libremente por un estudiante (legacy)
--   'caso_curso'         = plantilla del docente (no se simula, sirve de molde y referencia)
--   'entrega_estudiante' = copia del caso que un estudiante está trabajando
-- caso_origen_id: si tipo='entrega_estudiante', apunta al proyecto del docente del que clonó
-- paso_inicio_estudiante: 1..9 — desde qué paso el estudiante debe completar.
--                        Pasos < paso_inicio llegan con datos del docente.
--                        Pasos >= paso_inicio llegan vacíos.
--                        Solo aplica si tipo='caso_curso' (se hereda al clonar).

ALTER TABLE finanzas_proyectos
  ADD COLUMN tipo TEXT NOT NULL DEFAULT 'libre'
    CHECK (tipo IN ('libre', 'caso_curso', 'entrega_estudiante')),
  ADD COLUMN caso_origen_id UUID NULL REFERENCES finanzas_proyectos(id) ON DELETE SET NULL,
  ADD COLUMN paso_inicio_estudiante INT NULL
    CHECK (paso_inicio_estudiante IS NULL OR (paso_inicio_estudiante BETWEEN 1 AND 9));

CREATE INDEX idx_proyectos_tipo ON finanzas_proyectos(tipo);
CREATE INDEX idx_proyectos_caso_origen ON finanzas_proyectos(caso_origen_id);

COMMENT ON COLUMN finanzas_proyectos.tipo IS
  'libre = proyecto personal del estudiante. caso_curso = plantilla creada por el docente. entrega_estudiante = copia de un caso_curso tomada por un estudiante.';
COMMENT ON COLUMN finanzas_proyectos.caso_origen_id IS
  'Si tipo=entrega_estudiante, apunta al caso_curso del que clonó. NULL si tipo=libre o caso_curso.';
COMMENT ON COLUMN finanzas_proyectos.paso_inicio_estudiante IS
  'Paso (1..9) desde el cual el estudiante debe completar. Pasos previos llegan con los datos del docente.';

-- ─── 2. Tabla `finanzas_entregas` (historial de revisiones del docente) ─────────────
CREATE TABLE finanzas_entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES finanzas_proyectos(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES finanzas_perfiles(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES finanzas_cursos(id) ON DELETE CASCADE,
  numero_intento INT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aprobada', 'reprobada')),
  -- Snapshot de los datos del proyecto al momento de entregar (para que el
  -- estudiante pueda seguir editando sin que cambien las finanzas_entregas pasadas)
  snapshot_datos JSONB NOT NULL,
  -- Indicadores calculados al momento de entregar (cache para listados)
  van NUMERIC NULL,
  tir NUMERIC NULL,
  wacc NUMERIC NULL,
  payback NUMERIC NULL,
  -- Sugerencia automática del sistema
  sugerencia_automatica TEXT NULL,  -- 'aprobar' | 'reprobar' | 'duda'
  sugerencia_nota INT NULL CHECK (sugerencia_nota IS NULL OR sugerencia_nota BETWEEN 0 AND 100),
  sugerencia_razones JSONB NULL,    -- array de strings con detalles
  -- Decisión final del docente (NULL hasta que revisa)
  nota INT NULL CHECK (nota IS NULL OR nota BETWEEN 0 AND 100),
  comentario_docente TEXT NULL,
  -- Timestamps
  entregado_en TIMESTAMPTZ DEFAULT NOW(),
  revisado_en TIMESTAMPTZ NULL,
  -- Unique constraint: no se puede entregar 2 veces con el mismo número de intento
  UNIQUE(proyecto_id, numero_intento)
);

CREATE INDEX idx_entregas_proyecto ON finanzas_entregas(proyecto_id);
CREATE INDEX idx_entregas_estudiante ON finanzas_entregas(estudiante_id);
CREATE INDEX idx_entregas_curso ON finanzas_entregas(curso_id);
CREATE INDEX idx_entregas_estado ON finanzas_entregas(estado);

COMMENT ON TABLE finanzas_entregas IS
  'Historial de finanzas_entregas de un estudiante. Cada entrega es una "foto" del proyecto en el momento de entregar, con su revisión correspondiente.';
COMMENT ON COLUMN finanzas_entregas.snapshot_datos IS
  'Copia del JSONB de finanzas_proyectos.datos al momento de entregar. Permite que el estudiante siga editando sin afectar finanzas_entregas pasadas.';

-- ─── 3. Vista `promedio_estudiante` ─────────────────────────────────────────
-- Calcula el promedio de notas REVISADAS por estudiante por curso.
-- Solo considera finanzas_entregas que ya fueron revisadas (nota IS NOT NULL).
CREATE VIEW promedio_estudiante AS
SELECT
  estudiante_id,
  curso_id,
  COUNT(*) FILTER (WHERE nota IS NOT NULL) AS entregas_revisadas,
  COUNT(*) FILTER (WHERE estado = 'pendiente') AS entregas_pendientes,
  ROUND(AVG(nota) FILTER (WHERE nota IS NOT NULL), 2) AS promedio_nota,
  MAX(nota) FILTER (WHERE nota IS NOT NULL) AS mejor_nota,
  MIN(nota) FILTER (WHERE nota IS NOT NULL) AS peor_nota,
  MAX(entregado_en) AS ultima_entrega_en
FROM finanzas_entregas
GROUP BY estudiante_id, curso_id;

COMMENT ON VIEW promedio_estudiante IS
  'Promedio acumulado de notas por estudiante por curso. Una entrega pendiente no afecta el promedio hasta ser revisada.';

-- ─── 4. RLS sobre `finanzas_entregas` ───────────────────────────────────────────────
ALTER TABLE finanzas_entregas ENABLE ROW LEVEL SECURITY;

-- Estudiante: ve y crea sus propias finanzas_entregas. No puede modificar ni borrar
-- (solo el docente revisa).
CREATE POLICY "entregas_estudiante_lee_propio"
  ON finanzas_entregas FOR SELECT
  TO authenticated
  USING (estudiante_id = auth.uid());

CREATE POLICY "entregas_estudiante_inserta_propio"
  ON finanzas_entregas FOR INSERT
  TO authenticated
  WITH CHECK (estudiante_id = auth.uid());

-- Docente del curso: ve y actualiza (revisar) las finanzas_entregas de sus estudiantes.
CREATE POLICY "entregas_docente_lee_curso"
  ON finanzas_entregas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_cursos
      WHERE finanzas_cursos.id = finanzas_entregas.curso_id
        AND finanzas_cursos.docente_id = auth.uid()
    )
  );

CREATE POLICY "entregas_docente_revisa"
  ON finanzas_entregas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_cursos
      WHERE finanzas_cursos.id = finanzas_entregas.curso_id
        AND finanzas_cursos.docente_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM finanzas_cursos
      WHERE finanzas_cursos.id = finanzas_entregas.curso_id
        AND finanzas_cursos.docente_id = auth.uid()
    )
  );

-- ─── 5. RLS sobre `finanzas_proyectos` — extensión para casos_curso ─────────────────
-- Un estudiante inscrito en un curso debe poder LEER los finanzas_proyectos
-- tipo='caso_curso' de ese curso (para poder tomarlos). La política
-- actual "proyectos_docente_lee_curso" solo cubre docentes.

CREATE POLICY "proyectos_estudiante_lee_caso_curso"
  ON finanzas_proyectos FOR SELECT
  TO authenticated
  USING (
    tipo = 'caso_curso'
    AND EXISTS (
      SELECT 1 FROM finanzas_inscripciones
      WHERE finanzas_inscripciones.curso_id = finanzas_proyectos.curso_id
        AND finanzas_inscripciones.estudiante_id = auth.uid()
    )
  );
