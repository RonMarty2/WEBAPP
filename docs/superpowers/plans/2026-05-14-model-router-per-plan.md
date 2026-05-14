# Model Router Por Plan — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un `modelRouter` que selecciona proveedor + modelo de IA según la etapa académica (0-5) y el plan del usuario (demo/estandar/pro/elite), diferenciando calidad de salida por tier de pago.

**Architecture:** Se crea `src/lib/modelRouter.ts` como fuente única de verdad para la selección de modelo. Los endpoints `/api/generate` y `/api/projects/generate-phase` llaman a `llamarIAPorPlan()` en lugar de sus implementaciones inline actuales. Se reutiliza `llamarIAConConfig()` y `getProviderKey()` de `aiProvider.ts` sin modificar sus firmas.

**Tech Stack:** TypeScript estricto, Next.js App Router API routes, `llamarIAConConfig` (aiProvider.ts), proveedores ya catalogados: Groq, DeepSeek, Gemini, Anthropic.

---

## Mapa de archivos

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| **Crear** | `src/lib/modelRouter.ts` | Tabla fase×plan→modelo + función `llamarIAPorPlan()` |
| **Crear** | `src/lib/__tests__/modelRouter.test.ts` | Tests unitarios del router |
| **Modificar** | `src/types/database.ts` línea 29 | Agregar `"elite"` a `UserPlan` |
| **Modificar** | `src/app/api/generate/route.ts` | Reemplazar callGroq/callOpenAI inline con modelRouter |
| **Modificar** | `src/app/api/projects/generate-phase/route.ts` | Agregar parámetro `plan` y usar modelRouter |

## Variables de entorno necesarias (ya en providerKeyCache)

Las claves ya se cargan en `aiProvider.ts` líneas 324-336. Solo hay que configurarlas en `.env.local`:
- `DEEPSEEK_API_KEY` — ya soportada, solo falta el valor
- `GEMINI_API_KEY` — ya soportada, solo falta el valor

---

## Task 1: Extender UserPlan con "elite"

**Files:**
- Modify: `src/types/database.ts:29`

- [ ] **Step 1: Leer la línea actual**

```bash
grep -n "UserPlan" /home/user/WEBAPP/src/types/database.ts
```

Resultado esperado: `29  export type UserPlan = "estandar" | "pro";`

- [ ] **Step 2: Editar la línea**

Cambiar:
```typescript
export type UserPlan = "estandar" | "pro";
```
Por:
```typescript
export type UserPlan = "estandar" | "pro" | "elite";
```

- [ ] **Step 3: Verificar que el build de TypeScript no rompe nada**

```bash
cd /home/user/WEBAPP && npx tsc --noEmit 2>&1 | head -30
```

Resultado esperado: 0 errores (o los mismos errores pre-existentes, sin nuevos).

- [ ] **Step 4: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(types): agregar tier elite a UserPlan"
```

---

## Task 2: Crear modelRouter.ts

**Files:**
- Create: `src/lib/modelRouter.ts`
- Create: `src/lib/__tests__/modelRouter.test.ts`

- [ ] **Step 1: Escribir el test primero**

Crear `src/lib/__tests__/modelRouter.test.ts`:

```typescript
import {
  getModelConfig,
  getModelConfigForSection,
  normalizePlan,
  type PlanTier,
  type PhaseIndex,
} from "../modelRouter";

