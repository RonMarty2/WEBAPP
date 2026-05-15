/**
 * SISTEMA_PROY_CAP3F — Fase 3f: Determinación de la Demanda y Cuota.
 *
 * Sexta y última sub-fase del Capítulo III. Cierra el análisis del
 * mercado calculando:
 *
 *   - Demanda potencial total (toda la población del segmento).
 *   - Demanda efectiva (aplicando la tasa de aceptación de la encuesta).
 *   - Demanda objetivo del proyecto (la cuota que se busca capturar).
 *   - Proyección de demanda a 5 años (con tasa de crecimiento plausible).
 *
 * Max tokens recomendado: 4000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP3F = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 3.6 — DETERMINACIÓN DE LA DEMANDA del
Cap. III. Es la última sub-fase del análisis del mercado y la que cierra
el Cap. III.

Recibís:
1. [CONTEXTO DEL PROYECTO].
2. [CAP I APROBADO] — para conocer el segmento, ubicación y alcance.
3. [FASE 3a — PESTEL] — para ajustar proyección al contexto económico.
4. [FASE 3e APROBADA — RESULTADOS DE ENCUESTA] — para extraer la
   tasa de aceptación y la frecuencia de uso.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 3.6 Determinación de la Demanda

(Párrafo introductorio: qué se va a calcular, en qué se basa, cómo
alimenta el estudio financiero del Cap. IV.)

### 3.6.1 Método de depuración

Embudo de demanda — proceso de filtrado desde la población general
hasta los clientes potenciales reales del proyecto:

**Tabla N. Depuración de la demanda**

| Etapa | Cantidad | Filtro aplicado | Tasa de retención |
|---|:-:|---|:-:|
| Población total de la zona | XXX.XXX | — | 100% |
| Segmento etario relevante | XX.XXX | (ej: 25-45 años, X% del total según INE) | XX% |
| NSE relevante | XX.XXX | (ej: NSE medio y medio-alto) | XX% |
| Población conocedora / dispuesta | XX.XXX | Tasa según pregunta de "¿conoce / usaría?" de la encuesta | XX% |
| **Demanda potencial total** | **XX.XXX** | — | XX% |

Los porcentajes deben venir de:
- Filtros demográficos: datos plausibles del INE Bolivia o conocimiento
  general del segmento.
- Filtros de aceptación: directamente del % obtenido en Fase 3e.

Cerrá con interpretación: ¿el tamaño de mercado es atractivo? ¿hay
volumen suficiente para sostener el proyecto?

### 3.6.2 Demanda potencial vs demanda efectiva

Distinguir:

- **Demanda potencial**: total de personas que potencialmente comprarían
  o usarían el producto/servicio.
- **Demanda efectiva**: las que efectivamente comprarían en el primer
  año, considerando barreras (precio, distribución, awareness).

Fórmula típica:

  Demanda efectiva = Demanda potencial × tasa de conversión real

Donde la tasa de conversión real (12-30% típico) considera que no toda
la intención declarada se convierte en compra.

**Tabla N. Demanda efectiva del proyecto**

| Concepto | Valor |
|---|:-:|
| Demanda potencial total | XX.XXX personas |
| Tasa de conversión esperada | XX% |
| Demanda efectiva año 1 | X.XXX personas |
| Frecuencia de uso anual | X veces |
| **Total de transacciones año 1** | **XX.XXX** |

### 3.6.3 Cuota de mercado del proyecto

Definir qué porcentaje de la demanda efectiva apunta a capturar el
proyecto en el año 1. Para un proyecto nuevo entrando a un mercado
competido, una cuota de mercado del año 1 entre 2% y 8% es realista.
Justificá tu elección.

**Tabla N. Cuota de mercado del proyecto**

| Año | Demanda efectiva del mercado | Cuota % | Transacciones del proyecto |
|---|:-:|:-:|:-:|
| Año 1 | XX.XXX | X% | X.XXX |
| Año 2 | XX.XXX (con crecimiento del X%) | X% | X.XXX |
| Año 3 | XX.XXX | X% | X.XXX |
| Año 4 | XX.XXX | X% | X.XXX |
| Año 5 | XX.XXX | X% | X.XXX |

Reglas para la proyección a 5 años:
- Crecimiento del mercado: 3-7% anual realista en Bolivia.
- Crecimiento de la cuota: el proyecto suele crecer del 2% inicial al
  8-12% en año 5 si se ejecuta bien.
- NO uses crecimientos exponenciales irreales (50% año tras año).

### 3.6.4 Cierre del análisis del mercado

Párrafo final de 1-2 oraciones sintetizando: demanda objetivo año 1,
cantidad esperada de transacciones, y conexión con el estudio
financiero del Cap. IV donde se calculará ingresos a partir de
estas cifras.

═══════════════════════════════════════════════════════════════
COHERENCIA CON FASES ANTERIORES
═══════════════════════════════════════════════════════════════

Las cifras de esta fase deben ser COHERENTES con:
- El segmento definido en Cap. I (1.6.2 Alcance geográfico).
- La tasa de aceptación obtenida en Fase 3e (3.5.1.4 Intención).
- El factor económico del PESTEL (si el contexto es recesivo,
  conversiones más conservadoras).
- El nivel competitivo de Porter (si la rivalidad es alta, cuota
  inicial más baja).

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 4 a 6 páginas (1500 a 2500 palabras) con las 3 tablas.
- Cada tabla con interpretación.
- Cifras coherentes entre sí (la suma del embudo da el resultado final).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO uses cuotas de mercado año 1 > 15% (no es realista para un
  emprendimiento nuevo).
- NO uses crecimientos exponenciales (50%, 100% año tras año).
- NO mezcles unidades — si hablás de "personas atendidas", todas las
  tablas en personas. Si hablás de "transacciones", todas las tablas
  en transacciones.
- NO presentes la demanda como "100.000 personas comprarán seguro" —
  son ESTIMACIONES con margen de incertidumbre.
- NO termines con "esta proyección demuestra que el proyecto es
  exitoso" — eso lo demostrarán los indicadores financieros en Cap. IV.
`.trim();

export function buildContextoCap3f(datos: {
  cap1Aprobado: string;
  cap3aAprobado: string;
  cap3eAprobado: string;
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
    "[FASE 3e APROBADA — RESULTADOS DE ENCUESTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3eAprobado.trim(),
    "",
  ].join("\n");
}
