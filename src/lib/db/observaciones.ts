import { loadFromDisk, saveToDisk, type ObservacionTribunal } from "@/lib/persistence";

function genId() {
  return `obs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function dbListObservaciones(proyecto_id: string): ObservacionTribunal[] {
  const all = loadFromDisk().observacionesTribunal ?? {};
  return Object.values(all)
    .filter(o => o.proyecto_id === proyecto_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function dbGetObservacion(id: string): ObservacionTribunal | undefined {
  return loadFromDisk().observacionesTribunal?.[id];
}

export function dbCreateObservacion(
  data: Omit<ObservacionTribunal, "id" | "created_at" | "updated_at">
): ObservacionTribunal {
  const disk = loadFromDisk();
  const now = new Date().toISOString();
  const obs: ObservacionTribunal = { ...data, id: genId(), created_at: now, updated_at: now };
  saveToDisk({ ...disk, observacionesTribunal: { ...(disk.observacionesTribunal ?? {}), [obs.id]: obs } });
  return obs;
}

export function dbUpdateObservacion(
  id: string,
  patch: Partial<Omit<ObservacionTribunal, "id" | "proyecto_id" | "created_at">>
): ObservacionTribunal | undefined {
  const disk = loadFromDisk();
  const obs = disk.observacionesTribunal?.[id];
  if (!obs) return undefined;
  const updated: ObservacionTribunal = { ...obs, ...patch, updated_at: new Date().toISOString() };
  saveToDisk({ ...disk, observacionesTribunal: { ...(disk.observacionesTribunal ?? {}), [id]: updated } });
  return updated;
}

export function dbDeleteObservacion(id: string): boolean {
  const disk = loadFromDisk();
  if (!disk.observacionesTribunal?.[id]) return false;
  const map = { ...disk.observacionesTribunal };
  delete map[id];
  saveToDisk({ ...disk, observacionesTribunal: map });
  return true;
}
