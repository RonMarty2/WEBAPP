/**
 * File-based persistence for in-memory stores.
 * Writes to .store/data.json — survives server hot-reloads and restarts.
 * Only used when Supabase is not configured.
 */

import fs from "fs";
import path from "path";

const STORE_DIR = path.join(process.cwd(), ".store");
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

export interface StoreData {
  proyectos: Record<string, unknown>;
  users: Record<string, unknown>;
  aiConfig?: Record<string, unknown>;
  workspacePrompts?: WorkspacePrompts;
  phaseDefinitions?: Record<string, PhaseDefinition[]>; // servicio_id → phases
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
