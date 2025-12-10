<template>
  <div class="check-template-preview" :style="containerStyle">
    <div class="check-preview" :style="checkStyle">
      <!-- Account Holder Info -->
      <div class="check-element account-holder" :style="getElementStyle('accountHolder')">
        {{ settings.name || 'John Doe' }}
      </div>
      
      <!-- Date -->
      <div class="check-element date" :style="getElementStyle('date')">
        12/10/2025
      </div>
      
      <!-- Check Number -->
      <div class="check-element check-number" :style="getElementStyle('checkNumber')">
        #1001
      </div>
      
      <!-- Pay To -->
      <div class="check-element pay-to-label" :style="getElementStyle('fieldLabels')">
        Pay to the order of
      </div>
      <div class="check-element pay-to" :style="getElementStyle('payTo')">
        Sample Payee
      </div>
      
      <!-- Amount -->
      <div class="check-element amount" :style="getElementStyle('amount')">
        $100.00
      </div>
      
      <!-- Amount in Words -->
      <div class="check-element amount-words" :style="getElementStyle('amountWords')">
        One Hundred and 00/100 Dollars
      </div>
      
      <!-- Bank Name -->
      <div class="check-element bank-name" :style="getElementStyle('bankName')">
        Sample Bank
      </div>
      
      <!-- Memo -->
      <div class="check-element memo-label" :style="getElementStyle('fieldLabels')">
        Memo:
      </div>
      <div class="check-element memo" :style="getElementStyle('memo')">
        Sample memo
      </div>
      
      <!-- Signature -->
      <div class="check-element signature" :style="getElementStyle('signature')">
        ________________
      </div>
      
      <!-- Bank Info (MICR line) -->
      <div class="check-element bank-info" :style="getElementStyle('bankInfo')">
        ⑈123456789⑈ 000111222333 1001
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
  width: `${100 / props.scale}%`,
  height: `${100 / props.scale}%`,
  transform: `scale(${props.scale})`,
  transformOrigin: 'top left',
  overflow: 'hidden'
}))

const checkStyle = computed(() => {
  const colors = props.settings.colors
  const layout = props.settings.layout
  
  return {
    width: '800px',
    height: '350px',
    backgroundColor: colors?.background || '#ffffff',
    border: layout?.showBorders ? `${layout.borderWidth}px ${layout.borderStyle} ${colors?.border || '#cccccc'}` : 'none',
    position: 'relative',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  }
})

function getElementStyle(key: keyof CustomizationSettings['fonts']) {
  const font = props.settings.fonts?.[key] as FontSettings | undefined
  const adjustment = props.settings.adjustments?.[key] as PositionAdjustment | undefined
  
  if (!font) return {}
  
  const baseStyle: Record<string, string> = {
    fontFamily: font.family || 'Arial, sans-serif',
    fontSize: `${font.size || 14}px`,
    fontWeight: font.weight || 'normal',
    fontStyle: font.style || 'normal',
    color: font.color || '#000000',
    position: 'absolute'
  }
  
  // Apply position adjustments if present
  if (adjustment) {
    baseStyle.transform = `translate(${adjustment.x}px, ${adjustment.y}px)`
  }
  
  // Position elements based on their role
  switch (key) {
    case 'accountHolder':
      baseStyle.top = '20px'
      baseStyle.left = '20px'
      break
    case 'date':
      baseStyle.top = '20px'
      baseStyle.right = '100px'
      break
    case 'checkNumber':
      baseStyle.top = '20px'
      baseStyle.right = '20px'
      break
    case 'payTo':
      baseStyle.top = '80px'
      baseStyle.left = '20px'
      baseStyle.maxWidth = '400px'
      break
    case 'amount':
      baseStyle.top = '75px'
      baseStyle.right = '20px'
      break
    case 'amountWords':
      baseStyle.top = '120px'
      baseStyle.left = '20px'
      baseStyle.maxWidth = '600px'
      break
    case 'bankName':
      baseStyle.top = '160px'
      baseStyle.left = '20px'
      break
    case 'memo':
      baseStyle.top = '200px'
      baseStyle.left = '70px'
      break
    case 'signature':
      baseStyle.top = '200px'
      baseStyle.right = '20px'
      break
    case 'bankInfo':
      baseStyle.bottom = '10px'
      baseStyle.left = '20px'
      baseStyle.fontSize = '10px'
      break
    case 'fieldLabels':
      baseStyle.top = '60px'
      baseStyle.left = '20px'
      baseStyle.fontSize = '10px'
      break
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

.check-element {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.memo-label {
  top: 200px;
  left: 20px;
  font-size: 10px;
  position: absolute;
}

.pay-to-label {
  top: 60px;
  left: 20px;
  font-size: 10px;
  position: absolute;
}
</style>

