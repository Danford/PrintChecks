# PrintChecks Application

This directory contains the main PrintChecks application - a comprehensive check printing and payment documentation system.

## 🚀 Quick Start

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

3. **Open in browser**
Navigate to `http://localhost:5173/` to start using PrintChecks

### Production Build
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # Vue components
│   ├── customization/   # Customization-related components
│   └── receipt/         # Receipt and line item components
├── composables/         # Reusable composition functions
├── stores/              # Pinia state management stores
│   ├── app.ts          # Global application state
│   ├── check.ts        # Check management
│   ├── customization.ts # Styling and presets
│   ├── receipt.ts      # Receipt functionality
│   └── history.ts      # History management
├── types/               # TypeScript type definitions
│   ├── check.ts        # Check-related types
│   ├── customization.ts # Customization types
│   ├── receipt.ts      # Receipt and line item types
│   ├── common.ts       # Shared types
│   └── index.ts        # Type exports
├── views/               # Vue router views
├── assets/              # Static assets
└── main.ts             # Application entry point
```

## 🎪 Features

### ✅ Check Printing
- Professional check printing on standard 8.5x11 paper
- Official E13B font for banking information
- Automatic currency-to-words conversion
- Multiple bank account support

### 🎨 Customization
- Font customization for all check elements
- Color scheme management
- Logo upload and positioning
- Layout and spacing controls
- Preset system for quick styling

### 📋 Receipt Management
- Line item creation and editing
- Automatic calculations (subtotal, tax, totals)
- Additional charges (shipping, handling)
- Professional receipt generation

### 📚 History
- Enhanced history with search and filtering
- Combined view of checks, receipts, and payments
- Pagination and sorting options

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Technology Stack

- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Bootstrap 5** - CSS framework

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

## 🔒 Privacy & Security

PrintChecks operates with privacy as a core principle:

- **100% Local**: All data processing happens in your browser
- **No Network Requests**: No data is ever transmitted to external servers
- **Local Storage**: All information stored locally in your browser
- **No Tracking**: No analytics, cookies, or user tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint && npm run type-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**PrintChecks: Professional check printing and payment documentation, privately and securely in your browser.** 🏦✨
