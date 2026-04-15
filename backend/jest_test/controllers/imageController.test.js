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

const { getImages, uploadImage } = await import('../../src/controllers/imageController.js')

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

describe('imageController', () => {
  beforeEach(() => {
    queryMock.mockReset()
    celLetezikMock.mockReset()
    normalizalCelTipusMock.mockReset()
    createActivityMock.mockReset()
    normalizalCelTipusMock.mockImplementation((v) => v)
  })

  test('getImages 400-at ad hibás cél esetén', async () => {
    normalizalCelTipusMock.mockReturnValueOnce(null)
    const req = { query: { cel_tipus: 'rossz', cel_id: 1 } }
    const res = createRes()

    await getImages(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.jsonBody).toEqual({ error: 'Hibás cél' })
  })

  test('getImages visszaadja az elfogadott képeket username mezővel', async () => {
    queryMock.mockResolvedValueOnce([[
      {
        id: 1,
        fajl_utvonal: '/uploads/x.jpg',
        leiras: 'szép',
        letrehozva: '2026-04-15',
        felhasznalonev: 'bringas'
      }
    ]])

    const req = { query: { cel_tipus: 'esemenyek', cel_id: 3 } }
    const res = createRes()

    await getImages(req, res)

    expect(queryMock).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    expect(res.jsonBody[0].username).toBe('bringas')
  })

  test('uploadImage 400-at ad ha nincs fájl', async () => {
    const req = {
      body: { cel_tipus: 'esemenyek', cel_id: 1, leiras: 'teszt' },
      user: { id: 5 },
      file: null
    }
    const res = createRes()

    await uploadImage(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.jsonBody).toEqual({ error: 'Nincs fájl' })
  })
})