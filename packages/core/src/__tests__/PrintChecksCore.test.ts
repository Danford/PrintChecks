/**
 * Integration tests for PrintChecksCore — the main public API entry point.
 * Uses an in-memory StorageAdapter to avoid localStorage/crypto dependencies.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { PrintChecksCore } from '../PrintChecksCore'
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
// Test fixtures
// ---------------------------------------------------------------------------
function checkInput() {
  return {
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
    memo: '',
    signature: '',
  }
}

function vendorInput() {
  return { name: 'Acme Corp' }
}

function accountInput() {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    accountNumber: '123456789',
  }
}

function receiptInput() {
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
// Tests
// ---------------------------------------------------------------------------
describe('PrintChecksCore', () => {
  let storage: MemoryStorage
  let core: PrintChecksCore

  beforeEach(() => {
    storage = new MemoryStorage()
    core = new PrintChecksCore({ storage })
  })

  // -------------------------------------------------------------------------
  // Construction
  // -------------------------------------------------------------------------

  describe('construction', () => {
    it('creates an instance with a custom storage adapter', () => {
      expect(core).toBeInstanceOf(PrintChecksCore)
    })

    it('getStorage() returns the injected adapter', () => {
      expect(core.getStorage()).toBe(storage)
    })

    it('exposes service namespaces', () => {
      expect(core.checks).toBeDefined()
      expect(core.vendors).toBeDefined()
      expect(core.bankAccounts).toBeDefined()
      expect(core.receipts).toBeDefined()
    })

    it('waitForInitialization() resolves immediately when no encryption', async () => {
      await expect(core.waitForInitialization()).resolves.toBeUndefined()
    })
  })

  // -------------------------------------------------------------------------
  // Check delegation
  // -------------------------------------------------------------------------

  describe('check delegation', () => {
    it('createCheck / getCheck round-trip', async () => {
      const check = await core.createCheck(checkInput())
      expect(check.id).toBeTruthy()
      const fetched = await core.getCheck(check.id!)
      expect(fetched?.payTo).toBe('Acme Corp')
    })

    it('getChecks returns all checks', async () => {
      await core.createCheck(checkInput())
      await core.createCheck({ ...checkInput(), checkNumber: '1002' })
      const all = await core.getChecks()
      expect(all).toHaveLength(2)
    })

    it('updateCheck changes fields', async () => {
      const check = await core.createCheck(checkInput())
      const updated = await core.updateCheck(check.id!, { memo: 'rent' })
      expect(updated.memo).toBe('rent')
    })

    it('deleteCheck removes the check', async () => {
      const check = await core.createCheck(checkInput())
      await core.deleteCheck(check.id!)
      const fetched = await core.getCheck(check.id!)
      expect(fetched).toBeNull()
    })

    it('markCheckAsPrinted sets printed flag', async () => {
      const check = await core.createCheck(checkInput())
      const printed = await core.markCheckAsPrinted(check.id!)
      expect(printed.isPrinted).toBe(true)
    })

    it('voidCheck sets voided flag', async () => {
      const check = await core.createCheck(checkInput())
      const voided = await core.voidCheck(check.id!, 'error')
      expect(voided.isVoid).toBe(true)
      expect(voided.voidReason).toBe('error')
    })

    it('duplicateCheck creates a new check with a new number', async () => {
      const check = await core.createCheck(checkInput())
      const dup = await core.duplicateCheck(check.id!, '2001')
      expect(dup.id).not.toBe(check.id)
      expect(dup.checkNumber).toBe('2001')
      expect(dup.payTo).toBe(check.payTo)
    })

    it('getNextCheckNumber auto-increments', async () => {
      await core.createCheck(checkInput()) // 1001
      const next = await core.getNextCheckNumber()
      expect(next).toBe('1002')
    })
  })

  // -------------------------------------------------------------------------
  // Vendor delegation
  // -------------------------------------------------------------------------

  describe('vendor delegation', () => {
    it('createVendor / getVendor round-trip', async () => {
      const vendor = await core.createVendor(vendorInput())
      expect(vendor.id).toBeTruthy()
      const fetched = await core.getVendor(vendor.id!)
      expect(fetched?.name).toBe('Acme Corp')
    })

    it('getVendors returns all vendors', async () => {
      await core.createVendor({ name: 'Alpha' })
      await core.createVendor({ name: 'Beta' })
      const all = await core.getVendors()
      expect(all).toHaveLength(2)
    })

    it('updateVendor changes fields', async () => {
      const vendor = await core.createVendor(vendorInput())
      const updated = await core.updateVendor(vendor.id!, { name: 'Updated Corp' })
      expect(updated.name).toBe('Updated Corp')
    })

    it('deleteVendor removes the vendor', async () => {
      const vendor = await core.createVendor(vendorInput())
      await core.deleteVendor(vendor.id!)
      const fetched = await core.getVendor(vendor.id!)
      expect(fetched).toBeNull()
    })

    it('searchVendors filters by name', async () => {
      await core.createVendor({ name: 'Acme Corp' })
      await core.createVendor({ name: 'Beta LLC' })
      const results = await core.searchVendors('acme')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Acme Corp')
    })

    it('toggleVendorFavorite flips the favorite flag', async () => {
      const vendor = await core.createVendor(vendorInput())
      const toggled = await core.toggleVendorFavorite(vendor.id!)
      expect(toggled.isFavorite).toBe(true)
      const getFavorites = await core.getFavoriteVendors()
      expect(getFavorites).toHaveLength(1)
    })
  })

  // -------------------------------------------------------------------------
  // Bank account delegation
  // -------------------------------------------------------------------------

  describe('bank account delegation', () => {
    it('createBankAccount / getBankAccount round-trip', async () => {
      const account = await core.createBankAccount(accountInput())
      expect(account.id).toBeTruthy()
      const fetched = await core.getBankAccount(account.id!)
      expect(fetched?.bankName).toBe('First National')
    })

    it('getBankAccounts returns all accounts', async () => {
      await core.createBankAccount(accountInput())
      await core.createBankAccount({ ...accountInput(), accountNumber: '987654321' })
      const all = await core.getBankAccounts()
      expect(all).toHaveLength(2)
    })

    it('updateBankAccount changes fields', async () => {
      const account = await core.createBankAccount(accountInput())
      const updated = await core.updateBankAccount(account.id!, { bankName: 'Second Bank' })
      expect(updated.bankName).toBe('Second Bank')
    })

    it('deleteBankAccount removes the account', async () => {
      const account = await core.createBankAccount(accountInput())
      await core.deleteBankAccount(account.id!)
      expect(await core.getBankAccount(account.id!)).toBeNull()
    })

    it('setDefaultBankAccount / getDefaultBankAccount', async () => {
      const account = await core.createBankAccount(accountInput())
      await core.setDefaultBankAccount(account.id!)
      const defaultAccount = await core.getDefaultBankAccount()
      expect(defaultAccount?.id).toBe(account.id)
    })
  })

  // -------------------------------------------------------------------------
  // Receipt delegation
  // -------------------------------------------------------------------------

  describe('receipt delegation', () => {
    it('createReceipt / getReceipt round-trip', async () => {
      const receipt = await core.createReceipt(receiptInput())
      expect(receipt.id).toBeTruthy()
      const fetched = await core.getReceipt(receipt.id!)
      expect(fetched?.receiptNumber).toBe('R-1000')
    })

    it('getReceipts returns all receipts', async () => {
      await core.createReceipt(receiptInput())
      await core.createReceipt({ ...receiptInput(), receiptNumber: 'R-1001' })
      const all = await core.getReceipts()
      expect(all).toHaveLength(2)
    })

    it('updateReceipt changes fields', async () => {
      const receipt = await core.createReceipt(receiptInput())
      const updated = await core.updateReceipt(receipt.id!, { notes: 'priority' })
      expect(updated.notes).toBe('priority')
    })

    it('deleteReceipt removes the receipt', async () => {
      const receipt = await core.createReceipt(receiptInput())
      await core.deleteReceipt(receipt.id!)
      expect(await core.getReceipt(receipt.id!)).toBeNull()
    })

    it('addLineItem appends a line item', async () => {
      const receipt = await core.createReceipt(receiptInput())
      const updated = await core.addLineItem(receipt.id!, {
        id: 'item-2',
        description: 'Gadget',
        quantity: 1,
        unitPrice: 25.0,
        totalPrice: 25.0,
        taxable: false,
      })
      expect(updated.lineItems).toHaveLength(2)
      expect(updated.lineItems[1].description).toBe('Gadget')
    })

    it('updateLineItem modifies a specific line item', async () => {
      const receipt = await core.createReceipt(receiptInput())
      const updated = await core.updateLineItem(receipt.id!, 'item-1', { description: 'Widget v2' })
      expect(updated.lineItems[0].description).toBe('Widget v2')
    })

    it('removeLineItem deletes a specific line item', async () => {
      const receipt = await core.createReceipt(receiptInput())
      const updated = await core.removeLineItem(receipt.id!, 'item-1')
      expect(updated.lineItems).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // exportData
  // -------------------------------------------------------------------------

  describe('exportData', () => {
    it('returns an export envelope with version and exportDate', async () => {
      const result = await core.exportData()
      expect(result.version).toBe('1.0')
      expect(result.exportDate).toBeTruthy()
      expect(new Date(result.exportDate).getFullYear()).toBeGreaterThanOrEqual(2024)
    })

    it('includes all four entity types', async () => {
      const result = await core.exportData()
      expect(result.data).toHaveProperty('checks')
      expect(result.data).toHaveProperty('vendors')
      expect(result.data).toHaveProperty('bankAccounts')
      expect(result.data).toHaveProperty('receipts')
    })

    it('exports created entities', async () => {
      await core.createCheck(checkInput())
      await core.createVendor(vendorInput())
      await core.createBankAccount(accountInput())
      await core.createReceipt(receiptInput())

      const result = await core.exportData()
      expect(result.data.checks).toHaveLength(1)
      expect(result.data.vendors).toHaveLength(1)
      expect(result.data.bankAccounts).toHaveLength(1)
      expect(result.data.receipts).toHaveLength(1)
    })

    it('returns empty arrays when no data exists', async () => {
      const result = await core.exportData()
      expect(result.data.checks).toHaveLength(0)
      expect(result.data.vendors).toHaveLength(0)
      expect(result.data.bankAccounts).toHaveLength(0)
      expect(result.data.receipts).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // importData
  // -------------------------------------------------------------------------

  describe('importData', () => {
    it('returns results with success counts for each entity type', async () => {
      const result = await core.importData({
        vendors: [vendorInput()],
        bankAccounts: [accountInput()],
        receipts: [receiptInput()],
      })
      expect(result.vendors.success).toBe(1)
      expect(result.vendors.failed).toBe(0)
      expect(result.bankAccounts.success).toBe(1)
      expect(result.receipts.success).toBe(1)
    })

    it('imported vendors are retrievable', async () => {
      await core.importData({ vendors: [{ name: 'Imported Corp' }] })
      const vendors = await core.getVendors()
      expect(vendors.some((v) => v.name === 'Imported Corp')).toBe(true)
    })

    it('imported bank accounts are retrievable', async () => {
      await core.importData({ bankAccounts: [accountInput()] })
      const accounts = await core.getBankAccounts()
      expect(accounts).toHaveLength(1)
    })

    it('imported receipts are retrievable', async () => {
      await core.importData({ receipts: [receiptInput()] })
      const receipts = await core.getReceipts()
      expect(receipts).toHaveLength(1)
    })

    it('handles partial imports (only some entity types provided)', async () => {
      const result = await core.importData({ vendors: [vendorInput()] })
      expect(result.vendors.success).toBe(1)
      expect(result.checks.success).toBe(0)
      expect(result.bankAccounts.success).toBe(0)
      expect(result.receipts.success).toBe(0)
    })

    it('handles empty import gracefully', async () => {
      const result = await core.importData({})
      expect(result.checks.success).toBe(0)
      expect(result.vendors.success).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // clearAllData
  // -------------------------------------------------------------------------

  describe('clearAllData', () => {
    it('removes all entities from every service', async () => {
      await core.createCheck(checkInput())
      await core.createVendor(vendorInput())
      await core.createBankAccount(accountInput())
      await core.createReceipt(receiptInput())

      await core.clearAllData()

      expect(await core.getChecks()).toHaveLength(0)
      expect(await core.getVendors()).toHaveLength(0)
      expect(await core.getBankAccounts()).toHaveLength(0)
      expect(await core.getReceipts()).toHaveLength(0)
    })

    it('clears data across all services independently', async () => {
      await core.createVendor({ name: 'Alpha' })
      await core.createVendor({ name: 'Beta' })
      await core.createBankAccount(accountInput())

      await core.clearAllData()

      expect(await core.getVendors()).toHaveLength(0)
      expect(await core.getBankAccounts()).toHaveLength(0)
    })
  })

  // -------------------------------------------------------------------------
  // getAllStatistics
  // -------------------------------------------------------------------------

  describe('getAllStatistics', () => {
    it('returns stats for all four entity types', async () => {
      const stats = await core.getAllStatistics()
      expect(stats).toHaveProperty('checks')
      expect(stats).toHaveProperty('vendors')
      expect(stats).toHaveProperty('bankAccounts')
      expect(stats).toHaveProperty('receipts')
    })

    it('check stats reflect created checks', async () => {
      await core.createCheck(checkInput())
      const stats = await core.getAllStatistics()
      expect(stats.checks.total).toBe(1)
    })

    it('vendor stats reflect created vendors', async () => {
      await core.createVendor(vendorInput())
      const stats = await core.getAllStatistics()
      expect(stats.vendors.total).toBe(1)
    })

    it('individual statistics methods are consistent with getAllStatistics', async () => {
      await core.createCheck(checkInput())
      const all = await core.getAllStatistics()
      const checkStats = await core.getCheckStatistics()
      expect(all.checks).toEqual(checkStats)
    })
  })

  // -------------------------------------------------------------------------
  // export → import round-trip
  // -------------------------------------------------------------------------

  describe('export/import round-trip', () => {
    it('exported data can be imported into a fresh instance', async () => {
      await core.createVendor({ name: 'Round-trip Corp' })
      await core.createBankAccount(accountInput())

      const exported = await core.exportData()

      const freshStorage = new MemoryStorage()
      const freshCore = new PrintChecksCore({ storage: freshStorage })

      await freshCore.importData(exported.data)

      const vendors = await freshCore.getVendors()
      expect(vendors.some((v) => v.name === 'Round-trip Corp')).toBe(true)

      const accounts = await freshCore.getBankAccounts()
      expect(accounts).toHaveLength(1)
    })
  })
})
