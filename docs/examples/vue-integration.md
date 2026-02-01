# Vue Integration

Complete Vue 3 application example.

## Full Example

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'
import { ref, computed } from 'vue'

const {
  checks,
  vendors,
  bankAccounts,
  createCheck,
  createVendor,
  createBankAccount,
  exportData
} = usePrintChecks({
  autoIncrementCheckNumber: true,
  defaultCurrency: 'USD'
})

const activeTab = ref('checks')

// Check form
const checkForm = ref({
  payTo: '',
  amount: 0,
  memo: '',
  vendorId: ''
})

const handleCreateCheck = async () => {
  if (!bankAccounts.value.length) {
    alert('Please create a bank account first')
    return
  }

  await createCheck({
    ...checkForm.value,
    date: new Date().toLocaleDateString(),
    bankAccountId: bankAccounts.value[0].id,
    signature: 'John Doe'
  })

  checkForm.value = { payTo: '', amount: 0, memo: '', vendorId: '' }
}

// Export
const handleExport = async () => {
  const data = await exportData()
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `printchecks-${new Date().toISOString()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="app">
    <header>
      <h1>PrintChecks</h1>
      <nav>
        <button @click="activeTab = 'checks'">Checks</button>
        <button @click="activeTab = 'vendors'">Vendors</button>
        <button @click="activeTab = 'accounts'">Accounts</button>
        <button @click="handleExport">Export</button>
      </nav>
    </header>

    <main>
      <div v-if="activeTab === 'checks'">
        <h2>Checks</h2>

        <form @submit.prevent="handleCreateCheck">
          <div>
            <label>Pay To:</label>
            <input v-model="checkForm.payTo" required />
          </div>

          <div>
            <label>Amount:</label>
            <input v-model.number="checkForm.amount" type="number" step="0.01" required />
          </div>

          <div>
            <label>Memo:</label>
            <input v-model="checkForm.memo" />
          </div>

          <div>
            <label>Vendor:</label>
            <select v-model="checkForm.vendorId">
              <option value="">None</option>
              <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                {{ vendor.name }}
              </option>
            </select>
          </div>

          <button type="submit">Create Check</button>
        </form>

        <h3>Checks ({{ checks.length }})</h3>
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th>Payee</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="check in checks" :key="check.id">
              <td>{{ check.checkNumber }}</td>
              <td>{{ check.date }}</td>
              <td>{{ check.payTo }}</td>
              <td>${{ typeof check.amount === 'number' ? check.amount.toFixed(2) : check.amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeTab === 'vendors'">
        <h2>Vendors ({{ vendors.length }})</h2>
        <!-- Vendor management UI -->
      </div>

      <div v-else-if="activeTab === 'accounts'">
        <h2>Bank Accounts ({{ bankAccounts.length }})</h2>
        <!-- Account management UI -->
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

nav button {
  margin-left: 10px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

nav button:hover {
  background: #f5f5f5;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f5f5f5;
}
</style>
```

## See Also

- [usePrintChecks](/api/vue/use-printchecks)
- [Getting Started](/getting-started)