describe("getModelConfig", () => {
  it("demo → siempre Groq", () => {
    const cfg = getModelConfig(1, "demo");
    expect(cfg.provider).toBe("groq");
    expect(cfg.model).toBe("llama-3.3-70b-versatile");
  });

  it("estandar → siempre DeepSeek", () => {
    const cfg = getModelConfig(2, "estandar");
    expect(cfg.provider).toBe("deepseek");
    expect(cfg.model).toBe("deepseek-chat");
  });

  it("pro fase 2 (Cap. II) → Gemini Pro (contexto 1M)", () => {
    const cfg = getModelConfig(2, "pro");
    expect(cfg.provider).toBe("gemini");
    expect(cfg.model).toBe("gemini-2.5-pro");
  });

  it("pro fase 1 (Cap. I) → Claude Opus 4.7", () => {
    const cfg = getModelConfig(1, "pro");
    expect(cfg.provider).toBe("anthropic");
    expect(cfg.model).toBe("claude-opus-4-7");
  });

  it("elite tiene más maxTokens que pro en la misma fase", () => {
    const pro   = getModelConfig(1, "pro");
    const elite = getModelConfig(1, "elite");
    expect(elite.maxTokens).toBeGreaterThan(pro.maxTokens);
  });

  it("plan inválido cae a demo", () => {
    const cfg = getModelConfig(0, "inexistente" as PlanTier);
    expect(cfg.provider).toBe("groq");
  });
});

describe("getModelConfigForSection", () => {
  it("marco_teorico → fase 2", () => {
    const cfg = getModelConfigForSection("marco_teorico", "pro");
    expect(cfg.provider).toBe("gemini");
  });

  it("titulo → fase 0", () => {
    const cfg = getModelConfigForSection("titulo", "pro");
    expect(cfg.provider).toBe("gemini");
    expect(cfg.model).toBe("gemini-2.5-flash");
  });
});

describe("normalizePlan", () => {
  it("standard → estandar", () => {
    expect(normalizePlan("standard")).toBe("estandar");
  });

  it("estandar → estandar", () => {
    expect(normalizePlan("estandar")).toBe("estandar");
  });

  it("plan desconocido → demo", () => {
    expect(normalizePlan("vip" as PlanTier)).toBe("demo");
  });
});
```

- [ ] **Step 2: Ejecutar el test para confirmar que falla**

```bash
cd /home/user/WEBAPP && npx jest src/lib/__tests__/modelRouter.test.ts --no-coverage 2>&1 | tail -20
```

Resultado esperado: `Cannot find module '../modelRouter'` o similar (falla por módulo inexistente — correcto).

- [ ] **Step 3: Crear src/lib/modelRouter.ts**

```typescript
// src/lib/modelRouter.ts
// Selección de proveedor + modelo según etapa académica y plan del usuario.
// Solo importar desde API routes (servidor). Nunca desde componentes cliente.

import { llamarIAConConfig, getProviderKey } from "@/lib/aiProvider";

export type PlanTier = "demo" | "standard" | "estandar" | "pro" | "elite";

export interface ModelConfig {
  provider: string;
  model: string;
  maxTokens: number;
}

export interface AIRouteResult {
  text: string;
  provider: string;
  model: string;
}

// Fases 0-5 corresponden a las etapas del documento académico:
// 0 = propuesta de tema, 1 = Cap.I, 2 = Cap.II, 3 = Cap.III, 4 = Cap.IV, 5 = Cap.V+Biblio
export type PhaseIndex = 0 | 1 | 2 | 3 | 4 | 5;

// Section keys del endpoint /api/generate (flujo monografia clásico)
export type SectionKey =
  | "titulo" | "resumen" | "introduccion" | "planteamiento" | "objetivos"
  | "marco_teorico" | "metodologia" | "resultados" | "conclusiones" | "bibliografia";

const SECTION_TO_PHASE: Record<SectionKey, PhaseIndex> = {
  titulo:        0,
  resumen:       0,
  introduccion:  1,
  planteamiento: 1,
  objetivos:     1,
  marco_teorico: 2,
  metodologia:   3,
  resultados:    4,
  conclusiones:  5,
  bibliografia:  5,
};

type PhaseMap = Record<PhaseIndex, ModelConfig>;

const DEMO: PhaseMap = {
  0: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  1: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  2: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  3: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  4: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
  5: { provider: "groq", model: "llama-3.3-70b-versatile", maxTokens: 2048 },
};

const ESTANDAR: PhaseMap = {
  0: { provider: "deepseek", model: "deepseek-chat", maxTokens: 3000 },
  1: { provider: "deepseek", model: "deepseek-chat", maxTokens: 4096 },
  2: { provider: "deepseek", model: "deepseek-chat", maxTokens: 4096 },
  3: { provider: "deepseek", model: "deepseek-chat", maxTokens: 4096 },
  4: { provider: "deepseek", model: "deepseek-chat", maxTokens: 4096 },
  5: { provider: "deepseek", model: "deepseek-chat", maxTokens: 4096 },
};

