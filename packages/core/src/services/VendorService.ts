/**
 * Vendor Service - Business logic for vendor management
 */

import { Vendor, type VendorData } from '../models/Vendor'
import type { StorageAdapter } from '../storage/StorageAdapter'

const STORAGE_KEY = 'vendors'

export interface VendorFilters {
  category?: string
  tags?: string[]
  isActive?: boolean
  isFavorite?: boolean
  searchTerm?: string
}

export interface VendorServiceConfig {
  storage: StorageAdapter
}

export class VendorService {
  private storage: StorageAdapter

  constructor(config: VendorServiceConfig) {
    this.storage = config.storage
  }

  /**
   * Create a new vendor
   */
  async createVendor(data: VendorData): Promise<Vendor> {
    const vendor = new Vendor(data)

    // Validate
    const validation = vendor.validate()
    if (!validation.isValid) {
      throw new Error(`Vendor validation failed: ${validation.errors.join(', ')}`)
    }

    // Save to storage
    await this.saveVendor(vendor)

    return vendor
  }

  /**
   * Get a vendor by ID
   */
  async getVendor(id: string): Promise<Vendor | null> {
    const vendors = await this.getAllVendors()
    const vendorData = vendors.find(v => v.id === id)
    return vendorData ? Vendor.fromJSON(vendorData) : null
  }

