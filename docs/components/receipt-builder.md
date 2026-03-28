# Receipt Builder

Create and edit itemized receipts using the `<printchecks-receipt-form>` web component.

::: tip
The receipt form handles line items, automatic totals calculation (subtotal, tax, discount, shipping), and stores receipts in your configured storage adapter.
:::

## Component

| Component | Purpose |
|-----------|---------|
| [`<printchecks-receipt-form>`](/api/web-components/receipt-form) | Full receipt form with line items, bill-to info, payment details, and totals |

## Creating a Receipt

```html
<printchecks-receipt-form id="form"></printchecks-receipt-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.getElementById('form')

  form.addEventListener('receipt-created', ({ detail }) => {
    console.log('Receipt saved:', detail.receipt.id)
  })

  form.addEventListener('error', ({ detail }) => {
    console.error('Save failed:', detail.error)
  })
</script>
```

## Editing an Existing Receipt

Set the `receipt-id` attribute to load an existing receipt for editing:

```html
<printchecks-receipt-form receipt-id="rcpt_abc123"></printchecks-receipt-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.querySelector('printchecks-receipt-form')

  form.addEventListener('receipt-updated', ({ detail }) => {
    console.log('Updated receipt:', detail.receipt)
  })
</script>
```

## Read-Only Display

Use the `readonly` attribute to render a receipt as a non-editable view:

```html
<printchecks-receipt-form receipt-id="rcpt_abc123" readonly></printchecks-receipt-form>
```

## Programmatic Save

Trigger a save from external UI (e.g. a submit button outside the form):

```html
<printchecks-receipt-form id="form"></printchecks-receipt-form>
<button id="saveBtn">Save Receipt</button>

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

## How Line Items Work

The form starts with one empty line item row. Each row has **Description**, **Quantity**, and **Unit Price** fields; the row total (`quantity × unitPrice`) updates as you type.

- **Add Item** — appends a new empty row
- **✕ button** — removes a row (hidden when only one row remains)

Totals update automatically: subtotal → apply discount → apply tax rate → add shipping and handling.

## What Gets Stored

A saved receipt contains:

- **Header** — receipt number, date
- **Bill To** — name, email, full address
- **Payment** — method (check/cash/credit/debit/transfer/other) and optional check number
- **Line Items** — description, quantity, unit price for each row
- **Adjustments** — tax rate (%), discount amount, shipping, handling

## See Also

- [`<printchecks-receipt-form>` API](/api/web-components/receipt-form)
- [Receipts Guide](/guide/receipts)
