/**
 * Exportador a Excel del proyecto financiero — sesión 13.
 *
 * Genera un archivo .xlsx con todas las tablas del modelo, con formato
 * (header ámbar, bordes, columnas dimensionadas, números en es-BO). Cada
 * hoja se puede editar libremente en Excel y luego copiar/pegar a Word
 * conservando el formato.
 *
 * Se usa desde el cliente vía dynamic import:
 *   const { exportarLibroCompleto } = await import("@/lib/finanzas/excel-exporter");
 *
 * Cero side effects en módulo: solo genera el Workbook en memoria.
 */

import type { Workbook, Worksheet } from "exceljs";
import type { Proyecto, CategoriaInversion } from "@/types/finanzas/proyecto";
import { construirFlujoCaja } from "./flujo-proyecto";
import { calcularTributacion } from "./demostracion";
import {
  calcularVAN,
  calcularTIR,
  calcularPayback,
  calcularIR,
  calcularRBC,
} from "./calculo-financiero";

// ── Estilos comunes ──────────────────────────────────────────────────────────

const COLOR_TITULO_FILL = "FFF59E0B"; // ámbar 500
const COLOR_TITULO_TEXT = "FF000000";
const COLOR_HEADER_FILL = "FF1F2937"; // gris oscuro
const COLOR_HEADER_TEXT = "FFFFFFFF";
const COLOR_TOTAL_FILL = "FFFEF3C7"; // ámbar claro
const COLOR_BORDER = "FF9CA3AF"; // gris medio

const FMT_BOLIVIANOS = '_-"Bs" * #,##0.00_-;-"Bs" * #,##0.00_-;_-"Bs" * "-"??_-;_-@_-';
const FMT_NUMERO = "#,##0";
const FMT_PORCENTAJE = "0.00%";
const FMT_DECIMAL = "0.00";

const REGIMEN_LABEL: Record<string, string> = {
  general: "Régimen General",
  rts: "Régimen Tributario Simplificado (RTS)",
  rau: "Régimen Agropecuario Unificado (RAU)",
  sin_actividad: "Sin actividad fiscal (caso académico)",
};

const SECTOR_LABEL: Record<string, string> = {
  produccion: "Producción",
  comercio: "Comercio",
  servicios: "Servicios",
  agricultura: "Agricultura",
  mixto: "Mixto",
};

const CATEGORIA_INVERSION_LABEL: Record<CategoriaInversion, string> = {
  terreno: "Terreno",
  obrasCiviles: "Obras civiles",
  maquinaria: "Maquinaria y equipos",
  mobiliario: "Mobiliario",
  activoDiferido: "Activo diferido (intangibles)",
};

// ── Helpers de estilo ────────────────────────────────────────────────────────

function aplicarTituloHoja(ws: Worksheet, titulo: string, ancho: number): void {
  ws.mergeCells(1, 1, 1, ancho);
  const celda = ws.getCell(1, 1);
  celda.value = titulo;
  celda.font = { bold: true, size: 14, color: { argb: COLOR_TITULO_TEXT } };
  celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_TITULO_FILL } };
  celda.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 26;
}

function aplicarHeaderFila(ws: Worksheet, fila: number, columnas: number): void {
  const row = ws.getRow(fila);
  row.eachCell({ includeEmpty: false }, (celda, col) => {
    if (col > columnas) return;
    celda.font = { bold: true, color: { argb: COLOR_HEADER_TEXT } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER_FILL } };
    celda.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    celda.border = bordeFino();
  });
  row.height = 22;
}

function aplicarBordeBloque(ws: Worksheet, filaIni: number, filaFin: number, colIni: number, colFin: number): void {
  for (let r = filaIni; r <= filaFin; r++) {
    for (let c = colIni; c <= colFin; c++) {
      const celda = ws.getCell(r, c);
      celda.border = bordeFino();
    }
  }
}

function aplicarFilaTotal(ws: Worksheet, fila: number, columnas: number): void {
  const row = ws.getRow(fila);
  row.eachCell({ includeEmpty: false }, (celda, col) => {
    if (col > columnas) return;
    celda.font = { bold: true };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_TOTAL_FILL } };
    celda.border = bordeFino();
  });
}

function bordeFino() {
  return {
    top: { style: "thin" as const, color: { argb: COLOR_BORDER } },
    bottom: { style: "thin" as const, color: { argb: COLOR_BORDER } },
    left: { style: "thin" as const, color: { argb: COLOR_BORDER } },
    right: { style: "thin" as const, color: { argb: COLOR_BORDER } },
  };
}

// ── Hojas ────────────────────────────────────────────────────────────────────

async function nuevoWorkbook(): Promise<Workbook> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Laboratorio Académico PRO";
  wb.created = new Date();
  return wb;
}