  /**
   * Get all vendors
   */
  async getAllVendors(): Promise<VendorData[]> {
    const data = await this.storage.get<string>(STORAGE_KEY)
    if (!data) return []
    
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing vendors from storage:', error)
      return []
    }
  }

  /**
   * Get vendors with filters
   */
  async getVendors(filters?: VendorFilters): Promise<Vendor[]> {
    const allVendors = await this.getAllVendors()
    let filtered = allVendors

    if (filters) {
      filtered = allVendors.filter(vendorData => {
        // Category filter
        if (filters.category && vendorData.category !== filters.category) {
          return false
        }

        // Tags filter (vendor must have ALL specified tags)
        if (filters.tags && filters.tags.length > 0) {
          if (!vendorData.tags || !filters.tags.every(tag => vendorData.tags?.includes(tag))) {
            return false
          }
        }

        // Active status filter
        if (filters.isActive !== undefined && vendorData.isActive !== filters.isActive) {
          return false
        }

        // Favorite filter
        if (filters.isFavorite !== undefined && vendorData.isFavorite !== filters.isFavorite) {
          return false
        }

        // Search term filter
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase()
          return (
            vendorData.name?.toLowerCase().includes(term) ||
            vendorData.displayName?.toLowerCase().includes(term) ||
            vendorData.email?.toLowerCase().includes(term) ||
            vendorData.phone?.toLowerCase().includes(term) ||
            vendorData.businessNumber?.toLowerCase().includes(term)
          )
        }

        return true
      })
    }

    return filtered.map(data => Vendor.fromJSON(data))
  }

  /**
   * Update a vendor
   */
  async updateVendor(id: string, updates: Partial<VendorData>): Promise<Vendor> {
    const vendor = await this.getVendor(id)
    if (!vendor) {
      throw new Error(`Vendor with ID ${id} not found`)
    }

    // Apply updates
    Object.assign(vendor, updates)
    vendor.updatedAt = new Date()

    // Validate
    const validation = vendor.validate()
    if (!validation.isValid) {
      throw new Error(`Vendor validation failed: ${validation.errors.join(', ')}`)
    }

    // Save
    await this.saveVendor(vendor)

    return vendor
  }

  /**
   * Delete a vendor
   */
  async deleteVendor(id: string): Promise<void> {
    const vendors = await this.getAllVendors()
    const filtered = vendors.filter(v => v.id !== id)
    
    await this.storage.set(STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Search vendors by name
   */
  async searchVendors(searchTerm: string): Promise<Vendor[]> {
    return this.getVendors({ searchTerm })
  }

  /**
   * Get vendors by category
   */
  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    return this.getVendors({ category })
  }

  /**
   * Get favorite vendors
   */
  async getFavoriteVendors(): Promise<Vendor[]> {
    return this.getVendors({ isFavorite: true })
  }

  /**
   * Get active vendors
   */
  async getActiveVendors(): Promise<Vendor[]> {
    return this.getVendors({ isActive: true })
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const vendors = await this.getAllVendors()
    const categories = new Set<string>()
    
    for (const vendor of vendors) {
      if (vendor.category) {
        categories.add(vendor.category)
      }
    }
    
    return Array.from(categories).sort()
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const vendors = await this.getAllVendors()
    const tags = new Set<string>()
    
    for (const vendor of vendors) {
      if (vendor.tags) {
        vendor.tags.forEach(tag => tags.add(tag))
      }
    }
    
    return Array.from(tags).sort()
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<Vendor> {
    const vendor = await this.getVendor(id)
    if (!vendor) {
      throw new Error(`Vendor with ID ${id} not found`)
    }

    vendor.isFavorite = !vendor.isFavorite
    vendor.updatedAt = new Date()
    
    await this.saveVendor(vendor)
    return vendor
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string): Promise<Vendor> {
    const vendor = await this.getVendor(id)
    if (!vendor) {
      throw new Error(`Vendor with ID ${id} not found`)
    }

    vendor.isActive = !vendor.isActive
    vendor.updatedAt = new Date()
    
    await this.saveVendor(vendor)
    return vendor
  }

  /**
   * Add tag to vendor
   */
  async addTag(id: string, tag: string): Promise<Vendor> {
    const vendor = await this.getVendor(id)
    if (!vendor) {
      throw new Error(`Vendor with ID ${id} not found`)
    }

    vendor.addTag(tag)
    await this.saveVendor(vendor)
    return vendor
  }

  /**
   * Remove tag from vendor
   */
  async removeTag(id: string, tag: string): Promise<Vendor> {
    const vendor = await this.getVendor(id)
    if (!vendor) {
      throw new Error(`Vendor with ID ${id} not found`)
    }

    vendor.removeTag(tag)
    await this.saveVendor(vendor)
    return vendor
  }

  /**
   * Get vendor statistics
   */
  async getStatistics(): Promise<{
    total: number
    active: number
    inactive: number
    favorites: number
    byCategory: Record<string, number>
  }> {
    const vendors = await this.getAllVendors()

    const stats = {
      total: vendors.length,
      active: 0,
      inactive: 0,
      favorites: 0,
      byCategory: {} as Record<string, number>
    }

    for (const vendor of vendors) {
      if (vendor.isActive) stats.active++
      else stats.inactive++
      
      if (vendor.isFavorite) stats.favorites++
      
      if (vendor.category) {
        stats.byCategory[vendor.category] = (stats.byCategory[vendor.category] || 0) + 1
      }
    }

    return stats
  }

  /**
   * Save vendor to storage
   */
  private async saveVendor(vendor: Vendor): Promise<void> {
    const vendors = await this.getAllVendors()
    const index = vendors.findIndex(v => v.id === vendor.id)

    if (index >= 0) {
      vendors[index] = vendor.toJSON()
    } else {
      vendors.push(vendor.toJSON())
    }

    await this.storage.set(STORAGE_KEY, JSON.stringify(vendors))
  }

  /**
   * Import vendors from array
   */
  async importVendors(vendorsData: VendorData[]): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const data of vendorsData) {
      try {
        await this.createVendor(data)
        success++
      } catch (error) {
        console.error('Failed to import vendor:', error)
        failed++
      }
    }

    return { success, failed }
  }

  /**
   * Export all vendors
   */
  async exportVendors(): Promise<VendorData[]> {
    return this.getAllVendors()
  }

  /**
   * Clear all vendors (use with caution)
   */
  async clearAll(): Promise<void> {
    await this.storage.remove(STORAGE_KEY)
  }
}
