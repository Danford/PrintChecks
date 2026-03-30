# useChecks

Vue composable for managing checks.

## Usage

```vue
<script setup>
import { useChecks } from '@printchecks/vue'

const {
  checks,
  currentCheck,
  isLoading,
  error,
  isValid,
  amountInWords,
  nextCheckNumber,
  loadChecks,
  createCheck,
  updateCheck,
  saveCheck,
  markAsPrinted,
  voidCheck,
  validateCheck,
  clearCurrentCheck
} = useChecks()
</script>
```

## Return Value

```typescript
interface UseChecksReturn {
  // State
  currentCheck: Ref<Check | null>        // the currently loaded/edited check
  checks: Ref<Check[]>                   // all loaded checks
  isLoading: Ref<boolean>
  error: Ref<string | null>
  hasUnsavedChanges: Ref<boolean>

  // Computed
  isValid: ComputedRef<boolean>           // true when currentCheck passes validation
  amountInWords: ComputedRef<string>      // currentCheck.amount as English words
  nextCheckNumber: ComputedRef<string>    // next auto-incremented check number

  // Actions
  loadChecks: () => Promise<void>
  loadCheck: (id: string) => Promise<void>
  createCheck: (data: Partial<CheckData>) => Promise<Check>
  updateCheck: (id: string, updates: Partial<CheckData>) => Promise<Check>
  saveCheck: () => Promise<boolean>
  deleteCheck: (id: string) => Promise<void>
  markAsPrinted: (id: string) => Promise<Check>
  voidCheck: (id: string, reason?: string) => Promise<Check>
  duplicateCheck: (id: string, newCheckNumber?: string) => Promise<Check>
  validateCheck: () => boolean
  clearCurrentCheck: () => void
}
```

## Key Behaviours

- `checks` is the reactive list of all loaded checks; call `loadChecks()` to populate it.
- `currentCheck` holds the check being viewed or edited. Use `loadCheck(id)` to set it.
- `saveCheck()` persists `currentCheck` to storage; returns `false` when `currentCheck` is null.
- `validateCheck()` validates `currentCheck` and writes any errors to `error`; returns a boolean.
- `amountInWords` and `isValid` are computed from `currentCheck` and update reactively.

## Example

```vue
<script setup>
import { useChecks, useBankAccounts } from '@printchecks/vue'
import { onMounted } from 'vue'

const {
  checks,
  currentCheck,
  isValid,
  amountInWords,
  createCheck,
  loadChecks,
  markAsPrinted,
  voidCheck
} = useChecks()

const { accounts, loadAccounts } = useBankAccounts()

onMounted(async () => {
  await Promise.all([loadChecks(), loadAccounts()])
})

const handleCreate = async () => {
  await createCheck({
    payTo: 'Acme Corp',
    amount: 1250.00,
    memo: 'Invoice #12345',
    bankAccountId: accounts.value[0]?.id
  })
  await loadChecks()
}
</script>

<template>
  <div>
    <h2>Checks ({{ checks.length }})</h2>
    <ul>
      <li v-for="check in checks" :key="check.id">
        #{{ check.checkNumber }} — {{ check.payTo }} — ${{ check.amount }}
        <button @click="markAsPrinted(check.id)">Mark Printed</button>
        <button @click="voidCheck(check.id, 'Duplicate')">Void</button>
      </li>
    </ul>
    <div v-if="currentCheck">
      <p>Amount in words: {{ amountInWords }}</p>
      <p>Valid: {{ isValid }}</p>
    </div>
    <button @click="handleCreate">New Check</button>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [CheckService](/api/core/check-service)
- [Checks Guide](/guide/checks)
