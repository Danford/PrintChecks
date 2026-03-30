/**
 * Tests for src/stores/app.ts
 *
 * Covers computed properties, loading state, error management,
 * navigation state, and settings persistence.
 * secureStorage is mocked so no localStorage is touched.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '../stores/app'
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

// ── isDarkMode computed ───────────────────────────────────────────────────────

describe('isDarkMode computed', () => {
  it('returns false when theme is "light" (default)', () => {
    const store = useAppStore()
    expect(store.isDarkMode).toBe(false)
  })

  it('returns true when theme is "dark"', async () => {
    const store = useAppStore()
    await store.updateSettings({ theme: 'dark' })
    expect(store.isDarkMode).toBe(true)
  })

  it('returns false when theme is set back to "light"', async () => {
    const store = useAppStore()
    await store.updateSettings({ theme: 'dark' })
    await store.updateSettings({ theme: 'light' })
    expect(store.isDarkMode).toBe(false)
  })
})

// ── hasErrors computed ────────────────────────────────────────────────────────

describe('hasErrors computed', () => {
  it('returns false when errors array is empty', () => {
    const store = useAppStore()
    expect(store.hasErrors).toBe(false)
  })

  it('returns true when at least one error exists', () => {
    const store = useAppStore()
    store.addError('Something went wrong')
    expect(store.hasErrors).toBe(true)
  })

  it('returns false after clearErrors()', () => {
    const store = useAppStore()
    store.addError('Error')
    store.clearErrors()
    expect(store.hasErrors).toBe(false)
  })
})

// ── setLoading() ──────────────────────────────────────────────────────────────

describe('setLoading()', () => {
  it('sets isLoading to true', () => {
    const store = useAppStore()
    store.setLoading(true)
    expect(store.isLoading).toBe(true)
  })

  it('sets isLoading to false', () => {
    const store = useAppStore()
    store.setLoading(true)
    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })

  it('sets loadingMessage when provided', () => {
    const store = useAppStore()
    store.setLoading(true, 'Saving...')
    expect(store.loadingMessage).toBe('Saving...')
  })

  it('clears loadingMessage when not provided', () => {
    const store = useAppStore()
    store.setLoading(true, 'Loading...')
    store.setLoading(false)
    expect(store.loadingMessage).toBe('')
  })
})

// ── addError() ────────────────────────────────────────────────────────────────

describe('addError()', () => {
  it('pushes message to errors array', () => {
    const store = useAppStore()
    store.addError('Network failure')
    expect(store.errors).toContain('Network failure')
  })

  it('sets the error ref to the new message', () => {
    const store = useAppStore()
    store.addError('Bad request')
    expect(store.error).toBe('Bad request')
  })

  it('accumulates multiple errors', () => {
    const store = useAppStore()
    store.addError('Error 1')
    store.addError('Error 2')
    expect(store.errors).toHaveLength(2)
    expect(store.error).toBe('Error 2')
  })
})

// ── clearErrors() ─────────────────────────────────────────────────────────────

describe('clearErrors()', () => {
  it('empties the errors array', () => {
    const store = useAppStore()
    store.addError('E1')
    store.addError('E2')
    store.clearErrors()
    expect(store.errors).toHaveLength(0)
  })

  it('resets error ref to null', () => {
    const store = useAppStore()
    store.addError('E1')
    store.clearErrors()
    expect(store.error).toBeNull()
  })

  it('is safe to call when no errors exist', () => {
    const store = useAppStore()
    expect(() => store.clearErrors()).not.toThrow()
    expect(store.errors).toHaveLength(0)
  })
})

// ── updateSettings() ──────────────────────────────────────────────────────────

describe('updateSettings()', () => {
  it('merges partial settings into existing settings', async () => {
    const store = useAppStore()
    await store.updateSettings({ language: 'es' })
    expect(store.settings.language).toBe('es')
    expect(store.settings.theme).toBe('light') // preserved
  })

  it('persists settings to secureStorage', async () => {
    const store = useAppStore()
    await store.updateSettings({ theme: 'dark' })
    expect(vi.mocked(secureStorage.set)).toHaveBeenCalledWith(
      'printchecks_settings',
      expect.stringContaining('"theme":"dark"')
    )
  })

  it('updates autoSave flag', async () => {
    const store = useAppStore()
    await store.updateSettings({ autoSave: false })
    expect(store.settings.autoSave).toBe(false)
  })
})

// ── loadSettings() ────────────────────────────────────────────────────────────

describe('loadSettings()', () => {
  it('does nothing when secureStorage returns null', async () => {
    const store = useAppStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce(null)
    await store.loadSettings()
    expect(store.settings.theme).toBe('light') // default unchanged
  })

  it('merges saved settings over defaults', async () => {
    const store = useAppStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce(JSON.stringify({ theme: 'dark', language: 'fr' }))
    await store.loadSettings()
    expect(store.settings.theme).toBe('dark')
    expect(store.settings.language).toBe('fr')
    expect(store.settings.autoSave).toBe(true) // default preserved
  })

  it('does not throw when stored JSON is malformed', async () => {
    const store = useAppStore()
    vi.mocked(secureStorage.get).mockResolvedValueOnce('not valid json{{{')
    await expect(store.loadSettings()).resolves.not.toThrow()
    expect(store.settings.theme).toBe('light') // unchanged
  })
})

// ── setCurrentView() ──────────────────────────────────────────────────────────

describe('setCurrentView()', () => {
  it('updates currentView', () => {
    const store = useAppStore()
    store.setCurrentView('history')
    expect(store.currentView).toBe('history')
  })

  it('default currentView is "check"', () => {
    const store = useAppStore()
    expect(store.currentView).toBe('check')
  })
})

// ── toggleSidebar() ───────────────────────────────────────────────────────────

describe('toggleSidebar()', () => {
  it('opens the sidebar when it is closed', () => {
    const store = useAppStore()
    expect(store.sidebarOpen).toBe(false)
    store.toggleSidebar()
    expect(store.sidebarOpen).toBe(true)
  })

  it('closes the sidebar when it is open', () => {
    const store = useAppStore()
    store.toggleSidebar()
    store.toggleSidebar()
    expect(store.sidebarOpen).toBe(false)
  })
})
