/**
 * Cálculo del tamaño de muestra — lógica pura (sin React).
 * Implementa la fórmula enseñada en la Academia (clase 5):
 *
 *   n = (N · Z² · p · q) / (e² · (N−1) + Z² · p · q)
 *
 * Para universo desconocido o "infinito" usa la fórmula sin corrección:
 *   n = (Z² · p · q) / e²
 */

/** Valor Z según nivel de confianza estándar. */
export const Z_POR_CONFIANZA: Record<number, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

export interface ParametrosMuestreo {
  universo: number | null; // N. null o 0 = universo desconocido/infinito
  confianza: number; // 90 | 95 | 99
  margenError: number; // en porcentaje, ej 5 = ±5%
  p?: number; // proporción esperada, default 0.5 (conservador)
}

export interface ResultadoMuestreo {
  n: number;
  Z: number;
  p: number;
  q: number;
  e: number;
  universoFinito: boolean;
}

export function calcularTamanoMuestra(params: ParametrosMuestreo): ResultadoMuestreo {
  const Z = Z_POR_CONFIANZA[params.confianza] ?? 1.96;
  const p = params.p ?? 0.5;
  const q = 1 - p;
  const e = params.margenError / 100;
  const N = params.universo ?? 0;
  const universoFinito = N > 0;

  let n: number;
  if (universoFinito) {
    const numerador = N * Z * Z * p * q;
    const denominador = e * e * (N - 1) + Z * Z * p * q;
    n = numerador / denominador;
  } else {
    n = (Z * Z * p * q) / (e * e);
  }

  return {
    n: Math.ceil(n),
    Z,
    p,
    q,
    e,
    universoFinito,
  };
}

/** Tipos de muestreo disponibles, con etiqueta y si es probabilístico. */
export const TIPOS_MUESTREO = [
  { id: 'aleatorio_simple', label: 'Aleatorio simple', probabilistico: true },
  { id: 'sistematico', label: 'Sistemático', probabilistico: true },
  { id: 'estratificado', label: 'Estratificado', probabilistico: true },
  { id: 'conglomerados', label: 'Por conglomerados', probabilistico: true },
  { id: 'conveniencia', label: 'Por conveniencia', probabilistico: false },
  { id: 'cuotas', label: 'Por cuotas', probabilistico: false },
  { id: 'bola_nieve', label: 'Bola de nieve', probabilistico: false },
] as const;

export function esProbabilistico(tipoId: string): boolean {
  return TIPOS_MUESTREO.find((t) => t.id === tipoId)?.probabilistico ?? false;
}
