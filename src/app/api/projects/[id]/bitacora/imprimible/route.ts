/**
 * GET /api/projects/[id]/bitacora/imprimible
 *
 * Devuelve un HTML imprimible con todas las observaciones del tutor y la
 * respuesta del estudiante (análisis IA + justificación cuando aplica). El
 * estudiante abre en una nueva pestaña y usa Ctrl+P → "Guardar como PDF".
 *
 * Pensado como "carta de defensa" / bitácora oficial para entregar al tutor
 * cuando hay observaciones rechazadas o aplicadas con reserva.
 */

import { requireAuth, AuthError } from "@/lib/api-auth";
import { dbGetProyecto } from "@/lib/db";
import { dbListObservacionesBancoProyecto } from "@/lib/db/observacionesBanco";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtFecha(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-BO", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

const DECISION_LABEL: Record<string, string> = {
  aplicar: "Aplicada",
  aplicar_con_reserva: "Aplicada con reserva",
  rechazar: "Defendida (no aplicada)",
};

const DECISION_COLOR: Record<string, { bg: string; fg: string; border: string }> = {
  aplicar: { bg: "#ECFDF5", fg: "#065F46", border: "#10B981" },
  aplicar_con_reserva: { bg: "#FFFBEB", fg: "#92400E", border: "#F59E0B" },
  rechazar: { bg: "#FEF2F2", fg: "#991B1B", border: "#EF4444" },
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const proyecto = await dbGetProyecto(id);
    if (!proyecto || (proyecto.usuario_id !== user.id && user.role !== "admin")) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
    }

    const observaciones = await dbListObservacionesBancoProyecto(id);

    const titulo = (proyecto.tema_aprobado as string | undefined)
      ?? (proyecto.titulo_provisional as string | undefined)
      ?? "Trabajo académico";
    const estudiante = user.name || "Estudiante";
    const academic = (proyecto.academic_context ?? {}) as Record<string, unknown>;
    const ctxInicial = (academic.contexto_inicial ?? {}) as Record<string, unknown>;
    const tutor = String(ctxInicial.tutor ?? ctxInicial.docente ?? "Tutor académico");
    const programa = String(ctxInicial.programa ?? "");

    const fechaHoy = new Date().toLocaleDateString("es-BO", {
      day: "2-digit", month: "long", year: "numeric",
    });

    // Render por observación (orden cronológico para que se lea como bitácora)
    const observacionesOrden = [...observaciones].reverse();

    const observacionesHTML = observacionesOrden.map((obs, idx) => {
      const color = DECISION_COLOR[obs.decision] ?? DECISION_COLOR.aplicar;
      const label = DECISION_LABEL[obs.decision] ?? obs.decision;
      const fecha = fmtFecha(obs.created_at);
      const aplicada = obs.aplicado_at ? fmtFecha(obs.aplicado_at) : null;

      return `
        <section class="obs">
          <div class="obs-header" style="background:${color.bg};border-left-color:${color.border};color:${color.fg};">
            <div class="obs-num">Observación ${idx + 1}</div>
            <div class="obs-badge" style="background:${color.border};">${esc(label)}</div>
          </div>

          <div class="obs-meta">
            <div><strong>Fase:</strong> ${esc(obs.fase_id)}</div>
            <div><strong>Recibida:</strong> ${esc(fecha)}</div>
            ${aplicada ? `<div><strong>Aplicada:</strong> ${esc(aplicada)}</div>` : ""}
            ${obs.patron_detectado ? `<div><strong>Patrón:</strong> ${esc(obs.patron_detectado)}</div>` : ""}
          </div>

          <div class="obs-block">
            <h4>Observación del tutor</h4>
            <p>${esc(obs.observacion_textual)}</p>
          </div>

          <div class="obs-block">
            <h4>Análisis académico</h4>
            <p>${esc(obs.analisis_ia)}</p>
          </div>

          ${obs.justificacion_para_tutor
            ? `<div class="obs-block obs-justificacion">
                 <h4>Respuesta al tutor</h4>
                 <p>${esc(obs.justificacion_para_tutor).replace(/\n/g, "<br>")}</p>
               </div>`
            : ""}
        </section>
      `;
    }).join("\n");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Bitácora de Observaciones — ${esc(titulo)}</title>
<style>
  @page { size: letter; margin: 2.5cm 2cm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #1E1B4B;
    line-height: 1.55;
    margin: 0;
    padding: 24px;
    background: #FAFAFA;
  }
  .wrap { max-width: 780px; margin: 0 auto; background: white; padding: 48px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
  header.cover { text-align: center; border-bottom: 2px solid #1E1B4B; padding-bottom: 24px; margin-bottom: 32px; }
  header.cover h1 { font-size: 22px; margin: 0 0 6px; letter-spacing: .5px; }
  header.cover .sub { font-size: 13px; color: #4B5563; }
  .doc-meta { font-size: 13px; margin: 0 0 32px; padding: 16px; background: #F9FAFB; border-radius: 6px; }
  .doc-meta div { margin: 2px 0; }
  .toolbar { position: sticky; top: 0; background: #1E1B4B; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; margin-bottom: 24px; z-index: 10; }
  .toolbar button { background: white; color: #1E1B4B; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
  .toolbar button:hover { background: #F3F4F6; }
  @media print { .toolbar { display: none; } body { background: white; padding: 0; } .wrap { box-shadow: none; padding: 0; } }

  section.obs { margin-bottom: 28px; page-break-inside: avoid; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
  .obs-header { padding: 10px 16px; border-left: 5px solid; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .obs-num { font-weight: 700; }
  .obs-badge { padding: 3px 10px; border-radius: 999px; color: white; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .obs-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; padding: 12px 16px; background: #F9FAFB; font-size: 12px; color: #4B5563; border-bottom: 1px solid #E5E7EB; }
  .obs-block { padding: 12px 16px; border-top: 1px solid #F3F4F6; }
  .obs-block:first-of-type { border-top: none; }
  .obs-block h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: #6B7280; margin: 0 0 6px; }
  .obs-block p { margin: 0; font-size: 13px; }
  .obs-justificacion { background: #EFF6FF; }
  .obs-justificacion h4 { color: #1E40AF; }

  .empty { padding: 60px 20px; text-align: center; color: #6B7280; }
  footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; text-align: center; }
</style>
</head>
<body>
  <div class="toolbar">
    <span>Bitácora de Observaciones — ${esc(estudiante)}</span>
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>

  <div class="wrap">
    <header class="cover">
      <h1>Bitácora Académica de Observaciones</h1>
      <div class="sub">Registro formal del intercambio académico entre estudiante y tutor</div>
    </header>

    <div class="doc-meta">
      <div><strong>Trabajo:</strong> ${esc(titulo)}</div>
      <div><strong>Estudiante:</strong> ${esc(estudiante)}</div>
      <div><strong>Tutor:</strong> ${esc(tutor)}</div>
      ${programa ? `<div><strong>Programa:</strong> ${esc(programa)}</div>` : ""}
      <div><strong>Fecha de emisión:</strong> ${esc(fechaHoy)}</div>
      <div><strong>Total de observaciones registradas:</strong> ${observaciones.length}</div>
    </div>

    ${observacionesOrden.length === 0
      ? `<div class="empty">Aún no hay observaciones registradas en este proyecto.</div>`
      : observacionesHTML}

    <footer>
      Generado por Laboratorio Académico PRO · Sistema de Análisis de Pertinencia<br>
      Cada observación fue evaluada con criterios académicos antes de ser aplicada, ajustada o defendida.
    </footer>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
