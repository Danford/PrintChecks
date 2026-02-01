# Troubleshooting

Common issues and solutions for PrintChecks.

## Installation Issues

### Package Not Found

**Problem**: `npm ERR! 404 Not Found - GET https://registry.npmjs.org/@printchecks/core`

**Solution**: Ensure the package name is correct and the package is published:

```bash
npm install @printchecks/core
```

If the package isn't published yet, you can install from the local workspace:

```bash
# In monorepo root
pnpm install
pnpm build
```

### TypeScript Errors

**Problem**: TypeScript can't find type definitions

**Solution**: Ensure TypeScript is configured correctly:

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  }
}
```

## Storage Issues

### Data Not Persisting

**Problem**: Data disappears after page refresh

**Solution**: Check that localStorage is enabled:

```typescript
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

if (!isLocalStorageAvailable()) {
  console.error('localStorage is not available')
  // Use a different storage adapter
}
```

### Storage Quota Exceeded

**Problem**: `QuotaExceededError: The quota has been exceeded`

**Solution**: localStorage has a 5-10MB limit. Consider using IndexedDB:

```typescript
import { IndexedDBAdapter } from './adapters/indexeddb'

const printChecks = new PrintChecksCore({
  storage: new IndexedDBAdapter({
    dbName: 'printchecks',
    storeName: 'data'
  })
})
```

## Encryption Issues

### Wrong Encryption Key

**Problem**: Data can't be decrypted after page refresh

**Solution**: Ensure the encryption key is stored securely and retrieved correctly:

```typescript
// Store key in sessionStorage (cleared on browser close)
sessionStorage.setItem('encryptionKey', key)

// Retrieve key
const key = sessionStorage.getItem('encryptionKey')
if (!key) {
  // Prompt user to log in again
}
```

### Migration Failures

**Problem**: Can't migrate from unencrypted to encrypted storage

**Solution**: Export data, clear storage, then import with encrypted adapter:

```typescript
// 1. Export with old adapter
const oldPC = new PrintChecksCore({
  storage: new LocalStorageAdapter()
})
const data = {
  checks: await oldPC.checks.list(),
  vendors: await oldPC.vendors.list(),
  bankAccounts: await oldPC.bankAccounts.list()
}

// 2. Clear old data
localStorage.clear()

// 3. Import with new encrypted adapter
const newPC = new PrintChecksCore({
  storage: new SecureStorageAdapter({ encryptionKey: 'key' })
})

for (const check of data.checks) {
  await newPC.checks.create(check)
}
// ... import other data
```

## Printing Issues

### MICR Font Not Loading

**Problem**: Routing and account numbers don't display in MICR font

**Solution**: Ensure the MICR font is loaded:

```css
@font-face {
  font-family: 'MICR E13B';
  src: url('/fonts/MICRE13B.woff2') format('woff2'),
       url('/fonts/MICRE13B.woff') format('woff');
}

.check-micr {
  font-family: 'MICR E13B', monospace;
}
```

### Print Preview Issues

**Problem**: Checks don't align correctly in print preview

**Solution**: Use proper print CSS:

```css
@media print {
  @page {
    size: 8.5in 11in;
    margin: 0;
  }

  .check {
    page-break-after: always;
    page-break-inside: avoid;
  }
}
```

### Colors Not Printing

**Problem**: Background colors don't print

**Solution**: Use print-color-adjust:

```css
.check {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
```

## Web Components Issues

### Components Not Defined

**Problem**: `Uncaught DOMException: Failed to execute 'define' on 'CustomElementRegistry'`

**Solution**: Ensure web components are imported only once:

```typescript
// Only import once in your app
import '@printchecks/web-components'
```

### SSR Errors

**Problem**: Web components fail during server-side rendering

**Solution**: Dynamically import web components client-side:

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  if (typeof window !== 'undefined') {
    await import('@printchecks/web-components')
  }
})
</script>
```

## Performance Issues

### Slow List Operations

**Problem**: Listing checks takes too long with large datasets

**Solution**: Implement pagination:

```typescript
function paginateChecks(checks: Check[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return checks.slice(start, end)
}

const allChecks = await printChecks.checks.list()
const page1 = paginateChecks(allChecks, 1, 50)
```

### Large Data Export

**Problem**: Exporting large datasets causes browser to freeze

**Solution**: Export in chunks:

```typescript
async function exportInChunks() {
  const checks = await printChecks.checks.list()
  const chunkSize = 100

  for (let i = 0; i < checks.length; i += chunkSize) {
    const chunk = checks.slice(i, i + chunkSize)

    // Process chunk
    await new Promise(resolve => setTimeout(resolve, 10)) // Yield to browser
  }
}
```

## Browser Compatibility

### IE11 Not Supported

**Problem**: App doesn't work in Internet Explorer 11

**Solution**: PrintChecks requires modern browsers. Use polyfills or recommend users upgrade:

```html
<script>
  if (!window.Promise || !window.fetch) {
    document.body.innerHTML = '<p>Please use a modern browser (Chrome, Firefox, Safari, Edge)</p>'
  }
</script>
```

### Safari Private Mode

**Problem**: localStorage doesn't work in Safari Private Mode

**Solution**: Detect and provide fallback:

```typescript
function isPrivateMode(): boolean {
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    return false
  } catch (e) {
    return true
  }
}

if (isPrivateMode()) {
  alert('Private browsing mode detected. Using in-memory storage.')
  // Use InMemoryAdapter
}
```

## Common Errors

### "Bank account not found"

**Problem**: Check creation fails with bank account error

**Solution**: Ensure bank account exists before creating checks:

```typescript
try {
  const check = await printChecks.checks.create({
    checkNumber: 1001,
    bankAccountId: 'invalid-id',
    // ...
  })
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Create bank account first')
  }
}
```

### "Invalid check number"

**Problem**: Check number validation fails

**Solution**: Ensure check number is a positive integer:

```typescript
const checkNumber = parseInt(input, 10)
if (isNaN(checkNumber) || checkNumber <= 0) {
  throw new Error('Check number must be a positive integer')
}
```

## Getting Help

If you're still experiencing issues:

1. Check the [FAQ](/reference/faq)
2. Search [GitHub Issues](https://github.com/Danford/PrintChecks/issues)
3. Create a [new issue](https://github.com/Danford/PrintChecks/issues/new) with:
   - PrintChecks version
   - Browser and version
   - Steps to reproduce
   - Error messages
   - Minimal code example

## Next Steps

- [FAQ](/reference/faq) - Frequently asked questions
- [Examples](/examples/basic-check) - Working code examples
- [API Reference](/api/core/printchecks-core) - Complete API documentation
