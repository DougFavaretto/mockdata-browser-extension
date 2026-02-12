import { faker } from './utils/faker'

export const generateRandomText = (): string => faker.lorem.sentence({ min: 3, max: 10 })
