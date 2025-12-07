<template>
  <div class="customization-panel">
    <div class="panel-header">
      <h3>🎨 Customization</h3>
      <p>Personalize your checks with custom fonts, colors, and layouts</p>
    </div>
    
    <div class="panel-content">
      <!-- Preset Selection -->
      <div class="section">
        <h4>Quick Presets</h4>
        <div class="preset-grid">
          <div 
            v-for="preset in presets" 
            :key="preset.id"
            class="preset-card"
            :class="{ active: currentPreset?.id === preset.id }"
            @click="applyPreset(preset)"
          >
            <div class="preset-preview">
              <div class="preview-text" :style="getPresetPreviewStyle(preset)">
                Sample Check
              </div>
            </div>
            <div class="preset-info">
              <h5>{{ preset.name }}</h5>
              <p>{{ preset.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Font Customization -->
      <div class="section">
        <h4>Fonts</h4>
        <div class="font-controls">
          <div class="font-element" v-for="(fontKey, index) in fontElements" :key="fontKey">
            <label>{{ formatFontLabel(fontKey) }}</label>
            <div class="font-row">
              <select 
                :value="currentSettings?.fonts[fontKey]?.family || ''"
                @change="updateFont(fontKey, 'family', $event.target.value)"
                class="font-family-select"
              >
                <option v-for="font in availableFonts" :key="font.name" :value="font.name">
                  {{ font.displayName }}
                </option>
              </select>
              
              <input 
                type="number" 
                :value="currentSettings?.fonts[fontKey]?.size || 16"
                @input="updateFont(fontKey, 'size', parseInt($event.target.value))"
                min="8" 
                max="72" 
                class="font-size-input"
              />
              
              <input 
                type="color" 
                :value="currentSettings?.fonts[fontKey]?.color || '#000000'"
                @input="updateFont(fontKey, 'color', $event.target.value)"
                class="color-input"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Color Scheme -->
      <div class="section">
        <h4>Colors</h4>
        <div class="color-grid">
          <div v-for="(colorKey, index) in colorKeys" :key="colorKey" class="color-control">
            <label>{{ formatColorLabel(colorKey) }}</label>
            <input 
              type="color" 
              :value="currentSettings?.colors[colorKey] || '#000000'"
              @input="updateColor(colorKey, $event.target.value)"
              class="color-input large"
            />
          </div>
        </div>
      </div>
      
      <!-- Logo Settings -->
      <div class="section">
        <h4>Logo</h4>
        <div class="logo-controls">
          <div class="checkbox-row">
            <input 
              type="checkbox" 
              id="enable-logo"
              :checked="currentSettings?.logo.enabled || false"
              @change="updateLogo('enabled', $event.target.checked)"
            />
            <label for="enable-logo">Enable Logo</label>
          </div>
          
          <div v-if="currentSettings?.logo.enabled" class="logo-settings">
            <div class="file-upload">
              <input 
                type="file" 
                id="logo-upload"
                accept="image/*"
                @change="handleLogoUpload"
                class="file-input"
              />
              <label for="logo-upload" class="file-label">
                📁 Choose Logo File
              </label>
            </div>
            
            <div class="logo-position">
              <label>Position</label>
              <select 
                :value="currentSettings?.logo.position || 'top-left'"
                @change="updateLogo('position', $event.target.value)"
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            
            <div class="logo-size">
              <label>Size</label>
              <div class="size-inputs">
                <input 
                  type="number" 
                  :value="currentSettings?.logo.size.width || 100"
                  @input="updateLogoSize('width', parseInt($event.target.value))"
                  placeholder="Width"
                  min="10"
                  max="500"
                />
                <span>×</span>
                <input 
                  type="number" 
                  :value="currentSettings?.logo.size.height || 50"
                  @input="updateLogoSize('height', parseInt($event.target.value))"
                  placeholder="Height"
                  min="10"
                  max="500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="section actions">
        <button @click="resetToDefault" class="btn btn-secondary">
          🔄 Reset to Default
        </button>
        <button @click="saveAsPreset" class="btn btn-primary">
          💾 Save as Preset
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCustomizationStore } from '@/stores/customization'
import type { CustomizationPreset, FontSettings } from '@/types'

const customizationStore = useCustomizationStore()

// Computed properties
const currentSettings = computed(() => customizationStore.currentSettings)
const presets = computed(() => customizationStore.presets)
const currentPreset = computed(() => customizationStore.currentPreset)
const availableFonts = computed(() => customizationStore.availableFonts)

// Font elements that can be customized
const fontElements = [
  'accountHolder', 'payTo', 'amount', 'amountWords', 
  'memo', 'signature', 'bankInfo', 'checkNumber', 'date'
] as const

// Color keys that can be customized
const colorKeys = [
  'primary', 'secondary', 'accent', 'background', 
  'text', 'border'
] as const

// Methods
function formatFontLabel(key: string): string {
  const labels: Record<string, string> = {
    accountHolder: 'Account Holder',
    payTo: 'Pay To',
    amount: 'Amount',
    amountWords: 'Amount (Words)',
    memo: 'Memo',
    signature: 'Signature',
    bankInfo: 'Bank Info',
    checkNumber: 'Check Number',
    date: 'Date'
  }
  return labels[key] || key
}

function formatColorLabel(key: string): string {
  const labels: Record<string, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    accent: 'Accent',
    background: 'Background',
    text: 'Text',
    border: 'Border'
  }
  return labels[key] || key
}