export async function hojaDatosGenerales(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Datos generales", { properties: { tabColor: { argb: COLOR_TITULO_FILL } } });
  ws.columns = [
    { width: 28 },
    { width: 60 },
  ];
  aplicarTituloHoja(ws, "Datos generales del proyecto", 2);

  const filas: Array<[string, string]> = [
    ["Nombre", p.nombre || "—"],
    ["Ubicación", p.ubicacion || "—"],
    ["Sector", SECTOR_LABEL[p.sector] ?? p.sector],
    ["Descripción", p.descripcion || "—"],
    ["Régimen tributario", REGIMEN_LABEL[p.tributacion?.regimen ?? "sin_actividad"]],
  ];
  if (p.tributacion?.regimen === "rts" && p.tributacion.categoriaRts) {
    filas.push(["Categoría RTS", `Categoría ${p.tributacion.categoriaRts}`]);
  }
  if (p.tributacion?.regimen === "rau" && p.tributacion.hectareasRau) {
    filas.push(["Hectáreas RAU", String(p.tributacion.hectareasRau)]);
  }
  filas.push(["Versión del modelo", p.version ?? "v1"]);
  filas.push(["Modelo de ingreso", p.modeloIngreso ?? "unidades"]);

  filas.forEach(([k, v], i) => {
    const fila = 3 + i;
    ws.getCell(fila, 1).value = k;
    ws.getCell(fila, 1).font = { bold: true };
    ws.getCell(fila, 2).value = v;
    ws.getCell(fila, 2).alignment = { wrapText: true, vertical: "top" };
  });
  aplicarBordeBloque(ws, 3, 2 + filas.length, 1, 2);
  return ws;
}

export async function hojaInversiones(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Inversión inicial");
  ws.columns = [
    { width: 22 }, // Categoría
    { width: 32 }, // Descripción
    { width: 10 }, // Unidad
    { width: 10 }, // Cantidad
    { width: 16 }, // Costo unit.
    { width: 16 }, // Costo total
    { width: 12 }, // Vida útil
    { width: 16 }, // Dep./año
    { width: 16 }, // Valor residual
    { width: 10 }, // Con factura
  ];
  aplicarTituloHoja(ws, "Inversión inicial — detalle por categoría", 10);

  ws.getRow(3).values = [
    "Categoría",
    "Descripción",
    "Unidad",
    "Cantidad",
    "Costo unit.",
    "Costo total",
    "Vida útil (años)",
    "Depreciación anual",
    "Valor residual",
    "Con factura",
  ];
  aplicarHeaderFila(ws, 3, 10);

  let fila = 4;
  let totalInversion = 0;
  let totalDepreciacion = 0;
  let totalResidual = 0;
  (Object.keys(CATEGORIA_INVERSION_LABEL) as CategoriaInversion[]).forEach((cat) => {
    const items = p.inversiones?.[cat] ?? [];
    items.forEach((it) => {
      ws.getCell(fila, 1).value = CATEGORIA_INVERSION_LABEL[cat];
      ws.getCell(fila, 2).value = it.descripcion || "—";
      ws.getCell(fila, 3).value = it.unidadMedida || "—";
      ws.getCell(fila, 4).value = it.cantidad;
      ws.getCell(fila, 4).numFmt = FMT_NUMERO;
      ws.getCell(fila, 5).value = it.costoUnitario;
      ws.getCell(fila, 5).numFmt = FMT_BOLIVIANOS;
      ws.getCell(fila, 6).value = it.costoTotal;
      ws.getCell(fila, 6).numFmt = FMT_BOLIVIANOS;
      ws.getCell(fila, 7).value = it.vidaUtilAnios ?? "—";
      ws.getCell(fila, 8).value = it.depreciacionAnual ?? 0;
      ws.getCell(fila, 8).numFmt = FMT_BOLIVIANOS;
      ws.getCell(fila, 9).value = it.valorResidual ?? 0;
      ws.getCell(fila, 9).numFmt = FMT_BOLIVIANOS;
      ws.getCell(fila, 10).value = it.conFactura ? "Sí" : "No";
      ws.getCell(fila, 10).alignment = { horizontal: "center" };
      totalInversion += it.costoTotal;
      totalDepreciacion += it.depreciacionAnual ?? 0;
      totalResidual += it.valorResidual ?? 0;
      fila++;
    });
  });

  if (fila === 4) {
    ws.getCell(fila, 1).value = "Sin inversiones cargadas";
    ws.getCell(fila, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    fila++;
  } else {
    ws.getCell(fila, 1).value = "TOTAL";
    ws.getCell(fila, 6).value = totalInversion;
    ws.getCell(fila, 6).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 8).value = totalDepreciacion;
    ws.getCell(fila, 8).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 9).value = totalResidual;
    ws.getCell(fila, 9).numFmt = FMT_BOLIVIANOS;
    aplicarFilaTotal(ws, fila, 10);
    fila++;
  }
  aplicarBordeBloque(ws, 3, fila - 1, 1, 10);
  return ws;
}

