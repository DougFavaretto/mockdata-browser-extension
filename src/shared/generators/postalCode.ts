import { randomDigits } from './utils/random'

export const generatePostalCode = (): string => {
  const raw = randomDigits(8)
  return `${raw.slice(0, 5)}-${raw.slice(5, 8)}`
}
