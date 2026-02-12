import { describe, expect, it } from 'vitest'

import { generateEmail } from './email'

describe('generateEmail', () => {
  it('generates valid email', () => {
    const email = generateEmail()
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })
})
