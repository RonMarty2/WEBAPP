# Laboratorio Académico PRO — Contexto Maestro del Proyecto

## ¿Qué es este proyecto?
SaaS de generación de monografías académicas con IA para Bolivia y Latinoamérica.
Estudiantes de diplomados y postgrados generan documentos completos (Caps. I–V + bibliografía APA 7)
de forma guiada, sin alucinaciones, en 4 etapas validadas.

**Principio central:** "La IA redacta. El estudiante aprueba. El documento es real."

---

## Stack Tecnológico
- **Framework:** Next.js 16.2.4 — App Router SIEMPRE (nunca Pages Router)
- **UI:** React 19 + Tailwind CSS 4
- **Lenguaje:** TypeScript 5 (estricto)
- **Base de datos:** Supabase (PostgreSQL) — actualmente con fallback in-memory
- **Auth:** Google OAuth + JWT (librería `jose`)
- **IA Principal:** Groq → `llama-3.3-70b-versatile`
- **IA Fallback 1:** Anthropic → `claude-haiku-4-5`
- **IA Fallback 2:** OpenAI → `gpt-4o-mini`
- **Export:** LaTeX → Overleaf → PDF
- **Deploy pendiente:** Vercel

---

## Arquitectura de Prompts — REGLA CRÍTICA DE SEGURIDAD

```
UBICACIÓN: src/lib/prompts/index.ts
ACCESO: Solo servidor (API routes). NUNCA desde el cliente.
```

### Prompts existentes:
| Constante | Función |
|-----------|---------|
| `SISTEMA_ETAPA_0` | Validación y propuesta de temas de investigación |
| `SISTEMA_ETAPA_1` | Generación del Capítulo I (Planteamiento del problema) |
| `SISTEMA_ETAPA_2` | Generación del Capítulo II (Marco teórico) |
| `SISTEMA_ETAPA_3` | Generación de Caps. III, IV, V + Bibliografía |

### Funciones builder:
| Función | Input |
|---------|-------|
| `buildUserEtapa0(datos)` | diplomado, temas_abordados, area_interes, contexto_geografico, trabajas_en? |
| `buildUserEtapa1(datos)` | tema, antecedentes, literatura, causas, objetivos, justificacion |
| `buildUserEtapa2(datos)` | cap1_content, documentos_usuario? |
| `buildUserEtapa3(datos)` | cap1_content, cap2_content, metodologia |

### REGLAS ABSOLUTAS de prompts:
- ❌ NUNCA importar `SISTEMA_ETAPA_*` en componentes cliente (.tsx sin 'use server')
- ❌ NUNCA retornar el texto del prompt en respuestas de API
- ❌ NUNCA mover prompts fuera de `src/lib/prompts/`
- ✅ Solo importar desde API routes en `src/app/api/`

---

## Estructura de Páginas (App Router)

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/` | `src/app/page.tsx` | Landing con planes, productos, garantías |
| `/login` | `src/app/login/` | Google OAuth + modo demo |
| `/dashboard` | `src/app/dashboard/` | Lista proyectos del usuario |
| `/monografia` | `src/app/monografia/` | Flujo principal 4 etapas |
| `/projects/new` | `src/app/projects/` | Wizard creación proyecto |
| `/projects/[id]/workspace` | `src/app/projects/[id]/` | Editor por fases |
| `/admin` | `src/app/admin/` | Dashboard admin (KPIs, stats) |
| `/admin/usuarios` | `src/app/admin/usuarios/` | Gestión usuarios |
| `/admin/prompts` | `src/app/admin/prompts/` | Editor prompts por etapa |
| `/admin/modelos` | `src/app/admin/modelos/` | Config proveedores IA |
| `/admin/estadisticas` | `src/app/admin/estadisticas/` | Gráficos de uso |
| `/admin/logs` | `src/app/admin/logs/` | Registro errores |
| `/tutorial` | `src/app/tutorial/` | Guía de uso |
| `/terminos` `/privacidad` | `src/app/terminos/` | Páginas legales |

---

## API Routes Existentes

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/monografias` | POST | Crear monografía |
| `/api/monografias/[id]` | GET | Obtener monografía completa |
| `/api/etapas/[0-3]/generar` | POST | Generar etapa con IA |
| `/api/etapas/[n]/revisar` | POST | Revisar con feedback |
| `/api/etapas/[n]/chat` | POST | Chat de modificaciones |
| `/api/etapas/0/tema-directo` | POST | Tema propio sin propuestas |
| `/api/citas` | GET/POST | Gestión bibliografía APA 7 |
| `/api/documentos` | GET/POST | Documentos del usuario |
| `/api/compilar/[id]` | POST | Compilar LaTeX final |
| `/api/export/latex` | POST | Exportar .tex |
| `/api/projects` | GET/POST | Gestión proyectos |
| `/api/auth/google` | POST | Google OAuth |
| `/api/auth/demo` | POST | Login demo |
| `/api/auth/me` | GET | Sesión actual |
| `/api/admin/estadisticas` | GET | Stats del sistema |
| `/api/admin/usuarios` | GET | Gestión usuarios |
| `/api/admin/logs` | GET | Logs de errores |

