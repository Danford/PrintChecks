// Common types used across the application

export interface BaseEntity {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FileUpload {
  file: File
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

export interface AppSettings {
  theme: 'light' | 'dark'
  autoSave: boolean
  defaultPrintOptions: PrintOptions
  language: string
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD'

export interface Money {
  amount: number
  currency: Currency
}
