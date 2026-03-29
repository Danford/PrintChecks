/**
 * Tests for usePrintChecks composable (main unified composable)
 */
import { describe, it, expect } from 'vitest'
import { usePrintChecks } from '../composables/usePrintChecks'
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

function validCheckData() {
  return {
    checkNumber: '5001',
    date: '2026-01-15',
    payTo: 'Round Trip Corp',
    amount: '250.00',
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
  }
}

describe('usePrintChecks', () => {
  // --- initialization ---

  it('initializes with isInitialized=true', () => {
    const { isInitialized } = usePrintChecks({ storage: new MemoryStorage() })
    expect(isInitialized.value).toBe(true)
  })

  it('exposes core, checks, vendors, bankAccounts, receipts sub-composables', () => {
    const pc = usePrintChecks({ storage: new MemoryStorage() })
    expect(pc.core).toBeDefined()
    expect(pc.checks).toBeDefined()
    expect(pc.vendors).toBeDefined()
    expect(pc.bankAccounts).toBeDefined()
    expect(pc.receipts).toBeDefined()
  })

  it('all sub-composables start with empty state', () => {
    const { checks, vendors, bankAccounts, receipts } = usePrintChecks({
      storage: new MemoryStorage(),
    })
    expect(checks.checks.value).toEqual([])
    expect(vendors.vendors.value).toEqual([])
    expect(bankAccounts.accounts.value).toEqual([])
    expect(receipts.receipts.value).toEqual([])
  })

  // --- exportData / importData ---

  it('exportData returns an object', async () => {
    const { exportData } = usePrintChecks({ storage: new MemoryStorage() })
    const result = await exportData()
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('importData round-trips exported data', async () => {
    const storage = new MemoryStorage()
    const { checks, exportData, importData } = usePrintChecks({ storage })
    await checks.createCheck(validCheckData())
    const exported = await exportData()
    await importData(exported)
    const result = await exportData()
    expect(JSON.stringify(result)).toContain('Round Trip Corp')
  })

  // --- clearAllData ---

  it('clearAllData empties all service collections', async () => {
    const storage = new MemoryStorage()
    const { checks, vendors, clearAllData } = usePrintChecks({ storage })
    await checks.createCheck(validCheckData())
    await vendors.createVendor({ name: 'Acme Corp', address: '1 Main St', city: 'Austin', state: 'TX', zip: '78701' })
    await clearAllData()
    expect(checks.checks.value.length).toBe(0)
    expect(vendors.vendors.value.length).toBe(0)
  })

  // --- encryption actions are exposed ---

  it('exposes enableEncryption, disableEncryption, changeEncryptionPassword', () => {
    const { enableEncryption, disableEncryption, changeEncryptionPassword } = usePrintChecks({
      storage: new MemoryStorage(),
    })
    expect(typeof enableEncryption).toBe('function')
    expect(typeof disableEncryption).toBe('function')
    expect(typeof changeEncryptionPassword).toBe('function')
  })

  // --- sub-composable delegation ---

  it('checks sub-composable can create and load checks', async () => {
    const { checks } = usePrintChecks({ storage: new MemoryStorage() })
    const check = await checks.createCheck(validCheckData())
    expect(check.payTo).toBe('Round Trip Corp')
    await checks.loadChecks()
    expect(checks.checks.value.length).toBe(1)
  })

  it('vendors sub-composable can create and load vendors', async () => {
    const { vendors } = usePrintChecks({ storage: new MemoryStorage() })
    await vendors.createVendor({ name: 'Test Vendor', address: '2 Ave', city: 'Town', state: 'NY', zip: '10001' })
    expect(vendors.vendors.value.length).toBe(1)
  })
})
