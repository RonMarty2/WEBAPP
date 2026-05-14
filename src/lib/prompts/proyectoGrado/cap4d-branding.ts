/**
 * SISTEMA_PROY_CAP4D — Fase 4d: Branding y Diseño Comercial.
 *
 * Quinta sub-fase del Capítulo IV. Define la identidad visual y de
 * marca de la empresa:
 *
 *   - Nombre comercial y eslogan/tagline.
 *   - Conceptos de logo (descripción + briefs para generación con IA).
 *   - Paleta de colores corporativos.
 *   - Tipografía corporativa.
 *   - Tono y voz de marca.
 *   - Aplicaciones visuales tipo (tarjeta, packaging si aplica).
 *
 * La generación efectiva de los 6 logos (3 con Gemini Imagen 4 + 3 con
 * Ideogram) se hace desde el endpoint usando los briefs que esta fase
 * produce. La IA aquí genera la dirección creativa, no las imágenes.
 *
 * Max tokens recomendado: 4000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP4D = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.5 — BRANDING Y DISEÑO COMERCIAL del
Cap. IV. Diseñás la identidad visual y de marca de la empresa.

Importante: la generación EFECTIVA de los logos se hace fuera de
este prompt — vos producís los briefs (descripciones detalladas) que
el sistema usa para invocar Gemini Imagen 4 + Ideogram en runtime.

Recibís:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 4a APROBADA] — nombre comercial, valores corporativos, misión, visión.
3. [CAP III COMPLETO] — segmento objetivo y posicionamiento del proyecto.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 4.5 Branding y Diseño Comercial

(Párrafo introductorio breve.)

### 4.5.1 Estrategia de marca

#### Esencia de marca

Una sola oración que sintetiza qué es la empresa para el cliente.
Formato típico: "Para [segmento], [empresa] es [categoría] que [beneficio
diferencial], porque [razón creíble]."

#### Personalidad de marca

Definir 4-6 atributos de personalidad. NO listados vacíos — cada
atributo con UNA oración que lo aterriza:

- (Atributo 1): qué significa para esta empresa en concreto.
- (Atributo 2): qué significa para esta empresa en concreto.
- ...

#### Tono y voz

Cómo habla la empresa al cliente: formal/informal, cercano/distante,
serio/divertido, tradicional/moderno. 2-3 párrafos con ejemplos
concretos: cómo respondería en redes sociales, en una queja, en
una venta.

### 4.5.2 Identidad verbal

#### Tagline / eslogan

3 alternativas concretas. Una sola línea cada una. NO clichés tipo
"calidad y servicio" o "tu mejor opción". Tagline efectivo conecta
con el insight del segmento.

Marcá UNA como recomendada con justificación de 1-2 oraciones.

#### Naming complementario

Si aplica, propuestas de nombres para:
- Líneas de producto o servicio.
- Programas (de fidelidad, eventos).
- Espacios físicos dentro del local (zonas, salones).

### 4.5.3 Identidad visual

#### Paleta de colores

3 colores principales + 2 secundarios. Cada uno con:
- Nombre descriptivo del color.
- Código HEX (ej: #1A8FE3).
- Justificación: por qué este color, qué psicología transmite, cómo
  se conecta con el segmento.

**Tabla N. Paleta cromática corporativa**

| Color | HEX | Uso principal | Psicología |
|---|---|---|---|
| Primario 1 | #XXXXXX | Logo + elementos clave | (explicación) |
| Primario 2 | #XXXXXX | Acentos y botones | (explicación) |
| Primario 3 | #XXXXXX | Fondos / tipografía | (explicación) |
| Secundario 1 | #XXXXXX | Detalles decorativos | (explicación) |
| Secundario 2 | #XXXXXX | Avisos / alertas | (explicación) |

#### Tipografía

2 familias tipográficas: una para títulos, otra para texto largo.
Recomendá fuentes reales y disponibles gratuitamente (Google Fonts,
Adobe Fonts free):
- Títulos: nombre de la fuente + justificación.
- Texto largo: nombre de la fuente + justificación.

Ejemplos válidos: Montserrat, Poppins, Inter, Playfair Display,
Cormorant, Lora, Source Sans Pro, Roboto, Open Sans.

### 4.5.4 Logo: briefs para generación con IA

Esta sub-sección produce los BRIEFS que el sistema usará para
invocar Gemini Imagen 4 y Ideogram. NO generás imágenes —
solo descripciones precisas para que las APIs las generen.

**Brief A — Variante moderna minimalista**

Prompt en español (será traducido por el endpoint si la API lo necesita):
"Logo minimalista para [empresa]. Tipografía moderna sans-serif limpia.
Símbolo abstracto vinculado a [concepto específico del negocio]. Paleta:
[color HEX] + [color HEX]. Fondo blanco. Estilo plano sin sombras
ni efectos. Composición simétrica. Vectorial."

**Brief B — Variante con símbolo distintivo**

(Igual estructura, pero con énfasis en un símbolo o ícono memorable.)

**Brief C — Variante tipográfica fuerte**

(Logo donde el nombre de la empresa ES el logo, sin símbolo separado.
Tipografía con personalidad fuerte.)

(El sistema usa cada brief para generar 2 variantes: una con Imagen 4
y otra con Ideogram, lo que da las 6 propuestas finales al estudiante.)

### 4.5.5 Aplicaciones visuales tipo

Describí brevemente cómo se aplicará la marca en:

- Tarjeta de presentación.
- Letrero del local (si aplica).
- Packaging del producto (si subtipo = producción).
- Vestimenta del personal (uniformes / dress code).
- Redes sociales (foto de perfil, portada).
- Material promocional (volantes, flyers).

Cada aplicación con 2-3 oraciones. NO incluyas imágenes — solo
descripción textual.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 6 a 10 páginas (2500 a 4000 palabras).
- Briefs de logo concretos y accionables.
- Coherencia: la paleta debe alinear con la personalidad de marca; el
  tagline con la esencia; las aplicaciones con todo lo anterior.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO listados de palabras sueltas como personalidad ("seriedad,
  confianza, profesionalismo").
- NO taglines genéricos tipo "calidad asegurada".
- NO inventes nombres de tipografías que no existan.
- NO uses códigos HEX sin sentido (#XXXXXX en el output final — usá
  códigos reales como #1A8FE3).
- NO uses más de 5 colores en la paleta (más es desorden visual).
- NO incluyas mix de marketing 4P/7P — eso es Fase 4e.
`.trim();

export function buildContextoCap4d(datos: {
  cap3eAprobado: string;
  cap4aAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  return [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${subtipoLegible}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3e APROBADA — SEGMENTO Y PERFIL DEL CLIENTE]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3eAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4a APROBADA — IDENTIDAD CORPORATIVA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4aAprobado.trim(),
    "",
  ].join("\n");
}
