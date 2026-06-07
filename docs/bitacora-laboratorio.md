# Bitácora viva — Laboratorio Académico PRO

> Este archivo es la **memoria evolutiva del proyecto**. Aquí guardamos las
> decisiones, la visión actual y los próximos pasos — NO el código.
> Se actualiza cada vez que cambia algo importante.
>
> **Última actualización:** 2026-06-06 (sesión: migración simuladorPRO + login único)

---

## §1 Visión actual del Laboratorio Académico PRO

Plataforma SaaS educativa para Bolivia y Latinoamérica que ayuda al
estudiante universitario a producir su **tesis, monografía o proyecto de
grado** con dos caminos posibles:

- **Camino rápido:** la IA genera todo desde el tema (Generador Autónomo).
- **Camino formativo:** el estudiante trabaja paso a paso en cada módulo
  educativo, con la IA como mentor. Al final, sus artefactos REALES se
  consolidan en el documento académico (Generador Conectado).

Un solo login Google da acceso a todo. Los módulos son independientes
visualmente pero comparten sesión y datos.

---

## §2 Productos comerciales (modelo a definir más adelante)

> La monetización se decidirá después. Por ahora, lo que existe conceptualmente:

### Producto A — Generador Autónomo (ya funcional)
- La IA hace TODO el documento desde el tema que da el estudiante.
- Datos sintéticos generados con guardrails anti-alucinación.
- Para estudiante apurado, sin tiempo de aprender.
- Es lo que webapp YA hace hoy.

### Producto B — Generador Conectado + Módulos Educativos
- Cada módulo educativo es un mini-LMS: clases + herramienta + artefactos.
- El estudiante avanza paso a paso, aprende, y construye su material real.
- Resultado: documento académico con SUS datos reales, no inventados.

---

## §2.5 Arquitectura de contexto compartido + IA (APROBADO 2026-06-06)

### Proyecto Maestro — OPCIONAL (sirve a dos tipos de cliente)
- **Cliente 1 — materia suelta:** un estudiante usa UN módulo solo (ej. solo
  Mercados), sin proyecto maestro. El módulo funciona autónomo. IA sugiere
  genérico. → se le vende el módulo individual.
- **Cliente 2 — proyecto de grado completo:** crea un Proyecto Maestro
  ("Cafetería La Orquídea, Cochabamba") y vincula los módulos. Cada módulo
  lee el contexto del maestro + los artefactos de otros módulos; la IA genera
  con contexto cruzado; el Generador consolida al final. → bundle.
- **El mismo módulo sirve para ambos.** Si hay proyecto maestro activo, se
  conecta y comparte contexto; si no, funciona solo.
- UX: selector discreto arriba en cada módulo — "Trabajando en: [Ninguno ▾]"
  con opción "+ Vincular a un proyecto".

### Servicio de IA compartido
- Endpoint único `/api/ai/asistir` que TODOS los módulos llaman. Recibe
  módulo + tarea + contexto (proyecto maestro + artefactos de otros módulos),
  arma el prompt con contexto cruzado y devuelve la sugerencia.
- Reusa el `aiProvider.ts` existente de webapp: cascada Groq → Gemini (ambas
  GRATIS y ya configuradas en Vercel) → Anthropic → OpenAI (pagas).
- APIs de paga quedan ABIERTAS: el usuario pega la key en Vercel cuando quiera,
  SIN tocar código.
- El estudiante SIEMPRE edita/aprueba lo que la IA sugiere (principio del
  laboratorio: "la IA redacta, el estudiante aprueba").

### Modo de armado de cada herramienta (en todos los módulos)
- **Por defecto (modo B):** plantillas/ejemplos bolivianos editables que
  guían sin reemplazar el pensamiento.
- **Opcional (modo C):** botón "Sugerir con IA" que usa el servicio compartido.

### Orden de construcción aprobado
- PASO 1: capa de Proyecto Maestro (contexto compartido) — PRIMERO.
- PASO 2: servicio de IA compartido `/api/ai/asistir` + componente "Sugerir con IA".
- PASO 3: integrar contexto+IA en módulos y terminar Estrategia con TODAS las
  herramientas (PESTEL, Porter, MPC, Cadena de Valor, MEFE, MEFI, MIE, FODA
  cruzada, BCG, Ansoff, PEYEA, MCPE).

---

## §3 Estado de los módulos

