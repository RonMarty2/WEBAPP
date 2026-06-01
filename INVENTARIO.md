# 📋 INVENTARIO MAESTRO — Laboratorio Académico PRO

> **Este archivo es la ÚNICA fuente de verdad del producto.**
> Claude DEBE leerlo al inicio de cada sesión antes de tocar código.
> Última actualización: 2026-06-01

---

## 🎯 LA VISIÓN

SaaS académico boliviano que genera trabajos académicos REALES con IA, siguiendo
las **guías oficiales de cada universidad**. El estudiante aprueba el contenido.
El documento es válido para entrega y defensa.

**Mercado:** Bolivia primero (Cochabamba, La Paz, Santa Cruz). Después: Perú,
Ecuador, Paraguay.

**Frase clave:** *"La IA redacta. El estudiante aprueba. El documento es real."*

---

## 🧠 ARQUITECTURA DEL CONTENIDO IA (Rol de Claude)

```
┌─────────────────────────────────────────────────────────────┐
│  Guía PDF oficial de la universidad (ej. UNIFRANZ 2017)     │
│           ↓                                                  │
│  Claude la LEE y DESTILA reglas en megaprompts              │
│           ↓                                                  │
│  Megaprompts (.ts) en src/lib/prompts/                      │
│           ↓                                                  │
│  IA en producción (Groq/Anthropic/OpenAI/etc.) los ejecuta  │
│           ↓                                                  │
│  Documento entregable al estudiante                         │
└─────────────────────────────────────────────────────────────┘
```

**Rol de Claude:** arquitecto de prompts. Lee guías PDF y construye los megaprompts.
**Rol de la IA en producción:** ejecutor. Toma el megaprompt y genera contenido.
**Rol del estudiante:** valida, aprueba, entrega.

---

## 🟢 PRODUCTOS ACTIVOS

### Producto 1 — Laboratorio Académico PRO
Plataforma de generación de trabajos académicos. Núcleo del negocio.

#### Tipos de trabajo cubiertos:
| Tipo | Ruta | Estado | Prompts |
|---|---|---|---|
| **Monografía** | `/scribe`, `/projects/[id]/workspace` | ✅ Operacional | `src/lib/prompts/scribe/` (12 archivos) |
| **Proyecto de Grado** | `/projects/[id]/workspace?tipo=proyecto-grado` | ⚠️ Solo UCATEC | `src/lib/prompts/proyectoGrado/` (23 archivos) |
| **Tesis** | (vía Scribe, variante UNIFRANZ) | ⚠️ Solo Cap1 | `src/lib/prompts/scribe/cap1-variantes/unifranz-tesis.ts` |
| **Plan de negocio** | Por implementar | 🔴 No existe | — |

#### Modalidades de Proyecto de Grado (6):
- Pre-Factibilidad (estudio de inversión)
- Mejora Organizacional
- Diseño de Artefacto
- Tesis de Grado
- Examen de Grado
- Trabajo Dirigido

#### Planes y precios:
| Plan | Precio | Incluye |
|---|---|---|
| **Estándar** | Bs. 150 pago único (Mono) / Bs. 350 (Proy Grado) | 1 documento, IA básica, PDF + LaTeX |
| **Plus** | Bs. 300 (Mono) / Bs. 600 (Proy Grado) | 3 docs/mes, mejor IA, historial |
| **Premium** | Bs. 500 (Mono) / Bs. 950 (Proy Grado) | Ilimitado, IA top tier, soporte 24/7 hasta defensa |

### Producto 2 — Axiom (SEPARADO de Laboratorio Académico)
Simulador de exámenes de ingreso. **Embudo de venta separado.**

| Detalle | Valor |
|---|---|
| Ruta | `/axiom` |
| Cliente | Estudiantes preparándose para ingreso a la universidad |
| Foco actual | Examen de ingreso UMSS Económicas |
| Precio | Bs. 50/mes (Premium) |
| Features | IA infinita de preguntas, modo "mis errores", plan personalizado IA |
| Estado | ✅ Operacional con guardrails |

---

## 🏛️ UNIVERSIDADES EN EL SISTEMA

