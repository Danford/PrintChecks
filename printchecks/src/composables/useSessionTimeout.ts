/**
 * Session timeout composable for encryption-enabled apps
 * Shows a "Keep Session Active" prompt after 5 minutes of inactivity
 * User has 60 seconds to respond before being locked out
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { secureStorage } from '@/services/secureStorage'

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const WARNING_DURATION = 60 * 1000 // 60 seconds
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart']

export function useSessionTimeout() {
  const showWarning = ref(false)
  const countdown = ref(60)
  const isLocked = ref(false)

  let inactivityTimer: number | null = null
  let warningTimer: number | null = null
  let countdownInterval: number | null = null
  let lastActivityTime: number = Date.now()

  // Check if encryption is enabled - make it reactive
  const encryptionEnabled = ref(localStorage.getItem('encryption_enabled') === 'true')
  
  console.log('[SessionTimeout] Initial encryption status:', encryptionEnabled.value)

  function clearAllTimers() {
    if (inactivityTimer) clearTimeout(inactivityTimer)
    if (warningTimer) clearTimeout(warningTimer)
    if (countdownInterval) clearInterval(countdownInterval)
    inactivityTimer = null
    warningTimer = null
    countdownInterval = null
  }

  function startCountdown() {
    countdown.value = 60
    countdownInterval = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && countdownInterval) {
        clearInterval(countdownInterval)
      }
    }, 1000)
  }

  function lockSession() {
    isLocked.value = true
    showWarning.value = false
    clearAllTimers()
    
    // Clear password from both sessionStorage and secureStorage
    sessionStorage.removeItem('encryption_password')
    secureStorage.initialize(null) // Clear password from secure storage
    
    // Show lock screen overlay
    alert('⏱️ Session expired due to inactivity. Please refresh the page and enter your password again.')
    window.location.reload()
  }

  function showWarningPrompt() {
    showWarning.value = true
    startCountdown()
    
    // Set timer to lock session after 60 seconds
    warningTimer = window.setTimeout(() => {
      lockSession()
    }, WARNING_DURATION)
  }

  function resetInactivityTimer() {
    if (isLocked.value) return
    if (!encryptionEnabled.value) {
      console.log('[SessionTimeout] Encryption not enabled, skipping timer')
      return
    }
    if (!sessionStorage.getItem('encryption_password')) {
      console.log('[SessionTimeout] No password in sessionStorage, skipping timer')
      return
    }

    console.log('[SessionTimeout] Resetting inactivity timer - will show warning in 5 minutes')
    lastActivityTime = Date.now()
    clearAllTimers()
    showWarning.value = false
    
    // Start new inactivity timer
    inactivityTimer = window.setTimeout(() => {
      console.log('[SessionTimeout] Inactivity timeout reached! Showing warning...')
      showWarningPrompt()
    }, INACTIVITY_TIMEOUT)
  }

  function keepSessionActive() {
    showWarning.value = false
    clearAllTimers()
    resetInactivityTimer()
  }

  function handleActivity() {
    if (showWarning.value) return // Don't reset if warning is already shown
    resetInactivityTimer()
  }

  function handleVisibilityChange() {
    if (!encryptionEnabled.value || !sessionStorage.getItem('encryption_password')) {
      return
    }

    if (document.visibilityState === 'visible') {
      // Page became visible again - check if we've been away too long
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityTime
      
      console.log('[SessionTimeout] Page became visible. Time since last activity:', timeSinceLastActivity / 1000, 'seconds')
      
      // If more than 5 minutes passed while away, lock immediately
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('[SessionTimeout] Computer was asleep/inactive too long - locking session')
        lockSession()
      } else {
        // Otherwise, reset the timer
        console.log('[SessionTimeout] Resuming session timeout')
        resetInactivityTimer()
      }
    }
  }

  function startSessionTimeout() {
    const hasEncryption = localStorage.getItem('encryption_enabled') === 'true'
    const hasPassword = !!sessionStorage.getItem('encryption_password')
    
    console.log('[SessionTimeout] Starting timeout check:', { hasEncryption, hasPassword })
    
    // Only start if encryption is enabled and password exists
    if (!hasEncryption || !hasPassword) {
      console.log('[SessionTimeout] Not starting - encryption disabled or no password')
      return
    }

    console.log('[SessionTimeout] Starting session timeout monitoring')
    
    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    // Add visibility change listener to detect sleep/wake
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start the initial timer
    resetInactivityTimer()
  }

  function stopSessionTimeout() {
    console.log('[SessionTimeout] Stopping session timeout')
    clearAllTimers()
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, handleActivity)
    })
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  // Listen for password being set
  function handlePasswordSet() {
    console.log('[SessionTimeout] Password set event received, starting timeout')
    encryptionEnabled.value = true
    stopSessionTimeout()
    startSessionTimeout()
  }

  // Listen for encryption being toggled
  function handleEncryptionToggled(event: Event) {
    const customEvent = event as CustomEvent<{ enabled: boolean }>
    const isEnabled = customEvent.detail?.enabled ?? (localStorage.getItem('encryption_enabled') === 'true')
    
    console.log('[SessionTimeout] Encryption toggled:', isEnabled)
    encryptionEnabled.value = isEnabled
    
    if (isEnabled && sessionStorage.getItem('encryption_password')) {
      console.log('[SessionTimeout] Encryption enabled, restarting timeout')
      stopSessionTimeout()
      startSessionTimeout()
    } else {
      console.log('[SessionTimeout] Encryption disabled, stopping timeout')
      stopSessionTimeout()
    }
  }

  onMounted(() => {
    console.log('[SessionTimeout] Component mounted')
    
    // Listen for encryption password being set
    window.addEventListener('encryption-password-set', handlePasswordSet)
    // Listen for encryption state changes
    window.addEventListener('encryption-toggled', handleEncryptionToggled as EventListener)
    
    startSessionTimeout()
  })

  onUnmounted(() => {
    console.log('[SessionTimeout] Component unmounted')
    window.removeEventListener('encryption-password-set', handlePasswordSet)
    window.removeEventListener('encryption-toggled', handleEncryptionToggled as EventListener)
    stopSessionTimeout()
  })

  return {
    showWarning,
    countdown,
    isLocked,
    keepSessionActive,
    resetInactivityTimer,
    startSessionTimeout,
    stopSessionTimeout
  }
}
