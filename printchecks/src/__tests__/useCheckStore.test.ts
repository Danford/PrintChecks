/**
 * Tests for src/stores/check.ts
 *
 * Covers computed properties, validation, and synchronous state mutations.
 * secureStorage is mocked so no localStorage is touched.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCheckStore } from '../stores/check'
import type { CheckData, LegacyCheckData } from '@/types'

// ── Mock secureStorage ────────────────────────────────────────────────────────

vi.mock('@/services/secureStorage', () => ({
  secureStorage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn(),
    clear: vi.fn(),
    initialize: vi.fn(),
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCheck(overrides: Partial<CheckData> = {}): CheckData {
  return {
    id: 'test-id',
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    bankAccountNumber: '123456789',
    checkNumber: '1001',
    date: '2026-01-15',
    amount: '500.00',
    payTo: 'Acme Corp',
    memo: 'office supplies',
    signature: 'Jane Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
    isVoid: false,
    isPrinted: false,
    ...overrides,
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ── isValid computed ──────────────────────────────────────────────────────────

describe('isValid computed', () => {
  it('returns true when all validation fields are true', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    expect(store.isValid).toBe(true)
  })

  it('returns false when any validation field is false', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ routingNumber: 'bad' }))
    expect(store.isValid).toBe(false)
  })
})

// ── amountInWords computed ────────────────────────────────────────────────────

describe('amountInWords computed', () => {
  it('returns "" when currentCheck is null', () => {
    const store = useCheckStore()
    expect(store.amountInWords).toBe('')
  })

  it('returns "" when amount is an empty string', () => {
    const store = useCheckStore()
    store.currentCheck = makeCheck({ amount: '' })
    expect(store.amountInWords).toBe('')
  })

  it('converts a numeric amount to words', () => {
    const store = useCheckStore()
    store.currentCheck = makeCheck({ amount: '500.00' })
    expect(store.amountInWords).toContain('Five Hundred')
  })

  it('handles large amounts (thousands) correctly', () => {
    const store = useCheckStore()
    store.currentCheck = makeCheck({ amount: '1500.00' })
    expect(store.amountInWords).toContain('One Thousand Five Hundred')
  })
})

// ── nextCheckNumber computed ──────────────────────────────────────────────────

describe('nextCheckNumber computed', () => {
  it('returns "100" when currentCheck is null', () => {
    const store = useCheckStore()
    expect(store.nextCheckNumber).toBe('100')
  })

  it('increments a numeric checkNumber by 1', () => {
    const store = useCheckStore()
    store.currentCheck = makeCheck({ checkNumber: '1001' })
    expect(store.nextCheckNumber).toBe('1002')
  })

  it('returns "100" when checkNumber is non-numeric', () => {
    const store = useCheckStore()
    store.currentCheck = makeCheck({ checkNumber: 'abc' })
    expect(store.nextCheckNumber).toBe('100')
  })
})

// ── validateCheck() ───────────────────────────────────────────────────────────

describe('validateCheck()', () => {
  it('returns false when currentCheck is null', () => {
    const store = useCheckStore()
    expect(store.validateCheck()).toBe(false)
  })

  it('returns true for a fully valid check', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    expect(store.validateCheck()).toBe(true)
  })

  it('marks routingNumber invalid when not exactly 9 digits', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ routingNumber: '12345' }))
    expect(store.validation.routingNumber).toBe(false)
    expect(store.isValid).toBe(false)
  })

  it('marks routingNumber invalid when it contains non-digits', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ routingNumber: '12345678a' }))
    expect(store.validation.routingNumber).toBe(false)
  })

  it('marks amount invalid when amount is 0', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ amount: '0' }))
    expect(store.validation.amount).toBe(false)
  })

  it('marks amount invalid for a negative number', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ amount: '-10' }))
    expect(store.validation.amount).toBe(false)
  })

  it('marks date invalid for an unparseable string', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ date: 'not-a-date' }))
    expect(store.validation.date).toBe(false)
  })

  it('marks accountHolderName invalid when empty', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ accountHolderName: '' }))
    expect(store.validation.accountHolderName).toBe(false)
  })

  it('marks payTo invalid when whitespace only', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ payTo: '   ' }))
    expect(store.validation.payTo).toBe(false)
  })
})

// ── updateCheck() ─────────────────────────────────────────────────────────────

describe('updateCheck()', () => {
  it('merges updates into currentCheck', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.updateCheck({ payTo: 'New Vendor' })
    expect(store.currentCheck?.payTo).toBe('New Vendor')
  })

  it('preserves fields not included in updates', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ memo: 'keep me' }))
    store.updateCheck({ payTo: 'New Vendor' })
    expect(store.currentCheck?.memo).toBe('keep me')
  })

  it('sets hasUnsavedChanges to true', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.hasUnsavedChanges = false
    store.updateCheck({ payTo: 'Test' })
    expect(store.hasUnsavedChanges).toBe(true)
  })

  it('triggers re-validation after update', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.updateCheck({ routingNumber: 'bad' })
    expect(store.validation.routingNumber).toBe(false)
  })

  it('is a no-op when currentCheck is null', () => {
    const store = useCheckStore()
    expect(() => store.updateCheck({ payTo: 'x' })).not.toThrow()
    expect(store.currentCheck).toBeNull()
  })
})

// ── loadCheck() ───────────────────────────────────────────────────────────────

describe('loadCheck()', () => {
  it('sets currentCheck from CheckData', () => {
    const store = useCheckStore()
    const check = makeCheck({ payTo: 'ACME' })
    store.loadCheck(check)
    expect(store.currentCheck?.payTo).toBe('ACME')
  })

  it('sets hasUnsavedChanges to false', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    expect(store.hasUnsavedChanges).toBe(false)
  })

  it('runs validateCheck after loading', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ routingNumber: 'bad' }))
    expect(store.validation.routingNumber).toBe(false)
  })

  it('converts a legacy check (no id or createdAt) by adding generated fields', () => {
    const store = useCheckStore()
    const legacy: LegacyCheckData = {
      accountHolderName: 'Bob', accountHolderAddress: '1 St',
      accountHolderCity: 'Dallas', accountHolderState: 'TX', accountHolderZip: '75201',
      bankName: 'Bank', routingNumber: '021000021', bankAccountNumber: '999',
      checkNumber: '5', date: '2026-01-01', amount: '100', payTo: 'Vendor',
      memo: '', signature: 'Bob',
    }
    store.loadCheck(legacy)
    expect(store.currentCheck?.id).toBeTruthy()
    expect(store.currentCheck?.createdAt).toBeInstanceOf(Date)
  })
})

// ── duplicateCheck() ──────────────────────────────────────────────────────────

describe('duplicateCheck()', () => {
  it('returns null when currentCheck is null', () => {
    const store = useCheckStore()
    expect(store.duplicateCheck()).toBeNull()
  })

  it('creates a new check with a different id', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ id: 'orig-id' }))
    const dup = store.duplicateCheck()
    expect(dup?.id).not.toBe('orig-id')
    expect(dup?.id).toBeTruthy()
  })

  it('resets amount to "0.00"', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ amount: '750.00' }))
    const dup = store.duplicateCheck()
    expect(dup?.amount).toBe('0.00')
  })

  it('resets payTo and memo to empty strings', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ payTo: 'Vendor', memo: 'notes' }))
    const dup = store.duplicateCheck()
    expect(dup?.payTo).toBe('')
    expect(dup?.memo).toBe('')
  })

  it('resets isPrinted and isVoid to false', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ isPrinted: true, isVoid: true }))
    const dup = store.duplicateCheck()
    expect(dup?.isPrinted).toBe(false)
    expect(dup?.isVoid).toBe(false)
  })

  it('sets status to "draft"', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.status = 'printed'
    store.duplicateCheck()
    expect(store.status).toBe('draft')
  })

  it('sets currentCheck to the duplicate', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ id: 'orig' }))
    const dup = store.duplicateCheck()
    expect(store.currentCheck?.id).toBe(dup?.id)
  })
})

// ── markAsPrinted() ───────────────────────────────────────────────────────────

describe('markAsPrinted()', () => {
  it('sets isPrinted to true', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.markAsPrinted()
    expect(store.currentCheck?.isPrinted).toBe(true)
  })

  it('sets printedAt to a Date', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.markAsPrinted()
    expect(store.currentCheck?.printedAt).toBeInstanceOf(Date)
  })

  it('sets status to "printed"', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.markAsPrinted()
    expect(store.status).toBe('printed')
  })
})

// ── voidCheck() ───────────────────────────────────────────────────────────────

describe('voidCheck()', () => {
  it('sets isVoid to true', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.voidCheck()
    expect(store.currentCheck?.isVoid).toBe(true)
  })

  it('sets status to "void"', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.voidCheck()
    expect(store.status).toBe('void')
  })
})

// ── Template management ───────────────────────────────────────────────────────

describe('saveAsTemplate()', () => {
  it('returns null when no currentCheck', () => {
    const store = useCheckStore()
    expect(store.saveAsTemplate('My Template')).toBeNull()
  })

  it('creates a template with bank fields from currentCheck', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    const tpl = store.saveAsTemplate('Payroll', 'monthly payroll')
    expect(tpl?.name).toBe('Payroll')
    expect(tpl?.checkData.bankName).toBe('First National')
    expect(tpl?.checkData.routingNumber).toBe('021000021')
  })

  it('adds the template to the templates array', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.saveAsTemplate('Tpl')
    expect(store.templates).toHaveLength(1)
  })
})

describe('deleteTemplate()', () => {
  it('removes the template matching the given id', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    const tpl = store.saveAsTemplate('Tpl')!
    store.deleteTemplate(tpl.id!)
    expect(store.templates).toHaveLength(0)
  })

  it('is a no-op for an unknown id', () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.saveAsTemplate('Tpl')
    store.deleteTemplate('no-such-id')
    expect(store.templates).toHaveLength(1)
  })
})

// ── createNewCheck() with template ───────────────────────────────────────────

describe('createNewCheck() with template', () => {
  it('applies template bankName to the new check', async () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ checkNumber: '1001' }))
    const tpl = store.saveAsTemplate('T')!

    const newCheck = await store.createNewCheck(tpl)
    expect(newCheck.bankName).toBe('First National')
  })

  it('uses nextCheckNumber, not the template checkNumber', async () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck({ checkNumber: '1001' }))
    const tpl = store.saveAsTemplate('T')!

    const newCheck = await store.createNewCheck(tpl)
    expect(newCheck.checkNumber).toBe('1002')
  })

  it('sets status to "draft"', async () => {
    const store = useCheckStore()
    store.loadCheck(makeCheck())
    store.status = 'printed'
    const tpl = store.saveAsTemplate('T')!
    await store.createNewCheck(tpl)
    expect(store.status).toBe('draft')
  })
})
