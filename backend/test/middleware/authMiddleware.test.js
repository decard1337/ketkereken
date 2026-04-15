import test from "node:test"
import assert from "node:assert/strict"
import { authRequired } from "../../src/middleware/authMiddleware.js"

test("authRequired 401-et ad ha nincs token", async () => {
  const req = { cookies: {}, headers: {} }
  let statusCode = 200
  let jsonBody = null

  const res = {
    status(code) {
      statusCode = code
      return this
    },
    json(body) {
      jsonBody = body
      return this
    }
  }

  let nextCalled = false
  authRequired(req, res, () => {
    nextCalled = true
  })

  assert.equal(nextCalled, false)
  assert.equal(statusCode, 401)
  assert.deepEqual(jsonBody, { error: "Nincs bejelentkezve" })
})
