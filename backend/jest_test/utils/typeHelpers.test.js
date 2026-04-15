import { describe, expect, test } from '@jest/globals'
import { normalizalCelTipus } from '../../src/utils/typeHelpers.js'

describe('typeHelpers', () => {
  test('normalizalCelTipus az aliasokat a megfelelő táblanévre alakítja', () => {
    expect(normalizalCelTipus('utvonal')).toBe('utvonalak')
    expect(normalizalCelTipus('destinacio')).toBe('destinaciok')
    expect(normalizalCelTipus('esemeny')).toBe('esemenyek')
    expect(normalizalCelTipus('kolcsonzo')).toBe('kolcsonzok')
  })

  test('normalizalCelTipus trimeli és kisbetűsíti a bemenetet', () => {
    expect(normalizalCelTipus('  EsEmEnYeK  ')).toBe('esemenyek')
  })

  test('normalizalCelTipus ismeretlen értékre nullt ad', () => {
    expect(normalizalCelTipus('random')).toBeNull()
    expect(normalizalCelTipus(undefined)).toBeNull()
  })
})