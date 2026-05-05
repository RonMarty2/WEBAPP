"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PhaseData {
  label: string;
  prompt: string;
  prompt_borrador?: string;
  prompt_final?: string;
  isCustom: boolean;
}

interface WorkspaceData {
  hilos: string[];
  phases: Record<string, PhaseData>;
}

interface CalibracionPregunta {
  id: string;
  servicio_id: string;
  pregunta: string;
  descripcion?: string;
  orden: number;
  minimo_palabras: number;
  activo: boolean;
}

type SelectionKey = "hilos" | "onboarding" | "calibracion" | "estilo-analizador" | "0" | "1" | "2" | "3" | "4" | "5";

// ── Sidebar config ────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { key: SelectionKey; icon: string; label: string; color?: string }[] = [
  { key: "hilos",              icon: "🔗", label: "Hilos Conductores",     color: "#fde68a" },
  { key: "onboarding",         icon: "✨", label: "Generador de Temas",    color: "#a78bfa" },
  { key: "calibracion",        icon: "🎓", label: "Calibración de Estilo", color: "#f472b6" },
  { key: "estilo-analizador",  icon: "🧬", label: "Analizador de Estilo",  color: "#34d399" },
];

const PHASE_KEYS = ["0", "1", "2", "3", "4", "5"] as const;

