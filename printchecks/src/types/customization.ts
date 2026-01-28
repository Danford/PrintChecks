// Customization-related type definitions
import type { BaseEntity, FileUpload } from './common'

export interface FontSettings {
  family: string
  size: number
  weight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  style: 'normal' | 'italic' | 'oblique'
  color: string
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  border: string
  success: string
  warning: string
  error: string
}

export interface LogoSettings {
  enabled: boolean
  file?: FileUpload
  url?: string
  position:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  size: {
    width: number
    height: number
  }
  opacity: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
}

export interface PositionAdjustment {
  x: number
  y: number
}

export interface LayoutSettings {
  checkPosition: {
    x: number
    y: number
  }
  spacing: {
    lineHeight: number
    fieldSpacing: number
  }
  alignment: {
    accountHolder: 'left' | 'center' | 'right'
    payTo: 'left' | 'center' | 'right'
    amount: 'left' | 'center' | 'right'
    signature: 'left' | 'center' | 'right'
  }
  showBorders: boolean
  borderStyle: 'solid' | 'dashed' | 'dotted'
  borderWidth: number
}

export interface CustomizationSettings extends BaseEntity {
  name: string
  description?: string
  isDefault?: boolean

  // Font settings for different elements
  fonts: {
    accountHolder: FontSettings
    payTo: FontSettings
    amount: FontSettings
    amountWords: FontSettings
    memo: FontSettings
    signature: FontSettings
    bankInfo: FontSettings
    checkNumber: FontSettings
    date: FontSettings
    fieldLabels: FontSettings // For "Pay to the order of", "Date:", "Memo:", etc.
    bankName: FontSettings
  }

  // Position adjustments for fine-tuning element positions
  adjustments?: {
    accountHolder?: PositionAdjustment
    payTo?: PositionAdjustment
    amount?: PositionAdjustment
    amountWords?: PositionAdjustment
    memo?: PositionAdjustment
    signature?: PositionAdjustment
    bankInfo?: PositionAdjustment
    checkNumber?: PositionAdjustment
    date?: PositionAdjustment
    fieldLabels?: PositionAdjustment
    bankName?: PositionAdjustment
  }

  // Color scheme
  colors: ColorScheme

  // Logo settings
  logo: LogoSettings

  // Layout settings
  layout: LayoutSettings

  // Background settings
  background: {
    enabled: boolean
    color?: string
    image?: FileUpload
    opacity: number
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
    position: string
    size: 'auto' | 'cover' | 'contain' | string
  }
}

export interface CustomizationPreset extends BaseEntity {
  name: string
  description?: string
  category: 'business' | 'personal' | 'modern' | 'classic' | 'custom'
  settings: CustomizationSettings
  thumbnail?: string
  isBuiltIn?: boolean
  downloadCount?: number
  rating?: number
}

export interface FontFamily {
  name: string
  displayName: string
  category:
    | 'serif'
    | 'sans-serif'
    | 'monospace'
    | 'cursive'
    | 'fantasy'
    | 'banking'
    | 'handwriting'
    | 'display'
  variants: string[]
  isWebFont: boolean
  url?: string
  description?: string
}

export interface ColorPalette {
  name: string
  colors: string[]
  category: 'business' | 'vibrant' | 'pastel' | 'monochrome' | 'custom'
}

// Customization validation
export interface CustomizationValidation {
  fonts: boolean
  colors: boolean
  logo: boolean
  layout: boolean
  background: boolean
  overall: boolean
  errors: string[]
}
