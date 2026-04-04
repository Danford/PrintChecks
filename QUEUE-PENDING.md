# Pending Tasks

- [x] MEDIUM: Remove unused `useData` import in docs Demo.vue — 1 no-unused-vars warning, 1-line fix
- [x] MEDIUM: Add view component tests for ImportExportView and AnalyticsView — added @vue/test-utils + jsdom devDeps; 20 AnalyticsView tests (paymentHistory filtering, enhancedStats, topVendors) + 21 ImportExportView tests (export counts, encryption toggle, onFileSelected, importData validation); File.text() overridden for jsdom compatibility; 1324 total tests
- [ ] LOW: Reduce no-explicit-any warnings (84 total) — mostly in service test fixtures and web component tests; replace `any` with proper types where straightforward
