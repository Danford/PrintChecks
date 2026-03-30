# useVendors

Vue composable for managing vendors.

## Usage

```vue
<script setup>
import { useVendors } from '@printchecks/vue'

const {
  vendors,
  currentVendor,
  isLoading,
  error,
  favoriteVendors,
  vendorCount,
  loadVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  searchVendors,
  toggleFavorite,
  addTag,
  removeTag,
  clearCurrentVendor
} = useVendors()
</script>
```

## Return Value

```typescript
interface UseVendorsReturn {
  // State
  currentVendor: Ref<Vendor | null>       // the currently loaded/edited vendor
  vendors: Ref<Vendor[]>                  // all loaded vendors
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Computed
  favoriteVendors: ComputedRef<Vendor[]>  // vendors where isFavorite is true
  vendorCount: ComputedRef<number>        // total number of vendors

  // Actions
  loadVendors: () => Promise<void>
  loadVendor: (id: string) => Promise<void>
  createVendor: (data: VendorData) => Promise<Vendor>
  updateVendor: (id: string, updates: Partial<VendorData>) => Promise<Vendor>
  deleteVendor: (id: string) => Promise<void>
  searchVendors: (searchTerm: string) => Promise<Vendor[]>
  toggleFavorite: (id: string) => Promise<void>
  addTag: (id: string, tag: string) => Promise<void>
  removeTag: (id: string, tag: string) => Promise<void>
  clearCurrentVendor: () => void
}
```

## Key Behaviours

- `vendors` is the reactive list of all loaded vendors; call `loadVendors()` to populate it.
- `favoriteVendors` is a computed subset of `vendors` where `isFavorite` is true.
- `loadVendor(id)` sets `currentVendor` for detail/edit views.
- `searchVendors(term)` returns matching vendors but does not modify `vendors`.
- `addTag`/`removeTag` mutate the vendor's tag list via the service layer.

## Example

```vue
<script setup>
import { useVendors } from '@printchecks/vue'
import { ref, onMounted } from 'vue'

const {
  vendors,
  favoriteVendors,
  vendorCount,
  loadVendors,
  createVendor,
  searchVendors,
  toggleFavorite
} = useVendors()

const searchQuery = ref('')
const searchResults = ref([])

onMounted(loadVendors)

const handleSearch = async () => {
  searchResults.value = await searchVendors(searchQuery.value)
}
</script>

<template>
  <div>
    <p>{{ vendorCount }} vendors, {{ favoriteVendors.length }} favorited</p>

    <input v-model="searchQuery" @input="handleSearch" placeholder="Search vendors..." />

    <ul>
      <li v-for="vendor in (searchQuery ? searchResults : vendors)" :key="vendor.id">
        {{ vendor.name }}
        <button @click="toggleFavorite(vendor.id)">
          {{ vendor.isFavorite ? '★' : '☆' }}
        </button>
      </li>
    </ul>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [VendorService](/api/core/vendor-service)
- [Vendors Guide](/guide/vendors)
