# `<bank-account-form>`

Form component for creating and editing bank accounts.

## Usage

```html
<bank-account-form></bank-account-form>
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `account-id` | `string` | ID of account to edit (omit for new account) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `account-created` | `{ account: BankAccount }` | Emitted when account created |
| `account-updated` | `{ account: BankAccount }` | Emitted when account updated |
| `error` | `{ error: Error }` | Emitted on error |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `submit()` | `Promise<BankAccount>` | Submit the form |
| `reset()` | `void` | Reset the form |
| `validate()` | `boolean` | Validate form inputs |

## Example

```html
<bank-account-form></bank-account-form>

<script>
  const form = document.querySelector('bank-account-form')

  form.addEventListener('account-created', (event) => {
    console.log('Account created:', event.detail.account)
  })

  const isValid = form.validate()
  if (isValid) {
    await form.submit()
  }
</script>
```

## See Also

- [bank-account-list](/api/web-components/bank-account-list)
- [Bank Accounts Guide](/guide/bank-accounts)
