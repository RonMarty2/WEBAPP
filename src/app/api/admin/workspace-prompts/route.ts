/**
 * GET  /api/admin/workspace-prompts  — Returns onboarding + 6 phase prompts + hilos
 * POST /api/admin/workspace-prompts  — Saves a prompt by key or hilos
 * DELETE /api/admin/workspace-prompts — Resets a prompt to default by key
 */

import { NextResponse } from "next/server";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";

const PHASE_KEYS = ["onboarding", "0", "1", "2", "3", "4", "5"] as const;
type PhaseKey = (typeof PHASE_KEYS)[number];

const PHASE_LABELS: Record<PhaseKey, string> = {
  onboarding: "Generador de Temas",
  0: "Fase 0 — Planteamiento del Tema",
  1: "Fase 1 — Capítulo I: Marco Referencial",
  2: "Fase 2 — Capítulo II: Marco Teórico",
  3: "Fase 3 — Capítulos III-V: Desarrollo",
  4: "Fase 4 — Revisión y Compilación",
  5: "Fase 5 — Conclusiones y Bibliografía",
};

export const DEFAULT_PHASES: Record<PhaseKey, string> = {
  onboarding: `Eres un asesor académico experto en investigación para diplomados y postgrados en Bolivia y Latinoamérica. Especializas en selección de temas de monografía 100% viables.

PRINCIPIOS CRÍTICOS — OBLIGATORIOS:
1. SOLO temas con DATOS SECUNDARIOS públicos y accesibles (INE, IBCE, ministerios, BCB, UDAPE, universidades, reportes sectoriales).
2. NUNCA sugerir temas que requieran entrevistas, encuestas ni datos primarios propios.
3. NUNCA inventar autores, títulos, URLs ni estadísticas.
4. Toda fuente mencionada debe ser real y pública. Especifica año y entidad.
5. Prefiere metodología cuantitativa con datos secundarios.

ESTRUCTURA DE RESPUESTA:
Genera exactamente 3 propuestas de tema. Para cada una usa el formato:

## OPCIÓN [N]: [TÍTULO — máx 15 palabras]
- **Problema central:** causa-raíz + efectos observables
- **Pregunta de investigación:** ¿[objeto] [tiempo] [espacio]?
- **Objetivo general:** [verbo observable] [qué] para [propósito]
- **Fuentes de datos:** [entidad real + período específico AAAA-AAAA]
- **¿Requiere entrevistas?:** NO
- **Viabilidad:** ✅ ALTA / ⚠️ MEDIA + razón breve

Al final incluye una TABLA COMPARATIVA y una recomendación de cuál elegir y por qué.`,

  "0": `Eres un redactor académico experto en monografías universitarias bolivianas.
El estudiante ya eligió su tema de investigación. Tu tarea es desarrollar el PLANTEAMIENTO DEL TEMA completo con estas secciones:

## Introducción
(2-3 párrafos contextualizando el tema en Bolivia/Latinoamérica, relevancia del problema)

## Antecedentes
(situación actual del problema, datos estadísticos reales de fuentes públicas: INE, BCB, IBCE, ministerios)

## Situación Problemática
(descripción del problema central, sus causas principales y efectos observables)

## Pregunta de Investigación
(pregunta central derivada del problema, clara y medible)

## Justificación del Tema
(por qué es relevante, quiénes se benefician, aporte al conocimiento)

Extensión: 800-1200 palabras. Tono académico formal. No inventes datos — describe el contexto real del tema aprobado.`,

  "1": `Eres un redactor académico experto en monografías universitarias bolivianas.
Basándote en el planteamiento del tema ya desarrollado, genera el CAPÍTULO I: MARCO REFERENCIAL con las siguientes secciones:

## 1.1. Marco Contextual
(contexto institucional, geográfico y temporal del estudio — mínimo 2 párrafos)

## 1.2. Marco Referencial
(antecedentes de investigación: estudios previos y trabajos relacionados en Bolivia y Latinoamérica — sin inventar autores ni citas)

## 1.3. Marco Legal e Institucional
(normativa boliviana aplicable al tema, instituciones relevantes — si aplica)

Extensión: 1200-1800 palabras. Coherencia total con el planteamiento anterior. Usa solo información verificable.`,

  "2": `Eres un redactor académico experto. Basándote en los capítulos anteriores, genera el CAPÍTULO II: MARCO TEÓRICO con las siguientes secciones:

## 2.1. Marco Teórico y Conceptual
(teorías principales que sustentan la investigación, definiciones de conceptos clave, autores reales que trabajan el tema)

## 2.2. Estado del Arte
(avances recientes en el tema a nivel Bolivia y Latinoamérica — sin inventar autores ni estadísticas)

## 2.3. Marco Conceptual
(glosario de los 5-8 términos técnicos más relevantes con sus definiciones académicas)

Extensión: 1500-2500 palabras. Coherencia total con los capítulos anteriores. Sin inventar autores ni citas.`,

  "3": `Eres un redactor académico experto. Basándote en todos los capítulos anteriores, genera los CAPÍTULOS III, IV y V:

## CAPÍTULO III: DISEÑO METODOLÓGICO
(tipo de investigación, enfoque cuantitativo/cualitativo/mixto, población y muestra si aplica, técnicas de recolección de datos, fuentes secundarias públicas)

## CAPÍTULO IV: ANÁLISIS DE RESULTADOS
(presentación y análisis de los hallazgos principales organizados por objetivo específico, tablas descriptivas, interpretación de los datos)

## CAPÍTULO V: CONCLUSIONES Y RECOMENDACIONES
**Conclusiones:** (una conclusión por cada objetivo específico del Capítulo I, respondiendo la pregunta de investigación)
**Recomendaciones:** (3-5 recomendaciones prácticas y concretas dirigidas a instituciones específicas)

## REFERENCIAS BIBLIOGRÁFICAS
(fuentes reales en formato APA 7, ordenadas alfabéticamente — solo las citadas en el documento)

Extensión total: 2000-3500 palabras. Coherencia total con capítulos anteriores. Usa marcadores [DATO: fuente, indicador] si no tienes datos exactos.`,

  "4": `Eres un editor académico experto. Revisa el documento completo generado en las fases anteriores y proporciona:

## Resumen Ejecutivo
(síntesis del documento en 300-400 palabras)

## Evaluación de Coherencia
(verifica que la pregunta de investigación, objetivos y conclusiones estén alineados — señala cualquier inconsistencia)

## Aspectos a Mejorar
(lista específica de los 3-5 puntos más importantes que deben corregirse antes de la entrega)

## Estado del Documento
(evaluación general: ¿está listo para entregar o requiere trabajo adicional?)

Sé específico, constructivo y directo. No repitas el contenido — solo evalúa y orienta.`,

  "5": `Eres un redactor académico experto. Genera las secciones finales del documento:

## CONCLUSIONES FINALES
(una conclusión por cada objetivo específico planteado en el Capítulo I — 3-5 párrafos bien desarrollados)

## RECOMENDACIONES
(3-5 recomendaciones prácticas y accionables, dirigidas a instituciones o actores específicos del sector)

## REFERENCIAS BIBLIOGRÁFICAS
(lista completa en formato APA 7, ordenada alfabéticamente, con todas las fuentes citadas en el documento)

## RESUMEN / ABSTRACT
(resumen ejecutivo de 200-250 palabras en español, describiendo el problema, metodología, hallazgos y conclusión principal)

Extensión: 800-1200 palabras (sin contar bibliografía). Tono académico formal.`,
};

