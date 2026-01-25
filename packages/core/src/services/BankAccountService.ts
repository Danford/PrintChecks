/**
 * Bank Account Service - Business logic for bank account management
 */

import { BankAccount, type BankAccountData } from '../models/BankAccount'
import type { StorageAdapter } from '../storage/StorageAdapter'

const STORAGE_KEY = 'bankAccounts'

export interface BankAccountFilters {
  accountType?: 'checking' | 'savings' | 'business'
  isActive?: boolean
  searchTerm?: string
}

export interface BankAccountServiceConfig {
  storage: StorageAdapter
}

export class BankAccountService {
  private storage: StorageAdapter

  constructor(config: BankAccountServiceConfig) {
    this.storage = config.storage
  }

  /**
   * Create a new bank account
   */
  async createBankAccount(data: BankAccountData): Promise<BankAccount> {
    const account = new BankAccount(data)

    // Validate
    const validation = account.validate()
    if (!validation.isValid) {
      throw new Error(`Bank account validation failed: ${validation.errors.join(', ')}`)
    }

    // If this is marked as default, unset other defaults
    if (account.isDefault) {
      await this.clearDefaultAccounts()
    }

    // If this is the first account, make it default
    const existingAccounts = await this.getAllBankAccounts()
    if (existingAccounts.length === 0) {
      account.isDefault = true
    }

    // Save to storage
    await this.saveBankAccount(account)

    return account
  }

  /**
   * Get a bank account by ID
   */
  async getBankAccount(id: string): Promise<BankAccount | null> {
    const accounts = await this.getAllBankAccounts()
    const accountData = accounts.find(a => a.id === id)
    return accountData ? BankAccount.fromJSON(accountData) : null
  }

  /**
   * Get all bank accounts
   */
  async getAllBankAccounts(): Promise<BankAccountData[]> {
    const data = await this.storage.get<string>(STORAGE_KEY)
    if (!data) return []
    
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing bank accounts from storage:', error)
      return []
    }
  }

  /**
   * Get bank accounts with filters
   */
  async getBankAccounts(filters?: BankAccountFilters): Promise<BankAccount[]> {
    const allAccounts = await this.getAllBankAccounts()
    let filtered = allAccounts

    if (filters) {
      filtered = allAccounts.filter(accountData => {
        // Account type filter
        if (filters.accountType && accountData.accountType !== filters.accountType) {
          return false
        }

        // Active status filter
        if (filters.isActive !== undefined && accountData.isActive !== filters.isActive) {
          return false
        }

        // Search term filter
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase()
          return (
            accountData.accountHolderName?.toLowerCase().includes(term) ||
            accountData.bankName?.toLowerCase().includes(term) ||
            accountData.nickname?.toLowerCase().includes(term) ||
            accountData.accountNumber?.toLowerCase().includes(term)
          )
        }

        return true
      })
    }

    return filtered.map(data => BankAccount.fromJSON(data))
  }

  /**
   * Update a bank account
   */
  async updateBankAccount(id: string, updates: Partial<BankAccountData>): Promise<BankAccount> {
    const account = await this.getBankAccount(id)
    if (!account) {
      throw new Error(`Bank account with ID ${id} not found`)
    }

    // If setting as default, unset other defaults first
    if (updates.isDefault === true) {
      await this.clearDefaultAccounts(id)
    }

    // Apply updates
    Object.assign(account, updates)
    account.updatedAt = new Date()

    // Validate
    const validation = account.validate()
    if (!validation.isValid) {
      throw new Error(`Bank account validation failed: ${validation.errors.join(', ')}`)
    }

    // Save
    await this.saveBankAccount(account)

    return account
  }

  /**
   * Delete a bank account
   */
  async deleteBankAccount(id: string): Promise<void> {
    const account = await this.getBankAccount(id)
    if (!account) {
      throw new Error(`Bank account with ID ${id} not found`)
    }

    const accounts = await this.getAllBankAccounts()
    const filtered = accounts.filter(a => a.id !== id)
    
    // If deleted account was default and there are other accounts, make the first one default
    if (account.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true
    }

    await this.storage.set(STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Get default bank account
   */
  async getDefaultBankAccount(): Promise<BankAccount | null> {
    const accounts = await this.getAllBankAccounts()
    const defaultAccount = accounts.find(a => a.isDefault)
    
    if (defaultAccount) {
      return BankAccount.fromJSON(defaultAccount)
    }
    
    // If no default but accounts exist, return the first one
    if (accounts.length > 0) {
      return BankAccount.fromJSON(accounts[0])
    }
    
    return null
  }

  /**
   * Set default bank account
   */
  async setDefaultBankAccount(id: string): Promise<BankAccount> {
    return this.updateBankAccount(id, { isDefault: true })
  }

  /**
   * Get active bank accounts
   */
  async getActiveBankAccounts(): Promise<BankAccount[]> {
    return this.getBankAccounts({ isActive: true })
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string): Promise<BankAccount> {
    const account = await this.getBankAccount(id)
    if (!account) {
      throw new Error(`Bank account with ID ${id} not found`)
    }

    account.isActive = !account.isActive
    account.updatedAt = new Date()
    
    await this.saveBankAccount(account)
    return account
  }

  /**
   * Search bank accounts
   */
  async searchBankAccounts(searchTerm: string): Promise<BankAccount[]> {
    return this.getBankAccounts({ searchTerm })
  }

  /**
   * Get bank account statistics
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    byType: Record<string, number>
  }> {
    const accounts = await this.getAllBankAccounts()

    const stats = {
      total: accounts.length,
      active: 0,
      inactive: 0,
      byType: {} as Record<string, number>
    }

    for (const account of accounts) {
      if (account.isActive) stats.active++
      else stats.inactive++
      
      if (account.accountType) {
        stats.byType[account.accountType] = (stats.byType[account.accountType] || 0) + 1
      }
    }

    return stats
  }

  /**
   * Clear default flag from all accounts except the specified one
   */
  private async clearDefaultAccounts(exceptId?: string): Promise<void> {
    const accounts = await this.getAllBankAccounts()
    let modified = false

    for (const account of accounts) {
      if (account.id !== exceptId && account.isDefault) {
        account.isDefault = false
        modified = true
      }
    }

    if (modified) {
      await this.storage.set(STORAGE_KEY, JSON.stringify(accounts))
    }
  }

  /**
   * Save bank account to storage
   */
  private async saveBankAccount(account: BankAccount): Promise<void> {
    const accounts = await this.getAllBankAccounts()
    const index = accounts.findIndex(a => a.id === account.id)

    if (index >= 0) {
      accounts[index] = account.toJSON()
    } else {
      accounts.push(account.toJSON())
    }

    await this.storage.set(STORAGE_KEY, JSON.stringify(accounts))
  }

  /**
   * Import bank accounts from array
   */
  async importBankAccounts(accountsData: BankAccountData[]): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const data of accountsData) {
      try {
        await this.createBankAccount(data)
        success++
      } catch (error) {
        console.error('Failed to import bank account:', error)
        failed++
      }
    }

    return { success, failed }
  }

  /**
   * Export all bank accounts
   */
  async exportBankAccounts(): Promise<BankAccountData[]> {
    return this.getAllBankAccounts()
  }

  /**
   * Clear all bank accounts (use with caution)
   */
  async clearAll(): Promise<void> {
    await this.storage.remove(STORAGE_KEY)
  }
}
