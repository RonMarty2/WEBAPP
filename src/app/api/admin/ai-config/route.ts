import { NextResponse } from "next/server";
import {
  setProviderKey,
  getProviderKey,
  hasProviderKey,
  setServiceAIConfig,
  listServiceIncidents,
  hydrateAIConfigAsync,
  AI_PROVIDERS,
} from "@/lib/aiProvider";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";
import {
  dbSaveProviderKey,
  dbDeleteProviderKey,
  dbSaveServiceConfig,
} from "@/lib/db/aiConfig";

function maskKey(key: string): string {
  if (!key || key.length < 8) return key ? "********" : "";
  return key.slice(0, 6) + "**************" + key.slice(-4);
}

function isLikelyValidKeyForProvider(providerId: string, apiKey: string): boolean {
  const key = apiKey.trim();
  if (!key) return false;
  if (providerId === "openai") return key.startsWith("sk-");
  if (providerId === "groq") return key.startsWith("gsk_");
  if (providerId === "anthropic") return key.startsWith("sk-ant-");
  return true;
}

export async function GET() {
  // 1. Hidratar desde Supabase (fuente primaria). En Vercel serverless arranca
  //    con caches vacíos, esto los repuebla.
  await hydrateAIConfigAsync();

  // 2. Fallback: leer disco (dev local). En Vercel ephemeral suele estar vacío.
  const disk = loadFromDisk();
  const aiConfig = (disk as { aiConfig?: Record<string, unknown> }).aiConfig ?? {};
  const providerKeys = (aiConfig.providerKeys ?? {}) as Record<string, string>;
  for (const [pid, key] of Object.entries(providerKeys)) {
    if (key) setProviderKey(pid, key);
  }

  const serviceConfigs = (aiConfig.serviceConfigs ?? {}) as Record<
    string,
    { provider_id: string; model: string; api_key: string }
  >;
  for (const [sid, cfg] of Object.entries(serviceConfigs)) {
    setServiceAIConfig(sid, {
      ...cfg,
      api_key: providerKeys[cfg.provider_id] || cfg.api_key || "",
    });
  }

  const providers = AI_PROVIDERS.map((p) => ({
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
    api_key_masked: maskKey(providerKeys[cfg.provider_id] || cfg.api_key || ""),
  }));

  return NextResponse.json({ providers, services, incidents: listServiceIncidents() });
}

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
      const { provider_id, api_key } = body as { provider_id: string; api_key: string };
      if (!provider_id || !api_key) {
        return NextResponse.json({ error: "provider_id y api_key requeridos" }, { status: 400 });
      }
      if (!isLikelyValidKeyForProvider(provider_id, api_key)) {
        return NextResponse.json(
          {
            error:
              provider_id === "groq"
                ? "La key no parece de Groq (debe iniciar con gsk_)."
                : provider_id === "anthropic"
                  ? "La key no parece de Anthropic (debe iniciar con sk-ant-)."
                  : "La key no parece de OpenAI (debe iniciar con sk-).",
          },
          { status: 400 }
        );
      }
      setProviderKey(provider_id, api_key);
      aiConfig.providerKeys[provider_id] = api_key;
      disk.aiConfig = aiConfig as Record<string, unknown>;
      saveToDisk(disk);
      // 🌐 También persistimos en Supabase (la fuente que sobrevive a
      //    Vercel serverless). El disk save sigue siendo backup local.
      await dbSaveProviderKey(provider_id, api_key);
      return NextResponse.json({ ok: true, keyMasked: maskKey(api_key) });
    }

    if (body.type === "service_config") {
      const { servicio_id, provider_id, model } = body as {
        servicio_id: string;
        provider_id: string;
        model: string;
      };
      if (!servicio_id || !provider_id || !model) {
        return NextResponse.json({ error: "servicio_id, provider_id y model requeridos" }, { status: 400 });
      }
      const api_key = getProviderKey(provider_id);
      const cfg = { provider_id, model, api_key };
      setServiceAIConfig(servicio_id, cfg);
      aiConfig.serviceConfigs[servicio_id] = cfg;
      disk.aiConfig = aiConfig as Record<string, unknown>;
      saveToDisk(disk);
      // 🌐 Persistencia en Supabase.
      await dbSaveServiceConfig(servicio_id, provider_id, model);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "type debe ser 'provider_key' o 'service_config'" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { provider_id } = (await req.json()) as { provider_id: string };
    const disk = loadFromDisk();
    const aiConfig = ((disk as { aiConfig?: Record<string, unknown> }).aiConfig ?? {}) as {
      providerKeys?: Record<string, string>;
    };
    if (!aiConfig.providerKeys) aiConfig.providerKeys = {};
    delete aiConfig.providerKeys[provider_id];
    setProviderKey(provider_id, "");
    disk.aiConfig = aiConfig as Record<string, unknown>;
    saveToDisk(disk);
    // 🌐 Borrar también en Supabase.
    await dbDeleteProviderKey(provider_id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
