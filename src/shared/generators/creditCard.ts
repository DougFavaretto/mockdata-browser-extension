import { randomDigits } from './utils/random'

const calculateLuhnCheckDigit = (partialDigits: string): number => {
  let sum = 0
  let shouldDouble = true

  for (let index = partialDigits.length - 1; index >= 0; index -= 1) {
    let value = Number(partialDigits[index])

    if (shouldDouble) {
      value *= 2
      if (value > 9) {
        value -= 9
      }
    }

    sum += value
    shouldDouble = !shouldDouble
  }

  return (10 - (sum % 10)) % 10
}

export const generateCreditCard = (): string => {
  const partial = `4${randomDigits(14)}`
  const checkDigit = calculateLuhnCheckDigit(partial)
  const cardNumber = `${partial}${checkDigit}`

  return cardNumber.match(/.{1,4}/g)?.join(' ') ?? cardNumber
}
