/**
 * Session timeout composable for encryption-enabled apps
 * Shows a "Keep Session Active" prompt after 5 minutes of inactivity
 * User has 60 seconds to respond before being locked out
 */

import { ref, onMounted, onUnmounted } from 'vue'

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

  // Check if encryption is enabled
  const encryptionEnabled = ref(localStorage.getItem('encryption_enabled') === 'true')

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
    sessionStorage.removeItem('encryption_password')
    
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
    if (!encryptionEnabled.value) return
    if (!sessionStorage.getItem('encryption_password')) return

    clearAllTimers()
    showWarning.value = false
    
    // Start new inactivity timer
    inactivityTimer = window.setTimeout(() => {
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

  function startSessionTimeout() {
    // Only start if encryption is enabled and password exists
    if (!encryptionEnabled.value || !sessionStorage.getItem('encryption_password')) {
      return
    }

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    // Start the initial timer
    resetInactivityTimer()
  }

  function stopSessionTimeout() {
    clearAllTimers()
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, handleActivity)
    })
  }

  onMounted(() => {
    startSessionTimeout()
  })

  onUnmounted(() => {
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

