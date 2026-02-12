import { describe, expect, it } from 'vitest'

import { generateUrl } from './url'

describe('generateUrl', () => {
  it('generates valid URL', () => {
    const value = generateUrl()
    const parsed = new URL(value)
    expect(parsed.protocol === 'http:' || parsed.protocol === 'https:').toBe(true)
  })
})
