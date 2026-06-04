/**
 * Persistencia local de los artefactos (simulaciones financieras) que
 * el usuario crea en el SimuladorPRO. Usa localStorage para sobrevivir
 * recargas sin requerir backend.
 *
 * Cuando el ecosistema tenga BD real, este módulo se reemplaza por
 * llamadas a una API; la firma de las funciones se mantiene igual.
 */

import type { ProyectoInput, ResultadoProyecto } from './calculos';

const STORAGE_KEY = 'finanzas-artefactos-v1';
const PROGRESO_KEY = 'finanzas-progreso-v1';

export interface ArtefactoFinanciero {
  id: string;
  titulo: string;
  fechaCreacion: string;
  fechaModificacion: string;
  input: ProyectoInput;
  resultado: ResultadoProyecto;
  notas?: string;
}

export interface ProgresoClase {
  claseSlug: string;
  ejercicioCompletado: boolean;
  quizScore: number;
  fechaCompletada: string;
}

function ahora(): string {
  return new Date().toISOString();
}

function id(): string {
  return `art-fin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function leer<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function escribir<T>(key: string, valor: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(valor));
  } catch {
    // localStorage lleno o deshabilitado; aceptamos pérdida silenciosa
  }
}

export function listarArtefactos(): ArtefactoFinanciero[] {
  return leer<ArtefactoFinanciero>(STORAGE_KEY).sort((a, b) =>
    b.fechaModificacion.localeCompare(a.fechaModificacion)
  );
}

export function guardarArtefacto(params: {
  titulo: string;
  input: ProyectoInput;
  resultado: ResultadoProyecto;
  notas?: string;
}): ArtefactoFinanciero {
  const lista = listarArtefactos();
  const nuevo: ArtefactoFinanciero = {
    id: id(),
    titulo: params.titulo,
    fechaCreacion: ahora(),
    fechaModificacion: ahora(),
    input: params.input,
    resultado: params.resultado,
    notas: params.notas,
  };
  escribir(STORAGE_KEY, [nuevo, ...lista]);
  return nuevo;
}

export function eliminarArtefacto(id: string): void {
  const lista = listarArtefactos().filter(a => a.id !== id);
  escribir(STORAGE_KEY, lista);
}

export function obtenerArtefacto(id: string): ArtefactoFinanciero | undefined {
  return listarArtefactos().find(a => a.id === id);
}

export function listarProgresoClases(): ProgresoClase[] {
  return leer<ProgresoClase>(PROGRESO_KEY);
}

export function registrarProgresoClase(progreso: ProgresoClase): void {
  const lista = listarProgresoClases().filter(p => p.claseSlug !== progreso.claseSlug);
  escribir(PROGRESO_KEY, [progreso, ...lista]);
}

export function obtenerProgresoClase(slug: string): ProgresoClase | undefined {
  return listarProgresoClases().find(p => p.claseSlug === slug);
}

export function calcularPorcentajeCurso(totalClases: number): number {
  const completadas = listarProgresoClases().filter(p => p.ejercicioCompletado && p.quizScore >= 2).length;
  if (totalClases === 0) return 0;
  return Math.round((completadas / totalClases) * 100);
}
