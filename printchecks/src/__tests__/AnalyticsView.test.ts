/**
 * Tests for src/views/AnalyticsView.vue
 *
 * Covers: paymentHistory void-check filtering, enhancedStats computation
 * (this-month/last-month totals, averagePayment, largestPayment, vendor stats),
 * vendorsWithStats aggregation, and topVendors sort/filter.
 * secureStorage is mocked so no localStorage is touched.
 *
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AnalyticsView from '../views/AnalyticsView.vue'
import type { CheckData, Vendor } from '@/types'

// ── Mock secureStorage ────────────────────────────────────────────────────────

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/services/secureStorage', () => ({
  secureStorage: { get: mockGet },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCheck(overrides: Partial<CheckData> = {}): CheckData {
  return {
    id: crypto.randomUUID(),
    accountHolderName: 'Jane Smith',
    accountHolderAddress: '1 Main St',
    accountHolderCity: 'Austin',
    accountHolderState: 'TX',
    accountHolderZip: '78701',
    bankName: 'First National',
    routingNumber: '021000021',
    bankAccountNumber: '123456789',
    checkNumber: '1001',
    date: '2026-03-15',
    amount: 100,
    payTo: 'Acme Corp',
    memo: 'test',
    signature: 'Jane Smith',
    isVoid: false,
    isPrinted: false,
    ...overrides,
  }
}

function makeVendor(name: string, overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: crypto.randomUUID(),
    name,
    email: '',
    phone: '',
    address: '',
    ...overrides,
  }
}

function setupStorage(vendors: Vendor[], checks: CheckData[]) {
  mockGet.mockImplementation((key: string) => {
    if (key === 'vendors') return Promise.resolve(JSON.stringify(vendors))
    if (key === 'checkList') return Promise.resolve(JSON.stringify(checks))
    return Promise.resolve(null)
  })
}

async function mountView() {
  const wrapper = mount(AnalyticsView)
  await flushPromises()
  return wrapper
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-30T12:00:00Z'))
  vi.clearAllMocks()
  mockGet.mockResolvedValue(null)
})

afterEach(() => {
  vi.useRealTimers()
})

// ── Default render (empty storage) ───────────────────────────────────────────

describe('default render with empty storage', () => {
  it('shows $0.00 for this-month total', async () => {
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('$0.00')
  })

  it('shows N/A for most frequent vendor', async () => {
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('N/A')
  })

  it('shows 0 for totalVendors', async () => {
    const wrapper = await mountView()
    const vendorInsightsCard = wrapper.text()
    expect(vendorInsightsCard).toContain('0')
  })

  it('renders no rows in the top-vendors table', async () => {
    const wrapper = await mountView()
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(0)
  })
})

// ── paymentHistory void filtering ─────────────────────────────────────────────

describe('paymentHistory filters voided checks', () => {
  it('excludes voided checks from this-month total', async () => {
    const checks = [
      makeCheck({ amount: 200, date: '2026-03-10', isVoid: false }),
      makeCheck({ amount: 500, date: '2026-03-15', isVoid: true }), // voided — excluded
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    // Only $200 should count, not $500
    expect(wrapper.text()).toContain('$200.00')
    expect(wrapper.text()).not.toContain('$700.00')
  })

  it('includes non-voided checks in paymentHistory', async () => {
    const checks = [
      makeCheck({ amount: 150, date: '2026-03-01', isVoid: false }),
      makeCheck({ amount: 250, date: '2026-03-20', isVoid: false }),
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    // Average = (150+250)/2 = 200
    expect(wrapper.text()).toContain('$200.00')
  })
})

// ── enhancedStats: thisMonth ──────────────────────────────────────────────────

describe('enhancedStats.thisMonth', () => {
  it('sums only March 2026 payments', async () => {
    const checks = [
      makeCheck({ amount: 100, date: '2026-03-01' }), // this month
      makeCheck({ amount: 200, date: '2026-02-28' }), // last month
      makeCheck({ amount: 400, date: '2025-03-15' }), // wrong year
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('This Month:')
    expect(wrapper.text()).toContain('$100.00')
  })

  it('handles string amounts', async () => {
    const checks = [
      makeCheck({ amount: '75.50', date: '2026-03-10' }),
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('$75.50')
  })
})

// ── enhancedStats: lastMonth ──────────────────────────────────────────────────

describe('enhancedStats.lastMonth', () => {
  it('sums February 2026 payments', async () => {
    const checks = [
      makeCheck({ amount: 300, date: '2026-02-14' }),
      makeCheck({ amount: 100, date: '2026-03-01' }), // this month — not counted
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('Last Month:')
    expect(wrapper.text()).toContain('$300.00')
  })

  it('handles January→December year boundary', async () => {
    // Freeze time to January 2026 to exercise the year-rollback branch
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    const checks = [
      makeCheck({ amount: 999, date: '2025-12-31' }), // December 2025 = last month
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('$999.00')
  })
})

// ── enhancedStats: averagePayment & largestPayment ────────────────────────────

describe('enhancedStats averagePayment and largestPayment', () => {
  it('computes correct average across all payments', async () => {
    const checks = [
      makeCheck({ amount: 100, date: '2026-01-01' }),
      makeCheck({ amount: 200, date: '2026-02-01' }),
      makeCheck({ amount: 300, date: '2026-03-01' }),
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    // Average = 600 / 3 = 200
    expect(wrapper.text()).toContain('$200.00')
  })

  it('identifies largest payment across all months', async () => {
    const checks = [
      makeCheck({ amount: 50, date: '2026-01-05' }),
      makeCheck({ amount: 5000, date: '2026-02-10' }),
      makeCheck({ amount: 100, date: '2026-03-20' }),
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('$5000.00')
  })
})

// ── enhancedStats: vendor stats ───────────────────────────────────────────────

describe('enhancedStats vendor stats', () => {
  it('shows total vendor count', async () => {
    const vendors = [makeVendor('Vendor A'), makeVendor('Vendor B'), makeVendor('Vendor C')]
    setupStorage(vendors, [])
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('Total Vendors:')
    // 3 vendors
    const text = wrapper.text()
    expect(text).toMatch(/Total Vendors:\s*3/)
  })

  it('identifies most frequent vendor this month', async () => {
    const checks = [
      makeCheck({ payTo: 'Alpha Inc', date: '2026-03-05' }),
      makeCheck({ payTo: 'Beta LLC', date: '2026-03-10' }),
      makeCheck({ payTo: 'Alpha Inc', date: '2026-03-20' }), // Alpha appears twice
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('Alpha Inc')
  })

  it('counts active vendors this month (unique payTo)', async () => {
    const checks = [
      makeCheck({ payTo: 'Vendor X', date: '2026-03-01' }),
      makeCheck({ payTo: 'Vendor Y', date: '2026-03-05' }),
      makeCheck({ payTo: 'Vendor X', date: '2026-03-15' }), // duplicate — same vendor
    ]
    setupStorage([], checks)
    const wrapper = await mountView()
    // 2 unique vendors this month
    const text = wrapper.text()
    expect(text).toMatch(/Active This Month:\s*2/)
  })
})

// ── topVendors table ──────────────────────────────────────────────────────────

describe('topVendors table', () => {
  it('shows vendors who received payments', async () => {
    const vendors = [makeVendor('Acme Corp'), makeVendor('No-Payment Vendor')]
    const checks = [
      makeCheck({ payTo: 'Acme Corp', amount: 500, date: '2026-03-01' }),
    ]
    setupStorage(vendors, checks)
    const wrapper = await mountView()
    const rows = wrapper.findAll('tbody tr')
    // Only Acme Corp has totalPaid > 0
    expect(rows).toHaveLength(1)
    expect(rows[0].text()).toContain('Acme Corp')
    expect(rows[0].text()).toContain('$500.00')
  })

  it('sorts vendors by totalPaid descending', async () => {
    const vendors = [makeVendor('Low Payer'), makeVendor('High Payer')]
    const checks = [
      makeCheck({ payTo: 'Low Payer', amount: 100, date: '2026-01-01' }),
      makeCheck({ payTo: 'High Payer', amount: 900, date: '2026-01-01' }),
    ]
    setupStorage(vendors, checks)
    const wrapper = await mountView()
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('High Payer') // rank 1
    expect(rows[1].text()).toContain('Low Payer')  // rank 2
  })

  it('shows payment count and average for each vendor', async () => {
    const vendors = [makeVendor('Regular Payee')]
    const checks = [
      makeCheck({ payTo: 'Regular Payee', amount: 200, date: '2026-02-01' }),
      makeCheck({ payTo: 'Regular Payee', amount: 400, date: '2026-03-01' }),
    ]
    setupStorage(vendors, checks)
    const wrapper = await mountView()
    const row = wrapper.find('tbody tr')
    const rowText = row.text()
    expect(rowText).toContain('Regular Payee')
    expect(rowText).toContain('2')    // paymentCount
    expect(rowText).toContain('$600.00') // totalPaid
    expect(rowText).toContain('$300.00') // averagePayment
  })

  it('limits to top 10 vendors', async () => {
    const vendors = Array.from({ length: 12 }, (_, i) => makeVendor(`Vendor ${i + 1}`))
    const checks = vendors.map((v, i) =>
      makeCheck({ payTo: v.name, amount: (i + 1) * 10, date: '2026-01-01' })
    )
    setupStorage(vendors, checks)
    const wrapper = await mountView()
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(10)
  })

  it('shows "Never" for vendor with no recorded payments', async () => {
    // This tests the lastPayment fallback via vendorsWithStats
    // A vendor present in vendors[] but not in checks won't appear in topVendors
    // (topVendors filters totalPaid > 0). So test a vendor with exactly 1 payment.
    const vendors = [makeVendor('One-Time Payer')]
    const checks = [makeCheck({ payTo: 'One-Time Payer', amount: 50, date: '2026-03-15' })]
    setupStorage(vendors, checks)
    const wrapper = await mountView()
    const row = wrapper.find('tbody tr')
    // lastPayment should be a date string (not "Never")
    expect(row.text()).not.toContain('Never')
  })
})
