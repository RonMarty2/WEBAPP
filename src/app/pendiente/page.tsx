"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export default function PendientePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <div
      className="gradient-bg min-h-screen"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>⏳</div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 12 }}>
          Cuenta pendiente de activación
        </h1>

        {user && (
          <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 8 }}>
            Registrado como: <strong style={{ color: "var(--fg-primary)" }}>{user.name}</strong>{" "}
            ({user.email})
          </p>
        )}

        <div
          className="card"
          style={{ marginTop: 28, marginBottom: 24, textAlign: "left" }}
        >
          <p style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
            Tu solicitud de acceso fue recibida. El administrador revisará tu cuenta y te asignará
            el plan correspondiente en un plazo de <strong style={{ color: "var(--fg-primary)" }}>24 horas</strong>.
            <br /><br />
            Una vez activada, podrás iniciar sesión normalmente con tu cuenta Google.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border-hover)",
              background: "transparent", color: "var(--fg-muted)", fontSize: 14, cursor: "pointer",
            }}
          >
            ← Volver al inicio
          </button>
          <a
            href="https://wa.me/59170000000"
            style={{
              padding: "10px 24px", borderRadius: 8,
              background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
              color: "#4ade80", fontSize: 14, textDecoration: "none",
            }}
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
