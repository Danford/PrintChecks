# Installation

This guide covers installing PrintChecks packages for different use cases.

## Package Overview

PrintChecks is distributed as three packages:

| Package | Description | Use Case |
|---------|-------------|----------|
| `@printchecks/core` | Framework-agnostic core library | Node.js, custom frameworks, or when you need full control |
| `@printchecks/vue` | Vue 3 composables and integrations | Vue 3 applications |
| `@printchecks/web-components` | Framework-agnostic Web Components | Any framework (React, Angular, etc.) or vanilla JS |

## Prerequisites

- **Node.js** 18+ (recommended) or 16+
- **npm**, **pnpm**, or **yarn** package manager

## Installing @printchecks/vue

For Vue 3 applications, install the Vue package which includes the core library:

::: code-group

```bash [npm]
npm install @printchecks/vue
```

```bash [pnpm]
pnpm add @printchecks/vue
```

```bash [yarn]
yarn add @printchecks/vue
```

:::

### Vue Usage

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'

const { checks, createCheck } = usePrintChecks()
</script>
```

## Installing @printchecks/core

For framework-agnostic usage or when building custom integrations:

::: code-group

```bash [npm]
npm install @printchecks/core
```

```bash [pnpm]
pnpm add @printchecks/core
```

```bash [yarn]
yarn add @printchecks/core
```

:::

### Core Usage

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()
const checks = await printChecks.checks.list()
```

## Installing @printchecks/web-components

For framework-agnostic Web Components that work with any framework:

::: code-group

```bash [npm]
npm install @printchecks/web-components
```

```bash [pnpm]
pnpm add @printchecks/web-components
```

```bash [yarn]
yarn add @printchecks/web-components
```

:::

### Web Components Usage

```html
<script type="module">
  import '@printchecks/web-components'
</script>

<check-form></check-form>
```

## CDN Usage

For quick prototyping or static sites, use the CDN:

```html
<!-- Via unpkg -->
<script type="module">
  import '@printchecks/web-components' from 'https://unpkg.com/@printchecks/web-components'
</script>

<!-- Via jsDelivr -->
<script type="module">
  import '@printchecks/web-components' from 'https://cdn.jsdelivr.net/npm/@printchecks/web-components'
</script>
```

## TypeScript Support

All packages include TypeScript definitions out of the box. No additional `@types` packages needed.

```typescript
import type { Check, BankAccount, Vendor } from '@printchecks/core'
```

## Build Tool Configuration

### Vite

No additional configuration needed. PrintChecks works with Vite out of the box.

### Webpack

If using webpack, ensure you have the appropriate loaders for TypeScript:

```bash
npm install --save-dev ts-loader
```

### Next.js

For Next.js applications, use the core library or web components:

```typescript
// pages/_app.tsx
import '@printchecks/web-components'
```

### Nuxt 3

For Nuxt 3, install the Vue package:

```bash
pnpm add @printchecks/vue
```

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'
</script>
```

## Verifying Installation

After installation, verify it works:

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()
console.log('PrintChecks initialized:', printChecks)
```

If you see no errors, you're ready to go!

## Next Steps

- [Basic Usage](/guide/basic-usage) - Learn the fundamentals
- [Bank Accounts](/guide/bank-accounts) - Set up your first bank account
- [Checks](/guide/checks) - Create and manage checks
- [API Reference](/api/core/printchecks-core) - Detailed API documentation
