/**
 * Check Service - Business logic for check management
 */

import { Check, type CheckData, type CheckStatus } from '../models/Check'
import type { StorageAdapter } from '../storage/StorageAdapter'
import { amountToWords } from '../utils/formatting'
import type { Currency } from '../models/common'

const STORAGE_KEY = 'checks'

export interface CheckFilters {
  status?: CheckStatus
  vendorId?: string
  bankAccountId?: string
  fromDate?: Date
  toDate?: Date
  minAmount?: number
  maxAmount?: number
  searchTerm?: string
}

export interface CheckServiceConfig {
  storage: StorageAdapter
  autoIncrementCheckNumber?: boolean
  defaultCurrency?: Currency
}

export class CheckService {
  private storage: StorageAdapter
  private autoIncrementCheckNumber: boolean
  private defaultCurrency: Currency

  constructor(config: CheckServiceConfig) {
    this.storage = config.storage
    this.autoIncrementCheckNumber = config.autoIncrementCheckNumber !== false
    this.defaultCurrency = config.defaultCurrency || 'USD'
  }

  /**
   * Create a new check
   */
  async createCheck(data: Partial<CheckData>): Promise<Check> {
    // Auto-increment check number if enabled
    if (this.autoIncrementCheckNumber && !data.checkNumber) {
      data.checkNumber = await this.getNextCheckNumber()
    }

    // Set default date if not provided
    if (!data.date) {
      data.date = new Date().toLocaleDateString()
    }

    // Set default currency
    if (!data.currency) {
      data.currency = this.defaultCurrency
    }

    // Create check instance
    const check = new Check(data as CheckData)

    // Convert amount to words
    if (data.amount) {
      check.amountInWords = amountToWords(data.amount, check.currency)
    }

    // Validate
    const validation = check.validate()
    if (!validation.isValid) {
      throw new Error(`Check validation failed: ${validation.errors.join(', ')}`)
    }

    // Save to storage
    await this.saveCheck(check)

    return check
  }

  /**
   * Get a check by ID
   */
  async getCheck(id: string): Promise<Check | null> {
    const checks = await this.getAllChecks()
    const checkData = checks.find((c) => c.id === id)
    return checkData ? Check.fromJSON(checkData) : null
  }

