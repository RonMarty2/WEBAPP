"use client";

import { useState, useEffect, useCallback } from "react";

interface PhaseData {
  label: string;
  prompt: string;
  isCustom: boolean;
}

interface WorkspaceData {
  hilos: string[];
  phases: Record<string, PhaseData>;
}

// key = "hilos" | "onboarding" | "0".."5"
type SelectionKey = "hilos" | "onboarding" | "0" | "1" | "2" | "3" | "4" | "5";

const SIDEBAR_ITEMS: { key: SelectionKey; icon: string; label: string; color?: string }[] = [
  { key: "hilos",      icon: "🔗", label: "Hilos Conductores",        color: "#fde68a" },
  { key: "onboarding", icon: "✨", label: "Generador de Temas",       color: "#a78bfa" },
  { key: "0",          icon: "📝", label: "Fase 0 — Planteamiento" },
  { key: "1",          icon: "📄", label: "Fase 1 — Cap. I" },
  { key: "2",          icon: "📚", label: "Fase 2 — Cap. II" },
  { key: "3",          icon: "📊", label: "Fase 3 — Caps. III-V" },
  { key: "4",          icon: "🔍", label: "Fase 4 — Revisión" },
  { key: "5",          icon: "🏁", label: "Fase 5 — Final" },
];

// What the code injects automatically into the user message for each key
const AUTO_CONTEXT: Record<SelectionKey, string> = {
  hilos: "",
  onboarding: `Programa / Posgrado: [lo que el estudiante ingresó]
Materias destacadas: [opcional]
Entorno laboral / institución: [opcional]

Por favor, sugiere 3 temas de investigación viables y concretos para una monografía.`,
  "0": `TEMA APROBADO: "[el tema que el estudiante eligió]"
TÍTULO PROVISIONAL: "[título si existe]"

Genera el contenido de la Fase 0 — Planteamiento del Tema.`,
  "1": `TEMA APROBADO: "[tema elegido]"
TÍTULO PROVISIONAL: "[título]"

--- RESUMEN DE FASES ANTERIORES ---
=== Fase 0 — Planteamiento del Tema ===
[contenido de la fase 0]
=== FIN ===

Genera el contenido de la Fase 1 — Capítulo I.`,
  "2": `TEMA APROBADO: "[tema]"

--- RESUMEN DE FASES ANTERIORES ---
=== Fase 0 — Planteamiento ===  [...]
=== Fase 1 — Cap. I === [...]
=== FIN ===

Genera el contenido de la Fase 2 — Capítulo II.`,
  "3": `TEMA APROBADO: "[tema]"

--- RESUMEN DE FASES ANTERIORES ---
Fases 0, 1 y 2 como contexto [...]

Genera el contenido de la Fase 3 — Capítulos III-V.`,
  "4": `TEMA APROBADO: "[tema]"

--- RESUMEN DE FASES ANTERIORES ---
Fases 0-3 como contexto [...]

Genera el contenido de la Fase 4 — Revisión.`,
  "5": `TEMA APROBADO: "[tema]"

--- RESUMEN DE FASES ANTERIORES ---
Fases 0-4 como contexto [...]

Genera el contenido de la Fase 5 — Conclusiones y Bibliografía.`,
};

