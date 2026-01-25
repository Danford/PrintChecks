# @printchecks/core

> Framework-agnostic core library for check printing, vendor management, and payment documentation

## Installation

```bash
npm install @printchecks/core
# or
yarn add @printchecks/core
# or
pnpm add @printchecks/core
```

## Quick Start

```typescript
import { PrintChecksCore } from '@printchecks/core'

// Initialize the library
const printChecks = new PrintChecksCore({
  autoIncrementCheckNumber: true,
  defaultCurrency: 'USD'
})

// Create a check
const check = await printChecks.createCheck({
  accountHolderName: 'John Doe',
  accountHolderAddress: '123 Main St',
  accountHolderCity: 'Springfield',
  accountHolderState: 'IL',
  accountHolderZip: '62701',
  bankName: 'First National Bank',
  routingNumber: '123456789',
  bankAccountNumber: '9876543210',
  checkNumber: '1001',
  date: '12/25/2023',
  amount: 500.00,
  payTo: 'ACME Corporation',
  memo: 'Invoice #12345',
  signature: 'John Doe'
})

console.log(check.amountInWords) // "Five Hundred Dollars"
```

## Features

- ✅ **Framework Agnostic** - Works with Vue, React, vanilla JS, or any other framework
- ✅ **TypeScript Support** - Full type safety with comprehensive TypeScript definitions
- ✅ **Storage Abstraction** - Use localStorage, IndexedDB, or implement custom storage
- ✅ **Encryption** - Optional AES-GCM encryption with PBKDF2 key derivation
- ✅ **Tree-Shakeable** - Import only what you need
- ✅ **No Dependencies** - Except for `to-words` for amount conversion

## Core API

### PrintChecksCore

Main entry point providing access to all services:

```typescript
const core = new PrintChecksCore({
  storage?: StorageAdapter,           // Custom storage adapter
  storageOptions?: {
    prefix?: string,                  // Storage key prefix (default: 'printchecks_')
    encryption?: boolean,             // Enable encryption
    password?: string                 // Encryption password
  },
  autoIncrementCheckNumber?: boolean, // Auto-increment check numbers
  autoIncrementReceiptNumber?: boolean, // Auto-increment receipt numbers
  defaultCurrency?: Currency,         // Default currency (default: 'USD')
  debug?: boolean                     // Enable debug logging
})
```

### Check Management

```typescript
// Create a check
const check = await core.createCheck({ /* CheckData */ })

// Get checks
const allChecks = await core.getChecks()
const filtered = await core.getChecks({ status: 'printed', vendorId: '123' })

// Update a check
await core.updateCheck(checkId, { amount: 600.00 })

// Mark as printed
await core.markCheckAsPrinted(checkId)

// Void a check
await core.voidCheck(checkId, 'Incorrect amount')

// Duplicate a check
const duplicate = await core.duplicateCheck(checkId)
```

### Vendor Management

```typescript
// Create a vendor
const vendor = await core.createVendor({
  name: 'ACME Corporation',
  address: '456 Business Ave',
  city: 'Chicago',
  state: 'IL',
  zip: '60601',
  email: 'billing@acme.com',
  phone: '555-1234'
})

// Get vendors
const vendors = await core.getVendors()
const favorites = await core.getFavoriteVendors()
const searched = await core.searchVendors('ACME')
```

### Bank Account Management

```typescript
// Create a bank account
const account = await core.createBankAccount({
  accountHolderName: 'John Doe',
  accountHolderAddress: '123 Main St',
  accountHolderCity: 'Springfield',
  accountHolderState: 'IL',
  accountHolderZip: '62701',
  bankName: 'First National Bank',
  routingNumber: '123456789',
  accountNumber: '9876543210',
  isDefault: true
})

// Get default account
const defaultAccount = await core.getDefaultBankAccount()
```

### Receipt Management

```typescript
// Create a receipt
const receipt = await core.createReceipt({
  receiptNumber: 'R-1001',
  date: '12/25/2023',
  billTo: {
    name: 'ACME Corporation',
    address: '456 Business Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60601'
  },
  lineItems: [
    {
      description: 'Product A',
      quantity: 2,
      unitPrice: 150.00,
      totalPrice: 300.00,
      taxable: true
    }
  ],
  paymentInfo: {
    method: 'check',
    checkNumber: '1001',
    amount: 300.00,
    currency: 'USD'
  }
})

// Add line item
await core.addLineItem(receipt.id, {
  description: 'Product B',
  quantity: 1,
  unitPrice: 200.00,
  totalPrice: 200.00,
  taxable: true
})
```

## Storage Adapters

### LocalStorage (Default)

```typescript
import { LocalStorageAdapter } from '@printchecks/core'

const storage = new LocalStorageAdapter({
  prefix: 'myapp_'
})

const core = new PrintChecksCore({ storage })
```

### Secure Storage (with Encryption)

```typescript
import { LocalStorageAdapter, SecureStorageAdapter } from '@printchecks/core'

const baseStorage = new LocalStorageAdapter()
const secureStorage = new SecureStorageAdapter(baseStorage, {
  encryption: true,
  password: 'your-secure-password'
})

await secureStorage.initialize('your-secure-password')

const core = new PrintChecksCore({ storage: secureStorage })
```

### Custom Storage

Implement the `StorageAdapter` interface:

```typescript
import { StorageAdapter } from '@printchecks/core'

class MyCustomStorage implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> { /* ... */ }
  async set<T>(key: string, value: T): Promise<void> { /* ... */ }
  async remove(key: string): Promise<void> { /* ... */ }
  async clear(): Promise<void> { /* ... */ }
  async keys(): Promise<string[]> { /* ... */ }
  async has(key: string): Promise<boolean> { /* ... */ }
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> { /* ... */ }
  async setMany(entries: Map<string, any>): Promise<void> { /* ... */ }
}
```

## Utilities

### Formatting

```typescript
import { formatCurrency, formatDate, amountToWords } from '@printchecks/core'

formatCurrency(1234.56, 'USD') // "$1,234.56"
formatDate(new Date(), 'long') // "December 25, 2023"
amountToWords(1234.56) // "One Thousand Two Hundred Thirty Four Dollars and Fifty Six Cents"
```

### Validation

```typescript
import { 
  validateEmail, 
  validateRoutingNumber,
  validateAmount 
} from '@printchecks/core'

validateEmail('test@example.com') // true
validateRoutingNumber('123456789') // true (with checksum validation)
validateAmount(100.00) // true
```

## Data Export/Import

```typescript
// Export all data
const exportData = await core.exportData()
// Save to file or send to server

// Import data
await core.importData({
  checks: [...],
  vendors: [...],
  bankAccounts: [...],
  receipts: [...]
})
```

## License

MIT © Joshua Danford
