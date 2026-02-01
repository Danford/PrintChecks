# Data Import/Export

Import and export data for backups and migrations.

## Export Data

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

// Export all data
const data = await printChecks.exportData()

// Download as JSON file
const json = JSON.stringify(data, null, 2)
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)

const a = document.createElement('a')
a.href = url
a.download = `printchecks-backup-${new Date().toISOString()}.json`
a.click()

URL.revokeObjectURL(url)
```

## Import Data

```typescript
// From file upload
async function handleImport(file: File) {
  const text = await file.text()
  const data = JSON.parse(text)

  const result = await printChecks.importData(data.data)

  console.log('Import result:', result)
  // { checks: { success: 10, failed: 0 }, vendors: { success: 5, failed: 0 }, ... }
}

// From file input
const fileInput = document.getElementById('fileInput') as HTMLInputElement
fileInput.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    await handleImport(file)
  }
})
```

## Automated Backups

```typescript
class AutoBackup {
  private intervalId: number | null = null

  constructor(
    private printChecks: PrintChecksCore,
    private intervalMs: number = 24 * 60 * 60 * 1000 // 24 hours
  ) {}

  start() {
    this.intervalId = window.setInterval(async () => {
      await this.backup()
    }, this.intervalMs)

    this.backup() // Backup immediately
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async backup() {
    const data = await this.printChecks.exportData()
    const key = `printchecks-backup-${new Date().toISOString().split('T')[0]}`
    localStorage.setItem(key, JSON.stringify(data))
    console.log('Auto backup saved:', key)
  }
}

// Usage
const autoBackup = new AutoBackup(printChecks)
autoBackup.start()
```

## See Also

- [Data Management Guide](/guide/data-management)
- [PrintChecksCore](/api/core/printchecks-core)
