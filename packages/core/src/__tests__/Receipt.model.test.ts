/**
 * Direct unit tests for Receipt and LineItem model classes.
 * Focuses on calculateTotals() / calculateTotal() business logic
 * not fully covered by ReceiptService integration tests.
 */
import { describe, it, expect } from 'vitest'
import { Receipt, LineItem } from '../models/Receipt'
import type { LineItemData, ReceiptData } from '../models/Receipt'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeLineItem(overrides: Partial<LineItemData> = {}): LineItemData {
  return {
    id: 'item-1',
    description: 'Widget',
    quantity: 2,
    unitPrice: 10.0,
    totalPrice: 20.0,
    taxable: false,
    ...overrides,
  }
}

function makeReceiptData(overrides: Partial<ReceiptData> = {}): ReceiptData {
  return {
    receiptNumber: 'R-001',
    date: '2026-01-15',
    lineItems: [makeLineItem()],
    totals: {
      subtotal: 20,
      totalTax: 0,
      totalDiscount: 0,
      shippingAmount: 0,
      handlingAmount: 0,
      grandTotal: 20,
    },
    billTo: {
      name: 'Jane Smith',
      address: '1 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    paymentInfo: {
      method: 'check',
      amount: 20.0,
      currency: 'USD',
    },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// LineItem tests
// ---------------------------------------------------------------------------
describe('LineItem', () => {
  describe('constructor', () => {
    it('assigns provided totalPrice without recalculating', () => {
      const item = new LineItem(makeLineItem({ quantity: 3, unitPrice: 5, totalPrice: 999 }))
      // totalPrice was supplied so calculateTotal() is NOT invoked
      expect(item.totalPrice).toBe(999)
    })

    it('calculates totalPrice when it is undefined', () => {
      const data = makeLineItem({ quantity: 3, unitPrice: 5 })
      delete (data as Partial<LineItemData>).totalPrice
      const item = new LineItem(data as LineItemData)
      expect(item.totalPrice).toBe(15)
    })

    it('assigns an id when none is provided', () => {
      const data = makeLineItem()
      delete data.id
      const item = new LineItem(data)
      expect(item.id).toBeTruthy()
    })

    it('uses provided id when supplied', () => {
      const item = new LineItem(makeLineItem({ id: 'fixed-id' }))
      expect(item.id).toBe('fixed-id')
    })

    it('assigns createdAt and updatedAt', () => {
      const item = new LineItem(makeLineItem())
      expect(item.createdAt).toBeInstanceOf(Date)
      expect(item.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('calculateTotal()', () => {
    it('sets totalPrice to quantity × unitPrice for non-taxable item', () => {
      const item = new LineItem(makeLineItem({ quantity: 4, unitPrice: 7.5, taxable: false }))
      item.calculateTotal()
      expect(item.totalPrice).toBe(30)
    })

    it('adds tax when taxable=true and taxRate is set', () => {
      const item = new LineItem(
        makeLineItem({ quantity: 1, unitPrice: 100, taxable: true, taxRate: 10 })
      )
      item.calculateTotal()
      // base = 100, tax = 10, total = 110
      expect(item.taxAmount).toBeCloseTo(10)
      expect(item.totalPrice).toBeCloseTo(110)
    })

    it('does not add tax when taxable=false even if taxRate is set', () => {
      const item = new LineItem(
        makeLineItem({ quantity: 1, unitPrice: 100, taxable: false, taxRate: 10 })
      )
      item.calculateTotal()
      expect(item.taxAmount).toBeUndefined()
      expect(item.totalPrice).toBe(100)
    })

    it('does not add tax when taxable=true but taxRate is missing', () => {
      const item = new LineItem(makeLineItem({ quantity: 1, unitPrice: 100, taxable: true }))
      item.calculateTotal()
      expect(item.taxAmount).toBeUndefined()
      expect(item.totalPrice).toBe(100)
    })

    it('subtracts discountAmount when provided', () => {
      const item = new LineItem(
        makeLineItem({ quantity: 2, unitPrice: 50, taxable: false, discountAmount: 15 })
      )
      item.calculateTotal()
      // base = 100, discount = 15, total = 85
      expect(item.totalPrice).toBe(85)
    })

    it('applies tax before discount (tax on base, discount after)', () => {
      const item = new LineItem(
        makeLineItem({
          quantity: 1,
          unitPrice: 100,
          taxable: true,
          taxRate: 10,
          discountAmount: 5,
        })
      )
      item.calculateTotal()
      // base = 100, tax = 10, after tax = 110, discount = 5, total = 105
      expect(item.taxAmount).toBeCloseTo(10)
      expect(item.totalPrice).toBeCloseTo(105)
    })
  })

  describe('toJSON / fromJSON', () => {
    it('round-trips all fields', () => {
      const data = makeLineItem({ category: 'supplies', notes: 'rush', taxRate: 8, taxable: true })
      const item = new LineItem(data)
      const json = item.toJSON()
      const restored = LineItem.fromJSON(json)
      expect(restored.description).toBe('Widget')
      expect(restored.category).toBe('supplies')
      expect(restored.notes).toBe('rush')
    })
  })
})

// ---------------------------------------------------------------------------
// Receipt.calculateTotals() tests
// ---------------------------------------------------------------------------
describe('Receipt.calculateTotals()', () => {
  describe('basic subtotal', () => {
    it('sums quantity × unitPrice across all line items', () => {
      const receipt = new Receipt(
        makeReceiptData({
          lineItems: [
            makeLineItem({ id: 'a', quantity: 2, unitPrice: 10 }),
            makeLineItem({ id: 'b', quantity: 3, unitPrice: 5 }),
          ],
          totals: undefined as unknown as ReceiptData['totals'],
        })
      )
      // subtotal = 20 + 15 = 35, no tax/discount/shipping
      expect(receipt.totals.subtotal).toBe(35)
      expect(receipt.totals.grandTotal).toBe(35)
    })

    it('uses quantity × unitPrice for subtotal, not item.totalPrice', () => {
      // item.totalPrice could include line-level tax; receipt subtotal uses the base
      const receipt = new Receipt(
        makeReceiptData({
          lineItems: [makeLineItem({ quantity: 1, unitPrice: 100, totalPrice: 999 })],
          totals: undefined as unknown as ReceiptData['totals'],
        })
      )
      expect(receipt.totals.subtotal).toBe(100) // qty*unitPrice, not 999
    })

    it('returns zero subtotal for an empty line items array', () => {
      const receipt = new Receipt(
        makeReceiptData({
          lineItems: [],
          totals: undefined as unknown as ReceiptData['totals'],
        })
      )
      expect(receipt.totals.subtotal).toBe(0)
      expect(receipt.totals.grandTotal).toBe(0)
    })
  })

  describe('tax accumulation', () => {
    it('sums taxAmount from all taxable line items', () => {
      const receipt = new Receipt(
        makeReceiptData({
          lineItems: [
            makeLineItem({ id: 'a', quantity: 1, unitPrice: 100, taxable: true, taxAmount: 8 }),
            makeLineItem({ id: 'b', quantity: 1, unitPrice: 50, taxable: true, taxAmount: 4 }),
          ],
          totals: undefined as unknown as ReceiptData['totals'],
        })
      )
      expect(receipt.totals.totalTax).toBe(12)
      // grandTotal = (100+50) + 12 = 162
      expect(receipt.totals.grandTotal).toBe(162)
    })

    it('ignores taxAmount when it is undefined or zero', () => {
      const receipt = new Receipt(
        makeReceiptData({
          lineItems: [
            makeLineItem({ quantity: 1, unitPrice: 50, taxable: false, taxAmount: undefined }),
          ],
          totals: undefined as unknown as ReceiptData['totals'],
        })
      )
      expect(receipt.totals.totalTax).toBe(0)
    })
  })

  describe('discount accumulation', () => {
    it('sums discountAmount from all line items', () => {
      const receipt = new Receipt(
        makeReceiptData({
          lineItems: [
            makeLineItem({ id: 'a', quantity: 1, unitPrice: 100, discountAmount: 10 }),
            makeLineItem({ id: 'b', quantity: 1, unitPrice: 50, discountAmount: 5 }),
          ],
          totals: undefined as unknown as ReceiptData['totals'],
        })
      )
      expect(receipt.totals.totalDiscount).toBe(15)
      // grandTotal = (100+50) - 15 = 135
      expect(receipt.totals.grandTotal).toBe(135)
    })
  })

  describe('shipping and handling', () => {
    it('preserves shippingAmount when recalculating', () => {
      const receipt = new Receipt(makeReceiptData())
      receipt.totals.shippingAmount = 10
      receipt.calculateTotals()
      expect(receipt.totals.shippingAmount).toBe(10)
      // grandTotal = 20 (subtotal) + 10 (shipping) = 30
      expect(receipt.totals.grandTotal).toBe(30)
    })

    it('preserves handlingAmount when recalculating', () => {
      const receipt = new Receipt(makeReceiptData())
      receipt.totals.handlingAmount = 5
      receipt.calculateTotals()
      expect(receipt.totals.handlingAmount).toBe(5)
      expect(receipt.totals.grandTotal).toBe(25)
    })

    it('includes both shipping and handling in grandTotal', () => {
      const receipt = new Receipt(makeReceiptData())
      receipt.totals.shippingAmount = 8
      receipt.totals.handlingAmount = 2
      receipt.calculateTotals()
      // grandTotal = 20 + 8 + 2 = 30
      expect(receipt.totals.grandTotal).toBe(30)
    })
  })

  describe('grandTotal formula', () => {
    it('computes grandTotal = subtotal + tax - discount + shipping + handling', () => {
      // Build receipt without totals so calculateTotals() runs in constructor,
      // then set shipping/handling and recalculate to exercise the full formula.
      const receipt = new Receipt(
        makeReceiptData({
          lineItems: [
            makeLineItem({
              quantity: 2,
              unitPrice: 50,
              taxAmount: 5,
              discountAmount: 3,
              taxable: true,
            }),
          ],
          totals: undefined as unknown as ReceiptData['totals'],
        })
      )
      receipt.totals.shippingAmount = 7
      receipt.totals.handlingAmount = 2
      receipt.calculateTotals()
      // subtotal=100, tax=5, discount=3, shipping=7, handling=2
      // grandTotal = 100 + 5 - 3 + 7 + 2 = 111
      expect(receipt.totals.subtotal).toBe(100)
      expect(receipt.totals.totalTax).toBe(5)
      expect(receipt.totals.totalDiscount).toBe(3)
      expect(receipt.totals.grandTotal).toBe(111)
    })
  })
})

// ---------------------------------------------------------------------------
// Receipt.setShippingAmount / setHandlingAmount
// ---------------------------------------------------------------------------
describe('Receipt shipping and handling setters', () => {
  it('setShippingAmount updates shippingAmount and recalculates grandTotal', () => {
    const receipt = new Receipt(makeReceiptData())
    receipt.setShippingAmount(15)
    expect(receipt.totals.shippingAmount).toBe(15)
    expect(receipt.totals.grandTotal).toBe(35) // 20 + 15
  })

  it('setHandlingAmount updates handlingAmount and recalculates grandTotal', () => {
    const receipt = new Receipt(makeReceiptData())
    receipt.setHandlingAmount(3)
    expect(receipt.totals.handlingAmount).toBe(3)
    expect(receipt.totals.grandTotal).toBe(23) // 20 + 3
  })

  it('both setters together accumulate correctly', () => {
    const receipt = new Receipt(makeReceiptData())
    receipt.setShippingAmount(10)
    receipt.setHandlingAmount(5)
    expect(receipt.totals.grandTotal).toBe(35) // 20 + 10 + 5
  })
})

// ---------------------------------------------------------------------------
// Receipt.addLineItem / removeLineItem / updateLineItem
// ---------------------------------------------------------------------------
describe('Receipt line item mutations', () => {
  it('addLineItem appends and recalculates totals', () => {
    const receipt = new Receipt(makeReceiptData())
    receipt.addLineItem(makeLineItem({ id: 'item-2', quantity: 1, unitPrice: 30, totalPrice: 30 }))
    expect(receipt.lineItems).toHaveLength(2)
    expect(receipt.totals.subtotal).toBe(50) // 20 + 30
    expect(receipt.totals.grandTotal).toBe(50)
  })

  it('removeLineItem removes item and recalculates totals', () => {
    const receipt = new Receipt(
      makeReceiptData({
        lineItems: [
          makeLineItem({ id: 'a', quantity: 1, unitPrice: 20, totalPrice: 20 }),
          makeLineItem({ id: 'b', quantity: 1, unitPrice: 10, totalPrice: 10 }),
        ],
        totals: undefined as unknown as ReceiptData['totals'],
      })
    )
    receipt.removeLineItem('b')
    expect(receipt.lineItems).toHaveLength(1)
    expect(receipt.totals.subtotal).toBe(20)
    expect(receipt.totals.grandTotal).toBe(20)
  })

  it('removeLineItem with unknown id leaves receipt unchanged', () => {
    const receipt = new Receipt(makeReceiptData())
    receipt.removeLineItem('no-such-id')
    expect(receipt.lineItems).toHaveLength(1)
    expect(receipt.totals.grandTotal).toBe(20)
  })

  it('updateLineItem modifies item and recalculates totals', () => {
    const receipt = new Receipt(makeReceiptData())
    receipt.updateLineItem('item-1', { quantity: 5, unitPrice: 10 })
    // new totalPrice = 5 * 10 = 50, subtotal = 50
    expect(receipt.totals.subtotal).toBe(50)
    expect(receipt.totals.grandTotal).toBe(50)
  })

  it('updateLineItem with unknown id leaves receipt unchanged', () => {
    const receipt = new Receipt(makeReceiptData())
    receipt.updateLineItem('no-such-id', { quantity: 99 })
    expect(receipt.totals.grandTotal).toBe(20)
  })
})

// ---------------------------------------------------------------------------
// Receipt.validate()
// ---------------------------------------------------------------------------
describe('Receipt.validate()', () => {
  it('returns isValid=true for a well-formed receipt', () => {
    const receipt = new Receipt(makeReceiptData())
    expect(receipt.validate().isValid).toBe(true)
    expect(receipt.validate().errors).toHaveLength(0)
  })

  it('errors when receiptNumber is missing', () => {
    const receipt = new Receipt(makeReceiptData({ receiptNumber: '' }))
    const result = receipt.validate()
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Receipt number is required')
  })

  it('errors when date is missing', () => {
    const receipt = new Receipt(makeReceiptData({ date: '' }))
    expect(receipt.validate().isValid).toBe(false)
    expect(receipt.validate().errors).toContain('Date is required')
  })

  it('errors when lineItems is empty', () => {
    const receipt = new Receipt(makeReceiptData({ lineItems: [] }))
    expect(receipt.validate().isValid).toBe(false)
    expect(receipt.validate().errors).toContain('At least one line item is required')
  })

  it('errors when billTo.name is missing', () => {
    const receipt = new Receipt(makeReceiptData({ billTo: { ...makeReceiptData().billTo, name: '' } }))
    expect(receipt.validate().isValid).toBe(false)
    expect(receipt.validate().errors).toContain('Bill to name is required')
  })

  it('errors when paymentInfo.amount is zero', () => {
    const receipt = new Receipt(
      makeReceiptData({ paymentInfo: { method: 'check', amount: 0, currency: 'USD' } })
    )
    expect(receipt.validate().isValid).toBe(false)
    expect(receipt.validate().errors).toContain('Payment amount must be greater than 0')
  })

  it('collects multiple errors at once', () => {
    const receipt = new Receipt(
      makeReceiptData({ receiptNumber: '', date: '', lineItems: [] })
    )
    const result = receipt.validate()
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })
})

// ---------------------------------------------------------------------------
// Receipt construction
// ---------------------------------------------------------------------------
describe('Receipt construction', () => {
  it('assigns id and timestamps when not provided', () => {
    const data = makeReceiptData()
    delete data.id
    const receipt = new Receipt(data)
    expect(receipt.id).toBeTruthy()
    expect(receipt.createdAt).toBeInstanceOf(Date)
    expect(receipt.updatedAt).toBeInstanceOf(Date)
  })

  it('auto-calculates totals when totals is not provided', () => {
    const receipt = new Receipt(
      makeReceiptData({
        lineItems: [makeLineItem({ quantity: 3, unitPrice: 10 })],
        totals: undefined as unknown as ReceiptData['totals'],
      })
    )
    expect(receipt.totals).toBeDefined()
    expect(receipt.totals.subtotal).toBe(30)
  })

  it('preserves supplied totals without recalculating', () => {
    const suppliedTotals = {
      subtotal: 999,
      totalTax: 0,
      totalDiscount: 0,
      shippingAmount: 0,
      handlingAmount: 0,
      grandTotal: 999,
    }
    const receipt = new Receipt(makeReceiptData({ totals: suppliedTotals }))
    expect(receipt.totals.subtotal).toBe(999)
  })

  it('initializes lineItems to [] when not provided', () => {
    const data = makeReceiptData()
    delete (data as Partial<ReceiptData>).lineItems
    const receipt = new Receipt(data as ReceiptData)
    expect(receipt.lineItems).toEqual([])
  })

  it('toJSON / fromJSON round-trip preserves all fields', () => {
    const original = new Receipt(makeReceiptData({ notes: 'test note', checkId: 'chk-1' }))
    const restored = Receipt.fromJSON(original.toJSON())
    expect(restored.receiptNumber).toBe('R-001')
    expect(restored.notes).toBe('test note')
    expect(restored.checkId).toBe('chk-1')
    expect(restored.totals.subtotal).toBe(original.totals.subtotal)
  })
})
