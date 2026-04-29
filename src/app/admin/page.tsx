"use client";

import { SECTION_STEPS, DEFAULT_UNIVERSITIES } from "@/lib/data";

const STATS = [
  { label: "Universidades activas", value: DEFAULT_UNIVERSITIES.filter(u => u.is_active).length, icon: "🏫", color: "#06b6d4" },
  { label: "Secciones configuradas", value: SECTION_STEPS.length, icon: "📝", color: "#8b5cf6" },
  { label: "Proveedores de IA", value: 3, icon: "🤖", color: "#4ade80" },
  { label: "Prompts maestros", value: SECTION_STEPS.length, icon: "✍️", color: "#f97316" },
];

export default function AdminDashboard() {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📊 Dashboard</h1>
        <p style={{ color: "#94a3b8", fontSize: 15 }}>
          Panel de control del Laboratorio Académico. Desde aquí controlas toda la plataforma.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {STATS.map((stat) => (
          <div key={stat.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Acciones Rápidas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { href: "/admin/modelos", title: "Gestionar Modelos", desc: "Configura las llaves API de Groq, OpenAI y Anthropic. Asigna modelos a cada plan.", icon: "🤖" },
          { href: "/admin/prompts", title: "Editor de Prompts", desc: "Modifica las instrucciones que recibe la IA para cada sección del documento.", icon: "✍️" },
          { href: "/admin/universidades", title: "Biblioteca de Universidades", desc: "Añade nuevas universidades con sus formatos de márgenes, fuentes e interlineado.", icon: "🏫" },
        ].map((action) => (
          <a key={action.href} href={action.href} className="card card-hover" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{action.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>{action.title}</h3>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{action.desc}</p>
            <div style={{ marginTop: 16, color: "#06b6d4", fontSize: 13, fontWeight: 500 }}>Ir al panel →</div>
          </a>
        ))}
      </div>

      {/* Sections overview */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Secciones del Documento</h2>
      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["#", "Icono", "Sección", "Créditos", "Estado"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTION_STEPS.map((step, i) => (
              <tr key={step.key} style={{ borderBottom: "1px solid rgba(30,41,59,0.5)" }}>
                <td style={{ padding: "12px", color: "#475569", fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: "12px", fontSize: 18 }}>{step.icon}</td>
                <td style={{ padding: "12px", fontSize: 14, color: "#e2e8f0", fontWeight: 500 }}>{step.label}</td>
                <td style={{ padding: "12px" }}>
                  <span className="badge badge-cyan">{step.credits} crédito{step.credits > 1 ? "s" : ""}</span>
                </td>
                <td style={{ padding: "12px" }}>
                  <span className="badge badge-green">✓ Activo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
