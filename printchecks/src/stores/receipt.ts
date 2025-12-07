import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { 
  ReceiptData, 
  LineItem, 
  ReceiptTotals, 
  ReceiptValidation,
  ReceiptTemplate,
  PaymentRecord
} from '@/types'

export const useReceiptStore = defineStore('useReceiptStore', () => {
  // Current receipt being edited
  const currentReceipt = ref<ReceiptData | null>(null)
  
  // Receipt templates
  const templates = ref<ReceiptTemplate[]>([])
  
  // Validation state
  const validation = ref<ReceiptValidation>({
    lineItems: true,
    totals: true,
    taxes: true,
    billTo: true,
    paymentInfo: true,
    overall: true,
    errors: [],
    warnings: []
  })
  
  // Computed properties
  const isValid = computed(() => validation.value.overall)
  
  const calculatedTotals = computed((): ReceiptTotals => {
    if (!currentReceipt.value?.lineItems.length) {
      return {
        subtotal: 0,
        totalTax: 0,
        totalDiscount: 0,
        shippingAmount: 0,
        handlingAmount: 0,
        grandTotal: 0
      }
    }
    
    const subtotal = currentReceipt.value.lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalTax = currentReceipt.value.lineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
    const totalDiscount = currentReceipt.value.lineItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
    const shippingAmount = currentReceipt.value.totals?.shippingAmount || 0
    const handlingAmount = currentReceipt.value.totals?.handlingAmount || 0
    
    return {
      subtotal,
      totalTax,
      totalDiscount,
      shippingAmount,
      handlingAmount,
      grandTotal: subtotal + totalTax - totalDiscount + shippingAmount + handlingAmount
    }
  })
  
  const hasLineItems = computed(() => 
    currentReceipt.value?.lineItems && currentReceipt.value.lineItems.length > 0
  )
  
  // Actions
  function createNewReceipt(): ReceiptData {
    const receipt: ReceiptData = {
      id: generateId(),
      receiptNumber: generateReceiptNumber(),
      date: new Date().toLocaleDateString(),
      lineItems: [],
      totals: {
        subtotal: 0,
        totalTax: 0,
        totalDiscount: 0,
        shippingAmount: 0,
        handlingAmount: 0,
        grandTotal: 0
      },
      taxes: [],
      discounts: [],
      metadata: {},
      billTo: {
        name: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      },
      paymentInfo: {
        method: 'check',
        amount: 0,
        currency: 'USD'
      },
      settings: {
        showLineNumbers: true,
        showTaxDetails: true,
        showDiscountDetails: true,
        includeNotes: true,
        currency: 'USD',
        locale: 'en-US'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    currentReceipt.value = receipt
    return receipt
  }
  
  function addLineItem(description: string, quantity: number = 1, unitPrice: number = 0): LineItem {
    if (!currentReceipt.value) createNewReceipt()
    
    const lineItem: LineItem = {
      id: generateId(),
      description,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
      taxable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    currentReceipt.value!.lineItems.push(lineItem)
    updateTotals()
    validateReceipt()
    
    return lineItem
  }
  
  function updateLineItem(itemId: string, updates: Partial<LineItem>) {
    if (!currentReceipt.value) return
    
    const itemIndex = currentReceipt.value.lineItems.findIndex(item => item.id === itemId)
    if (itemIndex === -1) return
    
    const item = currentReceipt.value.lineItems[itemIndex]
    const updatedItem = { ...item, ...updates, updatedAt: new Date() }
    
    // Recalculate total price if quantity or unit price changed
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
    }
    
    currentReceipt.value.lineItems[itemIndex] = updatedItem
    updateTotals()
    validateReceipt()
  }
  
  function removeLineItem(itemId: string) {
    if (!currentReceipt.value) return
    
    currentReceipt.value.lineItems = currentReceipt.value.lineItems.filter(item => item.id !== itemId)
    updateTotals()
    validateReceipt()
  }
  
  function updateTotals() {
    if (!currentReceipt.value) return
    
    currentReceipt.value.totals = calculatedTotals.value
    currentReceipt.value.updatedAt = new Date()
  }
  
  function updateReceiptInfo(updates: Partial<ReceiptData>) {
    if (!currentReceipt.value) return
    
    currentReceipt.value = {
      ...currentReceipt.value,
      ...updates,
      updatedAt: new Date()
    }
    
    validateReceipt()
  }
  
  function validateReceipt(): boolean {
    if (!currentReceipt.value) return false
    
    const errors: string[] = []
    const warnings: string[] = []
    
    // Validate line items
    const lineItemsValid = currentReceipt.value.lineItems.length > 0 &&
      currentReceipt.value.lineItems.every(item => 
        item.description.trim() && 
        item.quantity > 0 && 
        item.unitPrice >= 0
      )
    
    if (!lineItemsValid) {
      errors.push('Invalid line items')
    }
    
    // Validate totals
    const totalsValid = currentReceipt.value.totals.grandTotal >= 0
    
    // Validate bill to
    const billToValid = currentReceipt.value.billTo.name.trim() !== ''
    
    if (!billToValid) {
      warnings.push('Bill to information is incomplete')
    }
    
    // Validate payment info
    const paymentInfoValid = currentReceipt.value.paymentInfo.amount > 0
    
    if (!paymentInfoValid) {
      errors.push('Payment amount must be greater than 0')
    }
    
    validation.value = {
      lineItems: lineItemsValid,
      totals: totalsValid,
      taxes: true, // Tax validation can be added later
      billTo: billToValid,
      paymentInfo: paymentInfoValid,
      overall: lineItemsValid && totalsValid && paymentInfoValid,
      errors,
      warnings
    }
    
    return validation.value.overall
  }
  
  function saveReceipt() {
    if (!currentReceipt.value) return false
    
    try {
      const receipts = JSON.parse(localStorage.getItem('printchecks_receipts') || '[]')
      
      const existingIndex = receipts.findIndex((r: any) => r.id === currentReceipt.value?.id)
      if (existingIndex >= 0) {
        receipts[existingIndex] = { ...currentReceipt.value }
      } else {
        receipts.push({ ...currentReceipt.value })
      }
      
      localStorage.setItem('printchecks_receipts', JSON.stringify(receipts))
      return true
    } catch (e) {
      console.error('Failed to save receipt:', e)
      return false
    }
  }
  
  function loadReceipt(receiptData: ReceiptData) {
    currentReceipt.value = { ...receiptData }
    validateReceipt()
  }
  
  function generateReceiptNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 3).toUpperCase()
    return `R${timestamp}${random}`
  }
  
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // Template management
  function saveAsTemplate(name: string, description?: string, category: ReceiptTemplate['category'] = 'custom') {
    if (!currentReceipt.value) return null
    
    const template: ReceiptTemplate = {
      id: generateId(),
      name,
      description,
      category,
      template: {
        settings: currentReceipt.value.settings,
        metadata: currentReceipt.value.metadata
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    templates.value.push(template)
    saveTemplates()
    
    return template
  }
  
  function loadTemplates() {
    try {
      const saved = localStorage.getItem('printchecks_receipt_templates')
      if (saved) {
        templates.value = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load receipt templates:', e)
    }
  }
  
  function saveTemplates() {
    try {
      localStorage.setItem('printchecks_receipt_templates', JSON.stringify(templates.value))
    } catch (e) {
      console.error('Failed to save receipt templates:', e)
    }
  }

  return {
    // State
    currentReceipt,
    templates,
    validation,
    
    // Computed
    isValid,
    calculatedTotals,
    hasLineItems,
    
    // Actions
    createNewReceipt,
    addLineItem,
    updateLineItem,
    removeLineItem,
    updateTotals,
    updateReceiptInfo,
    validateReceipt,
    saveReceipt,
    loadReceipt,
    saveAsTemplate,
    loadTemplates
  }
})
