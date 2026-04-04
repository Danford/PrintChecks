/**
 * Vue composable for printable check page
 * Provides helper methods to work with the printchecks-printable-page web component
 */

import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { PrintChecksCore } from '@printchecks/core'
import type { Check } from '@printchecks/core/models'

export interface LineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

export interface PaymentStats {
  thisMonth: number
  lastMonth: number
  thisYear: number
  lastYear: number
  thisQuarter: number
  averagePayment: number
  monthlyAverage: number
  largestPayment: number
  smallestPayment: number
  totalCount: number
  allTimeTotal: number
}

export interface UsePrintableCheckPageOptions {
  core: PrintChecksCore
  showAnalytics?: boolean
  showLineItems?: boolean
}

export interface UsePrintableCheckPageReturn {
  // State
  currentCheckId: Ref<string | null>
  checkData: ShallowRef<Check | null>
  lineItems: Ref<LineItem[]>
  paymentStats: Ref<PaymentStats | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  showAnalytics: Ref<boolean>
  showLineItems: Ref<boolean>

  // Actions
  loadCheckForPrinting: (checkId: string) => Promise<void>
  setCheckData: (check: Check, items?: LineItem[]) => void
  addLineItem: (item: LineItem) => void
  removeLineItem: (index: number) => void
  clearLineItems: () => void
  refreshStats: () => Promise<void>
  printPage: () => void
  toggleAnalytics: () => void
  toggleLineItems: () => void
}

/**
 * Composable for managing printable check page in Vue applications
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePrintableCheckPage } from '@printchecks/vue'
 * import { usePrintChecks } from '@printchecks/vue'
 *
 * const { core } = usePrintChecks()
 * const {
 *   currentCheckId,
 *   checkData,
 *   lineItems,
 *   loadCheckForPrinting,
 *   printPage
 * } = usePrintableCheckPage({ core })
 *
 * // Load a check
 * await loadCheckForPrinting('check-123')
 *
 * // Print the page
 * printPage()
 * </script>
 *
 * <template>
 *   <printchecks-printable-page
 *     :check-id="currentCheckId"
 *     :show-analytics="true"
 *     :show-line-items="true"
 *   />
 * </template>
 * ```
 */
export function usePrintableCheckPage(options: UsePrintableCheckPageOptions): UsePrintableCheckPageReturn {
  const { core } = options

  // State
  const currentCheckId = ref<string | null>(null)
  const checkData = shallowRef<Check | null>(null)
  const lineItems = ref<LineItem[]>([])
  const paymentStats = ref<PaymentStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const showAnalytics = ref(options.showAnalytics ?? true)
  const showLineItems = ref(options.showLineItems ?? true)

  /**
   * Load a check and prepare it for printing
   */
  async function loadCheckForPrinting(checkId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // Load the check
      const checks = await core.getChecks()
      const check = checks.find(c => c.id === checkId)

      if (!check) {
        throw new Error(`Check with ID ${checkId} not found`)
      }

      currentCheckId.value = checkId
      checkData.value = check

      // Extract line items from check if available
      lineItems.value = (check as Check & { lineItems?: LineItem[] }).lineItems ?? []

      // Load payment statistics
      await refreshStats()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load check for printing'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set check data directly (alternative to loading by ID)
   */
  function setCheckData(check: Check, items: LineItem[] = []): void {
    checkData.value = check
    currentCheckId.value = check.id || null
    lineItems.value = items
  }

  /**
   * Add a line item to the current check
   */
  function addLineItem(item: LineItem): void {
    lineItems.value.push({
      ...item,
      id: item.id || `line-item-${Date.now()}`
    })
  }

  /**
   * Remove a line item by index
   */
  function removeLineItem(index: number): void {
    if (index >= 0 && index < lineItems.value.length) {
      lineItems.value.splice(index, 1)
    }
  }

  /**
   * Clear all line items
   */
  function clearLineItems(): void {
    lineItems.value = []
  }

  /**
   * Refresh payment statistics from all checks
   */
  async function refreshStats(): Promise<void> {
    try {
      const allChecks = await core.getChecks()
      paymentStats.value = calculatePaymentStats(allChecks)
    } catch (e: unknown) {
      error.value = 'Failed to load payment statistics'
      console.error('Failed to refresh stats:', e)
    }
  }

  /**
   * Calculate payment statistics from checks
   */
  function calculatePaymentStats(checks: Check[]): PaymentStats {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentQuarter = Math.floor(currentMonth / 3)

    const amounts = checks.map(c => Number(c.amount))
    const total = amounts.reduce((sum, amt) => sum + amt, 0)

    // Filter by time periods
    const thisMonth = checks.filter(c => {
      const d = new Date(c.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const lastMonth = checks.filter(c => {
      const d = new Date(c.date)
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const thisYear = checks.filter(c => {
      const d = new Date(c.date)
      return d.getFullYear() === currentYear
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const lastYear = checks.filter(c => {
      const d = new Date(c.date)
      return d.getFullYear() === currentYear - 1
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    const thisQuarter = checks.filter(c => {
      const d = new Date(c.date)
      const checkQuarter = Math.floor(d.getMonth() / 3)
      return checkQuarter === currentQuarter && d.getFullYear() === currentYear
    }).reduce((sum, c) => sum + Number(c.amount), 0)

    return {
      thisMonth,
      lastMonth,
      thisYear,
      lastYear,
      thisQuarter,
      averagePayment: amounts.length > 0 ? total / amounts.length : 0,
      monthlyAverage: thisMonth,
      largestPayment: amounts.length > 0 ? Math.max(...amounts) : 0,
      smallestPayment: amounts.length > 0 ? Math.min(...amounts) : 0,
      totalCount: checks.length,
      allTimeTotal: total
    }
  }

  /**
   * Trigger print dialog
   */
  function printPage(): void {
    window.print()
  }

  /**
   * Toggle analytics display
   */
  function toggleAnalytics(): void {
    showAnalytics.value = !showAnalytics.value
  }

  /**
   * Toggle line items display
   */
  function toggleLineItems(): void {
    showLineItems.value = !showLineItems.value
  }

  return {
    // State
    currentCheckId,
    checkData,
    lineItems,
    paymentStats,
    isLoading,
    error,
    showAnalytics,
    showLineItems,

    // Actions
    loadCheckForPrinting,
    setCheckData,
    addLineItem,
    removeLineItem,
    clearLineItems,
    refreshStats,
    printPage,
    toggleAnalytics,
    toggleLineItems
  }
}
