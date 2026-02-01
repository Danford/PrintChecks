# Encryption

Secure sensitive data with encryption.

## Overview

PrintChecks includes optional encryption for sensitive data like bank account information. Use the `SecureStorageAdapter` to encrypt data before storing it in localStorage.

## SecureStorageAdapter

The `SecureStorageAdapter` encrypts all data before storing and decrypts when retrieving:

```typescript
import { PrintChecksCore, SecureStorageAdapter } from '@printchecks/core'

const printChecks = new PrintChecksCore({
  storage: new SecureStorageAdapter({
    encryptionKey: 'your-secure-encryption-key-min-32-chars',
    storagePrefix: 'printchecks'
  })
})

// All data is now encrypted in localStorage
const bankAccount = await printChecks.bankAccounts.create({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking'
})
```

## Encryption Key Management

::: danger IMPORTANT
Store your encryption key securely. If you lose the key, you cannot decrypt your data!
:::

### Generating a Secure Key

```typescript
function generateEncryptionKey(): string {
  // Use Web Crypto API to generate a random key
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

const encryptionKey = generateEncryptionKey()
console.log('Save this key securely:', encryptionKey)
```

### Storing the Key

**Option 1: Environment Variables (Recommended for development)**

```typescript
// .env.local
VITE_ENCRYPTION_KEY=your-generated-key-here
```

```typescript
// In your app
const printChecks = new PrintChecksCore({
  storage: new SecureStorageAdapter({
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY
  })
})
```

**Option 2: User-Provided Password**

Derive an encryption key from a user password:

```typescript
async function deriveKeyFromPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get password from user
const password = prompt('Enter your encryption password:')
const encryptionKey = await deriveKeyFromPassword(password)

const printChecks = new PrintChecksCore({
  storage: new SecureStorageAdapter({
    encryptionKey
  })
})
```

**Option 3: Session Storage**

Store key in session storage (cleared when browser closes):

```typescript
// On login
const encryptionKey = await deriveKeyFromPassword(userPassword)
sessionStorage.setItem('encryptionKey', encryptionKey)

// In app
const encryptionKey = sessionStorage.getItem('encryptionKey')
if (!encryptionKey) {
  // Prompt user to log in again
}

const printChecks = new PrintChecksCore({
  storage: new SecureStorageAdapter({
    encryptionKey
  })
})
```

## Encryption Details

The `SecureStorageAdapter` uses:

- **Algorithm**: AES-256-GCM
- **Key Derivation**: User-provided key (should be 256 bits/32 bytes)
- **Encryption**: All data is encrypted before storage
- **Decryption**: Automatic when reading data

## Migrating to Encrypted Storage

If you have existing unencrypted data, migrate it:

```typescript
import { PrintChecksCore, LocalStorageAdapter, SecureStorageAdapter } from '@printchecks/core'

async function migrateToEncrypted() {
  // Load data with old adapter
  const oldPrintChecks = new PrintChecksCore({
    storage: new LocalStorageAdapter({ storagePrefix: 'printchecks' })
  })

  const checks = await oldPrintChecks.checks.list()
  const vendors = await oldPrintChecks.vendors.list()
  const bankAccounts = await oldPrintChecks.bankAccounts.list()
  const receipts = await oldPrintChecks.receipts.list()

  // Create new instance with encrypted storage
  const newPrintChecks = new PrintChecksCore({
    storage: new SecureStorageAdapter({
      encryptionKey: 'your-encryption-key',
      storagePrefix: 'printchecks-encrypted'
    })
  })

  // Migrate data
  for (const account of bankAccounts) {
    await newPrintChecks.bankAccounts.create(account)
  }

  for (const vendor of vendors) {
    await newPrintChecks.vendors.create(vendor)
  }

  for (const check of checks) {
    await newPrintChecks.checks.create(check)
  }

  for (const receipt of receipts) {
    await newPrintChecks.receipts.create(receipt)
  }

  console.log('Migration complete!')
}
```

## Selective Encryption

Encrypt only sensitive data (bank accounts) while leaving other data unencrypted:

```typescript
// Custom implementation
class SelectiveStorageAdapter {
  private secureAdapter: SecureStorageAdapter
  private regularAdapter: LocalStorageAdapter

  constructor(encryptionKey: string) {
    this.secureAdapter = new SecureStorageAdapter({
      encryptionKey,
      storagePrefix: 'printchecks-secure'
    })
    this.regularAdapter = new LocalStorageAdapter({
      storagePrefix: 'printchecks'
    })
  }

  async get(key: string) {
    // Encrypt bank accounts, use regular storage for others
    if (key.includes('bankAccounts')) {
      return this.secureAdapter.get(key)
    }
    return this.regularAdapter.get(key)
  }

  async set(key: string, value: any) {
    if (key.includes('bankAccounts')) {
      return this.secureAdapter.set(key, value)
    }
    return this.regularAdapter.set(key, value)
  }

  async delete(key: string) {
    if (key.includes('bankAccounts')) {
      return this.secureAdapter.delete(key)
    }
    return this.regularAdapter.delete(key)
  }

  async clear() {
    await this.secureAdapter.clear()
    await this.regularAdapter.clear()
  }
}
```

## Best Practices

1. **Use Strong Keys**: Minimum 32 characters, randomly generated
2. **Never Hardcode Keys**: Use environment variables or user-provided passwords
3. **Backup Keys**: Store encryption keys securely (password manager, secure notes)
4. **User Education**: Inform users they need their encryption password to access data
5. **Key Rotation**: Periodically change encryption keys and re-encrypt data

## Security Considerations

::: warning
Encryption in the browser has limitations:
- Keys stored in browser memory can be accessed by other scripts
- XSS vulnerabilities can expose encryption keys
- Browser extensions can access localStorage
- User's device must be secure
:::

### Additional Security Measures

1. **Use HTTPS**: Always serve your app over HTTPS
2. **Content Security Policy**: Implement CSP to prevent XSS
3. **Audit Dependencies**: Regularly audit npm packages for vulnerabilities
4. **Limit Access**: Only allow authorized users to access the app
5. **Session Timeouts**: Implement automatic logout after inactivity

## Using with Vue

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { usePrintChecks } from '@printchecks/vue'
import { SecureStorageAdapter } from '@printchecks/core'

const password = ref('')
const isUnlocked = ref(false)

const unlock = async () => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password.value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const encryptionKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // Initialize with encrypted storage
  const { initialize } = usePrintChecks({
    storage: new SecureStorageAdapter({
      encryptionKey
    })
  })

  isUnlocked.value = true
}
</script>

<template>
  <div v-if="!isUnlocked">
    <h2>Enter Password</h2>
    <input v-model="password" type="password" @keyup.enter="unlock" />
    <button @click="unlock">Unlock</button>
  </div>
  <div v-else>
    <!-- Your app content -->
  </div>
</template>
```

## Next Steps

- [Storage Adapters](/guide/storage-adapters) - Custom storage implementations
- [Security Best Practices](/reference/faq#security) - Additional security guidance
- [API Reference](/api/core/storage-adapters) - Complete API documentation
