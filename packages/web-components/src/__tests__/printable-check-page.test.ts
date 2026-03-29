/**
 * Tests for <printchecks-printable-page>
 * Focuses on pre-print validation gate and error rendering.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../components/printable-check-page'
import { Check } from './mocks/core'

function createElement(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('printchecks-printable-page')
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  document.body.appendChild(el)
  return el
}

function makeCheck(overrides: Partial<InstanceType<typeof Check>> = {}): InstanceType<typeof Check> {
  const c = new Check()
  c.id = 'chk1'
  c.checkNumber = '1001'
  c.date = '2026-01-15'
  c.payTo = 'Acme Corp'
  c.amount = '500.00'
  c.accountHolderName = 'Jane Smith'
  c.bankName = 'First National'
  c.routingNumber = '021000021'
  c.bankAccountNumber = '12345678'
  Object.assign(c, overrides)
  return c
}

function makeStats() {
  return {
    thisMonth: 1000,
    lastMonth: 2000,
    thisYear: 15000,
    lastYear: 12000,
    thisQuarter: 5000,
    averagePayment: 500,
    monthlyAverage: 1000,
    largestPayment: 2000,
    smallestPayment: 100,
    totalCount: 30,
    allTimeTotal: 99999.99,
  }
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('PrintChecksCheckPrintablePage', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-printable-page')).toBeDefined()
  })

  it('shows loading state when check-id is set without a core instance', () => {
    // Component renders without a check; no loading message since core is unavailable
    const el = createElement()
    // No check loaded — should not show a print button
    expect(el.shadowRoot?.querySelector('#print-btn')).toBeNull()
  })

  it('renders check content and print button after setCheckData()', () => {
    const el = createElement() as any
    el.setCheckData(makeCheck())
    expect(el.shadowRoot?.querySelector('#print-btn')).not.toBeNull()
    expect(el.shadowRoot?.querySelector('.check-display')).not.toBeNull()
  })

  it('renders the payee name in the check display', () => {
    const el = createElement() as any
    el.setCheckData(makeCheck({ payTo: 'Globex Corporation' }))
    expect(el.shadowRoot?.innerHTML).toContain('Globex Corporation')
  })

  it('renders the MICR line with routing and account numbers', () => {
    const el = createElement() as any
    el.setCheckData(makeCheck({ routingNumber: '021000021', bankAccountNumber: '987654321' }))
    const micrEl = el.shadowRoot?.querySelector('.micr-line')
    expect(micrEl?.textContent).toContain('021000021')
    expect(micrEl?.textContent).toContain('987654321')
  })

  // ---------------------------------------------------------------------------
  // Pre-print validation gate
  // ---------------------------------------------------------------------------

  it('fires print-initiated and calls window.print() when check is valid', () => {
    const el = createElement() as any
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const check = makeCheck()
    check.validate = () => ({ isValid: true, errors: [] })
    el.setCheckData(check)

    const events: CustomEvent[] = []
    el.addEventListener('print-initiated', (e: CustomEvent) => events.push(e))

    el.print()

    expect(events).toHaveLength(1)
    expect(printSpy).toHaveBeenCalledOnce()
  })

  it('fires print-blocked and does NOT call window.print() when check is invalid', () => {
    const el = createElement() as any
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const check = makeCheck()
    check.validate = () => ({
      isValid: false,
      errors: ['Valid 9-digit routing number is required', 'Valid amount greater than 0 is required'],
    })
    el.setCheckData(check)

    const blocked: CustomEvent[] = []
    el.addEventListener('print-blocked', (e: CustomEvent) => blocked.push(e))

    el.print()

    expect(printSpy).not.toHaveBeenCalled()
    expect(blocked).toHaveLength(1)
    expect(blocked[0].detail.errors).toHaveLength(2)
  })

  it('renders validation errors inline when print is blocked', () => {
    const el = createElement() as any
    vi.spyOn(window, 'print').mockImplementation(() => {})
    const check = makeCheck()
    check.validate = () => ({
      isValid: false,
      errors: ['Valid 9-digit routing number is required'],
    })
    el.setCheckData(check)
    el.print()

    const errorEl = el.shadowRoot?.querySelector('.print-validation-errors')
    expect(errorEl).not.toBeNull()
    expect(errorEl?.textContent).toContain('Valid 9-digit routing number is required')
  })

  it('clears validation errors on a subsequent valid print attempt', () => {
    const el = createElement() as any
    vi.spyOn(window, 'print').mockImplementation(() => {})

    const check = makeCheck()
    // First call: invalid
    check.validate = () => ({ isValid: false, errors: ['Routing number invalid'] })
    el.setCheckData(check)
    el.print()
    expect(el.shadowRoot?.querySelector('.print-validation-errors')).not.toBeNull()

    // Second call: valid
    check.validate = () => ({ isValid: true, errors: [] })
    el.print()
    expect(el.shadowRoot?.querySelector('.print-validation-errors')).toBeNull()
  })

  it('does nothing when print() is called with no check loaded', () => {
    const el = createElement() as any
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    el.print()
    expect(printSpy).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // Attribute / analytics toggle
  // ---------------------------------------------------------------------------

  it('hides analytics section when show-analytics="false"', () => {
    const el = createElement({ 'show-analytics': 'false' }) as any
    el.setCheckData(makeCheck())
    expect(el.shadowRoot?.querySelector('.analytics-section')).toBeNull()
  })

  it('hides line items section when show-line-items="false"', () => {
    const el = createElement({ 'show-line-items': 'false' }) as any
    el.setCheckData(makeCheck())
    expect(el.shadowRoot?.querySelector('.line-items-section')).toBeNull()
  })

  it('shows line items section by default', () => {
    const el = createElement() as any
    el.setCheckData(makeCheck())
    expect(el.shadowRoot?.querySelector('.line-items-section')).not.toBeNull()
  })

  it('renders provided line items in the table', () => {
    const el = createElement() as any
    el.setCheckData(makeCheck(), [{ description: 'Web Design', quantity: 2, unitPrice: 150 }])
    expect(el.shadowRoot?.innerHTML).toContain('Web Design')
  })

  // ---------------------------------------------------------------------------
  // Check display fields
  // ---------------------------------------------------------------------------

  describe('check display fields', () => {
    it('renders check number in .check-number-value', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ checkNumber: '5050' }))
      expect(el.shadowRoot?.querySelector('.check-number-value')?.textContent?.trim()).toBe('5050')
    })

    it('renders date in .date-value', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ date: '2026-06-01' }))
      expect(el.shadowRoot?.querySelector('.date-value')?.textContent?.trim()).toBe('2026-06-01')
    })

    it('renders amount in .amount-box-value formatted to 2 decimals', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ amount: '750.50' }))
      expect(el.shadowRoot?.querySelector('.amount-box-value')?.textContent?.trim()).toBe('750.50')
    })

    it('renders memo in .memo-value', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ memo: 'office supplies' }))
      expect(el.shadowRoot?.querySelector('.memo-value')?.textContent?.trim()).toBe('office supplies')
    })

    it('renders signature in .signature-value', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ signature: 'Jane Smith' }))
      expect(el.shadowRoot?.querySelector('.signature-value')?.textContent?.trim()).toBe('Jane Smith')
    })

    it('renders accountHolderName in .account-info h3', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ accountHolderName: 'Bob Jones' }))
      expect(el.shadowRoot?.querySelector('.account-info h3')?.textContent?.trim()).toBe('Bob Jones')
    })

    it('falls back to "Account Holder" when accountHolderName is empty', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ accountHolderName: '' }))
      expect(el.shadowRoot?.querySelector('.account-info h3')?.textContent?.trim()).toBe('Account Holder')
    })
  })

  // ---------------------------------------------------------------------------
  // MICR line delimiters
  // ---------------------------------------------------------------------------

  describe('MICR line delimiters', () => {
    it('wraps the routing number with ⑆ on both sides', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ routingNumber: '021000021' }))
      const text = el.shadowRoot?.querySelector('.micr-line')?.textContent ?? ''
      expect(text).toContain('⑆021000021⑆')
    })

    it('places ⑈ after the account number', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ bankAccountNumber: '98765432' }))
      const text = el.shadowRoot?.querySelector('.micr-line')?.textContent ?? ''
      expect(text).toContain('98765432⑈')
    })

    it('appends check number after ⑈', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ checkNumber: '2002' }))
      const text = el.shadowRoot?.querySelector('.micr-line')?.textContent ?? ''
      expect(text).toContain('⑈ 2002')
    })
  })

  // ---------------------------------------------------------------------------
  // XSS escaping
  // ---------------------------------------------------------------------------

  describe('XSS escaping', () => {
    it('escapes HTML tags in payTo field', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ payTo: '<script>alert(1)</script>' }))
      const inner = el.shadowRoot?.innerHTML ?? ''
      expect(inner).not.toContain('<script>')
      expect(inner).toContain('&lt;script&gt;')
    })

    it('escapes HTML tags in memo field', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ memo: '<img src=x onerror=alert(1)>' }))
      const inner = el.shadowRoot?.innerHTML ?? ''
      expect(inner).not.toContain('<img ')
      expect(inner).toContain('&lt;img')
    })
  })

  // ---------------------------------------------------------------------------
  // amountToWords rendering
  // ---------------------------------------------------------------------------

  describe('amountToWords rendering', () => {
    it('renders "Five Hundred Dollars" for amount 500.00', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ amount: '500.00' }))
      const text = el.shadowRoot?.querySelector('.amount-words-value')?.textContent?.trim() ?? ''
      expect(text).toContain('Five Hundred')
      expect(text).toContain('Dollars')
    })

    it('renders "Fifteen Dollars" for amount 15.00', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ amount: '15.00' }))
      const text = el.shadowRoot?.querySelector('.amount-words-value')?.textContent?.trim() ?? ''
      expect(text).toContain('Fifteen')
      expect(text).toContain('Dollars')
    })

    it('includes "and N/100" for amounts with cents', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ amount: '500.50' }))
      const text = el.shadowRoot?.querySelector('.amount-words-value')?.textContent?.trim() ?? ''
      expect(text).toContain('and 50/100')
    })

    it('renders "Zero" for amount 0', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck({ amount: '0' }))
      const text = el.shadowRoot?.querySelector('.amount-words-value')?.textContent?.trim() ?? ''
      expect(text).toContain('Zero')
    })
  })

  // ---------------------------------------------------------------------------
  // Analytics section
  // ---------------------------------------------------------------------------

  describe('analytics section', () => {
    it('shows .analytics-section when stats are provided', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [], makeStats())
      expect(el.shadowRoot?.querySelector('.analytics-section')).not.toBeNull()
    })

    it('hides .analytics-section when stats are null', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [], null)
      expect(el.shadowRoot?.querySelector('.analytics-section')).toBeNull()
    })

    it('displays allTimeTotal in .all-time-total', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [], makeStats())
      expect(el.shadowRoot?.querySelector('.all-time-total')?.textContent).toContain('99999.99')
    })

    it('hides .analytics-section when show-analytics="false" even with stats', () => {
      const el = createElement({ 'show-analytics': 'false' }) as any
      el.setCheckData(makeCheck(), [], makeStats())
      expect(el.shadowRoot?.querySelector('.analytics-section')).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Line items table
  // ---------------------------------------------------------------------------

  describe('line items table', () => {
    it('shows "No line items added" when line items array is empty', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [])
      expect(el.shadowRoot?.querySelector('.no-items')?.textContent).toContain('No line items added')
    })

    it('renders a tfoot total row when items are present', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [{ description: 'Design', quantity: 2, unitPrice: 100 }])
      expect(el.shadowRoot?.querySelector('tfoot')).not.toBeNull()
    })

    it('calculates line item total as qty * unitPrice', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [{ description: 'Work', quantity: 3, unitPrice: 50 }])
      expect(el.shadowRoot?.querySelector('tfoot')?.textContent).toContain('150.00')
    })

    it('renders multiple line items as separate tbody rows', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [
        { description: 'Alpha', quantity: 1, unitPrice: 10 },
        { description: 'Beta', quantity: 2, unitPrice: 20 },
      ])
      const rows = el.shadowRoot?.querySelectorAll('tbody tr')
      expect(rows?.length).toBe(2)
    })

    it('sums multiple line items in the tfoot total', () => {
      const el = createElement() as any
      el.setCheckData(makeCheck(), [
        { description: 'Alpha', quantity: 1, unitPrice: 10 },
        { description: 'Beta', quantity: 2, unitPrice: 20 },
      ])
      // Total = 1*10 + 2*20 = 50
      expect(el.shadowRoot?.querySelector('tfoot')?.textContent).toContain('50.00')
    })
  })

  // ---------------------------------------------------------------------------
  // loadCheck via check-id attribute
  // ---------------------------------------------------------------------------

  describe('loadCheck via check-id attribute', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('renders check content after successful load', async () => {
      const el = document.createElement('printchecks-printable-page') as any
      document.body.appendChild(el)
      const check = makeCheck({ id: 'load-test' })
      el.core.getChecks.mockResolvedValueOnce([check])
      el.core.getChecks.mockResolvedValueOnce([check])
      el.setAttribute('check-id', 'load-test')
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(el.shadowRoot?.querySelector('.check-display')).not.toBeNull()
    })

    it('shows error state when check is not found', async () => {
      const el = document.createElement('printchecks-printable-page') as any
      document.body.appendChild(el)
      el.core.getChecks.mockResolvedValueOnce([])
      el.setAttribute('check-id', 'missing-id')
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(el.shadowRoot?.querySelector('.error-state')).not.toBeNull()
      expect(el.shadowRoot?.innerHTML).toContain('missing-id')
    })

    it('fires check-loaded event with check data after successful load', async () => {
      const el = document.createElement('printchecks-printable-page') as any
      document.body.appendChild(el)
      const check = makeCheck({ id: 'ev-test' })
      el.core.getChecks.mockResolvedValueOnce([check])
      el.core.getChecks.mockResolvedValueOnce([check])
      const events: CustomEvent[] = []
      el.addEventListener('check-loaded', (e: CustomEvent) => events.push(e))
      el.setAttribute('check-id', 'ev-test')
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(events).toHaveLength(1)
      expect(events[0].detail.check).toBe(check)
    })
  })
})
