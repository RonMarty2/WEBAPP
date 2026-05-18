"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function IconScroll() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconCpu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const GLOBAL_NAV = [
  { href: "/admin", label: "Dashboard General", Icon: IconDashboard },
  { href: "/admin/usuarios", label: "Usuarios", Icon: IconUsers },
  { href: "/admin/pagos", label: "Pagos", Icon: IconBarChart },
  { href: "/admin/estadisticas", label: "Estadisticas", Icon: IconBarChart },
  { href: "/admin/logs", label: "Logs", Icon: IconScroll },
  { href: "/admin/modelos", label: "Modelos y APIs", Icon: IconCpu },
  { href: "/admin/ui-config", label: "Apariencia UI", Icon: IconLayers },
];

const MODULE_NAV: Record<string, Array<{ href: string; label: string; Icon: React.ComponentType }>> = {
  SCRIBE: [
    { href: "/admin/proyectos", label: "Proyectos de Alumnos", Icon: IconFolder },
    { href: "/admin/pdf-solicitudes", label: "Solicitudes de PDF", Icon: IconFolder },
    { href: "/admin/banco-observaciones", label: "Banco de Observaciones", Icon: IconList },
    { href: "/admin/universidades", label: "Universidades", Icon: IconBuilding },
    { href: "/admin/project-types", label: "Tipos de Proyecto", Icon: IconLayers },
    { href: "/admin/fases", label: "Fases del Proyecto", Icon: IconList },
    { href: "/admin/prompts", label: "Prompts Maestros", Icon: IconEdit },
  ],
  AXIOM: [
    { href: "/admin/simulaciones", label: "Simulaciones", Icon: IconCpu },
    { href: "/admin/banco-preguntas", label: "Banco de Preguntas", Icon: IconList },
  ],
  LUMEN: [
    { href: "/admin/material-docente", label: "Material Docente", Icon: IconFolder },
    { href: "/admin/cursos", label: "Cursos", Icon: IconBuilding },
  ],
  MENTOR: [
    { href: "/admin/tutores", label: "Tutores", Icon: IconUsers },
    { href: "/admin/sesiones", label: "Sesiones", Icon: IconList },
  ],
  GLOBAL: [],
};

