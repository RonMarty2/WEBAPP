'use client';

import { motion } from 'framer-motion';

const LINEAS_DEMO = [
  'Cosiendo Resumen Ejecutivo con datos del Plan Financiero…',
  'Generando Introducción a partir de PESTEL y Estudio de Mercado…',
  'Redactando Marco Teórico de la modalidad Pre-Factibilidad…',
  'Importando análisis PESTEL como sección 2.1 Macroentorno…',
  'Insertando Estudio de Mercado (n=384) como sección 2.5…',
  'Vinculando Plan Financiero (VAN Bs. 124,580) a la sección 3.4…',
  'Aplicando formato Roxana Beltrán de UNIFRANZ…',
  'Generando bibliografía APA 7 con apellidos en minúscula…',
  'Renderizando gráficos pgfplots vectoriales…',
  'Validando coherencia entre fases con el guardián anti-alucinación…',
  '✓ Documento listo para defensa.',
];

export function IAConsolidacionPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-sm text-emerald-300">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="font-mono text-xs text-emerald-200">IA consolidando…</span>
      </div>
      <ol className="space-y-1.5 font-mono text-xs leading-relaxed">
        {LINEAS_DEMO.map((linea, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.45, duration: 0.3 }}
            className={linea.startsWith('✓') ? 'mt-3 font-bold text-emerald-400' : ''}
          >
            {linea.startsWith('✓') ? linea : `> ${linea}`}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
