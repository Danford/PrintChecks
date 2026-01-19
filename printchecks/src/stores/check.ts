import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CheckData, LegacyCheckData, CheckTemplate, CheckValidation, CheckStatus } from '@/types'
import { ToWords } from 'to-words'
import { secureStorage } from '@/services/secureStorage'

export const useCheckStore = defineStore('useCheckStore', () => {
  // Current check being edited
  const currentCheck = ref<CheckData | null>(null)
  
  // Check templates
  const templates = ref<CheckTemplate[]>([])
  const currentTemplate = ref<CheckTemplate | null>(null)
  
  // Validation state
  const validation = ref<CheckValidation>({
    accountHolderName: true,
    bankName: true,
    routingNumber: true,
    bankAccountNumber: true,
    checkNumber: true,
    amount: true,
    payTo: true,
    date: true
  })
  
  // Check status
  const status = ref<CheckStatus>('draft')
  
  // Auto-save state
  const lastSaved = ref<Date | null>(null)
  const hasUnsavedChanges = ref(false)
  
  // ToWords converter for amount conversion
  const toWordsConverter = new ToWords({
    localeCode: 'en-US',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: true,
    },
  })
  
  // Computed properties
  const isValid = computed(() => {
    return Object.values(validation.value).every(v => v === true)
  })
  
  const amountInWords = computed(() => {
    if (!currentCheck.value?.amount) return ''
    try {
      return toWordsConverter.convert(Number(currentCheck.value.amount))
    } catch (e) {
      return `${e}`
    }
  })
  
  const nextCheckNumber = computed(() => {
    if (!currentCheck.value?.checkNumber) return '100'
    const current = parseInt(currentCheck.value.checkNumber)
    return isNaN(current) ? '100' : (current + 1).toString()
  })
  
  // Actions
  function createNewCheck(template?: CheckTemplate): CheckData {
    const baseCheck: CheckData = {
      id: generateId(),
      accountHolderName: '',
      accountHolderAddress: '',
      accountHolderCity: '',
      accountHolderState: '',
      accountHolderZip: '',
      bankName: '',
      routingNumber: '',
      bankAccountNumber: '',
      checkNumber: nextCheckNumber.value,
      date: new Date().toLocaleDateString(),
      amount: '0.00',
      payTo: '',
      memo: '',
      signature: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    if (template) {
      Object.assign(baseCheck, template.checkData)
      baseCheck.checkNumber = nextCheckNumber.value
      baseCheck.date = new Date().toLocaleDateString()
    } else {
      // Load from most recent check if available
      loadFromRecentCheck(baseCheck)
    }
    
    currentCheck.value = baseCheck
    status.value = 'draft'
    hasUnsavedChanges.value = false
    return baseCheck
  }
  
  async function loadFromRecentCheck(check: CheckData) {
    try {
      const checkListData = await secureStorage.get('checkList')
      const checkList = checkListData ? JSON.parse(checkListData) : []
      const recentCheck = checkList[checkList.length - 1]
      
      if (recentCheck) {
        check.accountHolderName = recentCheck.accountHolderName || ''
        check.accountHolderAddress = recentCheck.accountHolderAddress || ''
        check.accountHolderCity = recentCheck.accountHolderCity || ''
        check.accountHolderState = recentCheck.accountHolderState || ''
        check.accountHolderZip = recentCheck.accountHolderZip || ''
        check.bankName = recentCheck.bankName || ''
        check.routingNumber = recentCheck.routingNumber || ''
        check.bankAccountNumber = recentCheck.bankAccountNumber || ''
        check.signature = recentCheck.signature || ''
      }
    } catch (e) {
      console.warn('Failed to load from recent check:', e)
    }
  }
  
  function updateCheck(updates: Partial<CheckData>) {
    if (!currentCheck.value) return
    
    currentCheck.value = {
      ...currentCheck.value,
      ...updates,
      updatedAt: new Date()
    }
    
    hasUnsavedChanges.value = true
    validateCheck()
  }
  
  function validateCheck(): boolean {
    if (!currentCheck.value) return false
    
    validation.value = {
      accountHolderName: !!currentCheck.value.accountHolderName?.trim(),
      bankName: !!currentCheck.value.bankName?.trim(),
      routingNumber: isValidRoutingNumber(currentCheck.value.routingNumber),
      bankAccountNumber: !!currentCheck.value.bankAccountNumber?.trim(),
      checkNumber: !!currentCheck.value.checkNumber?.trim(),
      amount: isValidAmount(currentCheck.value.amount),
      payTo: !!currentCheck.value.payTo?.trim(),
      date: isValidDate(currentCheck.value.date)
    }
    
    return isValid.value
  }
  
  function isValidRoutingNumber(routing: string): boolean {
    if (!routing || routing.length !== 9) return false
    return /^\d{9}$/.test(routing)
  }
  
  function isValidAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return !isNaN(num) && num > 0
  }
  
  function isValidDate(date: string): boolean {
    if (!date) return false
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }
  
  async function saveCheck() {
    if (!currentCheck.value || !isValid.value) return false
    
    try {
      // Update amount in words
      currentCheck.value.amountInWords = amountInWords.value
      
      // Save to history
      const checkListData = await secureStorage.get('checkList')
      const checkList = checkListData ? JSON.parse(checkListData) : []
      
      // Check if updating existing check
      const existingIndex = checkList.findIndex((c: any) => c.id === currentCheck.value?.id)
      if (existingIndex >= 0) {
        checkList[existingIndex] = { ...currentCheck.value }
      } else {
        checkList.push({ ...currentCheck.value })
      }
      
      await secureStorage.set('checkList', JSON.stringify(checkList))
      
      lastSaved.value = new Date()
      hasUnsavedChanges.value = false
      status.value = 'ready'
      
      return true
    } catch (e) {
      console.error('Failed to save check:', e)
      return false
    }
  }
  
  function loadCheck(checkData: CheckData | LegacyCheckData) {
    // Convert legacy format if needed
    if (isLegacyCheck(checkData)) {
      currentCheck.value = convertLegacyCheck(checkData)
    } else {
      currentCheck.value = { ...checkData as CheckData }
    }
    
    validateCheck()
    hasUnsavedChanges.value = false
  }
  
  function isLegacyCheck(check: any): check is LegacyCheckData {
    return !check.id && !check.createdAt
  }
  
  function convertLegacyCheck(legacy: LegacyCheckData): CheckData {
    return {
      id: generateId(),
      ...legacy,
      createdAt: new Date(),
      updatedAt: new Date(),
      amountInWords: undefined,
      isVoid: false,
      isPrinted: false
    }
  }
  
  function markAsPrinted() {
    if (!currentCheck.value) return
    
    currentCheck.value.isPrinted = true
    currentCheck.value.printedAt = new Date()
    status.value = 'printed'
    saveCheck()
  }
  
  function voidCheck() {
    if (!currentCheck.value) return
    
    currentCheck.value.isVoid = true
    status.value = 'void'
    saveCheck()
  }
  
  function duplicateCheck(): CheckData | null {
    if (!currentCheck.value) return null
    
    const duplicate = {
      ...currentCheck.value,
      id: generateId(),
      checkNumber: nextCheckNumber.value,
      date: new Date().toLocaleDateString(),
      amount: '0.00',
      payTo: '',
      memo: '',
      isPrinted: false,
      printedAt: undefined,
      isVoid: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    currentCheck.value = duplicate
    status.value = 'draft'
    hasUnsavedChanges.value = true
    
    return duplicate
  }
  
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // Template management
  function saveAsTemplate(name: string, description?: string) {
    if (!currentCheck.value) return null
    
    const template: CheckTemplate = {
      id: generateId(),
      name,
      description,
      checkData: {
        accountHolderName: currentCheck.value.accountHolderName,
        accountHolderAddress: currentCheck.value.accountHolderAddress,
        accountHolderCity: currentCheck.value.accountHolderCity,
        accountHolderState: currentCheck.value.accountHolderState,
        accountHolderZip: currentCheck.value.accountHolderZip,
        bankName: currentCheck.value.bankName,
        routingNumber: currentCheck.value.routingNumber,
        bankAccountNumber: currentCheck.value.bankAccountNumber,
        signature: currentCheck.value.signature
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    templates.value.push(template)
    saveTemplates()
    
    return template
  }
  
  async function loadTemplates() {
    try {
      const saved = await secureStorage.get('printchecks_templates')
      if (saved) {
        templates.value = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load templates:', e)
    }
  }
  
  async function saveTemplates() {
    try {
      await secureStorage.set('printchecks_templates', JSON.stringify(templates.value))
    } catch (e) {
      console.error('Failed to save templates:', e)
    }
  }
  
  function deleteTemplate(templateId: string) {
    templates.value = templates.value.filter(t => t.id !== templateId)
    saveTemplates()
  }

  return {
    // State
    currentCheck,
    templates,
    currentTemplate,
    validation,
    status,
    lastSaved,
    hasUnsavedChanges,
    
    // Computed
    isValid,
    amountInWords,
    nextCheckNumber,
    
    // Actions
    createNewCheck,
    updateCheck,
    validateCheck,
    saveCheck,
    loadCheck,
    markAsPrinted,
    voidCheck,
    duplicateCheck,
    saveAsTemplate,
    loadTemplates,
    saveTemplates,
    deleteTemplate
  }
})
