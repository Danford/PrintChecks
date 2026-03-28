/**
 * Tests for validation utilities
 */
import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validateZipCode,
  validateAmount,
  validateDate,
  validatePastDate,
  validateFutureDate,
  validateCheckNumber,
  validateRequired,
  validateLength,
  validateRange,
  validatePostalCode,
  validateStateCode,
  createValidationResult,
  combineValidationResults,
} from '../utils/validation'

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe('validateEmail', () => {
  it('accepts standard email', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  it('accepts email with plus', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true)
  })

  it('rejects missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('rejects missing domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('rejects email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validatePhone
// ---------------------------------------------------------------------------
describe('validatePhone', () => {
  it('accepts 10-digit US number', () => {
    expect(validatePhone('5551234567')).toBe(true)
  })

  it('accepts formatted US number', () => {
    expect(validatePhone('(555) 123-4567')).toBe(true)
  })

  it('accepts international number with +', () => {
    expect(validatePhone('+15551234567')).toBe(true)
  })

  it('accepts 15-digit international', () => {
    expect(validatePhone('+123456789012345')).toBe(true)
  })

  it('rejects too-short number', () => {
    expect(validatePhone('12345')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validatePhone('')).toBe(false)
  })

  it('rejects letters in number', () => {
    expect(validatePhone('555-ABC-1234')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateUrl
// ---------------------------------------------------------------------------
describe('validateUrl', () => {
  it('accepts http URL', () => {
    expect(validateUrl('http://example.com')).toBe(true)
  })

  it('accepts https URL', () => {
    expect(validateUrl('https://example.com/path?q=1')).toBe(true)
  })

  it('rejects bare domain without protocol', () => {
    expect(validateUrl('example.com')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateUrl('')).toBe(false)
  })

  it('rejects plain text', () => {
    expect(validateUrl('not a url')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateZipCode
// ---------------------------------------------------------------------------
describe('validateZipCode', () => {
  it('accepts 5-digit ZIP', () => {
    expect(validateZipCode('78701')).toBe(true)
  })

  it('accepts ZIP+4 format', () => {
    expect(validateZipCode('78701-1234')).toBe(true)
  })

  it('rejects 4-digit ZIP', () => {
    expect(validateZipCode('7870')).toBe(false)
  })

  it('rejects 6-digit ZIP', () => {
    expect(validateZipCode('787011')).toBe(false)
  })

  it('rejects letters', () => {
    expect(validateZipCode('ABCDE')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateZipCode('')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateAmount
// ---------------------------------------------------------------------------
describe('validateAmount', () => {
  it('accepts positive number', () => {
    expect(validateAmount(100)).toBe(true)
  })

  it('accepts positive string', () => {
    expect(validateAmount('99.99')).toBe(true)
  })

  it('accepts fractional cents', () => {
    expect(validateAmount(0.01)).toBe(true)
  })

  it('rejects zero', () => {
    expect(validateAmount(0)).toBe(false)
  })

  it('rejects negative', () => {
    expect(validateAmount(-50)).toBe(false)
  })

  it('rejects NaN string', () => {
    expect(validateAmount('abc')).toBe(false)
  })

  it('rejects Infinity', () => {
    expect(validateAmount(Infinity)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateDate
// ---------------------------------------------------------------------------
describe('validateDate', () => {
  it('accepts ISO date string', () => {
    expect(validateDate('2026-01-15')).toBe(true)
  })

  it('accepts localized date string', () => {
    expect(validateDate('1/15/2026')).toBe(true)
  })

  it('rejects invalid date', () => {
    expect(validateDate('not-a-date')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateDate('')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validatePastDate
// ---------------------------------------------------------------------------
describe('validatePastDate', () => {
  it('accepts a date in the past', () => {
    expect(validatePastDate('2000-01-01')).toBe(true)
  })

  it('rejects a date in the future', () => {
    expect(validatePastDate('2099-12-31')).toBe(false)
  })

  it('rejects invalid date', () => {
    expect(validatePastDate('not-a-date')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateFutureDate
// ---------------------------------------------------------------------------
describe('validateFutureDate', () => {
  it('accepts a date in the future', () => {
    expect(validateFutureDate('2099-12-31')).toBe(true)
  })

  it('rejects a date in the past', () => {
    expect(validateFutureDate('2000-01-01')).toBe(false)
  })

  it('rejects invalid date', () => {
    expect(validateFutureDate('not-a-date')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateCheckNumber
// ---------------------------------------------------------------------------
describe('validateCheckNumber', () => {
  it('accepts numeric check number', () => {
    expect(validateCheckNumber('1001')).toBe(true)
  })

  it('accepts alphanumeric check number', () => {
    expect(validateCheckNumber('CHK1001')).toBe(true)
  })

  it('rejects check number with spaces', () => {
    expect(validateCheckNumber('1001 A')).toBe(false)
  })

  it('rejects check number with special chars', () => {
    expect(validateCheckNumber('1001-A')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateCheckNumber('')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateRequired
// ---------------------------------------------------------------------------
describe('validateRequired', () => {
  it('accepts non-empty string', () => {
    expect(validateRequired('hello')).toBe(true)
  })

  it('accepts non-zero number', () => {
    expect(validateRequired(0)).toBe(true)
  })

  it('accepts non-empty object', () => {
    expect(validateRequired({})).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateRequired('')).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(validateRequired('   ')).toBe(false)
  })

  it('rejects null', () => {
    expect(validateRequired(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(validateRequired(undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateLength
// ---------------------------------------------------------------------------
describe('validateLength', () => {
  it('returns valid when string within range', () => {
    expect(validateLength('hello', 2, 10).isValid).toBe(true)
  })

  it('returns invalid with error when below min', () => {
    const result = validateLength('hi', 5)
    expect(result.isValid).toBe(false)
    expect(result.error).toMatch(/at least 5/)
  })

  it('returns invalid with error when above max', () => {
    const result = validateLength('hello world', undefined, 5)
    expect(result.isValid).toBe(false)
    expect(result.error).toMatch(/no more than 5/)
  })

  it('returns valid when no min/max specified', () => {
    expect(validateLength('anything').isValid).toBe(true)
  })

  it('accepts string exactly at min', () => {
    expect(validateLength('hello', 5).isValid).toBe(true)
  })

  it('accepts string exactly at max', () => {
    expect(validateLength('hello', undefined, 5).isValid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateRange
// ---------------------------------------------------------------------------
describe('validateRange', () => {
  it('returns valid when value within range', () => {
    expect(validateRange(5, 1, 10).isValid).toBe(true)
  })

  it('returns invalid with error when below min', () => {
    const result = validateRange(0, 1)
    expect(result.isValid).toBe(false)
    expect(result.error).toMatch(/at least 1/)
  })

  it('returns invalid with error when above max', () => {
    const result = validateRange(11, undefined, 10)
    expect(result.isValid).toBe(false)
    expect(result.error).toMatch(/no more than 10/)
  })

  it('returns valid when no bounds specified', () => {
    expect(validateRange(9999).isValid).toBe(true)
  })

  it('accepts value exactly at min', () => {
    expect(validateRange(1, 1, 10).isValid).toBe(true)
  })

  it('accepts value exactly at max', () => {
    expect(validateRange(10, 1, 10).isValid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validatePostalCode
// ---------------------------------------------------------------------------
describe('validatePostalCode', () => {
  it('validates US ZIP via default country', () => {
    expect(validatePostalCode('78701')).toBe(true)
  })

  it('validates US ZIP with explicit country', () => {
    expect(validatePostalCode('78701', 'US')).toBe(true)
  })

  it('validates Canadian postal code', () => {
    expect(validatePostalCode('K1A0B1', 'CA')).toBe(true)
  })

  it('validates Canadian postal code with space', () => {
    expect(validatePostalCode('K1A 0B1', 'CA')).toBe(true)
  })

  it('validates UK postcode', () => {
    // regex: [A-Z]{1,2}\d{1,2} ?\d[A-Z]{2}  — e.g. SW1 1AA
    expect(validatePostalCode('SW1 1AA', 'GB')).toBe(true)
  })

  it('validates UK postcode with UK country code', () => {
    expect(validatePostalCode('SW1 1AA', 'UK')).toBe(true)
  })

  it('rejects invalid US ZIP', () => {
    expect(validatePostalCode('1234', 'US')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateStateCode
// ---------------------------------------------------------------------------
describe('validateStateCode', () => {
  it('accepts valid state TX', () => {
    expect(validateStateCode('TX')).toBe(true)
  })

  it('accepts DC', () => {
    expect(validateStateCode('DC')).toBe(true)
  })

  it('accepts lowercase (case-insensitive)', () => {
    expect(validateStateCode('tx')).toBe(true)
  })

  it('rejects invalid state XX', () => {
    expect(validateStateCode('XX')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateStateCode('')).toBe(false)
  })

  it('accepts PR (territory)', () => {
    expect(validateStateCode('PR')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// createValidationResult
// ---------------------------------------------------------------------------
describe('createValidationResult', () => {
  it('creates a valid result with no errors', () => {
    const result = createValidationResult(true)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('creates an invalid result with errors', () => {
    const result = createValidationResult(false, ['Error one', 'Error two'])
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(['Error one', 'Error two'])
  })

  it('includes warnings when provided', () => {
    const result = createValidationResult(true, [], ['Warn one'])
    expect(result.warnings).toEqual(['Warn one'])
  })
})

// ---------------------------------------------------------------------------
// combineValidationResults
// ---------------------------------------------------------------------------
describe('combineValidationResults', () => {
  it('returns valid when all results are valid', () => {
    const a = createValidationResult(true)
    const b = createValidationResult(true)
    const combined = combineValidationResults(a, b)
    expect(combined.isValid).toBe(true)
    expect(combined.errors).toHaveLength(0)
  })

  it('returns invalid when any result is invalid', () => {
    const a = createValidationResult(true)
    const b = createValidationResult(false, ['Bad value'])
    const combined = combineValidationResults(a, b)
    expect(combined.isValid).toBe(false)
    expect(combined.errors).toContain('Bad value')
  })

  it('accumulates errors from multiple invalid results', () => {
    const a = createValidationResult(false, ['Error A'])
    const b = createValidationResult(false, ['Error B'])
    const combined = combineValidationResults(a, b)
    expect(combined.errors).toEqual(['Error A', 'Error B'])
  })

  it('merges warnings from multiple results', () => {
    const a = createValidationResult(true, [], ['Warn A'])
    const b = createValidationResult(true, [], ['Warn B'])
    const combined = combineValidationResults(a, b)
    expect(combined.warnings).toEqual(['Warn A', 'Warn B'])
  })

  it('omits warnings field when none exist', () => {
    const a = createValidationResult(true)
    const b = createValidationResult(true)
    const combined = combineValidationResults(a, b)
    expect(combined.warnings).toBeUndefined()
  })
})
