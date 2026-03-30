/**
 * Tests for src/utils/checkFilters.ts
 *
 * Pure functions — no mocks or Pinia setup required.
 */
import { describe, expect, it } from 'vitest'
import { filterActiveChecks, filterActivePayments, filterActivePaymentData } from '../utils/checkFilters'
import type { CheckData, PaymentRecord } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCheck(overrides: Partial<CheckData> = {}): CheckData {
  return {
    id: 'c1',
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '',
    accountHolderCity: '',
    accountHolderState: '',
    accountHolderZip: '',
    bankName: 'Bank',
    routingNumber: '021000021',
    bankAccountNumber: '123',
    checkNumber: '1001',
    date: '2026-01-15',
    amount: '100.00',
    payTo: 'Vendor',
    memo: '',
    signature: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    isVoid: false,
    isPrinted: false,
    ...overrides,
  }
}

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: 'p1',
    checkData: makeCheck(),
    totalAmount: 100,
    currency: 'USD',
    status: 'completed',
    printHistory: [],
    auditTrail: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// ── filterActiveChecks() ──────────────────────────────────────────────────────

describe('filterActiveChecks()', () => {
  it('returns all checks when none are voided', () => {
    const checks = [makeCheck({ id: 'a' }), makeCheck({ id: 'b' })]
    expect(filterActiveChecks(checks)).toHaveLength(2)
  })

  it('removes checks where isVoid is true', () => {
    const checks = [
      makeCheck({ id: 'active', isVoid: false }),
      makeCheck({ id: 'voided', isVoid: true }),
    ]
    const result = filterActiveChecks(checks)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('active')
  })

  it('returns an empty array when all checks are voided', () => {
    const checks = [makeCheck({ isVoid: true }), makeCheck({ isVoid: true })]
    expect(filterActiveChecks(checks)).toHaveLength(0)
  })

  it('returns an empty array for an empty input', () => {
    expect(filterActiveChecks([])).toHaveLength(0)
  })
})

// ── filterActivePayments() ────────────────────────────────────────────────────

describe('filterActivePayments()', () => {
  it('returns all payment records unchanged (pass-through)', () => {
    const payments = [makePayment({ id: 'p1' }), makePayment({ id: 'p2' })]
    const result = filterActivePayments(payments)
    expect(result).toHaveLength(2)
    expect(result).toBe(payments) // same reference — no copy
  })

  it('returns an empty array for an empty input', () => {
    expect(filterActivePayments([])).toHaveLength(0)
  })
})

// ── filterActivePaymentData() ─────────────────────────────────────────────────

describe('filterActivePaymentData()', () => {
  it('returns filtered checks and all payments', () => {
    const checks = [
      makeCheck({ id: 'active', isVoid: false }),
      makeCheck({ id: 'voided', isVoid: true }),
    ]
    const payments = [makePayment({ id: 'p1' })]
    const result = filterActivePaymentData(checks, payments)
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0].id).toBe('active')
    expect(result.payments).toHaveLength(1)
  })

  it('returns empty checks and payments for all-voided input', () => {
    const checks = [makeCheck({ isVoid: true })]
    const result = filterActivePaymentData(checks, [])
    expect(result.checks).toHaveLength(0)
    expect(result.payments).toHaveLength(0)
  })

  it('returns both arrays empty for empty inputs', () => {
    const result = filterActivePaymentData([], [])
    expect(result.checks).toHaveLength(0)
    expect(result.payments).toHaveLength(0)
  })
})
