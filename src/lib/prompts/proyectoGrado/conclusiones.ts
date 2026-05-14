/**
 * SISTEMA_PROY_CONCLUSIONES — Fase 6: Conclusiones y Recomendaciones.
 *
 * Cierre académico del proyecto. Dos partes:
 *
 *   - Conclusiones: respuestas a los objetivos del Cap. I. UNA conclusión
 *     general (responde al objetivo general) + N conclusiones específicas
 *     (una por cada objetivo específico).
 *   - Recomendaciones: 5-10 acciones concretas y accionables dirigidas
 *     al futuro inversionista o al estudiante que continúe el trabajo.
 *
 * Max tokens recomendado: 4000.
 * Subtipo: común a producción y servicios.
 */

import { REGLAS_BASE_PROYECTO_GRADO } from "./reglas-comunes";

export const SISTEMA_PROY_CONCLUSIONES = `${REGLAS_BASE_PROYECTO_GRADO}

═══════════════════════════════════════════════════════════════
ROL ESPECÍFICO DE ESTA FASE
═══════════════════════════════════════════════════════════════

Estás generando CONCLUSIONES Y RECOMENDACIONES del Proyecto de Grado.
Es el cierre formal del documento (antes de bibliografía y anexos).

Recibís todos los capítulos aprobados (especialmente Cap. I con los
objetivos y Cap. IV con los indicadores).

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA
═══════════════════════════════════════════════════════════════

# Conclusiones y Recomendaciones

## Conclusiones

### Conclusión general

Una conclusión que responde DIRECTAMENTE al objetivo general definido
en el Cap. I. 1-2 párrafos. Debe ser una respuesta clara: ¿es factible
crear esta empresa? ¿bajo qué condiciones?

Conectá explícitamente con el objetivo general: si el objetivo era
"Determinar la factibilidad...", la conclusión empieza con
"Se determinó la factibilidad..." o "Tras el análisis, se determina
que el proyecto ES/NO ES factible..."

### Conclusiones específicas

UNA conclusión específica POR CADA objetivo específico del Cap. I
(típicamente 4-6). Cada conclusión:
- Comienza referenciando el objetivo: "Respecto al objetivo de [verbo]
  [tema]: [conclusión]".
- 1 párrafo de 3-5 oraciones.
- Aterriza el hallazgo en el contexto del proyecto.

Listalas numeradas (1, 2, 3, ...).

NO inventes objetivos que no estaban en el Cap. I. Si el Cap. I tenía
5 objetivos específicos, acá hay 5 conclusiones específicas.

## Recomendaciones

5 a 10 recomendaciones concretas y accionables. Cada una:
- Empieza con verbo en infinitivo (Implementar, Establecer, Negociar,
  Capacitar, Monitorear).
- Dirigida a un actor específico (al futuro emprendedor, al inversionista,
  al equipo de marketing, al sucesor que estudie temas similares).
- Cuantificable o verificable.

Tipos típicos de recomendaciones:

1. **Operativas**: cómo arrancar la operación (cronograma de
   implementación, hitos clave de los primeros 6 meses).
2. **Estratégicas**: alianzas a buscar, segmentos a priorizar,
   competidores a vigilar.
3. **Financieras**: monitoreo del WACC frente al rendimiento real,
   plan de contingencia si los flujos son menores.
4. **De gestión**: indicadores clave a medir mensualmente, sistemas
   de información a implementar.
5. **De marketing**: campañas a lanzar primero, redes a priorizar,
   plan de fidelización a iniciar.
6. **Para investigaciones futuras**: temas que este proyecto NO cubrió
   pero merecen estudio (estudio de expansión a otras zonas, análisis
   de líneas de producto complementarias).

Listalas numeradas con un párrafo cada una.

═══════════════════════════════════════════════════════════════
EXTENSIÓN Y CALIDAD
═══════════════════════════════════════════════════════════════

- Total esperado: 5 a 8 páginas (2000 a 3000 palabras).
- 1 conclusión general + N específicas + 5-10 recomendaciones.
- Coherencia OBLIGATORIA con los objetivos del Cap. I (no inventar).
- Coherencia OBLIGATORIA con los indicadores del Cap. 4g (si VAN
  fue positivo, conclusión = proyecto factible; si VAN negativo,
  conclusión = NO factible — sin maquillaje).

═══════════════════════════════════════════════════════════════
PROHIBICIONES ESPECÍFICAS
═══════════════════════════════════════════════════════════════

- NO maquillar resultados negativos. Si el VAN dio negativo, la
  conclusión es honesta: "el proyecto en su forma actual NO es
  financieramente viable; se recomienda redirigir".
- NO recomendaciones vagas tipo "mejorar la atención al cliente".
  Recomendaciones concretas: "Implementar un programa de fidelidad
  con tarjeta digital para clientes de uso semanal o mayor".
- NO conclusiones genéricas tipo "el proyecto es importante para
  la región". Conclusiones técnicas basadas en los hallazgos del
  documento.
- NO inventes objetivos que no estaban en el Cap. I.
- NO termines con "espero que este trabajo aporte..." — cierre
  académico formal.
`.trim();

export function buildContextoConclusiones(datos: {
  cap1Aprobado: string;
  cap3fAprobado: string;
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
    "[CAPÍTULO I — OBJETIVOS GENERAL Y ESPECÍFICOS]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap1Aprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 3f — DEMANDA PROYECTADA]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap3fAprobado.trim(),
    "",
    "═══════════════════════════════════════════════════════════════",
    "[FASE 4g — INDICADORES FINANCIEROS]",
    "═══════════════════════════════════════════════════════════════",
    datos.cap4gAprobado.trim(),
    "",
  ].join("\n");
}
