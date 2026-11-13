// Revisa que ningún texto visible use voseo (regla bloqueante de CLAUDE.md).
// Los prompts de src/lib/prompts quedan fuera: ahí se permite nombrar las
// palabras prohibidas para decirle a la IA que NO las use.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const RAIZ = process.cwd();
const CARPETAS = ["src/app", "src/components", "src/lib"];
const EXCLUIR = [`src${sep}lib${sep}prompts`, "node_modules", ".next"];
const EXTENSIONES = /\.(ts|tsx|mjs|md|json)$/;

const PALABRAS = `sabés querés tenés necesitás elegís podés esperás hacé agregá usá completá generá
continuá guardá seleccioná intentá reintentá instalá configurá contactá reformulá pegá pulsá tocá
reemplazá cambiá cerrá abrí empezá seguí escribí mandá dejá llená revisá decidí andá creá cuidá
cancelá encontrá aprovechá recordá olvidá prestá preguntá disfrutá aprendé fijate subí bajá tirá
sumá mantené devolvé probá cargá descomentá restaurá comentá mirá descargás conversás regenerás
mostrás escuchás leés vivís salís cobrás llamás llevás traés`.split(/\s+/);

// \p{L} en vez de \b: con acentos \b da falsos positivos ("subía" no es "subí").
const REGEX = new RegExp(`(?<![\\p{L}])(${PALABRAS.join("|")})(?![\\p{L}])`, "giu");

// "decidí" también es primera persona del pasado ("Doctora, decidí estratificar"):
// en esa respuesta de defensa es español correcto, no voseo.
const PERMITIDOS = ["casos/defensa/defensa-cafeteria-umss.ts:decidí"];

function* archivos(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (EXCLUIR.some((e) => ruta.includes(e))) continue;
    if (statSync(ruta).isDirectory()) yield* archivos(ruta);
    else if (EXTENSIONES.test(nombre)) yield ruta;
  }
}

const hallazgos = [];
for (const carpeta of CARPETAS) {
  for (const ruta of archivos(join(RAIZ, carpeta))) {
    readFileSync(ruta, "utf8").split("\n").forEach((linea, i) => {
      const rel = relative(RAIZ, ruta).replace(/\\/g, "/");
      const m = (linea.match(REGEX) ?? []).filter(
        (p) => !PERMITIDOS.some((x) => x === `${rel.split("src/lib/")[1] ?? rel}:${p.toLowerCase()}`),
      );
      if (m.length) hallazgos.push(`${rel}:${i + 1}  ${[...new Set(m)].join(", ")}`);
    });
  }
}

if (hallazgos.length) {
  console.error(`✗ Voseo encontrado (${hallazgos.length}):\n` + hallazgos.join("\n"));
  process.exit(1);
}
console.log("✓ Sin voseo");
