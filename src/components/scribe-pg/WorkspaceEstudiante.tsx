"use client";

/**
 * WorkspaceEstudiante
 *
 * Vista simplificada del workspace para usuarios con role !== "admin".
 * Pensada para estudiantes reales: foco en LEER el documento y SUBIR
 * material/feedback. Sin Inspector IA, sin descargas técnicas (.tex),
 * sin Bitácora, sin Banco de preguntas, sin Cuadernillo.
 *
 * Layout (móvil-first):
 *   [Header simple: ← título · ☰ etapas]
 *   [Main: contenido del capítulo seleccionado en texto plano]
 *   [Chat al pie: input + adjuntar archivo, anclado abajo]
 *
 * Si user.role === "admin" → este componente NO se monta, el workspace
 * usa la UI completa con todas las herramientas.
 */

import { useState } from "react";
import Link from "next/link";
import MarkdownAcademico from "@/components/scribe-pg/MarkdownAcademico";

export interface EtapaItem {
  id: string;
  label: string;
  short: string;
  orden: number;
}

interface Props {
  tituloProyecto: string;
  etapas: EtapaItem[];
  selectedIndex: number;
  onSelect: (idx: number) => void;
  phaseContents: Record<string, string | null | undefined>;
  contenidoActual: string | null | undefined;
  isGenerating: boolean;
  onEnviarMensaje?: (texto: string, archivos: File[]) => Promise<void>;
}

function estaCompleta(phaseId: string, contents: Record<string, string | null | undefined>): boolean {
  const v = contents[phaseId];
  return typeof v === "string" && v.trim().length > 0;
}

