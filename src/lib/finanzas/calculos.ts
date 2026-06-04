/**
 * Lógica financiera pura — sin dependencias de React ni Next.
 * Todo lo que la plataforma "Finanzas para Emprendedores" usa para
 * calcular VAN, TIR, B/C, Payback y sensibilidad vive aquí.
 *
 * Convenciones:
 *   - flujos[0] es el período 0 (inversión inicial, normalmente negativo).
 *   - tasa se expresa como decimal: 0.14 = 14% anual.
 *   - Montos en bolivianos (Bs.) pero la lógica es agnóstica a la moneda.
 */

export interface ProyectoInput {
  inversionInicial: number;
  ingresosAnuales: number[];
  egresosAnuales: number[];
  tasaDescuento: number;
}

export interface ResultadoSensibilidad {
  van: number;
  tir: number;
  bc: number;
  paybackMeses: number;
}

export interface ResultadoProyecto {
  van: number;
  tir: number;
  bc: number;
  paybackMeses: number;
  flujoNeto: number[];
  flujoDescontado: number[];
  flujoAcumulado: number[];
  sensibilidad: {
    optimista: ResultadoSensibilidad;
    base: ResultadoSensibilidad;
    pesimista: ResultadoSensibilidad;
  };
  veredicto: Veredicto;
}

export type Veredicto =
  | { nivel: 'viable'; titulo: string; mensaje: string }
  | { nivel: 'marginal'; titulo: string; mensaje: string }
  | { nivel: 'inviable'; titulo: string; mensaje: string };

export function calcularVAN(flujos: number[], tasa: number): number {
  return flujos.reduce((acum, flujo, t) => acum + flujo / Math.pow(1 + tasa, t), 0);
}

/**
 * TIR por bisección. Buscamos la tasa r tal que VAN(r) = 0.
 * Rango razonable: -99% a +1000%. Si el proyecto no tiene cambio de signo
 * (todos positivos o todos negativos), la TIR no existe.
 */
export function calcularTIR(flujos: number[]): number {
  const hayCambioSigno = flujos.some(f => f > 0) && flujos.some(f => f < 0);
  if (!hayCambioSigno) return NaN;

  let bajo = -0.99;
  let alto = 10.0;
  let vanBajo = calcularVAN(flujos, bajo);
  let vanAlto = calcularVAN(flujos, alto);

  if (vanBajo * vanAlto > 0) return NaN;

  for (let i = 0; i < 100; i++) {
    const medio = (bajo + alto) / 2;
    const vanMedio = calcularVAN(flujos, medio);
    if (Math.abs(vanMedio) < 0.01) return medio;
    if (vanBajo * vanMedio < 0) {
      alto = medio;
      vanAlto = vanMedio;
    } else {
      bajo = medio;
      vanBajo = vanMedio;
    }
  }
  return (bajo + alto) / 2;
}

export function calcularBC(
  ingresos: number[],
  egresos: number[],
  inversionInicial: number,
  tasa: number
): number {
  const ingresosDescontados = ingresos.reduce(
    (sum, ing, i) => sum + ing / Math.pow(1 + tasa, i + 1),
    0
  );
  const egresosDescontados = egresos.reduce(
    (sum, eg, i) => sum + eg / Math.pow(1 + tasa, i + 1),
    0
  );
  const denominador = egresosDescontados + inversionInicial;
  if (denominador === 0) return 0;
  return ingresosDescontados / denominador;
}

/**
 * Payback en meses. Recorre el flujo acumulado mes a mes (interpolando
 * linealmente dentro del año donde se recupera la inversión).
 */
export function calcularPaybackMeses(flujos: number[]): number {
  let acumulado = 0;
  for (let i = 0; i < flujos.length; i++) {
    const previo = acumulado;
    acumulado += flujos[i];
    if (acumulado >= 0 && previo < 0) {
      const fraccion = -previo / flujos[i];
      return Math.round((i - 1 + fraccion) * 12);
    }
  }
  return -1;
}

function construirFlujos(input: ProyectoInput): number[] {
  const { inversionInicial, ingresosAnuales, egresosAnuales } = input;
  const flujos: number[] = [-Math.abs(inversionInicial)];
  for (let i = 0; i < ingresosAnuales.length; i++) {
    flujos.push((ingresosAnuales[i] ?? 0) - (egresosAnuales[i] ?? 0));
  }
  return flujos;
}

