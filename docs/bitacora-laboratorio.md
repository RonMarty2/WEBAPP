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
- ❌ Modo Conectado (cuando tengamos ≥ 3 módulos para alimentarlo)

### Módulos educativos (orden de uso por el estudiante)

| # | Módulo | Estado | Notas |
|---|---|---|---|
| 1 | Idea / Pre-validación | ❌ | Más simple, lo dejamos para casi al final |
| 2 | Mercados (Investigación) | ✅ COMPLETO | Módulo entero (FASES 0-6). Detalle abajo. |
| 3 | Estrategia / Macroentorno | 🔨 EN CONSTRUCCIÓN | 5 de ~11 herramientas listas (PESTEL, Porter, MEFE, MEFI, FODA cruzada). Faltan MPC, Cadena Valor, MIE, BCG, Ansoff, PEYEA, Reporte + Academia. Detalle abajo. |
| 4 | Marketing | ❌ | 4Ps/7Ps + presupuesto y CPL con datos reales Meta/TikTok + calendario editorial |
| 5 | Organización | ❌ | Organigrama, RRHH (aportes patronales 30.37% Bolivia), legal (NIT, Fundempresa, AFP), técnico, branding |
| 6 | **Finanzas (simuladorPRO)** | ✅ | Migrado desde repo externo `RonMarty2/simuladorPRO`. Constructor 9 pasos + simulación turno-a-turno con eventos económicos bolivianos + ranking + 26 ejemplos |
| 7 | Defensa | ❌ | Banco de preguntas por capítulo + simulador con IA evaluando respuestas |

### Progreso detallado del módulo Estrategia (`/estrategia`)
- ✅ **FASE 0** — Cimientos: identidad visual VIOLETA propia (#8b5cf6, distinta
  a Finanzas/negro y Mercados/azul), login único vía `/api/estrategia/perfil`,
  tablas SQL `estrategia_*` (matrices como JSONB), hub. Light-only.
- ✅ **Laboratorio (parcial)** — dashboard "Mis análisis" (CRUD) + vista del
  análisis con las herramientas como etapas. Herramientas LISTAS (5 de ~11):
  · PESTEL (macroentorno, plantillas bolivianas + IA)
  · 5 Fuerzas de Porter (microentorno, intensidad + IA)
  · MEFE (factores externos ponderados) — componente MatrizPonderada reusable
  · MEFI (factores internos ponderados) — mismo componente
  · FODA cruzada — pre-carga O/A desde el PESTEL + genera FO/DO/FA/DA con IA
- ⬜ **Herramientas faltantes:** MPC, Cadena de Valor, MIE, BCG, Ansoff,
  PEYEA, Reporte (consolidado + artefacto).
- ⬜ **FASE 1** — Academia: clases sobre análisis situacional.
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
