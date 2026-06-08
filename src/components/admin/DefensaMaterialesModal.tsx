"use client";

import { useEffect, useState, useRef } from "react";

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

const SLOTS: { id: Slot; label: string; emoji: string; accept: string; descripcion: string }[] = [
  { id: "slides",  label: "Diapositivas (PDF)", emoji: "🎯", accept: ".pdf",        descripcion: "Presentación lista para defender" },
  { id: "podcast", label: "Podcast (MP3)",      emoji: "🎙️", accept: ".mp3,audio/*", descripcion: "Audio explicativo del proyecto" },
  { id: "guion",   label: "Guión de defensa",   emoji: "📜", accept: ".pdf",        descripcion: "Texto para leer en la defensa oral" },
];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DefensaMaterialesModal({
  proyectoId,
  proyectoTitulo,
  onClose,
}: {
  proyectoId: string;
  proyectoTitulo: string;
  onClose: () => void;
}) {
  const [materiales, setMateriales] = useState<DefensaMateriales | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<Slot | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [marcandoListo, setMarcandoListo] = useState(false);
  const inputsRef = useRef<Record<Slot, HTMLInputElement | null>>({ slides: null, podcast: null, guion: null });

  async function load() {
    try {
      const res = await fetch(`/api/admin/projects/${proyectoId}/defensa-materiales`);
      const data = await res.json();
      if (res.ok) {
        setMateriales(data.materiales);
        setMensaje(data.materiales?.mensaje ?? "");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [proyectoId]);  // eslint-disable-line react-hooks/exhaustive-deps

  async function subir(slot: Slot, file: File) {
    if (!file) return;
    setUploadingSlot(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slot", slot);
      const res = await fetch(`/api/admin/projects/${proyectoId}/defensa-materiales`, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setMateriales(data.materiales);
      else alert(`Error: ${data.error}`);
    } finally {
      setUploadingSlot(null);
    }
  }

  async function eliminar(slot: Slot) {
    if (!confirm(`¿Eliminar ${slot}?`)) return;
    const res = await fetch(`/api/admin/projects/${proyectoId}/defensa-materiales?slot=${slot}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) setMateriales(data.materiales);
    else alert(`Error: ${data.error}`);
  }

  async function marcarListo() {
    setMarcandoListo(true);
    try {
      const res = await fetch(`/api/admin/projects/${proyectoId}/defensa-materiales`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "listo", mensaje }),
      });
      const data = await res.json();
      if (res.ok) setMateriales(data.materiales);
      else alert(`Error: ${data.error}`);
    } finally {
      setMarcandoListo(false);
    }
  }

  async function volverAEnProceso() {
    const res = await fetch(`/api/admin/projects/${proyectoId}/defensa-materiales`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en_proceso", mensaje }),
    });
    const data = await res.json();
    if (res.ok) setMateriales(data.materiales);
  }

  const estado = materiales?.estado ?? "pendiente";
  const colorEstado = estado === "listo" ? "#10b981" : estado === "en_proceso" ? "#f59e0b" : "#94a3b8";
  const labelEstado = estado === "listo" ? "🟢 Listo (visible para el estudiante)" : estado === "en_proceso" ? "🟡 En proceso" : "⚪ Pendiente";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto", padding: 28, color: "#0f172a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Materiales de defensa (Elite)</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{proyectoTitulo}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }} aria-label="Cerrar">×</button>
        </div>

        <div style={{ padding: "10px 14px", background: `${colorEstado}15`, border: `1px solid ${colorEstado}40`, borderRadius: 10, marginBottom: 18, fontSize: 12, fontWeight: 600, color: colorEstado }}>
          {labelEstado}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Cargando…</div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {SLOTS.map(({ id, label, emoji, accept, descripcion }) => {
                const archivo = materiales?.[id];
                const uploading = uploadingSlot === id;
                return (
                  <div key={id} style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 12, background: archivo ? "#f0fdf4" : "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{emoji} {label}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{descripcion}</div>
                        {archivo && (
                          <div style={{ fontSize: 11, color: "#10b981", marginTop: 6 }}>
                            ✓ {archivo.nombre} · {formatBytes(archivo.tamano)} · {new Date(archivo.subido_at).toLocaleString("es-BO")}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => inputsRef.current[id]?.click()}
                          disabled={uploading}
                          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #6366f1", background: archivo ? "#fff" : "#6366f1", color: archivo ? "#6366f1" : "#fff", fontSize: 12, fontWeight: 600, cursor: uploading ? "wait" : "pointer" }}
                        >
                          {uploading ? "Subiendo…" : archivo ? "Reemplazar" : "Subir"}
                        </button>
                        {archivo && (
                          <button onClick={() => eliminar(id)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ef4444", background: "#fff", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            Borrar
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      ref={el => { inputsRef.current[id] = el; }}
                      type="file"
                      accept={accept}
                      onChange={e => { const f = e.target.files?.[0]; if (f) subir(id, f); e.target.value = ""; }}
                      style={{ display: "none" }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="defensa-mensaje" style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Mensaje para el estudiante (opcional)</label>
              <textarea
                id="defensa-mensaje"
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Ej: Te recomiendo ensayar el guión 3 veces antes de la defensa. Cualquier duda, escribime."
                rows={3}
                style={{ width: "100%", marginTop: 6, padding: 10, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {estado === "listo" ? (
                <button onClick={volverAEnProceso} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #f59e0b", background: "#fff", color: "#f59e0b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Volver a &quot;En proceso&quot;
                </button>
              ) : (
                <button
                  onClick={marcarListo}
                  disabled={marcandoListo || (!materiales?.slides && !materiales?.podcast && !materiales?.guion)}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#10b981", color: "#fff", fontSize: 13, fontWeight: 700, cursor: marcandoListo ? "wait" : "pointer", opacity: (!materiales?.slides && !materiales?.podcast && !materiales?.guion) ? 0.5 : 1 }}
                >
                  {marcandoListo ? "Marcando…" : "✓ Marcar como Listo y notificar"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
