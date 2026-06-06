-- ===========================================================
-- Migraciones del simuladorPRO con prefijo finanzas_*
-- Aplicar en tu Supabase Dashboard → SQL Editor
-- Tablas creadas: finanzas_perfiles, finanzas_cursos, finanzas_proyectos,
-- finanzas_simulaciones, finanzas_eventos, finanzas_inscripciones, etc.
-- ===========================================================


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 001_fase1_auth.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 002_fase3_proyectos.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 3 — Tabla de finanzas_proyectos
-- El proyecto se guarda completo como JSONB; solo los metadatos viven como
-- columnas SQL para indexar y filtrar.
-- ============================================================================

CREATE TABLE finanzas_proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES finanzas_perfiles(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES finanzas_cursos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  datos JSONB NOT NULL,
  estado TEXT NOT NULL DEFAULT 'construyendo'
    CHECK (estado IN ('construyendo', 'completo', 'simulando', 'finalizado')),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proyectos_estudiante ON finanzas_proyectos(estudiante_id);
CREATE INDEX idx_proyectos_curso ON finanzas_proyectos(curso_id);
CREATE INDEX idx_proyectos_estado ON finanzas_proyectos(estado);

-- Trigger para auto-actualizar actualizado_en en cada UPDATE
CREATE OR REPLACE FUNCTION public.tocar_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proyectos_actualizado_en
  BEFORE UPDATE ON finanzas_proyectos
  FOR EACH ROW EXECUTE FUNCTION public.tocar_actualizado_en();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE finanzas_proyectos ENABLE ROW LEVEL SECURITY;

-- Estudiante: CRUD completo sobre sus propios finanzas_proyectos
CREATE POLICY "proyectos_estudiante_propio"
  ON finanzas_proyectos FOR ALL
  TO authenticated
  USING (estudiante_id = auth.uid())
  WITH CHECK (estudiante_id = auth.uid());

-- Docente: lectura de finanzas_proyectos de estudiantes inscritos en sus finanzas_cursos
CREATE POLICY "proyectos_docente_lee_curso"
  ON finanzas_proyectos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_cursos
      WHERE finanzas_cursos.id = finanzas_proyectos.curso_id
        AND finanzas_cursos.docente_id = auth.uid()
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 003_fix_rls_recursion.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FIX: recursión infinita en políticas RLS de finanzas_perfiles/finanzas_cursos/finanzas_inscripciones
--
-- Causa: las políticas hacían EXISTS sobre otras tablas RLS-protegidas, que
-- a su vez chequeaban otras tablas RLS, formando un ciclo.
--
-- Solución: extraer los EXISTS a funciones SECURITY DEFINER que bypasean RLS
-- al consultar las tablas internamente (el chequeo de seguridad sigue siendo
-- correcto porque cada función usa auth.uid()).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- HELPER 1: ¿auth.uid() es docente del curso `curso_uuid`?
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.finanzas_es_docente_del_curso(curso_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM finanzas_cursos
    WHERE id = curso_uuid AND docente_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- HELPER 2: ¿auth.uid() está inscrito en el curso `curso_uuid`?
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.esta_inscrito_en_curso(curso_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM finanzas_inscripciones
    WHERE curso_id = curso_uuid AND estudiante_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- HELPER 3: ¿`estudiante_uuid` está inscrito en algún curso de auth.uid()?
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.es_mi_estudiante(estudiante_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM finanzas_inscripciones i
    JOIN finanzas_cursos c ON c.id = i.curso_id
    WHERE i.estudiante_id = estudiante_uuid
      AND c.docente_id = auth.uid()
  );
$$;

-- ============================================================================
-- PERFILES — recrear política recursiva
-- ============================================================================
DROP POLICY IF EXISTS "perfiles_docente_ve_inscritos" ON finanzas_perfiles;

CREATE POLICY "perfiles_docente_ve_inscritos"
  ON finanzas_perfiles FOR SELECT
  TO authenticated
  USING (public.es_mi_estudiante(id));

-- ============================================================================
-- CURSOS — recrear política recursiva
-- ============================================================================
DROP POLICY IF EXISTS "cursos_estudiante_inscrito" ON finanzas_cursos;

CREATE POLICY "cursos_estudiante_inscrito"
  ON finanzas_cursos FOR SELECT
  TO authenticated
  USING (public.esta_inscrito_en_curso(id));

-- ============================================================================
-- INSCRIPCIONES — recrear política recursiva
-- ============================================================================
DROP POLICY IF EXISTS "inscripciones_docente_ve" ON finanzas_inscripciones;

CREATE POLICY "inscripciones_docente_ve"
  ON finanzas_inscripciones FOR SELECT
  TO authenticated
  USING (public.finanzas_es_docente_del_curso(curso_id));

-- ============================================================================
-- PROYECTOS — preventivamente reemplazar EXISTS por helper (no daba error
-- todavía pero por consistencia y evitar futuras recursiones)
-- ============================================================================
DROP POLICY IF EXISTS "proyectos_docente_lee_curso" ON finanzas_proyectos;

CREATE POLICY "proyectos_docente_lee_curso"
  ON finanzas_proyectos FOR SELECT
  TO authenticated
  USING (public.finanzas_es_docente_del_curso(curso_id));


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 004_curso_opcional.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- Permitir que un estudiante construya un proyecto sin estar inscrito todavía
-- en un curso (FASE 4 puede ejecutarse antes que el panel del docente de
-- FASE 8). curso_id pasa a ser nullable. La RLS sigue funcionando porque
-- estudiante_id = auth.uid() es el chequeo principal.
-- ============================================================================

ALTER TABLE finanzas_proyectos ALTER COLUMN curso_id DROP NOT NULL;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 005_fase5_eventos.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 006_fase5_eventos_seed.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 5 — Seed: 50 finanzas_eventos económicos bolivianos curados
-- Cada evento incluye titular periodístico, descripción, modificadores
-- a variables del proyecto y 4 opciones de decisión con consecuencias.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- MACROECONÓMICOS (EVT001-EVT010)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT001',
 'Dólar paralelo sube 10% en una semana',
 'El mercado paralelo del dólar se cotiza con prima del 10% sobre el oficial. Importadores reportan que ya no consiguen divisas a precio oficial en el banco.',
 'macroeconomico', 'curado', 0.18, 2, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.10},{"campo":"tasa_dolar_paralelo","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Mantener precios igual y absorber el costo","consecuencias":{"margen":"-3%","caja":"-5%"},"feedback_corto":"Sostienes clientes pero te comes el margen"},
   {"letra":"B","texto":"Subir precios al consumidor +8%","consecuencias":{"precio_venta":"*1.08","demanda":"*0.92"},"feedback_corto":"Salvas margen pero pierdes algo de demanda"},
   {"letra":"C","texto":"Comprar dólares ahora antes de que suba más","consecuencias":{"caja":"-15%","costos_importacion":"*1.0"},"feedback_corto":"Asegura insumos pero deja caja vulnerable"},
   {"letra":"D","texto":"Sustituir insumos importados por locales","consecuencias":{"calidad":"-10%","costos_importacion":"*0.6"},"feedback_corto":"Bajas costo pero clientes pueden notar la diferencia"}
 ]'::jsonb),

('EVT002',
 'Crisis de divisas: dólar paralelo se dispara 25%',
 'El mercado de cambios está en pánico. Casas de cambio cerradas, fila en bancos, el paralelo se cotiza un 25% sobre el oficial. Importadores se quedan sin stock.',
 'macroeconomico', 'curado', 0.08, 8, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.25},{"campo":"deuda_usd","operacion":"multiplicar","valor":1.25},{"campo":"demanda","operacion":"multiplicar","valor":0.90}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir precio 20% para mantener margen","consecuencias":{"precio_venta":"*1.20","demanda":"*0.75"},"feedback_corto":"Margen ok pero pierdes 1 de cada 4 clientes"},
   {"letra":"B","texto":"Pedir préstamo para stock antes que suba más","consecuencias":{"deuda":"+30%","inventario":"+50%"},"feedback_corto":"Te endeudas más pero proteges precio frente a competidores"},
   {"letra":"C","texto":"Cerrar temporalmente y esperar estabilización","consecuencias":{"ingresos":"*0.30","costos_fijos":"*1.0"},"feedback_corto":"Conservas reservas pero pierdes clientes que migran"},
   {"letra":"D","texto":"Buscar proveedores alternativos en mercado local","consecuencias":{"calidad":"-15%","costos_importacion":"*0.5","tiempo_entrega":"+10dias"},"feedback_corto":"Resuelves a corto plazo, riesgo de calidad mediano"}
 ]'::jsonb),

('EVT003',
 'Inflación anual sube a 8.2% según INE',
 'El INE reporta inflación acumulada de 8.2% en 12 meses, la más alta en 15 años. Alimentos y bebidas son los rubros más afectados.',
 'macroeconomico', 'curado', 0.15, 6, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"costos_generales","operacion":"multiplicar","valor":1.08},{"campo":"inflacion_anual","operacion":"setear","valor":0.082}]}'::jsonb,
 '[
   {"letra":"A","texto":"Ajustar precios +8% acompañando inflación","consecuencias":{"precio_venta":"*1.08","margen":"+0%"},"feedback_corto":"Mantienes margen real, demanda se ajusta lento"},
   {"letra":"B","texto":"Subir solo 4% para no espantar clientes","consecuencias":{"precio_venta":"*1.04","margen":"-4%"},"feedback_corto":"Pierdes margen pero retienes clientes"},
   {"letra":"C","texto":"Negociar contratos con proveedores a 6 meses fijo","consecuencias":{"costo_insumos":"*1.0","caja":"-10%"},"feedback_corto":"Te aíslas de la inflación si pagas adelantado"},
   {"letra":"D","texto":"Mantener precio y reducir tamaño/cantidad por unidad","consecuencias":{"precio_venta":"*1.0","cantidad_unidad":"*0.92"},"feedback_corto":"Shrinkflation — funciona si tu cliente no lo nota"}
 ]'::jsonb),

('EVT004',
 'BCB restringe acceso a divisas para importadores',
 'El Banco Central limita la venta de dólares oficiales a un 50% del monto solicitado por cada empresa. Importadores deberán recurrir al mercado paralelo.',
 'macroeconomico', 'curado', 0.12, 4, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"acceso_divisas_oficial","operacion":"multiplicar","valor":0.5},{"campo":"costos_importacion","operacion":"multiplicar","valor":1.18}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pedir 50% al BCB y 50% al paralelo","consecuencias":{"costos_importacion":"*1.09","caja":"-5%"},"feedback_corto":"Promedias costo, sigues operando"},
   {"letra":"B","texto":"Cambiar 100% al paralelo (más rápido)","consecuencias":{"costos_importacion":"*1.18","tiempo_entrega":"-5dias"},"feedback_corto":"Más caro pero ágil"},
   {"letra":"C","texto":"Reducir importaciones, vender solo stock actual","consecuencias":{"inventario":"-40%","ingresos":"*0.85"},"feedback_corto":"Te quedas sin variedad pero conservas caja"},
   {"letra":"D","texto":"Buscar productores locales sustitutos","consecuencias":{"calidad":"-10%","costos_importacion":"*0.7"},"feedback_corto":"Apuesta al \"made in Bolivia\""}
 ]'::jsonb),

('EVT005',
 'Devaluación oficial del boliviano',
 'El BCB ajusta el tipo de cambio oficial de 6.96 a 7.50 Bs/USD. Es la primera devaluación oficial en más de una década.',
 'macroeconomico', 'curado', 0.05, 12, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"tasa_dolar_oficial","operacion":"setear","valor":7.50},{"campo":"costos_importacion","operacion":"multiplicar","valor":1.077},{"campo":"deuda_usd","operacion":"multiplicar","valor":1.077}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir todos los precios 8% inmediatamente","consecuencias":{"precio_venta":"*1.08","demanda":"*0.93"},"feedback_corto":"Te adelantas pero pagas con caída de demanda"},
   {"letra":"B","texto":"Esperar 1 mes y ver qué hace la competencia","consecuencias":{"margen":"-7%","participacion_mercado":"+2%"},"feedback_corto":"Conservas clientes a costa de margen"},
   {"letra":"C","texto":"Pre-pagar la deuda en USD si puedes","consecuencias":{"deuda":"-30%","caja":"-25%"},"feedback_corto":"Liberas balance pero quedas sin liquidez"},
   {"letra":"D","texto":"Renegociar contratos con clientes en USD","consecuencias":{"precio_venta":"*1.05","tiempo_negociacion":"+15dias"},"feedback_corto":"Cobertura cambiaria si te lo aceptan"}
 ]'::jsonb),

