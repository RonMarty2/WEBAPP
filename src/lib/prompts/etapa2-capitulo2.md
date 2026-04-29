# ETAPA 2: CAPÍTULO II (MARCO TEÓRICO Y REFERENCIAL)
## Vinculado con Capítulo I aprobado

## META
Generar CAPÍTULO II desarrollando las teorías identificadas en Cap. I.
Integrar documentos del usuario si los proporciona.

## ENTRADA REQUERIDA
- `cap1_output` — JSON completo de Etapa 1 (aprobado)
- `citas_cap1` — Lista de citas registradas en Cap. I
- `teorias_a_desarrollar` — Lista de teorías del Cap. I párr. 3-4
- `documentos_usuario` — Documentos subidos por el usuario (opcional)
- `estudios_relacionados_cantidad` — 5-10 (de la literatura del Cap. I)
- `marcos_adicionales` — ["Jurídico", "Institucional"] si aplica

## PROCESO
1. Confirmar teorías a desarrollar vs. las de Cap. I
2. Procesar documentos del usuario (si existen)
3. Generar estructura 2.1, 2.2, 2.3
4. Validar coherencia con Cap. I
5. Registrar citas nuevas

## ESTRUCTURA GENERADA
```
2.1. Marco Teórico y Conceptual
├── 2.1.1. [Teoría 1]: origen, concepto, proposiciones, aplicación, críticas
├── 2.1.2. [Teoría 2]: ídem
└── Síntesis teórica integradora

2.2. Marco Referencial y Contextual
├── 5-10 estudios relacionados (párrafo independiente c/u)
├── Tabla comparativa: Autor | Año | Método | Conclusión | Relación
└── Contexto actual con datos Bolivia/región

2.3. Marcos adicionales (si aplica)
├── Marco Jurídico
├── Marco Institucional
└── Marco Histórico
```

## VALIDACIÓN COHERENCIA CON CAP. I
- ✅ Cada teoría de Cap. I pár. 3-4 está desarrollada en 2.1
- ✅ Los 5-7 papers de Cap. I están expandidos en 2.2
- ✅ Las conclusiones apoyan el problema de Cap. I
- ⚠️ Si aparece teoría nueva: avisar y preguntar

## SALIDA JSON
```json
{
  "etapa": 2,
  "status": "borrador",
  "teorias_desarrolladas": ["Teoría 1", "Teoría 2"],
  "estudios_relacionados_cantidad": 5,
  "documentos_usuario_integrados": [],
  "citas_registradas": [
    {
      "autor": "...",
      "ano": 2023,
      "titulo_obra": "...",
      "fuente": "...",
      "tipo": "paper",
      "formato_apa": "...",
      "capitulo": 2
    }
  ],
  "coherencia_con_cap1": true,
  "proximo_paso": "ETAPA 3: Capítulos III, IV, V + Bibliografía"
}
```

## NOTA DE IMPLEMENTACIÓN
El system prompt real está en `src/lib/prompts/index.ts → SISTEMA_ETAPA_2`.
