import { randomInt } from './utils/random'

export const generateRandomNumber = (): string => String(randomInt(0, 9999))
