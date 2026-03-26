# usePrintableCheckPage

Vue composable for working with the printable check page component. Provides helper methods to load check data, manage line items, and control the printable page display.

## Overview

The `usePrintableCheckPage` composable simplifies working with the `<printchecks-printable-page>` web component in Vue applications. It provides reactive state management and helper methods for loading checks, managing line items, and controlling what's displayed.

## Usage

### Basic Example

```vue
<script setup>
import { usePrintableCheckPage, usePrintChecks } from '@printchecks/vue'
import '@printchecks/web-components'

const { core } = usePrintChecks()
const {
  currentCheckId,
  checkData,
  lineItems,
  loadCheckForPrinting,
  printPage
} = usePrintableCheckPage({ core })

// Load a check
async function loadCheck() {
  await loadCheckForPrinting('check-123')
}

// Print the page
function print() {
  printPage()
}
</script>

<template>
  <div>
    <button @click="loadCheck">Load Check</button>
    <button @click="print">Print</button>

    <printchecks-printable-page
      :check-id="currentCheckId"
      :show-analytics="showAnalytics"
      :show-line-items="showLineItems"
    />
  </div>
</template>
```

### With Line Items Management

```vue
<script setup>
import { usePrintableCheckPage, usePrintChecks } from '@printchecks/vue'

const { core } = usePrintChecks()
const {
  lineItems,
  addLineItem,
  removeLineItem,
  clearLineItems
} = usePrintableCheckPage({ core })

// Add a line item
function addService() {
  addLineItem({
    description: 'Consulting Services',
    quantity: 10,
    unitPrice: 100.00
  })
}

// Remove by index
function removeItem(index: number) {
  removeLineItem(index)
}
</script>

<template>
  <div>
    <button @click="addService">Add Service</button>

    <ul>
      <li v-for="(item, index) in lineItems" :key="index">
        {{ item.description }} - ${{ item.unitPrice }}
        <button @click="removeItem(index)">Remove</button>
      </li>
    </ul>
  </div>
</template>
```

## Options

```typescript
interface UsePrintableCheckPageOptions {
  core: PrintChecksCore
  showAnalytics?: boolean
  showLineItems?: boolean
}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `core` | `PrintChecksCore` | required | PrintChecks core instance |
| `showAnalytics` | `boolean` | `true` | Initial state for showing analytics |
| `showLineItems` | `boolean` | `true` | Initial state for showing line items |

## Return Value

```typescript
interface UsePrintableCheckPageReturn {
  // State
  currentCheckId: Ref<string | null>
  checkData: Ref<Check | null>
  lineItems: Ref<LineItem[]>
  paymentStats: Ref<PaymentStats | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  showAnalytics: Ref<boolean>
  showLineItems: Ref<boolean>

  // Actions
  loadCheckForPrinting: (checkId: string) => Promise<void>
  setCheckData: (check: Check, items?: LineItem[]) => void
  addLineItem: (item: LineItem) => void
  removeLineItem: (index: number) => void
  clearLineItems: () => void
  refreshStats: () => Promise<void>
  printPage: () => void
  toggleAnalytics: () => void
  toggleLineItems: () => void
}
```

## State

### `currentCheckId`
- **Type:** `Ref<string | null>`
- **Description:** The ID of the currently loaded check

### `checkData`
- **Type:** `Ref<Check | null>`
- **Description:** The current check data

### `lineItems`
- **Type:** `Ref<LineItem[]>`
- **Description:** Array of line items for the check

### `paymentStats`
- **Type:** `Ref<PaymentStats | null>`
- **Description:** Payment statistics data

### `isLoading`
- **Type:** `Ref<boolean>`
- **Description:** Loading state indicator

### `error`
- **Type:** `Ref<string | null>`
- **Description:** Error message if operation failed

### `showAnalytics`
- **Type:** `Ref<boolean>`
- **Description:** Whether to show the analytics section

### `showLineItems`
- **Type:** `Ref<boolean>`
- **Description:** Whether to show the line items section

## Actions

### `loadCheckForPrinting(checkId)`

Load a check and prepare it for printing. Fetches the check data, extracts line items, and calculates payment statistics.

**Parameters:**
- `checkId` (`string`) - ID of the check to load

**Returns:** `Promise<void>`

**Example:**
```typescript
await loadCheckForPrinting('check-123')
```

### `setCheckData(check, items?)`

Set check data directly without loading from storage.

**Parameters:**
- `check` (`Check`) - The check data
- `items` (`LineItem[]`, optional) - Array of line items

**Example:**
```typescript
setCheckData(checkData, [
  { description: 'Service', quantity: 1, unitPrice: 100 }
])
```

### `addLineItem(item)`

Add a line item to the current check.

**Parameters:**
- `item` (`LineItem`) - The line item to add

**Example:**
```typescript
addLineItem({
  description: 'Consulting',
  quantity: 10,
  unitPrice: 150.00
})
```

### `removeLineItem(index)`

Remove a line item by its index.

**Parameters:**
- `index` (`number`) - Index of the line item to remove

**Example:**
```typescript
removeLineItem(0) // Remove first item
```

### `clearLineItems()`

Remove all line items.

**Example:**
```typescript
clearLineItems()
```

### `refreshStats()`

Refresh payment statistics from all checks.

**Returns:** `Promise<void>`

**Example:**
```typescript
await refreshStats()
```

### `printPage()`

Trigger the browser's print dialog.

**Example:**
```typescript
printPage()
```

### `toggleAnalytics()`

Toggle the analytics section visibility.

**Example:**
```typescript
toggleAnalytics() // Show/hide analytics
```

### `toggleLineItems()`

Toggle the line items section visibility.

**Example:**
```typescript
toggleLineItems() // Show/hide line items
```

## TypeScript Types

```typescript
interface LineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

