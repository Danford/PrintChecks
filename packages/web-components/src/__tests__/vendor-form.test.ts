/**
 * Tests for <printchecks-vendor-form>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockVendors } from './mocks/core'

beforeEach(() => {
  vi.clearAllMocks()
  mockVendors.createVendor.mockResolvedValue({ id: 'v1', name: 'Test Vendor' })
  mockVendors.updateVendor.mockResolvedValue({ id: 'v1', name: 'Updated Vendor' })
  mockVendors.getVendor.mockResolvedValue(null)
})

import '../components/vendor-form'

function createElement(): HTMLElement {
  const el = document.createElement('printchecks-vendor-form')
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('PrintChecksVendorForm', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-vendor-form')).toBeDefined()
  })

  it('renders "New Vendor" heading by default', () => {
    const el = createElement()
    expect(el.querySelector('h3')?.textContent?.trim()).toBe('New Vendor')
  })

  it('renders required name field', () => {
    const el = createElement()
    expect(el.querySelector('#name')).not.toBeNull()
  })

  it('renders optional fields: displayName, email, phone, taxId', () => {
    const el = createElement()
    expect(el.querySelector('#displayName')).not.toBeNull()
    expect(el.querySelector('#email')).not.toBeNull()
    expect(el.querySelector('#phone')).not.toBeNull()
    expect(el.querySelector('#taxId')).not.toBeNull()
  })

  it('renders address fields: address, city, state, zip', () => {
    const el = createElement()
    expect(el.querySelector('#address')).not.toBeNull()
    expect(el.querySelector('#city')).not.toBeNull()
    expect(el.querySelector('#state')).not.toBeNull()
    expect(el.querySelector('#zip')).not.toBeNull()
  })

  it('renders notes textarea', () => {
    const el = createElement()
    expect(el.querySelector('#notes')).not.toBeNull()
  })

  it('renders submit and reset buttons in editable mode', () => {
    const el = createElement()
    expect(el.querySelector('#submitBtn')).not.toBeNull()
    expect(el.querySelector('#resetBtn')).not.toBeNull()
  })

  it('hides action buttons and disables inputs in readonly mode', () => {
    const el = document.createElement('printchecks-vendor-form')
    el.setAttribute('readonly', '')
    document.body.appendChild(el)

    expect(el.querySelector('#submitBtn')).toBeNull()
    expect(el.querySelector('#resetBtn')).toBeNull()
    expect(el.querySelector<HTMLInputElement>('#name')?.disabled).toBe(true)
  })

  it('emits vendor-created on successful submit', async () => {
    const el = createElement()
    const events: CustomEvent[] = []
    el.addEventListener('vendor-created', (e) => events.push(e as CustomEvent))

    const nameInput = el.querySelector<HTMLInputElement>('#name')
    if (nameInput) nameInput.value = 'Acme Corp'

    const form = el.querySelector<HTMLFormElement>('#vendorForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockVendors.createVendor).toHaveBeenCalledOnce()
    const callArg = mockVendors.createVendor.mock.calls[0][0] as { name: string }
    expect(callArg.name).toBe('Acme Corp')
    expect(events).toHaveLength(1)
    expect(events[0].detail.vendor).toBeDefined()
  })

  it('emits vendor-updated when editing an existing vendor', async () => {
    const el = createElement()
    mockVendors.getVendor.mockResolvedValue({ id: 'v1', name: 'Old Name' })

    el.setAttribute('vendor-id', 'v1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    const events: CustomEvent[] = []
    el.addEventListener('vendor-updated', (e) => events.push(e as CustomEvent))

    const form = el.querySelector<HTMLFormElement>('#vendorForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockVendors.updateVendor).toHaveBeenCalledOnce()
    expect(events).toHaveLength(1)
  })

  it('shows "Edit Vendor" heading when a vendor is loaded', async () => {
    const el = createElement()
    mockVendors.getVendor.mockResolvedValue({ id: 'v1', name: 'Acme' })

    el.setAttribute('vendor-id', 'v1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('h3')?.textContent?.trim()).toBe('Edit Vendor')
  })

  it('populates form fields when a vendor is loaded', async () => {
    const el = createElement()
    mockVendors.getVendor.mockResolvedValue({
      id: 'v1',
      name: 'Globex Corp',
      displayName: 'Globex',
      email: 'info@globex.com',
      phone: '555-1234',
      taxId: '12-3456789',
      address: '100 Industrial Rd',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      notes: 'Long-term vendor',
    })

    el.setAttribute('vendor-id', 'v1')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector<HTMLInputElement>('#name')?.value).toBe('Globex Corp')
    expect(el.querySelector<HTMLInputElement>('#displayName')?.value).toBe('Globex')
    expect(el.querySelector<HTMLInputElement>('#email')?.value).toBe('info@globex.com')
    expect(el.querySelector<HTMLInputElement>('#phone')?.value).toBe('555-1234')
    expect(el.querySelector<HTMLInputElement>('#city')?.value).toBe('Springfield')
    expect(el.querySelector<HTMLInputElement>('#state')?.value).toBe('IL')
  })

  it('resets form when reset button is clicked', () => {
    const el = createElement()
    const nameInput = el.querySelector<HTMLInputElement>('#name')
    if (nameInput) nameInput.value = 'Some Vendor'

    el.querySelector<HTMLButtonElement>('#resetBtn')?.click()

    expect(el.querySelector<HTMLInputElement>('#name')?.value ?? '').toBe('')
  })

  it('shows error when vendor load fails', async () => {
    const el = createElement()
    mockVendors.getVendor.mockRejectedValue(new Error('Load failed'))

    el.setAttribute('vendor-id', 'bad-id')
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('.error-message')?.textContent).toContain('Load failed')
  })

  it('does not include empty optional fields in submitted data', async () => {
    const el = createElement()
    const capturedArg = { current: null as unknown }
    mockVendors.createVendor.mockImplementation((data) => {
      capturedArg.current = data
      return Promise.resolve({ id: 'v1', name: 'Minimal Vendor' })
    })

    const nameInput = el.querySelector<HTMLInputElement>('#name')
    if (nameInput) nameInput.value = 'Minimal Vendor'
    // Leave all optional fields empty

    const form = el.querySelector<HTMLFormElement>('#vendorForm')
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await new Promise((resolve) => setTimeout(resolve, 10))

    const data = capturedArg.current as Record<string, unknown>
    expect(data.name).toBe('Minimal Vendor')
    expect(data.email).toBeUndefined()
    expect(data.phone).toBeUndefined()
    expect(data.address).toBeUndefined()
  })
})
