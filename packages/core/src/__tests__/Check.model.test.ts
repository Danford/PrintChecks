/**
 * Tests for Check model behaviour beyond validate()
 * (validate() and canBePrinted() routing-number paths are in Check.validate.test.ts)
 */
import { describe, expect, it } from 'vitest'

import { Check } from '../models/Check'
import type { CheckData } from '../models/Check'

// ── Helpers ──────────────────────────────────────────────────────────────────

function validData(overrides: Partial<CheckData> = {}): CheckData {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021', // valid ABA
    bankAccountNumber: '123456789',
    checkNumber: '1001',
    date: '2026-01-15',
    amount: '500.00',
    payTo: 'Acme Corp',
    memo: 'office supplies',
    signature: 'Jane Smith',
    ...overrides,
  }
}

// ── Constructor ───────────────────────────────────────────────────────────────

describe('Check constructor', () => {
  it('assigns all supplied fields', () => {
    const data = validData({ memo: 'test memo', signature: 'sig' })
    const check = new Check(data)
    expect(check.accountHolderName).toBe('Jane Smith')
    expect(check.payTo).toBe('Acme Corp')
    expect(check.memo).toBe('test memo')
  })

  it('auto-generates an id when none is provided', () => {
    const check = new Check(validData())
    expect(check.id).toBeTruthy()
    expect(typeof check.id).toBe('string')
  })

  it('preserves an existing id when provided', () => {
    const check = new Check(validData({ id: 'fixed-id-123' }))
    expect(check.id).toBe('fixed-id-123')
  })

  it('auto-sets createdAt when not provided', () => {
    const check = new Check(validData())
    expect(check.createdAt).toBeInstanceOf(Date)
  })

  it('preserves an existing createdAt when provided', () => {
    const created = new Date('2025-01-01T00:00:00Z')
    const check = new Check(validData({ createdAt: created }))
    expect(check.createdAt).toEqual(created)
  })

  it('always sets updatedAt on construction', () => {
    const check = new Check(validData())
    expect(check.updatedAt).toBeInstanceOf(Date)
  })

  it('defaults status to "draft" when not provided', () => {
    const check = new Check(validData())
    expect(check.status).toBe('draft')
  })

  it('preserves a provided status', () => {
    const check = new Check(validData({ status: 'ready' }))
    expect(check.status).toBe('ready')
  })

  it('defaults currency to "USD" when not provided', () => {
    const check = new Check(validData())
    expect(check.currency).toBe('USD')
  })

  it('preserves a provided currency', () => {
    const check = new Check(validData({ currency: 'CAD' }))
    expect(check.currency).toBe('CAD')
  })

  it('defaults isVoid to false', () => {
    const check = new Check(validData())
    expect(check.isVoid).toBe(false)
  })

  it('defaults isPrinted to false', () => {
    const check = new Check(validData())
    expect(check.isPrinted).toBe(false)
  })

  it('generates unique ids across multiple instances', () => {
    const a = new Check(validData())
    const b = new Check(validData())
    expect(a.id).not.toBe(b.id)
  })
})

// ── getNumericAmount() ───────────────────────────────────────────────────────

describe('getNumericAmount()', () => {
  it('parses a string amount to a number', () => {
    const check = new Check(validData({ amount: '123.45' }))
    expect(check.getNumericAmount()).toBeCloseTo(123.45)
  })

  it('returns a numeric amount as-is', () => {
    const check = new Check(validData({ amount: 99.99 }))
    expect(check.getNumericAmount()).toBeCloseTo(99.99)
  })

  it('returns NaN for a non-numeric string', () => {
    const check = new Check(validData({ amount: 'not-a-number' }))
    expect(isNaN(check.getNumericAmount())).toBe(true)
  })
})

// ── markAsPrinted() ──────────────────────────────────────────────────────────

describe('markAsPrinted()', () => {
  it('sets isPrinted to true', () => {
    const check = new Check(validData())
    check.markAsPrinted()
    expect(check.isPrinted).toBe(true)
  })

  it('sets printedAt to a Date', () => {
    const check = new Check(validData())
    check.markAsPrinted()
    expect(check.printedAt).toBeInstanceOf(Date)
  })

  it('sets status to "printed"', () => {
    const check = new Check(validData())
    check.markAsPrinted()
    expect(check.status).toBe('printed')
  })

  it('updates updatedAt', () => {
    const check = new Check(validData())
    const before = check.updatedAt
    check.markAsPrinted()
    expect(check.updatedAt).toBeInstanceOf(Date)
    expect(check.updatedAt!.getTime()).toBeGreaterThanOrEqual(before!.getTime())
  })

  it('canBePrinted() returns false after markAsPrinted()', () => {
    const check = new Check(validData())
    check.markAsPrinted()
    expect(check.canBePrinted()).toBe(false)
  })
})

