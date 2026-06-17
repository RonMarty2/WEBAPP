# BITÁCORA DE CONTEXTO MAESTRA — Laboratorio Académico PRO
> Generada: 2026-06-17 | Sirve para retomar en cualquier IA desde cero.
> Fuente: revisión de todos los repositorios y bitácoras del ecosistema.

---

## 1. QUÉ ES ESTE PROYECTO (30 segundos)

**Laboratorio Académico PRO** es una plataforma SaaS boliviana que ayuda a estudiantes universitarios a generar documentos académicos reales (monografías, tesis, proyectos de grado) usando IA, sin alucinaciones, con citas APA 7 verificables.

**Frase clave:** *"La IA redacta. El estudiante aprueba. El documento es real."*

**Mercado:** Bolivia (Cochabamba, La Paz, Santa Cruz). Expansión: Perú, Ecuador, Paraguay.

**Dos caminos para el estudiante:**
- **Modo automático:** la IA genera todo el documento desde el tema. Para el estudiante apurado.
- **Modo guiado/conectado:** el estudiante trabaja módulo por módulo (aprende + construye datos reales), y al final la IA consolida todo en el documento.

---

## 2. ARQUITECTURA GENERAL DEL ECOSISTEMA

El ecosistema tiene **13 repositorios**. Aquí está la jerarquía:

```
WEBAPP_COMPLETO/
├── WEBAPP                    ← REPOSITORIO PRINCIPAL (Next.js SaaS)
│   └── Es el orquestador y la UI que ven los usuarios
│
├── C0.Cerebro_contrato       ← Contrato compartido entre todos los cerebros
│   └── Define BrainRequest, BrainResponse, ProjectEnvelope (TypeScript + JSON Schema)
│
├── C11_WEBAPP-Orchestrator   ← Capa de orquestación de cerebros para WEBAPP
│   └── Llama a los cerebros via HTTP, valida contratos, persiste evidencia
│
└── CEREBROS (servicios REST independientes, sin UI):
    ├── C3_Academic-Methodology-Engine    → árbol de problemas, objetivos, variables, metodología
    ├── C4_Megaprompt-Strategy-Business-Engine → PESTEL, Porter, FODA, EFE/EFI, MPC
    ├── C5_Operations-Technical-Feasibility-Engine → operaciones y factibilidad técnica
    ├── C6_Legal-Regulatory-Engine-Bolivia → marco legal boliviano
    ├── C7_Organization-HR-Engine         → organigrama, RRHH, estructura
    ├── C8_Brand-Marketing-Engine         → branding, marketing, buyer persona
    ├── C9_Academic-Document-Engine       → ensambla, valida, convierte a LaTeX, genera ZIP Overleaf
    ├── C10_Defense-QA-Engine             → auditoría final, banco de preguntas, simulacro defensa
    ├── market-intelligence-engine        → C2 (sin prefijo C_ pero ES un cerebro) — datos Censo 2024, TAM/SAM/SOM, encuestas, segmentación
    └── simuladorPRO                      → C1 (sin prefijo C_ pero ES un cerebro) — simulador financiero de proyectos de inversión, eventos económicos bolivianos
```

**WEBAPP es el frontend que el usuario ve. Los cerebros son APIs que WEBAPP llama.**

⚠️ NOTA DE NOMENCLATURA: Los cerebros con prefijo `C_` van del C0 al C11. Pero hay 2 cerebros más que NO tienen ese prefijo porque son repos más antiguos y ya tienen usuarios — sus nombres NO se van a cambiar para no romper integraciones:
- `simuladorPRO` = cerebro C1 (finanzas / simulación de proyectos de inversión)
- `market-intelligence-engine` = cerebro C2 (inteligencia de mercado / datos reales Bolivia)

Son cerebros igual que los demás. Solo les falta el prefijo C_.

---

## 3. ESTADO ACTUAL DE WEBAPP (el producto principal)

