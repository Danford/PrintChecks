/**
 * LocalStorage implementation of StorageAdapter
 */

import type { StorageAdapter, StorageOptions } from './StorageAdapter'
import { StorageError } from './StorageAdapter'

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string
  private serialize: (value: unknown) => string
  private deserialize: (value: string) => unknown

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'printchecks_'
    this.serialize = options.serialization?.serialize || JSON.stringify
    this.deserialize = options.serialization?.deserialize || JSON.parse

    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      throw new StorageError('localStorage is not available in this environment')
    }
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key)
      const value = localStorage.getItem(fullKey)

      if (value === null) {
        return null
      }

      return this.deserialize(value) as T
    } catch (error) {
      throw new StorageError(`Failed to get key "${key}" from localStorage`, error as Error)
    }
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getFullKey(key)
      const serialized = this.serialize(value)
      localStorage.setItem(fullKey, serialized)
    } catch (error) {
      // Check for quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new StorageError('Storage quota exceeded', error)
      }
      throw new StorageError(`Failed to set key "${key}" in localStorage`, error as Error)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key)
      localStorage.removeItem(fullKey)
    } catch (error) {
      throw new StorageError(`Failed to remove key "${key}" from localStorage`, error as Error)
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.keys()
      for (const key of keys) {
        await this.remove(key)
      }
    } catch (error) {
      throw new StorageError('Failed to clear localStorage', error as Error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      const allKeys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          allKeys.push(key.substring(this.prefix.length))
        }
      }
      return allKeys
    } catch (error) {
      throw new StorageError('Failed to get keys from localStorage', error as Error)
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key)
      return localStorage.getItem(fullKey) !== null
    } catch (error) {
      throw new StorageError(
        `Failed to check if key "${key}" exists in localStorage`,
        error as Error
      )
    }
  }

  async getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()

    for (const key of keys) {
      try {
        const value = await this.get<T>(key)
        results.set(key, value)
      } catch (_error) {
        // Continue with other keys if one fails
        results.set(key, null)
      }
    }

    return results
  }

  async setMany(entries: Map<string, unknown>): Promise<void> {
    const errors: Array<{ key: string; error: Error }> = []

    for (const [key, value] of entries) {
      try {
        await this.set(key, value)
      } catch (error) {
        errors.push({ key, error: error as Error })
      }
    }

    if (errors.length > 0) {
      throw new StorageError(
        `Failed to set ${errors.length} keys: ${errors.map((e) => e.key).join(', ')}`
      )
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): { used: number; available?: number; percentage?: number } {
    let used = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key)
        if (value) {
          used += key.length + value.length
        }
      }
    }

    // Most browsers limit localStorage to 5-10MB
    const estimated = 5 * 1024 * 1024 // 5MB

    return {
      used,
      available: estimated,
      percentage: (used / estimated) * 100,
    }
  }
}
