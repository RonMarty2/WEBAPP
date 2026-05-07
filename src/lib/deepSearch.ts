/**
 * Deep Search — Búsqueda de fuentes académicas reales
 *
 * Proveedores (todos gratuitos, sin API key):
 *   1. Semantic Scholar  — papers académicos con abstract
 *   2. CrossRef          — metadatos DOI y revista/editorial
 *   3. OpenAlex          — grafo académico abierto
 *
 * El módulo se usa ANTES de llamar a la IA para inyectar
 * un bloque "FUENTES VERIFICADAS" en el prompt, reduciendo
 * alucinaciones bibliográficas a cero.
 */

const TIMEOUT_MS = 5_000;
const MAX_POR_PROVEEDOR = 5;

// ─── Tipos públicos ───────────────────────────────────────────

export interface FuenteAcademica {
  titulo: string;
  autores: string[];
  año: number | null;
  doi?: string;
  abstract?: string;
  url?: string;
  revista?: string;
  apa: string;
  proveedor: string;
}

export interface DeepSearchOutput {
  query: string;
  fuentes: FuenteAcademica[];
  duracion_ms: number;
  proveedores_usados: string[];
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

function buildApa(
  autores: string[],
  año: number | null,
  titulo: string,
  revista?: string,
  doi?: string
): string {
  const autorStr = autores.length === 0
    ? "Autor desconocido"
    : autores.length <= 3
      ? autores.join(", ")
      : `${autores[0]}, et al.`;
  const añoStr = año ? `(${año})` : "(s.f.)";
  const revStr = revista ? `. ${revista}` : "";
  const doiStr = doi ? `. https://doi.org/${doi}` : "";
  return `${autorStr} ${añoStr}. ${titulo}${revStr}${doiStr}.`;
}

function deduplicar(fuentes: FuenteAcademica[]): FuenteAcademica[] {
  const seen = new Set<string>();
  return fuentes.filter(f => {
    const key = f.titulo.toLowerCase().replace(/\s+/g, " ").slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Semantic Scholar ─────────────────────────────────────────

async function buscarSemanticScholar(query: string): Promise<FuenteAcademica[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encoded}&limit=${MAX_POR_PROVEEDOR}&fields=title,authors,year,abstract,externalIds,journal`;
  const res = await fetch(url, { headers: { "User-Agent": "LaboratorioAcademico/1.0" } });
  if (!res.ok) return [];
  const json = await res.json() as {
    data?: Array<{
      title: string;
      authors: { name: string }[];
      year: number | null;
      abstract?: string;
      journal?: { name: string };
      externalIds?: { DOI?: string };
    }>;
  };
  return (json.data ?? []).map(p => {
    const autores = (p.authors ?? []).map(a => a.name);
    const doi = p.externalIds?.DOI;
    const revista = p.journal?.name;
    return {
      titulo: p.title,
      autores,
      año: p.year ?? null,
      doi,
      abstract: p.abstract?.slice(0, 300),
      url: doi ? `https://doi.org/${doi}` : undefined,
      revista,
      apa: buildApa(autores, p.year ?? null, p.title, revista, doi),
      proveedor: "Semantic Scholar",
    };
  });
}

// ─── CrossRef ─────────────────────────────────────────────────

async function buscarCrossRef(query: string): Promise<FuenteAcademica[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://api.crossref.org/works?query=${encoded}&rows=${MAX_POR_PROVEEDOR}&select=title,author,published,DOI,container-title`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "LaboratorioAcademico/1.0 (mailto:contacto@laboratorio.bo)",
    },
  });
  if (!res.ok) return [];
  const json = await res.json() as {
    message?: {
      items?: Array<{
        title: string[];
        author?: { given?: string; family: string }[];
        published?: { "date-parts"?: [[number]] };
        DOI?: string;
        "container-title"?: string[];
      }>;
    };
  };
  return (json.message?.items ?? []).map(item => {
    const titulo = item.title?.[0] ?? "";
    const autores = (item.author ?? []).map(a =>
      a.family + (a.given ? `, ${a.given.charAt(0)}.` : "")
    );
    const año = item.published?.["date-parts"]?.[0]?.[0] ?? null;
    const doi = item.DOI;
    const revista = item["container-title"]?.[0];
    return {
      titulo,
      autores,
      año,
      doi,
      url: doi ? `https://doi.org/${doi}` : undefined,
      revista,
      apa: buildApa(autores, año, titulo, revista, doi),
      proveedor: "CrossRef",
    };
  });
}

