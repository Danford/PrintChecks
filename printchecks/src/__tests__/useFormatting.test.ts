/**
 * Tests for src/composables/useFormatting.ts
 *
 * All 16 functions are pure (no Vue reactivity, no side-effects), so they
 * can be tested in a plain Node environment without mounting a component.
 */
import { describe, expect, it } from 'vitest'
import { useFormatting } from '../composables/useFormatting'

const {
  formatMoney,
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatRoutingNumber,
  formatAccountNumber,
  formatCheckNumber,
  formatPercentage,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  parseAmount,
  validateEmail,
  validatePhone,
  validateZip,
} = useFormatting()

// ── formatMoney() ─────────────────────────────────────────────────────────────

describe('formatMoney()', () => {
  it('formats an integer to 2 decimal places', () => {
    expect(formatMoney(1000)).toBe('1,000.00')
  })

  it('formats a float with 2 decimal places', () => {
    expect(formatMoney(1234.5)).toBe('1,234.50')
  })

  it('formats a string amount', () => {
    expect(formatMoney('500.00')).toBe('500.00')
  })

  it('returns "0.00" for NaN input', () => {
    expect(formatMoney('not-a-number')).toBe('0.00')
  })

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('0.00')
  })

  it('uses thousands separator for large amounts', () => {
    expect(formatMoney(1000000)).toBe('1,000,000.00')
  })
})

// ── formatCurrency() ──────────────────────────────────────────────────────────

describe('formatCurrency()', () => {
  it('formats a number as USD by default', () => {
    expect(formatCurrency(500)).toBe('$500.00')
  })

  it('formats a string amount as USD', () => {
    expect(formatCurrency('1234.56')).toBe('$1,234.56')
  })

  it('returns "$0.00" for NaN input', () => {
    expect(formatCurrency('bad')).toBe('$0.00')
  })

  it('formats zero as "$0.00"', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('supports a non-USD currency code', () => {
    // Just verify the function accepts the parameter and returns a string
    const result = formatCurrency(100, 'EUR')
    expect(typeof result).toBe('string')
    expect(result).toContain('100')
  })
})

// ── formatDate() ──────────────────────────────────────────────────────────────

describe('formatDate()', () => {
  it('returns "" for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('returns ISO format yyyy-mm-dd for format="iso"', () => {
    expect(formatDate('2026-06-15', 'iso')).toBe('2026-06-15')
  })

  it('returns ISO format when given a Date object', () => {
    expect(formatDate(new Date('2026-01-01T00:00:00Z'), 'iso')).toBe('2026-01-01')
  })

  it('returns a non-empty string for "short" format', () => {
    const result = formatDate('2026-06-15', 'short')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a non-empty string for "long" format', () => {
    const result = formatDate('2026-06-15', 'long')
    expect(result).toContain('2026')
    expect(result).toContain('June')
  })

  it('defaults to "short" format when format argument is omitted', () => {
    const result = formatDate('2026-06-15')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns short format for an unrecognised format string', () => {
    const resultDefault = formatDate('2026-06-15')
    const resultUnknown = formatDate('2026-06-15', 'unknown')
    expect(resultUnknown).toBe(resultDefault)
  })
})

// ── formatPhoneNumber() ───────────────────────────────────────────────────────

describe('formatPhoneNumber()', () => {
  it('formats a 10-digit string into (XXX) XXX-XXXX', () => {
    expect(formatPhoneNumber('5558675309')).toBe('(555) 867-5309')
  })

  it('strips non-digit characters before formatting', () => {
    expect(formatPhoneNumber('555-867-5309')).toBe('(555) 867-5309')
  })

  it('returns the original string when fewer than 10 digits', () => {
    expect(formatPhoneNumber('12345')).toBe('12345')
  })

  it('returns the original string when more than 10 digits', () => {
    expect(formatPhoneNumber('15558675309')).toBe('15558675309')
  })

  it('handles already-formatted input', () => {
    expect(formatPhoneNumber('(555) 867-5309')).toBe('(555) 867-5309')
  })
})

