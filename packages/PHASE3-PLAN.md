# Phase 3: Web Components - PLAN 📋

## Overview
Create framework-agnostic Web Components (Custom Elements) that can be used in any web application, regardless of framework. These components will use the `@printchecks/core` library internally and provide a simple, declarative API.

## Goals
- ✅ Framework-agnostic - Works with React, Angular, vanilla JS, or any framework
- ✅ Standard Web Components API
- ✅ Shadow DOM for style encapsulation
- ✅ Declarative attributes and properties
- ✅ Custom events for communication
- ✅ Lightweight and performant
- ✅ TypeScript support with declarations

## Package Structure

```
packages/web-components/
├── src/
│   ├── components/
│   │   ├── check-form.ts          # <printchecks-check-form>
│   │   ├── check-preview.ts       # <printchecks-check-preview>
│   │   ├── vendor-list.ts         # <printchecks-vendor-list>
│   │   ├── vendor-form.ts         # <printchecks-vendor-form>
│   │   ├── bank-account-list.ts   # <printchecks-bank-account-list>
│   │   ├── bank-account-form.ts   # <printchecks-bank-account-form>
│   │   ├── receipt-form.ts        # <printchecks-receipt-form>
│   │   └── analytics-dashboard.ts # <printchecks-analytics-dashboard>
│   ├── styles/
│   │   ├── base.css               # Base component styles
│   │   └── themes.css             # Theme variables
│   ├── utils/
│   │   └── component-base.ts      # Shared component utilities
│   └── index.ts                   # Main entry point
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Web Components to Build

### 1. `<printchecks-check-form>`
**Purpose**: Interactive form for creating/editing checks

**Attributes**:
- `check-id` - ID of check to edit (optional)
- `bank-account-id` - Pre-select bank account
- `vendor-id` - Pre-select vendor
- `readonly` - Make form read-only

**Properties**:
- `check` - Check data object
- `bankAccount` - Bank account object
- `vendor` - Vendor object

**Events**:
- `check-created` - Fired when check is created
- `check-updated` - Fired when check is updated
- `check-validated` - Fired after validation
- `error` - Fired on error

**Methods**:
- `validate()` - Validate form
- `save()` - Save check
- `reset()` - Reset form

### 2. `<printchecks-check-preview>`
**Purpose**: Display check in print-ready format

**Attributes**:
- `check-id` - ID of check to preview
- `show-micr` - Show MICR line
- `show-signature` - Show signature

**Properties**:
- `check` - Check data object

**Events**:
- `print-requested` - Fired when print button clicked

**Methods**:
- `print()` - Trigger print dialog

### 3. `<printchecks-vendor-list>`
**Purpose**: Display list of vendors with search/filter

**Attributes**:
- `show-favorites` - Show only favorites
- `category` - Filter by category
- `selectable` - Make vendors selectable

**Properties**:
- `vendors` - Array of vendors

**Events**:
- `vendor-selected` - Fired when vendor is selected
- `vendor-deleted` - Fired when vendor is deleted

**Methods**:
- `search(term)` - Search vendors
- `refresh()` - Reload vendors

### 4. `<printchecks-vendor-form>`
**Purpose**: Form for creating/editing vendors

**Attributes**:
- `vendor-id` - ID of vendor to edit

**Properties**:
- `vendor` - Vendor data object

**Events**:
- `vendor-created` - Fired when vendor is created
- `vendor-updated` - Fired when vendor is updated

**Methods**:
- `validate()` - Validate form
- `save()` - Save vendor

### 5. `<printchecks-bank-account-list>`
**Purpose**: Display list of bank accounts

**Attributes**:
- `selectable` - Make accounts selectable

**Properties**:
- `accounts` - Array of bank accounts

**Events**:
- `account-selected` - Fired when account is selected
- `default-changed` - Fired when default account changes

**Methods**:
- `refresh()` - Reload accounts

### 6. `<printchecks-bank-account-form>`
**Purpose**: Form for creating/editing bank accounts

**Attributes**:
- `account-id` - ID of account to edit

**Properties**:
- `account` - Account data object

**Events**:
- `account-created` - Fired when account is created
- `account-updated` - Fired when account is updated

**Methods**:
- `validate()` - Validate form
- `save()` - Save account

### 7. `<printchecks-receipt-form>`
**Purpose**: Form for creating receipts with line items

**Attributes**:
- `receipt-id` - ID of receipt to edit

**Properties**:
- `receipt` - Receipt data object

**Events**:
- `receipt-created` - Fired when receipt is created
- `receipt-updated` - Fired when receipt is updated
- `line-item-added` - Fired when line item is added

**Methods**:
- `addLineItem()` - Add line item
- `removeLineItem(id)` - Remove line item
- `save()` - Save receipt

### 8. `<printchecks-analytics-dashboard>`
**Purpose**: Display payment analytics and statistics

**Attributes**:
- `date-range` - Date range for analytics (30d, 60d, 90d, 1y, all)

**Properties**:
- `statistics` - Statistics data object

**Events**:
- `refresh-requested` - Fired when refresh is requested

**Methods**:
- `refresh()` - Reload statistics

## Component Base Class

All components will extend a common base class:

```typescript
abstract class PrintChecksComponent extends HTMLElement {
  protected core: PrintChecksCore
  protected shadow: ShadowRoot
  
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.core = this.getOrCreateCoreInstance()
  }
  
  // Lifecycle hooks
  abstract render(): void
  abstract connectedCallback(): void
  abstract disconnectedCallback(): void
  
  // Utility methods
  protected emit(eventName: string, detail: any): void
  protected getOrCreateCoreInstance(): PrintChecksCore
  protected applyStyles(styles: string): void
}
```

## Styling Strategy

### 1. Shadow DOM Encapsulation
- Each component uses Shadow DOM for style isolation
- Prevents style conflicts with host application

### 2. CSS Custom Properties (CSS Variables)
Expose themeable properties:

```css
:host {
  --pc-primary-color: #007bff;
  --pc-secondary-color: #6c757d;
  --pc-success-color: #28a745;
  --pc-danger-color: #dc3545;
  --pc-warning-color: #ffc107;
  --pc-font-family: system-ui, -apple-system, sans-serif;
  --pc-border-radius: 4px;
  --pc-spacing: 1rem;
}
```

### 3. Part Attribute for External Styling
Use `part` attribute for specific elements:

```html
<button part="submit-button">Save</button>
```

External styling:
```css
printchecks-check-form::part(submit-button) {
  background: custom-color;
}
```

## Configuration & Initialization

### Global Configuration
```javascript
// Set global configuration for all components
PrintChecks.configure({
  storage: new LocalStorageAdapter({ prefix: 'myapp_' }),
  encryption: true,
  password: 'secure-password',
  autoIncrementCheckNumber: true
})
```

### Per-Component Configuration
```html
<printchecks-check-form
  storage-prefix="custom_"
  auto-increment="true">
