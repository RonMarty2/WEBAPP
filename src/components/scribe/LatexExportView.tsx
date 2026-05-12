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
  const [paqueteWarning, setPaqueteWarning] = useState<{ count: number; names: string[] } | null>(null);

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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const { pdfBase64, bytes, fileName } = data as { pdfBase64?: string; bytes?: number; fileName?: string };
      if (!pdfBase64 || !bytes) {
        throw new Error("El PDF se generó pero llegó vacío. Intentá de nuevo.");
      }
      // Decodificar base64 → bytes → Blob → descarga
      const binary = atob(pdfBase64);
      const buffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) buffer[i] = binary.charCodeAt(i);
      if (buffer.byteLength === 0) {
        throw new Error("El PDF decodificado quedó vacío. Reportá esto al admin.");
      }
      const blob = new Blob([buffer], { type: "application/pdf" });
      const filename = fileName ?? `${tituloProyecto || "monografia"}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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

  /**
   * ADMIN: descarga UN solo ZIP con .tex + logo + README para editar en Overleaf.
   * Útil para revisar o ajustar el LaTeX manualmente.
   */
  async function handleDownloadPaquete() {
    if (!proyectoId || paqueteDescargando) return;
    setPaqueteDescargando(true);
    setPaqueteError("");
    setPaqueteWarning(null);
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

      // Si el servidor saneó figuras huérfanas, avisar al usuario.
      const orphanCount = Number(res.headers.get("X-Latex-Orphan-Count") ?? "0");
      if (orphanCount > 0) {
        const raw = res.headers.get("X-Latex-Orphan-Names") ?? "";
        const names = raw
          ? raw.split(",").map(n => { try { return decodeURIComponent(n); } catch { return n; } })
          : [];
        setPaqueteWarning({ count: orphanCount, names });
      }
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

      {/* ACCIÓN PRINCIPAL DEL ESTUDIANTE — paquete .tex + logo + instrucciones (Overleaf) */}
      {proyectoId && (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={handleDownloadPaquete}
            disabled={paqueteDescargando}
            style={{
              width: "100%",
              padding: "20px 24px",
              borderRadius: 14,
              border: "none",
              background: paqueteDescargando
                ? "linear-gradient(135deg, #94a3b8, #64748b)"
                : "linear-gradient(135deg, #059669, #047857)",
              color: "white",
              fontSize: 17,
              fontWeight: 700,
              cursor: paqueteDescargando ? "wait" : "pointer",
              boxShadow: "0 8px 22px rgba(5,150,105,0.30)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => { if (!paqueteDescargando) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            <span style={{ fontSize: 24 }}>📦</span>
            <span>{paqueteDescargando ? "Preparando paquete…" : "Descargar paquete (.tex + logo + instrucciones)"}</span>
          </button>
          <div style={{ fontSize: 12, color: "var(--fg-secondary)", marginTop: 10, lineHeight: 1.55, textAlign: "center" }}>
            {paqueteDescargando
              ? "Armando tu ZIP con el .tex, el logo institucional y el README. Un momento…"
              : "ZIP con .tex + logo + README. Subilo a Overleaf y obtenés el PDF compilado."}
          </div>
          {paqueteError && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: 12, lineHeight: 1.5 }}>
              ⚠ {paqueteError}
            </div>
          )}
          {paqueteWarning && (
            <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.30)", color: "var(--fg-primary)", fontSize: 12.5, lineHeight: 1.55 }}>
              <div style={{ fontWeight: 700, color: "#d97706", marginBottom: 6 }}>
                ⚠ Se omitieron {paqueteWarning.count} {paqueteWarning.count === 1 ? "figura" : "figuras"} sin archivo asociado
              </div>
              <div style={{ color: "var(--fg-secondary)", marginBottom: paqueteWarning.names.length ? 6 : 0 }}>
                El documento mencionaba imágenes pero no se subió ningún archivo correspondiente, así que se quitaron del .tex para que Overleaf compile sin error.
              </div>
              {paqueteWarning.names.length > 0 && (
                <div style={{ fontSize: 11.5, color: "var(--fg-muted)", fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace' }}>
                  {paqueteWarning.names.slice(0, 5).map(n => `• ${n}`).join("  ")}
                  {paqueteWarning.count > 5 ? `  • … (+${paqueteWarning.count - 5} más)` : ""}
                </div>
              )}
              <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 6 }}>
                Mirá el <strong>README.txt</strong> dentro del ZIP para instrucciones de cómo restaurarlas si las querés.
              </div>
            </div>
          )}
        </div>
      )}

      {/* OPCIONES AVANZADAS — solo admin, escondidas detrás de <details> */}
      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--fg-muted)", padding: "8px 0", userSelect: "none" }}>
          Opciones avanzadas (admin) — PDF directo / LaTeX / Overleaf / código crudo
        </summary>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* PDF directo (admin) — útil para preview rápido sin Overleaf */}
          {proyectoId && (
            <>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfDescargando}
                style={{
                  padding: "12px 14px", borderRadius: 8, border: "1px solid var(--border)",
                  background: "rgba(37,99,235,0.06)", color: "#2563eb", fontSize: 12.5, fontWeight: 600,
                  cursor: pdfDescargando ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <span>📥</span>
                <span>{pdfDescargando ? "Generando PDF directo…" : "PDF directo (sin Overleaf, sin carátula)"}</span>
              </button>
              {pdfError && <div style={{ fontSize: 11, color: "#ef4444" }}>⚠ {pdfError}</div>}
            </>
          )}

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
          <li>Apretá <strong>Descargar paquete</strong> arriba — bajás un ZIP con el .tex, el logo y un README</li>
          <li>Entrá a <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>overleaf.com</a>, creá una cuenta gratis y elegí <em>New Project → Upload Project</em></li>
          <li>Subí el ZIP completo — Overleaf compila automáticamente y verás el PDF al lado derecho</li>
          <li>Armá tu carátula con la plantilla institucional de tu universidad y descargá el PDF final</li>
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
