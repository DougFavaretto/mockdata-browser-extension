import { describe, expect, it } from 'vitest'

import { generateFullName } from './fullName'

describe('generateFullName', () => {
  it('generates full name with at least 3 words', () => {
    const fullName = generateFullName()
    expect(fullName.split(' ').length).toBeGreaterThanOrEqual(3)
  })
})
