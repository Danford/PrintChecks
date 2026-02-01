# Getting Started

Get up and running with PrintChecks in under 5 minutes.

## Installation

Choose the package that fits your needs:

::: code-group

```bash [npm - Vue]
npm install @printchecks/vue
```

```bash [npm - Core]
npm install @printchecks/core
```

```bash [npm - Web Components]
npm install @printchecks/web-components
```

```bash [pnpm - Vue]
pnpm add @printchecks/vue
```

```bash [pnpm - Core]
pnpm add @printchecks/core
```

```bash [pnpm - Web Components]
pnpm add @printchecks/web-components
```

:::

## Your First Check

### With Vue 3

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'
import { ref } from 'vue'

const { checks, bankAccounts, createCheck, createBankAccount } = usePrintChecks()

// Create a bank account first
const bankAccount = await createBankAccount({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking'
})

// Create a check
const check = await createCheck({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corporation',
  amount: 1250.00,
  memo: 'Invoice #12345',
  bankAccountId: bankAccount.id
})

console.log('Check created:', check)
</script>

<template>
  <div>
    <h1>My Checks</h1>
    <ul>
      <li v-for="check in checks" :key="check.id">
        Check #{{ check.checkNumber }} - {{ check.payee }} - ${{ check.amount }}
      </li>
    </ul>
  </div>
</template>
```

### With Core Library

```typescript
import { PrintChecksCore } from '@printchecks/core'

// Initialize the core library
const printChecks = new PrintChecksCore()

// Create a bank account
const bankAccount = await printChecks.bankAccounts.create({
  name: 'Business Checking',
  routingNumber: '123456789',
  accountNumber: '987654321',
  bankName: 'First National Bank',
  accountType: 'checking'
})

// Create a check
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corporation',
  amount: 1250.00,
  memo: 'Invoice #12345',
  bankAccountId: bankAccount.id
})

console.log('Check created:', check)

// List all checks
const allChecks = await printChecks.checks.list()
console.log('All checks:', allChecks)
```

### With Web Components

```html
<!DOCTYPE html>
<html>
<head>
  <title>PrintChecks Example</title>
</head>
<body>
  <h1>Check Printing</h1>

  <!-- Bank Account Form -->
  <bank-account-form></bank-account-form>

  <!-- Check Form -->
  <check-form></check-form>

  <!-- Check Preview -->
  <check-preview check-id="check-1"></check-preview>

  <script type="module">
    import '@printchecks/web-components'

    // Listen for events
    const checkForm = document.querySelector('check-form')
    checkForm.addEventListener('check-created', (event) => {
      console.log('Check created:', event.detail)
    })
  </script>
</body>
</html>
```

## Configuration Options

PrintChecks can be configured with custom storage adapters, encryption, and more:

```typescript
import { PrintChecksCore, SecureStorageAdapter } from '@printchecks/core'

const printChecks = new PrintChecksCore({
  storage: new SecureStorageAdapter({
    encryptionKey: 'your-encryption-key',
    storagePrefix: 'my-app'
  })
})
```

## Next Steps

Now that you have PrintChecks set up, explore these guides:

- [**Bank Accounts**](/guide/bank-accounts) - Managing multiple bank accounts
- [**Checks**](/guide/checks) - Advanced check features
- [**Vendors**](/guide/vendors) - Vendor management
- [**Receipts**](/guide/receipts) - Creating itemized receipts
- [**Encryption**](/guide/encryption) - Securing sensitive data
- [**Storage Adapters**](/guide/storage-adapters) - Custom storage solutions

## Examples

Check out our [examples section](/examples/basic-check) for more detailed code examples:

- [Basic Check Creation](/examples/basic-check)
- [Encrypted Storage Setup](/examples/encrypted-storage)
- [Vue Integration](/examples/vue-integration)
- [React Usage](/examples/react-usage)
- [Custom Storage Adapter](/examples/custom-adapter)

## Need Help?

- Browse the [User Guide](/guide/installation)
- Check the [API Reference](/api/core/printchecks-core)
- Read the [FAQ](/reference/faq)
- View the [GitHub Repository](https://github.com/Danford/PrintChecks)
