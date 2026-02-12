import { BRAZIL_FIRST_NAMES, BRAZIL_LAST_NAMES, BRAZIL_STATES } from './utils/brazil'
import { randomInt } from './utils/random'

const normalizeUsernamePart = (value: string): string => value.toLowerCase().replace(/\s+/g, '')

const randomItem = <T>(items: readonly T[]): T => items[randomInt(0, items.length - 1)]

export const generateUsername = (): string => {
  const first = normalizeUsernamePart(randomItem(BRAZIL_FIRST_NAMES))
  const second = normalizeUsernamePart(randomItem(BRAZIL_LAST_NAMES))
  const state = randomItem(BRAZIL_STATES).code.toLowerCase()
  const suffix = String(randomInt(10, 99))

  return `${first}.${second}.${state}${suffix}`
}
