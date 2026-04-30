"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Proyecto {
  id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  servicio_id: string;
  contenido_fase_0: string | null;
  contenido_fase_1: string | null;
  contenido_fase_2: string | null;
  contenido_fase_3: string | null;
  contenido_fase_4: string | null;
  contenido_fase_5: string | null;
  servicios: { id: string; nombre: string } | null;
}

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
  ts?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FASES = [
  { num: 0, label: "Planteamiento del Tema", short: "Fase 0" },
  { num: 1, label: "Capítulo I — Marco Referencial", short: "Cap. I" },
  { num: 2, label: "Capítulo II — Marco Teórico", short: "Cap. II" },
  { num: 3, label: "Capítulos III al V — Desarrollo", short: "Caps. III-V" },
  { num: 4, label: "Revisión y Compilación", short: "Revisión" },
  { num: 5, label: "Conclusiones y Bibliografía", short: "Final" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFaseContent(proyecto: Proyecto, fase: number): string | null {
  const map: Record<number, keyof Proyecto> = {
    0: "contenido_fase_0", 1: "contenido_fase_1", 2: "contenido_fase_2",
    3: "contenido_fase_3", 4: "contenido_fase_4", 5: "contenido_fase_5",
  };
  return proyecto[map[fase]] as string | null;
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

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load ────────────────────────────────────────────────────────────────

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
        setProyecto(projData.proyecto);
        setSelectedFase(Math.min(projData.proyecto.estado_fase, 5));
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

  // ── Generate ─────────────────────────────────────────────────────────────

  const generarFase = useCallback(async (mensajeOverride?: string) => {
    if (!proyecto || isGenerating) return;
    setIsGenerating(true);
    setError("");

    const userMsg = mensajeOverride ?? chatInput.trim();
    if (userMsg) {
      setChatMsgs(prev => [...prev, { role: "user", text: userMsg, ts: Date.now() }]);
      if (!mensajeOverride) setChatInput("");
    }

    try {
      const res = await fetch("/api/projects/generate-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          fase_numero: selectedFase,
          mensaje_usuario: userMsg || undefined,
        }),
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
        const key = `contenido_fase_${selectedFase}` as keyof Proyecto;
        const nuevaFase = Math.max(prev.estado_fase, selectedFase);
        return { ...prev, [key]: data.contenido, estado_fase: nuevaFase };
      });

      if (userMsg) {
        setChatMsgs(prev => [...prev, {
          role: "assistant",
          text: "✅ Fase actualizada. Revisa el panel derecho — los cambios ya están reflejados.",
          ts: Date.now(),
        }]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }, [proyecto, isGenerating, chatInput, selectedFase, proyectoId]);

  // ── Upload ────────────────────────────────────────────────────────────────

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

  // ── LaTeX download ────────────────────────────────────────────────────────

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

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="gradient-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!proyecto) return null;

  const currentContent = getFaseContent(proyecto, selectedFase);
  const fasaInfo = FASES[selectedFase];
  const fasesCompletadas = FASES.filter(f => getFaseContent(proyecto, f.num)).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#020617", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
          <div style={{ fontSize: 11, color: "#475569" }}>
            {proyecto.servicios?.nombre ?? "Monografía"} · {fasesCompletadas}/6 fases
          </div>
        </div>

        {/* Phase dots */}
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {FASES.map(f => {
            const done = Boolean(getFaseContent(proyecto, f.num));
            const selected = f.num === selectedFase;
            return (
              <button
                key={f.num}
                onClick={() => setSelectedFase(f.num)}
                title={f.label}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: selected
                    ? "2px solid #06b6d4"
                    : done ? "2px solid #22c55e" : "2px solid #1e293b",
                  background: selected
                    ? "rgba(6,182,212,0.2)"
                    : done ? "rgba(34,197,94,0.08)" : "transparent",
                  color: selected ? "#06b6d4" : done ? "#4ade80" : "#475569",
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {done ? "✓" : f.num}
              </button>
            );
          })}
        </div>

        {/* LaTeX download */}
        {fasesCompletadas > 0 && (
          <button
            onClick={descargarLatex}
            disabled={isDownloading}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "6px 12px", gap: 4, display: "flex", alignItems: "center" }}
          >
            {isDownloading ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "📄"}
            <span>.tex</span>
          </button>
        )}

        {/* Modo Dios */}
        {user?.role === "admin" && (
          <a href="/admin" style={{ textDecoration: "none" }}>
            <button
              className="btn-purple"
              title="Panel Admin — Modo Dios"
              style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}
            >
              ⚡ Admin
            </button>
          </a>
        )}
      </header>

      {/* ── Body: split-screen ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
        <div style={{
          width: 400, flexShrink: 0,
          display: "flex", flexDirection: "column",
          borderRight: "1px solid rgba(6,182,212,0.08)",
          background: "#060f1e",
        }}>

          {/* Phase info */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #0a1628" }}>
            <div style={{ fontSize: 10, color: "#06b6d4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>
              {fasaInfo.short}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>
              {fasaInfo.label}
            </div>
            {proyecto.tema_aprobado && (
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {proyecto.tema_aprobado}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: "10px 16px 0", padding: "8px 12px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 6, fontSize: 12, color: "#f87171", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{error}</span>
              <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", flexShrink: 0 }}>×</button>
            </div>
          )}

          {/* Generate button when no content */}
          {!currentContent && (
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #0a1628" }}>
              <button
                onClick={() => generarFase()}
                disabled={isGenerating}
                className="btn-cyan"
                style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 13 }}
              >
                {isGenerating ? (
                  <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /><span>Generando…</span></>
                ) : (
                  `🤖 Generar ${fasaInfo.short}`
                )}
              </button>

              {selectedFase === 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-ghost"
                  style={{ width: "100%", marginTop: 8, fontSize: 12, padding: "8px", justifyContent: "center" }}
                >
                  {isUploading ? "Subiendo…" : "📎 Subir documento de referencia (PDF/TXT)"}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" onChange={handleUpload} style={{ display: "none" }} />
            </div>
          )}

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {chatMsgs.length === 0 && !currentContent && (
              <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "24px 0", lineHeight: 1.6 }}>
                Genera la fase o envía<br />instrucciones específicas a la IA.
              </div>
            )}
            {chatMsgs.length === 0 && currentContent && (
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
            <div style={{ display: "flex", gap: 8, marginBottom: currentContent ? 8 : 0 }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && chatInput.trim()) generarFase(chatInput.trim()); }}
                placeholder="Instrucciones a la IA… (Ctrl+Enter)"
                rows={2}
                disabled={isGenerating}
                className="input-dark"
                style={{ flex: 1, resize: "none", fontSize: 12 }}
              />
              <button
                onClick={() => { if (chatInput.trim()) generarFase(chatInput.trim()); }}
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

            {currentContent && (
              <div style={{ display: "flex", gap: 8 }}>
                {selectedFase > 0 && (
                  <button onClick={() => setSelectedFase(f => f - 1)} className="btn-ghost" style={{ flex: 1, fontSize: 11, padding: "6px 8px", justifyContent: "center" }}>
                    ← {FASES[selectedFase - 1].short}
                  </button>
                )}
                {selectedFase < 5 && (
                  <button onClick={() => setSelectedFase(f => f + 1)} className="btn-cyan" style={{ flex: 1, fontSize: 11, padding: "6px 8px", justifyContent: "center" }}>
                    {FASES[selectedFase + 1].short} →
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

        {/* ── RIGHT PANEL — Content viewer ──────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#020617" }}>
          {currentContent ? (
            <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto", padding: "36px 40px 60px" }}>

              {/* Phase header */}
              <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#06b6d4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                      {fasaInfo.short}
                    </div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
                      {fasaInfo.label}
                    </h1>
                  </div>
                  <span className="badge badge-green">✓ Generado</span>
                </div>
                {proyecto.tema_aprobado && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "#475569", fontStyle: "italic" }}>
                    Tema: {proyecto.tema_aprobado}
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
                dangerouslySetInnerHTML={{ __html: renderMd(currentContent) }}
                style={{ fontSize: 14, lineHeight: 1.9 }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <div style={{ fontSize: 52, opacity: 0.2 }}>📄</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{fasaInfo.label}</div>
              <div style={{ fontSize: 13, color: "#0f172a", textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
                Usa el panel izquierdo para generar<br />el contenido de esta fase.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