const PRO: PhaseMap = {
  0: { provider: "gemini",    model: "gemini-2.5-flash", maxTokens: 3000  },
  1: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
  2: { provider: "gemini",    model: "gemini-2.5-pro",   maxTokens: 8192  },
  3: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
  4: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
  5: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 8192  },
};

const ELITE: PhaseMap = {
  0: { provider: "gemini",    model: "gemini-2.5-flash", maxTokens: 4096  },
  1: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
  2: { provider: "gemini",    model: "gemini-2.5-pro",   maxTokens: 12000 },
  3: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
  4: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
  5: { provider: "anthropic", model: "claude-opus-4-7",  maxTokens: 12000 },
};

const PLAN_MAP: Partial<Record<PlanTier, PhaseMap>> = {
  demo:     DEMO,
  standard: ESTANDAR, // alias legacy de /api/generate
  estandar: ESTANDAR,
  pro:      PRO,
  elite:    ELITE,
};

/** Normaliza nombres de plan legacy ("standard") al canónico ("estandar"). Planes desconocidos → "demo". */
export function normalizePlan(plan: string): PlanTier {
  if (plan === "standard") return "estandar";
  if (plan in PLAN_MAP) return plan as PlanTier;
  return "demo";
}

/** Devuelve la configuración de modelo para una fase y plan dados. */
export function getModelConfig(phase: PhaseIndex, plan: PlanTier): ModelConfig {
  return PLAN_MAP[plan]?.[phase] ?? DEMO[0];
}

/** Devuelve la configuración de modelo para un section_key del flujo /api/generate. */
export function getModelConfigForSection(sectionKey: SectionKey, plan: PlanTier): ModelConfig {
  const phase = SECTION_TO_PHASE[sectionKey] ?? 0;
  return getModelConfig(phase, plan);
}

/**
 * Llama a la IA eligiendo proveedor y modelo según fase y plan.
 * Si el proveedor preferido no tiene API key configurada, hace fallback
 * a la cadena clásica (Groq → Anthropic → OpenAI).
 */
export async function llamarIAPorPlan(
  system: string,
  user: string,
  phase: PhaseIndex,
  plan: PlanTier,
): Promise<AIRouteResult> {
  const cfg = getModelConfig(phase, normalizePlan(plan));
  const apiKey = getProviderKey(cfg.provider);

  if (apiKey) {
    const text = await llamarIAConConfig(cfg.provider, cfg.model, apiKey, system, user, cfg.maxTokens);
    return { text, provider: cfg.provider, model: cfg.model };
  }

  // Fallback a cadena clásica si el proveedor preferido no tiene key
  const fallback: { id: string; model: string }[] = [
    { id: "groq",      model: "llama-3.3-70b-versatile"   },
    { id: "anthropic", model: "claude-haiku-4-5-20251001" },
    { id: "openai",    model: "gpt-4o-mini"               },
  ];

  const errors: string[] = [`${cfg.provider}: API key no configurada`];
  for (const { id, model } of fallback) {
    const key = getProviderKey(id);
    if (!key) continue;
    try {
      const text = await llamarIAConConfig(id, model, key, system, user, cfg.maxTokens);
      return { text, provider: id, model };
    } catch (e) {
      errors.push(`${id}: ${(e as Error).message}`);
    }
  }
  throw new Error(`Ningún proveedor disponible para plan ${plan} fase ${phase}. ${errors.join(" | ")}`);
}
```

- [ ] **Step 4: Ejecutar los tests para confirmar que pasan**

```bash
cd /home/user/WEBAPP && npx jest src/lib/__tests__/modelRouter.test.ts --no-coverage 2>&1 | tail -30
```

Resultado esperado:
```
PASS src/lib/__tests__/modelRouter.test.ts
  getModelConfig
    ✓ demo → siempre Groq
    ✓ estandar → siempre DeepSeek
    ✓ pro fase 2 (Cap. II) → Gemini Pro (contexto 1M)
    ✓ pro fase 1 (Cap. I) → Claude Opus 4.7
    ✓ elite tiene más maxTokens que pro en la misma fase
    ✓ plan inválido cae a demo
  getModelConfigForSection
    ✓ marco_teorico → fase 2
    ✓ titulo → fase 0
  normalizePlan
    ✓ standard → estandar
    ✓ estandar → estandar
    ✓ plan desconocido → demo
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /home/user/WEBAPP && npx tsc --noEmit 2>&1 | head -20
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 6: Commit**

