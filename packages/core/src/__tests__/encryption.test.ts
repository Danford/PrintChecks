/**
 * Tests for utils/encryption.ts
 *
 * Uses the real Web Crypto API (available in Node 18+ via globalThis.crypto).
 * Slow tests (those that invoke PBKDF2) carry an explicit 20 s timeout;
 * beforeAll pre-encrypts shared fixtures so the suite runs as few PBKDF2
 * derivations as possible.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  decrypt,
  encrypt,
  generatePassword,
  isCryptoAvailable,
  isEncrypted,
  verifyPassword,
} from '../utils/encryption'
import type { EncryptedData } from '../utils/encryption'

// ── Shared fixtures ──────────────────────────────────────────────────────────
// Pre-encrypt once to avoid repeating slow PBKDF2 derivations per test.

const PASSWORD = 'correct-horse-battery-staple'
const WRONG_PW = 'wrong-password'

let encryptedString: string // encrypt('hello', PASSWORD)
let encryptedObject: string // encrypt({ id: 1, name: 'Acme' }, PASSWORD)

beforeAll(async () => {
  encryptedString = await encrypt('hello', PASSWORD)
  encryptedObject = await encrypt({ id: 1, name: 'Acme' }, PASSWORD)
}, 30_000)

afterEach(() => {
  vi.unstubAllGlobals()
})

// ── isCryptoAvailable() ──────────────────────────────────────────────────────

describe('isCryptoAvailable()', () => {
  it('returns true in a Node 18+ environment', () => {
    expect(isCryptoAvailable()).toBe(true)
  })

  it('returns false when globalThis.crypto is undefined', () => {
    vi.stubGlobal('crypto', undefined)
    expect(isCryptoAvailable()).toBe(false)
  })

  it('returns false when crypto.subtle is undefined', () => {
    vi.stubGlobal('crypto', {} as Crypto)
    expect(isCryptoAvailable()).toBe(false)
  })
})

// ── isEncrypted() ────────────────────────────────────────────────────────────

describe('isEncrypted()', () => {
  it('returns true for a string produced by encrypt()', () => {
    expect(isEncrypted(encryptedString)).toBe(true)
  })

  it('returns false for plain JSON', () => {
    expect(isEncrypted(JSON.stringify({ name: 'Acme' }))).toBe(false)
  })

  it('returns false for a non-JSON string', () => {
    expect(isEncrypted('not json at all')).toBe(false)
  })

  it('returns false when the "encrypted" field is not exactly true', () => {
    const bad = JSON.stringify({ encrypted: 'yes', salt: 's', iv: 'i', data: 'd' })
    expect(isEncrypted(bad)).toBe(false)
  })

  it('returns false when salt is missing', () => {
    const bad = JSON.stringify({ encrypted: true, iv: 'i', data: 'd' })
    expect(isEncrypted(bad)).toBe(false)
  })

  it('returns false when iv is missing', () => {
    const bad = JSON.stringify({ encrypted: true, salt: 's', data: 'd' })
    expect(isEncrypted(bad)).toBe(false)
  })

  it('returns false when data is missing', () => {
    const bad = JSON.stringify({ encrypted: true, salt: 's', iv: 'i' })
    expect(isEncrypted(bad)).toBe(false)
  })
})

// ── encrypt() ────────────────────────────────────────────────────────────────

describe('encrypt()', () => {
  it('throws when password is empty', async () => {
    await expect(encrypt('data', '')).rejects.toThrow('Password is required')
  })

  it('throws when crypto is unavailable', async () => {
    vi.stubGlobal('crypto', undefined)
    await expect(encrypt('data', 'pw')).rejects.toThrow('Web Crypto API is not available')
  })

  it('returns a JSON string with all required EncryptedData fields', async () => {
    const result = JSON.parse(encryptedString) as EncryptedData
    expect(result.encrypted).toBe(true)
    expect(result.version).toBe('1.0')
    expect(typeof result.salt).toBe('string')
    expect(typeof result.iv).toBe('string')
    expect(typeof result.data).toBe('string')
    expect(result.salt.length).toBeGreaterThan(0)
    expect(result.iv.length).toBeGreaterThan(0)
    expect(result.data.length).toBeGreaterThan(0)
  }, 20_000)

  it('produces a different ciphertext each call (random IV/salt)', async () => {
    const a = await encrypt('same data', PASSWORD)
    const b = await encrypt('same data', PASSWORD)
    expect(a).not.toBe(b)
  }, 30_000)

  it('encrypts complex nested objects', async () => {
    const complex = { list: [1, 2, 3], nested: { flag: true, str: 'x' } }
    const result = await decrypt(await encrypt(complex, PASSWORD), PASSWORD)
    expect(result).toEqual(complex)
  }, 30_000)

  it('encrypts various scalar types (number, null)', async () => {
    const numResult = await decrypt(await encrypt(42, PASSWORD), PASSWORD)
    const nullResult = await decrypt(await encrypt(null, PASSWORD), PASSWORD)
    expect(numResult).toBe(42)
    expect(nullResult).toBeNull()
  }, 30_000)
})

// ── decrypt() ────────────────────────────────────────────────────────────────

describe('decrypt()', () => {
  it('throws when password is empty', async () => {
    await expect(decrypt(encryptedString, '')).rejects.toThrow('Password is required')
  })

  it('throws when crypto is unavailable', async () => {
    vi.stubGlobal('crypto', undefined)
    await expect(decrypt(encryptedString, PASSWORD)).rejects.toThrow('Web Crypto API is not available')
  })

  it('correctly decrypts a string encrypted with the same password', async () => {
    const result = await decrypt(encryptedString, PASSWORD)
    expect(result).toBe('hello')
  }, 20_000)

  it('correctly decrypts an object encrypted with the same password', async () => {
    const result = await decrypt(encryptedObject, PASSWORD)
    expect(result).toEqual({ id: 1, name: 'Acme' })
  }, 20_000)

  it('throws "Incorrect password" when the wrong password is used', async () => {
    await expect(decrypt(encryptedString, WRONG_PW)).rejects.toThrow('Incorrect password')
  }, 20_000)

  it('throws "Decryption failed" for missing required fields', async () => {
    const malformed = JSON.stringify({ encrypted: true, salt: 's', iv: 'i' }) // no data
    await expect(decrypt(malformed, PASSWORD)).rejects.toThrow('Decryption failed')
  })

  it('throws "Decryption failed" for invalid JSON input', async () => {
    await expect(decrypt('not-json-at-all', PASSWORD)).rejects.toThrow('Decryption failed')
  })
})

// ── encrypt → decrypt round-trips ────────────────────────────────────────────

describe('encrypt/decrypt round-trip', () => {
  it('round-trips a plain string', async () => {
    const original = 'The quick brown fox'
    expect(await decrypt(await encrypt(original, PASSWORD), PASSWORD)).toBe(original)
  }, 30_000)

  it('round-trips a deeply nested object', async () => {
    const original = {
      vendor: { name: 'Acme', tags: ['preferred', 'net-30'] },
      amount: 1234.56,
      active: true,
    }
    expect(await decrypt(await encrypt(original, PASSWORD), PASSWORD)).toEqual(original)
  }, 30_000)

  it('round-trips an empty array', async () => {
    expect(await decrypt(await encrypt([], PASSWORD), PASSWORD)).toEqual([])
  }, 30_000)
})

// ── verifyPassword() ─────────────────────────────────────────────────────────

describe('verifyPassword()', () => {
  it('returns true for the correct password', async () => {
    expect(await verifyPassword(encryptedString, PASSWORD)).toBe(true)
  }, 20_000)

  it('returns false for the wrong password', async () => {
    expect(await verifyPassword(encryptedString, WRONG_PW)).toBe(false)
  }, 20_000)

  it('returns false for an invalid encrypted string', async () => {
    expect(await verifyPassword('not-encrypted', PASSWORD)).toBe(false)
  })
})

// ── generatePassword() ───────────────────────────────────────────────────────

describe('generatePassword()', () => {
  const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'

  it('returns a string of the default length (16)', () => {
    expect(generatePassword()).toHaveLength(16)
  })

  it('returns a string of a specified length', () => {
    expect(generatePassword(32)).toHaveLength(32)
    expect(generatePassword(8)).toHaveLength(8)
  })

  it('only contains characters from the allowed charset', () => {
    const pw = generatePassword(64)
    for (const char of pw) {
      expect(CHARSET).toContain(char)
    }
  })

  it('generates different passwords on successive calls', () => {
    const passwords = new Set(Array.from({ length: 10 }, () => generatePassword()))
    expect(passwords.size).toBeGreaterThan(1)
  })

  it('uses the Math.random fallback when crypto is unavailable', () => {
    vi.stubGlobal('crypto', undefined)
    const pw = generatePassword(16)
    expect(pw).toHaveLength(16)
    for (const char of pw) {
      expect(CHARSET).toContain(char)
    }
  })
})
