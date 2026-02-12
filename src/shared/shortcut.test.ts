import { describe, expect, it } from 'vitest'
import { createDefaultConfig } from './defaultConfig'
import {
  findDuplicateShortcut,
  findShortcutConflict,
  findShortcutMatch,
  formatShortcut,
  getReservedShortcutReason,
  isReservedShortcut,
  isShortcutValid,
  normalizeShortcut,
  shortcutsEqual,
} from './shortcut'

describe('shortcut utilities', () => {
  it('normalizes and compares shortcuts correctly', () => {
    const first = normalizeShortcut({
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
      key: 'C',
    })

    const second = normalizeShortcut({
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
      key: 'c',
    })

    expect(shortcutsEqual(first, second)).toBe(true)
  })

  it('validates shortcut shape', () => {
    expect(
      isShortcutValid({
        ctrl: true,
        shift: false,
        alt: false,
        meta: false,
        key: 'n',
      }),
    ).toBe(true)

    expect(
      isShortcutValid({
        ctrl: false,
        shift: false,
        alt: false,
        meta: false,
        key: 'n',
      }),
    ).toBe(false)

    expect(
      isShortcutValid({
        ctrl: true,
        shift: false,
        alt: false,
        meta: false,
        key: 'Control',
      }),
    ).toBe(false)
  })

  it('formats shortcut to user-friendly label', () => {
    expect(
      formatShortcut({
        ctrl: true,
        shift: true,
        alt: false,
        meta: false,
        key: 'c',
      }),
    ).toBe('Ctrl + Shift + C')
  })

  it('detects reserved browser shortcuts', () => {
    const reserved = {
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
      key: 'c',
    }

    expect(isReservedShortcut(reserved)).toBe(true)
    expect(getReservedShortcutReason(reserved)).toContain('navegador')
  })

  it('allows non-reserved shortcuts', () => {
    const normal = {
      ctrl: true,
      shift: false,
      alt: true,
      meta: false,
      key: 'q',
    }

    expect(isReservedShortcut(normal)).toBe(false)
    expect(getReservedShortcutReason(normal)).toBeNull()
  })

  it('detects duplicate shortcuts', () => {
    const config = createDefaultConfig()
    config.items.cpf.shortcut = {
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      key: 'x',
    }
    config.items.email.shortcut = {
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      key: 'x',
    }

    const duplicate = findDuplicateShortcut(config.items)
    expect(duplicate).not.toBeNull()
    expect(duplicate?.first).toBe('cpf')
    expect(duplicate?.second).toBe('email')
  })

  it('finds conflict and match with configured shortcuts', () => {
    const config = createDefaultConfig()
    config.items.fullName.shortcut = {
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      key: 'n',
    }
    config.items.address.shortcut = {
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      key: 'a',
    }

    const conflict = findShortcutConflict(
      config.items,
      {
        ctrl: true,
        shift: false,
        alt: false,
        meta: false,
        key: 'n',
      },
      'email',
    )

    expect(conflict).toBe('fullName')

    const matched = findShortcutMatch(config.items, {
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      key: 'a',
    })

    expect(matched).toBe('address')
  })
})
