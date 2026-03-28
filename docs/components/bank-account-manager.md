# Bank Account Manager

Manage bank accounts using the `<bank-account-list>` and `<bank-account-form>` web components together.

::: tip
These two components are designed to work as a pair — the list shows existing accounts and the form handles creation and editing.
:::

## Components

| Component | Purpose |
|-----------|---------|
| [`<bank-account-list>`](/api/web-components/bank-account-list) | Displays all accounts, supports selection, deletion, and setting a default |
| [`<bank-account-form>`](/api/web-components/bank-account-form) | Creates a new account or edits an existing one via `account-id` |

## Adding a New Account

```html
<bank-account-form id="form"></bank-account-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.getElementById('form')

  form.addEventListener('account-created', ({ detail }) => {
    console.log('Created account:', detail.account.id)
    form.reset()
  })

  form.addEventListener('error', ({ detail }) => {
    console.error('Save failed:', detail.error)
  })
</script>
```

## List + Form: Full Manager Pattern

Wire the two components together so clicking an account in the list loads it into the form for editing:

```html
<bank-account-list id="list"></bank-account-list>
<bank-account-form id="form"></bank-account-form>

<script type="module">
  import '@printchecks/web-components'

  const list = document.getElementById('list')
  const form = document.getElementById('form')

  // Load selected account into the form
  list.addEventListener('account-selected', ({ detail }) => {
    form.setAttribute('account-id', detail.account.id)
  })

  // Refresh list after any save
  form.addEventListener('account-created', () => list.refresh())
  form.addEventListener('account-updated', () => list.refresh())

  // Clear the form when an account is deleted
  list.addEventListener('account-deleted', () => form.reset())
</script>
```

## Setting a Default Account

The list component fires `default-changed` when the user marks an account as default. This is handled automatically by the component — no extra code needed:

```html
<bank-account-list id="list"></bank-account-list>

<script type="module">
  import '@printchecks/web-components'

  const list = document.getElementById('list')

  list.addEventListener('default-changed', ({ detail }) => {
    console.log('Default account is now:', detail.account.routingNumber)
  })
</script>
```

## Programmatic Validation

```html
<bank-account-form id="form"></bank-account-form>
<button id="saveBtn">Save Account</button>

<script type="module">
  import '@printchecks/web-components'

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const form = document.getElementById('form')
    if (form.validate()) {
      await form.submit()
    }
  })
</script>
```

## See Also

- [`<bank-account-form>` API](/api/web-components/bank-account-form)
- [`<bank-account-list>` API](/api/web-components/bank-account-list)
- [Bank Accounts Guide](/guide/bank-accounts)