### Plataforma base (ya funcional)
- ✅ Auth único con Google (cookie JWT propia, no Supabase Auth)
- ✅ Pagos (Tigo Money / QR bancario / transferencia)
- ✅ Admin (panel central de gestión)

### Generador
- ✅ Modo Autónomo (lo que webapp hace hoy en `/projects/*`)
- 🔨 Modo Conectado en `/generador` (identidad teal):
  - **Wave 1:** crear Proyecto Maestro, vincular los 7 módulos, ver contexto
    consolidado, borrador rápido del índice con IA.
  - **Wave 2:** documento del proyecto en `/generador/[id]/documento` —
    estructura de proyecto de grado (10 secciones) o desde cero, generación
    capítulo por capítulo con IA (contexto cruzado), edición/reordenar,
    persistencia (`documento` JSONB, migración 002), export markdown/.md/imprimir.
  - **Wave 3:** export **LaTeX/Overleaf** — `documentoALatex()` reusa
    escaparLatex + mdALatex; endpoint `/api/maestro/[id]/latex`; botón
    ".tex (Overleaf)" en el documento.
  - Pendiente (opcional): PDF directo / ZIP Overleaf con carátula por universidad.

### Módulos educativos (orden de uso por el estudiante)

| # | Módulo | Estado | Notas |
|---|---|---|---|
| 1 | Idea / Pre-validación | 🔨 LABORATORIO COMPLETO (falta Academia) | 5 herramientas listas: Lean Canvas, Propuesta de Valor (VPC), Validación (hipótesis), Scorecard de viabilidad, Reporte. Identidad ámbar. Pendiente: solo FASE 1 (Academia). |
| 2 | Mercados (Investigación) | ✅ COMPLETO | Módulo entero (FASES 0-6). Detalle abajo. |
| 3 | Estrategia / Macroentorno | 🔨 LABORATORIO 100% (falta Academia) | 13 herramientas listas: PESTEL, Porter, MPC, Cadena de Valor, MEFE, MEFI, MIE, FODA, BCG, Ansoff, PEYEA, MCPE/QSPM, Reporte. Pendiente: solo FASE 1 (Academia). Detalle abajo. |
| 4 | Marketing | 🔨 LABORATORIO COMPLETO (falta Academia) | 5 herramientas listas: Buyer persona, Mezcla 4Ps/7Ps, Presupuesto/CPL por canal (con ROAS/CAC), Calendario editorial, Reporte consolidado. Pendiente: solo FASE 1 (Academia). Detalle abajo. |
| 5 | Organización | 🔨 LABORATORIO COMPLETO (falta Academia) | 6 herramientas listas: Organigrama, RRHH (aportes patronales BO en vivo), Legal (checklist trámites BO), Técnico, Branding, Reporte. Pendiente: solo FASE 1 (Academia). |
| 6 | **Finanzas (simuladorPRO)** | ✅ | Migrado desde repo externo `RonMarty2/simuladorPRO`. Constructor 9 pasos + simulación turno-a-turno con eventos económicos bolivianos + ranking + 26 ejemplos |
| 7 | Defensa | 🔨 LABORATORIO COMPLETO (falta Academia) | 3 herramientas listas: Banco de preguntas (con IA), Simulacro (IA evalúa cada respuesta 0-10 + feedback), Reporte. Identidad índigo. Pendiente: solo FASE 1 (Academia). |

### Progreso detallado del módulo Estrategia (`/estrategia`)
- ✅ **FASE 0** — Cimientos: identidad visual VIOLETA propia (#8b5cf6, distinta
  a Finanzas/negro y Mercados/azul), login único vía `/api/estrategia/perfil`,
  tablas SQL `estrategia_*` (matrices como JSONB), hub. Light-only.
- ✅ **Laboratorio 100%** — dashboard "Mis análisis" (CRUD) + vista del
  análisis con las 13 herramientas como etapas. Herramientas LISTAS (13/13):
  · PESTEL (macroentorno, plantillas bolivianas + IA)
  · 5 Fuerzas de Porter (microentorno, intensidad + IA)
  · MPC — Matriz de Perfil Competitivo (mi empresa vs competidores, ponderado)
  · Cadena de Valor (9 actividades primarias/apoyo + IA)
  · MEFE (factores externos ponderados) — componente MatrizPonderada reusable
  · MEFI (factores internos ponderados) — mismo componente
  · MIE — Matriz Interna-Externa (se deriva sola de los totales MEFE+MEFI)
  · FODA cruzada — pre-carga O/A desde el PESTEL + genera FO/DO/FA/DA con IA
  · BCG — matriz de portafolio (gráfico 2x2, clasifica unidades de negocio)
  · Ansoff — 4 cuadrantes de crecimiento (listas editables + IA)
  · PEYEA/SPACE — vector de posición estratégica (SVG, 4 dimensiones)
  · MCPE/QSPM — decisión cuantitativa final: autocompleta factores desde
    MEFE/MEFI y estrategias desde el FODA, puntúa peso × atractivo → ranking
    con la estrategia recomendada (requiere migración 003_mcpe.sql)
  · Reporte consolidado — todas las herramientas en un documento (incluye la
    decisión del MCPE), con copiar (markdown) e imprimir → artefacto para el
    modo conectado del Generador
