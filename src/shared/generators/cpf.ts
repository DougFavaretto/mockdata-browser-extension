import { randomDigits } from './utils/random'

const formatCpf = (digits: string): string =>
  `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`

const calculateCpfDigit = (numbers: number[], factor: number): number => {
  const total = numbers.reduce((sum, value, index) => sum + value * (factor - index), 0)
  const remainder = total % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export const generateCpf = (): string => {
  const baseDigits = randomDigits(9)
    .split('')
    .map((digit) => Number(digit))

  const firstDigit = calculateCpfDigit(baseDigits, 10)
  const secondDigit = calculateCpfDigit([...baseDigits, firstDigit], 11)

  return formatCpf(`${baseDigits.join('')}${firstDigit}${secondDigit}`)
}
