<template>
  <div
    v-if="modelValue"
    class="modal show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">👤 {{ editingVendor ? 'Edit Vendor' : 'Add New Vendor' }}</h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <div class="mb-3">
              <label class="form-label">Vendor Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="formData.name" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="formData.email" />
            </div>
            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" v-model="formData.phone" />
            </div>
            <div class="mb-3">
              <label class="form-label">Address</label>
              <textarea class="form-control" v-model="formData.address" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">Cancel</button>
          <button type="button" class="btn btn-primary" @click="handleSave">💾 Save Vendor</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Vendor } from '@/types'

interface Props {
  modelValue: boolean
  editingVendor: Vendor | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', vendorData: Vendor): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = ref<Vendor>({
  id: '',
  name: '',
  email: '',
  phone: '',
  address: ''
})

// Watch for changes to editingVendor and update formData
watch(
  () => props.editingVendor,
  (newVendor) => {
    if (newVendor) {
      formData.value = { ...newVendor }
    } else {
      // Reset form when not editing
      formData.value = {
        id: '',
        name: '',
        email: '',
        phone: '',
        address: ''
      }
    }
  },
  { immediate: true }
)

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
