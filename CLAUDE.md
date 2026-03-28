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
- [ ] MEDIUM: Upgrade eslint 9→10 — fixes minimatch@3.x ReDoS (HIGH) in dev chain that cannot be resolved via overrides; also picks up flatted/ajv/brace-expansion fixes; check breaking rule changes first
- [x] HIGH: Add receipt-form API doc page — created `docs/api/web-components/receipt-form.md` with attributes, events, methods, form fields, 4 examples, CSS vars; added to sidebar
- [x] MEDIUM: Test remaining core services — added 99 new tests (346 total); VendorService (41), BankAccountService (31), ReceiptService (35); all pass. Key quirks: BankAccount.isDefault is undefined not false until explicitly set; Receipt date uses toLocaleDateString(); ReceiptFilters.fromDate/toDate require Date objects; lineItems need explicit id in input since Receipt.addLineItem pushes raw data
- [ ] MEDIUM: Test check-preview web component — only component in `@printchecks/web-components` with zero tests; observes `check-id` and `scale` attributes; model after printable-check-page.test.ts
- [ ] MEDIUM: Update changelog — `docs/reference/changelog.md` stuck at v1.0.0 (2024-01-31); add v1.0.1 entry and a v1.0.2-dev entry covering MICR fixes, XSS fix, account-number validation
- [ ] MEDIUM: Fill in stub component docs — `docs/components/receipt-builder.md` (8 lines), `bank-account-manager.md` (12 lines), `vendor-management.md` (12 lines) are near-empty placeholders
- [ ] LOW: Test SecureStorageAdapter — complex encryption/decryption logic with zero coverage; needs stubs for the Web Crypto API or a jsdom environment
- [ ] LOW: ESLint major-version upgrade — eslint 9→10, eslint-plugin-vue 9→10, globals 15→17 all have major bumps; upgrade after confirming no breaking rule changes affect the codebase
- [ ] LOW: Vue composable tests — @printchecks/vue has 6 untested composables (useChecks, useBankAccounts, useVendors, useReceipts, usePrintChecks, usePrintableCheckPage); requires Vue test-utils setup

### Memory Maintenance

At the end of every self-review cycle, update your memory files to capture what you learned:

1. **Review existing memories** — read your MEMORY.md index. Are any entries stale or wrong? Remove or update them.
2. **Save new discoveries** — if you learned something important during this cycle that would help in future sessions, save it:
   - **project type**: architectural decisions, known gotchas, deployment quirks, environment-specific issues
   - **feedback type**: approaches that worked or didn't, patterns to follow or avoid
   - **reference type**: external URLs, API docs, dashboard links, monitoring endpoints
3. **Keep memories useful** — don't save things derivable from code or git history. Focus on the "why" behind decisions, non-obvious constraints, and context that would be lost between sessions.
4. **Update MEMORY.md** — ensure the index reflects your current memory files with accurate one-line descriptions.
