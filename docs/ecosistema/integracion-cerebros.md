# Integración de Cerebros con WEBAPP
> Repositorio: `WEBAPP/docs/ecosistema/integracion-cerebros.md`
> Última actualización: 2026-06-17

---

## El principio central

Cada cerebro es un **producto independiente con usuarios reales** (clases, rankings,
simulaciones, secciones docentes) Y al mismo tiempo un **proveedor de datos** para
WEBAPP. Ambos roles coexisten sin conflicto.

Lo que conecta todo es el **Artefacto del Estudiante** (`StudentArtifact`),
definido en `C0.Cerebro_contrato/src/index.ts`.

---

## Cómo fluye la información

```
Estudiante trabaja en un cerebro (ej. simuladorPRO)
  → construye su proyecto de finanzas
  → el cerebro genera un StudentArtifact con sus resultados

WEBAPP lee ese StudentArtifact
  → lo incorpora al Proyecto Maestro
  → lo pasa como contexto a la IA al generar el documento
  → lo muestra en el panel lateral de otros cerebros

Otro cerebro (ej. MIE - mercados) ve ese contexto
  → "Este estudiante proyecta ventas de Bs. 80.000/año"
  → su análisis de mercado valida si el mercado lo soporta
```

---

## Lo que cada cerebro debe implementar (mínimo)

Dos endpoints GET. No rompen nada existente — se agregan sin tocar
la funcionalidad actual del cerebro:

```
GET /api/artifact
  Headers: Authorization: Bearer <google_jwt>
  → devuelve StudentArtifact[] (todos los proyectos del estudiante autenticado)

GET /api/artifact/:projectId
  Headers: Authorization: Bearer <google_jwt>
  → devuelve StudentArtifact de ese proyecto
```

**El cerebro puede agregar features libremente** (rankings, visualizaciones,
clases, IA, exportaciones) sin tocar estos endpoints. Solo el campo `content`
dentro del artefacto crece cuando hay más datos que exportar.

---

## Lo que WEBAPP ya tiene y lo que hay que agregar

### Ya existe en WEBAPP ✅
- `GET /api/maestro/:id/contexto` — devuelve contexto consolidado del Proyecto Maestro
- `POST /api/maestro/:id/vincular` — vincula un módulo al Proyecto Maestro
- `GET /api/maestro/disponibles` — lista qué proyectos puede vincular el estudiante
- Widget "Trabajando en: [proyecto]" en todos los módulos
- Hook `useMaestroActivo()` para contexto automático

### Hay que agregar en WEBAPP 🔨
- `POST /api/maestro/:id/vincular-cerebro-externo`
  Recibe `{ cerebroId, cerebroProjectId, googleId }`,
  llama al endpoint del cerebro externo, guarda el artefacto en el Proyecto Maestro.

- `GET /api/maestro/:id/contexto` (ampliar el existente)
  Que además de los módulos internos de WEBAPP, incluya los artefactos
  de cerebros externos vinculados.

---

## El panel lateral en cada cerebro

Cuando el estudiante tiene un Proyecto Maestro activo, cada cerebro
muestra un panel lateral con el avance en los demás:

```
┌─────────────────────────────────────────────────┐
│ 📁 Proyecto Maestro: Cafetería La Orquídea       │
├─────────────────────────────────────────────────┤
│ ✅ Finanzas      VAN: 45k BOB · TIR: 22%         │
│ ✅ Mercados      TAM: 2.3M · Cuota obj: 0.8%     │
│ 🔄 Estrategia   trabajando aquí...               │
│ ⬜ Marketing     pendiente                        │
│ ⬜ Organización  pendiente                        │
└─────────────────────────────────────────────────┘
```

El panel llama a:
`GET /api/maestro/:maestroId/contexto?googleId=xxx` (endpoint de WEBAPP)

WEBAPP devuelve `MaestroContexto` con todos los artefactos vinculados.

---

## Flujo completo: estudiante que ya usó un cerebro y después compra WEBAPP

```
1. Estudiante ya tiene trabajo en simuladorPRO (finanzas)
   → tiene project_id en ese cerebro

2. Compra acceso a WEBAPP

3. En WEBAPP crea un Proyecto Maestro o se le sugiere crearlo

4. WEBAPP pregunta: "¿Tienes trabajo en algún cerebro que quieras vincular?"
   → muestra lista de cerebros disponibles

5. Estudiante selecciona simuladorPRO → WEBAPP lista sus proyectos
   (llama a GET /api/artifact con el google_id del estudiante)

6. Estudiante elige su proyecto → WEBAPP guarda el artefacto en el Proyecto Maestro

7. El documento académico ya tiene sus datos financieros reales
   → no datos inventados por la IA

8. Puede también crear proyectos nuevos en cualquier cerebro
   → su trabajo previo NO se pierde
```

---

## Mapeo: qué cerebro alimenta qué sección del documento

| Cerebro | feeds_sections |
|---------|---------------|
| C1 simuladorPRO | `evaluacion_financiera` |
| C2 market-intelligence-engine | `analisis_mercado` |
| C3 academic-methodology-engine | `diseno_metodologico` |
| C4 strategy-business-engine | `analisis_externo`, `analisis_interno` |
| C5 operations-feasibility-engine | `plan_operativo_tecnico` |
| C6 legal-regulatory-engine-bo | `marco_legal` |
| C7 organization-hr-engine | `plan_organizacional` |
| C8 brand-marketing-engine | `plan_marketing` |
| C9 academic-document-engine | (ensamblado final — no alimenta secciones, genera el doc) |
| C10 defense-qa-engine | `preparacion_defensa` |

---

## Orden de implementación recomendado

El criterio es: primero los que más mejoran la calidad del documento
con datos reales, empezando por los que ya tienen usuarios.

### Fase 1 — Sin tocar código de WEBAPP aún
Agregar el endpoint `/api/artifact` en cada cerebro, uno a uno,
comenzando por `simuladorPRO` (ya tiene usuarios, es el más maduro).

### Fase 2 — Conectar en WEBAPP
Implementar `POST /api/maestro/:id/vincular-cerebro-externo` y ampliar
el endpoint de contexto para incluir artefactos externos.

### Fase 3 — Panel lateral en cerebros
Agregar el componente del panel lateral en cada cerebro que consuma
`GET /api/maestro/:id/contexto` de WEBAPP.

### Orden por cerebro
1. `simuladorPRO` (C1) — ya migrado en WEBAPP, agregar endpoint externo
2. `market-intelligence-engine` (C2) — cierra la brecha de datos inventados
3. `strategy-business-engine` (C4) — 13 herramientas ya listas en el módulo
4. El resto según vayan madurando con usuarios reales

---

## Regla de compatibilidad

> Si agregas features al cerebro y el `StudentArtifact` que exportas
> sigue teniendo los mismos campos, WEBAPP nunca se rompe.
> Solo el campo `content` puede crecer — WEBAPP lo maneja como mapa
> dinámico, no campos fijos.