export default function PromptsPage() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [selected, setSelected] = useState<SelectionKey>("hilos");
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftHilos, setDraftHilos] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContext, setShowContext] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/workspace-prompts");
      const json = await res.json() as WorkspaceData;
      setData(json);
      setDraftHilos(json.hilos.join("\n"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data) return;
    if (selected === "hilos") {
      setDraftHilos(data.hilos.join("\n"));
    } else {
      setDraftPrompt(data.phases[selected]?.prompt ?? "");
    }
    setSaved(false);
    setShowContext(false);
  }, [selected, data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected === "hilos") {
        const hilos = draftHilos.split("\n").map((l) => l.trim()).filter(Boolean);
        await fetch("/api/admin/workspace-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "hilos", hilos }),
        });
        setData((prev) => prev ? { ...prev, hilos } : prev);
      } else {
        await fetch("/api/admin/workspace-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "phase", key: selected, prompt: draftPrompt }),
        });
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            phases: {
              ...prev.phases,
              [selected]: { ...prev.phases[selected], prompt: draftPrompt, isCustom: true },
            },
          };
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (selected === "hilos" || !confirm("¿Restaurar el prompt original de este item?")) return;
    await fetch("/api/admin/workspace-prompts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: selected }),
    });
    await load();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const isHilos = selected === "hilos";
  const isDirty = isHilos
    ? draftHilos !== (data?.hilos.join("\n") ?? "")
    : draftPrompt !== (data?.phases[selected]?.prompt ?? "");
  const currentPhaseData = !isHilos ? data?.phases[selected] : null;
  const isCustom = currentPhaseData?.isCustom ?? false;
  const sidebarItem = SIDEBAR_ITEMS.find((s) => s.key === selected);
  const autoCtx = AUTO_CONTEXT[selected];

  return (
    <div className="fade-in" style={{ display: "flex", gap: 24, height: "calc(100vh - 64px)" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>✍️ Prompts del Workspace</h1>

        {SIDEBAR_ITEMS.map((item, idx) => {
          const isSelected = selected === item.key;
          const phaseData = item.key !== "hilos" ? data?.phases[item.key] : null;
          const itemColor = item.color ?? "#06b6d4";

          // Separator before Fase 0
          const showSep = idx === 2;

          return (
            <div key={item.key}>
              {showSep && <div style={{ height: 1, background: "rgba(148,163,184,0.1)", margin: "6px 0" }} />}
              <button
                onClick={() => setSelected(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                  borderRadius: 8, border: "1px solid transparent", cursor: "pointer",
                  textAlign: "left", fontSize: 13, width: "100%",
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? itemColor : "#94a3b8",
                  background: isSelected ? `rgba(${item.color ? "167,139,250" : "6,182,212"},0.10)` : "transparent",
                  borderColor: isSelected ? `${itemColor}44` : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.key === "hilos" && (
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{data?.hilos.length ?? 0} reglas</span>
                )}
                {phaseData?.isCustom && (
                  <span style={{ fontSize: 9, background: `${itemColor}33`, color: itemColor, padding: "2px 6px", borderRadius: 4 }}>
                    editado
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Info box */}
        <div style={{ marginTop: "auto", padding: 12, background: "rgba(6,182,212,0.06)", borderRadius: 8, border: "1px solid rgba(6,182,212,0.12)", fontSize: 11, color: "#64748b" }}>
          <div style={{ color: "#06b6d4", fontWeight: 700, marginBottom: 6, fontSize: 12 }}>ℹ️ Cómo funciona</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Tu prompt es el <strong style={{ color: "#94a3b8" }}>System Prompt</strong>. El código inyecta automáticamente los datos del proyecto (tema, fases anteriores) en el User Message.
            Los <strong style={{ color: "#94a3b8" }}>Hilos Conductores</strong> se anteponen a todos los prompts.
          </p>
        </div>
      </div>

      {/* ── Editor ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {sidebarItem?.icon} {isHilos ? "Hilos Conductores" : (currentPhaseData?.label ?? sidebarItem?.label)}
            </h2>
            <p style={{ fontSize: 12, color: "#475569", margin: "4px 0 0" }}>
              {isHilos
                ? "Reglas inmutables que se aplican a TODAS las fases. Una regla por línea."
                : selected === "onboarding"
                  ? "Se ejecuta cuando el estudiante crea un proyecto nuevo y pide sugerencias de tema."
                  : "Prompt del sistema para esta fase. Recibirá el contexto de fases anteriores automáticamente."}
            </p>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {!isHilos && isCustom && (
              <button className="btn-ghost" onClick={handleReset} style={{ fontSize: 12 }}>
                🔄 Restaurar original
              </button>
            )}
            <button
              className="btn-cyan"
              onClick={handleSave}
              disabled={saving || !isDirty}
              style={{ fontSize: 13, opacity: isDirty ? 1 : 0.5 }}
            >
              {saving ? <><div className="spinner" /> Guardando...</> : saved ? "✓ Guardado" : "💾 Guardar"}
            </button>
          </div>
        </div>

        {/* Editor area */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>

          {isHilos ? (
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label className="label">Reglas inmutables (una por línea)</label>
              <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
                Estas reglas se añaden al inicio del prompt de sistema de CADA fase, antes de cualquier otra instrucción.
              </p>
              <textarea
                className="input-dark"
                rows={16}
                value={draftHilos}
                onChange={(e) => { setDraftHilos(e.target.value); setSaved(false); }}
                placeholder={"Ej:\nSiempre escribe en español formal académico.\nNo inventes datos, autores ni citas bibliográficas.\nMantén coherencia con el tema y la universidad del estudiante."}
                style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, lineHeight: 1.75, flex: 1 }}
              />
              {draftHilos.trim() && (
                <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
                  {draftHilos.split("\n").filter((l) => l.trim()).length} regla(s) definidas
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Auto-injected context info */}
              {autoCtx && (
                <div style={{ borderRadius: 8, border: "1px solid rgba(6,182,212,0.15)", overflow: "hidden" }}>
                  <button
                    onClick={() => setShowContext(v => !v)}
                    style={{
                      width: "100%", padding: "9px 14px", background: "rgba(6,182,212,0.06)",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                      fontSize: 12, color: "#64748b", textAlign: "left",
                    }}
                  >
                    <span style={{ color: "#06b6d4" }}>📥</span>
                    <span style={{ flex: 1 }}>
                      {selected === "onboarding"
                        ? "Datos del estudiante que el código inyecta automáticamente"
                        : "User Message que el código construye automáticamente (haz clic para ver)"}
                    </span>
                    <span style={{ fontSize: 10 }}>{showContext ? "▲" : "▼"}</span>
                  </button>
                  {showContext && (
                    <pre style={{
                      margin: 0, padding: "10px 14px",
                      background: "rgba(0,0,0,0.2)",
                      fontFamily: "JetBrains Mono, monospace", fontSize: 11,
                      color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap",
                    }}>
                      {autoCtx}
                    </pre>
                  )}
                </div>
              )}

              {/* Context notice for workspace phases */}
              {selected !== "onboarding" && (
                <div style={{ padding: "9px 14px", background: "rgba(6,182,212,0.04)", borderRadius: 8, border: "1px solid rgba(6,182,212,0.1)", fontSize: 12, color: "#64748b" }}>
                  🔄{" "}
                  {selected === "0"
                    ? "Esta fase es la primera del workspace — el tema aprobado llega en el User Message."
                    : `Esta fase recibe automáticamente el contenido de las Fases 0-${Number(selected) - 1} como contexto.`}
                  {" "}Los Hilos Conductores también se anteponen si están configurados.
                </div>
              )}

              <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label className="label">
                  {selected === "onboarding" ? "Prompt del Generador de Temas" : `Prompt del Sistema — ${currentPhaseData?.label}`}
                </label>
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
                  {selected === "onboarding"
                    ? "Instrucciones para que la IA proponga 3 temas viables. Los datos del estudiante (programa, materias, entorno) llegan automáticamente en el User Message — no los repitas aquí."
                    : "Instrucciones principales para la IA. El contexto del proyecto y los Hilos Conductores se agregan automáticamente — no necesitas repetirlos aquí."}
                </p>
                <textarea
                  className="input-dark"
                  value={draftPrompt}
                  onChange={(e) => { setDraftPrompt(e.target.value); setSaved(false); }}
                  style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, lineHeight: 1.75, flex: 1, minHeight: 340 }}
                />
                <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
                  {draftPrompt.split(/\s+/).filter(Boolean).length} palabras · {draftPrompt.length} caracteres
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
