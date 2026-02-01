# Web Components Overview

Framework-agnostic Web Components for PrintChecks.

## Installation

```bash
npm install @printchecks/web-components
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <title>PrintChecks</title>
</head>
<body>
  <check-form></check-form>

  <script type="module">
    import '@printchecks/web-components'
  </script>
</body>
</html>
```

## Available Components

| Component | Description |
|-----------|-------------|
| [`<check-form>`](/api/web-components/check-form) | Form for creating/editing checks |
| [`<check-preview>`](/api/web-components/check-preview) | Preview and print check |
| [`<vendor-list>`](/api/web-components/vendor-list) | List of vendors |
| [`<vendor-form>`](/api/web-components/vendor-form) | Form for creating/editing vendors |
| [`<bank-account-list>`](/api/web-components/bank-account-list) | List of bank accounts |
| [`<bank-account-form>`](/api/web-components/bank-account-form) | Form for creating/editing bank accounts |

## Framework Integration

### React

```tsx
import '@printchecks/web-components'

function App() {
  const handleCheckCreated = (event: CustomEvent) => {
    console.log('Check created:', event.detail)
  }

  return (
    <check-form onCheckCreated={handleCheckCreated} />
  )
}
```

### Vue 3

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
// Import in app.module.ts or main.ts
import '@printchecks/web-components'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

// Use in component
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

### Svelte

```svelte
<script>
  import '@printchecks/web-components'

  function handleCheckCreated(event) {
    console.log('Check created:', event.detail)
  }
</script>

<check-form on:check-created={handleCheckCreated} />
```

## Common Patterns

### Event Handling

All components emit custom events:

```typescript
const checkForm = document.querySelector('check-form')

checkForm.addEventListener('check-created', (event: CustomEvent) => {
  console.log('Check created:', event.detail)
})

checkForm.addEventListener('error', (event: CustomEvent) => {
  console.error('Error:', event.detail)
})
```

### Setting Attributes

```html
<check-form check-id="123" bank-account-id="account-1"></check-form>
```

```typescript
const checkForm = document.querySelector('check-form')
checkForm.setAttribute('check-id', '123')
```

### Calling Methods

```typescript
const checkForm = document.querySelector('check-form')
await checkForm.submit()
await checkForm.reset()
```

## Styling

Components use Shadow DOM and can be styled with CSS custom properties:

```css
check-form {
  --primary-color: #007bff;
  --border-color: #ddd;
  --border-radius: 4px;
  --font-family: Arial, sans-serif;
}
```

## TypeScript Support

Type definitions are included:

```typescript
import type { CheckFormElement, CheckCreatedEvent } from '@printchecks/web-components'

const checkForm = document.querySelector('check-form') as CheckFormElement

checkForm.addEventListener('check-created', (event: CheckCreatedEvent) => {
  console.log('Check:', event.detail.check)
})
```

## See Also

- [check-form](/api/web-components/check-form)
- [check-preview](/api/web-components/check-preview)
- [vendor-list](/api/web-components/vendor-list)
- [vendor-form](/api/web-components/vendor-form)
- [bank-account-list](/api/web-components/bank-account-list)
- [bank-account-form](/api/web-components/bank-account-form)
