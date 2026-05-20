/**
 * Plan Builder del servicio "Documento Adaptativo".
 *
 * Toma la guía analizada + la plantilla elegida por el matcher y construye
 * un plan adaptativo: lista ordenada de FaseAdaptativa que respeta el orden
 * pedido por la guía del estudiante.
 *
 * Tres tipos de origen por fase:
 *   - `base`        → prompt de una plantilla conocida (UMSS, UCB, ...)
 *   - `adaptativo`  → IA improvisa porque ninguna plantilla cubre la sección
 *   - `componente`  → reutiliza subcomponente del sistema (tablas, encuesta,
 *                     bibliografía APA, etc.)
 *
 * Reglas:
 *   1. El orden del plan respeta el orden de la guía del estudiante.
 *   2. Si la guía pide tablas comparativas o imágenes, se agregan fases
 *      tipo 'componente' AL FINAL (porque son transversales, no secciones).
 *   3. Bibliografía siempre cierra el documento como 'componente'.
 */

import type {
  FaseAdaptativa,
  GuiaAnalizada,
  PlanAdaptativo,
  ResultadoMatching,
  SeccionRequerida,
} from './types';
import { obtenerDesgloseMatching } from './templateMatcher';
import { normalizarTextoParaMatching, type SeccionCanonica } from './templateCatalog';

