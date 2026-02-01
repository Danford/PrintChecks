# Storage Adapters

Storage adapters for persisting data.

## StorageAdapter Interface

```typescript
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}
```

## LocalStorageAdapter

Default storage adapter using browser localStorage.

```typescript
import { LocalStorageAdapter } from '@printchecks/core'

const storage = new LocalStorageAdapter({
  prefix: 'printchecks_'
})
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `'printchecks_'` | Storage key prefix |

## SecureStorageAdapter

Encrypted storage adapter using AES-256-GCM.

```typescript
import { SecureStorageAdapter, LocalStorageAdapter } from '@printchecks/core'

const baseStorage = new LocalStorageAdapter()
const secureStorage = new SecureStorageAdapter(baseStorage, {
  encryption: true,
  autoMigrate: true
})

await secureStorage.initialize('my-password')
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `encryption` | `boolean` | `false` | Enable encryption |
| `autoMigrate` | `boolean` | `false` | Auto-migrate from unencrypted |

### Methods

- `initialize(password)` - Initialize encryption with password
- `migrateToEncrypted(password)` - Migrate to encrypted storage
- `migrateToPlainText(password)` - Migrate to plain text storage
- `changePassword(oldPassword, newPassword)` - Change encryption password

## Custom Storage Adapter

Implement the `StorageAdapter` interface:

```typescript
class CustomAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    // Your implementation
  }

  async set<T>(key: string, value: T): Promise<void> {
    // Your implementation
  }

  async remove(key: string): Promise<void> {
    // Your implementation
  }

  async clear(): Promise<void> {
    // Your implementation
  }
}

const printChecks = new PrintChecksCore({
  storage: new CustomAdapter()
})
```

## See Also

- [Storage Adapters Guide](/guide/storage-adapters)
- [Encryption Guide](/guide/encryption)
- [Custom Adapter Example](/examples/custom-adapter)
