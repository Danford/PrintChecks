# Custom Storage Adapter

Create a custom storage adapter.

## IndexedDB Example

```typescript
import type { StorageAdapter } from '@printchecks/core'

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

  async get<T>(key: string): Promise<T | null> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async remove(key: string): Promise<void> {
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

// Usage
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore({
  storage: new IndexedDBAdapter({
    dbName: 'printchecks',
    storeName: 'data'
  })
})
```

## See Also

- [Storage Adapters Guide](/guide/storage-adapters)
- [StorageAdapter API](/api/core/storage-adapters)
