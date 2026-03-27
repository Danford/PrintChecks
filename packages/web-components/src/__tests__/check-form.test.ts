/**
 * Tests for <printchecks-check-form>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockChecks, mockVendors, mockBankAccounts } from './mocks/core'

beforeEach(() => {
  vi.clearAllMocks()
  mockChecks.createCheck.mockResolvedValue({
    id: 'c1',
    checkNumber: 'C-001',
    date: '2024-01-15',
    payTo: 'Acme',
    amount: '250.00',
    validate: () => ({ isValid: true, errors: [] }),
  })
  mockChecks.getCheck.mockResolvedValue(null)
  mockVendors.getVendors.mockResolvedValue([])
  mockBankAccounts.getBankAccounts.mockResolvedValue([])
})

import '../components/check-form'

function createElement(): HTMLElement {
  const el = document.createElement('printchecks-check-form')
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('PrintChecksCheckForm', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-check-form')).toBeDefined()
  })

  it('renders "New Check" heading by default', () => {
    const el = createElement()
    expect(el.querySelector('h3')?.textContent?.trim()).toBe('New Check')
  })

  it('renders required fields: checkNumber, date, payTo, amount', () => {
    const el = createElement()
    expect(el.querySelector('#checkNumber')).not.toBeNull()
    expect(el.querySelector('#date')).not.toBeNull()
    expect(el.querySelector('#payTo')).not.toBeNull()
    expect(el.querySelector('#amount')).not.toBeNull()
  })

  it('renders optional fields: memo, signature', () => {
    const el = createElement()
    expect(el.querySelector('#memo')).not.toBeNull()
    expect(el.querySelector('#signature')).not.toBeNull()
  })

  it('renders bank account fields inside a details section', () => {
    const el = createElement()
    expect(el.querySelector('#accountHolderName')).not.toBeNull()
    expect(el.querySelector('#bankName')).not.toBeNull()
    expect(el.querySelector('#routingNumber')).not.toBeNull()
    expect(el.querySelector('#bankAccountNumber')).not.toBeNull()
    expect(el.querySelector('#accountHolderAddress')).not.toBeNull()
    expect(el.querySelector('#accountHolderCity')).not.toBeNull()
    expect(el.querySelector('#accountHolderState')).not.toBeNull()
    expect(el.querySelector('#accountHolderZip')).not.toBeNull()
  })

  it('defaults date field to today', () => {
    const el = createElement()
    const today = new Date().toISOString().split('T')[0]
    expect(el.querySelector<HTMLInputElement>('#date')?.value).toBe(today)
  })

  it('renders submit, reset, and validate buttons in editable mode', () => {
    const el = createElement()
    expect(el.querySelector('#submitBtn')).not.toBeNull()
    expect(el.querySelector('#resetBtn')).not.toBeNull()
    expect(el.querySelector('#validateBtn')).not.toBeNull()
  })

  it('hides action buttons and disables inputs in readonly mode', () => {
    const el = document.createElement('printchecks-check-form')
    el.setAttribute('readonly', '')
    document.body.appendChild(el)

    expect(el.querySelector('#submitBtn')).toBeNull()
    expect(el.querySelector('#resetBtn')).toBeNull()
    expect(el.querySelector<HTMLInputElement>('#checkNumber')?.disabled).toBe(true)
    expect(el.querySelector<HTMLInputElement>('#payTo')?.disabled).toBe(true)
  })

  it('emits check-created event on successful form submit', async () => {
    const el = createElement()
    const events: CustomEvent[] = []
    el.addEventListener('check-created', (e) => events.push(e as CustomEvent))

    const set = (id: string, val: string) => {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)
      if (input) input.value = val
    }
    set('checkNumber', 'C-100')
    set('date', '2024-06-01')
    set('payTo', 'Vendor LLC')
    set('amount', '500')
    set('accountHolderName', 'John Doe')
    set('bankName', 'First Bank')
    set('routingNumber', '123456789')
    set('bankAccountNumber', '987654321')
    set('accountHolderAddress', '10 Main St')
    set('accountHolderCity', 'Denver')
    set('accountHolderState', 'CO')
    set('accountHolderZip', '80201')

    const form = el.querySelector<HTMLFormElement>('#checkForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockChecks.createCheck).toHaveBeenCalledOnce()
    expect(events).toHaveLength(1)
    expect(events[0].detail.check).toBeDefined()
  })

  it('shows "Edit Check" heading when a check is loaded', async () => {
    const el = createElement()
    mockChecks.getCheck.mockResolvedValue({
      id: 'c1',
      checkNumber: 'C-001',
      date: '2024-01-15',
      payTo: 'Acme',
      amount: '100',
      memo: '',
      signature: '',
      accountHolderName: 'John',
      bankName: 'Bank',
      routingNumber: '123456789',
      bankAccountNumber: '987654321',
      accountHolderAddress: '1 St',
      accountHolderCity: 'City',
      accountHolderState: 'CA',
      accountHolderZip: '90001',
    })

    el.setAttribute('check-id', 'c1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('h3')?.textContent?.trim()).toBe('Edit Check')
  })

  it('populates form fields when a check is loaded', async () => {
    const el = createElement()
    mockChecks.getCheck.mockResolvedValue({
      id: 'c1',
      checkNumber: 'C-042',
      date: '2024-05-20',
      payTo: 'Supplier Inc',
      amount: '1500',
      memo: 'Invoice #99',
      signature: 'J. Doe',
      accountHolderName: 'Jane',
      bankName: 'Metro Bank',
      routingNumber: '021000021',
      bankAccountNumber: '12345678',
      accountHolderAddress: '5 Park Rd',
      accountHolderCity: 'Boston',
      accountHolderState: 'MA',
      accountHolderZip: '02108',
    })

    el.setAttribute('check-id', 'c1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector<HTMLInputElement>('#checkNumber')?.value).toBe('C-042')
    expect(el.querySelector<HTMLInputElement>('#payTo')?.value).toBe('Supplier Inc')
    expect(el.querySelector<HTMLInputElement>('#memo')?.value).toBe('Invoice #99')
    expect(el.querySelector<HTMLInputElement>('#bankName')?.value).toBe('Metro Bank')
  })

  it('resets the form when reset button is clicked', () => {
    const el = createElement()
    const input = el.querySelector<HTMLInputElement>('#checkNumber')
    if (input) input.value = 'C-99'

    el.querySelector<HTMLButtonElement>('#resetBtn')?.click()

    expect(el.querySelector<HTMLInputElement>('#checkNumber')?.value ?? '').toBe('')
  })

  it('shows error when check load fails', async () => {
    const el = createElement()
    mockChecks.getCheck.mockRejectedValue(new Error('Not found'))

    el.setAttribute('check-id', 'bad')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('.error-message')?.textContent).toContain('Not found')
  })
})
