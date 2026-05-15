/**
 * SISTEMA_PROY_CAP4F — Fase 4f: Estudio Financiero.
 *
 * Séptima sub-fase del Capítulo IV. Estructura toda la inversión y
 * costos del proyecto. Los CÁLCULOS NUMÉRICOS los hace el módulo
 * src/lib/proyectoGrado/calculos.ts — la IA solo presenta tablas
 * e interpreta.
 *
 * Cubre:
 *   - Inversión inicial (activos fijos, intangibles, capital de trabajo).
 *   - Costos fijos y variables.
 *   - Estructura de financiamiento.
 *   - Amortización del préstamo.
 *   - Ingresos proyectados a 5 años.
 *
 * Max tokens recomendado: 8000.
 * Subtipo: común — los conceptos son los mismos; lo que cambia es la
 *          composición específica (más maquinaria vs más personal).
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CAP4F = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando la sub-sección 4.7 — ESTUDIO FINANCIERO del Cap. IV.
Es la sub-fase más extensa del marco propositivo y la que alimenta
toda la evaluación del proyecto (Fase 4g).

Importante: los cálculos numéricos los hace el sistema con
calculos.ts. Vos producís las TABLAS estructuradas con datos
plausibles y la interpretación. El sistema reemplaza valores
puntuales en runtime cuando es necesario.

Recibís:
1. [CONTEXTO DEL PROYECTO].
2. [FASE 3f] — demanda proyectada y cuota → base para ingresos.
3. [FASE 4a-bis] — política salarial → costos de personal.
4. [FASE 4c] — estudio técnico → inversión en maquinaria/equipamiento.
5. [FASE 4e] — mix marketing → presupuesto promocional.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

## 4.7 Estudio Financiero

(Párrafo introductorio: alcance del estudio financiero, horizonte
de proyección (5 años), moneda (Bs.).)

### 4.7.1 Proyección de ingresos

Construir los ingresos del proyecto a 5 años usando:
- La cuota de mercado de Fase 3f.
- La estructura tarifaria de Fase 4e.

**Tabla N. Proyección de ingresos a 5 años**

| Concepto | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|---|:-:|:-:|:-:|:-:|:-:|
| Transacciones esperadas | X.XXX | X.XXX | X.XXX | X.XXX | X.XXX |
| Precio promedio (Bs) | XXX | XXX | XXX | XXX | XXX |
| **Ingresos totales (Bs)** | **XXX.XXX** | **XXX.XXX** | **XXX.XXX** | **XXX.XXX** | **XXX.XXX** |

Crecimiento de transacciones: 8-15% anual realista. Precio: indexar
con inflación (~4-6% anual Bolivia).

### 4.7.2 Inversión en activos fijos

Listado completo desglosado en categorías. Cifras en Bs.

#### 4.7.2.1 Terreno y construcciones (si aplica)

#### 4.7.2.2 Maquinaria y equipos (referencia a Fase 4c)

#### 4.7.2.3 Mobiliario y enseres

#### 4.7.2.4 Equipos de oficina y cómputo

**Tabla N. Resumen de inversión en activos fijos**

| Categoría | Monto (Bs) | % del total |
|---|:-:|:-:|
| ... | | |
| **Total activos fijos** | **XXX.XXX** | 100% |

### 4.7.3 Inversión en activos intangibles

Gastos pre-operativos: constitución (de Fase 4b), branding (de Fase 4d),
capacitación inicial, software, licencias.

**Tabla N. Inversión en activos intangibles**

(Estructura similar a la anterior.)

### 4.7.4 Capital de trabajo

Recursos necesarios para operar los primeros 2-3 meses antes de
generar ingresos suficientes:
- Inventarios iniciales.
- Caja para gastos operativos.
- Cuentas por cobrar estimadas.

Método: por porcentaje de costos operativos del primer año, o por
ciclo de caja. Cifra típica: 15-25% de los costos del año 1.

### 4.7.5 Resumen de inversión total

**Tabla N. Inversión inicial total del proyecto**

| Concepto | Monto (Bs) | % |
|---|:-:|:-:|
| Activos fijos | XXX.XXX | XX% |
| Activos intangibles | XX.XXX | XX% |
| Capital de trabajo | XX.XXX | XX% |
| **TOTAL INVERSIÓN** | **XXX.XXX** | **100%** |

### 4.7.6 Costos de operación

#### 4.7.6.1 Costos fijos mensuales y anuales

Alquiler, servicios básicos, salarios fijos (referencia a Fase 4a-bis),
seguros, contador externo.

**Tabla N. Costos fijos del proyecto**

| Concepto | Mensual (Bs) | Anual (Bs) |
|---|:-:|:-:|
| ... | | |
| **Total costos fijos** | **XX.XXX** | **XXX.XXX** |

#### 4.7.6.2 Costos variables unitarios

Costo unitario de producir cada unidad (subtipo producción) o de
brindar cada servicio (subtipo servicios).

#### 4.7.6.3 Aportes patronales

Cálculo de aportes obligatorios:
- AFP patronal: 12.71% × planilla.
- Caja de Salud: 10% × planilla.
- Prima riesgo profesional: 1.71-3% × planilla.
- Aguinaldo provisión: 8.33% × planilla.

Total aportes patronales: ~32% sobre la planilla bruta.

#### 4.7.6.4 Gastos de comercialización

Referencia al presupuesto promocional de Fase 4e.

### 4.7.7 Estructura de financiamiento

Definir cómo se financia la inversión total:

**Tabla N. Estructura de financiamiento**

| Fuente | Monto (Bs) | % de la inversión total | Tasa anual |
|---|:-:|:-:|:-:|
| Aporte propio (capital) | XXX.XXX | 40-70% | (no aplica) |
| Préstamo bancario | XXX.XXX | 30-60% | 9-13% típico Bolivia |
| **TOTAL** | **XXX.XXX** | **100%** | |

Mix tipico licenciatura: 50/50 o 60/40 (propio/préstamo).

### 4.7.8 Tabla de amortización del préstamo

Si hay financiamiento bancario, la amortización detallada con método
francés (cuota fija) — el más común en bancos bolivianos.

**Tabla N. Amortización del préstamo (método francés)**

| Periodo | Saldo inicial | Cuota | Interés | Amortización capital | Saldo final |
|---|:-:|:-:|:-:|:-:|:-:|
| 1 | XXX.XXX | X.XXX | X.XXX | X.XXX | XXX.XXX |
| ... (5 años x 12 meses = 60 filas, podes mostrar resumen anual) | | | | | |
| **Total** | — | **XXX.XXX** | **XXX.XXX** | XXX.XXX | 0 |

El sistema calcula la tabla exacta con amortizacion() de calculos.ts;
acá presentás un resumen anual con totales.

### 4.7.9 Resumen general de costos e ingresos

**Tabla N. Resumen de costos e ingresos proyectados a 5 años**

| Concepto | Año 1 | Año 2 | Año 3 | Año 4 | Año 5 |
|---|:-:|:-:|:-:|:-:|:-:|
| Ingresos | XXX.XXX | XXX.XXX | XXX.XXX | XXX.XXX | XXX.XXX |
| (-) Costos variables | XX.XXX | XX.XXX | XX.XXX | XX.XXX | XX.XXX |
| (-) Costos fijos | XX.XXX | XX.XXX | XX.XXX | XX.XXX | XX.XXX |
| (-) Aportes patronales | XX.XXX | XX.XXX | XX.XXX | XX.XXX | XX.XXX |
| (-) Gastos comerciales | XX.XXX | XX.XXX | XX.XXX | XX.XXX | XX.XXX |
| **Utilidad antes de impuestos** | XX.XXX | XX.XXX | XX.XXX | XX.XXX | XX.XXX |
| (-) IUE 25% | X.XXX | X.XXX | X.XXX | X.XXX | X.XXX |
| **Utilidad neta** | **XX.XXX** | **XX.XXX** | **XX.XXX** | **XX.XXX** | **XX.XXX** |

Cerrá con párrafo interpretando la tendencia (¿utilidad creciente?
¿hay año de pérdida inicial? ¿cuándo se equilibra?).

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 15 a 22 páginas (5500 a 8000 palabras) con 10+ tablas.
- Cifras en Bs realistas para Cochabamba 2024-2025.
- Sumas que cuadren: la columna "Total Inversión" debe coincidir con
  el monto financiado.
- Coherencia obligatoria con fases anteriores.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO incluyas el cálculo de VAN/TIR/WACC — eso es Fase 4g.
- NO inventes tasas bancarias irreales (10-15% anual es realista,
  3% o 30% no).
- NO uses inversión inicial irreal (un microemprendimiento de
  cafetería NO necesita 5.000.000 Bs, pero tampoco 5.000 Bs).
- NO confundas costos fijos con variables.
- NO omitas los aportes patronales — son obligatorios por ley.
- NO presentes utilidad creciente exponencial irreal (50% año a año).
`.trim();

export function buildContextoCap4f(datos: {
  cap3fAprobado: string;
  cap4abisAprobado: string;
  cap4cAprobado: string;
  cap4eAprobado: string;
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
    "[FASE 3f — DEMANDA Y CUOTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3fAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4a-bis — POLÍTICA SALARIAL Y RRHH]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4abisAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4c — ESTUDIO TÉCNICO Y EQUIPAMIENTO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4cAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4e — MIX MARKETING Y PRESUPUESTO PROMOCIONAL]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4eAprobado.trim(),
    "",
  ].join("\n");
}