### Con guía PDF oficial cargada ✅
| Universidad | ID | PDF | Variantes Cap1 | Tipos cubiertos en código |
|---|---|---|---|---|
| **UMSS** Cochabamba | `umss-001` | `umss-guia1-posgrado-fce-2024.pdf` (696KB) + `umss-guia2-cespedes-tapia.pdf` (165KB) | Clásico, Reducido | Tesis, Mono, Proy Grado, Trab. Dirigido |
| **UCB** Cochabamba | `ucb-001` | `ucb-guia-2020.pdf` (6.4MB) | UCB Licenciatura | Mono, Tesis, Examen Grado, Proy Técnico, Pasantía, Trab. Dirigido |
| **UNIFRANZ** Cochabamba | `unifranz-cba-001` | `unifranz-cba-guia-2017.pdf` (1.3MB) | UNIFRANZ Tesis | Tesis, Proy Pre-Fact., Mejora Org., Diseño Artefacto, Trab. Dirigido |

### Registradas pero SIN guía PDF ⚠️
UMSA, UAGRM, UTO, USFX, UPB, EMI, UCATEC — generación basada solo en
"conocimiento general" de la IA, sin guía oficial. **Riesgo de formato no
oficial si se usa en producción.**

---

## 📄 USO DE LAS GUÍAS PDF (doble propósito)

**Para el estudiante:** Se descargan desde `/api/guias-{umss,ucb,unifranz}/{guia1,guia2}` —
sirven como demostración de que el contenido sigue lineamientos oficiales actualizados.

**Para Claude (arquitectura):** Claude las lee directamente del filesystem
(`public/guias-*/`) y destila las reglas críticas en megaprompts. Las reglas que ya
están destiladas viven en `src/lib/prompts/scribe/cap1-variantes/unifranz-tesis.ts`
(300+ líneas con reglas APA UNIFRANZ específicas, anti-alucinación, estructura
5 secciones obligatorias).

**Lo que NO pasa hoy:**
- La IA en producción NO lee el PDF al generar (solo lee el megaprompt destilado)
- Si la guía cambia, hay que actualizar manualmente el megaprompt
- No hay RAG sobre las guías

---

## 🤖 CASCADA DE IA POR PLAN

| Plan | Modelo principal | Tokens | Fallback |
|---|---|---|---|
| **Demo** | Groq Llama 3.3 70B | 2-7K | — |
| **Estándar** | DeepSeek V3 | 3-12K | Groq |
| **Pro** | Gemini 2.5 Pro + Claude Opus (caps críticos) + GPT-4o | 8K | Groq → Anthropic → OpenAI |
| **Elite** | Igual que Pro pero presupuesto 12-16K tokens | 12-16K | Igual |

**8 proveedores soportados:** Groq, Anthropic, OpenAI, Gemini, Mistral, DeepSeek, xAI (Grok), Cohere.

**Orden de cascada fallback obligatorio (NO CAMBIAR):**
1. Groq (`llama-3.3-70b-versatile`) — principal
2. Anthropic (`claude-haiku-4-5-20251001`) — fallback 1
3. OpenAI (`gpt-4o-mini`) — fallback final

---

## ✨ FEATURES OCULTAS QUE YA ESTÁN ARMADAS

Aprovechar antes de construir cosas nuevas:

| Feature | Endpoint | Qué hace |
|---|---|---|
| Análisis de estilo del estudiante | `/api/projects/analyze-style` | Detecta el tono del estudiante y lo replica |
| RAG sobre el documento | `/api/projects/[id]/qa` | Chat con el documento ya generado |
| Hilo Conductor entre fases | (interno, `guardian.ts`) | Coherencia automática entre capítulos |
| Banco de Observaciones | `/admin/banco-observaciones` | Correcciones estándar reutilizables |
| Material de Defensa | `/api/projects/[id]/defensa-materiales` | Preguntas + respuestas para tribunal |
| Cuadernillo imprimible | `/api/projects/[id]/cuadernillo` | Editor fase por fase con preview |
| Bitácora de cambios | `/api/projects/[id]/bitacora` | Historial de versiones del documento |
| Plantillas adaptativas | `/api/adaptativo/analyze-guide` | Lee guía del docente y adapta plantilla |
| Análisis de observaciones | `/api/projects/[id]/analizar-observacion` | Sugiere mejoras sin reescribir todo |

