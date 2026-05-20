import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/api-auth';
import { procesarDocumento } from '@/lib/ai/rag-processor';
import { llamarIA } from '@/lib/aiProvider';
import {
  SISTEMA_ANALIZAR_GUIA,
  buildUserPromptAnalizarGuia,
} from '@/lib/prompts/adaptativo/analizar-guia';
import { matchearGuiaContraPlantillas } from '@/lib/adaptativo/templateMatcher';
import { construirPlanAdaptativo } from '@/lib/adaptativo/planBuilder';
import type { GuiaAnalizada } from '@/lib/adaptativo/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB
const EXTENSIONES_VALIDAS = ['pdf', 'docx', 'doc', 'txt'];
const TEXTO_MINIMO_CHARS = 80;
const NOMBRE_MINIMO_CHARS = 4;

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth();

    const formData = await req.formData();
    const archivo = formData.get('archivo') as File | null;
    const textoRaw = formData.get('texto') as string | null;
    const nombreTrabajoRaw = formData.get('nombre_trabajo') as string | null;

    const nombreTrabajo = (nombreTrabajoRaw ?? '').trim();
    if (nombreTrabajo.length < NOMBRE_MINIMO_CHARS) {
      return NextResponse.json(
        { error: `El nombre del trabajo debe tener al menos ${NOMBRE_MINIMO_CHARS} caracteres.` },
        { status: 400 },
      );
    }

    let textoGuia = '';
    let fuente: 'archivo' | 'texto';
    let nombreArchivo: string | undefined;
    let palabrasOriginales = 0;
    let truncado = false;

    if (archivo && archivo.size > 0) {
      fuente = 'archivo';
      nombreArchivo = archivo.name;

      if (archivo.size > TAMANO_MAXIMO_BYTES) {
        return NextResponse.json(
          { error: 'El archivo supera el límite de 10 MB.' },
          { status: 400 },
        );
      }

      const ext = archivo.name.split('.').pop()?.toLowerCase() ?? '';
      if (!EXTENSIONES_VALIDAS.includes(ext)) {
        return NextResponse.json(
          { error: `Formato no soportado. Usa: ${EXTENSIONES_VALIDAS.join(', ')}.` },
          { status: 400 },
        );
      }

      try {
        const doc = await procesarDocumento(archivo, archivo.name);
        textoGuia = doc.texto ?? '';
        palabrasOriginales = doc.palabras ?? 0;
        truncado = Boolean(doc.truncado);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al leer el archivo';
        return NextResponse.json(
          { error: `No se pudo leer el archivo: ${msg}` },
          { status: 400 },
        );
      }
    } else if (textoRaw && textoRaw.trim().length >= TEXTO_MINIMO_CHARS) {
      fuente = 'texto';
      textoGuia = textoRaw.trim();
      palabrasOriginales = textoGuia.split(/\s+/).filter(Boolean).length;
    } else {
      return NextResponse.json(
        {
          error: `Debes subir un archivo o pegar texto con al menos ${TEXTO_MINIMO_CHARS} caracteres.`,
        },
        { status: 400 },
      );
    }

    if (textoGuia.trim().length < TEXTO_MINIMO_CHARS) {
      return NextResponse.json(
        {
          error:
            'No se pudo extraer suficiente texto de la guía. Si subiste un PDF escaneado (solo imágenes), pega el texto manualmente.',
        },
        { status: 400 },
      );
    }

    const userPrompt = buildUserPromptAnalizarGuia({
      nombre_trabajo: nombreTrabajo,
      texto_guia: textoGuia,
      nombre_archivo: nombreArchivo,
      fuente,
    });

    const inicio = Date.now();
    const respuestaIA = await llamarIA(SISTEMA_ANALIZAR_GUIA, userPrompt, 2500);
    const duracion = Date.now() - inicio;

    const guiaAnalizada = parsearJsonIA(respuestaIA.text);
    if (!guiaAnalizada) {
      return NextResponse.json(
        {
          error:
            'La IA no devolvió un análisis válido. Vuelve a intentar o pega el texto en lugar del archivo.',
        },
        { status: 502 },
      );
    }

    const guiaValidada = validarYNormalizarGuia(guiaAnalizada);

    const matching = matchearGuiaContraPlantillas(guiaValidada);
    const plan = construirPlanAdaptativo({
      nombre_trabajo: nombreTrabajo,
      guia_analizada: guiaValidada,
      matching,
    });

    return NextResponse.json({
      ok: true,
      guia_analizada: guiaValidada,
      matching,
      plan,
      metadata: {
        fuente,
        nombre_archivo: nombreArchivo,
        palabras_originales: palabrasOriginales,
        truncado,
        proveedor_ia: respuestaIA.provider,
        modelo_ia: respuestaIA.model,
        duracion_ms: duracion,
        usuario_id: user.id,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[adaptativo/analyze-guide] Error:', err);
    return NextResponse.json(
      { error: `Error al analizar la guía: ${msg}` },
      { status: 500 },
    );
  }
}

/**
 * Extrae el JSON de la respuesta de la IA.
 * La IA a veces envuelve en ```json ... ```, agrega texto antes/después,
 * o devuelve solo el JSON limpio. Esta función maneja los 3 casos.
 */
function parsearJsonIA(texto: string): Record<string, unknown> | null {
  if (!texto) return null;

  const limpio = texto
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '')
    .trim();

  try {
    return JSON.parse(limpio);
  } catch {
    // Si el JSON está mezclado con texto, buscar el primer { y el último }
    const inicio = limpio.indexOf('{');
    const fin = limpio.lastIndexOf('}');
    if (inicio === -1 || fin === -1 || fin <= inicio) return null;
    try {
      return JSON.parse(limpio.slice(inicio, fin + 1));
    } catch {
      return null;
    }
  }
}

