/**
 * Vendor model
 */

import type { BaseEntity } from './common'

export interface VendorData extends BaseEntity {
  // Basic information
  name: string
  displayName?: string
  
  // Address
  address: string
  city: string
  state: string
  zip: string
  country?: string
  
  // Contact information
  email?: string
  phone?: string
  fax?: string
  website?: string
  
  // Business information
  taxId?: string
  businessNumber?: string
  accountNumber?: string
  
  // Payment preferences
  paymentTerms?: string
  preferredPaymentMethod?: 'check' | 'cash' | 'transfer' | 'other'
  
  // Categories and tags
  category?: string
  tags?: string[]
  
  // Metadata
  notes?: string
  isActive?: boolean
  isFavorite?: boolean
}

export class Vendor implements VendorData {
  id?: string
  createdAt?: Date
  updatedAt?: Date
  
  name: string
  displayName?: string
  
  address: string
  city: string
  state: string
  zip: string
  country?: string
  
  email?: string
  phone?: string
  fax?: string
  website?: string
  
  taxId?: string
  businessNumber?: string
  accountNumber?: string
  
  paymentTerms?: string
  preferredPaymentMethod?: 'check' | 'cash' | 'transfer' | 'other'
  
  category?: string
  tags?: string[]
  
  notes?: string
  isActive?: boolean
  isFavorite?: boolean

  constructor(data: VendorData) {
    Object.assign(this, data)
    if (!this.id) {
      this.id = Vendor.generateId()
    }
    if (!this.createdAt) {
      this.createdAt = new Date()
    }
    this.updatedAt = new Date()
    this.isActive = this.isActive !== false // Default to true
    this.tags = this.tags || []
  }

  /**
   * Validate vendor data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.name?.trim()) {
      errors.push('Vendor name is required')
    }
    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email address')
    }
    if (this.phone && !this.isValidPhone(this.phone)) {
      errors.push('Invalid phone number')
    }
    if (this.website && !this.isValidWebsite(this.website)) {
      errors.push('Invalid website URL')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  /**
   * Validate phone format (flexible)
   */
  private isValidPhone(phone: string): boolean {
    // Remove formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
    return /^\+?\d{10,15}$/.test(cleaned)
  }

  /**
   * Validate website URL
   */
  private isValidWebsite(website: string): boolean {
    try {
      new URL(website)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get full address as single string
   */
  getFullAddress(): string {
    const parts = [
      this.address,
      this.city,
      this.state,
      this.zip,
      this.country
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  /**
   * Get display name (falls back to name)
   */
  getDisplayName(): string {
    return this.displayName || this.name
  }

  /**
   * Add a tag
   */
  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = []
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag)
      this.updatedAt = new Date()
    }
  }

  /**
   * Remove a tag
   */
  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag)
      this.updatedAt = new Date()
    }
  }

  /**
   * Check if vendor has a specific tag
   */
  hasTag(tag: string): boolean {
    return this.tags ? this.tags.includes(tag) : false
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON(): VendorData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      displayName: this.displayName,
      address: this.address,
      city: this.city,
      state: this.state,
      zip: this.zip,
      country: this.country,
      email: this.email,
      phone: this.phone,
      fax: this.fax,
      website: this.website,
      taxId: this.taxId,
      businessNumber: this.businessNumber,
      accountNumber: this.accountNumber,
      paymentTerms: this.paymentTerms,
      preferredPaymentMethod: this.preferredPaymentMethod,
      category: this.category,
      tags: this.tags,
      notes: this.notes,
      isActive: this.isActive,
      isFavorite: this.isFavorite
    }
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: VendorData): Vendor {
    return new Vendor(data)
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}
