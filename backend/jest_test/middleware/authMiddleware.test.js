import { describe, expect, jest, test } from '@jest/globals'
import { adminRequired, authOptional, authRequired } from '../../src/middleware/authMiddleware.js'
import { makeToken } from '../../src/utils/authHelpers.js'

function createRes() {
  let statusCode = 200
  let jsonBody = null

  return {
    get statusCode() {
      return statusCode
    },
    get jsonBody() {
      return jsonBody
    },
    status(code) {
      statusCode = code
      return this
    },
    json(body) {
      jsonBody = body
      return this
    }
  }
}

describe('authMiddleware', () => {
  test('authRequired 401-et ad ha nincs token', () => {
    const req = { cookies: {}, headers: {} }
    const res = createRes()
    const next = jest.fn()

    authRequired(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(401)
    expect(res.jsonBody).toEqual({ error: 'Nincs bejelentkezve' })
  })

  test('authRequired továbbenged érvényes tokennel', () => {
    const token = makeToken({ id: 1, email: 'a@a.hu', username: 'aa', role: 'felhasznalo' })
    const req = { cookies: { kk_token: token }, headers: {} }
    const res = createRes()
    const next = jest.fn()

    authRequired(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user.id).toBe(1)
    expect(req.user.role).toBe('felhasznalo')
  })

  test('authRequired 401-et ad hibás tokennél', () => {
    const req = { cookies: { kk_token: 'hibas.token' }, headers: {} }
    const res = createRes()
    const next = jest.fn()

    authRequired(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(401)
    expect(res.jsonBody).toEqual({ error: 'Érvénytelen token' })
  })

  test('adminRequired 403-at ad ha a user nem admin', () => {
    const token = makeToken({ id: 2, email: 'u@u.hu', username: 'user', role: 'felhasznalo' })
    const req = { cookies: { kk_token: token }, headers: {} }
    const res = createRes()
    const next = jest.fn()

    adminRequired(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
    expect(res.jsonBody).toEqual({ error: 'Csak admin' })
  })

  test('authOptional token nélkül null usert állít be', () => {
    const req = { cookies: {}, headers: {} }
    const res = createRes()
    const next = jest.fn()

    authOptional(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeNull()
  })

  test('authOptional hibás tokennél sem dob hibát, csak null usert ad', () => {
    const req = { cookies: { kk_token: 'rossz.token' }, headers: {} }
    const res = createRes()
    const next = jest.fn()

    authOptional(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toBeNull()
  })
})