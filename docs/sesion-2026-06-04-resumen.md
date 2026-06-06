# Sesión 2026-06-04 — Resumen completo para retomar mañana

> Documento de contexto exhaustivo de una sesión larga de iteración sobre
> el ecosistema "Laboratorio Académico PRO" y su integración con el
> producto externo "simuladorPRO". Léelo antes de tomar cualquier
> decisión nueva en este branch.

---

## 1. Resumen ejecutivo (90 segundos)

Trabajamos sobre la rama `claude/tender-keller-G855A` del repo `ronmarty2/webapp`. El objetivo macro era consolidar la arquitectura del ecosistema educativo y construir un piloto de la plataforma "Finanzas" en webapp.

Lo que pasó:

1. Validamos juntos la arquitectura del producto (ver §3): "Dos Mundos" (Universidad + Generador) con el Generador en **dos modos** (Automatizado vs Conectado).
2. Construí un piloto de Finanzas (curso, simulador VAN/TIR, artefactos en localStorage, checkout). **Estaba mal de raíz**: replicaba el simuladorPRO que ya existe, no lo integraba.
3. Eliminamos el piloto y lo reemplazamos por una landing portal que apunta al simuladorPRO real (link externo).
4. Intentamos embeber el simuladorPRO con iframe pero está bloqueado por `host_not_allowed` de Vercel (ver §6).
5. Peleé con bugs de CSS (las clases `.pt-N` decorativas de `globals.css` colisionaban con utilities `pt-N` de Tailwind 4). Las eliminé y arreglé las cascade layers.

El usuario terminó la sesión saturado por las iteraciones. Para retomar mañana, ver §10.

---

## 2. Contexto maestro del producto

### Laboratorio Académico PRO (este repo, `ronmarty2/webapp`)
- SaaS académico con IA para Bolivia y Latinoamérica.
- Genera **monografías**, **proyectos de grado** y prepara para **exámenes** (Axiom).
- Stack: Next.js 16.2.6 (App Router), React 19, TS estricto, Tailwind 4, Supabase, Groq → Anthropic → OpenAI cascade.
- Estado: en producción, base sólida, varias áreas maduras.

### simuladorPRO (otro repo del usuario, `ronmarty2/simuladorPRO`)
- Aplicación **independiente y madura** de simulación de proyectos de inversión.
- Stack: Vite + React 18 + TS + Tailwind 3 + shadcn/ui + Supabase + Zustand + Recharts + Sentry + PWA.
- 81 archivos TS, tests, multi-rol (docente/estudiante/admin).
- Features:
  - Constructor de proyectos en **9 pasos** (Datos → Demanda → Inversiones → Personal → Costos directos → Gastos op → Financiamiento → Capital → Resumen).
  - Simulación **turno-a-turno** con eventos económicos bolivianos reales (inflación, devaluación, sequía, etc.).
  - Modos de simulación: automático / docente dispara / eventos curados.
  - Frecuencias: mensual (60 turnos), trimestral (20), semestral (10).
  - Ranking, podio, grupos, casos compartidos, plantillas.
  - **26 proyectos de ejemplo** (galería pedagógica).
  - **~50 eventos curados** del catálogo.
  - Exportación a Excel, evaluación final, calificación masiva.
  - Multi-curso con código de inscripción.
- URL de producción: `https://simulador-pro-seven.vercel.app`.
- Está protegido por `Vercel Authentication` + algo más (ver §6).

### Relación entre los dos productos
El usuario quiere que webapp sea el "ecosistema" que envuelve y conecta:
- Las **4 plataformas educativas** (Finanzas, Investigación de Mercados, Estrategia Empresarial, Marketing Digital).
- El **Generador** de tesis/proyectos de grado (UMSS, UNIFRANZ).
- El simuladorPRO es la materialización de la plataforma "Finanzas".

---

## 3. Arquitectura confirmada hoy

### "Dos Mundos"

```
LABORATORIO ACADÉMICO PRO (webapp)
├── MUNDO 1: UNIVERSIDAD
│   ├── Finanzas para Emprendedores       ← simuladorPRO existente
│   ├── Investigación de Mercados         ← no construido
│   ├── Estrategia Empresarial            ← no construido
│   └── Marketing Digital                 ← no construido
│
└── MUNDO 2: GENERADOR
    ├── Modo AUTOMATIZADO (existe hoy)
    │   La IA genera todo desde el tema
    │   Para estudiante apurado, datos sintéticos
    │
    └── Modo CONECTADO (no construido)
        Importa artefactos REALES de las plataformas
        Para estudiante que pasó por la Universidad
```

