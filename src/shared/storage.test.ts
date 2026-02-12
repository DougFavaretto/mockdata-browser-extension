import { beforeEach, describe, expect, it } from 'vitest'

import { loadExtensionConfig, saveExtensionConfig } from './storage'
import type { ExtensionConfig } from './types'

type StorageChangeListener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void

const createChromeStorageMock = (initialValue?: unknown) => {
  const state: Record<string, unknown> = {
    fakeDataGeneratorConfig: initialValue,
  }

  const listeners: StorageChangeListener[] = []

  return {
    storage: {
      sync: {
        get: async (key: string) => ({ [key]: state[key] }),
        set: async (value: Record<string, unknown>) => {
          const previous = state.fakeDataGeneratorConfig
          if (Object.hasOwn(value, 'fakeDataGeneratorConfig')) {
            state.fakeDataGeneratorConfig = value.fakeDataGeneratorConfig
            for (const listener of listeners) {
              listener(
                {
                  fakeDataGeneratorConfig: {
                    oldValue: previous,
                    newValue: state.fakeDataGeneratorConfig,
                  },
                },
                'sync',
              )
            }
          }
        },
      },
      onChanged: {
        addListener: (listener: StorageChangeListener) => {
          listeners.push(listener)
        },
        removeListener: (listener: StorageChangeListener) => {
          const index = listeners.indexOf(listener)
          if (index >= 0) {
            listeners.splice(index, 1)
          }
        },
      },
    },
  }
}

describe('storage config sanitization', () => {
  beforeEach(() => {
    const chromeMock = createChromeStorageMock()
    globalThis.chrome = chromeMock as unknown as typeof chrome
  })

  it('migrates v1 config to v2 with password defaults', async () => {
    const v1Raw = {
      version: 1,
      dateFormat: 'dd/MM/yyyy',
      items: {
        cpf: { enabled: true, shortcut: { ctrl: true, shift: true, alt: false, meta: false, key: 'c' } },
      },
    }

    globalThis.chrome = createChromeStorageMock(v1Raw) as unknown as typeof chrome

    const config = await loadExtensionConfig()

    expect(config.version).toBe(2)
    expect(config.keyboardShortcutsEnabled).toBe(true)
    expect(config.passwordOptions).toEqual({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })
    expect(config.items.cpf.favorite).toBe(false)
  })

  it('sanitizes password options bounds and fallback', async () => {
    const raw = {
      version: 2,
      dateFormat: 'dd/MM/yyyy',
      passwordOptions: {
        length: 4,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
      },
      items: {},
    }

    globalThis.chrome = createChromeStorageMock(raw) as unknown as typeof chrome

    const config = await loadExtensionConfig()

    expect(config.passwordOptions.length).toBe(8)
    expect(config.passwordOptions.lowercase).toBe(true)
  })

  it('removes reserved shortcuts during sanitization', async () => {
    const raw = {
      version: 2,
      dateFormat: 'dd/MM/yyyy',
      keyboardShortcutsEnabled: true,
      passwordOptions: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      },
      items: {
        cpf: {
          enabled: true,
          favorite: true,
          shortcut: { ctrl: true, shift: true, alt: false, meta: false, key: 'c' },
        },
      },
    }

    globalThis.chrome = createChromeStorageMock(raw) as unknown as typeof chrome

    const config = await loadExtensionConfig()
    expect(config.items.cpf.shortcut).toBeNull()
    expect(config.items.cpf.favorite).toBe(true)
  })

  it('persists valid v2 config', async () => {
    const items = (await loadExtensionConfig()).items
    items.email.favorite = true

    const config: ExtensionConfig = {
      version: 2,
      dateFormat: 'yyyy-MM-dd',
      keyboardShortcutsEnabled: true,
      passwordOptions: {
        length: 24,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
      },
      items,
    }

    const saved = await saveExtensionConfig(config)
    expect(saved.version).toBe(2)
    expect(saved.passwordOptions.length).toBe(24)
    expect(saved.items.email.favorite).toBe(true)
  })
})
