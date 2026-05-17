"use client";

/**
 * PdfCanvasViewer
 *
 * Renderiza un PDF como una serie de canvases usando react-pdf (Mozilla PDF.js).
 *
 * Estrategia anti-interceptor (TeraBox, IDM, etc.):
 *   1. Recibe la URL del endpoint que devuelve el PDF como JSON+base64
 *      (NO como Content-Type: application/pdf, que es lo que esas extensiones
 *      detectan e interceptan respondiendo 204 vacío).
 *   2. Decodifica el base64 a Uint8Array en el cliente.
 *   3. Pasa los bytes a PDF.js como {data: uint8array}, que renderiza cada
 *      página como CANVAS (no interceptable por extensiones).
 *
 * Resultado: el PDF se ve aunque el usuario tenga TeraBox/IDM/Adobe activos.
 */

import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker de PDF.js desde unpkg (CDN público). En producción se puede self-host.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  /** URL del endpoint que devuelve { data_base64: string }. */
  url: string;
  /** Ancho máximo de cada página renderizada (en píxeles). */
  pageWidth?: number;
}

export default function PdfCanvasViewer({ url, pageWidth = 900 }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fetching, setFetching] = useState(true);

  // PDF.js Worker transfiere el ArrayBuffer (lo detacha del thread principal).
  // Si React re-renderiza, el array ya esta detached y crashea. useMemo +
  // clon fresco garantiza que cada montaje del <Document> tenga su propia copia.
  const fileObj = useMemo(() => {
    if (!pdfBytes) return null;
    // .slice() clona el buffer entero (immutable input para PDF.js).
    return { data: pdfBytes.slice() };
  }, [pdfBytes]);

  // Descarga el PDF como JSON (TeraBox no intercepta JSON) y decodifica el base64.
  useEffect(() => {
    let cancelado = false;
    setFetching(true);
    setError(null);
    setPdfBytes(null);

    fetch(url, { headers: { Accept: "application/json" } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!json.data_base64) throw new Error("Respuesta sin data_base64");
        // Decodifica base64 → binary string → Uint8Array
        const bin = atob(json.data_base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        if (!cancelado) setPdfBytes(bytes);
      })
      .catch((e) => {
        if (!cancelado) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelado) setFetching(false);
      });

    return () => {
      cancelado = true;
    };
  }, [url]);

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: "20px 12px",
        background: "#525659",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {fetching && (
        <div style={{ color: "white", textAlign: "center", padding: 60, fontSize: 14 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>Descargando PDF…</div>
        </div>
      )}
      <Document
        file={fileObj}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n);
          setError(null);
        }}
        onLoadError={(e) => {
          setError(e?.message ?? "No se pudo cargar el PDF");
        }}
        loading={
          pdfBytes ? (
            <div style={{ color: "white", textAlign: "center", padding: 60, fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <div>Renderizando páginas…</div>
            </div>
          ) : null
        }
      >
        {numPages &&
          Array.from(new Array(numPages), (_, i) => (
            <div
              key={`page_${i + 1}`}
              style={{
                marginBottom: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                background: "white",
              }}
            >
              <Page
                pageNumber={i + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
      </Document>

      {error && (
        <div
          style={{
            color: "white",
            background: "rgba(239,68,68,0.20)",
            border: "1px solid rgba(239,68,68,0.4)",
            padding: "16px 20px",
            borderRadius: 8,
            margin: 24,
            maxWidth: 480,
            textAlign: "center",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          ❌ {error}
          <div style={{ marginTop: 10 }}>
            <a
              href={url}
              download
              style={{
                color: "white",
                background: "#2563eb",
                padding: "8px 16px",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              ⬇ Descargar PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
