<template>
  <div class="check-renderer" :style="containerStyle">
    <div class="account-holder-name" :style="{ ...checkStyles.accountHolderName, position: 'absolute', ...dynamicTextPositions.accountHolderName }">
      {{ checkData.accountHolderName }}
    </div>
    <div class="account-holder-address" :style="{ ...checkStyles.accountHolderName, position: 'absolute', ...dynamicTextPositions.accountHolderAddress }">
      {{ checkData.accountHolderAddress }}<br>
      {{ checkData.accountHolderCity }}, {{ checkData.accountHolderState }} {{ checkData.accountHolderZip }}
    </div>
    <div class="check-number-human" :style="{ ...checkStyles.checkNumber, position: 'absolute', ...dynamicTextPositions.checkNumber }">
      {{ checkData.checkNumber }}
    </div>
    <div class="bank-name-top" :style="{ ...checkStyles.bankName, position: 'absolute', top: '50px', left: '0px', width: '100%', textAlign: 'center' }">
      {{ checkData.bankName }}
    </div>
    <div class="bank-address-top" :style="{ ...checkStyles.bankName, position: 'absolute', top: '70px', left: '0px', width: '100%', textAlign: 'center' }">
      {{ checkData.bankAddress || '' }}
    </div>
    <div class="date-data" :style="{ ...checkStyles.date, position: 'absolute', ...dynamicTextPositions.date }">
      {{ checkData.date }}
    </div>
    <!-- Date line -->
    <div class="date-line-container" style="position: absolute; top: 105px; left: 850px; width: 155px; height: 1px; border-bottom: 1px solid black;"></div>
    <!-- Date label - anchored bottom-right to line start -->
    <div class="date-label" :style="{ ...checkStyles.fieldLabels, position: 'absolute', bottom: '385px', right: '505px', textAlign: 'right' }">
      Date:
    </div>
    <div class="amount-box-border" style="position: absolute; top: 195px; left: 950px; width: 225px; height: 40px; border: 1px solid #c7c7c7; background-color: white;">
    </div>
    <div class="amount-dollar-sign" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '201px', left: '935px' }">
      $
    </div>
    <div class="amount-data" :style="{ ...checkStyles.amount, position: 'absolute', ...dynamicTextPositions.amount }">
      {{ checkData.amount }}
    </div>
    <div class="pay-to-data" :style="{ ...checkStyles.payTo, position: 'absolute', ...dynamicTextPositions.payTo }">
      {{ checkData.payTo }}
    </div>
    <!-- Payee Name Line - level with amount box, ending where amount words line ends -->
    <div class="payee-line-container" style="position: absolute; top: 230px; left: 150px; width: 790px; height: 1px; border-bottom: 1px solid black; border-right: 1px solid black;"></div>
    <!-- Pay to the Order of text - anchored bottom-right to line start -->
    <div class="pay-to-label" :style="{ ...checkStyles.fieldLabels, position: 'absolute', bottom: '260px', right: '1050px', textAlign: 'right' }">
      Pay to the<br>Order of:
    </div>
    <div class="amount-line-data" ref="line" :style="{ ...checkStyles.amountWords, position: 'absolute', ...dynamicTextPositions.amountWords }">
      ***
      <span v-html="checkData.amountWords"></span>
      ***
    </div>
    <div class="amount-line" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '250px', left: '60px' }">
      <span class="dollar-line"></span>
    </div>
    <!-- Hand-drawn line after amount words -->
    <svg v-if="calculatedLineLength > 0" 
         class="amount-handdrawn-line" 
         :style="{ 
             position: 'absolute', 
             top: '252px', 
             left: `${calculatedLineLength + 60 + 45}px`,
             width: `${840 - calculatedLineLength - 45}px`,
             height: '6px'
         }"
         :viewBox="`0 0 ${840 - calculatedLineLength - 45} 6`"
         preserveAspectRatio="none">
      <path :d="`M 0 3 Q ${(840 - calculatedLineLength - 45) * 0.1} 2, ${(840 - calculatedLineLength - 45) * 0.2} 3.5 T ${(840 - calculatedLineLength - 45) * 0.4} 2.8 T ${(840 - calculatedLineLength - 45) * 0.6} 3.3 T ${(840 - calculatedLineLength - 45) * 0.8} 2.5 T ${840 - calculatedLineLength - 45} 3`"
            stroke="#2b2b2b" 
            stroke-width="1.8" 
            stroke-linecap="round"
            fill="none"
            opacity="0.85"/>
    </svg>
    <div class="memo-data" :style="{ ...checkStyles.memo, position: 'absolute', ...dynamicTextPositions.memo }">
      {{ checkData.memo }}
    </div>
    <!-- Memo line -->
    <div class="memo-line-container" style="position: absolute; top: 413px; left: 115px; width: 300px; height: 1px; border-bottom: 1px solid black;"></div>
    <!-- Memo label - anchored bottom-right to line start -->
    <div class="memo-label" :style="{ ...checkStyles.fieldLabels, position: 'absolute', bottom: '77px', right: '1085px', textAlign: 'right' }">
      Memo:
    </div>
    <div class="signature-data" :style="{ ...checkStyles.signature, position: 'absolute', ...dynamicTextPositions.signature }">
      {{ checkData.signature }}
    </div>
    <!-- Signature line -->
    <div class="signature-line-container" style="position: absolute; top: 413px; left: 750px; width: 360px; height: 1px; border-bottom: 1px solid black;"></div>
    <div class="signature-label" :style="{ ...checkStyles.fieldLabels, position: 'absolute', top: '418px', left: '750px', width: '360px', textAlign: 'center' }">
      Authorized Signature
    </div>
    <div class="banking" :style="{ ...checkStyles.bankInfo, position: 'absolute', ...dynamicTextPositions.bankInfo, width: '100%', textAlign: 'center' }">
      <div class="routing" style="display: inline;">
        a{{ checkData.routingNumber }}a
      </div>
      <div class="bank-account" style="display: inline;">{{ checkData.bankAccountNumber }}c</div>
      <div class="check-number" style="display: inline; margin-left:20px">{{ checkData.checkNumber }}</div>
    </div>

    <!-- Logo Section -->
    <div v-if="hasCustomLogo && logoImageSrc" 
         class="logo-container" 
         :class="`logo-${settings?.logo?.position || 'top-left'}`"
         :style="{ 
           width: `${settings?.logo?.size?.width || 100}px`,
           height: `${settings?.logo?.size?.height || 50}px`,
           opacity: settings?.logo?.opacity || 1,
           marginTop: `${settings?.logo?.margin?.top || 0}px`,
           marginRight: `${settings?.logo?.margin?.right || 0}px`,
           marginBottom: `${settings?.logo?.margin?.bottom || 0}px`,
           marginLeft: `${settings?.logo?.margin?.left || 0}px`
         }">
      <img :src="logoImageSrc" 
           alt="Logo"
           :style="{
             width: '100%',
             height: '100%',
             objectFit: settings?.logo?.objectFit || 'contain',
             objectPosition: settings?.logo?.objectPosition || 'center'
           }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { CustomizationSettings } from '@/types'

