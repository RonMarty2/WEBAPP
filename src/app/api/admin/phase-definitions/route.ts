import { NextResponse } from "next/server";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";
import type { PhaseDefinition, StoreData } from "@/lib/persistence";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_PHASES: PhaseDefinition[] = [
  {
    id: "ph-cap0",
    servicio_id: "mono-001",
    orden: 0,
    label: "Cap. 0 — Propuesta y Refinamiento de Tema",
    short_label: "Tema",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE CAP 0]`,
  },
  {
    id: "ph-cap1",
    servicio_id: "mono-001",
    orden: 10,
    label: "Cap. I — Introducción y Antecedentes",
    short_label: "Cap. I",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE CAP 1]`,
  },
  {
    id: "ph-cap2",
    servicio_id: "mono-001",
    orden: 20,
    label: "Cap. II — Marco Teórico y Referencial",
    short_label: "Cap. II",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE CAP 2]`,
  },
  {
    id: "ph-cap3",
    servicio_id: "mono-001",
    orden: 30,
    label: "Cap. III — Diseño Metodológico",
    short_label: "Cap. III",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE CAP 3]`,
  },
  {
    id: "ph-cap4",
    servicio_id: "mono-001",
    orden: 40,
    label: "Cap. IV — Análisis de Resultados",
    short_label: "Cap. IV",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE CAP 4]`,
  },
  {
    id: "ph-cap5",
    servicio_id: "mono-001",
    orden: 50,
    label: "Cap. V — Conclusiones y Recomendaciones",
    short_label: "Cap. V",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE CAP 5]`,
  },
  {
    id: "ph-resumen",
    servicio_id: "mono-001",
    orden: 60,
    label: "Resumen Ejecutivo",
    short_label: "Resumen",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE RESUMEN]`,
  },
  {
    id: "ph-referencias",
    servicio_id: "mono-001",
    orden: 70,
    label: "Consolidación de Referencias Bibliográficas",
    short_label: "Referencias",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE REFERENCIAS]`,
  },
  {
    id: "ph-latex",
    servicio_id: "mono-001",
    orden: 80,
    label: "Compilación Final en LaTeX",
    short_label: "LaTeX",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE COMPILACIÓN LaTeX]`,
  },
  {
    id: "ph-calidad",
    servicio_id: "mono-001",
    orden: 90,
    label: "Control Final de Calidad",
    short_label: "Calidad",
    prompt: `[VACÍO — PEGA AQUÍ EL CONTENIDO DE CONTROL DE CALIDAD]`,
  },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const servicioId = url.searchParams.get("servicio_id") || "mono-001";

  const disk = loadFromDisk();
  if (!disk.phaseDefinitions) disk.phaseDefinitions = {};

  const phases = disk.phaseDefinitions[servicioId] ?? [];
  const isDefault = phases.length === 0;

  return NextResponse.json({
    phases: phases.sort((a, b) => a.orden - b.orden),
    is_default: isDefault,
  });
}

export async function POST(req: Request) {
  try {
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
        phases.push({ id: phase.id || uid(), servicio_id, orden: (phases.length * 10) || 0, ...phase } as PhaseDefinition);
      }
    } else {
      const maxOrden = phases.length > 0 ? Math.max(...phases.map((p) => p.orden)) : 0;
      phases.push({ id: uid(), servicio_id, orden: maxOrden + 10, ...phase } as PhaseDefinition);
    }

    disk.phaseDefinitions[servicio_id] = phases.sort((a, b) => a.orden - b.orden);
    saveToDisk(disk);

    return NextResponse.json({ ok: true, phase: phases.find((p) => p.id === phase.id) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
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
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
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
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
