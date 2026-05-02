---
name: project-context
description: Mapa vivo del proyecto "Laboratorio Académico PRO". Arquitectura, archivos clave, stack tecnológico, decisiones de diseño y estado actual. Leer SIEMPRE al inicio de cada conversación. Se actualiza automáticamente al añadir features o cambiar arquitectura.
---

# Laboratorio Académico PRO — Contexto del Proyecto

> **Instrucción para Antigravity:** Lee este archivo ANTES de explorar el código. Contiene todo el contexto necesario para trabajar en este proyecto sin tener que escanear carpetas.
> Al finalizar una sesión de trabajo significativa, actualiza las secciones que correspondan.

---

## ¿Qué es este proyecto?

SaaS boliviano para generación de monografías académicas con IA.
- **Usuarios:** Estudiantes de diplomados y postgrados en Bolivia
- **Precio:** Bs. 150 pago único por proyecto
- **Stack:** Next.js 16.2.4 + React 19 + TypeScript + Tailwind CSS 4 + Supabase
- **IA:** Cascada Groq → Anthropic → OpenAI (via `src/lib/aiProvider.ts`)
- **URL local:** `http://localhost:3000`
- **Repo:** `c:\Users\lmigu\Desktop\WEBAPP\WEBAPP\WEBAPP`

---

## Arquitectura de Rutas

```
/                    → Landing page (pública)
/login               → Auth Google OAuth + modo demo
/dashboard           → Panel del estudiante (protegida)
/monografia          → Flujo de 4 etapas de generación (protegida)
/projects/[id]/...   → Workspace de proyecto (protegida)
/laboratorio         → Vista lab (protegida)
/tutorial            → Tutorial de uso
/pendiente           → Pantalla de cuenta pendiente de activación
/admin               → Dashboard admin (requiere adminAuthed en localStorage + cookie JWT)
/admin/login         → Login del panel admin (contraseña única, NO Google OAuth)
/admin/usuarios      → CRUD usuarios
/admin/proyectos     → CRUD proyectos y prompts
/admin/universidades → CRUD universidades
/admin/estadisticas  → Métricas de uso
/admin/logs          → Logs del sistema
/admin/modelos       → Config APIs de IA
/admin/project-types → Tipos de proyecto
/admin/fases         → Fases del proyecto
/admin/prompts       → Prompts maestros
```

---

## Archivos Clave — Para qué sirve cada uno

### Autenticación y Middleware
| Archivo | Propósito |
|---------|-----------|
| `src/proxy.ts` | Middleware de Next.js. Protege rutas `/dashboard`, `/monografia`, `/admin/*`. Verifica cookies JWT. |
| `src/lib/auth.ts` | `createSessionToken`, `verifySessionToken`, `verifyAdminToken`. JWT con `jose`. |
| `src/app/admin/layout.tsx` | Layout del panel admin. Doble auth: `localStorage.adminAuthed === "1"` + cookie `admin_session`. |
| `src/app/admin/login/page.tsx` | Formulario de login admin con contraseña única (env: `ADMIN_PASSWORD`). |
| `src/app/api/admin/auth/route.ts` | POST: valida contraseña, emite JWT en cookie `admin_session`. DELETE: logout. |

### IA y Generación
| Archivo | Propósito |
|---------|-----------|
| `src/lib/aiProvider.ts` | Cascada de fallback entre providers de IA. Usar siempre este, nunca llamar APIs directamente. |
| `src/lib/prompts.ts` | Prompts maestros por etapa. **NUNCA importar en componentes cliente (`"use client"`)** — solo en API routes. |
| `src/lib/latexMonografia.ts` | Convierte markdown → LaTeX completo para exportar. |
| `src/app/api/export/latex/route.ts` | Endpoint de exportación LaTeX. |

### Datos / Persistencia
| Archivo | Propósito |
|---------|-----------|
| `src/lib/persistence.ts` | Abstracción de storage. En dev usa `.store/data.json`, en prod usa Supabase. |
| `src/lib/memoryStore.ts` | Fallback in-memory cuando Supabase no está configurado. |
| `.store/data.json` | Archivo local de datos en desarrollo. Ignorado por webpack watcher (evita HMR loop). |
| `supabase_v5_migration.sql` | Schema actual de Supabase (v5 es el más reciente). |

### UI / Estilos
| Archivo | Propósito |
|---------|-----------|
| `src/app/globals.css` | CSS global con design tokens, utilidades admin, dark mode, animaciones. |
| `src/app/layout.tsx` | Root layout. Contiene script anti-flash de tema (dark/light). Usa `<Script strategy="beforeInteractive">`. |
| `src/components/ThemeToggle.tsx` | Botón de cambio dark/light mode. |
| `src/components/ParticleSphere.tsx` | Esfera de partículas 3D del hero (canvas, Fibonacci lattice). |

