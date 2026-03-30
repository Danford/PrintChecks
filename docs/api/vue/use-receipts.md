# useReceipts

Vue composable for managing receipts and line items.

## Usage

```vue
<script setup>
import { useReceipts } from '@printchecks/vue'

const {
  receipts,
  currentReceipt,
  isLoading,
  error,
  isValid,
  hasLineItems,
  receiptCount,
  loadReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  addLineItem,
  updateLineItem,
  removeLineItem,
  clearCurrentReceipt
} = useReceipts()
</script>
```

## Return Value

```typescript
interface UseReceiptsReturn {
  // State
  currentReceipt: Ref<Receipt | null>     // the currently loaded/edited receipt
  receipts: Ref<Receipt[]>                // all loaded receipts
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Computed
  isValid: ComputedRef<boolean>           // true when currentReceipt passes validation
  hasLineItems: ComputedRef<boolean>      // true when currentReceipt has ≥1 line item
  receiptCount: ComputedRef<number>       // total number of receipts

  // Actions
  loadReceipts: () => Promise<void>
  loadReceipt: (id: string) => Promise<void>
  createReceipt: (data: Partial<ReceiptData>) => Promise<Receipt>
  updateReceipt: (id: string, updates: Partial<ReceiptData>) => Promise<Receipt>
  deleteReceipt: (id: string) => Promise<void>
  addLineItem: (receiptId: string, item: LineItemData) => Promise<Receipt>
  updateLineItem: (receiptId: string, itemId: string, updates: Partial<LineItemData>) => Promise<Receipt>
  removeLineItem: (receiptId: string, itemId: string) => Promise<Receipt>
  clearCurrentReceipt: () => void
}
```

## Key Behaviours

- `receipts` is the reactive list of all receipts; call `loadReceipts()` to populate it.
- `currentReceipt` holds the receipt being viewed or edited. Use `loadReceipt(id)` to set it.
- `hasLineItems` and `isValid` are computed from `currentReceipt` and update reactively.
- `addLineItem`/`updateLineItem`/`removeLineItem` automatically recalculate totals.
- `receiptNumber` is auto-incremented (format `R-NNNN`) when not provided to `createReceipt`.

## Example

```vue
<script setup>
import { useReceipts } from '@printchecks/vue'
import { onMounted } from 'vue'

const {
  receipts,
  currentReceipt,
  isValid,
  hasLineItems,
  loadReceipts,
  createReceipt,
  addLineItem,
  removeLineItem
} = useReceipts()

onMounted(loadReceipts)

const handleCreate = async () => {
  const receipt = await createReceipt({
    billTo: { name: 'Jane Smith', address: '123 Main St' }
  })
  // Add line items after creation
  await addLineItem(receipt.id, {
    description: 'Widget A',
    quantity: 2,
    unitPrice: 50.00
  })
  await loadReceipts()
}
</script>

<template>
  <div>
    <h2>Receipts ({{ receipts.length }})</h2>
    <ul>
      <li v-for="receipt in receipts" :key="receipt.id">
        {{ receipt.receiptNumber }} — {{ receipt.billTo?.name }}
        — ${{ receipt.totals.grandTotal.toFixed(2) }}
        ({{ receipt.lineItems.length }} items)
      </li>
    </ul>

    <div v-if="currentReceipt">
      <p>Has items: {{ hasLineItems }}</p>
      <p>Valid: {{ isValid }}</p>
    </div>

    <button @click="handleCreate">New Receipt</button>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [ReceiptService](/api/core/receipt-service)
- [Receipts Guide](/guide/receipts)
