# Laboratorio Académico PRO — Contexto Maestro del Proyecto

## ¿Qué es este proyecto?
SaaS académico con IA para Bolivia y Latinoamérica. Plataforma multi-producto:
estudiantes generan **monografías**, **proyectos de grado** y se preparan para
**exámenes** con guardrails anti-alucinación y validación en cada fase.

**Principio central:** "La IA redacta. El estudiante aprueba. El documento es real."

---

## Stack Tecnológico
- **Framework:** Next.js 16.2.6 — App Router SIEMPRE (nunca Pages Router)
- **UI:** React 19.2.4 + Tailwind CSS 4 + Framer Motion 12
- **Lenguaje:** TypeScript 5 (estricto, sin `any` sin justificación)
- **Base de datos:** Supabase (PostgreSQL) — con fallback in-memory + disk (`.store/data.json`)
- **Auth:** Google OAuth + JWT (librería `jose`)
- **PDF:** pdf-parse + jsPDF + ZIP (jszip) para Overleaf
- **IA Principal:** Groq → `llama-3.3-70b-versatile`
- **IA Fallback 1:** Anthropic → `claude-haiku-4-5-20251001`
- **IA Fallback 2:** OpenAI → `gpt-4o-mini`
- **Otros proveedores soportados:** Google Gemini, Mistral, DeepSeek, xAI, Cohere, Together AI, Perplexity, LM Studio Local
- **Export:** LaTeX → Overleaf → PDF
- **Deploy pendiente:** Vercel

---

## Módulos del Producto (los que existen HOY en el código)

> ⚠️ **Nota:** versiones anteriores de este archivo mencionaban Axiom, Lumen,
> Mentor, Núcleo y Laboratorio como módulos. Esos **NO existen** en el código
> y se eliminaron del listado para no confundir futuras sesiones. Si se
> deciden construir, agregar acá cuando estén en `src/app/`.

### Generadores de documento
| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Scribe** | `/scribe` (landing) + `/projects/[id]/workspace` | Generador autónomo de monografías (5 caps + bibliografía APA 7) |
| **Proyecto de Grado** | `/projects/[id]/workspace-pg` | Workspace UNIFRANZ/UCATEC con 5 modalidades + fases agrupadas (Preliminares/Cuerpo/Cierre/Export) |
| **Generador Conectado** | `/generador`, `/generador/[id]`, `/generador/[id]/documento` | Consolida los 7 módulos educativos en un solo documento via Proyecto Maestro |

### Módulos educativos (academia + laboratorio)
| Módulo | Ruta | Color | Estado |
|--------|------|-------|--------|
| **Idea / Pre-validación** | `/idea/**` | ámbar | ✅ Academia (5 clases) + Laboratorio (Lean Canvas, VPC, Validación, Scorecard rúbrica, Reporte) |
| **Mercados** | `/mercados/**` | sky | ✅ Academia (13 clases) + Laboratorio (Diseño, Muestreo, Encuesta, Recolección link/QR, Análisis, Reporte) |
| **Estrategia** | `/estrategia/**` | violet | ✅ Academia (6 clases) + Laboratorio (PESTEL, Porter, MPC, Cadena Valor, MEFE, MEFI, MIE, FODA, BCG, Ansoff, PEYEA, MCPE, Reporte) |
| **Marketing** | `/marketing/**` | rose | ✅ Academia (5 clases) + Laboratorio (Buyer persona, Mezcla 4/7Ps, Presupuesto+CPL+ROAS, Calendario, Reporte) |
| **Organización** | `/organizacion/**` | emerald | ✅ Academia (5 clases) + Laboratorio (Organigrama, RRHH BO, Legal BO, Técnico, Branding, Reporte) |
| **Finanzas** | `/finanzas/**` | slate | ✅ simuladorPRO migrado (Constructor 9 pasos + simulación turno-a-turno + ranking + 26 ejemplos) |
| **Defensa** | `/defensa/**` | indigo | ✅ Academia (4 clases) + Laboratorio (Banco preguntas IA, Simulacro evaluado por IA, Reporte) |

