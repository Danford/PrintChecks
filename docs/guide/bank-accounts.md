# Bank Accounts

Manage multiple bank accounts for check printing.

## Overview

Bank accounts store the routing number, account number, and other details needed for printing checks. You can manage multiple accounts for different purposes (business, personal, trust accounts, etc.).

## Creating a Bank Account

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

const bankAccount = await printChecks.bankAccounts.create({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking',

  // Optional fields
  accountHolderName: 'Acme Corporation',
  address: '123 Business Blvd',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  phone: '555-0100'
})
```

## Bank Account Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Display name for the account |
| `routingNumber` | `string` | Yes | 9-digit bank routing number (ABA number) |
| `accountNumber` | `string` | Yes | Bank account number |
| `bankName` | `string` | Yes | Name of the bank |
| `accountType` | `'checking' \| 'savings'` | Yes | Type of account |
| `accountHolderName` | `string` | No | Name on the account |
| `address` | `string` | No | Account holder address |
| `city` | `string` | No | City |
| `state` | `string` | No | State (2-letter code) |
| `zip` | `string` | No | ZIP code |
| `phone` | `string` | No | Contact phone number |

## Listing Bank Accounts

```typescript
const accounts = await printChecks.bankAccounts.list()

accounts.forEach(account => {
  console.log(`${account.name} - ${account.bankName}`)
  console.log(`Routing: ${account.routingNumber}`)
  console.log(`Account: ${account.accountNumber}`)
})
```

## Getting a Specific Account

```typescript
const account = await printChecks.bankAccounts.get('account-id')
console.log('Account details:', account)
```

## Updating a Bank Account

```typescript
const updated = await printChecks.bankAccounts.update('account-id', {
  name: 'Updated Business Checking',
  phone: '555-0199'
})
```

## Deleting a Bank Account

```typescript
await printChecks.bankAccounts.delete('account-id')
```

::: warning
Deleting a bank account will not delete associated checks, but checks will lose their bank account reference.
:::

## Multiple Accounts

PrintChecks supports multiple bank accounts for different purposes:

```typescript
// Business checking
const businessChecking = await printChecks.bankAccounts.create({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '111111111',
  bankName: 'Business Bank',
  accountType: 'checking'
})

// Personal checking
const personalChecking = await printChecks.bankAccounts.create({
  name: 'Personal Checking',
  routingNumber: '987654321',
  accountNumber: '222222222',
  bankName: 'Personal Bank',
  accountType: 'checking'
})

// Trust account
const trustAccount = await printChecks.bankAccounts.create({
  name: 'Trust Account',
  routingNumber: '555555555',
  accountNumber: '333333333',
  bankName: 'Trust Bank',
  accountType: 'savings'
})

// Use different accounts for different checks
await printChecks.checks.create({
  checkNumber: 1001,
  payee: 'Vendor A',
  amount: 100.00,
  bankAccountId: businessChecking.id
})

await printChecks.checks.create({
  checkNumber: 2001,
  payee: 'Vendor B',
  amount: 50.00,
  bankAccountId: personalChecking.id
})
```

## Validation

Bank account creation validates:

- **Routing number**: Must be exactly 9 digits
- **Account number**: Must not be empty
- **Account type**: Must be 'checking' or 'savings'

```typescript
try {
  await printChecks.bankAccounts.create({
    name: 'Invalid Account',
    routingNumber: '123',  // Too short!
    accountNumber: '456',
    bankName: 'Bank',
    accountType: 'checking'
  })
} catch (error) {
  console.error('Validation error:', error.message)
  // Error: Routing number must be 9 digits
}
```

## Security Considerations

Bank account information is sensitive. Consider:

1. **Encryption**: Use the `SecureStorageAdapter` to encrypt account data
2. **Access Control**: Limit access to bank account management features
3. **Audit Trail**: Track who creates/modifies bank accounts

See [Encryption Guide](/guide/encryption) for securing bank account data.

## Using with Vue

```vue
<script setup>
import { useBankAccounts } from '@printchecks/vue'

const {
  bankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
} = useBankAccounts()

const handleCreate = async () => {
  await createBankAccount({
    name: 'New Account',
    routingNumber: '123456789',
    accountNumber: '987654321',
    bankName: 'My Bank',
    accountType: 'checking'
  })
}
</script>

<template>
  <div>
    <h2>Bank Accounts</h2>
    <ul>
      <li v-for="account in bankAccounts" :key="account.id">
        {{ account.name }} - {{ account.bankName }}
      </li>
    </ul>
    <button @click="handleCreate">Add Account</button>
  </div>
</template>
```

## Using with Web Components

```html
<bank-account-form></bank-account-form>
<bank-account-list></bank-account-list>

<script type="module">
  import '@printchecks/web-components'

  const form = document.querySelector('bank-account-form')
  form.addEventListener('account-created', (event) => {
    console.log('New account:', event.detail)
  })
</script>
```

## Next Steps

- [Checks](/guide/checks) - Create checks using bank accounts
- [Encryption](/guide/encryption) - Secure sensitive account data
- [API Reference](/api/core/bank-account-service) - Complete API documentation
