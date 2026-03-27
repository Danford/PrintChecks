/**
 * Tests for Check model validation — particularly ABA routing number checksum
 */
import { describe, it, expect } from 'vitest'
import { Check } from '../models/Check'
import { validateRoutingNumber } from '../utils/validation'

// ---------------------------------------------------------------------------
// ABA routing number checksum — standalone utility
// ---------------------------------------------------------------------------
describe('validateRoutingNumber', () => {
  it('accepts a known-good routing number (021000021, JP Morgan Chase)', () => {
    expect(validateRoutingNumber('021000021')).toBe(true)
  })

  it('accepts another valid routing number (111000025, Federal Reserve)', () => {
    expect(validateRoutingNumber('111000025')).toBe(true)
  })

  it('accepts a routing number valid by checksum math (123456780)', () => {
    // 3*(1+4+7) + 7*(2+5+8) + 1*(3+6+0) = 36+105+9 = 150 → 150%10 === 0
    expect(validateRoutingNumber('123456780')).toBe(true)
  })

  it('rejects a 9-digit number that fails the ABA checksum (123456789)', () => {
    // 3*(1+4+7) + 7*(2+5+8) + 1*(3+6+9) = 36+105+18 = 159 → 159%10 === 9 ≠ 0
    expect(validateRoutingNumber('123456789')).toBe(false)
  })

  it('rejects fewer than 9 digits', () => {
    expect(validateRoutingNumber('12345678')).toBe(false)
  })

  it('rejects more than 9 digits', () => {
    expect(validateRoutingNumber('0210000210')).toBe(false)
  })

  it('rejects routing numbers containing letters', () => {
    expect(validateRoutingNumber('02100002a')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateRoutingNumber('')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Check.validate() — wires through ABA checksum
// ---------------------------------------------------------------------------
function validCheckData() {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',   // valid ABA
    bankAccountNumber: '123456789',
    checkNumber: '1001',
    date: '2026-01-15',
    amount: '500.00',
    payTo: 'Acme Corp',
    memo: '',
    signature: '',
  }
}

describe('Check.validate()', () => {
  it('passes with a valid ABA routing number', () => {
    const check = new Check(validCheckData())
    const { isValid, errors } = check.validate()
    expect(isValid).toBe(true)
    expect(errors).toHaveLength(0)
  })

  it('fails when routing number passes regex but fails ABA checksum', () => {
    const check = new Check({ ...validCheckData(), routingNumber: '123456789' })
    const { isValid, errors } = check.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /routing/i.test(e))).toBe(true)
  })

  it('fails when routing number is fewer than 9 digits', () => {
    const check = new Check({ ...validCheckData(), routingNumber: '12345678' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('fails when routing number contains letters', () => {
    const check = new Check({ ...validCheckData(), routingNumber: '02100002a' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('fails when amount is zero', () => {
    const check = new Check({ ...validCheckData(), amount: '0' })
    const { isValid, errors } = check.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /amount/i.test(e))).toBe(true)
  })

  it('fails when amount is negative', () => {
    const check = new Check({ ...validCheckData(), amount: '-50' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('fails when payTo is empty', () => {
    const check = new Check({ ...validCheckData(), payTo: '' })
    const { isValid, errors } = check.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /payee/i.test(e))).toBe(true)
  })

  it('fails when date is invalid', () => {
    const check = new Check({ ...validCheckData(), date: 'not-a-date' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('fails when bankAccountNumber is empty', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: '' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('accumulates multiple errors at once', () => {
    const check = new Check({
      ...validCheckData(),
      routingNumber: '123456789',
      payTo: '',
      amount: '0',
    })
    const { isValid, errors } = check.validate()
    expect(isValid).toBe(false)
    expect(errors.length).toBeGreaterThanOrEqual(3)
  })

  it('canBePrinted() returns false when routing checksum fails', () => {
    const check = new Check({ ...validCheckData(), routingNumber: '123456789' })
    expect(check.canBePrinted()).toBe(false)
  })

  it('canBePrinted() returns true for a fully valid check', () => {
    const check = new Check(validCheckData())
    expect(check.canBePrinted()).toBe(true)
  })
})
