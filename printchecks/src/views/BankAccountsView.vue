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
    <div v-if="showAddBankModal || editingBank" class="modal-overlay">
      <div class="modal-content">
        <h5>{{ editingBank ? 'Edit Bank Account' : 'Add New Bank Account' }}</h5>
        <form @submit.prevent="saveBankAccount">
          <div class="mb-3">
            <label class="form-label">Account Holder Name</label>
            <input type="text" class="form-control" v-model="bankForm.accountHolderName" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" v-model="bankForm.accountHolderAddress" required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">City</label>
              <input type="text" class="form-control" v-model="bankForm.accountHolderCity" required>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">State</label>
              <input type="text" class="form-control" v-model="bankForm.accountHolderState" maxlength="2" required>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">ZIP</label>
              <input type="text" class="form-control" v-model="bankForm.accountHolderZip" required>
            </div>
          </div>
          <hr>
          <div class="mb-3">
            <label class="form-label">Bank Name</label>
            <input type="text" class="form-control" v-model="bankForm.name" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Account Number</label>
            <input type="text" class="form-control" v-model="bankForm.accountNumber" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Routing Number</label>
            <input type="text" class="form-control" v-model="bankForm.routingNumber" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Account Type</label>
            <select class="form-control" v-model="bankForm.accountType" required>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Starting Check Number</label>
            <input type="number" class="form-control" v-model="bankForm.startingCheckNumber" placeholder="1001">
          </div>
          <div class="mb-3">
            <label class="form-label">Signature</label>
            <input type="text" class="form-control" v-model="bankForm.signature" placeholder="Your signature">
            <small class="text-muted">This signature will be used on all checks from this account</small>
          </div>
          <div class="btn-group w-100">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" @click="cancelBankEdit">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Bank Account Management
const bankAccounts = ref(JSON.parse(localStorage.getItem('bankAccounts') || '[]'))
const showAddBankModal = ref(false)
const editingBank = ref(null)
const bankForm = reactive({
  id: '',
  accountHolderName: '',
  accountHolderAddress: '',
  accountHolderCity: '',
  accountHolderState: '',
  accountHolderZip: '',
  name: '',
  accountNumber: '',
  routingNumber: '',
  accountType: 'Checking',
  startingCheckNumber: 1001,
  signature: '',
  isDefault: false
})

function saveBankAccount() {
  if (editingBank.value) {
    // Update existing bank
    const index = bankAccounts.value.findIndex(b => b.id === editingBank.value.id)
    if (index !== -1) {
      bankAccounts.value[index] = { ...bankForm }
    }
  } else {
    // Add new bank
    const newBank = {
      ...bankForm,
      id: 'bank-' + Date.now()
    }
    bankAccounts.value.push(newBank)
  }
  
  localStorage.setItem('bankAccounts', JSON.stringify(bankAccounts.value))
  cancelBankEdit()
}

function editBank(bank) {
  editingBank.value = bank
  Object.assign(bankForm, bank)
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
  Object.assign(bankForm, {
    id: '',
    accountHolderName: '',
    accountHolderAddress: '',
    accountHolderCity: '',
    accountHolderState: '',
    accountHolderZip: '',
    name: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'Checking',
    startingCheckNumber: 1001,
    isDefault: false
  })
}
</script>

<style scoped>
/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

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
