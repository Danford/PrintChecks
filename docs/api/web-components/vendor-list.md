# `<vendor-list>`

List and manage vendors.

## Usage

```html
<vendor-list></vendor-list>
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `search` | `string` | Filter vendors by search term |
| `favorites-only` | `boolean` | Show only favorite vendors |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `vendor-selected` | `{ vendor: Vendor }` | Emitted when vendor clicked |
| `vendor-deleted` | `{ vendor: Vendor }` | Emitted when vendor deleted |
| `error` | `{ error: Error }` | Emitted on error |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `refresh()` | `Promise<void>` | Reload vendors |
| `search(term)` | `void` | Filter vendors |

## Example

```html
<vendor-list favorites-only="true"></vendor-list>

<script>
  const list = document.querySelector('vendor-list')

  list.addEventListener('vendor-selected', (event) => {
    console.log('Selected vendor:', event.detail.vendor)
  })

  // Search vendors
  list.search('acme')
</script>
```

## See Also

- [vendor-form](/api/web-components/vendor-form)
- [Vendors Guide](/guide/vendors)
