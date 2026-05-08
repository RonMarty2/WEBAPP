# AXIOM — Guía de Desarrollo y Blindaje

## Resumen Ejecutivo

**Axiom** es un simulador de exámenes UMSS para estudiantes bolivianos pre-universitarios. Sistema completamente independiente de Scribe con su propia arquitectura, flujos, y reglas de integridad.

**Stack:** Next.js 16.2.4 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Framer Motion + IA (Groq/Anthropic/OpenAI)

**Database:** Supabase (PostgreSQL) con fallback in-memory

---

## Principios de Axiom

1. **Motivación visible** — Ranking, feedback positivo, planes personalizados
2. **Riguroso académicamente** — Evaluación justa, desglose por área, sin "gaming"
3. **Interactivo** — Podios, animaciones, sonido, real-time feedback
4. **Acompañamiento** — Coach IA, planes de mejora, progreso visible
5. **Inclusivo** — Mobile-first, accesible (WCAG AA), sin jerga

---

## ⚠️ CAMBIOS QUE ROMPEN EL SISTEMA (AVISAR PRIMERO)

### CRITICAL (NUNCA sin confirmación)
- ❌ Eliminar o renombrar archivo `src/lib/axiom/evaluador.ts` (puntuación)
- ❌ Cambiar fórmula de cálculo de nota (línea ~50 en evaluador.ts)
- ❌ Eliminar componente `RankingPodios.tsx` sin replacement visual
- ❌ Cambiar estructura de `Simulador` o `RespuestaUsuario` types
- ❌ Eliminar rutas API `/api/axiom/*` sin migración
- ❌ Cambiar orden de pasos en flujo simulador (5 pasos, orden inmutable)
- ❌ Deshabilitar caché de preguntas sin entender impacto
- ❌ Cambiar cascada de proveedores IA (Groq → Anthropic → OpenAI)

### HIGH (AVISAR antes de implementar)
- ⚠️ Cambiar alturas/colores de podios (visual breaking)
- ⚠️ Cambiar TTL de cache de preguntas (actualmente 24h)
- ⚠️ Modificar ponderaciones de áreas en scoring
- ⚠️ Agregar/eliminar proveedor IA sin testing exhaustivo
- ⚠️ Cambiar estructura de PlanPersonalizado
- ⚠️ Deshabilitar sonido de interactividad (disable ≠ delete)

---

## Arquitectura Crítica

### 5 Pasos del Simulador (INMUTABLES)
```
1. Admin configura examen (areas, preguntas, tiempo, ponderaciones)
2. Usuario crea simulador (selecciona exam, fecha)
3. Usuario ingresa a exam (countdown timer, preguntas vía RAG)
4. Usuario responde en tiempo real (guardado inmediato)
5. Exam termina → evaluación automática + plan personalizado
```

Si necesitas agregar paso: **AVISAR PRIMERO**.

### Evaluador (src/lib/axiom/evaluador.ts)
```typescript
// Fórmula (BLINDADA)
nota_final = (respuestas_correctas / total_preguntas) * 100

// Desglose por área
area_score = (correctas_area / total_area) * ponderación
```

**NUNCA cambiar esta fórmula sin:**
1. Testing exhaustivo con datos históricos
2. Validación de coherencia
3. Comunicación a usuarios
4. Reseteo de ranking si es necesario

### Cascada de IA (ORDEN CRÍTICO)
```
Groq (llama-3.3-70b) → Anthropic (haiku-4.5) → OpenAI (gpt-4o-mini)
```

Si Groq cae, automáticamente intenta Anthropic. Si ambas caen, OpenAI. **Nunca** saltarse providers.

### Caché de Preguntas
- **Propósito:** Evitar repetir preguntas generadas
- **TTL:** 24 horas (mínimo, puede aumentarse)
- **Hash:** MD5(pregunta_base + prompt)
- **Validez:** Si encuentro duplicate, uso cached (no regenerar)

### Ranking + Podios Interactivos
- **Top 1, 2, 3:** Podios visuales con alturas 350px, 280px, 200px
- **Zona aprobada (4+):** Tarjetas mejoradas, sin podios
- **Interactividad:** Click → escudo gira 360° + whoosh sound
- **Usuario actual:** Bold + anillo dorado si está en Top 3
- **Sonido:** Web Audio API, desactivable en settings (NO obligatorio)

