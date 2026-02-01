# useVendors

Vue composable for managing vendors.

## Usage

```vue
<script setup>
import { useVendors } from '@printchecks/vue'

const {
  items,
  isLoading,
  error,
  createVendor,
  updateVendor,
  deleteVendor,
  searchVendors
} = useVendors()
</script>
```

## Return Value

```typescript
interface UseVendorsReturn {
  // State
  items: Ref<Vendor[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>

  // Actions
  loadVendors: () => Promise<void>
  createVendor: (data: VendorData) => Promise<Vendor>
  updateVendor: (id: string, updates: Partial<VendorData>) => Promise<Vendor>
  deleteVendor: (id: string) => Promise<void>
  getVendor: (id: string) => Promise<Vendor | null>
  searchVendors: (searchTerm: string) => Promise<Vendor[]>
  getFavoriteVendors: () => Promise<Vendor[]>
  toggleFavorite: (id: string) => Promise<Vendor>
}
```

## Example

```vue
<script setup>
import { useVendors } from '@printchecks/vue'
import { ref } from 'vue'

const { items: vendors, createVendor, searchVendors } = useVendors()
const searchQuery = ref('')

const filteredVendors = ref([])

const handleSearch = async () => {
  filteredVendors.value = await searchVendors(searchQuery.value)
}
</script>

<template>
  <div>
    <input v-model="searchQuery" @input="handleSearch" placeholder="Search vendors..." />

    <ul>
      <li v-for="vendor in filteredVendors" :key="vendor.id">
        {{ vendor.name }} - {{ vendor.email }}
      </li>
    </ul>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [Vendors Guide](/guide/vendors)
