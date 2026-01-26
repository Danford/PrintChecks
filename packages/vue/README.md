# @printchecks/vue

Vue 3 integration layer for the PrintChecks core library. Provides reactive composables for managing checks, vendors, bank accounts, and receipts in Vue applications.

## Installation

```bash
npm install @printchecks/vue @printchecks/core vue
```

## Quick Start

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'
import { LocalStorageAdapter } from '@printchecks/core/storage'

// Initialize PrintChecks with configuration
const { checks, vendors, bankAccounts, receipts } = usePrintChecks({
  storage: new LocalStorageAdapter({ prefix: 'myapp_' }),
  autoIncrementCheckNumber: true,
  defaultCurrency: 'USD'
})

// Load initial data
checks.loadChecks()
vendors.loadVendors()
bankAccounts.loadAccounts()

// Create a new check
async function createNewCheck() {
  const check = await checks.createCheck({
    checkNumber: '1001',
    date: new Date().toISOString(),
    payee: 'John Doe',
    amount: '100.00',
    memo: 'Payment for services'
  })
  
  console.log('Check created:', check)
}
</script>

<template>
  <div>
    <h1>Checks ({{ checks.checks.value.length }})</h1>
    <button @click="createNewCheck">Create Check</button>
    
    <div v-if="checks.isLoading.value">Loading...</div>
    <div v-if="checks.error.value">Error: {{ checks.error.value }}</div>
    
    <ul>
      <li v-for="check in checks.checks.value" :key="check.id">
        Check #{{ check.checkNumber }} - {{ check.payee }} - ${{ check.amount }}
      </li>
    </ul>
  </div>
</template>
```

## Composables

### `usePrintChecks(config)`

Main composable that provides access to all services.

```typescript
const {
  core,              // Core PrintChecks instance
  checks,            // Check management composable
  vendors,           // Vendor management composable
  bankAccounts,      // Bank account management composable
  receipts,          // Receipt management composable
  isInitialized,     // Initialization state
  exportData,        // Export all data
  importData,        // Import data
  clearAllData,      // Clear all data
  enableEncryption,  // Enable encryption
  disableEncryption, // Disable encryption
  changeEncryptionPassword // Change password
} = usePrintChecks(config)
```

### `useChecks(options)`

Composable for check management.

```typescript
const {
  currentCheck,      // Currently selected check
  checks,            // List of all checks
  isLoading,         // Loading state
  error,             // Error message
  hasUnsavedChanges, // Unsaved changes flag
  isValid,           // Validation state
  amountInWords,     // Amount converted to words
  nextCheckNumber,   // Next available check number
  createCheck,       // Create a new check
  updateCheck,       // Update current check
  saveCheck,         // Save current check
  deleteCheck,       // Delete a check
  loadCheck,         // Load a specific check
  loadChecks,        // Load all checks
  markAsPrinted,     // Mark check as printed
  voidCheck,         // Void a check
  duplicateCheck,    // Duplicate a check
  validateCheck,     // Validate current check
  clearCurrentCheck  // Clear current check
} = useChecks(options)
```

### `useVendors(options)`

Composable for vendor management.

```typescript
const {
  currentVendor,     // Currently selected vendor
  vendors,           // List of all vendors
  isLoading,         // Loading state
  error,             // Error message
  favoriteVendors,   // List of favorite vendors
  vendorCount,       // Total vendor count
  createVendor,      // Create a new vendor
  updateVendor,      // Update a vendor
  deleteVendor,      // Delete a vendor
  loadVendor,        // Load a specific vendor
  loadVendors,       // Load all vendors
  searchVendors,     // Search vendors
  toggleFavorite,    // Toggle vendor favorite status
  addTag,            // Add a tag to vendor
  removeTag,         // Remove a tag from vendor
  clearCurrentVendor // Clear current vendor
} = useVendors(options)
```

### `useBankAccounts(options)`

Composable for bank account management.

```typescript
const {
  currentAccount,    // Currently selected account
  accounts,          // List of all accounts
  isLoading,         // Loading state
  error,             // Error message
  defaultAccount,    // Default bank account
  accountCount,      // Total account count
  createAccount,     // Create a new account
  updateAccount,     // Update an account
  deleteAccount,     // Delete an account
  loadAccount,       // Load a specific account
  loadAccounts,      // Load all accounts
  setDefaultAccount, // Set default account
  clearCurrentAccount // Clear current account
} = useBankAccounts(options)
```

### `useReceipts(options)`

Composable for receipt management.

```typescript
const {
  currentReceipt,    // Currently selected receipt
  receipts,          // List of all receipts
  isLoading,         // Loading state
  error,             // Error message
  isValid,           // Validation state
  hasLineItems,      // Has line items flag
  receiptCount,      // Total receipt count
  createReceipt,     // Create a new receipt
  updateReceipt,     // Update current receipt
  deleteReceipt,     // Delete a receipt
  loadReceipt,       // Load a specific receipt
  loadReceipts,      // Load all receipts
  addLineItem,       // Add a line item
  updateLineItem,    // Update a line item
  removeLineItem,    // Remove a line item
  clearCurrentReceipt // Clear current receipt
} = useReceipts(options)
```

## Advanced Usage

### With Encryption

```typescript
import { usePrintChecks } from '@printchecks/vue'
import { LocalStorageAdapter } from '@printchecks/core/storage'

const printChecks = usePrintChecks({
  storage: new LocalStorageAdapter(),
  storageOptions: {
    prefix: 'myapp_',
    encryption: true,
    password: 'my-secure-password'
  }
})

// Change password later
await printChecks.changeEncryptionPassword('old-password', 'new-password')
```

### With Filters

```typescript
// Load only printed checks
await checks.loadChecks({
  status: 'printed',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
})

// Load only favorite vendors
await vendors.loadVendors({
  favorite: true
})

// Load checking accounts only
await bankAccounts.loadAccounts({
  type: 'checking'
})
```

### Reactive Updates

All state is reactive and will automatically update your components:

```vue
<script setup>
const { checks } = usePrintChecks()

// This will automatically trigger re-render when checks are loaded
checks.loadChecks()

// Watch for changes
watch(() => checks.currentCheck.value, (newCheck) => {
  console.log('Check changed:', newCheck)
})
</script>

<template>
  <div>
    <!-- Automatically updates when checks.checks changes -->
    <p>Total checks: {{ checks.checks.value.length }}</p>
    
    <!-- Automatically shows/hides based on loading state -->
    <div v-if="checks.isLoading.value">Loading checks...</div>
    
    <!-- Automatically shows when there's an error -->
    <div v-if="checks.error.value" class="error">
      {{ checks.error.value }}
    </div>
  </div>
</template>
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type {
  Check,
  CheckData,
  Vendor,
  VendorData,
  BankAccount,
  BankAccountData,
  Receipt,
  ReceiptData,
  UseChecksReturn,
  UseVendorsReturn
} from '@printchecks/vue'
```

## License

MIT
