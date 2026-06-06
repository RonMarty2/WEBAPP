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
- El Generador en modo conectado importa esos artefactos y los consolida.
- Resultado: documento académico con SUS datos reales, no inventados.

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
| 2 | Mercados (Investigación) | ❌ | **PRÓXIMO a construir.** Diferenciador: APIs reales Google Trends + Meta Ads + TikTok Ads + datasets Bolivia |
| 3 | Estrategia / Macroentorno | ❌ | PESTEL, Porter, MEFE/MEFI, FODA cruzada con scoring guiado |
| 4 | Marketing | ❌ | 4Ps/7Ps + presupuesto y CPL con datos reales Meta/TikTok + calendario editorial |
| 5 | Organización | ❌ | Organigrama, RRHH (aportes patronales 30.37% Bolivia), legal (NIT, Fundempresa, AFP), técnico, branding |
| 6 | **Finanzas (simuladorPRO)** | ✅ | Migrado desde repo externo `RonMarty2/simuladorPRO`. Constructor 9 pasos + simulación turno-a-turno con eventos económicos bolivianos + ranking + 26 ejemplos |
| 7 | Defensa | ❌ | Banco de preguntas por capítulo + simulador con IA evaluando respuestas |

### Módulos eliminados del ecosistema
- ❌ **Axiom (simulador de exámenes)** — el usuario decidió quitarlo del ecosistema. NO mencionarlo más como producto activo.

---

## §4 Decisiones clave (orden cronológico inverso)

### 2026-06-06
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
