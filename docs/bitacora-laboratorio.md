# Bitácora viva — Laboratorio Académico PRO

> Este archivo es la **memoria evolutiva del proyecto**. Aquí guardamos las
> decisiones, la visión actual y los próximos pasos — NO el código.
> Se actualiza cada vez que cambia algo importante.
>
> **Última actualización:** 2026-06-11 (sesión 13: IVA débito/crédito + IT + régimen tributario boliviano implementado end-to-end + lámina tributaria en Modo Demostración)

---

> **Actualizacion 2026-06-17:** el simulador financiero embebido en WEBAPP fue
> retirado. La seccion `/finanzas` queda como bridge visual hacia
> `simuladorPRO`, que es la fuente oficial de calculos, IVA/IT/IUE, VAN, TIR,
> WACC, flujo de caja, sensibilidad y simulacion financiera.

## §0 Cómo retomar (LEER PRIMERO)

**Para arrancar la próxima sesión, dile a Claude:**
> "Lee `docs/bitacora-laboratorio.md` y elige el próximo pendiente de la lista."

✅ **CERRADO EN SESIÓN 13:** IVA débito/crédito fiscal + IT + régimen tributario
boliviano implementado en el simulador Finanzas. Backend (tipos, helpers de
cálculo, integración en `construirFlujoCaja`), UI (selector de régimen en
Paso 1, switch `emiteFactura` por producto, switch `conFactura` por inversión,
por insumo directo y por gasto operativo) y lámina #7 de Modo Demostración
("Carga tributaria boliviana") con gráfico apilado IVA+IT y cuota fija RTS/RAU.
Commits: `a8e5064` (backend + Paso 1), `8294e8e` (switches en pasos 2/5/6),
`01c2c27` (lámina tributaria). Cero migración SQL — todo en JSONB con campos
opcionales que preservan el comportamiento legado en proyectos viejos.

🚨 **PRÓXIMOS PENDIENTES (orden propuesto, el usuario decide):**
1. Auditoría pedagógica de las 38 clases + 30 casos.
2. Promover `/adaptativo` (existe pero está escondido) al landing.
3. Generar un documento completo de prueba end-to-end y revisarlo.

Con eso retoma todo el contexto. El proyecto está MUY avanzado: los **7 módulos
educativos están COMPLETOS** (academia + laboratorio), el **Generador conectado**
funciona (Waves 1-3) y el **widget transversal** "Trabajando en" está integrado.

### ⚠️ Migración pendiente (sesión 4)
- ⬜ `migrations-idea/002_modalidad.sql` — columnas `tipo_trabajo` + `universidad`
  en `idea_proyectos`. Necesaria para que "Define tu idea" guarde la modalidad.
  Pegar en Supabase → SQL Editor:
  `ALTER TABLE idea_proyectos ADD COLUMN IF NOT EXISTS tipo_trabajo TEXT, ADD COLUMN IF NOT EXISTS universidad TEXT;`

### Estado de migraciones SQL
| Migración | Estado |
|---|---|
| `migrations-finanzas/*` | ✅ |
| `migrations-idea/002_modalidad` | ⬜ PENDIENTE (sesión 4) |
| `migrations-mercados/001` | ✅ |
| `migrations-estrategia/001`, `002`, `003_mcpe` | ✅ |
| `migrations-maestro/001_proyecto_maestro` | ✅ |
| `migrations-maestro/002_documento` | ✅ |
| `migrations-marketing/001` | ✅ |
| `migrations-idea/001` | ✅ |
| `migrations-defensa/001` | ✅ |
| `migrations-organizacion/001` | ✅ |
| `migrations-docente/001_vinculacion` | ⬜ PENDIENTE (sesión 6) |
| `migrations-docente/002_observaciones_consentimiento` | ⬜ PENDIENTE (sesión 6) |
| `migrations-docente/003_observaciones_proyecto_borrado` | ⬜ PENDIENTE (sesión 6) |
| `migrations-docente/004_wave4_rubrica_calificacion_calendario` | ✅ APLICADA (sesión 10, 2026-06-09) |

### Pendientes
- ⬜ **(opcional)** Export PDF directo del Generador. El `.tex` y el ZIP
  Overleaf cubren el caso de uso académico estándar.

### Cerrado el 2026-06-07 (sesión 2)
- ✅ **Auto-conexión widget → SugerirIA** (commit `e3dab91`). Hook
  `useMaestroActivo()`: si `SugerirIA` no recibe `maestroId` por prop, lee el
  maestro activo del widget y muestra "Usando contexto de: [proyecto]".
  Todas las herramientas de los 7 módulos pasan a usar contexto cruzado
  automáticamente sin tocar el código de cada herramienta.
- ✅ **Export ZIP Overleaf con plantilla por universidad** (commit `ae06927`).
  `armarZipOverleaf()` detecta UMSS/UCB/UCATEC/UNIFRANZ por nombre y reusa los
  preámbulos+carátulas existentes. Endpoint `/api/maestro/[id]/zip` + botón
  "ZIP Overleaf" en el documento. Campos faltantes quedan como placeholders
  editables `[Tu carrera]`.

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
  - **Wave 4:** **ZIP Overleaf con plantilla por universidad** —
    `armarZipOverleaf()` detecta UMSS/UCB/UCATEC/UNIFRANZ y reusa los
    preámbulos+carátulas oficiales (`src/lib/latex/preamble-*.ts`). Endpoint
    `/api/maestro/[id]/zip` + botón "ZIP Overleaf". Si no detecta, fallback
    al article genérico.
  - Pendiente (opcional): PDF directo (el `.tex` y el ZIP ya cubren el caso).
- ✅ **Widget "Trabajando en: [proyecto maestro]"** en los headers de los
  módulos (Estrategia, Marketing, Organización, Idea, Defensa, Mercados):
  componente reusable `WidgetMaestro` + helper de maestro activo
  (localStorage). Da continuidad y enlaza al Generador.
- ✅ **Auto-conexión widget → SugerirIA** — hook `useMaestroActivo()`. Todas las
  herramientas que usan `SugerirIA` ahora pasan automáticamente el `maestroId`
  al servicio de IA, sin necesidad de tocar el código de cada herramienta.

### Módulos educativos (orden de uso por el estudiante)

| # | Módulo | Estado | Notas |
|---|---|---|---|
| 1 | Idea / Pre-validación | ✅ COMPLETO | Academia (5 clases + quiz) + laboratorio (5 herramientas: Lean Canvas, VPC, Validación, Scorecard, Reporte). Ámbar. |
| 2 | Mercados (Investigación) | ✅ COMPLETO | Módulo entero (FASES 0-6). Detalle abajo. |
| 3 | Estrategia / Macroentorno | ✅ COMPLETO | Academia (6 clases + quiz) + laboratorio (13 herramientas). Detalle abajo. |
| 4 | Marketing | ✅ COMPLETO | Academia (5 clases + quiz) + laboratorio (5 herramientas: buyer persona, mezcla 4Ps/7Ps, presupuesto/CPL con ROAS/CAC, calendario, reporte). Rose. |
| 5 | Organización | ✅ COMPLETO | Academia (5 clases + quiz, incl. aportes patronales y legal BO) + laboratorio (6 herramientas). Emerald. |
| 6 | **Finanzas (simuladorPRO)** | ✅ COMPLETO | Migrado desde repo externo `RonMarty2/simuladorPRO`. Constructor 9 pasos + simulación turno-a-turno con eventos económicos bolivianos + ranking + 26 ejemplos |
| 7 | Defensa | ✅ COMPLETO | Academia (4 clases + quiz) + laboratorio (banco de preguntas con IA, simulacro evaluado por IA, reporte). Índigo. |

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
- ✅ **FASE 1 — Academia:** 6 clases (teoría + ejemplo boliviano + quiz) en `/estrategia/academia`. **Módulo COMPLETO.**
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
- ✅ **FASE 1 — Academia:** 5 clases (teoría + ejemplo boliviano + quiz) en `/marketing/academia`. **Módulo COMPLETO.**
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

### 2026-06-09 (sesión 12) — ACTA DE ENTENDIMIENTO (aprobada explícitamente por el usuario)

**Contexto:** el usuario pidió una revisión a fondo de la bitácora con
preguntas iterativas hasta dejar CERO sobreentendidos sobre qué es y
qué tiene el SaaS. Se hicieron 5 rondas de preguntas. Resultado: acta
aprobada con "Sí, apruebo todo".

#### Hallazgos de la revisión

1. **GRAVE — Sesión 11 montó piezas en el prototipo mock:** por los
   reseteos del entorno de trabajo, 25 de los 30 casos + las 4
   calculadoras reactivas + el Tutor IA de Mercados/Estrategia/
   Marketing + las "plataformas Org/Defensa" quedaron bajo
   `/ecosistema/universidad/*` (prototipo con mock-state que la propia
   bitácora marca como "NO se toca"), NO en los módulos reales
   (`/mercados`, `/estrategia`, `/marketing`, `/organizacion`,
   `/defensa`). Solo Idea, `/projects` y el documento web cayeron en
   el producto real. **Nota:** las "plataformas Org/Defensa" del mock
   son además redundantes — los módulos reales YA tenían academia y
   laboratorio completos desde sesiones previas.
2. **Ruta `/adaptativo` sin documentar:** wizard que analiza la guía
   de la universidad del alumno con IA (`/api/adaptativo/analyze-guide`
   + `create-project`) y crea un proyecto con plan adaptado. No
   aparece en la bitácora; origen desconocido.
3. **Axiom confirmado eliminado** del código (0 restos en src).
   CLAUDE.md de main ya está actualizado (cascada Anthropic→Gemini→
   OpenAI→Groq); quedan 3 menciones residuales menores.
4. **Core DB:** `db/index.ts` usa Supabase si hay env vars, con
   fallback a memoria. Supabase CONFIRMADO operativo en producción
   (evidencia: el proyecto de prueba sobrevivió 8 deploys con sus
   fases intactas).

#### Decisiones aprobadas (las 12)

1. **Migrar** todo lo útil del mock `/ecosistema` a los módulos
   reales: galerías de casos (5 módulos), Tutor IA en herramientas
   reales, simulador de eventos en Marketing/Estrategia reales,
   calculadoras solo donde no dupliquen herramientas existentes.
2. **Eliminar `/ecosistema` completo** después de la migración
   (vitrina con datos falsos y precios inventados; riesgo de
   confusión).
3. **Eliminar `/scribe`** y endpoints legacy sin auth
   (`/api/monografias|citas|documentos|compilar`) verificando antes
   que nada actual dependa de ellos.
4. **Auditar `/adaptativo`** → reporte para decidir si se queda
   (es un experimento, según el usuario).
5. **Bridge Finanzas↔docente: arreglarlo pronto** (subió de
   prioridad). El docente debe ver el trabajo de Finanzas del alumno.
6. **Precios actuales (6 SKUs Bs 150–950) son DE PRUEBA.** Los
   finales los define el usuario más adelante. Cobro a docentes: sin
   decidir (ya no se asume Bs 300/mes).
7. **Público objetivo: los 3 a la vez** (alumno apurado + alumno
   formativo + docente). La landing debe hablarles a los tres.
8. **PDF compilado a mano queda ESCONDIDO** (solo admin). El alumno
   usa exclusivamente el documento web + copiar a Word.
9. **Universidades prioritarias: las 7 de los 3 ejes** — CBBA (UMSS,
   UNIFRANZ, UCATEC), LP (UMSA, UCB), SCZ (UAGRM, UPB).
