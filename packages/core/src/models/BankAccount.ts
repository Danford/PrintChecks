/**
 * Bank Account model
 */

import type { BaseEntity, FileUpload } from './common'

export interface BankAccountData extends BaseEntity {
  // Account holder information
  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string
  accountHolderCountry?: string

  // Bank information
  bankName: string
  routingNumber: string
  accountNumber: string
  accountType?: 'checking' | 'savings' | 'business'

  // Additional information
  branchName?: string
  branchAddress?: string
  swiftCode?: string
  ibanNumber?: string

  // Logo/branding
  bankLogo?: FileUpload

  // Metadata
  nickname?: string
  notes?: string
  isDefault?: boolean
  isActive?: boolean
}

export class BankAccount implements BankAccountData {
  id?: string
  createdAt?: Date
  updatedAt?: Date

  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string
  accountHolderCountry?: string

  bankName: string
  routingNumber: string
  accountNumber: string
  accountType?: 'checking' | 'savings' | 'business'

  branchName?: string
  branchAddress?: string
  swiftCode?: string
  ibanNumber?: string

  bankLogo?: FileUpload

  nickname?: string
  notes?: string
  isDefault?: boolean
  isActive?: boolean

  constructor(data: BankAccountData) {
    Object.assign(this, data)
    if (!this.id) {
      this.id = BankAccount.generateId()
    }
    if (!this.createdAt) {
      this.createdAt = new Date()
    }
    this.updatedAt = new Date()
    this.isActive = this.isActive !== false // Default to true
  }

  /**
   * Validate bank account data
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
    if (!this.accountNumber?.trim()) {
      errors.push('Account number is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate routing number format
   */
  private isValidRoutingNumber(): boolean {
    return /^\d{9}$/.test(this.routingNumber)
  }

  /**
   * Get masked account number for display
   */
  getMaskedAccountNumber(): string {
    if (!this.accountNumber) return ''
    const length = this.accountNumber.length
    if (length <= 4) return this.accountNumber
    return '****' + this.accountNumber.slice(-4)
  }

  /**
   * Get full address as single string
   */
  getFullAddress(): string {
    const parts = [
      this.accountHolderAddress,
      this.accountHolderCity,
      this.accountHolderState,
      this.accountHolderZip,
      this.accountHolderCountry,
    ].filter(Boolean)

    return parts.join(', ')
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON(): BankAccountData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      accountHolderName: this.accountHolderName,
      accountHolderAddress: this.accountHolderAddress,
      accountHolderCity: this.accountHolderCity,
      accountHolderState: this.accountHolderState,
      accountHolderZip: this.accountHolderZip,
      accountHolderCountry: this.accountHolderCountry,
      bankName: this.bankName,
      routingNumber: this.routingNumber,
      accountNumber: this.accountNumber,
      accountType: this.accountType,
      branchName: this.branchName,
      branchAddress: this.branchAddress,
      swiftCode: this.swiftCode,
      ibanNumber: this.ibanNumber,
      bankLogo: this.bankLogo,
      nickname: this.nickname,
      notes: this.notes,
      isDefault: this.isDefault,
      isActive: this.isActive,
    }
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: BankAccountData): BankAccount {
    return new BankAccount(data)
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}
