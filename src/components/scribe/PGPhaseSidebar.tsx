"use client";

/**
 * PGPhaseSidebar — Navegación de las 23 fases del Proyecto de Grado.
 * Se renderiza dentro del Col 1 del workspace cuando el proyecto es de tipo PG.
 * Agrupa las fases por capítulo y muestra el estado de cada una.
 */

import { useMemo } from "react";

export interface PGPhaseItem {
  id: string;
  label: string;
  short: string;
  orden: number;
}

interface PGPhaseSidebarProps {
  phases: PGPhaseItem[];
  selectedIndex: number;
  phaseContents: Record<string, string | null | undefined>;
  onSelect: (index: number) => void;
}

// ── Agrupación por capítulo ──────────────────────────────────────────────────

interface PhaseGroup {
  key: string;
  label: string;
  color: string;
  phases: Array<PGPhaseItem & { index: number }>;
}

function getGroupKey(phaseId: string): string {
  if (/cap0/.test(phaseId)) return "cap0";
  if (/cap1/.test(phaseId)) return "cap1";
  if (/cap2/.test(phaseId)) return "cap2";
  if (/cap3/.test(phaseId)) return "cap3";
  if (/cap4/.test(phaseId)) return "cap4";
  return "final";
}

type Section = "prep" | "doc" | "cierre";

const GROUP_META: Record<string, { label: string; color: string; section: Section }> = {
  cap0:  { label: "Idea de negocio",              color: "#60a5fa", section: "prep"   },
  cap1:  { label: "Cap. I — Marco Referencial",   color: "#a78bfa", section: "doc"    },
  cap2:  { label: "Cap. II — Marco Teórico",      color: "#a78bfa", section: "doc"    },
  cap3:  { label: "Cap. III — Marco Situacional", color: "#34d399", section: "doc"    },
  cap4:  { label: "Cap. IV — Marco Propositivo",  color: "#fb923c", section: "doc"    },
  final: { label: "Cierre y exportación",         color: "#94a3b8", section: "cierre" },
};

const SECTION_META: Record<Section, { label: string; sublabel: string }> = {
  prep:   { label: "PREPARACIÓN",                 sublabel: "Validación interna · no va al documento" },
  doc:    { label: "DOCUMENTO — 4 CAPÍTULOS",     sublabel: "Estructura oficial UCATEC" },
  cierre: { label: "CIERRE",                      sublabel: "Resumen ejecutivo, conclusiones, bibliografía, defensa, export" },
};

function groupPhases(phases: PGPhaseItem[]): PhaseGroup[] {
  const map = new Map<string, PhaseGroup>();
  const order = ["cap0", "cap1", "cap2", "cap3", "cap4", "final"];

  order.forEach((key) => {
    map.set(key, { key, ...GROUP_META[key], phases: [] });
  });

  phases.forEach((p, index) => {
    const key = getGroupKey(p.id);
    const group = map.get(key) ?? map.get("final")!;
    group.phases.push({ ...p, index });
  });

  return order.map((k) => map.get(k)!).filter((g) => g.phases.length > 0);
}

// ── Estado de una fase ────────────────────────────────────────────────────────

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

// ── Componente ────────────────────────────────────────────────────────────────

export default function PGPhaseSidebar({
  phases,
  selectedIndex,
  phaseContents,
  onSelect,
}: PGPhaseSidebarProps) {
  const groups = useMemo(() => groupPhases(phases), [phases]);

  const completedCount = useMemo(
    () => phases.filter((p) => getPhaseStatus(p.id, phaseContents) === "final").length,
    [phases, phaseContents]
  );
  const borradorCount = useMemo(
    () => phases.filter((p) => getPhaseStatus(p.id, phaseContents) === "borrador").length,
    [phases, phaseContents]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        flex: 1,
        paddingBottom: 8,
      }}
    >
      {/* Resumen de progreso */}
      <div
        style={{
          padding: "10px 14px 8px",
          borderBottom: "1px solid rgba(148,163,184,0.12)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Progreso
          </span>
          <span style={{ fontSize: 10.5, color: "var(--fg-secondary)" }}>
            <span style={{ color: "#4ade80", fontWeight: 700 }}>{completedCount}</span>
            {borradorCount > 0 && (
              <span style={{ color: "#a78bfa" }}> + {borradorCount} bor.</span>
            )}
            <span style={{ color: "var(--fg-muted)" }}> / {phases.length}</span>
          </span>
        </div>
        {/* Barra de progreso */}
        <div style={{ height: 4, borderRadius: 99, background: "rgba(148,163,184,0.15)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.round((completedCount / phases.length) * 100)}%`,
              background: "linear-gradient(90deg, #2563eb, #4ade80)",
              borderRadius: 99,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Lista de grupos */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {groups.map((group, gi) => {
          const meta = GROUP_META[group.key] ?? GROUP_META.final;
          const prevMeta = gi > 0 ? GROUP_META[groups[gi - 1].key] ?? GROUP_META.final : null;
          const isNewSection = !prevMeta || prevMeta.section !== meta.section;
          const section = SECTION_META[meta.section];
          return (
          <div key={group.key} style={{ marginBottom: 2 }}>
            {isNewSection && (
              <div
                style={{
                  margin: "12px 14px 6px",
                  paddingBottom: 4,
                  borderBottom: "1px solid rgba(148,163,184,0.18)",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "var(--fg-secondary)" }}>
                  {section.label}
                </div>
                <div style={{ fontSize: 9, color: "var(--fg-muted)", marginTop: 1, lineHeight: 1.3 }}>
                  {section.sublabel}
                </div>
              </div>
            )}
            {/* Cabecera del grupo */}
            <div
              style={{
                padding: "6px 14px 3px",
                fontSize: 9.5,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                color: group.color,
                opacity: 0.85,
              }}
            >
              {group.label}
            </div>

            {/* Fases del grupo */}
            {group.phases.map(({ id, label, short, index }) => {
              const status = getPhaseStatus(id, phaseContents);
              const sel = index === selectedIndex;
              const st = STATUS_STYLES[status];

              return (
                <button
                  key={id}
                  onClick={() => onSelect(index)}
                  title={label}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 14px",
                    background: sel ? "rgba(37,99,235,0.12)" : "transparent",
                    border: "none",
                    borderLeft: sel ? "2px solid var(--accent)" : "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!sel) (e.currentTarget as HTMLButtonElement).style.background = "rgba(148,163,184,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    if (!sel) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  {/* Indicador de estado */}
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      background: sel ? "rgba(37,99,235,0.2)" : st.bg,
                      border: `1px solid ${sel ? "var(--accent)" : st.border}`,
                      color: sel ? "var(--accent)" : st.color,
                    }}
                  >
                    {sel ? "▶" : st.icon}
                  </span>

                  {/* Etiqueta */}
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: sel ? 700 : 400,
                      color: sel ? "var(--fg-primary)" : "var(--fg-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {short}
                  </span>
                </button>
              );
            })}
          </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div
        style={{
          padding: "6px 14px",
          borderTop: "1px solid rgba(148,163,184,0.10)",
          display: "flex",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {(["final", "borrador", "empty"] as PhaseStatus[]).map((s) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9.5, color: "var(--fg-muted)" }}>
            <span style={{ color: STATUS_STYLES[s].color, fontWeight: 700, fontSize: 10 }}>
              {STATUS_STYLES[s].icon}
            </span>
            {s === "final" ? "Final" : s === "borrador" ? "Borrador" : "Sin hacer"}
          </span>
        ))}
      </div>
    </div>
  );
}
