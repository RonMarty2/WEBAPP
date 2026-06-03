"use client";

/**
 * AdminViewToggle
 *
 * Toggle flotante que permite a los admins ver la app "como un estudiante"
 * sin tener que cerrar sesión y entrar con otra cuenta. Útil durante desarrollo
 * y QA para confirmar que la experiencia del usuario final está limpia.
 *
 * - Solo se renderiza si el usuario logueado tiene role === "admin"
 * - Estado persistente en localStorage ("lab_view_mode")
 * - Componente accesorio: NO debe interferir con la UI principal
 * - Estudiantes finales NUNCA ven este botón ni saben que existe
 *
 * Para consumir el modo desde otros componentes, importar `useViewMode()`.
 */

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "lab_view_mode";

export type ViewMode = "admin" | "student";

/** Hook que devuelve el modo de vista actual y un setter persistente. */
export function useViewMode(): {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  toggle: () => void;
} {
  const [mode, setModeState] = useState<ViewMode>("admin");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "student" || stored === "admin") {
        setModeState(stored);
      }
    } catch { /* SSR or storage disabled */ }
  }, []);

  const setMode = useCallback((m: ViewMode) => {
    setModeState(m);
    try { window.localStorage.setItem(STORAGE_KEY, m); } catch { /* ignore */ }
    // Notificar a otras pestañas del cambio
    window.dispatchEvent(new CustomEvent("lab:viewmode", { detail: m }));
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "admin" ? "student" : "admin");
  }, [mode, setMode]);

  // Escuchar cambios desde otras instancias del hook en la misma pestaña
  useEffect(() => {
    const handler = (e: Event) => {
      const m = (e as CustomEvent<ViewMode>).detail;
      if (m === "admin" || m === "student") setModeState(m);
    };
    window.addEventListener("lab:viewmode", handler);
    return () => window.removeEventListener("lab:viewmode", handler);
  }, []);

  return { mode, setMode, toggle };
}

interface Props {
  /** Solo se renderiza si el usuario es admin. Pasa esa info desde el padre. */
  isAdmin: boolean;
}

export default function AdminViewToggle({ isAdmin }: Props) {
  const { mode, toggle } = useViewMode();
  const [hover, setHover] = useState(false);

  if (!isAdmin) return null;

  const isStudent = mode === "student";

  return (
    <div
      className="admin-view-toggle-fab"
      style={{
        position: "fixed",
        bottom: 18,
        right: 18,
        zIndex: 9000,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={toggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={isStudent ? "Cambiar a vista admin" : "Cambiar a vista estudiante"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px 9px 11px",
          borderRadius: 999,
          border: "1px solid",
          borderColor: isStudent ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.4)",
          background: isStudent
            ? "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.95))"
            : "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(79,70,229,0.95))",
          color: "white",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.02em",
          cursor: "pointer",
          boxShadow: hover
            ? "0 12px 28px rgba(15,23,42,0.22), 0 4px 8px rgba(15,23,42,0.10)"
            : "0 6px 16px rgba(15,23,42,0.16), 0 2px 4px rgba(15,23,42,0.08)",
          transition: "transform 180ms cubic-bezier(0.22,1,0.36,1), box-shadow 180ms cubic-bezier(0.22,1,0.36,1)",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          backdropFilter: "saturate(140%)",
        }}
      >
        <span aria-hidden style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: "50%",
          background: "rgba(255,255,255,0.25)",
          fontSize: 13,
        }}>
          {isStudent ? "👁️" : "🛠️"}
        </span>
        <span>
          {isStudent ? "Vista estudiante" : "Vista admin"}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, opacity: 0.85,
          padding: "2px 7px", borderRadius: 999,
          background: "rgba(255,255,255,0.18)",
          letterSpacing: "0.04em",
        }}>
          {isStudent ? "→ admin" : "→ estudiante"}
        </span>
      </button>

      {/* Hint line debajo solo cuando hover, ayuda al admin a entender qué pasa */}
      {hover && (
        <div style={{
          position: "absolute",
          right: 0,
          bottom: "calc(100% + 8px)",
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(15,23,42,0.92)",
          color: "rgba(248,250,252,0.92)",
          fontSize: 11,
          lineHeight: 1.4,
          maxWidth: 240,
          whiteSpace: "normal",
          textAlign: "right",
          boxShadow: "0 8px 22px rgba(15,23,42,0.32)",
          pointerEvents: "none",
        }}>
          {isStudent
            ? "Estás viendo lo mismo que ve un estudiante final. Click para ver herramientas de admin."
            : "Vista de admin con herramientas de desarrollo. Click para ver lo que ve un estudiante final."}
        </div>
      )}
    </div>
  );
}
