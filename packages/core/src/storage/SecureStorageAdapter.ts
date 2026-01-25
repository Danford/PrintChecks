/**
 * Secure Storage Adapter with encryption support
 * Wraps any StorageAdapter and adds transparent encryption/decryption
 */

import type { EncryptedStorageAdapter, StorageAdapter, StorageOptions } from './StorageAdapter'
import { StorageError, EncryptionError } from './StorageAdapter'
import { encrypt, decrypt, isEncrypted } from '../utils/encryption'

// Keys that should be encrypted when encryption is enabled
const DEFAULT_SENSITIVE_KEYS = [
  'checkList',
  'checks',
  'receipts',
  'payments',
  'vendors',
  'bankAccounts',
  'templates',
  'customization',
  'presets',
  'settings'
]

// Metadata keys (never encrypted)
const METADATA_KEYS = [
  'encryption_enabled',
  'encryption_test',
  'encryption_migration_complete'
]

export interface SecureStorageOptions extends StorageOptions {
  /**
   * List of keys that should be encrypted (default: common sensitive data keys)
   */
  sensitiveKeys?: string[]
  
  /**
   * Whether to automatically migrate plain text data to encrypted format
   */
  autoMigrate?: boolean
}

export class SecureStorageAdapter implements EncryptedStorageAdapter {
  private baseAdapter: StorageAdapter
  private password: string | null = null
  private encryptionEnabled = false
  private sensitiveKeys: Set<string>
  private autoMigrate: boolean

  constructor(baseAdapter: StorageAdapter, options: SecureStorageOptions = {}) {
    this.baseAdapter = baseAdapter
    this.sensitiveKeys = new Set(options.sensitiveKeys || DEFAULT_SENSITIVE_KEYS)
    this.autoMigrate = options.autoMigrate !== false

    if (options.encryption && options.password) {
      this.initialize(options.password)
    }
  }

  /**
   * Initialize encryption with a password
   */
  async initialize(password: string): Promise<void> {
    if (!password) {
      throw new EncryptionError('Password is required for encryption')
    }

    this.password = password
    
    // Check if encryption is enabled in storage
    const encryptionFlag = await this.baseAdapter.get<string>('encryption_enabled')
    this.encryptionEnabled = encryptionFlag === 'true'

    // If encryption is enabled and autoMigrate is true, check if migration is needed
    if (this.encryptionEnabled && this.autoMigrate) {
      const needsMigration = await this.needsMigration()
      if (needsMigration) {
        await this.migrateToEncrypted(password)
      }
    }
  }

  /**
   * Check if encryption is enabled
   */
  isEncryptionEnabled(): boolean {
    return this.encryptionEnabled
  }

  /**
   * Check if a key should be encrypted
   */
  private shouldEncrypt(key: string): boolean {
    return this.sensitiveKeys.has(key) && !METADATA_KEYS.includes(key)
  }

  /**
   * Get a value from storage, automatically decrypting if needed
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const rawValue = await this.baseAdapter.get<any>(key)
      if (rawValue === null) {
        return null
      }

      // Metadata keys are never encrypted
      if (METADATA_KEYS.includes(key)) {
        return rawValue
      }

      // Check if the data is encrypted
      const rawString = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue)
      if (isEncrypted(rawString)) {
        if (!this.password) {
          throw new EncryptionError(`Cannot decrypt key "${key}" without password`)
        }

        try {
          const decrypted = await decrypt(rawString, this.password)
          return decrypted as T
        } catch (error) {
          throw new EncryptionError(
            `Failed to decrypt key "${key}". Wrong password or corrupted data.`,
            error as Error
          )
        }
      }

      // Data is not encrypted, return as-is
      return rawValue as T
    } catch (error) {
      if (error instanceof EncryptionError) {
        throw error
      }
      throw new StorageError(
        `Failed to get key "${key}"`,
        error as Error
      )
    }
  }

  /**
   * Set a value in storage, automatically encrypting if needed
   */
  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      // Metadata keys are never encrypted
      if (METADATA_KEYS.includes(key)) {
        await this.baseAdapter.set(key, value)
        return
      }

