<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useSessionTimeout } from '@/composables/useSessionTimeout'
import { verifyPassword } from '@/services/encryption'
import { secureStorage } from '@/services/secureStorage'

const { showWarning, countdown, keepSessionActive } = useSessionTimeout()

// Password modal state
const showPasswordModal = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const isValidating = ref(false)

async function handlePasswordSubmit() {
  const encryptionTest = localStorage.getItem('encryption_test')
  if (!encryptionTest) {
    passwordError.value = 'Encryption test data not found. Encryption will be disabled.'
    localStorage.setItem('encryption_enabled', 'false')
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    return
  }

  if (!passwordInput.value) {
    passwordError.value = 'Please enter your password'
    return
  }

  isValidating.value = true
  passwordError.value = ''

  // Validate password by attempting to decrypt test data
  const isValid = await verifyPassword(encryptionTest, passwordInput.value)

  if (isValid) {
    sessionStorage.setItem('encryption_password', passwordInput.value)
    // Initialize secure storage with the password
    secureStorage.initialize(passwordInput.value)

    // Trigger events to notify components
    window.dispatchEvent(new CustomEvent('encryption-password-set'))
    window.dispatchEvent(new CustomEvent('password-initialized'))

    // Close modal
    showPasswordModal.value = false
    passwordInput.value = ''
  } else {
    passwordError.value = 'Incorrect password. Please try again.'
    isValidating.value = false
  }
}

onMounted(async () => {
  // Check if encryption is enabled
  const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true'
  const hasPassword = !!sessionStorage.getItem('encryption_password')

  if (encryptionEnabled) {
    if (!hasPassword) {
      // No password in session - show modal
      showPasswordModal.value = true
    } else {
      // Password exists in session - initialize secureStorage with it
      const password = sessionStorage.getItem('encryption_password')
      secureStorage.initialize(password)
      // Notify components that password is ready
      window.dispatchEvent(new CustomEvent('password-initialized'))
    }
  } else {
    // No encryption - notify components to load normally
    window.dispatchEvent(new CustomEvent('password-initialized'))
  }
})
</script>

<template>
  <!-- Password Modal -->
  <div v-if="showPasswordModal" class="password-overlay">
    <div class="password-modal">
      <div class="password-header">
        <div class="lock-icon">🔐</div>
        <h2>Welcome Back!</h2>
        <p>Your data is encrypted. Please enter your password to continue.</p>
      </div>

      <form @submit.prevent="handlePasswordSubmit" class="password-form">
        <div class="form-group">
          <label for="password-input">Password</label>
          <input
            id="password-input"
            v-model="passwordInput"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': passwordError }"
            placeholder="Enter your password"
            :disabled="isValidating"
            autocomplete="current-password"
            autofocus
          />
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="isValidating">
          <span v-if="!isValidating">🔓 Unlock</span>
          <span v-else>🔄 Validating...</span>
        </button>
      </form>

      <div class="password-footer">
        <p>🔒 Your data is secured with AES-256 encryption</p>
      </div>
    </div>
  </div>

  <!-- Session Timeout Warning Modal -->
  <div v-if="showWarning" class="session-warning-overlay">
    <div class="session-warning-modal">
      <div class="warning-icon">⏱️</div>
      <h3>Session Expiring Soon</h3>
      <p>You've been inactive for a while. Your session will expire in:</p>
      <div class="countdown">{{ countdown }} seconds</div>
      <button class="btn btn-primary btn-lg" @click="keepSessionActive">
        🔄 Keep Session Active
      </button>
      <p class="text-muted mt-3" style="font-size: 0.875rem">
        Click the button to extend your session for another 5 minutes
      </p>
    </div>
  </div>

  <div class="container">
    <div style="padding-bottom: 20px; padding-top: 20px; text-align: center">
      <h1 style="color: #007bff; margin: 0; font-weight: bold">🏦 PrintChecks</h1>
      <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px">
        Professional Check Printing & Payment Documentation
      </p>
    </div>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <RouterLink to="/" class="nav-link" :class="{ active: $route.path == '/' }"
          >✅ Check</RouterLink
        >
      </li>
      <li class="nav-item">
        <RouterLink
          to="/customization"
          class="nav-link"
          :class="{ active: $route.path == '/customization' }"
          >🎨 Customization</RouterLink
        >
      </li>
      <li class="nav-item">
        <RouterLink to="/history" class="nav-link" :class="{ active: $route.path == '/history' }"
          >📚 History</RouterLink
        >
      </li>
      <li class="nav-item">
        <RouterLink to="/banks" class="nav-link" :class="{ active: $route.path == '/banks' }"
          >🏦 Bank Accounts</RouterLink
        >
      </li>
      <li class="nav-item">
        <RouterLink to="/vendors" class="nav-link" :class="{ active: $route.path == '/vendors' }"
          >👥 Vendors</RouterLink
        >
      </li>
      <li class="nav-item">
        <RouterLink
          to="/analytics"
          class="nav-link"
          :class="{ active: $route.path == '/analytics' }"
          >📊 Analytics</RouterLink
        >
      </li>
      <li class="nav-item">
        <RouterLink
          to="/import-export"
          class="nav-link"
          :class="{ active: $route.path == '/import-export' }"
          >💾 Import/Export</RouterLink
        >
      </li>
    </ul>
    <nav></nav>
  </div>

  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped>
/* Password modal styles */
.password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.95) 0%, rgba(0, 86, 179, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-in-out;
}

.password-modal {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.4s ease-out;
  overflow: hidden;
}

.password-header {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
}

.lock-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.password-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.password-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.password-form {
  padding: 2rem;
}

.password-form .form-group {
  margin-bottom: 1.5rem;
}

.password-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.password-form .form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.password-form .form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.password-form .form-control.is-invalid {
  border-color: #dc3545;
}

.password-form .form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.password-form .btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.password-form .btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.password-form .btn:active:not(:disabled) {
  transform: translateY(0);
}

.password-form .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.password-footer {
  background: #f8f9fa;
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

.password-footer p {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
}

/* Session warning modal styles */
.session-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

.session-warning-modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 450px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.warning-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.session-warning-modal h3 {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.session-warning-modal p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.countdown {
  font-size: 3rem;
  font-weight: bold;
  color: #dc3545;
  margin: 1.5rem 0;
  font-family: monospace;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
