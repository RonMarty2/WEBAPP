"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

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
    router.replace("/admin/login");
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
    <div className="admin-layout flex flex-col md:flex-row min-h-screen bg-transparent relative z-10">
      
      {/* ── Barra Superior Móvil ────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#e5e7eb] sticky top-0 z-30"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        <div>
          <span className="text-[11px] font-bold text-[#000] tracking-widest uppercase">LAB.ACADÉMICO</span>
          <span className="text-[9px] text-[#999] ml-2">[ADMIN]</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 text-[#666] hover:bg-[#f5f5f5] transition-colors border border-[#e5e7eb]"
          style={{ fontFamily: "monospace" }}
        >
          <IconMenu />
        </button>
      </div>

      {/* ── Overlay Fondo Móvil ─────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar Dinámica ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-full w-[240px]
          border-r border-[#e5e7eb]/60
          z-50 flex flex-col shrink-0
          transition-transform duration-200 ease-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:sticky md:top-0 md:h-screen
        `}
        style={{
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          background: "rgba(255,255,255,0.30)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-3 right-3 p-1.5 text-[#999] hover:bg-[#f5f5f5] transition-colors"
        >
          <IconX />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#e5e7eb]">
          <div className="text-[10px] text-[#999] mb-1">// sistema</div>
          <div className="text-[12px] font-bold text-[#000] tracking-tight">LAB.ACADÉMICO</div>
          <div className="text-[10px] text-[#999]">ADMIN_PRO v1.0</div>
        </div>

        {/* Module Selector */}
        <div className="px-4 py-3 border-b border-[#e5e7eb]">
          <div className="text-[9px] font-bold text-[#999] uppercase tracking-widest mb-1.5">// módulo activo</div>
          <div className="relative">
            <select
              value={activeModule}
              onChange={handleModuleChange}
              className="w-full appearance-none text-[11px] font-bold text-[#000]
                         bg-white border border-[#e5e7eb]
                         px-3 py-2 pr-7 focus:outline-none
                         focus:border-[#000] cursor-pointer transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <option value="GLOBAL">NUCLEO_GLOBAL</option>
              <option value="SCRIBE">SCRIBE (tesis)</option>
              <option value="AXIOM">AXIOM (simulador)</option>
              <option value="LUMEN">LUMEN (docencia)</option>
              <option value="MENTOR">MENTOR (tutores)</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#999] text-[10px]">
              ▾
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 no-scrollbar">

          {currentModuleNav.length > 0 && (
            <div className="mb-4">
              <div className="px-4 mb-1 text-[9px] font-bold text-[#bbb] uppercase tracking-widest">
                // {activeModule.toLowerCase()}
              </div>
              <nav className="flex flex-col">
                {currentModuleNav.map(({ href, label, Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2 px-4 py-2 text-[12px] transition-colors duration-100 no-underline"
                      style={{
                        color: isActive ? "#000" : "#666",
                        fontWeight: isActive ? 700 : 400,
                        background: isActive ? "#f5f5f5" : "transparent",
                        borderLeft: isActive ? "2px solid #000" : "2px solid transparent",
                      }}
                    >
                      <span className="text-[10px] w-4 shrink-0">{isActive ? "[•]" : "[ ]"}</span>
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          <div>
            <div className="px-4 mb-1 text-[9px] font-bold text-[#bbb] uppercase tracking-widest">
              // global
            </div>
            <nav className="flex flex-col">
              {GLOBAL_NAV.map(({ href, label, Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-4 py-2 text-[12px] transition-colors duration-100 no-underline"
                    style={{
                      color: isActive ? "#000" : "#666",
                      fontWeight: isActive ? 700 : 400,
                      background: isActive ? "#f5f5f5" : "transparent",
                      borderLeft: isActive ? "2px solid #000" : "2px solid transparent",
                    }}
                  >
                    <span className="text-[10px] w-4 shrink-0">{isActive ? "[•]" : "[ ]"}</span>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e5e7eb] py-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-[11px] text-[#666] hover:text-[#000] hover:bg-[#f5f5f5] transition-colors no-underline"
          >
            <span className="text-[10px]">[ ]</span> vista_estudiante
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-[11px] text-[#c00] hover:bg-[#fff5f5] transition-colors text-left w-full border-0 bg-transparent cursor-pointer"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <span className="text-[10px]">[ ]</span> salir_del_panel
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main
        className="flex-1 min-w-0 overflow-y-auto relative z-0"
        style={{ background: "transparent" }}
      >
        <div className="px-8 py-8 relative z-10">
          {children}
        </div>
      </main>

    </div>
  );
}

