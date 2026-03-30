/**
 * Tests for src/stores/receipt.ts
 *
 * Covers calculatedTotals computed, line item CRUD, and receipt validation.
 * secureStorage is mocked so no localStorage is touched.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useReceiptStore } from '../stores/receipt'
import type { ReceiptData } from '@/types'

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

function makeReceipt(overrides: Partial<ReceiptData> = {}): ReceiptData {
  return {
    id: 'rec-1',
    receiptNumber: 'R123456ABC',
    date: '2026-01-15',
    lineItems: [],
    totals: {
      subtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      shippingAmount: 0,
      handlingAmount: 0,
      grandTotal: 0,
    },
    taxes: [],
    discounts: [],
    metadata: {},
    billTo: { name: 'Client Corp', address: '1 St', city: 'Austin', state: 'TX', zip: '78701' },
    paymentInfo: { method: 'check', amount: 150, currency: 'USD' },
    settings: {
      showLineNumbers: true,
      showTaxDetails: true,
      showDiscountDetails: true,
      includeNotes: true,
      currency: 'USD',
      locale: 'en-US',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ── calculatedTotals computed ─────────────────────────────────────────────────

describe('calculatedTotals computed', () => {
  it('returns all zeros when currentReceipt is null', () => {
    const store = useReceiptStore()
    const t = store.calculatedTotals
    expect(t.subtotal).toBe(0)
    expect(t.grandTotal).toBe(0)
  })

  it('returns all zeros when lineItems is empty', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const t = store.calculatedTotals
    expect(t.subtotal).toBe(0)
    expect(t.grandTotal).toBe(0)
  })

  it('sums item.totalPrice for subtotal', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    store.addLineItem('Service A', 2, 50)  // totalPrice = 100
    store.addLineItem('Service B', 1, 75)  // totalPrice = 75
    expect(store.calculatedTotals.subtotal).toBe(175)
  })

  it('sums item.taxAmount for totalTax', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [
        { id: 'li1', description: 'A', quantity: 1, unitPrice: 100, totalPrice: 100, taxable: true, taxAmount: 10 },
        { id: 'li2', description: 'B', quantity: 1, unitPrice: 50, totalPrice: 50, taxable: true, taxAmount: 5 },
      ],
    }))
    expect(store.calculatedTotals.totalTax).toBe(15)
  })

  it('sums item.discountAmount for totalDiscount', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [
        { id: 'li1', description: 'A', quantity: 1, unitPrice: 200, totalPrice: 200, taxable: false, discountAmount: 20 },
      ],
    }))
    expect(store.calculatedTotals.totalDiscount).toBe(20)
  })

  it('reads shippingAmount and handlingAmount from stored totals', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [
        { id: 'li1', description: 'Item', quantity: 1, unitPrice: 100, totalPrice: 100, taxable: false },
      ],
      totals: { subtotal: 100, totalTax: 0, totalDiscount: 0, shippingAmount: 15, handlingAmount: 5, grandTotal: 120 },
    }))
    expect(store.calculatedTotals.shippingAmount).toBe(15)
    expect(store.calculatedTotals.handlingAmount).toBe(5)
  })

  it('grandTotal = subtotal + tax - discount + shipping + handling', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [
        { id: 'li1', description: 'Item', quantity: 1, unitPrice: 100, totalPrice: 100, taxable: true, taxAmount: 10, discountAmount: 5 },
      ],
      totals: { subtotal: 100, totalTax: 10, totalDiscount: 5, shippingAmount: 20, handlingAmount: 3, grandTotal: 128 },
    }))
    // 100 + 10 - 5 + 20 + 3 = 128
    expect(store.calculatedTotals.grandTotal).toBe(128)
  })
})

// ── hasLineItems computed ─────────────────────────────────────────────────────

describe('hasLineItems computed', () => {
  it('returns falsy when currentReceipt is null', () => {
    const store = useReceiptStore()
    expect(store.hasLineItems).toBeFalsy()
  })

  it('returns false with an empty lineItems array', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    expect(store.hasLineItems).toBe(false)
  })

  it('returns true when at least one lineItem exists', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    store.addLineItem('Design', 1, 500)
    expect(store.hasLineItems).toBe(true)
  })
})

// ── addLineItem() ─────────────────────────────────────────────────────────────

describe('addLineItem()', () => {
  it('adds an item with totalPrice = quantity * unitPrice', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Consulting', 3, 100)
    expect(item.totalPrice).toBe(300)
  })

  it('defaults quantity to 1 and unitPrice to 0', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Misc')
    expect(item.quantity).toBe(1)
    expect(item.unitPrice).toBe(0)
    expect(item.totalPrice).toBe(0)
  })

  it('auto-creates a receipt when currentReceipt is null', () => {
    const store = useReceiptStore()
    store.addLineItem('Auto-create', 1, 50)
    expect(store.currentReceipt).not.toBeNull()
    expect(store.currentReceipt!.lineItems).toHaveLength(1)
  })

  it('appends item to lineItems', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    store.addLineItem('A', 1, 10)
    store.addLineItem('B', 2, 20)
    expect(store.currentReceipt!.lineItems).toHaveLength(2)
  })

  it('updates the stored totals after adding', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    store.addLineItem('Work', 1, 250)
    expect(store.currentReceipt!.totals.subtotal).toBe(250)
  })
})

// ── updateLineItem() ──────────────────────────────────────────────────────────

describe('updateLineItem()', () => {
  it('updates description', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Old desc', 1, 100)
    store.updateLineItem(item.id!, { description: 'New desc' })
    expect(store.currentReceipt!.lineItems[0].description).toBe('New desc')
  })

  it('recalculates totalPrice when quantity changes', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Item', 1, 100)
    store.updateLineItem(item.id!, { quantity: 3 })
    expect(store.currentReceipt!.lineItems[0].totalPrice).toBe(300)
  })

  it('recalculates totalPrice when unitPrice changes', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Item', 2, 50)
    store.updateLineItem(item.id!, { unitPrice: 75 })
    expect(store.currentReceipt!.lineItems[0].totalPrice).toBe(150)
  })

  it('is a no-op for an unknown id', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    store.addLineItem('Item', 1, 100)
    store.updateLineItem('unknown-id', { description: 'Changed' })
    expect(store.currentReceipt!.lineItems[0].description).toBe('Item')
  })

  it('updates the stored totals after the change', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Item', 1, 100)
    store.updateLineItem(item.id!, { unitPrice: 200 })
    expect(store.currentReceipt!.totals.subtotal).toBe(200)
  })
})

// ── removeLineItem() ──────────────────────────────────────────────────────────

describe('removeLineItem()', () => {
  it('removes the item matching the id', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Remove me', 1, 50)
    store.removeLineItem(item.id!)
    expect(store.currentReceipt!.lineItems).toHaveLength(0)
  })

  it('leaves other items intact', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const a = store.addLineItem('A', 1, 10)
    store.addLineItem('B', 1, 20)
    store.removeLineItem(a.id!)
    expect(store.currentReceipt!.lineItems[0].description).toBe('B')
  })

  it('updates totals after removal', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const item = store.addLineItem('Remove', 1, 100)
    store.addLineItem('Keep', 1, 50)
    store.removeLineItem(item.id!)
    expect(store.currentReceipt!.totals.subtotal).toBe(50)
  })
})

// ── validateReceipt() ─────────────────────────────────────────────────────────

describe('validateReceipt()', () => {
  it('returns false when currentReceipt is null', () => {
    const store = useReceiptStore()
    expect(store.validateReceipt()).toBe(false)
  })

  it('fails with error when there are no lineItems', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    store.validateReceipt()
    expect(store.validation.lineItems).toBe(false)
    expect(store.validation.errors).toContain('Invalid line items')
  })

  it('fails when paymentInfo.amount is 0', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [{ id: 'l1', description: 'Item', quantity: 1, unitPrice: 100, totalPrice: 100, taxable: false }],
      paymentInfo: { method: 'check', amount: 0, currency: 'USD' },
    }))
    store.validateReceipt()
    expect(store.validation.paymentInfo).toBe(false)
    expect(store.validation.errors).toContain('Payment amount must be greater than 0')
  })

  it('passes when lineItems and paymentInfo are valid', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [{ id: 'l1', description: 'Item', quantity: 1, unitPrice: 100, totalPrice: 100, taxable: false }],
      paymentInfo: { method: 'check', amount: 100, currency: 'USD' },
    }))
    expect(store.validateReceipt()).toBe(true)
    expect(store.validation.overall).toBe(true)
  })

  it('issues a warning when billTo.name is empty', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [{ id: 'l1', description: 'Item', quantity: 1, unitPrice: 100, totalPrice: 100, taxable: false }],
      paymentInfo: { method: 'check', amount: 100, currency: 'USD' },
      billTo: { name: '', address: '', city: '', state: '', zip: '' },
    }))
    store.validateReceipt()
    expect(store.validation.billTo).toBe(false)
    expect(store.validation.warnings).toContain('Bill to information is incomplete')
  })

  it('sets isValid computed correctly', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({
      lineItems: [{ id: 'l1', description: 'Item', quantity: 1, unitPrice: 100, totalPrice: 100, taxable: false }],
      paymentInfo: { method: 'check', amount: 100, currency: 'USD' },
    }))
    store.validateReceipt()
    expect(store.isValid).toBe(true)
  })
})

// ── createNewReceipt() ────────────────────────────────────────────────────────

describe('createNewReceipt()', () => {
  it('sets currentReceipt to a new receipt object', () => {
    const store = useReceiptStore()
    const receipt = store.createNewReceipt()
    expect(store.currentReceipt).not.toBeNull()
    expect(receipt).toStrictEqual(store.currentReceipt)
  })

  it('initializes lineItems to an empty array', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    expect(store.currentReceipt!.lineItems).toEqual([])
  })

  it('generates a non-empty receiptNumber', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    expect(store.currentReceipt!.receiptNumber).toBeTruthy()
    expect(store.currentReceipt!.receiptNumber.length).toBeGreaterThan(0)
  })

  it('creates receipts with unique receiptNumbers', () => {
    const store = useReceiptStore()
    const r1 = store.createNewReceipt()
    const r2 = store.createNewReceipt()
    expect(r1.receiptNumber).not.toBe(r2.receiptNumber)
  })
})

// ── loadReceipt() ─────────────────────────────────────────────────────────────

describe('loadReceipt()', () => {
  it('sets currentReceipt from the provided data', () => {
    const store = useReceiptStore()
    const receipt = makeReceipt({ receiptNumber: 'R-TEST' })
    store.loadReceipt(receipt)
    expect(store.currentReceipt!.receiptNumber).toBe('R-TEST')
  })

  it('runs validation after loading', () => {
    const store = useReceiptStore()
    store.loadReceipt(makeReceipt({ paymentInfo: { method: 'check', amount: 0, currency: 'USD' } }))
    expect(store.validation.paymentInfo).toBe(false)
  })
})

// ── saveAsTemplate() ──────────────────────────────────────────────────────────

describe('saveAsTemplate()', () => {
  it('returns null when currentReceipt is null', () => {
    const store = useReceiptStore()
    expect(store.saveAsTemplate('T')).toBeNull()
  })

  it('creates a template with the given name and category', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    const tpl = store.saveAsTemplate('Invoice', 'professional services', 'professional')
    expect(tpl?.name).toBe('Invoice')
    expect(tpl?.category).toBe('professional')
  })

  it('adds the template to the templates array', () => {
    const store = useReceiptStore()
    store.createNewReceipt()
    store.saveAsTemplate('T')
    expect(store.templates).toHaveLength(1)
  })
})
