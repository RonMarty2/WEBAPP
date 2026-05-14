"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import GlassModal from "@/components/ui/GlassModal";
import ThemeToggle from "@/components/ThemeToggle";

interface Proyecto {
  id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  completado: boolean;
  created_at: string;
  servicios: { id: string; nombre: string } | null;
}

const FASE_LABELS = ["Planteamiento", "Cap. I", "Cap. II", "Caps. III-V", "Revisión", "Final"];

function FaseProgress({ fase }: { fase: number }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {FASE_LABELS.map((_, i) => (
        <div
          key={i}
          title={FASE_LABELS[i]}
          style={{
            width: 18, height: 4, borderRadius: 2,
            background: i <= fase ? "var(--accent)" : "var(--border)",
          }}
        />
      ))}
      <span style={{ fontSize: 11, color: "var(--fg-muted)", marginLeft: 4 }}>{fase + 1}/6</span>

    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [proyectoToDelete, setProyectoToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.replace("/login"); return; }
        setUser(d.user);
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => { setProyectos(d.proyectos ?? []); setLoadingProyectos(false); })
      .catch(() => setLoadingProyectos(false));
  }, [user]);

  
  async function confirmDelete() {
    if (!proyectoToDelete) return;
    try {
      const res = await fetch(`/api/projects/${proyectoToDelete}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProyectos(prev => prev.filter(p => p.id !== proyectoToDelete));
        setProyectoToDelete(null);
      } else {
        alert((data as { error?: string }).error || "Error al eliminar el proyecto.");
      }
    } catch {
      alert("Error de conexión al eliminar.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="bg-transparent" style={{ minHeight: "100vh", position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-transparent" style={{ minHeight: "100vh", position: "relative", zIndex: 10, padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user.picture ? (
              <img src={user.picture} alt="" style={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid var(--accent)" }} />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>
                {user.name[0]}
              </div>
            )}
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-primary)" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{user.email}</span>
                {user.plan && (
                  <span className={`badge ${user.plan === "pro" ? "badge-purple" : "badge-cyan"}`} style={{ fontSize: 10 }}>
                    {user.plan.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ThemeToggle />
            <Link href="/" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--fg-muted)", textDecoration: "none", fontSize: 13 }}>
              Inicio
            </Link>
            <Link href="/admin" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.35)", background: "rgba(139,92,246,0.08)", color: "#a78bfa", textDecoration: "none", fontSize: 13 }}>
              ⚡ Admin
            </Link>
            <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.3)", background: "transparent", color: "#f87171", fontSize: 13, cursor: "pointer" }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Welcome */}
        <div className="card" style={{ marginBottom: 28, borderColor: "rgba(37,99,235,0.22)", background: "rgba(37,99,235,0.06)", position: "relative", overflow: "hidden" }}>
          {/* Micro-sphere glow */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, position: "relative" }}>Bienvenido, {user.name.split(" ")[0]}</h1>
          <p style={{ color: "var(--fg-muted)", fontSize: 14, position: "relative" }}>Desde aquí puedes crear y gestionar tus documentos académicos.</p>
        </div>

        {/* Mis Proyectos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-muted)" }}>Mis proyectos</h2>
          <Link href="/projects/new" className="btn-cyan" style={{ textDecoration: "none", fontSize: 13, padding: "8px 18px" }}>
            + Nuevo proyecto
          </Link>
        </div>

        {loadingProyectos ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>
            {[1, 2, 3].map(i => <div key={i} className="card shimmer" style={{ height: 140 }} />)}
          </div>
        ) : proyectos.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px", marginBottom: 32, borderStyle: "dashed", borderColor: "var(--border-hover)" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-secondary)", marginBottom: 8 }}>Aún no tienes proyectos</div>
            <div style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 24 }}>Crea tu primer documento académico con IA</div>
            <Link href="/projects/new" className="btn-cyan" style={{ textDecoration: "none", display: "inline-flex", padding: "10px 24px" }}>
              Crear mi primer proyecto →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>
            {proyectos.map(p => (
              <div
                key={p.id}
                className="card card-hover"
                onClick={() => router.push(`/projects/${p.id}/workspace`)}
                style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setProyectoToDelete(p.id); }} 
                  className="absolute top-3 right-3 hover:-translate-y-1 hover:shadow-lg transition-all" 
                  style={{ border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, zIndex: 20 }} 
                  title="Eliminar proyecto"
                >✕</button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 24 }}>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 600 }}>{p.servicios?.nombre || "Monografía"}</span>
                  {p.completado && <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Completo</span>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {p.tema_aprobado || p.titulo_provisional || "Proyecto sin título"}
                </div>
                <FaseProgress fase={p.estado_fase} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                    {new Date(p.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short" })}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Continuar →</span>
                </div>
              </div>
            ))}
            <div
              className="card card-hover"
              onClick={() => router.push("/projects/new")}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 140, borderStyle: "dashed", borderColor: "var(--border-hover)", background: "transparent" }}
            >
              <div style={{ fontSize: 28, color: "var(--fg-muted)" }}>+</div>
              <div style={{ fontSize: 13, color: "var(--fg-secondary)", fontWeight: 600 }}>Nuevo proyecto</div>
            </div>
          </div>
        )}

        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 14 }}>Servicios disponibles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginBottom: 32 }}>
          <Link href="/projects/new?tipo=tipo-monografia" className="card card-hover" style={{ textDecoration: "none", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 800 }}>M</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg-primary)" }}>Monografia academica</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.45 }}>Documento academico estructurado por fases.</div>
            </div>
          </Link>

          <Link href="/projects/new?tipo=tipo-demostracion-competencias" className="card card-hover" style={{ textDecoration: "none", display: "flex", gap: 12, alignItems: "center", borderColor: "rgba(34,197,94,0.28)", background: "rgba(34,197,94,0.05)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", fontWeight: 800 }}>DC</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg-primary)" }}>Demostracion de competencias</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.45 }}>Materia, reto, competencias y evidencias para defensa.</div>
            </div>
          </Link>

          {/* 🎓 Proyecto de Grado — UCATEC (en desarrollo, pero ya seleccionable) */}
          <Link href="/projects/new?tipo=proy-grado-001" className="card card-hover" style={{ textDecoration: "none", display: "flex", gap: 12, alignItems: "center", borderColor: "rgba(124,58,237,0.28)", background: "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", fontWeight: 800 }}>PG</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg-primary)" }}>Proyecto de Grado</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.45 }}>Proyecto de factibilidad (produccion o servicios). UCATEC.</div>
            </div>
          </Link>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 14 }}>Proximamente</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {[{ icon: "🎓", name: "Tesis" }, { icon: "📝", name: "Ensayo académico" }, { icon: "📊", name: "Trabajo final" }].map(pr => (
            <div key={pr.name} className="card" style={{ opacity: 0.4, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 28 }}>{pr.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)" }}>{pr.name}</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Próximamente</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modo Dios — botón flotante solo para admin */}
      {user.role === "admin" && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200 }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button
              className="btn-purple"
              title="Panel Admin — Modo Dios"
              style={{ borderRadius: "50%", width: 52, height: 52, padding: 0, fontSize: 22, boxShadow: "0 0 24px rgba(139,92,246,0.5)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(139,92,246,0.4)" }}
            >
              ⚡
            </button>
          </Link>
        </div>
      )}

      <GlassModal
        isOpen={!!proyectoToDelete}
        onClose={() => setProyectoToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Empezar de cero?"
        message="¿Estás seguro de que deseas eliminar este proyecto por completo? Esta acción es irreversible y borrará todo el progreso actual."
        confirmText="Eliminar Proyecto"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </div>
  );
}
