import { dataTypeDefinitions } from './dataTypes'
import { createDefaultConfig } from './defaultConfig'
import { findDuplicateShortcut, getReservedShortcutReason, isShortcutValid, normalizeShortcut } from './shortcut'
import type { DataType, DateFormat, ExtensionConfig, GeneratorConfigItem, PasswordOptions, Shortcut } from './types'
import { DATE_FORMATS } from './types'

const CONFIG_STORAGE_KEY = 'fakeDataGeneratorConfig'

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isDateFormat = (value: unknown): value is DateFormat =>
  typeof value === 'string' && DATE_FORMATS.includes(value as DateFormat)

const sanitizeShortcut = (value: unknown): Shortcut | null => {
  if (!isObject(value)) {
    return null
  }

  const maybeShortcut: Shortcut = {
    ctrl: Boolean(value.ctrl),
    shift: Boolean(value.shift),
    alt: Boolean(value.alt),
    meta: Boolean(value.meta),
    key: typeof value.key === 'string' ? value.key : '',
  }

  const normalized = normalizeShortcut(maybeShortcut)
  if (!isShortcutValid(normalized)) {
    return null
  }

  return normalized
}

const clampLength = (value: number): number => {
  if (value < 8) {
    return 8
  }

  if (value > 64) {
    return 64
  }

  return value
}

const sanitizePasswordOptions = (value: unknown, defaults: PasswordOptions): PasswordOptions => {
  if (!isObject(value)) {
    return defaults
  }

  const lengthCandidate =
    typeof value.length === 'number' && Number.isFinite(value.length) ? Math.trunc(value.length) : defaults.length

  const sanitized: PasswordOptions = {
    length: clampLength(lengthCandidate),
    uppercase: typeof value.uppercase === 'boolean' ? value.uppercase : defaults.uppercase,
    lowercase: typeof value.lowercase === 'boolean' ? value.lowercase : defaults.lowercase,
    numbers: typeof value.numbers === 'boolean' ? value.numbers : defaults.numbers,
    symbols: typeof value.symbols === 'boolean' ? value.symbols : defaults.symbols,
  }

  if (!sanitized.uppercase && !sanitized.lowercase && !sanitized.numbers && !sanitized.symbols) {
    sanitized.lowercase = true
  }

  return sanitized
}

const sanitizeConfig = (raw: unknown): ExtensionConfig => {
  const defaults = createDefaultConfig()

  if (!isObject(raw)) {
    return defaults
  }

  const result: ExtensionConfig = {
    version: 2,
    dateFormat: isDateFormat(raw.dateFormat) ? raw.dateFormat : defaults.dateFormat,
    keyboardShortcutsEnabled:
      typeof raw.keyboardShortcutsEnabled === 'boolean'
        ? raw.keyboardShortcutsEnabled
        : defaults.keyboardShortcutsEnabled,
    passwordOptions: sanitizePasswordOptions(raw.passwordOptions, defaults.passwordOptions),
    items: { ...defaults.items },
  }

  const rawItems = isObject(raw.items) ? raw.items : {}

  for (const definition of dataTypeDefinitions) {
    const key: DataType = definition.type
    const baseItem: GeneratorConfigItem = defaults.items[key]
    const candidate = rawItems[key]

    if (!isObject(candidate)) {
      result.items[key] = baseItem
      continue
    }

    const shortcut = sanitizeShortcut(candidate.shortcut)
    const sanitizedShortcut = shortcut && getReservedShortcutReason(shortcut) ? null : shortcut

    result.items[key] = {
      enabled: typeof candidate.enabled === 'boolean' ? candidate.enabled : baseItem.enabled,
      shortcut: sanitizedShortcut,
      favorite: typeof candidate.favorite === 'boolean' ? candidate.favorite : baseItem.favorite,
    }
  }

  const duplicate = findDuplicateShortcut(result.items)
  if (duplicate) {
    result.items[duplicate.second] = {
      ...result.items[duplicate.second],
      shortcut: null,
    }
  }

  return result
}

const getStorageValue = async (): Promise<unknown> => {
  const result = (await chrome.storage.sync.get(CONFIG_STORAGE_KEY)) as Record<string, unknown>
  return result[CONFIG_STORAGE_KEY]
}

export const loadExtensionConfig = async (): Promise<ExtensionConfig> => {
  const raw = await getStorageValue()
  const sanitized = sanitizeConfig(raw)

  const shouldPersist = JSON.stringify(raw) !== JSON.stringify(sanitized)
  if (shouldPersist) {
    await chrome.storage.sync.set({
      [CONFIG_STORAGE_KEY]: sanitized,
    })
  }

  return sanitized
}

export const saveExtensionConfig = async (config: ExtensionConfig): Promise<ExtensionConfig> => {
  const sanitized = sanitizeConfig(config)
  const duplicate = findDuplicateShortcut(sanitized.items)

  if (duplicate) {
    throw new Error('Existem atalhos duplicados na configuracao.')
  }

  await chrome.storage.sync.set({
    [CONFIG_STORAGE_KEY]: sanitized,
  })

  return sanitized
}

export const watchConfigChanges = (onChange: (config: ExtensionConfig) => void): (() => void) => {
  const listener: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, areaName) => {
    if (areaName !== 'sync' || !changes[CONFIG_STORAGE_KEY]) {
      return
    }

    const nextConfig = sanitizeConfig(changes[CONFIG_STORAGE_KEY].newValue)
    onChange(nextConfig)
  }

  chrome.storage.onChanged.addListener(listener)

  return () => {
    chrome.storage.onChanged.removeListener(listener)
  }
}

export { CONFIG_STORAGE_KEY }