10. **Botón WhatsApp de ventas: esconderlo** mientras el usuario no
    configure `NEXT_PUBLIC_WHATSAPP_VENTAS` en Vercel (hoy abre un
    número falso). Instrucción entregada al usuario.
11. **PLAN DE CALIDAD (preocupación central del usuario):**
    a) *QA de lo generado* — generar documentos completos de prueba
       y revisarlos con rúbrica de tribunal (coherencia, citas,
       números, formato). b) *Auditoría pedagógica* — revisar las 41
       clases y los 30 casos con rúbrica docente; el usuario valida
       una muestra para calibrar criterio. Reportes por módulo.
12. **Estado operativo confirmado:** solo el usuario usa la app
    (datos de prueba, se pueden tocar); Supabase conectado.

#### Orden de ejecución acordado

1. Migración mock → módulos reales. 2. Eliminar `/ecosistema` y
`/scribe`. 3. Esconder WhatsApp sin env var. 4. Auditoría
`/adaptativo`. 5. Bridge Finanzas↔docente. 6. Plan de Calidad.

#### Estado de ejecución del acta (al final de la sesión 12)

- ✅ **Mercados real**: galería de casos bolivianos en `/mercados/casos`
  y `/mercados/casos/[slug]` + card en el hub.
- ✅ **Estrategia, Marketing, Organización, Defensa reales**: galería +
  detalle migrados del mock con sed (todos los links reapuntados a las
  rutas reales). Card "Casos de Bolivia" en cada hub.
- ✅ **`/ecosistema` ELIMINADO** (488 KB de mock con datos falsos +
  componentes propios + libs). Cero consumidores externos.
- ✅ **`/scribe` legacy ELIMINADO** + endpoints sin auth eliminados
  (`/api/monografias|citas|documentos|compilar|export/latex`). `cap1-variants`
  y `export/pdf` se quedan porque sí los consume el flujo actual.
- ✅ **Bridge Finanzas↔docente por email**: el endpoint
  `/api/docente/alumnos/[id]/proyectos` ahora consulta `finanzas_perfiles`
  por email (UNIQUE NOT NULL) y agrega Finanzas como 8º módulo del
  agregado del alumno. `sin_finanzas` ahora es dinámico.
- ✅ **WhatsApp bloque oculto sin env var**: el card "¿solo quieres un
  módulo?" en `/pago` solo se renderiza si `NEXT_PUBLIC_WHATSAPP_VENTAS`
  está configurada. Antes abría un número 591-00000000 falso.
- ✅ **Modo Demostración Finanzas**: ruta `/finanzas/demostracion/[id]`
  con 10 láminas (portada, idea, inversión, ingresos, costos, flujo,
  indicadores VAN/TIR/payback/IR/RBC, recuperación, punto de equilibrio,
  veredicto). Navegación con flechas, fullscreen, imprimir A4 landscape
  con una lámina por página. Botón 🎬 en el header de simular-proyecto.
  Cero IA, cero migración SQL.

#### IVA débito/crédito + IT — DISEÑO APROBADO (a ejecutar próxima sesión)

**Diagnóstico:** `src/lib/finanzas/calculo-financiero.ts` exporta
`TASA_IVA = 0.13` y `TASA_IT = 0.03` y los menciona en el comment de
contexto boliviano, pero **el flujo nunca los aplica** (`flujo-proyecto.ts`
solo usa IUE 25%). Resultado: el simulador hoy enseña una verdad a
medias — el alumno calcula utilidad y VAN sin la carga tributaria
real que enfrentará el negocio.

**Plan aprobado por el usuario:**

1. **Régimen tributario** — nuevo subpaso en el constructor (o subsección
   del Paso 1 Datos):
   - 🟢 Régimen General (factura, IVA débito/crédito, IT mensual, IUE anual).
   - 🟡 RTS (Régimen Tributario Simplificado) — cuota fija bimensual por
     categoría de capital, SIN IVA ni IT. Ideal para comercios pequeños.
   - 🔵 RAU (Régimen Agropecuario Unificado) — productores rurales,
     cuota anual por hectárea.
   - ⚪ Sin actividad fiscal formal — para casos didácticos sin factura.

2. **Débito fiscal (ventas)** — en `productos[]` agregar campo
   `emiteFactura: boolean`. Si true → al ingreso bruto se le aplica IVA
   débito 13% e IT 3%. Si false → ingreso sin carga fiscal (mercado
   informal).

3. **Crédito fiscal (compras)** — agregar campo `conFactura: boolean`
   a CADA ítem comprable: `ItemInversion`, `CostoDirecto`, `CostoGeneral`
   (administración + comercialización). Si true → 13% del costo es
   recuperable como crédito fiscal.

4. **Cálculo mensual del IVA** (nuevo helper en `calculo-financiero.ts`):
   - `IVA_debito_mes = sum(ingresos_con_factura) × 0.13`
   - `Crédito_fiscal_mes = sum(compras_con_factura_del_mes) × 0.13`
   - `IVA_a_pagar = max(0, IVA_debito − Crédito_fiscal)`
   - Si el crédito supera al débito, el saldo a favor se arrastra al
     siguiente mes (Ley boliviana — crédito acumulable, no se pierde).

5. **IT (Impuesto a las Transacciones)** — 3% sobre ingresos brutos
   con factura, mensual. Pagable contra IUE al final del año (lo que
   pagaste de IT se descuenta del IUE, hasta el monto del IUE).

6. **Integración al flujo**: nuevos arreglos `ivaPorMes[]`, `itPorMes[]`,
   `creditoAcumulado[]` en el resultado de `construirFlujoCaja`. Se
   restan del flujo neto operativo.

7. **Modo Demostración** — nueva lámina "Carga tributaria mensual"
   entre la 6 (flujo) y la 7 (indicadores) con barras apiladas de
   IVA + IT + IUE por año.

**Trade-off honesto:** sin esto, el simulador es académicamente útil
pero no realista (el alumno termina con flujos sin IVA, que en la
realidad consumen 13% de las ventas mensuales formales). Con esto, el
simulador enseña la tributación boliviana real y los alumnos defienden
proyectos con cifras que el tribunal puede objetar técnicamente.

**Compatibilidad con proyectos existentes:** todos los campos nuevos
tienen default `false` o `"general"`, así que un proyecto guardado hoy
se carga con régimen General + emiteFactura=false + conFactura=false →
mismo comportamiento de hoy (sin IVA aplicado). El alumno activa los
switches uno a uno cuando quiere incorporar la fiscalidad real.

Cero migración SQL — todo cabe en el JSONB `datos` de `finanzas_proyectos`.

**Próximo paso al retomar:** ejecutar este plan (estimado: 1 sesión
de trabajo, 6-8 archivos tocados).

#### `/adaptativo` — VEREDICTO de la auditoría (NO eliminar)

Es un feature de IA (1239 LOC en `page.tsx` + 1028 demo + 4 libs +
2 endpoints) que NO estaba documentado en la bitácora. Qué hace:

1. El alumno SUBE la guía oficial de su universidad (PDF/DOCX/TXT, ≤10 MB)
   o pega el texto del syllabus.
2. `/api/adaptativo/analyze-guide` extrae texto (RAG processor) + manda
   a la IA (sistema en `prompts/adaptativo/analizar-guia.ts`) para
   identificar secciones obligatorias, formato, extensión, citas.
3. `templateMatcher` matchea contra el catálogo curado (UMSS clásico,
   UMSS posgrado, UCB, UNIFRANZ x4 modalidades, Plan de Negocio
   genérico) y devuelve un ranking con score.
4. `planBuilder` arma un `PlanAdaptativo` con las secciones requeridas
   por la guía remapeadas a las fases de la plataforma.
5. `/api/adaptativo/create-project` crea un proyecto REAL en
   `proyectos` con `servicio_id` y `tipo_proyecto_id` derivados de la
   plantilla matcheada — el flujo se conecta con `/projects/[id]/
   workspace` que ya existe.

**Por qué NO eliminarlo:** comercialmente es el captador más potente.
Reemplaza el wizard `/projects/new` (donde el alumno elige modalidad y
universidad a mano, errando seguido) con un flujo guiado por la guía
real de su tribunal. Hoy está como isla sin links: nadie llega ahí.

**Recomendación:** promoverlo al landing/dashboard como camino premium
("Sube la guía de tu tribunal y la IA te arma el flujo"). Queda como
pendiente accionable de la próxima sesión, no se toca esta vuelta.

---

### 2026-06-09 (sesión 11) — Mejora didáctica del SaaS (4 sprints + documento web + plataformas)

**Contexto:** después de cerrar Wave 4 docente en sesión 10, el usuario
reportó que los módulos "se sienten simplones, sin interactividad real,
sin ejemplos aplicados". Mi auditoría confirmó: 6 de 7 módulos eran
"formulario + botón Sugerir IA"; solo Finanzas era ricamente interactivo
(simulador turno-a-turno con 26 ejemplos). Roadmap propuesto y aprobado:
4 sprints de mejora didáctica + documento web limpio + extras.

**Commits de esta sesión:**
- Múltiples commits encadenados de los 4 sprints + documento web +
  Tutor IA expandido + simulador en proyecto + GitHub Action CI/CD.

#### Sprint 1 — Galería de 30 casos bolivianos pre-resueltos

`src/lib/casos/<modulo>/*.ts` + `src/app/<ruta>/casos/`. 6 módulos × 5
casos = 30 archivos de casos cada uno con:
- Emprendedor ficticio pero verosímil (nombre, edad, rol).
- Zona específica (Sopocachi, Cala Cala, Plan 3000, Equipetrol, El Alto
  Ceja, Coroico, Sucre, Tarija).
- Datos reales: Bs/USD plausibles, % de mercado, ROAS, planillas.
- Estructura propia por módulo: Idea (Lean Canvas + Validación), Mercados
  (Diseño + Muestreo + Encuesta + Resultados), Estrategia (PESTEL +
  Porter + FODA + matriz), Marketing (Buyer Persona + Mix + Presupuesto),
  Organización (Organigrama + RRHH + Legal + Técnico), Defensa (18
  preguntas tribunal × caso).
- Lecciones + errores evitados + tags.

UI: galería filtrable + detalle con tabs específicos del módulo.

#### Sprint 2a — Tutor IA aditivo (no reemplaza "Sugerir IA")

`src/lib/prompts/tutor-ia/refinar.ts` + endpoint
`/api/tutor-ia/refinar` + componente `<TutorIA>`. Devuelve **3 alternativas**
con pros/cons + pregunta crítica + lección clave + siguiente paso. NO
inserta texto por default; abre modal informativo. Coexiste con el
botón "Sugerir IA" original.

Integrado en 12 puntos del SaaS:
- Idea: lean-canvas, propuesta-valor, validacion (3).
- Mercados: muestreo, encuesta, resultados (3).
- Estrategia: PESTEL, Porter, MEFE, FODA (4).
- Marketing: canales, calendario (2).

#### Sprint 3 — 4 calculadoras reactivas (cero IA, matemática pura)

`src/components/calc-reactivas/` con 4 componentes:
- `CalcMuestraCochran` (Mercados): n con corrección por N finito.
- `CalcROASEmbudo` (Marketing): inversión / CPC / conversión / ticket
  con embudo visual y ROAS coloreado.
- `CalcPuntoEquilibrio` (Finanzas/Idea): CF/precio/CV con gráfica SVG
  inline del cruce ingresos vs costos.
- `CalcPESTELScore` (Estrategia): 6 dimensiones con slider -5/+5,
  agregación + top oportunidades vs amenazas.

