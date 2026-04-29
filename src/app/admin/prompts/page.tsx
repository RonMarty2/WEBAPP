"use client";

import { useState, useEffect } from "react";
import { SECTION_STEPS, DEFAULT_PROMPTS, MasterPrompt } from "@/lib/data";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Record<string, MasterPrompt>>({ ...DEFAULT_PROMPTS });
  const [selectedKey, setSelectedKey] = useState(SECTION_STEPS[0].key);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentPrompt = prompts[selectedKey];

  const updateField = (field: keyof MasterPrompt, value: string) => {
    setPrompts((prev) => ({
      ...prev,
      [selectedKey]: { ...prev[selectedKey], [field]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPrompt),
      });
      // Also persist locally
      localStorage.setItem("lab_prompts", JSON.stringify(prompts));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Error al guardar el prompt.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrompts((prev) => ({
      ...prev,
      [selectedKey]: DEFAULT_PROMPTS[selectedKey],
    }));
    setSaved(false);
  };

  return (
    <div className="fade-in" style={{ display: "flex", gap: 24, height: "calc(100vh - 64px)" }}>
      {/* Section selector */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>✍️ Prompts Maestros</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SECTION_STEPS.map((step) => (
            <button
              key={step.key}
              onClick={() => setSelectedKey(step.key)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                borderRadius: 8, border: "1px solid transparent", cursor: "pointer",
                textAlign: "left", fontSize: 13, fontWeight: selectedKey === step.key ? 600 : 400,
                color: selectedKey === step.key ? "#e2e8f0" : "#94a3b8",
                background: selectedKey === step.key ? "rgba(6,182,212,0.12)" : "transparent",
                borderColor: selectedKey === step.key ? "rgba(6,182,212,0.25)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span>{step.icon}</span> {step.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: 12, background: "rgba(6,182,212,0.06)", borderRadius: 8, border: "1px solid rgba(6,182,212,0.15)", fontSize: 12, color: "#94a3b8" }}>
          <div style={{ color: "#06b6d4", fontWeight: 600, marginBottom: 6 }}>ℹ️ Variables disponibles</div>
          {["{programa}", "{modulos}", "{interes}", "{universidad}", "{modalidad}", "{titulo}", "{introduccion}", "{justificacion}", "{planteamiento}", "{objetivos}", "{marco_teorico}", "{metodologia}"].map(v => (
            <div key={v} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#475569", marginBottom: 2 }}>{v}</div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            {SECTION_STEPS.find(s => s.key === selectedKey)?.icon} {currentPrompt?.section_label}
          </h2>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={handleReset} style={{ fontSize: 13 }}>
              🔄 Restaurar original
            </button>
            <button className="btn-cyan" onClick={handleSave} disabled={saving} style={{ fontSize: 13 }}>
              {saving ? <><div className="spinner" /> Guardando...</> : saved ? "✓ Guardado" : "💾 Guardar cambios"}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* System Prompt */}
          <div className="card">
            <label className="label">Prompt del Sistema (instrucciones para la IA)</label>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
              Estas son las instrucciones principales que definen cómo la IA debe comportarse al generar esta sección.
              Puedes usar las variables de la izquierda entre llaves {"{}"}
            </p>
            <textarea
              className="input-dark"
              rows={14}
              value={currentPrompt?.system_prompt || ""}
              onChange={(e) => updateField("system_prompt", e.target.value)}
              style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.7 }}
            />
          </div>

          {/* User Template */}
          <div className="card">
            <label className="label">Plantilla del Usuario (datos que se envían)</label>
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
              El mensaje del usuario que se enviará con los datos del estudiante. Usa las variables {"{}"}
            </p>
            <textarea
              className="input-dark"
              rows={6}
              value={currentPrompt?.user_template || ""}
              onChange={(e) => updateField("user_template", e.target.value)}
              style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.7 }}
            />
          </div>

          {/* Models per plan */}
          <div className="card">
            <label className="label">Modelo por Plan (para esta sección específica)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 12 }}>
              {(["demo", "standard", "pro"] as const).map((plan) => {
                const fieldMap = { demo: "model_demo", standard: "model_standard", pro: "model_pro" } as const;
                return (
                  <div key={plan}>
                    <div className={`badge ${plan === "demo" ? "badge-amber" : plan === "pro" ? "badge-purple" : "badge-cyan"}`} style={{ marginBottom: 8 }}>
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </div>
                    <input
                      className="input-dark"
                      value={(currentPrompt as Record<string, string>)?.[fieldMap[plan]] || ""}
                      onChange={(e) => updateField(fieldMap[plan], e.target.value)}
                      style={{ fontSize: 12, fontFamily: "monospace" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
