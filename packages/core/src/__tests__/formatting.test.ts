/**
 * Tests for formatting utilities
 */
import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatRoutingNumber,
  formatAccountNumber,
  amountToWords,
  formatAddress,
  formatAddressMultiline,
  truncate,
  titleCase,
  formatCheckNumber,
  formatPercentage,
  parseCurrency,
} from '../utils/formatting'

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
describe('formatCurrency', () => {
  it('formats a number as USD', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats a string amount as USD', () => {
    expect(formatCurrency('99.9')).toBe('$99.90')
  })

  it('formats zero as $0.00', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('returns $0.00 for NaN input', () => {
    expect(formatCurrency('abc')).toBe('$0.00')
  })

  it('adds thousands separator', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })
})

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('formats ISO string as short date', () => {
    const result = formatDate('2026-01-15')
    // Result is locale-dependent but must be non-empty
    expect(result).toBeTruthy()
    expect(result).toMatch(/2026/)
  })

  it('returns empty string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('formats as ISO with iso format option', () => {
    const result = formatDate('2026-03-28', 'iso')
    expect(result).toBe('2026-03-28')
  })

  it('accepts a Date object', () => {
    const d = new Date('2026-06-15')
    expect(formatDate(d, 'iso')).toBe('2026-06-15')
  })

  it('formats as long date string', () => {
    const result = formatDate('2026-01-15', 'long')
    expect(result).toMatch(/January/)
    expect(result).toMatch(/2026/)
  })
})

// ---------------------------------------------------------------------------
// formatPhoneNumber
// ---------------------------------------------------------------------------
describe('formatPhoneNumber', () => {
  it('formats 10-digit US number', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
  })

  it('formats 11-digit US number with country code', () => {
    expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567')
  })

  it('returns original string if format does not match', () => {
    expect(formatPhoneNumber('123')).toBe('123')
  })

  it('strips formatting before reformatting', () => {
    expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567')
  })
})

// ---------------------------------------------------------------------------
// formatRoutingNumber
// ---------------------------------------------------------------------------
describe('formatRoutingNumber', () => {
  it('adds spaces to 9-digit routing number', () => {
    expect(formatRoutingNumber('021000021')).toBe('021 000 021')
  })

  it('returns original if not 9 digits', () => {
    expect(formatRoutingNumber('12345')).toBe('12345')
  })

  it('strips non-digits before formatting', () => {
    expect(formatRoutingNumber('021-000-021')).toBe('021 000 021')
  })
})

// ---------------------------------------------------------------------------
// formatAccountNumber
// ---------------------------------------------------------------------------
describe('formatAccountNumber', () => {
  it('masks all but last 4 digits', () => {
    expect(formatAccountNumber('123456789')).toBe('*****6789')
  })

  it('returns short numbers unchanged', () => {
    expect(formatAccountNumber('1234')).toBe('1234')
  })

  it('uses custom mask character', () => {
    expect(formatAccountNumber('12345678', 'X')).toBe('XXXX5678')
  })

  it('handles exactly 4 digits', () => {
    expect(formatAccountNumber('9999')).toBe('9999')
  })
})

// ---------------------------------------------------------------------------
// amountToWords
// ---------------------------------------------------------------------------
describe('amountToWords', () => {
  it('converts integer dollar amount to words', () => {
    const result = amountToWords(100)
    expect(result).toMatch(/hundred/i)
    expect(result).toMatch(/dollar/i)
  })

  it('converts amount with cents to words', () => {
    const result = amountToWords(1.5)
    expect(result).toMatch(/dollar/i)
    // 50 cents should appear
    expect(result).toMatch(/fifty|cent/i)
  })

  it('returns "Zero Dollars" for NaN input', () => {
    expect(amountToWords(NaN)).toBe('Zero Dollars')
  })

  it('accepts string amount', () => {
    const result = amountToWords('50.00')
    expect(result).toMatch(/fifty/i)
  })
})

// ---------------------------------------------------------------------------
// formatAddress
// ---------------------------------------------------------------------------
describe('formatAddress', () => {
  it('joins all address parts with comma', () => {
    const result = formatAddress({
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    })
    expect(result).toBe('123 Main St, Austin, TX, 78701')
  })

  it('omits undefined parts', () => {
    const result = formatAddress({ city: 'Austin', state: 'TX' })
    expect(result).toBe('Austin, TX')
  })

  it('returns empty string for empty address', () => {
    expect(formatAddress({})).toBe('')
  })
})

// ---------------------------------------------------------------------------
// formatAddressMultiline
// ---------------------------------------------------------------------------
describe('formatAddressMultiline', () => {
  it('returns street on first line, city/state/zip on second', () => {
    const lines = formatAddressMultiline({
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    })
    expect(lines[0]).toBe('123 Main St')
    expect(lines[1]).toBe('Austin, TX, 78701')
  })

  it('includes country on third line when provided', () => {
    const lines = formatAddressMultiline({
      city: 'London',
      country: 'UK',
    })
    expect(lines[0]).toBe('London')
    expect(lines[1]).toBe('UK')
  })

  it('returns empty array for empty address', () => {
    expect(formatAddressMultiline({})).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// truncate
// ---------------------------------------------------------------------------
describe('truncate', () => {
  it('returns original string when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates and appends ... by default', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })

  it('uses custom suffix', () => {
    // maxLength=8, suffix '~' (len 1): slice(0, 7) + '~' = 'hello w~'
    expect(truncate('hello world', 8, '~')).toBe('hello w~')
  })

  it('does not truncate when exactly at limit', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

// ---------------------------------------------------------------------------
// titleCase
// ---------------------------------------------------------------------------
describe('titleCase', () => {
  it('capitalizes first letter of each word', () => {
    expect(titleCase('hello world')).toBe('Hello World')
  })

  it('handles already capitalized input', () => {
    expect(titleCase('HELLO WORLD')).toBe('HELLO WORLD')
  })

  it('handles single word', () => {
    expect(titleCase('acme')).toBe('Acme')
  })
})

// ---------------------------------------------------------------------------
// formatCheckNumber
// ---------------------------------------------------------------------------
describe('formatCheckNumber', () => {
  it('pads short check number to 4 digits', () => {
    expect(formatCheckNumber('5')).toBe('0005')
  })

  it('pads numeric check number', () => {
    expect(formatCheckNumber(42)).toBe('0042')
  })

  it('does not truncate longer check numbers', () => {
    expect(formatCheckNumber('12345')).toBe('12345')
  })

  it('uses custom padding length', () => {
    expect(formatCheckNumber('1', 6)).toBe('000001')
  })
})

// ---------------------------------------------------------------------------
// formatPercentage
// ---------------------------------------------------------------------------
describe('formatPercentage', () => {
  it('formats value with 2 decimal places by default', () => {
    expect(formatPercentage(12.5)).toBe('12.50%')
  })

  it('uses custom decimal places', () => {
    expect(formatPercentage(33.333, 1)).toBe('33.3%')
  })

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('0.00%')
  })
})

// ---------------------------------------------------------------------------
// parseCurrency
// ---------------------------------------------------------------------------
describe('parseCurrency', () => {
  it('parses USD string to number', () => {
    expect(parseCurrency('$1,234.56')).toBe(1234.56)
  })

  it('parses plain number string', () => {
    expect(parseCurrency('99.99')).toBe(99.99)
  })

  it('returns 0 for non-numeric string', () => {
    expect(parseCurrency('abc')).toBe(0)
  })

  it('handles negative amounts', () => {
    expect(parseCurrency('-50.00')).toBe(-50)
  })
})
