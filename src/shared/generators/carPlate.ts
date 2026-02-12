import { randomDigits, randomLetters } from './utils/random'

export const generateCarPlate = (): string =>
  `${randomLetters(3)}${randomDigits(1)}${randomLetters(1)}${randomDigits(2)}`
