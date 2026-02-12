import { faker } from './utils/faker'

export const generateEmail = (): string => faker.internet.email().toLowerCase()
