/**
 * POST /api/projects/[id]/pdf-compilado/solicitar
 *   → estudiante marca solicitud (timestamp pdf_solicitado_at)
 *   Nota: por simplicidad mantenemos POST simple en esta misma ruta
 *   distinguiendo por `action` en el body.
 *
 * GET  /api/projects/[id]/pdf-compilado
 *   → estudiante descarga el PDF (devuelve base64 + filename + bytes)
 *
 * POST /api/projects/[id]/pdf-compilado  (con FormData)
 *   → admin sube el PDF compilado (multipart/form-data, field "pdf")
 *
 * GET  /api/projects/[id]/pdf-compilado?meta=1
 *   → devuelve solo metadatos (estado solicitud/compilación) sin el base64
 */

import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto, dbUpdateProyecto } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

interface ProyectoConPdf {
  usuario_id?: string;
  pdf_solicitado_at?: string | null;
  pdf_compilado_at?: string | null;
  pdf_compilado_base64?: string | null;
  pdf_compilado_filename?: string | null;
  pdf_compilado_bytes?: number | null;
  pdf_compilado_por?: string | null;
  tema_aprobado?: string | null;
  titulo_provisional?: string | null;
}

function slugify(s: string): string {
  return (s || "monografia")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "monografia";
}

/** GET → descarga PDF (default) o metadata si ?meta=1 */
export async function GET(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const url = new URL(req.url);
    const onlyMeta = url.searchParams.get("meta") === "1";

    const proyectoRaw = await dbGetProyecto(id);
    if (!proyectoRaw) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const proyecto = proyectoRaw as unknown as ProyectoConPdf;
    if (proyecto.usuario_id !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Sin acceso al proyecto" }, { status: 403 });
    }

    if (onlyMeta) {
      // Solo metadatos (no incluye el base64 pesado)
      return NextResponse.json({
        ok: true,
        estado: !proyecto.pdf_solicitado_at
          ? "no_solicitado"
          : !proyecto.pdf_compilado_at
            ? "en_preparacion"
            : "listo",
        pdf_solicitado_at: proyecto.pdf_solicitado_at ?? null,
        pdf_compilado_at: proyecto.pdf_compilado_at ?? null,
        pdf_compilado_filename: proyecto.pdf_compilado_filename ?? null,
        pdf_compilado_bytes: proyecto.pdf_compilado_bytes ?? null,
      });
    }

    // Descarga real del PDF
    if (!proyecto.pdf_compilado_base64) {
      return NextResponse.json(
        { error: "El PDF aún no está disponible. Está siendo preparado." },
        { status: 404 },
      );
    }
    const titulo = proyecto.tema_aprobado ?? proyecto.titulo_provisional ?? "monografia";
    const filename = proyecto.pdf_compilado_filename || `${slugify(titulo)}.pdf`;
    const buffer = Buffer.from(proyecto.pdf_compilado_base64, "base64");

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** POST →
 *   - Estudiante: action=solicitar → marca pdf_solicitado_at
 *   - Admin: multipart con field "pdf" → guarda el PDF
 */
export async function POST(req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }
    const owner = (proyecto as unknown as ProyectoConPdf).usuario_id;
    if (owner !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") ?? "";

    // ── Caso A: admin sube PDF ────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      if (user.role !== "admin") {
        return NextResponse.json({ error: "Solo admin puede subir PDF" }, { status: 403 });
      }
      const form = await req.formData();
      const file = form.get("pdf");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Campo 'pdf' requerido (file)" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const magic = buffer.subarray(0, 5).toString("ascii");
      if (magic !== "%PDF-") {
        return NextResponse.json(
          { error: "El archivo subido no es un PDF válido (magic bytes incorrectos)." },
          { status: 400 },
        );
      }
      const base64 = buffer.toString("base64");

      await dbUpdateProyecto(id, {
        pdf_compilado_at: new Date().toISOString(),
        pdf_compilado_base64: base64,
        pdf_compilado_filename: file.name || "monografia.pdf",
        pdf_compilado_bytes: buffer.byteLength,
        pdf_compilado_por: user.email ?? user.name ?? user.id,
      } as never);

      return NextResponse.json({
        ok: true,
        bytes: buffer.byteLength,
        filename: file.name,
        compilado_at: new Date().toISOString(),
      });
    }

    // ── Caso B: estudiante solicita (action: "solicitar") ─────
    const body = (await req.json().catch(() => ({}))) as { action?: string };
    if (body.action === "solicitar") {
      // Si ya hay PDF compilado vigente, no permitir nueva solicitud (a menos
      // que el estudiante haya regenerado capítulos y el PDF haya quedado
      // desactualizado — por ahora siempre permitimos resetear la solicitud).
      await dbUpdateProyecto(id, {
        pdf_solicitado_at: new Date().toISOString(),
        // Al re-solicitar, invalidamos el PDF previo para forzar recompilación
        pdf_compilado_at: null,
        pdf_compilado_base64: null,
        pdf_compilado_filename: null,
        pdf_compilado_bytes: null,
      } as never);
      return NextResponse.json({ ok: true, solicitado_at: new Date().toISOString() });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