### Stack técnico
| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.6 (App Router — SIEMPRE, nunca Pages Router) |
| UI | React 19 + Tailwind CSS 4 + Framer Motion 12 |
| Lenguaje | TypeScript 5 estricto (sin `any` sin justificación) |
| Base de datos | Supabase (PostgreSQL) — con fallback in-memory + disk (`.store/data.json`) |
| Auth | Google OAuth + JWT (jose) |
| IA Principal | Anthropic → `claude-haiku-4-5-20251001` |
| IA Fallback 1 | Google Gemini → `gemini-2.5-flash` |
| IA Fallback 2 | OpenAI → `gpt-4o-mini` |
| IA Fallback final | Groq → `llama-3.3-70b-versatile` |
| Export | LaTeX → Overleaf → PDF |
| Deploy | Vercel (PENDIENTE — no está desplegado aún) |

### Productos vivos dentro de WEBAPP

| Producto | Ruta | Estado |
|---------|------|--------|
| **Scribe** (generador autónomo de monografías) | `/scribe`, `/projects/[id]/workspace` | ✅ Operacional |
| **Proyecto de Grado** (plan de negocio, 23 fases) | `/projects/[id]/workspace-pg` | ⚠️ Solo UCATEC completo |
| **Generador Conectado** (integra módulos) | `/generador`, `/generador/[id]/documento` | ✅ Waves 1-4 listas |
| **Módulo Idea** | `/idea/**` | ✅ Completo |
| **Módulo Mercados** | `/mercados/**` | ✅ Completo |
| **Módulo Estrategia** | `/estrategia/**` | ✅ Completo (13 herramientas) |
| **Módulo Marketing** | `/marketing/**` | ✅ Completo |
| **Módulo Organización** | `/organizacion/**` | ✅ Completo |
| **Módulo Finanzas** (simuladorPRO migrado) | `/finanzas/**` | ✅ Completo + IVA/IT boliviano |
| **Módulo Defensa** | `/defensa/**` | ✅ Completo |
| **Axiom** (simulador examen ingreso UMSS) | `/axiom` | ✅ Operacional |
| **Admin panel** | `/admin/**` | ✅ 17 subsecciones |
| **Pagos** | `/pago`, `/admin/pagos` | ✅ Manual (Tigo Money, QR, transferencia) |

### Universidades soportadas
| Universidad | Estado | Guía PDF oficial |
|------------|--------|-----------------|
| UMSS Cochabamba | ✅ Guía oficial cargada | 2 PDFs cargados |
| UCB Cochabamba | ✅ Guía oficial cargada | 1 PDF cargado |
| UNIFRANZ Cochabamba | ✅ Guía oficial cargada | 1 PDF cargado |
| UMSA, UAGRM, UTO, USFX, UPB, EMI, UCATEC | ⚠️ Sin guía PDF | Basado en conocimiento general — riesgo de formato no oficial |

### Cascada de IA (ORDEN FIJO — no cambiar)
```
1. Anthropic (claude-haiku-4-5-20251001) — principal
2. Gemini (gemini-2.5-flash) — fallback 1
3. OpenAI (gpt-4o-mini) — fallback 2
4. Groq (llama-3.3-70b-versatile) — último recurso
```
Cada llamada usa `AbortSignal.timeout(50_000)` para no exceder los 60s de Vercel.
El sistema NO hace auto-switch; solo alerta al admin. El admin decide manualmente.

### Persistencia (3 capas)
```
1. Supabase (PostgreSQL) — para producción, AÚN NO CONECTADO con credenciales reales
2. In-memory store (memoryStore.ts) — funciona hoy en desarrollo
3. Disk fallback (.store/data.json) — persiste entre reinicios en desarrollo
```
**⚠️ Supabase aún tiene placeholders en `.env.local`. Los datos se pierden al reiniciar.**

---

## 4. FLUJO DE GENERACIÓN DE DOCUMENTOS

### Scribe — Monografía (6 fases)
```
Wizard (tipo + universidad + tema)
  → Fase 0: 3 propuestas de tema (o tema directo)
  → Fase 1: Cap.I — Planteamiento del problema
  → Fase 2: Cap.II — Marco teórico (puede usar PDFs del estudiante vía RAG)
  → Fase 3: Cap.III — Metodología
  → Fase 4: Cap.IV — Resultados
  → Fase 5: Cap.V — Conclusiones + Bibliografía APA 7
  → Control de calidad → Banco de preguntas defensa → ZIP Overleaf → PDF
```

### Proyecto de Grado (23 fases)
```
Cap.0: Idea de negocio
Cap.1-2: Marcos referencial y teórico
Cap.3a-f: Análisis externo (PESTEL, Porter, encuesta, demanda)
Cap.4a-g: Diseño interno (RRHH, legal, técnico, branding, marketing, financiero)
Conclusiones → Defensa → Referencias → Resumen → LaTeX
```

