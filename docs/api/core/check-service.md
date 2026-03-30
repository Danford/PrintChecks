# CheckService

Service for creating, querying, updating, and printing checks.

## Overview

`CheckService` handles all check-related operations. It is exposed via `printChecks.checks` on a `PrintChecksCore` instance, or can be instantiated directly with a `StorageAdapter`.

## Constructor

```typescript
new CheckService(config: CheckServiceConfig)
```

```typescript
interface CheckServiceConfig {
  storage: StorageAdapter
  autoIncrementCheckNumber?: boolean  // default: true
  defaultCurrency?: Currency          // default: 'USD'
}
```

### Example

```typescript
import { CheckService, LocalStorageAdapter } from '@printchecks/core'

const service = new CheckService({
  storage: new LocalStorageAdapter(),
  autoIncrementCheckNumber: true,
  defaultCurrency: 'USD'
})
```

## Methods

### createCheck()

Create and persist a new check. Validates before saving; throws if validation fails.

```typescript
async createCheck(data: Partial<CheckData>): Promise<Check>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Partial<CheckData>` | Check fields. `checkNumber` and `date` are auto-set when omitted and auto-increment is enabled. |

**Returns:** The created `Check` with `id`, `createdAt`, and `amountInWords` populated.

**Throws:** `Error` if validation fails (e.g. invalid routing number, missing required fields).

```typescript
const check = await printChecks.checks.createCheck({
  payTo: 'Acme Corporation',
  amount: 1250.00,
  memo: 'Invoice #12345',
  bankAccountId: 'account-1'
})
// check.checkNumber auto-set to e.g. '1001'
// check.amountInWords → 'One Thousand Two Hundred Fifty Dollars'
```

### getCheck()

Retrieve a single check by ID.

```typescript
async getCheck(id: string): Promise<Check | null>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Check ID |

**Returns:** `Check` instance, or `null` if not found.

```typescript
const check = await printChecks.checks.getCheck('abc123')
if (check) {
  console.log(check.payTo)
}
```

### getChecks()

Retrieve all checks, with optional filtering.

```typescript
async getChecks(filters?: CheckFilters): Promise<Check[]>
```

#### CheckFilters

```typescript
interface CheckFilters {
  status?: CheckStatus          // 'draft' | 'printed' | 'void'
  vendorId?: string             // filter by linked vendor
  bankAccountId?: string        // filter by bank account
  fromDate?: Date               // inclusive lower bound on check date
  toDate?: Date                 // inclusive upper bound on check date
  minAmount?: number            // inclusive minimum amount
  maxAmount?: number            // inclusive maximum amount
  searchTerm?: string           // searches payTo, memo, checkNumber
}
```

**Returns:** Array of matching `Check` instances (empty array if none match).

```typescript
// Filter by bank account
const checks = await printChecks.checks.getChecks({
  bankAccountId: 'account-1'
})

// Date range
const q1Checks = await printChecks.checks.getChecks({
  fromDate: new Date('2024-01-01'),
  toDate: new Date('2024-03-31')
})

// Text search
const results = await printChecks.checks.getChecks({ searchTerm: 'acme' })
```

### updateCheck()

Update fields on an existing check. Re-validates after applying updates. `id` and `createdAt` cannot be overwritten.

```typescript
async updateCheck(id: string, updates: Partial<CheckData>): Promise<Check>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Check ID |
| `updates` | `Partial<CheckData>` | Fields to update. Recalculates `amountInWords` when `amount` changes. |

**Throws:** `Error` if the check is not found or the updated state fails validation.

```typescript
const updated = await printChecks.checks.updateCheck('abc123', {
  amount: 1500.00,
  memo: 'Revised invoice'
})
```

### deleteCheck()

Permanently delete a check.

```typescript
async deleteCheck(id: string): Promise<void>
```

```typescript
await printChecks.checks.deleteCheck('abc123')
```

### markAsPrinted()

Mark a check as printed. The check must not be voided and `canBePrinted()` must return true.

```typescript
async markAsPrinted(id: string): Promise<Check>
```

**Throws:** `Error` if the check is voided, already printed, or otherwise invalid.

```typescript
const printed = await printChecks.checks.markAsPrinted('abc123')
console.log(printed.isPrinted) // true
```

### voidCheck()

Void a check with an optional reason. Only checks where `canBeVoided()` is true can be voided.

```typescript
async voidCheck(id: string, reason?: string): Promise<Check>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Check ID |
| `reason` | `string` (optional) | Reason stored on the check |

**Throws:** `Error` if the check cannot be voided (e.g. already voided).

```typescript
const voided = await printChecks.checks.voidCheck('abc123', 'Wrong amount')
console.log(voided.isVoid)     // true
console.log(voided.voidReason) // 'Wrong amount'
```

### duplicateCheck()

Create a copy of an existing check with a new ID. The copy resets `isPrinted`, `isVoid`, and `status`, and can receive a different check number.

```typescript
async duplicateCheck(id: string, newCheckNumber?: string): Promise<Check>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | ID of the check to copy |
| `newCheckNumber` | `string` (optional) | Number for the copy. Auto-incremented if omitted and auto-increment is enabled. |

```typescript
const copy = await printChecks.checks.duplicateCheck('abc123')
console.log(copy.isPrinted) // false
console.log(copy.isVoid)    // false
```

### getNextCheckNumber()

Compute the next sequential check number from existing check numbers. Returns `'1000'` when no checks exist.

```typescript
async getNextCheckNumber(): Promise<string>
```

```typescript
const next = await printChecks.checks.getNextCheckNumber()
// e.g. '1042'
```

### getStatistics()

Get aggregate statistics across all checks.

```typescript
async getStatistics(): Promise<{
  total: number
  printed: number
  void: number
  draft: number
  totalAmount: number
}>
```

| Field | Description |
|-------|-------------|
| `total` | Total number of checks |
| `printed` | Checks where `isPrinted` is true |
| `void` | Checks where `isVoid` is true |
| `draft` | Checks with `status === 'draft'` |
| `totalAmount` | Sum of amounts for non-voided checks |

```typescript
const stats = await printChecks.checks.getStatistics()
console.log(`${stats.printed} of ${stats.total} checks printed`)
console.log(`Total paid: $${stats.totalAmount.toFixed(2)}`)
```

### loadFromRecentCheck()

Return the account-holder and bank fields from the most recent check, for use as defaults when creating a new check.

```typescript
async loadFromRecentCheck(): Promise<Partial<CheckData> | null>
```

**Returns:** Object containing `accountHolderName`, `bankName`, `routingNumber`, `bankAccountNumber`, `signature`, and `bankAccountId`, or `null` if no checks exist.

```typescript
const defaults = await printChecks.checks.loadFromRecentCheck()
if (defaults) {
  const check = await printChecks.checks.createCheck({
    ...defaults,
    payTo: 'New Vendor',
    amount: 500
  })
}
```

### clearAll()

Delete all stored checks. Use with caution — this cannot be undone.

```typescript
async clearAll(): Promise<void>
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Check Model](/api/core/models#check)
- [Checks Guide](/guide/checks)
