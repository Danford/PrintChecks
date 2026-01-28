/**
 * Validation utilities
 */

import type { ValidationResult } from '../models/common'

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (flexible format)
 */
export function validatePhone(phone: string): boolean {
  // Remove formatting characters
  const cleaned = phone.replace(/[\s().-]/g, '')
  // Accept 10-15 digits, optionally starting with +
  return /^\+?\d{10,15}$/.test(cleaned)
}

/**
 * Validate US routing number (9 digits)
 */
export function validateRoutingNumber(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) {
    return false
  }

  // Apply checksum algorithm
  const digits = routing.split('').map(Number)
  const checksum =
    (3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      1 * (digits[2] + digits[5] + digits[8])) %
    10

  return checksum === 0
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate ZIP code (US format)
 */
export function validateZipCode(zip: string): boolean {
  // Accept 5 digits or 5+4 format
  return /^\d{5}(-\d{4})?$/.test(zip)
}

/**
 * Validate amount (must be positive number)
 */
export function validateAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(num) && num > 0 && isFinite(num)
}

/**
 * Validate date string
 */
export function validateDate(date: string): boolean {
  if (!date) return false
  const parsed = new Date(date)
  return !isNaN(parsed.getTime())
}

/**
 * Validate date is not in the future
 */
export function validatePastDate(date: string): boolean {
  if (!validateDate(date)) return false
  const parsed = new Date(date)
  return parsed <= new Date()
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(date: string): boolean {
  if (!validateDate(date)) return false
  const parsed = new Date(date)
  return parsed > new Date()
}

/**
 * Validate check number (alphanumeric)
 */
export function validateCheckNumber(checkNumber: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(checkNumber.trim())
}

/**
 * Validate required field
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return true
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min?: number,
  max?: number
): { isValid: boolean; error?: string } {
  const length = value.length

  if (min !== undefined && length < min) {
    return {
      isValid: false,
      error: `Must be at least ${min} characters`,
    }
  }

  if (max !== undefined && length > max) {
    return {
      isValid: false,
      error: `Must be no more than ${max} characters`,
    }
  }

  return { isValid: true }
}

/**
 * Validate number range
 */
export function validateRange(
  value: number,
  min?: number,
  max?: number
): { isValid: boolean; error?: string } {
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      error: `Must be at least ${min}`,
    }
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      error: `Must be no more than ${max}`,
    }
  }

  return { isValid: true }
}

/**
 * Validate postal code (flexible, international)
 */
export function validatePostalCode(postalCode: string, country: string = 'US'): boolean {
  switch (country.toUpperCase()) {
    case 'US':
      return validateZipCode(postalCode)
    case 'CA':
      return /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/.test(postalCode)
    case 'UK':
    case 'GB':
      return /^[A-Z]{1,2}\d{1,2} ?\d[A-Z]{2}$/.test(postalCode)
    default:
      // Generic: alphanumeric with optional spaces/hyphens
      return /^[A-Z0-9\s-]{3,10}$/.test(postalCode)
  }
}

/**
 * Validate state code (US)
 */
export function validateStateCode(state: string): boolean {
  const validStates = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
    'DC',
    'PR',
    'VI',
    'GU',
    'AS',
    'MP',
  ]
  return validStates.includes(state.toUpperCase())
}

/**
 * Create validation result helper
 */
export function createValidationResult(
  isValid: boolean,
  errors: string[] = [],
  warnings: string[] = []
): ValidationResult {
  return { isValid, errors, warnings }
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors: string[] = []
  const allWarnings: string[] = []
  let isValid = true

  for (const result of results) {
    if (!result.isValid) {
      isValid = false
    }
    allErrors.push(...result.errors)
    if (result.warnings) {
      allWarnings.push(...result.warnings)
    }
  }

  return {
    isValid,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
  }
}
