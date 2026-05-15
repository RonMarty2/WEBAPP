"use client";

/**
 * BancoPreguntasView
 *
 * Pantalla final del flujo: consolida las preguntas de defensa oral generadas
 * en background tras la aprobación de cada capítulo, las muestra agrupadas por
 * fase y permite descargar todo en un PDF para estudiar.
 *
 * Las preguntas se guardan en `phase_contents[${faseId}_preguntas]` como JSON
 * serializado. Aquí las leemos del proyecto cargado en el cliente, las
 * deserializamos y las renderizamos.
 */

import { useMemo, useState } from "react";

interface PreguntaItem {
  pregunta: string;
  respuesta_sugerida: string;
}

interface PreguntasFasePayload {
  generadas_at?: string;
  provider?: string;
  model?: string;
  conocimiento: PreguntaItem[];
  autoria: PreguntaItem[];
}

interface BloqueFase {
  faseId: string;
  faseLabel: string;
  conocimiento: PreguntaItem[];
  autoria: PreguntaItem[];
}

interface Props {
  proyectoId: string;
  tituloProyecto?: string;
  /** Mapa phaseId → contenido bruto (string), tal como llega del backend. */
  phaseContents: Record<string, string | null | undefined>;
  /** Fases sustantivas del proyecto, en orden, para etiquetar el banco. */
  phaseDefs: Array<{ id: string; label: string }>;
}

const FASES_CON_PREGUNTAS = ["ph-cap0", "ph-cap1", "ph-cap2", "ph-cap3", "ph-cap4", "ph-cap5"];

function parsePayload(raw: string | null | undefined): PreguntasFasePayload | null {
  if (!raw?.trim()) return null;
  try {
    const obj = JSON.parse(raw) as PreguntasFasePayload;
    if (!obj || typeof obj !== "object") return null;
    if (!Array.isArray(obj.conocimiento) || !Array.isArray(obj.autoria)) return null;
    return obj;
  } catch {
    return null;
  }
}