('EVT006',
 'Gobierno aumenta Bono Juancito Pinto a Bs 300',
 'El bono escolar Juancito Pinto sube de 200 a 300 Bs, beneficiando a 2.2 millones de estudiantes. Más demanda esperada en colegios y librerías en marzo.',
 'macroeconomico', 'curado', 0.10, 5, ARRAY['comercio', 'servicios', 'mixto'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":1.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Lanzar promoción especial \"vuelta al colegio\"","consecuencias":{"ingresos":"+15%","costo_marketing":"+5000"},"feedback_corto":"Capturas demanda extra con marketing focalizado"},
   {"letra":"B","texto":"Stock anticipado de productos infantiles","consecuencias":{"inventario":"+25%","caja":"-15%"},"feedback_corto":"Te preparas si tu producto encaja con escolares"},
   {"letra":"C","texto":"No hacer nada, no te corresponde","consecuencias":{"ingresos":"+2%"},"feedback_corto":"Algo de derrame general llega igual"},
   {"letra":"D","texto":"Alianza con colegios de la zona","consecuencias":{"ingresos":"+12%","tiempo_dedicado":"+20h"},"feedback_corto":"Inversión en relaciones que rinden a mediano plazo"}
 ]'::jsonb),

('EVT007',
 'Subsidio al combustible se reduce 50%',
 'El gobierno reduce el subsidio a la gasolina y el diésel, lo que implica un aumento del 30% en el precio de la pista. Transporte, agricultura y producción golpeados.',
 'macroeconomico', 'curado', 0.07, 15, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"costo_combustible","operacion":"multiplicar","valor":1.30},{"campo":"costos_logistica","operacion":"multiplicar","valor":1.15}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir precios para cubrir transporte","consecuencias":{"precio_venta":"*1.07","demanda":"*0.95"},"feedback_corto":"Traslado al cliente, leve pérdida de demanda"},
   {"letra":"B","texto":"Cambiar a flota más eficiente o reducir finanzas_entregas","consecuencias":{"costos_logistica":"*0.85","inversion":"+20000"},"feedback_corto":"Inversión que paga a 12 meses"},
   {"letra":"C","texto":"Concentrar finanzas_entregas (rutas más eficientes)","consecuencias":{"costos_logistica":"*0.92","servicio":"-5%"},"feedback_corto":"Tradeoff: bajas costo pero clientes esperan más"},
   {"letra":"D","texto":"Absorber el aumento por ahora","consecuencias":{"margen":"-4%"},"feedback_corto":"Pierdes margen, evalúa cuánto resistes"}
 ]'::jsonb),

('EVT008',
 'Escasez de combustible: filas y racionamiento',
 'YPFB enfrenta problemas de abastecimiento. Surtidores con filas de horas y venta racionada a 20 litros por vehículo. Logística y producción afectadas.',
 'macroeconomico', 'curado', 0.10, 8, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"tiempo_entrega","operacion":"sumar","valor":3},{"campo":"costos_logistica","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Acumular stock de combustible (si tienes tanque)","consecuencias":{"costos_logistica":"*1.0","inversion":"+8000"},"feedback_corto":"Resuelves operativamente, costo upfront"},
   {"letra":"B","texto":"Reducir finanzas_entregas a 3 días/semana","consecuencias":{"ingresos":"*0.85","costos_logistica":"*0.7"},"feedback_corto":"Ahorras costo pero perdés ventas"},
   {"letra":"C","texto":"Subir precio de envío al cliente","consecuencias":{"ingreso_envio":"+25%","demanda":"*0.93"},"feedback_corto":"Cobras el problema al cliente"},
   {"letra":"D","texto":"Alianza con otro negocio para compartir flota","consecuencias":{"costos_logistica":"*0.8","tiempo_negociacion":"+10dias"},"feedback_corto":"Solución colaborativa, beneficio mutuo"}
 ]'::jsonb),

('EVT009',
 'PIB crece 4.7% — corresponde segundo aguinaldo',
 'El INE anuncia crecimiento del PIB del 4.7% en el año fiscal, superando el umbral del 4.5%. Las empresas deben pagar un segundo aguinaldo este diciembre.',
 'macroeconomico', 'curado', 0.05, 11, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"costo_personal_diciembre","operacion":"multiplicar","valor":2.0}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar el doble aguinaldo de la caja","consecuencias":{"caja":"-20%","clima_laboral":"+10%"},"feedback_corto":"Cumples ley, equipo motivado, caja apretada"},
   {"letra":"B","texto":"Pedir préstamo express de 90 días","consecuencias":{"deuda":"+12%","interes_pagado":"+1500"},"feedback_corto":"Financias el extraordinario, costo medio"},
   {"letra":"C","texto":"Reducir personal antes de diciembre","consecuencias":{"costo_personal":"*0.85","reputacion":"-15%","indemnizaciones":"+25000"},"feedback_corto":"Riesgo legal y reputacional alto"},
   {"letra":"D","texto":"Negociar pago fraccionado con empleados","consecuencias":{"caja":"-10%","clima_laboral":"-5%"},"feedback_corto":"Pierdes algo de confianza pero distribuyes carga"}
 ]'::jsonb),

('EVT010',
 'Recesión: PIB cae -1.2% según INE',
 'Tras dos trimestres consecutivos de contracción, Bolivia entra técnicamente en recesión. Caída del consumo en 6%, paralisis en construcción.',
 'macroeconomico', 'curado', 0.06, 18, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.88},{"campo":"morosidad","operacion":"sumar","valor":0.05}]}'::jsonb,
 '[
   {"letra":"A","texto":"Bajar precios 10% para sostener volumen","consecuencias":{"precio_venta":"*0.90","demanda":"*1.08","margen":"-8%"},"feedback_corto":"Compras volumen a costa del margen"},
   {"letra":"B","texto":"Lanzar producto/servicio low-cost","consecuencias":{"ingresos":"+10%","tiempo_lanzamiento":"+30dias"},"feedback_corto":"Apuestas a un nuevo segmento"},
   {"letra":"C","texto":"Recortar todo gasto no esencial","consecuencias":{"costos_generales":"*0.85","ingresos":"*0.96"},"feedback_corto":"Sobrevives pero pierdes potencial de rebote"},
   {"letra":"D","texto":"Mantenerse y esperar el rebote","consecuencias":{"caja":"-10%","margen":"-5%"},"feedback_corto":"Apuesta de paciencia, requiere caja"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- LABORALES Y TRIBUTARIOS (EVT011-EVT015)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT011',
 'Salario mínimo nacional sube 15% por decreto',
 'El gobierno anuncia el incremento salarial. El SMN pasa de Bs 2.500 a Bs 2.875. Aumento retroactivo al 1 de mayo.',
 'laboral', 'curado', 0.10, 5, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"salario_minimo","operacion":"setear","valor":2875},{"campo":"costo_personal","operacion":"multiplicar","valor":1.15}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aplicar el aumento a todo el personal","consecuencias":{"costo_personal":"*1.15","clima_laboral":"+5%"},"feedback_corto":"Cumples ley, equipo motivado"},
   {"letra":"B","texto":"Solo aplicar al personal en SMN, congelar resto","consecuencias":{"costo_personal":"*1.06","clima_laboral":"-10%"},"feedback_corto":"Ahorras pero genera resquemor"},
   {"letra":"C","texto":"Reducir personal y reorganizar tareas","consecuencias":{"costo_personal":"*0.95","servicio":"-10%","indemnizaciones":"+15000"},"feedback_corto":"Recortas, hay riesgo legal y operativo"},
   {"letra":"D","texto":"Cambiar a esquema de comisiones por venta","consecuencias":{"costo_personal":"*1.0","clima_laboral":"-5%","ingresos":"+8%"},"feedback_corto":"Alineas incentivos, no a todos les gustará"}
 ]'::jsonb),

('EVT012',
 'SIN intensifica fiscalización en sector privado',
 'El Servicio de Impuestos Nacionales anuncia operativos sorpresa en zonas comerciales. Multas hasta Bs 100.000 por facturación deficiente.',
 'laboral', 'curado', 0.12, 4, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"riesgo_multa","operacion":"multiplicar","valor":2.0}]}'::jsonb,
 '[
   {"letra":"A","texto":"Auditoría interna preventiva inmediata","consecuencias":{"caja":"-3000","riesgo_multa":"*0.3"},"feedback_corto":"Inversión pequeña, gran reducción de riesgo"},
   {"letra":"B","texto":"Contratar contador externo experto en SIN","consecuencias":{"costos_admin":"+1500","riesgo_multa":"*0.5"},"feedback_corto":"Profesionaliza tu cumplimiento"},
   {"letra":"C","texto":"Capacitar al equipo en facturación correcta","consecuencias":{"caja":"-1000","tiempo":"-1semana"},"feedback_corto":"Solución de fondo, lleva tiempo"},
   {"letra":"D","texto":"No hacer nada, tu negocio está al día","consecuencias":{"riesgo_multa":"*1.0"},"feedback_corto":"Si efectivamente estás al día, te ahorras costo"}
 ]'::jsonb),

('EVT013',
 'Factura electrónica obligatoria desde el próximo mes',
 'El SIN dispone que empresas con NIT activo deben emitir factura electrónica obligatoriamente. Implementación tiene plazo de 60 días.',
 'laboral', 'curado', 0.20, 3, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"costo_admin","operacion":"sumar","valor":300}]}'::jsonb,
 '[
   {"letra":"A","texto":"Contratar sistema certificado por el SIN","consecuencias":{"inversion":"+5000","costo_admin_mensual":"+300"},"feedback_corto":"Solución robusta, costo mensual"},
   {"letra":"B","texto":"Usar el portal gratuito del SIN","consecuencias":{"costos_admin":"+0","tiempo_dedicado":"+15h/mes"},"feedback_corto":"Gratis pero te roba tiempo"},
   {"letra":"C","texto":"Tercerizar facturación a contador externo","consecuencias":{"costos_admin":"+800/mes"},"feedback_corto":"Sin dolores de cabeza, costo medio"},
   {"letra":"D","texto":"Esperar última semana del plazo","consecuencias":{"riesgo_multa":"*1.5"},"feedback_corto":"Procrastinar es caro"}
 ]'::jsonb),

('EVT014',
 'Inspección sorpresa del SIN en tu zona',
 'Tres negocios de tu zona fueron multados ayer por irregularidades en facturación. Hoy el operativo continúa.',
 'laboral', 'curado', 0.08, 6, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"riesgo_multa","operacion":"multiplicar","valor":3.0}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cerrar el negocio hoy preventivamente","consecuencias":{"ingresos_dia":"*0","reputacion":"-5%"},"feedback_corto":"Evitas multa pero perdés ventas y confianza"},
   {"letra":"B","texto":"Operar normalmente, mostrar libros si vienen","consecuencias":{"riesgo_multa":"*0.4"},"feedback_corto":"Funciona si tienes papeles en regla"},
   {"letra":"C","texto":"Llamar al contador para que esté disponible","consecuencias":{"caja":"-500","riesgo_multa":"*0.2"},"feedback_corto":"Backup profesional listo si lo necesitas"},
   {"letra":"D","texto":"Esconder mercadería y operar sin factura","consecuencias":{"riesgo_multa":"*5.0","reputacion":"-20%"},"feedback_corto":"Mala idea, multiplicas el riesgo"}
 ]'::jsonb),

