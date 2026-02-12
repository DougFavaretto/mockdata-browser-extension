import { describe, expect, it } from 'vitest'

import { generateUuid } from './uuid'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('generateUuid', () => {
  it('generates valid UUID v4', () => {
    const uuid = generateUuid()
    expect(uuid).toMatch(UUID_V4_REGEX)
  })
})
