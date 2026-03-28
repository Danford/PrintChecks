# PrintChecks

Check printing library — TypeScript core, Vue composables, web components, VitePress docs.

## Self-Review Protocol

When triggered by the orchestrator, follow the self-review prompt at `~/projects/orchestrator/self_review_prompt.md`.

Pick the highest-priority incomplete item from the Priority Queue below. Work on one focused task per cycle. After completing work, validate and update the Priority Queue.

### Validate before committing
1. Run `pnpm test` — if tests fail, try to fix them. If you can't fix quickly, commit anyway with a note about which tests are failing and why. Add a HIGH Priority Queue item for the failures.
2. Check `git diff --stat` — if 15+ files or 500+ lines changed, explain why in the commit message.
3. Never delete files unless the task explicitly requires it.
4. Never modify CI/CD configs, deployment scripts, or .env files unless the task explicitly requires it.

### Deployment Verification

After committing and pushing, check CI/CD status:
```bash
gh run list --limit 5
```

If the latest run **failed**:
1. Check the failure details: `gh run view <run-id> --log-failed 2>/dev/null | tail -30`
2. Diagnose the root cause — is it a test failure, build error, or deployment issue? Is it a verify failure (tests/lint), release failure (npm publish), or docs failure (VitePress build)?
3. If it's something you can fix (test failure, build error), fix it and push again.
4. If it's an infrastructure issue (deploy target down, secrets expired), add a HIGH Priority Queue item and note it in memory.
5. Re-check: `gh run list --limit 5` to confirm the fix worked.

If the latest run **passed**: note it in the run log and move on.

