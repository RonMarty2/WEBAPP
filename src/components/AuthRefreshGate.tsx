"use client";

/**
 * AuthRefreshGate
 *
 * Se monta en el root layout, así corre en TODAS las páginas (dashboard,
 * workspace, admin, etc.). Al montar pide /api/auth/me con cache desactivado;
 * si la respuesta trae __refreshed: true significa que el servidor detectó
 * que el cookie JWT tenía datos viejos (role/plan/active) y lo regeneró
 * con datos frescos desde la BD. En ese caso, recargamos la página UNA vez
 * para que TODOS los componentes con state stale (botones admin, banners,
 * planes) re-rendeen con la info correcta.
 *
 * Sin esto, el cliente podía seguir mostrando UI de admin a un usuario que
 * ya no lo es, hasta que cerrara la app y la abriera de nuevo.
 *
 * Es silencioso: no renderiza nada al DOM. La sessionStorage flag evita
 * loops si por algún motivo el servidor sigue marcando refreshed.
 */

import { useEffect } from "react";

const FLAG = "auth-refresh-gate-done";

export default function AuthRefreshGate() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Evitar loops de reload: si ya recargamos en esta sesión, no volvemos.
    if (sessionStorage.getItem(FLAG) === "1") return;

    let aborted = false;
    fetch(`/api/auth/me?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (aborted) return;
        if (d?.__refreshed === true) {
          sessionStorage.setItem(FLAG, "1");
          // Reload UNA sola vez para que TODOS los componentes vean el cookie
          // nuevo y se re-rendeen con role/plan correctos.
          window.location.reload();
        }
      })
      .catch(() => {
        // Si la BD/red falla, no hacemos nada — la sesión sigue siendo válida
        // con los datos del JWT que ya tiene el cliente.
      });

    return () => { aborted = true; };
  }, []);

  return null;
}
