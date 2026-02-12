import type { DataType } from './types'
import { DATA_TYPES } from './types'

export const GENERATE_MESSAGE_TYPE = 'FAKE_DATA_GENERATE' as const
export const PING_MESSAGE_TYPE = 'FAKE_DATA_PING' as const

export interface GenerateMessage {
  type: typeof GENERATE_MESSAGE_TYPE
  dataType: DataType
}

export interface PingMessage {
  type: typeof PING_MESSAGE_TYPE
}

export const isGenerateMessage = (value: unknown): value is GenerateMessage => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const maybeMessage = value as Record<string, unknown>
  return (
    maybeMessage.type === GENERATE_MESSAGE_TYPE &&
    typeof maybeMessage.dataType === 'string' &&
    DATA_TYPES.includes(maybeMessage.dataType as DataType)
  )
}

export const isPingMessage = (value: unknown): value is PingMessage => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const maybeMessage = value as Record<string, unknown>
  return maybeMessage.type === PING_MESSAGE_TYPE
}
