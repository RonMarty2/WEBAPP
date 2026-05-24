"use client";

/**
 * Preview PDF del Proyecto de Grado — vista del documento completo
 * concatenado con estilo de PDF académico (UCATEC). Solo lectura, sin
 * botones de aprobar/regenerar/editar.
 *
 * El estudiante puede ver acá cómo se verá el documento final antes de
 * compilarlo a LaTeX/PDF. Útil para estimar páginas, revisar coherencia
 * global, detectar secciones vacías o incompletas.
 *
 * Diseño:
 *  - Hojas A4 con sombra (simula imprenta).
 *  - Tipografía serif Times/Georgia, interlineado 1.5, márgenes UCATEC.
 *  - Carátula simulada al inicio (universidad, carrera, título, autor,
 *    ciudad, año).
 *  - Cada capítulo separado por salto de hoja visual.
 *  - Header con título corto del proyecto, footer con número de página
 *    estimado.
 *  - Diagramas TikZ/LaTeX como placeholders elegantes (igual que el
 *    workspace), con nota explicativa de que se renderizarán en el PDF
 *    final.
 */

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MarkdownAcademico from "@/components/scribe-pg/MarkdownAcademico";

interface Proyecto {
  id: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  servicio_id: string;
  tipo_proyecto_id?: string;
  universidad_id?: string;
  phase_contents?: Record<string, string | null>;
  academic_context?: Record<string, unknown>;
}

interface PhaseDef {
  id: string;
  label: string;
  short_label?: string;
  orden: number;
}

// Páginas estimadas: 350 palabras por página (Times NR 12, interlineado 1.5)
function estimarPaginas(texto: string): number {
  if (!texto) return 0;
  const palabras = texto.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(palabras / 350));
}

