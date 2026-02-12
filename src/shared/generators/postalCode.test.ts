import { describe, expect, it } from 'vitest'

import { generatePostalCode } from './postalCode'

describe('generatePostalCode', () => {
  it('generates postal code', () => {
    const postalCode = generatePostalCode()
    expect(postalCode).toMatch(/^\d{5}-\d{3}$/)
  })
})
