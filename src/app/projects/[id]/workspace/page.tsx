"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import type { University } from "@/lib/data";
import { generatePdfHtml, MESES, type StudentCoverData } from "@/lib/pdfTemplate";

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

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
  ts?: number;
}

interface PhaseDef {
  id: string;
  label: string;
  short: string;
  orden: number;
}

interface CalibracionPregunta {
  id: string;
  pregunta: string;
  descripcion?: string;
  minimo_palabras: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FASES_STATIC = [
  { id: "0", num: 0, label: "Planteamiento del Tema", short: "Fase 0" },
  { id: "1", num: 1, label: "Capítulo I — Marco Referencial", short: "Cap. I" },
  { id: "2", num: 2, label: "Capítulo II — Marco Teórico", short: "Cap. II" },
  { id: "3", num: 3, label: "Capítulos III al V — Desarrollo", short: "Caps. III-V" },
  { id: "4", num: 4, label: "Revisión y Compilación", short: "Revisión" },
  { id: "5", num: 5, label: "Conclusiones y Bibliografía", short: "Final" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLegacyContent(proyecto: Proyecto, num: number): string | null {
  const map: Record<number, keyof Proyecto> = {
    0: "contenido_fase_0", 1: "contenido_fase_1", 2: "contenido_fase_2",
    3: "contenido_fase_3", 4: "contenido_fase_4", 5: "contenido_fase_5",
  };
  return proyecto[map[num]] as string | null;
}

function getPhaseContent(proyecto: Proyecto, phaseId: string, legacyNum?: number): string | null {
  if (proyecto.phase_contents && phaseId in proyecto.phase_contents) {
    return proyecto.phase_contents[phaseId];
  }
  if (legacyNum !== undefined) return getLegacyContent(proyecto, legacyNum);
  return null;
}

function getBorradorContent(proyecto: Proyecto, phaseId: string, legacyNum?: number): string | null {
  const borradorKey = `${phaseId}_borrador`;
  if (proyecto.phase_contents && borradorKey in proyecto.phase_contents) {
    return proyecto.phase_contents[borradorKey];
  }
  // For legacy phases in direct mode, borrador and final are the same column
  if (legacyNum !== undefined) return getLegacyContent(proyecto, legacyNum);
  return null;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function renderMd(text: string): string {
  const safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return safe
    .replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^### (.+)$/gm,  '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm,   '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1 class="md-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="md-strong">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em class="md-em">$1</em>')
    .replace(/^[-*] (.+)$/gm,  '<li class="md-li">$1</li>')
    .replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>')
    .replace(/\n\n+/g, '</p><p class="md-p">')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p class="md-p">')
    + '</p>';
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

  const displayFases = isDynamic && phaseDefs.length > 0 ? phaseDefs : FASES_STATIC;

  const [university, setUniversity] = useState<University | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfData, setPdfData] = useState<StudentCoverData>({
    nombre: "",
    mes: MESES[new Date().getMonth()],
    anio: String(new Date().getFullYear()),
    programa: "", version: "", tutor: "", carrera: "",
  });

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  // Borrador/Final state
  const [feedbackTexto, setFeedbackTexto] = useState("");
  const [vistaActiva, setVistaActiva] = useState<"borrador" | "final">("borrador");

  // Calibration
  const [showCalibracion, setShowCalibracion] = useState(false);
  const [calibPreguntas, setCalibPreguntas] = useState<CalibracionPregunta[]>([]);
  const [calibRespuestas, setCalibRespuestas] = useState<Record<string, string>>({});
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);
  const [calibSkipped, setCalibSkipped] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

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
        const projData = await projRes.json();
        const proj: Proyecto = projData.proyecto;
        setProyecto(proj);

        // Show calibration if guiado + no style profile yet + not skipped
        if (proj.modalidad_creacion === "guiada" && !proj.perfil_estilo_usuario) {
          setShowCalibracion(true);
          // Load calibration questions
          const qRes = await fetch(`/api/admin/calibration-questions?servicio_id=${proj.servicio_id ?? "mono-001"}`);
          if (qRes.ok) {
            const qData = await qRes.json();
            setCalibPreguntas(qData.preguntas ?? []);
          }
        }

        // Load dynamic phase definitions
        try {
          const servicio_id = proj.servicio_id ?? "mono-001";
          const phRes = await fetch(`/api/admin/phase-definitions?servicio_id=${servicio_id}`);
          if (phRes.ok) {
            const phData = await phRes.json();
            if (!phData.is_default && phData.phases?.length > 0) {
              const defs: PhaseDef[] = phData.phases.map((p: { id: string; label: string; short_label: string; orden: number }) => ({
                id: p.id, label: p.label, short: p.short_label, orden: p.orden,
              }));
              setIsDynamic(true);
              setPhaseDefs(defs);
              const lastDone = defs.reduce((acc: number, p, i) =>
                (proj.phase_contents?.[p.id] ?? null) ? i : acc, 0);
              setSelectedFase(lastDone);
            } else {
              setSelectedFase(Math.min(proj.estado_fase, 5));
            }
          } else {
            setSelectedFase(Math.min(proj.estado_fase, 5));
          }
        } catch {
          setSelectedFase(Math.min(proj.estado_fase, 5));
        }

        // Load university for PDF formatting
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
      } catch {
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [proyectoId, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs]);

  // When switching phases, reset feedback and vista
  useEffect(() => {
    setFeedbackTexto("");
    setVistaActiva("borrador");
  }, [selectedFase]);

  // ── Calibration submit ───────────────────────────────────────────────────────

  async function submitCalibracion() {
    if (!proyecto) return;
    const respuestas = calibPreguntas
      .filter(q => calibRespuestas[q.id]?.trim())
      .map(q => ({ pregunta: q.pregunta, respuesta: calibRespuestas[q.id] }));

    if (respuestas.length === 0) {
      setCalibSkipped(true);
      setShowCalibracion(false);
      return;
    }

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

  // ── Generate ─────────────────────────────────────────────────────────────────

  const generarFase = useCallback(async (opts: {
    mensajeOverride?: string;
    tipo?: "borrador" | "final";
    feedback?: string;
  } = {}) => {
    if (!proyecto || isGenerating) return;
    setIsGenerating(true);
    setError("");

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
      ? {
          proyecto_id: proyectoId,
          phase_id: faseDef.id,
          mensaje_usuario: userMsg || undefined,
          tipo,
          feedback_usuario: feedback || undefined,
        }
      : {
          proyecto_id: proyectoId,
          fase_numero: selectedFase,
          mensaje_usuario: userMsg || undefined,
          tipo,
          feedback_usuario: feedback || undefined,
        };

    try {
      const res = await fetch("/api/projects/generate-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.guardian
          ? `Guardián IA: ${data.razon || data.error}`
          : (data.error || "Error al generar.");
        setChatMsgs(prev => [...prev, { role: "assistant", text: `⚠️ ${msg}`, ts: Date.now() }]);
        return;
      }

      setProyecto(prev => {
        if (!prev) return prev;
        const newProj = { ...prev };

        if (isDynamic) {
          const borradorKey = `${faseDef.id}_borrador`;
          if (tipo === "borrador") {
            newProj.phase_contents = { ...(prev.phase_contents ?? {}), [borradorKey]: data.contenido };
          } else {
            newProj.phase_contents = { ...(prev.phase_contents ?? {}), [faseDef.id]: data.contenido };
          }
        } else {
          const phaseKey = String(selectedFase);
          const borradorKey = `${phaseKey}_borrador`;
          if (tipo === "borrador") {
            newProj.phase_contents = { ...(prev.phase_contents ?? {}), [borradorKey]: data.contenido };
          } else {
            const legacyKey = `contenido_fase_${selectedFase}` as keyof Proyecto;
            const nuevaFase = Math.max(prev.estado_fase, selectedFase);
            newProj[legacyKey] = data.contenido as never;
            newProj.estado_fase = nuevaFase;
            newProj.phase_contents = { ...(prev.phase_contents ?? {}), [phaseKey]: data.contenido };
          }
        }

        if (data.requiere_actualizacion) {
          newProj.requiere_actualizacion = data.requiere_actualizacion;
        }

        return newProj;
      });

      // After generation, switch vista to show what was just generated
      if (tipo === "borrador") {
        setVistaActiva("borrador");
      } else {
        setVistaActiva("final");
        setFeedbackTexto("");
      }

      if (userMsg && !feedback) {
        setChatMsgs(prev => [...prev, {
          role: "assistant",
          text: tipo === "final"
            ? "✅ Versión final generada. Revisa el panel derecho."
            : "📝 Borrador generado. Revísalo y deja tu feedback para generar la versión final.",
          ts: Date.now(),
        }]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [proyecto, isGenerating, chatInput, selectedFase, proyectoId, isDynamic, displayFases]);

  // ── Upload ────────────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("proyecto_id", proyectoId);
    try {
      const res = await fetch("/api/projects/upload-document", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMsgs(prev => [...prev, {
        role: "assistant",
        text: `📎 "${data.documento.nombre}" subido — ${data.documento.palabras} palabras extraídas. Ahora puedes pedirme que integre el documento en la generación.`,
        ts: Date.now(),
      }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── LaTeX download ────────────────────────────────────────────────────────────

  async function descargarLatex() {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/projects/${proyectoId}/latex`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1] ?? "proyecto.tex";
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsDownloading(false);
    }
  }

  // ── PDF preview ───────────────────────────────────────────────────────────────

  function generarPdf() {
    if (!proyecto || !university) return;
    const phaseContents: Record<string, string | null> = {};
    displayFases.forEach((f, i) => {
      phaseContents[`fase_${i}`] = getPhaseContent(proyecto, f.id, (f as typeof FASES_STATIC[0]).num);
    });
    const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || "";
    const html = generatePdfHtml({ university, studentData: pdfData, phaseContents, titulo });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    win?.addEventListener("load", () => { win.print(); URL.revokeObjectURL(url); });
    setShowPdfModal(false);
  }

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!proyecto) return null;

  const esGuiado = proyecto.modalidad_creacion === "guiada";
  const currentFaseDef = displayFases[Math.min(selectedFase, displayFases.length - 1)] ?? displayFases[0];
  const phaseId = currentFaseDef.id;
  const legacyNum = (currentFaseDef as typeof FASES_STATIC[0]).num;

  const finalContent = getPhaseContent(proyecto, phaseId, legacyNum);
  const borradorContent = getBorradorContent(proyecto, phaseId, legacyNum);
  const hasBorrador = Boolean(borradorContent);
  const hasFinal = Boolean(finalContent);

  // What to show in the right panel
  const displayContent = esGuiado
    ? (vistaActiva === "final" && hasFinal ? finalContent : (hasBorrador ? borradorContent : null))
    : finalContent;

  const fasesCompletadas = displayFases.filter(f =>
    getPhaseContent(proyecto, f.id, (f as typeof FASES_STATIC[0]).num) !== null
  ).length;

  const needsUpdate = Boolean(
    proyecto.requiere_actualizacion?.[isDynamic ? phaseId : String(selectedFase)]
  );

  // ── Calibration panel ─────────────────────────────────────────────────────────

  if (showCalibracion && !calibSkipped) {
    const allAnswered = calibPreguntas.every(q => {
      const words = countWords(calibRespuestas[q.id] ?? "");
      return words >= q.minimo_palabras;
    });

    return (
      <div style={{ height: "100vh", background: "#020617", color: "#e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", overflow: "auto" }}>
        <div style={{ width: "100%", maxWidth: 680 }}>
          {/* Header */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎓</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Calibración de Estilo</h1>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
              Responde estas preguntas para que la IA aprenda tu forma de escribir. Cuanto más detallado, más personalizado será el resultado.
            </p>
          </div>

          {/* Project title reference */}
          {proyecto.tema_aprobado && (
            <div style={{ padding: "10px 14px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, marginBottom: 24, fontSize: 13, color: "#a78bfa" }}>
              <strong>Tema:</strong> {proyecto.tema_aprobado}
            </div>
          )}

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
            {calibPreguntas.map((q, i) => {
              const words = countWords(calibRespuestas[q.id] ?? "");
              const sufficient = words >= q.minimo_palabras;
              return (
                <div key={q.id} style={{ background: "rgba(14,22,40,0.8)", border: "1px solid #1e293b", borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: q.descripcion ? 4 : 0 }}>{q.pregunta}</div>
                      {q.descripcion && <div style={{ fontSize: 12, color: "#64748b" }}>{q.descripcion}</div>}
                    </div>
                  </div>
                  <textarea
                    className="input-dark"
                    rows={4}
                    value={calibRespuestas[q.id] ?? ""}
                    onChange={e => setCalibRespuestas(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Escribe tu respuesta aquí..."
                    style={{ width: "100%", resize: "vertical", fontSize: 13 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: sufficient ? "#22c55e" : "#64748b" }}>
                    <span>{words} / {q.minimo_palabras} palabras mínimas</span>
                    {sufficient && <span>✓ Suficiente</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => { setCalibSkipped(true); setShowCalibracion(false); }}
              className="btn-ghost"
              style={{ flex: 1, justifyContent: "center", padding: "12px" }}
            >
              Omitir calibración
            </button>
            <button
              onClick={submitCalibracion}
              disabled={!allAnswered || isAnalyzingStyle}
              className="btn-purple"
              style={{ flex: 2, justifyContent: "center", padding: "12px", opacity: allAnswered ? 1 : 0.5 }}
            >
              {isAnalyzingStyle ? (
                <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /><span>Analizando estilo…</span></>
              ) : "🎓 Analizar mi estilo de escritura →"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 12 }}>
            Puedes omitir esto ahora y configurar el perfil de estilo más adelante desde el panel de configuración.
          </p>
        </div>
      </div>
    );
  }

  // ── Main workspace render ─────────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#020617", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <header style={{
        display: "flex", alignItems: "center", gap: 12, padding: "0 20px",
        height: 56, flexShrink: 0,
        background: "rgba(10,22,40,0.98)",
        borderBottom: "1px solid rgba(6,182,212,0.12)",
      }}>
        <a href="/dashboard" style={{ color: "#64748b", textDecoration: "none", fontSize: 18, lineHeight: 1 }}>←</a>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {proyecto.tema_aprobado || proyecto.titulo_provisional || "Proyecto sin título"}
          </div>
          <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{proyecto.servicios?.nombre ?? "Monografía"}</span>
            <span>·</span>
            <span>{fasesCompletadas}/{displayFases.length} fases</span>
            {esGuiado && (
              <span style={{ padding: "1px 6px", borderRadius: 4, background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", fontSize: 10, fontWeight: 600 }}>
                GUIADO
              </span>
            )}
            {esGuiado && proyecto.perfil_estilo_usuario && (
              <span style={{ padding: "1px 6px", borderRadius: 4, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 10 }}>
                ✓ Estilo calibrado
              </span>
            )}
          </div>
        </div>

        {/* Phase dots */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {displayFases.map((f, idx) => {
            const fId = f.id;
            const done = Boolean(getPhaseContent(proyecto, fId, (f as typeof FASES_STATIC[0]).num));
            const selected = idx === selectedFase;
            const hasBorr = Boolean(getBorradorContent(proyecto, fId, (f as typeof FASES_STATIC[0]).num));
            const needsUpd = Boolean(proyecto.requiere_actualizacion?.[isDynamic ? fId : String(idx)]);
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFase(idx)}
                title={f.label + (needsUpd ? " — Necesita actualización" : "")}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: selected
                    ? "2px solid #06b6d4"
                    : needsUpd ? "2px solid #f59e0b"
                    : done ? "2px solid #22c55e"
                    : hasBorr ? "2px solid #a78bfa"
                    : "2px solid #1e293b",
                  background: selected
                    ? "rgba(6,182,212,0.2)"
                    : needsUpd ? "rgba(245,158,11,0.1)"
                    : done ? "rgba(34,197,94,0.08)"
                    : hasBorr ? "rgba(167,139,250,0.1)"
                    : "transparent",
                  color: selected ? "#06b6d4" : needsUpd ? "#f59e0b" : done ? "#4ade80" : hasBorr ? "#a78bfa" : "#475569",
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {needsUpd ? "!" : done ? "✓" : hasBorr ? "~" : idx}
              </button>
            );
          })}
        </div>

        {/* LaTeX */}
        {fasesCompletadas > 0 && (
          <button onClick={descargarLatex} disabled={isDownloading} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px", gap: 4, display: "flex", alignItems: "center" }}>
            {isDownloading ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "📄"}
            <span>.tex</span>
          </button>
        )}

        {/* PDF */}
        {fasesCompletadas > 0 && university && (
          <button onClick={() => setShowPdfModal(true)} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px", gap: 4, display: "flex", alignItems: "center" }}>
            🖨️ <span>Vista PDF</span>
          </button>
        )}

        {/* Admin */}
        {user?.role === "admin" && (
          <a href="/admin" style={{ textDecoration: "none" }}>
            <button className="btn-purple" title="Panel Admin — Modo Dios" style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              ⚡ Admin
            </button>
          </a>
        )}
      </header>

      {/* ── Body: split-screen ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────────────────────── */}
        <div style={{
          width: 400, flexShrink: 0,
          display: "flex", flexDirection: "column",
          borderRight: "1px solid rgba(6,182,212,0.08)",
          background: "#060f1e",
        }}>

          {/* Phase info */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #0a1628" }}>
            <div style={{ fontSize: 10, color: "#06b6d4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>
              {currentFaseDef.short}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
              {currentFaseDef.label}
            </div>
            {proyecto.tema_aprobado && (
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {proyecto.tema_aprobado}
              </div>
            )}
          </div>

          {/* Cache invalidation warning */}
          {needsUpdate && (
            <div style={{ margin: "10px 16px 0", padding: "10px 12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, fontSize: 12, color: "#fbbf24", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ flexShrink: 0, fontSize: 14 }}>⚠️</span>
              <span style={{ lineHeight: 1.5 }}>El contenido de una fase anterior fue modificado. Se recomienda regenerar esta fase para mantener coherencia.</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ margin: "10px 16px 0", padding: "8px 12px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 6, fontSize: 12, color: "#f87171", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{error}</span>
              <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", flexShrink: 0 }}>×</button>
            </div>
          )}

          {/* ── Guiado mode: generate borrador first ──────────────────────────── */}
          {esGuiado && !hasBorrador && !hasFinal && (
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #0a1628" }}>
              <button
                onClick={() => generarFase({ tipo: "borrador" })}
                disabled={isGenerating}
                className="btn-purple"
                style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 13 }}
              >
                {isGenerating ? (
                  <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /><span>Generando borrador…</span></>
                ) : `📝 Generar Borrador — ${currentFaseDef.short}`}
              </button>
              {selectedFase === 0 && (
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-ghost"
                  style={{ width: "100%", marginTop: 8, fontSize: 12, padding: "8px", justifyContent: "center" }}>
                  {isUploading ? "Subiendo…" : "📎 Subir documento de referencia (PDF/TXT)"}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleUpload} style={{ display: "none" }} />
            </div>
          )}

          {/* ── Guiado mode: borrador exists, show feedback area for final ──── */}
          {esGuiado && hasBorrador && !hasFinal && (
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #0a1628" }}>
              <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, marginBottom: 8 }}>
                📝 BORRADOR GENERADO — Deja tu feedback para la versión final
              </div>
              <textarea
                className="input-dark"
                rows={3}
                value={feedbackTexto}
                onChange={e => setFeedbackTexto(e.target.value)}
                placeholder="Ej: Ampliar la sección de antecedentes, ajustar tono más formal, agregar más referencias al sector..."
                style={{ width: "100%", resize: "vertical", fontSize: 12, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => generarFase({ tipo: "final", feedback: feedbackTexto || undefined })}
                  disabled={isGenerating}
                  className="btn-cyan"
                  style={{ flex: 1, justifyContent: "center", padding: "10px", fontSize: 12 }}
                >
                  {isGenerating ? (
                    <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /><span>Generando final…</span></>
                  ) : "✨ Generar Versión Final"}
                </button>
                <button
                  onClick={() => generarFase({ tipo: "borrador" })}
                  disabled={isGenerating}
                  className="btn-ghost"
                  style={{ padding: "10px 12px", fontSize: 12 }}
                  title="Regenerar borrador"
                >
                  🔄
                </button>
              </div>
            </div>
          )}

          {/* ── Directo mode: generate final directly ──────────────────────── */}
          {!esGuiado && !hasFinal && (
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #0a1628" }}>
              <button
                onClick={() => generarFase()}
                disabled={isGenerating}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 13 }}
              >
                {isGenerating ? (
                  <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /><span>Generando…</span></>
                ) : `🤖 Generar ${currentFaseDef.short}`}
              </button>
              {selectedFase === 0 && (
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-ghost"
                  style={{ width: "100%", marginTop: 8, fontSize: 12, padding: "8px", justifyContent: "center" }}>
                  {isUploading ? "Subiendo…" : "📎 Subir documento de referencia (PDF/TXT)"}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleUpload} style={{ display: "none" }} />
            </div>
          )}

          {/* ── Guiado: has final — show re-generate options ─────────────────── */}
          {esGuiado && hasFinal && (
            <div style={{ padding: "10px 18px", borderBottom: "1px solid #0a1628" }}>
              {/* Vista toggle */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <button
                  onClick={() => setVistaActiva("borrador")}
                  style={{
                    flex: 1, padding: "6px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                    background: vistaActiva === "borrador" ? "rgba(167,139,250,0.15)" : "transparent",
                    border: vistaActiva === "borrador" ? "1px solid rgba(167,139,250,0.4)" : "1px solid #1e293b",
                    color: vistaActiva === "borrador" ? "#a78bfa" : "#475569",
                  }}
                >
                  📝 Borrador
                </button>
                <button
                  onClick={() => setVistaActiva("final")}
                  style={{
                    flex: 1, padding: "6px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                    background: vistaActiva === "final" ? "rgba(6,182,212,0.15)" : "transparent",
                    border: vistaActiva === "final" ? "1px solid rgba(6,182,212,0.4)" : "1px solid #1e293b",
                    color: vistaActiva === "final" ? "#06b6d4" : "#475569",
                  }}
                >
                  ✨ Versión Final
                </button>
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {chatMsgs.length === 0 && !displayContent && (
              <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "24px 0", lineHeight: 1.6 }}>
                Genera la fase o envía<br />instrucciones específicas a la IA.
              </div>
            )}
            {chatMsgs.length === 0 && displayContent && (
              <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "24px 0", lineHeight: 1.6 }}>
                Contenido generado. Pide<br />modificaciones aquí.
              </div>
            )}
            {chatMsgs.map((msg, i) => (
              <div
                key={i}
                style={{
                  padding: "9px 12px", borderRadius: 8, fontSize: 12,
                  background: msg.role === "user" ? "rgba(79,70,229,0.14)" : "rgba(6,182,212,0.07)",
                  border: msg.role === "user" ? "1px solid rgba(79,70,229,0.22)" : "1px solid rgba(6,182,212,0.1)",
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 10, color: msg.role === "user" ? "#a5b4fc" : "#67e8f9", marginBottom: 4 }}>
                  {msg.role === "user" ? "Tú" : "IA"}
                </div>
                <div style={{ color: "#cbd5e1", lineHeight: 1.55 }}>{msg.text}</div>
              </div>
            ))}
            {isGenerating && (
              <div style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.08)", alignSelf: "flex-start" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid #0a1628", background: "#040b16" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: displayContent ? 8 : 0 }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && chatInput.trim()) generarFase({ mensajeOverride: chatInput.trim() }); }}
                placeholder="Instrucciones a la IA… (Ctrl+Enter)"
                rows={2}
                disabled={isGenerating}
                className="input-dark"
                style={{ flex: 1, resize: "none", fontSize: 12 }}
              />
              <button
                onClick={() => { if (chatInput.trim()) generarFase({ mensajeOverride: chatInput.trim() }); }}
                disabled={isGenerating || !chatInput.trim()}
                style={{
                  width: 40, flexShrink: 0,
                  background: isGenerating || !chatInput.trim() ? "#0a1628" : "#06b6d4",
                  border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, cursor: isGenerating || !chatInput.trim() ? "not-allowed" : "pointer",
                  color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {isGenerating ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "↑"}
              </button>
            </div>

            {displayContent && (
              <div style={{ display: "flex", gap: 8 }}>
                {selectedFase > 0 && (
                  <button onClick={() => setSelectedFase(f => f - 1)} className="btn-ghost" style={{ flex: 1, fontSize: 11, padding: "6px 8px", justifyContent: "center" }}>
                    ← {displayFases[selectedFase - 1]?.short ?? ""}
                  </button>
                )}
                {selectedFase < displayFases.length - 1 && (
                  <button onClick={() => setSelectedFase(f => f + 1)} className="btn-cyan" style={{ flex: 1, fontSize: 11, padding: "6px 8px", justifyContent: "center" }}>
                    {displayFases[selectedFase + 1]?.short ?? ""} →
                  </button>
                )}
                {selectedFase === 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    style={{ flex: 1, background: "transparent", border: "1px dashed #1e293b", borderRadius: 6, color: "#475569", fontSize: 11, padding: "6px", cursor: "pointer" }}
                  >
                    {isUploading ? "Subiendo…" : "📎 Adjuntar doc"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ───────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#020617" }}>
          {displayContent ? (
            <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto", padding: "36px 40px 60px" }}>

              {/* Phase header */}
              <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#06b6d4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                      {currentFaseDef.short}
                    </div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
                      {currentFaseDef.label}
                    </h1>
                  </div>
                  {/* Content state badge */}
                  {esGuiado && (
                    vistaActiva === "final" && hasFinal
                      ? <span className="badge badge-cyan">✨ Versión Final</span>
                      : <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>📝 Borrador</span>
                  )}
                  {!esGuiado && hasFinal && <span className="badge badge-green">✓ Generado</span>}
                </div>
                {proyecto.tema_aprobado && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#475569", fontStyle: "italic" }}>
                    Tema: {proyecto.tema_aprobado}
                  </div>
                )}
                {needsUpdate && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, fontSize: 12, color: "#fbbf24" }}>
                    ⚠️ Contenido desactualizado — una fase anterior fue modificada. Regenera para mantener coherencia.
                  </div>
                )}
              </div>

              {/* Content */}
              <style>{`
                .md-h1{font-size:20px;font-weight:800;color:#f1f5f9;margin:28px 0 12px}
                .md-h2{font-size:17px;font-weight:700;color:#e2e8f0;margin:22px 0 10px}
                .md-h3{font-size:15px;font-weight:700;color:#cbd5e1;margin:16px 0 8px}
                .md-h4{font-size:14px;font-weight:700;color:#94a3b8;margin:12px 0 6px}
                .md-p{margin:10px 0;color:#cbd5e1;line-height:1.9;font-size:14px}
                .md-strong{color:#67e8f9;font-weight:700}
                .md-em{color:#94a3b8;font-style:italic}
                .md-ul{margin:10px 0;padding-left:22px}
                .md-li{color:#cbd5e1;margin:5px 0;line-height:1.7;font-size:14px}
              `}</style>

              <div
                className="doc-preview"
                dangerouslySetInnerHTML={{ __html: renderMd(displayContent) }}
                style={{ fontSize: 14, lineHeight: 1.9 }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <div style={{ fontSize: 52, opacity: 0.2 }}>📄</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{currentFaseDef.label}</div>
              <div style={{ fontSize: 13, color: "#0f172a", textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
                {esGuiado
                  ? "Genera el borrador para comenzar el proceso guiado."
                  : "Usa el panel izquierdo para generar el contenido de esta fase."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PDF Student Data Modal ─────────────────────────────────────────────── */}
      {showPdfModal && university && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(2,6,23,0.85)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: "#060f1e", border: "1px solid rgba(6,182,212,0.18)",
            borderRadius: 12, width: "100%", maxWidth: 440,
            padding: "28px 28px 24px",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Generar Vista PDF</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>{university.name} — formato oficial</div>

            <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Nombre completo del estudiante</label>
            <input className="input-dark" style={{ width: "100%", marginBottom: 14 }} value={pdfData.nombre} onChange={e => setPdfData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej. Juan Pérez Mamani" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Mes</label>
                <select className="input-dark" style={{ width: "100%" }} value={pdfData.mes} onChange={e => setPdfData(p => ({ ...p, mes: e.target.value }))}>
                  {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Año</label>
                <input className="input-dark" style={{ width: "100%" }} value={pdfData.anio} onChange={e => setPdfData(p => ({ ...p, anio: e.target.value }))} placeholder="2026" />
              </div>
            </div>

            {university.campos_portada?.includes("programa") && (
              <>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Nombre del programa / diplomado</label>
                <input className="input-dark" style={{ width: "100%", marginBottom: 14 }} value={pdfData.programa ?? ""} onChange={e => setPdfData(p => ({ ...p, programa: e.target.value }))} placeholder="Ej. GESTIÓN FINANCIERA" />
              </>
            )}
            {university.campos_portada?.includes("version") && (
              <>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Versión</label>
                <input className="input-dark" style={{ width: "100%", marginBottom: 14 }} value={pdfData.version ?? ""} onChange={e => setPdfData(p => ({ ...p, version: e.target.value }))} placeholder="Ej. III" />
              </>
            )}
            {university.campos_portada?.includes("tutor") && (
              <>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Tutor/a</label>
                <input className="input-dark" style={{ width: "100%", marginBottom: 14 }} value={pdfData.tutor ?? ""} onChange={e => setPdfData(p => ({ ...p, tutor: e.target.value }))} placeholder="Nombre del tutor" />
              </>
            )}
            {university.campos_portada?.includes("carrera") && (
              <>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Carrera</label>
                <input className="input-dark" style={{ width: "100%", marginBottom: 14 }} value={pdfData.carrera ?? ""} onChange={e => setPdfData(p => ({ ...p, carrera: e.target.value }))} placeholder="Ej. Economía" />
              </>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setShowPdfModal(false)} className="btn-ghost" style={{ fontSize: 13, padding: "8px 18px" }}>Cancelar</button>
              <button onClick={generarPdf} disabled={!pdfData.nombre.trim()} className="btn-cyan" style={{ fontSize: 13, padding: "8px 20px" }}>Generar PDF →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
