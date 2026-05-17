-- ════════════════════════════════════════════════════════════════════════════
-- Migración Supabase — Banco de observaciones (análisis de pertinencia)
-- ════════════════════════════════════════════════════════════════════════════
--
-- Sistema que evalúa cada observación del tutor antes de aplicarla:
--   - APLICAR              → cambio pertinente, se ejecuta tras aprobación
--   - APLICAR_CON_RESERVA  → cambio pertinente pero con caveat
--   - RECHAZAR             → no es pertinente, se genera justificación para
--                            que el estudiante defienda ante el tutor
--
-- Cada análisis se guarda acá para construir conocimiento acumulado del SaaS.
--
-- Ejecutar UNA SOLA VEZ en:
--   https://supabase.com/dashboard/project/svaswbryumacbirecvjt/sql/new
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.observaciones_banco (
  id                       uuid primary key default gen_random_uuid(),
  proyecto_id              text not null,
  fase_id                  text not null,
  servicio_id              text,                  -- mono-001, tesis-001, etc.

  -- Lo que dijo el tutor
  observacion_textual      text not null,
  patron_detectado         text,                  -- "cambio_titulo", "agregar_seccion", etc.

  -- Análisis de la IA
  decision                 text not null check (decision in (
    'aplicar', 'aplicar_con_reserva', 'rechazar'
  )),
  analisis_ia              text not null,         -- razonamiento del analizador
  justificacion_para_tutor text,                  -- argumento defendible (cuando rechaza)

  -- Cambio aplicado (si decision = aplicar / aplicar_con_reserva)
  contenido_antes          text,
  contenido_despues        text,
  aplicado_at              timestamptz,           -- null si aún no se aplicó

  -- Trazabilidad
  modelo_ia_usado          text,                  -- "claude-opus-4-7", etc.
  duracion_analisis_ms     integer,
  created_at               timestamptz not null default now()
);

-- Índices para queries comunes
create index if not exists observaciones_banco_proyecto_idx
  on public.observaciones_banco (proyecto_id, created_at desc);

create index if not exists observaciones_banco_patron_idx
  on public.observaciones_banco (patron_detectado)
  where patron_detectado is not null;

create index if not exists observaciones_banco_decision_idx
  on public.observaciones_banco (decision);

-- RLS: solo service-role accede (admin del SaaS via SUPABASE_SERVICE_ROLE_KEY)
alter table public.observaciones_banco enable row level security;

comment on table public.observaciones_banco is
  'Banco acumulado de observaciones de tutores analizadas por la IA. Cada fila representa una observación recibida, el veredicto de la IA (aplicar/rechazar/aplicar con reserva), y la justificación que se le entrega al estudiante para defender su decisión ante el tutor.';

comment on column public.observaciones_banco.decision is
  'aplicar: cambio pertinente / aplicar_con_reserva: pertinente con caveat / rechazar: no se aplica, hay justificación para defender ante el tutor';
