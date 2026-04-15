import test from "node:test"
import assert from "node:assert/strict"
import { normalizalCelTipus } from "../../src/utils/celHelpers.js"

test("normalizalCelTipus jól alakítja át az értékeket", async () => {
  assert.equal(normalizalCelTipus("utvonal"), "utvonalak")
  assert.equal(normalizalCelTipus("destinaciok"), "destinaciok")
  assert.equal(normalizalCelTipus("esemeny"), "esemenyek")
  assert.equal(normalizalCelTipus("kolcsonzo"), "kolcsonzok")
  assert.equal(normalizalCelTipus("nincsilyen"), null)
})
