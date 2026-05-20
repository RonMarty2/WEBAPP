"use client";

/**
 * PdfCanvasViewer — fallback temporal.
 *
 * El visor original requiere `react-pdf` (PDF.js de Mozilla) para renderizar
 * el PDF como canvas y evitar interceptores de navegador (TeraBox, IDM, etc).
 * Esa dependencia no está instalada — instalarla rompería el lock actual.
 *
 * Mientras tanto, este componente ofrece descarga directa con un fallback
 * accesible. Para activar el visor real:
 *
 *   npm install react-pdf pdfjs-dist
 *
 * Luego restaurar este archivo desde git (`git show HEAD~N:.../PdfCanvasViewer.tsx`).
 */

import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "@/styles/react-pdf/AnnotationLayer.css";
import "@/styles/react-pdf/TextLayer.css";

// Worker de PDF.js desde unpkg (CDN público). En producción se puede self-host.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  url: string;
  pageWidth?: number;
}

export default function PdfCanvasViewer({ url }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    fetch(url, { headers: { Accept: "application/json" } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!json.data_base64) throw new Error("Respuesta sin data_base64");
        const bin = atob(json.data_base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/pdf" });
        if (!cancelado) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch((e) => {
        if (!cancelado) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: 24,
        background: "var(--bg-subtle)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 320,
      }}
    >
      {loading && (
        <div style={{ color: "var(--fg-secondary)", textAlign: "center", padding: 40, fontSize: 14 }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          Descargando PDF…
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          style={{
            color: "var(--fg-primary)",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.30)",
            padding: "20px 24px",
            borderRadius: 12,
            maxWidth: 480,
            textAlign: "center",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No se pudo cargar la vista previa</div>
          <div style={{ color: "var(--fg-muted)", marginBottom: 14 }}>{error}</div>
          <a
            href={url}
            download
            style={{
              display: "inline-block",
              color: "white",
              background: "var(--accent)",
              padding: "10px 18px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Descargar PDF
          </a>
        </div>
      )}

      {!loading && !error && blobUrl && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <iframe
            src={blobUrl}
            title="Vista previa del PDF"
            style={{
              width: "100%",
              maxWidth: 920,
              height: "min(80vh, 900px)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "white",
            }}
          />
          <a
            href={blobUrl}
            download="documento.pdf"
            style={{
              color: "var(--accent)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Descargar PDF →
          </a>
        </div>
      )}
    </div>
  );
}
