/**
 * Mock for @printchecks/core used in web-component tests.
 * Provides stub implementations of all services so components can initialize
 * without a real storage backend.
 */

import { vi } from 'vitest'

export const mockReceipts = {
  createReceipt: vi.fn(),
  updateReceipt: vi.fn(),
  getReceipt: vi.fn(),
  getReceipts: vi.fn(),
  deleteReceipt: vi.fn(),
}

export const mockVendors = {
  createVendor: vi.fn(),
  updateVendor: vi.fn(),
  getVendor: vi.fn(),
  getVendors: vi.fn(),
  deleteVendor: vi.fn(),
}

export const mockChecks = {
  createCheck: vi.fn(),
  updateCheck: vi.fn(),
  getCheck: vi.fn(),
  getChecks: vi.fn(),
  deleteCheck: vi.fn(),
}

export const mockBankAccounts = {
  createBankAccount: vi.fn(),
  updateBankAccount: vi.fn(),
  getBankAccount: vi.fn(),
  getBankAccounts: vi.fn(),
  deleteBankAccount: vi.fn(),
}

export class PrintChecksCore {
  receipts = mockReceipts
  vendors = mockVendors
  checks = mockChecks
  bankAccounts = mockBankAccounts
  // Convenience methods used by components (delegates to service objects in real core)
  getChecks = vi.fn()
  getVendors = vi.fn()

  constructor(_config?: unknown) {}
}

// Minimal model stubs — tests only use these as type witnesses
export class Receipt {
  id?: string
  receiptNumber = ''
  date = ''
  lineItems = []
  totals = { subtotal: 0, totalTax: 0, totalDiscount: 0, shippingAmount: 0, handlingAmount: 0, grandTotal: 0 }
  billTo = { name: '', address: '', city: '', state: '', zip: '' }
  paymentInfo = { method: 'check' as const, amount: 0, currency: 'USD' as const }
  notes?: string
}

export class Check {
  id?: string
  checkNumber = ''
  date = ''
  payTo = ''
  amount = '0'
  memo = ''
  signature = ''
  accountHolderName = ''
  bankName = ''
  routingNumber = ''
  bankAccountNumber = ''
  accountHolderAddress = ''
  accountHolderCity = ''
  accountHolderState = ''
  accountHolderZip = ''

  validate(): { isValid: boolean; errors: string[] } {
    return { isValid: true, errors: [] }
  }
}

export class Vendor {
  id?: string
  name = ''
  displayName?: string
  email?: string
  phone?: string
  taxId?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  notes?: string
}

export class BankAccount {
  id?: string
  accountHolderName = ''
  bankName = ''
  routingNumber = ''
  accountNumber = ''
  accountHolderAddress = ''
  accountHolderCity = ''
  accountHolderState = ''
  accountHolderZip = ''
  isDefault?: boolean
  notes?: string
}

export class LineItem {
  id?: string
  description = ''
  quantity = 1
  unitPrice = 0
  totalPrice = 0
  taxable = false
}

// Type aliases used in the components
export type PrintChecksCoreConfig = unknown
export type ReceiptData = InstanceType<typeof Receipt>
export type CheckData = InstanceType<typeof Check>
export type VendorData = InstanceType<typeof Vendor>
export type BankAccountData = InstanceType<typeof BankAccount>
export type LineItemData = InstanceType<typeof LineItem>

export const VERSION = '1.0.0'
