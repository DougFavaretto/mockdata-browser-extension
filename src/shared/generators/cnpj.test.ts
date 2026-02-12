import { describe, expect, it } from 'vitest'

import { generateCnpj } from './cnpj'
import { validateCnpj } from './testUtils'

describe('generateCnpj', () => {
  it('generates a valid CNPJ with mask', () => {
    const cnpj = generateCnpj()
    expect(cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    expect(validateCnpj(cnpj)).toBe(true)
  })
})
