"use client";

/**
 * UnifranzPhaseSidebar — Navegación de las fases de un Proyecto de Grado
 * UNIFRANZ Cochabamba según la modalidad de titulación elegida.
 *
 * Se renderiza dentro del workspace-pg cuando:
 *   universidad_id === "unifranz-cba-001"
 *   modalidad_titulacion ∈ ModalidadUnifranz
 *
 * Agrupa las fases en 4 bloques que reflejan la estructura oficial de la
 * Guía UNIFRANZ 2017 (Preliminares / Apertura / Cuerpo / Cierre / Export).
 *
 * Hermano de PGPhaseSidebar.tsx, que sigue sirviendo para el flujo PG
 * genérico (UCATEC y otras universidades sin modalidades específicas).
 */

import { useMemo } from "react";
import { getModalidadUnifranz, type ModalidadUnifranz } from "@/lib/proyectoGrado/unifranz/modalidades";

export interface UnifranzPhaseItem {
  id: string;
  label: string;
  short: string;
  orden: number;
}

interface UnifranzPhaseSidebarProps {
  phases: UnifranzPhaseItem[];
  modalidad: ModalidadUnifranz;
  selectedIndex: number;
  phaseContents: Record<string, string | null | undefined>;
  onSelect: (index: number) => void;
}

// ── Agrupación por sección oficial UNIFRANZ ─────────────────────────────────

type SeccionUnifranz = "preliminares" | "apertura" | "cuerpo" | "cierre" | "export";

interface SeccionGroup {
  key: SeccionUnifranz;
  label: string;
  color: string;
  sublabel: string;
  phases: Array<UnifranzPhaseItem & { index: number }>;
}

const SECCION_META: Record<SeccionUnifranz, { label: string; color: string; sublabel: string }> = {
  preliminares: { label: "Preliminares",       color: "#60a5fa", sublabel: "Resumen ejecutivo (250 palabras)" },
  apertura:     { label: "Apertura",           color: "#a78bfa", sublabel: "Introducción: planteamiento, justificación, objetivos, alcances, hipótesis" },
  cuerpo:       { label: "Cuerpo del trabajo", color: "#34d399", sublabel: "Capítulos según la guía UNIFRANZ 2017" },
  cierre:       { label: "Cierre",             color: "#fb923c", sublabel: "Conclusiones, recomendaciones, bibliografía" },
  export:       { label: "Compilación y defensa", color: "#94a3b8", sublabel: "LaTeX/PDF y banco de preguntas" },
};

/**
 * Clasifica una fase UNIFRANZ a su sección según el slug del ID.
 * Convención: `ph-unifranz-{modalidad}-{slug}`.
 */
function getSeccion(phaseId: string): SeccionUnifranz {
  // Quitamos el prefijo "ph-unifranz-{modalidad}-" para quedarnos con el slug.
  const slug = phaseId.replace(/^ph-unifranz-[^-]+(-[^-]+)*-/, "").toLowerCase();

  if (slug === "resumen") return "preliminares";
  if (slug === "introduccion") return "apertura";
  if (slug === "conclusiones" || slug === "recomendaciones" || slug === "bibliografia") return "cierre";
  if (slug === "compilacion" || slug === "defensa") return "export";
  // Todo lo demás (cap1, cap2-*, cap3-*) cae al cuerpo.
  return "cuerpo";
}

function groupPhases(phases: UnifranzPhaseItem[]): SeccionGroup[] {
  const order: SeccionUnifranz[] = ["preliminares", "apertura", "cuerpo", "cierre", "export"];
  const map = new Map<SeccionUnifranz, SeccionGroup>();

  order.forEach((key) => {
    map.set(key, { key, ...SECCION_META[key], phases: [] });
  });

  phases.forEach((p, index) => {
    const sec = getSeccion(p.id);
    map.get(sec)!.phases.push({ ...p, index });
  });

  return order.map((k) => map.get(k)!).filter((g) => g.phases.length > 0);
}

// ── Estado de una fase (idéntico a PGPhaseSidebar para consistencia visual) ─

type PhaseStatus = "final" | "borrador" | "empty";

function getPhaseStatus(phaseId: string, phaseContents: Record<string, string | null | undefined>): PhaseStatus {
  const final = phaseContents[phaseId];
  if (typeof final === "string" && final.trim()) return "final";
  const borrador = phaseContents[`${phaseId}_borrador`];
  if (typeof borrador === "string" && borrador.trim()) return "borrador";
  return "empty";
}

const STATUS_STYLES: Record<PhaseStatus, { icon: string; color: string; bg: string; border: string }> = {
  final:    { icon: "✓", color: "#4ade80", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.35)" },
  borrador: { icon: "◐", color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.35)" },
  empty:    { icon: "○", color: "var(--fg-muted)", bg: "transparent", border: "rgba(148,163,184,0.15)" },
};

// ── Componente ──────────────────────────────────────────────────────────────

export default function UnifranzPhaseSidebar({
  phases,
  modalidad,
  selectedIndex,
  phaseContents,
  onSelect,
}: UnifranzPhaseSidebarProps) {
  const groups = useMemo(() => groupPhases(phases), [phases]);
  const modalidadInfo = getModalidadUnifranz(modalidad);

  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-card)",
        overflowY: "auto",
        padding: "16px 12px",
      }}
    >
      {/* Encabezado del sidebar */}
      <div style={{ marginBottom: 16, padding: "0 6px" }}>
        <div
          style={{
            fontSize: 10,
            color: "var(--accent)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          UNIFRANZ — Modalidad
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)", lineHeight: 1.3 }}>
          {modalidadInfo?.nombre ?? "Modalidad UNIFRANZ"}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--fg-muted)", marginTop: 4 }}>
          Sección {modalidadInfo?.guia_oficial.seccion_referencia} de la guía oficial 2017
        </div>
      </div>

      {/* Grupos de fases */}
      {groups.map((group) => (
        <div key={group.key} style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 6px",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: group.color,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--fg-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {group.label}
              </div>
              <div style={{ fontSize: 10, color: "var(--fg-muted)", lineHeight: 1.4 }}>
                {group.sublabel}
              </div>
            </div>
          </div>

          {/* Lista de fases del grupo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {group.phases.map(({ id, label, short, index }) => {
              const status = getPhaseStatus(id, phaseContents);
              const sty = STATUS_STYLES[status];
              const seleccionada = selectedIndex === index;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: seleccionada ? "rgba(37,99,235,0.10)" : sty.bg,
                    border: seleccionada ? "1.5px solid var(--accent)" : `1px solid ${sty.border}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                  title={label}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: sty.color,
                      fontWeight: 700,
                      width: 16,
                      flexShrink: 0,
                      textAlign: "center",
                    }}
                  >
                    {sty.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: seleccionada ? "var(--accent)" : "var(--fg-primary)",
                      fontWeight: seleccionada ? 700 : 500,
                      lineHeight: 1.35,
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {short || label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
