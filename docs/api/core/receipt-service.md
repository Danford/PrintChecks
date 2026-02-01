# ReceiptService

Service for managing receipts and line items.

## Overview

The `ReceiptService` handles receipt operations including line item management.

## API Reference

For full API details, see [PrintChecksCore - Receipt Methods](/api/core/printchecks-core#receipt-methods).

## Key Methods

- `createReceipt(data)` - Create a new receipt
- `getReceipt(id)` - Get receipt by ID
- `getReceipts(filters)` - Get all receipts
- `updateReceipt(id, updates)` - Update a receipt
- `deleteReceipt(id)` - Delete a receipt
- `addLineItem(receiptId, itemData)` - Add line item
- `updateLineItem(receiptId, itemId, updates)` - Update line item
- `removeLineItem(receiptId, itemId)` - Remove line item

## Example

```typescript
const printChecks = new PrintChecksCore()

// Create receipt
const receipt = await printChecks.receipts.createReceipt({
  receiptNumber: 'R-1001',
  date: new Date(),
  customerName: 'John Smith',
  items: [
    {
      description: 'Widget A',
      quantity: 2,
      unitPrice: 50.00,
      total: 100.00
    }
  ],
  subtotal: 100.00,
  tax: 8.00,
  total: 108.00
})

// Add line item
await printChecks.receipts.addLineItem(receipt.id, {
  description: 'Widget B',
  quantity: 1,
  unitPrice: 25.00,
  total: 25.00
})
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Receipt Model](/api/core/models#receipt)
- [Receipts Guide](/guide/receipts)
