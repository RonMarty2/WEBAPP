"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// ── SVG Icons ────────────────────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function IconScroll() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function IconCpu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  );
}
function IconLayers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/><polyline points="2 12 17 22 12"/>
    </svg>
  );
}
function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const GLOBAL_NAV = [
  { href: "/admin",               label: "Dashboard General",  Icon: IconDashboard },
  { href: "/admin/usuarios",      label: "Usuarios",           Icon: IconUsers     },
  { href: "/admin/estadisticas",  label: "Estadísticas",       Icon: IconBarChart  },
  { href: "/admin/logs",          label: "Logs",               Icon: IconScroll    },
  { href: "/admin/modelos",       label: "Modelos & APIs",     Icon: IconCpu       },
  { href: "/admin/ui-config",     label: "Apariencia UI",      Icon: IconLayers    },
];

const MODULE_NAV: Record<string, Array<{href: string, label: string, Icon: any}>> = {
  SCRIBE: [
    { href: "/admin/proyectos",     label: "Proyectos de Alumnos", Icon: IconFolder    },
    { href: "/admin/universidades", label: "Universidades",      Icon: IconBuilding  },
    { href: "/admin/project-types", label: "Tipos de Proyecto",  Icon: IconLayers    },
    { href: "/admin/fases",         label: "Fases del Proyecto", Icon: IconList      },
    { href: "/admin/prompts",       label: "Prompts Maestros",   Icon: IconEdit      },
  ],
  AXIOM: [
    { href: "/admin/simulaciones",  label: "Simulaciones",       Icon: IconCpu       },
    { href: "/admin/banco-preguntas",label: "Banco de Preguntas", Icon: IconList      },
  ],
  LUMEN: [
    { href: "/admin/material-docente", label: "Material Docente",Icon: IconFolder    },
    { href: "/admin/cursos",        label: "Cursos",             Icon: IconBuilding  },
  ],
  MENTOR: [
    { href: "/admin/tutores",       label: "Tutores",            Icon: IconUsers     },
    { href: "/admin/sesiones",      label: "Sesiones",           Icon: IconList      },
  ],
  GLOBAL: [
    // Global Dashboard is handled in GLOBAL_NAV
  ]
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Always start as null — server and client must render identically on first pass.
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [activeModule, setActiveModule] = useState<string>("GLOBAL");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Don't act until we have a real pathname, and skip the login page itself.
    if (!pathname || pathname.includes("/admin/login")) return;

    const flag = localStorage.getItem("adminAuthed") === "1";
    if (flag) {
      setAuthed(true);
    } else {
      router.replace("/admin/login");
    }

    const savedModule = localStorage.getItem("adminActiveModule");
    if (savedModule) setActiveModule(savedModule);
  }, [pathname, router]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveModule(val);
    localStorage.setItem("adminActiveModule", val);
  };

  const handleLogout = async () => {
    localStorage.removeItem("adminAuthed");
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    window.location.replace("/admin/login");
  };

  // Login page — render children directly, no sidebar, no auth check.
  if (!pathname || pathname.includes("/admin/login")) return <>{children}</>;

  // Brief spinner while useEffect reads localStorage on first mount.
  if (authed === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0F19" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const currentModuleNav = MODULE_NAV[activeModule] || [];

  return (
    <div className="admin-layout flex flex-col md:flex-row min-h-screen bg-transparent relative z-10 p-0 md:p-6 lg:p-8 gap-0 md:gap-6 lg:gap-8">
      
      {/* ── Barra Superior Móvil ────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-3">
           <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] shrink-0">
             <IconBolt />
           </span>
           <div className="flex flex-col">
             <span className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight tracking-tight">
               Lab. Académico
             </span>
             <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-[0.15em] uppercase">
               Admin Pro
             </span>
           </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
           <IconMenu />
        </button>
      </div>

      {/* ── Overlay Fondo Móvil ─────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar Dinámica ────────────────────────────────────────────── */}
      <aside className={`
        fixed md:relative top-0 left-0 h-full md:h-[calc(100vh-64px)] w-[280px] md:w-[260px] 
        bg-white/95 dark:bg-slate-900/95 md:bg-white/40 md:dark:bg-slate-900/40 backdrop-blur-xl 
        border-r md:border border-gray-200 dark:border-white/10 md:border-white/60 md:dark:border-white/10 
        md:rounded-[32px] shadow-[8px_0_32px_rgba(0,0,0,0.1)] md:shadow-[0_8px_32px_rgba(0,0,0,0.04)] z-50 flex flex-col shrink-0
        transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:sticky md:top-8
      `}>
        
        {/* Botón Cerrar (Móvil) */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <IconX />
        </button>

        {/* Logo (Desktop & Mobile Drawer) */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl
                           bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] shrink-0">
            <IconBolt />
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight tracking-tight">
              Lab. Académico
            </span>
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-[0.15em] uppercase">
              Admin Pro
            </span>
          </div>
        </div>

        {/* Module Selector */}
        <div className="px-6 pb-4">
          <div className="relative">
            <select
              value={activeModule}
              onChange={handleModuleChange}
              className="w-full appearance-none bg-white/50 dark:bg-slate-800/50 
                         border border-gray-200/50 dark:border-white/10 
                         text-gray-700 dark:text-slate-300 text-xs font-semibold 
                         rounded-xl px-4 py-2.5 pr-8 focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500/50 cursor-pointer
                         transition-all"
            >
              <option value="GLOBAL">🌐 NŪCLEO Global</option>
              <option value="SCRIBE">📝 SCRIBE (Tesis)</option>
              <option value="AXIOM">📊 AXIOM (Simulador)</option>
              <option value="LUMEN">📚 LUMEN (Docencia)</option>
              <option value="MENTOR">🤝 MENTOR (Tutores)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-gray-500 dark:text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 mb-4 h-px bg-gray-200/50 dark:bg-slate-700/50" />

        {/* Nav Links - Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
          
          {/* Módulo Específico */}
          {currentModuleNav.length > 0 && (
            <div className="mb-6">
              <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                Opciones {activeModule}
              </div>
              <nav className="flex flex-col gap-1">
                {currentModuleNav.map(({ href, label, Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <a
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 no-underline
                        ${isActive
                          ? "bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                        }`}
                    >
                      <span className={`shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}>
                        <Icon />
                      </span>
                      <span>{label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Opciones Globales */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              Configuraciones Globales
            </div>
            <nav className="flex flex-col gap-1">
              {GLOBAL_NAV.map(({ href, label, Icon }) => {
                const isActive = pathname === href;
                return (
                  <a
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 no-underline
                      ${isActive
                        ? "bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                      }`}
                  >
                    <span className={`shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}>
                      <Icon />
                    </span>
                    <span>{label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 flex flex-col gap-2 border-t border-gray-200/50 dark:border-slate-700/50 shrink-0 bg-white/20 dark:bg-slate-900/20">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold
                       text-gray-600 dark:text-slate-300
                       hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white
                       transition-all duration-300 no-underline"
          >
            <IconUser /> Vista estudiante
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold
                       text-red-500 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300
                       transition-all duration-300 cursor-pointer text-left w-full border-0 bg-transparent"
          >
            <IconLogOut /> Salir del panel
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-screen py-6 px-4 md:px-0 md:py-8 pr-0 md:pr-6 lg:pr-8">
        <div className="flex-1 w-full max-w-5xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