Cada una con su demo en `/ecosistema/universidad/<modulo>/calculadora-reactiva`.

#### Sprint 4 — Simulador de eventos sorpresa (turno-a-turno con IA)

`src/lib/eventos-sorpresa/banco.ts` con 15 eventos (5 × 3 módulos).
Componente `<SimuladorEventos>` con localStorage por módulo (después
extendido para localStorage por módulo+proyectoId). Endpoint
`/api/eventos-sorpresa/evaluar` que la IA usa para evaluar la decisión
del alumno con: acertada/no, puntaje 1-10, feedback, consecuencias
corto/largo plazo, lección, próxima decisión sugerida.

**Extensión posterior:** página `/projects/[id]/simulador-eventos` que
toma el proyecto real del alumno y pasa título + contexto al simulador.
La IA evalúa contra SU caso, no genérico.

#### Documento web (NUEVO — feedback explícito del usuario)

El usuario observó que el flujo final (Compilar LaTeX) confundía al
alumno: código LaTeX crudo, "tu PDF tarda 1-2 horas", botones Overleaf,
opciones avanzadas. Decisión: el alumno NO necesita ver nada de eso,
el admin SÍ.

Solución aditiva:
- `src/lib/documento-web/numeracion.ts` — parser de markdown con
  numeración automática: capítulos en romanos (I, II, III),
  subsecciones decimales (1.1, 1.2.1), figuras y tablas con contador
  global.
- `src/lib/documento-web/citas.ts` — detecta APA paréntesis
  (Pérez, 2023), APA flujo Pérez (2023), numérica [1]. Consolida
  bibliografía única.
- `src/lib/documento-web/copiar-html.ts` — Clipboard API con
  ClipboardItem text/html (preserva formato al pegar en Word).
- `src/lib/documento-web/exportar-word.ts` — genera HTML con estilos
  inline que Word entiende: Times New Roman, márgenes, page-break.
- `src/lib/documento-web/normas-universitarias.ts` — **10 universidades
  bolivianas** mapeadas a sus normas (tipografía, tamaño, interlineado,
  márgenes, alineación, citas APA 7 / ISO 690, color de acento). UMSS,
  UNIFRANZ (Verdana 10pt portada guindo+dorado), UMSA, UAGRM, UTO, USFX,
  UCB, UPB, EMI (ISO 690), UCATEC.
- Componente `<DocumentoCompleto>` que procesa fases con numerador
  compartido, renderiza carátula + índice + capítulos + bibliografía,
  aplica la norma de la universidad del proyecto al CSS de pantalla.
- Página `/projects/[id]/documento-web` que carga el proyecto y muestra
  todo armado con botón "Copiar todo al Word".
- Workspace: nuevo botón verde "📖 Ver mi documento" prominente para
  alumno. Botón admin "Vista técnica" mantiene acceso a LaTeX/PDF.
- `LatexExportView.tsx` modificado: si NO es admin, muestra pantalla
  limpia con un CTA gigante al documento web (cero LaTeX visible).
- Workspace: en fase `ph-latex` y NO admin, sidebar técnico oculto.
  Solo aparece "Tu documento está armado" con guía corta.
- Label del sidebar cambia "LATEX / Compilar LaTeX" → "DOCUMENTO / Tu
  documento final" para alumno.

#### Infraestructura — GitHub Action de auto-deploy

Diagnóstico clave: el webhook nativo Vercel↔GitHub dejó de procesar
pushes a main (causa desconocida — token, integración). El "Promote
to Production" manual era requerido cada deploy.

Solución: `.github/workflows/vercel-auto-deploy.yml`:
- `on: push: branches: main` + `workflow_dispatch`.
- `concurrency: cancel-in-progress: true` (si llegan varios pushes
  seguidos, solo sobrevive el último).
- `sleep 30` antes de disparar el hook (debounce — Vercel Hobby a veces
  descartaba el segundo trigger consecutivo).
- `curl POST` al Deploy Hook de Vercel que dispara build de production.

Ahora cada `git push origin main` → deploy automático en ~30s + build.
Cero "Promote to Production" manual.

#### Plataformas Organización y Defensa (COMPLETADO)

Antes: stubs con solo galería de casos. Ahora con academia +
herramientas interactivas:
- **Organización**: 5 clases (estructura legal, costo real empleado,
  organigrama, manual de funciones, plan técnico), calculadora de
  planilla con aportes patronales 16.71% + provisión aguinaldo 8.33%,
  **constructor de organigrama jerárquico en vivo**, layout con sidebar
  5 secciones.
- **Defensa**: 4 clases (anatomía tribunal, cómo responder cuando no
  sabes, defender metodología, comunicación no verbal), **mini-simulacro
  que toma pregunta aleatoria del banco CASOS_DEFENSA → textarea →
  revela respuesta modelo + qué evalúa + trampa**, layout con sidebar 4
  secciones.
- Ambos agregados al catálogo `platforms.ts` con emoji, color, bloques.
- **Resultado: los 6 módulos educativos tienen plataforma completa**
  (resumen + clases + casos + herramientas). Ya no hay stubs.

#### Resumen ejecutivo de la sesión 11

- **30 casos bolivianos** pre-resueltos navegables.
- **12 botones Tutor IA** distribuidos en 5 módulos.
- **4 calculadoras reactivas** + 4 demos.
- **Simulador de eventos** disponible en `/projects/[id]/simulador-eventos`
  con contexto del proyecto real.
- **Documento web** que reemplaza LaTeX para el alumno + 10 universidades
  con normas específicas.
- **Plataformas Organización y Defensa** completas con academia.
- **Auto-deploy a Vercel** vía GitHub Action.
- 30+ archivos nuevos en `src/lib/`, 12+ páginas UI nuevas, 5+ páginas
  modificadas.
- Cero archivos del sistema existente borrados; aditivo puro.
- Cero migraciones SQL nuevas; todo usa los endpoints/tablas existentes.

#### Pendientes ABIERTOS al cierre de sesión 11

- **Supabase real conectado en producción** (hoy in-memory en varios módulos).
- **Webhook real de activación de pagos** (Tigo / Stripe / QR).
- **Imágenes del estudiante en el ZIP de Overleaf** (Opción B en CLAUDE.md).
- **CI básico** (hoy <1% test coverage).
- **Sprint 5: videos cortos por concepto** (no se hizo, requiere grabación).
- Pulido futuro del simulador de eventos: integrar eventos generados
  por IA en runtime (hoy banco estático de 15).

---

### 2026-06-09 (sesión 10) — Wave 4 docente: rúbrica + calificación + calendario

**Contexto:** sesión 9 cerró el pricing y el voseo. Quedaba pendiente
desde sesión 6 cerrar el ciclo del panel docente: el docente podía
vincular alumnos (Wave 1), ver sus proyectos (Wave 2) y dejarle
observaciones (Wave 3), pero NO calificarlos formalmente ni asignar
fechas tope. Sin eso, el panel docente era un visor, no una herramienta
de evaluación. El usuario confirmó "Los 3, los 3" para los 3 escenarios
de uso (alumno-only, docente propio, y vender a otros docentes), así
que esta wave debía cubrir los tres usos sin duplicar.

**Commits de esta sesión (rama `claude/tender-keller-G855A`):**
- `023b2bf` — Pieza 1/2: backend (SQL + tipos + libs + 8 endpoints)
- `388db8e` — Pieza 2/2: UI completa (5 páginas + atajos)

#### Pieza 1 — Backend (commit `023b2bf`)

**SQL nuevo (`migrations-docente/004_wave4_rubrica_calificacion_calendario.sql`):**
- `docente_rubricas`: id UUID + docente_id TEXT + nombre + descripción +
  criterios JSONB + escala_max (CHECK IN 7/10/20/100) + nota_aprueba +
  default_actual + archivada + timestamps.
  - **UNIQUE INDEX parcial** `uq_doc_rub_default` que garantiza que solo
    UNA rúbrica por docente puede tener `default_actual=TRUE`.
- `docente_calificaciones`: id + vinculo_id (FK cascade) + docente_id +
  alumno_id + rubrica_id (FK restrict, para no perder histórico) +
  modulo (CHECK 9 valores) + proyecto_id + proyecto_titulo +
  notas_por_criterio JSONB + promedio_ponderado NUMERIC(5,2) +
  comentario_general + estado (borrador/publicada) + publicada_en +
  timestamps. **CONSTRAINT UNIQUE** por (docente_id, alumno_id, modulo,
  proyecto_id, rubrica_id) → permite recalificar el mismo entregable
  vía UPSERT.
- `docente_entregas`: id + docente_id + vinculo_id NULLABLE (NULL = para
  todos los alumnos) + titulo + descripcion + modulo_sugerido +
  fecha_tope + estado (programada/vencida/cumplida/cancelada) +
  prioridad + timestamps.
- Triggers `docente_touch_actualizado()` en las 3 tablas para refrescar
  `actualizada_en` en cada UPDATE.

**Tipos (`src/types/docente-wave4.ts`):**
- Interfaces: `Rubrica`, `CriterioRubrica`, `Calificacion`,
  `NotaPorCriterio`, `Entrega`. Unions: `EscalaCalificacion`,
  `ModuloCalificable`, `EstadoCalificacion`, `EstadoEntrega`,
  `PrioridadEntrega`.
- **Helpers puros sin deps** (reutilizables en cliente y servidor):
  - `calcularPromedioPonderado(criterios, notas)` → number | null.
    Implementa `sum(nota_i * peso_pct_i) / sum(peso_pct_i con nota)`.
  - `sumaDePesos(criterios)` → number, para validar UI "100%".
  - `nuevoCriterioId()` → string local (no FK), vive en el JSONB.
  - `convertirEscala(valor, desde, hasta)` → number proporcional.

**Endpoints (8 nuevos):**
- `GET/POST /api/docente/rubricas` — lista no archivadas, crea. POST
  valida suma de pesos === 100, escala IN (7,10,20,100), nombre 1-200
  chars, desmarca la default anterior si la nueva es default.
- `PATCH/DELETE /api/docente/rubricas/[id]` — actualización selectiva
  con whitelist; DELETE archiva (no borra) para preservar calificaciones
  que la usan.
- `GET/POST /api/docente/calificaciones` — GET acepta filtros
  vinculo_id, alumno_id, modulo, estado. POST hace UPSERT con
  `onConflict: docente_id,alumno_id,modulo,proyecto_id,rubrica_id`,
  valida ownership de vínculo + rúbrica, calcula promedio_ponderado
  en backend.
- `PATCH/DELETE /api/docente/calificaciones/[id]` — cambiar estado
  (borrador↔publicada con timestamp `publicada_en`), comentario_general,
  o eliminar.
- `GET/POST /api/docente/entregas` — vinculo_id=null = global para
  todos los alumnos del docente.
- `PATCH/DELETE /api/docente/entregas/[id]` — modificar título,
  descripción, fecha_tope, estado, prioridad.
- `GET /api/alumno/calificaciones` — devuelve solo las publicadas del
  alumno logueado. Enriquece con docente_nombre (vía `idea_perfiles`)
  y la rúbrica completa para que el cliente pueda renderizar el detalle
  por criterio con su peso.
- `GET /api/alumno/entregas` — devuelve entregas asignadas a sus
  vínculos + entregas globales (vinculo_id IS NULL) de docentes a los
  que está vinculado. Auto-marca como 'vencida' las programadas con
  fecha pasada (fire-and-forget update; reflejado en el output sin
  esperar la confirmación de DB).