### Modelo de negocio confirmado
- Plataformas y Generador se venden por separado.
- Quien quiere ambos paga ambos.
- Bundle con descuento.
- Pago en Bs (Bolivia): Tigo Money, QR bancario, transferencia.

### Cada plataforma educativa = mini-LMS especializado
El usuario lo dijo explícitamente: cada plataforma NO es solo una herramienta, es un **curso + herramienta + progreso + artefactos**. Estructura ideal:
- 📚 Clases (teoría + ejemplos + ejercicios + quiz)
- 🛠️ Herramienta integrada (simulador/calculadora/wizard)
- 📊 Progreso del estudiante
- 💾 Artefactos guardados (exportables al Generador)

El simuladorPRO ya es esto para Finanzas. Las otras 3 plataformas habría que construirlas con el mismo patrón.

---

## 4. Inventario del código en este branch (`claude/tender-keller-G855A`)

### Commits míos en orden cronológico
```
6863419 fix(css): elimina llaves huérfanas que dejó el script anterior
3b23455 fix(css): elimina sistema de partículas .pt/.pt-N (-101 líneas)
ccf4b83 fix(css): envuelve partículas decorativas .pt-N en @layer base
784974b fix(css): envuelve reset universal en @layer base para Tailwind 4
4c90d94 fix(ecosistema): aísla del root layout vía CSS SSR (no useEffect)
2ab9e8a feat(finanzas): landing portal con CTA al simuladorPRO
3c33fd5 fix(finanzas): detecta iframe bloqueado por timeout (revertido por 2ab9e8a)
1bcc1e5 refactor(finanzas): reemplaza piloto por iframe del simuladorPRO
a2be008 feat(finanzas): plataforma educativa piloto (2515 líneas, eliminadas)
```

### Commits del usuario previos (NO tocar)
```
c6cbefe fix(ecosistema): aísla mockup del root layout
40cba2d feat(ecosistema): mockup navegable end-to-end del ecosistema "Dos Mundos"
4e53b61 fix(servicesCatalog): falta llave de apertura en entrada AXIOM
9987e60 feat(admin): banco de pruebas para motor UNIFRANZ Proyecto de Grado
9907fd2 feat(unifranz-pg): motor de prompts Proyecto de Grado UNIFRANZ Pre-Factibilidad
```

### Archivos nuevos/modificados que dejé
**Modificados:**
- `src/app/globals.css` — eliminé 101 líneas de partículas decorativas muertas (`.pt-N`, keyframes `pd-a..e`, media query reduce-motion). Envolví el reset universal en `@layer base` para que Tailwind 4 utilities ganen.
- `src/app/ecosistema/layout.tsx` — agregué `<style>` SSR para forzar aislamiento del root layout (auras, ParticleSphere, footer flotante, WhatsApp, PWA prompt).
- `src/app/ecosistema/universidad/finanzas/page.tsx` — landing portal con CTA "Abrir simuladorPRO ↗" en pestaña nueva.

**Sin cambios míos pero relevantes:**
- `src/app/ecosistema/page.tsx` — landing del ecosistema (lo hizo el usuario en `40cba2d`).
- `src/app/ecosistema/universidad/page.tsx` — hub de las 4 plataformas (mockup del usuario).
- `src/app/ecosistema/generador/page.tsx` — landing del Generador con cards de artefactos del mockup (datos hardcoded en `mock-data.ts`).
- `src/lib/ecosistema/mock-data.ts` — todos los datos demo (estudiante Ana, artefactos, progreso).

---

## 5. Estado de cada ruta del ecosistema

