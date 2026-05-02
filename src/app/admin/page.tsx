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
    { label: "Monografías creadas", value: monoCounts.total,      icon: <IconDoc />,    accent: "text-sky-500 dark:text-sky-400",     ring: "bg-sky-50 dark:bg-sky-950/40" },
    { label: "Con Capítulo I",      value: monoCounts.cap1,       icon: <IconPencil />, accent: "text-violet-500 dark:text-violet-400", ring: "bg-violet-50 dark:bg-violet-950/40" },
    { label: "Con Capítulo II",     value: monoCounts.cap2,       icon: <IconBook />,   accent: "text-amber-500 dark:text-amber-400",  ring: "bg-amber-50 dark:bg-amber-950/40" },
    { label: "Completadas",         value: monoCounts.completadas, icon: <IconCheck />,  accent: "text-emerald-500 dark:text-emerald-400", ring: "bg-emerald-50 dark:bg-emerald-950/40" },
  ];

  const usoTotal = stats?.prompts?.reduce((a, p) => a + p.uso_total, 0) ?? 0;

  const QUICK_ACTIONS = [
    { href: "/admin/usuarios",    title: "Usuarios & Documentos", desc: "Ver monografías activas, capítulos generados y documentos subidos.", icon: <IconUsers /> },
    { href: "/admin/estadisticas",title: "Estadísticas de uso",   desc: "Métricas de generación, revisiones por etapa y temas populares.", icon: <IconChart /> },
    { href: "/admin/modelos",     title: "Modelos & APIs",        desc: "Configura las llaves API de Groq, OpenAI y Anthropic.",            icon: <IconCpu /> },
    { href: "/admin/prompts",     title: "Prompts Maestros",      desc: "Modifica las instrucciones que recibe la IA para cada etapa.",     icon: <IconEdit /> },
  ];

  const SYSTEM_STATUS = [
    { label: "Almacenamiento", estado: "In-memory (sesión)",                      dot: "bg-amber-400",  nota: "Conecta Supabase para persistencia" },
    { label: "IA Provider",    estado: "Groq → Anthropic → OpenAI (fallback)",    dot: "bg-emerald-400", nota: "Configurado" },
    { label: "LaTeX compiler", estado: "Generación .tex disponible",              dot: "bg-emerald-400", nota: "Compilación vía Overleaf" },
    { label: "Pagos",          estado: "Pendiente de integración",                dot: "bg-gray-400",    nota: "QR manual / Stripe próximamente" },
  ];

  const AI_LABELS: Record<number, string> = { 0: "Tema", 1: "Cap. I", 2: "Cap. II", 3: "Caps. III-V" };
  const AI_COLORS = [
    "text-sky-500 dark:text-sky-400",
    "text-violet-500 dark:text-violet-400",
    "text-amber-500 dark:text-amber-400",
    "text-orange-500 dark:text-orange-400",
  ];

  return (
    <div className="fade-in">

      {/* ── Page header ─────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
          Dashboard
        </h1>
        <p className="text-[14px] text-gray-400 dark:text-slate-500">
          Panel de control del Laboratorio Académico. Datos en tiempo real de la sesión actual.
        </p>
      </div>

      {/* ── KPI cards ───────────────────────────────── */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {STATS.map(stat => (
          <div key={stat.label}
            className="bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 flex flex-col items-center text-center"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.ring} ${stat.accent}`}>
              {stat.icon}
            </div>
            <div className={`text-[34px] font-bold leading-none mb-1 ${stat.accent}`}>{stat.value}</div>
            <div className="text-[12px] text-gray-400 dark:text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── IA usage ────────────────────────────────── */}
      {stats && (
        <div className="bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 mb-8">
          <div className="text-[11px] font-700 text-gray-400 dark:text-slate-500 uppercase tracking-[0.07em] mb-4 font-semibold">
            Llamadas a IA esta sesión
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))" }}>
            {stats.prompts.map(p => (
              <div key={p.etapa}
                className="text-center p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50"
              >
                <div className={`text-[22px] font-bold ${AI_COLORS[p.etapa] ?? "text-gray-400"}`}>{p.uso_total}</div>
                <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{AI_LABELS[p.etapa]}</div>
                {p.tiempo_promedio_seg > 0 && (
                  <div className="text-[10px] text-gray-300 dark:text-slate-600 mt-1">{p.tiempo_promedio_seg}s avg</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-[12px] text-gray-400 dark:text-slate-500 text-right">
            Total llamadas: <strong className="text-gray-700 dark:text-slate-300">{usoTotal}</strong>
          </div>
        </div>
      )}

      {/* ── Quick actions ────────────────────────────── */}
      <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight mb-4">
        Acciones Rápidas
      </h2>
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
        {QUICK_ACTIONS.map(action => (
          <a key={action.href} href={action.href}
            className="group bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm p-5
                       no-underline block hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3
                            bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400
                            group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black
                            transition-colors duration-200">
              {action.icon}
            </div>
            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-1.5">{action.title}</h3>
            <p className="text-[12px] text-gray-400 dark:text-slate-500 leading-relaxed mb-3">{action.desc}</p>
            <div className="text-[12px] font-medium text-gray-400 dark:text-slate-500
                            group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
              Ir al panel →
            </div>
          </a>
        ))}
      </div>

      {/* ── System status ────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm p-5">
        <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-[0.07em] mb-4">
          Estado del sistema
        </div>
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-slate-800">
          {SYSTEM_STATUS.map(item => (
            <div key={item.label} className="flex items-center gap-3 py-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-gray-700 dark:text-slate-300 font-medium">{item.label}</span>
                <span className="text-[12px] text-gray-400 dark:text-slate-500 ml-2">{item.estado}</span>
              </div>
              <span className="text-[11px] text-gray-300 dark:text-slate-600 shrink-0">{item.nota}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
