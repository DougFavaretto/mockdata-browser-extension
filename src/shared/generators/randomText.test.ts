import { describe, expect, it } from 'vitest'

import { generateRandomText } from './randomText'

describe('generateRandomText', () => {
  it('generates random text using faker', () => {
    const text = generateRandomText()
    expect(text.trim().length).toBeGreaterThan(3)
  })
})