**NO cambiar estructura visual sin rediseño completo.**

---

## Archivos Críticos (Mandatory Reading)

| Archivo | Propósito | Líneas |
|---------|-----------|--------|
| `src/lib/axiom/types.ts` | Tipos TypeScript (ExamenConfig, Simulador, etc.) | 1-100 |
| `src/lib/axiom/evaluador.ts` | Cálculo de puntuación + feedback | 1-120 |
| `src/lib/axiom/db.ts` | Abstracción BD (in-memory + Supabase) | 1-200 |
| `src/lib/axiom/cache.ts` | Deduplicación de preguntas | 1-80 |
| `src/lib/axiom/ia-simulador.ts` | Generación RAG + validación | 1-180 |
| `src/app/axiom/components/RankingPodios.tsx` | UI podios + animaciones | 1-450 |
| `src/app/api/axiom/simulador/route.ts` | Core simulador API | 1-150 |
| `src/app/api/axiom/admin/config/route.ts` | Admin config | 1-120 |
| `docs/axiom/PRODUCT.md` | Contexto producto (usuario, propósito, UX) | ✅ Leer antes de cambios |
| `docs/axiom/DESIGN.md` | Tokens diseño (colores, typography, motion) | ✅ Leer antes de cambios |

**Antes de cambiar algo, leer el archivo maestro.**

---

## API Routes Existentes

| Ruta | Método | Función | Status |
|------|--------|---------|--------|
| `/api/axiom/admin/config` | GET/POST/PUT | Config examen por admin | ✅ Active |
| `/api/axiom/examenes` | GET | Lista de exámenes históricos | ✅ Active |
| `/api/axiom/ranking` | GET | Top 10 público (opt-in) | ✅ Active |
| `/api/axiom/simulador` | POST | Crear nuevo simulador | ✅ Active |
| `/api/axiom/simulador/[simId]` | GET/PUT/POST | Estado + respuestas | ✅ Active |
| `/api/axiom/progreso/estadisticas` | GET | Stats usuario | ✅ Active |
| `/api/axiom/plan-personalizado` | POST | Generar plan + PDF | ✅ Active |

**NUNCA eliminar ruta existente sin `/deprecated` endpoint + redirect.**

---

## Validaciones Anti-Alucinación

Implementadas en `src/lib/axiom/ia-simulador.ts`:

1. ✅ Respuesta debe tener estructura (texto + opciones)
2. ✅ Opciones: exactamente 4 (A, B, C, D)
3. ✅ Respuesta correcta: entre 0-3
4. ✅ Dificultad: fácil / medio / difícil
5. ✅ Área: debe estar en config

Si falla → retry con otro provider ó error claro (no generar basura).

---

## Seguridad & Compliance

### Auth
- Google OAuth (obligatorio)
- JWT en cookies (httpOnly)
- Roles: student, admin
- Admin: ver stats/logs pero NO notas ajenas

### Data Protection
- Notas personales: privadas (solo user + admin)
- Ranking: opt-in, públicas solo primeros 10
- PDFs: watermarked (usuario + timestamp)
- Logs: registrar intentos sospechosos

### Valididad Académica
- Preguntas validadas antes de responder
- No se repiten (caché + deduplicación)
- Evaluación justa (fórmula transparente)
- Feedback honesto (sin inflados de nota)

---

## Protocolo de Cambios (OBLIGATORIO)

**ANTES de cualquier cambio importante:**

```
1. AUDITAR    → ¿Qué archivos toco?
2. MAPEAR     → ¿Qué features dependen de esto?
3. VALIDAR    → ¿Está en breaking_changes_detector.rules?
4. AVISAR     → Si CRITICAL o HIGH → explicar cambio PRIMERO
5. CONFIRMAR  → Esperar confirmación explícita del usuario
6. EJECUTAR   → Solo si es safe o usuario autorizó
7. VERIFICAR  → Build compila, tests pasan, no rompió nada
```

