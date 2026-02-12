import type { DataType, GeneratorConfigItem, Shortcut } from './types'

const MODIFIER_KEYS = new Set(['control', 'shift', 'alt', 'meta'])

const SPECIAL_DISPLAY_KEYS: Record<string, string> = {
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  escape: 'Esc',
  enter: 'Enter',
  tab: 'Tab',
  space: 'Space',
  backspace: 'Backspace',
  delete: 'Delete',
}

const RESERVED_SHORTCUTS: Array<{ shortcut: Shortcut; reason: string }> = [
  {
    shortcut: { ctrl: true, shift: true, alt: false, meta: false, key: 'c' },
    reason: 'Conflita com modo de inspecao do navegador.',
  },
  {
    shortcut: { ctrl: true, shift: true, alt: false, meta: false, key: 'i' },
    reason: 'Conflita com DevTools do navegador.',
  },
  {
    shortcut: { ctrl: true, shift: true, alt: false, meta: false, key: 'j' },
    reason: 'Conflita com console do navegador.',
  },
  {
    shortcut: { ctrl: true, shift: false, alt: false, meta: false, key: 'u' },
    reason: 'Conflita com visualizacao de codigo-fonte.',
  },
  {
    shortcut: { ctrl: true, shift: false, alt: false, meta: false, key: 'r' },
    reason: 'Conflita com recarregamento de pagina.',
  },
  {
    shortcut: { ctrl: true, shift: false, alt: false, meta: false, key: 'l' },
    reason: 'Conflita com foco na barra de endereco.',
  },
  {
    shortcut: { ctrl: false, shift: false, alt: true, meta: true, key: 'i' },
    reason: 'Conflita com DevTools no macOS.',
  },
  {
    shortcut: { ctrl: false, shift: false, alt: true, meta: true, key: 'j' },
    reason: 'Conflita com console no macOS.',
  },
]

export const normalizeKey = (key: string): string => {
  const trimmed = key.trim()
  if (trimmed === '') {
    return ''
  }

  if (trimmed === ' ') {
    return 'space'
  }

  if (trimmed.length === 1) {
    return trimmed.toLowerCase()
  }

  return trimmed.toLowerCase()
}

export const isModifierKey = (key: string): boolean => MODIFIER_KEYS.has(normalizeKey(key))

export const normalizeShortcut = (shortcut: Shortcut): Shortcut => ({
  ctrl: shortcut.ctrl,
  shift: shortcut.shift,
  alt: shortcut.alt,
  meta: shortcut.meta,
  key: normalizeKey(shortcut.key),
})

export const shortcutFromKeyboardEvent = (event: KeyboardEvent): Shortcut =>
  normalizeShortcut({
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
    meta: event.metaKey,
    key: event.key,
  })

export const isShortcutValid = (shortcut: Shortcut): boolean => {
  const normalized = normalizeShortcut(shortcut)
  if (normalized.key === '' || isModifierKey(normalized.key)) {
    return false
  }

  return normalized.ctrl || normalized.shift || normalized.alt || normalized.meta
}

export const shortcutsEqual = (a: Shortcut, b: Shortcut): boolean => {
  const first = normalizeShortcut(a)
  const second = normalizeShortcut(b)

  return (
    first.ctrl === second.ctrl &&
    first.shift === second.shift &&
    first.alt === second.alt &&
    first.meta === second.meta &&
    first.key === second.key
  )
}

const formatKey = (normalizedKey: string): string => {
  if (normalizedKey.length === 1) {
    return normalizedKey.toUpperCase()
  }

  return SPECIAL_DISPLAY_KEYS[normalizedKey] ?? normalizedKey
}

export const formatShortcut = (shortcut: Shortcut | null): string => {
  if (!shortcut) {
    return 'Sem atalho'
  }

  const normalized = normalizeShortcut(shortcut)
  const parts: string[] = []

  if (normalized.ctrl) {
    parts.push('Ctrl')
  }

  if (normalized.shift) {
    parts.push('Shift')
  }

  if (normalized.alt) {
    parts.push('Alt')
  }

  if (normalized.meta) {
    parts.push('Meta')
  }

  if (normalized.key !== '') {
    parts.push(formatKey(normalized.key))
  }

  return parts.join(' + ')
}

export const getReservedShortcutReason = (shortcut: Shortcut): string | null => {
  const normalizedShortcut = normalizeShortcut(shortcut)

  for (const reserved of RESERVED_SHORTCUTS) {
    if (shortcutsEqual(normalizedShortcut, reserved.shortcut)) {
      return reserved.reason
    }
  }

  return null
}

export const isReservedShortcut = (shortcut: Shortcut): boolean => getReservedShortcutReason(shortcut) !== null

export const findShortcutConflict = (
  items: Record<DataType, GeneratorConfigItem>,
  candidate: Shortcut,
  ignoreType?: DataType,
): DataType | null => {
  const normalizedCandidate = normalizeShortcut(candidate)

  const allTypes = Object.keys(items) as DataType[]
  for (const dataType of allTypes) {
    if (dataType === ignoreType) {
      continue
    }

    const currentShortcut = items[dataType].shortcut
    if (currentShortcut && shortcutsEqual(currentShortcut, normalizedCandidate)) {
      return dataType
    }
  }

  return null
}

export const findDuplicateShortcut = (
  items: Record<DataType, GeneratorConfigItem>,
): { first: DataType; second: DataType } | null => {
  const seen: Array<{ dataType: DataType; shortcut: Shortcut }> = []

  const allTypes = Object.keys(items) as DataType[]
  for (const dataType of allTypes) {
    const currentShortcut = items[dataType].shortcut
    if (!currentShortcut) {
      continue
    }

    const normalizedShortcut = normalizeShortcut(currentShortcut)
    for (const previous of seen) {
      if (shortcutsEqual(previous.shortcut, normalizedShortcut)) {
        return { first: previous.dataType, second: dataType }
      }
    }

    seen.push({
      dataType,
      shortcut: normalizedShortcut,
    })
  }

  return null
}

export const findShortcutMatch = (
  items: Record<DataType, GeneratorConfigItem>,
  eventShortcut: Shortcut,
): DataType | null => {
  if (!isShortcutValid(eventShortcut)) {
    return null
  }

  const allTypes = Object.keys(items) as DataType[]
  for (const dataType of allTypes) {
    const item = items[dataType]
    if (!item.enabled || !item.shortcut) {
      continue
    }

    if (shortcutsEqual(item.shortcut, eventShortcut)) {
      return dataType
    }
  }

  return null
}
