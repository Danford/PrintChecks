<template>
  <div class="check-template-preview" :style="containerStyle">
    <div class="check-preview" :style="checkStyle">
      <!-- Account Holder Info -->
      <div class="account-holder-name" :style="getElementStyle('accountHolder', { top: '40px', left: '60px' })">
        John Doe
      </div>
      <div class="account-holder-address" :style="getElementStyle('accountHolder', { top: '70px', left: '60px' })">
        123 Main Street<br>
        Anytown, ST 12345
      </div>
      
      <!-- Check Number -->
      <div class="check-number-human" :style="getElementStyle('checkNumber', { top: '40px', right: '50px' })">
        1001
      </div>
      
      <!-- Bank Name (centered top) -->
      <div class="bank-name-top" :style="getElementStyle('bankName', { top: '50px', left: '0px', width: '100%', textAlign: 'center' })">
        Sample Bank
      </div>
      <div class="bank-address-top" :style="getElementStyle('bankName', { top: '70px', left: '0px', width: '100%', textAlign: 'center', fontSize: '12px' })">
        456 Bank Ave, City, ST 12345
      </div>
      
      <!-- Date -->
      <div class="date-data" :style="getElementStyle('date', { top: '90px', left: '850px' })">
        12/10/2025
      </div>
      <div class="date-label" :style="getElementStyle('fieldLabels', { top: '90px', left: '780px' })">
        Date: _____________________
      </div>
      
      <!-- Pay To -->
      <div class="pay-to-label" :style="getElementStyle('fieldLabels', { top: '170px', left: '60px' })">
        Pay to the <br>Order of:
      </div>
      <div class="pay-to-data" :style="getElementStyle('payTo', { top: '200px', left: '180px' })">
        Sample Payee
      </div>
      
      <!-- Amount Box -->
      <div class="amount-box-border" :style="{ position: 'absolute', top: '195px', left: '950px', width: '225px', height: '40px', border: '1px solid #c7c7c7', background: 'white' }"></div>
      <div class="amount-dollar-sign" :style="getElementStyle('fieldLabels', { top: '201px', left: '935px' })">
        $
      </div>
      <div class="amount-data" :style="getElementStyle('amount', { top: '202px', left: '970px' })">
        100.00
      </div>
      
      <!-- Amount in Words -->
      <div class="amount-line-data" :style="getElementStyle('amountWords', { top: '240px', left: '100px' })">
        *** One Hundred and 00/100 Dollars ***
      </div>
      <div class="amount-line-label" :style="getElementStyle('fieldLabels', { top: '250px', left: '60px' })">
        <span style="border-bottom: 1px solid #999; display: inline-block; width: 750px;"></span>
      </div>
      
      <!-- Memo -->
      <div class="memo-label" :style="getElementStyle('fieldLabels', { top: '390px', left: '60px' })">
        Memo: ____________________________________
      </div>
      <div class="memo-data" :style="getElementStyle('memo', { top: '390px', left: '130px' })">
        Sample memo
      </div>
      
      <!-- Signature -->
      <div class="signature-label" :style="getElementStyle('fieldLabels', { top: '390px', left: '750px' })">
        _______________________________
      </div>
      <div class="signature-data" :style="getElementStyle('signature', { top: '366px', left: '770px' })">
        John Doe
      </div>
      <div class="signature-auth-label" :style="getElementStyle('fieldLabels', { top: '410px', left: '780px', width: '300px', textAlign: 'center' })">
        Authorized Signature
      </div>
      
      <!-- Bank Info (MICR line) -->
      <div class="banking" :style="getElementStyle('bankInfo', { top: '435px', left: '0px', width: '100%', textAlign: 'center' })">
        a123456789a 000111222333c 1001
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomizationSettings, FontSettings, PositionAdjustment } from '@/types'

interface Props {
  settings: CustomizationSettings
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 0.15
})

const containerStyle = computed(() => ({
  width: `${1200 * props.scale}px`,
  height: `${450 * props.scale}px`,
  display: 'inline-block',
  position: 'relative'
}))

const checkStyle = computed(() => {
  const colors = props.settings.colors
  const layout = props.settings.layout
  
  return {
    width: '1200px',
    height: '450px',
    backgroundColor: colors?.background || '#ffffff',
    border: layout?.showBorders ? `${layout.borderWidth}px ${layout.borderStyle} ${colors?.border || '#cccccc'}` : 'none',
    position: 'relative',
    fontFamily: 'Arial, sans-serif',
    transform: `scale(${props.scale})`,
    transformOrigin: 'top left'
  }
})

function getElementStyle(key: keyof CustomizationSettings['fonts'], defaultPosition: Record<string, string> = {}) {
  const font = props.settings.fonts?.[key] as FontSettings | undefined
  const adjustment = props.settings.adjustments?.[key] as PositionAdjustment | undefined
  
  // Default font styles based on key
  const defaultFonts: Record<string, Partial<FontSettings>> = {
    signature: { family: 'Caveat, cursive', size: 40, weight: 'normal', color: '#000000' },
    bankInfo: { family: 'banking, monospace', size: 37, weight: 'normal', color: '#000000' },
    bankName: { family: 'Open Sans, sans-serif', size: 24, weight: 'bold', color: '#000000' },
    fieldLabels: { family: 'Arial, sans-serif', size: 14, weight: 'normal', color: '#000000' }
  }
  
  const defaults = defaultFonts[key] || { family: 'Arial, sans-serif', size: 16, weight: 'normal', color: '#000000' }
  
  const baseStyle: Record<string, string> = {
    fontFamily: font?.family || defaults.family || 'Arial, sans-serif',
    fontSize: `${font?.size || defaults.size || 16}px`,
    fontWeight: font?.weight || defaults.weight || 'normal',
    fontStyle: font?.style || 'normal',
    color: font?.color || defaults.color || '#000000',
    position: 'absolute',
    ...defaultPosition
  }
  
  // Apply position adjustments if present
  if (adjustment) {
    const currentTransform = baseStyle.transform || ''
    baseStyle.transform = `${currentTransform} translate(${adjustment.x}px, ${adjustment.y}px)`.trim()
  }
  
  return baseStyle
}
</script>

<style scoped>
.check-template-preview {
  display: inline-block;
  position: relative;
}

.check-preview {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
</style>