export default function PreviewPgPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const proyectoId = params?.id ?? "";

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [phaseDefs, setPhaseDefs] = useState<PhaseDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [meRes, projRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/projects/${proyectoId}`),
        ]);
        if (cancelled) return;
        const meData = await meRes.json();
        if (!meData.user) { router.replace("/login"); return; }
        if (!projRes.ok) { router.replace("/dashboard"); return; }
        const proj: Proyecto = (await projRes.json()).proyecto;
        setProyecto(proj);

        const phaseParams = new URLSearchParams({
          servicio_id: proj.servicio_id ?? "proy-grado-001",
        });
        const fasesRes = await fetch(`/api/projects/${proj.id}/phases?${phaseParams}`);
        if (fasesRes.ok) {
          const data = await fasesRes.json();
          const fases: PhaseDef[] = (data.phases ?? []).map((p: { id: string; label: string; short_label?: string; orden: number }) => ({
            id: p.id, label: p.label, short_label: p.short_label, orden: p.orden,
          }));
          setPhaseDefs(fases.sort((a, b) => a.orden - b.orden));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (proyectoId) load();
    return () => { cancelled = true; };
  }, [proyectoId, router]);

  // Fases que van al documento final (excluye cap0 idea de negocio y defensa)
  const fasesDocumento = useMemo(() => {
    return phaseDefs.filter((p) => {
      const id = (p.id || "").toLowerCase();
      // Excluir fases internas/paratexto
      if (id.includes("cap0")) return false;       // idea de negocio: solo validación
      if (id.includes("defensa")) return false;    // banco preguntas: paratexto
      if (id.includes("latex")) return false;      // wrapper de compilación
      return true;
    });
  }, [phaseDefs]);

  const totalPaginasEstimadas = useMemo(() => {
    if (!proyecto) return 0;
    return fasesDocumento.reduce((acc, p) => {
      const contenido = proyecto.phase_contents?.[p.id] ?? "";
      return acc + estimarPaginas(contenido);
    }, 0);
  }, [fasesDocumento, proyecto]);

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-secondary)" }}>Cargando preview…</div>;
  }
  if (!proyecto) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Proyecto no encontrado. <Link href="/dashboard">← Dashboard</Link></div>;
  }

  const titulo = proyecto.tema_aprobado || proyecto.titulo_provisional || "Proyecto sin título";
  const ctx = (proyecto.academic_context?.contexto_inicial ?? {}) as Record<string, string | undefined>;
  const carrera = ctx.carrera ?? "Carrera no especificada";
  const programa = ctx.programa ?? "Programa no especificado";
  const anio = new Date().getFullYear();

  return (
    <div className="preview-pdf-root" style={{
      minHeight: "100vh",
      background: "#525659", // gris oscuro tipo lector PDF
      paddingTop: 24,
      paddingBottom: 60,
    }}>
      {/* Estilos de impresión: cuando el usuario hace Ctrl+P o aprieta
          "Descargar PDF", la página se imprime SIN la barra superior,
          SIN el fondo gris, con cada hoja como página A4 real. */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body { background: white !important; }
          .preview-pdf-toolbar, .preview-pdf-footer { display: none !important; }
          .preview-pdf-root {
            background: white !important;
            padding: 0 !important;
          }
          .preview-pdf-hoja {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
            width: 100% !important;
            min-height: auto !important;
            max-width: none !important;
          }
          .preview-pdf-hoja:last-child {
            page-break-after: auto;
          }
        }
      `}</style>

      {/* Barra superior pegajosa */}
      <div className="preview-pdf-toolbar" style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(40,42,45,0.95)",
        backdropFilter: "blur(8px)",
        padding: "10px 24px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <Link
          href={`/projects/${proyectoId}/workspace-pg`}
          style={{ color: "#cbd5e1", fontSize: 13, textDecoration: "none", fontWeight: 600 }}
        >
          ← Volver al workspace
        </Link>
        <div style={{ flex: 1, color: "white", fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📄 Vista previa del documento
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12 }}>
          Estimado: <strong style={{ color: "white" }}>{totalPaginasEstimadas}</strong> páginas
        </div>
        <a
          href={`/api/projects/${proyectoId}/paquete-latex-pg`}
          download
          style={{
            padding: "8px 16px",
            borderRadius: 7,
            background: "#16a34a",
            color: "white",
            border: "none",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
          title="Descarga un ZIP con el archivo .tex listo para compilar en tu PC (pdflatex) o subir a Overleaf"
        >
          📦 Descargar LaTeX (.zip)
        </a>
      </div>

      {/* ───── CARÁTULA SIMULADA ───── */}
      <Hoja numero={0}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "#1a1a1a",
        }}>
          {/* Bloque superior */}
          <div>
            <div style={{
              width: 90,
              height: 110,
              border: "1.5px dashed #ccc",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "#999",
              margin: "0 auto 16px",
            }}>
              Logo UCATEC
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
              UNIVERSIDAD PRIVADA DE CIENCIAS<br/>ADMINISTRATIVAS Y TECNOLÓGICAS
            </div>
            <div style={{ fontSize: 11, marginBottom: 2 }}>Facultad de Ciencias Empresariales</div>
            <div style={{ fontSize: 11 }}>Carrera de {carrera}</div>
          </div>

          {/* Bloque centro: tipo + título */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 11, marginBottom: 6 }}>PROYECTO DE GRADO</div>
            <div style={{ fontSize: 11, marginBottom: 24 }}>Modalidad de Titulación: {programa.toUpperCase()}</div>
            <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.45, padding: "0 24px" }}>
              «{titulo}»
            </div>
          </div>

          {/* Bloque inferior */}
          <div>
            <div style={{ fontSize: 11, marginBottom: 4 }}>Postulante:</div>
            <div style={{ fontSize: 11, marginBottom: 16, fontStyle: "italic" }}>(Nombre del estudiante)</div>
            <div style={{ fontSize: 11, marginBottom: 2 }}>Cochabamba — Bolivia</div>
            <div style={{ fontSize: 11 }}>{anio}</div>
          </div>
        </div>
      </Hoja>

      {/* ───── ÍNDICE ───── */}
      <Hoja numero={1} titulo="Índice general">
        <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 12, lineHeight: 1.9 }}>
          {fasesDocumento.map((p, i) => {
            const contenido = proyecto.phase_contents?.[p.id] ?? "";
            const pags = estimarPaginas(contenido);
            const pagInicio = fasesDocumento.slice(0, i).reduce((acc, prev) => acc + estimarPaginas(proyecto.phase_contents?.[prev.id] ?? ""), 1);
            return (
              <div key={p.id} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "2px 0",
                color: contenido ? "#1a1a1a" : "#bbb",
              }}>
                <span style={{ flex: 1 }}>
                  {p.label}{contenido ? "" : " (sin generar)"}
                </span>
                <span style={{ borderBottom: "1px dotted #999", flex: 1, marginBottom: 4 }} />
                <span style={{ fontWeight: 700, color: contenido ? "#1a1a1a" : "#bbb" }}>
                  {contenido ? pagInicio : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </Hoja>

      {/* ───── CONTENIDO POR CAPÍTULO ───── */}
      {fasesDocumento.map((p, idx) => {
        const contenido = proyecto.phase_contents?.[p.id] ?? "";
        const pagInicio = fasesDocumento.slice(0, idx).reduce((acc, prev) => acc + estimarPaginas(proyecto.phase_contents?.[prev.id] ?? ""), 2); // 2 = carátula + índice

        if (!contenido) {
          return (
            <Hoja key={p.id} numero={pagInicio} titulo={p.label}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#ccc",
                fontFamily: "Georgia, 'Times New Roman', serif",
                gap: 12,
              }}>
                <div style={{ fontSize: 48 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#999" }}>{p.label}</div>
                <div style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "0 40px" }}>
                  Esta fase aún no ha sido generada.<br/>
                  Volvé al workspace y apretá &quot;Generar {p.label}&quot;.
                </div>
              </div>
            </Hoja>
          );
        }

        // Renderizar fase con MarkdownAcademico (ya maneja TikZ/LaTeX como placeholders)
        return (
          <HojaContenido key={p.id} numero={pagInicio} titulo={p.label}>
            <MarkdownAcademico markdown={contenido} />
          </HojaContenido>
        );
      })}

      {/* Footer informativo */}
      <div className="preview-pdf-footer" style={{
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 12,
        padding: "30px 20px 10px",
        maxWidth: 700,
        margin: "0 auto",
        lineHeight: 1.7,
      }}>
        Esta es una <strong>vista previa</strong> simulando el formato del documento.
        Para obtener el archivo final, apretá <strong>📦 Descargar LaTeX (.zip)</strong> arriba.
        El ZIP contiene el archivo <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 3, color: "#cbd5e1" }}>.tex</code> con el preámbulo UCATEC oficial,
        listo para compilar localmente con <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 3, color: "#cbd5e1" }}>pdflatex</code> o subir directo a <a href="https://overleaf.com" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>Overleaf</a>.
        Los diagramas TikZ, fórmulas matemáticas y tablas se renderizan vectorialmente al compilar.
      </div>
    </div>
  );
}

