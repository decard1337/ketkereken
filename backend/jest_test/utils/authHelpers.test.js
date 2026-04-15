import { describe, expect, jest, test } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { clearAuthCookie, getToken, makeToken, setAuthCookie } from '../../src/utils/authHelpers.js'

describe('authHelpers', () => {
  test('makeToken létrehoz egy visszafejthető JWT-t a fontos mezőkkel', () => {
    const token = makeToken({
      id: 12,
      email: 'teszt@example.com',
      username: 'bringas',
      role: 'admin',
      profilkep: '/uploads/a.png',
      bio: 'bio',
      letrehozva: '2026-04-15'
    })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'valtoztass_meg')

    expect(decoded.id).toBe(12)
    expect(decoded.email).toBe('teszt@example.com')
    expect(decoded.username).toBe('bringas')
    expect(decoded.role).toBe('admin')
    expect(decoded.profilkep).toBe('/uploads/a.png')
    expect(decoded.bio).toBe('bio')
  })

  test('getToken cookie-ból olvassa ki a tokent', () => {
    const req = { cookies: { kk_token: 'cookie-token' }, headers: {} }
    expect(getToken(req)).toBe('cookie-token')
  })

  test('getToken Authorization headerből is kiolvassa a Bearer tokent', () => {
    const req = { cookies: {}, headers: { authorization: 'Bearer header-token' } }
    expect(getToken(req)).toBe('header-token')
  })

  test('getToken nullt ad vissza ha nincs token', () => {
    const req = { cookies: {}, headers: {} }
    expect(getToken(req)).toBeNull()
  })

  test('setAuthCookie beállítja a megfelelő auth cookie-t', () => {
    const res = { cookie: jest.fn() }
    setAuthCookie(res, 'abc123')

    expect(res.cookie).toHaveBeenCalledWith(
      'kk_token',
      'abc123',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/'
      })
    )
  })

  test('clearAuthCookie kinullázza az auth cookie-t', () => {
    const res = { cookie: jest.fn() }
    clearAuthCookie(res)

    expect(res.cookie).toHaveBeenCalledWith(
      'kk_token',
      '',
      expect.objectContaining({
        maxAge: 0,
        httpOnly: true,
        path: '/'
      })
    )
  })
})