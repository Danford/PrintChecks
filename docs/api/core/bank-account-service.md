# BankAccountService

Service for creating, querying, and managing bank accounts, including default account selection.

## Overview

`BankAccountService` handles all bank account operations. It is exposed via `printChecks.bankAccounts` on a `PrintChecksCore` instance, or can be instantiated directly.

## Constructor

```typescript
new BankAccountService(config: BankAccountServiceConfig)
```

```typescript
interface BankAccountServiceConfig {
  storage: StorageAdapter
}
```

### Example

```typescript
import { BankAccountService, LocalStorageAdapter } from '@printchecks/core'

const service = new BankAccountService({
  storage: new LocalStorageAdapter()
})
```

## Methods

### createBankAccount()

Create and persist a new bank account. The first account created is automatically set as the default. Validates before saving; throws if validation fails.

```typescript
async createBankAccount(data: BankAccountData): Promise<BankAccount>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `BankAccountData` | Account fields. `id`, `createdAt`, `updatedAt` are auto-generated. |

**Returns:** The created `BankAccount` instance.

**Throws:** `Error` if validation fails (e.g. invalid routing number, missing required fields).

```typescript
const account = await printChecks.bankAccounts.createBankAccount({
  accountHolderName: 'Jane Smith',
  bankName: 'First National Bank',
  routingNumber: '021000021',
  accountNumber: '987654321',
  accountType: 'checking',
  nickname: 'Business Checking'
})
// If this is the first account, account.isDefault === true
```

### getBankAccount()

Retrieve a single bank account by ID.

```typescript
async getBankAccount(id: string): Promise<BankAccount | null>
```

**Returns:** `BankAccount` instance, or `null` if not found.

```typescript
const account = await printChecks.bankAccounts.getBankAccount('ba1')
```

### getBankAccounts()

Retrieve all bank accounts, with optional filtering.

```typescript
async getBankAccounts(filters?: BankAccountFilters): Promise<BankAccount[]>
```

#### BankAccountFilters

```typescript
interface BankAccountFilters {
  accountType?: 'checking' | 'savings' | 'business'
  isActive?: boolean
  searchTerm?: string  // searches accountHolderName, bankName, nickname, accountNumber
}
```

**Returns:** Array of matching `BankAccount` instances.

```typescript
// Active checking accounts only
const checking = await printChecks.bankAccounts.getBankAccounts({
  accountType: 'checking',
  isActive: true
})

// Text search
const results = await printChecks.bankAccounts.getBankAccounts({
  searchTerm: 'first national'
})
```

### updateBankAccount()

Update fields on an existing bank account. Re-validates after update. `id` and `createdAt` cannot be overwritten. Setting `isDefault: true` automatically clears the default flag from all other accounts.

```typescript
async updateBankAccount(id: string, updates: Partial<BankAccountData>): Promise<BankAccount>
```

**Throws:** `Error` if the account is not found or the updated state fails validation.

```typescript
const updated = await printChecks.bankAccounts.updateBankAccount('ba1', {
  nickname: 'Main Checking'
})
```

### deleteBankAccount()

Permanently delete a bank account. If the deleted account was the default, the next account in the list automatically becomes the default.

```typescript
async deleteBankAccount(id: string): Promise<void>
```

**Throws:** `Error` if the account is not found.

```typescript
await printChecks.bankAccounts.deleteBankAccount('ba1')
```

### getDefaultBankAccount()

Return the account marked as default. If no account has `isDefault === true`, returns the first account. Returns `null` when no accounts exist.

```typescript
async getDefaultBankAccount(): Promise<BankAccount | null>
```

```typescript
const defaultAccount = await printChecks.bankAccounts.getDefaultBankAccount()
if (defaultAccount) {
  console.log(`Paying from: ${defaultAccount.bankName}`)
}
```

### setDefaultBankAccount()

Set a specific account as the default. Clears the default flag from all other accounts.

```typescript
async setDefaultBankAccount(id: string): Promise<BankAccount>
```

**Throws:** `Error` if the account is not found.

```typescript
const account = await printChecks.bankAccounts.setDefaultBankAccount('ba2')
console.log(account.isDefault) // true
```

### getActiveBankAccounts()

Retrieve all accounts where `isActive` is true.

```typescript
async getActiveBankAccounts(): Promise<BankAccount[]>
```

```typescript
const active = await printChecks.bankAccounts.getActiveBankAccounts()
```

### toggleActive()

Toggle the `isActive` flag on a bank account.

```typescript
async toggleActive(id: string): Promise<BankAccount>
```

**Throws:** `Error` if the account is not found.

```typescript
const account = await printChecks.bankAccounts.toggleActive('ba1')
console.log(account.isActive) // false (if it was true before)
```

### searchBankAccounts()

Shorthand for `getBankAccounts({ searchTerm })`. Searches `accountHolderName`, `bankName`, `nickname`, and `accountNumber` (case-insensitive).

```typescript
async searchBankAccounts(searchTerm: string): Promise<BankAccount[]>
```

```typescript
const matches = await printChecks.bankAccounts.searchBankAccounts('first national')
```

### getStatistics()

Get aggregate statistics across all bank accounts.

```typescript
async getStatistics(): Promise<{
  total: number
  active: number
  inactive: number
  byType: Record<string, number>
}>
```

| Field | Description |
|-------|-------------|
| `total` | Total number of accounts |
| `active` | Accounts where `isActive` is true |
| `inactive` | Accounts where `isActive` is false |
| `byType` | Map of account type → count |

```typescript
const stats = await printChecks.bankAccounts.getStatistics()
console.log(stats.byType) // e.g. { checking: 2, savings: 1 }
```

### importBankAccounts()

Bulk-import bank accounts from an array. Each entry is validated; failures are counted but do not halt the import.

```typescript
async importBankAccounts(accountsData: BankAccountData[]): Promise<{ success: number; failed: number }>
```

```typescript
const result = await printChecks.bankAccounts.importBankAccounts(exportedData)
console.log(`Imported ${result.success}, failed ${result.failed}`)
```

### exportBankAccounts()

Export all bank accounts as a plain-object array suitable for JSON serialization.

```typescript
async exportBankAccounts(): Promise<BankAccountData[]>
```

```typescript
const data = await printChecks.bankAccounts.exportBankAccounts()
```

### clearAll()

Delete all stored bank accounts. Use with caution — this cannot be undone.

```typescript
async clearAll(): Promise<void>
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [BankAccount Model](/api/core/models#bankaccount)
- [Bank Accounts Guide](/guide/bank-accounts)
