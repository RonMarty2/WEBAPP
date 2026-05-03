"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import type { University } from "@/lib/data";
import { MESES, type StudentCoverData, generatePdfHtml, getHtmlCover, buildCss } from "@/lib/pdfTemplate";
import GlassModal from "@/components/ui/GlassModal";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Proyecto {
  id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  servicio_id: string;
  universidad_id?: string;
  modalidad_creacion?: "directa" | "guiada";
  perfil_estilo_usuario?: string | null;
  requiere_actualizacion?: Record<string, boolean>;
  contenido_fase_0: string | null;
  contenido_fase_1: string | null;
  contenido_fase_2: string | null;
  contenido_fase_3: string | null;
  contenido_fase_4: string | null;
  contenido_fase_5: string | null;
  phase_contents?: Record<string, string | null>;
  servicios: { id: string; nombre: string } | null;
}

interface ChatMsg { role: "user" | "assistant"; text: string; ts?: number; }
interface PhaseDef { id: string; label: string; short: string; orden: number; }
interface CalibracionPregunta {
  id: string; pregunta: string; descripcion?: string;
  placeholder?: string; minimo_palabras: number;
}

// ── Static phase definitions ──────────────────────────────────────────────────

const FASES_STATIC = [
  { id: "0", num: 0, label: "Planteamiento del Tema",         short: "Fase 0" },
  { id: "1", num: 1, label: "Capítulo I — Marco Referencial", short: "Cap. I" },
  { id: "2", num: 2, label: "Capítulo II — Marco Teórico",    short: "Cap. II" },
  { id: "3", num: 3, label: "Capítulos III al V — Desarrollo",short: "Caps. III-V" },
  { id: "4", num: 4, label: "Revisión y Compilación",         short: "Revisión" },
  { id: "5", num: 5, label: "Conclusiones y Bibliografía",    short: "Final" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLegacyContent(p: Proyecto, num: number): string | null {
  const map: Record<number, keyof Proyecto> = {
    0:"contenido_fase_0",1:"contenido_fase_1",2:"contenido_fase_2",
    3:"contenido_fase_3",4:"contenido_fase_4",5:"contenido_fase_5",
  };
  return p[map[num]] as string | null;
}

function getFinalContent(p: Proyecto, phaseId: string, legacyNum?: number): string | null {
  if (p.phase_contents && phaseId in p.phase_contents) return p.phase_contents[phaseId];
  if (legacyNum !== undefined) return getLegacyContent(p, legacyNum);
  return null;
}

function getBorrador(p: Proyecto, phaseId: string, legacyNum?: number): string | null {
  const k = `${phaseId}_borrador`;
  if (p.phase_contents && k in p.phase_contents) return p.phase_contents[k];
  if (legacyNum !== undefined) return getLegacyContent(p, legacyNum);
  return null;
}

function countWords(t: string) { return t.trim().split(/\s+/).filter(Boolean).length; }

function renderMd(text: string): string {
  const safe = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return safe
    .replace(/^#### (.+)$/gm,'<h4 class="md-h4">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="md-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong class="md-strong">$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em class="md-em">$1</em>')
    .replace(/^[-*] (.+)$/gm, '<li class="md-li">$1</li>')
    .replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g,'<ul class="md-ul">$1</ul>')
    .replace(/\[COMPLETAR(.*?)\]/gi, '<span class="marker-completar">[COMPLETAR$1]</span>')
    .replace(/\n\n+/g,'</p><p class="md-p">')
    .replace(/\n/g,'<br/>')
    .replace(/^/,'<p class="md-p">') + '</p>';
}

// Assembles all final phases into a document HTML for the PDF preview panel
function buildDocPreview(proyecto: Proyecto, displayFases: typeof FASES_STATIC, university: University | null, pdfData: StudentCoverData): string {
  const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || "Sin título";
  const chunks: string[] = [];
  for (const f of displayFases) {
    const content = getFinalContent(proyecto, f.id, (f as typeof FASES_STATIC[0]).num);
    if (!content) continue;
    chunks.push(
      `<div class="doc-chapter">` +
      `<h2 class="doc-ch-title">${f.label}</h2>` +
      `<div class="doc-ch-body">${renderMd(content)}</div>` +
      `</div>`
    );
  }
  if (chunks.length === 0) return "";
  
  let coverHtml = "";
  let cssStr = "";
  if (university) {
    coverHtml = `<div style="transform: scale(0.65); transform-origin: top center; margin-bottom: -30vh;">${getHtmlCover(university, pdfData, titulo)}</div><hr class="doc-ch-sep"/>`;
    cssStr = `<style>${buildCss(university).replace(/@page/g, '@media print { @page')}</style>`; // Scope @page to print only so it doesn't break the UI
  }

  return `
    ${cssStr}
    <div class="doc-root">
      ${coverHtml}
      <h1 class="doc-main-title">${titulo.replace(/</g,"&lt;")}</h1>
      <hr class="doc-hr"/>
      ${chunks.join('<hr class="doc-ch-sep"/>')}
    </div>`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const proyectoId = params.id as string;

  const [user, setUser] = useState<SessionUser | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFase, setSelectedFase] = useState(0);

  const [phaseDefs, setPhaseDefs] = useState<PhaseDef[]>([]);
  const [isDynamic, setIsDynamic] = useState(false);

  const displayFases = isDynamic && phaseDefs.length > 0
    ? phaseDefs
    : FASES_STATIC;

  const [university, setUniversity] = useState<University | null>(null);
  const [pdfData, setPdfData] = useState<StudentCoverData>({
    nombre: "", mes: MESES[new Date().getMonth()],
    anio: String(new Date().getFullYear()),
    programa: "", version: "", tutor: "", carrera: "",
  });
  const [showCoverSettings, setShowCoverSettings] = useState(false);

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const [feedbackTexto, setFeedbackTexto] = useState("");
  const [vistaActiva, setVistaActiva] = useState<"borrador" | "final">("borrador");

  // Missing data marker state
  const [replacementValue, setReplacementValue] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  // Calibration
  const [showCalibracion, setShowCalibracion] = useState(false);
  const [calibPreguntas, setCalibPreguntas] = useState<CalibracionPregunta[]>([]);
  const [calibRespuestas, setCalibRespuestas] = useState<Record<string, string>>({});
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);

  // PDF right panel
  const [showPdfPanel, setShowPdfPanel] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const [meRes, projRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/projects/${proyectoId}`),
        ]);
        const meData = await meRes.json();
        if (!meData.user) { router.replace("/login"); return; }
        setUser(meData.user);
        if (!projRes.ok) { router.replace("/dashboard"); return; }
        const proj: Proyecto = (await projRes.json()).proyecto;
        setProyecto(proj);

        if (proj.modalidad_creacion === "guiada" && !proj.perfil_estilo_usuario) {
          setShowCalibracion(true);
          const qRes = await fetch(`/api/admin/calibration-questions?servicio_id=${proj.servicio_id ?? "mono-001"}`);
          if (qRes.ok) setCalibPreguntas((await qRes.json()).preguntas ?? []);
        }

        try {
          const phRes = await fetch(`/api/admin/phase-definitions?servicio_id=${proj.servicio_id ?? "mono-001"}`);
          if (phRes.ok) {
            const phData = await phRes.json();
            if (!phData.is_default && phData.phases?.length > 0) {
              const defs: PhaseDef[] = phData.phases.map((p: { id: string; label: string; short_label: string; orden: number }) => ({
                id: p.id, label: p.label, short: p.short_label, orden: p.orden,
              }));
              setIsDynamic(true); setPhaseDefs(defs);
              const lastDone = defs.reduce((acc: number, p, i) =>
                (proj.phase_contents?.[p.id] ?? null) ? i : acc, 0);
              setSelectedFase(lastDone);
            } else { setSelectedFase(proj.estado_fase); }
          } else { setSelectedFase(proj.estado_fase); }
        } catch { setSelectedFase(proj.estado_fase); }

        if (proj.universidad_id) {
          try {
            const univRes = await fetch("/api/admin/universities");
            if (univRes.ok) {
              const univList: University[] = await univRes.json();
              const found = univList.find(u => u.id === proj.universidad_id);
              if (found) setUniversity(found);
            }
          } catch { /* no-op */ }
        }
      } catch { router.replace("/dashboard"); }
      finally { setLoading(false); }
    }
    load();
  }, [proyectoId, router]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);
  useEffect(() => { setFeedbackTexto(""); setVistaActiva("borrador"); }, [selectedFase]);

  // ── Calibration ───────────────────────────────────────────────────────────────

  async function submitCalibracion() {
    if (!proyecto) return;
    const respuestas = calibPreguntas
      .filter(q => calibRespuestas[q.id]?.trim())
      .map(q => ({ pregunta: q.pregunta, respuesta: calibRespuestas[q.id] }));
    if (respuestas.length === 0) { setShowCalibracion(false); return; }
    setIsAnalyzingStyle(true);
    try {
      const res = await fetch("/api/projects/analyze-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyecto_id: proyectoId, respuestas }),
      });
      const data = await res.json();
      if (res.ok && data.perfil_estilo_usuario) {
        setProyecto(prev => prev ? { ...prev, perfil_estilo_usuario: data.perfil_estilo_usuario } : prev);
      }
    } catch { /* non-critical */ }
    setIsAnalyzingStyle(false);
    setShowCalibracion(false);
  }

  // ── Generate ──────────────────────────────────────────────────────────────────

  const generarFase = useCallback(async (opts: {
    mensajeOverride?: string;
    tipo?: "borrador" | "final";
    feedback?: string;
  } = {}) => {
    if (!proyecto || isGenerating) return;
    setIsGenerating(true); setError("");
    const { mensajeOverride, tipo: tipoOpt, feedback } = opts;
    const esGuiado = proyecto.modalidad_creacion === "guiada";
    const tipo: "borrador" | "final" = tipoOpt ?? (esGuiado ? "borrador" : "final");
    const userMsg = mensajeOverride ?? chatInput.trim();
    if (userMsg && !feedback) {
      setChatMsgs(prev => [...prev, { role: "user", text: userMsg, ts: Date.now() }]);
      if (!mensajeOverride) setChatInput("");
    }
    const faseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
    const body = isDynamic
      ? { proyecto_id: proyectoId, phase_id: faseDef.id, mensaje_usuario: userMsg || undefined, tipo, feedback_usuario: feedback || undefined }
      : { proyecto_id: proyectoId, fase_numero: selectedFase, mensaje_usuario: userMsg || undefined, tipo, feedback_usuario: feedback || undefined };
    // Setup AbortController for cancellation
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/projects/generate-phase", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        setChatMsgs(prev => [...prev, { role: "assistant", text: `⚠️ ${data.error || "Error al generar."}`, ts: Date.now() }]);
        return;
      }
      setProyecto(prev => {
        if (!prev) return prev;
        const np = { ...prev };
        if (isDynamic) {
          if (tipo === "borrador") {
            np.phase_contents = { ...(prev.phase_contents ?? {}), [`${faseDef.id}_borrador`]: data.contenido };
          } else {
            np.phase_contents = { ...(prev.phase_contents ?? {}), [faseDef.id]: data.contenido };
          }
        } else {
          const pk = String(selectedFase);
          if (tipo === "borrador") {
            np.phase_contents = { ...(prev.phase_contents ?? {}), [`${pk}_borrador`]: data.contenido };
          } else {
            const legacyKey = `contenido_fase_${selectedFase}` as keyof Proyecto;
            np[legacyKey] = data.contenido as never;
            np.estado_fase = Math.max(prev.estado_fase, selectedFase);
            np.phase_contents = { ...(prev.phase_contents ?? {}), [pk]: data.contenido };
          }
        }
        if (data.requiere_actualizacion) np.requiere_actualizacion = data.requiere_actualizacion;
        return np;
      });
      if (tipo === "borrador") setVistaActiva("borrador");
      else { setVistaActiva("final"); setFeedbackTexto(""); }
      if (userMsg && !feedback) {
        setChatMsgs(prev => [...prev, {
          role: "assistant",
          text: tipo === "final"
            ? "✅ Versión final generada."
            : "📝 Borrador generado. Revísalo y deja tu feedback.",
          ts: Date.now(),
        }]);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setChatMsgs(prev => [...prev, { role: "assistant", text: "⏹ Generación cancelada.", ts: Date.now() }]);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [proyecto, isGenerating, chatInput, selectedFase, proyectoId, isDynamic, displayFases]);

  const cancelGeneracion = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── Replace Marker ────────────────────────────────────────────────────────────

  async function handleReplaceMarker() {
    if (!proyecto || !displayContent || !replacementValue.trim()) return;
    setIsReplacing(true);
    try {
      const newContent = displayContent.replace(/\[COMPLETAR(.*?)\]/i, replacementValue.trim());
      
      const isDraft = (esGuiado && vistaActiva === "borrador");
      const phaseId = currentFaseDef.id;
      const keyStr = isDynamic
        ? (isDraft ? `${phaseId}_borrador` : phaseId)
        : (isDraft ? `${selectedFase}_borrador` : String(selectedFase));
      
      const payload: any = { phase_contents: { ...proyecto.phase_contents, [keyStr]: newContent } };
      
      // If it's the final version and static, also update the legacy fields
      if (!isDynamic && !isDraft) {
        payload[`contenido_fase_${selectedFase}`] = newContent;
      }
      
      const res = await fetch(`/api/projects/${proyectoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Error al guardar el dato");
      
      setProyecto(prev => {
        if (!prev) return prev;
        const np = { ...prev, phase_contents: { ...prev.phase_contents, [keyStr]: newContent } };
        if (!isDynamic && !isDraft) {
          np[`contenido_fase_${selectedFase}` as keyof Proyecto] = newContent as never;
        }
        return np;
      });
      setReplacementValue("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsReplacing(false);
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    const form = new FormData(); form.append("file", file); form.append("proyecto_id", proyectoId);
    try {
      const res = await fetch("/api/projects/upload-document", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMsgs(prev => [...prev, { role: "assistant", text: `📎 "${data.documento.nombre}" subido — ${data.documento.palabras} palabras extraídas.`, ts: Date.now() }]);
    } catch (e) { setError((e as Error).message); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  // ── LaTeX download ────────────────────────────────────────────────────────────

  async function descargarLatex() {
    setIsDownloading(true);
    try {
      const q = new URLSearchParams({
        nombre: pdfData.nombre,
        mes: pdfData.mes,
        anio: pdfData.anio,
        tutor: pdfData.tutor ?? "",
        programa: pdfData.programa ?? "",
        version: pdfData.version ?? "",
        carrera: pdfData.carrera ?? ""
      });
      const res = await fetch(`/api/projects/${proyectoId}/latex?${q.toString()}`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1] ?? "proyecto.tex";
      a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    } catch (e) { setError((e as Error).message); }
    finally { setIsDownloading(false); }
  }

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="gradient-bg" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
      </div>
    );
  }
  if (!proyecto) return null;

  const esGuiado = proyecto.modalidad_creacion === "guiada";
  const currentFaseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
  const phaseId = currentFaseDef.id;
  const legacyNum = (currentFaseDef as typeof FASES_STATIC[0]).num;
  const finalContent = getFinalContent(proyecto, phaseId, legacyNum);
  const borradorContent = getBorrador(proyecto, phaseId, legacyNum);
  const hasBorrador = Boolean(borradorContent);
  const hasFinal = Boolean(finalContent);
  const displayContent = esGuiado
    ? (vistaActiva === "final" && hasFinal ? finalContent : (hasBorrador ? borradorContent : null))
    : finalContent;
  const fasesCompletadas = displayFases.filter(f => Boolean(getFinalContent(proyecto, f.id, (f as typeof FASES_STATIC[0]).num))).length;
  const needsUpdate = Boolean(proyecto.requiere_actualizacion?.[isDynamic ? phaseId : String(selectedFase)]);
  const docHtml = buildDocPreview(proyecto, displayFases as typeof FASES_STATIC, university, pdfData);

  // Missing data analysis
  const markerRegex = /\[COMPLETAR(.*?)\]/gi;
  const markerMatch = displayContent ? displayContent.match(markerRegex) : null;
  const numMarkers = markerMatch ? markerMatch.length : 0;
  const hasMarkers = numMarkers > 0;
  const firstMarkerText = hasMarkers ? markerMatch![0] : "";

  // ── Calibration fullscreen ────────────────────────────────────────────────────

  if (showCalibracion) {
    const allOk = calibPreguntas.every(q => countWords(calibRespuestas[q.id] ?? "") >= q.minimo_palabras);
    return (
      <div style={{ height:"100vh", background:"transparent", color:"var(--fg-primary)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", overflow:"auto" }}>
        <div style={{ width:"100%", maxWidth:680 }}>
          <div style={{ marginBottom:28, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12, color:"#a78bfa" }}></div>
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Calibración de Estilo</h1>
            <p style={{ color:"var(--fg-muted)", fontSize:14, lineHeight:1.6, maxWidth:480, margin:"0 auto" }}>
              Responde estas preguntas para que la IA aprenda tu estilo de escritura. Cuanto más detallado, más personalizado será el resultado.
            </p>
          </div>
          {proyecto.tema_aprobado && (
            <div style={{ padding:"10px 14px", background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:8, marginBottom:24, fontSize:13, color:"#a78bfa" }}>
              <strong>Tema:</strong> {proyecto.tema_aprobado}
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:20, marginBottom:28 }}>
            {calibPreguntas.map((q, i) => {
              const words = countWords(calibRespuestas[q.id] ?? "");
              const ok = words >= q.minimo_palabras;
              return (
                <div key={q.id} style={{ background:"rgba(255, 255, 255, 0.3)", border:"1px solid var(--border)", borderRadius:10, padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                    <span style={{ flexShrink:0, width:22, height:22, borderRadius:"50%", background:"rgba(167,139,250,0.15)", border:"1px solid rgba(167,139,250,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#a78bfa" }}>{i+1}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:q.descripcion?4:0 }}>{q.pregunta}</div>
                      {q.descripcion && <div style={{ fontSize:12, color:"var(--fg-muted)" }}>{q.descripcion}</div>}
                    </div>
                  </div>
                  <textarea
                    className="input-dark"
                    rows={4}
                    value={calibRespuestas[q.id] ?? ""}
                    onChange={e => setCalibRespuestas(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={q.placeholder || "Escribe tu respuesta aquí..."}
                    style={{ width:"100%", resize:"vertical", fontSize:13 }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:ok?"#22c55e":"var(--fg-muted)" }}>
                    <span>{words} / {q.minimo_palabras} palabras mínimas</span>
                    {ok && <span>✓ Suficiente</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setShowCalibracion(false)} className="btn-ghost" style={{ flex:1, justifyContent:"center", padding:"12px" }}>
              Omitir por ahora
            </button>
            <button onClick={submitCalibracion} disabled={!allOk || isAnalyzingStyle} className="btn-purple" style={{ flex:2, justifyContent:"center", padding:"12px", opacity:allOk?1:0.5 }}>
              {isAnalyzingStyle
                ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2 }}/><span>Analizando…</span></>
                : "🎓 Analizar mi estilo de escritura →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 3-COLUMN WORKSPACE ────────────────────────────────────────────────────────

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"transparent", color:"var(--fg-primary)", fontFamily:"'Inter', sans-serif" }}>

      {/* HEADER */}
      <header className="flex items-center flex-wrap gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-0 md:h-[52px] shrink-0 border-b border-[var(--border)] relative z-40 bg-[var(--bg-card)]">
        <a href="/dashboard" style={{ color:"var(--fg-muted)", textDecoration:"none", fontSize:18, lineHeight:1 }}>←</a>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--fg-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {proyecto.tema_aprobado || proyecto.titulo_provisional || "Proyecto sin título"}
          </div>
          <div style={{ fontSize:11, color:"var(--fg-secondary)", display:"flex", alignItems:"center", gap:6, flexWrap: "wrap" }}>
            <span>{proyecto.servicios?.nombre ?? "Monografía"}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{fasesCompletadas}/{displayFases.length} fases</span>
            {esGuiado && <span style={{ padding:"1px 6px", borderRadius:4, background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.25)", color:"#a78bfa", fontSize:10, fontWeight:600 }}>GUIADO</span>}
            {esGuiado && proyecto.perfil_estilo_usuario && <span style={{ padding:"1px 6px", borderRadius:4, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", color:"#4ade80", fontSize:10 }}>✓ Estilo calibrado</span>}
          </div>
        </div>

        {/* Phase dots */}
        <div className="flex gap-1 md:gap-1.5 items-center overflow-x-auto no-scrollbar w-full md:w-auto order-last md:order-none py-1 md:py-0 border-t border-[var(--bg-subtle)] md:border-t-0 mt-1 md:mt-0">
          {displayFases.map((f, idx) => {
            const fId = f.id;
            const done = Boolean(getFinalContent(proyecto, fId, (f as typeof FASES_STATIC[0]).num));
            const hasBorr = Boolean(getBorrador(proyecto, fId, (f as typeof FASES_STATIC[0]).num));
            const needsUpd = Boolean(proyecto.requiere_actualizacion?.[isDynamic ? fId : String(idx)]);
            const sel = idx === selectedFase;
            return (
              <button key={f.id} onClick={() => setSelectedFase(idx)} title={f.label + (needsUpd ? " — ⚠️ Desactualizado" : "")}
                className="shrink-0"
                style={{
                  width:26, height:26, borderRadius:"50%", fontSize:9, fontWeight:700, cursor:"pointer",
                  border: sel ? "2px solid var(--accent)" : needsUpd ? "2px solid #f59e0b" : done ? "2px solid #22c55e" : hasBorr ? "2px solid #a78bfa" : "2px solid var(--border)",
                  background: sel ? "rgba(37,99,235,0.2)" : needsUpd ? "rgba(245,158,11,0.1)" : done ? "rgba(34,197,94,0.08)" : "transparent",
                  color: sel ? "var(--accent)" : needsUpd ? "#f59e0b" : done ? "#4ade80" : hasBorr ? "#a78bfa" : "var(--fg-secondary)",
                  display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s",
                }}>
                {needsUpd ? "!" : done ? "✓" : hasBorr ? "~" : idx}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPdfPanel(v => !v)} className="btn-ghost" style={{ fontSize:11, padding:"5px 10px", gap:4, display:"flex", alignItems:"center" }}>
            {showPdfPanel ? "✕ PDF" : "📄 PDF"}
          </button>
          {fasesCompletadas > 0 && (
            <button onClick={descargarLatex} disabled={isDownloading} className="btn-ghost" style={{ fontSize:11, padding:"5px 10px", display:"flex", alignItems:"center", gap:4 }}>
              {isDownloading ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/> : "⬇️"}<span>.tex</span>
            </button>
          )}
          {user?.role === "admin" && (
            <a href="/admin" style={{ textDecoration:"none" }}>
              <button className="btn-purple" style={{ padding:"5px 10px", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>⚡ Admin</button>
            </a>
          )}
        </div>
      </header>

      {/* 3-COLUMN BODY */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden relative w-full">

        {/* ── COL 1: CHAT & GENERATION (fixed 360px on desktop) ── */}
        <div className="w-full xl:w-[360px] shrink-0 flex flex-col border-b xl:border-b-0 xl:border-r border-[var(--border)] shadow-sm relative z-40 bg-[var(--bg-card)] min-h-[500px] xl:min-h-0">
          
          {/* Phase label */}
          <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--bg-subtle)" }}>
            <div style={{ fontSize:10, color:"var(--accent)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:2 }}>{currentFaseDef.short}</div>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--fg-primary)", lineHeight:1.3 }}>{currentFaseDef.label}</div>
          </div>

          {/* Warnings */}
          {needsUpdate && (
            <div style={{ margin:"8px 14px 0", padding:"8px 12px", background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:7, fontSize:11, color:"#fbbf24", lineHeight:1.5 }}>
              ⚠️ Una fase anterior fue modificada. Regenera para mantener coherencia.
            </div>
          )}
          {error && (
            <div style={{ margin:"8px 14px 0", padding:"8px 12px", background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:6, fontSize:11, color:"#f87171", display:"flex", justifyContent:"space-between" }}>
              <span style={{ flex:1, lineHeight:1.5 }}>{error}</span>
              <button onClick={() => setError("")} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer" }}>×</button>
            </div>
          )}

          {/* ── Generate buttons block ── */}
          <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--bg-subtle)", display:"flex", flexDirection:"column", gap:8 }}>
            {/* GUIADO: no borrador yet */}
              {esGuiado && !hasBorrador && !hasFinal && (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => generarFase({ tipo:"borrador" })} disabled={isGenerating} className="btn-purple" style={{ flex:1, justifyContent:"center", padding:"10px", fontSize:12 }}>
                    {isGenerating ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/><span>Generando borrador…</span></> : `Generar Borrador — ${currentFaseDef.short}`}
                  </button>
                  {isGenerating && (
                    <button onClick={cancelGeneracion} className="btn-ghost" style={{ padding:"10px 16px", fontSize:11, color:"#ef4444" }}>
                      Cancelar
                    </button>
                  )}
                </div>
              )}

            {/* GUIADO: has borrador, needs final */}
            {esGuiado && hasBorrador && !hasFinal && (
              <>
                <div style={{ fontSize:10, color:"#a78bfa", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Borrador listo — añade feedback</div>
                <textarea
                  className="input-dark"
                  rows={2}
                  value={feedbackTexto}
                  onChange={e => setFeedbackTexto(e.target.value)}
                  placeholder="Ej: Ampliar antecedentes, ajustar tono más formal..."
                  style={{ resize:"vertical", fontSize:11 }}
                />
                <div style={{ display:"flex", gap:7 }}>
                  <button onClick={() => generarFase({ tipo:"final", feedback: feedbackTexto || undefined })} disabled={isGenerating || (hasMarkers && vistaActiva === "borrador")} className="btn-cyan" style={{ flex:1, justifyContent:"center", padding:"9px", fontSize:11, opacity: (hasMarkers && vistaActiva === "borrador") ? 0.5 : 1 }}>
                    {isGenerating ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/><span>Generando final…</span></> : ((hasMarkers && vistaActiva === "borrador") ? "Completa datos para avanzar" : "Generar Versión Final")}
                  </button>
                  {isGenerating ? (
                    <button onClick={cancelGeneracion} className="btn-ghost" style={{ padding:"9px 11px", fontSize:11, color:"#ef4444" }}>
                      Cancelar
                    </button>
                  ) : (
                    <button onClick={() => generarFase({ tipo:"borrador" })} className="btn-ghost" style={{ padding:"9px 11px", fontSize:11 }} title="Regenerar borrador">🔄</button>
                  )}
                </div>
              </>
            )}

            {/* GUIADO: has final — vista toggle */}
            {esGuiado && hasFinal && (
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setVistaActiva("borrador")} style={{ flex:1, padding:"7px", fontSize:10, fontWeight:600, borderRadius:6, cursor:"pointer", background: vistaActiva==="borrador"?"rgba(167,139,250,0.15)":"transparent", border: vistaActiva==="borrador"?"1px solid rgba(167,139,250,0.4)":"1px solid var(--border)", color: vistaActiva==="borrador"?"#a78bfa":"var(--fg-secondary)" }}>📝 Borrador</button>
                <button onClick={() => setVistaActiva("final")} style={{ flex:1, padding:"7px", fontSize:10, fontWeight:600, borderRadius:6, cursor:"pointer", background: vistaActiva==="final"?"rgba(37,99,235,0.15)":"transparent", border: vistaActiva==="final"?"1px solid rgba(37,99,235,0.4)":"1px solid var(--border)", color: vistaActiva==="final"?"var(--accent)":"var(--fg-secondary)" }}>✨ Final</button>
              </div>
            )}

            {/* DIRECTO: no final yet */}
            {!esGuiado && !hasFinal && (
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => generarFase()} disabled={isGenerating} className="btn-cyan" style={{ flex:1, justifyContent:"center", padding:"10px", fontSize:12 }}>
                  {isGenerating ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/><span>Generando…</span></> : `Generar ${currentFaseDef.short}`}
                </button>
                {isGenerating && (
                  <button onClick={cancelGeneracion} className="btn-ghost" style={{ padding:"10px 16px", fontSize:11, color:"#ef4444" }}>
                    Cancelar
                  </button>
                )}
              </div>
            )}

            <div style={{ marginTop: 8, padding: "10px", background: "rgba(167,139,250,0.05)", border: "1px dashed rgba(167,139,250,0.3)", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: "var(--fg-secondary)", marginBottom: 8, textAlign: "center", lineHeight: 1.4 }}>
                <strong>Insumos de Información:</strong> Sube PDFs o textos (papers, datos) en cualquier fase para que la IA los use como base teórica o analítica.
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-ghost" style={{ width:"100%", fontSize:11, padding:"7px", justifyContent:"center", background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
                {isUploading ? "Analizando y Subiendo…" : "📎 Adjuntar PDF / TXT"}
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleUpload} style={{ display:"none" }} />
            </div>
          </div>

          {/* Chat messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"8px 14px", display:"flex", flexDirection:"column", gap:7 }}>
            {chatMsgs.length === 0 && (
              <div style={{ color:"var(--border-hover)", fontSize:11, textAlign:"center", padding:"20px 0", lineHeight:1.6 }}>
                {displayContent ? "Contenido generado.\nPide modificaciones aquí." : "Genera la fase o envía instrucciones."}
              </div>
            )}
            {chatMsgs.map((msg, i) => (
              <div key={i} style={{ padding:"8px 10px", borderRadius:7, fontSize:11, background: msg.role==="user"?"rgba(79,70,229,0.14)":"rgba(37,99,235,0.07)", border: msg.role==="user"?"1px solid rgba(79,70,229,0.22)":"1px solid rgba(37,99,235,0.1)", alignSelf: msg.role==="user"?"flex-end":"flex-start", maxWidth:"94%" }}>
                <div style={{ fontWeight:700, fontSize:10, color: msg.role==="user"?"var(--accent)":"var(--accent)", marginBottom:3 }}>{msg.role==="user"?"Tú":"IA"}</div>
                <div style={{ color:"var(--fg-primary)", lineHeight:1.5 }}>{msg.text}</div>
              </div>
            ))}
            {isGenerating && (
              <div style={{ padding:"8px 10px", borderRadius:7, background:"rgba(37,99,235,0.05)", border:"1px solid rgba(37,99,235,0.08)", alignSelf:"flex-start" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {[0,1,2].map(i => <div key={i} className="pulse-dot" style={{ width:5, height:5, borderRadius:"50%", background:"var(--accent)", animationDelay:`${i*0.2}s` }}/>)}
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* Chat input + navigation */}
          <div style={{ padding:"8px 14px", borderTop:"1px solid var(--bg-subtle)", background:"rgba(255, 255, 255, 0.2)" }}>
            <div style={{ display:"flex", gap:6, marginBottom: displayContent ? 6 : 0 }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter" && (e.ctrlKey||e.metaKey) && chatInput.trim()) generarFase({ mensajeOverride: chatInput.trim() }); }}
                placeholder="Instrucciones a la IA… (Ctrl+Enter)"
                rows={2} disabled={isGenerating} className="input-dark"
                style={{ flex:1, resize:"none", fontSize:11 }}
              />
              <button onClick={() => { if (chatInput.trim()) generarFase({ mensajeOverride: chatInput.trim() }); }} disabled={isGenerating || !chatInput.trim()}
                style={{ width:36, flexShrink:0, background: isGenerating||!chatInput.trim()?"var(--bg-subtle)":"var(--accent)", border:"1px solid rgba(37,99,235,0.2)", borderRadius:7, cursor: isGenerating||!chatInput.trim()?"not-allowed":"pointer", color:"#fff", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {isGenerating ? <div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/> : "↑"}
              </button>
            </div>
            {displayContent && (
              <div style={{ display:"flex", gap:6 }}>
                {selectedFase > 0 && <button onClick={() => setSelectedFase(f => f-1)} className="btn-ghost" style={{ flex:1, fontSize:10, padding:"5px 6px", justifyContent:"center" }}>← {displayFases[selectedFase-1]?.short}</button>}
                {selectedFase < displayFases.length-1 && <button onClick={() => setSelectedFase(f => f+1)} disabled={hasMarkers} className={hasMarkers ? "btn-ghost" : "btn-cyan"} style={{ flex:1, fontSize:10, padding:"5px 6px", justifyContent:"center", cursor: hasMarkers ? "not-allowed" : "pointer" }} title={hasMarkers ? "Faltan datos por completar" : ""}>{displayFases[selectedFase+1]?.short} →</button>}
              </div>
            )}
          </div>
        </div>

        {/* ── COL 2: CONTENT VIEWER (flex) ── */}
        <div className="flex-1 overflow-y-auto bg-transparent p-4 md:p-8 relative z-10 min-h-[600px] xl:min-h-0">
          {displayContent ? (
            <div className="fade-in max-w-[880px] mx-auto p-5 md:p-8 lg:p-10 pb-12 lg:pb-16 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--shadow-md)] relative overflow-hidden">
              {/* Inner wrapper */}
              <div style={{ marginBottom:24, paddingBottom:14, borderBottom:"1px solid var(--bg-subtle)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:"var(--accent)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:4 }}>{currentFaseDef.short}</div>
                    <h1 style={{ fontSize:22, fontWeight:800, color:"var(--fg-primary)", margin:0, lineHeight:1.3 }}>{currentFaseDef.label}</h1>
                  </div>
                  {esGuiado && (vistaActiva==="final" && hasFinal
                    ? <span className="badge badge-cyan">Versión Final</span>
                    : <span style={{ padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.3)", color:"#a78bfa" }}>Borrador</span>
                  )}
                  {!esGuiado && hasFinal && <span className="badge badge-green">✓ Generado</span>}
                </div>
                {needsUpdate && (
                  <div style={{ marginTop:8, padding:"7px 10px", background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:5, fontSize:11, color:"#fbbf24" }}>
                    Contenido desactualizado — regenera para mantener coherencia.
                  </div>
                )}
              </div>

              {/* Data Replacement Panel */}
              {hasMarkers && (
                <div style={{ marginBottom: 24, padding: "16px 20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>🛑</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Acción Requerida: Faltan {numMarkers} dato{numMarkers > 1 ? "s" : ""} por completar
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                    La IA ha dejado marcadores indicados como <strong style={{ color: "#fbbf24", background: "rgba(245,158,11,0.2)", padding: "2px 4px", borderRadius: 4 }}>{firstMarkerText}</strong>. Ingresa el valor real de la investigación para el primer marcador:
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input 
                      className="input-dark" 
                      value={replacementValue} 
                      onChange={e => setReplacementValue(e.target.value)} 
                      onKeyDown={e => { if (e.key === "Enter" && replacementValue.trim()) handleReplaceMarker(); }}
                      placeholder="Ej: 25%, Aduana Nacional, $us 50,000, etc." 
                      style={{ flex: 1, fontSize: 12 }} 
                      disabled={isReplacing}
                    />
                    <button 
                      onClick={handleReplaceMarker} 
                      disabled={!replacementValue.trim() || isReplacing}
                      className="btn-purple" 
                      style={{ padding: "8px 16px", fontSize: 12, opacity: (!replacementValue.trim() || isReplacing) ? 0.5 : 1 }}
                    >
                      {isReplacing ? <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/> Guardando...</> : "Guardar e inyectar dato →"}
                    </button>
                  </div>
                </div>
              )}

              <style>{`
                .md-h1{font-size:22px;font-weight:800;color:#f1f5f9;margin:24px 0 10px;line-height:1.3}
                .md-h2{font-size:17px;font-weight:700;color:var(--fg-primary);margin:20px 0 9px;line-height:1.4}
                .md-h3{font-size:14px;font-weight:700;color:var(--fg-primary);margin:15px 0 7px}
                .md-h4{font-size:12px;font-weight:700;color:var(--fg-muted);margin:10px 0 5px}
                .md-p{margin:9px 0;color:var(--fg-primary);line-height:1.85;font-size:15px;font-family:var(--font-crimson), serif}
                .md-strong{color:var(--accent);font-weight:700}
                .md-em{color:var(--fg-muted);font-style:italic}
                .md-ul{margin:9px 0;padding-left:20px}
                .md-li{color:var(--fg-primary);margin:4px 0;line-height:1.65;font-size:15px;font-family:var(--font-crimson), serif}
                .marker-completar {
                  background: rgba(245,158,11,0.2);
                  color: #fbbf24;
                  padding: 2px 6px;
                  border-radius: 4px;
                  border: 1px dashed #fbbf24;
                  font-weight: 700;
                  font-size: 0.9em;
                  display: inline-block;
                  line-height: 1.2;
                  animation: pulse-orange 2s infinite;
                }
                @keyframes pulse-orange {
                  0% { box-shadow: 0 0 0 0 rgba(245,158,11, 0.4); }
                  70% { box-shadow: 0 0 0 6px rgba(245,158,11, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(245,158,11, 0); }
                }
              `}</style>
              <div className="doc-preview" dangerouslySetInnerHTML={{ __html: renderMd(displayContent) }} style={{ fontSize:13.5, lineHeight:1.85 }}/>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"10vh auto", maxWidth: 400, padding:"50px 30px", borderRadius: 16, gap:12, background:"var(--bg-card)", border:"1px solid var(--border)", boxShadow:"var(--shadow-md)" }}>
              <div style={{ fontSize:48, opacity:0.3 }}>📄</div>
              <div style={{ fontSize:15, fontWeight:700, color:"var(--border)" }}>{currentFaseDef.label}</div>
              <div style={{ fontSize:12, color:"var(--fg-primary)", textAlign:"center", maxWidth:240, lineHeight:1.6 }}>
                {esGuiado ? "Genera el borrador para iniciar el proceso guiado." : "Usa el panel izquierdo para generar el contenido."}
              </div>
            </div>
          )}
        </div>

        {/* ── COL 3: PDF PREVIEW (fixed 340px on desktop, toggleable) ── */}
        {showPdfPanel && (
          <div className="w-full xl:w-[340px] shrink-0 flex flex-col border-t xl:border-t-0 xl:border-l border-[var(--border)] shadow-sm relative z-40 bg-[var(--bg-card)] min-h-[500px] xl:min-h-0">
            {/* Panel header */}
            <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--bg-subtle)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--fg-muted)" }}>Vista Previa del Documento</div>
                <div style={{ fontSize:10, color:"var(--border-hover)", marginTop:1 }}>
                  {fasesCompletadas} capítulo{fasesCompletadas !== 1 ? "s" : ""} finalizados
                </div>
              </div>
              {university && (
                <div style={{ fontSize:10, color:"var(--fg-secondary)", textAlign:"right", maxWidth:120, lineHeight:1.4 }}>
                  {university.name}
                </div>
              )}
            </div>

            {/* Document preview */}
            <div style={{ flex:1, overflowY:"auto", padding:"16px 14px" }}>
              {docHtml ? (
                <>
                  <style>{`
                    .doc-root{font-family:'Georgia',serif;color:var(--fg-primary)}
                    .doc-main-title{font-size:14px;font-weight:800;color:var(--fg-primary);text-align:center;margin:0 0 12px;line-height:1.4;padding:10px;background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.12);border-radius:6px}
                    .doc-hr{border:none;border-top:1px solid rgba(37,99,235,0.15);margin:12px 0}
                    .doc-chapter{margin-bottom:20px}
                    .doc-ch-title{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;padding:6px 8px;background:rgba(37,99,235,0.06);border-left:2px solid var(--accent);border-radius:0 4px 4px 0}
                    .doc-ch-body .md-p{font-size:11px;line-height:1.75;margin:6px 0;color:var(--fg-muted)}
                    .doc-ch-body .md-h1,.doc-ch-body .md-h2,.doc-ch-body .md-h3,.doc-ch-body .md-h4{font-size:11px;font-weight:700;color:var(--fg-primary);margin:10px 0 5px}
                    .doc-ch-body .md-strong{color:var(--accent)}
                    .doc-ch-body .md-li{font-size:11px;color:var(--fg-muted);margin:3px 0}
                    .doc-ch-sep{border:none;border-top:1px dashed rgba(255,255,255,0.88);margin:16px 0}
                  `}</style>
                  <div dangerouslySetInnerHTML={{ __html: docHtml }}/>
                </>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:10, padding:"40px 0" }}>
                  <div style={{ fontSize:36, opacity:0.12 }}>📋</div>
                  <div style={{ fontSize:12, color:"var(--border)", textAlign:"center", lineHeight:1.6 }}>
                    Aquí se ensamblará el documento completo a medida que finalizas las fases.
                  </div>
                </div>
              )}
            </div>

            {/* Download actions */}
            {fasesCompletadas > 0 && (
              <div style={{ padding:"10px 14px", borderTop:"1px solid var(--bg-subtle)", display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                <button onClick={() => setShowCoverSettings(true)} className="btn-cyan" style={{ flex:1, fontSize:11, padding:"7px", justifyContent:"center", minWidth: "100%" }}>
                  ⚙️ Configurar Carátula
                </button>
                <button onClick={descargarLatex} disabled={isDownloading} className="btn-ghost" style={{ flex:1, fontSize:11, padding:"7px", justifyContent:"center" }}>
                  {isDownloading ? "…" : "📄 .tex"}
                </button>
                {university && (
                  <button
                    onClick={() => {
                      const phaseContents = Object.fromEntries(
                        displayFases.map(f => [
                          `fase_${(f as typeof FASES_STATIC[0]).num}`,
                          getFinalContent(proyecto, f.id, (f as typeof FASES_STATIC[0]).num)
                        ])
                      );
                      const html = generatePdfHtml({
                        university,
                        studentData: pdfData,
                        phaseContents,
                        titulo: proyecto.tema_aprobado || proyecto.titulo_provisional || "Documento"
                      });
                      const win = window.open("", "_blank");
                      if (win) { win.document.write(html); win.document.close(); win.setTimeout(() => win.print(), 500); }
                    }}
                    className="btn-ghost"
                    style={{ flex:1, fontSize:11, padding:"7px", justifyContent:"center" }}
                  >
                    🖨️ Imprimir
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <GlassModal isOpen={showCoverSettings} onClose={() => setShowCoverSettings(false)} title="Configurar Carátula">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "var(--fg-secondary)", margin: 0 }}>
            Completa los datos para generar tu carátula interactiva y aplicar el formato a tu exportación.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Nombre Completo del Estudiante</label>
            <input className="input-dark" value={pdfData.nombre} onChange={e => setPdfData({ ...pdfData, nombre: e.target.value })} placeholder="Ej. Juan Pérez" />
          </div>
          {(!university || (university.campos_portada || []).includes("tutor")) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Nombre del Tutor/a</label>
              <input className="input-dark" value={pdfData.tutor || ""} onChange={e => setPdfData({ ...pdfData, tutor: e.target.value })} placeholder="Ej. Dra. María Gómez" />
            </div>
          )}
          {(!university || (university.campos_portada || []).includes("programa")) && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Programa (Ej. Educación Superior)</label>
                <input className="input-dark" value={pdfData.programa || ""} onChange={e => setPdfData({ ...pdfData, programa: e.target.value })} placeholder="Educación Superior..." />
              </div>
              {(!university || (university.campos_portada || []).includes("version")) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 120 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Versión</label>
                  <input className="input-dark" value={pdfData.version || ""} onChange={e => setPdfData({ ...pdfData, version: e.target.value })} placeholder="Ej. VII" />
                </div>
              )}
            </div>
          )}
          {(!university || (university.campos_portada || []).includes("carrera")) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Carrera / Especialidad</label>
              <input className="input-dark" value={pdfData.carrera || ""} onChange={e => setPdfData({ ...pdfData, carrera: e.target.value })} placeholder="Ej. Ingeniería de Sistemas" />
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Mes de Presentación</label>
              <select className="input-dark" value={pdfData.mes} onChange={e => setPdfData({ ...pdfData, mes: e.target.value })} style={{ height: 38 }}>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 100 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-primary)" }}>Año</label>
              <input className="input-dark" value={pdfData.anio} onChange={e => setPdfData({ ...pdfData, anio: e.target.value })} placeholder="2026" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button className="btn-cyan" onClick={() => setShowCoverSettings(false)} style={{ padding: "10px 24px" }}>Listo</button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
