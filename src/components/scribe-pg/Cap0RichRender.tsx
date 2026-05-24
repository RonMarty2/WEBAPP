"use client";

/**
 * Cap0RichRender — render visual del Cap. 0 (Idea de Negocio) por tarjetas.
 *
 * Reemplaza el render de markdown plano por un layout en 4 tarjetas
 * separadas, cada una con su propio header e icono:
 *
 *   💡 Síntesis de tu idea
 *   🎯 Segmento objetivo
 *   ✅ Validación de viabilidad académica (tabla compacta con badges)
 *   📋 Próximos pasos (checklist marcable)
 *
 * Las propuestas de título NO se renderizan acá — se muestran como cards
 * interactivas en Cap0TituloSelector (que va debajo). Este componente
 * espera recibir el markdown YA SIN la sección de propuestas (filtrado
 * con removerSeccionPropuestas).
 *
 * Si el markdown no tiene la estructura esperada, hace fallback al
 * render plano (no rompe ni pierde contenido).
 */

import { useMemo, useState } from "react";

interface Cap0RichRenderProps {
  markdown: string;
}

interface Seccion {
  key: "sintesis" | "segmento" | "validacion" | "pasos" | "otro";
  titulo: string;
  contenido: string;
}

/** Iconos y colores por sección. */
const META: Record<Seccion["key"], { icono: string; color: string; titulo: string }> = {
  sintesis:   { icono: "💡", color: "#8b5cf6", titulo: "Síntesis de tu idea" },
  segmento:   { icono: "🎯", color: "#3b82f6", titulo: "Segmento objetivo" },
  validacion: { icono: "✅", color: "#16a34a", titulo: "Validación de viabilidad académica" },
  pasos:      { icono: "📋", color: "#f59e0b", titulo: "Próximos pasos sugeridos" },
  otro:       { icono: "📄", color: "#6b7280", titulo: "Contenido adicional" },
};

/**
 * Clasifica el header de una sección markdown en uno de los 5 tipos.
 */
function clasificarSeccion(header: string): Seccion["key"] {
  const h = header.toLowerCase();
  if (h.includes("síntesis") || h.includes("sintesis")) return "sintesis";
  if (h.includes("segmento") || h.includes("mercado objetivo")) return "segmento";
  if (h.includes("validación") || h.includes("validacion") || h.includes("viabilidad")) return "validacion";
  if (h.includes("próximos") || h.includes("proximos") || h.includes("pasos")) return "pasos";
  return "otro";
}

/**
 * Divide el markdown del Cap. 0 en secciones según headers ##.
 */