// ─── OpenAlex ─────────────────────────────────────────────────

async function buscarOpenAlex(query: string): Promise<FuenteAcademica[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://api.openalex.org/works?search=${encoded}&per-page=${MAX_POR_PROVEEDOR}&select=title,authorships,publication_year,doi,abstract_inverted_index,primary_location&mailto=contacto@laboratorio.bo`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json() as {
    results?: Array<{
      title: string;
      authorships: { author: { display_name: string } }[];
      publication_year: number | null;
      doi?: string;
      primary_location?: { source?: { display_name?: string } };
    }>;
  };
  return (json.results ?? []).map(w => {
    const titulo = w.title ?? "";
    const autores = (w.authorships ?? []).slice(0, 4).map(a => a.author.display_name);
    const año = w.publication_year;
    const doiRaw = w.doi;
    const doi = doiRaw ? doiRaw.replace("https://doi.org/", "") : undefined;
    const revista = w.primary_location?.source?.display_name;
    return {
      titulo,
      autores,
      año,
      doi,
      url: doiRaw ?? undefined,
      revista,
      apa: buildApa(autores, año, titulo, revista, doi),
      proveedor: "OpenAlex",
    };
  });
}

// ─── Entry point principal ────────────────────────────────────

export async function buscarFuentesAcademicas(
  query: string,
  opciones?: { soloSemanticScholar?: boolean }
): Promise<DeepSearchOutput> {
  const t0 = Date.now();

  const tasks: Promise<FuenteAcademica[]>[] = [
    withTimeout(buscarSemanticScholar(query), TIMEOUT_MS).catch(() => []),
  ];

  if (!opciones?.soloSemanticScholar) {
    tasks.push(
      withTimeout(buscarCrossRef(query), TIMEOUT_MS).catch(() => []),
      withTimeout(buscarOpenAlex(query), TIMEOUT_MS).catch(() => [])
    );
  }

  const resultados = await Promise.allSettled(tasks);
  const todas: FuenteAcademica[] = [];
  const proveedoresUsados: string[] = [];

  for (const r of resultados) {
    if (r.status === "fulfilled" && r.value.length > 0) {
      todas.push(...r.value);
      if (r.value[0]) proveedoresUsados.push(r.value[0].proveedor);
    }
  }

  const fuentes = deduplicar(todas).slice(0, 12);

  return {
    query,
    fuentes,
    duracion_ms: Date.now() - t0,
    proveedores_usados: [...new Set(proveedoresUsados)],
  };
}

// ─── Builder de bloque para prompt ───────────────────────────

export function buildFuentesVerificadasBlock(output: DeepSearchOutput): string {
  if (!output.fuentes.length) return "";

  const lines: string[] = [
    "=== FUENTES ACADÉMICAS VERIFICADAS (usar como base bibliográfica) ===",
    `Búsqueda: "${output.query}" · ${output.fuentes.length} fuentes · [${output.proveedores_usados.join(", ")}]\n`,
  ];

  output.fuentes.forEach((f, i) => {
    lines.push(`[${i + 1}] ${f.apa}`);
    if (f.abstract) {
      lines.push(`    Resumen: ${f.abstract}`);
    }
  });

  lines.push(
    "",
    "INSTRUCCIÓN CRÍTICA: Cita ÚNICAMENTE las fuentes listadas arriba cuando menciones referencias.",
    "NO inventes autores, años ni títulos que no aparezcan en esta lista.",
    "=== FIN FUENTES VERIFICADAS ==="
  );

  return lines.join("\n");
}
