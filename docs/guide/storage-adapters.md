# Storage Adapters

Customize how PrintChecks stores data with custom storage adapters.

## Overview

Storage adapters define how PrintChecks persists data. PrintChecks includes two built-in adapters and supports custom implementations.

## Built-in Adapters

### LocalStorageAdapter

The default adapter uses browser localStorage:

```typescript
import { PrintChecksCore, LocalStorageAdapter } from '@printchecks/core'

const printChecks = new PrintChecksCore({
  storage: new LocalStorageAdapter({
    storagePrefix: 'printchecks'  // Optional, defaults to 'printchecks'
  })
})
```

### SecureStorageAdapter

Encrypted storage using AES-256-GCM:

```typescript
import { PrintChecksCore, SecureStorageAdapter } from '@printchecks/core'

const printChecks = new PrintChecksCore({
  storage: new SecureStorageAdapter({
    encryptionKey: 'your-secure-encryption-key',
    storagePrefix: 'printchecks'
  })
})
```

## Custom Storage Adapter

Create a custom adapter by implementing the `StorageAdapter` interface:

```typescript
interface StorageAdapter {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
```

### Example: IndexedDB Adapter

```typescript
class IndexedDBAdapter implements StorageAdapter {
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null

  constructor(options: { dbName: string; storeName: string }) {
    this.dbName = options.dbName
    this.storeName = options.storeName
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  async get(key: string): Promise<any> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete(key: string): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// Use it
const printChecks = new PrintChecksCore({
  storage: new IndexedDBAdapter({
    dbName: 'printchecks',
    storeName: 'data'
  })
})
```

### Example: Remote API Adapter

```typescript
class RemoteAPIAdapter implements StorageAdapter {
  private apiUrl: string
  private authToken: string

  constructor(options: { apiUrl: string; authToken: string }) {
    this.apiUrl = options.apiUrl
    this.authToken = options.authToken
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    }
  }

  async get(key: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/data/${key}`, {
      headers: this.headers()
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get ${key}: ${response.statusText}`)
    }

    return response.json()
  }

  async set(key: string, value: any): Promise<void> {
    const response = await fetch(`${this.apiUrl}/data/${key}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(value)
    })

    if (!response.ok) {
      throw new Error(`Failed to set ${key}: ${response.statusText}`)
    }
  }

  async delete(key: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/data/${key}`, {
      method: 'DELETE',
      headers: this.headers()
    })

    if (!response.ok) {
      throw new Error(`Failed to delete ${key}: ${response.statusText}`)
    }
  }

  async clear(): Promise<void> {
    const response = await fetch(`${this.apiUrl}/data`, {
      method: 'DELETE',
      headers: this.headers()
    })

    if (!response.ok) {
      throw new Error(`Failed to clear data: ${response.statusText}`)
    }
  }
}

// Use it
const printChecks = new PrintChecksCore({
  storage: new RemoteAPIAdapter({
    apiUrl: 'https://api.example.com',
    authToken: 'your-auth-token'
  })
})
```

### Example: In-Memory Adapter (Testing)

```typescript
class InMemoryAdapter implements StorageAdapter {
  private data: Map<string, any> = new Map()

  async get(key: string): Promise<any> {
    return this.data.get(key) || null
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value)
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key)
  }

  async clear(): Promise<void> {
    this.data.clear()
  }
}

// Use for testing
const printChecks = new PrintChecksCore({
  storage: new InMemoryAdapter()
})
```

### Example: File System Adapter (Node.js)

```typescript
import { promises as fs } from 'fs'
import path from 'path'

class FileSystemAdapter implements StorageAdapter {
  private dataDir: string

  constructor(options: { dataDir: string }) {
    this.dataDir = options.dataDir
  }

  private async ensureDir() {
    await fs.mkdir(this.dataDir, { recursive: true })
  }

  private filePath(key: string): string {
    return path.join(this.dataDir, `${key}.json`)
  }

  async get(key: string): Promise<any> {
    try {
      const data = await fs.readFile(this.filePath(key), 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      if ((error as any).code === 'ENOENT') return null
      throw error
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.ensureDir()
    await fs.writeFile(this.filePath(key), JSON.stringify(value, null, 2))
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.filePath(key))
    } catch (error) {
      if ((error as any).code !== 'ENOENT') throw error
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.dataDir)
      await Promise.all(
        files
          .filter(f => f.endsWith('.json'))
          .map(f => fs.unlink(path.join(this.dataDir, f)))
      )
    } catch (error) {
      if ((error as any).code !== 'ENOENT') throw error
    }
  }
}

// Use it
const printChecks = new PrintChecksCore({
  storage: new FileSystemAdapter({
    dataDir: './printchecks-data'
  })
})
```

## Adapter Composition

Combine multiple adapters:

```typescript
class CompositeAdapter implements StorageAdapter {
  private primaryAdapter: StorageAdapter
  private backupAdapter: StorageAdapter

  constructor(primary: StorageAdapter, backup: StorageAdapter) {
    this.primaryAdapter = primary
    this.backupAdapter = backup
  }

  async get(key: string): Promise<any> {
    try {
      return await this.primaryAdapter.get(key)
    } catch (error) {
      console.warn('Primary adapter failed, trying backup:', error)
      return await this.backupAdapter.get(key)
    }
  }

  async set(key: string, value: any): Promise<void> {
    await Promise.all([
      this.primaryAdapter.set(key, value),
      this.backupAdapter.set(key, value)
    ])
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.primaryAdapter.delete(key),
      this.backupAdapter.delete(key)
    ])
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.primaryAdapter.clear(),
      this.backupAdapter.clear()
    ])
  }
}

// Use it
const printChecks = new PrintChecksCore({
  storage: new CompositeAdapter(
    new IndexedDBAdapter({ dbName: 'printchecks', storeName: 'data' }),
    new LocalStorageAdapter({ storagePrefix: 'printchecks-backup' })
  )
})
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully
2. **Async Operations**: All methods should be async
3. **Type Safety**: Use TypeScript for type checking
4. **Testing**: Test your adapter thoroughly
5. **Performance**: Consider caching for remote adapters

## Next Steps

- [Encryption](/guide/encryption) - Secure storage with encryption
- [Examples](/examples/custom-adapter) - Complete custom adapter example
- [API Reference](/api/core/storage-adapters) - Complete API documentation