('EVT015',
 'SENASAG aumenta tarifas sanitarias 30%',
 'El SENASAG sube costos de registros, certificaciones e inspecciones para empresas alimentarias y agropecuarias. Sin embargo, sin certificado no se puede operar formalmente.',
 'laboral', 'curado', 0.07, 7, ARRAY['produccion', 'agricultura', 'comercio'],
 '{"variables_afectadas":[{"campo":"costos_admin","operacion":"sumar","valor":1200}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar y mantener certificación","consecuencias":{"costos_admin":"+1200/año"},"feedback_corto":"Sigues operando formalmente"},
   {"letra":"B","texto":"Renovar cada 2 años en vez de anual","consecuencias":{"riesgo_multa":"*2.0","costos_admin":"+600/año"},"feedback_corto":"Riesgo si te inspeccionan en el año sin renovar"},
   {"letra":"C","texto":"Operar informal, sin certificación","consecuencias":{"riesgo_clausura":"*3.0","reputacion":"-30%"},"feedback_corto":"Solo si tu cliente no requiere ver el certificado"},
   {"letra":"D","texto":"Cambiar de rubro a uno no certificado","consecuencias":{"ingresos":"*0.7","tiempo_transicion":"+90dias"},"feedback_corto":"Decisión radical, pierdes mercado"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- SECTORIALES (EVT016-EVT020)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT016',
 'Sequía severa afecta producción agrícola en valles',
 'El SENAMHI confirma déficit hídrico de 40% en valles cochabambinos. Cosecha de maíz, papa y trigo reducida significativamente. Precios mayoristas suben.',
 'sectorial', 'curado', 0.10, 8, ARRAY['agricultura', 'produccion', 'comercio'],
 '{"variables_afectadas":[{"campo":"costo_insumos","operacion":"multiplicar","valor":1.20},{"campo":"oferta_local","operacion":"multiplicar","valor":0.75}]}'::jsonb,
 '[
   {"letra":"A","texto":"Anticipar compras de stock antes que suban más","consecuencias":{"caja":"-25%","inventario":"+40%"},"feedback_corto":"Te aseguras, sacrificas liquidez"},
   {"letra":"B","texto":"Buscar proveedores de otras regiones (Santa Cruz)","consecuencias":{"costo_insumos":"*1.10","tiempo_entrega":"+5dias"},"feedback_corto":"Diversificas geográficamente"},
   {"letra":"C","texto":"Subir precios al cliente 8%","consecuencias":{"precio_venta":"*1.08","demanda":"*0.94"},"feedback_corto":"Trasladas el problema"},
   {"letra":"D","texto":"Reformular productos con insumos alternativos","consecuencias":{"calidad":"-5%","costo_insumos":"*0.85"},"feedback_corto":"Innovación forzada, riesgo medio"}
 ]'::jsonb),

('EVT017',
 'Brote de gripe aviar afecta granjas en Cochabamba',
 'El Senasag declara emergencia sanitaria. Sacrificio preventivo de aves en 12 granjas, precio del pollo y huevos sube 35% en mercados.',
 'sectorial', 'curado', 0.05, 10, ARRAY['agricultura', 'comercio', 'servicios'],
 '{"variables_afectadas":[{"campo":"precio_pollo","operacion":"multiplicar","valor":1.35},{"campo":"precio_huevo","operacion":"multiplicar","valor":1.30}]}'::jsonb,
 '[
   {"letra":"A","texto":"Cambiar menú/mix temporalmente a otras proteínas","consecuencias":{"costo_insumos":"*1.05","ingresos":"*0.95"},"feedback_corto":"Adaptación ágil, leve impacto"},
   {"letra":"B","texto":"Subir precios al consumidor +15%","consecuencias":{"precio_venta":"*1.15","demanda":"*0.85"},"feedback_corto":"Traslado total, pierdes clientes sensibles"},
   {"letra":"C","texto":"Mantener precios y comer margen","consecuencias":{"margen":"-12%"},"feedback_corto":"Lealtad de clientes pero te duele caja"},
   {"letra":"D","texto":"Si no aplica a tu rubro, no hacer nada","consecuencias":{"ingresos":"*1.0"},"feedback_corto":"Inmune si tu negocio no usa pollo/huevo"}
 ]'::jsonb),

('EVT018',
 'Boom turístico en Cochabamba por Cristo de la Concordia',
 'Cochabamba se vuelve viral en TikTok internacional. Hoteles llenos, restaurantes con reservas, agencias de turismo agotan tours.',
 'sectorial', 'curado', 0.08, 6, ARRAY['servicios', 'comercio', 'mixto'],
 '{"variables_afectadas":[{"campo":"demanda_turistica","operacion":"multiplicar","valor":1.40}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir precios +20% por la demanda","consecuencias":{"precio_venta":"*1.20","reputacion":"-5%"},"feedback_corto":"Capturas valor, algunos te tildan de oportunista"},
   {"letra":"B","texto":"Mantener precios y vender más volumen","consecuencias":{"ingresos":"+30%","caja":"+20%","desgaste_equipo":"+25%"},"feedback_corto":"Cosechas reputación, equipo muy cargado"},
   {"letra":"C","texto":"Lanzar producto/menú especial turistas","consecuencias":{"ingresos":"+20%","tiempo_lanzamiento":"+15dias"},"feedback_corto":"Inversión que rinde si dura el boom"},
   {"letra":"D","texto":"Hacer alianza con hoteles y agencias","consecuencias":{"ingresos":"+25%","comision_pagada":"-10%"},"feedback_corto":"Canal directo a turistas con descuento"}
 ]'::jsonb),

('EVT019',
 'Apertura de nuevo centro comercial cerca de tu local',
 'Un centro comercial nuevo abre sus puertas a 3 cuadras. Tiene marcas grandes y promociones agresivas. Tráfico peatonal redirigido.',
 'sectorial', 'curado', 0.08, 15, ARRAY['comercio', 'servicios'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.82}]}'::jsonb,
 '[
   {"letra":"A","texto":"Diferenciar producto (calidad/atención personalizada)","consecuencias":{"costo_marketing":"+8000","reputacion":"+10%"},"feedback_corto":"Apuesta a nicho, no compites por precio"},
   {"letra":"B","texto":"Bajar precios para defender clientes","consecuencias":{"precio_venta":"*0.92","demanda":"*1.05","margen":"-8%"},"feedback_corto":"Competís cabeza a cabeza, peligroso"},
   {"letra":"C","texto":"Mudarte a otra zona menos saturada","consecuencias":{"inversion":"+50000","ingresos":"*0.85x6meses"},"feedback_corto":"Costoso, pero a veces necesario"},
   {"letra":"D","texto":"Convertirte en proveedor de uno de los locales del centro","consecuencias":{"ingresos":"+15%","margen":"-15%"},"feedback_corto":"Cambias de juego: B2B en vez de B2C"}
 ]'::jsonb),

('EVT020',
 'Nueva ley de protección al consumidor entra en vigor',
 'Asamblea aprueba ley con mayores garantías y derecho a devolución en 14 días. Multas para empresas que no cumplan información clara.',
 'sectorial', 'curado', 0.06, 7, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"costos_admin","operacion":"sumar","valor":500},{"campo":"devoluciones","operacion":"multiplicar","valor":2.0}]}'::jsonb,
 '[
   {"letra":"A","texto":"Capacitar equipo y actualizar políticas","consecuencias":{"caja":"-2000","reputacion":"+8%"},"feedback_corto":"Te adelantas, mejor posición legal"},
   {"letra":"B","texto":"Esperar el primer reclamo y reaccionar","consecuencias":{"riesgo_multa":"*2.0"},"feedback_corto":"Reactivo, podés caer"},
   {"letra":"C","texto":"Mejorar política de devolución sobre la ley","consecuencias":{"costo_devoluciones":"+30%","reputacion":"+20%"},"feedback_corto":"Apuesta a clientes leales"},
   {"letra":"D","texto":"Cobrar restocking fee a las devoluciones","consecuencias":{"ingreso_extra":"+3000","reputacion":"-10%"},"feedback_corto":"Recuperas algo, no le va a gustar al cliente"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- LOGÍSTICOS (EVT021-EVT024)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT021',
 'Bloqueo de carreteras: 5 días sin tránsito interdepartamental',
 'Sectores sociales bloquean rutas troncales. Cochabamba-La Paz, Cochabamba-Santa Cruz cortadas. Insumos retrasados, mercaderías no llegan.',
 'logistico', 'curado', 0.18, 3, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"tiempo_entrega","operacion":"sumar","valor":7},{"campo":"costo_logistica","operacion":"multiplicar","valor":1.40}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar a transportista que rompe bloqueo","consecuencias":{"costos_logistica":"*1.8","riesgo":"+15%"},"feedback_corto":"Resuelves, costo alto y algo de riesgo"},
   {"letra":"B","texto":"Cerrar temporalmente, sin stock no abrimos","consecuencias":{"ingresos_semana":"*0","costos_fijos":"*1.0"},"feedback_corto":"Pausa controlada, conservas caja"},
   {"letra":"C","texto":"Sustituir productos con stock local","consecuencias":{"ingresos":"*0.7","margen":"-5%"},"feedback_corto":"Operás reducido, pero abierto"},
   {"letra":"D","texto":"Negociar plazo con clientes y reabrir post-bloqueo","consecuencias":{"reputacion":"-5%","ingresos_diferidos":"+0"},"feedback_corto":"Honesto con cliente, te perdona si comunicas bien"}
 ]'::jsonb),

('EVT022',
 'Paro cívico departamental por 48 horas',
 'Tu departamento convoca paro general en protesta. Comercios cerrados, transporte limitado, oficinas administrativas no atienden.',
 'logistico', 'curado', 0.12, 4, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"ingresos_dia","operacion":"multiplicar","valor":0.30},{"campo":"costos_fijos","operacion":"multiplicar","valor":1.0}]}'::jsonb,
 '[
   {"letra":"A","texto":"Adherir al paro y cerrar","consecuencias":{"ingresos":"-15%","reputacion_local":"+5%"},"feedback_corto":"Solidaridad con comunidad"},
   {"letra":"B","texto":"Abrir igual y vender lo que se pueda","consecuencias":{"ingresos":"-5%","reputacion_local":"-10%","riesgo_destrozos":"*2.0"},"feedback_corto":"Conservas algo de venta pero te ven mal"},
   {"letra":"C","texto":"Mover ventas a domicilio/online","consecuencias":{"ingresos":"-5%","costo_envios":"+3000"},"feedback_corto":"Salida creativa si tu producto se entrega"},
   {"letra":"D","texto":"Aprovechar para inventario/limpieza","consecuencias":{"ingresos":"-15%","eficiencia":"+5%"},"feedback_corto":"Productividad en pausa forzada"}
 ]'::jsonb),

('EVT023',
 'Crisis del transporte público — sin micros 3 días',
 'Federación de choferes en paro escalonado. Personal no llega a trabajar, clientes no van al local. Calles vacías.',
 'logistico', 'curado', 0.10, 5, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.7},{"campo":"ausentismo","operacion":"multiplicar","valor":2.5}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar transporte a empleados (taxi/uber)","consecuencias":{"costos_personal":"+2000","ausentismo":"*1.0"},"feedback_corto":"Tu equipo llega, costo upfront"},
   {"letra":"B","texto":"Implementar trabajo remoto/flex donde se pueda","consecuencias":{"costos_personal":"*1.0","servicio":"-15%"},"feedback_corto":"Funciona en oficina, no en operativo"},
   {"letra":"C","texto":"Reducir horarios a 6 horas","consecuencias":{"ingresos":"*0.8","costos_personal":"*0.85"},"feedback_corto":"Adaptás operación a la realidad"},
   {"letra":"D","texto":"Cerrar hasta que termine","consecuencias":{"ingresos":"*0","costos_fijos":"*1.0"},"feedback_corto":"Conservas caja, perdés impulso"}
 ]'::jsonb),

('EVT024',
 'Cierre temporal de aduana en frontera con Chile',
 'Inspección rigurosa y demoras de hasta 30 días en aduana de Tambo Quemado. Contenedores varados, insumos importados estancados.',
 'logistico', 'curado', 0.07, 9, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"tiempo_entrega_importaciones","operacion":"sumar","valor":25},{"campo":"costo_demoraje","operacion":"sumar","valor":3000}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar agente aduanero express","consecuencias":{"costos_logistica":"+5000","tiempo_entrega":"-10dias"},"feedback_corto":"Pagas premium por velocidad"},
   {"letra":"B","texto":"Reorientar a frontera Perú o Brasil","consecuencias":{"costos_logistica":"+8000","tiempo_entrega":"+5dias"},"feedback_corto":"Cambio de ruta, costo mayor"},
   {"letra":"C","texto":"Comprar a importador local con stock","consecuencias":{"costo_insumos":"*1.25","tiempo_entrega":"-15dias"},"feedback_corto":"Más caro pero ya"},
   {"letra":"D","texto":"Esperar y comunicar atraso a clientes","consecuencias":{"reputacion":"-10%","ingresos_diferidos":"+0"},"feedback_corto":"Honesto pero peligroso si cliente se va"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- TECNOLÓGICOS / SOCIALES (EVT025-EVT028)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT025',
 'Tu negocio se vuelve viral en TikTok',
 'Un influencer paceño con 800k seguidores menciona tu producto/servicio en un video que ya tiene 2 millones de vistas. Demanda explota.',
 'tecnologico', 'curado', 0.04, 8, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":2.5},{"campo":"reputacion","operacion":"sumar","valor":0.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aumentar producción al máximo posible","consecuencias":{"ingresos":"+80%","desgaste_equipo":"+40%","calidad":"-8%"},"feedback_corto":"Captás momento, riesgo de calidad"},
   {"letra":"B","texto":"Subir precios para gestionar demanda","consecuencias":{"precio_venta":"*1.25","reputacion":"-10%"},"feedback_corto":"Capturás valor, parte del fanbase te tilda de oportunista"},
   {"letra":"C","texto":"Contratar personal extra urgente","consecuencias":{"costos_personal":"+12000","ingresos":"+60%"},"feedback_corto":"Sostenés calidad pero compromiso fijo"},
   {"letra":"D","texto":"Aprovechar para capturar emails y construir base","consecuencias":{"clientes_recurrentes":"+30%","ingresos":"+30%"},"feedback_corto":"Largo plazo: convertís buzz en clientela leal"}
 ]'::jsonb),

