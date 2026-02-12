import { generatePostalCode } from './postalCode'
import { BRAZIL_STATES } from './utils/brazil'
import { randomChoice, randomInt } from './utils/random'

const STREET_NAMES = [
  'Rua das Acacias',
  'Avenida Central',
  'Rua do Comercio',
  'Travessa Bela Vista',
  'Avenida Atlantica',
  'Rua das Flores',
  'Rua Projetada',
  'Alameda Primavera',
]

const NEIGHBORHOODS = [
  'Centro',
  'Jardim Europa',
  'Vila Nova',
  'Boa Vista',
  'Santa Luzia',
  'Jardim America',
  'Industrial',
  'Alto da Serra',
]

export const generateAddress = (): string => {
  const street = randomChoice(STREET_NAMES)
  const number = randomInt(1, 9999)
  const neighborhood = randomChoice(NEIGHBORHOODS)
  const cityAndState = randomChoice(BRAZIL_STATES)
  const postalCode = generatePostalCode()

  return `${street}, ${number} - ${neighborhood}, ${cityAndState.capital}/${cityAndState.code}, CEP ${postalCode}`
}