#### Pieza 2 — UI (commit `388db8e`)

**5 páginas nuevas:**

- `src/app/docente/rubricas/page.tsx` — CRUD del docente:
  - Form con N criterios ponderados, validación de "suma=100%" en
    vivo con badge dinámico, botón "Distribuir parejo" que reparte
    100 entre todos los criterios (con resto en los primeros).
  - Pre-llenado con 4 criterios típicos académicos (claridad,
    profundidad, aplicación, originalidad) para arranque rápido.
  - Soporta cambio de escala (al cambiar, recalcula nota mínima
    aprobación default: 4/6/11/51 para 7/10/20/100).
  - Listado muestra badge "Por defecto" + chips con cada criterio
    y su peso.

- `src/app/docente/calendario/page.tsx` — fechas tope agrupadas en
  bloques: **vencidas (rosa)**, **próximas (azul)**, **historial
  collapsed**. Form distingue "para todos" vs "un alumno específico"
  (dropdown con vinculados). Cada item permite marcar cumplida,
  cancelar o eliminar. Calcula "Faltan X días" / "Venció hace X días"
  en vivo.

- `src/app/docente/alumno/[id]/calificar/page.tsx` — aplicar rúbrica:
  - Pre-llena con la rúbrica default + los proyectos existentes del
    alumno como chips clickeables.
  - **Soporta deep-link** `?modulo=X&proyecto=Y&titulo=Z` para que
    desde `/docente/alumno/[id]` se pueda saltar directo con contexto.
  - Sliders + inputs numéricos por criterio (step 0.5 si escala=7),
    comentario por criterio, comentario general.
  - **Promedio ponderado calculado en cliente** vía
    `calcularPromedioPonderado` para feedback instantáneo. Indica
    visualmente Aprueba/Reprueba comparando contra `nota_aprueba`.
  - **UPSERT en pre-llenado:** si ya existe calificación para
    (módulo, proyecto, rúbrica), la carga al elegirla; al guardar
    sobreescribe.
  - Acciones separadas: "Guardar borrador" (alumno NO ve) vs
    "Publicar al alumno" (alumno ve).
  - Historial inline con editar/publicar/eliminar.

- `src/app/mis-calificaciones/page.tsx` — vista del alumno:
  - Header con 3 stats: total / aprobadas / promedio general.
  - Lista colapsable. Expand muestra comentario general en card
    violeta + detalle por criterio con barra de progreso roja/verde,
    nota, peso y comentario individual.

- `src/app/mis-entregas/page.tsx` — vista del alumno:
  - Cuatro bloques por urgencia: vencidas, esta semana (≤7 días),
    próximas (>7 días), historial collapsed.
  - Tarjetas distinguen "Para todos" vs "Solo para ti", muestran
    prioridad y módulo sugerido.

**Atajos de navegación agregados:**
- `/docente`: cards "Mis rúbricas" y "Calendario de entregas" bajo el
  header; botón verde "Calificar →" en cada alumno listado.
- `/dashboard`: links "Mis calificaciones" y "Mis entregas" en el
  header (mismo estilo violeta que "Mis observaciones").

**Verificación de calidad:**
- Type-check limpio en los 12 archivos nuevos (sin contar deuda
  preexistente de tests sin @types/jest).
- Voseo: cero coincidencias en los 5 archivos UI nuevos vía el regex
  bloqueante de CLAUDE.md. Imperativos usados: "elige", "pon", "crea",
  "guarda" — todos tuteo neutro.
- Empty states: las 3 pantallas del alumno (sin calificaciones,
  sin entregas, sin docente) llevan a `/unirse-docente`.

**Cómo cubre los 3 escenarios del usuario:**
1. **Alumno-only (alumno paga, docente externo lo evalúa):** el alumno
   ve `/mis-calificaciones` y `/mis-entregas` con lo que su docente
   externo publica.
2. **Docente propio (Ronald usa sus propios cursos):** arma rúbrica
   en `/docente/rubricas`, fija calendario en `/docente/calendario`,
   califica en `/docente/alumno/[id]/calificar`.
3. **Vender a otros docentes:** el panel completo
   `/docente/{rubricas,calendario,alumno/[id]/calificar}` es el
   producto que se ofrece como upsell.

**Decisión de diseño clave:** las rúbricas son **soft-delete** (archivar
en lugar de borrar) porque las calificaciones tienen FK con `ON DELETE
RESTRICT` hacia rúbricas. Si se permitiera borrado duro, las notas
históricas perderían el contexto del criterio aplicado.

**Pendiente para Wave 5 (no se hizo):**
- Exportar reporte agregado por alumno en PDF.
- Grupos / cohortes para asignar entregas a un subconjunto de alumnos.
- Calendario en formato grilla mensual (hoy es lista).
- Comparativa entre alumnos del mismo docente (estadísticas).
- Notificaciones push/email cuando se publica una calificación.

---

### 2026-06-08 (sesión 9) — Pricing reconciliado + voseo eliminado + REGLA bloqueante

**Contexto:** después del cierre de la auditoría 360° en sesión 7,
el usuario priorizó:
1. Cerrar el bug comercial que perdía ventas (pricing disconnect).
2. Eliminar el voseo argentino residual en Finanzas que estaba
   bloqueando calidad del SaaS según CLAUDE.md.
3. Convertir la regla anti-voseo en **regla bloqueante explícita** en
   CLAUDE.md (auto-verificación obligatoria antes de commit).

**Commits de esta sesión:**
- `3e18ea7` — Reconciliación pricing landing ↔ API (6 SKUs unificados)
- *(este commit)* — Sweep de voseo en Finanzas + regla reforzada

### Pieza 1 — Reconciliación pricing (commit `3e18ea7`)

**Bug detectado:** la landing ofrecía 6 SKUs comerciales (mono-básico
Bs 150 / plus 300 / premium 500 + pg-básico 350 / plus 600 / premium 950),
pero el endpoint `/api/payments` solo conocía 2 ("estandar"=150, "pro"=300).
Cualquier click en "Plus Bs 300" o "Premium Bs 500/950" se silenciaba
en runtime → el alumno terminaba pagando Bs 150 sin enterarse.

**Refactorización modular:**

Nuevo archivo `src/lib/pago/catalogo.ts` como **única fuente de verdad**.
Define los 6 SKUs con slug inmutable + precio + headline + features +
activo. Helpers exportados:
- `planPorSlug(slug)` → PlanCatalogo | null
- `slugEsValido(slug)` → boolean
- `precioDeSlug(slug)` → number
- `planesPorFamilia()` → { monografia, proyecto_grado }
- `migrarSlugLegacy(slug)` → mapea "estandar"→"mono-basico", "pro"→"mono-plus"
- `descripcionAdmin(slug)` → "Nombre — Bs N" para el admin
- `slugAUserPlan(slug)` → "estandar"|"pro"|"elite" para feature gating

**Consumidores actualizados:**
- `/api/payments` valida slug contra el catálogo (400 con lista de slugs
  válidos si no existe).
- `/api/admin/payments` mapea slug → UserPlan al aprobar pagos.
- `PricingSection` construye los 2 productos (Monografía + PG) en runtime
  desde el catálogo unificado — agregar un SKU al catálogo se refleja
  automáticamente en la landing.
- `/pago` lee el slug de la URL, lo valida y muestra el selector con
  los 6 SKUs agrupados por familia, con el seleccionado de la URL
  preseleccionado. Botones, mensajes y montos finales ahora usan el
  precio real del SKU.
- `persistence.ts` cambió `plan: "estandar" | "pro"` a `plan: PlanSlug`
  (string) para que el catálogo crezca sin migrar BD/tipo. Pagos
  históricos con "estandar"/"pro" siguen siendo legibles vía
  `migrarSlugLegacy()`.

**Verificación end-to-end:** click "Elijo el Plus" en landing → URL
`/login?plan=mono-plus` → tras login `/pago?plan=mono-plus` → card
"Monografía Plus" seleccionada con precio Bs. 300 y botón
"Solicitar activación — Bs. 300".

### Pieza 2 — Voseo eliminado de Finanzas

Sweep ejecutado en `src/components/finanzas` + `src/lib/finanzas` +
prompts de `src/lib/prompts` que tenían imperativos voseo, además de
los mensajes de error en `/api/projects/*`:
- `dashboard-docente.tsx`: "Podés cambiar / dejá / empezás" → tuteo
- `galeria-ejemplos.tsx`: "No tenés cursos / Andá / creá" → tuteo
- `simular-proyecto.tsx`: "no tenés / querés" → tuteo
- `BotonInstalarApp.tsx`: "Bajá y tocá" → tuteo
- `LanzadorEventos.tsx`: "si querés que" → tuteo
- `ModalRevisionMasiva.tsx`: 4 strings (Decidí, revisá, reintentá, podés cerrar) → tuteo
- `DetalleEntregaPasoAPaso.tsx`: "Acá podés ver" → tuteo
- `Paso9Financiamiento.tsx`: "esperás Bs 15.000" → tuteo
- `aiProvider.ts`: "intentá / contactá / Configurá" → tuteo
- `route-options/route.ts`: "intentá / Intentá" → tuteo
- `analyze-style/route.ts`: "intentá / Intentá" → tuteo
- `generate-phase/route.ts`: "intentá / Intentá" → tuteo
- `finalize/route.ts`: "intentá / Intentá" → tuteo
- `pdf/route.ts` (2): "instalá / configurá" → tuteo
- `cap0-idea-negocio.ts`: "Hacé un check" → tuteo
- `podio-supabase.ts`: "si sos estudiante" → "si eres estudiante"

**Verificación:** grep masivo de 50+ patrones de voseo sobre
`src/components` y `src/app` devuelve cero matches.

### Pieza 3 — REGLA BLOQUEANTE en CLAUDE.md

Reescrita la sección "REGLA DE COPY" en CLAUDE.md con:
- Marca explícita **BLOQUEANTE** (no es opcional).
- Lista COMPLETA de verbos voseo (presente + imperativos) con sus
  equivalentes tuteo. ~50 verbos cubriendo el 95% de los casos típicos.
- Lista de expresiones rioplatenses prohibidas ("posta", "che",
  "macanudo", etc.).
- **Excepción única:** los prompts en `src/lib/prompts/*` SÍ pueden
  mencionar las palabras prohibidas cuando se le instruye a la IA a
  NO usarlas (las reglas anti-voseo dirigidas al modelo).
- **Auto-verificación obligatoria antes de commit:** regex pegable para
  buscar voseo en `src/app` y `src/components`. Si el grep encuentra
  algo, NO hacer commit.
- Historial de commits que han hecho sweeps (sesiones 5, 6, 9) para
  evidencia.

Esta regla es leída automáticamente por cualquier IA que abra el
proyecto. Aplicada como pre-commit mental obligatorio.

### Pendientes que siguen sin cerrar (orden de impacto)

🚨 Comercial urgente:
- ⬜ **Panel docente Wave 4**: rúbrica + calificación + calendario.
  Sin esto, no se le puede cobrar Bs 300/mes a docentes. El usuario
  pidió explicación antes de construir: hecha en chat antes de
  empezar la sesión 9.
- ⬜ **Pago automático**: Tigo/QR/Stripe webhook. Requiere
  credenciales del usuario.

🛡️ Seguridad (de la auditoría):
- ⬜ Endpoints legacy `/api/monografias|citas|documentos|compilar` sin auth.
- ⬜ Rate limiting global en endpoints de IA.
- ⬜ Sanitizar `error.message` de DB en respuestas.