export async function hojaProyeccionDemanda(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Proyección de demanda");
  ws.columns = [
    { width: 28 }, // Producto
    { width: 14 }, // Unidad
    { width: 12 }, // Tipo (cantidad/precio)
    { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 },
    { width: 10 }, // Emite factura
  ];
  aplicarTituloHoja(ws, "Proyección de demanda — 5 años", 9);

  ws.getRow(3).values = ["Producto", "Unidad", "Variable", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "Emite factura"];
  aplicarHeaderFila(ws, 3, 9);

  let fila = 4;
  const totalesIngresos: number[] = [0, 0, 0, 0, 0];
  (p.productos ?? []).forEach((prod) => {
    ws.getCell(fila, 1).value = prod.nombre || "(sin nombre)";
    ws.getCell(fila, 1).font = { bold: true };
    ws.getCell(fila, 2).value = prod.unidadMedida || "—";
    ws.getCell(fila, 3).value = "Cantidad";
    for (let i = 0; i < 5; i++) {
      ws.getCell(fila, 4 + i).value = prod.cantidades[i] ?? 0;
      ws.getCell(fila, 4 + i).numFmt = FMT_NUMERO;
    }
    ws.getCell(fila, 9).value = prod.emiteFactura ? "Sí" : "No";
    ws.getCell(fila, 9).alignment = { horizontal: "center" };
    fila++;

    ws.getCell(fila, 3).value = "Precio (Bs)";
    for (let i = 0; i < 5; i++) {
      ws.getCell(fila, 4 + i).value = prod.precios[i] ?? 0;
      ws.getCell(fila, 4 + i).numFmt = FMT_BOLIVIANOS;
    }
    fila++;

    ws.getCell(fila, 3).value = "Ingreso (Bs)";
    for (let i = 0; i < 5; i++) {
      const ing = (prod.cantidades[i] ?? 0) * (prod.precios[i] ?? 0);
      ws.getCell(fila, 4 + i).value = ing;
      ws.getCell(fila, 4 + i).numFmt = FMT_BOLIVIANOS;
      totalesIngresos[i] += ing;
    }
    aplicarFilaTotal(ws, fila, 9);
    fila++;
  });

  if ((p.productos ?? []).length === 0) {
    ws.getCell(fila, 1).value = "Sin productos cargados";
    ws.getCell(fila, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    fila++;
  } else {
    ws.getCell(fila, 1).value = "TOTAL INGRESOS";
    ws.getCell(fila, 1).font = { bold: true };
    for (let i = 0; i < 5; i++) {
      ws.getCell(fila, 4 + i).value = totalesIngresos[i];
      ws.getCell(fila, 4 + i).numFmt = FMT_BOLIVIANOS;
    }
    aplicarFilaTotal(ws, fila, 9);
    fila++;
  }
  aplicarBordeBloque(ws, 3, fila - 1, 1, 9);
  return ws;
}

export async function hojaCostosDirectos(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Costos directos");
  ws.columns = [
    { width: 28 }, // Producto
    { width: 18 }, // Categoría
    { width: 30 }, // Descripción
    { width: 12 }, // Unidad
    { width: 14 }, // Cantidad/u
    { width: 14 }, // Costo unit.
    { width: 16 }, // Subtotal/u
    { width: 10 }, // Con factura
  ];
  aplicarTituloHoja(ws, "Costos directos de producción", 8);

  ws.getRow(3).values = ["Producto", "Categoría", "Descripción", "Unidad", "Cant./u", "Costo unit. (Bs)", "Subtotal/u (Bs)", "Con factura"];
  aplicarHeaderFila(ws, 3, 8);

  const productos = p.productos ?? [];
  const nombrePorId: Record<string, string> = {};
  productos.forEach((pr) => { nombrePorId[pr.id] = pr.nombre || "(sin nombre)"; });

  let fila = 4;
  let totalUnit = 0;
  (p.costosDirectos ?? []).forEach((c) => {
    const subtotalUnit = c.cantidadPorUnidad * c.costoUnitario;
    ws.getCell(fila, 1).value = nombrePorId[c.productoId ?? ""] ?? "Genérico";
    ws.getCell(fila, 2).value = c.categoria;
    ws.getCell(fila, 3).value = c.descripcion || "—";
    ws.getCell(fila, 4).value = c.unidadMedida || "—";
    ws.getCell(fila, 5).value = c.cantidadPorUnidad;
    ws.getCell(fila, 5).numFmt = FMT_DECIMAL;
    ws.getCell(fila, 6).value = c.costoUnitario;
    ws.getCell(fila, 6).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 7).value = subtotalUnit;
    ws.getCell(fila, 7).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 8).value = c.conFactura ? "Sí" : "No";
    ws.getCell(fila, 8).alignment = { horizontal: "center" };
    totalUnit += subtotalUnit;
    fila++;
  });

  if ((p.costosDirectos ?? []).length === 0) {
    ws.getCell(fila, 1).value = "Sin costos directos cargados";
    ws.getCell(fila, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    fila++;
  } else {
    ws.getCell(fila, 1).value = "TOTAL costo unitario consolidado";
    ws.getCell(fila, 7).value = totalUnit;
    ws.getCell(fila, 7).numFmt = FMT_BOLIVIANOS;
    aplicarFilaTotal(ws, fila, 8);
    fila++;
  }
  aplicarBordeBloque(ws, 3, fila - 1, 1, 8);
  return ws;
}

