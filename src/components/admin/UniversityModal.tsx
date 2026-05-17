"use client";

import { useEffect, useMemo, useState } from "react";
import { University } from "@/lib/data";
import type { UniversityLogoAsset } from "@/lib/logoAssets";

// ── Types ──────────────────────────────────────────────────────────────────
const CAMPOS_PORTADA_OPCIONES = [
  { key: "programa",  label: "Nombre del programa/diplomado" },
  { key: "version",   label: "Versión del programa" },
  { key: "tutor",     label: "Tutor/a de tesis" },
  { key: "carrera",   label: "Carrera" },
];

export type UniversityFormData = Omit<University, "id">;

interface UniversityModalProps {
  open: boolean;
  editingId: string | null;
  form: UniversityFormData;
  setForm: React.Dispatch<React.SetStateAction<UniversityFormData>>;
  newModality: string;
  setNewModality: (v: string) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  onAddModality: () => void;
  onRemoveModality: (m: string) => void;
}

// ── Reusable field wrapper ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-widest uppercase
                        text-blue-600 dark:text-blue-400">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Shared input/select/textarea className ─────────────────────────────────
const inputCls = `
  w-full px-3 py-2 rounded-xl text-[13px]
  bg-gray-50 dark:bg-slate-800
  border border-gray-200 dark:border-slate-700
  text-gray-900 dark:text-slate-100
  placeholder-gray-400 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
  focus:border-gray-400 dark:focus:border-slate-500
  transition-colors duration-150
`.replace(/\n\s+/g, " ").trim();

