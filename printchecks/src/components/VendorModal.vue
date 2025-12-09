<template>
  <!-- Add/Edit Vendor Modal -->
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <h5>{{ editingVendor ? 'Edit Vendor' : 'Add New Vendor' }}</h5>
      <form @submit.prevent="handleSave">
        <div class="mb-3">
          <label class="form-label">Vendor Name</label>
          <input type="text" class="form-control" v-model="formData.name" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="formData.email">
        </div>
        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input type="text" class="form-control" v-model="formData.phone">
        </div>
        <div class="mb-3">
          <label class="form-label">Address</label>
          <textarea class="form-control" v-model="formData.address" rows="3"></textarea>
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

interface Vendor {
  id?: string
  name: string
  email: string
  phone: string
  address: string
}

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
watch(() => props.editingVendor, (newVendor) => {
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>