⚙️ Técnico:
- ⬜ `workspace/page.tsx` monolito 4605 LOC.
- ⬜ `dbListAllProyectos()` con `select("*")` JSONB.
- ⬜ 9 deps en package.json sin usar.
- ⬜ <1% test coverage, sin CI.

---


### 2026-06-08 (sesión 8) — Módulo Identidad Visual + cierre de fixes acumulados

**Contexto:** el usuario pidió "agrega TODO lo que falta" en respuesta
a la auditoría 360°. Imposible en una sesión (~30 features grandes),
así que se priorizó el hueco más crítico señalado por el agente de
producto: **identidad visual de marca** (logos, paleta, tipografía,
mockups). Es el diferenciador comercial más fuerte y crítico para PG
Pre-Fact, Mejora Org, Artefacto y Trabajo Dirigido.

**Commits de esta sesión:**
- `490bbd2` — Identidad: libs + tipos + SQL
- `5d42fe4` — Identidad: API routes (8 endpoints)
- `38b7436` — Identidad: UI completa (6 pantallas)
- `214ed5c` — Fixes acumulados: WhatsApp env, WidgetMaestro, Mercados reporte, obs huérfanas

### Módulo Identidad Visual — arquitectura modular

Vive como sub-herramienta de Marketing (1:1 con plan_id). Tiene su
propio set de archivos por carpeta para que cada sub-herramienta se
pueda iterar/extender sin tocar las otras:

```
src/lib/identidad/
├── paleta.ts        ← Algoritmos de teoría del color (HSL + esquemas)
├── tipografia.ts    ← Catálogo curado de 10 combinaciones Google Fonts
├── logo.ts          ← Orquestador multi-proveedor de IA generativa
├── mockup.ts        ← 6 tipos de mockups en SVG inline (cero IA)
└── manual.ts        ← Exportador Markdown del manual de marca

src/app/api/identidad/[planId]/
├── route.ts                ← GET/POST/PATCH del registro
├── paleta/route.ts         ← POST genera paleta sin IA
├── tipografia/route.ts     ← GET recomienda + POST guarda
├── logo/route.ts           ← POST genera con IA, PATCH elige principal
├── mockups/route.ts        ← POST genera set completo sin IA
└── manual/route.ts         ← GET descarga .md

src/app/marketing/(app)/planes/[id]/identidad/
├── page.tsx           ← Hub con progreso 0/6 → 6/6
├── brief/             ← Captura del brief de marca (9 campos)
├── paleta/            ← Color picker + esquema + preview WCAG
├── tipografia/        ← Top 3 recomendaciones + catálogo
├── logo/              ← Generación IA + mockups
└── manual/            ← Vista previa + descarga
```

### Decisiones técnicas clave

- **Paleta sin IA**: 5 esquemas matemáticos (monocromática, análoga,
  complementaria, triada, tetrada) basados en rotaciones HSL. Mapa de
  15 sectores → seed sugerido + razón. Helper `contrasteWCAG()` para
  validar legibilidad. Cero costo en tokens.

- **Tipografía sin IA**: catálogo curado de 10 combinaciones Google
  Fonts probadas, cada una con tags de personalidad (moderna, clásica,
  elegante, amigable, académica, industrial, artesanal, neutral). El
  motor `inferirPersonalidadesDesdePalabras()` lee el brief y matchea
  top 3. Si el alumno no le gusta, ver catálogo completo.

- **Logo CON IA — orquestador multi-proveedor**: el código soporta 4
  proveedores (OpenAI DALL-E 3, Gemini Imagen 3, Replicate Flux Pro,
  placeholder SVG). Cada uno se activa solo si tiene su env var
  configurada. Sin ninguna key, devuelve placeholder SVG decoroso
  (círculo con inicial) para que el flujo sea navegable en demos.
  El `construirPromptLogo()` arma el prompt desde brief + paleta +
  concepto extra del alumno → cero prompt injection, output
  consistente. AbortSignal.timeout(50s) en todas las llamadas.

- **Tope de logos por plan**: Estándar 3, Pro 10, Elite ilimitado.
  Si alguien hace 3 generaciones en Estándar, devuelve 402 con mensaje
  de upsell. Cada generación cuesta $0.04-0.10 USD según modelo.

- **Mockups sin IA**: 6 SVGs inline procedurales: tarjeta de
  presentación, post Instagram 1:1, empaque cuadrado, polo, taza,
  banner web horizontal. Aplican la paleta + nombre. Datos URI. Cero
  costo. Si el usuario quiere actualizar tras cambiar paleta o nombre,
  regenera todo de un click.

- **Manual exportable**: compilado en Markdown con todas las
  decisiones + las imágenes de paleta (vía servicio singlecolorimage.com)
  + logo + mockups. Listo para que el alumno haga Ctrl+P y guarde PDF.

### Persistencia

- Migración `migrations-identidad/001_estructura_base.sql` con tabla
  `identidad_visuales` (1 fila por plan_id, UNIQUE). Trigger
  auto-actualiza `actualizado_en`. ON DELETE CASCADE desde
  `marketing_planes` para evitar huérfanos.
- Pendiente ejecutar la migración en Supabase para activar el módulo
  en producción.

### Fixes acumulados de la auditoría (commit `214ed5c`)

- `NEXT_PUBLIC_WHATSAPP_VENTAS` env var para el CTA modular en /pago
  (antes "59100000000" hardcodeado).
- WidgetMaestro agregado al header del Generador (faltaba; los otros 6
  módulos sí lo tenían).
- Reporte de Mercados ahora tiene botones Copiar e Imprimir / PDF
  (estaba inconsistente con los otros 5 reportes).
- Migración `migrations-docente/003_observaciones_proyecto_borrado.sql`
  agrega columna `proyecto_eliminado` boolean en `docente_observaciones`
  para marcar huérfanas (no se puede tener FK porque el proyecto_id
  apunta a una de 7 tablas distintas según módulo).

### Cómo aporta el módulo a cada modalidad académica

| Modalidad | Aplica Identidad Visual | Por qué |
|---|---|---|
| Tesis | ❌ | Es investigación, no creación de marca |
| Monografía | ❌ | Es documental, no creación |
| PG Pre-Factibilidad | ✅ | Crítico — el plan de negocio nuevo necesita marca |
| PG Mejora Organizacional | △ | Solo si la mejora incluye rebranding |
| PG Diseño de Artefacto | ✅ | Necesita branding del producto |
| Trabajo Dirigido | △ | Solo si la propuesta es comercial |
| Exploración Investigativa | ❌ | Es investigación |
| Examen de Grado | ❌ | Es preparación oral |
| Artículo investigación | ❌ | Es paper académico |
| Taller de Simulación | ❌ | Es informe descriptivo |

### Pendientes de la auditoría que SIGUEN sin cerrar

Los más críticos comerciales:
- 🚨 **Pricing disconnect** landing vs API (6 SKUs vs 2). Bloquea ventas.
- 🚨 **Panel docente Wave 4**: rúbrica, calificación numérica, calendario
  de entregas. Sin esto, no se le cobra a docentes.
- 🚨 **Migraciones SQL** sin runtime check. Si se despliega sin correrlas,
  los módulos fallan en silencio.
- 🚨 **Voseo en Finanzas** (15 archivos del simuladorPRO migrado).
  Bloqueador de calidad según CLAUDE.md.
- 🚨 **Pago automático** (Tigo / QR / Stripe webhook). Sigue manual.

Seguridad/perf restantes:
- Endpoints legacy `/api/monografias|citas|documentos|compilar` sin auth.
- Rate limiting global en endpoints de IA (riesgo de costo).
- Sanitizar `error.message` de DB en respuestas.
- workspace/page.tsx monolito 4605 LOC.
- 9 deps en package.json sin usar.
- <1% test coverage, sin CI.

---


### 2026-06-08 (sesión 7) — Auditoría 360° del SaaS + cierre de 14 CRÍTICOS

**Contexto:** el usuario pidió auditoría completa post-deploy de la sesión
6. Se ejecutaron 4 agentes Explore en paralelo (seguridad, bugs
funcionales, performance/calidad, producto/negocio). Resultado: 4
informes exhaustivos con 50+ hallazgos. Esta sesión cierra los más
graves explotables o que rompen UX.

**Commits de esta tanda:**
- `7915eed` — middleware + 10 endpoints admin sin guard
- `cd94121` — IMPORTANTES de seguridad (demo, generate, exports, health, codigos)
- `cc5d554` — bugs funcionales críticos (modalidad casing, print CSS, consentimiento)
- `5f5df94` — timeouts IA + Suspense + CLAUDE.md actualizado

**Cerrados (CRÍTICOS):**

*Seguridad:*
- ⚠️ **Middleware NO se cargaba** porque vivía en `src/proxy.ts` (Next 16
  marca `proxy.ts` como el nuevo convencional pero el manifest estaba
  vacío). Renombrado a `src/middleware.ts` con export `middleware`.
  Verificado en `.next/server/middleware-manifest.json` que ahora SÍ
  carga. Esto restablece los headers de seguridad (CSP,
  X-Frame-Options, Referrer-Policy, etc.) que estaban inertes en
  producción.
- ⚠️ **10 endpoints `/api/admin/*` sin `requireAdmin()`** — cualquier
  anónimo en producción podía: convertirse en admin (`usuarios`),
  borrar proyectos (`seed-cleanup`), gastar tokens IA del SaaS
  (`test-prompt-unifranz`), modificar lista de universidades, leer
  historial completo de cualquier usuario, listar monografías,
  estadísticas internas, descargar .tex de cualquier monografía,
  crear/borrar tipos de proyecto y fases, modificar preguntas de
  calibración. Los 10 endpoints ahora hacen `await requireAdmin()`.
  En los que tienen GET legítimamente público (universities,
  project-types, calibration-questions porque el wizard
  `/projects/new` los lee), solo se gateda POST/PUT/DELETE.
- ⚠️ **`/api/auth/demo` en producción** — un visitante podía POST
  `{ role: "docente" }` y obtener una sesión docente válida. Ahora
  se bloquea en prod salvo que el body incluya un token que coincida
  con `DEMO_INVITE_TOKEN` env var.
- ⚠️ **`/api/generate`** aceptaba `userId` y `plan` arbitrarios del
  body/query. Atacante podía agotar créditos ajenos o leer créditos
  de otro user. Ahora `requireAuth()` + `user.id`/`user.plan` de la
  sesión. PUT (configurar API keys de IA) ahora `requireAdmin()`.
- ⚠️ **`/api/export/{pdf,latex}`** sin auth. El primero renderiza HTML
  arbitrario con Chrome headless en server — vector de SSRF y DoS.
  Ahora `requireAuth()`.
- ⚠️ **`/api/health?detail=full`** exponía email + role de TODOS los
  usuarios y metadata de TODOS los proyectos. PII + mapa para atacar.
  El health básico (solo flags y conteos) sigue público; `detail=full`
  ahora degrada silenciosamente a básico si no es admin.
- ⚠️ **`/api/docente/codigos` usaba `Math.random`** (predecible).
  Atacante con tiempo podía enumerar códigos y vincularse a docentes
  ajenos. Ahora usa `crypto.randomInt` (CSPRNG).
- ⚠️ **`/api/auth/callback/google` logueaba email completo** en cada
  login → PII en Vercel logs + permite enumerar admins. Ahora loguea
  solo el dominio (activable con `LOG_AUTH_DEBUG=1`).

