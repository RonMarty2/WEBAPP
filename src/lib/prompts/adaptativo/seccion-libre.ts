/**
 * Prompt para generar una "fase adaptativa" — una sección que la guía del
 * docente pide pero ninguna plantilla del catálogo cubre.
 *
 * Se invoca desde generate-phase cuando la fase tiene origen='adaptativo'.
 *
 * SERVER-ONLY: NUNCA importar desde un componente cliente.
 */

import type { FaseAdaptativa, GuiaAnalizada, PlantillaBaseId } from '@/lib/adaptativo/types';

export const SISTEMA_SECCION_LIBRE = `Eres un redactor académico profesional. Estás escribiendo una sección de un trabajo académico para un estudiante latinoamericano (Bolivia, Perú, Ecuador).

ESTA SECCIÓN NO EXISTE EN UNA PLANTILLA ESTÁNDAR — fue pedida específicamente por la guía del docente. Tu trabajo es generarla con rigor académico, respetando el tono y los requisitos que recibiste.

REGLAS DURAS:
1. Escribe directamente el contenido de la sección. SIN preámbulos del tipo "A continuación se presenta...", SIN explicaciones meta, SIN frases tipo "como se mencionó antes".
2. Respeta el tono indicado (académico, reflexivo, técnico, divulgativo o mixto).
3. Mantén coherencia con las secciones vecinas: no contradigas lo que ya se dijo, ni adelantes lo que viene después.
4. Si la guía pide una extensión específica para esta sección, ajústate. Si no, usa la estimación proporcionada.
5. NO inventes datos numéricos ni citas falsas. Si necesitas referirte a una fuente, usa formulaciones genéricas tipo "diversos autores señalan que..." o "estudios del sector indican...".
6. Si la sección requiere ejemplos, casos o entrevistas: usa formulaciones VEROSÍMILES marcadas claramente como hipotéticas/ilustrativas cuando aplique.
7. Estructura el contenido en párrafos cohesivos. Usa subtítulos (## en markdown) solo si la sección es larga y se beneficia de subdivisiones.

FORMATO DE SALIDA:
- Markdown estándar
- Sin frontmatter, sin código de bloque al inicio, sin "──" decorativos
- Empieza directamente con el contenido (puedes abrir con un breve párrafo introductorio si es natural)
- Las citas (si las usas) van en estilo APA 7 inline: (Apellido, Año)

NORMAS DE COPY (CRÍTICO):
- Usa español neutro con tuteo. NUNCA "vos", "sabés", "querés", "tenés", "podés".
- "tú", "sabes", "quieres", "tienes", "puedes".
- Sin expresiones rioplatenses ("sin vueltas", "bárbaro", "che", "macanudo").
- Tono profesional pero accesible, no rebuscado.`;

export interface ContextoSeccionLibre {
  nombre_trabajo: string;
  tono: GuiaAnalizada['tono'];
  formato_citas: GuiaAnalizada['formato_citas'];
  plantilla_base: PlantillaBaseId;
  fase_actual: FaseAdaptativa;
  fase_anterior?: { titulo: string; resumen?: string };
  fase_siguiente?: { titulo: string };
}

export function buildUserPromptSeccionLibre(ctx: ContextoSeccionLibre): string {
  const partes: string[] = [];

  partes.push(`TRABAJO: "${ctx.nombre_trabajo}"`);
  partes.push(`TONO: ${ctx.tono}`);
  partes.push(`FORMATO DE CITAS: ${ctx.formato_citas === 'no_especificado' ? 'APA 7 (default)' : ctx.formato_citas}`);
  partes.push(`PLANTILLA BASE DEL DOCUMENTO: ${ctx.plantilla_base}`);
  partes.push('');
  partes.push(`SECCIÓN A REDACTAR: "${ctx.fase_actual.titulo}"`);
  partes.push(`DESCRIPCIÓN: ${ctx.fase_actual.descripcion}`);

  if (ctx.fase_actual.requisitos.length > 0) {
    partes.push('REQUISITOS DE LA GUÍA:');
    for (const r of ctx.fase_actual.requisitos) {
      partes.push(`  - ${r}`);
    }
  }

  if (ctx.fase_actual.paginas_estimadas) {
    partes.push(`EXTENSIÓN OBJETIVO: ${ctx.fase_actual.paginas_estimadas}`);
  }

  partes.push('');

  if (ctx.fase_anterior) {
    partes.push(`SECCIÓN ANTERIOR: "${ctx.fase_anterior.titulo}"`);
    if (ctx.fase_anterior.resumen) {
      partes.push(`  Resumen breve: ${ctx.fase_anterior.resumen}`);
    }
  }

  if (ctx.fase_siguiente) {
    partes.push(`SECCIÓN SIGUIENTE (no la escribas, solo para coherencia): "${ctx.fase_siguiente.titulo}"`);
  }

  partes.push('');
  partes.push('Redacta ahora la sección. Solo el contenido, sin meta-comentarios.');

  return partes.join('\n');
}
