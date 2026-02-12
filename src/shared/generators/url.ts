import { faker } from './utils/faker'

export const generateUrl = (): string => faker.internet.url({ protocol: 'https' })