  /**
   * Get all checks
   */
  async getAllChecks(): Promise<CheckData[]> {
    const data = await this.storage.get<string>(STORAGE_KEY)
    if (!data) return []

    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing checks from storage:', error)
      return []
    }
  }

  /**
   * Get checks with filters
   */
  async getChecks(filters?: CheckFilters): Promise<Check[]> {
    const allChecks = await this.getAllChecks()
    let filtered = allChecks

    if (filters) {
      filtered = allChecks.filter((checkData) => {
        // Status filter
        if (filters.status && checkData.status !== filters.status) {
          return false
        }

        // Vendor filter
        if (filters.vendorId && checkData.vendorId !== filters.vendorId) {
          return false
        }

        // Bank account filter
        if (filters.bankAccountId && checkData.bankAccountId !== filters.bankAccountId) {
          return false
        }

        // Date range filter
        if (filters.fromDate || filters.toDate) {
          const checkDate = new Date(checkData.date)
          if (filters.fromDate && checkDate < filters.fromDate) {
            return false
          }
          if (filters.toDate && checkDate > filters.toDate) {
            return false
          }
        }

        // Amount range filter
        if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
          const amount =
            typeof checkData.amount === 'string' ? parseFloat(checkData.amount) : checkData.amount

          if (filters.minAmount !== undefined && amount < filters.minAmount) {
            return false
          }
          if (filters.maxAmount !== undefined && amount > filters.maxAmount) {
            return false
          }
        }

        // Search term filter
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase()
          return (
            checkData.payTo?.toLowerCase().includes(term) ||
            checkData.memo?.toLowerCase().includes(term) ||
            checkData.checkNumber?.toLowerCase().includes(term)
          )
        }

        return true
      })
    }

    return filtered.map((data) => Check.fromJSON(data))
  }

  /**
   * Update a check
   */
  async updateCheck(id: string, updates: Partial<CheckData>): Promise<Check> {
    const check = await this.getCheck(id)
    if (!check) {
      throw new Error(`Check with ID ${id} not found`)
    }

    // Prevent ID overwrite vulnerability
    const safeUpdates = { ...updates }
    delete safeUpdates.id
    delete safeUpdates.createdAt

    // Apply updates
    Object.assign(check, safeUpdates)
    check.updatedAt = new Date()

    // Recalculate amount in words if amount changed
    if (updates.amount) {
      check.amountInWords = amountToWords(updates.amount, check.currency)
    }

    // Validate
    const validation = check.validate()
    if (!validation.isValid) {
      throw new Error(`Check validation failed: ${validation.errors.join(', ')}`)
    }

    // Save
    await this.saveCheck(check)

    return check
  }

  /**
   * Delete a check
   */
  async deleteCheck(id: string): Promise<void> {
    const checks = await this.getAllChecks()
    const filtered = checks.filter((c) => c.id !== id)

    await this.storage.set(STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Mark check as printed
   */
  async markAsPrinted(id: string): Promise<Check> {
    const check = await this.getCheck(id)
    if (!check) {
      throw new Error(`Check with ID ${id} not found`)
    }

    // Prevent printing voided checks
    if (check.isVoid) {
      throw new Error('Cannot print a voided check')
    }

    // Validate check can be printed
    if (!check.canBePrinted()) {
      throw new Error('Check cannot be printed. Check may already be printed or invalid.')
    }

    check.markAsPrinted()
    await this.saveCheck(check)

    return check
  }

  /**
   * Void a check
   */
  async voidCheck(id: string, reason?: string): Promise<Check> {
    const check = await this.getCheck(id)
    if (!check) {
      throw new Error(`Check with ID ${id} not found`)
    }

    if (!check.canBeVoided()) {
      throw new Error('Check cannot be voided')
    }

    check.void(reason)
    await this.saveCheck(check)

    return check
  }

  /**
   * Duplicate a check
   */
  async duplicateCheck(id: string, newCheckNumber?: string): Promise<Check> {
    const original = await this.getCheck(id)
    if (!original) {
      throw new Error(`Check with ID ${id} not found`)
    }

    // If no new check number provided, auto-increment
    const checkNumber =
      newCheckNumber ||
      (this.autoIncrementCheckNumber ? await this.getNextCheckNumber() : original.checkNumber)

    const duplicate = original.duplicate(checkNumber)

    // Validate duplicated check before saving
    const validation = duplicate.validate()
    if (!validation.isValid) {
      throw new Error(`Duplicated check validation failed: ${validation.errors.join(', ')}`)
    }

    await this.saveCheck(duplicate)

    return duplicate
  }

  /**
   * Get next check number
   */
  async getNextCheckNumber(): Promise<string> {
    const checks = await this.getAllChecks()

    if (checks.length === 0) {
      return '1000'
    }

    // Find highest numeric check number
    const numericCheckNumbers = checks.map((c) => parseInt(c.checkNumber)).filter((n) => !isNaN(n))

    if (numericCheckNumbers.length === 0) {
      return '1000'
    }

    const maxCheckNumber = Math.max(...numericCheckNumbers)
    return (maxCheckNumber + 1).toString()
  }

  /**
   * Get check statistics
   */
  async getStatistics(): Promise<{
    total: number
    printed: number
    void: number
    draft: number
    totalAmount: number
  }> {
    const checks = await this.getAllChecks()

    const stats = {
      total: checks.length,
      printed: 0,
      void: 0,
      draft: 0,
      totalAmount: 0,
    }

    for (const check of checks) {
      if (check.isPrinted) stats.printed++
      if (check.isVoid) stats.void++
      if (check.status === 'draft') stats.draft++

      if (!check.isVoid) {
        const amount = typeof check.amount === 'string' ? parseFloat(check.amount) : check.amount
        stats.totalAmount += amount
      }
    }

    return stats
  }

  /**
   * Save check to storage
   */
  private async saveCheck(check: Check): Promise<void> {
    const checks = await this.getAllChecks()
    const index = checks.findIndex((c) => c.id === check.id)

    if (index >= 0) {
      checks[index] = check.toJSON()
    } else {
      checks.push(check.toJSON())
    }

    await this.storage.set(STORAGE_KEY, JSON.stringify(checks))
  }

  /**
   * Load check from recent checks (for pre-filling)
   */
  async loadFromRecentCheck(): Promise<Partial<CheckData> | null> {
    const checks = await this.getAllChecks()
    if (checks.length === 0) return null

    const recent = checks[checks.length - 1]

    // Return only the fields that should be pre-filled
    return {
      accountHolderName: recent.accountHolderName,
      accountHolderAddress: recent.accountHolderAddress,
      accountHolderCity: recent.accountHolderCity,
      accountHolderState: recent.accountHolderState,
      accountHolderZip: recent.accountHolderZip,
      bankName: recent.bankName,
      routingNumber: recent.routingNumber,
      bankAccountNumber: recent.bankAccountNumber,
      signature: recent.signature,
      bankAccountId: recent.bankAccountId,
    }
  }

  /**
   * Clear all checks (use with caution)
   */
  async clearAll(): Promise<void> {
    await this.storage.remove(STORAGE_KEY)
  }
}
