// Prueba del inspector de formato UCB contra el armador de LaTeX real.
// Ejecutar: node --test tests/inspectores-ucb.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPreambleUCB,
  buildCaratulaUCB,
  buildTribunalUCB,
} from "../src/lib/latex/preamble-ucb.ts";
import { inspeccionarFormatoUcb } from "../src/lib/inspectores/formato-ucb.ts";
import { resumirHallazgos } from "../src/lib/inspectores/formato-unifranz.ts";
import { REQUISITOS_UCB_2020 } from "../src/lib/requisitos/ucb-2020.ts";

const hallazgos = inspeccionarFormatoUcb(
  buildPreambleUCB(),
  buildCaratulaUCB({
    nombre: "Ana Pérez Rojas",
    titulo: "Plan de negocio de prueba",
    departamento: "Departamento de Administración, Economía y Finanzas",
    carrera: "Carrera de Administración de Empresas",
    tipo_trabajo: "Proyecto de Grado de Licenciatura",
    universidad: "Universidad Católica Boliviana San Pablo",
    ciudad: "Cochabamba",
    pais: "Bolivia",
    mes: "Marzo",
    anio: "2026",
  }),
  buildTribunalUCB(),
);
const porId = (id) => hallazgos.find((x) => x.requisitoId === id);

test("todo hallazgo corresponde a un requisito que existe en la guía de UCB", () => {
  const ids = new Set(REQUISITOS_UCB_2020.map((r) => r.id));
  for (const x of hallazgos) assert.ok(ids.has(x.requisitoId), `requisito desconocido: ${x.requisitoId}`);
});

test("el formato generado para UCB cumple todo lo que se puede comprobar", () => {
  const resumen = resumirHallazgos(hallazgos);
  assert.deepEqual(resumen.incumplen, [], JSON.stringify(resumen.incumplen, null, 2));
  assert.deepEqual(resumen.noVerificables, [], JSON.stringify(resumen.noVerificables, null, 2));
  for (const id of ["fmt-margenes", "fmt-fuente", "fmt-interlineado", "fmt-parrafos", "fmt-numeracion",
    "car-escudo", "car-titulo", "car-tipo", "car-autor", "car-lugar-fecha", "pre-tribunal"]) {
    assert.equal(porId(id)?.estado, "cumple", `${id}: ${JSON.stringify(porId(id))}`);
  }
});