export function construirPlanAdaptativo(opts: {
  nombre_trabajo: string;
  guia_analizada: GuiaAnalizada;
  matching: ResultadoMatching;
}): PlanAdaptativo {
  const { nombre_trabajo, guia_analizada, matching } = opts;
  const desglose = obtenerDesgloseMatching(guia_analizada, matching.plantilla_elegida);

  const fases: FaseAdaptativa[] = [];
  let contador = 0;

  // 1) Recorrer las secciones de la guía en su orden original
  for (const seccionGuia of [...guia_analizada.secciones].sort((a, b) => a.orden - b.orden)) {
    contador++;
    const phaseId = `adapt-${String(contador).padStart(3, '0')}`;

    const seccionCanonica = desglose
      ? buscarSeccionCanonicaParaGuia(seccionGuia, desglose.plantilla.secciones_canonicas)
      : undefined;

    if (seccionCanonica) {
      fases.push({
        phase_id: phaseId,
        titulo: seccionGuia.titulo,
        origen: 'base',
        prompt_ref: {
          plantilla: matching.plantilla_elegida,
          prompt_id: seccionCanonica.id,
        },
        descripcion: `${seccionGuia.descripcion} (Usa el prompt "${seccionCanonica.titulo}" de ${desglose!.plantilla.nombre}, adaptado al tono y requisitos de la guía.)`,
        requisitos: seccionGuia.requisitos,
        paginas_estimadas: estimarPaginasSeccion(guia_analizada, seccionGuia),
        orden: contador,
      });
    } else {
      fases.push({
        phase_id: phaseId,
        titulo: seccionGuia.titulo,
        origen: 'adaptativo',
        descripcion: `Sección nueva (no existe en ${desglose?.plantilla.nombre ?? 'la plantilla'}). La IA la genera con contexto del trabajo y de las fases vecinas. ${seccionGuia.descripcion}`,
        requisitos: seccionGuia.requisitos,
        paginas_estimadas: estimarPaginasSeccion(guia_analizada, seccionGuia),
        orden: contador,
      });
    }
  }

  // 2) Componentes transversales al final (en orden: tablas → imágenes → encuesta → bibliografía)
  if (guia_analizada.pide_tablas) {
    contador++;
    fases.push({
      phase_id: `adapt-${String(contador).padStart(3, '0')}`,
      titulo: 'Tablas comparativas',
      origen: 'componente',
      descripcion:
        'Reutiliza el motor de tablas del sistema (mismo que usan Scribe y Proyecto de Grado). Las tablas se integran dentro de las secciones donde son relevantes.',
      requisitos: [],
      paginas_estimadas: 'integradas',
      orden: contador,
    });
  }

  if (guia_analizada.pide_imagenes) {
    contador++;
    fases.push({
      phase_id: `adapt-${String(contador).padStart(3, '0')}`,
      titulo: 'Imágenes ilustrativas',
      origen: 'componente',
      descripcion:
        'Reutiliza el pipeline de figuras del proyecto (carpeta figuras/ en el ZIP de Overleaf). El estudiante puede subir sus propias imágenes o la IA sugiere referencias.',
      requisitos: [],
      paginas_estimadas: 'integradas',
      orden: contador,
    });
  }

  if (guia_analizada.pide_encuesta) {
    // Solo agregar si la sección no fue ya capturada como 'base'/'adaptativo'
    const yaTieneEncuesta = fases.some((f) =>
      normalizarTextoParaMatching(f.titulo).includes('encuesta') ||
      normalizarTextoParaMatching(f.titulo).includes('entrevista'),
    );
    if (!yaTieneEncuesta) {
      contador++;
      fases.push({
        phase_id: `adapt-${String(contador).padStart(3, '0')}`,
        titulo: 'Diseño de encuesta o entrevista',
        origen: 'componente',
        descripcion:
          'Reutiliza el motor de encuestas de Proyecto de Grado. Genera el cuestionario, define muestra, sintetiza resultados plausibles.',
        requisitos: [],
        orden: contador,
      });
    }
  }

  // 3) Bibliografía SIEMPRE cierra (si la guía lo pide, o por default si no)
  const yaTieneBibliografia = fases.some(
    (f) =>
      normalizarTextoParaMatching(f.titulo).includes('bibliografia') ||
      normalizarTextoParaMatching(f.titulo).includes('referencia'),
  );
  if (!yaTieneBibliografia && (guia_analizada.pide_bibliografia || guia_analizada.formato_citas !== 'no_especificado')) {
    contador++;
    fases.push({
      phase_id: `adapt-${String(contador).padStart(3, '0')}`,
      titulo: `Bibliografía ${guia_analizada.formato_citas === 'no_especificado' ? 'APA 7' : guia_analizada.formato_citas}`,
      origen: 'componente',
      descripcion: `Reutiliza el consolidador de referencias ${guia_analizada.formato_citas === 'no_especificado' ? 'APA 7' : guia_analizada.formato_citas} del sistema (mismo que usan Scribe y Proyecto de Grado).`,
      requisitos: [],
      orden: contador,
    });
  }

  return {
    nombre_trabajo,
    guia_analizada,
    matching,
    fases,
    creado_en: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function buscarSeccionCanonicaParaGuia(
  seccionGuia: SeccionRequerida,
  canonicas: SeccionCanonica[],
): SeccionCanonica | undefined {
  const tituloNorm = normalizarTextoParaMatching(seccionGuia.titulo);
  const descNorm = normalizarTextoParaMatching(seccionGuia.descripcion);
  const textoBusqueda = `${tituloNorm} ${descNorm}`;

  for (const sec of canonicas) {
    for (const sinonimo of sec.sinonimos) {
      const sinNorm = normalizarTextoParaMatching(sinonimo);
      if (textoBusqueda.includes(sinNorm)) {
        return sec;
      }
    }
  }
  return undefined;
}

/**
 * Estima cuántas páginas debería ocupar una sección, distribuyendo el total
 * solicitado entre las secciones. Si una sección menciona explícitamente
 * páginas en sus requisitos, se respeta.
 */
function estimarPaginasSeccion(guia: GuiaAnalizada, seccion: SeccionRequerida): string {
  // Buscar mención explícita en requisitos
  for (const req of seccion.requisitos) {
    const reqNorm = req.toLowerCase();
    const matchPaginas = reqNorm.match(/(\d+)\s*(?:a|-)\s*(\d+)\s*(?:p[áa]ginas|pp)/);
    if (matchPaginas) {
      return `${matchPaginas[1]}–${matchPaginas[2]} pp.`;
    }
    const matchUnico = reqNorm.match(/(?:m[íi]nimo|al menos)\s+(\d+)\s*(?:p[áa]ginas|pp)/);
    if (matchUnico) {
      return `≥${matchUnico[1]} pp.`;
    }
  }

  // Sino, distribuir: total dividido entre secciones
  const totalSecciones = guia.secciones.length || 1;
  const promedio = Math.round((guia.paginas_estimadas.min + guia.paginas_estimadas.max) / 2);
  const pp = Math.max(1, Math.round(promedio / totalSecciones));
  return `~${pp} pp.`;
}
