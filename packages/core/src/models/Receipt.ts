/**
 * Receipt and Line Item models
 */

import type { BaseEntity, Currency } from './common'

export interface LineItemData extends BaseEntity {
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

export class LineItem implements LineItemData {
  id?: string
  createdAt?: Date
  updatedAt?: Date
  
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

  constructor(data: LineItemData) {
    Object.assign(this, data)
    if (!this.id) {
      this.id = LineItem.generateId()
    }
    if (!this.createdAt) {
      this.createdAt = new Date()
    }
    this.updatedAt = new Date()
    
    // Calculate total if not provided
    if (this.totalPrice === undefined) {
      this.calculateTotal()
    }
  }

  /**
   * Calculate total price based on quantity and unit price
   */
  calculateTotal(): void {
    this.totalPrice = this.quantity * this.unitPrice
    
    // Apply tax if taxable
    if (this.taxable && this.taxRate) {
      this.taxAmount = this.totalPrice * (this.taxRate / 100)
      this.totalPrice += this.taxAmount
    }
    
    // Apply discount
    if (this.discountAmount) {
      this.totalPrice -= this.discountAmount
    }
    
    this.updatedAt = new Date()
  }

  toJSON(): LineItemData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      totalPrice: this.totalPrice,
      category: this.category,
      taxable: this.taxable,
      taxRate: this.taxRate,
      taxAmount: this.taxAmount,
      discountAmount: this.discountAmount,
      notes: this.notes
    }
  }

  static fromJSON(data: LineItemData): LineItem {
    return new LineItem(data)
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export interface ReceiptTotals {
  subtotal: number
  totalTax: number
  totalDiscount: number
  shippingAmount: number
  handlingAmount: number
  grandTotal: number
}

export interface BillToInfo {
  name: string
  address: string
  city: string
  state: string
  zip: string
  country?: string
  email?: string
  phone?: string
}

export interface PaymentInfo {
  method: 'check' | 'cash' | 'credit' | 'debit' | 'transfer' | 'other'
  checkNumber?: string
  amount: number
  currency: Currency
  exchangeRate?: number
}

export interface ReceiptData extends BaseEntity {
  receiptNumber: string
  date: string
  lineItems: LineItemData[]
  totals: ReceiptTotals
  billTo: BillToInfo
  paymentInfo: PaymentInfo
  notes?: string
  checkId?: string
  vendorId?: string
  customizationId?: string
}

export class Receipt implements ReceiptData {
  id?: string
  createdAt?: Date
  updatedAt?: Date
  
  receiptNumber: string
  date: string
  lineItems: LineItemData[]
  totals: ReceiptTotals
  billTo: BillToInfo
  paymentInfo: PaymentInfo
  notes?: string
  checkId?: string
  vendorId?: string
  customizationId?: string

  constructor(data: ReceiptData) {
    Object.assign(this, data)
    if (!this.id) {
      this.id = Receipt.generateId()
    }
    if (!this.createdAt) {
      this.createdAt = new Date()
    }
    this.updatedAt = new Date()
    
    // Initialize lineItems if not provided (prevents crash in calculateTotals)
    this.lineItems = this.lineItems || []
    
    // Calculate totals if not provided
    if (!this.totals) {
      this.calculateTotals()
    }
  }

  /**
   * Validate receipt data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.receiptNumber?.trim()) {
      errors.push('Receipt number is required')
    }
    if (!this.date) {
      errors.push('Date is required')
    }
    if (!this.lineItems || this.lineItems.length === 0) {
      errors.push('At least one line item is required')
    }
    if (!this.billTo?.name?.trim()) {
      errors.push('Bill to name is required')
    }
    if (!this.paymentInfo?.amount || this.paymentInfo.amount <= 0) {
      errors.push('Payment amount must be greater than 0')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Add a line item
   */
  addLineItem(item: LineItemData): void {
    this.lineItems.push(item)
    this.calculateTotals()
    this.updatedAt = new Date()
  }

  /**
   * Remove a line item
   */
  removeLineItem(itemId: string): void {
    this.lineItems = this.lineItems.filter(item => item.id !== itemId)
    this.calculateTotals()
    this.updatedAt = new Date()
  }

  /**
   * Update a line item
   */
  updateLineItem(itemId: string, updates: Partial<LineItemData>): void {
    const index = this.lineItems.findIndex(item => item.id === itemId)
    if (index >= 0) {
      this.lineItems[index] = { ...this.lineItems[index], ...updates }
      const lineItem = new LineItem(this.lineItems[index])
      lineItem.calculateTotal()
      this.lineItems[index] = lineItem.toJSON()
      this.calculateTotals()
      this.updatedAt = new Date()
    }
  }

  /**
   * Calculate receipt totals
   */
  calculateTotals(): void {
    let subtotal = 0
    let totalTax = 0
    let totalDiscount = 0

    for (const item of this.lineItems) {
      const itemSubtotal = item.quantity * item.unitPrice
      subtotal += itemSubtotal
      
      if (item.taxAmount) {
        totalTax += item.taxAmount
      }
      
      if (item.discountAmount) {
        totalDiscount += item.discountAmount
      }
    }

    const shippingAmount = this.totals?.shippingAmount || 0
    const handlingAmount = this.totals?.handlingAmount || 0
    const grandTotal = subtotal + totalTax - totalDiscount + shippingAmount + handlingAmount

    this.totals = {
      subtotal,
      totalTax,
      totalDiscount,
      shippingAmount,
      handlingAmount,
      grandTotal
    }

    this.updatedAt = new Date()
  }

  /**
   * Set shipping amount
   */
  setShippingAmount(amount: number): void {
    if (!this.totals) {
      this.calculateTotals()
    }
    this.totals.shippingAmount = amount
    this.calculateTotals()
  }

  /**
   * Set handling amount
   */
  setHandlingAmount(amount: number): void {
    if (!this.totals) {
      this.calculateTotals()
    }
    this.totals.handlingAmount = amount
    this.calculateTotals()
  }

  toJSON(): ReceiptData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      receiptNumber: this.receiptNumber,
      date: this.date,
      lineItems: this.lineItems,
      totals: this.totals,
      billTo: this.billTo,
      paymentInfo: this.paymentInfo,
      notes: this.notes,
      checkId: this.checkId,
      vendorId: this.vendorId,
      customizationId: this.customizationId
    }
  }

  static fromJSON(data: ReceiptData): Receipt {
    return new Receipt(data)
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}
