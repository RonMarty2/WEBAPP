# ETAPA 3: CAPÍTULOS III, IV, V + BIBLIOGRAFÍA FINAL
## Vinculados con Cap. I + II aprobados

## META
Generar Capítulos III (Metodología), IV (Resultados), V (Conclusiones) y Bibliografía Final.
Asegurar coherencia TOTAL con caps. I y II.

## ENTRADA REQUERIDA
- `cap1_output` — JSON de Etapa 1 (aprobado)
- `cap2_output` — JSON de Etapa 2 (aprobado)
- `citas_totales` — Todas las citas de caps. I + II
- `fuentes_datos` — Fuentes de datos confirmadas y accesibles

## VINCULACIONES CRÍTICAS
```
Cap. I.2.1 Objetivo General → Cap. III Metodología
Cap. I.2.2 Obj. Específico 1 → Cap. IV.1 Resultado 1 → Cap. V.1 Conclusión 1
Cap. I.2.2 Obj. Específico 2 → Cap. IV.2 Resultado 2 → Cap. V.1 Conclusión 2
Cap. I.1.2 Preguntas → Cap. V deben responderse
Cap. II Teorías → Cap. IV vinculación en interpretación
```

## ESTRUCTURA GENERADA

### CAP. III — DISEÑO METODOLÓGICO
```
3.1. Enfoque metodológico (cuant/cual/mixto + justificación)
3.2. Tipo de investigación (descriptivo/explicativo/comparativo)
3.3. Métodos teóricos y empíricos
3.4. Técnicas e instrumentos (fuentes secundarias verificadas)
3.5. Fuentes de información
3.6. Población y muestra (solo si aplica)
3.7. Procesamiento y análisis (herramientas + métodos)
```

### CAP. IV — ANÁLISIS DE RESULTADOS
```
Para CADA objetivo específico:
4.X. [Objetivo reformulado]
  ├── Datos presentados (tabla/gráfico/narrativo)
  ├── Interpretación (responde pregunta asociada)
  └── Vinculación con teoría de Cap. II
```

### CAP. V — CONCLUSIONES Y RECOMENDACIONES
```
5.1. Conclusiones
  ├── 5.1.X. Por cada objetivo específico
  └── Síntesis general (hipótesis si aplica)
5.2. Recomendaciones (4-5, específicas y realizables)
```

### BIBLIOGRAFÍA FINAL
- TODAS las citas de caps. I + II + III + IV + V
- Orden alfabético por apellido
- APA 7 exacto
- SOLO citas efectivamente usadas

## VALIDACIÓN FINAL
- ✅ Cada obj. específico tiene sección en Cap. IV
- ✅ Cada obj. específico tiene conclusión en Cap. V
- ✅ Cada pregunta de Cap. I tiene respuesta en Cap. V
- ✅ Bibliografía = union de todas las citas registradas
- ✅ Sin citas fabricadas

## SALIDA JSON
```json
{
  "etapa": 3,
  "status": "borrador",
  "objetivos_cubiertos": ["obj1", "obj2"],
  "preguntas_respondidas": ["preg1", "preg2"],
  "citas_nuevas_cap3_4_5": [],
  "bibliografia_final": [
    {
      "autor": "...",
      "ano": 2023,
      "titulo_obra": "...",
      "fuente": "...",
      "tipo": "paper",
      "formato_apa": "...",
      "usado_en_capitulos": [1, 2]
    }
  ],
  "validacion_final": {
    "todos_objetivos_tienen_conclusion": true,
    "todas_citas_en_bibliografia": true,
    "coherencia_total": true
  },
  "proximo_paso": "ETAPA FINAL: Compilación LaTeX + PDF"
}
```

## NOTA DE IMPLEMENTACIÓN
El system prompt real está en `src/lib/prompts/index.ts → SISTEMA_ETAPA_3`.