| Ruta | Qué muestra | Funcional |
|---|---|---|
| `/ecosistema` | Landing pública con propuesta "Dos Mundos" | Mockup |
| `/ecosistema/login` | Selección de perfil demo (Ana / Marcos) | Mockup |
| `/ecosistema/universidad` | Hub con 4 plataformas + progreso | Mockup |
| `/ecosistema/universidad/finanzas` | **Landing portal con CTA al simuladorPRO real** | **Funcional** |
| `/ecosistema/universidad/mercados` | Mockup con dashboard, clases, muestreo, encuesta, resultados | Mockup |
| `/ecosistema/universidad/estrategia` | Mockup wizard PESTEL → Porter → MEFE/MEFI → FODA | Mockup |
| `/ecosistema/universidad/marketing` | Mockup wizard 4Ps/7Ps + plan digital | Mockup |
| `/ecosistema/generador` | Mockup con "5 artefactos detectados" (datos falsos) | Mockup |
| `/ecosistema/generador/wizard` | Mockup wizard del Generador | Mockup |
| `/ecosistema/generador/workspace` | Mockup workspace por fases | Mockup |
| `/ecosistema/generador/consolidar` | Mockup consolidación IA simulada | Mockup |

**Importante**: TODO el ecosistema está aislado en `/ecosistema/*`. El resto de webapp (`/projects`, `/scribe`, `/axiom`, `/admin`, `/api/*`) sigue intacto y funcional.

---

## 6. Problemas reales pendientes (lo que NO funciona)

### 🔴 BLOQUEADOR: `host_not_allowed` en simuladorPRO

El deploy del simuladorPRO responde HTTP 403 con `x-deny-reason: host_not_allowed` a CUALQUIER request, no importa el subdomain probado:
- `simulador-pro-seven.vercel.app` → 403
- `simulador-pro.vercel.app` → 403
- `simulador-pro-git-main-*.vercel.app` → 403
- `simulador-pro-ronaldmartinezjimenes-*.vercel.app` → 403

El cuerpo del 403 dice literalmente `"Host not in allowlist"`. Esto NO es Vercel Authentication (el usuario ya apagó "Require Log In" y guardó). Es alguna otra capa: posiblemente Microfrontends config, Edge Middleware, o una variable de entorno tipo `VITE_ALLOWED_HOSTS`.

**Implica:**
- Iframe del simuladorPRO en webapp NO funciona.
- WebFetch desde tooling externo NO funciona.
- El usuario SÍ puede entrar porque está logueado en Vercel (cookies de team).

**Para resolverlo mañana:**
- Pedir al usuario captura de `vercel.com/.../simulador-pro/settings/domains`.
- Revisar si hay un dominio personalizado canonical configurado.
- Revisar si hay Edge Middleware en el código del simuladorPRO que lee `Host` header.
- Buscar en su código `host_not_allowed`, `allowlist`, `denyReason` (ya verifiqué que no está en src, podría estar en vercel.json avanzado o env vars).

### 🟡 Generador en "Modo Conectado" no existe
La página `/ecosistema/generador` muestra 5 artefactos hardcoded en `mock-data.ts`. NO consume nada real. El "Modo Conectado" sería:
1. Endpoint en webapp: `GET /api/ecosistema/artefactos` que llama a Supabase shared.
2. simuladorPRO expone sus proyectos guardados vía Supabase RLS para el mismo usuario.
3. webapp lee esos proyectos y los mapea a "artefactos" importables al Plan Financiero del Generador.

Sin SSO compartido, esto NO funciona. Hay dos vías:
- **A**: Compartir el mismo proyecto Supabase entre webapp y simuladorPRO.
- **B**: Token JWT que webapp obtiene y pasa al simuladorPRO para fetch autenticado.

### 🟡 Las otras 3 plataformas (Mercados, Estrategia, Marketing) son solo mockup
Si el usuario decide construirlas, replican el patrón del simuladorPRO pero en webapp (Next.js). Requiere:
- Definir el LMS de cada una (qué clases enseña).
- Construir la herramienta integrada (calculadora muestreo, wizard PESTEL, planner marketing).
- Sistema de artefactos exportables.
- Pago independiente (ya existe `/api/payments` en webapp).

---

## 7. ADN visual extraído del simuladorPRO

Esto sirve si decidimos construir las otras 3 plataformas siguiendo el mismo lenguaje visual:

### Tokens (shadcn neutral)
```css
--background: 0 0% 100%       /* blanco puro */
--foreground: 0 0% 3.9%       /* casi negro */
--primary: 0 0% 9%            /* negro #171717 - CTAs */
--secondary: 0 0% 96.1%       /* gris muy claro #f5f5f5 */
--muted-foreground: 0 0% 45.1% /* gris medio #737373 */
--border: 0 0% 89.8%          /* gris border #e5e5e5 */
--destructive: 0 84.2% 60.2%  /* rojo */
--radius: 0.5rem              /* 8px */
```

