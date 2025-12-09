<template>
  <!-- Add/Edit Bank Modal -->
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <h5>{{ editingBank ? 'Edit Bank Account' : 'Add New Bank Account' }}</h5>
      <form @submit.prevent="handleSave">
        <div class="mb-3">
          <label class="form-label">Account Holder Name</label>
          <input type="text" class="form-control" v-model="formData.accountHolderName" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Address</label>
          <input type="text" class="form-control" v-model="formData.accountHolderAddress" required>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">City</label>
            <input type="text" class="form-control" v-model="formData.accountHolderCity" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label">State</label>
            <input type="text" class="form-control" v-model="formData.accountHolderState" maxlength="2" required>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label">ZIP</label>
            <input type="text" class="form-control" v-model="formData.accountHolderZip" required>
          </div>
        </div>
        <hr>
        <div class="mb-3">
          <label class="form-label">Bank Name</label>
          <input type="text" class="form-control" v-model="formData.name" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Account Number</label>
          <input type="text" class="form-control" v-model="formData.accountNumber" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Routing Number</label>
          <input type="text" class="form-control" v-model="formData.routingNumber" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Account Type</label>
          <select class="form-control" v-model="formData.accountType" required>
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Business">Business</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Starting Check Number</label>
          <input type="number" class="form-control" v-model="formData.startingCheckNumber" placeholder="1001">
        </div>
        <div class="mb-3">
          <label class="form-label">Signature</label>
          <input type="text" class="form-control" v-model="formData.signature" placeholder="Your signature">
          <small class="text-muted">This signature will be used on all checks from this account</small>
        </div>
        <div class="btn-group w-100">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-secondary" @click="handleCancel">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface BankAccount {
  id?: string
  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string
  name: string
  accountNumber: string
  routingNumber: string
  accountType: string
  startingCheckNumber: number
  signature: string
  isDefault?: boolean
}

interface Props {
  modelValue: boolean
  editingBank: BankAccount | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', bankData: BankAccount): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = ref<BankAccount>({
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

// Watch for changes to editingBank and update formData
watch(() => props.editingBank, (newBank) => {
  if (newBank) {
    formData.value = { ...newBank }
  } else {
    // Reset form when not editing
    formData.value = {
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
    }
  }
}, { immediate: true })

function handleSave() {
  emit('save', { ...formData.value })
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>