*Bugs funcionales:*
- ⚠️ **Casing de modalidades en `/generador`** rompía el flujo. Las
  etiquetas decían "Proyecto de grado" minúscula pero las claves de
  `FLUJO_POR_MODALIDAD` son titlecase. Un maestro con esas modalidades
  caía al FLUJO_DEFAULT (los 8 módulos) en vez del flujo específico.
  Ahora coinciden + comentario explicando por qué.
- ⚠️ **CSS de impresión `header[role="banner"]` no matcheaba nada**.
  El PDF salía con sidebar y nav arriba. Ahora se oculta `<header>` y
  `<nav>` raíz sin importar el role. Además override de `h-screen
  w-screen flex-col` que recortaba contenido.
- ⚠️ **Consentimiento del alumno era 100% cosmético**. El toggle
  "permitir ver contenido a mi docente" se guardaba pero NINGÚN
  endpoint lo leía. La promesa de UX en `/docente/alumno/[id]` era
  falsa. Ahora `/api/docente/alumnos/[id]/proyectos` lee la fila de
  `docente_consentimientos` y devuelve `consentimiento_ver_contenido`.
  La UI muestra el aviso correcto (banda verde si está activo, mismo
  aviso original si no).

*Performance crítica:*
- ⚠️ **Llamadas IA sin timeout** — si un proveedor se colgaba 90s,
  Vercel mataba la función a 60s y la cascada NUNCA pasaba al
  siguiente. Ahora `AbortSignal.timeout(50_000)` en callOpenAICompatible,
  callAnthropic, callGemini; 55_000 en callGeminiGrounding (es más
  lenta por la Google Search).
- ⚠️ **`useSearchParams` sin `<Suspense>` en 6 páginas** — Next 16
  strict puede romper el build. Envueltas las 6 páginas destino del
  pre-llenado (mercados, estrategia, marketing, organizacion, defensa,
  generador) en un wrapper Suspense.

*Documentación:*
- ⚠️ **CLAUDE.md decía cascada `Groq → Anthropic → OpenAI`** pero el
  código (línea 47-52 de `aiProvider.ts`) tiene `Anthropic → Gemini
  → OpenAI → Groq` desde sesión 6. Cualquier IA leyendo CLAUDE.md
  tomaba decisiones obsoletas. Actualizado el stack + tabla en
  "Cascada de IA" + librerías clave + nota sobre `AbortSignal.timeout`.

**Mejoras adicionales:**
- `alumno_universidad` en docente_alumno_vinculos ya no es null
  hardcoded — se consulta el perfil del alumno en los 6 módulos
  educativos buscando el primer que tenga universidad llena.
- `/api/alumno/observaciones` ahora devuelve `docente_nombre` para
  cada observación (snapshot del perfil idea_perfiles como mejor
  aproximación). La UI `/mis-observaciones` muestra "De {docente}".

**Hallazgos PENDIENTES (no cerrados esta sesión):**

*Seguridad — IMPORTANTES restantes:*
- ⬜ Endpoints legacy sin auth: `/api/monografias[/...]`, `/api/citas`,
  `/api/documentos`, `/api/compilar/[id]`. Son legacy de Scribe;
  conviene `requireAuth` + ownership check o deprecation.
- ⬜ Rate limiting global en endpoints de IA (sin Redis es difícil
  hacerlo bien, pero quemar tokens es un costo real).
- ⬜ Sanitizar `detail: error.message` en respuestas de DB — revela
  schema interno (nombres de tablas, columnas, constraints).
- ⬜ Prompt injection: input del usuario va directo al prompt sin
  sanitización en `qa`, `route-options`, `edit-phase-section`,
  `ai/asistir`. Mitigación: longitud máxima + anti-prompt-injection
  rules en system prompt.

*Funcionales restantes:*
- ⬜ Observaciones huérfanas si proyecto se borra (proyecto_id sin FK).
  Cascade delete o flag "proyecto eliminado".
- ⬜ WidgetMaestro falta en Finanzas y Generador.
- ⬜ Mercados reporte: SIN botón "Imprimir" ni "Copiar" (inconsistente
  con los otros 5 reportes).
- ⬜ Idea reporte usa `tipo_trabajo` propio, los otros 5 reportes usan
  `maestro?.modalidad`. Estudiantes de Tesis sin maestro activo verán
  el flujo default (incluye Marketing/Organización) en vez del suyo.
- ⬜ Listas vacías por error silencioso: `.catch(() => {})` en 30
  archivos disfraza errores como empty state.
- ⬜ Doble-submit en `/unirse-docente` muestra "Ya estás vinculado"
  como error en vez de éxito.

*Performance restantes:*
- ⬜ `workspace/page.tsx`: 4.605 LOC, 43 useState, 396 inline styles —
  monolito que rompe React.memo y causa re-renders cascada.
- ⬜ `dbListAllProyectos()` con `select("*")` JSONB completo: dashboard
  admin descarga 10-50 MB.
- ⬜ Fs.writeFileSync sincrono en `persistence.ts` bloquea event loop.
- ⬜ 89/138 páginas son `'use client'` sin necesidad.
- ⬜ Zero `React.memo`, zero `focus-visible:` (a11y de teclado nula).

*Producto/negocio:*
- 🚨 **DISCONNECT pricing**: landing ofrece 6 SKUs (Bs 150-950), API
  solo conoce `estandar` (150) y `pro` (300). CTAs `?plan=mono-plus`
  caen silenciosamente en `estandar` → cliente paga Bs 150 esperando
  Bs 300. ARREGLAR antes de cualquier campaña.
- 🚨 **WhatsApp placeholder `591-00000000`** sigue hardcodeado en
  `pago/page.tsx:227`. Mover a `NEXT_PUBLIC_WHATSAPP_VENTAS` env var.
- ⬜ Persona confusa: landing habla a apurados, dashboard a formativos,
  panel docente a docentes. Decidir QUÉ producto se vende primero.
- ⬜ Generador Conectado invisible en landing — el diferenciador más
  valioso ("tus datos reales, no inventados") está enterrado.
- ⬜ Panel docente Wave 4: rúbrica + calificación + calendario de
  entregas. Sin esto, no se le puede cobrar a un docente.
- ⬜ Voseo argentino residual en Finanzas (15+ archivos del simuladorPRO
  migrado). Bloqueante de calidad según CLAUDE.md.
- ⬜ Migraciones SQL pendientes sin runtime check: si despliegas a
  Vercel sin correrlas, el panel docente falla en silencio.
- ⬜ Sin cancelación/freeze de plan Pro — si alguien deja de pagar,
  sigue con acceso indefinido.
- ⬜ Calidad de código: 261 lint problems (138 `any`, 35 unused,
  varios react-hooks). No bloqueante, deuda crónica.
- ⬜ 9 dependencias en package.json sin usar: `@google/generative-ai`,
  `@hookform/resolvers`, `react-hook-form`, `@radix-ui/react-slot`,
  `class-variance-authority`, `katex`, `@types/katex`,
  `react-intersection-observer`, `xlsx`. ~30 MB de node_modules.
- ⬜ Tests: 1.348 LOC de tests sobre 137.060 LOC de src → <1%. Sin
  `npm test`, sin CI.

---


### 2026-06-08 (sesión 6 — tanda autónoma final) — Wave 3 docente + 5 mejoras transversales

El usuario pidió "haz todo sin intervención" después de Wave 2. Procesé
una tanda grande: yo encabecé Wave 3 + PDF directo + pago modular + 2
arreglos críticos en mercados, y dispatché 3 agentes en paralelo para
voseo + accesibilidad + errores silenciados en los 7 módulos.

**Lo que YO hice:**

- **Wave 3 panel docente** (`7a0e0e4`): observaciones del docente sobre
  proyectos específicos del alumno + consentimiento del alumno para que
  el docente vea contenido. Migración `migrations-docente/002_observaciones_consentimiento.sql`
  (tablas `docente_observaciones` y `docente_consentimientos`). 5
  endpoints nuevos (`/api/docente/observaciones[/[id]]`, `/api/alumno/
  observaciones[/[id]]`, `/api/alumno/consentimientos`). UI en
  `/docente/alumno/[id]` (botón "Observar" inline por proyecto +
  listado por estado) y página nueva `/mis-observaciones` para el
  alumno. Toggle en `/unirse-docente` con explicación clara del
  consentimiento. Link "Mis observaciones" en dashboard. **Por defecto
  el consentimiento es OFF** — el docente solo ve metadatos hasta que
  el alumno active explícitamente.
- **PDF directo desde Generador Conectado + reglas de print globales**
  (`a015847`): renombro "Imprimir" → "Imprimir / PDF" con tooltip que
  explica usar "Guardar como PDF" del navegador. `globals.css` ahora
  tiene `@media print` global que oculta sidebars/headers/navs y
  formatea el documento para PDF en todas las páginas.
- **Manejo de errores en mercados/encuesta y mercados/muestreo**
  (`a015847`): los `.catch(() => {})` silenciosos del load y los saves
  sin manejo de error pasaron a mostrar mensajes claros (`role="alert"`).
- **Pago: bloque "¿solo quieres un módulo?"** (`0813c21`): card violeta
  con los 7 módulos y CTA "Coordinar precio por WhatsApp →". No se
  inventan precios — el pricing modular queda manual hasta que el
  dueño decida. Número WhatsApp es placeholder (591-00000000).

**Lo que los 3 agentes hicieron en paralelo:**

- **Agente 1 — Voseo en prompts del backend** (`1704645`): 20 archivos
  en `src/lib/prompts/` con voseo reemplazado por tuteo boliviano.
  Los prompts antes contradecían su propia regla "NO uses voseo" al
  estar escritos en voseo ellos mismos. PRESERVADAS las líneas que
  listan las palabras prohibidas como ejemplo. Reportó 15 archivos
  FUERA de prompts con voseo (mayoría en `/finanzas/*` y mocks/seeds)
  — quedan como pendiente.
- **Agente 2 — Accesibilidad / aria-labels** (`76e7e9f` admin +
  `9a24d4a` módulos): 38 archivos modificados. 64 aria-label nuevos
  (selects, botones-icon de eliminar/archivar/cerrar, inputs de busca),
  32 aria-hidden en iconos decorativos, 3 htmlFor/id para conectar
  labels con inputs. Cobertura: todo el panel admin + headers/listados
  de los 7 módulos educativos. **No cobertura todavía:** Finanzas (otro
  trabajo aparte por su arquitectura distinta).
- **Agente 3 — Errores silenciados en formularios** (`9a24d4a` mezclado
  con accesibilidad + `9405416` + `f637a31`): patrón ya aplicado en
  encuesta/muestreo replicado a las herramientas de saves de idea,
  estrategia (PESTEL, Porter, MPC, FODA, BCG, Ansoff, MCPE), marketing
  (buyer persona, presupuesto, calendario), organización (organigrama,
  RRHH, legal, branding) y defensa (preguntas). Antes: `if (res.ok)
  setGuardado()` else NADA — alumno creía que guardó pero perdía el
  trabajo. Ahora: setErrorGuardar con el mensaje real + render con
  `role="alert"`.

### 2026-06-08 (sesión 6 — continuación) — Panel docente Wave 2

Cierra el ciclo "docente → ve qué tiene mi alumno" sin meterse al
contenido privado todavía. Commit `161a5b4`.

- Nuevo endpoint `GET /api/docente/alumnos/[id]/proyectos`. `[id]` es
  el vinculo_id (no alumno_id) para que la validación de propiedad sea
  una sola query. Si el vínculo no es del docente logueado, 404 sin
  filtrar diferencia con "no existe". Después hace 7 queries en
  paralelo a las tablas de cada módulo filtradas por estudiante_id;
  cada query es independiente con try/catch que devuelve [] si la
  tabla no existe — así una migración faltante no tira abajo la
  respuesta entera. Devuelve metadatos del alumno + arreglo por módulo
  + flag sin_finanzas=true.

