import { describe, expect, it } from 'vitest'

import { generateCarPlate } from './carPlate'

describe('generateCarPlate', () => {
  it('generates Mercosul car plate', () => {
    const plate = generateCarPlate()
    expect(plate).toMatch(/^[A-Z]{3}\d[A-Z]\d{2}$/)
  })
})
