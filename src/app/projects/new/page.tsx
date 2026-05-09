"use client";

import { useEffect, useRef, useState } from "react";
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

type Step =
  | "loading"
  | "seleccionar-universidad"
  | "elegir-tipo"
  | "creando";

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [tipoProyectoId, setTipoProyectoId] = useState("tipo-monografia");

  // Universidad
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [universidadId, setUniversidadId] = useState("");

  // Formulario única ruta de creación
  const [tema, setTema] = useState("");
  const [programa, setPrograma] = useState("");
  const [materias, setMaterias] = useState("");
  const [entorno, setEntorno] = useState("");

  const createInFlightRef = useRef(false);

  useEffect(() => {
    async function init() {
      try {
        const [meRes, svcRes, univRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/services"),
          fetch("/api/admin/universities"),
        ]);
        const meData = await meRes.json();
        if (!meData.user) {
          router.replace("/login");
          return;
        }

        // Autocompletar datos para facilitar pruebas
        const u = meData.user;
        const isTestUser =
          u.role === "admin" ||
          (u.email &&
            (u.email.includes("demo") ||
              u.email.includes("test") ||
              u.email.includes("lmiguellz"))) ||
          process.env.NODE_ENV === "development" ||
          (typeof window !== "undefined" &&
            window.location.hostname === "localhost");

        if (isTestUser) {
          setTema(
            "Análisis del impacto de la inteligencia artificial en la educación superior boliviana 2024"
          );
          setPrograma("Diplomado en Educación Superior Tecnológica");
          setMaterias(
            "Tecnologías Educativas\nPedagogía Moderna\nEvaluación por Competencias"
          );
          setEntorno(
            "Universidad Mayor de San Andrés, Facultad de Humanidades"
          );
        }

        if (svcRes.ok) {
          const svcData = await svcRes.json();
          const svcs: Servicio[] = svcData.servicios ?? [];
          const mono = svcs.find((s) =>
            s.nombre.toLowerCase().includes("monograf")
          );
          if (mono) setServicioId(mono.id);
          else if (svcs.length > 0) setServicioId(svcs[0].id);
        }

        if (univRes.ok) {
          const univData: Universidad[] = await univRes.json();
          setUniversidades(univData.filter((u) => u.is_active));
        }

        const tipoRes = await fetch("/api/admin/project-types");
        if (tipoRes.ok) {
          const tipoData = await tipoRes.json();
          const tipos = (tipoData.tipos ?? []).filter(
            (t: TipoProyecto) => t.activo !== false
          );
          if (
            tipos.some((t: TipoProyecto) => t.id === "tipo-monografia")
          )
            setTipoProyectoId("tipo-monografia");
          else if (tipos.some((t: TipoProyecto) => t.id === "tipo-tesis"))
            setTipoProyectoId("tipo-tesis");
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
    const mono = svcs.find((s) =>
      s.nombre.toLowerCase().includes("monograf")
    );
    const sid = mono?.id ?? svcs[0]?.id ?? "";
    if (sid) setServicioId(sid);
    return sid;
  }

  async function crearProyectoConContexto(
    contexto: Record<string, string>
  ) {
    if (createInFlightRef.current) {
      throw new Error("Ya estamos creando tu proyecto. Espera un momento.");
    }
    createInFlightRef.current = true;

    const sid = await resolverServicioId();
    try {
      if (!sid)
        throw new Error(
          "No hay servicios configurados. Avisa al administrador."
        );
      const temaBase = contexto.tema?.trim() || "(Por definir)";
      const payload = {
        servicio_id: sid,
        tipo_proyecto_id: tipoProyectoId,
        universidad_id: universidadId || undefined,
        modalidad_creacion: "directa",
        tema_aprobado: temaBase,
        titulo_provisional: temaBase,
        academic_context: { contexto_inicial: contexto },
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.proyecto.id as string;
    } finally {
      createInFlightRef.current = false;
    }
  }

  async function handleCrearProyecto() {
    if (!programa.trim()) {
      setError("El programa/diplomado es requerido.");
      return;
    }
    if (!materias.trim()) {
      setError("Los módulos/materias son requeridos.");
      return;
    }
    setError("");
    setStep("creando");

    try {
      const contexto = {
        tema: tema.trim(),
        programa: programa.trim(),
        materias: materias.trim(),
        entorno: entorno.trim(),
      };
      const proyectoId = await crearProyectoConContexto(contexto);
      router.push(`/projects/${proyectoId}/workspace`);
    } catch (err) {
      setError((err as Error).message || "Error al crear el proyecto.");
      setStep("elegir-tipo");
    }
  }

  // ── Loading / Creando ────────────────────────────────────────────────────────────

  if (step === "loading" || step === "creando") {
    return (
      <div
        className="gradient-bg"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <div style={{ color: "var(--fg-muted)", fontSize: 14 }}>
          Preparando...
        </div>
      </div>
    );
  }

  return (
    <div
      className="gradient-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 600 }}>
        <a
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--fg-muted)",
            textDecoration: "none",
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          ← Volver al dashboard
        </a>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 8,
              fontSize: 13,
              color: "#f87171",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* ── PASO 1: SELECCIONAR UNIVERSIDAD ────────────────────────────────────────── */}
        {step === "seleccionar-universidad" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Paso 1 de 2 — Universidad
              </div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                ¿En qué universidad estudias?
              </h1>
              <p
                style={{
                  color: "var(--fg-muted)",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                El formato LaTeX del documento final se adaptará automáticamente
                a los requerimientos de tu institución.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {universidades.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setUniversidadId(u.id)}
                  style={{
                    padding: "14px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    background:
                      universidadId === u.id
                        ? "rgba(37,99,235,0.12)"
                        : "rgba(255,255,255,0.84)",
                    border:
                      universidadId === u.id
                        ? "2px solid var(--accent)"
                        : "1.5px solid var(--border)",
                    color: "var(--fg-primary)",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color:
                        universidadId === u.id
                          ? "var(--accent)"
                          : "var(--fg-muted)",
                      marginBottom: 4,
                    }}
                  >
                    {universidadId === u.id ? "✓ " : ""}Seleccionada
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {u.name}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!universidadId) {
                  setError(
                    "Selecciona tu universidad para continuar."
                  );
                  return;
                }
                setError("");
                setStep("elegir-tipo");
              }}
              className="btn-cyan"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
              }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 2: FORMULARIO ÚNICO DE CREACIÓN ────────────────────────────────────── */}
        {step === "elegir-tipo" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button
              onClick={() => setStep("seleccionar-universidad")}
              style={{
                background: "none",
                border: "none",
                color: "var(--fg-muted)",
                cursor: "pointer",
                marginBottom: 20,
                padding: 0,
                fontSize: 13,
              }}
            >
              ← Atrás
            </button>
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Paso 2 de 2 — Datos iniciales
              </div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Cuéntanos sobre tu investigación
              </h1>
              <p
                style={{
                  color: "var(--fg-muted)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Completa los datos que tengas disponibles. Usaremos esta
                información para generar cada capítulo con coherencia y
                relevancia académica.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">
                  Tema / Título de investigación{" "}
                  <span
                    style={{
                      color: "var(--fg-secondary)",
                      fontWeight: 400,
                      textTransform: "none",
                    }}
                  >
                    (opcional)
                  </span>
                </label>
                <textarea
                  className="input-dark"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  rows={3}
                  placeholder="Ej: Análisis del impacto del microcrédito en el sector rural boliviano 2019-2024"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label className="label">
                  Diplomado / Curso / Programa *
                </label>
                <input
                  className="input-dark"
                  value={programa}
                  onChange={(e) => setPrograma(e.target.value)}
                  placeholder="Ej: Diplomado en Educación Superior"
                />
              </div>

              <div>
                <label className="label">
                  Módulos o materias que llevaste *
                </label>
                <textarea
                  className="input-dark"
                  value={materias}
                  onChange={(e) => setMaterias(e.target.value)}
                  rows={3}
                  placeholder={
                    "Ej:\nMetodología de la investigación\nTecnologías educativas\nEvaluación por competencias"
                  }
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label className="label">
                  Lugar de trabajo o contexto de interés{" "}
                  <span
                    style={{
                      color: "var(--fg-secondary)",
                      fontWeight: 400,
                      textTransform: "none",
                    }}
                  >
                    (opcional)
                  </span>
                </label>
                <input
                  className="input-dark"
                  value={entorno}
                  onChange={(e) => setEntorno(e.target.value)}
                  placeholder="Ej: universidad, colegio, empresa, sector o ciudad"
                />
              </div>

              <button
                onClick={handleCrearProyecto}
                disabled={!programa.trim() || !materias.trim()}
                className="btn-cyan"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "12px",
                  opacity: !programa.trim() || !materias.trim() ? 0.5 : 1,
                }}
              >
                Crear proyecto y entrar →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
