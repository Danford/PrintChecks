/**
 * PrintChecks Core API
 * Main entry point for the PrintChecks library
 */

import type { StorageAdapter } from './storage/StorageAdapter'
import { LocalStorageAdapter } from './storage/LocalStorageAdapter'
import { SecureStorageAdapter } from './storage/SecureStorageAdapter'
import { CheckService, type CheckFilters } from './services/CheckService'
import { VendorService, type VendorFilters } from './services/VendorService'
import { BankAccountService, type BankAccountFilters } from './services/BankAccountService'
import { ReceiptService, type ReceiptFilters } from './services/ReceiptService'
import type { CheckData, Check } from './models/Check'
import type { VendorData, Vendor } from './models/Vendor'
import type { BankAccountData, BankAccount } from './models/BankAccount'
import type { ReceiptData, Receipt, LineItemData } from './models/Receipt'
import type { Currency } from './models/common'

export interface PrintChecksCoreConfig {
  /**
   * Storage adapter (defaults to LocalStorage)
   */
  storage?: StorageAdapter
  
  /**
   * Storage options
   */
  storageOptions?: {
    prefix?: string
    encryption?: boolean
    password?: string
  }
  
  /**
   * Auto-increment check numbers
   */
  autoIncrementCheckNumber?: boolean
  
  /**
   * Auto-increment receipt numbers
   */
  autoIncrementReceiptNumber?: boolean
  
  /**
   * Default currency
   */
  defaultCurrency?: Currency
  
  /**
   * Enable debug logging
   */
  debug?: boolean
}

export class PrintChecksCore {
  private storage: StorageAdapter
  private debug: boolean
  
  // Services
  public checks: CheckService
  public vendors: VendorService
  public bankAccounts: BankAccountService
  public receipts: ReceiptService

  constructor(config: PrintChecksCoreConfig = {}) {
    this.debug = config.debug || false
    
    // Initialize storage
    this.storage = this.initializeStorage(config)
    
    // Initialize services
    this.checks = new CheckService({
      storage: this.storage,
      autoIncrementCheckNumber: config.autoIncrementCheckNumber,
      defaultCurrency: config.defaultCurrency
    })
    
    this.vendors = new VendorService({
      storage: this.storage
    })
    
    this.bankAccounts = new BankAccountService({
      storage: this.storage
    })
    
    this.receipts = new ReceiptService({
      storage: this.storage,
      autoIncrementReceiptNumber: config.autoIncrementReceiptNumber
    })
    
    this.log('PrintChecksCore initialized')
  }

  /**
   * Initialize storage adapter
   */
  private initializeStorage(config: PrintChecksCoreConfig): StorageAdapter {
    if (config.storage) {
      return config.storage
    }
    
    // Create default storage adapter
    const baseStorage = new LocalStorageAdapter({
      prefix: config.storageOptions?.prefix || 'printchecks_'
    })
    
    // Wrap with encryption if enabled
    if (config.storageOptions?.encryption && config.storageOptions?.password) {
      const secureStorage = new SecureStorageAdapter(baseStorage, {
        encryption: true,
        password: config.storageOptions.password,
        autoMigrate: true
      })
      
      // Initialize encryption synchronously to prevent race condition
      // Services will need to wait for initialization before accessing storage
      secureStorage.initialize(config.storageOptions.password).then(() => {
        this.log('Encryption initialized successfully')
      }).catch(error => {
        console.error('Failed to initialize encryption:', error)
        throw new Error('Encryption initialization failed: ' + error.message)
      })
      
      return secureStorage
    }
    
    return baseStorage
  }

  // ===================
  // Check Methods
  // ===================

  async createCheck(data: Partial<CheckData>): Promise<Check> {
    return this.checks.createCheck(data)
  }

  async getCheck(id: string): Promise<Check | null> {
    return this.checks.getCheck(id)
  }

  async getChecks(filters?: CheckFilters): Promise<Check[]> {
    return this.checks.getChecks(filters)
  }