// ── void() ───────────────────────────────────────────────────────────────────

describe('void()', () => {
  it('sets isVoid to true', () => {
    const check = new Check(validData())
    check.void()
    expect(check.isVoid).toBe(true)
  })

  it('sets voidedAt to a Date', () => {
    const check = new Check(validData())
    check.void()
    expect(check.voidedAt).toBeInstanceOf(Date)
  })

  it('sets status to "void"', () => {
    const check = new Check(validData())
    check.void()
    expect(check.status).toBe('void')
  })

  it('stores the provided reason', () => {
    const check = new Check(validData())
    check.void('lost in mail')
    expect(check.voidReason).toBe('lost in mail')
  })

  it('sets voidReason to undefined when no reason is provided', () => {
    const check = new Check(validData())
    check.void()
    expect(check.voidReason).toBeUndefined()
  })

  it('updates updatedAt', () => {
    const check = new Check(validData())
    const before = check.updatedAt
    check.void('reason')
    expect(check.updatedAt!.getTime()).toBeGreaterThanOrEqual(before!.getTime())
  })

  it('canBePrinted() returns false after void()', () => {
    const check = new Check(validData())
    check.void()
    expect(check.canBePrinted()).toBe(false)
  })
})

// ── canBeVoided() ─────────────────────────────────────────────────────────────

describe('canBeVoided()', () => {
  it('returns true for a non-voided check', () => {
    const check = new Check(validData())
    expect(check.canBeVoided()).toBe(true)
  })

  it('returns false once the check has been voided', () => {
    const check = new Check(validData())
    check.void()
    expect(check.canBeVoided()).toBe(false)
  })

  it('returns false when constructed with isVoid: true', () => {
    const check = new Check(validData({ isVoid: true }))
    expect(check.canBeVoided()).toBe(false)
  })
})

// ── getFullAddress() ─────────────────────────────────────────────────────────

describe('getFullAddress()', () => {
  it('joins all address parts with ", "', () => {
    const check = new Check(validData())
    expect(check.getFullAddress()).toBe('1 Main St, Austin, TX, 78701')
  })

  it('filters out empty address parts', () => {
    const check = new Check(
      validData({ accountHolderCity: '', accountHolderZip: '' })
    )
    expect(check.getFullAddress()).toBe('1 Main St, TX')
  })

  it('returns an empty string when all parts are empty', () => {
    const check = new Check(
      validData({
        accountHolderAddress: '',
        accountHolderCity: '',
        accountHolderState: '',
        accountHolderZip: '',
      })
    )
    expect(check.getFullAddress()).toBe('')
  })
})

// ── duplicate() ──────────────────────────────────────────────────────────────

