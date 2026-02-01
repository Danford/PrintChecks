# Encrypted Storage

Secure sensitive data with encryption.

## Basic Encryption

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore({
  storageOptions: {
    encryption: true,
    password: 'my-secure-password'
  }
})

// Wait for encryption initialization
await printChecks.waitForInitialization()

// All data is now encrypted
const bankAccount = await printChecks.createBankAccount({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking'
})
```

## User Password-Based Encryption

```typescript
import { PrintChecksCore } from '@printchecks/core'

async function deriveKeyFromPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const password = prompt('Enter encryption password:')
const encryptionKey = await deriveKeyFromPassword(password)

const printChecks = new PrintChecksCore({
  storageOptions: {
    encryption: true,
    password: encryptionKey
  }
})

await printChecks.waitForInitialization()
```

## Vue with Encryption

```vue
<script setup>
import { ref } from 'vue'
import { usePrintChecks } from '@printchecks/vue'

const password = ref('')
const isUnlocked = ref(false)

const unlock = async () => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password.value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const key = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  const printChecks = usePrintChecks({
    storageOptions: {
      encryption: true,
      password: key
    }
  })

  await printChecks.core.waitForInitialization()
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

## See Also

- [Storage Adapters](/guide/storage-adapters)
- [Encryption Guide](/guide/encryption)
