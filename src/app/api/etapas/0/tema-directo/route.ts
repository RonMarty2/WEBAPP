import { NextResponse } from "next/server";
import { getMonografia, upsertCapitulo, updateMonografia } from "@/lib/memoryStore";

// POST /api/etapas/0/tema-directo
// Guarda el tema propio del usuario como cap0 sin llamar a la IA
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { monografia_id, titulo, objetivo_general, pregunta_investigacion, metodologia } = body;

    if (!monografia_id || !titulo) {
      return NextResponse.json(
        { error: "monografia_id y titulo son requeridos" },
        { status: 400 }
      );
    }

    const monografia = getMonografia(monografia_id);
    if (!monografia) {
      return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
    }

    const temaSeleccionado = {
      numero: 0,
      titulo: titulo.trim(),
      objetivo_general: objetivo_general?.trim() || "",
      pregunta_investigacion: pregunta_investigacion?.trim() || "",
      metodologia: metodologia || "cuantitativa",
      fuentes_datos: [],
      requiere_entrevistas: false,
      viabilidad: "ALTA",
      origen: "usuario",
    };

    const capitulo = upsertCapitulo({
      monografia_id,
      numero: 0,
      contenido: `Tema definido por el estudiante: ${titulo}`,
      contenido_json: {
        etapa: 0,
        status: "tema_directo",
        propuestas: [temaSeleccionado],
        tema_seleccionado: temaSeleccionado,
      },
      status: "approved",
    });

    updateMonografia(monografia_id, {
      titulo: titulo.trim(),
      tema: titulo.trim(),
      etapa_actual: 0,
      status: "tema",
    });

    return NextResponse.json({
      capitulo_id: capitulo.id,
      tema: temaSeleccionado,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
