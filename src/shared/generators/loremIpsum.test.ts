import { describe, expect, it } from 'vitest'

import { generateLoremIpsum } from './loremIpsum'

describe('generateLoremIpsum', () => {
  it('generates lorem ipsum text', () => {
    const lorem = generateLoremIpsum()
    expect(lorem.length).toBeGreaterThan(20)
  })
})
