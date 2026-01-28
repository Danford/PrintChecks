/**
 * Vue composable for bank account management
 * Provides reactive state management for bank accounts using the core library
 */

import { ref, computed, type Ref } from 'vue'
import { BankAccountService, type BankAccountFilters } from '@printchecks/core/services'
import type { BankAccount, BankAccountData } from '@printchecks/core/models'
import type { StorageAdapter } from '@printchecks/core/storage'

export interface UseBankAccountsOptions {
  storage: StorageAdapter
  autoLoad?: boolean
}

export interface UseBankAccountsReturn {
  // State
  currentAccount: Ref<BankAccount | null>
  accounts: Ref<BankAccount[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Computed
  defaultAccount: Ref<BankAccount | null>
  accountCount: Ref<number>

  // Actions
  createAccount: (data: BankAccountData) => Promise<BankAccount>
  updateAccount: (id: string, updates: Partial<BankAccountData>) => Promise<BankAccount>
  deleteAccount: (id: string) => Promise<void>
  loadAccount: (id: string) => Promise<void>
  loadAccounts: (filters?: BankAccountFilters) => Promise<void>
  setDefaultAccount: (id: string) => Promise<void>
  clearCurrentAccount: () => void
}

/**
 * Composable for managing bank accounts in Vue applications
 */
export function useBankAccounts(options: UseBankAccountsOptions): UseBankAccountsReturn {
  const service = new BankAccountService({
    storage: options.storage,
  })

  // State
  const currentAccount = ref<BankAccount | null>(null)
  const accounts = ref<BankAccount[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const defaultAccount = computed(() => accounts.value.find((a) => a.isDefault) || null)

  const accountCount = computed(() => accounts.value.length)

  // Actions
  async function createAccount(data: BankAccountData): Promise<BankAccount> {
    isLoading.value = true
    error.value = null

    try {
      const account = await service.createBankAccount(data)
      currentAccount.value = account
      await loadAccounts()
      return account
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create bank account'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateAccount(
    id: string,
    updates: Partial<BankAccountData>
  ): Promise<BankAccount> {
    isLoading.value = true
    error.value = null

    try {
      const account = await service.updateBankAccount(id, updates)
      if (currentAccount.value?.id === id) {
        currentAccount.value = account
      }
      await loadAccounts()
      return account
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update bank account'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAccount(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await service.deleteBankAccount(id)
      if (currentAccount.value?.id === id) {
        currentAccount.value = null
      }
      await loadAccounts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete bank account'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loadAccount(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const account = await service.getBankAccount(id)
      if (!account) {
        throw new Error(`Bank account not found: ${id}`)
      }
      currentAccount.value = account
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load bank account'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loadAccounts(filters?: BankAccountFilters): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      accounts.value = await service.getBankAccounts(filters)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load bank accounts'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function setDefaultAccount(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const account = await service.setDefaultBankAccount(id)
      if (currentAccount.value?.id === id) {
        currentAccount.value = account
      }
      await loadAccounts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to set default account'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function clearCurrentAccount(): void {
    currentAccount.value = null
    error.value = null
  }

  // Auto-load accounts if requested
  if (options.autoLoad) {
    loadAccounts()
  }

  return {
    // State
    currentAccount: currentAccount as Ref<BankAccount | null>,
    accounts: accounts as Ref<BankAccount[]>,
    isLoading,
    error,

    // Computed
    defaultAccount: defaultAccount as unknown as Ref<BankAccount | null>,
    accountCount,

    // Actions
    createAccount,
    updateAccount,
    deleteAccount,
    loadAccount,
    loadAccounts,
    setDefaultAccount,
    clearCurrentAccount,
  }
}
