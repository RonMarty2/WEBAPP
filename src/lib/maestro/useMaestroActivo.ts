'use client';

/**
 * Hook que devuelve el Proyecto Maestro activo del estudiante (con su título),
 * leyendo el id de localStorage y consultando /api/maestro/[id] para el título.
 *
 * Se actualiza automáticamente cuando cambia el maestro activo (escucha el
 * evento `maestro-activo-cambio` que despacha `setMaestroActivo`).
 *
 * Devuelve null si no hay maestro activo o no se puede leer.
 */

import { useEffect, useState } from 'react';
import { getMaestroActivo } from '@/lib/maestro/activo';

export interface MaestroActivoInfo {
  id: string;
  titulo: string;
}

export function useMaestroActivo(): MaestroActivoInfo | null {
  const [activo, setActivo] = useState<MaestroActivoInfo | null>(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      const id = getMaestroActivo();
      if (!id) { if (!cancelado) setActivo(null); return; }
      try {
        const r = await fetch(`/api/maestro/${id}`, { credentials: 'include' });
        if (!r.ok) { if (!cancelado) setActivo(null); return; }
        const d = await r.json();
        if (!cancelado && d?.maestro) setActivo({ id: d.maestro.id, titulo: d.maestro.titulo });
      } catch {
        if (!cancelado) setActivo(null);
      }
    };

    cargar();
    const onChange = () => cargar();
    window.addEventListener('maestro-activo-cambio', onChange);
    return () => {
      cancelado = true;
      window.removeEventListener('maestro-activo-cambio', onChange);
    };
  }, []);

  return activo;
}