function updateFont(element: keyof typeof currentSettings.value.fonts, property: keyof FontSettings, value: any) {
  customizationStore.updateFont(element, { [property]: value })
}

function updateColor(colorKey: keyof typeof currentSettings.value.colors, value: string) {
  customizationStore.updateColors({ [colorKey]: value })
}

function updateLogo(property: string, value: any) {
  customizationStore.updateLogo({ [property]: value })
}

function updateLogoSize(dimension: 'width' | 'height', value: number) {
  if (!currentSettings.value) return
  
  const newSize = { ...currentSettings.value.logo.size }
  newSize[dimension] = value
  customizationStore.updateLogo({ size: newSize })
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      customizationStore.updateLogo({
        file: {
          file,
          url,
          name: file.name,
          size: file.size,
          type: file.type
        }
      })
    }
    reader.readAsDataURL(file)
  }
}

function getPresetPreviewStyle(preset: CustomizationPreset) {
  return {
    fontFamily: preset.settings.fonts.accountHolder.family,
    fontSize: '14px',
    color: preset.settings.colors.primary,
    backgroundColor: preset.settings.colors.background
  }
}

function applyPreset(preset: CustomizationPreset) {
  customizationStore.applyPreset(preset)
}

function resetToDefault() {
  if (confirm('Reset all customization to default settings?')) {
    customizationStore.resetToDefault()
  }
}

function saveAsPreset() {
  const name = prompt('Enter a name for this preset:')
  if (name) {
    customizationStore.saveAsPreset(name, 'Custom preset')
  }
}

// Initialize on mount
onMounted(() => {
  customizationStore.initializeCustomization()
})
</script>

<style scoped>
.customization-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.panel-header {
  text-align: center;
  margin-bottom: 30px;
}

.panel-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.panel-header p {
  margin: 0;
  color: #666;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.section h4 {
  margin: 0 0 15px 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.preset-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.preset-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.preset-card.active {
  border-color: #007bff;
  background: #f0f8ff;
}

.preset-preview {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.preview-text {
  padding: 5px 10px;
  border-radius: 3px;
}

.preset-info h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.preset-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.font-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.font-element {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.font-element label {
  font-weight: bold;
  color: #555;
}

.font-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.font-family-select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.font-size-input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.color-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-input.large {
  width: 60px;
  height: 60px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.color-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.color-control label {
  font-size: 12px;
  font-weight: bold;
  color: #555;
}

.logo-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.file-input {
  display: none;
}

.file-label {
  display: inline-block;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.file-label:hover {
  background: #0056b3;
}

.logo-position select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-inputs input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
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
</style>
