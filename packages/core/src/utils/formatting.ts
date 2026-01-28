/**
 * Formatting utilities for checks, receipts, and related data
 */

import { ToWords } from 'to-words'
import type { Currency } from '../models/common'

// Currency formatters by locale
const currencyFormatters = new Map<string, Intl.NumberFormat>()

/**
 * Get or create a currency formatter for a locale and currency
 */
function getCurrencyFormatter(
  currency: Currency = 'USD',
  locale: string = 'en-US'
): Intl.NumberFormat {
  const key = `${locale}-${currency}`

  if (!currencyFormatters.has(key)) {
    currencyFormatters.set(
      key,
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  return currencyFormatters.get(key)!
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number | string,
  currency: Currency = 'USD',
  locale: string = 'en-US'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return '$0.00'
  }

  const formatter = getCurrencyFormatter(currency, locale)
  return formatter.format(numericAmount)
}

/**
 * Format a date
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'iso' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US')
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'iso':
      return dateObj.toISOString().split('T')[0]
    default:
      return dateObj.toLocaleDateString()
  }
}

/**
 * Format a phone number
 */
export function formatPhoneNumber(phone: string, format: 'us' | 'international' = 'us'): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  if (format === 'us') {
    // US format: (555) 123-4567
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
  }

  return phone // Return original if format doesn't match
}

/**
 * Format a routing number with spaces for readability
 */
export function formatRoutingNumber(routing: string): string {
  const cleaned = routing.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return routing
}

/**
 * Format an account number (mask all but last 4 digits)
 */
export function formatAccountNumber(accountNumber: string, maskChar: string = '*'): string {
  if (accountNumber.length <= 4) {
    return accountNumber
  }
  return maskChar.repeat(accountNumber.length - 4) + accountNumber.slice(-4)
}

/**
 * Convert amount to words (for checks)
 */
export function amountToWords(amount: number | string, currency: Currency = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numericAmount)) {
    return 'Zero Dollars'
  }

  // Map currency codes to locale codes for proper conversion
  const currencyLocaleMap: Record<Currency, string> = {
    USD: 'en-US',
    EUR: 'en-GB',
    GBP: 'en-GB',
    CAD: 'en-US',
    AUD: 'en-AU',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
  }

  const localeCode = currencyLocaleMap[currency] || 'en-US'

  const toWords = new ToWords({
    localeCode,
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: true,
    },
  })

  try {
    return toWords.convert(numericAmount)
  } catch (error) {
    console.error('Error converting amount to words:', error)
    return `${formatCurrency(numericAmount, currency)}`
  }
}

/**
 * Format address as a single line
 */
export function formatAddress(address: {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}): string {
  const parts = [address.street, address.city, address.state, address.zip, address.country].filter(
    Boolean
  )

  return parts.join(', ')
}

/**
 * Format address as multiple lines
 */
export function formatAddressMultiline(address: {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}): string[] {
  const lines: string[] = []

  if (address.street) {
    lines.push(address.street)
  }

  const cityStateZip = [address.city, address.state, address.zip].filter(Boolean).join(', ')

  if (cityStateZip) {
    lines.push(cityStateZip)
  }

  if (address.country) {
    lines.push(address.country)
  }

  return lines
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Generate check number with padding
 */
export function formatCheckNumber(checkNumber: string | number, padding: number = 4): string {
  const num = typeof checkNumber === 'string' ? checkNumber : checkNumber.toString()
  return num.padStart(padding, '0')
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