</printchecks-check-form>
```

## Usage Examples

### Vanilla JavaScript
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@printchecks/web-components"></script>
</head>
<body>
  <printchecks-check-form id="checkForm"></printchecks-check-form>
  
  <script>
    const form = document.getElementById('checkForm')
    
    form.addEventListener('check-created', (e) => {
      console.log('Check created:', e.detail)
    })
  </script>
</body>
</html>
```

### React
```jsx
import '@printchecks/web-components'

function App() {
  const handleCheckCreated = (e) => {
    console.log('Check created:', e.detail)
  }
  
  return (
    <printchecks-check-form
      oncheck-created={handleCheckCreated}
    />
  )
}
```

### Vue 3
```vue
<template>
  <printchecks-check-form
    @check-created="handleCheckCreated"
  />
</template>

<script setup>
import '@printchecks/web-components'

const handleCheckCreated = (e) => {
  console.log('Check created:', e.detail)
}
</script>
```

### Angular
```typescript
// app.component.ts
import '@printchecks/web-components'

@Component({
  selector: 'app-root',
  template: `
    <printchecks-check-form
      (check-created)="handleCheckCreated($event)">
    </printchecks-check-form>
  `
})
export class AppComponent {
  handleCheckCreated(event: CustomEvent) {
    console.log('Check created:', event.detail)
  }
}
```

