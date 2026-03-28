// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocalStorageAdapter } from '../storage/LocalStorageAdapter'
import { StorageError } from '../storage/StorageAdapter'

describe('LocalStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Constructor ─────────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates instance with default prefix', () => {
      const adapter = new LocalStorageAdapter()
      expect(adapter).toBeInstanceOf(LocalStorageAdapter)
    })

    it('creates instance with custom prefix', () => {
      const adapter = new LocalStorageAdapter({ prefix: 'myapp_' })
      expect(adapter).toBeInstanceOf(LocalStorageAdapter)
    })

    it('throws StorageError when localStorage is not available', () => {
      const orig = globalThis.localStorage
      // @ts-expect-error override for test
      globalThis.localStorage = undefined
      try {
        expect(() => new LocalStorageAdapter()).toThrow(StorageError)
        expect(() => new LocalStorageAdapter()).toThrow(
          'localStorage is not available in this environment'
        )
      } finally {
        globalThis.localStorage = orig
      }
    })
  })

  // ── get ─────────────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns null for a missing key', async () => {
      const adapter = new LocalStorageAdapter()
      expect(await adapter.get('missing')).toBeNull()
    })

    it('returns the stored value', async () => {
      const adapter = new LocalStorageAdapter()
      await adapter.set('foo', { a: 1 })
      expect(await adapter.get('foo')).toEqual({ a: 1 })
    })

    it('uses the prefix when reading', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'pc_' })
      localStorage.setItem('pc_bar', JSON.stringify('hello'))
      expect(await adapter.get('bar')).toBe('hello')
    })

    it('does not read keys from a different prefix', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'pc_' })
      localStorage.setItem('other_bar', JSON.stringify('secret'))
      expect(await adapter.get('other_bar')).toBeNull()
    })

    it('throws StorageError when deserialization fails', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'pc_' })
      localStorage.setItem('pc_bad', 'not-valid-json{{{')
      await expect(adapter.get('bad')).rejects.toBeInstanceOf(StorageError)
    })
  })

  // ── set ─────────────────────────────────────────────────────────────────────

  describe('set', () => {
    it('stores a value with the prefix', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'pc_' })
      await adapter.set('key', 42)
      expect(localStorage.getItem('pc_key')).toBe('42')
    })

    it('serializes complex objects', async () => {
      const adapter = new LocalStorageAdapter()
      const obj = { x: [1, 2, 3], nested: { a: 'b' } }
      await adapter.set('obj', obj)
      expect(await adapter.get('obj')).toEqual(obj)
    })

    it('overwrites an existing value', async () => {
      const adapter = new LocalStorageAdapter()
      await adapter.set('k', 'first')
      await adapter.set('k', 'second')
      expect(await adapter.get('k')).toBe('second')
    })

    it('throws StorageError with "quota exceeded" message on QuotaExceededError', async () => {
      const adapter = new LocalStorageAdapter()
      const domErr = new DOMException('quota', 'QuotaExceededError')
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw domErr
      })
      await expect(adapter.set('huge', 'x'.repeat(100))).rejects.toThrow('Storage quota exceeded')
    })

    it('wraps generic setItem errors in StorageError', async () => {
      const adapter = new LocalStorageAdapter()
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('disk full')
      })
      await expect(adapter.set('k', 'v')).rejects.toBeInstanceOf(StorageError)
    })
  })

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an existing key', async () => {
      const adapter = new LocalStorageAdapter()
      await adapter.set('del', 'bye')
      await adapter.remove('del')
      expect(await adapter.get('del')).toBeNull()
    })

    it('is a no-op for a missing key', async () => {
      const adapter = new LocalStorageAdapter()
      await expect(adapter.remove('nope')).resolves.toBeUndefined()
    })
  })

  // ── clear ───────────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all keys with the adapter prefix', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'pc_' })
      await adapter.set('a', 1)
      await adapter.set('b', 2)
      await adapter.clear()
      expect(await adapter.keys()).toEqual([])
    })

    it('does not remove keys belonging to a different prefix', async () => {
      const a = new LocalStorageAdapter({ prefix: 'aa_' })
      const b = new LocalStorageAdapter({ prefix: 'bb_' })
      await a.set('x', 1)
      await b.set('y', 2)
      await a.clear()
      expect(await a.keys()).toEqual([])
      expect(await b.keys()).toEqual(['y'])
    })
  })

  // ── keys ────────────────────────────────────────────────────────────────────

  describe('keys', () => {
    it('returns an empty array when nothing is stored', async () => {
      const adapter = new LocalStorageAdapter()
      expect(await adapter.keys()).toEqual([])
    })

    it('returns only keys belonging to this prefix', async () => {
      const a = new LocalStorageAdapter({ prefix: 'aa_' })
      const b = new LocalStorageAdapter({ prefix: 'bb_' })
      await a.set('one', 1)
      await a.set('two', 2)
      await b.set('three', 3)
      const keys = await a.keys()
      expect(keys.sort()).toEqual(['one', 'two'])
    })

    it('strips the prefix from returned keys', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'myprefix_' })
      await adapter.set('alpha', true)
      expect(await adapter.keys()).toEqual(['alpha'])
    })
  })

  // ── has ─────────────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns false for a missing key', async () => {
      const adapter = new LocalStorageAdapter()
      expect(await adapter.has('ghost')).toBe(false)
    })

    it('returns true for an existing key', async () => {
      const adapter = new LocalStorageAdapter()
      await adapter.set('present', 'yes')
      expect(await adapter.has('present')).toBe(true)
    })

    it('returns false for a key stored under a different prefix', async () => {
      const a = new LocalStorageAdapter({ prefix: 'aa_' })
      const b = new LocalStorageAdapter({ prefix: 'bb_' })
      await a.set('shared', 1)
      expect(await b.has('shared')).toBe(false)
    })
  })

  // ── getMany ─────────────────────────────────────────────────────────────────

  describe('getMany', () => {
    it('returns a Map with all requested keys', async () => {
      const adapter = new LocalStorageAdapter()
      await adapter.set('x', 10)
      await adapter.set('y', 20)
      const result = await adapter.getMany<number>(['x', 'y', 'z'])
      expect(result.get('x')).toBe(10)
      expect(result.get('y')).toBe(20)
      expect(result.get('z')).toBeNull()
    })

    it('returns null for missing keys without throwing', async () => {
      const adapter = new LocalStorageAdapter()
      const result = await adapter.getMany(['missing1', 'missing2'])
      expect(result.get('missing1')).toBeNull()
      expect(result.get('missing2')).toBeNull()
    })

    it('returns null for a key whose deserialization fails instead of throwing', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'pc_' })
      localStorage.setItem('pc_broken', 'invalid-json{{{')
      const result = await adapter.getMany(['broken', 'ok'])
      expect(result.get('broken')).toBeNull()
    })
  })

  // ── setMany ─────────────────────────────────────────────────────────────────

  describe('setMany', () => {
    it('sets all entries in the Map', async () => {
      const adapter = new LocalStorageAdapter()
      const entries = new Map<string, unknown>([
        ['p', 1],
        ['q', 'hello'],
        ['r', { a: true }],
      ])
      await adapter.setMany(entries)
      expect(await adapter.get('p')).toBe(1)
      expect(await adapter.get('q')).toBe('hello')
      expect(await adapter.get('r')).toEqual({ a: true })
    })

    it('throws StorageError if any entry fails, after trying all entries', async () => {
      const adapter = new LocalStorageAdapter()
      let callCount = 0
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        callCount++
        if (callCount === 2) throw new Error('fail')
      })
      const entries = new Map<string, unknown>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      await expect(adapter.setMany(entries)).rejects.toBeInstanceOf(StorageError)
      // other keys still attempted
      expect(callCount).toBe(3)
    })
  })

  // ── getStorageStats ──────────────────────────────────────────────────────────

  describe('getStorageStats', () => {
    it('returns used=0 when nothing is stored', () => {
      const adapter = new LocalStorageAdapter({ prefix: 'stats_' })
      const { used, available, percentage } = adapter.getStorageStats()
      expect(used).toBe(0)
      expect(available).toBeGreaterThan(0)
      expect(percentage).toBe(0)
    })

    it('counts bytes for keys belonging to this prefix only', async () => {
      const a = new LocalStorageAdapter({ prefix: 'aa_' })
      const b = new LocalStorageAdapter({ prefix: 'bb_' })
      await a.set('item', 'hello')
      await b.set('other', 'world')

      const statsA = a.getStorageStats()
      const statsB = b.getStorageStats()

      expect(statsA.used).toBeGreaterThan(0)
      expect(statsB.used).toBeGreaterThan(0)
      // each adapter only counts its own prefix
      expect(statsA.used).not.toBe(statsA.used + statsB.used)
    })

    it('returns percentage between 0 and 100', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'pct_' })
      await adapter.set('data', 'x'.repeat(1000))
      const { percentage } = adapter.getStorageStats()
      expect(percentage).toBeGreaterThan(0)
      expect(percentage).toBeLessThan(100)
    })

    it('reflects updated usage after set and remove', async () => {
      const adapter = new LocalStorageAdapter({ prefix: 'upd_' })
      const before = adapter.getStorageStats().used
      await adapter.set('blob', 'a'.repeat(500))
      const after = adapter.getStorageStats().used
      expect(after).toBeGreaterThan(before)
      await adapter.remove('blob')
      const cleared = adapter.getStorageStats().used
      expect(cleared).toBe(before)
    })
  })

  // ── Custom serialization ─────────────────────────────────────────────────────

  describe('custom serialization', () => {
    it('uses custom serialize/deserialize functions', async () => {
      const serialize = vi.fn((v: unknown) => JSON.stringify(v) + '|custom')
      const deserialize = vi.fn((s: string) => JSON.parse(s.replace('|custom', '')))
      const adapter = new LocalStorageAdapter({ serialization: { serialize, deserialize } })

      await adapter.set('tagged', { ok: true })
      expect(serialize).toHaveBeenCalled()

      const result = await adapter.get('tagged')
      expect(deserialize).toHaveBeenCalled()
      expect(result).toEqual({ ok: true })
    })
  })
})
