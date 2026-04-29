# ETAPA 1: CAPÍTULO I COMPLETO
## Planteamiento del Problema + Objetivos + Justificación + Alcances

## META
Generar CAPÍTULO I (secciones 1.1.1 → 1.5) conforme a guía de estilo.

## ENTRADA REQUERIDA
- `tema_seleccionado` — JSON de Etapa 0 (aprobado)
- `antecedentes_problema` — 2-3 párrafos de contexto histórico
- `literatura_relevante` — MÍNIMO 5-7 documentos con autor/año/título/método/conclusión
- `causas_raiz` — 3+ causas identificadas
- `efectos_proyectados` — 2+ efectos observables
- `situacion_controlada` — escenario deseado post-intervención
- `objetivos_especificos` — 3-4 objetivos
- `justificacion_teorica/practica/social`
- `alcance_temporal/geografico/limitaciones`
- `tipo_investigacion` — cuantitativa / cualitativa / mixta
- `tiene_hipotesis` — true/false

## ESTRUCTURA GENERADA
```
7 Párrafos Introductorios (1.5-2 páginas)
├── Pár. 1-2: Antecedentes + citas APA 7
├── Pár. 3-4: Síntesis teórica de literatura
├── Pár. 5: Síntesis causal
├── Pár. 6: Objetivo general
└── Pár. 7: Estructura capitular

Secciones 1.1 → 1.5
├── 1.1. Planteamiento y Formulación
│   ├── 1.1.1. Planteamiento (A/B/C/D)
│   └── 1.1.2. Pregunta central + 4 subpreguntas
├── 1.2. Objetivos (general + específicos)
├── 1.3. Justificación (teórica + práctica + social)
├── 1.4. Alcances y Delimitación
└── 1.5. Hipótesis (si aplica)
```

## SALIDA JSON
```json
{
  "etapa": 1,
  "status": "borrador",
  "tipo_investigacion": "...",
  "tiene_hipotesis": false,
  "teorias_identificadas": ["Teoría 1", "Teoría 2"],
  "objetivos": {
    "general": "...",
    "especificos": ["obj1", "obj2", "obj3"]
  },
  "preguntas": {
    "central": "...",
    "subpreguntas": { "diagnostica": "...", "teorica": "...", "comparativa": "...", "propositiva": "..." }
  },
  "citas_registradas": [
    {
      "autor": "Apellido, Nombre",
      "ano": 2023,
      "titulo_obra": "...",
      "fuente": "...",
      "tipo": "paper",
      "formato_apa": "...",
      "capitulo": 1
    }
  ],
  "proximo_paso": "ETAPA 2: Capítulo II"
}
```

## NOTA DE IMPLEMENTACIÓN
El system prompt real está en `src/lib/prompts/index.ts → SISTEMA_ETAPA_1`.
