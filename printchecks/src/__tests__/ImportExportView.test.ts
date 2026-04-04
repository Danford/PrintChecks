/**
 * Tests for src/views/ImportExportView.vue
 *
 * Covers: export count display (data loaded from secureStorage on mount),
 * encryption-toggle UI state, onFileSelected (preview, encrypted detection,
 * invalid-JSON error), and importData validation (missing fields, non-array
 * fields, correct structure, password gate).
 * secureStorage and encryption service are fully mocked.
 *
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ImportExportView from '../views/ImportExportView.vue'

// ── Mock secureStorage ────────────────────────────────────────────────────────

const { mockStorageGet, mockStorageSet } = vi.hoisted(() => ({
  mockStorageGet: vi.fn().mockResolvedValue(null),
  mockStorageSet: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/secureStorage', () => ({
  secureStorage: {
    get: mockStorageGet,
    set: mockStorageSet,
    initialize: vi.fn(),
    migrateToEncrypted: vi.fn().mockResolvedValue(undefined),
    migrateToPlainText: vi.fn().mockResolvedValue(undefined),
    reencryptWithNewPassword: vi.fn().mockResolvedValue(undefined),
    updatePassword: vi.fn(),
  },
}))

// ── Mock encryption service ───────────────────────────────────────────────────

const { mockIsEncrypted, mockDecrypt, mockEncrypt } = vi.hoisted(() => ({
  mockIsEncrypted: vi.fn().mockReturnValue(false),
  mockDecrypt: vi.fn(),
  mockEncrypt: vi.fn(),
}))

vi.mock('@/services/encryption', () => ({
  isEncrypted: mockIsEncrypted,
  decrypt: mockDecrypt,
  encrypt: mockEncrypt,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeExportData(overrides = {}) {
  return {
    version: '1.0',
    exportDate: '2026-03-01T00:00:00.000Z',
    checks: [],
    receipts: [],
    payments: [],
    vendors: [],
    bankAccounts: [],
    encrypted: false,
    ...overrides,
  }
}

/** Build a File object containing the given content string, with text() guaranteed to work */
function makeFile(content: string, name = 'export.json'): File {
  const file = new File([content], name, { type: 'application/json' })
  // jsdom's Blob.text() may not resolve in all environments — override to be safe
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(content),
    configurable: true,
  })
  return file
}

/** Trigger file-input change with the given File */
async function selectFile(wrapper: ReturnType<typeof mount>, file: File) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: [file],
    configurable: true,
  })
  await input.trigger('change')
  await flushPromises()
}

async function mountView() {
  const wrapper = mount(ImportExportView)
  await flushPromises()
  return wrapper
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockStorageGet.mockResolvedValue(null)
  mockStorageSet.mockResolvedValue(undefined)
  mockIsEncrypted.mockReturnValue(false)
  // Default localStorage: encryption not enabled
  localStorage.clear()
})

// ── Export count display ──────────────────────────────────────────────────────

describe('export count display', () => {
  it('shows 0 counts when storage is empty', async () => {
    const wrapper = await mountView()
    const text = wrapper.text()
    expect(text).toContain('0 checks')
    expect(text).toContain('0 receipts')
    expect(text).toContain('0 vendors')
    expect(text).toContain('0 bank accounts')
  })

  it('shows counts loaded from secureStorage', async () => {
    mockStorageGet.mockImplementation((key: string) => {
      if (key === 'checkList')
        return Promise.resolve(JSON.stringify([{ id: '1' }, { id: '2' }, { id: '3' }]))
      if (key === 'printchecks_receipts')
        return Promise.resolve(JSON.stringify([{ id: 'r1' }]))
      if (key === 'vendors')
        return Promise.resolve(JSON.stringify([{ id: 'v1' }, { id: 'v2' }]))
      if (key === 'bankAccounts')
        return Promise.resolve(JSON.stringify([{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }, { id: 'b4' }]))
      return Promise.resolve(null)
    })
    const wrapper = await mountView()
    const text = wrapper.text()
    expect(text).toContain('3 checks')
    expect(text).toContain('1 receipts')
    expect(text).toContain('2 vendors')
    expect(text).toContain('4 bank accounts')
  })
})

// ── Encryption toggle UI ──────────────────────────────────────────────────────

describe('encryption toggle UI', () => {
  it('shows "Encryption Disabled" alert by default', async () => {
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('Encryption Disabled')
  })

  it('reads encryption_enabled from localStorage on mount', async () => {
    localStorage.setItem('encryption_enabled', 'true')
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('Encryption Active')
  })

  it('shows export password field when exportEncrypted is checked', async () => {
    const wrapper = await mountView()
    const checkbox = wrapper.find('#exportEncrypted')
    await checkbox.setValue(true)
    expect(wrapper.find('#exportPassword').exists()).toBe(true)
  })

  it('hides export password field when exportEncrypted is unchecked', async () => {
    const wrapper = await mountView()
    const checkbox = wrapper.find('#exportEncrypted')
    await checkbox.setValue(true)
    await checkbox.setValue(false)
    expect(wrapper.find('#exportPassword').exists()).toBe(false)
  })
})

// ── onFileSelected: unencrypted JSON ─────────────────────────────────────────

