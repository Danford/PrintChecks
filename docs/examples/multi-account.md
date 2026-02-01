# Multi-Account Setup

Manage multiple bank accounts.

## Example

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

// Create multiple accounts
const businessChecking = await printChecks.createBankAccount({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '111111111',
  bankName: 'Business Bank',
  accountType: 'checking'
})

const personalChecking = await printChecks.createBankAccount({
  name: 'Personal Checking',
  routingNumber: '987654321',
  accountNumber: '222222222',
  bankName: 'Personal Bank',
  accountType: 'checking'
})

// Set default
await printChecks.setDefaultBankAccount(businessChecking.id)

// Create checks for different accounts
await printChecks.createCheck({
  checkNumber: '1001',
  payTo: 'Business Vendor',
  amount: 1000.00,
  bankAccountId: businessChecking.id,
  // ... other fields
})

await printChecks.createCheck({
  checkNumber: '2001',
  payTo: 'Personal Payee',
  amount: 100.00,
  bankAccountId: personalChecking.id,
  // ... other fields
})

// Get checks by account
const businessChecks = await printChecks.getChecks({
  bankAccountId: businessChecking.id
})
```

## See Also

- [Bank Accounts Guide](/guide/bank-accounts)
- [Basic Check](/examples/basic-check)