### Generador Conectado
```
Crear Proyecto Maestro → vincular módulos educativos
  → Trabajar cada módulo (genera artefactos con datos reales)
  → /generador/[id]/documento → IA genera capítulos con contexto cruzado
  → Export: Markdown / .tex / ZIP Overleaf con plantilla por universidad
```

### Anti-alucinación (BLINDADO — no tocar)
- Solo citas de la literatura que el estudiante provee
- Solo fuentes públicas verificables (INE, IBCE, BCB, ministerios)
- Cap.II-V validan coherencia con Cap.I antes de generar
- Bibliografía APA 7 generada y validada automáticamente
- `guardian.ts` ejecuta en cada generación de fase

---

## 5. MODELO DE NEGOCIO

| Plan | Precio | Incluye |
|------|--------|---------|
| Estándar | Bs. 150 (monografía) / Bs. 350 (proyecto de grado) | 1 documento, IA básica, PDF + LaTeX |
| Plus | Bs. 300 (mono) / Bs. 600 (PG) | 3 docs/mes, mejor IA, historial |
| Premium | Bs. 500 (mono) / Bs. 950 (PG) | Ilimitado, IA top tier, soporte hasta defensa |

**Axiom:** Bs. 50/mes (simulador examen ingreso).

**Pagos:** Tigo Money, QR bancario, transferencia. Activación MANUAL desde `/admin/pagos`. No hay webhook automático todavía.

---

## 6. PENDIENTES CRÍTICOS (lo que falta para producción)

### BLOQUEANTES para lanzar
1. **Supabase real** — conectar credenciales y ejecutar schema SQL. Proyecto: `svaswbryumacbirecvjt.supabase.co`. Script: `supabase_full_setup.sql`.
2. **Google OAuth en producción** — crear credenciales reales en Google Cloud Console con dominio de producción.
3. **Deploy en Vercel** — conectar repo GitHub + variables de entorno + dominio.
4. **Webhook de pago** — activación automática al pagar (hoy es manual).

### Importante pero no bloqueante
5. **Migración SQL pendiente:** `migrations-idea/002_modalidad.sql` (columnas `tipo_trabajo` + `universidad` en `idea_proyectos`).
6. **Migraciones docente pendientes:** `migrations-docente/001, 002, 003`.
7. **Proyecto de Grado:** solo UCATEC completo. Otras universidades (UMSS, UCB, UNIFRANZ) faltan las variantes de Cap.1 y estructura específica.
8. **Imágenes en ZIP Overleaf:** el estudiante no puede subir imágenes propias todavía.
9. **PDF directo en servidor:** hoy solo genera `.tex` para Overleaf. PDF directo está pendiente.

### Deuda técnica conocida
- 10 errores `react-hooks/purity` e `react-hooks/immutability` (Math.random/Date.now en render). No bloqueantes.
- `npm run lint` falla por deuda amplia.
- BUG-001: `localStorage.adminAuthed` puede quedar viejo aunque la cookie expire.
- BUG-006: proyecto borrado puede reaparecer (memoria cacheada).
- BUG-007: fase que genera solo referencias/anexos (detector miraba prompt completo).
- BUG-008: edición puntual por chat + problemas de PDF (títulos huérfanos, referencias repetidas).

---

## 7. ESTADO DE LOS CEREBROS (repositorios independientes)

| Cerebro | Stack | Estado | ¿Conectado a WEBAPP? |
|---------|-------|--------|---------------------|
| C0.Cerebro_contrato | TypeScript + JSON Schema | ✅ Contrato definido | Sí, como librería |
| C3_Academic-Methodology-Engine | Python + FastAPI | ✅ Endpoints definidos | ❌ No conectado (mock) |
| C4_Strategy-Business-Engine | Python + FastAPI | ✅ Endpoints definidos | ❌ No conectado (mock) |
| C5_Operations-Feasibility | Python + FastAPI | ✅ En desarrollo | ❌ No conectado |
| C6_Legal-Regulatory-Bolivia | Python + FastAPI | ✅ En desarrollo | ❌ No conectado |
| C7_Organization-HR | Python + FastAPI | ✅ Endpoints definidos | ❌ No conectado |
| C8_Brand-Marketing | Python + FastAPI | ✅ Endpoints definidos | ❌ No conectado |
| C9_Academic-Document-Engine | Python + FastAPI | ✅ Endpoints + Docker | ❌ No conectado |
| C10_Defense-QA-Engine | Python + FastAPI | ✅ Endpoints definidos | ❌ No conectado |
| C11_WEBAPP-Orchestrator | TypeScript | ✅ Arquitectura definida | ⚠️ Parcial (estructura lista) |
| market-intelligence-engine (MIE) | Python + FastAPI | ✅ Live, datos Censo 2024 | ❌ No conectado (iframe bloqueado) |
| simuladorPRO | React + Vite + Supabase | ✅ En producción | ✅ Migrado dentro de WEBAPP |

