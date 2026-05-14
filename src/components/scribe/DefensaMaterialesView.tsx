"use client";

import { useEffect, useState } from "react";

interface DefensaArchivo {
  nombre: string;
  mime: string;
  tamano: number;
  ruta: string;
  subido_at: string;
}

interface DefensaMateriales {
  estado: "pendiente" | "en_proceso" | "listo";
  mensaje?: string;
  notificado_at?: string;
  slides?: DefensaArchivo;
  podcast?: DefensaArchivo;
  guion?: DefensaArchivo;
}

type Slot = "slides" | "podcast" | "guion";

const SLOTS: { id: Slot; label: string; emoji: string; descripcion: string }[] = [
  { id: "slides",  label: "Diapositivas",     emoji: "🎯", descripcion: "Presentación PDF para tu defensa" },
  { id: "podcast", label: "Podcast / audio",  emoji: "🎙️", descripcion: "Audio explicativo del proyecto" },
  { id: "guion",   label: "Guión de defensa", emoji: "📜", descripcion: "Texto para leer durante la defensa oral" },
];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DefensaMaterialesView({ proyectoId }: { proyectoId: string }) {
  const [materiales, setMateriales] = useState<DefensaMateriales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch(`/api/projects/${proyectoId}/defensa-materiales`);
      const data = await res.json();
      if (res.ok) setMateriales(data.materiales);
      else setError(data.error ?? "No disponible");
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [proyectoId]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div style={{ padding: 24, textAlign: "center", color: "var(--fg-muted)" }}>Cargando…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#ef4444", fontSize: 12 }}>
        {error}
      </div>
    );
  }

  const estado = materiales?.estado ?? "pendiente";

  return (
    <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-primary)" }}>
        🎓 Materiales de defensa
      </div>
      <div style={{ fontSize: 11.5, color: "var(--fg-secondary)", lineHeight: 1.6 }}>
        Tu plan Elite incluye preparación completa para defender tu monografía: diapositivas, podcast explicativo y guión oral. Te avisamos cuando estén listos.
      </div>

      {/* Estado banner */}
      {estado === "pendiente" && (
        <div style={{ padding: "14px 16px", border: "1px solid rgba(148,163,184,0.3)", borderRadius: 12, background: "rgba(148,163,184,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-primary)" }}>En espera</div>
            <div style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 2 }}>Aún no comenzamos a preparar tus materiales. Te notificamos cuando estén disponibles.</div>
          </div>
        </div>
      )}
      {estado === "en_proceso" && (
        <div style={{ padding: "14px 16px", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, background: "rgba(245,158,11,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🛠️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>En preparación</div>
            <div style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 2 }}>Estamos preparando tus materiales. Aún no descargables.</div>
          </div>
        </div>
      )}
      {estado === "listo" && (
        <div style={{ padding: "14px 16px", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 12, background: "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>Materiales listos</div>
            <div style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 2 }}>Descargá los archivos abajo para preparar tu defensa.</div>
          </div>
        </div>
      )}

      {/* Lista de slots */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SLOTS.map(({ id, label, emoji, descripcion }) => {
          const archivo = materiales?.[id];
          const disponible = estado === "listo" && !!archivo;
          return (
            <div key={id} style={{ padding: 12, border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, background: disponible ? "rgba(16,185,129,0.04)" : "rgba(148,163,184,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg-primary)" }}>{emoji} {label}</div>
                  <div style={{ fontSize: 10.5, color: "var(--fg-muted)", marginTop: 2 }}>{descripcion}</div>
                  {disponible && archivo && (
                    <div style={{ fontSize: 10, color: "#10b981", marginTop: 4 }}>
                      {formatBytes(archivo.tamano)}
                    </div>
                  )}
                </div>
                {disponible ? (
                  <a
                    href={`/api/projects/${proyectoId}/defensa-materiales?slot=${id}`}
                    download
                    style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #10b981", background: "#10b981", color: "#fff", fontSize: 11, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    Descargar
                  </a>
                ) : (
                  <span style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(148,163,184,0.15)", color: "var(--fg-muted)", fontSize: 11, fontWeight: 600 }}>
                    {estado === "listo" ? "No disponible" : "Pendiente"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje del admin */}
      {materiales?.mensaje && (
        <div style={{ padding: "12px 14px", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 10, background: "rgba(99,102,241,0.05)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>📝 Nota del equipo</div>
          <div style={{ fontSize: 11.5, color: "var(--fg-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{materiales.mensaje}</div>
        </div>
      )}
    </div>
  );
}
