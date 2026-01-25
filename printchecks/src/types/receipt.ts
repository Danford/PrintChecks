// Receipt and line item type definitions
import type { BaseEntity, Money } from './common'

export interface LineItem extends BaseEntity {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category?: string
  taxable: boolean
  taxRate?: number
  taxAmount?: number
  discountAmount?: number
  notes?: string
}

export interface TaxInfo {
  taxRate: number
  taxAmount: number
  taxType: 'sales' | 'vat' | 'gst' | 'other'
  taxId?: string
  description?: string
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed'
  value: number
  amount: number
  description?: string
  code?: string
}

export interface PaymentMetadata {
  invoiceNumber?: string
  purchaseOrderNumber?: string
  referenceNumber?: string
  projectCode?: string
  departmentCode?: string
  customerNumber?: string
  vendorNumber?: string
  terms?: string
  dueDate?: string
  notes?: string
  tags?: string[]
}

export interface ReceiptTotals {
  subtotal: number
  totalTax: number
  totalDiscount: number
  shippingAmount: number
  handlingAmount: number
  grandTotal: number
}

export interface ReceiptData extends BaseEntity {
  // Basic receipt information
  receiptNumber: string
  date: string
  
  // Line items
  lineItems: LineItem[]
  
  // Totals
  totals: ReceiptTotals
  
  // Tax information
  taxes: TaxInfo[]
  
  // Discounts
  discounts: DiscountInfo[]
  
  // Payment metadata
  metadata: PaymentMetadata
  
  // Billing information
  billTo: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    country?: string
    email?: string
    phone?: string
  }
  
  // Shipping information (optional)
  shipTo?: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    country?: string
    shippingMethod?: string
    trackingNumber?: string
  }
  
  // Payment information
  paymentInfo: {
    method: 'check' | 'cash' | 'credit' | 'debit' | 'transfer' | 'other'
    checkNumber?: string
    amount: number
    currency: string
    exchangeRate?: number
  }
  
  // Additional settings
  settings: {
    showLineNumbers: boolean
    showTaxDetails: boolean
    showDiscountDetails: boolean
    includeNotes: boolean
    currency: string
    locale: string
  }
  
  // Relationships
  checkId?: string
  customizationId?: string
}

export interface ReceiptTemplate extends BaseEntity {
  name: string
  description?: string
  category: 'service' | 'retail' | 'wholesale' | 'professional' | 'custom'
  template: Partial<ReceiptData>
  isDefault?: boolean
}

export interface PaymentRecord extends BaseEntity {
  // Combined check and receipt data
  checkData: any // Will reference CheckData
  receiptData?: ReceiptData
  
  // Combined totals and validation
  totalAmount: number
  amount?: number
  currency: string
  date?: string
  
  // Status and metadata
  status: 'draft' | 'completed' | 'void' | 'cancelled'
  createdBy?: string
  approvedBy?: string
  approvedAt?: Date
  
  // Print history
  printHistory: {
    printedAt: Date
    printType: 'check' | 'receipt' | 'combined'
    printedBy?: string
  }[]
  
  // Audit trail
  auditTrail: {
    action: string
    timestamp: Date
    userId?: string
    details?: any
  }[]
}

// Receipt validation
export interface ReceiptValidation {
  lineItems: boolean
  totals: boolean
  taxes: boolean
  billTo: boolean
  paymentInfo: boolean
  overall: boolean
  errors: string[]
  warnings: string[]
}

// Line item calculation helpers
export interface LineItemCalculation {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
}

export interface ReceiptCalculation {
  lineItemTotals: LineItemCalculation[]
  subtotal: number
  totalTax: number
  totalDiscount: number
  grandTotal: number
  amountDue: number
  amountPaid: number
  balance: number
}
