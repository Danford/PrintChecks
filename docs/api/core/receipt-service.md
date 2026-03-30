# ReceiptService

Service for creating, querying, and managing receipts and their line items.

## Overview

`ReceiptService` handles all receipt operations including line item management and shipping/handling charges. It is exposed via `printChecks.receipts` on a `PrintChecksCore` instance, or can be instantiated directly.

## Constructor

```typescript
new ReceiptService(config: ReceiptServiceConfig)
```

```typescript
interface ReceiptServiceConfig {
  storage: StorageAdapter
  autoIncrementReceiptNumber?: boolean  // default: true
}
```

### Example

```typescript
import { ReceiptService, LocalStorageAdapter } from '@printchecks/core'

const service = new ReceiptService({
  storage: new LocalStorageAdapter(),
  autoIncrementReceiptNumber: true
})
```

## Methods

### createReceipt()

Create and persist a new receipt. Auto-sets `receiptNumber` and `date` when omitted and auto-increment is enabled. Validates before saving; throws if validation fails.

```typescript
async createReceipt(data: Partial<ReceiptData>): Promise<Receipt>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Partial<ReceiptData>` | Receipt fields. `receiptNumber` and `date` are auto-set when omitted. `lineItems` defaults to `[]`. |

**Returns:** The created `Receipt` instance with `id`, `createdAt`, and `totals` populated.

**Throws:** `Error` if validation fails (e.g. no line items when required).

```typescript
const receipt = await printChecks.receipts.createReceipt({
  billTo: { name: 'Jane Smith', address: '123 Main St' },
  notes: 'Thank you for your business'
})
// receipt.receiptNumber auto-set to e.g. 'R-1001'
```

### getReceipt()

Retrieve a single receipt by ID.

```typescript
async getReceipt(id: string): Promise<Receipt | null>
```

**Returns:** `Receipt` instance, or `null` if not found.

```typescript
const receipt = await printChecks.receipts.getReceipt('r1')
```

### getReceipts()

Retrieve all receipts, with optional filtering.

```typescript
async getReceipts(filters?: ReceiptFilters): Promise<Receipt[]>
```

#### ReceiptFilters

```typescript
interface ReceiptFilters {
  fromDate?: Date        // inclusive lower bound on receipt date
  toDate?: Date          // inclusive upper bound on receipt date
  minAmount?: number     // inclusive minimum on grandTotal
  maxAmount?: number     // inclusive maximum on grandTotal
  checkId?: string       // filter by linked check
  vendorId?: string      // filter by linked vendor
  searchTerm?: string    // searches receiptNumber, billTo.name, notes, line item descriptions
}
```

**Returns:** Array of matching `Receipt` instances.

```typescript
// Receipts for a date range
const recent = await printChecks.receipts.getReceipts({
  fromDate: new Date('2024-01-01'),
  toDate: new Date('2024-06-30')
})

// Receipts linked to a specific check
const forCheck = await printChecks.receipts.getReceipts({ checkId: 'chk1' })

// Text search across receipt number, billing name, and item descriptions
const results = await printChecks.receipts.getReceipts({ searchTerm: 'widget' })
```

### updateReceipt()

Update fields on an existing receipt. Recalculates totals when `lineItems` are updated. `id` and `createdAt` cannot be overwritten.

```typescript
async updateReceipt(id: string, updates: Partial<ReceiptData>): Promise<Receipt>
```

**Throws:** `Error` if the receipt is not found or the updated state fails validation.

```typescript
const updated = await printChecks.receipts.updateReceipt('r1', {
  notes: 'Revised — net 30'
})
```

### deleteReceipt()

Permanently delete a receipt.

```typescript
async deleteReceipt(id: string): Promise<void>
```

```typescript
await printChecks.receipts.deleteReceipt('r1')
```

### addLineItem()

Add a line item to an existing receipt. Automatically recalculates `totals`.

