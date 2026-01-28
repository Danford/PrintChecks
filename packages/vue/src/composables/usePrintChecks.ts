/**
 * Main Vue composable for PrintChecks
 * Provides unified access to all PrintChecks services
 */

import { ref, type Ref } from 'vue'
import { PrintChecksCore, type PrintChecksCoreConfig } from '@printchecks/core'
import { useChecks, type UseChecksReturn } from './useChecks'
import { useVendors, type UseVendorsReturn } from './useVendors'
import { useBankAccounts, type UseBankAccountsReturn } from './useBankAccounts'
import { useReceipts, type UseReceiptsReturn } from './useReceipts'

export interface UsePrintChecksReturn {
  // Core instance (not reactive)
  core: PrintChecksCore

  // Service composables
  checks: UseChecksReturn
  vendors: UseVendorsReturn
  bankAccounts: UseBankAccountsReturn
  receipts: UseReceiptsReturn

  // Global state
  isInitialized: Ref<boolean>

  // Actions
  exportData: () => Promise<unknown>
  importData: (data: unknown) => Promise<unknown>
  clearAllData: () => Promise<void>
  enableEncryption: (password: string) => Promise<void>
  disableEncryption: (password: string) => Promise<void>
  changeEncryptionPassword: (oldPassword: string, newPassword: string) => Promise<void>
}

/**
 * Main composable for using PrintChecks in Vue applications
 * Provides unified access to all services and features
 */
export function usePrintChecks(config: PrintChecksCoreConfig = {}): UsePrintChecksReturn {
  // Initialize core (not reactive - it's a service class)
  const core = new PrintChecksCore(config)
  const isInitialized = ref(true)

  // Initialize service composables
  const storage = core.getStorage()

  const checks = useChecks({
    storage,
    autoIncrementCheckNumber: config.autoIncrementCheckNumber,
    defaultCurrency: config.defaultCurrency,
    autoLoad: false,
  })

  const vendors = useVendors({
    storage,
    autoLoad: false,
  })

  const bankAccounts = useBankAccounts({
    storage,
    autoLoad: false,
  })

  const receipts = useReceipts({
    storage,
    autoIncrementReceiptNumber: config.autoIncrementReceiptNumber,
    autoLoad: false,
  })

  // Data management actions
  async function exportData() {
    return core.exportData()
  }

  async function importData(data: unknown) {
    return core.importData(data)
  }

  async function clearAllData() {
    await core.clearAllData()
    // Reload all data
    await Promise.all([
      checks.loadChecks(),
      vendors.loadVendors(),
      bankAccounts.loadAccounts(),
      receipts.loadReceipts(),
    ])
  }

  async function enableEncryption(password: string) {
    await core.enableEncryption(password)
  }

  async function disableEncryption(password: string) {
    await core.disableEncryption(password)
  }

  async function changeEncryptionPassword(oldPassword: string, newPassword: string) {
    await core.changeEncryptionPassword(oldPassword, newPassword)
  }

  return {
    // Core instance
    core,

    // Service composables
    checks,
    vendors,
    bankAccounts,
    receipts,

    // Global state
    isInitialized,

    // Actions
    exportData,
    importData,
    clearAllData,
    enableEncryption,
    disableEncryption,
    changeEncryptionPassword,
  }
}
