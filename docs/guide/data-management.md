# Data Management

Import, export, and manage your PrintChecks data.

## Overview

PrintChecks provides utilities for backing up, migrating, and managing your data.

## Exporting Data

Export all data to JSON:

```typescript
import { PrintChecksCore } from '@printchecks/core'

const printChecks = new PrintChecksCore()

async function exportAllData() {
  const data = {
    checks: await printChecks.checks.list(),
    vendors: await printChecks.vendors.list(),
    bankAccounts: await printChecks.bankAccounts.list(),
    receipts: await printChecks.receipts.list(),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }

  return JSON.stringify(data, null, 2)
}

// Download as file
async function downloadBackup() {
  const json = await exportAllData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `printchecks-backup-${new Date().toISOString()}.json`
  a.click()

  URL.revokeObjectURL(url)
}
```

## Importing Data

Import data from JSON backup:

```typescript
async function importData(jsonString: string) {
  const data = JSON.parse(jsonString)

  // Import bank accounts first (checks depend on them)
  for (const account of data.bankAccounts || []) {
    await printChecks.bankAccounts.create(account)
  }

  // Import vendors
  for (const vendor of data.vendors || []) {
    await printChecks.vendors.create(vendor)
  }

  // Import checks
  for (const check of data.checks || []) {
    await printChecks.checks.create(check)
  }

  // Import receipts
  for (const receipt of data.receipts || []) {
    await printChecks.receipts.create(receipt)
  }

  console.log('Import complete!')
}

// Import from file upload
async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const json = e.target?.result as string
    await importData(json)
  }
  reader.readAsText(file)
}
```

## Export to CSV

Export checks to CSV format:

```typescript
function exportChecksToCSV() {
  const checks = await printChecks.checks.list()

  const headers = ['Check Number', 'Date', 'Payee', 'Amount', 'Memo', 'Bank Account ID']

  const rows = checks.map(check => [
    check.checkNumber,
    new Date(check.date).toLocaleDateString(),
    check.payee,
    check.amount.toFixed(2),
    check.memo || '',
    check.bankAccountId
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `checks-export-${new Date().toISOString()}.csv`
  a.click()

  URL.revokeObjectURL(url)
}
```

## Import from CSV

Import checks from CSV:

```typescript
async function importChecksFromCSV(csvString: string) {
  const lines = csvString.split('\n')
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())

    if (values.length !== headers.length) continue

    const check = {
      checkNumber: parseInt(values[0], 10),
      date: new Date(values[1]),
      payee: values[2],
      amount: parseFloat(values[3]),
      memo: values[4],
      bankAccountId: values[5]
    }

    await printChecks.checks.create(check)
  }

  console.log(`Imported ${lines.length - 1} checks`)
}
```

## Clear All Data

Clear all stored data:

```typescript
async function clearAllData() {
  if (!confirm('Are you sure? This will delete ALL data!')) {
    return
  }

  // Delete all checks
  const checks = await printChecks.checks.list()
  for (const check of checks) {
    await printChecks.checks.delete(check.id)
  }

  // Delete all vendors
  const vendors = await printChecks.vendors.list()
  for (const vendor of vendors) {
    await printChecks.vendors.delete(vendor.id)
  }

  // Delete all bank accounts
  const accounts = await printChecks.bankAccounts.list()
  for (const account of accounts) {
    await printChecks.bankAccounts.delete(account.id)
  }

  // Delete all receipts
  const receipts = await printChecks.receipts.list()
  for (const receipt of receipts) {
    await printChecks.receipts.delete(receipt.id)
  }

  console.log('All data cleared')
}
```

## Automatic Backups

Set up automatic periodic backups:

```typescript
class AutoBackup {
  private intervalId: number | null = null

  constructor(
    private printChecks: PrintChecksCore,
    private intervalMs: number = 24 * 60 * 60 * 1000  // 24 hours
  ) {}

  start() {
    this.intervalId = setInterval(async () => {
      await this.backup()
    }, this.intervalMs)

    // Also backup immediately
    this.backup()
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async backup() {
    const data = {
      checks: await this.printChecks.checks.list(),
      vendors: await this.printChecks.vendors.list(),
      bankAccounts: await this.printChecks.bankAccounts.list(),
      receipts: await this.printChecks.receipts.list(),
      exportDate: new Date().toISOString()
    }

    // Store in localStorage with date suffix
    const key = `printchecks-backup-${new Date().toISOString().split('T')[0]}`
    localStorage.setItem(key, JSON.stringify(data))

    console.log('Auto backup saved:', key)

    // Clean up old backups (keep last 7 days)
    this.cleanupOldBackups(7)
  }

  private cleanupOldBackups(keepDays: number) {
    const cutoff = Date.now() - (keepDays * 24 * 60 * 60 * 1000)

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('printchecks-backup-')) continue

      const dateStr = key.replace('printchecks-backup-', '')
      const backupDate = new Date(dateStr).getTime()

      if (backupDate < cutoff) {
        localStorage.removeItem(key)
        console.log('Removed old backup:', key)
      }
    }
  }
}

// Use it
const autoBackup = new AutoBackup(printChecks, 24 * 60 * 60 * 1000)
autoBackup.start()
```

## Data Validation

Validate imported data:

```typescript
function validateImportData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.checks || !Array.isArray(data.checks)) {
    errors.push('Invalid checks data')
  }

  if (!data.vendors || !Array.isArray(data.vendors)) {
    errors.push('Invalid vendors data')
  }

  if (!data.bankAccounts || !Array.isArray(data.bankAccounts)) {
    errors.push('Invalid bank accounts data')
  }

  // Validate each check
  data.checks?.forEach((check: any, index: number) => {
    if (!check.checkNumber) {
      errors.push(`Check ${index}: Missing check number`)
    }
    if (!check.payee) {
      errors.push(`Check ${index}: Missing payee`)
    }
    if (typeof check.amount !== 'number') {
      errors.push(`Check ${index}: Invalid amount`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

// Use it
async function safeImport(jsonString: string) {
  const data = JSON.parse(jsonString)
  const validation = validateImportData(data)

  if (!validation.valid) {
    console.error('Validation errors:', validation.errors)
    throw new Error('Invalid import data: ' + validation.errors.join(', '))
  }

  await importData(jsonString)
}
```

## Using with Vue

```vue
<script setup>
import { usePrintChecks } from '@printchecks/vue'
import { ref } from 'vue'

const { checks, vendors, bankAccounts, receipts } = usePrintChecks()

const exportData = () => {
  const data = {
    checks: checks.value,
    vendors: vendors.value,
    bankAccounts: bankAccounts.value,
    receipts: receipts.value,
    exportDate: new Date().toISOString()
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `backup-${new Date().toISOString()}.json`
  a.click()

  URL.revokeObjectURL(url)
}

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const json = e.target?.result as string
    const data = JSON.parse(json)

    // Import logic here
    console.log('Imported data:', data)
  }
  reader.readAsText(file)
}
</script>

<template>
  <div>
    <h2>Data Management</h2>

    <button @click="exportData">Export All Data</button>

    <label>
      Import Data:
      <input type="file" accept=".json" @change="handleImport" />
    </label>
  </div>
</template>
```

## Next Steps

- [Storage Adapters](/guide/storage-adapters) - Custom storage solutions
- [Encryption](/guide/encryption) - Secure your backups
- [API Reference](/api/core/printchecks-core) - Complete API documentation
