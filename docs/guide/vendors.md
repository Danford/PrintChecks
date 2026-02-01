# Vendors

Manage vendors and link them to checks for better organization.

## Overview

Vendors represent payees you frequently write checks to. By storing vendor information, you can quickly fill in check details and track payment history.

## Creating a Vendor

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

const vendor = await printChecks.vendors.create({
  name: 'Acme Corporation',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  email: 'billing@acme.com',
  phone: '555-0123',
  notes: 'Primary supplier'
})
```

## Vendor Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Vendor name |
| `address` | `string` | No | Street address |
| `city` | `string` | No | City |
| `state` | `string` | No | State (2-letter code) |
| `zip` | `string` | No | ZIP code |
| `email` | `string` | No | Email address |
| `phone` | `string` | No | Phone number |
| `notes` | `string` | No | Additional notes |

## Listing Vendors

```typescript
const vendors = await printChecks.vendors.list()

vendors.forEach(vendor => {
  console.log(`${vendor.name} - ${vendor.email}`)
})

// Sort alphabetically
const sorted = vendors.sort((a, b) => a.name.localeCompare(b.name))
```

## Getting a Specific Vendor

```typescript
const vendor = await printChecks.vendors.get('vendor-id')
console.log('Vendor details:', vendor)
```

## Updating a Vendor

```typescript
const updated = await printChecks.vendors.update('vendor-id', {
  email: 'newemail@acme.com',
  phone: '555-9999'
})
```

## Deleting a Vendor

```typescript
await printChecks.vendors.delete('vendor-id')
```

::: tip
Deleting a vendor doesn't delete associated checks. Checks will still retain the vendor ID but the vendor details won't be available.
:::

## Linking Vendors to Checks

```typescript
// Create vendor
const vendor = await printChecks.vendors.create({
  name: 'Acme Corporation',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
})

// Create check linked to vendor
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: vendor.name,
  amount: 1250.00,
  bankAccountId: 'account-id',
  vendorId: vendor.id,  // Link to vendor
  address: `${vendor.address}, ${vendor.city}, ${vendor.state} ${vendor.zip}`
})
```

## Vendor Payment History

Track all payments to a vendor:

```typescript
async function getVendorPaymentHistory(vendorId: string) {
  const checks = await printChecks.checks.list()

  const vendorChecks = checks.filter(check => check.vendorId === vendorId)

  const totalPaid = vendorChecks.reduce((sum, check) => sum + check.amount, 0)
  const checkCount = vendorChecks.length

  return {
    checks: vendorChecks,
    totalPaid,
    checkCount,
    averagePayment: totalPaid / checkCount || 0
  }
}

// Use it
const history = await getVendorPaymentHistory('vendor-id')
console.log(`Total paid: $${history.totalPaid}`)
console.log(`Number of checks: ${history.checkCount}`)
console.log(`Average payment: $${history.averagePayment.toFixed(2)}`)
```

## Quick-Fill from Vendor

Use vendor information to quickly fill check details:

```typescript
async function createCheckFromVendor(vendorId: string, amount: number, memo: string) {
  const vendor = await printChecks.vendors.get(vendorId)
  const checks = await printChecks.checks.list()

  // Get next check number
  const maxCheckNumber = Math.max(...checks.map(c => c.checkNumber), 1000)

  return await printChecks.checks.create({
    checkNumber: maxCheckNumber + 1,
    date: new Date(),
    payee: vendor.name,
    amount,
    memo,
    vendorId: vendor.id,
    address: `${vendor.address}, ${vendor.city}, ${vendor.state} ${vendor.zip}`,
    bankAccountId: 'default-account-id'
  })
}

// Use it
const check = await createCheckFromVendor('vendor-id', 500.00, 'Monthly service')
```

## Vendor Search

Search vendors by name or other fields:

```typescript
function searchVendors(query: string) {
  const vendors = await printChecks.vendors.list()

  return vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(query.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(query.toLowerCase()) ||
    vendor.city?.toLowerCase().includes(query.toLowerCase())
  )
}

// Use it
const results = await searchVendors('acme')
```

## Using with Vue

```vue
<script setup>
import { useVendors } from '@printchecks/vue'
import { ref } from 'vue'

const { vendors, createVendor, updateVendor, deleteVendor } = useVendors()
const searchQuery = ref('')

const filteredVendors = computed(() => {
  if (!searchQuery.value) return vendors.value

  return vendors.value.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleCreate = async (formData) => {
  await createVendor(formData)
}
</script>

<template>
  <div>
    <h2>Vendors ({{ vendors.length }})</h2>

    <input v-model="searchQuery" placeholder="Search vendors..." />

    <ul>
      <li v-for="vendor in filteredVendors" :key="vendor.id">
        <strong>{{ vendor.name }}</strong>
        <p>{{ vendor.email }} | {{ vendor.phone }}</p>
        <p>{{ vendor.address }}, {{ vendor.city }}, {{ vendor.state }} {{ vendor.zip }}</p>
      </li>
    </ul>
  </div>
</template>
```

## Using with Web Components

```html
<vendor-form></vendor-form>
<vendor-list></vendor-list>

<script type="module">
  import '@printchecks/web-components'

  const form = document.querySelector('vendor-form')
  form.addEventListener('vendor-created', (event) => {
    console.log('Vendor created:', event.detail)
  })

  const list = document.querySelector('vendor-list')
  list.addEventListener('vendor-selected', (event) => {
    console.log('Vendor selected:', event.detail)
  })
</script>
```

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions for vendors
2. **Keep Updated**: Update vendor contact information regularly
3. **Use Notes**: Store important vendor-specific information in notes
4. **Link to Checks**: Always link checks to vendors for better tracking
5. **Regular Cleanup**: Periodically review and remove unused vendors

## Next Steps

- [Checks](/guide/checks) - Create checks for vendors
- [Data Management](/guide/data-management) - Import/export vendor data
- [API Reference](/api/core/vendor-service) - Complete API documentation
