/**
 * Receipt Service - Business logic for receipt management
 */

import { Receipt, type ReceiptData, type LineItemData } from '../models/Receipt'
import type { StorageAdapter } from '../storage/StorageAdapter'

const STORAGE_KEY = 'receipts'

export interface ReceiptFilters {
  fromDate?: Date
  toDate?: Date
  minAmount?: number
  maxAmount?: number
  checkId?: string
  vendorId?: string
  searchTerm?: string
}

export interface ReceiptServiceConfig {
  storage: StorageAdapter
  autoIncrementReceiptNumber?: boolean
}

export class ReceiptService {
  private storage: StorageAdapter
  private autoIncrementReceiptNumber: boolean

  constructor(config: ReceiptServiceConfig) {
    this.storage = config.storage
    this.autoIncrementReceiptNumber = config.autoIncrementReceiptNumber !== false
  }

  /**
   * Create a new receipt
   */
  async createReceipt(data: Partial<ReceiptData>): Promise<Receipt> {
    // Auto-increment receipt number if enabled
    if (this.autoIncrementReceiptNumber && !data.receiptNumber) {
      data.receiptNumber = await this.getNextReceiptNumber()
    }

    // Set default date if not provided
    if (!data.date) {
      data.date = new Date().toLocaleDateString()
    }

    // Initialize empty arrays if not provided
    if (!data.lineItems) {
      data.lineItems = []
    }

    // Create receipt instance
    const receipt = new Receipt(data as ReceiptData)

    // Validate
    const validation = receipt.validate()
    if (!validation.isValid) {
      throw new Error(`Receipt validation failed: ${validation.errors.join(', ')}`)
    }

    // Save to storage
    await this.saveReceipt(receipt)

    return receipt
  }

  /**
   * Get a receipt by ID
   */
  async getReceipt(id: string): Promise<Receipt | null> {
    const receipts = await this.getAllReceipts()
    const receiptData = receipts.find(r => r.id === id)
    return receiptData ? Receipt.fromJSON(receiptData) : null
  }

