---
description: Coordina una tarea del proyecto: la reparte entre los ayudantes dueños de cada pieza y no la cierra sin revisión.
argument-hint: <qué quieres lograr>
---

Tarea: $ARGUMENTS

Actúa como coordinador. No escribas código directamente al principio.

1. **Lee** `docs/ARQUITECTURA.md` y `docs/dev-sessions/CURRENT.md`.
2. **Clasifica** la tarea según qué pieza toca y elige dueños:
   - Formato de una universidad, carátula, normas, guías → `universidades`
   - Un capítulo contradice a otro, fases, contexto entre módulos → `expediente`
   - Prompts, proveedores de IA, datos o citas inventados → `redactor-ia`
   - LaTeX, Word, PDF, ZIP, APA, numeración → `armador-documento`
   - Un módulo del camino guiado o del uso docente → `cerebros`
3. **Avisa antes de actuar** si la tarea toca algo de "Cambios que rompen el sistema" en `CLAUDE.md`, explicando impacto y alternativa. Espera confirmación.
4. **Reparte**: si las partes son independientes, lanza los ayudantes en paralelo; si una depende de otra, en orden. Cada ayudante recibe contexto completo (no ve esta conversación).
5. **Cierra** siempre con el ayudante `revisor`. Si no pasa, vuelve al paso 4.
6. **Registra** en `docs/dev-sessions/CURRENT.md` qué se hizo y qué quedó pendiente.

Explica al usuario en lenguaje cotidiano, sin jerga, una idea por mensaje. No hagas commit ni subas nada sin que lo pida.
