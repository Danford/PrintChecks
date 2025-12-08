<template>
            <!-- MAIN PRINT CONTAINER - All 3 sections in one div -->
    <div class="print-container" id="print-container">
        <!-- SECTION 1: Check (Top Third) -->
        <div class="check-section">
            <div class="check-box" id="check-box">
            <div style="position: relative;" id="check-box-print">
                <div class="account-holder-name" :style="{ ...checkStyles.accountHolderName, position: 'absolute', ...dynamicTextPositions.accountHolderName }">{{check.accountHolderName}}</div>
                <div class="account-holder-address" :style="{ ...checkStyles.accountHolderName, position: 'absolute', ...dynamicTextPositions.accountHolderAddress }">
                    {{check.accountHolderAddress}}<br>
                    {{check.accountHolderCity}}, {{check.accountHolderState}} {{check.accountHolderZip}}
                </div>
                <div class="check-number-human" :style="{ ...checkStyles.checkNumber, position: 'absolute', ...dynamicTextPositions.checkNumber }">{{check.checkNumber}}</div>
                <div class="date-data" :style="{ ...checkStyles.date, position: 'absolute', ...dynamicTextPositions.date }">{{check.date}}</div>
                <div class="date" style="position: absolute; top: 90px; left: 760px">Date: _____________________ </div>
                <div class="amount-box" style="position: absolute; top: 175px; left: 950px">

                </div>
                <div class="amount-data" :style="{ ...checkStyles.amount, position: 'absolute', ...dynamicTextPositions.amount }">{{formatMoney(check.amount)}}</div>
                <div class="pay-to-data" :style="{ ...checkStyles.payTo, position: 'absolute', ...dynamicTextPositions.payTo }">{{check.payTo}}</div>
                <div class="pay-to" style="position: absolute; top: 170px; left: 60px">
                    Pay to the <br>Order of <span class="payto-line"></span>
                </div>
                <div class="amount-line-data" ref="line" :style="{ ...checkStyles.amountWords, position: 'absolute', ...dynamicTextPositions.amountWords }">
                    ***
                    {{toWords(check.amount)}} 
                    ***
                </div>
                <div class="amount-line" style="position: absolute; top: 250px; left: 60px">
                    <span class="dollar-line"></span>
                </div>
                <div class="bank-name" :style="{ ...checkStyles.bankName, position: 'absolute', ...dynamicTextPositions.bankName }">{{check.bankName}}</div>
                <div class="memo-data" :style="{ ...checkStyles.memo, position: 'absolute', ...dynamicTextPositions.memo }">{{check.memo}}</div>
                <div class="memo" style="position: absolute; top: 390px; left: 60px">
                    Memo: ____________________________________
                </div>
                <div class="signature-data" :style="{ ...checkStyles.signature, position: 'absolute', ...dynamicTextPositions.signature }">{{check.signature}}</div>
                <div class="signature" style="position: absolute; top: 390px; left: 750px">
                    _________________________________________________
                </div>
                <div class="banking" :style="{ ...checkStyles.bankInfo, position: 'absolute', ...dynamicTextPositions.bankInfo }">
                    <div class="routing" style="display: inline;">
                        a{{check.routingNumber}}a
                    </div>
                    <div class="bank-account" style="display: inline;">{{check.bankAccountNumber}}c</div>
                    <div class="check-number" style="display: inline; margin-left:20px">{{check.checkNumber}}</div>
                </div>

                <!-- Logo Section -->
                <div v-if="hasCustomLogo && logoImageSrc" 
                     class="logo-container" 
                     :class="`logo-${currentSettings?.logo?.position || 'top-left'}`"
                     :style="{ 
                       width: `${currentSettings?.logo?.size?.width || 100}px`,
                       height: `${currentSettings?.logo?.size?.height || 50}px`,
                       opacity: currentSettings?.logo?.opacity || 1,
                       marginTop: `${currentSettings?.logo?.margin?.top || 0}px`,
                       marginRight: `${currentSettings?.logo?.margin?.right || 0}px`,
                       marginBottom: `${currentSettings?.logo?.margin?.bottom || 0}px`,
                       marginLeft: `${currentSettings?.logo?.margin?.left || 0}px`
                     }">
                    <img :src="logoImageSrc" 
                         alt="Logo"
                         :style="{
                           width: '100%',
                           height: '100%',
                           objectFit: currentSettings?.logo?.objectFit || 'contain',
                           objectPosition: currentSettings?.logo?.objectPosition || 'center'
                         }"
                         @error="handleLogoError"
                         @load="handleLogoLoad" />
                </div>
                

            </div>
            </div>
        </div>

        <!-- SECTION 2: Payment Details (Middle Third) -->
        <div class="payment-details-section">
            <h3 style="margin-bottom: 20px; color: #333; text-align: center;">📋 Payment Details</h3>
            <div class="line-items-table" style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; max-width: 800px; margin: 0 auto;">
                <table style="width: 100%; font-size: 14px;">
                    <thead>
                        <tr style="border-bottom: 2px solid #333;">
                            <th style="text-align: left; padding: 12px;">Description</th>
                            <th style="text-align: center; padding: 12px;">Qty</th>
                            <th style="text-align: right; padding: 12px;">Rate</th>
                            <th style="text-align: right; padding: 12px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in (lineItems.length > 0 ? lineItems : testLineItems)" :key="item.id" style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 12px;">{{ item.description }}</td>
                            <td style="text-align: center; padding: 10px 12px;">{{ item.quantity }}</td>
                            <td style="text-align: right; padding: 10px 12px;">${{ item.rate.toFixed(2) }}</td>
                            <td style="text-align: right; padding: 10px 12px;">${{ (item.quantity * item.rate).toFixed(2) }}</td>
                        </tr>
                    </tbody>
                    <tfoot v-if="calculatedTotals || testTotals">
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td colspan="3" style="text-align: right; padding: 12px; font-size: 16px;">Subtotal:</td>
                            <td style="text-align: right; padding: 12px; font-size: 16px;">${{ (calculatedTotals?.subtotal || testTotals.subtotal).toFixed(2) }}</td>
                        </tr>
                        <tr v-if="(calculatedTotals?.taxAmount || testTotals.taxAmount) > 0">
                            <td colspan="3" style="text-align: right; padding: 8px 12px;">Tax:</td>
                            <td style="text-align: right; padding: 8px 12px;">${{ (calculatedTotals?.taxAmount || testTotals.taxAmount).toFixed(2) }}</td>
                        </tr>
                        <tr v-if="(calculatedTotals?.shippingAmount || testTotals.shippingAmount) > 0">
                            <td colspan="3" style="text-align: right; padding: 8px 12px;">Shipping:</td>
                            <td style="text-align: right; padding: 8px 12px;">${{ (calculatedTotals?.shippingAmount || testTotals.shippingAmount).toFixed(2) }}</td>
                        </tr>
                        <tr style="border-top: 2px solid #333; font-weight: bold; font-size: 18px; background: #f0f0f0;">
                            <td colspan="3" style="text-align: right; padding: 15px 12px;">Total:</td>
                            <td style="text-align: right; padding: 15px 12px;">${{ (calculatedTotals?.total || testTotals.total).toFixed(2) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- SECTION 3: Payment Summary (Bottom Third) -->
        <div class="payment-summary-section" style="margin-top: 50px; padding: 30px; border-top: 2px solid #ddd;">
            <h3 style="margin-bottom: 20px; color: #333; text-align: center;">💰 Payment Summary</h3>
            <div class="stats-card" style="background: #e3f2fd; padding: 25px; border-radius: 12px; border-left: 6px solid #2196f3; max-width: 600px; margin: 0 auto;">
                <div style="font-size: 16px; line-height: 1.6;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #bbdefb;">
                        <span style="font-weight: 500;">This Year ({{ new Date().getFullYear() }}):</span>
                        <strong style="color: #1976d2; font-size: 18px;">${{ paymentStats.thisYear.toFixed(2) }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #bbdefb;">
                        <span style="font-weight: 500;">All Time Total:</span>
                        <strong style="color: #1976d2; font-size: 18px;">${{ paymentStats.allTime.toFixed(2) }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #bbdefb;">
                        <span style="font-weight: 500;">Payments This Year:</span>
                        <strong style="color: #1976d2; font-size: 18px;">{{ paymentStats.thisYearCount }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                        <span style="font-weight: 500;">Total Payments:</span>
                        <strong style="color: #1976d2; font-size: 18px;">{{ paymentStats.count }}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- FORM SECTION - Outside print container -->
    <div class="form-container">
        <!-- ENHANCED CHECK CREATION -->
        <div class="enhanced-check-creation" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h5 style="margin-bottom: 15px; color: #495057;">✏️ Quick Check Creation</h5>
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="bankSelect" class="form-label">Select Bank Account</label>
                    <select class="form-control" id="bankSelect" v-model="selectedBankId" @change="loadBankAccount">
                        <option value="">Choose Bank Account...</option>
                        <option v-for="bank in bankAccounts" :key="bank.id" :value="bank.id">
                            {{ bank.name }} (****{{ bank.accountNumber.slice(-4) }})
                        </option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="vendorSelect" class="form-label">Select Vendor</label>
                    <select class="form-control" id="vendorSelect" v-model="selectedVendorId" @change="loadVendor">
                        <option value="">Choose Vendor...</option>
                        <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                            {{ vendor.name }}
                        </option>
                    </select>
                </div>
                <div class="col-md-4 d-flex align-items-end">
                    <button type="button" class="btn btn-success btn-lg w-100" @click="openQuickCheckModal" :disabled="!selectedBankId">
                        ➕ Write New Check
                    </button>
                </div>
            </div>
        </div>

        <!-- QUICK CHECK MODAL -->
        <div v-if="showQuickCheckModal" class="modal-overlay">
            <div class="modal-content">
                <h5>💰 Write New Check</h5>
                <div class="mb-3">
                    <strong>Bank:</strong> {{ selectedBank?.name }}<br>
                    <strong>Vendor:</strong> {{ selectedVendor?.name || 'Custom Payee' }}<br>
                    <strong>Check #:</strong> {{ nextCheckNumber }}
                </div>
                <form @submit.prevent="createQuickCheck">
                    <div class="mb-3">
                        <label class="form-label">Pay To</label>
                        <input type="text" class="form-control" v-model="quickCheckForm.payTo" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Amount ($)</label>
                        <input type="number" step="0.01" class="form-control" v-model="quickCheckForm.amount" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Memo</label>
                        <input type="text" class="form-control" v-model="quickCheckForm.memo">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Signature</label>
                        <input type="text" class="form-control" v-model="quickCheckForm.signature" placeholder="Your signature">
                    </div>
                    <div class="btn-group w-100">
                        <button type="submit" class="btn btn-primary">Create Check</button>
                        <button type="button" class="btn btn-secondary" @click="closeQuickCheckModal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="check-data">
            <!-- Show Print Button when check is ready -->
            <div v-if="check.payTo && check.amount > 0" class="text-center" style="padding: 30px;">
                <div class="alert alert-success mb-4" role="alert">
                    <strong>✅ Check Ready!</strong> Review the check preview above, then click Print to save and print.
                </div>
                <button type="button" class="btn btn-primary btn-lg" @click="printCheck" style="padding: 15px 50px; font-size: 18px;">
                    🖨️ Print Check (Ctrl + P)
                </button>
                <div class="mt-3">
                    <small class="text-muted">Check will be automatically saved to history when printed</small>
                </div>
            </div>
            
            <!-- Show Info when no check is created -->
            <div v-else class="alert alert-info" role="alert">
                <strong>ℹ️ Info:</strong> Use the "Write New Check" button above to create checks. The check preview will display here. Background does not print.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import print from 'print-js';
import { ToWords } from 'to-words';
import { ref, reactive, nextTick, watch, onMounted, onUnmounted, computed } from 'vue'
import { formatMoney } from '../utilities.ts'
import { useAppStore } from '../stores/app.ts'
import { useCustomizationStore } from '../stores/customization.ts'
import { useReceiptStore } from '../stores/receipt.ts'
import { useHistoryStore } from '../stores/history.ts'

const state = useAppStore()
const customizationStore = useCustomizationStore()
const receiptStore = useReceiptStore()
const historyStore = useHistoryStore()

const toWordsTool = new ToWords({
  localeCode: 'en-US',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: true,
  },
});

const toWords: (denom: number | string) => string = (denom) => {
    try {
        return toWordsTool.convert(Number(denom), );
    } catch (e) {
        return `${e}`;
    }
}

// Computed properties for customization
const currentSettings = computed(() => customizationStore.currentSettings)
const hasCustomLogo = computed(() => customizationStore.hasCustomLogo)
const logoImageSrc = computed(() => {
  if (!currentSettings.value?.logo) return ''
  return currentSettings.value.logo.file?.url || currentSettings.value.logo.url || ''
})
const lineItems = computed(() => receiptStore.currentReceipt?.lineItems || [])
const hasLineItems = computed(() => receiptStore.hasLineItems)
const calculatedTotals = computed(() => receiptStore.calculatedTotals)

// Test line items for demonstration
const testLineItems = ref([
  { id: 1, description: 'Professional Services', quantity: 1, rate: 150.00 },
  { id: 2, description: 'Consultation Fee', quantity: 2, rate: 75.00 },
  { id: 3, description: 'Materials & Supplies', quantity: 1, rate: 50.00 }
])

// Test totals for demonstration
const testTotals = ref({
  subtotal: 350.00,
  taxAmount: 28.00,
  shippingAmount: 0,
  total: 378.00
})

// Bank and Vendor Data for Quick Check (read-only)
const bankAccounts = ref(JSON.parse(localStorage.getItem('bankAccounts') || '[]'))
const selectedBankId = ref('')
const vendors = ref(JSON.parse(localStorage.getItem('vendors') || '[]'))
const selectedVendorId = ref('')

// Quick Check Modal
const showQuickCheckModal = ref(false)
const quickCheckForm = reactive({
    payTo: '',
    amount: '',
    memo: '',
    signature: ''
})

// Computed properties for bank and vendor selection
const selectedBank = computed(() => bankAccounts.value.find(b => b.id === selectedBankId.value))
const selectedVendor = computed(() => vendors.value.find(v => v.id === selectedVendorId.value))

// Auto-calculate next check number based on selected bank
const nextCheckNumber = computed(() => {
    if (!selectedBank.value) return '1001'
    
    const bankChecks = JSON.parse(localStorage.getItem('checkList') || '[]')
        .filter(check => check.bankName === selectedBank.value.name)
    
    if (bankChecks.length === 0) {
        return selectedBank.value.startingCheckNumber || 1001
    }
    
    const lastCheckNumber = Math.max(...bankChecks.map(check => parseInt(check.checkNumber) || 0))
    return lastCheckNumber + 1
})



// Dynamic text positioning to avoid logo overlap
const dynamicTextPositions = computed(() => {
  const logo = currentSettings.value?.logo
  if (!hasCustomLogo.value || !logo) {
    // Return default positions when no logo
    return {
      accountHolderName: { top: '40px', left: '60px' },
      accountHolderAddress: { top: '70px', left: '60px' },
      checkNumber: { top: '40px', left: '1060px' },
      date: { top: '80px', left: '850px' },
      payTo: { top: '180px', left: '180px' },
      amount: { top: '182px', left: '970px' },
      amountWords: { top: '240px', left: '100px' },
      bankName: { top: '300px', left: '60px' },
      memo: { top: '367px', left: '120px' },
      signature: { top: '366px', left: '770px' },
      bankInfo: { top: '420px', left: '80px' }
    }
  }

  const logoWidth = logo.size?.width || 100
  const logoHeight = logo.size?.height || 50
  const logoPosition = logo.position || 'top-left'
  const margin = logo.margin || { top: 10, right: 10, bottom: 10, left: 10 }
  
  // Calculate logo boundaries including margins
  const logoBounds = {
    'top-left': { 
      left: 20 + margin.left, 
      right: 20 + margin.left + logoWidth, 
      top: 20 + margin.top, 
      bottom: 20 + margin.top + logoHeight 
    },
    'top-center': { 
      left: (1200 - logoWidth) / 2 + margin.left, 
      right: (1200 + logoWidth) / 2 + margin.right, 
      top: 20 + margin.top, 
      bottom: 20 + margin.top + logoHeight 
    },
    'top-right': { 
      left: 1200 - 20 - logoWidth - margin.right, 
      right: 1200 - 20 - margin.right, 
      top: 20 + margin.top, 
      bottom: 20 + margin.top + logoHeight 
    },
    'bottom-left': { 
      left: 20 + margin.left, 
      right: 20 + margin.left + logoWidth, 
      top: 450 - logoHeight - 20 - margin.bottom, 
      bottom: 450 - 20 - margin.bottom 
    },
    'bottom-center': { 
      left: (1200 - logoWidth) / 2 + margin.left, 
      right: (1200 + logoWidth) / 2 + margin.right, 
      top: 450 - logoHeight - 20 - margin.bottom, 
      bottom: 450 - 20 - margin.bottom 
    },
    'bottom-right': { 
      left: 1200 - 20 - logoWidth - margin.right, 
      right: 1200 - 20 - margin.right, 
      top: 450 - logoHeight - 20 - margin.bottom, 
      bottom: 450 - 20 - margin.bottom 
    }
  }

  const bounds = logoBounds[logoPosition]
  
  // Default positions
  let positions = {
    accountHolderName: { top: '40px', left: '60px' },
    accountHolderAddress: { top: '70px', left: '60px' },
    checkNumber: { top: '40px', left: '1060px' },
    date: { top: '80px', left: '850px' },
    payTo: { top: '180px', left: '180px' },
    amount: { top: '182px', left: '970px' },
    amountWords: { top: '240px', left: '100px' },
    bankName: { top: '300px', left: '60px' },
    memo: { top: '367px', left: '120px' },
    signature: { top: '366px', left: '770px' },
    bankInfo: { top: '420px', left: '80px' }
  }

  // Adjust positions based on logo placement - text flows around logo
  if (logoPosition === 'top-left') {
    // For top-left logo, move account holder info right to flow around logo
    if (bounds.right > 60) {
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
    // Keep text at original vertical positions - no downward movement
    // Text flows horizontally around the logo space
  }

  if (logoPosition === 'top-center') {
    // For top-center, text flows around both sides of the logo
    if (bounds.left < 300) {
      // Logo extends into left area, move account holder right to flow around
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
    if (bounds.right > 800) {
      // Logo extends into right area, move check number left to flow around
      positions.checkNumber.left = `${Math.max(bounds.left - 100, 600)}px`
      positions.date.left = `${Math.max(bounds.left - 100, 600)}px`
    }
    // Text maintains original vertical positions - flows horizontally around logo
  }

  if (logoPosition === 'top-right') {
    // For top-right logo, text flows around to the left of the logo
    if (bounds.left < 1060) {
      positions.checkNumber.left = `${Math.max(bounds.left - 100, 700)}px`
    }
    if (bounds.left < 950) {
      positions.date.left = `${Math.max(bounds.left - 100, 700)}px`
    }
    // Text maintains original vertical positions - flows horizontally around logo
  }

  if (logoPosition.includes('bottom')) {
    // For bottom logos, text flows around horizontally - no vertical movement
    if (logoPosition === 'bottom-left') {
      // Text flows to the right of the logo
      if (bounds.right > 80) {
        positions.bankInfo.left = `${bounds.right + 15}px`
      }
      if (bounds.right > 120) {
        positions.memo.left = `${bounds.right + 15}px`
      }
      if (bounds.right > 60) {
        positions.bankName.left = `${bounds.right + 15}px`
      }
    }
    
    if (logoPosition === 'bottom-right') {
      // Text flows to the left of the logo
      if (bounds.left < 770) {
        positions.signature.left = `${Math.max(bounds.left - 200, 500)}px`
      }
    }
    
    if (logoPosition === 'bottom-center') {
      // Text flows around both sides of centered logo
      if (bounds.left < 400) {
        // Logo extends left, move left elements right
        positions.bankInfo.left = `${bounds.right + 15}px`
        positions.memo.left = `${bounds.right + 15}px`
        positions.bankName.left = `${bounds.right + 15}px`
      }
      if (bounds.right > 700) {
        // Logo extends right, move right elements left
        positions.signature.left = `${Math.max(bounds.left - 200, 500)}px`
      }
    }
    
    // Text maintains original vertical positions - flows horizontally around logo
  }

  return positions
})

// Payment statistics
const paymentStats = computed(() => {
    const currentYear = new Date().getFullYear()
    const allPayments = [
        ...historyStore.checks.map(check => ({
            amount: parseFloat(check.amount || '0'),
            date: new Date(check.date || Date.now())
        })),
        ...historyStore.paymentRecords.map(payment => ({
            amount: payment.amount,
            date: new Date(payment.date)
        }))
    ]
    
    const thisYearPayments = allPayments.filter(payment => 
        payment.date.getFullYear() === currentYear
    )
    
    const thisYearTotal = thisYearPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const allTimeTotal = allPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    return {
        thisYear: thisYearTotal,
        allTime: allTimeTotal,
        count: allPayments.length,
        thisYearCount: thisYearPayments.length
    }
})

// Dynamic styles based on customization
const checkStyles = computed(() => {
    if (!currentSettings.value || !currentSettings.value.fonts) return {}
    
    const settings = currentSettings.value
    const fonts = settings.fonts
    
    // Helper function to safely get font styles with fallbacks
    const getFontStyle = (fontConfig: any, fallback = { family: 'Arial, sans-serif', size: 16, weight: 'normal', color: '#000000' }) => ({
        fontFamily: fontConfig?.family || fallback.family,
        fontSize: `${fontConfig?.size || fallback.size}px`,
        fontWeight: fontConfig?.weight || fallback.weight,
        color: fontConfig?.color || fallback.color
    })
    
    return {
        accountHolderName: getFontStyle(fonts.accountHolder),
        payTo: getFontStyle(fonts.payTo),
        amount: getFontStyle(fonts.amount),
        memo: getFontStyle(fonts.memo),
        signature: getFontStyle(fonts.signature, { family: 'Caveat, cursive', size: 40, weight: 'normal', color: '#000000' }),
        bankInfo: getFontStyle(fonts.bankInfo, { family: 'banking, monospace', size: 37, weight: 'normal', color: '#000000' }),
        amountWords: getFontStyle(fonts.amountWords),
        checkNumber: getFontStyle(fonts.checkNumber),
        date: getFontStyle(fonts.date),
        bankName: getFontStyle(fonts.bankName, { family: 'Open Sans, sans-serif', size: 24, weight: 'bold', color: '#000000' })
    }
})

function printCheck () {
    // Auto-save to history when printing
    saveToHistory()
    
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          margin: 0;
        }
        
        /* Force background colors to print */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Hide form container and other elements */
        .form-container {
          display: none !important;
        }
        
        /* Hide navigation and title elements */
        .nav, .nav-tabs, .nav-item, .nav-link,
        .panel-header, .header,
        .container h1, .container p {
          display: none !important;
        }
        
        /* Show and position the print container */
        .print-container {
          display: block !important;
          width: 100vw !important;
          height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          background: white !important;
        }
        
        /* Ensure all sections are visible */
        .check-section,
        .payment-details-section,
        .payment-summary-section {
          display: block !important;
        }
        
        /* Section 1: Check (Top Third) */
        .check-section {
          height: 33.33vh !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
          background: white !important;
        }
        
        .check-box {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 20px !important;
          background: white !important;
          border: none !important;
          box-shadow: none !important;
          position: relative !important;
        }
        
        /* Section 2: Payment Details (Middle Third) */
        .payment-details-section {
          height: 33.33vh !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 20px !important;
          border-top: 2px solid #000 !important;
          background: white !important;
          position: relative !important;
        }
        
        .line-items-table {
          background: white !important;
          border: 2px solid #000 !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 10px !important;
          border-radius: 0 !important;
        }
        
        /* Override any inline styles that might cause spacing issues */
        .payment-details-section h3,
        .payment-summary-section h3 {
          margin: 0 0 10px 0 !important;
          padding: 0 !important;
        }
        
        /* Section 3: Payment Summary (Bottom Third) */
        .payment-summary-section {
          height: 33.33vh !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 20px !important;
          border-top: 2px solid #000 !important;
          background: white !important;
          position: relative !important;
        }
        
        .stats-card {
          background: #e3f2fd !important;
          border: 2px solid #000 !important;
          border-left: 6px solid #2196f3 !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 25px !important;
          border-radius: 12px !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    style.remove();
}

function saveToHistory () {
    let checkList = JSON.parse(localStorage.getItem('checkList') || '[]')
    checkList.push(check)
    localStorage.setItem('checkList', JSON.stringify(checkList))
}

function genNewCheck () {
    let checkList = JSON.parse(localStorage.getItem('checkList') || '[]')
    let recentCheck = checkList[checkList.length - 1]
    let check = {}
    check.accountHolderName = recentCheck?.accountHolderName || 'John Smith'
    check.accountHolderAddress = recentCheck?.accountHolderAddress || '123 Cherry Tree Lane'
    check.accountHolderCity = recentCheck?.accountHolderCity || 'New York'
    check.accountHolderState = recentCheck?.accountHolderState || 'NY'
    check.accountHolderZip = recentCheck?.accountHolderZip || '10001'
    check.checkNumber = recentCheck?.checkNumber ? (parseInt(recentCheck?.checkNumber) + 1) : '100'
    check.date = new Date().toLocaleDateString()
    check.bankName = recentCheck?.bankName || 'Bank Name, INC'
    check.amount = '0.00'
    check.payTo = 'Michael Johnson'
    check.memo = recentCheck?.memo || 'Rent'
    check.signature = recentCheck?.signature || 'John Smith'
    check.routingNumber = recentCheck?.routingNumber || '022303659'
    check.bankAccountNumber = recentCheck?.bankAccountNumber || '000000000000'
    return check
}

const check = reactive(
    genNewCheck()
)

const line = ref(null)

watch(check, async () => {
    await nextTick(() => {
        let computedLine = line?.value?.clientWidth
        check.lineLength = computedLine
    })
}, { immediate: true })

function handlePrintShortcut(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        printCheck();
    }
}

// Logo error handling functions
function handleLogoError(event: Event) {
    console.warn('Logo failed to load:', event)
    // Could add user notification here if needed
}

function handleLogoLoad(event: Event) {
    console.log('Logo loaded successfully:', event)
}

// Bank Management Methods
function loadBankAccount() {
    if (!selectedBankId.value) return
    
    const bank = bankAccounts.value.find(b => b.id === selectedBankId.value)
    if (bank) {
        // Load bank details
        check.bankName = bank.name
        check.routingNumber = bank.routingNumber
        check.bankAccountNumber = bank.accountNumber
        
        // Load account holder information from bank account
        check.accountHolderName = bank.accountHolderName || ''
        check.accountHolderAddress = bank.accountHolderAddress || ''
        check.accountHolderCity = bank.accountHolderCity || ''
        check.accountHolderState = bank.accountHolderState || ''
        check.accountHolderZip = bank.accountHolderZip || ''
    }
}

// Vendor loading for Quick Check
function loadVendor() {
    if (!selectedVendorId.value) return
    
    const vendor = vendors.value.find(v => v.id === selectedVendorId.value)
    if (vendor) {
        check.payTo = vendor.name
        quickCheckForm.payTo = vendor.name
    }
}

// Quick Check Methods
function openQuickCheckModal() {
    if (!selectedBankId.value) {
        alert('Please select a bank account first.')
        return
    }
    
    // Pre-populate with selected vendor if any
    if (selectedVendor.value) {
        quickCheckForm.payTo = selectedVendor.value.name
    } else {
        quickCheckForm.payTo = ''
    }
    
    quickCheckForm.amount = ''
    quickCheckForm.memo = ''
    quickCheckForm.signature = check.signature || '' // Pre-fill with previous signature or empty
    showQuickCheckModal.value = true
}

function createQuickCheck() {
    if (!selectedBank.value) {
        alert('Please select a bank account.')
        return
    }
    
    // Fill in the check form with quick check data
    check.checkNumber = nextCheckNumber.value.toString()
    check.date = new Date().toISOString().split('T')[0]
    check.payTo = quickCheckForm.payTo
    check.amount = quickCheckForm.amount
    check.memo = quickCheckForm.memo
    check.signature = quickCheckForm.signature || check.signature // Use provided signature or keep existing
    
    // Load bank information
    loadBankAccount()
    
    closeQuickCheckModal()
}

function closeQuickCheckModal() {
    showQuickCheckModal.value = false
    Object.assign(quickCheckForm, {
        payTo: '',
        amount: '',
        memo: '',
        signature: ''
    })
}

onMounted(() => {
    // Initialize stores
    customizationStore.initializeCustomization()
    historyStore.loadHistory()
    
    if (state.check) {
        check.accountHolderName = state.check.accountHolderName
        check.accountHolderAddress = state.check.accountHolderAddress
        check.accountHolderCity = state.check.accountHolderCity
        check.accountHolderState = state.check.accountHolderState
        check.accountHolderZip = state.check.accountHolderZip
        check.checkNumber = state.check.checkNumber
        check.date = state.check.date
        check.bankName = state.check.bankName
        check.amount = state.check.amount
        check.payTo = state.check.payTo
        check.memo = state.check.memo
        check.signature = state.check.signature
        check.routingNumber = state.check.routingNumber
        check.bankAccountNumber = state.check.bankAccountNumber
    }
    state.check = null

    window.addEventListener('keydown', handlePrintShortcut);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handlePrintShortcut);
});

</script>

<style>

label {
    font-weight: bold;
}

/* Tab styling */
.tab-content {
    padding: 20px;
    border: 1px solid #dee2e6;
    border-top: none;
    border-radius: 0 0 0.375rem 0.375rem;
}

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

/* Bank card styling */
.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
.memo-data {
    font-family: Caveat;
    font-size: 30px;
    max-width: 350px;
    line-height: 0.65;
}
.signature-data {
    font-family: Caveat;
    font-size: 40px;
    transform: rotate(-2deg);
}
.amount-line-data {
    text-transform: capitalize;
}
.date-data, .pay-to-data, .amount-data{
    font-size: 20px;
    font-weight: bold;
}
.check-data {
    margin-top: 50px;
    padding: 50px 120px;
    border-top: 1px solid #e6e6e6;
}
.bank-name{
    font-size: 20px;
    font-weight: bold;
}
.account-holder-name {
    font-size: 20px;
    font-weight: bold;
}
.check-number-human {
    font-size: 20px;
    font-weight: bold;
}
.amount-box::before {
    content: "$";
    font-size: 20px;
    margin-left: -15px;
    font-weight: bold;
}
.amount-box {
    width: 225px;
    height: 40px;
    border: 1px solid #c7c7c7;
    background-color: white;
}
.check-box {
    width: 1200px;
    height: 500px;
    border: 1px solid #e6e6e6;
    background-color: white;
    margin: 0 auto;
    background: url('../assets/checkbg.png');
    background-repeat: no-repeat;
    background-size: contain;
}

#check-box {
    width: 100%;
}

@font-face {
    font-family: 'banking';
    src: url('../assets/micrenc.ttf');
}


.banking {
    font-family: 'banking';
    font-size: 37px;
}
.dollar-line::after{
    content: "Dollars";
    font-size: 18px;
    position: absolute;
    right: -73px;
    top: 0;
}
.dollar-line {
    width: 840px;
    display: block;
    border-bottom: 1px solid black;
    margin-left: 10px;
    margin-top: 20px;
}
.payto-line {
    width: 776px;
    display: block;
    border-bottom: 1px solid black;
    margin-left: 73px;
    border-right: 1px solid black;
    height: 28px;
    margin-top: -32px;
}

/* Logo positioning classes */
.logo-container {
    position: absolute;
    z-index: 10;
}

.logo-top-left {
    top: 20px;
    left: 20px;
}

.logo-top-center {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.logo-top-right {
    top: 20px;
    right: 20px;
}

.logo-bottom-left {
    bottom: 20px;
    left: 20px;
}

.logo-bottom-center {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.logo-bottom-right {
    bottom: 20px;
    right: 20px;
}
</style>
