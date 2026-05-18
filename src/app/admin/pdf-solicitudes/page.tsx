"use client";

/**
 * /admin/pdf-solicitudes
 *
 * Panel admin para procesar solicitudes de PDF compilado de los estudiantes.
 * Flujo manual:
 *   1. Estudiante pidió su PDF → aparece acá en estado "pendiente"
 *   2. Admin descarga el .tex (botón)
 *   3. Admin compila en su PC (TeXstudio/MiKTeX/Overleaf)
 *   4. Admin sube el PDF (botón) → estudiante puede descargarlo
 */

import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell, { StaggerRow, useCountUp } from "@/components/admin/AdminShell";

interface Solicitud {
  proyecto_id: string;
  usuario_id: string;
  titulo: string;
  servicio_id: string | null;
  pdf_solicitado_at: string | null;
  pdf_compilado_at: string | null;
  pdf_compilado_filename: string | null;
  pdf_compilado_bytes: number | null;
  pdf_compilado_por: string | null;
}

function formatTiempoTranscurrido(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return "hace menos de 1 min";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias}d`;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function Kpi({ code, value, color, index }: { code: string; value: number; color?: string; index: number }) {
  const counted = useCountUp(value, 700, 150 + index * 60);
  return (
    <StaggerRow index={index}>
      <div className="adm-card adm-card-strong p-4 text-center">
        <div className="adm-label mb-2">{code}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: color ?? "#edf2fb" }}>{counted}</div>
      </div>
    </StaggerRow>
  );
}

function SolicitudCard({ solicitud, onUpload, onRefresh }: {
  solicitud: Solicitud;
  onUpload: () => void;
  onRefresh: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const compilado = Boolean(solicitud.pdf_compilado_at);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Solo se aceptan archivos .pdf");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("pdf", file);
      const res = await fetch(`/api/projects/${solicitud.proyecto_id}/pdf-compilado`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir PDF");
      onUpload();
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        padding: 16,
        background: compilado ? "rgba(34,197,94,0.04)" : "rgba(245,158,11,0.04)",
        border: compilado ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(245,158,11,0.25)",
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#edf2fb", marginBottom: 4 }}>
            {solicitud.titulo}
          </div>
          <div className="adm-muted" style={{ fontSize: 10.5, fontFamily: "ui-monospace, monospace" }}>
            ID: {solicitud.proyecto_id.slice(0, 12)}… · Usuario: {solicitud.usuario_id.slice(0, 12)}… · {solicitud.servicio_id ?? "—"}
          </div>
        </div>
        <span
          style={{
            padding: "3px 10px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
            background: compilado ? "#10B981" : "#F59E0B",
            color: "white",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {compilado ? "✅ COMPILADO" : "⏳ PENDIENTE"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#cad5e2", marginBottom: 12, flexWrap: "wrap" }}>
        {solicitud.pdf_solicitado_at && (
          <div>📨 Solicitado {formatTiempoTranscurrido(solicitud.pdf_solicitado_at)}</div>
        )}
        {compilado && (
          <>
            <div>✅ Subido {formatTiempoTranscurrido(solicitud.pdf_compilado_at)}</div>
            <div>📦 {formatBytes(solicitud.pdf_compilado_bytes)}</div>
            {solicitud.pdf_compilado_por && <div>👤 {solicitud.pdf_compilado_por}</div>}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a
          href={`/projects/${solicitud.proyecto_id}/workspace`}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-btn"
          style={{ textDecoration: "none" }}
        >
          🔍 ver proyecto
        </a>
        <a
          href={`/api/projects/${solicitud.proyecto_id}/paquete-latex`}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-btn"
          style={{ textDecoration: "none", color: "#a78bfa", borderColor: "rgba(167,139,250,0.4)" }}
        >
          ⬇️ descargar .tex
        </a>
        {compilado && (
          <a
            href={`/api/projects/${solicitud.proyecto_id}/pdf-compilado`}
            target="_blank"
            rel="noopener noreferrer"
            className="adm-btn"
            style={{ textDecoration: "none", color: "#10B981", borderColor: "rgba(16,185,129,0.4)" }}
          >
            📄 descargar pdf actual
          </a>
        )}
        <label
          className="adm-btn"
          style={{
            cursor: uploading ? "wait" : "pointer",
            background: "rgba(0,194,255,0.1)",
            color: "#00c2ff",
            borderColor: "rgba(0,194,255,0.4)",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "subiendo..." : compilado ? "🔄 reemplazar pdf" : "📤 subir pdf compilado"}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelected}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {error && (
        <div style={{ marginTop: 8, padding: "6px 10px", fontSize: 11, color: "#fca5a5", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6 }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}

export default function PdfSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"pendiente" | "compilado" | "todas">("pendiente");
  const [lastUpload, setLastUpload] = useState<string | null>(null);

  const cargar = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/pdf-solicitudes?estado=${filtro}`)
      .then((r) => r.json())
      .then((d) => {
        setSolicitudes(d.solicitudes ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  const pendientes = solicitudes.filter(s => !s.pdf_compilado_at).length;
  const compilados = solicitudes.filter(s => s.pdf_compilado_at).length;

  return (
    <AdminShell
      title="Solicitudes de PDF"
      code="PDF MANUAL"
      subtitle="Estudiantes pidieron compilación. Bajá el .tex, compilá en tu PC, subí el PDF."
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <Kpi code="TOTAL" value={solicitudes.length} index={0} />
        <Kpi code="PENDIENTES" value={pendientes} color="#fde68a" index={1} />
        <Kpi code="COMPILADOS" value={compilados} color="#a7f3d0" index={2} />
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="adm-muted mr-2">filtro:</div>
        {(["pendiente", "compilado", "todas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`adm-btn ${filtro === f ? "adm-btn-active" : ""}`}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <button onClick={cargar} className="adm-btn ml-auto">refresh</button>
      </div>

      {lastUpload && (
        <div style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 8, fontSize: 11.5, color: "#a7f3d0" }}>
          ✅ PDF subido exitosamente para proyecto <code>{lastUpload.slice(0, 12)}…</code>
        </div>
      )}

      {loading ? (
        <div className="adm-muted py-12 text-center">{"// cargando solicitudes..."}</div>
      ) : solicitudes.length === 0 ? (
        <div className="adm-card p-12 text-center">
          <div className="adm-label mb-2">[VACÍO]</div>
          <div className="adm-muted">
            {filtro === "pendiente"
              ? "// sin solicitudes pendientes — todo al día"
              : "// sin resultados para el filtro seleccionado"}
          </div>
        </div>
      ) : (
        <div>
          {solicitudes.map((s) => (
            <SolicitudCard
              key={s.proyecto_id}
              solicitud={s}
              onUpload={() => setLastUpload(s.proyecto_id)}
              onRefresh={cargar}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
