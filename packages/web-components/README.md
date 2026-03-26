# @printchecks/web-components

Framework-agnostic Web Components for PrintChecks.

## Installation

```bash
npm install @printchecks/web-components
```

## Usage

### Import Components

```typescript
import '@printchecks/web-components'
```

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>PrintChecks</title>
</head>
<body>
  <check-form></check-form>
  <check-preview check-id="check-1"></check-preview>

  <script type="module">
    import '@printchecks/web-components'

    const form = document.querySelector('check-form')
    form.addEventListener('check-created', (event) => {
      console.log('Check created:', event.detail)
    })
  </script>
</body>
</html>
```

## Available Components

| Component | Description |
|-----------|-------------|
| `<check-form>` | Form for creating/editing checks |
| `<check-preview>` | Preview and print check |
| `<printchecks-printable-page>` | **Standardized printable check page** with check, line items, and analytics |
| `<vendor-list>` | List of vendors |
| `<vendor-form>` | Form for creating/editing vendors |
| `<bank-account-list>` | List of bank accounts |
| `<bank-account-form>` | Form for creating/editing bank accounts |

## Standardized Printable Check Page

The `<printchecks-printable-page>` component provides a standardized, print-ready check page that includes:
- **Check display** (top third) - Full check with all fields
- **Line items table** (middle third) - Itemized payment details
- **Analytics summary** (bottom third) - Payment statistics and totals

This ensures consistent check printing across all deployments.

### Usage

```html
<!-- Load by check ID -->
<printchecks-printable-page check-id="check-123"></printchecks-printable-page>

<!-- Customize sections -->
<printchecks-printable-page
  check-id="check-123"
  show-analytics="true"
  show-line-items="true">
</printchecks-printable-page>
```

### Attributes

- `check-id` - ID of the check to load
- `show-analytics` - Show analytics section (default: `true`)
- `show-line-items` - Show line items section (default: `true`)

### Events

- `check-loaded` - Fired when check data is loaded
- `print-initiated` - Fired when print is triggered

### Methods

```javascript
const printablePage = document.querySelector('printchecks-printable-page')

// Set check data directly
printablePage.setCheckData(check, lineItems, stats)

// Trigger print
printablePage.print()
```

## Framework Integration

### React

```tsx
import '@printchecks/web-components'

function App() {
  return (
    <div>
      <check-form />
    </div>
  )
}
```

### Vue

```vue
<template>
  <check-form @check-created="handleCheckCreated" />
</template>

<script setup>
import '@printchecks/web-components'

const handleCheckCreated = (event) => {
  console.log('Check created:', event.detail)
}
</script>
```

### Angular

```typescript
import '@printchecks/web-components'

@Component({
  selector: 'app-root',
  template: '<check-form (check-created)="handleCheckCreated($event)"></check-form>'
})
export class AppComponent {
  handleCheckCreated(event: CustomEvent) {
    console.log('Check created:', event.detail)
  }
}
```

## Documentation

Full documentation available at: https://danford.github.io/PrintChecks/

## License

MIT © Joshua Danford
