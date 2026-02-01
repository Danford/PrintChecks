# Receipts

Create itemized receipts with line items and automatic calculations.

## Overview

Receipts provide detailed payment documentation with itemized line items, subtotals, tax, and total calculations.

## Creating a Receipt

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

const receipt = await printChecks.receipts.create({
  receiptNumber: 'R-1001',
  date: new Date(),
  customerName: 'John Smith',
  items: [
    {
      description: 'Widget A',
      quantity: 2,
      unitPrice: 50.00,
      total: 100.00
    },
    {
      description: 'Widget B',
      quantity: 1,
      unitPrice: 75.00,
      total: 75.00
    }
  ],
  subtotal: 175.00,
  tax: 14.00,
  total: 189.00,
  notes: 'Thank you for your business!'
})
```

## Receipt Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `receiptNumber` | `string` | Yes | Unique receipt identifier |
| `date` | `Date` | Yes | Receipt date |
| `customerName` | `string` | Yes | Customer name |
| `items` | `LineItem[]` | Yes | Array of line items |
| `subtotal` | `number` | Yes | Subtotal before tax |
| `tax` | `number` | No | Tax amount |
| `total` | `number` | Yes | Total amount |
| `notes` | `string` | No | Additional notes |
| `paymentMethod` | `string` | No | Payment method (check, cash, etc.) |

## Line Item Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `description` | `string` | Yes | Item description |
| `quantity` | `number` | Yes | Quantity |
| `unitPrice` | `number` | Yes | Price per unit |
| `total` | `number` | Yes | Line item total |

## Automatic Calculations

Helper function for calculating receipt totals:

```typescript
interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total?: number
}

function calculateReceiptTotals(items: LineItem[], taxRate: number = 0.08) {
  // Calculate line totals
  const itemsWithTotals = items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice
  }))

  // Calculate subtotal
  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0)

  // Calculate tax
  const tax = subtotal * taxRate

  // Calculate total
  const total = subtotal + tax

  return {
    items: itemsWithTotals,
    subtotal,
    tax,
    total
  }
}

// Use it
const { items, subtotal, tax, total } = calculateReceiptTotals([
  { description: 'Widget A', quantity: 2, unitPrice: 50.00 },
  { description: 'Widget B', quantity: 1, unitPrice: 75.00 }
], 0.08)

const receipt = await printChecks.receipts.create({
  receiptNumber: 'R-1001',
  date: new Date(),
  customerName: 'John Smith',
  items,
  subtotal,
  tax,
  total
})
```

## Listing Receipts

```typescript
const receipts = await printChecks.receipts.list()

// Sort by date (newest first)
const sorted = receipts.sort((a, b) =>
  new Date(b.date).getTime() - new Date(a.date).getTime()
)

// Filter by customer
const customerReceipts = receipts.filter(r =>
  r.customerName.toLowerCase().includes('smith')
)

// Filter by date range
const thisMonth = receipts.filter(r => {
  const receiptDate = new Date(r.date)
  const now = new Date()
  return receiptDate.getMonth() === now.getMonth() &&
         receiptDate.getFullYear() === now.getFullYear()
})
```

## Getting a Specific Receipt

```typescript
const receipt = await printChecks.receipts.get('receipt-id')
console.log(`Receipt ${receipt.receiptNumber} - Total: $${receipt.total}`)
```

## Updating a Receipt

```typescript
const updated = await printChecks.receipts.update('receipt-id', {
  notes: 'Updated notes',
  paymentMethod: 'Check #1001'
})
```

## Deleting a Receipt

```typescript
await printChecks.receipts.delete('receipt-id')
```

## Receipt with Check Payment

Link a receipt to a check:

```typescript
// Create check
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'John Smith',
  amount: 189.00,
  memo: 'Receipt R-1001',
  bankAccountId: 'account-id'
})

// Create receipt
const receipt = await printChecks.receipts.create({
  receiptNumber: 'R-1001',
  date: new Date(),
  customerName: 'John Smith',
  items: [...],
  subtotal: 175.00,
  tax: 14.00,
  total: 189.00,
  paymentMethod: `Check #${check.checkNumber}`
})
```

## Receipt Numbering

Generate sequential receipt numbers:

```typescript
async function getNextReceiptNumber(): Promise<string> {
  const receipts = await printChecks.receipts.list()

  if (receipts.length === 0) {
    return 'R-1001'
  }

  // Extract numeric part and find max
  const numbers = receipts
    .map(r => parseInt(r.receiptNumber.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n))

  const maxNumber = Math.max(...numbers, 1000)
  return `R-${maxNumber + 1}`
}

// Use it
const nextNumber = await getNextReceiptNumber()
```

## Printing Receipts

Generate printable receipt HTML:

```typescript
function generateReceiptHTML(receipt: Receipt): string {
  return `
    <div class="receipt">
      <h1>Receipt</h1>
      <p>Receipt #: ${receipt.receiptNumber}</p>
      <p>Date: ${receipt.date.toLocaleDateString()}</p>
      <p>Customer: ${receipt.customerName}</p>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${receipt.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>$${item.unitPrice.toFixed(2)}</td>
              <td>$${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <p>Subtotal: $${receipt.subtotal.toFixed(2)}</p>
        <p>Tax: $${receipt.tax.toFixed(2)}</p>
        <p><strong>Total: $${receipt.total.toFixed(2)}</strong></p>
      </div>

      ${receipt.notes ? `<p class="notes">${receipt.notes}</p>` : ''}
    </div>
  `
}
```

## Using with Vue

```vue
<script setup>
import { useReceipts } from '@printchecks/vue'
import { ref, computed } from 'vue'

const { receipts, createReceipt } = useReceipts()

const items = ref([
  { description: '', quantity: 1, unitPrice: 0 }
])

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
)

const tax = computed(() => subtotal.value * 0.08)
const total = computed(() => subtotal.value + tax.value)

const handleSubmit = async () => {
  const receiptNumber = `R-${Date.now()}`

  await createReceipt({
    receiptNumber,
    date: new Date(),
    customerName: 'John Smith',
    items: items.value.map(item => ({
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
    <div v-for="(item, index) in items" :key="index">
      <input v-model="item.description" placeholder="Description" />
      <input v-model.number="item.quantity" type="number" />
      <input v-model.number="item.unitPrice" type="number" step="0.01" />
    </div>

    <p>Subtotal: ${{ subtotal.toFixed(2) }}</p>
    <p>Tax: ${{ tax.toFixed(2) }}</p>
    <p>Total: ${{ total.toFixed(2) }}</p>

    <button @click="handleSubmit">Create Receipt</button>
  </div>
</template>
```

## Next Steps

- [Checks](/guide/checks) - Link receipts to check payments
- [Data Management](/guide/data-management) - Export receipt data
- [API Reference](/api/core/receipt-service) - Complete API documentation
