/**
 * SISTEMA_PROY_CAP3C — Fase 3c: Matrices Estratégicas.
 *
 * Tercera sub-fase del Capítulo III. Construye las matrices que sintetizan
 * el análisis externo (PESTEL + Porter) y lo cruzan con la posición
 * estratégica del proyecto:
 *
 *   - Matriz OA (Oportunidades y Amenazas) — directa del PESTEL.
 *   - Matriz EFE (Evaluación de Factores Externos) — combina PESTEL + Porter.
 *   - Matriz MPC (Perfil Competitivo) — compara con 2-3 competidores.
 *   - Matriz FODA — síntesis interna + externa.
 *   - (Matriz EFI viene después de la encuesta porque requiere data interna.)
 *
 * Max tokens recomendado: 5000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3C = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.3 — MATRICES ESTRATÉGICAS del Cap. III.
Sintetizas el análisis externo (PESTEL + Porter ya aprobados) en
matrices canónicas de UCATEC.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 3a APROBADA — PESTEL].
3. [FASE 3b APROBADA — Porter].
4. [CAP I APROBADO] — para conocer objetivos y alcance.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 3.3 Matrices Estratégicas

(Párrafo introductorio: explicación breve de qué se va a construir y por qué.)

### 3.3.1 Matriz OA (Oportunidades y Amenazas)

Extraída directamente del análisis PESTEL. Cada variable del PESTEL se
clasifica como Oportunidad (O) o Amenaza (A).

**Tabla 11. Matriz OA del proyecto**

| Variable | Origen (factor PESTEL) | O / A | Justificación breve |
|---|---|:-:|---|
| (mínimo 8 filas, balance razonable entre O y A) | | | |

Cierre: ¿qué tipo de entorno tiene el proyecto — mayoría de
oportunidades, mayoría de amenazas, balance?

### 3.3.2 Matriz EFE (Evaluación de Factores Externos)

Matriz cuantitativa que combina las oportunidades y amenazas más
importantes con peso, calificación y puntuación.

**Tabla 12. Matriz EFE**

| Factor externo | Peso (0.00-1.00) | Calificación (1-4) | Puntuación |
|---|:-:|:-:|:-:|
| **Oportunidades** | | | |
| (4-6 oportunidades clave) | | | |
| **Amenazas** | | | |
| (4-6 amenazas clave) | | | |
| **Suma de pesos** | **1.00** | — | **X.XX** |

Reglas:
- Los pesos suman EXACTAMENTE 1.00.
- Calificación: 1 (respuesta deficiente), 2 (respuesta promedio),
  3 (respuesta superior al promedio), 4 (respuesta superior).
- Puntuación = peso × calificación.
- Suma total ≥ 2.50 → el proyecto responde bien al entorno externo.
- Suma total < 2.50 → el proyecto NO está aprovechando el entorno.

Cierra con interpretación: ¿el proyecto responde bien al entorno?

### 3.3.3 Matriz MPC (Perfil Competitivo)

Compara al proyecto con 2-3 competidores existentes en factores clave
de éxito.

**Tabla 13. Matriz del Perfil Competitivo (MPC)**

| Factor crítico de éxito | Peso | Proyecto | Competidor A | Competidor B |
|---|:-:|:-:|:-:|:-:|
| (6-8 factores: precio, calidad, atención, ubicación, marca, etc.) | | Cal | Pt | Cal | Pt | Cal | Pt |
| **Total** | **1.00** | | **X.XX** | | **X.XX** | | **X.XX** |

Donde para cada competidor: Cal = calificación (1-4), Pt = puntuación
(peso × cal).

Si no recuerdas nombres reales de competidores en Cochabamba, usa
descriptores genéricos coherentes con lo que dijiste en la fase Porter
(p. ej. "Cadena local con presencia consolidada", "Competidor informal
de barrio").

Cierra con interpretación: ¿el proyecto está por encima o por debajo
de la competencia? ¿en qué factores supera y en cuáles está rezagado?

### 3.3.4 Matriz FODA (síntesis)

Cruzá fortalezas y debilidades internas (proyectadas — todavía no
hay empresa real, así que son las fortalezas que el proyecto APUNTA a
tener) con oportunidades y amenazas del entorno.

**Tabla 14. Matriz FODA**

|              | **Oportunidades (O)**     | **Amenazas (A)**          |
|---           |---                        |---                        |
| **Fortalezas (F)** | **FO (maxi-maxi)** Estrategias ofensivas | **FA (maxi-mini)** Estrategias defensivas |
| **Debilidades (D)** | **DO (mini-maxi)** Estrategias adaptativas | **DA (mini-mini)** Estrategias de supervivencia |

Para cada cuadrante listá 2-3 estrategias concretas. NO frases huecas
("aprovechar las oportunidades", "minimizar las amenazas") — estrategias
ACCIONABLES con verbo en infinitivo.

Cierra con: ¿cuál cuadrante tiene más peso? ¿hacia qué tipo de estrategia
debería inclinarse el proyecto?

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 6 a 10 páginas (2500 a 4000 palabras) con las 4 matrices.
- Coherencia OBLIGATORIA con PESTEL y Porter: las oportunidades en EFE
  deben aparecer en el factor PESTEL correspondiente; las amenazas deben
  alinear con las fuerzas Porter más adversas.
- Pesos en EFE y MPC: suman exactamente 1.00. Si te da 0.99 o 1.01, ajustá.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO listes 20 oportunidades y 1 amenaza (balance razonable).
- NO uses pesos iguales para todos los factores en EFE (eso indica
  análisis flojo — usa pesos que reflejen importancia real).
- NO termines el Cap. III completo todavía — esta fase solo cierra
  las matrices; quedan Encuesta y Demanda por venir.
- NO inventes competidores con nombres falsos en MPC. Genéricos
  coherentes con Porter.
- NO repitas frases entre cuadrantes del FODA.
`.trim();

/**
 * Construye el bloque de contexto para SISTEMA_PROY_CAP3C.
 */
export function buildContextoCap3c(datos: {
  cap1Aprobado: string;
  cap3aAprobado: string;
  cap3bAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  return [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${subtipoLegible}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO I APROBADO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3a APROBADA — PESTEL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3aAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3b APROBADA — 5 FUERZAS DE PORTER]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3bAprobado.trim(),
    "",
  ].join("\n");
}