### Infraestructura comercial / soporte
| Área | Ruta | Descripción |
|--------|------|-------------|
| **Pagos** | `/pago`, `/admin/pagos` | Tigo Money / QR bancario / transferencia (Bolivia) — aprobación manual |
| **Admin** | `/admin/**` | Panel completo (ver tabla abajo) |
| **Auth** | `/login`, `/api/auth/*` | Google OAuth + demo + super-admin hardcoded por email |
| **Hub módulos** | `/modulos` | Catálogo de los 7 módulos + 2 generadores |
| **Dashboard** | `/dashboard` | Hub principal con bloque "Tu camino" (rápido vs formativo) |
| **Tutorial / Legales** | `/tutorial`, `/terminos`, `/privacidad` | Páginas estáticas |
| **Ecosistema (MOCKUP)** | `/ecosistema/**` | Prototipo navegable de la visión "Dos Mundos". **NO es producto real.** |

### Subpaneles de Admin
`/admin/{ai-config, calibration-questions, dashboard, estadisticas, fases, feedback-insights, logs, modelos, monografias, pagos, project-types, prompts, proyectos, ui-config, universidades, usuarios, workspace-prompts}`

---

## Arquitectura de Prompts — REGLA CRÍTICA DE SEGURIDAD

```
UBICACIÓN: src/lib/prompts/
ACCESO: Solo servidor (API routes). NUNCA desde el cliente.
```

### Sistemas de prompts (2 motores separados):

**1. `scribe/` — Monografías académicas (12 archivos)**
- `cap0-propuesta-temas.ts` — generación de propuestas de tema
- `cap1.ts`, `cap2.ts`, `cap3.ts`, `cap4.ts`, `cap5.ts` — capítulos del documento
- `cap1-variantes/` — variantes por universidad (UMSS, etc.)
- `banco-preguntas.ts` — generador de preguntas de defensa
- `compilar-latex.ts` — compilación final LaTeX
- `consolidar-referencias.ts` — bibliografía APA 7
- `control-calidad.ts` — guardrails anti-alucinación
- `resumen-ejecutivo.ts` — abstract

**2. `proyectoGrado/` — Plan de negocio (23 archivos)**
- `cap0-idea-negocio.ts` — validación de viabilidad
- `cap1-marco-referencial.ts`, `cap2-marco-teorico.ts`
- `cap3a-pestel.ts`, `cap3b-porter.ts`, `cap3c-matrices.ts`
- `cap3d-diseno-encuesta.ts`, `cap3e-analisis-encuesta.ts`, `cap3f-demanda-cuota.ts`
- `cap4a-organizacional.ts`, `cap4abis-rrhh.ts`, `cap4b-legal.ts`, `cap4c-tecnico.ts`
- `cap4d-branding.ts`, `cap4e-marketing.ts`, `cap4f-financiero.ts`, `cap4g-evaluacion.ts`
- `conclusiones.ts`, `defensa.ts`, `referencias.ts`, `resumen-ejecutivo.ts`
- `latex.ts`, `reglas-comunes.ts`

### REGLAS ABSOLUTAS de prompts:
- ❌ NUNCA importar `SISTEMA_ETAPA_*` en componentes cliente (.tsx sin 'use server')
- ❌ NUNCA retornar el texto del prompt en respuestas de API
- ❌ NUNCA mover prompts fuera de `src/lib/prompts/`
- ✅ Solo importar desde API routes en `src/app/api/`

---

## API Routes Existentes (60+ endpoints)

### Núcleo de Generación (Projects/Workspace)
- `GET/POST /api/projects` — gestión de proyectos (monografía o proyecto-grado)
- `GET /api/projects/[id]` — detalle del proyecto
- `POST /api/projects/generate-phase` — generar fase con IA (motor principal)
- `POST /api/projects/edit-phase-section` — editar sección específica
- `POST /api/projects/finalize` — finalizar y exportar
- `POST /api/projects/upload-document` — subir PDF para RAG
- `POST /api/projects/analyze-style` — analizador de estilo del estudiante
- `GET/POST /api/projects/route-options`, `/select-route` — wizard inicial
- `GET/POST /api/projects/[id]/phases` — fases del proyecto
- `GET/POST /api/projects/[id]/observaciones[/[obsId]][/atender]` — feedback de tutor
- `POST /api/projects/[id]/qa` — Q&A sobre el documento
- `POST /api/projects/[id]/defensa`, `/defensa-materiales` — preparación de defensa
- `POST /api/projects/[id]/preguntas/generar`, `/preguntas/pdf` — banco de preguntas
- `POST /api/projects/[id]/latex`, `/paquete-latex`, `/pdf` — exports

