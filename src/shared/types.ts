export const DATA_TYPES = [
  'cnpj',
  'cpf',
  'fullName',
  'username',
  'password',
  'uuid',
  'email',
  'phone',
  'address',
  'date',
  'randomNumber',
  'randomText',
  'url',
  'carPlate',
  'creditCard',
  'postalCode',
  'loremIpsum',
] as const

export type DataType = (typeof DATA_TYPES)[number]

export const DATE_FORMATS = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'] as const

export type DateFormat = (typeof DATE_FORMATS)[number]

export interface Shortcut {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  key: string
}

export interface GeneratorConfigItem {
  enabled: boolean
  shortcut: Shortcut | null
  favorite: boolean
}

export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

export interface ExtensionConfig {
  version: 2
  dateFormat: DateFormat
  keyboardShortcutsEnabled: boolean
  passwordOptions: PasswordOptions
  items: Record<DataType, GeneratorConfigItem>
}

export interface FillResult {
  ok: boolean
  reason?: 'NO_TARGET' | 'DISABLED' | 'INVALID_SHORTCUT'
}
