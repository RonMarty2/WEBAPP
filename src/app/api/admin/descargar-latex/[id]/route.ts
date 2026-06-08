import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/api-auth";
import { getMonografia, getCapitulos, getCitas } from "@/lib/memoryStore";
import { generarLatexMonografia } from "@/lib/latexMonografia";
import { validarCitasEnBibliografia } from "@/lib/validaciones";

type Params = Promise<{ id: string }>;

// GET /api/admin/descargar-latex/[id]
// Admin endpoint: download LaTeX source for any monografía by ID.
export async function GET(_req: Request, { params }: { params: Params }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const monografia = getMonografia(id);
  if (!monografia) {
    return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
  }

  const capitulos = getCapitulos(id);
  const todasLasCitas = getCitas(id);

  const cap0 = capitulos.find(c => c.numero === 0);
  const temaJson = cap0?.contenido_json as Record<string, unknown> | undefined;
  const temaSeleccionado = temaJson?.tema_seleccionado as Record<string, unknown> | undefined;
  const titulo = String(temaSeleccionado?.titulo ?? monografia.titulo ?? "Monografía");

  const capituloContenidos = capitulos
    .filter(c => c.numero >= 1 && c.contenido)
    .map(c => ({
      numero: c.numero,
      titulo: `Capítulo ${c.numero}`,
      contenido: c.contenido ?? "",
    }));

  const cap3 = capitulos.find(c => c.numero === 3);
  const biblioFinal = ((cap3?.contenido_json as Record<string, unknown> | undefined)?.bibliografia_final as unknown[]) ?? [];

  const citasBiblio = biblioFinal.length > 0
    ? (biblioFinal as Array<{ autor: string; ano?: number; titulo_obra: string; fuente?: string; tipo?: string; formato_apa?: string }>)
    : todasLasCitas.map(c => ({
        autor: c.autor, ano: c.ano, titulo_obra: c.titulo_obra,
        fuente: c.fuente, tipo: c.tipo, formato_apa: c.formato_apa,
      }));

  const citasEnTexto = todasLasCitas.map(c => `${c.autor} ${c.ano ?? ""}`);
  const { faltantes } = validarCitasEnBibliografia(citasEnTexto, citasBiblio);

  const latexSource = generarLatexMonografia({
    titulo,
    diplomado: monografia.diplomado ?? "",
    capituloContenidos,
    bibliografia: citasBiblio,
    universidad_id: (monografia as unknown as { universidad_id?: string }).universidad_id,
  });

  const slug = titulo
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 50);

  return new NextResponse(latexSource, {
    status: 200,
    headers: {
      "Content-Type": "application/x-tex; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}_admin.tex"`,
      "X-Citas-Faltantes": faltantes.length.toString(),
      "X-Monografia-Status": monografia.status,
    },
  });
}
