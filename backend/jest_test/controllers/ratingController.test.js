import { beforeEach, describe, expect, jest, test } from '@jest/globals'

const queryMock = jest.fn()
const celLetezikMock = jest.fn()
const normalizalCelTipusMock = jest.fn((v) => v)
const createActivityMock = jest.fn()

await jest.unstable_mockModule('../../src/config/db.js', () => ({
  pool: { query: queryMock }
}))

await jest.unstable_mockModule('../../src/utils/typeHelpers.js', () => ({
  celLetezik: celLetezikMock,
  normalizalCelTipus: normalizalCelTipusMock,
  resolveCelTitle: jest.fn()
}))

await jest.unstable_mockModule('../../src/utils/activityHelpers.js', () => ({
  createActivity: createActivityMock
}))

const { createOrUpdateRating, getRatings } = await import('../../src/controllers/ratingController.js')

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

describe('ratingController', () => {
  beforeEach(() => {
    queryMock.mockReset()
    celLetezikMock.mockReset()
    normalizalCelTipusMock.mockReset()
    createActivityMock.mockReset()
    normalizalCelTipusMock.mockImplementation((v) => v)
  })

  test('createOrUpdateRating 400-at ad hibás pontszámra', async () => {
    const req = {
      body: { cel_tipus: 'esemenyek', cel_id: 1, pontszam: 8, szoveg: 'rossz' },
      user: { id: 2 }
    }
    const res = createRes()

    await createOrUpdateRating(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.jsonBody).toEqual({ error: 'Hibás pontszám' })
  })

  test('createOrUpdateRating 404-et ad ha a cél nem létezik', async () => {
    celLetezikMock.mockResolvedValueOnce(false)

    const req = {
      body: { cel_tipus: 'esemenyek', cel_id: 1, pontszam: 5, szoveg: 'szuper' },
      user: { id: 2 }
    }
    const res = createRes()

    await createOrUpdateRating(req, res)

    expect(res.statusCode).toBe(404)
    expect(res.jsonBody).toEqual({ error: 'A cél nem létezik' })
  })

  test('getRatings 400-at ad hibás cél esetén', async () => {
    normalizalCelTipusMock.mockReturnValueOnce(null)

    const req = { query: { cel_tipus: 'rossz', cel_id: 1 } }
    const res = createRes()

    await getRatings(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.jsonBody).toEqual({ error: 'Hibás cél' })
  })

  test('getRatings összerakja az adatok/darab/atlag választ', async () => {
    queryMock
      .mockResolvedValueOnce([[
        {
          id: 1,
          pontszam: 5,
          szoveg: 'jó',
          letrehozva: '2026',
          felhasznalonev: 'anna'
        }
      ]])
      .mockResolvedValueOnce([[{ darab: 1, atlag: 5 }]])

    const req = { query: { cel_tipus: 'esemenyek', cel_id: 1 } }
    const res = createRes()

    await getRatings(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.jsonBody.darab).toBe(1)
    expect(res.jsonBody.atlag).toBe(5)
    expect(res.jsonBody.adatok[0].username).toBe('anna')
  })
})