  async updateCheck(id: string, updates: Partial<CheckData>): Promise<Check> {
    return this.checks.updateCheck(id, updates)
  }

  async deleteCheck(id: string): Promise<void> {
    return this.checks.deleteCheck(id)
  }

  async markCheckAsPrinted(id: string): Promise<Check> {
    return this.checks.markAsPrinted(id)
  }

  async voidCheck(id: string, reason?: string): Promise<Check> {
    return this.checks.voidCheck(id, reason)
  }

  async duplicateCheck(id: string, newCheckNumber?: string): Promise<Check> {
    return this.checks.duplicateCheck(id, newCheckNumber)
  }

  async getNextCheckNumber(): Promise<string> {
    return this.checks.getNextCheckNumber()
  }

  // ===================
  // Vendor Methods
  // ===================

  async createVendor(data: VendorData): Promise<Vendor> {
    return this.vendors.createVendor(data)
  }

  async getVendor(id: string): Promise<Vendor | null> {
    return this.vendors.getVendor(id)
  }

  async getVendors(filters?: VendorFilters): Promise<Vendor[]> {
    return this.vendors.getVendors(filters)
  }

  async updateVendor(id: string, updates: Partial<VendorData>): Promise<Vendor> {
    return this.vendors.updateVendor(id, updates)
  }

  async deleteVendor(id: string): Promise<void> {
    return this.vendors.deleteVendor(id)
  }

  async searchVendors(searchTerm: string): Promise<Vendor[]> {
    return this.vendors.searchVendors(searchTerm)
  }

  async getFavoriteVendors(): Promise<Vendor[]> {
    return this.vendors.getFavoriteVendors()
  }

  async toggleVendorFavorite(id: string): Promise<Vendor> {
    return this.vendors.toggleFavorite(id)
  }

  // ===================
  // Bank Account Methods
  // ===================

  async createBankAccount(data: BankAccountData): Promise<BankAccount> {
    return this.bankAccounts.createBankAccount(data)
  }

  async getBankAccount(id: string): Promise<BankAccount | null> {
    return this.bankAccounts.getBankAccount(id)
  }

  async getBankAccounts(filters?: BankAccountFilters): Promise<BankAccount[]> {
    return this.bankAccounts.getBankAccounts(filters)
  }

  async updateBankAccount(id: string, updates: Partial<BankAccountData>): Promise<BankAccount> {
    return this.bankAccounts.updateBankAccount(id, updates)
  }

  async deleteBankAccount(id: string): Promise<void> {
    return this.bankAccounts.deleteBankAccount(id)
  }

  async getDefaultBankAccount(): Promise<BankAccount | null> {
    return this.bankAccounts.getDefaultBankAccount()
  }

  async setDefaultBankAccount(id: string): Promise<BankAccount> {
    return this.bankAccounts.setDefaultBankAccount(id)
  }

  // ===================
  // Receipt Methods
  // ===================

  async createReceipt(data: Partial<ReceiptData>): Promise<Receipt> {
    return this.receipts.createReceipt(data)
  }

  async getReceipt(id: string): Promise<Receipt | null> {
    return this.receipts.getReceipt(id)
  }

  async getReceipts(filters?: ReceiptFilters): Promise<Receipt[]> {
    return this.receipts.getReceipts(filters)
  }

  async updateReceipt(id: string, updates: Partial<ReceiptData>): Promise<Receipt> {
    return this.receipts.updateReceipt(id, updates)
  }

  async deleteReceipt(id: string): Promise<void> {
    return this.receipts.deleteReceipt(id)
  }

  async addLineItem(receiptId: string, itemData: LineItemData): Promise<Receipt> {
    return this.receipts.addLineItem(receiptId, itemData)
  }

  async updateLineItem(receiptId: string, itemId: string, updates: Partial<LineItemData>): Promise<Receipt> {
    return this.receipts.updateLineItem(receiptId, itemId, updates)
  }

  async removeLineItem(receiptId: string, itemId: string): Promise<Receipt> {
    return this.receipts.removeLineItem(receiptId, itemId)
  }

