"use client";

import { useState, useEffect } from "react";

interface ProviderStatus {
  id: string;
  name: string;
  color: string;
  apiDocsUrl: string;
  models: { id: string; label: string; contextK: number }[];
  defaultModel: string;
  configured: boolean;
  keyMasked: string;
}

interface ServiceConfig {
  servicio_id: string;
  provider_id: string;
  model: string;
  api_key_masked: string;
}

// Servicios disponibles en la plataforma
const SERVICIOS = [
  { id: "mono-001", nombre: "Monografía Académica",   icon: "📄", desc: "Monografías para diplomados y postgrados" },
  { id: "tesis-001", nombre: "Tesis de Grado",         icon: "🎓", desc: "Tesis de licenciatura con rigor metodológico" },
  { id: "doc-001",  nombre: "Material para Docentes",  icon: "📝", desc: "Textos, syllabus y materiales de enseñanza" },
  { id: "ensayo-001",nombre: "Ensayo Académico",       icon: "✍️", desc: "Ensayos analíticos y críticos" },
];

export default function ModelosPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Key input state per provider
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [keyMsg, setKeyMsg] = useState<Record<string, string>>({});

  // Service config state
  const [serviceEdits, setServiceEdits] = useState<Record<string, { provider_id: string; model: string }>>({});
  const [savingSvc, setSavingSvc] = useState<string | null>(null);
  const [svcMsg, setSvcMsg] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<"providers" | "services">("providers");

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then(r => r.json())
      .then(d => {
        setProviders(d.providers ?? []);
        setServiceConfigs(d.services ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function getServiceConfig(svcId: string): { provider_id: string; model: string } {
    const edit = serviceEdits[svcId];
    if (edit) return edit;
    const saved = serviceConfigs.find(s => s.servicio_id === svcId);
    if (saved) return { provider_id: saved.provider_id, model: saved.model };
    return { provider_id: "", model: "" };
  }

  async function saveProviderKey(providerId: string) {
    const key = keyInputs[providerId];
    if (!key?.trim()) return;
    setSavingKey(providerId);
    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "provider_key", provider_id: providerId, api_key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, configured: true, keyMasked: data.keyMasked } : p));
      setKeyInputs(prev => ({ ...prev, [providerId]: "" }));
      setKeyMsg(prev => ({ ...prev, [providerId]: "✓ Guardado" }));
      setTimeout(() => setKeyMsg(prev => ({ ...prev, [providerId]: "" })), 3000);
    } catch (e) {
      setKeyMsg(prev => ({ ...prev, [providerId]: "Error: " + (e as Error).message }));
    } finally {
      setSavingKey(null);
    }
  }

  async function removeProviderKey(providerId: string) {
    try {
      await fetch("/api/admin/ai-config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: providerId }),
      });
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, configured: false, keyMasked: "" } : p));
    } catch {}
  }

  async function saveServiceConfig(svcId: string) {
    const cfg = getServiceConfig(svcId);
    if (!cfg.provider_id || !cfg.model) return;
    setSavingSvc(svcId);
    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "service_config", servicio_id: svcId, provider_id: cfg.provider_id, model: cfg.model }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setServiceConfigs(prev => {
        const exists = prev.find(s => s.servicio_id === svcId);
        if (exists) return prev.map(s => s.servicio_id === svcId ? { ...s, ...cfg } : s);
        return [...prev, { servicio_id: svcId, ...cfg, api_key_masked: "" }];
      });
      setSvcMsg(prev => ({ ...prev, [svcId]: "✓ Guardado" }));
      setTimeout(() => setSvcMsg(prev => ({ ...prev, [svcId]: "" })), 3000);
    } catch (e) {
      setSvcMsg(prev => ({ ...prev, [svcId]: "Error: " + (e as Error).message }));
    } finally {
      setSavingSvc(null);
    }
  }

  const configuredCount = providers.filter(p => p.configured).length;

  const tabBtn = (tab: "providers" | "services", label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
        background: activeTab === tab ? "rgba(37,99,235,0.15)" : "transparent",
        border: activeTab === tab ? "1px solid rgba(37,99,235,0.4)" : "1px solid transparent",
        color: activeTab === tab ? "var(--accent)" : "var(--fg-muted)",
      }}
    >
      {label}
    </button>
  );

  if (loading) return <div style={{ textAlign: "center", padding: 48, color: "var(--fg-secondary)" }}>Cargando configuración...</div>;

  return (
    <div style={{ color: "var(--fg-primary)" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>🤖 Modelos & APIs</h1>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6 }}>
          Configura los proveedores de IA y asigna qué IA usa cada servicio de la plataforma.
          Puedes tener proveedores diferentes para cada tipo de documento.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: configuredCount > 0 ? "#4ade80" : "#f87171" }}>
            {configuredCount > 0 ? `✓ ${configuredCount} proveedor${configuredCount > 1 ? "es" : ""} configurado${configuredCount > 1 ? "s" : ""}` : "⚠ Ningún proveedor configurado"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "rgba(255,255,255,0.84)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {tabBtn("providers", "🔑 Proveedores de IA")}
        {tabBtn("services", "⚙️ IA por Servicio")}
      </div>

      {/* ── TAB: PROVIDERS ─────────────────────────────────────────────────────── */}
      {activeTab === "providers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {providers.map(p => (
            <div key={p.id} style={{
              background: "rgba(255,255,255,0.86)", border: `1px solid ${p.configured ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                {/* Indicator dot + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.configured ? "#4ade80" : "var(--border-hover)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 2 }}>
                      {p.configured ? <span style={{ color: "#4ade80" }}>✓ Configurado — {p.keyMasked}</span> : "Sin API key"}
                    </div>
                  </div>
                </div>

                {/* Models list (compact) */}
                <div style={{ fontSize: 11, color: "var(--fg-secondary)", flex: 1, minWidth: 160 }}>
                  {p.models.slice(0, 3).map(m => (
                    <div key={m.id} style={{ marginBottom: 2 }}>• {m.label}</div>
                  ))}
                  {p.models.length > 3 && <div style={{ color: "var(--fg-muted)" }}>+{p.models.length - 3} más</div>}
                </div>

                {/* Get API key link */}
                <a
                  href={p.apiDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "var(--accent)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Obtener API Key →
                </a>
              </div>

              {/* Key input */}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type={showKey[p.id] ? "text" : "password"}
                    placeholder={p.configured ? "Nueva key para reemplazar la actual..." : "Pega tu API key aquí..."}
                    value={keyInputs[p.id] ?? ""}
                    onChange={e => setKeyInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                    style={{
                      width: "100%", padding: "9px 40px 9px 12px", background: "rgba(255,255,255,0.90)",
                      border: "1px solid var(--border-hover)", borderRadius: 8, color: "var(--fg-primary)", fontSize: 13,
                      fontFamily: "JetBrains Mono, monospace", boxSizing: "border-box", outline: "none",
                    }}
                  />
                  <button
                    onClick={() => setShowKey(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--fg-secondary)", cursor: "pointer", fontSize: 13 }}
                  >
                    {showKey[p.id] ? "🙈" : "👁"}
                  </button>
                </div>
                <button
                  onClick={() => saveProviderKey(p.id)}
                  disabled={!keyInputs[p.id]?.trim() || savingKey === p.id}
                  style={{
                    padding: "9px 16px", background: keyInputs[p.id]?.trim() ? "rgba(37,99,235,0.9)" : "rgba(255,255,255,0.88)",
                    border: "1px solid rgba(37,99,235,0.4)", borderRadius: 8, color: keyInputs[p.id]?.trim() ? "var(--fg-primary)" : "var(--fg-secondary)",
                    fontSize: 13, fontWeight: 700, cursor: keyInputs[p.id]?.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                  }}
                >
                  {savingKey === p.id ? "..." : "Guardar"}
                </button>
                {p.configured && (
                  <button
                    onClick={() => removeProviderKey(p.id)}
                    style={{ padding: "9px 12px", background: "transparent", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, color: "#f87171", fontSize: 12, cursor: "pointer" }}
                  >
                    Borrar
                  </button>
                )}
              </div>
              {keyMsg[p.id] && (
                <div style={{ fontSize: 12, marginTop: 8, color: keyMsg[p.id].startsWith("✓") ? "#4ade80" : "#f87171" }}>
                  {keyMsg[p.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: SERVICES ──────────────────────────────────────────────────────── */}
      {activeTab === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {configuredCount === 0 && (
            <div style={{ padding: "14px 18px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 8, fontSize: 13, color: "#fbbf24", marginBottom: 8 }}>
              ⚠ Primero configura al menos una API key en la pestaña "Proveedores de IA".
            </div>
          )}

          {SERVICIOS.map(svc => {
            const cfg = getServiceConfig(svc.id);
            const savedCfg = serviceConfigs.find(s => s.servicio_id === svc.id);
            const selectedProvider = providers.find(p => p.id === cfg.provider_id);
            const availableModels = selectedProvider?.models ?? [];

            return (
              <div key={svc.id} style={{ background: "rgba(255,255,255,0.86)", border: `1px solid ${savedCfg ? "rgba(139,92,246,0.25)" : "var(--border)"}`, borderRadius: 12, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{svc.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{svc.nombre}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-secondary)" }}>{svc.desc}</div>
                  </div>
                  {savedCfg && (
                    <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, color: "#a78bfa" }}>
                      ✓ Configurado
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                      Proveedor de IA
                    </label>
                    <select
                      value={cfg.provider_id}
                      onChange={e => {
                        const prov = providers.find(p => p.id === e.target.value);
                        setServiceEdits(prev => ({
                          ...prev,
                          [svc.id]: { provider_id: e.target.value, model: prov?.defaultModel ?? "" }
                        }));
                      }}
                      style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.90)", border: "1px solid var(--border-hover)", borderRadius: 8, color: cfg.provider_id ? "var(--fg-primary)" : "var(--fg-secondary)", fontSize: 13, outline: "none" }}
                    >
                      <option value="">— Seleccionar proveedor —</option>
                      {providers.filter(p => p.configured).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                      {providers.filter(p => !p.configured).length > 0 && (
                        <optgroup label="Sin configurar (necesitan API key)">
                          {providers.filter(p => !p.configured).map(p => (
                            <option key={p.id} value={p.id} disabled>{p.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                      Modelo
                    </label>
                    <select
                      value={cfg.model}
                      onChange={e => setServiceEdits(prev => ({ ...prev, [svc.id]: { ...cfg, model: e.target.value } }))}
                      disabled={!cfg.provider_id}
                      style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.90)", border: "1px solid var(--border-hover)", borderRadius: 8, color: cfg.model ? "var(--fg-primary)" : "var(--fg-secondary)", fontSize: 13, outline: "none" }}
                    >
                      <option value="">— Seleccionar modelo —</option>
                      {availableModels.map(m => (
                        <option key={m.id} value={m.id}>{m.label} ({m.contextK}K ctx)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {savedCfg && (
                  <div style={{ fontSize: 11, color: "var(--fg-secondary)", marginBottom: 12 }}>
                    Actual: <span style={{ color: "var(--fg-muted)" }}>{providers.find(p => p.id === savedCfg.provider_id)?.name ?? savedCfg.provider_id}</span> — {savedCfg.model}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => saveServiceConfig(svc.id)}
                    disabled={!cfg.provider_id || !cfg.model || savingSvc === svc.id}
                    style={{
                      padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: cfg.provider_id && cfg.model ? "pointer" : "not-allowed",
                      background: cfg.provider_id && cfg.model ? "rgba(139,92,246,0.9)" : "rgba(255,255,255,0.88)",
                      border: "1px solid rgba(139,92,246,0.4)",
                      color: cfg.provider_id && cfg.model ? "var(--fg-primary)" : "var(--fg-secondary)",
                    }}
                  >
                    {savingSvc === svc.id ? "Guardando..." : "💾 Guardar configuración"}
                  </button>
                  {svcMsg[svc.id] && (
                    <span style={{ fontSize: 12, color: svcMsg[svc.id].startsWith("✓") ? "#4ade80" : "#f87171" }}>
                      {svcMsg[svc.id]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
