/**
 * Tests for <printchecks-receipt-form>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockReceipts, mockVendors, mockBankAccounts, mockChecks } from './mocks/core'

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  mockReceipts.createReceipt.mockResolvedValue({
    id: 'r1',
    receiptNumber: 'R-001',
    date: '2024-01-15',
    lineItems: [],
    totals: { subtotal: 100, totalTax: 0, totalDiscount: 0, shippingAmount: 0, handlingAmount: 0, grandTotal: 100 },
    billTo: { name: 'Jane Doe', address: '1 Main St', city: 'Austin', state: 'TX', zip: '78701' },
    paymentInfo: { method: 'check', amount: 100, currency: 'USD' },
  })
  mockReceipts.getReceipt.mockResolvedValue(null)
  mockVendors.getVendors.mockResolvedValue([])
  mockChecks.getChecks.mockResolvedValue([])
  mockBankAccounts.getBankAccounts.mockResolvedValue([])
})

// Import component after mocks are set (vi.mock is hoisted, but imports after setup are fine)
import '../components/receipt-form'

function createElement(): HTMLElement {
  const el = document.createElement('printchecks-receipt-form')
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('PrintChecksReceiptForm', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-receipt-form')).toBeDefined()
  })

  it('renders "New Receipt" heading by default', () => {
    const el = createElement()
    expect(el.querySelector('h3')?.textContent?.trim()).toBe('New Receipt')
  })

  it('renders BillTo section with address fields', () => {
    const el = createElement()
    expect(el.querySelector('#billToName')).not.toBeNull()
    expect(el.querySelector('#billToAddress')).not.toBeNull()
    expect(el.querySelector('#billToCity')).not.toBeNull()
    expect(el.querySelector('#billToState')).not.toBeNull()
    expect(el.querySelector('#billToZip')).not.toBeNull()
  })

  it('renders billToEmail field', () => {
    const el = createElement()
    expect(el.querySelector('#billToEmail')).not.toBeNull()
  })

  it('renders PaymentInfo section with method select', () => {
    const el = createElement()
    const select = el.querySelector<HTMLSelectElement>('#paymentMethod')
    expect(select).not.toBeNull()
    // All payment method options are present
    const options = Array.from(select!.options).map((o) => o.value)
    expect(options).toContain('check')
    expect(options).toContain('cash')
    expect(options).toContain('credit')
    expect(options).toContain('debit')
    expect(options).toContain('transfer')
    expect(options).toContain('other')
  })

  it('renders ReceiptTotals fields: shippingAmount and handlingAmount', () => {
    const el = createElement()
    expect(el.querySelector('#shippingAmount')).not.toBeNull()
    expect(el.querySelector('#handlingAmount')).not.toBeNull()
  })

  it('renders taxRate and discount fields', () => {
    const el = createElement()
    expect(el.querySelector('#taxRate')).not.toBeNull()
    expect(el.querySelector('#discount')).not.toBeNull()
  })

  it('renders an initial line item row', () => {
    const el = createElement()
    const container = el.querySelector('#lineItemsContainer')
    expect(container).not.toBeNull()
    expect(el.querySelector('.line-item-description')).not.toBeNull()
    expect(el.querySelector('.line-item-quantity')).not.toBeNull()
    expect(el.querySelector('.line-item-price')).not.toBeNull()
  })

  it('renders receipt number and date fields', () => {
    const el = createElement()
    expect(el.querySelector('#receiptNumber')).not.toBeNull()
    expect(el.querySelector('#date')).not.toBeNull()
  })

  it('renders notes textarea', () => {
    const el = createElement()
    expect(el.querySelector('#notes')).not.toBeNull()
  })

  it('renders totals section', () => {
    const el = createElement()
    expect(el.querySelector('.totals-section')).not.toBeNull()
  })

  it('defaults date field to today', () => {
    const el = createElement()
    const today = new Date().toISOString().split('T')[0]
    const dateInput = el.querySelector<HTMLInputElement>('#date')
    expect(dateInput?.value).toBe(today)
  })

  it('renders action buttons in editable mode', () => {
    const el = createElement()
    expect(el.querySelector('#submitBtn')).not.toBeNull()
    expect(el.querySelector('#resetBtn')).not.toBeNull()
    expect(el.querySelector('#calculateBtn')).not.toBeNull()
    expect(el.querySelector('#addLineItemBtn')).not.toBeNull()
  })

  it('hides action buttons and disables inputs in readonly mode', () => {
    const el = document.createElement('printchecks-receipt-form')
    el.setAttribute('readonly', '')
    document.body.appendChild(el)

    expect(el.querySelector('#submitBtn')).toBeNull()
    expect(el.querySelector('#resetBtn')).toBeNull()
    expect(el.querySelector('#addLineItemBtn')).toBeNull()
    // Inputs are disabled
    const input = el.querySelector<HTMLInputElement>('#billToName')
    expect(input?.disabled).toBe(true)
  })

  it('adds a line item when Add Item is clicked', () => {
    const el = createElement()
    const initialCount = el.querySelectorAll('.line-item-description').length
    const addBtn = el.querySelector<HTMLButtonElement>('#addLineItemBtn')
    addBtn?.click()
    const newCount = el.querySelectorAll('.line-item-description').length
    expect(newCount).toBe(initialCount + 1)
  })

  it('removes a line item when remove button is clicked', () => {
    const el = createElement()
    // Add an item first so there are two
    el.querySelector<HTMLButtonElement>('#addLineItemBtn')?.click()
    expect(el.querySelectorAll('.line-item-description').length).toBe(2)
    // Click the first remove button
    const removeBtn = el.querySelector<HTMLButtonElement>('.remove-line-item')
    removeBtn?.click()
    expect(el.querySelectorAll('.line-item-description').length).toBe(1)
  })

  it('emits receipt-created event on successful submit', async () => {
    const el = createElement()
    const events: CustomEvent[] = []
    el.addEventListener('receipt-created', (e) => events.push(e as CustomEvent))

    // Fill required fields
    const set = (id: string, val: string) => {
      const input = el.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)
      if (input) input.value = val
    }
    set('receiptNumber', 'R-100')
    set('date', '2024-06-01')
    set('billToName', 'Acme Corp')
    set('billToAddress', '10 Commerce Blvd')
    set('billToCity', 'Dallas')
    set('billToState', 'TX')
    set('billToZip', '75201')
    set('paymentMethod', 'check')

    // Set line item values
    const descInput = el.querySelector<HTMLInputElement>('.line-item-description')
    const qtyInput = el.querySelector<HTMLInputElement>('.line-item-quantity')
    const priceInput = el.querySelector<HTMLInputElement>('.line-item-price')
    if (descInput) descInput.value = 'Service'
    if (qtyInput) qtyInput.value = '2'
    if (priceInput) priceInput.value = '50'

    // Submit the form
    const form = el.querySelector<HTMLFormElement>('#receiptForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    // Wait for async submit to resolve
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockReceipts.createReceipt).toHaveBeenCalledOnce()
    expect(events).toHaveLength(1)
    expect(events[0].detail.receipt).toBeDefined()
  })

  it('emits receipt-updated event when editing an existing receipt', async () => {
    const el = createElement()

    // Simulate a loaded receipt by calling loadReceipt indirectly via attribute
    mockReceipts.getReceipt.mockResolvedValue({
      id: 'r1',
      receiptNumber: 'R-001',
      date: '2024-01-15',
      lineItems: [{ id: 'li1', description: 'Widget', quantity: 1, unitPrice: 50, totalPrice: 50, taxable: false }],
      totals: { subtotal: 50, totalTax: 0, totalDiscount: 0, shippingAmount: 0, handlingAmount: 0, grandTotal: 50 },
      billTo: { name: 'Jane Doe', address: '1 Main St', city: 'Austin', state: 'TX', zip: '78701' },
      paymentInfo: { method: 'check', amount: 50, currency: 'USD' },
    })
    mockReceipts.updateReceipt.mockResolvedValue({
      id: 'r1',
      receiptNumber: 'R-001',
    })

    el.setAttribute('receipt-id', 'r1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    const events: CustomEvent[] = []
    el.addEventListener('receipt-updated', (e) => events.push(e as CustomEvent))

    const form = el.querySelector<HTMLFormElement>('#receiptForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockReceipts.updateReceipt).toHaveBeenCalledOnce()
    expect(events).toHaveLength(1)
  })

  it('resets the form when reset button is clicked', () => {
    const el = createElement()
    const receiptInput = el.querySelector<HTMLInputElement>('#receiptNumber')
    if (receiptInput) receiptInput.value = 'TEST-123'

    el.querySelector<HTMLButtonElement>('#resetBtn')?.click()

    const resetInput = el.querySelector<HTMLInputElement>('#receiptNumber')
    expect(resetInput?.value ?? '').toBe('')
  })

  it('shows "Edit Receipt" heading when a receipt is loaded', async () => {
    const el = createElement()
    mockReceipts.getReceipt.mockResolvedValue({
      id: 'r1',
      receiptNumber: 'R-001',
      date: '2024-01-15',
      lineItems: [],
      totals: { subtotal: 0, totalTax: 0, totalDiscount: 0, shippingAmount: 0, handlingAmount: 0, grandTotal: 0 },
      billTo: { name: 'Jane Doe', address: '1 Main', city: 'Austin', state: 'TX', zip: '78701' },
      paymentInfo: { method: 'check', amount: 0, currency: 'USD' },
    })

    el.setAttribute('receipt-id', 'r1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('h3')?.textContent?.trim()).toBe('Edit Receipt')
  })

  it('populates BillToInfo fields when loading an existing receipt', async () => {
    const el = createElement()
    mockReceipts.getReceipt.mockResolvedValue({
      id: 'r1',
      receiptNumber: 'R-042',
      date: '2024-03-10',
      lineItems: [],
      totals: { subtotal: 0, totalTax: 0, totalDiscount: 0, shippingAmount: 5, handlingAmount: 2, grandTotal: 7 },
      billTo: { name: 'Bob Smith', address: '99 Oak Ave', city: 'Portland', state: 'OR', zip: '97201', email: 'bob@example.com' },
      paymentInfo: { method: 'transfer', amount: 7, currency: 'USD' },
    })

    el.setAttribute('receipt-id', 'r1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector<HTMLInputElement>('#billToName')?.value).toBe('Bob Smith')
    expect(el.querySelector<HTMLInputElement>('#billToAddress')?.value).toBe('99 Oak Ave')
    expect(el.querySelector<HTMLInputElement>('#billToCity')?.value).toBe('Portland')
    expect(el.querySelector<HTMLInputElement>('#billToState')?.value).toBe('OR')
    expect(el.querySelector<HTMLInputElement>('#billToZip')?.value).toBe('97201')
    expect(el.querySelector<HTMLInputElement>('#billToEmail')?.value).toBe('bob@example.com')
  })

  it('populates PaymentInfo method when loading an existing receipt', async () => {
    const el = createElement()
    mockReceipts.getReceipt.mockResolvedValue({
      id: 'r1',
      receiptNumber: 'R-042',
      date: '2024-03-10',
      lineItems: [],
      totals: { subtotal: 0, totalTax: 0, totalDiscount: 0, shippingAmount: 0, handlingAmount: 0, grandTotal: 0 },
      billTo: { name: 'Alice', address: '1 St', city: 'Seattle', state: 'WA', zip: '98101' },
      paymentInfo: { method: 'credit', amount: 0, currency: 'USD' },
    })

    el.setAttribute('receipt-id', 'r1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector<HTMLSelectElement>('#paymentMethod')?.value).toBe('credit')
  })

  it('populates shippingAmount and handlingAmount when loading a receipt', async () => {
    const el = createElement()
    mockReceipts.getReceipt.mockResolvedValue({
      id: 'r1',
      receiptNumber: 'R-099',
      date: '2024-04-01',
      lineItems: [],
      totals: { subtotal: 200, totalTax: 0, totalDiscount: 10, shippingAmount: 15, handlingAmount: 5, grandTotal: 210 },
      billTo: { name: 'Alice', address: '1 St', city: 'Seattle', state: 'WA', zip: '98101' },
      paymentInfo: { method: 'check', amount: 210, currency: 'USD' },
    })

    el.setAttribute('receipt-id', 'r1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector<HTMLInputElement>('#shippingAmount')?.value).toBe('15')
    expect(el.querySelector<HTMLInputElement>('#handlingAmount')?.value).toBe('5')
  })

  it('shows error message when receipt load fails', async () => {
    const el = createElement()
    mockReceipts.getReceipt.mockRejectedValue(new Error('Network error'))

    el.setAttribute('receipt-id', 'bad-id')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('.error-message')?.textContent).toContain('Network error')
  })

  it('getFormData builds correct paymentInfo from form fields', async () => {
    const el = createElement()
    const capturedArg = { current: null as unknown }
    mockReceipts.createReceipt.mockImplementation((data) => {
      capturedArg.current = data
      return Promise.resolve({ id: 'r1' })
    })

    const set = (id: string, val: string) => {
      const input = el.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)
      if (input) input.value = val
    }
    set('receiptNumber', 'R-200')
    set('date', '2024-07-04')
    set('billToName', 'Corp')
    set('billToAddress', '1 Ave')
    set('billToCity', 'Chicago')
    set('billToState', 'IL')
    set('billToZip', '60601')
    set('paymentMethod', 'cash')
    set('shippingAmount', '10')
    set('handlingAmount', '3')

    const form = el.querySelector<HTMLFormElement>('#receiptForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))

    const data = capturedArg.current as Record<string, unknown>
    const paymentInfo = data.paymentInfo as { method: string; amount: number }
    expect(paymentInfo.method).toBe('cash')
    const totals = data.totals as { shippingAmount: number; handlingAmount: number }
    expect(totals.shippingAmount).toBe(10)
    expect(totals.handlingAmount).toBe(3)
  })
})
