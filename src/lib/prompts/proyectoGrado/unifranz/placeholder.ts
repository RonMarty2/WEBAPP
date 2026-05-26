/**
 * Prompt placeholder para fases UNIFRANZ que todavía no tienen su prompt
 * definitivo. SERVER-ONLY.
 *
 * Estrategia (decidida con el dueño del producto, mayo 2026):
 *   Durante la fase de desarrollo NO consumimos tokens de IA. El esquema
 *   (wizard + sidebar + workspace + export) queda armado, pero el contenido
 *   de las fases se rellena MANUALMENTE escribiendo directo en
 *   `.store/data.json` (project.phase_contents[phase_id]). Cuando el dueño
 *   conecte la API real, este placeholder se reemplaza por el megaprompt
 *   correspondiente sin tocar el resto del sistema.
 *
 * El placeholder instruye a la IA (en caso de que se llame por accidente) a
 * NO inventar contenido y devolver un aviso claro al estudiante.
 */

export function buildPlaceholderUnifranz(args: {
  modalidad: string;
  fase_label: string;
}): string {
  return `
=== FASE EN CONSTRUCCIÓN — UNIFRANZ / ${args.modalidad.toUpperCase()} ===

Esta fase ("${args.fase_label}") forma parte del esquema oficial de la
modalidad UNIFRANZ pero todavía NO tiene su megaprompt definitivo.

Si fuiste invocado por accidente, devuelve EXACTAMENTE el siguiente mensaje
al estudiante (sin agregar nada más):

"⚙️ Esta sección está reservada en el esquema UNIFRANZ pero todavía estamos
preparando su contenido. Vuelve pronto — no queremos entregarte texto de
relleno."

NO inventes contenido académico. NO escribas sobre el tema solicitado. NO
generes citas. NO produzcas texto que pueda confundirse con un borrador
real. Limítate al mensaje de arriba.
`.trim();
}
