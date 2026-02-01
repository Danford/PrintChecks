---
layout: home

hero:
  name: PrintChecks
  text: Privacy-First Check Printing
  tagline: Professional check printing and payment documentation that runs entirely in your browser
  image:
    src: /logo.svg
    alt: PrintChecks
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Danford/PrintChecks

features:
  - icon: 🔒
    title: 100% Private
    details: All processing happens in your browser. No data ever leaves your computer. No servers, no tracking, no compromises.

  - icon: 💰
    title: Cost Effective
    details: Other services charge $1.25+ per check. PrintChecks is free. Buy blank check stock and print unlimited checks.

  - icon: 🏦
    title: Professional Quality
    details: Official E13B MICR font for routing and account numbers. Automatic amount-to-words conversion. Multiple bank accounts.

  - icon: 📋
    title: Complete Documentation
    details: Generate itemized receipts with line items, tax calculations, and professional formatting for business use.

  - icon: 👥
    title: Vendor Management
    details: Store vendor information, quick-fill details on checks, and track payment history per vendor.

  - icon: 📊
    title: Payment Analytics
    details: Track payment volume over time, identify top vendors, analyze monthly spending, and review comprehensive payment history.

  - icon: 🎨
    title: Fully Customizable
    details: Font customization, color schemes, styling presets, logo upload with positioning controls, and more.

  - icon: 🔧
    title: Framework Agnostic
    details: Use with Vue, React, vanilla JavaScript, or any framework. Modular packages for every use case.

  - icon: 📦
    title: Zero Dependencies
    details: Lightweight core library with optional integrations. Only include what you need. Tree-shakeable exports.
---

## Why PrintChecks?

**Privacy First**: Other check printing services require you to upload sensitive banking information to third-party servers and charge premium fees. PrintChecks runs entirely in your browser—no data ever leaves your computer.

**Business Ready**: Manage multiple bank accounts, track vendors, generate professional receipts, and access comprehensive payment analytics—all from one local tool.

**Cost Effective**: Buy blank check stock from any office supply store and print unlimited checks for free. No subscriptions, no per-check fees, no compromises.

## Quick Example

::: code-group

```typescript [Vue]
import { usePrintChecks } from '@printchecks/vue'

const { checks, createCheck } = usePrintChecks()

const newCheck = await createCheck({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corporation',
  amount: 1250.00,
  memo: 'Invoice #12345',
  bankAccountId: 'account-1'
})
```

```typescript [Core]
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corporation',
  amount: 1250.00,
  memo: 'Invoice #12345',
  bankAccountId: 'account-1'
})
```

```html [Web Components]
<script type="module">
  import '@printchecks/web-components'
</script>

<check-form></check-form>
```

:::

## Architecture

PrintChecks is built as a modular monorepo with three packages:

- **[@printchecks/core](https://www.npmjs.com/package/@printchecks/core)** - Framework-agnostic core library
- **[@printchecks/vue](https://www.npmjs.com/package/@printchecks/vue)** - Vue 3 composables and integrations
- **[@printchecks/web-components](https://www.npmjs.com/package/@printchecks/web-components)** - Framework-agnostic Web Components

## Features at a Glance

### Check Printing
- Official E13B MICR font for routing and account numbers
- Automatic amount-to-words conversion
- Multiple bank account support
- Custom logo upload and positioning
- Signature fonts and styling

### Receipt Management
- Itemized receipts with line items
- Automatic calculations (subtotal, tax, totals)
- Professional formatting for business use

### Vendor Management
- Store vendor information (name, address, email, phone)
- Quick-fill vendor details on checks
- Track payment history per vendor

### Payment Analytics
- Payment volume tracking over time
- Top vendors by payment amount
- Monthly spending breakdowns
- Comprehensive payment history

### Privacy & Security
- 100% local processing in your browser
- No network requests or external servers
- Optional encryption for sensitive data
- No tracking, analytics, or cookies

### Customization
- Font customization for every element
- Color schemes and styling presets
- Logo upload with positioning
- Preset system for quick style switching

## Ready to Get Started?

<div class="vp-doc" style="text-align: center; margin-top: 2rem;">
  <a href="/getting-started" class="vp-button brand" style="margin-right: 1rem;">Quick Start Guide</a>
  <a href="/guide/installation" class="vp-button alt">Installation</a>
</div>
