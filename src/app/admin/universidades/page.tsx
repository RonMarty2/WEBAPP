"use client";

import { useState, useEffect } from "react";
import { DEFAULT_UNIVERSITIES, University } from "@/lib/data";

const EMPTY_UNIVERSITY: Omit<University, "id"> = {
  name: "",
  logo_url: "",
  format: {
    font: "Times New Roman",
    size: 12,
    lineHeight: 1.5,
    margins: { top: 3, left: 3, bottom: 2.5, right: 2.5 },
  },
  modalities: ["Tesis de Grado", "Monografía", "Proyecto de Grado"],
  is_active: true,
};

export default function UniversidadesPage() {
  const [universities, setUniversities] = useState<University[]>([...DEFAULT_UNIVERSITIES]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<University, "id">>({ ...EMPTY_UNIVERSITY });
  const [newModality, setNewModality] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/universities")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUniversities(data))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return alert("El nombre es obligatorio.");
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;

      const res = await fetch("/api/admin/universities", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (editingId) {
        setUniversities((prev) => prev.map((u) => u.id === editingId ? data.university : u));
      } else {
        setUniversities((prev) => [...prev, data.university]);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY_UNIVERSITY });
    } catch {
      alert("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (univ: University) => {
    setForm({
      name: univ.name,
      logo_url: univ.logo_url || "",
      format: { ...univ.format, margins: { ...univ.format.margins } },
      modalities: [...univ.modalities],
      is_active: univ.is_active,
    });
    setEditingId(univ.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta universidad?")) return;
    await fetch("/api/admin/universities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setUniversities((prev) => prev.filter((u) => u.id !== id));
  };

  const addModality = () => {
    if (!newModality.trim()) return;
    setForm((prev) => ({ ...prev, modalities: [...prev.modalities, newModality.trim()] }));
    setNewModality("");
  };

  const removeModality = (m: string) => {
    setForm((prev) => ({ ...prev, modalities: prev.modalities.filter((x) => x !== m) }));
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>🏫 Biblioteca de Universidades</h1>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>
            Añade y configura los formatos de cada universidad. Los cambios se aplican automáticamente.
          </p>
        </div>
        <button
          className="btn-cyan"
          onClick={() => { setForm({ ...EMPTY_UNIVERSITY }); setEditingId(null); setShowForm(true); }}
        >
          + Añadir Universidad
        </button>
      </div>

      {/* University list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {universities.map((univ) => (
          <div key={univ.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{univ.name}</span>
                <span className={`badge ${univ.is_active ? "badge-green" : "badge-amber"}`}>
                  {univ.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#94a3b8", flexWrap: "wrap" }}>
                <span>📝 {univ.format.font} {univ.format.size}pt</span>
                <span>📏 Interlineado: {univ.format.lineHeight}</span>
                <span>📐 Márgenes: {univ.format.margins.top}/{univ.format.margins.left}/{univ.format.margins.bottom}/{univ.format.margins.right}cm</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {univ.modalities.map((m) => (
                  <span key={m} className="badge badge-cyan" style={{ fontSize: 11 }}>{m}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => handleEdit(univ)} style={{ fontSize: 13 }}>✏️ Editar</button>
              {univ.id.startsWith("umss") || univ.id.startsWith("umsa") ? null : (
                <button
                  onClick={() => handleDelete(univ.id)}
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
                >
                  🗑 Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form modal overlay */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div className="card" style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                {editingId ? "✏️ Editar Universidad" : "🏫 Nueva Universidad"}
              </h2>
              <button className="btn-ghost" onClick={() => setShowForm(false)} style={{ fontSize: 13 }}>✕ Cerrar</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Nombre completo *</label>
                <input className="input-dark" placeholder="Ej: Universidad Mayor de San Simón (UMSS)" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Fuente</label>
                  <select className="input-dark" value={form.format.font} onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, font: e.target.value } }))}>
                    <option>Times New Roman</option>
                    <option>Arial</option>
                    <option>Calibri</option>
                    <option>Garamond</option>
                  </select>
                </div>
                <div style={{ width: 100 }}>
                  <label className="label">Tamaño</label>
                  <input type="number" className="input-dark" value={form.format.size} min={10} max={14} onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, size: Number(e.target.value) } }))} />
                </div>
                <div style={{ width: 120 }}>
                  <label className="label">Interlineado</label>
                  <select className="input-dark" value={form.format.lineHeight} onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, lineHeight: Number(e.target.value) } }))}>
                    <option value={1.0}>1.0 (Simple)</option>
                    <option value={1.5}>1.5</option>
                    <option value={2.0}>2.0 (Doble)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Márgenes (cm): Superior / Izquierdo / Inferior / Derecho</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                  {(["top", "left", "bottom", "right"] as const).map((side) => (
                    <div key={side}>
                      <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>{side === "top" ? "Superior" : side === "left" ? "Izquierdo" : side === "bottom" ? "Inferior" : "Derecho"}</div>
                      <input type="number" className="input-dark" step={0.5} value={form.format.margins[side]}
                        onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, margins: { ...p.format.margins, [side]: Number(e.target.value) } } }))} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Modalidades de Graduación</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {form.modalities.map((m) => (
                    <span key={m} style={{ display: "flex", alignItems: "center", gap: 6 }} className="badge badge-cyan">
                      {m}
                      <button onClick={() => removeModality(m)} style={{ background: "none", border: "none", color: "#06b6d4", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input className="input-dark" placeholder="Nueva modalidad..." value={newModality} onChange={(e) => setNewModality(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addModality()} />
                  <button className="btn-ghost" onClick={addModality}>+ Añadir</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
                <button className="btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</button>
                <button className="btn-cyan" onClick={handleSave} disabled={saving || !form.name} style={{ flex: 2, justifyContent: "center" }}>
                  {saving ? <><div className="spinner" /> Guardando...</> : `💾 ${editingId ? "Actualizar" : "Crear"} Universidad`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
