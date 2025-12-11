<template>
  <div class="customization-panel">
    <div class="panel-header">
      <h3>🎨 Customization</h3>
      <p>Personalize your checks with custom fonts, colors, and layouts</p>
    </div>
    
    <div class="panel-content">
      <!-- Template Selection -->
      <div class="section collapsible-section" :class="{ collapsed: !sectionsExpanded.templates }">
        <div class="section-header" @click="toggleSection('templates')">
          <h4>
            <span class="collapse-icon">{{ sectionsExpanded.templates ? '▼' : '▶' }}</span>
            📋 Check Templates
          </h4>
        </div>
        <div v-show="sectionsExpanded.templates" class="section-content">
        <div class="preset-grid">
          <div 
            v-for="preset in presets" 
            :key="preset.id"
            class="preset-card"
            :class="{ 
              active: currentPreset?.id === preset.id,
              'is-builtin': preset.isBuiltIn,
              'is-editing': !preset.isBuiltIn && currentPreset?.id === preset.id
            }"
            @click="applyPreset(preset)"
          >
            <div class="preset-status-badge" v-if="currentPreset?.id === preset.id">
              <span class="badge-text">{{ preset.isBuiltIn ? '✓ Active (Read-Only)' : '✓ Editing' }}</span>
            </div>
            <div class="preset-preview-container">
              <CheckTemplatePreview 
                :settings="currentPreset?.id === preset.id && currentSettings ? currentSettings : preset.settings" 
                :scale="0.2" 
              />
            </div>
            <div class="preset-info">
              <h5>{{ preset.name }}</h5>
              <p>{{ preset.description }}</p>
            </div>
            <div v-if="!preset.isBuiltIn" class="preset-actions">
              <button 
                class="action-btn rename-btn" 
                @click.stop="openRenameDialog(preset)"
                title="Rename Template"
              >
                ✏️
              </button>
              <button 
                class="action-btn delete-btn" 
                @click.stop="confirmDeletePreset(preset)"
                title="Delete Template"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <!-- Larger Preview of Selected Template -->
        <div v-if="currentPreset" class="selected-template-preview">
          <h5>📋 {{ currentPreset.name }} Preview</h5>
          <div class="large-preview-container">
            <CheckTemplatePreview :settings="currentSettings || currentPreset.settings" :scale="0.5" />
          </div>
        </div>
        </div>
      </div>
      
      <!-- Font Customization -->
      <div class="section collapsible-section" :class="{ collapsed: !sectionsExpanded.fonts }">
        <div class="section-header" @click="toggleSection('fonts')">
          <h4>
            <span class="collapse-icon">{{ sectionsExpanded.fonts ? '▼' : '▶' }}</span>
            🔤 Font Customization
          </h4>
        </div>
        <div v-show="sectionsExpanded.fonts" class="section-content">
        <div class="font-controls-modern">
          <div class="font-element-compact" v-for="(fontKey, index) in fontElements" :key="fontKey">
            <!-- Compact Header with Icons -->
            <div class="compact-header">
              <div class="element-info">
                <span class="element-name">{{ formatFontLabel(fontKey) }}</span>
                <div class="element-preview" :style="getElementPreviewStyle(fontKey)">
                  {{ getElementPreviewText(fontKey) }}
                </div>
              </div>
              <div class="icon-controls">
                <!-- Font Family Icon -->
                <div class="icon-control font-control">
                  <select 
                    :value="currentSettings?.fonts[fontKey]?.family || ''"
                    @change="updateFont(fontKey, 'family', $event.target.value)"
                    class="font-select"
                    :title="'Font: ' + getShortFontName(fontKey)"
                  >
                    <optgroup v-for="category in fontCategories" :key="category" :label="getCategoryLabel(category)">
                      <option 
                        v-for="font in getFontsByCategory(category)" 
                        :key="font.name" 
                        :value="font.name"
                        :style="{ fontFamily: font.name }"
                      >
                        {{ font.displayName }}
                      </option>
                    </optgroup>
                  </select>
                  <div class="font-icon-overlay">
                    <span class="icon-letter" :style="{ fontFamily: currentSettings?.fonts[fontKey]?.family }">A</span>
                  </div>
                </div>
                
                <!-- Size Icon -->
                <div class="icon-control" :class="{ active: expandedControls[fontKey] === 'size' }">
                  <button 
                    class="icon-btn"
                    @click="toggleControl(fontKey, 'size')"
                    :title="'Size: ' + (currentSettings?.fonts[fontKey]?.size || 16) + 'px'"
                  >
                    <span class="icon-text">{{ currentSettings?.fonts[fontKey]?.size || 16 }}</span>
                  </button>
                  <div v-if="expandedControls[fontKey] === 'size'" class="control-dropdown size-dropdown">
                    <input 
                      type="range"
                      :value="currentSettings?.fonts[fontKey]?.size || 16"
                      @input="updateFont(fontKey, 'size', parseInt($event.target.value))"
                      min="8" 
                      max="72" 
                      class="compact-slider"
                    />
                    <input 
                      type="number" 
                      :value="currentSettings?.fonts[fontKey]?.size || 16"
                      @input="updateFont(fontKey, 'size', parseInt($event.target.value))"
                      min="8" 
                      max="72" 
                      class="compact-number"
                    />
                  </div>
                </div>
                
                <!-- Weight Icon -->
                <div class="icon-control" :class="{ active: expandedControls[fontKey] === 'weight' }">
                  <button 
                    class="icon-btn"
                    @click="toggleControl(fontKey, 'weight')"
                    :title="'Weight: ' + (currentSettings?.fonts[fontKey]?.weight || 'normal')"
                  >
                    <span class="icon-text" :style="{ fontWeight: currentSettings?.fonts[fontKey]?.weight || 'normal' }">B</span>
                  </button>
                  <div v-if="expandedControls[fontKey] === 'weight'" class="control-dropdown">
                    <select 
                      :value="currentSettings?.fonts[fontKey]?.weight || 'normal'"
                      @change="updateFont(fontKey, 'weight', $event.target.value)"
                      class="compact-select"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="lighter">Light</option>
                      <option value="bolder">Extra Bold</option>
                    </select>
                  </div>
                </div>
                
                <!-- Color Icon -->
                <div class="icon-control color-control-wrapper">
                  <input 
                    type="color" 
                    :value="currentSettings?.fonts[fontKey]?.color || '#000000'"
                    @input="updateFont(fontKey, 'color', $event.target.value)"
                    class="hidden-color-input"
                    :id="`color-input-${fontKey}`"
                  />
                  <label 
                    :for="`color-input-${fontKey}`"
                    class="icon-btn color-btn"
                    :style="{ backgroundColor: currentSettings?.fonts[fontKey]?.color || '#000000' }"
                    :title="'Color: ' + (currentSettings?.fonts[fontKey]?.color || '#000000')"
                  >
                  </label>
                </div>
                
                <!-- Position Icon -->
                <div class="icon-control" :class="{ active: expandedControls[fontKey] === 'position' }">
                  <button 
                    class="icon-btn"
                    @click="toggleControl(fontKey, 'position')"
                    title="Position adjustment"
                  >
                    <span class="icon-text">⊕</span>
                  </button>
                  <div v-if="expandedControls[fontKey] === 'position'" class="control-dropdown position-dropdown">
                    <div class="position-grid">
                      <label>X:</label>
                      <input 
                        type="number" 
                        :value="getAdjustment(fontKey, 'x')"
                        @input="updateAdjustmentValue(fontKey, 'x', parseInt($event.target.value) || 0)"
                        class="compact-number"
                        step="1"
                      />
                      <label>Y:</label>
                      <input 
                        type="number" 
                        :value="getAdjustment(fontKey, 'y')"
                        @input="updateAdjustmentValue(fontKey, 'y', parseInt($event.target.value) || 0)"
                        class="compact-number"
                        step="1"
                      />
                    </div>
                    <button 
                      @click="resetAdjustment(fontKey)" 
                      class="compact-reset-btn"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <!-- Logo Settings -->
      <div class="section collapsible-section" :class="{ collapsed: !sectionsExpanded.logo }">
        <div class="section-header" @click="toggleSection('logo')">
          <h4>
            <span class="collapse-icon">{{ sectionsExpanded.logo ? '▼' : '▶' }}</span>
            🖼️ Logo
          </h4>
        </div>
        <div v-show="sectionsExpanded.logo" class="section-content">
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

            <!-- Logo Preview -->
            <div v-if="hasLogoFile" class="logo-preview-section">
              <label>Preview</label>
              <div class="logo-preview-container">
                <img 
                  :src="logoPreviewSrc" 
                  alt="Logo Preview"
                  class="logo-preview-image"
                  :style="logoPreviewStyle"
                />
                <div class="preview-overlay">
                  <span class="preview-dimensions">
                    {{ currentSettings?.logo.size.width }}×{{ currentSettings?.logo.size.height }}px
                  </span>
                </div>
              </div>
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
              <div class="size-controls">
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
                <div class="aspect-ratio-controls">
                  <div class="checkbox-row">
                    <input 
                      type="checkbox" 
                      id="maintain-aspect-ratio"
                      :checked="maintainAspectRatio"
                      @change="maintainAspectRatio = $event.target.checked"
                    />
                    <label for="maintain-aspect-ratio">Lock Aspect Ratio</label>
                  </div>
                  <button @click="resetToOriginalSize" class="btn btn-small">
                    🔄 Original Size
                  </button>
                </div>
              </div>
            </div>

            <!-- Padding/Margin Controls -->
            <div class="logo-spacing">
              <label>Spacing & Position Fine-tuning</label>
              <div class="spacing-grid">
                <div class="spacing-input">
                  <label>Top</label>
                  <input 
                    type="number" 
                    :value="currentSettings?.logo.margin?.top || 10"
                    @input="updateLogoMargin('top', parseInt($event.target.value))"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="spacing-input">
                  <label>Right</label>
                  <input 
                    type="number" 
                    :value="currentSettings?.logo.margin?.right || 10"
                    @input="updateLogoMargin('right', parseInt($event.target.value))"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="spacing-input">
                  <label>Bottom</label>
                  <input 
                    type="number" 
                    :value="currentSettings?.logo.margin?.bottom || 10"
                    @input="updateLogoMargin('bottom', parseInt($event.target.value))"
                    min="0"
                    max="100"
                  />
                </div>
                <div class="spacing-input">
                  <label>Left</label>
                  <input 
                    type="number" 
                    :value="currentSettings?.logo.margin?.left || 10"
                    @input="updateLogoMargin('left', parseInt($event.target.value))"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <!-- Opacity Control -->
            <div class="logo-opacity">
              <label>Opacity: {{ Math.round((currentSettings?.logo.opacity || 1) * 100) }}%</label>
              <input 
                type="range" 
                :value="currentSettings?.logo.opacity || 1"
                @input="updateLogo('opacity', parseFloat($event.target.value))"
                min="0.1"
                max="1"
                step="0.1"
                class="opacity-slider"
              />
            </div>

            <!-- Cropping Controls -->
            <div v-if="hasLogoFile" class="logo-cropping">
              <label>Image Adjustment</label>
              <div class="cropping-controls">
                <div class="object-fit-control">
                  <label>Fit Mode</label>
                  <select 
                    :value="currentSettings?.logo.objectFit || 'contain'"
                    @change="updateLogo('objectFit', $event.target.value)"
                  >
                    <option value="contain">Fit (Show All)</option>
                    <option value="cover">Fill (Crop to Fit)</option>
                    <option value="fill">Stretch</option>
                    <option value="scale-down">Scale Down</option>
                  </select>
                </div>
                <div class="object-position-control">
                  <label>Image Position</label>
                  <select 
                    :value="currentSettings?.logo.objectPosition || 'center'"
                    @change="updateLogo('objectPosition', $event.target.value)"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top left">Top Left</option>
                    <option value="top right">Top Right</option>
                    <option value="bottom left">Bottom Left</option>
                    <option value="bottom right">Bottom Right</option>
                  </select>
                </div>
              </div>
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
    
    <!-- Rename Dialog -->
    <div v-if="renameDialogPreset" class="modal-overlay" @click="closeRenameDialog">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>✏️ Rename Template</h3>
          <button class="modal-close" @click="closeRenameDialog">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="rename-name">Template Name</label>
            <input 
              id="rename-name"
              v-model="renameName" 
              type="text" 
              class="form-input"
              placeholder="Enter template name"
              @keyup.enter="saveRename"
            />
          </div>
          <div class="form-group">
            <label for="rename-description">Description (optional)</label>
            <textarea 
              id="rename-description"
              v-model="renameDescription" 
              class="form-textarea"
              placeholder="Enter description"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeRenameDialog" class="btn btn-secondary">Cancel</button>
          <button @click="saveRename" class="btn btn-primary" :disabled="!renameName.trim()">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useCustomizationStore } from '@/stores/customization'