### Monografías legacy (Scribe original)
- `POST /api/monografias`, `GET /api/monografias/[id]`
- `POST /api/compilar/[monografia_id]`, `POST /api/export/latex`, `/export/pdf`
- `GET/POST /api/citas[/monografia_id]`, `/api/documentos[/monografia_id]`
- `POST /api/cap1-variants` — variantes por universidad

### Módulos educativos (cada uno con su prefijo)
- `GET/POST /api/idea/proyectos[/[id]]`, `/api/idea/perfil`, `/api/idea/progreso`
- `GET/POST /api/mercados/proyectos[/[id]]`, `/api/mercados/perfil`, `/api/mercados/progreso`
- `GET /api/mercados/publico/[token]` (encuesta anónima sin login)
- `GET/POST /api/estrategia/proyectos[/[id]]`, `/api/estrategia/perfil`
- `GET/POST /api/marketing/planes[/[id]]`
- `GET/POST /api/organizacion/proyectos[/[id]]`
- `GET/POST /api/defensa/proyectos[/[id]]`, `/api/defensa/perfil`, `/api/defensa/progreso`
- `GET /api/finanzas/perfil`

### Proyecto Maestro + Generador Conectado
- `GET/POST /api/maestro` — CRUD de proyectos maestro
- `GET/DELETE /api/maestro/[id]` — detalle, eliminar
- `POST /api/maestro/[id]/vincular` — vincular módulo al maestro
- `GET /api/maestro/[id]/contexto` — contexto consolidado para IA
- `GET /api/maestro/[id]/latex`, `/api/maestro/[id]/zip` — export
- `GET /api/maestro/disponibles` — qué proyectos vincular

### Servicio de IA compartido
- `POST /api/ai/asistir` — endpoint único que TODOS los módulos llaman (con cascada Groq → Gemini → Anthropic → OpenAI)

### Pagos
- `POST /api/payments` — crear solicitud (tigo_money | qr_bancario | transferencia)
- `GET/PATCH /api/payments/[id]` — estado y aprobación

### Auth
- `POST /api/auth/google`, `GET /api/auth/callback/google`
- `POST /api/auth/demo`, `/logout`, `GET /api/auth/me`

### Admin (panel completo)
- `GET /api/admin/dashboard`, `/estadisticas`, `/logs`, `/feedback-insights`
- `GET/POST /api/admin/{usuarios, proyectos, monografias, payments, prompts}`
- `GET/POST /api/admin/{phase-definitions, project-types, universities, university-assets}`
- `GET/POST /api/admin/{workspace-prompts, ai-config, calibration-questions, hilos}`
- `GET /api/admin/recent-topics`, `/usuarios/[id]/historial`
- `POST /api/admin/auth[/check]`, `/descargar-latex/[id]`
- `POST /api/admin/projects/[id]/defensa-materiales`

### Otros
- `GET /api/services` — lista de servicios/productos
- `POST /api/generate` — endpoint genérico de generación

---

## Librerías Internas Clave (`src/lib/`)

### IA y prompts
| Archivo | Función |
|---------|---------|
| `aiProvider.ts` | Cascada Groq → Anthropic → OpenAI (+ 8 fallbacks adicionales) |
| `modelRouter.ts` | Selección de modelo por fase / contexto |
| `ai/guardian.ts` | Guardián anti-alucinación |
| `ai/rag-processor.ts` | RAG para documentos del usuario |
| `aiTokenPolicy.mjs` | Política de tokens por fase |
| `aiTrace.mjs` | Trazabilidad de llamadas IA |
| `prompts/scribe/*` | Prompts del motor Scribe (monografías) |
| `prompts/proyectoGrado/*` | Prompts del motor Proyecto de Grado |

### Persistencia
| Archivo | Función |
|---------|---------|
| `db/index.ts` | Abstracción transparente Supabase ↔ in-memory |
| `persistence.ts` | `saveToDisk()` a `.store/data.json` |
| `memoryStore.ts` | Fallback in-memory |
| `data.ts` | Datos seed y constantes |