// ── formatRoutingNumber() ─────────────────────────────────────────────────────

describe('formatRoutingNumber()', () => {
  it('formats a 9-digit routing number as XXX-XXX-XXXX', () => {
    expect(formatRoutingNumber('021000021')).toBe('021-000-021')
  })

  it('strips non-digit characters before formatting', () => {
    expect(formatRoutingNumber('021-000-021')).toBe('021-000-021')
  })

  it('returns the original string for fewer than 9 digits', () => {
    expect(formatRoutingNumber('12345')).toBe('12345')
  })

  it('returns the original string for more than 9 digits', () => {
    expect(formatRoutingNumber('0210000210')).toBe('0210000210')
  })
})

// ── formatAccountNumber() ─────────────────────────────────────────────────────

describe('formatAccountNumber()', () => {
  it('masks all but the last 4 characters for a long account number', () => {
    expect(formatAccountNumber('12345678')).toBe('****5678')
  })

  it('mask length matches the number of hidden digits', () => {
    const result = formatAccountNumber('123456789012')
    expect(result).toBe('********9012')
  })

  it('returns the value unchanged when 4 or fewer characters', () => {
    expect(formatAccountNumber('1234')).toBe('1234')
    expect(formatAccountNumber('12')).toBe('12')
    expect(formatAccountNumber('')).toBe('')
  })

  it('returns exactly 5 chars for a 5-char input', () => {
    // 1 star + last 4
    expect(formatAccountNumber('12345')).toBe('*2345')
  })
})

// ── formatCheckNumber() ───────────────────────────────────────────────────────

describe('formatCheckNumber()', () => {
  it('pads a short string to 4 characters with leading zeros', () => {
    expect(formatCheckNumber('42')).toBe('0042')
  })

  it('pads a numeric value to 4 characters', () => {
    expect(formatCheckNumber(7)).toBe('0007')
  })

  it('does not truncate a string that is already 4+ characters', () => {
    expect(formatCheckNumber('1001')).toBe('1001')
    expect(formatCheckNumber('12345')).toBe('12345')
  })

  it('handles 0', () => {
    expect(formatCheckNumber(0)).toBe('0000')
  })
})

// ── formatPercentage() ────────────────────────────────────────────────────────

describe('formatPercentage()', () => {
  it('converts a fraction to a percentage with 1 decimal by default', () => {
    expect(formatPercentage(0.5)).toBe('50.0%')
  })

  it('respects a custom decimal count', () => {
    expect(formatPercentage(0.1234, 2)).toBe('12.34%')
  })

  it('formats 0 as "0.0%"', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  it('formats 1 as "100.0%"', () => {
    expect(formatPercentage(1)).toBe('100.0%')
  })

  it('appends a "%" character', () => {
    expect(formatPercentage(0.75).endsWith('%')).toBe(true)
  })
})

// ── formatFileSize() ──────────────────────────────────────────────────────────

describe('formatFileSize()', () => {
  it('returns "0 Bytes" for 0', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('formats bytes correctly', () => {
    expect(formatFileSize(512)).toBe('512 Bytes')
  })

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
  })

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
  })

  it('shows decimal precision for fractional units', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })
})

// ── truncateText() ────────────────────────────────────────────────────────────

describe('truncateText()', () => {
  it('returns the original text when it fits within maxLength', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('returns the original text when length equals maxLength', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })

  it('truncates and appends "..." when text exceeds maxLength', () => {
    expect(truncateText('hello world', 8)).toBe('hello...')
  })

  it('the truncated result is exactly maxLength characters', () => {
    const result = truncateText('abcdefghij', 7)
    expect(result).toHaveLength(7)
    expect(result).toBe('abcd...')
  })

  it('handles empty string', () => {
    expect(truncateText('', 5)).toBe('')
  })
})

// ── capitalizeFirst() ─────────────────────────────────────────────────────────

