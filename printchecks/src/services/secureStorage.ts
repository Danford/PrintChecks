/**
 * Secure Storage Service
 * Transparently encrypts/decrypts data stored in localStorage
 */

import { encrypt, decrypt, isEncrypted } from './encryption'

// Keys that should be encrypted when encryption is enabled
const SENSITIVE_KEYS = [
  'checkList',
  'printchecks_receipts',
  'printchecks_payments',
  'vendors',
  'bankAccounts',
  'printchecks_templates',
  'printchecks_receipt_templates',
  'printchecks_customization',
  'printchecks_presets',
  'printchecks_settings'
]

// Metadata keys (not encrypted)
const METADATA_KEYS = ['encryption_enabled', 'encryption_test', 'encryption_migration_complete']

class SecureStorage {
  private password: string | null = null
  private encryptionEnabled = false

  /**
   * Initialize the secure storage with a password
   */
  initialize(password: string | null = null) {
    this.password = password
    this.encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true'
    console.log('[SecureStorage] Initialized, encryption enabled:', this.encryptionEnabled)
  }

  /**
   * Update the password (used when password changes)
   */
  updatePassword(newPassword: string) {
    this.password = newPassword
    console.log('[SecureStorage] Password updated')
  }

  /**
   * Check if a key should be encrypted
   */
  private shouldEncrypt(key: string): boolean {
    return SENSITIVE_KEYS.includes(key) && !METADATA_KEYS.includes(key)
  }

  /**
   * Get data from localStorage, automatically decrypting if needed
   */
  async get(key: string): Promise<any> {
    try {
      const rawValue = localStorage.getItem(key)
      if (!rawValue) {
        return null
      }

      // Metadata keys are never encrypted
      if (METADATA_KEYS.includes(key)) {
        return rawValue
      }

      // Check if the data is encrypted
      if (isEncrypted(rawValue)) {
        if (!this.password) {
          console.error('[SecureStorage] Cannot decrypt without password:', key)
          throw new Error('Password required to decrypt data')
        }

        try {
          const decrypted = await decrypt(rawValue, this.password)
          return decrypted
        } catch (error) {
          console.error('[SecureStorage] Decryption failed for key:', key, error)
          throw new Error(`Failed to decrypt ${key}. Wrong password or corrupted data.`)
        }
      }

      // Data is not encrypted, return as-is (for backward compatibility)
      return rawValue
    } catch (error) {
      console.error('[SecureStorage] Error getting key:', key, error)
      throw error
    }
  }

  /**
   * Set data in localStorage, automatically encrypting if needed
   */
  async set(key: string, value: any): Promise<void> {
    try {
      // Metadata keys are never encrypted
      if (METADATA_KEYS.includes(key)) {
        localStorage.setItem(key, value)
        return
      }

      // Check if we should encrypt this key
      if (this.encryptionEnabled && this.shouldEncrypt(key) && this.password) {
        try {
          const encrypted = await encrypt(value, this.password)
          localStorage.setItem(key, encrypted)
          console.log('[SecureStorage] Encrypted and stored:', key)
        } catch (error) {
          console.error('[SecureStorage] Encryption failed for key:', key, error)
          throw new Error(`Failed to encrypt ${key}`)
        }
      } else {
        // Store as plain text
        localStorage.setItem(key, value)
      }
    } catch (error) {
      console.error('[SecureStorage] Error setting key:', key, error)
      throw error
    }
  }

  /**
   * Remove a key from localStorage
   */
  remove(key: string): void {
    localStorage.removeItem(key)
  }

  /**
   * Clear all data from localStorage
   */
  clear(): void {
    localStorage.clear()
  }

  /**
   * Migrate existing plain text data to encrypted format
   */
  async migrateToEncrypted(): Promise<void> {
    if (!this.password) {
      throw new Error('Password required for migration')
    }

    console.log('[SecureStorage] Starting migration to encrypted storage...')

    const migrationErrors: string[] = []

    for (const key of SENSITIVE_KEYS) {
      try {
        const rawValue = localStorage.getItem(key)
        if (!rawValue) {
          console.log(`[SecureStorage] Skipping ${key} - no data found`)
          continue
        }

        // Skip if already encrypted
        if (isEncrypted(rawValue)) {
          console.log(`[SecureStorage] Skipping ${key} - already encrypted`)
          continue
        }

        // Encrypt the data
        console.log(`[SecureStorage] Encrypting ${key}...`)
        const encrypted = await encrypt(rawValue, this.password)
        localStorage.setItem(key, encrypted)
        console.log(`[SecureStorage] ✓ Successfully encrypted ${key}`)
      } catch (error) {
        console.error(`[SecureStorage] Failed to migrate ${key}:`, error)
        migrationErrors.push(key)
      }
    }

    if (migrationErrors.length > 0) {
      throw new Error(`Migration failed for keys: ${migrationErrors.join(', ')}`)
    }

    // Mark migration as complete
    localStorage.setItem('encryption_migration_complete', 'true')
    console.log('[SecureStorage] Migration completed successfully')
  }

