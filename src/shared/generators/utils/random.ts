const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'

export const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

export const randomChoice = <T>(items: readonly T[]): T => items[randomInt(0, items.length - 1)]

export const randomDigits = (length: number): string => {
  let value = ''
  for (let index = 0; index < length; index += 1) {
    value += DIGITS[randomInt(0, DIGITS.length - 1)]
  }
  return value
}

export const randomLetters = (length: number): string => {
  let value = ''
  for (let index = 0; index < length; index += 1) {
    value += LETTERS[randomInt(0, LETTERS.length - 1)]
  }
  return value
}
