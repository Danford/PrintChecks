# Phase 4: Build & Distribution - PLAN 🚀

## Overview
Phase 4 focuses on establishing a robust, automated pipeline for building, versioning, and distributing the PrintChecks packages. This ensures that `@printchecks/core` and `@printchecks/web-components` can be easily consumed by developers via NPM or CDNs, and that future updates are managed reliably.

## Goals
- ✅ **Automated Versioning**: Implement semantic versioning with changelog generation.
- ✅ **CI/CD Pipeline**: Automated testing, building, and publishing via GitHub Actions.
- ✅ **NPM Publishing**: Streamlined release process to the public NPM registry.
- ✅ **CDN Compatibility**: Ensure packages are optimized for usage via unpkg/jsdelivr.
- ✅ **Code Quality**: Enforce linting and testing in the pipeline.

## Implementation Details

### 1. Version Management (Changesets)
We will use [Changesets](https://github.com/changesets/changesets) for managing versioning in our pnpm workspace.

- **Why Changesets?**
  - Designed for monorepos.
  - Allows accumulating changes via "intent" files during development.
  - Automates bumping versions and updating `CHANGELOG.md`.

**Action Items:**
- [ ] Install `@changesets/cli` in the root.
- [ ] Initialize changesets config.
- [ ] Configure `access: public` for our packages.
- [ ] Add `changeset` script to root `package.json`.

### 2. CI/CD Pipeline (GitHub Actions)
We will create two primary workflows:

#### **A. Verification Workflow (`verify.yml`)**
Triggers on: `pull_request`, `push` to branches.
- Setup Node.js + pnpm.
- `pnpm install`.
- `pnpm lint`: Run ESLint across all workspaces.
- `pnpm type-check`: Run TypeScript validation.
- `pnpm build`: Verify build succeeds.
- `pnpm test`: Run unit tests (if applicable/added).

#### **B. Release Workflow (`release.yml`)**
Triggers on: `push` to `main`.
- Setup Node.js + pnpm.
- `pnpm install`.
- `pnpm build`.
- **Changesets Version**: Create a PR for version bumps if needed (using `changeset version`).
- **Changesets Publish**: If the "Version Packages" PR is merged, publish to NPM (using `changeset publish`).
  - Requires `NPM_TOKEN` secret in repo.

### 3. Package Configuration Updates
Audit and update `package.json` files for optimal distribution.

- **`@printchecks/core`**:
  - Verify `sideEffects: false` for tree-shaking.
  - Ensure `exports` field covers all subpaths correctly.
  - Add `repository` and `homepage` metadata.

- **`@printchecks/web-components`**:
  - Verify `sideEffects` (may be needed for component registration files).
  - Ensure `custom-elements.json` is included in the package.
  - Add `repository` and `homepage` metadata.

### 4. CDN Optimization
Ensure our build artifacts are consumable directly from CDNs like unpkg.

- **UMD/Global Build**:
  - The current `tsup` config produces ESM and CJS.
  - For `web-components`, we might want a single bundled file that auto-registers components for simple `<script>` tag usage.
  - **Action**: Add a `global` format to `tsup` config for `web-components`.

## Timeline Estimate

- **Tooling Setup (Changesets)**: 0.5 Day
- **GitHub Actions Configuration**: 1 Day
- **Package Optimization**: 0.5 Day
- **Testing & Verification**: 0.5 Day
- **Total**: ~2-3 Days

## Next Steps After Phase 4
- **Phase 5**: Documentation & Examples - Build a dedicated documentation site (VitePress/Astro) with live demos.
- **Migration**: Update the main Vue application to consume the published packages instead of local code (or use workspace aliases effectively).
