-- ════════════════════════════════════════════════════════════════════════════
-- Migración Supabase — PDF compilado manualmente por admin
-- ════════════════════════════════════════════════════════════════════════════
--
-- Flujo manual mientras no hay compilador LaTeX automático:
--   1. Estudiante hace click "Pedir mi PDF" → se marca pdf_solicitado_at
--   2. Admin ve la solicitud en /admin/pdf-solicitudes
--   3. Admin compila el .tex en su PC (TeXstudio/MiKTeX/Overleaf)
--   4. Admin sube el PDF → se guarda como base64 + se marca pdf_compilado_at
--   5. Estudiante ve "Descargar mi PDF" y lo descarga
--
-- Ejecutar UNA SOLA VEZ en:
--   https://supabase.com/dashboard/project/svaswbryumacbirecvjt/sql/new
-- ════════════════════════════════════════════════════════════════════════════

alter table public.proyectos
  add column if not exists pdf_solicitado_at      timestamptz,
  add column if not exists pdf_compilado_at       timestamptz,
  add column if not exists pdf_compilado_base64   text,
  add column if not exists pdf_compilado_filename text,
  add column if not exists pdf_compilado_bytes    integer,
  add column if not exists pdf_compilado_por      text;

-- Índice para listar solicitudes pendientes ordenadas
create index if not exists proyectos_pdf_solicitado_idx
  on public.proyectos (pdf_solicitado_at desc nulls last)
  where pdf_solicitado_at is not null and pdf_compilado_at is null;

comment on column public.proyectos.pdf_solicitado_at is
  'Cuándo el estudiante solicitó la compilación del PDF. NULL = no ha solicitado.';
comment on column public.proyectos.pdf_compilado_at is
  'Cuándo el admin subió el PDF compilado. NULL = aún no está listo.';
comment on column public.proyectos.pdf_compilado_base64 is
  'Contenido del PDF en base64. Se descarga a demanda. NULL si no hay PDF.';
comment on column public.proyectos.pdf_compilado_por is
  'Email del admin que subió el PDF (para auditoría).';
