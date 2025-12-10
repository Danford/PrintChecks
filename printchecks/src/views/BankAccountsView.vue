<template>
  <div class="bank-management p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>🏦 Bank Account Management</h4>
      <button class="btn btn-success" @click="showAddBankModal = true">
        ➕ Add New Bank Account
      </button>
    </div>

    <!-- Bank Accounts List -->
    <div class="row">
      <div v-for="bank in bankAccounts" :key="bank.id" class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ bank.name }}</h5>
            <p class="card-text">
              <strong>Account Holder:</strong> {{ bank.accountHolderName }}<br>
              <strong>Address:</strong> {{ bank.accountHolderAddress }}, {{ bank.accountHolderCity }}, {{ bank.accountHolderState }} {{ bank.accountHolderZip }}<br>
              <strong>Account:</strong> ****{{ bank.accountNumber.slice(-4) }}<br>
              <strong>Routing:</strong> {{ bank.routingNumber }}<br>
              <strong>Type:</strong> {{ bank.accountType }}<br>
              <strong>Starting Check #:</strong> {{ bank.startingCheckNumber || '1001' }}<br>
              <strong>Signature:</strong> {{ bank.signature || 'Not set' }}
            </p>
            <div class="btn-group">
              <button class="btn btn-primary btn-sm" @click="editBank(bank)">Edit</button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteBank(bank.id)">Delete</button>
              <button class="btn btn-outline-success btn-sm" @click="setDefaultBank(bank.id)">
                {{ bank.isDefault ? '✓ Default' : 'Set Default' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Bank Modal -->
    <BankAccountModal 
      v-model="showAddBankModal" 
      :editing-bank="editingBank"
      @save="saveBankAccount"
      @cancel="cancelBankEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BankAccountModal from '../components/BankAccountModal.vue'

// Bank Account Management
const bankAccounts = ref(JSON.parse(localStorage.getItem('bankAccounts') || '[]'))
const showAddBankModal = ref(false)
const editingBank = ref(null)

function saveBankAccount(bankData) {
  if (editingBank.value) {
    // Update existing bank
    const index = bankAccounts.value.findIndex(b => b.id === editingBank.value.id)
    if (index !== -1) {
      bankAccounts.value[index] = { ...bankData }
    }
  } else {
    // Add new bank
    const newBank = {
      ...bankData,
      id: 'bank-' + Date.now()
    }
    bankAccounts.value.push(newBank)
  }
  
  localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts.value))
  cancelBankEdit()
}

function editBank(bank) {
  editingBank.value = bank
  showAddBankModal.value = true
}

function deleteBank(bankId) {
  if (confirm('Are you sure you want to delete this bank account?')) {
    bankAccounts.value = bankAccounts.value.filter(b => b.id !== bankId)
    localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts.value))
  }
}

function setDefaultBank(bankId) {
  bankAccounts.value.forEach(bank => {
    bank.isDefault = bank.id === bankId
  })
  localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts.value))
}

function cancelBankEdit() {
  showAddBankModal.value = false
  editingBank.value = null
}
</script>

<style scoped>
/* Bank card styling */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Button group styling */
.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
