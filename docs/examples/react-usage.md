# React Usage

Use PrintChecks with React via the core library or web components.

## With Core Library

```tsx
import { useEffect, useState } from 'react'
import { PrintChecksCore, type Check } from '@printchecks/core'

// Create instance outside component to persist
const printChecks = new PrintChecksCore()

function App() {
  const [checks, setChecks] = useState<Check[]>([])

  useEffect(() => {
    loadChecks()
  }, [])

  const loadChecks = async () => {
    const allChecks = await printChecks.getChecks()
    setChecks(allChecks)
  }

  const handleCreateCheck = async () => {
    const check = await printChecks.createCheck({
      checkNumber: '1001',
      date: new Date().toLocaleDateString(),
      amount: 1000.00,
      payTo: 'Acme Corp',
      memo: 'Payment',
      // ... other fields
    })

    setChecks([...checks, check])
  }

  return (
    <div>
      <h1>PrintChecks</h1>
      <button onClick={handleCreateCheck}>Create Check</button>

      <h2>Checks ({checks.length})</h2>
      <ul>
        {checks.map(check => (
          <li key={check.id}>
            Check #{check.checkNumber} - {check.payTo} - ${check.amount}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## With Web Components

```tsx
import { useEffect, useRef } from 'react'
import '@printchecks/web-components'

// Declare custom element types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'check-form': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      'check-preview': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'check-id'?: string }, HTMLElement>
    }
  }
}

function App() {
  const checkFormRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const checkForm = checkFormRef.current
    if (!checkForm) return

    const handleCheckCreated = (event: CustomEvent) => {
      console.log('Check created:', event.detail.check)
    }

    checkForm.addEventListener('check-created', handleCheckCreated as EventListener)

    return () => {
      checkForm.removeEventListener('check-created', handleCheckCreated as EventListener)
    }
  }, [])

  return (
    <div>
      <h1>PrintChecks</h1>
      <check-form ref={checkFormRef} />
    </div>
  )
}
```

## Custom Hook

```tsx
import { useState, useEffect } from 'react'
import { PrintChecksCore, type Check } from '@printchecks/core'

function usePrintChecks() {
  const [printChecks] = useState(() => new PrintChecksCore())
  const [checks, setChecks] = useState<Check[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadChecks()
  }, [])

  const loadChecks = async () => {
    setIsLoading(true)
    try {
      const allChecks = await printChecks.getChecks()
      setChecks(allChecks)
    } finally {
      setIsLoading(false)
    }
  }

  const createCheck = async (data) => {
    const check = await printChecks.createCheck(data)
    setChecks([...checks, check])
    return check
  }

  return {
    checks,
    isLoading,
    createCheck,
    printChecks
  }
}

// Usage
function App() {
  const { checks, createCheck } = usePrintChecks()

  return (
    <div>
      <h2>Checks ({checks.length})</h2>
    </div>
  )
}
```

## See Also

- [PrintChecksCore](/api/core/printchecks-core)
- [Web Components](/api/web-components/overview)
