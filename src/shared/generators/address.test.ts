import { describe, expect, it } from 'vitest'

import { generateAddress } from './address'

describe('generateAddress', () => {
  it('generates complete address', () => {
    const address = generateAddress()
    expect(address).toContain('CEP')
    expect(address).toMatch(/\d{5}-\d{3}$/)
    expect(address).toMatch(/\/[A-Z]{2}, CEP/)
  })
})
