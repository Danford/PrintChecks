# CheckService

Service for managing checks.

## Overview

The `CheckService` handles all check-related operations including creation, updating, printing, and voiding.

## API Reference

For full API details, see [PrintChecksCore - Check Methods](/api/core/printchecks-core#check-methods).

## Key Methods

- `createCheck(data)` - Create a new check
- `getCheck(id)` - Get check by ID
- `getChecks(filters)` - Get checks with filters
- `updateCheck(id, updates)` - Update a check
- `deleteCheck(id)` - Delete a check
- `markAsPrinted(id)` - Mark check as printed
- `voidCheck(id, reason)` - Void a check
- `duplicateCheck(id, newCheckNumber)` - Duplicate a check
- `getNextCheckNumber()` - Get next check number
- `getStatistics()` - Get check statistics

## Example

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

// Create check
const check = await printChecks.checks.createCheck({
  checkNumber: '1001',
  date: new Date().toLocaleDateString(),
  amount: 1250.00,
  payTo: 'Acme Corporation',
  memo: 'Invoice #12345'
})

// List checks
const allChecks = await printChecks.checks.getChecks()

// Filter checks
const recentChecks = await printChecks.checks.getChecks({
  fromDate: new Date('2024-01-01'),
  minAmount: 100
})
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Check Model](/api/core/models#check)
- [Checks Guide](/guide/checks)
