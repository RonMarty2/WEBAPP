"use client";

/**
 * AudioFeedback — Bloque para subir o GRABAR audio del tutor que se transcribe
 * automáticamente con Gemini y se prepara como feedback aplicable a la fase actual.
 *
 * Flujo:
 *  1. Estudiante puede SUBIR archivo de audio o GRABAR in-app (MediaRecorder)
 *  2. Backend transcribe con Gemini y devuelve estructura por capítulos
 *  3. Estudiante revisa el texto en un panel editable
 *  4. Aplica al feedback de la fase actual o descarta
 *
 * Diseñado para ser usado tanto desde web como mobile (la grabación in-app
 * funciona en cualquier navegador moderno con permiso de micrófono).
 */

import { useState, useRef, useCallback, useEffect } from "react";

const MAX_DURATION_MS = 10 * 60 * 1000; // 10 minutos

interface Props {
  proyectoId: string;
  /** Aplica el texto transcrito como feedback de la fase actual. */
  onAplicarComoFeedback?: (texto: string) => void;
}

type Estado =
  | { kind: "idle" }
  | { kind: "grabando"; tiempo: number; mediaRecorder: MediaRecorder; stream: MediaStream }
  | { kind: "subiendo" }
  | { kind: "transcribiendo" }
  | { kind: "listo"; estructurada: string; literal: string; nombreArchivo?: string }
  | { kind: "error"; mensaje: string };

