# BankAccountService

Service for managing bank accounts.

## Overview

The `BankAccountService` handles bank account operations including managing default accounts.

## API Reference

For full API details, see [PrintChecksCore - Bank Account Methods](/api/core/printchecks-core#bank-account-methods).

## Key Methods

- `createBankAccount(data)` - Create a new bank account
- `getBankAccount(id)` - Get bank account by ID
- `getBankAccounts(filters)` - Get all bank accounts
- `updateBankAccount(id, updates)` - Update a bank account
- `deleteBankAccount(id)` - Delete a bank account
- `getDefaultBankAccount()` - Get default account
- `setDefaultBankAccount(id)` - Set default account

## Example

```typescript
const printChecks = new PrintChecksCore()

// Create bank account
const account = await printChecks.bankAccounts.createBankAccount({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking'
})

// Set as default
await printChecks.bankAccounts.setDefaultBankAccount(account.id)
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [BankAccount Model](/api/core/models#bankaccount)
- [Bank Accounts Guide](/guide/bank-accounts)
