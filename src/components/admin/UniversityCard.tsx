"use client";

import { University } from "@/lib/data";

// ── Icons ──────────────────────────────────────────────────────────────────
function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
function IconCode() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────
interface UniversityCardProps {
  univ: University;
  onEdit: (univ: University) => void;
  onDelete: (id: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function UniversityCard({ univ, onEdit, onDelete }: UniversityCardProps) {
  const isProtected = univ.id.startsWith("umss") || univ.id.startsWith("umsa");

  return (
    <div className="
      group flex items-start gap-4 p-5 rounded-[24px]
      bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl
      border border-white/50 dark:border-white/10
      shadow-[0_8px_32px_rgba(0,0,0,0.04)]
      transition-all duration-300 hover:shadow-[0_16px_40px_rgba(99,102,241,0.15)] hover:-translate-y-1 hover:border-indigo-500/30
    ">

      {/* ── Main info ───────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Title row */}
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight truncate">
            {univ.name}
          </span>
          <span className={[
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
            univ.is_active
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
          ].join(" ")}>
            {univ.is_active ? "Activa" : "Inactiva"}
          </span>
          {isProtected && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase
              bg-slate-100 text-slate-500 border border-slate-200
              dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
              Sistema
            </span>
          )}
        </div>

        {/* Format metadata */}
        <div className="flex gap-4 text-[12px] text-gray-400 dark:text-slate-500 flex-wrap mb-3">
          <span>{univ.format.font} · {univ.format.size}pt</span>
          <span>Interlineado {univ.format.lineHeight}</span>
          <span>Márgenes {univ.format.margins.top}/{univ.format.margins.left}/{univ.format.margins.bottom}/{univ.format.margins.right} cm</span>
        </div>

        {/* LaTeX prompt preview */}
        {univ.latex_prompt ? (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl mb-3
            bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm
            border border-white/60 dark:border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.6)]">
            <span className="mt-0.5 shrink-0 text-gray-400 dark:text-slate-500">
              <IconCode />
            </span>
            <p className="text-[11px] text-gray-700 dark:text-gray-300 font-mono leading-relaxed
              max-h-10 overflow-hidden line-clamp-2">
              {univ.latex_prompt}
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-slate-500 italic mb-3">
            Sin prompt LaTeX — haz clic en Editar para configurar
          </p>
        )}

        {/* Modality badges */}
        {univ.modalities.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {univ.modalities.map((m) => (
              <span key={m} className="
                inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium
                bg-blue-50 text-blue-700 border border-blue-100
                dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800
              ">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Action buttons ──────────────────────────────────────────── */}
      <div className="flex gap-2 shrink-0 pt-0.5">
        <button
          onClick={() => onEdit(univ)}
          className="
            inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium
            border border-gray-200/50 dark:border-white/10
            text-gray-600 dark:text-slate-300
            hover:bg-indigo-500 hover:text-white hover:border-indigo-500
            transition-all duration-200 cursor-pointer shadow-sm
          "
        >
          <IconEdit /> Editar
        </button>

        {!isProtected && (
          <button
            onClick={() => onDelete(univ.id)}
            className="
              inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium
              border border-red-200/50 dark:border-red-900/30
              text-red-500 dark:text-red-400
              hover:bg-red-500 hover:text-white hover:border-red-500
              transition-all duration-200 cursor-pointer shadow-sm
            "
          >
            <IconTrash /> Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
