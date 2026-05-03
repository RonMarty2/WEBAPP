// In-memory store for development when Supabase is not configured.
// Data is persisted to .store/data.json so it survives server restarts.

import { createHash } from "crypto";
import { loadFromDisk, saveToDisk } from "@/lib/persistence";

export interface MonografiaRecord {
  id: string;
  user_id: string;
  titulo: string;
  diplomado?: string;
  tema?: string;
  status: string;
  etapa_actual: number;
  datos_base: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CapituloRecord {
  id: string;
  monografia_id: string;
  numero: number;
  contenido?: string;
  contenido_json?: Record<string, unknown>;
  latex_source?: string;
  status: string;
  observaciones?: string;
  checksum?: string;
  created_at: string;
  updated_at: string;
}

export interface CitaRecord {
  id: string;
  monografia_id: string;
  autor: string;
  ano?: number;
  titulo_obra: string;
  fuente?: string;
  tipo: string;
  formato_apa?: string;
  capitulo?: number;
  usado_en_parrafo?: string;
  es_consultado: boolean;
  created_at: string;
}

export interface DocumentoRecord {
  id: string;
  monografia_id: string;
  nombre: string;
  tipo?: string;
  contenido_extraido?: string;
  capitulo_asignado?: number;
  es_relevante: boolean;
  created_at: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface EtapaStats {
  etapa: number;
  uso_total: number;
  uso_este_mes: number;
  mes_actual: string; // "YYYY-MM"
  tiempo_promedio_ms: number;
  tiempos_ms: number[];
}

export interface RevisionEntry {
  monografia_id: string;
  etapa: number;
  count: number;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function mesActual(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

function hashJson(obj: unknown): string {
  return createHash("sha256").update(JSON.stringify(obj ?? "")).digest("hex").slice(0, 24);
}

// ─── Users ────────────────────────────────────────────────────────────────────

import type { UserRole, UserPlan } from "@/lib/auth";

export interface UserRecord {
  id: string;           // Google sub or "demo-*"
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  plan?: UserPlan;
  active: boolean;
  registered_at: string;
  activated_at?: string;
}

// ─── Error log ────────────────────────────────────────────────────────────────

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  nivel: "critical" | "warning" | "info";
  etapa: number | string;
  monografia_id?: string;
  mensaje: string;
  detalle?: string;
}

// ─── Proyectos (workspace flow) ───────────────────────────────────────────────

export interface ProyectoRecord {
  id: string;
  usuario_id: string;
  servicio_id: string;
  universidad_id?: string;
  tema_aprobado: string | null;
  titulo_provisional: string | null;
  estado_fase: number;
  completado: boolean;
  oculto_por_usuario?: boolean;
  // Modalidad: 'directa' (sin calibración) | 'guiada' (calibración + borrador/final)
  modalidad_creacion?: 'directa' | 'guiada';
  // Perfil de estilo generado por IA durante la calibración
  perfil_estilo_usuario?: string | null;
  // Cache invalidation: phaseKey → needs regeneration after a later phase changed
  requiere_actualizacion?: Record<string, boolean>;
  // Legacy fixed-phase columns (kept for backward compat)
  contenido_fase_0: string | null;
  contenido_fase_1: string | null;
  contenido_fase_2: string | null;
  contenido_fase_3: string | null;
  contenido_fase_4: string | null;
  contenido_fase_5: string | null;
  // Dynamic phase contents: phase_id → content (and phase_id + "_borrador" → borrador)
  phase_contents?: Record<string, string | null>;
  created_at: string;
  updated_at: string;
}

// ─── Module-level singletons ──────────────────────────────────────────────────
export const usersStore = new Map<string, UserRecord>(); // keyed by id
export const monografiasStore = new Map<string, MonografiaRecord>();
export const capitulosStore = new Map<string, CapituloRecord[]>();
export const citasStore = new Map<string, CitaRecord[]>();
export const documentosStore = new Map<string, DocumentoRecord[]>();
export const proyectosStore = new Map<string, ProyectoRecord>();

// Stats stores
export const etapaStatsStore = new Map<number, EtapaStats>();
export const revisionesStore = new Map<string, Record<number, number>>(); // monografia_id → {etapa: count}
export const errorLogsStore: ErrorLogEntry[] = [];

// ─── Monografías ──────────────────────────────────────────────────────────────

export function createMonografia(data: Omit<MonografiaRecord, "id" | "created_at" | "updated_at">): MonografiaRecord {
  const now = new Date().toISOString();
  const record: MonografiaRecord = { id: uid(), created_at: now, updated_at: now, ...data };
  monografiasStore.set(record.id, record);
  return record;
}

export function getMonografia(id: string): MonografiaRecord | undefined {
  return monografiasStore.get(id);
}

export function listMonografias(userId: string): MonografiaRecord[] {
  return [...monografiasStore.values()].filter(m => m.user_id === userId);
}

export function updateMonografia(id: string, updates: Partial<MonografiaRecord>): MonografiaRecord | null {
  const existing = monografiasStore.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  monografiasStore.set(id, updated);
  return updated;
}

// ─── Capítulos ────────────────────────────────────────────────────────────────

export function upsertCapitulo(data: Omit<CapituloRecord, "id" | "created_at" | "updated_at" | "checksum">): CapituloRecord {
  const now = new Date().toISOString();
  const checksum = hashJson(data.contenido_json ?? data.contenido);
  const list = capitulosStore.get(data.monografia_id) ?? [];
  const idx = list.findIndex(c => c.numero === data.numero);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data, checksum, updated_at: now };
    capitulosStore.set(data.monografia_id, list);
    return list[idx];
  }
  const record: CapituloRecord = { id: uid(), created_at: now, updated_at: now, checksum, ...data };
  list.push(record);
  capitulosStore.set(data.monografia_id, list);
  return record;
}

export function getCapitulo(monografiaId: string, numero: number): CapituloRecord | undefined {
  return (capitulosStore.get(monografiaId) ?? []).find(c => c.numero === numero);
}

export function getCapitulos(monografiaId: string): CapituloRecord[] {
  return capitulosStore.get(monografiaId) ?? [];
}

// ─── Citas ────────────────────────────────────────────────────────────────────

export function addCita(data: Omit<CitaRecord, "id" | "created_at">): CitaRecord {
  const record: CitaRecord = { id: uid(), created_at: new Date().toISOString(), ...data };
  const list = citasStore.get(data.monografia_id) ?? [];
  list.push(record);
  citasStore.set(data.monografia_id, list);
  return record;
}

export function getCitas(monografiaId: string): CitaRecord[] {
  return citasStore.get(monografiaId) ?? [];
}

// ─── Documentos ───────────────────────────────────────────────────────────────

export function addDocumento(data: Omit<DocumentoRecord, "id" | "created_at">): DocumentoRecord {
  const record: DocumentoRecord = { id: uid(), created_at: new Date().toISOString(), ...data };
  const list = documentosStore.get(data.monografia_id) ?? [];
  list.push(record);
  documentosStore.set(data.monografia_id, list);
  return record;
}

export function getDocumentos(monografiaId: string): DocumentoRecord[] {
  return documentosStore.get(monografiaId) ?? [];
}

// ─── Stats: usage tracking ────────────────────────────────────────────────────

export function incrementEtapaUsage(etapa: number, duracion_ms: number): void {
  const mes = mesActual();
  const existing = etapaStatsStore.get(etapa) ?? {
    etapa,
    uso_total: 0,
    uso_este_mes: 0,
    mes_actual: mes,
    tiempo_promedio_ms: 0,
    tiempos_ms: [],
  };

  // Reset monthly counter when month changes
  if (existing.mes_actual !== mes) {
    existing.uso_este_mes = 0;
    existing.mes_actual = mes;
  }

  existing.uso_total += 1;
  existing.uso_este_mes += 1;
  existing.tiempos_ms.push(duracion_ms);
  // Keep only last 100 timings to avoid unbounded growth
  if (existing.tiempos_ms.length > 100) existing.tiempos_ms.shift();
  existing.tiempo_promedio_ms = Math.round(
    existing.tiempos_ms.reduce((a, b) => a + b, 0) / existing.tiempos_ms.length
  );

  etapaStatsStore.set(etapa, existing);
}

export function logError(entry: Omit<ErrorLogEntry, "id" | "timestamp">): void {
  const record: ErrorLogEntry = {
    id: uid(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  errorLogsStore.unshift(record); // newest first
  if (errorLogsStore.length > 200) errorLogsStore.pop(); // cap at 200 entries
}

export function getErrorLogs(nivel?: ErrorLogEntry["nivel"], limit = 50): ErrorLogEntry[] {
  const filtered = nivel ? errorLogsStore.filter(e => e.nivel === nivel) : errorLogsStore;
  return filtered.slice(0, limit);
}

export function trackRevision(monografiaId: string, etapa: number): void {
  const map = revisionesStore.get(monografiaId) ?? {};
  map[etapa] = (map[etapa] ?? 0) + 1;
  revisionesStore.set(monografiaId, map);
}

export function getRevisionesPorEtapa(): Record<number, number> {
  const totals: Record<number, number> = {};
  const counts: Record<number, number> = {};
  for (const map of revisionesStore.values()) {
    for (const [etapa, count] of Object.entries(map)) {
      const n = Number(etapa);
      totals[n] = (totals[n] ?? 0) + count;
      counts[n] = (counts[n] ?? 0) + 1;
    }
  }
  const avgs: Record<number, number> = {};
  for (const n of Object.keys(totals)) {
    const key = Number(n);
    avgs[key] = Math.round((totals[key] / counts[key]) * 10) / 10;
  }
  return avgs;
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export function listAllMonografias(): MonografiaRecord[] {
  return [...monografiasStore.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getAggregateStats() {
  const todas = listAllMonografias();
  const completadas = todas.filter(m => m.status === "completa" || m.etapa_actual >= 3);
  const mes = mesActual();
  const estesMes = todas.filter(m => m.created_at.startsWith(mes));

  // Top temas: extraer del titulo
  const temaCount = new Map<string, number>();
  for (const m of todas) {
    const palabras = (m.tema ?? m.titulo ?? "").split(/\s+/).slice(0, 3).join(" ");
    if (palabras) temaCount.set(palabras, (temaCount.get(palabras) ?? 0) + 1);
  }
  const temasPopulares = [...temaCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tema, cantidad]) => ({ tema, cantidad }));

  const prompts: Array<{
    etapa: number;
    nombre: string;
    uso_total: number;
    uso_este_mes: number;
    tiempo_promedio_seg: number;
  }> = [0, 1, 2, 3].map(etapa => {
    const s = etapaStatsStore.get(etapa);
    const nombres: Record<number, string> = {
      0: "Generar Tema Viable",
      1: "Capítulo I — Planteamiento",
      2: "Capítulo II — Marco Teórico",
      3: "Caps. III-V + Bibliografía",
    };
    return {
      etapa,
      nombre: nombres[etapa],
      uso_total: s?.uso_total ?? 0,
      uso_este_mes: s?.uso_este_mes ?? 0,
      tiempo_promedio_seg: s ? Math.round(s.tiempo_promedio_ms / 100) / 10 : 0,
    };
  });

  const revisionesPorEtapa = getRevisionesPorEtapa();
  const etapasConMasCambios = [1, 2, 3].map(etapa => ({
    etapa,
    cambios_promedio: revisionesPorEtapa[etapa] ?? 0,
  })).sort((a, b) => b.cambios_promedio - a.cambios_promedio);

  return {
    total_monografias_generadas: todas.length,
    completadas: completadas.length,
    este_mes: estesMes.length,
    promedio_tiempo_generacion_seg: prompts.reduce((a, p) => a + p.tiempo_promedio_seg, 0),
    temas_mas_populares: temasPopulares,
    prompts,
    etapas_con_mas_cambios: etapasConMasCambios,
  };
}

// ─── User management ──────────────────────────────────────────────────────────

export function upsertUser(data: Omit<UserRecord, "registered_at"> & { registered_at?: string }): UserRecord {
  const existing = usersStore.get(data.id);
  const record: UserRecord = {
    registered_at: existing?.registered_at ?? new Date().toISOString(),
    ...existing,
    ...data,
  };
  usersStore.set(record.id, record);
  return record;
}

export function getUser(id: string): UserRecord | undefined {
  return usersStore.get(id);
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return [...usersStore.values()].find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function listUsers(): UserRecord[] {
  return [...usersStore.values()].sort(
    (a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime()
  );
}

export function activateUser(id: string, role: UserRole, plan: UserPlan): UserRecord | null {
  const user = usersStore.get(id);
  if (!user) return null;
  const updated: UserRecord = {
    ...user,
    role,
    plan,
    active: true,
    activated_at: new Date().toISOString(),
  };
  usersStore.set(id, updated);
  return updated;
}

export function deactivateUser(id: string): UserRecord | null {
  const user = usersStore.get(id);
  if (!user) return null;
  const updated: UserRecord = { ...user, active: false };
  usersStore.set(id, updated);
  return updated;
}

// ─── Proyectos (workspace flow) — con persistencia en disco ──────────────────

// Cargar datos guardados al iniciar el módulo
(function initProyectos() {
  try {
    const disk = loadFromDisk();
    if (disk.proyectos) {
      for (const [k, v] of Object.entries(disk.proyectos)) {
        proyectosStore.set(k, v as ProyectoRecord);
      }
    }
  } catch { /* ignorar si falla */ }
})();

function persistProyectos() {
  // Merge: only update the 'proyectos' key, preserve everything else (workspacePrompts, calibracion, etc.)
  const existing = loadFromDisk();
  const proyectosObj: Record<string, unknown> = {};
  for (const [k, v] of proyectosStore.entries()) proyectosObj[k] = v;
  saveToDisk({ ...existing, proyectos: proyectosObj });
}

export function createProyecto(data: Omit<ProyectoRecord, "id" | "created_at" | "updated_at">): ProyectoRecord {
  const now = new Date().toISOString();
  const record: ProyectoRecord = { id: uid(), created_at: now, updated_at: now, ...data };
  proyectosStore.set(record.id, record);
  persistProyectos();
  return record;
}

export function getProyecto(id: string): ProyectoRecord | undefined {
  // Intentar desde la memoria primero; si no está, recargar del disco
  if (proyectosStore.has(id)) return proyectosStore.get(id);
  try {
    const disk = loadFromDisk();
    if (disk.proyectos?.[id]) {
      const record = disk.proyectos[id] as ProyectoRecord;
      proyectosStore.set(id, record);
      return record;
    }
  } catch { /* ignorar */ }
  return undefined;
}

export function listProyectos(userId: string): ProyectoRecord[] {
  // Asegurar que la memoria esté sincronizada con el disco
  try {
    const disk = loadFromDisk();
    if (disk.proyectos) {
      for (const [k, v] of Object.entries(disk.proyectos)) {
        if (!proyectosStore.has(k)) proyectosStore.set(k, v as ProyectoRecord);
      }
    }
  } catch { /* ignorar */ }

  return [...proyectosStore.values()]
    .filter(p => p.usuario_id === userId && !p.oculto_por_usuario)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function updateProyecto(id: string, updates: Partial<ProyectoRecord>): ProyectoRecord | null {
  // Si no está en memoria, intentar cargar del disco
  if (!proyectosStore.has(id)) {
    getProyecto(id); // esto carga del disco si existe
  }
  const existing = proyectosStore.get(id);
  if (!existing) return null;
  const updated: ProyectoRecord = { ...existing, ...updates, updated_at: new Date().toISOString() };
  proyectosStore.set(id, updated);
  persistProyectos();
  return updated;
}

export function deleteProyecto(id: string): boolean {
  const p = proyectosStore.get(id);
  if (p) {
    p.oculto_por_usuario = true;
    persistProyectos();
    return true;
  }
  return false;
}
