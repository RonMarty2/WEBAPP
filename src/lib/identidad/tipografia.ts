/**
 * Catálogo curado de Google Fonts organizado por personalidad de marca.
 *
 * En vez de pedirle a la IA "elige una tipografía", presentamos un set
 * curado de combinaciones probadas. Cero costo en tokens, resultados
 * profesionales y consistentes. El alumno elige una combinación o
 * personaliza.
 *
 * Filosofía:
 *   - Cada combinación tiene UN principal (titulares) y UNA secundaria
 *     (cuerpo). Esto cubre 90% de los usos.
 *   - Las fuentes son todas Google Fonts (gratuitas, web-safe, importables).
 *   - Cada combinación se etiqueta con personalidades para hacer el match
 *     con el brief.
 */

import type { PesoTipografia, Tipografia } from "@/types/identidad";

export type PersonalidadFuente =
  | "moderna"      // tecnológico, startup, app
  | "clasica"      // tradicional, autoridad, instituciones
  | "elegante"     // lujo, belleza, alta gama
  | "amigable"     // cálida, cercana, retail/educación
  | "academica"    // libros, papers, formal
  | "industrial"   // construcción, ingeniería, técnico
  | "artesanal"    // hecho a mano, gastronomía, boutique
  | "neutral";     // versátil, para cualquier rubro

export interface CombinacionTipografica {
  id: string;
  nombre: string;
  principal: { familia: string; peso: PesoTipografia };
  secundaria: { familia: string; peso: PesoTipografia };
  personalidades: PersonalidadFuente[];
  notas: string;          // por qué funciona esta combinación
  /** URL de Google Fonts para previsualizar. */
  importUrl: string;
}

export const COMBINACIONES_TIPOGRAFICAS: CombinacionTipografica[] = [
  {
    id: "inter-inter",
    nombre: "Inter & Inter",
    principal: { familia: "Inter", peso: "800" },
    secundaria: { familia: "Inter", peso: "400" },
    personalidades: ["moderna", "neutral"],
    notas: "Una sola familia con dos pesos. Súper versátil, contemporánea y limpia. Default seguro si no estás seguro.",
    importUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;800&display=swap",
  },
  {
    id: "playfair-source",
    nombre: "Playfair Display & Source Sans Pro",
    principal: { familia: "Playfair Display", peso: "700" },
    secundaria: { familia: "Source Sans Pro", peso: "400" },
    personalidades: ["elegante", "clasica", "academica"],
    notas: "Serif elegante con contraste alto + sans humanista. Combo clásico para revistas y marcas de lujo.",
    importUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+Pro:wght@400&display=swap",
  },
  {
    id: "merriweather-roboto",
    nombre: "Merriweather & Roboto",
    principal: { familia: "Merriweather", peso: "700" },
    secundaria: { familia: "Roboto", peso: "400" },
    personalidades: ["academica", "clasica", "neutral"],
    notas: "Serif robusto y legible + el sans más usado en pantalla. Excelente para contenido largo.",
    importUrl: "https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Roboto:wght@400&display=swap",
  },
  {
    id: "poppins-poppins",
    nombre: "Poppins & Poppins",
    principal: { familia: "Poppins", peso: "700" },
    secundaria: { familia: "Poppins", peso: "400" },
    personalidades: ["moderna", "amigable"],
    notas: "Geometric sans con formas redondeadas. Joven, accesible, fresca. Funciona para retail, educación, lifestyle.",
    importUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap",
  },
  {
    id: "raleway-lato",
    nombre: "Raleway & Lato",
    principal: { familia: "Raleway", peso: "700" },
    secundaria: { familia: "Lato", peso: "400" },
    personalidades: ["moderna", "elegante", "amigable"],
    notas: "Sans elegante con líneas finas + humanista. Combo balanceado: ni muy formal ni muy casual.",
    importUrl: "https://fonts.googleapis.com/css2?family=Raleway:wght@700&family=Lato:wght@400&display=swap",
  },
  {
    id: "montserrat-opensans",
    nombre: "Montserrat & Open Sans",
    principal: { familia: "Montserrat", peso: "800" },
    secundaria: { familia: "Open Sans", peso: "400" },
    personalidades: ["moderna", "industrial", "neutral"],
    notas: "Sans geometric fuerte + sans humanista neutral. Look corporativo moderno. Funciona para tech y servicios.",
    importUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Open+Sans:wght@400&display=swap",
  },
  {
    id: "lora-nunito",
    nombre: "Lora & Nunito",
    principal: { familia: "Lora", peso: "600" },
    secundaria: { familia: "Nunito", peso: "400" },
    personalidades: ["amigable", "artesanal", "academica"],
    notas: "Serif suave y humanista + sans redondeado. Cálido, ideal para gastronomía artesanal, cafeterías y boutiques.",
    importUrl: "https://fonts.googleapis.com/css2?family=Lora:wght@600&family=Nunito:wght@400&display=swap",
  },
  {
    id: "bebas-roboto",
    nombre: "Bebas Neue & Roboto",
    principal: { familia: "Bebas Neue", peso: "400" },
    secundaria: { familia: "Roboto", peso: "400" },
    personalidades: ["industrial", "moderna"],
    notas: "Sans condensado en mayúsculas + sans neutral. Look deportivo/urbano. Funciona para gimnasios, construcción, retail.",
    importUrl: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400&display=swap",
  },
  {
    id: "cormorant-jost",
    nombre: "Cormorant & Jost",
    principal: { familia: "Cormorant Garamond", peso: "600" },
    secundaria: { familia: "Jost", peso: "400" },
    personalidades: ["elegante", "clasica"],
    notas: "Serif de transición con remates finos + sans neutral. Look editorial sofisticado. Ideal para hotelería, joyería, belleza alta gama.",
    importUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Jost:wght@400&display=swap",
  },
  {
    id: "spacegrotesk-inter",
    nombre: "Space Grotesk & Inter",
    principal: { familia: "Space Grotesk", peso: "700" },
    secundaria: { familia: "Inter", peso: "400" },
    personalidades: ["moderna", "industrial"],
    notas: "Sans geométrico con personalidad + sans neutral. Look tech-startup contemporáneo. Para apps, SaaS, IoT.",
    importUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400&display=swap",
  },
];

