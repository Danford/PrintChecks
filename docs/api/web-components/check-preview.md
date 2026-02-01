# `<check-preview>`

Preview and print check component.

## Usage

```html
<check-preview check-id="check-1"></check-preview>
```

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `check-id` | `string` | Required. ID of check to preview |
| `show-controls` | `boolean` | Show print/void controls (default: true) |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `print` | `{ check: Check }` | Emitted when print button clicked |
| `void` | `{ check: Check }` | Emitted when check voided |
| `error` | `{ error: Error }` | Emitted on error |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `print()` | `Promise<void>` | Trigger print dialog |
| `void(reason?)` | `Promise<Check>` | Void the check |
| `refresh()` | `Promise<void>` | Reload check data |

## Example

```html
<check-preview check-id="check-1" show-controls="true"></check-preview>

<script>
  const preview = document.querySelector('check-preview')

  preview.addEventListener('print', async (event) => {
    await preview.print()
  })

  preview.addEventListener('void', (event) => {
    console.log('Check voided:', event.detail.check)
  })
</script>
```

## Styling

```css
check-preview {
  --check-width: 8.5in;
  --check-height: 3.5in;
  --check-border: 1px solid #000;
  --micr-font-family: 'MICR E13B', monospace;
}
```

## See Also

- [check-form](/api/web-components/check-form)
- [Checks Guide](/guide/checks)
