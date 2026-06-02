-- ════════════════════════════════════════════════════════════════════════════
-- Migración Supabase — Modalidad de titulación (UNIFRANZ y futuras universidades)
-- ════════════════════════════════════════════════════════════════════════════
--
-- Agrega la columna `modalidad_titulacion` a la tabla `proyectos`.
--
-- Esta columna distingue entre las modalidades oficiales de titulación de cada
-- universidad. Hoy la usa UNIFRANZ Cochabamba para sus 5 modalidades:
--   - unifranz-tesis
--   - unifranz-pg-prefactibilidad
--   - unifranz-pg-mejora-org
--   - unifranz-pg-artefacto
--   - unifranz-trabajo-dirigido
--
-- IDs válidos viven en src/lib/proyectoGrado/unifranz/modalidades.ts.
-- Para proyectos UMSS, UCB, UCATEC y demás, queda NULL.
--
-- Sin esta migración el insert falla con:
--   "Could not find the 'modalidad_titulacion' column of 'proyectos'"
-- como ocurre al cargar el demo AgroHub o al crear proyectos UNIFRANZ.
--
-- Ejecutar UNA SOLA VEZ en Supabase Studio → SQL Editor → New query → Run.
-- Es idempotente: se puede correr varias veces sin riesgo.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.proyectos
  add column if not exists modalidad_titulacion text;

comment on column public.proyectos.modalidad_titulacion is
  'ID de la modalidad de titulación (UNIFRANZ por ahora). NULL para proyectos que no usan modalidades específicas. IDs válidos en src/lib/proyectoGrado/unifranz/modalidades.ts.';

-- Refrescar el cache del esquema PostgREST para que Supabase reconozca la columna nueva inmediatamente.
notify pgrst, 'reload schema';
