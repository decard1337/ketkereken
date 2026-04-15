import { beforeEach, afterEach, describe, expect, jest, test } from '@jest/globals'

const queryMock = jest.fn()

await jest.unstable_mockModule('../../src/config/db.js', () => ({
  pool: {
    query: queryMock
  }
}))

const { getPublicTable } = await import('../../src/controllers/publicController.js')

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

describe('publicController.getPublicTable', () => {
  beforeEach(() => {
    queryMock.mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('400-at ad ismeretlen tábla esetén', async () => {
    const req = { params: { tabla: 'randomtabla' } }
    const res = createRes()

    await getPublicTable(req, res)

    expect(queryMock).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(400)
    expect(res.jsonBody).toEqual({ error: 'Ismeretlen tábla' })
  })

  test('az aktiv rekordokat adja vissza ismert táblánál', async () => {
    const rows = [{ id: 1, nev: 'Teszt esemény', statusz: 'aktiv' }]
    queryMock.mockResolvedValueOnce([rows])

    const req = { params: { tabla: 'esemenyek' } }
    const res = createRes()

    await getPublicTable(req, res)

    expect(queryMock).toHaveBeenCalledWith(
      "SELECT * FROM esemenyek WHERE statusz='aktiv' ORDER BY id ASC"
    )
    expect(res.statusCode).toBe(200)
    expect(res.jsonBody).toEqual(rows)
  })

  test('500-at ad ha adatbázis hiba történik', async () => {
    queryMock.mockRejectedValueOnce(new Error('db hiba'))

    const req = { params: { tabla: 'utvonalak' } }
    const res = createRes()

    await getPublicTable(req, res)

    expect(res.statusCode).toBe(500)
    expect(res.jsonBody).toEqual({ error: 'Lekérdezési hiba' })
  })
})