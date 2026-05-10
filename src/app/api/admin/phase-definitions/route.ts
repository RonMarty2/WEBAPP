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
import { DEFAULT_PHASES, resolvePhases } from "@/lib/scribePhases";

// Re-export para retro-compatibilidad
export { DEFAULT_PHASES, resolvePhases };

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

// (DEFAULT_PHASES y resolvePhases viven en @/lib/scribePhases — re-exportados arriba)

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