('EVT026',
 'Reseña viral negativa: cliente molesto con video de 500k vistas',
 'Un cliente publica un video quejándose de tu servicio. Comentarios negativos, gente cancelando reservas, competencia comparte el video.',
 'tecnologico', 'curado', 0.06, 6, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"restar","valor":0.30},{"campo":"demanda","operacion":"multiplicar","valor":0.70}]}'::jsonb,
 '[
   {"letra":"A","texto":"Disculpa pública en video + compensación al cliente","consecuencias":{"caja":"-3000","reputacion":"+15%"},"feedback_corto":"Manejo correcto, recuperas algo"},
   {"letra":"B","texto":"Responder técnicamente en comentarios","consecuencias":{"reputacion":"+0%","tiempo":"+10h"},"feedback_corto":"No mueve la aguja, gasta tu energía"},
   {"letra":"C","texto":"Ignorar, esperar que pase","consecuencias":{"reputacion":"-15%","demanda":"*0.85"},"feedback_corto":"El silencio interpreta como culpa"},
   {"letra":"D","texto":"Demanda legal por daños","consecuencias":{"caja":"-15000","reputacion":"-30%"},"feedback_corto":"Profundizás el problema, mala prensa"}
 ]'::jsonb),

('EVT027',
 'Nueva tendencia de consumo: clientes piden más opciones saludables/veganas',
 'Encuesta nacional muestra 22% de millennials prefieren opciones vegetarianas/veganas. Tu competencia ya adaptó menú.',
 'tecnologico', 'curado', 0.10, 10, ARRAY['servicios', 'comercio', 'mixto'],
 '{"variables_afectadas":[{"campo":"demanda_tradicional","operacion":"multiplicar","valor":0.92}]}'::jsonb,
 '[
   {"letra":"A","texto":"Sumar línea vegana/saludable","consecuencias":{"inversion":"+8000","ingresos":"+12%"},"feedback_corto":"Adaptación necesaria, retorno a 6 meses"},
   {"letra":"B","texto":"Reemplazar parte del menú actual","consecuencias":{"ingresos_tradicional":"*0.8","ingresos_nuevo":"+15%"},"feedback_corto":"Apuesta a futuro, sacrificás algo del presente"},
   {"letra":"C","texto":"Mantener identidad actual","consecuencias":{"demanda":"*0.92","reputacion":"-5%"},"feedback_corto":"Coherencia de marca, perdés un segmento"},
   {"letra":"D","texto":"Ofrecer addons saludables como upgrade","consecuencias":{"ingresos":"+8%","complejidad_operativa":"+10%"},"feedback_corto":"Solución de bajo costo, captura segmento"}
 ]'::jsonb),

('EVT028',
 'Boom de apps de delivery: PedidosYa, Yaigo, Maleta',
 'El delivery crece 40% año tras año. Apps cobran 22-28% comisión pero traen mucha demanda nueva. Restaurantes que NO están pierden mercado.',
 'tecnologico', 'curado', 0.15, 4, ARRAY['servicios', 'comercio'],
 '{"variables_afectadas":[{"campo":"demanda_delivery","operacion":"multiplicar","valor":1.40}]}'::jsonb,
 '[
   {"letra":"A","texto":"Sumarse a PedidosYa y Yaigo","consecuencias":{"ingresos":"+25%","margen":"-22%","comision_pagada":"+22%"},"feedback_corto":"Mucho volumen, margen apretado"},
   {"letra":"B","texto":"Crear delivery propio","consecuencias":{"inversion":"+15000","ingresos":"+15%","margen":"-5%"},"feedback_corto":"Inversión upfront, mejor margen"},
   {"letra":"C","texto":"Solo delivery directo por WhatsApp","consecuencias":{"ingresos":"+10%","margen":"-3%","tiempo_dedicado":"+30h/mes"},"feedback_corto":"Bajo costo, mucho trabajo manual"},
   {"letra":"D","texto":"Mantenerse solo presencial","consecuencias":{"demanda":"*0.85"},"feedback_corto":"Pierdes el tren, segmento que no vuelve fácil"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- CLIMÁTICOS (EVT029-EVT032)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT029',
 'Granizada destruye cultivos en valles',
 'Granizada inusual de 1 hora afecta cosechas y daños en techos/vidrios de comercios. Insumos agrícolas escasean por 3 semanas.',
 'climatico', 'curado', 0.08, 6, ARRAY['agricultura', 'produccion', 'comercio'],
 '{"variables_afectadas":[{"campo":"costo_insumos","operacion":"multiplicar","valor":1.25},{"campo":"daño_infraestructura","operacion":"sumar","valor":5000}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pagar reparación + reponer stock","consecuencias":{"caja":"-12000","ingresos":"*1.0"},"feedback_corto":"Operás normal pero golpe a caja"},
   {"letra":"B","texto":"Activar seguro (si tienes)","consecuencias":{"caja":"-2000","cobertura":"-80%"},"feedback_corto":"Pagás deducible, cubre mayor parte"},
   {"letra":"C","texto":"Operar con daños menores temporalmente","consecuencias":{"reputacion":"-5%","ingresos":"*0.92"},"feedback_corto":"Ahorrás corto plazo, pagás reputación"},
   {"letra":"D","texto":"Pedir crédito de emergencia","consecuencias":{"deuda":"+8000","interes_pagado":"+1500"},"feedback_corto":"Resuelves líquido, mochila de deuda"}
 ]'::jsonb),

('EVT030',
 'Helada inesperada en agosto afecta operaciones',
 'Temperaturas bajo cero por 3 noches consecutivas. Daños en flores, vegetales, tuberías reventadas. Costo extra de calefacción.',
 'climatico', 'curado', 0.06, 9, ARRAY['agricultura', 'servicios', 'produccion'],
 '{"variables_afectadas":[{"campo":"costo_servicios","operacion":"multiplicar","valor":1.20},{"campo":"costo_insumos_vegetales","operacion":"multiplicar","valor":1.30}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en climatización del local","consecuencias":{"inversion":"+6000","costo_servicios_futuro":"*0.85"},"feedback_corto":"Capex que retorna en frío de cada año"},
   {"letra":"B","texto":"Subir precios de productos sensibles","consecuencias":{"precio_venta":"*1.10","demanda":"*0.95"},"feedback_corto":"Trasladás costo, leve impacto"},
   {"letra":"C","texto":"Cambiar oferta a productos calientes/de temporada","consecuencias":{"ingresos":"+5%","tiempo_lanzamiento":"+10dias"},"feedback_corto":"Adaptación creativa al clima"},
   {"letra":"D","texto":"Aceptar el costo, esperar que pase","consecuencias":{"margen":"-6%"},"feedback_corto":"Costo de 1 mes, después normaliza"}
 ]'::jsonb),

('EVT031',
 'Temporada de lluvias intensa: 30 días de inundaciones',
 'Aviso meteorológico de lluvias 50% sobre lo normal. Calles inundadas, clientes no salen, mercaderías sensibles a humedad afectadas.',
 'climatico', 'curado', 0.10, 5, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"demanda","operacion":"multiplicar","valor":0.78},{"campo":"costo_servicios","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Promo \"lluvia descuento\" para incentivar","consecuencias":{"precio_venta":"*0.90","demanda":"*1.10","margen":"-8%"},"feedback_corto":"Movés volumen a costa de margen"},
   {"letra":"B","texto":"Aumentar delivery propio","consecuencias":{"costos_personal":"+3000","ingresos":"+15%"},"feedback_corto":"Llevás vos al cliente que no sale"},
   {"letra":"C","texto":"Cerrar días peores, ahorrar luz/personal","consecuencias":{"ingresos":"*0.7","costos_personal":"*0.8"},"feedback_corto":"Operación recortada"},
   {"letra":"D","texto":"Invertir en techos/desagües del local","consecuencias":{"inversion":"+4000","daños_evitados":"+8000"},"feedback_corto":"Capex preventivo, paga a largo plazo"}
 ]'::jsonb),

('EVT032',
 'Ola de calor: temperaturas récord 38°C',
 'Calor inusual por 2 semanas. Aire acondicionado al máximo, ventas de bebidas frías suben pero comida caliente cae. Conservación de alimentos crítica.',
 'climatico', 'curado', 0.08, 11, ARRAY['comercio', 'servicios', 'produccion'],
 '{"variables_afectadas":[{"campo":"costo_servicios","operacion":"multiplicar","valor":1.30},{"campo":"merma_inventario","operacion":"multiplicar","valor":1.50}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reforzar refrigeración (equipos extra)","consecuencias":{"inversion":"+5000","merma":"*0.7"},"feedback_corto":"Inversión que evita pérdidas"},
   {"letra":"B","texto":"Liquidar stock perecedero con descuento","consecuencias":{"ingresos":"+10%","margen":"-15%"},"feedback_corto":"Sacás stock, perdés margen"},
   {"letra":"C","texto":"Cambiar mix a productos no perecederos","consecuencias":{"ingresos":"*0.95","merma":"*0.5"},"feedback_corto":"Reducción de riesgo de pérdida"},
   {"letra":"D","texto":"Promociones de bebidas y helados","consecuencias":{"ingresos":"+20%","costos_marketing":"+1000"},"feedback_corto":"Aprovechás demanda nueva"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- FINANCIEROS (EVT033-EVT035)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT033',
 'ASFI sube tasa de referencia 2 puntos',
 'La ASFI eleva la tasa de referencia. Préstamos PYME suben de 14% a 16% anual. Negocios con deuda variable sienten el impacto.',
 'financiero', 'curado', 0.10, 8, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"tasa_interes","operacion":"sumar","valor":0.02}]}'::jsonb,
 '[
   {"letra":"A","texto":"Refinanciar a tasa fija (si banco acepta)","consecuencias":{"caja":"-2000","tasa_futura":"*1.0"},"feedback_corto":"Cobertura ante futuras subas"},
   {"letra":"B","texto":"Pre-pagar parte de la deuda","consecuencias":{"deuda":"-25%","caja":"-30%"},"feedback_corto":"Liberás balance, te quedás chato de caja"},
   {"letra":"C","texto":"Subir precios para cubrir mayor cuota","consecuencias":{"precio_venta":"*1.04","demanda":"*0.96"},"feedback_corto":"Traslado al cliente, leve impacto"},
   {"letra":"D","texto":"Asumir el aumento","consecuencias":{"margen":"-3%"},"feedback_corto":"Costos financieros más altos en próximos meses"}
 ]'::jsonb),

('EVT034',
 'Banco te ofrece refinanciamiento favorable',
 'Tu banco contacta proactivamente: pueden refinanciar tu deuda con 2 puntos menos de tasa y 12 meses más de plazo. Comisión 0.5%.',
 'financiero', 'curado', 0.05, 14, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"oferta_refinanciamiento","operacion":"setear","valor":1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar refinanciamiento","consecuencias":{"caja":"-1000","cuota_mensual":"*0.85"},"feedback_corto":"Liberas cash flow mensual"},
   {"letra":"B","texto":"Negociar 3 puntos menos en lugar de 2","consecuencias":{"riesgo_negociacion":"+20%","cuota_mensual":"*0.78"},"feedback_corto":"Apostás a mejor, banco puede retirar oferta"},
   {"letra":"C","texto":"Aprovechar para tomar más deuda y expandir","consecuencias":{"deuda":"+50%","inversion":"+50000","ingresos_potencial":"+20%"},"feedback_corto":"Apuesta agresiva de crecimiento"},
   {"letra":"D","texto":"Rechazar, mantener condiciones actuales","consecuencias":{"caja":"+0","oportunidad":"-15%"},"feedback_corto":"Conservás simplicidad, dejás dinero en la mesa"}
 ]'::jsonb),

