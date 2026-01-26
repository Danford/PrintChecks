/**
 * @printchecks/web-components
 * Framework-agnostic Web Components for PrintChecks
 */

// Export components
export { PrintChecksCheckForm } from './components/check-form'
export { PrintChecksCheckPreview } from './components/check-preview'
export { PrintChecksVendorList } from './components/vendor-list'
export { PrintChecksVendorForm } from './components/vendor-form'
export { PrintChecksBankAccountList } from './components/bank-account-list'
export { PrintChecksBankAccountForm } from './components/bank-account-form'
// TODO: Fix receipt-form to match Receipt model structure (BillToInfo, PaymentInfo, ReceiptTotals)
// export { PrintChecksReceiptForm } from './components/receipt-form'

// Export base classes and utilities
export { PrintChecksComponent, PrintChecksConfig } from './utils/component-base'

// Re-export core types for convenience
export type {
  Check,
  CheckData,
  Receipt,
  ReceiptData,
  Vendor,
  VendorData,
  BankAccount,
  BankAccountData,
  LineItem,
} from '@printchecks/core'

/**
 * Initialize all PrintChecks web components
 * This function is called automatically when the module is imported
 */
export function initializePrintChecksComponents(): void {
  // Components are already registered via their module side effects
  // This function exists for explicit initialization if needed
  console.log('PrintChecks Web Components initialized')
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  // Components register themselves automatically when imported
  console.log('PrintChecks Web Components loaded')
}