### Variables de Entorno (`.env.local`)
```
GROQ_API_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
ADMIN_PASSWORD=...          ← contraseña del panel admin
ADMIN_JWT_SECRET=...        ← secret para firmar JWT admin
ADMIN_EMAILS=...            ← emails con acceso admin via Google OAuth
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...             ← secret para JWT de sesiones de estudiantes
```

---

## Decisiones de Arquitectura

| Decisión | Razón | Fecha |
|----------|-------|-------|
| Cascada Groq → Anthropic → OpenAI | Groq es más rápido/barato, fallbacks para disponibilidad | Apr 2026 |
| LaTeX en vez de PDF directo | Overleaf gratis es más confiable que pdflatex en servidor | Apr 2026 |
| In-memory store como fallback | Permite desarrollar sin Supabase configurado | Apr 2026 |
| 4 etapas separadas (max ~10K tokens cada una) | Evita context overflow, mantiene coherencia entre capítulos | Apr 2026 |
| APA 7 obligatorio con validación | Principal queja de usuarios con ChatGPT es citas inventadas | Apr 2026 |
| Admin auth: localStorage + JWT cookie | Doble capa: localStorage para UI (evitar spinner), cookie para middleware | May 2026 |
| `.store/` ignorado por webpack watcher | Evitar HMR infinito al escribir datos en desarrollo | May 2026 |
| `<Script strategy="beforeInteractive">` para tema | React 19 no permite `<script>` raw con dangerouslySetInnerHTML en árbol JSX | May 2026 |

---

## Design System

- **Estilo:** Dark mode por defecto. Glassmorphism + minimalismo tipo "Antigravity/Google".
- **Colores admin:** `#0B0F19` (fondo), `slate-800/900/950` (paneles), `violet-500` (acento).
- **Tailwind:** v4 (PostCSS plugin). No usar `tailwind.config.js` — se configura en `globals.css` via `@theme`.
- **CSS naming:** Evitar conflictos con Tailwind — usar prefijos como `.admin-*` para estilos del panel.
- **Fuentes:** Inter (Google Fonts).

---

## Estado Actual del Desarrollo (May 2026)

### ✅ Completado y funcionando
- Landing page con planes de precios y esfera de partículas
- Login (Google OAuth + modo demo)
- Dashboard del estudiante con proyectos
- Flujo completo de 4 etapas de generación con IA
- Export a LaTeX
- Panel de administración completo (KPIs, usuarios, prompts, modelos, logs, universidades)
- Sistema de citas APA 7
- RAG para documentos del usuario
- Dark/Light mode con anti-flash script
- Auth admin con JWT + localStorage

### 🔄 Próximo sprint
- **PRIORIDAD 1:** Conectar Supabase real (credenciales + schema + RLS)
- **PRIORIDAD 2:** Sistema de pagos (Tigo Money / QR Bolivia / Stripe)
- **PRIORIDAD 3:** Google OAuth con dominio de producción
- **PRIORIDAD 4:** Deploy en Vercel

### 📋 Backlog
- Vista previa del documento en tiempo real
- Regenerar sección específica sin perder capítulo
- Historial de versiones por capítulo
- Export a Word (.docx)
- Módulo Docentes
- Módulo Tesis de Grado
- Sistema de afiliados/referidos

---

## Reglas de Seguridad — NUNCA ROMPER

```typescript
// ❌ PROHIBIDO — prompts maestros en componentes cliente
"use client"
import { SISTEMA_ETAPA_0 } from '@/lib/prompts'

// ✅ CORRECTO — solo en API routes (servidor)
import { SISTEMA_ETAPA_0, buildUserEtapa0 } from '@/lib/prompts'

// ❌ PROHIBIDO — keys en cliente
SUPABASE_SERVICE_ROLE_KEY  // sin NEXT_PUBLIC_ → servidor solo
GROQ_API_KEY               // sin NEXT_PUBLIC_ → servidor solo

// ✅ CORRECTO — solo estas van al cliente
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Cómo Actualizar Esta Skill

Actualizar al final de la sesión si:
- Se agregó una nueva ruta o página
- Se cambió la arquitectura o un patrón de código
- Se conectó un nuevo servicio externo
- Cambió el estado del desarrollo (algo pasó de 🔄 a ✅)
- Se tomó una decisión de arquitectura nueva
