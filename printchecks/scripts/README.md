# PrintChecks Development Scripts

## Clear History (Debug Mode)

### Usage

To start the development server with cleared check history:

```bash
npm run dev:clear
```

This command will:
1. Inject a script into `index.html` that clears localStorage on page load
2. Start the Vite dev server normally
3. Automatically cleanup when you stop the server (Ctrl+C)

### What it clears

- Removes the `checkList` item from localStorage (all check history)

### When to use

- When debugging the check creation flow
- When testing the unalterable log system from scratch
- When you have accumulated test/debug checks that need to be cleared

### Important Notes

- ⚠️ **This is for development only** - never use in production
- The script automatically cleans up after itself when stopped
- If cleanup fails, manually remove `<script src="/clear-storage.js"></script>` from `index.html`
- After debugging, use regular `npm run dev` command

### Regular Development

For normal development without clearing history:

```bash
npm run dev
```

