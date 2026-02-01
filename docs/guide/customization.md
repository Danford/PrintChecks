# Customization

Customize the appearance and behavior of PrintChecks.

## Overview

PrintChecks provides extensive customization options for check appearance, fonts, colors, and more.

## Check Styling

Customize individual check appearance using metadata:

```typescript
const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corporation',
  amount: 1250.00,
  bankAccountId: 'account-id',

  // Custom styling
  metadata: {
    fontFamily: 'Arial',
    fontSize: '12pt',
    color: '#000000',
    logoUrl: '/path/to/logo.png',
    logoPosition: { x: 20, y: 20 },
    logoSize: { width: 100, height: 50 },
    signatureFont: 'Brush Script MT',
    checkTemplate: 'classic'
  }
})
```

## Logo Upload

Add a custom logo to checks:

```typescript
// Upload logo
async function uploadLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Use it
const logoFile = await fileInput.files[0]
const logoDataUrl = await uploadLogo(logoFile)

const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1000.00,
  bankAccountId: 'account-id',
  metadata: {
    logoUrl: logoDataUrl
  }
})
```

## Font Customization

Customize fonts for different check elements:

```typescript
const checkStyle = {
  payeeFont: 'Helvetica',
  amountFont: 'Courier New',
  dateFont: 'Arial',
  memoFont: 'Times New Roman',
  signatureFont: 'Brush Script MT',
  micrFont: 'E13B'  // MICR font for routing/account numbers
}

const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1000.00,
  bankAccountId: 'account-id',
  metadata: { fonts: checkStyle }
})
```

## Color Schemes

Define and apply color schemes:

```typescript
const colorSchemes = {
  classic: {
    background: '#FFFFFF',
    border: '#000000',
    text: '#000000',
    accent: '#0066CC'
  },
  modern: {
    background: '#F5F5F5',
    border: '#333333',
    text: '#333333',
    accent: '#FF6B35'
  },
  elegant: {
    background: '#FFFEF7',
    border: '#8B7355',
    text: '#3E2723',
    accent: '#D4AF37'
  }
}

const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1000.00,
  bankAccountId: 'account-id',
  metadata: {
    colorScheme: colorSchemes.modern
  }
})
```

## Style Presets

Create and save style presets:

```typescript
interface CheckPreset {
  name: string
  fonts: Record<string, string>
  colors: Record<string, string>
  logoUrl?: string
  logoPosition?: { x: number; y: number }
  logoSize?: { width: number; height: number }
}

const presets: CheckPreset[] = [
  {
    name: 'Business Professional',
    fonts: {
      payee: 'Arial',
      amount: 'Arial',
      date: 'Arial',
      memo: 'Arial',
      signature: 'Brush Script MT'
    },
    colors: {
      background: '#FFFFFF',
      border: '#000000',
      text: '#000000'
    }
  },
  {
    name: 'Classic Elegant',
    fonts: {
      payee: 'Times New Roman',
      amount: 'Times New Roman',
      date: 'Times New Roman',
      memo: 'Times New Roman',
      signature: 'Edwardian Script ITC'
    },
    colors: {
      background: '#FFFEF7',
      border: '#8B7355',
      text: '#3E2723'
    }
  }
]

// Apply preset
function applyPreset(preset: CheckPreset) {
  return {
    metadata: {
      fonts: preset.fonts,
      colorScheme: preset.colors,
      logoUrl: preset.logoUrl,
      logoPosition: preset.logoPosition,
      logoSize: preset.logoSize
    }
  }
}

const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1000.00,
  bankAccountId: 'account-id',
  ...applyPreset(presets[0])
})
```

## Check Templates

Define different check layouts:

```typescript
enum CheckTemplate {
  CLASSIC = 'classic',
  MODERN = 'modern',
  MINIMAL = 'minimal',
  VOUCHER = 'voucher'
}

const check = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1000.00,
  bankAccountId: 'account-id',
  metadata: {
    template: CheckTemplate.MODERN
  }
})
```

