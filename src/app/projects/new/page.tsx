"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UmssDuplicidadCheck from "@/components/UmssDuplicidadCheck";
import dynamic from "next/dynamic";

// PdfCanvasViewer es client-only (react-pdf necesita browser APIs).
const PdfCanvasViewer = dynamic(() => import("@/components/PdfCanvasViewer"), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#525659", color: "white" }}>
      Cargando visor…
    </div>
  ),
});

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
  | "seleccionar-subtipo-grado"   // 🎓 nuevo: solo aparece si el servicio es Proyecto de Grado y el subtipo no viene predefinido
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
  guia_oficial: {
    id: string;
    nombre: string;
    /** Presente solo si la guía es UMSS. */
    formato_umss?: "guia_1_posgrado" | "guia_2_cespedes";
    /** Presente solo si la guía es de otra universidad (UCB hoy). */
    formato_universidad?: "ucb_2020";
    autor: string;
    fecha: string;
    caracteristicas: string[];
    url_documento_pdf: string | null;
  };
}

interface ArchivoSubido {
  file: File;
  estado: "pendiente" | "subiendo" | "ok" | "error";
  error?: string;
}

// Wrapper exportado: envuelve el componente real en Suspense porque
// useSearchParams() requiere boundary explícito para que Next.js pueda
// generar la página estáticamente sin fallar el build.
export default function NuevoProyectoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading-dots" />
      </div>
    }>
      <NuevoProyectoPageInner />
    </Suspense>
  );
}

function NuevoProyectoPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [tipoProyectoId, setTipoProyectoId] = useState("tipo-monografia");

  // Modal de previsualización de PDF (guías oficiales UMSS).
  // El visor renderiza el PDF como canvas (PdfCanvasViewer + Mozilla PDF.js)
  // para esquivar extensiones tipo TeraBox que interceptan archivos PDF.
  const [pdfPreview, setPdfPreview] = useState<{ url: string; titulo: string } | null>(null);

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
          fetch("/api/universities"),
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

        // 🎓 Si el dashboard envió ?tipo=... lo respetamos. Puede venir como
        // tipo-monografia, proy-grado-001 (sin subtipo aún), proy-prod-001 o
        // proy-serv-001.
        const tipoQuery = searchParams.get("tipo") ?? "";
        let initialStep: Step = "seleccionar-universidad";
        if (tipoQuery === "proy-grado-001") {
          // El estudiante apuntó al servicio nuevo sin elegir subtipo:
          // mostramos el step de elección antes de la universidad.
          // No seteamos tipoProyectoId todavía (lo elige en el step nuevo).
          initialStep = "seleccionar-subtipo-grado";
        } else if (tipoQuery === "proy-prod-001" || tipoQuery === "proy-serv-001") {
          // Vino del dashboard con subtipo ya elegido — saltamos directo.
          setTipoProyectoId(tipoQuery);
          initialStep = "seleccionar-universidad";
        } else if (tipoQuery) {
          setTipoProyectoId(tipoQuery);
        }

        setStep(initialStep);
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
    // 🎓 Subtipos de Proyecto de Grado mapean al mismo servicio
    if (tipoProyectoId === "proy-prod-001" || tipoProyectoId === "proy-serv-001") {
      return "proy-grado-001";
    }
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

        {/* ── PASO 0 (solo Proyecto de Grado): ELEGIR SUBTIPO ──────────────────────── */}
        {step === "seleccionar-subtipo-grado" && (
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
                Paso 1 — Tipo de proyecto
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                ¿Qué tipo de proyecto vas a desarrollar?
              </h1>
              <p style={{ color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.6 }}>
                Esta elección define las fases del flujo y el enfoque del Marco
                Propositivo. No se puede cambiar después de creado el proyecto.
              </p>
            </div>

            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
              {/* PRODUCCIÓN */}
              <button
                type="button"
                onClick={() => {
                  setTipoProyectoId("proy-prod-001");
                  setStep("seleccionar-universidad");
                }}
                className="card card-hover"
                style={{
                  textAlign: "left",
                  padding: "20px 22px",
                  border: "2px solid var(--border)",
                  background: "var(--bg-card)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 28 }}>🏭</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--fg-primary)" }}>
                  Producción y comercialización de un bien
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
                  Producir y comercializar bienes tangibles: alimentos, ropa, productos químicos, tecnología.
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>
                  El estudio técnico incluirá proceso productivo, maquinaria, materia prima.
                  Marketing mix clásico de 4P.
                </div>
              </button>

              {/* SERVICIOS */}
              <button
                type="button"
                onClick={() => {
                  setTipoProyectoId("proy-serv-001");
                  setStep("seleccionar-universidad");
                }}
                className="card card-hover"
                style={{
                  textAlign: "left",
                  padding: "20px 22px",
                  border: "2px solid var(--border)",
                  background: "var(--bg-card)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 28 }}>☕</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--fg-primary)" }}>
                  Brindar un servicio
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
                  Ofrecer un servicio: cafetería, taller, agencia, consultoría, salón, escuela.
                </div>
                <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>
                  El estudio técnico incluirá ambientación del local, capacidad de atención
                  y protocolos. Marketing mix ampliado de 7P (incluye Personas, Procesos y
                  Evidencia Física).
                </div>
              </button>
            </div>

            <div style={{ marginTop: 18, fontSize: 11.5, color: "var(--fg-muted)", textAlign: "center" }}>
              ¿No estás seguro? Si vendes un producto que tú mismo fabricas, elige <strong>Producción</strong>.
              Si lo principal es la experiencia que entregas (atención, ambiente, tiempo de tu equipo), elige <strong>Servicios</strong>.
            </div>
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
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {universidadId === u.id ? "✓ Seleccionada" : "Elegir"}
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
                Formato oficial del Capítulo I
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
                ¿Qué guía oficial sigue tu diplomado?
              </h1>
              <p style={{ color: "var(--fg-muted)", fontSize: 13.5, lineHeight: 1.6 }}>
                UMSS publicó dos guías para monografías de Posgrado. Cada variante
                que ofrecemos está alineada exactamente a una de ellas — abrí el{" "}
                <strong>PDF oficial</strong> y comparalo con el que te entregó tu
                coordinador para elegir con seguridad.
              </p>
            </div>

            {/* Grid responsivo: 2 columnas en desktop, 1 en mobile.
                Usamos clase + media query inline para forzar el breakpoint
                (auto-fit con minmax 320px se colapsaba a 1 col si el
                contenedor padre es chico). */}
            <style>{`
              .umss-variant-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 16px;
                margin-bottom: 24px;
              }
              @media (min-width: 720px) {
                .umss-variant-grid {
                  grid-template-columns: 1fr 1fr;
                }
              }
            `}</style>
            <div className="umss-variant-grid">
              {cap1Variantes.map((v) => {
                const seleccionada = cap1VarianteId === v.id;
                const esUcb = v.guia_oficial?.formato_universidad === "ucb_2020";
                const esGuia1 = v.guia_oficial?.formato_umss === "guia_1_posgrado";
                // Esquema de colores por guía: UMSS-Guia1 azul, UMSS-Guia2 violeta,
                // UCB esmeralda (distintivo institucional UCB San Pablo).
                const colorGuia = esUcb ? "#0d9488" : esGuia1 ? "#2563eb" : "#7c3aed";
                const bgGuia = esUcb
                  ? "rgba(13,148,136,0.08)"
                  : esGuia1
                    ? "rgba(37,99,235,0.08)"
                    : "rgba(124,58,237,0.08)";
                const etiquetaGuia = esUcb
                  ? "Guía UCB Cochabamba"
                  : esGuia1
                    ? "Guía 1 UMSS"
                    : "Guía 2 UMSS";
                const shadowGuia = esUcb
                  ? "rgba(13,148,136,0.15)"
                  : esGuia1
                    ? "rgba(37,99,235,0.15)"
                    : "rgba(124,58,237,0.15)";

                return (
                  // div clickeable (no button) para permitir <a target=_blank>
                  // anidado dentro — un button no acepta anchors validamente.
                  <div
                    key={v.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setCap1VarianteId(v.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCap1VarianteId(v.id);
                      }
                    }}
                    style={{
                      padding: 0,
                      borderRadius: 14,
                      cursor: "pointer",
                      textAlign: "left",
                      background: seleccionada ? bgGuia : "rgba(255,255,255,0.92)",
                      border: seleccionada
                        ? `2.5px solid ${colorGuia}`
                        : "1.5px solid var(--border)",
                      color: "var(--fg-primary)",
                      transition: "all 0.18s ease",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: seleccionada
                        ? `0 8px 24px ${shadowGuia}`
                        : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Header con badge de guía oficial */}
                    <div
                      style={{
                        padding: "14px 18px",
                        background: bgGuia,
                        borderBottom: `1px solid ${colorGuia}25`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: colorGuia,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              marginBottom: 4,
                            }}
                          >
                            {etiquetaGuia} · {v.guia_oficial?.fecha}
                          </div>
                          <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2 }}>
                            {seleccionada ? "✓ " : ""}Formato {v.nombre}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: seleccionada ? colorGuia : "rgba(0,0,0,0.05)",
                            color: seleccionada ? "white" : "var(--fg-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {seleccionada ? "Elegida" : "Elegir"}
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo */}
                    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                      {/* Documento oficial */}
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--fg-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 4,
                          }}
                        >
                          📖 Documento oficial
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, marginBottom: 2 }}>
                          {v.guia_oficial?.nombre}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
                          {v.guia_oficial?.autor}
                        </div>
                      </div>

                      {/* Descripción corta */}
                      <div style={{ fontSize: 12.5, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
                        {v.descripcion}
                      </div>

                      {/* Botón: Ver guía oficial (PDF) — abre modal con iframe
                          embebido. Mucho mejor UX que pestaña nueva (el estudiante
                          no pierde su flujo) y bypassea los problemas de popups. */}
                      {v.guia_oficial?.url_documento_pdf && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setPdfPreview({
                              url: v.guia_oficial!.url_documento_pdf!,
                              titulo: v.guia_oficial!.nombre,
                            });
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "white",
                            border: `1.5px solid ${colorGuia}`,
                            color: colorGuia,
                            fontWeight: 700,
                            fontSize: 12.5,
                            transition: "all 0.15s",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = bgGuia;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "white";
                          }}
                        >
                          <span style={{ fontSize: 16 }}>📄</span>
                          <span style={{ flex: 1 }}>Ver guía oficial (PDF)</span>
                          <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>↗</span>
                        </button>
                      )}

                      {/* Características clave de la guía */}
                      {v.guia_oficial?.caracteristicas?.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--fg-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: 6,
                            }}
                          >
                            ✅ Esta guía exige
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                            {v.guia_oficial.caracteristicas.map((c, i) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: 11.5,
                                  color: "var(--fg-secondary)",
                                  lineHeight: 1.45,
                                  paddingLeft: 14,
                                  position: "relative",
                                }}
                              >
                                <span style={{ position: "absolute", left: 0, color: colorGuia, fontWeight: 700 }}>•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Estructura del Capítulo I */}
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--fg-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 6,
                          }}
                        >
                          📋 Estructura del Capítulo I
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--fg-secondary)",
                            background: "rgba(0,0,0,0.025)",
                            padding: "10px 12px",
                            borderRadius: 8,
                            lineHeight: 1.7,
                            whiteSpace: "pre-line",
                            fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
                            maxHeight: 240,
                            overflowY: "auto",
                          }}
                        >
                          {v.estructura_visible.join("\n")}
                        </div>
                      </div>

                      {/* Nota (warning) */}
                      {v.nota && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#92400e",
                            background: "rgba(245,158,11,0.10)",
                            border: "1px solid rgba(245,158,11,0.30)",
                            padding: "10px 12px",
                            borderRadius: 8,
                            lineHeight: 1.5,
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <span style={{ flexShrink: 0 }}>⚠️</span>
                          <span>{v.nota}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ayuda contextual */}
            <div
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                background: "rgba(0,0,0,0.025)",
                padding: "12px 14px",
                borderRadius: 8,
                lineHeight: 1.55,
                marginBottom: 20,
                display: "flex",
                gap: 10,
              }}
            >
              <span style={{ flexShrink: 0, fontSize: 14 }}>💡</span>
              <span>
                <strong>¿No sabes cuál elegir?</strong> Si tu diplomado pertenece a la
                Facultad de Ciencias Económicas (Doble Titulación 2024 en adelante),
                usá <strong>Clásico</strong>. Si tu coordinador te entregó la guía con
                ejemplos por diplomado (Comercio Internacional, Banca, Finanzas, etc.),
                usá <strong>Reducido</strong>.
              </span>
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
              style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            >
              Continuar con formato {cap1Variantes.find(v => v.id === cap1VarianteId)?.nombre ?? ""} →
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

                {/* Verificación de duplicidad UMSS — solo aparece si la
                    universidad es UMSS y hay tema con texto suficiente. */}
                {universidadId === "umss-001" && tema.trim().length >= 6 && (
                  <div style={{ marginTop: 12 }}>
                    <UmssDuplicidadCheck tema={tema.trim()} colapsarTrasConfirmar />
                  </div>
                )}
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

      {/* ── MODAL: Previsualización PDF guías UMSS ─────────────────────────── */}
      {pdfPreview && (
        <div
          onClick={() => setPdfPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 1100,
              height: "92vh",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header del modal */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#f8fafc",
              }}
            >
              <div style={{ fontSize: 22 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                  Guía oficial UMSS
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {pdfPreview.titulo}
                </div>
              </div>
              <a
                href={`${pdfPreview.url}?formato=raw`}
                download
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "white",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                ⬇ Descargar
              </a>
              <button
                type="button"
                onClick={() => setPdfPreview(null)}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#0f172a",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cerrar ✕
              </button>
            </div>
            {/* Visor que renderiza el PDF como canvas (PDF.js de Mozilla).
                Esquiva extensiones tipo TeraBox que interceptan archivos PDF. */}
            <PdfCanvasViewer url={pdfPreview.url} pageWidth={900} />
          </div>
        </div>
      )}
    </div>
  );
}
