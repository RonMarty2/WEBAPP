/**
 * SISTEMA_PROY_CAP4E — Fase 4e: Mix de Marketing.
 *
 * Sexta sub-fase del Capítulo IV. Define las estrategias del Mix de
 * Marketing. Tiene VARIANTE POR SUBTIPO:
 *
 *   - Producción: Mix clásico 4P (Producto, Precio, Plaza, Promoción).
 *   - Servicios: Mix ampliado 7P (4P + Personas, Procesos, Evidencia
 *     Física).
 *
 * Max tokens recomendado: 8000.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

// ─────────────────────────────────────────────────────────────────────────────
// Bloques comunes (las 4P básicas, definidas para ambos subtipos)
// ─────────────────────────────────────────────────────────────────────────────

const BLOQUE_4P_BASE = `
### 4.6.1 Estrategia de Producto / Servicio

Para subtipo PRODUCCIÓN: describe el producto en detalle (composición,
beneficios, presentación, líneas o variedades, ciclo de vida proyectado).

Para subtipo SERVICIOS: describe el servicio en detalle (qué se entrega,
duración típica, niveles de servicio, valor diferencial percibido).

Incluye:
- Atributos centrales (qué resuelve).
- Atributos diferenciales (qué hace distinto a la competencia).
- Líneas o variantes ofrecidas.
- Marca / submarca (vinculado a Fase 4d).

### 4.6.2 Estrategia de Precio

Política de precios:

- **Estrategia general**: penetración (precio bajo para ganar mercado),
  descreme (precio alto inicial), paridad competitiva, premium.
  Justifica la elección con base en la disposición a pagar
  identificada en la encuesta (Fase 3e).
- **Estructura de precios**: tarifas por producto/servicio.
- **Descuentos y promociones**: política de descuentos por volumen,
  primera compra, fidelidad.
- **Forma de cobro**: efectivo, tarjeta, transferencia, QR Tigo Money,
  fiado (si aplica).

**Tabla N. Estructura tarifaria propuesta**

| Producto/Servicio | Precio base (Bs) | Costo unitario (Bs) | Margen % |
|---|:-:|:-:|:-:|
| (3-6 filas) | | | |

Coherente con disposición a pagar de Fase 3e.

### 4.6.3 Estrategia de Plaza (Distribución)

Cómo llega el producto/servicio al cliente:

- **Canales directos**: local físico propio, página web, redes sociales,
  aplicación móvil.
- **Canales indirectos** (si aplica): intermediarios, distribuidores.
- **Cobertura geográfica**: alcance inicial vs proyectado a 5 años.
- **Logística operativa**: cómo se gestiona inventario / agenda de citas.

### 4.6.4 Estrategia de Promoción

Mezcla promocional:

- **Publicidad**: medios digitales (Facebook Ads, Instagram, TikTok,
  Google Ads), medios tradicionales si aplica (radio local, prensa
  zonal), boca a boca / referidos.
- **Promoción de ventas**: campañas estacionales, lanzamiento,
  primer mes, programas de fidelidad.
- **Relaciones públicas**: presencia en eventos, alianzas con influencers
  locales si aplica, prensa.
- **Marketing digital**: estrategia de contenido en redes, frecuencia
  de publicación, SEO básico, email marketing.
- **Venta personal**: si aplica al rubro.

**Tabla N. Presupuesto promocional anual**

| Canal | Inversión mensual (Bs) | Inversión anual (Bs) | KPIs esperados |
|---|:-:|:-:|---|
| (4-6 filas) | | | |
| **Total** | | **XX.XXX** | |

Presupuesto promocional total año 1 típico: 5-12% de los ingresos
proyectados de Fase 3f.
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Bloque adicional para SERVICIOS (las 3P extras)
// ─────────────────────────────────────────────────────────────────────────────

const BLOQUE_7P_EXTRAS_SERVICIOS = `
### 4.6.5 Estrategia de Personas

Aspecto crítico en servicios. Define cómo el personal de contacto
contribuye a la experiencia:

- Perfil del personal de contacto con el cliente.
- Capacitación específica en atención y experiencia.
- Estándares de comportamiento (uniformes, lenguaje, actitud).
- Empoderamiento para resolver problemas in situ.
- Programa de motivación / incentivos.

Conectar con la política salarial y de capacitación de Fase 4a-bis.

### 4.6.6 Estrategia de Procesos

Cómo se entrega el servicio paso a paso. Conectar con el protocolo
de atención definido en Fase 4c. Profundizar aquí en:

- Estandarización vs personalización: ¿hay un guion único o se
  adapta a cada cliente?
- Mecanismos de control de calidad operativa.
- Cómo se recupera el servicio ante errores (service recovery).
- Tecnología que soporta la operación (CRM, sistema de citas,
  app de pedidos).

### 4.6.7 Estrategia de Evidencia Física

Elementos tangibles que el cliente percibe del servicio intangible.
Conectar con la ambientación del local de Fase 4c. Profundizar en:

- Diseño del espacio físico como experiencia.
- Material impreso (menú, brochures, facturas).
- Vestimenta del personal.
- Empaque / take-away si aplica.
- Presencia digital (look del Instagram, sitio web).

Coherencia con la identidad visual de Fase 4d (branding).
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Builder
// ─────────────────────────────────────────────────────────────────────────────

function buildPromptCap4e(subtipo: "produccion" | "servicios"): string {
  const subtipoLegible = subtipo === "produccion"
    ? "PRODUCCIÓN Y COMERCIALIZACIÓN DE UN BIEN"
    : "BRINDAR UN SERVICIO";
  const modeloMix = subtipo === "produccion"
    ? "Mix de Marketing CLÁSICO 4P (Producto, Precio, Plaza, Promoción)"
    : "Mix de Marketing AMPLIADO 7P (4P + Personas, Procesos, Evidencia Física)";

  const cuerpo = subtipo === "produccion"
    ? BLOQUE_4P_BASE
    : `${BLOQUE_4P_BASE}\n\n${BLOQUE_7P_EXTRAS_SERVICIOS}`;

  return `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.6 — MIX DE MARKETING del Cap. IV para
un proyecto del subtipo ${subtipoLegible}.

Modelo aplicado: ${modeloMix}.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [CAP III COMPLETO] — para el perfil del cliente y disposición a pagar.
3. [FASE 4a] — para la identidad corporativa.
4. [FASE 4c APROBADA] — para el estudio técnico (ubicación, ambientación).
5. [FASE 4d APROBADA] — para el branding y la identidad visual.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 4.6 Mix de Marketing

(Párrafo introductorio: qué modelo se aplica y por qué.)

${cuerpo}

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado para subtipo PRODUCCIÓN (4P): 10-15 páginas (3500-5500 palabras).
- Total esperado para subtipo SERVICIOS (7P): 14-20 páginas (5000-7500 palabras).
- Presupuesto promocional coherente con los ingresos de Fase 3f.
- Coherencia con todo lo anterior: el precio respeta la disposición
  identificada en la encuesta; la plaza alinea con la localización
  elegida en 4c; la promoción alinea con la identidad de 4d.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO mezcles 4P con 7P (estás en el subtipo ${subtipoLegible}).
- NO uses presupuestos promocionales irreales (200.000 Bs/mes para un
  emprendimiento con ingresos de 50.000 Bs/mes).
- NO inventes KPIs sin sentido — alinea con la demanda proyectada
  (alcance, conversiones, frecuencia).
- NO repitas información de Fase 4c (estudio técnico) — referenciala.
- NO duplicar la identidad de marca de Fase 4d — referenciala.
`.trim();
}

export const SISTEMA_PROY_CAP4E_PRODUCCION = buildPromptCap4e("produccion");
export const SISTEMA_PROY_CAP4E_SERVICIOS = buildPromptCap4e("servicios");

export function getPromptCap4e(subtipo: "produccion" | "servicios"): string {
  return subtipo === "produccion"
    ? SISTEMA_PROY_CAP4E_PRODUCCION
    : SISTEMA_PROY_CAP4E_SERVICIOS;
}

export function buildContextoCap4e(datos: {
  cap3eAprobado: string;
  cap3fAprobado: string;
  cap4aAprobado: string;
  cap4cAprobado: string;
  cap4dAprobado: string;
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
    "[FASE 3e — RESULTADOS ENCUESTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3eAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3f — DEMANDA Y CUOTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3fAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4a — ORGANIZACIONAL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4aAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4c — TÉCNICO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4cAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4d — BRANDING]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4dAprobado.trim(),
    "",
  ].join("\n");
}
