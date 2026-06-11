"use client";

/**
 * Barra de exportación visible en TODOS los pasos del constructor.
 * Ofrece: la tabla del paso actual, el libro completo (12 hojas) y el
 * acceso directo al Modo Demostración. Sirve igual para estudiante,
 * docente y admin — el constructor es el mismo para los tres.
 */

import Link from "next/link";
import { Presentation } from "lucide-react";
import type { Proyecto } from "@/types/finanzas/proyecto";
import type { HojaIndividual } from "@/lib/finanzas/excel-exporter";
import BotonDescargaExcel from "../BotonDescargaExcel";

/** Mapa paso del constructor (1-9) → hoja de Excel correspondiente. */
export const HOJA_POR_PASO: Record<number, { hoja: HojaIndividual; etiqueta: string }> = {
  1: { hoja: "datos", etiqueta: "Datos generales" },
  2: { hoja: "demanda", etiqueta: "Proyección de demanda" },
  3: { hoja: "inversiones", etiqueta: "Inversiones" },
  4: { hoja: "personal", etiqueta: "Personal" },
  5: { hoja: "costos_directos", etiqueta: "Costos directos" },
  6: { hoja: "gastos_operativos", etiqueta: "Gastos operativos" },
  7: { hoja: "financiamiento", etiqueta: "Financiamiento" },
  8: { hoja: "capital_trabajo", etiqueta: "Capital de trabajo" },
  9: { hoja: "resumen", etiqueta: "Resumen del paso 9" },
};

export default function BarraDescargaExcel({
  proyecto,
  paso,
}: {
  proyecto: Proyecto;
  paso: number;
}) {
  const def = HOJA_POR_PASO[paso];
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Exportar este proyecto
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {def && (
          <BotonDescargaExcel
            proyecto={proyecto}
            hoja={def.hoja}
            tono="compacto"
            etiqueta={`Excel: ${def.etiqueta}`}
          />
        )}
        <BotonDescargaExcel
          proyecto={proyecto}
          tono="compacto"
          etiqueta="Excel completo (todas las hojas)"
        />
        <Link
          href={`/finanzas/demostracion/${proyecto.id}`}
          title="Presentación a pantalla completa del análisis financiero (11 láminas)"
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-500/20 dark:text-amber-300"
        >
          <Presentation className="h-3 w-3" />
          Modo demostración
        </Link>
      </div>
    </div>
  );
}
