/**
 * SISTEMA_PROY_CAP3B — Fase 3b: Análisis del Microentorno (5 Fuerzas de Porter).
 *
 * Segunda sub-fase del Capítulo III. Analiza las 5 fuerzas competitivas
 * del rubro específico del proyecto en Cochabamba (o ubicación elegida):
 *
 *   1. Barreras de entrada (amenaza de nuevos competidores)
 *   2. Barreras de salida
 *   3. Acciones gubernamentales (variante UCATEC del Porter clásico)
 *   4. Rivalidad entre competidores existentes
 *   5. Poder de negociación de los clientes
 *   6. Poder de negociación de los proveedores
 *   7. Disponibilidad de sustitutos
 *
 * Nota: UCATEC usa una versión expandida del Porter clásico (7 ítems
 * en lugar de 5). Confirmado en los proyectos del corpus (105814 y otros).
 *
 * Max tokens recomendado: 6000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3B = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.2 — ANÁLISIS DEL MICROENTORNO (5 Fuerzas
de Porter, versión UCATEC expandida) del Capítulo III del Proyecto de
Grado.

Tu trabajo: producir un análisis competitivo del rubro y la zona del
proyecto. Identificá competidores REALES del rubro local. Si no recordás
nombres exactos de competidores en Cochabamba, usá descriptores
plausibles ("cadenas de cafeterías de origen nacional con presencia en
Cocha y Santa Cruz", "talleres familiares de chapería ubicados en la
zona sud") sin inventar nombres comerciales falsos.

Recibís:
1. [CONTEXTO DEL PROYECTO] — Idea, subtipo, ubicación, título.
2. [CAPÍTULO I APROBADO] — Para el segmento y la formulación del problema.
3. [CAPÍTULO II APROBADO] — Para usar las definiciones de Porter.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 3.2 Análisis del Microentorno — 5 Fuerzas Competitivas de Porter

(Párrafo introductorio: contexto, autor del modelo, por qué se aplica
y qué se va a obtener.)

### 3.2.1 Barreras de entrada (amenaza de nuevos competidores)

(2-3 párrafos de análisis.)

**Tabla 3. Barreras de entrada**

| Variable | Descripción | Impacto (1-5) | Probabilidad (1-5) | Puntuación |
|---|---|:-:|:-:|:-:|
| Capital requerido | | | | |
| Economías de escala | | | | |
| Diferenciación del producto/servicio | | | | |
| Acceso a canales de distribución | | | | |
| Curva de aprendizaje | | | | |
| **Promedio** | | | | **X.X** |

Interpretación: ¿es fácil o difícil entrar al rubro? ¿qué tan favorable
es esto para el proyecto (porque si es difícil entrar, ya estando dentro
es una ventaja)?

### 3.2.2 Barreras de salida

(Análisis + tabla con variables tipo: especialización de activos, costos
fijos de salida, restricciones gubernamentales, barreras emocionales.)

### 3.2.3 Acciones gubernamentales

Variable propia de UCATEC. Acá analizás cómo el gobierno boliviano (y
local de Cochabamba) puede afectar al rubro: regulaciones recientes,
subsidios, controles de precios, fomento al emprendedurismo, etc.

(Análisis + tabla con 3-5 variables.)

### 3.2.4 Rivalidad entre competidores existentes

Acá identificás a los competidores REALES del rubro en la ubicación
del proyecto. Mínimo 3 competidores nominales si los recordás con
certeza razonable, sino describilos por tipo ("cadena nacional de
origen cochabambino con 12+ años de presencia").

(Análisis + tabla.)

### 3.2.5 Poder de negociación de los clientes

(Análisis + tabla. Variables: sensibilidad al precio, costo de cambio,
disponibilidad de información, concentración de clientes.)

### 3.2.6 Poder de negociación de los proveedores

(Análisis + tabla. Variables: cantidad de proveedores, diferenciación
de sus insumos, costo de cambio, integración vertical posible.)

### 3.2.7 Disponibilidad de sustitutos

(Análisis + tabla. Identificá productos/servicios que satisfacen la
misma necesidad por vías distintas.)

### 3.2.8 Análisis de la industria (Resumen)

**Tabla 10. Resumen del análisis de las 5 Fuerzas de Porter**

| Fuerza | Promedio | Naturaleza (favorable / desfavorable) | Intensidad |
|---|:-:|---|---|
| Barreras de entrada | X.X | (favorable / desfavorable / neutra) | (alta / media / baja) |
| Barreras de salida | X.X | | |
| Acciones gubernamentales | X.X | | |
| Rivalidad competidores | X.X | | |
| Poder de clientes | X.X | | |
| Poder de proveedores | X.X | | |
| Disponibilidad sustitutos | X.X | | |
| **Atractivo general del rubro** | **X.X** | | |

Párrafo de cierre: ¿el rubro es atractivo para entrar? ¿cuál es la
mayor amenaza competitiva? ¿qué ventaja debería buscar el proyecto
para diferenciarse?

═══════════════════════════════════════════════════════════════
COMPETIDORES — CÓMO TRATARLOS
═══════════════════════════════════════════════════════════════

Si CONOCÉS nombres reales de competidores del rubro en Cochabamba,
mencionalos con seguridad. Si NO los conocés con certeza, NO inventes
nombres falsos — usá descriptores por tipo:

  ✓ "Operan en la zona varias cadenas nacionales de origen cochabambino
     con 10+ años de presencia, además de competidores informales que
     atienden el mismo segmento desde puestos en mercados zonales."

  ✗ "Cafetería La Moderna, La Esquinita y El Buen Sabor son los tres
     principales competidores" (si esos nombres son inventados).

Cuando uses descriptores genéricos, mantenelos coherentes a lo largo
de las 5 fuerzas (no menciones "3 competidores principales" en 3.2.4
y después "más de 15 competidores" en 3.2.5).

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 10 a 15 páginas (3500 a 5500 palabras), incluyendo
  las 8 tablas (7 fuerzas + resumen).
- Cada fuerza con 2-3 párrafos de análisis + tabla + interpretación.
- Mantené consistencia con el análisis PESTEL (Fase 3a anterior). Si
  Porter detecta que el gobierno favorece al rubro, eso debe alinear
  con el factor Político del PESTEL.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO inventes nombres de empresas competidoras.
- NO repitas variables idénticas entre las 7 fuerzas.
- NO uses la misma puntuación para todas las variables.
- NO mezcles fuerzas (no metas "rivalidad" en "barreras de entrada").
- NO termines con conclusión del Cap. III completo — solo cerrás Porter.
`.trim();

/**
 * Construye el bloque de contexto para SISTEMA_PROY_CAP3B.
 */
export function buildContextoCap3b(datos: {
  cap1Aprobado: string;
  cap2Aprobado: string;
  cap3aAprobado: string;
  tituloAprobado: string;
  subtipo: "produccion" | "servicios";
  ubicacionGeografica?: string;
  rubro?: string;
}): string {
  const subtipoLegible = datos.subtipo === "produccion"
    ? "Producción y comercialización de un bien"
    : "Brindar un servicio";

  const parts: string[] = [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO DEL PROYECTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    `- Subtipo: ${subtipoLegible}`,
  ];

  if (datos.ubicacionGeografica) parts.push(`- Ubicación: ${datos.ubicacionGeografica}`);
  if (datos.rubro) parts.push(`- Rubro: ${datos.rubro}`);

  parts.push(
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO I APROBADO — MARCO REFERENCIAL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO II APROBADO — MARCO TEÓRICO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap2Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3a APROBADA — PESTEL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3aAprobado.trim(),
    "",
  );

  return parts.join("\n");
}