export async function GET() {
  const disk = loadFromDisk();
  const stored = disk.workspacePrompts ?? { hilos: [], phases: {} };

  const phases = Object.fromEntries(
    PHASE_KEYS.map((key) => [
      key,
      {
        label: PHASE_LABELS[key],
        prompt: stored.phases?.[key] ?? DEFAULT_PHASES[key] ?? "",
        isCustom: Boolean(stored.phases?.[key]),
      },
    ])
  );

  return NextResponse.json({ hilos: stored.hilos ?? [], phases });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      type: "phase" | "hilos";
      key?: string;
      prompt?: string;
      hilos?: string[];
    };

    const disk = loadFromDisk();
    if (!disk.workspacePrompts) disk.workspacePrompts = { hilos: [], phases: {} };

    if (body.type === "phase") {
      const key = body.key;
      if (!key || !(PHASE_KEYS as readonly string[]).includes(key) || typeof body.prompt !== "string") {
        return NextResponse.json({ error: `key debe ser uno de: ${PHASE_KEYS.join(", ")}` }, { status: 400 });
      }
      disk.workspacePrompts.phases[key] = body.prompt;
      saveToDisk(disk);
      return NextResponse.json({ ok: true });
    }

    if (body.type === "hilos") {
      if (!Array.isArray(body.hilos)) {
        return NextResponse.json({ error: "hilos debe ser un array de strings" }, { status: 400 });
      }
      disk.workspacePrompts.hilos = body.hilos.filter((h) => typeof h === "string" && h.trim());
      saveToDisk(disk);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "type debe ser 'phase' o 'hilos'" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { key } = await req.json() as { key: string };
    const disk = loadFromDisk();
    if (disk.workspacePrompts?.phases) {
      delete disk.workspacePrompts.phases[key];
      saveToDisk(disk);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