  /**
   * Get all receipts
   */
  async getAllReceipts(): Promise<ReceiptData[]> {
    const data = await this.storage.get<string>(STORAGE_KEY)
    if (!data) return []
    
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing receipts from storage:', error)
      return []
    }
  }

  /**
   * Get receipts with filters
   */
  async getReceipts(filters?: ReceiptFilters): Promise<Receipt[]> {
    const allReceipts = await this.getAllReceipts()
    let filtered = allReceipts

    if (filters) {
      filtered = allReceipts.filter(receiptData => {
        // Check ID filter
        if (filters.checkId && receiptData.checkId !== filters.checkId) {
          return false
        }

        // Vendor filter
        if (filters.vendorId && receiptData.vendorId !== filters.vendorId) {
          return false
        }

        // Date range filter
        if (filters.fromDate || filters.toDate) {
          const receiptDate = new Date(receiptData.date)
          if (filters.fromDate && receiptDate < filters.fromDate) {
            return false
          }
          if (filters.toDate && receiptDate > filters.toDate) {
            return false
          }
        }

        // Amount range filter
        if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
          const amount = receiptData.totals.grandTotal
          
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
            receiptData.receiptNumber?.toLowerCase().includes(term) ||
            receiptData.billTo?.name?.toLowerCase().includes(term) ||
            receiptData.notes?.toLowerCase().includes(term) ||
            receiptData.lineItems?.some(item => 
              item.description?.toLowerCase().includes(term)
            )
          )
        }

        return true
      })
    }

    return filtered.map(data => Receipt.fromJSON(data))
  }

  /**
   * Update a receipt
   */
  async updateReceipt(id: string, updates: Partial<ReceiptData>): Promise<Receipt> {
    const receipt = await this.getReceipt(id)
    if (!receipt) {
      throw new Error(`Receipt with ID ${id} not found`)
    }

    // Apply updates
    Object.assign(receipt, updates)
    receipt.updatedAt = new Date()

    // Recalculate totals if line items changed
    if (updates.lineItems) {
      receipt.calculateTotals()
    }

    // Validate
    const validation = receipt.validate()
    if (!validation.isValid) {
      throw new Error(`Receipt validation failed: ${validation.errors.join(', ')}`)
    }

    // Save
    await this.saveReceipt(receipt)

    return receipt
  }

  /**
   * Delete a receipt
   */
  async deleteReceipt(id: string): Promise<void> {
    const receipts = await this.getAllReceipts()
    const filtered = receipts.filter(r => r.id !== id)
    
    await this.storage.set(STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Add line item to receipt
   */
  async addLineItem(receiptId: string, itemData: LineItemData): Promise<Receipt> {
    const receipt = await this.getReceipt(receiptId)
    if (!receipt) {
      throw new Error(`Receipt with ID ${receiptId} not found`)
    }

    receipt.addLineItem(itemData)
    await this.saveReceipt(receipt)

    return receipt
  }

  /**
   * Update line item in receipt
   */
  async updateLineItem(
    receiptId: string, 
    itemId: string, 
    updates: Partial<LineItemData>
  ): Promise<Receipt> {
    const receipt = await this.getReceipt(receiptId)
    if (!receipt) {
      throw new Error(`Receipt with ID ${receiptId} not found`)
    }

    receipt.updateLineItem(itemId, updates)
    await this.saveReceipt(receipt)

    return receipt
  }

  /**
   * Remove line item from receipt
   */
  async removeLineItem(receiptId: string, itemId: string): Promise<Receipt> {
    const receipt = await this.getReceipt(receiptId)
    if (!receipt) {
      throw new Error(`Receipt with ID ${receiptId} not found`)
    }

    receipt.removeLineItem(itemId)
    await this.saveReceipt(receipt)

    return receipt
  }

  /**
   * Set shipping amount
   */
  async setShippingAmount(receiptId: string, amount: number): Promise<Receipt> {
    const receipt = await this.getReceipt(receiptId)
    if (!receipt) {
      throw new Error(`Receipt with ID ${receiptId} not found`)
    }

    receipt.setShippingAmount(amount)
    await this.saveReceipt(receipt)

    return receipt
  }

  /**
   * Set handling amount
   */
  async setHandlingAmount(receiptId: string, amount: number): Promise<Receipt> {
    const receipt = await this.getReceipt(receiptId)
    if (!receipt) {
      throw new Error(`Receipt with ID ${receiptId} not found`)
    }

    receipt.setHandlingAmount(amount)
    await this.saveReceipt(receipt)

    return receipt
  }

  /**
   * Get next receipt number
   */
  async getNextReceiptNumber(): Promise<string> {
    const receipts = await this.getAllReceipts()
    
    if (receipts.length === 0) {
      return 'R-1000'
    }

    // Find highest numeric receipt number (assuming format like "R-1000")
    const numericReceiptNumbers = receipts
      .map(r => {
        const match = r.receiptNumber.match(/\d+/)
        return match ? parseInt(match[0]) : null
      })
      .filter((n): n is number => n !== null)

    if (numericReceiptNumbers.length === 0) {
      return 'R-1000'
    }

    const maxReceiptNumber = Math.max(...numericReceiptNumbers)
    return `R-${maxReceiptNumber + 1}`
  }

  /**
   * Get receipts by check ID
   */
  async getReceiptsByCheckId(checkId: string): Promise<Receipt[]> {
    return this.getReceipts({ checkId })
  }

  /**
   * Get receipt statistics
   */
  async getStatistics(): Promise<{
    total: number
    totalAmount: number
    averageAmount: number
    totalItems: number
    averageItemsPerReceipt: number
  }> {
    const receipts = await this.getAllReceipts()

    let totalAmount = 0
    let totalItems = 0

    for (const receipt of receipts) {
      totalAmount += receipt.totals.grandTotal
      totalItems += receipt.lineItems.length
    }

    return {
      total: receipts.length,
      totalAmount,
      averageAmount: receipts.length > 0 ? totalAmount / receipts.length : 0,
      totalItems,
      averageItemsPerReceipt: receipts.length > 0 ? totalItems / receipts.length : 0
    }
  }

  /**
   * Save receipt to storage
   */
  private async saveReceipt(receipt: Receipt): Promise<void> {
    const receipts = await this.getAllReceipts()
    const index = receipts.findIndex(r => r.id === receipt.id)

    if (index >= 0) {
      receipts[index] = receipt.toJSON()
    } else {
      receipts.push(receipt.toJSON())
    }

    await this.storage.set(STORAGE_KEY, JSON.stringify(receipts))
  }

  /**
   * Import receipts from array
   */
  async importReceipts(receiptsData: ReceiptData[]): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const data of receiptsData) {
      try {
        await this.createReceipt(data)
        success++
      } catch (error) {
        console.error('Failed to import receipt:', error)
        failed++
      }
    }

    return { success, failed }
  }

  /**
   * Export all receipts
   */
  async exportReceipts(): Promise<ReceiptData[]> {
    return this.getAllReceipts()
  }

  /**
   * Clear all receipts (use with caution)
   */
  async clearAll(): Promise<void> {
    await this.storage.remove(STORAGE_KEY)
  }
}
