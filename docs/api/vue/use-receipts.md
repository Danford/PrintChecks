# useReceipts

Vue composable for managing receipts and line items.

## Usage

```vue
<script setup>
import { useReceipts } from '@printchecks/vue'

const {
  items,
  isLoading,
  error,
  createReceipt,
  addLineItem,
  updateLineItem,
  removeLineItem
} = useReceipts()
</script>
```

## Return Value

```typescript
interface UseReceiptsReturn {
  // State
  items: Ref<Receipt[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>

  // Actions
  loadReceipts: () => Promise<void>
  createReceipt: (data: Partial<ReceiptData>) => Promise<Receipt>
  updateReceipt: (id: string, updates: Partial<ReceiptData>) => Promise<Receipt>
  deleteReceipt: (id: string) => Promise<void>
  getReceipt: (id: string) => Promise<Receipt | null>
  addLineItem: (receiptId: string, item: LineItemData) => Promise<Receipt>
  updateLineItem: (receiptId: string, itemId: string, updates: Partial<LineItemData>) => Promise<Receipt>
  removeLineItem: (receiptId: string, itemId: string) => Promise<Receipt>
}
```

## Example

```vue
<script setup>
import { useReceipts } from '@printchecks/vue'
import { ref, computed } from 'vue'

const { items: receipts, createReceipt, addLineItem } = useReceipts()

const lineItems = ref([
  { description: 'Widget A', quantity: 2, unitPrice: 50.00 }
])

const subtotal = computed(() =>
  lineItems.value.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
)

const tax = computed(() => subtotal.value * 0.08)
const total = computed(() => subtotal.value + tax.value)

const handleCreate = async () => {
  await createReceipt({
    receiptNumber: 'R-1001',
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
    <p>Subtotal: ${{ subtotal.toFixed(2) }}</p>
    <p>Tax: ${{ tax.toFixed(2) }}</p>
    <p>Total: ${{ total.toFixed(2) }}</p>
    <button @click="handleCreate">Create</button>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [Receipts Guide](/guide/receipts)
