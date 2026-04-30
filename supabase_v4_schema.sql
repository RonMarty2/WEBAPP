-- ============================================================
--  Laboratorio Académico SaaS — Supabase Schema V4.0
--  Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Extensiones necesarias ───────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Helper: verificar si el usuario actual es admin ─────────
create or replace function es_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.usuarios_y_creditos
    where id = auth.uid()
      and rol = 'admin'
  );
$$;

-- ============================================================
-- 1. PERFILES DE AUDIENCIA
--    Define los tipos de usuario de la plataforma.
-- ============================================================
create table if not exists public.perfiles_audiencia (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null unique,          -- 'Estudiante', 'Docente'
  descripcion text,
  created_at  timestamptz not null default now()
);

-- Datos iniciales
insert into public.perfiles_audiencia (nombre, descripcion) values
  ('Estudiante', 'Estudiantes universitarios y de posgrado'),
  ('Docente',    'Docentes, catedráticos e investigadores')
on conflict (nombre) do nothing;

-- RLS
alter table public.perfiles_audiencia enable row level security;

create policy "Lectura pública de perfiles"
  on public.perfiles_audiencia for select
  using (true);

create policy "Solo admin puede modificar perfiles"
  on public.perfiles_audiencia for all
  using (es_admin());

-- ============================================================
-- 2. SERVICIOS
--    Productos disponibles por audiencia (Monografía, Tesis…).
-- ============================================================
create table if not exists public.servicios (
  id           uuid primary key default uuid_generate_v4(),
  audiencia_id uuid not null references public.perfiles_audiencia(id) on delete cascade,
  nombre       text not null,                -- 'Monografía', 'Tesis', 'Planificación'
  descripcion  text,
  activo       boolean not null default false,
  orden        int not null default 0,        -- para ordenar en la UI
  created_at   timestamptz not null default now()
);

-- Datos iniciales (vinculados a los perfiles creados arriba)
insert into public.servicios (audiencia_id, nombre, descripcion, activo, orden)
select
  pa.id,
  s.nombre,
  s.descripcion,
  s.activo,
  s.orden
from (values
  ('Estudiante', 'Monografía',           '5 capítulos completos, bibliografía APA 7 y LaTeX', true,  1),
  ('Estudiante', 'Tesis de grado',       'Estructura y redacción para tesis de licenciatura',  false, 2),
  ('Estudiante', 'Ensayo académico',     'Ensayos argumentativos con formato institucional',   false, 3),
  ('Estudiante', 'Trabajo final',        'Proyectos de grado e informes de práctica',          false, 4),
  ('Docente',    'Planificación de clase','Planes de sesión y unidades didácticas',            false, 1),
  ('Docente',    'Rúbrica de evaluación','Rúbricas analíticas alineadas a objetivos',         false, 2),
  ('Docente',    'Material didáctico',   'Guías de estudio y fichas de trabajo',               false, 3),
  ('Docente',    'Guía de investigación','Protocolos y marcos teóricos',                      false, 4)
) as s(audiencia, nombre, descripcion, activo, orden)
join public.perfiles_audiencia pa on pa.nombre = s.audiencia
on conflict do nothing;

-- RLS
alter table public.servicios enable row level security;

create policy "Cualquier usuario autenticado puede ver servicios"
  on public.servicios for select
  to authenticated
  using (true);

create policy "Solo admin puede modificar servicios"
  on public.servicios for all
  using (es_admin());

-- ============================================================
-- 3. USUARIOS Y CRÉDITOS
--    Extiende auth.users con rol y créditos.
-- ============================================================
create table if not exists public.usuarios_y_creditos (
  id                   uuid primary key references auth.users(id) on delete cascade,
  rol                  text not null default 'user'
                         check (rol in ('admin', 'user')),
  tipo_audiencia_id    uuid references public.perfiles_audiencia(id),
  plan                 text check (plan in ('estandar', 'pro')),
  creditos_disponibles int not null default 0,
  activo               boolean not null default false,
  email                text,
  nombre               text,
  avatar_url           text,
  created_at           timestamptz not null default now(),
  activated_at         timestamptz
);

-- RLS
alter table public.usuarios_y_creditos enable row level security;

create policy "Usuario ve su propio perfil"
  on public.usuarios_y_creditos for select
  to authenticated
  using (id = auth.uid() or es_admin());

create policy "Usuario actualiza su propio perfil"
  on public.usuarios_y_creditos for update
  to authenticated
  using (id = auth.uid() or es_admin());

create policy "Admin ve y modifica todos los perfiles"
  on public.usuarios_y_creditos for all
  using (es_admin());

