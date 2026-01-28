/**
 * Vue composable for vendor management
 * Provides reactive state management for vendors using the core library
 */

import { ref, computed, type Ref } from 'vue'
import { VendorService, type VendorFilters } from '@printchecks/core/services'
import type { Vendor, VendorData } from '@printchecks/core/models'
import type { StorageAdapter } from '@printchecks/core/storage'

export interface UseVendorsOptions {
  storage: StorageAdapter
  autoLoad?: boolean
}

export interface UseVendorsReturn {
  // State
  currentVendor: Ref<Vendor | null>
  vendors: Ref<Vendor[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  
  // Computed
  favoriteVendors: Ref<Vendor[]>
  vendorCount: Ref<number>
  
  // Actions
  createVendor: (data: VendorData) => Promise<Vendor>
  updateVendor: (id: string, updates: Partial<VendorData>) => Promise<Vendor>
  deleteVendor: (id: string) => Promise<void>
  loadVendor: (id: string) => Promise<void>
  loadVendors: (filters?: VendorFilters) => Promise<void>
  searchVendors: (searchTerm: string) => Promise<Vendor[]>
  toggleFavorite: (id: string) => Promise<void>
  addTag: (id: string, tag: string) => Promise<void>
  removeTag: (id: string, tag: string) => Promise<void>
  clearCurrentVendor: () => void
}

/**
 * Composable for managing vendors in Vue applications
 */
export function useVendors(options: UseVendorsOptions): UseVendorsReturn {
  const service = new VendorService({
    storage: options.storage
  })
  
  // State
  const currentVendor = ref<Vendor | null>(null)
  const vendors = ref<Vendor[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed
  const favoriteVendors = computed(() => 
    vendors.value.filter(v => v.isFavorite)
  )
  
  const vendorCount = computed(() => vendors.value.length)
  
  // Actions
  async function createVendor(data: VendorData): Promise<Vendor> {
    isLoading.value = true
    error.value = null
    
    try {
      const vendor = await service.createVendor(data)
      currentVendor.value = vendor
      await loadVendors()
      return vendor
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create vendor'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateVendor(id: string, updates: Partial<VendorData>): Promise<Vendor> {
    isLoading.value = true
    error.value = null
    
    try {
      const vendor = await service.updateVendor(id, updates)
      if (currentVendor.value?.id === id) {
        currentVendor.value = vendor
      }
      await loadVendors()
      return vendor
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update vendor'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteVendor(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      await service.deleteVendor(id)
      if (currentVendor.value?.id === id) {
        currentVendor.value = null
      }
      await loadVendors()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete vendor'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function loadVendor(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const vendor = await service.getVendor(id)
      if (!vendor) {
        throw new Error(`Vendor not found: ${id}`)
      }
      currentVendor.value = vendor
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load vendor'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function loadVendors(filters?: VendorFilters): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      vendors.value = await service.getVendors(filters)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load vendors'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function searchVendors(searchTerm: string): Promise<Vendor[]> {
    isLoading.value = true
    error.value = null
    
    try {
      return await service.searchVendors(searchTerm)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to search vendors'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function toggleFavorite(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const vendor = await service.toggleFavorite(id)
      if (currentVendor.value?.id === id) {
        currentVendor.value = vendor
      }
      await loadVendors()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to toggle favorite'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function addTag(id: string, tag: string): Promise<void> {
    const vendor = await service.getVendor(id)
    if (!vendor) throw new Error('Vendor not found')
    
    vendor.addTag(tag)
    await updateVendor(id, { tags: vendor.tags })
  }
  
  async function removeTag(id: string, tag: string): Promise<void> {
    const vendor = await service.getVendor(id)
    if (!vendor) throw new Error('Vendor not found')
    
    vendor.removeTag(tag)
    await updateVendor(id, { tags: vendor.tags })
  }
  
  function clearCurrentVendor(): void {
    currentVendor.value = null
    error.value = null
  }
  
  // Auto-load vendors if requested
  if (options.autoLoad) {
    loadVendors()
  }
  
  return {
    // State
    currentVendor: currentVendor as Ref<Vendor | null>,
    vendors: vendors as Ref<Vendor[]>,
    isLoading,
    error,
    
    // Computed
    favoriteVendors: favoriteVendors as unknown as Ref<Vendor[]>,
    vendorCount,
    
    // Actions
    createVendor,
    updateVendor,
    deleteVendor,
    loadVendor,
    loadVendors,
    searchVendors,
    toggleFavorite,
    addTag,
    removeTag,
    clearCurrentVendor
  }
}
