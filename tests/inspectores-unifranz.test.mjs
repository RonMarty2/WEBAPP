// Prueba del inspector de formato UNIFRANZ contra el armador de LaTeX real.
// Ejecutar: node --test tests/inspectores-unifranz.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPreambleUNIFRANZ,
  buildCaratulaUNIFRANZ,
} from "../src/lib/latex/preamble-unifranz.ts";
import { inspeccionarFormatoUnifranz, resumirHallazgos } from "../src/lib/inspectores/formato-unifranz.ts";
import { REQUISITOS_UNIFRANZ_2017 } from "../src/lib/requisitos/unifranz-2017.ts";

const preambulo = buildPreambleUNIFRANZ();
const caratula = buildCaratulaUNIFRANZ({
  titulo: "Plan de negocio de prueba",
  nombre: "Ana Pérez",
  tutor: "Lic. Juan Rojas",
  universidad: "Universidad Privada Franz Tamayo",
  facultad: "Facultad de Ciencias Económicas",
  carrera: "Ingeniería Económica y Financiera",
  modalidad: "Proyecto de Grado",
  ciudad: "Cochabamba",
  pais: "Bolivia",
  anio: "2026",
});
const hallazgos = inspeccionarFormatoUnifranz(preambulo, caratula);
const porId = (id) => hallazgos.find((x) => x.requisitoId === id);

test("todo hallazgo corresponde a un requisito que existe en la guía", () => {
  const ids = new Set(REQUISITOS_UNIFRANZ_2017.map((r) => r.id));
  for (const x of hallazgos) assert.ok(ids.has(x.requisitoId), `requisito desconocido: ${x.requisitoId}`);
});

test("el formato generado cumple todo lo que se puede comprobar de la guía", () => {
  const incumplen = resumirHallazgos(hallazgos).incumplen;
  assert.deepEqual(incumplen, [], JSON.stringify(incumplen, null, 2));
  for (const id of [
    "fmt-margenes", "fmt-papel", "fmt-parrafo", "fmt-numeracion",
    "tit-nivel1", "tit-nivel2", "tit-nivel3", "tit-capitulo",
    "car-encabezado", "car-titulo", "car-logo", "car-modalidad",
    "car-postulante-tutor", "car-ciudad-anio",
  ]) {
    assert.equal(porId(id)?.estado, "cumple", `${id}: ${JSON.stringify(porId(id))}`);
  }
});

test("limitación conocida: Helvetica sustituye a Verdana (Overleaf no la trae)", () => {
  assert.equal(porId("fmt-fuente")?.estado, "aproximado");
});
