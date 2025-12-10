# 💰 PrintChecks

**Professional check printing and payment documentation that runs entirely in your browser**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

PrintChecks is a fork of PrintMeChecks that dramatically expands its capabilities to offer enhanced customization, richer output, and business-ready payment documentation. What started as a simple check-printing tool has evolved into a comprehensive, privacy-focused financial documentation system.

![PrintChecks Screenshot](https://drx-danwins.us-east-1.linodeobjects.com/drx-danwins/screencapture-printmechecks-tiiny-site-2024-07-04-07_13_31_(1)_e9e4be02.png)

---

## 🌟 Why PrintChecks?

**Privacy First**: Other check printing services charge $1.25+ per check and require you to upload sensitive banking information to third-party servers. PrintChecks runs entirely in your browser—no data ever leaves your computer.

**Business Ready**: Manage multiple bank accounts, track vendors, generate professional receipts, and access comprehensive payment analytics—all from one local tool.

**Cost Effective**: Buy blank check stock from any office supply store and print unlimited checks for free. No subscriptions, no per-check fees, no compromises.

---

## ✨ Key Features

### 🏦 Professional Check Printing
- Print checks on standard 8.5" x 11" paper
- Official **E13B MICR font** for routing and account numbers
- Automatic amount-to-words conversion
- Elegant signature fonts (optional)
- Multiple bank account support
- Custom logo upload and positioning

### 📋 Receipt & Invoice Management
- Create itemized receipts with line items
- Automatic calculations (subtotal, tax, totals)
- Professional formatting for business use

### 🎨 Customization Engine
- **Font customization** for every check element
- **Color schemes** and styling presets
- **Logo upload** with positioning controls
- **Preset system** for quick style switching

### 👥 Vendor Management
- Store vendor information (name, address, email, phone)
- Quick-fill vendor details on checks
- Track payment history per vendor

### 📊 Payment Analytics
- Payment volume tracking over time
- Top vendors by payment amount
- Monthly spending breakdowns
- Check frequency analysis
- Comprehensive payment history

### 📚 History & Documentation
- Complete payment history tracking
- Combined view of checks and receipts
- Immutable payment records
- **Coming Soon**: Search, filters, pagination, sorting, and data export

### 🔒 Privacy & Security
- **100% Local**: All processing happens in your browser
- **No Network Requests**: Zero external server communication
- **Local Storage**: Data stays on your computer
- **No Tracking**: No analytics, cookies, or user tracking
- **Open Source**: Audit the code yourself

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Danford/PrintChecks.git
cd PrintChecks/printchecks
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open in your browser**
Navigate to `http://localhost:5173/`

### Production Build
```bash
npm run build
```

The production build will be in the `dist/` directory, ready to deploy to any static hosting service.

---

## 📖 Usage Guide

### Setting Up Your First Check

1. **Add a Bank Account**
   - Navigate to "Bank Accounts" in the sidebar
   - Enter your routing number, account number, and bank name
   - Optionally upload your bank's logo

2. **Configure Check Style**
   - Go to "Customization" to personalize fonts, colors, and layout
   - Upload your company logo if desired
   - Save preset styles for quick access

3. **Print Your First Check**
   - Return to "Home" and fill in the check details
   - Select payee (or add a new vendor)
   - Enter amount and memo
   - Click "Print" to generate a print-ready check

### Managing Vendors

1. Navigate to "Vendors" in the sidebar
2. Click "Add Vendor" to create new entries
3. Fill in vendor details (name, address, contact info)
4. Use vendors for quick-fill when printing checks

### Creating Receipts

1. Go to "Receipts" in the sidebar
2. Add line items with descriptions and amounts
3. Configure tax rates and additional charges
4. Generate and print professional receipts

### Viewing Analytics

1. Navigate to "Analytics"
2. Review payment trends over time
3. Identify top vendors by payment volume
4. Analyze monthly spending patterns

---

## 📁 Project Structure

```
PrintChecks/
├── printchecks/              # Main application directory
│   ├── src/
│   │   ├── components/       # Vue components
│   │   │   ├── customization/  # Customization UI components
│   │   │   └── receipt/        # Receipt and line item components
│   │   ├── composables/      # Reusable Vue composition functions
│   │   ├── stores/           # Pinia state management
│   │   │   ├── app.ts          # Global app state
│   │   │   ├── check.ts        # Check management
│   │   │   ├── customization.ts # Styling and presets
│   │   │   ├── receipt.ts      # Receipt functionality
│   │   │   └── history.ts      # History tracking
│   │   ├── types/            # TypeScript type definitions
│   │   ├── views/            # Vue router views (pages)
│   │   ├── router/           # Vue Router configuration
│   │   └── main.ts           # Application entry point
│   ├── public/               # Static assets
│   ├── scripts/              # Development utility scripts
│   └── package.json          # Dependencies and scripts
├── LICENSE                   # MIT License
└── README.md                 # This file
```

---

## 🛠️ Technology Stack

- **[Vue.js 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Pinia](https://pinia.vuejs.org/)** - Intuitive state management
- **[Vue Router](https://router.vuejs.org/)** - Official routing solution
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[Bootstrap 5](https://getbootstrap.com/)** - Responsive CSS framework
- **[to-words](https://www.npmjs.com/package/to-words)** - Currency to text conversion
- **[print-js](https://printjs.crabbly.com/)** - Browser printing library

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run dev:clear        # Start dev server with cleared history (debugging)

# Production
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code Quality
npm run type-check       # Run TypeScript type checking
npm run lint             # Lint and auto-fix with ESLint
npm run format           # Format code with Prettier
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and ensure code quality
   ```bash
   npm run lint && npm run type-check
   ```
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (enforced by ESLint and Prettier)
- Write TypeScript with proper type definitions
- Test your changes thoroughly
- Update documentation as needed
- Keep commits focused and atomic

---

## 🐛 Troubleshooting

### Fonts not loading correctly
- Ensure the `expanded_fonts.js` file is present in the project root
- Check browser console for font loading errors
- Try clearing browser cache

### Print preview looks incorrect
- Verify your browser's print settings (margins, scale)
- Ensure "Background graphics" is enabled in print options
- Use Chrome or Firefox for best results

### Data not persisting
- Check that localStorage is enabled in your browser
- Ensure you're not in private/incognito mode
- Check browser console for storage errors

### Development server won't start
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure you're using Node.js v18+

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright © 2025 Joshua Danford**

---

## 🙏 Acknowledgments

- Original **PrintMeChecks** project by [sktzofrenic](https://github.com/sktzofrenic/printmechecks)
- Vue.js community for excellent documentation and tools
- All contributors who have helped improve this project

---

## 🔗 Links

- **Original Project**: [PrintMeChecks](https://github.com/sktzofrenic/printmechecks)
- **Demo**: [Live Demo](https://printmechecks.tiiny.site/) *(original version - may differ from this fork)*
- **Issues**: [Report a bug or request a feature](https://github.com/Danford/PrintChecks/issues)

---

## 💡 Tips for Best Results

1. **Check Stock**: Use standard 8.5" x 11" blank check stock with MICR ink compatibility
2. **Printer Settings**: 
   - Disable margins or use minimal margins
   - Enable "Background graphics"
   - Use 100% scale (no fit-to-page)
3. **Browser**: Chrome and Firefox provide the most consistent printing results
4. **Backups**: Periodically export your history and vendor data
5. **Security**: Run locally—never host this on a public server with real banking information

---

**PrintChecks: Take control of your payment documentation. Private, professional, and completely free.** 🏦✨
