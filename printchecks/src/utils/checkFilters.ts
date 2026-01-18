/**
 * Utility functions for filtering checks and payment data
 * Used across Analytics, CheckPrinter, and Vendors views to ensure consistent filtering
 */

import type { CheckData, PaymentRecord } from '@/types'

/**
 * Filters out voided checks from a check array
 * @param checks - Array of check data
 * @returns Array of active (non-voided) checks
 */
export function filterActiveChecks(checks: CheckData[]): CheckData[] {
  return checks.filter(check => !check.isVoid)
}

/**
 * Filters payment records - currently a pass-through but structured for future enhancement
 * @param payments - Array of payment records
 * @returns Array of active payment records
 */
export function filterActivePayments(payments: PaymentRecord[]): PaymentRecord[] {
  // Payment records don't have void status yet, but this provides consistency
  // and allows for future enhancement if needed
  return payments
}

/**
 * Combined filter for mixed payment data (checks + payment records)
 * @param checks - Array of check data
 * @param payments - Array of payment records
 * @returns Object with filtered checks and payments
 */
export function filterActivePaymentData(checks: CheckData[], payments: PaymentRecord[]) {
  return {
    checks: filterActiveChecks(checks),
    payments: filterActivePayments(payments)
  }
}

