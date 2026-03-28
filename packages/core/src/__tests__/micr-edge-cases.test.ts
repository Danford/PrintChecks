/**
 * MICR line validation edge cases
 *
 * The MICR E-13B encoding used on US checks only supports digits and a small
 * set of special symbols (⑆ ⑈ ⑉ ⑇).  Letters, spaces, or punctuation in the
 * account or check-number fields silently corrupt the printed MICR line.
 *
 * These tests cover:
 *  1. validateBankAccountNumber  — standalone utility
 *  2. validateMICRLineLength     — standalone utility
 *  3. Check.validate()           — account number errors propagate
 *  4. BankAccount.validate()     — account number errors propagate
 */
import { describe, it, expect } from 'vitest'
import { validateBankAccountNumber, validateMICRLineLength } from '../utils/validation'
import { Check } from '../models/Check'
import { BankAccount } from '../models/BankAccount'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function validCheckData() {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',   // valid ABA (JP Morgan Chase)
    bankAccountNumber: '123456789',
    checkNumber: '1001',
    date: '2026-01-15',
    amount: '500.00',
    payTo: 'Acme Corp',
    memo: '',
    signature: '',
  }
}

function validBankAccountData() {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    accountNumber: '123456789',
  }
}

// ---------------------------------------------------------------------------
// validateBankAccountNumber
// ---------------------------------------------------------------------------
describe('validateBankAccountNumber', () => {
  // --- valid inputs ---
  it('accepts a standard 9-digit account number', () => {
    expect(validateBankAccountNumber('123456789')).toBe(true)
  })

  it('accepts minimum length (1 digit)', () => {
    expect(validateBankAccountNumber('5')).toBe(true)
  })

  it('accepts maximum length (17 digits)', () => {
    expect(validateBankAccountNumber('12345678901234567')).toBe(true)
  })

  it('accepts leading zeros (common in bank account numbers)', () => {
    expect(validateBankAccountNumber('00123456')).toBe(true)
  })

  // --- invalid inputs ---
  it('rejects empty string', () => {
    expect(validateBankAccountNumber('')).toBe(false)
  })

  it('rejects whitespace-only string', () => {
    expect(validateBankAccountNumber('   ')).toBe(false)
  })

  it('rejects letters mixed with digits', () => {
    expect(validateBankAccountNumber('ABC123456')).toBe(false)
  })

  it('rejects hyphen-separated account number', () => {
    expect(validateBankAccountNumber('1234-5678')).toBe(false)
  })

  it('rejects account number with spaces', () => {
    expect(validateBankAccountNumber('1234 5678')).toBe(false)
  })

  it('rejects account number with a dot', () => {
    expect(validateBankAccountNumber('123.456')).toBe(false)
  })

  it('rejects 18-digit account number (exceeds 17-digit limit)', () => {
    expect(validateBankAccountNumber('123456789012345678')).toBe(false)
  })

  it('rejects account number that is all letters', () => {
    expect(validateBankAccountNumber('ABCDEFGHI')).toBe(false)
  })

  it('rejects account number with a leading plus sign', () => {
    expect(validateBankAccountNumber('+123456789')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateMICRLineLength
// ---------------------------------------------------------------------------
describe('validateMICRLineLength', () => {
  // Standard routing is always 9 digits.
  // Format: ⑆(1) + routing(9) + ⑆(1) + space(1) + account + ⑈(1) + space(1) + checknum
  // Fixed overhead = 14 characters
  // Remaining budget for account + checknum = 43 - 14 = 29 characters

  it('accepts a typical short combination', () => {
    // account=9, checknum=4  → 14+9+4 = 27 ≤ 43
    expect(validateMICRLineLength('021000021', '123456789', '1001')).toBe(true)
  })

  it('accepts exactly 43 total characters', () => {
    // 14 overhead + 17 account + 12 check = 43
    const account = '12345678901234567'  // 17 digits
    const checkNum = '123456789012'       // 12 digits
    expect(validateMICRLineLength('021000021', account, checkNum)).toBe(true)
  })

  it('rejects combination that exceeds 43 characters', () => {
    // 14 overhead + 17 account + 13 check = 44 > 43
    const account = '12345678901234567'  // 17 digits
    const checkNum = '1234567890123'      // 13 digits
    expect(validateMICRLineLength('021000021', account, checkNum)).toBe(false)
  })

  it('accepts maximum account (17) with minimal check number (1)', () => {
    // 14 + 17 + 1 = 32 ≤ 43
    expect(validateMICRLineLength('021000021', '12345678901234567', '1')).toBe(true)
  })

  it('rejects when account alone would overflow (18 digits)', () => {
    // 14 + 18 + 1 = 33 — but validateBankAccountNumber already blocks 18-digit
    // accounts; here we verify the length check itself triggers at 30-char account
    const longAccount = '1'.repeat(30)
    expect(validateMICRLineLength('021000021', longAccount, '1')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Check.validate() — account number and MICR length propagation
// ---------------------------------------------------------------------------
describe('Check.validate() MICR edge cases', () => {
  it('passes with a standard all-digit account number', () => {
    const check = new Check(validCheckData())
    const { isValid } = check.validate()
    expect(isValid).toBe(true)
  })

  it('fails when account number contains letters', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: 'ABC123456' })
    const { isValid, errors } = check.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /account number/i.test(e))).toBe(true)
  })

  it('fails when account number contains a hyphen', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: '1234-5678' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('fails when account number contains spaces', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: '1234 5678' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('fails when account number exceeds 17 digits', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: '123456789012345678' })
    const { isValid } = check.validate()
    expect(isValid).toBe(false)
  })

  it('passes with a 17-digit account number (maximum allowed)', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: '12345678901234567' })
    const { isValid } = check.validate()
    expect(isValid).toBe(true)
  })

  it('fails when MICR line would exceed 43 characters', () => {
    // account(17) + checkNum(13) + overhead(14) = 44
    const check = new Check({
      ...validCheckData(),
      bankAccountNumber: '12345678901234567',  // 17 digits
      checkNumber: '1234567890123',             // 13 digits
    })
    const { isValid, errors } = check.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /micr/i.test(e))).toBe(true)
  })

  it('passes when combined fields fit exactly in 43-character MICR field', () => {
    // account(17) + checkNum(12) + overhead(14) = 43
    const check = new Check({
      ...validCheckData(),
      bankAccountNumber: '12345678901234567',  // 17 digits
      checkNumber: '123456789012',              // 12 digits
    })
    const { isValid } = check.validate()
    expect(isValid).toBe(true)
  })

  it('canBePrinted() returns false when account number is not MICR-safe', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: 'ACCT-1234' })
    expect(check.canBePrinted()).toBe(false)
  })

  it('does not emit account number error when account is simply empty (separate required error)', () => {
    const check = new Check({ ...validCheckData(), bankAccountNumber: '' })
    const { errors } = check.validate()
    // Should get "required" error, NOT the format error
    expect(errors.some(e => /required/i.test(e))).toBe(true)
    expect(errors.some(e => /digits/i.test(e))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// BankAccount.validate() — account number propagation
// ---------------------------------------------------------------------------
describe('BankAccount.validate() MICR edge cases', () => {
  it('passes with a valid all-digit account number', () => {
    const account = new BankAccount(validBankAccountData())
    expect(account.validate().isValid).toBe(true)
  })

  it('fails when account number contains letters', () => {
    const account = new BankAccount({ ...validBankAccountData(), accountNumber: 'SAVINGS123' })
    const { isValid, errors } = account.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /account number/i.test(e))).toBe(true)
  })

  it('fails when account number has a dash', () => {
    const account = new BankAccount({ ...validBankAccountData(), accountNumber: '123-456-789' })
    expect(account.validate().isValid).toBe(false)
  })

  it('fails when account number is 18 digits', () => {
    const account = new BankAccount({ ...validBankAccountData(), accountNumber: '123456789012345678' })
    expect(account.validate().isValid).toBe(false)
  })

  it('passes with a 1-digit account number (edge minimum)', () => {
    const account = new BankAccount({ ...validBankAccountData(), accountNumber: '9' })
    expect(account.validate().isValid).toBe(true)
  })

  it('does not emit format error when account is empty (separate required error)', () => {
    const account = new BankAccount({ ...validBankAccountData(), accountNumber: '' })
    const { errors } = account.validate()
    expect(errors.some(e => /required/i.test(e))).toBe(true)
    expect(errors.some(e => /digits/i.test(e))).toBe(false)
  })
})
