"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// ── SVG Icons ────────────────────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function IconScroll() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function IconCpu() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  );
}
function IconList() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/admin",               label: "Dashboard",          Icon: IconDashboard },
  { href: "/admin/usuarios",      label: "Usuarios",           Icon: IconUsers     },
  { href: "/admin/proyectos",     label: "Proyectos & Prompts",Icon: IconFolder    },
  { href: "/admin/universidades", label: "Universidades",      Icon: IconBuilding  },
  { href: "/admin/estadisticas",  label: "Estadísticas",       Icon: IconBarChart  },
  { href: "/admin/logs",          label: "Logs",               Icon: IconScroll    },
  { href: "/admin/modelos",       label: "Modelos & APIs",     Icon: IconCpu       },
  { href: "/admin/project-types", label: "Tipos de Proyecto",  Icon: IconLayers    },
  { href: "/admin/fases",         label: "Fases del Proyecto", Icon: IconList      },
  { href: "/admin/prompts",       label: "Prompts Maestros",   Icon: IconEdit      },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Always start as null — server and client must render identically on first pass.
  // Reading localStorage here would cause a hydration mismatch (server can't access it).
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Don't act until we have a real pathname, and skip the login page itself.
    if (!pathname || pathname.includes("/admin/login")) return;

    const flag = localStorage.getItem("adminAuthed") === "1";
    if (flag) {
      setAuthed(true);
    } else {
      window.location.replace("/admin/login");
    }
  }, [pathname]);

  const handleLogout = async () => {
    localStorage.removeItem("adminAuthed");
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    window.location.replace("/admin/login");
  };

  // Login page — render children directly, no sidebar, no auth check.
  // This guard fires BEFORE the authed===null spinner check below,
  // so the login page never shows a loading state.
  if (!pathname || pathname.includes("/admin/login")) return <>{children}</>;

  // Brief spinner while useEffect reads localStorage on first mount.
  if (authed === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0F19" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="admin-layout flex min-h-screen bg-gray-50 dark:bg-[#0B0F19]">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-[240px] shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto
                        bg-white dark:bg-slate-950
                        border-r border-gray-200 dark:border-slate-800">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 pt-6 pb-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg
                           bg-black dark:bg-white text-white dark:text-black shrink-0">
            <IconBolt />
          </span>
          <div>
            <div className="font-bold text-[13px] text-gray-900 dark:text-white leading-tight tracking-tight">
              Lab. Académico
            </div>
            <div className="text-[10px] font-semibold text-violet-500 dark:text-violet-400 tracking-widest uppercase">
              Admin
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 my-2 h-px bg-gray-100 dark:bg-slate-800" />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1 px-4 py-2">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <a
                key={href}
                href={href}
                className={[
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl text-[13px] transition-colors duration-150 no-underline",
                  isActive
                    ? "bg-gray-100 dark:bg-slate-800 text-black dark:text-white font-semibold"
                    : "font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <span className="shrink-0 opacity-80"><Icon /></span>
                {label}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 flex flex-col gap-1.5 border-t border-gray-100 dark:border-slate-800">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-[12px] font-medium
                       text-blue-600 dark:text-blue-400
                       hover:bg-blue-50 dark:hover:bg-blue-950/40
                       transition-colors duration-150 no-underline"
          >
            <IconUser /> Vista estudiante
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-[12px] font-medium
                       text-red-500 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-950/30
                       transition-colors duration-150 cursor-pointer text-left w-full border-0 bg-transparent"
          >
            <IconLogOut /> Salir del panel
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-h-screen p-8">
        {children}
      </main>

    </div>
  );
}
