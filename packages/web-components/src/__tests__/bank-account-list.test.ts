/**
 * Tests for <printchecks-bank-account-list>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockBankAccounts } from './mocks/core'

beforeEach(() => {
  vi.clearAllMocks()
  mockBankAccounts.getBankAccounts.mockResolvedValue([])
})

import '../components/bank-account-list'

function createElement(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('printchecks-bank-account-list')
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

const sampleAccounts = [
  {
    id: 'ba1',
    accountHolderName: 'John Doe',
    bankName: 'First National',
    routingNumber: '021000021',
    accountNumber: '123456789',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Dallas',
    accountHolderState: 'TX',
    accountHolderZip: '75201',
    isDefault: true,
  },
  {
    id: 'ba2',
    accountHolderName: 'Jane Smith',
    bankName: 'Metro Bank',
    routingNumber: '026009593',
    accountNumber: '987654321',
    accountHolderAddress: '5 Oak Ave',
    accountHolderCity: 'Boston',
    accountHolderState: 'MA',
    accountHolderZip: '02108',
  },
]

describe('PrintChecksBankAccountList', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-bank-account-list')).toBeDefined()
  })

  it('renders a search input', () => {
    const el = createElement()
    expect(el.querySelector('#searchInput')).not.toBeNull()
  })

  it('shows loading state while accounts are being fetched', () => {
    mockBankAccounts.getBankAccounts.mockReturnValue(new Promise(() => {}))
    const el = createElement()
    expect(el.querySelector('.spinner')).not.toBeNull()
  })

  it('shows empty state when no accounts are loaded', async () => {
    mockBankAccounts.getBankAccounts.mockResolvedValue([])
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(el.querySelector('.empty-state')).not.toBeNull()
  })

  it('renders a card for each bank account', async () => {
    mockBankAccounts.getBankAccounts.mockResolvedValue(sampleAccounts)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const cards = el.querySelectorAll('.account-card')
    expect(cards.length).toBe(2)
  })

  it('displays bank name and account holder name', async () => {
    mockBankAccounts.getBankAccounts.mockResolvedValue(sampleAccounts)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const html = el.querySelector('.account-list-container')?.innerHTML ?? ''
    expect(html).toContain('First National')
    expect(html).toContain('John Doe')
  })

  it('does not show action buttons without show-actions', async () => {
    mockBankAccounts.getBankAccounts.mockResolvedValue(sampleAccounts)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelectorAll('.edit-account-btn').length).toBe(0)
  })

  it('shows edit and delete buttons with show-actions', async () => {
    mockBankAccounts.getBankAccounts.mockResolvedValue(sampleAccounts)
    const el = createElement({ 'show-actions': '' })
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelectorAll('.edit-account-btn').length).toBe(2)
    expect(el.querySelectorAll('.delete-account-btn').length).toBe(2)
  })

  it('emits account-selected when a card is clicked', async () => {
    mockBankAccounts.getBankAccounts.mockResolvedValue(sampleAccounts)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const events: CustomEvent[] = []
    el.addEventListener('account-selected', (e) => events.push(e as CustomEvent))

    const firstCard = el.querySelector<HTMLElement>('.account-card')
    firstCard?.click()

    expect(events).toHaveLength(1)
    expect(events[0].detail.account ?? events[0].detail.bankAccount).toBeDefined()
  })

  it('shows error message when accounts load fails', async () => {
    mockBankAccounts.getBankAccounts.mockRejectedValue(new Error('Connection refused'))
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('.error-message')?.textContent).toContain('Connection refused')
  })

  it('shows "Add Account" button with show-actions attribute', async () => {
    const el = createElement({ 'show-actions': '' })
    await new Promise((resolve) => setTimeout(resolve, 20))
    // Button should appear; its exact id varies by implementation
    const addBtn = el.querySelector('#addAccountBtn') ?? el.querySelector('[id*="add"]')
    expect(addBtn).not.toBeNull()
  })
})
