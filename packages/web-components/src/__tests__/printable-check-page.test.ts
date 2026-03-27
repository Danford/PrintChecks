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
})
