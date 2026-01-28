import type { BaseEntity, PrintOptions } from './common'
import type { LineItem } from './receipt'

export interface CheckData extends BaseEntity {
  // Account holder information
  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string

  // Bank information
  bankName: string
  routingNumber: string
  bankAccountNumber: string

  // Check details
  checkNumber: string
  date: string
  amount: string | number
  payTo: string
  memo: string
  signature: string

  // Enhanced fields
  currency?: string
  amountInWords?: string

  // Metadata
  isVoid?: boolean
  isPrinted?: boolean
  printedAt?: Date

  // Relationships
  receiptId?: string
  customizationId?: string
  lineItems?: LineItem[]
  isSaved?: boolean
}

// Legacy check data for backward compatibility
export interface LegacyCheckData {
  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string
  checkNumber: string
  date: string
  bankName: string
  amount: string
  payTo: string
  memo: string
  signature: string
  routingNumber: string
  bankAccountNumber: string
  lineLength?: number
}

export interface CheckTemplate extends BaseEntity {
  name: string
  description?: string
  checkData: Partial<CheckData>
  customizationId?: string
  isDefault?: boolean
}

export interface CheckValidation {
  accountHolderName: boolean
  bankName: boolean
  routingNumber: boolean
  bankAccountNumber: boolean
  checkNumber: boolean
  amount: boolean
  payTo: boolean
  date: boolean
}

export interface CheckHistory {
  checks: CheckData[]
  totalCount: number
  lastUpdated: Date
}

// Check printing states
export type CheckStatus = 'draft' | 'ready' | 'printed' | 'void' | 'cancelled'

export interface CheckPrintJob extends BaseEntity {
  checkId: string
  status: CheckStatus
  printOptions: PrintOptions
  printedAt?: Date
  errorMessage?: string
}
