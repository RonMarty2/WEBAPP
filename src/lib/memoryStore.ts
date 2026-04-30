// In-memory store for development when Supabase is not configured.
// NOTE: Data is lost on server restart. Configure Supabase for persistence.

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

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Module-level singletons (persist for the lifetime of the Node.js process)
export const monografiasStore = new Map<string, MonografiaRecord>();
export const capitulosStore = new Map<string, CapituloRecord[]>();
export const citasStore = new Map<string, CitaRecord[]>();
export const documentosStore = new Map<string, DocumentoRecord[]>();

// --- Monografías ---

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

// --- Capítulos ---

export function upsertCapitulo(data: Omit<CapituloRecord, "id" | "created_at" | "updated_at">): CapituloRecord {
  const now = new Date().toISOString();
  const list = capitulosStore.get(data.monografia_id) ?? [];
  const idx = list.findIndex(c => c.numero === data.numero);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data, updated_at: now };
    capitulosStore.set(data.monografia_id, list);
    return list[idx];
  }
  const record: CapituloRecord = { id: uid(), created_at: now, updated_at: now, ...data };
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

// --- Citas ---

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

// --- Documentos ---

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

// --- Admin helpers ---

export function listAllMonografias(): MonografiaRecord[] {
  return [...monografiasStore.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
