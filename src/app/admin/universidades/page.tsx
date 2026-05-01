"use client";

import { useState, useEffect } from "react";
import { DEFAULT_UNIVERSITIES, University } from "@/lib/data";

const EMPTY_UNIVERSITY: Omit<University, "id"> = {
  name: "",
  logo_url: "",
  latex_prompt: "",
  cover_template: "",
  facultad: "",
  departamento: "",
  ciudad: "",
  pais: "Bolivia",
  tipo_documento: "MONOGRAFÍA",
  tipo_modalidad: "",
  campos_portada: [],
  format: {
    font: "Times New Roman",
    size: 12,
    lineHeight: 1.5,
    margins: { top: 3, left: 3, bottom: 2.5, right: 2.5 },
    alineacion: "justify",
    numero_paginas_posicion: "top-right",
  },
  modalities: ["Tesis de Grado", "Monografía", "Proyecto de Grado"],
  is_active: true,
};

const CAMPOS_PORTADA_OPCIONES = [
  { key: "programa", label: "Nombre del programa/diplomado" },
  { key: "version", label: "Versión del programa" },
  { key: "tutor", label: "Tutor/a de tesis" },
  { key: "carrera", label: "Carrera" },
];

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
      latex_prompt: univ.latex_prompt || "",
      cover_template: univ.cover_template || "",
      facultad: univ.facultad || "",
      departamento: univ.departamento || "",
      ciudad: univ.ciudad || "",
      pais: univ.pais || "Bolivia",
      tipo_documento: univ.tipo_documento || "MONOGRAFÍA",
      tipo_modalidad: univ.tipo_modalidad || "",
      campos_portada: [...(univ.campos_portada ?? [])],
      format: {
        ...univ.format,
        margins: { ...univ.format.margins },
        alineacion: univ.format.alineacion ?? "justify",
        numero_paginas_posicion: univ.format.numero_paginas_posicion ?? "top-right",
      },
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
              <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#94a3b8", flexWrap: "wrap", marginBottom: 6 }}>
                <span>📝 {univ.format.font} {univ.format.size}pt</span>
                <span>📏 Interlineado: {univ.format.lineHeight}</span>
                <span>📐 Márgenes: {univ.format.margins.top}/{univ.format.margins.left}/{univ.format.margins.bottom}/{univ.format.margins.right}cm</span>
              </div>
              {univ.latex_prompt ? (
                <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", background: "rgba(8,12,24,0.5)", padding: "6px 10px", borderRadius: 6, marginBottom: 6, lineHeight: 1.5, maxHeight: 48, overflow: "hidden" }}>
                  🧾 {univ.latex_prompt.slice(0, 140)}{univ.latex_prompt.length > 140 ? "…" : ""}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "#334155", fontStyle: "italic", marginBottom: 6 }}>Sin prompt LaTeX — haz clic en Editar para configurar</div>
              )}
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

              {/* ── Identidad institucional ── */}
              <div style={{ borderTop: "1px solid rgba(6,182,212,0.1)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>🏛️ Identidad Institucional</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label className="label">Logo URL</label>
                    <input className="input-dark" placeholder="https://...logo.png (dejar vacío si no hay)" value={form.logo_url ?? ""} onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label className="label">Facultad</label>
                      <input className="input-dark" placeholder="Ej: Facultad de Ciencias Económicas" value={form.facultad ?? ""} onChange={(e) => setForm((p) => ({ ...p, facultad: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Departamento / Unidad</label>
                      <input className="input-dark" placeholder="Ej: Departamento de Posgrado" value={form.departamento ?? ""} onChange={(e) => setForm((p) => ({ ...p, departamento: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Ciudad</label>
                      <input className="input-dark" placeholder="Ej: Cochabamba" value={form.ciudad ?? ""} onChange={(e) => setForm((p) => ({ ...p, ciudad: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">País</label>
                      <input className="input-dark" placeholder="Bolivia" value={form.pais ?? ""} onChange={(e) => setForm((p) => ({ ...p, pais: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Formato de página ── */}
              <div style={{ borderTop: "1px solid rgba(6,182,212,0.1)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>📄 Formato de Página</div>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">Fuente</label>
                    <select className="input-dark" value={form.format.font} onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, font: e.target.value } }))}>
                      <option>Times New Roman</option>
                      <option>Arial</option>
                      <option>Calibri</option>
                      <option>Garamond</option>
                    </select>
                  </div>
                  <div style={{ width: 90 }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label className="label">Alineación del texto</label>
                    <select className="input-dark" value={form.format.alineacion ?? "justify"} onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, alineacion: e.target.value as "justify" | "left" } }))}>
                      <option value="justify">Justificado</option>
                      <option value="left">Izquierda (APA monografía)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Numeración de páginas</label>
                    <select className="input-dark" value={form.format.numero_paginas_posicion ?? "top-right"} onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, numero_paginas_posicion: e.target.value as "top-right" | "bottom-center" | "top-center" } }))}>
                      <option value="top-right">Superior derecha</option>
                      <option value="top-center">Superior centro</option>
                      <option value="bottom-center">Inferior centro</option>
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
              </div>

              {/* ── Portada y documento ── */}
              <div style={{ borderTop: "1px solid rgba(6,182,212,0.1)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>📋 Portada del Documento</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label className="label">Tipo de documento</label>
                      <input className="input-dark" placeholder="Ej: MONOGRAFÍA" value={form.tipo_documento ?? ""} onChange={(e) => setForm((p) => ({ ...p, tipo_documento: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Tipo de modalidad</label>
                      <input className="input-dark" placeholder="Ej: DIPLOMADO COMO MODALIDAD DE TITULACIÓN" value={form.tipo_modalidad ?? ""} onChange={(e) => setForm((p) => ({ ...p, tipo_modalidad: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Datos adicionales que debe llenar el estudiante en la portada</label>
                    <p style={{ fontSize: 11, color: "#475569", marginBottom: 8, lineHeight: 1.5 }}>
                      Marca los campos que el sistema pedirá al estudiante al generar la portada del PDF.
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {CAMPOS_PORTADA_OPCIONES.map(({ key, label }) => {
                        const checked = (form.campos_portada ?? []).includes(key);
                        return (
                          <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#cbd5e1", padding: "6px 12px", background: checked ? "rgba(6,182,212,0.12)" : "rgba(8,12,24,0.5)", border: `1px solid ${checked ? "rgba(6,182,212,0.4)" : "rgba(30,41,59,1)"}`, borderRadius: 8, userSelect: "none" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setForm((p) => {
                                const cur = p.campos_portada ?? [];
                                return { ...p, campos_portada: checked ? cur.filter(x => x !== key) : [...cur, key] };
                              })}
                              style={{ accentColor: "#06b6d4" }}
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Plantilla HTML de portada ── */}
              <div style={{ borderTop: "1px solid rgba(6,182,212,0.1)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>🎨 Plantilla de Carátula (HTML)</div>
                <p style={{ fontSize: 11, color: "#475569", marginBottom: 8, lineHeight: 1.6 }}>
                  HTML libre para la carátula del PDF. Si está vacío, se usa la portada generada automáticamente.
                  Usa estas variables: <code style={{ color: "#67e8f9" }}>{`{nombre_estudiante} {titulo} {mes} {anio} {universidad} {facultad} {departamento} {ciudad} {pais} {programa} {version} {tutor} {carrera} {tipo_documento} {tipo_modalidad} {logo_url}`}</code>
                </p>
                <textarea
                  className="input-dark"
                  rows={8}
                  style={{ resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
                  placeholder={`<div style="text-align:center; padding: 40px;">\n  <img src="{logo_url}" style="height:80px"/>\n  <h2>{universidad}</h2>\n  <h3>{facultad}</h3>\n  <p>{tipo_modalidad}</p>\n  <h1>{titulo}</h1>\n  <p>Estudiante: {nombre_estudiante}</p>\n  <p>{ciudad}, {mes} {anio}</p>\n</div>`}
                  value={form.cover_template ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, cover_template: e.target.value }))}
                />
              </div>

              {/* ── LaTeX prompt (colapsado al final) ── */}
              <div style={{ borderTop: "1px solid rgba(6,182,212,0.1)", paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>🧾 Prompt LaTeX / IA</div>
                <label className="label">Instrucciones de formato para el documento final</label>
                <p style={{ fontSize: 11, color: "#475569", marginBottom: 8, lineHeight: 1.6 }}>
                  Describe los requisitos de formato: márgenes, fuente, interlineado, estructura de portada, numeración, etc.
                  El sistema usará esto al generar el archivo .tex del estudiante.
                </p>
                <textarea
                  className="input-dark"
                  rows={5}
                  style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                  placeholder="Ej: Formato UMSS — clase report, Times New Roman 12pt, interlineado 1.5, márgenes: superior 3cm, inferior 2.5cm, izquierdo 3cm, derecho 2.5cm. Portada con nombre de universidad, facultad, carrera, título, autor y año..."
                  value={form.latex_prompt ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, latex_prompt: e.target.value }))}
                />
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
