"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface Universidad {
  id: string;
  name: string;
  modalities: string[];
  is_active: boolean;
}

interface TipoProyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  icon?: string;
  activo: boolean;
  fases_count?: number;
}

interface RutaAcademica {
  id: string;
  titulo: string;
  idea_central: string;
  problema: string;
  objetivo_general: string;
  alcance: string;
  materiales_prioritarios: string[];
  justificacion: string;
}

type Step =
  | "loading"
  | "seleccionar-universidad"
  | "elegir-tipo"
  | "con-tema"
  | "sin-tema"
  | "generando"
  | "eligiendo"
  | "creando";


export default function NuevoProyectoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [tiposProyecto, setTiposProyecto] = useState<TipoProyecto[]>([]);
  const [tipoProyectoId, setTipoProyectoId] = useState("tipo-monografia");

  // Universidad
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [universidadId, setUniversidadId] = useState("");

  // Con tema
  const [temaPropio, setTemaPropio] = useState("");

  // Sin tema
  const [programa, setPrograma] = useState("");
  const [materias, setMaterias] = useState("");
  const [entorno, setEntorno] = useState("");

  // Resultado IA
  const [temaElegido, setTemaElegido] = useState("");
  const [proyectoTempId, setProyectoTempId] = useState("");
  const [rutas, setRutas] = useState<RutaAcademica[]>([]);
  const [contextoRuta, setContextoRuta] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      try {
        const [meRes, svcRes, univRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/services"),
          fetch("/api/admin/universities"),
        ]);
        const meData = await meRes.json();
        if (!meData.user) { router.replace("/login"); return; }

        // Autocompletar datos para facilitar pruebas
        const u = meData.user;
        const isTestUser = 
          u.role === "admin" || 
          (u.email && (u.email.includes("demo") || u.email.includes("test") || u.email.includes("lmiguellz"))) ||
          process.env.NODE_ENV === "development" ||
          (typeof window !== "undefined" && window.location.hostname === "localhost");

        if (isTestUser) {
          setTemaPropio("Análisis del impacto de la inteligencia artificial en la educación superior boliviana 2024");
          setPrograma("Diplomado en Educación Superior Tecnológica");
          setMaterias("Tecnologías Educativas\nPedagogía Moderna\nEvaluación por Competencias");
          setEntorno("Universidad Mayor de San Andrés, Facultad de Humanidades");
          setTemaElegido("Estrategias de retención estudiantil basadas en machine learning en universidades privadas");
        }

        if (svcRes.ok) {
          const svcData = await svcRes.json();
          const svcs: Servicio[] = svcData.servicios ?? [];
          const mono = svcs.find(s => s.nombre.toLowerCase().includes("monograf"));
          if (mono) setServicioId(mono.id);
          else if (svcs.length > 0) setServicioId(svcs[0].id);
        }

        if (univRes.ok) {
          const univData: Universidad[] = await univRes.json();
          setUniversidades(univData.filter(u => u.is_active));
        }

        const tipoRes = await fetch("/api/admin/project-types");
        if (tipoRes.ok) {
          const tipoData = await tipoRes.json();
          const tipos = (tipoData.tipos ?? []).filter((t: TipoProyecto) => t.activo !== false);
          setTiposProyecto(tipos);
          if (tipos.some((t: TipoProyecto) => t.id === "tipo-monografia")) setTipoProyectoId("tipo-monografia");
          else if (tipos.some((t: TipoProyecto) => t.id === "tipo-tesis")) setTipoProyectoId("tipo-tesis");
          else if (tipos[0]?.id) setTipoProyectoId(tipos[0].id);
        }

        setStep("seleccionar-universidad");
      } catch {
        router.replace("/login");
      }
    }
    init();
  }, [router]);

  async function resolverServicioId(): Promise<string> {
    if (tipoProyectoId === "tipo-tesis") return "tesis-001";
    if (tipoProyectoId === "tipo-monografia") return "mono-001";
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

  async function crearProyectoConContexto(contexto: Record<string, string>) {
    const sid = await resolverServicioId();
    if (!sid) throw new Error("No hay servicios configurados. Avisa al administrador.");
    const temaBase = contexto.tema?.trim() || "(Por definir)";
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        servicio_id: sid,
        tipo_proyecto_id: tipoProyectoId,
        universidad_id: universidadId || undefined,
        modalidad_creacion: "directa",
        tema_aprobado: temaBase,
        titulo_provisional: temaBase,
        academic_context: { contexto_inicial: contexto },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProyectoTempId(data.proyecto.id);
    setContextoRuta(contexto);
    return data.proyecto.id as string;
  }

  async function generarRutas(proyId: string, contexto: Record<string, string>) {
    const res = await fetch("/api/projects/route-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proyecto_id: proyId, contexto }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setRutas(data.rutas ?? []);
    setStep("eligiendo");
  }

  async function startConTema() {
    if (!temaPropio.trim()) { setError("Escribe el tema de investigación antes de continuar."); return; }
    setError("");
    setStep("generando");
    const contexto = {
      tema: temaPropio.trim(),
      programa: programa.trim(),
      modulos: materias.trim(),
      contexto_laboral: entorno.trim(),
    };
    try {
      const proyId = await crearProyectoConContexto(contexto);
      await generarRutas(proyId, contexto);
    } catch (e) {
      setError((e as Error).message);
      setStep("con-tema");
    }
  }

  async function startSinTema() {
    if (!programa.trim()) { setError("Completa el campo Programa / Posgrado."); return; }
    setError("");
    setStep("generando");
    const contexto = {
      tema: "",
      programa: programa.trim(),
      modulos: materias.trim(),
      contexto_laboral: entorno.trim(),
    };
    try {
      const proyId = await crearProyectoConContexto(contexto);
      await generarRutas(proyId, contexto);
    } catch (e) {
      setError((e as Error).message);
      setStep("sin-tema");
    }
  }

  async function regenerarRutas() {
    if (!proyectoTempId) return;
    setError("");
    setStep("generando");
    try {
      await generarRutas(proyectoTempId, contextoRuta);
    } catch (e) {
      setError((e as Error).message);
      setStep("eligiendo");
    }
  }

  async function seleccionarRuta(ruta: RutaAcademica) {
    if (!proyectoTempId) { setError("No se encontró el proyecto temporal."); return; }
    setError("");
    setStep("creando");
    try {
      const res = await fetch("/api/projects/select-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyecto_id: proyectoTempId, ruta_id: ruta.id, ruta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/projects/${proyectoTempId}/workspace`);
    } catch (e) {
      setError((e as Error).message);
      setStep("eligiendo");
    }
  }

  async function confirmarTema() {
    if (!temaElegido.trim() || !proyectoTempId) { setError("Escribe el tema elegido."); return; }
    await seleccionarRuta({
      id: "ruta-personalizada",
      titulo: temaElegido.trim(),
      idea_central: temaElegido.trim(),
      problema: "",
      objetivo_general: "",
      alcance: "",
      materiales_prioritarios: [],
      justificacion: "Ruta escrita manualmente por el estudiante.",
    });
  }

  // ── Loading / Creando ────────────────────────────────────────────────────

  if (step === "loading" || step === "creando") {
    return (
      <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <div style={{ color: "var(--fg-muted)", fontSize: 14 }}>Preparando...</div>
      </div>
    );
  }

  if (step === "generando") {
    return (
      <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🤖</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg-primary)" }}>Generando sugerencias de tema…</div>
        <div style={{ color: "var(--fg-muted)", fontSize: 14 }}>La IA está analizando tu contexto académico. Puede tardar 20-40 segundos.</div>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 600 }}>

        <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-muted)", textDecoration: "none", fontSize: 13, marginBottom: 24 }}>
          ← Volver al dashboard
        </a>

        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171", display: "flex", justifyContent: "space-between" }}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontWeight: 700 }}>×</button>
          </div>
        )}

        {/* ── PASO 1: SELECCIONAR UNIVERSIDAD ─────────────────────────────────── */}
        {step === "seleccionar-universidad" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Paso 1 de 2 — Universidad
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>¿En qué universidad estudias?</h1>
              <p style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.6 }}>
                El formato LaTeX del documento final se adaptará automáticamente a los requerimientos de tu institución.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {universidades.map(u => (
                <button
                  key={u.id}
                  onClick={() => setUniversidadId(u.id)}
                  style={{
                    padding: "14px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    background: universidadId === u.id ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.84)",
                    border: universidadId === u.id ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                    color: "var(--fg-primary)", transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: universidadId === u.id ? "var(--accent)" : "var(--fg-muted)", marginBottom: 4 }}>
                    {universidadId === u.id ? "✓ " : ""}Seleccionada
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{u.name}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => { if (!universidadId) { setError("Selecciona tu universidad para continuar."); return; } setError(""); setStep("elegir-tipo"); }}
              className="btn-cyan"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 3: ELEGIR TIPO ──────────────────────────────────────────────── */}
        {step === "elegir-tipo" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button onClick={() => setStep("seleccionar-universidad")} style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: 13 }}>← Atrás</button>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Paso 2 de 2 — Datos iniciales
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>¿Tienes un tema de investigación?</h1>
              <p style={{ color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.6 }}>
                Si ya tienes tema, lo mejoramos. Si no, la IA propone rutas viables según tu programa, módulos y contexto.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                onClick={() => setStep("con-tema")}
                style={{
                  padding: "20px 16px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                  background: "rgba(34,197,94,0.08)", border: "1.5px solid rgba(34,197,94,0.3)",
                  color: "var(--fg-primary)", transition: "all 0.15s",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,197,94,0.6)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(34,197,94,0.3)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>Sí, tengo mi tema</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>Ingreso el título y voy directo al trabajo</div>
              </button>

              <button
                onClick={() => setStep("sin-tema")}
                style={{
                  padding: "20px 16px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                  background: "rgba(37,99,235,0.06)", border: "1.5px solid rgba(37,99,235,0.25)",
                  color: "var(--fg-primary)", transition: "all 0.15s",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.5)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(37,99,235,0.25)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>No, necesito ayuda</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>La IA me propone 3 temas viables</div>
              </button>
            </div>
          </div>
        )}

        {/* ── CON TEMA PROPIO ──────────────────────────────────────────────────── */}
        {step === "con-tema" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button onClick={() => setStep("elegir-tipo")} style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: 13 }}>← Atrás</button>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Tengo mi tema ✅
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Ingresa tu tema de investigación</h2>
              <p style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.6 }}>
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

              <div>
                <label className="label">Diplomado / curso / programa</label>
                <input
                  className="input-dark"
                  value={programa}
                  onChange={e => setPrograma(e.target.value)}
                  placeholder="Ej: Diplomado en Educación Superior"
                />
              </div>

              <div>
                <label className="label">Módulos o materias que llevaste</label>
                <textarea
                  className="input-dark"
                  value={materias}
                  onChange={e => setMaterias(e.target.value)}
                  rows={3}
                  placeholder={"Ej:\nMetodología de la investigación\nTecnologías educativas\nEvaluación por competencias"}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label className="label">Lugar de trabajo o contexto de interés</label>
                <input
                  className="input-dark"
                  value={entorno}
                  onChange={e => setEntorno(e.target.value)}
                  placeholder="Ej: universidad, colegio, empresa, sector o ciudad"
                />
              </div>

              <button
                onClick={startConTema}
                disabled={!temaPropio.trim()}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: !temaPropio.trim() ? 0.5 : 1 }}
              >
                Generar rutas posibles →
              </button>
            </div>
          </div>
        )}

        {/* ── SIN TEMA ─────────────────────────────────────────────────────────── */}
        {step === "sin-tema" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button onClick={() => setStep("elegir-tipo")} style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: 13 }}>← Atrás</button>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Sugerencias con IA 🤖
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Cuéntanos tu contexto</h2>
              <p style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.6 }}>
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
                <label className="label">Materias destacadas del programa <span style={{ color: "var(--fg-secondary)", fontWeight: 400, textTransform: "none" }}>(opcional)</span></label>
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
                <label className="label">Entorno laboral o sector de interés <span style={{ color: "var(--fg-secondary)", fontWeight: 400, textTransform: "none" }}>(opcional)</span></label>
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
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Rutas academicas propuestas
              </div>
              <p style={{ margin: "0 0 16px", color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.6 }}>
                Elige la ruta que mejor encaje. Esto se guarda como contrato académico para mantener coherencia en todas las fases internas.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {rutas.map((ruta, index) => (
                  <button
                    key={ruta.id}
                    onClick={() => seleccionarRuta(ruta)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "16px",
                      borderRadius: 10,
                      border: "1.5px solid rgba(37,99,235,0.18)",
                      background: "rgba(255,255,255,0.84)",
                      color: "var(--fg-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", marginBottom: 6 }}>
                      Opción {index + 1}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, lineHeight: 1.35 }}>{ruta.titulo}</div>
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.55, marginBottom: 8 }}>{ruta.idea_central}</div>
                    {ruta.objetivo_general && (
                      <div style={{ fontSize: 12, lineHeight: 1.55 }}>
                        <strong>Objetivo:</strong> {ruta.objetivo_general}
                      </div>
                    )}
                    {ruta.justificacion && (
                      <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.55, marginTop: 6 }}>
                        {ruta.justificacion}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={regenerarRutas} className="btn-ghost" style={{ marginTop: 14, width: "100%", justifyContent: "center", padding: "10px" }}>
                Ver otras 3 opciones
              </button>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <label className="label">O escribe una ruta propia</label>
              <textarea
                className="input-dark"
                value={temaElegido}
                onChange={e => setTemaElegido(e.target.value)}
                rows={3}
                placeholder="Escribe el título o tema exacto que quieres usar si ninguna opción te convence..."
                style={{ resize: "vertical", marginBottom: 16 }}
              />
              <button
                onClick={confirmarTema}
                disabled={!temaElegido.trim()}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: !temaElegido.trim() ? 0.5 : 1 }}
              >
                Usar esta ruta e ir a la mesa de trabajo →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
