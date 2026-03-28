/**
 * Tests for BankAccount model
 */
import { describe, it, expect } from 'vitest'
import { BankAccount, type BankAccountData } from '../models/BankAccount'

function validAccountData(): BankAccountData {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National Bank',
    routingNumber: '021000021', // valid ABA
    accountNumber: '987654321',
  }
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------
describe('BankAccount constructor', () => {
  it('assigns all provided fields', () => {
    const account = new BankAccount(validAccountData())
    expect(account.accountHolderName).toBe('Jane Smith')
    expect(account.bankName).toBe('First National Bank')
    expect(account.routingNumber).toBe('021000021')
  })

  it('auto-generates an id if none provided', () => {
    const account = new BankAccount(validAccountData())
    expect(account.id).toBeTruthy()
  })

  it('preserves provided id', () => {
    const account = new BankAccount({ ...validAccountData(), id: 'custom-id' })
    expect(account.id).toBe('custom-id')
  })

  it('sets createdAt if not provided', () => {
    const account = new BankAccount(validAccountData())
    expect(account.createdAt).toBeInstanceOf(Date)
  })

  it('preserves provided createdAt', () => {
    const created = new Date('2025-01-01')
    const account = new BankAccount({ ...validAccountData(), createdAt: created })
    expect(account.createdAt).toEqual(created)
  })

  it('defaults isActive to true', () => {
    const account = new BankAccount(validAccountData())
    expect(account.isActive).toBe(true)
  })

  it('preserves isActive: false when explicitly set', () => {
    const account = new BankAccount({ ...validAccountData(), isActive: false })
    expect(account.isActive).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validate()
// ---------------------------------------------------------------------------
describe('BankAccount.validate()', () => {
  it('passes for valid account data', () => {
    const account = new BankAccount(validAccountData())
    const { isValid, errors } = account.validate()
    expect(isValid).toBe(true)
    expect(errors).toHaveLength(0)
  })

  it('fails when accountHolderName is empty', () => {
    const account = new BankAccount({ ...validAccountData(), accountHolderName: '' })
    const { isValid, errors } = account.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /account holder name/i.test(e))).toBe(true)
  })

  it('fails when bankName is empty', () => {
    const account = new BankAccount({ ...validAccountData(), bankName: '' })
    const { isValid, errors } = account.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /bank name/i.test(e))).toBe(true)
  })

  it('fails when routingNumber fails ABA checksum', () => {
    const account = new BankAccount({ ...validAccountData(), routingNumber: '123456789' })
    const { isValid, errors } = account.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /routing/i.test(e))).toBe(true)
  })

  it('fails when routingNumber is too short', () => {
    const account = new BankAccount({ ...validAccountData(), routingNumber: '12345' })
    const { isValid } = account.validate()
    expect(isValid).toBe(false)
  })

  it('fails when accountNumber is empty', () => {
    const account = new BankAccount({ ...validAccountData(), accountNumber: '' })
    const { isValid, errors } = account.validate()
    expect(isValid).toBe(false)
    expect(errors.some(e => /account number/i.test(e))).toBe(true)
  })

  it('accumulates multiple errors', () => {
    const account = new BankAccount({
      ...validAccountData(),
      accountHolderName: '',
      bankName: '',
      routingNumber: '123456789', // fails ABA checksum
      accountNumber: '',
    })
    const { isValid, errors } = account.validate()
    expect(isValid).toBe(false)
    expect(errors.length).toBeGreaterThanOrEqual(4)
  })
})

// ---------------------------------------------------------------------------
// getMaskedAccountNumber()
// ---------------------------------------------------------------------------
describe('BankAccount.getMaskedAccountNumber()', () => {
  it('masks all but last 4 digits with 4 asterisks', () => {
    // accountNumber '987654321' (9 digits) → '****' + '4321' (implementation uses fixed 4 asterisks)
    const account = new BankAccount(validAccountData())
    expect(account.getMaskedAccountNumber()).toBe('****4321')
  })

  it('returns short account number unchanged', () => {
    const account = new BankAccount({ ...validAccountData(), accountNumber: '1234' })
    expect(account.getMaskedAccountNumber()).toBe('1234')
  })

  it('returns empty string when accountNumber is missing', () => {
    const account = new BankAccount(validAccountData())
    account.accountNumber = ''
    expect(account.getMaskedAccountNumber()).toBe('')
  })
})

// ---------------------------------------------------------------------------
// getFullAddress()
// ---------------------------------------------------------------------------
describe('BankAccount.getFullAddress()', () => {
  it('joins address parts with comma', () => {
    const account = new BankAccount(validAccountData())
    expect(account.getFullAddress()).toBe('1 Main St, Austin, TX, 78701')
  })

  it('omits missing parts', () => {
    const account = new BankAccount({
      ...validAccountData(),
      accountHolderAddress: '',
      accountHolderCity: 'Dallas',
    })
    expect(account.getFullAddress()).toBe('Dallas, TX, 78701')
  })

  it('includes country when provided', () => {
    const account = new BankAccount({
      ...validAccountData(),
      accountHolderCountry: 'US',
    })
    expect(account.getFullAddress()).toContain('US')
  })
})

// ---------------------------------------------------------------------------
// toJSON() / fromJSON()
// ---------------------------------------------------------------------------
describe('BankAccount serialization', () => {
  it('toJSON returns a plain object with all fields', () => {
    const account = new BankAccount(validAccountData())
    const json = account.toJSON()
    expect(json.accountHolderName).toBe('Jane Smith')
    expect(json.routingNumber).toBe('021000021')
    expect(json.id).toBeTruthy()
  })

  it('fromJSON reconstructs a BankAccount instance', () => {
    const original = new BankAccount(validAccountData())
    const json = original.toJSON()
    const restored = BankAccount.fromJSON(json)
    expect(restored).toBeInstanceOf(BankAccount)
    expect(restored.id).toBe(original.id)
    expect(restored.bankName).toBe(original.bankName)
  })

  it('roundtrip preserves all fields', () => {
    const original = new BankAccount({
      ...validAccountData(),
      nickname: 'Primary Checking',
      accountType: 'checking',
    })
    const restored = BankAccount.fromJSON(original.toJSON())
    expect(restored.nickname).toBe('Primary Checking')
    expect(restored.accountType).toBe('checking')
  })
})
