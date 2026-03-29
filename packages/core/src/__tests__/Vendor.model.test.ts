/**
 * Unit tests for the Vendor model class
 */
import { describe, expect, it } from 'vitest'

import { Vendor } from '../models/Vendor'
import type { VendorData } from '../models/Vendor'

// ── Helpers ───────────────────────────────────────────────────────────────────

function minimal(overrides: Partial<VendorData> = {}): VendorData {
  return {
    name: 'Acme Supplies',
    address: '10 Commerce Blvd',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    ...overrides,
  }
}

// ── Constructor ───────────────────────────────────────────────────────────────

describe('Vendor constructor', () => {
  it('assigns all supplied fields', () => {
    const v = new Vendor(minimal({ email: 'a@b.com', notes: 'net 30' }))
    expect(v.name).toBe('Acme Supplies')
    expect(v.email).toBe('a@b.com')
    expect(v.notes).toBe('net 30')
  })

  it('auto-generates an id when none is provided', () => {
    const v = new Vendor(minimal())
    expect(v.id).toBeTruthy()
    expect(typeof v.id).toBe('string')
  })

  it('preserves an existing id', () => {
    const v = new Vendor(minimal({ id: 'fixed-id' }))
    expect(v.id).toBe('fixed-id')
  })

  it('generates unique ids across multiple instances', () => {
    const a = new Vendor(minimal())
    const b = new Vendor(minimal())
    expect(a.id).not.toBe(b.id)
  })

  it('auto-sets createdAt when not provided', () => {
    const v = new Vendor(minimal())
    expect(v.createdAt).toBeInstanceOf(Date)
  })

  it('preserves an existing createdAt', () => {
    const created = new Date('2024-06-01T00:00:00Z')
    const v = new Vendor(minimal({ createdAt: created }))
    expect(v.createdAt).toEqual(created)
  })

  it('always sets updatedAt on construction', () => {
    const v = new Vendor(minimal())
    expect(v.updatedAt).toBeInstanceOf(Date)
  })

  it('defaults isActive to true when not provided', () => {
    const v = new Vendor(minimal())
    expect(v.isActive).toBe(true)
  })

  it('defaults isActive to true when isActive is undefined', () => {
    const v = new Vendor(minimal({ isActive: undefined }))
    expect(v.isActive).toBe(true)
  })

  it('keeps isActive=false when explicitly set to false', () => {
    const v = new Vendor(minimal({ isActive: false }))
    expect(v.isActive).toBe(false)
  })

  it('defaults tags to an empty array when not provided', () => {
    const v = new Vendor(minimal())
    expect(v.tags).toEqual([])
  })

  it('preserves a provided tags array', () => {
    const v = new Vendor(minimal({ tags: ['preferred', 'net-30'] }))
    expect(v.tags).toEqual(['preferred', 'net-30'])
  })
})

// ── validate() ────────────────────────────────────────────────────────────────