- Nueva página `/docente/alumno/[id]`: avatar/nombre/email + contador,
  nota privada del docente editable inline (PATCH al vínculo), 7
  cards por módulo (orden del flujo) con los proyectos del alumno
  (título, estado, fecha) o el placeholder "Aún no tiene proyectos
  en este módulo". Aviso ámbar sobre Finanzas omitido.

- `/docente`: el botón "Ver proyectos · pronto" se vuelve un Link
  real al detalle.

Decisión clave sobre privacidad:
- Wave 2 SOLO muestra metadatos (titulo, estado, fecha). NO accede al
  contenido del Lean Canvas, ni a la encuesta, ni al organigrama, etc.
  Eso queda para Wave 3 con consentimiento explícito del alumno
  (toggle "Permitir que mi docente vea el contenido").

Finanzas pendiente:
- El bridge entre `auth.users` UUID (Finanzas viene del simuladorPRO)
  y el JWT propio de webapp TEXT requiere una decisión arquitectural:
  o syncar IDs al alta del perfil de Finanzas, o agregar un campo
  `webapp_user_id TEXT` en finanzas_perfiles y migrar los existentes.
  Por ahora se muestra el aviso ámbar.

Wave 3 (próxima): observaciones del docente sobre un reporte específico
del alumno + consentimiento del alumno para ver contenido. Wave 4:
rúbrica de calificación y calendario de entregas.

### 2026-06-08 (sesión 6 — adición) — Panel docente Wave 1 (decisión "C", híbrido)

El usuario eligió la opción C del panel docente: "Mis alumnos" híbrido
sin grupos/cursos — cada alumno vinculado directo al docente,
independiente de si es estudiante de cátedra o tesista 1-a-1.

Wave 1 construida (commit `59d7ade`):

- Nueva migración SQL `migrations-docente/001_vinculacion.sql` —
  tablas `docente_codigos` y `docente_alumno_vinculos`. **El usuario
  debe ejecutarla en Supabase para que funcione en prod.**
- Endpoints `/api/docente/{codigos[/codigo], vincular, alumnos[/id]}` +
  `/api/alumno/docentes`. Gating por role: solo `docente` o `admin`
  pueden gestionar códigos y ver la lista de alumnos.
- Página `/docente`: hub del docente (genera códigos con etiqueta
  opcional, los copia, los revoca; lista alumnos con avatar/email).
  Botón "Ver proyectos" deshabilitado con tooltip "pronto" — eso
  es la Wave 2.
- Página `/unirse-docente`: cualquier usuario logueado pega el
  código que le dio su docente y queda vinculado.
- Dashboard: botón "Mis alumnos" (solo docente/admin) y link
  "¿Código de docente?" para todos.

Decisiones tomadas:
- **Sin grupos/cursos en esta wave** (decisión del usuario "C"). Si
  después se necesitan, va una tabla `docente_grupos` encima.
- **Códigos en alfabeto seguro** (sin 0/O/1/I/L). 31^6 ≈ 887 millones
  de combinaciones, suficiente; en colisión reintenta hasta 5 veces.
- **Snapshot del nombre/email del alumno** en el vínculo, para listar
  sin joinear con tablas de otros módulos. Si el alumno cambia el
  nombre después, el snapshot queda viejo (aceptable, se puede
  actualizar en Wave 3).
- **El alumno NO puede desvincularse desde la UI todavía** — solo
  el docente puede archivar (Wave 2 le da al alumno su propio
  botón).

Wave 2 pendiente (próxima): clic en alumno → detalle con sus proyectos
agregados por módulo (idea + mercados + estrategia + marketing + org +
finanzas + defensa + maestro) y avance % de cada uno. Wave 3:
observaciones del docente sobre un reporte del alumno. Wave 4: rúbrica
de calificación y calendario de entregas.

### 2026-06-08 (sesión 6) — Pre-fill premium + auditoría completa + cleanup

**Lo que se construyó:**
- **Pre-llenado de título Idea→Mercados para plan Pro** (`e28f9ec`): cuando un
  estudiante Pro/Elite aprieta "Siguiente paso" en el reporte de Idea, el
  formulario "Nueva investigación" de Mercados ya llega con el título cargado;
  para Estándar llega vacío (alumnos de cátedra del dueño aprenden a mano).
  Nuevo hook `src/lib/auth/usePlan.ts` con cache 60s + helper `esPremium()`;
  roles admin/docente cuentan como Pro por defecto para que el dueño pueda
  evaluar la experiencia premium sin cambiar de cuenta. `SiguienteModulo`
  acepta prop `tituloContexto` y lo arrastra vía `?titulo=&desde=` solo si
  premium. Mercados lee los params con `useSearchParams` y muestra hint
  violeta "Título tomado desde tu Idea". **Pendiente:** replicar a los otros
  5 saltos del flujo (Mercados→Estrategia, etc.).
- **Hook `useMaestroActivo` ampliado** para exponer `modalidad`. Ya lo usaban
  los 5 reportes de la sesión 5; ahora también la evaluación final de
  Finanzas.

**Auditoría completa (2 agentes Explore en paralelo):**
- Mapa exhaustivo de todas las rutas y features por módulo.
- Informe de puntos a mejorar con severidades.

**Fixes de auditoría (`cfdd141`):**
- **voseo en READMEs de paquetes LaTeX**: los ZIPs que descarga el estudiante
  traían "Instalá / Abrí / Compilá / Entrá / Seleccioná / Descomentá / Restaurá /
  Subilas". Reemplazado por tuteo neutro. Archivos: `paquete-latex-pg/route.ts`,
  `paquete-latex/route.ts`.
- **CVE: `ADMIN_JWT_SECRET` con fallback hardcodeado**: `/api/admin/auth` y
  `/api/admin/auth/check` caían en `"laboratorio-academico-super-secret-key-2024"`
  si la env faltaba — cualquiera con acceso al repo podía firmar sesiones admin
  en un entorno mal configurado. Ahora ambos devuelven 503 con mensaje claro si
  la variable no está o tiene <16 caracteres.
- **"Datos abiertos" del sidebar Mercados oculto**: la página solo mostraba
  "En construcción 🚧" y confundía como feature roto. Sacada del nav lateral
  y del hub. Ruta `/mercados/datos` sigue existiendo para no romper bookmarks.
- **CLAUDE.md limpio de módulos fantasma**: el archivo listaba Axiom, Lumen,
  Mentor, Núcleo y Laboratorio como "módulos del producto" — ninguno existe en
  `src/app/`. Cuando una nueva sesión los leía y trataba de usarlos, se rompía.
  Reemplazado por la tabla real: 3 generadores (Scribe, PG, Conectado) + 7
  educativos + infraestructura. Se agregaron las rutas `/api/{módulo}/*` y
  `/api/maestro/*` que faltaban; se eliminó la sección `/api/axiom/*`.

**Finanzas cerrado con SiguienteModulo (`d92851a`):**
- El simulador financiero terminaba sin decir a dónde ir; los otros 6 módulos
  sí lo hacen. Agregado al final de `evaluacion-final.tsx`. Lee modalidad
  del maestro activo; sin maestro cae al default (Defensa al final).

### 2026-06-07 (sesión 5) — Flujo por modalidad + limpieza de voseo

- **Mapa de flujo por modalidad** (`6071246`): cierra el bucle "¿y ahora
  qué?" que dejaba al estudiante sin saber a qué módulo pasar después del
  reporte. Nuevo `src/lib/flujos/por-modalidad.ts` con el orden de módulos
  recomendado para las 8 modalidades académicas (Proyecto de Grado usa los
  8 módulos; Tesis solo mercados/estrategia/defensa/generador; Monografía
  mercados/defensa/generador; etc.).
- **Componentes compartidos `ProgresoFlujo` y `SiguienteModulo`**: el
  primero pinta el breadcrumb "Idea ✓ › Mercados (aquí) › Estrategia → ..."
  arriba de cada reporte; el segundo pinta el botón "¿Y ahora? → ir a X"
  al final. Si el módulo abierto no aplica a la modalidad (ej. Tesis
  abriendo Marketing), muestra warning ámbar.
- **Integrados en los 6 reportes + Generador**: idea, mercados, estrategia,
  marketing, organizacion, defensa, generador. idea lee `tipo_trabajo` del
  propio proyecto; los demás leen `modalidad` del Proyecto Maestro activo
  vía `useMaestroActivo` (hook ampliado para exponer `modalidad` además
  de id/titulo).
- **Limpieza de voseo argentino** (`bc0ce8c`): CLAUDE.md marca el voseo
  como bloqueante de calidad (mercado boliviano). Eliminado de 7 strings
  user-facing en `FaseAcciones`, `Cap0TituloSelector`, `Cap3eModoSelector`,
  `Cap4gConfigSelector`, `workspace-pg`, `projects/new` y el mensaje de
  error de `analizar-observacion`. Pendiente revisar prompts del backend
  (14 archivos con voseo en `src/lib/prompts/`) en otra tanda — esos
  instruyen a la IA, no se ven directo.

### Pendientes activos (post-sesión 6)

**✅ Cerrados en esta sesión:**
- ✅ Pre-llenado replicado a los 6 saltos del flujo (`a124c85`).
- ✅ Panel docente Wave 1: vinculación con código (`59d7ade`).
- ✅ Panel docente Wave 2: detalle del alumno con proyectos (`161a5b4`).
- ✅ Panel docente Wave 3: observaciones por proyecto + consentimiento
  (`7a0e0e4`).
- ✅ PDF directo desde Generador via window.print() + reglas globales
  de print en `globals.css` (`a015847`).
- ✅ Pricing modular en `/pago`: bloque "¿solo quieres un módulo?"
  con CTA WhatsApp (`0813c21`).
- ✅ Voseo en prompts del backend: 20 archivos limpiados (`1704645`).
- ✅ Accesibilidad: 64 aria-label + 32 aria-hidden + 3 htmlFor en
  panel admin y headers de módulos (`76e7e9f`, `9a24d4a`).
- ✅ Errores silenciados en saves de herramientas (idea, mercados,
  estrategia, marketing, organización, defensa) — ahora muestran
  mensaje claro con `role="alert"` (`9a24d4a`, `9405416`, `f637a31`).
- ✅ Datos abiertos oculto del sidebar mercados (`cfdd141`).
- ✅ ADMIN_JWT_SECRET sin fallback hardcoded (`cfdd141`).
- ✅ Voseo en READMEs de paquetes LaTeX (`cfdd141`).
- ✅ CLAUDE.md limpio de módulos fantasma (Axiom/Lumen/Mentor/Núcleo).
- ✅ Finanzas con SiguienteModulo (`d92851a`).

**⬜ Pendientes que requieren tu input (NO se pueden hacer sin ti):**
- ⬜ **Pago automático**: necesita credenciales reales de Tigo Money,
  pasarela QR boliviana o Stripe. Mientras tanto, manual: comprobante
  → admin aprueba. El bloque modular ya está en `/pago` con CTA
  WhatsApp pero el número es placeholder (`591-00000000`); cambiarlo
  antes de deploy comercial.
- ⬜ **Pricing modular**: definir cuánto cuesta cada módulo individual
  (decisión comercial). La UI ya invita a coordinar por WhatsApp.
