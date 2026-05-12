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
  | "seleccionar-variante-cap1"
  | "datos-completos"
  | "creando";

interface Cap1VariantePublica {
  id: string;
  nombre: string;
  descripcion: string;
  estructura_visible: string[];
  nota?: string;
}

interface ArchivoSubido {
  file: File;
  estado: "pendiente" | "subiendo" | "ok" | "error";
  error?: string;
}

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [tipoProyectoId, setTipoProyectoId] = useState("tipo-monografia");

  // Universidad
  const [universidades, setUniversidades] = useState<Universidad[]>([]);
  const [universidadId, setUniversidadId] = useState("");

  // Variantes de Cap. I disponibles para la universidad elegida
  const [cap1Variantes, setCap1Variantes] = useState<Cap1VariantePublica[]>([]);
  const [cap1VarianteId, setCap1VarianteId] = useState("");
  const [cargandoVariantes, setCargandoVariantes] = useState(false);

  // Datos del proyecto (un solo formulario)
  const [tema, setTema] = useState("");                       // opcional
  const [programa, setPrograma] = useState("");               // OBLIGATORIO
  const [materias, setMaterias] = useState("");               // OBLIGATORIO
  const [interesesYContexto, setInteresesYContexto] = useState(""); // opcional, combinado
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);

  const createInFlightRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Carga las variantes de Cap. I disponibles para la universidad actualmente
  // seleccionada. Si la universidad no tiene mapeo explícito el endpoint
  // devolverá solo la variante "clasico" (compatibilidad total).
  async function cargarVariantesYDecidirRuta() {
    if (!universidadId) {
      setError("Selecciona tu universidad para continuar.");
      return;
    }
    setError("");
    setCargandoVariantes(true);
    try {
      const res = await fetch(`/api/cap1-variants?universidad_id=${encodeURIComponent(universidadId)}`);
      const data = await res.json();
      const variantes: Cap1VariantePublica[] = data?.variantes ?? [];
      setCap1Variantes(variantes);

      if (variantes.length <= 1) {
        // Solo "clasico" disponible → saltamos el selector y guardamos default
        setCap1VarianteId(variantes[0]?.id ?? "clasico");
        setStep("datos-completos");
      } else {
        // Pre-seleccionamos la primera (clasico) y mostramos el selector
        setCap1VarianteId(variantes[0].id);
        setStep("seleccionar-variante-cap1");
      }
    } catch {
      // Si falla el endpoint, asumimos clasico y seguimos al paso de datos
      setCap1VarianteId("clasico");
      setStep("datos-completos");
    } finally {
      setCargandoVariantes(false);
    }
  }

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

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;
    const nuevos: ArchivoSubido[] = Array.from(files).map(f => ({ file: f, estado: "pendiente" }));
    setArchivos(prev => [...prev, ...nuevos]);
  }

  function quitarArchivo(idx: number) {
    setArchivos(prev => prev.filter((_, i) => i !== idx));
  }

  async function subirArchivosAlProyecto(proyectoId: string) {
    if (archivos.length === 0) return;
    for (let i = 0; i < archivos.length; i++) {
      const a = archivos[i];
      if (a.estado === "ok") continue;
      setArchivos(prev => prev.map((x, idx) => idx === i ? { ...x, estado: "subiendo" } : x));
      try {
        const fd = new FormData();
        fd.append("file", a.file);
        fd.append("proyecto_id", proyectoId);
        const res = await fetch("/api/projects/upload-document", { method: "POST", body: fd });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? `Error subiendo ${a.file.name}`);
        }
        setArchivos(prev => prev.map((x, idx) => idx === i ? { ...x, estado: "ok" } : x));
      } catch (e) {
        setArchivos(prev => prev.map((x, idx) => idx === i ? { ...x, estado: "error", error: (e as Error).message } : x));
      }
    }
  }

  async function crearProyectoYDirigirAlWorkspace() {
    if (!programa.trim()) { setError("El diplomado/curso/taller es obligatorio."); return; }
    if (!materias.trim()) { setError("Los módulos/temas/materias son obligatorios."); return; }

    if (createInFlightRef.current) return;
    createInFlightRef.current = true;
    setError("");
    setStep("creando");

    try {
      const sid = await resolverServicioId();
      if (!sid) throw new Error("No hay servicios configurados. Avisa al administrador.");

      const temaBase = tema.trim() || "(Por definir — Cap 0 propondrá temas)";
      const contexto = {
        tema: tema.trim(),
        programa: programa.trim(),
        modulos: materias.trim(),
        intereses_y_contexto: interesesYContexto.trim(),
      };

      const payload = {
        servicio_id: sid,
        tipo_proyecto_id: tipoProyectoId,
        universidad_id: universidadId || undefined,
        modalidad_creacion: "guiada",
        tema_aprobado: temaBase,
        titulo_provisional: temaBase,
        academic_context: {
          contexto_inicial: contexto,
          // Persistimos la variante elegida del Cap. I. Si no hay valor,
          // se resolverá como "clasico" en /api/projects/generate-phase.
          cap1_variante_id: cap1VarianteId || "clasico",
        },
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const proyId = data.proyecto.id as string;

      // Subir archivos si los hay
      if (archivos.length > 0) {
        await subirArchivosAlProyecto(proyId);
      }

      router.push(`/projects/${proyId}/workspace`);
    } catch (e) {
      setError((e as Error).message);
      setStep("datos-completos");
    } finally {
      createInFlightRef.current = false;
    }
  }

  // ── Loading / Creando ────────────────────────────────────────────────────

  if (step === "loading") {
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
        <div style={{ color: "var(--fg-muted)", fontSize: 14 }}>Preparando...</div>
      </div>
    );
  }

  if (step === "creando") {
    return (
      <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🚀</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg-primary)" }}>Creando tu proyecto…</div>
        <div style={{ color: "var(--fg-muted)", fontSize: 14, textAlign: "center", maxWidth: 360 }}>
          {archivos.length > 0
            ? `Subiendo ${archivos.length} archivo(s) y preparando tu mesa de trabajo. El Cap 0 generará propuestas automáticamente.`
            : "Preparando tu mesa de trabajo. El Cap 0 generará propuestas automáticamente."}
        </div>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 640 }}>

        <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--fg-muted)", textDecoration: "none", fontSize: 13, marginBottom: 24 }}>
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
              onClick={cargarVariantesYDecidirRuta}
              disabled={cargandoVariantes}
              className="btn-cyan"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
                opacity: cargandoVariantes ? 0.6 : 1,
              }}
            >
              {cargandoVariantes ? "Cargando..." : "Continuar →"}
            </button>
          </div>
        )}

        {/* ── PASO 1.5: SELECCIONAR VARIANTE DE CAP. I ───────────────────────────────── */}
        {step === "seleccionar-variante-cap1" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button
              onClick={() => setStep("seleccionar-universidad")}
              style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: 13 }}
            >
              ← Atrás
            </button>
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
                Formato del Capítulo I
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                ¿Qué formato pide tu diplomado?
              </h1>
              <p style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.6 }}>
                Algunas universidades tienen variantes del Capítulo I según el programa.
                Elige la que coincide con tu guía de tesis o monografía.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {cap1Variantes.map((v) => {
                const seleccionada = cap1VarianteId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setCap1VarianteId(v.id)}
                    style={{
                      padding: "16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      textAlign: "left",
                      background: seleccionada ? "rgba(37,99,235,0.10)" : "rgba(255,255,255,0.84)",
                      border: seleccionada ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                      color: "var(--fg-primary)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>
                        {seleccionada ? "✓ " : ""}{v.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: seleccionada ? "var(--accent)" : "var(--fg-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {seleccionada ? "Seleccionada" : "Elegir"}
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 10 }}>
                      {v.descripcion}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--fg-secondary)",
                        background: "rgba(0,0,0,0.03)",
                        padding: "8px 10px",
                        borderRadius: 6,
                        lineHeight: 1.6,
                        whiteSpace: "pre-line",
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "var(--fg-primary)", marginBottom: 4 }}>Estructura:</div>
                      {v.estructura_visible.join("\n")}
                    </div>
                    {v.nota && (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 11,
                          color: "#b45309",
                          background: "rgba(245,158,11,0.08)",
                          border: "1px solid rgba(245,158,11,0.25)",
                          padding: "8px 10px",
                          borderRadius: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        {v.nota}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (!cap1VarianteId) {
                  setError("Selecciona un formato para continuar.");
                  return;
                }
                setError("");
                setStep("datos-completos");
              }}
              className="btn-cyan"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO 2: DATOS COMPLETOS (UN SOLO FORMULARIO) ────────────────────── */}
        {step === "datos-completos" && (
          <div className="card fade-in" style={{ padding: 32 }}>
            <button
              onClick={() => setStep(cap1Variantes.length > 1 ? "seleccionar-variante-cap1" : "seleccionar-universidad")}
              style={{ background: "none", border: "none", color: "var(--fg-muted)", cursor: "pointer", marginBottom: 20, padding: 0, fontSize: 13 }}
            >← Atrás</button>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Paso 2 de 2 — Datos del proyecto
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Cuéntanos sobre tu trabajo</h1>
              <p style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.6 }}>
                Llena lo que tengas. Si no tienes tema, la IA propondrá 3-5 opciones viables. Si subes documentos, los usaremos como referencia.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* TEMA (opcional) */}
              <div>
                <label className="label">
                  Tema / Título de investigación{" "}
                  <span style={{ color: "var(--fg-secondary)", fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </label>
                <textarea
                  className="input-dark"
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  rows={2}
                  placeholder="Si ya tienes tema, escríbelo aquí. Si no, déjalo vacío y la IA propondrá."
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* DIPLOMADO (obligatorio) */}
              <div>
                <label className="label">
                  Diplomado / curso / taller / programa{" "}
                  <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
                </label>
                <input
                  className="input-dark"
                  value={programa}
                  onChange={e => setPrograma(e.target.value)}
                  placeholder="Ej: Diplomado en Educación Superior Tecnológica"
                />
              </div>

              {/* MÓDULOS (obligatorio) */}
              <div>
                <label className="label">
                  Módulos / temas / materias que llevaste{" "}
                  <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span>
                </label>
                <textarea
                  className="input-dark"
                  value={materias}
                  onChange={e => setMaterias(e.target.value)}
                  rows={4}
                  placeholder={"Lista los módulos/temas, uno por línea. Ej:\nMetodología de la investigación\nTecnologías educativas\nEvaluación por competencias"}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* INTERESES + LUGAR DE TRABAJO (combinado, opcional) */}
              <div>
                <label className="label">
                  Intereses personales y lugar de trabajo / contexto{" "}
                  <span style={{ color: "var(--fg-secondary)", fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </label>
                <textarea
                  className="input-dark"
                  value={interesesYContexto}
                  onChange={e => setInteresesYContexto(e.target.value)}
                  rows={3}
                  placeholder={"Cuéntanos en qué trabajas, sectores o áreas que te interesan, ciudad donde trabajas, etc.\nEj: Trabajo en la Universidad Mayor de San Andrés, Facultad de Humanidades. Me interesa la innovación pedagógica y el uso de tecnología en el aula."}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* DOCUMENTOS (opcional) */}
              <div>
                <label className="label">
                  Documentos de referencia{" "}
                  <span style={{ color: "var(--fg-secondary)", fontWeight: 400, textTransform: "none" }}>(opcional · PDF o TXT, máx. 10MB c/u)</span>
                </label>
                <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8, lineHeight: 1.5 }}>
                  Sube material que la IA pueda usar como referencia: lecturas del diplomado, papers que te interesen, normativa, etc.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  multiple
                  onChange={e => { handleFilesSelected(e.target.files); if (e.target) e.target.value = ""; }}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 10, cursor: "pointer",
                    border: "1.5px dashed var(--border)", background: "rgba(37,99,235,0.04)",
                    color: "var(--accent)", fontSize: 13, fontWeight: 600,
                  }}
                >
                  📎 Seleccionar archivos
                </button>

                {archivos.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {archivos.map((a, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 10px", background: "rgba(255,255,255,0.6)",
                        border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                      }}>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          📄 {a.file.name} <span style={{ color: "var(--fg-muted)" }}>({(a.file.size / 1024).toFixed(0)} KB)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => quitarArchivo(i)}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: "0 6px" }}
                          title="Quitar archivo"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INFO ESCENARIO DETECTADO */}
              <div style={{
                padding: "10px 12px", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)",
                borderRadius: 8, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5,
              }}>
                <strong style={{ color: "var(--accent)" }}>💡 ¿Qué pasa después?</strong>
                <br />
                {tema.trim() && archivos.length > 0 && "El Cap 0 analizará tus documentos y propondrá 2-3 refinamientos a tu tema."}
                {tema.trim() && archivos.length === 0 && "El Cap 0 validará tu tema y propondrá ajustes menores según tu programa."}
                {!tema.trim() && archivos.length > 0 && "El Cap 0 propondrá 3-5 temas basados en tus documentos y programa."}
                {!tema.trim() && archivos.length === 0 && "El Cap 0 propondrá 3-5 temas viables basados en tu programa y módulos."}
              </div>

              <button
                onClick={crearProyectoYDirigirAlWorkspace}
                disabled={!programa.trim() || !materias.trim()}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: (!programa.trim() || !materias.trim()) ? 0.5 : 1, fontSize: 14, fontWeight: 700 }}
              >
                Crear proyecto y empezar →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
