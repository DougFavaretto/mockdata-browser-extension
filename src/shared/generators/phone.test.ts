import { describe, expect, it } from 'vitest'

import { generatePhone } from './phone'
import { BRAZIL_DDDS } from './utils/brazil'

describe('generatePhone', () => {
  it('generates brazilian phone number', () => {
    const phone = generatePhone()
    expect(phone).toMatch(/^\(\d{2}\) 9\d{4}-\d{4}$/)

    const ddd = phone.slice(1, 3)
    expect(BRAZIL_DDDS).toContain(ddd)
  })
})
