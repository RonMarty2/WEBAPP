"use client";

import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/usuarios", label: "Usuarios & Docs", icon: "👥" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "📁" },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: "📈" },
  { href: "/admin/logs", label: "Logs de errores", icon: "🪵" },
  { href: "/admin/modelos", label: "Modelos & APIs", icon: "🤖" },
  { href: "/admin/prompts", label: "Prompts Maestros", icon: "✍️" },
  { href: "/admin/universidades", label: "Universidades", icon: "🏫" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#020617" }}>
      {/* Admin Sidebar */}
      <aside className="sidebar" style={{ padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingLeft: 8 }}>
          <span style={{ fontSize: 20 }}>🧪</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#e2e8f0" }}>Laboratorio Académico</div>
            <div style={{ fontSize: 11, color: "#06b6d4" }}>Panel Admin</div>
          </div>
        </div>

        <div style={{ height: 1, background: "#1e293b", margin: "16px 0" }} />

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 8, textDecoration: "none", transition: "all 0.15s",
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#e2e8f0" : "#94a3b8",
                  background: isActive ? "rgba(6,182,212,0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(6,182,212,0.25)" : "1px solid transparent",
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={{ marginTop: 16 }}>
          <a
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", fontSize: 13, color: "#06b6d4", textDecoration: "none", borderRadius: 8, border: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.05)" }}
          >
            ⚡ Vista Usuario (Modo Dios)
          </a>
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ width: "100%", marginTop: 8, fontSize: 13, justifyContent: "flex-start", padding: "10px 12px", color: "#f87171" }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="content-area" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