// ── Componente Hoja: simula una página A4 con sombra ───────────────────

function Hoja({ numero, titulo, children }: { numero: number; titulo?: string; children: React.ReactNode }) {
  return (
    <div className="preview-pdf-hoja" style={{
      width: 794,                // ≈A4 a 96dpi (210mm)
      minHeight: 1123,           // ≈A4 a 96dpi (297mm)
      maxWidth: "calc(100vw - 32px)",
      margin: "0 auto 24px",
      background: "white",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      padding: "55px 70px 50px",  // márgenes UCATEC simulados
      display: "flex",
      flexDirection: "column",
      position: "relative",
      color: "#1a1a1a",
    }}>
      {titulo && (
        <div style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 11,
          color: "#666",
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: "1px solid #eee",
          textAlign: "right",
        }}>
          {titulo}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
      {numero > 0 && (
        <div style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 10,
          color: "#999",
          textAlign: "right",
          paddingTop: 12,
          marginTop: 12,
          borderTop: "1px solid #eee",
        }}>
          {numero}
        </div>
      )}
    </div>
  );
}

// Para contenido extenso, dejamos que la hoja crezca según necesite y solo
// simulamos una hoja contenedora (no paginamos automáticamente porque
// requeriría medir alturas exactas).
function HojaContenido({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="preview-pdf-hoja" style={{
      width: 794,
      maxWidth: "calc(100vw - 32px)",
      margin: "0 auto 24px",
      background: "white",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      padding: "55px 70px 50px",
      color: "#1a1a1a",
    }}>
      <div style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 11,
        color: "#666",
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: "1px solid #eee",
        textAlign: "right",
      }}>
        {titulo}
      </div>
      <div>
        {children}
      </div>
      <div style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 10,
        color: "#999",
        textAlign: "right",
        paddingTop: 12,
        marginTop: 24,
        borderTop: "1px solid #eee",
      }}>
        {numero}+
      </div>
    </div>
  );
}