**NINGÚN cerebro externo está conectado en producción.** WEBAPP hoy hace TODO internamente con sus propios prompts en `src/lib/prompts/`. Los cerebros son la visión futura de arquitectura desacoplada.

---

## 8. REGLAS CRÍTICAS QUE NUNCA SE VIOLAN

### Arquitectura (no cambiar sin avisar)
- ❌ Orden de fases de generación (Tema → Cap.I → Cap.II → Caps.III-V)
- ❌ Eliminar rutas API existentes sin migración
- ❌ Mover prompts fuera de `src/lib/prompts/`
- ❌ Quitar validaciones anti-alucinación (`guardian.ts`, `detectarAlucinaciones()`)
- ❌ Cambiar firma de `llamarIA()` o `llamarIAConConfig()`
- ❌ Cambiar el orden de la cascada de IA sin actualizar `aiProvider.ts` y este documento

### Copy (BLOQUEANTE de calidad)
- ❌ NUNCA usar voseo argentino (sabés, querés, hacé, agregá, etc.)
- ✅ SIEMPRE español neutro boliviano con tuteo (sabes, quieres, haz, agrega)
- Verificar con regex antes de cualquier commit de copy

### Prompts (seguridad)
- ❌ NUNCA importar prompts en componentes cliente (.tsx sin 'use server')
- ❌ NUNCA retornar el texto del prompt en respuestas de API
- ✅ Solo importar prompts desde API routes en `src/app/api/`

---

## 9. VARIABLES DE ENTORNO NECESARIAS

```env
# IA (mínimo una key)
ANTHROPIC_API_KEY=...
GEMINI_API_KEY=...          # Google Gemini
OPENAI_API_KEY=...
GROQ_API_KEY=...

# Base de datos
NEXT_PUBLIC_SUPABASE_URL=https://svaswbryumacbirecvjt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Auth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ADMIN_JWT_SECRET=...
ADMIN_PASSWORD=...

# Cerebros externos (cuando se conecten)
MARKET_INTELLIGENCE_ENGINE_URL=...
ACADEMIC_METHODOLOGY_ENGINE_URL=...
ACADEMIC_DOCUMENT_ENGINE_URL=...
DEFENSE_QA_ENGINE_URL=...
# ...etc para cada cerebro
```

---

## 10. PROTOCOLO DE SESIÓN (para cualquier IA)

Al inicio de cada sesión nueva:
1. Leer este archivo (BITACORA_CONTEXTO_MAESTRA.md)
2. Leer `WEBAPP/INVENTARIO.md` para el estado detallado del producto
3. Leer `WEBAPP/docs/dev-sessions/CURRENT.md` para el último estado de desarrollo
4. Leer `WEBAPP/docs/bitacora-laboratorio.md` para decisiones de producto recientes
5. Verificar git status antes de cualquier cambio

Antes de cualquier cambio importante:
1. Auditar qué archivos toca
2. Mapear dependencias
3. Validar contra las "REGLAS QUE NUNCA SE VIOLAN" de §8
4. Avisar al usuario si hay impacto
5. Ejecutar solo si el usuario confirma

---

## 11. URLs Y ACCESOS

| Recurso | URL |
|---------|-----|
| App local | http://localhost:3000 |
| Dashboard | http://localhost:3000/dashboard |
| Admin | http://localhost:3000/admin |
| Demo login | /login → "Entrar como estudiante demo" |
| simuladorPRO (producción) | https://simulador-pro-seven.vercel.app |
| MIE Panel local | http://localhost:8000/inspector |
| Supabase dashboard | https://supabase.com/dashboard/project/svaswbryumacbirecvjt |

