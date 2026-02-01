# Receipts with Line Items

Create itemized receipts with automatic calculations.

## Basic Receipt

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

// Helper function for calculations
function calculateTotals(items, taxRate = 0.08) {
  const itemsWithTotals = items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice
  }))

  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return { items: itemsWithTotals, subtotal, tax, total }
}

// Create receipt
const lineItems = [
  { description: 'Widget A', quantity: 2, unitPrice: 50.00 },
  { description: 'Widget B', quantity: 1, unitPrice: 75.00 },
  { description: 'Service Fee', quantity: 1, unitPrice: 25.00 }
]

const { items, subtotal, tax, total } = calculateTotals(lineItems)

const receipt = await printChecks.createReceipt({
  receiptNumber: 'R-1001',
  date: new Date(),
  customerName: 'John Smith',
  items,
  subtotal,
  tax,
  total,
  paymentMethod: 'Check #1001',
  notes: 'Thank you for your business!'
})
```

## Vue Example

```vue
<script setup>
import { useReceipts } from '@printchecks/vue'
import { ref, computed } from 'vue'

const { items: receipts, createReceipt } = useReceipts()

const lineItems = ref([
  { description: 'Widget A', quantity: 2, unitPrice: 50.00 },
  { description: 'Widget B', quantity: 1, unitPrice: 75.00 }
])

const taxRate = ref(0.08)

const subtotal = computed(() =>
  lineItems.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
)

const tax = computed(() => subtotal.value * taxRate.value)
const total = computed(() => subtotal.value + tax.value)

const addLineItem = () => {
  lineItems.value.push({ description: '', quantity: 1, unitPrice: 0 })
}

const handleCreate = async () => {
  await createReceipt({
    receiptNumber: `R-${Date.now()}`,
    date: new Date(),
    customerName: 'John Smith',
    items: lineItems.value.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    })),
    subtotal: subtotal.value,
    tax: tax.value,
    total: total.value
  })
}
</script>

<template>
  <div>
    <h2>Create Receipt</h2>

    <div v-for="(item, index) in lineItems" :key="index">
      <input v-model="item.description" placeholder="Description" />
      <input v-model.number="item.quantity" type="number" />
      <input v-model.number="item.unitPrice" type="number" step="0.01" />
      <span>${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
    </div>

    <button @click="addLineItem">Add Line Item</button>

    <div>
      <p>Subtotal: ${{ subtotal.toFixed(2) }}</p>
      <p>Tax ({{ (taxRate * 100).toFixed(0) }}%): ${{ tax.toFixed(2) }}</p>
      <p><strong>Total: ${{ total.toFixed(2) }}</strong></p>
    </div>

    <button @click="handleCreate">Create Receipt</button>
  </div>
</template>
```

## See Also

- [Receipts Guide](/guide/receipts)
- [Basic Check](/examples/basic-check)
