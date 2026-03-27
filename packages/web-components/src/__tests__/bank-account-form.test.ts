/**
 * Tests for <printchecks-bank-account-form>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockBankAccounts } from './mocks/core'

beforeEach(() => {
  vi.clearAllMocks()
  mockBankAccounts.createBankAccount.mockResolvedValue({
    id: 'ba1',
    accountHolderName: 'John Doe',
    bankName: 'First National',
    routingNumber: '021000021',
    accountNumber: '123456789',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Dallas',
    accountHolderState: 'TX',
    accountHolderZip: '75201',
  })
  mockBankAccounts.updateBankAccount.mockResolvedValue({ id: 'ba1' })
  mockBankAccounts.getBankAccount.mockResolvedValue(null)
})

import '../components/bank-account-form'

function createElement(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('printchecks-bank-account-form')
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('PrintChecksBankAccountForm', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-bank-account-form')).toBeDefined()
  })

  it('renders a form heading', () => {
    const el = createElement()
    expect(el.querySelector('h3')).not.toBeNull()
  })

  it('renders required fields: accountHolderName, bankName, routingNumber, accountNumber', () => {
    const el = createElement()
    expect(el.querySelector('#accountHolderName')).not.toBeNull()
    expect(el.querySelector('#bankName')).not.toBeNull()
    expect(el.querySelector('#routingNumber')).not.toBeNull()
    expect(el.querySelector('#accountNumber')).not.toBeNull()
  })

  it('renders address fields', () => {
    const el = createElement()
    expect(el.querySelector('#address')).not.toBeNull()
    expect(el.querySelector('#city')).not.toBeNull()
    expect(el.querySelector('#state')).not.toBeNull()
    expect(el.querySelector('#zip')).not.toBeNull()
  })

  it('renders submit and reset buttons in editable mode', () => {
    const el = createElement()
    expect(el.querySelector('#submitBtn')).not.toBeNull()
    expect(el.querySelector('#resetBtn')).not.toBeNull()
  })

  it('hides action buttons and disables inputs in readonly mode', () => {
    const el = createElement({ readonly: '' })

    expect(el.querySelector('#submitBtn')).toBeNull()
    expect(el.querySelector('#resetBtn')).toBeNull()
    const input = el.querySelector<HTMLInputElement>('#accountHolderName')
    expect(input?.disabled).toBe(true)
  })

  it('emits account-created on successful submit', async () => {
    const el = createElement()
    const events: CustomEvent[] = []
    el.addEventListener('account-created', (e) => events.push(e as CustomEvent))

    const set = (id: string, val: string) => {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)
      if (input) input.value = val
    }
    set('accountHolderName', 'Jane Smith')
    set('bankName', 'City Bank')
    set('routingNumber', '021000021')
    set('accountNumber', '987654321')
    set('address', '5 Elm St')
    set('city', 'Miami')
    set('state', 'FL')
    set('zip', '33101')

    const form = el.querySelector<HTMLFormElement>('#accountForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockBankAccounts.createBankAccount).toHaveBeenCalledOnce()
    expect(events).toHaveLength(1)
    expect(events[0].detail.account).toBeDefined()
  })

  it('shows "Edit Bank Account" heading when an account is loaded', async () => {
    const el = createElement()
    mockBankAccounts.getBankAccount.mockResolvedValue({
      id: 'ba1',
      accountHolderName: 'John',
      bankName: 'Bank',
      routingNumber: '021000021',
      accountNumber: '123',
      accountHolderAddress: '1 St',
      accountHolderCity: 'City',
      accountHolderState: 'CA',
      accountHolderZip: '90001',
    })

    el.setAttribute('account-id', 'ba1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('h3')?.textContent).toMatch(/edit/i)
  })

  it('populates fields when an account is loaded', async () => {
    const el = createElement()
    mockBankAccounts.getBankAccount.mockResolvedValue({
      id: 'ba1',
      accountHolderName: 'Alice Walker',
      bankName: 'Pacific Trust',
      routingNumber: '122105155',
      accountNumber: '55566677',
      accountHolderAddress: '20 Pine Ave',
      accountHolderCity: 'Seattle',
      accountHolderState: 'WA',
      accountHolderZip: '98101',
    })

    el.setAttribute('account-id', 'ba1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector<HTMLInputElement>('#accountHolderName')?.value).toBe('Alice Walker')
    expect(el.querySelector<HTMLInputElement>('#bankName')?.value).toBe('Pacific Trust')
    expect(el.querySelector<HTMLInputElement>('#routingNumber')?.value).toBe('122105155')
    expect(el.querySelector<HTMLInputElement>('#city')?.value).toBe('Seattle')
  })

  it('shows error when account load fails', async () => {
    const el = createElement()
    mockBankAccounts.getBankAccount.mockRejectedValue(new Error('Account not found'))

    el.setAttribute('account-id', 'bad-id')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('.error-message')?.textContent).toContain('Account not found')
  })
})
