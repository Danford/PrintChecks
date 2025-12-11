<template>
  <div class="check-template-preview" :style="containerStyle">
    <CheckRenderer :settings="settings" :checkData="sampleCheckData" :scale="scale" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomizationSettings } from '@/types'
import CheckRenderer from '@/components/CheckRenderer.vue'

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

const sampleCheckData = computed(() => ({
  accountHolderName: 'John Doe',
  accountHolderAddress: '123 Main Street',
  accountHolderCity: 'Anytown',
  accountHolderState: 'ST',
  accountHolderZip: '12345',
  checkNumber: '1001',
  bankName: 'Sample Bank',
  bankAddress: '456 Bank Ave, City, ST 12345',
  date: '12/10/2025',
  amount: '100.00',
  payTo: 'Sample Payee',
  amountWords: 'One Hundred and <sup style="font-size: 0.7em;">00</sup>&frasl;<sub style="font-size: 0.7em;">100</sub>',
  memo: 'Sample memo',
  signature: 'John Doe',
  routingNumber: '123456789',
  bankAccountNumber: '000111222333',
  lineLength: 250  // Adjusted to better match actual rendered width
}))
</script>

<style scoped>
.check-template-preview {
  display: inline-block;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
</style>
