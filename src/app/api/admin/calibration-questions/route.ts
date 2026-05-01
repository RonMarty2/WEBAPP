/**
 * GET  /api/admin/calibration-questions?servicio_id=xxx  — List questions
 * POST /api/admin/calibration-questions                  — Create / Update (id in body = update)
 * DELETE /api/admin/calibration-questions                — Delete by id
 */

import { NextResponse } from "next/server";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";
import type { CalibracionPregunta } from "@/lib/persistence";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_PREGUNTAS: Omit<CalibracionPregunta, "id" | "servicio_id">[] = [
  {
    pregunta: "Describe brevemente tu estilo preferido de escritura académica.",
    descripcion: "Formal, técnico, narrativo, descriptivo... ¿Cómo describes tu forma natural de escribir?",
    orden: 0,
    minimo_palabras: 30,
    activo: true,
  },
  {
    pregunta: "Escribe un párrafo de ejemplo sobre cualquier tema académico de tu carrera.",
    descripcion: "Este párrafo ayuda a la IA a calibrar tu vocabulario, estructura de oraciones y tono.",
    orden: 10,
    minimo_palabras: 80,
    activo: true,
  },
  {
    pregunta: "¿Qué aspectos de tu escritura consideras más importantes o distintivos?",
    descripcion: "Por ejemplo: precisión técnica, claridad, uso de ejemplos, argumentación, etc.",
    orden: 20,
    minimo_palabras: 20,
    activo: true,
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const servicio_id = searchParams.get("servicio_id") ?? "mono-001";

  const disk = loadFromDisk();
  const todas = disk.calibracionPreguntas ?? [];
  const paraServicio = todas.filter(q => q.servicio_id === servicio_id);

  // If none configured for this service, return defaults with virtual IDs
  if (paraServicio.length === 0) {
    const defaults = DEFAULT_PREGUNTAS.map((q, i) => ({
      ...q,
      id: `default-${i}`,
      servicio_id,
    }));
    return NextResponse.json({ preguntas: defaults, is_default: true });
  }

  const sorted = [...paraServicio].sort((a, b) => a.orden - b.orden);
  return NextResponse.json({ preguntas: sorted, is_default: false });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<CalibracionPregunta> & { servicio_id: string };
    if (!body.pregunta?.trim()) {
      return NextResponse.json({ error: "pregunta es requerida" }, { status: 400 });
    }
    if (!body.servicio_id) {
      return NextResponse.json({ error: "servicio_id es requerido" }, { status: 400 });
    }

    const disk = loadFromDisk();
    if (!disk.calibracionPreguntas) disk.calibracionPreguntas = [];

    if (body.id && !body.id.startsWith("default-")) {
      // Update existing
      const idx = disk.calibracionPreguntas.findIndex(q => q.id === body.id);
      if (idx === -1) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
      disk.calibracionPreguntas[idx] = {
        ...disk.calibracionPreguntas[idx],
        pregunta: body.pregunta.trim(),
        descripcion: body.descripcion ?? disk.calibracionPreguntas[idx].descripcion,
        orden: body.orden ?? disk.calibracionPreguntas[idx].orden,
        minimo_palabras: body.minimo_palabras ?? disk.calibracionPreguntas[idx].minimo_palabras,
        activo: body.activo ?? disk.calibracionPreguntas[idx].activo,
      };
      saveToDisk(disk);
      return NextResponse.json({ pregunta: disk.calibracionPreguntas[idx] });
    }

    // Create new
    const existing = disk.calibracionPreguntas.filter(q => q.servicio_id === body.servicio_id);
    const maxOrden = existing.length > 0 ? Math.max(...existing.map(q => q.orden)) : -10;
    const nueva: CalibracionPregunta = {
      id: uid(),
      servicio_id: body.servicio_id,
      pregunta: body.pregunta.trim(),
      descripcion: body.descripcion ?? "",
      orden: body.orden ?? maxOrden + 10,
      minimo_palabras: body.minimo_palabras ?? 30,
      activo: body.activo ?? true,
    };
    disk.calibracionPreguntas.push(nueva);
    saveToDisk(disk);
    return NextResponse.json({ pregunta: nueva }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json() as { id: string };
    if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

    const disk = loadFromDisk();
    if (!disk.calibracionPreguntas) return NextResponse.json({ ok: true });

    disk.calibracionPreguntas = disk.calibracionPreguntas.filter(q => q.id !== id);
    saveToDisk(disk);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
