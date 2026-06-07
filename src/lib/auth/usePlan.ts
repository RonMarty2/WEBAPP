'use client';

/**
 * Hook ligero que devuelve el plan del usuario logueado.
 * Útil para gating de features que solo aplican a Pro/Elite (ej. el
 * pre-llenado automático de títulos entre módulos: Pro lo tiene, Estándar
 * — los alumnos de cátedra — no, así aprenden el flujo a mano).
 *
 * Cache compartida en memoria + sessionStorage para evitar pegarle a
 * `/api/auth/me` en cada vista. La cache se invalida con el evento
 * `auth-plan-cambio` que dispara `AdminPlanSwitcher` al rotar el JWT.
 *
 * Roles `admin` y `docente` se tratan como Pro por defecto — son los
 * roles internos del dueño del SaaS y deben ver la experiencia premium
 * para evaluarla.
 */

import { useEffect, useState } from 'react';
import type { UserPlan } from '@/lib/auth';

const CACHE_KEY = 'plan-actual';
const TTL_MS = 60_000;

interface CacheEntry { plan: UserPlan; ts: number }
let cache: CacheEntry | null = null;
let pending: Promise<UserPlan> | null = null;

const ROLES_PREMIUM = new Set(['admin', 'docente']);

async function cargar(): Promise<UserPlan> {
  if (cache && Date.now() - cache.ts < TTL_MS) return cache.plan;
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed: CacheEntry = JSON.parse(raw);
        if (Date.now() - parsed.ts < TTL_MS) {
          cache = parsed;
          return parsed.plan;
        }
      }
    } catch { /* ignore */ }
  }
  if (pending) return pending;
  pending = (async () => {
    try {
      const r = await fetch(`/api/auth/me?t=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!r.ok) return 'estandar' as UserPlan;
      const d = await r.json();
      const role = d?.user?.role;
      const planRaw = d?.user?.plan;
      // admin/docente siempre ven la experiencia Pro
      const plan: UserPlan = ROLES_PREMIUM.has(role) ? 'pro' : (planRaw ?? 'estandar');
      cache = { plan, ts: Date.now() };
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch { /* ignore */ }
      return plan;
    } catch {
      return 'estandar' as UserPlan;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

/**
 * Devuelve el plan actual del usuario, o null mientras carga.
 * Se actualiza cuando el admin cambia su plan en caliente.
 */
export function usePlan(): UserPlan | null {
  const [plan, setPlan] = useState<UserPlan | null>(null);

  useEffect(() => {
    let cancelado = false;
    cargar().then((p) => { if (!cancelado) setPlan(p); });
    const onChange = () => {
      cache = null;
      try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
      cargar().then((p) => { if (!cancelado) setPlan(p); });
    };
    window.addEventListener('auth-plan-cambio', onChange);
    return () => {
      cancelado = true;
      window.removeEventListener('auth-plan-cambio', onChange);
    };
  }, []);

  return plan;
}

/** Helper: ¿este plan tiene auto-conexión entre módulos? */
export function esPremium(plan: UserPlan | null | undefined): boolean {
  return plan === 'pro' || plan === 'elite';
}
