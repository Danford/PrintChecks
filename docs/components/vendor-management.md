# Vendor Management Components

Manage payees and vendors using the `<vendor-list>` and `<vendor-form>` web components together.

::: tip
Vendors are the payees that appear on checks. The list and form components work as a pair — the list browses and selects vendors, the form creates or edits them.
:::

## Components

| Component | Purpose |
|-----------|---------|
| [`<vendor-list>`](/api/web-components/vendor-list) | Displays all vendors with search and favorites filtering; handles selection and deletion |
| [`<vendor-form>`](/api/web-components/vendor-form) | Creates a new vendor or edits an existing one via `vendor-id` |

## Adding a New Vendor

```html
<vendor-form id="form"></vendor-form>

<script type="module">
  import '@printchecks/web-components'

  const form = document.getElementById('form')

  form.addEventListener('vendor-created', ({ detail }) => {
    console.log('Created vendor:', detail.vendor.name)
    form.reset()
  })

  form.addEventListener('error', ({ detail }) => {
    console.error('Save failed:', detail.error)
  })
</script>
```

## List + Form: Full Manager Pattern

Wire the two components so clicking a vendor in the list opens it in the form:

```html
<vendor-list id="list"></vendor-list>
<vendor-form id="form"></vendor-form>

<script type="module">
  import '@printchecks/web-components'

  const list = document.getElementById('list')
  const form = document.getElementById('form')

  // Load selected vendor into the form
  list.addEventListener('vendor-selected', ({ detail }) => {
    form.setAttribute('vendor-id', detail.vendor.id)
  })

  // Refresh list after any save
  form.addEventListener('vendor-created', () => list.refresh())
  form.addEventListener('vendor-updated', () => list.refresh())

  // Clear the form when a vendor is deleted
  list.addEventListener('vendor-deleted', () => form.reset())
</script>
```

## Searching and Filtering

`<vendor-list>` supports live search via the `search` attribute or the `search()` method, and can be filtered to favorites only:

```html
<!-- Show only favorite vendors -->
<vendor-list favorites-only="true"></vendor-list>

<script type="module">
  import '@printchecks/web-components'

  const list = document.querySelector('vendor-list')

  // Filter programmatically
  list.search('acme')

  // Clear the filter
  list.search('')
</script>
```

## Picking a Vendor for a Check

A common pattern is using the list as a vendor picker when composing a check:

```html
<vendor-list id="picker"></vendor-list>
<check-form id="check"></check-form>

<script type="module">
  import '@printchecks/web-components'

  const picker = document.getElementById('picker')
  const check = document.getElementById('check')

  picker.addEventListener('vendor-selected', ({ detail }) => {
    check.setAttribute('vendor-id', detail.vendor.id)
  })
</script>
```

## See Also

- [`<vendor-form>` API](/api/web-components/vendor-form)
- [`<vendor-list>` API](/api/web-components/vendor-list)
- [Vendors Guide](/guide/vendors)
