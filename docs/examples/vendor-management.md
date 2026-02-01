# Vendor Management

Manage vendors and link them to checks.

## Creating Vendors

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

// Create vendor
const vendor = await printChecks.createVendor({
  name: 'Acme Corporation',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  email: 'billing@acme.com',
  phone: '555-0123'
})

// Create check linked to vendor
const check = await printChecks.createCheck({
  checkNumber: '1001',
  date: new Date().toLocaleDateString(),
  amount: 1250.00,
  payTo: vendor.name,
  vendorId: vendor.id,
  memo: 'Monthly services',
  // ... other check fields
})
```

## Vendor Payment History

```typescript
async function getVendorPaymentHistory(vendorId: string) {
  const checks = await printChecks.getChecks({ vendorId })

  const totalPaid = checks.reduce((sum, check) => {
    const amount = typeof check.amount === 'string'
      ? parseFloat(check.amount)
      : check.amount
    return sum + amount
  }, 0)

  return {
    checks,
    totalPaid,
    checkCount: checks.length,
    averagePayment: totalPaid / checks.length || 0
  }
}

const history = await getVendorPaymentHistory(vendor.id)
console.log(`Total paid to ${vendor.name}: $${history.totalPaid}`)
```

## Vue Example

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'
import { ref, computed } from 'vue'

const { vendors, checks, createVendor, createCheck } = usePrintChecks()
const searchQuery = ref('')

const filteredVendors = computed(() => {
  if (!searchQuery.value) return vendors.value
  return vendors.value.filter(v =>
    v.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getVendorTotal = (vendorId) => {
  return checks.value
    .filter(c => c.vendorId === vendorId)
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)
}
</script>

<template>
  <div>
    <h2>Vendors</h2>
    <input v-model="searchQuery" placeholder="Search vendors..." />

    <ul>
      <li v-for="vendor in filteredVendors" :key="vendor.id">
        {{ vendor.name }} - Total Paid: ${{ getVendorTotal(vendor.id).toFixed(2) }}
      </li>
    </ul>
  </div>
</template>
```

## See Also

- [Vendors Guide](/guide/vendors)
- [Basic Check](/examples/basic-check)
