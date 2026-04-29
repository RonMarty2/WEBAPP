import { NextResponse } from "next/server";
import { getMonografia, getCapitulos, getCitas } from "@/lib/memoryStore";
import { generarLatexMonografia } from "@/lib/latexMonografia";
import { validarCitasEnBibliografia } from "@/lib/validaciones";

type Params = Promise<{ monografia_id: string }>;

// POST /api/compilar/[monografia_id]
// Compiles all approved chapters into a LaTeX document and returns it as download.
// PDF compilation requires pdflatex on the server; use Overleaf if unavailable.
export async function POST(req: Request, { params }: { params: Params }) {
  const { monografia_id } = await params;

  const monografia = getMonografia(monografia_id);
  if (!monografia) {
    return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { caratula_pdf } = body;

    const capitulos = getCapitulos(monografia_id);
    const todasLasCitas = getCitas(monografia_id);

    // Require at least Chapters I-III
    const capNums = capitulos.map(c => c.numero).filter(n => n >= 1);
    if (capNums.length < 1) {
      return NextResponse.json(
        { error: "Necesitas generar al menos el Capítulo I antes de compilar." },
        { status: 400 }
      );
    }

    // Extract titulo from Cap. 0 JSON or monografía
    const cap0 = capitulos.find(c => c.numero === 0);
    const temaJson = cap0?.contenido_json as Record<string, unknown> | undefined;
    const temaSeleccionado = temaJson?.tema_seleccionado as Record<string, unknown> | undefined;
    const titulo = String(temaSeleccionado?.titulo ?? monografia.titulo ?? "Monografía");

    // Build chapter content list
    const capituloContenidos = capitulos
      .filter(c => c.numero >= 1 && c.contenido)
      .map(c => ({
        numero: c.numero,
        titulo: `Capítulo ${c.numero}`,
        contenido: c.contenido ?? "",
      }));

    // Extract final bibliography from Etapa 3 output if available
    const cap3 = capitulos.find(c => c.numero === 3);
    const cap3Json = cap3?.contenido_json as Record<string, unknown> | undefined;
    const biblioFinal = (cap3Json?.bibliografia_final as unknown[]) ?? [];

    // Use registered citations as fallback
    const citasBiblio = biblioFinal.length > 0
      ? (biblioFinal as Array<{ autor: string; ano?: number; titulo_obra: string; fuente?: string; tipo?: string; formato_apa?: string }>)
      : todasLasCitas.map(c => ({
          autor: c.autor,
          ano: c.ano,
          titulo_obra: c.titulo_obra,
          fuente: c.fuente,
          tipo: c.tipo,
          formato_apa: c.formato_apa,
        }));

    // Validate citations
    const citasEnTexto = todasLasCitas.map(c => `${c.autor} ${c.ano ?? ""}`);
    const { faltantes, sobrantes } = validarCitasEnBibliografia(citasEnTexto, citasBiblio);

    // Generate LaTeX
    const latexSource = generarLatexMonografia({
      titulo,
      diplomado: monografia.diplomado ?? "",
      caratulaPdf: caratula_pdf ?? undefined,
      capituloContenidos,
      bibliografia: citasBiblio,
    });

    // Determine output format
    const { searchParams } = new URL(req.url);
    const formato = searchParams.get("formato") ?? "latex";

    if (formato === "latex") {
      const filename = titulo
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 40);

      return new NextResponse(latexSource, {
        status: 200,
        headers: {
          "Content-Type": "application/x-tex",
          "Content-Disposition": `attachment; filename="${filename}_monografia.tex"`,
          "X-Citas-Faltantes": faltantes.length.toString(),
          "X-Citas-Sobrantes": sobrantes.length.toString(),
        },
      });
    }

    // Return JSON preview with LaTeX source and validation report
    return NextResponse.json({
      titulo,
      monografia_id,
      capitulos_incluidos: capituloContenidos.map(c => c.numero),
      citas_totales: citasBiblio.length,
      advertencias: {
        citas_faltantes: faltantes,
        citas_sobrantes: sobrantes,
      },
      latex_source: latexSource,
      instrucciones_compilacion: [
        "1. Descarga el archivo .tex (usa ?formato=latex)",
        "2. Sube a Overleaf (overleaf.com) para compilar el PDF",
        "3. O instala MiKTeX/TeX Live y ejecuta: pdflatex archivo.tex (dos veces)",
        "4. Si tienes carátula: nombra el PDF 'caratula.pdf' en el mismo directorio",
      ],
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error compilando: ${message}` }, { status: 500 });
  }
}

// GET /api/compilar/[monografia_id] — verificar si la monografía está lista para compilar
export async function GET(_req: Request, { params }: { params: Params }) {
  const { monografia_id } = await params;

  const monografia = getMonografia(monografia_id);
  if (!monografia) {
    return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
  }

  const capitulos = getCapitulos(monografia_id);
  const citas = getCitas(monografia_id);

  const etapasCompletadas = capitulos.map(c => c.numero);
  const lista = etapasCompletadas.includes(1) && etapasCompletadas.includes(2) && etapasCompletadas.includes(3);

  return NextResponse.json({
    monografia_id,
    titulo: monografia.titulo,
    lista_para_compilar: lista,
    etapas_completadas: etapasCompletadas,
    etapas_faltantes: [1, 2, 3].filter(n => !etapasCompletadas.includes(n)),
    total_citas: citas.length,
    status: monografia.status,
  });
}
