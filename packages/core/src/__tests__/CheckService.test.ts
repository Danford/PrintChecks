/**
 * Tests for CheckService — uses an in-memory StorageAdapter
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { CheckService } from '../services/CheckService'
import type { StorageAdapter } from '../storage/StorageAdapter'
import type { CheckData } from '../models/Check'

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
function validCheckInput() {
  return {
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    bankAccountNumber: '123456789',
    checkNumber: '1001',
    date: '2026-01-15',
    amount: '500.00',
    payTo: 'Acme Corp',
    memo: '',
    signature: '',
  }
}

// ---------------------------------------------------------------------------
// CheckService tests
// ---------------------------------------------------------------------------
describe('CheckService', () => {
  let storage: MemoryStorage
  let service: CheckService

  beforeEach(() => {
    storage = new MemoryStorage()
    service = new CheckService({ storage })
  })

  // --- createCheck ---

  it('creates a valid check and persists it', async () => {
    const check = await service.createCheck(validCheckInput())
    expect(check.id).toBeTruthy()
    expect(check.payTo).toBe('Acme Corp')
    expect(check.status).toBe('draft')
  })

  it('auto-sets amountInWords when amount provided', async () => {
    const check = await service.createCheck(validCheckInput())
    expect(check.amountInWords).toBeTruthy()
    expect(check.amountInWords).toMatch(/dollar/i)
  })

  it('auto-generates check number when not provided and autoIncrement enabled', async () => {
    const input = { ...validCheckInput() }
    delete (input as Partial<typeof input>).checkNumber
    const check = await service.createCheck(input)
    expect(check.checkNumber).toBeTruthy()
  })

  it('throws for invalid check data', async () => {
    await expect(
      service.createCheck({ ...validCheckInput(), routingNumber: '123456789' })
    ).rejects.toThrow(/validation failed/i)
  })

  // --- getCheck ---

  it('retrieves a check by id', async () => {
    const created = await service.createCheck(validCheckInput())
    const found = await service.getCheck(created.id!)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(created.id)
  })

  it('returns null for unknown id', async () => {
    const found = await service.getCheck('nonexistent-id')
    expect(found).toBeNull()
  })

  // --- getAllChecks ---

  it('returns empty array when no checks exist', async () => {
    const checks = await service.getAllChecks()
    expect(checks).toHaveLength(0)
  })

  it('returns all created checks', async () => {
    await service.createCheck({ ...validCheckInput(), checkNumber: '1001' })
    await service.createCheck({ ...validCheckInput(), checkNumber: '1002' })
    const checks = await service.getAllChecks()
    expect(checks).toHaveLength(2)
  })

  // --- getChecks with filters ---

  it('filters by status', async () => {
    const check = await service.createCheck(validCheckInput())
    await service.markAsPrinted(check.id!)

    const printed = await service.getChecks({ status: 'printed' })
    const draft = await service.getChecks({ status: 'draft' })
    expect(printed).toHaveLength(1)
    expect(draft).toHaveLength(0)
  })

  it('filters by searchTerm (payTo)', async () => {
    await service.createCheck({ ...validCheckInput(), payTo: 'Acme Corp' })
    await service.createCheck({ ...validCheckInput(), checkNumber: '1002', payTo: 'Widgets Inc' })

    const results = await service.getChecks({ searchTerm: 'acme' })
    expect(results).toHaveLength(1)
    expect(results[0].payTo).toBe('Acme Corp')
  })

  it('filters by amount range', async () => {
    await service.createCheck({ ...validCheckInput(), amount: '100.00', checkNumber: '1001' })
    await service.createCheck({ ...validCheckInput(), amount: '500.00', checkNumber: '1002' })
    await service.createCheck({ ...validCheckInput(), amount: '999.00', checkNumber: '1003' })

    const results = await service.getChecks({ minAmount: 200, maxAmount: 600 })
    expect(results).toHaveLength(1)
    expect(results[0].amount).toBe('500.00')
  })

  // --- updateCheck ---

  it('updates an existing check', async () => {
    const check = await service.createCheck(validCheckInput())
    const updated = await service.updateCheck(check.id!, { memo: 'Updated memo' })
    expect(updated.memo).toBe('Updated memo')
  })

  it('recalculates amountInWords when amount changes', async () => {
    const check = await service.createCheck(validCheckInput())
    const oldWords = check.amountInWords
    const updated = await service.updateCheck(check.id!, { amount: '1000.00' })
    expect(updated.amountInWords).not.toBe(oldWords)
    expect(updated.amountInWords).toMatch(/thousand/i)
  })

  it('throws when updating non-existent check', async () => {
    await expect(service.updateCheck('bad-id', { memo: 'x' })).rejects.toThrow(/not found/i)
  })

  it('cannot overwrite id via update', async () => {
    const check = await service.createCheck(validCheckInput())
    const originalId = check.id!
    await service.updateCheck(originalId, { id: 'injected-id' } as Partial<CheckData>)
    const found = await service.getCheck(originalId)
    expect(found).not.toBeNull()
  })

  // --- deleteCheck ---

  it('deletes a check by id', async () => {
    const check = await service.createCheck(validCheckInput())
    await service.deleteCheck(check.id!)
    const found = await service.getCheck(check.id!)
    expect(found).toBeNull()
  })

  it('is a no-op deleting a non-existent id', async () => {
    await expect(service.deleteCheck('nonexistent')).resolves.not.toThrow()
  })

  // --- markAsPrinted ---

  it('marks a check as printed', async () => {
    const check = await service.createCheck(validCheckInput())
    const printed = await service.markAsPrinted(check.id!)
    expect(printed.isPrinted).toBe(true)
    expect(printed.status).toBe('printed')
    expect(printed.printedAt).toBeInstanceOf(Date)
  })

  it('throws when trying to print a voided check', async () => {
    const check = await service.createCheck(validCheckInput())
    await service.voidCheck(check.id!, 'test reason')
    await expect(service.markAsPrinted(check.id!)).rejects.toThrow(/void/i)
  })

  it('throws when trying to print an already-printed check', async () => {
    const check = await service.createCheck(validCheckInput())
    await service.markAsPrinted(check.id!)
    await expect(service.markAsPrinted(check.id!)).rejects.toThrow(/cannot be printed/i)
  })

  it('throws when marking non-existent check as printed', async () => {
    await expect(service.markAsPrinted('bad-id')).rejects.toThrow(/not found/i)
  })

  // --- voidCheck ---

  it('voids a check with a reason', async () => {
    const check = await service.createCheck(validCheckInput())
    const voided = await service.voidCheck(check.id!, 'duplicate payment')
    expect(voided.isVoid).toBe(true)
    expect(voided.status).toBe('void')
    expect(voided.voidReason).toBe('duplicate payment')
  })

  it('throws when trying to void an already-voided check', async () => {
    const check = await service.createCheck(validCheckInput())
    await service.voidCheck(check.id!)
    await expect(service.voidCheck(check.id!)).rejects.toThrow(/cannot be voided/i)
  })

  it('throws when voiding non-existent check', async () => {
    await expect(service.voidCheck('bad-id')).rejects.toThrow(/not found/i)
  })

  // --- duplicateCheck ---

  it('duplicates a check with a new check number', async () => {
    const check = await service.createCheck(validCheckInput())
    const dup = await service.duplicateCheck(check.id!, '2001')
    expect(dup.id).not.toBe(check.id)
    expect(dup.checkNumber).toBe('2001')
    expect(dup.payTo).toBe(check.payTo)
    expect(dup.amount).toBe(check.amount)
    expect(dup.isPrinted).toBe(false)
    expect(dup.isVoid).toBe(false)
    expect(dup.status).toBe('draft')
  })

  it('throws when duplicating non-existent check', async () => {
    await expect(service.duplicateCheck('bad-id')).rejects.toThrow(/not found/i)
  })

  // --- getNextCheckNumber ---

  it('returns 1000 when no checks exist', async () => {
    const next = await service.getNextCheckNumber()
    expect(next).toBe('1000')
  })

  it('returns max numeric check number + 1', async () => {
    await service.createCheck({ ...validCheckInput(), checkNumber: '1005' })
    await service.createCheck({ ...validCheckInput(), checkNumber: '1002' })
    const next = await service.getNextCheckNumber()
    expect(next).toBe('1006')
  })

  it('returns 1000 when all checks have non-numeric numbers', async () => {
    await service.createCheck({ ...validCheckInput(), checkNumber: 'VOIDED' })
    const next = await service.getNextCheckNumber()
    expect(next).toBe('1000')
  })

  // --- getStatistics ---

  it('returns correct statistics', async () => {
    const c1 = await service.createCheck({ ...validCheckInput(), checkNumber: '1001', amount: '100.00' })
    const c2 = await service.createCheck({ ...validCheckInput(), checkNumber: '1002', amount: '200.00' })
    await service.markAsPrinted(c1.id!)
    await service.voidCheck(c2.id!)

    const stats = await service.getStatistics()
    expect(stats.total).toBe(2)
    expect(stats.printed).toBe(1)
    expect(stats.void).toBe(1)
    // voided check excluded from totalAmount
    expect(stats.totalAmount).toBeCloseTo(100)
  })

  it('returns zero stats for empty storage', async () => {
    const stats = await service.getStatistics()
    expect(stats.total).toBe(0)
    expect(stats.totalAmount).toBe(0)
  })

  // --- loadFromRecentCheck ---

  it('returns null when no checks exist', async () => {
    const recent = await service.loadFromRecentCheck()
    expect(recent).toBeNull()
  })

  it('returns pre-fill fields from most recent check', async () => {
    await service.createCheck({ ...validCheckInput(), checkNumber: '1001' })
    await service.createCheck({
      ...validCheckInput(),
      checkNumber: '1002',
      bankName: 'Second Bank',
    })
    const recent = await service.loadFromRecentCheck()
    expect(recent).not.toBeNull()
    expect(recent!.bankName).toBe('Second Bank')
    expect(recent!.routingNumber).toBe('021000021')
    // Should NOT expose check-specific fields
    expect(recent!.payTo).toBeUndefined()
    expect(recent!.amount).toBeUndefined()
  })

  // --- clearAll ---

  it('removes all checks from storage', async () => {
    await service.createCheck({ ...validCheckInput(), checkNumber: '1001' })
    await service.createCheck({ ...validCheckInput(), checkNumber: '1002' })
    await service.clearAll()
    const checks = await service.getAllChecks()
    expect(checks).toHaveLength(0)
  })
})
