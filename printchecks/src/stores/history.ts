import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CheckData, ReceiptData, PaymentRecord } from '@/types'
import { secureStorage } from '@/services/secureStorage'

export const useHistoryStore = defineStore('useHistoryStore', () => {
  // History data
  const checks = ref<CheckData[]>([])
  const receipts = ref<ReceiptData[]>([])
  const paymentRecords = ref<PaymentRecord[]>([])

  // Search and filter state
  const searchQuery = ref('')
  const filterBy = ref<'all' | 'checks' | 'receipts' | 'payments'>('all')
  const sortBy = ref<'date' | 'amount' | 'payTo'>('date')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  // Computed properties
  const filteredItems = computed(() => {
    let items: any[] = []

    switch (filterBy.value) {
      case 'checks':
        items = checks.value.map((check) => ({ ...check, type: 'check' }))
        break
      case 'receipts':
        items = receipts.value.map((receipt) => ({ ...receipt, type: 'receipt' }))
        break
      case 'payments':
        items = paymentRecords.value.map((payment) => ({ ...payment, type: 'payment' }))
        break
      default:
        items = [
          ...checks.value.map((check) => ({ ...check, type: 'check' })),
          ...receipts.value.map((receipt) => ({ ...receipt, type: 'receipt' })),
          ...paymentRecords.value.map((payment) => ({ ...payment, type: 'payment' }))
        ]
    }

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      items = items.filter((item) => {
        if (item.type === 'check') {
          return (
            item.payTo?.toLowerCase().includes(query) ||
            item.memo?.toLowerCase().includes(query) ||
            item.checkNumber?.toString().includes(query)
          )
        } else if (item.type === 'receipt') {
          return (
            item.billTo?.name?.toLowerCase().includes(query) ||
            item.receiptNumber?.toLowerCase().includes(query)
          )
        }
        return false
      })
    }

    // Apply sorting
    items.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy.value) {
        case 'date':
          aValue = new Date(a.date || a.createdAt)
          bValue = new Date(b.date || b.createdAt)
          break
        case 'amount':
          aValue = parseFloat(a.amount || a.totals?.grandTotal || 0)
          bValue = parseFloat(b.amount || b.totals?.grandTotal || 0)
          break
        case 'payTo':
          aValue = a.payTo || a.billTo?.name || ''
          bValue = b.payTo || b.billTo?.name || ''
          break
        default:
          return 0
      }

      if (sortOrder.value === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return items
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredItems.value.slice(start, end)
  })

  const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))

  const totalItems = computed(() => filteredItems.value.length)

  // Actions
  async function loadHistory() {
    await loadChecks()
    await loadReceipts()
    await loadPaymentRecords()
  }

  async function loadChecks() {
    try {
      const saved = await secureStorage.get('checkList')
      if (saved) {
        checks.value = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load check history:', e)
    }
  }

  async function loadReceipts() {
    try {
      const saved = await secureStorage.get('printchecks_receipts')
      if (saved) {
        receipts.value = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load receipt history:', e)
    }
  }

  async function loadPaymentRecords() {
    try {
      const saved = await secureStorage.get('printchecks_payments')
      if (saved) {
        paymentRecords.value = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load payment records:', e)
    }
  }

  // Checks cannot be deleted once created - they can only be voided
  // This function is disabled to prevent accidental deletion
  async function addCheck(checkData: Partial<CheckData>) {
    const newCheck: CheckData = {
      id: Date.now().toString(),
      createdAt: new Date(),
      printedAt: new Date(),
      isVoid: false,
      isPrinted: true,
      isSaved: true,
      ...(checkData as CheckData)
    }
    checks.value.push(newCheck)
    await saveChecks()
  }

  function deleteCheck(checkId: string) {
    console.warn('Checks cannot be deleted. Use voidCheck() instead.')
    // checks.value = checks.value.filter(check => check.id !== checkId)
    // saveChecks()
  }

  async function voidCheck(checkId: string) {
    const check = checks.value.find((c) => c.id === checkId)
    if (check) {
      check.isVoid = true
      await saveChecks()
    }
  }

  async function deleteReceipt(receiptId: string) {
    receipts.value = receipts.value.filter((receipt) => receipt.id !== receiptId)
    await saveReceipts()
  }

  async function deletePaymentRecord(paymentId: string) {
    paymentRecords.value = paymentRecords.value.filter((payment) => payment.id !== paymentId)
    await savePaymentRecords()
  }

  async function saveChecks() {
    try {
      await secureStorage.set('checkList', JSON.stringify(checks.value))
    } catch (e) {
      console.error('Failed to save check history:', e)
    }
  }

  async function saveReceipts() {
    try {
      await secureStorage.set('printchecks_receipts', JSON.stringify(receipts.value))
    } catch (e) {
      console.error('Failed to save receipt history:', e)
    }
  }

  async function savePaymentRecords() {
    try {
      await secureStorage.set('printchecks_payments', JSON.stringify(paymentRecords.value))
    } catch (e) {
      console.error('Failed to save payment records:', e)
    }
  }

  async function clearHistory() {
    checks.value = []
    receipts.value = []
    paymentRecords.value = []
    await saveChecks()
    await saveReceipts()
    await savePaymentRecords()
  }

  function setSearch(query: string) {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page when searching
  }

  function setFilter(filter: typeof filterBy.value) {
    filterBy.value = filter
    currentPage.value = 1
  }

  function setSort(sort: typeof sortBy.value, order?: typeof sortOrder.value) {
    sortBy.value = sort
    if (order) {
      sortOrder.value = order
    } else {
      // Toggle order if same sort field
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }
    currentPage.value = 1
  }

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // Listen for password initialization to reload data
  if (typeof window !== 'undefined') {
    window.addEventListener('password-initialized', () => {
      loadHistory()
    })
  }

  return {
    // State
    checks,
    receipts,
    paymentRecords,
    searchQuery,
    filterBy,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,

    // Computed
    filteredItems,
    paginatedItems,
    totalPages,
    totalItems,

    // Actions
    loadHistory,
    addCheck, // Add a new check to history
    deleteCheck, // Disabled - kept for backwards compatibility
    voidCheck, // Use this instead of deleteCheck
    deleteReceipt,
    deletePaymentRecord,
    clearHistory,
    setSearch,
    setFilter,
    setSort,
    setPage
  }
})