interface CheckData {
  accountHolderName: string
  accountHolderAddress: string
  accountHolderCity: string
  accountHolderState: string
  accountHolderZip: string
  checkNumber: string
  bankName: string
  bankAddress?: string
  date: string
  amount: string
  payTo: string
  amountWords: string
  memo: string
  signature: string
  routingNumber: string
  bankAccountNumber: string
  lineLength?: number
}

interface Props {
  settings: CustomizationSettings
  checkData: CheckData
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 1
})

const line = ref<HTMLElement | null>(null)
const calculatedLineLength = ref<number>(props.checkData.lineLength || 0)

// Dynamically calculate line length from rendered text
watch(() => props.checkData, async () => {
  await nextTick(() => {
    if (line.value) {
      calculatedLineLength.value = line.value.clientWidth
    }
  })
}, { immediate: true, deep: true })

const hasCustomLogo = computed(() => {
  const logo = props.settings?.logo
  return logo?.enabled && (logo?.file?.url || logo?.url)
})

const logoImageSrc = computed(() => {
  const logo = props.settings?.logo
  return logo?.file?.url || logo?.url || ''
})

const containerStyle = computed(() => {
  const colors = props.settings.colors
  
  return {
    width: '1200px',
    height: '490px',
    backgroundColor: colors?.background || '#ffffff',
    backgroundImage: 'url(/src/assets/checkbg.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1200px 490px',
    position: 'relative',
    fontFamily: 'Arial, sans-serif',
    transform: `scale(${props.scale})`,
    transformOrigin: 'top left'
  }
})

