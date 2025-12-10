# PrintChecks Architecture Documentation

This document provides a comprehensive overview of the PrintChecks application architecture, design decisions, and technical implementation details.

---

## 📚 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [State Management](#state-management)
5. [Component Structure](#component-structure)
6. [Data Flow](#data-flow)
7. [Storage Strategy](#storage-strategy)
8. [Security & Privacy](#security--privacy)
9. [Performance Considerations](#performance-considerations)
10. [Future Enhancements](#future-enhancements)

---

## 🏗️ System Overview

### High-Level Architecture

PrintChecks is a **client-side single-page application (SPA)** that runs entirely in the browser with no backend dependencies.

```
┌─────────────────────────────────────────────────┐
│              Browser Environment                 │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │          Vue.js Application Layer          │ │
│  │  ┌──────────────┐  ┌──────────────────┐   │ │
│  │  │ Vue Router   │  │  Pinia Stores    │   │ │
│  │  └──────────────┘  └──────────────────┘   │ │
│  │  ┌──────────────┐  ┌──────────────────┐   │ │
│  │  │ Components   │  │  Composables     │   │ │
│  │  └──────────────┘  └──────────────────┘   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │        Browser APIs & Storage              │ │
│  │  • LocalStorage (Data Persistence)         │ │
│  │  • Print API (Check/Receipt Printing)      │ │
│  │  • File API (Logo Upload)                  │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Design Principles

1. **Privacy First**: No external network requests, all data stays local
2. **Zero Backend**: Completely client-side application
3. **Reactive State**: Leveraging Vue 3's reactivity system
4. **Type Safety**: Full TypeScript for reliability
5. **Modular Design**: Separation of concerns with stores and composables
6. **Progressive Enhancement**: Core features work even with limited browser support

---

## 🛠️ Technology Stack

### Core Framework
- **Vue.js 3.3.4** (Composition API)
  - Modern reactive framework
  - Composition API for better code organization
  - Script setup syntax for cleaner components

### Language
- **TypeScript 5.0.4**
  - Static type checking
  - Enhanced IDE support
  - Better refactoring capabilities

### State Management
- **Pinia 2.1.3**
  - Official Vue state management
  - Type-safe stores
  - DevTools integration
  - Modular store architecture

### Routing
- **Vue Router 4.2.2**
  - Official Vue routing solution
  - Lazy-loaded routes
  - Named routes with type safety

### Build Tool
- **Vite 4.3.9**
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ESM support
  - Efficient code splitting

### UI Framework
- **Bootstrap 5**
  - Responsive grid system
  - Pre-built components
  - Utility classes for rapid development

### Utilities
- **to-words 4.1.0**: Currency to text conversion
- **print-js 1.6.0**: Browser printing functionality

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **vue-tsc**: TypeScript type checking for Vue

---

## 🏛️ Application Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (Views)          │
│  • HomeView, HistoryView, AnalyticsView    │
└─────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────┐
│      Component Layer (UI Components)        │
│  • CheckPrinter, VendorModal, etc.         │
└─────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────┐
│    Business Logic Layer (Stores)            │
│  • checkStore, historyStore, etc.          │
└─────────────────────────────────────────────┘
                    ↓ ↑
┌─────────────────────────────────────────────┐
│    Data Layer (LocalStorage)                │
│  • Persistent state storage                │
└─────────────────────────────────────────────┘
```

### Module Organization

```
src/
├── views/           # Page-level components (routing targets)
├── components/      # Reusable UI components
├── stores/          # Pinia stores (state management)
├── composables/     # Reusable composition functions
├── types/           # TypeScript type definitions
├── router/          # Route configuration
└── assets/          # Static assets (fonts, styles)
```

---

## 🗄️ State Management

### Pinia Store Architecture

PrintChecks uses **five primary stores**:

#### 1. App Store (`stores/app.ts`)

**Purpose**: Global application state and shared resources

**State:**
```typescript
{
  bankAccounts: BankAccount[];
  vendors: Vendor[];
  currentBankAccount: BankAccount | null;
  appSettings: AppSettings;
}
```

**Key Actions:**
- `addBankAccount(account: BankAccount)`
- `updateBankAccount(id: string, updates: Partial<BankAccount>)`
- `deleteBankAccount(id: string)`
- `addVendor(vendor: Vendor)`
- `updateVendor(id: string, updates: Partial<Vendor>)`
- `deleteVendor(id: string)`

#### 2. Check Store (`stores/check.ts`)

**Purpose**: Check creation and printing logic

**State:**
```typescript
{
  currentCheck: CheckData;
  lastCheckNumber: Record<string, number>; // Per bank account
  printSettings: PrintSettings;
}
```

**Key Actions:**
- `createCheck(data: Partial<CheckData>)`
- `updateCheckField(field: keyof CheckData, value: any)`
- `printCheck()`
- `resetCheck()`
- `getNextCheckNumber(accountId: string): number`

#### 3. Customization Store (`stores/customization.ts`)

**Purpose**: Visual styling and personalization

**State:**
```typescript
{
  fonts: FontSettings;
  colors: ColorScheme;
  logo: LogoSettings | null;
  layout: LayoutSettings;
  presets: StylePreset[];
  activePreset: string | null;
}
```

**Key Actions:**
- `updateFont(element: string, font: string)`
- `updateColors(colors: Partial<ColorScheme>)`
- `uploadLogo(file: File)`
- `savePreset(name: string)`
- `loadPreset(id: string)`
- `deletePreset(id: string)`

#### 4. Receipt Store (`stores/receipt.ts`)

**Purpose**: Receipt and line item management

**State:**
```typescript
{
  currentReceipt: ReceiptData;
  lineItems: LineItem[];
  taxRate: number;
  additionalCharges: AdditionalCharges;
}
```

**Key Actions:**
- `addLineItem(item: LineItem)`
- `updateLineItem(id: string, updates: Partial<LineItem>)`
- `deleteLineItem(id: string)`
- `setTaxRate(rate: number)`
- `calculateTotals(): ReceiptTotals`
- `generateReceipt()`

#### 5. History Store (`stores/history.ts`)

**Purpose**: Payment history tracking and analytics

**State:**
```typescript
{
  payments: Payment[];
  filters: HistoryFilters;
  sortBy: SortOptions;
  pagination: PaginationState;
}
```

**Key Actions:**
- `addPayment(payment: Payment)`
- `searchPayments(query: string): Payment[]`
- `filterPayments(filters: HistoryFilters): Payment[]`
- `sortPayments(field: string, direction: 'asc' | 'desc')`
- `getPaymentsByVendor(vendorId: string): Payment[]`
- `getPaymentAnalytics(): AnalyticsData`

### Store Communication

Stores can reference each other when needed:

```typescript
// In check.ts store
import { useHistoryStore } from './history';
import { useAppStore } from './app';

export const useCheckStore = defineStore('check', () => {
  const historyStore = useHistoryStore();
  const appStore = useAppStore();
  
  const printCheck = () => {
    // Create check...
    const payment = { /* ... */ };
    
    // Log to history
    historyStore.addPayment(payment);
  };
  
  return { printCheck };
});
```

---

## 🧩 Component Structure

### Component Hierarchy

```
App.vue
├── NavigationBar.vue
└── RouterView
    ├── HomeView.vue
    │   ├── CheckPrinter.vue
    │   ├── BankAccountModal.vue
    │   └── VendorModal.vue
    ├── BankAccountsView.vue
    │   └── BankAccountModal.vue
    ├── VendorsView.vue
    │   └── VendorModal.vue
    ├── ReceiptView.vue
    │   └── LineItemManager.vue
    ├── CustomizationView.vue
    │   └── CustomizationPanel.vue
    ├── HistoryView.vue
    │   ├── HistoryFilters.vue
    │   └── HistoryTable.vue
    └── AnalyticsView.vue
        ├── AnalyticsChart.vue
        └── StatisticsCard.vue
```

### Component Types

#### 1. **View Components** (`views/`)
- Page-level components
- Route targets
- Compose smaller components
- Handle page-level logic

#### 2. **Container Components**
- Manage local state
- Handle business logic
- Pass data to presentational components
- Example: `CheckPrinter.vue`

#### 3. **Presentational Components**
- Pure UI components
- Receive data via props
- Emit events for interactions
- Minimal or no business logic
- Example: `StatisticsCard.vue`

#### 4. **Modal Components**
- Overlay UI for data entry
- Self-contained forms
- Emit save/cancel events
- Example: `BankAccountModal.vue`, `VendorModal.vue`

### Component Communication

**Parent → Child**: Props
```vue
<CheckPrinter :bankAccount="currentAccount" :vendors="vendorList" />
```

**Child → Parent**: Events
```vue
// Child
emit('save', formData);

// Parent
<VendorModal @save="handleSave" @cancel="handleCancel" />
```

**Store Access**: Any component can access stores
```typescript
import { useCheckStore } from '@/stores/check';

const checkStore = useCheckStore();
```

---

## 🔄 Data Flow

### Check Printing Flow

```
┌─────────────────┐
│   User Input    │
│  (HomeView)     │
└────────┬────────┘
         ↓
┌─────────────────┐
│  CheckPrinter   │
│   Component     │
└────────┬────────┘
         ↓
┌─────────────────┐
│   Check Store   │
│  (Validation)   │
└────────┬────────┘
         ↓
┌─────────────────┐
│   Print API     │
│ (Browser Print) │
└────────┬────────┘
         ↓
┌─────────────────┐
│ History Store   │
│ (Log Payment)   │
└────────┬────────┘
         ↓
┌─────────────────┐
│  LocalStorage   │
│   (Persist)     │
└─────────────────┘
```

### Data Persistence Flow

```
Store State Change
       ↓
Pinia Reactive Update
       ↓
Store Watcher Triggered
       ↓
Serialize to JSON
       ↓
Write to LocalStorage
       ↓
Data Persisted
```

### Application Initialization Flow

```
App Loads
    ↓
Router Initializes
    ↓
Stores Created
    ↓
Load from LocalStorage
    ↓
Hydrate Store State
    ↓
Render Initial View
    ↓
App Ready
```

---

## 💾 Storage Strategy

### LocalStorage Schema

PrintChecks uses browser LocalStorage for data persistence:

**Keys:**
```
printchecks_bankAccounts    → JSON array of bank accounts
printchecks_vendors         → JSON array of vendors
printchecks_history         → JSON array of payment records
printchecks_customization   → JSON object of style settings
printchecks_receipts        → JSON array of receipts
printchecks_settings        → JSON object of app settings
```

### Data Serialization

All data is stored as JSON strings:

```typescript
// Write
localStorage.setItem('printchecks_vendors', JSON.stringify(vendors));

// Read
const vendors = JSON.parse(localStorage.getItem('printchecks_vendors') || '[]');
```

### Storage Limitations

- **Quota**: ~5-10MB per domain (browser-dependent)
- **Type**: String-only storage (requires JSON serialization)
- **Scope**: Per-origin (domain + protocol + port)

### Data Migration Strategy

For future schema changes:

```typescript
interface StorageMetadata {
  version: string;
  lastUpdated: Date;
}

const CURRENT_VERSION = '1.0.0';

function migrateData(data: any, fromVersion: string): any {
  if (fromVersion === '1.0.0' && CURRENT_VERSION === '2.0.0') {
    // Perform migration
    return migratedData;
  }
  return data;
}
```

---

## 🔒 Security & Privacy

### Privacy Principles

1. **No External Requests**: Zero network communication
2. **Local Processing**: All operations in-browser
3. **No Analytics**: No tracking or telemetry
4. **No Cookies**: No cookie usage
5. **Open Source**: Fully auditable code

### Data Protection

**Client-Side Only:**
- All data remains on user's computer
- No transmission to external servers
- No cloud backup (user's responsibility)

**Browser Isolation:**
- Data scoped to origin (same-origin policy)
- Other websites cannot access PrintChecks data
- Each browser maintains separate data

### Recommendations for Users

1. **Run Locally**: Don't deploy to public servers
2. **Regular Backups**: Export data periodically
3. **Secure Computer**: Use OS-level security
4. **Browser Security**: Keep browser updated

### Potential Vulnerabilities

**XSS (Cross-Site Scripting):**
- Vue.js escapes user input by default
- No `v-html` usage with untrusted data

**LocalStorage Access:**
- Accessible via browser DevTools
- Accessible by any script on the same origin
- Not encrypted by default

**Mitigation:**
- User education
- Secure hosting recommendations
- Open source for auditability

---

## ⚡ Performance Considerations

### Optimization Strategies

#### 1. **Code Splitting**
```typescript
// Lazy-loaded routes
const HistoryView = () => import('@/views/HistoryView.vue');
const AnalyticsView = () => import('@/views/AnalyticsView.vue');
```

#### 2. **Computed Properties**
```typescript
const filteredPayments = computed(() => {
  return payments.value.filter(p => /* filter logic */);
});
```
- Cached until dependencies change
- Avoids redundant calculations

#### 3. **Virtual Scrolling**
For large payment histories:
```typescript
// Consider implementing virtual scrolling for 1000+ items
import { useVirtualList } from '@vueuse/core';
```

#### 4. **Debounced Search**
```typescript
import { debounce } from 'lodash-es';

const searchPayments = debounce((query: string) => {
  // Search logic
}, 300);
```

#### 5. **Memoization**
```typescript
const expensiveCalculation = computed(() => {
  // Cache result until dependencies change
  return complexAnalytics(payments.value);
});
```

### Bundle Size Optimization

- **Tree Shaking**: Vite removes unused code
- **Lazy Loading**: Routes loaded on-demand
- **Minification**: Production builds are minified
- **Compression**: Enable gzip/brotli on hosting

### Current Bundle Sizes (Approximate)

```
Vendor chunk:   ~150 KB (Vue, Pinia, Router)
App chunk:      ~50 KB  (Application code)
Fonts:          ~30 KB  (E13B MICR font)
Total:          ~230 KB (gzipped)
```

---

## 🚀 Future Enhancements

### Potential Features

#### 1. **Data Import/Export**
- CSV import for vendors
- JSON export for full backup
- Integration with accounting software

#### 2. **Advanced Analytics**
- Forecasting and predictions
- Budget tracking
- Spending categories
- Visual dashboards

#### 3. **Multi-Currency Support**
- International check formats
- Currency conversion
- Localized number formatting

#### 4. **Template System**
- Multiple check templates
- Custom layouts
- Template marketplace

#### 5. **Encryption**
- Optional client-side encryption
- Password-protected data
- Encrypted exports

#### 6. **Cloud Sync (Optional)**
- End-to-end encrypted sync
- Multi-device support
- Backup to cloud storage

#### 7. **Mobile Support**
- Progressive Web App (PWA)
- Mobile-optimized UI
- Touch-friendly interactions

#### 8. **Batch Operations**
- Print multiple checks
- Bulk vendor imports
- Mass updates

### Technical Debt

- Add comprehensive unit tests
- Implement E2E testing
- Improve accessibility (ARIA labels)
- Add internationalization (i18n)
- Optimize for larger datasets (10,000+ checks)

---

## 📊 Architecture Diagrams

### Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Vue.js Application                    │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              Presentation Layer                   │ │ │
│  │  │   ┌──────────┐ ┌──────────┐ ┌──────────────┐    │ │ │
│  │  │   │   Home   │ │ Vendors  │ │  Analytics   │    │ │ │
│  │  │   │   View   │ │   View   │ │     View     │    │ │ │
│  │  │   └──────────┘ └──────────┘ └──────────────┘    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                         ↕                              │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │             Component Layer                       │ │ │
│  │  │   ┌────────────┐ ┌─────────────┐ ┌──────────┐   │ │ │
│  │  │   │   Check    │ │   Vendor    │ │  Line    │   │ │ │
│  │  │   │  Printer   │ │    Modal    │ │  Item    │   │ │ │
│  │  │   └────────────┘ └─────────────┘ └──────────┘   │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                         ↕                              │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │          Business Logic (Pinia Stores)           │ │ │
│  │  │   ┌─────┐ ┌───────┐ ┌────────┐ ┌─────────┐     │ │ │
│  │  │   │ App │ │ Check │ │Receipt │ │ History │     │ │ │
│  │  │   │Store│ │ Store │ │ Store  │ │  Store  │     │ │ │
│  │  │   └─────┘ └───────┘ └────────┘ └─────────┘     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                         ↕                              │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              Composables & Utils                  │ │ │
│  │  │        ┌────────────┐  ┌───────────────┐         │ │ │
│  │  │        │Formatting  │  │   Utilities   │         │ │ │
│  │  │        └────────────┘  └───────────────┘         │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Browser APIs & Storage                  │ │
│  │  ┌──────────────┐ ┌──────────┐ ┌─────────────────┐   │ │
│  │  │ LocalStorage │ │ Print API│ │  File API       │   │ │
│  │  └──────────────┘ └──────────┘ └─────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 References

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Vue Router Documentation](https://router.vuejs.org/)

---

*Last updated: December 2024*

