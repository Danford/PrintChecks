# Basic Check Creation

Learn how to create your first check with PrintChecks.

## Core Library

```typescript
import { PrintChecksCore } from '@printchecks/core'

// Initialize PrintChecks
const printChecks = new PrintChecksCore()

// Create a bank account
const bankAccount = await printChecks.createBankAccount({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking',
  accountHolderName: 'Acme Corporation',
  address: '123 Business Blvd',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
})

// Create a check
const check = await printChecks.createCheck({
  checkNumber: '1001',
  date: new Date().toLocaleDateString(),
  amount: 1250.50,
  payTo: 'Office Supplies Inc.',
  memo: 'Invoice #12345',
  signature: 'John Doe',
  bankAccountId: bankAccount.id,

  // Bank account info is auto-filled from bankAccount
  accountHolderName: bankAccount.accountHolderName,
  accountHolderAddress: bankAccount.address,
  accountHolderCity: bankAccount.city,
  accountHolderState: bankAccount.state,
  accountHolderZip: bankAccount.zip,
  bankName: bankAccount.bankName,
  routingNumber: bankAccount.routingNumber,
  bankAccountNumber: bankAccount.accountNumber
})

console.log('Check created:', check)
console.log('Amount in words:', check.amountInWords)
// "One Thousand Two Hundred Fifty and 50/100 Dollars"
```

## Vue 3

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'
import { ref } from 'vue'

const {
  checks,
  bankAccounts,
  createCheck,
  createBankAccount
} = usePrintChecks()

const formData = ref({
  checkNumber: '1001',
  date: new Date().toLocaleDateString(),
  amount: 1250.50,
  payTo: 'Office Supplies Inc.',
  memo: 'Invoice #12345'
})

const handleCreateAccount = async () => {
  await createBankAccount({
    name: 'Business Checking',
    routingNumber: '123456789',
    accountNumber: '987654321',
    bankName: 'First National Bank',
    accountType: 'checking'
  })
}

const handleCreateCheck = async () => {
  await createCheck({
    ...formData.value,
    bankAccountId: bankAccounts.value[0].id,
    accountHolderName: 'Acme Corporation',
    accountHolderAddress: '123 Business Blvd',
    accountHolderCity: 'Springfield',
    accountHolderState: 'IL',
    accountHolderZip: '62701',
    bankName: bankAccounts.value[0].bankName,
    routingNumber: bankAccounts.value[0].routingNumber,
    bankAccountNumber: bankAccounts.value[0].accountNumber,
    signature: 'John Doe'
  })
}
</script>

<template>
  <div>
    <h2>Create Check</h2>

    <div v-if="bankAccounts.length === 0">
      <button @click="handleCreateAccount">Create Bank Account First</button>
    </div>

    <form v-else @submit.prevent="handleCreateCheck">
      <div>
        <label>Check Number:</label>
        <input v-model="formData.checkNumber" required />
      </div>

      <div>
        <label>Date:</label>
        <input v-model="formData.date" type="text" required />
      </div>

      <div>
        <label>Pay To:</label>
        <input v-model="formData.payTo" required />
      </div>

      <div>
        <label>Amount:</label>
        <input v-model.number="formData.amount" type="number" step="0.01" required />
      </div>

      <div>
        <label>Memo:</label>
        <input v-model="formData.memo" />
      </div>

      <button type="submit">Create Check</button>
    </form>

    <h3>Checks Created: {{ checks.length }}</h3>
    <ul>
      <li v-for="check in checks" :key="check.id">
        Check #{{ check.checkNumber }} - {{ check.payTo }} - ${{ check.amount }}
      </li>
    </ul>
  </div>
</template>
```

## Web Components

```html
<!DOCTYPE html>
<html>
<head>
  <title>Basic Check Creation</title>
</head>
<body>
  <h1>Create Check</h1>

  <bank-account-form id="accountForm"></bank-account-form>
  <check-form id="checkForm"></check-form>

  <h2>Created Checks</h2>
  <div id="checksList"></div>

  <script type="module">
    import '@printchecks/web-components'
    import { PrintChecksCore } from '@printchecks/core'

    const printChecks = new PrintChecksCore()

    // Handle bank account creation
    const accountForm = document.getElementById('accountForm')
    accountForm.addEventListener('account-created', async (event) => {
      console.log('Bank account created:', event.detail.account)

      // Set bank account on check form
      const checkForm = document.getElementById('checkForm')
      checkForm.setAttribute('bank-account-id', event.detail.account.id)
    })

    // Handle check creation
    const checkForm = document.getElementById('checkForm')
    checkForm.addEventListener('check-created', async (event) => {
      console.log('Check created:', event.detail.check)

      // Refresh checks list
      await displayChecks()
    })

    // Display checks
    async function displayChecks() {
      const checks = await printChecks.getChecks()
      const checksList = document.getElementById('checksList')

      checksList.innerHTML = checks.map(check => `
        <div>
          Check #${check.checkNumber} - ${check.payTo} - $${check.amount}
        </div>
      `).join('')
    }

    // Initial load
    displayChecks()
  </script>
</body>
</html>
```

## Next Steps

- [Vendor Management](/examples/vendor-management) - Link checks to vendors
- [Encrypted Storage](/examples/encrypted-storage) - Secure your data
- [Vue Integration](/examples/vue-integration) - Full Vue example
