# Dev Handoff Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar un sistema de bitácora por sesión dentro del repo para retomar el desarrollo entre PC y portátil sin reconstruir el contexto desde cero.

**Architecture:** La solución vive completamente en documentación del repositorio. `AGENTS.md` obliga a leer y actualizar la bitácora; `docs/dev-sessions/CURRENT.md` resume el estado actual; archivos fechados guardan el handoff detallado por sesión; una plantilla mantiene el formato consistente.

**Tech Stack:** Markdown, AGENTS.md, documentación del repositorio

---

### Task 1: Formalizar la convención en el repo

**Files:**
- Modify: `C:\Users\lmigu\Desktop\WEBAPP\AGENTS.md`
- Create: `C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions\_TEMPLATE.md`

- [ ] **Step 1: Escribir la regla de continuidad en `AGENTS.md`**

Agregar una sección que obligue a:

```md
## Development Handoff

- At the start of every development session, read `docs/dev-sessions/CURRENT.md` if it exists.
- Before claiming a development task is complete, update the current session log in `docs/dev-sessions/`.
- When the work starts a new block or a new day, create a new file named `YYYY-MM-DD-sesion-NN.md`.
- Keep `docs/dev-sessions/CURRENT.md` pointed at the latest active session and summarize the current project state there.
```

- [ ] **Step 2: Crear plantilla de sesión**

Crear `docs/dev-sessions/_TEMPLATE.md` con esta estructura:

```md
# YYYY-MM-DD - Sesion NN

## Contexto de inicio

## Que hicimos

## Decisiones tomadas

## Bugs resueltos

## Pendientes

## Riesgos / no romper

## Proximo paso recomendado
```

- [ ] **Step 3: Verificar consistencia visual de los textos**

Revisar que toda la terminología use “sesión”, “CURRENT.md” y “handoff” de manera consistente.

### Task 2: Crear el punto de entrada entre dispositivos

**Files:**
- Create: `C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions\CURRENT.md`

- [ ] **Step 1: Escribir el resumen operativo actual**

Crear `CURRENT.md` con:

```md
# Estado actual de desarrollo

## Ultima sesion
- `2026-05-06-sesion-01.md`

## Estado actual
- ...

## Enfoques o reglas vigentes
- ...

## Problemas abiertos
- ...

## Siguiente paso recomendado
- ...

## Historial reciente
- `2026-05-06-sesion-01.md`
```

- [ ] **Step 2: Incluir el contexto real del proyecto**

El resumen debe mencionar al menos:
- rediseño del admin;
- archivo vs borrado definitivo de proyectos;
- restauración desde admin;
- alertas de IA sin auto-switch;
- fallos recientes de proveedores/modelos;
- estado del flujo `/projects/new`.

- [ ] **Step 3: Confirmar que `CURRENT.md` sea suficiente como punto de arranque**

Leer el archivo completo y comprobar que un agente nuevo podría ubicarse sin leer toda la conversación previa.

### Task 3: Crear la primera sesión de handoff

**Files:**
- Create: `C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions\2026-05-06-sesion-01.md`

- [ ] **Step 1: Documentar el bloque real de trabajo**

Llenar la sesión con:

```md
## Contexto de inicio
## Que hicimos
## Decisiones tomadas
## Bugs resueltos
## Pendientes
## Riesgos / no romper
## Proximo paso recomendado
```

- [ ] **Step 2: Registrar decisiones sensibles**

Incluir explícitamente:
- no cambiar automáticamente de proveedor de IA;
- borrado del usuario = ocultar;
- admin puede restaurar;
- admin puede eliminar definitivamente;
- el handoff debe actualizarse como hábito al cierre de bloques importantes.

- [ ] **Step 3: Registrar el estado técnico más reciente**

Incluir referencias a archivos clave ya modificados, como:
- `src/app/admin/proyectos/page.tsx`
- `src/app/api/admin/proyectos/route.ts`
- `src/app/api/projects/route.ts`
- `src/app/api/projects/route-options/route.ts`
- `src/app/api/projects/select-route/route.ts`

### Task 4: Verificación final

**Files:**
- Verify: `C:\Users\lmigu\Desktop\WEBAPP\AGENTS.md`
- Verify: `C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions\CURRENT.md`
- Verify: `C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions\2026-05-06-sesion-01.md`
- Verify: `C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions\_TEMPLATE.md`

- [ ] **Step 1: Revisar que los archivos existan**

Run:

```powershell
Get-ChildItem -Path C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions -Force
```

Expected: aparecen `CURRENT.md`, `_TEMPLATE.md` y `2026-05-06-sesion-01.md`

- [ ] **Step 2: Revisar que no haya errores de formato evidentes**

Run:

```powershell
Get-Content -LiteralPath C:\Users\lmigu\Desktop\WEBAPP\AGENTS.md
Get-Content -LiteralPath C:\Users\lmigu\Desktop\WEBAPP\docs\dev-sessions\CURRENT.md
```

Expected: instrucciones legibles y consistentes con la convención aprobada

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md docs/dev-sessions docs/superpowers/specs/2026-05-06-dev-handoff-sessions-design.md docs/superpowers/plans/2026-05-06-dev-handoff-sessions.md
git commit -m "docs: add development handoff session workflow"
```
