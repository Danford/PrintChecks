<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useSessionTimeout } from '@/composables/useSessionTimeout'
import { verifyPassword } from '@/services/encryption'

const { showWarning, countdown, keepSessionActive } = useSessionTimeout()

async function promptForPassword() {
  const encryptionTest = localStorage.getItem('encryption_test')
  if (!encryptionTest) {
    alert('⚠️ Encryption test data not found. Encryption will be disabled.')
    localStorage.setItem('encryption_enabled', 'false')
    window.location.reload()
    return
  }
  
  while (true) {
    const password = prompt('🔐 Encryption is enabled. Please enter your password:')
    if (!password) {
      alert('⚠️ You must enter your password to access encrypted data.')
      continue
    }
    
    // Validate password by attempting to decrypt test data
    const isValid = await verifyPassword(encryptionTest, password)
    if (isValid) {
      sessionStorage.setItem('encryption_password', password)
      // Trigger event to start session timeout
      window.dispatchEvent(new CustomEvent('encryption-password-set'))
      break
    } else {
      alert('❌ Incorrect password. Please try again.')
    }
  }
}

onMounted(async () => {
  // Check if encryption is enabled but password is missing
  const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true'
  const hasPassword = !!sessionStorage.getItem('encryption_password')
  
  if (encryptionEnabled && !hasPassword) {
    await promptForPassword()
  }
})
</script>

<template>
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
        <p class="text-muted mt-3" style="font-size: 0.875rem;">
          Click the button to extend your session for another 5 minutes
        </p>
      </div>
    </div>

    <div class="container">
        <div style="padding-bottom: 20px; padding-top: 20px; text-align: center;">
            <h1 style="color: #007bff; margin: 0; font-weight: bold;">
                🏦 PrintChecks
            </h1>
            <p style="color: #6c757d; margin: 5px 0 0 0; font-size: 14px;">
                Professional Check Printing & Payment Documentation
            </p>
        </div>
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <RouterLink to="/" class="nav-link" :class="{'active': $route.path == '/'}">✅ Check</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/customization" class="nav-link" :class="{'active': $route.path == '/customization'}">🎨 Customization</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/history" class="nav-link" :class="{'active': $route.path == '/history'}">📚 History</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/banks" class="nav-link" :class="{'active': $route.path == '/banks'}">🏦 Bank Accounts</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/vendors" class="nav-link" :class="{'active': $route.path == '/vendors'}">👥 Vendors</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/analytics" class="nav-link" :class="{'active': $route.path == '/analytics'}">📊 Analytics</RouterLink>
            </li>
            <li class="nav-item">
                <RouterLink to="/import-export" class="nav-link" :class="{'active': $route.path == '/import-export'}">💾 Import/Export</RouterLink>
            </li>
        </ul>
      <nav>
      </nav>
    </div>

    <div class="container">
      <RouterView />
    </div>
</template>

<style scoped>
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
  0%, 100% {
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
