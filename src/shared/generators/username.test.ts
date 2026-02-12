import { describe, expect, it } from 'vitest'

import { generateUsername } from './username'

describe('generateUsername', () => {
  it('generates ascii-safe username without spaces', () => {
    const username = generateUsername()

    expect(username).toMatch(/^[a-z]+\.[a-z]+\.[a-z]{2}\d{2}$/)
    expect(username).not.toContain(' ')
  })
})
