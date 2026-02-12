import { describe, expect, it } from 'vitest'

import { generateCreditCard } from './creditCard'
import { validateLuhn } from './testUtils'

describe('generateCreditCard', () => {
  it('generates credit card valid by Luhn', () => {
    const cardNumber = generateCreditCard()
    expect(cardNumber).toMatch(/^\d{4} \d{4} \d{4} \d{4}$/)
    expect(validateLuhn(cardNumber)).toBe(true)
  })
})