describe('validate()', () => {
  it('passes for a minimal valid vendor (name only required)', () => {
    const v = new Vendor(minimal())
    const { isValid, errors } = v.validate()
    expect(isValid).toBe(true)
    expect(errors).toHaveLength(0)
  })

  it('fails when name is empty', () => {
    const v = new Vendor(minimal({ name: '' }))
    const { isValid, errors } = v.validate()
    expect(isValid).toBe(false)
    expect(errors.some((e) => /name/i.test(e))).toBe(true)
  })

  it('fails when name is whitespace only', () => {
    const v = new Vendor(minimal({ name: '   ' }))
    expect(v.validate().isValid).toBe(false)
  })

  it('passes when email is a valid address', () => {
    const v = new Vendor(minimal({ email: 'vendor@example.com' }))
    expect(v.validate().isValid).toBe(true)
  })

  it('fails when email is malformed', () => {
    const v = new Vendor(minimal({ email: 'not-an-email' }))
    const { isValid, errors } = v.validate()
    expect(isValid).toBe(false)
    expect(errors.some((e) => /email/i.test(e))).toBe(true)
  })

  it('passes when phone has standard US formatting', () => {
    const v = new Vendor(minimal({ phone: '(555) 867-5309' }))
    expect(v.validate().isValid).toBe(true)
  })

  it('passes for an international phone number with + prefix', () => {
    const v = new Vendor(minimal({ phone: '+15558675309' }))
    expect(v.validate().isValid).toBe(true)
  })

  it('fails when phone has too few digits', () => {
    const v = new Vendor(minimal({ phone: '123' }))
    const { isValid, errors } = v.validate()
    expect(isValid).toBe(false)
    expect(errors.some((e) => /phone/i.test(e))).toBe(true)
  })

  it('fails when phone contains letters', () => {
    const v = new Vendor(minimal({ phone: 'CALL-US-NOW' }))
    expect(v.validate().isValid).toBe(false)
  })

  it('passes when website is a valid URL', () => {
    const v = new Vendor(minimal({ website: 'https://example.com' }))
    expect(v.validate().isValid).toBe(true)
  })

  it('fails when website lacks a scheme (not a valid URL)', () => {
    const v = new Vendor(minimal({ website: 'example.com' }))
    const { isValid, errors } = v.validate()
    expect(isValid).toBe(false)
    expect(errors.some((e) => /website/i.test(e))).toBe(true)
  })

  it('fails when website is not a URL at all', () => {
    const v = new Vendor(minimal({ website: 'not a url' }))
    expect(v.validate().isValid).toBe(false)
  })

  it('accumulates multiple errors at once', () => {
    const v = new Vendor(minimal({ name: '', email: 'bad', phone: '1' }))
    const { isValid, errors } = v.validate()
    expect(isValid).toBe(false)
    expect(errors.length).toBeGreaterThanOrEqual(3)
  })

  it('skips email/phone/website validation when those fields are absent', () => {
    // No email, phone, or website provided — only name required
    const v = new Vendor({ name: 'Solo', address: '', city: '', state: '', zip: '' })
    expect(v.validate().isValid).toBe(true)
  })
})

// ── getFullAddress() ─────────────────────────────────────────────────────────

describe('getFullAddress()', () => {
  it('joins all address parts with ", "', () => {
    const v = new Vendor(minimal({ country: 'USA' }))
    expect(v.getFullAddress()).toBe('10 Commerce Blvd, Dallas, TX, 75201, USA')
  })

  it('filters out empty address parts', () => {
    const v = new Vendor(minimal({ city: '', zip: '' }))
    expect(v.getFullAddress()).toBe('10 Commerce Blvd, TX')
  })

  it('returns an empty string when all address parts are empty', () => {
    const v = new Vendor({ name: 'Solo', address: '', city: '', state: '', zip: '' })
    expect(v.getFullAddress()).toBe('')
  })
})

// ── getDisplayName() ─────────────────────────────────────────────────────────

describe('getDisplayName()', () => {
  it('returns displayName when set', () => {
    const v = new Vendor(minimal({ displayName: 'Acme (Preferred)' }))
    expect(v.getDisplayName()).toBe('Acme (Preferred)')
  })

  it('falls back to name when displayName is absent', () => {
    const v = new Vendor(minimal())
    expect(v.getDisplayName()).toBe('Acme Supplies')
  })
})

// ── addTag() ─────────────────────────────────────────────────────────────────

describe('addTag()', () => {
  it('adds a new tag to the list', () => {
    const v = new Vendor(minimal())
    v.addTag('preferred')
    expect(v.tags).toContain('preferred')
  })

  it('does not add a duplicate tag', () => {
    const v = new Vendor(minimal({ tags: ['preferred'] }))
    v.addTag('preferred')
    expect(v.tags?.filter((t) => t === 'preferred')).toHaveLength(1)
  })

  it('updates updatedAt when a new tag is added', () => {
    const v = new Vendor(minimal())
    const before = v.updatedAt
    v.addTag('new-tag')
    expect(v.updatedAt!.getTime()).toBeGreaterThanOrEqual(before!.getTime())
  })

  it('does not update updatedAt for a duplicate tag', () => {
    const v = new Vendor(minimal({ tags: ['existing'] }))
    const before = v.updatedAt
    v.addTag('existing')
    // updatedAt is unchanged because the tag was not actually added
    expect(v.updatedAt).toEqual(before)
  })

  it('works when tags was initially undefined (constructor defaults to [])', () => {
    const v = new Vendor(minimal())
    v.addTag('first')
    expect(v.tags).toEqual(['first'])
  })
})

