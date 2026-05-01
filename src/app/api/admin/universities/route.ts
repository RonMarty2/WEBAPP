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
      facultad: body.facultad || "",
      departamento: body.departamento || "",
      ciudad: body.ciudad || "",
      pais: body.pais || "",
      tipo_documento: body.tipo_documento || "",
      tipo_modalidad: body.tipo_modalidad || "",
      campos_portada: body.campos_portada || [],
      cover_template: body.cover_template || "",
      latex_prompt: body.latex_prompt || "",
      format: body.format || {
        font: "Times New Roman",
        size: 12,
        lineHeight: 1.5,
        margins: { top: 3, left: 3, bottom: 2.5, right: 2.5 },
        alineacion: "justify",
        numero_paginas_posicion: "top-right",
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