function calcularEscenario(
  flujos: number[],
  ingresos: number[],
  egresos: number[],
  inversion: number,
  tasa: number
): ResultadoSensibilidad {
  return {
    van: calcularVAN(flujos, tasa),
    tir: calcularTIR(flujos),
    bc: calcularBC(ingresos, egresos, inversion, tasa),
    paybackMeses: calcularPaybackMeses(flujos),
  };
}

function veredictoDe(van: number, tir: number, tasa: number, bc: number): Veredicto {
  if (van > 0 && tir > tasa && bc > 1.2) {
    return {
      nivel: 'viable',
      titulo: 'Proyecto viable',
      mensaje:
        'Los indicadores son sólidos: VAN positivo, TIR por encima de tu tasa de descuento y un B/C cómodo. Tu inversión genera valor real.',
    };
  }
  if (van > 0 && tir > tasa) {
    return {
      nivel: 'marginal',
      titulo: 'Viable pero ajustado',
      mensaje:
        'El proyecto genera valor, pero el margen es estrecho. Revisa el análisis de sensibilidad antes de comprometerte: una caída de ingresos del 20% podría volverlo inviable.',
    };
  }
  return {
    nivel: 'inviable',
    titulo: 'Reconsidera el proyecto',
    mensaje:
      'Con estos números, la inversión no genera el retorno mínimo que pides. Antes de descartarlo, prueba ajustar ingresos, egresos o el horizonte de análisis.',
  };
}

export function analizarProyecto(input: ProyectoInput): ResultadoProyecto {
  const { inversionInicial, ingresosAnuales, egresosAnuales, tasaDescuento } = input;
  const flujos = construirFlujos(input);

  const van = calcularVAN(flujos, tasaDescuento);
  const tir = calcularTIR(flujos);
  const bc = calcularBC(ingresosAnuales, egresosAnuales, inversionInicial, tasaDescuento);
  const paybackMeses = calcularPaybackMeses(flujos);

  const flujoDescontado = flujos.map((f, t) => f / Math.pow(1 + tasaDescuento, t));
  const flujoAcumulado: number[] = [];
  flujos.reduce((acum, f) => {
    const nuevo = acum + f;
    flujoAcumulado.push(nuevo);
    return nuevo;
  }, 0);

  const optimistaIngresos = ingresosAnuales.map(v => v * 1.2);
  const pesimistaIngresos = ingresosAnuales.map(v => v * 0.8);
  const optimistaEgresos = egresosAnuales.map(v => v * 0.9);
  const pesimistaEgresos = egresosAnuales.map(v => v * 1.1);

  const flujosOpt = construirFlujos({
    inversionInicial,
    ingresosAnuales: optimistaIngresos,
    egresosAnuales: optimistaEgresos,
    tasaDescuento,
  });
  const flujosPes = construirFlujos({
    inversionInicial,
    ingresosAnuales: pesimistaIngresos,
    egresosAnuales: pesimistaEgresos,
    tasaDescuento,
  });

  return {
    van,
    tir,
    bc,
    paybackMeses,
    flujoNeto: flujos,
    flujoDescontado,
    flujoAcumulado,
    sensibilidad: {
      optimista: calcularEscenario(
        flujosOpt,
        optimistaIngresos,
        optimistaEgresos,
        inversionInicial,
        tasaDescuento
      ),
      base: { van, tir, bc, paybackMeses },
      pesimista: calcularEscenario(
        flujosPes,
        pesimistaIngresos,
        pesimistaEgresos,
        inversionInicial,
        tasaDescuento
      ),
    },
    veredicto: veredictoDe(van, tir, tasaDescuento, bc),
  };
}

export function formatBs(valor: number): string {
  if (!Number.isFinite(valor)) return '—';
  return `Bs. ${Math.round(valor).toLocaleString('es-BO')}`;
}

export function formatPorcentaje(valor: number, decimales = 1): string {
  if (!Number.isFinite(valor)) return '—';
  return `${(valor * 100).toFixed(decimales)}%`;
}

export function formatMeses(meses: number): string {
  if (meses < 0) return 'No se recupera';
  if (meses < 12) return `${meses} meses`;
  const años = Math.floor(meses / 12);
  const resto = meses % 12;
  if (resto === 0) return `${años} ${años === 1 ? 'año' : 'años'}`;
  return `${años}a ${resto}m`;
}
