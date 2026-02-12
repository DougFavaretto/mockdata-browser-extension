import { createDefaultConfig } from '../shared/defaultConfig'
import { generateByType } from '../shared/generators'
import { isGenerateMessage, isPingMessage } from '../shared/messages'
import { findShortcutMatch, shortcutFromKeyboardEvent } from '../shared/shortcut'
import { loadExtensionConfig, watchConfigChanges } from '../shared/storage'
import type { DataType, ExtensionConfig, FillResult } from '../shared/types'

type FillableElement = HTMLInputElement | HTMLTextAreaElement | HTMLElement

let lastContextTarget: FillableElement | null = null
let config: ExtensionConfig = createDefaultConfig()

const isFillableElement = (element: Element | null): element is FillableElement => {
  if (!element) {
    return false
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return true
  }

  return element instanceof HTMLElement && element.isContentEditable
}

const findClosestFillable = (target: EventTarget | null): FillableElement | null => {
  if (!(target instanceof Element)) {
    return null
  }

  const nearestEditable = target.closest(
    'input, textarea, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]',
  )

  return isFillableElement(nearestEditable) ? nearestEditable : null
}

const getFocusedFillable = (): FillableElement | null => {
  const activeElement = document.activeElement

  if (!(activeElement instanceof Element)) {
    return null
  }

  return isFillableElement(activeElement) ? activeElement : null
}

const dispatchFieldEvents = (element: HTMLElement): void => {
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

const isWritableElement = (element: FillableElement): boolean => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return !element.disabled && !element.readOnly
  }

  return element.isContentEditable
}

const setNativeInputValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value')

  if (descriptor?.set) {
    descriptor.set.call(element, value)
    return
  }

  element.value = value
}

const fillElementValue = (target: FillableElement, value: string): void => {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    target.focus()
    setNativeInputValue(target, value)
    dispatchFieldEvents(target)
    return
  }

  target.focus()
  target.textContent = value
  dispatchFieldEvents(target)
}

const resolveTarget = (): FillableElement | null => {
  if (lastContextTarget && document.contains(lastContextTarget) && isWritableElement(lastContextTarget)) {
    return lastContextTarget
  }

  const focused = getFocusedFillable()
  if (focused && isWritableElement(focused)) {
    return focused
  }

  return null
}

const generateForType = (dataType: DataType): FillResult => {
  const itemConfig = config.items[dataType]
  if (!itemConfig?.enabled) {
    return { ok: false, reason: 'DISABLED' }
  }

  const target = resolveTarget()
  if (!target) {
    return { ok: false, reason: 'NO_TARGET' }
  }

  const generatedValue = generateByType(dataType, {
    dateFormat: config.dateFormat,
    passwordOptions: config.passwordOptions,
  })

  fillElementValue(target, generatedValue)
  return { ok: true }
}

const refreshConfig = async (): Promise<void> => {
  config = await loadExtensionConfig()
}

void refreshConfig()

watchConfigChanges((nextConfig) => {
  config = nextConfig
})

document.addEventListener(
  'contextmenu',
  (event) => {
    lastContextTarget = findClosestFillable(event.target)
  },
  true,
)

document.addEventListener(
  'focusin',
  (event) => {
    const fillable = findClosestFillable(event.target)
    if (fillable) {
      lastContextTarget = fillable
    }
  },
  true,
)

document.addEventListener(
  'keydown',
  (event) => {
    if (!config.keyboardShortcutsEnabled) {
      return
    }

    const eventShortcut = shortcutFromKeyboardEvent(event)
    const matchedDataType = findShortcutMatch(config.items, eventShortcut)

    if (!matchedDataType) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    generateForType(matchedDataType)
  },
  true,
)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (isPingMessage(message)) {
    sendResponse({ ok: true })
    return true
  }

  if (!isGenerateMessage(message)) {
    return false
  }

  const result = generateForType(message.dataType)
  sendResponse(result)
  return true
})
