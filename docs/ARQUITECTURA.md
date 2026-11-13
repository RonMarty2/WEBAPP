# Laboratorio Académico PRO — Mapa del proyecto

> Fuente de verdad corta. La idea simple manda sobre las bitácoras técnicas.
> Actualizado: 2026-10-30. Verificado contra el código, no contra documentos viejos.

## La idea (una sola cosa)

WEBAPP **genera el documento que le piden al estudiante para titularse**
(monografía, tesis, proyecto de grado, plan de negocio) siguiendo el manual de su universidad.

El estudiante elige entre dos caminos:

1. **Automático** — la IA arma todo; el estudiante revisa y aprueba.
2. **Guiado** — construye paso a paso con los cerebros: Idea, Mercados, Estrategia,
   Marketing, Organización, Finanzas, Defensa.

Uso docente: el docente usa un cerebro suelto para enseñar. Es el mismo cerebro, no otro producto.

> "Trae el documento que te piden para titularte y tu guía. Hazlo rápido o paso a paso.
> Te llevas tu documento real, listo para defender."

## Cómo está armado (legos con pegamento)

```
Estudiante ──► tipo de documento + universidad (+ su guía si no está cargada)
                         │
        ┌────────────────┴────────────────┐
   Camino AUTOMÁTICO                 Camino GUIADO
   (fases generadas por IA)          (cerebros → reportes)
        │                                  │
        └──────────────┬───────────────────┘
                       ▼
        PIEZAS (fases)  ←── PEGAMENTO ──►  UNIVERSIDAD
        Cap.0 … Cap.5       hilo conductor    plantilla, normas,
        PESTEL, Porter…     memoria académica validadores, guía
                       ▼
        ARMADO: LaTeX · Word · PDF · ZIP Overleaf
```

| Parte | Dónde vive | Dueño |
|---|---|---|
| Fases por tipo de documento | `src/lib/{scribePhases,projectTypePhases}.ts`, `proyectoGrado/fases.ts` | `expediente` |
| Pegamento de contexto | `src/lib/hiloConductor.ts`, `academicProject.mjs`, `maestro/*` | `expediente` |
| Ficha de universidad | `universityTemplates.ts`, `data.ts`, `*Validators.ts`, `proyectoGrado/unifranz/*` | `universidades` |
| Prompts e IA | `src/lib/prompts/**`, `aiProvider.ts`, `modelRouter.ts`, `ai/guardian.ts` | `redactor-ia` |
| Documento final | `latexMonografia.ts`, `latex/*`, `documento-web/*`, `export/*` | `armador-documento` |
| Cerebros / docente | `src/app/{idea,mercados,estrategia,marketing,organizacion,finanzas,defensa}` | `cerebros` |
| Cierre y control | `npm run verify`, `scripts/check-*.mjs` | `revisor` |

Coordinador: el comando `/sprint <tarea>` reparte el trabajo entre los dueños.

## Decisiones tomadas con el dueño (30-oct-2026)

- **Un especialista por cada modalidad de cada universidad**, todos con la misma plantilla base.
  Lanzamiento con UCB, UMSS y UNIFRANZ. Cobro y uso docente quedan para después del núcleo.
- **Sin guía oficial, no se ofrece la universidad.** El plan B es que el estudiante suba su guía.
- **Línea de inspectores** (quien escribe no es quien revisa): cumplimiento de la universidad,
  datos y fuentes, coherencia, proporción, metodología y voz humana. Se construyen en ese orden.
- **Los requisitos de cada guía viven en `src/lib/requisitos/`**, cada uno con su página; los
  exactos los comprueba código y los de contenido, la IA.
- **Resumen UNIFRANZ:** máximo 250 palabras. **Índice:** con número de página.
- **UCB:** su guía no fija los capítulos de cada modalidad (los define la carrera). La plataforma
  pide al estudiante el esquema de su carrera antes de generar. Solo 6 de sus 7 modalidades
  producen documento (Examen de Grado, Excelencia e Internado no).
- **Abstract en inglés (UCB):** obligatorio (el reglamento lo exige aunque el esquema de la guía lo muestre opcional).

## Huecos conocidos (orden de prioridad)

1. **Dos pegamentos, tres motores.** El hilo conductor solo lo usa `/api/projects/generate-phase`;
   el Generador Conectado usa `maestro/contexto.ts`. Scribe, Proyecto de Grado y Generador Conectado
   tienen cada uno su manejo de fases. Falta UN expediente por proyecto para los dos caminos.
2. **Universidades sin ficha única ni guía.** Solo UMSS, UCB y UNIFRANZ tienen guía oficial cargada.
   El resto improvisa. Regla propuesta: sin guía oficial, no se ofrece.
3. **Plan B "sube tu guía"** (Documento Adaptativo): solo diseñado, sin conectar.
4. **Cifras inventadas.** Citas protegidas; datos de mercado y estadísticas no tienen fuente real.
5. **El estudiante no sabe qué camino elegir.** Falta explicarlo en la interfaz.
6. **Versiones.** Regenerar un capítulo puede perder la versión anterior.
7. **Lanzamiento.** Supabase real, Google OAuth de producción, deploy y pagos automáticos pendientes.
8. **Uso docente** sin definición propia de qué ve el docente.

## Estado técnico medido (2026-10-30)

- 625 archivos TS/TSX, 148 rutas API, 148 páginas.
- Archivos que concentran el riesgo: `projects/[id]/workspace/page.tsx` (~4.650 líneas),
  `generate-phase/route.ts` (~1.130), `prompts/scribe/compilar-latex.ts` (~1.400).
- Revisiones automáticas nuevas: `npm run check:copy` (voseo), `npm run check:seguridad`
  (prompts solo en servidor, rutas admin con rol). Ambas pasan.
- Pruebas: `tests/academicProject.test.mjs` no corre (importa con el alias `@/`, que Node no entiende).
  Hay 3 pruebas más en `src/lib`, sin ejecutor configurado.
- `node_modules` no está instalado en esta carpeta, así que `tsc`, `lint` y `build` no se pudieron correr hoy.

## Ruta de trabajo

1. **Base** — instalar dependencias, medir `tsc`/`lint`/`build`, hacer que las pruebas corran.
2. **Universidades** — ficha única y regla "sin guía, no se ofrece".
3. **Expediente** — unificar el pegamento y el catálogo de fases.
4. **Armado** — pruebas de LaTeX/APA con los casos que ya fallaron.
5. **Partir los archivos gigantes** con las pruebas ya puestas.
6. **Lanzamiento** — Supabase, OAuth, Vercel, pagos.
