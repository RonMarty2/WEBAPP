import { NextResponse } from "next/server";
import {
  createMonografia,
  listMonografias,
} from "@/lib/memoryStore";

// POST /api/monografias — crear nueva monografía
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id = "anonymous",
      diplomado,
      temas_abordados = [],
      area_interes,
      contexto_geografico,
      trabajas_en,
    } = body;

    if (!diplomado || !area_interes || !contexto_geografico) {
      return NextResponse.json(
        { error: "Campos requeridos: diplomado, area_interes, contexto_geografico" },
        { status: 400 }
      );
    }

    const monografia = createMonografia({
      user_id,
      titulo: "Sin título",
      diplomado,
      status: "tema",
      etapa_actual: 0,
      datos_base: {
        diplomado,
        temas_abordados,
        area_interes,
        contexto_geografico,
        trabajas_en: trabajas_en ?? null,
      },
    });

    return NextResponse.json({ monografia }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/monografias?user_id=... — listar monografías del usuario
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id") ?? "anonymous";
  const monografias = listMonografias(userId);
  return NextResponse.json({ monografias });
}
