/**
 * CRUD de solicitudes de pago — funciona con store local (y en el futuro con Supabase).
 */

import { loadFromDisk, saveToDisk, type SolicitudPagoRecord, type PaymentConfig } from "@/lib/persistence";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Solicitudes ──────────────────────────────────────────────

export function dbCreateSolicitudPago(
  data: Omit<SolicitudPagoRecord, "id" | "created_at" | "updated_at">
): SolicitudPagoRecord {
  const disk = loadFromDisk();
  const now = new Date().toISOString();
  const record: SolicitudPagoRecord = { id: uid(), created_at: now, updated_at: now, ...data };
  const mapa = { ...(disk.solicitudesPago ?? {}), [record.id]: record };
  saveToDisk({ ...disk, solicitudesPago: mapa });
  return record;
}

export function dbGetSolicitudPago(id: string): SolicitudPagoRecord | undefined {
  return loadFromDisk().solicitudesPago?.[id];
}

export function dbListSolicitudesByUser(userId: string): SolicitudPagoRecord[] {
  const mapa = loadFromDisk().solicitudesPago ?? {};
  return Object.values(mapa)
    .filter(s => s.usuario_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function dbListAllSolicitudes(): SolicitudPagoRecord[] {
  const mapa = loadFromDisk().solicitudesPago ?? {};
  return Object.values(mapa).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function dbUpdateSolicitudPago(
  id: string,
  updates: Partial<SolicitudPagoRecord>
): SolicitudPagoRecord | null {
  const disk = loadFromDisk();
  const existing = disk.solicitudesPago?.[id];
  if (!existing) return null;
  const updated: SolicitudPagoRecord = { ...existing, ...updates, updated_at: new Date().toISOString() };
  saveToDisk({ ...disk, solicitudesPago: { ...(disk.solicitudesPago ?? {}), [id]: updated } });
  return updated;
}

// ─── Configuración de pagos ───────────────────────────────────

export function dbGetPaymentConfig(): PaymentConfig {
  return loadFromDisk().paymentConfig ?? {};
}

export function dbSavePaymentConfig(config: PaymentConfig): PaymentConfig {
  const disk = loadFromDisk();
  saveToDisk({ ...disk, paymentConfig: config });
  return config;
}
