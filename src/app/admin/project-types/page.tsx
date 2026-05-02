"use client";

import { useState, useEffect, useCallback } from "react";

interface FaseTipoProyecto {
  id: string;
  tipo_proyecto_id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  prompt_borrador?: string;
  prompt_final?: string;
  es_subfase: boolean;
  padre_id?: string;
}

interface TipoProyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  icon?: string;
  activo: boolean;
  created_at: string;
  fases_count?: number;
  fases?: FaseTipoProyecto[];
}

const ICONS = ["📄", "🎓", "📝", "📊", "🔬", "📚", "🏆", "💼"];

export default function ProjectTypesPage() {
  const [tipos, setTipos] = useState<TipoProyecto[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<TipoProyecto | null>(null);
  const [fases, setFases] = useState<FaseTipoProyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New tipo form
  const [showNewTipo, setShowNewTipo] = useState(false);
  const [newTipo, setNewTipo] = useState({ nombre: "", descripcion: "", icon: "📄" });

  // New fase form
  const [showNewFase, setShowNewFase] = useState(false);
  const [newFase, setNewFase] = useState({ nombre: "", descripcion: "", es_subfase: false, padre_id: "" });

  // Editing fase
  const [editingFaseId, setEditingFaseId] = useState<string | null>(null);
  const [editFase, setEditFase] = useState<Partial<FaseTipoProyecto>>({});

  // Prompt editor drawer
  const [promptFase, setPromptFase] = useState<FaseTipoProyecto | null>(null);
  const [draftBorrador, setDraftBorrador] = useState("");
  const [draftFinal, setDraftFinal] = useState("");
  const [promptTab, setPromptTab] = useState<"borrador" | "final">("borrador");
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [savedPrompt, setSavedPrompt] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────────

  const loadTipos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/project-types");
      const data = await res.json();
      setTipos(data.tipos ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTipos(); }, [loadTipos]);

  const selectTipo = useCallback(async (tipo: TipoProyecto) => {
    setSelectedTipo(tipo);
    setShowNewFase(false);
    setEditingFaseId(null);
    const res = await fetch(`/api/admin/project-types?tipo_id=${tipo.id}`);
    const data = await res.json();
    setFases(data.fases ?? []);
  }, []);

  // ── Tipo CRUD ─────────────────────────────────────────────────────────────────

  async function createTipo() {
    if (!newTipo.nombre.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/project-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_tipo", ...newTipo }),
      });
      setNewTipo({ nombre: "", descripcion: "", icon: "📄" });
      setShowNewTipo(false);
      await loadTipos();
    } finally {
      setSaving(false);
    }
  }

  async function deleteTipo(id: string) {
    if (!confirm("¿Eliminar este tipo de proyecto y todas sus fases?")) return;
    await fetch("/api/admin/project-types", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_tipo", id }),
    });
    if (selectedTipo?.id === id) { setSelectedTipo(null); setFases([]); }
    await loadTipos();
  }

  // ── Fase CRUD ─────────────────────────────────────────────────────────────────

  async function createFase() {
    if (!newFase.nombre.trim() || !selectedTipo) return;
    setSaving(true);
    try {
      await fetch("/api/admin/project-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_fase",
          tipo_proyecto_id: selectedTipo.id,
          ...newFase,
          padre_id: newFase.es_subfase && newFase.padre_id ? newFase.padre_id : undefined,
        }),
      });
      setNewFase({ nombre: "", descripcion: "", es_subfase: false, padre_id: "" });
      setShowNewFase(false);
      await selectTipo(selectedTipo);
    } finally {
      setSaving(false);
    }
  }

  async function saveEditFase(id: string) {
    if (!selectedTipo) return;
    setSaving(true);
    try {
      await fetch("/api/admin/project-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_fase", id, ...editFase }),
      });
      setEditingFaseId(null);
      await selectTipo(selectedTipo);
    } finally {
      setSaving(false);
    }
  }

  async function deleteFase(id: string) {
    if (!selectedTipo || !confirm("¿Eliminar esta fase?")) return;
    await fetch("/api/admin/project-types", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_fase", id }),
    });
    await selectTipo(selectedTipo);
  }

  // ── Prompt editor ─────────────────────────────────────────────────────────────

  function openPromptEditor(fase: FaseTipoProyecto) {
    setPromptFase(fase);
    setDraftBorrador(fase.prompt_borrador ?? "");
    setDraftFinal(fase.prompt_final ?? "");
    setPromptTab("borrador");
    setSavedPrompt(false);
  }

  async function savePrompts() {
    if (!promptFase || !selectedTipo) return;
    setSavingPrompt(true);
    try {
      await fetch("/api/admin/project-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_fase",
          id: promptFase.id,
          prompt_borrador: draftBorrador,
          prompt_final: draftFinal,
        }),
      });
      setSavedPrompt(true);
      setTimeout(() => setSavedPrompt(false), 2000);
      // Update local state
      setFases(prev => prev.map(f => f.id === promptFase.id
        ? { ...f, prompt_borrador: draftBorrador, prompt_final: draftFinal }
        : f
      ));
      setPromptFase(prev => prev ? { ...prev, prompt_borrador: draftBorrador, prompt_final: draftFinal } : prev);
    } finally {
      setSavingPrompt(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const principalesFases = fases.filter(f => !f.es_subfase).sort((a, b) => a.orden - b.orden);

  return (
    <div className="fade-in" style={{ display: "flex", gap: 24, height: "calc(100vh - 64px)" }}>

      {/* ── LEFT: Tipos list ── */}
      <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🗂️ Tipos de Proyecto</h1>
          <button
            onClick={() => setShowNewTipo(v => !v)}
            className="btn-cyan"
            style={{ fontSize: 12, padding: "6px 12px" }}
          >
            + Nuevo
          </button>
        </div>

        {showNewTipo && (
          <div className="card" style={{ padding: 14, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setNewTipo(p => ({ ...p, icon: ic }))}
                  style={{
                    fontSize: 16, background: "none", border: newTipo.icon === ic ? "1.5px solid #06b6d4" : "1.5px solid transparent",
                    borderRadius: 6, padding: 4, cursor: "pointer",
                  }}
                >{ic}</button>
              ))}
            </div>
            <input
              className="input-dark"
              value={newTipo.nombre}
              onChange={e => setNewTipo(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre del tipo (ej: Tesis)"
              style={{ marginBottom: 8 }}
            />
            <input
              className="input-dark"
              value={newTipo.descripcion}
              onChange={e => setNewTipo(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción breve"
              style={{ marginBottom: 10 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowNewTipo(false)} className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: "7px" }}>Cancelar</button>
              <button onClick={createTipo} disabled={!newTipo.nombre.trim() || saving} className="btn-cyan" style={{ flex: 1, fontSize: 12, padding: "7px" }}>
                {saving ? "..." : "Crear"}
              </button>
            </div>
          </div>
        )}

        {tipos.map(t => (
          <button
            key={t.id}
            onClick={() => selectTipo(t)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
              borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%",
              background: selectedTipo?.id === t.id ? "rgba(6,182,212,0.1)" : "rgba(14,22,40,0.5)",
              border: selectedTipo?.id === t.id ? "1.5px solid rgba(6,182,212,0.4)" : "1.5px solid rgba(30,41,59,0.8)",
              transition: "all 0.12s",
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon ?? "📄"}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.nombre}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{t.fases_count ?? 0} fases</div>
            </div>
            {t.id !== "tipo-tesis" && t.id !== "tipo-monografia" && (
              <button
                onClick={e => { e.stopPropagation(); deleteTipo(t.id); }}
                style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14, padding: 2 }}
                title="Eliminar"
              >🗑️</button>
            )}
          </button>
        ))}
      </div>

      {/* ── RIGHT: Phase tree ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selectedTipo ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 52, opacity: 0.2 }}>📋</div>
            <div style={{ fontSize: 16, color: "#334155", fontWeight: 700 }}>Selecciona un Tipo de Proyecto</div>
            <div style={{ fontSize: 13, color: "#1e293b" }}>Verás su árbol de fases aquí</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{selectedTipo.icon ?? "📄"}</span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{selectedTipo.nombre}</h2>
                {selectedTipo.descripcion && <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{selectedTipo.descripcion}</p>}
              </div>
              <button
                onClick={() => setShowNewFase(v => !v)}
                className="btn-cyan"
                style={{ marginLeft: "auto", fontSize: 12, padding: "8px 16px" }}
              >
                + Agregar Fase
              </button>
            </div>

            {/* New fase form */}
            {showNewFase && (
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Nueva Fase</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label className="label">Nombre *</label>
                    <input className="input-dark" value={newFase.nombre} onChange={e => setNewFase(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Fase 3 — Metodología" />
                  </div>
                  <div>
                    <label className="label">Descripción</label>
                    <input className="input-dark" value={newFase.descripcion} onChange={e => setNewFase(p => ({ ...p, descripcion: e.target.value }))} placeholder="Breve descripción" />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={newFase.es_subfase}
                      onChange={e => setNewFase(p => ({ ...p, es_subfase: e.target.checked }))}
                    />
                    Es sub-fase
                  </label>
                  {newFase.es_subfase && (
                    <div style={{ flex: 1 }}>
                      <select
                        className="input-dark"
                        value={newFase.padre_id}
                        onChange={e => setNewFase(p => ({ ...p, padre_id: e.target.value }))}
                      >
                        <option value="">Seleccionar fase padre</option>
                        {principalesFases.map(f => (
                          <option key={f.id} value={f.id}>{f.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowNewFase(false)} className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: "8px" }}>Cancelar</button>
                  <button onClick={createFase} disabled={!newFase.nombre.trim() || saving} className="btn-cyan" style={{ flex: 1, fontSize: 12, padding: "8px" }}>
                    {saving ? "Guardando…" : "Agregar Fase"}
                  </button>
                </div>
              </div>
            )}

            {/* Phase tree */}
            <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {principalesFases.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#334155", fontSize: 14 }}>
                  No hay fases aún. Agrega la primera con el botón de arriba.
                </div>
              ) : (
                principalesFases.map(fase => {
                  const subfases = fases.filter(f => f.es_subfase && f.padre_id === fase.id).sort((a, b) => a.orden - b.orden);
                  const isEditing = editingFaseId === fase.id;
                  const hasPrompts = !!(fase.prompt_borrador?.trim() || fase.prompt_final?.trim());

                  return (
                    <div key={fase.id}>
                      {/* Main phase card */}
                      <div className="card" style={{ padding: "12px 16px" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <input
                              className="input-dark"
                              value={editFase.nombre ?? fase.nombre}
                              onChange={e => setEditFase(p => ({ ...p, nombre: e.target.value }))}
                            />
                            <input
                              className="input-dark"
                              value={editFase.descripcion ?? fase.descripcion ?? ""}
                              onChange={e => setEditFase(p => ({ ...p, descripcion: e.target.value }))}
                              placeholder="Descripción"
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => setEditingFaseId(null)} className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: "6px" }}>Cancelar</button>
                              <button onClick={() => saveEditFase(fase.id)} disabled={saving} className="btn-cyan" style={{ flex: 1, fontSize: 12, padding: "6px" }}>
                                {saving ? "..." : "Guardar"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 6, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>
                              {Math.round(fase.orden / 10) + 1}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{fase.nombre}</div>
                              {fase.descripcion && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{fase.descripcion}</div>}
                              {subfases.length > 0 && (
                                <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>
                                  {subfases.length} sub-fase{subfases.length > 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button
                                onClick={() => openPromptEditor(fase)}
                                className="btn-ghost"
                                style={{ fontSize: 11, padding: "5px 10px", color: hasPrompts ? "#a78bfa" : "#475569", borderColor: hasPrompts ? "rgba(167,139,250,0.3)" : undefined }}
                                title="Editar prompts"
                              >
                                {hasPrompts ? "✏️ Prompts" : "➕ Prompts"}
                              </button>
                              <button
                                onClick={() => { setEditingFaseId(fase.id); setEditFase(fase); }}
                                className="btn-ghost"
                                style={{ fontSize: 11, padding: "5px 8px" }}
                              >✏️</button>
                              <button
                                onClick={() => deleteFase(fase.id)}
                                className="btn-ghost"
                                style={{ fontSize: 11, padding: "5px 8px", color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                              >🗑️</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sub-fases */}
                      {subfases.map(sf => (
                        <div
                          key={sf.id}
                          style={{ marginLeft: 32, marginTop: 4 }}
                        >
                          <div className="card" style={{ padding: "10px 14px", borderColor: "rgba(167,139,250,0.2)", background: "rgba(167,139,250,0.04)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: "#a78bfa", fontSize: 14 }}>↳</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd" }}>{sf.nombre}</div>
                                {sf.descripcion && <div style={{ fontSize: 12, color: "#64748b" }}>{sf.descripcion}</div>}
                              </div>
                              <div style={{ display: "flex", gap: 5 }}>
                                <button
                                  onClick={() => openPromptEditor(sf)}
                                  className="btn-ghost"
                                  style={{ fontSize: 10, padding: "4px 8px", color: sf.prompt_borrador ? "#a78bfa" : "#475569" }}
                                >
                                  {sf.prompt_borrador ? "✏️ P" : "➕ P"}
                                </button>
                                <button
                                  onClick={() => deleteFase(sf.id)}
                                  className="btn-ghost"
                                  style={{ fontSize: 10, padding: "4px 6px", color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }}
                                >🗑️</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Prompt Editor Drawer ── */}
      {promptFase && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(2,6,23,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
          padding: 16,
        }} onClick={e => { if (e.target === e.currentTarget) setPromptFase(null); }}>
          <div style={{
            background: "#060f1e", border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 12, width: "100%", maxWidth: 640,
            padding: "24px 24px 20px",
            display: "flex", flexDirection: "column", gap: 14,
            height: "80vh",
          }}>
            {/* Drawer header */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#06b6d4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
                  Editar Prompts de Fase
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{promptFase.nombre}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={savePrompts}
                  disabled={savingPrompt}
                  className="btn-cyan"
                  style={{ fontSize: 12, padding: "8px 16px" }}
                >
                  {savingPrompt ? "Guardando…" : savedPrompt ? "✓ Guardado" : "💾 Guardar"}
                </button>
                <button onClick={() => setPromptFase(null)} className="btn-ghost" style={{ fontSize: 12, padding: "8px 12px" }}>✕</button>
              </div>
            </div>

            {/* Tab selector */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPromptTab("borrador")}
                style={{
                  flex: 1, padding: "9px", fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: "pointer",
                  background: promptTab === "borrador" ? "rgba(167,139,250,0.12)" : "transparent",
                  border: promptTab === "borrador" ? "1.5px solid rgba(167,139,250,0.4)" : "1.5px solid #1e293b",
                  color: promptTab === "borrador" ? "#a78bfa" : "#475569",
                }}
              >
                📝 Prompt Borrador
              </button>
              <button
                onClick={() => setPromptTab("final")}
                style={{
                  flex: 1, padding: "9px", fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: "pointer",
                  background: promptTab === "final" ? "rgba(6,182,212,0.12)" : "transparent",
                  border: promptTab === "final" ? "1.5px solid rgba(6,182,212,0.4)" : "1.5px solid #1e293b",
                  color: promptTab === "final" ? "#06b6d4" : "#475569",
                }}
              >
                ✨ Prompt Final
              </button>
            </div>

            <div style={{ fontSize: 11, color: "#475569", padding: "6px 10px", background: "rgba(6,182,212,0.04)", borderRadius: 6 }}>
              {promptTab === "borrador"
                ? "📝 Primera generación. En Modo Directo este prompt también sirve de final."
                : "✨ Versión final con feedback del estudiante incorporado (Modo Guiado)."}
            </div>

            {/* Textarea */}
            <textarea
              className="input-dark"
              value={promptTab === "borrador" ? draftBorrador : draftFinal}
              onChange={e => promptTab === "borrador" ? setDraftBorrador(e.target.value) : setDraftFinal(e.target.value)}
              placeholder={`Instrucciones para que la IA genere esta fase (${promptTab})...\n\nSi lo dejas vacío, se usará el prompt por defecto del sistema.`}
              style={{
                flex: 1, resize: "none",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12.5, lineHeight: 1.75,
              }}
            />

            <div style={{ fontSize: 11, color: "#334155" }}>
              {(promptTab === "borrador" ? draftBorrador : draftFinal).split(/\s+/).filter(Boolean).length} palabras
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
