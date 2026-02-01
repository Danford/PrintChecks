# usePrintChecks

Main Vue composable for PrintChecks providing unified access to all services.

## Usage

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'

const {
  core,
  checks,
  vendors,
  bankAccounts,
  receipts,
  isInitialized,
  exportData,
  importData,
  clearAllData
} = usePrintChecks()
</script>
```

## Signature

```typescript
function usePrintChecks(config?: PrintChecksCoreConfig): UsePrintChecksReturn
```

## Configuration

Same as [PrintChecksCore configuration](/api/core/printchecks-core#configuration-options):

```typescript
interface PrintChecksCoreConfig {
  storage?: StorageAdapter
  storageOptions?: {
    prefix?: string
    encryption?: boolean
    password?: string
  }
  autoIncrementCheckNumber?: boolean
  autoIncrementReceiptNumber?: boolean
  defaultCurrency?: Currency
  debug?: boolean
}
```

## Return Value

```typescript
interface UsePrintChecksReturn {
  // Core instance
  core: PrintChecksCore

  // Service composables
  checks: UseChecksReturn
  vendors: UseVendorsReturn
  bankAccounts: UseBankAccountsReturn
  receipts: UseReceiptsReturn

  // Global state
  isInitialized: Ref<boolean>

  // Actions
  exportData: () => Promise<ExportData>
  importData: (data: ImportData) => Promise<ImportResult>
  clearAllData: () => Promise<void>
  enableEncryption: (password: string) => Promise<void>
  disableEncryption: (password: string) => Promise<void>
  changeEncryptionPassword: (oldPassword: string, newPassword: string) => Promise<void>
}
```

## Properties

### core

Direct access to the `PrintChecksCore` instance.

```typescript
const { core } = usePrintChecks()

// Access core methods
await core.createCheck({ ... })
```

### checks

The [useChecks](/api/vue/use-checks) composable for check management.

### vendors

The [useVendors](/api/vue/use-vendors) composable for vendor management.

### bankAccounts

The [useBankAccounts](/api/vue/use-bank-accounts) composable for bank account management.

### receipts

The [useReceipts](/api/vue/use-receipts) composable for receipt management.

### isInitialized

Reactive boolean indicating if PrintChecks is initialized.

```vue
<template>
  <div v-if="isInitialized">
    <!-- Your app content -->
  </div>
  <div v-else>
    Loading...
  </div>
</template>
```

## Methods

### exportData()

Export all data to JSON.

```typescript
async exportData(): Promise<ExportData>
```

**Example:**

```vue
<script setup>
const { exportData } = usePrintChecks()

const handleExport = async () => {
  const data = await exportData()
  const json = JSON.stringify(data, null, 2)

  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup-${new Date().toISOString()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
```

### importData()

Import data from JSON.

```typescript
async importData(data: ImportData): Promise<ImportResult>
```

**Example:**

```vue
<script setup>
const { importData } = usePrintChecks()

const handleImport = async (event) => {
  const file = event.target.files[0]
  const text = await file.text()
  const data = JSON.parse(text)

  const result = await importData(data)
  console.log('Import result:', result)
}
</script>

<template>
  <input type="file" accept=".json" @change="handleImport" />
</template>
```

### clearAllData()

Clear all data (use with caution!).

```typescript
async clearAllData(): Promise<void>
```

### enableEncryption()

Enable encryption with a password.

```typescript
async enableEncryption(password: string): Promise<void>
```

### disableEncryption()

Disable encryption.

```typescript
async disableEncryption(password: string): Promise<void>
```

### changeEncryptionPassword()

Change encryption password.

```typescript
async changeEncryptionPassword(oldPassword: string, newPassword: string): Promise<void>
```

## Complete Example

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'

const {
  checks,
  vendors,
  bankAccounts,
  exportData,
  clearAllData
} = usePrintChecks({
  autoIncrementCheckNumber: true,
  defaultCurrency: 'USD'
})

// Create check with vendor
const handleCreateCheck = async () => {
  const vendor = vendors.items.value[0]

  await checks.createCheck({
    checkNumber: await checks.getNextCheckNumber(),
    date: new Date().toLocaleDateString(),
    amount: 1000.00,
    payTo: vendor.name,
    vendorId: vendor.id,
    bankAccountId: bankAccounts.items.value[0].id
  })
}

// Export data
const handleExport = async () => {
  const data = await exportData()
  console.log('Exported:', data)
}

// Clear all (with confirmation)
const handleClear = async () => {
  if (confirm('Are you sure?')) {
    await clearAllData()
  }
}
</script>

<template>
  <div>
    <h1>PrintChecks</h1>

    <div>
      <h2>Checks ({{ checks.items.length }})</h2>
      <ul>
        <li v-for="check in checks.items" :key="check.id">
          {{ check.payTo }} - ${{ check.amount }}
        </li>
      </ul>
      <button @click="handleCreateCheck">Create Check</button>
    </div>

    <div>
      <button @click="handleExport">Export Data</button>
      <button @click="handleClear">Clear All</button>
    </div>
  </div>
</template>
```

## See Also

- [useChecks](/api/vue/use-checks)
- [useVendors](/api/vue/use-vendors)
- [useBankAccounts](/api/vue/use-bank-accounts)
- [useReceipts](/api/vue/use-receipts)
- [PrintChecksCore](/api/core/printchecks-core)
