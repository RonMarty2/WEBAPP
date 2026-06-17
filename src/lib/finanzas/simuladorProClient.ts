export const SIMULADOR_PRO_FINANZAS_API_VERSION = "2026-06-17";

export interface SimuladorProFinanzasRequest {
  version?: string;
  proyecto: unknown;
  incluirSensibilidad?: boolean;
}

export interface SimuladorProFinanzasResponse {
  version: string;
  resultado: unknown;
  sensibilidad: unknown | null;
  warnings: string[];
}

export type SimuladorProFinanzasResult =
  | { ok: true; data: SimuladorProFinanzasResponse }
  | { ok: false; error: string; mockTemporal: boolean };

function endpointFinanzas(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL;
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/$/, "")}/api/finanzas/evaluar`;
}

/**
 * Cliente unico de WEBAPP para evaluar finanzas. WEBAPP no calcula VAN, TIR,
 * WACC, flujos ni sensibilidad: delega todo a simuladorPRO.
 *
 * Mientras no este configurada la URL publica de simuladorPRO, devuelve un
 * mock temporal SIN calculos para que la UI muestre pendiente de conexion.
 */
export async function evaluarFinanzasConSimuladorPro(
  request: SimuladorProFinanzasRequest
): Promise<SimuladorProFinanzasResult> {
  const endpoint = endpointFinanzas();
  if (!endpoint) {
    return {
      ok: false,
      mockTemporal: true,
      error:
        "MOCK_TEMPORAL: falta NEXT_PUBLIC_SIMULADOR_PRO_FINANZAS_URL. WEBAPP no ejecuta calculos financieros locales.",
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      version: request.version ?? SIMULADOR_PRO_FINANZAS_API_VERSION,
      proyecto: request.proyecto,
      incluirSensibilidad: request.incluirSensibilidad ?? true,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      mockTemporal: false,
      error: `simuladorPRO respondio ${response.status}`,
    };
  }

  return {
    ok: true,
    data: (await response.json()) as SimuladorProFinanzasResponse,
  };
}
