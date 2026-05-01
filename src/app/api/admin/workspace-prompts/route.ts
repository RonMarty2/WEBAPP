/**
 * GET  /api/admin/workspace-prompts  — Returns 6 phase prompts + hilos conductores
 * POST /api/admin/workspace-prompts  — Saves a phase prompt or hilos conductores
 */

import { NextResponse } from "next/server";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";

const FASE_LABELS: Record<number, string> = {
  0: "Fase 0 — Tema y Planteamiento",
  1: "Fase 1 — Capítulo I",
  2: "Fase 2 — Capítulo II",
  3: "Fase 3 — Capítulos III-V",
  4: "Fase 4 — Revisión y Compilación",
  5: "Fase 5 — Entrega Final",
};

const DEFAULT_PHASES: Record<string, string> = {
  "0": `Eres un asesor académico experto en monografías para diplomados y postgrados en Bolivia.
Genera exactamente 3 propuestas de tema de investigación viables para una monografía académica.
Cada tema debe:
- Ser investigable con datos secundarios públicos (INE, IBCE, BCB, ministerios bolivianos)
- NO requerir entrevistas ni datos primarios propios
- Tener metodología cuantitativa o descriptiva clara
- Ser relevante para Bolivia o Latinoamérica

Formato de respuesta para cada opción:
## OPCIÓN [N]: [TÍTULO]
- **Problema central:** ...
- **Pregunta de investigación:** ...
- **Objetivo general:** ...
- **Fuentes de datos:** [entidades reales + períodos]
- **Viabilidad:** ✅ ALTA / ⚠️ MEDIA

Al final incluye una recomendación breve de cuál elegir y por qué.`,

  "1": `Eres un redactor académico experto en monografías universitarias bolivianas.
Genera el CAPÍTULO I completo (Planteamiento del Problema) con las siguientes secciones:

## 1.1. Planteamiento y Formulación del Problema
(3-4 párrafos: contexto, problema específico, pregunta de investigación)

## 1.2. Objetivos de la Investigación
**Objetivo General:**
**Objetivos Específicos:**
(3-4 objetivos con verbo observable)

## 1.3. Justificación
**Justificación Teórica:**
**Justificación Práctica:**
**Justificación Social:**

## 1.4. Alcances y Delimitación
(temporal, espacial, temática)

## 1.5. Hipótesis (si aplica)
(planteamiento + variables)

Usa un tono académico formal. Extensión: 1200-1800 palabras. Sin inventar datos ni citas que no conozcas.`,

  "2": `Eres un redactor académico experto. Basándote en el Capítulo I ya aprobado, genera el CAPÍTULO II completo:

## 2.1. Marco Teórico y Conceptual
(teorías principales que sustentan la investigación, definiciones clave)

## 2.2. Marco Referencial
(estudios previos relacionados, estado del arte en Bolivia/Latinoamérica)

## 2.3. Marco Legal e Institucional (si aplica)
(normativa relevante)

Extensión: 1500-2500 palabras. Coherencia total con el Capítulo I. Sin inventar autores ni citas.`,

  "3": `Eres un redactor académico experto. Basándote en los capítulos anteriores, genera los CAPÍTULOS III, IV y V:

## CAPÍTULO III: DISEÑO METODOLÓGICO
(tipo de investigación, enfoque, población/muestra, técnicas de recolección, fuentes de datos)

## CAPÍTULO IV: ANÁLISIS DE RESULTADOS
(presentación y análisis de los hallazgos principales, tablas o datos relevantes si aplica)

## CAPÍTULO V: CONCLUSIONES Y RECOMENDACIONES
**Conclusiones:** (una por objetivo específico)
**Recomendaciones:** (prácticas y concretas)

## REFERENCIAS BIBLIOGRÁFICAS
(fuentes reales en formato APA 7, ordenadas alfabéticamente)

Extensión total: 2000-3500 palabras. Coherencia total con capítulos anteriores.`,

  "4": `Eres un editor académico. Revisa el documento completo y proporciona:
1. Resumen ejecutivo del documento
2. Lista de aspectos a mejorar (si los hay)
3. Verificación de coherencia entre capítulos
4. Sugerencias finales antes de la entrega`,

  "5": `Eres un asistente académico. Genera el resumen final del documento y las instrucciones para exportar a PDF usando Overleaf.`,
};

export async function GET() {
  const disk = loadFromDisk();
  const stored = disk.workspacePrompts ?? { hilos: [], phases: {} };

  const phases = Object.fromEntries(
    [0, 1, 2, 3, 4, 5].map((n) => [
      String(n),
      {
        label: FASE_LABELS[n],
        prompt: stored.phases?.[String(n)] ?? DEFAULT_PHASES[String(n)] ?? "",
        isCustom: Boolean(stored.phases?.[String(n)]),
      },
    ])
  );

  return NextResponse.json({
    hilos: stored.hilos ?? [],
    phases,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      type: "phase" | "hilos";
      fase?: number;
      prompt?: string;
      hilos?: string[];
    };

    const disk = loadFromDisk();
    if (!disk.workspacePrompts) {
      disk.workspacePrompts = { hilos: [], phases: {} };
    }

    if (body.type === "phase") {
      const fase = body.fase;
      if (fase === undefined || fase < 0 || fase > 5 || typeof body.prompt !== "string") {
        return NextResponse.json({ error: "fase (0-5) y prompt requeridos" }, { status: 400 });
      }
      disk.workspacePrompts.phases[String(fase)] = body.prompt;
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
    const { fase } = await req.json() as { fase: number };
    const disk = loadFromDisk();
    if (disk.workspacePrompts?.phases) {
      delete disk.workspacePrompts.phases[String(fase)];
      saveToDisk(disk);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
