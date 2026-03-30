# useBankAccounts

Vue composable for managing bank accounts.

## Usage

```vue
<script setup>
import { useBankAccounts } from '@printchecks/vue'

const {
  accounts,
  currentAccount,
  isLoading,
  error,
  defaultAccount,
  accountCount,
  loadAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount,
  clearCurrentAccount
} = useBankAccounts()
</script>
```

## Return Value

```typescript
interface UseBankAccountsReturn {
  // State
  currentAccount: Ref<BankAccount | null>      // the currently loaded/edited account
  accounts: Ref<BankAccount[]>                 // all loaded accounts
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Computed
  defaultAccount: ComputedRef<BankAccount | null>  // the account with isDefault === true
  accountCount: ComputedRef<number>                // total number of accounts

  // Actions
  loadAccounts: () => Promise<void>
  loadAccount: (id: string) => Promise<void>
  createAccount: (data: BankAccountData) => Promise<BankAccount>
  updateAccount: (id: string, updates: Partial<BankAccountData>) => Promise<BankAccount>
  deleteAccount: (id: string) => Promise<void>
  setDefaultAccount: (id: string) => Promise<BankAccount>
  clearCurrentAccount: () => void
}
```

## Key Behaviours

- `accounts` is the reactive list of all bank accounts; call `loadAccounts()` to populate it.
- `defaultAccount` is a computed ref that returns the first account with `isDefault === true`.
- The first account created via `createAccount()` is automatically set as the default.
- `setDefaultAccount(id)` clears the default flag from all other accounts.
- `loadAccount(id)` sets `currentAccount` for a detail/edit view.

## Example

```vue
<script setup>
import { useBankAccounts } from '@printchecks/vue'
import { onMounted } from 'vue'

const {
  accounts,
  defaultAccount,
  accountCount,
  loadAccounts,
  createAccount,
  setDefaultAccount,
  deleteAccount
} = useBankAccounts()

onMounted(loadAccounts)

const handleCreate = async () => {
  const account = await createAccount({
    accountHolderName: 'Jane Smith',
    bankName: 'First National Bank',
    routingNumber: '021000021',
    accountNumber: '987654321',
    accountType: 'checking',
    nickname: 'Business Checking'
  })
  await loadAccounts()
}
</script>

<template>
  <div>
    <p>{{ accountCount }} accounts</p>
    <p v-if="defaultAccount">Default: {{ defaultAccount.nickname || defaultAccount.bankName }}</p>

    <ul>
      <li v-for="account in accounts" :key="account.id">
        {{ account.nickname || account.bankName }}
        <span v-if="account.isDefault">(Default)</span>
        <button @click="setDefaultAccount(account.id)">Set Default</button>
        <button @click="deleteAccount(account.id)">Delete</button>
      </li>
    </ul>
    <button @click="handleCreate">Add Account</button>
  </div>
</template>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [BankAccountService](/api/core/bank-account-service)
- [Bank Accounts Guide](/guide/bank-accounts)
