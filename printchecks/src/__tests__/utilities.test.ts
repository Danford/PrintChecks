/**
 * Tests for src/utilities.ts — formatMoney()
 *
 * Pure function, no mocks needed.
 */
import { describe, expect, it } from 'vitest'
import { formatMoney } from '../utilities'

describe('formatMoney()', () => {
  it('formats an integer number with two decimal places', () => {
    expect(formatMoney(1000)).toBe('1,000.00')
  })

  it('formats a string number', () => {
    expect(formatMoney('500')).toBe('500.00')
  })

  it('rounds to two decimal places', () => {
    expect(formatMoney(9.999)).toBe('10.00')
    expect(formatMoney(1.005)).toBe('1.01')
  })

  it('formats large numbers with commas', () => {
    expect(formatMoney(1234567.89)).toBe('1,234,567.89')
  })

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('0.00')
  })
})
