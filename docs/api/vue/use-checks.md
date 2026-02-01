# useChecks

Vue composable for managing checks.

## Usage

```vue
<script setup>
import { useChecks } from '@printchecks/vue'

const {
  items,
  isLoading,
  error,
  createCheck,
  updateCheck,
  deleteCheck,
  markAsPrinted,
  voidCheck
} = useChecks()
</script>
```

## Return Value

```typescript
interface UseChecksReturn {
  // State
  items: Ref<Check[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>

  // Actions
  loadChecks: () => Promise<void>
  createCheck: (data: Partial<CheckData>) => Promise<Check>
  updateCheck: (id: string, updates: Partial<CheckData>) => Promise<Check>
  deleteCheck: (id: string) => Promise<void>
  getCheck: (id: string) => Promise<Check | null>
  markAsPrinted: (id: string) => Promise<Check>
  voidCheck: (id: string, reason?: string) => Promise<Check>
  duplicateCheck: (id: string, newCheckNumber?: string) => Promise<Check>
  getNextCheckNumber: () => Promise<string>
}
```

## Example

```vue
<script setup>
import { useChecks, useBankAccounts } from '@printchecks/vue'

const { items: checks, createCheck } = useChecks()
const { items: bankAccounts } = useBankAccounts()

const handleCreate = async () => {
  await createCheck({
    checkNumber: '1001',
    date: new Date().toLocaleDateString(),
    amount: 1000.00,
    payTo: 'Acme Corp',
    bankAccountId: bankAccounts.value[0].id
  })
}
</script>

<template>
  <div>
    <h2>Checks ({{ checks.length }})</h2>
    <ul>
      <li v-for="check in checks" :key="check.id">
        Check #{{ check.checkNumber }} - {{ check.payTo }} - ${{ check.amount }}
      </li>
    </ul>
    <button @click="handleCreate">Create Check</button>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [Checks Guide](/guide/checks)