## Build Configuration

### Package.json
```json
{
  "name": "@printchecks/web-components",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@printchecks/core": "workspace:*"
  },
  "customElements": "custom-elements.json"
}
```

### Custom Elements Manifest
Generate `custom-elements.json` for IDE support:

```json
{
  "schemaVersion": "1.0.0",
  "modules": [
    {
      "path": "./dist/components/check-form.js",
      "declarations": [
        {
          "kind": "class",
          "name": "PrintChecksCheckForm",
          "tagName": "printchecks-check-form",
          "attributes": [...],
          "properties": [...],
          "events": [...],
          "methods": [...]
        }
      ]
    }
  ]
}
```

## Testing Strategy

### 1. Unit Tests
- Test each component in isolation
- Mock core library dependencies
- Test attribute/property changes
- Test event firing

### 2. Integration Tests
- Test components working together
- Test with real core library
- Test storage persistence

### 3. Browser Tests
- Test in different browsers (Chrome, Firefox, Safari, Edge)
- Test with different frameworks
- Visual regression testing

## TypeScript Support

### Type Declarations
```typescript
// components/check-form.ts
export class PrintChecksCheckForm extends PrintChecksComponent {
  // Properties with decorators
  @property({ type: String, attribute: 'check-id' })
  checkId?: string
  
  @property({ type: Object })
  check?: Check
  
  // Type-safe event details
  private dispatchCheckCreated(check: Check) {
    this.emit('check-created', { check })
  }
}

// Augment global HTML element types
declare global {
  interface HTMLElementTagNameMap {
    'printchecks-check-form': PrintChecksCheckForm
  }
}
```

## Documentation Requirements

### 1. README.md
- Installation instructions
- Quick start guide
- Component catalog
- Configuration options
- Browser compatibility

### 2. Storybook
- Interactive component documentation
- Live examples
- Props/attributes playground
- Event logging

### 3. API Documentation
- Generated from JSDoc comments
- All components, properties, events, methods
- Usage examples for each component

## Performance Considerations

### 1. Lazy Loading
- Load components only when used
- Dynamic imports for large components

### 2. Virtual Scrolling
- For list components with many items
- Render only visible items

### 3. Efficient Updates
- Use efficient DOM diffing
- Avoid unnecessary re-renders
- Batch updates where possible

## Accessibility (a11y)

### Requirements
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Screen reader support
- ✅ High contrast mode support
- ✅ Reduced motion support

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 90+

## Dependencies

- `@printchecks/core` - Core business logic
- No other runtime dependencies
- DevDependencies:
  - `tsup` - Build tool
  - `typescript` - Type checking
  - `@web/test-runner` - Testing (optional)
  - `@custom-elements-manifest/analyzer` - Generate manifest

## Deliverables

1. ✅ All 8 web components implemented
2. ✅ Build configuration with tsup
3. ✅ TypeScript declarations
4. ✅ Custom elements manifest
5. ✅ README with usage examples
6. ✅ Storybook documentation (optional but recommended)
7. ✅ Unit tests (optional but recommended)

## Success Criteria

- ✅ All components work in vanilla JS
- ✅ All components work in React, Vue, Angular
- ✅ Components are accessible (a11y compliant)
- ✅ Components are themeable
- ✅ Build produces valid ESM and CJS bundles
- ✅ TypeScript types are correctly generated
- ✅ Documentation is complete and clear

## Timeline Estimate

- **Component Implementation**: 3-4 days
- **Styling & Theming**: 1 day
- **Testing**: 1-2 days
- **Documentation**: 1 day
- **Total**: 6-8 days

---

**Next Steps After Phase 3:**
- **Phase 4**: Build & Distribution - CDN, npm publishing, version management
- **Phase 5**: Documentation & Examples - Full API docs, tutorials, example applications
- **Migration**: Migrate existing Vue app to use the packages