```bash
git add src/lib/modelRouter.ts src/lib/__tests__/modelRouter.test.ts
git commit -m "feat(ai): crear modelRouter — selección de modelo por etapa y plan"
```

---

## Task 3: Refactorizar /api/generate/route.ts

**Files:**
- Modify: `src/app/api/generate/route.ts`

El objetivo es reemplazar las funciones inline `callGroq` y `callOpenAI` por `llamarIAPorPlan` del modelRouter.

- [ ] **Step 1: Verificar imports actuales del archivo**

```bash
head -15 /home/user/WEBAPP/src/app/api/generate/route.ts
```

Resultado esperado: imports de `next/server` y `@/lib/data` (sin llamarIA ni aiProvider).

- [ ] **Step 2: Reemplazar el bloque de funciones inline**

En `src/app/api/generate/route.ts`, eliminar las funciones `callGroq` y `callOpenAI` (líneas ~27-80) y agregar el import del modelRouter al inicio del archivo.

Bloque a **ELIMINAR** (funciones que van de `async function callGroq` hasta el cierre de `callOpenAI`):
```typescript
async function callGroq(prompt: string, userMessage: string, model: string): Promise<string> {
  // ... todo este bloque
}

async function callOpenAI(prompt: string, userMessage: string, model: string): Promise<string> {
  // ... todo este bloque
}
```

Bloque a **AGREGAR** al inicio (después del import de next/server):
```typescript
import {
  llamarIAPorPlan,
  getModelConfigForSection,
  normalizePlan,
  type PlanTier,
  type SectionKey,
  type PhaseIndex,
} from "@/lib/modelRouter";
```

- [ ] **Step 3: Reemplazar la sección de selección de modelo y llamada a IA**

Localizar el bloque que actualmente hace:
```typescript
// Select model based on plan
const modelMap: Record<string, string> = {
  demo: promptConfig.model_demo,
  standard: promptConfig.model_standard,
  pro: promptConfig.model_pro,
};
const model = modelMap[plan] || promptConfig.model_demo;
```

Y más abajo:
```typescript
let generatedText: string;
try {
  generatedText = await callGroq(systemPrompt, userMessage, model);
} catch (groqError) {
  if (apiKeysStore.openai) {
    generatedText = await callOpenAI(systemPrompt, userMessage, "gpt-4o-mini");
  } else {
    throw groqError;
  }
}
```

Reemplazarlo por:
```typescript
// Enrutar según plan y sección → proveedor + modelo correctos
const planTier = normalizePlan(plan || "demo");
const sectionKeyTyped = section_key as SectionKey;
// Determinar fase desde la sección para elegir el modelo correcto
const sectionPhaseMap: Record<string, PhaseIndex> = {
  titulo: 0, resumen: 0,
  introduccion: 1, planteamiento: 1, objetivos: 1,
  marco_teorico: 2,
  metodologia: 3,
  resultados: 4,
  conclusiones: 5, bibliografia: 5,
};
const phase = (sectionPhaseMap[section_key] ?? 0) as PhaseIndex;

const { text: generatedText, provider: usedProvider, model: usedModel } =
  await llamarIAPorPlan(systemPrompt, userMessage, phase, planTier);
```

- [ ] **Step 4: Actualizar el objeto de respuesta para incluir proveedor usado**

