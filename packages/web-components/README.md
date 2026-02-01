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
| `<vendor-list>` | List of vendors |
| `<vendor-form>` | Form for creating/editing vendors |
| `<bank-account-list>` | List of bank accounts |
| `<bank-account-form>` | Form for creating/editing bank accounts |

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
