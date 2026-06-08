/**
 * Catálogo único de planes de pago.
 *
 * UNA sola fuente de verdad para los 6 SKUs comerciales. Lee de acá:
 *   - La landing (PricingSection.tsx) para mostrar precios y features.
 *   - El endpoint /api/payments para aceptar/rechazar slugs y calcular monto.
 *   - La página /pago para resolver `?plan=...` y mostrar el plan elegido.
 *   - El admin /admin/pagos para mostrar el nombre humano del plan.
 *
 * Antes de esta refactorización, la landing ofrecía 6 SKUs pero la API
 * solo conocía 2 (estandar=150, pro=300). Resultado: un alumno hacía
 * click en "Plus Bs 300" en la landing y terminaba pagando Bs 150 sin
 * darse cuenta — el slug se silenciaba en runtime.
 *
 * Reglas:
 *   - Los slugs son INMUTABLES. Si cambias un slug rompes proyectos pagados.
 *     Para cambiar precio, modifica `precio_bs`. Para cambiar features,
 *     modifica `incluye[]`.
 *   - Para agregar un SKU nuevo, agregar acá Y verificar que /api/payments
 *     lo acepta (es automático porque la lista se itera).
 *   - Para deprecar un SKU, marcarlo con `activo: false` para que no se
 *     muestre en la landing pero los pagos viejos sigan siendo válidos.
 */

export type PagoFamilia = "monografia" | "proyecto_grado";
export type PagoTier = "basico" | "plus" | "premium";

export interface PlanCatalogo {
  /** Slug INMUTABLE — clave de pago, va al ?plan= en URLs y al body de POST. */
  slug: string;
  familia: PagoFamilia;
  tier: PagoTier;
  /** Nombre humano para mostrar al usuario y al admin. */
  nombre: string;
  precio_bs: number;
  /** Headline corta para la card de la landing. */
  headline: string;
  /** Sub-headline (1-2 frases) para la card. */
  subhead: string;
  /** Tiempo de entrega para la card de marketing. */
  tiempo: string;
  /** Bullets de qué incluye (visible al usuario). */
  incluye: string[];
  /** Bullets de qué NO incluye (transparencia). */
  no_incluye?: string[];
  /** Marca el tier "Plus" como recomendado. */
  recomendado?: boolean;
  /** Texto del CTA en la landing. */
  cta: string;
  /** Si está activo se muestra en la landing y se acepta como pago. */
  activo: boolean;
}

// ─── EL CATÁLOGO ─────────────────────────────────────────────────────────

