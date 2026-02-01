# PrintChecksCore

The main entry point for the PrintChecks core library.

## Constructor

```typescript
new PrintChecksCore(config?: PrintChecksCoreConfig)
```

### Configuration Options

```typescript
interface PrintChecksCoreConfig {
  // Storage adapter (defaults to LocalStorage)
  storage?: StorageAdapter

  // Storage options
  storageOptions?: {
    prefix?: string
    encryption?: boolean
    password?: string
  }

  // Auto-increment check numbers
  autoIncrementCheckNumber?: boolean

  // Auto-increment receipt numbers
  autoIncrementReceiptNumber?: boolean

  // Default currency
  defaultCurrency?: Currency

  // Enable debug logging
  debug?: boolean
}
```

### Example

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore({
  autoIncrementCheckNumber: true,
  defaultCurrency: 'USD',
  debug: true
})
```

## Services

PrintChecksCore provides four service instances:

| Service | Description |
|---------|-------------|
| `checks` | Check management (`CheckService`) |
| `vendors` | Vendor management (`VendorService`) |
| `bankAccounts` | Bank account management (`BankAccountService`) |
| `receipts` | Receipt management (`ReceiptService`) |

## Check Methods

### createCheck()

Create a new check.

```typescript
async createCheck(data: Partial<CheckData>): Promise<Check>
```

**Example:**

```typescript
const check = await printChecks.createCheck({
  checkNumber: '1001',
  date: new Date().toLocaleDateString(),
  amount: 1250.00,
  payTo: 'Acme Corporation',
  memo: 'Invoice #12345',
  bankAccountId: 'account-1'
})
```

### getCheck()

Get a check by ID.

```typescript
async getCheck(id: string): Promise<Check | null>
```

### getChecks()

Get checks with optional filters.

```typescript
async getChecks(filters?: CheckFilters): Promise<Check[]>
```

**Filters:**

```typescript
interface CheckFilters {
  status?: CheckStatus
  vendorId?: string
  bankAccountId?: string
  fromDate?: Date
  toDate?: Date
  minAmount?: number
  maxAmount?: number
  searchTerm?: string
}
```

**Example:**

```typescript
const checks = await printChecks.getChecks({
  bankAccountId: 'account-1',
  minAmount: 100,
  maxAmount: 1000
})
```

### updateCheck()

Update a check.

```typescript
async updateCheck(id: string, updates: Partial<CheckData>): Promise<Check>
```

### deleteCheck()

Delete a check.

```typescript
async deleteCheck(id: string): Promise<void>
```

### markCheckAsPrinted()

Mark a check as printed.

```typescript
async markCheckAsPrinted(id: string): Promise<Check>
```

### voidCheck()

Void a check.

```typescript
async voidCheck(id: string, reason?: string): Promise<Check>
```

### duplicateCheck()

Duplicate a check with a new check number.

```typescript
async duplicateCheck(id: string, newCheckNumber?: string): Promise<Check>
```

### getNextCheckNumber()

Get the next check number.

```typescript
async getNextCheckNumber(): Promise<string>
```

## Vendor Methods

### createVendor()

Create a new vendor.

```typescript
async createVendor(data: VendorData): Promise<Vendor>
```

### getVendor()

Get a vendor by ID.

```typescript
async getVendor(id: string): Promise<Vendor | null>
```

### getVendors()

Get all vendors with optional filters.

```typescript
async getVendors(filters?: VendorFilters): Promise<Vendor[]>
```

### updateVendor()

Update a vendor.

```typescript
async updateVendor(id: string, updates: Partial<VendorData>): Promise<Vendor>
```

### deleteVendor()

Delete a vendor.

```typescript
async deleteVendor(id: string): Promise<void>
```

### searchVendors()

Search vendors by name.

```typescript
async searchVendors(searchTerm: string): Promise<Vendor[]>
```

### getFavoriteVendors()

Get all favorite vendors.

```typescript
async getFavoriteVendors(): Promise<Vendor[]>
```

### toggleVendorFavorite()

Toggle vendor favorite status.

```typescript
async toggleVendorFavorite(id: string): Promise<Vendor>
```

## Bank Account Methods

### createBankAccount()

Create a new bank account.

```typescript
async createBankAccount(data: BankAccountData): Promise<BankAccount>
```

### getBankAccount()

Get a bank account by ID.

```typescript
async getBankAccount(id: string): Promise<BankAccount | null>
```

### getBankAccounts()

Get all bank accounts.

```typescript
async getBankAccounts(filters?: BankAccountFilters): Promise<BankAccount[]>
```

### updateBankAccount()

Update a bank account.

```typescript
async updateBankAccount(id: string, updates: Partial<BankAccountData>): Promise<BankAccount>
```

### deleteBankAccount()

Delete a bank account.

```typescript
async deleteBankAccount(id: string): Promise<void>
```

### getDefaultBankAccount()

Get the default bank account.

```typescript
async getDefaultBankAccount(): Promise<BankAccount | null>
```

### setDefaultBankAccount()

Set a bank account as default.

```typescript
async setDefaultBankAccount(id: string): Promise<BankAccount>
```

## Receipt Methods

### createReceipt()

Create a new receipt.

```typescript
async createReceipt(data: Partial<ReceiptData>): Promise<Receipt>
```

### getReceipt()

Get a receipt by ID.

```typescript
async getReceipt(id: string): Promise<Receipt | null>
```

### getReceipts()

Get all receipts.

```typescript
async getReceipts(filters?: ReceiptFilters): Promise<Receipt[]>
```

### updateReceipt()

Update a receipt.

```typescript
async updateReceipt(id: string, updates: Partial<ReceiptData>): Promise<Receipt>
```

### deleteReceipt()

Delete a receipt.

```typescript
async deleteReceipt(id: string): Promise<void>
```

### addLineItem()

Add a line item to a receipt.

```typescript
async addLineItem(receiptId: string, itemData: LineItemData): Promise<Receipt>
```

### updateLineItem()

Update a line item.

```typescript
async updateLineItem(
  receiptId: string,
  itemId: string,
  updates: Partial<LineItemData>
): Promise<Receipt>
```

### removeLineItem()

Remove a line item.

```typescript
async removeLineItem(receiptId: string, itemId: string): Promise<Receipt>
```

## Analytics Methods

### getCheckStatistics()

Get check statistics.

```typescript
async getCheckStatistics(): Promise<{
  total: number
  printed: number
  void: number
  draft: number
  totalAmount: number
}>
```

### getAllStatistics()

Get all statistics.

```typescript
async getAllStatistics(): Promise<{
  checks: CheckStatistics
  vendors: VendorStatistics
  bankAccounts: BankAccountStatistics
  receipts: ReceiptStatistics
}>
```

## Data Management Methods

### exportData()

Export all data.

```typescript
async exportData(): Promise<{
  version: string
  exportDate: string
  data: {
    checks: CheckData[]
    vendors: VendorData[]
    bankAccounts: BankAccountData[]
    receipts: ReceiptData[]
  }
}>
```

**Example:**

```typescript
const data = await printChecks.exportData()
const json = JSON.stringify(data, null, 2)

