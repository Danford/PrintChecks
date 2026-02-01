# `<vendor-form>`

Form component for creating and editing vendors.

## Usage

```html
<vendor-form></vendor-form>
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `vendor-id` | `string` | ID of vendor to edit (omit for new vendor) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `vendor-created` | `{ vendor: Vendor }` | Emitted when vendor created |
| `vendor-updated` | `{ vendor: Vendor }` | Emitted when vendor updated |
| `error` | `{ error: Error }` | Emitted on error |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `submit()` | `Promise<Vendor>` | Submit the form |
| `reset()` | `void` | Reset the form |
| `validate()` | `boolean` | Validate form inputs |

## Example

```html
<vendor-form></vendor-form>

<script>
  const form = document.querySelector('vendor-form')

  form.addEventListener('vendor-created', (event) => {
    console.log('Vendor created:', event.detail.vendor)
  })

  await form.submit()
</script>
```

## See Also

- [vendor-list](/api/web-components/vendor-list)
- [Vendors Guide](/guide/vendors)