- ✅ **Todas las herramientas construidas.** VRIO quedó como opcional (no crítica).
- ⬜ **FASE 1** — Academia: clases sobre análisis situacional (único pendiente).
- Patrón de cada herramienta: plantillas bolivianas (modo B) + botón
  "Sugerir con IA" (modo C, vía /api/ai/asistir con contexto del proyecto).

**Alcance de herramientas (DECIDIDO: TODAS):**
El usuario aprobó incluir TODAS las herramientas de análisis situacional:
- Macroentorno: PESTEL
- Microentorno: 5 Fuerzas de Porter · MPC (Matriz de Perfil Competitivo)
- Interno: Cadena de Valor · (VRIO opcional)
- Evaluación de factores: MEFE · MEFI
- Síntesis: FODA cruzada · MIE (Matriz Interna-Externa)
- Decisión/posición: BCG · Matriz de Ansoff · PEYEA/SPACE · MCPE/QSPM
Cada herramienta: plantillas bolivianas editables (modo B) + botón
"Sugerir con IA" (modo C). Se construyen por fases, 1-2 por entrega.

### Progreso detallado del módulo Marketing (`/marketing`)
- ✅ **FASE 0** — Cimientos: identidad visual ROSA/MAGENTA (#f43f5e, distinta a
  Finanzas/negro, Mercados/azul y Estrategia/violeta), login único vía
  `/api/marketing/perfil`, tablas SQL `marketing_*` (herramientas como JSONB),
  shell con CRUD de planes. Light-only. Prefijo de tokens y clases: `mkt-`
  (Mercados ya usa `mk-`).
- ✅ **Laboratorio COMPLETO (5/5):**
  · **Buyer persona** — perfil del cliente ideal (nombre/edad/ocupación/
    ubicación, metas y frustraciones como listas, canales con píldoras
    sugeridas + libres, cita literal). IA aplica formato literal a los
    campos.
  · **Mezcla 4Ps/7Ps** — selector productos vs servicios; 4 o 7 campos
    largos (producto, precio, plaza, promoción, +personas/procesos/
    evidencia física). IA aplica por P.
  · **Presupuesto y CPL** — tabla por canal con inversión, CPL, conversión
    y ticket; calcula leads, ventas, ingreso, ROAS y CAC en vivo.
    Plantilla boliviana con Meta/TikTok/Google/Influencer.
  · **Calendario editorial** — publicaciones por fecha/canal/tipo/copy/
    estado, filtros por estado, generador IA de 4 semanas (12 piezas).
  · **Reporte consolidado** — indicadores (inversión, leads, ventas, ROAS),
    cuatro secciones, copiar (markdown) e imprimir → artefacto que
    alimentará el modo conectado del Generador.
- ⬜ **FASE 1** — Academia (único pendiente del módulo).
- **La migración 001 ya incluye TODAS las columnas** (`buyer_persona`,
  `mezcla`, `presupuesto`, `calendario`). No habrá más migraciones por
  herramienta, salvo que aparezca algo nuevo.
- **Aclaración importante:** `src/app/ecosistema/universidad/marketing/` es
  el prototipo mock del ecosistema "dos mundos" (usa `mock-state`), NO se
  toca. El módulo real funcional vive en `src/app/marketing/`.

### Progreso detallado del módulo Mercados (`/mercados`)
- ✅ **FASE 0** — Cimientos: identidad visual propia (azul/cyan, NO copia Finanzas),
  login único vía `/api/mercados/perfil`, tablas SQL `mercados_*`, dashboard.
- ✅ **FASE 1** — Academia completa: 13 clases con teoría + ejercicio + quiz.
  (1A fundamentos, 1B instrumentos, 1C análisis). `/mercados/academia`.
