/**
 * Genera el reporte consolidado del estudio de mercado en Markdown.
 * Sigue la estructura de la clase 13 (resumen → metodología → resultados →
 * demanda → conclusiones). El texto resultante es el ARTEFACTO que el
 * Generador conectado importará al proyecto académico.
 */
import type { ProyectoMercados } from '@/types/mercados';
import {
  analizarPregunta,
  type PreguntaParaAnalisis,
  type RespuestaCruda,
} from './analisis';

export function generarReporteMarkdown(
  proyecto: ProyectoMercados,
  preguntas: PreguntaParaAnalisis[],
  respuestas: RespuestaCruda[]
): string {
  const L: string[] = [];
  const fecha = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });

  L.push(`# Estudio de Mercado — ${proyecto.titulo}`);
  L.push('');
  L.push(`*Generado el ${fecha} con el módulo Mercados de Laboratorio Académico PRO.*`);
  L.push('');

  // 1. Resumen / objetivo
  L.push('## 1. Objetivo de la investigación');
  L.push('');
  L.push(proyecto.objetivo_general || '_(Sin objetivo general definido)_');
  L.push('');
  if (proyecto.objetivos_especificos?.length) {
    L.push('**Objetivos específicos:**');
    L.push('');
    proyecto.objetivos_especificos.forEach((o) => L.push(`- ${o}`));
    L.push('');
  }
  if (proyecto.hipotesis?.length) {
    L.push('**Hipótesis:**');
    L.push('');
    proyecto.hipotesis.forEach((h) => L.push(`- ${h}`));
    L.push('');
  }

  // 2. Metodología
  L.push('## 2. Metodología');
  L.push('');
  const tipoEstudio = proyecto.tipo_estudio
    ? proyecto.tipo_estudio.charAt(0).toUpperCase() + proyecto.tipo_estudio.slice(1)
    : 'No especificado';
  L.push(`- **Tipo de estudio:** ${tipoEstudio}`);
  const ambito = [proyecto.zona, proyecto.municipio, proyecto.departamento].filter(Boolean).join(', ');
  if (ambito) L.push(`- **Ámbito geográfico:** ${ambito}`);
  if (proyecto.universo) L.push(`- **Universo:** ${proyecto.universo.toLocaleString('es-BO')} personas`);
  if (proyecto.tipo_muestreo) L.push(`- **Tipo de muestreo:** ${proyecto.tipo_muestreo}`);
  if (proyecto.nivel_confianza) L.push(`- **Nivel de confianza:** ${Math.round(proyecto.nivel_confianza * 100)}%`);
  if (proyecto.margen_error) L.push(`- **Margen de error:** ±${Math.round(proyecto.margen_error * 100)}%`);
  if (proyecto.tamano_muestra) L.push(`- **Tamaño de muestra calculado:** ${proyecto.tamano_muestra} personas`);
  L.push(`- **Respuestas recolectadas:** ${respuestas.length}`);
  L.push('');

  // 3. Resultados
  L.push('## 3. Resultados');
  L.push('');
  if (respuestas.length === 0) {
    L.push('_Aún no se recolectaron respuestas._');
    L.push('');
  } else {
    preguntas.forEach((p, i) => {
      const r = analizarPregunta(p, respuestas);
      L.push(`### 3.${i + 1}. ${p.texto}`);
      L.push('');
      if (r.tipo === 'categorica') {
        L.push('| Opción | Respuestas | % |');
        L.push('|---|---|---|');
        r.conteos.forEach((c) => L.push(`| ${c.opcion} | ${c.n} | ${c.pct}% |`));
        L.push(`| **Total** | **${r.total}** | |`);
      } else if (r.tipo === 'numerica' && r.stats) {
        L.push(`- Promedio: **${r.stats.promedio.toFixed(1)}**`);
        L.push(`- Mediana: **${r.stats.mediana.toFixed(1)}**`);
        L.push(`- Mínimo: ${r.stats.min} · Máximo: ${r.stats.max} · n = ${r.stats.n}`);
      } else if (r.tipo === 'abierta') {
        L.push(`_${r.respuestas.length} respuestas abiertas (ver detalle en la plataforma)._`);
      }
      L.push('');
    });
  }

  // 4. Variables
  if (proyecto.variables?.length) {
    L.push('## 4. Variables medidas');
    L.push('');
    proyecto.variables.forEach((v) => L.push(`- ${v}`));
    L.push('');
  }

  // 5. Nota de trazabilidad
  L.push('---');
  L.push('');
  L.push(
    '> **Trazabilidad:** este estudio se construyó con datos reales recolectados ' +
      'por el estudiante vía encuesta pública. No son datos inventados. ' +
      'Disponible para importar al Generador de proyectos.'
  );
  L.push('');

  return L.join('\n');
}
