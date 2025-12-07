import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { 
  CustomizationSettings, 
  CustomizationPreset, 
  FontFamily, 
  ColorPalette,
  CustomizationValidation,
  FontSettings,
  ColorScheme,
  LogoSettings,
  LayoutSettings
} from '@/types'

export const useCustomizationStore = defineStore('useCustomizationStore', () => {
  // Current customization settings
  const currentSettings = ref<CustomizationSettings | null>(null)
  
  // Available presets
  const presets = ref<CustomizationPreset[]>([])
  const currentPreset = ref<CustomizationPreset | null>(null)
  
  // Available fonts and colors
  const availableFonts = ref<FontFamily[]>([])
  const colorPalettes = ref<ColorPalette[]>([])
  
  // Validation state
  const validation = ref<CustomizationValidation>({
    fonts: true,
    colors: true,
    logo: true,
    layout: true,
    background: true,
    overall: true,
    errors: []
  })
  
  // Loading states
  const isLoadingFonts = ref(false)
  const isLoadingPresets = ref(false)
  
  // Default settings - matching original PrintChecks styling exactly
  const defaultSettings: CustomizationSettings = {
    id: 'default',
    name: 'Default',
    description: 'Original PrintChecks styling',
    isDefault: true,
    fonts: {
      accountHolder: {
        family: 'Arial, sans-serif',
        size: 20,
        weight: 'bold',
        style: 'normal',
        color: '#000000'
      },
      payTo: {
        family: 'Arial, sans-serif',
        size: 20,
        weight: 'bold',
        style: 'normal',
        color: '#000000'
      },
      amount: {
        family: 'Arial, sans-serif',
        size: 20,
        weight: 'bold',
        style: 'normal',
        color: '#000000'
      },
      amountWords: {
        family: 'Arial, sans-serif',
        size: 16,
        weight: 'normal',
        style: 'normal',
        color: '#000000'
      },
      memo: {
        family: 'Caveat, cursive',
        size: 30,
        weight: 'normal',
        style: 'normal',
        color: '#000000'
      },
      signature: {
        family: 'Caveat, cursive',
        size: 40,
        weight: 'normal',
        style: 'normal',
        color: '#000000'
      },
      bankInfo: {
        family: 'banking, monospace',
        size: 37,
        weight: 'normal',
        style: 'normal',
        color: '#000000'
      },
      checkNumber: {
        family: 'Arial, sans-serif',
        size: 20,
        weight: 'bold',
        style: 'normal',
        color: '#000000'
      },
      date: {
        family: 'Arial, sans-serif',
        size: 20,
        weight: 'bold',
        style: 'normal',
        color: '#000000'
      }
    },
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#0066cc',
      background: '#ffffff',
      text: '#000000',
      border: '#cccccc',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545'
    },
    logo: {
      enabled: false,
      position: 'top-left',
      size: { width: 100, height: 50 },
      opacity: 1,
      margin: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    layout: {
      checkPosition: { x: 0, y: 0 },
      spacing: { lineHeight: 1.2, fieldSpacing: 10 },
      alignment: {
        accountHolder: 'left',
        payTo: 'left',
        amount: 'right',
        signature: 'left'
      },
      showBorders: false,
      borderStyle: 'solid',
      borderWidth: 1
    },
    background: {
      enabled: true,
      opacity: 1,
      repeat: 'no-repeat',
      position: 'center',
      size: 'contain'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  // Computed properties
  const isValid = computed(() => validation.value.overall)
  
  const hasCustomLogo = computed(() => 
    currentSettings.value?.logo.enabled && 
    (currentSettings.value?.logo.file || currentSettings.value?.logo.url)
  )
  
  const cssVariables = computed(() => {
    if (!currentSettings.value) return {}
    
    const vars: Record<string, string> = {}
    const settings = currentSettings.value
    
    // Font variables
    Object.entries(settings.fonts).forEach(([key, font]) => {
      vars[`--font-${key}-family`] = font.family
      vars[`--font-${key}-size`] = `${font.size}px`
      vars[`--font-${key}-weight`] = font.weight
      vars[`--font-${key}-style`] = font.style
      vars[`--font-${key}-color`] = font.color
    })
    
    // Color variables
    Object.entries(settings.colors).forEach(([key, color]) => {
      vars[`--color-${key}`] = color
    })
    
    // Layout variables
    vars['--check-position-x'] = `${settings.layout.checkPosition.x}px`
    vars['--check-position-y'] = `${settings.layout.checkPosition.y}px`
    vars['--line-height'] = settings.layout.spacing.lineHeight.toString()
    vars['--field-spacing'] = `${settings.layout.spacing.fieldSpacing}px`
    vars['--border-width'] = `${settings.layout.borderWidth}px`
    vars['--border-style'] = settings.layout.borderStyle
    
    // Logo variables
    if (settings.logo.enabled) {
      vars['--logo-width'] = `${settings.logo.size.width}px`
      vars['--logo-height'] = `${settings.logo.size.height}px`
      vars['--logo-opacity'] = settings.logo.opacity.toString()
      vars['--logo-margin-top'] = `${settings.logo.margin.top}px`
      vars['--logo-margin-right'] = `${settings.logo.margin.right}px`
      vars['--logo-margin-bottom'] = `${settings.logo.margin.bottom}px`
      vars['--logo-margin-left'] = `${settings.logo.margin.left}px`
    }
    
    return vars
  })
  
  // Actions
  function initializeCustomization() {
    loadSettings()
    loadPresets()
    loadAvailableFonts()
    loadColorPalettes()
  }
  
  function loadSettings() {
    try {
      const saved = localStorage.getItem('printchecks_customization')
      if (saved) {
        const parsed = JSON.parse(saved)
        currentSettings.value = { ...defaultSettings, ...parsed }
      } else {
        currentSettings.value = { ...defaultSettings }
      }
    } catch (e) {
      console.warn('Failed to load customization settings:', e)
      currentSettings.value = { ...defaultSettings }
    }
  }
  
  function saveSettings() {
    if (!currentSettings.value) return
    
    try {
      currentSettings.value.updatedAt = new Date()
      localStorage.setItem('printchecks_customization', JSON.stringify(currentSettings.value))
    } catch (e) {
      console.error('Failed to save customization settings:', e)
    }
  }
  
  function updateSettings(updates: Partial<CustomizationSettings>) {
    if (!currentSettings.value) return
    
    currentSettings.value = {
      ...currentSettings.value,
      ...updates,
      updatedAt: new Date()
    }
    
    validateSettings()
    saveSettings()
  }
  
  function updateFont(element: keyof CustomizationSettings['fonts'], fontSettings: Partial<FontSettings>) {
    if (!currentSettings.value) return
    
    currentSettings.value.fonts[element] = {
      ...currentSettings.value.fonts[element],
      ...fontSettings
    }
    
    validateSettings()
    saveSettings()
  }
  
  function updateColors(colorUpdates: Partial<ColorScheme>) {
    if (!currentSettings.value) return
    
    currentSettings.value.colors = {
      ...currentSettings.value.colors,
      ...colorUpdates
    }
    
    validateSettings()
    saveSettings()
  }
  
  function updateLogo(logoSettings: Partial<LogoSettings>) {
    if (!currentSettings.value) return
    
    currentSettings.value.logo = {
      ...currentSettings.value.logo,
      ...logoSettings
    }
    
    validateSettings()
    saveSettings()
  }
  
  function updateLayout(layoutSettings: Partial<LayoutSettings>) {
    if (!currentSettings.value) return
    
    currentSettings.value.layout = {
      ...currentSettings.value.layout,
      ...layoutSettings
    }
    
    validateSettings()
    saveSettings()
  }
  
  function validateSettings(): boolean {
    if (!currentSettings.value) return false
    
    const errors: string[] = []
    
    // Validate fonts
    const fontsValid = Object.values(currentSettings.value.fonts).every(font => {
      if (!font.family || font.size <= 0) {
        errors.push('Invalid font settings')
        return false
      }
      return true
    })
    
    // Validate colors
    const colorsValid = Object.values(currentSettings.value.colors).every(color => {
      if (!isValidColor(color)) {
        errors.push('Invalid color format')
        return false
      }
      return true
    })
    
    // Validate logo
    const logoValid = !currentSettings.value.logo.enabled || 
      currentSettings.value.logo.file || 
      currentSettings.value.logo.url
    
    if (!logoValid) {
      errors.push('Logo enabled but no file or URL provided')
    }
    
    // Validate layout
    const layoutValid = currentSettings.value.layout.spacing.lineHeight > 0 &&
      currentSettings.value.layout.spacing.fieldSpacing >= 0 &&
      currentSettings.value.layout.borderWidth >= 0
    
    if (!layoutValid) {
      errors.push('Invalid layout settings')
    }
    
    validation.value = {
      fonts: fontsValid,
      colors: colorsValid,
      logo: logoValid,
      layout: layoutValid,
      background: true, // Background is always valid
      overall: fontsValid && colorsValid && logoValid && layoutValid,
      errors
    }
    
    return validation.value.overall
  }
  
  function isValidColor(color: string): boolean {
    // Basic hex color validation
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
           /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color) ||
           /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)
  }
  
  function resetToDefault() {
    currentSettings.value = { ...defaultSettings }
    currentPreset.value = null
    validateSettings()
    saveSettings()
  }
  
  function applyPreset(preset: CustomizationPreset) {
    currentSettings.value = { ...preset.settings }
    currentPreset.value = preset
    validateSettings()
    saveSettings()
  }
  
  function saveAsPreset(name: string, description?: string, category: CustomizationPreset['category'] = 'custom') {
    if (!currentSettings.value) return null
    
    const preset: CustomizationPreset = {
      id: generateId(),
      name,
      description,
      category,
      settings: { ...currentSettings.value },
      isBuiltIn: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    presets.value.push(preset)
    savePresets()
    
    return preset
  }
  
  function loadPresets() {
    try {
      const saved = localStorage.getItem('printchecks_presets')
      if (saved) {
        presets.value = JSON.parse(saved)
      }
      
      // Add built-in presets if not already present
      addBuiltInPresets()
    } catch (e) {
      console.warn('Failed to load presets:', e)
      addBuiltInPresets()
    }
  }
  
  function savePresets() {
    try {
      localStorage.setItem('printchecks_presets', JSON.stringify(presets.value))
    } catch (e) {
      console.error('Failed to save presets:', e)
    }
  }
  
  function addBuiltInPresets() {
    const builtInPresets: CustomizationPreset[] = [
      {
        id: 'business-classic',
        name: 'Business Classic',
        description: 'Professional business check styling',
        category: 'business',
        settings: {
          ...defaultSettings,
          name: 'Business Classic',
          colors: {
            ...defaultSettings.colors,
            primary: '#1a365d',
            accent: '#2b6cb0'
          }
        },
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Clean, modern styling with minimal elements',
        category: 'modern',
        settings: {
          ...defaultSettings,
          name: 'Modern Minimal',
          colors: {
            ...defaultSettings.colors,
            primary: '#2d3748',
            accent: '#4299e1',
            border: '#e2e8f0'
          },
          layout: {
            ...defaultSettings.layout,
            showBorders: true,
            borderStyle: 'solid',
            borderWidth: 1
          }
        },
        isBuiltIn: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    // Only add built-in presets that don't already exist
    builtInPresets.forEach(preset => {
      if (!presets.value.find(p => p.id === preset.id)) {
        presets.value.push(preset)
      }
    })
  }
  
  function deletePreset(presetId: string) {
    presets.value = presets.value.filter(p => p.id !== presetId && !p.isBuiltIn)
    savePresets()
  }
  
  function loadAvailableFonts() {
    // Load comprehensive font collection with ALL available fonts
    availableFonts.value = [
      // System Sans-Serif Fonts (Enhanced Collection)
      {
        name: 'Arial, sans-serif',
        displayName: 'Arial',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Clean, professional sans-serif'
      },
      {
        name: 'Helvetica, Arial, sans-serif',
        displayName: 'Helvetica',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Classic Swiss design'
      },
      {
        name: 'Verdana, sans-serif',
        displayName: 'Verdana',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Highly readable screen font'
      },
      {
        name: 'Tahoma, sans-serif',
        displayName: 'Tahoma',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Compact and clear'
      },
      {
        name: 'Trebuchet MS, sans-serif',
        displayName: 'Trebuchet MS',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Humanist sans-serif'
      },
      {
        name: 'Calibri, sans-serif',
        displayName: 'Calibri',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Modern Microsoft font'
      },
      {
        name: 'Segoe UI, sans-serif',
        displayName: 'Segoe UI',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Windows system font'
      },
      {
        name: 'Lucida Grande, sans-serif',
        displayName: 'Lucida Grande',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'macOS system font'
      },

      // System Serif Fonts (Enhanced Collection)
      {
        name: 'Times New Roman, serif',
        displayName: 'Times New Roman',
        category: 'serif',
        variants: ['normal', 'bold', 'italic'],
        isWebFont: false,
        description: 'Traditional serif typeface'
      },
      {
        name: 'Georgia, serif',
        displayName: 'Georgia',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Elegant serif for screens'
      },
      {
        name: 'Book Antiqua, serif',
        displayName: 'Book Antiqua',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Classic book-style serif'
      },
      {
        name: 'Palatino, serif',
        displayName: 'Palatino',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Renaissance-inspired serif'
      },
      {
        name: 'Garamond, serif',
        displayName: 'Garamond',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Classic French serif'
      },
      {
        name: 'Cambria, serif',
        displayName: 'Cambria',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Modern serif for screens'
      },

      // Monospace Fonts (Enhanced Collection)
      {
        name: 'Courier New, monospace',
        displayName: 'Courier New',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Traditional typewriter font'
      },
      {
        name: 'Consolas, monospace',
        displayName: 'Consolas',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Modern programming font'
      },
      {
        name: 'Monaco, monospace',
        displayName: 'Monaco',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'macOS monospace font'
      },
      {
        name: 'Lucida Console, monospace',
        displayName: 'Lucida Console',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: false,
        description: 'Windows console font'
      },
      {
        name: 'MICR E13B Banking, monospace',
        displayName: 'MICR E13B (Banking)',
        category: 'banking',
        variants: ['normal'],
        isWebFont: false,
        description: 'Official banking check font'
      },

      // Google Web Fonts - Professional Sans-Serif (Massive Collection)
      {
        name: 'Open Sans, sans-serif',
        displayName: 'Open Sans',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap',
        description: 'Friendly and readable'
      },
      {
        name: 'Roboto, sans-serif',
        displayName: 'Roboto',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
        description: 'Modern and geometric'
      },
      {
        name: 'Lato, sans-serif',
        displayName: 'Lato',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
        description: 'Humanist sans-serif'
      },
      {
        name: 'Montserrat, sans-serif',
        displayName: 'Montserrat',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
        description: 'Urban inspired design'
      },
      {
        name: 'Source Sans Pro, sans-serif',
        displayName: 'Source Sans Pro',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap',
        description: 'Adobe\'s first open source font'
      },
      {
        name: 'Nunito, sans-serif',
        displayName: 'Nunito',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
        description: 'Rounded sans-serif'
      },
      {
        name: 'Poppins, sans-serif',
        displayName: 'Poppins',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap',
        description: 'Geometric sans-serif'
      },
      {
        name: 'Inter, sans-serif',
        displayName: 'Inter',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
        description: 'Designed for computer screens'
      },
      {
        name: 'Work Sans, sans-serif',
        displayName: 'Work Sans',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap',
        description: 'Optimized for on-screen text'
      },
      {
        name: 'Fira Sans, sans-serif',
        displayName: 'Fira Sans',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap',
        description: 'Mozilla\'s signature typeface'
      },
      {
        name: 'PT Sans, sans-serif',
        displayName: 'PT Sans',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap',
        description: 'Russian type foundry design'
      },
      {
        name: 'Rubik, sans-serif',
        displayName: 'Rubik',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap',
        description: 'Slightly rounded corners'
      },
      {
        name: 'Oxygen, sans-serif',
        displayName: 'Oxygen',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Oxygen:wght@400;700&display=swap',
        description: 'Created for KDE desktop'
      },
      {
        name: 'Ubuntu, sans-serif',
        displayName: 'Ubuntu',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap',
        description: 'Canonical\'s signature font'
      },
      {
        name: 'Raleway, sans-serif',
        displayName: 'Raleway',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap',
        description: 'Elegant sans-serif'
      },

      // Google Web Fonts - Professional Serif (Massive Collection)
      {
        name: 'Playfair Display, serif',
        displayName: 'Playfair Display',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
        description: 'High-contrast serif'
      },
      {
        name: 'Merriweather, serif',
        displayName: 'Merriweather',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
        description: 'Designed for screens'
      },
      {
        name: 'Crimson Text, serif',
        displayName: 'Crimson Text',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap',
        description: 'Inspired by old-style serif'
      },
      {
        name: 'Libre Baskerville, serif',
        displayName: 'Libre Baskerville',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
        description: 'Based on American Type Founder\'s Baskerville'
      },
      {
        name: 'Lora, serif',
        displayName: 'Lora',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
        description: 'Well-balanced contemporary serif'
      },
      {
        name: 'PT Serif, serif',
        displayName: 'PT Serif',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap',
        description: 'Transitional serif for text'
      },
      {
        name: 'Source Serif Pro, serif',
        displayName: 'Source Serif Pro',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;700&display=swap',
        description: 'Adobe\'s serif companion'
      },
      {
        name: 'Cormorant Garamond, serif',
        displayName: 'Cormorant Garamond',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&display=swap',
        description: 'Display serif inspired by Garamond'
      },
      {
        name: 'Vollkorn, serif',
        displayName: 'Vollkorn',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Vollkorn:wght@400;700&display=swap',
        description: 'Quiet, modest serif'
      },
      {
        name: 'Bitter, serif',
        displayName: 'Bitter',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;700&display=swap',
        description: 'Contemporary slab serif'
      },
      {
        name: 'Rokkitt, serif',
        displayName: 'Rokkitt',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Rokkitt:wght@400;700&display=swap',
        description: 'Slab serif with personality'
      },
      {
        name: 'Arvo, serif',
        displayName: 'Arvo',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&display=swap',
        description: 'Geometric slab serif'
      },
      
      // Google Web Fonts - Handwriting & Signature Styles (Massive Collection)
      {
        name: 'Caveat, cursive',
        displayName: 'Caveat',
        category: 'handwriting',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap',
        description: 'Casual handwritten style'
      },
      {
        name: 'Dancing Script, cursive',
        displayName: 'Dancing Script',
        category: 'handwriting',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
        description: 'Elegant script font'
      },
      {
        name: 'Great Vibes, cursive',
        displayName: 'Great Vibes',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
        description: 'Formal signature style'
      },
      {
        name: 'Pacifico, cursive',
        displayName: 'Pacifico',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
        description: 'Friendly brush script'
      },
      {
        name: 'Satisfy, cursive',
        displayName: 'Satisfy',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
        description: 'Casual marker style'
      },
      {
        name: 'Kaushan Script, cursive',
        displayName: 'Kaushan Script',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap',
        description: 'Acrylic brush lettering'
      },
      {
        name: 'Allura, cursive',
        displayName: 'Allura',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Allura&display=swap',
        description: 'Flowing script'
      },
      {
        name: 'Alex Brush, cursive',
        displayName: 'Alex Brush',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap',
        description: 'Connecting script'
      },
      {
        name: 'Amatic SC, cursive',
        displayName: 'Amatic SC',
        category: 'handwriting',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap',
        description: 'Hand-drawn marker style'
      },
      {
        name: 'Indie Flower, cursive',
        displayName: 'Indie Flower',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
        description: 'Friendly handwriting'
      },
      {
        name: 'Shadows Into Light, cursive',
        displayName: 'Shadows Into Light',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap',
        description: 'Marker pen style'
      },
      {
        name: 'Permanent Marker, cursive',
        displayName: 'Permanent Marker',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap',
        description: 'Bold marker style'
      },
      {
        name: 'Courgette, cursive',
        displayName: 'Courgette',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Courgette&display=swap',
        description: 'Casual script'
      },
      {
        name: 'Lobster, cursive',
        displayName: 'Lobster',
        category: 'handwriting',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap',
        description: 'Bold script with flair'
      },

      // Google Web Fonts - Enhanced Monospace Collection
      {
        name: 'Roboto Mono, monospace',
        displayName: 'Roboto Mono',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
        description: 'Modern monospace'
      },
      {
        name: 'Source Code Pro, monospace',
        displayName: 'Source Code Pro',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap',
        description: 'Adobe\'s coding font'
      },
      {
        name: 'Fira Code, monospace',
        displayName: 'Fira Code',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap',
        description: 'Programming ligatures'
      },
      {
        name: 'JetBrains Mono, monospace',
        displayName: 'JetBrains Mono',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
        description: 'Developer-focused monospace'
      },
      {
        name: 'Space Mono, monospace',
        displayName: 'Space Mono',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
        description: 'Retro-futuristic monospace'
      },
      {
        name: 'Inconsolata, monospace',
        displayName: 'Inconsolata',
        category: 'monospace',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap',
        description: 'Humanist monospace'
      },

      // Display & Decorative Fonts
      {
        name: 'Oswald, sans-serif',
        displayName: 'Oswald',
        category: 'display',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap',
        description: 'Condensed sans-serif'
      },
      {
        name: 'Bebas Neue, cursive',
        displayName: 'Bebas Neue',
        category: 'display',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
        description: 'All caps display font'
      },
      {
        name: 'Anton, sans-serif',
        displayName: 'Anton',
        category: 'display',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
        description: 'Bold impact font'
      },
      {
        name: 'Righteous, cursive',
        displayName: 'Righteous',
        category: 'display',
        variants: ['normal'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
        description: 'Retro display font'
      },
      {
        name: 'Old English Text MT, serif',
        displayName: 'Old English Text MT',
        category: 'display',
        variants: ['normal'],
        isWebFont: false,
        description: 'Classic blackletter/Gothic style font'
      },
      {
        name: 'Lato, sans-serif',
        displayName: 'Lato',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
        description: 'Humanist sans-serif'
      },
      {
        name: 'Montserrat, sans-serif',
        displayName: 'Montserrat',
        category: 'sans-serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
        description: 'Urban inspired design'
      },
      
      // Google Web Fonts - Professional Serif
      {
        name: 'Playfair Display, serif',
        displayName: 'Playfair Display',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
        description: 'High-contrast serif'
      },
      {
        name: 'Merriweather, serif',
        displayName: 'Merriweather',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
        description: 'Designed for screens'
      },
      {
        name: 'Crimson Text, serif',
        displayName: 'Crimson Text',
        category: 'serif',
        variants: ['normal', 'bold'],
        isWebFont: true,
        url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap',
        description: 'Inspired by old-style serif'
      }
    ]
    
    // Load Google Fonts dynamically
    loadGoogleFonts()
  }
  
  function loadGoogleFonts() {
    const webFonts = availableFonts.value.filter(font => font.isWebFont && font.url)
    const existingLinks = document.querySelectorAll('link[data-font-loader]')
    
    // Remove existing font links to avoid duplicates
    existingLinks.forEach(link => link.remove())
    
    // Load each unique Google Font
    const uniqueUrls = [...new Set(webFonts.map(font => font.url))]
    uniqueUrls.forEach(url => {
      if (url) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url
        link.setAttribute('data-font-loader', 'true')
        document.head.appendChild(link)
      }
    })
  }
  
  function loadColorPalettes() {
    colorPalettes.value = [
      {
        name: 'Professional',
        category: 'business',
        colors: ['#1a365d', '#2b6cb0', '#4299e1', '#63b3ed', '#90cdf4']
      },
      {
        name: 'Modern',
        category: 'business',
        colors: ['#2d3748', '#4a5568', '#718096', '#a0aec0', '#cbd5e0']
      },
      {
        name: 'Vibrant',
        category: 'vibrant',
        colors: ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce']
      },
      {
        name: 'Pastel',
        category: 'pastel',
        colors: ['#fed7d7', '#feebc8', '#f0fff4', '#e6fffa', '#ebf8ff']
      }
    ]
  }
  
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  return {
    // State
    currentSettings,
    presets,
    currentPreset,
    availableFonts,
    colorPalettes,
    validation,
    isLoadingFonts,
    isLoadingPresets,
    
    // Computed
    isValid,
    hasCustomLogo,
    cssVariables,
    
    // Actions
    initializeCustomization,
    loadSettings,
    saveSettings,
    updateSettings,
    updateFont,
    updateColors,
    updateLogo,
    updateLayout,
    validateSettings,
    resetToDefault,
    applyPreset,
    saveAsPreset,
    loadPresets,
    deletePreset,
    loadAvailableFonts,
    loadGoogleFonts,
    loadColorPalettes
  }
})
