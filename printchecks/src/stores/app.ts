import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { AppSettings, CheckData } from '@/types'
import { secureStorage } from '@/services/secureStorage'

export const useAppStore = defineStore('useAppStore', () => {
  // Legacy check reference for backward compatibility
  const check = ref<CheckData | null>(null)

  // App-wide settings
  const settings = ref<AppSettings>({
    theme: 'light',
    autoSave: true,
    defaultPrintOptions: {
      includeReceipt: false,
      includeLineItems: false,
      paperSize: 'letter',
      orientation: 'portrait',
      margins: {
        top: 0.5,
        right: 0.5,
        bottom: 0.5,
        left: 0.5
      }
    },
    language: 'en'
  })

  // Loading states
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // Error handling
  const error = ref<string | null>(null)
  const errors = ref<string[]>([])

  // Navigation state
  const currentView = ref('check')
  const sidebarOpen = ref(false)

  // Computed properties
  const isDarkMode = computed(() => settings.value.theme === 'dark')
  const hasErrors = computed(() => errors.value.length > 0)

  // Actions
  function setLoading(loading: boolean, message = '') {
    isLoading.value = loading
    loadingMessage.value = message
  }

  function addError(errorMessage: string) {
    errors.value.push(errorMessage)
    error.value = errorMessage
  }

  function clearErrors() {
    errors.value = []
    error.value = null
  }

  async function updateSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    // Persist to secureStorage
    await secureStorage.set('printchecks_settings', JSON.stringify(settings.value))
  }

  async function loadSettings() {
    const saved = await secureStorage.get('printchecks_settings')
    if (saved) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(saved) }
      } catch (e) {
        console.warn('Failed to load settings from secureStorage:', e)
      }
    }
  }

  function setCurrentView(view: string) {
    currentView.value = view
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return {
    // Legacy
    check,

    // State
    settings,
    isLoading,
    loadingMessage,
    error,
    errors,
    currentView,
    sidebarOpen,

    // Computed
    isDarkMode,
    hasErrors,

    // Actions
    setLoading,
    addError,
    clearErrors,
    updateSettings,
    loadSettings,
    setCurrentView,
    toggleSidebar
  }
})
