// Comprueba que las listas de requisitos de cada universidad están bien formadas.
// Ejecutar: node --test tests/requisitos.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { REQUISITOS_UNIFRANZ_2017 } from "../src/lib/requisitos/unifranz-2017.ts";
import {
  REQUISITOS_UCB_2020,
  requisitosUcbParaModalidad,
} from "../src/lib/requisitos/ucb-2020.ts";

const LISTAS = { unifranz: REQUISITOS_UNIFRANZ_2017, ucb: REQUISITOS_UCB_2020 };

for (const [nombre, lista] of Object.entries(LISTAS)) {
  test(`${nombre}: IDs únicos y cada requisito dice dónde está en la guía`, () => {
    const ids = lista.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length, "hay IDs repetidos");
    for (const r of lista) {
      assert.ok(r.pagina || r.referencia, `${r.id}: sin página ni referencia`);
      assert.ok(r.regla.length > 10, `${r.id}: regla vacía`);
      assert.ok(["codigo", "ia"].includes(r.verificador), `${r.id}: verificador inválido`);
    }
  });
}

test("ucb: cada modalidad con documento recibe requisitos propios además de los comunes", () => {
  const comunes = REQUISITOS_UCB_2020.filter((r) => !r.modalidades).length;
  for (const m of ["ucb-monografia", "ucb-pg-tecnico", "ucb-pasantia", "ucb-tesis", "ucb-proyecto-grado", "ucb-trabajo-dirigido"]) {
    const propios = requisitosUcbParaModalidad(m).length - comunes;
    assert.ok(propios >= 2, `${m}: solo ${propios} requisitos propios`);
  }
});

test("ucb: la memoria de 30 a 50 páginas aplica solo a pasantía y trabajo dirigido", () => {
  const r = REQUISITOS_UCB_2020.find((x) => x.id === "mod-memoria-extension");
  assert.deepEqual([...r.modalidades].sort(), ["ucb-pasantia", "ucb-trabajo-dirigido"]);
});