export default function BancoPreguntasView({ proyectoId, tituloProyecto, phaseContents, phaseDefs }: Props) {
  const [pdfDescargando, setPdfDescargando] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [regenerando, setRegenerando] = useState<string | null>(null);

  const bloques = useMemo<BloqueFase[]>(() => {
    const labelById: Record<string, string> = {};
    phaseDefs.forEach(p => { labelById[p.id] = p.label; });
    const result: BloqueFase[] = [];
    for (const fid of FASES_CON_PREGUNTAS) {
      const payload = parsePayload(phaseContents[`${fid}_preguntas`]);
      if (!payload) continue;
      if (payload.conocimiento.length === 0 && payload.autoria.length === 0) continue;
      result.push({
        faseId: fid,
        faseLabel: labelById[fid] || fid,
        conocimiento: payload.conocimiento,
        autoria: payload.autoria,
      });
    }
    return result;
  }, [phaseContents, phaseDefs]);

  const totalConocimiento = bloques.reduce((sum, b) => sum + b.conocimiento.length, 0);
  const totalAutoria = bloques.reduce((sum, b) => sum + b.autoria.length, 0);
  const totalPreguntas = totalConocimiento + totalAutoria;

  // Fases que tienen contenido aprobado pero todavía NO tienen preguntas (la
  // generación en background pudo fallar o estar pendiente).
  const fasesPendientes = useMemo(() => {
    const labelById: Record<string, string> = {};
    phaseDefs.forEach(p => { labelById[p.id] = p.label; });
    return FASES_CON_PREGUNTAS
      .filter(fid => {
        const tieneContenido = (phaseContents[fid] ?? "").trim().length > 200;
        const tienePreguntas = Boolean(parsePayload(phaseContents[`${fid}_preguntas`]));
        return tieneContenido && !tienePreguntas;
      })
      .map(fid => ({ id: fid, label: labelById[fid] || fid }));
  }, [phaseContents, phaseDefs]);

  async function regenerar(faseId: string) {
    if (regenerando) return;
    setRegenerando(faseId);
    setPdfError("");
    try {
      const res = await fetch(`/api/projects/${proyectoId}/preguntas/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase_id: faseId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      // Refresh suave — la próxima recarga del proyecto traerá las preguntas.
      // Para evitar full reload, simplemente recargamos la página.
      window.location.reload();
    } catch (e) {
      setPdfError(`No se pudieron generar preguntas para ${faseId}: ${(e as Error).message}`);
    } finally {
      setRegenerando(null);
    }
  }

  async function descargarPdf() {
    if (pdfDescargando || totalPreguntas === 0) return;
    setPdfDescargando(true);
    setPdfError("");
    try {
      const res = await fetch(`/api/projects/${proyectoId}/preguntas/pdf`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const { pdfBase64, fileName } = data as { pdfBase64?: string; fileName?: string };
      if (!pdfBase64) throw new Error("El PDF llegó vacío");
      const binary = atob(pdfBase64);
      const buffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) buffer[i] = binary.charCodeAt(i);
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ?? `banco-preguntas-${tituloProyecto || "monografia"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) {
      setPdfError((e as Error).message);
    } finally {
      setPdfDescargando(false);
    }
  }

  // ── Estado vacío ──────────────────────────────────────────────────────────
  if (bloques.length === 0 && fasesPendientes.length === 0) {
    return (
      <div style={{ padding: "40px 24px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--fg-primary)", margin: "0 0 10px" }}>
          Tu banco de preguntas se arma solo
        </h2>
        <p style={{ fontSize: 14, color: "var(--fg-secondary)", lineHeight: 1.65, margin: 0 }}>
          Cada vez que apruebas un capítulo, la IA genera preguntas que tu tribunal podría
          hacerte sobre ese tema — con una respuesta breve sacada de tu propio texto.
          Cuando termines todos los capítulos, podrás descargar aquí el banco completo
          en PDF para estudiar antes de la defensa.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1000, margin: "0 auto" }}>

      {/* Encabezado */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", margin: "0 0 6px" }}>
          🎓 Banco de preguntas para tu defensa
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--fg-muted)", margin: 0, lineHeight: 1.6 }}>
          Lo que un tribunal podría preguntarte sobre tu monografía, organizado por capítulo.
          Cada pregunta lleva una pista de respuesta sacada de tu propio texto.
        </p>
      </div>

      {/* Stats + botón descarga */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        <Stat icon="🧠" label="De conocimiento" value={String(totalConocimiento)} />
        <Stat icon="🔍" label="De autoría/proceso" value={String(totalAutoria)} />
        <Stat icon="📚" label="Total" value={String(totalPreguntas)} />
      </div>

      {totalPreguntas > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={descargarPdf}
            disabled={pdfDescargando}
            style={{
              width: "100%",
              padding: "18px 22px",
              borderRadius: 14,
              border: "none",
              background: pdfDescargando
                ? "linear-gradient(135deg, #94a3b8, #64748b)"
                : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: pdfDescargando ? "wait" : "pointer",
              boxShadow: "0 8px 22px rgba(124,58,237,0.30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>📥</span>
            <span>{pdfDescargando ? "Generando tu PDF…" : "Descargar PDF para estudiar"}</span>
          </button>
          {pdfError && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 12 }}>
              ⚠ {pdfError}
            </div>
          )}
        </div>
      )}

      {/* Fases pendientes (banner si hay) */}
      {fasesPendientes.length > 0 && (
        <div style={{
          marginBottom: 20,
          padding: "14px 16px",
          borderRadius: 10,
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.28)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706", marginBottom: 8 }}>
            ⏳ Faltan preguntas de {fasesPendientes.length} {fasesPendientes.length === 1 ? "fase" : "fases"}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--fg-secondary)", lineHeight: 1.55, marginBottom: 10 }}>
            La generación corre en background al aprobar cada capítulo. Si quedó alguna pendiente,
            puedes forzarla ahora:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {fasesPendientes.map(f => (
              <button
                key={f.id}
                onClick={() => regenerar(f.id)}
                disabled={regenerando === f.id}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(245,158,11,0.40)",
                  background: regenerando === f.id ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.06)",
                  color: "#d97706",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: regenerando === f.id ? "wait" : "pointer",
                }}
              >
                {regenerando === f.id ? `Generando ${f.label}…` : `↻ ${f.label}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bloques por fase */}
      {bloques.map(bloque => (
        <section
          key={bloque.faseId}
          style={{
            marginBottom: 24,
            padding: "18px 20px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-primary)", margin: 0 }}>
              {bloque.faseLabel}
            </h2>
            <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              {bloque.conocimiento.length + bloque.autoria.length} preguntas
            </span>
          </div>

          {bloque.conocimiento.length > 0 && (
            <BloqueLista
              titulo="🧠 De conocimiento"
              descripcion="Qué te puede preguntar el tribunal académico"
              items={bloque.conocimiento}
              color="#2563eb"
            />
          )}

          {bloque.autoria.length > 0 && (
            <BloqueLista
              titulo="🔍 De autoría / proceso"
              descripcion="Cómo verifican que tú hiciste el trabajo"
              items={bloque.autoria}
              color="#7c3aed"
            />
          )}
        </section>
      ))}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4, fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)" }}>{value}</div>
    </div>
  );
}

function BloqueLista({
  titulo,
  descripcion,
  items,
  color,
}: {
  titulo: string;
  descripcion: string;
  items: PreguntaItem[];
  color: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 2 }}>{titulo}</div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>{descripcion}</div>
      </div>
      <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 13.5, color: "var(--fg-primary)", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.pregunta}</div>
            <div style={{ fontSize: 12.5, color: "var(--fg-secondary)", borderLeft: `2px solid ${color}33`, paddingLeft: 10, lineHeight: 1.55 }}>
              <span style={{ fontWeight: 700, color, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pista de respuesta</span>
              <div style={{ marginTop: 2 }}>{item.respuesta_sugerida}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