-- Trigger: crear registro automáticamente al registrarse en auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.usuarios_y_creditos (id, email, nombre, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. PROMPTS MAESTROS
--    Contenido de IA por servicio y fase (0 a 5).
-- ============================================================
create table if not exists public.prompts_maestros (
  id               uuid primary key default uuid_generate_v4(),
  servicio_id      uuid not null references public.servicios(id) on delete cascade,
  fase_numero      int not null check (fase_numero between 0 and 5),
  nombre_fase      text,                         -- descripción legible de la fase
  contenido_prompt text not null,
  version          int not null default 1,
  activo           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (servicio_id, fase_numero)
);

-- RLS
alter table public.prompts_maestros enable row level security;

create policy "Admin gestiona prompts maestros"
  on public.prompts_maestros for all
  using (es_admin());

create policy "Sistema puede leer prompts activos"
  on public.prompts_maestros for select
  to authenticated
  using (activo = true);

-- ============================================================
-- 5. HILOS CONDUCTORES
--    Reglas inmutables de coherencia entre fases por servicio.
-- ============================================================
create table if not exists public.hilos_conductores (
  id              uuid primary key default uuid_generate_v4(),
  servicio_id     uuid not null references public.servicios(id) on delete cascade,
  regla_inmutable text not null,
  descripcion     text,
  orden           int not null default 0,
  created_at      timestamptz not null default now()
);

-- RLS
alter table public.hilos_conductores enable row level security;

create policy "Admin gestiona hilos conductores"
  on public.hilos_conductores for all
  using (es_admin());

create policy "Sistema puede leer hilos conductores"
  on public.hilos_conductores for select
  to authenticated
  using (true);

-- ============================================================
-- 6. PROYECTOS / FASES
--    El trabajo de cada usuario: tema aprobado + contenido por fase.
-- ============================================================
create table if not exists public.proyectos_fases (
  id                uuid primary key default uuid_generate_v4(),
  usuario_id        uuid not null references auth.users(id) on delete cascade,
  servicio_id       uuid not null references public.servicios(id),

  -- Metadatos del proyecto
  tema_aprobado     text,
  titulo_provisional text,
  estado_fase       int not null default 0 check (estado_fase between 0 and 5),
  completado        boolean not null default false,

  -- Contenido generado por fase (texto completo de cada etapa)
  contenido_fase_0  text,   -- Tema / Planteamiento inicial
  contenido_fase_1  text,   -- Capítulo I
  contenido_fase_2  text,   -- Capítulo II
  contenido_fase_3  text,   -- Capítulos III-V
  contenido_fase_4  text,   -- Revisión / Compilación
  contenido_fase_5  text,   -- Entrega final / LaTeX

  -- Metadatos adicionales (JSON libre para datos estructurados por fase)
  datos_fase_0      jsonb,
  datos_fase_1      jsonb,
  datos_fase_2      jsonb,
  datos_fase_3      jsonb,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Índices de búsqueda frecuente
create index if not exists idx_proyectos_usuario on public.proyectos_fases(usuario_id);
create index if not exists idx_proyectos_servicio on public.proyectos_fases(servicio_id);
create index if not exists idx_proyectos_estado on public.proyectos_fases(completado, estado_fase);

-- RLS
alter table public.proyectos_fases enable row level security;

create policy "Usuario ve y modifica solo sus proyectos"
  on public.proyectos_fases for all
  to authenticated
  using (usuario_id = auth.uid() or es_admin());

-- Trigger: actualizar updated_at automáticamente
create or replace function actualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_proyectos_updated_at
  before update on public.proyectos_fases
  for each row execute function actualizar_updated_at();

-- ============================================================
-- 7. AUDITORÍA DE CHATS
--    Registro de cada intercambio usuario ↔ IA.
-- ============================================================
create table if not exists public.auditoria_chats (
  id              uuid primary key default uuid_generate_v4(),
  usuario_id      uuid not null references auth.users(id) on delete cascade,
  proyecto_id     uuid references public.proyectos_fases(id) on delete set null,
  fase_numero     int,
  servicio_id     uuid references public.servicios(id),
  mensaje_usuario text not null,
  respuesta_ia    text,
  modelo_usado    text,
  tokens_usados   int,
  duracion_ms     int,
  fecha           timestamptz not null default now()
);

-- Índices
create index if not exists idx_auditoria_usuario on public.auditoria_chats(usuario_id);
create index if not exists idx_auditoria_proyecto on public.auditoria_chats(proyecto_id);
create index if not exists idx_auditoria_fecha on public.auditoria_chats(fecha desc);

-- RLS
alter table public.auditoria_chats enable row level security;

create policy "Usuario ve solo su propio historial de chats"
  on public.auditoria_chats for select
  to authenticated
  using (usuario_id = auth.uid() or es_admin());

create policy "Sistema inserta chats del usuario autenticado"
  on public.auditoria_chats for insert
  to authenticated
  with check (usuario_id = auth.uid());

create policy "Admin ve toda la auditoría"
  on public.auditoria_chats for all
  using (es_admin());

-- ============================================================
-- FIN DEL SCHEMA V4.0
-- ============================================================