      // Check if we should encrypt this key
      if (this.encryptionEnabled && this.shouldEncrypt(key) && this.password) {
        try {
          const encrypted = await encrypt(value, this.password)
          await this.baseAdapter.set(key, encrypted)
        } catch (error) {
          throw new EncryptionError(
            `Failed to encrypt key "${key}"`,
            error as Error
          )
        }
      } else {
        // Store as plain value
        await this.baseAdapter.set(key, value)
      }
    } catch (error) {
      if (error instanceof EncryptionError) {
        throw error
      }
      throw new StorageError(
        `Failed to set key "${key}"`,
        error as Error
      )
    }
  }

  async remove(key: string): Promise<void> {
    return this.baseAdapter.remove(key)
  }

  async clear(): Promise<void> {
    return this.baseAdapter.clear()
  }

  async keys(): Promise<string[]> {
    return this.baseAdapter.keys()
  }

  async has(key: string): Promise<boolean> {
    return this.baseAdapter.has(key)
  }

  async getMany<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()
    
    for (const key of keys) {
      const value = await this.get<T>(key)
      results.set(key, value)
    }
    
    return results
  }

  async setMany(entries: Map<string, any>): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value)
    }
  }

  /**
   * Migrate data to encrypted format
   */
  async migrateToEncrypted(password: string): Promise<void> {
    if (!password) {
      throw new EncryptionError('Password required for migration')
    }

    const oldPassword = this.password
    this.password = password
    this.encryptionEnabled = true

    const migrationErrors: string[] = []
    const allKeys = await this.baseAdapter.keys()

    for (const key of allKeys) {
      // Skip metadata keys and non-sensitive keys
      if (METADATA_KEYS.includes(key) || !this.shouldEncrypt(key)) {
        continue
      }

      try {
        const rawValue = await this.baseAdapter.get<any>(key)
        if (!rawValue) {
          continue
        }

        // Skip if already encrypted
        const rawString = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue)
        if (isEncrypted(rawString)) {
          continue
        }

        // Encrypt the data
        const encrypted = await encrypt(rawValue, password)
        await this.baseAdapter.set(key, encrypted)
      } catch (error) {
        migrationErrors.push(key)
        console.error(`Failed to migrate key "${key}":`, error)
      }
    }

    if (migrationErrors.length > 0) {
      this.password = oldPassword
      throw new EncryptionError(
        `Migration failed for keys: ${migrationErrors.join(', ')}`
      )
    }

    // Mark migration as complete
    await this.baseAdapter.set('encryption_enabled', 'true')
    await this.baseAdapter.set('encryption_migration_complete', 'true')
    
    // Create test data for password verification
    await this.baseAdapter.set('encryption_test', await encrypt({ test: true }, password))
  }

  /**
   * Migrate data to plain text format
   */
  async migrateToPlainText(password: string): Promise<void> {
    if (!password) {
      throw new EncryptionError('Password required for decryption during migration')
    }

    const migrationErrors: string[] = []
    const allKeys = await this.baseAdapter.keys()

    for (const key of allKeys) {
      // Skip metadata keys
      if (METADATA_KEYS.includes(key)) {
        continue
      }

      try {
        const rawValue = await this.baseAdapter.get<any>(key)
        if (!rawValue) {
          continue
        }

        // Skip if already plain text
        const rawString = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue)
        if (!isEncrypted(rawString)) {
          continue
        }

        // Decrypt the data
        const decrypted = await decrypt(rawString, password)
        await this.baseAdapter.set(key, decrypted)
      } catch (error) {
        migrationErrors.push(key)
        console.error(`Failed to migrate key "${key}":`, error)
      }
    }

    if (migrationErrors.length > 0) {
      throw new EncryptionError(
        `Migration failed for keys: ${migrationErrors.join(', ')}`
      )
    }

    // Clear encryption flags
    this.encryptionEnabled = false
    this.password = null
    await this.baseAdapter.remove('encryption_enabled')
    await this.baseAdapter.remove('encryption_migration_complete')
    await this.baseAdapter.remove('encryption_test')
  }

  /**
   * Change encryption password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!oldPassword || !newPassword) {
      throw new EncryptionError('Both old and new passwords are required')
    }

    const reencryptErrors: string[] = []
    const allKeys = await this.baseAdapter.keys()

    for (const key of allKeys) {
      // Skip metadata keys and non-sensitive keys
      if (METADATA_KEYS.includes(key) || !this.shouldEncrypt(key)) {
        continue
      }

      try {
        const rawValue = await this.baseAdapter.get<any>(key)
        if (!rawValue) {
          continue
        }

        // Skip if not encrypted
        const rawString = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue)
        if (!isEncrypted(rawString)) {
          continue
        }

        // Decrypt with old password
        const decrypted = await decrypt(rawString, oldPassword)
        
        // Encrypt with new password
        const encrypted = await encrypt(decrypted, newPassword)
        await this.baseAdapter.set(key, encrypted)
      } catch (error) {
        reencryptErrors.push(key)
        console.error(`Failed to re-encrypt key "${key}":`, error)
      }
    }

    if (reencryptErrors.length > 0) {
      throw new EncryptionError(
        `Re-encryption failed for keys: ${reencryptErrors.join(', ')}`
      )
    }

    // Update password and test data
    this.password = newPassword
    await this.baseAdapter.set('encryption_test', await encrypt({ test: true }, newPassword))
  }

  /**
   * Check if migration is needed
   */
  private async needsMigration(): Promise<boolean> {
    const migrationComplete = await this.baseAdapter.get<string>('encryption_migration_complete')
    
    if (migrationComplete === 'true') {
      return false
    }

    // Check if any sensitive keys exist in plain text
    for (const key of this.sensitiveKeys) {
      const rawValue = await this.baseAdapter.get<any>(key)
      if (rawValue) {
        const rawString = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue)
        if (!isEncrypted(rawString)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{ total: number; encrypted: number; plainText: number }> {
    let total = 0
    let encrypted = 0
    let plainText = 0

    const allKeys = await this.baseAdapter.keys()

    for (const key of allKeys) {
      if (this.shouldEncrypt(key)) {
        const rawValue = await this.baseAdapter.get<any>(key)
        if (rawValue) {
          total++
          const rawString = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue)
          if (isEncrypted(rawString)) {
            encrypted++
          } else {
            plainText++
          }
        }
      }
    }

    return { total, encrypted, plainText }
  }
}
