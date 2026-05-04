"use client";

import { useState, useEffect } from "react";

interface DashStats {
  total_monografias_generadas: number;
  completadas: number;
  este_mes: number;
  prompts: Array<{ etapa: number; uso_total: number; uso_este_mes: number; tiempo_promedio_seg: number }>;
}

interface MonografiaCount {
  total: number;
  cap1: number;
  cap2: number;
  completadas: number;
}

// ── SVG Icons ───────────────────────────────────────────────────────
function IconDoc() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function IconPencil() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function IconCpu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [monoCounts, setMonoCounts] = useState<MonografiaCount>({ total: 0, cap1: 0, cap2: 0, completadas: 0 });

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => null);

    fetch("/api/admin/monografias")
      .then(r => r.json())
      .then((d: Array<{ etapa_actual: number; status: string }>) => {
        if (!Array.isArray(d)) return;
        setMonoCounts({
          total: d.length,
          cap1: d.filter(m => m.etapa_actual >= 1).length,
          cap2: d.filter(m => m.etapa_actual >= 2).length,
          completadas: d.filter(m => m.status === "completa" || m.etapa_actual >= 3).length,
        });
      })
      .catch(() => null);
  }, []);

  const STATS = [
    { label: "Monografías creadas", value: monoCounts.total,       icon: <IconDoc />,    accent: "text-sky-600",         ring: "bg-sky-50" },
    { label: "Con Capítulo I",      value: monoCounts.cap1,        icon: <IconPencil />, accent: "text-violet-600",   ring: "bg-violet-50" },
    { label: "Con Capítulo II",     value: monoCounts.cap2,        icon: <IconBook />,   accent: "text-amber-600",     ring: "bg-amber-50" },
    { label: "Completadas",         value: monoCounts.completadas, icon: <IconCheck />,  accent: "text-emerald-600", ring: "bg-emerald-50" },
  ];

  const usoTotal = stats?.prompts?.reduce((a, p) => a + p.uso_total, 0) ?? 0;

  const QUICK_ACTIONS = [
    { href: "/admin/usuarios",    title: "Usuarios & Documentos", desc: "Ver monografías activas, capítulos generados y documentos subidos.", icon: <IconUsers /> },
    { href: "/admin/estadisticas",title: "Estadísticas de uso",   desc: "Métricas de generación, revisiones por etapa y temas populares.", icon: <IconChart /> },
    { href: "/admin/modelos",     title: "Modelos & APIs",        desc: "Configura las llaves API de Groq, OpenAI y Anthropic.",            icon: <IconCpu /> },
    { href: "/admin/prompts",     title: "Prompts Maestros",      desc: "Modifica las instrucciones que recibe la IA para cada etapa.",     icon: <IconEdit /> },
  ];

  const SYSTEM_STATUS = [
    { label: "Almacenamiento", estado: "In-memory (sesión)",                      dot: "bg-amber-500",  nota: "Conecta Supabase para persistencia" },
    { label: "IA Provider",    estado: "Groq → Anthropic → OpenAI (fallback)",    dot: "bg-emerald-500", nota: "Configurado" },
    { label: "LaTeX compiler", estado: "Generación .tex disponible",              dot: "bg-emerald-500", nota: "Compilación vía Overleaf" },
    { label: "Pagos",          estado: "Pendiente de integración",                dot: "bg-slate-400",    nota: "QR manual / Stripe próximamente" },
  ];

  const AI_LABELS: Record<number, string> = { 0: "Tema", 1: "Cap. I", 2: "Cap. II", 3: "Caps. III-V" };
  const AI_COLORS = [
    "text-sky-600",
    "text-violet-600",
    "text-amber-600",
    "text-orange-600",
  ];

  return (
    <div className="fade-in max-w-[1400px] mx-auto">

      {/* ── Page header ─────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Panel de control del Laboratorio Académico. Datos en tiempo real de la sesión actual.
        </p>
      </div>

      {/* ── KPI cards (4 Columns) ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {STATS.map(stat => (
          <div key={stat.label}
            className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-slate-500">
                {stat.label}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.ring} ${stat.accent}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800 tracking-tight">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── IA usage ────────────────────────────────── */}
      {stats && (
        <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl p-6 mb-10">
          <div className="text-sm font-semibold tracking-wide uppercase text-slate-500 mb-6">
            Llamadas a IA esta sesión
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.prompts.map(p => (
              <div key={p.etapa} className="flex flex-col border-l-2 border-slate-200 pl-4">
                <div className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">
                  {AI_LABELS[p.etapa]}
                </div>
                <div className={`text-3xl font-bold ${AI_COLORS[p.etapa] ?? "text-slate-800"}`}>
                  {p.uso_total}
                </div>
                {p.tiempo_promedio_seg > 0 && (
                  <div className="text-xs text-slate-400 mt-1">
                    {p.tiempo_promedio_seg}s avg
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200/50 flex justify-end items-center text-sm">
            <span className="text-slate-500 mr-2 font-medium">Total llamadas:</span>
            <strong className="text-slate-800 text-lg font-bold">{usoTotal}</strong>
          </div>
        </div>
      )}

      {/* ── Quick actions ────────────────────────────── */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-5">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_ACTIONS.map(action => (
            <a key={action.href} href={action.href}
              className="group bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-sm no-underline flex flex-col hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 overflow-hidden relative"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-slate-100 text-slate-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                {action.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">
                {action.desc}
              </p>
              <div className="text-sm font-semibold text-indigo-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                Ir al panel
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── System status ────────────────────────────── */}
      <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl p-6">
        <div className="text-sm font-semibold tracking-wide uppercase text-slate-500 mb-4">
          Estado del sistema
        </div>
        <div className="flex flex-col divide-y divide-slate-200/50">
          {SYSTEM_STATUS.map(item => (
            <div key={item.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4">
              <div className="flex items-center gap-3 w-full sm:w-1/3 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${item.dot}`} />
                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
              </div>
              <div className="flex-1 text-sm text-slate-600 font-medium pl-5 sm:pl-0">
                {item.estado}
              </div>
              <div className="text-xs text-slate-400 pl-5 sm:pl-0 sm:text-right w-full sm:w-1/3 shrink-0">
                {item.nota}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