### Generación de documentos
| Archivo | Función |
|---------|---------|
| `latexMonografia.ts`, `latex/*` | Generador LaTeX (markdown → LaTeX) |
| `pdfTemplate.ts`, `pdfUtils.ts` | Plantilla PDF + extracción de texto |
| `export/latex-builder.ts` | Builder de ZIP para Overleaf |
| `defensaMateriales.ts` | Materiales de defensa |
| `hiloConductor.ts` | Hilo conductor entre fases |

### Auth y dominio
| Archivo | Función |
|---------|---------|
| `auth.ts`, `api-auth.ts` | JWT, Google OAuth, roles (incluye plan `elite`) |
| `projectTypePhases.ts` | Definición de fases por tipo de proyecto |
| `cap1Variants.ts` | Variantes del Cap.I por universidad |
| `projectReferences.mjs` | Referencias compartidas entre proyectos |
| `axiom/*` | Lógica del simulador (evaluador, PDF builder, etc.) |
| `proyectoGrado/*` | Helpers específicos (encuestas, etc.) |

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

## Flujos de Generación por Producto

### Scribe — Monografía (6 fases: Cap.0 a Cap.5)
```
Wizard → Tipo proyecto + Universidad + Tema
   ↓
Fase 0: Propuesta de tema (3 alternativas IA o tema directo)
Fase 1: Cap.I — Planteamiento del problema (con variantes por universidad)
Fase 2: Cap.II — Marco teórico (puede usar PDFs subidos vía RAG)
Fase 3: Cap.III — Diseño metodológico
Fase 4: Cap.IV — Resultados / análisis
Fase 5: Cap.V — Conclusiones + Bibliografía APA 7 consolidada
   ↓
Control de calidad → Banco de preguntas defensa → Compilar LaTeX → ZIP Overleaf → PDF
```

### Proyecto de Grado — Plan de negocio (23 fases)
```
Cap.0: Idea de negocio (validación de viabilidad)
Cap.1: Marco referencial   |   Cap.2: Marco teórico
Cap.3a-f: Análisis externo (PESTEL, Porter, matrices, encuesta, análisis, demanda)
Cap.4a-g: Diseño interno (organizacional, RRHH, legal, técnico, branding, marketing,
          financiero, evaluación)
Conclusiones → Defensa → Referencias → Resumen ejecutivo → LaTeX
```

### Generador Conectado — Proyecto integral por módulos
```
Crear Proyecto Maestro → vincular módulos (Idea, Mercados, Estrategia, etc)
   ↓ widget "Trabajando en" enciende contexto en cada módulo
Trabajar cada módulo → cada uno genera su artefacto (reporte)
   ↓ "Siguiente paso" navega al próximo módulo según la modalidad
/generador/[id] → ver contexto consolidado
/generador/[id]/documento → generar capítulos con IA (contexto cruzado)
   ↓
Export Markdown / .tex / ZIP Overleaf con plantilla por universidad
```

### Módulos educativos individuales
Cada módulo (Idea, Mercados, Estrategia, Marketing, Organización, Finanzas, Defensa) tiene su propio flujo:
- **Academia:** clases con teoría + ejemplo boliviano + quiz
- **Laboratorio:** herramientas con plantillas (modo B) + botón "Sugerir IA" (modo C)
- **Reporte consolidado:** artefacto exportable al Generador Conectado
- Estudiante puede usar UN módulo solo (sin Proyecto Maestro) o conectarlo todo

**Para cada fase de cualquier producto:** `POST /api/projects/generate-phase`
con `{ projectId, phaseId, contexto, modo? }`. El backend orquesta:
1. Carga prompt desde `src/lib/prompts/<motor>/<fase>.ts`
2. Aplica `hiloConductor` para coherencia con fases previas
3. Llama IA con cascada (`aiProvider.ts`)
4. Pasa por `guardian.ts` anti-alucinación
5. Persiste resultado (Supabase o in-memory)

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
2. **Pagos: webhook real de activación** — el flujo manual ya está
   (`/api/payments`, `/admin/pagos`); falta integración real con Tigo / QR / Stripe
3. **Google OAuth producción** — Google Cloud Console con dominio real
4. **Deploy Vercel** — conectar repo GitHub + variables de entorno
5. **Imágenes del estudiante en el ZIP de Overleaf** (Opción B) —
   Extender `POST /api/projects/upload-document` para aceptar `image/png`,
   `image/jpeg`, `image/webp`. Guardar en `academic_context.imagenes[]`
   con `{ nombre, bytes_base64, anchor }`. En `paquete-latex/route.ts`
   agregarlas a una carpeta `figuras/` del ZIP y actualizar la lista
   `availableFiles` que pasa a `sanitizeOrphanIncludes` para que no se
   marquen como huérfanas. La IA en `compilar-latex.ts` debe recibir
   la lista de imágenes disponibles y referenciarlas en el `.tex`.

