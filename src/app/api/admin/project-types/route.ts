/**
 * GET    /api/admin/project-types              — list all + their phases
 * POST   /api/admin/project-types              — create tipo or phase (type in body)
 * DELETE /api/admin/project-types              — delete tipo or phase
 */

import { NextResponse } from "next/server";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";
import type { TipoProyecto, FaseTipoProyecto } from "@/lib/persistence";

function uid(): string {
  return "tp-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// ── Seed data ──────────────────────────────────────────────────────────────────

const SEED_TIPOS: Omit<TipoProyecto, "created_at">[] = [
  {
    id: "tipo-tesis",
    nombre: "Tesis",
    descripcion: "Trabajo de investigación original para obtención de grado académico.",
    icon: "🎓",
    activo: true,
  },
  {
    id: "tipo-monografia",
    nombre: "Monografía",
    descripcion: "Documento académico estructurado para diplomados y postgrados.",
    icon: "📄",
    activo: true,
  },
];

const SEED_FASES_TESIS: Omit<FaseTipoProyecto, "id">[] = [
  { tipo_proyecto_id: "tipo-tesis", nombre: "Fase 1 — Introducción y Planteamiento", descripcion: "Contexto, problema, justificación y objetivos de la investigación.", orden: 0, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-tesis", nombre: "Fase 2 — Marco Teórico y Referencial", descripcion: "Antecedentes, teorías relevantes, estado del arte.", orden: 10, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-tesis", nombre: "Fase 3 — Diseño Metodológico", descripcion: "Tipo, enfoque, población, muestra y técnicas de recolección.", orden: 20, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-tesis", nombre: "Fase 3A — Recolección y Análisis de Datos", descripcion: "Sub-fase: procesamiento y análisis estadístico / cualitativo.", orden: 21, es_subfase: true, padre_id: "seed-fase-3-tesis", prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-tesis", nombre: "Fase 3B — Presentación de Resultados", descripcion: "Sub-fase: tablas, gráficos, hallazgos principales.", orden: 22, es_subfase: true, padre_id: "seed-fase-3-tesis", prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-tesis", nombre: "Fase 4 — Discusión e Interpretación", descripcion: "Contraste de resultados con el marco teórico y otros estudios.", orden: 30, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-tesis", nombre: "Fase 5 — Conclusiones y Recomendaciones", descripcion: "Síntesis de hallazgos, respuesta a objetivos, recomendaciones.", orden: 40, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-tesis", nombre: "Bibliografía y Anexos", descripcion: "Referencias en formato APA 7 y material complementario.", orden: 50, es_subfase: false, prompt_borrador: "", prompt_final: "" },
];

const SEED_FASES_MONO: Omit<FaseTipoProyecto, "id">[] = [
  { tipo_proyecto_id: "tipo-monografia", nombre: "Planteamiento del Tema", descripcion: "Introducción, antecedentes y formulación del problema.", orden: 0, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-monografia", nombre: "Capítulo I — Marco Referencial", descripcion: "Contexto institucional, legal y antecedentes.", orden: 10, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-monografia", nombre: "Capítulo II — Marco Teórico", descripcion: "Teorías, conceptos clave y estado del arte.", orden: 20, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-monografia", nombre: "Capítulos III-V — Desarrollo", descripcion: "Metodología, resultados y análisis.", orden: 30, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-monografia", nombre: "Revisión y Compilación", descripcion: "Evaluación de coherencia, resumen ejecutivo.", orden: 40, es_subfase: false, prompt_borrador: "", prompt_final: "" },
  { tipo_proyecto_id: "tipo-monografia", nombre: "Conclusiones y Bibliografía", descripcion: "Conclusiones finales, recomendaciones y referencias APA.", orden: 50, es_subfase: false, prompt_borrador: "", prompt_final: "" },
];

function ensureSeed(disk: ReturnType<typeof loadFromDisk>) {
  if (!disk.tiposProyecto) disk.tiposProyecto = [];
  if (!disk.fasesTipoProyecto) disk.fasesTipoProyecto = [];

  const now = new Date().toISOString();
  let changed = false;

  for (const seedTipo of SEED_TIPOS) {
    if (!disk.tiposProyecto.find(t => t.id === seedTipo.id)) {
      disk.tiposProyecto.push({ ...seedTipo, created_at: now });
      changed = true;
    }
  }

  // Seed fases for tesis
  const tesisFasesExist = disk.fasesTipoProyecto.some(f => f.tipo_proyecto_id === "tipo-tesis");
  if (!tesisFasesExist) {
    for (const f of SEED_FASES_TESIS) {
      disk.fasesTipoProyecto.push({ ...f, id: uid() });
    }
    changed = true;
  }

  // Seed fases for monografía
  const monoFasesExist = disk.fasesTipoProyecto.some(f => f.tipo_proyecto_id === "tipo-monografia");
  if (!monoFasesExist) {
    for (const f of SEED_FASES_MONO) {
      disk.fasesTipoProyecto.push({ ...f, id: uid() });
    }
    changed = true;
  }

  if (changed) saveToDisk(disk);
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipoId = searchParams.get("tipo_id");

  const disk = loadFromDisk();
  ensureSeed(disk);

  const tipos = (disk.tiposProyecto ?? []);
  const fases = (disk.fasesTipoProyecto ?? []);

  if (tipoId) {
    // Return a single tipo with its phases
    const tipo = tipos.find(t => t.id === tipoId);
    if (!tipo) return NextResponse.json({ error: "Tipo no encontrado" }, { status: 404 });
    const fasesDelTipo = fases
      .filter(f => f.tipo_proyecto_id === tipoId)
      .sort((a, b) => a.orden - b.orden);
    return NextResponse.json({ tipo, fases: fasesDelTipo });
  }

  // List all tipos with phase counts
  const tiposConFases = tipos.map(t => ({
    ...t,
    fases_count: fases.filter(f => f.tipo_proyecto_id === t.id).length,
    fases: fases.filter(f => f.tipo_proyecto_id === t.id).sort((a, b) => a.orden - b.orden),
  }));

  return NextResponse.json({ tipos: tiposConFases });
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      action: "create_tipo" | "update_tipo" | "create_fase" | "update_fase";
      [key: string]: unknown;
    };

    const disk = loadFromDisk();
    if (!disk.tiposProyecto) disk.tiposProyecto = [];
    if (!disk.fasesTipoProyecto) disk.fasesTipoProyecto = [];

    // ── Tipo ──────────────────────────────────────────────────────────────────
    if (body.action === "create_tipo") {
      const nombre = (body.nombre as string)?.trim();
      if (!nombre) return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
      const nuevo: TipoProyecto = {
        id: uid(),
        nombre,
        descripcion: (body.descripcion as string | undefined) ?? "",
        icon: (body.icon as string | undefined) ?? "📄",
        activo: true,
        created_at: new Date().toISOString(),
      };
      disk.tiposProyecto.push(nuevo);
      saveToDisk(disk);
      return NextResponse.json({ tipo: nuevo }, { status: 201 });
    }

    if (body.action === "update_tipo") {
      const id = body.id as string;
      const idx = disk.tiposProyecto.findIndex(t => t.id === id);
      if (idx === -1) return NextResponse.json({ error: "Tipo no encontrado" }, { status: 404 });
      disk.tiposProyecto[idx] = {
        ...disk.tiposProyecto[idx],
        nombre: (body.nombre as string)?.trim() ?? disk.tiposProyecto[idx].nombre,
        descripcion: (body.descripcion as string | undefined) ?? disk.tiposProyecto[idx].descripcion,
        icon: (body.icon as string | undefined) ?? disk.tiposProyecto[idx].icon,
        activo: (body.activo as boolean | undefined) ?? disk.tiposProyecto[idx].activo,
      };
      saveToDisk(disk);
      return NextResponse.json({ tipo: disk.tiposProyecto[idx] });
    }

    // ── Fase ──────────────────────────────────────────────────────────────────
    if (body.action === "create_fase") {
      const tipo_proyecto_id = body.tipo_proyecto_id as string;
      const nombre = (body.nombre as string)?.trim();
      if (!tipo_proyecto_id || !nombre) {
        return NextResponse.json({ error: "tipo_proyecto_id y nombre son requeridos" }, { status: 400 });
      }
      const existentes = disk.fasesTipoProyecto.filter(f => f.tipo_proyecto_id === tipo_proyecto_id);
      const maxOrden = existentes.length > 0 ? Math.max(...existentes.map(f => f.orden)) : -10;
      const nueva: FaseTipoProyecto = {
        id: uid(),
        tipo_proyecto_id,
        nombre,
        descripcion: (body.descripcion as string | undefined) ?? "",
        orden: (body.orden as number | undefined) ?? maxOrden + 10,
        prompt_borrador: (body.prompt_borrador as string | undefined) ?? "",
        prompt_final: (body.prompt_final as string | undefined) ?? "",
        es_subfase: (body.es_subfase as boolean | undefined) ?? false,
        padre_id: (body.padre_id as string | undefined) ?? undefined,
      };
      disk.fasesTipoProyecto.push(nueva);
      saveToDisk(disk);
      return NextResponse.json({ fase: nueva }, { status: 201 });
    }

    if (body.action === "update_fase") {
      const id = body.id as string;
      const idx = disk.fasesTipoProyecto.findIndex(f => f.id === id);
      if (idx === -1) return NextResponse.json({ error: "Fase no encontrada" }, { status: 404 });
      const f = disk.fasesTipoProyecto[idx];
      disk.fasesTipoProyecto[idx] = {
        ...f,
        nombre: (body.nombre as string)?.trim() ?? f.nombre,
        descripcion: (body.descripcion as string | undefined) ?? f.descripcion,
        orden: (body.orden as number | undefined) ?? f.orden,
        prompt_borrador: (body.prompt_borrador as string | undefined) ?? f.prompt_borrador,
        prompt_final: (body.prompt_final as string | undefined) ?? f.prompt_final,
        es_subfase: (body.es_subfase as boolean | undefined) ?? f.es_subfase,
        padre_id: (body.padre_id as string | undefined) ?? f.padre_id,
      };
      saveToDisk(disk);
      return NextResponse.json({ fase: disk.fasesTipoProyecto[idx] });
    }

    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  try {
    const body = await req.json() as { action: "delete_tipo" | "delete_fase"; id: string };
    if (!body.id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

    const disk = loadFromDisk();

    if (body.action === "delete_tipo") {
      const isSeeded = body.id === "tipo-tesis" || body.id === "tipo-monografia";
      if (isSeeded) return NextResponse.json({ error: "Los tipos predefinidos no se pueden eliminar." }, { status: 400 });
      disk.tiposProyecto = (disk.tiposProyecto ?? []).filter(t => t.id !== body.id);
      disk.fasesTipoProyecto = (disk.fasesTipoProyecto ?? []).filter(f => f.tipo_proyecto_id !== body.id);
      saveToDisk(disk);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete_fase") {
      disk.fasesTipoProyecto = (disk.fasesTipoProyecto ?? []).filter(f => f.id !== body.id);
      saveToDisk(disk);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
