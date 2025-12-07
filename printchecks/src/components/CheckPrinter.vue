<template>
    <div class="wrapper" id="wrapper" style="position: relative;">
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
                       opacity: currentSettings?.logo?.opacity || 1
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
        
        <!-- Line Items Section -->
        <div v-if="hasLineItems" class="line-items-section" style="position: absolute; top: 480px; left: 60px; right: 60px;">
            <h5 style="margin-bottom: 15px; color: #333;">📋 Payment Details</h5>
            <div class="line-items-table" style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                <table style="width: 100%; font-size: 12px;">
                    <thead>
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <th style="text-align: left; padding: 8px;">Description</th>
                            <th style="text-align: center; padding: 8px;">Qty</th>
                            <th style="text-align: right; padding: 8px;">Rate</th>
                            <th style="text-align: right; padding: 8px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in lineItems" :key="item.id" style="border-bottom: 1px solid #eee;">
                            <td style="padding: 6px 8px;">{{ item.description }}</td>
                            <td style="text-align: center; padding: 6px 8px;">{{ item.quantity }}</td>
                            <td style="text-align: right; padding: 6px 8px;">${{ item.rate.toFixed(2) }}</td>
                            <td style="text-align: right; padding: 6px 8px;">${{ (item.quantity * item.rate).toFixed(2) }}</td>
                        </tr>
                    </tbody>
                    <tfoot v-if="calculatedTotals">
                        <tr style="border-top: 2px solid #333; font-weight: bold;">
                            <td colspan="3" style="text-align: right; padding: 8px;">Subtotal:</td>
                            <td style="text-align: right; padding: 8px;">${{ calculatedTotals.subtotal.toFixed(2) }}</td>
                        </tr>
                        <tr v-if="calculatedTotals.taxAmount > 0">
                            <td colspan="3" style="text-align: right; padding: 4px 8px;">Tax:</td>
                            <td style="text-align: right; padding: 4px 8px;">${{ calculatedTotals.taxAmount.toFixed(2) }}</td>
                        </tr>
                        <tr v-if="calculatedTotals.shippingAmount > 0">
                            <td colspan="3" style="text-align: right; padding: 4px 8px;">Shipping:</td>
                            <td style="text-align: right; padding: 4px 8px;">${{ calculatedTotals.shippingAmount.toFixed(2) }}</td>
                        </tr>
                        <tr style="border-top: 1px solid #333; font-weight: bold; font-size: 14px;">
                            <td colspan="3" style="text-align: right; padding: 8px;">Total:</td>
                            <td style="text-align: right; padding: 8px;">${{ calculatedTotals.total.toFixed(2) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- Payment Statistics Section -->
        <div class="payment-stats" style="position: absolute; top: 450px; right: 60px; width: 300px;">
            <div class="stats-card" style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                <h6 style="margin: 0 0 10px 0; color: #1976d2;">💰 Payment Summary</h6>
                <div style="font-size: 12px; line-height: 1.4;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>This Year ({{ new Date().getFullYear() }}):</span>
                        <strong>${{ paymentStats.thisYear.toFixed(2) }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>All Time Total:</span>
                        <strong>${{ paymentStats.allTime.toFixed(2) }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Payments This Year:</span>
                        <strong>{{ paymentStats.thisYearCount }}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Total Payments:</span>
                        <strong>{{ paymentStats.count }}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="check-data" style="position: absolute; top: 450px">
            <div class="alert alert-primary" role="alert"><strong>Background does not print.</strong></div>
            <button type="button" style="float: right;" class="btn btn-primary" @click="printCheck">Print (Ctrl + P)</button>
            <form class="row g-3">
                <div class="col-md-6">
                    <label for="inputEmail4" class="form-label">Account Holder Name</label>
                    <input type="email" class="form-control" id="inputEmail4" v-model="check.accountHolderName">
                </div>
                <div class="col-md-6">
                </div>
                <div class="col-md-4">
                    <label for="inputAddress" class="form-label">Address</label>
                    <input type="text" class="form-control" id="inputAddress" v-model="check.accountHolderAddress">
                </div>
                <div class="col-md-2">
                    <label for="inputCity" class="form-label">City</label>
                    <input type="text" class="form-control" v-model="check.accountHolderCity">
                </div>
                <div class="col-md-2">
                    <label for="inputState" class="form-label">State</label>
                    <input type="text" class="form-control" v-model="check.accountHolderState">
                </div>
                <div class="col-md-2">
                    <label for="inputZip" class="form-label">Zip</label>
                    <input type="text" class="form-control" v-model="check.accountHolderZip">
                </div>
            </form>
            <form class="row g-3" style="margin-top: 30px; border-top: 1px solid #e7e7e7;">
                <div class="col-md-2">
                    <label for="inputEmail4" class="form-label">Check Number</label>
                    <input type="email" class="form-control" id="inputEmail4" v-model="check.checkNumber">
                </div>
                <div class="col-md-4">
                    <label for="inputAddress" class="form-label">Bank Name</label>
                    <input type="text" class="form-control" id="inputAddress" v-model="check.bankName">
                </div>
                <div class="col-md-2">
                    <label for="inputCity" class="form-label">Routing #</label>
                    <input type="text" class="form-control" v-model="check.routingNumber">
                </div>
                <div class="col-md-2">
                    <label for="inputState" class="form-label">Account #</label>
                    <input type="text" class="form-control" v-model="check.bankAccountNumber">
                </div>
                <div class="col-md-6">
                    <label for="inputZip" class="form-label">Memo</label>
                    <input type="text" class="form-control" v-model="check.memo">
                </div>
            </form>
            <form class="row g-3" style="margin-top: 30px; border-top: 1px solid #e7e7e7;">
                <div class="col-md-2">
                    <label for="inputEmail4" class="form-label">Amount</label>
                    <input type="email" class="form-control" id="inputEmail4" v-model="check.amount">
                </div>
                <div class="col-md-6">
                    <label for="inputZip" class="form-label">Pay To</label>
                    <input type="text" class="form-control" v-model="check.payTo">
                </div>
                <div class="col-md-2">
                    <label for="inputEmail4" class="form-label">Date</label>
                    <input type="email" class="form-control" id="inputEmail4" v-model="check.date">
                </div>
                <div class="col-md-6">
                    <label for="inputZip" class="form-label">Signature</label>
                    <input type="text" class="form-control" v-model="check.signature">
                </div>
            </form>
            <div class="col-12" style="margin-top: 30px;">
                <button type="button" class="btn btn-primary" @click="saveToHistory">Save to History</button>
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
  
  // Calculate logo boundaries
  const logoBounds = {
    'top-left': { 
      left: 20, 
      right: 20 + logoWidth, 
      top: 20, 
      bottom: 20 + logoHeight 
    },
    'top-center': { 
      left: (1200 - logoWidth) / 2, 
      right: (1200 + logoWidth) / 2, 
      top: 20, 
      bottom: 20 + logoHeight 
    },
    'top-right': { 
      left: 1200 - 20 - logoWidth, 
      right: 1200 - 20, 
      top: 20, 
      bottom: 20 + logoHeight 
    },
    'bottom-left': { 
      left: 20, 
      right: 20 + logoWidth, 
      top: 450 - logoHeight - 20, 
      bottom: 450 - 20 
    },
    'bottom-center': { 
      left: (1200 - logoWidth) / 2, 
      right: (1200 + logoWidth) / 2, 
      top: 450 - logoHeight - 20, 
      bottom: 450 - 20 
    },
    'bottom-right': { 
      left: 1200 - 20 - logoWidth, 
      right: 1200 - 20, 
      top: 450 - logoHeight - 20, 
      bottom: 450 - 20 
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

  // Adjust positions based on logo placement - prefer horizontal movement to keep on same row
  if (logoPosition === 'top-left') {
    // For top-left logo, move account holder info right if logo overlaps horizontally
    if (bounds.right > 60) {
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
    // Only move down if logo is very tall and would overlap vertically
    if (bounds.bottom > 70) {
      positions.accountHolderAddress.top = `${bounds.bottom + 5}px`
    }
  }

  if (logoPosition === 'top-center') {
    // For top-center, check if it overlaps with account holder or check number areas
    if (bounds.left < 300) {
      // Logo extends into left area, move account holder right
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
    if (bounds.right > 800) {
      // Logo extends into right area, move check number left
      positions.checkNumber.left = `${bounds.left - 100}px`
      positions.date.left = `${bounds.left - 100}px`
    }
  }

  if (logoPosition === 'top-right') {
    // For top-right logo, move check number and date left if logo overlaps
    if (bounds.left < 1060) {
      positions.checkNumber.left = `${Math.max(bounds.left - 100, 700)}px`
    }
    if (bounds.left < 950) {
      positions.date.left = `${Math.max(bounds.left - 100, 700)}px`
    }
  }

  if (logoPosition.includes('bottom')) {
    // For bottom logos, move elements up only if necessary, prefer horizontal movement
    if (logoPosition === 'bottom-left') {
      if (bounds.right > 80 && bounds.top < 420) {
        positions.bankInfo.left = `${bounds.right + 15}px`
      }
      if (bounds.right > 120 && bounds.top < 367) {
        positions.memo.left = `${bounds.right + 15}px`
      }
    }
    
    if (logoPosition === 'bottom-right') {
      if (bounds.left < 770 && bounds.top < 366) {
        positions.signature.left = `${Math.max(bounds.left - 200, 500)}px`
      }
    }
    
    // Only move up if logo is very tall
    if (bounds.top < 350) {
      positions.memo.top = `${bounds.top - 20}px`
      positions.signature.top = `${bounds.top - 20}px`
    }
    if (bounds.top < 320) {
      positions.bankName.top = `${bounds.top - 30}px`
    }
    if (bounds.top < 400) {
      positions.bankInfo.top = `${bounds.top - 20}px`
    }
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
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          margin: 0;
        }
        body {
          transform: scale(1);
          transform-origin: top center;
          width: 149%;
          margin: 0;
          padding: 0;
        }
        .wrapper > *:not(.check-box) {
          display: none !important;
        }
        .check-data {
            display: none;
        }
        .check-box {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0px;
          background-color: white;
          background: white !important;
          border: none !important;
          box-shadow: none !important;
        }
        .check-box-print {
          position: relative;
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
    height: 1553px;
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
