<template>
  <div class="analytics-dashboard p-4">
    <h4>📊 Enhanced Payment Analytics</h4>

    <!-- Two-Column Enhanced Analytics -->
    <div class="row mt-4">
      <div class="col-md-6">
        <div
          class="stats-card-enhanced"
          style="
            background: #e8f5e8;
            padding: 25px;
            border-radius: 12px;
            border-left: 6px solid #4caf50;
          "
        >
          <h5 style="color: #388e3c; margin-bottom: 20px">💰 Advanced Payment Totals</h5>
          <div class="stat-item">
            <span class="stat-label">This Month:</span>
            <strong class="stat-value">${{ enhancedStats.thisMonth.toFixed(2) }}</strong>
          </div>
          <div class="stat-item">
            <span class="stat-label">Last Month:</span>
            <strong class="stat-value">${{ enhancedStats.lastMonth.toFixed(2) }}</strong>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Payment:</span>
            <strong class="stat-value">${{ enhancedStats.averagePayment.toFixed(2) }}</strong>
          </div>
          <div class="stat-item">
            <span class="stat-label">Largest Payment:</span>
            <strong class="stat-value">${{ enhancedStats.largestPayment.toFixed(2) }}</strong>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div
          class="stats-card-enhanced"
          style="
            background: #fff3e0;
            padding: 25px;
            border-radius: 12px;
            border-left: 6px solid #ff9800;
          "
        >
          <h5 style="color: #f57c00; margin-bottom: 20px">📈 Vendor Insights</h5>
          <div class="stat-item">
            <span class="stat-label">Total Vendors:</span>
            <strong class="stat-value">{{ enhancedStats.totalVendors }}</strong>
          </div>
          <div class="stat-item">
            <span class="stat-label">Active This Month:</span>
            <strong class="stat-value">{{ enhancedStats.activeThisMonth }}</strong>
          </div>
          <div class="stat-item">
            <span class="stat-label">Most Frequent Vendor:</span>
            <strong class="stat-value">{{ enhancedStats.mostFrequentVendor || 'N/A' }}</strong>
          </div>
          <div class="stat-item">
            <span class="stat-label">Avg per Vendor:</span>
            <strong class="stat-value">${{ enhancedStats.averagePerVendor.toFixed(2) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Vendors -->
    <div class="row mt-4">
      <div class="col-md-12">
        <div
          class="stats-card-enhanced"
          style="
            background: #f3e5f5;
            padding: 25px;
            border-radius: 12px;
            border-left: 6px solid #9c27b0;
          "
        >
          <h5 style="color: #7b1fa2; margin-bottom: 20px">🏆 Top Vendors by Payment Amount</h5>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Vendor</th>
                  <th>Total Paid</th>
                  <th>Payment Count</th>
                  <th>Average Payment</th>
                  <th>Last Payment</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(vendor, index) in topVendors" :key="vendor.id">
                  <td>
                    <strong>{{ index + 1 }}</strong>
                  </td>
                  <td>{{ vendor.name }}</td>
                  <td>
                    <strong>${{ vendor.totalPaid.toFixed(2) }}</strong>
                  </td>
                  <td>{{ vendor.paymentCount }}</td>
                  <td>${{ vendor.averagePayment.toFixed(2) }}</td>
                  <td>{{ vendor.lastPayment || 'Never' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { filterActiveChecks } from '@/utils/checkFilters'
import { secureStorage } from '../services/secureStorage'
import type { Vendor, CheckData } from '@/types'

// Data from localStorage
const vendors = ref<Vendor[]>([])
const checkList = ref<CheckData[]>([])

// Load data from encrypted storage
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
  } catch (_e) {
    console.error('Failed to load analytics data:', _e)
  }
})

// Filter out voided checks from payment history
const paymentHistory = computed(() => filterActiveChecks(checkList.value))

// Enhanced Statistics
const enhancedStats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthPayments = paymentHistory.value.filter((payment) => {
    const paymentDate = new Date(payment.date)
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
  })

  const lastMonthPayments = paymentHistory.value.filter((payment) => {
    const paymentDate = new Date(payment.date)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear
  })

  const thisMonth = thisMonthPayments.reduce(
    (sum, payment) =>
      sum +
      (typeof payment.amount === 'number'
        ? payment.amount
        : parseFloat(payment.amount?.toString() || '0')),
    0
  )
  const lastMonth = lastMonthPayments.reduce(
    (sum, payment) =>
      sum +
      (typeof payment.amount === 'number'
        ? payment.amount
        : parseFloat(payment.amount?.toString() || '0')),
    0
  )
  const total = paymentHistory.value.reduce(
    (sum, payment) =>
      sum +
      (typeof payment.amount === 'number'
        ? payment.amount
        : parseFloat(payment.amount?.toString() || '0')),
    0
  )
  const averagePayment = paymentHistory.value.length > 0 ? total / paymentHistory.value.length : 0
  const largestPayment =
    paymentHistory.value.length > 0
      ? Math.max(
          ...paymentHistory.value.map((p) =>
            typeof p.amount === 'number' ? p.amount : parseFloat(p.amount?.toString() || '0')
          )
        )
      : 0

  // Vendor statistics
  const vendorCounts: Record<string, number> = {}
  thisMonthPayments.forEach((payment) => {
    vendorCounts[payment.payTo] = (vendorCounts[payment.payTo] || 0) + 1
  })

  const activeThisMonth = Object.keys(vendorCounts).length
  const mostFrequentVendor = Object.keys(vendorCounts).reduce(
    (a, b) => (vendorCounts[a] > vendorCounts[b] ? a : b),
    ''
  )

  const averagePerVendor = vendors.value.length > 0 ? total / vendors.value.length : 0

  return {
    thisMonth,
    lastMonth,
    averagePayment,
    largestPayment,
    totalVendors: vendors.value.length,
    activeThisMonth,
    mostFrequentVendor,
    averagePerVendor
  }
})

// Vendors with statistics
const vendorsWithStats = computed(() => {
  return vendors.value.map((vendor) => {
    const vendorPayments = paymentHistory.value.filter((payment) => payment.payTo === vendor.name)
    const totalPaid = vendorPayments.reduce(
      (sum, payment) =>
        sum +
        (typeof payment.amount === 'number'
          ? payment.amount
          : parseFloat(payment.amount?.toString() || '0')),
      0
    )
    const paymentCount = vendorPayments.length
    const lastPayment =
      vendorPayments.length > 0
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

// Top vendors
const topVendors = computed(() => {
  return vendorsWithStats.value
    .filter((v) => v.totalPaid > 0)
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10)
})
</script>

<style scoped>
/* Enhanced stats cards */
.stats-card-enhanced {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stats-card-enhanced:hover {
  transform: translateY(-2px);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.stat-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

/* Table styling */
.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}

.table th {
  background-color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}
</style>
