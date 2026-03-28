# Printable Check Page

The standardized printable check page component combines check display, line items, and analytics into a consistent print-ready format.

## 🎮 Interactive Demo

Try the printable check page - **add line items, toggle sections, and see the complete layout!**

<script setup>
import { printableCheckPageCode } from './playground-codes'
</script>

<Playground :code="printableCheckPageCode" />

## Features

- **Check Display** - Full check with all fields (account holder, payee, amount, signature, MICR line)
- **Line Items Table** - Itemized payment details with quantities, rates, and totals
- **Analytics Summary** - Payment statistics including monthly totals, averages, and all-time totals
- **Print Optimization** - Proper page sizing, margins, and color handling for printing
- **Framework Agnostic** - Works with any framework or vanilla JavaScript

## Basic Usage

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Print Check</title>
</head>
<body>
  <printchecks-printable-page check-id="check-123"></printchecks-printable-page>

  <script type="module">
    import '@printchecks/web-components'

    // Listen for events
    const page = document.querySelector('printchecks-printable-page')

    page.addEventListener('check-loaded', (event) => {
      console.log('Check loaded:', event.detail)
    })

    page.addEventListener('print-initiated', () => {
      console.log('Printing...')
    })
  </script>
</body>
</html>
```

### Set Data Directly

```javascript
import '@printchecks/web-components'

const page = document.querySelector('printchecks-printable-page')

// Prepare check data
const check = {
  id: 'check-123',
  checkNumber: '1001',
  date: '2026-02-01',
  payTo: 'Acme Corp',
  amount: 1500.00,
  memo: 'Invoice #12345',
  signature: 'John Doe',
  accountHolderName: 'My Business LLC',
  accountHolderAddress: '123 Main St',
  accountHolderCity: 'Springfield',
  accountHolderState: 'IL',
  accountHolderZip: '62701',
  routingNumber: '123456789',
  bankAccountNumber: '987654321'
}

// Line items
const lineItems = [
  { description: 'Consulting Services', quantity: 10, unitPrice: 100.00 },
  { description: 'Software License', quantity: 1, unitPrice: 500.00 }
]

// Payment statistics
const stats = {
  thisMonth: 5000.00,
  lastMonth: 4500.00,
  thisYear: 45000.00,
  lastYear: 38000.00,
  thisQuarter: 12000.00,
  averagePayment: 1250.00,
  monthlyAverage: 3750.00,
  largestPayment: 5000.00,
  smallestPayment: 250.00,
  totalCount: 36,
  allTimeTotal: 83000.00
}

// Set data
page.setCheckData(check, lineItems, stats)

// Print
page.print()
```

## Vue Usage

### With Composable

```vue
<script setup>
import { usePrintableCheckPage, usePrintChecks } from '@printchecks/vue'
import '@printchecks/web-components'

const { core } = usePrintChecks()
const {
  currentCheckId,
  loadCheckForPrinting,
  printPage
} = usePrintableCheckPage({ core })

// Load a check
async function loadCheck(checkId) {
  await loadCheckForPrinting(checkId)
}

// Print the page
function handlePrint() {
  printPage()
}
</script>

<template>
  <div>
    <button @click="loadCheck('check-123')">Load Check</button>
    <button @click="handlePrint">Print</button>

    <printchecks-printable-page
      :check-id="currentCheckId"
      show-analytics="true"
      show-line-items="true"
    />
  </div>
</template>
```

### Direct Usage

```vue
<template>
  <div>
    <printchecks-printable-page
      check-id="check-123"
      @check-loaded="handleCheckLoaded"
      @print-initiated="handlePrint"
    />
  </div>
</template>

<script setup>
import '@printchecks/web-components'

function handleCheckLoaded(event) {
  console.log('Check loaded:', event.detail)
}

function handlePrint() {
  console.log('Printing...')
}
</script>
```

## React Usage

```tsx
import { useEffect, useRef } from 'react'
import '@printchecks/web-components'

// Declare custom element type
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'printchecks-printable-page': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'check-id'?: string
          'show-analytics'?: string
          'show-line-items'?: string
        },
        HTMLElement
      >
    }
  }
}