interface PaymentStats {
  thisMonth: number
  lastMonth: number
  thisYear: number
  lastYear: number
  thisQuarter: number
  averagePayment: number
  monthlyAverage: number
  largestPayment: number
  smallestPayment: number
  totalCount: number
  allTimeTotal: number
}
```

## Complete Example

```vue
<script setup>
import { ref } from 'vue'
import { usePrintableCheckPage, usePrintChecks } from '@printchecks/vue'
import '@printchecks/web-components'

const { core } = usePrintChecks()
const {
  currentCheckId,
  checkData,
  lineItems,
  paymentStats,
  isLoading,
  error,
  showAnalytics,
  showLineItems,
  loadCheckForPrinting,
  addLineItem,
  removeLineItem,
  printPage,
  toggleAnalytics,
  toggleLineItems
} = usePrintableCheckPage({ core })

const newItemDescription = ref('')
const newItemQuantity = ref(1)
const newItemPrice = ref(0)

async function loadCheck(checkId: string) {
  try {
    await loadCheckForPrinting(checkId)
  } catch (err) {
    console.error('Failed to load check:', err)
  }
}

function addItem() {
  if (newItemDescription.value && newItemQuantity.value > 0 && newItemPrice.value > 0) {
    addLineItem({
      description: newItemDescription.value,
      quantity: newItemQuantity.value,
      unitPrice: newItemPrice.value
    })

    // Reset form
    newItemDescription.value = ''
    newItemQuantity.value = 1
    newItemPrice.value = 0
  }
}
</script>

<template>
  <div class="printable-check-container">
    <!-- Controls -->
    <div class="controls">
      <h2>Printable Check Page</h2>

      <div class="buttons">
        <button @click="loadCheck('check-123')">Load Check</button>
        <button @click="printPage" :disabled="!currentCheckId">Print</button>
        <button @click="toggleAnalytics">
          {{ showAnalytics ? 'Hide' : 'Show' }} Analytics
        </button>
        <button @click="toggleLineItems">
          {{ showLineItems ? 'Hide' : 'Show' }} Line Items
        </button>
      </div>

      <!-- Add line item form -->
      <div v-if="currentCheckId" class="add-item-form">
        <h3>Add Line Item</h3>
        <input
          v-model="newItemDescription"
          placeholder="Description"
          type="text"
        />
        <input
          v-model.number="newItemQuantity"
          placeholder="Quantity"
          type="number"
          min="1"
        />
        <input
          v-model.number="newItemPrice"
          placeholder="Unit Price"
          type="number"
          step="0.01"
          min="0"
        />
        <button @click="addItem">Add Item</button>
      </div>

      <!-- Line items list -->
      <div v-if="lineItems.length > 0" class="line-items-list">
        <h3>Line Items ({{ lineItems.length }})</h3>
        <ul>
          <li v-for="(item, index) in lineItems" :key="index">
            {{ item.description }} - Qty: {{ item.quantity }} × ${{ item.unitPrice.toFixed(2) }}
            = ${{ (item.quantity * item.unitPrice).toFixed(2) }}
            <button @click="removeLineItem(index)">Remove</button>
          </li>
        </ul>
      </div>

      <!-- Loading/Error states -->
      <div v-if="isLoading" class="loading">Loading...</div>
      <div v-if="error" class="error">Error: {{ error }}</div>
    </div>

    <!-- Printable page component -->
    <printchecks-printable-page
      :check-id="currentCheckId"
      :show-analytics="showAnalytics"
      :show-line-items="showLineItems"
      @check-loaded="(e) => console.log('Check loaded:', e.detail)"
      @print-initiated="() => console.log('Print initiated')"
    />
  </div>
</template>

<style scoped>
.controls {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1976D2;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.add-item-form {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.add-item-form input {
  margin-right: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.line-items-list {
  margin-top: 20px;
}

.line-items-list ul {
  list-style: none;
  padding: 0;
}

.line-items-list li {
  padding: 10px;
  margin-bottom: 5px;
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading,
.error {
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
}

.loading {
  background: #e3f2fd;
  color: #1976D2;
}

.error {
  background: #ffebee;
  color: #c62828;
}
</style>
```

## See Also

- [printable-check-page Component](/api/web-components/printable-check-page)
- [Printable Check Page Example](/examples/printable-check-page)
- [usePrintChecks Composable](/api/vue/use-printchecks)
- [useChecks Composable](/api/vue/use-checks)