Localizar:
```typescript
return NextResponse.json({
  text: generatedText,
  section_key,
  credits_remaining: remainingCredits,
});
```

Reemplazar por:
```typescript
return NextResponse.json({
  text: generatedText,
  section_key,
  credits_remaining: remainingCredits,
  _meta: { provider: usedProvider, model: usedModel },
});
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /home/user/WEBAPP && npx tsc --noEmit 2>&1 | grep "generate/route" | head -10
```

Resultado esperado: sin errores en ese archivo.

- [ ] **Step 6: Test de integración manual**

```bash
curl -s -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"section_key":"titulo","plan":"demo","userId":"test-1","programa":"Administración","modulos":"Gestión","interes":"educación"}' \
  | jq '{section_key, _meta}'
```

Resultado esperado:
```json
{
  "section_key": "titulo",
  "_meta": { "provider": "groq", "model": "llama-3.3-70b-versatile" }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "refactor(generate): usar modelRouter en lugar de callGroq/callOpenAI inline"
```

---

## Task 4: Refactorizar /api/projects/generate-phase/route.ts

**Files:**
- Modify: `src/app/api/projects/generate-phase/route.ts`

- [ ] **Step 1: Leer el archivo completo para entender cómo llama a la IA actualmente**

```bash
cat -n /home/user/WEBAPP/src/app/api/projects/generate-phase/route.ts
```

Identificar:
- Cómo obtiene el `plan` del usuario (¿desde el JWT? ¿desde la BD?)
- Cómo llama a `llamarIA` actualmente (¿con servicioId? ¿sin él?)
- Qué fase recibe como parámetro (`estado_fase`, `phase_index`, u otro nombre)

- [ ] **Step 2: Agregar import de modelRouter**

Al inicio del archivo, agregar:
```typescript
import {
  llamarIAPorPlan,
  normalizePlan,
  type PlanTier,
  type PhaseIndex,
} from "@/lib/modelRouter";
```

- [ ] **Step 3: Obtener el plan del usuario en el handler POST**

Localizar donde se obtiene el usuario (ej. `const { user } = await requireAuth()`).
Después, extraer el plan:
```typescript
// user.plan viene del JWT o del perfil en BD
const planTier = normalizePlan((user as { plan?: string }).plan ?? "demo");
```

Si el objeto `user` no tiene el campo `plan`, buscarlo en `src/lib/auth.ts` para confirmar qué campos incluye el JWT, y ajustar el acceso al campo correspondiente.

- [ ] **Step 4: Reemplazar la llamada a llamarIA con llamarIAPorPlan**

Localizar el bloque actual de llamada a IA. Típicamente se ve así:
```typescript
const result = await llamarIA(systemPrompt, userMessage, maxTokens, servicioId);
```

Reemplazar por:
```typescript
const phaseIndex = (body.phase_index ?? proyecto.estado_fase ?? 0) as PhaseIndex;
const result = await llamarIAPorPlan(systemPrompt, userMessage, phaseIndex, planTier);
```

Nota: mantener `llamarIA` con servicioId como alternativa si el administrador tiene configuración custom para ese servicio (prioridad admin > plan del usuario).

