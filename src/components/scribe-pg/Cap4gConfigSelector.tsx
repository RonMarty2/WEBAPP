"use client";

/**
 * Cap4gConfigSelector — selector de configuración final del proyecto
 * cuando el análisis de sensibilidad del Cap. 4g muestra que existe una
 * configuración recalibrada que vuelve viable el proyecto.
 *
 * Parsea la tabla de sensibilidad del output de cap4g (intenta extraer
 * escenarios alternativos con sus VANs resultantes) y muestra cards
 * seleccionables para que el estudiante elija qué configuración adoptar
 * como propuesta final.
 *
 * Si no detecta tabla de sensibilidad o si todos los escenarios son
 * negativos, no se renderiza.
 */

import { useMemo, useState } from "react";

interface Cap4gConfigSelectorProps {
  contenidoCap4g: string;
  configActual?: string | null;
  onConfigSelected?: (config: string) => void;
}

interface Escenario {
  descripcion: string;
  cambio: string;
  van: number;
  esCombinacion: boolean;
  esViable: boolean;
}

/**
 * Parser que detecta filas de la tabla de análisis de sensibilidad.
 * Busca el patrón típico: "| variable | cambio | VAN | conclusión |"
 */
function parsearEscenarios(markdown: string): Escenario[] {
  const seccionMatch = markdown.match(/(##\s*4\.8\.7|Análisis de sensibilidad|Tabla.*sensibilidad)[\s\S]*?(?=\n##\s|\n#\s|$)/i);
  if (!seccionMatch) return [];
  const seccion = seccionMatch[0];

  const filas = seccion.split("\n").filter((l) => l.trim().startsWith("|") && !l.match(/^\|[\s\-:|]+\|/));
  if (filas.length < 2) return [];

  const escenarios: Escenario[] = [];
  for (const fila of filas) {
    const celdas = fila.split("|").map((c) => c.trim()).filter(Boolean);
    if (celdas.length < 3) continue;
    // Buscar una celda con número (con punto o coma como miles)
    const vanCelda = celdas.find((c) => /[+-]?\s?\d{1,3}([.,]\d{3})+/.test(c) || /[+-]?\s?\d{4,}/.test(c));
    if (!vanCelda) continue;
    const vanLimpio = vanCelda.replace(/[^\d+-]/g, "").replace(/^\+/, "");
    const van = parseInt(vanLimpio, 10);
    if (isNaN(van)) continue;
    if (Math.abs(van) < 100) continue; // ignorar valores chicos (no son VAN)

    const desc = celdas[0].replace(/[*_]/g, "").trim();
    const cambio = celdas[1] ? celdas[1].replace(/[*_]/g, "").trim() : "";
    const esCombinacion = /combinac|conjunto|recalibrad/i.test(desc + " " + cambio);

    escenarios.push({
      descripcion: desc,
      cambio,
      van,
      esCombinacion,
      esViable: van > 0,
    });
  }

  return escenarios;
}

function formatVan(v: number): string {
  const abs = Math.abs(v).toLocaleString("es-BO");
  return (v >= 0 ? "+" : "-") + abs + " Bs.";
}

export default function Cap4gConfigSelector({
  contenidoCap4g,
  configActual,
  onConfigSelected,
}: Cap4gConfigSelectorProps) {
  const escenarios = useMemo(() => parsearEscenarios(contenidoCap4g), [contenidoCap4g]);
  const [seleccion, setSeleccion] = useState<string | null>(configActual ?? null);

  // Solo mostrar el selector si hay al menos un escenario y al menos uno
  // de ellos es viable (VAN positivo). Si todos negativos, no hay decisión.
  const hayViable = escenarios.some((e) => e.esViable);
  if (escenarios.length === 0 || !hayViable) return null;

  function elegir(desc: string) {
    setSeleccion(desc);
    onConfigSelected?.(desc);
  }

  return (
    <div
      style={{
        marginTop: 20,
        padding: 20,
        border: "2px solid #16a34a",
        borderRadius: 12,
        background: "rgba(34,197,94,0.05)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          📌 Decisión final del proyecto
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--fg-primary)" }}>
          Elegí la configuración que adoptarás como propuesta final
        </h3>
        <p style={{ fontSize: 13, color: "var(--fg-secondary)", marginTop: 6, lineHeight: 1.5 }}>
          El análisis de sensibilidad identificó {escenarios.length} escenario(s)
          alternativo(s). La configuración que elijas se documentará en las
          conclusiones del proyecto y se incluirá en las recomendaciones al
          tribunal.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {escenarios.map((e, i) => {
          const esSel = seleccion === e.descripcion;
          return (
            <button
              key={i}
              type="button"
              onClick={() => elegir(e.descripcion)}
              style={{
                textAlign: "left",
                padding: 14,
                borderRadius: 10,
                background: esSel ? "rgba(34,197,94,0.12)" : "var(--bg-card)",
                border: esSel ? "2px solid #16a34a" : (e.esCombinacion ? "2px solid #16a34a" : "1.5px solid var(--border)"),
                cursor: "pointer",
                transition: "all 0.15s",
                color: "var(--fg-primary)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: esSel ? "#16a34a" : (e.esCombinacion ? "#16a34a" : (e.esViable ? "#3b82f6" : "var(--fg-muted)")),
                    color: "white",
                    letterSpacing: "0.05em",
                  }}>
                    {esSel ? "✓ SELECCIONADO" : (e.esCombinacion ? "⭐ RECOMENDADO" : (e.esViable ? "ALTERNATIVO" : "NO VIABLE"))}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>
                  {e.descripcion}
                </div>
                {e.cambio && (
                  <div style={{ fontSize: 12, color: "var(--fg-secondary)" }}>
                    Cambio aplicado: {e.cambio}
                  </div>
                )}
              </div>
              <div style={{
                textAlign: "right",
                fontWeight: 800,
                fontSize: 16,
                color: e.esViable ? "#16a34a" : "#ef4444",
              }}>
                VAN: {formatVan(e.van)}
              </div>
            </button>
          );
        })}
      </div>

      {seleccion && (
        <div style={{ marginTop: 12, padding: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: "#16a34a", fontSize: 12 }}>
          ✓ Configuración adoptada: <strong>{seleccion}</strong>. Esta decisión se reflejará en las conclusiones del proyecto.
        </div>
      )}
    </div>
  );
}
