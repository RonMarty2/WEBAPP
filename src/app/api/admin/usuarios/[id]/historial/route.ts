import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import {
  listMonografias,
  getCapitulos,
  getCitas,
  getDocumentos,
} from "@/lib/memoryStore";

type Params = Promise<{ id: string }>;

// GET /api/admin/usuarios/[id]/historial
export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const monografias = listMonografias(id);

  const historial = monografias.map(m => {
    const capitulos = getCapitulos(m.id);
    const citas = getCitas(m.id);
    const documentos = getDocumentos(m.id);

    const etapasCompletadas: (number | string)[] = capitulos.map(c => c.numero);
    if (m.status === "completa") etapasCompletadas.push("final");

    const observaciones = capitulos
      .filter(c => c.observaciones)
      .map(c => c.observaciones as string);

    return {
      monografia_id: m.id,
      titulo: m.titulo,
      diplomado: m.diplomado ?? "",
      estado: m.status,
      etapa_actual: m.etapa_actual,
      fecha_creacion: m.created_at,
      fecha_actualizacion: m.updated_at,
      etapas_completadas: etapasCompletadas,
      capitulos: capitulos.map(c => ({
        numero: c.numero,
        status: c.status,
        palabras: (c.contenido ?? "").split(/\s+/).filter(Boolean).length,
        checksum: c.checksum,
        updated_at: c.updated_at,
      })),
      total_citas: citas.length,
      total_documentos: documentos.length,
      observaciones_usuario: observaciones,
    };
  });

  return NextResponse.json({
    usuario_id: id,
    monografias_generadas: monografias.length,
    historial,
  });
}
