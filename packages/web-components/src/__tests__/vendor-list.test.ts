/**
 * Tests for <printchecks-vendor-list>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockVendors } from './mocks/core'

beforeEach(() => {
  vi.clearAllMocks()
  mockVendors.getVendors.mockResolvedValue([])
})

import '../components/vendor-list'

function createElement(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('printchecks-vendor-list')
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

const sampleVendors = [
  { id: 'v1', name: 'Acme Corp', email: 'acme@example.com', phone: '555-1111' },
  { id: 'v2', name: 'Globex Inc', displayName: 'Globex', email: 'hi@globex.com' },
  { id: 'v3', name: 'Initech', address: '1 Office Rd', city: 'Austin', state: 'TX', zip: '78701' },
]

describe('PrintChecksVendorList', () => {
  it('is registered as a custom element', () => {
    expect(customElements.get('printchecks-vendor-list')).toBeDefined()
  })

  it('renders a search input', () => {
    const el = createElement()
    expect(el.querySelector('#searchInput')).not.toBeNull()
  })

  it('does not show "Add Vendor" button without show-actions', () => {
    const el = createElement()
    expect(el.querySelector('#addVendorBtn')).toBeNull()
  })

  it('shows "Add Vendor" button with show-actions attribute', () => {
    const el = createElement({ 'show-actions': '' })
    expect(el.querySelector('#addVendorBtn')).not.toBeNull()
  })

  it('shows loading state while vendors are being fetched', () => {
    // Return a promise that never resolves so loading stays visible
    mockVendors.getVendors.mockReturnValue(new Promise(() => {}))
    const el = createElement()
    expect(el.querySelector('.spinner')).not.toBeNull()
  })

  it('shows empty state when no vendors are loaded', async () => {
    mockVendors.getVendors.mockResolvedValue([])
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(el.querySelector('.empty-state')).not.toBeNull()
  })

  it('renders a card for each vendor', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const cards = el.querySelectorAll('.vendor-card')
    expect(cards.length).toBe(3)
  })

  it('displays vendor name in each card', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const names = Array.from(el.querySelectorAll('.vendor-name')).map((n) => n.textContent?.trim())
    expect(names).toContain('Acme Corp')
    expect(names).toContain('Globex Inc')
    expect(names).toContain('Initech')
  })

  it('shows edit and delete buttons when show-actions is set', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement({ 'show-actions': '' })
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelectorAll('.edit-vendor-btn').length).toBe(3)
    expect(el.querySelectorAll('.delete-vendor-btn').length).toBe(3)
  })

  it('does not show edit/delete buttons without show-actions', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelectorAll('.edit-vendor-btn').length).toBe(0)
  })

  it('emits vendor-selected when a vendor card is clicked', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const events: CustomEvent[] = []
    el.addEventListener('vendor-selected', (e) => events.push(e as CustomEvent))

    const firstCard = el.querySelector<HTMLElement>('.vendor-card')
    firstCard?.click()

    expect(events).toHaveLength(1)
    expect(events[0].detail.vendor).toBeDefined()
    expect(events[0].detail.vendor.name).toBe('Acme Corp')
  })

  it('emits add-vendor-clicked when Add Vendor button is clicked', async () => {
    const el = createElement({ 'show-actions': '' })
    await new Promise((resolve) => setTimeout(resolve, 20))

    const events: CustomEvent[] = []
    el.addEventListener('add-vendor-clicked', (e) => events.push(e as CustomEvent))

    el.querySelector<HTMLButtonElement>('#addVendorBtn')?.click()
    expect(events).toHaveLength(1)
  })

  it('emits edit-vendor when edit button is clicked', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement({ 'show-actions': '' })
    await new Promise((resolve) => setTimeout(resolve, 20))

    const events: CustomEvent[] = []
    el.addEventListener('edit-vendor', (e) => events.push(e as CustomEvent))

    const editBtn = el.querySelector<HTMLButtonElement>('.edit-vendor-btn')
    editBtn?.click()

    expect(events).toHaveLength(1)
    expect(events[0].detail.vendor).toBeDefined()
  })

  it('filters vendors when search term is entered', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const searchInput = el.querySelector<HTMLInputElement>('#searchInput')
    if (searchInput) {
      searchInput.value = 'acme'
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    await new Promise((resolve) => setTimeout(resolve, 10))
    const cards = el.querySelectorAll('.vendor-card')
    expect(cards.length).toBe(1)
    expect(el.querySelector('.vendor-name')?.textContent?.trim()).toBe('Acme Corp')
  })

  it('shows "no vendors found" empty state when search has no matches', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const searchInput = el.querySelector<HTMLInputElement>('#searchInput')
    if (searchInput) {
      searchInput.value = 'zzznomatch'
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(el.querySelector('.empty-state')?.textContent).toContain('zzznomatch')
  })

  it('marks selected vendor card with active class', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const firstCard = el.querySelector<HTMLElement>('.vendor-card')
    firstCard?.click()

    expect(firstCard?.classList.contains('active')).toBe(true)
  })

  it('shows error message when vendor load fails', async () => {
    mockVendors.getVendors.mockRejectedValue(new Error('Failed to fetch'))
    const el = createElement()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(el.querySelector('.error-message')?.textContent).toContain('Failed to fetch')
  })

  it('public search() method filters the list', async () => {
    mockVendors.getVendors.mockResolvedValue(sampleVendors)
    const el = createElement() as HTMLElement & { search: (term: string) => void }
    await new Promise((resolve) => setTimeout(resolve, 20))

    el.search('globex')
    await new Promise((resolve) => setTimeout(resolve, 10))

    const cards = el.querySelectorAll('.vendor-card')
    expect(cards.length).toBe(1)
    expect(el.querySelector('.vendor-name')?.textContent?.trim()).toBe('Globex Inc')
  })
})
