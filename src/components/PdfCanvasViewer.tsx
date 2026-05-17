"use client";

/**
 * PdfCanvasViewer
 *
 * Renderiza un PDF como una serie de canvases usando react-pdf (Mozilla PDF.js).
 * Diferencia clave vs <iframe> o <object>: las páginas se dibujan como CANVAS
 * (imagen rasterizada). Las extensiones de browser tipo TeraBox, IDM, etc.
 * NO pueden interceptar canvases — solo interceptan requests HTTP de PDFs.
 *
 * Esto resuelve definitivamente el problema "el navegador descarga el PDF
 * en vez de mostrarlo" causado por extensiones del usuario.
 */

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker de PDF.js desde unpkg (CDN público). En producción se puede self-host.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  url: string;
  /** Ancho máximo de cada página renderizada (en píxeles). */
  pageWidth?: number;
}

export default function PdfCanvasViewer({ url, pageWidth = 900 }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n);
          setError(null);
        }}
        onLoadError={(e) => {
          setError(e?.message ?? "No se pudo cargar el PDF");
        }}
        loading={
          <div style={{ color: "white", textAlign: "center", padding: 60, fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div>Cargando PDF…</div>
          </div>
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
