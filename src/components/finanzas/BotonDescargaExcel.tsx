"use client";

/**
 * Botón reutilizable para descargar el proyecto (o una hoja específica) a
 * Excel con formato. Usa lazy import de exceljs y del exportador para no
 * meter ~600KB en el bundle inicial.
 */

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import type { Proyecto } from "@/types/finanzas/proyecto";
import type { HojaIndividual } from "@/lib/finanzas/excel-exporter";

interface Props {
  proyecto: Proyecto;
  hoja?: HojaIndividual;
  etiqueta?: string;
  tono?: "amber" | "neutral" | "compacto";
  /** Sufijo opcional para el nombre del archivo. */
  sufijo?: string;
}

export default function BotonDescargaExcel({ proyecto, hoja, etiqueta, tono = "amber", sufijo }: Props) {
  const [bajando, setBajando] = useState(false);

  async function handleDownload() {
    if (bajando) return;
    setBajando(true);
    try {
      const { exportarLibroCompleto, exportarHoja, descargarWorkbook } = await import(
        "@/lib/finanzas/excel-exporter"
      );
      const wb = hoja
        ? await exportarHoja(proyecto, hoja)
        : await exportarLibroCompleto(proyecto);
      const slug = (proyecto.nombre || "proyecto").replace(/[^a-z0-9\-]+/gi, "_").slice(0, 40);
      const nombre = sufijo
        ? `${slug}_${sufijo}.xlsx`
        : hoja
        ? `${slug}_${hoja}.xlsx`
        : `${slug}_completo.xlsx`;
      await descargarWorkbook(wb, nombre);
    } catch (e) {
      console.error("[Excel] error generando archivo:", e);
      alert("No se pudo generar el Excel. Intenta de nuevo.");
    } finally {
      setBajando(false);
    }
  }

  const claseBase = "inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50";
  const claseTono =
    tono === "amber"
      ? "bg-amber-500 px-3 py-1.5 text-black hover:bg-amber-400"
      : tono === "compacto"
      ? "border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
      : "bg-zinc-800 px-3 py-1.5 text-zinc-200 hover:bg-zinc-700";

  return (
    <button
      onClick={handleDownload}
      disabled={bajando}
      className={`${claseBase} ${claseTono}`}
      title={hoja ? "Descargar solo esta tabla a Excel" : "Descargar el proyecto completo a Excel"}
    >
      {tono === "compacto" ? <FileSpreadsheet className="h-3 w-3" /> : <Download className="h-3.5 w-3.5" />}
      {bajando ? "Generando…" : etiqueta ?? (hoja ? "Excel" : "Descargar Excel")}
    </button>
  );
}