```typescript
async addLineItem(receiptId: string, itemData: LineItemData): Promise<Receipt>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `receiptId` | `string` | Receipt ID |
| `itemData` | `LineItemData` | Line item fields: `description`, `quantity`, `unitPrice`, `taxRate`, `discountAmount`, etc. |

**Throws:** `Error` if the receipt is not found.

```typescript
const receipt = await printChecks.receipts.addLineItem('r1', {
  description: 'Widget A',
  quantity: 2,
  unitPrice: 50.00
})
console.log(receipt.totals.subtotal) // 100.00
```

### updateLineItem()

Update a specific line item on a receipt. Automatically recalculates `totals`.

```typescript
async updateLineItem(
  receiptId: string,
  itemId: string,
  updates: Partial<LineItemData>
): Promise<Receipt>
```

**Throws:** `Error` if the receipt is not found.

```typescript
const receipt = await printChecks.receipts.updateLineItem('r1', 'item1', {
  quantity: 5
})
```

### removeLineItem()

Remove a line item from a receipt. Automatically recalculates `totals`.

```typescript
async removeLineItem(receiptId: string, itemId: string): Promise<Receipt>
```

**Throws:** `Error` if the receipt is not found.

```typescript
await printChecks.receipts.removeLineItem('r1', 'item1')
```

### setShippingAmount()

Set the shipping charge on a receipt. Recalculates `grandTotal`.

```typescript
async setShippingAmount(receiptId: string, amount: number): Promise<Receipt>
```

**Throws:** `Error` if the receipt is not found.

```typescript
const receipt = await printChecks.receipts.setShippingAmount('r1', 15.00)
console.log(receipt.totals.shippingAmount) // 15
```

### setHandlingAmount()

Set the handling charge on a receipt. Recalculates `grandTotal`.

```typescript
async setHandlingAmount(receiptId: string, amount: number): Promise<Receipt>
```

**Throws:** `Error` if the receipt is not found.

```typescript
const receipt = await printChecks.receipts.setHandlingAmount('r1', 5.00)
```

### getNextReceiptNumber()

Compute the next sequential receipt number from existing receipts. Parses the numeric portion of strings like `'R-1042'`. Returns `'R-1000'` when no receipts exist.

```typescript
async getNextReceiptNumber(): Promise<string>
```

```typescript
const next = await printChecks.receipts.getNextReceiptNumber()
// e.g. 'R-1043'
```

### getReceiptsByCheckId()

Retrieve all receipts linked to a specific check.

```typescript
async getReceiptsByCheckId(checkId: string): Promise<Receipt[]>
```

```typescript
const receipts = await printChecks.receipts.getReceiptsByCheckId('chk1')
```

### getStatistics()

Get aggregate statistics across all receipts.

```typescript
async getStatistics(): Promise<{
  total: number
  totalAmount: number
  averageAmount: number
  totalItems: number
  averageItemsPerReceipt: number
}>
```

| Field | Description |
|-------|-------------|
| `total` | Total number of receipts |
| `totalAmount` | Sum of `grandTotal` across all receipts |
| `averageAmount` | `totalAmount / total` (0 if no receipts) |
| `totalItems` | Total number of line items across all receipts |
| `averageItemsPerReceipt` | `totalItems / total` (0 if no receipts) |

```typescript
const stats = await printChecks.receipts.getStatistics()
console.log(`${stats.total} receipts, avg $${stats.averageAmount.toFixed(2)}`)
```

### importReceipts()

Bulk-import receipts from an array. Each entry is validated; failures are counted but do not halt the import.

```typescript
async importReceipts(receiptsData: ReceiptData[]): Promise<{ success: number; failed: number }>
```

```typescript
const result = await printChecks.receipts.importReceipts(exportedData)
console.log(`Imported ${result.success}, failed ${result.failed}`)
```

### exportReceipts()

Export all receipts as a plain-object array suitable for JSON serialization.

```typescript
async exportReceipts(): Promise<ReceiptData[]>
```

```typescript
const data = await printChecks.receipts.exportReceipts()
```

### clearAll()

Delete all stored receipts. Use with caution — this cannot be undone.

```typescript
async clearAll(): Promise<void>
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Receipt Model](/api/core/models#receipt)
- [Receipts Guide](/guide/receipts)
