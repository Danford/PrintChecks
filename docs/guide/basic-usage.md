# Basic Usage

Learn the fundamentals of using PrintChecks in your application.

## Core Concepts

PrintChecks is built around four main entities:

1. **Bank Accounts** - Your banking information for printing checks
2. **Vendors** - Payees you frequently write checks to
3. **Checks** - Individual payment records
4. **Receipts** - Itemized payment documentation

## Initializing PrintChecks

### With Vue 3

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'

const {
  checks,
  vendors,
  bankAccounts,
  receipts,
  createCheck,
  createVendor,
  createBankAccount,
  createReceipt
} = usePrintChecks()
</script>
```

### With Core Library

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

// Access services
const checkService = printChecks.checks
const vendorService = printChecks.vendors
const bankAccountService = printChecks.bankAccounts
const receiptService = printChecks.receipts
```

## Creating Your First Bank Account

Before creating checks, you need at least one bank account:

```typescript
const bankAccount = await printChecks.bankAccounts.create({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking'
})

console.log('Bank account created:', bankAccount.id)
```

## Creating a Vendor

Vendors are optional but help you reuse payee information:

```typescript
const vendor = await printChecks.vendors.create({
  name: 'Acme Corporation',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  email: 'billing@acme.com',
  phone: '555-0123'
})
```

## Creating a Check

Now you can create a check:

```typescript
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corporation',
  amount: 1250.00,
  memo: 'Invoice #12345',
  bankAccountId: bankAccount.id,
  vendorId: vendor.id  // Optional - links to vendor
})
```

## Listing Records

Retrieve all records of a type:

```typescript
// List all checks
const allChecks = await printChecks.checks.list()

// List all vendors
const allVendors = await printChecks.vendors.list()

// List all bank accounts
const allBankAccounts = await printChecks.bankAccounts.list()
```

## Getting a Single Record

Retrieve a specific record by ID:

```typescript
const check = await printChecks.checks.get('check-id')
const vendor = await printChecks.vendors.get('vendor-id')
const bankAccount = await printChecks.bankAccounts.get('account-id')
```

## Updating Records

Update existing records:

```typescript
const updatedCheck = await printChecks.checks.update('check-id', {
  memo: 'Updated memo'
})

const updatedVendor = await printChecks.vendors.update('vendor-id', {
  email: 'newemail@acme.com'
})
```

## Deleting Records

Remove records:

```typescript
await printChecks.checks.delete('check-id')
await printChecks.vendors.delete('vendor-id')
await printChecks.bankAccounts.delete('account-id')
```

## Working with Receipts

Create itemized receipts:

```typescript
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
  total: 189.00
})
```

## Reactive State (Vue)

When using the Vue package, all data is reactive:

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'

const { checks, vendors, createCheck, createVendor } = usePrintChecks()

// Create a new check
const handleCreateCheck = async () => {
  await createCheck({
    checkNumber: 1001,
    date: new Date(),
    payee: 'Acme Corp',
    amount: 100.00,
    bankAccountId: 'account-1'
  })
  // checks array automatically updates!
}
</script>

<template>
  <div>
    <h2>Checks ({{ checks.length }})</h2>
    <ul>
      <li v-for="check in checks" :key="check.id">
        {{ check.payee }} - ${{ check.amount }}
      </li>
    </ul>
  </div>
</template>
```

## Error Handling

Always handle potential errors:

```typescript
try {
  const check = await printChecks.checks.create({
    checkNumber: 1001,
    date: new Date(),
    payee: 'Acme Corp',
    amount: 1250.00,
    bankAccountId: 'invalid-account-id'
  })
} catch (error) {
  console.error('Failed to create check:', error.message)
}
```

## Data Persistence

By default, PrintChecks uses `localStorage` for persistence. All data is automatically saved and loaded:

```typescript
// Data is automatically persisted
const check = await printChecks.checks.create({ ... })

// Refresh the page - data is still there
const checks = await printChecks.checks.list()
console.log('Checks after refresh:', checks)
```

## Next Steps

- [Bank Accounts](/guide/bank-accounts) - Advanced bank account features
- [Checks](/guide/checks) - Check customization and printing
- [Vendors](/guide/vendors) - Vendor management workflows
- [Receipts](/guide/receipts) - Advanced receipt features
- [Storage Adapters](/guide/storage-adapters) - Custom storage solutions
