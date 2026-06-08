/**
 * GET    /api/admin/calibration-questions?servicio_id=xxx
 * POST   /api/admin/calibration-questions  — create (no id) or update (id in body)
 * DELETE /api/admin/calibration-questions  — delete by id
 */

import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";
import type { CalibracionPregunta } from "@/lib/persistence";

// Gate de mutaciones. GET puede ser público porque las preguntas se usan
// también en el wizard `/projects/new` antes de que el alumno tenga sesión.
async function gateAdmin(): Promise<Response | null> {
  try {
    await requireAdmin();
    return null;
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

function uid(): string {
  return "cq-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

const DEFAULT_PREGUNTAS: Omit<CalibracionPregunta, "id" | "servicio_id">[] = [
  {
    pregunta: "Describe brevemente tu estilo preferido de escritura académica.",
    descripcion: "Formal, técnico, narrativo, descriptivo...",
    placeholder: "Ej: Prefiero un estilo formal y técnico, con oraciones cortas y argumentos directamente respaldados por datos. Evito la voz pasiva y uso conectores lógicos frecuentemente.",
    orden: 0,
    minimo_palabras: 30,
    activo: true,
  },
  {
    pregunta: "Escribe un párrafo de ejemplo sobre cualquier tema académico de tu carrera.",
    descripcion: "Este párrafo ayuda a la IA a calibrar tu vocabulario, estructura y tono.",
    placeholder: "Ej: La gestión financiera en las PyMEs bolivianas presenta desafíos particulares derivados del contexto macroeconómico...",
    orden: 10,
    minimo_palabras: 80,
    activo: true,
  },
  {
    pregunta: "¿Qué aspectos de tu escritura consideras más importantes o distintivos?",
    descripcion: "Por ejemplo: precisión técnica, claridad, uso de ejemplos, argumentación, etc.",
    placeholder: "Ej: Valoro la precisión en los datos y siempre cito fuentes institucionales. Me esfuerzo por que cada párrafo tenga una idea central clara y bien sustentada.",
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
  const paraServicio = todas.filter(q => q.servicio_id === servicio_id && q.activo !== false);

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
  const gate = await gateAdmin();
  if (gate) return gate;
  try {
    const body = await req.json() as Partial<CalibracionPregunta> & { servicio_id?: string };

    if (!body.pregunta?.trim()) {
      return NextResponse.json({ error: "pregunta es requerida" }, { status: 400 });
    }

    const disk = loadFromDisk();
    if (!disk.calibracionPreguntas) disk.calibracionPreguntas = [];

    // UPDATE existing (id present and not a default-* placeholder)
    if (body.id && !body.id.startsWith("default-")) {
      const idx = disk.calibracionPreguntas.findIndex(q => q.id === body.id);
      if (idx === -1) {
        return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
      }
      disk.calibracionPreguntas[idx] = {
        ...disk.calibracionPreguntas[idx],
        pregunta: body.pregunta.trim(),
        descripcion: body.descripcion !== undefined ? body.descripcion : disk.calibracionPreguntas[idx].descripcion,
        placeholder: body.placeholder !== undefined ? body.placeholder : disk.calibracionPreguntas[idx].placeholder,
        orden: body.orden ?? disk.calibracionPreguntas[idx].orden,
        minimo_palabras: body.minimo_palabras ?? disk.calibracionPreguntas[idx].minimo_palabras,
        activo: body.activo ?? disk.calibracionPreguntas[idx].activo,
      };
      saveToDisk(disk);
      return NextResponse.json({ pregunta: disk.calibracionPreguntas[idx] });
    }

    // CREATE new (also handles "clone from default" when id starts with "default-")
    const servicio_id = body.servicio_id ?? "mono-001";
    const existentes = disk.calibracionPreguntas.filter(q => q.servicio_id === servicio_id);
    const maxOrden = existentes.length > 0 ? Math.max(...existentes.map(q => q.orden)) : -10;

    const nueva: CalibracionPregunta = {
      id: uid(),
      servicio_id,
      pregunta: body.pregunta.trim(),
      descripcion: body.descripcion ?? "",
      placeholder: body.placeholder ?? "",
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
  const gate = await gateAdmin();
  if (gate) return gate;
  try {
    const { id } = await req.json() as { id: string };
    if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    if (id.startsWith("default-")) {
      return NextResponse.json({ error: "Las preguntas por defecto no se pueden eliminar. Agrega las tuyas primero." }, { status: 400 });
    }
    const disk = loadFromDisk();
    if (!disk.calibracionPreguntas) return NextResponse.json({ ok: true });
    disk.calibracionPreguntas = disk.calibracionPreguntas.filter(q => q.id !== id);
    saveToDisk(disk);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
