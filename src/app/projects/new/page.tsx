"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
}

type Step =
  | "loading"
  | "elegir-tipo"      // ¿Tienes tema?
  | "con-tema"         // Input tema propio
  | "sin-tema"         // 3 inputs para sugerir
  | "generando"        // IA generando sugerencias
  | "eligiendo"        // Mostrar sugerencias, elegir
  | "creando";         // Creando/redirigiendo

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");
  const [servicioId, setServicioId] = useState("");

  // Con tema
  const [temaPropio, setTemaPropio] = useState("");

  // Sin tema
  const [programa, setPrograma] = useState("");
  const [materias, setMaterias] = useState("");
  const [entorno, setEntorno] = useState("");

  // Resultado IA
  const [sugerenciasTexto, setSugerenciasTexto] = useState("");
  const [temaElegido, setTemaElegido] = useState("");
  const [proyectoTempId, setProyectoTempId] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const [meRes, svcRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/services"),
        ]);
        const meData = await meRes.json();
        if (!meData.user) { router.replace("/login"); return; }

        if (svcRes.ok) {
          const svcData = await svcRes.json();
          const svcs: Servicio[] = svcData.servicios ?? [];
          const mono = svcs.find(s => s.nombre.toLowerCase().includes("monograf"));
          if (mono) setServicioId(mono.id);
          else if (svcs.length > 0) setServicioId(svcs[0].id);
        }
        setStep("elegir-tipo");
      } catch {
        router.replace("/login");
      }
    }
    init();
  }, [router]);

  // Obtiene servicioId; si no se cargó al montar, lo reintenta aquí.
  async function resolverServicioId(): Promise<string> {
    if (servicioId) return servicioId;
    const res = await fetch("/api/services");
    if (!res.ok) return "";
    const data = await res.json();
    const svcs: Servicio[] = data.servicios ?? [];
    const mono = svcs.find(s => s.nombre.toLowerCase().includes("monograf"));
    const sid = mono?.id ?? svcs[0]?.id ?? "";
    if (sid) setServicioId(sid);
    return sid;
  }

  async function startConTema() {
    if (!temaPropio.trim()) { setError("Escribe el tema de investigación antes de continuar."); return; }
    setError("");
    setStep("creando");
    try {
      const sid = await resolverServicioId();
      if (!sid) throw new Error("No hay servicios configurados. Avisa al administrador.");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicio_id: sid, tema_aprobado: temaPropio.trim(), titulo_provisional: temaPropio.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/projects/${data.proyecto.id}/workspace`);
    } catch (e) {
      setError((e as Error).message);
      setStep("con-tema");
    }
  }

  async function startSinTema() {
    if (!programa.trim()) { setError("Completa el campo Programa / Posgrado."); return; }
    setError("");
    setStep("creando");

    let proyId: string;
    try {
      const sid = await resolverServicioId();
      if (!sid) throw new Error("No hay servicios configurados. Avisa al administrador.");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicio_id: sid, tema_aprobado: "(Por definir)", titulo_provisional: `Proyecto — ${programa}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      proyId = data.proyecto.id;
      setProyectoTempId(proyId);
    } catch (e) {
      setError((e as Error).message);
      setStep("sin-tema");
      return;
    }

    setStep("generando");
    const ctx = [
      `Programa / Posgrado: ${programa}`,
      materias ? `Materias destacadas: ${materias}` : null,
      entorno ? `Entorno laboral / institución: ${entorno}` : null,
      "Por favor, sugiere 3 temas de investigación viables y concretos para una monografía.",
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/projects/generate-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyecto_id: proyId, fase_numero: 0, mensaje_usuario: ctx }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSugerenciasTexto(data.contenido);
      setStep("eligiendo");
    } catch (e) {
      setError((e as Error).message);
      router.push(`/projects/${proyId}/workspace`);
    }
  }

  async function confirmarTema() {
    if (!temaElegido.trim() || !proyectoTempId) { setError("Escribe el tema elegido."); return; }
    setError("");
    setStep("creando");
    try {
      const res = await fetch(`/api/projects/${proyectoTempId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema_aprobado: temaElegido.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/projects/${proyectoTempId}/workspace`);
    } catch (e) {
      setError((e as Error).message);
      setStep("eligiendo");
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (step === "loading" || step === "creando") {
    return (
      <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <div style={{ color: "#64748b", fontSize: 14 }}>Preparando...</div>
      </div>
    );
  }

  if (step === "generando") {
    return (
      <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🤖</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>Generando sugerencias de tema…</div>
        <div style={{ color: "#64748b", fontSize: 14 }}>La IA está analizando tu contexto académico. Puede tardar 20-40 segundos.</div>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  // ── Shell común ───────────────────────────────────────────────────────────

  return (
    <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>

      <div style={{ width: "100%", maxWidth: 560 }}>

        {/* Back */}
        <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, marginBottom: 24 }}>
          ← Volver al dashboard
        </a>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171", display: "flex", justifyContent: "space-between" }}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontWeight: 700 }}>×</button>
          </div>
        )}

        {/* ── ELEGIR TIPO ────────────────────────────────────────────────────── */}
        {step === "elegir-tipo" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Nuevo proyecto
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>¿Tienes un tema de investigación?</h1>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                Si ya tienes tu tema definido, ve directo al trabajo. Si no, la IA te sugerirá 3 opciones viables según tu contexto.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={() => setStep("con-tema")}
                style={{
                  padding: "20px 16px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                  background: "rgba(34,197,94,0.08)", border: "1.5px solid rgba(34,197,94,0.3)",
                  color: "#e2e8f0", transition: "all 0.15s",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,197,94,0.6)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,197,94,0.3)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>Sí, tengo mi tema</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Ingreso el título y voy directo al trabajo</div>
              </button>

              <button
                onClick={() => setStep("sin-tema")}
                style={{
                  padding: "20px 16px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                  background: "rgba(6,182,212,0.06)", border: "1.5px solid rgba(6,182,212,0.25)",
                  color: "#e2e8f0", transition: "all 0.15s",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.5)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.25)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>No, necesito ayuda</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>La IA me propone 3 temas viables</div>
              </button>
            </div>
          </div>
        )}

        {/* ── CON TEMA PROPIO ─────────────────────────────────────────────────── */}
        {step === "con-tema" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button onClick={() => setStep("elegir-tipo")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: 13 }}>← Atrás</button>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Tengo mi tema ✅
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Ingresa tu tema de investigación</h2>
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                Escribe el título o tema con el mayor detalle posible. La IA lo usará para generar cada capítulo con coherencia.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Tema / Título de investigación *</label>
                <textarea
                  className="input-dark"
                  value={temaPropio}
                  onChange={e => setTemaPropio(e.target.value)}
                  rows={3}
                  placeholder="Ej: Análisis del impacto del microcrédito en el sector rural boliviano 2019-2024"
                  style={{ resize: "vertical" }}
                />
              </div>

              <button
                onClick={startConTema}
                disabled={!temaPropio.trim()}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: !temaPropio.trim() ? 0.5 : 1 }}
              >
                Ir a la mesa de trabajo →
              </button>
            </div>
          </div>
        )}

        {/* ── SIN TEMA ─────────────────────────────────────────────────────────── */}
        {step === "sin-tema" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button onClick={() => setStep("elegir-tipo")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: 13 }}>← Atrás</button>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Sugerencias con IA 🤖
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Cuéntanos tu contexto</h2>
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                Con esta información, la IA generará 3 temas viables, concretos y relevantes para tu carrera.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Programa / Posgrado / Carrera *</label>
                <input
                  className="input-dark"
                  value={programa}
                  onChange={e => setPrograma(e.target.value)}
                  placeholder="Ej: Diplomado en Gestión Empresarial y Finanzas"
                />
              </div>

              <div>
                <label className="label">Materias destacadas del programa <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(opcional)</span></label>
                <textarea
                  className="input-dark"
                  value={materias}
                  onChange={e => setMaterias(e.target.value)}
                  rows={3}
                  placeholder={"Ej:\nFinanzas corporativas\nMarketing digital\nGestión de proyectos"}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label className="label">Entorno laboral o sector de interés <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(opcional)</span></label>
                <input
                  className="input-dark"
                  value={entorno}
                  onChange={e => setEntorno(e.target.value)}
                  placeholder="Ej: Banco BISA · sector agroindustrial · empresa de tecnología"
                />
              </div>

              <button
                onClick={startSinTema}
                disabled={!programa.trim()}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: !programa.trim() ? 0.5 : 1 }}
              >
                🤖 Generar 3 propuestas de tema
              </button>
            </div>
          </div>
        )}

        {/* ── ELIGIENDO TEMA ──────────────────────────────────────────────────── */}
        {step === "eligiendo" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Sugerencias de tema IA
              </div>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#cbd5e1", lineHeight: 1.9, maxHeight: 340, overflowY: "auto", padding: "4px 0" }}>
                {sugerenciasTexto}
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <label className="label">¿Cuál tema elegiste? Escríbelo aquí *</label>
              <textarea
                className="input-dark"
                value={temaElegido}
                onChange={e => setTemaElegido(e.target.value)}
                rows={3}
                placeholder="Copia o escribe el tema que seleccionaste de las propuestas de arriba..."
                style={{ resize: "vertical", marginBottom: 16 }}
              />
              <button
                onClick={confirmarTema}
                disabled={!temaElegido.trim()}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: !temaElegido.trim() ? 0.5 : 1 }}
              >
                Confirmar tema e ir a la mesa de trabajo →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