If no runs triggered (e.g., you didn't push to a deploy branch): skip this step.

### Research & Planning Phase

If all Priority Queue items are complete (or only LOW items remain), enter this phase instead of picking a task:

1. **Codebase audit** � scan for patterns that indicate tech debt, security gaps, or architectural issues:
   ```bash
   grep -rn "TODO\|FIXME\|HACK\|XXX\|DEPRECATED" . --include="*.ts" --include="*.vue" -l 2>/dev/null | head -20
   ```
2. **Dependency health** � check for outdated or vulnerable packages:
   ```bash
   pnpm outdated 2>/dev/null | head -20
   pnpm audit --audit-level=moderate 2>/dev/null | tail -10
   ```
3. **Test coverage gaps** � identify untested or under-tested areas:
   ```bash
   pnpm test -- --coverage 2>/dev/null | tail -20
   ```
4. **Architecture review** � read through key files and assess:
   - Is MICR line generation correct across all check formats?
   - Is the web component API consistent and well-documented?
   - Are Vue composable reactivity edge cases handled?
   - Are there cross-browser rendering issues?
5. **Competitive/ecosystem research** � consider:
   - What do check printing standards (ANSI X9.100) require?
   - How can accessibility be improved for print preview?
   - What integrations would be valuable (QuickBooks, Xero)?
6. **Write a development roadmap** � populate the Priority Queue with 5-10 new items based on findings, categorized as HIGH/MEDIUM/LOW. Focus on items that deliver the most user value or reduce the most risk.

Do NOT write code during this phase � only research and plan. Commit the updated CLAUDE.md with the new Priority Queue items.
Update the Priority Queue — mark done items, add new discoveries, re-prioritize.

## Priority Queue

- [x] HIGH: Post-release coverage gaps identified after v1.0.1 — added 193 new tests across validation.ts, formatting.ts, BankAccount model, CheckService (213 core tests total; all pass)
- [x] MEDIUM: UX review — check rendering consistency — fixed MICR delimiter mismatch across 3 components (⑆/⑈ canonical), removed XSS risk (v-html→text on amountWords)
- [x] MEDIUM: MICR line validation edge cases — added validateBankAccountNumber (digits-only, 1–17) and validateMICRLineLength (≤43 chars); wired into Check.validate() and BankAccount.validate(); 34 new edge-case tests
- [x] HIGH: Dev-dependency security audit — reduced 23→13 vulns: updated typescript-eslint (8.54→8.57.2), @changesets/cli (2.29.8→2.30.0); added pnpm.overrides for picomatch@2/4, flatted, brace-expansion@1, ajv@6; remaining 13 need major version upgrades (eslint 9→10, Vite 4→5, VitePress)
- [x] HIGH: Upgrade Vite 4→5 in printchecks app — vite 5.4.21 + @vitejs/plugin-vue 5.2.4 installed; build and type-check pass; audit reduced 13→8 (rollup HIGH + vite LOW/MOD chains resolved); remaining 8 in eslint/vitepress/vue-tsc chains
- [x] HIGH: Update VitePress in docs — VitePress 1.6.4 is already latest stable; added pnpm.overrides for rollup@>=4.0.0<4.59.0→4.59.0 and esbuild@<=0.24.2→0.25.0; vulns reduced 8→6; remaining 6 require vue-tsc 1→2 or eslint 9→10; also fixed 3 pre-existing CI failures (TS unused vars, mock type annotation, ESLint cache exclusion, docs dead links, vue-alias SSR incompatibility)
- [x] MEDIUM: Upgrade vue-tsc 1→2 in printchecks app — vue-tsc ^1.6.5→^2.2.12, TypeScript ~5.0.4→~5.4.5 (TS 5.0 had ScriptKind eval error with vue-tsc 2); added pnpm.overrides for minimatch@9 and brace-expansion@2; also fixed minimatch@3 override (<3.1.3 → <3.1.4); vulns: 6→0
- [x] MEDIUM: Upgrade eslint 9→10 — eslint+@eslint/js→10.x, eslint-plugin-vue→10.8.0, eslint-config-prettier→10.x, globals→16.x; removed dead eslint 8 from printchecks workspace; fixed preserve-caught-error in encryption.ts files (3 files, 9 fixes); no-useless-assignment downgraded to warn (39 violations in app views, fix separately)
- [x] HIGH: Add receipt-form API doc page — created `docs/api/web-components/receipt-form.md` with attributes, events, methods, form fields, 4 examples, CSS vars; added to sidebar
- [x] MEDIUM: Test remaining core services — added 99 new tests (346 total); VendorService (41), BankAccountService (31), ReceiptService (35); all pass. Key quirks: BankAccount.isDefault is undefined not false until explicitly set; Receipt date uses toLocaleDateString(); ReceiptFilters.fromDate/toDate require Date objects; lineItems need explicit id in input since Receipt.addLineItem pushes raw data
- [x] MEDIUM: Test check-preview web component — 27 tests added (133 total in web-components); covers setCheck(), print(), scale CSS transform, check-id async load, error/throw handling, button events. Key quirk: setting check-id before appendChild causes loadCheck to fire twice — use append-first then setAttribute pattern for tests requiring exactly one load.
- [x] MEDIUM: Update changelog — added v1.0.1 (2026-03-27) and [Unreleased] sections to `docs/reference/changelog.md`; covers MICR fixes, XSS fix, account-number/MICR-length validation, pre-print gate, ABA checksum, receipt-form docs, error cause chaining, ESLint 10 upgrade
- [x] MEDIUM: Fill in stub component docs — expanded all 3 stubs with intro, components table, 3–4 practical code examples each, and See Also links; receipt-builder (57 lines), bank-account-manager (87 lines), vendor-management (84 lines)
- [ ] LOW: Test SecureStorageAdapter — complex encryption/decryption logic with zero coverage; needs stubs for the Web Crypto API or a jsdom environment
- [x] LOW: ESLint major-version upgrade — duplicate of MEDIUM item above; completed in same cycle
- [ ] LOW: Vue composable tests — @printchecks/vue has 6 untested composables (useChecks, useBankAccounts, useVendors, useReceipts, usePrintChecks, usePrintableCheckPage); requires Vue test-utils setup
- [ ] LOW: Fix no-useless-assignment warnings — 39 violations across printchecks app views (AnalyticsView, HistoryView, ImportExportView, VendorsView and others); assignments made then never read, likely dead code from refactoring
- [x] MEDIUM: Add PrintChecksCore integration tests — 47 tests added (393 total); covers construction, full CRUD delegation for all 4 services, exportData, importData, clearAllData, getAllStatistics, export→import round-trip; key fix: field is `isVoid` not `isVoided`, stats use `total` not `totalChecks`
- [ ] LOW: Test LocalStorageAdapter — needs jsdom environment; `getStorageStats`, `getMany`, `setMany`, `keys`, `has` all untested; StorageError thrown for quota exceeded also untested
- [x] LOW: Test Receipt model totals calculation — 42 tests added (435 total); covers LineItem.calculateTotal() (tax, discount, both together), Receipt.calculateTotals() (subtotal, tax accumulation, discount accumulation, shipping/handling preservation, grandTotal formula), setters, addLineItem/removeLineItem/updateLineItem, validate(), and construction; key: totals preserved when provided in constructor (calculateTotals not called)
- [ ] LOW: Upgrade globals v16→v17 — only outdated dep (16.5.0 vs 17.4.0 latest); check for breaking changes before upgrading

### Memory Maintenance

At the end of every self-review cycle, update your memory files to capture what you learned:

1. **Review existing memories** — read your MEMORY.md index. Are any entries stale or wrong? Remove or update them.
2. **Save new discoveries** — if you learned something important during this cycle that would help in future sessions, save it:
   - **project type**: architectural decisions, known gotchas, deployment quirks, environment-specific issues
   - **feedback type**: approaches that worked or didn't, patterns to follow or avoid
   - **reference type**: external URLs, API docs, dashboard links, monitoring endpoints
3. **Keep memories useful** — don't save things derivable from code or git history. Focus on the "why" behind decisions, non-obvious constraints, and context that would be lost between sessions.
4. **Update MEMORY.md** — ensure the index reflects your current memory files with accurate one-line descriptions.
