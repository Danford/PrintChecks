/**
 * Vue composable for receipt management
 * Provides reactive state management for receipts using the core library
 */

import { ref, computed, type Ref } from 'vue'
import { ReceiptService, type ReceiptFilters } from '@printchecks/core/services'
import type { Receipt, ReceiptData, LineItemData } from '@printchecks/core/models'
import type { StorageAdapter } from '@printchecks/core/storage'

export interface UseReceiptsOptions {
  storage: StorageAdapter
  autoIncrementReceiptNumber?: boolean
  autoLoad?: boolean
}

export interface UseReceiptsReturn {
  // State
  currentReceipt: Ref<Receipt | null>
  receipts: Ref<Receipt[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Computed
  isValid: Ref<boolean>
  hasLineItems: Ref<boolean>
  receiptCount: Ref<number>

  // Actions
  createReceipt: (data?: Partial<ReceiptData>) => Promise<Receipt>
  updateReceipt: (updates: Partial<ReceiptData>) => Promise<void>
  deleteReceipt: (id: string) => Promise<void>
  loadReceipt: (id: string) => Promise<void>
  loadReceipts: (filters?: ReceiptFilters) => Promise<void>
  addLineItem: (itemData: LineItemData) => Promise<void>
  updateLineItem: (itemId: string, updates: Partial<LineItemData>) => Promise<void>
  removeLineItem: (itemId: string) => Promise<void>
  clearCurrentReceipt: () => void
}

/**
 * Composable for managing receipts in Vue applications
 */
export function useReceipts(options: UseReceiptsOptions): UseReceiptsReturn {
  const service = new ReceiptService({
    storage: options.storage,
    autoIncrementReceiptNumber: options.autoIncrementReceiptNumber,
  })

  // State
  const currentReceipt = ref<Receipt | null>(null)
  const receipts = ref<Receipt[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isValid = computed(() => {
    if (!currentReceipt.value) return false
    return currentReceipt.value.validate().isValid
  })

  const hasLineItems = computed(
    () => !!currentReceipt.value?.lineItems && currentReceipt.value.lineItems.length > 0
  )

  const receiptCount = computed(() => receipts.value.length)

  // Actions
  async function createReceipt(data: Partial<ReceiptData> = {}): Promise<Receipt> {
    isLoading.value = true
    error.value = null

    try {
      const receipt = await service.createReceipt(data)
      currentReceipt.value = receipt
      return receipt
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create receipt'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateReceipt(updates: Partial<ReceiptData>): Promise<void> {
    if (!currentReceipt.value || !currentReceipt.value.id) {
      throw new Error('No current receipt to update')
    }

    error.value = null

    try {
      const updated = await service.updateReceipt(currentReceipt.value.id, updates)
      currentReceipt.value = updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update receipt'
      throw e
    }
  }

  async function deleteReceipt(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await service.deleteReceipt(id)
      if (currentReceipt.value?.id === id) {
        currentReceipt.value = null
      }
      await loadReceipts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete receipt'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loadReceipt(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const receipt = await service.getReceipt(id)
      if (!receipt) {
        throw new Error(`Receipt not found: ${id}`)
      }
      currentReceipt.value = receipt
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load receipt'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function loadReceipts(filters?: ReceiptFilters): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      receipts.value = await service.getReceipts(filters)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load receipts'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function addLineItem(itemData: LineItemData): Promise<void> {
    if (!currentReceipt.value || !currentReceipt.value.id) {
      throw new Error('No current receipt to add line item to')
    }

    error.value = null

    try {
      const updated = await service.addLineItem(currentReceipt.value.id, itemData)
      currentReceipt.value = updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add line item'
      throw e
    }
  }

  async function updateLineItem(itemId: string, updates: Partial<LineItemData>): Promise<void> {
    if (!currentReceipt.value || !currentReceipt.value.id) {
      throw new Error('No current receipt to update line item in')
    }

    error.value = null

    try {
      const updated = await service.updateLineItem(currentReceipt.value.id, itemId, updates)
      currentReceipt.value = updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update line item'
      throw e
    }
  }

  async function removeLineItem(itemId: string): Promise<void> {
    if (!currentReceipt.value || !currentReceipt.value.id) {
      throw new Error('No current receipt to remove line item from')
    }

    error.value = null

    try {
      const updated = await service.removeLineItem(currentReceipt.value.id, itemId)
      currentReceipt.value = updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove line item'
      throw e
    }
  }

  function clearCurrentReceipt(): void {
    currentReceipt.value = null
    error.value = null
  }

  // Auto-load receipts if requested
  if (options.autoLoad) {
    loadReceipts()
  }

  return {
    // State
    currentReceipt: currentReceipt as Ref<Receipt | null>,
    receipts: receipts as Ref<Receipt[]>,
    isLoading,
    error,

    // Computed
    isValid,
    hasLineItems,
    receiptCount,

    // Actions
    createReceipt,
    updateReceipt,
    deleteReceipt,
    loadReceipt,
    loadReceipts,
    addLineItem,
    updateLineItem,
    removeLineItem,
    clearCurrentReceipt,
  }
}
