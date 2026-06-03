"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useIsMobileDevice } from "@/lib/hooks/useIsMobileDevice";

interface TurnMsg {
  rol: "tribunal" | "estudiante";
  texto: string;
}

type Fase = "idle" | "en_curso" | "cerrado";

function ScoreBar({ puntaje }: { puntaje: number }) {
  const color = puntaje >= 70 ? "#4ade80" : puntaje >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
        <span style={{ color: "var(--fg-muted)" }}>Puntaje obtenido</span>
        <span style={{ color, fontWeight: 800, fontSize: 18 }}>{puntaje}/100</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: "rgba(148,163,184,0.15)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${puntaje}%`, background: color, borderRadius: 4, transition: "width 1s ease-out" }} />
      </div>
    </div>
  );
}

function extractScore(texto: string): number | null {
  const m = texto.match(/\b(\d{1,3})\s*(?:\/\s*100|puntos?|pts?\.?)?/gi);
  if (!m) return null;
  for (const raw of m) {
    const n = parseInt(raw.replace(/\D/g, ""), 10);
    if (n >= 0 && n <= 100) return n;
  }
  return null;
}

export default function DefensaPage() {
  const isMobile = useIsMobileDevice();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [titulo, setTitulo] = useState<string | null>(null);
  const [fase, setFase] = useState<Fase>("idle");
  const [historial, setHistorial] = useState<TurnMsg[]>([]);
  const [respuesta, setRespuesta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [turno, setTurno] = useState(0);
  const [puntaje, setPuntaje] = useState<number | null>(null);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) { router.replace("/dashboard"); return; }
        const p = d.proyecto;
        setTitulo(p.tema_aprobado || p.titulo_provisional || "Proyecto sin título");
      });
  }, [id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial, cargando]);

  async function iniciar() {
    setCargando(true);
    setError("");
    setHistorial([]);
    setPuntaje(null);
    try {
      const res = await fetch(`/api/projects/${id}/defensa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "iniciar" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setHistorial([{ rol: "tribunal", texto: d.pregunta }]);
      setTurno(d.turno);
      setFase("en_curso");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  async function responder() {
    if (!respuesta.trim() || cargando) return;
    const newHistorial: TurnMsg[] = [...historial, { rol: "estudiante", texto: respuesta }];
    setHistorial(newHistorial);
    setRespuesta("");
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/defensa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "responder", respuesta, historial: newHistorial }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      const finalHistorial: TurnMsg[] = [...newHistorial, { rol: "tribunal", texto: d.pregunta }];
      setHistorial(finalHistorial);
      setTurno(d.turno);
      if (d.cerrado) {
        setFase("cerrado");
        const score = extractScore(d.pregunta);
        if (score !== null) setPuntaje(score);
      }
    } catch (e) {
      setError((e as Error).message);
      // Remove the student message on error so they can retry
      setHistorial(prev => prev.slice(0, -1));
      setRespuesta(respuesta);
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setFase("idle");
    setHistorial([]);
    setTurno(0);
    setPuntaje(null);
    setRespuesta("");
    setError("");
  }

  const panelBg = "rgba(255,255,255,0.55)";
  const panelBlur = "blur(28px) saturate(180%)";
  const panelBorder = "1px solid rgba(255, 255, 255, 0.4)";

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "transparent", color: "var(--fg-primary)", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", height: 52, flexShrink: 0, background: panelBg, backdropFilter: panelBlur, WebkitBackdropFilter: panelBlur, borderBottom: panelBorder, zIndex: 40 }}>
        <Link href={`/projects/${id}/workspace`} style={{ color: "var(--fg-muted)", textDecoration: "none", fontSize: 18 }}>←</Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Simulador de Defensa
          </div>
          {titulo && (
            <div style={{ fontSize: 11, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {titulo}
            </div>
          )}
        </div>
        {fase !== "idle" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span style={{ color: "var(--fg-muted)" }}>Turno</span>
            <span style={{ fontWeight: 800, color: fase === "cerrado" ? "#4ade80" : "var(--accent)" }}>
              {fase === "cerrado" ? "✓ Finalizado" : `${turno} / 6`}
            </span>
          </div>
        )}
      </header>

      {/* Body */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 16px" }}>

        {/* ── IDLE ── */}
        {fase === "idle" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: 52 }}>⚖️</div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Simulador de Defensa</h1>
              <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6, maxWidth: 480 }}>
                La IA actuará como un tribunal académico boliviano. Hará <strong>6 preguntas</strong> basadas en tu monografía y evaluará tus respuestas al final con un puntaje de 0 a 100.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 340 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 8 }}>
                {["Marco teórico", "Metodología", "Resultados"].map(t => (
                  <div key={t} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)", fontSize: 11, color: "var(--fg-muted)", textAlign: "center" }}>
                    {t}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
                {["Justificación", "Coherencia"].map(t => (
                  <div key={t} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)", fontSize: 11, color: "var(--fg-muted)", textAlign: "center" }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={iniciar} disabled={cargando} className="btn-purple" style={{ padding: "14px 40px", fontSize: 14, marginTop: 8 }}>
              {cargando
                ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /><span>Preparando tribunal…</span></>
                : "Iniciar defensa →"}
            </button>
            {error && <div style={{ fontSize: 12, color: "#f87171", marginTop: 4 }}>{error}</div>}
          </div>
        )}

        {/* ── EN CURSO / CERRADO ── */}
        {(fase === "en_curso" || fase === "cerrado") && (
          <>
            {/* Messages scroll area */}
            <div style={{ flex: 1, overflowY: "auto", paddingTop: 20, paddingBottom: 12, display: "flex", flexDirection: "column", gap: 14 }}>
              {historial.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.rol === "tribunal" ? "flex-start" : "flex-end" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: msg.rol === "tribunal" ? "#fbbf24" : "var(--accent)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {msg.rol === "tribunal" ? "⚖️ Tribunal" : "Tú"}
                  </div>
                  <div style={{
                    maxWidth: "82%",
                    padding: "12px 16px",
                    borderRadius: msg.rol === "tribunal" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                    background: msg.rol === "tribunal"
                      ? "rgba(245,158,11,0.08)"
                      : "rgba(37,99,235,0.1)",
                    border: msg.rol === "tribunal"
                      ? "1px solid rgba(245,158,11,0.2)"
                      : "1px solid rgba(37,99,235,0.2)",
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "var(--fg-primary)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.texto}
                  </div>
                </div>
              ))}

              {cargando && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", marginBottom: 4, textTransform: "uppercase" }}>⚖️ Tribunal</div>
                  <div style={{ padding: "12px 18px", borderRadius: "4px 16px 16px 16px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", animation: `bounce 1s ${i * 0.2}s infinite`, opacity: 0.7 }} />
                    ))}
                  </div>
                </div>
              )}

              {fase === "cerrado" && puntaje !== null && (
                <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>Evaluación completada</div>
                  <ScoreBar puntaje={puntaje} />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            {fase === "en_curso" && (
              <div style={{ flexShrink: 0, paddingBottom: 16, paddingTop: 8, borderTop: "1px solid rgba(148,163,184,0.15)" }}>
                {error && (
                  <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)" }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <textarea
                    value={respuesta}
                    onChange={e => setRespuesta(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) responder(); }}
                    placeholder="Escribe tu respuesta… (Ctrl+Enter para enviar)"
                    rows={3}
                    disabled={cargando}
                    style={{
                      flex: 1, background: "rgba(15,23,42,0.06)", border: "1px solid rgba(148,163,184,0.3)",
                      borderRadius: 12, padding: "10px 14px", color: "var(--fg-primary)", fontSize: 13,
                      resize: "none", lineHeight: 1.6, boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={responder}
                    disabled={cargando || !respuesta.trim()}
                    className="btn-purple"
                    style={{ padding: "10px 18px", fontSize: 13, flexShrink: 0, opacity: respuesta.trim() ? 1 : 0.45 }}
                  >
                    {cargando ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "→"}
                  </button>
                </div>
              </div>
            )}

            {/* Closed actions */}
            {fase === "cerrado" && (
              <div style={{ flexShrink: 0, paddingBottom: 16, paddingTop: 8, borderTop: "1px solid rgba(148,163,184,0.15)", display: "flex", gap: 10 }}>
                <button onClick={reiniciar} className="btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "12px" }}>
                  ↩ Repetir defensa
                </button>
                <Link href={`/projects/${id}/workspace`} className="btn-purple" style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "12px", textDecoration: "none", display: "flex", alignItems: "center" }}>
                  Volver al workspace
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
