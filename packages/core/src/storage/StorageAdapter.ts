/**
 * Storage adapter interface for abstracting storage backends
 */

export interface StorageAdapter {
  /**
   * Get a value from storage
   */
  get<T = unknown>(key: string): Promise<T | null>

  /**
   * Set a value in storage
   */
  set<T = unknown>(key: string, value: T): Promise<void>

  /**
   * Remove a value from storage
   */
  remove(key: string): Promise<void>

  /**
   * Clear all values from storage
   */
  clear(): Promise<void>

  /**
   * Get all keys in storage
   */
  keys(): Promise<string[]>

  /**
   * Check if a key exists in storage
   */
  has(key: string): Promise<boolean>

  /**
   * Get multiple values at once
   */
  getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>>

  /**
   * Set multiple values at once
   */
  setMany(entries: Map<string, unknown>): Promise<void>
}

export interface EncryptedStorageAdapter extends StorageAdapter {
  /**
   * Initialize encryption with a password
   */
  initialize(password: string): Promise<void>

  /**
   * Check if encryption is enabled
   */
  isEncryptionEnabled(): boolean

  /**
   * Migrate data to encrypted format
   */
  migrateToEncrypted(password: string): Promise<void>

  /**
   * Migrate data to plain text format
   */
  migrateToPlainText(password: string): Promise<void>

  /**
   * Change encryption password
   */
  changePassword(oldPassword: string, newPassword: string): Promise<void>
}

export interface StorageOptions {
  /**
   * Prefix for all storage keys
   */
  prefix?: string

  /**
   * Enable encryption
   */
  encryption?: boolean

  /**
   * Encryption password (required if encryption is enabled)
   */
  password?: string

  /**
   * Serialize/deserialize options
   */
  serialization?: {
    serialize?: (value: unknown) => string
    deserialize?: (value: string) => unknown
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

export class EncryptionError extends StorageError {
  constructor(message: string, cause?: Error) {
    super(message, cause)
    this.name = 'EncryptionError'
  }
}
