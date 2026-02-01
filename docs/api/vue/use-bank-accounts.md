# useBankAccounts

Vue composable for managing bank accounts.

## Usage

```vue
<script setup>
import { useBankAccounts } from '@printchecks/vue'

const {
  items,
  isLoading,
  error,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount
} = useBankAccounts()
</script>
```

## Return Value

```typescript
interface UseBankAccountsReturn {
  // State
  items: Ref<BankAccount[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>

  // Actions
  loadAccounts: () => Promise<void>
  createAccount: (data: BankAccountData) => Promise<BankAccount>
  updateAccount: (id: string, updates: Partial<BankAccountData>) => Promise<BankAccount>
  deleteAccount: (id: string) => Promise<void>
  getAccount: (id: string) => Promise<BankAccount | null>
  getDefaultAccount: () => Promise<BankAccount | null>
  setDefaultAccount: (id: string) => Promise<BankAccount>
}
```

## Example

```vue
<script setup>
import { useBankAccounts } from '@printchecks/vue'

const { items: accounts, createAccount, setDefaultAccount } = useBankAccounts()

const handleCreate = async () => {
  const account = await createAccount({
    name: 'Business Checking',
    routingNumber: '123456789',
    accountNumber: '987654321',
    bankName: 'First National Bank',
    accountType: 'checking'
  })

  await setDefaultAccount(account.id)
}
</script>

<template>
  <div>
    <h2>Bank Accounts</h2>
    <ul>
      <li v-for="account in accounts" :key="account.id">
        {{ account.name }} - {{ account.bankName }}
        <span v-if="account.isDefault">(Default)</span>
      </li>
    </ul>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [Bank Accounts Guide](/guide/bank-accounts)
