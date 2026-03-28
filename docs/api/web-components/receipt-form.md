# `<printchecks-receipt-form>`

Interactive form for creating and editing receipts with line items, totals calculation, and billing information.

## Usage

```html
<printchecks-receipt-form></printchecks-receipt-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.querySelector('printchecks-receipt-form')
  form.addEventListener('receipt-created', (event) => {
    console.log('Receipt created:', event.detail.receipt)
  })
</script>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `receipt-id` | `string` | — | ID of receipt to load for editing. Omit to create a new receipt. |
| `readonly` | `boolean` | `false` | Disables all inputs and hides action buttons. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `receipt-created` | `{ receipt: Receipt }` | Emitted after a new receipt is successfully saved. |
| `receipt-updated` | `{ receipt: Receipt }` | Emitted after an existing receipt is successfully updated. |
| `error` | `{ error: string }` | Emitted when a save or load operation fails. |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `save()` | `Promise<Receipt \| null>` | Programmatically save the current form state. Returns `null` on validation or storage failure. |
| `reset()` | `void` | Clear the form and reset to a blank new receipt with today's date and one empty line item. |

## Form Fields

### Header
- **Receipt Number** (required) — identifier for the receipt
- **Date** (required) — defaults to today

### Bill To
- **Name** (required), **Email** (optional)
- **Address**, **City**, **State**, **ZIP** (all required)

### Payment
- **Payment Method** (required) — one of: `check`, `cash`, `credit`, `debit`, `transfer`, `other`
- **Check Number** (optional) — visible for all payment methods, typically filled for `check`

### Line Items
Dynamic list of items. Each row contains:
- **Description** (required), **Quantity** (required), **Unit Price** (required)
- Row total is computed as `quantity × unitPrice`

The **Add Item** button appends a new empty row; the **✕** button removes a row (hidden when only one row remains).

### Adjustments
- **Tax Rate (%)** — applied to `subtotal − discount`
- **Discount Amount** — subtracted before tax
- **Shipping Amount** / **Handling Amount** — added after tax

### Totals (read-only display)
Automatically updated on input: subtotal, discount, tax, shipping, handling, grand total.

## Example — Create Receipt

```html
<printchecks-receipt-form id="form"></printchecks-receipt-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.getElementById('form')

  form.addEventListener('receipt-created', ({ detail }) => {
    console.log('Saved receipt:', detail.receipt.id)
  })

  form.addEventListener('error', ({ detail }) => {
    console.error('Save failed:', detail.error)
  })
</script>
```

## Example — Edit Existing Receipt

```html
<printchecks-receipt-form receipt-id="rcpt_abc123"></printchecks-receipt-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.querySelector('printchecks-receipt-form')
  form.addEventListener('receipt-updated', ({ detail }) => {
    console.log('Updated:', detail.receipt)
  })
</script>
```

## Example — Read-Only View

```html
<printchecks-receipt-form receipt-id="rcpt_abc123" readonly></printchecks-receipt-form>
```

## Example — Programmatic Save

```html
<printchecks-receipt-form id="form"></printchecks-receipt-form>
<button id="saveBtn">Save</button>

<script type="module">
  import '@printchecks/web-components'

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const form = document.getElementById('form')
    const receipt = await form.save()
    if (receipt) {
      console.log('Saved receipt ID:', receipt.id)
    }
  })
</script>
```

## Styling

The component uses Shadow DOM CSS custom properties inherited from the base component styles:

```css
printchecks-receipt-form {
  --pc-primary-color: #007bff;
  --pc-border-color: #ddd;
  --pc-border-radius: 4px;
  --pc-spacing-sm: 8px;
  --pc-spacing-md: 16px;
  --pc-spacing-lg: 24px;
  --pc-background-light: #f8f9fa;
  --pc-danger-color: #dc3545;
}
```

The component is capped at `max-width: 900px` and uses a two-column grid layout that collapses to single-column below 768 px.

## See Also

- [overview](/api/web-components/overview)
- [printable-check-page](/api/web-components/printable-check-page)
- [Receipts Guide](/guide/receipts)
