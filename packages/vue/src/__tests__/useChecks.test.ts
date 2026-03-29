/**
 * Tests for useChecks composable
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useChecks } from '../composables/useChecks'
import type { StorageAdapter } from '@printchecks/core/storage'

class MemoryStorage implements StorageAdapter {
  private store = new Map<string, unknown>()
  async get<T = unknown>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null
  }
  async set<T = unknown>(key: string, value: T): Promise<void> {
    this.store.set(key, value)
  }
  async remove(key: string): Promise<void> {
    this.store.delete(key)
  }
  async clear(): Promise<void> {
    this.store.clear()
  }
  async keys(): Promise<string[]> {
    return Array.from(this.store.keys())
  }
  async has(key: string): Promise<boolean> {
    return this.store.has(key)
  }
  async getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()
    for (const key of keys) results.set(key, (this.store.get(key) as T) ?? null)
    return results
  }
  async setMany(entries: Map<string, unknown>): Promise<void> {
    for (const [k, v] of entries) this.store.set(k, v)
  }
}

function validCheckData() {
  return {
    checkNumber: '1001',
    date: '2026-01-15',
    payTo: 'Acme Corp',
    amount: '500.00',
    memo: '',
    signature: '',
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    bankAccountNumber: '123456789',
  }
}

describe('useChecks', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  // --- initial state ---

  it('starts with empty/null state', () => {
    const { currentCheck, checks, isLoading, error, hasUnsavedChanges } = useChecks({ storage })
    expect(currentCheck.value).toBeNull()
    expect(checks.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(hasUnsavedChanges.value).toBe(false)
  })

  it('isValid is false when no current check', () => {
    const { isValid } = useChecks({ storage })
    expect(isValid.value).toBe(false)
  })

  it('amountInWords is empty string when no current check', () => {
    const { amountInWords } = useChecks({ storage })
    expect(amountInWords.value).toBe('')
  })

  it('nextCheckNumber defaults to 1001 when no checks loaded', () => {
    const { nextCheckNumber } = useChecks({ storage })
    expect(nextCheckNumber.value).toBe('1001')
  })

  // --- createCheck ---

  it('createCheck sets currentCheck and clears error', async () => {
    const { createCheck, currentCheck, isLoading, error } = useChecks({ storage })
    const check = await createCheck(validCheckData())
    expect(check).toBeDefined()
    expect(check.checkNumber).toBe('1001')
    expect(currentCheck.value?.id).toBe(check.id)
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('createCheck sets error and rethrows on failure', async () => {
    const { createCheck, error } = useChecks({ storage })
    // Missing required fields → validation error
    await expect(createCheck({})).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  // --- loadChecks / loadCheck ---

  it('loadChecks populates checks array', async () => {
    const { createCheck, loadChecks, checks } = useChecks({ storage })
    await createCheck(validCheckData())
    await createCheck({ ...validCheckData(), checkNumber: '1002' })
    await loadChecks()
    expect(checks.value.length).toBe(2)
  })

  it('loadCheck sets currentCheck', async () => {
    const { createCheck, loadCheck, currentCheck, clearCurrentCheck } = useChecks({ storage })
    const created = await createCheck(validCheckData())
    clearCurrentCheck()
    expect(currentCheck.value).toBeNull()
    await loadCheck(created.id!)
    expect(currentCheck.value?.id).toBe(created.id)
  })

  it('loadCheck throws and sets error for unknown id', async () => {
    const { loadCheck, error } = useChecks({ storage })
    await expect(loadCheck('no-such-id')).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  // --- updateCheck ---

  it('updateCheck updates currentCheck', async () => {
    const { createCheck, updateCheck, currentCheck } = useChecks({ storage })
    await createCheck(validCheckData())
    await updateCheck({ payTo: 'New Payee' })
    expect(currentCheck.value?.payTo).toBe('New Payee')
  })

  it('updateCheck throws when no current check', async () => {
    const { updateCheck } = useChecks({ storage })
    await expect(updateCheck({ payTo: 'X' })).rejects.toThrow('No current check')
  })

  // --- deleteCheck ---

  it('deleteCheck removes check and clears currentCheck', async () => {
    const { createCheck, deleteCheck, loadChecks, checks, currentCheck } = useChecks({ storage })
    const check = await createCheck(validCheckData())
    await deleteCheck(check.id!)
    expect(currentCheck.value).toBeNull()
    await loadChecks()
    expect(checks.value.length).toBe(0)
  })

  it('deleteCheck does not clear currentCheck if different id', async () => {
    const { createCheck, deleteCheck, currentCheck } = useChecks({ storage })
    const c1 = await createCheck(validCheckData())
    const c2 = await createCheck({ ...validCheckData(), checkNumber: '1002' })
    // currentCheck is now c2; delete c1
    await deleteCheck(c1.id!)
    expect(currentCheck.value?.id).toBe(c2.id)
  })

  // --- saveCheck ---

  it('saveCheck returns true and clears unsaved changes', async () => {
    const { createCheck, saveCheck, hasUnsavedChanges } = useChecks({ storage })
    await createCheck(validCheckData())
    const result = await saveCheck()
    expect(result).toBe(true)
    expect(hasUnsavedChanges.value).toBe(false)
  })

  it('saveCheck returns false when no current check', async () => {
    const { saveCheck } = useChecks({ storage })
    const result = await saveCheck()
    expect(result).toBe(false)
  })

  // --- markAsPrinted ---

  it('markAsPrinted updates currentCheck printed status', async () => {
    const { createCheck, markAsPrinted, currentCheck } = useChecks({ storage })
    await createCheck(validCheckData())
    await markAsPrinted()
    expect(currentCheck.value?.isPrinted).toBe(true)
  })

  it('markAsPrinted throws when no current check', async () => {
    const { markAsPrinted } = useChecks({ storage })
    await expect(markAsPrinted()).rejects.toThrow('No current check')
  })

  // --- voidCheck ---

  it('voidCheck marks check as void', async () => {
    const { createCheck, voidCheck, currentCheck } = useChecks({ storage })
    await createCheck(validCheckData())
    await voidCheck('duplicate')
    expect(currentCheck.value?.isVoid).toBe(true)
  })

  it('voidCheck throws when no current check', async () => {
    const { voidCheck } = useChecks({ storage })
    await expect(voidCheck()).rejects.toThrow('No current check')
  })

  // --- duplicateCheck ---

  it('duplicateCheck creates a new check', async () => {
    const { createCheck, duplicateCheck, currentCheck } = useChecks({ storage })
    const original = await createCheck(validCheckData())
    const dup = await duplicateCheck('9999')
    expect(dup.id).not.toBe(original.id)
    expect(currentCheck.value?.id).toBe(dup.id)
  })

  it('duplicateCheck throws when no current check', async () => {
    const { duplicateCheck } = useChecks({ storage })
    await expect(duplicateCheck()).rejects.toThrow('No current check')
  })

  // --- validateCheck ---

  it('validateCheck returns true for valid check', async () => {
    const { createCheck, validateCheck } = useChecks({ storage })
    await createCheck(validCheckData())
    expect(validateCheck()).toBe(true)
  })

  it('validateCheck returns false and sets error for invalid check', async () => {
    // updateCheck validates via service so we can't set payTo='' through it.
    // Directly mutate the reactive check object to produce an invalid state.
    const { createCheck, validateCheck, error, currentCheck } = useChecks({ storage })
    await createCheck(validCheckData())
    currentCheck.value!.payTo = ''
    const valid = validateCheck()
    expect(valid).toBe(false)
    expect(error.value).toBeTruthy()
  })

  it('validateCheck returns false when no current check', () => {
    const { validateCheck } = useChecks({ storage })
    expect(validateCheck()).toBe(false)
  })

  // --- clearCurrentCheck ---

  it('clearCurrentCheck resets state', async () => {
    const { createCheck, clearCurrentCheck, currentCheck, hasUnsavedChanges, error } =
      useChecks({ storage })
    await createCheck(validCheckData())
    clearCurrentCheck()
    expect(currentCheck.value).toBeNull()
    expect(hasUnsavedChanges.value).toBe(false)
    expect(error.value).toBeNull()
  })

  // --- computed: nextCheckNumber ---

  it('nextCheckNumber returns max+1 after loading checks', async () => {
    const { createCheck, loadChecks, nextCheckNumber } = useChecks({ storage })
    await createCheck({ ...validCheckData(), checkNumber: '2000' })
    await createCheck({ ...validCheckData(), checkNumber: '2005' })
    await loadChecks()
    expect(nextCheckNumber.value).toBe('2006')
  })

  // --- computed: amountInWords ---

  it('amountInWords returns word representation of amount', async () => {
    const { createCheck, amountInWords } = useChecks({ storage })
    await createCheck({ ...validCheckData(), amount: 100 })
    expect(amountInWords.value.toLowerCase()).toContain('hundred')
  })

  // --- autoLoad ---

  it('autoLoad option triggers loadChecks on init', async () => {
    const { createCheck } = useChecks({ storage })
    await createCheck(validCheckData())

    const { checks } = useChecks({ storage, autoLoad: true })
    await new Promise((r) => setTimeout(r, 0))
    expect(checks.value.length).toBe(1)
  })
})
