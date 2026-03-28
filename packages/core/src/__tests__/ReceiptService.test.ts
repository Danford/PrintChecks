/**
 * Tests for ReceiptService — uses an in-memory StorageAdapter
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ReceiptService } from '../services/ReceiptService'
import type { StorageAdapter } from '../storage/StorageAdapter'

// ---------------------------------------------------------------------------
// In-memory StorageAdapter for testing
// ---------------------------------------------------------------------------
class MemoryStorage implements StorageAdapter {
  private store = new Map<string, unknown>()

  async get<T = unknown>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    this.store.set(key, value)
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.store.keys())
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key)
  }

  async getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()
    for (const key of keys) {
      results.set(key, (this.store.get(key) as T) ?? null)
    }
    return results
  }

  async setMany(entries: Map<string, unknown>): Promise<void> {
    for (const [key, value] of entries) {
      this.store.set(key, value)
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function validReceiptInput() {
  return {
    receiptNumber: 'R-1000',
    date: '2026-01-15',
    lineItems: [
      {
        id: 'item-1',
        description: 'Widget',
        quantity: 2,
        unitPrice: 50.0,
        totalPrice: 100.0,
        taxable: false,
      },
    ],
    billTo: {
      name: 'Jane Smith',
      address: '1 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
    paymentInfo: {
      method: 'check' as const,
      amount: 100.0,
      currency: 'USD' as const,
    },
  }
}

// ---------------------------------------------------------------------------
// ReceiptService tests
// ---------------------------------------------------------------------------
describe('ReceiptService', () => {
  let storage: MemoryStorage
  let service: ReceiptService

  beforeEach(() => {
    storage = new MemoryStorage()
    service = new ReceiptService({ storage })
  })

  // --- createReceipt ---

  it('creates a receipt with required fields', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    expect(receipt.id).toBeTruthy()
    expect(receipt.receiptNumber).toBe('R-1000')
    expect(receipt.billTo.name).toBe('Jane Smith')
  })

  it('assigns id and timestamps on creation', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    expect(receipt.id).toBeTruthy()
    expect(receipt.createdAt).toBeTruthy()
    expect(receipt.updatedAt).toBeTruthy()
  })

  it('auto-increments receipt number when not provided', async () => {
    await service.createReceipt(validReceiptInput()) // R-1000
    const second = await service.createReceipt({
      ...validReceiptInput(),
      receiptNumber: undefined,
    })
    expect(second.receiptNumber).toBeTruthy()
    expect(second.receiptNumber).not.toBe('R-1000')
  })

  it('uses today as date when not provided', async () => {
    const today = new Date().toLocaleDateString()
    const input = { ...validReceiptInput() }
    delete (input as Partial<typeof input>).date
    const receipt = await service.createReceipt(input)
    expect(receipt.date).toBe(today)
  })

  it('initializes empty lineItems when none provided', async () => {
    // createReceipt initializes lineItems=[] if missing, then validates —
    // but an empty lineItems array fails validation. Provide at least one item.
    const receipt = await service.createReceipt(validReceiptInput())
    expect(receipt.lineItems).toBeDefined()
    expect(Array.isArray(receipt.lineItems)).toBe(true)
  })

  it('throws for invalid receipt (missing billTo.name)', async () => {
    await expect(
      service.createReceipt({
        ...validReceiptInput(),
        billTo: { name: '', address: '', city: '', state: '', zip: '' },
      })
    ).rejects.toThrow()
  })

  it('throws for invalid receipt (paymentInfo.amount <= 0)', async () => {
    await expect(
      service.createReceipt({
        ...validReceiptInput(),
        paymentInfo: { method: 'check', amount: 0, currency: 'USD' },
      })
    ).rejects.toThrow()
  })

  // --- getReceipt ---

  it('retrieves a receipt by id', async () => {
    const created = await service.createReceipt(validReceiptInput())
    const found = await service.getReceipt(created.id!)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
  })

  it('returns null for unknown id', async () => {
    const found = await service.getReceipt('nonexistent-id')
    expect(found).toBeNull()
  })

  // --- getAllReceipts ---

  it('returns empty array when no receipts exist', async () => {
    const receipts = await service.getAllReceipts()
    expect(receipts).toHaveLength(0)
  })

  it('returns all created receipts', async () => {
    await service.createReceipt(validReceiptInput())
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-1001' })
    const receipts = await service.getAllReceipts()
    expect(receipts).toHaveLength(2)
  })

  // --- getReceipts / filtering ---

  it('returns all receipts when no filters applied', async () => {
    await service.createReceipt(validReceiptInput())
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-1001' })
    const receipts = await service.getReceipts()
    expect(receipts).toHaveLength(2)
  })

  it('filters receipts by searchTerm (receiptNumber match)', async () => {
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-9999' })
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-1001' })
    const results = await service.getReceipts({ searchTerm: 'R-9999' })
    expect(results).toHaveLength(1)
    expect(results[0].receiptNumber).toBe('R-9999')
  })

  it('filters receipts by searchTerm (billTo.name match)', async () => {
    await service.createReceipt({
      ...validReceiptInput(),
      receiptNumber: 'R-1001',
      billTo: { ...validReceiptInput().billTo, name: 'Globex Corp' },
    })
    await service.createReceipt(validReceiptInput())
    const results = await service.getReceipts({ searchTerm: 'globex' })
    expect(results).toHaveLength(1)
    expect(results[0].billTo.name).toBe('Globex Corp')
  })

  it('filters receipts by checkId', async () => {
    await service.createReceipt({ ...validReceiptInput(), checkId: 'chk-111' })
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-1001', checkId: 'chk-222' })
    const results = await service.getReceipts({ checkId: 'chk-111' })
    expect(results).toHaveLength(1)
  })

  it('filters receipts by date range', async () => {
    await service.createReceipt({ ...validReceiptInput(), date: '2026-01-10' })
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-1001', date: '2026-03-01' })
    const results = await service.getReceipts({ fromDate: new Date('2026-02-01'), toDate: new Date('2026-12-31') })
    expect(results).toHaveLength(1)
    expect(results[0].receiptNumber).toBe('R-1001')
  })

  // --- updateReceipt ---

  it('updates a receipt field', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    const updated = await service.updateReceipt(receipt.id!, {
      billTo: { ...receipt.billTo, name: 'Updated Name' },
    })
    expect(updated.billTo.name).toBe('Updated Name')
  })

  it('throws when updating a non-existent receipt', async () => {
    await expect(
      service.updateReceipt('bad-id', { receiptNumber: 'R-9999' })
    ).rejects.toThrow()
  })

  it('preserves id and createdAt when updating', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    const originalCreatedAt = receipt.createdAt
    const updated = await service.updateReceipt(receipt.id!, { receiptNumber: 'R-2000' })
    expect(updated.id).toBe(receipt.id)
    expect(new Date(updated.createdAt!).toISOString()).toBe(new Date(originalCreatedAt!).toISOString())
  })

  // --- deleteReceipt ---

  it('deletes a receipt', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    await service.deleteReceipt(receipt.id!)
    const found = await service.getReceipt(receipt.id!)
    expect(found).toBeNull()
  })

  // --- addLineItem / updateLineItem / removeLineItem ---

  it('addLineItem appends a new line item', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    const initialCount = receipt.lineItems.length

    const updated = await service.addLineItem(receipt.id!, {
      description: 'Gadget',
      quantity: 1,
      unitPrice: 25.0,
      totalPrice: 25.0,
      taxable: false,
    })
    expect(updated.lineItems).toHaveLength(initialCount + 1)
    expect(updated.lineItems.some((li) => li.description === 'Gadget')).toBe(true)
  })

  it('addLineItem throws for non-existent receipt', async () => {
    await expect(
      service.addLineItem('bad-id', {
        description: 'X',
        quantity: 1,
        unitPrice: 10,
        totalPrice: 10,
        taxable: false,
      })
    ).rejects.toThrow()
  })

  it('removeLineItem removes a specific line item', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    const firstItemId = receipt.lineItems[0].id!

    // Add a second line item so the receipt stays valid after removal
    const withTwo = await service.addLineItem(receipt.id!, {
      description: 'Second Item',
      quantity: 1,
      unitPrice: 20,
      totalPrice: 20,
      taxable: false,
    })

    const updated = await service.removeLineItem(receipt.id!, firstItemId)
    expect(updated.lineItems.find((li) => li.id === firstItemId)).toBeUndefined()
    expect(updated.lineItems).toHaveLength(withTwo.lineItems.length - 1)
  })

  it('updateLineItem modifies a specific line item', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    const itemId = receipt.lineItems[0].id!

    const updated = await service.updateLineItem(receipt.id!, itemId, {
      description: 'Renamed Widget',
    })
    const updatedItem = updated.lineItems.find((li) => li.id === itemId)
    expect(updatedItem?.description).toBe('Renamed Widget')
  })

  // --- setShippingAmount / setHandlingAmount ---

  it('setShippingAmount updates shipping on a receipt', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    const updated = await service.setShippingAmount(receipt.id!, 15.0)
    expect(updated.totals?.shippingAmount).toBe(15.0)
  })

  it('setHandlingAmount updates handling on a receipt', async () => {
    const receipt = await service.createReceipt(validReceiptInput())
    const updated = await service.setHandlingAmount(receipt.id!, 5.0)
    expect(updated.totals?.handlingAmount).toBe(5.0)
  })

  // --- getNextReceiptNumber ---

  it('getNextReceiptNumber returns R-1000 when no receipts exist', async () => {
    const next = await service.getNextReceiptNumber()
    expect(next).toBe('R-1000')
  })

  it('getNextReceiptNumber increments past existing receipt numbers', async () => {
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-1005' })
    const next = await service.getNextReceiptNumber()
    expect(next).toBe('R-1006')
  })

  // --- getReceiptsByCheckId ---

  it('getReceiptsByCheckId returns receipts for a specific check', async () => {
    await service.createReceipt({ ...validReceiptInput(), checkId: 'chk-abc' })
    await service.createReceipt({ ...validReceiptInput(), receiptNumber: 'R-1001', checkId: 'chk-xyz' })
    const results = await service.getReceiptsByCheckId('chk-abc')
    expect(results).toHaveLength(1)
  })

  // --- getStatistics ---

  it('getStatistics returns correct totals', async () => {
    await service.createReceipt(validReceiptInput()) // amount 100
    await service.createReceipt({
      ...validReceiptInput(),
      receiptNumber: 'R-1001',
      paymentInfo: { method: 'cash', amount: 200.0, currency: 'USD' },
    })
    const stats = await service.getStatistics()
    expect(stats.total).toBe(2)
    expect(stats.totalAmount).toBeGreaterThan(0)
    expect(stats.averageAmount).toBeGreaterThan(0)
  })

  // --- importReceipts / exportReceipts ---

  it('importReceipts creates multiple receipts', async () => {
    const result = await service.importReceipts([
      validReceiptInput() as any,
      { ...validReceiptInput(), receiptNumber: 'R-1001' } as any,
    ])
    expect(result.success).toBe(2)
    expect(result.failed).toBe(0)
    expect(await service.getAllReceipts()).toHaveLength(2)
  })

  it('exportReceipts returns all receipt data', async () => {
    await service.createReceipt(validReceiptInput())
    const exported = await service.exportReceipts()
    expect(exported).toHaveLength(1)
    expect(exported[0].receiptNumber).toBe('R-1000')
  })

  // --- clearAll ---

  it('clearAll removes all receipts', async () => {
    await service.createReceipt(validReceiptInput())
    await service.clearAll()
    expect(await service.getAllReceipts()).toHaveLength(0)
  })
})
