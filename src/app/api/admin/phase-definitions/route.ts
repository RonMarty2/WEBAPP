/**
 * /api/admin/phase-definitions
 *
 * 🔒 SOLO ADMIN. Este endpoint expone los megaprompts maestros completos.
 * NO debe ser llamado desde flujos de estudiantes — para eso existe
 * /api/projects/[id]/phases (devuelve solo metadata, sin prompts).
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";
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

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Centraliza el manejo de errores de autenticación. */
function handleAuthError(e: unknown): NextResponse | null {
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  return null;
}

/**
 * Megaprompts maestros del sistema SCRIBE — 10 fases.
 * Importados de src/lib/prompts/scribe/* (server-only).
 * Si el admin edita en /admin/fases, las modificaciones se persisten en disco
 * y sobrescriben estos defaults para ese servicio.
 */
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

/**
 * Resuelve las fases para un servicio. Helper interno usado por
 * este endpoint y por /api/projects/[id]/phases (que devuelve metadata).
 */
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

// ── GET — solo admin ────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const servicioId = url.searchParams.get("servicio_id") || "mono-001";
    const { phases, isDefault } = resolvePhases(servicioId);

    return NextResponse.json({ phases, is_default: isDefault });
  } catch (e) {
    return handleAuthError(e) ?? NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// ── POST — solo admin ───────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json()) as Partial<PhaseDefinition> & { servicio_id: string };
    const { servicio_id, ...phase } = body;

    const disk = loadFromDisk();
    if (!disk.phaseDefinitions) disk.phaseDefinitions = {};
    if (!disk.phaseDefinitions[servicio_id]) disk.phaseDefinitions[servicio_id] = [];

    const phases = disk.phaseDefinitions[servicio_id];

    if (phase.id) {
      const idx = phases.findIndex((p) => p.id === phase.id);
      if (idx >= 0) {
        phases[idx] = { ...phases[idx], ...phase } as PhaseDefinition;
      } else {
        phases.push({ id: phase.id || uid(), servicio_id, orden: phases.length * 10 || 0, ...phase } as PhaseDefinition);
      }
    } else {
      const maxOrden = phases.length > 0 ? Math.max(...phases.map((p) => p.orden)) : 0;
      phases.push({ id: uid(), servicio_id, orden: maxOrden + 10, ...phase } as PhaseDefinition);
    }

    disk.phaseDefinitions[servicio_id] = phases.sort((a, b) => a.orden - b.orden);
    saveToDisk(disk);

    return NextResponse.json({ ok: true, phase: phases.find((p) => p.id === phase.id) });
  } catch (e) {
    return handleAuthError(e) ?? NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

// ── DELETE — solo admin ─────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json()) as { id: string; servicio_id: string };
    const { id, servicio_id } = body;

    const disk = loadFromDisk();
    if (!disk.phaseDefinitions) disk.phaseDefinitions = {};
    if (!disk.phaseDefinitions[servicio_id]) disk.phaseDefinitions[servicio_id] = [];

    const phases = disk.phaseDefinitions[servicio_id];
    disk.phaseDefinitions[servicio_id] = phases.filter((p) => p.id !== id);
    saveToDisk(disk);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleAuthError(e) ?? NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

// ── PATCH — solo admin ──────────────────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json()) as { id: string; servicio_id: string; direction: "up" | "down" };
    const { id, servicio_id, direction } = body;

    const disk = loadFromDisk();
    if (!disk.phaseDefinitions) disk.phaseDefinitions = {};
    if (!disk.phaseDefinitions[servicio_id]) disk.phaseDefinitions[servicio_id] = [];

    const phases = disk.phaseDefinitions[servicio_id];
    const idx = phases.findIndex((p) => p.id === id);

    if (idx === -1) return NextResponse.json({ error: "Phase not found" }, { status: 404 });

    if (direction === "up" && idx > 0) {
      const gap = (phases[idx - 1].orden + phases[idx].orden) / 2;
      phases[idx].orden = gap;
    } else if (direction === "down" && idx < phases.length - 1) {
      const gap = (phases[idx].orden + phases[idx + 1].orden) / 2;
      phases[idx].orden = gap;
    }

    disk.phaseDefinitions[servicio_id] = phases.sort((a, b) => a.orden - b.orden);
    saveToDisk(disk);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleAuthError(e) ?? NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
