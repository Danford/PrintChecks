# Changelog

All notable changes to PrintChecks will be documented in this file.

## [Unreleased]

### Added

- Bank account number validation: `validateBankAccountNumber()` enforces digits-only, 1–17 characters
- MICR line length validation: `validateMICRLineLength()` enforces ≤43 characters
- Both new validators wired into `Check.validate()` and `BankAccount.validate()`
- Pre-print validation gate: `CheckPreview` now blocks the print action if `check.validate()` fails
- ABA routing number checksum validation in `Check.validate()` and `BankAccount.validate()`
- `receipt-form` web component API reference documentation (attributes, events, methods, CSS vars)
- Error cause chaining (`{ cause: error }`) in all encryption utility re-throws for better stack traces

### Fixed

- MICR line delimiters unified across `CheckRenderer`, `check-preview`, and `printable-check-page` — canonical symbols are now `⑆` (transit) and `⑈` (amount) consistently
- XSS risk removed from `CheckRenderer.vue`: `v-html` binding on `amountWords` replaced with safe text interpolation

### Security

- ESLint upgraded from v9 to v10 (with `eslint-plugin-vue` v10, `eslint-config-prettier` v10, `globals` v16)
- `preserve-caught-error` violations fixed in `encryption.ts` and `secureStorage.ts` (error cause now propagated)

---

## [1.0.1] - 2026-03-27

### Fixed

- Restored `PrintChecksReceiptForm` web component to correctly match `Receipt` model structure (`BillToInfo`, `PaymentInfo`, `ReceiptTotals` shapes)
- Resolved build type errors in `printable-check-page` and `usePrintableCheckPage` composable
- Corrected CJS/ESM `exports` fields in `@printchecks/core` and `@printchecks/vue` `package.json`

### Added

- Full web-components test suite: 92 tests across all 6 components

---

## [1.0.0] - 2024-01-31

### Added

- Initial release of PrintChecks monorepo
- `@printchecks/core` package with full check printing functionality
- `@printchecks/vue` package with Vue 3 composables
- `@printchecks/web-components` package with framework-agnostic components
- Complete documentation site with VitePress
- Support for multiple bank accounts
- Vendor management system
- Receipt creation with line items
- Encrypted storage adapter
- Local storage adapter
- Payment analytics and statistics
- Data import/export functionality
- MICR E13B font support
- Amount to words conversion
- Check voiding and duplicate functionality

### Security

- Optional AES-256-GCM encryption for sensitive data
- 100% local, privacy-first architecture
- No external server communication

## See Also

- [GitHub Releases](https://github.com/Danford/PrintChecks/releases)
- [Migration Guide](/guide/installation)
