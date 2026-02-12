import { describe, expect, it } from 'vitest'

import { generateRandomNumber } from './randomNumber'

describe('generateRandomNumber', () => {
  it('generates random number in expected range', () => {
    const value = Number(generateRandomNumber())
    expect(Number.isInteger(value)).toBe(true)
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThanOrEqual(9999)
  })
})
