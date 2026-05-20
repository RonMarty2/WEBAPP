# 🔍 AUDITORÍA ARQUITECTÓNICA: MAPEO COMPLETO DE SERVICIOS

> **Tipo:** Análisis de arquitectura (no implementación)  
> **Fecha:** 2026-05-20  
> **Estado:** Laboratorio Académico PRO (post-refactor lint)

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Mapa de Servicios (11 productos)](#mapa-de-servicios)
3. [Análisis de Solapamiento](#análisis-de-solapamiento)
4. [Mapa de Dependencias Cruzadas](#mapa-de-dependencias-cruzadas)
5. [Recomendaciones de Consolidación](#recomendaciones-de-consolidación)
6. [Plan de Refactor Propuesto](#plan-de-refactor-propuesto)

---

## RESUMEN EJECUTIVO

**Estado:** El SaaS tiene **11 productos implementados** (no 4 etapas como dice `/api/services`), con **60+ endpoints API**, **100+ componentes React**, y **25+ librerías internas**.

**Hallazgo crítico:** Hay **3 niveles de solapamiento**:
1. **Arquitectónico:** `projects` maneja AMBOS Scribe y Proyecto de Grado con 30 endpoints compartidos
2. **UI:** `scribe/page.tsx` y `dashboard/page.tsx` tienen flujos duplicados (wizard, workspace)
3. **Librerías:** `hiloConductor.ts`, `modelRouter.ts`, `aiProvider.ts` se reutilizan entre servicios, pero SIN interfaz clara

**Impacto:** Difícil de mantener, imposible de portar un servicio, acoplamiento oculto.

**Recomendación:** Refactor modular paso a paso (6 meses, 3 fases) sin afectar producción.

---

## MAPA DE SERVICIOS

### SERVICIO 1: SCRIBE (Monografías)
**Responsabilidad:** Generador de monografías (Cap.0 a Cap.5) para estudiantes de diplomados/postgrados.

**Frontend:**
- `src/app/scribe/page.tsx` — Punto de entrada (wizard + workspace)
- `src/app/projects/[id]/workspace/page.tsx` — Editor colaborativo (usado POR Scribe)

**API Routes:**
- `POST /api/projects` — crear proyecto tipo "monografia"
- `POST /api/projects/generate-phase` — generar fase (Cap.0-5)
- `POST /api/projects/[id]/phases` — listar fases
- `POST /api/projects/edit-phase-section` — editar sección
- `POST /api/projects/[id]/observaciones` — feedback de tutor (COMPARTIDO con Proyecto Grado)
- `POST /api/projects/[id]/preguntas/generar` — banco de preguntas defensa
- `POST /api/projects/[id]/latex` — compilar a LaTeX
- `POST /api/projects/[id]/pdf` — exportar PDF
- `POST /api/projects/[id]/qa` — Q&A sobre doc

**Prompts (Server-only):**
- `src/lib/prompts/scribe/` (12 archivos)
  - `cap0-propuesta-temas.ts`
  - `cap1.ts`, `cap2.ts`, `cap3.ts`, `cap4.ts`, `cap5.ts`
  - `cap1-variantes/umss.ts`, `cap1-variantes/ucb.ts`, `cap1-variantes/unifranz.ts`
  - `banco-preguntas.ts`
  - `compilar-latex.ts`
  - `consolidar-referencias.ts`
  - `control-calidad.ts`
  - `resumen-ejecutivo.ts`

**Librerías internas:**
- `aiProvider.ts` — cascada IA (Groq → Anthropic → OpenAI)
- `hiloConductor.ts` — coherencia entre capítulos
- `modelRouter.ts` — selección de modelo por fase
- `latexMonografia.ts` — generador LaTeX (markdown → LaTeX)
- `cap1Variants.ts` — variantes por universidad
- `ai/guardian.ts` — anti-alucinación

**Flujo paso a paso:**
```
1. Usuario entra a /scribe
2. Selecciona tipo de proyecto + universidad + tema
3. API POST /api/projects crea "monografia"
4. Redirige a /projects/[id]/workspace
5. Usuario genera Cap.0 (propuesta tema)
   → POST /api/projects/generate-phase
   → Carga src/lib/prompts/scribe/cap0-propuesta-temas.ts
   → Aplica hiloConductor (coherencia con historial)
   → Llama IA (Groq, fallback Anthropic/OpenAI)
   → Pasa por guardian.ts (anti-alucinación)
   → Persiste en DB (via src/lib/db/index.ts)
6. Genera Cap.1-5 secuencialmente (mismo flujo)
7. Post-procesa: banco de preguntas + LaTeX + ZIP Overleaf + PDF
```

**Dependencias explícitas:**
- `src/lib/db/index.ts` (persistencia)
- `src/lib/auth.ts` (JWT + Google OAuth)
- `src/lib/persistence.ts` (fallback disk)
- `src/app/projects/[id]/workspace/page.tsx` (COMPARTIDO con Proyecto Grado)

---

### SERVICIO 2: PROYECTO DE GRADO (Plan de Negocio)
**Responsabilidad:** Generador de planes de negocio (23 fases) para estudiantes de ingeniería.

**Frontend:**
- `src/app/projects/[id]/workspace/page.tsx` — Mismo workspace que Scribe (SOLAPAMIENTO NIVEL 1)

**API Routes:**
- `POST /api/projects` — crear proyecto tipo "proyecto_grado"
- `POST /api/projects/generate-phase` — generar fase (Cap.0-23)
- Todas las rutas de `/api/projects/[id]/*` son compartidas con Scribe

**Prompts (Server-only):**
- `src/lib/prompts/proyectoGrado/` (23 archivos)
  - `cap0-idea-negocio.ts`
  - `cap1-marco-referencial.ts`, `cap2-marco-teorico.ts`
  - `cap3a-pestel.ts`, `cap3b-porter.ts`, `cap3c-matrices.ts`
  - `cap3d-diseno-encuesta.ts`, `cap3e-analisis-encuesta.ts`, `cap3f-demanda-cuota.ts`
  - `cap4a-organizacional.ts`, `cap4abis-rrhh.ts`, `cap4b-legal.ts`, `cap4c-tecnico.ts`
  - `cap4d-branding.ts`, `cap4e-marketing.ts`, `cap4f-financiero.ts`, `cap4g-evaluacion.ts`
  - `conclusiones.ts`, `defensa.ts`, `referencias.ts`, `resumen-ejecutivo.ts`
  - `latex.ts`, `reglas-comunes.ts`

**Librerías internas:**
- Reutiliza 100% las mismas: `aiProvider.ts`, `hiloConductor.ts`, `modelRouter.ts`
- Diferencia: prompts distintos (`src/lib/prompts/proyectoGrado/*`)

**Flujo paso a paso:**
```
1. Usuario entra a /scribe (MISMO PUNTO DE ENTRADA)
2. Selecciona tipo "proyecto_grado"
3. API diferencia por tipo_proyecto en DB
4. Todo el flujo es IDÉNTICO a Scribe, pero con prompts diferentes
5. Genera Cap.0-23 secuencialmente
```

**Análisis de solapamiento:** 
```
✅ Backend: %100 code reuse (mismo motor)
❌ Frontend: También %100 code reuse (mismo workspace)
❌ Riesgo: Si cambias /api/projects/generate-phase para Scribe, rompes Proyecto Grado
```

---

### SERVICIO 3: AXIOM (Simulador de Exámenes)
**Responsabilidad:** Generar exámenes personalizados, evaluar respuestas, ranking de podios.

**Frontend:**
- `src/app/axiom/page.tsx` — Dashboard simulador (exámenes, ranking, plan personalizado)

**API Routes:**
- `GET/POST /api/axiom/examenes` — gestión de exámenes
- `POST /api/axiom/plan-personalizado` — plan IA personalizado
- `GET /api/axiom/progreso/estadisticas` — métricas usuario
- `GET /api/axiom/ranking` — ranking de podios

**Librerías internas:**
- `src/lib/axiom/` (CARPETA SEPARADA)
  - `evaluador.ts` — evaluador de respuestas
  - `pdf-builder.ts` — builder de PDFs de exámenes
  - Usa `aiProvider.ts` (cascada IA)

**Flujo paso a paso:**
```
1. Usuario entra a /axiom
2. Ve dashboard con exámenes, ranking, plan personalizado
3. Click en "Tomar examen"
   → GET /api/axiom/examenes (obtiene exámenes)
   → Usa IA para GENERAR preguntas dinámicamente
4. Usuario responde preguntas
5. POST respuestas → /api/axiom/plan-personalizado
   → IA evalúa respuestas
   → Genera plan personalizado (qué estudiar)
6. Aparece en ranking de podios (GET /api/axiom/ranking)
```

**Diferencia clave con Scribe/Proyecto Grado:**
- NO usa `hiloConductor.ts` (no hay "continuidad" entre exámenes)
- NO genera documentos PDF para descarga
- SÍ evalúa respuestas del usuario (Scribe/PG solo GENERAN)
- SÍ usa ranking (competencia entre usuarios)

---

### SERVICIO 4: LUMEN (Generador Docente)
**Responsabilidad:** Generar materiales docentes a partir de documentos del usuario.

**Frontend:**
- `src/app/lumen/page.tsx` — Dashboard Lumen

**API Routes:**
- ❌ NO TIENE RUTAS API PROPIAS (fallback a `/api/projects`)

**Status:**
- 🔴 **STUB IMPLEMENTATION** — página existe pero funcionalidad incompleta
- Probablemente reutiliza `/api/projects` como Scribe/Proyecto Grado

**Análisis:**
```
Lumen debería tener:
  POST /api/lumen/generar-clase
  POST /api/lumen/generar-evaluacion
  POST /api/lumen/generar-rubrica
Pero ACTUALMENTE reutiliza /api/projects/generate-phase
→ Solapamiento INDIRECTO
```

---

### SERVICIO 5: MENTOR (Tutoría)
**Responsabilidad:** Tutoría 1-a-1 y feedback personalizado sobre documentos.

**Frontend:**
- `src/app/mentor/page.tsx` — Dashboard Mentor

**API Routes:**
- ❌ NO TIENE RUTAS API PROPIAS
- Probablemente reutiliza `/api/projects/[id]/qa` o `/api/projects/[id]/observaciones`

**Status:**
- 🟡 **PARTIAL IMPLEMENTATION** — existe componente, pero API unclear

---

### SERVICIO 6: NÚCLEO (Hub Orquestador)
**Responsabilidad:** Punto central que orquesta acceso a Scribe, Axiom, Lumen, Mentor.

**Frontend:**
- `src/app/nucleo/page.tsx` — Dashboard Núcleo (lista de productos disponibles)

**API Routes:**
- `GET /api/services` — lista servicios disponibles (MOCK DATA)

**Status:**
- 🟡 **PARTIAL IMPLEMENTATION**
- `/api/services` retorna MOCK_SERVICIOS (solo "Monografía Académica")
- NO tiene lógica de orquestación real

**Análisis:**
```
Lo que DEBERÍA hacer Núcleo:
1. Orquestar acceso a Scribe, Axiom, Lumen, Mentor, Laboratorio
2. Mantener historial de proyectos del usuario
3. Cambiar de producto sin logout
4. Sincronizar estado entre servicios (ej: cambio de plan → acceso a Lumen)

Lo que ACTUALMENTE hace:
1. Retorna lista hardcoded de servicios
2. Redirige a /scribe, /axiom, /lumen, /mentor (sin lógica)
```

---

### SERVICIO 7: LABORATORIO (Sandbox/Experimentación)
**Responsabilidad:** Área experimental para probar features nuevas antes de pasar a producción.

**Frontend:**
- `src/app/laboratorio/page.tsx` — Sandbox interactivo (partículas animadas, pruebas visuales)

**API Routes:**
- ❌ NO TIENE RUTAS API PROPIAS

**Status:**
- 🟢 **WORKING** — pero sin integración con resto del sistema
- Contiene componentes de prueba y visualización de partículas

---

### SERVICIO 8: PAGOS (Tigo Money / QR Bancario / Transferencia)
**Responsabilidad:** Procesamiento de pagos para activar planes (Estándar, Pro, Elite).

**Frontend:**
- `src/app/pago/page.tsx` — Página de pagos

**API Routes:**
- `POST /api/payments` — crear solicitud de pago
- `GET/PATCH /api/payments/[id]` — obtener estado / aprobar
- `GET/POST /api/admin/payments` — admin: listar y gestionar pagos
- `POST /api/admin/pdf-solicitudes` — generar PDF de solicitudes

**Flujo paso a paso:**
```
1. Usuario selecciona plan (Estándar Bs.150 | Pro Bs.300/mes)
2. POST /api/payments
   → Crea entrada en BD con status "pendiente"
   → Retorna detalles (código QR, número Tigo Money, etc.)
3. Usuario realiza pago externo (Tigo Money / transferencia / QR)
4. Admin ve en /admin/pagos → click "Aprobar"
   → PATCH /api/payments/[id] { status: "aprobado" }
   → Sistema activa plan del usuario
   → Usuario obtiene acceso a features del plan
5. Webhook futuro: Integración real con Tigo Money para auto-activación
```

**Librerías internas:**
- `src/lib/auth.ts` — guarda plan en JWT
- `src/lib/db/index.ts` — tabla `payments`

---

### SERVICIO 9: ADMIN (Panel de Administración)
**Responsabilidad:** Gestión total de sistema: usuarios, proyectos, pagos, prompts, configuración IA.

**Frontend:**
- `src/app/admin/page.tsx` — Dashboard admin (entrada al panel)
- `src/app/admin/*/page.tsx` — 25+ subpaneles

**API Routes (25+ endpoints):**
```
Core:
  GET /api/admin/dashboard — métricas globales
  GET /api/admin/estadisticas — estadísticas por producto
  GET /api/admin/logs — logs de error
  GET /api/admin/feedback-insights — insights de feedback tutor

Usuarios y Proyectos:
  GET/POST /api/admin/usuarios — gestión usuarios
  GET /api/admin/usuarios/[id]/historial — historial usuario
  GET/POST /api/admin/proyectos — gestión proyectos
  GET/POST /api/admin/monografias — gestión monografías legacy
  GET /api/admin/recent-topics — tópicos recientes generados

Configuración Sistema:
  GET/POST /api/admin/prompts — editar prompts master
  GET/POST /api/admin/workspace-prompts — prompts por workspace
  GET/POST /api/admin/ai-config — config de modelos IA
  GET/POST /api/admin/phase-definitions — definiciones de fases
  GET/POST /api/admin/project-types — tipos de proyectos
  GET/POST /api/admin/universities — universidades y formatos
  GET/POST /api/admin/university-assets — assets por universidad
  GET/POST /api/admin/calibration-questions — preguntas de calibración

Especializados:
  GET/POST /api/admin/payments — gestión de pagos
  GET /api/admin/banco-observaciones — banco de observaciones tutores
  POST /api/admin/projects/[id]/defensa-materiales — generar materiales defensa
  GET /api/admin/hilos — auditoría de hilos conductores
  POST /api/admin/descargar-latex/[id] — descarga LaTeX por admin
```

**Status:**
- 🟢 **FULLY IMPLEMENTED** — 25+ endpoints, panel completo
- ⚠️ **Acceso:** `/api/admin/*` requiere `requireAuth` + rol `admin` (check en `api-auth.ts`)

---

### SERVICIO 10: AUTH (Autenticación)
**Responsabilidad:** Gestión de usuario, login/logout, OAuth, planes.

**Frontend:**
- `src/app/login/page.tsx` — Login (Google OAuth + demo)

**API Routes:**
- `POST /api/auth/google` — iniciar Google OAuth
- `GET /api/auth/callback/google` — callback de Google
- `POST /api/auth/demo` — login demo (sin Google)
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — obtener usuario actual
- `POST /api/auth/switch-plan` — cambiar plan
- `POST /api/auth/admin-login` — login admin especial

**Librerías internas:**
- `src/lib/auth.ts` — lógica de JWT, Google OAuth, validación
- `src/lib/api-auth.ts` — middleware de autenticación
- Usa `jose` para JWT
- Estructura de JWT: `{ sub, email, name, plan, role, iat, exp }`

**Flujo paso a paso:**
```
1. Usuario abre /login
2. Click "Entrar con Google"
   → POST /api/auth/google
   → Redirige a Google OAuth consent
3. Usuario autoriza
   → Google redirige a GET /api/auth/callback/google?code=...&state=...
   → Backend cambia code por token
   → Crea JWT con plan "demo"
   → Redirige a /scribe (u otro dashboard)
4. Cookie JWT se envía en todas las requests
5. Endpoints API validan JWT vía `requireAuth()` middleware
```

---

### SERVICIO 11: TUTORIAL / LEGALES (Páginas Estáticas)
**Responsabilidad:** Documentación, términos de servicio, privacidad.

**Frontend:**
- `src/app/tutorial/page.tsx` — Tutorial de bienvenida
- `src/app/terminos/page.tsx` — Términos de servicio
- `src/app/privacidad/page.tsx` — Política de privacidad

**API Routes:**
- ❌ NO TIENE RUTAS API

**Status:**
- 🟢 **STATIC PAGES** — sin lógica dinámica

---

### LEGACY / OTROS

#### Dashboard (DEPRECATED?)
- `src/app/dashboard/page.tsx` — ¿Duplica funcionalidad de Núcleo?

#### Monografías Legacy
- `/api/monografias/*` — endpoints OLD de monografías (pre-refactor)
- `/api/citas/*` — citas bibliography (OLD)
- `/api/documentos/*` — gestión documentos (OLD)
- `/api/cap1-variants` — variantes Cap.I (OLD)
- `/api/compilar/[id]`, `/export/latex`, `/export/pdf` — OLD exports

**Status:**
- 🔴 **DEPRECATED BUT STILL IN USE** — `/api/projects` es nuevo, pero old endpoints siguen activos

#### Otros endpoints generales
- `POST /api/generate` — endpoint genérico de generación
- `GET /api/universities` — lista universidades
- `GET /api/services` — lista servicios (MOCK)

---

## ANÁLISIS DE SOLAPAMIENTO

### NIVEL 1: Solapamiento de Backend (CRÍTICO)

#### Caso 1: Scribe + Proyecto de Grado → Mismo motor `/api/projects/*`
```
Problema:
  POST /api/projects/generate-phase
    ├─ Scribe (tipo="monografia") → carga src/lib/prompts/scribe/*
    └─ Proyecto Grado (tipo="proyecto_grado") → carga src/lib/prompts/proyectoGrado/*
  Pero el endpoint es UNO SOLO

Riesgo:
  - Si cambias lógica en generate-phase, afecta AMBOS servicios
  - Refactorar uno sin romper otro es muy difícil
  - Testing es complejo: cambio en scribe/cap1.ts puede romper pg/cap0-idea.ts
  - No hay separación clara de responsabilidades

Solución ideal:
  POST /api/scribe/generate-phase (específico Scribe)
  POST /api/proyectoGrado/generate-phase (específico Proyecto Grado)
  
  Ambos podrían compartir:
    - aiProvider.ts
    - hiloConductor.ts
    - modelRouter.ts
    - ai/guardian.ts
  Pero API sería INDEPENDIENTE
```

#### Caso 2: Axiom → Reutiliza `aiProvider.ts` SIN interfaz clara
```
Problema:
  Axiom tiene /api/axiom/plan-personalizado que llama a IA
  Scribe tiene /api/projects/generate-phase que llama a IA
  Ambos usan aiProvider.ts, pero:
    - No hay interfaz compartida (utils, tipos, etc.)
    - Config de IA diferente por servicio
    - Token limits distintos
    - modelRouter.ts elige modelo diferente

Riesgo:
  - Si cambias aiProvider.ts, puede afectar a Axiom sin darte cuenta
  - Debugging es lento: ¿dónde está el error? ¿En Axiom o en aiProvider?

Solución:
  Extraer interfaz clara:
    src/lib/ai-core/
      ├─ aiProvider.ts (existente)
      ├─ types.ts (nuevos)
        ├─ AIRequest { provider, model, prompt, config }
        ├─ AIResponse { text, usage, model_used, latency }
        ├─ AIConfig { temperature, max_tokens, top_p }
      └─ contract.ts (contrato claro)
        └─ CallAI(req: AIRequest): Promise<AIResponse>
  
  Luego todos los servicios llaman igual:
    import { CallAI, AIRequest } from "@/lib/ai-core";
    const response = await CallAI({
      provider: "groq",
      model: "llama-3.3-70b",
      prompt: ...,
      config: { temperature: 0.5 }
    });
```

#### Caso 3: Lumen + Mentor → Reutilizan `/api/projects` sin endpoint propio
```
Problema:
  Lumen NO tiene /api/lumen/generar-clase
  Mentor NO tiene /api/mentor/generar-tutoría
  Ambos probablemente usan /api/projects/generate-phase
  
  Pero su PROPÓSITO es DIFERENTE:
    - Scribe/PG: Generar documento del estudiante
    - Lumen: Generar material DOCENTE
    - Mentor: Evaluar + feedback PERSONALIZADO

Riesgo:
  - Confusión: ¿Es Lumen un servicio o un tab dentro de Scribe?
  - Prompts de Lumen están mezclados con Scribe?
  - Si cambias estructura de /api/projects, ¿rompes Lumen?

Solución:
  Crear endpoints separados:
    POST /api/lumen/generar-clase { tema, nivel, duracion }
    POST /api/mentor/generar-retroalimentacion { projectId, phaseId, feedback_type }
  
  Compartir lógica de IA, pero endpoint SEPARADO
```

### NIVEL 2: Solapamiento de Frontend (SIGNIFICATIVO)

#### Caso 1: Scribe + Proyecto Grado → Mismo workspace
```
Problema:
  /projects/[id]/workspace/page.tsx es usado POR AMBOS
  Pero muestra fases completamente diferentes:
    - Scribe: 6 fases (Cap.0-5)
    - Proyecto Grado: 23 fases (Cap.0-23)
  
  El componente tiene lógica condicional:
    if (tipo_proyecto === "monografia") { ... Cap.0-5 ... }
    else if (tipo_proyecto === "proyecto_grado") { ... Cap.0-23 ... }
  
  Resultado: componente GIGANTESCO y difícil de mantener

Riesgo:
  - El file workspace/page.tsx probablemente tiene 3000+ líneas
  - Cambio en Cap.III Scribe puede afectar Cap.4a Proyecto Grado
  - Testing es imposible: test de "generar Cap.II" debe verificar ambos tipos

Solución:
  Crear componentes separados:
    src/app/scribe/workspace/page.tsx (específico Scribe)
    src/app/proyectoGrado/workspace/page.tsx (específico PG)
    
  Ambos pueden compartir:
    src/components/workspace/PhaseGenerator.tsx (genérico)
    src/components/workspace/Bibliography.tsx (genérico)
    src/components/workspace/LatexPreview.tsx (genérico)
```

#### Caso 2: Núcleo + Dashboard + Login → Duplicación de flujos
```
Problema:
  - /login → redirige a /scribe (hardcoded)
  - /nucleo → muestra lista de servicios → redirige a /scribe, /axiom, etc.
  - /dashboard → ¿Qué es? ¿Duplica Núcleo?
  
  Usuario confundido: ¿Dónde está mi dashboard? ¿Scribe, Núcleo o Dashboard?

Solución:
  Unificar en /dashboard o /nucleo (ONE ENTRY POINT)
  Dashboard muestra:
    - Si no logueado: /login
    - Si logueado: lista de servicios disponibles
    - Historial de proyectos
    - Panel de cuenta (cambiar plan, datos, etc.)
```

### NIVEL 3: Solapamiento de Librerías (MENOR pero significativo)

#### Caso 1: `hiloConductor.ts` reutilizado SIN documentación
```
Problema:
  hiloConductor.ts es CORE para Scribe/Proyecto Grado
  Pero:
    - NO hay tipos TypeScript claros
    - Documentación incompleta
    - Axiom NO usa (¿debe usar?)
    - Mentor NO usa (¿debe usar?)

Solución:
  Documentar interfaz en src/lib/hiloConductor.ts:
    /**
     * Hilo conductor: mantiene coherencia entre fases secuenciales
     * 
     * Uso:
     *   const hilo = buildHilo(projectId, previousPhases);
     *   const coherent_prompt = await enhanceWithHilo(prompt, hilo);
     * 
     * Aplicable a:
     *   ✅ Scribe (Cap.0-5 secuencial)
     *   ✅ Proyecto Grado (Cap.0-23 secuencial)
     *   ❌ Axiom (exámenes NO secuenciales)
     *   ⚠️  Mentor (retroalimentación sobre documento EXISTENTE)
     */
```

---

## MAPA DE DEPENDENCIAS CRUZADAS

```
                    ┌─ NÚCLEO (orchestrator)
                    │    │
        ┌───────────┼────┼─────────────────┐
        │           │    │                 │
    Scribe       Axiom  Lumen          Mentor
      │            │      │              │
      └────────────┼──────┼──────────────┘
                   │      │
              /api/projects/* (COMPARTIDO)
                   │
         ┌─────────┴──────────┐
         │                    │
    hiloConductor.ts   modelRouter.ts
         │                    │
    aiProvider.ts ◄───────────┴─ Cascada IA
         │                        (Groq→Anthropic→OpenAI)
         │
    ┌────┴────────────────────┐
    │                         │
 AUTH              PERSISTENCIA
(JWT,OAuth)         (Supabase/Memory/Disk)
    │                         │
    └─────────┬───────────────┘
              │
          USUARIOS
          PROYECTOS
          PAGOS
          
        ┌──────────────────────┐
        │  ADMIN PANEL (25+)   │
        │  (Acceso a TODO)     │
        └──────────────────────┘
```

**Puntos críticos:**
1. **Scribe/Proyecto Grado → `/api/projects/*`** — acoplamiento FUERTE
2. **Todos → `aiProvider.ts`** — punto único de fallo
3. **Todos → `hiloConductor.ts`** — SIN interfaz clara
4. **Todos → AUTH** — requiere JWT válido
5. **ADMIN** — acceso a todos los datos (no puede fallar)

---

## RECOMENDACIONES DE CONSOLIDACIÓN

### RECOMENDACIÓN 1: Separar endpoints API por servicio (FASE 1)

**Objetivo:** De 60+ endpoints "genéricos" a **servicios modularizados**

**Cambios:**
```
ANTES (confuso):
  POST /api/projects/generate-phase { projectId, phaseId, ... }
    → ¿Cuál es el tipo? ¿Scribe o Proyecto Grado?

DESPUÉS (claro):
  POST /api/scribe/generate-phase { projectId, phaseId, ... }
  POST /api/proyectoGrado/generate-phase { projectId, phaseId, ... }
  POST /api/axiom/generar-examen { tema, dificultad, ... }
  POST /api/lumen/generar-clase { tema, nivel, ... }
  POST /api/mentor/generar-retroalimentacion { projectId, feedback_type, ... }
```

**Carpeta resultante:**
```
src/app/api/
  ├─ auth/ (MANTENER)
  ├─ admin/ (MANTENER)
  ├─ payments/ (MANTENER)
  │
  ├─ scribe/ (CREAR)
  │   ├─ generate-phase/route.ts
  │   ├─ edit-phase/route.ts
  │   └─ ... (todo lo Scribe)
  │
  ├─ proyectoGrado/ (CREAR)
  │   ├─ generate-phase/route.ts
  │   └─ ... (todo Proyecto Grado)
  │
  ├─ axiom/ (REFACTORIZAR)
  │   ├─ generar-examen/route.ts
  │   └─ ...
  │
  ├─ lumen/ (CREAR)
  │   ├─ generar-clase/route.ts
  │   └─ ...
  │
  ├─ mentor/ (CREAR)
  │   ├─ generar-retroalimentacion/route.ts
  │   └─ ...
  │
  └─ projects/ (DEPRECATE, mantener para compatibilidad)
      └─ [id]/route.ts (solo lectura, redirige a servicio específico)
```

**Beneficio:**
- ✅ Cada servicio es INDEPENDIENTE
- ✅ Cambios en Scribe NO rompen Proyecto Grado
- ✅ Testing es separado por servicio
- ✅ Onboarding de nuevos ingenieros es más fácil

**Riesgo:**
- ❌ Cambio BREAKING para frontend (requiere update)
- ❌ Migración lenta (6+ semanas)

---

### RECOMENDACIÓN 2: Crear interfaz clara para IA (`src/lib/ai-core/`)

**Objetivo:** De "todos importan `aiProvider.ts` de diferentes formas" a **interfaz unificada**

**Estructura:**
```
src/lib/ai-core/
  ├─ index.ts (export principal)
  ├─ types.ts (AIRequest, AIResponse, AIConfig)
  ├─ provider.ts (CallAI función principal)
  ├─ cascade.ts (lógica de fallback Groq→Anthropic→OpenAI)
  ├─ validators.ts (validar request antes de llamar)
  └─ telemetry.ts (logging + rastreo de llamadas)
```

**Antes:**
```typescript
import { llamarIA } from "@/lib/aiProvider";
const response = await llamarIA(prompt, { temperature: 0.5 });
```

**Después:**
```typescript
import { CallAI } from "@/lib/ai-core";
const response = await CallAI({
  service: "scribe", // para logging
  prompt,
  config: { temperature: 0.5, max_tokens: 2000 },
});
```

**Beneficio:**
- ✅ Llamadas consistentes
- ✅ Fácil de testear
- ✅ Debugging centralizado
- ✅ Telemetría consistente

---

### RECOMENDACIÓN 3: Consolidar Núcleo en Dashboard único

**Objetivo:** De "Login → Scribe | Dashboard | Núcleo" a **ONE ENTRY POINT**

**Flujo nuevo:**
```
1. Usuario login (/login)
2. Redirige a /dashboard (ÚNICO)
3. Dashboard muestra:
   - Servicios disponibles (según plan)
   - Proyectos recientes
   - Panel de cuenta
   - Admin panel (si rol=admin)
4. Click en servicio → /scribe, /axiom, /lumen, etc.
```

**Carpeta:**
```
src/app/dashboard/
  ├─ page.tsx (dashboard principal)
  ├─ servicios/
  │   ├─ scribe-card.tsx
  │   ├─ axiom-card.tsx
  │   └─ ...
  └─ account/
      ├─ cambiar-plan.tsx
      └─ datos-usuario.tsx
```

---

### RECOMENDACIÓN 4: Separar prompts por servicio físicamente

**Objetivo:** De "todos en `src/lib/prompts/`" a **carpetas separadas por contexto**

**Antes:**
```
src/lib/prompts/
  ├─ scribe/
  │   ├─ cap0.ts
  │   ├─ cap1.ts
  │   └─ ... (todo Scribe)
  │
  └─ proyectoGrado/
      ├─ cap0.ts
      └─ ... (todo PG)
```

**Después:**
```
src/lib/ai-services/
  │
  ├─ scribe/
  │   ├─ prompts/
  │   │   ├─ cap0.ts
  │   │   └─ ...
  │   ├─ validators.ts (validación Scribe)
  │   └─ config.ts (tokens, temps, etc.)
  │
  ├─ proyectoGrado/
  │   ├─ prompts/
  │   │   ├─ cap0.ts
  │   │   └─ ...
  │   ├─ validators.ts
  │   └─ config.ts
  │
  ├─ axiom/
  │   ├─ prompts/
  │   ├─ evaluador.ts
  │   └─ config.ts
  │
  └─ shared/
      ├─ hiloConductor.ts
      ├─ aiProvider.ts
      └─ ai-core/
```

**Beneficio:**
- ✅ Cada servicio es carpeta AUTÓNOMA
- ✅ Config por servicio (tokens, temperaturas, etc.)
- ✅ Validaciones específicas por servicio

---

## PLAN DE REFACTOR PROPUESTO

### FASE 1 (4 semanas): Fundaciones
```
SEMANA 1:
  ✅ Crear src/lib/ai-core/ con interfaz unificada
  ✅ Actualizar aiProvider.ts para usar nueva interfaz
  ✅ Documentar Contract en tipos

SEMANA 2:
  ✅ Crear POST /api/scribe/generate-phase
  ✅ Refactorizar Scribe a usar /api/scribe/*
  ✅ Mantener /api/projects/* para compatibilidad (redirige)

SEMANA 3:
  ✅ Crear POST /api/proyectoGrado/generate-phase
  ✅ Refactorizar Proyecto Grado a usar /api/proyectoGrado/*
  ✅ Testing exhaustivo: ambos servicios funcionar en paralelo

SEMANA 4:
  ✅ Refactorizar Axiom a usar /api/axiom/generar-examen
  ✅ Actualizar frontend (scribe/page.tsx, axiom/page.tsx)
  ✅ Testing e2e: flujo completo cada servicio
```

### FASE 2 (3 semanas): Frontend Modularización
```
SEMANA 1-2:
  ✅ Separar src/app/scribe/workspace/ de proyectoGrado/workspace/
  ✅ Crear componentes compartidos en src/components/workspace/
  ✅ Testing de interacción usuario en cada servicio

SEMANA 3:
  ✅ Consolidar Núcleo → /dashboard único
  ✅ Navegar entre servicios sin perder estado
  ✅ Historial de proyectos persistente
```

### FASE 3 (2 semanas): Lumen + Mentor + Cleanup
```
SEMANA 1:
  ✅ Crear POST /api/lumen/generar-clase
  ✅ Crear POST /api/mentor/generar-retroalimentacion
  ✅ Prompts específicos para cada servicio

SEMANA 2:
  ✅ Deprecate /api/projects/* (SOLO lectura)
  ✅ Cleanup legacy endpoints (/api/monografias/*)
  ✅ Audit y testing final
```

---

## SUMMARY: Estado Actual vs. Ideal

| Aspecto | ACTUAL | IDEAL |
|---------|--------|-------|
| **API Endpoints** | 60+ genéricos en `/api/projects/*` | 5 servicios con endpoints propios |
| **Separación servicios** | Scribe+PG comparten TODO | Cada uno independiente |
| **Interface IA** | Cada servicio llama diferente | Interfaz unificada `CallAI()` |
| **Frontend Workspace** | Componente GIGANTE (2000+ líneas) | 5 componentes separados |
| **Dashboard** | Confuso: Login→Dashboard? Núcleo? | ONE ENTRY POINT: /dashboard |
| **Prompts** | Mezclados en `src/lib/prompts/` | Cada servicio tiene carpeta propia |
| **Testing** | Difícil: cambio Scribe rompe PG | Cada servicio testeable aislado |
| **Onboarding** | "¿Dónde está X?" | Claro: /api/scribe/, /api/axiom/, etc. |
| **Deuda Técnica** | ALTA: acoplamiento oculto | BAJA: módulos claros |

---

## CONCLUSIÓN

El SaaS es **funcional y feature-complete**, pero está **arquitectónicamente acoplado**. El refactor propuesto (6 meses, 3 fases) es una **inversión a mediano plazo** que:

✅ Hará mantenimiento 10x más fácil  
✅ Permitirá agregar servicios nuevos sin romper existentes  
✅ Facilitará testing e debugging  
✅ Mejorará onboarding de nuevos developers  

🚀 **No bloquea features nuevas**, se puede hacer en paralelo.
