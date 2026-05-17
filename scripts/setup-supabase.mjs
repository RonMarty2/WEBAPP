#!/usr/bin/env node
/**
 * setup-supabase.mjs
 *
 * Script de un solo paso para conectar este worktree a Supabase.
 * Recibe las 2 keys (anon + service_role) por args, las escribe al
 * .env.local respetando lo que ya hay, y verifica la conexión.
 *
 * Uso:
 *   node scripts/setup-supabase.mjs --anon "eyJ..." --service "eyJ..."
 *
 * O con env vars:
 *   SUPABASE_ANON_KEY="eyJ..." SUPABASE_SERVICE_KEY="eyJ..." node scripts/setup-supabase.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const envPath = resolve(projectRoot, ".env.local");

// El project ID de Supabase del usuario — visible en la URL del dashboard
const SUPABASE_PROJECT_ID = "svaswbryumacbirecvjt";
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// ─── Parseo de args ─────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  let anon = process.env.SUPABASE_ANON_KEY ?? "";
  let service = process.env.SUPABASE_SERVICE_KEY ?? "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--anon" && args[i + 1]) anon = args[++i];
    if (args[i] === "--service" && args[i + 1]) service = args[++i];
  }
  return { anon: anon.trim(), service: service.trim() };
}

// ─── Validación básica de formato de key ────────────────────────
// Supabase soporta 2 formatos de API keys:
//   1. Legacy (JWT): "eyJhbGci..." con 3 segmentos separados por puntos
//   2. Nuevo (Sept 2024+): "sb_publishable_*" / "sb_secret_*"
function looksLikeJwt(s) {
  return /^eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/.test(s);
}
function looksLikeSbKey(s) {
  return /^sb_(publishable|secret)_[A-Za-z0-9_\-]{20,}$/.test(s);
}
function looksLikeValidKey(s) {
  return looksLikeJwt(s) || looksLikeSbKey(s);
}

// ─── Lectura y mutación de .env.local ───────────────────────────
function updateEnvFile(anon, service) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const lines = content.split("\n");

  function upsert(key, value) {
    const idx = lines.findIndex((l) => l.trim().startsWith(`${key}=`));
    const line = `${key}=${value}`;
    if (idx >= 0) lines[idx] = line;
    else lines.push(line);
  }

  upsert("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
  upsert("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);
  upsert("SUPABASE_SERVICE_ROLE_KEY", service);

  // Mantener una línea en blanco al final
  const finalContent = lines.join("\n").replace(/\n+$/, "") + "\n";
  writeFileSync(envPath, finalContent, "utf8");
}

// ─── Test de conexión con la service key ────────────────────────
async function testConnection(url, serviceKey) {
  // Llamada a /rest/v1/proyectos?limit=1 — debería responder 200 si tabla existe.
  try {
    const res = await fetch(`${url}/rest/v1/proyectos?limit=1`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      return { ok: true, sample_count: Array.isArray(json) ? json.length : 0 };
    }
    return { ok: false, status: res.status, error: await res.text() };
  } catch (e) {
    return { ok: false, status: 0, error: e?.message ?? String(e) };
  }
}

// ─── MAIN ───────────────────────────────────────────────────────
async function main() {
  const { anon, service } = parseArgs();

  if (!anon || !service) {
    console.error("\n❌ Faltan keys. Uso:");
    console.error('   node scripts/setup-supabase.mjs --anon "eyJ..." --service "eyJ..."\n');
    process.exit(1);
  }

  if (!looksLikeValidKey(anon)) {
    console.error("\n❌ La anon/publishable key no tiene formato válido.");
    console.error("   Formatos aceptados: 'eyJ...' (JWT legacy) o 'sb_publishable_*'.");
    process.exit(2);
  }
  if (!looksLikeValidKey(service)) {
    console.error("\n❌ La service_role/secret key no tiene formato válido.");
    console.error("   Formatos aceptados: 'eyJ...' (JWT legacy) o 'sb_secret_*'.");
    process.exit(3);
  }

  console.log(`\n📝 Escribiendo en: ${envPath}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_URL    = ${SUPABASE_URL}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY = ${anon.slice(0, 24)}…`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY   = ${service.slice(0, 24)}…`);
  updateEnvFile(anon, service);
  console.log("✓ .env.local actualizado.");

  console.log("\n🔌 Probando conexión con tabla 'proyectos'…");
  const test = await testConnection(SUPABASE_URL, service);
  if (test.ok) {
    console.log(`✓ Conexión OK. Filas leídas de prueba: ${test.sample_count}`);
    console.log("\n🎉 Supabase conectado. Reiniciá el dev server (Ctrl+C + npm run dev).");
  } else {
    console.error(`\n⚠️  Conexión falló: HTTP ${test.status}`);
    console.error(`   ${test.error}`);
    console.error("\n   Las keys quedaron escritas igual. Revisá si:");
    console.error("   - La tabla 'proyectos' existe en Supabase Studio");
    console.error("   - La service_role key es la correcta (no la anon)");
    console.error("   - El project_id es svaswbryumacbirecvjt");
    process.exit(4);
  }
}

main();
