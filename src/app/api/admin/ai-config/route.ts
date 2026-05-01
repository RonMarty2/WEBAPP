/**
 * GET  /api/admin/ai-config  — Devuelve configuraciones de IA (keys enmascaradas)
 * POST /api/admin/ai-config  — Guarda configuración (provider key o service mapping)
 */

import { NextResponse } from "next/server";
import { setProviderKey, getProviderKey, hasProviderKey, setServiceAIConfig, getServiceAIConfig, AI_PROVIDERS } from "@/lib/aiProvider";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";

function maskKey(key: string): string {
  if (!key || key.length < 8) return key ? "••••••••" : "";
  return key.slice(0, 6) + "••••••••••••••" + key.slice(-4);
}

// GET — devuelve estado de todos los proveedores + configs de servicios
export async function GET() {
  // Load persisted config
  const disk = loadFromDisk();
  const aiConfig = (disk as { aiConfig?: Record<string, unknown> }).aiConfig ?? {};

  // Restore provider keys from disk
  const providerKeys = (aiConfig.providerKeys ?? {}) as Record<string, string>;
  for (const [pid, key] of Object.entries(providerKeys)) {
    if (key) setProviderKey(pid, key);
  }

  // Restore service configs from disk
  const serviceConfigs = (aiConfig.serviceConfigs ?? {}) as Record<string, { provider_id: string; model: string; api_key: string }>;
  for (const [sid, cfg] of Object.entries(serviceConfigs)) {
    setServiceAIConfig(sid, cfg);
  }

  // Return status (with masked keys)
  const providers = AI_PROVIDERS.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    apiDocsUrl: p.apiDocsUrl,
    models: p.models,
    defaultModel: p.defaultModel,
    configured: hasProviderKey(p.id),
    keyMasked: maskKey(getProviderKey(p.id)),
  }));

  const services = Object.entries(serviceConfigs).map(([sid, cfg]) => ({
    servicio_id: sid,
    provider_id: cfg.provider_id,
    model: cfg.model,
    api_key_masked: maskKey(cfg.api_key),
  }));

  return NextResponse.json({ providers, services });
}

// POST — guarda provider key o service mapping
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const disk = loadFromDisk();
    const aiConfig = ((disk as { aiConfig?: Record<string, unknown> }).aiConfig ?? {}) as {
      providerKeys?: Record<string, string>;
      serviceConfigs?: Record<string, { provider_id: string; model: string; api_key: string }>;
    };
    if (!aiConfig.providerKeys) aiConfig.providerKeys = {};
    if (!aiConfig.serviceConfigs) aiConfig.serviceConfigs = {};

    if (body.type === "provider_key") {
      // Save API key for a provider
      const { provider_id, api_key } = body as { provider_id: string; api_key: string };
      if (!provider_id || !api_key) {
        return NextResponse.json({ error: "provider_id y api_key requeridos" }, { status: 400 });
      }
      setProviderKey(provider_id, api_key);
      aiConfig.providerKeys[provider_id] = api_key;
      disk.aiConfig = aiConfig as Record<string, unknown>;
      saveToDisk(disk);
      return NextResponse.json({ ok: true, keyMasked: maskKey(api_key) });
    }

    if (body.type === "service_config") {
      // Configure which provider+model a service uses
      const { servicio_id, provider_id, model } = body as { servicio_id: string; provider_id: string; model: string };
      if (!servicio_id || !provider_id || !model) {
        return NextResponse.json({ error: "servicio_id, provider_id y model requeridos" }, { status: 400 });
      }
      // Use the stored provider key for this provider
      const api_key = getProviderKey(provider_id);
      const cfg = { provider_id, model, api_key };
      setServiceAIConfig(servicio_id, cfg);
      aiConfig.serviceConfigs[servicio_id] = cfg;
      disk.aiConfig = aiConfig as Record<string, unknown>;
      saveToDisk(disk);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "type debe ser 'provider_key' o 'service_config'" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { provider_id } = await req.json() as { provider_id: string };
    const disk = loadFromDisk();
    const aiConfig = ((disk as { aiConfig?: Record<string, unknown> }).aiConfig ?? {}) as {
      providerKeys?: Record<string, string>;
    };
    if (!aiConfig.providerKeys) aiConfig.providerKeys = {};
    delete aiConfig.providerKeys[provider_id];
    setProviderKey(provider_id, "");
    disk.aiConfig = aiConfig as Record<string, unknown>;
    saveToDisk(disk);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
