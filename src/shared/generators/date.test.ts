import { describe, expect, it } from 'vitest'

import { generateDate } from './date'

describe('generateDate', () => {
  it('generates date in configured formats', () => {
    expect(generateDate('dd/MM/yyyy')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    expect(generateDate('yyyy-MM-dd')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(generateDate('MM/dd/yyyy')).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})
