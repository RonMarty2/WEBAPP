/**
 * Catálogo central de servicios del SaaS (single source of truth).
 *
 * Consumido por:
 *   - /api/services (para clientes externos)
 *   - /nucleo (hub principal)
 *   - Futuras pantallas que necesiten listar productos
 *
 * Para agregar un servicio nuevo: añadir un objeto aquí y mapear el `iconId`
 * a un componente SVG en la página que renderice las tarjetas.
 *
 * Copy: español neutro con tuteo (mercado boliviano). Nunca voseo.
 */

export type ServicioId = "scribe" | "axiom" | "lumen" | "mentor" | "laboratorio";

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
  {
    id: "lumen",
    nombre: "LUMEN",
    descripcion:
      "Generador avanzado de material de Contenido Docente. Planeación curricular y desarrollo de clases en minutos.",
    ruta: "/lumen",
    iconId: "lumen",
    estado: "beta",
    plan_minimo: "estandar",
    paleta: { accentRgb: "245,158,11", accentLight: "251,191,36" },
  },
  {
    id: "mentor",
    nombre: "MENTOR",
    descripcion:
      "Herramienta de tutoría automatizada con feedback continuo para la validación experta de proyectos.",
    ruta: "/mentor",
    iconId: "mentor",
    estado: "beta",
    plan_minimo: "estandar",
    paleta: { accentRgb: "16,185,129", accentLight: "52,211,153" },
  },
  {
    id: "laboratorio",
    nombre: "LABORATORIO",
    descripcion:
      "Espacio experimental para probar funcionalidades antes de pasarlas a producción. Acceso para usuarios avanzados.",
    ruta: "/laboratorio",
    iconId: "laboratorio",
    estado: "beta",
    plan_minimo: "pro",
    paleta: { accentRgb: "236,72,153", accentLight: "244,114,182" },
    badge: "Sandbox",
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