import type { CustomizationPreset, FontSettings, CustomizationSettings } from '@/types'
import CheckTemplatePreview from './CheckTemplatePreview.vue'

const customizationStore = useCustomizationStore()

// Reactive variables
const maintainAspectRatio = ref(false)
const originalImageDimensions = ref<{ width: number; height: number } | null>(null)

// Section expansion states
const sectionsExpanded = reactive({
  templates: true,
  fonts: false,
  logo: false,
  colors: false,
  layout: false
})

// Track which control is expanded for each font element
const expandedControls = reactive<Record<string, string | null>>({})

// Track if we've already created a custom template from the current built-in
const hasCreatedCustomTemplate = ref(false)

// Rename dialog state
const renameDialogPreset = ref<CustomizationPreset | null>(null)
const renameName = ref('')
const renameDescription = ref('')

// Computed properties
const currentSettings = computed(() => customizationStore.currentSettings)
const presets = computed(() => customizationStore.presets)
const currentPreset = computed(() => customizationStore.currentPreset)
const availableFonts = computed(() => customizationStore.availableFonts)

// Logo-specific computed properties
const hasLogoFile = computed(() => {
  return currentSettings.value?.logo?.file || currentSettings.value?.logo?.url
})

const logoPreviewSrc = computed(() => {
  if (!currentSettings.value?.logo) return ''
  return currentSettings.value.logo.file?.url || currentSettings.value.logo.url || ''
})