  /**
   * Migrate encrypted data back to plain text
   */
  async migrateToPlainText(): Promise<void> {
    if (!this.password) {
      throw new Error('Password required for decryption during migration')
    }

    console.log('[SecureStorage] Starting migration to plain text storage...')

    const migrationErrors: string[] = []

    for (const key of SENSITIVE_KEYS) {
      try {
        const rawValue = localStorage.getItem(key)
        if (!rawValue) {
          console.log(`[SecureStorage] Skipping ${key} - no data found`)
          continue
        }

        // Skip if already plain text
        if (!isEncrypted(rawValue)) {
          console.log(`[SecureStorage] Skipping ${key} - already plain text`)
          continue
        }

        // Decrypt the data
        console.log(`[SecureStorage] Decrypting ${key}...`)
        const decrypted = await decrypt(rawValue, this.password)
        const plainText = typeof decrypted === 'string' ? decrypted : JSON.stringify(decrypted)
        localStorage.setItem(key, plainText)
        console.log(`[SecureStorage] ✓ Successfully decrypted ${key}`)
      } catch (error) {
        console.error(`[SecureStorage] Failed to migrate ${key}:`, error)
        migrationErrors.push(key)
      }
    }

    if (migrationErrors.length > 0) {
      throw new Error(`Migration failed for keys: ${migrationErrors.join(', ')}`)
    }

    // Clear migration flag
    localStorage.removeItem('encryption_migration_complete')
    console.log('[SecureStorage] Migration to plain text completed successfully')
  }

  /**
   * Re-encrypt all data with a new password
   */
  async reencryptWithNewPassword(oldPassword: string, newPassword: string): Promise<void> {
    console.log('[SecureStorage] Starting re-encryption with new password...')

    const reencryptErrors: string[] = []

    for (const key of SENSITIVE_KEYS) {
      try {
        const rawValue = localStorage.getItem(key)
        if (!rawValue) {
          continue
        }

        // Skip if not encrypted
        if (!isEncrypted(rawValue)) {
          continue
        }

        // Decrypt with old password
        console.log(`[SecureStorage] Re-encrypting ${key}...`)
        const decrypted = await decrypt(rawValue, oldPassword)

        // Encrypt with new password
        const encrypted = await encrypt(decrypted, newPassword)
        localStorage.setItem(key, encrypted)
        console.log(`[SecureStorage] ✓ Successfully re-encrypted ${key}`)
      } catch (error) {
        console.error(`[SecureStorage] Failed to re-encrypt ${key}:`, error)
        reencryptErrors.push(key)
      }
    }

    if (reencryptErrors.length > 0) {
      throw new Error(`Re-encryption failed for keys: ${reencryptErrors.join(', ')}`)
    }

    console.log('[SecureStorage] Re-encryption completed successfully')
  }

  /**
   * Check if migration is needed
   */
  needsMigration(): boolean {
    const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true'
    const migrationComplete = localStorage.getItem('encryption_migration_complete') === 'true'

    if (!encryptionEnabled) {
      return false
    }

    // Check if any sensitive keys exist in plain text
    for (const key of SENSITIVE_KEYS) {
      const rawValue = localStorage.getItem(key)
      if (rawValue && !isEncrypted(rawValue)) {
        return true
      }
    }

    return !migrationComplete
  }

  /**
   * Get storage statistics
   */
  getStats(): { total: number; encrypted: number; plainText: number } {
    let total = 0
    let encrypted = 0
    let plainText = 0

    for (const key of SENSITIVE_KEYS) {
      const rawValue = localStorage.getItem(key)
      if (rawValue) {
        total++
        if (isEncrypted(rawValue)) {
          encrypted++
        } else {
          plainText++
        }
      }
    }

    return { total, encrypted, plainText }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage()
