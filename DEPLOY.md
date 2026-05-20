# Guía de Deploy — Laboratorio Académico PRO

> **TL;DR:** seguí los 4 pasos en orden y la app queda online y persistente en ~30 min.

---

## Pre-requisitos

- ✅ Cuenta en [Vercel](https://vercel.com) (ya la tenés)
- ✅ Cuenta en [Supabase](https://supabase.com) — proyecto `svaswbryumacbirecvjt` ya creado
- ✅ Repo en GitHub conectado a Vercel
- 🔲 Cuenta en [Google Cloud Console](https://console.cloud.google.com) (solo si querés login con Google)
- 🔲 API keys de los proveedores IA que vas a usar (mínimo Groq)

---

## Paso 1 — Conectar Supabase real (5 min)

> Hoy `.env.local` tiene placeholders (`https://your-project.supabase.co`). Mientras eso siga así, los proyectos de los estudiantes viven en memoria y se pierden al reiniciar el server.

### 1.1 Crear el schema en Supabase

1. Abrí: https://supabase.com/dashboard/project/svaswbryumacbirecvjt/sql/new
2. Abrí el archivo [`supabase_full_setup.sql`](./supabase_full_setup.sql) en tu editor.
3. Copiá TODO el contenido y pegalo en el SQL Editor de Supabase.
4. Click **Run** (Ctrl+Enter).
5. Al final debería listar 9 tablas (`usuarios`, `proyectos`, `error_logs`, etc.).

> 💡 El archivo es idempotente: lo podés correr varias veces sin romper nada.

### 1.2 Obtener las 2 keys

1. En Supabase: **Settings → API**
2. Copiá:
   - **Project URL** (ya lo conocés: `https://svaswbryumacbirecvjt.supabase.co`)
   - **anon public** (key pública, se expone al cliente)
   - **service_role** (key SECRETA, bypassea RLS)

### 1.3 Conectar local

```powershell
node scripts/setup-supabase.mjs --anon "eyJ..." --service "eyJ..."
```

Esto:
- Escribe las 3 vars en `.env.local`
- Hace un test de conexión con la tabla `proyectos`
- Te dice si pudo leer la tabla

Si todo OK: `Ctrl+C` el dev server y `npm run dev` de nuevo.

---

## Paso 2 — Pegar variables de entorno en Vercel (10 min)

### 2.1 Abrir panel de env vars

Vercel Dashboard → tu proyecto → **Settings** → **Environment Variables**

### 2.2 Pegar TODAS las variables

Abrí [`.env.vercel.template`](./.env.vercel.template) y pegá una por una. Las **CRÍTICAS** (rojas) son:

| Variable | Valor sugerido |
|---|---|
| `GROQ_API_KEY` | Tu key de https://console.groq.com/keys |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |
| `ADMIN_PASSWORD` | Random fuerte. NO usar `admin1234` |
| `ADMIN_JWT_SECRET` | Random fuerte (puede ser igual o distinto de AUTH_SECRET) |
| `ADMIN_EMAILS` | Tu email (separados por coma si son varios) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://svaswbryumacbirecvjt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La anon key del paso 1.2 |
| `SUPABASE_SERVICE_ROLE_KEY` | La service_role key del paso 1.2 |

Para cada una, en el dropdown de Environments marcá: ✅ Production, ✅ Preview, ✅ Development.

### 2.3 (Opcional) Pegar los fallbacks IA

Si tenés keys de Anthropic, OpenAI, Gemini, etc., pegalas también. Sin ellas, si Groq falla el sistema le tira error amigable al usuario.

### 2.4 Redeploy

Tras pegar todo: **Deployments** → última deploy → ⋯ → **Redeploy** → **Redeploy without cache**.

---

## Paso 3 — Verificar que el build pase en Vercel (3 min)

El último intento de deploy falló por **imports rotos de `react-pdf` CSS**. Este PR ya lo arregla (vendorea los CSS en `src/styles/react-pdf/`).

Después del redeploy, verificá:

1. **Build logs** verdes (sin errores `Module not found`)
2. **Functions** todas listadas (debería ver `/api/projects/generate-phase` con `60s timeout`, etc.)
3. Visitar la URL pública. Deberías ver la landing.
4. Click "Entrar como estudiante demo" → debería entrar al dashboard.

> Si el build falla, revisar los logs de Vercel. El error más común es una env var faltante.

---

## Paso 4 — (Opcional) Google OAuth para producción (15 min)

Mientras no lo configures, solo funciona el botón **demo login**.

### 4.1 Crear OAuth Client ID en Google Cloud Console

1. Ir a https://console.cloud.google.com
2. Crear proyecto (o usar uno existente)
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Name: `Laboratorio Académico PRO`
6. **Authorized redirect URIs** — agregar las 3:
   - `https://TU-DOMINIO.vercel.app/api/auth/callback/google`
   - `https://laboratorio-git-main-tu-usuario.vercel.app/api/auth/callback/google` (preview)
   - `http://localhost:3000/api/auth/callback/google`
7. **Create** → copiá **Client ID** y **Client secret**

### 4.2 Pegar en Vercel

| Variable | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | El client ID |
| `GOOGLE_CLIENT_SECRET` | El secret |
| `GOOGLE_REDIRECT_URI` | `https://TU-DOMINIO.vercel.app/api/auth/callback/google` |

Redeploy.

### 4.3 Probar

Abrir la URL pública → "Entrar con Google" → debería pedir consent y devolverte al dashboard.

---

## Cosas que YA están listas (no tenés que hacer nada)

- ✅ `vercel.json` — configura timeout 60s y 1 GB de RAM para todas las rutas IA pesadas
- ✅ Headers de seguridad (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- ✅ Fix del `react-pdf` CSS que rompía el build
- ✅ SQL consolidado en un solo archivo

---

## Troubleshooting

### "Build falló en Vercel"
Mirá los logs. El 99% de las veces es una env var faltante. Cruzá con [`.env.vercel.template`](./.env.vercel.template).

### "El admin login se queda en Verificando..."
Tu `ADMIN_PASSWORD` no coincide entre Vercel y lo que pones en el form. Vercel Preview y Production tienen env vars separadas — confirmá que pegaste en AMBAS.

Bug histórico: ver `.agent/skills/bug-registry/SKILL.md` → BUG-001 Causa 4.

### "Los proyectos desaparecen al refrescar"
Supabase NO está conectado todavía. Está usando in-memory + disk (que en Vercel serverless es ephemeral). Hacé el Paso 1 entero.

### "Function execution timeout"
La generación IA puede tardar >60s en fases largas (Cap.II con RAG, por ejemplo). Si pasa seguido, aumentar `maxDuration` en `vercel.json` (requiere Plan Pro de Vercel — Hobby solo permite hasta 60s).

### "Las API keys de IA no persisten después de guardarlas desde /admin/modelos"
Eso es precisamente lo que arregla la tabla `ai_provider_keys` que crea [`supabase_full_setup.sql`](./supabase_full_setup.sql). Hacé el Paso 1.

---

## Después del deploy

Sigue el checklist de [`docs/dev-sessions/CURRENT.md`](./docs/dev-sessions/CURRENT.md):

- [ ] Probar creación de documento de **Demostración de competencias**
- [ ] Cargar evidencias
- [ ] Generar borrador y final en modo guiado
- [ ] Verificar que el PDF se renderiza bien en móvil (BUG-001 documentado)
- [ ] Confirmar `/admin/pagos` muestra solicitudes y deja aprobar

---

## Links útiles

- Vercel project: https://vercel.com/dashboard
- Supabase project: https://supabase.com/dashboard/project/svaswbryumacbirecvjt
- Groq console: https://console.groq.com
- Google Cloud Console: https://console.cloud.google.com
- Documentación arquitectura: [`docs/superpowers/plans/2026-05-20-ARQUITECTURA-AUDITORIA-SERVICIOS.md`](./docs/superpowers/plans/2026-05-20-ARQUITECTURA-AUDITORIA-SERVICIOS.md)
