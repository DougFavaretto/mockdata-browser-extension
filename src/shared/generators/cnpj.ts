import { randomDigits } from './utils/random'

const formatCnpj = (digits: string): string =>
  `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`

const calculateCnpjDigit = (numbers: number[], weights: number[]): number => {
  const total = numbers.reduce((sum, value, index) => sum + value * weights[index], 0)
  const remainder = total % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export const generateCnpj = (): string => {
  const baseDigits = randomDigits(12)
    .split('')
    .map((digit) => Number(digit))

  const firstDigit = calculateCnpjDigit(baseDigits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateCnpjDigit([...baseDigits, firstDigit], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return formatCnpj(`${baseDigits.join('')}${firstDigit}${secondDigit}`)
}
