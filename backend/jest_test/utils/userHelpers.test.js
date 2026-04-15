import { describe, expect, test } from '@jest/globals'
import { userToResponse } from '../../src/utils/userHelpers.js'

describe('userHelpers', () => {
  test('userToResponse átnevezi és megtartja a publikus mezőket', () => {
    const input = {
      id: 8,
      email: 'teszt@example.com',
      felhasznalonev: 'kerekes',
      rang: 'felhasznalo',
      profilkep: '/uploads/p.png',
      bio: 'leírás',
      letrehozva: '2026-01-01'
    }

    expect(userToResponse(input)).toEqual({
      id: 8,
      email: 'teszt@example.com',
      username: 'kerekes',
      role: 'felhasznalo',
      profilkep: '/uploads/p.png',
      bio: 'leírás',
      letrehozva: '2026-01-01'
    })
  })
})