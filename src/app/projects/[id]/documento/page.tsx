"use client";

/**
 * /projects/[id]/documento
 *
 * Página dedicada al documento consolidado. El preview ocupa el centro grande
 * y a la derecha hay un sidebar con:
 *  - Estado del documento (X/Y fases finalizadas, ~págs)
 *  - Acciones: configurar carátula, regenerar consolidado, descargar .tex
 *  - Q&A con IA sobre el documento
 *
 * Cuando NO hay al menos 1 fase aprobada, mostramos un placeholder y un
 * botón "Volver al workspace" para guiar al usuario.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { generatePdfHtml } from "@/lib/pdfTemplate";
import { DEFAULT_UNIVERSITIES } from "@/lib/data";
import { useViewMode } from "@/components/scribe/AdminViewToggle";

type Proyecto = {
  id: string;
  usuario_id: string;
  servicio_id?: string;
  tipo_proyecto_id?: string;
  tema_aprobado?: string | null;
  titulo_provisional?: string | null;
  universidad_id?: string | null;
  phase_contents?: Record<string, string | null | undefined>;
  final_document?: string | null;
  academic_context?: Record<string, unknown>;
  oculto_por_usuario?: boolean;
};

type PhaseDef = { id: string; label: string; short_label: string; orden: number };

type QAMsg = { role: "user" | "ia"; text: string; ts: number };

export default function DocumentoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode: viewMode } = useViewMode();
  const id = (params?.id as string) ?? "";
  // Fase desde la que el usuario vino (workspace pasa ?from=ph-capN).
  // Si no hay, vuelve al inicio del workspace.
  const fromPhase = searchParams?.get("from") ?? "";
  const backUrl = fromPhase
    ? `/projects/${id}/workspace?fase=${encodeURIComponent(fromPhase)}`
    : `/projects/${id}/workspace`;

  // ── Guard de admin ──────────────────────────────────────────────────────────
  // Esta página es SOLO para admin/QA. Para el estudiante normal, el preview
  // ensamblado a medio camino confunde más que ayuda. Si entra alguien sin
  // permisos, lo redirigimos al workspace silenciosamente.
  const [authChecked, setAuthChecked] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => ({}));
        const user = data?.user;
        const isAdmin = user?.role === "admin";
        const isTestAccount = Boolean(user?.email && /demo|test|laboratorio\.test/i.test(user.email));
        const isDevHost =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        const puedeVerToggle = isAdmin || isTestAccount || isDevHost;
        const tieneAccesoAdmin = puedeVerToggle && viewMode === "admin";
        if (cancelado) return;
        if (!tieneAccesoAdmin) {
          router.replace(backUrl);
          return;
        }
        setAutorizado(true);
      } catch {
        if (!cancelado) router.replace(backUrl);
      } finally {
        if (!cancelado) setAuthChecked(true);
      }
    })();
    return () => { cancelado = true; };
  }, [router, viewMode, backUrl]);

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [phaseDefs, setPhaseDefs] = useState<PhaseDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [zoom, setZoom] = useState(1);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Q&A
  const [qaMsgs, setQaMsgs] = useState<QAMsg[]>([]);
  const [qaInput, setQaInput] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const qaEndRef = useRef<HTMLDivElement>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ─── Carga inicial ──────────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("No se pudo cargar el proyecto");
      const data = await res.json();
      const p: Proyecto = data.proyecto ?? data;
      setProyecto(p);
      const sid = p.servicio_id ?? "mono-001";
      const phasesRes = await fetch(`/api/projects/${id}/phases`).catch(() => null);
      if (phasesRes && phasesRes.ok) {
        const pjs = await phasesRes.json();
        setPhaseDefs(pjs.phases ?? []);
      } else {
        // Fallback razonable: las 10 fases por defecto
        setPhaseDefs([
          { id: "ph-cap0", label: "Tu tema de investigación", short_label: "Tema", orden: 0 },
          { id: "ph-cap1", label: "Introducción", short_label: "Introducción", orden: 10 },
          { id: "ph-cap2", label: "Marco Teórico", short_label: "Marco", orden: 20 },
          { id: "ph-cap3", label: "Metodología", short_label: "Metodología", orden: 30 },
          { id: "ph-cap4", label: "Análisis y Resultados", short_label: "Resultados", orden: 40 },
          { id: "ph-cap5", label: "Conclusiones", short_label: "Conclusiones", orden: 50 },
          { id: "ph-resumen", label: "Resumen Ejecutivo", short_label: "Resumen", orden: 60 },
          { id: "ph-referencias", label: "Referencias", short_label: "Bibliografía", orden: 70 },
          { id: "ph-latex", label: "LaTeX", short_label: "LaTeX", orden: 80 },
          { id: "ph-calidad", label: "Control de Calidad", short_label: "Calidad", orden: 90 },
        ]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  // ─── Aplica zoom al iframe ──────────────────────────────────────────────────
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc?.body) (doc.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = String(zoom);
  }, [zoom, proyecto]);

  // ─── Scroll del chat Q&A al final ───────────────────────────────────────────
  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [qaMsgs.length, qaLoading]);

  // ─── Cálculo de fases con contenido aprobado ────────────────────────────────
  const fasesAprobadas = phaseDefs
    .filter(p => p.id !== "ph-cap0" && p.id !== "ph-latex" && p.id !== "ph-calidad")
    .filter(p => Boolean(proyecto?.phase_contents?.[p.id]?.trim()));

  const fasesEnBorrador = phaseDefs
    .filter(p => p.id !== "ph-cap0" && p.id !== "ph-latex" && p.id !== "ph-calidad")
    .filter(p => {
      if (proyecto?.phase_contents?.[p.id]?.trim()) return false;
      return Boolean(proyecto?.phase_contents?.[`${p.id}_borrador`]?.trim());
    });

  const tieneAlgoListo = fasesAprobadas.length > 0;
  const documentoFinalListo = Boolean(proyecto?.final_document?.trim());

  // ─── Construcción del HTML para el preview ──────────────────────────────────
  const universidad = proyecto?.universidad_id
    ? DEFAULT_UNIVERSITIES.find(u => u.id === proyecto.universidad_id) ?? DEFAULT_UNIVERSITIES[0]
    : DEFAULT_UNIVERSITIES[0];

  const phaseContents: Record<string, string | null> = {};
  const phaseLabels: Record<string, string> = {};
  if (proyecto) {
    if (documentoFinalListo) {
      phaseContents.fase_0 = proyecto.final_document!;
      phaseLabels.fase_0 = "Monografía final";
    } else {
      const fasesPDF = phaseDefs.filter(p => p.id !== "ph-cap0" && p.id !== "ph-latex" && p.id !== "ph-calidad");
      fasesPDF.forEach((p, idx) => {
        const final = proyecto.phase_contents?.[p.id];
        const borrador = proyecto.phase_contents?.[`${p.id}_borrador`];
        const usar = final?.trim() ? final : (borrador?.trim() ? borrador : null);
        const esBorrador = !final?.trim() && Boolean(borrador?.trim());
        if (usar) {
          phaseContents[`fase_${idx}`] = usar;
          phaseLabels[`fase_${idx}`] = esBorrador ? `${p.label}  ·  (borrador, pendiente de aprobación)` : p.label;
        }
      });
    }
  }

  const documentTitle = proyecto?.tema_aprobado || proyecto?.titulo_provisional || "Documento";
  const ctxIni = ((proyecto?.academic_context ?? {}) as Record<string, unknown>).contexto_inicial as Record<string, unknown> | undefined;
  const studentData = {
    nombre: String(ctxIni?.nombre ?? ""),
    universidadId: universidad?.id ?? "",
    nombreEstudiante: String(ctxIni?.nombre ?? ""),
    carrera: String(ctxIni?.programa ?? ""),
    tituloTrabajo: documentTitle,
    anio: String(new Date().getFullYear()),
    mes: "",
    tutor: "",
    programa: String(ctxIni?.programa ?? ""),
    version: "",
  };

  const docHtml = (Object.values(phaseContents).some(c => c?.trim()) || documentoFinalListo)
    ? generatePdfHtml({
        university: universidad,
        studentData,
        phaseContents,
        phaseLabels,
        titulo: documentTitle,
        preview: true,
      })
    : "";

  // ─── Acciones ───────────────────────────────────────────────────────────────
  const consolidar = async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);
    setError("");
    try {
      const res = await fetch("/api/projects/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyecto_id: id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "No se pudo consolidar");
      }
      await refetch();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsFinalizing(false);
    }
  };

  const descargarTex = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setError("");
    try {
      const qs = new URLSearchParams({
        nombre: studentData.nombreEstudiante,
        carrera: studentData.carrera,
        anio: studentData.anio,
      });
      const res = await fetch(`/api/projects/${id}/latex?${qs.toString()}`);
      if (!res.ok) throw new Error("No se pudo descargar el .tex");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.tex`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  const preguntarIA = async () => {
    const pregunta = qaInput.trim();
    if (!pregunta || qaLoading) return;
    setQaInput("");
    setQaMsgs(prev => [...prev, { role: "user", text: pregunta, ts: Date.now() }]);
    setQaLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al consultar la IA");
      setQaMsgs(prev => [...prev, { role: "ia", text: data.respuesta ?? "(sin respuesta)", ts: Date.now() }]);
    } catch (e) {
      setQaMsgs(prev => [...prev, { role: "ia", text: `⚠ ${(e as Error).message}`, ts: Date.now() }]);
    } finally {
      setQaLoading(false);
    }
  };

  // ─── Renderizado ────────────────────────────────────────────────────────────
  // Bloquear render hasta confirmar admin (evita flash de contenido a no-admin)
  if (!authChecked || !autorizado) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--fg-secondary)", fontSize:13 }}>
        {authChecked ? "Redirigiendo…" : "Verificando acceso…"}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--fg-secondary)" }}>
        Cargando documento…
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
        <div style={{ fontSize:14, color:"var(--fg-secondary)" }}>Proyecto no encontrado.</div>
        <button onClick={() => router.push("/dashboard")} className="btn-cyan" style={{ padding:"8px 16px" }}>Volver al dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"var(--bg)" }}>
      {/* Header */}
      <header style={{ padding:"14px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, background:"var(--bg-card)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
          <button
            onClick={() => router.push(backUrl)}
            className="btn-ghost"
            style={{ padding:"6px 12px", fontSize:12 }}
          >← Volver al workspace</button>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:"var(--accent)" }}>Documento</div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--fg-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"60vw" }}>
              {documentTitle}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Zoom */}
          {docHtml && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:2, padding:3, borderRadius:8, background:"rgba(148,163,184,0.12)", border:"1px solid rgba(148,163,184,0.2)" }}>
              <button onClick={() => setZoom(z => Math.max(0.75, +(z - 0.25).toFixed(2)))} disabled={zoom <= 0.75} style={{ width:26, height:24, fontSize:14, fontWeight:700, border:"none", background:"transparent", cursor: zoom <= 0.75 ? "not-allowed" : "pointer", color:"var(--fg-secondary)", opacity: zoom <= 0.75 ? 0.4 : 1, borderRadius:5 }}>−</button>
              <span style={{ fontSize:11.5, fontWeight:600, color:"var(--fg-secondary)", minWidth:42, textAlign:"center", fontVariantNumeric:"tabular-nums" }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.75, +(z + 0.25).toFixed(2)))} disabled={zoom >= 1.75} style={{ width:26, height:24, fontSize:14, fontWeight:700, border:"none", background:"transparent", cursor: zoom >= 1.75 ? "not-allowed" : "pointer", color:"var(--fg-secondary)", opacity: zoom >= 1.75 ? 0.4 : 1, borderRadius:5 }}>+</button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div style={{ padding:"10px 24px", background:"rgba(239,68,68,0.08)", borderBottom:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", fontSize:12 }}>
          ⚠ {error}
        </div>
      )}

      {/* Layout: preview centro + sidebar derecho */}
      <div style={{ flex:1, display:"flex", minHeight:0 }}>
        {/* Preview */}
        <main style={{ flex:1, overflow:"auto", padding:"24px 16px 24px 24px", background:"rgba(241,245,249,0.5)", display:"flex", justifyContent:"center" }}>
          {docHtml ? (
            <div style={{ width:"100%", maxWidth: 1100, height:"100%", background:"white", borderRadius:8, overflow:"auto", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
              <iframe
                ref={iframeRef}
                title="Vista previa del documento"
                srcDoc={docHtml}
                onLoad={() => {
                  const doc = iframeRef.current?.contentDocument;
                  if (doc?.body) (doc.body.style as CSSStyleDeclaration & { zoom?: string }).zoom = String(zoom);
                }}
                style={{ width:"100%", height:"100%", border:0, display:"block", minHeight:600 }}
              />
            </div>
          ) : (
            <div style={{ alignSelf:"center", padding:"40px 30px", maxWidth:480, textAlign:"center", display:"flex", flexDirection:"column", gap:14, background:"var(--bg-card)", borderRadius:16, border:"1px solid var(--border)" }}>
              <div style={{ fontSize:48, opacity:0.25 }}>📄</div>
              <div style={{ fontSize:15, fontWeight:700, color:"var(--fg-primary)" }}>Todavía no hay nada que mostrar</div>
              <div style={{ fontSize:12, color:"var(--fg-secondary)", lineHeight:1.6 }}>
                Generá y aprobá al menos un capítulo en el workspace. Cuando vuelvas acá vas a ver tu documento completo, formateado como se va a entregar.
              </div>
              <button onClick={() => router.push(backUrl)} className="btn-cyan" style={{ marginTop:8, padding:"10px 18px", fontSize:13 }}>
                Ir al workspace →
              </button>
            </div>
          )}
        </main>

        {/* Sidebar derecho */}
        <aside style={{ width: 360, borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", background:"var(--bg-card)", flexShrink:0 }}>
          {/* Estado del documento */}
          <section style={{ padding:"16px 18px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--fg-muted)", marginBottom:8 }}>Estado</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, fontSize:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"var(--fg-secondary)" }}>Aprobados</span>
                <span style={{ fontWeight:600, color: fasesAprobadas.length > 0 ? "#16a34a" : "var(--fg-secondary)" }}>{fasesAprobadas.length}</span>
              </div>
              {fasesEnBorrador.length > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"var(--fg-secondary)" }}>En borrador</span>
                  <span style={{ fontWeight:600, color:"#f59e0b" }}>{fasesEnBorrador.length}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"var(--fg-secondary)" }}>Consolidado</span>
                <span style={{ fontWeight:600, color: documentoFinalListo ? "#16a34a" : "var(--fg-muted)" }}>
                  {documentoFinalListo ? "✓ Listo" : "Pendiente"}
                </span>
              </div>
            </div>
          </section>

          {/* Acciones */}
          <section style={{ padding:"16px 18px", borderBottom:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--fg-muted)", marginBottom:4 }}>Acciones</div>
            <button
              onClick={consolidar}
              disabled={isFinalizing || fasesAprobadas.length === 0}
              className="btn-purple"
              style={{ width:"100%", padding:"10px", fontSize:12.5, justifyContent:"center", opacity: fasesAprobadas.length === 0 ? 0.5 : 1, cursor: fasesAprobadas.length === 0 ? "not-allowed" : "pointer" }}
              title={fasesAprobadas.length === 0 ? "Aprobá al menos un capítulo primero" : "Consolida los capítulos aprobados en un documento único"}
            >
              {isFinalizing ? "Consolidando…" : documentoFinalListo ? "Regenerar documento" : "Consolidar documento"}
            </button>
            <button
              onClick={descargarTex}
              disabled={isDownloading || !tieneAlgoListo}
              className="btn-cyan"
              style={{ width:"100%", padding:"10px", fontSize:12.5, justifyContent:"center", opacity: !tieneAlgoListo ? 0.5 : 1, cursor: !tieneAlgoListo ? "not-allowed" : "pointer" }}
            >
              {isDownloading ? "Descargando…" : "📄 Descargar .tex"}
            </button>
            <a
              href={`/projects/${id}/defensa`}
              style={{ width:"100%", padding:"10px", fontSize:12.5, fontWeight:600, borderRadius:8, border:"1px solid var(--border)", background:"transparent", color:"var(--fg-secondary)", textAlign:"center", textDecoration:"none", boxSizing:"border-box" }}
            >
              🎓 Practicar defensa
            </a>
          </section>

          {/* Q&A con IA */}
          <section style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style={{ padding:"12px 18px 8px", borderBottom:"1px solid var(--border)" }}>
              <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--fg-muted)" }}>Preguntale a tu documento</div>
              <div style={{ fontSize:11, color:"var(--fg-muted)", marginTop:4, lineHeight:1.5 }}>
                La IA responde sobre el contenido que ya generaste. Ej: &ldquo;¿Cuál es la hipótesis?&rdquo;, &ldquo;Resumí el Cap III&rdquo;, &ldquo;¿Qué falta?&rdquo;
              </div>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"12px 18px", display:"flex", flexDirection:"column", gap:8 }}>
              {qaMsgs.length === 0 && !qaLoading && (
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
                  {[
                    "¿Cuál es la hipótesis principal?",
                    "Resumí el contenido del documento",
                    "¿Qué capítulos faltan o están incompletos?",
                    "¿Qué fortalezas tiene el trabajo?",
                  ].map(sug => (
                    <button
                      key={sug}
                      onClick={() => setQaInput(sug)}
                      style={{ textAlign:"left", padding:"7px 10px", fontSize:11, borderRadius:7, border:"1px solid var(--border)", background:"transparent", cursor:"pointer", color:"var(--fg-secondary)" }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
              {qaMsgs.map((m, i) => (
                <div key={i} style={{
                  padding:"8px 11px", borderRadius:10, fontSize:12, lineHeight:1.55,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "rgba(79,70,229,0.14)" : "rgba(37,99,235,0.07)",
                  border: m.role === "user" ? "1px solid rgba(79,70,229,0.22)" : "1px solid rgba(37,99,235,0.12)",
                  color:"var(--fg-primary)",
                  maxWidth:"94%",
                  whiteSpace:"pre-wrap",
                }}>
                  <div style={{ fontWeight:700, fontSize:9.5, color:"var(--accent)", marginBottom:3, letterSpacing:"0.04em", textTransform:"uppercase" }}>
                    {m.role === "user" ? "Tú" : "IA"}
                  </div>
                  {m.text}
                </div>
              ))}
              {qaLoading && (
                <div style={{ padding:"10px 12px", borderRadius:10, background:"rgba(37,99,235,0.05)", border:"1px solid rgba(37,99,235,0.1)", alignSelf:"flex-start", display:"flex", gap:4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:"var(--accent)", animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite both` }}/>)}
                </div>
              )}
              <div ref={qaEndRef} />
            </div>

            <div style={{ padding:"10px 14px", borderTop:"1px solid var(--border)", display:"flex", gap:6 }}>
              <input
                type="text"
                value={qaInput}
                onChange={e => setQaInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); preguntarIA(); }}}
                placeholder="Escribí tu pregunta…"
                className="input-dark"
                style={{ flex:1, fontSize:12, padding:"8px 10px" }}
                disabled={qaLoading || !tieneAlgoListo}
              />
              <button
                onClick={preguntarIA}
                disabled={qaLoading || !qaInput.trim() || !tieneAlgoListo}
                className="btn-purple"
                style={{ padding:"8px 12px", fontSize:12, cursor: qaLoading || !qaInput.trim() || !tieneAlgoListo ? "not-allowed" : "pointer", opacity: qaLoading || !qaInput.trim() || !tieneAlgoListo ? 0.5 : 1 }}
              >↑</button>
            </div>
            {!tieneAlgoListo && (
              <div style={{ padding:"8px 18px 14px", fontSize:10.5, color:"var(--fg-muted)", lineHeight:1.5 }}>
                Aprobá al menos un capítulo para hacer preguntas.
              </div>
            )}
          </section>
        </aside>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
