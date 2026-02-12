import { dataTypeDefinitions } from './dataTypes'
import type { DataType, ExtensionConfig, GeneratorConfigItem, PasswordOptions, Shortcut } from './types'

const cloneShortcut = (shortcut: Shortcut | null): Shortcut | null => {
  if (!shortcut) {
    return null
  }

  return {
    ctrl: shortcut.ctrl,
    shift: shortcut.shift,
    alt: shortcut.alt,
    meta: shortcut.meta,
    key: shortcut.key,
  }
}

const createDefaultItems = (): Record<DataType, GeneratorConfigItem> =>
  dataTypeDefinitions.reduce(
    (acc, definition) => {
      acc[definition.type] = {
        enabled: true,
        shortcut: cloneShortcut(definition.defaultShortcut),
        favorite: false,
      }
      return acc
    },
    {} as Record<DataType, GeneratorConfigItem>,
  )

export const createDefaultConfig = (): ExtensionConfig => ({
  version: 2,
  dateFormat: 'dd/MM/yyyy',
  keyboardShortcutsEnabled: true,
  passwordOptions: {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  } satisfies PasswordOptions,
  items: createDefaultItems(),
})

export const DEFAULT_CONFIG: ExtensionConfig = createDefaultConfig()
