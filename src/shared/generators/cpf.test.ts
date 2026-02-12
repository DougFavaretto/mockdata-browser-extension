import { describe, expect, it } from 'vitest'

import { generateCpf } from './cpf'
import { validateCpf } from './testUtils'

describe('generateCpf', () => {
  it('generates a valid CPF with mask', () => {
    const cpf = generateCpf()
    expect(cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    expect(validateCpf(cpf)).toBe(true)
  })
})