('EVT035',
 'Cliente grande pide crédito de 90 días',
 'Una empresa importante quiere comprarte por un monto equivalente al 25% de tus ventas mensuales pero pide pagarte a 90 días.',
 'financiero', 'curado', 0.12, 6, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"oferta_cliente_grande","operacion":"setear","valor":1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar el plazo de 90 días","consecuencias":{"ingresos":"+25%","caja":"-15%","riesgo_morosidad":"*1.5"},"feedback_corto":"Crecimiento con riesgo de cobranza"},
   {"letra":"B","texto":"Negociar 30 días o nada","consecuencias":{"ingresos":"+0%","riesgo_morosidad":"*1.0"},"feedback_corto":"Puede que pierdas el cliente"},
   {"letra":"C","texto":"Aceptar pero con 5% recargo por financiar","consecuencias":{"ingresos":"+26%","caja":"-12%","reputacion":"+0%"},"feedback_corto":"Cubrís costo de capital"},
   {"letra":"D","texto":"Hacer factoring (vender la factura a un banco)","consecuencias":{"caja":"+22%","margen":"-3%"},"feedback_corto":"Líquido al toque, comisión modera margen"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- INTERNACIONALES (EVT036-EVT038)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT036',
 'Precio internacional del trigo sube 25%',
 'Conflictos geopolíticos disparan el precio del trigo. Harina, pan, pastas suben en Bolivia. Pastelerías y panaderías golpeadas.',
 'internacional', 'curado', 0.07, 10, ARRAY['produccion', 'servicios', 'comercio'],
 '{"variables_afectadas":[{"campo":"precio_harina","operacion":"multiplicar","valor":1.25}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir precios al consumidor","consecuencias":{"precio_venta":"*1.10","demanda":"*0.93"},"feedback_corto":"Traslado parcial al cliente"},
   {"letra":"B","texto":"Negociar con molinos locales para precio fijo 6 meses","consecuencias":{"costo_harina":"*1.05","caja":"-3000"},"feedback_corto":"Cobertura con prepago"},
   {"letra":"C","texto":"Reducir tamaño de porción (shrinkflation)","consecuencias":{"costo":"*1.0","reputacion":"-5%"},"feedback_corto":"Subterfugio que algunos clientes notan"},
   {"letra":"D","texto":"Reformular con maíz/yuca local","consecuencias":{"costo_insumos":"*0.85","calidad":"-5%"},"feedback_corto":"Innovación con ingredientes nacionales"}
 ]'::jsonb),

('EVT037',
 'Argentina devalúa: contrabando boliviano hacia el sur aumenta',
 'Peso argentino se devalúa fuerte. Frontera de Bermejo y Yacuiba ven flujo de productos bolivianos cruzando. Demanda local cae temporalmente.',
 'internacional', 'curado', 0.08, 12, ARRAY['comercio', 'produccion'],
 '{"variables_afectadas":[{"campo":"demanda_zonas_frontera","operacion":"multiplicar","valor":0.85},{"campo":"oferta_contrabando","operacion":"multiplicar","valor":1.40}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aprovechar y exportar (formal) a Argentina","consecuencias":{"ingresos":"+15%","complejidad_operativa":"+30%"},"feedback_corto":"Nueva fuente de ingresos, requiere trámites"},
   {"letra":"B","texto":"Bajar precios para no perder clientes locales","consecuencias":{"precio_venta":"*0.93","margen":"-7%"},"feedback_corto":"Defiendes participación"},
   {"letra":"C","texto":"Diferenciar producto con calidad superior","consecuencias":{"costo_marketing":"+2000","reputacion":"+8%"},"feedback_corto":"Jugada a largo plazo"},
   {"letra":"D","texto":"Esperar que normalice","consecuencias":{"ingresos":"*0.9"},"feedback_corto":"Pasividad, costo medio"}
 ]'::jsonb),

('EVT038',
 'Crisis logística mundial: contenedores demoran 60 días',
 'Crisis portuaria en Asia y EEUU. Importaciones de electrodomésticos, tecnología, partes de maquinaria llegan con 2 meses de retraso.',
 'internacional', 'curado', 0.05, 8, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"tiempo_entrega_importaciones","operacion":"sumar","valor":60},{"campo":"costos_logistica","operacion":"multiplicar","valor":1.50}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pedir lo del próximo trimestre ahora","consecuencias":{"caja":"-30%","inventario":"+50%"},"feedback_corto":"Te anticipás, comprometés caja"},
   {"letra":"B","texto":"Cambiar proveedores a Brasil/Argentina","consecuencias":{"costo_insumos":"*1.10","tiempo_entrega":"-30dias"},"feedback_corto":"Caro pero rápido"},
   {"letra":"C","texto":"Comunicar atraso a clientes y reagendar","consecuencias":{"reputacion":"-8%","ingresos_diferidos":"+0"},"feedback_corto":"Honesto, clientes pacientes vuelven"},
   {"letra":"D","texto":"Sustituir por productos nacionales","consecuencias":{"calidad":"-10%","margen":"-5%"},"feedback_corto":"Cambio de catálogo, riesgo medio"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- COMERCIO (EVT039-EVT040)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT039',
 'Operativo de aduanas contra contrabando reduce oferta paralela',
 'Aduana intensifica operativos en La Paz y Cochabamba. Mercaderías de contrabando confiscadas. Precios de productos importados informales suben 20%.',
 'comercio', 'curado', 0.10, 7, ARRAY['comercio', 'produccion'],
 '{"variables_afectadas":[{"campo":"oferta_contrabando","operacion":"multiplicar","valor":0.7},{"campo":"precio_competencia_informal","operacion":"multiplicar","valor":1.20}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aprovechar y subir precios a importadores formales","consecuencias":{"precio_venta":"*1.12","demanda":"*1.0"},"feedback_corto":"Ventaja competitiva temporal"},
   {"letra":"B","texto":"Capturar clientes que dejaron de comprar contrabando","consecuencias":{"ingresos":"+15%","costos_marketing":"+2000"},"feedback_corto":"Conquista de mercado con marketing"},
   {"letra":"C","texto":"No cambiar nada, esperar a ver","consecuencias":{"ingresos":"+5%"},"feedback_corto":"Algo de beneficio pasivo"},
   {"letra":"D","texto":"Invertir en stock antes que normalice","consecuencias":{"inventario":"+40%","caja":"-25%"},"feedback_corto":"Apuesta a mantener ventaja"}
 ]'::jsonb),

('EVT040',
 'Nuevo gravamen a importaciones de productos terminados',
 'Gobierno aplica arancel adicional del 15% a importaciones de productos finales para proteger industria nacional. Hardware, ropa, electrodomésticos afectados.',
 'comercio', 'curado', 0.06, 12, ARRAY['comercio'],
 '{"variables_afectadas":[{"campo":"costos_importacion","operacion":"multiplicar","valor":1.15}]}'::jsonb,
 '[
   {"letra":"A","texto":"Subir precio final, trasladar al consumidor","consecuencias":{"precio_venta":"*1.10","demanda":"*0.93"},"feedback_corto":"Traslado mayoritario"},
   {"letra":"B","texto":"Cambiar a producto nacional similar","consecuencias":{"costo_insumos":"*0.85","calidad":"-5%"},"feedback_corto":"Apuesta al \"hecho en Bolivia\""},
   {"letra":"C","texto":"Stock anticipado antes del arancel","consecuencias":{"caja":"-25%","inventario":"+30%"},"feedback_corto":"Aplazás el problema"},
   {"letra":"D","texto":"Reducir variedad, foco en productos sin arancel","consecuencias":{"ingresos":"*0.92","margen":"+5%"},"feedback_corto":"Simplificás operación"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- SERVICIOS (EVT041-EVT042)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT041',
 'Brote epidémico local: gobierno recomienda quedarse en casa',
 'Brote regional de enfermedad respiratoria. Eventos cancelados, restaurantes con capacidad reducida, oficinas en teletrabajo por 30 días.',
 'servicios', 'curado', 0.04, 10, ARRAY['servicios', 'comercio'],
 '{"variables_afectadas":[{"campo":"demanda_presencial","operacion":"multiplicar","valor":0.55}]}'::jsonb,
 '[
   {"letra":"A","texto":"Pivotar 100% a delivery/online","consecuencias":{"ingresos":"*0.8","inversion":"+5000"},"feedback_corto":"Adaptación rápida, recuperás algo"},
   {"letra":"B","texto":"Cerrar temporalmente y rebajar costos","consecuencias":{"ingresos":"*0","costos_personal":"*0.6"},"feedback_corto":"Hibernación, conservás algo"},
   {"letra":"C","texto":"Operar al 50% con protocolos","consecuencias":{"ingresos":"*0.55","costos_protocolo":"+3000"},"feedback_corto":"Operación parcial costosa"},
   {"letra":"D","texto":"Ofrecer servicio a domicilio premium","consecuencias":{"ingresos":"*0.7","margen":"+10%"},"feedback_corto":"Posicionamiento alto, menos volumen"}
 ]'::jsonb),

('EVT042',
 'Gobierno decreta feriado nacional adicional',
 'Por aniversario regional, se decreta feriado nacional. Comercios pueden cerrar o abrir según rubro. Restaurantes/turismo se benefician.',
 'servicios', 'curado', 0.10, 4, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"demanda_servicios_ocio","operacion":"multiplicar","valor":1.30},{"campo":"demanda_oficinas","operacion":"multiplicar","valor":0.20}]}'::jsonb,
 '[
   {"letra":"A","texto":"Abrir con promoción especial","consecuencias":{"ingresos":"+25%","costos_personal":"+50% (extra)"},"feedback_corto":"Aprovechás día, pagás hora doble"},
   {"letra":"B","texto":"Cerrar, dar el día al equipo","consecuencias":{"ingresos":"*0","clima_laboral":"+10%"},"feedback_corto":"Buena para retención de personal"},
   {"letra":"C","texto":"Apertura reducida (medio turno)","consecuencias":{"ingresos":"+10%","costos_personal":"+25%"},"feedback_corto":"Compromiso intermedio"},
   {"letra":"D","texto":"Usar el día para mantenimiento/limpieza profunda","consecuencias":{"costo":"+1000","eficiencia_futura":"+5%"},"feedback_corto":"Pausa productiva"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- PRODUCCIÓN (EVT043-EVT045)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT043',
 'Falla técnica en maquinaria principal',
 'Tu máquina/equipo principal se rompe inesperadamente. Reparación importada de 15-30 días o reemplazo inmediato con uno usado nacional.',
 'produccion', 'curado', 0.10, 8, ARRAY['produccion', 'servicios'],
 '{"variables_afectadas":[{"campo":"capacidad_produccion","operacion":"multiplicar","valor":0.50}]}'::jsonb,
 '[
   {"letra":"A","texto":"Reparar (15-30 días de espera)","consecuencias":{"ingresos":"*0.5x3semanas","costo_reparacion":"+8000"},"feedback_corto":"Solución barata pero lenta"},
   {"letra":"B","texto":"Comprar usado nacional inmediato","consecuencias":{"inversion":"+15000","ingresos":"*0.95"},"feedback_corto":"Operás rápido, equipo no ideal"},
   {"letra":"C","texto":"Tercerizar producción 1 mes","consecuencias":{"costos_produccion":"+30%","ingresos":"*1.0"},"feedback_corto":"Sin parar producción, márgenes apretados"},
   {"letra":"D","texto":"Comprar nuevo y financiarlo","consecuencias":{"inversion":"+45000","deuda":"+45000","eficiencia":"+15%"},"feedback_corto":"Capex grande, mejora futura"}
 ]'::jsonb),

('EVT044',
 'Tu proveedor único quiebra',
 'El único proveedor de un insumo crítico cierra operaciones. Tienes 2 semanas de stock. Buscar reemplazo es urgente.',
 'produccion', 'curado', 0.05, 9, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"riesgo_quiebra_proveedor","operacion":"setear","valor":1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Buscar 2-3 proveedores nuevos, contratar al mejor","consecuencias":{"costo_insumos":"*1.15","tiempo":"+15dias"},"feedback_corto":"Solución sólida, costo extra"},
   {"letra":"B","texto":"Importar del exterior","consecuencias":{"costo_insumos":"*1.30","tiempo":"+30dias"},"feedback_corto":"Calidad mejor pero costoso y lento"},
   {"letra":"C","texto":"Producir el insumo internamente","consecuencias":{"inversion":"+12000","ahorro_futuro":"+15%/año"},"feedback_corto":"Vertical integration, paga a futuro"},
   {"letra":"D","texto":"Cambiar el producto para usar otro insumo","consecuencias":{"ingresos":"*0.92","tiempo_lanzamiento":"+20dias"},"feedback_corto":"Reingeniería del producto"}
 ]'::jsonb),

('EVT045',
 'Tarifa eléctrica industrial sube 18%',
 'ENDE ajusta tarifas industriales. Negocios con alto consumo (frigoríficos, panaderías, lavanderías) sienten el impacto.',
 'produccion', 'curado', 0.08, 7, ARRAY['produccion', 'servicios'],
 '{"variables_afectadas":[{"campo":"costo_servicios","operacion":"multiplicar","valor":1.18}]}'::jsonb,
 '[
   {"letra":"A","texto":"Invertir en paneles solares","consecuencias":{"inversion":"+25000","costo_servicios_futuro":"*0.65"},"feedback_corto":"Capex grande, retorno 2-3 años"},
   {"letra":"B","texto":"Optimizar horarios (uso en banda baja)","consecuencias":{"costo_servicios":"*0.92","complejidad":"+10%"},"feedback_corto":"Sin inversión, requiere disciplina"},
   {"letra":"C","texto":"Subir precios al cliente","consecuencias":{"precio_venta":"*1.04","demanda":"*0.97"},"feedback_corto":"Traslado leve"},
   {"letra":"D","texto":"Aceptar el aumento","consecuencias":{"margen":"-2%"},"feedback_corto":"Costo controlable a mediano plazo"}
 ]'::jsonb);


-- ─────────────────────────────────────────────────────────────────────────
-- OPORTUNIDADES (EVT046-EVT050)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO finanzas_eventos (codigo, titulo, descripcion, categoria, tipo, probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision) VALUES
('EVT046',
 'Ganaste licitación pública municipal',
 'La alcaldía adjudica un contrato de suministro/servicio a tu negocio. Volumen de 6 meses garantizado, equivalente al 30% de tus ventas.',
 'oportunidad', 'curado', 0.05, 10, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"oferta_licitacion","operacion":"setear","valor":1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar — escalar producción","consecuencias":{"ingresos":"+30%","costos_produccion":"+25%","caja":"-15%"},"feedback_corto":"Crecimiento con inversión upfront"},
   {"letra":"B","texto":"Aceptar parcial (solo lo que producís hoy)","consecuencias":{"ingresos":"+15%","reputacion":"-5%"},"feedback_corto":"Compromiso conservador"},
   {"letra":"C","texto":"Aceptar y subcontratar parte","consecuencias":{"ingresos":"+25%","margen":"-10%"},"feedback_corto":"Cumplís sin descapitalizar"},
   {"letra":"D","texto":"Rechazar — no querés depender del Estado","consecuencias":{"ingresos":"+0%","independencia":"+0%"},"feedback_corto":"Conservás autonomía"}
 ]'::jsonb),

