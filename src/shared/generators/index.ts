import type { DataType, DateFormat, PasswordOptions } from '../types'

import { generateAddress } from './address'
import { generateCarPlate } from './carPlate'
import { generateCnpj } from './cnpj'
import { generateCpf } from './cpf'
import { generateCreditCard } from './creditCard'
import { generateDate } from './date'
import { generateEmail } from './email'
import { generateFullName } from './fullName'
import { generateLoremIpsum } from './loremIpsum'
import { generatePassword } from './password'
import { generatePhone } from './phone'
import { generatePostalCode } from './postalCode'
import { generateRandomNumber } from './randomNumber'
import { generateRandomText } from './randomText'
import { generateUrl } from './url'
import { generateUsername } from './username'
import { generateUuid } from './uuid'

export {
  generateAddress,
  generateCarPlate,
  generateCnpj,
  generateCpf,
  generateCreditCard,
  generateDate,
  generateEmail,
  generateFullName,
  generateLoremIpsum,
  generatePassword,
  generatePhone,
  generatePostalCode,
  generateRandomNumber,
  generateRandomText,
  generateUrl,
  generateUsername,
  generateUuid,
}

export interface GeneratorOptions {
  dateFormat: DateFormat
  passwordOptions: PasswordOptions
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  dateFormat: 'dd/MM/yyyy',
  passwordOptions: {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
}

export const generateByType = (dataType: DataType, options?: Partial<GeneratorOptions>): string => {
  const resolvedOptions: GeneratorOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  switch (dataType) {
    case 'cnpj':
      return generateCnpj()
    case 'cpf':
      return generateCpf()
    case 'fullName':
      return generateFullName()
    case 'username':
      return generateUsername()
    case 'password':
      return generatePassword(resolvedOptions.passwordOptions)
    case 'uuid':
      return generateUuid()
    case 'email':
      return generateEmail()
    case 'phone':
      return generatePhone()
    case 'address':
      return generateAddress()
    case 'date':
      return generateDate(resolvedOptions.dateFormat)
    case 'randomNumber':
      return generateRandomNumber()
    case 'randomText':
      return generateRandomText()
    case 'url':
      return generateUrl()
    case 'carPlate':
      return generateCarPlate()
    case 'creditCard':
      return generateCreditCard()
    case 'postalCode':
      return generatePostalCode()
    case 'loremIpsum':
      return generateLoremIpsum()
    default: {
      const exhaustiveCheck: never = dataType
      return exhaustiveCheck
    }
  }
}