- ✅ **FASE 2** — Laboratorio: dashboard "Mis investigaciones" (CRUD, opción B
  aprobada), etapa Diseño (objetivos/hipótesis/variables/geografía), etapa
  Muestreo (calculadora real conectada a la fórmula de la clase 5).
- ✅ **FASE 3** — Diseñador de encuestas (6 tipos de pregunta con guías).
- ✅ **FASE 4** — Recolección pública: link/QR sin login (`/mercados/responder/[token]`),
  endpoint público, dashboard con conteo vs meta, publicar/cerrar/reabrir.
- ✅ **FASE 5** — Análisis univariado automático (frecuencias, %, stats numéricas).
- ✅ **FASE 6** — Reporte consolidado en Markdown, descargable + artefacto.

**MÓDULO MERCADOS COMPLETO.** Ciclo entero funcional: aprender → diseñar →
muestrear → encuestar → recolectar respuestas reales → analizar → reportar.

Patrón confirmado: cada fase grande se divide en sub-olas (1A/1B/1C, 2A/2B)
para mantener calidad y no saturar el contexto.

### Módulos eliminados del ecosistema
- ❌ **Axiom (simulador de exámenes)** — el usuario decidió quitarlo del ecosistema. NO mencionarlo más como producto activo.

---

## §4 Decisiones clave (orden cronológico inverso)

### 2026-06-07 — Generador Modo Conectado: Wave 3 (export LaTeX/Overleaf)
- `documentoALatex()` en `src/lib/generador/latex.ts` reusa `escaparLatex` y
  `mdALatex` de latexMonografia para producir un `.tex` compilable (article con
  título, índice y secciones). Endpoint `GET /api/maestro/[id]/latex` y botón
  ".tex (Overleaf)" en el documento. Push 4e655f0.
- El Generador conectado entrega ya el ciclo completo: vincular módulos →
  consolidar contexto → redactar el documento con IA → exportar a markdown/.md
  y LaTeX/Overleaf.

### 2026-06-07 — Generador Modo Conectado: Wave 2 (documento)
- Construido el **documento del proyecto** en `/generador/[id]/documento`: el
  estudiante arma la estructura (10 secciones típicas de proyecto de grado, o
  desde cero), genera cada capítulo con IA usando el contexto cruzado del
  maestro, edita/reordena, y exporta (copiar markdown, descargar `.md`, imprimir).
- **Persistencia:** columna `documento` JSONB en `proyecto_maestro` (migración
  **002_documento.sql** — el usuario debe ejecutarla). Whitelist PATCH ampliada.
- Generación por sección y "generar todas las vacías" (loop). Reusa
  `/api/ai/asistir` con `maestroId`. Push 164838f.
- **Pendiente Wave 3:** export real LaTeX/PDF/Overleaf (reusar la maquinaria de
  `/projects/*`). Sigue pendiente el widget "Trabajando en" y las Academias.

### 2026-06-07 — Generador Modo Conectado: Wave 1
- Construida la primera ola del **Generador conectado** en `/generador`
  (identidad teal, usa la sesión de webapp con `/api/auth/me`, sin tabla de
  perfil propia). Es el corazón de la visión "Dos Mundos".
- **Qué hace ya:** crear/listar Proyecto Maestro; en el workspace, vincular UN
  proyecto por cada uno de los 7 módulos (idea, mercados, estrategia, marketing,
  organización, finanzas, defensa); ver el "contexto consolidado" que la IA
  leerá; y generar con IA un borrador del índice del proyecto de grado que
  integra el trabajo real de cada módulo.
- **Infra reusada/extendida:** `construirContextoMaestro()` ahora cubre los 7
  módulos (antes solo 3). Nuevas APIs: GET/PATCH/DELETE `/api/maestro/[id]`,
  GET `/api/maestro/disponibles`, GET `/api/maestro/[id]/contexto`, DELETE en
  vincular. `/api/ai/asistir` ya inyectaba el contexto cruzado vía `maestroId`.
- No requiere migración nueva (las tablas `proyecto_maestro` ya existían).
  Push 3808cfb.
- **Pendiente Wave 2 del Generador:** generación capítulo por capítulo (no solo
  el índice), guardar el borrador, y export (LaTeX/PDF/Overleaf como ya hace
  `/projects/*`). Además sigue pendiente el widget "Trabajando en: [proyecto
  maestro]" en los headers de los módulos y las Academias (FASE 1).