function parsearSecciones(markdown: string): Seccion[] {
  const secciones: Seccion[] = [];
  const partes = markdown.split(/\n(?=##\s)/);
  for (const parte of partes) {
    const match = parte.match(/^##\s+(.+?)\n([\s\S]*)$/);
    if (!match) continue;
    const titulo = match[1].trim();
    const contenido = match[2].trim();
    if (!contenido) continue;
    secciones.push({
      key: clasificarSeccion(titulo),
      titulo,
      contenido,
    });
  }
  return secciones;
}

/**
 * Renderiza una tabla markdown como HTML simple.
 * Solo soporta el formato | celda | celda | (típico del cap0).
 */
function renderTabla(contenido: string): React.ReactNode {
  const lineas = contenido.split("\n").map((l) => l.trim()).filter(Boolean);
  const filas = lineas.filter((l) => l.startsWith("|") && !/^\|[\s\-:|]+\|/.test(l));
  if (filas.length < 2) return null;

  const matriz = filas.map((f) =>
    f.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length)
  );

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {matriz[0].map((c, i) => (
            <th
              key={i}
              style={{
                textAlign: i === 0 ? "left" : "center",
                padding: "8px 10px",
                background: "var(--bg-secondary)",
                borderBottom: "2px solid var(--border)",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--fg-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {c.replace(/[*_]/g, "").trim()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matriz.slice(1).map((fila, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-secondary)" }}>
            {fila.map((c, j) => {
              const limpia = c.replace(/[*_]/g, "").trim();
              const esEstado = /^✅$|^⚠️$|^❌$/.test(limpia);
              return (
                <td
                  key={j}
                  style={{
                    textAlign: j === 0 ? "left" : (esEstado ? "center" : "left"),
                    padding: "8px 10px",
                    borderBottom: "1px solid var(--border)",
                    fontWeight: esEstado ? 700 : 400,
                    fontSize: esEstado ? 16 : 13,
                  }}
                >
                  {limpia}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Renderiza próximos pasos como checklist con checkboxes.
 * Detecta items numerados "1. ..." o bullets "- ...".
 */
function ChecklistPasos({ contenido }: { contenido: string }) {
  const items = useMemo(() => {
    const lineas = contenido.split("\n").map((l) => l.trim()).filter(Boolean);
    const result: string[] = [];
    let current: string[] = [];

    for (const l of lineas) {
      const inicio = l.match(/^(?:\d+[.\)]|\*|-)\s+(.+)$/);
      if (inicio) {
        if (current.length) result.push(current.join(" "));
        current = [inicio[1]];
      } else if (current.length) {
        current.push(l);
      }
    }
    if (current.length) result.push(current.join(" "));
    return result.map((s) => s.replace(/[*_]+/g, "").trim()).filter(Boolean);
  }, [contenido]);

  const [marcados, setMarcados] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setMarcados((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  if (items.length === 0) {
    return <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7 }}>{contenido}</div>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => {
        const checked = marcados.has(i);
        return (
          <li key={i}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: 10,
                borderRadius: 8,
                background: checked ? "rgba(34,197,94,0.08)" : "var(--bg-secondary)",
                border: `1px solid ${checked ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(i)}
                style={{ marginTop: 3, accentColor: "#16a34a", cursor: "pointer", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: checked ? "var(--fg-muted)" : "var(--fg-primary)",
                  textDecoration: checked ? "line-through" : "none",
                  flex: 1,
                }}
              >
                {item}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Bloque interno por sección — sin borde, sin card propia. Va dentro de
 * una sola card contenedora con divisores horizontales entre bloques.
 */
function SeccionInterna({ seccion, esPrimera }: { seccion: Seccion; esPrimera: boolean }) {
  const meta = META[seccion.key];
  const hasTabla = /\n\|.*\|/.test(seccion.contenido) && /\|[\s\-:|]+\|/.test(seccion.contenido);

  return (
    <div
      style={{
        padding: "18px 0",
        borderTop: esPrimera ? "none" : "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>{meta.icono}</span>
        <h3 style={{
          fontSize: 13,
          fontWeight: 800,
          margin: 0,
          color: meta.color,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {meta.titulo}
        </h3>
      </div>

      {seccion.key === "pasos" ? (
        <ChecklistPasos contenido={seccion.contenido} />
      ) : seccion.key === "validacion" && hasTabla ? (
        <>
          {(() => {
            const lineas = seccion.contenido.split("\n");
            const tablaInicio = lineas.findIndex((l) => l.trim().startsWith("|"));
            const proseAntes = tablaInicio > 0 ? lineas.slice(0, tablaInicio).join("\n").trim() : "";
            const tablaYResto = tablaInicio >= 0 ? lineas.slice(tablaInicio).join("\n") : seccion.contenido;
            return (
              <>
                {proseAntes && (
                  <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.65, marginBottom: 10, color: "var(--fg-secondary)" }}>
                    {proseAntes}
                  </div>
                )}
                {renderTabla(tablaYResto)}
              </>
            );
          })()}
        </>
      ) : (
        <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.65, color: "var(--fg-primary)" }}>
          {seccion.contenido}
        </div>
      )}
    </div>
  );
}

export default function Cap0RichRender({ markdown }: Cap0RichRenderProps) {
  const secciones = useMemo(() => parsearSecciones(markdown), [markdown]);

  if (secciones.length === 0) {
    return (
      <article
        style={{
          padding: 24,
          borderRadius: 12,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          color: "var(--fg-primary)",
          fontSize: 14,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}
      >
        {markdown}
      </article>
    );
  }

  // Render compacto: UNA SOLA tarjeta contenedora con secciones internas
  // separadas por divisores horizontales. Más limpio que 4 cards separadas.
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "4px 22px 18px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: "var(--fg-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          padding: "14px 0 2px",
        }}
      >
        Contexto de tu idea
      </div>
      {secciones.map((s, i) => (
        <SeccionInterna key={i} seccion={s} esPrimera={i === 0} />
      ))}
    </div>
  );
}