export async function hojaGastosOperativos(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Gastos operativos");
  ws.columns = [
    { width: 18 }, // Tipo
    { width: 32 }, // Descripción
    { width: 12 }, // Unidad
    { width: 12 }, // Cantidad
    { width: 16 }, // Costo unit.
    { width: 16 }, // Total anual
    { width: 10 }, // Con factura
  ];
  aplicarTituloHoja(ws, "Gastos administrativos y de comercialización", 7);

  ws.getRow(3).values = ["Tipo", "Descripción", "Unidad", "Cantidad", "Costo unit.", "Total anual", "Con factura"];
  aplicarHeaderFila(ws, 3, 7);

  let fila = 4;
  let totalAdmin = 0;
  let totalComerc = 0;
  const escribirBloque = (tipo: string, items: Proyecto["costosAdministracion"], acumulador: { v: number }) => {
    items.forEach((c) => {
      const factor = c.unidadMedida === "mes" ? 12 : 1;
      const total = c.cantidad * c.costoUnitario * factor;
      ws.getCell(fila, 1).value = tipo;
      ws.getCell(fila, 2).value = c.descripcion || "—";
      ws.getCell(fila, 3).value = c.unidadMedida;
      ws.getCell(fila, 4).value = c.cantidad;
      ws.getCell(fila, 4).numFmt = FMT_NUMERO;
      ws.getCell(fila, 5).value = c.costoUnitario;
      ws.getCell(fila, 5).numFmt = FMT_BOLIVIANOS;
      ws.getCell(fila, 6).value = total;
      ws.getCell(fila, 6).numFmt = FMT_BOLIVIANOS;
      ws.getCell(fila, 7).value = c.conFactura ? "Sí" : "No";
      ws.getCell(fila, 7).alignment = { horizontal: "center" };
      acumulador.v += total;
      fila++;
    });
  };

  const accAdmin = { v: 0 };
  escribirBloque("Administración", p.costosAdministracion ?? [], accAdmin);
  totalAdmin = accAdmin.v;

  const accComerc = { v: 0 };
  escribirBloque("Comercialización", p.costosComercializacion ?? [], accComerc);
  totalComerc = accComerc.v;

  if ((p.costosAdministracion ?? []).length === 0 && (p.costosComercializacion ?? []).length === 0) {
    ws.getCell(fila, 1).value = "Sin gastos operativos cargados";
    ws.getCell(fila, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    fila++;
  } else {
    ws.getCell(fila, 1).value = "TOTAL anual (Admin + Comercial)";
    ws.getCell(fila, 6).value = totalAdmin + totalComerc;
    ws.getCell(fila, 6).numFmt = FMT_BOLIVIANOS;
    aplicarFilaTotal(ws, fila, 7);
    fila++;
  }
  aplicarBordeBloque(ws, 3, fila - 1, 1, 7);
  return ws;
}

export async function hojaPersonal(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Personal");
  ws.columns = [
    { width: 32 }, // Puesto
    { width: 12 }, // Cantidad
    { width: 16 }, // Sueldo mensual
    { width: 16 }, // Sueldo total mensual
    { width: 16 }, // Aportes patronales (30.37%)
    { width: 18 }, // Costo total mensual
    { width: 18 }, // Costo anual
  ];
  aplicarTituloHoja(ws, "Personal — sueldos + aportes patronales 30.37%", 7);

  ws.getRow(3).values = [
    "Puesto",
    "Cantidad",
    "Sueldo mensual",
    "Sueldo total mensual",
    "Aportes patronales",
    "Costo total mensual",
    "Costo anual",
  ];
  aplicarHeaderFila(ws, 3, 7);

  const ap = p.aportesPatronalesOverride;
  const tasaAportes = ap
    ? (ap.riesgoProfesional ?? 0.0171)
      + (ap.seguroSalud ?? 0.10)
      + (ap.provisionVivienda ?? 0.02)
      + (ap.previsionAguinaldo ?? 0.0833)
      + (ap.previsionIndemnizacion ?? 0.0833)
    : 0.3037;

  let fila = 4;
  let totalAnual = 0;
  (p.personal ?? []).forEach((puesto) => {
    const totalMensual = puesto.cantidad * puesto.sueldoMensual;
    const aportes = totalMensual * tasaAportes;
    const costoMensual = totalMensual + aportes;
    const costoAnual = costoMensual * 12;
    ws.getCell(fila, 1).value = puesto.puesto || "—";
    ws.getCell(fila, 2).value = puesto.cantidad;
    ws.getCell(fila, 2).numFmt = FMT_NUMERO;
    ws.getCell(fila, 3).value = puesto.sueldoMensual;
    ws.getCell(fila, 3).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 4).value = totalMensual;
    ws.getCell(fila, 4).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 5).value = aportes;
    ws.getCell(fila, 5).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 6).value = costoMensual;
    ws.getCell(fila, 6).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 7).value = costoAnual;
    ws.getCell(fila, 7).numFmt = FMT_BOLIVIANOS;
    totalAnual += costoAnual;
    fila++;
  });

  if ((p.personal ?? []).length === 0) {
    ws.getCell(fila, 1).value = "Sin personal cargado";
    ws.getCell(fila, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    fila++;
  } else {
    ws.getCell(fila, 1).value = `TOTAL anual (incluye aportes ${(tasaAportes * 100).toFixed(2)}%)`;
    ws.getCell(fila, 7).value = totalAnual;
    ws.getCell(fila, 7).numFmt = FMT_BOLIVIANOS;
    aplicarFilaTotal(ws, fila, 7);
    fila++;
  }
  aplicarBordeBloque(ws, 3, fila - 1, 1, 7);
  return ws;
}

