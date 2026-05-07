"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/lib/auth";

export default function PendientePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [planElegido, setPlanElegido] = useState<string>("estandar");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null));
    const plan = localStorage.getItem("plan_elegido");
    if (plan === "estandar" || plan === "pro") setPlanElegido(plan);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  const precioLabel = planElegido === "pro" ? "Bs. 300 / mes" : "Bs. 150 pago único";

  return (
    <div
      className="gradient-bg min-h-screen"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>⏳</div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--fg-primary)", marginBottom: 12 }}>
          Activa tu cuenta para comenzar
        </h1>

        {user && (
          <p style={{ color: "var(--fg-muted)", fontSize: 14, marginBottom: 8 }}>
            Registrado como: <strong style={{ color: "var(--fg-primary)" }}>{user.name}</strong>{" "}
            ({user.email})
          </p>
        )}

        {/* CTA principal — pago */}
        <div style={{
          margin: "28px 0 16px",
          background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))",
          border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: 16, padding: "1.5rem",
        }}>
          <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16 }}>
            Para activar tu cuenta realiza el pago de tu plan elegido. El admin lo verifica y activa tu acceso en minutos.
          </p>
          <Link
            href={`/pago?plan=${planElegido}`}
            style={{
              display: "inline-block", width: "100%", padding: "14px",
              borderRadius: 10, background: "#3b82f6", color: "#fff",
              fontWeight: 800, fontSize: 16, textDecoration: "none",
              textAlign: "center", boxSizing: "border-box",
            }}
          >
            Pagar y activar — {precioLabel}
          </Link>
          <p style={{ color: "var(--fg-muted)", fontSize: 12, marginTop: 10 }}>
            Tigo Money · QR Bancario · Transferencia
          </p>
        </div>

        <div
          className="card"
          style={{ marginBottom: 24, textAlign: "left" }}
        >
          <p style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.7, marginBottom: 0 }}>
            Si ya realizaste el pago y enviaste el comprobante, el administrador revisará y activará tu cuenta en menos de{" "}
            <strong style={{ color: "var(--fg-primary)" }}>24 horas</strong>.
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
