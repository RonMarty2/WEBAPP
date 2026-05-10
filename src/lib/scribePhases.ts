/**
 * src/lib/scribePhases.ts
 *
 * Source-of-truth de las 10 fases SCRIBE (megaprompts maestros).
 * Server-only — los prompts NUNCA salen al cliente.
 *
 * Este módulo centraliza:
 *   - DEFAULT_PHASES: las 10 fases hardcodeadas que importan los SISTEMA_SCRIBE_*
 *   - resolvePhases(servicioId): lee fases del disco si fueron editadas en /admin/fases,
 *     o cae a DEFAULT_PHASES si nadie las editó.
 *
 * Diseñado como módulo neutral para evitar imports circulares entre
 * /api/admin/phase-definitions/route.ts y /lib/projectTypePhases.ts.
 */

import { loadFromDisk } from "@/lib/persistence";
import type { PhaseDefinition } from "@/lib/persistence";
import { SISTEMA_SCRIBE_CAP0 } from "@/lib/prompts/scribe/cap0-propuesta-temas";
import { SISTEMA_SCRIBE_CAP1 } from "@/lib/prompts/scribe/cap1";
import { SISTEMA_SCRIBE_CAP2 } from "@/lib/prompts/scribe/cap2";
import { SISTEMA_SCRIBE_CAP3 } from "@/lib/prompts/scribe/cap3";
import { SISTEMA_SCRIBE_CAP4 } from "@/lib/prompts/scribe/cap4";
import { SISTEMA_SCRIBE_CAP5 } from "@/lib/prompts/scribe/cap5";
import { SISTEMA_SCRIBE_RESUMEN } from "@/lib/prompts/scribe/resumen-ejecutivo";
import { SISTEMA_SCRIBE_REFERENCIAS } from "@/lib/prompts/scribe/consolidar-referencias";
import { SISTEMA_SCRIBE_LATEX } from "@/lib/prompts/scribe/compilar-latex";
import { SISTEMA_SCRIBE_CALIDAD } from "@/lib/prompts/scribe/control-calidad";

export const DEFAULT_PHASES: PhaseDefinition[] = [
  {
    id: "ph-cap0",
    servicio_id: "mono-001",
    orden: 0,
    label: "Cap. 0 — Propuesta y Refinamiento de Tema",
    short_label: "Tema",
    prompt: SISTEMA_SCRIBE_CAP0,
  },
  {
    id: "ph-cap1",
    servicio_id: "mono-001",
    orden: 10,
    label: "Cap. I — Introducción y Antecedentes",
    short_label: "Cap. I",
    prompt: SISTEMA_SCRIBE_CAP1,
  },
  {
    id: "ph-cap2",
    servicio_id: "mono-001",
    orden: 20,
    label: "Cap. II — Marco Teórico y Referencial",
    short_label: "Cap. II",
    prompt: SISTEMA_SCRIBE_CAP2,
  },
  {
    id: "ph-cap3",
    servicio_id: "mono-001",
    orden: 30,
    label: "Cap. III — Diseño Metodológico",
    short_label: "Cap. III",
    prompt: SISTEMA_SCRIBE_CAP3,
  },
  {
    id: "ph-cap4",
    servicio_id: "mono-001",
    orden: 40,
    label: "Cap. IV — Análisis de Resultados",
    short_label: "Cap. IV",
    prompt: SISTEMA_SCRIBE_CAP4,
  },
  {
    id: "ph-cap5",
    servicio_id: "mono-001",
    orden: 50,
    label: "Cap. V — Conclusiones y Recomendaciones",
    short_label: "Cap. V",
    prompt: SISTEMA_SCRIBE_CAP5,
  },
  {
    id: "ph-resumen",
    servicio_id: "mono-001",
    orden: 60,
    label: "Resumen Ejecutivo",
    short_label: "Resumen",
    prompt: SISTEMA_SCRIBE_RESUMEN,
  },
  {
    id: "ph-referencias",
    servicio_id: "mono-001",
    orden: 70,
    label: "Consolidación de Referencias Bibliográficas",
    short_label: "Referencias",
    prompt: SISTEMA_SCRIBE_REFERENCIAS,
  },
  {
    id: "ph-latex",
    servicio_id: "mono-001",
    orden: 80,
    label: "Compilación Final en LaTeX",
    short_label: "LaTeX",
    prompt: SISTEMA_SCRIBE_LATEX,
  },
  {
    id: "ph-calidad",
    servicio_id: "mono-001",
    orden: 90,
    label: "Control Final de Calidad",
    short_label: "Calidad",
    prompt: SISTEMA_SCRIBE_CALIDAD,
  },
];

export function resolvePhases(servicioId: string): { phases: PhaseDefinition[]; isDefault: boolean } {
  const disk = loadFromDisk();
  if (!disk.phaseDefinitions) disk.phaseDefinitions = {};

  const stored = disk.phaseDefinitions[servicioId] ?? [];
  if (stored.length > 0) {
    return { phases: [...stored].sort((a, b) => a.orden - b.orden), isDefault: false };
  }

  if (servicioId === "mono-001") {
    return { phases: [...DEFAULT_PHASES].sort((a, b) => a.orden - b.orden), isDefault: true };
  }

  return { phases: [], isDefault: true };
}
