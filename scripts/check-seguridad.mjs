// Dos reglas de seguridad de CLAUDE.md, verificadas en código:
//  1. Ningún componente cliente importa src/lib/prompts (los prompts son solo servidor).
//  2. Toda ruta de src/app/api/admin valida el rol (salvo el propio login de admin).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const SIN_CHEQUEO_PERMITIDO = ["admin/auth/route.ts", "admin/auth/check/route.ts"];
const CHEQUEO = /requireAdmin|requireAuth|verifyAdmin|requireRole|isAdmin/;

function* archivos(dir, filtro) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (ruta.includes("node_modules") || ruta.includes(".next")) continue;
    if (statSync(ruta).isDirectory()) yield* archivos(ruta, filtro);
    else if (filtro.test(ruta.replace(/\\/g, "/"))) yield ruta;
  }
}

const problemas = [];

for (const ruta of archivos(join(RAIZ, "src"), /\.(tsx|ts)$/)) {
  const texto = readFileSync(ruta, "utf8");
  const primeras = texto.split("\n").slice(0, 5).join("\n");
  if (/["']use client["']/.test(primeras) && /from\s+["']@\/lib\/prompts/.test(texto)) {
    problemas.push(`Componente cliente importa prompts: ${relative(RAIZ, ruta)}`);
  }
}

for (const ruta of archivos(join(RAIZ, "src/app/api/admin"), /route\.ts$/)) {
  const rel = relative(RAIZ, ruta).replace(/\\/g, "/");
  if (SIN_CHEQUEO_PERMITIDO.some((p) => rel.endsWith(p))) continue;
  if (!CHEQUEO.test(readFileSync(ruta, "utf8"))) {
    problemas.push(`Ruta admin sin validar rol: ${rel}`);
  }
}

if (problemas.length) {
  console.error(`✗ Seguridad (${problemas.length}):\n` + problemas.join("\n"));
  process.exit(1);
}
console.log("✓ Seguridad: prompts solo en servidor, rutas admin con rol");
