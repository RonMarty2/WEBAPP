declare module "@/lib/aiTrace.mjs" {
  export interface AITraceEntry {
    id: string;
    timestamp: string;
    scope: string;
    phase_id: string | null;
    phase_label: string | null;
    action: string;
    provider_id: string;
    provider_name: string;
    model: string;
    status: "success" | "error" | "fallback";
    duration_ms: number | null;
    error: string | null;
  }

  export function appendAITrace(
    memory?: Record<string, unknown>,
    entry?: Partial<AITraceEntry>,
    limit?: number
  ): Record<string, unknown> & { ai_trace: AITraceEntry[] };

  export function latestAITrace(memory?: Record<string, unknown>): AITraceEntry | null;
}
