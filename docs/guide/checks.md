# Checks

Create, manage, and print professional checks.

## Overview

Checks are the core entity in PrintChecks. Each check represents a payment with all the information needed for printing on standard check stock.

## Creating a Check

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corporation',
  amount: 1250.00,
  memo: 'Invoice #12345',
  bankAccountId: 'bank-account-id',

  // Optional fields
  vendorId: 'vendor-id',
  address: '123 Main St, Springfield, IL 62701',
  signature: 'John Doe'
})
```

## Check Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `checkNumber` | `number` | Yes | Sequential check number |
| `date` | `Date` | Yes | Check date |
| `payee` | `string` | Yes | Who the check is payable to |
| `amount` | `number` | Yes | Check amount in dollars |
| `bankAccountId` | `string` | Yes | ID of associated bank account |
| `memo` | `string` | No | Memo line text |
| `vendorId` | `string` | No | Link to a vendor record |
| `address` | `string` | No | Payee address |
| `signature` | `string` | No | Signature text/name |

## Amount to Words Conversion

PrintChecks automatically converts numeric amounts to words for the written line:

```typescript
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1250.50,
  bankAccountId: 'account-id'
})

// Automatically generates:
// "One Thousand Two Hundred Fifty and 50/100 Dollars"
```

## Listing Checks

```typescript
// Get all checks
const checks = await printChecks.checks.list()

// Sort by check number
const sorted = checks.sort((a, b) => a.checkNumber - b.checkNumber)

// Filter by date range
const recent = checks.filter(check => {
  const checkDate = new Date(check.date)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return checkDate >= thirtyDaysAgo
})

// Filter by payee
const acmeChecks = checks.filter(check =>
  check.payee.toLowerCase().includes('acme')
)
```

## Getting a Specific Check

```typescript
const check = await printChecks.checks.get('check-id')
console.log(`Check #${check.checkNumber} to ${check.payee}`)
```

## Updating a Check

```typescript
const updated = await printChecks.checks.update('check-id', {
  memo: 'Updated memo',
  signature: 'Jane Doe'
})
```

::: tip
Only update checks that haven't been printed. Modifying printed checks can cause discrepancies.
:::

## Deleting a Check

```typescript
await printChecks.checks.delete('check-id')
```

::: warning
Deleting a check is permanent and cannot be undone. Consider marking checks as void instead.
:::

## Void Checks

While PrintChecks doesn't have a built-in "void" status, you can implement it:

```typescript
const voided = await printChecks.checks.update('check-id', {
  memo: 'VOID - ' + check.memo,
  amount: 0
})
```

## Check Sequencing

Maintain sequential check numbers:

```typescript
async function getNextCheckNumber(bankAccountId: string): Promise<number> {
  const checks = await printChecks.checks.list()

  // Filter checks for this bank account
  const accountChecks = checks.filter(c => c.bankAccountId === bankAccountId)

  if (accountChecks.length === 0) {
    return 1001 // Starting check number
  }

  // Find highest check number
  const maxCheckNumber = Math.max(...accountChecks.map(c => c.checkNumber))
  return maxCheckNumber + 1
}

// Use it
const nextNumber = await getNextCheckNumber('account-id')
const check = await printChecks.checks.create({
  checkNumber: nextNumber,
  date: new Date(),
  payee: 'Vendor',
  amount: 100.00,
  bankAccountId: 'account-id'
})
```

## Linking to Vendors

Link checks to vendors for tracking:

```typescript
// Create vendor
const vendor = await printChecks.vendors.create({
  name: 'Acme Corporation',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
})

// Create check with vendor link
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: vendor.name,
  amount: 1250.00,
  bankAccountId: 'account-id',
  vendorId: vendor.id  // Links to vendor
})

// Find all checks for a vendor
const vendorChecks = (await printChecks.checks.list())
  .filter(c => c.vendorId === vendor.id)
```

## Printing Checks

Checks can be printed using the browser's print functionality:

```typescript
// Generate check HTML for printing
function generateCheckHTML(check: Check, bankAccount: BankAccount): string {
  return `
    <div class="check">
      <div class="check-number">${check.checkNumber}</div>
      <div class="date">${check.date.toLocaleDateString()}</div>
      <div class="payee">${check.payee}</div>
      <div class="amount">$${check.amount.toFixed(2)}</div>
      <div class="amount-words">${amountToWords(check.amount)}</div>
      <div class="memo">${check.memo}</div>
      <div class="micr">
        <span class="routing">${bankAccount.routingNumber}</span>
        <span class="account">${bankAccount.accountNumber}</span>
        <span class="check-number">${check.checkNumber}</span>
      </div>
    </div>
  `
}

// Print
window.print()
```

## Check Customization

Customize check appearance:

```typescript
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1250.00,
  bankAccountId: 'account-id',

  // Custom styling (stored in metadata)
  metadata: {
    fontFamily: 'Arial',
    fontSize: '12pt',
    logoUrl: '/path/to/logo.png',
    signatureFont: 'Brush Script'
  }
})
```

## Using with Vue

```vue
<script setup>
import { useChecks, useBankAccounts } from '@printchecks/vue'

const { checks, createCheck } = useChecks()
const { bankAccounts } = useBankAccounts()

const handleCreateCheck = async (formData) => {
  await createCheck({
    checkNumber: formData.checkNumber,
    date: new Date(),
    payee: formData.payee,
    amount: parseFloat(formData.amount),
    memo: formData.memo,
    bankAccountId: formData.bankAccountId
  })
}
</script>

<template>
  <div>
    <h2>Checks ({{ checks.length }})</h2>
    <table>
      <thead>
        <tr>
          <th>Check #</th>
          <th>Date</th>
          <th>Payee</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="check in checks" :key="check.id">
          <td>{{ check.checkNumber }}</td>
          <td>{{ new Date(check.date).toLocaleDateString() }}</td>
          <td>{{ check.payee }}</td>
          <td>${{ check.amount.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

## Using with Web Components

```html
<check-form bank-account-id="account-1"></check-form>
<check-preview check-id="check-1"></check-preview>

<script type="module">
  import '@printchecks/web-components'

  const form = document.querySelector('check-form')
  form.addEventListener('check-created', (event) => {
    console.log('Check created:', event.detail)
  })
</script>
```

## Next Steps

- [Vendors](/guide/vendors) - Link checks to vendors
- [Customization](/guide/customization) - Customize check appearance
- [API Reference](/api/core/check-service) - Complete API documentation