('EVT047',
 'Inversionista interesado en tu negocio',
 'Un inversor (boliviano residente en Chile) quiere comprar 25% de tu negocio por Bs 200.000 para escalar operaciones.',
 'oportunidad', 'curado', 0.03, 18, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"oferta_inversor","operacion":"setear","valor":1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar oferta tal cual","consecuencias":{"caja":"+200000","control":"-25%"},"feedback_corto":"Capital fresco, perdés algo de autonomía"},
   {"letra":"B","texto":"Negociar por 15% en vez de 25%","consecuencias":{"caja":"+130000","control":"-15%","riesgo_negociacion":"+25%"},"feedback_corto":"Mejor balance si lo aceptan"},
   {"letra":"C","texto":"Pedirle préstamo en lugar de capital","consecuencias":{"deuda":"+200000","control":"-0%","interes_pagado":"+2500/mes"},"feedback_corto":"Mantenés control, cargás deuda"},
   {"letra":"D","texto":"Rechazar — no estás listo para socios","consecuencias":{"control":"+0%"},"feedback_corto":"Mantenés simplicidad"}
 ]'::jsonb),

('EVT048',
 'Tu negocio gana premio empresarial regional',
 'Cámara de Comercio te otorga reconocimiento como \"Emprendimiento del Año\" en tu categoría. Cobertura de prensa, foto en periódicos.',
 'oportunidad', 'curado', 0.04, 14, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"reputacion","operacion":"sumar","valor":0.20},{"campo":"demanda","operacion":"multiplicar","valor":1.10}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aprovechar para campaña de marketing","consecuencias":{"costo_marketing":"+5000","ingresos":"+18%"},"feedback_corto":"Capitalizás el reconocimiento"},
   {"letra":"B","texto":"Hacer evento celebrando, invitar clientes","consecuencias":{"costo":"+3000","clientes_recurrentes":"+15%"},"feedback_corto":"Construye comunidad y lealtad"},
   {"letra":"C","texto":"No hacer nada especial","consecuencias":{"reputacion":"+10%","ingresos":"+5%"},"feedback_corto":"Algo de beneficio orgánico"},
   {"letra":"D","texto":"Subir precios — \"premio merece premium\"","consecuencias":{"precio_venta":"*1.10","demanda":"*0.98"},"feedback_corto":"Capturás valor del posicionamiento"}
 ]'::jsonb),

('EVT049',
 'Importador peruano se interesa en tus productos',
 'Una empresa peruana quiere distribuir tu producto en Tacna y Arequipa. Pedido inicial 10% de tu producción anual.',
 'oportunidad', 'curado', 0.04, 16, ARRAY['produccion', 'agricultura'],
 '{"variables_afectadas":[{"campo":"oferta_exportacion","operacion":"setear","valor":1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Aceptar y dedicar capacidad","consecuencias":{"ingresos":"+10%","complejidad_operativa":"+30%","margen":"-5%"},"feedback_corto":"Mercado nuevo, complejidad nueva"},
   {"letra":"B","texto":"Aceptar pero con prepago 50%","consecuencias":{"ingresos":"+10%","caja":"+15%","riesgo":"*0.5"},"feedback_corto":"Cobertura financiera prudente"},
   {"letra":"C","texto":"Estudiar mercado peruano antes (3 meses)","consecuencias":{"costo":"+5000","oportunidad":"-15%"},"feedback_corto":"Análisis prudente, podés perder cliente"},
   {"letra":"D","texto":"Rechazar — foco en Bolivia","consecuencias":{"ingresos":"+0%"},"feedback_corto":"Conservás foco"}
 ]'::jsonb),

('EVT050',
 'Programa gubernamental de fomento PYME — convocatoria abierta',
 'El gobierno lanza programa de Bs 50.000 a fondo perdido para emprendimientos PYME que cumplan ciertos criterios (sostenibilidad, empleo joven).',
 'oportunidad', 'curado', 0.07, 8, ARRAY['todos'],
 '{"variables_afectadas":[{"campo":"convocatoria_abierta","operacion":"setear","valor":1}]}'::jsonb,
 '[
   {"letra":"A","texto":"Postular con plan detallado (alta inversión de tiempo)","consecuencias":{"tiempo":"-60h","caja_potencial":"+50000","probabilidad_exito":"*0.3"},"feedback_corto":"Mucho trabajo, premio gordo si ganás"},
   {"letra":"B","texto":"Postular versión simplificada","consecuencias":{"tiempo":"-20h","caja_potencial":"+50000","probabilidad_exito":"*0.1"},"feedback_corto":"Esfuerzo bajo, baja probabilidad"},
   {"letra":"C","texto":"Pagar consultor que lo arme","consecuencias":{"caja":"-3000","caja_potencial":"+50000","probabilidad_exito":"*0.45"},"feedback_corto":"Inversión razonable, mejor probabilidad"},
   {"letra":"D","texto":"No postular","consecuencias":{"caja":"+0"},"feedback_corto":"Ahorrás tiempo, dejás dinero en la mesa"}
 ]'::jsonb);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 007_fase6_simulaciones.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 008_docente_lee_simulaciones.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 009_casos_curso_y_entregas.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 010_modos_simulacion.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 9 — Modos de simulación del curso
--
-- El docente puede elegir cómo se aplican los finanzas_eventos económicos a sus
-- estudiantes:
--   • automatico       — sistema sortea finanzas_eventos aleatorios (default, lo de hoy)
--   • docente_dispara  — el docente lanza cada evento manualmente
--   • curado           — el docente elige los finanzas_eventos exactos a aplicar
-- ============================================================================

ALTER TABLE finanzas_cursos
  ADD COLUMN modo_simulacion TEXT NOT NULL DEFAULT 'automatico'
    CHECK (modo_simulacion IN ('automatico', 'docente_dispara', 'curado')),
  ADD COLUMN eventos_curados UUID[] NULL;

COMMENT ON COLUMN finanzas_cursos.modo_simulacion IS
  'Cómo se aplican los finanzas_eventos económicos en la simulación. automatico=aleatorio. docente_dispara=el docente lanza cada uno. curado=lista fija de finanzas_eventos elegidos por el docente.';
COMMENT ON COLUMN finanzas_cursos.eventos_curados IS
  'Si modo_simulacion=curado, arreglo de UUIDs de la tabla finanzas_eventos que se van a aplicar (en orden). NULL para los otros modos.';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 011_fix_rls_recursion_casos.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 012_admin_y_google_oauth.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- ADMIN del sistema + soporte para login con Google OAuth
--
-- 1. Agrega columna `es_admin` a `finanzas_perfiles` (flag separado del rol; un admin
--    también puede ser docente o estudiante simultáneamente).
-- 2. Función helper SECURITY DEFINER `es_admin_actual()` para usar en RLS
--    sin recursión.
-- 3. Políticas RLS que permiten al admin ver y modificar TODO.
-- 4. Mejora el trigger `crear_perfil_al_registrarse` para que también
--    funcione cuando el usuario se registra con Google OAuth (que envía
--    metadata distinta: name, given_name, family_name).
-- ============================================================================

-- ─── 1. Columna es_admin ────────────────────────────────────────────────────
ALTER TABLE finanzas_perfiles
  ADD COLUMN es_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_perfiles_es_admin ON finanzas_perfiles(es_admin) WHERE es_admin = TRUE;

COMMENT ON COLUMN finanzas_perfiles.es_admin IS
  'Flag de super-usuario. Independiente del rol. Un admin puede ver y modificar todo el sistema.';

-- ─── 2. Función helper ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.es_admin_actual()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT es_admin FROM finanzas_perfiles WHERE id = auth.uid()),
    FALSE
  );
$$;

COMMENT ON FUNCTION public.es_admin_actual() IS
  'Devuelve TRUE si el usuario autenticado tiene es_admin=TRUE. Pensada para usarse en políticas RLS sin recursión.';

-- ─── 3. Políticas RLS para admin ────────────────────────────────────────────
-- Estas políticas se SUMAN a las existentes (Postgres aplica OR entre
-- políticas SELECT). No quitan ningún permiso a docente/estudiante normal.

-- Admin ve todos los finanzas_perfiles
CREATE POLICY "perfiles_admin_ve_todo"
  ON finanzas_perfiles FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

-- Admin puede actualizar cualquier perfil (cambiar rol, marcar admin, etc.)
CREATE POLICY "perfiles_admin_actualiza"
  ON finanzas_perfiles FOR UPDATE
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());

-- Admin ve todos los finanzas_cursos
CREATE POLICY "cursos_admin_ve_todo"
  ON finanzas_cursos FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

-- Admin puede actualizar/borrar finanzas_cursos (ej. limpiar finanzas_cursos zombie)
CREATE POLICY "cursos_admin_modifica"
  ON finanzas_cursos FOR UPDATE
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());

CREATE POLICY "cursos_admin_borra"
  ON finanzas_cursos FOR DELETE
  TO authenticated
  USING (public.es_admin_actual());

-- Admin ve todos los finanzas_proyectos
CREATE POLICY "proyectos_admin_ve_todo"
  ON finanzas_proyectos FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

-- Admin ve todas las finanzas_entregas y puede revisarlas
CREATE POLICY "entregas_admin_ve_todo"
  ON finanzas_entregas FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

CREATE POLICY "entregas_admin_revisa"
  ON finanzas_entregas FOR UPDATE
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());

-- Admin ve todas las finanzas_inscripciones
CREATE POLICY "inscripciones_admin_ve_todo"
  ON finanzas_inscripciones FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

CREATE POLICY "inscripciones_admin_borra"
  ON finanzas_inscripciones FOR DELETE
  TO authenticated
  USING (public.es_admin_actual());

-- ─── 4. Trigger mejorado para soportar Google OAuth ─────────────────────────
-- Google envía metadata con campos diferentes al registro normal:
--   - name (nombre completo)
--   - given_name (nombre de pila)
--   - family_name (apellido)
--   - picture (URL avatar)
-- El trigger ahora prueba los campos en orden de preferencia.
CREATE OR REPLACE FUNCTION public.crear_perfil_al_registrarse()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre TEXT;
  v_apellido TEXT;
  v_rol TEXT;
BEGIN
  -- Nombre: registro normal → Google given_name → primera palabra de name → email → fallback
  v_nombre := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'nombre', ''),
    NULLIF(NEW.raw_user_meta_data->>'given_name', ''),
    NULLIF(SPLIT_PART(NEW.raw_user_meta_data->>'name', ' ', 1), ''),
    NULLIF(SPLIT_PART(NEW.email, '@', 1), ''),
    'Sin nombre'
  );

  -- Apellido: registro normal → Google family_name → resto del 'name' → vacío
  v_apellido := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'apellido', ''),
    NULLIF(NEW.raw_user_meta_data->>'family_name', ''),
    NULLIF(
      TRIM(SUBSTRING(NEW.raw_user_meta_data->>'name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'name'))),
      ''
    ),
    ''
  );

  -- Rol: lo que mandó el registro o 'estudiante' por defecto.
  -- La columna rol es TEXT con CHECK (rol IN ('docente', 'estudiante')),
  -- no un enum, así que insertamos directo como string.
  v_rol := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'rol', ''),
    'estudiante'
  );
  -- Defensa: si vino un valor inválido (ej. de Google), forzamos estudiante
  IF v_rol NOT IN ('docente', 'estudiante') THEN
    v_rol := 'estudiante';
  END IF;

  INSERT INTO public.finanzas_perfiles (id, email, nombre, apellido, rol, universidad)
  VALUES (
    NEW.id,
    NEW.email,
    v_nombre,
    v_apellido,
    v_rol,
    NEW.raw_user_meta_data->>'universidad'
  );
  RETURN NEW;
END;
$$;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 013_grupos_y_ponderacion.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 13 — Proyectos GRUPALES + ponderación de la nota final
--
-- Resumen del modelo:
--   * El docente crea GRUPOS dentro de un curso, cada uno con un cupo máximo y
--     un PROYECTO COMPARTIDO (predefinido por el docente; los alumnos lo llenan).
--   * Los estudiantes inscritos se UNEN a un grupo (hasta llenar el cupo) y
--     editan todos el mismo proyecto compartido (último guardado gana).
--   * El docente evalúa el proyecto grupal y le pone UNA nota a todo el grupo.
--   * La NOTA FINAL del estudiante = peso_individual × promedio_individual
--                                   + peso_grupal    × nota_grupal
--     Los pesos los define el docente por curso.
-- ============================================================================

