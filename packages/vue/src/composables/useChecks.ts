/**
 * Vue composable for check management
 * Provides reactive state management for checks using the core library
 */

import { ref, computed, watch, type Ref } from 'vue'
import { CheckService, type CheckFilters } from '@printchecks/core/services'
import type { Check, CheckData } from '@printchecks/core/models'
import type { StorageAdapter } from '@printchecks/core/storage'
import { amountToWords } from '@printchecks/core/utils'

export interface UseChecksOptions {
  storage: StorageAdapter
  autoIncrementCheckNumber?: boolean
  defaultCurrency?: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY'
  autoLoad?: boolean
}

export interface UseChecksReturn {
  // State
  currentCheck: Ref<Check | null>
  checks: Ref<Check[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  hasUnsavedChanges: Ref<boolean>
  
  // Computed
  isValid: Ref<boolean>
  amountInWords: Ref<string>
  nextCheckNumber: Ref<string>
  
  // Actions
  createCheck: (data?: Partial<CheckData>) => Promise<Check>
  updateCheck: (updates: Partial<CheckData>) => Promise<void>
  saveCheck: () => Promise<boolean>
  deleteCheck: (id: string) => Promise<void>
  loadCheck: (id: string) => Promise<void>
  loadChecks: (filters?: CheckFilters) => Promise<void>
  markAsPrinted: () => Promise<void>
  voidCheck: (reason?: string) => Promise<void>
  duplicateCheck: (newCheckNumber?: string) => Promise<Check>
  validateCheck: () => boolean
  clearCurrentCheck: () => void
}

/**
 * Composable for managing checks in Vue applications
 */
export function useChecks(options: UseChecksOptions): UseChecksReturn {
  const service = new CheckService({
    storage: options.storage,
    autoIncrementCheckNumber: options.autoIncrementCheckNumber,
    defaultCurrency: options.defaultCurrency
  })
  
  // State
  const currentCheck = ref<Check | null>(null)
  const checks = ref<Check[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasUnsavedChanges = ref(false)
  
  // Computed
  const isValid = computed(() => {
    if (!currentCheck.value) return false
    return currentCheck.value.validate().isValid
  })
  
  const amountInWords = computed(() => {
    if (!currentCheck.value) return ''
    try {
      const amount = typeof currentCheck.value.amount === 'string' 
        ? parseFloat(currentCheck.value.amount) 
        : currentCheck.value.amount
      return amountToWords(amount, currentCheck.value.currency)
    } catch (e) {
      console.error('Failed to convert amount to words:', e)
      return ''
    }
  })
  
  const nextCheckNumber = computed(() => {
    if (!checks.value.length) return '1001'
    const numbers = checks.value
      .map(c => parseInt(c.checkNumber))
      .filter(n => !isNaN(n))
    return numbers.length ? (Math.max(...numbers) + 1).toString() : '1001'
  })
  
  // Actions
  async function createCheck(data: Partial<CheckData> = {}): Promise<Check> {
    isLoading.value = true
    error.value = null
    
    try {
      const check = await service.createCheck(data)
      currentCheck.value = check
      hasUnsavedChanges.value = false
      return check
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create check'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function updateCheck(updates: Partial<CheckData>): Promise<void> {
    if (!currentCheck.value || !currentCheck.value.id) {
      throw new Error('No current check to update')
    }
    
    error.value = null
    
    try {
      const updated = await service.updateCheck(currentCheck.value.id, updates)
      currentCheck.value = updated
      hasUnsavedChanges.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update check'
      throw e
    }
  }
  
  async function saveCheck(): Promise<boolean> {
    if (!currentCheck.value) return false
    
    isLoading.value = true
    error.value = null
    
    try {
      // The check is already saved in the service, just mark as no unsaved changes
      hasUnsavedChanges.value = false
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save check'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  async function deleteCheck(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      await service.deleteCheck(id)
      if (currentCheck.value && currentCheck.value.id === id) {
        currentCheck.value = null
      }
      // Reload checks
      await loadChecks()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete check'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function loadCheck(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const check = await service.getCheck(id)
      if (!check) {
        throw new Error(`Check not found: ${id}`)
      }
      currentCheck.value = check
      hasUnsavedChanges.value = false
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load check'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function loadChecks(filters?: CheckFilters): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      checks.value = await service.getChecks(filters)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load checks'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function markAsPrinted(): Promise<void> {
    if (!currentCheck.value || !currentCheck.value.id) {
      throw new Error('No current check to mark as printed')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const updated = await service.markAsPrinted(currentCheck.value.id)
      currentCheck.value = updated
      hasUnsavedChanges.value = false
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to mark check as printed'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function voidCheck(reason?: string): Promise<void> {
    if (!currentCheck.value || !currentCheck.value.id) {
      throw new Error('No current check to void')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const updated = await service.voidCheck(currentCheck.value.id, reason)
      currentCheck.value = updated
      hasUnsavedChanges.value = false
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to void check'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  async function duplicateCheck(newCheckNumber?: string): Promise<Check> {
    if (!currentCheck.value || !currentCheck.value.id) {
      throw new Error('No current check to duplicate')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const duplicate = await service.duplicateCheck(currentCheck.value.id, newCheckNumber)
      currentCheck.value = duplicate
      hasUnsavedChanges.value = true
      return duplicate
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to duplicate check'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  
  function validateCheck(): boolean {
    if (!currentCheck.value) return false
    const validation = currentCheck.value.validate()
    if (!validation.isValid) {
      error.value = validation.errors.join(', ')
    }
    return validation.isValid
  }
  
  function clearCurrentCheck(): void {
    currentCheck.value = null
    hasUnsavedChanges.value = false
    error.value = null
  }
  
  // Auto-load checks if requested
  if (options.autoLoad) {
    loadChecks()
  }
  
  // Watch for changes to track unsaved state
  watch(currentCheck, () => {
    if (currentCheck.value) {
      hasUnsavedChanges.value = true
    }
  }, { deep: true })
  
  return {
    // State
    currentCheck: currentCheck as Ref<Check | null>,
    checks: checks as Ref<Check[]>,
    isLoading,
    error,
    hasUnsavedChanges,
    
    // Computed
    isValid,
    amountInWords,
    nextCheckNumber,
    
    // Actions
    createCheck,
    updateCheck,
    saveCheck,
    deleteCheck,
    loadCheck,
    loadChecks,
    markAsPrinted,
    voidCheck,
    duplicateCheck,
    validateCheck,
    clearCurrentCheck
  }
}
