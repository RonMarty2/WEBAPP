# ⚠️ PENDIENTE: Variante "Reducido" del Cap. II–V

> **Lee esto ANTES de modificar `src/lib/prompts/scribe/cap2.ts`, `cap3.ts`, `cap4.ts` o `cap5.ts`.**

## Estado actual (2026-05-12)

| Capítulo | Variante Clásico | Variante Reducido |
|----------|------------------|-------------------|
| Cap. I | ✅ Implementado | ✅ Implementado |
| Cap. II | ✅ Implementado | ❌ FALTA |
| Cap. III | ✅ Implementado | ❌ FALTA |
| Cap. IV | ✅ Implementado | ❌ FALTA |
| Cap. V | ✅ Implementado | ❌ FALTA |

## ¿Qué se hizo y qué no?

El usuario implementó la variante "reducido" del **Capítulo I** para UMSS porque su diplomado le pidió una estructura distinta (sin hipótesis ni operacionalización, con justificación social/económica).

Los Cap. II–V **todavía no tienen variante reducida**. Si un estudiante elige "reducido" en el flujo de creación, su Cap. I se generará con la estructura nueva, pero sus Cap. II–V usarán el prompt clásico — que probablemente asuma cosas que no existen en su Cap. I (hipótesis, variables, sistematización).

## Riesgo conocido

Si el estudiante elige `cap1_variante_id = "reducido"`:

- **Cap. II** puede pedir desarrollar teóricamente variables que no fueron operacionalizadas en Cap. I.
- **Cap. III** puede pedir reproducir la operacionalización del Cap. I que no existe.
- **Cap. V** puede intentar confirmar/refutar una hipótesis del Cap. I que no existe.

El UI en `/projects/new` muestra una nota "⚠️ Beta" al estudiante para que sepa que el resto de capítulos seguirá usando formato clásico.

## Cómo retomar este trabajo

1. **Espera a que el usuario traiga los requisitos** del Cap. II–V de su diplomado.
2. Para cada Cap. N:
   - Crear `src/lib/prompts/scribe/capN-variantes/clasico.ts` (alias del actual).
   - Crear `src/lib/prompts/scribe/capN-variantes/reducido.ts` (nueva estructura).
3. Generalizar `src/lib/cap1Variants.ts` → `src/lib/capVariants.ts` con `getPromptForPhaseVariant(phaseId, varianteId)`.
4. En `src/app/api/projects/generate-phase/route.ts`, replicar el patrón actual (que hoy solo afecta `ph-cap1`) para que afecte `ph-cap2`, `ph-cap3`, etc.
5. Quitar la nota "⚠️ Beta" del registry en `cap1Variants.ts` cuando todos los capítulos estén cubiertos.

## Archivos clave

- `src/lib/cap1Variants.ts` — registry actual
- `src/lib/prompts/scribe/cap1-variantes/` — prompts de variantes
- `src/app/api/cap1-variants/route.ts` — endpoint público (sin prompts)
- `src/app/api/projects/generate-phase/route.ts` — donde se resuelve la variante en runtime
- `src/app/projects/new/page.tsx` — UI de selección
- `~/.claude/projects/C--Users-lmigu-.../memory/pending_variante_reducida.md` — copia en memory persistente

## Decisiones del usuario (2026-05-12)

1. Variantes hardcoded, **siempre activadas** (no editables por admin).
2. Naming: **"Clásico"** y **"Reducido"** (literal).
3. Cap. II–V: **hacerlo después** cuando el usuario sepa qué le pedirán.
