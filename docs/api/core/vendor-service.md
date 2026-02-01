# VendorService

Service for managing vendors.

## Overview

The `VendorService` handles vendor operations including creation, search, and favorites.

## API Reference

For full API details, see [PrintChecksCore - Vendor Methods](/api/core/printchecks-core#vendor-methods).

## Key Methods

- `createVendor(data)` - Create a new vendor
- `getVendor(id)` - Get vendor by ID
- `getVendors(filters)` - Get all vendors
- `updateVendor(id, updates)` - Update a vendor
- `deleteVendor(id)` - Delete a vendor
- `searchVendors(searchTerm)` - Search vendors
- `getFavoriteVendors()` - Get favorite vendors
- `toggleFavorite(id)` - Toggle favorite status

## Example

```typescript
const printChecks = new PrintChecksCore()

// Create vendor
const vendor = await printChecks.vendors.createVendor({
  name: 'Acme Corporation',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
})

// Search vendors
const results = await printChecks.vendors.searchVendors('acme')
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Vendor Model](/api/core/models#vendor)
- [Vendors Guide](/guide/vendors)
