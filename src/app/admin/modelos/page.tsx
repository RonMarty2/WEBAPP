"use client";

import { useState, useEffect } from "react";
import AdminShell, { StaggerRow } from "@/components/admin/AdminShell";

interface ProviderStatus {
  id: string; name: string; color: string; apiDocsUrl: string;
  models: { id: string; label: string; contextK: number }[];
  defaultModel: string; configured: boolean; keyMasked: string;
}
interface ServiceConfig {
  servicio_id: string; provider_id: string; model: string; api_key_masked: string;
}

const SERVICIOS = [
  { id: "mono-001",   code: "MONO",  nombre: "Monografía Académica",  desc: "Diplomados y postgrados" },
  { id: "tesis-001",  code: "TESIS", nombre: "Tesis de Grado",         desc: "Licenciatura con rigor metodológico" },
  { id: "doc-001",    code: "DOC",   nombre: "Material para Docentes", desc: "Syllabus y materiales de enseñanza" },
  { id: "ensayo-001", code: "ENS",   nombre: "Ensayo Académico",       desc: "Ensayos analíticos y críticos" },
];

export default function ModelosPage() {
  const [providers, setProviders]           = useState<ProviderStatus[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [loading, setLoading]               = useState(true);
  const [keyInputs, setKeyInputs]           = useState<Record<string, string>>({});
  const [showKey, setShowKey]               = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey]           = useState<string | null>(null);
  const [keyMsg, setKeyMsg]                 = useState<Record<string, string>>({});
  const [serviceEdits, setServiceEdits]     = useState<Record<string, { provider_id: string; model: string }>>({});
  const [savingSvc, setSavingSvc]           = useState<string | null>(null);
  const [svcMsg, setSvcMsg]                 = useState<Record<string, string>>({});
  const [activeTab, setActiveTab]           = useState<"providers" | "services">("providers");

  useEffect(() => {
    fetch("/api/admin/ai-config").then(r => r.json()).then(d => {
      setProviders(d.providers ?? []);
      setServiceConfigs(d.services ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function getServiceConfig(svcId: string) {
    const edit = serviceEdits[svcId];
    if (edit) return edit;
    const saved = serviceConfigs.find(s => s.servicio_id === svcId);
    return saved ? { provider_id: saved.provider_id, model: saved.model } : { provider_id: "", model: "" };
  }

  function hasUnsavedServiceEdit(svcId: string) {
    const edit = serviceEdits[svcId];
    if (!edit) return false;
    const saved = serviceConfigs.find(s => s.servicio_id === svcId);
    return !saved || saved.provider_id !== edit.provider_id || saved.model !== edit.model;
  }

  async function saveProviderKey(providerId: string) {
    const key = keyInputs[providerId];
    if (!key?.trim()) return;
    setSavingKey(providerId);
    try {
      const res = await fetch("/api/admin/ai-config", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "provider_key", provider_id: providerId, api_key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProviders(prev => prev.map(p => p.id === providerId ? { ...p, configured: true, keyMasked: data.keyMasked } : p));
      setKeyInputs(prev => ({ ...prev, [providerId]: "" }));
      setKeyMsg(prev => ({ ...prev, [providerId]: "[OK] key guardada" }));
      setTimeout(() => setKeyMsg(prev => ({ ...prev, [providerId]: "" })), 3000);
    } catch (e) {
      setKeyMsg(prev => ({ ...prev, [providerId]: "[ERR] " + (e as Error).message }));
    } finally { setSavingKey(null); }
  }

  async function removeProviderKey(providerId: string) {
    try {
      await fetch("/api/admin/ai-config", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "service_config", servicio_id: svcId, provider_id: cfg.provider_id, model: cfg.model }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setServiceConfigs(prev => {
        const exists = prev.find(s => s.servicio_id === svcId);
        if (exists) return prev.map(s => s.servicio_id === svcId ? { ...s, ...cfg } : s);
        return [...prev, { servicio_id: svcId, ...cfg, api_key_masked: "" }];
      });
      setServiceEdits(prev => {
        const next = { ...prev };
        delete next[svcId];
        return next;
      });
      setSvcMsg(prev => ({ ...prev, [svcId]: "[OK] configuración guardada" }));
      setTimeout(() => setSvcMsg(prev => ({ ...prev, [svcId]: "" })), 3000);
    } catch (e) {
      setSvcMsg(prev => ({ ...prev, [svcId]: "[ERR] " + (e as Error).message }));
    } finally { setSavingSvc(null); }
  }

  const configuredCount = providers.filter(p => p.configured).length;

  return (
    <AdminShell
      title="Modelos & APIs"
      code="API — configuración de proveedores IA"
      subtitle="Configura proveedores de IA y asigna qué modelo usa cada servicio."
    >
      {loading ? (
        <div className="adm-muted py-12 text-center">{"// cargando configuracion..."}</div>
      ) : (
        <>
          {/* Status line */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`adm-label ${configuredCount > 0 ? "" : ""}`}>
              [{configuredCount > 0 ? "OK" : "WARN"}]
            </span>
            <span className="adm-caption">
              {configuredCount > 0
                ? `${configuredCount} proveedor${configuredCount > 1 ? "es" : ""} configurado${configuredCount > 1 ? "s" : ""}`
                : "ningún proveedor configurado — agrega al menos una API key"}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: "providers" as const, label: "// proveedores_ia" },
              { id: "services"  as const, label: "// ia_por_servicio" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="adm-btn"
                style={{ fontWeight: activeTab === tab.id ? 700 : 400, background: activeTab === tab.id ? "#000" : "transparent", color: activeTab === tab.id ? "#fff" : "#666" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Providers */}
          {activeTab === "providers" && (
            <div className="adm-card">
              {providers.map((p, i) => (
                <StaggerRow key={p.id} index={i}>
                  <div className="px-5 py-5" style={{ borderBottom: i < providers.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                    <div className="flex items-start gap-4 flex-wrap mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={p.configured ? "adm-badge-ok" : "adm-badge-warn"}>
                            {p.configured ? "[OK]" : "[UNCFG]"}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{p.name}</span>
                        </div>
                        <div className="adm-muted">
                          {p.configured ? `key: ${p.keyMasked}` : "sin api key configurada"}
                        </div>
                      </div>
                      <div className="adm-muted text-right">
                        {p.models.slice(0, 3).map(m => (
                          <div key={m.id} style={{ fontSize: 10 }}>• {m.label} ({m.contextK}K)</div>
                        ))}
                        {p.models.length > 3 && <div style={{ fontSize: 10 }}>+{p.models.length - 3} más</div>}
                      </div>
                      <a href={p.apiDocsUrl} target="_blank" rel="noopener noreferrer"
                        className="adm-label no-underline hover:underline" style={{ fontSize: 10 }}>
                        get_api_key →
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey[p.id] ? "text" : "password"}
                          placeholder={p.configured ? "nueva key para reemplazar..." : "pega tu api key aquí..."}
                          value={keyInputs[p.id] ?? ""}
                          onChange={e => setKeyInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="adm-input"
                        />
                        <button
                          onClick={() => setShowKey(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 12 }}
                        >
                          {showKey[p.id] ? "[hide]" : "[show]"}
                        </button>
                      </div>
                      <button
                        onClick={() => saveProviderKey(p.id)}
                        disabled={!keyInputs[p.id]?.trim() || savingKey === p.id}
                        className="adm-btn adm-btn-primary"
                      >
                        {savingKey === p.id ? "..." : "guardar"}
                      </button>
                      {p.configured && (
                        <button onClick={() => removeProviderKey(p.id)} className="adm-btn adm-btn-danger">
                          borrar
                        </button>
                      )}
                    </div>
                    {keyMsg[p.id] && (
                      <div className="adm-label mt-2" style={{ fontSize: 10, color: keyMsg[p.id].startsWith("[OK]") ? "#000" : "#c00" }}>
                        {keyMsg[p.id]}
                      </div>
                    )}
                  </div>
                </StaggerRow>
              ))}
            </div>
          )}

          {/* Services */}
          {activeTab === "services" && (
            <div className="adm-card">
              {configuredCount === 0 && (
                <div className="px-5 py-3 adm-muted" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  {"// [WARN] configura al menos un proveedor antes de asignar servicios"}
                </div>
              )}
              {SERVICIOS.map((svc, i) => {
                const cfg = getServiceConfig(svc.id);
                const savedCfg = serviceConfigs.find(s => s.servicio_id === svc.id);
                const unsaved = hasUnsavedServiceEdit(svc.id);
                const selectedProvider = providers.find(p => p.id === cfg.provider_id);
                const availableModels = selectedProvider?.models ?? [];
                return (
                  <StaggerRow key={svc.id} index={i}>
                    <div className="px-5 py-5" style={{ borderBottom: i < SERVICIOS.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="adm-label">[{svc.code}]</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{svc.nombre}</div>
                          <div className="adm-muted">{svc.desc}</div>
                        </div>
                        {savedCfg && !unsaved && <span className="adm-badge-ok ml-auto">[OK] activo</span>}
                        {unsaved && <span className="adm-badge-warn ml-auto">[SIN GUARDAR]</span>}
                      </div>
                      <div className="adm-muted mb-3">
                        {unsaved
                          ? "// esta seleccion todavia NO se usara; presiona guardar_config para activarla"
                          : savedCfg
                            ? `// activo ahora: ${savedCfg.provider_id} / ${savedCfg.model}`
                            : "// sin IA activa para este servicio"}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="adm-label mb-1" style={{ fontSize: 9 }}>{"// proveedor"}</div>
                          <select value={cfg.provider_id} className="adm-select w-full"
                            onChange={e => {
                              const prov = providers.find(p => p.id === e.target.value);
                              setServiceEdits(prev => ({ ...prev, [svc.id]: { provider_id: e.target.value, model: prov?.defaultModel ?? "" } }));
                            }}>
                            <option value="">— seleccionar —</option>
                            {providers.filter(p => p.configured).map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="adm-label mb-1" style={{ fontSize: 9 }}>{"// modelo"}</div>
                          <select value={cfg.model} disabled={!cfg.provider_id} className="adm-select w-full"
                            onChange={e => setServiceEdits(prev => ({ ...prev, [svc.id]: { ...cfg, model: e.target.value } }))}>
                            <option value="">— seleccionar —</option>
                            {availableModels.map(m => (
                              <option key={m.id} value={m.id}>{m.label} ({m.contextK}K)</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => saveServiceConfig(svc.id)}
                          disabled={!cfg.provider_id || !cfg.model || savingSvc === svc.id}
                          className="adm-btn adm-btn-primary"
                        >
                          {savingSvc === svc.id ? "..." : "guardar_config"}
                        </button>
                        {svcMsg[svc.id] && (
                          <span className="adm-label" style={{ fontSize: 10, color: svcMsg[svc.id].startsWith("[OK]") ? "#000" : "#c00" }}>
                            {svcMsg[svc.id]}
                          </span>
                        )}
                      </div>
                    </div>
                  </StaggerRow>
                );
              })}
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