const dynamicTextPositions = computed(() => {
  const logo = props.settings?.logo
  if (!hasCustomLogo.value || !logo) {
    // Return default positions when no logo
    return {
      accountHolderName: { top: '40px', left: '60px' },
      accountHolderAddress: { top: '70px', left: '60px' },
      checkNumber: { top: '40px', right: '50px' },
      date: { top: '90px', left: '850px' },
      payTo: { top: '200px', left: '180px' },
      amount: { top: '202px', left: '970px' },
      amountWords: { top: '240px', left: '100px' },
      bankName: { top: '300px', left: '60px' },
      memo: { top: '390px', left: '130px' },
      signature: { top: '366px', left: '770px' },
      bankInfo: { top: '435px', left: '0px' }
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
    checkNumber: { top: '40px', right: '50px' },
    date: { bottom: '385px', left: '850px' },       // Anchored bottom-left to date line at 105px
    payTo: { bottom: '260px', left: '150px' },      // Anchored bottom-left to payee line at 230px
    amount: { top: '202px', left: '970px' },
    amountWords: { top: '240px', left: '100px' },
    bankName: { top: '300px', left: '60px' },
    memo: { bottom: '77px', left: '115px' },        // Anchored bottom-left to memo line at 413px
    signature: { bottom: '77px', left: '750px' },   // Anchored bottom-left to signature line at 413px
    bankInfo: { top: '435px', left: '0px' }
  }

  // Adjust positions based on logo placement
  if (logoPosition === 'top-left') {
    if (bounds.right > 60) {
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
  }

  if (logoPosition === 'top-center') {
    if (bounds.left < 300) {
      positions.accountHolderName.left = `${bounds.right + 15}px`
      positions.accountHolderAddress.left = `${bounds.right + 15}px`
    }
    if (bounds.right > 800) {
      positions.checkNumber.left = `${Math.max(bounds.left - 100, 600)}px`
      positions.date.left = `${Math.max(bounds.left - 100, 600)}px`
    }
  }

  if (logoPosition === 'top-right') {
    if (bounds.left < 1000) {
      positions.checkNumber.left = `${Math.max(bounds.left - 100, 700)}px`
      positions.date.left = `${Math.max(bounds.left - 150, 700)}px`
    }
  }

  return positions
})

const checkStyles = computed(() => {
  if (!props.settings || !props.settings.fonts) return {}
  
  const fonts = props.settings.fonts
  
  // Helper function to safely get font styles with fallbacks
  const getFontStyle = (fontConfig: any, fallback = { family: 'Arial, sans-serif', size: 16, weight: 'normal', color: '#000000' }) => {
    // Apply adjustments if present
    const adjustment = props.settings.adjustments?.[Object.keys(fonts).find(key => fonts[key] === fontConfig)]
    const style: any = {
      fontFamily: fontConfig?.family || fallback.family,
      fontSize: `${fontConfig?.size || fallback.size}px`,
      fontWeight: fontConfig?.weight || fallback.weight,
      color: fontConfig?.color || fallback.color
    }
    
    if (adjustment) {
      style.transform = `translate(${adjustment.x}px, ${adjustment.y}px)`
    }
    
    return style
  }
  
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
    bankName: getFontStyle(fonts.bankName, { family: 'Open Sans, sans-serif', size: 24, weight: 'bold', color: '#000000' }),
    fieldLabels: getFontStyle(fonts.fieldLabels, { family: 'Arial, sans-serif', size: 14, weight: 'normal', color: '#000000' })
  }
})
</script>

<style scoped>
.check-renderer {
  display: inline-block;
}

.logo-container {
  position: absolute;
  z-index: 1;
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
