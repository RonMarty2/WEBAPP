/**
 * GET /api/projects/[id]/cuadernillo/imprimible
 *
 * HTML imprimible con TODOS los cuadernillos del proyecto: una guía personal
 * completa que el estudiante puede imprimir o guardar como PDF (Ctrl+P).
 *
 * Diseño limpio, secciones por capítulo, código de colores por tipo de bloque.
 */

import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbListCuadernillosByProyecto } from "@/lib/db/cuadernillos";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TIPO_ICON: Record<string, string> = {
  foto: "📷",
  diagrama: "📐",
  dato_primario: "📊",
  documento_institucional: "📄",
  encuesta: "📋",
  entrevista: "🎤",
  mapa: "🗺️",
  video: "🎥",
  otro: "🔧",
};

const IMPACTO_COLOR: Record<string, string> = {
  alto: "#dc2626",
  medio: "#d97706",
  bajo: "#65a30d",
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const cuadernillos = await dbListCuadernillosByProyecto(id);

    const titulo = (proyecto.tema_aprobado as string | undefined)
      ?? (proyecto.titulo_provisional as string | undefined)
      ?? "Trabajo académico";
    const estudiante = user.name || "Estudiante";
    const fechaHoy = new Date().toLocaleDateString("es-BO", {
      day: "2-digit", month: "long", year: "numeric",
    });

    const seccionesHTML = cuadernillos.map((c) => {
      const limitaciones = (c.limitaciones_ia ?? []).map((l) => `
        <div class="card card-warning">
          <div class="card-head">${esc(TIPO_ICON[l.tipo] ?? "🔧")} <strong>${esc(l.tipo.toUpperCase().replace(/_/g, " "))}</strong></div>
          <div><strong>Qué falta:</strong> ${esc(l.descripcion)}</div>
          <div><strong>Dónde insertarlo:</strong> ${esc(l.ubicacion_sugerida)}</div>
          <div><strong>Cómo obtenerlo:</strong> ${esc(l.como_obtenerlo)}</div>
        </div>
      `).join("");

      const sugerencias = (c.sugerencias_fortalecimiento ?? []).map((s) => {
        const color = IMPACTO_COLOR[s.impacto] ?? "#666";
        return `
          <div class="row">
            <span class="badge" style="background:${color}">${esc(s.impacto)}</span>
            <span class="row-area">${esc(s.area)}</span>
            <span class="row-text">${esc(s.que_hacer)}</span>
            <span class="row-time">⏱ ${esc(s.tiempo_estimado)}</span>
          </div>
        `;
      }).join("");

      const datos = (c.datos_a_buscar ?? []).map((d) => `
        <div class="card card-info">
          <div><strong>🔎 Qué:</strong> ${esc(d.que)}</div>
          <div><strong>📍 Dónde:</strong> ${esc(d.donde)}</div>
          <div><strong>🎯 Para qué:</strong> ${esc(d.para_que)}</div>
        </div>
      `).join("");

      const preguntas = (c.preguntas_tutor_probables ?? []).map((p, i) => `
        <div class="card card-question">
          <div class="q-num">Pregunta ${i + 1}</div>
          <div class="q-text">${esc(p.pregunta)}</div>
          <div class="q-resp"><strong>Respuesta sugerida:</strong><br>${esc(p.respuesta_sugerida).replace(/\n/g, "<br>")}</div>
          ${p.evidencia_a_tener_lista ? `<div class="q-ev"><strong>Tener a mano:</strong> ${esc(p.evidencia_a_tener_lista)}</div>` : ""}
        </div>
      `).join("");

      const errores = (c.errores_comunes_evitar ?? []).map(e => `<li>${esc(e)}</li>`).join("");
      const tips = (c.tips_presentacion_oral ?? []).map(t => `<li>${esc(t)}</li>`).join("");

      return `
        <section class="capitulo">
          <h2>${esc(c.fase_label)}</h2>
          <p class="resumen">${esc(c.resumen_capitulo)}</p>

          ${limitaciones ? `
            <h3>⚠️ Lo que la IA NO pudo completar — TU TURNO</h3>
            ${limitaciones}
          ` : ""}

          ${sugerencias ? `
            <h3>💪 Sugerencias para fortalecer este capítulo</h3>
            <div class="rows">${sugerencias}</div>
          ` : ""}

          ${datos ? `
            <h3>🔍 Datos públicos que conviene buscar</h3>
            ${datos}
          ` : ""}

          ${preguntas ? `
            <h3>❓ Preguntas probables de tu tutor</h3>
            ${preguntas}
          ` : ""}

          ${errores ? `
            <h3>🚫 Errores comunes que tu tutor podría señalar</h3>
            <ul>${errores}</ul>
          ` : ""}

          ${tips ? `
            <h3>🎤 Tips para tu defensa oral</h3>
            <ul>${tips}</ul>
          ` : ""}
        </section>
      `;
    }).join("\n");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Cuadernillo Personal — ${esc(titulo)}</title>
<style>
  @page { size: letter; margin: 2.2cm 1.8cm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1E1B4B; line-height: 1.5; margin: 0; padding: 20px; background: #FAFAFA;
  }
  .wrap { max-width: 820px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
  .toolbar { position: sticky; top: 0; background: #1E1B4B; color: white; padding: 10px 18px;
             display: flex; justify-content: space-between; align-items: center;
             border-radius: 8px; margin-bottom: 24px; z-index: 10; }
  .toolbar button { background: white; color: #1E1B4B; border: none; padding: 8px 16px;
                    border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
  .toolbar button:hover { background: #F3F4F6; }
  @media print {
    .toolbar { display: none; }
    body { background: white; padding: 0; }
    .wrap { box-shadow: none; padding: 0; }
    .capitulo { page-break-before: always; }
    .capitulo:first-of-type { page-break-before: avoid; }
  }
  header.cover { text-align: center; border-bottom: 3px solid #6366F1; padding-bottom: 20px; margin-bottom: 28px; }
  header.cover h1 { font-size: 24px; margin: 0 0 6px; color: #1E1B4B; }
  header.cover .sub { font-size: 13px; color: #4B5563; font-style: italic; }
  .doc-meta { font-size: 13px; margin: 0 0 28px; padding: 14px;
              background: #EEF2FF; border-radius: 8px; border-left: 4px solid #6366F1; }
  .doc-meta div { margin: 2px 0; }

  section.capitulo { margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px dashed #E5E7EB; }
  section.capitulo:last-child { border-bottom: none; }
  section.capitulo h2 { font-size: 18px; color: #1E1B4B; margin: 0 0 8px; padding-bottom: 6px; border-bottom: 2px solid #6366F1; }
  section.capitulo .resumen { font-size: 12.5px; color: #4B5563; font-style: italic; margin: 0 0 20px; }
  section.capitulo h3 { font-size: 14px; color: #1E1B4B; margin: 22px 0 10px; }

  .card { padding: 12px 14px; margin-bottom: 10px; border-radius: 8px; font-size: 12.5px; line-height: 1.55; }
  .card div { margin: 3px 0; }
  .card-head { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #6B7280; margin-bottom: 6px !important; }
  .card-warning { background: #FFFBEB; border-left: 4px solid #F59E0B; }
  .card-info { background: #EFF6FF; border-left: 4px solid #3B82F6; }
  .card-question { background: #F0FDF4; border-left: 4px solid #10B981; }

  .q-num { font-size: 10px; text-transform: uppercase; color: #065F46; font-weight: 700; letter-spacing: .5px; margin-bottom: 4px; }
  .q-text { font-weight: 700; color: #1E1B4B; margin-bottom: 8px; font-size: 13px; }
  .q-resp { padding: 8px 10px; background: white; border-radius: 6px; font-size: 12px; margin-bottom: 6px; }
  .q-ev { font-size: 11.5px; color: #4B5563; padding: 4px 0; }

  .rows { display: flex; flex-direction: column; gap: 6px; }
  .row { display: grid; grid-template-columns: 60px 110px 1fr 80px; gap: 10px; align-items: center;
         padding: 8px 10px; background: #F9FAFB; border-radius: 6px; font-size: 12px; }
  .badge { color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; text-align: center; }
  .row-area { font-weight: 600; color: #4B5563; }
  .row-text { color: #1E1B4B; }
  .row-time { font-size: 11px; color: #6B7280; text-align: right; }

  ul { padding-left: 22px; margin: 6px 0; }
  ul li { font-size: 12.5px; color: #1E1B4B; margin: 4px 0; line-height: 1.5; }

  .empty { padding: 60px 20px; text-align: center; color: #6B7280; }

  footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;
           font-size: 11px; color: #6B7280; text-align: center; }
</style>
</head>
<body>
  <div class="toolbar">
    <span>📕 Cuadernillo Personal — ${esc(estudiante)}</span>
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>

  <div class="wrap">
    <header class="cover">
      <h1>📕 Tu Cuadernillo Personal</h1>
      <div class="sub">Hoja de ruta privada — Solo para ti, NO para tu tutor</div>
    </header>

    <div class="doc-meta">
      <div><strong>Trabajo:</strong> ${esc(titulo)}</div>
      <div><strong>Estudiante:</strong> ${esc(estudiante)}</div>
      <div><strong>Fecha de emisión:</strong> ${esc(fechaHoy)}</div>
      <div><strong>Capítulos con cuadernillo:</strong> ${cuadernillos.length}</div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid #C7D2FE;color:#4338CA;font-size:11.5px;font-style:italic;">
        Este documento contiene sugerencias personales, datos a buscar, preguntas
        probables del tutor y tips de defensa por capítulo. NO entregar al tutor.
      </div>
    </div>

    ${cuadernillos.length === 0
      ? `<div class="empty">Aún no hay cuadernillos generados. Generalos desde el workspace al aprobar cada capítulo.</div>`
      : seccionesHTML}

    <footer>
      Generado por Laboratorio Académico PRO · Cuadernillo Personal del Estudiante
    </footer>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
