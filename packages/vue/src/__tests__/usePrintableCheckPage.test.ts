/**
 * Tests for usePrintableCheckPage composable
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { usePrintableCheckPage } from '../composables/usePrintableCheckPage'
import { PrintChecksCore } from '@printchecks/core'
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

function validCheckData(overrides: Record<string, unknown> = {}) {
  return {
    checkNumber: '1001',
    date: '2026-01-15',
    payTo: 'Test Corp',
    amount: '200.00',
    memo: '',
    signature: '',
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    bankAccountNumber: '123456789',
    ...overrides,
  }
}

describe('usePrintableCheckPage', () => {
  let core: PrintChecksCore

  beforeEach(() => {
    core = new PrintChecksCore({ storage: new MemoryStorage() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // --- initial state ---

  it('starts with empty/null state', () => {
    const { currentCheckId, checkData, lineItems, paymentStats, isLoading, error } =
      usePrintableCheckPage({ core })
    expect(currentCheckId.value).toBeNull()
    expect(checkData.value).toBeNull()
    expect(lineItems.value).toEqual([])
    expect(paymentStats.value).toBeNull()
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('showAnalytics defaults to true', () => {
    const { showAnalytics } = usePrintableCheckPage({ core })
    expect(showAnalytics.value).toBe(true)
  })

  it('showLineItems defaults to true', () => {
    const { showLineItems } = usePrintableCheckPage({ core })
    expect(showLineItems.value).toBe(true)
  })

  it('respects showAnalytics=false option', () => {
    const { showAnalytics } = usePrintableCheckPage({ core, showAnalytics: false })
    expect(showAnalytics.value).toBe(false)
  })

  it('respects showLineItems=false option', () => {
    const { showLineItems } = usePrintableCheckPage({ core, showLineItems: false })
    expect(showLineItems.value).toBe(false)
  })

  // --- toggleAnalytics / toggleLineItems ---

  it('toggleAnalytics flips showAnalytics', () => {
    const { showAnalytics, toggleAnalytics } = usePrintableCheckPage({ core })
    expect(showAnalytics.value).toBe(true)
    toggleAnalytics()
    expect(showAnalytics.value).toBe(false)
    toggleAnalytics()
    expect(showAnalytics.value).toBe(true)
  })

  it('toggleLineItems flips showLineItems', () => {
    const { showLineItems, toggleLineItems } = usePrintableCheckPage({ core })
    toggleLineItems()
    expect(showLineItems.value).toBe(false)
  })

  // --- setCheckData ---

  it('setCheckData sets checkData, currentCheckId, and lineItems', async () => {
    const { setCheckData, checkData, currentCheckId, lineItems } = usePrintableCheckPage({ core })
    const check = await core.createCheck(validCheckData())
    setCheckData(check, [{ description: 'Item A', quantity: 1, unitPrice: 100 }])
    expect(checkData.value?.id).toBe(check.id)
    expect(currentCheckId.value).toBe(check.id)
    expect(lineItems.value.length).toBe(1)
    expect(lineItems.value[0].description).toBe('Item A')
  })

  it('setCheckData with no items defaults to empty array', async () => {
    const { setCheckData, lineItems } = usePrintableCheckPage({ core })
    const check = await core.createCheck(validCheckData())
    setCheckData(check)
    expect(lineItems.value).toEqual([])
  })

  // --- addLineItem ---

  it('addLineItem appends to lineItems', () => {
    const { addLineItem, lineItems } = usePrintableCheckPage({ core })
    addLineItem({ description: 'Widget', quantity: 3, unitPrice: 10 })
    expect(lineItems.value.length).toBe(1)
    expect(lineItems.value[0].description).toBe('Widget')
  })

  it('addLineItem auto-assigns id if not provided', () => {
    const { addLineItem, lineItems } = usePrintableCheckPage({ core })
    addLineItem({ description: 'No ID', quantity: 1, unitPrice: 5 })
    expect(lineItems.value[0].id).toBeTruthy()
  })

  it('addLineItem preserves provided id', () => {
    const { addLineItem, lineItems } = usePrintableCheckPage({ core })
    addLineItem({ id: 'custom-id', description: 'Widget', quantity: 1, unitPrice: 5 })
    expect(lineItems.value[0].id).toBe('custom-id')
  })

  // --- removeLineItem ---

  it('removeLineItem removes item by index', () => {
    const { addLineItem, removeLineItem, lineItems } = usePrintableCheckPage({ core })
    addLineItem({ description: 'A', quantity: 1, unitPrice: 1 })
    addLineItem({ description: 'B', quantity: 2, unitPrice: 2 })
    removeLineItem(0)
    expect(lineItems.value.length).toBe(1)
    expect(lineItems.value[0].description).toBe('B')
  })

  it('removeLineItem does nothing for out-of-range index', () => {
    const { addLineItem, removeLineItem, lineItems } = usePrintableCheckPage({ core })
    addLineItem({ description: 'A', quantity: 1, unitPrice: 1 })
    removeLineItem(5)
    expect(lineItems.value.length).toBe(1)
    removeLineItem(-1)
    expect(lineItems.value.length).toBe(1)
  })

  // --- clearLineItems ---

  it('clearLineItems empties lineItems', () => {
    const { addLineItem, clearLineItems, lineItems } = usePrintableCheckPage({ core })
    addLineItem({ description: 'A', quantity: 1, unitPrice: 1 })
    addLineItem({ description: 'B', quantity: 2, unitPrice: 2 })
    clearLineItems()
    expect(lineItems.value).toEqual([])
  })

  // --- loadCheckForPrinting ---

  it('loadCheckForPrinting sets checkData, currentCheckId, and paymentStats', async () => {
    const { loadCheckForPrinting, checkData, currentCheckId, paymentStats, isLoading } =
      usePrintableCheckPage({ core })
    const check = await core.createCheck(validCheckData())
    await loadCheckForPrinting(check.id!)
    expect(currentCheckId.value).toBe(check.id)
    expect(checkData.value?.id).toBe(check.id)
    expect(paymentStats.value).toBeDefined()
    expect(paymentStats.value?.totalCount).toBeGreaterThanOrEqual(1)
    expect(isLoading.value).toBe(false)
  })

  it('loadCheckForPrinting sets error for unknown check id', async () => {
    const { loadCheckForPrinting, error } = usePrintableCheckPage({ core })
    await expect(loadCheckForPrinting('no-such-id')).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  // --- refreshStats ---

  it('refreshStats populates paymentStats', async () => {
    const { refreshStats, paymentStats } = usePrintableCheckPage({ core })
    await core.createCheck(validCheckData({ amount: '300.00' }))
    await refreshStats()
    expect(paymentStats.value).toBeDefined()
    expect(paymentStats.value?.totalCount).toBe(1)
    expect(paymentStats.value?.allTimeTotal).toBe(300)
  })

  it('refreshStats with no checks returns zero stats', async () => {
    const { refreshStats, paymentStats } = usePrintableCheckPage({ core })
    await refreshStats()
    expect(paymentStats.value?.totalCount).toBe(0)
    expect(paymentStats.value?.allTimeTotal).toBe(0)
  })

  // --- printPage ---

  it('printPage calls window.print()', () => {
    const printMock = vi.fn()
    // In the Node test environment `window` doesn't exist; stub it as a global
    vi.stubGlobal('window', { print: printMock })
    const { printPage } = usePrintableCheckPage({ core })
    printPage()
    expect(printMock).toHaveBeenCalledOnce()
  })
})