// ── removeTag() ──────────────────────────────────────────────────────────────

describe('removeTag()', () => {
  it('removes an existing tag', () => {
    const v = new Vendor(minimal({ tags: ['a', 'b', 'c'] }))
    v.removeTag('b')
    expect(v.tags).toEqual(['a', 'c'])
  })

  it('is a no-op when the tag does not exist', () => {
    const v = new Vendor(minimal({ tags: ['a'] }))
    v.removeTag('missing')
    expect(v.tags).toEqual(['a'])
  })

  it('updates updatedAt when a tag is removed', () => {
    const v = new Vendor(minimal({ tags: ['x'] }))
    const before = v.updatedAt
    v.removeTag('x')
    expect(v.updatedAt!.getTime()).toBeGreaterThanOrEqual(before!.getTime())
  })
})

// ── hasTag() ─────────────────────────────────────────────────────────────────

describe('hasTag()', () => {
  it('returns true when the vendor has the tag', () => {
    const v = new Vendor(minimal({ tags: ['vip'] }))
    expect(v.hasTag('vip')).toBe(true)
  })

  it('returns false when the vendor does not have the tag', () => {
    const v = new Vendor(minimal({ tags: ['vip'] }))
    expect(v.hasTag('other')).toBe(false)
  })

  it('returns false when the tags array is empty', () => {
    const v = new Vendor(minimal())
    expect(v.hasTag('anything')).toBe(false)
  })
})

// ── toJSON() ─────────────────────────────────────────────────────────────────

describe('toJSON()', () => {
  it('returns a plain object, not a Vendor instance', () => {
    const json = new Vendor(minimal()).toJSON()
    expect(json).not.toBeInstanceOf(Vendor)
  })

  it('includes all VendorData fields', () => {
    const v = new Vendor(
      minimal({
        id: 'v-1',
        displayName: 'Acme (Short)',
        country: 'USA',
        email: 'x@x.com',
        phone: '5558675309',
        fax: '5559999999',
        website: 'https://acme.com',
        taxId: 'TX-123',
        businessNumber: 'BN-456',
        accountNumber: 'AN-789',
        paymentTerms: 'Net 30',
        preferredPaymentMethod: 'check',
        category: 'supplies',
        tags: ['preferred'],
        notes: 'reliable',
        isActive: true,
        isFavorite: true,
      })
    )
    const json = v.toJSON()
    expect(json.id).toBe('v-1')
    expect(json.name).toBe('Acme Supplies')
    expect(json.displayName).toBe('Acme (Short)')
    expect(json.email).toBe('x@x.com')
    expect(json.taxId).toBe('TX-123')
    expect(json.tags).toEqual(['preferred'])
    expect(json.isActive).toBe(true)
    expect(json.isFavorite).toBe(true)
  })

  it('reflects tags mutated via addTag() and removeTag()', () => {
    const v = new Vendor(minimal({ tags: ['a', 'b'] }))
    v.addTag('c')
    v.removeTag('a')
    const json = v.toJSON()
    expect(json.tags).toEqual(['b', 'c'])
  })
})

// ── Vendor.fromJSON() ─────────────────────────────────────────────────────────

describe('Vendor.fromJSON()', () => {
  it('creates a Vendor instance', () => {
    expect(Vendor.fromJSON(minimal())).toBeInstanceOf(Vendor)
  })

  it('round-trips through toJSON(): fromJSON(toJSON()) is equivalent', () => {
    const original = new Vendor(
      minimal({ id: 'round-trip', notes: 'test', tags: ['x', 'y'] })
    )
    const copy = Vendor.fromJSON(original.toJSON())
    expect(copy.id).toBe('round-trip')
    expect(copy.name).toBe('Acme Supplies')
    expect(copy.notes).toBe('test')
    expect(copy.tags).toEqual(['x', 'y'])
  })

  it('preserves the id from the supplied data', () => {
    const v = Vendor.fromJSON(minimal({ id: 'keep-me' }))
    expect(v.id).toBe('keep-me')
  })
})