describe('capitalizeFirst()', () => {
  it('uppercases the first character and lowercases the rest', () => {
    expect(capitalizeFirst('hello')).toBe('Hello')
    expect(capitalizeFirst('HELLO')).toBe('Hello')
  })

  it('returns "" for an empty string', () => {
    expect(capitalizeFirst('')).toBe('')
  })

  it('handles a single character', () => {
    expect(capitalizeFirst('a')).toBe('A')
  })

  it('handles a string that starts with uppercase', () => {
    expect(capitalizeFirst('World')).toBe('World')
  })
})

// ── capitalizeWords() ─────────────────────────────────────────────────────────

describe('capitalizeWords()', () => {
  it('capitalizes the first letter of each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World')
  })

  it('lowercases the rest of each word', () => {
    expect(capitalizeWords('HELLO WORLD')).toBe('Hello World')
  })

  it('returns "" for an empty string', () => {
    expect(capitalizeWords('')).toBe('')
  })

  it('handles a single word', () => {
    expect(capitalizeWords('acme')).toBe('Acme')
  })

  it('handles multiple spaces between words', () => {
    // split(' ') produces empty strings for consecutive spaces
    const result = capitalizeWords('foo  bar')
    expect(result).toContain('Foo')
    expect(result).toContain('Bar')
  })
})

// ── parseAmount() ─────────────────────────────────────────────────────────────

describe('parseAmount()', () => {
  it('parses a plain number string', () => {
    expect(parseAmount('1234.56')).toBeCloseTo(1234.56)
  })

  it('strips "$" and "," before parsing', () => {
    expect(parseAmount('$1,234.56')).toBeCloseTo(1234.56)
  })

  it('strips commas without a "$" sign', () => {
    expect(parseAmount('1,000.00')).toBeCloseTo(1000)
  })

  it('returns 0 for a non-numeric string', () => {
    expect(parseAmount('abc')).toBe(0)
  })

  it('returns 0 for an empty string', () => {
    expect(parseAmount('')).toBe(0)
  })

  it('handles a zero amount', () => {
    expect(parseAmount('$0.00')).toBe(0)
  })
})

// ── validateEmail() ───────────────────────────────────────────────────────────

describe('validateEmail()', () => {
  it('returns true for a standard email address', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('returns true for an email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  it('returns false when "@" is missing', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('returns false when domain is missing', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('returns false when TLD is missing', () => {
    expect(validateEmail('user@example')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('returns false when the address contains spaces', () => {
    expect(validateEmail('user name@example.com')).toBe(false)
  })
})

// ── validatePhone() ───────────────────────────────────────────────────────────

describe('validatePhone()', () => {
  it('returns true for a 10-digit string', () => {
    expect(validatePhone('5558675309')).toBe(true)
  })

  it('returns true for (XXX) XXX-XXXX format', () => {
    expect(validatePhone('(555) 867-5309')).toBe(true)
  })

  it('returns true for XXX-XXX-XXXX format', () => {
    expect(validatePhone('555-867-5309')).toBe(true)
  })

  it('returns true for XXX.XXX.XXXX format', () => {
    expect(validatePhone('555.867.5309')).toBe(true)
  })

  it('returns false for fewer than 10 digits', () => {
    expect(validatePhone('12345')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(validatePhone('')).toBe(false)
  })

  it('returns false for a string with letters', () => {
    expect(validatePhone('CALL-US-NOW')).toBe(false)
  })
})

// ── validateZip() ─────────────────────────────────────────────────────────────

describe('validateZip()', () => {
  it('returns true for a 5-digit ZIP code', () => {
    expect(validateZip('75201')).toBe(true)
  })

  it('returns true for a ZIP+4 code', () => {
    expect(validateZip('75201-1234')).toBe(true)
  })

  it('returns false for fewer than 5 digits', () => {
    expect(validateZip('1234')).toBe(false)
  })

  it('returns false for more than 5 digits without the dash', () => {
    expect(validateZip('752011')).toBe(false)
  })

  it('returns false for letters', () => {
    expect(validateZip('ABCDE')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(validateZip('')).toBe(false)
  })

  it('returns false for a ZIP+4 with wrong extension length', () => {
    expect(validateZip('75201-12')).toBe(false)
  })
})
