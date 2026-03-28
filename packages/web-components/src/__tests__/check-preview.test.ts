/**
 * Tests for <printchecks-check-preview>
 * Covers: setCheck(), print(), scale attribute, check-id loading, events.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../components/check-preview'
import { Check, mockChecks } from './mocks/core'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createElement(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('printchecks-check-preview')
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  document.body.appendChild(el)
  return el
}

function makeCheck(
  overrides: Partial<InstanceType<typeof Check>> = {},
): InstanceType<typeof Check> {
  const c = new Check()
  c.id = 'chk1'
  c.checkNumber = '1001'
  c.date = '2026-01-15'
  c.payTo = 'Acme Corp'
  c.amount = '500.00'
  c.memo = 'Services rendered'
  c.accountHolderName = 'Jane Smith'
  c.bankName = 'First National'
  c.routingNumber = '021000021'
  c.bankAccountNumber = '12345678'
  Object.assign(c, overrides)
  return c
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: getCheck returns null (no check found)
  mockChecks.getCheck.mockResolvedValue(null)
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PrintChecksCheckPreview', () => {
  // --- Registration ---

  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-check-preview')).toBeDefined()
  })

  // --- Initial / no-check state ---

  it('shows placeholder text when no check is loaded', () => {
    const el = createElement()
    expect(el.shadowRoot?.innerHTML).toContain('No check to preview')
  })

  it('does not render action buttons when no check is loaded', () => {
    const el = createElement()
    expect(el.shadowRoot?.querySelector('#printBtn')).toBeNull()
    expect(el.shadowRoot?.querySelector('#downloadBtn')).toBeNull()
  })

  // --- setCheck() ---

  it('setCheck() renders the check preview container', () => {
    const el = createElement() as any
    el.setCheck(makeCheck())
    expect(el.shadowRoot?.querySelector('.check-preview')).not.toBeNull()
  })

  it('setCheck() shows print and download buttons', () => {
    const el = createElement() as any
    el.setCheck(makeCheck())
    expect(el.shadowRoot?.querySelector('#printBtn')).not.toBeNull()
    expect(el.shadowRoot?.querySelector('#downloadBtn')).not.toBeNull()
  })

  it('renders payee name in .pay-to-value', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ payTo: 'Globex Corporation' }))
    expect(el.shadowRoot?.querySelector('.pay-to-value')?.textContent).toBe('Globex Corporation')
  })

  it('renders formatted amount in .amount-numeric', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ amount: '250.00' }))
    expect(el.shadowRoot?.querySelector('.amount-numeric')?.textContent).toContain('250.00')
  })

  it('renders account holder name in .account-name', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ accountHolderName: 'Jane Smith' }))
    expect(el.shadowRoot?.querySelector('.account-name')?.textContent).toBe('Jane Smith')
  })

  it('renders bank name in .bank-name', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ bankName: 'First National' }))
    expect(el.shadowRoot?.querySelector('.bank-name')?.textContent).toBe('First National')
  })

  it('renders memo text in .memo-value', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ memo: 'Invoice #42' }))
    expect(el.shadowRoot?.querySelector('.memo-value')?.textContent).toBe('Invoice #42')
  })

  it('renders VOID watermark on check', () => {
    const el = createElement() as any
    el.setCheck(makeCheck())
    expect(el.shadowRoot?.querySelector('.watermark')?.textContent?.trim()).toBe('VOID')
  })

  // --- MICR line ---

  it('MICR line contains routing number', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ routingNumber: '021000021' }))
    expect(el.shadowRoot?.querySelector('.micr-line')?.textContent).toContain('021000021')
  })

  it('MICR line contains bank account number', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ bankAccountNumber: '987654321' }))
    expect(el.shadowRoot?.querySelector('.micr-line')?.textContent).toContain('987654321')
  })

  it('MICR line contains check number', () => {
    const el = createElement() as any
    el.setCheck(makeCheck({ checkNumber: '5555' }))
    expect(el.shadowRoot?.querySelector('.micr-line')?.textContent).toContain('5555')
  })

  // --- scale attribute ---

  it('scale attribute is reflected in CSS transform', () => {
    const el = createElement({ scale: '0.5' })
    expect(el.shadowRoot?.innerHTML).toContain('scale(0.5)')
  })

  it('defaults to scale(1) when scale attribute is absent', () => {
    const el = createElement()
    expect(el.shadowRoot?.innerHTML).toContain('scale(1)')
  })

  it('changing scale attribute re-renders with new scale value', () => {
    const el = createElement()
    el.setAttribute('scale', '0.75')
    expect(el.shadowRoot?.innerHTML).toContain('scale(0.75)')
  })

  // --- print() method ---

  it('print() calls window.print()', () => {
    const el = createElement() as any
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
    el.setCheck(makeCheck())
    el.print()
    expect(spy).toHaveBeenCalledOnce()
  })

  it('print() emits check-printed event with check in detail', () => {
    const el = createElement() as any
    vi.spyOn(window, 'print').mockImplementation(() => {})
    const check = makeCheck()
    el.setCheck(check)

    const events: CustomEvent[] = []
    el.addEventListener('check-printed', (e: CustomEvent) => events.push(e))
    el.print()

    expect(events).toHaveLength(1)
    expect(events[0].detail.check).toBe(check)
  })

  // --- Button event listeners ---

  it('clicking #printBtn calls window.print()', () => {
    const el = createElement() as any
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
    el.setCheck(makeCheck())
    el.shadowRoot?.querySelector('#printBtn')?.dispatchEvent(new MouseEvent('click'))
    expect(spy).toHaveBeenCalledOnce()
  })

  it('clicking #downloadBtn emits download-requested event', () => {
    const el = createElement() as any
    vi.spyOn(window, 'print').mockImplementation(() => {})
    el.setCheck(makeCheck())

    const events: CustomEvent[] = []
    el.addEventListener('download-requested', (e: CustomEvent) => events.push(e))
    el.shadowRoot?.querySelector('#downloadBtn')?.dispatchEvent(new MouseEvent('click'))

    expect(events).toHaveLength(1)
  })

  it('clicking #downloadBtn also calls window.print()', () => {
    const el = createElement() as any
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
    el.setCheck(makeCheck())
    el.shadowRoot?.querySelector('#downloadBtn')?.dispatchEvent(new MouseEvent('click'))
    expect(spy).toHaveBeenCalledOnce()
  })

  // --- check-id attribute: async load ---

  it('check-id attribute loads and renders a check from core', async () => {
    const check = makeCheck()
    mockChecks.getCheck.mockResolvedValue(check)
    const el = createElement({ 'check-id': 'chk1' })
    // Flush async microtasks from loadCheck
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(el.shadowRoot?.querySelector('.check-preview')).not.toBeNull()
  })

  it('check-id calls getCheck with the provided id', async () => {
    mockChecks.getCheck.mockResolvedValue(makeCheck())
    createElement({ 'check-id': 'chk-abc' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockChecks.getCheck).toHaveBeenCalledWith('chk-abc')
  })

  it('check-id shows error message when check is not found', async () => {
    mockChecks.getCheck.mockResolvedValue(null)
    const el = createElement({ 'check-id': 'missing' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(el.shadowRoot?.innerHTML).toContain('Check not found')
  })

  it('check-id shows error and emits error event when getCheck throws', async () => {
    mockChecks.getCheck.mockRejectedValue(new Error('Network failure'))
    // Append before setting attribute so loadCheck fires exactly once
    const el = document.createElement('printchecks-check-preview')
    document.body.appendChild(el)

    const errors: CustomEvent[] = []
    el.addEventListener('error', (e: CustomEvent) => errors.push(e))

    el.setAttribute('check-id', 'bad')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(el.shadowRoot?.innerHTML).toContain('Network failure')
    expect(errors).toHaveLength(1)
  })

  it('changing check-id attribute triggers a new load', async () => {
    const checkA = makeCheck({ payTo: 'Alpha Inc' })
    const checkB = makeCheck({ payTo: 'Beta LLC' })
    mockChecks.getCheck.mockResolvedValueOnce(checkA).mockResolvedValueOnce(checkB)

    // Append before setting attribute so each setAttribute fires loadCheck exactly once
    const el = document.createElement('printchecks-check-preview')
    document.body.appendChild(el)

    el.setAttribute('check-id', 'chk-a')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(el.shadowRoot?.innerHTML).toContain('Alpha Inc')

    el.setAttribute('check-id', 'chk-b')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(el.shadowRoot?.innerHTML).toContain('Beta LLC')
  })
})
