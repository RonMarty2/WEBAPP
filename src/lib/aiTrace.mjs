export function appendAITrace(memory = {}, entry = {}, limit = 20) {
  const previous = Array.isArray(memory.ai_trace) ? memory.ai_trace : [];
  const normalized = {
    id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    scope: entry.scope || "unknown",
    phase_id: entry.phase_id || null,
    phase_label: entry.phase_label || null,
    action: entry.action || "llamada_ia",
    provider_id: entry.provider_id || "",
    provider_name: entry.provider_name || entry.provider_id || "",
    model: entry.model || "",
    status: entry.status || "success",
    duration_ms: typeof entry.duration_ms === "number" ? entry.duration_ms : null,
    error: entry.error || null,
  };

  return {
    ...memory,
    ai_trace: [normalized, ...previous].slice(0, limit),
  };
}

export function latestAITrace(memory = {}) {
  const trace = Array.isArray(memory.ai_trace) ? memory.ai_trace : [];
  return trace[0] || null;
}