**Ejemplo correcto:**
```
❌ IMPACTO ALTO: Cambiar fórmula scoring de 0-100 a 0-20

Afecta:
  - src/lib/axiom/evaluador.ts (línea 50)
  - Ranking (todos los números cambian)
  - PDFs de resultados
  - UI de resultados (/axiom/simulador/[simId]/resultados)

Impacto:
  - Notas de estudiantes cambiarán (visible breaking change)
  - Ranking se reinicia efectivamente
  - Historial pasado requiere migration script

Recomendación:
  - Mejor: agregar factor de escala (0-100 → 0-20 es *0.2)
  - O: crear versión nueva de exam config
  
¿Procedo? (Necesito confirmación explícita)
```

---

## Cómo Agregar Cambios Seguros

### ✅ SAFE (sin avisar)
- Typo fixes
- Comentarios
- Logging adicional
- Performance optimization (sin cambiar output)
- Tests nuevos (no afecta prod)

### ⚠️ MEDIUM (avisar, low risk)
- Agregar color nuevo a palette (no cambiar existente)
- Agregar proveedor IA nuevo (no eliminar existing)
- Agregar API route nueva
- Cambiar mensajes de copy (no logic)

### ❌ CRITICAL (SIEMPRE avisar, high risk)
- Cambiar tipos TypeScript
- Cambiar fórmula de scoring
- Eliminar API routes
- Cambiar flujo de pasos
- Modificar evaluador

---

## Convenciones de Código Axiom

- **TypeScript:** Strict mode (nunca `any` sin motivo)
- **Componentes:** `'use client'` explícito al inicio
- **API routes:** Siempre validar input antes de procesar
- **Errores:** `{ error: string }` con HTTP status correcto
- **Variables:** Nunca hardcodeadas, siempre desde `.env`
- **Tests:** Mínimo 80% coverage en evaluador
- **Commits:** Descripción clara, incluye archivos tocados

---

## MEMORY AUTOMÁTICA (CARGADA SIEMPRE)

Este proyecto tiene **dos blueprints** persistentes:

```
AXIOM_BLUEPRINT.md
  ⭐ Verdades inmutables, APIs, tipos, rules
  ⭐ Cargado automáticamente en TODA sesión

ARCHITECTURE_BLUEPRINT.md
  ⭐ Arquitectura global (Scribe)
  ⭐ Cargado automáticamente
```

**Si olvido algo → es bug mío. Recuerda consultarlos.**

---

## 🔐 BLINDAJE Y STARTUP

### .claude-config.json
Contiene 17 reglas CRITICAL + HIGH específicas para Axiom. Se valida automáticamente.

### .claude-startup.md
Ejecutar al inicio de cada sesión para verificar estado de blindaje.

### Mandatory Files
```
src/lib/axiom/types.ts
src/lib/axiom/db.ts
src/lib/axiom/evaluador.ts
src/app/axiom/components/RankingPodios.tsx
src/app/api/axiom/simulador/route.ts
docs/axiom/PRODUCT.md
docs/axiom/DESIGN.md
```

---

## 📋 Checklist Pre-Deploy

- [ ] Tests pasan (npm test)
- [ ] Build compila (npm run build)
- [ ] Evaluador testado con datos históricos
- [ ] Ranking funciona (Top 3 mostrados correctamente)
- [ ] Podios animan sin crashes
- [ ] Sonido funciona (y es desactivable)
- [ ] PDFs generan sin errores
- [ ] Auth funciona (Google OAuth)
- [ ] Dark mode N/A (light only)
- [ ] Mobile responsive ✅
- [ ] Accessible (WCAG AA contrast, nav keyboard)
- [ ] Logs no filtran datos sensibles

---

**ÚLTIMA ACTUALIZACIÓN:** 2026-05-07
**ESTADO:** ACTIVO EN GIT, SINCRONIZADO AUTOMÁTICAMENTE
**CAMBIOS:** Siempre commit a git, no archivos locales

Si encuentras inconsistencia entre este CLAUDE.md y el AXIOM_BLUEPRINT.md en memory, **el blueprint tiene autoridad** (es el source of truth actualizado).
