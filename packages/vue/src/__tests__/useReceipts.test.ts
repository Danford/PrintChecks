/**
 * Tests for useReceipts composable
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useReceipts } from '../composables/useReceipts'
import type { StorageAdapter } from '@printchecks/core/storage'

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
    const m = new Map<string, T | null>()
    for (const k of keys) m.set(k, (this.store.get(k) as T) ?? null)
    return m
  }
  async setMany(entries: Map<string, unknown>): Promise<void> {
    for (const [k, v] of entries) this.store.set(k, v)
  }
}

function validReceiptData(overrides: Record<string, unknown> = {}) {
  return {
    receiptNumber: 'R-001',
    date: '2026-01-15',
    lineItems: [
      { id: 'item-1', description: 'Widget', quantity: 1, unitPrice: 50, totalPrice: 50, taxable: false },
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
      amount: 100,
      currency: 'USD' as const,
    },
    ...overrides,
  }
}

function validLineItemData() {
  return {
    id: 'li-1',
    description: 'Office supplies',
    quantity: 2,
    unitPrice: 25,
    totalPrice: 50,
    taxable: false,
  }
}

describe('useReceipts', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  // --- initial state ---

  it('starts with empty/null state', () => {
    const { currentReceipt, receipts, isLoading, error } = useReceipts({ storage })
    expect(currentReceipt.value).toBeNull()
    expect(receipts.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('receiptCount is 0 initially', () => {
    const { receiptCount } = useReceipts({ storage })
    expect(receiptCount.value).toBe(0)
  })

  it('isValid is false when no current receipt', () => {
    const { isValid } = useReceipts({ storage })
    expect(isValid.value).toBe(false)
  })

  it('hasLineItems is false when no current receipt', () => {
    const { hasLineItems } = useReceipts({ storage })
    expect(hasLineItems.value).toBe(false)
  })

  // --- createReceipt ---

  it('createReceipt sets currentReceipt', async () => {
    const { createReceipt, currentReceipt } = useReceipts({ storage })
    const receipt = await createReceipt(validReceiptData())
    expect(receipt.receiptNumber).toBe('R-001')
    expect(currentReceipt.value?.id).toBe(receipt.id)
  })

  it('createReceipt sets error and rethrows on failure', async () => {
    const bad = new MemoryStorage()
    vi.spyOn(bad, 'set').mockRejectedValue(new Error('write error'))
    const { createReceipt, error } = useReceipts({ storage: bad })
    await expect(createReceipt(validReceiptData())).rejects.toThrow('write error')
    expect(error.value).toBe('write error')
  })

  // --- loadReceipts / loadReceipt ---

  it('loadReceipts populates receipts array', async () => {
    const { createReceipt, loadReceipts, receipts } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    await createReceipt(validReceiptData({ receiptNumber: 'R-002' }))
    await loadReceipts()
    expect(receipts.value.length).toBe(2)
  })

  it('loadReceipt sets currentReceipt', async () => {
    const { createReceipt, loadReceipt, currentReceipt, clearCurrentReceipt } = useReceipts({
      storage,
    })
    const r = await createReceipt(validReceiptData())
    clearCurrentReceipt()
    await loadReceipt(r.id!)
    expect(currentReceipt.value?.id).toBe(r.id)
  })

  it('loadReceipt throws and sets error for unknown id', async () => {
    const { loadReceipt, error } = useReceipts({ storage })
    await expect(loadReceipt('no-such-id')).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  // --- receiptCount ---

  it('receiptCount reflects loaded receipts', async () => {
    const { createReceipt, loadReceipts, receiptCount } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    await createReceipt(validReceiptData({ receiptNumber: 'R-002' }))
    await loadReceipts()
    expect(receiptCount.value).toBe(2)
  })

  // --- updateReceipt ---

  it('updateReceipt updates currentReceipt', async () => {
    const { createReceipt, updateReceipt, currentReceipt } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    await updateReceipt({ notes: 'Updated notes' })
    expect(currentReceipt.value?.notes).toBe('Updated notes')
  })

  it('updateReceipt throws when no current receipt', async () => {
    const { updateReceipt } = useReceipts({ storage })
    await expect(updateReceipt({ notes: 'x' })).rejects.toThrow('No current receipt')
  })

  // --- deleteReceipt ---

  it('deleteReceipt removes receipt and clears currentReceipt if same', async () => {
    const { createReceipt, deleteReceipt, receipts, currentReceipt } = useReceipts({ storage })
    const r = await createReceipt(validReceiptData())
    await deleteReceipt(r.id!)
    expect(currentReceipt.value).toBeNull()
    expect(receipts.value.length).toBe(0)
  })

  it('deleteReceipt does not clear currentReceipt if different id', async () => {
    const { createReceipt, deleteReceipt, currentReceipt } = useReceipts({ storage })
    const r1 = await createReceipt(validReceiptData())
    const r2 = await createReceipt(validReceiptData({ receiptNumber: 'R-002' }))
    await deleteReceipt(r1.id!)
    expect(currentReceipt.value?.id).toBe(r2.id)
  })

  // --- isValid ---

  it('isValid is true for a fully valid receipt', async () => {
    const { createReceipt, isValid } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    expect(isValid.value).toBe(true)
  })

  // --- line item operations ---

  it('addLineItem adds an item to currentReceipt', async () => {
    const { createReceipt, addLineItem, currentReceipt, hasLineItems } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    await addLineItem(validLineItemData())
    expect(currentReceipt.value?.lineItems?.length).toBeGreaterThan(0)
    expect(hasLineItems.value).toBe(true)
  })

  it('addLineItem throws when no current receipt', async () => {
    const { addLineItem } = useReceipts({ storage })
    await expect(addLineItem(validLineItemData())).rejects.toThrow('No current receipt')
  })

  it('updateLineItem updates an existing line item', async () => {
    const { createReceipt, addLineItem, updateLineItem, currentReceipt } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    await addLineItem(validLineItemData())
    const itemId = currentReceipt.value!.lineItems![0].id!
    await updateLineItem(itemId, { description: 'Updated item', quantity: 5, unitPrice: 10 })
    expect(currentReceipt.value?.lineItems?.find((i) => i.id === itemId)?.description).toBe(
      'Updated item'
    )
  })

  it('updateLineItem throws when no current receipt', async () => {
    const { updateLineItem } = useReceipts({ storage })
    await expect(updateLineItem('li-1', { description: 'x' })).rejects.toThrow('No current receipt')
  })

  it('removeLineItem removes a line item', async () => {
    // validReceiptData already has 1 item; remove it directly (no addLineItem needed)
    const { createReceipt, removeLineItem, currentReceipt } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    const itemId = currentReceipt.value!.lineItems![0].id!
    await removeLineItem(itemId)
    expect(currentReceipt.value?.lineItems?.length).toBe(0)
  })

  it('removeLineItem throws when no current receipt', async () => {
    const { removeLineItem } = useReceipts({ storage })
    await expect(removeLineItem('li-1')).rejects.toThrow('No current receipt')
  })

  it('addLineItem sets error on storage failure', async () => {
    const { createReceipt, addLineItem, error } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    vi.spyOn(storage, 'set').mockRejectedValueOnce(new Error('disk full'))
    await expect(addLineItem(validLineItemData())).rejects.toThrow('disk full')
    expect(error.value).toBe('disk full')
  })

  // --- clearCurrentReceipt ---

  it('clearCurrentReceipt resets state', async () => {
    const { createReceipt, clearCurrentReceipt, currentReceipt, error } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    clearCurrentReceipt()
    expect(currentReceipt.value).toBeNull()
    expect(error.value).toBeNull()
  })

  // --- autoLoad ---

  it('autoLoad triggers loadReceipts on init', async () => {
    const { createReceipt } = useReceipts({ storage })
    await createReceipt(validReceiptData())
    const { receipts } = useReceipts({ storage, autoLoad: true })
    await new Promise((r) => setTimeout(r, 0))
    expect(receipts.value.length).toBe(1)
  })
})
