"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import GlassModal from "@/components/ui/GlassModal";
import ThemeToggle from "@/components/ThemeToggle";
import AdminPlanSwitcher from "@/components/AdminPlanSwitcher";

interface Proyecto {
  id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  completado: boolean;
  created_at: string;
  servicios: { id: string; nombre: string } | null;
  defensa_lista?: boolean;
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
  const [seedingDemo, setSeedingDemo] = useState(false);

  useEffect(() => {
    // cache:"no-store" + Date.now() — evita cache del navegador / SW.
    fetch(`/api/auth/me?t=${Date.now()}`, { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.replace("/login"); return; }
        // Si el servidor regeneró el cookie (rol/plan cambió en BD), recargamos
        // la página para que TODOS los componentes vean el state nuevo.
        // El cookie ya fue actualizado por el servidor; solo hace falta refrescar.
        if (d.__refreshed) {
          window.location.reload();
          return;
        }
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

  // Carga uno de los proyectos de demostración en la cuenta del admin, con
  // el contenido de las fases ya poblado, y abre su workspace. Cada demo
  // representa una modalidad UNIFRANZ distinta y permite ver cómo se vería
  // un proyecto terminado de ese tipo cuando la API de IA esté conectada.
  async function cargarDemo(demoKey: string) {
    if (seedingDemo) return;
    setSeedingDemo(true);
    try {
      const res = await fetch("/api/admin/seed-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: demoKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url_workspace) {
        router.push(data.url_workspace);
      } else {
        alert((data as { error?: string }).error || "No se pudo cargar el proyecto de demostración.");
        setSeedingDemo(false);
      }
    } catch {
      alert("Error de conexión al cargar el proyecto de demostración.");
      setSeedingDemo(false);
    }
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
                {user.plan && user.role !== "admin" && (
                  <span className={`badge ${user.plan === "pro" ? "badge-purple" : "badge-cyan"}`} style={{ fontSize: 10 }}>
                    {user.plan.toUpperCase()}
                  </span>
                )}
                {user.role === "admin" && (
                  <AdminPlanSwitcher currentPlan={user.plan ?? "pro"} />
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ThemeToggle />
            <Link href="/" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--fg-muted)", textDecoration: "none", fontSize: 13 }}>
              Inicio
            </Link>
            {(user.role === "docente" || user.role === "admin") && (
              <Link href="/docente" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.08)", color: "#7c3aed", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
                Mis alumnos
              </Link>
            )}
            <Link href="/unirse-docente" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.35)", background: "transparent", color: "var(--fg-secondary)", textDecoration: "none", fontSize: 13 }} title="Vincúlate a un docente con un código">
              ¿Código de docente?
            </Link>
            <Link href="/mis-observaciones" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.05)", color: "#7c3aed", textDecoration: "none", fontSize: 13 }} title="Observaciones que dejaron tus docentes">
              Mis observaciones
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.35)", background: "rgba(139,92,246,0.08)", color: "#a78bfa", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
                Admin
              </Link>
            )}
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

        {/* Tu camino — dos opciones grandes para descubrir el ecosistema */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tu camino</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <a
              href="#mis-proyectos"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("mis-proyectos")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="card"
              style={{ borderColor: "rgba(37,99,235,0.25)", background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(37,99,235,0.02))", padding: 22, textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgb(37,99,235)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Camino rápido</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 6, marginBottom: 6 }}>La IA hace todo desde tu tema</h3>
              <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5, flex: 1 }}>
                Generador Autónomo. Para cuando vas apurado: dile el tema y obtén tu documento académico.
              </p>
              <span style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: "rgb(37,99,235)" }}>
                Ver mis proyectos abajo ↓
              </span>
            </a>

            <Link
              href="/modulos"
              className="card"
              style={{ borderColor: "rgba(20,184,166,0.3)", background: "linear-gradient(135deg, rgba(20,184,166,0.08), rgba(16,185,129,0.04))", padding: 22, textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", transition: "transform 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgb(13,148,136)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Camino formativo</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 6, marginBottom: 6 }}>Aprende y construye con tus datos</h3>
              <p style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5, flex: 1 }}>
                7 módulos educativos + Generador Conectado. Tu documento con datos reales, no inventados — perfecto para defender.
              </p>
              <span style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: "rgb(13,148,136)" }}>
                Explorar los módulos →
              </span>
            </Link>
          </div>
        </div>

        {/* Mis Proyectos */}
        <div id="mis-proyectos" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-muted)" }}>Mis proyectos</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {user.role === "admin" && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => cargarDemo("agrohub")}
                  disabled={seedingDemo}
                  title="UNIFRANZ — Proyecto de Grado modalidad Pre-Factibilidad. Caso: plataforma de acopio agroalimentario AgroHub."
                  style={{
                    fontSize: 12, padding: "7px 12px", borderRadius: 8, cursor: seedingDemo ? "progress" : "pointer",
                    border: "1px solid rgba(124,58,237,0.35)", background: "rgba(124,58,237,0.08)", color: "#a78bfa",
                    fontWeight: 600, opacity: seedingDemo ? 0.6 : 1,
                  }}
                >
                  Demo: Pre-Fact (AgroHub)
                </button>
                <button
                  onClick={() => cargarDemo("tesis-marketing")}
                  disabled={seedingDemo}
                  title="UNIFRANZ — Tesis de Grado. Caso: marketing digital y Generación Z en restaurantes de comida rápida."
                  style={{
                    fontSize: 12, padding: "7px 12px", borderRadius: 8, cursor: seedingDemo ? "progress" : "pointer",
                    border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.08)", color: "#16a34a",
                    fontWeight: 600, opacity: seedingDemo ? 0.6 : 1,
                  }}
                >
                  Demo: Tesis (Marketing Gen Z)
                </button>
                <button
                  onClick={() => cargarDemo("mejora-bolifarma")}
                  disabled={seedingDemo}
                  title="UNIFRANZ — Mejora Organizacional. Caso: BoliFarma cadena farmacéutica, mejora del sistema de gestión de inventarios."
                  style={{
                    fontSize: 12, padding: "7px 12px", borderRadius: 8, cursor: seedingDemo ? "progress" : "pointer",
                    border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.08)", color: "#d97706",
                    fontWeight: 600, opacity: seedingDemo ? 0.6 : 1,
                  }}
                >
                  Demo: Mejora Org (BoliFarma)
                </button>
                <button
                  onClick={() => cargarDemo("artefacto-iot")}
                  disabled={seedingDemo}
                  title="UNIFRANZ — Diseño de Artefacto. Caso: sistema IoT de monitoreo de calidad del aire en aulas universitarias."
                  style={{
                    fontSize: 12, padding: "7px 12px", borderRadius: 8, cursor: seedingDemo ? "progress" : "pointer",
                    border: "1px solid rgba(6,182,212,0.35)", background: "rgba(6,182,212,0.08)", color: "#0891b2",
                    fontWeight: 600, opacity: seedingDemo ? 0.6 : 1,
                  }}
                >
                  Demo: Artefacto (IoT Aire)
                </button>
                <button
                  onClick={() => cargarDemo("td-sumaq")}
                  disabled={seedingDemo}
                  title="UNIFRANZ — Trabajo Dirigido. Caso: programa de fidelización en restaurante Sumaq Mikhuna."
                  style={{
                    fontSize: 12, padding: "7px 12px", borderRadius: 8, cursor: seedingDemo ? "progress" : "pointer",
                    border: "1px solid rgba(236,72,153,0.35)", background: "rgba(236,72,153,0.08)", color: "#db2777",
                    fontWeight: 600, opacity: seedingDemo ? 0.6 : 1,
                  }}
                >
                  Demo: TD (Sumaq Mikhuna)
                </button>
                {seedingDemo && (
                  <span style={{ fontSize: 11, color: "var(--fg-muted)", alignSelf: "center", marginLeft: 4 }}>
                    Cargando…
                  </span>
                )}
              </div>
            )}
            <Link href="/projects/new" className="btn-cyan" style={{ textDecoration: "none", fontSize: 13, padding: "8px 18px" }}>
              + Nuevo proyecto
            </Link>
          </div>
        </div>

        {loadingProyectos ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>
            {[1, 2, 3].map(i => <div key={i} className="card shimmer" style={{ height: 140 }} />)}
          </div>
        ) : proyectos.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px", marginBottom: 32, borderStyle: "dashed", borderColor: "var(--border-hover)" }}>
            <div style={{ marginBottom: 16, opacity: 0.5, display: "flex", justifyContent: "center", color: "var(--fg-muted)" }} aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="13" y2="17"/>
              </svg>
            </div>
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
                  aria-label="Eliminar proyecto"
                >✕</button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 24, gap: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 600 }}>{p.servicios?.nombre || "Monografía"}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {p.completado && <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Completo</span>}
                    {p.defensa_lista && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 700, border: "1px solid rgba(16,185,129,0.3)" }}>Defensa lista</span>}
                  </div>
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
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg-primary)" }}>Monografía académica</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.45 }}>Documento académico estructurado por fases.</div>
            </div>
          </Link>

          <Link href="/projects/new?tipo=tipo-demostracion-competencias" className="card card-hover" style={{ textDecoration: "none", display: "flex", gap: 12, alignItems: "center", borderColor: "rgba(34,197,94,0.28)", background: "rgba(34,197,94,0.05)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", fontWeight: 800 }}>DC</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg-primary)" }}>Demostración de competencias</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.45 }}>Materia, reto, competencias y evidencias para defensa.</div>
            </div>
          </Link>

          {/* 🎓 Proyecto de Grado — UCATEC (en desarrollo, pero ya seleccionable) */}
          <Link href="/projects/new?tipo=proy-grado-001" className="card card-hover" style={{ textDecoration: "none", display: "flex", gap: 12, alignItems: "center", borderColor: "rgba(124,58,237,0.28)", background: "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", fontWeight: 800 }}>PG</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg-primary)" }}>Proyecto de Grado</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.45 }}>Proyecto de factibilidad (producción o servicios). UCATEC.</div>
            </div>
          </Link>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-muted)", marginBottom: 14 }}>Próximamente</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {[{ initials: "TE", name: "Tesis" }, { initials: "EA", name: "Ensayo académico" }, { initials: "TF", name: "Trabajo final" }].map(pr => (
            <div key={pr.name} className="card" style={{ opacity: 0.45, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(15,23,42,0.06)", color: "var(--fg-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{pr.initials}</div>
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
          <Link href="/admin" style={{ textDecoration: "none" }} aria-label="Abrir panel de administrador">
            <button
              className="btn-purple"
              title="Panel de administrador"
              style={{ borderRadius: "50%", width: 52, height: 52, padding: 0, boxShadow: "0 0 24px rgba(139,92,246,0.5)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(139,92,246,0.4)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
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
