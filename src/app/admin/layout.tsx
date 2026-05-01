"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
  { href: "/admin/proyectos", label: "Proyectos & Prompts", icon: "📁" },
  { href: "/admin/universidades", label: "Universidades", icon: "🏛️" },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: "📈" },
  { href: "/admin/logs", label: "Logs", icon: "🪵" },
  { href: "/admin/modelos", label: "Modelos & APIs", icon: "🤖" },
  { href: "/admin/fases", label: "Fases del Proyecto", icon: "📋" },
  { href: "/admin/prompts", label: "Prompts Maestros", icon: "✍️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // En la página de login siempre mostrar
    if (pathname === "/admin/login") {
      setAuthed(true);
      return;
    }
    // Verificar flag en localStorage (seteado tras login exitoso)
    const flag = typeof window !== "undefined" && localStorage.getItem("adminAuthed");
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

  // Página de login: sin sidebar
  if (pathname === "/admin/login") return <>{children}</>;

  // Esperando verificación
  if (authed === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020617" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020617" }}>
      {/* Sidebar */}
      <aside style={{
        width: 226, flexShrink: 0,
        background: "rgba(8,12,24,0.98)",
        borderRight: "1px solid rgba(139,92,246,0.18)",
        display: "flex", flexDirection: "column",
        padding: "22px 14px",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#e2e8f0", lineHeight: 1.2 }}>Lab. Académico</div>
            <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: "0.06em" }}>ADMIN · MODO DIOS</div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(139,92,246,0.2)", margin: "14px 0" }} />

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 11px", borderRadius: 7, textDecoration: "none",
                fontSize: 13, fontWeight: isActive ? 700 : 400,
                color: isActive ? "#e2e8f0" : "#64748b",
                background: isActive ? "rgba(139,92,246,0.18)" : "transparent",
                border: isActive ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                transition: "all 0.12s",
              }}>
                <span>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Footer links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <a href="/dashboard" style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 11px",
            fontSize: 12, color: "#06b6d4", textDecoration: "none", borderRadius: 7,
            border: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.05)",
          }}>
            👤 Vista estudiante
          </a>
          <button onClick={handleLogout} style={{
            padding: "9px 11px", fontSize: 12, color: "#f87171", background: "transparent",
            border: "1px solid rgba(248,113,113,0.2)", borderRadius: 7,
            cursor: "pointer", textAlign: "left",
          }}>
            🚪 Salir del panel
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
