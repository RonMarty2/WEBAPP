import { NextResponse } from "next/server";
import { llamarIA, extraerJSON, extraerCitas } from "@/lib/aiProvider";
import { detectarAlucinaciones } from "@/lib/validaciones";
import {
  SISTEMA_ETAPA_0,
  SISTEMA_ETAPA_1,
  SISTEMA_ETAPA_2,
  SISTEMA_ETAPA_3,
  buildUserEtapa0,
  buildUserEtapa1,
  buildUserEtapa2,
  buildUserEtapa3,
} from "@/lib/prompts";
import {
  getMonografia,
  updateMonografia,
  getCapitulo,
  upsertCapitulo,
  getCitas,
  getDocumentos,
  addCita,
} from "@/lib/memoryStore";

type Params = Promise<{ numero: string }>;

// POST /api/etapas/[numero]/generar
export async function POST(req: Request, { params }: { params: Params }) {
  const { numero } = await params;
  const etapa = parseInt(numero, 10);

  if (isNaN(etapa) || etapa < 0 || etapa > 3) {
    return NextResponse.json({ error: "Etapa debe ser 0, 1, 2 o 3" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { monografia_id, inputs = {} } = body;

    if (!monografia_id) {
      return NextResponse.json({ error: "monografia_id requerido" }, { status: 400 });
    }

    const monografia = getMonografia(monografia_id);
    if (!monografia) {
      return NextResponse.json({ error: "Monografía no encontrada" }, { status: 404 });
    }

    // Build system + user message based on stage
    let systemPrompt: string;
    let userMessage: string;

    if (etapa === 0) {
      systemPrompt = SISTEMA_ETAPA_0;
      userMessage = buildUserEtapa0({
        diplomado: String(monografia.datos_base.diplomado ?? ""),
        temas_abordados: (monografia.datos_base.temas_abordados as string[]) ?? [],
        area_interes: String(monografia.datos_base.area_interes ?? ""),
        contexto_geografico: String(monografia.datos_base.contexto_geografico ?? ""),
        trabajas_en: monografia.datos_base.trabajas_en as string | undefined,
      });

    } else if (etapa === 1) {
      // Require Etapa 0 to be completed
      const cap0 = getCapitulo(monografia_id, 0);
      if (!cap0?.contenido_json) {
        return NextResponse.json(
          { error: "Debes completar y aprobar la Etapa 0 (selección de tema) antes." },
          { status: 400 }
        );
      }

      const requiredFields = [
        "antecedentes_problema",
        "literatura_relevante",
        "causas_raiz",
        "efectos_proyectados",
        "situacion_controlada",
        "objetivos_especificos",
        "justificacion_teorica",
        "justificacion_practica",
        "justificacion_social",
        "alcance_temporal",
        "alcance_geografico",
        "limitaciones",
        "tipo_investigacion",
      ];
      const missing = requiredFields.filter(f => !(f in inputs));
      if (missing.length > 0) {
        return NextResponse.json(
          { error: `Campos faltantes para Etapa 1: ${missing.join(", ")}` },
          { status: 400 }
        );
      }

      const temaSeleccionado = (cap0.contenido_json as Record<string, unknown>)?.tema_seleccionado
        ?? cap0.contenido_json;

      systemPrompt = SISTEMA_ETAPA_1;
      userMessage = buildUserEtapa1({
        tema_seleccionado: temaSeleccionado as Record<string, unknown>,
        ...inputs,
        tiene_hipotesis: inputs.tiene_hipotesis ?? false,
      });

    } else if (etapa === 2) {
      const cap1 = getCapitulo(monografia_id, 1);
      if (!cap1?.contenido_json) {
        return NextResponse.json(
          { error: "Debes completar y aprobar la Etapa 1 (Capítulo I) antes." },
          { status: 400 }
        );
      }

      const citasCap1 = getCitas(monografia_id).filter(c => c.capitulo === 1);
      const documentos = getDocumentos(monografia_id);
      const docsFmt = documentos.map(d => ({
        nombre: d.nombre,
        contenido_extraido: d.contenido_extraido ?? "",
        tipo: d.tipo ?? "txt",
      }));

      const cap1Json = cap1.contenido_json as Record<string, unknown>;
      const teorias = (inputs.teorias_a_desarrollar as string[] | undefined)
        ?? (cap1Json?.teorias_identificadas as string[] | undefined)
        ?? [];

      systemPrompt = SISTEMA_ETAPA_2;
      userMessage = buildUserEtapa2({
        cap1_output: cap1Json,
        citas_cap1: citasCap1,
        teorias_a_desarrollar: teorias,
        documentos_usuario: docsFmt.length > 0 ? docsFmt : undefined,
        estudios_relacionados_cantidad: inputs.estudios_relacionados_cantidad ?? 5,
        marcos_adicionales: inputs.marcos_adicionales,
      });

    } else {
      // etapa === 3
      const cap1 = getCapitulo(monografia_id, 1);
      const cap2 = getCapitulo(monografia_id, 2);
      if (!cap1?.contenido_json || !cap2?.contenido_json) {
        return NextResponse.json(
          { error: "Debes completar y aprobar Etapas 1 y 2 antes." },
          { status: 400 }
        );
      }

      const todasLasCitas = getCitas(monografia_id);

      systemPrompt = SISTEMA_ETAPA_3;
      userMessage = buildUserEtapa3({
        cap1_output: cap1.contenido_json as Record<string, unknown>,
        cap2_output: cap2.contenido_json as Record<string, unknown>,
        citas_totales: todasLasCitas,
        fuentes_datos: inputs.fuentes_datos,
        observaciones_adicionales: inputs.observaciones_adicionales,
      });
    }

    // Call AI
    const { text, provider } = await llamarIA(systemPrompt, userMessage, 7000);

    // Anti-hallucination check
    const { limpio, alertas } = detectarAlucinaciones(text);

    // Extract structured JSON from response
    const outputJson = extraerJSON(text);

    // Save chapter
    const capitulo = upsertCapitulo({
      monografia_id,
      numero: etapa,
      contenido: text,
      contenido_json: outputJson ?? undefined,
      status: "draft",
    });

    // Register citations found in AI output
    let citasRegistradas = 0;
    if (outputJson) {
      const citas = extraerCitas(outputJson);
      for (const cita of citas) {
        if (cita.autor && cita.titulo_obra) {
          addCita({
            monografia_id,
            autor: cita.autor,
            ano: cita.ano,
            titulo_obra: cita.titulo_obra,
            fuente: cita.fuente,
            tipo: cita.tipo ?? "libro",
            formato_apa: cita.formato_apa,
            capitulo: cita.capitulo ?? etapa,
            es_consultado: true,
          });
          citasRegistradas++;
        }
      }
    }

    // Advance monografía status
    const statusMap: Record<number, string> = { 0: "tema", 1: "cap1", 2: "cap2", 3: "cap3" };
    updateMonografia(monografia_id, {
      etapa_actual: etapa,
      status: statusMap[etapa] ?? monografia.status,
    });

    return NextResponse.json({
      etapa,
      capitulo_id: capitulo.id,
      texto: text,
      output_json: outputJson,
      citas_registradas: citasRegistradas,
      proveedor_ia: provider,
      advertencias_alucinacion: limpio ? [] : alertas,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: `Error generando Etapa ${etapa}: ${message}` }, { status: 500 });
  }
}