---

## 12. VISIÓN CORRECTA DE LOS CEREBROS (leer antes de asumir que "no sirven")

Cada cerebro es un **producto independiente con usuarios reales HOY**, no solo una API esperando ser conectada. Ejemplo: `simuladorPRO` se usa activamente para enseñar flujos de caja, riesgo e inversión, con sección docente, alumnos y revisiones funcionando.

La estrategia es correcta y sostenible:
```
Cada cerebro:
  1. Funciona solo como herramienta educativa (ya tiene usuarios)
  2. Genera valor y retroalimentación real con uso real
  3. Se mejora iterativamente
  4. Se conecta a WEBAPP cuando esté listo

WEBAPP:
  Los orquesta a todos + agrega modo automático y guiado
  No reemplaza a los cerebros — los conecta y amplifica
```

**NO es over-engineering.** Es construcción paralela: cada cerebro vale por sí solo Y suma a WEBAPP.

### Doble rol de cada cerebro (patrón confirmado por el dueño del proyecto)

```
Rol 1 — Producto independiente
  Estudiantes y docentes lo usan directamente (como simuladorPRO hoy)
  Tiene su propia UI, login, clases, herramientas propias
  Genera valor y retroalimentación con usuarios reales
  Se mejora iterativamente con ese uso

Rol 2 — Proveedor de datos para WEBAPP
  Cuando el mismo usuario también usa WEBAPP
  El cerebro exporta sus resultados estructurados
  WEBAPP los incorpora al documento académico
  El documento sale con datos reales, no inventados por la IA
```

Ejemplo ya funcionando: simuladorPRO enseña finanzas de forma independiente Y sus datos alimentan el módulo Finanzas de WEBAPP. Todos los demás cerebros siguen este mismo patrón.

---

## 13. ESTRATEGIA DE CONEXIÓN DE CEREBROS A WEBAPP (sin romper usuarios existentes)

### El punto clave
Ambas apps (WEBAPP y cada cerebro) usan **Google OAuth**. El mismo Gmail = la misma persona. Ya están más conectadas de lo que parece.

### Plan de 3 etapas para cada cerebro (ejemplo con simuladorPRO)

**Etapa 1 — Sin tocar nada (HOY)**
- Usuario entra a WEBAPP con su Google
- Va al módulo Finanzas → WEBAPP lo lleva a simuladorPRO
- El usuario hace clic en "Entrar con Google" en simuladorPRO → mismo Gmail → entra automáticamente
- Sus datos, cursos y proyectos siguen intactos, nada se rompe

**Etapa 2 — Puente de datos (próxima)**
- Agregar en cada cerebro un endpoint liviano: `GET /api/export/user-summary?googleId=xxx`
- WEBAPP llama ese endpoint y muestra el resumen del cerebro dentro del documento académico
- El cerebro empieza a alimentar a WEBAPP sin que el usuario note nada

**Etapa 3 — JWT compartido (futuro, opcional)**
- Un token compartido para que el usuario no tenga que hacer clic en "Entrar con Google" dos veces
- Si ambas apps usan el mismo Gmail, la experiencia ya es casi transparente sin esto

### Tabla de impacto por tipo de usuario

| Situación | Qué pasa |
|-----------|----------|
| Usuario viejo de simuladorPRO | Nada cambia. Entra igual que siempre. |
| Usuario nuevo entra por WEBAPP | Llega al cerebro con su Google, se crea cuenta automáticamente. |
| ¿Una sola cuenta? | Sí — el Gmail es la cuenta única. Las apps se reconocen por Google ID. |
| ¿Se pierden datos? | No. Cada app guarda sus datos en su propio Supabase. |

### Orden recomendado para conectar cerebros
1. `simuladorPRO` (C1) — ya migrado dentro de WEBAPP como módulo Finanzas. El puente externo es opcional.
2. `market-intelligence-engine` (C2) — conectar para reemplazar datos inventados por la IA con datos reales del Censo 2024.
3. Los demás (C3-C10) — uno a uno, según madurez y usuarios reales que tengan.

---

## 14. ANÁLISIS DE FISURAS Y PROBLEMAS DETECTADOS

Ver archivo `FISURAS_Y_PROBLEMAS.md` en este mismo directorio.
