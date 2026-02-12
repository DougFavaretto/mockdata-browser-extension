import { BRAZIL_DDDS } from './utils/brazil'
import { randomChoice, randomDigits } from './utils/random'

export const generatePhone = (): string => {
  const ddd = randomChoice(BRAZIL_DDDS)
  const firstBlock = `9${randomDigits(4)}`
  const secondBlock = randomDigits(4)

  return `(${ddd}) ${firstBlock}-${secondBlock}`
}
