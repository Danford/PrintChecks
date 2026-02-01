# `<check-form>`

Form component for creating and editing checks.

## Usage

```html
<check-form></check-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.querySelector('check-form')
  form.addEventListener('check-created', (event) => {
    console.log('Check created:', event.detail.check)
  })
</script>
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `check-id` | `string` | ID of check to edit (omit for new check) |
| `bank-account-id` | `string` | Pre-select bank account |
| `vendor-id` | `string` | Pre-fill vendor information |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `check-created` | `{ check: Check }` | Emitted when check is created |
| `check-updated` | `{ check: Check }` | Emitted when check is updated |
| `error` | `{ error: Error }` | Emitted on error |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `submit()` | `Promise<Check>` | Submit the form |
| `reset()` | `void` | Reset the form |
| `validate()` | `boolean` | Validate form inputs |

## Example

```html
<check-form bank-account-id="account-1"></check-form>

<script>
  const form = document.querySelector('check-form')

  // Listen for events
  form.addEventListener('check-created', (event) => {
    console.log('Check created:', event.detail.check)
  })

  // Call methods
  const isValid = form.validate()
  if (isValid) {
    await form.submit()
  }
</script>
```

## Styling

```css
check-form {
  --primary-color: #007bff;
  --border-color: #ddd;
  --input-border-radius: 4px;
  --button-padding: 8px 16px;
}
```

## See Also

- [check-preview](/api/web-components/check-preview)
- [Checks Guide](/guide/checks)
