'use client';

/**
 * Hook que devuelve el Proyecto Maestro activo del estudiante (con su título),
 * leyendo el id de localStorage y consultando /api/maestro/[id] para el título.
 *
 * Se actualiza automáticamente cuando cambia el maestro activo (escucha el
 * evento `maestro-activo-cambio` que despacha `setMaestroActivo`).
 *
 * **Cache compartido en memoria** — si la misma página monta varios `SugerirIA`,
 * todos comparten el mismo resultado, evitando N requests a `/api/maestro/[id]`.
 * La cache se invalida cuando cambia el maestro activo (evento) o cuando han
 * pasado más de 60s desde la última lectura (TTL).
 *
 * Devuelve null si no hay maestro activo o no se puede leer.
 */

import { useEffect, useState } from 'react';
import { getMaestroActivo } from '@/lib/maestro/activo';

export interface MaestroActivoInfo {
  id: string;
  titulo: string;
}

interface CacheEntry {
  id: string;
  titulo: string;
  ts: number;
}
const TTL_MS = 60_000;
let cache: CacheEntry | null = null;
let pendingFetch: Promise<MaestroActivoInfo | null> | null = null;

async function cargarConCache(id: string): Promise<MaestroActivoInfo | null> {
  // Hit de cache fresco
  if (cache && cache.id === id && Date.now() - cache.ts < TTL_MS) {
    return { id: cache.id, titulo: cache.titulo };
  }
  // Dedup: si ya hay un fetch en vuelo para este id, espera ese.
  if (pendingFetch) return pendingFetch;
  pendingFetch = (async () => {
    try {
      const r = await fetch(`/api/maestro/${id}`, { credentials: 'include' });
      if (!r.ok) return null;
      const d = await r.json();
      if (!d?.maestro) return null;
      cache = { id: d.maestro.id, titulo: d.maestro.titulo, ts: Date.now() };
      return { id: cache.id, titulo: cache.titulo };
    } catch {
      return null;
    } finally {
      pendingFetch = null;
    }
  })();
  return pendingFetch;
}

export function useMaestroActivo(): MaestroActivoInfo | null {
  const [activo, setActivo] = useState<MaestroActivoInfo | null>(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      const id = getMaestroActivo();
      if (!id) { if (!cancelado) setActivo(null); return; }
      const res = await cargarConCache(id);
      if (!cancelado) setActivo(res);
    };

    cargar();
    const onChange = () => {
      // Invalida cache antes de recargar.
      cache = null;
      cargar();
    };
    window.addEventListener('maestro-activo-cambio', onChange);
    return () => {
      cancelado = true;
      window.removeEventListener('maestro-activo-cambio', onChange);
    };
  }, []);

  return activo;
}
