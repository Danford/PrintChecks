<template>
  <div class="vendor-management p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>👥 Vendor Management</h4>
      <button class="btn btn-success" @click="showAddVendorModal = true">
        ➕ Add New Vendor
      </button>
    </div>

    <!-- Vendors List -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Total Paid</th>
            <th>Payment Count</th>
            <th>Last Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vendor in vendorsWithStats" :key="vendor.id">
            <td><strong>{{ vendor.name }}</strong></td>
            <td>
              {{ vendor.email }}<br>
              <small class="text-muted">{{ vendor.phone }}</small>
            </td>
            <td><strong>${{ vendor.totalPaid.toFixed(2) }}</strong></td>
            <td>{{ vendor.paymentCount }}</td>
            <td>{{ vendor.lastPayment || 'Never' }}</td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" @click="editVendor(vendor)">Edit</button>
                <button class="btn btn-outline-danger" @click="deleteVendor(vendor.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Vendor Modal -->
    <div v-if="showAddVendorModal || editingVendor" class="modal-overlay">
      <div class="modal-content">
        <h5>{{ editingVendor ? 'Edit Vendor' : 'Add New Vendor' }}</h5>
        <form @submit.prevent="saveVendor">
          <div class="mb-3">
            <label class="form-label">Vendor Name</label>
            <input type="text" class="form-control" v-model="vendorForm.name" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="vendorForm.email">
          </div>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input type="text" class="form-control" v-model="vendorForm.phone">
          </div>
          <div class="mb-3">
            <label class="form-label">Address</label>
            <textarea class="form-control" v-model="vendorForm.address" rows="3"></textarea>
          </div>
          <div class="btn-group w-100">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" @click="cancelVendorEdit">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Vendor Management
const vendors = ref(JSON.parse(localStorage.getItem('vendors') || '[]'))
const showAddVendorModal = ref(false)
const editingVendor = ref(null)
const vendorForm = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  address: ''
})

// Payment history for statistics
const paymentHistory = computed(() => JSON.parse(localStorage.getItem('checkList') || '[]'))

// Vendors with statistics
const vendorsWithStats = computed(() => {
  return vendors.value.map(vendor => {
    const vendorPayments = paymentHistory.value.filter(payment => payment.payTo === vendor.name)
    const totalPaid = vendorPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
    const paymentCount = vendorPayments.length
    const lastPayment = vendorPayments.length > 0 
      ? new Date(vendorPayments[vendorPayments.length - 1].date).toLocaleDateString()
      : null
    const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0

    return {
      ...vendor,
      totalPaid,
      paymentCount,
      lastPayment,
      averagePayment
    }
  })
})

function saveVendor() {
  if (editingVendor.value) {
    // Update existing vendor
    const index = vendors.value.findIndex(v => v.id === editingVendor.value.id)
    if (index !== -1) {
      vendors.value[index] = { ...vendorForm }
    }
  } else {
    // Add new vendor
    const newVendor = {
      ...vendorForm,
      id: 'vendor-' + Date.now()
    }
    vendors.value.push(newVendor)
  }
  
  localStorage.setItem('vendors', JSON.stringify(vendors.value))
  cancelVendorEdit()
}

function editVendor(vendor) {
  editingVendor.value = vendor
  Object.assign(vendorForm, vendor)
  showAddVendorModal.value = true
}

function deleteVendor(vendorId) {
  if (confirm('Are you sure you want to delete this vendor?')) {
    vendors.value = vendors.value.filter(v => v.id !== vendorId)
    localStorage.setItem('vendors', JSON.stringify(vendors.value))
  }
}

function cancelVendorEdit() {
  showAddVendorModal.value = false
  editingVendor.value = null
  Object.assign(vendorForm, {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: ''
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

/* Vendor table styling */
.table-responsive {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

/* Button group styling */
.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>

