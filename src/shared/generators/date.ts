import type { DateFormat } from '../types'
import { randomInt } from './utils/random'

const formatDate = (date: Date, format: DateFormat): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())

  if (format === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`
  }

  if (format === 'MM/dd/yyyy') {
    return `${month}/${day}/${year}`
  }

  return `${day}/${month}/${year}`
}

export const generateDate = (format: DateFormat): string => {
  const startTimestamp = new Date(1990, 0, 1).getTime()
  const endTimestamp = new Date(2035, 11, 31).getTime()
  const randomTimestamp = randomInt(startTimestamp, endTimestamp)
  const randomDate = new Date(randomTimestamp)

  return formatDate(randomDate, format)
}
