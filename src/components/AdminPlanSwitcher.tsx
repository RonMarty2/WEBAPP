"use client";

/**
 * AdminPlanSwitcher
 *
 * Chip clickeable que solo se muestra a usuarios con role="admin".
 * Permite al admin cambiar entre planes (estandar / pro / elite) en
 * caliente, sin perder la sesión ni los proyectos.
 *
 * Internamente llama a POST /api/auth/switch-plan, que rota el JWT
 * manteniendo el user.id intacto.
 */

import { useState } from "react";

type Plan = "estandar" | "pro" | "elite";

const PLANES: { id: Plan; label: string; icon: string; color: string; bg: string }[] = [
  { id: "estandar", label: "Estándar", icon: "⭐", color: "#0891b2", bg: "rgba(8,145,178,0.10)" },
  { id: "pro",      label: "Pro",      icon: "🚀", color: "#7c3aed", bg: "rgba(124,58,237,0.10)" },
  { id: "elite",    label: "Elite",    icon: "💎", color: "#d97706", bg: "rgba(217,119,6,0.10)" },
];

interface Props {
  currentPlan: Plan | string;
}

export default function AdminPlanSwitcher({ currentPlan }: Props) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activo = PLANES.find((p) => p.id === currentPlan) ?? PLANES[1];

  async function switchTo(plan: Plan) {
    if (plan === currentPlan) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/switch-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Error al cambiar plan");
        setSwitching(false);
        return;
      }
      // Recarga para que el JWT nuevo se aplique en toda la app
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
      setSwitching(false);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={switching}
        title="Click para cambiar plan (solo admin)"
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: "3px 8px 3px 6px",
          borderRadius: 999,
          border: `1px solid ${activo.color}55`,
          background: activo.bg,
          color: activo.color,
          cursor: switching ? "wait" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <span style={{ fontSize: 11 }}>{activo.icon}</span>
        {switching ? "…" : activo.label.toUpperCase()}
        <span style={{ opacity: 0.7, fontSize: 9 }}>▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop para cerrar al clickear fuera */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 50 }}
          />
          {/* Menu */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              zIndex: 51,
              minWidth: 200,
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#64748b",
                padding: "8px 12px 4px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              🛠️ Admin: simular plan
            </div>
            {PLANES.map((p) => {
              const seleccionado = p.id === currentPlan;
              return (
                <button
                  key={p.id}
                  onClick={() => switchTo(p.id)}
                  disabled={switching}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: seleccionado ? p.bg : "transparent",
                    border: "none",
                    borderTop: "1px solid rgba(0,0,0,0.04)",
                    color: seleccionado ? p.color : "#0f172a",
                    fontSize: 13,
                    fontWeight: seleccionado ? 700 : 500,
                    cursor: switching ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span style={{ flex: 1 }}>{p.label}</span>
                  {seleccionado && <span style={{ fontSize: 11 }}>✓ actual</span>}
                </button>
              );
            })}
            <div
              style={{
                fontSize: 10.5,
                color: "#64748b",
                padding: "8px 12px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                lineHeight: 1.4,
                background: "#f8fafc",
              }}
            >
              💡 Tus proyectos se mantienen al cambiar de plan.
            </div>
            {error && (
              <div
                style={{
                  fontSize: 11,
                  color: "#b91c1c",
                  padding: "8px 12px",
                  background: "rgba(239,68,68,0.06)",
                  borderTop: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                ❌ {error}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
