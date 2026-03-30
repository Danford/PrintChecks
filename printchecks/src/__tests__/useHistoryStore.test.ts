/**
 * Tests for src/stores/history.ts
 *
 * Focuses on filteredItems computed (filtering, searching, sorting),
 * pagination helpers, and in-memory state mutations.
 * secureStorage is mocked so no localStorage is touched.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHistoryStore } from '../stores/history'
import type { CheckData, ReceiptData, PaymentRecord } from '@/types'

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

let _id = 0
function uid(prefix: string) { return `${prefix}-${++_id}` }

function makeCheck(overrides: Partial<CheckData> = {}): CheckData {
  return {
    id: uid('chk'),
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
    amount: '500.00',
    payTo: 'Acme Corp',
    memo: '',
    signature: '',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeReceipt(overrides: Partial<ReceiptData> = {}): ReceiptData {
  return {
    id: uid('rec'),
    receiptNumber: 'R001',
    date: '2026-01-15',
    lineItems: [],
    totals: { subtotal: 0, totalTax: 0, totalDiscount: 0, shippingAmount: 0, handlingAmount: 0, grandTotal: 0 },
    taxes: [],
    discounts: [],
    metadata: {},
    billTo: { name: 'Client Corp', address: '', city: '', state: '', zip: '' },
    paymentInfo: { method: 'check', amount: 500, currency: 'USD' },
    settings: { showLineNumbers: true, showTaxDetails: true, showDiscountDetails: true, includeNotes: true, currency: 'USD', locale: 'en-US' },
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makePayment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: uid('pay'),
    checkData: makeCheck(),
    totalAmount: 500,
    currency: 'USD',
    status: 'completed',
    printHistory: [],
    auditTrail: [],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date(),
    ...overrides,
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  _id = 0
})

// ── filteredItems: filterBy ───────────────────────────────────────────────────

describe('filteredItems: filterBy', () => {
  it('returns all items combined when filterBy is "all"', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck()]
    store.receipts = [makeReceipt()]
    store.paymentRecords = [makePayment()]
    expect(store.filteredItems).toHaveLength(3)
  })

  it('returns only checks when filterBy is "checks"', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck(), makeCheck()]
    store.receipts = [makeReceipt()]
    store.setFilter('checks')
    expect(store.filteredItems).toHaveLength(2)
    expect(store.filteredItems.every((i) => i.type === 'check')).toBe(true)
  })

  it('returns only receipts when filterBy is "receipts"', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck()]
    store.receipts = [makeReceipt(), makeReceipt()]
    store.setFilter('receipts')
    expect(store.filteredItems).toHaveLength(2)
    expect(store.filteredItems.every((i) => i.type === 'receipt')).toBe(true)
  })

  it('returns only payments when filterBy is "payments"', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck()]
    store.paymentRecords = [makePayment()]
    store.setFilter('payments')
    expect(store.filteredItems).toHaveLength(1)
    expect(store.filteredItems[0].type).toBe('payment')
  })
})

// ── filteredItems: search ─────────────────────────────────────────────────────

describe('filteredItems: search', () => {
  it('filters checks by payTo (case-insensitive)', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck({ payTo: 'Acme Corp' }), makeCheck({ payTo: 'Globex' })]
    store.setSearch('acme')
    expect(store.filteredItems).toHaveLength(1)
    expect((store.filteredItems[0] as any).payTo).toBe('Acme Corp')
  })

  it('filters checks by memo', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck({ memo: 'office supplies' }), makeCheck({ memo: 'rent' })]
    store.setSearch('office')
    expect(store.filteredItems).toHaveLength(1)
  })

  it('filters checks by checkNumber', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck({ checkNumber: '1001' }), makeCheck({ checkNumber: '2002' })]
    store.setSearch('2002')
    expect(store.filteredItems).toHaveLength(1)
  })

  it('filters receipts by billTo.name', () => {
    const store = useHistoryStore()
    store.receipts = [
      makeReceipt({ billTo: { name: 'Tech Corp', address: '', city: '', state: '', zip: '' } }),
      makeReceipt({ billTo: { name: 'Other Inc', address: '', city: '', state: '', zip: '' } }),
    ]
    store.setSearch('tech')
    const receipts = store.filteredItems.filter((i) => i.type === 'receipt')
    expect(receipts).toHaveLength(1)
  })

  it('filters receipts by receiptNumber', () => {
    const store = useHistoryStore()
    store.receipts = [makeReceipt({ receiptNumber: 'R-XYZ' }), makeReceipt({ receiptNumber: 'R-ABC' })]
    store.setSearch('XYZ')
    expect(store.filteredItems.filter((i) => i.type === 'receipt')).toHaveLength(1)
  })

  it('returns all items when searchQuery is cleared', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck(), makeCheck()]
    store.setSearch('nomatch')
    expect(store.filteredItems).toHaveLength(0)
    store.setSearch('')
    expect(store.filteredItems).toHaveLength(2)
  })
})

// ── filteredItems: sorting ────────────────────────────────────────────────────

describe('filteredItems: sorting', () => {
  it('sorts checks by date descending (newest first) by default', () => {
    const store = useHistoryStore()
    store.checks = [
      makeCheck({ date: '2026-01-01', payTo: 'Old' }),
      makeCheck({ date: '2026-06-01', payTo: 'New' }),
    ]
    // default: sortBy=date, sortOrder=desc
    expect((store.filteredItems[0] as any).payTo).toBe('New')
  })

  it('sorts checks by date ascending', () => {
    const store = useHistoryStore()
    store.checks = [
      makeCheck({ date: '2026-06-01', payTo: 'New' }),
      makeCheck({ date: '2026-01-01', payTo: 'Old' }),
    ]
    store.setSort('date', 'asc')
    expect((store.filteredItems[0] as any).payTo).toBe('Old')
  })

  it('sorts checks by amount descending', () => {
    const store = useHistoryStore()
    store.checks = [
      makeCheck({ amount: '100.00', payTo: 'Small' }),
      makeCheck({ amount: '999.00', payTo: 'Large' }),
    ]
    store.setSort('amount', 'desc')
    expect((store.filteredItems[0] as any).payTo).toBe('Large')
  })

  it('sorts checks by amount ascending', () => {
    const store = useHistoryStore()
    store.checks = [
      makeCheck({ amount: '999.00', payTo: 'Large' }),
      makeCheck({ amount: '100.00', payTo: 'Small' }),
    ]
    store.setSort('amount', 'asc')
    expect((store.filteredItems[0] as any).payTo).toBe('Small')
  })

  it('sorts checks by payTo alphabetically ascending', () => {
    const store = useHistoryStore()
    store.checks = [
      makeCheck({ payTo: 'Zebra Inc' }),
      makeCheck({ payTo: 'Alpha Corp' }),
    ]
    store.setSort('payTo', 'asc')
    expect((store.filteredItems[0] as any).payTo).toBe('Alpha Corp')
  })
})

// ── setSort() ─────────────────────────────────────────────────────────────────

describe('setSort()', () => {
  it('toggles sortOrder when called twice on the same field', () => {
    const store = useHistoryStore()
    store.setSort('date', 'asc')
    store.setSort('date') // no explicit order → toggle
    expect(store.sortOrder).toBe('desc')
  })

  it('sets sortOrder explicitly when provided', () => {
    const store = useHistoryStore()
    store.setSort('amount', 'asc')
    expect(store.sortOrder).toBe('asc')
    expect(store.sortBy).toBe('amount')
  })

  it('resets currentPage to 1', () => {
    const store = useHistoryStore()
    store.currentPage = 3
    store.setSort('date')
    expect(store.currentPage).toBe(1)
  })
})

// ── setFilter() ───────────────────────────────────────────────────────────────

describe('setFilter()', () => {
  it('updates filterBy', () => {
    const store = useHistoryStore()
    store.setFilter('checks')
    expect(store.filterBy).toBe('checks')
  })

  it('resets currentPage to 1', () => {
    const store = useHistoryStore()
    store.currentPage = 5
    store.setFilter('receipts')
    expect(store.currentPage).toBe(1)
  })
})

// ── setSearch() ───────────────────────────────────────────────────────────────

describe('setSearch()', () => {
  it('updates searchQuery', () => {
    const store = useHistoryStore()
    store.setSearch('invoice')
    expect(store.searchQuery).toBe('invoice')
  })

  it('resets currentPage to 1', () => {
    const store = useHistoryStore()
    store.currentPage = 4
    store.setSearch('x')
    expect(store.currentPage).toBe(1)
  })
})

// ── Pagination ────────────────────────────────────────────────────────────────

describe('pagination', () => {
  it('paginatedItems returns first-page slice', () => {
    const store = useHistoryStore()
    store.checks = Array.from({ length: 15 }, () => makeCheck())
    // default itemsPerPage=10, currentPage=1
    expect(store.paginatedItems).toHaveLength(10)
  })

  it('paginatedItems returns second-page remainder', () => {
    const store = useHistoryStore()
    store.checks = Array.from({ length: 15 }, () => makeCheck())
    store.currentPage = 2
    expect(store.paginatedItems).toHaveLength(5)
  })

  it('totalPages is the ceiling of items/itemsPerPage', () => {
    const store = useHistoryStore()
    store.checks = Array.from({ length: 15 }, () => makeCheck())
    expect(store.totalPages).toBe(2)
  })

  it('totalItems reflects the number of filtered items', () => {
    const store = useHistoryStore()
    store.checks = [makeCheck(), makeCheck(), makeCheck()]
    expect(store.totalItems).toBe(3)
  })
})

// ── setPage() ─────────────────────────────────────────────────────────────────

describe('setPage()', () => {
  it('updates currentPage within valid range', () => {
    const store = useHistoryStore()
    store.checks = Array.from({ length: 15 }, () => makeCheck())
    store.setPage(2)
    expect(store.currentPage).toBe(2)
  })

  it('ignores a page number that exceeds totalPages', () => {
    const store = useHistoryStore()
    store.checks = Array.from({ length: 5 }, () => makeCheck())
    store.setPage(99)
    expect(store.currentPage).toBe(1) // stays at 1 (only 1 page)
  })

  it('ignores a page number less than 1', () => {
    const store = useHistoryStore()
    store.checks = Array.from({ length: 5 }, () => makeCheck())
    store.setPage(0)
    expect(store.currentPage).toBe(1)
  })
})

// ── voidCheck() ───────────────────────────────────────────────────────────────

describe('voidCheck()', () => {
  it('sets isVoid=true on the matching check', async () => {
    const store = useHistoryStore()
    const check = makeCheck({ id: 'c1', isVoid: false })
    store.checks = [check]
    await store.voidCheck('c1')
    expect(store.checks[0].isVoid).toBe(true)
  })

  it('is a no-op for an unknown id', async () => {
    const store = useHistoryStore()
    const check = makeCheck({ id: 'c1', isVoid: false })
    store.checks = [check]
    await store.voidCheck('unknown')
    expect(store.checks[0].isVoid).toBe(false)
  })
})

// ── addCheck() ────────────────────────────────────────────────────────────────

describe('addCheck()', () => {
  it('pushes a new check to the checks array', async () => {
    const store = useHistoryStore()
    await store.addCheck({ payTo: 'Vendor X', amount: '200.00' })
    expect(store.checks).toHaveLength(1)
    expect(store.checks[0].payTo).toBe('Vendor X')
  })

  it('marks the new check as isPrinted and isSaved', async () => {
    const store = useHistoryStore()
    await store.addCheck({})
    expect(store.checks[0].isPrinted).toBe(true)
    expect(store.checks[0].isSaved).toBe(true)
  })
})

// ── deleteCheck() ─────────────────────────────────────────────────────────────

describe('deleteCheck()', () => {
  it('does NOT remove the check (deletion is disabled)', () => {
    const store = useHistoryStore()
    const check = makeCheck({ id: 'c1' })
    store.checks = [check]
    store.deleteCheck('c1')
    expect(store.checks).toHaveLength(1)
  })
})

// ── deleteReceipt() ───────────────────────────────────────────────────────────

describe('deleteReceipt()', () => {
  it('removes the matching receipt from the array', async () => {
    const store = useHistoryStore()
    const r1 = makeReceipt({ id: 'r1' })
    const r2 = makeReceipt({ id: 'r2' })
    store.receipts = [r1, r2]
    await store.deleteReceipt('r1')
    expect(store.receipts).toHaveLength(1)
    expect(store.receipts[0].id).toBe('r2')
  })
})

// ── deletePaymentRecord() ─────────────────────────────────────────────────────

describe('deletePaymentRecord()', () => {
  it('removes the matching payment record', async () => {
    const store = useHistoryStore()
    const p1 = makePayment({ id: 'p1' })
    const p2 = makePayment({ id: 'p2' })
    store.paymentRecords = [p1, p2]
    await store.deletePaymentRecord('p1')
    expect(store.paymentRecords).toHaveLength(1)
    expect(store.paymentRecords[0].id).toBe('p2')
  })
})
