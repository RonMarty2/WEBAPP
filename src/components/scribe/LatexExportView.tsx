"use client";

/**
 * LatexExportView
 *
 * Pantalla especializada para la fase de Compilación LaTeX (ph-latex).
 * El output de la IA es un único archivo .tex completo. En lugar de mostrarlo
 * como markdown crudo, lo presentamos con:
 *   - Resumen del documento (caracteres, líneas)
 *   - Botón Copiar al portapapeles
 *   - Botón Descargar .tex
 *   - Botón Abrir en Overleaf (compila online sin instalar nada)
 *   - Vista previa del código con resaltado básico
 *
 * Maneja también el caso "REPORTE DE BLOQUEO EDITORIAL" cuando la IA detecta
 * problemas y se niega a generar el .tex.
 */

import { useMemo, useState } from "react";

interface Props {
  rawContent: string;
  tituloProyecto?: string;
  /** URL del logo de la universidad (ej. "/logos/umss.png") para descarga separada. */
  logoUrl?: string;
  /** ID del proyecto, necesario para llamar al endpoint de paquete completo. */
  proyectoId?: string;
}

function extractLatexCode(text: string): string | null {
  if (!text) return null;
  const fenced = text.match(/```(?:latex|tex)\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  // Si no hay fence pero tiene \documentclass, todo es LaTeX
  if (text.includes("\\documentclass")) return text.trim();
  return null;
}

function isBlockReport(text: string): boolean {
  return /REPORTE DE BLOQUEO EDITORIAL|No se genera LaTeX/i.test(text);
}

export default function LatexExportView({ rawContent, tituloProyecto, logoUrl, proyectoId }: Props) {
  const [copied, setCopied] = useState(false);
  const [logoDescargado, setLogoDescargado] = useState(false);
  const [pdfDescargando, setPdfDescargando] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [paqueteDescargando, setPaqueteDescargando] = useState(false);
  const [paqueteError, setPaqueteError] = useState("");

  /**
   * El botón PRINCIPAL del estudiante: descarga el PDF compilado directamente.
   * El backend genera el HTML, lo renderiza con Chrome headless, y devuelve el
   * PDF. El estudiante NO toca Overleaf ni LaTeX.
   */
  async function handleDownloadPdf() {
    if (!proyectoId || pdfDescargando) return;
    setPdfDescargando(true);
    setPdfError("");
    try {
      const res = await fetch(`/api/projects/${proyectoId}/pdf`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const nameMatch = cd.match(/filename="?([^"]+)"?/);
      const filename = nameMatch?.[1] ?? `${tituloProyecto || "monografia"}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setPdfError((e as Error).message);
    } finally {
      setPdfDescargando(false);
    }
  }

  /**
   * ADMIN: descarga UN solo ZIP con .tex + logo + README para editar en Overleaf.
   * Útil para revisar o ajustar el LaTeX manualmente.
   */
  async function handleDownloadPaquete() {
    if (!proyectoId || paqueteDescargando) return;
    setPaqueteDescargando(true);
    setPaqueteError("");
    try {
      const res = await fetch(`/api/projects/${proyectoId}/paquete-latex`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const nameMatch = cd.match(/filename="?([^"]+)"?/);
      const filename = nameMatch?.[1] ?? `${tituloProyecto || "monografia"}-overleaf.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setPaqueteError((e as Error).message);
    } finally {
      setPaqueteDescargando(false);
    }
  }

  /**
   * Descarga el logo de la universidad con el nombre EXACTO que espera el .tex
   * (logo-universidad.png). Esto permite que el estudiante suba ambos archivos
   * a Overleaf y el .tex compile el logo directamente.
   */
  async function handleDownloadLogo() {
    if (!logoUrl) return;
    try {
      const res = await fetch(logoUrl);
      if (!res.ok) throw new Error("No se pudo descargar el logo");
      const blob = await res.blob();
      // Intentar respetar extensión del archivo original (png/jpg)
      const extMatch = logoUrl.match(/\.(png|jpe?g|webp|gif|svg)(\?|$)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : "png";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logo-universidad.${ext === "jpeg" ? "jpg" : ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLogoDescargado(true);
      setTimeout(() => setLogoDescargado(false), 2500);
    } catch (e) {
      console.error("Error descargando logo:", e);
    }
  }

  const latex = useMemo(() => extractLatexCode(rawContent), [rawContent]);
  const isBlocked = isBlockReport(rawContent);

  const stats = useMemo(() => {
    if (!latex) return null;
    return {
      lines: latex.split("\n").length,
      chars: latex.length,
      kb: (latex.length / 1024).toFixed(1),
    };
  }, [latex]);

  async function handleCopy() {
    if (!latex) return;
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: textarea + execCommand
      const ta = document.createElement("textarea");
      ta.value = latex;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    if (!latex) return;
    const slug = (tituloProyecto || "monografia")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    const blob = new Blob([latex], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "monografia"}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleOverleaf() {
    if (!latex) return;
    // Overleaf acepta el código LaTeX como POST a su URL pública
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.overleaf.com/docs";
    form.target = "_blank";
    form.rel = "noopener noreferrer";
    const input = document.createElement("textarea");
    input.name = "snip";
    input.value = latex;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  // ── Caso A: Reporte de bloqueo (la IA se negó a generar) ──────────────────
  if (isBlocked) {
    return (
      <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          padding: "20px 24px", marginBottom: 20,
          background: "rgba(245,158,11,0.08)", border: "2px solid rgba(245,158,11,0.35)",
          borderRadius: 12, color: "var(--fg-primary)",
        }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            ⚠️ Documento no listo para compilar
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "var(--fg-primary)" }}>
            La IA detectó problemas que deben corregirse antes de generar el LaTeX final
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--fg-secondary)", lineHeight: 1.6 }}>
            Revisa el reporte abajo, corrige los puntos indicados en los capítulos
            correspondientes (volviendo a las fases anteriores), y vuelve a generar esta fase.
          </p>
        </div>
        <pre style={{
          whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7,
          color: "var(--fg-primary)", fontFamily: "var(--font-crimson), Georgia, serif",
          padding: 20, background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 10,
        }}>{rawContent}</pre>
      </div>
    );
  }

  // ── Caso B: No se pudo extraer LaTeX (formato inesperado) ─────────────────
  if (!latex) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{
          padding: "12px 16px", marginBottom: 16,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 10, fontSize: 13, color: "#ef4444",
        }}>
          ⚠️ No se pudo extraer código LaTeX del output. Intentá regenerar la fase.
        </div>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7 }}>{rawContent}</pre>
      </div>
    );
  }

  // ── Caso C: LaTeX listo — UI con acciones ─────────────────────────────────
  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Encabezado */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", margin: "0 0 6px" }}>
          📄 Tu monografía está lista para compilar
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--fg-muted)", margin: 0, lineHeight: 1.6 }}>
          Documento LaTeX completo generado. Elegí cómo seguir abajo.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18,
        }}>
          <Stat label="Líneas" value={stats.lines.toLocaleString()} icon="📝" />
          <Stat label="Caracteres" value={stats.chars.toLocaleString()} icon="🔤" />
          <Stat label="Tamaño" value={`${stats.kb} KB`} icon="💾" />
        </div>
      )}

      {/* ACCIÓN PRINCIPAL DEL ESTUDIANTE — descarga PDF directo, sin Overleaf */}
      {proyectoId && (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfDescargando}
            style={{
              width: "100%",
              padding: "20px 24px",
              borderRadius: 14,
              border: "none",
              background: pdfDescargando
                ? "linear-gradient(135deg, #94a3b8, #64748b)"
                : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              fontSize: 17,
              fontWeight: 700,
              cursor: pdfDescargando ? "wait" : "pointer",
              boxShadow: "0 8px 22px rgba(37,99,235,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => { if (!pdfDescargando) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            <span style={{ fontSize: 24 }}>📥</span>
            <span>{pdfDescargando ? "Generando tu PDF…" : "Descargar mi monografía (PDF)"}</span>
          </button>
          <div style={{ fontSize: 12, color: "var(--fg-secondary)", marginTop: 10, lineHeight: 1.55, textAlign: "center" }}>
            {pdfDescargando
              ? "Esto toma 10–20 segundos. La página se queda esperando — no la cierres."
              : "Tu monografía completa con carátula UMSS, logo, índice y formato APA 7."}
          </div>
          {pdfError && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 12, lineHeight: 1.5 }}>
              ⚠ {pdfError}
            </div>
          )}
        </div>
      )}

      {/* OPCIONES AVANZADAS — solo admin, escondidas detrás de <details> */}
      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--fg-muted)", padding: "8px 0", userSelect: "none" }}>
          Opciones avanzadas (admin) — LaTeX / Overleaf / código crudo
        </summary>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Paquete LaTeX para Overleaf */}
          {proyectoId && (
            <button
              type="button"
              onClick={handleDownloadPaquete}
              disabled={paqueteDescargando}
              style={{
                padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border)",
                background: "rgba(16,185,129,0.06)", color: "#059669", fontSize: 12.5, fontWeight: 600,
                cursor: paqueteDescargando ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span>📦</span>
              <span>{paqueteDescargando ? "Preparando ZIP…" : "Paquete LaTeX (.tex + logo) para Overleaf"}</span>
            </button>
          )}
          {paqueteError && <div style={{ fontSize: 11, color: "#ef4444" }}>⚠ {paqueteError}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
            <ActionCard
              onClick={handleOverleaf}
              title="🚀 Abrir en Overleaf"
              subtitle="Pegar código directo"
            />
            <ActionCard
              onClick={handleDownload}
              title="💾 Solo .tex"
              subtitle="Sin logo ni datos"
            />
            <ActionCard
              onClick={handleCopy}
              title={copied ? "✅ Copiado" : "📋 Copiar"}
              subtitle={copied ? "En el portapapeles" : "Código crudo"}
            />
            {logoUrl && (
              <ActionCard
                onClick={handleDownloadLogo}
                title={logoDescargado ? "✅ Logo listo" : "🏛️ Solo logo"}
                subtitle="Por separado"
              />
            )}
          </div>
        </div>
      </details>

      {/* Instrucciones rápidas */}
      <details style={{
        marginBottom: 20,
        padding: "12px 16px",
        background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.20)",
        borderRadius: 10,
      }}>
        <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
          💡 ¿Cómo obtengo el PDF final?
        </summary>
        <ol style={{ margin: "10px 0 0", paddingLeft: 22, fontSize: 13, color: "var(--fg-secondary)", lineHeight: 1.7 }}>
          <li>Apretá <strong>Abrir en Overleaf</strong> — se abrirá un proyecto nuevo con tu LaTeX</li>
          <li>Overleaf compilará automáticamente y verás el PDF al lado derecho</li>
          <li>Si hay errores de compilación, Overleaf los marca en rojo — corregilos ahí mismo</li>
          <li>Cuando esté listo, descargá el PDF desde el botón de Overleaf</li>
        </ol>
      </details>

      {/* Vista previa del código */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-secondary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Vista previa del código
          </h3>
          <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
            Solo lectura · Edita en Overleaf si necesitás cambios
          </span>
        </div>
        <pre style={{
          margin: 0,
          padding: "16px 18px",
          background: "#0f172a",
          color: "#e2e8f0",
          borderRadius: 10,
          border: "1px solid var(--border)",
          fontSize: 12.5,
          lineHeight: 1.65,
          fontFamily: 'ui-monospace, "SF Mono", Consolas, "Courier New", monospace',
          maxHeight: 480,
          overflow: "auto",
          whiteSpace: "pre",
        }}>
          <code>{latex}</code>
        </pre>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{
      padding: "12px 14px", background: "var(--bg-card)",
      border: "1px solid var(--border)", borderRadius: 10,
    }}>
      <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4, fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg-primary)" }}>{value}</div>
    </div>
  );
}

function ActionCard({
  onClick, title, subtitle, accent, recommended,
}: { onClick: () => void; title: string; subtitle: string; accent?: boolean; recommended?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        padding: "16px 18px",
        textAlign: "left",
        borderRadius: 12,
        border: accent ? "none" : "1px solid var(--border)",
        background: accent
          ? "linear-gradient(135deg, #4ade80, #22c55e)"
          : "var(--bg-card)",
        color: accent ? "white" : "var(--fg-primary)",
        cursor: "pointer",
        transition: "transform 0.1s, box-shadow 0.1s",
        boxShadow: accent ? "0 4px 14px rgba(34,197,94,0.25)" : "var(--shadow-sm)",
      }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      {recommended && (
        <span style={{
          position: "absolute", top: -8, right: 14,
          padding: "2px 8px", borderRadius: 999,
          background: "white", color: "#22c55e",
          fontSize: 9, fontWeight: 800, letterSpacing: "0.05em",
        }}>
          RECOMENDADO
        </span>
      )}
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>{subtitle}</div>
    </button>
  );
}