-- ─── 1. Ponderación a nivel curso ──────────────────────────────────────────
-- Pesos en decimal (0..1). Por defecto 50/50. La nota final pondera el
-- promedio de finanzas_entregas individuales contra la nota del proyecto grupal.
ALTER TABLE finanzas_cursos
  ADD COLUMN peso_individual NUMERIC NOT NULL DEFAULT 0.5
    CHECK (peso_individual >= 0 AND peso_individual <= 1),
  ADD COLUMN peso_grupal NUMERIC NOT NULL DEFAULT 0.5
    CHECK (peso_grupal >= 0 AND peso_grupal <= 1);

COMMENT ON COLUMN finanzas_cursos.peso_individual IS
  'Peso (0..1) del promedio de finanzas_entregas individuales en la nota final del estudiante.';
COMMENT ON COLUMN finanzas_cursos.peso_grupal IS
  'Peso (0..1) de la nota del proyecto grupal en la nota final del estudiante.';

-- ─── 2. Tabla `finanzas_grupos` ─────────────────────────────────────────────────────
CREATE TABLE finanzas_grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES finanzas_cursos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cupo_max INT NOT NULL DEFAULT 4 CHECK (cupo_max >= 1 AND cupo_max <= 50),
  -- Proyecto compartido del grupo (lo crea el docente, lo editan los miembros).
  proyecto_id UUID NULL REFERENCES finanzas_proyectos(id) ON DELETE SET NULL,
  -- Evaluación del grupo (la pone el docente; la ven todos los miembros).
  nota INT NULL CHECK (nota IS NULL OR (nota BETWEEN 0 AND 100)),
  comentario_docente TEXT NULL,
  revisado_en TIMESTAMPTZ NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grupos_curso ON finanzas_grupos(curso_id);
CREATE INDEX idx_grupos_proyecto ON finanzas_grupos(proyecto_id);

COMMENT ON TABLE finanzas_grupos IS
  'Grupo de trabajo dentro de un curso. Tiene un proyecto compartido y una nota grupal.';

-- ─── 3. Tabla `finanzas_grupo_miembros` ─────────────────────────────────────────────
CREATE TABLE finanzas_grupo_miembros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES finanzas_grupos(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES finanzas_perfiles(id) ON DELETE CASCADE,
  unido_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grupo_id, estudiante_id)
);

CREATE INDEX idx_grupo_miembros_grupo ON finanzas_grupo_miembros(grupo_id);
CREATE INDEX idx_grupo_miembros_estudiante ON finanzas_grupo_miembros(estudiante_id);

COMMENT ON TABLE finanzas_grupo_miembros IS
  'Integrantes de cada grupo. El cupo máximo se valida en la app antes de insertar.';

-- ─── 4. Proyecto compartido: nuevo tipo + vínculo al grupo ─────────────────
ALTER TABLE finanzas_proyectos
  ADD COLUMN grupo_id UUID NULL REFERENCES finanzas_grupos(id) ON DELETE CASCADE;

CREATE INDEX idx_proyectos_grupo ON finanzas_proyectos(grupo_id);

-- Ampliar el CHECK de `tipo` para incluir 'proyecto_grupal'.
ALTER TABLE finanzas_proyectos DROP CONSTRAINT IF EXISTS proyectos_tipo_check;
ALTER TABLE finanzas_proyectos
  ADD CONSTRAINT proyectos_tipo_check
  CHECK (tipo IN ('libre', 'caso_curso', 'entrega_estudiante', 'proyecto_grupal'));

COMMENT ON COLUMN finanzas_proyectos.grupo_id IS
  'Si está seteado, este proyecto es el proyecto COMPARTIDO de ese grupo (tipo=proyecto_grupal).';

-- ─── 5. RLS: finanzas_grupos ────────────────────────────────────────────────────────
ALTER TABLE finanzas_grupos ENABLE ROW LEVEL SECURITY;

-- Docente del curso: control total de sus finanzas_grupos.
CREATE POLICY "grupos_docente_curso"
  ON finanzas_grupos FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM finanzas_cursos c WHERE c.id = finanzas_grupos.curso_id AND c.docente_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM finanzas_cursos c WHERE c.id = finanzas_grupos.curso_id AND c.docente_id = auth.uid())
  );

-- Estudiante inscrito en el curso: puede VER los finanzas_grupos (para unirse / ver nota).
CREATE POLICY "grupos_estudiante_inscrito_lee"
  ON finanzas_grupos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_inscripciones i
      WHERE i.curso_id = finanzas_grupos.curso_id AND i.estudiante_id = auth.uid()
    )
  );

-- ─── 6. RLS: finanzas_grupo_miembros ────────────────────────────────────────────────
-- (Ninguna política consulta finanzas_grupo_miembros para evitar recursión.)
ALTER TABLE finanzas_grupo_miembros ENABLE ROW LEVEL SECURITY;

-- Estudiante se une (solo a sí mismo, y solo a finanzas_grupos de finanzas_cursos donde está inscrito).
CREATE POLICY "grupo_miembros_estudiante_se_une"
  ON finanzas_grupo_miembros FOR INSERT
  TO authenticated
  WITH CHECK (
    estudiante_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM finanzas_grupos g
      JOIN finanzas_inscripciones i ON i.curso_id = g.curso_id
      WHERE g.id = finanzas_grupo_miembros.grupo_id AND i.estudiante_id = auth.uid()
    )
  );

-- Estudiante se sale de su propio grupo.
CREATE POLICY "grupo_miembros_estudiante_se_sale"
  ON finanzas_grupo_miembros FOR DELETE
  TO authenticated
  USING (estudiante_id = auth.uid());

-- Estudiante ve los integrantes de finanzas_grupos de finanzas_cursos en los que está inscrito.
CREATE POLICY "grupo_miembros_estudiante_lee"
  ON finanzas_grupo_miembros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_grupos g
      JOIN finanzas_inscripciones i ON i.curso_id = g.curso_id
      WHERE g.id = finanzas_grupo_miembros.grupo_id AND i.estudiante_id = auth.uid()
    )
  );

-- Docente del curso ve los integrantes.
CREATE POLICY "grupo_miembros_docente_lee"
  ON finanzas_grupo_miembros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_grupos g
      JOIN finanzas_cursos c ON c.id = g.curso_id
      WHERE g.id = finanzas_grupo_miembros.grupo_id AND c.docente_id = auth.uid()
    )
  );

-- ─── 7. RLS: finanzas_proyectos — acceso de los miembros al proyecto compartido ─────
-- El proyecto grupal lo INSERTA el docente (estudiante_id = docente = auth.uid()),
-- cubierto por la política existente "proyectos_estudiante_propio". Acá damos a
-- los MIEMBROS permiso de leer y editar el proyecto compartido de su grupo.
CREATE POLICY "proyectos_miembro_grupo_lee"
  ON finanzas_proyectos FOR SELECT
  TO authenticated
  USING (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM finanzas_grupo_miembros gm
      WHERE gm.grupo_id = finanzas_proyectos.grupo_id AND gm.estudiante_id = auth.uid()
    )
  );

CREATE POLICY "proyectos_miembro_grupo_edita"
  ON finanzas_proyectos FOR UPDATE
  TO authenticated
  USING (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM finanzas_grupo_miembros gm
      WHERE gm.grupo_id = finanzas_proyectos.grupo_id AND gm.estudiante_id = auth.uid()
    )
  )
  WITH CHECK (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM finanzas_grupo_miembros gm
      WHERE gm.grupo_id = finanzas_proyectos.grupo_id AND gm.estudiante_id = auth.uid()
    )
  );

-- ─── 8. RLS: finanzas_perfiles — ver a los COMPAÑEROS de mi grupo ────────────────────
-- Hoy un estudiante solo lee su propio perfil. Para mostrar los integrantes del
-- grupo necesita leer el perfil de sus compañeros (no de todo el curso).
CREATE POLICY "perfiles_companeros_de_grupo"
  ON finanzas_perfiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_grupo_miembros mio
      JOIN finanzas_grupo_miembros otro ON otro.grupo_id = mio.grupo_id
      WHERE mio.estudiante_id = auth.uid() AND otro.estudiante_id = finanzas_perfiles.id
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 014_curso_permite_proyecto_libre.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 14 — Opción por curso: "el estudiante elige y arma su propio proyecto"
--
-- Hasta ahora, dentro de un curso el estudiante solo podía TOMAR un caso que el
-- docente dejaba fijo (tipo y modelo predefinidos). Esta bandera permite que el
-- docente habilite que cada estudiante CREE su propio proyecto individual,
-- eligiendo el tipo de análisis (V1/V2) y el modelo de ingreso que mejor se
-- ajuste a su idea — pero siempre dentro del curso (no finanzas_proyectos sueltos).
--
-- Default TRUE: la opción más flexible. El docente puede desmarcarla si quiere
-- que todos trabajen sobre su caso/plantilla.
-- ============================================================================

ALTER TABLE finanzas_cursos
  ADD COLUMN permite_proyecto_libre BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN finanzas_cursos.permite_proyecto_libre IS
  'Si TRUE, los estudiantes del curso pueden crear su propio proyecto individual (eligen V1/V2 y modelo de ingreso). Si FALSE, solo trabajan los casos del docente.';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 015_grupos_liderados_por_estudiante.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 016_entregas_por_paso.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 16 — Entregas por PASO (promedio simple, sin pesos)
--
-- Antes, el alumno entregaba el proyecto entero una sola vez al final. Ahora
-- puede entregar cada paso por separado y el docente lo califica por paso.
-- La nota individual del alumno es el promedio SIMPLE de las notas de sus
-- finanzas_entregas (no importa cuántas etapas entregó: todas pesan igual). Luego, la
-- nota final del estudiante se calcula como ya estaba:
--    nota_final = peso_individual × promedio_individual + peso_grupal × nota_grupal
--
-- Las finanzas_entregas viejas (sin paso) siguen siendo válidas: tienen paso_entregado
-- NULL y se interpretan como "entrega final del proyecto entero".
-- ============================================================================

-- Nuevo campo en finanzas_entregas: a qué paso pertenece la entrega.
ALTER TABLE finanzas_entregas
  ADD COLUMN paso_entregado INT NULL
    CHECK (paso_entregado IS NULL OR (paso_entregado BETWEEN 1 AND 9));

CREATE INDEX idx_entregas_paso ON finanzas_entregas(paso_entregado)
  WHERE paso_entregado IS NOT NULL;

COMMENT ON COLUMN finanzas_entregas.paso_entregado IS
  'Paso (1..9) que se entrega. NULL = entrega del proyecto entero (legacy o final).';

-- Permite que un mismo proyecto tenga varios intentos POR PASO. La unicidad
-- ahora es (proyecto, paso, intento). Las finanzas_entregas viejas con paso_entregado
-- NULL mantienen su numero_intento único.
ALTER TABLE finanzas_entregas DROP CONSTRAINT IF EXISTS entregas_proyecto_id_numero_intento_key;
ALTER TABLE finanzas_entregas
  ADD CONSTRAINT entregas_proyecto_paso_intento_unico
  UNIQUE (proyecto_id, paso_entregado, numero_intento);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 017_entregas_grupales_distribuidas.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 17 — Las finanzas_entregas GRUPALES cuentan para todos los miembros del grupo
--
-- Cuando un alumno del grupo entrega el proyecto compartido, esa entrega
-- (calificada por el docente) tiene que aportar al promedio individual de
-- TODOS los integrantes del grupo (no solo del que clickeó "Entregar").
--
-- Para lograrlo sin duplicar filas, se reescribe la vista promedio_estudiante:
--   - Entregas de finanzas_proyectos individuales (sin grupo_id): cuentan SOLO para
--     el estudiante que entregó.
--   - Entregas de finanzas_proyectos grupales (con grupo_id): cuentan para CADA miembro
--     del grupo en el momento de la consulta.
-- ============================================================================

DROP VIEW IF EXISTS promedio_estudiante;

CREATE VIEW promedio_estudiante AS
WITH entregas_por_estudiante AS (
  -- Entregas individuales: solo cuentan para el alumno que entregó
  SELECT
    e.estudiante_id,
    e.curso_id,
    e.id AS entrega_id,
    e.nota,
    e.estado,
    e.entregado_en
  FROM finanzas_entregas e
  JOIN finanzas_proyectos p ON p.id = e.proyecto_id
  WHERE p.grupo_id IS NULL

  UNION

  -- Entregas grupales: cuentan para cada miembro del grupo
  SELECT
    gm.estudiante_id,
    e.curso_id,
    e.id AS entrega_id,
    e.nota,
    e.estado,
    e.entregado_en
  FROM finanzas_entregas e
  JOIN finanzas_proyectos p ON p.id = e.proyecto_id
  JOIN finanzas_grupo_miembros gm ON gm.grupo_id = p.grupo_id
  WHERE p.grupo_id IS NOT NULL
)
SELECT
  estudiante_id,
  curso_id,
  COUNT(*) FILTER (WHERE nota IS NOT NULL) AS entregas_revisadas,
  COUNT(*) FILTER (WHERE estado = 'pendiente') AS entregas_pendientes,
  ROUND(AVG(nota) FILTER (WHERE nota IS NOT NULL), 2) AS promedio_nota,
  MAX(nota) FILTER (WHERE nota IS NOT NULL) AS mejor_nota,
  MIN(nota) FILTER (WHERE nota IS NOT NULL) AS peor_nota,
  MAX(entregado_en) AS ultima_entrega_en