- ⬜ **Bridge Finanzas ↔ JWT webapp**: decisión arquitectural (sync
  IDs vs agregar `webapp_user_id TEXT` en `finanzas_perfiles`). Sin
  eso, Finanzas no aparece en el panel docente.

**⬜ Pendientes técnicos (puedo seguir cuando me digas):**
- ⬜ **Panel docente Wave 4**: rúbrica de calificación + calendario
  de entregas. Sería el remate del panel para uso docente real.
- ⬜ **Voseo en 15 archivos fuera de prompts** (reportados por el
  agente): `/finanzas/*`, mocks/seeds, algunos componentes
  compartidos. La mayoría en finanzas que es código migrado y
  requiere más cuidado.
- ⬜ **Reactivar `/mercados/datos`** cuando se construya la integración
  real con INE / datos.gob.bo / Google Trends.
- ⬜ **Console.log cleanup**: solo 11 archivos, todos server-side
  (API routes + lib). Bajo riesgo en producción (Next.js los
  minifica), pero conviene una pasada pre-deploy.
- ⬜ **Accesibilidad en Finanzas**: el módulo migrado no se tocó.
  Requiere otra pasada.

### 2026-06-07 (sesión 4) — Descubribilidad, IA en herramientas y formatos oficiales
- **Hub `/modulos` + bloque "Tu camino" en `/dashboard`** (`b0cb21c`): el dashboard
  solo mostraba el Generador Autónomo; ahora hay 2 caminos (rápido / formativo)
  y un hub que muestra los 7 módulos + Generador Conectado.
- **SugerirIA legible** (`ce7512f`): el `<pre>` monoespaciado se veía horrible;
  ahora tipografía sans + interlineado, con etiquetas en negrita.
- **Botón IA en herramientas de Idea** (`cb4c97b`): propuesta-valor, validación,
  scorecard. **Bug clave corregido** (`8b1533c`): el contexto del proyecto se
  pasaba en `placeholder` (¡solo UI, nunca llegaba al backend!) → la IA generaba
  cosas ajenas a la idea. Nueva prop `contexto` que SÍ llega al servicio de IA.
  Al aplicar AGREGA (no reemplaza) con dedup; el ✕ de cada ítem quita.
- **"Define tu idea" con modalidad + universidad** (`f2425f3`): al crear una idea
  se elige el tipo de trabajo (monografía, tesis, proyecto de grado, exploración
  investigativa, taller de simulación, etc.) y universidad, ambos con "Otra"
  libre. Catálogo en `src/lib/idea/catalogos.ts`. Migración **002_modalidad.sql**
  (columnas `tipo_trabajo`, `universidad` en `idea_proyectos`) — el usuario debe
  ejecutarla.
- **Estructuras oficiales en el Generador** (`d8e5e64`): el documento ya no usa
  una plantilla genérica inventada. `src/lib/formatos/estructuras.ts` define las
  estructuras reales: **UNIFRANZ x5** (de la guía 2017, ya codificadas en
  `proyectoGrado/unifranz`), **UMSS Posgrado FCE x3** (monografía, tesis,
  exploración investigativa — de los PDFs oficiales 2024 que subió el usuario) y
  **3 genéricos**. El documento muestra un selector con ⭐ recomendado según la
  universidad/modalidad del maestro. NOTA: el usuario aportó 8 guías oficiales
  reales; las modalidades/estructuras YA NO se inventan.

### 2026-06-07 (sesión 3) — Auditoría profunda + 21 fixes en 4 tandas
Audité todo el código nuevo. Encontré 23 issues; arreglé 21 (3 skips conscientes).

**Tanda 1 — 4 CRÍTICOS (`c451279`):**
1. **CVE divulgación cruzada en `vincular`**: validar que `ref_id` pertenece
   al user antes de crear el vínculo. Sin esto, atacante podía leer proyectos
   ajenos vía contexto IA.
2. **LaTeX rompía en ZIP** con caracteres especiales en títulos (`%`, `&`, `$`).
   Ahora usa `escaparLatex` completo.
3. **Simulacro guardaba preguntas no evaluadas como 0/10**. Tipo cambiado a
   `number | null`; reporte distingue "sin evaluar".
4. **Upserts de progreso degradaban privilegios de super-admin**. Helper
   compartido `asegurarPerfilModulo()` respeta `isAdmin` + `ignoreDuplicates`.

**Tanda 2 — 5 GRAVES (`4f4a10f`):**
5. `window.location.href` → `router.push` en **24 archivos**. Ya no recarga
   página entera al "Guardar y volver".
6. Las 5 llamadas directas a `/api/ai/asistir` ahora usan `useMaestroActivo`.
   Antes, algunos generadores usaban contexto cruzado y otros no.
7. `generarVacias` del Generador: progreso visible ("Generando 3/10…"),
   cuenta éxitos/fallos, surface al final qué falló.
8. `generarSeccion` lanza errores en vez de retornar `null` mudo.
9. Tribunal IA acepta `Puntaje`, `Calificación`, `Nota`, comas, markdown bold;
   con fallback a número solo; avisa si no pudo extraer.

**Tanda 3 — 8 IMPORTANTES (`1e78563`):**
10. `/api/maestro` GET ya no devuelve `documento` JSONB (pesado).
11. PATCH de documento limita a 2 MB.
12. `useMaestroActivo` con cache compartido (TTL 60s + dedup).
13. AbortController en generaciones del Generador con botón Cancelar.
14. Calendario marketing usa `id` estable en cada publicación; ya no usa
    `indexOf` por referencia.
15. Skip: el widget retorna `null` durante hydration → no hay flash.
16. Detección de universidad acepta `U.M.S.S.`, `Univ. Católica Boliviana`…
17. mes/año de carátula usa `actualizado_en` del maestro, no NOW.

**Tanda 4 — 3 MENORES (`95fb270`):**
18. `Math.round` en métricas marketing (antes `floor` sub-estimaba ~22%).
19. README del ZIP es checklist concreto, no narrativo.
22. Filename del `.md` consistente con `.tex`/`.zip` (sin acentos raros).
Skips conscientes: 20 (print CSS textareas), 21 (paginación >50 maestros),
23 (no es bug).

### 2026-06-07 (sesión 2) — Cerrados los dos pendientes opcionales
- **Auto-conexión widget → SugerirIA** (`e3dab91`): hook `useMaestroActivo()`
  en `src/lib/maestro/useMaestroActivo.ts` lee el id del widget (localStorage)
  y consulta `/api/maestro/[id]` para el título. `SugerirIA` lo usa de fallback
  si no recibe `maestroId` por prop. Muestra badge "Usando contexto de: [proy]".
  Efecto: TODAS las herramientas pasan a contexto cruzado sin cambios en cada
  módulo.
- **ZIP Overleaf por universidad** (`ae06927`): `armarZipOverleaf()` en
  `src/lib/generador/zip.ts` detecta UMSS/UCB/UCATEC/UNIFRANZ por nombre y
  reusa los preámbulos+carátulas oficiales existentes. Endpoint
  `/api/maestro/[id]/zip` y botón "ZIP Overleaf" en el documento. Sin match,
  fallback al article genérico de `documentoALatex`.
- **Estado:** el laboratorio queda funcionalmente terminado para el caso de
  uso académico estándar. Solo queda el SQL pendiente del usuario en Supabase.

### 2026-06-07 — CIERRE DE SESIÓN (sesión enorme, todo el ecosistema)
Logrado hoy, en orden:
- **Estrategia:** completadas BCG, Ansoff, PEYEA, Reporte y **MCPE/QSPM** →
  laboratorio 13/13.
- **Marketing:** módulo nuevo (FASE 0 + 5 herramientas).
- **Organización:** módulo nuevo (FASE 0 + 6 herramientas).
- **Idea:** módulo nuevo completo (FASE 0 + 5 herramientas).
- **Defensa:** módulo nuevo completo (FASE 0 + 3 herramientas, simulacro con IA).
- **Generador Conectado** `/generador`: Wave 1 (vincular módulos + contexto +
  borrador), Wave 2 (documento capítulo por capítulo + persistencia + export
  md), Wave 3 (export LaTeX/Overleaf).
- **Academias** de Estrategia, Marketing, Organización, Idea y Defensa →
  **los 7 módulos quedan COMPLETOS** (academia + laboratorio).
- **Widget "Trabajando en"** integrado en los 6 headers de módulos.
- Bitácora auditada y al día. Todo commiteado y pusheado a `main`.

**Cómo retomar:** ver §0 (arriba). Lo único que bloquea es ejecutar 4
migraciones SQL pendientes (idea, defensa, organización, maestro/002).

**Próximos pasos sugeridos (opcionales):** export PDF/ZIP Overleaf con
carátula por universidad; conectar el maestro activo del widget a SugerirIA.

### 2026-06-07 — Widget "Trabajando en" → conexión transversal completa
- Componente reusable **`WidgetMaestro`** (neutro) + helper `lib/maestro/activo.ts`
  (maestro activo en localStorage, con evento `maestro-activo-cambio`).
- Integrado en el header de los 6 módulos con RootLayout estándar (Estrategia,
  Marketing, Organización, Idea, Defensa, Mercados): muestra/elige el proyecto
  maestro activo y enlaza al Generador. Push 41be81f.
- Con esto, el ecosistema queda cosido por ambos lados: desde el Generador
  vinculas módulos; desde cada módulo ves y eliges tu proyecto y saltas al
  Generador.
- **Estado del proyecto:** 7 módulos COMPLETOS + Generador conectado (Waves 1-3)
  + widget transversal. Pendientes solo opcionales (PDF/ZIP Overleaf con
  carátula; pasar el maestro activo a las llamadas SugerirIA de cada módulo).

### 2026-06-07 — Academias de Marketing, Organización, Idea y Defensa → TODOS los módulos COMPLETOS
- Replicado el patrón de academia (validado en Estrategia) en los 4 módulos
  restantes, cada uno con su color y su `*_progreso_clases` (ya existían, sin
  migración): **Marketing** (5 clases, rose), **Organización** (5 clases con
  aportes patronales y legal boliviano, emerald), **Idea** (5 clases, ámbar)
  y **Defensa** (4 clases, indigo). Cada clase: teoría + ejemplo boliviano + quiz de 3.
- **HITO: los 7 módulos educativos están COMPLETOS** (academia + laboratorio):
  Idea, Mercados, Estrategia, Marketing, Organización, Finanzas y Defensa.
  Push aa85e60.
- Estructura de cada academia: `lib/<modulo>/clases-data.ts`, lista
  `/<modulo>/academia`, clase `[slug]` (teoría→quiz→fin con progreso), API
  `/api/<modulo>/progreso`.
- **Pendientes globales restantes:** widget "Trabajando en: [proyecto maestro]"
  en los headers; mejoras opcionales del Generador (ZIP Overleaf con carátula,
  PDF directo).

### 2026-06-07 — Estrategia: Academia (FASE 1) → módulo COMPLETO
- Construida la **Academia de Estrategia** (6 clases con teoría + ejemplo
  boliviano + quiz de 3), replicando el patrón de Mercados con tokens violeta:
  `clases-data.ts`, lista `/estrategia/academia`, clase `[slug]` (teoría→quiz→
  fin con progreso), API `/api/estrategia/progreso` (tabla ya existía). Push 06d1aef.
- **Estrategia pasa a ✅ COMPLETO** (academia + laboratorio), como Mercados.
- Patrón de Academia ya validado y reutilizable para los otros módulos
  (Marketing, Organización, Idea, Defensa): copiar el patrón con su color y
  su `*_progreso_clases`.

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
