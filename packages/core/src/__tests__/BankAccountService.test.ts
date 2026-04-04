/**
 * Tests for BankAccountService — uses an in-memory StorageAdapter
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { BankAccountService } from '../services/BankAccountService'
import type { StorageAdapter } from '../storage/StorageAdapter'
import type { BankAccountData } from '../models/BankAccount'

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
function validAccountInput() {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021', // valid ABA (JP Morgan Chase)
    accountNumber: '123456789',
  }
}

// ---------------------------------------------------------------------------
// BankAccountService tests
// ---------------------------------------------------------------------------
describe('BankAccountService', () => {
  let storage: MemoryStorage
  let service: BankAccountService

  beforeEach(() => {
    storage = new MemoryStorage()
    service = new BankAccountService({ storage })
  })

  // --- createBankAccount ---

  it('creates a bank account with required fields', async () => {
    const account = await service.createBankAccount(validAccountInput())
    expect(account.id).toBeTruthy()
    expect(account.bankName).toBe('First National')
    expect(account.accountNumber).toBe('123456789')
  })

  it('assigns id and timestamps on creation', async () => {
    const account = await service.createBankAccount(validAccountInput())
    expect(account.id).toBeTruthy()
    expect(account.createdAt).toBeTruthy()
    expect(account.updatedAt).toBeTruthy()
  })

  it('makes the first account the default automatically', async () => {
    const account = await service.createBankAccount(validAccountInput())
    expect(account.isDefault).toBe(true)
  })

  it('does not make subsequent accounts default unless specified', async () => {
    await service.createBankAccount(validAccountInput())
    const second = await service.createBankAccount({
      ...validAccountInput(),
      accountNumber: '987654321',
    })
    expect(second.isDefault).toBeFalsy()
  })

  it('clears other defaults when new account created as default', async () => {
    const first = await service.createBankAccount(validAccountInput())
    expect(first.isDefault).toBe(true)

    await service.createBankAccount({
      ...validAccountInput(),
      accountNumber: '987654321',
      isDefault: true,
    })

    const updatedFirst = await service.getBankAccount(first.id!)
    expect(updatedFirst!.isDefault).toBe(false)
  })

  it('throws for invalid account (missing accountHolderName)', async () => {
    await expect(
      service.createBankAccount({ ...validAccountInput(), accountHolderName: '' })
    ).rejects.toThrow()
  })

  it('throws for invalid routing number', async () => {
    await expect(
      service.createBankAccount({ ...validAccountInput(), routingNumber: '123456789' })
    ).rejects.toThrow()
  })

  it('throws for non-digit account number', async () => {
    await expect(
      service.createBankAccount({ ...validAccountInput(), accountNumber: 'ACCT-1234' })
    ).rejects.toThrow()
  })

  // --- getBankAccount ---

  it('retrieves an account by id', async () => {
    const created = await service.createBankAccount(validAccountInput())
    const found = await service.getBankAccount(created.id!)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
  })

  it('returns null for unknown id', async () => {
    const found = await service.getBankAccount('nonexistent-id')
    expect(found).toBeNull()
  })

  // --- getAllBankAccounts ---

  it('returns empty array when no accounts exist', async () => {
    const accounts = await service.getAllBankAccounts()
    expect(accounts).toHaveLength(0)
  })

  it('returns all created accounts', async () => {
    await service.createBankAccount(validAccountInput())
    await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111' })
    const accounts = await service.getAllBankAccounts()
    expect(accounts).toHaveLength(2)
  })

  // --- getBankAccounts / filtering ---

  it('returns all accounts when no filters applied', async () => {
    await service.createBankAccount(validAccountInput())
    await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111' })
    const accounts = await service.getBankAccounts()
    expect(accounts).toHaveLength(2)
  })

  it('filters accounts by searchTerm (account holder name)', async () => {
    await service.createBankAccount({ ...validAccountInput(), accountHolderName: 'Jane Smith' })
    await service.createBankAccount({ ...validAccountInput(), accountHolderName: 'John Doe', accountNumber: '111111111' })
    const results = await service.getBankAccounts({ searchTerm: 'jane' })
    expect(results).toHaveLength(1)
    expect(results[0].accountHolderName).toBe('Jane Smith')
  })

  it('filters accounts by isActive', async () => {
    await service.createBankAccount({ ...validAccountInput(), isActive: true })
    await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111', isActive: false })
    const active = await service.getBankAccounts({ isActive: true })
    expect(active.every((a) => a.isActive)).toBe(true)
  })

  // --- updateBankAccount ---

  it('updates an account field', async () => {
    const account = await service.createBankAccount(validAccountInput())
    const updated = await service.updateBankAccount(account.id!, { bankName: 'Second Bank' })
    expect(updated.bankName).toBe('Second Bank')
  })

  it('throws when updating a non-existent account', async () => {
    await expect(service.updateBankAccount('bad-id', { bankName: 'X' })).rejects.toThrow()
  })

  it('preserves id and createdAt when updating', async () => {
    const account = await service.createBankAccount(validAccountInput())
    const originalCreatedAt = account.createdAt
    const updated = await service.updateBankAccount(account.id!, { bankName: 'New Bank' })
    expect(updated.id).toBe(account.id)
    expect(new Date(updated.createdAt!).toISOString()).toBe(new Date(originalCreatedAt!).toISOString())
  })

  it('clears other defaults when updating to isDefault=true', async () => {
    const first = await service.createBankAccount(validAccountInput())
    const second = await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111' })
    expect(first.isDefault).toBe(true)
    expect(second.isDefault).toBeFalsy()

    await service.updateBankAccount(second.id!, { isDefault: true })

    const updatedFirst = await service.getBankAccount(first.id!)
    expect(updatedFirst!.isDefault).toBe(false)
  })

  // --- deleteBankAccount ---

  it('deletes an account', async () => {
    const account = await service.createBankAccount(validAccountInput())
    await service.deleteBankAccount(account.id!)
    const found = await service.getBankAccount(account.id!)
    expect(found).toBeNull()
  })

  it('promotes first remaining account to default when default is deleted', async () => {
    const first = await service.createBankAccount(validAccountInput())
    const second = await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111' })
    expect(first.isDefault).toBe(true)
    expect(second.isDefault).toBeFalsy()

    await service.deleteBankAccount(first.id!)
    const updatedSecond = await service.getBankAccount(second.id!)
    expect(updatedSecond!.isDefault).toBe(true)
  })

  // --- getDefaultBankAccount ---

  it('getDefaultBankAccount returns the default account', async () => {
    const account = await service.createBankAccount(validAccountInput())
    const defaultAccount = await service.getDefaultBankAccount()
    expect(defaultAccount).not.toBeNull()
    expect(defaultAccount!.id).toBe(account.id)
  })

  it('getDefaultBankAccount returns null when no accounts exist', async () => {
    const defaultAccount = await service.getDefaultBankAccount()
    expect(defaultAccount).toBeNull()
  })

  // --- setDefaultBankAccount ---

  it('setDefaultBankAccount makes an account the default', async () => {
    const first = await service.createBankAccount(validAccountInput())
    const second = await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111' })

    await service.setDefaultBankAccount(second.id!)

    const updatedFirst = await service.getBankAccount(first.id!)
    const updatedSecond = await service.getBankAccount(second.id!)
    expect(updatedFirst!.isDefault).toBe(false)
    expect(updatedSecond!.isDefault).toBe(true)
  })

  // --- getActiveBankAccounts / toggleActive ---

  it('getActiveBankAccounts returns only active accounts', async () => {
    await service.createBankAccount({ ...validAccountInput(), isActive: true })
    await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111', isActive: false })
    const active = await service.getActiveBankAccounts()
    expect(active.every((a) => a.isActive)).toBe(true)
  })

  it('toggleActive flips isActive', async () => {
    const account = await service.createBankAccount({ ...validAccountInput(), isActive: true })
    const toggled = await service.toggleActive(account.id!)
    expect(toggled.isActive).toBe(false)
    const toggledBack = await service.toggleActive(account.id!)
    expect(toggledBack.isActive).toBe(true)
  })

  it('toggleActive throws for non-existent account', async () => {
    await expect(service.toggleActive('bad-id')).rejects.toThrow()
  })

  // --- searchBankAccounts ---

  it('searchBankAccounts finds by bank name', async () => {
    await service.createBankAccount({ ...validAccountInput(), bankName: 'First National' })
    await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111', bankName: 'Second Bank' })
    const results = await service.searchBankAccounts('first')
    expect(results).toHaveLength(1)
    expect(results[0].bankName).toBe('First National')
  })

  // --- getStatistics ---

  it('getStatistics returns correct counts', async () => {
    await service.createBankAccount({ ...validAccountInput(), isActive: true, accountType: 'checking' })
    await service.createBankAccount({ ...validAccountInput(), accountNumber: '111111111', isActive: false, accountType: 'savings' })
    const stats = await service.getStatistics()
    expect(stats.total).toBe(2)
    expect(stats.active).toBe(1)
    expect(stats.inactive).toBe(1)
  })

  // --- importBankAccounts / exportBankAccounts ---

  it('importBankAccounts creates multiple accounts', async () => {
    const result = await service.importBankAccounts([
      validAccountInput() as unknown as BankAccountData,
      { ...validAccountInput(), accountNumber: '111111111' } as unknown as BankAccountData,
    ])
    expect(result.success).toBe(2)
    expect(result.failed).toBe(0)
    expect(await service.getAllBankAccounts()).toHaveLength(2)
  })

  it('exportBankAccounts returns all account data', async () => {
    await service.createBankAccount(validAccountInput())
    const exported = await service.exportBankAccounts()
    expect(exported).toHaveLength(1)
    expect(exported[0].bankName).toBe('First National')
  })

  // --- clearAll ---

  it('clearAll removes all accounts', async () => {
    await service.createBankAccount(validAccountInput())
    await service.clearAll()
    expect(await service.getAllBankAccounts()).toHaveLength(0)
  })
})
