import { describe, expect, it } from 'vitest'

import { generateByType } from './index'

describe('generateByType', () => {
  it('supports generation by data type', () => {
    expect(generateByType('cpf')).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    expect(generateByType('email')).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    expect(generateByType('username')).toMatch(/^[a-z]+\.[a-z]+\.[a-z]{2}\d{2}$/)
    expect(generateByType('password')).toHaveLength(16)
    expect(generateByType('uuid')).toMatch(/^[0-9a-f-]{36}$/i)
  })
})
