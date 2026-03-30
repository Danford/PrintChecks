/**
 * Tests for src/stores/customization.ts
 *
 * Covers loadSettings, saveSettings, updateFont/Colors/Logo/Layout,
 * validateSettings, cssVariables, preset management, and resetToDefault.
 * secureStorage is mocked so no localStorage is touched.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCustomizationStore } from '../stores/customization'
import { secureStorage } from '@/services/secureStorage'

// ── Mock secureStorage ────────────────────────────────────────────────────────

vi.mock('@/services/secureStorage', () => ({
  secureStorage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn(),
    clear: vi.fn(),
    initialize: vi.fn(),
  },
}))

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ── loadSettings() ────────────────────────────────────────────────────────────

describe('loadSettings()', () => {
  it('sets currentSettings to defaultSettings when storage returns null', async () => {
    const store = useCustomizationStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce(null)
    await store.loadSettings()
    expect(store.currentSettings).not.toBeNull()
    expect(store.currentSettings?.id).toBe('default')
    expect(store.currentSettings?.fonts.accountHolder.family).toBe('Arial, sans-serif')
  })

  it('merges saved settings over defaults', async () => {
    const store = useCustomizationStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce(
      JSON.stringify({ name: 'My Custom', colors: { primary: '#ff0000' } })
    )
    await store.loadSettings()
    expect(store.currentSettings?.name).toBe('My Custom')
    // Merged: saved colors.primary but default fonts still present
    expect(store.currentSettings?.fonts.payTo.family).toBe('Arial, sans-serif')
  })

  it('falls back to defaultSettings when JSON is malformed', async () => {
    const store = useCustomizationStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce('not valid json{{{')
    await store.loadSettings()
    expect(store.currentSettings?.id).toBe('default')
  })
})

// ── saveSettings() ────────────────────────────────────────────────────────────

describe('saveSettings()', () => {
  it('persists settings JSON to secureStorage', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.saveSettings()
    expect(vi.mocked(secureStorage.set)).toHaveBeenCalledWith(
      'printchecks_customization',
      expect.stringContaining('"id":"default"')
    )
  })

  it('does nothing when currentSettings is null', async () => {
    const store = useCustomizationStore()
    // Don't call loadSettings — currentSettings stays null
    await store.saveSettings()
    expect(vi.mocked(secureStorage.set)).not.toHaveBeenCalled()
  })

  it('updates updatedAt timestamp on save', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    const before = new Date()
    await store.saveSettings()
    const saved = JSON.parse(vi.mocked(secureStorage.set).mock.calls[0][1] as string)
    expect(new Date(saved.updatedAt).getTime()).toBeGreaterThanOrEqual(before.getTime())
  })
})

// ── updateSettings() ──────────────────────────────────────────────────────────

describe('updateSettings()', () => {
  it('merges partial settings into currentSettings', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.updateSettings({ name: 'Updated' })
    expect(store.currentSettings?.name).toBe('Updated')
    expect(store.currentSettings?.id).toBe('default') // unchanged
  })

  it('does nothing when currentSettings is null', async () => {
    const store = useCustomizationStore()
    await store.updateSettings({ name: 'Noop' })
    expect(store.currentSettings).toBeNull()
  })

  it('calls saveSettings after update', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    vi.mocked(secureStorage.set).mockClear()
    await store.updateSettings({ name: 'Test' })
    expect(vi.mocked(secureStorage.set)).toHaveBeenCalledWith(
      'printchecks_customization',
      expect.any(String)
    )
  })
})

// ── updateFont() ──────────────────────────────────────────────────────────────

describe('updateFont()', () => {
  it('merges font settings for the given element', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.updateFont('accountHolder', { size: 24, weight: 'normal' })
    expect(store.currentSettings?.fonts.accountHolder.size).toBe(24)
    expect(store.currentSettings?.fonts.accountHolder.weight).toBe('normal')
    expect(store.currentSettings?.fonts.accountHolder.family).toBe('Arial, sans-serif') // preserved
  })

  it('does nothing when currentSettings is null', () => {
    const store = useCustomizationStore()
    // No loadSettings call — currentSettings is null
    expect(() => store.updateFont('payTo', { size: 18 })).not.toThrow()
    expect(store.currentSettings).toBeNull()
  })

  it('triggers saveSettings', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    vi.mocked(secureStorage.set).mockClear()
    store.updateFont('memo', { size: 28 })
    expect(vi.mocked(secureStorage.set)).toHaveBeenCalled()
  })
})

// ── updateColors() ────────────────────────────────────────────────────────────

describe('updateColors()', () => {
  it('merges color updates into currentSettings.colors', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.updateColors({ primary: '#1a365d', accent: '#2b6cb0' })
    expect(store.currentSettings?.colors.primary).toBe('#1a365d')
    expect(store.currentSettings?.colors.accent).toBe('#2b6cb0')
    expect(store.currentSettings?.colors.background).toBe('#ffffff') // preserved
  })

  it('does nothing when currentSettings is null', () => {
    const store = useCustomizationStore()
    expect(() => store.updateColors({ primary: '#ff0000' })).not.toThrow()
    expect(store.currentSettings).toBeNull()
  })
})

// ── updateLogo() ──────────────────────────────────────────────────────────────

describe('updateLogo()', () => {
  it('merges logo settings into currentSettings.logo', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.updateLogo({ enabled: true, url: 'https://example.com/logo.png' })
    expect(store.currentSettings?.logo.enabled).toBe(true)
    expect(store.currentSettings?.logo.url).toBe('https://example.com/logo.png')
    expect(store.currentSettings?.logo.opacity).toBe(1) // preserved
  })

  it('does nothing when currentSettings is null', () => {
    const store = useCustomizationStore()
    expect(() => store.updateLogo({ enabled: true })).not.toThrow()
    expect(store.currentSettings).toBeNull()
  })
})

// ── updateLayout() ────────────────────────────────────────────────────────────

describe('updateLayout()', () => {
  it('merges layout settings into currentSettings.layout', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.updateLayout({ showBorders: true, borderWidth: 2 })
    expect(store.currentSettings?.layout.showBorders).toBe(true)
    expect(store.currentSettings?.layout.borderWidth).toBe(2)
    expect(store.currentSettings?.layout.borderStyle).toBe('solid') // preserved
  })

  it('does nothing when currentSettings is null', () => {
    const store = useCustomizationStore()
    expect(() => store.updateLayout({ showBorders: true })).not.toThrow()
    expect(store.currentSettings).toBeNull()
  })
})

// ── validateSettings() ────────────────────────────────────────────────────────

describe('validateSettings()', () => {
  it('returns false and sets overall=false when currentSettings is null', () => {
    const store = useCustomizationStore()
    const result = store.validateSettings()
    expect(result).toBe(false)
  })

  it('returns true for valid default settings', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    const result = store.validateSettings()
    expect(result).toBe(true)
    expect(store.validation.overall).toBe(true)
    expect(store.validation.errors).toHaveLength(0)
  })

  it('fails when a color is not a valid hex/rgb/rgba string', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.colors.primary = 'not-a-color'
    const result = store.validateSettings()
    expect(result).toBe(false)
    expect(store.validation.colors).toBe(false)
    expect(store.validation.errors).toContain('Invalid color format')
  })

  it('accepts rgb() colors', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.colors.primary = 'rgb(0, 0, 0)'
    const result = store.validateSettings()
    expect(result).toBe(true)
  })

  it('accepts rgba() colors', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.colors.primary = 'rgba(0, 0, 0, 0.5)'
    const result = store.validateSettings()
    expect(result).toBe(true)
  })

  it('fails when a font has size <= 0', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.fonts.accountHolder.size = 0
    const result = store.validateSettings()
    expect(result).toBe(false)
    expect(store.validation.fonts).toBe(false)
  })

  it('fails when logo is enabled but has no file or url', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.logo.enabled = true
    store.currentSettings!.logo.file = undefined
    store.currentSettings!.logo.url = ''
    const result = store.validateSettings()
    expect(result).toBe(false)
    expect(store.validation.logo).toBe(false)
    expect(store.validation.errors).toContain('Logo enabled but no file or URL provided')
  })

  it('passes when logo is enabled with a url', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.logo.enabled = true
    store.currentSettings!.logo.url = 'https://example.com/logo.png'
    const result = store.validateSettings()
    expect(result).toBe(true)
    expect(store.validation.logo).toBe(true)
  })

  it('fails when layout lineHeight is 0', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.layout.spacing.lineHeight = 0
    const result = store.validateSettings()
    expect(result).toBe(false)
    expect(store.validation.layout).toBe(false)
  })
})

// ── isValid computed ──────────────────────────────────────────────────────────

describe('isValid computed', () => {
  it('returns true after loading valid default settings', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.validateSettings()
    expect(store.isValid).toBe(true)
  })
})

// ── hasCustomLogo computed ────────────────────────────────────────────────────

describe('hasCustomLogo computed', () => {
  it('is falsy when logo is disabled (default)', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    expect(store.hasCustomLogo).toBeFalsy()
  })

  it('is falsy when logo is enabled but has no file or url', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.logo.enabled = true
    store.currentSettings!.logo.url = ''
    store.currentSettings!.logo.file = undefined
    expect(store.hasCustomLogo).toBeFalsy()
  })

  it('is truthy when logo is enabled and has a url', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.logo.enabled = true
    store.currentSettings!.logo.url = 'https://example.com/logo.png'
    expect(store.hasCustomLogo).toBeTruthy()
  })
})

// ── cssVariables computed ─────────────────────────────────────────────────────

describe('cssVariables computed', () => {
  it('returns empty object when currentSettings is null', () => {
    const store = useCustomizationStore()
    expect(store.cssVariables).toEqual({})
  })

  it('generates font CSS variable keys', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    expect(store.cssVariables['--font-accountHolder-family']).toBe('Arial, sans-serif')
    expect(store.cssVariables['--font-accountHolder-size']).toBe('20px')
    expect(store.cssVariables['--font-accountHolder-weight']).toBe('bold')
  })

  it('generates color CSS variable keys', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    expect(store.cssVariables['--color-primary']).toBe('#000000')
    expect(store.cssVariables['--color-background']).toBe('#ffffff')
  })

  it('generates layout CSS variable keys', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    expect(store.cssVariables['--check-position-x']).toBe('0px')
    expect(store.cssVariables['--line-height']).toBe('1.2')
    expect(store.cssVariables['--field-spacing']).toBe('10px')
    expect(store.cssVariables['--border-width']).toBe('1px')
  })

  it('does not include logo variables when logo is disabled', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    expect(store.currentSettings?.logo.enabled).toBe(false)
    expect(store.cssVariables['--logo-width']).toBeUndefined()
  })

  it('includes logo variables when logo is enabled', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.currentSettings!.logo.enabled = true
    expect(store.cssVariables['--logo-width']).toBe('100px')
    expect(store.cssVariables['--logo-height']).toBe('50px')
    expect(store.cssVariables['--logo-opacity']).toBe('1')
  })
})

// ── resetToDefault() ──────────────────────────────────────────────────────────

describe('resetToDefault()', () => {
  it('resets currentSettings to default values', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.updateSettings({ name: 'Modified' })
    store.resetToDefault()
    expect(store.currentSettings?.name).toBe('Default')
    expect(store.currentSettings?.id).toBe('default')
  })

  it('sets currentPreset to null', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    store.applyPreset(store.presets[0])
    expect(store.currentPreset).not.toBeNull()
    store.resetToDefault()
    expect(store.currentPreset).toBeNull()
  })
})

// ── loadPresets() ─────────────────────────────────────────────────────────────

describe('loadPresets()', () => {
  it('always adds built-in presets when storage is empty', async () => {
    const store = useCustomizationStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce(null)
    await store.loadPresets()
    const builtIns = store.presets.filter((p) => p.isBuiltIn)
    expect(builtIns.length).toBeGreaterThanOrEqual(2)
    expect(builtIns.map((p) => p.id)).toContain('business-classic')
    expect(builtIns.map((p) => p.id)).toContain('modern-minimal')
  })

  it('loads custom presets from storage alongside built-ins', async () => {
    const store = useCustomizationStore()
    const customPreset = {
      id: 'my-custom',
      name: 'My Custom',
      category: 'custom',
      settings: {},
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    vi.mocked(secureStorage.get).mockResolvedValueOnce(JSON.stringify([customPreset]))
    await store.loadPresets()
    expect(store.presets.some((p) => p.id === 'my-custom')).toBe(true)
    expect(store.presets.some((p) => p.id === 'business-classic')).toBe(true)
  })

  it('falls back to only built-ins when storage JSON is malformed', async () => {
    const store = useCustomizationStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce('bad json{{{')
    await store.loadPresets()
    expect(store.presets.some((p) => p.isBuiltIn)).toBe(true)
    expect(store.presets.filter((p) => !p.isBuiltIn)).toHaveLength(0)
  })
})

// ── applyPreset() ─────────────────────────────────────────────────────────────

describe('applyPreset()', () => {
  it('sets currentSettings from preset.settings', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    const classic = store.presets.find((p) => p.id === 'business-classic')!
    store.applyPreset(classic)
    expect(store.currentSettings?.colors.primary).toBe('#1a365d')
  })

  it('sets currentPreset', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    const minimal = store.presets.find((p) => p.id === 'modern-minimal')!
    store.applyPreset(minimal)
    expect(store.currentPreset?.id).toBe('modern-minimal')
  })
})

// ── saveAsPreset() ────────────────────────────────────────────────────────────

describe('saveAsPreset()', () => {
  it('returns null when currentSettings is null', () => {
    const store = useCustomizationStore()
    const result = store.saveAsPreset('My Preset')
    expect(result).toBeNull()
  })

  it('creates a preset with given name and pushes it to presets', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    const preset = store.saveAsPreset('My Preset', 'A description', 'custom')
    expect(preset).not.toBeNull()
    expect(preset?.name).toBe('My Preset')
    expect(preset?.isBuiltIn).toBe(false)
    expect(store.presets.some((p) => p.name === 'My Preset')).toBe(true)
  })

  it('preset settings snapshot current settings', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    store.updateColors({ primary: '#abcdef' })
    const preset = store.saveAsPreset('Color Test')
    expect(preset?.settings.colors?.primary).toBe('#abcdef')
  })
})

// ── deletePreset() ────────────────────────────────────────────────────────────

describe('deletePreset()', () => {
  it('does not delete built-in presets', async () => {
    const store = useCustomizationStore()
    await store.loadPresets()
    const before = store.presets.length
    store.deletePreset('business-classic')
    expect(store.presets.length).toBe(before)
  })

  it('deletes custom presets', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    store.saveAsPreset('Custom One')
    const before = store.presets.length
    const custom = store.presets.find((p) => p.name === 'Custom One')!
    store.deletePreset(custom.id)
    expect(store.presets.length).toBe(before - 1)
    expect(store.presets.some((p) => p.name === 'Custom One')).toBe(false)
  })

  it('switches to business-classic when deleting the active custom preset', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    const preset = store.saveAsPreset('Active Custom')!
    store.applyPreset(preset)
    expect(store.currentPreset?.name).toBe('Active Custom')
    store.deletePreset(preset.id)
    expect(store.currentPreset?.id).toBe('business-classic')
  })
})

// ── renamePreset() ────────────────────────────────────────────────────────────

describe('renamePreset()', () => {
  it('does not rename built-in presets', async () => {
    const store = useCustomizationStore()
    await store.loadPresets()
    store.renamePreset('business-classic', 'Hacked Name', 'Hacked')
    const classic = store.presets.find((p) => p.id === 'business-classic')!
    expect(classic.name).toBe('Business Classic')
  })

  it('renames custom presets', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    const preset = store.saveAsPreset('Old Name')!
    store.renamePreset(preset.id, 'New Name', 'New description')
    const updated = store.presets.find((p) => p.id === preset.id)!
    expect(updated.name).toBe('New Name')
    expect(updated.description).toBe('New description')
  })
})

// ── syncCurrentSettingsToPreset() ─────────────────────────────────────────────

describe('syncCurrentSettingsToPreset()', () => {
  it('does nothing when no current preset', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    expect(() => store.syncCurrentSettingsToPreset()).not.toThrow()
  })

  it('does nothing when current preset is built-in', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    const classic = store.presets.find((p) => p.id === 'business-classic')!
    store.applyPreset(classic)
    vi.mocked(secureStorage.set).mockClear()
    // syncCurrentSettingsToPreset should be a no-op for built-in presets
    store.syncCurrentSettingsToPreset()
    // savePresets is not called because sync was skipped
    expect(vi.mocked(secureStorage.set)).not.toHaveBeenCalledWith(
      'printchecks_presets',
      expect.any(String)
    )
  })

  it('syncs current settings back to a custom preset', async () => {
    const store = useCustomizationStore()
    await store.loadSettings()
    await store.loadPresets()
    const preset = store.saveAsPreset('My Preset')!
    store.applyPreset(preset)
    store.currentSettings!.colors.primary = '#123456'
    store.syncCurrentSettingsToPreset()
    const synced = store.presets.find((p) => p.id === preset.id)!
    expect(synced.settings.colors?.primary).toBe('#123456')
  })
})

// ── initializeCustomization() ─────────────────────────────────────────────────

describe('initializeCustomization()', () => {
  // loadAvailableFonts() calls loadGoogleFonts() which uses document — stub it
  const mockDocument = {
    querySelectorAll: vi.fn().mockReturnValue([]),
    createElement: vi.fn().mockReturnValue({ rel: '', href: '', setAttribute: vi.fn() }),
    head: { appendChild: vi.fn() },
  }

  beforeEach(() => {
    vi.stubGlobal('document', mockDocument)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads settings and presets', async () => {
    const store = useCustomizationStore()
    await store.initializeCustomization()
    expect(store.currentSettings).not.toBeNull()
    expect(store.presets.length).toBeGreaterThan(0)
  })

  it('applies the first preset when none is selected', async () => {
    const store = useCustomizationStore()
    await store.initializeCustomization()
    // Built-in presets are always present; first one gets applied
    expect(store.currentPreset).not.toBeNull()
  })

  it('populates availableFonts and colorPalettes', async () => {
    const store = useCustomizationStore()
    await store.initializeCustomization()
    expect(store.availableFonts.length).toBeGreaterThan(0)
    expect(store.colorPalettes.length).toBeGreaterThan(0)
  })
})