const logoPreviewStyle = computed(() => {
  if (!currentSettings.value?.logo) return {}
  
  const logo = currentSettings.value.logo
  return {
    width: `${Math.min(logo.size?.width || 100, 200)}px`,
    height: `${Math.min(logo.size?.height || 50, 100)}px`,
    objectFit: logo.objectFit || 'contain',
    objectPosition: logo.objectPosition || 'center',
    opacity: logo.opacity || 1
  }
})

// Font elements that can be customized
const fontElements = [
  'accountHolder', 'payTo', 'amount', 'amountWords', 
  'memo', 'signature', 'bankInfo', 'bankName', 'checkNumber', 'date', 'fieldLabels'
] as const

// Font categories for organized display
const fontCategories = computed(() => {
  const categories = [...new Set(availableFonts.value.map(font => font.category))]
  return categories.sort((a, b) => {
    const order = ['sans-serif', 'serif', 'handwriting', 'monospace', 'banking']
    return order.indexOf(a) - order.indexOf(b)
  })
})

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
    bankName: 'Bank Name',
    checkNumber: 'Check Number',
    date: 'Date',
    fieldLabels: 'Field Labels (Date:, Memo:, etc.)'
  }
  return labels[key] || key
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'sans-serif': '📝 Sans-Serif (Clean & Modern)',
    'serif': '📖 Serif (Traditional & Formal)',
    'handwriting': '✍️ Handwriting & Signatures',
    'monospace': '💻 Monospace (Fixed Width)',
    'banking': '🏦 Banking & MICR Fonts'
  }
  return labels[category] || category
}

