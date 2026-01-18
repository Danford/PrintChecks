<template>
  <div class="import-export-view p-4">
    <h4>💾 Import / Export Data</h4>
    <p class="text-muted">Backup your check data or import from a previous export</p>

    <!-- Encryption Settings Card -->
    <div class="card mb-4">
      <div class="card-header bg-warning text-dark">
        <h5 class="mb-0">🔐 Encryption Settings</h5>
      </div>
      <div class="card-body">
        <div class="form-check mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            id="enableEncryption"
            v-model="encryptionEnabled"
            @change="onEncryptionToggle"
          />
          <label class="form-check-label" for="enableEncryption">
            <strong>Enable Data Encryption</strong>
          </label>
          <small class="d-block text-muted mt-1">
            When enabled, your session will lock after 5 minutes of inactivity. You'll have 60 seconds to keep your session active.
          </small>
        </div>

        <div v-if="encryptionEnabled" class="alert alert-info">
          <strong>🔒 Encryption Active</strong><br />
          After 5 minutes of inactivity, you'll be prompted to keep your session active (60 second timeout).
          <br /><br />
          <button class="btn btn-sm btn-warning" @click="changePassword">
            Change Encryption Password
          </button>
        </div>

        <div v-if="!encryptionEnabled" class="alert alert-secondary">
          <strong>ℹ️ Encryption Disabled</strong><br />
          Your data is not encrypted. Anyone with access to this browser can view your check data.
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="export-tab"
          data-bs-toggle="tab"
          data-bs-target="#export"
          type="button"
          role="tab"
        >
          📤 Export
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="import-tab"
          data-bs-toggle="tab"
          data-bs-target="#import"
          type="button"
          role="tab"
        >
          📥 Import
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Export Tab -->
      <div class="tab-pane fade show active" id="export" role="tabpanel">
        <div class="card">
          <div class="card-body">
            <h5>Export Your Data</h5>
            <p>Download a backup of all your check data, receipts, and payment records.</p>

            <div class="form-check mb-3">
              <input
                class="form-check-input"
                type="checkbox"
                id="exportEncrypted"
                v-model="exportEncrypted"
              />
              <label class="form-check-label" for="exportEncrypted">
                Encrypt exported data with password
              </label>
            </div>

            <div v-if="exportEncrypted" class="mb-3">
              <label for="exportPassword" class="form-label">Export Password</label>
              <input
                type="password"
                class="form-control"
                id="exportPassword"
                v-model="exportPassword"
                placeholder="Enter password for export file"
              />
              <small class="text-muted">This password will be required to import the data later</small>
            </div>

            <div class="alert alert-info">
              <strong>Export includes:</strong>
              <ul class="mb-0">
                <li>{{ checksCount }} checks</li>
                <li>{{ receiptsCount }} receipts</li>
                <li>{{ paymentsCount }} payment records</li>
                <li>{{ vendorsCount }} vendors</li>
                <li>{{ bankAccountsCount }} bank accounts</li>
              </ul>
            </div>

            <button class="btn btn-primary" @click="exportData" :disabled="exporting">
              <span v-if="exporting">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Exporting...
              </span>
              <span v-else>📤 Export Data</span>
            </button>

            <div v-if="exportSuccess" class="alert alert-success mt-3">
              ✅ Data exported successfully!
            </div>
          </div>
        </div>
      </div>

      <!-- Import Tab -->
      <div class="tab-pane fade" id="import" role="tabpanel">
        <div class="card">
          <div class="card-body">
            <h5>Import Data</h5>
            <p>Restore data from a previous export file.</p>

            <div class="alert alert-warning">
              <strong>⚠️ Warning:</strong> Importing will replace ALL existing data.
              Consider exporting your current data first as a backup.
            </div>

            <div class="mb-3">
              <label for="importFile" class="form-label">Select Import File</label>
              <input
                type="file"
                class="form-control"
                id="importFile"
                accept=".json"
                @change="onFileSelected"
              />
            </div>

            <div v-if="importFileEncrypted" class="mb-3">
              <label for="importPassword" class="form-label">Import Password</label>
              <input
                type="password"
                class="form-control"
                id="importPassword"
                v-model="importPassword"
                placeholder="Enter password to decrypt import file"
              />
              <small class="text-muted">This file is encrypted and requires a password</small>
            </div>

            <div v-if="importPreview" class="alert alert-info">
              <strong>Import Preview:</strong>
              <ul class="mb-0">
                <li>{{ importPreview.checks }} checks</li>
                <li>{{ importPreview.receipts }} receipts</li>
                <li>{{ importPreview.payments }} payment records</li>
                <li>{{ importPreview.vendors }} vendors</li>
                <li>{{ importPreview.bankAccounts }} bank accounts</li>
              </ul>
            </div>

            <button
              class="btn btn-success"
              @click="importData"
              :disabled="!selectedFile || importing"
            >
              <span v-if="importing">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Importing...
              </span>
              <span v-else>📥 Import Data</span>
            </button>

            <div v-if="importSuccess" class="alert alert-success mt-3">
              ✅ Data imported successfully! Refresh the page to see your imported data.
            </div>

            <div v-if="importError" class="alert alert-danger mt-3">
              ❌ {{ importError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { encrypt, decrypt, isEncrypted } from '@/services/encryption.ts'

// Encryption state
const encryptionEnabled = ref(false)

// Export state
const exportEncrypted = ref(false)
const exportPassword = ref('')
const exporting = ref(false)
const exportSuccess = ref(false)

// Import state
const selectedFile = ref<File | null>(null)
const importFileEncrypted = ref(false)
const importPassword = ref('')
const importing = ref(false)
const importSuccess = ref(false)
const importError = ref('')
const importPreview = ref<any>(null)

// Data counts for export preview
const checksCount = computed(() => {
  const checks = JSON.parse(localStorage.getItem('checkList') || '[]')
  return checks.length
})

const receiptsCount = computed(() => {
  const receipts = JSON.parse(localStorage.getItem('printchecks_receipts') || '[]')
  return receipts.length
})

const paymentsCount = computed(() => {
  const payments = JSON.parse(localStorage.getItem('printchecks_payments') || '[]')
  return payments.length
})

const vendorsCount = computed(() => {
  const vendors = JSON.parse(localStorage.getItem('vendors') || '[]')
  return vendors.length
})

const bankAccountsCount = computed(() => {
  const banks = JSON.parse(localStorage.getItem('bankAccounts') || '[]')
  return banks.length
})

onMounted(() => {
  // Check if encryption is enabled
  encryptionEnabled.value = localStorage.getItem('encryption_enabled') === 'true'
})

function onEncryptionToggle() {
  if (encryptionEnabled.value) {
    // Prompt for password to enable encryption
    const password = prompt('Enter a password to encrypt your data:')
    if (!password) {
      encryptionEnabled.value = false
      return
    }
    const confirmPassword = prompt('Confirm your password:')
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      encryptionEnabled.value = false
      return
    }
    localStorage.setItem('encryption_enabled', 'true')
    sessionStorage.setItem('encryption_password', password)
    alert('Encryption enabled! After 5 minutes of inactivity, you\'ll be prompted to keep your session active.')
  } else {
    if (confirm('Are you sure you want to disable encryption? Your data will no longer be protected.')) {
      localStorage.setItem('encryption_enabled', 'false')
      sessionStorage.removeItem('encryption_password')
    } else {
      encryptionEnabled.value = true
    }
  }
}

function changePassword() {
  const currentPassword = sessionStorage.getItem('encryption_password')
  if (!currentPassword) {
    alert('You must be logged in to change the password')
    return
  }

  const newPassword = prompt('Enter new password:')
  if (!newPassword) return

  const confirmPassword = prompt('Confirm new password:')
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match')
    return
  }

  sessionStorage.setItem('encryption_password', newPassword)
  alert('Password changed successfully')
}

