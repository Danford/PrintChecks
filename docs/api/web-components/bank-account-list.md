# `<bank-account-list>`

List and manage bank accounts.

## Usage

```html
<bank-account-list></bank-account-list>
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `account-selected` | `{ account: BankAccount }` | Emitted when account clicked |
| `account-deleted` | `{ account: BankAccount }` | Emitted when account deleted |
| `default-changed` | `{ account: BankAccount }` | Emitted when default changed |
| `error` | `{ error: Error }` | Emitted on error |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `refresh()` | `Promise<void>` | Reload bank accounts |

## Example

```html
<bank-account-list></bank-account-list>

<script>
  const list = document.querySelector('bank-account-list')

  list.addEventListener('account-selected', (event) => {
    console.log('Selected account:', event.detail.account)
  })

  list.addEventListener('default-changed', (event) => {
    console.log('New default:', event.detail.account)
  })
</script>
```

## See Also

- [bank-account-form](/api/web-components/bank-account-form)
- [Bank Accounts Guide](/guide/bank-accounts)