function PrintableCheckPage({ checkId }: { checkId: string }) {
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const handleCheckLoaded = (event: CustomEvent) => {
      console.log('Check loaded:', event.detail)
    }

    const handlePrintInitiated = () => {
      console.log('Printing...')
    }

    page.addEventListener('check-loaded', handleCheckLoaded as EventListener)
    page.addEventListener('print-initiated', handlePrintInitiated as EventListener)

    return () => {
      page.removeEventListener('check-loaded', handleCheckLoaded as EventListener)
      page.removeEventListener('print-initiated', handlePrintInitiated as EventListener)
    }
  }, [])

  return (
    <div>
      <printchecks-printable-page
        ref={pageRef}
        check-id={checkId}
        show-analytics="true"
        show-line-items="true"
      />
    </div>
  )
}
```

## Customization

### Hide Sections

```html
<!-- Hide analytics -->
<printchecks-printable-page
  check-id="check-123"
  show-analytics="false">
</printchecks-printable-page>

<!-- Hide line items -->
<printchecks-printable-page
  check-id="check-123"
  show-line-items="false">
</printchecks-printable-page>

<!-- Show only check -->
<printchecks-printable-page
  check-id="check-123"
  show-analytics="false"
  show-line-items="false">
</printchecks-printable-page>
```

### Styling

The component uses Shadow DOM with CSS custom properties for theming. You can customize colors and spacing using CSS variables:

```css
printchecks-printable-page {
  --pc-primary-color: #2196F3;
  --pc-border-color: #dee2e6;
  --pc-spacing-lg: 20px;
}
```

## Print Behavior

The component is optimized for printing:

- **Page Size**: Letter (8.5" x 11")
- **Margins**: 0.5" on all sides
- **Three Sections**: Each section is approximately one-third of the page height
- **Color Preservation**: Uses `print-color-adjust: exact` to preserve colors
- **Page Breaks**: Sections avoid breaking across pages

### Print from Code

```javascript
const page = document.querySelector('printchecks-printable-page')
page.print() // Opens print dialog
```

### Print Button

The component includes a built-in print button that is hidden during printing:

```html
<printchecks-printable-page check-id="check-123">
  <!-- Print button appears automatically -->
</printchecks-printable-page>
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Check Printing System</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 8.5in;
      margin: 20px auto;
      padding: 0 20px;
    }

    .controls {
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    button {
      padding: 10px 20px;
      margin-right: 10px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #1976D2;
    }
  </style>
</head>
<body>
  <div class="controls">
    <h2>Check Printing</h2>
    <button id="loadBtn">Load Check</button>
    <button id="printBtn">Print</button>
    <button id="toggleAnalytics">Toggle Analytics</button>
    <button id="toggleLineItems">Toggle Line Items</button>
  </div>

  <printchecks-printable-page
    id="printablePage"
    check-id="check-123">
  </printchecks-printable-page>

  <script type="module">
    import '@printchecks/web-components'

    const page = document.getElementById('printablePage')

    // Load button
    document.getElementById('loadBtn').addEventListener('click', () => {
      page.setAttribute('check-id', 'check-' + Date.now())
    })

    // Print button
    document.getElementById('printBtn').addEventListener('click', () => {
      page.print()
    })

    // Toggle analytics
    document.getElementById('toggleAnalytics').addEventListener('click', () => {
      const current = page.getAttribute('show-analytics')
      page.setAttribute('show-analytics', current === 'false' ? 'true' : 'false')
    })

    // Toggle line items
    document.getElementById('toggleLineItems').addEventListener('click', () => {
      const current = page.getAttribute('show-line-items')
      page.setAttribute('show-line-items', current === 'false' ? 'true' : 'false')
    })

    // Listen for events
    page.addEventListener('check-loaded', (event) => {
      console.log('Check loaded:', event.detail)
      alert('Check loaded successfully!')
    })

    page.addEventListener('print-initiated', () => {
      console.log('Print initiated')
    })
  </script>
</body>
</html>
```

## See Also

- [Web Components Guide](/api/web-components/overview)
- [Check Preview Component](/api/web-components/check-preview)
- [Vue Composables](/api/vue/use-printable-check-page)
