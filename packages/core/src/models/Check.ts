/**
 * Check model
 */

import type { BaseEntity, Currency } from './common'

export type CheckStatus = 'draft' | 'ready' | 'printed' | 'void' | 'cancelled'

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
  currency?: Currency
  amountInWords?: string
  
  // Status tracking
  status?: CheckStatus
  isVoid?: boolean
  isPrinted?: boolean
  printedAt?: Date
  voidedAt?: Date
  voidReason?: string
  
  // Relationships
  receiptId?: string
  vendorId?: string
  customizationId?: string
  bankAccountId?: string
}

export class Check implements CheckData {
  id?: string
  createdAt?: Date
  updatedAt?: Date
  
  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string
  
  bankName: string
  routingNumber: string
  bankAccountNumber: string
  
  checkNumber: string
  date: string
  amount: string | number
  payTo: string
  memo: string
  signature: string
  
  currency?: Currency
  amountInWords?: string
  
  status?: CheckStatus
  isVoid?: boolean
  isPrinted?: boolean
  printedAt?: Date
  voidedAt?: Date
  voidReason?: string
  
  receiptId?: string
  vendorId?: string
  customizationId?: string
  bankAccountId?: string

  constructor(data: CheckData) {
    Object.assign(this, data)
    if (!this.id) {
      this.id = Check.generateId()
    }
    if (!this.createdAt) {
      this.createdAt = new Date()
    }
    this.updatedAt = new Date()
    this.status = this.status || 'draft'
    this.currency = this.currency || 'USD'
    this.isVoid = this.isVoid || false
    this.isPrinted = this.isPrinted || false
  }

  /**
   * Validate check data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.accountHolderName?.trim()) {
      errors.push('Account holder name is required')
    }
    if (!this.bankName?.trim()) {
      errors.push('Bank name is required')
    }
    if (!this.routingNumber || !this.isValidRoutingNumber()) {
      errors.push('Valid 9-digit routing number is required')
    }
    if (!this.bankAccountNumber?.trim()) {
      errors.push('Bank account number is required')
    }
    if (!this.checkNumber?.trim()) {
      errors.push('Check number is required')
    }
    if (!this.payTo?.trim()) {
      errors.push('Payee name is required')
    }
    if (!this.isValidAmount()) {
      errors.push('Valid amount greater than 0 is required')
    }
    if (!this.date || !this.isValidDate()) {
      errors.push('Valid date is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate routing number format
   */
  private isValidRoutingNumber(): boolean {
    return /^\d{9}$/.test(this.routingNumber)
  }

  /**
   * Validate amount
   */
  private isValidAmount(): boolean {
    const num = typeof this.amount === 'string' ? parseFloat(this.amount) : this.amount
    return !isNaN(num) && num > 0
  }

  /**
   * Validate date
   */
  private isValidDate(): boolean {
    if (!this.date) return false
    const parsed = new Date(this.date)
    return !isNaN(parsed.getTime())
  }

  /**
   * Get numeric amount
   */
  getNumericAmount(): number {
    return typeof this.amount === 'string' ? parseFloat(this.amount) : this.amount
  }

  /**
   * Mark check as printed
   */
  markAsPrinted(): void {
    this.isPrinted = true
    this.printedAt = new Date()
    this.status = 'printed'
    this.updatedAt = new Date()
  }

  /**
   * Void check
   */
  void(reason?: string): void {
    this.isVoid = true
    this.voidedAt = new Date()
    this.voidReason = reason
    this.status = 'void'
    this.updatedAt = new Date()
  }

  /**
   * Check if check can be printed
   */
  canBePrinted(): boolean {
    return !this.isVoid && !this.isPrinted && this.validate().isValid
  }

  /**
   * Check if check can be voided
   */
  canBeVoided(): boolean {
    return !this.isVoid
  }

  /**
   * Get full account holder address
   */
  getFullAddress(): string {
    const parts = [
      this.accountHolderAddress,
      this.accountHolderCity,
      this.accountHolderState,
      this.accountHolderZip
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  /**
   * Duplicate check with new check number
   */
  duplicate(newCheckNumber?: string): Check {
    const duplicateData = { ...this.toJSON() }
    
    // Reset fields for new check
    delete duplicateData.id
    delete duplicateData.createdAt
    delete duplicateData.updatedAt
    duplicateData.checkNumber = newCheckNumber || this.checkNumber
    duplicateData.date = new Date().toLocaleDateString()
    duplicateData.amount = '0.00'
    duplicateData.payTo = ''
    duplicateData.memo = ''
    duplicateData.isPrinted = false
    duplicateData.printedAt = undefined
    duplicateData.isVoid = false
    duplicateData.voidedAt = undefined
    duplicateData.voidReason = undefined
    duplicateData.status = 'draft'
    
    return new Check(duplicateData)
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON(): CheckData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      accountHolderName: this.accountHolderName,
      accountHolderAddress: this.accountHolderAddress,
      accountHolderCity: this.accountHolderCity,
      accountHolderState: this.accountHolderState,
      accountHolderZip: this.accountHolderZip,
      bankName: this.bankName,
      routingNumber: this.routingNumber,
      bankAccountNumber: this.bankAccountNumber,
      checkNumber: this.checkNumber,
      date: this.date,
      amount: this.amount,
      payTo: this.payTo,
      memo: this.memo,
      signature: this.signature,
      currency: this.currency,
      amountInWords: this.amountInWords,
      status: this.status,
      isVoid: this.isVoid,
      isPrinted: this.isPrinted,
      printedAt: this.printedAt,
      voidedAt: this.voidedAt,
      voidReason: this.voidReason,
      receiptId: this.receiptId,
      vendorId: this.vendorId,
      customizationId: this.customizationId,
      bankAccountId: this.bankAccountId
    }
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: CheckData): Check {
    return new Check(data)
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}