const AUTO_CONTEXT: Partial<Record<SelectionKey, string>> = {
  onboarding: `Programa / Posgrado: [lo que el estudiante ingresó]
Materias destacadas: [opcional]
Entorno laboral / institución: [opcional]

Por favor, sugiere 3 temas de investigación viables y concretos para una monografía.`,
  "0": `TEMA APROBADO: "[el tema que el estudiante eligió]"
TÍTULO PROVISIONAL: "[título si existe]"

Genera el contenido de la Fase 0 — Planteamiento del Tema.`,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PromptsPage() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [selected, setSelected] = useState<SelectionKey>("hilos");
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftBorrador, setDraftBorrador] = useState("");
  const [draftFinal, setDraftFinal] = useState("");
  const [draftHilos, setDraftHilos] = useState("");
  const [draftEstiloPrompt, setDraftEstiloPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"borrador" | "final">("borrador");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContext, setShowContext] = useState(false);

  // Calibration state
  const [calibPreguntas, setCalibPreguntas] = useState<CalibracionPregunta[]>([]);
  const [loadingCalib, setLoadingCalib] = useState(false);
  const [newPregunta, setNewPregunta] = useState({ pregunta: "", descripcion: "", minimo_palabras: 30 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CalibracionPregunta>>({});
  const [savingCalib, setSavingCalib] = useState(false);

  const SERVICIO_ID = "mono-001";

  // ── Load ──────────────────────────────────────────────────────────────────────

  const loadCalib = useCallback(async () => {
    setLoadingCalib(true);
    try {
      const res = await fetch(`/api/admin/calibration-questions?servicio_id=${SERVICIO_ID}`);
      const json = await res.json();
      setCalibPreguntas(json.preguntas ?? []);
    } finally {
      setLoadingCalib(false);
    }
  }, []);

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

  const loadEstiloPrompt = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/workspace-prompts?key=estilo-analizador");
      if (res.ok) {
        const j = await res.json();
        if (j.prompt) setDraftEstiloPrompt(j.prompt);
      }
    } catch { /* no-op */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (selected === "calibracion") loadCalib(); }, [selected, loadCalib]);
  useEffect(() => { if (selected === "estilo-analizador") loadEstiloPrompt(); }, [selected, loadEstiloPrompt]);

  useEffect(() => {
    if (!data) return;
    setSaved(false);
    setShowContext(false);

    if (selected === "hilos") {
      setDraftHilos(data.hilos.join("\n"));
    } else if (selected === "calibracion" || selected === "estilo-analizador") {
      // handled separately
    } else {
      const phaseData = data.phases[selected];
      setDraftPrompt(phaseData?.prompt ?? "");
      setDraftBorrador(data.phases[`${selected}_borrador`]?.prompt ?? phaseData?.prompt ?? "");
      setDraftFinal(data.phases[`${selected}_final`]?.prompt ?? phaseData?.prompt ?? "");
    }
  }, [selected, data]);

  // ── Save ──────────────────────────────────────────────────────────────────────

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
      } else if (selected === "estilo-analizador") {
        await fetch("/api/admin/workspace-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "phase", key: "estilo-analizador", prompt: draftEstiloPrompt }),
        });
      } else if (PHASE_KEYS.includes(selected as typeof PHASE_KEYS[number]) || selected === "onboarding") {
        // Save main prompt + borrador/final variants
        const saves = [
          fetch("/api/admin/workspace-prompts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "phase", key: selected, prompt: draftPrompt }),
          }),
        ];

        if (PHASE_KEYS.includes(selected as typeof PHASE_KEYS[number])) {
          saves.push(
            fetch("/api/admin/workspace-prompts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "phase", key: `${selected}_borrador`, prompt: draftBorrador }),
            }),
            fetch("/api/admin/workspace-prompts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "phase", key: `${selected}_final`, prompt: draftFinal }),
            })
          );
        }

        await Promise.all(saves);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            phases: {
              ...prev.phases,
              [selected]: { ...prev.phases[selected], prompt: draftPrompt, isCustom: true },
              [`${selected}_borrador`]: { label: "Borrador", prompt: draftBorrador, isCustom: true },
              [`${selected}_final`]: { label: "Final", prompt: draftFinal, isCustom: true },
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
    if (selected === "hilos" || selected === "calibracion" || !confirm("¿Restaurar el prompt original de este item?")) return;
    await fetch("/api/admin/workspace-prompts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: selected }),
    });
    await load();
  };

  // ── Calibration CRUD ──────────────────────────────────────────────────────────

  async function addPregunta() {
    if (!newPregunta.pregunta.trim()) return;
    setSavingCalib(true);
    try {
      await fetch("/api/admin/calibration-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPregunta, servicio_id: SERVICIO_ID }),
      });
      setNewPregunta({ pregunta: "", descripcion: "", minimo_palabras: 30 });
      await loadCalib();
    } finally {
      setSavingCalib(false);
    }
  }

  async function savePregunta(id: string) {
    setSavingCalib(true);
    try {
      await fetch("/api/admin/calibration-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, servicio_id: SERVICIO_ID, ...editValues }),
      });
      setEditingId(null);
      await loadCalib();
    } finally {
      setSavingCalib(false);
    }
  }

  async function deletePregunta(id: string) {
    if (id.startsWith("default-") || !confirm("¿Eliminar esta pregunta?")) return;
    await fetch("/api/admin/calibration-questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadCalib();
  }

  // ── Render helpers ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const isHilos = selected === "hilos";
  const isCalib = selected === "calibracion";
  const isEstiloAnalizador = selected === "estilo-analizador";
  const isPhase = PHASE_KEYS.includes(selected as typeof PHASE_KEYS[number]);
  const isOnboarding = selected === "onboarding";

  const isDirty = isHilos
    ? draftHilos !== (data?.hilos.join("\n") ?? "")
    : isEstiloAnalizador
      ? true // always allow saving
      : isPhase
        ? draftPrompt !== (data?.phases[selected]?.prompt ?? "") ||
          draftBorrador !== (data?.phases[`${selected}_borrador`]?.prompt ?? data?.phases[selected]?.prompt ?? "") ||
          draftFinal !== (data?.phases[`${selected}_final`]?.prompt ?? data?.phases[selected]?.prompt ?? "")
        : draftPrompt !== (data?.phases[selected]?.prompt ?? "");

  const currentPhaseData = !isHilos && !isCalib && !isEstiloAnalizador ? data?.phases[selected] : null;
  const isCustom = currentPhaseData?.isCustom ?? false;
  const sidebarItem = SIDEBAR_ITEMS.find((s) => s.key === selected);
  const autoCtx = AUTO_CONTEXT[selected];

  return (
    <AdminShell title="Prompts del Workspace" code="PRMT — instrucciones de IA por etapa">
    <div className="fade-in" style={{ display: "flex", gap: 32, height: "calc(100vh - 160px)" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2, padding: "0", borderRight: "1px solid #e5e7eb", overflowY: "auto" }}>
        <div className="adm-label mb-4 px-4 pt-4">[PRMT] secciones</div>

        {SIDEBAR_ITEMS.map((item, idx) => {
          const isSelected = selected === item.key;
          const phaseData = item.key !== "hilos" && item.key !== "calibracion" && item.key !== "estilo-analizador"
            ? data?.phases[item.key] : null;
          const itemColor = item.color ?? "var(--accent)";

          const showSep = idx === 4; // separator before Fase 0

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
                  color: isSelected ? itemColor : "var(--fg-muted)",
                  background: isSelected ? `rgba(${itemColor === "#fde68a" ? "253,230,138" : itemColor === "#a78bfa" ? "167,139,250" : itemColor === "#f472b6" ? "244,114,182" : itemColor === "#34d399" ? "52,211,153" : "6,182,212"},0.10)` : "transparent",
                  borderColor: isSelected ? `${itemColor}44` : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <span className="adm-label" style={{ fontSize: 9 }}>[{item.key.toUpperCase().slice(0,4)}]</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.key === "hilos" && (
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{data?.hilos.length ?? 0} reglas</span>
                )}
                {item.key === "calibracion" && (
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{calibPreguntas.length} preg.</span>
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

        <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid #e5e7eb", fontSize: 10, color: "#999", fontFamily: "'IBM Plex Mono', monospace" }}>
          <div className="adm-label mb-2" style={{ fontSize: 9 }}>// info</div>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: 10 }}>
            <strong>Borrador</strong>: primera pasada Modo Guiado.<br />
            <strong>Final</strong>: con feedback del estudiante.<br />
            <strong>Hilos</strong>: aplican a todas las fases.
          </p>
        </div>
      </div>

      {/* ── Editor ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 0 0 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#000", fontFamily: "'IBM Plex Mono', monospace" }}>
              {sidebarItem?.icon} {isHilos ? "Hilos Conductores" : isCalib ? "Preguntas de Calibración" : isEstiloAnalizador ? "Analizador de Estilo" : (currentPhaseData?.label ?? sidebarItem?.label)}
            </h2>
            <p style={{ fontSize: 12, color: "var(--fg-secondary)", margin: "4px 0 0" }}>
              {isHilos
                ? "Reglas que se aplican a TODAS las fases. Una regla por línea."
                : isCalib
                  ? "Preguntas que el estudiante responde para calibrar su perfil de estilo (Modo Guiado)."
                  : isEstiloAnalizador
                    ? "Prompt del sistema para el análisis de estilo de escritura del estudiante."
                    : isOnboarding
                      ? "Se ejecuta cuando el estudiante pide sugerencias de tema."
                      : "Prompt del sistema para esta fase (aplica a Modo Directo y como base en Modo Guiado)."}
            </p>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {!isHilos && !isCalib && isCustom && (
              <button className="btn-ghost" onClick={handleReset} style={{ fontSize: 12 }}>
                🔄 Restaurar original
              </button>
            )}
            {!isCalib && (
              <button
                className="btn-cyan"
                onClick={handleSave}
                disabled={saving || !isDirty}
                style={{ fontSize: 13, opacity: isDirty ? 1 : 0.5 }}
              >
                {saving ? <><div className="spinner" /> Guardando...</> : saved ? "✓ Guardado" : "💾 Guardar"}
              </button>
            )}
          </div>
        </div>

        {/* ── Calibration CRUD ── */}
        {isCalib && (
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 24, paddingRight: 8 }}>
            {/* Add new question */}
            <div style={{ paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>Agregar nueva pregunta</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label className="label">Pregunta *</label>
                  <textarea
                    className="input-dark"
                    rows={2}
                    value={newPregunta.pregunta}
                    onChange={e => setNewPregunta(p => ({ ...p, pregunta: e.target.value }))}
                    placeholder="Ej: Describe tu estilo de escritura académica preferido..."
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div>
                  <label className="label">Descripción / Ayuda <span style={{ color: "var(--fg-secondary)", fontWeight: 400, textTransform: "none" }}>(opcional)</span></label>
                  <input
                    className="input-dark"
                    value={newPregunta.descripcion}
                    onChange={e => setNewPregunta(p => ({ ...p, descripcion: e.target.value }))}
                    placeholder="Texto de ayuda que aparece bajo la pregunta"
                  />
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">Mínimo de palabras</label>
                    <input
                      className="input-dark"
                      type="number"
                      min={10} max={500}
                      value={newPregunta.minimo_palabras}
                      onChange={e => setNewPregunta(p => ({ ...p, minimo_palabras: Number(e.target.value) }))}
                    />
                  </div>
                  <button
                    onClick={addPregunta}
                    disabled={!newPregunta.pregunta.trim() || savingCalib}
                    className="btn-cyan"
                    style={{ padding: "10px 18px", fontSize: 13 }}
                  >
                    {savingCalib ? "Guardando…" : "+ Agregar"}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing questions */}
            {loadingCalib ? (
              <div style={{ textAlign: "center", padding: 24 }}><div className="spinner" style={{ width: 24, height: 24 }} /></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {calibPreguntas.map((q, i) => (
                  <div key={q.id} style={{ padding: 16, background: "rgba(255,255,255,0.4)", borderRadius: 16, border: "1px solid var(--border)" }}>
                    {editingId === q.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <textarea
                          className="input-dark"
                          rows={2}
                          value={editValues.pregunta ?? q.pregunta}
                          onChange={e => setEditValues(v => ({ ...v, pregunta: e.target.value }))}
                          style={{ resize: "vertical" }}
                        />
                        <input
                          className="input-dark"
                          value={editValues.descripcion ?? q.descripcion ?? ""}
                          onChange={e => setEditValues(v => ({ ...v, descripcion: e.target.value }))}
                          placeholder="Descripción"
                        />
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <label style={{ fontSize: 12, color: "var(--fg-muted)" }}>Mín. palabras:</label>
                          <input
                            className="input-dark"
                            type="number" min={10} max={500}
                            style={{ width: 80 }}
                            value={editValues.minimo_palabras ?? q.minimo_palabras}
                            onChange={e => setEditValues(v => ({ ...v, minimo_palabras: Number(e.target.value) }))}
                          />
                          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                            <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>Cancelar</button>
                            <button onClick={() => savePregunta(q.id)} disabled={savingCalib} className="btn-cyan" style={{ fontSize: 12, padding: "6px 12px" }}>Guardar</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: q.descripcion ? 4 : 0 }}>{q.pregunta}</div>
                          {q.descripcion && <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{q.descripcion}</div>}
                          <div style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 6 }}>
                            Mín. {q.minimo_palabras} palabras
                            {q.id.startsWith("default-") && <span style={{ marginLeft: 8, color: "var(--fg-muted)" }}>· Por defecto</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => { setEditingId(q.id); setEditValues(q); }}
                            className="btn-ghost"
                            style={{ fontSize: 11, padding: "5px 10px" }}
                            disabled={q.id.startsWith("default-")}
                            title={q.id.startsWith("default-") ? "Las preguntas por defecto no se pueden editar directamente — agrégalas primero" : "Editar"}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => deletePregunta(q.id)}
                            className="btn-ghost"
                            disabled={q.id.startsWith("default-")}
                            style={{ fontSize: 11, padding: "5px 10px", color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                            title={q.id.startsWith("default-") ? "No se pueden eliminar las preguntas por defecto" : "Eliminar"}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {calibPreguntas.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--fg-muted)", fontSize: 14 }}>
                    No hay preguntas configuradas — usa las preguntas por defecto o agrega nuevas arriba.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Style Analyzer Prompt ── */}
        {isEstiloAnalizador && (
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 8 }}>
            <div style={{ padding: "12px 16px", background: "rgba(52,211,153,0.08)", borderRadius: 12, border: "1px solid rgba(52,211,153,0.2)", fontSize: 13, color: "var(--fg-primary)", fontWeight: 500 }}>
              🧬 Este prompt se usa cuando el estudiante completa la calibración de estilo en Modo Guiado. Recibe las respuestas del estudiante y debe generar un PERFIL DE ESTILO que la IA usará en todas las fases.
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 8 }}>
              <label className="label">Prompt del Analizador de Estilo</label>
              <p style={{ fontSize: 12, color: "var(--fg-secondary)", marginBottom: 10 }}>
                El User Message contendrá automáticamente las respuestas de calibración del estudiante.
              </p>
              <textarea
                className="input-dark"
                value={draftEstiloPrompt}
                onChange={(e) => { setDraftEstiloPrompt(e.target.value); setSaved(false); }}
                style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, lineHeight: 1.75, flex: 1, minHeight: 340 }}
                placeholder="Instrucciones para analizar el estilo del estudiante y generar el perfil..."
              />
            </div>
          </div>
        )}

        {/* ── Hilos Conductores ── */}
        {isHilos && (
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 8 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label className="label">Reglas inmutables (una por línea)</label>
              <p style={{ fontSize: 12, color: "var(--fg-secondary)", marginBottom: 10 }}>
                Se añaden al final del prompt de sistema de CADA fase, con menor prioridad que el prompt de fase y el perfil de estilo del usuario.
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
                <p style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 8 }}>
                  {draftHilos.split("\n").filter((l) => l.trim()).length} regla(s) definidas
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Onboarding prompt (single) ── */}
        {isOnboarding && (
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 8 }}>
            {autoCtx && (
              <div style={{ borderRadius: 12, border: "1px solid rgba(37,99,235,0.2)", overflow: "hidden", background: "rgba(255,255,255,0.5)" }}>
                <button
                  onClick={() => setShowContext(v => !v)}
                  style={{ width: "100%", padding: "12px 16px", background: "rgba(37,99,235,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-primary)", fontWeight: 500, textAlign: "left" }}
                >
                  <span style={{ color: "var(--accent)" }}>📥</span>
                  <span style={{ flex: 1 }}>Datos del estudiante inyectados automáticamente</span>
                  <span style={{ fontSize: 10 }}>{showContext ? "▲" : "▼"}</span>
                </button>
                {showContext && (
                  <pre style={{ margin: 0, padding: "16px", background: "rgba(0,0,0,0.03)", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {autoCtx}
                  </pre>
                )}
              </div>
            )}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 8 }}>
              <label className="label">Prompt del Generador de Temas</label>
              <p style={{ fontSize: 12, color: "var(--fg-secondary)", marginBottom: 10 }}>
                Instrucciones para que la IA proponga 3 temas viables. Los datos del estudiante llegan automáticamente en el User Message.
              </p>
              <textarea
                className="input-dark"
                value={draftPrompt}
                onChange={(e) => { setDraftPrompt(e.target.value); setSaved(false); }}
                style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, lineHeight: 1.75, flex: 1, minHeight: 340 }}
              />
              <p style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 8 }}>
                {draftPrompt.split(/\s+/).filter(Boolean).length} palabras · {draftPrompt.length} caracteres
              </p>
            </div>
          </div>
        )}

        {/* ── Phase prompts (dual: borrador / final) ── */}
        {isPhase && (
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 16, paddingRight: 8 }}>
            {/* Context notice */}
            <div style={{ padding: "12px 16px", background: "rgba(37,99,235,0.08)", borderRadius: 12, border: "1px solid rgba(37,99,235,0.2)", fontSize: 13, color: "var(--fg-primary)", fontWeight: 500 }}>
              🔄{" "}
              {selected === "0"
                ? "Primera fase del workspace — el tema aprobado llega en el User Message."
                : `Esta fase recibe automáticamente el contenido de las Fases 0-${Number(selected) - 1} como contexto.`}
              {" "}El Perfil de Estilo del usuario (si existe) se inyecta con PRIORIDAD sobre los Hilos Conductores.
            </div>

            {/* Dual prompt tab selector */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button
                onClick={() => setActiveTab("borrador")}
                style={{
                  flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, borderRadius: 12, cursor: "pointer",
                  background: activeTab === "borrador" ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.5)",
                  border: activeTab === "borrador" ? "1.5px solid rgba(167,139,250,0.5)" : "1.5px solid var(--border)",
                  color: activeTab === "borrador" ? "#8b5cf6" : "var(--fg-secondary)",
                  transition: "all 0.2s"
                }}
              >
                📝 Prompt Borrador
              </button>
              <button
                onClick={() => setActiveTab("final")}
                style={{
                  flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, borderRadius: 12, cursor: "pointer",
                  background: activeTab === "final" ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.5)",
                  border: activeTab === "final" ? "1.5px solid rgba(37,99,235,0.5)" : "1.5px solid var(--border)",
                  color: activeTab === "final" ? "var(--accent)" : "var(--fg-secondary)",
                  transition: "all 0.2s"
                }}
              >
                ✨ Prompt Final
              </button>
            </div>

            {/* Info for current tab */}
            <div style={{ padding: "10px 14px", background: activeTab === "borrador" ? "rgba(167,139,250,0.06)" : "rgba(37,99,235,0.06)", borderRadius: 8, border: `1px solid ${activeTab === "borrador" ? "rgba(167,139,250,0.2)" : "rgba(37,99,235,0.2)"}`, fontSize: 12, color: "var(--fg-muted)" }}>
              {activeTab === "borrador"
                ? "📝 Se usa en Modo Guiado para la primera pasada. El estudiante lo revisará antes de pedir la versión final."
                : "✨ Se usa en Modo Guiado para generar la versión final. Recibirá el borrador + feedback del estudiante. En Modo Directo, siempre se usa el Prompt Borrador."}
            </div>

            {activeTab === "borrador" ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 8 }}>
                <label className="label">Prompt Borrador — {currentPhaseData?.label}</label>
                <p style={{ fontSize: 12, color: "var(--fg-secondary)", marginBottom: 10 }}>
                  Primera generación. En Modo Directo, este prompt también se usa para el contenido final.
                </p>
                <textarea
                  className="input-dark"
                  value={draftBorrador}
                  onChange={(e) => { setDraftBorrador(e.target.value); setSaved(false); }}
                  style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, lineHeight: 1.75, flex: 1, minHeight: 320 }}
                />
                <p style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 8 }}>
                  {draftBorrador.split(/\s+/).filter(Boolean).length} palabras · {draftBorrador.length} caracteres
                </p>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: 8 }}>
                <label className="label">Prompt Final — {currentPhaseData?.label}</label>
                <p style={{ fontSize: 12, color: "var(--fg-secondary)", marginBottom: 10 }}>
                  Segunda generación en Modo Guiado. El User Message incluirá automáticamente el borrador previo y el feedback del estudiante.
                </p>
                <textarea
                  className="input-dark"
                  value={draftFinal}
                  onChange={(e) => { setDraftFinal(e.target.value); setSaved(false); }}
                  style={{ resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12.5, lineHeight: 1.75, flex: 1, minHeight: 320 }}
                />
                <p style={{ fontSize: 11, color: "var(--fg-secondary)", marginTop: 8 }}>
                  {draftFinal.split(/\s+/).filter(Boolean).length} palabras · {draftFinal.length} caracteres
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </AdminShell>
  );
}
