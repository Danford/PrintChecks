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
    <VendorModal 
      v-model="showAddVendorModal" 
      :editing-vendor="editingVendor"
      @save="saveVendor"
      @cancel="cancelVendorEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VendorModal from '../components/VendorModal.vue'
import { filterActiveChecks } from '@/utils/checkFilters'
import { secureStorage } from '../services/secureStorage.ts'

// Vendor Management
const vendors = ref<any[]>([])
const checkList = ref<any[]>([])
const showAddVendorModal = ref(false)
const editingVendor = ref(null)

// Load vendors and check list from encrypted storage
onMounted(async () => {
  try {
    const vendorsData = await secureStorage.get('vendors')
    if (vendorsData) {
      vendors.value = JSON.parse(vendorsData)
    }
    
    const checksData = await secureStorage.get('checkList')
    if (checksData) {
      checkList.value = JSON.parse(checksData)
    }
  } catch (e) {
    console.error('Failed to load vendor data:', e)
  }
})

// Payment history for statistics - filter out voided checks
const paymentHistory = computed(() => filterActiveChecks(checkList.value))

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

async function saveVendor(vendorData) {
  if (editingVendor.value) {
    // Update existing vendor
    const index = vendors.value.findIndex(v => v.id === editingVendor.value.id)
    if (index !== -1) {
      vendors.value[index] = { ...vendorData }
    }
  } else {
    // Add new vendor
    const newVendor = {
      ...vendorData,
      id: 'vendor-' + Date.now()
    }
    vendors.value.push(newVendor)
  }
  
  await secureStorage.set('vendors', JSON.stringify(vendors.value))
  cancelVendorEdit()
}

function editVendor(vendor) {
  editingVendor.value = vendor
  showAddVendorModal.value = true
}

async function deleteVendor(vendorId) {
  if (confirm('Are you sure you want to delete this vendor?')) {
    vendors.value = vendors.value.filter(v => v.id !== vendorId)
    await secureStorage.set('vendors', JSON.stringify(vendors.value))
  }
}

function cancelVendorEdit() {
  showAddVendorModal.value = false
  editingVendor.value = null
}
</script>

<style scoped>
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