El bloque completo debería quedar así:
```typescript
// Si el admin configuró un proveedor específico para este servicio, usarlo (mayor prioridad).
// Si no, usar el modelo que corresponde al plan del usuario.
let aiResult: { text: string; provider: string; model: string };

const servicioId = proyecto.servicio_id;
const { getServiceAIConfig } = await import("@/lib/aiProvider");
const adminCfg = getServiceAIConfig(servicioId);

if (adminCfg?.api_key) {
  // Admin override: usar config del panel Admin → Modelos & APIs
  const { llamarIA } = await import("@/lib/aiProvider");
  const text = await llamarIA(systemPrompt, userMessage, adminCfg.model.length, servicioId)
    .then(r => r.text);
  aiResult = { text, provider: adminCfg.provider_id, model: adminCfg.model };
} else {
  // Ruta por plan del usuario
  aiResult = await llamarIAPorPlan(systemPrompt, userMessage, phaseIndex, planTier);
}
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd /home/user/WEBAPP && npx tsc --noEmit 2>&1 | grep "generate-phase" | head -10
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 6: Test de integración (con servidor corriendo)**

Crear un proyecto demo en `/dashboard`, avanzar a fase 1, confirmar que el log del servidor muestra el proveedor correcto según el plan.

En la terminal del servidor Next.js se debería ver algo como:
```
[AI] provider=deepseek model=deepseek-chat phase=1 plan=estandar
```

(Esto requiere que el servidor esté corriendo con `npm run dev`.)

- [ ] **Step 7: Commit**

```bash
git add src/app/api/projects/generate-phase/route.ts
git commit -m "refactor(generate-phase): enrutar modelo por plan y fase usando modelRouter"
```

---

## Task 5: Documentar variables de entorno

**Files:**
- Modify: `.env.local` (o `.env.example` si existe)

- [ ] **Step 1: Verificar qué archivo de env existe**

```bash
ls /home/user/WEBAPP/.env* 2>/dev/null
```

- [ ] **Step 2: Agregar las claves faltantes al archivo de env de ejemplo**

Si existe `.env.example`, agregar:
```bash
# ── Proveedores IA (además de Groq/OpenAI/Anthropic ya configurados) ──────────
# DeepSeek — Plan Estándar (Bs. 150). Obtener en: https://platform.deepseek.com
DEEPSEEK_API_KEY=

# Google Gemini — Plan Pro y Elite (Bs. 300/500+). Obtener en: https://aistudio.google.com
GEMINI_API_KEY=
```

Si no existe `.env.example`, agregar los comentarios al `.env.local` existente.

- [ ] **Step 3: Verificar que las keys se cargan en aiProvider**

```bash
grep -n "DEEPSEEK_API_KEY\|GEMINI_API_KEY" /home/user/WEBAPP/src/lib/aiProvider.ts
```

Resultado esperado (confirmación de que ya están):
```
331:  ["deepseek",  process.env.DEEPSEEK_API_KEY  ?? ""],
329:  ["gemini",    process.env.GEMINI_API_KEY    ?? ""],
```

- [ ] **Step 4: Commit**

```bash
git add .env.example  # o .env.local si no hay .env.example
git commit -m "docs(env): documentar DEEPSEEK_API_KEY y GEMINI_API_KEY para planes pro/elite"
```

---

## Self-Review

### Spec coverage
| Requisito | Tarea |
|-----------|-------|
| Selección de modelo por etapa | Task 2 — `getModelConfig(phase, plan)` |
| Selección de modelo por plan | Task 2 — tabla DEMO/ESTANDAR/PRO/ELITE |
| Plan elite nuevo | Task 1 — UserPlan + Task 2 — ELITE map |
| DeepSeek como proveedor Estándar | Task 2 — ESTANDAR usa deepseek-chat |
| Gemini 2.5 Pro para Cap. II (RAG) | Task 2 — PRO[2] = gemini-2.5-pro |
| Refactorizar /api/generate | Task 3 |
| Refactorizar /api/generate-phase | Task 4 |
| Fallback a cadena clásica si key falta | Task 2 — `llamarIAPorPlan` tiene fallback |
| Admin override mantiene prioridad | Task 4 Step 4 — servicioId config tiene prioridad |
| Variables de entorno documentadas | Task 5 |

### Placeholder scan
- Ningún step dice "implementar según contexto" o "agregar validación apropiada"
- Todos los steps tienen código exacto o comandos exactos
- Task 4 Step 1 requiere leer el archivo primero porque no fue explorado — correcto, no es un placeholder

### Type consistency
- `PhaseIndex = 0 | 1 | 2 | 3 | 4 | 5` — consistente en Tasks 2, 3 y 4
- `PlanTier` incluye "standard" como alias — consistente con lo que envía `/api/generate`
- `normalizePlan()` garantiza que "standard" nunca llegue a la tabla PLAN_MAP como clave ambigua
- `llamarIAPorPlan` devuelve `AIRouteResult { text, provider, model }` — consistente en Tasks 3 y 4