---

## ⚠️ Deuda Técnica Conocida — React 19 strict mode (10 errores lint)

Tras refactor general (2026-05-16) quedan 10 errores `react-hooks/purity` e
`react-hooks/immutability` que requieren refactor más profundo, no son bloqueantes:

- **`react-hooks/purity` (8)** — `Math.random()` / `Date.now()` llamados durante
  el render. Causan hydration mismatch potencial en SSR. Mover a `useState(() => ...)`
  con lazy init o a `useEffect`. Archivos:
  - `src/app/axiom/components/ParticleBackground.tsx:24,25,31,33`
  - `src/app/laboratorio/page.tsx:15,35`
  - `src/components/scribe/GeneratingState.tsx:322,323`
- **`react-hooks/immutability` (2)** — mutación de `iframe.contentDocument` vía ref
  en `src/app/projects/[id]/workspace/page.tsx:2590,2810`. Patrón legítimo para
  preview HTML, pero React 19 lo detecta. Considerar `srcDoc` o portal.

La regla `react-hooks/set-state-in-effect` (Next 16, overly strict para patrones
React estándar) está **desactivada** en `eslint.config.mjs` con justificación.

---

## Convenciones de Código

- Siempre TypeScript estricto — nunca `any` sin justificación
- Componentes cliente: `'use client'` explícito al inicio
- API routes: siempre validar input antes de llamar a Groq
- Respuestas de error: siempre `{ error: string }` con status HTTP correcto
- Variables de entorno: nunca hardcodear keys, siempre desde `process.env`
- Siempre verificar `NEXT_PUBLIC_` prefix solo para variables que el cliente necesita

---

## 🇧🇴 REGLA DE COPY — NUNCA USAR ARGENTINISMOS (VOSEO)

**El SaaS es para mercado boliviano. Usar SIEMPRE español neutro con tuteo.**

❌ PROHIBIDO (voseo argentino/uruguayo):
- "sabés", "querés", "tenés", "necesitás", "descargás", "subís", "conversás", "elegís", "regenerás", "podés", "esperás"
- "vos", "tu monografía está lista, sin vueltas"
- Expresiones rioplatenses: "sin vueltas", "buena onda", "macanudo", "che", "bárbaro"

✅ CORRECTO (tuteo neutro boliviano):
- "sabes", "quieres", "tienes", "necesitas", "descargas", "subes", "conversas", "eliges", "regeneras", "puedes", "esperas"
- "tú", "tu monografía está lista, sin rodeos"
- Expresiones neutras: "sin complicaciones", "sin rodeos", "directo al punto"

**Esta regla aplica a TODO copy visible al usuario:** UI, emails, mensajes de error,
documentación, mockups, landing, pricing, tooltips, placeholders, prompts visibles.
Históricamente Claude ha cometido este error varias veces (ver commits e1f0dc4
y be75c9f). El usuario lo considera bloqueante de calidad — verificar
cada copy generado.

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

---

## ⚠️ CAMBIOS QUE ROMPEN EL SISTEMA (AVISAR PRIMERO)

Cualquier cambio que toque estas áreas **DEBE ser autorizado explícitamente** antes de implementar:

### Arquitectura (NO CAMBIAR SIN AVISAR)
- ❌ Orden de las 4 etapas (Tema → Cap.I → Cap.II → Caps.III-V+Biblio)
- ❌ Eliminar rutas API existentes sin migración
- ❌ Renombrar tablas de BD sin migration script
- ❌ Cambiar estructura de `capitulo.contenido_json`
- ❌ Mover prompts fuera de `src/lib/prompts/index.ts`
- ❌ Quitar validaciones anti-alucinación (`detectarAlucinaciones()`, `validarCoherencia()`)
- ❌ Cambiar firma de `llamarIA()` o `llamarIAConConfig()`
- ❌ Eliminar soporte de cualquiera de los 11 proveedores IA