describe('duplicate()', () => {
  it('returns a Check instance', () => {
    const original = new Check(validData())
    expect(original.duplicate()).toBeInstanceOf(Check)
  })

  it('generates a new id different from the original', () => {
    const original = new Check(validData({ id: 'orig-id' }))
    const dup = original.duplicate()
    expect(dup.id).not.toBe('orig-id')
    expect(dup.id).toBeTruthy()
  })

  it('uses the supplied newCheckNumber', () => {
    const original = new Check(validData({ checkNumber: '1001' }))
    const dup = original.duplicate('9999')
    expect(dup.checkNumber).toBe('9999')
  })

  it('keeps the original checkNumber when newCheckNumber is omitted', () => {
    const original = new Check(validData({ checkNumber: '1001' }))
    const dup = original.duplicate()
    expect(dup.checkNumber).toBe('1001')
  })

  it('preserves amount and payTo from the original', () => {
    const original = new Check(validData({ amount: '750.00', payTo: 'Vendor Inc' }))
    const dup = original.duplicate()
    expect(dup.amount).toBe('750.00')
    expect(dup.payTo).toBe('Vendor Inc')
  })

  it('resets print state: isPrinted=false, printedAt=undefined', () => {
    const original = new Check(validData())
    original.markAsPrinted()
    const dup = original.duplicate()
    expect(dup.isPrinted).toBe(false)
    expect(dup.printedAt).toBeUndefined()
  })

  it('resets void state: isVoid=false, voidedAt=undefined, voidReason=undefined', () => {
    const original = new Check(validData())
    original.void('old reason')
    const dup = original.duplicate()
    expect(dup.isVoid).toBe(false)
    expect(dup.voidedAt).toBeUndefined()
    expect(dup.voidReason).toBeUndefined()
  })

  it('resets status to "draft"', () => {
    const original = new Check(validData({ status: 'printed' }))
    const dup = original.duplicate()
    expect(dup.status).toBe('draft')
  })

  it('sets date to today (non-empty string)', () => {
    const original = new Check(validData({ date: '2020-01-01' }))
    const dup = original.duplicate()
    expect(typeof dup.date).toBe('string')
    expect(dup.date.length).toBeGreaterThan(0)
  })

  it('does not share the same createdAt as the original', () => {
    const original = new Check(validData({ createdAt: new Date('2020-01-01') }))
    const dup = original.duplicate()
    expect(dup.createdAt).not.toEqual(new Date('2020-01-01'))
  })
})

// ── toJSON() ─────────────────────────────────────────────────────────────────

describe('toJSON()', () => {
  it('returns a plain object, not a Check instance', () => {
    const check = new Check(validData())
    const json = check.toJSON()
    expect(json).not.toBeInstanceOf(Check)
    expect(typeof json).toBe('object')
  })

  it('includes all CheckData fields', () => {
    const check = new Check(
      validData({
        id: 'test-id',
        memo: 'memo text',
        signature: 'sig',
        currency: 'CAD',
        amountInWords: 'five hundred',
        receiptId: 'r1',
        vendorId: 'v1',
      })
    )
    const json = check.toJSON()
    expect(json.id).toBe('test-id')
    expect(json.accountHolderName).toBe('Jane Smith')
    expect(json.bankName).toBe('First National')
    expect(json.routingNumber).toBe('021000021')
    expect(json.bankAccountNumber).toBe('123456789')
    expect(json.checkNumber).toBe('1001')
    expect(json.amount).toBe('500.00')
    expect(json.payTo).toBe('Acme Corp')
    expect(json.memo).toBe('memo text')
    expect(json.currency).toBe('CAD')
    expect(json.amountInWords).toBe('five hundred')
    expect(json.receiptId).toBe('r1')
    expect(json.vendorId).toBe('v1')
  })

  it('reflects mutated state after markAsPrinted()', () => {
    const check = new Check(validData())
    check.markAsPrinted()
    const json = check.toJSON()
    expect(json.isPrinted).toBe(true)
    expect(json.printedAt).toBeInstanceOf(Date)
    expect(json.status).toBe('printed')
  })

  it('reflects mutated state after void()', () => {
    const check = new Check(validData())
    check.void('test reason')
    const json = check.toJSON()
    expect(json.isVoid).toBe(true)
    expect(json.voidedAt).toBeInstanceOf(Date)
    expect(json.voidReason).toBe('test reason')
    expect(json.status).toBe('void')
  })
})

// ── fromJSON() ───────────────────────────────────────────────────────────────

describe('Check.fromJSON()', () => {
  it('creates a Check instance', () => {
    const check = Check.fromJSON(validData())
    expect(check).toBeInstanceOf(Check)
  })

  it('round-trips through toJSON(): fromJSON(toJSON()) equals original', () => {
    const original = new Check(validData({ id: 'rt-id', memo: 'round trip' }))
    original.markAsPrinted()
    const roundTripped = Check.fromJSON(original.toJSON())
    expect(roundTripped.id).toBe(original.id)
    expect(roundTripped.amount).toBe(original.amount)
    expect(roundTripped.payTo).toBe(original.payTo)
    expect(roundTripped.isPrinted).toBe(true)
    expect(roundTripped.status).toBe('printed')
    expect(roundTripped.memo).toBe('round trip')
  })

  it('preserves the id from the supplied data', () => {
    const check = Check.fromJSON(validData({ id: 'supplied-id' }))
    expect(check.id).toBe('supplied-id')
  })
})
