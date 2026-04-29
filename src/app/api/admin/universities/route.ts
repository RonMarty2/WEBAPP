import { NextResponse } from "next/server";
import { DEFAULT_UNIVERSITIES, University } from "@/lib/data";

// In production, stored in Supabase
let universitiesStore: University[] = [...DEFAULT_UNIVERSITIES];

export async function GET() {
  return NextResponse.json(universitiesStore);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newUniversity: University = {
      id: `univ-${Date.now()}`,
      name: body.name,
      logo_url: body.logo_url || "",
      format: body.format || {
        font: "Times New Roman",
        size: 12,
        lineHeight: 1.5,
        margins: { top: 3, left: 3, bottom: 2.5, right: 2.5 },
      },
      modalities: body.modalities || ["Tesis de Grado", "Monografía"],
      is_active: true,
    };

    universitiesStore.push(newUniversity);
    return NextResponse.json({ success: true, university: newUniversity }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear la universidad." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const index = universitiesStore.findIndex((u) => u.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "Universidad no encontrada." }, { status: 404 });
    }

    universitiesStore[index] = { ...universitiesStore[index], ...body };
    return NextResponse.json({ success: true, university: universitiesStore[index] });
  } catch {
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    universitiesStore = universitiesStore.filter((u) => u.id !== id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar." }, { status: 500 });
  }
}
