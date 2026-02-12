import { describe, expect, it } from 'vitest'

import { createDefaultConfig } from './defaultConfig'

describe('default config', () => {
  it('starts with global keyboard shortcuts enabled', () => {
    const config = createDefaultConfig()
    expect(config.keyboardShortcutsEnabled).toBe(true)
  })

  it('starts with no default shortcuts for any data type', () => {
    const config = createDefaultConfig()

    for (const item of Object.values(config.items)) {
      expect(item.shortcut).toBeNull()
      expect(item.favorite).toBe(false)
    }
  })
})
