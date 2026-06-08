/**
 * SISTEMA_PROY_RESUMEN — Fase 5: Resumen Ejecutivo.
 *
 * El resumen ejecutivo va al INICIO del documento físico (después de
 * dedicatoria y agradecimientos), pero se redacta al FINAL porque
 * sintetiza el documento completo.
 *
 * Output: 300-450 palabras (una página). Tiene que cerrar con los
 * indicadores financieros (VAN/TIR/cuota) para dar la conclusión
 * en una mirada.
 *
 * Max tokens recomendado: 1500.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_RESUMEN = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando el RESUMEN EJECUTIVO del Proyecto de Grado.

El resumen va al INICIO del documento pero se redacta al FINAL porque
sintetiza todo el trabajo. Es lo primero que leerá el tribunal y
quizás lo único que lean otros lectores.

Recibes TODOS los capítulos aprobados como contexto. Tu salida es
una síntesis de 300-450 palabras, NO un capítulo completo.

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

# Resumen Ejecutivo

(Sin sub-secciones — es una pieza continua de prosa académica.)

Estructura interna recomendada en 4 párrafos:

**Párrafo 1 — Problema y objetivo (60-80 palabras)**

Identificas el problema o oportunidad y el objetivo general del
proyecto. Una sola oración fuerte que sintetiza el QUÉ y el PARA QUÉ.

**Párrafo 2 — Metodología y hallazgos del análisis del mercado (80-110 palabras)**

Mencionas la metodología aplicada (estudio descriptivo-propositivo con
encuesta a n=X personas) y los hallazgos clave del análisis externo:
- Resultado del PESTEL (favorable/desfavorable).
- Tasa de aceptación del proyecto en la encuesta.
- Demanda potencial identificada.

**Párrafo 3 — Propuesta del proyecto (80-110 palabras)**

Describes la propuesta concreta:
- Tipo de empresa y nombre comercial.
- Ubicación.
- Modelo de negocio (qué se ofrece, a quién, cómo).
- Inversión inicial total estimada en Bs.
- Estructura de financiamiento.

**Párrafo 4 — Conclusión financiera (60-90 palabras)**

Cierre con los indicadores financieros clave:
- VAN del proyecto.
- TIR vs WACC (con diferencia explícita: "TIR de X% supera el WACC
  exigido de Y%, por lo que el proyecto crea valor").
- Período de recuperación.
- Conclusión: el proyecto es VIABLE / NO VIABLE.

**Palabras clave** (cierre)

Línea final con 4-6 palabras clave del proyecto, separadas por coma.

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO superes 450 palabras NI bajes de 300.
- NO uses títulos ni viñetas — es prosa continua.
- NO inventes datos que no estén en los capítulos previos.
- NO uses primera persona ("yo realicé") — tercera impersonal ("se
  realizó").
- NO termines con "espero que este resumen sea de utilidad" o similar.
- NO escribas "como se mencionó en el Cap. III" — el resumen tiene
  que entenderse solo, sin referencias internas.
`.trim();

export function buildContextoResumen(datos: {
  cap1Aprobado: string;
  cap3eAprobado: string;
  cap3fAprobado: string;
  cap4aAprobado: string;
  cap4fAprobado: string;
  cap4gAprobado: string;
  tituloAprobado: string;
}): string {
  return [
    "═══════════════════════════════════════════════════════════════",
    "[CONTEXTO]",
    "═══════════════════════════════════════════════════════════════",
    `- Título: ${datos.tituloAprobado}`,
    "",
    "═══════════════════════════════════════════════════════════════",
    "[CAPÍTULO I]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3e — RESULTADOS DE ENCUESTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3eAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3f — DEMANDA Y CUOTA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3fAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4a — IDENTIDAD CORPORATIVA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4aAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4f — ESTUDIO FINANCIERO]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4fAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4g — EVALUACIÓN — VAN/TIR/WACC/PE]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4gAprobado.trim(),
    "",
  ].join("\n");
}