---

## Librerías Internas Clave

| Archivo | Función |
|---------|---------|
| `src/lib/aiProvider.ts` | Cascada Groq → Anthropic → OpenAI |
| `src/lib/memoryStore.ts` | Store in-memory (fallback sin Supabase real) |
| `src/lib/latexMonografia.ts` | Generador LaTeX (markdown → LaTeX) |
| `src/lib/validaciones.ts` | Anti-alucinación, coherencia, APA 7 |
| `src/lib/pdfUtils.ts` | Extracción texto de PDFs |
| `src/lib/auth.ts` | JWT, Google OAuth, roles |
| `src/lib/ai/guardian.ts` | Guardián anti-alucinación |
| `src/lib/ai/rag-processor.ts` | RAG para documentos del usuario |

---

## Base de Datos Supabase

| Tabla | Propósito |
|-------|-----------|
| `universities` | Universidades y formatos |
| `master_prompts` | Prompts por sección (editable desde admin) |
| `monografias` | Proyectos de monografía |
| `capitulos` | Capítulos por etapa |
| `citas` | Bibliografía APA 7 |
| `documentos_usuario` | Archivos del estudiante |

**Estado actual:** In-memory funciona. Supabase real aún no conectado (próxima prioridad).

---

## Flujo de Generación (4 Etapas)

```
INICIO → Datos estudiante (diplomado, intereses, contexto geográfico Bolivia)
   ↓
ETAPA 0 → IA genera 3 propuestas de tema viables con datos secundarios públicos
            ↓ usuario elige UNA (o ingresa tema propio via /api/etapas/0/tema-directo)
ETAPA 1 → Usuario llena antecedentes, literatura, causas, objetivos
            ↓ IA genera Capítulo I completo (secciones 1.1 → 1.5, ~8-12 páginas)
ETAPA 2 → IA genera Cap. II automáticamente usando Cap. I como contexto
            (marco teórico + estudios relacionados, usuario puede subir PDFs)
ETAPA 3 → IA genera Caps. III, IV, V + Bibliografía final completa
            ↓ validación de coherencia total entre capítulos
FINAL   → Usuario descarga .tex → Overleaf → PDF presentable
```

---

## Modelo de Negocio

| Plan | Precio | Incluye |
|------|--------|---------|
| Estándar | Bs. 150 (pago único) | 1 monografía, IA avanzada, PDF + LaTeX, APA 7, soporte |
| Pro | Bs. 300 / mes | 3 docs/mes, mejor modelo IA, historial versiones, soporte 24/7 |

**Mercado:** Bolivia (La Paz, Cochabamba, Santa Cruz). Expansión: Perú, Ecuador, Paraguay.

---

## Pendientes Prioritarios (Próximo Sprint)

1. **Supabase real** — conectar credenciales y migrar del in-memory store
2. **Pagos** — Tigo Money / QR Bolivia / Stripe + webhook activación cuenta
3. **Google OAuth producción** — Google Cloud Console con dominio real
4. **Deploy Vercel** — conectar repo GitHub + variables de entorno

---

## Convenciones de Código

- Siempre TypeScript estricto — nunca `any` sin justificación
- Componentes cliente: `'use client'` explícito al inicio
- API routes: siempre validar input antes de llamar a Groq
- Respuestas de error: siempre `{ error: string }` con status HTTP correcto
- Variables de entorno: nunca hardcodear keys, siempre desde `process.env`
- Siempre verificar `NEXT_PUBLIC_` prefix solo para variables que el cliente necesita

---

## Skills Instaladas en Este Proyecto

- `brainstorming` — Refina ideas antes de codificar
- `writing-plans` — Plan detallado tarea por tarea
- `test-driven-development` — TDD para API routes
- `systematic-debugging` — Debug estructurado para fallos de IA/Groq
- `subagent-driven-development` — Ejecución autónoma de tareas
- `requesting-code-review` — Revisión antes de cerrar cada tarea
- `impeccable` — Auditoría y pulida de UI
- `ui-ux-pro-max` — Sistema de diseño para SaaS educativo

---

## URLs Locales

| Recurso | URL |
|---------|-----|
| App | http://localhost:3000 |
| Monografía | http://localhost:3000/monografia |
| Admin | http://localhost:3000/admin |
| Demo login | /login → "Entrar como estudiante demo" |
