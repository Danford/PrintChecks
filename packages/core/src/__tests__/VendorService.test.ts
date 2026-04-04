/**
 * Tests for VendorService — uses an in-memory StorageAdapter
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { VendorService } from '../services/VendorService'
import type { StorageAdapter } from '../storage/StorageAdapter'
import type { VendorData } from '../models/Vendor'

// ---------------------------------------------------------------------------
// In-memory StorageAdapter for testing
// ---------------------------------------------------------------------------
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
    for (const key of keys) {
      results.set(key, (this.store.get(key) as T) ?? null)
    }
    return results
  }

  async setMany(entries: Map<string, unknown>): Promise<void> {
    for (const [key, value] of entries) {
      this.store.set(key, value)
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function validVendorInput() {
  return {
    name: 'Acme Corp',
  }
}

// ---------------------------------------------------------------------------
// VendorService tests
// ---------------------------------------------------------------------------
describe('VendorService', () => {
  let storage: MemoryStorage
  let service: VendorService

  beforeEach(() => {
    storage = new MemoryStorage()
    service = new VendorService({ storage })
  })

  // --- createVendor ---

  it('creates a vendor with required fields', async () => {
    const vendor = await service.createVendor(validVendorInput())
    expect(vendor.id).toBeTruthy()
    expect(vendor.name).toBe('Acme Corp')
  })

  it('assigns id and timestamps on creation', async () => {
    const vendor = await service.createVendor(validVendorInput())
    expect(vendor.id).toBeTruthy()
    expect(vendor.createdAt).toBeTruthy()
    expect(vendor.updatedAt).toBeTruthy()
  })

  it('creates a vendor with optional fields', async () => {
    const vendor = await service.createVendor({
      name: 'Globex',
      email: 'info@globex.com',
      phone: '5125551234',
      category: 'Technology',
      tags: ['tech', 'preferred'],
    })
    expect(vendor.email).toBe('info@globex.com')
    expect(vendor.category).toBe('Technology')
    expect(vendor.tags).toEqual(['tech', 'preferred'])
  })

  it('throws for invalid vendor (missing name)', async () => {
    await expect(service.createVendor({ name: '' })).rejects.toThrow()
  })

  it('throws for invalid email format', async () => {
    await expect(
      service.createVendor({ name: 'Acme', email: 'not-an-email' })
    ).rejects.toThrow()
  })

  // --- getVendor ---

  it('retrieves a vendor by id', async () => {
    const created = await service.createVendor(validVendorInput())
    const found = await service.getVendor(created.id!)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
  })

  it('returns null for unknown id', async () => {
    const found = await service.getVendor('nonexistent-id')
    expect(found).toBeNull()
  })

  // --- getAllVendors ---

  it('returns empty array when no vendors exist', async () => {
    const vendors = await service.getAllVendors()
    expect(vendors).toHaveLength(0)
  })

  it('returns all created vendors', async () => {
    await service.createVendor({ name: 'Vendor A' })
    await service.createVendor({ name: 'Vendor B' })
    const vendors = await service.getAllVendors()
    expect(vendors).toHaveLength(2)
  })

  // --- getVendors / filtering ---

  it('returns all vendors when no filters applied', async () => {
    await service.createVendor({ name: 'Vendor A' })
    await service.createVendor({ name: 'Vendor B' })
    const vendors = await service.getVendors()
    expect(vendors).toHaveLength(2)
  })

  it('filters vendors by category', async () => {
    await service.createVendor({ name: 'Tech Corp', category: 'Technology' })
    await service.createVendor({ name: 'Office Supply Co', category: 'Office' })
    const tech = await service.getVendors({ category: 'Technology' })
    expect(tech).toHaveLength(1)
    expect(tech[0].name).toBe('Tech Corp')
  })

  it('filters vendors by searchTerm (name match)', async () => {
    await service.createVendor({ name: 'Acme Corp' })
    await service.createVendor({ name: 'Beta LLC' })
    const results = await service.getVendors({ searchTerm: 'acme' })
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Acme Corp')
  })

  it('filters vendors by searchTerm (email match)', async () => {
    await service.createVendor({ name: 'Acme', email: 'contact@acme.com' })
    await service.createVendor({ name: 'Beta' })
    const results = await service.getVendors({ searchTerm: 'acme.com' })
    expect(results).toHaveLength(1)
  })

  it('filters active vendors', async () => {
    await service.createVendor({ name: 'Active Vendor', isActive: true })
    await service.createVendor({ name: 'Inactive Vendor', isActive: false })
    const active = await service.getVendors({ isActive: true })
    expect(active.every((v) => v.isActive)).toBe(true)
  })

  it('filters favorite vendors', async () => {
    await service.createVendor({ name: 'Favorite', isFavorite: true })
    await service.createVendor({ name: 'Not Favorite', isFavorite: false })
    const favorites = await service.getVendors({ isFavorite: true })
    expect(favorites).toHaveLength(1)
    expect(favorites[0].name).toBe('Favorite')
  })

  // --- updateVendor ---

  it('updates a vendor field', async () => {
    const vendor = await service.createVendor(validVendorInput())
    const updated = await service.updateVendor(vendor.id!, { name: 'Renamed Corp' })
    expect(updated.name).toBe('Renamed Corp')
  })

  it('throws when updating a non-existent vendor', async () => {
    await expect(service.updateVendor('bad-id', { name: 'X' })).rejects.toThrow()
  })

  it('preserves id and createdAt when updating', async () => {
    const vendor = await service.createVendor(validVendorInput())
    const originalCreatedAt = vendor.createdAt
    const updated = await service.updateVendor(vendor.id!, { name: 'New Name' })
    expect(updated.id).toBe(vendor.id)
    expect(new Date(updated.createdAt!).toISOString()).toBe(new Date(originalCreatedAt!).toISOString())
  })

  // --- deleteVendor ---

  it('deletes a vendor', async () => {
    const vendor = await service.createVendor(validVendorInput())
    await service.deleteVendor(vendor.id!)
    const found = await service.getVendor(vendor.id!)
    expect(found).toBeNull()
  })

  // --- searchVendors ---

  it('searchVendors finds by name', async () => {
    await service.createVendor({ name: 'Zebra Industries' })
    await service.createVendor({ name: 'Alpha Ltd' })
    const results = await service.searchVendors('zebra')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Zebra Industries')
  })

  // --- getFavoriteVendors / getActiveVendors ---

  it('getFavoriteVendors returns only favorites', async () => {
    await service.createVendor({ name: 'Fav', isFavorite: true })
    await service.createVendor({ name: 'Not Fav', isFavorite: false })
    const favs = await service.getFavoriteVendors()
    expect(favs).toHaveLength(1)
    expect(favs[0].name).toBe('Fav')
  })

  it('getActiveVendors returns only active vendors', async () => {
    await service.createVendor({ name: 'Active', isActive: true })
    await service.createVendor({ name: 'Inactive', isActive: false })
    const active = await service.getActiveVendors()
    expect(active.every((v) => v.isActive)).toBe(true)
  })

  // --- getCategories / getTags ---

  it('getCategories returns sorted unique categories', async () => {
    await service.createVendor({ name: 'A', category: 'Zebra' })
    await service.createVendor({ name: 'B', category: 'Alpha' })
    await service.createVendor({ name: 'C', category: 'Zebra' }) // duplicate
    const cats = await service.getCategories()
    expect(cats).toEqual(['Alpha', 'Zebra'])
  })

  it('getTags returns sorted unique tags', async () => {
    await service.createVendor({ name: 'A', tags: ['preferred', 'local'] })
    await service.createVendor({ name: 'B', tags: ['local', 'urgent'] })
    const tags = await service.getTags()
    expect(tags).toEqual(['local', 'preferred', 'urgent'])
  })

  // --- toggleFavorite / toggleActive ---

  it('toggleFavorite flips isFavorite', async () => {
    const vendor = await service.createVendor({ name: 'V', isFavorite: false })
    const toggled = await service.toggleFavorite(vendor.id!)
    expect(toggled.isFavorite).toBe(true)
    const toggledBack = await service.toggleFavorite(vendor.id!)
    expect(toggledBack.isFavorite).toBe(false)
  })

  it('toggleActive flips isActive', async () => {
    const vendor = await service.createVendor({ name: 'V', isActive: true })
    const toggled = await service.toggleActive(vendor.id!)
    expect(toggled.isActive).toBe(false)
  })

  it('toggleFavorite throws for non-existent vendor', async () => {
    await expect(service.toggleFavorite('bad-id')).rejects.toThrow()
  })

  // --- addTag / removeTag ---

  it('addTag adds a tag to a vendor', async () => {
    const vendor = await service.createVendor({ name: 'V' })
    const updated = await service.addTag(vendor.id!, 'new-tag')
    expect(updated.tags).toContain('new-tag')
  })

  it('removeTag removes a tag from a vendor', async () => {
    const vendor = await service.createVendor({ name: 'V', tags: ['to-remove', 'keep'] })
    const updated = await service.removeTag(vendor.id!, 'to-remove')
    expect(updated.tags).not.toContain('to-remove')
    expect(updated.tags).toContain('keep')
  })

  // --- getStatistics ---

  it('getStatistics returns correct counts', async () => {
    await service.createVendor({ name: 'Active', isActive: true, isFavorite: true, category: 'Tech' })
    await service.createVendor({ name: 'Inactive', isActive: false, isFavorite: false, category: 'Tech' })
    const stats = await service.getStatistics()
    expect(stats.total).toBe(2)
    expect(stats.active).toBe(1)
    expect(stats.inactive).toBe(1)
    expect(stats.favorites).toBe(1)
    expect(stats.byCategory['Tech']).toBe(2)
  })

  // --- importVendors / exportVendors ---

  it('importVendors creates multiple vendors', async () => {
    const result = await service.importVendors([
      { name: 'Import A' } as unknown as VendorData,
      { name: 'Import B' } as unknown as VendorData,
    ])
    expect(result.success).toBe(2)
    expect(result.failed).toBe(0)
    expect(await service.getAllVendors()).toHaveLength(2)
  })

  it('exportVendors returns all vendor data', async () => {
    await service.createVendor({ name: 'Export Me' })
    const exported = await service.exportVendors()
    expect(exported).toHaveLength(1)
    expect(exported[0].name).toBe('Export Me')
  })

  // --- clearAll ---

  it('clearAll removes all vendors', async () => {
    await service.createVendor({ name: 'A' })
    await service.createVendor({ name: 'B' })
    await service.clearAll()
    expect(await service.getAllVendors()).toHaveLength(0)
  })

  // --- getVendorsByCategory ---

  it('getVendorsByCategory returns vendors for that category', async () => {
    await service.createVendor({ name: 'Tech A', category: 'Technology' })
    await service.createVendor({ name: 'Office A', category: 'Office' })
    const tech = await service.getVendorsByCategory('Technology')
    expect(tech).toHaveLength(1)
    expect(tech[0].name).toBe('Tech A')
  })
})