/**
 * Valida y normaliza la guía analizada. Aplica defaults conservadores si la IA
 * omitió campos o devolvió tipos incorrectos. Garantiza que el shape final sea
 * exactamente `GuiaAnalizada`.
 */
function validarYNormalizarGuia(raw: Record<string, unknown>): GuiaAnalizada {
  const seccionesRaw = Array.isArray(raw.secciones) ? raw.secciones : [];
  const secciones = seccionesRaw.map((s, idx) => {
    const sec = (s ?? {}) as Record<string, unknown>;
    return {
      titulo: typeof sec.titulo === 'string' ? sec.titulo.trim() : `Sección ${idx + 1}`,
      descripcion: typeof sec.descripcion === 'string' ? sec.descripcion.trim() : '',
      requisitos: Array.isArray(sec.requisitos)
        ? sec.requisitos.filter((r): r is string => typeof r === 'string')
        : [],
      orden: typeof sec.orden === 'number' && sec.orden > 0 ? sec.orden : idx + 1,
    };
  });

  const paginasRaw = (raw.paginas_estimadas ?? {}) as Record<string, unknown>;
  const paginasMin = typeof paginasRaw.min === 'number' ? paginasRaw.min : 10;
  const paginasMax = typeof paginasRaw.max === 'number' ? paginasRaw.max : 20;

  const formatoCitas = ['APA', 'vancouver', 'icontec', 'otro', 'no_especificado'].includes(
    String(raw.formato_citas),
  )
    ? (raw.formato_citas as GuiaAnalizada['formato_citas'])
    : 'no_especificado';

  const tono = ['academico', 'reflexivo', 'tecnico', 'divulgativo', 'mixto'].includes(
    String(raw.tono),
  )
    ? (raw.tono as GuiaAnalizada['tono'])
    : 'academico';

  return {
    secciones,
    pide_imagenes: Boolean(raw.pide_imagenes),
    pide_tablas: Boolean(raw.pide_tablas),
    pide_encuesta: Boolean(raw.pide_encuesta),
    pide_bibliografia: Boolean(raw.pide_bibliografia),
    pide_hipotesis: Boolean(raw.pide_hipotesis),
    pide_marco_teorico: Boolean(raw.pide_marco_teorico),
    pide_analisis_cuantitativo: Boolean(raw.pide_analisis_cuantitativo),
    pide_conclusiones: Boolean(raw.pide_conclusiones),
    paginas_estimadas: {
      min: Math.max(1, Math.min(paginasMin, paginasMax)),
      max: Math.max(paginasMin, paginasMax),
    },
    formato_citas: formatoCitas,
    tono,
    resumen: typeof raw.resumen === 'string' ? raw.resumen.trim() : '',
    advertencias: Array.isArray(raw.advertencias)
      ? raw.advertencias.filter((a): a is string => typeof a === 'string')
      : [],
  };
}
