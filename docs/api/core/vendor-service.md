# VendorService

Service for creating, searching, and managing vendors.

## Overview

`VendorService` handles all vendor-related operations. It is exposed via `printChecks.vendors` on a `PrintChecksCore` instance, or can be instantiated directly.

## Constructor

```typescript
new VendorService(config: VendorServiceConfig)
```

```typescript
interface VendorServiceConfig {
  storage: StorageAdapter
}
```

### Example

```typescript
import { VendorService, LocalStorageAdapter } from '@printchecks/core'

const service = new VendorService({
  storage: new LocalStorageAdapter()
})
```

## Methods

### createVendor()

Create and persist a new vendor. Validates before saving; throws if validation fails.

```typescript
async createVendor(data: VendorData): Promise<Vendor>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `VendorData` | Vendor fields. `name` is required. `id`, `createdAt`, `updatedAt` are auto-generated. |

**Returns:** The created `Vendor` instance.

**Throws:** `Error` if validation fails (e.g. `name` missing, invalid email format).

```typescript
const vendor = await printChecks.vendors.createVendor({
  name: 'Acme Corporation',
  email: 'billing@acme.com',
  phone: '555-555-0100',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
})
```

### getVendor()

Retrieve a single vendor by ID.

```typescript
async getVendor(id: string): Promise<Vendor | null>
```

**Returns:** `Vendor` instance, or `null` if not found.

```typescript
const vendor = await printChecks.vendors.getVendor('v1')
```

### getVendors()

Retrieve all vendors, with optional filtering.

```typescript
async getVendors(filters?: VendorFilters): Promise<Vendor[]>
```

#### VendorFilters

```typescript
interface VendorFilters {
  category?: string       // exact category match
  tags?: string[]         // vendor must have ALL listed tags
  isActive?: boolean      // active/inactive filter
  isFavorite?: boolean    // favorites-only filter
  searchTerm?: string     // searches name, displayName, email, phone, businessNumber
}
```

**Returns:** Array of matching `Vendor` instances.

```typescript
// Active vendors only
const active = await printChecks.vendors.getVendors({ isActive: true })

// Vendors tagged with both 'supplier' and 'preferred'
const preferred = await printChecks.vendors.getVendors({
  tags: ['supplier', 'preferred']
})

// Text search
const results = await printChecks.vendors.getVendors({ searchTerm: 'acme' })
```

### updateVendor()

Update fields on an existing vendor. Re-validates after update. `id` and `createdAt` cannot be overwritten.

```typescript
async updateVendor(id: string, updates: Partial<VendorData>): Promise<Vendor>
```

**Throws:** `Error` if the vendor is not found or the updated state fails validation.

```typescript
const updated = await printChecks.vendors.updateVendor('v1', {
  phone: '555-555-0200',
  category: 'supplier'
})
```

### deleteVendor()

Permanently delete a vendor.

```typescript
async deleteVendor(id: string): Promise<void>
```

```typescript
await printChecks.vendors.deleteVendor('v1')
```

### searchVendors()

Shorthand for `getVendors({ searchTerm })`. Searches `name`, `displayName`, `email`, `phone`, and `businessNumber` (case-insensitive).

```typescript
async searchVendors(searchTerm: string): Promise<Vendor[]>
```

```typescript
const matches = await printChecks.vendors.searchVendors('acme')
```

### getVendorsByCategory()

Retrieve all vendors in a given category.

```typescript
async getVendorsByCategory(category: string): Promise<Vendor[]>
```

```typescript
const suppliers = await printChecks.vendors.getVendorsByCategory('supplier')
```

### getFavoriteVendors()

Retrieve all vendors where `isFavorite` is true.

```typescript
async getFavoriteVendors(): Promise<Vendor[]>
```

```typescript
const favs = await printChecks.vendors.getFavoriteVendors()
```

### getActiveVendors()

Retrieve all vendors where `isActive` is true.

```typescript
async getActiveVendors(): Promise<Vendor[]>
```

```typescript
const active = await printChecks.vendors.getActiveVendors()
```

### getCategories()

Return a sorted list of all unique category strings used across vendors.

```typescript
async getCategories(): Promise<string[]>
```

```typescript
const categories = await printChecks.vendors.getCategories()
// e.g. ['freelancer', 'supplier', 'utility']
```

### getTags()

Return a sorted list of all unique tag strings used across vendors.

```typescript
async getTags(): Promise<string[]>
```

```typescript
const tags = await printChecks.vendors.getTags()
// e.g. ['net-30', 'preferred', 'recurring']
```

### toggleFavorite()

Toggle the `isFavorite` flag on a vendor.

```typescript
async toggleFavorite(id: string): Promise<Vendor>
```

**Throws:** `Error` if the vendor is not found.

```typescript
const vendor = await printChecks.vendors.toggleFavorite('v1')
console.log(vendor.isFavorite) // true (if it was false before)
```

### toggleActive()

Toggle the `isActive` flag on a vendor.

```typescript
async toggleActive(id: string): Promise<Vendor>
```

**Throws:** `Error` if the vendor is not found.

```typescript
const vendor = await printChecks.vendors.toggleActive('v1')
console.log(vendor.isActive) // false (if it was true before)
```

### addTag()

Add a tag to a vendor. No-ops if the tag is already present (duplicate guard enforced by `Vendor.addTag()`).

```typescript
async addTag(id: string, tag: string): Promise<Vendor>
```

**Throws:** `Error` if the vendor is not found.

```typescript
const vendor = await printChecks.vendors.addTag('v1', 'preferred')
console.log(vendor.tags) // ['preferred']
```

### removeTag()

Remove a tag from a vendor.

```typescript
async removeTag(id: string, tag: string): Promise<Vendor>
```

**Throws:** `Error` if the vendor is not found.

```typescript
await printChecks.vendors.removeTag('v1', 'preferred')
```

### getStatistics()

Get aggregate statistics across all vendors.

```typescript
async getStatistics(): Promise<{
  total: number
  active: number
  inactive: number
  favorites: number
  byCategory: Record<string, number>
}>
```

| Field | Description |
|-------|-------------|
| `total` | Total number of vendors |
| `active` | Vendors where `isActive` is true |
| `inactive` | Vendors where `isActive` is false |
| `favorites` | Vendors where `isFavorite` is true |
| `byCategory` | Map of category → count |

```typescript
const stats = await printChecks.vendors.getStatistics()
console.log(`${stats.active} active vendors`)
console.log(stats.byCategory) // e.g. { supplier: 3, utility: 2 }
```

### importVendors()

Bulk-import vendors from an array. Each entry is validated; failures are counted but do not halt the import.

```typescript
async importVendors(vendorsData: VendorData[]): Promise<{ success: number; failed: number }>
```

```typescript
const result = await printChecks.vendors.importVendors(exportedData)
console.log(`Imported ${result.success}, failed ${result.failed}`)
```

### exportVendors()

Export all vendors as a plain-object array suitable for JSON serialization.

```typescript
async exportVendors(): Promise<VendorData[]>
```

```typescript
const data = await printChecks.vendors.exportVendors()
localStorage.setItem('backup', JSON.stringify(data))
```

### clearAll()

Delete all stored vendors. Use with caution — this cannot be undone.

```typescript
async clearAll(): Promise<void>
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Vendor Model](/api/core/models#vendor)
- [Vendors Guide](/guide/vendors)