---

## 💳 SISTEMA DE PAGOS

- **3 métodos:** Tigo Money, QR Bancario, Transferencia Bancaria
- **Activación:** Manual desde `/admin/pagos` (NO hay webhook automático)
- **Endpoint:** `POST /api/payments` → guarda método + detalles

---

## 🔐 AUTH Y ROLES

| Tipo | Cómo entra |
|---|---|
| Estudiante demo | `/api/auth/demo` (anónimo, sin tarjeta) |
| Estudiante real | Google OAuth (`/api/auth/google`) |
| Admin | `/api/auth/admin-login` con email + password |
| Tutor | (planeado, no implementado todavía) |

**Planes:** `estandar` | `pro` | `elite`. Cambio de plan: `/api/auth/switch-plan`.

---

## 🛠️ ADMIN PANEL — 17 subsecciones

`/admin/{axiom-banco, banco-observaciones, dashboard, estadisticas, fases, logs,
modelos, pagos, pdf-solicitudes, project-types, prompts, proyectos, ui-config,
universidades, university-assets, usuarios, workspace-prompts}`

---

## 📤 EXPORTACIONES

- LaTeX → PDF
- ZIP Overleaf (incluye preámbulo específico por universidad)
- Cuadernillo imprimible
- Bitácora imprimible

**Preámbulos LaTeX propios:** UMSS, UCB, UNIFRANZ.

---

## 🗑️ MÓDULOS ABANDONADOS (eliminados 2026-06-01)

Por decisión del dueño, estos módulos quedaron eliminados del código:
- ❌ Lumen (era material docente)
- ❌ Mentor (era tutoría automatizada)
- ❌ Laboratorio (era sandbox)
- ❌ Núcleo (era hub padre)

**No reactivar sin pedir antes al dueño.** Si se vuelven a necesitar, hay que
reconstruir desde cero (no quedó código residual).

---

## 🚨 REGLAS ABSOLUTAS (NO CAMBIAR SIN PERMISO EXPLÍCITO)

1. **Cascada de IA:** Groq → Anthropic → OpenAI (orden inviolable)
2. **Anti-alucinación:** No quitar validaciones de `guardian.ts` ni de los prompts
3. **Prompts en server-only:** NUNCA importar prompts en componentes cliente
4. **Estructura `capitulo.contenido_json`:** No cambiar sin migration script
5. **Copy boliviano:** NUNCA usar voseo argentino (sabés, querés, tenés)
6. **No tocar Scribe ni Axiom:** cuando trabajemos UNIFRANZ-PG o cualquier
   otra feature, Scribe y Axiom quedan intocados

---

## 📌 PRIORIDADES ACTUALES (Sprint en curso)

1. **🔴 BLOQUEANTE:** Crear motor UNIFRANZ para Proyecto de Grado leyendo el PDF
   `public/guias-unifranz/unifranz-cba-guia-2017.pdf` y destilando megaprompts
   por capítulo. Esto se hace en `src/lib/prompts/proyectoGrado/universidad/unifranz/`.

2. **🟡 IMPORTANTE:** Deploy a Vercel (build ya pasa exitoso, env vars listas
   en `.env.local`).

3. **🟢 SIGUIENTE:** Migrar de in-memory store a Supabase real
   (credenciales ya configuradas en `.env.local`).

4. **🟢 SIGUIENTE:** Webhook real de pagos (Tigo / QR / transferencia) en lugar
   de activación manual desde admin.

---

## 🔄 ESTADO DEL DEPLOY

- ✅ `npm run build` pasa limpio
- ✅ `vercel.json` configurado con timeouts (60s para endpoints de IA)
- ✅ 11 de 14 env vars críticas listas
- 🔴 Falta: crear cuenta Vercel + conectar repo + pegar env vars

**URL temporal futura:** `webapp-ronmarty2.vercel.app`

---

## 📞 CONTACTO Y BRANDING

- WhatsApp negocio: **+591 6039 5685**
- Email admin: definido en `.env.local` como `ADMIN_EMAILS`
- Identidad: español neutro boliviano (tuteo, sin voseo)
- Tagline: *"La IA redacta. El estudiante aprueba. El documento es real."*