function getFontsByCategory(category: string) {
  return availableFonts.value.filter(font => font.category === category)
}

function getSelectedFontDescription(fontKey: string): string {
  const selectedFamily = currentSettings.value?.fonts[fontKey]?.family
  if (!selectedFamily) return ''
  
  const font = availableFonts.value.find(f => f.name === selectedFamily)
  return font?.description || ''
}

function getFontPreviewStyle(fontKey: string) {
  const font = currentSettings.value?.fonts[fontKey]
  if (!font) return {}
  
  return {
    fontFamily: font.family,
    fontSize: `${Math.min(font.size, 24)}px`,
    fontWeight: font.weight,
    color: font.color,
    fontStyle: font.style || 'normal'
  }
}

function getDropdownOptionStyle(fontName: string) {
  // Use readable font for MICR banking font in dropdown options only
  const dropdownFontFamily = fontName === 'banking, monospace' 
    ? 'Courier New, monospace' 
    : fontName
  
  return {
    fontFamily: dropdownFontFamily
  }
}

function getFontPreviewText(fontKey: string): string {
  const previews: Record<string, string> = {
    accountHolder: 'John Smith',
    payTo: 'Michael Johnson',
    amount: '$1,234.56',
    amountWords: 'One Thousand Two Hundred Thirty-Four and 56/100',
    memo: 'Rent Payment',
    signature: 'John Smith',
    bankInfo: 'a022303659a 000000000000c 100',
    bankName: 'First National Bank',
    checkNumber: '100',
    date: '12/07/2025'
  }
  return previews[fontKey] || 'Sample Text'
}

