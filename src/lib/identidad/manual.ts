/**
 * Exportador del MANUAL DE MARCA en Markdown.
 *
 * Produce un documento listo para descargar (.md) que el alumno puede
 * imprimir/convertir a PDF. Incluye todas las decisiones de identidad:
 *   - Brief (esencia, valores, personalidad)
 *   - Paleta (con códigos hex y aplicación de cada color)
 *   - Tipografía (con import URL de Google Fonts)
 *   - Logo (concepto + URL del principal)
 *   - Lista de mockups
 *
 * Cero llamadas a IA. Solo formato.
 */

import type { IdentidadVisual } from "@/types/identidad";

export function exportarManualDeMarca(id: IdentidadVisual): string {
  const partes: string[] = [];

  const nombre = id.brief?.nombre || "Marca sin nombre";

  partes.push(`# Manual de Marca — ${nombre}\n`);
  partes.push(`> Documento generado el ${new Date(id.actualizado_en).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })}.\n`);
  partes.push(`> Identidad creada en Laboratorio Académico PRO.\n`);
  partes.push("");

  // ─── Brief ──────────────────────────────────────────────
  partes.push("## 1. Esencia de Marca\n");
  if (id.brief?.esencia) partes.push(`**Esencia:** ${id.brief.esencia}\n`);
  if (id.brief?.sector) partes.push(`**Sector:** ${id.brief.sector}\n`);
  if (id.brief?.personalidad) partes.push(`**Personalidad:** ${id.brief.personalidad}\n`);
  if (id.brief?.publico_objetivo) partes.push(`**Público objetivo:** ${id.brief.publico_objetivo}\n`);

  if (id.brief?.valores && id.brief.valores.length > 0) {
    partes.push("\n**Valores fundamentales:**");
    for (const v of id.brief.valores) partes.push(`- ${v}`);
    partes.push("");
  }

  if (id.brief?.atributos && id.brief.atributos.length > 0) {
    partes.push("**Atributos clave:**");
    for (const a of id.brief.atributos) partes.push(`- ${a}`);
    partes.push("");
  }

  // ─── Paleta ─────────────────────────────────────────────
  partes.push("\n## 2. Paleta de Colores\n");
  if (id.paleta_esquema) {
    partes.push(`**Esquema cromático:** ${id.paleta_esquema}\n`);
  }
  if (id.paleta_justificacion) {
    partes.push(`${id.paleta_justificacion}\n`);
  }
  partes.push("");
  partes.push("| Rol | Color | Hex |");
  partes.push("|-----|-------|-----|");
  if (id.paleta_primario)     partes.push(`| Primario | ![](https://singlecolorimage.com/get/${id.paleta_primario.replace("#", "")}/64x32) | \`${id.paleta_primario}\` |`);
  if (id.paleta_secundario)   partes.push(`| Secundario | ![](https://singlecolorimage.com/get/${id.paleta_secundario.replace("#", "")}/64x32) | \`${id.paleta_secundario}\` |`);
  if (id.paleta_acento)       partes.push(`| Acento | ![](https://singlecolorimage.com/get/${id.paleta_acento.replace("#", "")}/64x32) | \`${id.paleta_acento}\` |`);
  if (id.paleta_neutro_claro) partes.push(`| Neutro claro | ![](https://singlecolorimage.com/get/${id.paleta_neutro_claro.replace("#", "")}/64x32) | \`${id.paleta_neutro_claro}\` |`);
  if (id.paleta_neutro_oscuro)partes.push(`| Neutro oscuro | ![](https://singlecolorimage.com/get/${id.paleta_neutro_oscuro.replace("#", "")}/64x32) | \`${id.paleta_neutro_oscuro}\` |`);

  partes.push("\n**Aplicación recomendada:**");
  partes.push("- **Primario:** elementos principales de marca, headers, CTAs.");
  partes.push("- **Secundario:** soporte visual, fondos de sección, badges.");
  partes.push("- **Acento:** llamados puntuales (notificaciones, links, hover).");
  partes.push("- **Neutros:** fondos generales y texto. El claro va detrás del contenido; el oscuro es el color de texto principal.");
  partes.push("");

  // ─── Tipografía ─────────────────────────────────────────
  partes.push("\n## 3. Tipografía\n");
  if (id.tipo_justificacion) {
    partes.push(`${id.tipo_justificacion}\n`);
  }
  if (id.tipo_principal_familia) {
    partes.push(`### Principal (titulares)\n`);
    partes.push(`**${id.tipo_principal_familia}** · peso ${id.tipo_principal_peso ?? "400"}\n`);
  }
  if (id.tipo_secundaria_familia) {
    partes.push(`### Secundaria (cuerpo)\n`);
    partes.push(`**${id.tipo_secundaria_familia}** · peso ${id.tipo_secundaria_peso ?? "400"}\n`);
  }
  if (id.tipo_principal_familia || id.tipo_secundaria_familia) {
    const familias = [id.tipo_principal_familia, id.tipo_secundaria_familia]
      .filter(Boolean) as string[];
    const familiasUnicas = Array.from(new Set(familias));
    const queryFamilias = familiasUnicas.map((f) => `family=${f.replace(/\s+/g, "+")}`).join("&");
    partes.push(`\n**Import (Google Fonts):**`);
    partes.push("```css");
    partes.push(`@import url('https://fonts.googleapis.com/css2?${queryFamilias}&display=swap');`);
    partes.push("```");
    partes.push("");
  }

  // ─── Logo ───────────────────────────────────────────────
  partes.push("\n## 4. Logo\n");
  if (id.logo_concepto) {
    partes.push(`**Concepto del logo:** ${id.logo_concepto}\n`);
  }
  if (id.logo_principal_url) {
    partes.push(`![Logo principal](${id.logo_principal_url})\n`);
  } else {
    partes.push("_(Aún no se ha elegido un logo principal.)_\n");
  }

  if (id.logo_alternativas && id.logo_alternativas.length > 0) {
    partes.push(`### Alternativas generadas (${id.logo_alternativas.length})\n`);
    for (let i = 0; i < id.logo_alternativas.length; i++) {
      const alt = id.logo_alternativas[i];
      partes.push(`**Alternativa ${i + 1}** · modelo: \`${alt.modelo}\` · generada: ${new Date(alt.generado_en).toLocaleString("es-BO")}\n`);
      partes.push(`![Alternativa ${i + 1}](${alt.url})\n`);
    }
  }

  // ─── Mockups ────────────────────────────────────────────
  if (id.mockups && id.mockups.length > 0) {
    partes.push(`\n## 5. Aplicaciones (Mockups)\n`);
    for (const m of id.mockups) {
      partes.push(`### ${m.descripcion}`);
      partes.push(`![${m.descripcion}](${m.url})\n`);
    }
  }

  // ─── Prohibidos ─────────────────────────────────────────
  if (id.brief?.prohibidos && id.brief.prohibidos.length > 0) {
    partes.push(`\n## 6. Lo que NO debe pasar\n`);
    for (const p of id.brief.prohibidos) partes.push(`- ${p}`);
    partes.push("");
  }

  // ─── Cierre ─────────────────────────────────────────────
  partes.push("\n---\n");
  partes.push(`*Manual de Marca de **${nombre}** generado con Laboratorio Académico PRO. Bolivia, ${new Date().getFullYear()}.*`);

  return partes.join("\n");
}
