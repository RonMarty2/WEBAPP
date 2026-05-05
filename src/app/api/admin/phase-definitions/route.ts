/**
 * GET  /api/admin/phase-definitions?servicio_id=X  — list phases for a service
 * POST /api/admin/phase-definitions                — create or update a phase
 * DELETE /api/admin/phase-definitions              — delete a phase
 */

import { NextResponse } from "next/server";
import { loadFromDisk, saveToDisk, PhaseDefinition } from "@/lib/persistence";
import { DEFAULT_PHASES } from "@/app/api/admin/workspace-prompts/route";
import { phaseDefinitionsFromProjectType, projectTypeIdForService } from "@/lib/projectTypePhases";

// Default phase definitions for any service that hasn't been customized
export function getDefaultPhaseDefinitions(servicio_id: string): PhaseDefinition[] {
  const labels: Record<string, { label: string; short_label: string }> = {
    "0": { label: "Planteamiento del Tema",           short_label: "Planteamiento" },
    "1": { label: "Capítulo I — Marco Referencial",   short_label: "Cap. I" },
    "2": { label: "Capítulo II — Marco Teórico",      short_label: "Cap. II" },
    "3": { label: "Capítulos III-V — Desarrollo",     short_label: "Caps. III-V" },
    "4": { label: "Revisión y Compilación",           short_label: "Revisión" },
    "5": { label: "Conclusiones y Bibliografía",      short_label: "Final" },
  };
  return Object.entries(labels).map(([key, meta]) => ({
    id: key,
    servicio_id,
    orden: Number(key) * 10,
    label: meta.label,
    short_label: meta.short_label,
    prompt: DEFAULT_PHASES[key as keyof typeof DEFAULT_PHASES] ?? "",
  }));
}

function uid(): string {
  return `ph-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const servicio_id = searchParams.get("servicio_id") ?? "mono-001";
  const tipo_proyecto_id = searchParams.get("tipo_proyecto_id") ?? projectTypeIdForService(servicio_id);

  const projectTypePhases = phaseDefinitionsFromProjectType(tipo_proyecto_id, servicio_id);
  if (projectTypePhases.length > 0) {
    return NextResponse.json({ phases: projectTypePhases, is_default: false, source: "project-types" });
  }

  const disk = loadFromDisk();
  const stored = disk.phaseDefinitions?.[servicio_id];

  const phases = stored?.length
    ? [...stored].sort((a, b) => a.orden - b.orden)
    : getDefaultPhaseDefinitions(servicio_id);

  return NextResponse.json({ phases, is_default: !stored?.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<PhaseDefinition> & { servicio_id: string };
    if (!body.servicio_id) return NextResponse.json({ error: "servicio_id requerido" }, { status: 400 });

    const disk = loadFromDisk();
    if (!disk.phaseDefinitions) disk.phaseDefinitions = {};

    const existing = disk.phaseDefinitions[body.servicio_id] ?? [];

    if (body.id) {
      // Update existing phase
      const idx = existing.findIndex((p) => p.id === body.id);
      if (idx === -1) return NextResponse.json({ error: "Fase no encontrada" }, { status: 404 });
      existing[idx] = { ...existing[idx], ...body } as PhaseDefinition;
    } else {
      // Create new phase — determine next orden
      const maxOrden = existing.reduce((m, p) => Math.max(m, p.orden), -10);
      const newPhase: PhaseDefinition = {
        id: uid(),
        servicio_id: body.servicio_id,
        orden: maxOrden + 10,
        label: body.label ?? "Nueva Fase",
        short_label: body.short_label ?? "Fase",
        prompt: body.prompt ?? "",
      };
      existing.push(newPhase);
      disk.phaseDefinitions[body.servicio_id] = existing;
      saveToDisk(disk);
      return NextResponse.json({ ok: true, phase: newPhase });
    }

    disk.phaseDefinitions[body.servicio_id] = existing;
    saveToDisk(disk);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id, servicio_id } = await req.json() as { id: string; servicio_id: string };
    if (!id || !servicio_id) return NextResponse.json({ error: "id y servicio_id requeridos" }, { status: 400 });

    const disk = loadFromDisk();
    if (!disk.phaseDefinitions?.[servicio_id]) return NextResponse.json({ ok: true });

    disk.phaseDefinitions[servicio_id] = disk.phaseDefinitions[servicio_id].filter((p) => p.id !== id);
    if (disk.phaseDefinitions[servicio_id].length === 0) {
      delete disk.phaseDefinitions[servicio_id];
    }
    saveToDisk(disk);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PATCH — reorder: swap orden values of two phases
export async function PATCH(req: Request) {
  try {
    const { servicio_id, id, direction } = await req.json() as {
      servicio_id: string;
      id: string;
      direction: "up" | "down";
    };

    const disk = loadFromDisk();
    const phases = disk.phaseDefinitions?.[servicio_id];
    if (!phases) return NextResponse.json({ error: "No hay fases para este servicio" }, { status: 404 });

    const sorted = [...phases].sort((a, b) => a.orden - b.orden);
    const idx = sorted.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return NextResponse.json({ ok: true });

    // Swap orden values
    const tmpOrden = sorted[idx].orden;
    sorted[idx].orden = sorted[swapIdx].orden;
    sorted[swapIdx].orden = tmpOrden;

    disk.phaseDefinitions![servicio_id] = sorted;
    saveToDisk(disk);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
