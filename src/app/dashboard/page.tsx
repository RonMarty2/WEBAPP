"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SECTION_STEPS } from "@/lib/data";

interface SavedProject {
  id: string;
  title: string;
  universityName: string;
  modality: string;
  programa: string;
  plan: string;
  sections: Record<string, string>;
  currentStep: number;
  savedAt: string;
  params: string;
}

const PLAN_COLORS: Record<string, string> = {
  demo: "badge-amber",
  standard: "badge-cyan",
  pro: "badge-purple",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [plan, setPlan] = useState("demo");
  const [credits, setCredits] = useState(10);

  useEffect(() => {
    // Load all saved projects from localStorage
    const all: SavedProject[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("lab_project_")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) all.push(JSON.parse(raw));
        } catch {}
      }
    }
    // Sort newest first
    all.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    setProjects(all);

    // Current session info
    const session = localStorage.getItem("lab_session");
    if (session) {
      try {
        const s = JSON.parse(session);
        setPlan(s.plan || "demo");
        setCredits(s.credits ?? (s.plan === "demo" ? 10 : s.plan === "standard" ? 100 : 999));
      } catch {}
    }
  }, []);

  const handleNewProject = () => {
    router.push("/");
  };

  const handleContinue = (project: SavedProject) => {
    router.push(`/laboratorio?${project.params}`);
  };

  const handleDelete = (projectId: string) => {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    localStorage.removeItem(`lab_project_${projectId}`);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const completedSections = (p: SavedProject) =>
    SECTION_STEPS.filter((s) => p.sections?.[s.key]).length;

  const progress = (p: SavedProject) =>
    Math.round((completedSections(p) / SECTION_STEPS.length) * 100);

  return (
    <div className="gradient-bg" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(6,182,212,0.15)", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn-ghost" onClick={() => router.push("/")} style={{ fontSize: 13, padding: "6px 14px" }}>
              ← Inicio
            </button>
            <span style={{ color: "#334155" }}>|</span>
            <span style={{ fontSize: 20 }}>🧪</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#e2e8f0" }}>Laboratorio</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#06b6d4" }}>Académico</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              Créditos:{" "}
              <span style={{ color: plan === "pro" ? "#a78bfa" : credits > 3 ? "#06b6d4" : "#f97316", fontWeight: 700 }}>
                {plan === "pro" ? "∞" : credits}
              </span>
            </div>
            <span className={`badge ${PLAN_COLORS[plan] || "badge-cyan"}`}>Plan {plan}</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
              📂 Mis Proyectos
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 15 }}>
              Retoma tus investigaciones o comienza una nueva.
            </p>
          </div>
          <button
            className="btn-cyan"
            onClick={handleNewProject}
            style={{ padding: "12px 24px", fontSize: 15, flexShrink: 0 }}
          >
            ＋ Nuevo Proyecto
          </button>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {[
            { label: "Total proyectos", value: projects.length, icon: "📁", color: "#06b6d4" },
            {
              label: "Completados",
              value: projects.filter((p) => completedSections(p) === SECTION_STEPS.length).length,
              icon: "✅",
              color: "#4ade80",
            },
            {
              label: "En progreso",
              value: projects.filter(
                (p) => completedSections(p) > 0 && completedSections(p) < SECTION_STEPS.length
              ).length,
              icon: "⚡",
              color: "#f97316",
            },
            {
              label: "Secciones totales",
              value: projects.reduce((acc, p) => acc + completedSections(p), 0),
              icon: "📝",
              color: "#8b5cf6",
            },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects list */}
        {projects.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "80px 32px", borderStyle: "dashed", borderColor: "#334155" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Aún no hay proyectos</h2>
            <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: 15 }}>
              Comienza tu primer perfil de investigación y aparecerá aquí.
            </p>
            <button className="btn-cyan" onClick={handleNewProject} style={{ padding: "12px 28px", fontSize: 15 }}>
              ＋ Crear primer proyecto
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {projects.map((project) => {
              const done = completedSections(project);
              const pct = progress(project);
              const isComplete = done === SECTION_STEPS.length;

              return (
                <div
                  key={project.id}
                  className="card"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 24,
                    alignItems: "center",
                    transition: "all 0.2s",
                    borderColor: isComplete ? "rgba(34,197,94,0.25)" : undefined,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    {/* Title row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#e2e8f0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 480,
                        }}
                      >
                        {project.title || "Proyecto sin título"}
                      </h3>
                      {isComplete && <span className="badge badge-green">✓ Completo</span>}
                      <span className={`badge ${PLAN_COLORS[project.plan] || "badge-cyan"}`}>
                        {project.plan}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                      <span>🏫 {project.universityName || "Universidad"}</span>
                      <span>📋 {project.modality || "Modalidad"}</span>
                      <span>📚 {project.programa?.substring(0, 50) || "Programa"}</span>
                      <span>🕒 {formatDate(project.savedAt)}</span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "#64748b",
                          marginBottom: 6,
                        }}
                      >
                        <span>
                          {done}/{SECTION_STEPS.length} secciones —{" "}
                          {SECTION_STEPS.filter((s) => project.sections?.[s.key])
                            .map((s) => s.label)
                            .join(", ") || "Sin secciones"}
                        </span>
                        <span style={{ color: isComplete ? "#4ade80" : "#06b6d4", fontWeight: 700 }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ background: "#1e293b", borderRadius: 999, height: 6 }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            background: isComplete
                              ? "linear-gradient(90deg,#16a34a,#4ade80)"
                              : "linear-gradient(90deg,#0891b2,#06b6d4)",
                            height: "100%",
                            borderRadius: 999,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
                    <button
                      className="btn-cyan"
                      onClick={() => handleContinue(project)}
                      style={{ justifyContent: "center", width: "100%", fontSize: 13 }}
                    >
                      {isComplete ? "📄 Ver / Exportar" : "▶ Continuar"}
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={() => handleDelete(project.id)}
                      style={{ justifyContent: "center", width: "100%", fontSize: 12, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
