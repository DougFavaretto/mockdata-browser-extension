import { BRAZIL_FIRST_NAMES, BRAZIL_LAST_NAMES } from './utils/brazil'
import { randomChoice } from './utils/random'

export const generateFullName = (): string => {
  const firstName = randomChoice(BRAZIL_FIRST_NAMES)
  const lastNameA = randomChoice(BRAZIL_LAST_NAMES)
  const lastNameB = randomChoice(BRAZIL_LAST_NAMES)

  return `${firstName} ${lastNameA} ${lastNameB}`
}