export default function WorkspaceEstudiante({
  tituloProyecto,
  etapas,
  selectedIndex,
  onSelect,
  phaseContents,
  contenidoActual,
  isGenerating,
  onEnviarMensaje,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);

  const etapaActual = etapas[selectedIndex];
  const totalCompletas = etapas.filter((e) => estaCompleta(e.id, phaseContents)).length;
  const progreso = etapas.length > 0 ? Math.round((totalCompletas / etapas.length) * 100) : 0;

  async function handleEnviar() {
    if (!onEnviarMensaje) return;
    if (!mensaje.trim() && archivos.length === 0) return;
    setEnviando(true);
    try {
      await onEnviarMensaje(mensaje.trim(), archivos);
      setMensaje("");
      setArchivos([]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="we-root">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="we-header">
        <Link href="/dashboard" className="we-back" aria-label="Volver al inicio">←</Link>
        <div className="we-title-wrap">
          <div className="we-eyebrow">Tu monografía</div>
          <div className="we-title">{tituloProyecto || "Sin título"}</div>
        </div>
        <button
          type="button"
          className="we-etapas-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Ver etapas del documento"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <span>Etapas</span>
        </button>
      </header>

      {/* ── BARRA DE PROGRESO ─────────────────────────────────────────────── */}
      <div className="we-progress-wrap">
        <div className="we-progress-track">
          <div className="we-progress-fill" style={{ width: `${progreso}%` }} />
        </div>
        <div className="we-progress-text">
          <span>{etapaActual ? etapaActual.label : "Sin etapa seleccionada"}</span>
          <span>{totalCompletas}/{etapas.length}</span>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────────── */}
      <main className="we-main">
        {!etapaActual ? (
          <EmptyState texto="Aún no hay capítulos en este proyecto." />
        ) : !contenidoActual ? (
          <EmptyState
            texto={isGenerating
              ? "Generando este capítulo… puede tardar unos minutos."
              : "Este capítulo todavía no se generó."}
          />
        ) : (
          <article className="we-article">
            <MarkdownAcademico markdown={contenidoActual} />
          </article>
        )}
      </main>

      {/* ── CHAT AL PIE ───────────────────────────────────────────────────── */}
      <footer className="we-chat">
        <label className="we-chat-attach" aria-label="Adjuntar archivo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <input
            type="file"
            multiple
            hidden
            onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
            disabled={enviando}
          />
        </label>
        <textarea
          className="we-chat-input"
          rows={1}
          placeholder="Sube tu material o pide un ajuste…"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          disabled={enviando}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleEnviar();
            }
          }}
        />
        <button
          type="button"
          className="we-chat-send"
          onClick={handleEnviar}
          disabled={enviando || (!mensaje.trim() && archivos.length === 0)}
          aria-label="Enviar"
        >
          {enviando ? "…" : "↑"}
        </button>
        {archivos.length > 0 && (
          <div className="we-chat-files">
            {archivos.map((f, i) => (
              <span key={i} className="we-chat-file-chip">📎 {f.name}</span>
            ))}
          </div>
        )}
      </footer>

      {/* ── DRAWER DE ETAPAS ──────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div className="we-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="we-drawer" role="dialog" aria-label="Etapas del documento">
            <div className="we-drawer-header">
              <strong>Etapas del documento</strong>
              <button type="button" className="we-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Cerrar">×</button>
            </div>
            <ul className="we-drawer-list">
              {etapas.map((etapa, idx) => {
                const completa = estaCompleta(etapa.id, phaseContents);
                const seleccionada = idx === selectedIndex;
                return (
                  <li key={etapa.id}>
                    <button
                      type="button"
                      className={`we-drawer-item ${seleccionada ? "is-selected" : ""}`}
                      onClick={() => { onSelect(idx); setDrawerOpen(false); }}
                    >
                      <span className={`we-drawer-status ${completa ? "is-done" : ""}`} aria-hidden="true">
                        {completa ? "✓" : idx + 1}
                      </span>
                      <span className="we-drawer-label">{etapa.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </>
      )}

      {/* ── ESTILOS ───────────────────────────────────────────────────────── */}
      <style>{`
        .we-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          background: var(--bg-base);
        }

        /* Header */
        .we-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          padding-top: max(12px, env(safe-area-inset-top, 12px));
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .we-back {
          color: var(--fg-muted);
          font-size: 22px;
          text-decoration: none;
          line-height: 1;
          padding: 4px 6px;
        }
        .we-title-wrap { flex: 1; min-width: 0; }
        .we-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--fg-muted);
          text-transform: uppercase;
          line-height: 1.2;
        }
        .we-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--fg-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }
        .we-etapas-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: var(--accent);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
        }
        .we-etapas-btn:hover { background: rgba(99, 102, 241, 0.14); }

        /* Progress */
        .we-progress-wrap {
          padding: 8px 16px 10px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .we-progress-track {
          height: 4px;
          background: rgba(148, 163, 184, 0.18);
          border-radius: 99px;
          overflow: hidden;
        }
        .we-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), #4ade80);
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        .we-progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--fg-muted);
          margin-top: 6px;
        }

        /* Main */
        .we-main {
          flex: 1;
          overflow-y: auto;
          padding: 18px 16px 24px;
          -webkit-overflow-scrolling: touch;
        }
        .we-article {
          max-width: 760px;
          margin: 0 auto;
        }

        /* Empty state */
        .we-empty {
          padding: 48px 24px;
          text-align: center;
          color: var(--fg-muted);
          font-size: 14px;
          line-height: 1.6;
        }
        .we-empty-icon {
          font-size: 36px;
          margin-bottom: 8px;
          opacity: 0.6;
        }

        /* Chat */
        .we-chat {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 10px 12px;
          padding-bottom: max(10px, env(safe-area-inset-bottom, 10px));
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          position: relative;
        }
        .we-chat-attach {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(148, 163, 184, 0.12);
          color: var(--fg-muted);
          cursor: pointer;
          flex-shrink: 0;
        }
        .we-chat-attach:hover { background: rgba(148, 163, 184, 0.2); color: var(--fg-primary); }
        .we-chat-input {
          flex: 1;
          min-width: 0;
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 9px 12px;
          font-size: 14px;
          color: var(--fg-primary);
          font-family: inherit;
          resize: none;
          line-height: 1.4;
          max-height: 120px;
        }
        .we-chat-input:focus { outline: 2px solid var(--accent); outline-offset: -2px; }
        .we-chat-send {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
        }
        .we-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .we-chat-files {
          position: absolute;
          bottom: 100%;
          left: 12px;
          right: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px 0;
        }
        .we-chat-file-chip {
          font-size: 11px;
          background: rgba(99, 102, 241, 0.12);
          color: var(--accent);
          padding: 3px 8px;
          border-radius: 99px;
        }

        /* Drawer */
        .we-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          z-index: 100;
          animation: we-fade-in 0.2s ease;
        }
        .we-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(360px, 90vw);
          background: var(--bg-card);
          border-left: 1px solid var(--border);
          z-index: 101;
          display: flex;
          flex-direction: column;
          animation: we-slide-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .we-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          padding-top: max(14px, env(safe-area-inset-top, 14px));
          border-bottom: 1px solid var(--border);
          font-size: 15px;
          color: var(--fg-primary);
        }
        .we-drawer-close {
          border: none;
          background: rgba(148, 163, 184, 0.12);
          color: var(--fg-primary);
          width: 30px;
          height: 30px;
          border-radius: 99px;
          font-size: 18px;
          cursor: pointer;
        }
        .we-drawer-list {
          list-style: none;
          margin: 0;
          padding: 8px 10px;
          overflow-y: auto;
          flex: 1;
        }
        .we-drawer-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          margin: 2px 0;
          border: none;
          background: transparent;
          border-radius: 10px;
          font-size: 13px;
          color: var(--fg-primary);
          text-align: left;
          cursor: pointer;
        }
        .we-drawer-item:hover { background: rgba(148, 163, 184, 0.1); }
        .we-drawer-item.is-selected {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent);
          font-weight: 600;
        }
        .we-drawer-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 99px;
          background: rgba(148, 163, 184, 0.18);
          color: var(--fg-muted);
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .we-drawer-status.is-done {
          background: rgba(74, 222, 128, 0.16);
          color: #16a34a;
        }
        .we-drawer-label {
          flex: 1;
          line-height: 1.35;
        }

        @keyframes we-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes we-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function EmptyState({ texto }: { texto: string }) {
  return (
    <div className="we-empty">
      <div className="we-empty-icon" aria-hidden="true">📄</div>
      <div>{texto}</div>
    </div>
  );
}