const LAYOUT_CSS = `
  .admin-frame {
    --adm-bg: rgba(5, 8, 12, 0.84);
    --adm-sidebar: rgba(9, 12, 18, 0.9);
    --adm-sidebar-strong: rgba(13, 17, 24, 0.97);
    --adm-panel: rgba(18, 24, 34, 0.74);
    --adm-line: rgba(140, 154, 176, 0.16);
    --adm-line-strong: rgba(196, 205, 219, 0.22);
    --adm-text: #edf2fb;
    --adm-soft: #cad5e2;
    --adm-muted: #8794a8;
    --adm-accent: #b7c5d8;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    color: var(--adm-text);
  }

  .admin-frame * {
    font-family: inherit;
  }

  .admin-mobilebar,
  .admin-sidebar {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0)),
      var(--adm-sidebar);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    will-change: transform;
    border-color: var(--adm-line);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  }

  .admin-sidebar::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: linear-gradient(90deg, #00c2ff, rgba(0, 194, 255, 0.3), transparent);
    pointer-events: none;
    z-index: 1;
  }

  .admin-sidebar::after {
    content: "";
    position: absolute;
    inset: 3px 0 auto 0;
    height: 160px;
    background: radial-gradient(circle at 30% 0%, rgba(0, 194, 255, 0.06), transparent 50%);
    pointer-events: none;
  }

  .admin-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 2px 10px;
    padding: 11px 12px;
    font-size: 12px;
    color: var(--adm-muted);
    text-decoration: none;
    border: 1px solid transparent;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
  }

  .admin-nav-link:hover {
    background: rgba(255,255,255,0.03);
    border-color: var(--adm-line);
    color: var(--adm-text);
    transform: translateX(2px);
  }

  .admin-nav-link.is-active {
    background: linear-gradient(90deg, rgba(0, 194, 255, 0.10), rgba(0, 194, 255, 0.02));
    border-color: rgba(0, 194, 255, 0.28);
    border-left: 2px solid #00c2ff;
    color: #ffffff;
    box-shadow: inset 0 0 12px rgba(0, 194, 255, 0.06);
  }

  .admin-nav-link.is-active .admin-nav-indicator {
    color: #00c2ff;
    text-shadow: 0 0 8px rgba(0, 194, 255, 0.7);
  }

  .admin-chip {
    border: 1px solid var(--adm-line);
    background: rgba(255,255,255,0.03);
    color: var(--adm-soft);
  }

  .admin-main {
    background-image: linear-gradient(rgba(0, 194, 255, 0.02) 1px, transparent 1px);
    background-size: 100% 48px;
  }

  .admin-main::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(4, 8, 14, 0.72), rgba(4, 8, 14, 0.44) 40%, rgba(4, 8, 14, 0.68)),
      radial-gradient(circle at 82% 14%, rgba(0, 194, 255, 0.06), transparent 32%);
    pointer-events: none;
  }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeModule, setActiveModule] = useState("GLOBAL");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedModule = localStorage.getItem("adminActiveModule");
    if (savedModule) setActiveModule(savedModule);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setActiveModule(value);
    localStorage.setItem("adminActiveModule", value);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    router.replace("/admin/login");
  };

  if (!pathname || pathname.includes("/admin/login")) return <>{children}</>;

  const currentModuleNav = MODULE_NAV[activeModule] || [];

  return (
    <div className="admin-frame flex min-h-screen flex-col md:flex-row relative z-10">
      <style>{LAYOUT_CSS}</style>

      <div className="admin-mobilebar md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "#8794a8" }}>Comando Central</div>
          <div className="text-[12px] font-bold tracking-[0.08em]" style={{ color: "#edf2fb" }}>LAB.ACADEMICO ADMIN</div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="admin-chip flex h-10 w-10 items-center justify-center"
        >
          <IconMenu />
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="md:hidden fixed inset-0 z-40 bg-black/55 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      ) : null}

      <aside
        className={`admin-sidebar fixed md:relative top-0 left-0 z-50 flex h-full w-[280px] shrink-0 flex-col border-r transition-transform duration-200 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} md:sticky md:top-0 md:h-screen`}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute right-3 top-3 admin-chip flex h-10 w-10 items-center justify-center"
        >
          <IconX />
        </button>

        <div className="relative px-5 py-6 border-b" style={{ borderColor: "rgba(140, 154, 176, 0.16)" }}>
          <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "#8794a8" }}>Bunker Estrategico</div>
          <div className="mt-2 text-[18px] font-bold tracking-[0.05em]" style={{ color: "#edf2fb" }}>LAB.ACADEMICO</div>
          <div className="mt-1 text-[11px]" style={{ color: "#cad5e2" }}>ADMIN PROTOCOL / NUCLEO JEFE</div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
            <div className="admin-chip px-3 py-2">
              <div style={{ color: "#8794a8" }}>Estado</div>
              <div style={{ color: "#edf2fb" }}>En linea</div>
            </div>
            <div className="admin-chip px-3 py-2">
              <div style={{ color: "#8794a8" }}>Acceso</div>
              <div style={{ color: "#edf2fb" }}>Total</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(140, 154, 176, 0.16)" }}>
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: "#8794a8" }}>Modulo activo</div>
          <select
            value={activeModule}
            onChange={handleModuleChange}
            className="w-full border px-3 py-3 text-[11px] font-bold uppercase tracking-[0.08em] outline-none"
            style={{
              color: "#edf2fb",
              background: "rgba(8, 12, 18, 0.7)",
              borderColor: "rgba(140, 154, 176, 0.16)",
            }}
          >
            <option value="GLOBAL">Nucleo Global</option>
            <option value="SCRIBE">Scribe</option>
            <option value="AXIOM">Axiom</option>
            <option value="LUMEN">Lumen</option>
            <option value="MENTOR">Mentor</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {currentModuleNav.length > 0 ? (
            <div className="mb-4">
              <div className="px-4 pb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: "#8794a8" }}>
                Dominio {activeModule.toLowerCase()}
              </div>
              <nav className="flex flex-col">
                {currentModuleNav.map(({ href, label, Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link key={href} href={href} className={`admin-nav-link ${isActive ? "is-active" : ""}`}>
                      <span className="admin-nav-indicator text-[12px]">{isActive ? "[+]" : "[ ]"}</span>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ) : null}

          <div>
            <div className="px-4 pb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: "#8794a8" }}>
              Control global
            </div>
            <nav className="flex flex-col">
              {GLOBAL_NAV.map(({ href, label, Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href} className={`admin-nav-link ${isActive ? "is-active" : ""}`}>
                    <span className="admin-nav-indicator text-[12px]">{isActive ? "[+]" : "[ ]"}</span>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="border-t px-3 py-3" style={{ borderColor: "rgba(140, 154, 176, 0.16)" }}>
          <Link href="/dashboard" className="admin-nav-link">
            <span className="admin-nav-indicator text-[12px]">[ ]</span>
            <span>Vista estudiante</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-link w-full text-left" style={{ color: "#fecaca" }}>
            <span className="admin-nav-indicator text-[12px]">[x]</span>
            <span>Salir del panel</span>
          </button>
        </div>
      </aside>

      <main className="admin-main relative flex-1 min-w-0 overflow-y-auto">
        <div className="relative z-10 px-5 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
