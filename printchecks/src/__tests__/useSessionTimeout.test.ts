/**
 * Tests for src/composables/useSessionTimeout.ts
 *
 * The composable uses browser APIs (localStorage, sessionStorage, window,
 * document, alert) and onMounted/onUnmounted lifecycle hooks.
 *
 * Strategy:
 * - All browser globals are stubbed via vi.stubGlobal before each test.
 * - onMounted/onUnmounted do NOT fire in a plain Node test context, so
 *   startSessionTimeout() is called manually in tests that need it.
 * - Internal closures (handleVisibilityChange) are captured by inspecting
 *   the document.addEventListener spy.
 * - secureStorage is mocked to avoid real storage access.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSessionTimeout } from '../composables/useSessionTimeout'
import { secureStorage } from '@/services/secureStorage'

// ── Mock secureStorage ────────────────────────────────────────────────────────

vi.mock('@/services/secureStorage', () => ({
  secureStorage: {
    initialize: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}))

// ── Browser API stubs ─────────────────────────────────────────────────────────

// These are created once and reconfigured in beforeEach
const mockLocalStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

const mockSessionStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

// Capture registered handlers so tests can invoke them directly
const windowHandlers: Record<string, EventListener> = {}
const documentHandlers: Record<string, EventListener> = {}

const mockDocument = {
  addEventListener: vi.fn((event: string, fn: EventListener) => {
    documentHandlers[event] = fn
  }),
  removeEventListener: vi.fn(),
  visibilityState: 'visible' as DocumentVisibilityState,
}

const mockLocation = { reload: vi.fn() }

const mockWindow = {
  setTimeout: vi.fn().mockReturnValue(1),
  clearTimeout: vi.fn(),
  setInterval: vi.fn().mockReturnValue(2),
  clearInterval: vi.fn(),
  addEventListener: vi.fn((event: string, fn: EventListener) => {
    windowHandlers[event] = fn
  }),
  removeEventListener: vi.fn(),
  location: mockLocation,
}

// clearAllTimers() inside the composable calls bare clearTimeout/clearInterval
// (not window.clearTimeout), so we need separate global stubs for those.
const mockClearTimeout = vi.fn()
const mockClearInterval = vi.fn()

vi.stubGlobal('localStorage', mockLocalStorage)
vi.stubGlobal('sessionStorage', mockSessionStorage)
vi.stubGlobal('document', mockDocument)
vi.stubGlobal('window', mockWindow)
vi.stubGlobal('alert', vi.fn())
vi.stubGlobal('clearTimeout', mockClearTimeout)
vi.stubGlobal('clearInterval', mockClearInterval)

// ── Helpers ───────────────────────────────────────────────────────────────────

function withEncryptionAndPassword() {
  mockLocalStorage.getItem.mockImplementation((key: string) =>
    key === 'encryption_enabled' ? 'true' : null
  )
  mockSessionStorage.getItem.mockImplementation((key: string) =>
    key === 'encryption_password' ? 's3cr3t' : null
  )
}

function withEncryptionOnly() {
  mockLocalStorage.getItem.mockImplementation((key: string) =>
    key === 'encryption_enabled' ? 'true' : null
  )
  mockSessionStorage.getItem.mockReturnValue(null)
}

function withNoEncryption() {
  mockLocalStorage.getItem.mockReturnValue(null)
  mockSessionStorage.getItem.mockReturnValue(null)
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // Reset captured handlers
  Object.keys(windowHandlers).forEach((k) => delete windowHandlers[k])
  Object.keys(documentHandlers).forEach((k) => delete documentHandlers[k])
  // Silence console.log chatter from the composable
  vi.spyOn(console, 'log').mockImplementation(() => {})
  // Restore mock implementations cleared by clearAllMocks
  mockDocument.addEventListener.mockImplementation((event: string, fn: EventListener) => {
    documentHandlers[event] = fn
  })
  mockWindow.addEventListener.mockImplementation((event: string, fn: EventListener) => {
    windowHandlers[event] = fn
  })
  mockWindow.setTimeout.mockReturnValue(1)
  mockWindow.setInterval.mockReturnValue(2)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  // Re-stub for next test (unstubAllGlobals removes them)
  vi.stubGlobal('localStorage', mockLocalStorage)
  vi.stubGlobal('sessionStorage', mockSessionStorage)
  vi.stubGlobal('document', mockDocument)
  vi.stubGlobal('window', mockWindow)
  vi.stubGlobal('alert', vi.fn())
  vi.stubGlobal('clearTimeout', mockClearTimeout)
  vi.stubGlobal('clearInterval', mockClearInterval)
})

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('showWarning is false, countdown is 60, isLocked is false', () => {
    withNoEncryption()
    const { showWarning, countdown, isLocked } = useSessionTimeout()
    expect(showWarning.value).toBe(false)
    expect(countdown.value).toBe(60)
    expect(isLocked.value).toBe(false)
  })
})

// ── resetInactivityTimer() ────────────────────────────────────────────────────

describe('resetInactivityTimer()', () => {
  it('returns early when isLocked is true — no setTimeout called', () => {
    withEncryptionAndPassword()
    const { isLocked, resetInactivityTimer } = useSessionTimeout()
    isLocked.value = true
    resetInactivityTimer()
    expect(mockWindow.setTimeout).not.toHaveBeenCalled()
  })

  it('returns early when encryptionEnabled ref is false — no setTimeout called', () => {
    withNoEncryption()
    const { resetInactivityTimer } = useSessionTimeout()
    // encryptionEnabled initialized from localStorage (null → false)
    resetInactivityTimer()
    expect(mockWindow.setTimeout).not.toHaveBeenCalled()
  })

  it('returns early when no password in sessionStorage — no setTimeout called', () => {
    withEncryptionOnly()
    const { resetInactivityTimer } = useSessionTimeout()
    // encryptionEnabled is true from localStorage, but sessionStorage has no password
    resetInactivityTimer()
    expect(mockWindow.setTimeout).not.toHaveBeenCalled()
  })

  it('sets inactivity timer when encryption enabled and password present', () => {
    withEncryptionAndPassword()
    const { resetInactivityTimer } = useSessionTimeout()
    resetInactivityTimer()
    expect(mockWindow.setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      5 * 60 * 1000 // INACTIVITY_TIMEOUT
    )
  })

  it('clears previous inactivity timer before setting a new one', () => {
    withEncryptionAndPassword()
    mockWindow.setTimeout.mockReturnValueOnce(10).mockReturnValueOnce(11)
    const { resetInactivityTimer } = useSessionTimeout()
    resetInactivityTimer()  // sets inactivityTimer = 10
    resetInactivityTimer()  // clearAllTimers calls clearTimeout(10), then sets 11
    // clearAllTimers uses bare clearTimeout (global), not window.clearTimeout
    expect(mockClearTimeout).toHaveBeenCalledWith(10)
  })

  it('resets showWarning to false', () => {
    withEncryptionAndPassword()
    const { showWarning, resetInactivityTimer } = useSessionTimeout()
    showWarning.value = true
    resetInactivityTimer()
    expect(showWarning.value).toBe(false)
  })
})

// ── startSessionTimeout() ─────────────────────────────────────────────────────

describe('startSessionTimeout()', () => {
  it('does not add event listeners when encryption is disabled', () => {
    withNoEncryption()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    expect(mockWindow.addEventListener).not.toHaveBeenCalled()
    expect(mockDocument.addEventListener).not.toHaveBeenCalled()
  })

  it('does not add event listeners when password is absent', () => {
    withEncryptionOnly()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    expect(mockWindow.addEventListener).not.toHaveBeenCalled()
  })

  it('adds activity event listeners on window when conditions are met', () => {
    withEncryptionAndPassword()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    const registeredEvents = mockWindow.addEventListener.mock.calls.map(([e]) => e)
    expect(registeredEvents).toContain('mousedown')
    expect(registeredEvents).toContain('keydown')
    expect(registeredEvents).toContain('scroll')
    expect(registeredEvents).toContain('touchstart')
  })

  it('adds visibilitychange listener on document when conditions are met', () => {
    withEncryptionAndPassword()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    expect(mockDocument.addEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
  })

  it('starts the inactivity timer via resetInactivityTimer()', () => {
    withEncryptionAndPassword()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    expect(mockWindow.setTimeout).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000)
  })
})

// ── stopSessionTimeout() ──────────────────────────────────────────────────────

describe('stopSessionTimeout()', () => {
  it('removes activity event listeners from window', () => {
    withEncryptionAndPassword()
    const { startSessionTimeout, stopSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    stopSessionTimeout()
    const removedEvents = mockWindow.removeEventListener.mock.calls.map(([e]) => e)
    expect(removedEvents).toContain('mousedown')
    expect(removedEvents).toContain('keydown')
  })

  it('removes visibilitychange listener from document', () => {
    withEncryptionAndPassword()
    const { startSessionTimeout, stopSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    stopSessionTimeout()
    expect(mockDocument.removeEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
  })
})

// ── showWarningPrompt() ───────────────────────────────────────────────────────

describe('showWarningPrompt (triggered via timer callback)', () => {
  it('sets showWarning to true when inactivity timer fires', () => {
    withEncryptionAndPassword()
    let timerCallback: (() => void) | null = null
    mockWindow.setTimeout.mockImplementation((fn: () => void) => {
      timerCallback = fn
      return 1
    })
    const { showWarning, resetInactivityTimer } = useSessionTimeout()
    resetInactivityTimer()
    expect(timerCallback).not.toBeNull()
    timerCallback!()
    expect(showWarning.value).toBe(true)
  })

  it('starts the countdown interval when warning is shown', () => {
    withEncryptionAndPassword()
    let timerCallback: (() => void) | null = null
    mockWindow.setTimeout.mockImplementation((fn: () => void) => {
      timerCallback = fn
      return 1
    })
    const { resetInactivityTimer } = useSessionTimeout()
    resetInactivityTimer()
    timerCallback!()
    expect(mockWindow.setInterval).toHaveBeenCalledWith(expect.any(Function), 1000)
  })

  it('countdown decrements each time the interval callback fires', () => {
    withEncryptionAndPassword()
    let timerCallback: (() => void) | null = null
    let intervalCallback: (() => void) | null = null
    mockWindow.setTimeout.mockImplementation((fn: () => void) => {
      timerCallback = fn
      return 1
    })
    mockWindow.setInterval.mockImplementation((fn: () => void) => {
      intervalCallback = fn
      return 2
    })
    const { countdown, resetInactivityTimer } = useSessionTimeout()
    resetInactivityTimer()
    timerCallback!() // triggers showWarningPrompt → starts interval
    expect(countdown.value).toBe(60)
    intervalCallback!()
    intervalCallback!()
    intervalCallback!()
    expect(countdown.value).toBe(57)
  })
})

// ── keepSessionActive() ───────────────────────────────────────────────────────

describe('keepSessionActive()', () => {
  it('sets showWarning to false', () => {
    withEncryptionAndPassword()
    let timerCallback: (() => void) | null = null
    mockWindow.setTimeout.mockImplementation((fn: () => void) => {
      timerCallback = fn
      return 1
    })
    const { showWarning, resetInactivityTimer, keepSessionActive } = useSessionTimeout()
    resetInactivityTimer()
    timerCallback!() // show warning
    expect(showWarning.value).toBe(true)
    keepSessionActive()
    expect(showWarning.value).toBe(false)
  })

  it('restarts the inactivity timer', () => {
    withEncryptionAndPassword()
    const { keepSessionActive } = useSessionTimeout()
    vi.mocked(mockWindow.setTimeout).mockClear()
    keepSessionActive()
    expect(mockWindow.setTimeout).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000)
  })
})

// ── lockSession() ─────────────────────────────────────────────────────────────

describe('lockSession() (triggered via warning timer callback)', () => {
  function triggerLock() {
    withEncryptionAndPassword()
    // First setTimeout → inactivity timer; second → warning timer (leads to lock)
    const callbacks: (() => void)[] = []
    mockWindow.setTimeout.mockImplementation((fn: () => void) => {
      callbacks.push(fn)
      return callbacks.length
    })
    const result = useSessionTimeout()
    result.resetInactivityTimer()   // sets inactivity timer
    callbacks[0]()                  // fires showWarningPrompt → sets warning timer
    callbacks[1]()                  // fires lockSession
    return result
  }

  it('sets isLocked to true', () => {
    const { isLocked } = triggerLock()
    expect(isLocked.value).toBe(true)
  })

  it('sets showWarning to false', () => {
    const { showWarning } = triggerLock()
    expect(showWarning.value).toBe(false)
  })

  it('removes the encryption password from sessionStorage', () => {
    triggerLock()
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('encryption_password')
  })

  it('calls secureStorage.initialize(null) to clear the password', () => {
    triggerLock()
    expect(vi.mocked(secureStorage.initialize)).toHaveBeenCalledWith(null)
  })

  it('calls window.location.reload()', () => {
    triggerLock()
    expect(mockLocation.reload).toHaveBeenCalled()
  })
})

// ── handleVisibilityChange() ──────────────────────────────────────────────────

describe('handleVisibilityChange()', () => {
  it('does nothing when encryption is disabled', () => {
    withNoEncryption()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()
    const handler = documentHandlers['visibilitychange']
    // handler is not registered when conditions not met
    expect(handler).toBeUndefined()
  })

  it('locks session when visible and elapsed time >= INACTIVITY_TIMEOUT', () => {
    withEncryptionAndPassword()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()

    const handler = documentHandlers['visibilitychange']
    expect(handler).toBeDefined()

    // Simulate coming back after 6 minutes (> 5 min timeout)
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60 * 1000)
    mockDocument.visibilityState = 'visible'
    handler(new Event('visibilitychange'))

    expect(mockLocation.reload).toHaveBeenCalled()
    dateSpy.mockRestore()
    mockDocument.visibilityState = 'visible'
  })

  it('resets timer without locking when visible and elapsed time < INACTIVITY_TIMEOUT', () => {
    withEncryptionAndPassword()
    const { startSessionTimeout } = useSessionTimeout()
    startSessionTimeout()

    const handler = documentHandlers['visibilitychange']
    vi.mocked(mockWindow.setTimeout).mockClear()

    // Simulate returning after only 1 minute (< 5 min timeout)
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 60 * 1000)
    mockDocument.visibilityState = 'visible'
    handler(new Event('visibilitychange'))

    expect(mockLocation.reload).not.toHaveBeenCalled()
    expect(mockWindow.setTimeout).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000)
    dateSpy.mockRestore()
    mockDocument.visibilityState = 'visible'
  })
})