## Signature Customization

Add and customize signatures:

```typescript
// Text signature
const check1 = await printChecks.checks.create({
  checkNumber: 1001,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1000.00,
  bankAccountId: 'account-id',
  signature: 'John Doe',
  metadata: {
    signatureFont: 'Brush Script MT',
    signatureFontSize: '18pt'
  }
})

// Image signature
const signatureFile = await fileInput.files[0]
const signatureDataUrl = await uploadLogo(signatureFile)

const check2 = await printChecks.checks.create({
  checkNumber: 1002,
  date: new Date(),
  payee: 'Acme Corp',
  amount: 1000.00,
  bankAccountId: 'account-id',
  metadata: {
    signatureImageUrl: signatureDataUrl
  }
})
```

## Using with Vue

```vue
<script setup>
import { ref } from 'vue'
import { useChecks } from '@printchecks/vue'

const { createCheck } = useChecks()

const selectedPreset = ref('classic')

const presets = {
  classic: {
    fonts: { payee: 'Arial', amount: 'Arial' },
    colors: { background: '#FFFFFF', text: '#000000' }
  },
  modern: {
    fonts: { payee: 'Helvetica', amount: 'Courier New' },
    colors: { background: '#F5F5F5', text: '#333333' }
  }
}

const handleCreate = async (formData) => {
  const preset = presets[selectedPreset.value]

  await createCheck({
    checkNumber: formData.checkNumber,
    date: new Date(),
    payee: formData.payee,
    amount: formData.amount,
    bankAccountId: formData.bankAccountId,
    metadata: {
      fonts: preset.fonts,
      colorScheme: preset.colors
    }
  })
}
</script>

<template>
  <div>
    <h2>Create Check</h2>

    <label>Style Preset:</label>
    <select v-model="selectedPreset">
      <option value="classic">Classic</option>
      <option value="modern">Modern</option>
    </select>

    <!-- Check form fields -->
  </div>
</template>
```

## CSS Customization

When rendering checks in HTML, use CSS for styling:

```css
/* Classic check style */
.check {
  width: 8.5in;
  height: 3.5in;
  padding: 0.5in;
  border: 1px solid #000;
  background: #fff;
  font-family: Arial, sans-serif;
}

.check-number {
  position: absolute;
  top: 0.5in;
  right: 0.5in;
  font-size: 14pt;
  font-weight: bold;
}

.check-date {
  position: absolute;
  top: 0.5in;
  left: 5.5in;
  font-size: 10pt;
}

.check-payee {
  position: absolute;
  top: 1.2in;
  left: 1in;
  font-size: 12pt;
}

.check-amount {
  position: absolute;
  top: 1.2in;
  right: 0.5in;
  font-size: 12pt;
  font-weight: bold;
}

.check-amount-words {
  position: absolute;
  top: 1.6in;
  left: 0.5in;
  font-size: 10pt;
}

.check-memo {
  position: absolute;
  top: 2.5in;
  left: 0.5in;
  font-size: 9pt;
}

.check-signature {
  position: absolute;
  top: 2.5in;
  right: 0.5in;
  font-family: 'Brush Script MT', cursive;
  font-size: 18pt;
}

.check-micr {
  position: absolute;
  bottom: 0.3in;
  left: 0.5in;
  font-family: 'MICR E13B', monospace;
  font-size: 14pt;
}
```

## Print Optimization

Optimize for printing:

```css
@media print {
  /* Hide non-check elements */
  nav, footer, .no-print {
    display: none !important;
  }

  /* Page setup */
  @page {
    size: 8.5in 11in;
    margin: 0;
  }

  /* Check positioning */
  .check {
    page-break-after: always;
    page-break-inside: avoid;
  }

  /* Ensure colors print */
  .check {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

## Next Steps

- [Checks](/guide/checks) - Learn more about check features
- [Examples](/examples/basic-check) - See customization in action
- [Components](/components/check-form) - Use pre-built components
