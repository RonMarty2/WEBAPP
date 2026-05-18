/**
 * Materiales de defensa — slides, podcast, guion para estudiantes Elite.
 * Los archivos binarios se guardan en disco bajo `.store/defensa-materiales/`.
 * La metadata se persiste en proyecto.academic_context.defensa_materiales.
 */

import fs from "fs";
import path from "path";

const DEFAULT_DIR = path.join(process.cwd(), ".store", "defensa-materiales");
const ROOT = process.env.DEFENSA_PATH ? path.resolve(process.env.DEFENSA_PATH) : DEFAULT_DIR;

export type DefensaSlot = "slides" | "podcast" | "guion";
export type DefensaEstado = "pendiente" | "en_proceso" | "listo";

export interface DefensaArchivo {
  nombre: string;
  mime: string;
  tamano: number;
  ruta: string;
  subido_at: string;
}

export interface DefensaMateriales {
  estado: DefensaEstado;
  mensaje?: string;
  notificado_at?: string;
  slides?: DefensaArchivo;
  podcast?: DefensaArchivo;
  guion?: DefensaArchivo;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function extForSlot(slot: DefensaSlot, originalName: string): string {
  const orig = path.extname(originalName).toLowerCase();
  if (orig) return orig;
  if (slot === "podcast") return ".mp3";
  return ".pdf";
}

export function guardarArchivoDefensa(
  proyectoId: string,
  slot: DefensaSlot,
  nombreOriginal: string,
  mime: string,
  bytes: Buffer,
): DefensaArchivo {
  const dir = path.join(ROOT, proyectoId);
  ensureDir(dir);
  const ext = extForSlot(slot, nombreOriginal);
  const filename = `${slot}${ext}`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, bytes);
  return {
    nombre: nombreOriginal,
    mime,
    tamano: bytes.length,
    ruta: `${proyectoId}/${filename}`,
    subido_at: new Date().toISOString(),
  };
}

// Resuelve ruta relativa contra ROOT y verifica que el resultado esté
// dentro de ROOT. Bloquea path traversal (..), rutas absolutas, null bytes
// y casos en que normalize() sola no detectaría.
function resolverDentroDeRoot(rutaRelativa: string): string | null {
  if (typeof rutaRelativa !== "string" || rutaRelativa.includes("\0")) return null;
  const full = path.resolve(ROOT, rutaRelativa);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (full !== ROOT && !full.startsWith(rootWithSep)) return null;
  return full;
}

export function leerArchivoDefensa(rutaRelativa: string): Buffer | null {
  const full = resolverDentroDeRoot(rutaRelativa);
  if (!full || !fs.existsSync(full)) return null;
  return fs.readFileSync(full);
}

export function eliminarArchivoDefensa(rutaRelativa: string): boolean {
  const full = resolverDentroDeRoot(rutaRelativa);
  if (!full || !fs.existsSync(full)) return false;
  fs.unlinkSync(full);
  return true;
}

export function defaultMateriales(): DefensaMateriales {
  return { estado: "pendiente" };
}

export function estadoCalculado(m: DefensaMateriales | undefined): DefensaEstado {
  if (!m) return "pendiente";
  if (m.slides || m.podcast || m.guion) return m.estado === "listo" ? "listo" : "en_proceso";
  return "pendiente";
}
