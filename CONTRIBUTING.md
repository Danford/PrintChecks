# Contributing to PrintChecks

Thank you for your interest in contributing to **PrintChecks**! We welcome contributions from the community to make this project even better.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Reporting Bugs](#reporting-bugs)
8. [Suggesting Features](#suggesting-features)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone. We expect all contributors to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## 🤝 How Can I Contribute?

### Types of Contributions

We appreciate all kinds of contributions:

- 🐛 **Bug fixes** - Help us squash bugs
- ✨ **New features** - Add functionality that enhances the project
- 📖 **Documentation** - Improve or expand our docs
- 🎨 **Design improvements** - Enhance the UI/UX
- ⚡ **Performance optimizations** - Make things faster
- ✅ **Tests** - Increase test coverage
- 🔧 **Refactoring** - Improve code quality

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **npm** or **yarn**
- **Git**
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**

```bash
git clone https://github.com/YOUR_USERNAME/PrintChecks.git
cd PrintChecks
```

3. **Add upstream remote**

```bash
git remote add upstream https://github.com/Danford/PrintChecks.git
```

4. **Navigate to the application directory**

```bash
cd printchecks
```

5. **Install dependencies**

```bash
npm install
```

6. **Start the development server**

```bash
npm run dev
```

7. **Open in browser**
   Navigate to `http://localhost:5173/`

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your local master
git checkout master
git merge upstream/master

# Push updates to your fork
git push origin master
```

---

## 🎨 Coding Standards

### TypeScript

- ✅ **Use TypeScript** for all new code
- ✅ **Explicit types** - Avoid `any` unless absolutely necessary
- ✅ **Interface over type** for object shapes
- ✅ **Descriptive names** - Make variable and function names clear

**Example:**

```typescript
// ✅ Good
interface CheckData {
  payee: string
  amount: number
  date: Date
  memo?: string
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

// ❌ Avoid
function doStuff(x: any) {
  return x
}
```

### Vue Components

- ✅ Use **Composition API** with `<script setup lang="ts">`
- ✅ **Single File Components** (.vue files)
- ✅ **Props with types** - Always define prop types
- ✅ **Emits declaration** - Declare all emitted events

**Example:**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  amount?: number
}

const props = withDefaults(defineProps<Props>(), {
  amount: 0,
})

const emit = defineEmits<{
  save: [value: number]
  cancel: []
}>()

const localAmount = ref(props.amount)

const formattedAmount = computed(() => {
  return `$${localAmount.value.toFixed(2)}`
})
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>{{ formattedAmount }}</p>
  </div>
</template>
```

### Code Style

This project uses **ESLint** and **Prettier** for consistent code style:

- Run linting: `npm run lint`
- Format code: `npm run format`
- Type check: `npm run type-check`

**Before committing:**

```bash
npm run lint && npm run type-check
```

### File Naming

- **Components**: `PascalCase.vue` (e.g., `CheckPrinter.vue`)
- **Stores**: `camelCase.ts` (e.g., `customization.ts`)
- **Types**: `camelCase.ts` (e.g., `check.ts`)
- **Utilities**: `camelCase.ts` (e.g., `useFormatting.ts`)

### Import Order

1. Vue imports
2. Third-party libraries
3. Local stores
4. Local composables
5. Local components
6. Local types
7. Local utilities

**Example:**

```typescript
// Vue
import { ref, computed } from 'vue'

// Third-party
import { useRouter } from 'vue-router'

// Stores
import { useCheckStore } from '@/stores/check'

// Composables
import { useFormatting } from '@/composables/useFormatting'

// Components
import CheckPrinter from '@/components/CheckPrinter.vue'

// Types
import type { CheckData } from '@/types'

// Utilities
import { formatDate } from '@/utilities'
```

---

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no code change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples

```bash
feat(check): add MICR font support for routing numbers

Added support for official E13B MICR font to ensure
check compatibility with bank processing systems.

Closes #42
```

```bash
fix(receipt): correct tax calculation rounding

Fixed issue where tax calculations could result in
incorrect totals due to floating point precision.
```

```bash
docs: update installation instructions in README

Added clarification for Node.js version requirements
and troubleshooting section.
```

### Best Practices

- ✅ Use present tense ("add feature" not "added feature")
- ✅ Keep subject line under 50 characters
- ✅ Separate subject from body with blank line
- ✅ Wrap body at 72 characters
- ✅ Explain _what_ and _why_, not _how_

---

## 🔄 Pull Request Process

### Before Submitting

1. ✅ **Create a feature branch** from `master`

   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. ✅ **Make your changes** with clear, focused commits

3. ✅ **Run quality checks**

   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

4. ✅ **Test thoroughly** in your browser
   - Test main functionality
   - Test edge cases
   - Verify on different screen sizes
   - Check print output if applicable

5. ✅ **Update documentation** if needed
   - Update README.md for user-facing changes
   - Update code comments for complex logic
   - Add JSDoc for new functions/types

### Submitting the PR

1. **Push to your fork**

   ```bash
   git push origin feature/my-awesome-feature
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Clear description of changes
   - Motivation and context
   - Screenshots (if UI changes)
   - Testing performed
   - Related issues

### PR Template

```markdown
## Description

Brief description of what this PR does.

## Motivation

Why is this change needed?

## Changes

- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)

[Add screenshots here]

## Testing

- [ ] Tested locally
- [ ] Ran linting and type checks
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested printing (if applicable)

## Related Issues

Closes #123
```

### Review Process

1. A maintainer will review your PR
2. They may request changes or ask questions
3. Make requested changes and push new commits
4. Once approved, a maintainer will merge your PR

### After Merge

- 🎉 Congratulations! Your contribution is now part of PrintChecks
- Delete your feature branch (optional)
- Pull the latest changes from upstream
- Thank you for contributing!

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Check existing issues** - Your bug may already be reported
2. **Try the latest version** - It may already be fixed
3. **Reproduce consistently** - Ensure it's not a one-time issue

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node version: [e.g., 18.12.0]

**Additional context**
Any other relevant information.
```

---

## 💡 Suggesting Features

We love new ideas! Here's how to suggest a feature:

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem it Solves**
What problem does this feature address?

**Proposed Solution**
How do you envision this feature working?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Mockups, examples, or other relevant information.
```

### Feature Discussion

- Open an issue with the `enhancement` label
- Discuss the feature with maintainers
- If approved, we'll add it to the roadmap
- Feel free to implement it yourself!

---

## ❓ Questions?

If you have questions:

- 💬 Open a **Discussion** on GitHub
- 🐛 Check existing **Issues**
- 📧 Contact the maintainers

---

## 🙏 Thank You!

Your contributions help make PrintChecks better for everyone. We appreciate your time and effort!

**Happy coding!** 🚀

---

_Last updated: December 2024_
