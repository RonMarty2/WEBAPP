"use client";

import { useEffect, useState } from "react";
import AdminShell, { StaggerRow } from "@/components/admin/AdminShell";

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

interface ServiceIncident {
  servicio_id: string;
  provider_id: string;
  provider_name: string;
  model: string;
  kind: "token_limit" | "provider_capacity";
  level: "critical" | "warning";
  message: string;
  updated_at: string;
}

const SERVICIOS = [
  { id: "mono-001", code: "MONO", nombre: "Monografia Academica", desc: "Diplomados y postgrados" },
  { id: "tesis-001", code: "TESIS", nombre: "Tesis de Grado", desc: "Licenciatura con rigor metodologico" },
  { id: "doc-001", code: "DOC", nombre: "Material para Docentes", desc: "Syllabus y materiales de ensenanza" },
  { id: "ensayo-001", code: "ENS", nombre: "Ensayo Academico", desc: "Ensayos analiticos y criticos" },
];

export default function ModelosPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([]);
  const [incidents, setIncidents] = useState<ServiceIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [keyMsg, setKeyMsg] = useState<Record<string, string>>({});
  const [serviceEdits, setServiceEdits] = useState<Record<string, { provider_id: string; model: string }>>({});
  const [savingSvc, setSavingSvc] = useState<string | null>(null);
  const [svcMsg, setSvcMsg] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"providers" | "services">("providers");

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => r.json())
      .then((d) => {
        setProviders(d.providers ?? []);
        setServiceConfigs(d.services ?? []);
        setIncidents(d.incidents ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function getServiceConfig(svcId: string) {
    const edit = serviceEdits[svcId];
    if (edit) return edit;
    const saved = serviceConfigs.find((svc) => svc.servicio_id === svcId);
    return saved ? { provider_id: saved.provider_id, model: saved.model } : { provider_id: "", model: "" };
  }

  function hasUnsavedServiceEdit(svcId: string) {
    const edit = serviceEdits[svcId];
    if (!edit) return false;
    const saved = serviceConfigs.find((svc) => svc.servicio_id === svcId);
    return !saved || saved.provider_id !== edit.provider_id || saved.model !== edit.model;
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

      setProviders((prev) => prev.map((provider) => (
        provider.id === providerId ? { ...provider, configured: true, keyMasked: data.keyMasked } : provider
      )));
      setKeyInputs((prev) => ({ ...prev, [providerId]: "" }));
      setKeyMsg((prev) => ({ ...prev, [providerId]: "[OK] key guardada" }));
      setTimeout(() => setKeyMsg((prev) => ({ ...prev, [providerId]: "" })), 3000);
    } catch (e) {
      setKeyMsg((prev) => ({ ...prev, [providerId]: "[ERR] " + (e as Error).message }));
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
      setProviders((prev) => prev.map((provider) => (
        provider.id === providerId ? { ...provider, configured: false, keyMasked: "" } : provider
      )));
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "No se pudo guardar");

      setServiceConfigs((prev) => {
        const exists = prev.find((svc) => svc.servicio_id === svcId);
        if (exists) return prev.map((svc) => (svc.servicio_id === svcId ? { ...svc, ...cfg } : svc));
        return [...prev, { servicio_id: svcId, ...cfg, api_key_masked: "" }];
      });
      setServiceEdits((prev) => {
        const next = { ...prev };
        delete next[svcId];
        return next;
      });
      setSvcMsg((prev) => ({ ...prev, [svcId]: "[OK] configuracion guardada" }));
      setTimeout(() => setSvcMsg((prev) => ({ ...prev, [svcId]: "" })), 3000);
    } catch (e) {
      setSvcMsg((prev) => ({ ...prev, [svcId]: "[ERR] " + (e as Error).message }));
    } finally {
      setSavingSvc(null);
    }
  }

  const configuredCount = providers.filter((provider) => provider.configured).length;
  const monoConfig = serviceConfigs.find((svc) => svc.servicio_id === "mono-001");
  const monoIncident = incidents.find((incident) => incident.servicio_id === "mono-001");
  const monoProviderReady = monoConfig ? providers.find((provider) => provider.id === monoConfig.provider_id)?.configured : false;
  const monoReady = Boolean(monoConfig?.model && monoProviderReady);

  return (
    <AdminShell
      title="Modelos & APIs"
      code="AI CONTROL"
      subtitle="Asigna proveedor y modelo por servicio. Este es el tablero que resuelve el bloqueo de mono-001."
    >
      {loading ? (
        <div className="adm-muted py-12 text-center">{"// cargando configuracion..."}</div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] mb-6">
            <div className="adm-card adm-card-strong p-5">
              <div className="adm-label mb-3">servicio principal</div>
              <div className="text-[22px] font-bold leading-tight" style={{ color: "#edf2fb" }}>
                {monoReady ? "mono-001 operativo" : "mono-001 bloqueado"}
              </div>
              <div className="adm-caption mt-3">
                {monoReady
                  ? "Monografia ya tiene proveedor y modelo activos. El generador no deberia volver a fallar por configuracion."
                  : "La captura que enviaste aparece cuando el flujo de monografia intenta generar y no encuentra una IA activa para este servicio."}
              </div>
            </div>
            <div className="adm-card p-5">
              <div className="adm-label mb-3">pasos para desbloquear</div>
              <div className="space-y-2 text-[12px]" style={{ color: "#cad5e2" }}>
                <div>1. Guarda una API key valida en proveedores.</div>
                <div>2. En servicios, asigna proveedor y modelo al bloque `MONO`.</div>
                <div>3. Presiona `guardar_config` y vuelve a probar el generador.</div>
              </div>
            </div>
          </div>

          {monoIncident ? (
            <div className="adm-card mb-6 p-5" style={{ borderColor: "rgba(248, 113, 113, 0.28)", background: "linear-gradient(180deg, rgba(127, 29, 29, 0.26), rgba(15, 23, 42, 0.92))" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="adm-badge-danger">alerta_admin</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fecaca" }}>
                  {monoIncident.kind === "token_limit" ? "sin creditos o tokens disponibles" : "proveedor temporalmente no disponible"}
                </span>
              </div>
              <div className="adm-caption" style={{ color: "#fecaca" }}>
                {monoIncident.provider_name} / {monoIncident.model}
              </div>
              <div className="adm-muted mt-3" style={{ color: "#fca5a5", whiteSpace: "pre-wrap" }}>
                {monoIncident.message}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3 mb-6">
            <span className="adm-label">[{configuredCount > 0 ? "OK" : "WARN"}]</span>
            <span className="adm-caption">
              {configuredCount > 0
                ? `${configuredCount} proveedor${configuredCount > 1 ? "es" : ""} listo${configuredCount > 1 ? "s" : ""}`
                : "ningun proveedor configurado. Sin una API key valida, ningun servicio puede generar."}
            </span>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { id: "providers" as const, label: "proveedores_ia" },
              { id: "services" as const, label: "ia_por_servicio" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`adm-btn ${activeTab === tab.id ? "adm-btn-active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "providers" ? (
            <div className="adm-card">
              {providers.map((provider, index) => (
                <StaggerRow key={provider.id} index={index}>
                  <div className="px-5 py-5" style={{ borderBottom: index < providers.length - 1 ? "1px solid rgba(140, 154, 176, 0.16)" : "none" }}>
                    <div className="flex items-start gap-4 flex-wrap mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={provider.configured ? "adm-badge-ok" : "adm-badge-warn"}>
                            {provider.configured ? "[OK]" : "[UNCFG]"}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#edf2fb" }}>{provider.name}</span>
                        </div>
                        <div className="adm-muted">
                          {provider.configured ? `key: ${provider.keyMasked}` : "sin api key configurada"}
                        </div>
                      </div>
                      <div className="adm-muted text-right">
                        {provider.models.slice(0, 3).map((model) => (
                          <div key={model.id} style={{ fontSize: 10 }}>- {model.label} ({model.contextK}K)</div>
                        ))}
                        {provider.models.length > 3 ? <div style={{ fontSize: 10 }}>+{provider.models.length - 3} mas</div> : null}
                      </div>
                      <a href={provider.apiDocsUrl} target="_blank" rel="noopener noreferrer" className="adm-label no-underline hover:underline" style={{ fontSize: 10 }}>
                        abrir docs
                      </a>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey[provider.id] ? "text" : "password"}
                          placeholder={provider.configured ? "nueva key para reemplazar..." : "pega tu api key aqui..."}
                          value={keyInputs[provider.id] ?? ""}
                          onChange={(e) => setKeyInputs((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                          className="adm-input"
                          aria-label={`API key de ${provider.name}`}
                        />
                        <button
                          onClick={() => setShowKey((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8a97aa", cursor: "pointer", fontSize: 12 }}
                          aria-label={showKey[provider.id] ? `Ocultar API key de ${provider.name}` : `Mostrar API key de ${provider.name}`}
                        >
                          {showKey[provider.id] ? "[hide]" : "[show]"}
                        </button>
                      </div>
                      <button
                        onClick={() => saveProviderKey(provider.id)}
                        disabled={!keyInputs[provider.id]?.trim() || savingKey === provider.id}
                        className="adm-btn adm-btn-primary"
                      >
                        {savingKey === provider.id ? "..." : "guardar"}
                      </button>
                      {provider.configured ? (
                        <button onClick={() => removeProviderKey(provider.id)} className="adm-btn adm-btn-danger">
                          borrar
                        </button>
                      ) : null}
                    </div>

                    {keyMsg[provider.id] ? (
                      <div className="adm-label mt-2" style={{ fontSize: 10, color: keyMsg[provider.id].startsWith("[OK]") ? "#7dd3a7" : "#fca5a5" }}>
                        {keyMsg[provider.id]}
                      </div>
                    ) : null}
                  </div>
                </StaggerRow>
              ))}
            </div>
          ) : (
            <div className="adm-card">
              {configuredCount === 0 ? (
                <div className="px-5 py-3 adm-muted" style={{ borderBottom: "1px solid rgba(140, 154, 176, 0.16)" }}>
                  {"// [WARN] configura al menos un proveedor antes de asignar servicios"}
                </div>
              ) : null}

              {SERVICIOS.map((svc, index) => {
                const cfg = getServiceConfig(svc.id);
                const savedCfg = serviceConfigs.find((item) => item.servicio_id === svc.id);
                const incident = incidents.find((item) => item.servicio_id === svc.id);
                const unsaved = hasUnsavedServiceEdit(svc.id);
                const selectedProvider = providers.find((provider) => provider.id === cfg.provider_id);
                const availableModels = selectedProvider?.models ?? [];

                return (
                  <StaggerRow key={svc.id} index={index}>
                    <div className="px-5 py-5" style={{ borderBottom: index < SERVICIOS.length - 1 ? "1px solid rgba(140, 154, 176, 0.16)" : "none" }}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="adm-label">[{svc.code}]</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#edf2fb" }}>{svc.nombre}</div>
                          <div className="adm-muted">{svc.desc}</div>
                        </div>
                        {incident ? <span className="adm-badge-danger ml-auto">alerta</span> : null}
                        {savedCfg && !unsaved ? <span className="adm-badge-ok ml-auto">activo</span> : null}
                        {unsaved ? <span className="adm-badge-warn ml-auto">sin guardar</span> : null}
                      </div>

                      <div className="adm-muted mb-3">
                        {incident
                          ? `// alerta admin: ${incident.kind === "token_limit" ? "creditos/tokens agotados" : "proveedor temporalmente no disponible"}`
                          : unsaved
                          ? "// esta seleccion todavia no entra en servicio hasta guardar"
                          : savedCfg
                            ? `// activo ahora: ${savedCfg.provider_id} / ${savedCfg.model}`
                            : "// sin IA activa para este servicio"}
                      </div>

                      {incident ? (
                        <div className="adm-muted mb-3" style={{ color: "#fca5a5", whiteSpace: "pre-wrap" }}>
                          {incident.message}
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="adm-label mb-1" style={{ fontSize: 9 }}>proveedor</div>
                          <select
                            value={cfg.provider_id}
                            className="adm-select w-full"
                            onChange={(e) => {
                              const provider = providers.find((item) => item.id === e.target.value);
                              setServiceEdits((prev) => ({ ...prev, [svc.id]: { provider_id: e.target.value, model: provider?.defaultModel ?? "" } }));
                            }}
                            aria-label={`Proveedor para ${svc.nombre}`}
                          >
                            <option value="">seleccionar</option>
                            {providers.filter((provider) => provider.configured).map((provider) => (
                              <option key={provider.id} value={provider.id}>{provider.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="adm-label mb-1" style={{ fontSize: 9 }}>modelo</div>
                          <select
                            value={cfg.model}
                            disabled={!cfg.provider_id}
                            className="adm-select w-full"
                            onChange={(e) => setServiceEdits((prev) => ({ ...prev, [svc.id]: { ...cfg, model: e.target.value } }))}
                            aria-label={`Modelo para ${svc.nombre}`}
                          >
                            <option value="">seleccionar</option>
                            {availableModels.map((model) => (
                              <option key={model.id} value={model.id}>{model.label} ({model.contextK}K)</option>
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
                        {svcMsg[svc.id] ? (
                          <span className="adm-label" style={{ fontSize: 10, color: svcMsg[svc.id].startsWith("[OK]") ? "#7dd3a7" : "#fca5a5" }}>
                            {svcMsg[svc.id]}
                          </span>
                        ) : null}
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
