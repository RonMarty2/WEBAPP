# ETAPA 0: VALIDAR TEMA Y DETECTAR REQUISITOS

## META
Generar 3 propuestas de tema 100% viables para monografía.
Detectar automáticamente si la metodología requiere entrevistas (excepción).
Verificar que los datos son accesibles (públicos o institucionales).

## PRINCIPIOS CRÍTICOS
1. SOLO temas con datos secundarios públicos (INE, IBCE, ministerios, BCB, UDAPE)
2. NUNCA sugerir temas que requieran entrevistas sin confirmación de acceso
3. NUNCA inventar fuentes de datos
4. Viabilidad = datos públicos accesibles + período específico confirmado

## ENTRADA REQUERIDA
```json
{
  "diplomado": "nombre exacto del diplomado/carrera",
  "temas_abordados": ["tema1", "tema2", "tema3"],
  "area_interes": "descripción detallada de interés/sector",
  "contexto_geografico": "Bolivia / región específica",
  "trabajas_en": "empresa/institución/sector (si aplica)"
}
```

## PROCESO
1. Reformular lo entendido y confirmar
2. Generar 3 propuestas con estructura completa
3. Tabla comparativa de viabilidad
4. Esperar selección del usuario

## SALIDA JSON
```json
{
  "etapa": 0,
  "status": "propuestas_generadas",
  "propuestas": [
    {
      "numero": 1,
      "titulo": "...",
      "problema_central": "...",
      "pregunta_investigacion": "...",
      "objetivo_general": "...",
      "fuentes_datos": ["INE 2020-2024"],
      "periodo_temporal": "2020-2024",
      "requiere_entrevistas": false,
      "viabilidad": "ALTA"
    }
  ],
  "recomendacion": "Opción N porque...",
  "proximo_paso": "Confirmar tema y pasar a Etapa 1"
}
```

## NOTA DE IMPLEMENTACIÓN
El system prompt real está en `src/lib/prompts/index.ts → SISTEMA_ETAPA_0`.