// Download as file
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `printchecks-backup-${new Date().toISOString()}.json`
a.click()
```

### importData()

Import data from backup.

```typescript
async importData(data: {
  checks?: CheckData[]
  vendors?: VendorData[]
  bankAccounts?: BankAccountData[]
  receipts?: ReceiptData[]
}): Promise<{
  checks: { success: number; failed: number }
  vendors: { success: number; failed: number }
  bankAccounts: { success: number; failed: number }
  receipts: { success: number; failed: number }
}>
```

### clearAllData()

Clear all data (use with caution!).

```typescript
async clearAllData(): Promise<void>
```

## Encryption Methods

### enableEncryption()

Enable encryption with a password.

```typescript
async enableEncryption(password: string): Promise<void>
```

### disableEncryption()

Disable encryption.

```typescript
async disableEncryption(password: string): Promise<void>
```

### changeEncryptionPassword()

Change encryption password.

```typescript
async changeEncryptionPassword(oldPassword: string, newPassword: string): Promise<void>
```

## Utility Methods

### getStorage()

Get the storage adapter instance (for advanced use cases).

```typescript
getStorage(): StorageAdapter
```

### waitForInitialization()

Wait for storage initialization to complete (required when using encryption).

```typescript
async waitForInitialization(): Promise<void>
```

**Example:**

```typescript
const printChecks = new PrintChecksCore({
  storageOptions: {
    encryption: true,
    password: 'my-password'
  }
})

await printChecks.waitForInitialization()
// Now ready to use
```

## See Also

- [CheckService](/api/core/check-service)
- [VendorService](/api/core/vendor-service)
- [BankAccountService](/api/core/bank-account-service)
- [ReceiptService](/api/core/receipt-service)
- [Models](/api/core/models)
- [Storage Adapters](/api/core/storage-adapters)
