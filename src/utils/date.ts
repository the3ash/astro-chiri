import { themeConfig } from '@/config'
import type { DateFormat } from '@/types'

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const VALID_SEPARATORS = ['.', '-', '/']

/**
 * @param date
 * @param format
 * @returns
 */
export function formatDate(date: Date, format?: string): string {
  const formatStr = (format || themeConfig.date.dateFormat).trim()
  const configSeparator = themeConfig.date.dateSeparator || '-'

  const separator = VALID_SEPARATORS.includes(configSeparator.trim()) ? configSeparator.trim() : '.'

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const monthName = MONTHS_EN[date.getMonth()]

  const pad = (num: number) => String(num).padStart(2, '0')

  switch (formatStr) {
    case 'YYYY-MM-DD':
      return `${year}${separator}${pad(month)}${separator}${pad(day)}`

    case 'MM-DD-YYYY':
      return `${pad(month)}${separator}${pad(day)}${separator}${year}`

    case 'DD-MM-YYYY':
      return `${pad(day)}${separator}${pad(month)}${separator}${year}`

    case 'MONTH DAY YYYY':
      return `<span class="month">${monthName}</span> ${day} ${year}`

    case 'DAY MONTH YYYY':
      return `${day} <span class="month">${monthName}</span> ${year}`

    default:
      return `${year}${separator}${pad(month)}${separator}${pad(day)}`
  }
}

export const SUPPORTED_DATE_FORMATS: readonly DateFormat[] = [
  'YYYY-MM-DD',
  'MM-DD-YYYY',
  'DD-MM-YYYY',
  'MONTH DAY YYYY',
  'DAY MONTH YYYY'
] as const
