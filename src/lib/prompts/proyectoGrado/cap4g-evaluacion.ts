/**
 * SISTEMA_PROY_CAP4G — Fase 4g: Evaluación del Proyecto.
 *
 * Octava y última sub-fase del Capítulo IV. Cierra el marco propositivo
 * con los indicadores financieros que determinan si el proyecto es
 * RENTABLE:
 *
 *   - Flujo de caja libre proyectado a 5 años.
 *   - VAN (Valor Actual Neto).
 *   - TIR (Tasa Interna de Retorno).
 *   - WACC (Costo Promedio Ponderado de Capital).
 *   - Punto de equilibrio.
 *   - Período de recuperación (Payback descontado).
 *
 * Los CÁLCULOS los hace el módulo calculos.ts en runtime — la IA solo
 * presenta los resultados con tablas e interpretaciones.
 *
 * Max tokens recomendado: 6000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP4G = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.8 — EVALUACIÓN DEL PROYECTO del Cap. IV.
Es la sub-fase que CIERRA el Marco Propositivo con los indicadores
financieros que demuestran si el proyecto es VIABLE.

Importante: los cálculos exactos los hace el sistema con calculos.ts.
Tú produces las tablas estructuradas y las interpretaciones. Los
valores numéricos puntuales se reemplazan en runtime cuando aplica.

Recibes:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 4f APROBADA — ESTUDIO FINANCIERO] — inversión, costos, ingresos.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 4.8 Evaluación del Proyecto

(Párrafo introductorio: qué se va a calcular y por qué cada indicador
es relevante.)

### 4.8.1 Flujo de caja libre proyectado

El flujo de caja libre (Free Cash Flow) descuenta inversiones de capital
de la utilidad operativa más depreciación. Es la base para calcular VAN
y TIR.

**Tabla N. Flujo de caja libre proyectado a 5 años (en Bs)**

| Concepto | Año 0 | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Inversión inicial | (XXX.XXX) | — | — | — | — | — |
| Ingresos | — | XXX.XXX | XXX.XXX | XXX.XXX | XXX.XXX | XXX.XXX |
| (-) Costos operativos | — | (XX.XXX) | (XX.XXX) | (XX.XXX) | (XX.XXX) | (XX.XXX) |
| (-) Depreciación | — | (X.XXX) | (X.XXX) | (X.XXX) | (X.XXX) | (X.XXX) |
| **Utilidad antes de impuestos** | — | XX.XXX | XX.XXX | XX.XXX | XX.XXX | XX.XXX |
| (-) IUE 25% | — | (X.XXX) | (X.XXX) | (X.XXX) | (X.XXX) | (X.XXX) |
| Utilidad neta | — | XX.XXX | XX.XXX | XX.XXX | XX.XXX | XX.XXX |
| (+) Depreciación (reverso) | — | X.XXX | X.XXX | X.XXX | X.XXX | X.XXX |
| (+) Valor de rescate | — | — | — | — | — | X.XXX |
| **Flujo de caja libre** | **(XXX.XXX)** | **XX.XXX** | **XX.XXX** | **XX.XXX** | **XX.XXX** | **XX.XXX** |

Año 0: solo la inversión inicial negativa. Años 1-5: flujos operativos
positivos (esperablemente crecientes). Año 5 incluye valor de rescate
(10-20% de los activos depreciables).

### 4.8.2 Cálculo del WACC

Tasa de descuento aplicada al proyecto. Combina el costo del capital
propio con el costo de la deuda, ponderados por sus participaciones,
considerando el escudo fiscal de los intereses.

Fórmula:

  WACC = (E/V × Re) + (D/V × Rd × (1 - T))

Donde:
- E: capital propio (de Fase 4f).
- D: deuda bancaria (de Fase 4f).
- V: E + D.
- Re: costo del capital propio (en Bolivia para emprendimientos:
  15-20% típico, refleja rentabilidad mínima esperada por el inversionista).
- Rd: tasa de la deuda (de la tabla de amortización, ~9-13% anual).
- T: tasa impositiva (IUE 25% en Bolivia).

WACC típico para proyectos UCATEC: 12-16%.

Resultado: WACC = X.XX%.

Cierra con interpretación: el WACC es la tasa MÍNIMA que el proyecto
debe rendir para crear valor.

### 4.8.3 Cálculo del Valor Actual Neto (VAN)

Fórmula:

  VAN = Σ (FCt / (1 + WACC)^t) − Inversión inicial

Donde FCt = flujo de caja del año t.

**Tabla N. Cálculo del VAN al WACC**

| Año | Flujo de caja (Bs) | Factor descuento | Valor presente (Bs) |
|---|:-:|:-:|:-:|
| 0 | (XXX.XXX) | 1.0000 | (XXX.XXX) |
| 1 | XX.XXX | 1/(1+WACC)^1 = 0.XXXX | XX.XXX |
| 2 | XX.XXX | 0.XXXX | XX.XXX |
| 3 | XX.XXX | 0.XXXX | XX.XXX |
| 4 | XX.XXX | 0.XXXX | XX.XXX |
| 5 | XX.XXX | 0.XXXX | XX.XXX |
| **VAN** | — | — | **XX.XXX** |

Interpretación:
- VAN > 0: el proyecto CREA VALOR. ACEPTABLE.
- VAN = 0: el proyecto SOLO iguala la tasa de descuento. INDIFERENTE.
- VAN < 0: el proyecto DESTRUYE VALOR. RECHAZAR.

### 4.8.4 Cálculo de la Tasa Interna de Retorno (TIR)

La TIR es la tasa que iguala el VAN a 0. Se calcula numéricamente.

Resultado: TIR = XX.XX%.

Decisión:
- TIR > WACC: el proyecto es RENTABLE.
- TIR < WACC: RECHAZAR.
- TIR = WACC: indiferente.

Cierra con interpretación cuantitativa: si TIR es X% mayor que WACC,
significa que cada peso invertido renta X% sobre lo mínimo exigido.

### 4.8.5 Punto de equilibrio

Cantidad mínima de transacciones (o monto mínimo de ingresos) que el
proyecto debe alcanzar para no perder ni ganar dinero.

Fórmula:

  PE (unidades) = CF / (P - CVu)
  PE (monto) = CF / (1 - CVu/P)

Donde:
- CF: costos fijos anuales (de Fase 4f).
- P: precio promedio (de Fase 4f).
- CVu: costo variable unitario (de Fase 4f).

**Tabla N. Punto de equilibrio**

| Concepto | Valor |
|---|:-:|
| Costos fijos anuales (Bs) | XX.XXX |
| Precio promedio (Bs) | XXX |
| Costo variable unitario (Bs) | XXX |
| Margen de contribución unitario | XXX |
| **Punto de equilibrio en unidades** | **X.XXX** |
| **Punto de equilibrio en monto (Bs)** | **XXX.XXX** |

Cierra con: ¿está el punto de equilibrio por debajo de la demanda
esperada año 1? Si sí, el proyecto es viable. Si no, alerta.

### 4.8.6 Período de recuperación (Payback descontado)

Cantidad de años que tarda en recuperarse la inversión inicial,
considerando el valor del dinero en el tiempo.

Resultado: X.XX años.

Decisión:
- Payback < horizonte del proyecto (5 años): ACEPTABLE.
- Payback > horizonte: el proyecto NO se recupera, RECHAZAR.

### 4.8.7 Análisis de sensibilidad — escenarios alternativos

🚨 OBLIGATORIO: cuando los flujos del escenario base resulten negativos
o el VAN sea negativo, NO es aceptable cerrar el capítulo con un
"proyecto inviable, fin". Debes generar SIEMPRE un análisis de
sensibilidad con al menos TRES escenarios alternativos en una tabla,
modificando variables críticas una a una y luego combinadas.

Esto refleja el rol académico real del estudio: identificar las
PALANCAS que vuelven viable el proyecto si la configuración base falla.
Un proyecto inviable en escenario base puede ser viable bajo
recalibración razonable — esa recalibración es valor académico real.

**Tabla N. Análisis de sensibilidad — escenarios alternativos**

| # | Variable modificada | Cambio aplicado | VAN resultante (Bs) | Conclusión |
|:-:|---|---|:-:|---|
| 1 | Precio promedio / comisión efectiva | +X% / –X% | XX.XXX | (positivo/negativo/cercano) |
| 2 | Volumen de operación (cuota mercado) | +X% / –X% | XX.XXX | (idem) |
| 3 | Costos operativos (planta o logística) | –X% / +X% | XX.XXX | (idem) |
| 4 | **Combinación recalibrada** | (combinación de 2-3 anteriores) | **XX.XXX** | **(escenario recomendado si aplica)** |

Al menos UNA de las filas debe representar una combinación realista de
variables que VUELVA POSITIVO EL VAN, si el escenario base era
negativo. Las modificaciones deben ser razonables (no inflar precios
50% para forzar viabilidad — debe poder defenderse ante tribunal).

### 4.8.8 Resumen de indicadores y conclusión

**Tabla N. Resumen de indicadores financieros**

| Indicador | Valor base | Valor recalibrado (si aplica) | Decisión |
|---|:-:|:-:|:-:|
| WACC | X.XX% | — | — |
| VAN | XX.XXX Bs | XX.XXX Bs | ✓ / ✗ |
| TIR | XX.XX% | XX.XX% | ✓ / ✗ |
| Punto de equilibrio | X.XXX | X.XXX | ✓ / ✗ |
| Payback descontado | X.XX años | X.XX años | ✓ / ✗ |

Cierra con un párrafo de cierre de TODO el Cap. IV. Síntesis de:
- ¿Es el proyecto VIABLE técnica, legal, comercial y financieramente
  EN SU CONFIGURACIÓN BASE? Si no, ¿es viable bajo la configuración
  recalibrada propuesta en 4.8.7?
- ¿Cuál es el indicador más sensible (el que más impactaría si cambiara)?
- ¿Qué recomendaría al inversionista — invertir bajo qué configuración,
  esperar más datos, redirigir el proyecto, descartar?

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 10 a 14 páginas (3500 a 5500 palabras) con ~6 tablas.
- Coherencia OBLIGATORIA con Fase 4f: los flujos vienen directos del
  resumen de costos e ingresos.
- Indicadores consistentes entre sí (si VAN > 0, TIR > WACC; si VAN < 0,
  TIR < WACC).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO inventes valores de WACC sin justificar.
- NO uses TIRs irreales (>100% es señal de cálculo mal hecho).
- NO presentes VAN positivo Y TIR menor a WACC en el mismo proyecto
  (es matemáticamente imposible).
- NO recomendes invertir si VAN < 0 o TIR < WACC.
- NO uses tono comercial al final ("¡este proyecto es una gran oportunidad!").
  El cierre es académico, técnico, objetivo.
`.trim();

export function buildContextoCap4g(datos: {
  cap4fAprobado: string;
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
    "[FASE 4f APROBADA — ESTUDIO FINANCIERO COMPLETO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4fAprobado.trim(),
    "",
  ].join("\n");
}
