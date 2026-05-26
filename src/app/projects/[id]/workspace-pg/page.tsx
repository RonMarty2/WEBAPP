"use client";

/**
 * Workspace dedicado de Proyecto de Grado (PG).
 *
 * SEPARACIÓN ARQUITECTÓNICA: este workspace es INDEPENDIENTE del de
 * Monografía (/projects/[id]/workspace). PG es otro servicio del SaaS
 * y merece su propio espacio sin condicionales mezclados.
 *
 * Estructura mínima de Cap. 0 a Cap. IV completo (UCATEC):
 *   - Header: "Proyecto de Grado" + universidad + título
 *   - Sidebar: PGPhaseSidebar (4 capítulos + preparación + cierre)
 *   - Panel central: fase actual con su prompt + botón generar
 *
 * Este es un MVP funcional. Se irá enriqueciendo con:
 *   - Vista LaTeX preview
 *   - Generador de visuales (organigrama, flujograma, gráficos)
 *   - Defensa materiales
 *   - Exportar Overleaf
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import PGPhaseSidebar from "@/components/scribe/PGPhaseSidebar";
import UnifranzPhaseSidebar from "@/components/scribe/UnifranzPhaseSidebar";
import {
  UNIFRANZ_UNIVERSITY_ID,
  getModalidadUnifranz,
  type ModalidadUnifranz,
} from "@/lib/proyectoGrado/unifranz/modalidades";
import Cap0TituloSelector, { removerSeccionPropuestas } from "@/components/scribe-pg/Cap0TituloSelector";
import Cap0RichRender from "@/components/scribe-pg/Cap0RichRender";
import MarkdownAcademico from "@/components/scribe-pg/MarkdownAcademico";
import Cap3eModoSelector from "@/components/scribe-pg/Cap3eModoSelector";
import Cap4gConfigSelector from "@/components/scribe-pg/Cap4gConfigSelector";
import FaseAcciones from "@/components/scribe-pg/FaseAcciones";
import type { SessionUser } from "@/lib/auth";

interface Proyecto {
  id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  servicio_id: string;
  tipo_proyecto_id?: string;
  universidad_id?: string;
  /** 🎓 Modalidad UNIFRANZ (Tesis, PG-PreFact, etc.). Solo para UNIFRANZ. */
  modalidad_titulacion?: string | null;
  phase_contents?: Record<string, string | null>;
  academic_context?: Record<string, unknown>;
  servicios: { id: string; nombre: string } | null;
}

interface PhaseDef {
  id: string;
  label: string;
  short_label?: string;
  short?: string;
  orden: number;
  prompt?: string;
}