export async function hojaFinanciamiento(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Financiamiento");
  ws.columns = [
    { width: 14 }, // Año
    { width: 16 }, // Saldo inicial
    { width: 16 }, // Cuota anual
    { width: 16 }, // Interés
    { width: 16 }, // Amortización
    { width: 16 }, // Saldo final
  ];
  aplicarTituloHoja(ws, "Tabla de amortización del préstamo (activo fijo)", 6);

  const f = p.financiamiento ?? {
    porcentajePropio: 1,
    porcentajePrestamo: 0,
    tasaInteresAnual: 0,
    plazoMeses: 60,
    costoOportunidadAccionista: 0.12,
  };
  const inversionTotal = Object.values(p.inversiones ?? {}).flat().reduce((s, it) => s + (it.costoTotal ?? 0), 0);
  const monto = inversionTotal * (f.porcentajePrestamo ?? 0);
  const tasaAnual = f.tasaInteresAnual ?? 0;
  const plazoAnios = Math.max(1, Math.round((f.plazoMeses ?? 60) / 12));

  ws.getCell(3, 1).value = `Monto del préstamo: Bs ${monto.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  ws.getCell(3, 1).font = { italic: true };
  ws.mergeCells(3, 1, 3, 6);

  ws.getRow(4).values = ["Año", "Saldo inicial", "Cuota anual", "Interés", "Amortización", "Saldo final"];
  aplicarHeaderFila(ws, 4, 6);

  if (monto <= 0 || tasaAnual <= 0) {
    ws.getCell(5, 1).value = "Sin préstamo de activo fijo (financiamiento 100% propio).";
    ws.getCell(5, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    ws.mergeCells(5, 1, 5, 6);
    aplicarBordeBloque(ws, 4, 5, 1, 6);
    return ws;
  }

  // Cuota anual constante (sistema francés simple, anualizado).
  const cuota = (monto * tasaAnual) / (1 - Math.pow(1 + tasaAnual, -plazoAnios));
  let saldo = monto;
  for (let i = 0; i < plazoAnios; i++) {
    const fila = 5 + i;
    const interes = saldo * tasaAnual;
    const amort = cuota - interes;
    ws.getCell(fila, 1).value = `Año ${i + 1}`;
    ws.getCell(fila, 2).value = saldo;
    ws.getCell(fila, 3).value = cuota;
    ws.getCell(fila, 4).value = interes;
    ws.getCell(fila, 5).value = amort;
    saldo = Math.max(0, saldo - amort);
    ws.getCell(fila, 6).value = saldo;
    for (let c = 2; c <= 6; c++) ws.getCell(fila, c).numFmt = FMT_BOLIVIANOS;
  }
  aplicarBordeBloque(ws, 4, 4 + plazoAnios, 1, 6);
  return ws;
}

interface FlujoData {
  ingresos: number[];
  costosProduccion: number[];
  gastosAdmin: number[];
  gastosComerc: number[];
  personal: number[];
  depreciacion: number[];
  imprevistos: number[];
  intereses: number[];
  amortizacion: number[];
  utilidadAAI: number[];
  impuestos: number[];
  utilidadNeta: number[];
  flujoCaja: number[];
  reinversionPorAnio: number[];
  valorResidual: number;
  inversionInicial: number;
  capitalTrabajo: number;
  montoPrestamo: number;
  wacc: number;
  indicadores: { van: number; tir: number; payback: number; ir: number; trc: number; sd: number; rbc: number };
}

export async function hojaFlujoCaja(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Flujo de caja");
  ws.columns = [
    { width: 32 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 },
  ];
  aplicarTituloHoja(ws, "Flujo de caja proyectado", 7);

  ws.getRow(3).values = ["Concepto", "Año 0", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"];
  aplicarHeaderFila(ws, 3, 7);

  const flujo = construirFlujoCaja(p) as unknown as FlujoData;
  type Linea = { label: string; valores: (number | string)[]; bold?: boolean; total?: boolean };
  const lineas: Linea[] = [
    { label: "Ingresos por ventas", valores: ["", ...flujo.ingresos] },
    { label: "(−) Costos de producción", valores: ["", ...flujo.costosProduccion.map((v) => -v)] },
    { label: "(−) Personal", valores: ["", ...flujo.personal.map((v) => -v)] },
    { label: "(−) Gastos administrativos", valores: ["", ...flujo.gastosAdmin.map((v) => -v)] },
    { label: "(−) Gastos de comercialización", valores: ["", ...flujo.gastosComerc.map((v) => -v)] },
    { label: "(−) Imprevistos", valores: ["", ...flujo.imprevistos.map((v) => -v)] },
    { label: "(−) Depreciación", valores: ["", ...flujo.depreciacion.map((v) => -v)] },
    { label: "(−) Intereses del préstamo", valores: ["", ...flujo.intereses.map((v) => -v)] },
    { label: "= Utilidad antes de impuestos", valores: ["", ...flujo.utilidadAAI], bold: true },
    { label: "(−) Impuestos (IVA + IT + IUE / cuota fija)", valores: ["", ...flujo.impuestos.map((v) => -v)] },
    { label: "= Utilidad neta", valores: ["", ...flujo.utilidadNeta], bold: true },
    { label: "(+) Depreciación (no es salida de caja)", valores: ["", ...flujo.depreciacion] },
    { label: "(−) Amortización del préstamo", valores: ["", ...flujo.amortizacion.map((v) => -v)] },
    { label: "(−) Reinversión", valores: ["", ...flujo.reinversionPorAnio.map((v) => -v)] },
    { label: "Inversión inicial", valores: [-flujo.inversionInicial, "", "", "", "", ""] },
    { label: "Capital de trabajo", valores: [-flujo.capitalTrabajo, "", "", "", "", ""] },
    { label: "Préstamo recibido", valores: [flujo.montoPrestamo, "", "", "", "", ""] },
    { label: "Valor residual al final", valores: ["", "", "", "", "", flujo.valorResidual] },
    { label: "FLUJO DE CAJA NETO", valores: [-(flujo.inversionInicial + flujo.capitalTrabajo - flujo.montoPrestamo), ...flujo.flujoCaja], bold: true, total: true },
  ];

  let fila = 4;
  lineas.forEach((ln) => {
    ws.getCell(fila, 1).value = ln.label;
    if (ln.bold) ws.getCell(fila, 1).font = { bold: true };
    ln.valores.forEach((v, i) => {
      ws.getCell(fila, 2 + i).value = v === "" ? null : v;
      ws.getCell(fila, 2 + i).numFmt = FMT_BOLIVIANOS;
    });
    if (ln.total) aplicarFilaTotal(ws, fila, 7);
    fila++;
  });
  aplicarBordeBloque(ws, 3, fila - 1, 1, 7);
  return ws;
}

export async function hojaCargaTributaria(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Carga tributaria");
  ws.columns = [
    { width: 32 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 18 },
  ];
  aplicarTituloHoja(ws, "Carga tributaria boliviana — Ley 843", 7);

  const trib = calcularTributacion(p);
  ws.getCell(3, 1).value = `Régimen: ${REGIMEN_LABEL[trib.regimen]}`;
  ws.getCell(3, 1).font = { italic: true };
  ws.mergeCells(3, 1, 3, 7);

  ws.getRow(4).values = ["Concepto", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5", "Total"];
  aplicarHeaderFila(ws, 4, 7);

  let fila = 5;
  const escribirSerie = (label: string, serie: { valor: number }[], bold = false) => {
    ws.getCell(fila, 1).value = label;
    if (bold) ws.getCell(fila, 1).font = { bold: true };
    let total = 0;
    serie.forEach((v, i) => {
      ws.getCell(fila, 2 + i).value = v.valor;
      ws.getCell(fila, 2 + i).numFmt = FMT_BOLIVIANOS;
      total += v.valor;
    });
    ws.getCell(fila, 7).value = total;
    ws.getCell(fila, 7).numFmt = FMT_BOLIVIANOS;
    ws.getCell(fila, 7).font = { bold: true };
    fila++;
  };

  if (trib.regimen === "general") {
    escribirSerie("IVA a pagar (13% débito − crédito)", trib.serieIVA);
    escribirSerie("Impuesto a las Transacciones (3%)", trib.serieIT);
    escribirSerie("Carga tributaria total", trib.cargaPorAnio, true);
    aplicarFilaTotal(ws, fila - 1, 7);
  } else if (trib.regimen === "rts" || trib.regimen === "rau") {
    escribirSerie(trib.regimen === "rts" ? "Cuota RTS bimensual × 6" : "Cuota RAU anual", trib.serieCuota, true);
    aplicarFilaTotal(ws, fila - 1, 7);
  } else {
    ws.getCell(fila, 1).value = "El proyecto está en 'sin actividad fiscal'. No aplica IVA, IT ni IUE.";
    ws.getCell(fila, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    fila++;
  }
  aplicarBordeBloque(ws, 4, fila - 1, 1, 7);
  return ws;
}

export async function hojaIndicadores(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Indicadores");
  ws.columns = [
    { width: 36 },
    { width: 20 },
    { width: 50 },
  ];
  aplicarTituloHoja(ws, "Indicadores de viabilidad financiera", 3);

  const flujo = construirFlujoCaja(p) as unknown as FlujoData;
  const inversionInicial = flujo.inversionInicial + (flujo.capitalTrabajo ?? 0);
  const flujosVan = [-inversionInicial, ...(flujo.flujoCaja ?? [])];
  const tasa = flujo.wacc ?? p.financiamiento?.costoOportunidadAccionista ?? 0.12;

  let van = 0, tir: number | null = null, payback = 0, ir = 0, rbc = 0;
  try { van = calcularVAN(flujosVan, tasa); } catch {}
  try { tir = calcularTIR(flujosVan); } catch {}
  try { payback = calcularPayback(flujosVan); } catch {}
  try { ir = calcularIR(flujosVan, tasa); } catch {}
  try { rbc = calcularRBC(flujo.ingresos ?? [], flujo.costosProduccion ?? [], tasa); } catch {}

  ws.getRow(3).values = ["Indicador", "Valor", "Interpretación"];
  aplicarHeaderFila(ws, 3, 3);

  const filas: Array<[string, number | string, string, string?]> = [
    ["VAN (Valor Actual Neto)", van, van > 0 ? "✓ Crea valor económico" : "✗ Destruye valor", FMT_BOLIVIANOS],
    ["TIR (Tasa Interna de Retorno)", tir !== null ? tir : "—", tir !== null && tir > tasa ? "✓ Supera el costo del capital" : "✗ Por debajo del costo del capital", FMT_PORCENTAJE],
    ["Payback (años)", payback, payback > 0 && payback < 5 ? "✓ Recuperación dentro del horizonte" : "⚠ Recuperación lenta", FMT_DECIMAL],
    ["Índice de rentabilidad (IR)", ir, ir > 1 ? "✓ Cada Bs invertido devuelve más de 1" : "✗ No supera la inversión", FMT_DECIMAL],
    ["Relación beneficio/costo (B/C)", rbc, rbc > 1 ? "✓ Beneficios superan los costos" : "✗ Costos superan beneficios", FMT_DECIMAL],
    ["Tasa de descuento (WACC)", tasa, "Costo promedio ponderado del capital", FMT_PORCENTAJE],
  ];
  filas.forEach(([k, v, c, fmt], i) => {
    const fila = 4 + i;
    ws.getCell(fila, 1).value = k;
    ws.getCell(fila, 1).font = { bold: true };
    ws.getCell(fila, 2).value = v;
    if (fmt) ws.getCell(fila, 2).numFmt = fmt;
    ws.getCell(fila, 3).value = c;
    ws.getCell(fila, 3).alignment = { wrapText: true };
  });
  aplicarBordeBloque(ws, 3, 3 + filas.length, 1, 3);
  return ws;
}

export async function hojaPuntoEquilibrio(wb: Workbook, p: Proyecto): Promise<Worksheet> {
  const ws = wb.addWorksheet("Punto de equilibrio");
  ws.columns = [{ width: 36 }, { width: 22 }];
  aplicarTituloHoja(ws, "Punto de equilibrio (año 1)", 2);

  const prod = p.productos?.[0];
  const precio = prod?.precios?.[0] ?? 0;
  const cantidad = prod?.cantidades?.[0] ?? 0;
  const costoVarUnit = (p.costosDirectos ?? [])
    .filter((c) => !c.productoId || c.productoId === prod?.id)
    .reduce((s, c) => s + c.cantidadPorUnidad * c.costoUnitario, 0);
  const costoFijo =
    (p.costosAdministracion ?? []).reduce((s, c) => s + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1), 0) +
    (p.costosComercializacion ?? []).reduce((s, c) => s + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1), 0);

  if (!prod || precio <= costoVarUnit) {
    ws.getCell(3, 1).value = "Sin datos suficientes para calcular punto de equilibrio.";
    ws.getCell(3, 1).font = { italic: true, color: { argb: "FF6B7280" } };
    ws.mergeCells(3, 1, 3, 2);
    return ws;
  }
  const unidades = costoFijo / (precio - costoVarUnit);
  const ingreso = unidades * precio;

  const filas: Array<[string, number | string, string?]> = [
    ["Producto de referencia", prod.nombre || "—"],
    ["Precio unitario (Año 1)", precio, FMT_BOLIVIANOS],
    ["Costo variable unitario", costoVarUnit, FMT_BOLIVIANOS],
    ["Margen unitario", precio - costoVarUnit, FMT_BOLIVIANOS],
    ["Costo fijo anual (Admin + Comerc)", costoFijo, FMT_BOLIVIANOS],
    ["Unidades de equilibrio", Math.ceil(unidades), FMT_NUMERO],
    ["Ingreso de equilibrio", ingreso, FMT_BOLIVIANOS],
    ["Cantidad proyectada (Año 1)", cantidad, FMT_NUMERO],
    ["Margen de seguridad", cantidad > 0 ? (cantidad - unidades) / cantidad : 0, FMT_PORCENTAJE],
  ];
  filas.forEach(([k, v, fmt], i) => {
    const fila = 3 + i;
    ws.getCell(fila, 1).value = k;
    ws.getCell(fila, 1).font = { bold: true };
    ws.getCell(fila, 2).value = v;
    if (fmt) ws.getCell(fila, 2).numFmt = fmt;
  });
  aplicarBordeBloque(ws, 3, 2 + filas.length, 1, 2);
  return ws;
}

// ── API pública ──────────────────────────────────────────────────────────────

export async function exportarLibroCompleto(p: Proyecto): Promise<Workbook> {
  const wb = await nuevoWorkbook();
  await hojaDatosGenerales(wb, p);
  await hojaInversiones(wb, p);
  await hojaProyeccionDemanda(wb, p);
  await hojaCostosDirectos(wb, p);
  await hojaGastosOperativos(wb, p);
  await hojaPersonal(wb, p);
  await hojaFinanciamiento(wb, p);
  await hojaFlujoCaja(wb, p);
  await hojaCargaTributaria(wb, p);
  await hojaIndicadores(wb, p);
  await hojaPuntoEquilibrio(wb, p);
  return wb;
}

export type HojaIndividual =
  | "inversiones"
  | "demanda"
  | "costos_directos"
  | "gastos_operativos"
  | "personal"
  | "financiamiento"
  | "flujo_caja"
  | "tributacion"
  | "indicadores"
  | "equilibrio";

const GENERADORES: Record<HojaIndividual, (wb: Workbook, p: Proyecto) => Promise<Worksheet>> = {
  inversiones: hojaInversiones,
  demanda: hojaProyeccionDemanda,
  costos_directos: hojaCostosDirectos,
  gastos_operativos: hojaGastosOperativos,
  personal: hojaPersonal,
  financiamiento: hojaFinanciamiento,
  flujo_caja: hojaFlujoCaja,
  tributacion: hojaCargaTributaria,
  indicadores: hojaIndicadores,
  equilibrio: hojaPuntoEquilibrio,
};

export async function exportarHoja(p: Proyecto, hoja: HojaIndividual): Promise<Workbook> {
  const wb = await nuevoWorkbook();
  await hojaDatosGenerales(wb, p);
  await GENERADORES[hoja](wb, p);
  return wb;
}

/** Dispara la descarga del workbook en el navegador. */
export async function descargarWorkbook(wb: Workbook, nombreArchivo: string): Promise<void> {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo.endsWith(".xlsx") ? nombreArchivo : `${nombreArchivo}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