// ── Section divider ────────────────────────────────────────────────────────
function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
      <span className="text-[10px] font-bold tracking-widest uppercase
                       text-gray-400 dark:text-slate-500 shrink-0">
        {title}
      </span>
      <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function UniversityModal({
  open, editingId, form, setForm,
  newModality, setNewModality,
  saving, onSave, onClose,
  onAddModality, onRemoveModality,
}: UniversityModalProps) {
  const [activeTab, setActiveTab] = useState<"formato" | "archivos">("formato");
  const [logoAssets, setLogoAssets] = useState<UniversityLogoAsset[]>([]);
  const [assetFolder, setAssetFolder] = useState("");
  const [assetStatus, setAssetStatus] = useState("");
  const [uploadingAssets, setUploadingAssets] = useState(false);

  const universityName = form.name.trim();
  const assetMap = useMemo(
    () => Object.fromEntries(logoAssets.map(asset => [asset.variable, asset.url])),
    [logoAssets]
  );

  useEffect(() => {
    if (!open || !universityName) {
      setLogoAssets([]);
      setAssetFolder("");
      return;
    }

    let cancelled = false;
    fetch(`/api/admin/university-assets?universityName=${encodeURIComponent(universityName)}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (cancelled) return;
        const assets = (data.assets ?? []) as UniversityLogoAsset[];
        setAssetFolder(data.folder ?? "");
        setLogoAssets(assets);
        setForm(prev => {
          const assetUrls = new Set(assets.map(asset => asset.url));
          const currentLogoIsUploaded = Boolean(prev.logo_url && assetUrls.has(prev.logo_url));
          return {
            ...prev,
            logo_assets: Object.fromEntries(assets.map(asset => [asset.variable, asset.url])),
            logo_url: currentLogoIsUploaded ? prev.logo_url : (assets[0]?.url ?? prev.logo_url),
          };
        });
      })
      .catch(() => {
        if (!cancelled) setAssetStatus("No se pudieron cargar los archivos.");
      });

    return () => { cancelled = true; };
  }, [open, universityName, setForm]);

  async function uploadLogoAssets(files: FileList | null) {
    if (!files?.length || !universityName) return;
    setUploadingAssets(true);
    setAssetStatus("");

    const body = new FormData();
    body.append("universityName", universityName);
    Array.from(files).forEach(file => body.append("files", file));

    try {
      const res = await fetch("/api/admin/university-assets", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron subir los archivos.");
      setLogoAssets(data.assets ?? []);
      setAssetFolder(data.folder ?? "");
      const nextAssets = Object.fromEntries((data.assets ?? []).map((asset: UniversityLogoAsset) => [asset.variable, asset.url]));
      const primaryLogoUrl = data.primaryAsset?.url ?? data.assets?.[0]?.url ?? "";
      const nextForm = {
        ...form,
        logo_assets: nextAssets,
        logo_url: primaryLogoUrl || form.logo_url,
      };
      setForm(nextForm);

      if (editingId) {
        const saveRes = await fetch("/api/admin/universities", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...nextForm, id: editingId }),
        });
        if (!saveRes.ok) throw new Error("El logo subio, pero no se pudo guardar la universidad.");
        setAssetStatus("Logo subido y guardado como principal.");
      } else {
        setAssetStatus("Logo subido y marcado como principal. Guarda la universidad para aplicarlo.");
      }
    } catch (err) {
      setAssetStatus(err instanceof Error ? err.message : "No se pudieron subir los archivos.");
    } finally {
      setUploadingAssets(false);
    }
  }

  function copyAssetText(text: string) {
    navigator.clipboard?.writeText(text).then(
      () => setAssetStatus(`Copiado: ${text}`),
      () => setAssetStatus(text)
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6
                    bg-black/60 dark:bg-black/80 backdrop-blur-sm">
      <div className="
        w-full max-w-2xl max-h-[90vh] overflow-y-auto
        bg-white dark:bg-slate-900
        border border-gray-200 dark:border-slate-800
        rounded-2xl shadow-2xl dark:shadow-black/60
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5
                        border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
            {editingId ? "Editar Universidad" : "Nueva Universidad"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400
                       hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600
                       dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 dark:bg-slate-950 p-1 border border-gray-100 dark:border-slate-800">
            {(["formato", "archivos"] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "px-3 py-2 rounded-lg text-[12px] font-bold transition-colors cursor-pointer",
                  activeTab === tab
                    ? "bg-white text-gray-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white",
                ].join(" ")}
              >
                {tab === "formato" ? "Formato y Plantilla" : "Archivos / Logos"}
              </button>
            ))}
          </div>

          {activeTab === "archivos" && (
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
              <Section title="Archivos de la Universidad" />
              <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                Sube el logo oficial. El sistema lo marcara como logo principal y lo usara en
                <code className="mx-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-[11px]">{"{logo_url}"}</code>
                sin cambiar la plantilla.
              </p>

              {!universityName ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  Escribe primero el nombre de la universidad para crear su carpeta de logos.
                </div>
              ) : (
                <>
                  <Field label="Subir logos">
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.svg"
                      className={inputCls}
                      disabled={uploadingAssets}
                      onChange={(e) => {
                        uploadLogoAssets(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                  </Field>

                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 px-4 py-3 text-[12px] text-gray-600 dark:text-slate-300">
                    Carpeta: <code className="text-blue-600 dark:text-blue-400">{assetFolder || "se creará al subir"}</code>
                  </div>

                  {assetStatus && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300">
                      {assetStatus}
                    </div>
                  )}

                  {logoAssets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 px-4 py-8 text-center text-[12px] text-gray-400 dark:text-slate-500">
                      Todavía no hay logos subidos para esta universidad.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {logoAssets.map(asset => (
                        <div key={asset.url} className="grid grid-cols-[56px_1fr_auto] gap-3 items-center rounded-xl border border-gray-100 dark:border-slate-800 p-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                            <img src={asset.url} alt={asset.fileName} className="max-h-10 max-w-10 object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12px] font-bold text-gray-900 dark:text-white truncate">{asset.fileName}</div>
                            {form.logo_url === asset.url && (
                              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                                Logo principal
                              </div>
                            )}
                            <button type="button" onClick={() => copyAssetText(asset.url)}
                              className="block text-left text-[11px] text-gray-400 dark:text-slate-500 hover:underline cursor-pointer truncate max-w-full">
                              {asset.url}
                            </button>
                          </div>
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, logo_url: asset.url }))}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
                            {form.logo_url === asset.url ? "Principal" : "Usar"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Nombre */}
          <Field label="Nombre completo *">
            <input
              className={inputCls}
              placeholder="Ej: Universidad Mayor de San Simón (UMSS)"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>

          <Field label="Logo URL">
            <input
              className={inputCls}
              placeholder="/logos/umss.png o https://...logo.png"
              value={form.logo_url ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))}
            />
          </Field>

          {/* ── Formato de página (Avanzado) ── */}
          <details className="group border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <summary className="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 cursor-pointer list-none flex justify-between items-center text-[13px] font-semibold text-gray-700 dark:text-slate-300">
              ⚙️ Configuración Avanzada del Documento (Capítulos)
              <span className="group-open:rotate-180 transition-transform text-xs opacity-50">▼</span>
            </summary>
          <div className="p-4 flex flex-col gap-4 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tamaño de papel">
              <select className={inputCls} value={form.format.pageSize ?? "letter"}
                onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, pageSize: e.target.value as "letter" | "a4" | "legal" } }))}>
                <option value="letter">Carta (8.5 x 11)</option>
                <option value="a4">A4</option>
                <option value="legal">Oficio / Legal</option>
              </select>
            </Field>
          </div>
          <div className="flex gap-3">
            <Field label="Fuente">
              <select className={inputCls} value={form.format.font}
                onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, font: e.target.value } }))}>
                <option>Times New Roman</option>
                <option>Arial</option>
                <option>Calibri</option>
                <option>Garamond</option>
              </select>
            </Field>
            <div className="w-24">
              <Field label="Tamaño">
                <input type="number" className={inputCls} value={form.format.size} min={10} max={14}
                  onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, size: Number(e.target.value) } }))} />
              </Field>
            </div>
            <div className="w-36">
              <Field label="Interlineado">
                <select className={inputCls} value={form.format.lineHeight}
                  onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, lineHeight: Number(e.target.value) } }))}>
                  <option value={1.0}>1.0 (Simple)</option>
                  <option value={1.5}>1.5</option>
                  <option value={2.0}>2.0 (Doble)</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Alineación del texto">
              <select className={inputCls} value={form.format.alineacion ?? "justify"}
                onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, alineacion: e.target.value as "justify" | "left" } }))}>
                <option value="justify">Justificado</option>
                <option value="left">Izquierda (APA)</option>
              </select>
            </Field>
            <Field label="Numeración de páginas">
              <select className={inputCls} value={form.format.numero_paginas_posicion ?? "top-right"}
                onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, numero_paginas_posicion: e.target.value as "top-right" | "bottom-center" | "top-center" } }))}>
                <option value="top-right">Superior derecha</option>
                <option value="top-center">Superior centro</option>
                <option value="bottom-center">Inferior centro</option>
              </select>
            </Field>
          </div>

          <Field label="Márgenes (cm): Superior · Izquierdo · Inferior · Derecho">
            <div className="grid grid-cols-4 gap-2">
              {(["top", "left", "bottom", "right"] as const).map((side) => (
                <div key={side} className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 text-center">
                    {side === "top" ? "Superior" : side === "left" ? "Izquierdo" : side === "bottom" ? "Inferior" : "Derecho"}
                  </span>
                  <input type="number" className={inputCls + " text-center"} step={0.5}
                    value={form.format.margins[side]}
                    onChange={(e) => setForm((p) => ({ ...p, format: { ...p.format, margins: { ...p.format.margins, [side]: Number(e.target.value) } } }))} />
                </div>
              ))}
            </div>
          </Field>
          </div>
          </details>

          {/* ── Portada ── */}
          <Section title="Campos de la Portada Interactiva" />

          <Field label="Datos adicionales que llenará el estudiante">
            <p className="text-[11px] text-gray-400 dark:text-slate-500 -mt-1">
              Marca los campos que el sistema pedirá al estudiante al generar la portada.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {CAMPOS_PORTADA_OPCIONES.map(({ key, label }) => {
                const checked = (form.campos_portada ?? []).includes(key);
                return (
                  <label key={key} className={[
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer select-none",
                    "border transition-colors duration-150",
                    checked
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                  ].join(" ")}>
                    <input type="checkbox" className="sr-only" checked={checked}
                      onChange={() => setForm((p) => {
                        const cur = p.campos_portada ?? [];
                        return { ...p, campos_portada: checked ? cur.filter(x => x !== key) : [...cur, key] };
                      })} />
                    {label}
                  </label>
                );
              })}
            </div>
          </Field>

          {/* ── Plantilla HTML ── */}
          <Section title="Plantilla de Carátula (HTML)" />

          <p className="text-[11px] text-gray-400 dark:text-slate-500 -mt-2 leading-relaxed">
            HTML libre para la carátula. Variables disponibles:{" "}
            <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-[10px]">
              {`{nombre_estudiante} {titulo} {mes} {anio} {universidad} {ciudad} {logo_url} ${Object.keys(assetMap).map(key => `{${key}}`).join(" ")}`}
            </code>
          </p>
          <textarea
            className={inputCls + " font-mono text-[11px] resize-y"}
            rows={6}
            placeholder={`<div style="text-align:center; padding: 40px;">\n  <img src="{logo_url}" style="height:80px"/>\n  <h2>{universidad}</h2>\n  <h1>{titulo}</h1>\n  <p>{nombre_estudiante}</p>\n</div>`}
            value={form.cover_template ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, cover_template: e.target.value }))}
          />

          {/* ── LaTeX Prompt ── */}
          <Section title="Prompt LaTeX / IA" />

          <p className="text-[11px] text-gray-400 dark:text-slate-500 -mt-2 leading-relaxed">
            Describe los requisitos de formato: márgenes, fuente, interlineado, portada, numeración, etc.
          </p>
          <textarea
            className={inputCls + " font-mono text-[12px] resize-y"}
            rows={4}
            placeholder="Ej: Formato UMSS — clase report, Times New Roman 12pt, interlineado 1.5..."
            value={form.latex_prompt ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, latex_prompt: e.target.value }))}
          />

          {/* ── Modalidades ── */}
          <Section title="Modalidades de Graduación" />

          <div className="flex flex-wrap gap-1.5">
            {form.modalities.map((m) => (
              <span key={m} className="
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium
                bg-blue-50 text-blue-700 border border-blue-100
                dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800
              ">
                {m}
                <button onClick={() => onRemoveModality(m)}
                  className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 cursor-pointer bg-transparent border-0 leading-none">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="Nueva modalidad..."
              value={newModality}
              onChange={(e) => setNewModality(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddModality()}
            />
            <button onClick={onAddModality}
              className="px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer
                         border border-gray-200 dark:border-slate-700
                         text-gray-600 dark:text-slate-300
                         hover:bg-gray-50 dark:hover:bg-slate-800
                         transition-colors duration-150 shrink-0">
              + Añadir
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-[13px] font-medium cursor-pointer
                       border border-gray-200 dark:border-slate-700
                       text-gray-600 dark:text-slate-300
                       hover:bg-gray-50 dark:hover:bg-slate-800
                       transition-colors duration-150"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.name}
            className="flex-[2] py-2.5 rounded-full text-[13px] font-bold cursor-pointer
                       bg-black text-white dark:bg-white dark:text-black
                       hover:-translate-y-0.5 hover:shadow-lg
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                       transition-all duration-150"
          >
            {saving
              ? "Guardando..."
              : editingId ? "Actualizar Universidad" : "Crear Universidad"}
          </button>
        </div>
      </div>
    </div>
  );
}
