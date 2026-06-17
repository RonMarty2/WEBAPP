# Pendientes — Todo se hace desde el navegador, sin instalar nada

> GitHub Actions despliega la Edge Function automáticamente.
> Solo hay 4 acciones manuales, todas en el navegador.

---

## ACCIÓN 1 — Agregar 2 secrets en GitHub (simuladorPRO)

Ir a: https://github.com/RonMarty2/simuladorPRO/settings/secrets/actions

Click **New repository secret** y agregar estos dos:

| Nombre | Valor |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Tu token de Supabase → conseguirlo en https://supabase.com/dashboard/account/tokens → **Generate new token** |
| `SUPABASE_PROJECT_REF` | `syfbgauvictgykdptamb` |

---

## ACCIÓN 2 — Agregar el secret WEBAPP_API_KEY en Supabase (simuladorPRO)

Ir a: https://supabase.com/dashboard/project/syfbgauvictgykdptamb/settings/vault

Click **New secret** y agregar:

| Nombre | Valor |
|---|---|
| `WEBAPP_API_KEY` | `_RjDBe0cYazoqIHPX073KOHg0osP8IUgqidID3IIuHdySuH2ouv3RFnb9h31A41M` |

> Esta es la clave compartida que WEBAPP usa para autenticarse con simuladorPRO.
> El mismo valor ya está en `.env.local` de WEBAPP como `SIMULADOR_PRO_API_KEY`.

---

## ACCIÓN 3 — Ejecutar la migración SQL en WEBAPP

Ir a: https://supabase.com/dashboard/project/svaswbryumacbirecvjt/sql/new

Abrir el archivo `WEBAPP/supabase/migrations-maestro/003_cerebros_externos.sql`,
copiar todo el contenido, pegarlo ahí y click **Run**.

Debe decir: `Success. No rows returned` ✅

---

## ACCIÓN 4 — Agregar 2 variables en Vercel (WEBAPP)

Ir a tu proyecto WEBAPP en Vercel → **Settings → Environment Variables**

Agregar las dos marcando Production + Preview + Development:

| Variable | Valor |
|---|---|
| `SIMULADOR_PRO_ARTIFACT_URL` | `https://syfbgauvictgykdptamb.supabase.co/functions/v1/export-artifact` |
| `SIMULADOR_PRO_API_KEY` | `_RjDBe0cYazoqIHPX073KOHg0osP8IUgqidID3IIuHdySuH2ouv3RFnb9h31A41M` |

Luego click **Redeploy** en la última deployment.

---

## Después de estas 4 acciones: hacer los commits

Todo el código nuevo ya está en tu carpeta local. Solo hay que subirlo a GitHub.
Desde VS Code → Source Control (Ctrl+Shift+G):

**simuladorPRO** — commit con:
- `supabase/functions/export-artifact/` (la Edge Function)
- `.github/workflows/deploy-edge-functions.yml` (el CI que la despliega)

**WEBAPP** — commit con:
- `docs/ecosistema/` (bitácoras)
- `src/app/api/maestro/[id]/vincular-cerebro-externo/`
- `supabase/migrations-maestro/003_cerebros_externos.sql`
- `src/lib/maestro/contexto.ts`
- `.env.local`

**C0.Cerebro_contrato** — commit con:
- `src/index.ts`

---

## Flujo automático después del push

```
Vos haces push a main en simuladorPRO
        ↓
GitHub Actions corre automáticamente
        ↓
Supabase CLI despliega export-artifact
        ↓
Edge Function live en 2 minutos ✅
```

Para WEBAPP, el workflow que ya tenés (`vercel-auto-deploy.yml`) hace el deploy a Vercel automáticamente.

---

## Resumen

| # | Dónde | Tiempo est. |
|---|---|---|
| 1 | GitHub secrets (simuladorPRO) | 3 min |
| 2 | Supabase Vault (simuladorPRO) | 2 min |
| 3 | Supabase SQL Editor (WEBAPP) | 2 min |
| 4 | Vercel env vars (WEBAPP) | 3 min |
| 5 | Commit + push desde VS Code | 5 min |
| **Total** | | **~15 min** |
