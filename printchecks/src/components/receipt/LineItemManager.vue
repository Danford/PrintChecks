<template>
  <div class="line-item-manager">
    <div class="header">
      <h3>📋 Line Items</h3>
      <button @click="addNewItem" class="btn btn-primary">
        ➕ Add Item
      </button>
    </div>
    
    <div v-if="!hasLineItems" class="empty-state">
      <p>No line items added yet.</p>
      <button @click="addNewItem" class="btn btn-secondary">
        Add Your First Item
      </button>
    </div>
    
    <div v-else class="line-items-table">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in lineItems" :key="item.id" class="line-item-row">
            <td>
              <input 
                v-model="item.description"
                @blur="updateItem(item.id, 'description', item.description)"
                placeholder="Item description"
                class="description-input"
              />
            </td>
            <td>
              <input 
                v-model.number="item.quantity"
                @blur="updateItem(item.id, 'quantity', item.quantity)"
                type="number"
                min="0"
                step="1"
                class="quantity-input"
              />
            </td>
            <td>
              <div class="price-input-wrapper">
                <span class="currency-symbol">$</span>
                <input 
                  v-model.number="item.unitPrice"
                  @blur="updateItem(item.id, 'unitPrice', item.unitPrice)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="price-input"
                />
              </div>
            </td>
            <td class="total-cell">
              {{ formatCurrency(item.totalPrice) }}
            </td>
            <td class="actions-cell">
              <button 
                @click="removeItem(item.id)"
                class="btn btn-danger btn-sm"
                title="Remove item"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Totals Section -->
      <div class="totals-section">
        <div class="totals-grid">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">{{ formatCurrency(calculatedTotals.subtotal) }}</span>
          </div>
          
          <div class="total-row" v-if="calculatedTotals.totalTax > 0">
            <span class="total-label">Tax:</span>
            <span class="total-value">{{ formatCurrency(calculatedTotals.totalTax) }}</span>
          </div>
          
          <div class="total-row" v-if="calculatedTotals.totalDiscount > 0">
            <span class="total-label">Discount:</span>
            <span class="total-value discount">-{{ formatCurrency(calculatedTotals.totalDiscount) }}</span>
          </div>
          
          <div class="total-row" v-if="calculatedTotals.shippingAmount > 0">
            <span class="total-label">Shipping:</span>
            <span class="total-value">{{ formatCurrency(calculatedTotals.shippingAmount) }}</span>
          </div>
          
          <div class="total-row grand-total">
            <span class="total-label">Grand Total:</span>
            <span class="total-value">{{ formatCurrency(calculatedTotals.grandTotal) }}</span>
          </div>
        </div>
        
        <!-- Additional Charges -->
        <div class="additional-charges">
          <h4>Additional Charges</h4>
          <div class="charge-inputs">
            <div class="charge-input">
              <label>Shipping:</label>
              <div class="price-input-wrapper">
                <span class="currency-symbol">$</span>
                <input 
                  v-model.number="shippingAmount"
                  @blur="updateShipping"
                  type="number"
                  min="0"
                  step="0.01"
                  class="price-input"
                />
              </div>
            </div>
            
            <div class="charge-input">
              <label>Handling:</label>
              <div class="price-input-wrapper">
                <span class="currency-symbol">$</span>
                <input 
                  v-model.number="handlingAmount"
                  @blur="updateHandling"
                  type="number"
                  min="0"
                  step="0.01"
                  class="price-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useReceiptStore } from '@/stores/receipt'
import { useFormatting } from '@/composables/useFormatting'

const receiptStore = useReceiptStore()
const { formatCurrency } = useFormatting()

// Local state for additional charges
const shippingAmount = ref(0)
const handlingAmount = ref(0)

// Computed properties
const lineItems = computed(() => receiptStore.currentReceipt?.lineItems || [])
const hasLineItems = computed(() => receiptStore.hasLineItems)
const calculatedTotals = computed(() => receiptStore.calculatedTotals)

// Methods
function addNewItem() {
  receiptStore.addLineItem('New Item', 1, 0)
}

function updateItem(itemId: string, field: string, value: any) {
  receiptStore.updateLineItem(itemId, { [field]: value })
}

function removeItem(itemId: string) {
  if (confirm('Remove this item?')) {
    receiptStore.removeLineItem(itemId)
  }
}

function updateShipping() {
  if (receiptStore.currentReceipt) {
    receiptStore.updateReceiptInfo({
      totals: {
        ...receiptStore.currentReceipt.totals,
        shippingAmount: shippingAmount.value
      }
    })
  }
}

function updateHandling() {
  if (receiptStore.currentReceipt) {
    receiptStore.updateReceiptInfo({
      totals: {
        ...receiptStore.currentReceipt.totals,
        handlingAmount: handlingAmount.value
      }
    })
  }
}

// Initialize
onMounted(() => {
  if (!receiptStore.currentReceipt) {
    receiptStore.createNewReceipt()
  }
  
  // Load existing additional charges
  if (receiptStore.currentReceipt) {
    shippingAmount.value = receiptStore.currentReceipt.totals.shippingAmount || 0
    handlingAmount.value = receiptStore.currentReceipt.totals.handlingAmount || 0
  }
})
</script>

<style scoped>
.line-item-manager {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.empty-state p {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 18px;
}

.line-items-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: bold;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
}

.line-item-row:hover {
  background: #f8f9fa;
}

.description-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.quantity-input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ced4da;
  border-radius: 4px;
  overflow: hidden;
  width: 120px;
}

.currency-symbol {
  background: #e9ecef;
  padding: 8px 10px;
  font-weight: bold;
  color: #495057;
}

.price-input {
  flex: 1;
  padding: 8px;
  border: none;
  outline: none;
  text-align: right;
}

.total-cell {
  font-weight: bold;
  color: #28a745;
  text-align: right;
}

.actions-cell {
  text-align: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.totals-section {
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.totals-grid {
  max-width: 300px;
  margin-left: auto;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
}

.total-row.grand-total {
  border-bottom: none;
  border-top: 2px solid #495057;
  font-weight: bold;
  font-size: 18px;
  color: #495057;
}

.total-label {
  color: #495057;
}

.total-value {
  font-weight: bold;
  color: #28a745;
}

.total-value.discount {
  color: #dc3545;
}

.additional-charges {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.additional-charges h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.charge-inputs {
  display: flex;
  gap: 20px;
}

.charge-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.charge-input label {
  font-weight: bold;
  color: #495057;
  font-size: 14px;
}
</style>
