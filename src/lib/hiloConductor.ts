/**
 * Hilo Conductor — Memoria Sagrada entre Capítulos
 *
 * Extrae compromisos concretos de cada capítulo generado y los almacena
 * como restricciones duras que los capítulos siguientes NO pueden contradecir.
 *
 * Ejemplos de compromisos:
 *   - "La muestra es de 120 estudiantes de la UMSS"
 *   - "Metodología cuantitativa con diseño no experimental"
 *   - "Objetivo general: Analizar el impacto de X en Y"
 *   - "Marco temporal: 2022-2024"
 */

export interface Commitment {
  tipo: "poblacion" | "metodologia" | "objetivo" | "marco_temporal" | "teoria" | "variable" | "otro";
  valor: string;
  fuente: string; // label de la fase que lo generó
}

export interface HiloConductorMemory {
  commitments: Commitment[];
  last_updated: string;
}

// ─── Patrones de extracción ───────────────────────────────────

const PATTERNS: Array<{
  tipo: Commitment["tipo"];
  regex: RegExp;
  extract: (match: RegExpMatchArray) => string | null;
}> = [
  // Población / muestra numérica
  {
    tipo: "poblacion",
    regex: /(?:muestra|población|universo|unidades?\s+de\s+análisis)[^\d]{0,30}(\d{2,4})\s*(?:respondentes?|encuestados?|personas?|sujetos?|estudiantes?|empresas?|trabajadores?|docentes?|unidades?)?/gi,
    extract: (m) => m[0].replace(/\s+/g, " ").trim().slice(0, 120),
  },
  // Metodología
  {
    tipo: "metodologia",
    regex: /(?:enfoque|metodolog[íi]a|investigaci[óo]n|tipo\s+de\s+estudio)[^.]{0,60}(?:cuantitativ[ao]|cualitativ[ao]|mixt[ao]|descriptiv[ao]|correlacional|explicativ[ao]|experimental|no\s+experimental|transversal|longitudinal)/gi,
    extract: (m) => m[0].replace(/\s+/g, " ").trim().slice(0, 150),
  },
  // Objetivo general
  {
    tipo: "objetivo",
    regex: /objetivo\s+general[:\s]+([^.\n]{20,200})/gi,
    extract: (m) => `Objetivo general: ${m[1]?.trim()}`,
  },
  // Objetivos específicos (primero hasta 3)
  {
    tipo: "objetivo",
    regex: /objetivo\s+espec[íi]fico\s*(?:\d+|[a-z]\))?[:\s]+([^.\n]{15,180})/gi,
    extract: (m) => `Objetivo específico: ${m[1]?.trim()}`,
  },
  // Marco temporal / período
  {
    tipo: "marco_temporal",
    regex: /(?:per[íi]odo|marco\s+temporal|a[ñn]o(?:s)?\s+(?:de\s+)?(?:estudio|análisis|investigación))[^.]{0,40}(20\d{2}[\s\-–a-z]{1,5}20\d{2}|20\d{2})/gi,
    extract: (m) => m[0].replace(/\s+/g, " ").trim().slice(0, 100),
  },
  // Variables principales
  {
    tipo: "variable",
    regex: /variable\s+(?:independiente|dependiente|de\s+estudio)[:\s]+([^.\n]{10,120})/gi,
    extract: (m) => `${m[0].split(":")[0].trim()}: ${m[1]?.trim()}`,
  },
];

// ─── Extracción ───────────────────────────────────────────────

export function extractCommitments(content: string, faseLabel: string): Commitment[] {
  const found: Commitment[] = [];
  const seen = new Set<string>();

  for (const { tipo, regex, extract } of PATTERNS) {
    regex.lastIndex = 0;
    let match: RegExpMatchArray | null;
    let count = 0;
    while ((match = regex.exec(content)) !== null && count < 4) {
      const valor = extract(match);
      if (!valor) continue;
      const key = `${tipo}:${valor.slice(0, 60).toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        found.push({ tipo, valor, fuente: faseLabel });
        count++;
      }
    }
  }

  return found;
}

// ─── Actualizar memoria ───────────────────────────────────────

export function updateHiloConductor(
  existingMemory: Record<string, unknown> | undefined,
  newCommitments: Commitment[]
): Record<string, unknown> {
  const memory = existingMemory ?? {};
  const existing: HiloConductorMemory = (memory.hilo_conductor as HiloConductorMemory) ?? {
    commitments: [],
    last_updated: new Date().toISOString(),
  };

  // Merge: replace commitments from the same source, add new ones
  const otherCommitments = existing.commitments.filter(
    (c) => !newCommitments.some((n) => n.fuente === c.fuente && n.tipo === c.tipo)
  );

  const updated: HiloConductorMemory = {
    commitments: [...otherCommitments, ...newCommitments],
    last_updated: new Date().toISOString(),
  };

  return { ...memory, hilo_conductor: updated };
}

// ─── Construir bloque de restricciones ───────────────────────

export function buildHiloConstraintBlock(memory: Record<string, unknown> | undefined): string {
  const hilo = memory?.hilo_conductor as HiloConductorMemory | undefined;
  if (!hilo?.commitments?.length) return "";

  const byType: Partial<Record<Commitment["tipo"], Commitment[]>> = {};
  for (const c of hilo.commitments) {
    if (!byType[c.tipo]) byType[c.tipo] = [];
    byType[c.tipo]!.push(c);
  }

  const labels: Record<Commitment["tipo"], string> = {
    poblacion: "POBLACIÓN Y MUESTRA",
    metodologia: "METODOLOGÍA",
    objetivo: "OBJETIVOS",
    marco_temporal: "MARCO TEMPORAL",
    teoria: "TEORÍAS Y MARCOS",
    variable: "VARIABLES",
    otro: "OTROS COMPROMISOS",
  };

  const lines: string[] = [
    "=== COMPROMISOS SAGRADOS DE CAPÍTULOS ANTERIORES ===",
    "CRÍTICO: Los siguientes datos fueron establecidos en capítulos ya aprobados.",
    "NO puedes contradecirlos, cambiar sus cifras ni modificar sus definiciones.\n",
  ];

  for (const [tipo, items] of Object.entries(byType) as [Commitment["tipo"], Commitment[]][]) {
    if (!items.length) continue;
    lines.push(`▸ ${labels[tipo]}:`);
    for (const item of items) {
      lines.push(`  • ${item.valor}  [fuente: ${item.fuente}]`);
    }
    lines.push("");
  }

  lines.push("=== FIN DE COMPROMISOS SAGRADOS ===");
  return lines.join("\n");
}
