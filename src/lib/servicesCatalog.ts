/**
 * Catálogo central de servicios del SaaS (single source of truth).
 *
 * Consumido por:
 *   - /api/services (para clientes externos)
 *   - Futuras pantallas que necesiten listar productos
 *
 * Para agregar un servicio nuevo: añadir un objeto aquí y mapear el `iconId`
 * a un componente SVG en la página que renderice las tarjetas.
 *
 * Copy: español neutro con tuteo (mercado boliviano). Nunca voseo.
 */

export type ServicioId = "scribe" | "proyecto-grado" | "axiom";

export type ServicioPlan = "demo" | "estandar" | "pro" | "elite";

export type ServicioEstado = "disponible" | "beta" | "proximamente";

export interface ServicioCatalogo {
  id: ServicioId;
  nombre: string;
  descripcion: string;
  ruta: string;
  iconId: ServicioId;
  estado: ServicioEstado;
  plan_minimo: ServicioPlan;
  paleta: {
    accentRgb: string;
    accentLight: string;
  };
  badge?: string;
}

export const SERVICIOS_CATALOGO: ServicioCatalogo[] = [
  {
    id: "scribe",
    nombre: "SCRIBE",
    descripcion:
      "Generador lógico estructurado de Proyectos de Grado y Monografías (APA 7). Funciona bajo un estricto motor de coherencia de investigación.",
    ruta: "/dashboard",
    iconId: "scribe",
    estado: "disponible",
    plan_minimo: "demo",
    paleta: { accentRgb: "37,99,235", accentLight: "59,130,246" },
    badge: "Módulo Principal",
  },
  {
    id: "proyecto-grado",
    nombre: "PROYECTO DE GRADO",
    descripcion:
      "Plan de negocio completo en 23 fases: PESTEL, Porter, matrices estratégicas, estudio técnico, financiero, branding y evaluación. Apto para defensa ante tribunal.",
    ruta: "/projects/new?tipo=proy-grado-001",
    iconId: "proyecto-grado",
    estado: "disponible",
    plan_minimo: "estandar",
    paleta: { accentRgb: "14,165,233", accentLight: "56,189,248" },
    badge: "23 fases",
  },
    id: "axiom",
    nombre: "AXIOM",
    descripcion:
      "Simulador paramétrico de Exámenes de Alta Precisión. Entrena y evalúa competencias bajo métricas exactas.",
    ruta: "/axiom",
    iconId: "axiom",
    estado: "disponible",
    plan_minimo: "demo",
    paleta: { accentRgb: "139,92,246", accentLight: "167,139,250" },
  },
];

/**
 * Filtra servicios visibles según el plan del usuario.
 * Los servicios con `proximamente` se ocultan; `beta` se muestran a todos los planes
 * que cumplen `plan_minimo`.
 */
export function serviciosVisiblesParaPlan(plan: ServicioPlan): ServicioCatalogo[] {
  const orden: ServicioPlan[] = ["demo", "estandar", "pro", "elite"];
  const nivelUsuario = orden.indexOf(plan);
  return SERVICIOS_CATALOGO.filter((s) => {
    if (s.estado === "proximamente") return false;
    const nivelRequerido = orden.indexOf(s.plan_minimo);
    return nivelUsuario >= nivelRequerido;
  });
}

/**
 * Forma compatible con el endpoint legacy `/api/services` que esperaba el shape de Supabase.
 */
export function toLegacyServiciosShape() {
  return SERVICIOS_CATALOGO.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion,
    activo: s.estado !== "proximamente",
    audiencia_id: s.plan_minimo === "demo" ? "est-001" : "est-pro-001",
    perfiles_audiencia: {
      id: s.plan_minimo === "demo" ? "est-001" : "est-pro-001",
      nombre: s.plan_minimo === "demo" ? "Estudiante" : "Estudiante Pro",
    },
  }));
}