### Cascada de IA (ORDEN CRÍTICO)
```
NUNCA cambiar este orden:
1. Groq (llama-3.3-70b-versatile) — principal
2. Anthropic (claude-haiku-4-5-20251001) — fallback 1
3. OpenAI (gpt-4o-mini) — fallback final
```
Si un proveedor falla, el sistema DEBE reintentar con el siguiente. Si alteras esta cascada, el 30% de usuarios sin Groq perderá acceso.

### Validaciones Anti-Alucinación (BLINDADAS)
- ❌ Cambiar lógica de `detectarAlucinaciones()` sin testing exhaustivo
- ❌ Permitir citas sin autor, año o fuente
- ❌ Generar Caps.II-V sin validar coherencia con Cap.I
- ❌ Compilar LaTeX sin escapar caracteres especiales

### Persistencia (3 CAPAS)
```
Si agregas una 4ta capa (Redis, cache, etc.):
  → DEBE ser transparente (no romper src/lib/db/*)
  → DEBE tener fallback a in-memory
  → DEBE poder desactivarse sin error
```

---

## PROTOCOLO DE CAMBIOS (OBLIGATORIO)

**Antes de CUALQUIER modificación importante:**

1. **AUDITAR**: ¿Qué archivos toca? (busca en `/api/*`, `/lib/*`, tipos en `types/*`)
2. **MAPEAR DEPENDENCIAS**: ¿Qué otros features dependen de esto?
3. **VALIDAR**: ¿Rompe algo de las "REGLAS ABSOLUTAS" arriba?
4. **AVISAR**: Si hay impacto → explicar cambio ANTES de hacer
5. **EJECUTAR**: Solo si usuario confirma o es cambio safe (typo fixes, etc.)
6. **VERIFICAR POST-CAMBIO**: confirmar que funciona + no rompió nada

**Ejemplo de aviso correcto:**
```
❌ IMPACTO: Cambiar temperatura a 0.7 en todas las llamadas IA
  → Afecta: src/lib/aiProvider.ts línea 394
  → Impacto: Caps.I-III tendrán más creatividad → menos coherencia
  → Recomendación: Aplicar solo en /api/etapas/[n]/chat (iteraciones)
  ¿Procedo de esa forma?
```

---

## MEMORY AUTOMÁTICA (CARGADA SIEMPRE)

Este proyecto tiene un **Blueprint de Arquitectura persistente** en:
```
C:\Users\lmigu\.claude\projects\c--Users-lmigu-Desktop-WEBAPP-WEBAPP-WEBAPP\memory\ARCHITECTURE_BLUEPRINT.md
```

**Se carga automáticamente en TODA sesión.** Contiene:
- Verdades inmutables del sistema
- Flujo de 4 etapas detallado
- Catálogo de 11 proveedores IA
- Todas las rutas API existentes
- Protocolo de validación para cambios

Si olvido algo de esa memoria → es un bug mío. Recuérdame consultarla.

---

## 🔐 BLINDAJE Y STARTUP SEQUENCE

### Archivo de Configuración (`.claude-config.json`)
```
.claude-config.json — Contiene 10 CRITICAL + 2 HIGH reglas
```

### STARTUP SEQUENCE (`.claude-startup.md`)
```
.claude-startup.md — OBLIGATORIO CONSULTAR EN CADA SESIÓN
```

**Instrucción CRÍTICA para Claude:**

AL INICIO DE CADA SESIÓN NUEVA:
1. ✅ Consultar `.claude-startup.md` (este archivo)
2. ✅ Leer `.claude-config.json` (parsing de 12 reglas)
3. ✅ Leer sección "⚠️ CAMBIOS QUE ROMPEN" de este CLAUDE.md
4. ✅ Leer `ARCHITECTURE_BLUEPRINT.md` desde memory
5. ✅ Verificar git status y commits
6. ✅ **GENERAR Y MOSTRAR BANNER DE CONFIRMACIÓN**

El banner debe incluir:
- Timestamp de sesión
- Número exacto de reglas activas (10 CRITICAL, 2 HIGH)
- Git branch y último commit
- Status de sincronización
- Confirmación: "✅ Blindaje verificado y activo"

**Esto funciona porque:**
- Los 3 archivos están en Git (sincronización automática laptop ↔ PC)
- Claude DEBE consultar `.claude-startup.md` como rutina
- El banner es EVIDENCIA de que se leyó todo
- Usuario puede pedir "Muestra startup" en cualquier momento