### Tipografía
- System fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`
- H1 página: `text-xl font-semibold tracking-tight`
- H2 sección: `text-base font-semibold tracking-tight`
- Body: `text-sm`
- Meta: `text-xs` o `text-[11px]` o `text-[10px]`

### Espaciado
- Padding cards: `p-3` mobile / `p-4` desktop / `p-8` empty states
- Gap entre elementos: `gap-1.5` / `gap-2`
- Sections: `space-y-3` / `space-y-4` / `space-y-5`

### Componentes clave
- Header: `flex h-14 items-center border-b border-border px-3 sm:px-6`
- Sidebar: `w-56 shrink-0 border-r border-border bg-secondary/30 p-3`
- Card: `rounded-lg border border-border bg-card p-4`
- Botón primary: `rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90`
- Botón secondary: `rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-accent`
- Chip activo: `bg-primary text-primary-foreground`
- Chip inactivo: `bg-secondary hover:bg-secondary/70`
- Empty state: `rounded-lg border border-dashed border-border bg-card/50 p-8 text-center`

### Banners promocionales (gradiente)
```
gradient indigo-50 via-violet-50 to-fuchsia-50
border-indigo-300
icon bg-gradient-to-br from-indigo-500 to-fuchsia-600
text-indigo-900 + text-indigo-800/80
```

### Estados con color (con dark variants)
- amber: en construcción / tip / atención
- emerald: completo / éxito
- sky: simulando / info
- destructive: error
- violet/indigo/fuchsia: promo

### Iconografía
- **Lucide React** exclusivamente (no emojis decorativos).
- Tamaños `h-3 w-3` / `h-3.5 w-3.5` / `h-4 w-4` / `h-5 w-5`.
- Stroke estándar, no thick.

### Tone de copy
- Tuteo neutro boliviano. **NUNCA voseo argentino** ("sabés", "podés", "tenés", "querés" — PROHIBIDO).
- Conciso: "Hola Ronald — gestiona tus cursos y ve cómo van tus estudiantes."
- Pedagógico: explica conceptos con componentes tipo `<Recomendacion>` (banner amber con bullet list).
- Específico boliviano: "UCATEC, UMSS, UPB, USFX", "Banco Sol", inflación 8.2%, dólar paralelo.
- Emojis funcionales en chips: "🎲 Lanzar situación", "🤝 Grupos", "🎓 Casos", "📥 Entregas". NO emojis decorativos sueltos.

---

## 8. Lecciones aprendidas de esta sesión

### Lo que falló de mi parte
1. **Construí Finanzas piloto sin verificar primero qué era simuladorPRO.** El usuario lo había mencionado pero asumí que estaba en otro lado y construí una versión "de juguete" que terminó siendo basura.
2. **Insistí en iframe sin verificar accesibilidad pública del deploy.** El simuladorPRO devuelve 403 desde cualquier host externo, el iframe nunca iba a funcionar sin resolver eso primero.
3. **Subestimé el conflicto Tailwind 4 vs CSS legacy.** Las clases `.pt-N` decorativas de `globals.css` rompían cualquier `pt-5`/`pt-7` que usara, y tardé en diagnosticarlo.
4. **Iteré demasiado en pantalla pequeña.** El usuario terminó cansado por la cantidad de "recarga y dime cómo se ve" sin resultado claro.

### Lo que sí logré
- Confirmamos la arquitectura "Dos Mundos" + "Generador con 2 Modos" con el usuario.
- Extraje el ADN visual completo del simuladorPRO (§7).
- Identifiqué el bug raíz de Tailwind 4: el reset universal fuera de `@layer base` rompía utilities. Lo arreglé. **Esta corrección es valiosa más allá del ecosistema** — beneficia cualquier página de webapp.
- Eliminé 101 líneas de código CSS muerto (sistema de partículas no usado en ningún componente).
- Borré 2.515 líneas del piloto Finanzas equivocado.

---

## 9. Reglas firmes del usuario que NO olvidar

1. **Español neutro con tuteo boliviano** — nunca voseo argentino. Bloqueador de calidad.
2. **No mockups que se vendan como reales.** Si algo no funciona, decirlo explícito.
3. **Verificar en navegador antes de decir "listo".** Type-check y lint NO son verificación funcional.
4. **No replicar el simuladorPRO** — es producto maduro, demasiado complejo para reconstruir en webapp.
5. **Enfoque, no opciones.** El usuario rinde mejor con UN siguiente paso claro que con un menú de A/B/C.
6. **No tocar áreas críticas sin avisar** — `src/lib/prompts/*`, `src/lib/aiProvider.ts`, las 4 etapas del flujo Scribe, la cascada Groq→Anthropic→OpenAI.
7. **Cuando hay duda con CSS, recordar `Ctrl+Shift+R`** (recarga dura sin cache). Vercel a veces sirve assets cacheados.

---

## 10. Cómo retomar mañana (DECISIÓN FINAL CONFIRMADA POR EL USUARIO)

> ⚠️ Esta sección se actualizó al cierre de la sesión. La decisión cambió:
> el usuario YA NO quiere iframe ni link externo ni Modo Conectado vía API.
> Quiere **MIGRAR el simuladorPRO ENTERO a webapp como módulo independiente**,
> y construir 3 módulos más con el mismo patrón. Sin compartir Supabase,
> sin migrar usuarios viejos, sin SSO. Cada módulo aparte, con su propia
> identidad visual, dentro de webapp.

### Plan ejecutable mañana (sin preguntar más, el usuario dio luz verde)

**Fase 1 — Setup webapp para soportar el módulo (1-2 h)**
1. Instalar dependencias que faltan: `shadcn/ui` (CLI + componentes base), `zustand`, `recharts`, `react-hook-form`, `@hookform/resolvers`, `zod`, `xlsx`, `xlsx-js-style`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`.
2. Crear estructura `src/app/finanzas/` con su propio `layout.tsx` que tenga el header del simuladorPRO ("Simulador de Proyectos de Inversión" + chip "Bolivia" + sidebar) — totalmente independiente del root layout de webapp (aislado igual que el ecosistema hoy).
3. Agregar tokens shadcn neutral como CSS scoped al módulo (sin tocar globals.css de webapp).

**Fase 2 — Migrar código del simuladorPRO (4-6 h)**
4. Copiar `src/lib/calculo-financiero.ts`, `src/lib/motor-eventos.ts`, `src/lib/plantillas.ts`, `src/lib/notas.ts`, `src/lib/flujo-proyecto.ts`, `src/lib/proyecto-factory.ts`, `src/types/*` — son funciones puras + tipos, copy/paste directo.
5. Copiar componentes `src/components/constructor/*`, `src/components/simulacion/*`, `src/components/docente/*`, `src/components/curso/*` — adaptar imports (`@/*`).
6. Adaptar React Router → Next.js App Router:
   - `routes/login.tsx` → `app/finanzas/login/page.tsx`
   - `routes/dashboard-docente.tsx` → `app/finanzas/docente/page.tsx`
   - `routes/dashboard-estudiante.tsx` → `app/finanzas/estudiante/page.tsx`
   - `routes/construir-proyecto.tsx` → `app/finanzas/construir/page.tsx`
   - `routes/simular-proyecto.tsx` → `app/finanzas/simular/page.tsx`
   - `routes/galeria-ejemplos.tsx` → `app/finanzas/ejemplos/page.tsx`
   - etc.
7. Cambiar `<NavLink>` → `<Link>`, `useNavigate()` → `useRouter()`, `useParams()` → Next params.
8. Zustand stores (`auth-store`, `proyecto-store`, `simulacion-store`) copy/paste directo, son client-side.

**Fase 3 — Supabase nuevo para el módulo (2-3 h)**
9. Crear proyecto Supabase nuevo o usar el de webapp (decisión del usuario al arrancar).
10. Migrar el schema SQL del simuladorPRO (carpeta `supabase/` del repo simuladorPRO).
11. Configurar env vars en webapp.
12. Auth nuevo: Google OAuth + email/password (mismo patrón).

**Fase 4 — Verificación funcional (2 h)**
13. Probar en localhost:3000/finanzas: login → docente/estudiante → construir proyecto → simular → exportar Excel.
14. Verificar que el módulo NO interfiere con el resto de webapp (`/projects`, `/scribe`, `/axiom`, `/admin`).

**Total estimado para el módulo Finanzas migrado: 1-2 sesiones completas (8-12 horas de trabajo serio).**

**Fase 5 — Construir los 3 módulos nuevos (varios días cada uno, post-Finanzas)**
- `app/mercados/` — Simulador de Investigación de Mercados (calculadora muestreo + diseñador encuestas + análisis con APIs Google Trends/Meta/TikTok)
- `app/marketing/` — Simulador de Marketing (4Ps/7Ps + segmentación con datos Meta Ads + presupuesto + calendario)
- `app/estrategia/` — Simulador de Macroentorno/PESTEL (PESTEL + Porter + MEFE/MEFI + FODA cruzada)

Cada uno: definir alcance funcional primero, después construir. Reusar el patrón del simuladorPRO migrado.

### Decisión visual + funcional confirmada (CRÍTICO)

| Aspecto | Cómo |
|---|---|
| **Identidad visual** | **Cada módulo APARTE.** Header propio, sidebar propio, tokens propios. Finanzas se ve como el simuladorPRO original. Los otros 3 tendrán su propia personalidad visual (no copy-paste del simuladorPRO, cada uno con su look). |
| **Auth y datos** | **CONECTADOS AL LABORATORIO.** Un solo Supabase (el de webapp). Un solo login (el usuario entra una vez a webapp y accede a todos los módulos). Los user_ids son consistentes en todas las tablas. |
| **Cruce con Generador** | **SÍ.** Lo que un estudiante guarda en Finanzas/Mercados/Marketing/PESTEL queda disponible como "artefacto" para importar al Generador de tesis/proyectos de grado. Eso ES el "Modo Conectado". |

**Implicancia técnica para mañana:** NO crear Supabase nuevo para Finanzas. Usar el de webapp. Crear las tablas del simuladorPRO ahí (proyectos, simulaciones, cursos, etc.) pero con user_id compartido contra la tabla `auth.users` de webapp.

### Lo que NO hay que hacer mañana
- ❌ NO preguntar al usuario qué quiere — ya decidió.
- ❌ NO intentar iframe ni link externo — el usuario lo descartó.
- ❌ NO migrar usuarios ni datos del Supabase actual del simuladorPRO — empezar limpio.
- ❌ NO crear un Supabase nuevo solo para Finanzas — usar el de webapp (auth compartido).
- ❌ NO intentar mantener el código del simuladorPRO sincronizado con webapp — el simuladorPRO se queda como repo separado de archivo histórico, webapp toma su versión propia.

---

## 11. Archivos clave para auditar al retomar

```
src/app/ecosistema/                          ← Todo el ecosistema (mockup + mi landing)
src/app/ecosistema/universidad/finanzas/page.tsx  ← Único archivo "real" que dejé
src/app/ecosistema/layout.tsx                ← Layout con isolation SSR
src/lib/ecosistema/mock-data.ts              ← Datos demo del mockup
src/lib/ecosistema/platforms.ts              ← Catálogo de las 4 plataformas
src/lib/ecosistema/mock-state.tsx            ← Provider context
src/components/ecosistema/                   ← Componentes compartidos del ecosistema
src/app/globals.css                          ← CSS global (con fix de @layer hoy)
src/app/layout.tsx                           ← Root layout (auras, ParticleSphere, etc.)
docs/superpowers/plans/2026-06-04-mockup-ecosistema-academico.md
                                             ← Plan original del mockup del usuario
```

---

## 12. Estado de Vercel y deploy

- **Preview de este branch**: `https://webapp-git-claude-t-ecaae5-ronaldmartinezjimenes-2093s-projects.vercel.app`
- **Último build**: Ready (post-`6863419`)
- **PR abierto**: `RonMarty2/WEBAPP#13`
- **No merged a main todavía** — el usuario debe decidir si quiere conservar los cambios.

---

## 13. TL;DR para Claude futuro

> El usuario tiene 2 productos: webapp (el ecosistema) y simuladorPRO (app independiente madura). Hoy intentamos integrar el simuladorPRO en webapp vía iframe pero está bloqueado por `host_not_allowed` de Vercel. Como fallback dejé una landing portal en `/ecosistema/universidad/finanzas` que apunta al simuladorPRO en pestaña nueva. El próximo objetivo razonable es **resolver el host_not_allowed** o **construir el Modo Conectado del Generador**. Antes de codificar, pedir al usuario que elija UNO. Respetar el ADN visual del simuladorPRO (§7) si vamos a construir más en webapp. NO replicar el simuladorPRO. NO voseo. Verificar siempre en browser.
