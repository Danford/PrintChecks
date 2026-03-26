# printable-check-page

Standardized printable check page web component that combines check display, line items table, and analytics summary into a consistent print-ready format.

## Overview

The `<printchecks-printable-page>` component provides a complete, standardized printable check page that ensures consistent check formatting across all deployments. It includes three sections optimized for printing on letter-size paper.

## Sections

### 1. Check Display (Top Third)
- Account holder information and address
- Check number and date
- Pay to the order of line
- Amount in both numeric and word format
- Memo field
- Signature line
- MICR line with routing and account numbers

### 2. Line Items Table (Middle Third)
- Itemized payment details
- Description, quantity, rate, and amount columns
- Automatic total calculation
- Empty state for checks without line items

### 3. Analytics Summary (Bottom Third)
- Payment totals (this month, last month, this year, this quarter, last year)
- Payment statistics (average, monthly average, largest, smallest, total count)
- All-time total highlighted banner

## Usage

### Basic Example

```html
<printchecks-printable-page check-id="check-123"></printchecks-printable-page>
```

### With Custom Options

```html
<printchecks-printable-page
  check-id="check-123"
  show-analytics="true"
  show-line-items="true">
</printchecks-printable-page>
```

### Load Check by ID

```javascript
const page = document.querySelector('printchecks-printable-page')
page.setAttribute('check-id', 'check-456')
```

### Set Data Directly

```javascript
const page = document.querySelector('printchecks-printable-page')

const checkData = {
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

const lineItems = [
  { description: 'Consulting Services', quantity: 10, unitPrice: 100.00 },
  { description: 'Software License', quantity: 1, unitPrice: 500.00 }
]

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

page.setCheckData(checkData, lineItems, stats)
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `check-id` | `string` | - | ID of the check to load from storage |
| `show-analytics` | `boolean` | `true` | Whether to display the analytics section |
| `show-line-items` | `boolean` | `true` | Whether to display the line items section |

## Properties

### `checkId`
- **Type:** `string | null`
- **Description:** The current check ID being displayed

### `currentCheck`
- **Type:** `Check | null`
- **Description:** The current check data

### `lineItems`
- **Type:** `LineItem[]`
- **Description:** Array of line items for the check

### `paymentStats`
- **Type:** `PaymentStats | null`
- **Description:** Payment statistics data

## Methods

### `setCheckData(check, lineItems?, stats?)`

Set check data directly without loading from storage.

**Parameters:**
- `check` (`Check`) - The check data
- `lineItems` (`LineItem[]`, optional) - Array of line items
- `stats` (`PaymentStats`, optional) - Payment statistics

**Example:**
```javascript
page.setCheckData(checkData, lineItems, stats)
```

### `print()`

Trigger the browser's print dialog to print the check page.

**Example:**
```javascript
page.print()
```

## Events

### `check-loaded`

Fired when check data is successfully loaded.

**Detail:**
```typescript
{
  check: Check
  lineItems: LineItem[]
  stats: PaymentStats | null
}
```

**Example:**
```javascript
page.addEventListener('check-loaded', (event) => {
  console.log('Check loaded:', event.detail.check)
  console.log('Line items:', event.detail.lineItems)
  console.log('Stats:', event.detail.stats)
})
```

### `print-initiated`

Fired when the print dialog is triggered.

**Detail:**
```typescript
{
  checkId: string | null
}
```

**Example:**
```javascript
page.addEventListener('print-initiated', (event) => {
  console.log('Printing check:', event.detail.checkId)
})
```

## Print Behavior

The component is optimized for printing:

- **Page Size:** Letter (8.5" × 11")
- **Orientation:** Portrait
- **Margins:** 0.5" on all sides
- **Layout:** Three equal sections (check, line items, analytics)
- **Color Preservation:** Uses `print-color-adjust: exact` to preserve colors
- **Page Breaks:** Sections are configured to avoid breaking across pages

### Print Styles

```css
@media print {
  @page {
    margin: 0.5in;
    size: letter portrait;
  }

  /* All sections optimized for printing */
}
```

## Customization

### Hide Sections

```html
<!-- Hide analytics only -->
<printchecks-printable-page
  check-id="check-123"
  show-analytics="false">
</printchecks-printable-page>

<!-- Hide line items only -->
<printchecks-printable-page
  check-id="check-123"
  show-line-items="false">
</printchecks-printable-page>

<!-- Show check only -->
<printchecks-printable-page
  check-id="check-123"
  show-analytics="false"
  show-line-items="false">
</printchecks-printable-page>
```

### CSS Custom Properties

The component uses Shadow DOM with CSS custom properties:

```css
printchecks-printable-page {
  --pc-primary-color: #2196F3;
  --pc-border-color: #dee2e6;
  --pc-spacing-lg: 20px;
}
```

## TypeScript Types

```typescript
interface LineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

interface PaymentStats {
  thisMonth: number
  lastMonth: number
  thisYear: number
  lastYear: number
  thisQuarter: number
  averagePayment: number
  monthlyAverage: number
  largestPayment: number
  smallestPayment: number
  totalCount: number
  allTimeTotal: number
}
```

## Framework Examples

### Vue

```vue
<script setup>
import '@printchecks/web-components'

function handleCheckLoaded(event) {
  console.log('Check loaded:', event.detail)
}
</script>

<template>
  <printchecks-printable-page
    check-id="check-123"
    @check-loaded="handleCheckLoaded"
  />
</template>
```

### React

```tsx
import { useEffect, useRef } from 'react'
import '@printchecks/web-components'

function PrintablePage({ checkId }: { checkId: string }) {
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const handleLoaded = (event: CustomEvent) => {
      console.log('Check loaded:', event.detail)
    }

    page.addEventListener('check-loaded', handleLoaded as EventListener)
    return () => {
      page.removeEventListener('check-loaded', handleLoaded as EventListener)
    }
  }, [])

  return <printchecks-printable-page ref={pageRef} check-id={checkId} />
}
```

### Angular

```typescript
import '@printchecks/web-components'

@Component({
  selector: 'app-printable-page',
  template: `
    <printchecks-printable-page
      [attr.check-id]="checkId"
      (check-loaded)="handleCheckLoaded($event)">
    </printchecks-printable-page>
  `
})
export class PrintablePageComponent {
  checkId = 'check-123'

  handleCheckLoaded(event: CustomEvent) {
    console.log('Check loaded:', event.detail)
  }
}
```

## See Also

- [Printable Check Page Example](/examples/printable-check-page)
- [usePrintableCheckPage Composable](/api/vue/use-printable-check-page)
- [check-preview Component](/api/web-components/check-preview)
- [Web Components Overview](/api/web-components/overview)
