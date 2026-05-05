"use client";

import { useState, useEffect } from "react";
import { DEFAULT_UNIVERSITIES, University } from "@/lib/data";
import UniversityCard from "@/components/admin/UniversityCard";
import UniversityModal, { UniversityFormData } from "@/components/admin/UniversityModal";

// ── Icon ───────────────────────────────────────────────────────────────────
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ── Empty form default ─────────────────────────────────────────────────────
const EMPTY: UniversityFormData = {
  name: "",
  logo_url: "",
  logo_assets: {},
  latex_prompt: "",
  cover_template: "",
  campos_portada: [],
  format: {
    pageSize: "letter",
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

// ── Page ───────────────────────────────────────────────────────────────────
export default function UniversidadesPage() {
  const [universities, setUniversities] = useState<University[]>([...DEFAULT_UNIVERSITIES]);
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [form,        setForm]        = useState<UniversityFormData>({ ...EMPTY });
  const [newModality, setNewModality] = useState("");
  const [saving,      setSaving]      = useState(false);

  // Load
  useEffect(() => {
    fetch("/api/admin/universities")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUniversities(data))
      .catch(() => {});
  }, []);

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name.trim()) return alert("El nombre es obligatorio.");
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body   = editingId ? { ...form, id: editingId } : form;
      const res    = await fetch("/api/admin/universities", {
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
      setForm({ ...EMPTY });
    } catch {
      alert("Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const handleEdit = (univ: University) => {
    setForm({
      name:           univ.name,
      logo_url:       univ.logo_url || "",
      logo_assets:    { ...(univ.logo_assets ?? {}) },
      latex_prompt:   univ.latex_prompt || "",
      cover_template: univ.cover_template || "",
      campos_portada: [...(univ.campos_portada ?? [])],
      format: {
        ...univ.format,
        pageSize:                univ.format.pageSize ?? "letter",
        margins:                 { ...univ.format.margins },
        alineacion:              univ.format.alineacion ?? "justify",
        numero_paginas_posicion: univ.format.numero_paginas_posicion ?? "top-right",
      },
      modalities: [...univ.modalities],
      is_active:  univ.is_active,
    });
    setEditingId(univ.id);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta universidad?")) return;
    await fetch("/api/admin/universities", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    setUniversities((prev) => prev.filter((u) => u.id !== id));
  };

  // Modalities helpers
  const addModality = () => {
    if (!newModality.trim()) return;
    setForm((prev) => ({ ...prev, modalities: [...prev.modalities, newModality.trim()] }));
    setNewModality("");
  };
  const removeModality = (m: string) =>
    setForm((prev) => ({ ...prev, modalities: prev.modalities.filter((x) => x !== m) }));

  // Open "add" form
  const openAdd = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setShowForm(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fade-in max-w-4xl">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white mb-1">
            Biblioteca de Universidades
          </h1>
          <p className="text-[14px] text-gray-400 dark:text-slate-500">
            Añade y configura los formatos de cada universidad. Los cambios se aplican automáticamente.
          </p>
        </div>

        {/* Primary CTA — Antigravity pill button */}
        <button
          onClick={openAdd}
          className="
            inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold
            bg-black text-white dark:bg-white dark:text-black
            hover:-translate-y-0.5 hover:shadow-lg
            transition-all duration-150 cursor-pointer shrink-0
          "
        >
          <IconPlus /> Añadir Universidad
        </button>
      </div>

      {/* Count pill */}
      <p className="text-[12px] text-gray-400 dark:text-slate-500 mb-4">
        {universities.length} {universities.length === 1 ? "universidad" : "universidades"} configuradas
      </p>

      {/* University list */}
      <div className="flex flex-col gap-3">
        {universities.map((univ) => (
          <UniversityCard
            key={univ.id}
            univ={univ}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      <UniversityModal
        open={showForm}
        editingId={editingId}
        form={form}
        setForm={setForm}
        newModality={newModality}
        setNewModality={setNewModality}
        saving={saving}
        onSave={handleSave}
        onClose={() => setShowForm(false)}
        onAddModality={addModality}
        onRemoveModality={removeModality}
      />
    </div>
  );
}
