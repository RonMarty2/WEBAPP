"use client";

import { useState, useEffect } from "react";

interface Proyecto {
  id: string;
  usuario_id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  completado: boolean;
  created_at: string;
  updated_at: string;
  servicios: { id: string; nombre: string } | null;
}

const FASE_LABELS = ["Fase 0", "Cap. I", "Cap. II", "Caps. III-V", "Revisión", "Final"];

function FaseBadge({ fase }: { fase: number }) {
  const colors: Record<number, { bg: string; color: string }> = {
    0: { bg: "rgba(71,85,105,0.3)", color: "#94a3b8" },
    1: { bg: "rgba(6,182,212,0.12)", color: "#67e8f9" },
    2: { bg: "rgba(6,182,212,0.18)", color: "#06b6d4" },
    3: { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
    4: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
    5: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
  };
  const { bg, color } = colors[fase] ?? colors[0];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999, background: bg, color }}>
      {FASE_LABELS[fase] ?? `Fase ${fase}`}
    </span>
  );
}

export default function AdminProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroFase, setFiltroFase] = useState<number | "">("");
  const [descargando, setDescargando] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/proyectos")
      .then(r => r.json())
      .then(d => { setProyectos(d.proyectos ?? []); setLoading(false); })
      .catch(() => { setError("Error al cargar proyectos"); setLoading(false); });
  }, []);

  async function descargarLatex(proy: Proyecto) {
    setDescargando(proy.id);
    try {
      const res = await fetch(`/api/admin/proyectos/${proy.id}/latex`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1]
        ?? `proyecto_${proy.id.slice(0, 8)}.tex`;
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDescargando(null);
    }
  }

  const proyectosFiltrados = proyectos.filter(p => {
    const titulo = (p.tema_aprobado || p.titulo_provisional || "").toLowerCase();
    const matchBusqueda = !busqueda || titulo.includes(busqueda.toLowerCase()) || p.usuario_id.includes(busqueda);
    const matchFase = filtroFase === "" || p.estado_fase === filtroFase;
    return matchBusqueda && matchFase;
  });

  const stats = {
    total: proyectos.length,
    completados: proyectos.filter(p => p.completado).length,
    enProceso: proyectos.filter(p => !p.completado).length,
    phaseDist: FASE_LABELS.map((_, i) => proyectos.filter(p => p.estado_fase === i).length),
  };

  return (
    <div className="fade-in">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>📁 Proyectos</h1>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>
          Todos los proyectos del sistema. Descarga LaTeX de cualquiera con un clic.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total proyectos", value: stats.total, color: "#06b6d4" },
          { label: "En proceso", value: stats.enProceso, color: "#f59e0b" },
          { label: "Completados", value: stats.completados, color: "#22c55e" },
          { label: "Fases avanzadas (≥3)", value: proyectos.filter(p => p.estado_fase >= 3).length, color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          className="input-dark"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por tema o usuario ID…"
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", fontSize: 13 }}
        />
        <select
          className="input-dark"
          value={filtroFase}
          onChange={e => setFiltroFase(e.target.value === "" ? "" : Number(e.target.value))}
          style={{ width: 160, padding: "8px 12px", fontSize: 13 }}
        >
          <option value="">Todas las fases</option>
          {FASE_LABELS.map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="card shimmer" style={{ height: 64 }} />)}
        </div>
      ) : proyectosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", borderStyle: "dashed", borderColor: "#334155" }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📁</div>
          <div style={{ color: "#475569", fontSize: 14 }}>No hay proyectos que coincidan con los filtros.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px auto", gap: 12, padding: "6px 16px", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <span>Tema / Proyecto</span>
            <span>Servicio</span>
            <span>Fase</span>
            <span>Fecha</span>
            <span>Acciones</span>
          </div>

          {proyectosFiltrados.map(p => {
            const titulo = p.tema_aprobado || p.titulo_provisional || "Sin título";
            const esDesc = descargando === p.id;
            return (
              <div
                key={p.id}
                className="card"
                style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px auto", gap: 12, alignItems: "center", padding: "12px 16px" }}
              >
                {/* Titulo */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {titulo}
                  </div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 2, fontFamily: "monospace" }}>
                    {p.usuario_id.slice(0, 12)}…
                  </div>
                </div>

                {/* Servicio */}
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {p.servicios?.nombre ?? "—"}
                </div>

                {/* Fase */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FaseBadge fase={p.estado_fase} />
                  {p.completado && <span className="badge badge-green" style={{ fontSize: 10 }}>✓</span>}
                </div>

                {/* Fecha */}
                <div style={{ fontSize: 11, color: "#334155", whiteSpace: "nowrap" }}>
                  {new Date(p.created_at).toLocaleDateString("es-BO", { day: "2-digit", month: "short" })}
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    href={`/projects/${p.id}/workspace`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: "5px 10px", textDecoration: "none", whiteSpace: "nowrap" }}
                  >
                    Ver →
                  </a>
                  <button
                    onClick={() => descargarLatex(p)}
                    disabled={esDesc}
                    className="btn-cyan"
                    style={{ fontSize: 11, padding: "5px 10px", whiteSpace: "nowrap", gap: 4 }}
                  >
                    {esDesc ? (
                      <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /><span>…</span></>
                    ) : (
                      "📄 .tex"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: "#334155" }}>
        {proyectosFiltrados.length} de {proyectos.length} proyectos
      </div>
    </div>
  );
}
