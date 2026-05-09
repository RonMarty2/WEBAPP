/**
 * File-based persistence for in-memory stores.
 * Writes to `.store/data.json` by default so admin prompts and project
 * definitions survive dev-server restarts. Solo se usa cuando Supabase no está
 * configurado.
 */

import fs from "fs";
import os from "os";
import path from "path";

// Si la variable de entorno STORE_PATH está definida, úsala; si no, usa .store.
const DEFAULT_STORE_DIR = path.join(process.cwd(), ".store");
const LEGACY_STORE_FILE = path.join(os.tmpdir(), "laboratorio-academico-store", "data.json");
const STORE_DIR = process.env.STORE_PATH
  ? path.resolve(process.env.STORE_PATH)
  : DEFAULT_STORE_DIR;
const STORE_FILE = path.join(STORE_DIR, "data.json");

let latestDataCache: StoreData | null = null;

interface WorkspacePrompts {
  hilos: string[];
  phases: Record<string, string>;
}

export interface PhaseDefinition {
  id: string;          // unique ID e.g. "ph-abc123"
  servicio_id: string;
  tipo_proyecto_id?: string;
  orden: number;       // 0, 10, 20... (gaps allow inserting between)
  label: string;       // "Planteamiento del Tema"
  short_label: string; // "Planteamiento"
  prompt: string;      // full system prompt for this phase
  prompt_borrador?: string;
  prompt_final?: string;
}

export interface CalibracionPregunta {
  id: string;
  servicio_id: string;
  pregunta: string;
  descripcion?: string;
  placeholder?: string;   // hint text shown inside the student textarea
  orden: number;
  minimo_palabras: number;
  activo: boolean;
}

export interface TipoProyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  icon?: string;
  activo: boolean;
  created_at: string;
}

export interface FaseTipoProyecto {
  id: string;
  tipo_proyecto_id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  prompt_borrador?: string;
  prompt_final?: string;
  es_subfase: boolean;
  padre_id?: string;
}

export interface SolicitudPagoRecord {
  id: string;
  usuario_id: string;
  usuario_email?: string;
  usuario_nombre?: string;
  plan: "estandar" | "pro";
  monto_bs: number;
  metodo: "tigo_money" | "qr_bancario" | "transferencia";
  estado: "pendiente" | "aprobado" | "rechazado";
  comprobante_b64?: string;
  comprobante_tipo?: string;
  notas_usuario?: string;
  notas_admin?: string;
  aprobado_por?: string;
  aprobado_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentConfig {
  tigo_money_numero?: string;
  tigo_money_nombre?: string;
  banco_nombre?: string;
  banco_cuenta?: string;
  banco_titular?: string;
  banco_ci?: string;
  qr_imagen_b64?: string; // imagen del QR bancario en base64
  instrucciones_extra?: string;
}

export interface ObservacionTribunal {
  id: string;
  proyecto_id: string;
  texto: string;
  capitulo_afectado?: string; // e.g. "fase_1", "fase_2"
  estado: "pendiente" | "atendida" | "descartada";
  tipo?: 1 | 2 | 3; // 1=trivial, 2=forma, 3=fondo
  respuesta_ia?: string;
  notas_usuario?: string;
  created_at: string;
  updated_at: string;
  atendida_at?: string;
}

export interface StoreData {
  proyectos: Record<string, unknown>;
  users: Record<string, unknown>;
  aiConfig?: Record<string, unknown>;
  workspacePrompts?: WorkspacePrompts;
  phaseDefinitions?: Record<string, PhaseDefinition[]>; // servicio_id → phases
  calibracionPreguntas?: CalibracionPregunta[];
  estiloAnalizadorPrompt?: string;
  tiposProyecto?: TipoProyecto[];
  fasesTipoProyecto?: FaseTipoProyecto[];
  solicitudesPago?: Record<string, SolicitudPagoRecord>;
  paymentConfig?: PaymentConfig;
  observacionesTribunal?: Record<string, ObservacionTribunal>;
}

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function migrateLegacyStoreIfNeeded() {
  if (!fs.existsSync(LEGACY_STORE_FILE)) return;
  ensureDir();

  if (!fs.existsSync(STORE_FILE)) {
    fs.copyFileSync(LEGACY_STORE_FILE, STORE_FILE);
    return;
  }

  const legacyMtime = fs.statSync(LEGACY_STORE_FILE).mtimeMs;
  const currentMtime = fs.statSync(STORE_FILE).mtimeMs;
  if (currentMtime >= legacyMtime) return;

  const current = JSON.parse(fs.readFileSync(STORE_FILE, "utf8")) as StoreData;
  const legacy = JSON.parse(fs.readFileSync(LEGACY_STORE_FILE, "utf8")) as StoreData;
  const merged: StoreData = {
    ...current,
    ...legacy,
    proyectos: { ...(current.proyectos ?? {}), ...(legacy.proyectos ?? {}) },
    users: { ...(current.users ?? {}), ...(legacy.users ?? {}) },
  };
  fs.writeFileSync(STORE_FILE, JSON.stringify(merged, null, 2), "utf8");
}

export function loadFromDisk(): StoreData {
  try {
    if (latestDataCache) return latestDataCache;
    ensureDir();
    migrateLegacyStoreIfNeeded();
    if (!fs.existsSync(STORE_FILE)) {
      latestDataCache = { proyectos: {}, users: {} };
      return latestDataCache;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    latestDataCache = JSON.parse(raw) as StoreData;
    return latestDataCache;
  } catch {
    latestDataCache = { proyectos: {}, users: {} };
    return latestDataCache;
  }
}

export function reloadFromDisk(): StoreData {
  latestDataCache = null;
  return loadFromDisk();
}

export function saveToDisk(data: StoreData) {
  latestDataCache = data;
  try {
    ensureDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(latestDataCache ?? data, null, 2), "utf8");
  } catch (e) {
    console.error("[persistence] Error saving store:", e);
  }
}