export default function AudioFeedback({ proyectoId, onAplicarComoFeedback }: Props) {
  const [estado, setEstado] = useState<Estado>({ kind: "idle" });
  const [textoEditado, setTextoEditado] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tickerRef = useRef<number | null>(null);

  // Limpia recursos si el componente se desmonta mientras graba
  useEffect(() => {
    return () => {
      if (estado.kind === "grabando") {
        try { estado.mediaRecorder.stop(); } catch { /* ignore */ }
        estado.stream.getTracks().forEach(t => t.stop());
      }
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Subir archivo ───────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setEstado({ kind: "subiendo" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("proyecto_id", proyectoId);
      setEstado({ kind: "transcribiendo" });
      const res = await fetch("/api/projects/upload-document", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Falló la transcripción");
      if (!data.esAudio || !data.transcripcion) throw new Error("La respuesta no incluye transcripción");

      const estructurada = data.transcripcion.estructurada || "";
      const literal = data.transcripcion.literal || "";
      setEstado({ kind: "listo", estructurada, literal, nombreArchivo: file.name });
      setTextoEditado(estructurada || literal);
    } catch (e) {
      setEstado({ kind: "error", mensaje: (e as Error).message });
    }
  }, [proyectoId]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (f) handleFile(f);
  };

  // ── Grabar in-app con MediaRecorder ─────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Tu navegador no soporta grabación. Sube un archivo en su lugar.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // webm/opus tiene soporte universal en Chrome/Firefox/Edge modernos
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Detener tracks del micrófono
        stream.getTracks().forEach(t => t.stop());

        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        if (blob.size < 1024) {
          setEstado({ kind: "error", mensaje: "Grabación demasiado corta. Intentá hablar al menos 3 segundos." });
          return;
        }
        const ext = mimeType.includes("webm") ? "webm" : "ogg";
        const file = new File([blob], `grabacion-${Date.now()}.${ext}`, { type: mimeType || "audio/webm" });
        handleFile(file);
      };

      mediaRecorder.start();
      const inicio = Date.now();
      const newEstado: Estado = { kind: "grabando", tiempo: 0, mediaRecorder, stream };
      setEstado(newEstado);

      // Ticker que actualiza el contador y auto-corta a los 10 min
      tickerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - inicio;
        if (elapsed >= MAX_DURATION_MS) {
          if (mediaRecorder.state === "recording") mediaRecorder.stop();
          if (tickerRef.current) clearInterval(tickerRef.current);
          return;
        }
        setEstado(prev => prev.kind === "grabando" ? { ...prev, tiempo: elapsed } : prev);
      }, 200);

    } catch (e) {
      const msg = (e as Error).message || "No se pudo acceder al micrófono";
      setEstado({ kind: "error", mensaje: msg });
    }
  }, [handleFile]);

  const stopRecording = useCallback(() => {
    if (estado.kind !== "grabando") return;
    try { estado.mediaRecorder.stop(); } catch { /* ignore */ }
    if (tickerRef.current) { clearInterval(tickerRef.current); tickerRef.current = null; }
  }, [estado]);

  // ── Resetear al estado inicial ───────────────────────────────────────────
  const reset = () => {
    setEstado({ kind: "idle" });
    setTextoEditado("");
  };

  // ── Aplicar al feedback ──────────────────────────────────────────────────
  const aplicar = () => {
    if (estado.kind !== "listo") return;
    onAplicarComoFeedback?.(textoEditado.trim() || estado.estructurada);
    reset();
  };

  // ── Render por estado ────────────────────────────────────────────────────

  if (estado.kind === "subiendo" || estado.kind === "transcribiendo") {
    return (
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px" }}>
          <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-primary)" }}>
              {estado.kind === "subiendo" ? "Subiendo audio…" : "Transcribiendo con IA…"}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 2 }}>
              Suele tardar 10-30 segundos según la duración del audio.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (estado.kind === "grabando") {
    const segs = Math.floor(estado.tiempo / 1000);
    const mins = Math.floor(segs / 60);
    const ssEstado = segs % 60;
    const tiempoStr = `${mins}:${String(ssEstado).padStart(2, "0")}`;
    const cercaDelLimite = segs >= 9 * 60;

    return (
      <Card>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, color: "white",
            boxShadow: "0 0 0 0 rgba(239,68,68,0.4)",
            animation: "rec-pulse 1.4s ease-in-out infinite",
          }}>🎤</div>
          <div style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 28, fontWeight: 800, color: "var(--fg-primary)",
          }}>
            {tiempoStr}
          </div>
          <div style={{ fontSize: 11, color: cercaDelLimite ? "#f59e0b" : "var(--fg-muted)" }}>
            {cercaDelLimite ? `⚠️ Se cortará automáticamente al llegar a 10:00` : `Habla con claridad. Máximo 10 minutos.`}
          </div>
          <button
            onClick={stopRecording}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background: "linear-gradient(135deg, #1f2937, #111827)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
            }}
          >
            ■ Detener y transcribir
          </button>
          <style>{`
            @keyframes rec-pulse {
              0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
              50% { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
            }
          `}</style>
        </div>
      </Card>
    );
  }

  if (estado.kind === "listo") {
    return (
      <Card>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ✓ Transcripción lista — revisa y aplica
          </div>
          {estado.nombreArchivo && (
            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              📎 {estado.nombreArchivo}
            </div>
          )}
          <textarea
            value={textoEditado}
            onChange={e => setTextoEditado(e.target.value)}
            rows={8}
            className="input-dark"
            style={{
              fontSize: 12.5,
              lineHeight: 1.6,
              resize: "vertical",
              minHeight: 160,
              fontFamily: "var(--font-crimson), Georgia, serif",
            }}
            placeholder="La transcripción aparecerá aquí..."
          />
          {estado.literal && estado.literal !== estado.estructurada && (
            <details>
              <summary style={{ cursor: "pointer", fontSize: 11, color: "var(--fg-muted)" }}>
                Ver transcripción literal sin estructurar
              </summary>
              <pre style={{
                marginTop: 8, padding: "10px 12px",
                background: "rgba(148,163,184,0.06)", borderRadius: 6,
                fontSize: 11.5, lineHeight: 1.55,
                color: "var(--fg-secondary)",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}>{estado.literal}</pre>
            </details>
          )}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <button
              onClick={aplicar}
              style={{
                flex: 1, minWidth: 180,
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                color: "white",
                fontSize: 12, fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(34,197,94,0.28)",
              }}
            >
              ✓ Aplicar al feedback de esta fase
            </button>
            <button
              onClick={reset}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--fg-secondary)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              🗑️ Descartar
            </button>
          </div>
        </div>
      </Card>
    );
  }

  if (estado.kind === "error") {
    return (
      <Card>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ⚠️ No se pudo transcribir
          </div>
          <div style={{ fontSize: 12.5, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
            {estado.mensaje}
          </div>
          <button
            onClick={reset}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--fg-primary)",
              fontSize: 12,
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            Volver a intentar
          </button>
        </div>
      </Card>
    );
  }

  // estado.kind === "idle"
  return (
    <Card>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          🎙️ Audio del tutor
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.55 }}>
          Sube o graba el feedback de tu tutor. La IA transcribe y estructura las
          observaciones automáticamente. Después puedes aplicarlo al feedback de la
          fase actual con un click.
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={startRecording}
            style={{
              flex: 1, padding: "11px 14px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              fontSize: 12.5, fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 3px 8px rgba(239,68,68,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            🎤 Grabar ahora
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              flex: 1, padding: "11px 14px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--fg-primary)",
              fontSize: 12.5, fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            📎 Subir archivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.m4a,.wav,.ogg,.webm,.flac,.aac,audio/*"
            onChange={onPickFile}
            style={{ display: "none" }}
          />
        </div>

        <div style={{ fontSize: 10.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>
          Máx 10 min · MP3, M4A, WAV, OGG, WEBM · La transcripción se mostrará para que la revises antes de aplicar.
        </div>
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 12,
      border: "1px solid rgba(167,139,250,0.25)",
      background: "rgba(167,139,250,0.04)",
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}