async function exportData() {
  try {
    exporting.value = true
    exportSuccess.value = false

    // Gather all data
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      checks: JSON.parse(localStorage.getItem('checkList') || '[]'),
      receipts: JSON.parse(localStorage.getItem('printchecks_receipts') || '[]'),
      payments: JSON.parse(localStorage.getItem('printchecks_payments') || '[]'),
      vendors: JSON.parse(localStorage.getItem('vendors') || '[]'),
      bankAccounts: JSON.parse(localStorage.getItem('bankAccounts') || '[]'),
      encrypted: exportEncrypted.value
    }

    let dataToExport = exportData

    // Encrypt if requested
    if (exportEncrypted.value) {
      if (!exportPassword.value) {
        alert('Please enter a password for the encrypted export')
        return
      }
      const encryptedData = await encrypt(exportData, exportPassword.value)
      dataToExport = JSON.parse(encryptedData)
    }

    // Create download
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const filename = `printchecks-export-${new Date().toISOString().split('T')[0]}.json`
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)

    exportSuccess.value = true
    setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Export error:', error)
    alert('Failed to export data')
  } finally {
    exporting.value = false
  }
}

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  importError.value = ''
  importPreview.value = null

  try {
    const text = await file.text()
    importFileEncrypted.value = isEncrypted(text)

    // Try to parse preview (without decrypting if encrypted)
    if (!importFileEncrypted.value) {
      const data = JSON.parse(text)
      importPreview.value = {
        checks: data.checks?.length || 0,
        receipts: data.receipts?.length || 0,
        payments: data.payments?.length || 0,
        vendors: data.vendors?.length || 0,
        bankAccounts: data.bankAccounts?.length || 0
      }
    }
  } catch (error) {
    importError.value = 'Invalid import file format'
  }
}

async function importData() {
  if (!selectedFile.value) return

  if (!confirm('⚠️ This will replace ALL existing data. Are you sure you want to continue?')) {
    return
  }

  importing.value = true
  importError.value = ''
  importSuccess.value = false

  try {
    const text = await selectedFile.value.text()
    let importedData

    if (importFileEncrypted.value) {
      if (!importPassword.value) {
        importError.value = 'Please enter the password for this encrypted file'
        importing.value = false
        return
      }
      importedData = await decrypt(text, importPassword.value)
    } else {
      importedData = JSON.parse(text)
    }

    // Validate data structure
    if (!importedData.checks || !importedData.receipts || !importedData.payments) {
      throw new Error('Invalid import file structure')
    }

    // Replace all data
    localStorage.setItem('checkList', JSON.stringify(importedData.checks))
    localStorage.setItem('printchecks_receipts', JSON.stringify(importedData.receipts))
    localStorage.setItem('printchecks_payments', JSON.stringify(importedData.payments))
    localStorage.setItem('vendors', JSON.stringify(importedData.vendors || []))
    localStorage.setItem('bankAccounts', JSON.stringify(importedData.bankAccounts || []))

    importSuccess.value = true
    importing.value = false

    // Reset form after success
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } catch (error: any) {
    console.error('Import error:', error)
    importing.value = false
    if (error.message === 'Incorrect password') {
      importError.value = 'Incorrect password'
    } else {
      importError.value = 'Failed to import data. Please check the file and try again.'
    }
  }
}
</script>

<style scoped>
.import-export-view {
  max-width: 800px;
  margin: 0 auto;
}

.nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.nav-link {
  font-weight: 500;
}

.card {
  border: 1px solid #dee2e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.alert ul {
  padding-left: 1.25rem;
}
</style>
