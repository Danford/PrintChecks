import { afterEach, describe, expect, it, vi } from 'vitest'

import { SecureStorageAdapter } from '../storage/SecureStorageAdapter'
import type { StorageAdapter } from '../storage/StorageAdapter'
import { EncryptionError, StorageError } from '../storage/StorageAdapter'
import { decrypt, encrypt, isEncrypted } from '../utils/encryption'

// ── Mock encryption module ────────────────────────────────────────────────────
// Avoids Web Crypto API dependency and keeps tests fast/deterministic.

vi.mock('../utils/encryption', () => ({
  encrypt: vi.fn(async (data: unknown): Promise<string> =>
    JSON.stringify({ encrypted: true, version: '1.0', salt: 's', iv: 'i', data: btoa(JSON.stringify(data)) })
  ),
  decrypt: vi.fn(async (str: string): Promise<unknown> => {
    const parsed = JSON.parse(str) as { data: string }
    return JSON.parse(atob(parsed.data))
  }),
  isEncrypted: vi.fn((str: string): boolean => {
    try {
      const p = JSON.parse(str) as Record<string, unknown>
      return p.encrypted === true && !!p.salt && !!p.iv && !!p.data
    } catch {
      return false
    }
  }),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a fake encrypted payload matching the mock encrypt() output */
function fakeEnc(data: unknown): string {
  return JSON.stringify({
    encrypted: true,
    version: '1.0',
    salt: 's',
    iv: 'i',
    data: btoa(JSON.stringify(data)),
  })
}

/** Creates an isolated in-memory StorageAdapter for test use */
function makeAdapter(): StorageAdapter {
  const s = new Map<string, unknown>()
  return {
    async get<T>(k: string): Promise<T | null> {
      return s.has(k) ? (s.get(k) as T) : null
    },
    async set<T>(k: string, v: T): Promise<void> {
      s.set(k, v)
    },
    async remove(k: string): Promise<void> {
      s.delete(k)
    },
    async clear(): Promise<void> {
      s.clear()
    },
    async keys(): Promise<string[]> {
      return [...s.keys()]
    },
    async has(k: string): Promise<boolean> {
      return s.has(k)
    },
    async getMany<T>(ks: string[]): Promise<Map<string, T | null>> {
      const r = new Map<string, T | null>()
      for (const k of ks) r.set(k, s.has(k) ? (s.get(k) as T) : null)
      return r
    },
    async setMany(e: Map<string, unknown>): Promise<void> {
      for (const [k, v] of e) s.set(k, v)
    },
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SecureStorageAdapter', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  // ── Constructor ────────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates an instance with default options', () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      expect(adapter).toBeInstanceOf(SecureStorageAdapter)
      expect(adapter.isEncryptionEnabled()).toBe(false)
    })

    it('accepts custom sensitiveKeys option', () => {
      const adapter = new SecureStorageAdapter(makeAdapter(), { sensitiveKeys: ['mySecret'] })
      expect(adapter).toBeInstanceOf(SecureStorageAdapter)
    })

    it('accepts autoMigrate: false option', () => {
      const adapter = new SecureStorageAdapter(makeAdapter(), { autoMigrate: false })
      expect(adapter).toBeInstanceOf(SecureStorageAdapter)
    })

    it('calls initialize when both encryption and password are provided', () => {
      const base = makeAdapter()
      const spy = vi.spyOn(SecureStorageAdapter.prototype, 'initialize')
      new SecureStorageAdapter(base, { encryption: true, password: 'secret' })
      expect(spy).toHaveBeenCalledWith('secret')
    })
  })

  // ── initialize() ──────────────────────────────────────────────────────────

  describe('initialize()', () => {
    it('throws EncryptionError when password is empty', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      await expect(adapter.initialize('')).rejects.toBeInstanceOf(EncryptionError)
      await expect(adapter.initialize('')).rejects.toThrow('Password is required')
    })

    it('sets encryptionEnabled to false when flag is absent from storage', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      await adapter.initialize('pw')
      expect(adapter.isEncryptionEnabled()).toBe(false)
    })

    it('sets encryptionEnabled to true when encryption_enabled flag is stored', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      expect(adapter.isEncryptionEnabled()).toBe(true)
    })

    it('triggers migration when encryption is enabled and plain-text data exists', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      await base.set('checks', [{ id: 1 }]) // plain-text sensitive key
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      // encrypt must have been called to migrate the 'checks' key
      expect(vi.mocked(encrypt)).toHaveBeenCalled()
    })

    it('skips migration when encryption_migration_complete is already set', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      await base.set('encryption_migration_complete', 'true')
      await base.set('checks', [{ id: 1 }])
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      expect(vi.mocked(encrypt)).not.toHaveBeenCalled()
    })
  })

  // ── isEncryptionEnabled() ─────────────────────────────────────────────────

  describe('isEncryptionEnabled()', () => {
    it('returns false before initialization', () => {
      expect(new SecureStorageAdapter(makeAdapter()).isEncryptionEnabled()).toBe(false)
    })

    it('returns true after initialize() finds the encryption_enabled flag', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      expect(adapter.isEncryptionEnabled()).toBe(true)
    })
  })

  // ── get() ────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('returns null for a missing key', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      expect(await adapter.get('missing')).toBeNull()
    })

    it('returns plain-text values as-is', async () => {
      const base = makeAdapter()
      await base.set('someKey', { x: 1 })
      const adapter = new SecureStorageAdapter(base)
      expect(await adapter.get('someKey')).toEqual({ x: 1 })
    })

    it('returns metadata keys without calling decrypt', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      vi.clearAllMocks()
      const val = await adapter.get('encryption_enabled')
      expect(val).toBe('true')
      expect(vi.mocked(decrypt)).not.toHaveBeenCalled()
    })

    it('decrypts an encrypted value when password is set', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      const result = await adapter.get('checks')
      expect(result).toEqual([{ id: 1 }])
    })

    it('throws EncryptionError when value is encrypted but no password is set', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      const adapter = new SecureStorageAdapter(base) // no initialize()
      await expect(adapter.get('checks')).rejects.toBeInstanceOf(EncryptionError)
      await expect(adapter.get('checks')).rejects.toThrow('without password')
    })

    it('throws EncryptionError wrapping a decryption failure', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      vi.mocked(decrypt).mockRejectedValueOnce(new Error('Incorrect password'))
      const err = await adapter.get('checks').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(EncryptionError)
      expect((err as EncryptionError).message).toContain('Wrong password or corrupted data')
    })

    it('throws StorageError when the base adapter throws a non-EncryptionError', async () => {
      const base = makeAdapter()
      vi.spyOn(base, 'get').mockRejectedValueOnce(new Error('disk error'))
      const adapter = new SecureStorageAdapter(base)
      await expect(adapter.get('anyKey')).rejects.toBeInstanceOf(StorageError)
    })

    it('JSON.stringifies non-string raw values before the isEncrypted check', async () => {
      const base = makeAdapter()
      const obj = { x: 42 }
      await base.set('vendors', obj)
      const adapter = new SecureStorageAdapter(base)
      await adapter.get('vendors')
      expect(vi.mocked(isEncrypted)).toHaveBeenCalledWith(JSON.stringify(obj))
    })
  })

  // ── set() ────────────────────────────────────────────────────────────────

  describe('set()', () => {
    it('stores metadata keys directly without encryption', async () => {
      const base = makeAdapter()
      const adapter = new SecureStorageAdapter(base)
      await adapter.set('encryption_enabled', 'true')
      expect(vi.mocked(encrypt)).not.toHaveBeenCalled()
      expect(await base.get('encryption_enabled')).toBe('true')
    })

    it('encrypts sensitive keys when encryption is enabled', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      vi.clearAllMocks()
      await adapter.set('checks', [{ id: 1 }])
      expect(vi.mocked(encrypt)).toHaveBeenCalledWith([{ id: 1 }], 'pw')
    })

    it('stores non-sensitive keys without encryption even when encryption is enabled', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base, { sensitiveKeys: ['onlyThis'] })
      await adapter.initialize('pw')
      vi.clearAllMocks()
      await adapter.set('otherKey', 'value')
      expect(vi.mocked(encrypt)).not.toHaveBeenCalled()
    })

    it('stores sensitive keys as plain text when encryption is disabled', async () => {
      const base = makeAdapter()
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw') // encryptionEnabled stays false
      await adapter.set('checks', [{ id: 1 }])
      expect(vi.mocked(encrypt)).not.toHaveBeenCalled()
      expect(await base.get('checks')).toEqual([{ id: 1 }])
    })

    it('throws EncryptionError when encrypt() fails', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      vi.mocked(encrypt).mockRejectedValueOnce(new Error('crypto failure'))
      await expect(adapter.set('checks', [{ id: 1 }])).rejects.toBeInstanceOf(EncryptionError)
    })

    it('throws StorageError when the base adapter set() throws a non-EncryptionError', async () => {
      const base = makeAdapter()
      vi.spyOn(base, 'set').mockRejectedValueOnce(new Error('quota exceeded'))
      const adapter = new SecureStorageAdapter(base)
      await expect(adapter.set('nonMetaKey', 'value')).rejects.toBeInstanceOf(StorageError)
    })

    it('round-trips: get() after set() returns the original value', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      const original = { name: 'Acme', amount: 100 }
      await adapter.set('checks', original)
      expect(await adapter.get('checks')).toEqual(original)
    })
  })

  // ── remove() / clear() / keys() / has() ──────────────────────────────────

  describe('remove()', () => {
    it('delegates to the base adapter', async () => {
      const base = makeAdapter()
      const spy = vi.spyOn(base, 'remove')
      const adapter = new SecureStorageAdapter(base)
      await adapter.remove('myKey')
      expect(spy).toHaveBeenCalledWith('myKey')
    })
  })

  describe('clear()', () => {
    it('delegates to the base adapter', async () => {
      const base = makeAdapter()
      const spy = vi.spyOn(base, 'clear')
      const adapter = new SecureStorageAdapter(base)
      await adapter.clear()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('keys()', () => {
    it('returns all keys from the base adapter', async () => {
      const base = makeAdapter()
      await base.set('a', 1)
      await base.set('b', 2)
      const adapter = new SecureStorageAdapter(base)
      expect((await adapter.keys()).sort()).toEqual(['a', 'b'])
    })
  })

  describe('has()', () => {
    it('returns true for an existing key and false for a missing key', async () => {
      const base = makeAdapter()
      await base.set('present', true)
      const adapter = new SecureStorageAdapter(base)
      expect(await adapter.has('present')).toBe(true)
      expect(await adapter.has('absent')).toBe(false)
    })
  })

  // ── getMany() ────────────────────────────────────────────────────────────

  describe('getMany()', () => {
    it('returns a Map with values for all requested keys, null for missing', async () => {
      const base = makeAdapter()
      await base.set('vendors', [{ id: 'v1' }])
      await base.set('settings', { theme: 'dark' })
      const adapter = new SecureStorageAdapter(base)
      const result = await adapter.getMany(['vendors', 'settings', 'missing'])
      expect(result.get('vendors')).toEqual([{ id: 'v1' }])
      expect(result.get('settings')).toEqual({ theme: 'dark' })
      expect(result.get('missing')).toBeNull()
    })

    it('decrypts encrypted values in bulk', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      await base.set('receipts', fakeEnc([{ id: 2 }]))
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      const result = await adapter.getMany(['checks', 'receipts'])
      expect(result.get('checks')).toEqual([{ id: 1 }])
      expect(result.get('receipts')).toEqual([{ id: 2 }])
    })

    it('handles a mix of encrypted and plain-text values', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc({ a: 1 }))
      await base.set('nonSensitiveKey', 'plain')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      const result = await adapter.getMany(['checks', 'nonSensitiveKey'])
      expect(result.get('checks')).toEqual({ a: 1 })
      expect(result.get('nonSensitiveKey')).toBe('plain')
    })
  })

  // ── setMany() ────────────────────────────────────────────────────────────

  describe('setMany()', () => {
    it('stores all entries from the Map', async () => {
      const base = makeAdapter()
      const adapter = new SecureStorageAdapter(base)
      await adapter.setMany(new Map([['a', 1], ['b', 'hello']]))
      expect(await base.get('a')).toBe(1)
      expect(await base.get('b')).toBe('hello')
    })

    it('encrypts sensitive entries when encryption is enabled', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      vi.clearAllMocks()
      await adapter.setMany(new Map([['checks', [{ id: 1 }]]]))
      expect(vi.mocked(encrypt)).toHaveBeenCalledWith([{ id: 1 }], 'pw')
    })

    it('stores non-sensitive entries without encryption', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      vi.clearAllMocks()
      await adapter.setMany(new Map([['nonSensitiveKey', 'plainval']]))
      expect(vi.mocked(encrypt)).not.toHaveBeenCalled()
    })
  })

  // ── migrateToEncrypted() ─────────────────────────────────────────────────

  describe('migrateToEncrypted()', () => {
    it('throws EncryptionError when password is empty', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      await expect(adapter.migrateToEncrypted('')).rejects.toBeInstanceOf(EncryptionError)
    })

    it('encrypts all plain-text sensitive keys', async () => {
      const base = makeAdapter()
      await base.set('checks', [{ id: 1 }])
      await base.set('vendors', [{ name: 'Acme' }])
      const adapter = new SecureStorageAdapter(base)
      await adapter.migrateToEncrypted('pw')
      const checksVal = await base.get<string>('checks')
      const vendorsVal = await base.get<string>('vendors')
      expect(vi.mocked(isEncrypted)(checksVal as string)).toBe(true)
      expect(vi.mocked(isEncrypted)(vendorsVal as string)).toBe(true)
    })

    it('skips already-encrypted keys and only calls encrypt for the test sentinel', async () => {
      const base = makeAdapter()
      const alreadyEncrypted = fakeEnc({ id: 1 })
      await base.set('checks', alreadyEncrypted)
      const adapter = new SecureStorageAdapter(base)
      vi.clearAllMocks()
      await adapter.migrateToEncrypted('pw')
      // encrypt is called once for encryption_test only; checks was not re-encrypted
      expect(vi.mocked(encrypt)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(encrypt)).toHaveBeenCalledWith({ test: true }, 'pw')
      expect(await base.get('checks')).toBe(alreadyEncrypted)
    })

    it('sets encryption_enabled and encryption_migration_complete flags', async () => {
      const base = makeAdapter()
      await base.set('checks', [{ id: 1 }])
      const adapter = new SecureStorageAdapter(base)
      await adapter.migrateToEncrypted('pw')
      expect(await base.get('encryption_enabled')).toBe('true')
      expect(await base.get('encryption_migration_complete')).toBe('true')
    })

    it('sets isEncryptionEnabled() to true after migration', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      expect(adapter.isEncryptionEnabled()).toBe(false)
      await adapter.migrateToEncrypted('pw')
      expect(adapter.isEncryptionEnabled()).toBe(true)
    })

    it('ignores keys with null/undefined values', async () => {
      const base = makeAdapter()
      // 'checks' key exists but has no value (null from get)
      vi.spyOn(base, 'keys').mockResolvedValueOnce(['checks'])
      vi.spyOn(base, 'get').mockResolvedValueOnce(null)
      const adapter = new SecureStorageAdapter(base)
      vi.clearAllMocks()
      await adapter.migrateToEncrypted('pw')
      // encrypt is called only for encryption_test; 'checks' had no value to migrate
      const dataCalls = vi.mocked(encrypt).mock.calls.filter(
        ([data]) => JSON.stringify(data) !== JSON.stringify({ test: true })
      )
      expect(dataCalls).toHaveLength(0)
    })

    it('rolls back all changes on failure and throws EncryptionError', async () => {
      const base = makeAdapter()
      await base.set('checks', [{ id: 1 }])
      const adapter = new SecureStorageAdapter(base)
      vi.mocked(encrypt).mockRejectedValueOnce(new Error('crypto error'))
      const err = await adapter.migrateToEncrypted('pw').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(EncryptionError)
      expect((err as EncryptionError).message).toContain('rolled back')
      expect(adapter.isEncryptionEnabled()).toBe(false)
    })
  })

  // ── migrateToPlainText() ─────────────────────────────────────────────────

  describe('migrateToPlainText()', () => {
    it('throws EncryptionError when password is empty', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      await expect(adapter.migrateToPlainText('')).rejects.toBeInstanceOf(EncryptionError)
    })

    it('decrypts all encrypted sensitive keys', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      await base.set('vendors', fakeEnc([{ name: 'Acme' }]))
      const adapter = new SecureStorageAdapter(base)
      await adapter.migrateToPlainText('pw')
      expect(await base.get('checks')).toEqual([{ id: 1 }])
      expect(await base.get('vendors')).toEqual([{ name: 'Acme' }])
    })

    it('does not call decrypt on metadata keys', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      await base.set('checks', fakeEnc([{ id: 1 }]))
      const adapter = new SecureStorageAdapter(base)
      await adapter.migrateToPlainText('pw')
      // decrypt was never called with the raw string 'true' (the metadata value)
      const calls = vi.mocked(decrypt).mock.calls
      expect(calls.every(([str]) => str !== 'true')).toBe(true)
    })

    it('skips plain-text keys without calling decrypt', async () => {
      const base = makeAdapter()
      await base.set('checks', [{ id: 1 }]) // plain text, not encrypted
      const adapter = new SecureStorageAdapter(base)
      vi.clearAllMocks()
      await adapter.migrateToPlainText('pw')
      expect(vi.mocked(decrypt)).not.toHaveBeenCalled()
    })

    it('removes all encryption flags after migration', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      await base.set('encryption_migration_complete', 'true')
      await base.set('encryption_test', fakeEnc({ test: true }))
      const adapter = new SecureStorageAdapter(base)
      await adapter.migrateToPlainText('pw')
      expect(await base.get('encryption_enabled')).toBeNull()
      expect(await base.get('encryption_migration_complete')).toBeNull()
      expect(await base.get('encryption_test')).toBeNull()
    })

    it('sets isEncryptionEnabled() to false and clears password state', async () => {
      const base = makeAdapter()
      await base.set('encryption_enabled', 'true')
      const adapter = new SecureStorageAdapter(base)
      await adapter.initialize('pw')
      expect(adapter.isEncryptionEnabled()).toBe(true)
      await adapter.migrateToPlainText('pw')
      expect(adapter.isEncryptionEnabled()).toBe(false)
    })

    it('throws EncryptionError listing all keys that failed to decrypt', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      const adapter = new SecureStorageAdapter(base)
      vi.mocked(decrypt).mockRejectedValueOnce(new Error('bad password'))
      const err = await adapter.migrateToPlainText('wrong').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(EncryptionError)
      expect((err as EncryptionError).message).toContain('Migration failed for keys')
    })
  })

  // ── changePassword() ─────────────────────────────────────────────────────

  describe('changePassword()', () => {
    it('throws EncryptionError when oldPassword is empty', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      await expect(adapter.changePassword('', 'newPw')).rejects.toBeInstanceOf(EncryptionError)
    })

    it('throws EncryptionError when newPassword is empty', async () => {
      const adapter = new SecureStorageAdapter(makeAdapter())
      await expect(adapter.changePassword('oldPw', '')).rejects.toBeInstanceOf(EncryptionError)
    })

    it('decrypts with the old password and re-encrypts with the new one', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      const adapter = new SecureStorageAdapter(base)
      vi.clearAllMocks()
      await adapter.changePassword('oldPw', 'newPw')
      expect(vi.mocked(decrypt)).toHaveBeenCalledWith(fakeEnc([{ id: 1 }]), 'oldPw')
      expect(vi.mocked(encrypt)).toHaveBeenCalledWith([{ id: 1 }], 'newPw')
    })

    it('sets a new encryption_test entry encrypted with the new password', async () => {
      const base = makeAdapter()
      const adapter = new SecureStorageAdapter(base)
      vi.clearAllMocks()
      await adapter.changePassword('oldPw', 'newPw')
      expect(vi.mocked(encrypt)).toHaveBeenCalledWith({ test: true }, 'newPw')
    })

    it('throws EncryptionError when re-encryption fails for any key', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      const adapter = new SecureStorageAdapter(base)
      vi.mocked(decrypt).mockRejectedValueOnce(new Error('bad old password'))
      await expect(adapter.changePassword('wrongOld', 'newPw')).rejects.toBeInstanceOf(EncryptionError)
    })
  })

  // ── getStats() ───────────────────────────────────────────────────────────

  describe('getStats()', () => {
    it('returns all zeros when no sensitive keys have values', async () => {
      const base = makeAdapter()
      await base.set('nonSensitiveKey', 'data')
      const adapter = new SecureStorageAdapter(base)
      const stats = await adapter.getStats()
      expect(stats).toEqual({ total: 0, encrypted: 0, plainText: 0 })
    })

    it('counts plain-text sensitive keys as plainText', async () => {
      const base = makeAdapter()
      await base.set('checks', [{ id: 1 }])
      await base.set('vendors', [{ name: 'Acme' }])
      const adapter = new SecureStorageAdapter(base)
      const stats = await adapter.getStats()
      expect(stats.total).toBe(2)
      expect(stats.plainText).toBe(2)
      expect(stats.encrypted).toBe(0)
    })

    it('counts encrypted sensitive keys as encrypted', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      await base.set('vendors', fakeEnc([{ name: 'Acme' }]))
      const adapter = new SecureStorageAdapter(base)
      const stats = await adapter.getStats()
      expect(stats.total).toBe(2)
      expect(stats.encrypted).toBe(2)
      expect(stats.plainText).toBe(0)
    })

    it('handles a mix of encrypted and plain-text sensitive keys', async () => {
      const base = makeAdapter()
      await base.set('checks', fakeEnc([{ id: 1 }]))
      await base.set('vendors', [{ name: 'Acme' }])
      const adapter = new SecureStorageAdapter(base)
      const stats = await adapter.getStats()
      expect(stats.total).toBe(2)
      expect(stats.encrypted).toBe(1)
      expect(stats.plainText).toBe(1)
    })
  })
})
