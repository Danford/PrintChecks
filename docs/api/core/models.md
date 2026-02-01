# Models

Data models and type definitions for PrintChecks core.

## Check

```typescript
interface CheckData extends BaseEntity {
  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string

  bankName: string
  routingNumber: string
  bankAccountNumber: string

  checkNumber: string
  date: string
  amount: string | number
  payTo: string
  memo: string
  signature: string

  currency?: Currency
  amountInWords?: string

  status?: CheckStatus
  isVoid?: boolean
  isPrinted?: boolean
  printedAt?: Date
  voidedAt?: Date
  voidReason?: string

  receiptId?: string
  vendorId?: string
  customizationId?: string
  bankAccountId?: string
}

type CheckStatus = 'draft' | 'ready' | 'printed' | 'void' | 'cancelled'
```

## Vendor

```typescript
interface VendorData extends BaseEntity {
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  email?: string
  phone?: string
  notes?: string
  isFavorite?: boolean
}
```

## BankAccount

```typescript
interface BankAccountData extends BaseEntity {
  name: string
  routingNumber: string
  accountNumber: string
  bankName: string
  accountType: 'checking' | 'savings'

  accountHolderName?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string

  isDefault?: boolean
}
```

## Receipt

```typescript
interface ReceiptData extends BaseEntity {
  receiptNumber: string
  date: Date | string
  customerName: string
  items: LineItemData[]
  subtotal: number
  tax?: number
  total: number
  notes?: string
  paymentMethod?: string
}

interface LineItemData {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}
```

## Common Types

```typescript
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'

interface BaseEntity {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [User Guide](/guide/basic-usage)
