/**
 * Análisis univariado de respuestas — lógica pura (sin React).
 * Tabula cada pregunta según su tipo (clases 9 y 10 de la academia).
 */
import type { TipoPregunta } from '@/types/mercados';

export interface PreguntaParaAnalisis {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  opciones: string[];
}

/** Una respuesta cruda: { preguntaId: valor }. valor = string | string[]. */
export type RespuestaCruda = Record<string, string | string[]>;

export interface ConteoOpcion {
  opcion: string;
  n: number;
  pct: number; // 0-100
}

export interface StatsNumericas {
  n: number;
  promedio: number;
  mediana: number;
  min: number;
  max: number;
}

export type ResultadoPregunta =
  | { tipo: 'categorica'; total: number; conteos: ConteoOpcion[] }
  | { tipo: 'numerica'; stats: StatsNumericas | null }
  | { tipo: 'abierta'; respuestas: string[] };

function mediana(nums: number[]): number {
  if (nums.length === 0) return 0;
  const ord = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(ord.length / 2);
  return ord.length % 2 ? ord[mid] : (ord[mid - 1] + ord[mid]) / 2;
}

export function analizarPregunta(
  pregunta: PreguntaParaAnalisis,
  respuestas: RespuestaCruda[]
): ResultadoPregunta {
  const valores = respuestas
    .map((r) => r[pregunta.id])
    .filter((v) => v !== undefined && v !== '');

  // NUMÉRICA → estadísticas
  if (pregunta.tipo === 'numerica') {
    const nums = valores
      .map((v) => parseFloat(String(v)))
      .filter((n) => Number.isFinite(n));
    if (nums.length === 0) return { tipo: 'numerica', stats: null };
    return {
      tipo: 'numerica',
      stats: {
        n: nums.length,
        promedio: nums.reduce((a, b) => a + b, 0) / nums.length,
        mediana: mediana(nums),
        min: Math.min(...nums),
        max: Math.max(...nums),
      },
    };
  }

  // ABIERTA → lista de textos
  if (pregunta.tipo === 'abierta') {
    return { tipo: 'abierta', respuestas: valores.map((v) => String(v)) };
  }

  // CATEGÓRICAS (única / múltiple / likert / escala) → conteo por opción
  const conteo = new Map<string, number>();
  // Inicializar con las opciones definidas (para mostrar 0 en las no elegidas)
  for (const op of pregunta.opciones) conteo.set(op, 0);

  let totalRespuestas = 0;
  for (const v of valores) {
    if (Array.isArray(v)) {
      // opción múltiple: cada selección cuenta
      for (const sel of v) conteo.set(sel, (conteo.get(sel) ?? 0) + 1);
      if (v.length > 0) totalRespuestas++;
    } else {
      conteo.set(String(v), (conteo.get(String(v)) ?? 0) + 1);
      totalRespuestas++;
    }
  }

  // Para % usamos el total de respuestas (en múltiple los % pueden sumar >100)
  const base = totalRespuestas || 1;
  const conteos: ConteoOpcion[] = Array.from(conteo.entries()).map(([opcion, n]) => ({
    opcion,
    n,
    pct: Math.round((n / base) * 100),
  }));

  return { tipo: 'categorica', total: totalRespuestas, conteos };
}