### 2026-06-07 — Defensa: módulo completo (FASE 0 + 3 herramientas). ¡TODOS los módulos con laboratorio!
- Construido el módulo Defensa: identidad **índigo** (#4f46e5, tema tribunal),
  login único, tablas `defensa_*`, y 3 herramientas: **Banco de preguntas**
  (por categoría + generador IA de 8), **Simulacro** (la IA evalúa cada
  respuesta 0-10 con feedback; promedio en vivo, reanuda intento) y **Reporte**
  (desempeño por categoría con barras + categorías a reforzar). Push a0d31f9.
- Reusa `/api/ai/asistir` para generar preguntas y evaluar respuestas (sin
  endpoint nuevo).
- **HITO: los 7 módulos del orden tienen laboratorio funcional.** Idea,
  Mercados, Estrategia, Marketing, Organización, Finanzas y Defensa.
- **7 colores asignados:** Finanzas/negro · Mercados/sky · Estrategia/violet ·
  Marketing/rose · Organización/emerald · Idea/amber · Defensa/indigo.
- **Pendientes globales:** Academias (FASE 1) de cada laboratorio nuevo;
  Generador modo conectado (importar los reportes/artefactos); widget
  "Trabajando en: [proyecto maestro]" en los headers.

### 2026-06-07 — Idea / Pre-validación: módulo completo (FASE 0 + 5 herramientas)
- Construido el módulo entero en una sola ola: identidad **ámbar** (#d97706,
  tema bombilla), login único, tablas `idea_*`, shell, y 5 herramientas:
  **Lean Canvas** (9 bloques + IA), **Propuesta de valor** (VPC: perfil del
  cliente + mapa de valor), **Validación** (hipótesis con experimento/criterio/
  resultado + plantilla de las 2 críticas), **Scorecard** (deseabilidad/
  factibilidad/viabilidad 1-5 → veredicto) y **Reporte** consolidado. Push 7b2ff5a.
- **6 colores asignados:** Finanzas/negro · Mercados/sky · Estrategia/violet ·
  Marketing/rose · Organización/emerald · Idea/amber. Libres: teal, indigo.
- **4 laboratorios al 100%** (Idea, Estrategia, Marketing, Organización) +
  Mercados completo + Finanzas. Falta del orden: solo **Defensa** (7°).

### 2026-06-07 — Organización: laboratorio completo (6 herramientas)
- Construidas las 6 herramientas en una sola ola: **Organigrama** (editor +
  árbol derivado de "reporta a"), **RRHH** (planilla con aportes patronales
  bolivianos editables y costo-empresa en vivo), **Legal** (checklist de
  trámites bolivianos con estado/costo/avance), **Técnico**, **Branding** y
  **Reporte consolidado**. Push 80d15be.
- Ajuste: el tipo de aportes de RRHH se corrigió para ser fiel a Bolivia —
  patronal mensual ≈16.71% (caja salud 10 + provivienda 2 + riesgo prof 1.71
  + solidario 3) y provisiones aguinaldo+indemnización (8.33% c/u). El total
  se calcula y se muestra; el estudiante puede ajustar cada %.
- **3 módulos con laboratorio 100%** (Estrategia, Marketing, Organización) +
  Mercados completo + Finanzas. Pendiente transversal: Academias (FASE 1) de
  Estrategia/Marketing/Organización, y el Generador modo conectado.

### 2026-06-07 — Organización: FASE 0 (cimientos)
- Construido el shell del módulo Organización siguiendo el patrón ya validado
  4 veces (Finanzas, Mercados, Estrategia, Marketing): identidad **emerald-600**
  (#059669) bajo `.organizacion-scope`, login único, tablas `organizacion_*`
  con todas las columnas incluidas, ProtectedRoute, RootLayout, hub, Academia
  stub, "Mis proyectos" (CRUD) y vista de proyecto con sus 6 herramientas como
  etapas marcadas "Pronto". Build verde. Push cc1be06.
- **Colores asignados a los módulos (registro definitivo):** Finanzas/negro ·
  Mercados/sky · Estrategia/violet · Marketing/rose · Organización/emerald.
  Quedan disponibles para próximos módulos: amber, teal, indigo.
- Herramientas previstas (orden lógico): organigrama → RRHH (con aportes
  patronales bolivianos 30.37%: caja salud 10%, provivienda 2%, riesgos
  profesionales 1.71%, aporte solidario 3%, aguinaldo 8.33%, prima 8.33%) →
  legal (NIT, Fundempresa, AFP, licencia funcionamiento) → técnico (proceso,
  capacidad, layout, equipos, proveedores) → branding (esencia, valores,
  personalidad, promesa, paleta) → reporte consolidado.

### 2026-06-07 — Marketing: laboratorio completo (5 herramientas)
- Construidas las 5 herramientas del laboratorio en una sola ola (sin pausas
  entre cada una, por decisión del usuario): **Buyer persona**, **Mezcla
  4Ps/7Ps**, **Presupuesto y CPL por canal**, **Calendario editorial** y
  **Reporte consolidado**.
- El Presupuesto/CPL calcula leads, ventas, ingreso, ROAS y CAC en vivo
  (todo en bolivianos). El Reporte es el artefacto que el Generador modo
  conectado podrá importar. Push 3b585c6.
- **Patrón confirmado:** una vez la FASE 0 está sólida (identidad + login +
  shell + tablas con todas las columnas), construir las herramientas de
  un módulo entero en una sola ola es viable y mantiene calidad si cada
  herramienta hereda el patrón ya validado.

### 2026-06-07 — Marketing: FASE 0 (cimientos del módulo)
- Construido el shell del módulo Marketing siguiendo el patrón validado:
  identidad visual **rosa/magenta** (#f43f5e) bajo `.marketing-scope`, login
  único por sesión de webapp con super-admin por email, tablas `marketing_*`
  (JSONB, sin RLS, id TEXT), ProtectedRoute, RootLayout con menú lateral,
  hub, Academia (stub), "Mis planes" (CRUD) y vista del plan con sus 5
  herramientas como etapas marcadas "Pronto". Build verde. Push 5fc4835.
- **Migración 001 incluye TODAS las columnas** (`buyer_persona`, `mezcla`,
  `presupuesto`, `calendario`) — no habrá más migraciones por cada
  herramienta. El usuario debe ejecutarla en Supabase para que el módulo
  guarde datos (mientras tanto, el shell se ve pero el login fallará).
- **Aclaración encontrada y registrada:** `src/app/ecosistema/` es un
  prototipo con `mock-state` del ecosistema "dos mundos"; los módulos
  reales viven en `src/app/<modulo>/`. Marketing real está en `src/app/marketing/`.
- **Decisión del usuario:** seguir construyendo herramientas sin pausa
  entre cada una ("LA QUE SIGUE POR QUE ME PREGUNTAS??").

### 2026-06-07 — Estrategia: laboratorio al 100% (MCPE/QSPM) + siguiente módulo
- Construida la última herramienta: **MCPE/QSPM** (Matriz Cuantitativa de
  Planificación Estratégica). Autocompleta los factores clave desde MEFE/MEFI
  y las estrategias candidatas desde el FODA cruzado; puntúa peso × atractivo
  (CA 1-4) y entrega el ranking con la estrategia recomendada (🏆). El Reporte
  consolidado ahora incluye esa decisión final.
- **Laboratorio de Estrategia: 13/13 herramientas.** Build verde, push f289a0c.
- Nueva migración **003_mcpe.sql** (columna JSONB `mcpe`) — el usuario debe
  ejecutarla en Supabase para que MCPE guarde (las otras 12 ya funcionan).
- **Decisión del usuario:** seguir con "el que sigue" = el módulo **Marketing**
  (4° del orden aprobado). La Academia de Estrategia (FASE 1) queda pendiente.

### 2026-06-06 — Estrategia: laboratorio completo (12 herramientas)
- Construidas las 4 herramientas que faltaban: **BCG** (matriz de portafolio
  con gráfico 2x2), **Ansoff** (4 cuadrantes de crecimiento + IA), **PEYEA**
  (vector de posición estratégica en SVG) y el **Reporte consolidado** (todas
  las herramientas en un documento, con copiar en markdown e imprimir → es el
  artefacto que alimentará el modo conectado del Generador).
- Las 12 herramientas del laboratorio quedan habilitadas en la vista del
  análisis. Build verde (tsc + eslint + next build), push a `main` (624ee9e).
- **Pendiente reconocido:** MCPE/QSPM era parte de la lista "TODAS" aprobada y
  aún no se construyó (VRIO quedó como opcional). El usuario decidió construir
  MCPE/QSPM a continuación para cerrar el 100% de las herramientas.

### 2026-06-06 — CIERRE DE SESIÓN
Sesión enorme. Logrado:
- **Finanzas:** simuladorPRO migrado entero a `/finanzas` (login único, light).
- **Mercados:** módulo COMPLETO (FASES 0-6) — academia 13 clases + laboratorio
  (diseño, muestreo, encuesta, recolección pública link/QR, análisis, reporte).
- **Estrategia:** FASE 0 (cimientos, identidad violeta). Alcance = TODAS las
  herramientas (decidido).
- **Contexto compartido + IA:** Proyecto Maestro (PASO 1) + servicio IA
  compartido `/api/ai/asistir` con contexto cruzado (PASO 2) + componente
  reusable `SugerirIA`.
- **Login único Google** funcionando en todos los módulos; super-admin por
  email (ronaldmartinezjimenes@gmail.com, rnd261190@gmail.com).
- **SQL ejecutado por el usuario en Supabase:** migrations-mercados,
  migrations-estrategia, migrations-maestro (las 3 tablas base ya existen).

**Próximo paso al retomar: PASO 3** — construir las herramientas de Estrategia
(empezar por PESTEL) ya con plantillas bolivianas + botón "Sugerir con IA" +
conexión al proyecto maestro. Replicar el patrón para el resto de herramientas.

**Pendientes menores:**
- Selector "Trabajando en: [proyecto maestro]" visible en cada módulo (UI del
  PASO 1; la infraestructura ya existe, falta el widget en los headers).
- Vincular Mercados/Finanzas existentes al proyecto maestro vía UI.

### 2026-06-06
- **Módulo Mercados — alcance aprobado:**
  - Alcance completo: 13 clases (academia) + 8 herramientas (laboratorio).
  - Encuestas se recolectan vía link/QR público SIN login (cualquiera responde).
  - Integración con datos abiertos bolivianos (INE, datos.gob.bo) es
    NO-BLOQUEANTE: si las APIs están caídas, el módulo igual funciona y el
    estudiante puede ingresar datos manualmente.
  - APIs de Meta Ads y TikTok Ads en fase 2, cuando el usuario tenga
    las credenciales correspondientes.
  - Mercados NO copia la estructura de Finanzas. Finanzas es calculadora;
    Mercados es un proceso completo (diseñar → recolectar → analizar → reportar).
- **Regla de ejecución:** dividir el trabajo grande en fases de alta
  calidad. NO hacer todo de un golpe (sale simplón). Cada fase se construye,
  verifica y commitea por separado.
- **Axiom queda eliminado** del ecosistema. No se cuenta como producto.
- **Bitácora viva creada.** Este archivo se actualiza con cada cambio
  importante y se entrega cuando el usuario lo pide.
- **Orden de construcción ratificado:** Mercados (2°) → Estrategia (3°)
  → Marketing (4°) → Organización (5°) → Idea (1°) → Defensa (7°).
- **Login único funcionando:** una sesión Google de webapp da acceso al
  módulo Finanzas sin segundo login. Patrón a replicar para todos los
  módulos futuros.
- **`ronaldmartinezjimenes@gmail.com` y `rnd261190@gmail.com`** son
  super-admins hardcoded del laboratorio. Detectados automáticamente
  como rol más alto en cada módulo.
- **Triggers de Supabase basados en `auth.uid()` eliminados** — webapp
  no usa Supabase Auth, esos triggers bloqueaban UPDATEs silenciosamente.
- **Migración simuladorPRO → módulo `/finanzas`** completada (99 archivos,
  ~28k líneas). Tablas con prefijo `finanzas_*` para coexistir sin chocar
  con tablas de webapp.
- **Módulo `/finanzas` es light-only** (sin clases `dark:`). Replicar
  en los próximos módulos.

### 2026-06-04
- **Confirmada arquitectura "Dos Mundos"** (Universidad ⇄ Generador) y
  el "Generador con 2 modos" (Automatizado vs Conectado).
- **Decisión: NO replicar el simuladorPRO en webapp.** Lo migramos
  tal cual (código + UI) como módulo independiente con su propia
  identidad visual.
- **CSS fix raíz en webapp:** el reset universal estaba fuera de
  `@layer base`, rompía utilities de Tailwind 4 en TODA la app.
  Envolverlo arregló el problema general.

---

## §5 Reglas firmes del producto (NO olvidar)

1. **Copy: español neutro con tuteo boliviano.** NUNCA voseo argentino
   ("sabés", "podés", "tenés", "querés"). Bloqueador de calidad.
2. **No mockups que se vendan como reales.** Si algo no funciona,
   decirlo explícito.
3. **Cada módulo tiene su propia identidad visual** (header propio,
   sidebar propio, tokens propios). NO se mezclan visualmente.
4. **Pero TODOS los módulos comparten:** mismo login Google, mismo
   Supabase, mismo usuario, mismos datos transversales.
5. **Cada módulo es light-only.** Sin clases `dark:` en componentes
   del módulo (el resto de webapp sí soporta dark mode).
6. **Auto-onboarding:** la primera vez que un usuario entra a un módulo,
   se le crea el perfil automáticamente con los datos de su sesión de
   webapp. SIN pedirle nada.
7. **`ronaldmartinezjimenes@gmail.com` y `rnd261190@gmail.com` son
   super-admins hardcoded.** Detectados como rol más alto en cualquier
   módulo, sin pasos manuales.
8. **Verificar en navegador antes de decir "listo".** Type-check y lint
   NO son verificación funcional.
9. **No replicar el simuladorPRO en código.** Si es necesario un módulo
   parecido, se copia y adapta como hicimos con Finanzas.

10. **🚨 REGLA IRROMPIBLE — CUALQUIER cambio en la visión, contexto,
    decisiones o este archivo de bitácora DEBE ser aprobado por el
    usuario explícitamente antes de commitear.** No esperar al final
    de la sesión. Anotar y preguntar EN VIVO, en cada decisión nueva,
    para no perder nada al cerrarse la ventana de contexto.

    Mecanismo de operación:
    - Cuando surge una decisión nueva → la formulo en una línea
      ("¿agrego a la bitácora: '...'?")
    - Espero aprobación del usuario (sí / ajusta / no)
    - Si aprueba → edito la bitácora + commit + push
    - Si pide ajuste → reformulo y vuelvo a preguntar
    - Si dice no → no toco la bitácora

    Esto vale tanto para agregar decisiones nuevas como para modificar
    visión, módulos, reglas, próximos pasos. SIN excepción.

---

## §6 Patrón técnico para construir un módulo nuevo

> Plantilla a seguir cuando arranquemos Mercados, Estrategia, etc.

1. **Carpeta `src/app/<modulo>/`** con su propio `layout.tsx`, scope CSS
   y header de identidad propia.
2. **Carpeta `src/lib/<modulo>/`** con funciones puras del dominio.
3. **Carpeta `src/components/<modulo>/`** con componentes UI propios
   del módulo (sin clases `dark:`).
4. **Endpoint `/api/<modulo>/perfil`** con auto-sync de rol por email
   (igual al de Finanzas). Garantiza login único.
5. **Migraciones SQL con prefijo `<modulo>_*`** para coexistir con
   webapp y los otros módulos sin chocar tablas.
6. **SIN triggers Supabase basados en `auth.uid()`** (webapp no usa
   Supabase Auth). La autorización siempre en server-side via JWT.
7. **Documentar en esta bitácora** la decisión de construir el módulo,
   el orden de pasos del estudiante, y los artefactos exportables al
   Generador.

---

## §7 Próximo paso recomendado

**Construir el módulo Mercados (`/mercados`):**

- Investigación de mercados con APIs reales:
  - Google Trends (tendencia de búsquedas por categoría)
  - Meta Ads (audiencias, alcance, CPL)
  - TikTok Ads (segmentación, costo por mil)
- Calculadora de muestreo
- Diseñador de encuestas
- Tabulador + análisis cruzados
- Mini-LMS con clases sobre tipos de muestreo, escalas Likert, etc.
- Artefactos exportables al Generador: el estudio completo con datos reales.

---

## §8 Glosario

| Término | Significado |
|---|---|
| **Laboratorio Académico PRO** | Nombre comercial del producto entero (webapp + módulos) |
| **Generador Autónomo** | Modo donde la IA genera el documento entero desde el tema |
| **Generador Conectado** | Modo donde el Generador importa artefactos de los módulos |
| **Módulo educativo** | Mini-LMS especializado (Finanzas, Mercados, etc.) con clases + herramienta + artefactos |
| **Artefacto** | Trabajo concreto que el estudiante produce en un módulo (ej. un análisis financiero, un estudio de mercado) y que puede importarse al Generador |
| **Bitácora viva** | Este archivo. Memoria evolutiva del proyecto |
| **Super-admin** | Email hardcoded con rol más alto en todos los módulos |