export const PLANES: readonly PlanCatalogo[] = [
  // ── MONOGRAFÍA ─────────────────────────────────────────────────────
  {
    slug: "mono-basico",
    familia: "monografia",
    tier: "basico",
    nombre: "Monografía Básico",
    precio_bs: 150,
    headline: 'Tu monografía, lista para entregar',
    subhead: "La redactamos completa por ti. Lista para imprimir y presentar al tutor.",
    tiempo: "En menos de 3 horas",
    incluye: [
      "El documento completo, capítulo por capítulo",
      "Bibliografía citada como tu carrera exige",
      "Validación previa de tema en tu universidad",
      "Archivo final en PDF y formato editable",
    ],
    no_incluye: [
      "Ajustes después de la entrega",
      "Atención a observaciones del tutor",
    ],
    cta: "Quiero el Básico",
    activo: true,
  },
  {
    slug: "mono-plus",
    familia: "monografia",
    tier: "plus",
    nombre: "Monografía Plus",
    precio_bs: 300,
    headline: 'Hasta que el tutor diga "aprobado"',
    subhead: "La escribimos por ti, y si el tutor observa, también la corregimos sin que tengas que rehacer nada.",
    tiempo: "Revisiones en minutos",
    incluye: [
      "Corregimos las observaciones del tutor automáticamente",
      "Mejoramos cualquier sección con un solo pedido",
      "Cada cambio se previsualiza antes de aplicarse",
      "Reescribimos solo lo necesario, no el documento entero",
    ],
    no_incluye: ["Material de referencia personalizado"],
    recomendado: true,
    cta: "Elijo el Plus",
    activo: true,
  },
  {
    slug: "mono-premium",
    familia: "monografia",
    tier: "premium",
    nombre: "Monografía Premium",
    precio_bs: 500,
    headline: "Te acompañamos hasta la defensa",
    subhead: "Todo el respaldo, desde la primera redacción hasta el día que te pares frente al tribunal.",
    tiempo: "Soporte 24/7 hasta la defensa",
    incluye: [
      "Si tienes material propio, lo integramos al documento",
      "Adaptamos la redacción a tu estilo personal",
      "Banco de preguntas para defensa",
      "Materiales listos para llevar al tribunal",
      "Soporte 24/7 hasta defender con éxito",
    ],
    cta: "Voy con el Premium",
    activo: true,
  },

  // ── PROYECTO DE GRADO ──────────────────────────────────────────────
  {
    slug: "pg-basico",
    familia: "proyecto_grado",
    tier: "basico",
    nombre: "Proyecto de Grado Básico",
    precio_bs: 350,
    headline: "Tu plan de negocio, terminado",
    subhead: "Armamos las 23 secciones por ti, con análisis y números listos para presentar.",
    tiempo: "Listo en menos de 6 horas",
    incluye: [
      "Las 23 secciones que tu carrera exige, armadas",
      "Análisis del mercado, competencia y entorno",
      "Tablas, matrices y proyecciones financieras",
      "Estructura aprobada por tu universidad",
      "Archivo final en PDF y formato editable",
    ],
    no_incluye: [
      "Ajustes después de la entrega",
      "Atención a observaciones del tutor",
    ],
    cta: "Quiero el Básico",
    activo: true,
  },
  {
    slug: "pg-plus",
    familia: "proyecto_grado",
    tier: "plus",
    nombre: "Proyecto de Grado Plus",
    precio_bs: 600,
    headline: "El que el tutor aprueba sin rehacer",
    subhead: "Si el tutor observa, nosotros corregimos. Tu proyecto avanza sin retroceder.",
    tiempo: "Revisiones en minutos",
    incluye: [
      "Corregimos observaciones del tutor de forma quirúrgica",
      "Ajustamos cualquier sección a pedido",
      "Armamos la encuesta de mercado, lista para distribuir",
      "Analizamos automáticamente los resultados",
    ],
    no_incluye: ["Branding visual y plan financiero avanzado"],
    recomendado: true,
    cta: "Elijo el Plus",
    activo: true,
  },
  {
    slug: "pg-premium",
    familia: "proyecto_grado",
    tier: "premium",
    nombre: "Proyecto de Grado Premium",
    precio_bs: 950,
    headline: "Tu negocio, listo para el mercado",
    subhead: "Para cuando esta defensa decide si tu proyecto sale al mercado real.",
    tiempo: "Soporte 24/7 hasta la defensa",
    incluye: [
      "Briefing completo para diseñar tu marca + logos",
      "Plan financiero profesional con VAN, TIR y WACC",
      "Banco de preguntas con respuestas modelo",
      "Materiales listos para llevar al tribunal",
      "Soporte 24/7 hasta defender con éxito",
    ],
    cta: "Voy con el Premium",
    activo: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Devuelve el plan exacto por slug, o null. */
export function planPorSlug(slug: string | null | undefined): PlanCatalogo | null {
  if (!slug) return null;
  return PLANES.find((p) => p.slug === slug) ?? null;
}

/** ¿Este slug existe y está activo? Para validar pagos. */
export function slugEsValido(slug: string | null | undefined): boolean {
  const p = planPorSlug(slug);
  return !!p && p.activo;
}

/** Precio en Bs para un slug, o 0 si no existe. */
export function precioDeSlug(slug: string | null | undefined): number {
  return planPorSlug(slug)?.precio_bs ?? 0;
}

/** Devuelve los planes agrupados por familia para la landing. */
export function planesPorFamilia(): Record<PagoFamilia, PlanCatalogo[]> {
  const grupo: Record<PagoFamilia, PlanCatalogo[]> = {
    monografia: [],
    proyecto_grado: [],
  };
  for (const p of PLANES) {
    if (p.activo) grupo[p.familia].push(p);
  }
  return grupo;
}

/** Slugs legacy → mapear a slugs nuevos (compatibilidad con cookies/URLs viejas). */
export function migrarSlugLegacy(slug: string): string {
  // Antes del catálogo había solo "estandar" (Bs 150) y "pro" (Bs 300).
  // Mapeamos al equivalente más cercano para no romper sesiones viejas.
  if (slug === "estandar") return "mono-basico";
  if (slug === "pro") return "mono-plus";
  return slug;
}

/** Para el admin: nombre + precio para un slug. */
export function descripcionAdmin(slug: string): string {
  const p = planPorSlug(slug);
  if (!p) return `${slug} (desconocido)`;
  return `${p.nombre} — Bs. ${p.precio_bs}`;
}

/**
 * Mapea el slug comercial al `UserPlan` interno (estandar/pro/elite).
 * Necesario porque el resto del SaaS gateda features por UserPlan, no
 * por slug. La regla es simple: todos los "basico" = estandar, "plus" =
 * pro, "premium" = elite. Si en el futuro cambias esa equivalencia,
 * cambia acá UNA vez.
 */
export function slugAUserPlan(slug: string): "estandar" | "pro" | "elite" {
  const p = planPorSlug(migrarSlugLegacy(slug));
  if (!p) return "estandar";
  switch (p.tier) {
    case "basico":  return "estandar";
    case "plus":    return "pro";
    case "premium": return "elite";
  }
}
