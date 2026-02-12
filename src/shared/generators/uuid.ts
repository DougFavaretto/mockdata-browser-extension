const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const fallbackUuid = (): string => {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'

  return template.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export const generateUuid = (): string => {
  const nativeUuid = globalThis.crypto?.randomUUID?.()
  if (nativeUuid && UUID_V4_REGEX.test(nativeUuid)) {
    return nativeUuid
  }

  return fallbackUuid()
}
