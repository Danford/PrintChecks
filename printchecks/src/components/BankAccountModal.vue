<template>
  <div v-if="modelValue" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">🏦 {{ editingBank ? 'Edit Bank Account' : 'Add New Bank Account' }}</h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Bank Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="formData.name" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Account Holder Name</label>
                <input type="text" class="form-control" v-model="formData.accountHolderName">
              </div>
              <div class="col-md-12">
                <label class="form-label">Account Holder Address</label>
                <input type="text" class="form-control" v-model="formData.accountHolderAddress">
              </div>
              <div class="col-md-4">
                <label class="form-label">City</label>
                <input type="text" class="form-control" v-model="formData.accountHolderCity">
              </div>
              <div class="col-md-4">
                <label class="form-label">State</label>
                <input type="text" class="form-control" v-model="formData.accountHolderState" maxlength="2">
              </div>
              <div class="col-md-4">
                <label class="form-label">ZIP Code</label>
                <input type="text" class="form-control" v-model="formData.accountHolderZip">
              </div>
              <div class="col-md-6">
                <label class="form-label">Routing Number <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="formData.routingNumber" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Account Number <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="formData.accountNumber" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Account Type</label>
                <select class="form-control" v-model="formData.accountType" required>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Starting Check Number</label>
                <input type="number" class="form-control" v-model="formData.startingCheckNumber" placeholder="1001">
              </div>
              <div class="col-md-6">
                <label class="form-label">Bank Address</label>
                <input type="text" class="form-control" v-model="formData.address">
              </div>
              <div class="col-md-6">
                <label class="form-label">Signature</label>
                <input type="text" class="form-control" v-model="formData.signature">
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="handleSave">
            💾 Save Bank Account
          </button>
        </div>
      </div>
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
  address?: string
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
  address: '',
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
      address: '',
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
/* No custom styles needed - using Bootstrap modal classes */
</style>

