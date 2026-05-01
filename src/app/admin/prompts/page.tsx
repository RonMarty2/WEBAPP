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

type Selection = { type: "phase"; fase: number } | { type: "hilos" };

const PHASE_ICONS: Record<number, string> = {
  0: "🎯", 1: "📄", 2: "📚", 3: "📊", 4: "🔍", 5: "🏁",
};

export default function PromptsPage() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [selection, setSelection] = useState<Selection>({ type: "hilos" });
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftHilos, setDraftHilos] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/workspace-prompts");
      const json = await res.json() as WorkspaceData;
      setData(json);
      setDraftHilos(json.hilos.join("\n"));
      if (selection.type === "phase") {
        setDraftPrompt(json.phases[String(selection.fase)]?.prompt ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // When selection changes, sync the draft
  useEffect(() => {
    if (!data) return;
    if (selection.type === "hilos") {
      setDraftHilos(data.hilos.join("\n"));
    } else {
      setDraftPrompt(data.phases[String(selection.fase)]?.prompt ?? "");
    }
    setSaved(false);
  }, [selection, data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selection.type === "hilos") {
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
          body: JSON.stringify({ type: "phase", fase: selection.fase, prompt: draftPrompt }),
        });
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            phases: {
              ...prev.phases,
              [String(selection.fase)]: { ...prev.phases[String(selection.fase)], prompt: draftPrompt, isCustom: true },
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

  const handleResetPhase = async (fase: number) => {
    if (!confirm("¿Restaurar el prompt por defecto de esta fase?")) return;
    await fetch("/api/admin/workspace-prompts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase }),
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

  const isDirty = selection.type === "hilos"
    ? draftHilos !== (data?.hilos.join("\n") ?? "")
    : draftPrompt !== (data?.phases[String(selection.fase)]?.prompt ?? "");

  const currentPhase = selection.type === "phase" ? data?.phases[String(selection.fase)] : null;

  return (
    <div className="fade-in" style={{ display: "flex", gap: 24, height: "calc(100vh - 64px)" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>✍️ Prompts del Workspace</h1>

        {/* Hilos conductores */}
        <button
          onClick={() => setSelection({ type: "hilos" })}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
            borderRadius: 8, border: "1px solid transparent", cursor: "pointer",
            textAlign: "left", fontSize: 13,
            fontWeight: selection.type === "hilos" ? 700 : 400,
            color: selection.type === "hilos" ? "#fde68a" : "#94a3b8",
            background: selection.type === "hilos" ? "rgba(245,158,11,0.12)" : "transparent",
            borderColor: selection.type === "hilos" ? "rgba(245,158,11,0.25)" : "transparent",
            transition: "all 0.15s",
          }}
        >
          🔗 Hilos Conductores
          <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.7 }}>
            {data?.hilos.length ?? 0} reglas
          </span>
        </button>

        <div style={{ height: 1, background: "rgba(148,163,184,0.1)", margin: "6px 0" }} />

        {/* Phase 0-5 */}
        {[0, 1, 2, 3, 4, 5].map((n) => {
          const phase = data?.phases[String(n)];
          const isSelected = selection.type === "phase" && selection.fase === n;
          return (
            <button
              key={n}
              onClick={() => setSelection({ type: "phase", fase: n })}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                borderRadius: 8, border: "1px solid transparent", cursor: "pointer",
                textAlign: "left", fontSize: 13,
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? "#e2e8f0" : "#94a3b8",
                background: isSelected ? "rgba(6,182,212,0.12)" : "transparent",
                borderColor: isSelected ? "rgba(6,182,212,0.25)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span>{PHASE_ICONS[n]}</span>
              <span style={{ flex: 1 }}>Fase {n}</span>
              {phase?.isCustom && (
                <span style={{ fontSize: 9, background: "rgba(6,182,212,0.2)", color: "#06b6d4", padding: "2px 6px", borderRadius: 4 }}>
                  editado
                </span>
              )}
            </button>
          );
        })}

        {/* Info box */}
        <div style={{ marginTop: "auto", padding: 12, background: "rgba(6,182,212,0.06)", borderRadius: 8, border: "1px solid rgba(6,182,212,0.12)", fontSize: 11, color: "#64748b" }}>
          <div style={{ color: "#06b6d4", fontWeight: 700, marginBottom: 6, fontSize: 12 }}>ℹ️ Cómo funciona</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Los <strong style={{ color: "#94a3b8" }}>Hilos Conductores</strong> son reglas fijas que se anteponen al prompt de cada fase.<br /><br />
            Cada fase recibe automáticamente el contenido de todas las fases anteriores como contexto.
          </p>
        </div>
      </div>

      {/* ── Editor ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              {selection.type === "hilos"
                ? "🔗 Hilos Conductores"
                : `${PHASE_ICONS[selection.fase]} ${currentPhase?.label}`}
            </h2>
            <p style={{ fontSize: 12, color: "#475569", margin: "4px 0 0" }}>
              {selection.type === "hilos"
                ? "Reglas inmutables que se aplican a TODAS las fases. Una regla por línea."
                : "Prompt del sistema para esta fase. Recibirá el contexto de fases anteriores automáticamente."}
            </p>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {selection.type === "phase" && currentPhase?.isCustom && (
              <button
                className="btn-ghost"
                onClick={() => handleResetPhase(selection.fase)}
                style={{ fontSize: 12 }}
              >
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
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {selection.type === "hilos" ? (
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label className="label">Reglas inmutables (una por línea)</label>
              <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
                Estas reglas se añaden al inicio del prompt de sistema de CADA fase, antes de cualquier otra instrucción.
                Úsalas para definir el tono, restricciones éticas, formato obligatorio, etc.
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
              {/* Context notice */}
              <div style={{ padding: "10px 14px", background: "rgba(6,182,212,0.06)", borderRadius: 8, border: "1px solid rgba(6,182,212,0.12)", fontSize: 12, color: "#64748b", display: "flex", gap: 8 }}>
                <span>🔄</span>
                <span>
                  Esta fase recibirá automáticamente el contenido de{" "}
                  {selection.fase === 0 ? "ninguna fase anterior (es la primera)." :
                    selection.fase === 1 ? "la Fase 0 como contexto." :
                    `las Fases 0-${selection.fase - 1} como contexto.`}
                  {" "}Los Hilos Conductores también se anteponen si están configurados.
                </span>
              </div>

              <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label className="label">Prompt del Sistema — {currentPhase?.label}</label>
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
                  Instrucciones principales para la IA en esta fase. El contexto de fases anteriores y los Hilos Conductores
                  se agregan automáticamente — no necesitas repetirlos aquí.
                </p>
                <textarea
                  className="input-dark"
                  value={draftPrompt}
                  onChange={(e) => { setDraftPrompt(e.target.value); setSaved(false); }}
                  style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, lineHeight: 1.75, flex: 1, minHeight: 360 }}
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