function updateFont(element: keyof typeof currentSettings.value.fonts, property: keyof FontSettings, value: any) {
  // Check if we're editing a built-in template
  if (currentPreset.value?.isBuiltIn && !hasCreatedCustomTemplate.value) {
    // Create a new custom template based on the built-in one (only once)
    hasCreatedCustomTemplate.value = true
    const newPresetName = `Custom ${currentPreset.value.name} ${Date.now()}`
    const newPreset = customizationStore.saveAsPreset(newPresetName, `Modified from ${currentPreset.value.name}`)
    
    // Apply the new preset and then the font update
    if (newPreset) {
      setTimeout(() => {
        customizationStore.applyPreset(newPreset)
        setTimeout(() => {
          customizationStore.updateFont(element, { [property]: value })
        }, 50)
      }, 50)
    }
  } else {
    customizationStore.updateFont(element, { [property]: value })
  }
}

function updateLogo(property: string, value: any) {
  customizationStore.updateLogo({ [property]: value })
}

function updateLogoSize(dimension: 'width' | 'height', value: number) {
  if (!currentSettings.value) return
  
  const newSize = { ...currentSettings.value.logo.size }
  
  if (maintainAspectRatio.value && originalImageDimensions.value) {
    const aspectRatio = originalImageDimensions.value.width / originalImageDimensions.value.height
    
    if (dimension === 'width') {
      newSize.width = value
      newSize.height = Math.round(value / aspectRatio)
    } else {
      newSize.height = value
      newSize.width = Math.round(value * aspectRatio)
    }
  } else {
    newSize[dimension] = value
  }
  
  customizationStore.updateLogo({ size: newSize })
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      
      // Create image to get dimensions
      const img = new Image()
      img.onload = () => {
        // Store original dimensions for aspect ratio calculations
        originalImageDimensions.value = {
          width: img.width,
          height: img.height
        }
        
        // Update logo with file and auto-enable
        customizationStore.updateLogo({
          enabled: true,
          file: {
            file,
            url,
            name: file.name,
            size: file.size,
            type: file.type
          }
        })
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }
}

// New logo enhancement functions
function updateLogoMargin(side: 'top' | 'right' | 'bottom' | 'left', value: number) {
  if (!currentSettings.value) return
  
  const newMargin = { 
    top: 10, 
    right: 10, 
    bottom: 10, 
    left: 10,
    ...currentSettings.value.logo.margin 
  }
  newMargin[side] = value
  customizationStore.updateLogo({ margin: newMargin })
}

