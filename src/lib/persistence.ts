/**
 * File-based persistence for in-memory stores.
 * Writes to OS temp dir — fuera del directorio del proyecto para evitar que
 * el file watcher de Turbopack detecte cambios y dispare Hot Module Replacement.
 * Solo se usa cuando Supabase no está configurado.
 */

import fs from "fs";
import os from "os";
import path from "path";

// ─ Usar directorio temporal del OS para evitar disparar el watcher de Turbopack ─
// Si la variable de entorno STORE_PATH está definida, úsala; si no, usa os.tmpdir().
const STORE_DIR = process.env.STORE_PATH
  ? path.resolve(process.env.STORE_PATH)
  : path.join(os.tmpdir(), "laboratorio-academico-store");
const STORE_FILE = path.join(STORE_DIR, "data.json");

let saveTimer: ReturnType<typeof setTimeout> | null = null;

interface WorkspacePrompts {
  hilos: string[];
  phases: Record<string, string>;
}

export interface PhaseDefinition {
  id: string;          // unique ID e.g. "ph-abc123"
  servicio_id: string;
  orden: number;       // 0, 10, 20... (gaps allow inserting between)
  label: string;       // "Planteamiento del Tema"
  short_label: string; // "Planteamiento"
  prompt: string;      // full system prompt for this phase
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
}

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

export function loadFromDisk(): StoreData {
  try {
    ensureDir();
    if (!fs.existsSync(STORE_FILE)) return { proyectos: {}, users: {} };
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    return { proyectos: {}, users: {} };
  }
}

export function saveToDisk(data: StoreData) {
  // Debounce: write at most once every 500ms
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      ensureDir();
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("[persistence] Error saving store:", e);
    }
  }, 500);
}
