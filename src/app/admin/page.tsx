"use client";

import { useState, useEffect } from "react";

interface DashStats {
  total_monografias_generadas: number;
  completadas: number;
  este_mes: number;
  prompts: Array<{ etapa: number; uso_total: number; uso_este_mes: number; tiempo_promedio_seg: number }>;
}

interface MonografiaCount {
  total: number;
  cap1: number;
  cap2: number;
  completadas: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [monoCounts, setMonoCounts] = useState<MonografiaCount>({ total: 0, cap1: 0, cap2: 0, completadas: 0 });

  useEffect(() => {
    fetch("/api/admin/estadisticas")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => null);

    fetch("/api/admin/monografias")
      .then(r => r.json())
      .then((d: Array<{ etapa_actual: number; status: string }>) => {
        if (!Array.isArray(d)) return;
        setMonoCounts({
          total: d.length,
          cap1: d.filter(m => m.etapa_actual >= 1).length,
          cap2: d.filter(m => m.etapa_actual >= 2).length,
          completadas: d.filter(m => m.status === "completa" || m.etapa_actual >= 3).length,
        });
      })
      .catch(() => null);
  }, []);

  const STATS = [
    { label: "Monografías creadas", value: monoCounts.total, icon: "📄", color: "#06b6d4" },
    { label: "Con Capítulo I", value: monoCounts.cap1, icon: "📝", color: "#8b5cf6" },
    { label: "Con Capítulo II", value: monoCounts.cap2, icon: "📚", color: "#f59e0b" },
    { label: "Completadas", value: monoCounts.completadas, icon: "✅", color: "#22c55e" },
  ];

  const usoTotal = stats?.prompts?.reduce((a, p) => a + p.uso_total, 0) ?? 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📊 Dashboard</h1>
        <p style={{ color: "#94a3b8", fontSize: 15 }}>
          Panel de control del Laboratorio Académico. Datos en tiempo real de la sesión actual.
        </p>
      </div>

      {/* KPIs monografías */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 28 }}>
        {STATS.map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Uso de IA */}
      {stats && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
            Llamadas a IA esta sesión
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
            {stats.prompts.map(p => {
              const labels: Record<number, string> = { 0: "Tema", 1: "Cap. I", 2: "Cap. II", 3: "Caps. III-V" };
              const colors = ["#06b6d4", "#8b5cf6", "#f59e0b", "#f97316"];
              return (
                <div key={p.etapa} style={{ textAlign: "center", padding: "12px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: colors[p.etapa] ?? "#94a3b8" }}>{p.uso_total}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{labels[p.etapa]}</div>
                  {p.tiempo_promedio_seg > 0 && (
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{p.tiempo_promedio_seg}s avg</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#475569", textAlign: "right" }}>
            Total llamadas: <strong style={{ color: "#94a3b8" }}>{usoTotal}</strong>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Acciones Rápidas</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { href: "/admin/usuarios", title: "Usuarios & Documentos", desc: "Ver monografías activas, capítulos generados y documentos subidos.", icon: "👥" },
          { href: "/admin/estadisticas", title: "Estadísticas de uso", desc: "Métricas de generación, revisiones por etapa y temas populares.", icon: "📈" },
          { href: "/admin/modelos", title: "Modelos & APIs", desc: "Configura las llaves API de Groq, OpenAI y Anthropic.", icon: "🤖" },
          { href: "/admin/prompts", title: "Prompts Maestros", desc: "Modifica las instrucciones que recibe la IA para cada etapa.", icon: "✍️" },
        ].map(action => (
          <a key={action.href} href={action.href} className="card card-hover" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{action.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>{action.title}</h3>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{action.desc}</p>
            <div style={{ marginTop: 14, color: "#06b6d4", fontSize: 13, fontWeight: 500 }}>Ir al panel →</div>
          </a>
        ))}
      </div>

      {/* Estado del sistema */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Estado del sistema
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Almacenamiento", estado: "In-memory (sesión)", color: "#f59e0b", nota: "Conecta Supabase para persistencia" },
            { label: "IA Provider", estado: "Groq → Anthropic → OpenAI (fallback chain)", color: "#22c55e", nota: "Configurado" },
            { label: "LaTeX compiler", estado: "Generación .tex disponible", color: "#22c55e", nota: "Compilación vía Overleaf" },
            { label: "Pagos", estado: "Pendiente de integración", color: "#475569", nota: "QR manual / Stripe próximamente" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #1e293b" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 12, color: "#64748b", marginLeft: 10 }}>{item.estado}</span>
              </div>
              <span style={{ fontSize: 11, color: "#475569" }}>{item.nota}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