describe('onFileSelected with unencrypted JSON', () => {
  it('populates importPreview with counts from file', async () => {
    const data = makeExportData({
      checks: [{ id: '1' }, { id: '2' }],
      receipts: [{ id: 'r1' }],
      payments: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }],
      vendors: [{ id: 'v1' }],
      bankAccounts: [],
    })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(data)))

    const text = wrapper.text()
    expect(text).toContain('Import Preview:')
    expect(text).toContain('2 checks')
    expect(text).toContain('1 receipts')
    expect(text).toContain('3 payment records')
    expect(text).toContain('1 vendors')
    expect(text).toContain('0 bank accounts')
  })

  it('does not show import password field for unencrypted file', async () => {
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(makeExportData())))
    expect(wrapper.find('#importPassword').exists()).toBe(false)
  })
})

// ── onFileSelected: encrypted JSON ───────────────────────────────────────────

describe('onFileSelected with encrypted JSON', () => {
  it('shows import password field when file is detected as encrypted', async () => {
    mockIsEncrypted.mockReturnValue(true)
    const encryptedContent = JSON.stringify({ encrypted: true, salt: 'abc', iv: 'def', data: 'xyz' })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(encryptedContent))
    expect(wrapper.find('#importPassword').exists()).toBe(true)
  })

  it('does not show importPreview for encrypted files (needs password first)', async () => {
    mockIsEncrypted.mockReturnValue(true)
    const encryptedContent = JSON.stringify({ encrypted: true, salt: 'abc', iv: 'def', data: 'xyz' })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(encryptedContent))
    expect(wrapper.text()).not.toContain('Import Preview:')
  })
})

// ── onFileSelected: invalid JSON ──────────────────────────────────────────────

describe('onFileSelected with invalid JSON', () => {
  it('sets importError for malformed JSON', async () => {
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile('not valid json { bad'))
    expect(wrapper.text()).toContain('Invalid import file format')
  })
})

// ── importData: button disabled state ────────────────────────────────────────

describe('importData button disabled', () => {
  it('import button is disabled when no file is selected', async () => {
    const wrapper = await mountView()
    const btn = wrapper.find('button.btn-success')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('import button is enabled after a valid file is selected', async () => {
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(makeExportData())))
    const btn = wrapper.find('button.btn-success')
    expect((btn.element as HTMLButtonElement).disabled).toBe(false)
  })
})

// ── importData: validation errors ────────────────────────────────────────────

describe('importData validation', () => {
  beforeEach(() => {
    vi.stubGlobal('confirm', () => true)
  })

  it('shows error when required fields are missing', async () => {
    const badData = { version: '1.0', exportDate: '2026-01-01' } // no checks/receipts/payments
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(badData)))
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()
    const text = wrapper.text()
    expect(text).toContain('Failed to import')
  })

  it('shows error when checks is not an array', async () => {
    const badData = makeExportData({ checks: 'not-an-array' })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(badData)))
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to import')
  })

  it('shows error when receipts is not an array', async () => {
    const badData = makeExportData({ receipts: { r: 1 } })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(badData)))
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to import')
  })

  it('shows error when vendors is present but not an array', async () => {
    const badData = makeExportData({ vendors: 'bad' })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(badData)))
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to import')
  })

  it('shows error when bankAccounts is present but not an array', async () => {
    const badData = makeExportData({ bankAccounts: 42 })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(badData)))
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Failed to import')
  })

  it('shows "Incorrect password" error when decrypt rejects with that message', async () => {
    mockIsEncrypted.mockReturnValue(true)
    mockDecrypt.mockRejectedValue(new Error('Incorrect password'))

    const encryptedContent = JSON.stringify({ encrypted: true, salt: 'a', iv: 'b', data: 'c' })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(encryptedContent))

    // Fill in a (wrong) password
    await wrapper.find('#importPassword').setValue('wrongpass')
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Incorrect password')
  })

  it('saves all data collections to secureStorage on successful import', async () => {
    const data = makeExportData({
      checks: [{ id: 'c1' }],
      receipts: [{ id: 'r1' }],
      payments: [{ id: 'p1' }],
      vendors: [{ id: 'v1' }],
      bankAccounts: [{ id: 'b1' }],
    })

    // Prevent page reload from throwing in jsdom
    vi.stubGlobal('location', { reload: vi.fn() })

    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(data)))
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()

    expect(mockStorageSet).toHaveBeenCalledWith('checkList', JSON.stringify(data.checks))
    expect(mockStorageSet).toHaveBeenCalledWith('printchecks_receipts', JSON.stringify(data.receipts))
    expect(mockStorageSet).toHaveBeenCalledWith('printchecks_payments', JSON.stringify(data.payments))
    expect(mockStorageSet).toHaveBeenCalledWith('vendors', JSON.stringify(data.vendors))
    expect(mockStorageSet).toHaveBeenCalledWith('bankAccounts', JSON.stringify(data.bankAccounts))
  })
})

// ── importData: cancelled by user ─────────────────────────────────────────────

describe('importData cancelled by confirm dialog', () => {
  it('does not import when user clicks Cancel in confirm dialog', async () => {
    vi.stubGlobal('confirm', () => false)
    const data = makeExportData({ checks: [{ id: 'c1' }], receipts: [], payments: [] })
    const wrapper = await mountView()
    await selectFile(wrapper, makeFile(JSON.stringify(data)))
    await wrapper.find('button.btn-success').trigger('click')
    await flushPromises()
    expect(mockStorageSet).not.toHaveBeenCalled()
  })
})
