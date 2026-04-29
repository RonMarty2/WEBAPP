"use client";

import { useState } from "react";

const PROVIDERS = [
  { id: "groq", name: "Groq", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"], color: "#f97316", docs: "https://console.groq.com" },
  { id: "openai", name: "OpenAI", models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"], color: "#4ade80", docs: "https://platform.openai.com" },
  { id: "anthropic", name: "Anthropic", models: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"], color: "#8b5cf6", docs: "https://console.anthropic.com" },
];

const PLANS = ["demo", "standard", "pro"];

export default function ModelosPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    groq: "gsk_•••••••••••••••••••••••",
    openai: "",
    anthropic: "",
  });
  const [planModels, setPlanModels] = useState<Record<string, string>>({
    demo: "llama-3.3-70b-versatile",
    standard: "llama-3.3-70b-versatile",
    pro: "llama-3.3-70b-versatile",
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const saveApiKey = async (provider: string, key: string) => {
    setSaving(provider);
    try {
      await fetch("/api/generate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, api_key: key }),
      });
      setSaved(provider);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      alert("Error al guardar.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>🤖 Modelos & APIs</h1>
        <p style={{ color: "#94a3b8", fontSize: 15 }}>
          Configura las llaves de API de cada proveedor y asigna qué modelo usa cada plan de usuario.
        </p>
      </div>

      {/* API Keys */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Llaves de API</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {PROVIDERS.map((prov) => (
          <div key={prov.id} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: prov.color }} />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{prov.name}</h3>
              {apiKeys[prov.id] && (
                <span className="badge badge-green">✓ Configurado</span>
              )}
              <a href={prov.docs} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: "auto", color: "#06b6d4", fontSize: 12, textDecoration: "none" }}>
                Obtener API Key →
              </a>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="password"
                className="input-dark"
                placeholder={`Pega tu ${prov.name} API Key aquí...`}
                value={apiKeys[prov.id]}
                onChange={(e) => setApiKeys((prev) => ({ ...prev, [prov.id]: e.target.value }))}
                style={{ flex: 1, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}
              />
              <button
                className="btn-cyan"
                onClick={() => saveApiKey(prov.id, apiKeys[prov.id])}
                disabled={!apiKeys[prov.id] || saving === prov.id}
                style={{ whiteSpace: "nowrap" }}
              >
                {saving === prov.id ? <div className="spinner" /> : saved === prov.id ? "✓ Guardado" : "Guardar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan → Model mapping */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Modelo por Plan</h2>
      <div className="card">
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>
          Define qué modelo de IA usa cada tier de suscripción. Los modelos más potentes se reservan para planes superiores.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PLANS.map((plan) => {
            const allModels = PROVIDERS.flatMap((p) => p.models);
            return (
              <div key={plan} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 100, flexShrink: 0 }}>
                  <span className={`badge ${plan === "demo" ? "badge-amber" : plan === "pro" ? "badge-purple" : "badge-cyan"}`} style={{ fontSize: 12 }}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </span>
                </div>
                <select
                  className="input-dark"
                  value={planModels[plan]}
                  onChange={(e) => setPlanModels((prev) => ({ ...prev, [plan]: e.target.value }))}
                >
                  {allModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <button className="btn-cyan" style={{ marginTop: 20 }}>
          💾 Guardar configuración de modelos
        </button>
      </div>
    </div>
  );
}
