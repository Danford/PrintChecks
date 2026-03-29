/**
 * Tests for useBankAccounts composable
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useBankAccounts } from '../composables/useBankAccounts'
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

function validAccountData(overrides: Record<string, unknown> = {}) {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    accountNumber: '123456789',
    ...overrides,
  }
}

describe('useBankAccounts', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  // --- initial state ---

  it('starts with empty/null state', () => {
    const { currentAccount, accounts, isLoading, error } = useBankAccounts({ storage })
    expect(currentAccount.value).toBeNull()
    expect(accounts.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('accountCount is 0 initially', () => {
    const { accountCount } = useBankAccounts({ storage })
    expect(accountCount.value).toBe(0)
  })

  it('defaultAccount is null initially', () => {
    const { defaultAccount } = useBankAccounts({ storage })
    expect(defaultAccount.value).toBeNull()
  })

  // --- createAccount ---

  it('createAccount sets currentAccount and loads accounts', async () => {
    const { createAccount, currentAccount, accounts } = useBankAccounts({ storage })
    const acct = await createAccount(validAccountData())
    expect(acct.bankName).toBe('First National')
    expect(currentAccount.value?.id).toBe(acct.id)
    expect(accounts.value.length).toBe(1)
  })

  it('createAccount sets error and rethrows on failure', async () => {
    const bad = new MemoryStorage()
    vi.spyOn(bad, 'set').mockRejectedValue(new Error('write error'))
    const { createAccount, error } = useBankAccounts({ storage: bad })
    await expect(createAccount(validAccountData())).rejects.toThrow('write error')
    expect(error.value).toBe('write error')
  })

  // --- loadAccounts / loadAccount ---

  it('loadAccounts populates accounts array', async () => {
    const { createAccount, loadAccounts, accounts } = useBankAccounts({ storage })
    await createAccount(validAccountData())
    await createAccount(validAccountData({ accountNumber: '987654321' }))
    await loadAccounts()
    expect(accounts.value.length).toBe(2)
  })

  it('loadAccount sets currentAccount', async () => {
    const { createAccount, loadAccount, currentAccount, clearCurrentAccount } = useBankAccounts({
      storage,
    })
    const acct = await createAccount(validAccountData())
    clearCurrentAccount()
    await loadAccount(acct.id!)
    expect(currentAccount.value?.id).toBe(acct.id)
  })

  it('loadAccount throws and sets error for unknown id', async () => {
    const { loadAccount, error } = useBankAccounts({ storage })
    await expect(loadAccount('no-such-id')).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  // --- accountCount ---

  it('accountCount reflects loaded accounts', async () => {
    const { createAccount, accountCount } = useBankAccounts({ storage })
    await createAccount(validAccountData())
    await createAccount(validAccountData({ accountNumber: '999999999' }))
    expect(accountCount.value).toBe(2)
  })

  // --- defaultAccount ---

  it('defaultAccount returns the account with isDefault=true after setDefault', async () => {
    const { createAccount, setDefaultAccount, loadAccounts, defaultAccount } = useBankAccounts({
      storage,
    })
    const a1 = await createAccount(validAccountData())
    await createAccount(validAccountData({ accountNumber: '987654321' }))
    await setDefaultAccount(a1.id!)
    await loadAccounts()
    expect(defaultAccount.value?.id).toBe(a1.id)
  })

  it('defaultAccount returns the first account when isDefault not set (service auto-assigns)', async () => {
    // BankAccountService auto-sets isDefault=true for the first account created
    const { createAccount, loadAccounts, defaultAccount } = useBankAccounts({ storage })
    const acct = await createAccount(validAccountData())
    await loadAccounts()
    expect(defaultAccount.value?.id).toBe(acct.id)
  })

  // --- updateAccount ---

  it('updateAccount updates data and refreshes list', async () => {
    const { createAccount, updateAccount, accounts } = useBankAccounts({ storage })
    const acct = await createAccount(validAccountData())
    await updateAccount(acct.id!, { bankName: 'New Bank' })
    expect(accounts.value.find((a) => a.id === acct.id)?.bankName).toBe('New Bank')
  })

  it('updateAccount updates currentAccount when ids match', async () => {
    const { createAccount, updateAccount, currentAccount } = useBankAccounts({ storage })
    const acct = await createAccount(validAccountData())
    await updateAccount(acct.id!, { bankName: 'Changed Bank' })
    expect(currentAccount.value?.bankName).toBe('Changed Bank')
  })

  // --- deleteAccount ---

  it('deleteAccount removes account and clears currentAccount if same', async () => {
    const { createAccount, deleteAccount, accounts, currentAccount } = useBankAccounts({ storage })
    const acct = await createAccount(validAccountData())
    await deleteAccount(acct.id!)
    expect(currentAccount.value).toBeNull()
    expect(accounts.value.length).toBe(0)
  })

  it('deleteAccount does not clear currentAccount if different id', async () => {
    const { createAccount, deleteAccount, currentAccount } = useBankAccounts({ storage })
    const a1 = await createAccount(validAccountData())
    const a2 = await createAccount(validAccountData({ accountNumber: '987654321' }))
    await deleteAccount(a1.id!)
    expect(currentAccount.value?.id).toBe(a2.id)
  })

  // --- setDefaultAccount ---

  it('setDefaultAccount marks account as default', async () => {
    const { createAccount, setDefaultAccount, accounts } = useBankAccounts({ storage })
    const acct = await createAccount(validAccountData())
    await setDefaultAccount(acct.id!)
    expect(accounts.value.find((a) => a.id === acct.id)?.isDefault).toBe(true)
  })

  it('setDefaultAccount updates currentAccount if same id', async () => {
    const { createAccount, setDefaultAccount, currentAccount } = useBankAccounts({ storage })
    const acct = await createAccount(validAccountData())
    await setDefaultAccount(acct.id!)
    expect(currentAccount.value?.isDefault).toBe(true)
  })

  // --- clearCurrentAccount ---

  it('clearCurrentAccount resets state', async () => {
    const { createAccount, clearCurrentAccount, currentAccount, error } = useBankAccounts({
      storage,
    })
    await createAccount(validAccountData())
    clearCurrentAccount()
    expect(currentAccount.value).toBeNull()
    expect(error.value).toBeNull()
  })

  // --- autoLoad ---

  it('autoLoad triggers loadAccounts on init', async () => {
    const { createAccount } = useBankAccounts({ storage })
    await createAccount(validAccountData())
    const { accounts } = useBankAccounts({ storage, autoLoad: true })
    await new Promise((r) => setTimeout(r, 0))
    expect(accounts.value.length).toBe(1)
  })
})