function resetToOriginalSize() {
  if (!originalImageDimensions.value) return
  
  customizationStore.updateLogo({
    size: {
      width: originalImageDimensions.value.width,
      height: originalImageDimensions.value.height
    }
  })
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
  // Reset the flag when switching presets
  hasCreatedCustomTemplate.value = false
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

// Section toggle function
function toggleSection(sectionName: keyof typeof sectionsExpanded) {
  sectionsExpanded[sectionName] = !sectionsExpanded[sectionName]
}

// Toggle control dropdown for a font element
function toggleControl(fontKey: string, controlType: string) {
  if (expandedControls[fontKey] === controlType) {
    expandedControls[fontKey] = null
  } else {
    expandedControls[fontKey] = controlType
  }
}



// Get short font name for display
function getShortFontName(fontKey: keyof CustomizationSettings['fonts']): string {
  const family = currentSettings.value?.fonts[fontKey]?.family || ''
  return family.split(',')[0].trim()
}

// Get element preview style
function getElementPreviewStyle(fontKey: keyof CustomizationSettings['fonts']) {
  const font = currentSettings.value?.fonts[fontKey]
  if (!font) return {}
  
  return {
    fontFamily: font.family || 'Arial, sans-serif',
    fontSize: `${Math.min(font.size || 16, 24)}px`,
    fontWeight: font.weight || 'normal',
    fontStyle: font.style || 'normal',
    color: font.color || '#000000'
  }
}

// Get element preview text
function getElementPreviewText(fontKey: keyof CustomizationSettings['fonts']): string {
  const previewTexts: Record<string, string> = {
    accountHolder: 'John Doe',
    payTo: 'Sample Payee',
    amount: '$100.00',
    amountWords: 'One Hundred Dollars',
    memo: 'Sample memo',
    signature: 'Signature',
    bankInfo: '⑈123456789⑈',
    bankName: 'Sample Bank',
    checkNumber: '#1001',
    date: '12/10/2025',
    fieldLabels: 'Label:'
  }
  return previewTexts[fontKey] || 'Preview'
}

// Template deletion with confirmation
function confirmDeletePreset(preset: CustomizationPreset) {
  if (confirm(`Are you sure you want to delete the template "${preset.name}"?`)) {
    customizationStore.deletePreset(preset.id!)
  }
}

function openRenameDialog(preset: CustomizationPreset) {
  renameDialogPreset.value = preset
  renameName.value = preset.name
  renameDescription.value = preset.description || ''
}

function closeRenameDialog() {
  renameDialogPreset.value = null
  renameName.value = ''
  renameDescription.value = ''
}

function saveRename() {
  if (!renameDialogPreset.value || !renameName.value.trim()) return
  
  customizationStore.renamePreset(
    renameDialogPreset.value.id!,
    renameName.value.trim(),
    renameDescription.value.trim()
  )
  closeRenameDialog()
}

// Position adjustment functions
function getAdjustment(fontKey: keyof CustomizationSettings['fonts'], axis: 'x' | 'y'): number {
  return currentSettings.value?.adjustments?.[fontKey]?.[axis] || 0
}

function updateAdjustmentValue(fontKey: keyof CustomizationSettings['fonts'], axis: 'x' | 'y', value: number) {
  // Check if we're editing a built-in template
  if (currentPreset.value?.isBuiltIn && !hasCreatedCustomTemplate.value) {
    // Create a new custom template based on the built-in one (only once)
    hasCreatedCustomTemplate.value = true
    const newPresetName = `Custom ${currentPreset.value.name} ${Date.now()}`
    const newPreset = customizationStore.saveAsPreset(newPresetName, `Modified from ${currentPreset.value.name}`)
    
    // Apply the new preset and then the adjustment update
    if (newPreset) {
      setTimeout(() => {
        customizationStore.applyPreset(newPreset)
        setTimeout(() => {
          customizationStore.updateAdjustment(fontKey, { [axis]: value })
        }, 50)
      }, 50)
    }
  } else {
    customizationStore.updateAdjustment(fontKey, { [axis]: value })
  }
}

function resetAdjustment(fontKey: keyof CustomizationSettings['fonts']) {
  customizationStore.updateAdjustment(fontKey, { x: 0, y: 0 })
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
  position: relative;
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
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.preset-card.is-editing {
  border-color: #28a745;
  background: #f0fff4;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.preset-card.is-builtin.active {
  border-color: #6c757d;
  background: #f8f9fa;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
}

.preset-status-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.preset-card.is-editing .preset-status-badge {
  background: rgba(40, 167, 69, 0.9);
}

.preset-card.is-builtin.active .preset-status-badge {
  background: rgba(108, 117, 125, 0.9);
}

.badge-text {
  display: flex;
  align-items: center;
  gap: 4px;
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
  gap: 25px;
}

.font-element {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.font-element-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.font-element-label {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.font-preview {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
  min-width: 200px;
  text-align: center;
  max-height: 32px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.font-controls-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  align-items: start;
}

.font-control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.font-family-dropdown {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.font-family-select.enhanced {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.font-family-select.enhanced:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.font-family-select.enhanced optgroup {
  font-weight: bold;
  color: #333;
  background: #f8f9fa;
}

.font-family-select.enhanced option {
  padding: 8px;
  font-weight: normal;
}

.font-description {
  font-size: 11px;
  color: #666;
  font-style: italic;
  margin-top: 2px;
}

.size-control {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.font-size-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.font-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.font-size-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.font-size-input {
  width: 100%;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
}

.font-weight-select {
  width: 100%;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  background: white;
}

.color-control {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.color-input.enhanced {
  width: 50px;
  height: 50px;
  border: 3px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-input.enhanced:hover {
  transform: scale(1.1);
}

.color-value {
  font-size: 10px;
  font-family: monospace;
  color: #666;
  text-align: center;
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

/* Logo Enhancement Styles */
.logo-preview-section {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.logo-preview-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  background: white;
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.logo-preview-image {
  max-width: 200px;
  max-height: 100px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-overlay {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.size-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aspect-ratio-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.logo-spacing {
  margin: 15px 0;
}

.spacing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 8px;
}

.spacing-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spacing-input label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.spacing-input input {
  padding: 6px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
}

.logo-opacity {
  margin: 15px 0;
}

.opacity-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  margin-top: 8px;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.opacity-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.logo-cropping {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.cropping-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.object-fit-control,
.object-position-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.object-fit-control label,
.object-position-control label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.object-fit-control select,
.object-position-control select {
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  font-size: 13px;
}

/* Collapsible Section Styles */
.collapsible-section {
  transition: all 0.3s ease;
}

.section-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.section-header:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.section-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 15px 0;
}

.collapsible-section.collapsed .section-header h4 {
  margin-bottom: 0;
}

.collapse-icon {
  display: inline-block;
  transition: transform 0.3s ease;
  font-size: 0.8em;
}

.section-content {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 5000px;
  }
}

/* Template Preview Container */
.preset-preview-container {
  overflow: hidden;
  border-radius: 4px;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  border: 1px solid #e0e0e0;
  margin-bottom: 10px;
  padding: 8px;
  position: relative;
}

.preset-card:hover .preset-preview-container {
  border-color: #007bff;
}

.preset-card {
  position: relative;
}

.preset-card:hover .preset-actions {
  opacity: 1;
}

/* Selected Template Large Preview */
.selected-template-preview {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #007bff;
}

.selected-template-preview h5 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 18px;
  font-weight: 600;
}

.large-preview-container {
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 4px;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Adjustment Controls Styles */
.adjustment-controls {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #dee2e6;
}

.adjustment-inputs {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.adjustment-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 100px;
}

.adjustment-input label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.adjustment-number-input {
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 13px;
  width: 100%;
}

.adjustment-number-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.btn-reset-adjustment {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  height: 32px;
}

.btn-reset-adjustment:hover {
  background: #5a6268;
}

.btn-reset-adjustment:active {
  transform: scale(0.98);
}

/* Modern Compact Font Controls */
.font-controls-modern {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.font-element-compact {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
}

.font-element-compact:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.compact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.element-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.element-name {
  font-weight: 600;
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.element-preview {
  font-size: 16px;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 4px 0;
}

.icon-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.icon-control {
  position: relative;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  padding: 0;
}

.icon-btn:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.icon-control.active .icon-btn {
  border-color: #007bff;
  background: #e7f3ff;
}

.icon-letter {
  font-size: 18px;
  font-weight: 600;
}

.icon-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.color-control-wrapper {
  position: relative;
}

.hidden-color-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.color-btn {
  display: block;
  border: 2px solid #dee2e6;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.control-dropdown {
  position: absolute;
  top: 42px;
  right: 0;
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 200px;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.compact-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 13px;
  background: white;
}

.compact-select:focus {
  outline: none;
  border-color: #007bff;
}

.size-dropdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.compact-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
}

.compact-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.compact-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.compact-number {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.compact-number:focus {
  outline: none;
  border-color: #007bff;
}

.color-dropdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.compact-color {
  width: 100%;
  height: 40px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
}

.compact-text-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.compact-text-input:focus {
  outline: none;
  border-color: #007bff;
}

.position-dropdown {
  min-width: 160px;
}

.position-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.position-grid label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.compact-reset-btn {
  width: 100%;
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.compact-reset-btn:hover {
  background: #5a6268;
}

.compact-reset-btn:active {
  transform: scale(0.98);
}

/* Preset Actions */
.preset-actions {
  display: flex;
  gap: 8px;
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rename-btn {
  background: #007bff;
}

.rename-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.delete-btn {
  background: #dc3545;
}

.delete-btn:hover {
  background: #c82333;
  transform: scale(1.05);
}

/* Font Control Styles */
.font-control {
  position: relative;
  width: 36px;
  height: 36px;
}

.font-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.font-icon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.2s;
  z-index: 1;
}

.font-control:hover .font-icon-overlay {
  border-color: #007bff;
  background: #f8f9fa;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  pointer-events: auto;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10001;
  pointer-events: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}
</style>
