/**
 * Common types and interfaces used across the library
 */

export interface BaseEntity {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface FileUpload {
  file?: File
  url: string
  name: string
  size: number
  type: string
}

export interface PrintOptions {
  includeReceipt: boolean
  includeLineItems: boolean
  paperSize: 'letter' | 'legal' | 'a4'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY'

export interface Money {
  amount: number
  currency: Currency
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country?: string
}

export interface ContactInfo {
  email?: string
  phone?: string
  fax?: string
  website?: string
}