FROM entregas_por_estudiante
GROUP BY estudiante_id, curso_id;

COMMENT ON VIEW promedio_estudiante IS
  'Promedio simple de notas por estudiante por curso. Una entrega grupal aporta su nota al promedio de TODOS los miembros del grupo.';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 018_endurecimiento_seguridad.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 18 — ENDURECIMIENTO DE SEGURIDAD (pre-lanzamiento)
--
-- Cierra 3 huecos de RLS que permitirían a un estudiante malicioso (usando
-- la anon key directamente, sin pasar por la app) hacer trampa o escalar
-- privilegios:
--
--   1. 🔴 ESCALADA DE PRIVILEGIOS: el estudiante podía hacer
--         UPDATE finanzas_perfiles SET rol='docente', es_admin=true WHERE id=auth.uid()
--      porque la política perfiles_self_update no restringía qué columnas se
--      pueden cambiar (el comentario decía "excepto rol" pero no lo aplicaba).
--
--   2. 🔴 FALSIFICACIÓN DE NOTAS (vía INSERT): el estudiante podía insertar una
--      entrega con estado='aprobada' y nota=100, inflando su promedio real
--      (la vista promedio_estudiante cuenta finanzas_entregas.nota).
--
--   3. 🟡 FALSIFICACIÓN DEL PODIO (vía INSERT de grupo): el estudiante podía
--      crear un grupo con nota=100 y aparecer como campeón en el podio.
--
-- Las rutas legítimas de la app NO se rompen: entregarProyecto() ya inserta
-- estado='pendiente' sin nota, y crearGrupoEstudiante() no setea nota.
-- ============================================================================


-- ─── 1. Bloquear escalada de privilegios en finanzas_perfiles ────────────────────────
-- Estrategia: un trigger BEFORE UPDATE que, si el que actualiza NO es admin,
-- fuerza rol y es_admin a sus valores anteriores. A prueba de balas: no
-- importa qué mande el cliente, estos dos campos no cambian salvo que un
-- admin lo haga (desde el panel admin). El resto de campos (nombre, apellido,
-- email, universidad) se siguen pudiendo editar normalmente.

CREATE OR REPLACE FUNCTION public.proteger_campos_sensibles_perfil()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.es_admin_actual() THEN
    NEW.rol := OLD.rol;
    NEW.es_admin := OLD.es_admin;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.proteger_campos_sensibles_perfil() IS
  'Impide que un usuario no-admin cambie su propio rol o es_admin. Se ejecuta BEFORE UPDATE en finanzas_perfiles.';

DROP TRIGGER IF EXISTS trg_proteger_perfil ON finanzas_perfiles;
CREATE TRIGGER trg_proteger_perfil
  BEFORE UPDATE ON finanzas_perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.proteger_campos_sensibles_perfil();


-- ─── 2. Impedir que el estudiante inserte finanzas_entregas YA calificadas ───────────
-- El estudiante solo puede crear finanzas_entregas 'pendiente' y sin nota. El docente
-- (o el admin) asigna nota/estado vía UPDATE (políticas existentes).

DROP POLICY IF EXISTS "entregas_estudiante_inserta_propio" ON finanzas_entregas;
CREATE POLICY "entregas_estudiante_inserta_propio"
  ON finanzas_entregas FOR INSERT
  TO authenticated
  WITH CHECK (
    estudiante_id = auth.uid()
    AND estado = 'pendiente'
    AND nota IS NULL
    AND comentario_docente IS NULL
    AND revisado_en IS NULL
  );


-- ─── 3. Impedir que el estudiante cree un grupo YA calificado ───────────────
-- Mantiene la validación original (inscrito + grupo habilitado) y agrega que
-- el grupo nazca sin nota. La nota grupal la pone el docente vía UPDATE.

DROP POLICY IF EXISTS "grupos_estudiante_crea" ON finanzas_grupos;
CREATE POLICY "grupos_estudiante_crea"
  ON finanzas_grupos FOR INSERT
  TO authenticated
  WITH CHECK (
    nota IS NULL
    AND comentario_docente IS NULL
    AND revisado_en IS NULL
    AND EXISTS (
      SELECT 1 FROM finanzas_cursos c
      JOIN finanzas_inscripciones i ON i.curso_id = c.id
      WHERE c.id = finanzas_grupos.curso_id
        AND i.estudiante_id = auth.uid()
        AND c.grupo_habilitado = TRUE
    )
  );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 019_normalizar_universidad.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 19 — Normalización de universidades existentes
--
-- Antes el campo finanzas_perfiles.universidad era texto libre. Resultado: la misma
-- universidad aparecía 3 veces ("ucatec", "Ucatec", "UCATEC") en el panel
-- del docente.
--
-- A partir de ahora la app normaliza al guardar (helper normalizarUniversidad:
-- trim + UPPERCASE). Esta migración hace lo mismo de un solo golpe a las
-- filas ya cargadas, dejando todo consistente.
-- ============================================================================

UPDATE finanzas_perfiles
SET universidad = UPPER(TRIM(universidad))
WHERE universidad IS NOT NULL
  AND universidad <> UPPER(TRIM(universidad));


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 020_universidad_en_curso.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 20 — La universidad vive en el CURSO, no en el perfil del estudiante
--
-- Antes cada estudiante escribía su universidad al registrarse en texto
-- libre. Resultado: 3 variantes de la misma ('ucatec', 'Ucatec', 'UCATEC')
-- en el panel de inscritos del docente.
--
-- A partir de ahora el docente define la universidad al crear el curso.
-- Todos los inscritos heredan esa universidad para esa clase. Una sola
-- fuente de verdad, sin variantes.
--
-- La columna finanzas_perfiles.universidad sigue existiendo (por compatibilidad y
-- por si la app la quiere mostrar en el perfil del alumno), pero ya NO
-- se llena en el registro nuevo.
-- ============================================================================

ALTER TABLE finanzas_cursos
  ADD COLUMN IF NOT EXISTS universidad TEXT NULL;

COMMENT ON COLUMN finanzas_cursos.universidad IS
  'Universidad a la que pertenece este curso (definida por el docente al crearlo). Reemplaza el campo libre por estudiante en finanzas_perfiles.universidad.';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 021_indices_consultas_calientes.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 21 — Índices compuestos para las consultas calientes
--
-- Las pantallas "Mis finanzas_entregas", el Podio y la revisión masiva filtran finanzas_entregas
-- por (estudiante_id, curso_id) y ordenan por entregado_en. Hoy solo hay
-- índices de columna única, así que Postgres escanea uno y filtra el resto.
-- Estos índices compuestos hacen esas consultas directas.
--
-- IF NOT EXISTS: seguro de re-ejecutar; no rompe si ya existen.
-- ============================================================================

-- Entregas por (estudiante, curso) ordenadas por fecha — usado en Mis finanzas_entregas,
-- podio (racha) y promedios.
CREATE INDEX IF NOT EXISTS idx_entregas_est_curso_fecha
  ON finanzas_entregas (estudiante_id, curso_id, entregado_en DESC);

-- Entregas por (proyecto, paso) — usado al calcular el próximo numero_intento
-- en cada entrega por etapa.
CREATE INDEX IF NOT EXISTS idx_entregas_proyecto_paso
  ON finanzas_entregas (proyecto_id, paso_entregado);

-- Miembros por grupo — usado en el podio grupal y al listar integrantes.
CREATE INDEX IF NOT EXISTS idx_grupo_miembros_grupo
  ON finanzas_grupo_miembros (grupo_id, estudiante_id);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 022_lanzador_eventos_docente.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 22 — LANZADOR DE SITUACIONES EN VIVO (docente dispara finanzas_eventos al curso)
--
-- El modo 'docente_dispara' estaba declarado pero sin implementación. Esta
-- migración agrega la infraestructura para que el docente pueda elegir un
-- evento del catálogo y dispararlo a TODOS los alumnos con simulación activa
-- en un curso, en tiempo real.
--
-- Cómo funciona:
--  1. El docente clickea "Lanzar" en un evento.
--  2. Se inserta un registro en finanzas_eventos_disparados (auditoría).
--  3. Se setea evento_forzado_id en TODAS las finanzas_simulaciones activas de ese
--     curso.
--  4. El alumno, al refrescar/cargar, ve ese evento en lugar del sorteo
--     normal del motor.
--  5. Cuando el alumno decide y avanza, evento_forzado_id se limpia.
-- ============================================================================

-- ─── 1. Auditoría de disparos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS finanzas_eventos_disparados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES finanzas_cursos(id) ON DELETE CASCADE,
  evento_id TEXT NOT NULL,
  disparado_por UUID NOT NULL REFERENCES finanzas_perfiles(id) ON DELETE CASCADE,
  disparado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  simulaciones_afectadas INT NOT NULL DEFAULT 0,
  nota TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_eventos_disparados_curso_fecha
  ON finanzas_eventos_disparados (curso_id, disparado_en DESC);

COMMENT ON TABLE finanzas_eventos_disparados IS
  'Histórico de finanzas_eventos que un docente disparó a todo su curso (modo docente_dispara). Es solo auditoría — la lógica real vive en finanzas_simulaciones.evento_forzado_id.';

-- ─── 2. Campo de evento forzado en finanzas_simulaciones ──────────────────────────────
ALTER TABLE finanzas_simulaciones
  ADD COLUMN IF NOT EXISTS evento_forzado_id TEXT NULL;

COMMENT ON COLUMN finanzas_simulaciones.evento_forzado_id IS
  'Si está seteado, el motor del alumno usa ESE evento en el próximo turno en lugar del sorteo aleatorio. Lo limpia al avanzar el turno.';

-- ─── 3. RLS — finanzas_eventos_disparados ────────────────────────────────────────────
ALTER TABLE finanzas_eventos_disparados ENABLE ROW LEVEL SECURITY;

-- El docente del curso puede insertar disparos.
CREATE POLICY "eventos_disparados_docente_inserta"
  ON finanzas_eventos_disparados FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM finanzas_cursos
      WHERE finanzas_cursos.id = finanzas_eventos_disparados.curso_id
        AND finanzas_cursos.docente_id = auth.uid()
    )
  );

-- El docente del curso puede leer su histórico.
CREATE POLICY "eventos_disparados_docente_lee"
  ON finanzas_eventos_disparados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_cursos
      WHERE finanzas_cursos.id = finanzas_eventos_disparados.curso_id
        AND finanzas_cursos.docente_id = auth.uid()
    )
  );

-- Los alumnos inscritos pueden leer el histórico (transparencia).
CREATE POLICY "eventos_disparados_alumno_lee"
  ON finanzas_eventos_disparados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM finanzas_inscripciones
      WHERE finanzas_inscripciones.curso_id = finanzas_eventos_disparados.curso_id
        AND finanzas_inscripciones.estudiante_id = auth.uid()
    )
  );

-- Admin puede ver y limpiar todo.
CREATE POLICY "eventos_disparados_admin_todo"
  ON finanzas_eventos_disparados FOR ALL
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 023_tipos_proyecto_simulables.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- FASE 23 — TIPOS DE PROYECTO SIMULABLES EN EL CURSO
--
-- El docente define qué tipos de proyecto se pueden simular en su curso. El
-- selector "Simular" del alumno respeta esa configuración: solo aparecen los
-- finanzas_proyectos cuyo tipo está habilitado. El lanzador de finanzas_eventos también filtra
-- el alcance según estos flags.
--
-- Defaults pedagógicos:
--   - Caso del curso: TRUE (el típico — todos analizan el mismo).
--   - Individual: FALSE (el alumno construye, pero no simula su propio
--     proyecto a menos que el docente lo habilite).
--   - Grupal: TRUE (cuando el grupo está habilitado, es esperable simularlo).
-- ============================================================================

ALTER TABLE finanzas_cursos
  ADD COLUMN IF NOT EXISTS simulacion_caso_curso BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS simulacion_individual BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS simulacion_grupal BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN finanzas_cursos.simulacion_caso_curso IS
  'Si TRUE, los alumnos pueden simular el caso del curso (entrega_estudiante con caso_origen_id).';
COMMENT ON COLUMN finanzas_cursos.simulacion_individual IS
  'Si TRUE, los alumnos pueden simular su proyecto individual (libre, sin caso_origen_id ni grupo_id).';
COMMENT ON COLUMN finanzas_cursos.simulacion_grupal IS
  'Si TRUE, los alumnos pueden simular el proyecto grupal del grupo al que pertenecen.';

