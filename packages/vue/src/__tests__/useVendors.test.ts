/**
 * Tests for useVendors composable
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useVendors } from '../composables/useVendors'
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
    for (const k of keys) results.set(k, (this.store.get(k) as T) ?? null)
    return results
  }
  async setMany(entries: Map<string, unknown>): Promise<void> {
    for (const [k, v] of entries) this.store.set(k, v)
  }
}

// VendorData only requires `name`; all other fields are optional
function validVendorData(overrides: Record<string, unknown> = {}) {
  return { name: 'Acme Corp', ...overrides }
}

describe('useVendors', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  // --- initial state ---

  it('starts with empty/null state', () => {
    const { currentVendor, vendors, isLoading, error } = useVendors({ storage })
    expect(currentVendor.value).toBeNull()
    expect(vendors.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('vendorCount is 0 initially', () => {
    const { vendorCount } = useVendors({ storage })
    expect(vendorCount.value).toBe(0)
  })

  it('favoriteVendors is empty initially', () => {
    const { favoriteVendors } = useVendors({ storage })
    expect(favoriteVendors.value).toEqual([])
  })

  // --- createVendor ---

  it('createVendor sets currentVendor and loads vendors list', async () => {
    const { createVendor, currentVendor, vendors } = useVendors({ storage })
    const vendor = await createVendor(validVendorData())
    expect(vendor.name).toBe('Acme Corp')
    expect(currentVendor.value?.id).toBe(vendor.id)
    expect(vendors.value.length).toBe(1)
  })

  it('createVendor sets error and rethrows on failure', async () => {
    const bad = new MemoryStorage()
    vi.spyOn(bad, 'set').mockRejectedValue(new Error('write error'))
    const { createVendor, error } = useVendors({ storage: bad })
    await expect(createVendor(validVendorData())).rejects.toThrow('write error')
    expect(error.value).toBe('write error')
  })

  // --- loadVendors / loadVendor ---

  it('loadVendors populates vendors array', async () => {
    const { createVendor, loadVendors, vendors } = useVendors({ storage })
    await createVendor(validVendorData())
    await createVendor(validVendorData({ name: 'Beta LLC' }))
    await loadVendors()
    expect(vendors.value.length).toBe(2)
  })

  it('loadVendor sets currentVendor', async () => {
    const { createVendor, loadVendor, currentVendor, clearCurrentVendor } = useVendors({ storage })
    const v = await createVendor(validVendorData())
    clearCurrentVendor()
    await loadVendor(v.id!)
    expect(currentVendor.value?.id).toBe(v.id)
  })

  it('loadVendor throws and sets error for unknown id', async () => {
    const { loadVendor, error } = useVendors({ storage })
    await expect(loadVendor('no-such-id')).rejects.toThrow()
    expect(error.value).toBeTruthy()
  })

  // --- vendorCount and favoriteVendors computed ---

  it('vendorCount reflects loaded vendors', async () => {
    const { createVendor, loadVendors, vendorCount } = useVendors({ storage })
    await createVendor(validVendorData())
    await createVendor(validVendorData({ name: 'Beta' }))
    await loadVendors()
    expect(vendorCount.value).toBe(2)
  })

  it('favoriteVendors filters favorites', async () => {
    const { createVendor, loadVendors, favoriteVendors } = useVendors({ storage })
    await createVendor(validVendorData({ isFavorite: false }))
    await createVendor(validVendorData({ name: 'Fave', isFavorite: true }))
    await loadVendors()
    expect(favoriteVendors.value.length).toBe(1)
    expect(favoriteVendors.value[0].name).toBe('Fave')
  })

  // --- updateVendor ---

  it('updateVendor updates data and refreshes list', async () => {
    const { createVendor, updateVendor, vendors } = useVendors({ storage })
    const v = await createVendor(validVendorData())
    const updated = await updateVendor(v.id!, { name: 'Updated Corp' })
    expect(updated.name).toBe('Updated Corp')
    expect(vendors.value.find((x) => x.id === v.id)?.name).toBe('Updated Corp')
  })

  it('updateVendor also updates currentVendor when ids match', async () => {
    const { createVendor, updateVendor, currentVendor } = useVendors({ storage })
    const v = await createVendor(validVendorData())
    await updateVendor(v.id!, { name: 'Changed' })
    expect(currentVendor.value?.name).toBe('Changed')
  })

  // --- deleteVendor ---

  it('deleteVendor removes vendor and clears currentVendor if same', async () => {
    const { createVendor, deleteVendor, vendors, currentVendor } = useVendors({ storage })
    const v = await createVendor(validVendorData())
    await deleteVendor(v.id!)
    expect(currentVendor.value).toBeNull()
    expect(vendors.value.length).toBe(0)
  })

  it('deleteVendor does not clear currentVendor if different id', async () => {
    const { createVendor, deleteVendor, currentVendor } = useVendors({ storage })
    const v1 = await createVendor(validVendorData())
    const v2 = await createVendor(validVendorData({ name: 'Beta' }))
    await deleteVendor(v1.id!)
    expect(currentVendor.value?.id).toBe(v2.id)
  })

  // --- searchVendors ---

  it('searchVendors returns matching vendors', async () => {
    const { createVendor, searchVendors } = useVendors({ storage })
    await createVendor(validVendorData())
    await createVendor(validVendorData({ name: 'Beta LLC' }))
    const results = await searchVendors('Acme')
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Acme Corp')
  })

  it('searchVendors sets error and rethrows on failure', async () => {
    const bad = new MemoryStorage()
    // getAllVendors calls storage.get; mock it to throw
    vi.spyOn(bad, 'get').mockRejectedValue(new Error('read error'))
    const { searchVendors, error } = useVendors({ storage: bad })
    await expect(searchVendors('x')).rejects.toThrow('read error')
    expect(error.value).toBe('read error')
  })

  // --- toggleFavorite ---

  it('toggleFavorite flips isFavorite flag', async () => {
    const { createVendor, toggleFavorite, vendors } = useVendors({ storage })
    const v = await createVendor(validVendorData({ isFavorite: false }))
    await toggleFavorite(v.id!)
    expect(vendors.value.find((x) => x.id === v.id)?.isFavorite).toBe(true)
  })

  it('toggleFavorite updates currentVendor when ids match', async () => {
    const { createVendor, toggleFavorite, currentVendor } = useVendors({ storage })
    const v = await createVendor(validVendorData({ isFavorite: false }))
    await toggleFavorite(v.id!)
    expect(currentVendor.value?.isFavorite).toBe(true)
  })

  // --- addTag / removeTag ---

  it('addTag adds a tag to a vendor', async () => {
    const { createVendor, addTag, vendors } = useVendors({ storage })
    const v = await createVendor(validVendorData({ tags: [] }))
    await addTag(v.id!, 'important')
    expect(vendors.value.find((x) => x.id === v.id)?.tags).toContain('important')
  })

  it('removeTag removes a tag from a vendor', async () => {
    const { createVendor, addTag, removeTag, vendors } = useVendors({ storage })
    const v = await createVendor(validVendorData({ tags: [] }))
    await addTag(v.id!, 'important')
    await removeTag(v.id!, 'important')
    expect(vendors.value.find((x) => x.id === v.id)?.tags).not.toContain('important')
  })

  it('addTag throws for unknown vendor id', async () => {
    const { addTag } = useVendors({ storage })
    await expect(addTag('no-such-id', 'x')).rejects.toThrow('Vendor not found')
  })

  // --- clearCurrentVendor ---

  it('clearCurrentVendor resets state', async () => {
    const { createVendor, clearCurrentVendor, currentVendor, error } = useVendors({ storage })
    await createVendor(validVendorData())
    clearCurrentVendor()
    expect(currentVendor.value).toBeNull()
    expect(error.value).toBeNull()
  })

  // --- autoLoad ---

  it('autoLoad triggers loadVendors on init', async () => {
    const { createVendor } = useVendors({ storage })
    await createVendor(validVendorData())
    const { vendors } = useVendors({ storage, autoLoad: true })
    await new Promise((r) => setTimeout(r, 0))
    expect(vendors.value.length).toBe(1)
  })
})
