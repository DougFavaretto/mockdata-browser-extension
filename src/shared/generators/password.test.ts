import { describe, expect, it } from 'vitest'

import { generatePassword } from './password'

describe('generatePassword', () => {
  it('respects configured length and enabled groups', () => {
    const password = generatePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })

    expect(password).toHaveLength(20)
    expect(password).toMatch(/[A-Z]/)
    expect(password).toMatch(/[a-z]/)
    expect(password).toMatch(/[0-9]/)
    expect(password).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/)
  })

  it('falls back to lowercase group when all options are disabled', () => {
    const password = generatePassword({
      length: 12,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
    })

    expect(password).toHaveLength(12)
    expect(password).toMatch(/^[a-z]+$/)
  })
})