/**
 * Recomienda 3 combinaciones según la personalidad declarada en el brief.
 * Hace match por intersección de tags. Si no hay match, devuelve las 3
 * más versátiles (Inter/Poppins/Raleway).
 */
export function recomendarTipografias(
  personalidadDeseada: PersonalidadFuente[],
): CombinacionTipografica[] {
  if (!personalidadDeseada.length) {
    return COMBINACIONES_TIPOGRAFICAS.filter((c) => c.personalidades.includes("neutral")).slice(0, 3);
  }

  // Puntaje por cada combinación: cantidad de tags que matchean.
  const conPuntaje = COMBINACIONES_TIPOGRAFICAS.map((c) => ({
    combinacion: c,
    puntaje: personalidadDeseada.filter((p) => c.personalidades.includes(p)).length,
  })).filter((x) => x.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 3)
    .map((x) => x.combinacion);

  // Si menos de 3 con match, completar con neutrales.
  if (conPuntaje.length < 3) {
    const ids = new Set(conPuntaje.map((c) => c.id));
    const neutrales = COMBINACIONES_TIPOGRAFICAS
      .filter((c) => c.personalidades.includes("neutral") && !ids.has(c.id));
    return [...conPuntaje, ...neutrales].slice(0, 3);
  }

  return conPuntaje;
}

/**
 * Mapea palabras del brief a personalidades de fuente.
 * Heurística simple, no necesita IA.
 */
export function inferirPersonalidadesDesdePalabras(palabras: string[]): PersonalidadFuente[] {
  const mapa: Record<string, PersonalidadFuente> = {
    "moderno": "moderna", "moderna": "moderna", "tech": "moderna", "innovador": "moderna",
    "joven": "moderna", "fresco": "moderna", "minimalista": "moderna",
    "clasico": "clasica", "clásico": "clasica", "tradicional": "clasica", "formal": "clasica",
    "elegante": "elegante", "sofisticado": "elegante", "lujo": "elegante", "premium": "elegante",
    "amigable": "amigable", "cálido": "amigable", "calido": "amigable", "cercano": "amigable",
    "humano": "amigable", "familiar": "amigable",
    "académico": "academica", "academico": "academica", "intelectual": "academica",
    "serio": "academica", "profesional": "academica",
    "industrial": "industrial", "técnico": "industrial", "tecnico": "industrial",
    "robusto": "industrial", "fuerte": "industrial",
    "artesanal": "artesanal", "hecho a mano": "artesanal", "boutique": "artesanal",
    "auténtico": "artesanal", "autentico": "artesanal",
  };
  const detectadas = new Set<PersonalidadFuente>();
  for (const p of palabras) {
    const limpio = p.toLowerCase().trim();
    if (mapa[limpio]) detectadas.add(mapa[limpio]);
  }
  return Array.from(detectadas);
}

/**
 * Convierte una CombinacionTipografica a una Tipografia (la forma que
 * guardamos en BD), agregando una justificación generada en base al
 * match con la personalidad.
 */
export function combinacionAtipografia(c: CombinacionTipografica): Tipografia {
  return {
    principal: c.principal,
    secundaria: c.secundaria,
    justificacion: c.notas,
  };
}
