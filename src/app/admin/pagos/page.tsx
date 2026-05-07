"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";

type Plan = "estandar" | "pro";
type Metodo = "tigo_money" | "qr_bancario" | "transferencia";
type Estado = "pendiente" | "aprobado" | "rechazado";

interface Solicitud {
  id: string;
  usuario_id: string;
  usuario_email?: string;
  usuario_nombre?: string;
  plan: Plan;
  monto_bs: number;
  metodo: Metodo;
  estado: Estado;
  comprobante_b64?: string;
  comprobante_tipo?: string;
  notas_usuario?: string;
  notas_admin?: string;
  aprobado_por?: string;
  aprobado_at?: string;
  created_at: string;
}

interface PaymentConfig {
  tigo_money_numero?: string;
  tigo_money_nombre?: string;
  banco_nombre?: string;
  banco_cuenta?: string;
  banco_titular?: string;
  banco_ci?: string;
  qr_imagen_b64?: string;
  instrucciones_extra?: string;
}

const ESTADO_BADGE: Record<Estado, { label: string; color: string; bg: string }> = {
  pendiente: { label: "PENDIENTE", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  aprobado:  { label: "APROBADO",  color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  rechazado: { label: "RECHAZADO", color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const METODO_LABEL: Record<Metodo, string> = {
  tigo_money: "Tigo Money",
  qr_bancario: "QR Bancario",
  transferencia: "Transferencia",
};

export default function PagosAdminPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [config, setConfig] = useState<PaymentConfig>({});
  const [configEdit, setConfigEdit] = useState<PaymentConfig>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"solicitudes" | "config">("solicitudes");
  const [filtro, setFiltro] = useState<Estado | "todas">("pendiente");
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [notasAdmin, setNotasAdmin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/payments")
      .then(r => r.json())
      .then(d => {
        setSolicitudes(d.solicitudes ?? []);
        setConfig(d.config ?? {});
        setConfigEdit(d.config ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filtro === "todas" ? solicitudes : solicitudes.filter(s => s.estado === filtro);
  const pendienteCount = solicitudes.filter(s => s.estado === "pendiente").length;

  async function accion(id: string, accion: "aprobar" | "rechazar") {
    setProcessing(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accion, notas_admin: notasAdmin }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setMsg(d.mensaje);
      setSolicitudes(prev => prev.map(s => s.id === id
        ? { ...s, estado: accion === "aprobar" ? "aprobado" : "rechazado", notas_admin: notasAdmin }
        : s
      ));
      setSelected(null);
      setNotasAdmin("");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setProcessing(false);
    }
  }

  async function guardarConfig() {
    setSavingConfig(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configEdit),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setConfig(d.config);
      setMsg("Configuración guardada correctamente.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setSavingConfig(false);
    }
  }

  function handleQrFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      const b64 = dataUrl.split(",")[1];
      setConfigEdit(c => ({ ...c, qr_imagen_b64: b64 }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <AdminShell
      title="Gestión de Pagos"
      code="PAYMENTS — verificación manual"
      subtitle="Aprueba o rechaza solicitudes de pago de los estudiantes."
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "solicitudes", label: `Solicitudes ${pendienteCount > 0 ? `(${pendienteCount} pendientes)` : ""}` },
          { id: "config", label: "Configurar Métodos de Pago" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`adm-btn ${tab === t.id ? "adm-btn-primary" : ""}`}
            style={{ fontSize: 12 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="adm-card mb-4" style={{ padding: "10px 14px", color: msg.includes("Error") || msg.includes("error") ? "#f87171" : "#4ade80", fontSize: 13 }}>
          {msg}
        </div>
      )}

      {/* ── TAB: Solicitudes ─────────────────────────────────────── */}
      {tab === "solicitudes" && (
        <div className="flex gap-4">
          {/* Lista */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Filtros */}
            <div className="flex gap-2 mb-4">
              {(["pendiente", "aprobado", "rechazado", "todas"] as const).map(f => (
                <button key={f} onClick={() => setFiltro(f)} className={`adm-btn ${filtro === f ? "adm-btn-primary" : ""}`} style={{ fontSize: 11, textTransform: "uppercase" }}>
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="adm-muted" style={{ fontSize: 13 }}>Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="adm-card" style={{ padding: "2rem", textAlign: "center" }}>
                <div className="adm-muted" style={{ fontSize: 13 }}>No hay solicitudes {filtro !== "todas" ? filtro + "s" : ""}.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map(s => {
                  const badge = ESTADO_BADGE[s.estado];
                  const isSelected = selected?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      className="adm-card"
                      onClick={() => { setSelected(isSelected ? null : s); setNotasAdmin(""); setMsg(""); }}
                      style={{
                        padding: "1rem 1.2rem", cursor: "pointer",
                        border: isSelected ? "1px solid var(--adm-glow)" : undefined,
                        transition: "border 0.15s",
                      }}
                    >
                      <div className="flex items-center gap-3 justify-between">
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.usuario_nombre ?? s.usuario_email ?? s.usuario_id}</div>
                          <div className="adm-muted" style={{ fontSize: 12 }}>{s.usuario_email}</div>
                        </div>
                        <span style={{ padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2" style={{ fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: "#60a5fa" }}>Bs. {s.monto_bs}</span>
                        <span className="adm-muted">{s.plan === "estandar" ? "Estándar" : "Pro"}</span>
                        <span className="adm-muted">{METODO_LABEL[s.metodo]}</span>
                        <span className="adm-muted">{new Date(s.created_at).toLocaleString("es-BO")}</span>
                        {s.comprobante_b64 && <span style={{ color: "#4ade80" }}>📎 Comprobante</span>}
                      </div>
                      {s.notas_usuario && <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>"{s.notas_usuario}"</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel de acción */}
          {selected && (
            <div style={{ width: 300, flexShrink: 0 }}>
              <div className="adm-card" style={{ padding: "1.2rem", position: "sticky", top: "1rem" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{selected.usuario_nombre ?? selected.usuario_email}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
                  Plan {selected.plan === "estandar" ? "Estándar" : "Pro"} · Bs. {selected.monto_bs}<br />
                  {METODO_LABEL[selected.metodo]}
                </div>

                {/* Comprobante */}
                {selected.comprobante_b64 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>COMPROBANTE</div>
                    {selected.comprobante_tipo?.startsWith("image/")
                      ? <img
                          src={`data:${selected.comprobante_tipo};base64,${selected.comprobante_b64}`}
                          alt="Comprobante"
                          style={{ width: "100%", borderRadius: 8, border: "1px solid #334155", maxHeight: 200, objectFit: "contain", background: "#fff" }}
                        />
                      : <a
                          href={`data:${selected.comprobante_tipo};base64,${selected.comprobante_b64}`}
                          download="comprobante.pdf"
                          style={{ fontSize: 13, color: "#60a5fa" }}
                        >
                          📄 Descargar comprobante (PDF)
                        </a>
                    }
                  </div>
                )}

                {selected.estado === "pendiente" && (
                  <>
                    <textarea
                      placeholder="Nota para el usuario (opcional)"
                      value={notasAdmin}
                      onChange={e => setNotasAdmin(e.target.value)}
                      rows={2}
                      style={{ width: "100%", background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 8, padding: "8px 10px", color: "#f1f5f9", fontSize: 12, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => accion(selected.id, "aprobar")}
                        disabled={processing}
                        className="adm-btn adm-btn-primary"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        {processing ? "..." : "✓ Aprobar"}
                      </button>
                      <button
                        onClick={() => accion(selected.id, "rechazar")}
                        disabled={processing}
                        className="adm-btn"
                        style={{ flex: 1, justifyContent: "center", color: "#f87171", borderColor: "#f87171" }}
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </>
                )}

                {selected.estado !== "pendiente" && selected.notas_admin && (
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                    Nota: {selected.notas_admin}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Config ──────────────────────────────────────────── */}
      {tab === "config" && (
        <div style={{ maxWidth: 540 }}>
          <div className="adm-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              <div style={{ fontWeight: 700, fontSize: 14, color: "#94a3b8", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4 }}>TIGO MONEY</div>
              {[
                { key: "tigo_money_numero", label: "Número Tigo Money" },
                { key: "tigo_money_nombre", label: "Nombre del titular" },
              ].map(f => (
                <div key={f.key}>
                  <label className="adm-label block mb-1">{f.label}</label>
                  <input
                    value={(configEdit as Record<string, string>)[f.key] ?? ""}
                    onChange={e => setConfigEdit(c => ({ ...c, [f.key]: e.target.value }))}
                    className="adm-input w-full"
                    placeholder={f.label}
                  />
                </div>
              ))}

              <div style={{ fontWeight: 700, fontSize: 14, color: "#94a3b8", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4, marginTop: 8 }}>CUENTA BANCARIA</div>
              {[
                { key: "banco_nombre", label: "Nombre del banco" },
                { key: "banco_cuenta", label: "Número de cuenta" },
                { key: "banco_titular", label: "Titular de la cuenta" },
                { key: "banco_ci", label: "CI del titular" },
              ].map(f => (
                <div key={f.key}>
                  <label className="adm-label block mb-1">{f.label}</label>
                  <input
                    value={(configEdit as Record<string, string>)[f.key] ?? ""}
                    onChange={e => setConfigEdit(c => ({ ...c, [f.key]: e.target.value }))}
                    className="adm-input w-full"
                    placeholder={f.label}
                  />
                </div>
              ))}

              <div style={{ fontWeight: 700, fontSize: 14, color: "#94a3b8", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginBottom: 4, marginTop: 8 }}>QR BANCARIO</div>
              <div>
                <label className="adm-label block mb-1">Imagen QR (PNG/JPG)</label>
                {configEdit.qr_imagen_b64 && (
                  <img src={`data:image/png;base64,${configEdit.qr_imagen_b64}`} alt="QR" style={{ width: 120, height: 120, border: "1px solid #334155", borderRadius: 8, marginBottom: 8, background: "#fff" }} />
                )}
                <input type="file" accept="image/*" onChange={handleQrFile} style={{ fontSize: 12, color: "#94a3b8" }} />
              </div>

              <div style={{ marginTop: 8 }}>
                <label className="adm-label block mb-1">Instrucciones adicionales</label>
                <textarea
                  value={configEdit.instrucciones_extra ?? ""}
                  onChange={e => setConfigEdit(c => ({ ...c, instrucciones_extra: e.target.value }))}
                  rows={3}
                  className="adm-input w-full"
                  placeholder="Ej: Enviar el comprobante al WhatsApp +591 7X XXX XXX"
                  style={{ resize: "vertical" }}
                />
              </div>

              <button onClick={guardarConfig} disabled={savingConfig} className="adm-btn adm-btn-primary" style={{ marginTop: 8 }}>
                {savingConfig ? "Guardando..." : "Guardar configuración"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