export default function WorkspacePGPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const proyectoId = params?.id ?? "";

  const [user, setUser] = useState<SessionUser | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [phaseDefs, setPhaseDefs] = useState<PhaseDef[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  // Modo de generación elegido por el estudiante para cap3e
  const [cap3eModo, setCap3eModo] = useState<"PROYECCION" | "DATOS_REALES" | null>(null);

  // ── Cargar proyecto + fases ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [meRes, projRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/projects/${proyectoId}`),
        ]);
        if (cancelled) return;
        const meData = await meRes.json();
        if (!meData.user) {
          router.replace("/login");
          return;
        }
        setUser(meData.user);
        if (!projRes.ok) {
          router.replace("/dashboard");
          return;
        }
        const proj: Proyecto = (await projRes.json()).proyecto;
        setProyecto(proj);

        // Si NO es PG, mandamos al workspace de monografía
        const tipoId = proj.tipo_proyecto_id;
        const esPG =
          tipoId === "proy-grado-001" ||
          tipoId === "proy-prod-001" ||
          tipoId === "proy-serv-001" ||
          proj.servicio_id === "proy-grado-001";
        if (!esPG) {
          router.replace(`/projects/${proyectoId}/workspace`);
          return;
        }

        // Cargar definiciones de fases (endpoint seguro: solo metadata,
        // los prompts NUNCA salen al cliente).
        const phaseParams = new URLSearchParams({
          servicio_id: proj.servicio_id ?? "proy-grado-001",
        });
        const fasesRes = await fetch(`/api/projects/${proj.id}/phases?${phaseParams}`);
        if (fasesRes.ok) {
          const data = await fasesRes.json();
          const fases: PhaseDef[] = (data.phases ?? []).map((p: { id: string; label: string; short_label?: string; orden: number }) => ({
            id: p.id,
            label: p.label,
            short_label: p.short_label,
            orden: p.orden,
          }));
          setPhaseDefs(fases.sort((a, b) => a.orden - b.orden));
          // Saltar a la última fase con contenido (o cap0 si nada)
          const lastDone = fases.reduce((acc, p, i) =>
            (proj.phase_contents?.[p.id] ?? null) ? i : acc, 0);
          setSelectedIndex(lastDone);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (proyectoId) load();
    return () => { cancelled = true; };
  }, [proyectoId, router]);

  // ── Generar fase actual ───────────────────────────────────────────────
  const fasaActual = phaseDefs[selectedIndex];
  const phaseContents = proyecto?.phase_contents ?? {};
  const contenidoActual = fasaActual ? phaseContents[fasaActual.id] : null;

  const generarFase = useCallback(async () => {
    if (!fasaActual || !proyecto) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/projects/generate-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyecto_id: proyecto.id,
          phase_id: fasaActual.id,
          tipo: "final",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error generando fase");
      // Refrescar el proyecto para tomar el nuevo contenido
      const projRes = await fetch(`/api/projects/${proyecto.id}`);
      if (projRes.ok) {
        const proj = (await projRes.json()).proyecto;
        setProyecto(proj);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }, [fasaActual, proyecto]);

  // ── Items para el sidebar ──────────────────────────────────────────────
  const sidebarItems = useMemo(() => {
    return phaseDefs.map((p) => ({
      id: p.id,
      label: p.label,
      short: p.short_label ?? p.short ?? p.label,
      orden: p.orden,
    }));
  }, [phaseDefs]);

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-secondary)" }}>
        Cargando proyecto…
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Proyecto no encontrado.{" "}
        <Link href="/dashboard" style={{ marginLeft: 8, color: "var(--accent)" }}>← Dashboard</Link>
      </div>
    );
  }

  const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || "Proyecto sin título";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 18px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-card)",
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard" style={{ color: "var(--fg-secondary)", fontSize: 13, textDecoration: "none" }}>
          ← Dashboard
        </Link>
        <Link
          href={`/projects/${proyectoId}/preview-pg`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 7,
            background: "rgba(37,99,235,0.10)",
            color: "var(--accent)",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            border: "1px solid rgba(37,99,235,0.25)",
          }}
          title="Abrir vista previa del documento"
        >
          📄 Ver preview
        </Link>
        <button
          type="button"
          onClick={async () => {
            try {
              const res = await fetch(`/api/projects/${proyectoId}/paquete-latex-pg`);
              if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Error desconocido" }));
                alert("No se pudo generar el LaTeX:\n\n" + (data.error || "Error desconocido"));
                return;
              }
              // Descarga real del ZIP via blob
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              const titulo = proyecto?.tema_aprobado || "proyecto-grado";
              const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
              a.download = `${slug}-pg-latex.zip`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } catch (e) {
              alert("Error al descargar: " + (e as Error).message);
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 7,
            background: "rgba(22,163,74,0.12)",
            color: "#16a34a",
            fontSize: 12,
            fontWeight: 700,
            border: "1px solid rgba(22,163,74,0.3)",
            cursor: "pointer",
          }}
          title="Descargar ZIP con el archivo .tex listo para Overleaf o pdflatex local"
        >
          📦 Descargar LaTeX (.zip)
        </button>
        <a
          href={`/api/projects/${proyectoId}/bitacora/imprimible`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 7,
            background: "rgba(99,102,241,0.12)",
            color: "#6366f1",
            fontSize: 12,
            fontWeight: 700,
            border: "1px solid rgba(99,102,241,0.3)",
            cursor: "pointer",
            textDecoration: "none",
          }}
          title="Abre la Bitácora del Tutor (todas las observaciones aplicadas y rechazadas con justificación). Ctrl+P para guardarla como PDF."
        >
          📋 Descargar Bitácora
        </a>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {titulo}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>Proyecto de Grado</span>
            <span>·</span>
            <span>UCATEC</span>
            {user?.role === "admin" && (
              <>
                <span>·</span>
                <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(59,130,246,0.15)", color: "#3b82f6", fontWeight: 700 }}>
                  ADMIN
                </span>
              </>
            )}
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Body: sidebar + main */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Sidebar PG */}
        <aside
          style={{
            width: 280,
            borderRight: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {(() => {
            // 🎓 Si el proyecto es UNIFRANZ + tiene modalidad válida,
            // usamos el sidebar UNIFRANZ con grupos oficiales de la guía 2017.
            // En caso contrario, sidebar PG genérico (UCATEC y compatibles).
            const esUnifranz =
              proyecto.universidad_id === UNIFRANZ_UNIVERSITY_ID
              && getModalidadUnifranz(proyecto.modalidad_titulacion) !== null;

            if (esUnifranz) {
              return (
                <UnifranzPhaseSidebar
                  phases={sidebarItems}
                  modalidad={proyecto.modalidad_titulacion as ModalidadUnifranz}
                  selectedIndex={selectedIndex}
                  phaseContents={phaseContents}
                  onSelect={setSelectedIndex}
                />
              );
            }
            return (
              <PGPhaseSidebar
                phases={sidebarItems}
                selectedIndex={selectedIndex}
                phaseContents={phaseContents}
                onSelect={setSelectedIndex}
              />
            );
          })()}
        </aside>

        {/* Main: fase actual */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 32px",
            background: "var(--bg-primary)",
          }}
        >
          {!fasaActual ? (
            <div style={{ color: "var(--fg-secondary)" }}>
              No hay fases definidas todavía.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Fase {selectedIndex + 1} de {phaseDefs.length}
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "var(--fg-primary)" }}>
                  {fasaActual.label}
                </h1>
              </div>

              {error && (
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", marginBottom: 16, fontSize: 13 }}>
                  {error}
                </div>
              )}

              {!contenidoActual ? (
                <>
                  {/* Selector pre-generación para cap3e (modo encuesta) */}
                  {fasaActual.id?.includes("cap3e") && (
                    <Cap3eModoSelector
                      modoActual={cap3eModo}
                      onModoSelected={setCap3eModo}
                    />
                  )}
                  <div style={{ padding: 32, borderRadius: 12, background: "var(--bg-card)", border: "1px dashed var(--border)", textAlign: "center" }}>
                    <div style={{ fontSize: 14, color: "var(--fg-secondary)", marginBottom: 16 }}>
                      Esta fase aún no se ha generado.
                    </div>
                    <button
                      onClick={generarFase}
                      disabled={generating || (fasaActual.id?.includes("cap3e") && !cap3eModo)}
                      style={{
                        padding: "12px 28px",
                        borderRadius: 8,
                        background: (generating || (fasaActual.id?.includes("cap3e") && !cap3eModo)) ? "var(--fg-muted)" : "var(--accent)",
                        color: "white",
                        border: "none",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: generating ? "wait" : "pointer",
                        opacity: (generating || (fasaActual.id?.includes("cap3e") && !cap3eModo)) ? 0.6 : 1,
                      }}
                      title={fasaActual.id?.includes("cap3e") && !cap3eModo ? "Primero elegí el modo de generación arriba" : ""}
                    >
                      {generating ? "Generando…" : `🚀 Generar ${fasaActual.label}`}
                    </button>
                    {fasaActual.id?.includes("cap3e") && !cap3eModo && (
                      <div style={{ marginTop: 12, fontSize: 12, color: "var(--fg-muted)" }}>
                        ↑ Elegí primero el modo de generación arriba
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {fasaActual.id?.includes("cap0") ? (
                    <>
                      {/* CAP. 0 reorganizado: la DECISIÓN del estudiante va
                          ARRIBA (selector de título). El contexto (síntesis,
                          segmento, viabilidad, próximos pasos) va en UN solo
                          bloque compacto DEBAJO, no fragmentado en 4 cards
                          separadas que confundían al usuario. */}
                      <Cap0TituloSelector
                        contenidoCap0={contenidoActual}
                        proyectoId={proyecto.id}
                        tituloActual={proyecto.tema_aprobado}
                        onTituloSelected={(titulo) => {
                          setProyecto((p) => p ? { ...p, tema_aprobado: titulo, titulo_provisional: titulo } : p);
                        }}
                      />
                      <div style={{ marginTop: 18 }}>
                        <Cap0RichRender markdown={removerSeccionPropuestas(contenidoActual)} />
                      </div>
                    </>
                  ) : (
                    // Render académico tipo documento para Cap. I a IV y
                    // cierre: títulos con jerarquía visual, tablas
                    // estilizadas, bloques TikZ/LaTeX como placeholders
                    // elegantes (no como código crudo).
                    <MarkdownAcademico markdown={contenidoActual} />
                  )}

                  {/* Selector de configuración final — solo cap4g cuando hay
                      escenarios viables en el análisis de sensibilidad */}
                  {fasaActual.id?.includes("cap4g") && (
                    <Cap4gConfigSelector
                      contenidoCap4g={contenidoActual}
                    />
                  )}

                  {/* Acciones universales para CADA fase generada:
                      Aprobar (avanza) + Regenerar (con feedback opcional) */}
                  <FaseAcciones
                    faseLabel={fasaActual.label}
                    esUltimaFase={selectedIndex >= phaseDefs.length - 1}
                    onAprobar={() => setSelectedIndex((i) => Math.min(i + 1, phaseDefs.length - 1))}
                    onRegenerar={async () => { await generarFase(); }}
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
