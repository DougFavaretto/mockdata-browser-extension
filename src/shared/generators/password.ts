import type { PasswordOptions } from '../types'
import { randomChoice, randomInt } from './utils/random'

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz'
const NUMBER_CHARS = '0123456789'
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

const normalizePasswordOptions = (options: PasswordOptions): PasswordOptions => {
  const normalized: PasswordOptions = {
    length: Math.min(64, Math.max(8, Math.trunc(options.length))),
    uppercase: options.uppercase,
    lowercase: options.lowercase,
    numbers: options.numbers,
    symbols: options.symbols,
  }

  if (!normalized.uppercase && !normalized.lowercase && !normalized.numbers && !normalized.symbols) {
    normalized.lowercase = true
  }

  return normalized
}

const shuffle = (value: string[]): string[] => {
  for (let index = value.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInt(0, index)
    const current = value[index]
    value[index] = value[randomIndex]
    value[randomIndex] = current
  }

  return value
}

export const generatePassword = (options: PasswordOptions): string => {
  const normalizedOptions = normalizePasswordOptions(options)

  const selectedGroups: string[] = []
  if (normalizedOptions.uppercase) {
    selectedGroups.push(UPPERCASE_CHARS)
  }
  if (normalizedOptions.lowercase) {
    selectedGroups.push(LOWERCASE_CHARS)
  }
  if (normalizedOptions.numbers) {
    selectedGroups.push(NUMBER_CHARS)
  }
  if (normalizedOptions.symbols) {
    selectedGroups.push(SYMBOL_CHARS)
  }

  const requiredChars = selectedGroups.map((group) => randomChoice(group.split('')))
  const allChars = selectedGroups.join('').split('')

  const generatedChars: string[] = [...requiredChars]
  while (generatedChars.length < normalizedOptions.length) {
    generatedChars.push(randomChoice(allChars))
  }

  return shuffle(generatedChars).join('')
}
