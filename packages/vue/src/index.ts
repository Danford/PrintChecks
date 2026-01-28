/**
 * @printchecks/vue
 * Vue 3 integration layer for PrintChecks core library
 */

// Re-export everything from composables
export * from './composables'

// Re-export core types that are commonly used in Vue apps
export type {
  Check,
  CheckData,
  Vendor,
  VendorData,
  BankAccount,
  BankAccountData,
  Receipt,
  ReceiptData,
  LineItemData,
} from '@printchecks/core/models'

export type { StorageAdapter } from '@printchecks/core/storage'

export type { PrintChecksCoreConfig } from '@printchecks/core'
