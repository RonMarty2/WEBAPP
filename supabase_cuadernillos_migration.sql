-- ════════════════════════════════════════════════════════════════════════════
-- Migración Supabase — Cuadernillos del Estudiante
-- ════════════════════════════════════════════════════════════════════════════
--
-- Cuadernillo personal por capítulo: hoja de ruta privada del estudiante con
-- sugerencias, datos a buscar, preguntas probables y tips de defensa.
--
-- Es DIFERENTE al documento académico (que el tutor lee). Solo el estudiante
-- ve el cuadernillo.
--
-- Ejecutar UNA SOLA VEZ en:
--   https://supabase.com/dashboard/project/svaswbryumacbirecvjt/sql/new
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.cuadernillos_estudiante (
  id                  uuid primary key default gen_random_uuid(),
  proyecto_id         text not null,
  fase_id             text not null,
  fase_label          text not null,

  -- Contenido del cuadernillo (todo el JSON del prompt)
  resumen_capitulo            text,
  limitaciones_ia             jsonb default '[]'::jsonb,
  sugerencias_fortalecimiento jsonb default '[]'::jsonb,
  datos_a_buscar              jsonb default '[]'::jsonb,
  preguntas_tutor_probables   jsonb default '[]'::jsonb,
  errores_comunes_evitar      jsonb default '[]'::jsonb,
  tips_presentacion_oral      jsonb default '[]'::jsonb,

  -- Trazabilidad
  modelo_ia_usado     text,
  duracion_ms         integer,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Solo UN cuadernillo por fase (si se regenera, se reemplaza)
  unique (proyecto_id, fase_id)
);

create index if not exists cuadernillos_estudiante_proyecto_idx
  on public.cuadernillos_estudiante (proyecto_id, created_at desc);

alter table public.cuadernillos_estudiante enable row level security;

comment on table public.cuadernillos_estudiante is
  'Cuadernillo personal del estudiante por capítulo. Es la hoja de ruta privada con sugerencias, datos a buscar, preguntas probables del tutor y tips de defensa. NO se entrega al tutor — solo el estudiante lo ve y descarga.';