  // ===================
  // Analytics & Reporting
  // ===================

  async getCheckStatistics() {
    return this.checks.getStatistics()
  }

  async getVendorStatistics() {
    return this.vendors.getStatistics()
  }

  async getBankAccountStatistics() {
    return this.bankAccounts.getStatistics()
  }

  async getReceiptStatistics() {
    return this.receipts.getStatistics()
  }

  async getAllStatistics() {
    const [checkStats, vendorStats, accountStats, receiptStats] = await Promise.all([
      this.getCheckStatistics(),
      this.getVendorStatistics(),
      this.getBankAccountStatistics(),
      this.getReceiptStatistics()
    ])

    return {
      checks: checkStats,
      vendors: vendorStats,
      bankAccounts: accountStats,
      receipts: receiptStats
    }
  }

  // ===================
  // Data Management
  // ===================

  /**
   * Export all data
   */
  async exportData() {
    const [checks, vendors, bankAccounts, receipts] = await Promise.all([
      this.checks.getAllChecks(),
      this.vendors.getAllVendors(),
      this.bankAccounts.getAllBankAccounts(),
      this.receipts.getAllReceipts()
    ])

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        checks,
        vendors,
        bankAccounts,
        receipts
      }
    }
  }

  /**
   * Import data
   */
  async importData(data: {
    checks?: CheckData[]
    vendors?: VendorData[]
    bankAccounts?: BankAccountData[]
    receipts?: ReceiptData[]
  }) {
    const results = {
      checks: { success: 0, failed: 0 },
      vendors: { success: 0, failed: 0 },
      bankAccounts: { success: 0, failed: 0 },
      receipts: { success: 0, failed: 0 }
    }

    if (data.checks) {
      for (const check of data.checks) {
        try {
          await this.checks.createCheck(check)
          results.checks.success++
        } catch (error) {
          results.checks.failed++
        }
      }
    }

    if (data.vendors) {
      results.vendors = await this.vendors.importVendors(data.vendors)
    }

    if (data.bankAccounts) {
      results.bankAccounts = await this.bankAccounts.importBankAccounts(data.bankAccounts)
    }

    if (data.receipts) {
      results.receipts = await this.receipts.importReceipts(data.receipts)
    }

    return results
  }

  /**
   * Clear all data (use with caution!)
   */
  async clearAllData() {
    await Promise.all([
      this.checks.clearAll(),
      this.vendors.clearAll(),
      this.bankAccounts.clearAll(),
      this.receipts.clearAll()
    ])
    
    this.log('All data cleared')
  }

  /**
   * Get storage instance (for advanced use cases)
   */
  getStorage(): StorageAdapter {
    return this.storage
  }

  /**
   * Enable encryption (requires password)
   */
  async enableEncryption(password: string): Promise<void> {
    if (this.storage instanceof SecureStorageAdapter) {
      await this.storage.migrateToEncrypted(password)
      this.log('Encryption enabled')
    } else {
      throw new Error('Storage adapter does not support encryption')
    }
  }

  /**
   * Disable encryption (requires password)
   */
  async disableEncryption(password: string): Promise<void> {
    if (this.storage instanceof SecureStorageAdapter) {
      await this.storage.migrateToPlainText(password)
      this.log('Encryption disabled')
    } else {
      throw new Error('Storage adapter does not support encryption')
    }
  }

  /**
   * Change encryption password
   */
  async changeEncryptionPassword(oldPassword: string, newPassword: string): Promise<void> {
    if (this.storage instanceof SecureStorageAdapter) {
      await this.storage.changePassword(oldPassword, newPassword)
      this.log('Encryption password changed')
    } else {
      throw new Error('Storage adapter does not support encryption')
    }
  }

  /**
   * Log debug messages
   */
  private log(message: string, ...args: any[]) {
    if (this.debug) {
      console.log(`[PrintChecksCore] ${message}`, ...args)
    }
  }
}
