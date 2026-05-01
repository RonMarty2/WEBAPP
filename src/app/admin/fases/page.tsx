"use client";

import { useState, useEffect, useCallback } from "react";
import type { PhaseDefinition } from "@/lib/persistence";

interface Servicio {
  id: string;
  nombre: string;
}

interface PhaseListResponse {
  phases: PhaseDefinition[];
  is_default: boolean;
}

const EMPTY_PHASE: Omit<PhaseDefinition, "id" | "servicio_id" | "orden"> = {
  label: "",
  short_label: "",
  prompt: "",
};

export default function FasesPage() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState("mono-001");
  const [phases, setPhases] = useState<PhaseDefinition[]>([]);
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<PhaseDefinition>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhase, setNewPhase] = useState<typeof EMPTY_PHASE>({ ...EMPTY_PHASE });
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPhases = useCallback(async (sid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/phase-definitions?servicio_id=${sid}`);
      const data = await res.json() as PhaseListResponse;
      setPhases(data.phases);
      setIsDefault(data.is_default);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(d => {
        const svcs = (d.servicios ?? []) as Servicio[];
        setServices(svcs);
        if (svcs.length > 0) setServicioId(svcs[0].id);
      });
  }, []);

  useEffect(() => { loadPhases(servicioId); }, [servicioId, loadPhases]);

  async function saveEdit(phase: PhaseDefinition) {
    setSaving(phase.id);
    setError("");
    try {
      const res = await fetch("/api/admin/phase-definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...phase, ...editDraft, servicio_id: servicioId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEditingId(null);
      await loadPhases(servicioId);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(null); }
  }

  async function deletePhase(id: string) {
    if (!confirm("¿Eliminar esta fase? El contenido generado en proyectos existentes no se borrará.")) return;
    setError("");
    try {
      const res = await fetch("/api/admin/phase-definitions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, servicio_id: servicioId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await loadPhases(servicioId);
    } catch (e) { setError((e as Error).message); }
  }

  async function reorder(id: string, direction: "up" | "down") {
    try {
      await fetch("/api/admin/phase-definitions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicio_id: servicioId, id, direction }),
      });
      await loadPhases(servicioId);
    } catch (e) { setError((e as Error).message); }
  }

  async function addPhase() {
    if (!newPhase.label.trim()) { setError("El nombre de la fase es obligatorio."); return; }
    setSaving("new");
    setError("");
    try {
      const res = await fetch("/api/admin/phase-definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPhase, servicio_id: servicioId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setNewPhase({ ...EMPTY_PHASE });
      setShowAddForm(false);
      await loadPhases(servicioId);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(null); }
  }

  async function initializeFromDefaults() {
    if (!confirm("Esto copiará las 6 fases por defecto para este servicio. Podrás editarlas libremente.")) return;
    setSaving("init");
    setError("");
    try {
      const disk = await fetch(`/api/admin/phase-definitions?servicio_id=${servicioId}`).then(r => r.json()) as PhaseListResponse;
      for (const phase of disk.phases) {
        await fetch("/api/admin/phase-definitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...phase, id: undefined, servicio_id: servicioId }),
        });
      }
      await loadPhases(servicioId);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(null); }
  }

  const inputStyle: React.CSSProperties = {
    background: "#0a1628", border: "1px solid #1e293b", borderRadius: 6,
    color: "#e2e8f0", padding: "8px 10px", fontSize: 13, width: "100%",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: 4, display: "block",
  };

  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>📋 Fases del Proyecto</h1>
          <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0" }}>
            Define las fases de generación para cada tipo de proyecto. Cada fase tiene su propio prompt de IA.
          </p>
        </div>
      </div>

      {/* Service selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Tipo de proyecto:</label>
        <select
          value={servicioId}
          onChange={e => setServicioId(e.target.value)}
          style={{ ...inputStyle, width: "auto", minWidth: 220 }}
        >
          {services.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </div>

      {/* Default notice */}
      {isDefault && (
        <div style={{
          padding: "12px 16px", marginBottom: 20, borderRadius: 8,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          fontSize: 13, color: "#fbbf24", display: "flex", alignItems: "center", gap: 12,
        }}>
          <span>⚠️</span>
          <span style={{ flex: 1 }}>
            Este servicio usa las <strong>6 fases por defecto</strong> del sistema. Personalízalas para tener control total.
          </span>
          <button
            onClick={initializeFromDefaults}
            disabled={saving === "init"}
            style={{
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: 6, color: "#fbbf24", fontSize: 12, padding: "6px 14px", cursor: "pointer",
            }}
          >
            {saving === "init" ? "Iniciando…" : "Personalizar fases"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", marginBottom: 16, borderRadius: 8, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", fontSize: 13, color: "#f87171" }}>
          {error} <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", marginLeft: 8 }}>×</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : (
        <>
          {/* Phase list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {phases.map((phase, idx) => {
              const isEditing = editingId === phase.id;
              return (
                <div
                  key={phase.id}
                  style={{
                    background: "#060f1e", border: `1px solid ${isEditing ? "rgba(6,182,212,0.35)" : "rgba(6,182,212,0.1)"}`,
                    borderRadius: 10, padding: "14px 16px", transition: "border-color 0.15s",
                  }}
                >
                  {isEditing ? (
                    /* Edit mode */
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={labelStyle}>Nombre completo</label>
                          <input
                            style={inputStyle}
                            value={editDraft.label ?? phase.label}
                            onChange={e => setEditDraft(d => ({ ...d, label: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Nombre corto (nav)</label>
                          <input
                            style={inputStyle}
                            value={editDraft.short_label ?? phase.short_label}
                            onChange={e => setEditDraft(d => ({ ...d, short_label: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Prompt del sistema para esta fase</label>
                        <textarea
                          style={{ ...inputStyle, resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.7, minHeight: 220 }}
                          value={editDraft.prompt ?? phase.prompt}
                          onChange={e => setEditDraft(d => ({ ...d, prompt: e.target.value }))}
                        />
                        <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
                          El contexto de fases anteriores y los Hilos Conductores se añaden automáticamente — no los repitas aquí.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button onClick={() => { setEditingId(null); setEditDraft({}); }} className="btn-ghost" style={{ fontSize: 13 }}>Cancelar</button>
                        <button onClick={() => saveEdit(phase)} className="btn-cyan" disabled={saving === phase.id} style={{ fontSize: 13 }}>
                          {saving === phase.id ? "Guardando…" : "💾 Guardar fase"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 6,
                        background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: "#06b6d4", flexShrink: 0,
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{phase.label}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>
                          {phase.short_label} · {phase.prompt ? `${phase.prompt.split(/\s+/).slice(0, 8).join(" ")}…` : "Sin prompt"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => reorder(phase.id, "up")}
                          disabled={idx === 0}
                          style={{ width: 28, height: 28, background: idx === 0 ? "#0a1628" : "transparent", border: "1px solid #1e293b", borderRadius: 6, color: idx === 0 ? "#1e293b" : "#64748b", cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: 13 }}
                        >↑</button>
                        <button
                          onClick={() => reorder(phase.id, "down")}
                          disabled={idx === phases.length - 1}
                          style={{ width: 28, height: 28, background: idx === phases.length - 1 ? "#0a1628" : "transparent", border: "1px solid #1e293b", borderRadius: 6, color: idx === phases.length - 1 ? "#1e293b" : "#64748b", cursor: idx === phases.length - 1 ? "not-allowed" : "pointer", fontSize: 13 }}
                        >↓</button>
                        <button
                          onClick={() => { setEditingId(phase.id); setEditDraft({}); }}
                          className="btn-ghost"
                          style={{ fontSize: 12, padding: "4px 12px" }}
                        >✏️ Editar</button>
                        {!isDefault && (
                          <button
                            onClick={() => deletePhase(phase.id)}
                            style={{ fontSize: 12, padding: "4px 12px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, color: "#f87171", cursor: "pointer" }}
                          >🗑️</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add phase */}
          {!isDefault && (
            <div style={{ marginTop: 16 }}>
              {showAddForm ? (
                <div style={{ background: "#060f1e", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 10, padding: "16px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa", marginBottom: 14 }}>➕ Nueva Fase</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Nombre completo *</label>
                      <input style={inputStyle} placeholder="Ej. Modelo Econométrico" value={newPhase.label} onChange={e => setNewPhase(p => ({ ...p, label: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nombre corto (nav)</label>
                      <input style={inputStyle} placeholder="Ej. Econométrico" value={newPhase.short_label} onChange={e => setNewPhase(p => ({ ...p, short_label: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Prompt del sistema (puedes completarlo después)</label>
                    <textarea style={{ ...inputStyle, resize: "vertical", fontFamily: "JetBrains Mono, monospace", fontSize: 12, lineHeight: 1.7, minHeight: 160 }} placeholder="Eres un experto en..." value={newPhase.prompt} onChange={e => setNewPhase(p => ({ ...p, prompt: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => { setShowAddForm(false); setNewPhase({ ...EMPTY_PHASE }); }} className="btn-ghost" style={{ fontSize: 13 }}>Cancelar</button>
                    <button onClick={addPhase} disabled={saving === "new"} className="btn-cyan" style={{ fontSize: 13 }}>
                      {saving === "new" ? "Creando…" : "Crear fase"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  style={{
                    width: "100%", padding: "12px", background: "transparent",
                    border: "2px dashed rgba(167,139,250,0.25)", borderRadius: 10,
                    color: "#a78bfa", fontSize: 13, cursor: "pointer", fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                >
                  ➕ Agregar nueva fase
                </button>
              )}
            </div>
          )}

          {/* Info */}
          <div style={{ marginTop: 28, padding: "14px 16px", background: "rgba(6,182,212,0.04)", borderRadius: 8, border: "1px solid rgba(6,182,212,0.1)", fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
            <strong style={{ color: "#64748b" }}>¿Cómo funciona?</strong><br />
            Cada fase que crees aquí aparecerá en el workspace del estudiante en el orden definido.
            El <strong>prompt</strong> de cada fase es el System Prompt que recibe la IA.
            El código inyecta automáticamente: el tema aprobado + el contenido de todas las fases anteriores completadas.
            Los <strong>Hilos Conductores</strong> (configurados en Prompts Maestros) se anteponen a todos los prompts.
          </div>
        </>
      )}
    </div>
  );
}
